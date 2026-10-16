import React from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Robot, Shell, Tag, Txt } from "../components/ui";
import { color as c } from "../components/theme";
import { useApp } from "../lib/store";
import { Role } from "../lib/domain";
import VoicePreview from "../components/VoicePreview";
import { lesson01 } from "../data/content";

export default function Demo() {
  const { data, updateRole, updateBand } = useApp();
  const progress = data.progress["1-2:1"];
  const works = data.works.filter((w) => w.band === "1-2");
  function open(
    role: Role,
    route: "/" | "/classroom" | "/chat" | "/works?create=1" | "/works",
  ) {
    updateBand("1-2");
    updateRole(role);
    router.push(route);
  }
  const steps = [
    {
      title: "老师开课",
      body: "17页大屏课堂，点一次开始连续播放：固定中文女声、自动翻页、三段科普短片和画画倒计时。可随时暂停或跳章节。",
      action: "进入大屏课堂",
      role: "teacher" as Role,
      route: "/classroom" as const,
      state:
        progress?.completionSource === "classroom"
          ? "老师已确认课堂完成"
          : "课堂结束后，点击确认课堂完成",
    },
    {
      title: "学生与AI一起创作",
      body: "画画或收录照片，保存原稿后进入AI创作室：选择绘本/彩铅风格，模拟生成图片，再加个小熊朋友，选为最终作品。使用固定月亮花园示例图。",
      action: "画画并体验AI优化",
      role: "student" as Role,
      route: "/works?create=1" as const,
      state: `本机已保存 ${works.length} 件作品`,
    },
    {
      title: "老师写下点评",
      body: "从刚保存的作品中指出一个具体优点，再给一条改进建议。评语由你实际填写。",
      action: "查看并点评作品",
      role: "teacher" as Role,
      route: "/works" as const,
      state: `已回应 ${works.filter((w) => w.reviewed).length} 件作品`,
    },
    {
      title: "家长查看课堂记录",
      body: "查看老师标记的课堂完成、作品和具体评语。三个视角共用当前浏览器记录，适合在同一台设备录Demo。",
      action: "打开家长视图",
      role: "parent" as Role,
      route: "/" as const,
      state: progress?.completed
        ? "已有第一课完成记录"
        : "等待本机课堂或课后练习记录",
    },
    {
      title: "课后模拟AI对话",
      body: "输入“请编两句话：小兔在月亮花园种萝卜”，再试“加一个小熊朋友”。使用预设回答，不调用模型。",
      action: "体验Mock对话",
      role: "student" as Role,
      route: "/chat" as const,
      state: "本地预设示例，无模型调用费用",
    },
  ];
  return (
    <Shell
      title="第一课演示导览"
      subtitle="你好，图灵老师 · 一至二年级 · 自动课堂与AI创作"
    >
      <View style={s.intro}>
        <Robot size={86} />
        <View style={{ flex: 1, minWidth: 180, gap: 10 }}>
          <Tag label="一节课的完整演示" />
          <Txt size={23} bold>
            看课、画画，让AI帮我添想象
          </Txt>
          <Txt size={14} color={c.muted}>
            {lesson01.goal}
            课堂只有两次简短集体回应，其他时间听讲、看短片和画画。
          </Txt>
        </View>
      </View>
      <Txt size={14} color={c.muted} style={{ marginBottom: 25 }}>
        按下面顺序录制，约3—5分钟即可展示完整流程。课堂本身按40分钟设计；快速翻页只用于产品演示，不代表已实际学习40分钟。点击会切换本机演示身份，不创建真实账号。
      </Txt>
      <View
        style={[
          s.resources,
          { marginTop: 0, marginBottom: 24, backgroundColor: c.mint },
        ]}
      >
        <Tag label="新增 · 录屏快速模式" />
        <Txt size={23} bold>
          4分钟，自动跑完一节课的产品流程
        </Txt>
        <Txt size={14} color={c.muted}>
          课堂 → AI出图 → 加朋友修改 → 老师点评 →
          家长查看。可选3/4/5分钟，暂停、跳段或重录；使用独立演示数据。
        </Txt>
        <Button
          label="进入快速演示（3—5分钟）"
          onPress={() => router.push("/quick-demo")}
        />
        <Txt size={12} color={c.muted}>
          下方“进入大屏课堂”仍然使用正常40分钟教学节奏。
        </Txt>
      </View>
      <VoicePreview />
      {steps.map((step, i) => (
        <View key={step.title} style={s.step}>
          <View style={s.number}>
            <Txt bold size={21} color={c.teal}>
              {i + 1}
            </Txt>
          </View>
          <View style={{ flex: 1, gap: 12, minWidth: 180 }}>
            <Txt size={21} bold>
              {step.title}
            </Txt>
            <Txt size={14} color={c.muted}>
              {step.body}
            </Txt>
            <Txt size={12} color={c.teal}>
              {step.state}
            </Txt>
            <Button
              label={step.action}
              small
              onPress={() => open(step.role, step.route)}
              style={{ alignSelf: "flex-start" }}
            />
          </View>
        </View>
      ))}
      <View style={s.resources}>
        <Txt size={21} bold>
          录屏与备课资料
        </Txt>
        <Txt size={14} color={c.muted}>
          科普视频保留原站来源，支持嵌入播放，课堂也可切图卡讲解。公开视频若要录进对外宣传片，先确认相应使用许可；演示功能可以直接录原创图卡和预制对话。
        </Txt>
        {Platform.OS === "web" && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {[
              ["教案与逐字稿", "teacher-guide.docx"],
              ["学生任务单", "worksheet-01.docx"],
              ["讲授版PPT", "lesson-01.pptx"],
              ["录屏路线", "demo-guide.html"],
            ].map(([label, file]) => (
              <Button
                key={file}
                label={label}
                small
                secondary
                onPress={() => Linking.openURL(`/resources/${file}`)}
              />
            ))}
          </View>
        )}
        <Button
          label="回到我的学习空间"
          small
          secondary
          onPress={() => router.push("/")}
        />
      </View>
    </Shell>
  );
}
const s = StyleSheet.create({
  intro: {
    padding: 25,
    backgroundColor: c.mint,
    borderRadius: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 24,
    marginBottom: 22,
  },
  step: {
    paddingVertical: 25,
    borderTopWidth: 1,
    borderColor: c.line,
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start",
  },
  number: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  resources: {
    padding: 23,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 18,
    marginTop: 20,
    gap: 17,
  },
});
