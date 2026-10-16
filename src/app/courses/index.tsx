import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Art, Icon, SectionTitle, Shell, Tag, Txt } from "../../components/ui";
import { color as c } from "../../components/theme";
import { useApp } from "../../lib/store";
import { courses, lessonArt } from "../../data/content";
import { bandNames } from "../../lib/domain";
export default function Courses() {
  const { data } = useApp(),
    { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [gridWidth, setGridWidth] = useState(0);
  const all = courses[data.band],
    filtered = all.filter((x) => (x.title + x.teach).includes(query.trim()));
  const cols = width > 1350 ? 4 : width > 900 ? 3 : width > 600 ? 2 : 1;
  return (
    <Shell
      title="每一课，都是一个新发现"
      subtitle={`${bandNames[data.band]} · 16次探索 · 从认识AI到自己的作品`}
    >
      <View style={s.tools}>
        <View style={s.search}>
          <Icon name="search-outline" color={c.muted} />
          <TextInput
            accessibilityLabel="搜索课程"
            placeholder="找一个你感兴趣的主题"
            value={query}
            onChangeText={setQuery}
            style={s.input}
            placeholderTextColor={c.muted}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/syllabus")}
          style={s.map}
        >
          <Icon name="map-outline" color={c.teal} />
          <Txt size={14} bold color={c.teal}>
            学期地图
          </Txt>
        </Pressable>
      </View>
      <View style={s.intro}>
        <Txt size={17} bold>
          一段学会用AI表达自己的旅程
        </Txt>
        <Txt size={13} color={c.muted} style={{ marginTop: 6 }}>
          一至二年级第一课已开放完整体验，其他课次可阅读教学、互动与作品大纲。
        </Txt>
      </View>
      <SectionTitle
        title={query ? `找到 ${filtered.length} 个主题` : "全部探索课程"}
      />
      <View
        onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
        style={{ flexDirection: "row", flexWrap: "wrap", gap: 18 }}
      >
        {filtered.map((lesson) => (
          <Pressable
            key={lesson.id}
            accessibilityRole="button"
            accessibilityLabel={`第${lesson.id}课 ${lesson.title}`}
            onPress={() => router.push(`/courses/${lesson.id}`)}
            style={({ pressed }) => [
              s.card,
              {
                width:
                  cols === 1
                    ? "100%"
                    : Math.max(140, (gridWidth - (cols - 1) * 18) / cols),
                backgroundColor: lesson.id === 1 ? c.mint : c.white,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Txt size={12} color={c.muted}>
                LESSON {String(lesson.id).padStart(2, "0")}
              </Txt>
              <Icon name="arrow-forward" size={18} color={c.teal} />
            </View>
            <Art
              name={lessonArt[lesson.id - 1]}
              size={86}
              style={{ marginTop: 24, marginBottom: 18 }}
            />
            <Txt size={18} bold>
              {lesson.title}
            </Txt>
            <Txt
              numberOfLines={2}
              size={13}
              color={c.muted}
              style={{ marginTop: 9, minHeight: 40 }}
            >
              {lesson.outcome}
            </Txt>
            <View style={{ marginTop: 20 }}>
              <Tag
                label={
                  data.band === "1-2" && lesson.id === 1
                    ? "完整体验 · 学习＋小测＋作品"
                    : "课程大纲预览"
                }
                tone={lesson.id === 1 ? "green" : "neutral"}
              />
            </View>
          </Pressable>
        ))}
      </View>
      {!filtered.length && (
        <View style={{ paddingVertical: 70 }}>
          <Txt size={19} bold>
            暂时没有找到这个主题
          </Txt>
          <Txt color={c.muted} style={{ marginTop: 10 }}>
            试试“故事”“视频”或“AI”。
          </Txt>
        </View>
      )}
    </Shell>
  );
}
const s = StyleSheet.create({
  tools: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
    marginBottom: 24,
  },
  search: {
    flex: 1,
    maxWidth: 500,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 14,
    backgroundColor: c.white,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 15, color: c.ink, minHeight: 48 },
  map: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  intro: {
    padding: 22,
    backgroundColor: "#F0EDE3",
    borderRadius: 16,
    marginBottom: 30,
  },
  card: {
    padding: 23,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 20,
    minWidth: 0,
  },
});
