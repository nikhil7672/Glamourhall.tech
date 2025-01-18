/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,  // Disable TypeScript type checking during the build
    },
    images: {
      domains: ['lh3.googleusercontent.com'], // Add the domain to the list
    },
 
    async rewrites() {
      return [
        {
            source: '/dashboard',
            destination: 'http://127.0.0.1:8000',
        }
      ];
    }
  };
  
  export default nextConfig;
  