import { useEffect } from "react";
import * as Speech from "expo-speech";
import { lesson01 } from "../data/content";
export type NarrationProps = {
  index: number;
  audioSrc?: string;
  playbackRate?: number;
  text?: string;
  playing: boolean;
  onEnded: () => void;
  onError: (message: string) => void;
};
export default function Narration({
  index,
  text,
  playbackRate = 1,
  playing,
  onEnded,
  onError,
}: NarrationProps) {
  useEffect(() => {
    if (playing)
      Speech.speak(text ?? lesson01.slides[index].narration, {
        language: "zh-CN",
        rate: playbackRate,
        onDone: onEnded,
        onError: () => onError("设备朗读不可用，请使用Web版固定女声课堂。"),
      });
    return () => {
      void Speech.stop();
    };
  }, [index, text, playbackRate, playing, onEnded, onError]);
  return null;
}
