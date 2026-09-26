// Shared style tokens for the app's form UI (not the invoice preview,
// which always renders as plain printed-paper regardless of these).
// Centralized so the whole form uses one consistent accent color, radius,
// and spacing rhythm instead of every component redefining its own.

export const card = 'rounded-xl border border-hairline bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'

export const sectionHeading =
  'mb-4 text-[13px] font-semibold uppercase tracking-wider text-accent'

export const label = 'mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-label'

export const input =
  'w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'

export const inputCompact =
  'w-full rounded-md border border-hairline bg-white px-2.5 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'

export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark disabled:opacity-60'

export const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-light'

export const btnGhost =
  'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'
