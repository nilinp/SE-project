import { create } from "zustand";

interface PopupState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "error" | "success" | "info";
  onCloseCallback?: () => void;
}

interface PopupStore extends PopupState {
  showPopup: (title: string, message: string, type?: "error" | "success" | "info", onCloseCallback?: () => void) => void;
  closePopup: () => void;
}

export const usePopupStore = create<PopupStore>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  type: "error",
  showPopup: (title, message, type = "error", onCloseCallback) => 
    set({ isOpen: true, title, message, type, onCloseCallback }),
  closePopup: () => 
    set((state) => {
      if (state.onCloseCallback) state.onCloseCallback();
      return { isOpen: false, onCloseCallback: undefined };
    }),
}));
