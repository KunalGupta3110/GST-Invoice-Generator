// Converts a non-negative amount into words using the Indian numbering
// system (lakh/crore groups) instead of the Western thousand/million system.
export function numberToWords(amount) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function twoDigits(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  function threeDigits(n) {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred";
      n = n % 100;
      if (n) str += " ";
    }
    str += twoDigits(n);
    return str.trim();
  }

  function wholeNumberToWords(num) {
    num = Math.floor(num);
    if (num === 0) return "Zero";

    const crore = Math.floor(num / 10000000);
    num = num % 10000000;
    const lakh = Math.floor(num / 100000);
    num = num % 100000;
    const thousand = Math.floor(num / 1000);
    num = num % 1000;
    const rest = num;

    // IMPORTANT: push in this exact order — Crore, then Lakh, then Thousand, then rest
    const parts = [];
    if (crore > 0) parts.push(threeDigits(crore) + " Crore");
    if (lakh > 0) parts.push(threeDigits(lakh) + " Lakh");
    if (thousand > 0) parts.push(threeDigits(thousand) + " Thousand");
    if (rest > 0) parts.push(threeDigits(rest));

    return parts.join(" ");
  }

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = "Rupees " + wholeNumberToWords(rupees);
  if (paise > 0) {
    result += " and " + wholeNumberToWords(paise) + " Paise";
  }
  result += " only";

  // Display casing only (the grouping/math above is untouched): lowercase
  // everything except the leading "Rupees", matching the reference
  // invoice's "Rupees forty seven thousand two hundred only" style.
  return "Rupees " + result.slice("Rupees ".length).toLowerCase();
}
