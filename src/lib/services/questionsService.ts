import { Question } from '../../types';
import fs from 'fs';
import path from 'path';

export const questionsService = {
  async fetchQuestions(): Promise<Question[]> {
    if (typeof window === 'undefined') {
      // Server-side: read directly from the public/data folder using fs
      const filePath = path.join(process.cwd(), 'public', 'data', 'questions.json');
      const jsonData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(jsonData);
    } else {
      // Client-side: use standard fetch
      const response = await fetch('/data/questions.json');
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      return response.json();
    }
  }
};
