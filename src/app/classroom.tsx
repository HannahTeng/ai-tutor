import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Art, Button, Icon, Robot, Txt } from "../components/ui";
import { color as c } from "../components/theme";
import { useApp } from "../lib/store";
import { classroomSlides, lesson01 } from "../data/content";
import { stopSpeaking } from "../lib/speech";
import { fullScreen } from "../lib/platform";
import VideoStage from "../components/VideoStage";
import Narration from "../components/Narration";
import { pageReadyToAdvance } from "../lib/classroomTiming";

export default function Classroom() {
  const { data, finishClassroom, publish } = useApp();
  const [index, setIndex] = useState(0),
    [running, setRunning] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [pageElapsed, setPageElapsed] = useState(0),
    [videoElapsed, setVideoElapsed] = useState(0),
    [localVideo, setLocalVideo] = useState(false),
    [narrationEnded, setNarrationEnded] = useState(false),
    [replay, setReplay] = useState(0),
    [notice, setNotice] = useState(""),
    [notes, setNotes] = useState(false),
    [video, setVideo] = useState(false),
    [revealed, setRevealed] = useState(false),
    [hero, setHero] = useState("小兔"),
    [area, setArea] = useState({ width: 900, height: 550 });
  const { width } = useWindowDimensions();
  const small = width < 700;
  const slide = lesson01.slides[index];
  const source = lesson01.videos.find((v) => v.id === slide.videoId);
  const friend = hero === "小兔" ? "小熊" : "小兔";
  function replace(text: string) {
    return text.replaceAll("{hero}", hero).replaceAll("{friend}", friend);
  }
  useEffect(
    () => () => {
      void stopSpeaking();
    },
    [],
  );
  const change = useCallback((i: number) => {
    void stopSpeaking();
    setIndex(Math.max(0, Math.min(lesson01.slides.length - 1, i)));
    setPageElapsed(0);
    setVideoElapsed(0);
    setLocalVideo(false);
    setNarrationEnded(false);
    setNotice("");
    setVideo(false);
    setRevealed(false);
  }, []);
  const voiceEnded = useCallback(() => {
    setNarrationEnded(true);
    if (source) setVideo(true);
  }, [source]);
  const mediaError = useCallback((message: string) => {
    setRunning(false);
    setNotice(message);
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setElapsed((x) => x + 1);
      setPageElapsed((x) => x + 1);
      if (video) setVideoElapsed((x) => x + 1);
      if (slide.kind === "demo" && pageElapsed + 1 >= 8) setRevealed(true);
      if (
        !(source && localVideo) &&
        pageReadyToAdvance(
          slide.kind,
          slide.seconds,
          pageElapsed + 1,
          narrationEnded,
          videoElapsed + (video ? 1 : 0),
        )
      ) {
        if (index < lesson01.slides.length - 1) change(index + 1);
        else {
          setRunning(false);
          setNotice("本课播放结束。请现场老师确认课堂完成。");
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [
    running,
    source,
    narrationEnded,
    slide.kind,
    slide.seconds,
    pageElapsed,
    videoElapsed,
    index,
    change,
    localVideo,
    video,
  ]);
  const w = Math.min(area.width, (area.height * 16) / 9),
    h = (w * 9) / 16;
  const dynamic = slide.kind === "demo" || slide.kind === "choice";
  const isTeacher = data.role === "teacher" && data.band === "1-2";
  if (!isTeacher)
    return (
      <SafeAreaView style={s.gate}>
        <Robot />
        <Txt size={24} bold>
          第一课大屏课堂
        </Txt>
        <Txt>请从第一课演示导览切换为老师体验。</Txt>
        <Button
          label="打开第一课演示导览"
          onPress={() => router.replace("/demo")}
        />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={s.root}>
      <Narration
        key={`${index}:${replay}`}
        index={index}
        playing={running && !narrationEnded && !video}
        onEnded={voiceEnded}
        onError={mediaError}
      />
      <View style={[s.top, small && { padding: 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="退出课堂"
          onPress={() => router.replace("/demo")}
          style={s.exit}
        >
          <Icon name="arrow-back" size={20} color={c.white} />
          <Txt color={c.white} size={13}>
            演示导览
          </Txt>
        </Pressable>
        <Txt color="#C8DBD8" size={small ? 11 : 15}>
          第一课 · 约40分钟自动课堂
        </Txt>
        <Txt size={13} bold color={c.white}>
          实际 {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
          {String(elapsed % 60).padStart(2, "0")}
        </Txt>
      </View>
      <View style={s.chapters}>
        {lesson01.sections.map((section, i) => (
          <Pressable
            key={section.title}
            accessibilityRole="button"
            accessibilityLabel={`跳到${section.title}`}
            onPress={() => change([0, 2, 5, 8, 12, 15][i])}
            style={s.chapter}
          >
            <Txt size={small ? 10 : 12} color="#D3E4DF">
              {section.start}—{section.end}分 {section.title}
            </Txt>
          </Pressable>
        ))}
      </View>
      {!elapsed && !running && (
        <Txt
          size={12}
          color="#F2DEC0"
          style={{ paddingHorizontal: 22, paddingBottom: 8 }}
        >
          点击一次开始：固定女声、自动翻页与短片、回应和画画倒计时。可随时暂停；配音讲完后留出看图时间。
        </Txt>
      )}
      <View style={s.stage} onLayout={(e) => setArea(e.nativeEvent.layout)}>
        {video && source ? (
          <View
            style={{
              width: w,
              height: h,
              flexDirection: "row",
              gap: 16,
              padding: 15,
            }}
          >
            <VideoStage
              key={index}
              page={source.page}
              title={source.title}
              url={source.url}
              playing={running}
              autoPlay
              onLocalSelected={() => setLocalVideo(true)}
              onEnded={() => {
                if (running) change(index + 1);
              }}
            />
            <View
              style={{
                width: w * 0.18,
                justifyContent: "center",
                alignItems: "center",
                gap: 15,
              }}
            >
              <Robot size={w * 0.15} />
              <Txt color="#FFFFFF" size={small ? 12 : 18} bold>
                图灵老师
              </Txt>
              <Txt size={small ? 9 : 12} color="#C8DBD8">
                安静看一看
              </Txt>
            </View>
          </View>
        ) : dynamic ? (
          <View
            style={[s.demoStage, { width: w, height: h, padding: w * 0.04 }]}
          >
            <View style={{ flex: 1, paddingRight: w * 0.18 }}>
              <Txt size={Math.max(17, w * 0.034)} bold>
                {slide.title}
              </Txt>
              <Txt
                size={Math.max(11, w * 0.017)}
                color={c.teal}
                style={{ marginTop: 8 }}
              >
                {slide.kind === "choice"
                  ? "集体回应二 · 只选一次"
                  : "预制对话示例 · 未连接真实AI"}
              </Txt>
              {slide.kind === "choice" ? (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 18,
                    marginTop: w * 0.035,
                  }}
                >
                  {["小兔", "小熊"].map((name, i) => (
                    <Pressable
                      key={name}
                      accessibilityRole="button"
                      accessibilityLabel={`选择主角${name}`}
                      accessibilityState={{ selected: hero === name }}
                      onPress={() => setHero(name)}
                      style={[
                        s.heroChoice,
                        { borderColor: hero === name ? c.teal : c.line },
                      ]}
                    >
                      <Art name={i === 0 ? "rabbit" : "bear"} size={w * 0.12} />
                      <Txt bold size={Math.max(13, w * 0.024)}>
                        {name}
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <>
                  <View style={{ marginTop: w * 0.026, gap: 9 }}>
                    <Txt size={Math.max(10, w * 0.014)} bold color={c.teal}>
                      请求
                    </Txt>
                    <Txt size={Math.max(14, w * 0.023)}>
                      {replace(slide.prompt ?? "")}
                    </Txt>
                  </View>
                  <View style={{ marginTop: w * 0.023, gap: 9 }}>
                    <Txt size={Math.max(10, w * 0.014)} bold color={c.teal}>
                      示例回答
                    </Txt>
                    {revealed ? (
                      <Txt size={Math.max(13, w * 0.022)}>
                        {replace(slide.response ?? "")}
                      </Txt>
                    ) : (
                      <Button
                        label="展示示例回答"
                        small
                        onPress={() => setRevealed(true)}
                      />
                    )}
                  </View>
                </>
              )}
            </View>
            <View
              style={{
                position: "absolute",
                right: w * 0.025,
                bottom: h * 0.13,
              }}
            >
              <Robot size={w * 0.15} />
            </View>
            <Txt
              size={Math.max(10, w * 0.015)}
              color={c.muted}
              style={{ marginTop: 10 }}
            >
              {slide.caption}
            </Txt>
          </View>
        ) : (
          <View style={{ width: w, height: h }}>
            <Image
              source={classroomSlides[index]}
              style={{ width: w, height: h }}
              resizeMode="contain"
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: (w * (index === 0 ? 690 : 1050)) / 1280,
                top: (h * (index === 0 ? 150 : 432)) / 720,
                width: (w * (index === 0 ? 380 : 175)) / 1280,
                height: (w * (index === 0 ? 380 : 175)) / 1280,
                backgroundColor: "#FFF9ED",
              }}
            >
              <Robot size={(w * (index === 0 ? 380 : 175)) / 1280} />
            </View>
          </View>
        )}
      </View>
      <View style={s.caption}>
        <Txt color="#C8DBD8" size={small ? 11 : 13}>
          计划 {slide.time} · {slide.label}
          {` · ${running ? "自动播放中" : "已暂停"} · 本页剩余 ${Math.max(0, slide.seconds - (video ? videoElapsed : pageElapsed))}秒`}
        </Txt>
        {source && (
          <Button
            label={video ? "暂停并返回图卡" : "播放科普短片"}
            small
            secondary
            onPress={() => {
              void stopSpeaking();
              if (video) setRunning(false);
              setVideo((v) => !v);
              setNotice("");
            }}
          />
        )}
      </View>
      {source && (
        <Txt
          size={10}
          color="#B7CECA"
          style={{ paddingHorizontal: 22, paddingBottom: 5 }}
        >
          来源：{source.source}
          。原站按片长定时切页；若缓冲或被拦截，请暂停课堂并重播本页。本机视频按播放结束切页。
        </Txt>
      )}
      {!!notice && (
        <Txt
          color="#F2DEC0"
          size={12}
          style={{ paddingHorizontal: 22, paddingBottom: 6 }}
        >
          {notice}
        </Txt>
      )}
      {notes && (
        <View style={s.notes}>
          <Txt size={12} color="#DFE9E5">
            {slide.teacherNote}
          </Txt>
        </View>
      )}
      <View style={[s.controls, small && { padding: 12 }]}>
        <Button
          label="上一页"
          secondary
          small
          disabled={index === 0}
          onPress={() => change(index - 1)}
        />
        <Txt color={c.white} size={13}>
          {index + 1} / {lesson01.slides.length}
        </Txt>
        <Button
          label="下一页"
          small
          disabled={index === lesson01.slides.length - 1}
          onPress={() => change(index + 1)}
        />
        <Button
          label={running ? "暂停课堂" : elapsed ? "继续播放" : "开始连续播放"}
          secondary
          small
          onPress={() => setRunning((r) => !r)}
        />
        <Button
          label="重播本页"
          secondary
          small
          onPress={() => {
            change(index);
            setReplay((v) => v + 1);
            setRunning(true);
          }}
        />
        <Button
          label={notes ? "收起提示" : "教师提示"}
          secondary
          small
          onPress={() => setNotes((v) => !v)}
        />
        {Platform.OS === "web" && (
          <Button
            label="全屏"
            secondary
            small
            onPress={() => fullScreen().catch((e) => setNotice(e.message))}
          />
        )}
        {index === lesson01.slides.length - 1 && (
          <Button
            label="确认课堂完成"
            small
            onPress={() => {
              finishClassroom();
              publish();
              setRunning(false);
              void stopSpeaking();
              setNotice(
                "老师已标记本机课堂完成，作品任务已发布。可回演示导览继续保存作品；未填写小测成绩。",
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#173B42" },
  gate: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  top: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  exit: { flexDirection: "row", gap: 8, alignItems: "center", minHeight: 40 },
  chapters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  chapter: {
    padding: 8,
    borderRadius: 7,
    backgroundColor: "#234D54",
    minHeight: 34,
  },
  stage: {
    flex: 1,
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  caption: {
    paddingHorizontal: 22,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  notes: {
    marginHorizontal: 22,
    padding: 12,
    backgroundColor: "#234D54",
    borderRadius: 8,
  },
  demoStage: { backgroundColor: "#FFF9ED" },
  heroChoice: {
    borderWidth: 2,
    borderRadius: 14,
    alignItems: "center",
    padding: 10,
    gap: 6,
  },
});
