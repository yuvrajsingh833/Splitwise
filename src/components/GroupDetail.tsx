import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, DollarSign, Plus, Receipt, Calendar, User } from 'lucide-react';
import { Group, Balance } from '../App';

interface GroupDetailProps {
  group: Group;
  onAddExpense: () => void;
  onBack: () => void;
}

export function GroupDetail({ group, onAddExpense, onBack }: GroupDetailProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, [group.id]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/groups/${group.id}/balances`);
      const data = await response.json();
      setBalances(data);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (userId: string) => {
    return group.users.find(user => user.id === userId)?.name || 'Unknown';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{group.users.length} members</span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">${group.total_expenses.toFixed(2)} total</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onAddExpense}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Group Members */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Members</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {group.users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-900 truncate">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Balances */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Group Balances</h2>
            <p className="text-sm text-slate-500">Who owes whom</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : balances.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">All settled up! 🎉</p>
                <p className="text-sm text-slate-400 mt-1">No outstanding balances in this group</p>
              </div>
            ) : (
              <div className="space-y-3">
                {balances.map((balance, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        {balance.from_name.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-600">owes</span>
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        {balance.to_name.charAt(0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">${balance.amount.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">{balance.from_name} → {balance.to_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Expenses</h2>
            <p className="text-sm text-slate-500">{group.expenses.length} total expenses</p>
          </div>
          <div className="p-6">
            {group.expenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">No expenses yet</p>
                <p className="text-sm text-slate-400 mt-1">Add your first expense to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {group.expenses
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Receipt className="w-4 h-4 text-slate-400" />
                          <h4 className="font-medium text-slate-900 truncate">{expense.description}</h4>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>Paid by {getUserName(expense.paid_by)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(expense.created_at)}</span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            expense.split_type === 'equal' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {expense.split_type === 'equal' ? 'Equal Split' : 'Percentage Split'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold text-slate-900">${expense.amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}