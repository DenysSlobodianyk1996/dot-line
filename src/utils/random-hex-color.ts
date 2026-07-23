export function randomHexColor(): string {
  const channel = () => Math.floor(Math.random() * 156 + 50) // 50-205

  return `#${[channel(), channel(), channel()]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`
}
