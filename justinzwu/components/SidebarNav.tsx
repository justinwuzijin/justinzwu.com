"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SidebarNav.module.css";

const nav = [
  { href: "/", label: "me" }, // Figma shows 'me' as first item while Home content is hero
  { href: "/experience", label: "experience" },
  { href: "/drawer-of-thoughts", label: "drawer of thoughts" },
  { href: "/bookshelf", label: "bookshelf" },
  { href: "/art-gallery", label: "art gallery" },
];

export default function SidebarNav() {
  const pathname = usePathname();
  return (
    <aside className={styles.root} aria-label="Primary">
      <Link href="/" aria-label="JUSTINZWU.COM">
        <img
          className={styles.logo}
          src="/assets/svg/heading-dot.svg"
          alt="JUSTINZWU.COM"
        />
      </Link>
      <nav className={styles.nav}>
        {nav.map((n) => {
          const isActive = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.item} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
