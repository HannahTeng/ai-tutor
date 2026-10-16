import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import {
  Art,
  Button,
  Empty,
  Icon,
  Robot,
  SectionTitle,
  Shell,
  Tag,
  Txt,
} from "../components/ui";
import { color as c } from "../components/theme";
import { useApp } from "../lib/store";
import { bandNames, completion, formatDate, progressKey } from "../lib/domain";
import { courses, lessonArt } from "../data/content";

export default function Home() {
  const { data, publish, unpublish } = useApp();
  const { width } = useWindowDimensions();
  const desktop = width >= 1250;
  const small = width < 650;
  const list = courses[data.band];
  const progress = data.progress[progressKey(data.band, 1)];
  const works = data.works.filter((w) => w.band === data.band);
  const task = data.assignment?.band === data.band ? data.assignment : null;
  const full = data.band === "1-2";
  const isStudent = data.role === "student";
  const isTeacher = data.role === "teacher";
  async function report() {
    await Share.share({
      message: `图灵AI学伴 学习记录\n学段：${bandNames[data.band]}\n第一课进度：${completion(progress)}%\n完成依据：${progress?.completionSource === "classroom" ? "老师在本机确认课堂完成，未记录小测成绩" : progress?.completed ? "课后练习三题均已答对" : "尚未完成"}\n保存作品：${works.length}件\n${works.map((w) => `${w.title}：${w.reviewed ? w.feedback : "等待老师回应"}`).join("\n")}\n此为当前设备的体验记录。`,
    });
  }
  return (
    <Shell
      title={
        isStudent
          ? "你好，小小探索员"
          : isTeacher
            ? "今天，一起开启新发现"
            : "看见每一次小发现"
      }
      subtitle={
        isStudent
          ? "从一个问题开始，认识AI，也表达自己。"
          : isTeacher
            ? "一套课程，一个课堂。准备好，就可以开始。"
            : "这里展示当前设备上真实产生的学习与作品记录。"
      }
    >
      <View style={{ marginBottom: 22, alignItems: "flex-start" }}>
        <Button
          label="第一课演示导览"
          icon="play-circle-outline"
          small
          secondary
          onPress={() => router.push("/demo")}
        />
      </View>
      {isStudent ? (
        <>
          <View style={[s.mainRow, !desktop && { flexDirection: "column" }]}>
            <View
              style={[
                s.hero,
                { flex: desktop ? 2.1 : undefined },
                small && { minHeight: 360, padding: 25 },
              ]}
            >
              <View
                style={{
                  zIndex: 1,
                  alignItems: "flex-start",
                  maxWidth: small ? "100%" : "66%",
                }}
              >
                <Tag label={`${bandNames[data.band]} · AI探索课`} />
                <Txt
                  size={small ? 29 : 36}
                  bold
                  style={{ marginTop: 22, lineHeight: small ? 43 : 52 }}
                >
                  {full
                    ? "今天，认识一个\n新朋友。"
                    : "带着好奇，\n开启你的探索。"}
                </Txt>
                <Txt
                  size={14}
                  color={c.muted}
                  style={{ marginTop: 13, maxWidth: small ? 180 : 360 }}
                >
                  {full
                    ? "图灵老师准备好了。\n看科普、听故事，画出你的想法。"
                    : "16个主题，从认识AI到完成自己的创作。"}
                </Txt>
                <Button
                  label={
                    full
                      ? progress?.step
                        ? "继续第一课"
                        : "开始第一课"
                      : "查看课程地图"
                  }
                  icon="play"
                  onPress={() => router.push(full ? "/courses/1" : "/courses")}
                  style={{ marginTop: 25 }}
                />
              </View>
              <View
                pointerEvents="none"
                style={[
                  s.heroArt,
                  small && { right: 8, bottom: 23, width: 143, height: 195 },
                ]}
              >
                <View style={[s.orbit, small && { width: 142, height: 142 }]} />
                <Robot size={small ? 127 : 180} />
                <Art
                  name="bulb"
                  size={small ? 37 : 48}
                  style={{
                    position: "absolute",
                    right: 2,
                    top: 0,
                    transform: [{ rotate: "14deg" }],
                  }}
                />
              </View>
            </View>
            <View style={[s.journey, { flex: desktop ? 1 : undefined }]}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Txt size={17} bold>
                  我的探索足迹
                </Txt>
                <Icon name="leaf-outline" color={c.teal} />
              </View>
              <View style={s.progressNumber}>
                <Txt size={46} bold>
                  {progress?.completed ? "1" : "0"}
                </Txt>
                <Txt size={14} color={c.muted} style={{ marginBottom: 10 }}>
                  课已完成
                </Txt>
              </View>
              <View style={s.progressTrack}>
                <View
                  style={[
                    s.progressFill,
                    { width: `${completion(progress)}%` },
                  ]}
                />
              </View>
              <Txt size={12} color={c.muted} style={{ marginTop: 10 }}>
                第一课进度 {completion(progress)}%
              </Txt>
              <View style={s.journeyBottom}>
                <Txt size={14} bold>
                  每次试一试，都是新发现。
                </Txt>
                <Txt size={12} color={c.muted} style={{ marginTop: 6 }}>
                  还留住了 {works.length} 件小作品
                </Txt>
              </View>
            </View>
          </View>
          {task && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/works?create=1")}
              style={s.task}
            >
              <Icon name="clipboard-outline" color={c.teal} />
              <View style={{ flex: 1 }}>
                <Txt bold size={14}>
                  老师布置了一个小任务
                </Txt>
                <Txt size={13} color={c.muted}>
                  {task.title}
                </Txt>
              </View>
              <Icon name="arrow-forward" color={c.teal} />
            </Pressable>
          )}
          <View style={{ marginTop: 34 }}>
            <SectionTitle
              title="从这里开始"
              action="全部16课"
              onPress={() => router.push("/courses")}
            />
            <View style={[s.lessonRow, small && { flexDirection: "column" }]}>
              {list.slice(0, 3).map((lesson, i) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`打开第${lesson.id}课 ${lesson.title}`}
                  key={lesson.id}
                  onPress={() => router.push(`/courses/${lesson.id}`)}
                  style={({ pressed }) => [
                    s.lessonCard,
                    { backgroundColor: [c.peach, c.blue, "#ECE8F0"][i] },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View style={s.lessonCardHead}>
                    <Txt size={12} color={c.muted}>
                      第 {String(lesson.id).padStart(2, "0")} 课
                    </Txt>
                    <Tag
                      label={full && i === 0 ? "完整体验" : "课程大纲"}
                      tone={i === 0 ? "green" : "neutral"}
                    />
                  </View>
                  <Art
                    name={lessonArt[i]}
                    size={small ? 90 : 112}
                    style={{ alignSelf: "center", marginVertical: 18 }}
                  />
                  <Txt size={18} bold>
                    {lesson.title}
                  </Txt>
                  <Txt
                    size={12}
                    color={c.muted}
                    numberOfLines={2}
                    style={{ marginTop: 7, minHeight: 36 }}
                  >
                    {lesson.outcome.split("：")[0]}
                  </Txt>
                  <View style={s.cardBottom}>
                    <Txt size={13} bold>
                      {full && i === 0 ? "一起去探索" : "看看这一课"}
                    </Txt>
                    <Icon name="arrow-forward" size={18} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          <View
            style={[
              s.bottomFeature,
              small && { flexDirection: "column", alignItems: "flex-start" },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Txt size={20} bold>
                有个小问题？图灵老师在这里
              </Txt>
              <Txt size={14} color={c.muted} style={{ marginTop: 7 }}>
                从“AI是什么”开始，或者一起编一个小故事。
              </Txt>
            </View>
            <Button
              label="和图灵聊一聊"
              icon="chatbubble-outline"
              secondary
              onPress={() => router.push("/chat")}
            />
          </View>
        </>
      ) : isTeacher ? (
        <>
          <View style={[s.hero, { minHeight: 245, padding: 30 }]}>
            <View style={{ maxWidth: small ? "72%" : "65%" }}>
              <Tag label="第一课 · 40分钟" />
              <Txt size={small ? 25 : 34} bold style={{ marginTop: 18 }}>
                {"把一节好课，\n带进教室。"}
              </Txt>
              <Button
                label="打开大屏课堂"
                icon="expand-outline"
                disabled={!full}
                onPress={() => router.push("/classroom")}
                style={{ marginTop: 22 }}
              />
            </View>
            <View
              style={[
                s.heroArt,
                { bottom: 22 },
                small && { width: 110, height: 135, right: 12 },
              ]}
            >
              <Robot size={small ? 105 : 160} />
            </View>
          </View>
          <View
            style={[
              s.lessonRow,
              { marginTop: 26 },
              small && { flexDirection: "column" },
            ]}
          >
            {[
              { label: "当前学段", value: bandNames[data.band] },
              { label: "本机作品", value: `${works.length} 件` },
              {
                label: "待回应",
                value: `${works.filter((w) => !w.reviewed).length} 件`,
              },
            ].map((x) => (
              <View key={x.label} style={s.metric}>
                <Txt size={13} color={c.muted}>
                  {x.label}
                </Txt>
                <Txt size={26} bold style={{ marginTop: 10 }}>
                  {x.value}
                </Txt>
              </View>
            ))}
          </View>
          <View style={s.manageSection}>
            <SectionTitle title="本次课堂任务" />
            <View style={{ gap: 16 }}>
              <Txt bold size={18}>
                我的AI愿望图卡
              </Txt>
              <Txt color={c.muted}>
                画出一个想请AI帮助的故事或画面。说清楚：谁、在哪里、做什么。
              </Txt>
              <Tag
                label={task ? "任务已发布到本机学生视图" : "尚未发布"}
                tone={task ? "green" : "neutral"}
              />
              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                <Button
                  label={task ? "撤回本机任务" : "布置给体验学生"}
                  icon="paper-plane-outline"
                  onPress={task ? unpublish : publish}
                  disabled={!full}
                />
                <Button
                  label="查看学生作品"
                  secondary
                  onPress={() => router.push("/works")}
                />
              </View>
              {!full && (
                <Txt color={c.orange} size={13}>
                  完整课堂和任务目前先开放一至二年级。其他学段可查看大纲。
                </Txt>
              )}
            </View>
          </View>
          <View style={s.manageSection}>
            <SectionTitle title="备课资源" />
            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
              <Button
                label="查看学期Syllabus"
                secondary
                icon="map-outline"
                onPress={() => router.push("/syllabus")}
              />
              {Platform.OS === "web" && (
                <>
                  <Button
                    label="下载第一课PPT"
                    secondary
                    icon="download-outline"
                    onPress={() => Linking.openURL("/resources/lesson-01.pptx")}
                  />
                  <Button
                    label="下载学生任务单"
                    secondary
                    icon="document-outline"
                    onPress={() =>
                      Linking.openURL("/resources/worksheet-01.docx")
                    }
                  />
                </>
              )}
            </View>
            <Txt color={c.muted} size={12} style={{ marginTop: 18 }}>
              当前为单设备课堂体验。正式的班级账号、学生绑定和同步尚未接入。
            </Txt>
          </View>
        </>
      ) : (
        <>
          <View style={[s.hero, { minHeight: 230, padding: 30 }]}>
            <View style={{ maxWidth: small ? "70%" : "70%" }}>
              <Tag label={`${bandNames[data.band]} · 本机记录`} />
              <Txt size={small ? 24 : 34} bold style={{ marginTop: 18 }}>
                {"成长，藏在\n每次尝试里。"}
              </Txt>
              <Txt size={14} color={c.muted} style={{ marginTop: 12 }}>
                问问孩子：你想了什么？又改了哪里？
              </Txt>
            </View>
            <View
              style={[
                s.heroArt,
                { bottom: 25 },
                small && { width: 105, height: 105, right: 12 },
              ]}
            >
              <Art name="palette" size={small ? 90 : 165} />
            </View>
          </View>
          <View
            style={[
              s.lessonRow,
              { marginTop: 26 },
              small && { flexDirection: "column" },
            ]}
          >
            {[
              { label: "第一课学习进度", value: `${completion(progress)}%` },
              { label: "已保存作品", value: `${works.length} 件` },
              {
                label: "老师已回应",
                value: `${works.filter((w) => w.reviewed).length} 件`,
              },
            ].map((x) => (
              <View key={x.label} style={s.metric}>
                <Txt size={13} color={c.muted}>
                  {x.label}
                </Txt>
                <Txt size={28} bold style={{ marginTop: 10 }}>
                  {x.value}
                </Txt>
              </View>
            ))}
          </View>
          <View style={s.manageSection}>
            <SectionTitle title="这次学到了什么" />
            <Txt bold size={18}>
              {progress?.completionSource === "classroom"
                ? "老师已确认第一课课堂完成"
                : progress?.completed
                  ? "第一课课后练习已完成"
                  : "第一课还在探索中"}
            </Txt>
            <Txt color={c.muted} style={{ marginTop: 12 }}>
              {progress?.completionSource === "classroom"
                ? "课堂以讲授、科普短片和一张作品卡为主。本条由老师在本机标记，不代表完成了小测；可结合孩子的作品了解这次想法。"
                : progress?.completed
                  ? "孩子已经正确回答：AI能辅助创作、AI也会出错，以及身体不舒服要及时找大人。"
                  : "学习记录会随本机课堂完成标记或课后练习更新。现在也可以先看看课程地图。"}
            </Txt>
            {progress?.completedAt && (
              <Txt size={13} color={c.teal} style={{ marginTop: 10 }}>
                完成于 {formatDate(progress.completedAt)}
              </Txt>
            )}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginTop: 20,
                flexWrap: "wrap",
              }}
            >
              <Button
                label="分享这份记录"
                secondary
                icon="share-outline"
                onPress={report}
              />
              <Button
                label="查看课程安排"
                secondary
                onPress={() => router.push("/syllabus")}
              />
            </View>
          </View>
          <SectionTitle
            title="作品里的小发现"
            action="查看全部"
            onPress={() => router.push("/works")}
          />
          {works.length ? (
            <View style={s.manageSection}>
              <Txt bold size={19}>
                {works[0].title}
              </Txt>
              <Txt color={c.muted} style={{ marginTop: 10 }}>
                {works[0].description || "孩子用画面表达了自己的想法。"}
              </Txt>
              <Txt size={14} color={c.teal} style={{ marginTop: 14 }}>
                {works[0].reviewed
                  ? `老师说：${works[0].feedback}`
                  : "作品已保存在本机，等待老师回应。"}
              </Txt>
              <Button
                label="查看原稿与AI优化图"
                secondary
                small
                onPress={() => router.push(`/studio/${works[0].id}`)}
                style={{ marginTop: 18 }}
              />
            </View>
          ) : (
            <Empty
              art="crayon"
              title="第一件作品，还在路上"
              description="切换到学生体验，完成一张愿望图卡，就能在这里看到。"
            />
          )}
        </>
      )}
    </Shell>
  );
}
const s = StyleSheet.create({
  mainRow: { flexDirection: "row", gap: 22 },
  hero: {
    minHeight: 340,
    backgroundColor: c.mint,
    borderRadius: 26,
    padding: 32,
    overflow: "hidden",
    position: "relative",
  },
  heroArt: {
    position: "absolute",
    right: 15,
    bottom: 54,
    width: 200,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
  },
  orbit: {
    position: "absolute",
    width: 195,
    height: 195,
    borderRadius: 100,
    backgroundColor: "#D0E5D5",
  },
  journey: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 23,
    padding: 25,
    minWidth: 210,
    minHeight: 300,
  },
  progressNumber: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
    marginTop: 26,
    marginBottom: 20,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EFF1E9",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: c.teal, borderRadius: 4 },
  journeyBottom: {
    marginTop: 26,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: c.line,
  },
  lessonRow: { flexDirection: "row", gap: 18 },
  lessonCard: { flex: 1, padding: 21, borderRadius: 20, minWidth: 0 },
  lessonCardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardBottom: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: "rgba(23,61,70,0.12)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomFeature: {
    marginTop: 30,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderColor: c.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },
  task: {
    marginTop: 22,
    padding: 19,
    borderWidth: 1,
    borderColor: "#CBDFCF",
    borderRadius: 16,
    backgroundColor: "#F0F5EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  metric: {
    flex: 1,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 18,
    padding: 24,
  },
  manageSection: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 20,
    padding: 25,
    marginVertical: 24,
  },
});
