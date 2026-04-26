/**
 * Diagnosis model — stores every prediction result from the AI service.
 * Schema mirrors the API contract response (docs/api-contract.md).
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const BBoxSchema = new Schema(
  {
    x:      { type: Number, required: true },
    y:      { type: Number, required: true },
    width:  { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

const DetectionSchema = new Schema(
  {
    class:      { type: String, required: true },
    class_fr:   { type: String },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    bbox:       { type: BBoxSchema },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const DiagnosisSchema = new Schema(
  {
    // Tracing
    request_id:   { type: String, required: true, unique: true, index: true },
    model_version: { type: String, default: 'unknown' },

    // Image info
    image_url:    { type: String },           // S3 URL
    image_dimensions: {
      width:  { type: Number },
      height: { type: Number },
    },

    // AI results
    detections:          { type: [DetectionSchema], default: [] },
    overall_diagnosis:   {
      type: String,
      enum: ['healthy', 'diseased', 'rotten', 'mixed'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
      required: true,
    },
    recommended_treatment_id: { type: String, default: null },

    // Performance
    inference_time_ms: { type: Number },

    // Optional: who submitted (for future auth)
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt automatically
    collection: 'diagnoses',
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
DiagnosisSchema.index({ overall_diagnosis: 1 });
DiagnosisSchema.index({ createdAt: -1 });

export default mongoose.model('Diagnosis', DiagnosisSchema);
