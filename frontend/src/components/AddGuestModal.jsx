import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Scan, FileText } from 'lucide-react';
import PropTypes from 'prop-types';

const AddGuestModal = ({ isOpen, onClose, onGuestAdded }) => {
    const { token, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        nationality: '',
        passportNumber: '',
        visaExpiryDate: '',
        contactNumber: '',
        email: '',
        hotelBranch: user?.hotelBranch !== 'All' ? user?.hotelBranch : 'Hiru Villa',
        roomNumber: '',
        arrivalDate: '',
        departureDate: '',
        pax: 1,
        agent: '',
        remark: ''
    });

    const [passportFile, setPassportFile] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        // MRZ Auto-detection logic (if a physical scanner types an MRZ code)
        if (name === 'passportNumber' && value.includes('<') && value.length >= 44) {
            const cleanMRZ = value.replace(/[\r\n\s]/g, '');
            if (cleanMRZ.length >= 88 && cleanMRZ[0] === 'P') {
                const line2 = cleanMRZ.substring(44, 88);
                const extractedPassport = line2.substring(0, 9).replace(/</g, '');
                const extractedNationality = line2.substring(10, 13).replace(/</g, '');

                // Set the derived fields and continue
                setFormData({
                    ...formData,
                    passportNumber: extractedPassport,
                    nationality: extractedNationality
                });
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setPassportFile(e.target.files[0]);
    };

    const handleExtractData = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsExtracting(true);
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('document', file);
            formDataPayload.append('docType', type);

            const res = await axios.post('http://localhost:5000/api/guests/extract', formDataPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                const extracted = res.data.extractedData;
                setFormData(prev => ({
                    ...prev,
                    fullName: extracted.fullName || prev.fullName,
                    dateOfBirth: extracted.dateOfBirth || prev.dateOfBirth,
                    nationality: extracted.nationality || prev.nationality,
                    passportNumber: extracted.passportNumber || prev.passportNumber,
                    visaExpiryDate: extracted.visaExpiryDate || prev.visaExpiryDate,
                    contactNumber: extracted.contactNumber || prev.contactNumber,
                    email: extracted.email || prev.email,
                    remark: extracted.remark ? `${prev.remark}\n[AI Extracted]: ${extracted.remark}`.trim() : prev.remark
                }));

                if (type === 'passport') {
                    setPassportFile(file);
                }
            }
        } catch (err) {
            console.error("Extraction error", err);
            alert(err.response?.data?.message || "Failed to extract text. Make sure GEMINI API key is provided.");
        } finally {
            setIsExtracting(false);
            e.target.value = null; // reset input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });
            if (passportFile) {
                submitData.append('passportCopy', passportFile);
            }

            await axios.post('http://localhost:5000/api/guests', submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            onGuestAdded();
            onClose();
        } catch (err) {
            console.error('Failed to add guest', err);
            alert('Failed to add guest. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Add New Guest</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1">

                    {/* Quick Scan AI Feature */}
                    <div className="bg-orange-50/70 p-5 rounded-2xl border border-orange-200/50 mb-6 drop-shadow-sm">
                        <h4 className="text-md font-extrabold text-[#f28c00] mb-3 flex items-center gap-2">
                            <span className="bg-[#f28c00] text-white p-1 rounded-md shadow-sm"><FileText className="w-4 h-4" /></span>
                            AI Document Auto-Fill
                        </h4>
                        <p className="text-sm text-slate-600 mb-4 font-medium">Have a handwritten declaration form or a passport? Upload it and our AI will automatically read and fill out the form for you!</p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border-2 border-dashed border-[#f28c00]/40 hover:border-[#f28c00] rounded-xl cursor-pointer transition text-[#f28c00] font-semibold text-sm">
                                    <FileText className="w-5 h-5" /> Read Handwritten Form
                                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleExtractData(e, 'form')} disabled={isExtracting} className="hidden" />
                                </label>
                            </div>
                            <div className="flex-1 relative">
                                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border-2 border-dashed border-blue-400/40 hover:border-blue-500 rounded-xl cursor-pointer transition text-blue-600 font-semibold text-sm">
                                    <Scan className="w-5 h-5" /> Read Passport Info
                                    <input type="file" accept="image/*" onChange={(e) => handleExtractData(e, 'passport')} disabled={isExtracting} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {isExtracting && (
                            <div className="mt-4 flex items-center justify-center text-[#f28c00] font-bold text-sm animate-pulse space-x-2">
                                <svg className="animate-spin h-5 w-5 text-[#f28c00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>AI is analyzing the document... Please wait...</span>
                            </div>
                        )}
                    </div>

                    <form id="add-guest-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Section: Personal Info */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-orange-200 pb-2 inline-block">1. Personal Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Guest Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="Full Name" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Birthday</label>
                                    <div className="relative">
                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="+xx xxxxxxxxx" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="example@email.com" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Travel & Visa */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-orange-200 pb-2 inline-block">2. Visa & Passport</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Passport Number (Scan Here)</label>
                                    <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="w-full px-4 py-2 bg-amber-50 border border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition placeholder-amber-400/70" placeholder="Type or Scan MRZ..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Country / Nationality</label>
                                    <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="LKA, IND, USA..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Visa Expiry Date</label>
                                    <div className="relative">
                                        <input type="date" name="visaExpiryDate" value={formData.visaExpiryDate} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1 lg:col-span-3">
                                    <label className="text-sm font-semibold text-slate-700">Upload Passport Copy</label>
                                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 rounded-lg outline-none transition" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Reservation Details */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-orange-200 pb-2 inline-block">3. Reservation Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {user?.role === 'Admin' ? (
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Hotel Branch <span className="text-red-500">*</span></label>
                                        <select name="hotelBranch" required value={formData.hotelBranch} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition">
                                            <option value="Hiru Villa">Hiru Villa</option>
                                            <option value="Hiru Om">Hiru Om</option>
                                            <option value="Hiru Mudhra">Hiru Mudhra</option>
                                            <option value="Hiru Aadya">Hiru Aadya</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-1 opacity-60">
                                        <label className="text-sm font-semibold text-slate-700">Hotel Branch</label>
                                        <input type="text" readOnly disabled value={formData.hotelBranch} className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg" />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Room Number</label>
                                    <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="Room No" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Pax (No. of Guests)</label>
                                    <input type="number" name="pax" min="1" value={formData.pax} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Arrival Date</label>
                                    <div className="relative">
                                        <input type="date" name="arrivalDate" value={formData.arrivalDate} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Departure Date</label>
                                    <div className="relative">
                                        <input type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Agent</label>
                                    <input type="text" name="agent" value={formData.agent} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="Travel Agent Name" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Remark / Notes</label>
                            <textarea name="remark" rows="3" value={formData.remark} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition resize-none" placeholder="Any special requests or remarks..."></textarea>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition">Cancel</button>
                    <button type="submit" form="add-guest-form" disabled={isLoading} className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-[#f28c00] hover:from-orange-600 hover:to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 transform transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                        {isLoading ? 'Saving...' : 'Save Guest Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};

AddGuestModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onGuestAdded: PropTypes.func.isRequired
};

export default AddGuestModal;
