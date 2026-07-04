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
}

export const categoryController = new CategoryController();
