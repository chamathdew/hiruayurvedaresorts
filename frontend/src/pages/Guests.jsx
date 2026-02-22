import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Search, Filter, Plus } from 'lucide-react';
import AddGuestModal from '../components/AddGuestModal';
import ViewGuestModal from '../components/ViewGuestModal';

const Guests = () => {
    const { token } = useAuth();
    const [guests, setGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hotelFilter, setHotelFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewModalGuest, setViewModalGuest] = useState(null);

    const fetchGuests = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/guests', {
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
        return matchesSearch && matchesHotel;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Guest Management</h2>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#f28c00] hover:bg-[#e07b00] text-white px-6 py-3 rounded-xl font-semibold transition flex items-center space-x-2 shadow-lg shadow-orange-500/30"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Guest</span>
                </button>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or passport..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#f28c00] focus:border-[#f28c00] outline-none transition bg-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                className="border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#f28c00] outline-none bg-slate-50"
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
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-200">
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Guest & Contact</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Passport & Visa</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Reservation Details</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Remarks</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGuests.length > 0 ? filteredGuests.map((guest) => (
                                <tr key={guest._id} className="hover:bg-slate-50/50 transition">
                                    <td className="py-4 px-6">
                                        <p className="font-semibold text-slate-800">{guest.fullName}</p>
                                        <p className="text-xs text-slate-500">
                                            {guest.dateOfBirth ? `DOB: ${format(new Date(guest.dateOfBirth), 'dd/MM/yyyy')} | ` : ''}
                                            {guest.contactNumber || 'No Phone'}
                                        </p>
                                        <p className="text-xs text-slate-500 max-w-[150px] truncate" title={guest.email}>{guest.email}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-medium text-slate-800">{guest.passportNumber || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">
                                            Nationality: {guest.nationality || 'N/A'}
                                        </p>
                                        <p className="text-xs text-slate-500 text-[#f28c00]">
                                            Exp: {guest.visaExpiryDate ? format(new Date(guest.visaExpiryDate), 'dd/MM/yyyy') : 'N/A'}
                                        </p>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-600">
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="font-medium text-slate-800">{guest.hotelBranch} - Rm {guest.roomNumber || 'TBA'}</p>
                                                <p className="text-xs text-slate-500">Pax: {guest.pax}, Agent: {guest.agent || 'Direct'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600">IN: {guest.arrivalDate ? format(new Date(guest.arrivalDate), 'dd/MM/yy') : '-'}</p>
                                                <p className="text-xs font-semibold text-slate-600">OUT: {guest.departureDate ? format(new Date(guest.departureDate), 'dd/MM/yy') : '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-xs text-slate-600 max-w-[150px] line-clamp-2" title={guest.remark}>
                                            {guest.remark || <span className="italic text-slate-400">No remarks</span>}
                                        </p>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => setViewModalGuest(guest)}
                                            className="text-blue-600 font-medium hover:underline text-sm mr-4"
                                        >
                                            View
                                        </button>
                                        <button className="text-slate-600 font-medium hover:underline text-sm">Edit</button>
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
