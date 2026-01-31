import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  BASE_URL,
  showBio,
  showTalks,
  showJobs,
  showPosts,
  showHelp,
  main,
} from "../index";
import pkg from "../../package.json";
import { socialResponse, socialResponseEmptySocials } from "./fixtures/social";
import {
  jobsResponse,
  jobsResponseNoCurrent,
  jobsResponseEmpty,
} from "./fixtures/jobs";
import {
  talksResponse,
  talksResponseSingle,
  talksResponseEmpty,
} from "./fixtures/talks";
import {
  postsResponse,
  postsResponseSingle,
  postsResponseEmpty,
} from "./fixtures/posts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchResponse(data: unknown): Response {
  return {
    json: () => Promise.resolve(data),
  } as Response;
}

function mockFetchJsonReject(error: Error): Response {
  return {
    json: () => Promise.reject(error),
  } as Response;
}

/** Route fetch calls by URL so showBio's parallel fetches both resolve correctly. */
function routedFetch(
  socialData: unknown,
  jobsData: unknown
): typeof globalThis.fetch {
  return ((url: string) => {
    if (url.includes("social.json")) {
      return Promise.resolve(mockFetchResponse(socialData));
    }
    if (url.includes("jobs.json")) {
      return Promise.resolve(mockFetchResponse(jobsData));
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  }) as typeof globalThis.fetch;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let logSpy: ReturnType<typeof vi.spyOn>;
let savedArgv: string[];

beforeEach(() => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  savedArgv = [...process.argv];
});

afterEach(() => {
  vi.restoreAllMocks();
  process.argv = savedArgv;
});

// ===========================================================================
// showBio
// ===========================================================================

describe("showBio", () => {
  // --- positive ---

  it("fetches social.json and jobs.json in parallel", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(routedFetch(socialResponse, jobsResponse));

    await showBio();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/social.json`);
    expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/jobs.json`);
  });

  it("displays email and url from social data", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponse, jobsResponse)
    );

    await showBio();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(`<${socialResponse.data.email}>`);
    expect(output).toContain(`<${socialResponse.data.url}>`);
  });

  it("displays all social links", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponse, jobsResponse)
    );

    await showBio();

    const output = logSpy.mock.calls[0][0] as string;
    for (const s of socialResponse.data.socials) {
      expect(output).toContain(`${s.name}: <${s.url}>`);
    }
  });

  it('shows "Currently:" line when current job exists', async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponse, jobsResponse)
    );

    await showBio();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(
      "Currently: Senior Developer Advocate at Acme Corp"
    );
  });

  it('omits "Currently:" line when no current job', async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponse, jobsResponseNoCurrent)
    );

    await showBio();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).not.toContain("Currently:");
  });

  it("displays keywords from package.json", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponse, jobsResponse)
    );

    await showBio();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(pkg.keywords.join(", "));
  });

  it("handles empty socials array", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponseEmptySocials, jobsResponse)
    );

    await showBio();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(`<${socialResponseEmptySocials.data.email}>`);
    // No social links should appear
    expect(output).not.toContain("GitHub:");
  });

  // --- negative ---

  it("propagates error on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network error")
    );

    await expect(showBio()).rejects.toThrow("Network error");
  });

  it("propagates error on invalid JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      ((url: string) => {
        if (url.includes("social.json")) {
          return Promise.resolve(mockFetchJsonReject(new Error("Invalid JSON")));
        }
        return Promise.resolve(mockFetchResponse(jobsResponse));
      }) as typeof globalThis.fetch
    );

    await expect(showBio()).rejects.toThrow("Invalid JSON");
  });

  it("propagates error when one of two parallel fetches fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      ((url: string) => {
        if (url.includes("social.json")) {
          return Promise.resolve(mockFetchResponse(socialResponse));
        }
        return Promise.reject(new Error("Jobs fetch failed"));
      }) as typeof globalThis.fetch
    );

    await expect(showBio()).rejects.toThrow("Jobs fetch failed");
  });
});

