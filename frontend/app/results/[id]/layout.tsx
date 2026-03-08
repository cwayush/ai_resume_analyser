import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analysis Results — ResumeIQ',
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
