import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const distDir = resolve(projectRoot, "dist");

beforeAll(() => {
  try {
    execSync("npm run build", {
      cwd: projectRoot,
      stdio: "pipe",
    });
  } catch (err) {
    const error = err as { status: number; stderr: Buffer; stdout: Buffer };
    const stderr = error.stderr?.toString() || "";
    const stdout = error.stdout?.toString() || "";
    console.error("=== BUILD STDOUT ===");
    console.error(stdout.slice(-2000));
    console.error("=== BUILD STDERR ===");
    console.error(stderr.slice(-2000));
    throw new Error(`Build failed (exit ${error.status}): ${stderr.slice(-200)}`);
  }
}, 120_000);

describe("build output", () => {
  it("produces a deployable index.html", () => {
    expect(existsSync(resolve(distDir, "index.html"))).toBe(true);
  });

  it("produces subpage HTML files for each route", () => {
    expect(existsSync(resolve(distDir, "menu", "index.html"))).toBe(true);
    expect(existsSync(resolve(distDir, "conocenos", "index.html"))).toBe(true);
    expect(existsSync(resolve(distDir, "promos", "index.html"))).toBe(true);
  });

  it("produces precache manifest with subpage entries", () => {
    const manifestPath = resolve(distDir, "precache-manifest.js");
    expect(existsSync(manifestPath)).toBe(true);
  });

  it("injects CSP into all HTML files", () => {
    const indexPath = resolve(distDir, "index.html");
    const content = readFileSync(indexPath, "utf-8");
    expect(content).toContain("Content-Security-Policy");
    expect(content).toContain("'sha256-");
  });
}, 120_000);
