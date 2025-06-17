import React, { useState, useEffect } from 'react';
import { Users, Plus, DollarSign, TrendingUp, ArrowRight, UserPlus, Receipt } from 'lucide-react';
import { GroupList } from './components/GroupList';
import { CreateGroup } from './components/CreateGroup';
import { GroupDetail } from './components/GroupDetail';
import { AddExpense } from './components/AddExpense';
import { PersonalBalances } from './components/PersonalBalances';
import { UserManagement } from './components/UserManagement';

export type User = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  users: User[];
  expenses: Expense[];
  total_expenses: number;
  created_at: string;
};

export type Expense = {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'percentage';
  created_at: string;
};

export type Balance = {
  from: string;
  to: string;
  amount: number;
  from_name: string;
  to_name: string;
};

function App() {
  const [currentView, setCurrentView] = useState<'groups' | 'create-group' | 'group-detail' | 'add-expense' | 'personal-balances' | 'users'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('user-1'); // Default user for personal balances
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setCurrentView('group-detail');
  };

  const handleAddExpense = (group: Group) => {
    setSelectedGroup(group);
    setCurrentView('add-expense');
  };

  const handleExpenseAdded = () => {
    setCurrentView('group-detail');
    // Refresh group data
    if (selectedGroup) {
      fetch(`http://localhost:3001/groups/${selectedGroup.id}`)
        .then(res => res.json())
        .then(data => setSelectedGroup(data))
        .catch(console.error);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'groups':
        return <GroupList onGroupSelect={handleGroupSelect} onAddExpense={handleAddExpense} />;
      case 'create-group':
        return <CreateGroup onGroupCreated={() => setCurrentView('groups')} users={users} />;
      case 'group-detail':
        return selectedGroup ? (
          <GroupDetail 
            group={selectedGroup} 
            onAddExpense={() => handleAddExpense(selectedGroup)}
            onBack={() => setCurrentView('groups')}
          />
        ) : null;
      case 'add-expense':
        return selectedGroup ? (
          <AddExpense 
            group={selectedGroup}
            onExpenseAdded={handleExpenseAdded}
            onBack={() => setCurrentView('group-detail')}
          />
        ) : null;
      case 'personal-balances':
        return (
          <PersonalBalances 
            userId={selectedUserId}
            users={users}
            onUserChange={setSelectedUserId}
            onBack={() => setCurrentView('groups')}
          />
        );
      case 'users':
        return <UserManagement users={users} onUsersChange={fetchUsers} onBack={() => setCurrentView('groups')} />;
      default:
        return <GroupList onGroupSelect={handleGroupSelect} onAddExpense={handleAddExpense} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Splitwise</h1>
                <p className="text-sm text-slate-500">Track shared expenses</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView('groups')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  currentView === 'groups' || currentView === 'group-detail' || currentView === 'add-expense'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Groups</span>
              </button>
              
              <button
                onClick={() => setCurrentView('personal-balances')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  currentView === 'personal-balances'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Balances</span>
              </button>

              <button
                onClick={() => setCurrentView('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  currentView === 'users'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Users</span>
              </button>
              
              {currentView === 'groups' && (
                <button
                  onClick={() => setCurrentView('create-group')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Group</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;