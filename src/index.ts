#!/usr/bin/env node

import pkg from "../package.json";

const BASE_URL = "https://elsmore.me/api";

interface Social {
  name: string;
  url: string;
  icon: string;
}

interface SocialData {
  name: string;
  description: string;
  email: string;
  url: string;
  socials: Social[];
}

interface SocialResponse {
  meta: {
    generated_at: string;
    version: string;
  };
  data: SocialData;
}

interface Talk {
  id: number;
  title: string;
  event: string;
  date: string;
  location: string | null;
  description: string | null;
  youtube_url: string | null;
  slides_url: string | null;
  url: string;
}

interface TalksResponse {
  meta: { generated_at: string; version: string; total_count: number; limit: number };
  data: Talk[];
}

interface Post {
  id: number;
  title: string;
  published_date: string;
  excerpt: string | null;
  origin: string | null;
  url: string;
}

interface PostsResponse {
  meta: { generated_at: string; version: string; total_count: number; limit: number };
  data: Post[];
}

interface Job {
  company: string;
  title: string;
  logo: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean;
}

interface JobsResponse {
  meta: { generated_at: string; version: string };
  data: Job[];
}

async function showBio(): Promise<void> {
  const [socialRes, jobsRes] = await Promise.all([
    fetch(`${BASE_URL}/social.json`),
    fetch(`${BASE_URL}/jobs.json`),
  ]);
  const { data }: SocialResponse = await socialRes.json();
  const { data: jobs }: JobsResponse = await jobsRes.json();

  const currentJob = jobs.find((j) => j.current);
  const jobLine = currentJob
    ? `\n    Currently: ${currentJob.title} at ${currentJob.company}\n`
    : "";

  const theMeBit = `
    Mike Elsmore is available for hire for software development, MVPs, Developer Experience and Developer Relations related work.
${jobLine}
    For a day job he's usually talking about stuff, building stuff (occasionally SDKs), and trying share stuff.

    Mike hacks and speaks about topics such as ${pkg.keywords.join(", ")}.

    E-mail: <${data.email}>
    Website: <${data.url}>
${data.socials.map((s) => `    ${s.name}: <${s.url}>`).join("\n")}
    `;
  console.log(theMeBit);
}

async function showTalks(): Promise<void> {
  const res = await fetch(`${BASE_URL}/talks.json`);
  const { data }: TalksResponse = await res.json();

  const output = data
    .map((t) => `    ${t.title} — ${t.event} (${t.date})\n    ${t.url}`)
    .join("\n\n");
  console.log(output);
}

async function showJobs(): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs.json`);
  const { data }: JobsResponse = await res.json();

  const output = data
    .map((j) => {
      const end = j.end_date ?? "Present";
      return `    ${j.title} — ${j.company} (${j.start_date} to ${end})`;
    })
    .join("\n");
  console.log(output);
}

async function showPosts(): Promise<void> {
  const res = await fetch(`${BASE_URL}/posts.json`);
  const { data }: PostsResponse = await res.json();

  const output = data
    .map((p) => `    ${p.title} (${p.published_date})\n    ${p.url}`)
    .join("\n\n");
  console.log(output);
}

function showHelp(): void {
  console.log(`ukmadlz v${pkg.version}

Usage: ukmadlz [command]

Commands:
  (none)    Show bio and social links (default)
  jobs      List job history
  talks     List recent talks
  posts     List recent blog posts

Options:
  --help, -h    Show this help message`);
}

async function main(): Promise<void> {
  const command = process.argv[2];

  switch (command) {
    case "--help":
    case "-h":
    case "help":
      showHelp();
      break;
    case "jobs":
      await showJobs();
      break;
    case "talks":
      await showTalks();
      break;
    case "posts":
      await showPosts();
      break;
    default:
      await showBio();
      break;
  }
}

main();
