import React, { useLayoutEffect, useRef } from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Stroke } from "../lib/domain";
export function Drawing({
  strokes,
  onChange,
  color = "#227C75",
  editable = false,
}: {
  strokes: Stroke[];
  onChange?: (s: Stroke[]) => void;
  color?: string;
  editable?: boolean;
}) {
  const size = useRef({ width: 800, height: 440 });
  const latest = useRef(strokes);
  const active = useRef(false);
  useLayoutEffect(() => {
    latest.current = strokes;
  }, [strokes]);
  function point(e: GestureResponderEvent) {
    return {
      x: Math.max(
        0,
        Math.min(800, (e.nativeEvent.locationX / size.current.width) * 800),
      ),
      y: Math.max(
        0,
        Math.min(440, (e.nativeEvent.locationY / size.current.height) * 440),
      ),
    };
  }
  function begin(e: GestureResponderEvent) {
    if (!editable || !onChange || latest.current.length >= 200) return;
    active.current = true;
    const next = [...latest.current, { color, points: [point(e)] }];
    latest.current = next;
    onChange(next);
  }
  function move(e: GestureResponderEvent) {
    if (!active.current || !onChange) return;
    const a = latest.current,
      stroke = a[a.length - 1];
    if (!stroke || stroke.points.length >= 1000) return;
    const next = [
      ...a.slice(0, -1),
      { ...stroke, points: [...stroke.points, point(e)] },
    ];
    latest.current = next;
    onChange(next);
  }
  return (
    <View
      accessibilityLabel={
        editable ? "作品画板，用手指或鼠标画画" : "学生绘画作品"
      }
      style={[s.board, { touchAction: "none" } as ViewStyle]}
      onLayout={(e) => {
        size.current = e.nativeEvent.layout;
      }}
      onStartShouldSetResponder={() => editable}
      onMoveShouldSetResponder={() => editable}
      onResponderGrant={begin}
      onResponderMove={move}
      onResponderRelease={() => {
        active.current = false;
      }}
      onResponderTerminate={() => {
        active.current = false;
      }}
    >
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox="0 0 800 440"
      >
        {strokes.map((stroke, i) => (
          <Path
            key={i}
            d={
              stroke.points.length === 1
                ? `M${stroke.points[0].x} ${stroke.points[0].y} l1 1`
                : stroke.points
                    .map((p, j) => `${j ? "L" : "M"}${p.x} ${p.y}`)
                    .join(" ")
            }
            stroke={stroke.color}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}
const s = StyleSheet.create({
  board: {
    width: "100%",
    aspectRatio: 800 / 440,
    backgroundColor: "#FFFDF5",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E7E1D2",
  },
});
