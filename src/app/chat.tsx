import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Button, Icon, Robot, Shell, Tag, Txt } from "../components/ui";
import { color as c } from "../components/theme";
import { useApp } from "../lib/store";
import { bandNames } from "../lib/domain";
import { demoReply } from "../data/content";
import { readAloud, stopSpeaking } from "../lib/speech";
type Message = { id: number; who: "bot" | "me"; text: string };
export default function Chat() {
  const { data } = useApp();
  return <ChatSession key={data.band} />;
}
function ChatSession() {
  const { data } = useApp();
  const [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      who: "bot",
      text: "你好！我是图灵老师。今天想认识AI，还是一起编一个小故事？你可以点下面的小问题，也可以说清楚你的想法。",
    },
  ]);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyRef = useRef(false);
  const { width } = useWindowDimensions();
  const small = width < 700;
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
      void stopSpeaking();
    };
  }, []);

  function send(question = input) {
    const q = question.trim();
    if (!q || busyRef.current) return;
    if (q.length > 300) {
      setError("先用300字以内说一个小问题吧。");
      return;
    }
    setError("");
    setInput("");
    setBusy(true);
    busyRef.current = true;
    setMessages((m) => [
      ...m.slice(-29),
      { id: Date.now(), who: "me", text: q },
    ]);
    timeout.current = setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, who: "bot", text: demoReply(q, data.band) },
      ]);
      setBusy(false);
      busyRef.current = false;
    }, 500);
  }
  async function speak(text: string) {
    try {
      await readAloud(text);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Shell title="图灵老师" scroll={false}>
      <KeyboardAvoidingView
        style={{ flex: 1, minHeight: 0 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
            <Robot size={small ? 48 : 64} />
            <View>
              <Txt size={small ? 21 : 26} bold>
                图灵老师
              </Txt>
              <Txt size={12} color={c.muted}>
                {bandNames[data.band]} · 一起把想法说清楚
              </Txt>
            </View>
          </View>
          <Tag label="演示对话" tone="orange" />
        </View>
        <View style={s.demoNotice}>
          <Icon name="information-circle-outline" size={17} color={c.orange} />
          <Txt size={12} color={c.orange} style={{ flex: 1 }}>
            这里使用预设示例回答，尚未连接真实AI。消息不发往外部服务。
          </Txt>
        </View>
        <ScrollView
          ref={scroll}
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: small ? 19 : 32,
            paddingBottom: 30,
          }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scroll.current?.scrollToEnd({ animated: true })
          }
        >
          <View
            style={{
              width: "100%",
              maxWidth: 900,
              alignSelf: "center",
              gap: 23,
            }}
          >
            {messages.map((m) => (
              <View
                key={m.id}
                style={[s.message, m.who === "me" ? s.me : s.bot]}
              >
                {m.who === "bot" && (
                  <Txt
                    size={12}
                    bold
                    color={c.teal}
                    style={{ marginBottom: 7 }}
                  >
                    图灵老师 · 演示回答
                  </Txt>
                )}
                <Txt size={small ? 16 : 17}>{m.text}</Txt>
                {m.who === "bot" && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="朗读这条回答"
                    onPress={() => speak(m.text)}
                    style={s.listen}
                  >
                    <Icon
                      name="volume-medium-outline"
                      size={17}
                      color={c.teal}
                    />
                    <Txt size={12} color={c.teal}>
                      听一听
                    </Txt>
                  </Pressable>
                )}
              </View>
            ))}
            {busy && (
              <View style={s.bot}>
                <Txt color={c.muted}>正在准备示例回答…</Txt>
              </View>
            )}
          </View>
        </ScrollView>
        <View style={[s.composer, { paddingHorizontal: small ? 18 : 32 }]}>
          {!!error && (
            <Txt color={c.orange} size={13} style={{ marginBottom: 10 }}>
              {error}
            </Txt>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 9, paddingBottom: 13 }}
          >
            {[
              "AI是什么？",
              "为什么AI会答错？",
              "讲一个小兔的故事",
              "怎么把想法说清楚？",
            ].map((q) => (
              <Pressable
                key={q}
                accessibilityRole="button"
                disabled={busy}
                onPress={() => send(q)}
                style={s.prompt}
              >
                <Txt size={13} color={c.teal}>
                  {q}
                </Txt>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.inputRow}>
            <TextInput
              accessibilityLabel="给图灵老师的问题"
              placeholder="我想问图灵……"
              placeholderTextColor={c.muted}
              value={input}
              onChangeText={setInput}
              maxLength={300}
              style={s.input}
              onSubmitEditing={() => send()}
              returnKeyType="send"
              editable={!busy}
            />
            <Button
              label="发送"
              icon="arrow-up"
              disabled={!input.trim() || busy}
              onPress={() => send()}
              small
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Txt size={11} color={c.muted}>
              不输入家庭地址、密码等个人资料。
            </Txt>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="停止朗读"
              onPress={() => {
                void stopSpeaking();
              }}
              style={{ padding: 6 }}
            >
              <Icon name="volume-mute-outline" size={17} color={c.muted} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Shell>
  );
}
const s = StyleSheet.create({
  header: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderColor: c.line,
  },
  demoNotice: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: "#FBF0DF",
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
  },
  message: { padding: 21, borderRadius: 20, maxWidth: "90%" },
  bot: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  me: {
    backgroundColor: c.mint,
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  listen: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    alignSelf: "flex-start",
    paddingTop: 12,
    minHeight: 38,
  },
  composer: {
    paddingTop: 15,
    paddingBottom: 13,
    borderTopWidth: 1,
    borderColor: c.line,
    backgroundColor: c.paper,
  },
  prompt: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: "center",
  },
  inputRow: {
    backgroundColor: c.white,
    padding: 7,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: "#CDD8CE",
    borderRadius: 15,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  input: { flex: 1, minHeight: 44, fontSize: 16, color: c.ink },
});
