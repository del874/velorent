'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 backdrop-blur px-4 py-3 md:px-10">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-3xl">🚴</span>
        <span className="text-lg font-bold text-foreground">VeloRent</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          首页
        </Link>
        <Link href="/bikes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          车型列表
        </Link>
        <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          如何运作
        </Link>
        <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          价格方案
        </Link>
      </nav>

      <div className="flex gap-2">
        {loading ? (
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default">
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账号</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/bookings">我的预订</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link href="/register">
              <Button variant="default" size="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                注册
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="default">
                登录
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
