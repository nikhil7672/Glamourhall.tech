/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      domains: ['lh3.googleusercontent.com'],
    },
 
    async rewrites() {
      return [
        {
            source: '/chat',
        }
      ];
    }
  };
  
  export default nextConfig;
  