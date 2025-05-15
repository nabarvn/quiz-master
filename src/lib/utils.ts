import { Metadata } from "next";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeDelta(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secs = Math.floor(seconds - hours * 3600 - minutes * 60);
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (secs > 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(" ");
}

export function constructMetadata({
  title = "Quiz Master - The Smart Way to Learn",
  description = "Quiz Master offers a fun and engaging way to learn and challenge yourself. Test your knowledge on any subject with AI-generated quizzes.",
  image = "/thumbnail.png",
  icons = [
    {
      rel: "icon",
      url: "/favicon.ico", // for standard browsers
    },
    {
      rel: "apple-touch-icon",
      url: "/icon.png", // for Apple devices
    },
  ],
  noIndex = false, // allow search engine bots to crawl and index the website
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: Metadata["icons"];
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@nabarvn",
    },
    icons,
    metadataBase: new URL("https://quiz.nabarun.app"),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
