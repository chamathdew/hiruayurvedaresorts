import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserCircle, Menu, X } from 'lucide-react';

const Layout = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={`flex h-screen overflow-hidden ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isDark ? '' : 'backdrop-blur-sm bg-white/20'}`}>
                <header className={`flex justify-between items-center p-4 lg:p-6 border-b z-10 sticky top-0 header-bg ${isDark ? '' : 'backdrop-blur-md'}`}>
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className={`p-2 mr-2 sm:mr-4 rounded-lg lg:hidden transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <h1 className={`text-lg font-bold lg:hidden drop-shadow-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Hiru Resorts</h1>
                    </div>

                    <div className="flex items-center space-x-3 lg:space-x-6">
                        <div className="hidden sm:block">
                            <NotificationDropdown />
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-3">
                            <div className="text-right hidden sm:block">
                                <p className={`text-sm font-bold drop-shadow-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.username}</p>
                                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.role} - {user?.hotelBranch}</p>
                            </div>
                            <UserCircle className={`w-8 h-8 lg:w-10 lg:h-10 drop-shadow-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
