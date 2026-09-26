import { INDIAN_STATES } from '../data/indianStates'
import { card, sectionHeading, label as labelClass, input as inputClass } from '../styles/formStyles'

export default function ShopSettingsForm({ settings, onChange }) {
  const update = (field) => (e) => onChange({ ...settings, [field]: e.target.value })

  return (
    <section className={card}>
      <h2 className={sectionHeading}>Shop Settings</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Shop / Company Name</label>
          <input className={inputClass} value={settings.name} onChange={update('name')} placeholder="e.g. Shree Traders" />
        </div>
        <div>
          <label className={labelClass}>GSTIN</label>
          <input className={inputClass} value={settings.gstin} onChange={update('gstin')} placeholder="22AAAAA0000A1Z5" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Shop Address</label>
          <textarea
            className={inputClass}
            rows={2}
            value={settings.address}
            onChange={update('address')}
            placeholder="Shop No., Street, City, PIN"
          />
        </div>
        <div>
          <label className={labelClass}>Shop's State</label>
          <select className={inputClass} value={settings.stateCode} onChange={update('stateCode')}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
