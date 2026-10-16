import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Art, Button, Dialog, Icon, Shell, Txt } from "../components/ui";
import { color as c } from "../components/theme";
import { useApp } from "../lib/store";
import { Band, Role, bandNames, bands, roleNames } from "../lib/domain";
export default function Profile() {
  const { data, updateRole, updateBand, reset } = useApp();
  const [confirm, setConfirm] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function clear() {
    setBusy(true);
    try {
      await reset();
      setConfirm(false);
    } catch {
      setError("未能清除本机记录，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell title="设置与体验说明" subtitle="一个入口，三个视角，一套课程内容。">
      <View style={s.card}>
        <Txt size={20} bold>
          当前体验身份
        </Txt>
        <Txt
          size={13}
          color={c.muted}
          style={{ marginTop: 8, marginBottom: 20 }}
        >
          身份切换用于演示页面差异，不是真实登录或权限认证。
        </Txt>
        <View style={s.row}>
          {(["student", "teacher", "parent"] as Role[]).map((r, i) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: data.role === r }}
              key={r}
              onPress={() => updateRole(r)}
              style={[s.option, data.role === r && s.selected]}
            >
              <Art
                name={(["rabbit", "teacher", "home"] as const)[i]}
                size={45}
              />
              <Txt bold color={data.role === r ? c.teal : c.ink}>
                {roleNames[r]}
              </Txt>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={s.card}>
        <Txt size={20} bold>
          学习年级
        </Txt>
        <View style={[s.row, { marginTop: 20 }]}>
          {bands.map((b: Band) => (
            <Pressable
              key={b}
              accessibilityRole="button"
              accessibilityLabel={bandNames[b]}
              accessibilityState={{ selected: data.band === b }}
              onPress={() => updateBand(b)}
              style={[s.band, data.band === b && s.selected]}
            >
              <Txt size={15} bold color={data.band === b ? c.teal : c.ink}>
                {bandNames[b]}
              </Txt>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={s.card}>
        <Txt size={20} bold>
          关于这次体验
        </Txt>
        {[
          {
            title: "课程与作品",
            body: "四个学段各16课大纲。一至二年级第一课含17页讲授课堂、三段科普视频入口、课后回看与自愿练习。课堂完成由老师确认，单独标记，不冒充小测成绩。作品、评语和任务仅保存在当前设备，不会跨设备同步。",
          },
          {
            title: "图灵演示对话",
            body: "目前使用本地预设回答，尚未接入豆包或其他模型。文字不会被发送给AI服务。朗读使用设备系统声音，设备需要有中文语音。",
          },
          {
            title: "图片与数据",
            body: "只有点击“选作品照片”才会打开系统选图。图片只存本机，不需要拍摄人脸，不收集位置、联系人或真实学生身份。当前本地存储不用于真实学生敏感资料。",
          },
          {
            title: "版本与素材",
            body: "开发原型 0.1.0。图灵循环动画来自Google Noto Animated Emoji，按CC BY 4.0署名；课程图像来自Google Noto Emoji。现成科普视频仅保留原站链接，使用前需审看。",
          },
        ].map((x) => (
          <View key={x.title} style={s.explain}>
            <Txt size={16} bold>
              {x.title}
            </Txt>
            <Txt size={14} color={c.muted} style={{ marginTop: 8 }}>
              {x.body}
            </Txt>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Icon name="refresh-outline" color={c.orange} />
          <Txt size={20} bold>
            重新开始体验
          </Txt>
        </View>
        <Txt
          size={14}
          color={c.muted}
          style={{ marginTop: 12, marginBottom: 20 }}
        >
          清除本机的学习进度、作品、评语与任务，回到初始状态。此操作不影响课程文件。
        </Txt>
        <Button
          label="清除本机体验记录"
          secondary
          onPress={() => setConfirm(true)}
        />
      </View>
      <Dialog
        visible={confirm}
        onClose={() => setConfirm(false)}
        title="清除这台设备的记录？"
      >
        <Txt style={{ marginBottom: 24 }}>
          本机的作品、评语和学习记录将被清除，无法撤销。课程内容仍会保留。
        </Txt>
        {!!error && (
          <Txt color={c.red} style={{ marginBottom: 15 }}>
            {error}
          </Txt>
        )}
        <View style={s.row}>
          <Button
            label="保留记录"
            secondary
            onPress={() => setConfirm(false)}
            disabled={busy}
          />
          <Button
            label={busy ? "正在清除…" : "确认清除"}
            onPress={clear}
            disabled={busy}
          />
        </View>
      </Dialog>
    </Shell>
  );
}
const s = StyleSheet.create({
  card: {
    padding: 26,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.white,
    marginBottom: 23,
  },
  row: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  option: {
    padding: 18,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 15,
    alignItems: "center",
    gap: 10,
    minWidth: 100,
    flex: 1,
  },
  band: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 12,
    minHeight: 50,
  },
  selected: { backgroundColor: c.mint, borderColor: c.teal },
  explain: { paddingVertical: 19, borderBottomWidth: 1, borderColor: c.line },
});
