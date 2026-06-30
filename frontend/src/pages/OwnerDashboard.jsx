import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const OwnerDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register admin form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    password: '',
  });

  const availablePermissions = [
    { id: 'read_users', label: 'View Customer Data' },
    { id: 'manage_requests', label: 'Approve Bank Accounts' },
    { id: 'view_transactions', label: 'Audit Transaction Logs' },
  ];

  const [selectedPermissions, setSelectedPermissions] = useState(['read_users', 'manage_requests', 'view_transactions']);

  const loadAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/owner/admins');
      setAdmins(response.data.admins);
    } catch (err) {
      setError('Failed to fetch administrator records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handlePermissionToggle = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Simple validation
    if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
      setError('Please fill in name, username, email, and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/owner/admins', {
        ...formData,
        permissions: selectedPermissions
      });

      if (response.data.success) {
        setSuccess('Administrator registered successfully!');
        setFormData({
          fullName: '',
          username: '',
          email: '',
          phone: '',
          address: '',
          zipCode: '',
          password: '',
        });
        setSelectedPermissions(['read_users', 'manage_requests', 'view_transactions']);
        loadAdmins();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this administrator?')) return;
    
    setLoading(true);
    try {
      const response = await api.delete(`/owner/admins/${userId}`);
      if (response.data.success) {
        setSuccess('Administrator removed successfully.');
        loadAdmins();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Removal operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dark-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-purple-500" />
          <span>System Administration Hub</span>
        </h1>
        <p className="text-sm text-dark-500">Super Admin (Owner) tools. Register new administrative staff and control privileges.</p>
      </div>

      {/* Message Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex gap-3 items-start animate-shake">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex gap-3 items-start">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of admins */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold text-dark-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-dark-600" />
            <span>Active Administrators</span>
          </h3>

          <div className="glass-card p-0 overflow-hidden divide-y divide-dark-200/50 dark:divide-dark-800/50">
            {loading && admins.length === 0 ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : admins.length === 0 ? (
              <div className="py-8 text-center text-dark-400 italic text-sm">
                No active administrators. Registered administrators will appear here.
              </div>
            ) : (
              admins.map((adm) => (
                <div key={adm._id} className="p-5 flex items-center justify-between gap-4 hover:bg-dark-100/10">
                  <div className="overflow-hidden">
                    <div className="font-bold text-dark-850 dark:text-dark-100">{adm.userId?.fullName}</div>
                    <div className="text-xs text-dark-400 font-mono">@{adm.userId?.username} &bull; {adm.userId?.email}</div>
                    <div className="flex gap-1.5 flex-wrap mt-2.5">
                      {adm.permissions.map((perm) => (
                        <span key={perm} className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                          {perm.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveAdmin(adm.userId?._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition flex-shrink-0"
                    title="Remove Admin"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Register Form */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-dark-800 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-dark-600" />
            <span>Register Admin Staff</span>
          </h3>

          <div className="glass-card border border-white/20 dark:border-dark-800/85">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-dark-500">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Admin Name"
                  className="glass-input text-xs py-2 px-3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-dark-500">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="admin_user"
                    className="glass-input text-xs py-2 px-3"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-dark-500">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Security Pass"
                    className="glass-input text-xs py-2 px-3"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-dark-500">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@aegisbank.com"
                    className="glass-input text-xs py-2 px-3"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-dark-500">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    className="glass-input text-xs py-2 px-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-dark-500">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Office Branch / Address"
                    className="glass-input text-xs py-2 px-3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-dark-500">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="Office Zip"
                    className="glass-input text-xs py-2 px-3"
                  />
                </div>
              </div>

              {/* Checkbox Permissions */}
              <div className="space-y-2 border-t border-dark-200/50 dark:border-dark-800/50 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wide text-dark-500 block">Assigned Permissions</span>
                <div className="space-y-1.5">
                  {availablePermissions.map(p => {
                    const isChecked = selectedPermissions.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handlePermissionToggle(p.id)}
                        className="flex items-center gap-2 text-xs font-semibold text-dark-700 dark:text-dark-300 w-full text-left"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-dark-400 flex-shrink-0" />
                        )}
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-purple-600/25 active:scale-[0.98] transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Register Staff</span>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
