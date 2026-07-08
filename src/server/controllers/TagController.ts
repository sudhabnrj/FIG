import { NextResponse } from 'next/server';
import { tagService } from '../services/TagService';

export class TagController {
  async getTags() {
    const tags = await tagService.getTags();
    return NextResponse.json({
      success: true,
      message: 'Tags fetched successfully',
      data: tags,
    });
  }

  async getTagById(request: Request, { params }: { params: { id: string } }) {
    const tag = await tagService.getTagById(params.id);
    if (!tag) {
      return NextResponse.json({ success: false, errors: ['Tag not found'] }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tag });
  }

  async createTag(request: Request) {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ success: false, errors: ['Tag name is required'] }, { status: 400 });
    }

    const tag = await tagService.createTag(body);
    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  }

  async updateTag(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json();
    const updated = await tagService.updateTag(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, errors: ['Tag not found'] }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  }

  async deleteTag(request: Request, { params }: { params: { id: string } }) {
    const deleted = await tagService.deleteTag(params.id);
    return NextResponse.json({ success: deleted });
  }

  async mergeTags(request: Request) {
    const body = await request.json();
    const { sourceId, destinationId } = body;
    if (!sourceId || !destinationId) {
      return NextResponse.json({ success: false, errors: ['sourceId and destinationId are required'] }, { status: 400 });
    }

    await tagService.mergeTags(sourceId, destinationId);
    return NextResponse.json({ success: true, message: 'Tags merged successfully' });
  }
}

export const tagController = new TagController();
