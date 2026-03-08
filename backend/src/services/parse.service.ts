import { sha256, buildResumeParseKey } from '../utils/hash';
import { cacheGet, cacheSet } from '../lib/redis';
import { CACHE_TTL } from '../config';
import { logger } from '../utils/logger';

// Dynamic require to handle pdf-parse ESM issues
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export interface ParsedResume {
  text: string;
  hash: string;
  fromCache: boolean;
}

export class ParseService {
  async parseFile(
    buffer: Buffer,
    mimetype: string,
    originalName: string,
  ): Promise<ParsedResume> {
    const lowerName = originalName.toLowerCase();

    // Parse raw text
    let text: string;
    if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
      text = await this.parsePDF(buffer);
    } else if (
      mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword' ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc')
    ) {
      text = await this.parseDOCX(buffer);
    } else {
      text = buffer.toString('utf-8');
    }

    const normalized = this.normalizeText(text);
    const hash = sha256(normalized);

    // Check Redis cache
    const cacheKey = buildResumeParseKey(hash);
    const cached = await cacheGet(cacheKey);

    if (cached) {
      logger.debug('Resume parse cache hit', { hash });
      return { text: cached, hash, fromCache: true };
    }

    // Cache the normalized text
    await cacheSet(cacheKey, normalized, CACHE_TTL.parsedResume);
    logger.debug('Resume parsed & cached', { hash, chars: normalized.length });

    return { text: normalized, hash, fromCache: false };
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  private async parsePDF(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    const text = data.text?.trim();
    if (!text) {
      throw new Error(
        'Could not extract text from PDF. Use a text-based PDF (not scanned).',
      );
    }
    return text;
  }

  private async parseDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    if (!text) {
      throw new Error('Could not extract text from DOCX file.');
    }
    return text;
  }
}

export const parseService = new ParseService();
