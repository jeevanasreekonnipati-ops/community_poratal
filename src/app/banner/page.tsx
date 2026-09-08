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
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = 'Sachivalayam_Platform_2x2_Banner_AITS.png';
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
        gap: '14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>
          📐 2ft × 2ft Academic Banner (AITS CSE)
        </span>
        
        {/* Download PNG Button */}
        <button
          onClick={handleDownloadPNG}
          disabled={downloading}
          style={{
            padding: '8px 18px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {downloading ? '⏳ Generating PNG…' : '📥 Download High-Res PNG (2×2)'}
        </button>

        {/* Print / Save PDF Button */}
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
            marginLeft: '6px',
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
          padding: '18px 22px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* ==================== EXACT REFERENCE HEADER ==================== */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '3px solid #14532d',
          paddingBottom: '10px',
          marginBottom: '10px',
          position: 'relative',
        }}>
          {/* Authentic AITS Circular Logo */}
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src="/banner_images/aits_logo_hd.png"
              alt="Annamacharya Educational Trust Logo"
              style={{
                width: '85px',
                height: '85px',
                borderRadius: '50%',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Centered Typography Matching Reference */}
          <div style={{ width: '100%', textAlign: 'center', padding: '0 95px' }}>
            <h1 style={{
              margin: '0 0 3px 0',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#000000',
              letterSpacing: '-0.3px',
              fontFamily: "'Segoe UI', Arial, sans-serif"
            }}>
              Sachivalayam Platform (The Government Service Optimization Eye)
            </h1>
            <div style={{
              fontSize: '0.98rem',
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#000000',
              marginBottom: '2px',
              fontFamily: "'Segoe UI', Arial, sans-serif"
            }}>
              Department of Computer Science and Engineering
            </div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#000000',
              letterSpacing: '0.2px',
              textTransform: 'uppercase',
              marginBottom: '2px',
              fontFamily: "'Segoe UI', Arial, sans-serif"
            }}>
              ANNAMACHARYA INSTITUTE OF TECHNOLOGY AND SCIENCES
            </div>
            <div style={{
              fontSize: '0.78rem',
              color: '#000000',
              fontWeight: 600,
              fontFamily: "'Segoe UI', Arial, sans-serif"
            }}>
              Tirupati, 517520, India
            </div>
          </div>
        </header>

        {/* ==================== 3-COLUMN MAIN BODY ==================== */}
        <main style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr 0.95fr',
          gap: '12px',
          flex: 1,
          alignItems: 'stretch'
        }}>

          {/* ══════════ COLUMN 1: INTRODUCTION, OBJECTIVES & UI SNAP 1 ══════════ */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Box 1: Objectives & Problem Statement */}
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
                Introduction & Problem Statement
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
                Challenges in Grassroots Governance
              </div>

              <ul style={{ margin: '0 0 6px 0', paddingLeft: '14px', fontSize: '0.67rem', color: '#334155', lineHeight: '1.3' }}>
                <li><strong>Grievance Backlogs:</strong> Lack of strict resolution timelines and escalation mechanisms.</li>
                <li><strong>Scheme Awareness Gaps:</strong> Rural citizens missing eligible benefits due to complex criteria.</li>
                <li><strong>Administrative Blind Spots:</strong> Mandal & State officers lack live ground telemetry.</li>
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
                Proposed Platform Objectives
              </div>

              <p style={{ margin: '0', fontSize: '0.66rem', color: '#334155', lineHeight: '1.25' }}>
                Provide an end-to-end <strong>4-Tier real-time digital architecture</strong> connecting Citizens, Village Secretaries, Mandal MROs (Optimizer Eye), and State Authorities with 48h SLA accountability and ₹1.00 Cr emergency funds.
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
                📸 Tier 1 Web UI: Citizen Portal & Welfare Finder
              </div>

              <div style={{
                border: '1px solid #cbd5e1',
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
                  src="/banner_images/media_1788700572488.png"
                  alt="Citizen Landing Portal"
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
                  <strong style={{ color: '#15803d' }}>⚡ Frontend:</strong> Next.js 16 (Turbopack), React 19
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '3px 5px', borderRadius: '3px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🔥 Backend:</strong> Firebase Cloud Firestore & Auth
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '3px 5px', borderRadius: '3px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🗺️ GIS Mapping:</strong> Leaflet + OpenStreetMap
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '3px 5px', borderRadius: '3px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🔒 Security:</strong> UUID Token Isolated Sessions
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ COLUMN 2: COMPLETE APP WORKFLOW & SYSTEM FLOWCHART ══════════ */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Box 1: End-to-End App Workflow */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '8px 10px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              flex: 1
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.82rem',
                padding: '4px 0',
                borderRadius: '4px',
                marginBottom: '6px',
                letterSpacing: '0.5px'
              }}>
                🔄 End-to-End Application Workflow (4-Tier Flow)
              </div>

              {/* Step-by-Step Interactive Workflow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                
                {/* Step 1 */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '5px',
                  padding: '5px 8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px'
                }}>
                  <div style={{
                    backgroundColor: '#15803d',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>1</div>
                  <div style={{ fontSize: '0.64rem', color: '#0f172a' }}>
                    <strong style={{ color: '#14532d' }}>Citizen Intake & AI Formulation:</strong><br />
                    Citizen logs in → AI Scheme Navigator filters eligible schemes → AI Grievance Assistant formalizes complaint into official petition with GPS Geotag.
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#16a34a', fontWeight: 900, margin: '-3px 0' }}>
                  ↓ <em>[Real-Time Cloud Firestore Sync & SLA Clock Initialization]</em>
                </div>

                {/* Step 2 */}
                <div style={{
                  backgroundColor: '#fdf4ff',
                  border: '1.5px solid #d8b4fe',
                  borderRadius: '5px',
                  padding: '5px 8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px'
                }}>
                  <div style={{
                    backgroundColor: '#9333ea',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>2</div>
                  <div style={{ fontSize: '0.64rem', color: '#0f172a' }}>
                    <strong style={{ color: '#7e22ce' }}>Secretary (Admin) SLA Tracking & Resolution:</strong><br />
                    Secretary opens inbox → <strong>48-Hour SLA Countdown Clock</strong> begins → Urgency score auto-calculated → Secretary resolves issue & dispatches 1-Click SMS/WhatsApp.
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#16a34a', fontWeight: 900, margin: '-3px 0' }}>
                  ↓ <em>[Mandal Aggregation & Automated Escalation Radar]</em>
                </div>

                {/* Step 3 */}
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1.5px solid #93c5fd',
                  borderRadius: '5px',
                  padding: '5px 8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px'
                }}>
                  <div style={{
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>3</div>
                  <div style={{ fontSize: '0.64rem', color: '#0f172a' }}>
                    <strong style={{ color: '#1d4ed8' }}>Optimizer Eye (MRO/MPDO) Telemetry & Radar:</strong><br />
                    MRO tracks all mandal villages → Low-performing villages (&lt;50%) are <strong>🔴 Flagged</strong> → Transmits monthly report & proposes Special Infrastructure Grants.
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#16a34a', fontWeight: 900, margin: '-3px 0' }}>
                  ↓ <em>[Discretionary Grant Ledger Sanctioning]</em>
                </div>

                {/* Step 4 */}
                <div style={{
                  backgroundColor: '#fefce8',
                  border: '1.5px solid #fde047',
                  borderRadius: '5px',
                  padding: '5px 8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px'
                }}>
                  <div style={{
                    backgroundColor: '#ca8a04',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>4</div>
                  <div style={{ fontSize: '0.64rem', color: '#0f172a' }}>
                    <strong style={{ color: '#854d0e' }}>State Higher Authority & Grant Sanctioning:</strong><br />
                    Authority reviews statewide policy gaps → Authorizes emergency grants from <strong>₹1.00 Cr State Pool</strong> → Instant ledger deduction & ground release.
                  </div>
                </div>

              </div>

              {/* Mathematical Urgency Scoring Model */}
              <div style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 6px',
                borderRadius: '4px',
                marginTop: '6px',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '0.63rem'
              }}>
                <strong>P_score = [ 0.65·(N_resolved / N_total) + 0.35·(1 - T_breach / N_total) ] × 100</strong>
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
                📸 Tier 3 Web UI: Optimizer Eye (MRO/MPDO) Dashboard
              </div>

              <div style={{
                border: '1px solid #334155',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                maxHeight: '115px',
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
                marginTop: '4px',
                textAlign: 'center',
                fontSize: '0.58rem'
              }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '3px' }}>
                  <span style={{ color: '#94a3b8' }}>Villages</span><br />
                  <strong style={{ color: '#fff', fontSize: '0.68rem' }}>7 Monitored</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '3px' }}>
                  <span style={{ color: '#94a3b8' }}>Resolution</span><br />
                  <strong style={{ color: '#6ee7b7', fontSize: '0.68rem' }}>57% Active</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '3px' }}>
                  <span style={{ color: '#94a3b8' }}>Flagged</span><br />
                  <strong style={{ color: '#fca5a5', fontSize: '0.68rem' }}>3 Villages</strong>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ COLUMN 3: RESULTS, ADMIN MODERATION & BUDGET LEDGER ══════════ */}
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
            </div>

            {/* Box 2: UI SNAPSHOT - Admin Secretary Dashboard */}
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
                📸 Tier 2 Web UI: Secretary Admin Portal
              </div>

              <div style={{
                border: '1px solid #e9d5ff',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                maxHeight: '115px',
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

            {/* Box 3: Discretionary Grant Pool */}
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
                fontSize: '0.74rem',
                padding: '2px 0',
                borderRadius: '3px',
                marginBottom: '5px'
              }}>
                Tier 4: State Discretionary Fund Ledger (₹1.00 Cr)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px', textAlign: 'center', fontSize: '0.6rem' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px', borderRadius: '3px' }}>
                  <span style={{ color: '#64748b' }}>Pool</span><br />
                  <strong style={{ color: '#0f172a', fontSize: '0.72rem' }}>₹1,00,00,000</strong>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #86efac', padding: '3px', borderRadius: '3px' }}>
                  <span style={{ color: '#166534' }}>Sanctioned</span><br />
                  <strong style={{ color: '#15803d', fontSize: '0.72rem' }}>₹49,20,000</strong>
                </div>
                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #7dd3fc', padding: '3px', borderRadius: '3px' }}>
                  <span style={{ color: '#0369a1' }}>Balance</span><br />
                  <strong style={{ color: '#0284c7', fontSize: '0.72rem' }}>₹50,80,000</strong>
                </div>
              </div>
            </div>

            {/* Box 4: Conclusions & References */}
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
                Conclusions & Impact
              </div>

              <ul style={{ margin: '0 0 4px 0', paddingLeft: '14px', color: '#334155', lineHeight: '1.25' }}>
                <li><strong>Zero Backlogs:</strong> 64% faster turnaround via automated 48h SLA clocks.</li>
                <li><strong>Targeted Funding:</strong> ₹49.20 Lakhs disbursed across 8 emergency infrastructure projects.</li>
              </ul>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '3px', color: '#64748b', fontStyle: 'italic', fontSize: '0.58rem' }}>
                Department of CSE · AITS Tirupati, Andhra Pradesh
              </div>
            </div>
          </section>

        </main>

        {/* ==================== FOOTER ==================== */}
        <footer style={{
          borderTop: '2px solid #e2e8f0',
          paddingTop: '5px',
          marginTop: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.68rem',
          color: '#64748b'
        }}>
          <span>Project: <strong>Sachivalayam Platform (The Government Service Optimization Eye)</strong></span>
          <span>Banner Size: <strong>2ft × 2ft (Square 1:1 Aspect Ratio)</strong></span>
          <span>Department: <strong>Computer Science and Engineering (AITS Tirupati)</strong></span>
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
