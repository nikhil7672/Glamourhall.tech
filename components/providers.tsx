'use client'

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from 'next/navigation';

export function Providers({ children, ...props }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Enable ThemeProvider for specific routes
  const themeEnabledRoutes = ['/chat', '/preferences', '/notifications'];
  const isThemeEnabled = themeEnabledRoutes.some(route => pathname?.startsWith(route));

  if (!isThemeEnabled) {
    // Render without ThemeProvider for other routes
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <SessionProvider>{children}</SessionProvider>
    </NextThemesProvider>
  );
}