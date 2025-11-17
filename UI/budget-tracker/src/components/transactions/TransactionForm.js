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
  const [transactionDate, setTransactionDate] = useState(
    editTransaction?.transaction_date 
      ? new Date(editTransaction.transaction_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async (filterType = null) => {
    try {
      const data = await fetchCategories(filterType);
      const categoriesList = Array.isArray(data) ? data : [];
      setCategories(categoriesList);
      if (category && !categoriesList.find(c => c.id.toString() === category.toString())) {
        setCategory('');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (editTransaction) {
      const editType = editTransaction.type || '';
      const editCategory = editTransaction.category || '';
      const editNote = editTransaction.note || '';
      const editAmount = editTransaction.amount || '';
      const editDate = editTransaction.transaction_date 
        ? new Date(editTransaction.transaction_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setType(editType);
      setCategory(editCategory);
      setNote(editNote);
      setAmount(editAmount);
      setTransactionDate(editDate);
      loadCategories(editType || null);
    } else {
      setType('');
      setCategory('');
      setNote('');
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      loadCategories(null);
    }
  }, [editTransaction]);

  useEffect(() => {
    if (type) {
      loadCategories(type);
      if (!editTransaction || editTransaction.type !== type) {
        setCategory('');
      }
    } else {
      loadCategories(null);
      setCategory('');
    }
  }, [type]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (!type) {
      setError('Please select transaction type first before adding a category');
      return;
    }
    try {
      const createdCategory = await createCategory({ name: newCategory, type: type });

      const categoryId = createdCategory.data?.id || createdCategory.id;
      const newCategoryObj = {
        id: categoryId,
        name: newCategory,
        type: type
      };
      
    
      setCategories(prevCategories => {
        const exists = prevCategories.find(c => c.id === categoryId || c.name === newCategory);
        if (exists) return prevCategories;
        return [...prevCategories, newCategoryObj];
      });

      setCategory(categoryId);

      setNewCategory('');
      setCreatingCategory(false);
      
      setError('');
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !category || !note || !amount || !transactionDate) {
      setError('All fields are required');
      return;
    }
    const data = { type, category, note, amount, transaction_date: transactionDate };
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

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
              required
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
