'use client';

import React, { useEffect, useState } from 'react';
import { getVillageNotices, VillageNotice } from '@/lib/noticeBoard';

export default function NoticeBoardBanner() {
  const [notices, setNotices] = useState<VillageNotice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadNotices = async () => {
    const list = await getVillageNotices();
    setNotices(list);
  };

  useEffect(() => {
    loadNotices();

    const handleUpdate = () => { loadNotices(); };
    window.addEventListener('notices_updated', handleUpdate);
    return () => window.removeEventListener('notices_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [notices]);

  if (notices.length === 0) return null;

  const current = notices[currentIndex];

  const getPriorityBadge = (priority: string) => {
    if (priority === 'urgent') return { bg: '#fee2e2', color: '#991b1b', text: '🔴 URGENT' };
    if (priority === 'important') return { bg: '#fef3c7', color: '#92400e', text: '🟡 IMPORTANT' };
    return { bg: '#e0e7ff', color: '#3730a3', text: 'ℹ️ NOTICE' };
  };

  const badge = getPriorityBadge(current?.priority || 'info');

  return (
    <div style={{
      marginBottom: '1.25rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
    }}>
      {/* Ticker Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        backgroundColor: '#f8fafc',
        borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <span style={{ fontSize: '1.2rem' }}>📢</span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            backgroundColor: badge.bg,
            color: badge.color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {badge.text}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
            {current?.title}
          </span>
          <span style={{
            fontSize: '0.85rem',
            color: '#64748b',
            display: 'inline-block',
            maxWidth: '450px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            — {current?.message}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {notices.length > 1 && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              {currentIndex + 1} / {notices.length}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--primary-color)',
            }}
          >
            {isExpanded ? 'Collapse ▲' : 'View All Notices ▼'}
          </button>
        </div>
      </div>

      {/* Expanded List */}
      {isExpanded && (
        <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.85rem' }}>
          {notices.map((n) => {
            const b = getPriorityBadge(n.priority);
            return (
              <div
                key={n.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: b.bg,
                      color: b.color,
                    }}>
                      {b.text}
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{n.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    📍 {n.village}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: '1.4' }}>
                  {n.message}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Published by: <strong>{n.publishedBy}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
