'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '../utils/useMediaQuery';
import { FaHome, FaComments, FaUser, FaLeaf } from 'react-icons/fa';
import { GiClothes } from 'react-icons/gi';

export default function DesktopNavBar() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const pathname = usePathname();

  const allowedRoutes = [
    '/chat',
    '/skincare-challenge',
    '/wardrobe',
    '/profile'
  ];

  if (!isDesktop || !allowedRoutes.some(route => pathname?.startsWith(route))) return null;

  const navItems = [
    { path: '/skincare-challenge', icon: FaLeaf, label: 'Skincare' },
    { path: '/chat', icon: FaComments, label: 'Chat' },
    { path: '/wardrobe', icon: GiClothes, label: 'Wardrobe' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
  ];

  const activeStyles = {
    '/skincare-challenge': 'bg-green-500',
    '/chat': 'bg-gradient-to-br from-purple-500 to-pink-500',
    '/wardrobe': 'bg-amber-500',
    '/profile': 'bg-blue-500'
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <div className="flex flex-col gap-2 p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.path);
          const activeClass = isActive 
            ? `${activeStyles[item.path as keyof typeof activeStyles]} shadow-md`
            : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50';

          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative group flex items-center justify-center p-1 transition-all duration-200 rounded-md"
            >
              <div className={`flex flex-col items-center gap-1 w-full p-2 rounded-md ${activeClass}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                <span className={`text-[10px] leading-tight font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 