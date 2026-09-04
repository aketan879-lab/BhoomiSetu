'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Map as MapIcon, 
  Search, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  User,
  Globe,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Settings,
  Shield,
  LogOut,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import './globals.css';
import { WebLanguageProvider, useWebLanguage, LanguageCode } from '../context/WebLanguageContext';

export interface NotificationItem {
  id: string;
  type: 'NEW_RECORD' | 'LOW_CONFIDENCE' | 'MUTATION_REQUEST';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoute: string;
  relatedRecordId: string;
  priority: 'high' | 'normal';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'N001',
    type: 'NEW_RECORD',
    title: 'New Land Record Submitted',
    message: 'A new land record digitization request (REC-1001) has been submitted by Rakesh Kumar.',
    timestamp: 'Just now',
    read: false,
    targetRoute: '/validation/REC-1001',
    relatedRecordId: 'REC-1001',
    priority: 'normal'
  },
  {
    id: 'N002',
    type: 'LOW_CONFIDENCE',
    title: 'Record Requires Verification',
    message: 'Record REC-1002 (Sunita Devi) has an area mismatch flag and requires verification.',
    timestamp: '10 minutes ago',
    read: false,
    targetRoute: '/validation/REC-1002',
    relatedRecordId: 'REC-1002',
    priority: 'high'
  },
  {
    id: 'N003',
    type: 'MUTATION_REQUEST',
    title: 'New Mutation Request',
    message: 'Mutation request (REC-1003) received for Kanpur survey #78/3.',
    timestamp: '25 minutes ago',
    read: false,
    targetRoute: '/validation/REC-1003',
    relatedRecordId: 'REC-1003',
    priority: 'normal'
  }
];

function InnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, setLang, t } = useWebLanguage();

  // Notification & Profile Menu Popover States
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'settings' | 'security' | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Polling backend for new submissions from Mobile App
  const seenRecordsRef = useRef<Set<string>>(new Set(['LR-UP-001', 'LR-UP-002', 'LR-MH-001', 'LR-RJ-001', 'LR-DL-001']));

  // 1. On Mount: Filter out notifications that were previously read/dismissed by Admin in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDismissed = localStorage.getItem('bhumisetu_dismissed_notifications');
      if (savedDismissed) {
        try {
          const dismissedSet = new Set<string>(JSON.parse(savedDismissed));
          setNotifications(prev => prev.filter(n => !dismissedSet.has(n.id)));
        } catch (e) {
          // Ignore JSON parse error
        }
      }
    }
  }, []);

  // 2. Poll mobile submissions while respecting dismissed notifications
  useEffect(() => {
    const pollMobileSubmissions = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/records/');
        if (!res.ok) return;
        const records = await res.json();
        
        let dismissedSet = new Set<string>();
        if (typeof window !== 'undefined') {
          const savedDismissed = localStorage.getItem('bhumisetu_dismissed_notifications');
          if (savedDismissed) {
            try { dismissedSet = new Set(JSON.parse(savedDismissed)); } catch (e) {}
          }
        }

        // Find records submitted by farmer or with citizen prefix
        records.forEach((rec: any) => {
          const notifId = `N-MOBILE-${rec.id}`;
          if ((rec.digitized_by === 'USR-FARMER-01' || (rec.id && rec.id.includes('CITIZEN'))) && 
              !seenRecordsRef.current.has(rec.id) &&
              !dismissedSet.has(notifId)) {
            
            seenRecordsRef.current.add(rec.id);
            
            // Create a new high-priority notification for Tehsildar Admin
            const newNotif: NotificationItem = {
              id: notifId,
              type: 'MUTATION_REQUEST',
              title: '📲 New Request from Mobile App',
              message: `Citizen ${rec.owner_name || 'Rakesh Kumar'} submitted a new mutation request (${rec.id}, Khasra #${rec.khasra_number || '102/12'}) from Mobile App.`,
              timestamp: 'Just now',
              read: false,
              targetRoute: `/validation/${rec.id}`,
              relatedRecordId: rec.id,
              priority: 'high'
            };
            
            setNotifications(prev => {
              if (prev.some(n => n.id === notifId)) return prev;
              return [newNotif, ...prev];
            });
          }
        });
      } catch (e) {
        // Silent catch for network polling
      }
    };

    // Initial check + poll every 3 seconds
    pollMobileSubmissions();
    const interval = setInterval(pollMobileSubmissions, 3000);
    return () => clearInterval(interval);
  }, []);

  // Mutual Exclusivity & Outside Click / Escape Key Dismissal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setActiveModal(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
    setShowNotifications(false);
  };

  // Helper to persist dismissed IDs to localStorage
  const saveDismissedId = (id: string) => {
    if (typeof window !== 'undefined') {
      try {
        const savedDismissed = localStorage.getItem('bhumisetu_dismissed_notifications');
        const dismissedSet = savedDismissed ? new Set<string>(JSON.parse(savedDismissed)) : new Set<string>();
        dismissedSet.add(id);
        localStorage.setItem('bhumisetu_dismissed_notifications', JSON.stringify(Array.from(dismissedSet)));
      } catch (e) {}
    }
  };

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    saveDismissedId(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    notifications.forEach(n => saveDismissedId(n.id));
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setShowNotifications(false);
    if (item.relatedRecordId) {
      router.push(`/validation/${item.relatedRecordId}`);
    } else {
      router.push('/validation');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    setShowProfileMenu(false);
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm relative z-30">
        <div className="flex items-center text-xs text-gray-500 font-bold">
          <Link href="/" className="hover:text-blue-600">BhumiSetu</Link>
          <span className="mx-2">/</span>
          <span className="text-blue-900 capitalize font-extrabold">
            {pathname === '/' ? 'Language Selection' : pathname.replace('/', '')}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Low-Bandwidth & Offline Resilience Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-bold">
            ⚡ Low-Bandwidth Optimized
          </div>

          {/* Quick Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-900">
            <Globe size={14} className="text-blue-600" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="bg-transparent text-blue-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="hi">🇮🇳 हिंदी (Hindi)</option>
              <option value="en">🌐 English</option>
              <option value="mr">🇮🇳 मराठी (Marathi)</option>
              <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
              <option value="te">🇮🇳 తెలుగు (Telugu)</option>
              <option value="bn">🇮🇳 বাংলা (Bengali)</option>
            </select>
          </div>

          {/* 1. NOTIFICATION ICON & POPOVER */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={toggleNotifications}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleNotifications();
                }
              }}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 relative transition"
              title="Notifications"
              aria-expanded={showNotifications}
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="h-5 w-5 text-gray-700 hover:text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        All read ✅
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <span className="text-3xl block">🎉</span>
                      <p className="font-bold text-xs text-gray-900">All caught up!</p>
                      <p className="text-[11px] text-gray-500">No unread notifications remaining.</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className="p-3.5 hover:bg-gray-50 cursor-pointer transition flex gap-3 items-start bg-blue-50/40"
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.type === 'LOW_CONFIDENCE' ? (
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                              <AlertTriangle size={16} />
                            </div>
                          ) : item.type === 'MUTATION_REQUEST' ? (
                            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                              <FileText size={16} />
                            </div>
                          ) : (
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                              <Sparkles size={16} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-black text-blue-950 truncate">
                              {item.title}
                            </h4>
                            {item.priority === 'high' && (
                              <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                HIGH
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100/60">
                            <span className="text-[10px] text-gray-400 font-semibold">{item.timestamp}</span>
                            <button
                              onClick={(e) => markAsRead(item.id, e)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                            >
                              Mark read & remove ✖
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. ADMIN PROFILE AREA & MENU */}
          <div className="relative border-l border-gray-200 pl-3" ref={profileRef}>
            <button
              onClick={toggleProfileMenu}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleProfileMenu();
                }
              }}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-left"
              title="Admin Profile Menu"
              aria-expanded={showProfileMenu}
            >
              <div className="h-8 w-8 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:block text-xs">
                <p className="font-bold text-gray-900 leading-tight">Admin Officer</p>
                <p className="text-[10px] text-gray-500 leading-tight">Tehsildar, Lucknow</p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                  <p className="font-extrabold text-sm">Priya Sharma</p>
                  <p className="text-xs text-blue-200 font-medium">Username: Tahsildar1</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">TEHSILDAR (OFFICER GRADE-I)</span>
                  </div>
                </div>

                <div className="p-2 space-y-1 text-xs">
                  <button
                    onClick={() => { setShowProfileMenu(false); setActiveModal('profile'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-bold transition"
                  >
                    <User size={16} className="text-blue-600" /> 👤 Admin Profile
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); setActiveModal('settings'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-bold transition"
                  >
                    <Settings size={16} className="text-blue-600" /> ⚙ Account Settings
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); setActiveModal('security'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-bold transition"
                  >
                    <Shield size={16} className="text-blue-600" /> 🔐 Security & MFA
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold transition"
                  >
                    <LogOut size={16} className="text-red-600" /> 🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page Body */}
      <main className="flex-1 bg-gray-50 p-6 min-h-[calc(100vh-8rem)]">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 px-6 text-xs text-center text-gray-500 shrink-0">
        BhumiSetu v1.0 | Ministry of Rural Development | Government of India
      </footer>

      {/* 3. MODALS FOR ADMIN PROFILE, ACCOUNT SETTINGS & SECURITY */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            {/* ADMIN PROFILE MODAL */}
            {activeModal === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 text-blue-900 rounded-xl font-bold">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Admin Profile</h3>
                    <p className="text-xs text-gray-500">Official Revenue Officer Identity</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold">Officer Name:</span>
                    <span className="font-black text-gray-900">Smt. Priya Sharma</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold">Designation:</span>
                    <span className="font-bold text-blue-900">Tehsildar (Grade-I)</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold">Assigned Tehsil:</span>
                    <span className="font-bold text-gray-900">Mohanlalganj, Lucknow</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold">State:</span>
                    <span className="font-bold text-gray-900">Uttar Pradesh (UP)</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold">Official Phone:</span>
                    <span className="font-mono font-bold text-gray-900">+91 98765 43230</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">Aadhaar Status:</span>
                    <span className="text-emerald-700 font-bold">Verified ✅</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                >
                  Close Profile
                </button>
              </div>
            )}

            {/* ACCOUNT SETTINGS MODAL */}
            {activeModal === 'settings' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 text-indigo-900 rounded-xl font-bold">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Account Settings</h3>
                    <p className="text-xs text-gray-500">Configure Officer Portal Preferences</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">SMS Notification Alerts</p>
                      <p className="text-[11px] text-gray-500">Receive urgent mutation alerts via SMS</p>
                    </div>
                    <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-1 rounded">Enabled</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">AI OCR Verification Auto-Flag</p>
                      <p className="text-[11px] text-gray-500">Flag documents with confidence &lt; 90%</p>
                    </div>
                    <span className="text-blue-700 font-extrabold bg-blue-100 px-2 py-1 rounded">Active</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                >
                  Save & Close
                </button>
              </div>
            )}

            {/* SECURITY MODAL */}
            {activeModal === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Security & MFA</h3>
                    <p className="text-xs text-gray-500">Authentication & Session Security</p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-900">🛡️ Multi-Factor Authentication (MFA) Active</p>
                  <p className="text-emerald-700 text-[11px]">Your account is protected by salted SHA-256 JWT sessions.</p>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                >
                  Close Security Settings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-y-auto bg-gray-50 text-gray-900 font-sans">
        <WebLanguageProvider>
          <InnerLayout>{children}</InnerLayout>
        </WebLanguageProvider>
      </body>
    </html>
  );
}
