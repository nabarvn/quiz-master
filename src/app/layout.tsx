import "./globals.css";
import { Inter } from "next/font/google";
import { cn, constructMetadata } from "@/lib/utils";
import { Navbar, Providers } from "@/components";
import { Toaster } from "@/components/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "bg-slate-50 dark:bg-slate-900 overflow-hidden antialiased pt-20"
        )}
        style={{ height: "100svh" }}
      >
        <Providers>
          <Navbar />

          <div className="mx-auto h-full overflow-y-auto scrollbar-thumb-gray scrollbar-thumb-rounded scrollbar-track-gray-lighter scrollbar-w-4 scrolling-touch">
            {children}
          </div>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
