import syllabus from "./syllabus.json";
import { Band } from "../lib/domain";
export type Lesson = {
  id: number;
  title: string;
  teach: string;
  interaction: string;
  outcome: string;
};
export const courses = syllabus as Record<Band, Lesson[]>;
export const assets = {
  robot: require("../../assets/course/turing.png"),
  robotAnimated: require("../../assets/course/turing.gif"),
  rabbit: require("../../assets/course/rabbit.png"),
  moon: require("../../assets/course/moon.png"),
  carrot: require("../../assets/course/carrot.png"),
  palette: require("../../assets/course/palette.png"),
  book: require("../../assets/course/book.png"),
  mic: require("../../assets/course/mic.png"),
  teacher: require("../../assets/course/teacher.png"),
  magnifier: require("../../assets/course/magnifier.png"),
  bear: require("../../assets/course/bear.png"),
  crayon: require("../../assets/course/crayon.png"),
  memo: require("../../assets/course/memo.png"),
  bulb: require("../../assets/course/bulb.png"),
  thinking: require("../../assets/course/thinking.png"),
  home: require("../../assets/course/home.png"),
  school: require("../../assets/course/school.png"),
  cat: require("../../assets/course/cat.png"),
  video: require("../../assets/course/video.png"),
};
export type Asset = keyof typeof assets;
export const lessonArt: Asset[] = [
  "robot",
  "book",
  "teacher",
  "bulb",
  "mic",
  "thinking",
  "palette",
  "mic",
  "book",
  "video",
  "bear",
  "memo",
  "teacher",
  "bulb",
  "magnifier",
  "palette",
];
export const questions = [
  {
    title: "AI可以帮我编一个小故事吗？",
    choices: ["可以试一试", "永远都不可以"],
    answer: 0,
    explain: "可以尝试请AI帮忙编故事，再看看它是不是符合你的想法。",
  },
  {
    title: "AI每一次都答对吗？",
    choices: ["每次都对，不用检查", "也会出错，要检查"],
    answer: 1,
    explain: "AI也会认错或说错。我们可以观察线索，找老师一起核对。",
  },
  {
    title: "肚子不舒服，应该先找谁？",
    choices: ["只问AI就够了", "告诉老师或家长"],
    answer: 1,
    explain: "身体不舒服或害怕，要及时告诉身边的老师或家长。",
  },
];
export const introScript =
  "小朋友们好！我是图灵老师，是屏幕里的AI老师。AI也叫人工智能。人们做出这样的工具，让它帮助我们完成一些事情。比如，有的AI能回答问题，有的能帮忙编故事。今天我们一起当小小探索员，看看AI能帮什么忙。";
