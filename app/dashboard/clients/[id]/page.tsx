'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGem,
  FaMoneyBillWave,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';

interface Employee {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  department?: string;
  lose?: string;
  total_money?: number;
  total_gold?: number;
  accountBalance?: number; // Calculated field
}

interface EmployeeTransaction {
  _id: string;
  employeeId: string;
  employeeName: string;
  description: string;
  type: 'Cr' | 'Dr';
  goldamount: number;
  islose: boolean;
  date: string;
  time: string;
  createdBy?: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  description: string;
  type: 'Cr' | 'Dr';
  goldamount: string;
  islose: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [showModal, setShowModal] = useState(false);
  const [client, setClient] = useState<Employee | null>(null);
  const [transactions, setTransactions] = useState<EmployeeTransaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<EmployeeTransaction | null>(null);

  const [formData, setFormData] = useState<FormData>({
    description: '',
    type: 'Cr',
    goldamount: '',
    islose: 'false',
  });

  useEffect(() => {
    if (clientId) {
      fetchClientStatement();
    }
  }, [clientId]);

  const fetchClientStatement = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients-statement?employeeId=${clientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setClient(data.employee);
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching client statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      type: 'Cr',
      goldamount: '',
      islose: 'false',
    });
    setEditingTransaction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingTransaction 
        ? `/api/clients-transactions/${editingTransaction._id}`
        : '/api/clients-transactions';
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const payload = {
        ...(editingTransaction && { id: editingTransaction._id }),
        employeeId: clientId,
        description: formData.description,
        type: formData.type,
        goldamount: formData.goldamount ? parseFloat(formData.goldamount) : 0,
        islose: formData.islose === 'true',
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }

      // Success - refresh data and close modal
      await fetchClientStatement();
      setShowModal(false);
      resetForm();
      
      alert(editingTransaction ? 'Transaction updated successfully!' : 'Transaction created successfully!');
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  const handleEdit = (transaction: EmployeeTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      type: transaction.type,
      goldamount: transaction.goldamount.toString(),
      islose: transaction.islose.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients-transactions?id=${transactionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      alert('Transaction deleted successfully!');
      await fetchClientStatement();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'Cr') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-500 border border-green-500/30">
          Credit (Given)
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-500 border border-red-500/30">
          Debit (Returned)
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Client not found</p>
          <Link href="/dashboard/clients" className="btn-primary">
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold gold-text mb-1">
            Client Statement
          </h1>
          <p className="text-zinc-400">Complete account details and transaction history</p>
        </div>
      </div>

      {/* Employee Info Card */}
      <div className="card bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-gold-500/30">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Employee Details */}
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl">
              <FaUser className="text-3xl text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{client.name}</h2>
              <div className="space-y-1 text-sm">
                <p className="text-zinc-300 flex items-center">
                  <FaPhone className="mr-2 text-gold-500" />
                  {client.phone}
                </p>
                {client.email && (
                  <p className="text-zinc-300 flex items-center">
                    <FaEnvelope className="mr-2 text-gold-500" />
                    {client.email}
                  </p>
                )}
                {client.location && (
                  <p className="text-zinc-300 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gold-500" />
                    {client.location}
                  </p>
                )}
                {client.department && (
                  <p className="text-zinc-300 flex items-center">
                    <FaGem className="mr-2 text-gold-500" />
                    Department: {client.department}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gold Balance */}
          <div className="text-center md:text-right">
            <p className="text-sm text-zinc-400 mb-1">Gold Balance</p>
            <p
              className={`text-4xl font-bold ${
                (client.accountBalance || 0) > 0
                  ? 'text-yellow-500'
                  : (client.accountBalance || 0) < 0
                  ? 'text-blue-500'
                  : 'text-white'
              }`}
            >
              {(client.accountBalance || 0) > 0 ? '+' : ''}
              {Math.abs(client.accountBalance || 0).toFixed(3)}g
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {(client.accountBalance || 0) > 0
                ? 'Gold given to employee'
                : (client.accountBalance || 0) < 0
                ? 'Gold returned by employee'
                : 'Account settled'}
            </p>
            {client.lose && (
              <p className="text-xs text-zinc-400 mt-2">
                Loss Rate: {client.lose}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-green-900/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Total Gold Given</p>
                <p className="text-2xl font-bold text-green-500">
                  {summary.totalGoldGiven?.toFixed(3) || '0.000'}g
                </p>
              </div>
              <FaGem className="text-3xl text-green-500/30" />
            </div>
          </div>
          
          <div className="card bg-red-900/20 border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Total Gold Returned</p>
                <p className="text-2xl font-bold text-red-500">
                  {summary.totalGoldReturned?.toFixed(3) || '0.000'}g
                </p>
              </div>
              <FaGem className="text-3xl text-red-500/30" />
            </div>
          </div>
          
          <div className="card bg-yellow-900/20 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Net Balance</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {summary.netGoldBalance?.toFixed(3) || '0.000'}g
                </p>
              </div>
              <FaGem className="text-3xl text-yellow-500/30" />
            </div>
          </div>
        </div>
      )}

      {/* Transactions Section */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">
            Transaction History ({transactions.length})
          </h2>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-3">Date & Time</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Gold Amount (g)</th>
                <th className="text-center p-3">Loss Applied</th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="font-semibold">
                          {new Date(txn.date).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-zinc-500 text-xs">{txn.time}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-zinc-300">{txn.description}</div>
                    </td>
                    <td className="p-3">
                      {getTypeBadge(txn.type)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-semibold ${txn.type === 'Cr' ? 'text-green-400' : 'text-red-400'}`}>
                        {txn.type === 'Cr' ? '+' : '-'}{txn.goldamount?.toFixed(3) || '0.000'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {txn.islose ? (
                        <span className="text-yellow-500">Yes</span>
                      ) : (
                        <span className="text-zinc-500">No</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(txn)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                          title="Edit Transaction"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(txn._id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete Transaction"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-zinc-500 py-8">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <FaMoneyBillWave />
          <span>New Transaction</span>
        </button>
        
        <button
          onClick={() => window.print()}
          className="btn-secondary inline-flex items-center space-x-2"
        >
          <FaDownload />
          <span>Print Statement</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            <h2 className="text-2xl font-display font-bold gold-text mb-6">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    placeholder="e.g., Gold Chain"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Type *
                  </label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Cr' | 'Dr' })}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="Cr">Credit (Give Gold)</option>
                    <option value="Dr">Debit (Return Gold)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Gold Amount (grams)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.goldamount}
                    onChange={(e) =>
                      setFormData({ ...formData, goldamount: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Apply Loss
                  </label>
                  <div className="flex items-center h-10">
                    <input 
                      type="checkbox" 
                      checked={formData.islose === "true"} 
                      onChange={(e) => setFormData({ ...formData, islose: e.target.checked.toString() })}
                      className="w-5 h-5 bg-zinc-900 border border-zinc-700 rounded focus:ring-gold-500"
                    />
                    <span className="ml-2 text-sm text-zinc-400">Loss applicable on this transaction</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}