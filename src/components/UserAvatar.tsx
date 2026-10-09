import Image from "next/image";
import { User } from "next-auth";
import { Icons } from "@/components";
import { Avatar } from "@/components/ui";
import { AvatarProps } from "@radix-ui/react-avatar";
import { AvatarFallback } from "@/components/ui/Avatar";

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "name" | "image">; // `Pick` is a utility type in TypeScript
}

const UserAvatar = ({ user, ...props }: UserAvatarProps) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className="relative aspect-square h-full w-full">
          <Image src={user.image} alt="PFP" fill sizes="100vh" />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user?.name}</span>
          <Icons.User className="h-5 w-5" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
