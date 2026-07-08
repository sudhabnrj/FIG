import { Media, IMedia } from '../models/Media';

export class MediaRepository {
  async findById(id: string): Promise<IMedia | null> {
    return Media.findById(id).populate('uploadedBy', 'name username').exec();
  }

  async findMedia(query: any, limit = 20, skip = 0): Promise<IMedia[]> {
    return Media.find(query)
      .populate('uploadedBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countMedia(query: any): Promise<number> {
    return Media.countDocuments(query).exec();
  }

  async create(data: Partial<IMedia>): Promise<IMedia> {
    return Media.create(data);
  }

  async delete(id: string): Promise<IMedia | null> {
    return Media.findByIdAndDelete(id).exec();
  }

  async updateUnusedStatus(filepath: string, unused: boolean): Promise<IMedia | null> {
    return Media.findOneAndUpdate({ filepath }, { $set: { unused } }, { new: true }).exec();
  }

  async getStorageStats(): Promise<{ count: number; totalSize: number }> {
    const result = await Media.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
        },
      },
    ]).exec();

    if (result.length === 0) {
      return { count: 0, totalSize: 0 };
    }

    return { count: result[0].count, totalSize: result[0].totalSize };
  }
}

export const mediaRepository = new MediaRepository();
