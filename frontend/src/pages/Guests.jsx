import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Search, Filter, Plus } from 'lucide-react';

const Guests = () => {
    const { token, user } = useAuth();
    const [guests, setGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hotelFilter, setHotelFilter] = useState('All');

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/guests', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setGuests(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchGuests();
    }, [token]);

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
                <button className="bg-[#f28c00] hover:bg-[#e07b00] text-white px-6 py-3 rounded-xl font-semibold transition flex items-center space-x-2 shadow-lg shadow-orange-500/30">
                    <Plus className="w-5 h-5" />
                    <span>Add New Guest</span>
                </button>
            </div>

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
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Guest Name</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Hotel & Room</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Arrival/Departure</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGuests.length > 0 ? filteredGuests.map((guest) => (
                                <tr key={guest._id} className="hover:bg-slate-50/50 transition">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-[#f28c00]/20 text-[#f28c00] flex items-center justify-center font-bold mr-3">
                                                {guest.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{guest.fullName}</p>
                                                <p className="text-xs text-slate-500">{guest.nationality} • {guest.passportNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-medium text-slate-800">{guest.hotelBranch}</p>
                                        <p className="text-xs text-slate-500">Room {guest.roomNumber}</p>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-600">
                                        <p className="font-medium text-slate-800">{guest.arrivalDate ? format(new Date(guest.arrivalDate), 'MMM dd, yyyy') : 'N/A'}</p>
                                        <p className="text-xs text-slate-500">to {guest.departureDate ? format(new Date(guest.departureDate), 'MMM dd, yyyy') : 'N/A'}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${guest.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                                guest.paymentStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'}`}>
                                            {guest.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-blue-600 font-medium hover:underline text-sm mr-4">View</button>
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
