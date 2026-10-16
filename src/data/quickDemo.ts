import {
  appendGeneration,
  completeClassroom,
  initialData,
  selectGeneration,
  type AppData,
  type Work,
} from "../lib/domain.ts";
export const quickStages = [
  {
    id: "classroom",
    title: "老师开课",
    role: "老师",
    seconds: 90,
    text: "17页课堂缩时预览；正常课堂保留40分钟和三段原站科普视频。",
    narration:
      "欢迎来到图灵AI探索课。我是图灵老师！今天，我们一起认识人工智能，看看它怎样帮助人们听声音、看图片和编故事。AI是人制作的工具，不同的工具有不同的本领。它有时候也会出错，所以结果需要我们检查。正式课堂会穿插三段现成科普短片，这里用课程图卡快速预览。接着，我们看一个编故事的例子。只说帮我编故事，工具还不知道我们想要什么。把谁、在哪里、做什么讲清楚，想法就更容易表达。比如，小兔在想象中的月亮花园种胡萝卜。再加一句，请给小兔加一个小熊朋友，就能继续修改。这是想象故事，真实月亮上不能直接这样种菜。现在，轮到我们画出自己的小想法啦！",
  },
  {
    id: "sketch",
    title: "画出我的想法",
    role: "学生",
    seconds: 30,
    text: "示例草图自动绘制，保留孩子的原稿和一句话想法。",
    narration:
      "先画出自己的想法，再请AI帮忙。这张演示原稿是一只小兔，旁边还有一棵胡萝卜。我们写下一句话：我想画小兔在月亮花园给胡萝卜浇水。原稿会保留，最后选哪张图片，由我们自己决定。",
  },
  {
    id: "generate",
    title: "AI优化成图片",
    role: "学生",
    seconds: 25,
    text: "展示Mock生成过程与绘本风格结果，不调用模型。",
    narration:
      "把想法说清楚，选一个喜欢的画风。现在请AI帮忙，把小想法变成绘本里的画面。这次演示使用提前准备好的图片，不会识别任意草图，也不会调用实时模型。看看小兔、花园和胡萝卜，是不是都出现了？",
  },
  {
    id: "revise",
    title: "再改一下",
    role: "学生",
    seconds: 25,
    text: "追加“加一个小熊朋友”，保存两个版本并选定最终图片。",
    narration:
      "想给画面加一点变化？我们补上一句：请加一个小熊朋友。看，小熊也来到花园了！前后两个版本都保留。比较之后，我们选有小熊的这一张作为最终作品。修改哪里、选择哪张，都由人来决定。",
  },
  {
    id: "review",
    title: "老师点评",
    role: "老师",
    seconds: 30,
    text: "自动填写并保存示例点评；暂停后也可自行修改。",
    narration:
      "现在切换到老师视角。老师能对照原稿和优化图，发现孩子的表达，再留下具体的鼓励。这段点评是为录屏准备的示例：你说清了角色、地点和事情，也检查了修改结果。下次可以再给朋友设计一个新任务。",
  },
  {
    id: "parent",
    title: "家长查看",
    role: "家长",
    seconds: 40,
    text: "查看同一件作品、两个图片版本与已保存的示例点评。",
    narration:
      "最后来到家长视角。这里能看到刚才保留的原稿、最终选择的图片，以及老师写下的点评。家长可以问问孩子，你想了什么，又改了哪里？这条快速流程使用独立的演示记录，完整课堂仍然保留四十分钟。课堂、创作、修改、点评和家长查看，现在已经连起来了！",
  },
] as const;
export const demoFeedback =
  "你说清了角色、地点和事情，也检查了修改结果。下次可以再给朋友设计一个新任务。";
