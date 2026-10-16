import test from "node:test";
import assert from "node:assert/strict";
import {
  appendGeneration,
  selectGeneration,
  initialData,
  safeData,
} from "../src/lib/domain.ts";
import { pageReadyToAdvance } from "../src/lib/classroomTiming.ts";
const original = {
  id: "test",
  band: "1-2",
  title: "test",
  description: "moon",
  drawing: [{ color: "red", points: [{ x: 1, y: 1 }] }],
  createdAt: new Date().toISOString(),
  feedback: "nice",
  reviewed: true,
};
const gen = (i) => ({
  id: String(i),
  style: "storybook",
  variant: "base",
  prompt: "moon",
  mode: "mock",
  createdAt: new Date().toISOString(),
});
test("generation preserves original and selected version through history limit and reload", () => {
  let w = selectGeneration(appendGeneration(original, gen(0)), "0");
  for (let i = 1; i < 8; i++) w = appendGeneration(w, gen(i));
  assert.ok(w.generations.length <= 4);
  assert.ok(w.generations.some((g) => g.id === "0"));
  assert.deepEqual(w.drawing, original.drawing);
  assert.deepEqual(
    safeData(JSON.parse(JSON.stringify({ ...initialData(), works: [w] })))
      .works[0],
    w,
  );
});
test("changing final image requires new review but choosing same image is idempotent", () => {
  const w = appendGeneration(original, gen(1));
  const selected = selectGeneration(w, "1");
  assert.equal(selected.reviewed, false);
  assert.equal(selected.feedback, "");
  assert.equal(selectGeneration(selected, "1"), selected);
  assert.equal(selectGeneration(w, "missing"), w);
  assert.throws(() =>
    safeData({
      ...initialData(),
      works: [{ ...w, selectedGenerationId: "missing" }],
    }),
  );
});
test("classroom never advances before narration and retains response/drawing time", () => {
  assert.equal(pageReadyToAdvance("talk", 60, 60, false, 0), false);
  assert.equal(pageReadyToAdvance("talk", 60, 60, true, 0), true);
  assert.equal(pageReadyToAdvance("work", 420, 419, true, 0), false);
  assert.equal(pageReadyToAdvance("work", 420, 420, true, 0), true);
  assert.equal(pageReadyToAdvance("response", 52, 51, true, 0), false);
});
test("source video receives its full duration after the spoken introduction", () => {
  assert.equal(pageReadyToAdvance("video", 192, 220, true, 191), false);
  assert.equal(pageReadyToAdvance("video", 192, 220, true, 192), true);
});
