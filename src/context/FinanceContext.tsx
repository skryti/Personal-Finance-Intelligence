import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  SplitGroup,
  SplitExpense,
  Settlement,
  FinancialSummary,
  CategorySpending,
  MonthlyOverviewPoint,
  SplitLedgerSummary,
  TabType,
} from '../types/finance';
import {
  INITIAL_GROUPS,
  INITIAL_SPLIT_EXPENSES,
  INITIAL_SETTLEMENTS,
} from '../data/initialMockData';
import {
  calculateFinancialSummary,
  calculateCategorySpending,
  calculateMonthlyData,
} from '../utils/calculations';
import { calculateSplitLedgerSummary } from '../utils/splitLedger';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface TransactionInput {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  loadingTransactions: boolean;
  transactionsError: string | null;
  splitGroups: SplitGroup[];
  splitExpenses: SplitExpense[];
  settlements: Settlement[];
  activeTab: TabType;
  selectedGroupId: string | null;

  summary: FinancialSummary;
  categorySpending: CategorySpending[];
  monthlyData: MonthlyOverviewPoint[];
  splitSummary: SplitLedgerSummary;

  isAddTransactionOpen: boolean;
  editingTransaction: Transaction | null;
  isCreateGroupOpen: boolean;
  isAddSplitExpenseOpen: boolean;
  isSettleUpOpen: boolean;

  setActiveTab: (tab: TabType) => void;
  setSelectedGroupId: (id: string | null) => void;
  setAddTransactionOpen: (open: boolean) => void;
  setEditingTransaction: (tx: Transaction | null) => void;
  setCreateGroupOpen: (open: boolean) => void;
  setAddSplitExpenseOpen: (open: boolean) => void;
  setSettleUpOpen: (open: boolean) => void;

  fetchTransactions: () => Promise<void>;
  addTransaction: (tx: TransactionInput) => Promise<{ success: boolean; error?: string }>;
  updateTransaction: (id: string, tx: TransactionInput) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction: (id: string) => Promise<{ success: boolean; error?: string }>;
  createSplitGroup: (group: Omit<SplitGroup, 'id' | 'createdAt'>) => void;
  addSplitExpense: (expense: Omit<SplitExpense, 'id'>) => void;
  recordSettlement: (settlement: Omit<Settlement, 'id'>) => void;
  resetToDefaultData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'pet_store_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_groups`);
      return stored ? JSON.parse(stored) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return stored ? JSON.parse(stored) : INITIAL_SPLIT_EXPENSES;
    } catch {
      return INITIAL_SPLIT_EXPENSES;
    }
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_settlements`);
      return stored ? JSON.parse(stored) : INITIAL_SETTLEMENTS;
    } catch {
      return INITIAL_SETTLEMENTS;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (splitGroups.length > 0 && (!selectedGroupId || !splitGroups.some((g) => g.id === selectedGroupId))) {
      setSelectedGroupId(splitGroups[0].id);
    } else if (splitGroups.length === 0) {
      setSelectedGroupId(null);
    }
  }, [splitGroups, selectedGroupId]);

  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);
  const [isAddSplitExpenseOpen, setAddSplitExpenseOpen] = useState(false);
  const [isSettleUpOpen, setSettleUpOpen] = useState(false);

  // Sync split bill ledger to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_groups`, JSON.stringify(splitGroups));
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(splitExpenses));
      localStorage.setItem(`${STORAGE_KEY}_settlements`, JSON.stringify(settlements));
    } catch (e) {
      console.error('Storage sync error', e);
    }
  }, [splitGroups, splitExpenses, settlements]);

  // Fetch transactions from Supabase
  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);
    setTransactionsError(null);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions from Supabase:', error.message);
        setTransactionsError(error.message);
      } else if (data) {
        const parsed: Transaction[] = data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          title: item.title,
          amount: typeof item.amount === 'string' ? parseFloat(item.amount) : Number(item.amount),
          type: item.type as 'income' | 'expense',
          category: item.category,
          date: item.date,
          created_at: item.created_at,
          description: item.title,
        }));
        setTransactions(parsed);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch transactions';
      console.error('Transaction fetch exception:', msg);
      setTransactionsError(msg);
    } finally {
      setLoadingTransactions(false);
    }
  }, [user]);

  // Load transactions whenever authenticated user changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Pure dynamic derived calculations
  const summary = useMemo(() => calculateFinancialSummary(transactions), [transactions]);
  const categorySpending = useMemo(() => calculateCategorySpending(transactions), [transactions]);
  const monthlyData = useMemo(() => calculateMonthlyData(transactions), [transactions]);
  const splitSummary = useMemo(
    () => calculateSplitLedgerSummary(splitGroups, splitExpenses, settlements),
    [splitGroups, splitExpenses, settlements]
  );

  // Add Transaction to Supabase
  const addTransaction = async (txData: TransactionInput): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User is not authenticated' };
    }

    try {
      const payload = {
        user_id: user.id,
        title: txData.title.trim(),
        amount: txData.amount,
        type: txData.type,
        category: txData.category,
        date: txData.date,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction to Supabase:', error.message);
        return { success: false, error: error.message };
      }

      if (data) {
        const newTx: Transaction = {
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          amount: typeof data.amount === 'string' ? parseFloat(data.amount) : Number(data.amount),
          type: data.type as 'income' | 'expense',
          category: data.category,
          date: data.date,
          created_at: data.created_at,
          description: data.title,
        };

        // Immediately update local transaction list
        setTransactions((prev) => [newTx, ...prev]);
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add transaction';
      console.error('Add transaction exception:', msg);
      return { success: false, error: msg };
    }
  };

  // Update Transaction in Supabase
  const updateTransaction = async (
    id: string,
    txData: TransactionInput
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          title: txData.title.trim(),
          amount: txData.amount,
          type: txData.type,
          category: txData.category,
          date: txData.date,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction in Supabase:', error.message);
        return { success: false, error: error.message };
      }

      if (data) {
        const updatedTx: Transaction = {
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          amount: typeof data.amount === 'string' ? parseFloat(data.amount) : Number(data.amount),
          type: data.type as 'income' | 'expense',
          category: data.category,
          date: data.date,
          created_at: data.created_at,
          description: data.title,
        };

        // Immediately update local state
        setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTx : t)));
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update transaction';
      console.error('Update transaction exception:', msg);
      return { success: false, error: msg };
    }
  };

  // Delete Transaction from Supabase
  const deleteTransaction = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction from Supabase:', error.message);
        return { success: false, error: error.message };
      }

      // Immediately filter out deleted item from local state
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete transaction';
      console.error('Delete transaction exception:', msg);
      return { success: false, error: msg };
    }
  };

  // Split bill operations
  const createSplitGroup = (group: Omit<SplitGroup, 'id' | 'createdAt'>) => {
    const newGroup: SplitGroup = {
      ...group,
      id: `grp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setSplitGroups((prev) => [newGroup, ...prev]);
    setSelectedGroupId(newGroup.id);
  };

  const addSplitExpense = (expense: Omit<SplitExpense, 'id'>) => {
    const newExpense: SplitExpense = {
      ...expense,
      id: `sexp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setSplitExpenses((prev) => [newExpense, ...prev]);
  };

  const recordSettlement = (settlement: Omit<Settlement, 'id'>) => {
    const newSettlement: Settlement = {
      ...settlement,
      id: `settle-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setSettlements((prev) => [newSettlement, ...prev]);
  };

  const resetToDefaultData = () => {
    setSplitGroups(INITIAL_GROUPS);
    setSplitExpenses([]);
    setSettlements([]);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        loadingTransactions,
        transactionsError,
        splitGroups,
        splitExpenses,
        settlements,
        activeTab,
        selectedGroupId,
        summary,
        categorySpending,
        monthlyData,
        splitSummary,
        isAddTransactionOpen,
        editingTransaction,
        isCreateGroupOpen,
        isAddSplitExpenseOpen,
        isSettleUpOpen,
        setActiveTab,
        setSelectedGroupId,
        setAddTransactionOpen,
        setEditingTransaction,
        setCreateGroupOpen,
        setAddSplitExpenseOpen,
        setSettleUpOpen,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        createSplitGroup,
        addSplitExpense,
        recordSettlement,
        resetToDefaultData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
