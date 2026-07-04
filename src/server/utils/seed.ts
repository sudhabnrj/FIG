import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Question } from '../models/Question';
import { Category } from '../models/Category';
import { Tag } from '../models/Tag';

// Custom .env.local loader to avoid dependencies
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const index = trimmed.indexOf('=');
        if (index > 0) {
          const key = trimmed.slice(0, index).trim();
          const value = trimmed.slice(index + 1).trim();
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.warn('⚠️ Manual env loading failed:', e);
}

const CATEGORIES_LIST = [
  { name: 'AI', slug: 'ai', icon: 'fas fa-brain', description: 'Artificial Intelligence and Prompt Engineering', order: 1 },
  { name: 'UI / UX', slug: 'uiux', icon: 'fas fa-pen-nib', description: 'User Interface and User Experience Design', order: 2 },
  { name: 'React JS', slug: 'react', icon: 'fab fa-react', description: 'React JS Frontend Development', order: 3 },
  { name: 'JavaScript', slug: 'javascript', icon: 'fab fa-js', description: 'Core JavaScript and Programming', order: 4 },
  { name: 'Next.js', slug: 'nextjs', icon: 'fas fa-square', description: 'Next.js Modern Web Framework', order: 5 },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected successfully');

    console.log('🧹 Clearing categories...');
    await Category.deleteMany({});
    console.log('🌱 Seeding categories...');
    await Category.insertMany(CATEGORIES_LIST);
    console.log(`✅ Seeded ${CATEGORIES_LIST.length} categories`);

    console.log('🧹 Clearing tags...');
    await Tag.deleteMany({});
    const TAGS_LIST = [
      { name: 'Prompt Engineering', slug: 'prompt-engineering' },
      { name: 'RAG', slug: 'rag' },
      { name: 'State Management', slug: 'state-management' },
      { name: 'Vite', slug: 'vite' },
      { name: 'Redux', slug: 'redux' },
      { name: 'Performance', slug: 'performance' },
    ];
    await Tag.insertMany(TAGS_LIST);
    console.log(`✅ Seeded ${TAGS_LIST.length} tags`);

    console.log('🧹 Clearing questions...');
    await Question.deleteMany({});

    console.log('📖 Reading questions.json...');
    const filePath = path.join(process.cwd(), 'public', 'data', 'questions.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const questionsData = JSON.parse(rawData);

    console.log(`🌱 Seeding ${questionsData.length} questions...`);
    const seededQuestions = questionsData.map((q: any) => {
      let tags: string[] = [];
      const lowerCat = q.category.toLowerCase();
      if (lowerCat.includes('ai')) tags.push('ai');
      if (lowerCat.includes('react')) tags.push('react');
      if (lowerCat.includes('javascript') || lowerCat.includes('js')) tags.push('javascript');
      if (lowerCat.includes('next')) tags.push('nextjs');

      const lowerQ = q.question.toLowerCase();
      if (lowerQ.includes('prompt')) tags.push('prompt-engineering');
      if (lowerQ.includes('rag')) tags.push('rag');
      if (lowerQ.includes('redux') || lowerQ.includes('state')) tags.push('state-management');

      return {
        id: q.id,
        category: q.category,
        question: q.question,
        answer: q.answer,
        diagrams: q.diagrams || [],
        difficulty: 'medium',
        tags: Array.from(new Set(tags)),
        featured: false,
        order: q.id,
        status: 'active',
        isPublished: true,
      };
    });

    await Question.insertMany(seededQuestions);
    console.log(`✅ Seeded ${seededQuestions.length} questions successfully!`);

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
