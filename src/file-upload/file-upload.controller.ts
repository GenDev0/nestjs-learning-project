import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { File } from './entities/file.entity';
// import { OwnershipGuard } from 'src/common/guards/ownership.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CheckOwnership } from 'src/common/decorators/check-ownership.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: User,
  ): Promise<File> {
    if (!file) {
      throw new BadRequestException('No file provided!');
    }
    return this.fileUploadService.uploadFile(
      file,
      uploadFileDto.description,
      user,
    );
  }

  @Get()
  // @CheckOwnership('file')
  async getAllFiles(): Promise<File[]> {
    return this.fileUploadService.getAllFiles();
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(RolesGuard)
  @CheckOwnership('file')
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.fileUploadService.deleteFile(id);
    return { message: `File with ID ${id} has been deleted.` };
  }
}
