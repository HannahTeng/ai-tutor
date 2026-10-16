import test from "node:test";
import assert from "node:assert/strict";
import {
  initialData,
  saveProgress,
  safeData,
  quizPassed,
  completeClassroom,
} from "../src/lib/domain.ts";
test("cannot complete with skipped or incorrect quiz answers", () => {
  assert.equal(quizPassed({}), false);
  assert.equal(
    saveProgress(initialData(), "1-2", 1, 5, { 0: 0, 1: 0, 2: 1 }).progress[
      "1-2:1"
    ].completed,
    false,
  );
});
test("teacher can record the full class without inventing quiz answers", () => {
  const a = completeClassroom({ ...initialData(), role: "teacher" });
  assert.equal(a.progress["1-2:1"].completionSource, "classroom");
  assert.deepEqual(a.progress["1-2:1"].answers, {});
  assert.deepEqual(safeData(JSON.parse(JSON.stringify(a))), a);
  assert.equal(completeClassroom(initialData()).progress["1-2:1"], undefined);
  assert.equal(
    completeClassroom({ ...initialData(), role: "teacher", band: "3-4" })
      .progress["3-4:1"],
    undefined,
  );
});
test("completion requires the actual full lesson and all correct answers", () => {
  const a = { 0: 0, 1: 1, 2: 1 };
  assert.equal(
    saveProgress(initialData(), "1-2", 1, 5, a).progress["1-2:1"].completed,
    true,
  );
  assert.equal(
    saveProgress(initialData(), "3-4", 1, 5, a).progress["3-4:1"].completed,
    false,
  );
});
test("reviewing a completed lesson preserves its completion evidence", () => {
  const a = saveProgress(initialData(), "1-2", 1, 5, { 0: 0, 1: 1, 2: 1 });
  const b = saveProgress(a, "1-2", 1, 0);
  assert.equal(b.progress["1-2:1"].completed, true);
  assert.equal(b.progress["1-2:1"].step, 5);
});
test("moving back does not erase the furthest learning step", () => {
  const a = saveProgress(initialData(), "1-2", 1, 3);
  assert.equal(saveProgress(a, "1-2", 1, 1).progress["1-2:1"].step, 3);
});
test("device records round-trip and grade progress stays separate", () => {
  const a = saveProgress(initialData(), "1-2", 1, 3);
  assert.deepEqual(safeData(JSON.parse(JSON.stringify(a))), a);
  assert.equal(a.progress["3-4:1"], undefined);
});
test("reject corrupted or forged completed local records", () => {
  assert.throws(() => safeData({ version: 4 }));
  const a = initialData();
  a.progress["1-2:1"] = { step: 5, answers: {}, completed: true };
  assert.throws(() => safeData(a));
});
