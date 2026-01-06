import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoodFlix | Mood-Based Song Recommender',
  description: 'Get Hindi & Bangla song recommendations based on your mood using facial emotion detection. Powered by Chandon Kumar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

