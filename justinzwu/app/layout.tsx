import type { Metadata } from "next";
import "./globals.css";
import SidebarNav from "../components/SidebarNav";
import Header from "../components/Header";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: "justinzwu.com",
  description: "Personal site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div style={{ display: "grid", gridTemplateColumns: "var(--sidebar-width) 1fr", minHeight: "100vh" }}>
            <SidebarNav />
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Header />
              <main style={{ flex: 1, margin: "0 auto", width: "100%", maxWidth: "var(--layout-max-width)", padding: "24px" }}>
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
