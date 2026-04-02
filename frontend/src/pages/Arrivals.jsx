import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, isToday } from 'date-fns';
import { Search, Filter, PlaneLanding, Eye } from 'lucide-react';
import ViewGuestModal from '../components/ViewGuestModal';
import LoadingSpinner from '../components/LoadingSpinner';
import API_BASE_URL from '../config';

const Arrivals = () => {
    const { token } = useAuth();
    const [guests, setGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hotelFilter, setHotelFilter] = useState('All');
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGuests = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/guests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setGuests(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
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
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-3">
                        <PlaneLanding className="w-6 h-6 lg:w-8 lg:h-8 text-[#E89102]" />
                        Arrival List
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium italic">Track all incoming guest arrivals</p>
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
                            className="w-full pl-10 pr-4 py-2 border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E89102] focus:border-[#E89102] outline-none transition bg-white/30 backdrop-blur-md shadow-inner placeholder-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                className="border border-white/40 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E89102] outline-none bg-white/30 backdrop-blur-md shadow-inner text-slate-700"
                                value={hotelFilter}
                                onChange={(e) => setHotelFilter(e.target.value)}
                            >
                                <option value="All" className="bg-slate-900">All Hotels</option>
                                <option value="Hiru Villa" className="bg-slate-900">Hiru Villa</option>
                                <option value="Hiru Om" className="bg-slate-900">Hiru Om</option>
                                <option value="Hiru Mudhra" className="bg-slate-900">Hiru Mudhra</option>
                                <option value="Hiru Aadya" className="bg-slate-900">Hiru Aadya</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px] flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center py-20">
                            <LoadingSpinner size="lg" message="Reading arrival data..." />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/40 backdrop-blur-md border-y border-white/50 shadow-sm">
                                    <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Arrival Date</th>
                                    <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Guest Name</th>
                                    <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Hotel & Room</th>
                                    <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Flight/Transport</th>
                                    <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-3 sm:px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredArrivals.length > 0 ? filteredArrivals.map((guest) => {
                                    const arrDate = new Date(guest.arrivalDate);
                                    const today = isToday(arrDate);
                                    return (
                                        <tr key={guest._id} className={`transition border-b border-white/20 ${today ? 'bg-[#E89102]/10 hover:bg-[#E89102]/20' : 'hover:bg-white/5'}`}>
                                            <td className="py-4 px-3 sm:px-6">
                                                <p className={`font-bold ${today ? 'text-[#E89102]' : ''}`}>
                                                    {format(arrDate, 'MMM dd, yyyy')}
                                                </p>
                                                {today && <span className="text-[10px] bg-[#E89102] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest inline-block mt-1">Today</span>}
                                            </td>
                                            <td className="py-4 px-3 sm:px-6">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-[#E89102]/20 text-[#E89102] flex items-center justify-center font-bold mr-3 shadow-sm border border-[#E89102]/10">
                                                        {guest.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{guest.fullName}</p>
                                                        <p className="text-xs text-slate-500">{guest.nationality}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-3 sm:px-6">
                                                <p className="font-bold">{guest.hotelBranch}</p>
                                                <p className="text-xs text-slate-500">Room {guest.roomNumber}</p>
                                            </td>
                                            <td className="py-4 px-3 sm:px-6 text-sm text-slate-600">
                                                {/* Assuming flight details might be added later, placeholder for now */}
                                                N/A
                                            </td>
                                            <td className="py-4 px-3 sm:px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                                    ${guest.paymentStatus === 'Paid' ? 'bg-green-100/10 text-green-500' :
                                                        guest.paymentStatus === 'Pending' ? 'bg-[#E89102]/10 text-[#E89102]' :
                                                            'bg-slate-100/10 text-slate-500'}`}>
                                                    {guest.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 sm:px-6 text-right">
                                                <button
                                                    onClick={() => setSelectedGuest(guest)}
                                                    className="text-[#E89102] hover:text-[#d18102] bg-[#E89102]/10 hover:bg-[#E89102]/20 p-2 rounded-xl transition shadow-sm border border-[#E89102]/10"
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Arrivals;
