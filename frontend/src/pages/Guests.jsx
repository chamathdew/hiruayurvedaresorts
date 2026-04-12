import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, getMonth, getYear, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Search, Filter, Plus, User, Calendar, MapPin, Phone, Mail, ChevronLeft, ChevronRight, LayoutGrid, FileUp } from 'lucide-react';
import AddGuestModal from '../components/AddGuestModal';
import ViewGuestModal from '../components/ViewGuestModal';
import API_BASE_URL from '../config';

const Guests = () => {
    const { token } = useAuth();
    const [guests, setGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hotelFilter, setHotelFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewModalGuest, setViewModalGuest] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState('All'); // 'All' or 0-11
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);


    const fetchGuests = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/guests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuests(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        fetchGuests();
    }, [fetchGuests]);

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsImporting(true);
        try {
            await axios.post(`${API_BASE_URL}/guests/import`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Import successful! Guest list updated.');
            fetchGuests();
        } catch (err) {
            console.error('Import failed', err);
            alert('Import failed: ' + (err.response?.data || err.message));
        } finally {
            setIsImporting(false);
        }
    };

    const filteredGuests = guests.filter(guest => {
        const matchesSearch = !searchTerm || guest.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesHotel = hotelFilter === 'All' || guest.hotelBranch === hotelFilter;
        const matchesCategory = categoryFilter === 'All' || guest.applicantType === categoryFilter;
        
        let matchesDate = true;
        if (selectedYear !== 'All' || selectedMonth !== 'All') {
            if (guest.arrivalDate) {
                const arrDate = new Date(guest.arrivalDate);
                const yearMatch = selectedYear === 'All' || getYear(arrDate) === parseInt(selectedYear);
                const monthMatch = selectedMonth === 'All' || getMonth(arrDate) === parseInt(selectedMonth);
                matchesDate = yearMatch && monthMatch;
            } else {
                matchesDate = false;
            }
        }

        return matchesSearch && matchesHotel && matchesCategory && matchesDate;
    });

    const years = Array.from(new Set(guests.map(g => g.arrivalDate ? getYear(new Date(g.arrivalDate)) : null).filter(Boolean))).sort((a, b) => b - a);
    
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const categories = Array.from(new Set(guests.map(g => g.applicantType).filter(Boolean)));


    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-glass p-8 rounded-3xl gap-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-gradient-to-tr from-[#E89102] to-orange-400 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform">
                        <User className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Guest Management</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="p-1 px-3 bg-[#E89102]/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#E89102] border border-[#E89102]/20">
                                {filteredGuests.length} Guests Displayed
                            </span>
                            <span className="text-xs text-slate-500 font-medium italic hidden sm:inline">Directory of all resort visitors</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept=".xlsx, .xls"
                        onChange={handleImportExcel}
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isImporting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white/40 backdrop-blur-xl border border-[#E89102]/30 text-[#E89102] px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E89102]/10 transition-all disabled:opacity-50"
                    >
                        {isImporting ? <Calendar className="animate-bounce" size={16} /> : <FileUp size={16} />}
                        {isImporting ? 'Syncing...' : 'Sync with Excel'}
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-gradient-to-r from-[#E89102] to-[#d18102] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Guest
                    </button>
                    
                    <div className="flex items-center bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 shadow-sm">
                        <LayoutGrid className="w-4 h-4 text-[#E89102] mr-3" />
                        <div className="text-left">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Database</p>
                            <p className="text-sm font-black text-slate-700">{guests.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="luxury-card p-6 lg:p-10 space-y-8 min-h-[600px]">
                {/* Advanced Search & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E89102] transition-colors w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Find by name or passport..."
                            className="w-full pl-12 pr-4 py-4 bg-white/40 border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#E89102] focus:border-transparent outline-none transition-all placeholder-slate-500 font-bold text-slate-800 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Date Filters */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            <select
                                className="w-full pl-9 pr-4 py-4 bg-white/40 border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#E89102] outline-none transition-all font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="All">All Years</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="relative flex-[1.5]">
                            <select
                                className="w-full px-4 py-4 bg-white/40 border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#E89102] outline-none transition-all font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="All">All Months</option>
                                {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Hotel Filter */}
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#E89102] transition-colors w-5 h-5" />
                        <select
                            className="w-full pl-12 pr-8 py-4 bg-white/40 border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#E89102] outline-none transition-all font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                            value={hotelFilter}
                            onChange={(e) => setHotelFilter(e.target.value)}
                        >
                            <option value="All">All Hotels</option>
                            <option value="Hiru Villa">Hiru Villa</option>
                            <option value="Hiru Om">Hiru Om</option>
                            <option value="Hiru Mudhra">Hiru Mudhra</option>
                            <option value="Hiru Aadya">Hiru Aadya</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#E89102] transition-colors w-5 h-5" />
                        <select
                            className="w-full pl-12 pr-8 py-4 bg-white/40 border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#E89102] outline-none transition-all font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1500px]">
                            <thead>
                                <tr className="bg-slate-900/5 border-b border-white/10">
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Name of the Expatriate</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Country</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Passport Number</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Date of Arrival</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Visa Expiry</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Applicant Type</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Sponsored By</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Birth Date</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Email Address</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Telephone No</th>
                                    <th className="py-6 px-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-right sticky right-0 bg-white/20 backdrop-blur-md">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredGuests.length > 0 ? filteredGuests.map((guest) => {
                                    const cleanName = (name) => name?.includes('/') ? name.split('/').pop().trim() : name;
                                    return (
                                        <tr key={guest._id} className="group hover:bg-white/[0.1] transition-all duration-300">
                                            <td className="py-5 px-6">
                                                <p className="text-sm font-black text-slate-800 tracking-wide">{cleanName(guest.fullName)}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{guest.nationality || '—'}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-xs font-black text-slate-500 font-mono tracking-widest uppercase">{guest.passportNumber || '—'}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-xs font-black text-slate-700">{guest.arrivalDate ? format(new Date(guest.arrivalDate), 'dd/MM/yyyy') : '—'}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className={`text-xs font-black p-1 px-2 rounded-lg inline-block ${guest.visaExpiryDate ? 'bg-orange-500/10 text-orange-500' : 'text-slate-400'}`}>
                                                    {guest.visaExpiryDate ? format(new Date(guest.visaExpiryDate), 'dd/MM/yyyy') : '—'}
                                                </p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-[10px] font-black p-1 px-3 bg-slate-900/5 rounded-full text-slate-500 uppercase tracking-widest">
                                                    {guest.applicantType || 'Regular'}
                                                </p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{guest.agent || 'Direct'}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-xs font-bold text-slate-500">{guest.dateOfBirth ? format(new Date(guest.dateOfBirth), 'dd/MM/yyyy') : '—'}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-xs font-medium text-slate-500 lowercase">{guest.email || '—'}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-xs font-black text-slate-600">{guest.contactNumber || '—'}</p>
                                            </td>
                                            <td className="py-5 px-6 text-right sticky right-0 bg-white/20 backdrop-blur-md">
                                                <button
                                                    onClick={() => setViewModalGuest(guest)}
                                                    className="p-3 bg-white/20 hover:bg-[#E89102] text-slate-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="11" className="py-40 text-center">
                                            <div className="space-y-4">
                                                <div className="h-20 w-20 bg-slate-900/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search size={32} className="text-slate-300" />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">No Guests Found</p>
                                                <button 
                                                    onClick={() => {setSearchTerm(''); setHotelFilter('All'); setSelectedYear('All'); setSelectedMonth('All');}}
                                                    className="text-[10px] font-black uppercase tracking-widest text-[#E89102] hover:underline"
                                                >
                                                    Clear all filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pt-4 flex justify-center">
                    <p className="px-5 py-2 bg-white/20 rounded-full text-[9px] uppercase tracking-[0.3em] font-black text-slate-500 border border-white/40">
                        Total {filteredGuests.length} Records Found
                    </p>
                </div>
            </div>

            {/* Modals */}
            <AddGuestModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchGuests} />
            {viewModalGuest && (
                <ViewGuestModal 
                    guest={viewModalGuest} 
                    isOpen={!!viewModalGuest} 
                    onClose={() => setViewModalGuest(null)} 
                    onUpdate={fetchGuests}
                    onDelete={fetchGuests}
                />
            )}
        </div>
    );
};

export default Guests;
