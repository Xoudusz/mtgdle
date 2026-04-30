/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cards.scryfall.io' },
      { protocol: 'https', hostname: 'c1.scryfall.com' },
    ],
  },
  experimental: {
    instrumentationHook: true,
  },
}

export default nextConfig
