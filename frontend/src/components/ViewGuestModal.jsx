import { X, Download } from 'lucide-react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { BASE_URL } from '../config';

const ViewGuestModal = ({ isOpen, onClose, guest }) => {
    if (!isOpen || !guest) return null;

    const renderField = (label, value) => (
        <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">{label}</label>
            <p className={`text-sm font-bold px-3 py-2.5 rounded-xl border transition-all ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'text-white bg-slate-800/50 border-slate-700 shadow-inner' : 'text-slate-800 bg-slate-50 border-slate-100 shadow-sm'}`}>
                {value || <span className="text-slate-500/50 italic font-medium">Not provided</span>}
            </p>
        </div>
    );

    // Make sure backslashes in path (from Windows multer) are converted to forward slashes
    const fileUrl = guest.passportCopyUrl ? `${BASE_URL}/${guest.passportCopyUrl.replace(/\\/g, '/')}` : null;
    const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className={`border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'bg-[#1a1a1b] border-[#262627]' : 'bg-white/80 backdrop-blur-3xl border-white/50'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'border-[#262627] bg-[#131313]' : 'border-white/30 bg-white/20'}`}>
                    <h3 className={`text-xl font-bold ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'text-white' : 'text-slate-800'}`}>Guest Details: {guest.fullName}</h3>
                    <button onClick={onClose} className={`transition p-2 rounded-full ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 bg-transparent text-slate-800">
                    <div className="space-y-8">

                        {/* Section: Personal Info */}
                        <div>
                            <h4 className="text-sm font-bold text-[#E89102] uppercase tracking-wider mb-4 border-b border-orange-600/20 pb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-[#E89102]/20 flex items-center justify-center border border-[#E89102]/10 shadow-sm">1</span>
                                Personal Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {renderField('Full Name', guest.fullName)}
                                {renderField('Birthday', guest.dateOfBirth ? format(new Date(guest.dateOfBirth), 'MMM dd, yyyy') : null)}
                                {renderField('Phone Number', guest.contactNumber)}
                                {renderField('Email', guest.email)}
                            </div>
                        </div>

                        {/* Section: Travel & Visa */}
                        <div>
                            <h4 className="text-sm font-bold text-[#E89102] uppercase tracking-wider mb-4 border-b border-orange-600/20 pb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-[#E89102]/20 flex items-center justify-center border border-[#E89102]/10 shadow-sm">2</span>
                                Visa & Passport
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                {renderField('Passport Number', guest.passportNumber)}
                                {renderField('Nationality', guest.nationality)}
                                {renderField('Visa Expiry', guest.visaExpiryDate ? format(new Date(guest.visaExpiryDate), 'MMM dd, yyyy') : null)}
                            </div>

                            <div className={`p-4 rounded-xl border shadow-inner ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white/30 border-white/40'}`}>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Passport Copy</label>
                                {fileUrl ? (
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        {!isPdf && (
                                            <div className="w-40 h-28 rounded-xl overflow-hidden border border-slate-700 shadow-lg relative group cursor-pointer" onClick={() => window.open(fileUrl, '_blank')}>
                                                <img src={fileUrl} alt="Passport Scan" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                <div className="absolute inset-0 bg-[#E89102]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                                                    <span className="text-white text-[10px] font-black uppercase tracking-widest bg-[#E89102]/80 px-2 py-1 rounded">View</span>
                                                </div>
                                            </div>
                                        )}
                                        <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-2.5 bg-[#E89102] hover:bg-[#d18102] text-white rounded-xl text-sm font-black transition shadow-lg shadow-[#E89102]/20 uppercase tracking-widest">
                                            <Download className="w-4 h-4" />
                                            Download {isPdf ? 'PDF' : 'Image'}
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-slate-400 italic">No passport document uploaded</p>
                                )}
                            </div>
                        </div>

                        {/* Section: Reservation Details */}
                        <div>
                            <h4 className="text-sm font-bold text-[#E89102] uppercase tracking-wider mb-4 border-b border-orange-600/20 pb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-[#E89102]/20 flex items-center justify-center border border-[#E89102]/10 shadow-sm">3</span>
                                Reservation Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {renderField('Hotel Branch', guest.hotelBranch)}
                                {renderField('Room Number', guest.roomNumber)}
                                {renderField('No of Pax', guest.pax)}
                                {renderField('Arrival Date', guest.arrivalDate ? format(new Date(guest.arrivalDate), 'MMM dd, yyyy') : null)}
                                {renderField('Departure Date', guest.departureDate ? format(new Date(guest.departureDate), 'MMM dd, yyyy') : null)}
                                {renderField('Agent Name', guest.agent)}
                            </div>
                        </div>

                        {/* Remark */}
                        <div className={`p-4 rounded-xl border shadow-sm ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'bg-[#E89102]/5 border-[#E89102]/20' : 'bg-orange-50/50 border-orange-100'}`}>
                            <label className="text-xs font-black text-[#E89102] uppercase tracking-[0.2em] block mb-2">Remark / Notes</label>
                            <p className="text-sm whitespace-pre-wrap font-medium">
                                {guest.remark || <span className="text-slate-500/50 italic">No special remarks added.</span>}
                            </p>
                        </div>

                    </div>
                </div>

                <div className={`p-6 border-t flex justify-end ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'border-[#262627] bg-[#131313]' : 'border-white/30 bg-white/20'}`}>
                    <button onClick={onClose} className="px-10 py-3 bg-[#E89102] hover:bg-[#d18102] text-white rounded-xl font-black shadow-xl shadow-orange-500/20 transition-all uppercase tracking-widest text-xs">
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

ViewGuestModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    guest: PropTypes.shape({
        fullName: PropTypes.string,
        dateOfBirth: PropTypes.string,
        contactNumber: PropTypes.string,
        email: PropTypes.string,
        passportNumber: PropTypes.string,
        nationality: PropTypes.string,
        visaExpiryDate: PropTypes.string,
        passportCopyUrl: PropTypes.string,
        hotelBranch: PropTypes.string,
        roomNumber: PropTypes.string,
        pax: PropTypes.number,
        arrivalDate: PropTypes.string,
        departureDate: PropTypes.string,
        agent: PropTypes.string,
        remark: PropTypes.string
    })
};

export default ViewGuestModal;
