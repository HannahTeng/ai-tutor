import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Art, Button, Empty, Icon, Shell, Tag, Txt } from "../../components/ui";
import { color as c } from "../../components/theme";
import { useApp } from "../../lib/store";
import { courses, lessonArt, lessonSteps, questions } from "../../data/content";
import { progressKey, quizPassed } from "../../lib/domain";
import { readAloud, stopSpeaking } from "../../lib/speech";
export default function LessonPage() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    num = Number(id);
  const { data, recordProgress, updateBand } = useApp();
  const lesson = courses[data.band].find((l) => l.id === num);
  const full = data.band === "1-2" && num === 1;
  const saved = data.progress[progressKey(data.band, 1)];
  const [step, setStep] = useState(Math.min(saved?.step ?? 0, 4));
  const [answers, setAnswers] = useState<Record<string, number>>(
    saved?.answers ?? {},
  );
  const [audioError, setAudioError] = useState("");
  const { width } = useWindowDimensions();
  const mobile = width < 700;
  useEffect(
    () => () => {
      void stopSpeaking();
    },
    [],
  );
  if (!lesson)
    return (
      <Shell title="没有找到这节课">
        <Empty
          title="这个课程编号不存在"
          description="回到课程地图，选择一节感兴趣的课。"
          action="回到课程"
          onPress={() => router.replace("/courses")}
        />
      </Shell>
    );
  function next() {
    void stopSpeaking();
    const n = Math.min(step + 1, 4);
    setStep(n);
    recordProgress(n);
  }
  async function speak(text: string) {
    setAudioError("");
    try {
      await readAloud(text);
    } catch (e) {
      setAudioError((e as Error).message);
    }
  }
  function answer(index: number, choice: number) {
    const a = { ...answers, [String(index)]: choice };
    setAnswers(a);
    recordProgress(4, a);
  }
  const pass = quizPassed(answers);
  return (
    <Shell
      title={lesson.title}
      subtitle={`第 ${String(lesson.id).padStart(2, "0")} 课 · ${full ? "第一课完整学习体验" : "课程大纲预览"}`}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/courses")}
        style={{
          flexDirection: "row",
          gap: 7,
          marginBottom: 22,
          alignItems: "center",
        }}
      >
        <Icon name="arrow-back" size={18} color={c.teal} />
        <Txt size={14} color={c.teal}>
          回到课程地图
        </Txt>
      </Pressable>
      {!full ? (
        <>
          <View style={s.preview}>
            <Art name={lessonArt[num - 1]} size={110} />
            <Tag label="本课目前提供大纲" tone="orange" />
            <Txt size={15} color={c.muted} style={{ marginTop: 13 }}>
              视频与完整任务正在逐课制作，可以先了解这一课会怎么学。
            </Txt>
          </View>
          {[
            { title: "这一课教什么", text: lesson.teach },
            { title: "我们怎样互动", text: lesson.interaction },
            { title: "最后留下什么作品", text: lesson.outcome },
          ].map((x) => (
            <View key={x.title} style={s.detail}>
              <Txt size={21} bold>
                {x.title}
              </Txt>
              <Txt style={{ marginTop: 12 }}>{x.text}</Txt>
            </View>
          ))}
          <Button
            label={
              data.band === "1-2"
                ? "查看第一课完整体验"
                : "切换到一至二年级体验"
            }
            onPress={() => {
              updateBand("1-2");
              router.replace("/courses/1");
            }}
          />
        </>
      ) : (
        <>
          <View style={[s.detail, { marginBottom: 22, gap: 15 }]}>
            <Txt size={22} bold>
              课堂讲授版与课后回看
            </Txt>
            <Txt size={14} color={c.muted}>
              整班上课请进入演示导览中的大屏课堂：三段科普短片、两次简短回应和一次作品任务。下方四段内容和小练习供课后自愿回看，不加入40分钟课堂流程。
            </Txt>
            <Button
              label="打开第一课演示导览"
              onPress={() => router.push("/demo")}
            />
          </View>
          <View style={s.stepRow}>
            {[...lessonSteps.map((x) => x.label), "试一试"].map((label, i) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={`学习步骤 ${label}`}
                onPress={() => {
                  void stopSpeaking();
                  setStep(i);
                  recordProgress(i);
                }}
                style={[
                  s.step,
                  i === step && {
                    borderColor: c.teal,
                    backgroundColor: c.mint,
                  },
                ]}
              >
                <Txt size={12} color={i === step ? c.teal : c.muted} bold>
                  {i + 1} {label}
                </Txt>
              </Pressable>
            ))}
          </View>
          {step < 4 ? (
            <View style={s.stage}>
              <Tag label={`小发现 ${step + 1} / 4`} />
              <Txt
                size={mobile ? 26 : 34}
                bold
                style={{ marginTop: 24, textAlign: "center" }}
              >
                {lessonSteps[step].title}
              </Txt>
              <View style={[s.artRow, { gap: mobile ? 15 : 55 }]}>
                {lessonSteps[step].art.map((a, i) => (
                  <Art
                    key={a + i}
                    name={a}
                    size={
                      mobile
                        ? lessonSteps[step].art.length === 3
                          ? 75
                          : 105
                        : 155
                    }
                  />
                ))}
              </View>
              <Txt
                size={mobile ? 17 : 20}
                style={{ textAlign: "center", maxWidth: 650 }}
              >
                {lessonSteps[step].body}
              </Txt>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 27,
                }}
              >
                <Button
                  label="听图灵讲一讲"
                  icon="volume-high-outline"
                  secondary
                  onPress={() => speak(lessonSteps[step].narration)}
                />
                <Button
                  label="停止朗读"
                  secondary
                  onPress={() => {
                    void stopSpeaking();
                  }}
                />
              </View>
              {!!audioError && (
                <Txt
                  color={c.orange}
                  size={13}
                  style={{ marginTop: 15, textAlign: "center" }}
                >
                  {audioError}
                </Txt>
              )}
              <View style={s.stageBottom}>
                <Button
                  label="问问图灵"
                  secondary
                  icon="chatbubble-outline"
                  onPress={() => router.push("/chat")}
                />
                <Button
                  label={step === 3 ? "去试一试" : "我发现了，下一步"}
                  icon="arrow-forward"
                  onPress={next}
                />
              </View>
            </View>
          ) : (
            <View style={s.quiz}>
              <Tag label="课后自愿练习 · 可以再试一次" />
              <Txt size={27} bold style={{ marginTop: 20 }}>
                三个问题，我来想一想
              </Txt>
              <Txt size={14} color={c.muted} style={{ marginTop: 9 }}>
                答错没有关系，看懂解释再试试。三题都答对后，可以记录完成。
              </Txt>
              {questions.map((q, i) => (
                <View key={q.title} style={s.question}>
                  <Txt size={19} bold>
                    {i + 1}. {q.title}
                  </Txt>
                  <View style={{ gap: 10, marginTop: 16 }}>
                    {q.choices.map((choice, j) => {
                      const selected = answers[String(i)] === j;
                      return (
                        <Pressable
                          key={choice}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          onPress={() => answer(i, j)}
                          style={[
                            s.option,
                            selected && {
                              borderColor:
                                selected && j === q.answer ? c.teal : c.orange,
                              backgroundColor:
                                j === q.answer ? c.mint : "#FFF0E6",
                            },
                          ]}
                        >
                          <Icon
                            name={
                              selected ? "radio-button-on" : "radio-button-off"
                            }
                            size={23}
                            color={selected ? c.teal : c.muted}
                          />
                          <Txt size={16} style={{ flex: 1 }}>
                            {choice}
                          </Txt>
                        </Pressable>
                      );
                    })}
                  </View>
                  {answers[String(i)] !== undefined && (
                    <Txt
                      size={14}
                      color={
                        answers[String(i)] === q.answer ? c.teal : c.orange
                      }
                      style={{ marginTop: 12 }}
                    >
                      {answers[String(i)] === q.answer
                        ? "你发现了！"
                        : "再想一想。"}
                      {q.explain}
                    </Txt>
                  )}
                </View>
              ))}
              {saved?.completed ? (
                <View style={s.success}>
                  <Icon name="checkmark-circle" color={c.teal} size={31} />
                  <Txt bold size={18}>
                    第一课已完成，留下一件小作品吧。
                  </Txt>
                </View>
              ) : (
                <Button
                  label="记录完成第一课"
                  disabled={!pass}
                  icon="checkmark-circle-outline"
                  onPress={() => recordProgress(5, answers)}
                />
              )}
              <Button
                label="画出我的AI愿望"
                icon="color-palette-outline"
                onPress={() => router.push("/works?create=1")}
                style={{ marginTop: 20 }}
              />
            </View>
          )}
        </>
      )}
    </Shell>
  );
}
const s = StyleSheet.create({
  preview: {
    alignItems: "center",
    padding: 32,
    backgroundColor: c.mint,
    borderRadius: 24,
    gap: 15,
  },
  detail: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderColor: c.line,
    marginBottom: 15,
  },
  stepRow: { flexDirection: "row", gap: 9, flexWrap: "wrap", marginBottom: 25 },
  step: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 12,
  },
  stage: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 25,
    padding: 24,
    alignItems: "center",
  },
  artRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 35,
  },
  stageBottom: {
    marginTop: 35,
    paddingTop: 25,
    borderTopWidth: 1,
    borderColor: c.line,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  quiz: {
    padding: 25,
    backgroundColor: c.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: c.line,
  },
  question: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderColor: c.line,
    marginBottom: 18,
  },
  option: {
    flexDirection: "row",
    gap: 13,
    borderWidth: 1,
    borderColor: c.line,
    padding: 17,
    borderRadius: 13,
    alignItems: "center",
    minHeight: 56,
  },
  success: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 20,
    backgroundColor: c.mint,
    borderRadius: 15,
  },
});
