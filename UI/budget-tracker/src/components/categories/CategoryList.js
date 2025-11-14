import React, { useEffect, useState } from 'react';
import { fetchCategories, deleteCategory } from '../../api/api';
import CategoryForm from './CategoryForm';
import './CategoryList.css';
import { Typography, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import './CategoryList.css'

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      console.error(err);
      setError('Failed to delete category.');
    }
  };

  return (
    <div className="category-list">
      <div className="category-header">
        <Typography variant="h4">Categories</Typography>
      </div>

      {error && <Alert severity="error" className="error-message">{error}</Alert>}

      <CategoryForm
        existingCategory={editingCategory}
        onSuccess={() => { setEditingCategory(null); loadCategories(); }}
        onCancel={() => setEditingCategory(null)}
      />

      {categories.length === 0 && !loading && (
        <div className="no-data">No categories found.</div>
      )}

      {categories.length > 0 && (
        <TableContainer component={Paper} className="category-table-container">
          <Table className="category-table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.is_custom ? 'Custom' : 'Default'}</TableCell>
                  <TableCell>
                    {cat.is_custom && (
                      <>
                        <Button className="btn-edit" size="small" onClick={() => setEditingCategory(cat)}>Edit</Button>
                        <Button className="btn-delete" size="small" onClick={() => handleDelete(cat.id)}>Delete</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default CategoryList;
