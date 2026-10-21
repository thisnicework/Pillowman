import React from 'react';

export default function PosterModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay open" 
      role="dialog" 
      aria-modal="true" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
        <div className="modal-header" style={{ border: 'none', padding: '0 0 16px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 auto' }}>뮤지컬 〈필로우맨〉 포스터</h3>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>
        <div style={{ textAlign: 'center', maxHeight: '82vh', overflowY: 'auto' }}>
          <img 
            src="/assets/poster.png" 
            alt="뮤지컬 필로우맨 공식 포스터" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '76vh', 
              borderRadius: '4px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              border: '1px solid var(--border-strong)'
            }} 
          />
        </div>
      </div>
    </div>
  );
}
