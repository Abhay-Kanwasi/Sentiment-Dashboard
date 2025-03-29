export interface Review {
    review: string;
    sentiment: 'POSITIVE' | 'NEGATIVE';
    confidence: number;
  }
  
  export interface AnalysisResults {
    summary: {
      positive_count: number;
      negative_count: number;
      positive_avg_confidence: number;
      negative_avg_confidence: number;
      total_reviews: number;
    };
    reviews: Review[];
  }