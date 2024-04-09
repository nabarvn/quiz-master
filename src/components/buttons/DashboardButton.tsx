"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { LucideLayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

const DashboardButton = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/dashboard")}
      className={cn(buttonVariants({ size: "sm" }), "text-base")}
    >
      <LucideLayoutDashboard className="w-4 h-4 mr-2" />
      Dashboard
    </Button>
  );
};

export default DashboardButton;
