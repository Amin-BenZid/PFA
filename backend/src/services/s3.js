/**
 * S3 service — handles image uploads to AWS S3.
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Create client lazily so dotenv is loaded first
let _s3 = null;
function getS3Client() {
  if (!_s3) {
    const config = { region: process.env.AWS_REGION || 'eu-north-1' };
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }
    _s3 = new S3Client(config);
  }
  return _s3;
}

const BUCKET = () => process.env.S3_BUCKET || 'apple-disease-uploads';

/**
 * Upload an image buffer to S3.
 * @returns {Promise<string>} S3 URL: s3://bucket/uploads/<key>
 */
export async function uploadImageToS3(buffer, mimetype, requestId = uuidv4()) {
  const ext = mimetype.split('/')[1] || 'jpg';
  const key = `uploads/${requestId}.${ext}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket:      BUCKET(),
      Key:         key,
      Body:        buffer,
      ContentType: mimetype,
    })
  );

  return `s3://${BUCKET()}/${key}`;
}
