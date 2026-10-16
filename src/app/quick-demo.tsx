import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Robot, Tag, Txt } from "../components/ui";
import { Drawing } from "../components/Drawing";
import WorkImage from "../components/WorkImage";
import Narration from "../components/Narration";
import { color as c } from "../components/theme";
import { classroomSlides, lesson01 } from "../data/content";
import { mockImage } from "../data/mockArt";
import {
  demoFeedback,
  quickPosition,
  quickSnapshot,
  quickStages,
  quickStageStart,
} from "../data/quickDemo";

const format = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
export default function QuickDemo() {
  const [duration, setDuration] = useState(240);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [timestamp, setTimestamp] = useState("2000-01-01T00:00:00.000Z");
  const [feedback, setFeedback] = useState(demoFeedback);
  const [notice, setNotice] = useState("");
  const [replay, setReplay] = useState(0);
  const { width } = useWindowDimensions();
  const p = quickPosition(elapsed, duration);
  const stage = quickStages[p.index];
  const snapshot = useMemo(
    () => quickSnapshot(elapsed, duration, timestamp, feedback),
    [elapsed, duration, timestamp, feedback],
  );
  const work = snapshot.works[0];
  const generations = work?.generations ?? [];
  const current = generations[generations.length - 1];
  const slideIndex = Math.min(16, Math.floor((p.local / p.length) * 17));
  useEffect(() => {
    if (!running || p.finished) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = (now - last) / 1000;
      last = now;
      setElapsed((v) => Math.min(duration, v + delta));
    }, 200);
    return () => clearInterval(timer);
  }, [running, duration, p.finished]);
  useFocusEffect(
    useCallback(
      () => () => {
        setRunning(false);
      },
      [],
    ),
  );
  const voiceError = useCallback((message: string) => {
    setRunning(false);
    setNotice(message);
  }, []);
  const voiceEnd = useCallback(() => {}, []);
  function restart(nextDuration = duration) {
    setRunning(false);
    setElapsed(0);
    setDuration(nextDuration);
    setFeedback(demoFeedback);
    setNotice("");
    setReplay((n) => n + 1);
    setTimestamp(new Date().toISOString());
  }
  function jump(index: number) {
    setElapsed(quickStageStart(index, duration));
    setReplay((n) => n + 1);
    setNotice("");
  }
  return (
    <SafeAreaView style={s.root}>
      <Narration
        key={`${p.index}:${replay}`}
        index={p.index}
        audioSrc={`/audio/quick-demo-${p.index + 1}.mp3`}
        text={stage.narration}
        playbackRate={duration === 180 ? 1.08 : 1}
        playing={running && !p.finished}
        onEnded={voiceEnd}
        onError={voiceError}
      />
      <View style={s.header}>
        <Button
          label="退出快速演示"
          secondary
          small
          onPress={() => {
            setRunning(false);
            router.replace("/demo");
          }}
        />
        <View style={{ flex: 1, minWidth: 190, gap: 3 }}>
          <Txt size={23} bold>
            一节课，从好奇到作品
          </Txt>
          <Txt size={12} color={c.muted}>
            录屏快速模式 · 独立演示数据 · 正常课堂仍为40分钟
          </Txt>
        </View>
        <Txt bold size={24}>
          {format(elapsed)} / {format(duration)}
        </Txt>
      </View>
      <View style={s.toolbar}>
        {[180, 240, 300].map((v) => (
          <Button
            key={v}
            label={`${duration === v ? "✓ " : ""}${v / 60}分钟`}
            small
            secondary
            disabled={running && !p.finished}
            onPress={() => restart(v)}
          />
        ))}
        <Button
          label={
            p.finished
              ? "演示已完成"
              : running
                ? "暂停演示"
                : elapsed
                  ? "继续演示"
                  : "开始自动演示"
          }
          disabled={p.finished}
          small
          onPress={() => {
            if (!elapsed) setTimestamp(new Date().toISOString());
            setNotice("");
            setRunning((v) => !v);
          }}
        />
        <Button label="从头重录" small secondary onPress={() => restart()} />
        <Button
          label="下一环节"
          small
          secondary
          disabled={p.index === 5}
          onPress={() => jump(p.index + 1)}
        />
      </View>
      <View style={s.timeline}>
        {quickStages.map((item, i) => (
          <Button
            key={item.id}
            label={`${i + 1}. ${item.title}`}
            small
            secondary={i !== p.index}
            onPress={() => jump(i)}
          />
        ))}
      </View>
      <View style={{ height: 4, backgroundColor: c.line }}>
        <View
          style={{
            height: 4,
            width: `${(elapsed / duration) * 100}%`,
            backgroundColor: c.teal,
          }}
        />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: width < 700 ? 16 : 28, gap: 18 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, gap: 8 }}>
            <Tag
              label={`${stage.role}视角 · ${p.finished ? "演示完成" : `本环节剩余 ${Math.ceil(p.length - p.local)}秒`}`}
            />
            <Txt size={27} bold>
              {stage.title}
            </Txt>
            <Txt color={c.muted} size={14}>
              {stage.text}
            </Txt>
          </View>
          <Robot size={width < 700 ? 65 : 90} />
        </View>
        {p.index === 0 ? (
          <View style={{ gap: 10 }}>
            <View
              style={{
                width: "100%",
                aspectRatio: 16 / 9,
                maxHeight: width > 1000 ? 470 : undefined,
                backgroundColor: "#FFF9ED",
                alignItems: "center",
              }}
            >
              <Image
                source={classroomSlides[slideIndex]}
                resizeMode="contain"
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Txt size={14} bold>
              课堂预览 {slideIndex + 1}/17 · {lesson01.slides[slideIndex].title}
            </Txt>
            <Txt size={12} color={c.muted}>
              录屏模式用原课程图卡缩时概览；科普原片不在这里播放，避免录屏卡顿。完整视频在正常课堂中播放。
            </Txt>
          </View>
        ) : (
          <View
            style={{ flexDirection: width >= 850 ? "row" : "column", gap: 24 }}
          >
            <View style={{ flex: 1, gap: 12 }}>
              <Txt size={19} bold>
                保留我的原稿
              </Txt>
              <View
                style={{
                  width: "100%",
                  maxWidth: p.index >= 4 ? 340 : 600,
                  alignSelf: "center",
                }}
              >
                <Drawing strokes={work.drawing} />
              </View>
              <Txt bold>{work.title}</Txt>
              <Txt size={16}>{work.description}</Txt>
              <Tag label="虚构示例作品 · 未上传" />
              {p.index >= 4 && (
                <View style={s.panel}>
                  <Txt bold size={20}>
                    课堂记录
                  </Txt>
                  <Txt size={15}>快速演示流程已完成课堂预览</Txt>
                  <Txt size={13} color={c.muted}>
                    本次演示 {format(elapsed)}，不计为40分钟学习记录。
                  </Txt>
                  <Txt size={14}>
                    原稿 1 件 · 图片版本 {generations.length} 个
                  </Txt>
                </View>
              )}
            </View>
            <View style={{ flex: 1, gap: 14 }}>
              <Txt size={19} bold>
                {p.index === 1
                  ? "把想法说清楚"
                  : p.index === 2
                    ? "AI帮我画成绘本"
                    : p.index === 3
                      ? "请加一个小熊朋友"
                      : p.index === 4
                        ? "老师看见的进步"
                        : "孩子的最终作品"}
              </Txt>
              {current ? (
                <>
                  <View
                    style={{
                      width: "100%",
                      maxWidth: p.index >= 4 ? 340 : 600,
                      alignSelf: "center",
                    }}
                  >
                    <WorkImage
                      label="快速演示AI生成图片"
                      source={mockImage(current)}
                    />
                  </View>
                  <Tag
                    label={`${current.variant === "friend" ? "已添加小熊朋友" : "绘本风格示例"} · Mock预制图`}
                  />
                </>
              ) : (
                <View
                  style={[
                    s.panel,
                    { minHeight: 180, justifyContent: "center" },
                  ]}
                >
                  <Txt size={22} bold>
                    {p.index === 1
                      ? "谁？在哪里？做什么？"
                      : "正在模拟生成图片…"}
                  </Txt>
                  <Txt color={c.muted}>
                    {p.index === 1
                      ? "小兔 · 想象中的月亮花园 · 给胡萝卜浇水"
                      : "即将展示预制绘本图，不调用模型API。"}
                  </Txt>
                </View>
              )}
              {p.index === 3 && (
                <Txt bold color={c.teal}>
                  {work.selectedGenerationId
                    ? "✓ 已选择加朋友版本，原稿和旧版本都保留"
                    : "正在对照前后版本，修改后由学生选择"}
                </Txt>
              )}
              {p.index === 4 && (
                <View style={s.panel}>
                  <Tag label="自动填写的示例点评" />
                  <TextInput
                    accessibilityLabel="快速演示老师点评"
                    value={feedback}
                    onChangeText={setFeedback}
                    multiline
                    maxLength={400}
                    editable={!running}
                    style={s.input}
                  />
                  <Txt size={14} color={c.teal}>
                    {work.reviewed
                      ? "✓ 示例点评已保存，下一环节家长可查看"
                      : "等待自动保存；暂停演示可编辑点评"}
                  </Txt>
                </View>
              )}
              {p.index === 5 && (
                <View style={s.panel}>
                  <Tag label="老师已回应 · 演示记录" />
                  <Txt bold>老师说</Txt>
                  <Txt>{work.feedback}</Txt>
                  <Txt size={13} color={c.muted}>
                    这就是刚才同一件作品和同一条点评。演示不写入已有学习记录。
                  </Txt>
                </View>
              )}
            </View>
          </View>
        )}
        {p.finished && (
          <View accessibilityRole="alert" style={s.panel}>
            <Txt size={23} bold>
              完整流程演示结束
            </Txt>
            <Txt>课堂 → 原稿 → AI出图 → 加朋友 → 老师点评 → 家长查看</Txt>
            <Txt size={14} color={c.muted}>
              可从头重录，或退出后进入正常40分钟课堂。
            </Txt>
          </View>
        )}
        {!!notice && (
          <View accessibilityRole="alert">
            <Txt color={c.red}>{notice}</Txt>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.paper },
  header: {
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "center",
  },
  toolbar: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeline: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  panel: { padding: 20, borderRadius: 16, backgroundColor: c.mint, gap: 12 },
  input: {
    minHeight: 100,
    padding: 14,
    borderRadius: 10,
    backgroundColor: c.white,
    color: c.ink,
    fontSize: 16,
    lineHeight: 25,
    borderWidth: 1,
    borderColor: c.line,
  },
});
