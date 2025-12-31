// ============================================
// FRONTEND: NewTransactionPage.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

interface TransactionItem {
  description: string;
  pcs: number;
  netWt: number;
  addWt: number;
  inchIbr: number;
  gold: number;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerID: '',
  });

  const [items, setItems] = useState<TransactionItem[]>([
    {
      description: '',
      pcs: 0,
      netWt: 0,
      addWt: 0,
      inchIbr: 0,
      gold: 0,
    },
  ]);

  const [goldBar, setGoldBar] = useState({
    weight: 0,
    amount: 0,
  });

  const [closingBalance, setClosingBalance] = useState({
    gold: 0,
    cash: 0,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEmployees(data.users || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const calculateTotal = () => {
    return items.reduce(
      (acc, item) => ({
        pcs: acc.pcs + (item.pcs || 0),
        netWt: acc.netWt + (item.netWt || 0),
        inchIbr: acc.inchIbr + (item.inchIbr || 0),
        gold: acc.gold + (item.gold || 0),
      }),
      { pcs: 0, netWt: 0, inchIbr: 0, gold: 0 }
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        pcs: 0,
        netWt: 0,
        addWt: 0,
        inchIbr: 0,
        gold: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerID) {
      alert('Please assign this transaction to an employee');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const assignedEmployee = employees.find(emp => emp._id === formData.customerID);
      const total = calculateTotal();

      const transactionData = {
        customerID: formData.customerID,
        assignedToName: assignedEmployee?.name || '',
        items,
        total,
        goldBar,
        closingBalance: {
          gold: closingBalance.gold || 0,
          cash: closingBalance.cash || 0,
        },
      };

      console.log('Sending transaction data:', transactionData);

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transaction');
      }

      const result = await response.json();
      alert(`Transaction created successfully! ID: ${result.generatedId}`);
      router.push('/dashboard/transactions');
    } catch (error: any) {
      console.error('Transaction error:', error);
      alert(error.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-3xl font-display font-bold gold-text mb-2">
          New Transaction
        </h1>
        <p className="text-zinc-400">
          Create a new jewelry transaction record
          <span className="block text-sm mt-1 text-zinc-500">
            Transaction ID and timestamp will be automatically generated
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Transaction Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-2">
                Employee Name *
              </label>
              <select
                value={formData.customerID}
                onChange={(e) =>
                  setFormData({ ...formData, customerID: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-gold-500"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary inline-flex items-center space-x-2 text-sm"
            >
              <FaPlus />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gold-500">
                    Item {index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 block mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, 'description', e.target.value)
                      }
                      placeholder="e.g., Gold Ring"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      Pcs
                    </label>
                    <input
                      type="number"
                      value={item.pcs || ''}
                      onChange={(e) =>
                        updateItem(index, 'pcs', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      Net Wt (gms)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={item.netWt || ''}
                      onChange={(e) =>
                        updateItem(index, 'netWt', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      Add Wt
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={item.addWt || ''}
                      onChange={(e) =>
                        updateItem(index, 'addWt', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      Tnch×Ibr
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.inchIbr || ''}
                      onChange={(e) =>
                        updateItem(
                          index,
                          'inchIbr',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      Gold (gms)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={item.gold || ''}
                      onChange={(e) =>
                        updateItem(index, 'gold', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Row */}
          <div className="mt-4 p-4 bg-gold-500/10 border-2 border-gold-500/30 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Pcs</p>
                <p className="text-lg font-bold text-gold-500">{total.pcs}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Net Wt</p>
                <p className="text-lg font-bold text-gold-500">
                  {total.netWt.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Tnch×Ibr</p>
                <p className="text-lg font-bold text-gold-500">
                  {total.inchIbr.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Gold</p>
                <p className="text-lg font-bold text-gold-500">
                  {total.gold.toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gold Bar */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Gold Bar Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-2">
                Weight (gms)
              </label>
              <input
                type="number"
                step="0.01"
                value={goldBar.weight || ''}
                onChange={(e) =>
                  setGoldBar({
                    ...goldBar,
                    weight: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={goldBar.amount || ''}
                onChange={(e) =>
                  setGoldBar({
                    ...goldBar,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Closing Balance */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Closing Balance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-2">
                Gold Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={closingBalance.gold || ''}
                onChange={(e) =>
                  setClosingBalance({
                    ...closingBalance,
                    gold: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder={`Default: ${total.gold.toFixed(2)}`}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-2">
                Cash Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={closingBalance.cash || ''}
                onChange={(e) =>
                  setClosingBalance({
                    ...closingBalance,
                    cash: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="spinner w-5 h-5 border-2"></div>
            ) : (
              <>
                <FaSave />
                <span>Save Transaction</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}