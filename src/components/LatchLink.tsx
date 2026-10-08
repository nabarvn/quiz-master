"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { useNavigationLatch } from "@/hooks/use-navigation-latch";

const LatchLink = ({ className, ...props }: ComponentProps<typeof Link>) => {
  const { isDisabled, onClick } = useNavigationLatch();

  return (
    <Link
      {...props}
      onClick={onClick}
      aria-disabled={isDisabled}
      className={cn(className, {
        "pointer-events-none opacity-50": isDisabled,
      })}
    />
  );
};

export default LatchLink;
