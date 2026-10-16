import React, { useEffect, useRef, useState } from "react";
import { TextInput, View, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Shell, Tag, Txt } from "../../components/ui";
import WorkImage from "../../components/WorkImage";
import { Drawing } from "../../components/Drawing";
import { color as c } from "../../components/theme";
import { useApp } from "../../lib/store";
import { MockGeneration } from "../../lib/domain";
import { demoPrompt, mockImage } from "../../data/mockArt";

export default function Studio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, addGeneration, chooseGeneration } = useApp();
  const work = data.works.find((w) => w.id === id && w.band === data.band);
  const editable = data.role === "student";
  const { width } = useWindowDimensions();
  const [style, setStyle] = useState<"storybook" | "pencil">("storybook");
  const [prompt, setPrompt] = useState(demoPrompt);
  const [active, setActive] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const versions = work?.generations ?? [];
  const current =
    versions.find((g) => g.id === active) ??
    versions.find((g) => g.id === work?.selectedGenerationId) ??
    versions[versions.length - 1];
  function generate(friend: boolean) {
    if (!work || !editable || busy) return;
    if (!prompt.trim()) {
      setNotice("先写一句画面描述吧。");
      return;
    }
    setBusy(true);
    setNotice("");
    timer.current = setTimeout(() => {
      const generation: MockGeneration = {
        id: `image-${Date.now()}`,
        style: friend ? "storybook" : style,
        variant: friend ? "friend" : "base",
        prompt: friend
          ? `${current?.prompt ?? prompt} 加一个小熊朋友。`
          : prompt.trim().slice(0, 500),
        mode: "mock",
        createdAt: new Date().toISOString(),
      };
      addGeneration(work.id, generation);
      setActive(generation.id);
      setBusy(false);
      setNotice("示例图片已准备好。看看角色、地点和事情，再决定要不要用它。");
    }, 1400);
  }
  if (!work)
    return (
      <Shell title="AI创作室">
        <Txt>这件作品不在当前年级的本机记录中。</Txt>
        <Button label="返回作品" onPress={() => router.replace("/works")} />
      </Shell>
    );
  return (
    <Shell
      title="把小想法，变成一幅画"
      subtitle="我的原稿 → AI优化图 → 修改与选择"
    >
      <View
        style={{
          padding: 18,
          backgroundColor: c.mint,
          borderRadius: 16,
          gap: 9,
          marginBottom: 25,
        }}
      >
        <Tag label="Demo · Mock图片生成" />
        <Txt size={14}>
          当前演示固定的“小兔月亮花园”主题：点击生成会展示预制图片，尚未识别原稿或按输入实时作画。原稿和描述保留在本机。
        </Txt>
      </View>
      <View style={{ flexDirection: width >= 850 ? "row" : "column", gap: 24 }}>
        <View style={{ flex: 1, gap: 12 }}>
          <Txt size={21} bold>
            ① 我的小想法
          </Txt>
          {work.image ? (
            <WorkImage source={{ uri: work.image }} />
          ) : work.drawing.length ? (
            <Drawing strokes={work.drawing} />
          ) : (
            <View
              style={{ padding: 30, backgroundColor: c.mint, minHeight: 150 }}
            >
              <Txt>{work.description}</Txt>
            </View>
          )}
          <Txt bold>{work.title}</Txt>
          <Txt color={c.muted} size={14}>
            {work.description || "这是我画出的想法。"}
          </Txt>
          {editable && (
            <>
              <Txt bold size={15}>
                示例画面描述
              </Txt>
              <TextInput
                accessibilityLabel="示例画面描述"
                value={prompt}
                onChangeText={setPrompt}
                multiline
                maxLength={500}
                editable={!busy}
                style={{
                  borderWidth: 1,
                  borderColor: c.line,
                  borderRadius: 12,
                  padding: 14,
                  minHeight: 85,
                  color: c.ink,
                  backgroundColor: c.white,
                }}
              />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                <Button
                  label={`${style === "storybook" ? "✓ " : ""}绘本插画`}
                  secondary
                  small
                  disabled={busy}
                  onPress={() => setStyle("storybook")}
                />
                <Button
                  label={`${style === "pencil" ? "✓ " : ""}彩铅手绘`}
                  secondary
                  small
                  disabled={busy}
                  onPress={() => setStyle("pencil")}
                />
              </View>
              <Button
                label={busy ? "正在准备示例图片…" : "请AI优化成图片"}
                disabled={busy}
                onPress={() => generate(false)}
              />
            </>
          )}
        </View>
        <View style={{ flex: 1, gap: 14 }}>
          <Txt size={21} bold>
            ② AI帮我添一点想象
          </Txt>
          {current ? (
            <>
              <WorkImage
                label="AI优化后的月亮花园示例图片"
                source={mockImage(current)}
              />
              <Tag
                label={`${current.variant === "friend" ? "加上小熊朋友" : current.style === "pencil" ? "彩铅手绘" : "绘本插画"} · Mock预制图`}
              />
              <Txt size={14} color={c.muted}>
                这是一幅想象画。真实月亮上不能这样直接种菜。
              </Txt>
              {editable && (
                <>
                  <Button
                    label="再改一下：加个小熊朋友（绘本）"
                    secondary
                    disabled={busy}
                    onPress={() => generate(true)}
                  />
                  <Button
                    label={
                      work.selectedGenerationId === current.id
                        ? "✓ 已选为最终作品"
                        : "选这张作为最终作品"
                    }
                    disabled={busy || work.selectedGenerationId === current.id}
                    onPress={() => {
                      chooseGeneration(work.id, current.id);
                      setNotice(
                        "已保存原稿和最终图片，老师与家长都能查看。修改最终图片后，需要老师重新点评。",
                      );
                    }}
                  />
                </>
              )}
              <Txt size={13} bold>
                ③ 看看不同版本 · 最多保留4张
              </Txt>
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                {versions.map((g, i) => (
                  <Button
                    key={g.id}
                    small
                    secondary
                    label={`版本${i + 1}${g.id === work.selectedGenerationId ? " · 已选" : ""}`}
                    disabled={busy}
                    onPress={() => setActive(g.id)}
                  />
                ))}
              </View>
              <Txt size={12} color={c.muted}>
                本版本请求：{current.prompt}
              </Txt>
            </>
          ) : (
            <View
              style={{
                backgroundColor: c.mint,
                borderRadius: 15,
                padding: 30,
                minHeight: 230,
                justifyContent: "center",
                gap: 15,
              }}
            >
              <Txt size={22} bold>
                一会儿，这里会出现图片
              </Txt>
              <Txt color={c.muted}>
                先画出自己的想法，再请AI帮忙丰富画面。最后选哪张，由你决定。
              </Txt>
            </View>
          )}
        </View>
      </View>
      {!!notice && (
        <View
          accessibilityRole="alert"
          style={{
            marginTop: 22,
            padding: 16,
            backgroundColor: c.mint,
            borderRadius: 12,
          }}
        >
          <Txt color={c.teal}>{notice}</Txt>
        </View>
      )}
      <Button
        label="回作品展览"
        secondary
        onPress={() => router.replace("/works")}
        style={{ marginTop: 25, alignSelf: "flex-start" }}
      />
    </Shell>
  );
}
