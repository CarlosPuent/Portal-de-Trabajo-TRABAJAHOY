/**
 * Inline SVG icon strings.
 * All icons use currentColor and accept size via CSS class .icon--sm/md/lg
 * or via explicit width/height props on the svg element.
 *
 * Usage in template literals:
 *   `<span>${icons.mapPin} Madrid</span>`
 *   `<span>${icons.starFilled({ size: 18 })}</span>`
 */

const svg = (size, content, cls = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon${cls ? ' ' + cls : ''}" aria-hidden="true">${content}</svg>`;

const svgFilled = (size, content, cls = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon${cls ? ' ' + cls : ''}" aria-hidden="true">${content}</svg>`;

// ── Status & process ──────────────────────────────────────────────────────────

export const eye = svg(15, '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>');

export const calendar = svg(15, '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>');

export const checkCircle = svg(15, '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>');

export const xCircle = svg(15, '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>');

export const clock = svg(15, '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>');

export const clipboard = svg(15, '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>');

// ── Location ──────────────────────────────────────────────────────────────────

export const mapPin = svg(14, '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>');

// ── Communication ─────────────────────────────────────────────────────────────

export const messageSquare = svg(17, '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>');

// ── Attachment ────────────────────────────────────────────────────────────────

export const paperclip = svg(17, '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>');

// ── Forum / content ───────────────────────────────────────────────────────────

export const pin = svg(14, '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z"/>');

export const lock = svg(14, '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');

export const flag = svg(14, '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>');

export const trash = svg(14, '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>');

export const fileText = svg(14, '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>');

export const folder = svg(14, '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>');

// ── Company ───────────────────────────────────────────────────────────────────

export const building = svg(40, '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18"/><path d="M9 21V9"/><rect x="12" y="13" width="3" height="4"/>', 'icon--building');

export const gift = svg(18, '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>');

export const sparkle = svg(16, '<path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5Z"/><path d="M5 3L5.75 5.25L8 6L5.75 6.75L5 9L4.25 6.75L2 6L4.25 5.25Z" stroke-width="1.5"/><path d="M19 15L19.75 17.25L22 18L19.75 18.75L19 21L18.25 18.75L16 18L18.25 17.25Z" stroke-width="1.5"/>');

// ── Alerts / confirm ──────────────────────────────────────────────────────────

export const alertTriangle = svg(36, '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>');

// ── Basic actions ─────────────────────────────────────────────────────────────

export const check = svg(13, '<polyline points="20 6 9 17 4 12"/>');

export const xMark = svg(13, '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>');

// ── Reviews / ratings ─────────────────────────────────────────────────────────

/** Filled star for ratings */
export const starFilled = (size = 14) =>
  svgFilled(size, '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 'icon--star-filled');

/** Empty star for ratings */
export const starEmpty = (size = 14) =>
  svg(size, '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 'icon--star-empty');

/** Render a row of n stars (filled up to `filled`, then empty) */
export const renderStars = (filled, total = 5, size = 14) =>
  Array.from({ length: total }, (_, i) => (i < filled ? starFilled(size) : starEmpty(size))).join('');

export const thumbsUp = svg(14, '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>');

export const thumbsDown = svg(14, '<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>');

// ── Named star icon for inline rating display (e.g. "★ 4.3") ─────────────────
export const star = starFilled(14);
