import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Txt } from "./ui";
import type { VideoStageProps } from "./VideoStage";

export default function VideoStage({
  page,
  title,
  url,
  playing = true,
  autoPlay = false,
  onEnded,
  onLocalSelected,
}: VideoStageProps) {
  const [online, setOnline] = useState(autoPlay);
  const [local, setLocal] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const position = useRef(0);
  const [seek, setSeek] = useState(0);
  const objectUrl = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );
  useEffect(() => {
    if (local) {
      if (playing) void videoRef.current?.play().catch(() => {});
      else videoRef.current?.pause();
    }
    if (!playing) {
      setSeek(position.current);
      return;
    }
    const timer = setInterval(() => {
      position.current += 1;
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, local]);
  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View
        style={{
          flex: 1,
          minHeight: 150,
          backgroundColor: "#102F35",
          justifyContent: "center",
        }}
      >
        {local ? (
          <video
            ref={videoRef}
            src={local}
            autoPlay={autoPlay && playing}
            onEnded={onEnded}
            controls
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : online && playing ? (
          <iframe
            title={title}
            src={`https://player.bilibili.com/player.html?bvid=BV1134y1d72L&p=${page}&autoplay=${autoPlay ? 1 : 0}&danmaku=0&t=${seek}`}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ border: 0, width: "100%", height: "100%", minHeight: 180 }}
          />
        ) : (
          <View style={{ padding: 24, gap: 14 }}>
            <Txt color="#FFFFFF" size={24} bold>
              {!playing ? "课堂已暂停" : title}
            </Txt>
            <Txt color="#C8DBD8" size={14}>
              {!playing
                ? "继续播放后，原站视频会从本次计时位置恢复。若实际进度不同，请使用播放器调整或重播本页。"
                : "原站播放器需要网络。若自动播放被浏览器拦截，请点击播放器的播放按钮，并重播本页对齐计时。"}
            </Txt>
          </View>
        )}
      </View>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          color: "#D6E1DE",
          fontSize: 13,
        }}
      >
        {!online && !local && (
          <button onClick={() => setOnline(true)} style={buttonStyle}>
            加载原站播放器
          </button>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#B6E3CB", padding: 9 }}
        >
          在原站观看 ↗
        </a>
        <label style={buttonStyle}>
          选择本机视频
          <input
            aria-label="选择本机有许可的视频"
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file || !file.type.startsWith("video/")) return;
              if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
              const next = URL.createObjectURL(file);
              objectUrl.current = next;
              position.current = 0;
              onLocalSelected?.();
              setLocal(next);
              setOnline(false);
              e.target.value = "";
            }}
          />
        </label>
        <span>本机文件不上传，离开此页后需重新选择。</span>
      </div>
    </View>
  );
}
const buttonStyle: React.CSSProperties = {
  background: "#E4F0E9",
  color: "#173F49",
  border: 0,
  padding: "11px 14px",
  borderRadius: 9,
  cursor: "pointer",
  fontSize: 13,
};
