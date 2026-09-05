'use client';

import React, { useState, useEffect } from 'react';
import { getCompleteRepresentativesList } from '@/lib/representativesData';
import { getAPSchemes, Scheme } from '@/lib/schemesData';
import { Representative } from '@/lib/representativesData';
import styles from './InfoPanel.module.css';

type InfoPanelProps = {
  district: string;
  role?: 'citizen' | 'admin' | 'optimizer';
};

export default function InfoPanel({ district, role = 'citizen' }: InfoPanelProps) {
  const [representatives, setRepresentatives] = useState<{
    mla?: Representative;
    mp?: Representative;
    cm?: Representative;
    pm?: Representative;
  }>({});
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [activeTab, setActiveTab] = useState<'representatives' | 'schemes'>('representatives');

  useEffect(() => {
    const reps = getCompleteRepresentativesList(district);
    setRepresentatives(reps);
    const apSchemes = getAPSchemes();
    setSchemes(apSchemes);
  }, [district]);

  return (
    <div className={styles.infoPanelContainer}>
      <div className={styles.tabButtons}>
        <button
          onClick={() => setActiveTab('representatives')}
          className={`${styles.tabBtn} ${activeTab === 'representatives' ? styles.active : ''}`}
        >
          🗳️ Representatives
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`${styles.tabBtn} ${activeTab === 'schemes' ? styles.active : ''}`}
        >
          📋 Government Schemes
        </button>
      </div>

      {activeTab === 'representatives' && (
        <div className={styles.representativesSection}>
          <h3>Current Elected Officials for {district}</h3>
          <div className={styles.representativesGrid}>
            {representatives.mla && (
              <div className={styles.repCard}>
                <div className={styles.repIcon}>🧑‍💼</div>
                <h4>Member of Legislative Assembly (MLA)</h4>
                <p className={styles.repName}>{representatives.mla.name}</p>
                <p className={styles.repParty}>{representatives.mla.party}</p>
                <p className={styles.repConstituency}>{representatives.mla.constituency}</p>
                {representatives.mla.email && (
                  <p className={styles.contact}>📧 {representatives.mla.email}</p>
                )}
              </div>
            )}

            {representatives.mp && (
              <div className={styles.repCard}>
                <div className={styles.repIcon}>🏛️</div>
                <h4>Member of Parliament (MP)</h4>
                <p className={styles.repName}>{representatives.mp.name}</p>
                <p className={styles.repParty}>{representatives.mp.party}</p>
                <p className={styles.repConstituency}>{representatives.mp.constituency}</p>
                {representatives.mp.email && (
                  <p className={styles.contact}>📧 {representatives.mp.email}</p>
                )}
              </div>
            )}

            {representatives.cm && (
              <div className={styles.repCard}>
                <div className={styles.repIcon}>👨‍⚖️</div>
                <h4>Chief Minister (CM)</h4>
                <p className={styles.repName}>{representatives.cm.name}</p>
                <p className={styles.repParty}>{representatives.cm.party}</p>
                <p className={styles.repState}>Andhra Pradesh</p>
                {representatives.cm.email && (
                  <p className={styles.contact}>📧 {representatives.cm.email}</p>
                )}
              </div>
            )}

            {representatives.pm && (
              <div className={styles.repCard}>
                <div className={styles.repIcon}>🇮🇳</div>
                <h4>Prime Minister (PM)</h4>
                <p className={styles.repName}>{representatives.pm.name}</p>
                <p className={styles.repParty}>{representatives.pm.party}</p>
                <p className={styles.repState}>India</p>
                {representatives.pm.email && (
                  <p className={styles.contact}>📧 {representatives.pm.email}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'schemes' && (
        <div className={styles.schemesSection}>
          <h3>Active Government Schemes (Central + Andhra Pradesh)</h3>
          <div className={styles.schemesList}>
            {schemes.map(scheme => (
              <details key={scheme.id} className={styles.schemeItem}>
                <summary className={styles.schemeSummary}>
                  <span className={styles.schemeType}>
                    {scheme.type === 'central' ? '🏛️' : '🏘️'}
                  </span>
                  <span className={styles.schemeName}>{scheme.name}</span>
                  <span className={styles.schemeCategory}>{scheme.category}</span>
                </summary>
                <div className={styles.schemeDetails}>
                  <p>
                    <strong>Description:</strong> {scheme.description}
                  </p>
                  <p>
                    <strong>Eligibility:</strong>
                    <ul>
                      {scheme.eligibility.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </p>
                  <p>
                    <strong>Benefits:</strong>
                    <ul>
                      {scheme.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </p>
                  {scheme.applicationUrl && (
                    <a
                      href={scheme.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.applicationLink}
                    >
                      Apply Online →
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
