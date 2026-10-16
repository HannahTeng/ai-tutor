import React, { useEffect, useRef } from "react";
import type { NarrationProps } from "./Narration";

// A single pre-rendered female voice, independent of the device's voice list.
export default function Narration({
  index,
  audioSrc,
  playbackRate = 1,
  playing,
  onEnded,
  onError,
}: NarrationProps) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    let active = true;
    audio.playbackRate = playbackRate;
    if (playing && !audio.ended) {
      void audio.play().catch((error: Error) => {
        if (active && error.name !== "AbortError")
          onError("配音未能播放，课堂已暂停。请检查声音后点击继续播放。");
      });
    } else audio.pause();
    return () => {
      active = false;
      audio.pause();
    };
  }, [index, playing, onError, playbackRate]);
  return (
    <audio
      key={index}
      ref={ref}
      src={
        audioSrc ?? `/audio/lesson-01-${String(index + 1).padStart(2, "0")}.mp3`
      }
      preload="auto"
      onEnded={onEnded}
      onError={() =>
        onError("配音文件暂时无法读取，课堂已暂停，请检查网络后重播本页。")
      }
      aria-label="图灵老师中文女声配音"
    />
  );
}
