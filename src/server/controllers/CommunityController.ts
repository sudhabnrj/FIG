import { NextResponse } from 'next/server';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { communityService } from '../services/CommunityService';
import { questionValidator, answerValidator, draftValidator, reviewActionValidator } from '../validators/community.validator';

export class CommunityController {
  // --- QUESTIONS ---
  async createQuestion(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const validated = questionValidator.parse(body);

    const question = await communityService.createQuestion(validated, request.user._id.toString());
    return NextResponse.json({ success: true, data: question }, { status: 201 });
  }

  async updateQuestion(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const body = await request.json();
    const validated = questionValidator.parse(body);

    const updated = await communityService.updateQuestion(params.id, validated, request.user._id.toString());
    return NextResponse.json({ success: true, data: updated });
  }

  async getQuestionHistory(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const history = await communityService.getVersionHistory('question', params.id);
    return NextResponse.json({ success: true, data: history });
  }

  async restoreQuestionVersion(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const { versionId } = body;
    if (!versionId) {
      return NextResponse.json({ success: false, errors: ['Version ID is required'] }, { status: 400 });
    }

    const restored = await communityService.restoreVersion(versionId, request.user._id.toString());
    return NextResponse.json({ success: true, data: restored });
  }

  // --- ANSWERS ---
  async getAnswers(request: AuthenticatedNextRequest) {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    if (!questionId) {
      return NextResponse.json({ success: false, errors: ['Question ID is required'] }, { status: 400 });
    }

    const answers = await communityService.getAnswersByQuestionId(questionId);
    return NextResponse.json({ success: true, data: answers });
  }

  async createAnswer(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const validated = answerValidator.parse(body);

    const answer = await communityService.createAnswer(validated, request.user._id.toString());
    return NextResponse.json({ success: true, data: answer }, { status: 201 });
  }

  // --- DRAFTS ---
  async getUserDrafts(request: AuthenticatedNextRequest) {
    const drafts = await communityService.getUserDrafts(request.user._id.toString());
    return NextResponse.json({ success: true, data: drafts });
  }

  async saveDraft(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const validated = draftValidator.parse(body);

    const draft = await communityService.saveDraft(request.user._id.toString(), validated);
    return NextResponse.json({ success: true, data: draft });
  }

  async deleteDraft(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const deleted = await communityService.deleteDraft(params.id);
    return NextResponse.json({ success: deleted });
  }

  // --- REVIEW MODERATION ---
  async getPendingReviews(request: AuthenticatedNextRequest) {
    const pending = await communityService.getPendingReviews();
    return NextResponse.json({ success: true, data: pending });
  }

  async performReview(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const { reviewId, action, notes } = reviewActionValidator.parse(body);

    const review = await communityService.performReview(reviewId, action, request.user._id.toString(), notes);
    return NextResponse.json({ success: true, data: review });
  }

  // --- FILE ATTACHMENTS & UPLOADS ---
  async uploadFile(request: AuthenticatedNextRequest) {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ success: false, message: 'Upload failed', errors: ['No file provided'] }, { status: 400 });
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Upload failed', errors: ['File size must not exceed 5MB'] }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = await communityService.handleFileUpload(buffer, file.name, file.type);
    
    return NextResponse.json({ success: true, url: path });
  }
}

export const communityController = new CommunityController();
