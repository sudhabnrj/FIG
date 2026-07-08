import { NextResponse } from 'next/server';
import { categoryService } from '../services/CategoryService';

export class CategoryController {
  async getCategories() {
    const categories = await categoryService.getCategories();
    return NextResponse.json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  }

  async getCategoryBySlug(slug: string) {
    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found', errors: ['Category matching slug was not found'] },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Category fetched successfully',
      data: category,
    });
  }

  async getCategoryById(request: Request, { params }: { params: { id: string } }) {
    const category = await categoryService.getCategoryById(params.id);
    if (!category) {
      return NextResponse.json({ success: false, errors: ['Category not found'] }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  }

  async createCategory(request: any) {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ success: false, errors: ['Category name is required'] }, { status: 400 });
    }

    try {
      const userId = request.user?._id?.toString();
      const category = await categoryService.createCategory(body, userId);
      return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ success: false, errors: [err.message] }, { status: 400 });
    }
  }

  async updateCategory(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json();
    const updated = await categoryService.updateCategory(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, errors: ['Category not found'] }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  }

  async deleteCategory(request: Request, { params }: { params: { id: string } }) {
    const deleted = await categoryService.deleteCategory(params.id);
    return NextResponse.json({ success: deleted });
  }

  async mergeCategories(request: Request) {
    const body = await request.json();
    const { sourceId, destinationId } = body;
    if (!sourceId || !destinationId) {
      return NextResponse.json({ success: false, errors: ['sourceId and destinationId are required'] }, { status: 400 });
    }

    await categoryService.mergeCategories(sourceId, destinationId);
    return NextResponse.json({ success: true, message: 'Categories merged successfully' });
  }
}

export const categoryController = new CategoryController();
