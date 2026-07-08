import { NextResponse } from 'next/server';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { mediaService } from '../services/MediaService';
import { communityService } from '../services/CommunityService';
import { auditLogService } from '../services/AuditLogService';

export class MediaController {
  async getMedia(request: AuthenticatedNextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const unused = searchParams.get('unused');
    const search = searchParams.get('search');

    const query: any = {};
    if (unused === 'true') query.unused = true;
    if (unused === 'false') query.unused = false;
    if (search) {
      query.filename = { $regex: search, $options: 'i' };
    }

    const result = await mediaService.getMediaLibrary(query, limit, skip);

    return NextResponse.json({
      success: true,
      data: result.files,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      },
      stats: result.stats,
    });
  }

  async uploadFile(request: AuthenticatedNextRequest) {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ success: false, message: 'Upload failed', errors: ['No file provided'] }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Upload failed', errors: ['File size must not exceed 5MB'] }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relativeUrl = await communityService.handleFileUpload(buffer, file.name, file.type);

    const media = await mediaService.registerUpload(file.name, relativeUrl, file.type, file.size, request.user._id.toString());

    await auditLogService.logAction(
      request.user._id.toString(),
      'MEDIA_UPLOADED',
      { filename: file.name, size: file.size, url: relativeUrl },
      request
    );

    return NextResponse.json({ success: true, url: relativeUrl, data: media });
  }

  async deleteFile(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const deleted = await mediaService.deleteFile(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, errors: ['File not found or deletion failed'] }, { status: 404 });
    }

    await auditLogService.logAction(
      request.user._id.toString(),
      'MEDIA_DELETED',
      { fileId: params.id },
      request
    );

    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  }

  async syncUnused(request: AuthenticatedNextRequest) {
    await mediaService.syncUnusedMedia();
    return NextResponse.json({ success: true, message: 'Unused media flags synchronized successfully' });
  }
}

export const mediaController = new MediaController();
