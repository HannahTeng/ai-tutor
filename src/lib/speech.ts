import * as Speech from "expo-speech";
export async function readAloud(text: string) {
  const voices = await Speech.getAvailableVoicesAsync();
  const chinese = voices.filter((v) => /^zh[-_]/i.test(v.language));
  const zh =
    chinese.find((v) =>
      /Xiaoxiao|Tingting|婷婷|晓晓|Xiaoyi|晓伊/i.test(v.name),
    ) ?? chinese[0];
  if (!zh)
    throw new Error("这台设备还没有可用的中文声音，可以先读屏幕上的文字。");
  await Speech.stop();
  Speech.speak(text.slice(0, 1500), {
    language: "zh-CN",
    voice: zh.identifier,
    pitch: 1.08,
    rate: 0.96,
  });
}
export const stopSpeaking = () => Speech.stop();
