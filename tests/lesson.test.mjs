import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const lesson = JSON.parse(
  fs.readFileSync(new URL("../src/data/lesson01.json", import.meta.url)),
);
test("class plan totals 40 minutes with only two collective responses", () => {
  assert.equal(
    lesson.slides.reduce((n, slide) => n + slide.seconds, 0),
    40 * 60,
  );
  assert.equal(
    lesson.slides.filter((slide) => ["response", "choice"].includes(slide.kind))
      .length,
    2,
  );
  assert.equal(
    lesson.slides
      .filter((slide) => slide.kind === "work")
      .reduce((n, slide) => n + slide.seconds, 0),
    10 * 60,
  );
});
test("every video slot points to the intended episode and its time budget", () => {
  const slots = lesson.slides.filter((slide) => slide.kind === "video");
  assert.equal(slots.length, 3);
  for (const slide of slots) {
    const source = lesson.videos.find((video) => video.id === slide.videoId);
    assert.ok(source);
    assert.equal(source.seconds, slide.seconds);
    assert.equal(
      new URL(source.url).searchParams.get("p"),
      String(source.page),
    );
  }
  assert.equal(
    slots.reduce((n, slide) => n + slide.seconds, 0),
    560,
  );
});
