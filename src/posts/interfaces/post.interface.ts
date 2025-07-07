export interface Post {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PostFilters {
  author?: string;
  title?: string;
  content?: string;
  startDate?: Date;
  endDate?: Date;
}
