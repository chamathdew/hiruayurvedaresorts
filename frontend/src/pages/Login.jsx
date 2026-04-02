import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';
import API_BASE_URL from '../config';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
            login(res.data, res.data.token);
            navigate('/');
        } catch (err) {
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    setError(err.response.data);
                } else if (err.response.data.message) {
                    setError(err.response.data.message);
                } else if (Object.keys(err.response.data).length === 0) {
                    setError("Database connection failed. Please check your network or MongoDB IP Whitelist.");
                } else {
                    setError(JSON.stringify(err.response.data));
                }
            } else {
                setError("Something went wrong with the server connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen animated-bg flex justify-center items-center p-4">
            <div className="w-full max-w-md bg-glass rounded-3xl p-8 sm:p-10 relative overflow-hidden">
                {/* Decorative blob shapes inside the card for extra depth */}
                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-orange-400/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <img src={logo} alt="Hiru Ayurveda Resorts Logo" className="h-24 w-auto drop-shadow-lg transform transition-transform hover:scale-105 rounded-xl brightness-110" />
                    </div>

                    {error && (
                        <div className="bg-red-50/10 border border-red-200/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center justify-center text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest text-[10px]">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-[#E89102] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#E89102] focus:border-transparent outline-none transition-all placeholder-slate-600 font-medium text-white shadow-sm"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest text-[10px]">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-[#E89102] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#E89102] focus:border-transparent outline-none transition-all placeholder-slate-600 font-medium text-white shadow-sm"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#E89102] to-[#d18102] hover:from-[#d18102] hover:to-[#E89102] text-white rounded-xl font-black text-lg shadow-xl shadow-orange-500/10 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
