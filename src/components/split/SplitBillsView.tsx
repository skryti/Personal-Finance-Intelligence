import React, { useState } from 'react';
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

  // 2. Add Group Expense Form
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('You');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customAllocations, setCustomAllocations] = useState<Record<string, string>>({});

  // 3. Settlement Form
  const [settleFrom, setSettleFrom] = useState('Rahul');
  const [settleTo, setSettleTo] = useState('You');
  const [settleAmount, setSettleAmount] = useState('200');
  const [settleNotes, setSettleNotes] = useState('UPI transfer');

  const activeGroupBalances =
    activeGroup && splitSummary.groupBalances[activeGroup.id]
      ? splitSummary.groupBalances[activeGroup.id]
      : [];

  const activeGroupExpenses = activeGroup
    ? splitExpenses.filter((e) => e.groupId === activeGroup.id)
    : [];

  const activeGroupSettlements = activeGroup
    ? settlements.filter((s) => s.groupId === activeGroup.id)
    : [];

  // Group creation handler
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const parsedMembers = newGroupMembersText
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0 && m.toLowerCase() !== 'you');

    createSplitGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || undefined,
      members: parsedMembers,
    });

    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupMembersText('');
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
      fromMember: settleFrom,
      toMember: settleTo,
      amount: parseFloat(settleAmount),
      date: new Date().toISOString().split('T')[0],
      notes: settleNotes.trim() || undefined,
    });

    setSettleAmount('');
    setSettleNotes('');
    setSettleUpOpen(false);
  };

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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Group Expense</span>
          </button>

          <button
            onClick={() => setSettleUpOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settle Up</span>
          </button>

          <button
            onClick={() => setCreateGroupOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* 3. Main Ledger Table & Member Balances */}
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
                    className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs"
                    style={{
                      backgroundColor: ['#EEF2FF', '#FEF3C7', '#DCFCE7', '#FCE7F3'][idx % 4],
                      color: ['#4F46E5', '#D97706', '#16A34A', '#DB2777'][idx % 4],
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
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {mb.member[0]}
                          </div>
                          <span>
                            {mb.member} {mb.member === 'You' && '(Me)'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-medium text-slate-700">
                          {formatCurrency(mb.paid)}
                        </td>
                        <td className="py-3.5 text-right font-medium text-slate-700">
                          {formatCurrency(mb.share)}
                        </td>
                        <td
                          className={`py-3.5 text-right font-bold whitespace-nowrap ${
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
                        <td className="py-3.5 text-right">
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
                  No activity in this group yet.
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
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs"
                    >
                      <Receipt className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          <strong>{exp.paidBy}</strong> paid{' '}
                          <strong className="text-slate-900">{formatCurrency(exp.amount)}</strong>{' '}
                          for "{exp.description}"
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(exp.date)} • {exp.splitType} split across {exp.allocations.length} members
                        </p>
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
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Split Group</h3>
            <p className="text-xs text-slate-400 mb-5">
              Add a shared expense ledger for flatmates, trips, or projects
            </p>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Goa Trip"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
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
                  Members (Comma-separated names)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul, Priya, Aman ('You' is added automatically)"
                  value={newGroupMembersText}
                  onChange={(e) => setNewGroupMembersText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateGroupOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Group Expense Modal (Equal vs Custom Split) */}
      {isAddSplitExpenseOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setAddSplitExpenseOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
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
                  placeholder="e.g. Dinner & drinks, Airbnb reservation"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
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
                    className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                      splitType === 'equal'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Equal Split (₹{expAmount ? (Number(expAmount) / activeGroup.members.length).toFixed(0) : 0}/person)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType('custom')}
                    className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
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
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs"
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
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Record Settlement</h3>
            <p className="text-xs text-slate-400 mb-5">
              Clear outstanding debt in <strong>{activeGroup.name}</strong>
            </p>

            <form onSubmit={handleSettlementSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid By (Debtor)</label>
                  <select
                    value={settleFrom}
                    onChange={(e) => setSettleFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
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
                  placeholder="e.g. 200"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Google Pay payment"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettleUpOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Record Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
