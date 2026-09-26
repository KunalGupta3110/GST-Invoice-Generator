import { forwardRef } from 'react'
import { INDIAN_STATES } from '../data/indianStates'
import { getItemAmount, isIntraState, computeInvoiceTotals } from '../utils/gst'
import { numberToWords } from '../utils/numberToWords'

function stateName(code) {
  return INDIAN_STATES.find((s) => s.code === code)?.name || ''
}

const TERMS = [
  'Goods once sold will not be taken back.',
  'Interest @ 18% p.a. will be charged if the bill is not paid within 15 days.',
  'Subject to local jurisdiction only.',
  'E&OE (Errors and Omissions Excepted).',
]

// The items table reserves this many rows minimum, so a 1-2 line invoice
// still shows the generous blank ruled space of a printed pad rather than
// shrinking to fit its content.
const MIN_ITEM_ROWS = 9

// Bordered "data grid" cell for the items table. Deliberately NOT paired
// with table-layout:fixed -- a fixed layout locks each column to its
// initial width, so a large rupee amount has nowhere to grow and either
// overflows its cell or wraps into the row below/above. Auto layout lets
// the browser widen a column when its content needs it, and `nowrap`
// below guarantees numeric values never break across lines regardless of
// how many digits they end up being.
const gridCell = 'border border-black px-1.5 py-1 align-top'
const nowrap = 'whitespace-nowrap'

// Plain (borderless) cell for the HSN summary table -- that table reads
// as underlined-header prose in the reference invoice, not a boxed grid.
const plainCell = 'px-2 py-0.5 align-top'

// A label/value pair rendered inline on one line (not a boxed cell) --
// label in normal weight, value in bold -- matching the printed-invoice
// convention of "Invoice No. : **123**" rather than a two-column table.
function InfoRow({ label, value }) {
  return (
    <p className="py-[1px] leading-tight">
      <span>{label} : </span>
      <span className="font-bold italic">{value || '-'}</span>
    </p>
  )
}

