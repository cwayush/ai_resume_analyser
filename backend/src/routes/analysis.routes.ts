import { Router } from 'express';
import { analysisController } from '../controllers/analysis.controller';

const router = Router();

// POST /api/analyze — Upload resume + JD → full deterministic pipeline
router.post('/analyze', ...analysisController.analyze);

// GET /api/analyses — List all analyses (summary view)
router.get('/analyses', analysisController.listAll);

// GET /api/analyses/:id — Get full analysis result
router.get('/analyses/:id', analysisController.getById);

// GET /api/results/:id — Alias for frontend compatibility
router.get('/results/:id', analysisController.getById);

// DELETE /api/analyses/:id
router.delete('/analyses/:id', analysisController.deleteById);

export default router;
