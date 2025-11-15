import { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import TransactionList from './components/transactions/TransactionList';
import CategoryList from './components/categories/CategoryList';
import Budget from './components/budget/Budget';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import './App.css'; 

// Protected Route
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  return children;
}

// Navbar + Links
function Navbar() {
  const { logout, user } = useContext(AuthContext);
  const history = useNavigate();


  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Categories', path: '/categories' },
    { label: 'Budget', path: '/budget' },
  ];

  const handleLogout = () => {
    logout();          
    history('/login'); 
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
            <AttachMoneyIcon />

          <h2>Personal Budget Tracker</h2> 
        </div>
        <div className="nav-links">
          {navItems.map(item => (
            <a key={item.label} href={item.path} className="nav-link">
              {item.label}
            </a>
          ))}
        </div>
        {user && (
          <div className="nav-user">
            <span className="username">{user.username}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

// Main Layout
function Layout() {
  const location = useLocation();
  const hideLayout = location.pathname === '/login';

  return (
    <div className="layout">
      {!hideLayout && <Navbar />}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/transactions"
            element={<TransactionList />}
          />
          <Route
            path="/categories"
            element={<CategoryList />}
          />
          <Route
            path="/logout"
            element={<Login />}
          />
          <Route
            path="/budget"
            element={<Budget />}
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

// Root App
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}
