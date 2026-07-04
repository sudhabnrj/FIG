import { Question } from '../../src/types';

export const mockQuestions: Question[] = [
  {
    id: 1,
    category: 'JavaScript',
    question: 'What is a closure?',
    answer: 'A closure is the combination of a function bundled together with references to its surrounding state.',
    diagrams: [],
  },
  {
    id: 2,
    category: 'React',
    question: 'What is a React Hook?',
    answer: 'Hooks let you use state and other React features without writing a class.',
    diagrams: [],
  },
  {
    id: 3,
    category: 'AI',
    question: 'What is Retrieval-Augmented Generation?',
    answer: 'RAG is a technique that optimizes the output of a LLM using authoritative knowledge bases.',
    diagrams: ['/assets/images/rag.png'],
  },
];
