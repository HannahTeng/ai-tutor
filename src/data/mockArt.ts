import type { MockGeneration } from "../lib/domain";
export const mockImages = {
  storybook: require("../../assets/mock/moon-storybook.png"),
  pencil: require("../../assets/mock/moon-pencil.png"),
  friend: require("../../assets/mock/moon-friend.png"),
};
export function mockImage(g: MockGeneration) {
  return mockImages[g.variant === "friend" ? "friend" : g.style];
}
export const demoPrompt = "小兔在想象中的月亮花园，给胡萝卜浇水。";
