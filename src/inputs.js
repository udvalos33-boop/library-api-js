export function isId(value) {
  return Number.isInteger(value) && value > 0 && value <= 2147483647;
}

export function isPrice(value) {
  return Number.isInteger(value) && value >= 0 && value <= 2147483647;
}

export function isText(value) {
  return typeof value === "string" && value.trim() !== "";
}
