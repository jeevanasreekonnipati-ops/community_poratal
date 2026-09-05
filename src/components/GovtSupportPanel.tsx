'use client';

import React, { useState } from 'react';

interface GovtScheme {
  title: string;
  ministry: string;
  description: string;
  eligibility: string;
  benefit: string;
  link: string;
  icon: string;
  tag: string;
  tagColor: string;
}

const SCHEMES: GovtScheme[] = [
  {
    icon: '🏠',
    title: 'PM Awas Yojana (Grameen)',
    ministry: 'Ministry of Rural Development',
    description: 'Financial assistance to rural households for construction of pucca houses.',
    eligibility: 'BPL families, SC/ST, minorities without pucca house',
    benefit: '₹1.20 – ₹1.30 Lakh per house + toilet support',
    link: 'https://pmayg.nic.in',
    tag: 'Housing',
    tagColor: '#e8f5e9',
  },
  {
    icon: '💧',
    title: 'Jal Jeevan Mission',
    ministry: 'Ministry of Jal Shakti',
    description: 'Provides functional household tap connections (FHTC) for safe drinking water.',
    eligibility: 'All rural households',
    benefit: 'Free tap water connection',
    link: 'https://jaljeevanmission.gov.in',
    tag: 'Water',
    tagColor: '#e3f2fd',
  },
  {
    icon: '⚡',
    title: 'PM Surya Ghar Muft Bijli Yojana',
    ministry: 'Ministry of New & Renewable Energy',
    description: 'Free rooftop solar panels providing up to 300 units free electricity per month.',
    eligibility: 'Residential households with own rooftop',
    benefit: '300 units free/month + subsidy up to ₹78,000',
    link: 'https://pmsuryaghar.gov.in',
    tag: 'Energy',
    tagColor: '#fff8e1',
  },
  {
    icon: '🌾',
    title: 'PM-KISAN Samman Nidhi',
    ministry: 'Ministry of Agriculture',
    description: 'Direct income support to small and marginal farmers.',
    eligibility: 'Farmers with landholding up to 2 hectares',
    benefit: '₹6,000 per year in 3 instalments',
    link: 'https://pmkisan.gov.in',
    tag: 'Agriculture',
    tagColor: '#f1f8e9',
  },
  {
    icon: '🏥',
    title: 'PM Jan Arogya Yojana (Ayushman Bharat)',
    ministry: 'Ministry of Health & Family Welfare',
    description: 'Health insurance coverage for hospitalisation expenses.',
    eligibility: 'Bottom 40% families as per SECC database',
    benefit: '₹5 Lakh coverage per family per year',
    link: 'https://pmjay.gov.in',
    tag: 'Health',
    tagColor: '#fce4ec',
  },
  {
    icon: '🎓',
    title: 'PM Scholarships for SC/ST',
    ministry: 'Ministry of Social Justice',
    description: 'Scholarship support for higher education of SC/ST students.',
    eligibility: 'SC/ST students pursuing graduation/post-graduation',
    benefit: 'Up to ₹20,000 per year',
    link: 'https://scholarships.gov.in',
    tag: 'Education',
    tagColor: '#e8eaf6',
  },
  {
    icon: '🚽',
    title: 'Swachh Bharat Mission (Grameen)',
    ministry: 'Ministry of Jal Shakti',
    description: 'Incentive for construction of household toilets in rural areas.',
    eligibility: 'BPL households without a toilet',
    benefit: '₹12,000 incentive for toilet construction',
    link: 'https://sbm.gov.in/sbmgweb',
    tag: 'Sanitation',
    tagColor: '#e0f7fa',
  },
  {
    icon: '👩‍💼',
    title: 'PM Mudra Yojana',
    ministry: 'Ministry of Finance',
    description: 'Collateral-free loans for small businesses and self-employment.',
    eligibility: 'Non-corporate, non-farm small/micro enterprises',
    benefit: 'Loans up to ₹10 Lakh (Shishu/Kishore/Tarun)',
    link: 'https://mudra.org.in',
    tag: 'Business',
    tagColor: '#fff3e0',
  },
];

interface Props {
  compact?: boolean;
}

export default function GovtSupportPanel({ compact = false }: Props) {
  const [expanded, setExpanded] = useState(!compact);
  const [search, setSearch]     = useState('');
  const [selectedTag, setTag]   = useState<string | null>(null);

  const tags = [...new Set(SCHEMES.map(s => s.tag))];

  const filtered = SCHEMES.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q);
    const matchTag    = !selectedTag || s.tag === selectedTag;
    return matchSearch && matchTag;
  });

  return (
    <section style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.875rem',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* ── Header ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', background: 'transparent', border: 'none',
          borderBottom: expanded ? '1px solid var(--border-color)' : 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
          🏛️ Government Support Schemes
          <span style={{
            marginLeft: 8, fontSize: '0.72rem', background: '#e8f5e9', color: '#2e7d32',
            padding: '0.1rem 0.5rem', borderRadius: 999, fontWeight: 700,
          }}>
            {SCHEMES.length} Active
          </span>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ padding: '1rem 1.25rem' }}>
          {/* ── Search + Tags ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <input
              placeholder="🔍 Search schemes (housing, water, health…)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '0.6rem 0.9rem', border: '1px solid var(--border-color)',
                borderRadius: '0.5rem', background: 'var(--bg-color)', color: 'var(--text-primary)',
                fontSize: '0.9rem', width: '100%',
              }}
            />
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setTag(null)}
                style={{
                  padding: '0.25rem 0.7rem', borderRadius: 999,
                  border: `1px solid ${!selectedTag ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  background: !selectedTag ? 'var(--primary-color)' : 'transparent',
                  color: !selectedTag ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                All
              </button>
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setTag(t => t === tag ? null : tag)}
                  style={{
                    padding: '0.25rem 0.7rem', borderRadius: 999,
                    border: `1px solid ${selectedTag === tag ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    background: selectedTag === tag ? 'var(--primary-color)' : 'transparent',
                    color: selectedTag === tag ? 'white' : 'var(--text-secondary)',
                    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ── Scheme Cards ── */}
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No schemes match your search.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.9rem' }}>
              {filtered.map(scheme => (
                <div
                  key={scheme.title}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    background: scheme.tagColor,
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{scheme.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', lineHeight: 1.3 }}>{scheme.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#555' }}>{scheme.ministry}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#333', margin: 0 }}>{scheme.description}</p>
                  <div style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.6)', borderRadius: '0.4rem', padding: '0.4rem 0.6rem' }}>
                    <span style={{ fontWeight: 600 }}>✅ Benefit: </span>{scheme.benefit}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#555' }}>
                    <span style={{ fontWeight: 600 }}>👤 Who: </span>{scheme.eligibility}
                  </div>
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: 'auto', display: 'inline-block', fontSize: '0.78rem',
                      color: '#1565c0', fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    🔗 Apply / Learn More →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
