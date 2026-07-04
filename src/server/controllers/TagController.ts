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
}

export const tagController = new TagController();
