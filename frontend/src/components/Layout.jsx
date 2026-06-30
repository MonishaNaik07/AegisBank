import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';
import { clearAccountState } from '../redux/slices/accountSlice.js';
import { clearNotificationState } from '../redux/slices/notificationSlice.js';
import ThemeToggle from './ThemeToggle.jsx';
import { 
  LayoutDashboard, 
  Send, 
  BrainCircuit, 
  MessageSquareShare, 
  Bell, 
  ShieldCheck, 
  Users, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  User
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearAccountState());
    dispatch(clearNotificationState());
    navigate('/login');
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const userNavigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfer Funds', path: '/transfer', icon: Send },
    { name: 'AI Insights', path: '/insights', icon: BrainCircuit },
    { name: 'AI Chatbot', path: '/chatbot', icon: MessageSquareShare },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
  ];

  const adminNavigation = [
    { name: 'Admin Hub', path: '/admin', icon: ShieldCheck },
  ];

  const ownerNavigation = [
    { name: 'Manage Admins', path: '/owner', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  const NavLinks = () => (
    <div className="space-y-1.5 px-3 py-4">
      <div className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider px-3 mb-2">
        Banking Menu
      </div>
      {userNavigation.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
            isActive(item.path)
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
              : 'text-dark-600 hover:bg-dark-100 hover:text-dark-900 dark:text-dark-300 dark:hover:bg-dark-800/60 dark:hover:text-dark-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.name}</span>
          </div>
          {item.badge && item.badge > 0 ? (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              isActive(item.path) ? 'bg-white text-brand-600' : 'bg-red-500 text-white'
            }`}>
              {item.badge}
            </span>
          ) : null}
        </Link>
      ))}

      {(user?.role === 'Admin' || user?.role === 'Owner') && (
        <>
          <div className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider px-3 mt-6 mb-2">
            Admin Controls
          </div>
          {adminNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive(item.path)
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  : 'text-dark-600 hover:bg-dark-100 hover:text-dark-900 dark:text-dark-300 dark:hover:bg-dark-800/60 dark:hover:text-dark-50'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
        </>
      )}

      {user?.role === 'Owner' && (
        <>
          <div className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider px-3 mt-6 mb-2">
            Owner Controls
          </div>
          {ownerNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive(item.path)
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-dark-600 hover:bg-dark-100 hover:text-dark-900 dark:text-dark-300 dark:hover:bg-dark-800/60 dark:hover:text-dark-50'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-dark-200/50 dark:border-dark-800/50 flex-shrink-0 h-screen sticky top-0 z-30">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-dark-200/50 dark:border-dark-800/50">
          <div className="bg-brand-500 text-white p-2 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-brand-600 dark:text-brand-500">
            AegisBank
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-dark-200/50 dark:border-dark-800/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              {user?.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-sm truncate">{user?.fullName}</div>
              <div className="text-xs text-dark-500 truncate capitalize">{user?.role} Account</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-medium text-sm transition-all duration-150"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Mobile drawer */}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-dark-900 z-50 transition-transform duration-300 ease-out transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-dark-200/50 dark:border-dark-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 text-white p-2 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-brand-600 dark:text-brand-500">
              AegisBank
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-dark-600 dark:text-dark-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-dark-200/50 dark:border-dark-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-medium text-sm transition-all duration-150"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 glass-panel border-b border-dark-200/50 dark:border-dark-800/50 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800/60"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden sm:block text-sm font-medium text-dark-500">
            Welcome back, <span className="text-dark-800 dark:text-dark-100 font-semibold">{user?.fullName}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification bell widget */}
            <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800/60 transition-colors">
              <Bell className="w-5 h-5 text-dark-600 dark:text-dark-300" />
              {unreadNotifications > 0 ? (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-900" />
              ) : null}
            </Link>

            <ThemeToggle />

            <div className="h-8 w-[1px] bg-dark-200 dark:bg-dark-800" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                {user?.fullName.charAt(0)}
              </div>
              <span className="text-sm font-semibold hidden md:inline capitalize px-2 py-0.5 rounded-lg bg-dark-200/50 dark:bg-dark-800 text-dark-700 dark:text-dark-300 border border-dark-300/30">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
