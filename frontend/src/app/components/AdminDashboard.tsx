import { LayoutDashboard, Users, Baby, Search, Menu, X, LogOut, Pencil, Trash2, RefreshCw, Target, BarChart3, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ParentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  children: ChildUser[];
}

interface ChildUser {
  id: string;
  name: string;
  age: number;
  loginCode: string;
  parentId: string;
}

interface AdminDashboardProps {
  onSignOut?: () => void;
}

export function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'children' | 'analytics' | 'settings'>('overview');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [children, setChildren] = useState<ChildUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalParents: 0,
    totalChildren: 0,
    activeChildren: 0,
    avgScore: 0,
    highestScore: 0,
  });
  const [settingsState, setSettingsState] = useState({
    encryptionLevel: 'Medium',
    adaptiveContentNotes: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const parentNameById = useMemo(() => {
    const map = new Map<string, string>();
    parents.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [parents]);

  const summaryChartData = useMemo(
    () => [
      { name: 'Parents', value: analytics.totalParents },
      { name: 'Children', value: analytics.totalChildren },
      { name: 'Active', value: analytics.activeChildren },
    ],
    [analytics],
  );

  const scoreChartData = useMemo(
    () => [
      { name: 'Avg Score', value: analytics.avgScore },
      { name: 'Highest Score', value: analytics.highestScore },
    ],
    [analytics],
  );

  const childrenAgeGroups = useMemo(() => {
    const groups = [
      { name: 'Age 1-6', value: 0, color: '#60a5fa' },
      { name: 'Age 7-12', value: 0, color: '#34d399' },
      { name: 'Age 13-18', value: 0, color: '#f59e0b' },
    ];
    children.forEach((child) => {
      if (child.age <= 6) groups[0].value += 1;
      else if (child.age <= 12) groups[1].value += 1;
      else groups[2].value += 1;
    });
    return groups;
  }, [children]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminUsers();
      setParents(data.parents || []);
      setChildren(data.children || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadAnalytics();
    loadSettings();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAdminAnalytics();
      setAnalytics({
        totalParents: data.totalParents || 0,
        totalChildren: data.totalChildren || 0,
        activeChildren: data.activeChildren || 0,
        avgScore: data.avgScore || 0,
        highestScore: data.highestScore || 0,
      });
    } catch (_err: any) {
      // keep section resilient even if analytics endpoint fails
    }
  };

  const loadSettings = async () => {
    try {
      const data = await api.getAdminSettings();
      setSettingsState({
        encryptionLevel: data.encryptionLevel || 'Medium',
        adaptiveContentNotes: data.adaptiveContentNotes || '',
      });
    } catch (_err: any) {
      // keep section resilient even if settings endpoint fails
    }
  };

  const editParent = async (parent: ParentUser) => {
    const name = window.prompt('Edit parent name:', parent.name);
    if (name === null) return;
    const email = window.prompt('Edit parent email:', parent.email);
    if (email === null) return;
    try {
      await api.updateAdminParent(parent.id, { name, email });
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || 'Failed to update parent');
    }
  };

  const deleteParent = async (parent: ParentUser) => {
    if (!window.confirm(`Delete parent "${parent.name}" and all linked children?`)) return;
    try {
      await api.deleteAdminParent(parent.id);
      await loadUsers();
      await loadAnalytics();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete parent');
    }
  };

  const editChild = async (child: ChildUser) => {
    const name = window.prompt('Edit child name:', child.name);
    if (name === null) return;
    const ageValue = window.prompt('Edit child age:', String(child.age));
    if (ageValue === null) return;
    const age = Number(ageValue);
    if (!Number.isFinite(age) || age < 1 || age > 18) {
      alert('Age must be between 1 and 18');
      return;
    }
    try {
      await api.updateAdminChild(child.id, { name, age });
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || 'Failed to update child');
    }
  };

  const deleteChild = async (child: ChildUser) => {
    if (!window.confirm(`Delete child "${child.name}"?`)) return;
    try {
      await api.deleteAdminChild(child.id);
      await loadUsers();
      await loadAnalytics();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete child');
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const data = await api.updateAdminSettings(settingsState);
      setSettingsState({
        encryptionLevel: data.encryptionLevel || 'Medium',
        adaptiveContentNotes: data.adaptiveContentNotes || '',
      });
      alert('Settings updated successfully');
    } catch (err: any) {
      alert(err?.message || 'Failed to update settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#2d5a8a] text-lg">🛡️</span>
        </div>
        <span className="text-xl font-bold text-white">CyberQuest Admin</span>
      </div>

      <nav className="flex-1 px-4 pt-8">
        <button
          onClick={() => setActiveSection('overview')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
            activeSection === 'overview'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveSection('users')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
            activeSection === 'users'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveSection('children')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
            activeSection === 'children'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <Baby className="w-5 h-5" />
          <span>Children</span>
        </button>
        <button
          onClick={() => setActiveSection('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
            activeSection === 'analytics'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
            activeSection === 'settings'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-x-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#2d5a8a] to-[#1e3a5f] text-white flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl lg:text-2xl text-gray-800 font-bold">
                {activeSection === 'overview' && 'Admin Dashboard'}
                {activeSection === 'users' && 'Users'}
                {activeSection === 'children' && 'Children'}
                {activeSection === 'analytics' && 'Analytics'}
                {activeSection === 'settings' && 'Settings'}
              </h1>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <button onClick={loadUsers} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Refresh users">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative">
                <button
                  className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <span className="text-white text-sm">👤</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-red-600"
                      onClick={onSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">Total Parents</p>
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl text-gray-800 font-bold">{parents.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">Total Children</p>
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Baby className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl text-gray-800 font-bold">{children.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">Active Children</p>
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl text-gray-800 font-bold">{analytics.activeChildren}</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">Avg Score</p>
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl text-gray-800 font-bold">{analytics.avgScore}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl text-gray-800 font-bold mb-4">Recent Parents</h2>
                    <div className="space-y-3">
                      {parents.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                          <div>
                            <p className="text-sm text-gray-900 font-semibold">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {user.children?.length || 0} children
                          </span>
                        </div>
                      ))}
                      {parents.length === 0 && (
                        <p className="text-sm text-gray-500">No parent accounts found yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl text-gray-800 font-bold mb-4">Quick Insights</h2>
                    <div className="space-y-3">
                      <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                        <p className="text-xs text-indigo-700 font-semibold mb-1">Top Metric</p>
                        <p className="text-sm text-gray-800">
                          Highest score recorded is <span className="font-bold">{analytics.highestScore}</span>.
                        </p>
                      </div>
                      <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                        <p className="text-xs text-green-700 font-semibold mb-1">Engagement</p>
                        <p className="text-sm text-gray-800">
                          <span className="font-bold">{analytics.activeChildren}</span> active child accounts currently tracked.
                        </p>
                      </div>
                      <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
                        <p className="text-xs text-orange-700 font-semibold mb-1">Balance</p>
                        <p className="text-sm text-gray-800">
                          Parent-to-child ratio is approximately{' '}
                          <span className="font-bold">
                            {parents.length}:{children.length || 0}
                          </span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Users Section */}
            {activeSection === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl text-gray-800 font-bold">All Parents</h2>
                  <span className="text-sm text-gray-500">{parents.length} total</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {parents.map((user) => {
                    const childNames = (user.children || []).map((c) => c.name);
                    return (
                      <div
                        key={user.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-base font-semibold">
                              {user.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <p className="text-gray-900 font-semibold text-base">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                            Parent
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-3 py-2 mb-2">
                            <span className="text-xs text-gray-600">Children</span>
                            <span className="text-xs text-indigo-700 font-semibold">
                              {childNames.length}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg px-3 py-2 min-h-[44px]">
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {childNames.length > 0 ? childNames.join(', ') : 'No linked children'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editParent(user)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 text-sm font-medium transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteParent(user)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 py-2.5 text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Children Section */}
            {activeSection === 'children' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl text-gray-800 font-bold">All Children</h2>
                  <span className="text-sm text-gray-500">{children.length} total</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {children.map((child) => {
                    const parentName = parentNameById.get(child.parentId) || '-';
                    return (
                      <div
                        key={child.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-lg">
                              {child.age <= 10 ? '👧' : '🧒'}
                            </div>
                            <div>
                              <p className="text-gray-900 font-semibold text-base">{child.name}</p>
                              <p className="text-xs text-gray-500">Age {child.age}</p>
                            </div>
                          </div>
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                            Active
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-600">Parent</span>
                            <span className="text-xs text-gray-900 font-medium">{parentName}</span>
                          </div>
                          <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-600">Login Code</span>
                            <span className="text-sm text-amber-700 font-bold tracking-wider">{child.loginCode}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editChild(child)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 text-sm font-medium transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteChild(child)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 py-2.5 text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeSection === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm text-gray-600">Total Parents</p>
                    <p className="text-3xl text-gray-900 mt-1">{analytics.totalParents}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm text-gray-600">Total Children</p>
                    <p className="text-3xl text-gray-900 mt-1">{analytics.totalChildren}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm text-gray-600">Active Children</p>
                    <p className="text-3xl text-gray-900 mt-1">{analytics.activeChildren}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-3xl text-gray-900 mt-1">{analytics.avgScore}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm text-gray-600">Highest Score</p>
                    <p className="text-3xl text-gray-900 mt-1">{analytics.highestScore}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg text-gray-800 font-semibold mb-4">User Summary</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={summaryChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#2d5a8a" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg text-gray-800 font-semibold mb-4">Score Comparison</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg text-gray-800 font-semibold mb-4">Children Age Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={childrenAgeGroups}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label
                        >
                          {childrenAgeGroups.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'settings' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl text-gray-800 font-bold mb-1">Adaptive Learning Settings</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Configure security preferences and guidance used across the platform.
                  </p>

                  <div className="mb-5">
                    <label className="block text-sm text-gray-700 font-semibold mb-2">Encryption Level</label>
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                      <select
                        value={settingsState.encryptionLevel}
                        onChange={(e) => setSettingsState((prev) => ({ ...prev, encryptionLevel: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm text-gray-700 font-semibold mb-2">Adaptive Content Notes</label>
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                      <textarea
                        value={settingsState.adaptiveContentNotes}
                        onChange={(e) => setSettingsState((prev) => ({ ...prev, adaptiveContentNotes: e.target.value }))}
                        rows={6}
                        placeholder="Update adaptive learning rules/content notes..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 resize-y"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveSettings}
                    disabled={settingsSaving}
                    className="bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] text-white rounded-xl px-6 py-2.5 disabled:opacity-70 font-semibold"
                  >
                    {settingsSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-sm p-5 border border-blue-100">
                    <p className="text-xs text-blue-700 font-semibold mb-2">Current Security Level</p>
                    <p className="text-2xl font-bold text-gray-800">{settingsState.encryptionLevel}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      This controls baseline data-protection strictness for admin-managed flows.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-5 border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-semibold mb-2">Guidance Status</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {settingsState.adaptiveContentNotes.trim() ? 'Custom notes configured' : 'Using default guidance'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Add notes to tailor mission recommendations and educator-facing tips.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100">
                    <p className="text-xs text-indigo-700 font-semibold mb-2">Quick Tip</p>
                    <p className="text-sm text-gray-700">
                      Use <span className="font-semibold">High</span> encryption for production and keep notes concise so admins can apply them quickly.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {loading && <p className="mt-4 text-sm text-gray-600">Loading admin users...</p>}
            {!!error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </main>
      </div>
    </div>
  );
}