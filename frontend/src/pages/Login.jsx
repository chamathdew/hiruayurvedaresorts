import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
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
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-[#f28c00] p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Hiru Resorts</h1>
                    <p className="text-white/80">Management System</p>
                </div>
                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Sign In</h2>
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f28c00] focus:border-[#f28c00] outline-none transition"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f28c00] focus:border-[#f28c00] outline-none transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-[#f28c00] hover:bg-[#e07b00] text-white rounded-xl font-semibold transition"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
