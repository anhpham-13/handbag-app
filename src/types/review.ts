export interface Review {
  id: string;
  handbagId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  helpful?: number;
}

export interface RatingGroup {
  stars: number;
  count: number;
  percentage: number;
}
