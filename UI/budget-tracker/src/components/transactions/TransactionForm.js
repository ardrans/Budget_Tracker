import { useState, useEffect } from 'react';
import {
  createTransaction,
  updateTransaction,
  fetchCategories,
  createCategory,
} from '../../api/api';
import './TransactionForm.css';


export default function TransactionForm({ open, onClose, editTransaction }) {
  const [type, setType] = useState(editTransaction?.type || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [note, setNote] = useState(editTransaction?.note || '');
  const [amount, setAmount] = useState(editTransaction?.amount || '');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
  if (!newCategory.trim()) return;
  try {
    // Create new category
    await createCategory({ name: newCategory });

    // Reload categories from API
    const allCategories = await fetchCategories();
    setCategories(allCategories);

    // Automatically select the newly added category
    const added = allCategories.find(c => c.name === newCategory);
    if (added) setCategory(added.id);

    // Reset new category input
    setNewCategory('');
    setCreatingCategory(false);
  } catch (err) {
    console.error('Error creating category:', err);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !category || !note || !amount) {
      setError('All fields are required');
      return;
    }
    const data = { type, category, note, amount };
    try {
      if (editTransaction) await updateTransaction(editTransaction.id, data);
      else await createTransaction(data);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save transaction');
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form className="transaction-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="">Select type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {!creatingCategory ? (
            <button
              type="button"
              className="btn-link"
              onClick={() => setCreatingCategory(true)}
            >
              + Add New Category
            </button>
          ) : (
            <div className="new-category-input">
              <input
                type="text"
                value={newCategory}
                placeholder="New Category"
                onChange={e => setNewCategory(e.target.value)}
              />
              <button type="button" className="btn-small" onClick={handleAddCategory}>
                Save
              </button>
              <button
                type="button"
                className="btn-small"
                style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                onClick={() => { setCreatingCategory(false); setNewCategory(''); }}
              >
                Cancel
              </button>
            </div>
          )}

          <div className="form-group">
            <label>Note</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Enter note"
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {editTransaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
