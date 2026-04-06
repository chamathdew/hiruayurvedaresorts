import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Search, Filter, Plus } from 'lucide-react';
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

    const filteredGuests = guests.filter(guest => {
        const matchesSearch = guest.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesHotel = hotelFilter === 'All' || guest.hotelBranch === hotelFilter;
        const matchesCategory = categoryFilter === 'All' || guest.applicantType === categoryFilter;
        return matchesSearch && matchesHotel && matchesCategory;
    });

    const categories = Array.from(new Set(guests.map(g => g.applicantType).filter(Boolean)));


    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">Guest Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage and track all resort guests</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto bg-[#E89102] hover:bg-[#d18102] text-white px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Guest</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="luxury-card p-4 flex flex-col items-center justify-center border-l-4 border-[#E89102]">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Guests</span>
                    <span className="text-2xl font-black text-slate-800">{guests.length}</span>
                </div>
                {categories.slice(0, 3).map((cat, idx) => (
                    <div key={cat} className="luxury-card p-4 flex flex-col items-center justify-center border-l-4 border-slate-400">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate w-full text-center">{cat || 'Regular'}</span>
                        <span className="text-2xl font-black text-slate-800">
                            {guests.filter(g => g.applicantType === cat).length}
                        </span>
                    </div>
                ))}
            </div>

            <AddGuestModal

                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onGuestAdded={fetchGuests}
            />

            <ViewGuestModal
                isOpen={!!viewModalGuest}
                onClose={() => setViewModalGuest(null)}
                guest={viewModalGuest}
            />

            <div className="luxury-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or passport..."
                            className="w-full pl-10 pr-4 py-2 border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E89102] focus:border-[#E89102] outline-none transition bg-white/30 backdrop-blur-md shadow-inner placeholder-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                className="border border-white/40 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E89102] outline-none bg-white/30 backdrop-blur-md shadow-inner text-sm"
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

                        <div className="flex items-center space-x-2">
                            <select
                                className="border border-white/40 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E89102] outline-none bg-white/30 backdrop-blur-md shadow-inner text-sm"
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
                </div>



                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 backdrop-blur-md border-y border-white/50 shadow-sm">
                                <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Guest & Contact</th>
                                <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Passport & Visa</th>
                                <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Reservation Details</th>
                                <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Remarks</th>
                                <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGuests.length > 0 ? filteredGuests.map((guest) => (
                                <tr key={guest._id} className="hover:bg-white/5 transition border-b border-white/10">
                                    <td className="py-4 px-3 sm:px-6">
                                        <p className="font-bold">{guest.fullName}</p>
                                        <p className="text-xs text-slate-500">
                                            {guest.dateOfBirth ? `DOB: ${format(new Date(guest.dateOfBirth), 'dd/MM/yyyy')} | ` : ''}
                                            {guest.contactNumber || 'No Phone'}
                                        </p>
                                        <p className="text-xs text-slate-500 max-w-[150px] truncate" title={guest.email}>{guest.email}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold">{guest.passportNumber || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">
                                            Nationality: {guest.nationality || 'N/A'}
                                        </p>
                                        <p className="text-xs font-bold text-[#E89102]">
                                            Exp: {guest.visaExpiryDate ? format(new Date(guest.visaExpiryDate), 'dd/MM/yyyy') : 'N/A'}
                                        </p>
                                    </td>
                                    <td className="py-4 px-3 sm:px-6 text-sm text-slate-400">
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="font-bold text-slate-300">{guest.hotelBranch} - Rm {guest.roomNumber || 'TBA'}</p>
                                                <p className="text-xs text-slate-500">Pax: {guest.pax}, Agent: {guest.agent || 'Direct'}</p>
                                                <p className="text-[10px] font-bold text-[#E89102] uppercase tracking-[0.1em] mt-1">{guest.applicantType || 'Regular'}</p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-slate-500">IN: {guest.arrivalDate ? format(new Date(guest.arrivalDate), 'dd/MM/yy') : '-'}</p>
                                                <p className="text-xs font-semibold text-slate-500">OUT: {guest.departureDate ? format(new Date(guest.departureDate), 'dd/MM/yy') : '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-xs text-slate-400 max-w-[150px] line-clamp-2" title={guest.remark}>
                                            {guest.remark || <span className="italic text-slate-500">No remarks</span>}
                                        </p>
                                    </td>
                                    <td className="py-4 px-3 sm:px-6 text-right">
                                        <button
                                            onClick={() => setViewModalGuest(guest)}
                                            className="text-[#E89102] font-bold hover:underline text-xs mr-4 uppercase tracking-widest"
                                        >
                                            View
                                        </button>
                                        <button className="text-slate-500 font-bold hover:underline text-xs uppercase tracking-widest">Edit</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-500">No guests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Guests;
