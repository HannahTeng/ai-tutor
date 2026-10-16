export type Band = "1-2" | "3-4" | "5-6" | "7-9";
export type Role = "student" | "teacher" | "parent";
export type Stroke = { color: string; points: { x: number; y: number }[] };
export type MockGeneration = {
  id: string;
  style: "storybook" | "pencil";
  variant: "base" | "friend";
  prompt: string;
  createdAt: string;
  mode: "mock";
};
export type Work = {
  id: string;
  band: Band;
  title: string;
  description: string;
  image?: string;
  drawing: Stroke[];
  createdAt: string;
  feedback: string;
  reviewed: boolean;
  generations?: MockGeneration[];
  selectedGenerationId?: string;
};
export type Progress = {
  step: number;
  answers: Record<string, number>;
  completed: boolean;
  completedAt?: string;
  completionSource?: "quiz" | "classroom";
};
export type Assignment = {
  id: string;
  band: Band;
  title: string;
  createdAt: string;
};
export type AppData = {
  version: 1;
  role: Role;
  band: Band;
  progress: Record<string, Progress>;
  works: Work[];
  assignment: Assignment | null;
  visits: string[];
};
export const bands: Band[] = ["1-2", "3-4", "5-6", "7-9"];
export const bandNames: Record<Band, string> = {
  "1-2": "一至二年级",
  "3-4": "三至四年级",
  "5-6": "五至六年级",
  "7-9": "七至九年级",
};
export const roleNames: Record<Role, string> = {
  student: "学生",
  teacher: "老师",
  parent: "家长",
};
export function initialData(): AppData {
  return {
    version: 1,
    role: "student",
    band: "1-2",
    progress: {},
    works: [],
    assignment: null,
    visits: [],
  };
}
export function progressKey(band: Band, id: number) {
  return `${band}:${id}`;
}
export const correctAnswers = [0, 1, 1];
export function quizPassed(answers: Record<string, number>) {
  return correctAnswers.every((v, i) => answers[String(i)] === v);
}
export function completion(progress: Progress | undefined) {
  return progress?.completed
    ? 100
    : Math.round(((progress?.step ?? 0) / 5) * 80);
}
export function safeData(value: unknown): AppData {
  if (!value || typeof value !== "object") throw new Error("记录格式不正确");
  const v = value as AppData;
  if (
    v.version !== 1 ||
    !bands.includes(v.band) ||
    !["student", "teacher", "parent"].includes(v.role) ||
    !Array.isArray(v.works) ||
    !v.progress ||
    !Array.isArray(v.visits)
  )
    throw new Error("记录版本或内容不正确");
  if (
    v.works.length > 12 ||
    v.works.some(
      (w) =>
        !w ||
        typeof w.id !== "string" ||
        !bands.includes(w.band) ||
        typeof w.title !== "string" ||
        typeof w.description !== "string" ||
        (w.generations !== undefined &&
          (!Array.isArray(w.generations) ||
            w.generations.length > 4 ||
            w.generations.some(
              (g) =>
                !g ||
                typeof g.id !== "string" ||
                !["storybook", "pencil"].includes(g.style) ||
                !["base", "friend"].includes(g.variant) ||
                g.mode !== "mock" ||
                typeof g.prompt !== "string" ||
                g.prompt.length > 600,
            ))) ||
        (w.selectedGenerationId !== undefined &&
          !w.generations?.some((g) => g.id === w.selectedGenerationId)) ||
        !Array.isArray(w.drawing) ||
        w.drawing.length > 200 ||
        w.drawing.some(
          (s) =>
            !s ||
            typeof s.color !== "string" ||
            !Array.isArray(s.points) ||
            s.points.length > 1000 ||
            s.points.some(
              (p) => !Number.isFinite(p.x) || !Number.isFinite(p.y),
            ),
        ) ||
        (w.image &&
          (typeof w.image !== "string" ||
            !w.image.startsWith("data:image/") ||
            w.image.length > 1_500_000)),
    )
  )
    throw new Error("作品数据异常");
  for (const [key, p] of Object.entries(v.progress)) {
    if (
      !/^(1-2|3-4|5-6|7-9):\d+$/.test(key) ||
      !Number.isInteger(p.step) ||
      p.step < 0 ||
      p.step > 5 ||
      typeof p.answers !== "object" ||
      !p.answers ||
      typeof p.completed !== "boolean"
    )
      throw new Error("学习进度异常");
    if (
      p.completed &&
      (key !== "1-2:1" ||
        (p.completionSource === "classroom"
          ? p.step !== 5 ||
            !p.completedAt ||
            !Number.isFinite(Date.parse(p.completedAt))
          : !quizPassed(p.answers)))
    )
      throw new Error("完成记录缺少答题依据");
  }
  if (
    v.assignment &&
    (!bands.includes(v.assignment.band) ||
      typeof v.assignment.id !== "string" ||
      typeof v.assignment.title !== "string")
  )
    throw new Error("任务记录异常");
  return v;
}
export function saveProgress(
  data: AppData,
  band: Band,
  id: number,
  step: number,
  answers?: Record<string, number>,
): AppData {
  const key = progressKey(band, id),
    old = data.progress[key];
  if (old?.completed) return data;
  const a = answers ?? old?.answers ?? {};
  const complete = band === "1-2" && id === 1 && step >= 5 && quizPassed(a);
  return {
    ...data,
    progress: {
      ...data.progress,
      [key]: {
        step: Math.min(5, Math.max(old?.step ?? 0, 0, step)),
        answers: a,
        completed: complete,
        ...(complete ? { completionSource: "quiz" as const } : {}),
        ...(complete
          ? { completedAt: old?.completedAt ?? new Date().toISOString() }
          : {}),
      },
    },
  };
}
export function completeClassroom(data: AppData): AppData {
  if (data.role !== "teacher" || data.band !== "1-2") return data;
  const key = progressKey("1-2", 1);
  if (data.progress[key]?.completed) return data;
  return {
    ...data,
    progress: {
      ...data.progress,
      [key]: {
        step: 5,
        answers: data.progress[key]?.answers ?? {},
        completed: true,
        completedAt: new Date().toISOString(),
        completionSource: "classroom",
      },
    },
  };
}
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function appendGeneration(work: Work, generation: MockGeneration): Work {
  const old = work.generations ?? [];
  // Keep the selected version when trimming history.
  const keep = old.filter((g) => g.id !== work.selectedGenerationId).slice(-2);
  const selected = old.find((g) => g.id === work.selectedGenerationId);
  return {
    ...work,
    generations: [...(selected ? [selected] : []), ...keep, generation],
  };
}
export function selectGeneration(work: Work, id: string): Work {
  if (
    !work.generations?.some((g) => g.id === id) ||
    work.selectedGenerationId === id
  )
    return work;
  return { ...work, selectedGenerationId: id, feedback: "", reviewed: false };
}
