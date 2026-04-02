import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';
import { Search, Filter, Plus, CreditCard, Landmark, Trash2 } from 'lucide-react';
import AddCCPaymentModal from '../components/AddCCPaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import API_BASE_URL from '../config';

const CCPayments = () => {
    const { token, user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hotelFilter, setHotelFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/cc-payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(res.data);
        } catch (err) {
            console.error('Failed to fetch CC payments', err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payment record?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/cc-payments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPayments();
        } catch (err) {
            console.error('Failed to delete payment', err);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesHotel = hotelFilter === 'All' || payment.hotelBranch === hotelFilter;
        return matchesSearch && matchesHotel;
    });

    const tableHeaderClasses = `border py-3 px-4 text-center align-middle font-bold text-xs uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-300 bg-slate-800/50' : 'border-slate-300 text-slate-700 bg-slate-100'}`;
    const tableSubHeaderClasses = `border py-2 px-4 text-center text-[10px] font-black uppercase ${isDark ? 'border-slate-700 text-slate-400 bg-slate-800/30' : 'border-slate-200 text-slate-600 bg-slate-50'}`;
    const tableCellClasses = `border py-3 px-4 text-sm ${isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-700'}`;

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className={`text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        <CreditCard className="w-8 h-8 text-[#E89102]" />
                        CC Payment Records
                    </h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Daily credit card settlement tracking per branch</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto bg-[#E89102] hover:bg-[#d18102] text-white px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add CC Payment</span>
                </button>
            </div>

            <AddCCPaymentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onPaymentAdded={fetchPayments}
            />

            <div className={`luxury-card p-6 ${isDark ? 'bg-slate-900/40 border-slate-800 shadow-xl shadow-black/20' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 text-white">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Invoice No..."
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E89102] outline-none transition bg-white/10 backdrop-blur-md shadow-inner placeholder-slate-500 ${isDark ? 'border-slate-700 text-white' : 'border-white/40 text-slate-700'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                className={`border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E89102] outline-none transition bg-white/10 backdrop-blur-md shadow-inner ${isDark ? 'border-slate-700 text-white' : 'border-white/40 text-slate-700'}`}
                                value={hotelFilter}
                                onChange={(e) => setHotelFilter(e.target.value)}
                            >
                                <option value="All" className={isDark ? 'bg-slate-900' : 'bg-white'}>All Hotels</option>
                                <option value="Hiru Villa" className={isDark ? 'bg-slate-900' : 'bg-white'}>Hiru Villa</option>
                                <option value="Hiru Om" className={isDark ? 'bg-slate-900' : 'bg-white'}>Hiru Om</option>
                                <option value="Hiru Mudhra" className={isDark ? 'bg-slate-900' : 'bg-white'}>Hiru Mudhra</option>
                                <option value="Hiru Aadya" className={isDark ? 'bg-slate-900' : 'bg-white'}>Hiru Aadya</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto ring-1 ring-slate-800 rounded-xl min-h-[400px] flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center py-20">
                            <LoadingSpinner size="lg" message="Fetching payment records..." />
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th rowSpan="2" className={tableHeaderClasses}>Date</th>
                                    <th rowSpan="2" className={tableHeaderClasses}>In No</th>
                                    <th colSpan="2" className={tableHeaderClasses}>Payment</th>
                                    <th colSpan="2" className={tableHeaderClasses}>Commission (3%)</th>
                                    <th colSpan="2" className={tableHeaderClasses}>Total Settlement</th>
                                    {user?.role === 'Admin' && <th rowSpan="2" className={tableHeaderClasses}>Action</th>}
                                </tr>
                                <tr>
                                    <th className={tableSubHeaderClasses}>HNB</th>
                                    <th className={tableSubHeaderClasses}>NTB</th>
                                    <th className={tableSubHeaderClasses}>HNB</th>
                                    <th className={tableSubHeaderClasses}>NTB</th>
                                    <th className={tableSubHeaderClasses}>HNB</th>
                                    <th className={tableSubHeaderClasses}>NTB</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/10">
                                {filteredPayments.length > 0 ? filteredPayments.map((p) => (
                                    <tr key={p._id} className={`transition text-sm ${isDark ? 'hover:bg-white/5' : 'hover:bg-amber-50/30'}`}>
                                        <td className={`${tableCellClasses} text-center font-medium`}>
                                            {p.date ? format(new Date(p.date), 'dd.MM.yyyy') : '-'}
                                            <div className="text-[10px] text-slate-500 font-normal uppercase tracking-tighter">
                                                {p.hotelBranch}
                                            </div>
                                        </td>
                                        <td className={`${tableCellClasses} text-center font-bold`}>{p.invoiceNo}</td>
                                        
                                        <td className={`${tableCellClasses} text-right font-mono`}>
                                            {p.bank === 'HNB' ? p.paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                        <td className={`${tableCellClasses} text-right font-mono`}>
                                            {p.bank === 'NTB' ? p.paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                        </td>

                                        <td className={`${tableCellClasses} text-right font-mono text-red-500`}>
                                            {p.bank === 'HNB' ? p.commission.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                        <td className={`${tableCellClasses} text-right font-mono text-red-500`}>
                                            {p.bank === 'NTB' ? p.commission.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                        </td>

                                        <td className={`${tableCellClasses} text-right font-mono font-bold text-green-500`}>
                                            {p.bank === 'HNB' ? p.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                        <td className={`${tableCellClasses} text-right font-mono font-bold text-green-500`}>
                                            {p.bank === 'NTB' ? p.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                        </td>

                                        {user?.role === 'Admin' && (
                                            <td className={`${tableCellClasses} text-center`}>
                                                <button 
                                                    onClick={() => handleDelete(p._id)}
                                                    className={`p-2 transition-colors rounded-lg flex mx-auto ${isDark ? 'text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-900/30' : 'text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50'}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={user?.role === 'Admin' ? 9 : 8} className={`py-12 text-center text-sm italic ${isDark ? 'text-slate-500 bg-slate-800/20' : 'text-slate-500 bg-slate-50'}`}>
                                            No CC payment records found. Add your first entry!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {filteredPayments.length > 0 && (
                                <tfoot>
                                    <tr className={`font-bold border-t-2 ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100/80 border-slate-300'}`}>
                                        <td colSpan="2" className={`border py-3 px-4 text-center uppercase tracking-widest text-[10px] ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>Total</td>
                                        <td className={`${tableCellClasses} text-right`}>{filteredPayments.filter(p => p.bank === 'HNB').reduce((acc, c) => acc + c.paymentAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className={`${tableCellClasses} text-right`}>{filteredPayments.filter(p => p.bank === 'NTB').reduce((acc, c) => acc + c.paymentAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className={`${tableCellClasses} text-right`}>{filteredPayments.filter(p => p.bank === 'HNB').reduce((acc, c) => acc + c.commission, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className={`${tableCellClasses} text-right`}>{filteredPayments.filter(p => p.bank === 'NTB').reduce((acc, c) => acc + c.commission, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className={`${tableCellClasses} text-right text-green-500`}>{filteredPayments.filter(p => p.bank === 'HNB').reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className={`${tableCellClasses} text-right text-green-500`}>{filteredPayments.filter(p => p.bank === 'NTB').reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        {user?.role === 'Admin' && <td className={tableCellClasses}></td>}
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    )}
                </div>
                
                {!isLoading && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`p-4 rounded-xl border flex items-center space-x-4 shadow-lg ${isDark ? 'bg-slate-800/40 border-slate-700 shadow-black/20' : 'bg-orange-50/50 border-orange-100'}`}>
                            <div className="p-3 bg-[#E89102] text-white rounded-lg shadow-md">
                                <Landmark className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>HNB Total Balance</p>
                                <h4 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Rs. {filteredPayments.filter(p => p.bank === 'HNB').reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </h4>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl border flex items-center space-x-4 shadow-lg ${isDark ? 'bg-slate-800/40 border-slate-700 shadow-black/20' : 'bg-orange-50/50 border-orange-100'}`}>
                            <div className="p-3 bg-[#E89102] text-white rounded-lg shadow-md">
                                <Landmark className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>NTB Total Balance</p>
                                <h4 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Rs. {filteredPayments.filter(p => p.bank === 'NTB').reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </h4>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl border flex items-center space-x-4 shadow-lg ${isDark ? 'bg-slate-800/40 border-slate-700 shadow-black/20' : 'border-orange-100 bg-[#E89102]/5'}`}>
                            <div className="p-3 bg-[#E89102] text-white rounded-lg shadow-md">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#E89102]/70' : 'text-slate-500'}`}>Grand Total Settlement</p>
                                <h4 className={`text-xl font-black ${isDark ? 'text-[#E89102]' : 'text-[#E89102]'}`}>
                                    Rs. {filteredPayments.reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </h4>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CCPayments;
