"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Calendar, X, ArrowUpDown } from "lucide-react";
import { SortOption } from "@/types";
import styles from "./QuickSort.module.css";

interface QuickSortProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function QuickSort({ sortBy, onSortChange }: QuickSortProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nameButtons = [
    {
      value: "name-asc" as SortOption,
      label: "A → Z",
      icon: ArrowUp,
      description: "За назвою (A → Z)",
    },
    {
      value: "name-desc" as SortOption,
      label: "A ← Z",
      icon: ArrowDown,
      description: "За назвою (Z → A)",
    },
  ];
  const priceButtons = [
    {
      value: "price-asc" as SortOption,
      label: "Ціна ↑",
      icon: ArrowUp,
      description: "Від низької до високої",
    },
    {
      value: "price-desc" as SortOption,
      label: "Ціна ↓",
      icon: ArrowDown,
      description: "Від високої до низької",
    },
  ];

  const dateButtons = [
    {
      value: "date-desc" as SortOption,
      label: "Новинки",
      icon: Calendar,
      description: "Спочатку нові",
    },
    {
      value: "date-asc" as SortOption,
      label: "Старі",
      icon: Calendar,
      description: "Спочатку старі",
    },
  ];

  const mobileTriggerLabel = (() => {
    switch (sortBy) {
      case "name-asc":
        return "A → Z";
      case "name-desc":
        return "A ← Z";
      case "price-asc":
        return "Ціна ↑";
      case "price-desc":
        return "Ціна ↓";
      case "date-desc":
        return "Новинки";
      case "date-asc":
        return "Старі";
      default:
        return "Сортування";
    }
  })();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onResize);
    return () => mq.removeEventListener("change", onResize);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const row = (
    <div className={styles.row}>
      <div className={styles.group}>
        {nameButtons.map((button) => {
          const Icon = button.icon;
          const isActive = sortBy === button.value;
          return (
            <button
              key={button.value}
              type="button"
              onClick={() => {
                onSortChange(isActive ? "none" : button.value);
                setMobileOpen(false);
              }}
              className={`${styles.button} ${isActive ? styles.active : ""}`}
              title={button.description}
            >
              <Icon className={styles.icon} />
              {button.label}
            </button>
          );
        })}
      </div>

      <div className={styles.group}>
        {priceButtons.map((button) => {
          const Icon = button.icon;
          const isActive = sortBy === button.value;
          return (
            <button
              key={button.value}
              type="button"
              onClick={() => {
                onSortChange(isActive ? "none" : button.value);
                setMobileOpen(false);
              }}
              className={`${styles.button} ${isActive ? styles.active : ""}`}
              title={button.description}
            >
              <Icon className={styles.icon} />
              {button.label}
            </button>
          );
        })}
      </div>

      <div className={styles.group}>
        {dateButtons.map((button) => {
          const Icon = button.icon;
          const isActive = sortBy === button.value;
          return (
            <button
              key={button.value}
              type="button"
              onClick={() => {
                onSortChange(isActive ? "none" : button.value);
                setMobileOpen(false);
              }}
              className={`${styles.button} ${isActive ? styles.active : ""}`}
              title={button.description}
            >
              <Icon className={styles.icon} />
              {button.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.desktopOnly}>
        <div className={styles.panel}>{row}</div>
      </div>

      <div className={styles.mobileOnly}>
        <button
          type="button"
          className={styles.mobileTrigger}
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-haspopup="dialog"
        >
          <ArrowUpDown className={styles.mobileTriggerIcon} aria-hidden />
          <span className={styles.mobileTriggerText}>{mobileTriggerLabel}</span>
        </button>
      </div>

      {mobileOpen ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div
            className={styles.modalSheet}
            role="dialog"
            aria-modal="true"
            aria-label="Сортування"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Сортування</span>
              <button
                type="button"
                className={styles.modalClose}
                aria-label="Закрити"
                onClick={() => setMobileOpen(false)}
              >
                <X className={styles.icon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.panelModal}>{row}</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