const InvoicePreview = forwardRef(function InvoicePreview({ shop, invoice, items }, ref) {
  const intraState = isIntraState(shop.stateCode, invoice.placeOfSupplyCode)
  const totals = computeInvoiceTotals(items, intraState)

  const shipped = invoice.shippedTo.sameAsBilled
    ? { name: invoice.billedTo.name, address: invoice.billedTo.address }
    : invoice.shippedTo

  // "25cs" style qty+unit summary for the Grand Total row -- unit taken
  // from the first line item since a single invoice is normally one unit.
  const totalsUnit = items.find((item) => item.unit)?.unit || ''

  const amountWords = numberToWords(totals.grandTotal)

  const fillerRowCount = Math.max(0, MIN_ITEM_ROWS - items.length)

  return (
    <div
      ref={ref}
      className="invoice-paper w-[820px] border border-black text-[12px] leading-tight"
    >
      {/* 1. Top band: GSTIN | Copy Type */}
      <div className="flex justify-between px-4 py-1 text-[11px]">
        <span>
          GSTIN: <span className="font-bold">{shop.gstin || '-'}</span>
        </span>
        <span className="italic">{invoice.copyType} Copy</span>
      </div>

      {/* 2. Centered header */}
      <div className="border-y border-black px-4 py-2 text-center">
        <p className="text-[12px] font-bold underline">TAX INVOICE</p>
        <p className="text-2xl font-bold">{shop.name || 'Your Company Name'}</p>
        <p className="whitespace-pre-line text-[11px] font-bold italic">{shop.address}</p>
      </div>

      {/* 3. Two-column info strip -- left-aligned label:value prose lines,
          tight vertical spacing, no per-row boxing. A single thin divider
          separates the two columns as a structural (not per-field) line. */}
      <div className="grid grid-cols-2 gap-x-4 border-b border-black px-4 py-1.5 text-[11px]">
        <div className="border-r border-black pr-4">
          <InfoRow label="Invoice No." value={invoice.invoiceNumber} />
          <InfoRow label="Date of Invoice" value={invoice.date} />
          <InfoRow
            label="Place of Supply"
            value={invoice.placeOfSupplyCode ? `${invoice.placeOfSupplyCode} - ${stateName(invoice.placeOfSupplyCode)}` : ''}
          />
          <InfoRow label="Reverse Charge" value={invoice.reverseCharge} />
        </div>
        <div>
          <InfoRow label="GR/RR No." value={invoice.grNo} />
          <InfoRow label="Transport" value={invoice.transport} />
          <InfoRow label="Vehicle No." value={invoice.vehicleNo} />
          <InfoRow label="Station" value={invoice.station} />
        </div>
      </div>

      {/* 4. Billed To | Shipped To */}
      <div className="grid grid-cols-2 border-b border-black text-[11px]">
        <div className="border-r border-black px-4 py-1.5">
          <p className="font-bold italic">Billed to</p>
          <p className="font-bold italic">{invoice.billedTo.name || '-'}</p>
          <p className="whitespace-pre-line italic">{invoice.billedTo.address}</p>
          {invoice.customerGstin && <p className="mt-0.5">GSTIN/UID: {invoice.customerGstin}</p>}
        </div>
        <div className="px-4 py-1.5">
          <p className="font-bold italic">Shipped to</p>
          <p className="font-bold italic">{shipped.name || '-'}</p>
          <p className="whitespace-pre-line italic">{shipped.address}</p>
          {invoice.customerGstin && <p className="mt-0.5">GSTIN/UID: {invoice.customerGstin}</p>}
        </div>
      </div>

      {/* 5. Line items table -- bordered data grid, padded out with blank
          ruled rows so it always reads as a full printed invoice pad.
          Auto table layout (no table-fixed) + nowrap numeric cells so a
          large amount grows its column instead of overflowing/wrapping. */}
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className={`${gridCell} ${nowrap} w-8 font-bold`}>S.N.</th>
            <th className={`${gridCell} w-full font-bold`}>Description of Goods</th>
            <th className={`${gridCell} ${nowrap} font-bold`}>HSN/SAC Code</th>
            <th className={`${gridCell} ${nowrap} font-bold`}>Qty.</th>
            <th className={`${gridCell} ${nowrap} font-bold`}>Unit</th>
            <th className={`${gridCell} ${nowrap} font-bold`}>Nett Price</th>
            <th className={`${gridCell} ${nowrap} font-bold`}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id}>
              <td className={`${gridCell} ${nowrap} text-center`}>{idx + 1}</td>
              <td className={`${gridCell} break-words text-[#1a3a8f]`}>{item.description || ''}</td>
              <td className={`${gridCell} ${nowrap} text-center`}>{item.hsn || ''}</td>
              <td className={`${gridCell} ${nowrap} text-center`}>{item.qty}</td>
              <td className={`${gridCell} ${nowrap} text-center`}>{item.unit}</td>
              <td className={`${gridCell} ${nowrap} text-right`}>{Number(item.rate).toFixed(2)}</td>
              <td className={`${gridCell} ${nowrap} text-right`}>{getItemAmount(item).toFixed(2)}</td>
            </tr>
          ))}

          {/* Blank ruled filler rows -- reserved writing space below the
              last real item, like a printed invoice pad. Sized by the same
              cell padding as real rows (not a hard-coded height), so the
              row itself decides its height instead of fighting content. */}
          {Array.from({ length: fillerRowCount }).map((_, idx) => (
            <tr key={`filler-${idx}`}>
              <td className={gridCell}>&nbsp;</td>
              <td className={gridCell}></td>
              <td className={gridCell}></td>
              <td className={gridCell}></td>
              <td className={gridCell}></td>
              <td className={gridCell}></td>
              <td className={gridCell}></td>
            </tr>
          ))}

          {/* 6. Tax rows -- label spans the description columns, rate gets
              its own sub-column (Nett Price slot), and the Amount column
              stacks taxable value above the tax amount in a flex column
              with an explicit gap, fully contained inside the cell (no
              absolute positioning, no negative margins). A minimum row
              height keeps this row clearly separated from Grand Total
              below no matter how many digits the numbers have. */}
          {totals.taxLines.map((line) => (
            <tr key={`tax-${line.rate}`} className="min-h-[34px]">
              <td className={`${gridCell} min-h-[34px]`}></td>
              <td className={`${gridCell} min-h-[34px] italic`} colSpan={3}>
                Add : {intraState ? 'CGST + SGST' : 'IGST'}
              </td>
              <td className={`${gridCell} ${nowrap} min-h-[34px] text-center font-bold`}>{line.rate}%</td>
              <td className={`${gridCell} min-h-[34px]`}></td>
              <td className={`${gridCell} ${nowrap} min-h-[34px] text-right`}>
                <div className="flex flex-col items-end gap-[3px]">
                  <span>{line.taxableAmount.toFixed(2)}</span>
                  <span>{(line.cgst + line.sgst + line.igst).toFixed(2)}</span>
                </div>
              </td>
            </tr>
          ))}

          {/* 7. Grand Total row -- same minimum row height as the tax row
              above, so the two never crowd each other regardless of
              digit count. */}
          <tr className="font-bold">
            <td className={`${gridCell} min-h-[28px]`}></td>
            <td className={`${gridCell} min-h-[28px]`}>Grand Total</td>
            <td className={`${gridCell} min-h-[28px]`}></td>
            <td className={`${gridCell} ${nowrap} min-h-[28px] text-center`} colSpan={2}>
              {totals.totalQty} {totalsUnit}
            </td>
            <td className={`${gridCell} min-h-[28px]`}></td>
            <td className={`${gridCell} ${nowrap} min-h-[28px] text-right`}>{totals.grandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Explicit gap (not just a hairline rule) so the Grand Total row
          and the HSN summary table below never read as visually merged. */}
      <div className="h-2.5 border-b border-black" />

      {/* 8. HSN-wise tax summary table -- plain (no cell grid), underlined
          headers only, matching the reference invoice's minimal style. */}
      <table className="w-full border-collapse px-4 text-[11px]">
        <thead>
          <tr>
            <th className={`${plainCell} ${nowrap} underline`}>HSN/SAC</th>
            <th className={`${plainCell} ${nowrap} underline`}>Tax Rate</th>
            <th className={`${plainCell} ${nowrap} underline`}>Taxable Amt.</th>
            <th className={`${plainCell} ${nowrap} underline`}>{intraState ? 'CGST Amt.' : 'IGST Amt.'}</th>
            {intraState && <th className={`${plainCell} ${nowrap} underline`}>SGST Amt.</th>}
            <th className={`${plainCell} ${nowrap} underline`}>Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {totals.hsnSummary.map((row) => (
            <tr key={`${row.hsn}-${row.rate}`}>
              <td className={`${plainCell} ${nowrap}`}>{row.hsn}</td>
              <td className={`${plainCell} ${nowrap}`}>{row.rate}%</td>
              <td className={`${plainCell} ${nowrap} text-right`}>{row.taxableAmount.toFixed(2)}</td>
              <td className={`${plainCell} ${nowrap} text-right`}>{intraState ? row.cgst.toFixed(2) : row.igst.toFixed(2)}</td>
              {intraState && <td className={`${plainCell} ${nowrap} text-right`}>{row.sgst.toFixed(2)}</td>}
              <td className={`${plainCell} ${nowrap} text-right`}>{row.totalTax.toFixed(2)}</td>
            </tr>
          ))}
          {totals.hsnSummary.length > 1 && (
            <tr className="border-t border-black font-bold">
              <td className={plainCell}></td>
              <td className={plainCell}>Total</td>
              <td className={`${plainCell} ${nowrap} text-right`}>{totals.taxableTotal.toFixed(2)}</td>
              <td className={`${plainCell} ${nowrap} text-right`}>{intraState ? totals.cgstTotal.toFixed(2) : totals.igstTotal.toFixed(2)}</td>
              {intraState && <td className={`${plainCell} ${nowrap} text-right`}>{totals.sgstTotal.toFixed(2)}</td>}
              <td className={`${plainCell} ${nowrap} text-right`}>{totals.taxTotal.toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 9. Amount in words (unboxed, left-aligned, regular weight) + Terms & Conditions */}
      <div className="grid grid-cols-2 gap-x-4 border-b border-black px-4 py-1.5 text-[10.5px]">
        <div>{amountWords}</div>
        <div>
          <p className="font-bold">Terms &amp; Conditions:</p>
          <ol className="list-decimal pl-4">
            {TERMS.map((term, idx) => (
              <li key={idx}>{term}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* 10. Footer signatures */}
      <div className="flex items-end justify-between px-4 py-2 text-[11px]">
        <p>Receiver's Signature</p>
        <div className="text-right">
          <p>for {shop.name || 'Your Company Name'}</p>
          <p className="mt-6">Authorised Signatory</p>
        </div>
      </div>
    </div>
  )
})

export default InvoicePreview
