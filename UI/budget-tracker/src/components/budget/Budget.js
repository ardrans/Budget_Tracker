import { useEffect, useState } from 'react';
import { fetchBudgetSummary, updateBudget } from '../../api/api';
import { Typography, TextField, Button, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import './Budget.css'

export default function Budget() {
  const [budget, setBudget] = useState(0);
  const [expense, setExpense] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [remaining, setRemaining] = useState(0);
  const [inputBudget, setInputBudget] = useState('');
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042','#AA336A'];

  const loadBudget = async () => {
    const data = await fetchBudgetSummary(selectedYear, selectedMonth);
    setBudget(data.budget);
    setInputBudget(data.budget);
    setExpense(data.total_expense);
    setCategoryData(data.category_summary.map(c => ({ name: c.category, value: c.total })));
    setRemaining(data.remaining_budget);
  };

  useEffect(() => { loadBudget(); }, [selectedYear, selectedMonth]);

  const handleUpdate = async () => {
    await updateBudget({ amount: inputBudget, year: selectedYear, month: selectedMonth });
    loadBudget();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i);
  }

  return (
    <div className="budget-management">
      {/* Header */}
      <div className="budget-header">
        <div>
          <h1>Budget Summary</h1>
          <p>Overview of your monthly budget, expenses, and remaining funds.</p>
        </div>
        <div className="date-filter">
          <div className="filter-group">
            <label htmlFor="budget-month-select">Month:</label>
            <select 
              id="budget-month-select"
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="month-year-select"
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="budget-year-select">Year:</label>
            <select 
              id="budget-year-select"
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="month-year-select"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="budget-overview">
        <div className={`overview-card ${remaining < 0 ? 'over-budget-card' : 'under-budget-card'}`}>
          <h3>Total Budget</h3>
          <p className="overview-value">{budget}</p>
        </div>
        <div className={`overview-card ${expense > budget ? 'over-budget-card' : 'under-budget-card'}`}>
          <h3>Total Expense</h3>
          <p className="overview-value over-budget">{expense}</p>
        </div>
        <div className="overview-card">
          <h3>Remaining</h3>
          <p className={`overview-value ${remaining < 0 ? 'over-budget' : ''}`}>{remaining}</p>
          {remaining < 0 && <p className="over-budget-warning">You are over budget!</p>}
        </div>
      </div>

      {/* Budget Update Section */}
      <div className="budget-progress-section">
        <div className="progress-header">
          <h3>Update Budget</h3>
          <p className="progress-percentage">{Math.max(0, ((expense / budget) * 100).toFixed(0))}% used</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <TextField 
            type="number" 
            label="Update Budget" 
            value={inputBudget} 
            onChange={e => setInputBudget(e.target.value)} 
            fullWidth 
          />
          <Button variant="contained" onClick={handleUpdate}>Update</Button>
        </div>
        <div className="progress-bar-container">
          <div 
            className={`progress-bar ${expense > budget ? 'over' : ''}`} 
            style={{ width: `${Math.min(100, (expense / budget) * 100)}%` }}
          />
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="budget-chart-section">
        <h3>Expenses by Category</h3>
        <PieChart width={400} height={300}>
          <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
            {categoryData.map((entry,index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Optional: Budget List Section (if you want to list individual items) */}
      {/* <div className="budget-list-section">
        <h3>Budget Items</h3>
        <div className="budget-list">
          {categoryData.map((item, index) => (
            <div className="budget-item" key={index}>
              <div className="budget-item-info">
                <h4>{item.name}</h4>
              </div>
              <p className="budget-amount">{item.value}</p>
              <div className="budget-item-actions">
                <button className="btn-edit">Edit</button>
                <button className="btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
