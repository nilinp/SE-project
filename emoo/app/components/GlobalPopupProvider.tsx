"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePopupStore } from "@/lib/popupstore";

export default function GlobalPopupProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, title, message, type, closePopup } = usePopupStore();

  return (
    <>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all text-[var(--sec)]"
            >
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={closePopup}
                  className={`px-5 py-2.5 rounded-lg text-white transition-colors font-medium cursor-pointer ${
                    type === "error" ? "bg-red-500 hover:bg-red-600" : 
                    type === "success" ? "bg-green-500 hover:bg-green-600" : 
                    "bg-indigo-500 hover:bg-indigo-600"
                  }`}
                >
                  ตกลง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
