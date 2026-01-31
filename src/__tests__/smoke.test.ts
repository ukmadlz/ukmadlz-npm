import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import { execFile } from "node:child_process";
import path from "node:path";
import { socialResponse } from "./fixtures/social";
import { jobsResponse } from "./fixtures/jobs";
import { talksResponse } from "./fixtures/talks";
import { postsResponse } from "./fixtures/posts";

// ---------------------------------------------------------------------------
// Mock HTTP server
// ---------------------------------------------------------------------------

let server: http.Server;
let baseUrl: string;

function createMockServer(
  handler?: http.RequestListener,
): http.Server {
  const defaultHandler: http.RequestListener = (req, res) => {
    const routes: Record<string, unknown> = {
      "/social.json": socialResponse,
      "/jobs.json": jobsResponse,
      "/talks.json": talksResponse,
      "/posts.json": postsResponse,
    };

    const url = new URL(req.url!, `http://${req.headers.host}`);
    const data = routes[url.pathname];

    if (data) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  };

  return http.createServer(handler ?? defaultHandler);
}

function startServer(srv: http.Server): Promise<string> {
  return new Promise((resolve) => {
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address() as { port: number };
      resolve(`http://127.0.0.1:${addr.port}`);
    });
  });
}

function stopServer(srv: http.Server): Promise<void> {
  return new Promise((resolve) => {
    srv.close(() => resolve());
  });
}

beforeAll(async () => {
  server = createMockServer();
  baseUrl = await startServer(server);
});

afterAll(async () => {
  await stopServer(server);
});

// ---------------------------------------------------------------------------
// CLI runner helper
// ---------------------------------------------------------------------------

const cliPath = path.resolve(__dirname, "../../dist/index.js");

function runCli(
  args: string[] = [],
  envOverrides?: Record<string, string>,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const child = execFile(
      process.execPath,
      [cliPath, ...args],
      {
        env: {
          ...process.env,
          UKMADLZ_API_URL: baseUrl,
          ...envOverrides,
        },
        timeout: 10000,
      },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout ?? "",
          stderr: stderr ?? "",
          exitCode: error ? (error as any).code ?? 1 : 0,
        });
      },
    );
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("smoke tests", () => {
  // =========================================================================
  // Help commands (no network)
  // =========================================================================

  describe("help commands", () => {
    it("--help exits 0 and shows usage", async () => {
      const { stdout, exitCode } = await runCli(["--help"]);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Usage: ukmadlz [command]");
    });

    it("-h produces the same output as --help", async () => {
      const [helpResult, hResult] = await Promise.all([
        runCli(["--help"]),
        runCli(["-h"]),
      ]);
      expect(hResult.exitCode).toBe(0);
      expect(hResult.stdout).toBe(helpResult.stdout);
    });

    it("help subcommand produces the same output as --help", async () => {
      const [helpResult, subResult] = await Promise.all([
        runCli(["--help"]),
        runCli(["help"]),
      ]);
      expect(subResult.exitCode).toBe(0);
      expect(subResult.stdout).toBe(helpResult.stdout);
    });
  });

  // =========================================================================
  // Default / bio command
  // =========================================================================

  describe("default / bio command", () => {
    it("exits 0 and shows email from fixture", async () => {
      const { stdout, exitCode } = await runCli();
      expect(exitCode).toBe(0);
      expect(stdout).toContain(socialResponse.data.email);
    });

    it("shows social link names", async () => {
      const { stdout } = await runCli();
      for (const s of socialResponse.data.socials) {
        expect(stdout).toContain(s.name);
      }
    });

    it('shows "Currently:" line from fixture job', async () => {
      const { stdout } = await runCli();
      expect(stdout).toContain(
        `Currently: ${jobsResponse.data[0].title} at ${jobsResponse.data[0].company}`,
      );
    });
  });

  // =========================================================================
  // Jobs command
  // =========================================================================

  describe("jobs command", () => {
    it("exits 0 and shows job titles", async () => {
      const { stdout, exitCode } = await runCli(["jobs"]);
      expect(exitCode).toBe(0);
      for (const j of jobsResponse.data) {
        expect(stdout).toContain(j.title);
      }
    });

    it('shows "Present" for null end_date', async () => {
      const { stdout } = await runCli(["jobs"]);
      expect(stdout).toContain("Present");
    });
  });

  // =========================================================================
  // Talks command
  // =========================================================================

  describe("talks command", () => {
    it("exits 0 and shows talk titles", async () => {
      const { stdout, exitCode } = await runCli(["talks"]);
      expect(exitCode).toBe(0);
      for (const t of talksResponse.data) {
        expect(stdout).toContain(t.title);
      }
    });

    it("shows talk URLs", async () => {
      const { stdout } = await runCli(["talks"]);
      for (const t of talksResponse.data) {
        expect(stdout).toContain(t.url);
      }
    });
  });

  // =========================================================================
  // Posts command
  // =========================================================================

  describe("posts command", () => {
    it("exits 0 and shows post titles", async () => {
      const { stdout, exitCode } = await runCli(["posts"]);
      expect(exitCode).toBe(0);
      for (const p of postsResponse.data) {
        expect(stdout).toContain(p.title);
      }
    });

    it("shows post URLs", async () => {
      const { stdout } = await runCli(["posts"]);
      for (const p of postsResponse.data) {
        expect(stdout).toContain(p.url);
      }
    });
  });

  // =========================================================================
  // Error handling
  // =========================================================================

  describe("error handling", () => {
    it("exits non-zero when server returns 500", async () => {
      const errorServer = createMockServer((_req, res) => {
        res.writeHead(500);
        res.end("Internal Server Error");
      });
      const errorUrl = await startServer(errorServer);

      try {
        const { exitCode } = await runCli([], {
          UKMADLZ_API_URL: errorUrl,
        });
        expect(exitCode).not.toBe(0);
      } finally {
        await stopServer(errorServer);
      }
    });

    it("exits non-zero when server is unreachable", async () => {
      // Use a port that nothing is listening on
      const { exitCode } = await runCli([], {
        UKMADLZ_API_URL: "http://127.0.0.1:1",
      });
      expect(exitCode).not.toBe(0);
    });
  });
});
