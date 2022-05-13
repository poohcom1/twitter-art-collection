const configs = {
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ["pbs.twimg.com"],
  },
  webpack: (config, { dev, isServer }) => {
    // Replace React with Preact only in client production build
    if ((!dev && !isServer) || process.env.PREACT === "true") {
      Object.assign(config.resolve.alias, {
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
      });
    }

    return config;
  },
  async headers() {
    return [
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${60 * 60 * 24 * 7}`,
          },
        ],
      },
    ];
  },
};

module.exports =
  process.env.ANALYZE === "true"
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@next/bundle-analyzer")({
        enabled: process.env.ANALYZE === "true",
      })(configs)
    : configs;
