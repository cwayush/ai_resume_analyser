import { Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.middleware';
import { parseService } from '../services/parse.service';
import { analysisService } from '../services/analysis.service';
import { analysisRepository } from '../repositories/analysis.repository';
import { logger } from '../utils/logger';

export const analysisController = {
  /**
   * POST /api/analyze
   * Upload resume + JD → run deterministic scoring pipeline
   */
  analyze: [
    upload.single('resume'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.file) {
          res.status(400).json({ error: 'Resume file is required' });
          return;
        }

        const { jobDescription } = req.body;
        if (!jobDescription || String(jobDescription).trim().length < 50) {
          res
            .status(400)
            .json({ error: 'Job description must be at least 50 characters' });
          return;
        }

        const jd = String(jobDescription).trim();

        // Step 1: Parse resume
        const parsed = await parseService.parseFile(
          req.file.buffer,
          req.file.mimetype,
          req.file.originalname,
        );

        logger.info('Resume parsed', {
          fileName: req.file.originalname,
          hash: parsed.hash,
          fromCache: parsed.fromCache,
        });

        // Step 2: Run analysis pipeline
        const result = await analysisService.analyze({
          resumeText: parsed.text,
          resumeHash: parsed.hash,
          jobDescription: jd,
          fileName: req.file.originalname,
          enableAIExplanation: true,
        });

        res.status(201).json({
          success: true,
          data: result,
        });
      } catch (err) {
        next(err);
      }
    },
  ],

  /**
   * GET /api/analyses
   */
  listAll: async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const results = await analysisRepository.findAll(50);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/analyses/:id
   */
  getById: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await analysisRepository.findById(req.params.id as string);
      if (!result) {
        res.status(404).json({ error: 'Analysis not found' });
        return;
      }
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/analyses/:id
   */
  deleteById: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const deleted = await analysisRepository.deleteById(
        req.params.id as string,
      );
      if (!deleted) {
        res.status(404).json({ error: 'Analysis not found' });
        return;
      }
      res.json({ success: true, message: 'Analysis deleted' });
    } catch (err) {
      next(err);
    }
  },
};
