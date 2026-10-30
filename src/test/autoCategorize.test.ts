import { describe, it, expect } from 'vitest';
import { detectCategoryFromKeyword, CATEGORY_KEYWORDS } from '../utils/autoCategorize';

describe('Keyword Auto-Categorization Engine', () => {
  // ==========================================
  // TIER 1: ISOLATED KEYWORD DICTIONARIES
  // ==========================================
  describe('Tier 1: Isolated Dictionary Verification for all 6 Categories', () => {
    it('detects all Food keywords: burger, pizza, swiggy, zomato, cafe, lunch, dinner', () => {
      const foodKeywords = ['burger', 'pizza', 'swiggy', 'zomato', 'cafe', 'lunch', 'dinner'];
      for (const kw of foodKeywords) {
        const result = detectCategoryFromKeyword(`paid for ${kw} today`);
        expect(result.category).toBe('Food');
        expect(result.matchedKeyword).toBe(kw);
      }
    });

    it('detects all Travel keywords: uber, ola, cab, metro, petrol, fuel', () => {
      const travelKeywords = ['uber', 'ola', 'cab', 'metro', 'petrol', 'fuel'];
      for (const kw of travelKeywords) {
        const result = detectCategoryFromKeyword(`trip expenses for ${kw}`);
        expect(result.category).toBe('Travel');
        expect(result.matchedKeyword).toBe(kw);
      }
    });

    it('detects all Shopping keywords: amazon, flipkart, myntra, shoes, clothes', () => {
      const shoppingKeywords = ['amazon', 'flipkart', 'myntra', 'shoes', 'clothes'];
      for (const kw of shoppingKeywords) {
        const result = detectCategoryFromKeyword(`online order on ${kw}`);
        expect(result.category).toBe('Shopping');
        expect(result.matchedKeyword).toBe(kw);
      }
    });

    it('detects all Bills keywords: electricity, wifi, recharge, bill, rent', () => {
      const billsKeywords = ['electricity', 'wifi', 'recharge', 'bill', 'rent'];
      for (const kw of billsKeywords) {
        const result = detectCategoryFromKeyword(`monthly utility ${kw}`);
        expect(result.category).toBe('Bills');
        expect(result.matchedKeyword).toBe(kw);
      }
    });

    it('detects all Entertainment keywords: movie, netflix, cinema, spotify', () => {
      const entertainmentKeywords = ['movie', 'netflix', 'cinema', 'spotify'];
      for (const kw of entertainmentKeywords) {
        const result = detectCategoryFromKeyword(`weekend streaming ${kw}`);
        expect(result.category).toBe('Entertainment');
        expect(result.matchedKeyword).toBe(kw);
      }
    });

    it('detects all Income keywords: salary, stipend, freelance, bonus', () => {
      const incomeKeywords = ['salary', 'stipend', 'freelance', 'bonus'];
      for (const kw of incomeKeywords) {
        const result = detectCategoryFromKeyword(`credit received as ${kw}`);
        expect(result.category).toBe('Income');
        expect(result.matchedKeyword).toBe(kw);
      }
    });

    it('exposes complete CATEGORY_KEYWORDS constant matching R3 specifications', () => {
      expect(CATEGORY_KEYWORDS.Food).toContain('swiggy');
      expect(CATEGORY_KEYWORDS.Travel).toContain('uber');
      expect(CATEGORY_KEYWORDS.Shopping).toContain('amazon');
      expect(CATEGORY_KEYWORDS.Bills).toContain('rent');
      expect(CATEGORY_KEYWORDS.Entertainment).toContain('netflix');
      expect(CATEGORY_KEYWORDS.Income).toContain('salary');
      expect(CATEGORY_KEYWORDS.Other).toEqual([]);
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY VALUE ANALYSIS
  // ==========================================
  describe('Tier 2: Boundary Value Analysis', () => {
    it('returns Other with undefined matchedKeyword for empty string', () => {
      const result = detectCategoryFromKeyword('');
      expect(result.category).toBe('Other');
      expect(result.matchedKeyword).toBeUndefined();
    });

    it('returns Other for whitespace-only strings', () => {
      expect(detectCategoryFromKeyword('   ').category).toBe('Other');
      expect(detectCategoryFromKeyword('\t\n').category).toBe('Other');
    });

    it('handles uppercase and mixed case keywords correctly', () => {
      expect(detectCategoryFromKeyword('SWIGGY DINNER').category).toBe('Food');
      expect(detectCategoryFromKeyword('uBeR CaB').category).toBe('Travel');
      expect(detectCategoryFromKeyword('AmAzOn PrImE').category).toBe('Shopping');
      expect(detectCategoryFromKeyword('NETFLIX 4K').category).toBe('Entertainment');
      expect(detectCategoryFromKeyword('MONTHLY SALARY').category).toBe('Income');
    });

    it('handles keyword appearing at beginning, middle, and end of sentence', () => {
      expect(detectCategoryFromKeyword('swiggy delivery').category).toBe('Food');
      expect(detectCategoryFromKeyword('ordered lunch on swiggy yesterday').category).toBe('Food');
      expect(detectCategoryFromKeyword('food from swiggy').category).toBe('Food');
    });

    it('handles keywords with trailing and leading punctuation', () => {
      expect(detectCategoryFromKeyword('Swiggy!').category).toBe('Food');
      expect(detectCategoryFromKeyword('Paid rent, for Sept.').category).toBe('Bills');
      expect(detectCategoryFromKeyword('[Amazon] Package receipt').category).toBe('Shopping');
      expect(detectCategoryFromKeyword('#Fuel-payment').category).toBe('Travel');
    });

    it('returns Other for strings that do not contain any known keywords', () => {
      expect(detectCategoryFromKeyword('Random hardware repair').category).toBe('Other');
      expect(detectCategoryFromKeyword('Stationery notebook and pen').category).toBe('Other');
      expect(detectCategoryFromKeyword('Donation to charity trust').category).toBe('Other');
    });

    it('handles long input strings (500+ chars) efficiently', () => {
      const longText = 'A'.repeat(500) + ' swiggy ' + 'B'.repeat(500);
      const result = detectCategoryFromKeyword(longText);
      expect(result.category).toBe('Food');
      expect(result.matchedKeyword).toBe('swiggy');
    });
  });

  // ==========================================
  // TIER 3: MULTI-KEYWORD & OVERLAPPING DETECTIONS
  // ==========================================
  describe('Tier 3: Multi-Keyword & Prioritization Interactions', () => {
    it('prioritizes category based on dictionary declaration order when multiple keywords exist', () => {
      // "swiggy" (Food) appears in dictionary before "amazon" (Shopping)
      const result = detectCategoryFromKeyword('swiggy gift card bought on amazon');
      expect(result.category).toBe('Food');
      expect(result.matchedKeyword).toBe('swiggy');
    });

    it('detects Travel when Uber is paired with un-categorized words', () => {
      const result = detectCategoryFromKeyword('uber ride with colleagues to venue');
      expect(result.category).toBe('Travel');
      expect(result.matchedKeyword).toBe('uber');
    });

    it('detects Bills when recharge keyword is used', () => {
      const result = detectCategoryFromKeyword('prepaid mobile recharge');
      expect(result.category).toBe('Bills');
      expect(result.matchedKeyword).toBe('recharge');
    });
  });

  // ==========================================
  // TIER 5: ADVERSARIAL STRESS & TYPE RESILIENCE
  // ==========================================
  describe('Tier 5: Adversarial Stress & Input Hardening', () => {
    it('safely handles non-string inputs (null, undefined, numbers, objects) without throwing', () => {
      expect(detectCategoryFromKeyword(null as any).category).toBe('Other');
      expect(detectCategoryFromKeyword(undefined as any).category).toBe('Other');
      expect(detectCategoryFromKeyword(123456 as any).category).toBe('Other');
      expect(detectCategoryFromKeyword({} as any).category).toBe('Other');
      expect(detectCategoryFromKeyword([] as any).category).toBe('Other');
    });

    it('detects keywords accompanied by emojis', () => {
      expect(detectCategoryFromKeyword('🍕 pizza party').category).toBe('Food');
      expect(detectCategoryFromKeyword('🚕 uber ride to airport').category).toBe('Travel');
      expect(detectCategoryFromKeyword('🎬 netflix movie night').category).toBe('Entertainment');
      expect(detectCategoryFromKeyword('💰 monthly salary received').category).toBe('Income');
    });

    it('handles special regex meta-characters without causing regex compilation errors', () => {
      expect(detectCategoryFromKeyword('swiggy (50% off) [promo]').category).toBe('Food');
      expect(detectCategoryFromKeyword('uber+ola ride').category).toBe('Travel');
      expect(detectCategoryFromKeyword('bill $100 paid? *yes*').category).toBe('Bills');
    });
  });
});
