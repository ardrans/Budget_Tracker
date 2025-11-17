import { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Link,
} from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import TransactionList from './components/transactions/TransactionList';
import CategoryList from './components/categories/CategoryList';
import Budget from './components/budget/Budget';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import './App.css'; 

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  return children;
}

// Navbar + Links
function Navbar() {
  const { logout, user } = useContext(AuthContext);
  const name = user?.name || localStorage.getItem('name') || 'User';
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Categories', path: '/categories' },
    { label: 'Budget', path: '/budget' },
  ];

  const handleLogout = () => {
    logout();          
    navigate('/login'); 
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
            <Link key={item.label} to={item.path} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>
        {user && (
          <div className="nav-user">
            <span className="username">Hi, {name}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

function Layout() {
  const location = useLocation();
  const hideLayout = location.pathname === '/login';

  return (
   <Routes>

    <Route path="/login" element={<Login />} />

    <Route
      path="*"
      element={
        <div className="layout">
          {!hideLayout && <Navbar />}

          <div className="main-content">
            <Routes>
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/transactions"
                element={<ProtectedRoute><TransactionList /></ProtectedRoute>}
              />
              <Route
                path="/categories"
                element={<ProtectedRoute><CategoryList /></ProtectedRoute>}
              />
              <Route
                path="/budget"
                element={<ProtectedRoute><Budget /></ProtectedRoute>}
              />
              <Route
                path="/"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />

              {/* Default fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      }
    />

  </Routes>
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
