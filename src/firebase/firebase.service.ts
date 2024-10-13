import { Bucket } from '@google-cloud/storage';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { app } from 'firebase-admin';
@Injectable()
export class FirebaseRepository {
  bucket: Bucket;
  db: FirebaseFirestore.Firestore;
  logger = new Logger('FirebaseRepository');

  constructor(
    @Inject('FIREBASE_APP') private firebaseApp: app.App,
    private readonly configService: ConfigService,
  ) {
    const bucketURL = this.configService.get('BUCKET_URL');
    this.bucket = firebaseApp.storage().bucket(bucketURL);
    this.db = firebaseApp.firestore();
  }

  async uploadFile(file: Express.Multer.File, filePath: string) {
    Logger.log(`Uploading file with path: ${filePath}`);
    await this.bucket
      .file(filePath)
      .save(file.buffer, { contentType: file.mimetype });
  }
}
