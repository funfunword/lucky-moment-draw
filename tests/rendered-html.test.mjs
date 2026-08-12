import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the festive lucky draw experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /鸿运抽奖台/);
  assert.match(html, /鸿运当头/);
  assert.match(html, /幸运开席/);
  assert.match(html, /第 1 轮 · 本轮抽取 8 位幸运嘉宾/);
  assert.match(html, /开启第一份好运/);
  assert.match(html, /共 10 轮 51 个幸运席位/);
  assert.equal(
    [...html.matchAll(/aria-label="第\d+轮，已抽取0名，共\d+名"/g)].length,
    10,
  );
  assert.doesNotMatch(html, /短信|验证码|手机号|sign[ -]?in|log[ -]?in/i);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("keeps all ten rounds unique and the festive assets production-ready", async () => {
  const [page, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  const countsMatch = page.match(/const ROUND_COUNTS = \[([^\]]+)\]/);
  assert.ok(countsMatch);
  const counts = countsMatch[1].split(",").map((value) => Number(value.trim()));
  assert.deepEqual(counts, [8, 8, 6, 8, 7, 6, 2, 2, 2, 2]);
  assert.equal(counts.reduce((sum, value) => sum + value, 0), 51);
  assert.match(page, /!winners\.includes\(number\)/);
  assert.match(page, /roundIndex !== activeRound/);

  assert.match(css, /--red:\s*#d91f27/i);
  assert.match(css, /--gold:\s*#ffd044/i);
  assert.match(css, /\.lantern/);
  assert.match(css, /\.confetti/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /drizzle/);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/chatgpt-auth.ts", import.meta.url)));
});
