"use client";

import { ArrowUp, ArrowDown, Calendar } from "lucide-react";
import { SortOption } from "@/types";

interface QuickSortProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function QuickSort({ sortBy, onSortChange }: QuickSortProps) {
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
    <div className="w-full bg-transparent border-0 shadow-none p-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {priceButtons.map((button) => {
            const Icon = button.icon;
            const isActive = sortBy === button.value;
            return (
              <button
                key={button.value}
                onClick={() => onSortChange(isActive ? "none" : button.value)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={button.description}
              >
                <Icon className="h-4 w-4 mr-1" />
                {button.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {dateButtons.map((button) => {
            const Icon = button.icon;
            const isActive = sortBy === button.value;
            return (
              <button
                key={button.value}
                onClick={() => onSortChange(isActive ? "none" : button.value)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={button.description}
              >
                <Icon className="h-4 w-4 mr-1" />
                {button.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
