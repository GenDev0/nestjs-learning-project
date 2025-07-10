export interface PostInterface {
  id: number;
  title: string;
  content: string;
  authorName: string;
  tags?: string[];
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
