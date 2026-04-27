/**
 * POST /api/predict
 * Full flow: image upload → S3 → AI service → MongoDB → response
 * API contract: docs/api-contract.md
 */
import { Router } from 'express';
import multer from 'multer';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import Diagnosis from '../models/Diagnosis.js';
import { uploadImageToS3 } from '../services/s3.js';

const router = Router();

// Store file in memory (we stream it to S3, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },  // 10 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('Only image files are allowed'), { status: 400, code: 'INVALID_IMAGE' }));
    }
    cb(null, true);
  },
});

// Evaluated lazily at request time (after dotenv has loaded)
const AI_URL   = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';
const USE_MOCK = () => process.env.USE_MOCK_AI !== 'false';
const USE_S3   = () => !!(process.env.S3_BUCKET);

// ── Internal mock — returns a fake diagnosis without calling the AI service ──
function buildInternalMock(requestId, startTime) {
  return {
    status:           'success',
    request_id:       requestId,
    model_version:    'internal-mock-v0',
    inference_time_ms: Date.now() - startTime,
    image_dimensions: { width: 1920, height: 1080 },
    detections: [
      {
        class:       'apple_scab',
        class_fr:    'Tavelure du pommier',
        confidence:  0.92,
        bbox:        { x: 120, y: 80, width: 200, height: 180 },
      },
    ],
    overall_diagnosis:        'diseased',
    severity:                 'moderate',
    recommended_treatment_id: 'TRT_APPLE_SCAB_001',
  };
}

// ── POST /api/predict ─────────────────────────────────────────────────────────
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    // 1. Validate input
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'MISSING_IMAGE', message: 'No image file uploaded. Use form-data key "image".' },
      });
    }

    const requestId = uuidv4();
    const start     = Date.now();

    // 2. Upload to S3 (skip if AWS not configured yet)
    let imageUrl = null;
    if (USE_S3()) {
      try {
        imageUrl = await uploadImageToS3(req.file.buffer, req.file.mimetype, requestId);
      } catch (s3Err) {
        console.warn('⚠️  S3 upload failed:', s3Err.message);
      }
    }

    // 3. Call AI service (or use internal mock if AI not ready)
    let ai;

    if (USE_MOCK()) {
      // Internal mock — no AI service needed, works while Yacine is training
      ai = buildInternalMock(requestId, start);
    } else {
      const payload = {
        request_id: requestId,
        options: { include_bboxes: true, min_confidence: 0.5 },
        ...(imageUrl
          ? { image_url: imageUrl,   image_base64: null }
          : { image_url: null,       image_base64: req.file.buffer.toString('base64') }),
      };
      const aiUrl = `${AI_URL()}/predict`;
      const { data } = await axios.post(aiUrl, payload, { timeout: 30_000 });
      ai = data;
    }

    // 4. Save to MongoDB
    try {
      await Diagnosis.create({
        request_id:              requestId,
        model_version:           ai.model_version,
        image_url:               imageUrl,
        image_dimensions:        ai.image_dimensions,
        detections:              ai.detections,
        overall_diagnosis:       ai.overall_diagnosis,
        severity:                ai.severity,
        recommended_treatment_id: ai.recommended_treatment_id,
        inference_time_ms:       ai.inference_time_ms ?? Date.now() - start,
      });
    } catch (dbErr) {
      // Don't fail the request if DB is down — log and continue
      console.warn('⚠️  Could not save diagnosis to DB:', dbErr.message);
    }

    // 5. Return AI response directly to client
    res.json({
      ...ai,
      request_id: requestId,
    });

  } catch (err) {
    // Handle AI service being down
    if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
      return res.status(503).json({
        status: 'error',
        error: {
          code:    'AI_SERVICE_UNAVAILABLE',
          message: 'AI service is not running. Start it with: uvicorn src.server:app --port 8000',
        },
      });
    }
    next(err);
  }
});

// ── GET /api/predict/recent — last 10 diagnoses ───────────────────────────────
router.get('/recent', async (req, res, next) => {
  try {
    const recent = await Diagnosis.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-__v');
    res.json({ status: 'success', count: recent.length, data: recent });
  } catch (err) {
    next(err);
  }
});

export default router;
