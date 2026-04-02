import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Shield, User, Palette } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="luxury-card p-6">
                <div className="flex items-center space-x-3 mb-1">
                    <div className="p-2 bg-[#E89102]/20 rounded-xl">
                        <Palette className="w-6 h-6 text-[#E89102]" />
                    </div>
                    <h1 className="text-2xl font-bold settings-title">Settings</h1>
                </div>
                <p className="settings-subtitle ml-14 text-sm">Manage your preferences</p>
            </div>

            {/* User Info */}
            <div className="luxury-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <User className="w-5 h-5 text-[#E89102]" />
                    <h2 className="text-lg font-semibold settings-title">Account</h2>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b settings-border">
                        <span className="settings-label text-sm font-medium">Username</span>
                        <span className="settings-value text-sm font-semibold">{user?.username}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b settings-border">
                        <span className="settings-label text-sm font-medium">Role</span>
                        <span className="px-3 py-1 bg-[#E89102]/20 text-[#E89102] rounded-full text-xs font-semibold">{user?.role}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="settings-label text-sm font-medium">Branch</span>
                        <span className="settings-value text-sm font-semibold">{user?.hotelBranch}</span>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="luxury-card p-6">
                <div className="flex items-center space-x-3 mb-6">
                    {isDark ? <Moon className="w-5 h-5 text-[#E89102]" /> : <Sun className="w-5 h-5 text-[#E89102]" />}
                    <h2 className="text-lg font-semibold settings-title">Appearance</h2>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-4 settings-option-bg rounded-xl">
                    <div className="flex items-center space-x-4">
                        {/* Dark preview */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-slate-800 ring-2 ring-[#E89102]' : 'bg-slate-200'}`}>
                            <Moon className={`w-5 h-5 ${isDark ? 'text-[#E89102]' : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <p className="settings-title font-semibold text-sm">
                                {isDark ? 'Dark Mode' : 'White Mode'}
                            </p>
                            <p className="settings-subtitle text-xs">
                                {isDark ? 'Dark background, easy on the eyes' : 'Bright, clean white background'}
                            </p>
                        </div>
                        {/* White preview */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${!isDark ? 'bg-white ring-2 ring-[#E89102] shadow-md' : 'bg-slate-100/20'}`}>
                            <Sun className={`w-5 h-5 ${!isDark ? 'text-[#E89102]' : 'text-slate-500'}`} />
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                        onClick={toggleTheme}
                        id="theme-toggle"
                        className={`relative inline-flex items-center w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E89102] focus:ring-offset-2 ${isDark ? 'bg-slate-700' : 'bg-[#E89102]'}`}
                    >
                        <span
                            className={`inline-block w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${isDark ? 'translate-x-1' : 'translate-x-9'}`}
                        />
                        <Moon className={`absolute left-1.5 w-3 h-3 text-slate-300 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`} />
                        <Sun className={`absolute right-1.5 w-3 h-3 text-white transition-opacity duration-300 ${!isDark ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                </div>

                {/* Mode Cards */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                        onClick={() => isDark && toggleTheme()}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${!isDark ? 'border-[#E89102] bg-[#E89102]/10' : 'settings-card-inactive border-transparent'}`}
                    >
                        <Sun className={`w-5 h-5 mb-2 ${!isDark ? 'text-[#E89102]' : 'text-slate-400'}`} />
                        <p className={`text-sm font-semibold ${!isDark ? 'text-[#E89102]' : 'text-slate-400'}`}>White Mode</p>
                        <p className="text-xs text-slate-400 mt-1">Clean & bright</p>
                    </button>
                    <button
                        onClick={() => !isDark && toggleTheme()}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${isDark ? 'border-[#E89102] bg-[#E89102]/10' : 'settings-card-inactive border-transparent'}`}
                    >
                        <Moon className={`w-5 h-5 mb-2 ${isDark ? 'text-[#E89102]' : 'text-slate-400'}`} />
                        <p className={`text-sm font-semibold ${isDark ? 'text-[#E89102]' : 'text-slate-400'}`}>Dark Mode</p>
                        <p className="text-xs text-slate-400 mt-1">Easy on eyes</p>
                    </button>
                </div>
            </div>

            {/* Admin Note */}
            {user?.role === 'Admin' && (
                <div className="luxury-card p-4 border border-[#E89102]/30">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-[#E89102]" />
                        <p className="text-sm text-[#E89102] font-medium">Admin Access — Full system privileges enabled</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
