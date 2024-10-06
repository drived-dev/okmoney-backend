import { Bucket } from '@google-cloud/storage';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { app } from 'firebase-admin';
@Injectable()
export class FirebaseRepository {
  bucket: Bucket;
  db: FirebaseFirestore.Firestore;

  constructor(
    @Inject('FIREBASE_APP') private firebaseApp: app.App,
    private readonly configService: ConfigService,
  ) {
    const bucketURL = this.configService.get('BUCKET_URL');
    this.bucket = firebaseApp.storage().bucket(bucketURL);
    this.db = firebaseApp.firestore();
  }
}
