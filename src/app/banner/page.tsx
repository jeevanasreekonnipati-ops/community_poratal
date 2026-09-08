'use client';

import React, { useRef } from 'react';

export default function BannerPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Floating Control Bar */}
      <div style={{
        position: 'sticky',
        top: '10px',
        zIndex: 9999,
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        marginBottom: '20px',
      }}>
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>
          📐 2ft × 2ft Academic Project Banner (Square Format with Web UI Snaps)
        </span>
        <button
          onClick={handlePrint}
          style={{
            padding: '8px 18px',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
            transition: 'all 0.2s',
          }}
        >
          🖨️ Print / Save as PDF
        </button>
        <a
          href="/dashboards/optimizer"
          style={{
            color: '#94a3b8',
            fontSize: '0.85rem',
            textDecoration: 'none',
            marginLeft: '10px',
          }}
        >
          ← Back to Dashboard
        </a>
      </div>

      {/* 2x2 Square Poster Canvas (1200px x 1200px scalable) */}
      <div
        ref={printRef}
        className="poster-canvas"
        style={{
          width: '1200px',
          height: '1200px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          borderRadius: '4px',
          padding: '20px 24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* ==================== HEADER ==================== */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '3px solid #14532d',
          paddingBottom: '10px',
          marginBottom: '10px',
          gap: '16px'
        }}>
          {/* Logo / Crest */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '3px solid #14532d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#f0fdf4',
            padding: '4px',
            textAlign: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <span style={{ fontSize: '1.8rem' }}>🏛️</span>
            <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#14532d', lineHeight: 1.1 }}>AITS</span>
            <span style={{ fontSize: '0.45rem', color: '#166534' }}>TIRUPATI</span>
          </div>

          {/* Title Area */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{
              margin: '0 0 4px 0',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.5px',
              textTransform: 'uppercase'
            }}>
              Sachivalayam Platform (The Government Service Optimization Eye)
            </h1>
            <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#14532d', fontWeight: 600, marginBottom: '3px' }}>
              A Multi-Tier Real-Time Grassroots Civic Governance & Discretionary Resource Allocation Ecosystem
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Department of Electronics and Communication Engineering
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', letterSpacing: '0.5px' }}>
              ANNAMACHARYA INSTITUTE OF TECHNOLOGY AND SCIENCES
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Tirupati, 517520, Andhra Pradesh, India
            </div>
          </div>

          {/* Right Emblem / QR Box */}
          <div style={{
            width: '90px',
            height: '90px',
            border: '2px solid #cbd5e1',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            flexShrink: 0,
            padding: '4px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '1.6rem' }}>👁️</span>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#0f172a' }}>OPTIMIZER EYE</span>
            <span style={{ fontSize: '0.48rem', color: '#15803d', fontWeight: 700 }}>REAL-TIME GIS</span>
          </div>
        </header>

        {/* ==================== 3-COLUMN MAIN BODY ==================== */}
        <main style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          flex: 1,
          alignItems: 'stretch'
        }}>

          {/* ══════════ COLUMN 1: INTRODUCTION, PROBLEM & UI SNAP 1 ══════════ */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Box 1: Objectives & Features */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '8px 10px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.78rem',
                padding: '3px 0',
                borderRadius: '4px',
                marginBottom: '6px',
                letterSpacing: '0.5px'
              }}>
                Introduction & Objectives
              </div>

              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.7rem',
                color: '#14532d',
                marginBottom: '4px',
                textAlign: 'center'
              }}>
                Project Goals
              </div>

              <ul style={{ margin: '0 0 6px 0', paddingLeft: '14px', fontSize: '0.67rem', color: '#334155', lineHeight: '1.3' }}>
                <li><strong>Grassroots Delivery:</strong> Direct link between rural citizens and local Village/Ward Secretariats.</li>
                <li><strong>Strict SLA Enforcement:</strong> Automated 48-hour countdown clocks with priority scoring.</li>
                <li><strong>AI Welfare Assistant:</strong> Converts informal citizen voice/text into structured government petitions.</li>
              </ul>

              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.7rem',
                color: '#92400e',
                marginBottom: '4px'
              }}>
                Why Optimization Eye?
              </div>

              <p style={{ margin: '0', fontSize: '0.66rem', color: '#334155', lineHeight: '1.25' }}>
                Eliminates administrative blind spots by providing MRO/MPDO officers with live grievance telemetry, scheme gap heatmaps, and low-performing village alerts.
              </p>
            </div>

            {/* Box 2: UI SNAPSHOT - Citizen & Landing Interface */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '6px 8px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '2px 0',
                borderRadius: '3px',
                marginBottom: '5px'
              }}>
                📸 Web UI Snap: Citizen Portal & Landing Page
              </div>

              <div style={{
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                maxHeight: '140px',
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img
                  src="/banner_images/media_1788700572488.png"
                  alt="Sachivalayam Platform Web Portal"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Callout highlights */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                marginTop: '5px',
                fontSize: '0.62rem'
              }}>
                <div style={{ background: '#ecfdf5', padding: '3px 4px', borderRadius: '3px', border: '1px solid #a7f3d0' }}>
                  <strong style={{ color: '#166534' }}>🤖 AI Scheme Finder:</strong> 12+ AP Welfare schemes
                </div>
                <div style={{ background: '#eff6ff', padding: '3px 4px', borderRadius: '3px', border: '1px solid #bfdbfe' }}>
                  <strong style={{ color: '#1e40af' }}>🚨 1-Tap SOS:</strong> 112, 108, 104, 1902 Helplines
                </div>
              </div>
            </div>

            {/* Box 3: Technology Stack */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '6px 8px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '2px 0',
                borderRadius: '3px',
                marginBottom: '5px'
              }}>
                Technology Stack
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.62rem' }}>
                <div style={{ border: '1px solid #e2e8f0', padding: '3px 5px', borderRadius: '3px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>⚡ Frontend:</strong> Next.js 16, React 19, TS
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '3px 5px', borderRadius: '3px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🔥 Backend:</strong> Firebase Cloud Firestore
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '3px 5px', borderRadius: '3px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🗺️ GIS Maps:</strong> Leaflet + OpenStreetMap
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '3px 5px', borderRadius: '3px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🔒 Auth:</strong> UUID Isolated Sessions
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ COLUMN 2: ARCHITECTURE FLOW & UI SNAP 2 (OPTIMIZER EYE) ══════════ */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Box 1: Multi-Role Workflow */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '8px 10px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.78rem',
                padding: '3px 0',
                borderRadius: '4px',
                marginBottom: '6px'
              }}>
                Multi-Role Governance Workflow
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.64rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#ecfdf5', padding: '3px 6px', borderRadius: '3px', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.85rem' }}>👨‍🌾</span>
                  <div><strong>1. Citizen Tier:</strong> AI Petition Formalization, Geotagging & Status Tracker</div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.6rem', color: '#16a34a', fontWeight: 900, margin: '-2px 0' }}>↓</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0fdf4', padding: '3px 6px', borderRadius: '3px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '0.85rem' }}>🧑‍💼</span>
                  <div><strong>2. Secretary Tier:</strong> 48h SLA Countdown & Official SMS Resolution Dispatcher</div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.6rem', color: '#16a34a', fontWeight: 900, margin: '-2px 0' }}>↓</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', padding: '3px 6px', borderRadius: '3px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '0.85rem' }}>🔭</span>
                  <div><strong>3. Optimizer Eye (MRO):</strong> Real-Time Mandal Radar & Village Flagging</div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.6rem', color: '#16a34a', fontWeight: 900, margin: '-2px 0' }}>↓</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#faf5ff', padding: '3px 6px', borderRadius: '3px', border: '1px solid #e9d5ff' }}>
                  <span style={{ fontSize: '0.85rem' }}>🏛️</span>
                  <div><strong>4. Higher Authority (State/CM):</strong> ₹1.00 Crore Discretionary Budget Ledger</div>
                </div>
              </div>
            </div>

            {/* Box 2: UI SNAPSHOT - Optimizer Eye Telemetry Dashboard */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '6px 8px',
              backgroundColor: '#0f172a',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '2px 0',
                borderRadius: '3px',
                marginBottom: '5px'
              }}>
                📸 Web UI Snap: Optimizer Eye (MRO/MPDO) Dashboard
              </div>

              <div style={{
                border: '1px solid #334155',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                maxHeight: '135px',
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img
                  src="/banner_images/media_1788830721749.png"
                  alt="Optimizer Eye Real-time Dashboard"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* KPI Badges from real telemetry */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '3px',
                marginTop: '5px',
                textAlign: 'center',
                fontSize: '0.58rem'
              }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '3px' }}>
                  <span style={{ color: '#94a3b8' }}>Villages</span><br />
                  <strong style={{ color: '#fff', fontSize: '0.7rem' }}>7 Monitored</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '3px' }}>
                  <span style={{ color: '#94a3b8' }}>Resolution</span><br />
                  <strong style={{ color: '#6ee7b7', fontSize: '0.7rem' }}>57% Active</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '3px' }}>
                  <span style={{ color: '#94a3b8' }}>Flagged</span><br />
                  <strong style={{ color: '#fca5a5', fontSize: '0.7rem' }}>3 Villages</strong>
                </div>
              </div>
            </div>

            {/* Box 3: State Budget Ledger */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '6px 8px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '2px 0',
                borderRadius: '3px',
                marginBottom: '5px'
              }}>
                Discretionary Development Grant Ledger (₹1.00 Cr)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', textAlign: 'center', fontSize: '0.62rem' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px', borderRadius: '3px' }}>
                  <span style={{ color: '#64748b' }}>Total Pool</span><br />
                  <strong style={{ color: '#0f172a', fontSize: '0.75rem' }}>₹1,00,00,000</strong>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #86efac', padding: '3px', borderRadius: '3px' }}>
                  <span style={{ color: '#166534' }}>Sanctioned (8)</span><br />
                  <strong style={{ color: '#15803d', fontSize: '0.75rem' }}>₹49,20,000</strong>
                </div>
                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #7dd3fc', padding: '3px', borderRadius: '3px' }}>
                  <span style={{ color: '#0369a1' }}>Available</span><br />
                  <strong style={{ color: '#0284c7', fontSize: '0.75rem' }}>₹50,80,000</strong>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ COLUMN 3: RESULTS, UI SNAP 3 (ADMIN MODERATION) & CONCLUSION ══════════ */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Box 1: Village Performance Table */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '6px 8px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '2px 0',
                borderRadius: '3px',
                marginBottom: '5px'
              }}>
                Village Performance & Telemetry Results
              </div>

              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.6rem',
                textAlign: 'center',
                marginBottom: '4px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                    <th style={{ padding: '2px', textAlign: 'left' }}>Village</th>
                    <th style={{ padding: '2px' }}>Total</th>
                    <th style={{ padding: '2px' }}>Resolved</th>
                    <th style={{ padding: '2px' }}>Rate</th>
                    <th style={{ padding: '2px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                    <td style={{ padding: '2px', textAlign: 'left', fontWeight: 700 }}>Gollapudi</td>
                    <td>7</td>
                    <td>6</td>
                    <td>85.7%</td>
                    <td><span style={{ color: '#15803d', fontWeight: 700 }}>🟢 Excellent</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '2px', textAlign: 'left', fontWeight: 700 }}>Penamaluru</td>
                    <td>4</td>
                    <td>3</td>
                    <td>75.0%</td>
                    <td><span style={{ color: '#15803d', fontWeight: 700 }}>🟢 Good</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '2px', textAlign: 'left', fontWeight: 700 }}>Kankipadu</td>
                    <td>3</td>
                    <td>2</td>
                    <td>66.7%</td>
                    <td><span style={{ color: '#15803d', fontWeight: 700 }}>🟢 Normal</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '2px', textAlign: 'left', fontWeight: 700 }}>Poranki</td>
                    <td>2</td>
                    <td>1</td>
                    <td>50.0%</td>
                    <td><span style={{ color: '#854d0e', fontWeight: 700 }}>🟡 Average</span></td>
                  </tr>
                  <tr style={{ backgroundColor: '#fef2f2' }}>
                    <td style={{ padding: '2px', textAlign: 'left', fontWeight: 700 }}>Nunna</td>
                    <td>3</td>
                    <td>1</td>
                    <td>33.3%</td>
                    <td><span style={{ color: '#dc2626', fontWeight: 700 }}>🔴 Flagged</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Box 2: UI SNAPSHOT - Admin / Secretary Dashboard */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '6px 8px',
              backgroundColor: '#fdf4ff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#9333ea',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '2px 0',
                borderRadius: '3px',
                marginBottom: '5px'
              }}>
                📸 Web UI Snap: Secretary Admin Dashboard
              </div>

              <div style={{
                border: '1px solid #e9d5ff',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                maxHeight: '135px',
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img
                  src="/banner_images/media_1788586398513.png"
                  alt="Admin Secretary Portal"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ fontSize: '0.62rem', color: '#6b21a8', marginTop: '4px', textAlign: 'center', fontWeight: 600 }}>
                ⏱️ 48-Hour SLA Countdown · Auto SMS/WhatsApp Resolution Dispatcher
              </div>
            </div>

            {/* Box 3: Conclusions & References */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '6px 8px',
              backgroundColor: '#ffffff',
              fontSize: '0.62rem'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '2px 0',
                borderRadius: '3px',
                marginBottom: '4px'
              }}>
                Conclusions & References
              </div>

              <ul style={{ margin: '0 0 4px 0', paddingLeft: '14px', color: '#334155', lineHeight: '1.25' }}>
                <li><strong>Zero Leakage:</strong> Real-time accountability across all 4 civic administrative tiers.</li>
                <li><strong>64% Faster Resolution:</strong> Enforced by strict 48h SLA timers and priority scoring.</li>
              </ul>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '3px', color: '#64748b', fontStyle: 'italic', fontSize: '0.58rem' }}>
                1. Govt. of AP Grama/Ward Sachivalayam Mission (2026).<br />
                2. Sincere thanks to ECE Faculty & Administration at AITS Tirupati.
              </div>
            </div>
          </section>

        </main>

        {/* ==================== FOOTER ==================== */}
        <footer style={{
          borderTop: '2px solid #e2e8f0',
          paddingTop: '6px',
          marginTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.68rem',
          color: '#64748b'
        }}>
          <span>Project: <strong>Sachivalayam Platform (The Government Service Optimization Eye)</strong></span>
          <span>Banner Size: <strong>2ft × 2ft (Square 1:1 Aspect Ratio)</strong></span>
          <span>Partner: <strong>AITS Tirupati, Andhra Pradesh</strong></span>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .poster-canvas {
            width: 100vw !important;
            height: 100vw !important;
            max-width: 100% !important;
            max-height: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 12px !important;
          }
          button, a, div[style*="position: sticky"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
