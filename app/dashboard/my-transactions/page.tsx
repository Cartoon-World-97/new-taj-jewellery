'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaSearch,
  FaDownload,
  FaEye,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaGem,
} from 'react-icons/fa';
import { downloadTransactionPDF } from '@/lib/pdfGenerator';

interface EmployeeStats {
  totalAssigned: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalGoldHandled: string;
  recentTransactions: any[];
}

export default function MyTransactionsPage() {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchEmployeeStats(parsedUser.id);
      fetchTransactions(parsedUser.id);
    }
  }, [search, statusFilter]);

  const fetchEmployeeStats = async (employeeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/employee-stats?employeeId=${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async (employeeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('assignedTo', employeeId);
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/transactions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (transaction: any) => {
    downloadTransactionPDF(transaction);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      approved: 'bg-green-500/20 text-green-500',
      rejected: 'bg-red-500/20 text-red-500',
    };

    const icons = {
      pending: <FaClock className="inline mr-1" />,
      approved: <FaCheckCircle className="inline mr-1" />,
      rejected: <FaTimesCircle className="inline mr-1" />,
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold gold-text mb-2">
          My Transactions
        </h1>
        <p className="text-zinc-400">
          View all transactions assigned to you
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card text-center">
            <FaClipboardList className="text-3xl text-blue-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm mb-1">Total Assigned</p>
            <p className="text-2xl font-bold text-white">{stats.totalAssigned}</p>
          </div>
          
          <div className="card text-center">
            <FaClock className="text-3xl text-yellow-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingCount}</p>
          </div>
          
          <div className="card text-center">
            <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-500">{stats.approvedCount}</p>
          </div>
          
          <div className="card text-center">
            <FaTimesCircle className="text-3xl text-red-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-500">{stats.rejectedCount}</p>
          </div>
          
          <div className="card text-center">
            <FaGem className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm mb-1">Total Gold</p>
            <p className="text-2xl font-bold text-gold-500">{stats.totalGoldHandled}g</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by transaction ID, bill no, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="md:w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Bill No</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Gold (gms)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="font-semibold text-blue-500">
                      {transaction.transactionId}
                    </td>
                    <td className="font-semibold text-gold-500">
                      {transaction.billNo}
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>{new Date(transaction.date).toLocaleDateString('en-IN')}</div>
                        <div className="text-zinc-500">{transaction.time}</div>
                      </div>
                    </td>
                    <td>{transaction.customerName || 'N/A'}</td>
                    <td>{transaction.items?.length || 0}</td>
                    <td className="font-semibold">
                      {transaction.total?.gold?.toFixed(3) || '0.000'}
                    </td>
                    <td>{getStatusBadge(transaction.status)}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(transaction)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                          title="Download PDF"
                        >
                          <FaDownload />
                        </button>
                        <Link
                          href={`/dashboard/transactions/${transaction._id}`}
                          className="p-2 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-zinc-500 py-8">
                    No transactions assigned to you yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary by Status */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card border-l-4 border-blue-500">
            <p className="text-sm text-zinc-400 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-white">{transactions.length}</p>
          </div>
          
          <div className="card border-l-4 border-yellow-500">
            <p className="text-sm text-zinc-400 mb-1">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-500">
              {transactions.filter(t => t.status === 'pending').length}
            </p>
          </div>
          
          <div className="card border-l-4 border-green-500">
            <p className="text-sm text-zinc-400 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-500">
              {transactions.filter(t => t.status === 'approved').length}
            </p>
          </div>
          
          <div className="card border-l-4 border-gold-500">
            <p className="text-sm text-zinc-400 mb-1">Gold Handled</p>
            <p className="text-2xl font-bold text-gold-500">
              {transactions
                .reduce((sum, t) => sum + (t.total?.gold || 0), 0)
                .toFixed(3)}g
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
