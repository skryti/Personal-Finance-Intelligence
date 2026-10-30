import { TransactionCategory } from '../types/finance';

export const CATEGORY_KEYWORDS: Record<TransactionCategory, string[]> = {
  Food: ['burger', 'pizza', 'swiggy', 'zomato', 'cafe', 'lunch', 'dinner'],
  Travel: ['uber', 'ola', 'cab', 'metro', 'petrol', 'fuel'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'shoes', 'clothes'],
  Bills: ['electricity', 'wifi', 'recharge', 'bill', 'rent'],
  Entertainment: ['movie', 'netflix', 'cinema', 'spotify'],
  Income: ['salary', 'stipend', 'freelance', 'bonus'],
  Other: [],
};

export function detectCategoryFromKeyword(description: string): {
  category: TransactionCategory;
  matchedKeyword?: string;
} {
  if (!description || typeof description !== 'string') {
    return { category: 'Other' };
  }

  const normalized = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalized) || normalized.includes(keyword)) {
        return {
          category: category as TransactionCategory,
          matchedKeyword: keyword,
        };
      }
    }
  }

  return { category: 'Other' };
}
