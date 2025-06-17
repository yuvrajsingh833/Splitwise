import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Plus, Receipt } from 'lucide-react';
import { Group } from '../App';

interface GroupListProps {
  onGroupSelect: (group: Group) => void;
  onAddExpense: (group: Group) => void;
}

export function GroupList({ onGroupSelect, onAddExpense }: GroupListProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/groups');
      const groupsData = await response.json();
      
      // Fetch detailed info for each group
      const detailedGroups = await Promise.all(
        groupsData.map(async (group: any) => {
          const detailResponse = await fetch(`http://localhost:3001/groups/${group.id}`);
          return detailResponse.json();
        })
      );
      
      setGroups(detailedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mx-auto mb-6">
          <Users className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No groups yet</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Create your first group to start tracking shared expenses with friends and family.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Your Groups</h2>
        <span className="text-sm text-slate-500">{groups.length} group{groups.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-slate-300 group cursor-pointer"
            onClick={() => onGroupSelect(group)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {group.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">
                    {group.users.length} member{group.users.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Expenses</span>
                <div className="flex items-center space-x-1 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold">${group.total_expenses.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Recent Activity</span>
                <span className="text-sm text-slate-500">
                  {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {group.users.slice(0, 3).map((user, index) => (
                      <div
                        key={user.id}
                        className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                      >
                        {user.name.charAt(0)}
                      </div>
                    ))}
                    {group.users.length > 3 && (
                      <div className="w-6 h-6 bg-slate-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                        +{group.users.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {group.users.slice(0, 2).map(u => u.name.split(' ')[0]).join(', ')}
                    {group.users.length > 2 && ` +${group.users.length - 2} more`}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddExpense(group);
                }}
                className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-emerald-200 hover:border-emerald-300"
              >
                <Receipt className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}