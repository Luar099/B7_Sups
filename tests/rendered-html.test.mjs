import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("contains the complete B7 customer and admin experience", async () => {
  const [page, api, schema, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/api/b7/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  assert.match(page, /PAINEL ADMINISTRATIVO/);
  assert.match(page, /ÁREA DO CLIENTE/);
  assert.match(page, /AVALIAÇÃO CORPORAL COMPLETA/);
  assert.match(page, /FOOD_LIBRARY/);
  assert.match(page, /EXERCISE_LIBRARY/);
  assert.match(page, /measurementsJson/);
  assert.match(page, /PLANO PERSONALIZADO/);
  assert.match(page, /PROJETO DIAMANTE/);
  assert.match(api, /session\.role !== "admin"/);
  assert.match(api, /action === "checkout"/);
  assert.match(schema, /sqliteTable\("assessments"/);
  assert.match(css, /--black:#070707/);
});

test("uses persistent storage and dynamic social metadata", async () => {
  const [hosting, layout] = await Promise.all([
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /\/og\.png/);
});

