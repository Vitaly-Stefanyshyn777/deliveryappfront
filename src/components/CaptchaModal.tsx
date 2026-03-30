"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface CaptchaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export function CaptchaModal({
  open,
  onClose,
  onSuccess,
  title = "Підтвердження",
}: CaptchaModalProps) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [answer, setAnswer] = useState("");
  const correct = useMemo(() => a + b, [a, b]);

  useEffect(() => {
    if (!open) return;
    setA(1 + Math.floor(Math.random() * 9));
    setB(1 + Math.floor(Math.random() * 9));
    setAnswer("");
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-700 mb-3">
          Підтвердіть, що ви людина: обчисліть {a} + {b}
        </p>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4"
          placeholder="Введіть відповідь"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-2 border rounded-lg"
            onClick={onClose}
          >
            Скасувати
          </button>
          <button
            type="button"
            className="px-3 py-2 bg-pink-500 text-white rounded-lg disabled:opacity-50"
            disabled={String(correct) !== answer.trim()}
            onClick={() => {
              if (String(correct) === answer.trim()) onSuccess();
            }}
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
