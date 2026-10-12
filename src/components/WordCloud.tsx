"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { wordCloudTopics } from "@/data/word-cloud-topics";
import { useCallback, useRef, type MouseEvent } from "react";
import { useNavigationLatch } from "@/hooks/use-navigation-latch";

const Output = dynamic(async () => (await import("react-d3-cloud")).default, {
  ssr: false,
});

const fontSizeMapper = (word: { value: number }) => {
  return Math.log2(word.value) * 5 + 16;
};

const WordCloud = () => {
  const { resolvedTheme } = useTheme();

  const { isDisabled, onClick: latchClick } = useNavigationLatch();
  const latchClickRef = useRef(latchClick);

  latchClickRef.current = latchClick;

  const handleWordClick = useCallback(
    (event: MouseEvent<Element>, word: { text: string }) => {
      latchClickRef.current(event);
      if (event.defaultPrevented) return;
      window.location.href = `/quiz?topic=${encodeURIComponent(word.text)}`;
    },
    [],
  );

  return (
    <div
      aria-disabled={isDisabled}
      className={cn({
        "pointer-events-none opacity-50": isDisabled,
      })}
    >
      <Output
        data={wordCloudTopics}
        height={500}
        font="Times"
        fontSize={fontSizeMapper}
        rotate={0}
        padding={10}
        fill={resolvedTheme === "dark" ? "white" : "black"}
        onWordClick={handleWordClick}
      />
    </div>
  );
};

export default WordCloud;
