

const configs = {
    images: {
        domains: ['pbs.twimg.com'],
    },
};

module.exports = process.env.ANALYZE === 'true' ? (require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})(configs)) : configs
