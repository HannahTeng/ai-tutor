import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";

/** Constrain static image dimensions so RN Web cannot insert the asset's pixel height. */
export default function WorkImage({
  source,
  label,
}: {
  source: ImageSourcePropType;
  label?: string;
}) {
  return (
    <View
      style={{
        width: "100%",
        aspectRatio: 1.5,
        borderRadius: 15,
        overflow: "hidden",
      }}
    >
      <Image
        accessibilityLabel={label}
        source={source}
        resizeMode="contain"
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}
