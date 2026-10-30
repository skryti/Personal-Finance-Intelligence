import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Receipt,
  X,
  UserPlus,
  Clock,
  ArrowRightLeft,
  Trash2,
  Pencil,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SplitType, SplitAllocation } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateEqualSplit } from '../../utils/splitLedger';

export const SplitBillsView: React.FC = () => {
  const {
    splitGroups,
    splitExpenses,
    settlements,
    selectedGroupId,
    setSelectedGroupId,
    splitSummary,
    createSplitGroup,
    deleteSplitGroup,
    renameMemberInGroup,
    addSplitExpense,
    recordSettlement,
    isCreateGroupOpen,
    setCreateGroupOpen,
    isAddSplitExpenseOpen,
    setAddSplitExpenseOpen,
    isSettleUpOpen,
    setSettleUpOpen,
  } = useFinance();

  // Active group
  const activeGroup = splitGroups.find((g) => g.id === selectedGroupId) || splitGroups[0];

  // Forms
  // 1. Create Group Form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupMembersText, setNewGroupMembersText] = useState('');
  const [includeMeInGroup, setIncludeMeInGroup] = useState(true);

  // 2. Delete Group & Rename Member Modal states
  const [isDeleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [isRenameMemberOpen, setRenameMemberOpen] = useState(false);
  const [memberToRename, setMemberToRename] = useState('');
  const [newMemberNameInput, setNewMemberNameInput] = useState('');

  // 2. Add Group Expense Form
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('You');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customAllocations, setCustomAllocations] = useState<Record<string, string>>({});

  // 3. Settlement Form
  const [settleFrom, setSettleFrom] = useState('');
  const [settleTo, setSettleTo] = useState('You');
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  // When active group changes, update defaults
  useEffect(() => {
    if (activeGroup && activeGroup.members.length > 0) {
      setExpPaidBy(activeGroup.members[0] || 'You');
      const hasYou = activeGroup.members.includes('You');
      const defaultTo = hasYou ? 'You' : activeGroup.members[0];
      const defaultFrom =
        activeGroup.members.find((m) => m !== defaultTo) || activeGroup.members[0];
      setSettleFrom(defaultFrom || '');
      setSettleTo(defaultTo || '');
    }
  }, [activeGroup]);

  const activeGroupBalances =
    activeGroup && splitSummary.groupBalances[activeGroup.id]
      ? splitSummary.groupBalances[activeGroup.id]
      : [];

  const activeGroupDebts =
    activeGroup && splitSummary.groupDebts && splitSummary.groupDebts[activeGroup.id]
      ? splitSummary.groupDebts[activeGroup.id]
      : [];

  const activeGroupExpenses = activeGroup
    ? splitExpenses.filter((e) => e.groupId === activeGroup.id)
    : [];

  const activeGroupSettlements = activeGroup
    ? settlements.filter((s) => s.groupId === activeGroup.id)
    : [];

  // Live member preview for group creation
  const previewMembers = useMemo(() => {
    const parsed = newGroupMembersText
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
    if (includeMeInGroup) {
      const withoutYou = parsed.filter((m) => m.toLowerCase() !== 'you');
      return ['You', ...withoutYou];
    }
    return parsed;
  }, [newGroupMembersText, includeMeInGroup]);

  // Quick settle shortcut
  const handleQuickSettle = (from: string, to: string, amount: number) => {
    setSettleFrom(from);
    setSettleTo(to);
    setSettleAmount(amount.toString());
    setSettleNotes(`Settlement: ${from} to ${to}`);
    setSettleUpOpen(true);
  };

  // Rename member modal opener & submit handler
  const handleOpenRename = (member: string) => {
    setMemberToRename(member);
    setNewMemberNameInput(member);
    setRenameMemberOpen(true);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !newMemberNameInput.trim()) return;
    await renameMemberInGroup(activeGroup.id, memberToRename, newMemberNameInput.trim());
    setRenameMemberOpen(false);
    setMemberToRename('');
    setNewMemberNameInput('');
  };

  // Delete group handler
  const handleDeleteGroupConfirm = async () => {
    if (!activeGroup) return;
    await deleteSplitGroup(activeGroup.id);
    setDeleteGroupOpen(false);
  };

  // Group creation handler
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const parsedMembers = newGroupMembersText
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    let finalMembers: string[] = [];
    if (includeMeInGroup) {
      const withoutYou = parsedMembers.filter((m) => m.toLowerCase() !== 'you');
      finalMembers = ['You', ...withoutYou];
    } else {
      finalMembers = parsedMembers;
    }

    if (finalMembers.length < 2) {
      alert('Please provide at least 2 participants for a split group.');
      return;
    }

    createSplitGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || undefined,
      members: finalMembers,
    });

    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupMembersText('');
    setIncludeMeInGroup(true);
    setCreateGroupOpen(false);
  };

  // Expense submission handler
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !expDescription.trim() || !expAmount || Number(expAmount) <= 0) return;

    const total = parseFloat(expAmount);
    let finalAllocations: SplitAllocation[] = [];

    if (splitType === 'equal') {
      finalAllocations = calculateEqualSplit(total, activeGroup.members);
    } else {
      finalAllocations = activeGroup.members.map((m) => ({
        member: m,
        amount: parseFloat(customAllocations[m] || '0'),
      }));
    }

    addSplitExpense({
      groupId: activeGroup.id,
      description: expDescription.trim(),
      amount: total,
      paidBy: expPaidBy,
      splitType,
      allocations: finalAllocations,
      date: new Date().toISOString().split('T')[0],
    });

    setExpDescription('');
    setExpAmount('');
    setCustomAllocations({});
    setAddSplitExpenseOpen(false);
  };

  // Settlement submission handler
  const handleSettlementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !settleAmount || Number(settleAmount) <= 0) return;

    recordSettlement({
      groupId: activeGroup.id,
      fromMember: settleFrom || activeGroup.members[0] || 'You',
      toMember: settleTo || 'You',
      amount: parseFloat(settleAmount),
      date: new Date().toISOString().split('T')[0],
      notes: settleNotes.trim() || undefined,
    });

    setSettleAmount('');
    setSettleNotes('');
    setSettleUpOpen(false);
  };

  // If no groups exist yet, show clean empty state
  if (splitGroups.length === 0) {
    return (
      <div className="space-y-8">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Groups
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-900">0</h3>
              <p className="mt-1 text-xs text-slate-400 font-medium">Shared expense ledgers</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                You Owe
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-rose-600">{formatCurrency(0)}</h3>
              <p className="mt-1 text-xs text-slate-400 font-medium">Your pending liabilities</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Others Owe You
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(0)}</h3>
              <p className="mt-1 text-xs text-slate-400 font-medium">Pending reimbursements</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Group Expenses
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-900">0</h3>
              <p className="mt-1 text-xs text-slate-400 font-medium">Total shared bills recorded</p>
            </div>
          </div>
        </div>

        {/* Empty state illustration/card */}
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center">
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No expense groups yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No expense groups yet. Create your first group to start splitting bills with friends or flatmates!
          </p>
          <button
            onClick={() => setCreateGroupOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Create Group Modal */}
        {isCreateGroupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setCreateGroupOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-1">Create Split Group</h3>
              <p className="text-xs text-slate-400 mb-5">
                Set up a shared pool for trips, roommates, or shared expenses
              </p>

              <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Group Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trip, Roommates, Weekend Outing"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shared meals, groceries, and travel"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Participant Names (Comma-separated) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={!includeMeInGroup || previewMembers.length < 2}
                    placeholder="e.g. Aman, Sneha, Rohit or A, B, C"
                    value={newGroupMembersText}
                    onChange={(e) => setNewGroupMembersText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeMeInGroup}
                      onChange={(e) => setIncludeMeInGroup(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    />
                    <span>Include myself ('You') in this group</span>
                  </label>
                </div>

                {previewMembers.length > 0 && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500">
                      Group Participants ({previewMembers.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {previewMembers.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-800"
                        >
                          {m} {m === 'You' && '(Me)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateGroupOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header & Group Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Groups */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Groups
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{splitGroups.length}</h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Shared expense ledgers</p>
          </div>
        </div>

        {/* Total You Owe */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              You Owe
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-rose-600">
              {formatCurrency(splitSummary.totalYouOwe)}
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Your pending liabilities</p>
          </div>
        </div>

        {/* Total Others Owe You */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Others Owe You
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-emerald-600">
              {formatCurrency(splitSummary.totalOthersOweYou)}
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Pending reimbursements</p>
          </div>
        </div>

        {/* Recent Expenses Logged */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Group Expenses
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{splitExpenses.length}</h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Total shared bills recorded</p>
          </div>
        </div>
      </div>

      {/* 2. Group Selector & Management Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs for Groups */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {splitGroups.map((group) => {
            const isSelected = activeGroup?.id === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Add Expense, Settle Up, New Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setAddSplitExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Group Expense</span>
          </button>

          <button
            onClick={() => setSettleUpOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settle Up</span>
          </button>

          <button
            onClick={() => setCreateGroupOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>New Group</span>
          </button>

          {activeGroup && (
            <button
              onClick={() => setDeleteGroupOpen(true)}
              title="Delete this split group"
              className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete Group</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Who Owes Whom (Settlement Breakdown) Card */}
      {activeGroup && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Who Owes Whom (Settlement Breakdown)</h3>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Clear summary of who needs to give money to whom in {activeGroup.name}
              </p>
            </div>
            {activeGroupDebts.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {activeGroupDebts.length} pending settlement{activeGroupDebts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {activeGroupDebts.length === 0 ? (
            <div className="text-center py-6 px-4 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
              <p className="font-bold text-slate-800 text-xs">Everyone is all settled up! 🎉</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No pending debts or repayments in this group.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {activeGroupDebts.map((debt, idx) => (
                <div
                  key={`${debt.from}-${debt.to}-${idx}`}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                      <span className="text-rose-600 font-extrabold">{debt.from}</span>
                      <span className="text-slate-400 font-normal text-[11px]">owes</span>
                      <span className="text-emerald-600 font-extrabold">{debt.to}</span>
                    </div>
                    <div className="text-lg font-black text-slate-900">
                      {formatCurrency(debt.amount)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {debt.from} gives {formatCurrency(debt.amount)} to {debt.to}
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickSettle(debt.from, debt.to, debt.amount)}
                    className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Settle
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Main Ledger Table & Member Balances */}
      {activeGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Member Net Balances Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeGroup.name} Ledger</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {activeGroup.description || 'Shared expense pool and individual net balances'}
                </p>
              </div>
              <div className="flex -space-x-2">
                {activeGroup.members.map((m, idx) => (
                  <div
                    key={m}
                    title={m}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-xs"
                    style={{
                      backgroundColor: ['#EEF2FF', '#FEF3C7', '#DCFCE7', '#FCE7F3', '#E0F2FE'][idx % 5],
                      color: ['#4F46E5', '#D97706', '#16A34A', '#DB2777', '#0284C7'][idx % 5],
                    }}
                  >
                    {m[0].toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            {/* Balances Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Member</th>
                    <th className="pb-3 text-right">Total Paid</th>
                    <th className="pb-3 text-right">Share Owed</th>
                    <th className="pb-3 text-right">Net Balance</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {activeGroupBalances.map((mb) => {
                    const isOwed = mb.netBalance > 0;
                    const isOwing = mb.netBalance < 0;

                    return (
                      <tr key={mb.member} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                              {mb.member[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{mb.member}</span>
                                {mb.member === 'You' && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 font-semibold rounded">
                                    You
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleOpenRename(mb.member)}
                                  title={`Rename "${mb.member}"`}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                              {/* Dynamic who is giving to whom breakdown */}
                              <div className="text-[11px] font-normal mt-0.5 space-y-0.5">
                                {mb.owedBy && mb.owedBy.length > 0 && (
                                  <div className="text-emerald-600 font-medium">
                                    Receives: {mb.owedBy.map((d) => `${formatCurrency(d.amount)} from ${d.from}`).join(', ')}
                                  </div>
                                )}
                                {mb.owesTo && mb.owesTo.length > 0 && (
                                  <div className="text-rose-600 font-medium">
                                    Owes: {mb.owesTo.map((d) => `${formatCurrency(d.amount)} to ${d.to}`).join(', ')}
                                  </div>
                                )}
                                {(!mb.owedBy || mb.owedBy.length === 0) && (!mb.owesTo || mb.owesTo.length === 0) && (
                                  <div className="text-slate-400">All settled up</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-right font-medium text-slate-700 align-top">
                          {formatCurrency(mb.paid)}
                        </td>
                        <td className="py-3.5 text-right font-medium text-slate-700 align-top">
                          {formatCurrency(mb.share)}
                        </td>
                        <td
                          className={`py-3.5 text-right font-bold whitespace-nowrap align-top ${
                            isOwed
                              ? 'text-emerald-600'
                              : isOwing
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {isOwed ? '+' : ''}
                          {formatCurrency(mb.netBalance)}
                        </td>
                        <td className="py-3.5 text-right align-top">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isOwed
                                ? 'bg-emerald-50 text-emerald-600'
                                : isOwing
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isOwed
                              ? mb.member === 'You'
                                ? 'Others owe you'
                                : 'Is owed'
                              : isOwing
                              ? mb.member === 'You'
                                ? 'You owe'
                                : 'Owes'
                              : 'Settled'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Timeline / History */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Activity Timeline</span>
            </h4>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {activeGroupExpenses.length === 0 && activeGroupSettlements.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No activity in this group yet. Add an expense or record a settlement to start the ledger.
                </div>
              ) : (
                <>
                  {activeGroupSettlements.map((set) => (
                    <div
                      key={set.id}
                      className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100/50 flex items-start gap-2.5 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          <strong>{set.fromMember}</strong> settled{' '}
                          <strong className="text-indigo-600">{formatCurrency(set.amount)}</strong>{' '}
                          with <strong>{set.toMember}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(set.date)} {set.notes && `• ${set.notes}`}
                        </p>
                      </div>
                    </div>
                  ))}

                  {activeGroupExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="truncate max-w-[160px]">{exp.description}</span>
                        <span>{formatCurrency(exp.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>
                          Paid by <strong className="text-slate-700">{exp.paidBy}</strong>
                        </span>
                        <span>{formatDate(exp.date)}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>Split Breakdown:</span>
                          <span>
                            {exp.splitType === 'equal'
                              ? `Equal (${formatCurrency(exp.amount / exp.allocations.length)}/person)`
                              : 'Custom split'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {exp.allocations.map((alloc) => {
                            const isPayer = alloc.member === exp.paidBy;
                            return (
                              <span
                                key={alloc.member}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  isPayer
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold'
                                    : 'bg-white border border-slate-200 text-slate-700'
                                }`}
                              >
                                {alloc.member}:{' '}
                                {isPayer
                                  ? `Paid ${formatCurrency(exp.amount)}`
                                  : `Owes ${formatCurrency(alloc.amount)}`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Create Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setCreateGroupOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Split Group</h3>
            <p className="text-xs text-slate-400 mb-5">
              Set up a shared pool for trips, roommates, or flatmates
            </p>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trip, Roommates, Weekend Getaway"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Stay, food, and fuel expenses"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Participant Names (Comma-separated) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={!includeMeInGroup || previewMembers.length < 2}
                  placeholder="e.g. Aman, Sneha, Rohit or A, B, C"
                  value={newGroupMembersText}
                  onChange={(e) => setNewGroupMembersText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMeInGroup}
                    onChange={(e) => setIncludeMeInGroup(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span>Include myself ('You') in this group</span>
                </label>
              </div>

              {previewMembers.length > 0 && (
                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Group Participants ({previewMembers.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {previewMembers.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-800"
                      >
                        {m} {m === 'You' && '(Me)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateGroupOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Group Expense Modal */}
      {isAddSplitExpenseOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setAddSplitExpenseOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Group Expense</h3>
            <p className="text-xs text-slate-400 mb-5">
              Log shared cost for <strong>{activeGroup.name}</strong>
            </p>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner & drinks, Groceries"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    placeholder="e.g. 1200"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid By</label>
                  <select
                    value={expPaidBy}
                    onChange={(e) => setExpPaidBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 cursor-pointer"
                  >
                    {activeGroup.members.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Split Type Toggle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Split Type</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSplitType('equal')}
                    className={`flex-1 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                      splitType === 'equal'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Equal Split ({expAmount ? `₹${(Number(expAmount) / activeGroup.members.length).toFixed(0)}/person` : 'Equal'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType('custom')}
                    className={`flex-1 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                      splitType === 'custom'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Custom Split
                  </button>
                </div>
              </div>

              {/* Custom Allocation Inputs */}
              {splitType === 'custom' && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-semibold text-slate-700">Enter per-member amounts:</p>
                  {activeGroup.members.map((m) => (
                    <div key={m} className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-600">{m}:</span>
                      <input
                        type="number"
                        placeholder="₹ Amount"
                        value={customAllocations[m] || ''}
                        onChange={(e) =>
                          setCustomAllocations((prev) => ({
                            ...prev,
                            [m]: e.target.value,
                          }))
                        }
                        className="w-28 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right font-medium"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddSplitExpenseOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Save Split Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Settle Up Modal */}
      {isSettleUpOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSettleUpOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Record Settlement</h3>
            <p className="text-xs text-slate-400 mb-4">
              Clear outstanding debt in <strong>{activeGroup.name}</strong>
            </p>

            {/* Quick select pending debt */}
            {activeGroupDebts.length > 0 && (
              <div className="mb-4 p-3 bg-indigo-50/60 border border-indigo-100/80 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-900 block">
                  Quick select pending debt:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeGroupDebts.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSettleFrom(d.from);
                        setSettleTo(d.to);
                        setSettleAmount(d.amount.toString());
                        setSettleNotes(`Settlement from ${d.from} to ${d.to}`);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg text-[11px] font-semibold text-indigo-700 shadow-2xs transition-all cursor-pointer"
                    >
                      {d.from} → {d.to}: {formatCurrency(d.amount)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSettlementSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid By (Debtor)</label>
                  <select
                    value={settleFrom}
                    onChange={(e) => setSettleFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 cursor-pointer"
                  >
                    {activeGroup.members.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid To (Creditor)</label>
                  <select
                    value={settleTo}
                    onChange={(e) => setSettleTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 cursor-pointer"
                  >
                    {activeGroup.members.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Settlement Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  placeholder="e.g. 500"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Cash payment"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettleUpOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Record Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal 4: Delete Group Confirmation Modal */}
      {isDeleteGroupOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Group?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete <strong>{activeGroup.name}</strong>? All expenses, split allocations, and settlements in this group will be permanently removed.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteGroupOpen(false)}
                className="flex-1 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGroupConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Rename Member / Candidate Modal */}
      {isRenameMemberOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setRenameMemberOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Rename Member</h3>
            <p className="text-xs text-slate-400 mb-5">
              Update candidate name in <strong>{activeGroup.name}</strong>. All associated expenses and debt records will be updated automatically.
            </p>

            <form onSubmit={handleRenameSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Current Name</label>
                <input
                  type="text"
                  disabled
                  value={memberToRename}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Candidate Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Bobby, Aman S., Sneha Kapoor"
                  value={newMemberNameInput}
                  onChange={(e) => setNewMemberNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameMemberOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
