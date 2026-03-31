import React, { useState } from 'react';

const NightlyReport = ({ entry }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const dsaTasks = (entry.tasks || []).filter(t => t.section === 'DSA');

  const template = `Date: ${entry.date}

Problems:
${dsaTasks.map(t => `- ${t.title} — [done / partial / not attempted]`).join('\n')}

Energy today: [High / Medium / Low]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="nightly-report">
      <button className="nightly-toggle" onClick={() => setOpen(o => !o)}>
        {open ? '▲' : '▼'} 📋 Nightly AI Update Template
      </button>
      {open && (
        <div className="nightly-box">
          <pre>{template}</pre>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NightlyReport;
