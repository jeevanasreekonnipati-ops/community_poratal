'use client';

import React, { useRef, useState } from 'react';

export default function BannerPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = async () => {
    if (!printRef.current) return;
    setDownloading(true);

    try {
      if (!(window as any).html2canvas) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load html2canvas'));
          document.head.appendChild(script);
        });
      }

      const html2canvas = (window as any).html2canvas;
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // 2x high resolution rendering (2400x2400 px)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = 'Sachivalayam_Platform_2x2_Academic_Poster_AITS.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err: any) {
      alert('Could not auto-generate image. Please use "Print / Save as PDF" or open public/banner.html.');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Floating Control Bar */}
      <div style={{
        position: 'sticky',
        top: '12px',
        zIndex: 9999,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '14px',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎓</span>
          <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.3px' }}>
            2ft × 2ft Academic Presentation Banner · AITS Tirupati
          </span>
        </div>
        
        {/* Download PNG Button */}
        <button
          onClick={handleDownloadPNG}
          disabled={downloading}
          style={{
            padding: '8px 18px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {downloading ? '⏳ Rendering 2400×2400 PNG…' : '📥 Download High-Res PNG (2×2)'}
        </button>

        {/* Print / Save PDF Button */}
        <button
          onClick={handlePrint}
          style={{
            padding: '8px 18px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
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
            marginLeft: '6px',
            fontWeight: 600,
          }}
        >
          ← Back to App
        </a>
      </div>

      {/* 2x2 Square Poster Canvas (1200px x 1200px, 4-Quadrant Grid matching reference) */}
      <div
        ref={printRef}
        className="poster-canvas"
        style={{
          width: '1200px',
          height: '1200px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Segoe UI', Roboto, -apple-system, Helvetica, Arial, sans-serif",
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          borderRadius: '4px',
          padding: '12px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          background: '#ffffff',
        }}
      >
        {/* ==================== 1. TOP HEADER BANNER (EXACT REFERENCE) ==================== */}
        <header style={{
          backgroundColor: '#064e3b',
          color: '#ffffff',
          borderRadius: '6px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 4px 12px rgba(6,78,59,0.3)',
        }}>
          {/* Left AITS Crest */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1
          }}>
            <img
              src="/banner_images/aits_logo_hd.png"
              alt="AITS Crest"
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                padding: '2px',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '1.28rem',
                fontWeight: 900,
                letterSpacing: '0.5px',
                color: '#ffffff',
                textTransform: 'uppercase',
                lineHeight: '1.2'
              }}>
                ANNAMACHARYA INSTITUTE OF TECHNOLOGY AND SCIENCES
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 700, marginTop: '2px' }}>
                Tirupati, 517520 | (Autonomous)
              </div>
              <div style={{ fontSize: '0.68rem', color: '#d1fae5', opacity: 0.9 }}>
                Approved by AICTE, New Delhi | Affiliated to JNTUA, Anantapuramu | NAAC &apos;A&apos; Grade | NBA Accredited
              </div>
            </div>
          </div>

          {/* Right Project Brand Title */}
          <div style={{
            textAlign: 'right',
            flexShrink: 0,
            borderLeft: '2px solid rgba(255,255,255,0.2)',
            paddingLeft: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
              <span style={{ fontSize: '1.4rem' }}>👁️</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', letterSpacing: '0.5px' }}>
                SACHIVALAYAM
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 700 }}>
              The Government Service Optimization Eye
            </div>
            <div style={{ fontSize: '0.62rem', color: '#6ee7b7', fontStyle: 'italic' }}>
              One Platform. Every Service. Connected.
            </div>
          </div>
        </header>

        {/* ==================== 4-QUADRANT MAIN CONTENT GRID (2x2) ==================== */}
        <main style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '10px',
          flex: 1,
          marginTop: '8px',
          marginBottom: '6px',
        }}>

          {/* ════════════════ QUADRANT 1: 💡 1. Introduction & Problem ════════════════ */}
          <div style={{
            border: '2px solid #064e3b',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header Pill */}
            <div style={{
              backgroundColor: '#064e3b',
              color: '#ffffff',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>💡</span> 1. Introduction & Problem
            </div>

            {/* Content Body: 2 Sub-Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.2fr', gap: '8px', padding: '8px', flex: 1 }}>
              {/* Left Sub-Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* About the Project */}
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '5px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#064e3b', marginBottom: '2px' }}>About the Project</div>
                  <p style={{ margin: 0, fontSize: '0.59rem', color: '#1f2937', lineHeight: '1.3' }}>
                    <strong>Sachivalayam Platform</strong> is a centralized digital governance ecosystem that connects citizens, village secretaries, mandal MROs, and state authorities by simplifying grievance tracking, welfare delivery, 48-hour SLA timers, and infrastructure grants in one place.
                  </p>
                </div>

                {/* The Problem */}
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '5px', padding: '6px 8px', flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#991b1b', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⚠️</span> The Problem
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '13px', fontSize: '0.58rem', color: '#374151', lineHeight: '1.25' }}>
                    <li>Grievance information is scattered with zero live status visibility.</li>
                    <li>Manual processing causes severe administrative backlogs.</li>
                    <li>Rural citizens struggle to discover matching welfare schemes.</li>
                    <li>Mandal & State officers lack live ground telemetry to flag lagging villages.</li>
                  </ul>
                </div>
              </div>

              {/* Right Sub-Column: Laptop Mockup & Solution */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Device Screen Mockup */}
                <div style={{
                  border: '1.5px solid #064e3b',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  backgroundColor: '#000',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                  position: 'relative'
                }}>
                  <div style={{ background: '#1e293b', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: '0.45rem', color: '#94a3b8', marginLeft: '2px' }}>Sachivalayam Platform · Live Web App</span>
                  </div>
                  <img
                    src="/banner_images/media_1788700572488.png"
                    alt="Sachivalayam Web Portal"
                    style={{ width: '100%', height: '95px', objectFit: 'cover', display: 'block' }}
                  />
                </div>

                {/* Our Solution */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '5px', padding: '5px 7px' }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#166534', marginBottom: '2px' }}>🌱 Our Solution</div>
                  <p style={{ margin: 0, fontSize: '0.57rem', color: '#1f2937', lineHeight: '1.25' }}>
                    Brings the complete civic resolution lifecycle into one platform — from AI grievance formalization to 48-hour SLA closure and ₹1.00 Cr emergency fund sanctions.
                  </p>
                </div>

                {/* Horizontal Lifecycle Ribbon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  fontSize: '0.52rem',
                  fontWeight: 700,
                  color: '#064e3b'
                }}>
                  <span>🔍 Discover</span>
                  <span>➔</span>
                  <span>📝 Register</span>
                  <span>➔</span>
                  <span>⏱️ 48h SLA</span>
                  <span>➔</span>
                  <span>📊 Monitor</span>
                  <span>➔</span>
                  <span>✅ Resolve</span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════ QUADRANT 2: ⚙️ 2. Key Features ════════════════ */}
          <div style={{
            border: '2px solid #064e3b',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header Pill */}
            <div style={{
              backgroundColor: '#064e3b',
              color: '#ffffff',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>⚙️</span> 2. Key Features
            </div>

            {/* 3x3 Feature Grid Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              padding: '8px',
              flex: 1
            }}>
              {/* Feature 1 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>🤖</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>AI Scheme Navigator</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Explore 12+ central & state welfare schemes with instant eligibility filters.
                </div>
              </div>

              {/* Feature 2 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>⏱️</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>48-Hour SLA Timer</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Live countdown clocks with automatic urgency scoring (Critical/High/Normal).
                </div>
              </div>

              {/* Feature 3 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>📝</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>AI Grievance Assistant</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Converts voice & informal text into structured government petitions with GPS tags.
                </div>
              </div>

              {/* Feature 4 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>📢</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>Village Notice Board</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Real-time marquee ticker for medical camps, water supply schedules & alerts.
                </div>
              </div>

              {/* Feature 5 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>🚨</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>1-Tap SOS Directory</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Direct emergency dialer for 112, 108, 104, 1902, 181, and 14400.
                </div>
              </div>

              {/* Feature 6 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>💬</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>Citizen SMS Dispatch</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Instant official resolution notifications sent via SMS and WhatsApp.
                </div>
              </div>

              {/* Feature 7 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>🔭</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>Optimizer Eye Radar</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Live mandal performance radar tracking 7+ villages with low performance alerts.
                </div>
              </div>

              {/* Feature 8 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>💰</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>State Budget Ledger</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Live ₹1.00 Crore discretionary pool for emergency infrastructure grants.
                </div>
              </div>

              {/* Feature 9 */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem' }}>🗺️</span>
                  <strong style={{ fontSize: '0.62rem', color: '#064e3b' }}>GIS Geospatial Map</strong>
                </div>
                <div style={{ fontSize: '0.54rem', color: '#4b5563', lineHeight: '1.2' }}>
                  Leaflet map pinpointing sanitation, water, and infrastructure distress locations.
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════ QUADRANT 3: 🏛️ 3. Administrative Hierarchy & Mandal Radar ════════════════ */}
          <div style={{
            border: '2px solid #064e3b',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header Pill */}
            <div style={{
              backgroundColor: '#064e3b',
              color: '#ffffff',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🏛️</span> 3. Administrative Hierarchy & Mandal Radar
            </div>

            {/* Content Body: 2 Sub-Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px', flex: 1 }}>
              {/* Left Sub-Column: 4 Governance Roles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#064e3b', marginBottom: '2px' }}>
                  Governance Roles (4 Tiers)
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.6rem' }}><strong>01. Citizen</strong> (Grassroots Level)</div>
                  <span style={{ fontSize: '0.5rem', background: '#16a34a', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>Active</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px', backgroundColor: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.6rem' }}><strong>02. Secretary</strong> (Admin / Sachivalayam)</div>
                  <span style={{ fontSize: '0.5rem', background: '#9333ea', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>48h SLA</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.6rem' }}><strong>03. Optimizer Eye</strong> (MRO / MPDO)</div>
                  <span style={{ fontSize: '0.5rem', background: '#2563eb', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>Radar</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.6rem' }}><strong>04. State Authority</strong> (CM / District)</div>
                  <span style={{ fontSize: '0.5rem', background: '#ca8a04', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>₹1 Cr Pool</span>
                </div>

                <div style={{ fontSize: '0.55rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                  Monitored Services: Water Supply, Healthcare, Roads, Education, Sanitation, Energy.
                </div>
              </div>

              {/* Right Sub-Column: Live Village Telemetry Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#064e3b', marginBottom: '2px' }}>
                  Mandal Radar - Village Performance
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.56rem', textAlign: 'center' }}>
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
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f0fdf4' }}>
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
                    <tr style={{ background: '#fef2f2' }}>
                      <td style={{ padding: '2px', textAlign: 'left', fontWeight: 700 }}>Nunna</td>
                      <td>3</td>
                      <td>1</td>
                      <td>33.3%</td>
                      <td><span style={{ color: '#dc2626', fontWeight: 700 }}>🔴 Flagged</span></td>
                    </tr>
                  </tbody>
                </table>

                {/* State Budget Pool Mini-Bar */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '4px', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem' }}>
                  <span>State Pool: <strong>₹1.00 Cr</strong></span>
                  <span>Sanctioned: <strong style={{ color: '#15803d' }}>₹49.20 L</strong></span>
                  <span>Balance: <strong style={{ color: '#0284c7' }}>₹50.80 L</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════ QUADRANT 4: 🚀 4. How It Works & Benefits ════════════════ */}
          <div style={{
            border: '2px solid #064e3b',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header Pill */}
            <div style={{
              backgroundColor: '#064e3b',
              color: '#ffffff',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🚀</span> 4. How It Works & Benefits
            </div>

            {/* Content Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px', flex: 1 }}>
              {/* Complete Event Lifecycle Ribbon */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '5px',
                padding: '4px 6px',
              }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#064e3b', marginBottom: '3px' }}>Complete Civic Issue Lifecycle</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.52rem', fontWeight: 700, color: '#15803d' }}>
                  <div style={{ textAlign: 'center' }}><span>🔍</span><br />Discover</div>
                  <span>➔</span>
                  <div style={{ textAlign: 'center' }}><span>📝</span><br />Register</div>
                  <span>➔</span>
                  <div style={{ textAlign: 'center' }}><span>⏱️</span><br />48h SLA</div>
                  <span>➔</span>
                  <div style={{ textAlign: 'center' }}><span>🧑‍💼</span><br />Verify</div>
                  <span>➔</span>
                  <div style={{ textAlign: 'center' }}><span>🔭</span><br />Escalate</div>
                  <span>➔</span>
                  <div style={{ textAlign: 'center' }}><span>✅</span><br />Resolve</div>
                </div>
              </div>

              {/* 2-Columns: Role-Based Access & Tech Stack */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '6px' }}>
                {/* Role-Based Access */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '4px 6px' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#064e3b', marginBottom: '2px' }}>Role-Based Access</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '0.52rem' }}>
                    <div style={{ background: '#ecfdf5', padding: '2px 4px', borderRadius: '3px' }}>
                      <strong style={{ color: '#166534' }}>👨‍🌾 Citizen</strong><br />AI Petition & Schemes
                    </div>
                    <div style={{ background: '#fdf4ff', padding: '2px 4px', borderRadius: '3px' }}>
                      <strong style={{ color: '#7e22ce' }}>🧑‍💼 Secretary</strong><br />48h SLA & SMS
                    </div>
                    <div style={{ background: '#eff6ff', padding: '2px 4px', borderRadius: '3px' }}>
                      <strong style={{ color: '#1d4ed8' }}>🔭 Optimizer</strong><br />Mandal Radar Flags
                    </div>
                    <div style={{ background: '#fefce8', padding: '2px 4px', borderRadius: '3px' }}>
                      <strong style={{ color: '#854d0e' }}>🏛️ Authority</strong><br />₹1 Cr Grant Ledger
                    </div>
                  </div>
                </div>

                {/* Tech Stack Box */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '4px 6px' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#064e3b', marginBottom: '2px' }}>Technology Stack</div>
                  <div style={{ fontSize: '0.51rem', color: '#374151', lineHeight: '1.25' }}>
                    • Next.js 16 (Turbopack) & React 19<br />
                    • Firebase Cloud Firestore & Auth<br />
                    • Leaflet GIS Engine & OpenStreetMap<br />
                    • UUID Isolated Security Sessions
                  </div>
                </div>
              </div>

              {/* Why Sachivalayam Platform? Checklist */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '5px', padding: '4px 6px', flex: 1 }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#166534', marginBottom: '2px' }}>Why Sachivalayam Platform?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 6px', fontSize: '0.54rem', color: '#1f2937' }}>
                  <div>✔️ Eliminates manual paperwork & delays</div>
                  <div>✔️ Strict 48-Hour SLA resolution guarantee</div>
                  <div>✔️ 100% transparent ₹1.00 Crore budget ledger</div>
                  <div>✔️ Instant citizen SMS & WhatsApp updates</div>
                  <div>✔️ AI-driven welfare scheme eligibility</div>
                  <div>✔️ Zero data leakage with UUID isolation</div>
                </div>
              </div>
            </div>
          </div>

        </main>

        {/* ==================== BOTTOM FOOTER STRIP (EXACT REFERENCE) ==================== */}
        <footer style={{
          backgroundColor: '#064e3b',
          color: '#ffffff',
          borderRadius: '4px',
          padding: '6px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.68rem',
          fontWeight: 700,
        }}>
          <span>Sachivalayam Platform — The Government Service Optimization Eye</span>
          <span style={{ color: '#a7f3d0' }}>Department of Computer Science and Engineering · AITS Tirupati</span>
          <span>Size: 2ft × 2ft (Square Poster)</span>
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
            padding: 10px !important;
          }
          button, a, div[style*="position: sticky"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
