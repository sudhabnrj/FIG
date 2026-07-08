import mongoose from 'mongoose';
import { Review, IReview } from '../models/Review';

export class ReviewRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<IReview | null> {
    return Review.findById(id).populate('moderatorId', 'name username').exec();
  }

  async findByEntity(entityType: string, entityId: string | mongoose.Types.ObjectId): Promise<IReview | null> {
    return Review.findOne({ entityType, entityId }).exec();
  }

  async create(data: Partial<IReview>): Promise<IReview> {
    return Review.create(data);
  }

  async updateStatus(
    id: string | mongoose.Types.ObjectId,
    status: 'pending' | 'approved' | 'rejected' | 'needs_revision',
    moderatorId: string | mongoose.Types.ObjectId,
    notes?: string
  ): Promise<IReview | null> {
    const timestamp = new Date();
    return Review.findByIdAndUpdate(
      id,
      {
        $set: { status, moderatorId, notes },
        $push: { history: { status, moderatorId, notes, timestamp } },
      },
      { new: true }
    ).exec();
  }

  async findAllPending(): Promise<IReview[]> {
    return Review.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .exec();
  }
}

export const reviewRepository = new ReviewRepository();
