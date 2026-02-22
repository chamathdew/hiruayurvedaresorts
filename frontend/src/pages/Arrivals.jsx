import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, isToday } from 'date-fns';
import { Search, Filter, PlaneLanding, Eye } from 'lucide-react';
import ViewGuestModal from '../components/ViewGuestModal';

const Arrivals = () => {
    const { token } = useAuth();
    const [guests, setGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hotelFilter, setHotelFilter] = useState('All');
    const [selectedGuest, setSelectedGuest] = useState(null);

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

    // Filter logic: Show today's and future arrivals, then sort by arrival date
    const filteredArrivals = guests
        .filter(guest => {
            const matchesSearch = guest.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                guest.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesHotel = hotelFilter === 'All' || guest.hotelBranch === hotelFilter;

            // Allow all to show as an "Arrivals List" but usually you'd want to focus on upcoming
            // For now we'll show all but sort them by date.
            return matchesSearch && matchesHotel && guest.arrivalDate;
        })
        .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <PlaneLanding className="w-8 h-8 text-[#f28c00]" />
                        Arrival List
                    </h2>
                    <p className="text-slate-500 mt-1">Track all incoming guest arrivals</p>
                </div>
            </div>

            <ViewGuestModal
                isOpen={!!selectedGuest}
                onClose={() => setSelectedGuest(null)}
                guest={selectedGuest}
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
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Arrival Date</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Guest Name</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Hotel & Room</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Flight/Transport</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredArrivals.length > 0 ? filteredArrivals.map((guest) => {
                                const arrDate = new Date(guest.arrivalDate);
                                const today = isToday(arrDate);
                                return (
                                    <tr key={guest._id} className={`transition ${today ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-slate-50/50'}`}>
                                        <td className="py-4 px-6">
                                            <p className={`font-bold ${today ? 'text-[#f28c00]' : 'text-slate-800'}`}>
                                                {format(arrDate, 'MMM dd, yyyy')}
                                            </p>
                                            {today && <span className="text-xs bg-[#f28c00] text-white px-2 py-0.5 rounded-full font-medium inline-block mt-1">Today</span>}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-[#f28c00]/20 text-[#f28c00] flex items-center justify-center font-bold mr-3">
                                                    {guest.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{guest.fullName}</p>
                                                    <p className="text-xs text-slate-500">{guest.nationality}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-medium text-slate-800">{guest.hotelBranch}</p>
                                            <p className="text-xs text-slate-500">Room {guest.roomNumber}</p>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600">
                                            {/* Assuming flight details might be added later, placeholder for now */}
                                            N/A
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
                                            <button
                                                onClick={() => setSelectedGuest(guest)}
                                                className="text-[#f28c00] hover:text-orange-700 bg-orange-50 hover:bg-orange-100 p-2 rounded-lg transition"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-500">No arrivals found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Arrivals;
