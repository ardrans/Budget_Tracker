import { useEffect, useState } from 'react';
import { fetchTransactions, deleteTransaction } from '../../api/api';
import TransactionForm from './TransactionForm';
import './TransactionList.css';


export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ type: '', category: '', search: '' });
  const [openForm, setOpenForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);

  const loadTransactions = async () => {
    try {
      const params = { page, page_size: limit, ...filter };
      const data = await fetchTransactions(params);
      setTransactions(data.results);
      setTotalPages(Math.ceil(data.count / limit));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadTransactions(); }, [page, filter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await deleteTransaction(id);
      loadTransactions();
    }
  };

  return (
    <div className="transactions">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <p>Manage your income and expenses</p>
        <button className="btn-primary" onClick={() => { setOpenForm(true); setEditTransaction(null); }}>
          Add Transaction
        </button>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Type</label>
            <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}>
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              value={filter.search}
              onChange={e => setFilter({ ...filter, search: e.target.value })}
              placeholder="Search notes..."
            />
          </div>
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Category</th>
              <th>Note</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <span className={`type-badge ${tx.type}`}>{tx.type}</span>
                  </td>
                  <td>{tx.category || <span className="no-category">No Category</span>}</td>
                  <td>{tx.note}</td>
                  <td className={tx.type === 'income' ? 'amount-income' : 'amount-expense'}>
                    {tx.amount}
                  </td>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button className="btn-edit" onClick={() => { setOpenForm(true); setEditTransaction(tx); }}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(tx.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="page-btn"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        <span className="page-info">{page} of {totalPages}</span>
        <button
          className="page-btn"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {openForm && (
        <TransactionForm
          open={openForm}
          onClose={() => { setOpenForm(false); loadTransactions(); }}
          editTransaction={editTransaction}
        />
      )}
    </div>
  );
}
