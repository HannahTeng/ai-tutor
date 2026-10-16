import React from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { Art, Button, Shell, Tag, Txt } from "../components/ui";
import { color as c } from "../components/theme";
import { useApp } from "../lib/store";
import { bandNames } from "../lib/domain";
import { courses } from "../data/content";
export default function Syllabus() {
  const { data } = useApp();
  return (
    <Shell
      title="我的学期探索地图"
      subtitle={`${bandNames[data.band]} · Syllabus · 16次课，每次建议40分钟`}
    >
      <View style={s.hero}>
        <Art name="book" size={90} />
        <View style={{ flex: 1 }}>
          <Tag label="图灵AI探索课" />
          <Txt size={22} bold style={{ marginTop: 12 }}>
            我们会做些什么？
          </Txt>
          <Txt color={c.muted} size={14} style={{ marginTop: 8 }}>
            学会说清想法，修改作品，和同伴一起探索。难度会根据课堂表现调整。
          </Txt>
        </View>
      </View>
      {courses[data.band].map((l) => (
        <View key={l.id} style={s.row}>
          <Txt size={19} color={c.teal} bold style={{ width: 35 }}>
            {String(l.id).padStart(2, "0")}
          </Txt>
          <View style={{ flex: 1, gap: 7 }}>
            <Txt size={18} bold>
              {l.title}
            </Txt>
            <Txt size={14} color={c.muted}>
              我们会学：{l.teach}
            </Txt>
            <Txt size={14} color={c.teal}>
              留下的作品：{l.outcome}
            </Txt>
          </View>
        </View>
      ))}
      <View style={s.bottom}>
        <Txt size={18} bold>
          探索约定
        </Txt>
        <Txt style={{ marginTop: 12 }}>
          先自己想一想。AI也会出错，不确定就核对。个人资料不随意输入，身体不舒服或害怕时找老师和家长。
        </Txt>
        <Txt size={13} color={c.muted} style={{ marginTop: 14 }}>
          课程按年龄分层，不按作品精美程度、播放量或粉丝数评价。课后体验不要求购买额外AI服务。
        </Txt>
        {Platform.OS === "web" && data.band === "1-2" && (
          <Button
            label="下载学生与家长Syllabus"
            secondary
            icon="download-outline"
            onPress={() => Linking.openURL("/resources/syllabus.docx")}
            style={{ marginTop: 20 }}
          />
        )}
      </View>
    </Shell>
  );
}
const s = StyleSheet.create({
  hero: {
    backgroundColor: c.mint,
    padding: 26,
    borderRadius: 22,
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
    marginBottom: 30,
  },
  row: {
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderColor: c.line,
    flexDirection: "row",
    gap: 15,
  },
  bottom: {
    padding: 25,
    backgroundColor: c.white,
    borderRadius: 20,
    marginTop: 30,
  },
});
