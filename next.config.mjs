/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,  // Disable TypeScript type checking during the build
    },
    images: {
      domains: ['lh3.googleusercontent.com'], // Add the domain to the list
    },
  };
  
  export default nextConfig;
  