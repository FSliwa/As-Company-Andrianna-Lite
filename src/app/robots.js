/** robots.txt — cały serwis publiczny, sitemap w domenie z metadataBase. */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://as-loveliness.eu/sitemap.xml',
  };
}
