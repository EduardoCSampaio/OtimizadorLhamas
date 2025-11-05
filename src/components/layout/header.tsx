'use client';

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import {
  Banknote,
  Bell,
  Building2,
<<<<<<< HEAD
  KeyRound,
  LayoutDashboard,
=======
import {
  Banknote,
  Bell,
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
=======
  LayoutDashboard,
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
  LifeBuoy,
  LogOut,
  Settings,
  User as UserIcon,
} from 'lucide-react';
<<<<<<< HEAD
=======
import { Banknote, Bell, LifeBuoy, LogOut, Settings, User as UserIcon } from 'lucide-react';
>>>>>>> 0af121b (File changes)
=======
import { Banknote, Bell, LifeBuoy, LogOut, Settings, User as UserIcon, BookCheck } from 'lucide-react';
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
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
import { useUser, useAuth } from '@/firebase';
<<<<<<< HEAD
<<<<<<< HEAD
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Header() {
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar');
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
=======
import { useRouter } from 'next/navigation';
=======
import { useRouter, usePathname } from 'next/navigation';
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Header() {
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar');
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
<<<<<<< HEAD
>>>>>>> 0af121b (File changes)
=======
  const pathname = usePathname();
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/login');
    }
  };
<<<<<<< HEAD

  const navLinks = [
    { href: '/', label: 'Painel Principal', icon: LayoutDashboard },
    { href: '/bancos', label: 'Bancos', icon: Building2 },
    { href: '/regras-clt', label: 'Regras CLT', icon: Settings },
  ];
=======
>>>>>>> 0af121b (File changes)

  const navLinks = [
    { href: '/', label: 'Painel Principal', icon: LayoutDashboard },
    { href: '/bancos', label: 'Bancos', icon: Building2 },
    { href: '/regras-clt', label: 'Regras CLT', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-4 backdrop-blur-sm md:px-6">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Banknote className="h-7 w-7 text-primary" />
          <h1 className="hidden text-lg font-bold text-primary md:block md:text-xl font-headline">
<<<<<<< HEAD
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
=======
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/" className='flex items-center gap-2'>
            <Banknote className="h-7 w-7 text-primary" />
            <h1 className="text-lg font-bold text-primary md:text-xl font-headline">
=======
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
            Bank Proposal Automation
          </h1>
        </Link>
<<<<<<< HEAD
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
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
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        {isUserLoading ? (
<<<<<<< HEAD
<<<<<<< HEAD
          <Skeleton className="h-9 w-9 rounded-full" />
=======
            <Skeleton className="h-9 w-9 rounded-full" />
>>>>>>> 0af121b (File changes)
=======
          <Skeleton className="h-9 w-9 rounded-full" />
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt="User" />
                  ) : (
                    userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" />
                  )}
                  <AvatarFallback>
                    {user.email?.[0].toUpperCase() ?? 'U'}
                  </AvatarFallback>
<<<<<<< HEAD
=======
                  {user.photoURL ? <AvatarImage src={user.photoURL} alt="User" /> : userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" />}
                  <AvatarFallback>{user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
>>>>>>> 0af121b (File changes)
=======
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
<<<<<<< HEAD
<<<<<<< HEAD
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || 'Usuário'}
                  </p>
=======
                  <p className="text-sm font-medium leading-none">{user.displayName || 'Usuário'}</p>
>>>>>>> 0af121b (File changes)
=======
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || 'Usuário'}
                  </p>
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
<<<<<<< HEAD
<<<<<<< HEAD
               <DropdownMenuGroup className="md:hidden">
                 {navLinks.map((link) => (
                    <DropdownMenuItem key={link.href} onClick={() => router.push(link.href)}>
                        <link.icon className="mr-2 h-4 w-4" />
<<<<<<< HEAD
=======
               <DropdownMenuGroup className="md:hidden">
                 {navLinks.map((link) => (
                    <DropdownMenuItem key={link.href} onClick={() => router.push(link.href)}>
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
=======
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
                        <span>{link.label}</span>
                    </DropdownMenuItem>
                 ))}
                <DropdownMenuSeparator />
               </DropdownMenuGroup>
<<<<<<< HEAD
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/perfil')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/meus-acessos')}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Meus Acessos</span>
                </DropdownMenuItem>
=======
=======
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/perfil')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
>>>>>>> 0af121b (File changes)
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
<<<<<<< HEAD
<<<<<<< HEAD
          <Button onClick={() => router.push('/login')}>Login</Button>
=======
            <Button onClick={() => router.push('/login')}>Login</Button>
>>>>>>> 0af121b (File changes)
=======
          <Button onClick={() => router.push('/login')}>Login</Button>
>>>>>>> 6832438 (Ainda estou sem botões para poder transitar entre o painel principal e o)
        )}
      </div>
    </header>
  );
}
