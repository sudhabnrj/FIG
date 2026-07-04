import { questionRepository, GetQuestionsFilters, GetQuestionsOptions } from '../repositories/QuestionRepository';
import { IQuestion } from '../models/Question';

export class QuestionService {
  async getQuestionById(id: number): Promise<IQuestion | null> {
    return questionRepository.findById(id);
  }

  async getQuestionBySlug(slug: string): Promise<IQuestion | null> {
    return questionRepository.findBySlug(slug);
  }

  async getQuestions(
    filters: GetQuestionsFilters = {},
    options: GetQuestionsOptions = {}
  ): Promise<{ questions: IQuestion[]; total: number }> {
    return questionRepository.findAll(filters, options);
  }
}

export const questionService = new QuestionService();
