import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AppData,
  Band,
  Role,
  Stroke,
  MockGeneration,
  appendGeneration,
  selectGeneration,
  initialData,
  safeData,
  saveProgress,
  completeClassroom,
} from "./domain";
const KEY = "turing-ai-companion:prototype:v1";
type NewWork = {
  title: string;
  description: string;
  drawing: Stroke[];
  image?: string;
};
type Store = {
  data: AppData;
  ready: boolean;
  error: string | null;
  recovery: boolean;
  updateRole: (r: Role) => void;
  updateBand: (b: Band) => void;
  recordProgress: (step: number, answers?: Record<string, number>) => void;
  finishClassroom: () => void;
  addWork: (w: NewWork) => string | null;
  addGeneration: (id: string, generation: MockGeneration) => void;
  chooseGeneration: (id: string, generationId: string) => void;
  review: (id: string, text: string) => void;
  publish: () => void;
  unpublish: () => void;
  reset: () => Promise<void>;
  retry: () => void;
};
const Context = createContext<Store | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);
  const writes = useRef(Promise.resolve());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          try {
            setData(safeData(JSON.parse(raw)));
          } catch {
            setRecovery(true);
            setError(
              "本地记录暂时无法读取。原记录已保留，请在设置中选择重新开始。",
            );
          }
        }
      })
      .catch(() => {
        setRecovery(true);
        setError(
          "无法读取本地存储，原记录未改动。请在设置查看，或换一个可存储的浏览环境。",
        );
      })
      .finally(() => {
        if (mounted.current) setReady(true);
      });
    return () => {
      mounted.current = false;
    };
  }, []);
  const persist = useCallback((next: AppData) => {
    writes.current = writes.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(next)))
      .catch(() => {
        if (mounted.current)
          setError("记录尚未保存。设备空间不足或浏览器限制了存储，请重试。");
      });
  }, []);
  useEffect(() => {
    if (ready && !recovery) persist(data);
  }, [data, ready, recovery, persist]);
  function mutate(fn: (d: AppData) => AppData) {
    if (recovery) return;
    setData(fn);
  }
  const store: Store = {
    data,
    ready,
    error,
    recovery,
    updateRole: (r) => mutate((d) => ({ ...d, role: r })),
    updateBand: (b) => mutate((d) => ({ ...d, band: b })),
    recordProgress: (step, answers) =>
      mutate((d) => saveProgress(d, d.band, 1, step, answers)),
    finishClassroom: () => mutate(completeClassroom),
    addWork: (w) => {
      if (recovery || data.works.length >= 12) return null;
      const id = `work-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      mutate((d) => ({
        ...d,
        works: [
          {
            ...w,
            id,
            band: d.band,
            createdAt: new Date().toISOString(),
            feedback: "",
            reviewed: false,
          },
          ...d.works,
        ],
      }));
      return id;
    },
    addGeneration: (id, generation) =>
      mutate((d) =>
        d.role !== "student"
          ? d
          : {
              ...d,
              works: d.works.map((w) =>
                w.id === id && w.band === d.band
                  ? appendGeneration(w, generation)
                  : w,
              ),
            },
      ),
    chooseGeneration: (id, generationId) =>
      mutate((d) =>
        d.role !== "student"
          ? d
          : {
              ...d,
              works: d.works.map((w) =>
                w.id === id && w.band === d.band
                  ? selectGeneration(w, generationId)
                  : w,
              ),
            },
      ),
    review: (id, text) =>
      mutate((d) => ({
        ...d,
        works: d.works.map((w) =>
          w.id === id
            ? { ...w, feedback: text.slice(0, 400), reviewed: true }
            : w,
        ),
      })),
    publish: () =>
      mutate((d) => ({
        ...d,
        assignment: {
          id: `task-${Date.now()}`,
          band: d.band,
          title: "第一课 · 我的AI愿望图卡",
          createdAt: new Date().toISOString(),
        },
      })),
    unpublish: () => mutate((d) => ({ ...d, assignment: null })),
    reset: async () => {
      await writes.current;
      await AsyncStorage.removeItem(KEY);
      setRecovery(false);
      setError(null);
      setData(initialData());
    },
    retry: () => {
      setError(null);
      if (!recovery) persist(data);
    },
  };
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useApp() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing AppProvider");
  return c;
}
