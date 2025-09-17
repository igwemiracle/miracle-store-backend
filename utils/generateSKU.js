function generateSKU() {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase();
  return `SKU-${randomPart}-${timePart}`;
}

module.exports = generateSKU;