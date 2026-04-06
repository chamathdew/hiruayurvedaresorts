import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, addMonths, subMonths, parseISO, isWithinInterval
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Save, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API_BASE_URL from '../config';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Color Palette (matching hiruom.xlsx colors) ─────────────────────────────
const BOOKING_COLORS = [
    { label: 'Yellow',      hex: '#FFFF00', text: '#000000' },
    { label: 'Pink',        hex: '#FF99FF', text: '#000000' },
    { label: 'Magenta',     hex: '#FF66CC', text: '#000000' },
    { label: 'Green',       hex: '#00B050', text: '#ffffff' },
    { label: 'Light Green', hex: '#92D050', text: '#000000' },
    { label: 'Cyan',        hex: '#00FFFF', text: '#000000' },
    { label: 'Blue',        hex: '#538DD5', text: '#ffffff' },
    { label: 'Dark Blue',   hex: '#0070C0', text: '#ffffff' },
    { label: 'Orange',      hex: '#E26B0A', text: '#ffffff' },
    { label: 'Gold',        hex: '#FFC000', text: '#000000' },
    { label: 'Purple',      hex: '#7030A0', text: '#ffffff' },
    { label: 'Red',         hex: '#FF0000', text: '#ffffff' },
    { label: 'Gray',        hex: '#BFBFBF', text: '#000000' },
    { label: 'Lime',        hex: '#C4D79B', text: '#000000' },
    { label: 'Sky Blue',    hex: '#00B0F0', text: '#000000' },
    { label: 'Light Yellow',hex: '#FFFFCC', text: '#000000' },
];

const SECTIONS = [
    { name: 'Ground Floor', rooms: ['1', '2', '3', '4'] },
    { name: 'First Floor',  rooms: ['5', '6', '7', '8', '10', '11', '12', '14'] },
    { name: 'Reserve',      rooms: ['9'] },
    { name: 'Roof Top',     rooms: ['15', '16', '17'] },
];

const ALL_ROOMS = SECTIONS.flatMap(s => s.rooms);

