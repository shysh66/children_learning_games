import React from 'react';

// =============================================
// Feedback URL - Replace with your Google Form link!
// Example: 'https://forms.gle/abc123'
// Leave empty string '' to hide the feedback link.
// =============================================
const FEEDBACK_URL = 'https://forms.gle/YOUR_GOOGLE_FORM_ID_HERE';

const Footer = ({ version }) => {
  return (
    <footer
      className="w-full py-3 px-4 text-xs text-slate-400 select-none"
      dir="rtl"
    >
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
        <span>v{version}</span>
        <span>
          {FEEDBACK_URL && (
            <>
              {'מצאתם באג? יש רעיון? '}
              <a
                href={FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-slate-200 transition-colors"
              >
                כתבו לי כאן
              </a>
            </>
          )}
        </span>
        <span>{'פותח באהבה ע"י שי \u2764\uFE0F'}</span>
      </div>
    </footer>
  );
};

export default Footer;
