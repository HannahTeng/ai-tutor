import test from "node:test";
import assert from "node:assert/strict";
import {
  demoFeedback,
  quickPosition,
  quickSnapshot,
  quickStageStart,
  quickStages,
} from "../src/data/quickDemo.ts";
import { initialData, safeData } from "../src/lib/domain.ts";
const stamp = "2026-10-16T12:00:00.000Z";
for (const duration of [180, 240, 300]) {
  test(`${duration}s demo visits all six stages and ends at its selected length`, () => {
    assert.equal(
      quickStages.reduce((n, s) => n + s.seconds, 0),
      240,
    );
    for (let i = 0; i < 6; i++)
      assert.equal(
        quickPosition(quickStageStart(i, duration), duration).index,
        i,
      );
    assert.equal(quickPosition(duration - 0.01, duration).finished, false);
    assert.equal(quickPosition(duration, duration).finished, true);
    assert.equal(
      quickPosition(duration + 100, duration).local,
      quickPosition(duration, duration).length,
    );
  });
}
test("demo evolves original, generation, revision, selected result and same teacher feedback", () => {
  const original = quickSnapshot(115, 240, stamp).works[0];
  assert.equal(original.generations, undefined);
  const generated = quickSnapshot(140, 240, stamp).works[0];
  assert.equal(generated.generations[0].variant, "base");
  const revised = quickSnapshot(166, 240, stamp).works[0];
  assert.equal(revised.generations.length, 2);
  assert.equal(revised.selectedGenerationId, "demo-friend");
  assert.deepEqual(revised.drawing, original.drawing);
  assert.equal(quickSnapshot(199, 240, stamp).works[0].reviewed, true);
  const parent = quickSnapshot(240, 240, stamp, "我的自定义点评");
  assert.equal(parent.role, "parent");
  assert.equal(parent.works[0].feedback, "我的自定义点评");
  assert.equal(parent.works[0].id, original.id);
  assert.deepEqual(safeData(parent), parent);
});
test("quick snapshots are isolated from normal data, deterministic and restartable", () => {
  const real = initialData();
  const saved = JSON.stringify(real);
  const a = quickSnapshot(240, 240, stamp);
  a.works[0].title = "mutated";
  assert.equal(JSON.stringify(real), saved);
  assert.notEqual(quickSnapshot(240, 240, stamp).works[0].title, "mutated");
  assert.deepEqual(quickSnapshot(0, 240, stamp).works, []);
  assert.equal(quickSnapshot(0, 240, stamp).progress["1-2:1"], undefined);
  assert.equal(quickSnapshot(240, 240, stamp).works[0].feedback, demoFeedback);
});
