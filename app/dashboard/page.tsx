'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaFileInvoice,
  FaUsers,
  FaCalendarDay,
  FaGem,
  FaPlus,
  FaEye,
  FaUserTie,
  FaUserFriends,
} from 'react-icons/fa';

interface DashboardStats {
  totalTransactions: number;
  totalUsers: number;
  totalEmployees: number;
  totalClients: number;
  totalRemoteEmployees: number;
  todayTransactions: number;
  totalGoldAmount: string;
  recentTransactions: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Transactions',
      value: stats?.totalTransactions || 0,
      icon: FaFileInvoice,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-500',
    },
    {
      title: 'Total Clients',
      value: stats?.totalClients || 0,
      icon: FaUsers,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-500',
    },
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: FaUserTie,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-500',
      adminOnly: true,
    },
    {
      title: 'Remote Employees',
      value: stats?.totalRemoteEmployees || 0,
      icon: FaUserFriends,
      color: 'from-cyan-500 to-cyan-600',
      textColor: 'text-cyan-500',
      adminOnly: true,
    },
    {
      title: "Today's Transactions",
      value: stats?.todayTransactions || 0,
      icon: FaCalendarDay,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-500',
    },
    {
      title: 'Total Gold (gms)',
      value: stats?.totalGoldAmount || '0.000',
      icon: FaGem,
      color: 'from-gold-500 to-gold-600',
      textColor: 'text-gold-500',
    },
  ];

  const filteredCards = statCards.filter(
    (card) => !card.adminOnly || user?.role === 'admin'
  );

  const getTransactionBadge = (source: string) => {
    switch (source) {
      case 'client':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
            Client
          </span>
        );
      case 'employee':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-400">
            Employee
          </span>
        );
      case 'remoteEmployee':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-400">
            Remote
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold gold-text mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-400">
            Welcome back, {user?.name}! Here's your overview.
          </p>
        </div>
        {/* <Link
          href="/dashboard/transactions/new"
          className="btn-primary mt-4 md:mt-0 inline-flex items-center space-x-2"
        >
          <FaPlus />
          <span>New Transaction</span>
        </Link> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="card card-bordered animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`p-3 bg-gradient-to-br ${card.color} rounded-lg`}
                >
                  <Icon className="text-2xl text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white">
            Recent Transactions
          </h2>
          {/* <Link
            href="/dashboard/transactions"
            className="text-gold-500 hover:text-gold-400 text-sm font-semibold flex items-center space-x-2"
          >
            <span>View All</span>
            <FaEye />
          </Link> */}
        </div>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Name</th>
                <th>Description</th>
                <th>Transaction</th>
                <th>Gold (gms)</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTransactions?.length ? (
                stats.recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{getTransactionBadge(transaction.source)}</td>
                    <td>
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      {transaction.employeeName ||
                        transaction.clientName ||
                        'N/A'}
                    </td>
                    <td className="text-zinc-400">
                      {transaction.description || '-'}
                    </td>
                    <td>
                      <span
                        className={`font-semibold ${
                          transaction.type === 'Cr'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {transaction.type === 'Cr' ? 'Credit' : 'Debit'}
                      </span>
                    </td>
                    <td className="font-semibold text-gold-500">
                      {transaction.goldamount?.toFixed(3) || '0.000'}
                    </td>
                    <td className="text-zinc-400">
                      {transaction.createdByName || 'System'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-zinc-500">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up"
        style={{ animationDelay: '0.5s' }}
      >
        {/* <Link
          href="/dashboard/transactions/new"
          className="card hover:border-gold-500/50 border-2 border-transparent transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
              <FaPlus className="text-2xl text-gold-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">New Transaction</h3>
              <p className="text-sm text-zinc-400">Create a new entry</p>
            </div>
          </div>
        </Link> */}

        {/* <Link
          href="/dashboard/transactions"
          className="card hover:border-blue-500/50 border-2 border-transparent transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <FaFileInvoice className="text-2xl text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">View Transactions</h3>
              <p className="text-sm text-zinc-400">Browse all entries</p>
            </div>
          </div>
        </Link> */}

        {user?.role === 'admin' && (
          <Link
            href="/dashboard/employees"
            className="card hover:border-green-500/50 border-2 border-transparent transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <FaUsers className="text-2xl text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Manage Users</h3>
                <p className="text-sm text-zinc-400">Add or edit users</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}