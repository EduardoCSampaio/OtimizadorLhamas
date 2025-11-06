'use client';

import {
  Banknote,
  Bell,
  Building2,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useAuth, useFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Header() {
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar');
  const { user, isUserLoading, auth } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/login');
    }
  };

  const navLinks = [
    { href: '/', label: 'Painel Principal', icon: LayoutDashboard },
    { href: '/bancos', label: 'Bancos', icon: Building2 },
    { href: '/regras-clt', label: 'Regras CLT', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Banknote className="h-7 w-7 text-primary" />
          <h1 className="hidden text-lg font-bold text-primary md:block md:text-xl font-headline">
            Bank Proposal Automation
          </h1>
        </Link>
        <nav className="hidden md:flex md:items-center md:gap-4">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
                >
                {link.label}
                </Link>
            ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        {isUserLoading ? (
          <Skeleton className="h-9 w-9 rounded-full" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt="User" />
                  ) : (
                    userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" />
                  )}
                  <AvatarFallback>
                    {user.email?.[0].toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuGroup className="md:hidden">
                 {navLinks.map((link) => (
                    <DropdownMenuItem key={link.href} onClick={() => router.push(link.href)}>
                        <link.icon className="mr-2 h-4 w-4" />
                        <span>{link.label}</span>
                    </DropdownMenuItem>
                 ))}
                <DropdownMenuSeparator />
               </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/perfil')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/meus-acessos')}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Meus Acessos</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  <span>Suporte</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => router.push('/login')}>Login</Button>
        )}
      </div>
    </header>
  );
}
