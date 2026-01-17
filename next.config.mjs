/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Pacotes externos para server components
  serverExternalPackages: ['pg', 'bcryptjs', 'jsonwebtoken'],
}

export default nextConfig
