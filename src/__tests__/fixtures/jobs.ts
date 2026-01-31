import type { JobsResponse } from "../../index";

export const jobsResponse: JobsResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
  },
  data: [
    {
      company: "Acme Corp",
      title: "Senior Developer Advocate",
      logo: "https://example.com/acme.png",
      description: "DevRel work",
      start_date: "2023-01",
      end_date: null,
      current: true,
    },
    {
      company: "Previous Inc",
      title: "Software Engineer",
      logo: "https://example.com/prev.png",
      description: "Backend development",
      start_date: "2020-06",
      end_date: "2022-12",
      current: false,
    },
  ],
};

export const jobsResponseNoCurrent: JobsResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
  },
  data: [
    {
      company: "Previous Inc",
      title: "Software Engineer",
      logo: "https://example.com/prev.png",
      description: "Backend development",
      start_date: "2020-06",
      end_date: "2022-12",
      current: false,
    },
  ],
};

export const jobsResponseEmpty: JobsResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
  },
  data: [],
};
