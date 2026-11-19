/**
 * Built CSS on the oldest Chrome the app supports (OLDEST_CHROME, AR-21): the Android app on a
 * never-updated system WebView. An old browser drops what it doesn't know: a whole @layer block,
 * a declaration with a new property or unit, a rule with a new selector. Anything newer than the
 * floor must sit inside an @supports that checks for it, or follow a plain declaration of the same
 * property (only for a value without var(), which is checked after it has already won).
 */
import postcss, { type AtRule, type Container, type Declaration, type Plugin } from 'postcss'
import cascadeLayers from '@csstools/postcss-cascade-layers'

type Feature = { name: string; chrome: number }

const AT_RULES: (Feature & { at: string })[] = [
  { name: '@layer', chrome: 99, at: 'layer' },
  { name: '@container', chrome: 105, at: 'container' },
]
const SELECTORS: (Feature & { test: RegExp })[] = [
  { name: ':where()/:is()', chrome: 88, test: /:(where|is)\(/ },
  { name: ':has()', chrome: 105, test: /:has\(/ },
]
const PROPERTIES: (Feature & { prop: string })[] = [
  { name: 'aspect-ratio', chrome: 88, prop: 'aspect-ratio' },
  { name: 'translate', chrome: 104, prop: 'translate' },
  { name: 'scale', chrome: 104, prop: 'scale' },
  { name: 'rotate', chrome: 104, prop: 'rotate' },
]
const VALUES: (Feature & { test: RegExp })[] = [
  { name: 'empty var() fallback', chrome: 999, test: /var\(--[\w-]+,\)/ },
  { name: 'container units', chrome: 105, test: /\d(cq[iwhb]|cqmin|cqmax)\b/ },
  { name: 'small/large/dynamic viewport units', chrome: 108, test: /\d[sld]v(h|w|i|b|min|max)\b/ },
  { name: 'color-mix()', chrome: 111, test: /color-mix\(/ },
  { name: 'oklch()/oklab()', chrome: 111, test: /okl(ch|ab)\(/ },
]

function supportsAround(node: Container | Declaration): string[] {
  const params: string[] = []
  for (let p = node.parent; p; p = p.parent as Container | undefined)
    if (p.type === 'atrule' && (p as AtRule).name === 'supports') params.push((p as AtRule).params)
  return params
}

function where(decl: Declaration): string {
  const parent = decl.parent
  return parent?.type === 'rule' ? (parent as unknown as { selector: string }).selector : ''
}

/** Every use of CSS newer than `chrome` in `css` that has no fallback, described. */
export function newerThanFloor(css: string, chrome: number): string[] {
  const problems: string[] = []
  const root = postcss.parse(css)
  root.walkAtRules((at) => {
    for (const f of AT_RULES)
      if (f.chrome > chrome && at.name === f.at) problems.push(`${f.name} (Chrome ${f.chrome})`)
  })
  root.walkRules((rule) => {
    for (const f of SELECTORS) {
      if (f.chrome <= chrome || !f.test.test(rule.selector)) continue
      if (supportsAround(rule).some((p) => f.test.test(p))) continue
      problems.push(`${rule.selector}: ${f.name} (Chrome ${f.chrome})`)
    }
  })
  root.walkDecls((decl) => {
    const newer = [
      ...PROPERTIES.filter((f) => f.chrome > chrome && decl.prop === f.prop),
      ...VALUES.filter((f) => f.chrome > chrome && f.test.test(decl.value)),
    ]
    for (const f of newer) {
      const supported = supportsAround(decl).some((p) =>
        'prop' in f ? p.includes(`${f.prop}:`) || p.includes(`${f.prop} :`) : f.test.test(p),
      )
      if (supported) continue
      const siblings = decl.parent?.nodes ?? []
      const before = siblings.slice(0, siblings.indexOf(decl))
      const plain = before.some(
        (n) =>
          n.type === 'decl' && n.prop === decl.prop && !('test' in f && f.test.test(n.value)),
      )
      if (plain && !('prop' in f) && !decl.prop.startsWith('--') && !decl.value.includes('var('))
        continue
      problems.push(`${where(decl)} { ${decl.prop}: ${decl.value} }: ${f.name} (Chrome ${f.chrome})`)
    }
  })
  return problems
}

/** `var(--x,)` becomes `var(--x, )`: Chrome before ~105 drops a declaration with the former. */
const emptyVarFallback: Plugin = {
  postcssPlugin: 'dots-and-boxes:empty-var-fallback',
  Declaration(decl) {
    if (decl.value.includes(',)')) decl.value = decl.value.replace(/var\((--[\w-]+),\)/g, 'var($1, )')
  },
}

/** The built CSS made safe for an old WebView: no @layer, no empty var() fallback. */
export async function lowerForOldWebView(css: string): Promise<string> {
  const result = await postcss([cascadeLayers(), emptyVarFallback]).process(css, { from: undefined })
  return result.css
}
