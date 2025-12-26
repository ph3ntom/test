/**
 * HTML Sanitization 함수
 * XSS 공격을 방지하기 위해 위험한 HTML 태그와 속성을 제거합니다.
 */

// 허용된 HTML 태그 목록 (화이트리스트)
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span'
]

// 허용된 속성 목록 (태그별)
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target'],
  'img': ['src', 'alt', 'width', 'height'],
  'code': ['class'],
  'pre': ['class'],
  'div': ['class'],
  'span': ['class']
}

// 위험한 프로토콜 목록
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:text/html',
  'vbscript:',
  'file:',
  'about:'
]

/**
 * HTML 문자열을 sanitize하여 XSS 공격을 방지합니다.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // 1. 위험한 태그 패턴 제거
  let sanitized = html
    // <script> 태그 제거
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // <iframe> 태그 제거
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // <object> 태그 제거
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // <embed> 태그 제거
    .replace(/<embed\b[^>]*>/gi, '')
    // <applet> 태그 제거
    .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
    // <meta> 태그 제거
    .replace(/<meta\b[^>]*>/gi, '')
    // <link> 태그 제거 (CSS injection 방지)
    .replace(/<link\b[^>]*>/gi, '')
    // <style> 태그 제거
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // <base> 태그 제거
    .replace(/<base\b[^>]*>/gi, '')
    // <form> 태그 제거
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    // <input> 태그 제거
    .replace(/<input\b[^>]*>/gi, '')
    // <button> 태그 제거
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
    // <textarea> 태그 제거
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
    // <select> 태그 제거
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')

  // 2. 이벤트 핸들러 속성 제거 (on으로 시작하는 모든 속성)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // 3. 위험한 프로토콜 제거
  DANGEROUS_PROTOCOLS.forEach(protocol => {
    const regex = new RegExp(`\\s*(?:href|src|data|action)\\s*=\\s*["']?${protocol}`, 'gi')
    sanitized = sanitized.replace(regex, ' href="#"')
  })

  // 4. javascript: 프로토콜 제거 (대소문자 혼합 공격 방지)
  sanitized = sanitized.replace(/\s*(?:href|src|data|action)\s*=\s*["']?\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, ' href="#"')

  // 5. expression() CSS 제거 (IE 전용 XSS)
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '')

  // 6. 허용되지 않은 태그 제거 (화이트리스트 방식)
  const allowedTagsPattern = ALLOWED_TAGS.join('|')
  const tagRegex = new RegExp(`<(?!\/?(${allowedTagsPattern})\\b)[^>]+>`, 'gi')
  sanitized = sanitized.replace(tagRegex, '')

  // 7. 허용되지 않은 속성 제거
  const attributeRegex = /<(\w+)([^>]*)>/g
  sanitized = sanitized.replace(attributeRegex, (match, tagName, attributes) => {
    const tag = tagName.toLowerCase()
    const allowedAttrs = ALLOWED_ATTRIBUTES[tag] || []

    if (allowedAttrs.length === 0) {
      return `<${tag}>`
    }

    // 속성 파싱 및 필터링
    const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g
    let filteredAttrs = ''
    let attrMatch

    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      const attrName = attrMatch[1].toLowerCase()
      const attrValue = attrMatch[2]

      if (allowedAttrs.includes(attrName)) {
        // href, src 속성의 프로토콜 검증
        if ((attrName === 'href' || attrName === 'src') && attrValue) {
          const isDangerous = DANGEROUS_PROTOCOLS.some(protocol =>
            attrValue.toLowerCase().trim().startsWith(protocol)
          )
          if (!isDangerous) {
            filteredAttrs += ` ${attrName}="${escapeHtmlAttribute(attrValue)}"`
          }
        } else {
          filteredAttrs += ` ${attrName}="${escapeHtmlAttribute(attrValue)}"`
        }
      }
    }

    return `<${tag}${filteredAttrs}>`
  })

  // 8. 연속된 공백 정리
  sanitized = sanitized.replace(/\s{2,}/g, ' ')

  return sanitized.trim()
}

/**
 * HTML 속성값을 이스케이프합니다.
 */
function escapeHtmlAttribute(text: string): string {
  const map: Record<string, string> = {
    '"': '&quot;',
    "'": '&#39;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;'
  }
  return text.replace(/["'<>&]/g, char => map[char] || char)
}

/**
 * 특수문자를 HTML 엔티티로 이스케이프합니다.
 * (일반 텍스트 표시용)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }
  return text.replace(/[&<>"'/]/g, char => map[char] || char)
}

/**
 * URL을 검증하고 안전한 URL만 허용합니다.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#'

  const trimmedUrl = url.trim().toLowerCase()

  // 위험한 프로토콜 체크
  const isDangerous = DANGEROUS_PROTOCOLS.some(protocol =>
    trimmedUrl.startsWith(protocol)
  )

  if (isDangerous) {
    return '#'
  }

  // http, https, mailto만 허용
  if (trimmedUrl.startsWith('http://') ||
      trimmedUrl.startsWith('https://') ||
      trimmedUrl.startsWith('mailto:') ||
      trimmedUrl.startsWith('/') ||
      trimmedUrl.startsWith('#')) {
    return url
  }

  // 프로토콜이 없으면 상대 경로로 간주
  if (!trimmedUrl.includes(':')) {
    return url
  }

  return '#'
}
