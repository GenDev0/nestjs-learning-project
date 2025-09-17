import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    description: string | undefined,
    user: User,
  ): Promise<File> {
    const uploadResult = await this.cloudinaryService.uploadImageFile(file);

    const newFile = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: uploadResult?.secure_url,
      publicId: uploadResult?.public_id,
      description,
      uploader: user,
    });

    return this.fileRepository.save(newFile);
  }

  async getFileById(id: string): Promise<File> {
    const image = await this.fileRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`File with ID ${id} not found!`);
    }
    return image;
  }

  async getAllFiles(): Promise<File[]> {
    return await this.fileRepository.find({
      relations: ['uploader'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.getFileById(id);
    if (file) {
      // First, delete from Cloudinary
      await this.cloudinaryService.deleteImage(file.publicId);
      // Then, delete from database
      await this.fileRepository.remove(file);
    }
  }
}
