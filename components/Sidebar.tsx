'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaHome,
  FaFileInvoice,
  FaUsers,
  FaSignOutAlt,
  FaGem,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const menuItems = [
    { href: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/dashboard/my-transactions', icon: FaFileInvoice, label: 'My Transactions', employeeOnly: true },
    { href: '/dashboard/transactions', icon: FaFileInvoice, label: 'All Transactions', adminOnly: true },
    { href: '/dashboard/employees', icon: FaUsers, label: 'Employees', adminOnly: true },
    { href: '/dashboard/admins', icon: FaUsers, label: 'Admins', adminOnly: true},
    { href: '/dashboard/permissions', icon: FaUsers, label: 'Permissions', adminOnly: true },
  ];

  const filteredItems = menuItems.filter(
    (item) => {
      if (item.adminOnly) return user?.role === 'admin';
      if (item.employeeOnly) return user?.role === 'employee';
      return true;
    }
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-lg border border-zinc-800"
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 glass-effect border-r border-zinc-800 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg">
                <FaGem className="text-2xl text-black" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold gold-text">
                  Raju Seakh
                </h1>
                <p className="text-xs text-zinc-500">Jewelry Store</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-zinc-400">{user.email}</p>
              <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-gold-500/20 text-gold-500 rounded">
                {user.role === 'admin' ? 'Admin' : 'Employee'}
              </span>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gold-500 text-black font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all w-full"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
