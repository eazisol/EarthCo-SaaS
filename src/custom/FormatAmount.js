const formatAmount = (amount, fraction = 2, isThousand = false) => {
  if (typeof amount !== "number" || isNaN(amount)) return "0.00"; // Handle invalid input

  let formattedAmount = amount;

  if (isThousand) {
    if (amount <= 1000) {
      return amount.toFixed(fraction);
    }
    formattedAmount = amount / 1000;
    return (
      formattedAmount.toLocaleString("en-US", {
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      }) + "k"
    );
  }

  return amount.toLocaleString("en-US", {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  });
};

export default formatAmount;
/**
 * Currency formatter
 *  - “–” hamesha $ se pehle aata hai (‑$100.00)
 *  - isThousand === true ⇒ 1 000 se barha number “k” mein dikhayega (‑$1.50k)
 */
export const formatCurrency = (
  amount,
  fraction = 2,
  isThousand = false,
  currencySymbol = "$"
) => {
  if (typeof amount !== "number" || isNaN(amount)) return `${currencySymbol}0.00`;

  const isNegative = amount < 0;
  let absolute = Math.abs(amount);

  // 1) Thousand‑style formatting
  if (isThousand) {
    if (absolute <= 1000) {
      // e.g. –$999.99
      return `${isNegative ? "-" : ""}${currencySymbol}${absolute.toFixed(
        fraction
      )}`;
    }
    absolute = absolute / 1000; // convert to “k”
    return (
      `${isNegative ? "-" : ""}${currencySymbol}` +
      absolute.toLocaleString("en-US", {
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      }) +
      "k"
    );
  }

  // 2) Normal formatting
  return (
    `${isNegative ? "-" : ""}${currencySymbol}` +
    absolute.toLocaleString("en-US", {
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    })
  );
};


