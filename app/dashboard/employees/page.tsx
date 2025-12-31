'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUser, FaKey } from 'react-icons/fa';

interface Employee {
  _id?: string;
  name: string;
  email: string;
  phone: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState<Employee>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEmployees(data.users);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = '/api/employs';
      const method = editingEmployee ? 'PUT' : 'POST';

      const payload: any = {
        ...formData,
        ...(editingEmployee && { id: editingEmployee._id }),
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
        editingEmployee
          ? 'Employee updated successfully'
          : 'Employee created successfully'
      );
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error: any) {
      alert(error.message || 'Operation failed');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/employs?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Employee deleted successfully');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setEditingEmployee(null);
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
            Employees
          </h1>
          <p className="text-zinc-400">Manage employee accounts and permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary mt-4 md:mt-0 inline-flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg">
                  <FaUser className="text-xl text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{employee.name}</h3>
                  <p className="text-xs text-zinc-400">{employee.email}</p>
                </div>
              </div>
             
            </div>

            {employee.phone && (
              <p className="text-sm text-zinc-400 mb-4">📞 {employee.phone}</p>
            )}
            
            {/* Actions */}
            <div className="flex items-center space-x-2 pt-4 border-t border-zinc-800">
              <button
                onClick={() => handleEdit(employee)}
                className="flex-1 btn-secondary text-sm py-2 inline-flex items-center justify-center space-x-2"
              >
                <FaEdit />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(employee._id!)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center space-x-2"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            <h2 className="text-2xl font-display font-bold gold-text mb-6">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
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
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
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
