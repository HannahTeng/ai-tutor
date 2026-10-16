import React, { useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
export default function VoicePreview() {
  const ref = useRef<HTMLAudioElement>(null);
  useFocusEffect(
    useCallback(() => {
      const audio = ref.current;
      return () => {
        audio?.pause();
      };
    }, []),
  );
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ color: "#315B61", fontSize: 14 }}>
        课堂女声试听 · 预先配音，播放不调用模型
      </p>
      <audio
        ref={ref}
        aria-label="课堂女声试听"
        controls
        preload="none"
        src="/audio/voice-preview.mp3"
        style={{ maxWidth: "100%" }}
      />
    </div>
  );
}
