import type { TalksResponse } from "../../index";

export const talksResponse: TalksResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
    total_count: 2,
    limit: 50,
  },
  data: [
    {
      id: 1,
      title: "Building Great CLIs",
      event: "NodeConf EU",
      date: "2024-11-05",
      location: "Kilkenny, Ireland",
      description: "How to build great CLI tools",
      youtube_url: "https://youtube.com/watch?v=abc123",
      slides_url: "https://slides.com/talk1",
      url: "https://elsmore.me/talks/1",
    },
    {
      id: 2,
      title: "Offline First Apps",
      event: "CouchDB Day",
      date: "2024-09-20",
      location: null,
      description: null,
      youtube_url: null,
      slides_url: null,
      url: "https://elsmore.me/talks/2",
    },
  ],
};

export const talksResponseSingle: TalksResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
    total_count: 1,
    limit: 50,
  },
  data: [
    {
      id: 1,
      title: "Building Great CLIs",
      event: "NodeConf EU",
      date: "2024-11-05",
      location: "Kilkenny, Ireland",
      description: "How to build great CLI tools",
      youtube_url: null,
      slides_url: null,
      url: "https://elsmore.me/talks/1",
    },
  ],
};

export const talksResponseEmpty: TalksResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
    total_count: 0,
    limit: 50,
  },
  data: [],
};
