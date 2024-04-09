"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

type SignInButtonProps = {
  text?: string;
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

  return text ? (
    <Button
      size='lg'
      onClick={signInWithGoogle}
      isLoading={isLoading}
      className='text-lg w-fit'
    >
      {text}
    </Button>
  ) : (
    <>
      <Button
        className='hidden md:flex text-base h-10'
        onClick={signInWithGoogle}
        isLoading={isLoading}
      >
        Sign In
      </Button>

      <Button
        className='flex md:hidden h-10'
        onClick={signInWithGoogle}
        size='sm'
        variant='ghost'
      >
        <LogIn className='hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100' />
      </Button>
    </>
  );
};

export default SignInButton;
