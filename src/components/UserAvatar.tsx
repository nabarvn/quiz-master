import Image from "next/image";
import { User } from "next-auth";
import { Avatar } from "@/components/ui";
import { AvatarFallback } from "@/components/ui/Avatar";
import { Icons } from "@/components";
import { AvatarProps } from "@radix-ui/react-avatar";

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "name" | "image">; // `Pick` is a utility type in TypeScript
}

const UserAvatar = ({ user, ...props }: UserAvatarProps) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className='relative aspect-square h-full w-full'>
          <Image
            src={user.image}
            alt='PFP'
            referrerPolicy='no-referrer'
            fill
            sizes='100vh'
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className='sr-only'>{user?.name}</span>
          <Icons.user className='h-5 w-5' />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
