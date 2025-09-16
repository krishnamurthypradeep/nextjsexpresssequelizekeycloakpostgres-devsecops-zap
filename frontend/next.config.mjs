/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/images/**', // matches /images/I/51ellgSYmxL._AC_UY218_.jpg
      },
    ],
    minimumCacheTTL: 60,
  },

};

export default nextConfig;
