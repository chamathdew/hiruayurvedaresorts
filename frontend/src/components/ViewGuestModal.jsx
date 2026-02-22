import { X, Download } from 'lucide-react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const ViewGuestModal = ({ isOpen, onClose, guest }) => {
    if (!isOpen || !guest) return null;

    const renderField = (label, value) => (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
            <p className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 min-h-[38px] flex items-center">
                {value || <span className="text-slate-400 italic">Not provided</span>}
            </p>
        </div>
    );

    // Make sure backslashes in path (from Windows multer) are converted to forward slashes
    const fileUrl = guest.passportCopyUrl ? `http://localhost:5000/${guest.passportCopyUrl.replace(/\\/g, '/')}` : null;
    const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Guest Details: {guest.fullName}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 bg-white">
                    <div className="space-y-8">

                        {/* Section: Personal Info */}
                        <div>
                            <h4 className="text-sm font-bold text-[#f28c00] uppercase tracking-wider mb-4 border-b border-[#f28c00]/20 pb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#f28c00]/10 flex items-center justify-center">1</span>
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
                            <h4 className="text-sm font-bold text-[#f28c00] uppercase tracking-wider mb-4 border-b border-[#f28c00]/20 pb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#f28c00]/10 flex items-center justify-center">2</span>
                                Visa & Passport
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                {renderField('Passport Number', guest.passportNumber)}
                                {renderField('Nationality', guest.nationality)}
                                {renderField('Visa Expiry', guest.visaExpiryDate ? format(new Date(guest.visaExpiryDate), 'MMM dd, yyyy') : null)}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">Passport Copy</label>
                                {fileUrl ? (
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        {!isPdf && (
                                            <div className="w-40 h-28 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer" onClick={() => window.open(fileUrl, '_blank')}>
                                                <img src={fileUrl} alt="Passport Scan" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                                    <span className="text-white text-xs font-bold">View Full Image</span>
                                                </div>
                                            </div>
                                        )}
                                        <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-[#f28c00] hover:text-[#f28c00] text-slate-600 rounded-lg text-sm font-semibold transition shadow-sm">
                                            <Download className="w-4 h-4" />
                                            Download Passport {isPdf ? 'PDF' : 'Image'}
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-slate-400 italic">No passport document uploaded</p>
                                )}
                            </div>
                        </div>

                        {/* Section: Reservation Details */}
                        <div>
                            <h4 className="text-sm font-bold text-[#f28c00] uppercase tracking-wider mb-4 border-b border-[#f28c00]/20 pb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#f28c00]/10 flex items-center justify-center">3</span>
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
                        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                            <label className="text-xs font-semibold text-orange-600 uppercase tracking-wider block mb-2">Remark / Notes</label>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                {guest.remark || <span className="text-slate-400 italic">No special remarks added.</span>}
                            </p>
                        </div>

                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold shadow-lg transform transition-all">
                        Close Layout
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
