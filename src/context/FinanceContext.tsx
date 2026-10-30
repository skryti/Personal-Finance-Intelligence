import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  INITIAL_TRANSACTIONS,
  INITIAL_GROUPS,
  INITIAL_SPLIT_EXPENSES,
  INITIAL_SETTLEMENTS,
  INITIAL_MONTHLY_DATA,
} from '../data/initialMockData';
import { calculateFinancialSummary, calculateCategorySpending } from '../utils/calculations';
import { calculateSplitLedgerSummary } from '../utils/splitLedger';

interface FinanceContextType {
  transactions: Transaction[];
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
  isCreateGroupOpen: boolean;
  isAddSplitExpenseOpen: boolean;
  isSettleUpOpen: boolean;

  setActiveTab: (tab: TabType) => void;
  setSelectedGroupId: (id: string | null) => void;
  setAddTransactionOpen: (open: boolean) => void;
  setCreateGroupOpen: (open: boolean) => void;
  setAddSplitExpenseOpen: (open: boolean) => void;
  setSettleUpOpen: (open: boolean) => void;

  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  createSplitGroup: (group: Omit<SplitGroup, 'id' | 'createdAt'>) => void;
  addSplitExpense: (expense: Omit<SplitExpense, 'id'>) => void;
  recordSettlement: (settlement: Omit<Settlement, 'id'>) => void;
  resetToDefaultData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'pfi_store_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(INITIAL_GROUPS[0]?.id || null);

  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);
  const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);
  const [isAddSplitExpenseOpen, setAddSplitExpenseOpen] = useState(false);
  const [isSettleUpOpen, setSettleUpOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_groups`, JSON.stringify(splitGroups));
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(splitExpenses));
      localStorage.setItem(`${STORAGE_KEY}_settlements`, JSON.stringify(settlements));
    } catch (e) {
      console.error('Storage sync error', e);
    }
  }, [transactions, splitGroups, splitExpenses, settlements]);

  // Derived calculations
  const summary = useMemo(() => calculateFinancialSummary(transactions), [transactions]);
  const categorySpending = useMemo(() => calculateCategorySpending(transactions), [transactions]);
  const splitSummary = useMemo(
    () => calculateSplitLedgerSummary(splitGroups, splitExpenses, settlements),
    [splitGroups, splitExpenses, settlements]
  );

  const monthlyData = useMemo(() => {
    // Dynamically update Sep point based on current transactions
    const base = [...INITIAL_MONTHLY_DATA];
    const sepIndex = base.findIndex((p) => p.month === 'Sep');
    if (sepIndex >= 0) {
      base[sepIndex] = {
        month: 'Sep',
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        savings: summary.savings,
      };
    }
    return base;
  }, [summary]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const createSplitGroup = (group: Omit<SplitGroup, 'id' | 'createdAt'>) => {
    const newGroup: SplitGroup = {
      ...group,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      members: Array.from(new Set(['You', ...group.members])),
    };
    setSplitGroups((prev) => [...prev, newGroup]);
    setSelectedGroupId(newGroup.id);
  };

  const addSplitExpense = (expense: Omit<SplitExpense, 'id'>) => {
    const newExpense: SplitExpense = {
      ...expense,
      id: `sexp-${Date.now()}`,
    };
    setSplitExpenses((prev) => [newExpense, ...prev]);
  };

  const recordSettlement = (settlement: Omit<Settlement, 'id'>) => {
    const newSettlement: Settlement = {
      ...settlement,
      id: `set-${Date.now()}`,
    };
    setSettlements((prev) => [newSettlement, ...prev]);
  };

  const resetToDefaultData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setSplitGroups(INITIAL_GROUPS);
    setSplitExpenses(INITIAL_SPLIT_EXPENSES);
    setSettlements(INITIAL_SETTLEMENTS);
    setSelectedGroupId(INITIAL_GROUPS[0]?.id || null);
    try {
      localStorage.removeItem(`${STORAGE_KEY}_transactions`);
      localStorage.removeItem(`${STORAGE_KEY}_groups`);
      localStorage.removeItem(`${STORAGE_KEY}_expenses`);
      localStorage.removeItem(`${STORAGE_KEY}_settlements`);
    } catch {}
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
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
        isCreateGroupOpen,
        isAddSplitExpenseOpen,
        isSettleUpOpen,
        setActiveTab,
        setSelectedGroupId,
        setAddTransactionOpen,
        setCreateGroupOpen,
        setAddSplitExpenseOpen,
        setSettleUpOpen,
        addTransaction,
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
