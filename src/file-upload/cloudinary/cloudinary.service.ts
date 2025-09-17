import { Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CLOUDINARY, CloudinaryType } from './cloudinary.constants';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: CloudinaryType,
  ) {}

  private async uploadBuffer(
    buffer: Buffer,
    options: Record<string, unknown> = {},
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          ...options,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Upload failed with no result'));
          resolve(result);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async uploadImageFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return this.uploadBuffer(file.buffer, {
      folder: 'nestjs-learning-project-cloudinary',
    });
  }

  /**
   * Upload from local path
   */
  async uploadFromPath(
    path: string,
    folder = 'nestjs-learning-project-cloudinary',
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      void this.cloudinary.uploader.upload(
        path,
        { folder, resource_type: 'auto' },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Upload failed with no result'));
          resolve(result);
        },
      );
    });
  }

  async uploadImagePath(path: string): Promise<UploadApiResponse> {
    return this.uploadFromPath(path, 'nestjs-learning-project-cloudinary');
  }

  async deleteImage(publicId: string): Promise<any> {
    await this.cloudinary.uploader.destroy(publicId);
  }
}
