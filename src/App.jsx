import { useEffect, useMemo, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import ShopSettingsForm from './components/ShopSettingsForm'
import InvoiceMetaForm from './components/InvoiceMetaForm'
import BillingForm from './components/BillingForm'
import ItemsTable, { createEmptyItem } from './components/ItemsTable'
import InvoicePreview from './components/InvoicePreview'
import SavedInvoicesList from './components/SavedInvoicesList'
import { btnPrimary, btnSecondary, btnGhost } from './styles/formStyles'

import {
  getShopSettings,
  setShopSettings,
  getInvoiceCounter,
  setInvoiceCounter,
  getSavedInvoices,
  saveInvoice,
  deleteSavedInvoice,
} from './utils/storage'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function createDefaultInvoice(invoiceNumber) {
  return {
    id: `invoice-${Date.now()}`,
    invoiceNumber: String(invoiceNumber),
    date: todayISO(),
    copyType: 'Original',
    placeOfSupplyCode: '',
    reverseCharge: 'N.A.',
    transport: '',
    vehicleNo: '',
    station: '',
    grNo: '',
    billedTo: { name: '', address: '' },
    shippedTo: { name: '', address: '', sameAsBilled: true },
    customerGstin: '',
  }
}

// Turns "Jyotish Das" -> "Jyotish_Das" for a filesystem-safe PDF filename.
function sanitizeFilenamePart(text) {
  return (text || 'Customer')
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
}

// The invoice preview's actual DOM is always rendered at this fixed width
// (matches the printed A4 layout the tax invoice styling was tuned for).
// It's visually shrunk to fit its column via CSS zoom -- see previewScale.
const PREVIEW_NATIVE_WIDTH = 820

export default function App() {
  const [shop, setShop] = useState(getShopSettings)
  const [invoice, setInvoice] = useState(() => createDefaultInvoice(getInvoiceCounter()))
  const [items, setItems] = useState(() => [createEmptyItem()])
  const [savedInvoices, setSavedInvoices] = useState(getSavedInvoices)
  const [isExporting, setIsExporting] = useState(false)
  const [previewScale, setPreviewScale] = useState(1)

  const previewRef = useRef(null)
  const previewColumnRef = useRef(null)
  const previewZoomRef = useRef(null)

  // Persist shop settings on every change so they carry over between invoices.
  useEffect(() => {
    setShopSettings(shop)
  }, [shop])

  // Shrink the (fixed-width) invoice preview down to fit whatever width its
  // column actually has, so it's always fully visible with no horizontal
  // scrollbar -- instead of a fixed min-width that overflows on anything
  // narrower than the print layout.
  useEffect(() => {
    const columnEl = previewColumnRef.current
    if (!columnEl) return
    const updateScale = () => {
      const available = columnEl.clientWidth
      setPreviewScale(available > 0 ? Math.min(1, available / PREVIEW_NATIVE_WIDTH) : 1)
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(columnEl)
    return () => observer.disconnect()
  }, [])

  const handleSave = () => {
    const record = { ...invoice, items, savedAt: new Date().toISOString() }
    const updated = saveInvoice(record)
    setSavedInvoices(updated)
  }

  const handleLoad = (record) => {
    const { items: loadedItems, ...invoiceFields } = record
    setInvoice(invoiceFields)
    setItems(loadedItems)
  }

  const handleDelete = (id) => {
    setSavedInvoices(deleteSavedInvoice(id))
  }

  const handleNewInvoice = () => {
    // Bump the counter so the next invoice number keeps incrementing even
    // if the current one was never explicitly saved.
    const next = (Number(invoice.invoiceNumber) || getInvoiceCounter()) + 1
    setInvoiceCounter(next)
    setInvoice(createDefaultInvoice(next))
    setItems([createEmptyItem()])
  }

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    // Capture at true native size regardless of the on-screen shrink-to-fit
    // zoom, so the exported PDF is never affected by the current window
    // width -- reset to 1 just for the capture, then restore.
    const zoomEl = previewZoomRef.current
    const restoreZoom = zoomEl?.style.zoom
    try {
      if (zoomEl) zoomEl.style.zoom = '1'
      const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Fit on one page: scale down further if the content would overflow.
      const finalHeight = Math.min(imgHeight, pageHeight)
      const finalWidth = finalHeight === imgHeight ? imgWidth : (canvas.width * finalHeight) / canvas.height

      pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight)

      const customerPart = sanitizeFilenamePart(invoice.billedTo.name)
      const filename = `${customerPart}_Invoice_${invoice.invoiceNumber}.pdf`
      pdf.save(filename)
    } finally {
      if (zoomEl) zoomEl.style.zoom = restoreZoom ?? ''
      setIsExporting(false)
    }
  }

  const memoItems = useMemo(() => items, [items])

  return (
    <div className="min-h-screen bg-paper pb-16">
      <header className="sticky top-0 z-10 border-b border-hairline bg-white/95 px-6 py-4 backdrop-blur">
        <h1 className="text-lg font-semibold tracking-tight text-slate-800">
          GST Invoice <span className="text-accent">Generator</span>
        </h1>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-start lg:gap-8">
        {/* Left: forms */}
        <div className="flex w-full flex-col gap-5 lg:w-1/2">
          <ShopSettingsForm settings={shop} onChange={setShop} />
          <InvoiceMetaForm invoice={invoice} onChange={setInvoice} />
          <BillingForm invoice={invoice} onChange={setInvoice} />
          <ItemsTable items={memoItems} onChange={setItems} />

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleDownloadPdf} disabled={isExporting} className={btnPrimary}>
              {isExporting ? 'Generating PDF…' : 'Download PDF'}
            </button>
            <button type="button" onClick={handleSave} className={btnSecondary}>
              Save Invoice
            </button>
            <button type="button" onClick={handleNewInvoice} className={btnGhost}>
              New Invoice
            </button>
          </div>

          <SavedInvoicesList invoices={savedInvoices} onLoad={handleLoad} onDelete={handleDelete} />
        </div>

        {/* Right: live preview, always white/printed-paper regardless of app theme.
            Shrunk via zoom (see previewScale) to always fit its column with
            no horizontal scrollbar, instead of overflowing at fixed width. */}
        <div ref={previewColumnRef} className="w-full lg:w-1/2">
          <div ref={previewZoomRef} style={{ zoom: previewScale }}>
            <InvoicePreview ref={previewRef} shop={shop} invoice={invoice} items={memoItems} />
          </div>
        </div>
      </main>
    </div>
  )
}
