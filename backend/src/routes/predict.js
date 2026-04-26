/**
 * /api/predict — proxies image to AI service per docs/api-contract.md
 */
import { Router } from 'express';
import multer from 'multer';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const USE_MOCK = process.env.USE_MOCK_AI === 'true';

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'MISSING_IMAGE', message: 'No image uploaded' },
      });
    }

    const requestId = uuidv4();

    // TODO: upload req.file.buffer to S3, get presigned URL → pass as image_url
    // For now we forward base64 to keep parallel work unblocked
    const payload = {
      image_base64: req.file.buffer.toString('base64'),
      request_id: requestId,
      options: { include_bboxes: true, min_confidence: 0.5 },
    };

    const url = `${AI_SERVICE_URL}/predict${USE_MOCK ? '?mock=true' : ''}`;
    const { data } = await axios.post(url, payload, { timeout: 30000 });

    // TODO: persist diagnosis history in MongoDB

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
