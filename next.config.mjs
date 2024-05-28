/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            // Basic redirect
            {
                source: '/',
                destination: '/dashboard',
                permanent: true,
            }
        ]
    },
};

export default nextConfig;
