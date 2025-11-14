import { createContext, useState, useEffect } from 'react';
import { loginUser } from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) setUser({ token }); // minimal, can fetch user info if needed
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
