"use client";

import { ArrowUp, ArrowDown, Calendar } from "lucide-react";
import { SortOption } from "@/types";
import styles from "./QuickSort.module.css";

interface QuickSortProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function QuickSort({ sortBy, onSortChange }: QuickSortProps) {
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

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <div className={styles.group}>
          {nameButtons.map((button) => {
            const Icon = button.icon;
            const isActive = sortBy === button.value;
            return (
              <button
                key={button.value}
                onClick={() => onSortChange(isActive ? "none" : button.value)}
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
                  onClick={() => onSortChange(isActive ? "none" : button.value)}
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
                  onClick={() => onSortChange(isActive ? "none" : button.value)}
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
    </div>
  );
}
