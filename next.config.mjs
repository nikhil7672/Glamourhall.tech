/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,  // Disable TypeScript type checking during the build
    },
    images: {
      domains: ['lh3.googleusercontent.com'], // Add the domain to the list
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: "Content-Security-Policy",
              value: `
                script-src 'self' 'unsafe-inline' 'unsafe-eval';
                object-src 'self';
                child-src 'self';
                sandbox allow-scripts allow-forms allow-popups allow-modals;
              `.replace(/\n/g, ''), // Remove newlines for cleaner output
            },
          ],
        }
      ]
    }
  };
  
  export default nextConfig;
  