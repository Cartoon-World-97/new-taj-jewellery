export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin'; // Only admins have login access
  phone?: string;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canViewAll: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Client/Employee represents customers/workers who bring jewelry work
export interface Client {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  accountBalance: number; // Positive = we owe them, Negative = they owe us
  totalGoldGiven: number; // Total gold they've given us
  totalGoldReturned: number; // Total gold we've returned
  totalAmountPaid: number; // Total money we've paid them
  totalAmountReceived: number; // Total money we've received from them
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  _id?: string;
  transactionId: string; // Auto-generated unique ID
  billNo: string;
  date: string;
  time: string;
  clientId: string; // ID of the client/worker
  clientName: string; // Name of the client/worker
  type: 'work_received' | 'work_returned' | 'payment_given' | 'payment_received'; // Transaction type
  items: TransactionItem[];
  total: TransactionTotal;
  goldBar: {
    weight: number;
    amount: number;
  };
  // Payment/Amount fields
  amountGiven: number; // Money we gave to client
  amountReceived: number; // Money we received from client
  pendingAmount: number; // Remaining balance
  paymentStatus: 'pending' | 'partial' | 'cleared'; // Payment status
  paymentMethod?: string; // Cash, Bank Transfer, etc.
  closingBalance: {
    gold: number;
    cash: number;
  };
  notes?: string;
  createdBy: string; // Admin who created this
  createdByName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionItem {
  description: string;
  pcs: number;
  netWt: number;
  addWt: number;
  inchIbr: number;
  gold: number;
}

export interface TransactionTotal {
  pcs: number;
  netWt: number;
  inchIbr: number;
  gold: number;
}

export interface DashboardStats {
  totalTransactions: number;
  totalClients: number;
  todayTransactions: number;
  totalGoldAmount: number;
  totalPendingPayments: number;
  totalClearedPayments: number;
  recentTransactions: Transaction[];
}

export interface ClientStatement {
  client: Client;
  transactions: Transaction[];
  summary: {
    totalGoldGiven: number;
    totalGoldReturned: number;
    totalAmountPaid: number; // Money we paid to them
    totalAmountReceived: number; // Money they paid to us
    pendingAmount: number; // Current balance (+ they owe us, - we owe them)
    clearedAmount: number;
  };
}