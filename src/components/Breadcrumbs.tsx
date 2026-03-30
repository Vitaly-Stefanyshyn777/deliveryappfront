"use client";

import Link from "next/link";

export interface CrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: CrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const content =
            isLast || !item.href ? (
              <span className="text-gray-700 font-medium">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-pink-600">
                {item.label}
              </Link>
            );

          return (
            <li key={`${item.label}-${idx}`} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-gray-300">/</span>}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
