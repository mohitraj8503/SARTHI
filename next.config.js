const isProd = process.env.NODE_ENV === 'production';
const isHttps = process.env.FORCE_HTTPS === 'true';

const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swMinify: true,
    disable: !isProd,
    workboxOptions: {
        disableDevLogs: true,
    },
});

const nextConfig = {
    output: 'standalone',
    allowedDevOrigins: ['10.89.251.136', '10.89.251.136:3000'],
    serverExternalPackages: ['@prisma/client', 'prisma', 'ioredis', 'pdf-lib', 'hls.js'],
    experimental: {
        optimizePackageImports: [
            'framer-motion', 
            'lucide-react', 
            '@tanstack/react-query', 
            'socket.io-client'
        ],
    },
    turbopack: {},

    webpack: (config, { isServer }) => {
        // Optimization for Hostinger (limited RAM)
        if (!isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                maxInitialRequests: 25,
                minSize: 20000,
            };
        }

        if (isServer) {
            const origIgnore = config.ignoreWarnings || [];
            config.ignoreWarnings = [
                ...origIgnore,
                {
                    module: /node_modules\/jose\/dist\/webapi\/lib\/deflate\.js/,
                    message: /A Node\.js API is used/,
                },
            ];
        }
        return config;
    },

    // distDir defaults to '.next' - required for Hostinger deployment
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        formats: ['image/avif', 'image/webp'],
        qualities: [75, 85, 100],
        localPatterns: [
            {
                pathname: '/**',
            },
            {
                pathname: '/**/*'
            }
        ],
        remotePatterns: [
            { protocol: 'https', hostname: 'api.dicebear.com' },
            { protocol: 'https', hostname: 'static.wixstatic.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'unsplash.com' },
            { protocol: 'https', hostname: 'sarthi-woad.vercel.app' },
            { protocol: 'https', hostname: 'www.sarthi-woad.vercel.app' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
            { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
            { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            { protocol: 'https', hostname: 'img.youtube.com' },
            { protocol: 'https', hostname: 'i.ytimg.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'ui-avatars.com' },
            { protocol: 'https', hostname: 'www.transparenttextures.com' },
            { protocol: 'https', hostname: 'www.google.com' },
            { protocol: 'https', hostname: 'www.svgrepo.com' },
            { protocol: 'https', hostname: 'pixabay.com' },
            { protocol: 'https', hostname: 'cdn.pixabay.com' },
            { protocol: 'https', hostname: 'images.pexels.com' },
            { protocol: 'https', hostname: 'pexels.com' },
            { protocol: 'https', hostname: 'static.startuptalky.com' },
            { protocol: 'https', hostname: 'images.livemint.com' },
            { protocol: 'https', hostname: 'gumlet.assettype.com' },
            { protocol: 'https', hostname: 'img.etimg.com' },
            { protocol: 'https', hostname: 'resize.indiatvnews.com' },
            { protocol: 'https', hostname: 'static.toiimg.com' },
            { protocol: 'https', hostname: 'vidyanestlms.s3.ap-south-1.amazonaws.com' },
        ],
    },
    reactStrictMode: true,
    compress: true,
    productionBrowserSourceMaps: false,
    staticPageGenerationTimeout: 600,
    async headers() {
        return [
            {
                source: '/(student|teacher)/live-class/:path*',
                headers: [
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
                    { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
                ],
            },
            {
                source: '/courses/:path*/live/:path*',
                headers: [
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
                    { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
                ],
            },
            {
                source: '/verify/:path*',
                headers: [
                    { key: 'Referrer-Policy', value: 'no-referrer' },
                ],
            },
            {
                source: '/certificates/:path*',
                headers: [
                    { key: 'Referrer-Policy', value: 'no-referrer' },
                ],
            },
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=*, microphone=*, geolocation=*' },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            isProd 
                                ? "script-src 'self' https://accounts.google.com https://apis.google.com https://checkout.razorpay.com https://cdn.razorpay.com https://8x8.vc https://meet.jit.si https://www.youtube.com https://s.ytimg.com https://www.google-analytics.com https://www.googletagmanager.com"
                                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://checkout.razorpay.com https://cdn.razorpay.com https://8x8.vc https://meet.jit.si https://www.youtube.com https://s.ytimg.com https://www.google-analytics.com https://www.googletagmanager.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "img-src 'self' data: https: blob: http:",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "connect-src 'self' https://api.razorpay.com https://cdn.razorpay.com https://vimeo.com https://*.cloudinary.com https://www.google-analytics.com https://cdn.pixabay.com https://oauth2.googleapis.com https://api.github.com https://lumberjack-cx.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://meet.jit.si https://www.google.com https://maps.google.com https://*.livekit.cloud wss://*.livekit.cloud ws://localhost:* wss://localhost:* http://localhost:* ws://* wss://* https://sarthi.live wss://sarthi.live",
                            "frame-src 'self' https://accounts.google.com https://www.youtube.com https://meet.jit.si https://8x8.vc https://api.razorpay.com https://checkout.razorpay.com https://player.vimeo.com https://www.google.com https://maps.google.com",
                            "child-src 'self' https://www.google.com https://maps.google.com blob:",
                            "media-src 'self' https: blob: data:",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "frame-ancestors 'none'"
                        ].join('; '),
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            { source: '/faq', destination: '/faqs' },
            { source: '/privacy', destination: '/privacy-policy' },
            { source: '/terms', destination: '/terms-and-conditions' },
            { source: '/policy', destination: '/privacy-policy' }
        ];
    },
    async redirects() {
        return [
            { source: '/dash', destination: '/dashboard', permanent: true },
            { source: '/auth/signup', destination: '/signup', permanent: true },
            { source: '/auth/login', destination: '/login', permanent: true },
            { source: '/auth/forgot-password', destination: '/forgot-password', permanent: true },
            { source: '/courrses', destination: '/courses', permanent: true },
            { source: '/certifications/:path*', destination: '/certification-exams/:path*', permanent: true },
        ];
    },
};

module.exports = withPWA(nextConfig);
