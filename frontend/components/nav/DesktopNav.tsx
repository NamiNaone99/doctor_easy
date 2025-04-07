'use client';

import {
  Home,
  LineChart,
  Settings,
  Users2,
  BrainCircuit,
  Wand
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { NavItem } from 'app/(dashboard)/nav-item';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useUser } from 'context/UserContext';

export default function DesktopNav() {
  const { user } = useUser();
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Image
            src={'/image.png'}
            width={36}
            height={36}
            alt="Logo"
            className="overflow-hidden rounded-full object-cover"
            priority
          />
        </Link>

        <NavItem href="/" label="Home">
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/machine" label="Manage Model">
          <BrainCircuit className="h-5 w-5" />
        </NavItem>

        <NavItem href="/prediction" label="Prediction Score">
          <Wand className="h-5 w-5" />
        </NavItem>

        {user?.role === 'admin' && (
          <NavItem href="/users" label="Users">
            <Users2 className="h-5 w-5" />
          </NavItem>
        )}

        <NavItem href="#" label="Analytics">
          <LineChart className="h-5 w-5" />
        </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}
