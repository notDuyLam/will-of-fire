import { create } from "zustand";
import { getAllActivePacts } from "../db/queries/pactQueries";
import type { Pact } from "../db/schema";

interface PactStore {
  activePacts: Pact[];
  fetchActivePacts: () => void;
}

export const usePactStore = create<PactStore>((set) => ({
  activePacts: [],
  fetchActivePacts: () => {
    try {
      const list = getAllActivePacts();
      set({ activePacts: list });
    } catch {
      set({ activePacts: [] });
    }
  },
}));
