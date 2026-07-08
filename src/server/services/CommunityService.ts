import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Question, IQuestion } from '../models/Question';
import { Answer, IAnswer } from '../models/Answer';
import { Draft, IDraft } from '../models/Draft';
import { Version, IVersion } from '../models/Version';
import { Review, IReview } from '../models/Review';
import { Category } from '../models/Category';
import { Tag } from '../models/Tag';
import { answerRepository } from '../repositories/AnswerRepository';
import { draftRepository } from '../repositories/DraftRepository';
import { reviewRepository } from '../repositories/ReviewRepository';

export class CommunityService {
  // --- QUESTIONS ---
  async getQuestionById(id: number): Promise<IQuestion | null> {
    return Question.findOne({ id }).populate('authorId', 'name username avatar').exec();
  }

  async getQuestionByMongoId(id: string | mongoose.Types.ObjectId): Promise<IQuestion | null> {
    return Question.findById(id).populate('authorId', 'name username avatar').exec();
  }

  async createQuestion(data: any, authorId: string): Promise<IQuestion> {
    const cleanTitle = (data.title || '').trim();
    const cleanQuestion = (data.question || '').replace(/<[^>]*>/g, '').trim();

    if (cleanTitle) {
      const existingTitle = await Question.findOne({
        title: { $regex: new RegExp('^' + cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      }).exec();
      if (existingTitle) throw new Error('Question already exists.');
    }
    if (cleanQuestion) {
      const existingQuestion = await Question.findOne({
        question: { $regex: new RegExp('^' + cleanQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      }).exec();
      if (existingQuestion) throw new Error('Question already exists.');
    }

    const maxQuestion = await Question.findOne().sort({ id: -1 }).exec();
    const nextId = maxQuestion ? maxQuestion.id + 1 : 1;

    const slug = data.title
      ? data.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 80)
      : `question-${nextId}`;

    const { subCategory, answer, ...cleanData } = data;

    const newQuestion = new Question({
      ...cleanData,
      id: nextId,
      slug,
      authorId,
      status: 'pending_review',
      reviewStatus: 'pending_review',
      isPublished: false,
      version: 1,
    });

    const savedQuestion = await newQuestion.save();

    await Version.create({
      entityType: 'question',
      entityId: savedQuestion._id,
      content: savedQuestion.question,
      metadata: {
        title: savedQuestion.title,
        summary: savedQuestion.summary,
        category: savedQuestion.category,
        difficulty: savedQuestion.difficulty,
        tags: savedQuestion.tags,
        attachments: savedQuestion.attachments,
      },
      authorId,
      versionNumber: 1,
    });

    // 4. Create Review Queue item
    await Review.create({
      entityType: 'question',
      entityId: savedQuestion._id,
      status: 'pending',
      history: [{ status: 'pending', notes: 'Submission initialized by author', timestamp: new Date() }],
    });

    // 5. Cleanup active user draft
    await draftRepository.deleteActiveDraft(authorId, undefined, undefined);

    return savedQuestion;
  }

  async updateQuestion(id: string, data: any, authorId: string): Promise<IQuestion | null> {
    const question = await Question.findById(id);
    if (!question) throw new Error('Question not found');

    const cleanTitle = (data.title || '').trim();
    const cleanQuestion = (data.question || '').replace(/<[^>]*>/g, '').trim();

    if (cleanTitle) {
      const existingTitle = await Question.findOne({
        _id: { $ne: id },
        title: { $regex: new RegExp('^' + cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      }).exec();
      if (existingTitle) throw new Error('Question already exists.');
    }
    if (cleanQuestion) {
      const existingQuestion = await Question.findOne({
        _id: { $ne: id },
        question: { $regex: new RegExp('^' + cleanQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      }).exec();
      if (existingQuestion) throw new Error('Question already exists.');
    }

    const newVersionNumber = (question.version || 1) + 1;

    const updated = await Question.findByIdAndUpdate(
      id,
      {
        $set: {
          title: data.title,
          question: data.question,
          category: data.category,
          difficulty: data.difficulty,
          tags: data.tags,
          summary: data.summary,
          attachments: data.attachments,
          status: 'pending_review',
          reviewStatus: 'pending_review',
          isPublished: false,
          version: newVersionNumber,
        },
      },
      { new: true }
    ).exec();

    if (updated) {
      await Version.create({
        entityType: 'question',
        entityId: updated._id,
        content: updated.question,
        metadata: {
          title: updated.title,
          summary: updated.summary,
          category: updated.category,
          difficulty: updated.difficulty,
          tags: updated.tags,
          attachments: updated.attachments,
        },
        authorId,
        versionNumber: newVersionNumber,
      });

      // Update existing or create new review ticket
      const existingReview = await reviewRepository.findByEntity('question', updated._id);
      if (existingReview) {
        await reviewRepository.updateStatus(existingReview._id, 'pending', authorId, 'Content updated and resubmitted');
      } else {
        await Review.create({
          entityType: 'question',
          entityId: updated._id,
          status: 'pending',
          history: [{ status: 'pending', notes: 'Content resubmitted', timestamp: new Date() }],
        });
      }
    }

    return updated;
  }

  // --- ANSWERS ---
  async getAnswersByQuestionId(questionId: string): Promise<IAnswer[]> {
    return answerRepository.findByQuestionId(questionId);
  }

  async createAnswer(data: any, authorId: string): Promise<IAnswer> {
    const newAnswer = await answerRepository.create({
      ...data,
      authorId,
      status: 'pending_review',
      reviewStatus: 'pending_review',
      version: 1,
    });

    // Create version
    await Version.create({
      entityType: 'answer',
      entityId: newAnswer._id,
      content: newAnswer.content,
      metadata: { attachments: newAnswer.attachments },
      authorId,
      versionNumber: 1,
    });

    // Create Review item
    await Review.create({
      entityType: 'answer',
      entityId: newAnswer._id,
      status: 'pending',
      history: [{ status: 'pending', notes: 'Answer submitted by contributor', timestamp: new Date() }],
    });

    // Cleanup drafts
    await draftRepository.deleteActiveDraft(authorId, undefined, newAnswer._id);

    return newAnswer;
  }

  // --- DRAFTS & AUTOSAVE ---
  async saveDraft(userId: string, data: any): Promise<IDraft> {
    const { questionId, answerId, title, draftContent, metadata } = data;
    
    // Find active draft
    let draft = await draftRepository.findActiveUserDraft(userId, questionId, answerId);

    if (draft) {
      const updated = await draftRepository.update(draft._id, {
        title,
        draftContent,
        metadata,
      });
      return updated!;
    } else {
      return draftRepository.create({
        userId,
        questionId,
        answerId,
        title,
        draftContent,
        metadata,
        lastSaved: new Date(),
      });
    }
  }

  async getUserDrafts(userId: string): Promise<IDraft[]> {
    return draftRepository.findByUserId(userId);
  }

  async deleteDraft(draftId: string): Promise<boolean> {
    return draftRepository.delete(draftId);
  }

  // --- REVIEW QUEUE & ACTIONS ---
  async getPendingReviews(): Promise<any[]> {
    const pending = await reviewRepository.findAllPending();
    const populated = await Promise.all(
      pending.map(async (review) => {
        let details: any = null;
        if (review.entityType === 'question') {
          details = await Question.findById(review.entityId)
            .populate('authorId', 'name username')
            .exec();
        } else if (review.entityType === 'answer') {
          details = await Answer.findById(review.entityId)
            .populate('authorId', 'name username')
            .populate('questionId', 'question title')
            .exec();
        } else if (review.entityType === 'category') {
          details = await Category.findById(review.entityId).exec();
        } else if (review.entityType === 'tag') {
          details = await Tag.findById(review.entityId).exec();
        }
        return {
          review,
          details,
        };
      })
    );
    // Filter out items where details no longer exist
    return populated.filter((item) => item.details !== null);
  }

  async performReview(
    reviewId: string,
    action: 'approved' | 'rejected' | 'needs_revision',
    moderatorId: string,
    notes?: string
  ): Promise<any> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new Error('Review item not found');

    const updatedReview = await reviewRepository.updateStatus(reviewId, action, moderatorId, notes);

    // Sync status back to target entity
    if (review.entityType === 'question') {
      const statusMap = {
        approved: 'approved',
        rejected: 'rejected',
        needs_revision: 'needs_revision',
        pending: 'pending_review',
      };
      const newStatus = statusMap[action];

      await Question.findByIdAndUpdate(review.entityId, {
        $set: {
          reviewStatus: newStatus,
          status: action === 'approved' ? 'active' : newStatus,
          isPublished: action === 'approved',
        },
      });
    } else if (review.entityType === 'answer') {
      const statusMap = {
        approved: 'approved',
        rejected: 'rejected',
        needs_revision: 'needs_revision',
        pending: 'pending_review',
      };
      const newStatus = statusMap[action];

      await Answer.findByIdAndUpdate(review.entityId, {
        $set: {
          reviewStatus: newStatus,
          status: action === 'approved' ? 'active' : newStatus,
        },
      });
    }

    return updatedReview;
  }

  // --- VERSION HISTORY ---
  async getVersionHistory(entityType: 'question' | 'answer', entityId: string): Promise<IVersion[]> {
    return Version.find({ entityType, entityId })
      .populate('authorId', 'name username')
      .sort({ versionNumber: -1 })
      .exec();
  }

  async restoreVersion(versionId: string, authorId: string): Promise<any> {
    const version = await Version.findById(versionId);
    if (!version) throw new Error('Version not found');

    if (version.entityType === 'question') {
      const question = await Question.findById(version.entityId);
      if (!question) throw new Error('Question not found');

      const nextVerNum = (question.version || 1) + 1;
      const metadata = version.metadata || {};

      const restored = await Question.findByIdAndUpdate(
        version.entityId,
        {
          $set: {
            title: metadata.title || question.title,
            question: version.content,
            answer: metadata.answer || question.answer,
            category: metadata.category || question.category,
            subCategory: metadata.subCategory || question.subCategory,
            difficulty: metadata.difficulty || question.difficulty,
            tags: metadata.tags || question.tags,
            summary: metadata.summary || question.summary,
            attachments: metadata.attachments || question.attachments,
            version: nextVerNum,
            status: 'pending_review',
            reviewStatus: 'pending_review',
            isPublished: false,
          },
        },
        { new: true }
      );

      // Save a new version tracking this restore action
      await Version.create({
        entityType: 'question',
        entityId: version.entityId,
        content: version.content,
        metadata: version.metadata,
        authorId,
        versionNumber: nextVerNum,
      });

      return restored;
    } else if (version.entityType === 'answer') {
      const answer = await Answer.findById(version.entityId);
      if (!answer) throw new Error('Answer not found');

      const nextVerNum = (answer.version || 1) + 1;
      const metadata = version.metadata || {};

      const restored = await Answer.findByIdAndUpdate(
        version.entityId,
        {
          $set: {
            content: version.content,
            attachments: metadata.attachments || answer.attachments,
            version: nextVerNum,
            status: 'pending_review',
            reviewStatus: 'pending_review',
          },
        },
        { new: true }
      );

      // Save a new version tracking this restore action
      await Version.create({
        entityType: 'answer',
        entityId: version.entityId,
        content: version.content,
        metadata: version.metadata,
        authorId,
        versionNumber: nextVerNum,
      });

      return restored;
    }
  }

  // --- UPLOAD HANDLER ---
  async handleFileUpload(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    // Validate file size is checked before calling (max 5MB)
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'application/pdf',
      'text/markdown',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    const ext = path.extname(originalName) || `.${mimeType.split('/')[1]}`;
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, fileBuffer);

    return `/uploads/${filename}`;
  }
}

export const communityService = new CommunityService();
