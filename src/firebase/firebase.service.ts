import { Bucket } from '@google-cloud/storage';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { app } from 'firebase-admin';
@Injectable()
export class FirebaseRepository {
  bucket: Bucket;
  db: FirebaseFirestore.Firestore;
  logger = new Logger(FirebaseRepository.name);

  constructor(
    @Inject('FIREBASE_APP') private firebaseApp: app.App,
    private readonly configService: ConfigService,
  ) {
    const bucketURL = this.configService.get('BUCKET_URL');
    this.bucket = firebaseApp.storage().bucket(bucketURL);
    this.db = firebaseApp.firestore();
  }

  async uploadFile(file: Express.Multer.File, filePath: string) {
    this.logger.log(`Uploading file with path: ${filePath}`);
    await this.bucket
      .file(filePath)
      .save(file.buffer, { contentType: file.mimetype });
  }

  // TODO: test what will happen if not exist
  async getFileUrl(filePath: string) {
    const file = this.bucket.file(filePath);
    const url = (
      await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      })
    ).toString();
    return url;
  }

  async safeRemoveFile(filePath: string) {
    const isExist = await this.bucket.file(filePath).exists();
    if (isExist[0] === true) {
      this.logger.log(`Deleting file with filePath: ${filePath}`);
      await this.bucket.file(filePath).delete();
    }
  }
}
