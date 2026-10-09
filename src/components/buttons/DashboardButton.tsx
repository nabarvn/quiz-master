"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { LucideLayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { useNavigationLatch } from "@/hooks/use-navigation-latch";

const DashboardButton = () => {
  const { isDisabled, onClick: handleNavigationClick } = useNavigationLatch();

  return (
    <Button
      disabled={isDisabled}
      onClick={(event) => {
        handleNavigationClick(event);
        if (event.defaultPrevented) return;
        window.location.href = "/dashboard";
      }}
      className={cn(buttonVariants({ size: "sm" }), "text-base")}
    >
      <LucideLayoutDashboard className="w-4 h-4 mr-2" />
      Dashboard
    </Button>
  );
};

export default DashboardButton;
