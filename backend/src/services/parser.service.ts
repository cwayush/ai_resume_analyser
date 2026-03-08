const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

export class ParserService {
  async parseFile(
    buffer: Buffer,
    mimetype: string,
    originalName: string,
  ): Promise<string> {
    const lowerName = originalName.toLowerCase();

    if (mimetype === "application/pdf" || lowerName.endsWith(".pdf")) {
      return this.parsePDF(buffer);
    }

    if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword" ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".doc")
    ) {
      return this.parseDOCX(buffer);
    }

    return buffer.toString("utf-8");
  }

  private async parsePDF(buffer: Buffer): Promise<string> {

    const data = await pdfParse(buffer);
    const text = data.text?.trim();

    if (!text) {
      throw new Error(
        "Could not extract text from PDF. Try a text-based PDF (not scanned).",
      );
    }

    return text;
  }

  private async parseDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();

    if (!text) {
      throw new Error("Could not extract text from DOCX file.");
    }

    return text;
  }
}

export const parserService = new ParserService();
