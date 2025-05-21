const path = require('path')

module.exports = {
  trailingSlash: true,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}'
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}'
    }
  },
  output: 'standalone',
  images: {
    domains: [
      'storage.googleapis.com',
      'cilxj-yiaaa-aaaag-alkxq-cai.icp0.io',
      'gateway.pinata.cloud',
      'w.wallhaven.cc',
      'img.freepik.com',
      'www.googletagmanager.com',
      'www.clarity.ms'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cilxj-yiaaa-aaaag-alkxq-cai.icp0.io',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'w.wallhaven.cc',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.googletagmanager.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.clarity.ms',
        port: '',
        pathname: '/**'
      }
    ]
  },
  webpack(config, options) {
    const { isServer } = options
    config.resolve.modules.push(path.resolve('./src'))
    config.module.rules.push(
      {
        test: /\.(ogg|mp3|wav|flac|mpe?g)$/i,
        exclude: config.exclude,
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: config.inlineImageLimit,
              fallback: require.resolve('file-loader'),
              publicPath: `${config.assetPrefix}/_next/static/images/`,
              outputPath: `${isServer ? '../' : ''}static/images/`,
              name: '[name]-[hash].[ext]',
              esModule: config.esModule || false
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      }
    )
    return config
  },
  // https://nextjs.org/docs/api-reference/next.config.js/headers
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|mp3|gif|mp4)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=9999999999, must-revalidate'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms;
              connect-src 'self' https://www.google-analytics.com https://www.clarity.ms https://b.clarity.ms;
              img-src 'self' data: https:;
              style-src 'self' 'unsafe-inline';
              frame-src 'self';
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  }
}
