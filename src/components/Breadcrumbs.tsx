"use client";

import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export interface CrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: CrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.nav} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const content =
            isLast || !item.href ? (
              <span className={styles.current}>{item.label}</span>
            ) : (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            );

          return (
            <li key={`${item.label}-${idx}`} className={styles.item}>
              {idx > 0 && <span className={styles.separator}>/</span>}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
