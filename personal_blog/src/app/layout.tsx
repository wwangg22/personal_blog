import type { Metadata } from "next";
import "./globals.css";
import "./build.css";


export const metadata: Metadata = {
  title: "William's Personal Blog",
  description: "Some Projects and Thoughts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
