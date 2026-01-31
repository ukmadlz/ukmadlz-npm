import type { SocialResponse } from "../../index";

export const socialResponse: SocialResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
  },
  data: {
    name: "Mike Elsmore",
    description: "Developer Advocate",
    email: "mike@elsmore.me",
    url: "https://elsmore.me",
    socials: [
      { name: "GitHub", url: "https://github.com/ukmadlz", icon: "github" },
      { name: "Twitter", url: "https://twitter.com/ukmadlz", icon: "twitter" },
      { name: "LinkedIn", url: "https://linkedin.com/in/mikeelsmore", icon: "linkedin" },
    ],
  },
};

export const socialResponseEmptySocials: SocialResponse = {
  meta: {
    generated_at: "2024-01-15T12:00:00Z",
    version: "1.0",
  },
  data: {
    name: "Mike Elsmore",
    description: "Developer Advocate",
    email: "mike@elsmore.me",
    url: "https://elsmore.me",
    socials: [],
  },
};
