import { INDIAN_STATES } from '../data/indianStates'
import { card, sectionHeading, label as labelClass, input as inputClass } from '../styles/formStyles'

export default function InvoiceMetaForm({ invoice, onChange }) {
  const update = (field) => (e) => onChange({ ...invoice, [field]: e.target.value })

  return (
    <section className={card}>
      <h2 className={sectionHeading}>Invoice Details</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Invoice No.</label>
          <input className={inputClass} value={invoice.invoiceNumber} onChange={update('invoiceNumber')} />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" className={inputClass} value={invoice.date} onChange={update('date')} />
        </div>
        <div>
          <label className={labelClass}>Copy Type</label>
          <select className={inputClass} value={invoice.copyType} onChange={update('copyType')}>
            <option value="Original">Original Copy</option>
            <option value="Duplicate">Duplicate Copy</option>
            <option value="Triplicate">Triplicate Copy</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Reverse Charge</label>
          <select className={inputClass} value={invoice.reverseCharge} onChange={update('reverseCharge')}>
            <option value="N.A.">N.A.</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Place of Supply</label>
          <select className={inputClass} value={invoice.placeOfSupplyCode} onChange={update('placeOfSupplyCode')}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
        <div />
        <div>
          <label className={labelClass}>Transport</label>
          <input className={inputClass} value={invoice.transport} onChange={update('transport')} />
        </div>
        <div>
          <label className={labelClass}>Vehicle No.</label>
          <input className={inputClass} value={invoice.vehicleNo} onChange={update('vehicleNo')} />
        </div>
        <div>
          <label className={labelClass}>Station</label>
          <input className={inputClass} value={invoice.station} onChange={update('station')} />
        </div>
        <div>
          <label className={labelClass}>GR/RR No.</label>
          <input className={inputClass} value={invoice.grNo} onChange={update('grNo')} />
        </div>
      </div>
    </section>
  )
}
