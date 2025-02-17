/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,  // Disable TypeScript type checking during the build
    },
    images: {
      domains: [
        'lh3.googleusercontent.com',
        'assets.myntassets.com',
        'm.media-amazon.com',
        'media.landmarkshops.in'
      ], // Add the domain to the list
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
            { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
            {
              key: 'Feature-Policy',
              value: 'camera *; microphone *; accelerometer *; gyroscope *'
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(self), xr-spatial-tracking=(self)'
            }
          ],
        },
      ];
    },
    experimental: {
      serverComponentsExternalPackages: ['@sparticuz/chromium']
    },

  };
  
  export default nextConfig;
  