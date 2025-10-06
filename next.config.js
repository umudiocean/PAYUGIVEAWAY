/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true, // Styled components desteği
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding'); // Web3 için
    return config;
  },
}

module.exports = nextConfig