export function quickPosition(elapsed: number, duration: number) {
  const seconds = Math.max(0, Math.min(duration, elapsed));
  let start = 0;
  for (let i = 0; i < quickStages.length; i++) {
    const length = (quickStages[i].seconds * duration) / 240;
    if (seconds < start + length || i === quickStages.length - 1)
      return {
        index: i,
        start,
        length,
        local: Math.min(length, seconds - start),
        finished: seconds >= duration,
      };
    start += length;
  }
  throw new Error("Invalid demo timeline");
}
export function quickStageStart(index: number, duration: number) {
  return quickStages
    .slice(0, index)
    .reduce((sum, s) => sum + (s.seconds * duration) / 240, 0);
}
// A fixed fictional sketch; no photos or personal records are read by this mode.
const rabbit = [
  [
    [100, 140],
    [84, 128],
    [80, 103],
    [91, 83],
    [120, 76],
    [150, 85],
    [160, 106],
    [150, 132],
    [130, 142],
    [100, 140],
  ],
  [
    [95, 83],
    [86, 40],
    [92, 20],
    [102, 23],
    [111, 77],
  ],
  [
    [125, 77],
    [130, 27],
    [139, 18],
    [148, 25],
    [146, 86],
  ],
  [
    [103, 101],
    [106, 101],
  ],
  [
    [134, 101],
    [137, 101],
  ],
  [
    [114, 116],
    [120, 121],
    [126, 116],
  ],
  [
    [101, 140],
    [85, 178],
    [90, 205],
    [150, 205],
    [158, 176],
    [139, 140],
  ],
  [
    [200, 155],
    [240, 155],
    [219, 213],
    [200, 155],
  ],
  [
    [220, 155],
    [207, 131],
  ],
  [
    [220, 155],
    [224, 127],
  ],
  [
    [220, 155],
    [240, 133],
  ],
];
export function quickSnapshot(
  elapsed: number,
  duration: number,
  timestamp: string,
  feedback = demoFeedback,
): AppData {
  const p = quickPosition(elapsed, duration);
  let data = initialData();
  if (p.index > 0) data = completeClassroom({ ...data, role: "teacher" });
  // Keep the demo timestamp deterministic; never present a 4-minute run as 40 minutes learned.
  if (data.progress["1-2:1"]) data.progress["1-2:1"].completedAt = timestamp;
  data.role =
    p.index === 0 || p.index === 4
      ? "teacher"
      : p.index === 5
        ? "parent"
        : "student";
  if (!p.index) return data;
  const fraction = p.index > 1 ? 1 : Math.min(1, (p.local / p.length) * 2);
  let work: Work = {
    id: "quick-demo-work",
    band: "1-2",
    title: "小兔的月亮花园 · 演示作品",
    description: "我想画小兔在想象中的月亮花园，给胡萝卜浇水。",
    drawing: rabbit
      .slice(0, Math.max(1, Math.ceil(rabbit.length * fraction)))
      .map((points) => ({
        color: "#227C75",
        points: points.map(([x, y]) => ({ x: x * 2.5 + 40, y: y * 1.6 + 40 })),
      })),
    createdAt: timestamp,
    feedback: "",
    reviewed: false,
  };
  if (p.index > 2 || (p.index === 2 && p.local >= p.length * 0.2))
    work = appendGeneration(work, {
      id: "demo-base",
      style: "storybook",
      variant: "base",
      prompt: work.description,
      createdAt: timestamp,
      mode: "mock",
    });
  if (p.index > 3 || (p.index === 3 && p.local >= p.length * 0.2))
    work = appendGeneration(work, {
      id: "demo-friend",
      style: "storybook",
      variant: "friend",
      prompt: `${work.description} 加一个小熊朋友。`,
      createdAt: timestamp,
      mode: "mock",
    });
  if (p.index > 3 || (p.index === 3 && p.local >= p.length * 0.55))
    work = selectGeneration(work, "demo-friend");
  if (p.index >= 4) {
    work.feedback = feedback;
    work.reviewed = p.index > 4 || p.local >= p.length * 0.7;
  }
  data.works = [work];
  return data;
}
