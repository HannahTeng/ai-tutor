import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Art,
  Button,
  Dialog,
  Empty,
  Icon,
  SectionTitle,
  Shell,
  Tag,
  Txt,
} from "../components/ui";
import WorkImage from "../components/WorkImage";
import { Drawing } from "../components/Drawing";
import { color as c } from "../components/theme";
import { useApp } from "../lib/store";
import { mockImage } from "../data/mockArt";
import { Stroke, formatDate } from "../lib/domain";
export default function Works() {
  const { create } = useLocalSearchParams<{ create: string }>();
  const { data, addWork, review } = useApp();
  const [open, setOpen] = useState(create === "1");
  const [title, setTitle] = useState("我的AI愿望图卡"),
    [description, setDescription] = useState(""),
    [drawing, setDrawing] = useState<Stroke[]>([]),
    [ink, setInk] = useState(c.teal),
    [image, setImage] = useState<string | undefined>(),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [reviewId, setReviewId] = useState<string | null>(null),
    [feedback, setFeedback] = useState("");
  const [picking, setPicking] = useState(false);
  const { width } = useWindowDimensions();
  const works = data.works.filter((w) => w.band === data.band);
  const teacher = data.role === "teacher",
    student = data.role === "student";
  const selected = data.works.find((w) => w.id === reviewId);
  function close() {
    setOpen(false);
    router.setParams({ create: "" });
  }
  async function pick() {
    setError("");
    setPicking(true);
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.5,
        base64: true,
        exif: false,
      });
      if (!r.canceled) {
        const a = r.assets[0];
        if (!a.base64) {
          setError("没有读取到图片，请换一张重试。");
          return;
        }
        const mime = a.mimeType ?? "image/jpeg";
        if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
          setError("请选JPEG、PNG或WebP图片。");
          return;
        }
        const uri = `data:${mime};base64,${a.base64}`;
        if (uri.length > 1_500_000) {
          setError("这张图片比较大，请选一张约1MB以内的图片。");
          return;
        }
        setImage(uri);
      }
    } catch {
      setError("没有打开图片选择器。可以继续在画板画画，或稍后再试。");
    } finally {
      setPicking(false);
    }
  }
  function save() {
    if (!title.trim()) {
      setError("给作品起一个名字吧。");
      return;
    }
    if (!description.trim() && !drawing.length && !image) {
      setError("先画一笔、选一张作品图片，或者写一句你的想法。");
      return;
    }
    const id = addWork({
      title: title.trim().slice(0, 50),
      description: description.trim().slice(0, 500),
      drawing,
      image,
    });
    if (!id) {
      setError("当前最多保存12件本机作品，或本地记录需要恢复。请在设置查看。");
      return;
    }
    close();
    setNotice("原稿已保存，接下来请AI优化成图片。");
    router.push(`/studio/${id}`);
    setDrawing([]);
    setImage(undefined);
    setDescription("");
    setTitle("我的AI愿望图卡");
    setError("");
  }
  return (
    <Shell
      title={
        teacher
          ? "回应每一个小想法"
          : data.role === "parent"
            ? "孩子的作品小展览"
            : "我的作品小展览"
      }
      subtitle={
        teacher
          ? "看到孩子的表达，也留下具体的鼓励。"
          : "把想法画下来，说出来，留住每一个小发现。"
      }
    >
      <View style={s.banner}>
        <Art name="crayon" size={width < 600 ? 68 : 92} />
        <View style={{ flex: 1 }}>
          <Txt size={width < 600 ? 20 : 25} bold>
            {teacher ? "先看想法，再看进步。" : "每个想法，都值得留下。"}
          </Txt>
          <Txt size={13} color={c.muted} style={{ marginTop: 6 }}>
            本机作品不公开，不上传到外部服务。
          </Txt>
        </View>
      </View>
      <View style={{ marginTop: 26 }}>
        <SectionTitle
          title={`已留下 ${works.length} 件作品`}
          action={student ? "＋ 新建作品" : undefined}
          onPress={() => {
            setError("");
            setOpen(true);
          }}
        />
        {!!notice && (
          <View accessibilityRole="alert" style={s.notice}>
            <Txt color={c.teal} size={14}>
              {notice}
            </Txt>
          </View>
        )}
        {!works.length ? (
          <Empty
            art="palette"
            title="第一张愿望图卡，从这里开始"
            description={
              student
                ? "画一画你想请AI帮什么忙，也可以选一张自己的作品照片。"
                : "学生在本机保存作品后，会出现在这里。"
            }
            action={student ? "画出我的想法" : undefined}
            onPress={() => setOpen(true)}
          />
        ) : (
          <View style={{ gap: 24 }}>
            {works.map((w) => (
              <View key={w.id} style={s.work}>
                <View
                  style={{ flexDirection: "row", gap: 20, flexWrap: "wrap" }}
                >
                  <View
                    style={{
                      width: width > 900 ? 300 : "100%",
                      maxWidth: "100%",
                    }}
                  >
                    {w.selectedGenerationId &&
                    w.generations?.find(
                      (g) => g.id === w.selectedGenerationId,
                    ) ? (
                      <WorkImage
                        source={mockImage(
                          w.generations.find(
                            (g) => g.id === w.selectedGenerationId,
                          )!,
                        )}
                      />
                    ) : w.drawing.length ? (
                      <Drawing strokes={w.drawing} />
                    ) : w.image ? (
                      <Image
                        source={{ uri: w.image }}
                        style={{
                          width: "100%",
                          aspectRatio: 1.8,
                          borderRadius: 15,
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={s.textArt}>
                        <Art name="memo" size={75} />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 190 }}>
                    <Tag
                      label={w.reviewed ? "老师已回应" : "已保存 · 等待回应"}
                      tone={w.reviewed ? "green" : "neutral"}
                    />
                    <Txt size={22} bold style={{ marginTop: 13 }}>
                      {w.title}
                    </Txt>
                    <Txt size={14} color={c.muted} style={{ marginTop: 7 }}>
                      {formatDate(w.createdAt)} · 第一课愿望图卡
                    </Txt>
                    {!!w.description && (
                      <Txt style={{ marginTop: 13 }}>{w.description}</Txt>
                    )}
                    {!!w.feedback && (
                      <View style={s.feedback}>
                        <Icon
                          name="chatbubble-outline"
                          size={20}
                          color={c.teal}
                        />
                        <Txt size={14} color={c.teal} style={{ flex: 1 }}>
                          老师说：{w.feedback}
                        </Txt>
                      </View>
                    )}
                    <Button
                      label={student ? "原稿与AI创作" : "查看原稿与AI图"}
                      secondary
                      small
                      onPress={() => router.push(`/studio/${w.id}`)}
                      style={{ marginTop: 15 }}
                    />
                    {!!w.selectedGenerationId && (
                      <Txt size={12} color={c.teal} style={{ marginTop: 8 }}>
                        已选AI优化图 · Mock预制示例
                      </Txt>
                    )}
                    {teacher && (
                      <Button
                        label={w.reviewed ? "修改这条评语" : "给作品写评语"}
                        secondary
                        icon="create-outline"
                        onPress={() => {
                          setReviewId(w.id);
                          setFeedback(w.feedback);
                        }}
                        style={{ marginTop: 18 }}
                      />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      <Dialog
        visible={(open || create === "1") && student}
        onClose={close}
        title="我的AI愿望图卡"
      >
        <Txt size={14} color={c.muted} style={{ marginBottom: 20 }}>
          画里的谁，在什么地方，想做什么？不要写家庭地址或联系方式。
        </Txt>
        <Txt bold size={14}>
          作品名字
        </Txt>
        <TextInput
          accessibilityLabel="作品名字"
          value={title}
          onChangeText={setTitle}
          maxLength={50}
          style={s.input}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginVertical: 15,
          }}
        >
          <Txt bold size={14}>
            画一画
          </Txt>
          <View style={{ flexDirection: "row", gap: 7 }}>
            {[c.teal, "#DD7048", "#426B9F", "#E8BA46"].map((col) => (
              <Pressable
                key={col}
                accessibilityRole="button"
                accessibilityLabel={`画笔颜色 ${col}`}
                accessibilityState={{ selected: ink === col }}
                onPress={() => setInk(col)}
                style={{
                  width: 36,
                  height: 36,
                  padding: 5,
                  borderWidth: ink === col ? 2 : 0,
                  borderColor: c.ink,
                  borderRadius: 20,
                }}
              >
                <View
                  style={{ flex: 1, backgroundColor: col, borderRadius: 20 }}
                />
              </Pressable>
            ))}
          </View>
        </View>
        <Drawing editable strokes={drawing} onChange={setDrawing} color={ink} />
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <Button
            label="撤销一笔"
            small
            secondary
            disabled={!drawing.length}
            onPress={() => setDrawing((d) => d.slice(0, -1))}
          />
          <Button
            label="清空画板"
            small
            secondary
            disabled={!drawing.length}
            onPress={() => setDrawing([])}
          />
          <Button
            label={picking ? "读取图片中…" : "选作品照片"}
            small
            secondary
            icon="image-outline"
            disabled={picking}
            onPress={pick}
          />
        </View>
        {!!image && (
          <View style={{ marginBottom: 18 }}>
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: 130 }}
              resizeMode="contain"
            />
            <Pressable
              onPress={() => setImage(undefined)}
              accessibilityRole="button"
              style={{ padding: 10 }}
            >
              <Txt color={c.teal} size={13}>
                移除这张图片
              </Txt>
            </Pressable>
          </View>
        )}
        <Txt size={14} bold>
          我的想法，也可以请老师帮忙记
        </Txt>
        <TextInput
          accessibilityLabel="我的作品想法"
          placeholder="我想请AI帮我……"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={500}
          style={[s.input, { height: 90, textAlignVertical: "top" }]}
        />
        {!!error && (
          <Txt size={13} color={c.red} style={{ marginVertical: 10 }}>
            {error}
          </Txt>
        )}
        <Txt size={11} color={c.muted} style={{ marginVertical: 15 }}>
          只保存在这台设备。不要用真实学生资料进行原型体验。
        </Txt>
        <Button
          label="保存原稿，去AI优化"
          icon="checkmark-outline"
          onPress={save}
          disabled={picking || data.works.length >= 12}
        />
      </Dialog>
      <Dialog
        visible={!!selected && teacher}
        onClose={() => setReviewId(null)}
        title="给作品一个回应"
      >
        <Txt size={17} bold>
          {selected?.title}
        </Txt>
        <Txt size={14} color={c.muted} style={{ marginVertical: 15 }}>
          说说你看到了哪个想法，鼓励孩子再改一处。评语只保存在本机。
        </Txt>
        <TextInput
          accessibilityLabel="老师评语"
          placeholder="我发现你……下次可以试试……"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          maxLength={400}
          style={[s.input, { height: 150, textAlignVertical: "top" }]}
        />
        <Button
          label="保存这条评语"
          disabled={!feedback.trim()}
          onPress={() => {
            if (reviewId) review(reviewId, feedback.trim());
            setReviewId(null);
            setNotice("评语已保存，可切换家长体验查看。");
          }}
          style={{ marginTop: 20 }}
        />
      </Dialog>
    </Shell>
  );
}
const s = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    backgroundColor: c.peach,
    padding: 25,
    borderRadius: 24,
  },
  notice: {
    padding: 16,
    backgroundColor: c.mint,
    borderRadius: 12,
    marginBottom: 20,
  },
  work: {
    padding: 23,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.white,
    borderRadius: 21,
  },
  textArt: {
    backgroundColor: "#F4F0E4",
    borderRadius: 15,
    aspectRatio: 1.8,
    alignItems: "center",
    justifyContent: "center",
  },
  feedback: {
    padding: 16,
    marginTop: 17,
    backgroundColor: c.mint,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#D5DAD1",
    borderRadius: 11,
    backgroundColor: c.white,
    color: c.ink,
    fontSize: 15,
    marginTop: 9,
    minHeight: 48,
  },
});
