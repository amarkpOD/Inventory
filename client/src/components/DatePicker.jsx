import React from 'react';
import { Calendar as CalendarIcon, X, Clock, ChevronRight } from 'lucide-react';

const DatePicker = ({ startDate, setStartDate, endDate, setEndDate }) => {
  // Date Helpers (YYYY-MM-DD format)
  const formatDateStr = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const setPreset = (type) => {
    const today = new Date();
    if (type === 'TODAY') {
      const dStr = formatDateStr(today);
      setStartDate(dStr);
      setEndDate(dStr);
    } else if (type === 'YESTERDAY') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const dStr = formatDateStr(yesterday);
      setStartDate(dStr);
      setEndDate(dStr);
    } else if (type === 'LAST_7') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      setStartDate(formatDateStr(sevenDaysAgo));
      setEndDate(formatDateStr(today));
    } else if (type === 'LAST_30') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setStartDate(formatDateStr(thirtyDaysAgo));
      setEndDate(formatDateStr(today));
    } else if (type === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDateStr(firstDay));
      setEndDate(formatDateStr(today));
    } else if (type === 'ALL_TIME') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Determine active preset badge
  const getActivePreset = () => {
    const today = new Date();
    const todayStr = formatDateStr(today);

    if (!startDate && !endDate) return 'ALL_TIME';

    if (startDate === todayStr && endDate === todayStr) return 'TODAY';

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    if (startDate === formatDateStr(thirtyDaysAgo) && endDate === todayStr) return 'LAST_30';

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    if (startDate === formatDateStr(sevenDaysAgo) && endDate === todayStr) return 'LAST_7';

    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    if (startDate === formatDateStr(firstDay) && endDate === todayStr) return 'THIS_MONTH';

    return 'CUSTOM';
  };

  const activePreset = getActivePreset();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Preset Chips Header */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={15} color="var(--accent-primary)" /> Quick Date Presets
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'TODAY', label: 'Today' },
            { id: 'LAST_7', label: 'Last 7 Days' },
            { id: 'LAST_30', label: 'Last 30 Days' },
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'ALL_TIME', label: 'All Time' },
          ].map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPreset(preset.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive
                    ? 'linear-gradient(135deg, var(--accent-primary), #4f46e5)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Pickers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* From Date */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            From Date
          </label>
          <div
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              if (input && input.showPicker) {
                try { input.showPicker(); } catch (err) {}
              }
            }}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <CalendarIcon
              size={15}
              color="var(--accent-primary)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="date"
              className="form-input"
              style={{
                paddingLeft: '36px',
                fontSize: '0.88rem',
                colorScheme: 'dark',
                cursor: 'pointer',
              }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onClick={(e) => {
                try {
                  if (e.target.showPicker) e.target.showPicker();
                } catch (err) {}
              }}
            />
          </div>
        </div>

        {/* To Date */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            To Date
          </label>
          <div
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              if (input && input.showPicker) {
                try { input.showPicker(); } catch (err) {}
              }
            }}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <CalendarIcon
              size={15}
              color="var(--accent-primary)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="date"
              className="form-input"
              style={{
                paddingLeft: '36px',
                fontSize: '0.88rem',
                colorScheme: 'dark',
                cursor: 'pointer',
              }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onClick={(e) => {
                try {
                  if (e.target.showPicker) e.target.showPicker();
                } catch (err) {}
              }}
            />
          </div>
        </div>
      </div>

      {/* Selected Date Summary Tag */}
      {(startDate || endDate) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid var(--border-highlight)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{startDate || 'Beginning'}</span>
            <ChevronRight size={14} color="var(--text-dim)" />
            <span>{endDate || 'Today'}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
            title="Clear Dates"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
