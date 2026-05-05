/**
 * GET /api/history — paginated diagnosis history from MongoDB
 */
import { Router } from 'express';
import Diagnosis from '../models/Diagnosis.js';

const router = Router();

// GET /api/history?page=1&limit=20&diagnosis=diseased
router.get('/', async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(100, parseInt(req.query.limit) || 20);
    const skip     = (page - 1) * limit;

    // Optional filter by diagnosis type
  const ALLOWED_DIAGNOSES = ['healthy', 'diseased', 'mixed', 'rotten'];

const filter = {};
if (req.query.diagnosis) {
  const diagnosis = String(req.query.diagnosis);
  if (!ALLOWED_DIAGNOSES.includes(diagnosis)) {
    return res.status(400).json({
      status: 'error',
      error: { code: 'INVALID_PARAM', message: 'Invalid diagnosis filter value' },
    });
  }
  filter.overall_diagnosis = diagnosis;
}

    const [data, total] = await Promise.all([
      Diagnosis.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v'),
      Diagnosis.countDocuments(filter),
    ]);

    res.json({
      status: 'success',
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/history/:requestId — single diagnosis
router.get('/:requestId', async (req, res, next) => {
  try {
    const doc = await Diagnosis.findOne({ request_id: req.params.requestId }).select('-__v');
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Diagnosis not found' },
      });
    }
    res.json({ status: 'success', data: doc });
  } catch (err) {
    next(err);
  }
});

export default router;
