import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Moon, Sun, Shield, User, Palette, Lock, Camera, Save, Globe } from 'lucide-react';
import API_BASE_URL from '../config';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, token, updateUser } = useAuth();
    const { showToast } = useToast();
    const isDark = theme === 'dark';

    const [isLoading, setIsLoading] = useState(false);
    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        password: '',
        confirmPassword: ''
    });

    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
            return showToast("Passwords don't match!", "error");
        }

        setIsLoading(true);
        try {
            const updates = { 
                username: profileForm.username,
                password: profileForm.password || undefined
            };
            const res = await axios.put(`${API_BASE_URL}/auth/profile/${user.id || user._id}`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateUser(res.data);
            showToast("Profile updated successfully!");
            setProfileForm({ ...profileForm, password: '', confirmPassword: '' });
        } catch (err) {
            showToast("Failed to update profile", "error");
        } finally {
            setIsLoading(false);
        }
    };


    const HOTELS = ['Hiru Villa', 'Hiru Om', 'Hiru Mudhra', 'Hiru Aadya'];
    
    const [systemOptions, setSystemOptions] = useState(() => {
        return JSON.parse(localStorage.getItem('systemOptions')) || [
            { id: 1, name: 'CC Payments Access', enabledHotels: ['Hiru Villa', 'Hiru Om'] },
            { id: 2, name: 'Belegungsplan Editing', enabledHotels: ['Hiru Aadya'] }
        ];
    });
    const [newOption, setNewOption] = useState('');

    const toggleHotelOption = (optionId, hotel) => {
        const newOptions = systemOptions.map(opt => {
            if (opt.id === optionId) {
                const enabled = opt.enabledHotels.includes(hotel);
                return {
                    ...opt,
                    enabledHotels: enabled 
                        ? opt.enabledHotels.filter(h => h !== hotel)
                        : [...opt.enabledHotels, hotel]
                };
            }
            return opt;
        });
        setSystemOptions(newOptions);
        localStorage.setItem('systemOptions', JSON.stringify(newOptions));
        showToast("Access updated successfully");
    };

    const addOption = () => {
        if (!newOption.trim()) return;
        const newOptions = [
            ...systemOptions,
            { id: Date.now(), name: newOption, enabledHotels: [] }
        ];
        setSystemOptions(newOptions);
        localStorage.setItem('systemOptions', JSON.stringify(newOptions));
        setNewOption('');
        showToast("New option created");
    };

    const removeOption = (id) => {
        if(!window.confirm("Delete this option?")) return;
        const newOptions = systemOptions.filter(o => o.id !== id);
        setSystemOptions(newOptions);
        localStorage.setItem('systemOptions', JSON.stringify(newOptions));
        showToast("Option deleted");
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            setIsLoading(true);
            try {
                const res = await axios.put(`${API_BASE_URL}/auth/profile/${user.id || user._id}`, { profilePicture: base64String }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                updateUser(res.data);
                showToast("Profile picture updated!");
            } catch (err) {
                showToast("Failed to upload image", "error");
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom duration-500">
            {/* Page Header */}
            <div className="flex justify-between items-center bg-glass p-8 rounded-3xl">
                <div>
                    <h1 className="text-3xl font-black text-gradient mb-2">Settings</h1>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Customize your system experience and security</p>
                </div>
                <div className="p-4 bg-[#E89102]/20 rounded-3xl">
                    <Palette className="w-8 h-8 text-[#E89102]" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Profile & Security Section (Left) */}
                <div className="lg:col-span-6 space-y-8">
                    
                    {/* User Profile Card */}
                    <div className="luxury-card overflow-hidden">
                        <div className="p-8 space-y-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 border-b pb-8 settings-border">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-[#E89102]/20 bg-slate-100 flex items-center justify-center">
                                        {user?.profilePicture ? (
                                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-16 h-16 text-[#E89102]/40" />
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 p-2 bg-[#E89102] text-white rounded-xl cursor-pointer hover:scale-110 transition shadow-xl ring-4 ring-white/10">
                                        <Camera className="w-5 h-5" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.username}</h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                                        <span className="px-4 py-1 bg-[#E89102]/20 text-[#E89102] rounded-full text-xs font-black uppercase tracking-widest border border-[#E89102]/30">
                                            {user?.role}
                                        </span>
                                        <span className={`px-4 py-1 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'} rounded-full text-xs font-black border border-white/5`}>
                                            {user?.hotelBranch}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Edit Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input 
                                            name="username" value={profileForm.username} onChange={handleProfileChange}
                                            className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition focus:ring-4 focus:ring-[#E89102]/20 focus:border-[#E89102] font-semibold text-sm ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Security</label>
                                    <div className="flex gap-4">
                                        <button type="submit" disabled={isLoading} className="flex-1 py-3 px-4 bg-[#E89102] hover:bg-[#d18102] text-white rounded-2xl font-black transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50">
                                            {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
                                        </button>
                                    </div>
                                </div>
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">New Password</label>
                                        <input type="password" name="password" value={profileForm.password} onChange={handleProfileChange} className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Confirm Password</label>
                                        <input type="password" name="confirmPassword" value={profileForm.confirmPassword} onChange={handleProfileChange} className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-white" />
                                    </div>
                                </>
                            </form>
                        </div>
                    </div>

                    {/* Appearance Card */}
                    <div className="luxury-card p-8 space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-[#E89102]/10 rounded-2xl">
                                {isDark ? <Moon className="w-6 h-6 text-[#E89102]" /> : <Sun className="w-6 h-6 text-[#E89102]" />}
                            </div>
                            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Appearance</h3>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className={`w-full p-4 rounded-3xl border-2 flex items-center justify-between transition group ${isDark ? 'border-[#E89102] bg-[#E89102]/5' : 'border-slate-200 hover:border-[#E89102] hover:bg-[#E89102]/5'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${isDark ? 'bg-slate-800' : 'bg-slate-100 group-hover:bg-white'}`}>
                                    {isDark ? <Moon className="text-[#E89102]" /> : <Sun className="text-slate-400" />}
                                </div>
                                <div className="text-left">
                                    <p className={`font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Current Mode</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">{isDark ? 'Dark / High Contrast' : 'White / Clean'}</p>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 border-[#E89102] flex items-center justify-center`}>
                                <div className="w-3 h-3 bg-[#E89102] rounded-full"></div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Area: System Controls */}
                <div className="lg:col-span-6 space-y-8">
                    {/* System Controls (Admin Only) */}
                    { user?.role === 'Admin' && (
                        <div className="luxury-card p-8 space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-[#E89102]/10 rounded-2xl">
                                    <Shield className="w-6 h-6 text-[#E89102]" />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>System Access Options</h3>
                                    <p className="text-xs text-[#E89102] font-bold uppercase tracking-wider">Manage access across hotels</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mb-4">
                                <input 
                                    value={newOption}
                                    onChange={e => setNewOption(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addOption()}
                                    placeholder="E.g. Advanced Reports, Belegungsplan Access..."
                                    className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none border transition ${isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-[#E89102]' : 'bg-white border-slate-200 text-slate-800 focus:border-[#E89102]'}`}
                                />
                                <button onClick={addOption} className="bg-[#E89102] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#d18102]">
                                    Add Option
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {systemOptions.map(opt => (
                                    <div key={opt.id} className={`p-4 rounded-2xl border ${isDark ? 'bg-glass border-white/5' : 'bg-white border-slate-200'} space-y-3`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{opt.name}</span>
                                            <button onClick={() => removeOption(opt.id)} className="text-red-500 hover:text-red-600 text-xs font-bold underline">Remove</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {HOTELS.map(hotel => {
                                                const enabled = opt.enabledHotels.includes(hotel);
                                                return (
                                                    <div key={hotel} 
                                                        onClick={() => toggleHotelOption(opt.id, hotel)}
                                                        className={`cursor-pointer px-3 py-2 rounded-xl border flex items-center justify-between transition-all ${enabled ? 'bg-[#E89102]/10 border-[#E89102]/30' : isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                                                    >
                                                        <span className={`text-xs font-bold ${enabled ? 'text-[#E89102]' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>{hotel}</span>
                                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${enabled ? 'bg-[#E89102]' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}>
                                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${enabled ? 'left-4.5 right-0.5' : 'left-0.5'}`}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
