import { getItemAmount } from '../utils/gst'
import { card, sectionHeading, inputCompact as cellInputClass } from '../styles/formStyles'

let nextId = 1
export function createEmptyItem() {
  return { id: `item-${Date.now()}-${nextId++}`, description: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0, gstRate: 18 }
}

// A small labeled field for the compact row below each item's description.
// `minWidth` is a real floor (not 0) -- flexbox only wraps an item onto a
// new line once it can no longer shrink past its min-width, so this is
// what makes fields wrap to fit instead of shrinking into illegibility.
function Field({ label, minWidth, children }) {
  return (
    <div className="flex-1" style={{ minWidth }}>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-label">{label}</label>
      {children}
    </div>
  )
}

export default function ItemsTable({ items, onChange }) {
  const updateItem = (id, field) => (e) => {
    const value = ['qty', 'rate', 'gstRate'].includes(field) ? Number(e.target.value) : e.target.value
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addRow = () => onChange([...items, createEmptyItem()])
  const removeRow = (id) => onChange(items.filter((item) => item.id !== id))

  return (
    <section className={card}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`${sectionHeading} mb-0`}>Line Items</h2>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-md border border-accent px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent-light"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Add Row
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded-lg border border-hairline bg-paper/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-medium text-label">{idx + 1}</span>
              <input
                className={`${cellInputClass} flex-1`}
                value={item.description}
                onChange={updateItem(item.id, 'description')}
                placeholder="Item description"
              />
              <button
                type="button"
                onClick={() => removeRow(item.id)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                aria-label="Remove row"
                title="Remove row"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Field label="HSN/SAC" minWidth="6.5rem">
                <input className={cellInputClass} value={item.hsn} onChange={updateItem(item.id, 'hsn')} placeholder="HSN" />
              </Field>
              <Field label="Qty" minWidth="4.5rem">
                <input type="number" min="0" className={cellInputClass} value={item.qty} onChange={updateItem(item.id, 'qty')} />
              </Field>
              <Field label="Unit" minWidth="4.5rem">
                <input className={cellInputClass} value={item.unit} onChange={updateItem(item.id, 'unit')} />
              </Field>
              <Field label="Rate" minWidth="5.5rem">
                <input type="number" min="0" step="0.01" className={cellInputClass} value={item.rate} onChange={updateItem(item.id, 'rate')} />
              </Field>
              <Field label="GST %" minWidth="5rem">
                <select className={cellInputClass} value={item.gstRate} onChange={updateItem(item.id, 'gstRate')}>
                  {[0, 5, 12, 18, 28].map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}%
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Amount" minWidth="5.75rem">
                <div className="rounded-md bg-slate-50 px-2.5 py-2 text-right text-sm font-semibold text-slate-700">
                  {getItemAmount(item).toFixed(2)}
                </div>
              </Field>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
