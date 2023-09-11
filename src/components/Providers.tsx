"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

const Providers = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      {...props}
    >
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
};

export default Providers;
