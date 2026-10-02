const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function formatPrice(amount) {
  return inrFormatter.format(amount)
}

export { formatPrice }