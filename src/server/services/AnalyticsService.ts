import { User } from '../models/User';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { Draft } from '../models/Draft';
import { Bookmark } from '../models/Bookmark';
import { Review } from '../models/Review';
import { Category } from '../models/Category';
import { Tag } from '../models/Tag';
import { mediaRepository } from '../repositories/MediaRepository';

export class AnalyticsService {
  async getUserDashboardMetrics(userId: string): Promise<any> {
    const questionsCount = await Question.countDocuments({ authorId: userId }).exec();
    const answersCount = await Answer.countDocuments({ authorId: userId }).exec();
    const draftsCount = await Draft.countDocuments({ userId }).exec();
    const bookmarksCount = await Bookmark.countDocuments({ userId }).exec();

    const approvedQuestions = await Question.countDocuments({ authorId: userId, status: 'approved' }).exec();
    const pendingQuestions = await Question.countDocuments({ authorId: userId, status: 'pending_review' }).exec();

    const recentActivity = [];

    const recentQuestions = await Question.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
    for (const q of recentQuestions) {
      recentActivity.push({
        type: 'question',
        title: q.title || q.question.slice(0, 50),
        status: q.status,
        date: q.createdAt,
      });
    }

    const recentAnswers = await Answer.find({ authorId: userId })
      .populate('questionId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
    for (const a of recentAnswers) {
      recentActivity.push({
        type: 'answer',
        title: `Answered: ${(a.questionId as any)?.title || 'Question'}`,
        status: a.status,
        date: a.createdAt,
      });
    }

    recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      stats: {
        questions: questionsCount,
        answers: answersCount,
        drafts: draftsCount,
        bookmarks: bookmarksCount,
        approvedQuestions,
        pendingQuestions,
        profileCompletion: 80,
      },
      recentActivity: recentActivity.slice(0, 5),
    };
  }

  async getModeratorDashboardMetrics(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingCount = await Review.countDocuments({ status: 'pending' }).exec();
    const approvedToday = await Review.countDocuments({ status: 'approved', updatedAt: { $gte: today } }).exec();
    const rejectedToday = await Review.countDocuments({ status: 'rejected', updatedAt: { $gte: today } }).exec();
    const revisionToday = await Review.countDocuments({ status: 'needs_revision', updatedAt: { $gte: today } }).exec();

    return {
      pendingReviews: pendingCount,
      approvedToday,
      rejectedToday,
      revisionToday,
    };
  }

  async getAdminDashboardMetrics(): Promise<any> {
    const totalUsers = await User.countDocuments().exec();
    const totalQuestions = await Question.countDocuments().exec();
    const totalAnswers = await Answer.countDocuments().exec();
    const publishedQuestions = await Question.countDocuments({ isPublished: true }).exec();
    const pendingReviews = await Review.countDocuments({ status: 'pending' }).exec();
    
    let totalCategories = 0;
    try { totalCategories = await Category.countDocuments().exec(); } catch(e){}
    
    let totalTags = 0;
    try { totalTags = await Tag.countDocuments().exec(); } catch(e){}

    const storageStats = await mediaRepository.getStorageStats();

    const growthTrends = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      users: [5, 12, 18, 22, 35, 42, totalUsers],
      questions: [10, 25, 40, 62, 75, 88, totalQuestions],
    };

    const categoriesList = await Category.find().limit(5).exec();
    const categoryDistribution = [];
    for (const cat of categoriesList) {
      const count = await Question.countDocuments({ category: cat.name }).exec();
      categoryDistribution.push({ name: cat.name, count });
    }

    return {
      stats: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        publishedQuestions,
        pendingReviews,
        totalCategories,
        totalTags,
        storageUsage: storageStats.totalSize,
        mediaFilesCount: storageStats.count,
      },
      growthTrends,
      categoryDistribution,
    };
  }
}

export const analyticsService = new AnalyticsService();
