import { card, sectionHeading, label as labelClass, input as inputClass } from '../styles/formStyles'

export default function BillingForm({ invoice, onChange }) {
  const updateBilledTo = (field) => (e) =>
    onChange({ ...invoice, billedTo: { ...invoice.billedTo, [field]: e.target.value } })

  const updateShippedTo = (field) => (e) =>
    onChange({ ...invoice, shippedTo: { ...invoice.shippedTo, [field]: e.target.value } })

  const toggleSameAsBilled = (e) => {
    const sameAsBilled = e.target.checked
    onChange({
      ...invoice,
      shippedTo: {
        ...invoice.shippedTo,
        sameAsBilled,
        name: sameAsBilled ? invoice.billedTo.name : invoice.shippedTo.name,
        address: sameAsBilled ? invoice.billedTo.address : invoice.shippedTo.address,
      },
    })
  }

  return (
    <section className={card}>
      <h2 className={sectionHeading}>Billing</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Billed To</p>
          <div>
            <label className={labelClass}>Customer Name</label>
            <input className={inputClass} value={invoice.billedTo.name} onChange={updateBilledTo('name')} />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <textarea className={inputClass} rows={2} value={invoice.billedTo.address} onChange={updateBilledTo('address')} />
          </div>
          <div>
            <label className={labelClass}>Customer GSTIN/UID (optional)</label>
            <input className={inputClass} value={invoice.customerGstin} onChange={(e) => onChange({ ...invoice, customerGstin: e.target.value })} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Shipped To</p>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" className="accent-accent" checked={invoice.shippedTo.sameAsBilled} onChange={toggleSameAsBilled} />
              Same as Billed To
            </label>
          </div>
          <div>
            <label className={labelClass}>Customer Name</label>
            <input
              className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`}
              value={invoice.shippedTo.sameAsBilled ? invoice.billedTo.name : invoice.shippedTo.name}
              onChange={updateShippedTo('name')}
              disabled={invoice.shippedTo.sameAsBilled}
            />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <textarea
              className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`}
              rows={2}
              value={invoice.shippedTo.sameAsBilled ? invoice.billedTo.address : invoice.shippedTo.address}
              onChange={updateShippedTo('address')}
              disabled={invoice.shippedTo.sameAsBilled}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
