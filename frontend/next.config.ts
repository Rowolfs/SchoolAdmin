import { type NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // сохраняем существующие алиасы и добавляем '@'
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(__dirname),
    }
    return config
  },
}

export default nextConfig
