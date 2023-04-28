import { NAVIGATION_ITEMS } from "src/components/config/navigation";
import { create } from "zustand";

type NavigationState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  items: typeof NAVIGATION_ITEMS;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  items: NAVIGATION_ITEMS,
}));
