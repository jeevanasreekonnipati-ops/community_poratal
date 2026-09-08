'use client';

import React from 'react';

interface EmergencyContact {
  number: string;
  name: string;
  category: string;
  desc: string;
  icon: string;
  available: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    number: '112',
    name: 'National Unified Emergency Helpline',
    category: 'Police / Fire / Disaster',
    desc: 'All-in-one unified emergency response across India.',
    icon: '🚨',
    available: '24x7 Free',
  },
  {
    number: '108',
    name: 'Free Ambulance & Medical Emergency',
    category: 'Medical / Trauma',
    desc: 'Emergency patient transport & critical life support ambulance.',
    icon: '🚑',
    available: '24x7 Free',
  },
  {
    number: '104',
    name: 'Government Health Advice & Telemedicine',
    category: 'Health / Doctors',
    desc: 'Medical consultation, prescription support, and blood bank info.',
    icon: '🩺',
    available: '24x7 Free',
  },
  {
    number: '1902',
    name: 'Chief Minister Grievance (Spandana Helpline)',
    category: 'CM Office / Public Grievance',
    desc: 'Direct escalation of unresolved panchayat issues to CMO.',
    icon: '🏛️',
    available: 'Mon-Sat 8AM - 8PM',
  },
  {
    number: '181',
    name: 'Women & Child Safety Helpline (Disha)',
    category: 'Women Protection',
    desc: 'Immediate emergency rescue, counseling, and legal support.',
    icon: '🛡️',
    available: '24x7 Free',
  },
  {
    number: '1930',
    name: 'National Cyber Crime Financial Fraud',
    category: 'Cyber Safety',
    desc: 'Immediate freezing of unauthorized bank transactions & online scams.',
    icon: '💻',
    available: '24x7 Free',
  },
  {
    number: '14400',
    name: 'Anti-Corruption Bureau (ACB Helpline)',
    category: 'Vigilance',
    desc: 'Report bribery or corrupt practices in government offices.',
    icon: '⚖️',
    available: '10AM - 6PM',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyDirectoryModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🚨</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Emergency & Citizen SOS Directory
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                Direct government emergency contact numbers — Tap to dial immediately
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.2rem',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'grid', gap: '0.85rem' }}>
          {EMERGENCY_CONTACTS.map((item) => (
            <div
              key={item.number}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{item.name}</strong>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: '#e2e8f0',
                      color: '#475569',
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    {item.desc}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                    🟢 {item.available}
                  </div>
                </div>
              </div>

              <a
                href={`tel:${item.number}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
                }}
              >
                📞 {item.number}
              </a>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            🏛️ Sachivalayam Emergency Rapid Response Cell
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: '#334155',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
