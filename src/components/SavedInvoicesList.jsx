import { card, sectionHeading } from '../styles/formStyles'

export default function SavedInvoicesList({ invoices, onLoad, onDelete }) {
  if (invoices.length === 0) {
    return (
      <section className={card}>
        <h2 className={sectionHeading}>Saved Invoices</h2>
        <p className="text-sm text-slate-500">No invoices saved yet.</p>
      </section>
    )
  }

  return (
    <section className={card}>
      <h2 className={sectionHeading}>Saved Invoices</h2>
      <ul className="divide-y divide-hairline">
        {invoices.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
            <div>
              <p className="font-medium text-slate-800">{inv.billedTo.name || 'Unnamed customer'}</p>
              <p className="text-xs text-slate-500">
                #{inv.invoiceNumber} &middot; {inv.date}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onLoad(inv)}
                className="rounded-md border border-accent px-2.5 py-1 text-xs font-medium text-accent transition hover:bg-accent-light"
              >
                Load
              </button>
              <button
                type="button"
                onClick={() => onDelete(inv.id)}
                className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
