import React, { useState, useEffect } from 'react';
import { createCategory, updateCategory } from '../../api/api';
import './CategoryForm.css';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

const CategoryForm = ({ existingCategory, onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingCategory) setName(existingCategory.name);
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
        await updateCategory(existingCategory.id, { name });
      } else {
        await createCategory({ name });
      }
      onSuccess();
      setName('');
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
