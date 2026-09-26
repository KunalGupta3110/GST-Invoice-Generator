// Core GST calculation logic for the invoice.
//
// Indian GST rule of thumb used here:
//   - If the supplier's state === the "Place of Supply" state, the sale is
//     "intra-state" and tax is split evenly into CGST + SGST (half the
//     item's GST rate each). Both go to different government heads but sum
//     to the same total as the item's rate.
//   - If the states differ, the sale is "inter-state" and the *entire*
//     GST rate is charged as a single IGST line instead.
//
// This file has no React/UI code — it's pure math so it can be unit-tested
// and reused by both the live preview and the PDF export.

/** Amount for a single line item = Qty x Rate. */
export function getItemAmount(item) {
  const qty = Number(item.qty) || 0
  const rate = Number(item.rate) || 0
  return qty * rate
}

/** True when the sale is intra-state (shop's state === place of supply). */
export function isIntraState(shopStateCode, placeOfSupplyCode) {
  return Boolean(shopStateCode) && shopStateCode === placeOfSupplyCode
}

/**
 * Groups line items by (HSN/SAC code + GST rate) and computes the tax for
 * each group. This grouping is the legally-required "HSN-wise summary"
 * table on a GST invoice — it's distinct from the raw line-items table
 * because two different line items can share the same HSN code and rate
 * and must be reported as one consolidated row.
 *
 * Returns an array of rows shaped like:
 *   { hsn, rate, taxableAmount, cgst, sgst, igst, totalTax }
 */
export function buildHsnSummary(items, intraState) {
  const groups = new Map()

  for (const item of items) {
    const hsn = item.hsn?.trim() || '-'
    const rate = Number(item.gstRate) || 0
    const key = `${hsn}__${rate}`
    const taxableAmount = getItemAmount(item)

    if (!groups.has(key)) {
      groups.set(key, { hsn, rate, taxableAmount: 0 })
    }
    groups.get(key).taxableAmount += taxableAmount
  }

  return Array.from(groups.values()).map((group) => {
    // Same total tax either way; only how it's split (CGST+SGST vs IGST) differs.
    const totalTax = (group.taxableAmount * group.rate) / 100
    if (intraState) {
      const half = totalTax / 2
      return { ...group, cgst: half, sgst: half, igst: 0, totalTax }
    }
    return { ...group, cgst: 0, sgst: 0, igst: totalTax, totalTax }
  })
}

/**
 * Rolls the HSN summary up into the handful of numbers the invoice footer
 * needs: total taxable value, total tax (split by head), grand total, and
 * total quantity sold (for the "Grand Total" row).
 */
export function computeInvoiceTotals(items, intraState) {
  const hsnSummary = buildHsnSummary(items, intraState)

  const taxableTotal = hsnSummary.reduce((sum, row) => sum + row.taxableAmount, 0)
  const cgstTotal = hsnSummary.reduce((sum, row) => sum + row.cgst, 0)
  const sgstTotal = hsnSummary.reduce((sum, row) => sum + row.sgst, 0)
  const igstTotal = hsnSummary.reduce((sum, row) => sum + row.igst, 0)
  const taxTotal = cgstTotal + sgstTotal + igstTotal
  const grandTotal = taxableTotal + taxTotal
  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)

  // Distinct (rate) tax lines to render as "Add: CGST @ X% / SGST @ X%" or
  // "Add: IGST @ X%" rows directly below the line-items table.
  const taxLinesByRate = new Map()
  for (const row of hsnSummary) {
    if (!taxLinesByRate.has(row.rate)) {
      taxLinesByRate.set(row.rate, {
        rate: row.rate,
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
      })
    }
    const line = taxLinesByRate.get(row.rate)
    line.taxableAmount += row.taxableAmount
    line.cgst += row.cgst
    line.sgst += row.sgst
    line.igst += row.igst
  }
  const taxLines = Array.from(taxLinesByRate.values()).sort((a, b) => a.rate - b.rate)

  return {
    hsnSummary,
    taxLines,
    taxableTotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
    taxTotal,
    grandTotal,
    totalQty,
  }
}
