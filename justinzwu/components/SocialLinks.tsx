"use client";

import styles from "./SocialLinks.module.css";
import { useTheme } from "../components/ThemeProvider";

const LINKS = [
  { href: "https://x.com/byjustinwu", label: "X" },
  { href: "https://github.com/justinwuzijin", label: "GitHub" },
  { href: "https://www.linkedin.com/in/justin-wu-171481162/", label: "LinkedIn" },
  { href: "https://www.youtube.com/@byjustinwu", label: "YouTube" },
  { href: "mailto:jz3wu@uwaterloo.ca", label: "Email" },
];

export default function SocialLinks() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={styles.root} aria-label="Social media">
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target={l.href.startsWith("mailto:") ? "_self" : "_blank"}
          rel={l.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          aria-label={l.label}
          className={styles.pill}
        >
          {/* TODO: Replace with Heroicons solid/outline per theme. */}
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="img"
          >
            {isDark ? (
              /* simple outline placeholder */
              <circle cx="12" cy="12" r="8" stroke="#000" strokeWidth="1.5" fill="none" />
            ) : (
              /* simple solid placeholder */
              <circle cx="12" cy="12" r="8" fill="#000" />
            )}
          </svg>
        </a>
      ))}
    </div>
  );
}
