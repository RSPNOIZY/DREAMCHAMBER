/**
 * NOIZY Security Headers — Edge Enforcement
 *
 * Apply security headers at the Cloudflare edge for global protection.
 * These headers protect against common web vulnerabilities.
 */

const SECURITY_HEADERS = {
  // HTTPS enforcement (2 years, include subdomains, preload-ready)
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Disable dangerous browser features
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",

  // XSS protection (legacy browsers)
  "X-XSS-Protection": "1; mode=block",

  // Content Security Policy (adjust as needed for your app)
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';",
};

/**
 * Apply security headers to a response
 * @param {Response} response - Original response
 * @returns {Response} - Response with security headers
 */
export function applySecurityHeaders(response) {
  const securedResponse = new Response(response.body, response);

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    securedResponse.headers.set(header, value);
  }

  // Add NOIZY identifier
  securedResponse.headers.set("X-NOIZY-Protected", "true");

  return securedResponse;
}

/**
 * Create security headers for JSON API responses
 * @returns {Headers} - Headers object with security headers
 */
export function createSecureHeaders() {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(header, value);
  }

  headers.set("X-NOIZY-Protected", "true");

  return headers;
}

/**
 * CORS headers for API endpoints
 * @param {string} origin - Request origin
 * @returns {Headers} - Headers with CORS + security
 */
export function createCorsHeaders(origin = "*") {
  const headers = createSecureHeaders();

  // CORS headers
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-NOIZY-Key");
  headers.set("Access-Control-Max-Age", "86400");

  return headers;
}

export default {
  applySecurityHeaders,
  createSecureHeaders,
  createCorsHeaders,
  SECURITY_HEADERS,
};
