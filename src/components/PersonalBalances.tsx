import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, User, DollarSign, Users } from 'lucide-react';
import { User as UserType } from '../App';

interface PersonalBalance {
  group_id: string;
  group_name: string;
  balances: Array<{
    from: string;
    to: string;
    amount: number;
    from_name: string;
    to_name: string;
  }>;
}

interface PersonalBalancesProps {
  userId: string;
  users: UserType[];
  onUserChange: (userId: string) => void;
  onBack: () => void;
}

export function PersonalBalances({ userId, users, onUserChange, onBack }: PersonalBalancesProps) {
  const [balances, setBalances] = useState<PersonalBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersonalBalances();
  }, [userId]);

  const fetchPersonalBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/users/${userId}/balances`);
      const data = await response.json();
      setBalances(data);
    } catch (error) {
      console.error('Error fetching personal balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(user => user.id === userId);
  
  const oweAmount = balances.reduce((total, group) => {
    return total + group.balances
      .filter(balance => balance.from === userId)
      .reduce((sum, balance) => sum + balance.amount, 0);
  }, 0);

  const owedAmount = balances.reduce((total, group) => {
    return total + group.balances
      .filter(balance => balance.to === userId)
      .reduce((sum, balance) => sum + balance.amount, 0);
  }, 0);

  const netBalance = owedAmount - oweAmount;

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
                <h1 className="text-2xl font-bold text-slate-900">Personal Balances</h1>
                <p className="text-sm text-slate-500">Your financial overview across all groups</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <label htmlFor="userSelect" className="text-sm font-medium text-slate-700">
                View for:
              </label>
              <select
                id="userSelect"
                value={userId}
                onChange={(e) => onUserChange(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* User Summary */}
        {selectedUser && (
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedUser.name}</h2>
                <p className="text-slate-500">Financial Summary</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700">You Owe</span>
                </div>
                <div className="text-2xl font-bold text-red-600">${oweAmount.toFixed(2)}</div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">You're Owed</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">${owedAmount.toFixed(2)}</div>
              </div>

              <div className={`rounded-xl p-4 border ${
                netBalance > 0 
                  ? 'bg-emerald-50 border-emerald-100' 
                  : netBalance < 0 
                    ? 'bg-red-50 border-red-100' 
                    : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className={`w-5 h-5 ${
                    netBalance > 0 
                      ? 'text-emerald-500' 
                      : netBalance < 0 
                        ? 'text-red-500' 
                        : 'text-slate-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    netBalance > 0 
                      ? 'text-emerald-700' 
                      : netBalance < 0 
                        ? 'text-red-700' 
                        : 'text-slate-700'
                  }`}>
                    Net Balance
                  </span>
                </div>
                <div className={`text-2xl font-bold ${
                  netBalance > 0 
                    ? 'text-emerald-600' 
                    : netBalance < 0 
                      ? 'text-red-600' 
                      : 'text-slate-600'
                }`}>
                  ${Math.abs(netBalance).toFixed(2)}
                </div>
                {netBalance !== 0 && (
                  <div className={`text-xs mt-1 ${
                    netBalance > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {netBalance > 0 ? 'Overall, you are owed money' : 'Overall, you owe money'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Group Balances */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Balances by Group</h2>
          <p className="text-sm text-slate-500">Detailed breakdown across all your groups</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : balances.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No groups found</h3>
              <p className="text-slate-500">Join or create groups to start tracking shared expenses</p>
            </div>
          ) : (
            <div className="space-y-6">
              {balances.map((groupBalance) => (
                <div key={groupBalance.group_id} className="border border-slate-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{groupBalance.group_name}</h3>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {groupBalance.balances.length} balance{groupBalance.balances.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {groupBalance.balances.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">All settled up in this group! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {groupBalance.balances.map((balance, index) => {
                        const isUserInvolved = balance.from === userId || balance.to === userId;
                        const isUserOwing = balance.from === userId;
                        const isUserOwed = balance.to === userId;
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                              isUserInvolved
                                ? isUserOwing
                                  ? 'border-red-200 bg-red-50'
                                  : 'border-emerald-200 bg-emerald-50'
                                : 'border-slate-100 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                                isUserOwing ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-slate-400 to-slate-600'
                              }`}>
                                {balance.from_name.charAt(0)}
                              </div>
                              <span className="text-sm text-slate-600">owes</span>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                                isUserOwed ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-slate-400 to-slate-600'
                              }`}>
                                {balance.to_name.charAt(0)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${
                                isUserInvolved
                                  ? isUserOwing
                                    ? 'text-red-600'
                                    : 'text-emerald-600'
                                  : 'text-slate-600'
                              }`}>
                                ${balance.amount.toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {balance.from_name} → {balance.to_name}
                              </div>
                              {isUserInvolved && (
                                <div className={`text-xs font-medium mt-1 ${
                                  isUserOwing ? 'text-red-600' : 'text-emerald-600'
                                }`}>
                                  {isUserOwing ? 'You owe this' : 'You are owed this'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}