
import type { User, Snippet } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'alexdev',
    email: 'alex@example.com',
    full_name: 'Alex Johnson',
    bio: 'Frontend developer passionate about React and beautiful UI components. Building the future one component at a time.',
    avatar_url: 'https://picsum.photos/seed/alex/64/64',
    github_url: 'https://github.com/alexdev',
    github_username: 'alexdev',
    github_id: 12345,
    twitter_url: 'https://twitter.com/alexdev',
    location: 'San Francisco, CA',
    created_at: '2024-01-15T10:30:00Z',
    followers_count: 1234,
    following_count: 567,
    snippets_count: 89,
    docs_count: 23
  },
  {
    id: '2',
    username: 'sarah_ui',
    email: 'sarah@example.com',
    full_name: 'Sarah Chen',
    bio: 'UI/UX designer & React developer. Love creating beautiful, accessible components with Tailwind CSS.',
    avatar_url: 'https://picsum.photos/seed/sarah/64/64',
    github_url: 'https://github.com/sarahui',
    github_username: 'sarahui',
    github_id: 67890,
    location: 'New York, NY',
    created_at: '2024-02-20T14:15:00Z',
    followers_count: 892,
    following_count: 234,
    snippets_count: 156,
    docs_count: 45
  },
  {
    id: '3',
    username: 'mike_frontend',
    email: 'mike@example.com',
    full_name: 'Mike Rodriguez',
    bio: 'Frontend wizard specializing in React, Vue, and modern CSS. Design systems advocate.',
    avatar_url: 'https://picsum.photos/seed/mike/64/64',
    website_url: 'https://mikerodriguez.dev',
    github_url: 'https://github.com/mikefrontend',
    github_username: 'mikefrontend',
    github_id: 11111,
    location: 'Austin, TX',
    created_at: '2024-03-10T09:45:00Z',
    followers_count: 2156,
    following_count: 445,
    snippets_count: 234,
    docs_count: 67
  }
];

// Mock Snippets
export const mockSnippets: Snippet[] = [
  {
    id: '1',
    title: 'Beautiful Gradient Button Component',
    description: 'A stunning gradient button with hover effects and multiple variants using Tailwind CSS.',
    code: `<button class="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 group">
  <span class="absolute top-0 right-0 w-8 h-8 -mt-1 -mr-1 transition-all duration-1000 ease-in-out bg-white rounded-full group-hover:w-full group-hover:h-full opacity-10"></span>
  <span class="relative">Get Started</span>
</button>

<div class="m-4" />

<!-- Variant with icon -->
<button class="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 group">
  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
  </svg>
  <span class="relative">Add Item</span>
</button>`,
    language: 'html',
    is_public: true,
    author: mockUsers[0],
    created_at: '2024-06-28T10:30:00Z',
    updated_at: '2024-06-28T10:30:00Z',
    likes_count: 142,
    comments_count: 18,
    views_count: 834,
    tags: ['button', 'gradient', 'tailwind', 'ui', 'component'],
    isLiked: false,
    isBookmarked: true
  },
  {
    id: '2',
    title: 'Custom React Hook for Fetching Data',
    description: 'A reusable React hook for fetching data with loading and error states.',
    code: `import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [url]);

  return { data, loading, error };
}`,
    language: 'jsx',
    is_public: true,
    author: mockUsers[1],
    created_at: '2024-07-12T14:00:00Z',
    updated_at: '2024-07-12T14:00:00Z',
    likes_count: 302,
    comments_count: 45,
    views_count: 2100,
    tags: ['react', 'hooks', 'fetch', 'data', 'javascript'],
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: '3',
    title: 'Responsive Navigation Menu',
    description: 'A beautiful responsive navigation menu with mobile hamburger toggle using pure HTML and Tailwind CSS.',
    code: `<nav class="bg-card shadow-lg p-4 rounded-lg">
  <div class="w-full mx-auto">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg"></div>
        <span class="text-xl font-bold text-foreground">Brand</span>
      </div>
      
      <div class="hidden md:flex items-center space-x-8">
        <a href="#" class="text-muted-foreground hover:text-primary font-medium transition-colors">Home</a>
        <a href="#" class="text-muted-foreground hover:text-primary font-medium transition-colors">About</a>
        <a href="#" class="text-muted-foreground hover:text-primary font-medium transition-colors">Services</a>
        <button class="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200">
          Get Started
        </button>
      </div>
      
      <div class="md:hidden">
        <button id="mobile-menu-button" class="text-foreground hover:text-primary focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</nav>`,
    language: 'html',
    is_public: true,
    author: mockUsers[2],
    created_at: '2024-06-26T09:20:00Z',
    updated_at: '2024-06-26T09:20:00Z',
    likes_count: 156,
    comments_count: 24,
    views_count: 1023,
    tags: ['navigation', 'responsive', 'menu', 'tailwind', 'mobile'],
    isLiked: false,
    isBookmarked: true
  }
];
