'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '../utils/useMediaQuery';
import { FaHome, FaComments, FaUser } from 'react-icons/fa';
import { GiClothes } from 'react-icons/gi';

export default function MobileNavBar() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const pathname = usePathname();

  // Only show on these routes
  const allowedRoutes = [
    '/chat',
    '/skincare-challenge',
    '/wardrobe',
    '/profile'
  ];

  if (!isMobile || !allowedRoutes.some(route => pathname?.startsWith(route))) return null;

  const navItems = [
    { path: '/skincare-challenge', icon: FaHome, label: 'Skincare' },
    { path: '/chat', icon: FaComments, label: 'Chat' },
    { path: '/wardrobe', icon: GiClothes, label: 'Wardrobe' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
  ];

  // Define active styles for each route
  const activeStyles = {
    '/skincare-challenge': 'bg-green-500',
    '/chat': 'bg-gradient-to-br from-purple-500 to-pink-500',
    '/wardrobe': 'bg-amber-500',
    '/profile': 'bg-blue-500'
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="w-full bg-gradient-to-t from-white/95 via-white/80 to-transparent dark:from-gray-900/95 dark:via-gray-900/80 dark:to-transparent backdrop-blur-md rounded-t-xl shadow-2xl flex justify-around items-center py-2 border-t border-gray-200 dark:border-gray-700">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.path);
          const activeClass = isActive 
            ? `${activeStyles[item.path as keyof typeof activeStyles]} shadow-lg transform scale-110`
            : 'hover:bg-gray-100 dark:hover:bg-gray-800';
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative flex flex-col items-center justify-center p-2 transition-all duration-200"
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${activeClass}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <span className={`mt-1 text-xs font-medium transition-colors duration-200 ${isActive ? 'text-current' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
