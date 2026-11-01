import './globals.css';

export const metadata = {
  title: 'ORBIT | NASA Earth Systems Trend Detective',
  description: 'A window into the missions, discoveries, and long-term trends exploring our changing planet with NASA satellite observations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#070b13] text-[#f3f5f8] antialiased">
        {children}
      </body>
    </html>
  );
}
