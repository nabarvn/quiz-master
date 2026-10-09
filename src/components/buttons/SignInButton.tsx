"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

type SignInButtonProps = {
  label?: string;
};

const SignInButton = ({ label }: SignInButtonProps) => {
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      await signIn("google");
    } catch {
      setIsSigningIn(false);

      toast({
        title: "There was a problem",
        description: "An error occurred while logging in with Google",
        variant: "destructive",
      });
    }
  };

  if (label) {
    return (
      <Button
        size="lg"
        onClick={handleGoogleSignIn}
        isLoading={isSigningIn}
        className="text-lg w-fit"
      >
        {label}
      </Button>
    );
  }

  return (
    <>
      <Button
        className="hidden md:flex text-base h-10"
        onClick={handleGoogleSignIn}
        isLoading={isSigningIn}
      >
        Sign In
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className="flex md:hidden h-10"
        onClick={handleGoogleSignIn}
        isLoading={isSigningIn}
      >
        <LogIn className="hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" />
      </Button>
    </>
  );
};

export default SignInButton;
