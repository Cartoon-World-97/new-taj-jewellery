'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaPlus,
  FaSearch,
  FaDownload,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
} from 'react-icons/fa';
import { downloadTransactionPDF } from '@/lib/pdfGenerator';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchTransactions();
  }, [search, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Transaction deleted successfully');
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const canEdit = user?.permissions?.canEdit || user?.role === 'admin';
  const canDelete = user?.permissions?.canDelete || user?.role === 'admin';

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold gold-text mb-2">
            Transactions
          </h1>
          <p className="text-zinc-400">
            Manage and view all jewelry transactions
          </p>
        </div>
        <Link
          href="/dashboard/transactions/new"
          className="btn-primary mt-4 md:mt-0 inline-flex items-center space-x-2"
        >
          <FaPlus />
          <span>New Transaction</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by bill no, customer name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div>
              <label className="text-sm text-zinc-400 block mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Gold (gms)</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="font-semibold text-gold-500">
                      {transaction.billNo}
                    </td>
                    <td>
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>
                    <td>{transaction.customerName || 'N/A'}</td>
                    <td>{transaction.customerPhone || 'N/A'}</td>
                    <td>{transaction.items?.length || 0}</td>
                    <td className="font-semibold">
                      {transaction.total?.gold?.toFixed(3) || '0.000'}
                    </td>
                    <td className="text-zinc-400">
                      {transaction.createdByName}
                    </td>
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
                        {canEdit && (
                          <Link
                            href={`/dashboard/transactions/edit/${transaction._id}`}
                            className="p-2 text-gold-500 hover:bg-gold-500/10 rounded transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-zinc-500 py-8">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <p className="text-zinc-400 text-sm mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-white">
              {transactions.length}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-zinc-400 text-sm mb-2">Total Items</p>
            <p className="text-3xl font-bold text-white">
              {transactions.reduce((sum, t) => sum + (t.items?.length || 0), 0)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-zinc-400 text-sm mb-2">Total Gold (gms)</p>
            <p className="text-3xl font-bold text-gold-500">
              {transactions
                .reduce((sum, t) => sum + (t.total?.gold || 0), 0)
                .toFixed(3)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
