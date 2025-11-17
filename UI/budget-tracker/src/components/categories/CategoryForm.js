import React, { useState, useEffect } from 'react';
import { createCategory, updateCategory } from '../../api/api';
import './CategoryForm.css';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

const CategoryForm = ({ existingCategory, onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name);
      setType(existingCategory.type || 'expense');
    }
  }, [existingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (existingCategory) {
        await updateCategory(existingCategory.id, { name, type });
      } else {
        await createCategory({ name, type });
      }
      onSuccess();
      setName('');
      setType('expense');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" className="category-form" onSubmit={handleSubmit}>
      <Typography variant="h6">
        {existingCategory ? 'Edit Category' : 'Add Category'}
      </Typography>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <TextField
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
      </div>

      <div className="form-group">
        <label>Type</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="form-actions">
        <Button type="submit" className="btn-submit" disabled={loading}>
          {existingCategory ? 'Update' : 'Add'}
        </Button>
        {onCancel && (
          <Button className="btn-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </Box>
  );
};

export default CategoryForm;
