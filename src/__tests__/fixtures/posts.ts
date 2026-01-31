import type { PostsResponse } from "../../index";

export const postsResponse: PostsResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
    total_count: 2,
    limit: 50,
  },
  data: [
    {
      id: 1,
      title: "Getting Started with CouchDB",
      published_date: "2024-10-15",
      excerpt: "A beginner's guide to CouchDB",
      origin: "blog",
      url: "https://elsmore.me/posts/1",
    },
    {
      id: 2,
      title: "Why Offline First Matters",
      published_date: "2024-08-20",
      excerpt: null,
      origin: null,
      url: "https://elsmore.me/posts/2",
    },
  ],
};

export const postsResponseSingle: PostsResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
    total_count: 1,
    limit: 50,
  },
  data: [
    {
      id: 1,
      title: "Getting Started with CouchDB",
      published_date: "2024-10-15",
      excerpt: "A beginner's guide to CouchDB",
      origin: "blog",
      url: "https://elsmore.me/posts/1",
    },
  ],
};

export const postsResponseEmpty: PostsResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
    total_count: 0,
    limit: 50,
  },
  data: [],
};
