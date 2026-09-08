'use client';

import React, { useState } from 'react';
import { GOVERNMENT_SCHEMES, Scheme } from '@/lib/schemes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAutoFillGrievance?: (data: { locationName: string; type: string; description: string }) => void;
}

export default function AIAssistantModal({ isOpen, onClose, onAutoFillGrievance }: Props) {
  const [tab, setTab] = useState<'schemes' | 'grievance'>('schemes');

  // Scheme Finder filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [incomeFilter, setIncomeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Grievance AI Formatter
  const [rawProblem, setRawProblem] = useState('');
  const [rawLocation, setRawLocation] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{
    formalSubject: string;
    category: string;
    urgency: string;
    formalBody: string;
    actionablePoints: string[];
  } | null>(null);

  if (!isOpen) return null;

  // Filter schemes
  const filteredSchemes = GOVERNMENT_SCHEMES.filter((scheme) => {
    const matchesCat = selectedCategory === 'all' || scheme.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) || scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleGenerateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawProblem.trim()) return;

    setGenerating(true);
    setTimeout(() => {
      let inferredType = 'sanitation';
      let urgency = 'High (48-Hr SLA)';
      const p = rawProblem.toLowerCase();

      if (p.includes('water') || p.includes('drain') || p.includes('garbage') || p.includes('ro plant')) {
        inferredType = 'sanitation';
        urgency = 'Critical (24-Hr SLA)';
      } else if (p.includes('school') || p.includes('teacher') || p.includes('book') || p.includes('class')) {
        inferredType = 'school';
        urgency = 'High (48-Hr SLA)';
      } else if (p.includes('hospital') || p.includes('doctor') || p.includes('medicine') || p.includes('clinic')) {
        inferredType = 'hospital';
        urgency = 'Critical (Immediate)';
      } else if (p.includes('road') || p.includes('bus') || p.includes('street light') || p.includes('pothole')) {
        inferredType = 'transport';
        urgency = 'Normal (72-Hr SLA)';
      } else if (p.includes('pension') || p.includes('ration') || p.includes('scheme') || p.includes('support')) {
        inferredType = 'gov_support';
        urgency = 'High (48-Hr SLA)';
      }

      setGeneratedDraft({
        formalSubject: `Formal Grievance Petition: Rectification of ${rawProblem.slice(0, 45)}...`,
        category: inferredType,
        urgency,
        formalBody: `Respected Panchayat Secretary / Ward Officer,\n\nI am writing to formally place on record a severe civic / infrastructure constraint at ${rawLocation || 'our locality'}.\n\nSpecific Issue Reported:\n"${rawProblem.trim()}"\n\nThis constraint is directly impacting daily household activities and village health safety standards. Kindly inspect the site and initiate remedial works as per Citizen Charter SLA standards.`,
        actionablePoints: [
          'Site inspection by Engineering/Sanitation Assistant within 24 hours',
          'Immediate issue rectification and quality signoff',
          'Notification to resident on grievance resolution portal'
        ]
      });
      setGenerating(false);
    }, 600);
  };

  const handleApplyToForm = () => {
    if (generatedDraft && onAutoFillGrievance) {
      onAutoFillGrievance({
        locationName: rawLocation || 'Village Ward Center',
        type: generatedDraft.category,
        description: generatedDraft.formalBody,
      });
      onClose();
    }
  };

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
        maxWidth: '820px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.7rem' }}>🤖</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Citizen AI Assistant & Welfare Navigator
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                Discover eligible schemes & generate formal Sachivalayam petitions with 1 click
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

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          padding: '0.5rem 1.5rem 0 1.5rem',
          gap: '1rem',
        }}>
          <button
            onClick={() => setTab('schemes')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              borderBottom: tab === 'schemes' ? '3px solid #10b981' : '3px solid transparent',
              backgroundColor: 'transparent',
              fontWeight: tab === 'schemes' ? 800 : 600,
              color: tab === 'schemes' ? '#059669' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            🎯 Scheme Finder ({filteredSchemes.length})
          </button>
          <button
            onClick={() => setTab('grievance')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              borderBottom: tab === 'grievance' ? '3px solid #10b981' : '3px solid transparent',
              backgroundColor: 'transparent',
              fontWeight: tab === 'grievance' ? 800 : 600,
              color: tab === 'grievance' ? '#059669' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            ✍️ AI Grievance Formalizer
          </button>
        </div>

        {/* Tab 1: Scheme Finder */}
        {tab === 'schemes' && (
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Target Beneficiary Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="all">All Categories</option>
                  <option value="farmer">🌾 Farmers & Agriculture</option>
                  <option value="women">👩 Women & Mothers</option>
                  <option value="education">🎓 Students & Education</option>
                  <option value="health">🩺 Health & Medical</option>
                  <option value="pension">🧓 Elderly & Pensioners</option>
                  <option value="water">🚰 Drinking Water & Sanitation</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Search Scheme Name or Keyword
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rythu, Aarogyasri, Amma Vodi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Scheme Cards */}
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>📜</span>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{scheme.name}</strong>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                    }}>
                      {scheme.category}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                    {scheme.description}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.5rem',
                    marginTop: '0.35rem',
                    padding: '0.65rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    fontSize: '0.82rem',
                  }}>
                    <div>
                      <strong style={{ color: '#059669' }}>🎁 Benefit: </strong>
                      <span style={{ color: '#1e293b' }}>{scheme.benefits}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#2563eb' }}>📋 Eligibility: </strong>
                      <span style={{ color: '#1e293b' }}>{scheme.eligibility}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Grievance AI Formatter */}
        {tab === 'grievance' && (
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <form onSubmit={handleGenerateDraft} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Location / Facility Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ward 4 Main Road / Gandhi Nagar School"
                  value={rawLocation}
                  onChange={(e) => setRawLocation(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Describe your problem in your own words *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Drinking water pump is not working for 3 days and contaminated water is leaking onto the road near the primary school..."
                  value={rawProblem}
                  onChange={(e) => setRawProblem(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={generating || !rawProblem.trim()}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: 'var(--primary-color)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {generating ? '⚙️ Formatting with AI Citizen Model...' : '✨ Generate Official Government Petition'}
              </button>
            </form>

            {/* AI Generated Result */}
            {generatedDraft && (
              <div style={{
                padding: '1.2rem',
                borderRadius: '12px',
                border: '1px solid #86efac',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: '#bbf7d0', color: '#166534' }}>
                    ✅ AI Formatted Petition Ready
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                    ⚡ Urgency: {generatedDraft.urgency}
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  {generatedDraft.formalSubject}
                </div>

                <pre style={{
                  margin: 0,
                  padding: '0.85rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #dcfce7',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '0.86rem',
                  color: '#1e293b',
                  lineHeight: '1.45',
                }}>
                  {generatedDraft.formalBody}
                </pre>

                {onAutoFillGrievance && (
                  <button
                    onClick={handleApplyToForm}
                    style={{
                      marginTop: '0.35rem',
                      padding: '0.65rem 1.25rem',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    📋 Auto-Fill Into Citizen Issue Report Form
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
