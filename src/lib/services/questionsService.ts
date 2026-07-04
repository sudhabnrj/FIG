import { Question } from '../../types';

export const questionsService = {
  async fetchQuestions(): Promise<Question[]> {
    if (typeof window === 'undefined') {
      try {
        const { questionService } = await import('../../server/services/QuestionService');
        const { dbConnect } = await import('../../server/config/database');
        
        try {
          await dbConnect();
          const { questions } = await questionService.getQuestions({}, { limit: 1000 });
          return JSON.parse(JSON.stringify(questions));
        } catch (dbError) {
          console.warn('⚠️ Server-side DB connection failed. Falling back to local JSON data:', dbError);
          const fs = await import('fs');
          const path = await import('path');
          const filePath = path.join(process.cwd(), 'public', 'data', 'questions.json');
          if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw);
          }
          return [];
        }
      } catch (error) {
        console.error('Failed to import or execute server-side question fetch:', error);
        return [];
      }
    } else {
      const response = await fetch('/api/v1/questions?limit=1000');
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data;
    }
  }
};
