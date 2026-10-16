import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Image,
  ImageStyle,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { assets, Asset } from "../data/content";
import { Role, bandNames, bands, roleNames } from "../lib/domain";
import { useApp } from "../lib/store";
import { color as c } from "./theme";
export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export function Icon({
  name,
  size = 22,
  color = c.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function Txt({
  children,
  size = 16,
  bold = false,
  color = c.ink,
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  size?: number;
  bold?: boolean;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontSize: size,
          color,
          fontWeight: bold ? "700" : "400",
          lineHeight: size * 1.5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Art({
  name,
  size = 90,
  style,
}: {
  name: Asset;
  size?: number;
  style?: ImageStyle;
}) {
  return (
    <Image
      source={assets[name]}
      resizeMode="contain"
      accessible={false}
      style={[{ width: size, height: size }, style]}
    />
  );
}
export function Robot({ size = 120 }: { size?: number }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const s = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => s.remove();
  }, []);
  return (
    <Art
      name={Platform.OS === "web" && !reduced ? "robotAnimated" : "robot"}
      size={size}
    />
  );
}
export function Button({
  label,
  onPress,
  icon,
  secondary = false,
  disabled = false,
  small = false,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary ? s.secondary : s.primary,
        small && { minHeight: 43, paddingHorizontal: 17 },
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={small ? 18 : 21}
          color={secondary ? c.teal : c.white}
        />
      )}
      <Txt size={small ? 14 : 16} color={secondary ? c.teal : c.white} bold>
        {label}
      </Txt>
    </Pressable>
  );
}
export function Tag({
  label,
  tone = "green",
}: {
  label: string;
  tone?: "green" | "orange" | "neutral";
}) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor:
          tone === "green" ? c.mint : tone === "orange" ? c.peach : "#F0F0EB",
      }}
    >
      <Txt
        size={12}
        bold
        color={
          tone === "orange" ? c.orange : tone === "green" ? c.teal : c.muted
        }
      >
        {label}
      </Txt>
    </View>
  );
}
export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.sectionHeading}>
      <Txt size={22} bold>
        {title}
      </Txt>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={{ padding: 9 }}
        >
          <Txt color={c.teal} size={14} bold>
            {action} ›
          </Txt>
        </Pressable>
      )}
    </View>
  );
}
export function Empty({
  art = "memo",
  title,
  description,
  action,
  onPress,
}: {
  art?: Asset;
  title: string;
  description: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.empty}>
      <Art name={art} size={95} />
      <Txt size={21} bold style={{ marginTop: 16 }}>
        {title}
      </Txt>
      <Txt
        color={c.muted}
        style={{ textAlign: "center", maxWidth: 460, marginTop: 8 }}
      >
        {description}
      </Txt>
      {action && onPress && (
        <Button label={action} onPress={onPress} style={{ marginTop: 22 }} />
      )}
    </View>
  );
}
export function Dialog({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.modalOverlay}>
        <Pressable
          accessibilityLabel="关闭弹窗"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={s.modalBody}>
          <View style={s.sectionHeading}>
            <Txt size={23} bold>
              {title}
            </Txt>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="关闭"
              onPress={onClose}
              style={s.iconButton}
            >
              <Icon name="close" />
            </Pressable>
          </View>
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const navs = [
  {
    path: "/",
    icon: "grid-outline",
    student: "我的探索",
    teacher: "课堂工作台",
    parent: "学习记录",
  },
  {
    path: "/courses",
    icon: "book-outline",
    student: "探索课程",
    teacher: "课程资源",
    parent: "课程地图",
  },
  {
    path: "/chat",
    icon: "chatbubble-ellipses-outline",
    student: "图灵老师",
    teacher: "图灵体验",
    parent: "图灵体验",
  },
  {
    path: "/works",
    icon: "color-palette-outline",
    student: "我的作品",
    teacher: "作品评阅",
    parent: "孩子的作品",
  },
] as const;
export function Shell({
  children,
  title,
  subtitle,
  scroll = true,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  scroll?: boolean;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 1050;
  const { data, ready, error, recovery, updateRole, updateBand, retry } =
    useApp();
  const [chooseRole, setChooseRole] = useState(false),
    [chooseBand, setChooseBand] = useState(false);
  const pathname = usePathname();
  if (!ready)
    return (
      <SafeAreaView
        style={[s.root, { alignItems: "center", justifyContent: "center" }]}
      >
        <Robot size={80} />
        <ActivityIndicator color={c.teal} style={{ margin: 20 }} />
        <Txt>正在打开你的探索空间…</Txt>
      </SafeAreaView>
    );
  const links = navs.map((n) => {
    const active =
      n.path === "/" ? pathname === "/" : pathname.startsWith(n.path);
    return (
      <Pressable
        key={n.path}
        accessibilityRole="button"
        accessibilityLabel={n[data.role]}
        accessibilityState={{ selected: active }}
        onPress={() => router.push(n.path)}
        style={({ pressed }) => [
          wide ? s.navItem : s.mobileNav,
          active && { backgroundColor: wide ? c.mint : "transparent" },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Icon
          name={n.icon}
          color={active ? c.teal : c.muted}
          size={wide ? 22 : 23}
        />
        <Txt
          size={wide ? 15 : 11}
          bold={active}
          color={active ? c.teal : c.muted}
        >
          {n[data.role]}
        </Txt>
      </Pressable>
    );
  });
  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right", "bottom"]}>
      <View style={s.outer}>
        {wide && (
          <View style={s.sidebar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="回到我的探索"
              onPress={() => router.push("/")}
              style={s.brand}
            >
              <Robot size={42} />
              <View>
                <Txt size={19} bold>
                  图灵AI学伴
                </Txt>
                <Txt size={10} color={c.muted}>
                  带着好奇，一起探索
                </Txt>
              </View>
            </Pressable>
            <Txt
              size={10}
              color={c.muted}
              style={{ marginLeft: 18, marginBottom: 12, letterSpacing: 2 }}
            >
              我的学习空间
            </Txt>
            <View style={{ gap: 8 }}>{links}</View>
            <View style={{ flex: 1 }} />
            <View style={s.sideNote}>
              <Icon name="sparkles-outline" color={c.teal} />
              <Txt size={13} bold>
                每个想法都值得试一试
              </Txt>
              <Txt size={12} color={c.muted}>
                先想一想，再让AI帮帮忙。
              </Txt>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/profile")}
              style={s.navItem}
            >
              <Icon name="settings-outline" color={c.muted} />
              <Txt size={14} color={c.muted}>
                设置与体验说明
              </Txt>
            </Pressable>
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={[
              s.topbar,
              !wide && { paddingHorizontal: 20 },
              width < 650 && {
                height: 112,
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 5,
              },
            ]}
          >
            {!wide ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="回到首页"
                onPress={() => router.push("/")}
                style={{ flexDirection: "row", alignItems: "center", gap: 9 }}
              >
                <Robot size={32} />
                <Txt bold size={17}>
                  图灵AI学伴
                </Txt>
              </Pressable>
            ) : (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <View style={s.liveDot} />
                <Txt size={13} color={c.muted}>
                  一份好奇心，一段新发现
                </Txt>
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                gap: wide ? 20 : 10,
                alignItems: "center",
                ...(width < 650
                  ? ({
                      alignSelf: "stretch",
                      justifyContent: "space-between",
                    } as const)
                  : {}),
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="选择年级"
                onPress={() => setChooseBand(true)}
                style={s.selectButton}
              >
                <Txt size={wide ? 14 : 12} bold>
                  {width < 650 ? `${data.band}年级` : bandNames[data.band]}
                </Txt>
                <Icon name="chevron-down" size={14} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="切换体验身份"
                onPress={() => setChooseRole(true)}
                style={s.roleButton}
              >
                <Icon name="person-outline" size={17} />
                <Txt size={wide ? 13 : 12}>{roleNames[data.role]}体验</Txt>
              </Pressable>
            </View>
          </View>
          {!!error && (
            <View accessibilityRole="alert" style={s.errorBar}>
              <Txt size={13} color={c.red} style={{ flex: 1 }}>
                {error}
              </Txt>
              <Pressable
                accessibilityRole="button"
                onPress={recovery ? () => router.push("/profile") : retry}
              >
                <Txt size={13} bold color={c.teal}>
                  {recovery ? "查看设置" : "重试保存"}
                </Txt>
              </Pressable>
            </View>
          )}
          {scroll ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[s.page, { padding: wide ? 36 : 20 }]}>
                <View style={{ marginBottom: 26 }}>
                  <Txt size={wide ? 30 : 26} bold>
                    {title}
                  </Txt>
                  {!!subtitle && (
                    <Txt size={14} color={c.muted} style={{ marginTop: 5 }}>
                      {subtitle}
                    </Txt>
                  )}
                </View>
                {children}
                <View style={{ height: 30 }} />
                <Txt size={11} color={c.muted}>
                  课程体验版 · 记录仅保存在当前设备
                </Txt>
              </View>
            </ScrollView>
          ) : (
            <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
          )}
          {!wide && (
            <View style={s.bottomNav}>
              {links}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="设置"
                onPress={() => router.push("/profile")}
                style={s.mobileNav}
              >
                <Icon name="settings-outline" size={23} color={c.muted} />
                <Txt size={11} color={c.muted}>
                  设置
                </Txt>
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <Dialog
        visible={chooseRole}
        title="选择体验身份"
        onClose={() => setChooseRole(false)}
      >
        <Txt size={14} color={c.muted} style={{ marginBottom: 18 }}>
          三个视角共用当前设备的学习记录。这是界面演示，尚未连接真实账号。
        </Txt>
        {(["student", "teacher", "parent"] as Role[]).map((r, i) => (
          <Pressable
            key={r}
            accessibilityRole="button"
            accessibilityLabel={`以${roleNames[r]}身份体验`}
            onPress={() => {
              updateRole(r);
              setChooseRole(false);
              router.replace("/");
            }}
            style={[
              s.roleOption,
              data.role === r && {
                borderColor: c.teal,
                backgroundColor: c.mint,
              },
            ]}
          >
            <Art
              name={(["rabbit", "teacher", "home"] as Asset[])[i]}
              size={47}
            />
            <View style={{ flex: 1 }}>
              <Txt bold size={17}>
                {roleNames[r]}
              </Txt>
              <Txt size={12} color={c.muted}>
                {
                  [
                    "看课、提问、完成我的作品",
                    "打开课堂、布置任务、评阅作品",
                    "查看学习记录和孩子的作品",
                  ][i]
                }
              </Txt>
            </View>
            <Icon
              name={data.role === r ? "checkmark-circle" : "chevron-forward"}
              color={c.teal}
            />
          </Pressable>
        ))}
      </Dialog>
      <Dialog
        visible={chooseBand}
        title="选择学习年级"
        onClose={() => setChooseBand(false)}
      >
        <Txt color={c.muted} size={14} style={{ marginBottom: 18 }}>
          同一个主题，适合不同年龄的探索。第一课完整体验目前开放一至二年级。
        </Txt>
        {bands.map((b) => (
          <Pressable
            key={b}
            accessibilityRole="button"
            onPress={() => {
              updateBand(b);
              setChooseBand(false);
            }}
            style={[
              s.roleOption,
              data.band === b && {
                backgroundColor: c.mint,
                borderColor: c.teal,
              },
            ]}
          >
            <Txt bold style={{ flex: 1 }}>
              {bandNames[b]}
            </Txt>
            <Txt size={13} color={c.muted}>
              {b === "1-2"
                ? "故事与体验"
                : b === "3-4"
                  ? "提问与合作"
                  : b === "5-6"
                    ? "创作与项目"
                    : "协作与自动化"}
            </Txt>
          </Pressable>
        ))}
      </Dialog>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.paper },
  outer: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 235,
    backgroundColor: "#FDFCF8",
    borderRightWidth: 1,
    borderColor: c.line,
    padding: 18,
    gap: 14,
  },
  brand: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginVertical: 17,
    marginBottom: 36,
  },
  navItem: {
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    minHeight: 50,
  },
  mobileNav: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 62,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: c.line,
    backgroundColor: c.white,
    paddingHorizontal: 8,
  },
  sideNote: {
    paddingVertical: 22,
    paddingHorizontal: 13,
    gap: 10,
    borderTopWidth: 1,
    borderColor: c.line,
  },
  topbar: {
    height: 82,
    paddingHorizontal: 36,
    borderBottomWidth: 1,
    borderColor: c.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  roleButton: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    backgroundColor: "#F1EEE5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.teal },
  page: { width: "100%", maxWidth: 1320, alignSelf: "center", flexGrow: 1 },
  button: {
    minHeight: 51,
    borderRadius: 13,
    paddingHorizontal: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    alignSelf: "flex-start",
  },
  primary: { backgroundColor: c.teal },
  secondary: { backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  empty: {
    paddingVertical: 52,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#F2F2EB",
    borderRadius: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,42,45,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBody: {
    width: "100%",
    maxWidth: 510,
    maxHeight: "85%",
    backgroundColor: c.paper,
    padding: 26,
    borderRadius: 24,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  roleOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 15,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginBottom: 12,
    minHeight: 72,
  },
  errorBar: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 20,
    backgroundColor: "#FFF0E8",
    flexDirection: "row",
    alignItems: "center",
  },
});
