import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadsDir = path.join(__dirname, '../../../uploads');
  private readonly resumesDir = path.join(this.uploadsDir, 'resumes');

  constructor() {
    // Ensure upload directories exist
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.resumesDir)) {
      fs.mkdirSync(this.resumesDir, { recursive: true });
    }
  }

  getResumeUploadConfig() {
    return {
      storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: Function) => {
          cb(null, this.resumesDir);
        },
        filename: (req: Request, file: Express.Multer.File, cb: Function) => {
          const user = req.user as any;
          const timestamp = Date.now();
          const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
          const filename = `${timestamp}-${user.id}-${sanitizedOriginalName}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

  validateFileUpload(file: Express.Multer.File): void {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Only PDF, DOC, and DOCX files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size cannot exceed 5MB');
    }
  }

  getResumeFilePath(filename: string): string {
    return path.join(this.resumesDir, filename);
  }

  fileExists(filename: string): boolean {
    const filePath = this.getResumeFilePath(filename);
    return fs.existsSync(filePath);
  }
} 