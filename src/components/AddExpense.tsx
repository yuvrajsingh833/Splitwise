import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Users, Percent, Calculator } from 'lucide-react';
import { Group } from '../App';

interface AddExpenseProps {
  group: Group;
  onExpenseAdded: () => void;
  onBack: () => void;
}

interface PercentageSplit {
  user_id: string;
  percentage: number;
}

export function AddExpense({ group, onExpenseAdded, onBack }: AddExpenseProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(group.users[0]?.id || '');
  const [splitType, setSplitType] = useState<'equal' | 'percentage'>('equal');
  const [percentageSplits, setPercentageSplits] = useState<PercentageSplit[]>(
    group.users.map(user => ({ user_id: user.id, percentage: 0 }))
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePercentages = () => {
    const total = percentageSplits.reduce((sum, split) => sum + split.percentage, 0);
    const hasZeroPercentages = percentageSplits.some(split => split.percentage <= 0);
    
    if (Math.abs(total - 100) > 0.01) {
      setErrors({ percentage: `Total percentage is ${total.toFixed(1)}%. Must equal 100%.` });
      return false;
    }
    
    if (hasZeroPercentages) {
      setErrors({ percentage: 'All percentages must be greater than 0.' });
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handlePercentageChange = (userId: string, percentage: number) => {
    setPercentageSplits(prev =>
      prev.map(split =>
        split.user_id === userId ? { ...split, percentage } : split
      )
    );
    setErrors({});
  };

  const distributeEqually = () => {
    const equalPercentage = 100 / group.users.length;
    setPercentageSplits(prev =>
      prev.map(split => ({ ...split, percentage: parseFloat(equalPercentage.toFixed(1)) }))
    );
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !amount || !paidBy) {
      setErrors({ form: 'Please fill in all required fields.' });
      return;
    }

    if (parseFloat(amount) <= 0) {
      setErrors({ form: 'Amount must be greater than 0.' });
      return;
    }

    if (splitType === 'percentage' && !validatePercentages()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const requestBody: any = {
        description: description.trim(),
        amount: parseFloat(amount),
        paid_by: paidBy,
        split_type: splitType,
      };

      if (splitType === 'percentage') {
        requestBody.splits = percentageSplits.filter(split => split.percentage > 0);
      }

      const response = await fetch(`http://localhost:3001/groups/${group.id}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        onExpenseAdded();
      } else {
        const errorData = await response.json();
        setErrors({ form: errorData.error || 'Failed to add expense.' });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      setErrors({ form: 'Failed to add expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const totalPercentage = percentageSplits.reduce((sum, split) => sum + split.percentage, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Expense</h2>
              <p className="text-sm text-slate-500">Split an expense in {group.name}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dinner at restaurant, Uber ride..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-slate-700 mb-2">
              Paid by *
            </label>
            <select
              id="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
            >
              {group.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Split Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`p-4 border-2 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                  splitType === 'equal'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Users className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Equal Split</div>
                  <div className="text-sm opacity-75">Split evenly among all members</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSplitType('percentage')}
                className={`p-4 border-2 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                  splitType === 'percentage'
                    ? 'border-purple-200 bg-purple-50 text-purple-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Percent className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Percentage Split</div>
                  <div className="text-sm opacity-75">Custom percentages for each member</div>
                </div>
              </button>
            </div>
          </div>

          {splitType === 'percentage' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">
                  Percentage Distribution
                </label>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    Math.abs(totalPercentage - 100) < 0.01 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {totalPercentage.toFixed(1)}% / 100%
                  </span>
                  <button
                    type="button"
                    onClick={distributeEqually}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors flex items-center space-x-1"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Equal</span>
                  </button>
                </div>
              </div>
              
              {errors.percentage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-red-600">{errors.percentage}</p>
                </div>
              )}
              
              <div className="space-y-3 border border-slate-200 rounded-lg p-4">
                {group.users.map((user) => {
                  const split = percentageSplits.find(s => s.user_id === user.id);
                  return (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900">{user.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={split?.percentage || 0}
                          onChange={(e) => handlePercentageChange(user.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <span className="text-sm text-slate-500">%</span>
                        {amount && split && (
                          <span className="text-sm font-medium text-slate-600 min-w-[60px] text-right">
                            ${((parseFloat(amount) * split.percentage) / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (splitType === 'percentage' && Math.abs(totalPercentage - 100) > 0.01)}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              <span>{loading ? 'Adding...' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}