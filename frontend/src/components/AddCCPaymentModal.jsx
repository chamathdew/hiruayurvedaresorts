import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { X, Calendar, CreditCard, Landmark } from 'lucide-react';
import PropTypes from 'prop-types';
import API_BASE_URL from '../config';

const AddCCPaymentModal = ({ isOpen, onClose, onPaymentAdded }) => {
    const { token, user } = useAuth();
    const { theme } = useTheme();
    const { addToast } = useToast();
    const isDark = theme === 'dark';
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        invoiceNo: '',
        bank: 'HNB',
        paymentAmount: '',
        commission: 0,
        totalAmount: 0,
        hotelBranch: user?.hotelBranch !== 'All' ? user?.hotelBranch : 'Hiru Villa'
    });

    // Auto-calculate commission and total whenever payment amount changes
    useEffect(() => {
        const amount = parseFloat(formData.paymentAmount) || 0;
        const commission = amount * 0.03; // 3% commission
        const total = amount - commission;

        setFormData(prev => ({
            ...prev,
            commission: commission.toFixed(2),
            totalAmount: total.toFixed(2)
        }));
    }, [formData.paymentAmount]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const submitData = {
                ...formData,
                paymentAmount: Number(formData.paymentAmount),
                commission: Number(formData.commission),
                totalAmount: Number(formData.totalAmount)
            };

            await axios.post(`${API_BASE_URL}/cc-payments`, submitData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            addToast(`CC Payment added successfully for In No: ${formData.invoiceNo}`, 'success');
            
            onPaymentAdded();
            onClose();
            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                invoiceNo: '',
                bank: 'HNB',
                paymentAmount: '',
                commission: 0,
                totalAmount: 0,
                hotelBranch: user?.hotelBranch !== 'All' ? user?.hotelBranch : 'Hiru Villa'
            });
        } catch (err) {
            console.error('Failed to add CC payment', err);
            const errMsg = err.response?.data?.message || err.response?.data || err.message;
            addToast(`Failed to add payment: ${errMsg}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = `w-full px-4 py-2 rounded-lg outline-none transition border ${
        isDark 
            ? 'bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-[#E89102] placeholder-slate-500' 
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#E89102] placeholder-slate-400'
    }`;

    const labelClasses = `text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <div className={`border rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white/80 backdrop-blur-3xl border-white/50'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-white/30 bg-white/20'}`}>
                    <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-[#E89102]" />
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Add CC Payment</h3>
                    </div>
                    <button onClick={onClose} className={`transition p-2 rounded-full ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Date</label>
                        <div className="relative">
                            <input type="date" name="date" required value={formData.date} onChange={handleChange} className={`${inputClasses} pl-10`} />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Invoice No (In No)</label>
                        <input type="text" name="invoiceNo" required value={formData.invoiceNo} onChange={handleChange} className={inputClasses} placeholder="e.g. 904" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Bank</label>
                            <div className="relative">
                                <select name="bank" required value={formData.bank} onChange={handleChange} className={`${inputClasses} pl-10 appearance-none`}>
                                    <option value="HNB">HNB</option>
                                    <option value="NTB">NTB</option>
                                </select>
                                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Hotel Branch</label>
                            <select 
                                name="hotelBranch" 
                                required 
                                value={formData.hotelBranch} 
                                onChange={handleChange} 
                                disabled={user?.role !== 'Admin'}
                                className={`${inputClasses} ${user?.role !== 'Admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <option value="Hiru Villa">Hiru Villa</option>
                                <option value="Hiru Om">Hiru Om</option>
                                <option value="Hiru Mudhra">Hiru Mudhra</option>
                                <option value="Hiru Aadya">Hiru Aadya</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Payment Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">Rs.</span>
                            <input type="number" step="0.01" name="paymentAmount" required value={formData.paymentAmount} onChange={handleChange} className={`${inputClasses} pl-10 font-bold ${isDark ? 'text-[#E89102]' : 'text-[#E89102]'}`} placeholder="0.00" />
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl space-y-2 border shadow-inner ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Commission (3%)</span>
                            <span className="font-semibold text-red-500">- Rs. {formData.commission}</span>
                        </div>
                        <div className={`flex justify-between text-sm sm:text-base font-bold border-t pt-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Total Settlement</span>
                            <span className="text-green-500">Rs. {formData.totalAmount}</span>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl font-semibold transition border ${isDark ? 'text-slate-300 border-slate-700 hover:bg-slate-800' : 'text-slate-700 border-slate-200 hover:bg-slate-100'}`}>Cancel</button>
                        <button type="submit" disabled={isLoading} className="flex-[2] py-2.5 bg-[#E89102] hover:bg-[#d18102] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition disabled:opacity-70">
                            {isLoading ? 'Saving...' : 'Save Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddCCPaymentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onPaymentAdded: PropTypes.func.isRequired
};

export default AddCCPaymentModal;
