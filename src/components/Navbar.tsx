import Link from "next/link";
import { ProfileMenu, SignInButton, ThemeToggle } from "@/components";
import { getServerSession } from "next-auth";

const Navbar = async () => {
  const session = await getServerSession();

  return (
    <div className='fixed inset-x-0 top-0 bg-white/75 backdrop-blur-sm dark:bg-slate-900 z-[10] border-b border-slate-300 dark:border-slate-700 shadow-sm py-4'>
      <div className='flex items-center justify-between h-full max-w-7xl gap-2 mx-auto px-8'>
        {/* logo */}
        <Link href='/' className='active:scale-95 flex gap-2 items-center'>
          <p className='rounded-lg border-2 border-b-4 border-r-4 border-slate-900 text-2xl font-bold transition-all hover:-translate-y-[2px] md:block dark:text-slate-100 dark:border-slate-100 px-2 py-1'>
            Quiz Master
          </p>
        </Link>

        <div className='flex items-center gap-4 md:gap-6'>
          <ThemeToggle />

          {session ? <ProfileMenu user={session.user} /> : <SignInButton />}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
