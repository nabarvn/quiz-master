"use client";

import { Button } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { useState } from "react";

type SignInButtonProps = {
  text: string;
};

const SignInButton = ({ text }: SignInButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn("google");
    } catch (error) {
      // toast notification
      toast({
        title: "There was a problem",
        description: "An error occurred while logging in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={signInWithGoogle} isLoading={isLoading}>
      {text}
    </Button>
  );
};

export default SignInButton;
