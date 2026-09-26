// Thin wrappers around localStorage so the rest of the app never touches
// raw keys/JSON parsing directly.

const KEYS = {
  SHOP_SETTINGS: 'gst-invoice:shop-settings',
  INVOICE_COUNTER: 'gst-invoice:invoice-counter',
  SAVED_INVOICES: 'gst-invoice:saved-invoices',
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Shop settings ---
export function getShopSettings() {
  return readJSON(KEYS.SHOP_SETTINGS, {
    name: '',
    address: '',
    gstin: '',
    stateCode: '',
  })
}
export function setShopSettings(settings) {
  writeJSON(KEYS.SHOP_SETTINGS, settings)
}

// --- Invoice number counter ---
export function getInvoiceCounter() {
  const value = localStorage.getItem(KEYS.INVOICE_COUNTER)
  return value ? Number(value) : 1
}
export function setInvoiceCounter(value) {
  localStorage.setItem(KEYS.INVOICE_COUNTER, String(value))
}
// Bumps the counter so the next auto-generated invoice number stays ahead
// of anything the user has manually saved (numbers stay sequential).
export function ensureCounterAtLeast(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return
  if (numeric >= getInvoiceCounter()) {
    setInvoiceCounter(numeric + 1)
  }
}

// --- Saved invoices ---
export function getSavedInvoices() {
  return readJSON(KEYS.SAVED_INVOICES, [])
}
export function saveInvoice(invoice) {
  const invoices = getSavedInvoices()
  const existingIndex = invoices.findIndex((inv) => inv.id === invoice.id)
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice
  } else {
    invoices.unshift(invoice)
  }
  writeJSON(KEYS.SAVED_INVOICES, invoices)
  ensureCounterAtLeast(invoice.invoiceNumber)
  return invoices
}
export function deleteSavedInvoice(id) {
  const invoices = getSavedInvoices().filter((inv) => inv.id !== id)
  writeJSON(KEYS.SAVED_INVOICES, invoices)
  return invoices
}
