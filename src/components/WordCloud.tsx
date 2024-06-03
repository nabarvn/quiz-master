"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cloudData } from "@/helpers/cloud-data";

const Output = dynamic(async () => (await import("react-d3-cloud")).default, {
  ssr: false,
});

const fontSizeMapper = (word: { value: number }) => {
  return Math.log2(word.value) * 5 + 16;
};

const WordCloud = () => {
  const { theme } = useTheme();

  return (
    <Output
      data={cloudData}
      height={500}
      font="Times"
      fontSize={fontSizeMapper}
      rotate={0}
      padding={10}
      fill={theme === "dark" ? "white" : "black"}
      onWordClick={(_, word) =>
        (window.location.href = `/quiz?topic=${word.text.toLowerCase()}`)
      }
    />
  );
};

export default WordCloud;
