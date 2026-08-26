const BLOCK_TAGS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "body",
  "br",
  "dd",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
])

const RAW_TEXT_TAGS = new Set(["pre", "textarea"])

function findTagEnd(html, start) {
  let quote = null
  for (let index = start + 1; index < html.length; index += 1) {
    const character = html[index]
    if (quote) {
      if (character === quote) quote = null
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (character === ">") {
      return index
    }
  }
  return -1
}

function tagMetadata(value) {
  const match = value.match(/^<\s*(\/)?\s*([A-Za-z][\w:-]*)/)
  if (!match) return null
  return {
    closing: Boolean(match[1]),
    name: match[2].toLowerCase(),
    selfClosing: /\/\s*>$/.test(value),
  }
}

function hasInlineDisplay(value) {
  const match = value.match(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
  const style = match?.[1] ?? match?.[2] ?? match?.[3]
  if (!style) return false
  return /(?:^|;)\s*display\s*:\s*inline(?:-[a-z]+)?(?:\s*!important)?\s*(?:;|$)/i.test(style)
}

function tokenize(html) {
  const tokens = []
  let cursor = 0
  while (cursor < html.length) {
    const tagStart = html.indexOf("<", cursor)
    if (tagStart === -1) {
      tokens.push({ type: "text", value: html.slice(cursor) })
      break
    }
    if (tagStart > cursor) tokens.push({ type: "text", value: html.slice(cursor, tagStart) })
    const tagEnd = findTagEnd(html, tagStart)
    if (tagEnd === -1) {
      tokens.push({ type: "text", value: html.slice(tagStart) })
      break
    }
    const value = html.slice(tagStart, tagEnd + 1)
    const metadata = tagMetadata(value)
    tokens.push(metadata ? { type: "tag", value, ...metadata } : { type: "text", value })
    cursor = tagEnd + 1
  }
  return tokens
}

function canonicalizeShopifyHtml(value) {
  const html = String(value ?? "").replace(/\r\n?/g, "\n")
  const tokens = tokenize(html)
  let rawTextDepth = 0
  const openBlockTags = []
  const annotated = tokens.map((token) => {
    if (token.type === "tag" && token.closing && RAW_TEXT_TAGS.has(token.name)) {
      rawTextDepth = Math.max(0, rawTextDepth - 1)
    }
    let visualBlock = false
    if (token.type === "tag" && BLOCK_TAGS.has(token.name)) {
      if (token.closing) {
        const matchingIndex = openBlockTags.findLastIndex(({ name }) => name === token.name)
        if (matchingIndex === -1) {
          visualBlock = true
        } else {
          visualBlock = openBlockTags[matchingIndex].visualBlock
          openBlockTags.splice(matchingIndex)
        }
      } else {
        visualBlock = !hasInlineDisplay(token.value)
        if (!token.selfClosing) openBlockTags.push({ name: token.name, visualBlock })
      }
    }
    const annotatedToken = { ...token, inRawText: rawTextDepth > 0, visualBlock }
    if (
      token.type === "tag" &&
      !token.closing &&
      !token.selfClosing &&
      RAW_TEXT_TAGS.has(token.name)
    ) {
      rawTextDepth += 1
    }
    return annotatedToken
  })

  return annotated
    .filter((token, index) => {
      if (
        token.type !== "text" ||
        token.inRawText ||
        !/^\s*$/.test(token.value) ||
        !token.value.includes("\n")
      ) return true
      const previous = annotated[index - 1]
      const next = annotated[index + 1]
      return !(
        (previous?.type === "tag" && previous.visualBlock) ||
        (next?.type === "tag" && next.visualBlock)
      )
    })
    .map(({ value: tokenValue }) => tokenValue)
    .join("")
}

export function compareShopifyHtml(expected, actual) {
  const normalizedExpected = String(expected ?? "").replace(/\r\n?/g, "\n")
  const normalizedActual = String(actual ?? "").replace(/\r\n?/g, "\n")
  if (normalizedExpected === normalizedActual) return { equal: true, normalized: false }
  const canonicalExpected = canonicalizeShopifyHtml(normalizedExpected)
  const canonicalActual = canonicalizeShopifyHtml(normalizedActual)
  const equal = canonicalExpected === canonicalActual
  return {
    equal,
    normalized: equal,
  }
}
