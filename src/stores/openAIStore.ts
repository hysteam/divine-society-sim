import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OpenAIStore {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

export const useOpenAIStore = create<OpenAIStore>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      clearApiKey: () => set({ apiKey: null }),
    }),
    {
      name: 'openai-storage',
    }
  )
);
