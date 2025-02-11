/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,  // Disable TypeScript type checking during the build
    },
    images: {
      domains: [
        'lh3.googleusercontent.com',
        'assets.myntassets.com'
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
          ],
        },
      ];
    },
    experimental: {
      serverComponentsExternalPackages: ['@sparticuz/chromium']
    },
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.externals.push('_http_common');
      }
      return config;
    }
  };
  
  export default nextConfig;
  