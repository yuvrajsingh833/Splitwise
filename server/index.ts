import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './database.js';

const app = express();
const port = 3001;
const db = new Database();

app.use(cors());
app.use(express.json());

// Initialize database
await db.init();

// Types
interface User {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  created_at: string;
}

interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'percentage';
  created_at: string;
}

interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  percentage?: number;
}

// Group Management Routes
app.post('/groups', async (req, res) => {
  try {
    const { name, user_ids } = req.body;
    
    if (!name || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'Name and user_ids are required' });
    }

    const group_id = uuidv4();
    
    // Create group
    await db.run(
      'INSERT INTO groups (id, name, created_at) VALUES (?, ?, ?)',
      [group_id, name, new Date().toISOString()]
    );

    // Add users to group
    for (const user_id of user_ids) {
      await db.run(
        'INSERT INTO group_users (group_id, user_id) VALUES (?, ?)',
        [group_id, user_id]
      );
    }

    res.json({ id: group_id, name, user_ids });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

app.get('/groups/:group_id', async (req, res) => {
  try {
    const { group_id } = req.params;
    
    const group = await db.get(
      'SELECT * FROM groups WHERE id = ?',
      [group_id]
    );
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const users = await db.all(`
      SELECT u.* FROM users u
      JOIN group_users gu ON u.id = gu.user_id
      WHERE gu.group_id = ?
    `, [group_id]);

    const expenses = await db.all(
      'SELECT * FROM expenses WHERE group_id = ?',
      [group_id]
    );

    const total_expenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      ...group,
      users,
      expenses,
      total_expenses
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

app.get('/groups', async (req, res) => {
  try {
    const groups = await db.all('SELECT * FROM groups ORDER BY created_at DESC');
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Expense Management Routes
app.post('/groups/:group_id/expenses', async (req, res) => {
  try {
    const { group_id } = req.params;
    const { description, amount, paid_by, split_type, splits } = req.body;

    if (!description || !amount || !paid_by || !split_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense_id = uuidv4();
    
    // Create expense
    await db.run(`
      INSERT INTO expenses (id, group_id, description, amount, paid_by, split_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [expense_id, group_id, description, amount, paid_by, split_type, new Date().toISOString()]);

    // Handle splits
    if (split_type === 'equal') {
      const group_users = await db.all(`
        SELECT user_id FROM group_users WHERE group_id = ?
      `, [group_id]);
      
      const split_amount = amount / group_users.length;
      
      for (const user of group_users) {
        await db.run(`
          INSERT INTO expense_splits (id, expense_id, user_id, amount)
          VALUES (?, ?, ?, ?)
        `, [uuidv4(), expense_id, user.user_id, split_amount]);
      }
    } else if (split_type === 'percentage' && splits) {
      for (const split of splits) {
        const split_amount = (amount * split.percentage) / 100;
        await db.run(`
          INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage)
          VALUES (?, ?, ?, ?, ?)
        `, [uuidv4(), expense_id, split.user_id, split_amount, split.percentage]);
      }
    }

    res.json({ id: expense_id, description, amount, paid_by, split_type });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Balance Tracking Routes
app.get('/groups/:group_id/balances', async (req, res) => {
  try {
    const { group_id } = req.params;
    
    const expenses = await db.all(`
      SELECT e.*, es.user_id, es.amount as split_amount, u.name as user_name, p.name as paid_by_name
      FROM expenses e
      JOIN expense_splits es ON e.id = es.expense_id
      JOIN users u ON es.user_id = u.id
      JOIN users p ON e.paid_by = p.id
      WHERE e.group_id = ?
    `, [group_id]);

    const balances: { [key: string]: { [key: string]: number } } = {};
    
    // Calculate who owes whom
    for (const expense of expenses) {
      const payer = expense.paid_by;
      const debtor = expense.user_id;
      const amount = expense.split_amount;
      
      if (payer !== debtor) {
        if (!balances[debtor]) balances[debtor] = {};
        if (!balances[debtor][payer]) balances[debtor][payer] = 0;
        balances[debtor][payer] += amount;
      }
    }

    // Simplify balances (net out mutual debts)
    const simplified: Array<{ from: string; to: string; amount: number; from_name: string; to_name: string }> = [];
    const users = await db.all(`
      SELECT u.* FROM users u
      JOIN group_users gu ON u.id = gu.user_id
      WHERE gu.group_id = ?
    `, [group_id]);
    
    const userMap = users.reduce((acc: any, user: any) => {
      acc[user.id] = user.name;
      return acc;
    }, {});

    for (const debtor in balances) {
      for (const creditor in balances[debtor]) {
        const debtAmount = balances[debtor][creditor];
        const reverseDebt = balances[creditor]?.[debtor] || 0;
        
        const netDebt = debtAmount - reverseDebt;
        
        if (netDebt > 0) {
          simplified.push({
            from: debtor,
            to: creditor,
            amount: netDebt,
            from_name: userMap[debtor],
            to_name: userMap[creditor]
          });
        }
        
        // Clear the reverse debt to avoid double counting
        if (balances[creditor]?.[debtor]) {
          balances[creditor][debtor] = 0;
        }
      }
    }

    res.json(simplified.filter(debt => debt.amount > 0.01));
  } catch (error) {
    console.error('Error calculating balances:', error);
    res.status(500).json({ error: 'Failed to calculate balances' });
  }
});

app.get('/users/:user_id/balances', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const userGroups = await db.all(`
      SELECT g.id, g.name FROM groups g
      JOIN group_users gu ON g.id = gu.group_id
      WHERE gu.user_id = ?
    `, [user_id]);

    const allBalances = [];
    
    for (const group of userGroups) {
      const groupBalancesResponse = await fetch(`http://localhost:${port}/groups/${group.id}/balances`);
      const groupBalances = await groupBalancesResponse.json();
      
      const userBalances = groupBalances.filter((balance: any) => 
        balance.from === user_id || balance.to === user_id
      );
      
      allBalances.push({
        group_id: group.id,
        group_name: group.name,
        balances: userBalances
      });
    }

    res.json(allBalances);
  } catch (error) {
    console.error('Error fetching user balances:', error);
    res.status(500).json({ error: 'Failed to fetch user balances' });
  }
});

// User Management Routes
app.get('/users', async (req, res) => {
  try {
    const users = await db.all('SELECT * FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user_id = uuidv4();
    
    await db.run(
      'INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)',
      [user_id, name, new Date().toISOString()]
    );

    res.json({ id: user_id, name });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Splitwise API server running on http://localhost:${port}`);
});