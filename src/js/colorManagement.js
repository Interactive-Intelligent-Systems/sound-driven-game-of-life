// Based on https://stackoverflow.com/a/7128796/3467824 (CC BY-SA 4.0)
const colorFramework = [
  { pct: 0.0, color: { r: 42, g: 71, b: 101 } },
  { pct: 0.8, color: { r: 115, g: 167, b: 144 } },
  { pct: 0.9, color: { r: 139, g: 0, b: 0 } }
]

const getColorForPercentage = pct => {
    for (var i = 1; i < colorFramework.length - 1; i++) {
        if (pct < colorFramework[i].pct) {
            break;
        }
    }
    const lower = colorFramework[i - 1];
    const upper = colorFramework[i];
    const range = upper.pct - lower.pct;
    const rangePct = (pct - lower.pct) / range;
    const pctLower = 1 - rangePct;
    const pctUpper = rangePct;
    const color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    }
    return `rgb(${[color.r, color.g, color.b].join(',')})`
}

export default getColorForPercentage