export const lessonSteps = [
  {
    label: "认识图灵",
    title: "你好，我是图灵老师",
    body: "AI是人制作的小帮手。它可以帮一些忙，也可能出错。",
    art: ["robot", "book"] as Asset[],
    narration: introScript,
  },
  {
    label: "AI会帮忙",
    title: "它可以帮什么忙？",
    body: "听课时认识过：处理声音、找图片线索、帮忙想创作点子。",
    art: ["book", "magnifier", "palette"] as Asset[],
    narration:
      "有的AI能按要求讲故事，有的能帮助辨认图片。不过，不是每台会说话的机器都有AI。我们看看它具体做了什么。",
  },
  {
    label: "说清想法",
    title: "谁？在哪里？做什么？",
    body: "小兔，在月亮上，种萝卜。这样的想法更清楚！这是一个想象故事。",
    art: ["rabbit", "moon", "carrot"] as Asset[],
    narration:
      "请AI帮忙时，可以告诉它：谁，在哪里，做什么。比如，请编一个小兔在月亮上种萝卜的想象故事。如果结果不同，再告诉它想改哪里。",
  },
  {
    label: "我会求助",
    title: "不确定，找老师",
    body: "AI答错了，我们一起检查。身体不舒服，要告诉老师或家长。",
    art: ["thinking", "teacher"] as Asset[],
    narration:
      "AI也会出错。有疑问，我们找身边的老师一起看看。如果身体不舒服，或者遇到害怕的事，要及时告诉老师或家长。不要把家庭地址和密码告诉AI。",
  },
];
export { default as lesson01 } from "./lesson01.json";
export const classroomSlides = [
  require("../../assets/course/slide-01.png"),
  require("../../assets/course/slide-02.png"),
  require("../../assets/course/slide-03.png"),
  require("../../assets/course/slide-04.png"),
  require("../../assets/course/slide-05.png"),
  require("../../assets/course/slide-06.png"),
  require("../../assets/course/slide-07.png"),
  require("../../assets/course/slide-08.png"),
  require("../../assets/course/slide-09.png"),
  require("../../assets/course/slide-10.png"),
  require("../../assets/course/slide-11.png"),
  require("../../assets/course/slide-12.png"),
  require("../../assets/course/slide-13.png"),
  require("../../assets/course/slide-14.png"),
  require("../../assets/course/slide-15.png"),
  require("../../assets/course/slide-16.png"),
  require("../../assets/course/slide-17.png"),
];
export function demoReply(question: string, band: Band) {
  const q = question.trim();
  let reply: string;
  if (/不舒服|肚子|受伤|害怕/.test(q))
    reply =
      "身体不舒服或遇到让你害怕的事，请先告诉身边的老师或家长，让他们及时帮助你。";
  else if (/地址|密码|电话|身份证/.test(q))
    reply =
      "家庭地址、密码和联系方式是个人资料，不用发给我。你可以使用虚构名字来编故事。";
  else if (/错|知道|正确|聪明/.test(q))
    reply =
      "AI会从很多例子里学习，但也可能看错、说错。有疑问时，我们先找线索，再请老师或查可靠资料一起核对。";
  else if (/加.*小熊|朋友|修改/.test(q))
    reply =
      "小兔和小熊坐上想象中的飞船来到月亮花园。它们一起种下胡萝卜种子，约好分享收获。\n\n和上一份示例相比，这次增加了朋友，动作也变成一起完成。";
  else if (/小熊/.test(q))
    reply =
      "小熊带着种子，坐上想象中的飞船来到月亮花园。它种下胡萝卜种子，等着和朋友分享。\n\n这是想象故事，真实月亮上不能这样直接种菜。";
  else if (/小兔|月亮|故事/.test(q))
    reply = /月亮|萝卜/.test(q)
      ? "小兔带着种子，坐上想象中的飞船来到月亮花园。它种下胡萝卜种子，等着和朋友分享。\n\n这是想象故事，真实月亮上不能这样直接种菜。"
      : "小熊出门去玩，遇到一位新朋友。它们一起度过快乐的一天。\n\n这是课前准备的示例。说清角色、地点和事情，会让要求更明确。";
  else if (/提示词|说清|怎么问/.test(q))
    reply =
      "先说清楚你想做什么，再告诉我“谁、在哪里、做什么”。比如：请编两句话，讲小兔在月亮上种萝卜。你想先试哪个角色？";
  else if (/AI是什么|人工智能|什么是AI/.test(q))
    reply =
      "AI也叫人工智能，是人制作的工具。它可以帮助我们讲故事、找图片里的线索，也会出错。你在生活里见过哪一种AI小帮手？";
  else if (/画|作品|创作/.test(q))
    reply =
      "先想一个角色，再选一个地方，最后想它正在做什么。你可以在“我的作品”里画出来，也可以写一句话。你想画谁呢？";
  else
    reply =
      "我们把你的想法变得更清楚一点：你想让AI帮你做什么？可以先说一个角色、一个地方，或者一个想解决的小问题。";
  if (band === "7-9")
    reply += "\n\n进一步想想：这个回答有哪些地方需要证据？你会怎样验证？";
  if (band === "5-6")
    reply += "\n\n试着补充一个限制条件，再比较修改前后的结果。";
  return reply;
}
