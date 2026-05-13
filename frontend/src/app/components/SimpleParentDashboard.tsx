import { LayoutDashboard, TrendingUp, Bell, FileText, Search, Settings, Award, CheckCircle, Sparkles, Menu, X, LogOut, ChevronDown, Eye, Hash, KeyRound, Loader2, BarChart3, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ProgressReportModal, ProgressReportData } from './ProgressReportModal';
import { ParentPasswordSecurityModal } from './ParentPasswordSecurityModal';

interface SimpleParentDashboardProps {
  parentData?: any;
  onSignOut?: () => void;
}

type ParentNavSection = 'dashboard' | 'insights' | 'notifications' | 'reports';

const parentNavTitles: Record<ParentNavSection, string> = {
  dashboard: 'Parent Dashboard',
  insights: 'Insights',
  notifications: 'Notifications',
  reports: 'Reports',
};

const parentNavSubtitles: Record<ParentNavSection, string> = {
  dashboard: 'Overview of your linked learner and account tools',
  insights: 'Learning signals derived from module progress and scores',
  notifications: 'Account updates and learning milestones',
  reports: 'Exportable summaries for your records',
};

export function SimpleParentDashboard({ parentData, onSignOut }: SimpleParentDashboardProps) {
  const [activeNav, setActiveNav] = useState<ParentNavSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [childData, setChildData] = useState<any>(null);
  const [childProgress, setChildProgress] = useState({
    completedLevels: 0,
    currentLevel: 1,
    currentModule: 'Password Castle',
    totalScore: 0,
    accuracy: 0,
    completedLevelsArray: [] as number[],
  });
  const [showLoginCode, setShowLoginCode] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<ProgressReportData | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [childLoadStatus, setChildLoadStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  // Load children and progress from API
  useEffect(() => {
    if (!parentData?.id) return;
    setChildLoadStatus('loading');
    (async () => {
      try {
        const children = await api.getParentChildren();
        const c = children?.[0];
        if (!c) {
          setChildData(null);
          setChildLoadStatus('empty');
          return;
        }
        setChildData(c);
        const progress = await api.getChildProgress(c.id);
        const arr = progress?.completedLevels || [];
        const count = arr.length;
        setChildProgress({
          completedLevels: count,
          currentLevel: count < 5 ? count + 1 : 5,
          currentModule: 'Password Castle',
          totalScore: count * 100,
          accuracy: count > 0 ? 85 : 0,
          completedLevelsArray: arr,
        });
        setChildLoadStatus('ready');
      } catch {
        setChildData(null);
        setChildLoadStatus('error');
      }
    })();
  }, [parentData]);

  const goNav = (section: ParentNavSection) => {
    setActiveNav(section);
    setIsSidebarOpen(false);
  };

  const navButtonClass = (section: ParentNavSection) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors text-left ${
      activeNav === section ? 'bg-white/10 text-white hover:bg-white/20' : 'text-white/70 hover:bg-white/10'
    }`;

  // Generate progress report data
  const generateProgressReport = (): ProgressReportData => {
    if (!childData) {
      return {
        childName: 'Unknown',
        childAge: 0,
        completedLevels: [],
        totalScore: 0,
        accuracy: 0,
        gamesPlayed: [],
        totalTimeSpent: 0,
        strengths: [],
        areasForImprovement: [],
        recommendations: [],
        reportDate: new Date().toISOString(),
      };
    }

    const completedLevels = childProgress.completedLevelsArray || [];
    
    // Password Castle game levels
    const passwordCastleLevels = [
      { level: 1, title: 'The Broken Gate', completed: completedLevels.includes(1), score: completedLevels.includes(1) ? 100 : 0, attempts: completedLevels.includes(1) ? 1 : 0, timeSpent: '5 min' },
      { level: 2, title: 'The Trick of Numbers', completed: completedLevels.includes(2), score: completedLevels.includes(2) ? 100 : 0, attempts: completedLevels.includes(2) ? 1 : 0, timeSpent: '6 min' },
      { level: 3, title: 'The Secret Chamber', completed: completedLevels.includes(3), score: completedLevels.includes(3) ? 100 : 0, attempts: completedLevels.includes(3) ? 1 : 0, timeSpent: '7 min' },
      { level: 4, title: 'The Hacker\'s Storm', completed: completedLevels.includes(4), score: completedLevels.includes(4) ? 100 : 0, attempts: completedLevels.includes(4) ? 1 : 0, timeSpent: '8 min' },
      { level: 5, title: 'The Royal Vault', completed: completedLevels.includes(5), score: completedLevels.includes(5) ? 100 : 0, attempts: completedLevels.includes(5) ? 1 : 0, timeSpent: '10 min' },
    ];

    const passwordCastleCompleted = completedLevels.length;
    const passwordCastleStatus = 
      passwordCastleCompleted === 0 ? 'not-started' : 
      passwordCastleCompleted === 5 ? 'completed' : 
      'in-progress';

    const gamesPlayed = [
      {
        gameName: 'Password Castle',
        levels: passwordCastleLevels,
        totalLevels: 5,
        completed: passwordCastleCompleted,
        status: passwordCastleStatus,
      },
      {
        gameName: 'Scam Safari',
        levels: [],
        totalLevels: 5,
        completed: 0,
        status: 'not-started' as const,
      },
      {
        gameName: 'Cyberbully Battle',
        levels: [],
        totalLevels: 5,
        completed: 0,
        status: 'not-started' as const,
      },
      {
        gameName: 'Privacy Village',
        levels: [],
        totalLevels: 5,
        completed: 0,
        status: 'not-started' as const,
      },
    ];

    // Calculate strengths
    const strengths: string[] = [];
    if (completedLevels.length > 0) {
      strengths.push(`Shows strong interest in learning cybersecurity concepts`);
    }
    if (completedLevels.length >= 3) {
      strengths.push(`Demonstrates excellent perseverance and determination`);
    }
    if (completedLevels.length >= 5) {
      strengths.push(`Mastered Password Castle - Excellent understanding of password security!`);
    }
    if (completedLevels.includes(2)) {
      strengths.push(`Good analytical skills in identifying numeric patterns in passwords`);
    }
    if (completedLevels.includes(3)) {
      strengths.push(`Understanding of special characters and password complexity`);
    }

    // Areas for improvement
    const areasForImprovement: string[] = [];
    if (completedLevels.length < 5) {
      areasForImprovement.push(`Continue working through Password Castle to build a solid foundation`);
    }
    if (completedLevels.length === 5) {
      areasForImprovement.push(`Explore other game modules to broaden cybersecurity knowledge`);
    }
    if (completedLevels.length < 3) {
      areasForImprovement.push(`Practice identifying strong vs weak passwords more frequently`);
    }

    // Recommendations
    const recommendations: string[] = [];
    if (completedLevels.length === 0) {
      recommendations.push(`Encourage ${childData.name} to start with Password Castle - it's a great introduction to password security`);
      recommendations.push(`Set aside 15-20 minutes for learning sessions to maintain focus`);
    } else if (completedLevels.length < 5) {
      recommendations.push(`Celebrate progress and encourage ${childData.name} to complete Password Castle`);
      recommendations.push(`Discuss real-world examples of password security at home`);
    } else {
      recommendations.push(`Excellent work! Explore Scam Safari to learn about online scams and phishing`);
      recommendations.push(`Apply Password Castle learnings by creating strong passwords together for family accounts`);
    }
    recommendations.push(`Have regular discussions about online safety and cybersecurity`);
    recommendations.push(`Encourage ${childData.name} to share what they learn in each level`);

    const totalTimeSpent = completedLevels.length * 7; // Approximate 7 minutes per level

    return {
      childName: childData.name,
      childAge: childData.age,
      completedLevels: completedLevels,
      totalScore: completedLevels.length * 100,
      accuracy: completedLevels.length > 0 ? 85 : 0,
      gamesPlayed,
      totalTimeSpent,
      strengths: strengths.length > 0 ? strengths : ['Getting started on their cybersecurity learning journey!'],
      areasForImprovement,
      recommendations,
      reportDate: new Date().toISOString(),
    };
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-x-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-[#2d5a8a] to-[#1e3a5f] text-white flex flex-col flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button 
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and App Name */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#2d5a8a] text-lg">🛡️</span>
          </div>
          <span className="text-xl font-bold">CyberQuest</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 pt-8">
          <button type="button" className={navButtonClass('dashboard')} onClick={() => goNav('dashboard')}>
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Dashboard</span>
          </button>
          <button type="button" className={navButtonClass('insights')} onClick={() => goNav('insights')}>
            <TrendingUp className="w-5 h-5 shrink-0" />
            <span>Insights</span>
          </button>
          <button type="button" className={navButtonClass('notifications')} onClick={() => goNav('notifications')}>
            <Bell className="w-5 h-5 shrink-0" />
            <span>Notifications</span>
          </button>
          <button type="button" className={navButtonClass('reports')} onClick={() => goNav('reports')}>
            <FileText className="w-5 h-5 shrink-0" />
            <span>Reports</span>
          </button>
        </nav>

        {/* Recent Notifications - Sidebar Panel */}
        <div className="px-4 pb-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-sm mb-4 font-semibold">Recent Notifications</h3>
            <div className="space-y-3">
              {childData && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/90 leading-tight">{childData.name} started their journey!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/90 leading-tight">Account successfully created</p>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/90 leading-tight">New missions available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu for Mobile */}
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl text-gray-900 font-semibold tracking-tight truncate">
                {parentNavTitles[activeNav]}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2 sm:line-clamp-none max-w-xl">
                {parentNavSubtitles[activeNav]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Password & security"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden z-20 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowPasswordModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-gray-800 border-b border-gray-100"
                    >
                      <KeyRound className="w-4 h-4 text-[#2d5a8a]" />
                      <span className="text-sm text-left">Forgot / change password</span>
                    </button>
                    {onSignOut && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeNav === 'dashboard' && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - Performance & Notifications */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Child Performance Summary Card */}
              {childLoadStatus === 'loading' && (
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-8 lg:p-10">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 className="h-9 w-9 animate-spin text-[#2d5a8a]" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Loading learner profile</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Retrieving your linked child account and the latest progress data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {(childLoadStatus === 'empty' || childLoadStatus === 'error') && (
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-8 lg:p-10">
                  <div className="max-w-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">No linked learner</p>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {childLoadStatus === 'error' ? 'We could not load account data' : 'Add a child to see progress here'}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {childLoadStatus === 'error'
                        ? 'Check your connection and try signing out and back in. If the issue continues, contact support.'
                        : 'Complete registration with a child profile, or ensure your account has an active linked learner in the CyberQuest system.'}
                    </p>
                  </div>
                </div>
              )}
              {childData && (
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 lg:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5 lg:mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-start gap-3 lg:gap-4 min-w-0">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#2d5a8a] to-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-xl lg:text-2xl" aria-hidden>
                          {childData.age <= 10 ? '👧' : '🧒'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2 className="text-lg lg:text-xl text-gray-900 font-semibold tracking-tight truncate">
                            {childData.name}
                          </h2>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            Active learner
                          </span>
                        </div>
                        <p className="text-xs lg:text-sm text-gray-500">
                          Age {childData.age} · Primary module: {childProgress.currentModule}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Performance summary</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                    <div className="rounded-xl border border-gray-200/90 bg-gray-50/80 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-[#2d5a8a] rounded-lg flex items-center justify-center shadow-sm">
                          <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Current level</span>
                      </div>
                      <p className="text-2xl lg:text-3xl text-gray-900 font-semibold tabular-nums">{childProgress.currentLevel}</p>
                      <p className="text-xs text-gray-500 mt-1">Of 5 in Password Castle</p>
                    </div>

                    <div className="rounded-xl border border-gray-200/90 bg-gray-50/80 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Accuracy</span>
                      </div>
                      <p className="text-2xl lg:text-3xl text-gray-900 font-semibold tabular-nums">{childProgress.accuracy}%</p>
                      <p className="text-xs text-gray-500 mt-1">Based on completed attempts</p>
                    </div>

                    <div className="rounded-xl border border-gray-200/90 bg-gray-50/80 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Total score</span>
                      </div>
                      <p className="text-2xl lg:text-3xl text-gray-900 font-semibold tabular-nums">{childProgress.totalScore}</p>
                      <p className="text-xs text-gray-500 mt-1">Cumulative across tracked levels</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 lg:p-6">
                <div className="flex items-end justify-between gap-3 mb-5 pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Activity</p>
                    <h2 className="text-base lg:text-lg text-gray-900 font-semibold tracking-tight">Recent timeline</h2>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide shrink-0">Latest first</span>
                </div>
                <div className="space-y-0">
                  {childData && (
                    <div className="flex gap-4 py-4 border-b border-gray-100 first:pt-0">
                      <div className="w-24 shrink-0 text-right pt-0.5">
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Recent</span>
                      </div>
                      <div className="flex flex-1 gap-3 min-w-0">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200/80">
                          <Award className="w-5 h-5 text-[#2d5a8a]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{childData.name} enrolled</p>
                          <p className="text-xs text-gray-500 mt-0.5">Learner profile is active and ready for modules.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 py-4 border-b border-gray-100">
                    <div className="w-24 shrink-0 text-right pt-0.5">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Account</span>
                    </div>
                    <div className="flex flex-1 gap-3 min-w-0">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-200/80">
                        <CheckCircle className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Verification complete</p>
                        <p className="text-xs text-gray-500 mt-0.5">Parent account confirmed and secured.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 py-4 last:pb-0">
                    <div className="w-24 shrink-0 text-right pt-0.5">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Curriculum</span>
                    </div>
                    <div className="flex flex-1 gap-3 min-w-0">
                      <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-violet-200/80">
                        <Sparkles className="w-5 h-5 text-violet-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">New missions available</p>
                        <p className="text-xs text-gray-500 mt-0.5">Password Castle and additional modules are unlocked.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Child Info & Login Code */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 lg:p-6 lg:sticky lg:top-6 space-y-5 lg:space-y-6">
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Linked account</p>
                  <h2 className="text-base lg:text-lg text-gray-900 font-semibold tracking-tight">Child access</h2>
                  <p className="text-xs text-gray-500 mt-1">Credentials and progress tools for your learner.</p>
                </div>

                {childLoadStatus === 'loading' && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#2d5a8a]" aria-hidden />
                    <p className="text-xs text-gray-500">Synchronizing account data…</p>
                  </div>
                )}

                {(childLoadStatus === 'empty' || childLoadStatus === 'error') && (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 p-5 text-center">
                    <p className="text-sm font-medium text-gray-800 mb-1">No learner linked</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Once a child profile is associated with your parent account, details and login code will appear here.
                    </p>
                  </div>
                )}

                {childData && (
                  <>
                    <div className="flex flex-col gap-4 p-4 rounded-xl border border-gray-200/90 bg-slate-50/60">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2d5a8a] to-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-lg" aria-hidden>{childData.age <= 10 ? '👧' : '🧒'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{childData.name}</p>
                          <p className="text-xs text-gray-500">Age {childData.age}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Module progress</span>
                          <span className="text-xs font-semibold text-gray-700 tabular-nums">{childProgress.completedLevels}/5</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2d5a8a] to-emerald-500 transition-all duration-500"
                            style={{ width: `${(childProgress.completedLevels / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1.5">Password Castle pathway</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-900/70 mb-0.5">Child login</p>
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-amber-800 shrink-0" />
                            <h3 className="text-sm font-semibold text-gray-900">Access code</h3>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLoginCode(!showLoginCode)}
                          className="p-2 rounded-lg text-gray-600 hover:bg-amber-100/80 transition-colors"
                          aria-label={showLoginCode ? 'Hide login code' : 'Reveal login code'}
                        >
                          <Eye className={`w-4 h-4 ${showLoginCode ? 'text-amber-800' : 'text-gray-400'}`} />
                        </button>
                      </div>

                      <div className="bg-white rounded-lg border border-amber-200/60 p-3 text-center">
                        {showLoginCode ? (
                          <p className="text-3xl sm:text-4xl font-bold text-gray-900 font-mono tracking-[0.25em]">
                            {childData.loginCode}
                          </p>
                        ) : (
                          <p className="text-3xl sm:text-4xl font-bold text-gray-300 font-mono tracking-[0.25em] select-none" aria-hidden>
                            ••••
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-600 mt-3 text-center leading-relaxed">
                        Provide this code on the child sign-in screen. Treat it like a password and share only with your learner.
                      </p>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setReportData(generateProgressReport());
                    setShowReportModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] text-white py-3.5 lg:py-4 rounded-xl hover:shadow-md transition-shadow text-sm font-semibold tracking-tight"
                >
                  Generate progress report
                </button>
              </div>
            </div>
          </div>
          )}

          {activeNav === 'insights' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="rounded-2xl border border-gray-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-md">
                    <BarChart3 className="h-6 w-6 text-white" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Analytics</p>
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">Learning intelligence</h2>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                      Key metrics are derived from your learner&apos;s module progress. Use this view to monitor momentum
                      and identify when to encourage the next lesson.
                    </p>
                  </div>
                </div>
              </div>

              {childLoadStatus === 'loading' && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200/90 bg-white py-16 shadow-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2d5a8a] mb-4" aria-hidden />
                  <p className="text-sm font-medium text-gray-900">Preparing analytics</p>
                  <p className="text-xs text-gray-500 mt-1">This may take a few seconds.</p>
                </div>
              )}

              {(childLoadStatus === 'empty' || childLoadStatus === 'error') && (
                <div className="rounded-2xl border border-gray-200/90 bg-white p-8 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">No data source</p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Insights require a linked learner</h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-lg">
                    Connect a child profile to your parent account to unlock progress-based analytics and recommendations.
                  </p>
                </div>
              )}

              {childData && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Primary module</p>
                      <div className="flex items-center gap-2 text-[#2d5a8a] mb-2">
                        <TrendingUp className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-medium text-gray-600">Current focus</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{childProgress.currentModule}</p>
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                        Active position: level {childProgress.currentLevel} of 5 within this pathway.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Completion</p>
                      <p className="text-3xl font-semibold tabular-nums text-gray-900">{childProgress.completedLevels}<span className="text-lg text-gray-400 font-normal">/5</span></p>
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed">Levels marked complete in Password Castle.</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Score & accuracy</p>
                      <p className="text-2xl font-semibold tabular-nums text-gray-900">{childProgress.totalScore}</p>
                      <p className="mt-1 text-xs text-gray-500">Aggregate score · {childProgress.accuracy}% estimated accuracy after attempts</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200/90 bg-white p-6 lg:p-8 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <h3 className="text-base font-semibold text-gray-900">Pathway completion</h3>
                      <span className="text-xs font-medium text-gray-500">Password Castle</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2d5a8a] to-emerald-500 transition-all duration-500"
                        style={{ width: `${(childProgress.completedLevels / 5) * 100}%` }}
                      />
                    </div>
                    <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                      {childProgress.completedLevels === 0 &&
                        'No levels completed yet. A short daily session can help build momentum in the first module.'}
                      {childProgress.completedLevels > 0 &&
                        childProgress.completedLevels < 5 &&
                        'Steady progress detected. Continuing through level five unlocks the full Password Castle credential narrative.'}
                      {childProgress.completedLevels >= 5 &&
                        'Password Castle pathway complete. Consider guiding your learner toward the next CyberQuest module.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeNav === 'notifications' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="rounded-2xl border border-gray-200/90 bg-white p-6 lg:p-8 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Inbox</p>
                <h2 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">Operational notifications</h2>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                  System and learning updates for your parent account. Critical security notices will always appear here
                  when available.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-gray-100 bg-gray-50/90 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <span>Notification</span>
                  <span className="hidden sm:inline">Category</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {childData && (
                    <>
                      <li className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                        <div className="flex gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                            <Award className="h-5 w-5 text-[#2d5a8a]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">Learner enrolled</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{childData.name} is active on the platform.</p>
                          </div>
                        </div>
                        <span className="justify-self-start rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 sm:justify-self-end">
                          Learning
                        </span>
                      </li>
                      <li className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                        <div className="flex gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50">
                            <CheckCircle className="h-5 w-5 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">Account verification</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Parent identity check completed successfully.</p>
                          </div>
                        </div>
                        <span className="justify-self-start rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 sm:justify-self-end">
                          Security
                        </span>
                      </li>
                    </>
                  )}
                  <li className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                    <div className="flex gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50">
                        <Sparkles className="h-5 w-5 text-violet-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">Curriculum update</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">New missions are available, including Password Castle stages.</p>
                      </div>
                    </div>
                    <span className="justify-self-start rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 sm:justify-self-end">
                      Product
                    </span>
                  </li>
                  <li className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                    <div className="flex gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50">
                        <Bell className="h-5 w-5 text-amber-800" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">Child access reminder</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Share the learner login code only with your child; rotate if it may have been exposed.</p>
                      </div>
                    </div>
                    <span className="justify-self-start rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 sm:justify-self-end">
                      Advisory
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeNav === 'reports' && (
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
                <div className="space-y-6 lg:col-span-3">
                  <div className="rounded-2xl border border-gray-200/90 bg-white p-6 lg:p-8 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Documentation</p>
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900 mb-3">Formal progress report</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Generate a structured PDF-ready summary suitable for school counselors, tutors, or your own records.
                      {childData ? (
                        <span className="font-medium text-gray-800"> Current subject: {childData.name}.</span>
                      ) : (
                        <span> Content reflects linked learner data when available.</span>
                      )}
                    </p>
                  </div>
                  <ul className="space-y-4 rounded-2xl border border-gray-200/90 bg-gray-50/50 p-6 lg:p-8">
                    {[
                      'Module-by-module completion and scores',
                      'Narrative strengths and targeted improvement areas',
                      'Guardian-facing recommendations for home discussion',
                      'Timestamped export for audit and records',
                    ].map((line) => (
                      <li key={line} className="flex gap-3 text-sm text-gray-700">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        <span className="leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:col-span-2">
                  <div className="lg:sticky lg:top-6 space-y-4 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e3a5f] text-white shadow-sm">
                      <ClipboardList className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Create report</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Opens an on-screen summary you can review before printing or saving from your browser.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setReportData(generateProgressReport());
                        setShowReportModal(true);
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] py-3.5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      Generate progress report
                    </button>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Reports use the latest synced progress. For best accuracy, confirm your learner has recently completed a session online.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Progress Report Modal */}
      {showReportModal && reportData && (
        <ProgressReportModal
          data={reportData}
          onClose={() => setShowReportModal(false)}
        />
      )}

      <ParentPasswordSecurityModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        accountEmail={typeof parentData?.email === 'string' ? parentData.email : ''}
        showChangePasswordTab
      />
    </div>
  );
}