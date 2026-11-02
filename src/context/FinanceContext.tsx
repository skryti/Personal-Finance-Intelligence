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
  DEMO_TRANSACTIONS,
  DEMO_SPLIT_GROUPS,
  DEMO_SPLIT_EXPENSES,
  DEMO_SETTLEMENTS,
  DEMO_USER_ID,
} from '../data/demoData';
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
  deleteSplitGroup: (groupId: string) => Promise<void>;
  renameMemberInGroup: (groupId: string, oldName: string, newName: string) => Promise<void>;
  addSplitExpense: (expense: Omit<SplitExpense, 'id'>) => void;
  deleteSplitExpense: (expenseId: string) => Promise<void>;
  deleteSettlement: (settlementId: string) => Promise<void>;
  recordSettlement: (settlement: Omit<Settlement, 'id'>) => void;
  resetToDefaultData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'pet_store_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>(() => {
    if (isDemoMode) {
      try {
        const stored = localStorage.getItem('pet_demo_groups');
        return stored ? JSON.parse(stored) : DEMO_SPLIT_GROUPS;
      } catch {
        return DEMO_SPLIT_GROUPS;
      }
    }
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_groups`);
      return stored ? JSON.parse(stored) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>(() => {
    if (isDemoMode) {
      try {
        const stored = localStorage.getItem('pet_demo_expenses');
        return stored ? JSON.parse(stored) : DEMO_SPLIT_EXPENSES;
      } catch {
        return DEMO_SPLIT_EXPENSES;
      }
    }
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return stored ? JSON.parse(stored) : INITIAL_SPLIT_EXPENSES;
    } catch {
      return INITIAL_SPLIT_EXPENSES;
    }
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    if (isDemoMode) {
      try {
        const stored = localStorage.getItem('pet_demo_settlements');
        return stored ? JSON.parse(stored) : DEMO_SETTLEMENTS;
      } catch {
        return DEMO_SETTLEMENTS;
      }
    }
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_settlements`);
      return stored ? JSON.parse(stored) : INITIAL_SETTLEMENTS;
    } catch {
      return INITIAL_SETTLEMENTS;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Sync helper: save to Supabase cloud auth metadata and user-isolated localStorage
  const syncSplitToBackend = useCallback(
    async (groups: SplitGroup[], expenses: SplitExpense[], settleList: Settlement[]) => {
      if (isDemoMode) {
        try {
          localStorage.setItem('pet_demo_groups', JSON.stringify(groups));
          localStorage.setItem('pet_demo_expenses', JSON.stringify(expenses));
          localStorage.setItem('pet_demo_settlements', JSON.stringify(settleList));
        } catch (e) {
          console.error('Demo split storage error', e);
        }
        return;
      }

      // Local cache
      try {
        localStorage.setItem(`${STORAGE_KEY}_groups`, JSON.stringify(groups));
        localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
        localStorage.setItem(`${STORAGE_KEY}_settlements`, JSON.stringify(settleList));
        if (user?.id) {
          localStorage.setItem(`${STORAGE_KEY}_${user.id}_groups`, JSON.stringify(groups));
          localStorage.setItem(`${STORAGE_KEY}_${user.id}_expenses`, JSON.stringify(expenses));
          localStorage.setItem(`${STORAGE_KEY}_${user.id}_settlements`, JSON.stringify(settleList));
        }
      } catch (e) {
        console.error('Local split storage error', e);
      }

      // Cloud persistence via Supabase Auth user_metadata
      if (user?.id) {
        try {
          await supabase.auth.updateUser({
            data: {
              split_groups: groups,
              split_expenses: expenses,
              settlements: settleList,
            },
          });
        } catch (e) {
          console.error('Supabase user metadata sync error', e);
        }
      }
    },
    [user, isDemoMode]
  );

  // Load split data whenever authenticated user or demo mode changes
  useEffect(() => {
    if (isDemoMode) {
      try {
        const storedG = localStorage.getItem('pet_demo_groups');
        const storedE = localStorage.getItem('pet_demo_expenses');
        const storedS = localStorage.getItem('pet_demo_settlements');
        const gList = storedG ? JSON.parse(storedG) : DEMO_SPLIT_GROUPS;
        const eList = storedE ? JSON.parse(storedE) : DEMO_SPLIT_EXPENSES;
        const sList = storedS ? JSON.parse(storedS) : DEMO_SETTLEMENTS;
        setSplitGroups(gList);
        setSplitExpenses(eList);
        setSettlements(sList);
        if (gList.length > 0) {
          setSelectedGroupId(gList[0].id);
        }
      } catch {
        setSplitGroups(DEMO_SPLIT_GROUPS);
        setSplitExpenses(DEMO_SPLIT_EXPENSES);
        setSettlements(DEMO_SETTLEMENTS);
        setSelectedGroupId(DEMO_SPLIT_GROUPS[0].id);
      }
      return;
    }

    if (!user) {
      setSplitGroups([]);
      setSplitExpenses([]);
      setSettlements([]);
      setSelectedGroupId(null);
      return;
    }

    // 1. Check user_metadata first (persisted in Supabase cloud)
    const metaGroups = user.user_metadata?.split_groups;
    const metaExpenses = user.user_metadata?.split_expenses;
    const metaSettlements = user.user_metadata?.settlements;

    // 2. Check user-scoped localStorage
    let localGroups: SplitGroup[] | null = null;
    let localExpenses: SplitExpense[] | null = null;
    let localSettlements: Settlement[] | null = null;
    try {
      const g = localStorage.getItem(`${STORAGE_KEY}_${user.id}_groups`) || localStorage.getItem(`${STORAGE_KEY}_groups`);
      if (g) localGroups = JSON.parse(g);
      const e = localStorage.getItem(`${STORAGE_KEY}_${user.id}_expenses`) || localStorage.getItem(`${STORAGE_KEY}_expenses`);
      if (e) localExpenses = JSON.parse(e);
      const s = localStorage.getItem(`${STORAGE_KEY}_${user.id}_settlements`) || localStorage.getItem(`${STORAGE_KEY}_settlements`);
      if (s) localSettlements = JSON.parse(s);
    } catch {}

    const initialG: SplitGroup[] = metaGroups || localGroups || [];
    const initialE: SplitExpense[] = metaExpenses || localExpenses || [];
    const initialS: Settlement[] = metaSettlements || localSettlements || [];

    setSplitGroups(initialG);
    setSplitExpenses(initialE);
    setSettlements(initialS);
    if (initialG.length > 0) {
      setSelectedGroupId(initialG[0].id);
    }

    // 3. Asynchronously check if Supabase relational tables exist and load from them
    const fetchFromSupabaseTables = async () => {
      try {
        const [grpRes, expRes, setRes] = await Promise.all([
          supabase.from('split_groups').select('*').eq('user_id', user.id),
          supabase.from('split_expenses').select('*').eq('user_id', user.id),
          supabase.from('settlements').select('*').eq('user_id', user.id),
        ]);

        if (grpRes.data && grpRes.data.length > 0) {
          const parsedGroups: SplitGroup[] = grpRes.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            description: g.description,
            members: Array.isArray(g.members) ? g.members : JSON.parse(g.members || '[]'),
            createdAt: g.created_at,
          }));
          setSplitGroups(parsedGroups);
          setSelectedGroupId((prev) => prev || parsedGroups[0]?.id || null);
        } else if (grpRes.data && grpRes.data.length === 0 && initialG.length > 0) {
          // Relational tables were newly created -> backfill existing local split data
          for (const g of initialG) {
            await supabase.from('split_groups').insert({
              id: g.id,
              user_id: user.id,
              name: g.name,
              description: g.description,
              members: g.members,
              created_at: g.createdAt,
            });
          }
          for (const exp of initialE) {
            await supabase.from('split_expenses').insert({
              id: exp.id,
              user_id: user.id,
              group_id: exp.groupId,
              description: exp.description,
              amount: exp.amount,
              paid_by: exp.paidBy,
              split_type: exp.splitType,
              allocations: exp.allocations,
              date: exp.date,
            });
          }
          for (const s of initialS) {
            await supabase.from('settlements').insert({
              id: s.id,
              user_id: user.id,
              group_id: s.groupId,
              from_member: s.fromMember,
              to_member: s.toMember,
              amount: s.amount,
              date: s.date,
              notes: s.notes,
            });
          }
        }

        if (expRes.data && expRes.data.length > 0) {
          const parsedExpenses: SplitExpense[] = expRes.data.map((e: any) => ({
            id: e.id,
            groupId: e.group_id,
            description: e.description,
            amount: Number(e.amount),
            paidBy: e.paid_by,
            splitType: e.split_type,
            allocations: Array.isArray(e.allocations) ? e.allocations : JSON.parse(e.allocations || '[]'),
            date: e.date,
          }));
          setSplitExpenses(parsedExpenses);
        }

        if (setRes.data && setRes.data.length > 0) {
          const parsedSettlements: Settlement[] = setRes.data.map((s: any) => ({
            id: s.id,
            groupId: s.group_id,
            fromMember: s.from_member,
            toMember: s.to_member,
            amount: Number(s.amount),
            date: s.date,
            notes: s.notes,
          }));
          setSettlements(parsedSettlements);
        }
      } catch {
        // Relational tables fallback handled via metadata and local cache
      }
    };

    if (!isDemoMode) {
      fetchFromSupabaseTables();
    }
  }, [user, isDemoMode]);

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

  // Fetch transactions from Supabase or Local Demo Store
  const fetchTransactions = useCallback(async () => {
    if (isDemoMode) {
      setLoadingTransactions(true);
      setTransactionsError(null);
      try {
        const stored = localStorage.getItem('pet_demo_transactions');
        if (stored) {
          setTransactions(JSON.parse(stored));
        } else {
          setTransactions(DEMO_TRANSACTIONS);
          localStorage.setItem('pet_demo_transactions', JSON.stringify(DEMO_TRANSACTIONS));
        }
      } catch {
        setTransactions(DEMO_TRANSACTIONS);
      } finally {
        setLoadingTransactions(false);
      }
      return;
    }

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
  }, [user, isDemoMode]);

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

  // Add Transaction to Supabase or Demo Store
  const addTransaction = async (txData: TransactionInput): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      const newTx: Transaction = {
        id: `demo-tx-${Date.now()}`,
        user_id: DEMO_USER_ID,
        title: txData.title.trim(),
        amount: txData.amount,
        type: txData.type,
        category: txData.category,
        date: txData.date,
        created_at: new Date().toISOString(),
        description: txData.title.trim(),
      };

      setTransactions((prev) => {
        const updated = [newTx, ...prev];
        try {
          localStorage.setItem('pet_demo_transactions', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return { success: true };
    }

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

  // Update Transaction in Supabase or Demo Store
  const updateTransaction = async (
    id: string,
    txData: TransactionInput
  ): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      setTransactions((prev) => {
        const updated = prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: txData.title.trim(),
                amount: txData.amount,
                type: txData.type,
                category: txData.category,
                date: txData.date,
                description: txData.title.trim(),
              }
            : t
        );
        try {
          localStorage.setItem('pet_demo_transactions', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return { success: true };
    }

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

  // Delete Transaction from Supabase or Demo Store
  const deleteTransaction = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        try {
          localStorage.setItem('pet_demo_transactions', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return { success: true };
    }

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
    const updated = [newGroup, ...splitGroups];
    setSplitGroups(updated);
    setSelectedGroupId(newGroup.id);
    syncSplitToBackend(updated, splitExpenses, settlements);

    if (isDemoMode) return;

    if (user?.id) {
      supabase
        .from('split_groups')
        .insert({
          id: newGroup.id,
          user_id: user.id,
          name: newGroup.name,
          description: newGroup.description,
          members: newGroup.members,
          created_at: newGroup.createdAt,
        })
        .then();
    }
  };

  const deleteSplitGroup = async (groupId: string) => {
    const updatedGroups = splitGroups.filter((g) => g.id !== groupId);
    const updatedExpenses = splitExpenses.filter((e) => e.groupId !== groupId);
    const updatedSettlements = settlements.filter((s) => s.groupId !== groupId);

    setSplitGroups(updatedGroups);
    setSplitExpenses(updatedExpenses);
    setSettlements(updatedSettlements);

    if (selectedGroupId === groupId) {
      setSelectedGroupId(updatedGroups.length > 0 ? updatedGroups[0].id : null);
    }

    syncSplitToBackend(updatedGroups, updatedExpenses, updatedSettlements);

    if (isDemoMode) return;

    if (user?.id) {
      supabase.from('split_groups').delete().eq('id', groupId).eq('user_id', user.id).then();
      supabase.from('split_expenses').delete().eq('group_id', groupId).eq('user_id', user.id).then();
      supabase.from('settlements').delete().eq('group_id', groupId).eq('user_id', user.id).then();
    }
  };

  const renameMemberInGroup = async (groupId: string, oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;

    const updatedGroups = splitGroups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        members: g.members.map((m) => (m === oldName ? trimmed : m)),
      };
    });

    const updatedExpenses = splitExpenses.map((exp) => {
      if (exp.groupId !== groupId) return exp;
      return {
        ...exp,
        paidBy: exp.paidBy === oldName ? trimmed : exp.paidBy,
        allocations: exp.allocations.map((alloc) => ({
          ...alloc,
          member: alloc.member === oldName ? trimmed : alloc.member,
        })),
      };
    });

    const updatedSettlements = settlements.map((set) => {
      if (set.groupId !== groupId) return set;
      return {
        ...set,
        fromMember: set.fromMember === oldName ? trimmed : set.fromMember,
        toMember: set.toMember === oldName ? trimmed : set.toMember,
      };
    });

    setSplitGroups(updatedGroups);
    setSplitExpenses(updatedExpenses);
    setSettlements(updatedSettlements);

    syncSplitToBackend(updatedGroups, updatedExpenses, updatedSettlements);

    if (isDemoMode) return;

    if (user?.id) {
      const targetGroup = updatedGroups.find((g) => g.id === groupId);
      if (targetGroup) {
        supabase
          .from('split_groups')
          .update({ members: targetGroup.members })
          .eq('id', groupId)
          .eq('user_id', user.id)
          .then();
      }
    }
  };

  const addSplitExpense = (expense: Omit<SplitExpense, 'id'>) => {
    const newExpense: SplitExpense = {
      ...expense,
      id: `sexp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [newExpense, ...splitExpenses];
    setSplitExpenses(updated);
    syncSplitToBackend(splitGroups, updated, settlements);

    if (isDemoMode) return;

    if (user?.id) {
      supabase
        .from('split_expenses')
        .insert({
          id: newExpense.id,
          user_id: user.id,
          group_id: newExpense.groupId,
          description: newExpense.description,
          amount: newExpense.amount,
          paid_by: newExpense.paidBy,
          split_type: newExpense.splitType,
          allocations: newExpense.allocations,
          date: newExpense.date,
        })
        .then();
    }
  };

  const deleteSplitExpense = async (expenseId: string) => {
    const updatedExpenses = splitExpenses.filter((e) => e.id !== expenseId);
    setSplitExpenses(updatedExpenses);
    syncSplitToBackend(splitGroups, updatedExpenses, settlements);

    if (isDemoMode) return;

    if (user?.id) {
      try {
        await supabase
          .from('split_expenses')
          .delete()
          .eq('id', expenseId)
          .eq('user_id', user.id);
      } catch (e) {
        console.error('Error deleting split expense from Supabase:', e);
      }
    }
  };

  const deleteSettlement = async (settlementId: string) => {
    const updatedSettlements = settlements.filter((s) => s.id !== settlementId);
    setSettlements(updatedSettlements);
    syncSplitToBackend(splitGroups, splitExpenses, updatedSettlements);

    if (isDemoMode) return;

    if (user?.id) {
      try {
        await supabase
          .from('settlements')
          .delete()
          .eq('id', settlementId)
          .eq('user_id', user.id);
      } catch (e) {
        console.error('Error deleting settlement from Supabase:', e);
      }
    }
  };

  const recordSettlement = (settlement: Omit<Settlement, 'id'>) => {
    const newSettlement: Settlement = {
      ...settlement,
      id: `settle-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [newSettlement, ...settlements];
    setSettlements(updated);
    syncSplitToBackend(splitGroups, splitExpenses, updated);

    if (isDemoMode) return;

    if (user?.id) {
      supabase
        .from('settlements')
        .insert({
          id: newSettlement.id,
          user_id: user.id,
          group_id: newSettlement.groupId,
          from_member: newSettlement.fromMember,
          to_member: newSettlement.toMember,
          amount: newSettlement.amount,
          date: newSettlement.date,
          notes: newSettlement.notes,
        })
        .then();
    }
  };

  const resetToDefaultData = () => {
    if (isDemoMode) {
      setTransactions(DEMO_TRANSACTIONS);
      setSplitGroups(DEMO_SPLIT_GROUPS);
      setSplitExpenses(DEMO_SPLIT_EXPENSES);
      setSettlements(DEMO_SETTLEMENTS);
      try {
        localStorage.setItem('pet_demo_transactions', JSON.stringify(DEMO_TRANSACTIONS));
        localStorage.setItem('pet_demo_groups', JSON.stringify(DEMO_SPLIT_GROUPS));
        localStorage.setItem('pet_demo_expenses', JSON.stringify(DEMO_SPLIT_EXPENSES));
        localStorage.setItem('pet_demo_settlements', JSON.stringify(DEMO_SETTLEMENTS));
      } catch {}
      return;
    }
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
        deleteSplitGroup,
        renameMemberInGroup,
        addSplitExpense,
        deleteSplitExpense,
        deleteSettlement,
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