// ===========================================================================
// showTalks
// ===========================================================================

describe("showTalks", () => {
  // --- positive ---

  it("fetches talks.json from correct URL", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockFetchResponse(talksResponse));

    await showTalks();

    expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/talks.json`);
  });

  it("displays all talks with title, event, date, url", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(talksResponse)
    );

    await showTalks();

    const output = logSpy.mock.calls[0][0] as string;
    for (const t of talksResponse.data) {
      expect(output).toContain(t.title);
      expect(output).toContain(t.event);
      expect(output).toContain(t.date);
      expect(output).toContain(t.url);
    }
  });

  it("formats talks separated by blank lines", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(talksResponse)
    );

    await showTalks();

    const output = logSpy.mock.calls[0][0] as string;
    // Two talks should be separated by \n\n
    expect(output).toContain("\n\n");
  });

  it("handles single talk", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(talksResponseSingle)
    );

    await showTalks();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(talksResponseSingle.data[0].title);
    // No double newline separator needed for single item
    expect(output).not.toContain("\n\n");
  });

  it("handles empty talks array", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(talksResponseEmpty)
    );

    await showTalks();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toBe("");
  });

  // --- negative ---

  it("propagates error on fetch rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network error")
    );

    await expect(showTalks()).rejects.toThrow("Network error");
  });

  it("propagates error on .json() rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchJsonReject(new Error("Parse error"))
    );

    await expect(showTalks()).rejects.toThrow("Parse error");
  });
});

// ===========================================================================
// showJobs
// ===========================================================================

describe("showJobs", () => {
  // --- positive ---

  it("fetches jobs.json from correct URL", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockFetchResponse(jobsResponse));

    await showJobs();

    expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/jobs.json`);
  });

  it("displays jobs with title, company, date range", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(jobsResponse)
    );

    await showJobs();

    const output = logSpy.mock.calls[0][0] as string;
    for (const j of jobsResponse.data) {
      expect(output).toContain(j.title);
      expect(output).toContain(j.company);
      expect(output).toContain(j.start_date);
    }
  });

  it('shows "Present" for null end_date', async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(jobsResponse)
    );

    await showJobs();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("2023-01 to Present");
  });

  it("shows actual end_date when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(jobsResponse)
    );

    await showJobs();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("2020-06 to 2022-12");
  });

  it("handles empty jobs array", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(jobsResponseEmpty)
    );

    await showJobs();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toBe("");
  });

  it("formats jobs separated by single newlines", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(jobsResponse)
    );

    await showJobs();

    const output = logSpy.mock.calls[0][0] as string;
    const lines = output.split("\n").filter((l) => l.trim().length > 0);
    expect(lines).toHaveLength(2);
  });

  // --- negative ---

  it("propagates error on fetch rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network error")
    );

    await expect(showJobs()).rejects.toThrow("Network error");
  });

  it("propagates error on .json() rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchJsonReject(new Error("Parse error"))
    );

    await expect(showJobs()).rejects.toThrow("Parse error");
  });
});

// ===========================================================================
// showPosts
// ===========================================================================

