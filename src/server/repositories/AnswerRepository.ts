import mongoose from 'mongoose';
import { Answer, IAnswer } from '../models/Answer';

export class AnswerRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<IAnswer | null> {
    return Answer.findById(id).populate('authorId', 'name username avatar').exec();
  }

  async findByQuestionId(questionId: string | mongoose.Types.ObjectId): Promise<IAnswer[]> {
    return Answer.find({ questionId })
      .populate('authorId', 'name username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByAuthorId(authorId: string | mongoose.Types.ObjectId): Promise<IAnswer[]> {
    return Answer.find({ authorId }).sort({ createdAt: -1 }).exec();
  }

  async create(data: Partial<IAnswer>): Promise<IAnswer> {
    return Answer.create(data);
  }

  async update(id: string | mongoose.Types.ObjectId, data: Partial<IAnswer>): Promise<IAnswer | null> {
    return Answer.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async delete(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    const res = await Answer.findByIdAndDelete(id).exec();
    return res !== null;
  }

  async findPending(): Promise<IAnswer[]> {
    return Answer.find({ reviewStatus: 'pending_review' })
      .populate('authorId', 'name username avatar')
      .populate('questionId', 'question title slug')
      .sort({ createdAt: 1 })
      .exec();
  }
}

export const answerRepository = new AnswerRepository();
