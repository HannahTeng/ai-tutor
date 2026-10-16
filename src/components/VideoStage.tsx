import React from "react";
import { Linking, View } from "react-native";
import { Button, Txt } from "./ui";
export type VideoStageProps = {
  page: number;
  title: string;
  url: string;
  playing?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
  onLocalSelected?: () => void;
};
export default function VideoStage({ title, url }: VideoStageProps) {
  return (
    <View style={{ padding: 24, gap: 20 }}>
      <Txt bold>{title}</Txt>
      <Txt>
        手机原生版可打开原站观看，返回后继续本页。也可直接使用图卡讲解。
      </Txt>
      <Button label="打开科普中国原站" onPress={() => Linking.openURL(url)} />
    </View>
  );
}
