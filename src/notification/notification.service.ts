import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as qs from 'qs';
import { AxiosError } from 'axios';

@Injectable()
export class NotificationService {
  private apiUrl = 'https://thsms.com/api/send-sms';
  private apiKey = process.env.TH_SMS_API;
  private useSms = process.env.USE_SMS == 'YES';

  getHello(): string {
    return 'Hello World!';
  }

  constructor(private readonly httpService: HttpService) {}

  async sendSms(to: string, message: string) {
    const data = {
      msisdn: [to], // Recipient phone number in international format
      message: message, // Your message text
      sender: 'Direct SMS',
    };

    if (this.useSms) {
      const headers = {
        Authorization: `Basic ${Buffer.from(`${this.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      };

      try {
        const encodedData = qs.stringify(data);
        const response = await lastValueFrom(
          this.httpService.post(this.apiUrl, encodedData, { headers }),
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.log('Error Response:', error.response?.data);
          console.log('Error Status:', error.response?.status);
          console.log('Error Headers:', error.response?.headers);
        } else if (error instanceof Error) {
          console.log(`Error: ${error.message}`);
        } else {
          console.log('An unknown error occurred');
        }
      }
    } else {
      console.log('notification.service: mock function call ThSMS Api');
      console.log(data);
    }
    return data;
  }
}
