"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./CaptchaModal.module.css";

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
    <div className={styles.overlayWrap}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <p className={styles.text}>
          Підтвердіть, що ви людина: обчисліть {a} + {b}
        </p>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className={styles.input}
          placeholder="Введіть відповідь"
        />
        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
          >
            Скасувати
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.submitButton} ${
              String(correct) !== answer.trim() ? styles.submitButtonDisabled : ""
            }`}
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
