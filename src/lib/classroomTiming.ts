/** Video introduction is followed by its full source duration; other pages retain teaching dwell time. */
export function pageReadyToAdvance(
  kind: string,
  seconds: number,
  elapsed: number,
  narrationEnded: boolean,
  videoElapsed: number,
) {
  if (!narrationEnded) return false;
  return kind === "video" ? videoElapsed >= seconds : elapsed >= seconds;
}
