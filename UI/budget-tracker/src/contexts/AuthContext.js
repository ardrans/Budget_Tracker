import { createContext, useState, useEffect } from 'react';
import { loginUser } from '../api/api';

export const AuthContext = createContext();

const getStoredUser = () => {
  const storedUser = localStorage.getItem('authUser');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  const token = localStorage.getItem('token');
  return token ? { token } : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [user]);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    const authUser = { ...data.user, token: data.token };
    setUser(authUser);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
    localStorage.removeItem('currency');
    localStorage.removeItem('name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
