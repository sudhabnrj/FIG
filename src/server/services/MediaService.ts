import { mediaRepository } from '../repositories/MediaRepository';
import { IMedia } from '../models/Media';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { User } from '../models/User';
import fs from 'fs';
import path from 'path';

export class MediaService {
  async registerUpload(filename: string, filepath: string, mimeType: string, size: number, uploadedBy: string): Promise<IMedia> {
    return mediaRepository.create({
      filename,
      filepath,
      mimeType,
      size,
      uploadedBy,
      unused: true,
    });
  }

  async getMediaLibrary(query: any, limit = 20, skip = 0): Promise<{ files: IMedia[]; total: number; stats: any }> {
    const files = await mediaRepository.findMedia(query, limit, skip);
    const total = await mediaRepository.countMedia(query);
    const stats = await mediaRepository.getStorageStats();
    return { files, total, stats };
  }

  async deleteFile(id: string): Promise<boolean> {
    const media = await mediaRepository.findById(id);
    if (!media) return false;

    const absolutePath = path.join(process.cwd(), 'public', media.filepath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error(`Failed to delete local file ${absolutePath}:`, err);
      }
    }

    const res = await mediaRepository.delete(id);
    return res !== null;
  }

  async syncUnusedMedia(): Promise<void> {
    const allMedia = await mediaRepository.findMedia({}, 10000, 0);
    for (const file of allMedia) {
      const url = file.filepath;
      
      const qRef = await Question.findOne({
        $or: [
          { question: { $regex: url, $options: 'i' } },
          { answer: { $regex: url, $options: 'i' } },
          { diagrams: url },
          { attachments: url },
        ],
      }).exec();

      if (qRef) {
        await mediaRepository.updateUnusedStatus(url, false);
        continue;
      }

      const aRef = await Answer.findOne({
        $or: [
          { content: { $regex: url, $options: 'i' } },
          { attachments: url },
        ],
      }).exec();

      if (aRef) {
        await mediaRepository.updateUnusedStatus(url, false);
        continue;
      }

      const uRef = await User.findOne({
        $or: [
          { avatar: url },
          { coverImage: url },
        ],
      }).exec();

      if (uRef) {
        await mediaRepository.updateUnusedStatus(url, false);
        continue;
      }

      await mediaRepository.updateUnusedStatus(url, true);
    }
  }
}

export const mediaService = new MediaService();
