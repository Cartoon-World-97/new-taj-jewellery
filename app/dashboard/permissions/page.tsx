'use client';

import { useState, useEffect } from 'react';
import {
  FaUser,
  FaShieldAlt,
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canViewAll: boolean;
  };
}

export default function PermissionsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [changes, setChanges] = useState<{ [key: string]: Employee }>({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
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

  const updatePermission = (
    employeeId: string,
    permission: keyof Employee['permissions'],
    value: boolean
  ) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp._id === employeeId
          ? {
              ...emp,
              permissions: {
                ...emp.permissions,
                [permission]: value,
              },
            }
          : emp
      )
    );

    // Track changes
    const employee = employees.find((e) => e._id === employeeId);
    if (employee) {
      setChanges((prev) => ({
        ...prev,
        [employeeId]: {
          ...employee,
          permissions: {
            ...employee.permissions,
            [permission]: value,
          },
        },
      }));
    }
  };

  const savePermissions = async (employeeId: string) => {
    setSaving(employeeId);

    try {
      const token = localStorage.getItem('token');
      const employee = employees.find((e) => e._id === employeeId);

      if (!employee) return;

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          phone: '',
          permissions: employee.permissions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      // Remove from changes
      setChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[employeeId];
        return newChanges;
      });

      alert('Permissions updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update permissions');
    } finally {
      setSaving(null);
    }
  };

  const resetPermissions = (employeeId: string) => {
    fetchEmployees(); // Refetch to reset
    setChanges((prev) => {
      const newChanges = { ...prev };
      delete newChanges[employeeId];
      return newChanges;
    });
  };

  const hasChanges = (employeeId: string) => {
    return !!changes[employeeId];
  };

  const PermissionToggle = ({
    label,
    checked,
    onChange,
    description,
  }: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    description: string;
  }) => (
    <div className="flex items-start justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/70 transition-colors">
      <div className="flex-1">
        <label className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-12 h-6 rounded-full transition-colors ${
                checked ? 'bg-gold-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  checked ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </div>
          </div>
          <div>
            <span className="text-white font-medium block">{label}</span>
            <span className="text-xs text-zinc-500">{description}</span>
          </div>
        </label>
      </div>
      {checked ? (
        <FaCheckCircle className="text-green-500 mt-1" />
      ) : (
        <FaTimesCircle className="text-zinc-600 mt-1" />
      )}
    </div>
  );

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
      <div className="flex items-center space-x-4">
        <div className="p-4 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl">
          <FaShieldAlt className="text-3xl text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold gold-text mb-1">
            Permission Management
          </h1>
          <p className="text-zinc-400">
            Configure employee access and permissions
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-500/10 border-2 border-blue-500/30">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FaShieldAlt className="text-xl text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-400 mb-1">
              About Permissions
            </h3>
            <p className="text-sm text-zinc-400">
              Control what each employee can do in the system. Admins always have
              full permissions. Changes are saved individually per employee.
            </p>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <div key={employee._id} className="card">
            {/* Employee Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg">
                  <FaUser className="text-xl text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{employee.name}</h3>
                  <p className="text-sm text-zinc-400">{employee.email}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  employee.role === 'admin'
                    ? 'bg-gold-500/20 text-gold-500'
                    : 'bg-blue-500/20 text-blue-500'
                }`}
              >
                {employee.role === 'admin' ? 'Admin' : 'Employee'}
              </span>
            </div>

            {/* Admin Notice */}
            {employee.role === 'admin' && (
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-gold-400 flex items-center">
                  <FaShieldAlt className="mr-2" />
                  Admin users have all permissions by default
                </p>
              </div>
            )}

            {/* Permissions */}
            <div className="space-y-3">
              <PermissionToggle
                label="Create Transactions"
                description="Can add new transactions to the system"
                checked={employee.permissions.canCreate}
                onChange={(value) =>
                  updatePermission(employee._id, 'canCreate', value)
                }
              />

              <PermissionToggle
                label="Edit Transactions"
                description="Can modify existing transaction details"
                checked={employee.permissions.canEdit}
                onChange={(value) =>
                  updatePermission(employee._id, 'canEdit', value)
                }
              />

              <PermissionToggle
                label="Delete Transactions"
                description="Can remove transactions from the system"
                checked={employee.permissions.canDelete}
                onChange={(value) =>
                  updatePermission(employee._id, 'canDelete', value)
                }
              />

              <PermissionToggle
                label="View All Transactions"
                description="Can see all transactions or only assigned ones"
                checked={employee.permissions.canViewAll}
                onChange={(value) =>
                  updatePermission(employee._id, 'canViewAll', value)
                }
              />
            </div>

            {/* Action Buttons */}
            {hasChanges(employee._id) && (
              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center space-x-3">
                <button
                  onClick={() => savePermissions(employee._id)}
                  disabled={saving === employee._id}
                  className="flex-1 btn-primary inline-flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving === employee._id ? (
                    <div className="spinner w-4 h-4 border-2"></div>
                  ) : (
                    <>
                      <FaSave />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => resetPermissions(employee._id)}
                  className="flex-1 btn-secondary inline-flex items-center justify-center space-x-2"
                >
                  <FaUndo />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="card bg-zinc-900/50">
        <h3 className="font-semibold text-white mb-4">Permission Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gold-500 font-semibold mb-1">
              Create Transactions
            </p>
            <p className="text-zinc-400">
              Allows employee to add new jewelry transaction records with all
              details including items, weights, and customer information.
            </p>
          </div>
          <div>
            <p className="text-gold-500 font-semibold mb-1">
              Edit Transactions
            </p>
            <p className="text-zinc-400">
              Permits modification of existing transactions including updating
              item details, customer info, and other transaction data.
            </p>
          </div>
          <div>
            <p className="text-gold-500 font-semibold mb-1">
              Delete Transactions
            </p>
            <p className="text-zinc-400">
              Grants ability to permanently remove transaction records from the
              system. Use with caution.
            </p>
          </div>
          <div>
            <p className="text-gold-500 font-semibold mb-1">
              View All Transactions
            </p>
            <p className="text-zinc-400">
              If enabled, employee can see all transactions. If disabled, they
              only see transactions assigned to them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
