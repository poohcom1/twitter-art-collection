

const configs = {
    images: {
        domains: ['pbs.twimg.com'],
    },
    webpack: (config, { dev, isServer }) => {
        // Replace React with Preact only in client production build
        if (!dev && !isServer) {
            Object.assign(config.resolve.alias, {
                react: 'preact/compat',
                'react-dom/test-utils': 'preact/test-utils',
                'react-dom': 'preact/compat',
            });
        }

        return config;
    },
};

module.exports = process.env.ANALYZE === 'true' ? (require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})(configs)) : configs
