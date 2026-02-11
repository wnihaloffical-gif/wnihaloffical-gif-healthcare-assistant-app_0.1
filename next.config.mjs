/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // reactCompiler: true,
  cacheComponents: false,
  devIndicators: false,
}

export default nextConfig
