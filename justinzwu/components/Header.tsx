"use client";

import styles from "./Header.module.css";
import SocialLinks from "./SocialLinks";
import { useTheme } from "../components/ThemeProvider";

export default function Header() {
  const { cycleLightDark } = useTheme();
  return (
    <header className={styles.root}>
      <SocialLinks />
      <button
        type="button"
        aria-label="Toggle light and dark theme"
        className={styles.themeBtn}
        onClick={cycleLightDark}
      >
        {/* placeholder moon icon */}
        <svg viewBox="0 0 24 24" className={styles.moon} aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      </button>
    </header>
  );
}
