'use client';

import React, { useState, useEffect } from 'react';

const COLORS = [
  { name: 'Default', value: '' },
  { name: 'Saffron', value: '#fff3e0' },
  { name: 'Light Green', value: '#e8f5e9' },
  { name: 'Ocean Blue', value: '#e3f2fd' },
  { name: 'Soft Purple', value: '#f3e8ff' },
];

export default function ThemeControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('app-bg-color');
    if (saved) {
      setSelectedColor(saved);
      document.body.style.backgroundColor = saved;
    }
  }, []);

  const handleColorChange = (val: string) => {
    setSelectedColor(val);
    document.body.style.backgroundColor = val;
    if (val) {
      localStorage.setItem('app-bg-color', val);
    } else {
      localStorage.removeItem('app-bg-color');
      document.body.style.backgroundColor = 'var(--bg-color)';
    }
  };

  return (
    <>
      {/* Constant India Map Watermark */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9998,
          pointerEvents: 'none',
          backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/b/b4/Map_of_India_blank.svg")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '80vh',
          opacity: 0.1,
        }}
      />

      {/* Theme Picker Floating Button */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        {isOpen && (
          <div style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-color)',
            padding: '10px',
            borderRadius: '12px',
            marginBottom: '10px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <strong style={{ fontSize: '12px', textAlign: 'center' }}>Change Background</strong>
            <div style={{ display: 'flex', gap: '8px' }}>
              {COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleColorChange(c.value)}
                  title={c.name}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: selectedColor === c.value ? '2px solid var(--primary-color)' : '1px solid #ccc',
                    background: c.value || 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎨
        </button>
      </div>
    </>
  );
}