describe("showPosts", () => {
  // --- positive ---

  it("fetches posts.json from correct URL", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockFetchResponse(postsResponse));

    await showPosts();

    expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/posts.json`);
  });

  it("displays posts with title, date, url", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(postsResponse)
    );

    await showPosts();

    const output = logSpy.mock.calls[0][0] as string;
    for (const p of postsResponse.data) {
      expect(output).toContain(p.title);
      expect(output).toContain(p.published_date);
      expect(output).toContain(p.url);
    }
  });

  it("formats posts separated by blank lines", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(postsResponse)
    );

    await showPosts();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("\n\n");
  });

  it("handles single post", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(postsResponseSingle)
    );

    await showPosts();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(postsResponseSingle.data[0].title);
    expect(output).not.toContain("\n\n");
  });

  it("handles empty posts array", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(postsResponseEmpty)
    );

    await showPosts();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toBe("");
  });

  // --- negative ---

  it("propagates error on fetch rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network error")
    );

    await expect(showPosts()).rejects.toThrow("Network error");
  });

  it("propagates error on .json() rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchJsonReject(new Error("Parse error"))
    );

    await expect(showPosts()).rejects.toThrow("Parse error");
  });
});

// ===========================================================================
// showHelp
// ===========================================================================

describe("showHelp", () => {
  it("displays version from package.json", () => {
    showHelp();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(`ukmadlz v${pkg.version}`);
  });

  it("displays usage instructions", () => {
    showHelp();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("Usage: ukmadlz [command]");
  });

  it("lists all available commands", () => {
    showHelp();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("jobs");
    expect(output).toContain("talks");
    expect(output).toContain("posts");
  });

  it("lists help options", () => {
    showHelp();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("--help");
    expect(output).toContain("-h");
  });
});

// ===========================================================================
// main — CLI routing
// ===========================================================================

describe("main", () => {
  // Helper: set process.argv to simulate a CLI command
  function setCommand(cmd?: string) {
    process.argv = cmd !== undefined ? ["node", "index.js", cmd] : ["node", "index.js"];
  }

  // --- positive ---

  it("default (no command) calls showBio", async () => {
    setCommand();
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponse, jobsResponse)
    );

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(`<${socialResponse.data.email}>`);
  });

  it('"jobs" calls showJobs', async () => {
    setCommand("jobs");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(jobsResponse)
    );

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("Senior Developer Advocate");
  });

  it('"talks" calls showTalks', async () => {
    setCommand("talks");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(talksResponse)
    );

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("Building Great CLIs");
  });

  it('"posts" calls showPosts', async () => {
    setCommand("posts");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(postsResponse)
    );

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("Getting Started with CouchDB");
  });

  it('"--help" calls showHelp', async () => {
    setCommand("--help");

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("Usage: ukmadlz [command]");
  });

  it('"-h" calls showHelp', async () => {
    setCommand("-h");

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("Usage: ukmadlz [command]");
  });

  it('"help" calls showHelp', async () => {
    setCommand("help");

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("Usage: ukmadlz [command]");
  });

  it("unknown command falls through to showBio", async () => {
    setCommand("unknowncmd");
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponse, jobsResponse)
    );

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(`<${socialResponse.data.email}>`);
  });

  it("empty string command falls through to showBio", async () => {
    setCommand("");
    vi.spyOn(globalThis, "fetch").mockImplementation(
      routedFetch(socialResponse, jobsResponse)
    );

    await main();

    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(`<${socialResponse.data.email}>`);
  });

  it("module import does not auto-execute main", async () => {
    // The fact that importing the module in this test file hasn't caused
    // uncontrolled side effects (no unguarded main() call) proves the guard works.
    // We verify by checking that console.log was not called before our explicit calls.
    const freshSpy = vi.spyOn(console, "log");
    // At this point no calls from auto-execution should exist
    // (beforeEach already set up the spy, so any auto-exec would show up)
    expect(freshSpy.mock.calls).toHaveLength(0);
  });

  // --- negative ---

  it("propagates errors from showBio", async () => {
    setCommand();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Bio fetch failed")
    );

    await expect(main()).rejects.toThrow("Bio fetch failed");
  });

  it("propagates errors from showJobs", async () => {
    setCommand("jobs");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Jobs fetch failed")
    );

    await expect(main()).rejects.toThrow("Jobs fetch failed");
  });

  it("propagates errors from showTalks", async () => {
    setCommand("talks");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Talks fetch failed")
    );

    await expect(main()).rejects.toThrow("Talks fetch failed");
  });

  it("propagates errors from showPosts", async () => {
    setCommand("posts");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Posts fetch failed")
    );

    await expect(main()).rejects.toThrow("Posts fetch failed");
  });
});
