import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, UserCircle } from 'lucide-react';

const Layout = () => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-6 bg-white border-b border-slate-200">
                    <div>
                        {/* Title text moved to Sidebar */}
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="text-slate-400 hover:text-[#f28c00] transition">
                            <Bell className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-700">{user?.username}</p>
                                <p className="text-xs text-slate-500">{user?.role} - {user?.hotelBranch}</p>
                            </div>
                            <UserCircle className="w-10 h-10 text-slate-400" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
