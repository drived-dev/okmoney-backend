import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as qs from 'qs';
import { AxiosError } from 'axios';

@Injectable()
export class NotificationService {
  private apiUrl = 'https://api-v2.thaibulksms.com/sms';
  private apiKey = process.env.THAI_SMS_API;
  private apiSecret = process.env.THAI_SMS_SECRET;

  getHello(): string {
    return 'Hello World!';
  }

  constructor(private readonly httpService: HttpService) {}

  async sendSms(to: string, message: string) {
    const data = {
      msisdn: to, // Recipient phone number in international format
      message: message, // Your message text
      sender: 'Demo', // Custom sender name (depends on your ThaiBulkSMS account)
      force: 'standard', // Could be "standard" or "premium"
    };

    console.log('notification.service: mock function call ThaiSMS Api');
    console.log(data);
    // const headers = {
    //   Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
    //   'Content-Type': 'application/x-www-form-urlencoded',
    // };

    // try {
    //   const encodedData = qs.stringify(data);
    //   const response = await lastValueFrom(
    //     this.httpService.post(this.apiUrl, encodedData, { headers }),
    //   );
    //   return response.data; // ThaiBulkSMS API response
    // } catch (error: unknown) {
    //   // Type guard to check if 'error' is an instance of 'Error'
    //   if (error instanceof AxiosError) {
    //     // Safely access Axios-specific properties
    //     console.log('Error Response:', error.response?.data);
    //     console.log('Error Status:', error.response?.status);
    //     console.log('Error Headers:', error.response?.headers);
    //   } else if (error instanceof Error) {
    //     // Handle generic errors
    //     console.log(`Error: ${error.message}`);
    //   } else {
    //     console.log('An unknown error occurred');
    //   }
    // }
    return data;
  }
}
