import { Question } from '../../types';

export const questionsService = {
  async fetchQuestions(): Promise<Question[]> {
    if (typeof window === 'undefined') {
      try {
        const { questionService } = await import('../../server/services/QuestionService');
        const { dbConnect } = await import('../../server/config/database');
        
        await dbConnect();
        const { questions } = await questionService.getQuestions({}, { limit: 1000 });
        return JSON.parse(JSON.stringify(questions));
      } catch (error) {
        console.error('Failed to fetch questions on server side:', error);
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
