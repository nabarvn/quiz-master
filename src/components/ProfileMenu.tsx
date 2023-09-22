"use client";

import Link from "next/link";
import { User } from "next-auth";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/Dropdown";

import { UserAvatar } from "@/components";
import { signOut } from "next-auth/react";

type ProfileMenuProps = {
  user?: Pick<User, "name" | "image" | "email">;
};

const ProfileMenu = ({ user }: ProfileMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            name: user?.name || null,
            image: user?.image || null,
          }}
          className='h-10 w-10'
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='bg-white/75 dark:bg-slate-900'
        align='end'
      >
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-1 leading-none'>
            {user && (
              <>
                <p className='font-medium'>{user?.name}</p>
                <p className='w-[200px] truncate text-sm'>{user?.email}</p>
              </>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href='https://github.com/nabarvn/quiz-master'
            target='_blank'
            className='cursor-pointer'
          >
            Star on Github 🌟
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}`,
            });
          }}
          className='cursor-pointer'
        >
          <LogOut className='h-4 w-4 mr-2' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
