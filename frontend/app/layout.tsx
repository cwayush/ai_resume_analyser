import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ResumeIQ — Deterministic ATS Analyzer',
  description:
    'Explainable, deterministic ATS scoring from 5 independent engines. Upload your resume, paste the JD, get your score.',
  keywords: [
    'resume',
    'ATS',
    'job description',
    'career',
    'deterministic scoring',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: '#f2f0ec', color: '#3a342a' }}>
        <Navbar />
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#18150f',
              border: '1px solid #e4dfd7',
              borderRadius: '12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '13px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
            },
          }}
        />
      </body>
    </html>
  );
}
