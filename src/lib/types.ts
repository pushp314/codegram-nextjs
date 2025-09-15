
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  github_url?: string;
  github_username?: string;
  github_id?: number;
  twitter_url?: string;
  website_url?: string;
  location?: string;
  created_at: string;
  followers_count: number;
  following_count: number;
  snippets_count: number;
  docs_count: number;
}

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  is_public: boolean;
  author: User;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  tags: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}