const getTextColor = (hex) => {
    if (!hex) return '#000000';
    const c = BOOKING_COLORS.find(b => b.hex.toLowerCase() === hex.toLowerCase());
    if (c) return c.text;
    // Luminance fallback
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#ffffff';
};

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
const BookingModal = ({ booking, defaultRoom, defaultDay, currentDate, onSave, onDelete, onClose, isDark }) => {
    const [form, setForm] = useState({
        roomNo:      booking?.roomNo      || defaultRoom || '1',
        guestDetail: booking?.guestDetail || '',
        startDate:   booking?.startDate   || (defaultDay ? format(defaultDay, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-01')),
        endDate:     booking?.endDate     || (defaultDay ? format(defaultDay, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-01')),
        color:       booking?.color       || '#FFFF00',
        remark:      booking?.remark      || '',
        hotelBranch: booking?.hotelBranch || 'Hiru Ayurveda Resort',
    });

    const isEdit = !!booking?.id;

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const bg    = isDark ? '#1a1a1b' : '#ffffff';
    const textC = isDark ? '#f8fafc' : '#1e293b';
    const sub   = isDark ? '#94a3b8' : '#64748b';
    const bdr   = isDark ? '#262627' : '#e2e8f0';
    const inp   = isDark ? '#262627' : '#f8fafc';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
        }}>
            <div style={{
                background: bg, border: `1px solid ${bdr}`, borderRadius: '1rem',
                width: '100%', maxWidth: '520px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                animation: 'modalIn 0.2s ease',
            }}>
                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: textC }}>
                            {isEdit ? 'Edit Booking' : 'New Booking'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: sub, marginTop: 2 }}>Belegungsplan Entry</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, padding: '0.25rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Room */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Room</label>
                        <select value={form.roomNo} onChange={e => set('roomNo', e.target.value)}
                            style={{ width: '100%', padding: '0.625rem 0.75rem', background: inp, border: `1px solid ${bdr}`, borderRadius: '0.5rem', color: textC, fontSize: '0.875rem', outline: 'none' }}>
                            {SECTIONS.map(sec => (
                                <optgroup key={sec.name} label={sec.name}>
                                    {sec.rooms.map(r => <option key={r} value={r}>Room {r}</option>)}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Guest Detail */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Guest / Flight Info</label>
                        <input value={form.guestDetail} onChange={e => set('guestDetail', e.target.value)}
                            placeholder="e.g. 02.03. 05:40 UL 558 / Ute Goettl"
                            style={{ width: '100%', padding: '0.625rem 0.75rem', background: inp, border: `1px solid ${bdr}`, borderRadius: '0.5rem', color: textC, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Check-in</label>
                            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                                style={{ width: '100%', padding: '0.625rem 0.75rem', background: inp, border: `1px solid ${bdr}`, borderRadius: '0.5rem', color: textC, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Check-out</label>
                            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                                style={{ width: '100%', padding: '0.625rem 0.75rem', background: inp, border: `1px solid ${bdr}`, borderRadius: '0.5rem', color: textC, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Color</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {BOOKING_COLORS.map(c => (
                                <button key={c.hex} onClick={() => set('color', c.hex)} title={c.label}
                                    style={{
                                        width: 28, height: 28, borderRadius: 4,
                                        background: c.hex,
                                        border: form.color.toLowerCase() === c.hex.toLowerCase() ? '2.5px solid #E89102' : `1.5px solid ${bdr}`,
                                        cursor: 'pointer', transform: form.color.toLowerCase() === c.hex.toLowerCase() ? 'scale(1.2)' : 'scale(1)',
                                        transition: 'all 0.15s',
                                        boxShadow: form.color.toLowerCase() === c.hex.toLowerCase() ? '0 0 0 2px rgba(232,145,2,0.3)' : 'none',
                                    }} />
                            ))}
                        </div>
                    </div>

                    {/* Remark */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Remark</label>
                        <textarea value={form.remark} onChange={e => set('remark', e.target.value)} rows={2}
                            placeholder="Optional notes..."
                            style={{ width: '100%', padding: '0.625rem 0.75rem', background: inp, border: `1px solid ${bdr}`, borderRadius: '0.5rem', color: textC, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    {isEdit ? (
                        <button onClick={() => onDelete(booking.id)}
                            style={{ padding: '0.5rem 1rem', background: '#ff4444', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Trash2 size={14} /> Delete
                        </button>
                    ) : <div />}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={onClose}
                            style={{ padding: '0.5rem 1.25rem', background: inp, border: `1px solid ${bdr}`, borderRadius: '0.5rem', color: textC, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button onClick={() => onSave(form)}
                            style={{ padding: '0.5rem 1.25rem', background: '#E89102', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Save size={14} /> {isEdit ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const Tooltip = ({ text, color, isDark }) => (
    <div style={{
        position: 'absolute', zIndex: 500,
        bottom: '110%', left: '50%', transform: 'translateX(-50%)',
        background: isDark ? '#1e293b' : '#0f172a',
        color: '#f8fafc',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        maxWidth: '280px',
        whiteSpace: 'pre-wrap',
        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
        pointerEvents: 'none',
        borderLeft: `3px solid ${color || '#E89102'}`,
    }}>
        {text}
        <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: `5px solid ${isDark ? '#1e293b' : '#0f172a'}`,
        }} />
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Belegungsplan = () => {
    const { token, user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [currentDate, setCurrentDate]   = useState(new Date());
    const [occupancyData, setOccupancyData] = useState([]);
    const [isLoading, setIsLoading]        = useState(true);
    const [modal, setModal]                = useState(null); // { booking?, room?, day? }
    const [tooltip, setTooltip]            = useState(null); // { key, text, color }
    const [saving, setSaving]              = useState(false);
    const [blockStyles, setBlockStyles]    = useState(() => {
        const saved = localStorage.getItem('hiru_block_styles');
        return saved ? JSON.parse(saved) : { fontSize: 0.65, fontWeight: 800, isUppercase: false, isItalic: false };
    });
    const [showStyleMenu, setShowStyleMenu] = useState(false);

    useEffect(() => {
        localStorage.setItem('hiru_block_styles', JSON.stringify(blockStyles));
    }, [blockStyles]);


    const canEdit = user?.role === 'Admin' || user?.role === 'Managing Director' || user?.role === 'Reservation Manager';

    const monthStart  = startOfMonth(currentDate);
    const monthEnd    = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // ── Styles ────────────────────────────────────────────────────────────────
    const bg       = isDark ? '#0f0f10' : '#f1f5f9';
    const cardBg   = isDark ? '#1a1a1b' : '#ffffff';
    const bdr      = isDark ? '#262627' : '#e2e8f0';
    const textC    = isDark ? '#f8fafc' : '#1e293b';
    const subC     = isDark ? '#64748b' : '#94a3b8';
    const hdrBg    = isDark ? '#131313' : '#f8fafc';
    const rowHover = isDark ? 'rgba(232,145,2,0.04)' : 'rgba(232,145,2,0.06)';
    const todayBg  = isDark ? 'rgba(232,145,2,0.12)' : 'rgba(232,145,2,0.10)';
    const cellBdr  = isDark ? '#1f1f20' : '#e8edf2';

    const COL_W  = 38;  // day column width px
    const ROW_H  = 36;  // row height px
    const ROOM_W = 52;  // room label width

    // ── Data fetch ────────────────────────────────────────────────────────────
    useEffect(() => { fetchOccupancy(); }, [currentDate]);

    const fetchOccupancy = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/occupancy`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOccupancyData(res.data);
        } catch (err) {
            console.error('Failed to fetch occupancy', err);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Booking lookup for a room + day ───────────────────────────────────────
    const getBookingsForRoom = (roomNo) =>
        occupancyData.filter(occ => String(occ.roomNo) === String(roomNo));

    const getOccForCell = (roomNo, day) =>
        getBookingsForRoom(roomNo).find(occ => {
            const s = parseISO(occ.startDate);
            const e = parseISO(occ.endDate);
            return isWithinInterval(day, { start: s, end: e }) ||
                   isSameDay(day, s) || isSameDay(day, e);
        });

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const handleSave = async (form) => {
        setSaving(true);
        try {
            if (modal.booking?.id) {
                await axios.put(`${API_BASE_URL}/occupancy/${modal.booking.id}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE_URL}/occupancy`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setModal(null);
            fetchOccupancy();
        } catch (err) {
            console.error('Save failed', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this booking?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/occupancy/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModal(null);
            fetchOccupancy();
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    // ── Cell click ────────────────────────────────────────────────────────────
    const handleCellClick = (roomNo, day, occ) => {
        if (!canEdit) return;
        if (occ) {
            setModal({ booking: occ });
        } else {
            setModal({ booking: null, room: roomNo, day });
        }
    };

    // ── Render grid ───────────────────────────────────────────────────────────
    const today = new Date();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ── Header bar portal to navbar ── */}
            {document.getElementById('page-header-portal') ? createPortal(
                <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: textC, margin: 0, letterSpacing: '-0.05em' }}>
                                Belegungsplan
                            </h2>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em',
                                background: 'rgba(232,145,2,0.15)', color: '#E89102',
                                padding: '0.2rem 0.6rem', borderRadius: '9999px',
                                border: '1px solid rgba(232,145,2,0.3)', textTransform: 'uppercase'
                            }}>Occupancy</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Style Settings Menu */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowStyleMenu(!showStyleMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '0.4rem 0.75rem', background: cardBg,
                                    border: `1px solid ${bdr}`, borderRadius: '0.5rem',
                                    color: textC, fontSize: '0.75rem', fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ fontSize: '1rem' }}>Aa</span>
                                <span>Font Settings</span>
                            </button>
                            
                            {showStyleMenu && (
                                <div style={{
                                    position: 'absolute', top: '110%', right: 0, zIndex: 100,
                                    background: cardBg, border: `1px solid ${bdr}`, borderRadius: '0.75rem',
                                    padding: '1rem', width: '220px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                    display: 'flex', flexDirection: 'column', gap: '0.75rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: textC }}>Font Size</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button onClick={() => setBlockStyles(s => ({...s, fontSize: Math.max(0.4, s.fontSize - 0.05)}))} 
                                                style={{ width: 24, height: 24, borderRadius: 4, border: `1px solid ${bdr}`, background: bg, color: textC, cursor: 'pointer' }}>-</button>
                                            <span style={{ fontSize: '0.75rem', minWidth: 35, textAlign: 'center' }}>{blockStyles.fontSize.toFixed(2)}</span>
                                            <button onClick={() => setBlockStyles(s => ({...s, fontSize: Math.min(1.2, s.fontSize + 0.05)}))}
                                                style={{ width: 24, height: 24, borderRadius: 4, border: `1px solid ${bdr}`, background: bg, color: textC, cursor: 'pointer' }}>+</button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => setBlockStyles(s => ({...s, fontWeight: s.fontWeight === 800 ? 500 : 800}))}
                                            style={{ 
                                                flex: 1, padding: '0.4rem', borderRadius: 6, border: `1px solid ${bdr}`, 
                                                background: blockStyles.fontWeight === 800 ? '#E89102' : bg,
                                                color: blockStyles.fontWeight === 800 ? '#fff' : textC,
                                                fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer'
                                            }}>BOLD</button>
                                        <button 
                                            onClick={() => setBlockStyles(s => ({...s, isItalic: !s.isItalic}))}
                                            style={{ 
                                                flex: 1, padding: '0.4rem', borderRadius: 6, border: `1px solid ${bdr}`, 
                                                background: blockStyles.isItalic ? '#E89102' : bg,
                                                color: blockStyles.isItalic ? '#fff' : textC,
                                                fontSize: '0.7rem', fontStyle: 'italic', cursor: 'pointer'
                                            }}>Italic</button>
                                        <button 
                                            onClick={() => setBlockStyles(s => ({...s, isUppercase: !s.isUppercase}))}
                                            style={{ 
                                                flex: 1, padding: '0.4rem', borderRadius: 6, border: `1px solid ${bdr}`, 
                                                background: blockStyles.isUppercase ? '#E89102' : bg,
                                                color: blockStyles.isUppercase ? '#fff' : textC,
                                                fontSize: '0.7rem', cursor: 'pointer'
                                            }}>CAPS</button>
                                    </div>
                                    <button onClick={() => setShowStyleMenu(false)} style={{ width: '100%', padding: '0.4rem', borderRadius: 6, background: '#E89102', color: '#fff', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                                </div>
                            )}
                        </div>

                        {canEdit && (
                            <button
                                onClick={() => setModal({ booking: null })}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '0.4rem 0.75rem', background: '#E89102',
                                    border: 'none', borderRadius: '0.5rem',
                                    color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                <Plus size={14} /> Add Booking
                            </button>
                        )}

                        {/* Month navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', background: cardBg, border: `1px solid ${bdr}`, borderRadius: '0.5rem', overflow: 'hidden' }}>
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                style={{ padding: '0.4rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#E89102', display: 'flex', alignItems: 'center' }}>
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ padding: '0 0.5rem', fontWeight: 800, fontSize: '0.8rem', color: textC, minWidth: 100, textAlign: 'center' }}>
                                {format(currentDate, 'MMM yyyy')}
                            </span>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                style={{ padding: '0.4rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#E89102', display: 'flex', alignItems: 'center' }}>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <button onClick={() => setCurrentDate(new Date())}
                            style={{ padding: '0.4rem 0.5rem', background: cardBg, border: `1px solid ${bdr}`, borderRadius: '0.5rem', color: '#E89102', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} /> Today
                        </button>
                    </div>
                </div>,
                document.getElementById('page-header-portal')
            ) : (
                /* Fallback if portal isn't available */
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: textC, margin: 0, letterSpacing: '-0.05em' }}>
                                Belegungsplan
                            </h2>
                            <span style={{
                                fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em',
                                background: 'rgba(232,145,2,0.15)', color: '#E89102',
                                padding: '0.25rem 0.75rem', borderRadius: '9999px',
                                border: '1px solid rgba(232,145,2,0.3)', textTransform: 'uppercase'
                            }}>Occupancy Plan</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: subC, marginTop: 2 }}>
                            Room allocation grid — {format(currentDate, 'MMMM yyyy')}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {canEdit && (
                            <button
                                onClick={() => setModal({ booking: null })}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '0.5rem 1rem', background: '#E89102',
                                    border: 'none', borderRadius: '0.625rem',
                                    color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                <Plus size={16} /> Add Booking
                            </button>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', background: cardBg, border: `1px solid ${bdr}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#E89102', display: 'flex', alignItems: 'center' }}>
                                <ChevronLeft size={18} />
                            </button>
                            <span style={{ padding: '0 0.5rem', fontWeight: 800, fontSize: '0.9rem', color: textC, minWidth: 120, textAlign: 'center' }}>
                                {format(currentDate, 'MMMM yyyy')}
                            </span>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#E89102', display: 'flex', alignItems: 'center' }}>
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <button onClick={() => setCurrentDate(new Date())}
                            style={{ padding: '0.5rem 0.75rem', background: cardBg, border: `1px solid ${bdr}`, borderRadius: '0.625rem', color: '#E89102', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={14} /> Today
                        </button>
                    </div>
                </div>
            )}

            {/* ── Grid ── */}
            <div style={{
                background: cardBg, border: `1px solid ${bdr}`,
                borderRadius: '0.875rem', overflow: 'hidden',
                boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
            }}>
                {isLoading ? (
                    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: ROOM_W + COL_W * daysInMonth.length }}>

                            {/* ── Day header row ── */}
                            <div style={{ display: 'flex', background: hdrBg, borderBottom: `2px solid ${bdr}`, position: 'sticky', top: 0, zIndex: 10 }}>
                                {/* Month label */}
                                <div style={{
                                    width: ROOM_W, minWidth: ROOM_W, flexShrink: 0,
                                    padding: '0.5rem 0.25rem', fontWeight: 900, fontSize: '0.75rem',
                                    color: '#E89102', textAlign: 'center', letterSpacing: '-0.03em',
                                    borderRight: `1px solid ${bdr}`, position: 'sticky', left: 0, zIndex: 20,
                                    background: hdrBg,
                                }}>
                                    {format(currentDate, 'MMM').toUpperCase()}
                                    <div style={{ fontSize: '0.6rem', color: subC, fontWeight: 700 }}>{format(currentDate, 'yyyy')}</div>
                                </div>

                                {daysInMonth.map((day) => {
                                    const isToday = isSameDay(day, today);
                                    const dayOfWeek = format(day, 'EEE');
                                    const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
                                    return (
                                        <div key={day.toISOString()} style={{
                                            width: COL_W, minWidth: COL_W, flexShrink: 0,
                                            height: 52,
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            borderRight: `1px solid ${cellBdr}`,
                                            background: isToday ? todayBg : isWeekend ? (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)') : 'transparent',
                                            position: 'relative',
                                        }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isWeekend ? '#E89102' : subC, textTransform: 'uppercase' }}>
                                                {format(day, 'EEE')}
                                            </span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 900, color: isToday ? '#E89102' : textC, lineHeight: 1 }}>
                                                {format(day, 'd')}
                                            </span>
                                            {isToday && (
                                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#E89102', marginTop: 2 }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Section rows ── */}
                            {SECTIONS.map((section) => (
                                <React.Fragment key={section.name}>
                                    {/* Section header */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center',
                                        background: isDark ? 'rgba(232,145,2,0.08)' : 'rgba(232,145,2,0.06)',
                                        borderTop: `1px solid ${bdr}`,
                                        borderBottom: `1px solid ${bdr}`,
                                    }}>
                                        <div style={{
                                            width: ROOM_W, minWidth: ROOM_W, flexShrink: 0,
                                            position: 'sticky', left: 0, zIndex: 5,
                                            background: isDark ? 'rgba(20,15,0,0.85)' : 'rgba(255,248,235,0.95)',
                                            padding: '0.3rem 0.4rem',
                                            fontWeight: 900, fontSize: '0.6rem', color: '#E89102',
                                            textTransform: 'uppercase', letterSpacing: '0.05em',
                                            borderRight: `2px solid rgba(232,145,2,0.3)`,
                                        }}>
                                            {section.name}
                                        </div>
                                        <div style={{ flex: 1, height: 20 }} />
                                    </div>

                                    {/* Room rows */}
                                    {section.rooms.map((roomNo, roomIdx) => (
                                        <RoomRow
                                            key={roomNo}
                                            roomNo={roomNo}
                                            daysInMonth={daysInMonth}
                                            today={today}
                                            bookings={getBookingsForRoom(roomNo)}
                                            onCellClick={handleCellClick}
                                            onTooltip={setTooltip}
                                            tooltip={tooltip}
                                            canEdit={canEdit}
                                            isDark={isDark}
                                            isEven={roomIdx % 2 === 0}
                                            blockStyles={blockStyles}
                                            // styles

                                            COL_W={COL_W} ROW_H={ROW_H} ROOM_W={ROOM_W}
                                            cardBg={cardBg} bdr={bdr} cellBdr={cellBdr}
                                            textC={textC} subC={subC} hdrBg={hdrBg}
                                            todayBg={todayBg} rowHover={rowHover}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Color legend ── */}
            <div style={{
                background: cardBg, border: `1px solid ${bdr}`,
                borderRadius: '0.875rem', padding: '1rem 1.25rem',
                display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center',
            }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: subC, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>
                    Colors:
                </span>
                {BOOKING_COLORS.map(c => (
                    <div key={c.hex} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, background: c.hex, border: `1px solid ${bdr}` }} />
                        <span style={{ fontSize: '0.65rem', color: subC }}>{c.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Modal ── */}
            {modal && (
                <BookingModal
                    booking={modal.booking}
                    defaultRoom={modal.room}
                    defaultDay={modal.day}
                    currentDate={currentDate}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={() => setModal(null)}
                    isDark={isDark}
                />
            )}

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.96) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
            `}</style>
        </div>
    );
};

const RoomRow = ({
    roomNo, daysInMonth, today, bookings, onCellClick, onTooltip, tooltip, canEdit, isDark, isEven, blockStyles,
    COL_W, ROW_H, ROOM_W, cardBg, bdr, cellBdr, textC, subC, hdrBg, todayBg, rowHover,
}) => {
    const [hovered, setHovered] = useState(false);

    // Build a map of days -> booking to keep click area / plus icons working underneath
    const dayMap = {};
    daysInMonth.forEach(day => {
        const matched = bookings.find(occ => {
            const s = parseISO(occ.startDate);
            const e = parseISO(occ.endDate);
            return isWithinInterval(day, { start: s, end: e }) || isSameDay(day, s) || isSameDay(day, e);
        });
        if (matched) dayMap[format(day, 'd')] = matched;
    });

    const rowBg = hovered
        ? (isDark ? 'rgba(232,145,2,0.03)' : 'rgba(232,145,2,0.04)')
        : isEven
        ? (isDark ? 'rgba(255,255,255,0.008)' : 'rgba(0,0,0,0.012)')
        : 'transparent';

    return (
        <div
            style={{ display: 'flex', background: rowBg, borderBottom: `1px solid ${cellBdr}`, transition: 'background 0.15s', position: 'relative' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Room label */}
            <div style={{
                width: ROOM_W, minWidth: ROOM_W, flexShrink: 0,
                height: ROW_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '0.875rem', color: '#E89102',
                borderRight: `2px solid ${bdr}`,
                position: 'sticky', left: 0, zIndex: 5,
                background: isDark ? '#131313' : '#ffffff',
            }}>
                {roomNo}
            </div>

            {/* Day cells (Background) */}
            {daysInMonth.map((day) => {
                const dayNum = format(day, 'd');
                const occ = dayMap[dayNum];
                const isToday = isSameDay(day, today);
                
                const cellBg = isToday && !occ
                    ? (isDark ? 'rgba(232,145,2,0.08)' : 'rgba(232,145,2,0.06)')
                    : 'transparent';

                return (
                    <div
                        key={day.toISOString()}
                        style={{
                            width: COL_W, minWidth: COL_W, flexShrink: 0,
                            height: ROW_H,
                            borderRight: `1px solid ${cellBdr}`,
                            background: cellBg,
                            position: 'relative',
                            cursor: canEdit ? 'pointer' : 'default',
                        }}
                        onClick={() => onCellClick(roomNo, day, occ)}
                    >
                        {/* Hover plus for empty cells */}
                        {canEdit && !occ && (
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: 0, transition: 'opacity 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                onMouseLeave={e => e.currentTarget.style.opacity = 0}
                            >
                                <Plus size={10} color="rgba(232,145,2,0.5)" />
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Foreground Merged Booking Blocks */}
            {bookings.map(occ => {
                const sDate = parseISO(occ.startDate);
                const eDate = parseISO(occ.endDate);
                const monthStart = daysInMonth[0];
                const monthEnd = daysInMonth[daysInMonth.length - 1];

                // Check if booking overlaps this month
                if (sDate > monthEnd || eDate < monthStart) return null;

                // Calculate positions
                const startOffDays = Math.max(0, (sDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
                const exactEndDays = (eDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24);
                const endOffDays = Math.min(daysInMonth.length - 1, exactEndDays);

                const spanDays = Math.round(endOffDays - startOffDays) + 1;
                if (spanDays <= 0) return null;

                const leftPx = ROOM_W + (Math.round(startOffDays) * COL_W);
                const widthPx = spanDays * COL_W;
                
                const isStartCut = sDate < monthStart;
                const isEndCut = eDate > monthEnd;

                const cellKey = `${roomNo}-${occ._id || occ.id || sDate.toISOString()}`;

                return (
                    <div
                        key={cellKey}
                        onClick={() => onCellClick(roomNo, sDate, occ)}
                        onMouseEnter={() => onTooltip({ key: cellKey, occ })}
                        onMouseLeave={() => onTooltip(null)}
                        style={{
                            position: 'absolute',
                            top: 4,
                            bottom: 4,
                            left: leftPx + (isStartCut ? 0 : 2),
                            width: widthPx - (isStartCut ? 0 : 2) - (isEndCut ? 1 : 3),
                            background: occ.color || '#FFFF00',
                            borderRadius: `${isStartCut ? 0 : 6}px ${isEndCut ? 0 : 6}px ${isEndCut ? 0 : 6}px ${isStartCut ? 0 : 6}px`,
                            zIndex: 3,
                            boxShadow: isStartCut ? 'none' : '2px 0 6px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: 6,
                            paddingRight: 6,
                            overflow: 'hidden',
                            cursor: canEdit ? 'pointer' : 'default',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <span style={{
                            fontSize: `${blockStyles.fontSize}rem`,
                            fontWeight: blockStyles.fontWeight,
                            fontStyle: blockStyles.isItalic ? 'italic' : 'normal',
                            textTransform: blockStyles.isUppercase ? 'uppercase' : 'none',
                            color: getTextColor(occ.color),
                            whiteSpace: 'nowrap',
                            userSelect: 'none',
                        }}>

                            {occ.guestDetail}
                        </span>

                        {/* Tooltip */}
                        {tooltip?.key === cellKey && (
                            <Tooltip
                                text={`Room ${roomNo}\n${occ.guestDetail}${occ.remark ? '\n' + occ.remark : ''}\n${format(sDate, 'dd.MM.yyyy')} → ${format(eDate, 'dd.MM.yyyy')}`}
                                color={occ.color}
                                isDark={isDark}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Belegungsplan;
