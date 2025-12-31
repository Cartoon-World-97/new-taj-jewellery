'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

interface Client {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  accountBalance: number;
  totalGoldGiven: number;
  totalAmountPaid: number;
  totalAmountReceived: number;
  isActive: boolean;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
  }, [search]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/clients?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setClients(data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';

      const payload: any = {
        ...formData,
        ...(editingClient && { id: editingClient._id }),
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
        const error = await response.json();
        throw new Error(error.error || 'Operation failed');
      }

      alert(
        editingClient
          ? 'Client updated successfully'
          : 'Client created successfully'
      );
      setShowModal(false);
      resetForm();
      fetchClients();
    } catch (error: any) {
      alert(error.message || 'Operation failed');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Client deleted successfully');
        fetchClients();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete client');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    setEditingClient(null);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold gold-text mb-2">
            Clients / Workers
          </h1>
          <p className="text-zinc-400">
            Manage customers and workers who bring jewelry work
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary mt-4 md:mt-0 inline-flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client._id} className="card">
            {/* Client Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg">
                  <FaUser className="text-xl text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{client.name}</h3>
                  <p className="text-xs text-zinc-400 flex items-center mt-1">
                    <FaPhone className="mr-1" />
                    {client.phone}
                  </p>
                  {client.email && (
                    <p className="text-xs text-zinc-400 flex items-center mt-1">
                      <FaEnvelope className="mr-1" />
                      {client.email}
                    </p>
                  )}
                </div>
              </div>
              {client.isActive ? (
                <FaCheckCircle className="text-green-500" title="Active" />
              ) : (
                <FaTimesCircle className="text-red-500" title="Inactive" />
              )}
            </div>

            {/* Account Summary */}
            <div className="space-y-2 mb-4 p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Gold Given:</span>
                <span className="text-gold-500 font-semibold">
                  {client.totalGoldGiven.toFixed(3)}g
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">We Paid:</span>
                <span className="text-red-400 font-semibold">
                  ₹{client.totalAmountPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">They Paid:</span>
                <span className="text-green-400 font-semibold">
                  ₹{client.totalAmountReceived.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                <span className="text-zinc-300 font-semibold">Balance:</span>
                <span
                  className={`font-bold ${
                    client.accountBalance > 0
                      ? 'text-green-500'
                      : client.accountBalance < 0
                      ? 'text-red-500'
                      : 'text-white'
                  }`}
                >
                  {client.accountBalance > 0 ? '+' : ''}₹
                  {client.accountBalance.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {client.accountBalance > 0
                  ? 'They owe us'
                  : client.accountBalance < 0
                  ? 'We owe them'
                  : 'Settled'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-4 border-t border-zinc-800">
              <Link
                href={`/dashboard/clients/${client._id}`}
                className="flex-1 btn-secondary text-sm py-2 inline-flex items-center justify-center space-x-2"
              >
                <FaEye />
                <span>View</span>
              </Link>
              <button
                onClick={() => handleEdit(client)}
                className="flex-1 btn-secondary text-sm py-2 inline-flex items-center justify-center space-x-2"
              >
                <FaEdit />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(client._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center space-x-2"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="card text-center py-12">
          <FaUser className="text-5xl text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No clients found</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary mt-4 inline-flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add First Client</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            <h2 className="text-2xl font-display font-bold gold-text mb-6">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingClient ? 'Update Client' : 'Create Client'}
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