import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import DailySummaryNotification from '@/components/daily-summary-notification';
import { ThemeProvider } from '@/components/theme-provider';


export const metadata: Metadata = {
  title: 'Bank Proposal Automation',
  description: 'Automate bank proposal submissions with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <FirebaseClientProvider>
            <DailySummaryNotification />
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
