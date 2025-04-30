'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from 'context/UserContext';
import Loading from 'app/loading';

const PUBLIC_PATHS = ['/', '/login', '/register'];
const ADMIN_PROTECTED_PATH = '/users';
const AUTH_PROTECTED_PATHS = ['/machine', '/prediction']; // Paths that require authentication

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, fetchUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Ensure user data is up-to-date when a user logs in/out
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const handleNavigation = (path: string) => {
      if (pathname !== path) {
        router.push(path);
      }
    };

    // Handle public paths
    if (PUBLIC_PATHS.includes(pathname)) {
      if (user) {
        handleNavigation('/'); // Redirect logged-in users away from login/register
      }
      return;
    }

    // Redirect to login if no session token exists for protected paths
    if (!user) {
      if (AUTH_PROTECTED_PATHS.includes(pathname)) {
        handleNavigation('/login'); // Redirect unauthenticated users
      }
      return;
    }

    // Handle admin-only pages
    if (pathname.startsWith(ADMIN_PROTECTED_PATH) && user?.role !== 'admin') {
      handleNavigation('/'); // Redirect non-admin users
    }
  }, [pathname, router, user, isLoading]);

  // Show loading state while user data is being fetched
  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
