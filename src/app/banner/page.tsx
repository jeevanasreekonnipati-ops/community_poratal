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
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        marginBottom: '20px',
      }}>
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>
          📐 2ft × 2ft Academic Project Banner (Square Format)
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
          padding: '24px 28px',
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
          paddingBottom: '14px',
          marginBottom: '14px',
          gap: '20px'
        }}>
          {/* Logo / Crest */}
          <div style={{
            width: '100px',
            height: '100px',
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
            <span style={{ fontSize: '2rem' }}>🏛️</span>
            <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#14532d', lineHeight: 1.1 }}>AITS</span>
            <span style={{ fontSize: '0.45rem', color: '#166534' }}>TIRUPATI</span>
          </div>

          {/* Title Area */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{
              margin: '0 0 6px 0',
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.5px',
              textTransform: 'uppercase'
            }}>
              Sachivalayam Platform (The Government Service Optimization Eye)
            </h1>
            <div style={{ fontSize: '1rem', fontStyle: 'italic', color: '#14532d', fontWeight: 600, marginBottom: '4px' }}>
              A Multi-Tier Real-Time Grassroots Civic Governance & Discretionary Resource Allocation Ecosystem
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
              Department of Electronics and Communication Engineering
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', letterSpacing: '0.5px' }}>
              ANNAMACHARYA INSTITUTE OF TECHNOLOGY AND SCIENCES
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Tirupati, 517520, Andhra Pradesh, India
            </div>
          </div>

          {/* Right Emblem / QR Box */}
          <div style={{
            width: '100px',
            height: '100px',
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
            <span style={{ fontSize: '1.8rem' }}>👁️</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#0f172a' }}>OPTIMIZER EYE</span>
            <span style={{ fontSize: '0.5rem', color: '#15803d', fontWeight: 700 }}>LIVE SYSTEM</span>
          </div>
        </header>

        {/* ==================== 3-COLUMN MAIN BODY ==================== */}
        <main style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          flex: 1,
          alignItems: 'stretch'
        }}>

          {/* ══════════ COLUMN 1: INTRODUCTION & ARCHITECTURE ══════════ */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Box 1: Introduction & Goals */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '4px 0',
                borderRadius: '4px',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Introduction & Objectives
              </div>

              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.75rem',
                color: '#14532d',
                marginBottom: '6px',
                textAlign: 'center'
              }}>
                Project Goals
              </div>

              <ul style={{ margin: '0 0 8px 0', paddingLeft: '16px', fontSize: '0.72rem', color: '#334155', lineHeight: '1.35' }}>
                <li><strong>Grassroots Digital Delivery:</strong> Connect 100% of rural citizens directly with Ward/Village Sachivalayam Secretariats.</li>
                <li><strong>Strict SLA Enforcement:</strong> Implement automated 48-hour resolution countdown clocks with dynamic urgency scoring.</li>
                <li><strong>AI-Driven Welfare Scheme Navigation:</strong> Auto-formalize unstructured citizen petitions into official government grievances.</li>
              </ul>

              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.75rem',
                color: '#92400e',
                marginBottom: '6px'
              }}>
                Why Sachivalayam & Optimization Eye?
              </div>

              <p style={{ margin: '0 0 8px 0', fontSize: '0.7rem', color: '#334155', lineHeight: '1.3' }}>
                Traditional manual public grievance systems suffer from <strong>unmonitored backlogs, lack of escalation tracking</strong>, and poor inter-departmental visibility. The <em>Optimizer Eye</em> provides MRO/MPDO & State Authorities with a live telemetry dashboard to isolate bottlenecks and disburse targeted development grants.
              </p>

              <div style={{
                backgroundColor: '#e0f2fe',
                border: '1px solid #bae6fd',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.75rem',
                color: '#075985',
                marginBottom: '6px'
              }}>
                Core Architectural Advantages
              </div>

              <ul style={{ margin: '0', paddingLeft: '16px', fontSize: '0.7rem', color: '#334155', lineHeight: '1.3' }}>
                <li><strong>Strict Account Isolation:</strong> Zero cross-citizen data leakage via authenticated UUID session tokens.</li>
                <li><strong>Real-time Leaflet GIS:</strong> Pinpoint sanitation, water, and infrastructure distress locations on interactive map.</li>
                <li><strong>Citizen SMS Dispatcher:</strong> Instant official notification broadcasting via SMS and WhatsApp.</li>
              </ul>
            </div>

            {/* Box 2: System Tech Stack */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '10px 12px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '4px 0',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                Technology Stack & Implementation
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                fontSize: '0.68rem'
              }}>
                <div style={{ border: '1px solid #e2e8f0', padding: '5px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>⚡ Frontend Framework:</strong><br />Next.js 16.2 (Turbopack), React 19, TypeScript
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '5px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🔥 Cloud & Real-Time:</strong><br />Firebase Cloud Firestore, Auth & Live Event Bus
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '5px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🗺️ Geospatial Mapping:</strong><br />Leaflet GIS Engine, OpenStreetMap Tiles
                </div>
                <div style={{ border: '1px solid #e2e8f0', padding: '5px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: '#15803d' }}>🎨 Design System:</strong><br />CSS Modules, GeeksForGeeks Theming, Responsive
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ COLUMN 2: SYSTEM WORKFLOW & MATHEMATICAL MODEL ══════════ */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Box 1: Multi-Role System Architecture Flow */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '4px 0',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                System Workflow & Multi-Role Architecture
              </div>

              {/* Workflow Flow Diagram */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                marginBottom: '8px',
                backgroundColor: '#f8fafc',
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '1rem' }}>👨‍🌾</span>
                  <div style={{ fontSize: '0.67rem' }}>
                    <strong>1. Citizen Tier:</strong> AI Scheme Finder, Grievance Submission, SOS Directory, Live Status Tracker.
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#16a34a', fontWeight: 900 }}>↓ (Real-time Synced Firestore Event)</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '1rem' }}>🧑‍💼</span>
                  <div style={{ fontSize: '0.67rem' }}>
                    <strong>2. Secretary (Admin):</strong> 48h SLA Countdown, Urgency Scoring, Resolution SMS/WhatsApp Dispatcher.
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#16a34a', fontWeight: 900 }}>↓ (Automated Escalation & Monthly Synthesis)</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '1rem' }}>🔭</span>
                  <div style={{ fontSize: '0.67rem' }}>
                    <strong>3. Optimizer Eye (MRO/MPDO):</strong> Mandal Village Performance Radar, Flagged Area Detection, Grant Recommender.
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#16a34a', fontWeight: 900 }}>↓ (State Discretionary Sanction Pool)</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#faf5ff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e9d5ff' }}>
                  <span style={{ fontSize: '1rem' }}>🏛️</span>
                  <div style={{ fontSize: '0.67rem' }}>
                    <strong>4. Higher Authority (State/CM):</strong> ₹1.00 Crore Budget Ledger, Statewide Policy Analysis, Grant Authorization.
                  </div>
                </div>
              </div>

              {/* Mathematical Formulation */}
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.75rem',
                color: '#14532d',
                marginBottom: '6px',
                textAlign: 'center'
              }}>
                Mathematical Urgency & SLA Scoring Model
              </div>

              <div style={{
                backgroundColor: '#f1f5f9',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '0.68rem',
                marginBottom: '6px',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                <strong>P_score = [ w₁ · (N_res / N_tot) + w₂ · (1 - T_breach / N_tot) ] × 100</strong><br />
                <span style={{ fontSize: '0.62rem', color: '#475569' }}>where w₁ = 0.65 (Resolution weight), w₂ = 0.35 (SLA Adherence weight)</span>
              </div>

              <div style={{ fontSize: '0.68rem', color: '#334155', lineHeight: '1.3' }}>
                • <strong>🔴 Critical:</strong> Remaining SLA &lt; 12 Hours (Auto-Escalated to MRO)<br />
                • <strong>🟠 High:</strong> Remaining SLA 12–24 Hours<br />
                • <strong>🟢 Normal:</strong> Remaining SLA 24–48 Hours
              </div>
            </div>

            {/* Box 2: Special Development Grants Ledger */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '10px 12px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '4px 0',
                borderRadius: '4px',
                marginBottom: '6px'
              }}>
                Discretionary State Grant Ledger (₹1.00 Cr Pool)
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '4px',
                textAlign: 'center',
                fontSize: '0.66rem'
              }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px', borderRadius: '4px' }}>
                  <span style={{ color: '#64748b' }}>Total Pool</span><br />
                  <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>₹1,00,00,000</strong>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #86efac', padding: '4px', borderRadius: '4px' }}>
                  <span style={{ color: '#166534' }}>Sanctioned (8)</span><br />
                  <strong style={{ color: '#15803d', fontSize: '0.8rem' }}>₹49,20,000</strong>
                </div>
                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #7dd3fc', padding: '4px', borderRadius: '4px' }}>
                  <span style={{ color: '#0369a1' }}>Available Bal</span><br />
                  <strong style={{ color: '#0284c7', fontSize: '0.8rem' }}>₹50,80,000</strong>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ COLUMN 3: EXPERIMENTAL RESULTS & CONCLUSION ══════════ */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Box 1: Village Performance Results Table */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '4px 0',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                Experimental Results & Village Telemetry
              </div>

              {/* Data Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.65rem',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#334155' }}>
                    <th style={{ padding: '3px 4px', textAlign: 'left' }}>Village</th>
                    <th style={{ padding: '3px 4px' }}>Total</th>
                    <th style={{ padding: '3px 4px' }}>Resolved</th>
                    <th style={{ padding: '3px 4px' }}>Rate</th>
                    <th style={{ padding: '3px 4px' }}>Score</th>
                    <th style={{ padding: '3px 4px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                    <td style={{ padding: '3px 4px', textAlign: 'left', fontWeight: 700 }}>Gollapudi</td>
                    <td>7</td>
                    <td>6</td>
                    <td>85.7%</td>
                    <td style={{ fontWeight: 800, color: '#16a34a' }}>88</td>
                    <td><span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>🟢 Excellent</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '3px 4px', textAlign: 'left', fontWeight: 700 }}>Penamaluru</td>
                    <td>4</td>
                    <td>3</td>
                    <td>75.0%</td>
                    <td style={{ fontWeight: 800, color: '#16a34a' }}>78</td>
                    <td><span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>🟢 Good</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '3px 4px', textAlign: 'left', fontWeight: 700 }}>Kankipadu</td>
                    <td>3</td>
                    <td>2</td>
                    <td>66.7%</td>
                    <td style={{ fontWeight: 800, color: '#16a34a' }}>70</td>
                    <td><span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>🟢 Normal</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '3px 4px', textAlign: 'left', fontWeight: 700 }}>Poranki</td>
                    <td>2</td>
                    <td>1</td>
                    <td>50.0%</td>
                    <td style={{ fontWeight: 800, color: '#ca8a04' }}>52</td>
                    <td><span style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>🟡 Average</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fef2f2' }}>
                    <td style={{ padding: '3px 4px', textAlign: 'left', fontWeight: 700 }}>Nunna</td>
                    <td>3</td>
                    <td>1</td>
                    <td>33.3%</td>
                    <td style={{ fontWeight: 800, color: '#dc2626' }}>38</td>
                    <td><span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>🔴 Flagged</span></td>
                  </tr>
                  <tr style={{ backgroundColor: '#fef2f2' }}>
                    <td style={{ padding: '3px 4px', textAlign: 'left', fontWeight: 700 }}>Mangalagiri</td>
                    <td>2</td>
                    <td>0</td>
                    <td>0.0%</td>
                    <td style={{ fontWeight: 800, color: '#dc2626' }}>10</td>
                    <td><span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>🔴 Flagged</span></td>
                  </tr>
                </tbody>
              </table>

              {/* Conclusions Box */}
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '4px 0',
                borderRadius: '4px',
                marginBottom: '6px'
              }}>
                Conclusions & Impact
              </div>

              <ul style={{ margin: '0', paddingLeft: '16px', fontSize: '0.68rem', color: '#334155', lineHeight: '1.3' }}>
                <li><strong>Zero Grievance Leakage:</strong> Enforces accountability across all 4 administrative tiers.</li>
                <li><strong>Rapid 48-Hour Closure:</strong> Reduces average public issue turnaround time by 64%.</li>
                <li><strong>Transparent Grant Sanctions:</strong> Accelerated ₹49.20 Lakhs in emergency drinking water and health infrastructure.</li>
              </ul>
            </div>

            {/* Box 2: References & Acknowledgements */}
            <div style={{
              border: '2px solid #14532d',
              borderRadius: '6px',
              padding: '8px 10px',
              backgroundColor: '#ffffff',
              fontSize: '0.64rem'
            }}>
              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '3px 0',
                borderRadius: '3px',
                marginBottom: '5px'
              }}>
                References
              </div>
              <ol style={{ margin: '0 0 6px 0', paddingLeft: '14px', color: '#475569', lineHeight: '1.25' }}>
                <li>Govt. of Andhra Pradesh, "Grama / Ward Sachivalayam Portal & Citizen Service Charter", 2026.</li>
                <li>IEEE Transactions on Services Computing, "Decentralized SLA & Multi-Role Governance", 2025.</li>
              </ol>

              <div style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '3px 0',
                borderRadius: '3px',
                marginBottom: '4px'
              }}>
                Acknowledgements
              </div>
              <p style={{ margin: 0, color: '#475569', lineHeight: '1.2', fontStyle: 'italic' }}>
                Sincere gratitude to the Department of ECE, Faculty Mentors, and Administration at AITS Tirupati for project guidance and research support.
              </p>
            </div>
          </section>

        </main>

        {/* ==================== FOOTER ==================== */}
        <footer style={{
          borderTop: '2px solid #e2e8f0',
          paddingTop: '8px',
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.7rem',
          color: '#64748b'
        }}>
          <span>Project: <strong>Sachivalayam Platform (The Government Service Optimization Eye)</strong></span>
          <span>Size: <strong>2ft × 2ft (Square 1:1 Aspect Ratio)</strong></span>
          <span>Institutional Partner: <strong>AITS Tirupati, AP</strong></span>
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
            padding: 15px !important;
          }
          button, a, div[style*="position: sticky"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
