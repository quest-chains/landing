const QUESTCHAINS__APP_URL =
  process.env.NEXT_PUBLIC_QUESTCHAINS_APP_URL || 'https://app.questchains.xyz';

module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/chain/:slug*',
        destination: QUESTCHAINS__APP_URL + '/:slug*',
        permanent: true,
      },
      {
        source: '/polygon/:slug*',
        destination: QUESTCHAINS__APP_URL + '/polygon/:slug*',
        permanent: true,
      },
      {
        source: '/gnosis/:slug*',
        destination: QUESTCHAINS__APP_URL + '/gnosis/:slug*',
        permanent: true,
      },
      {
        source: '/optimism/:slug*',
        destination: QUESTCHAINS__APP_URL + '/optimism/:slug*',
        permanent: true,
      },
      {
        source: '/arbitrum/:slug*',
        destination: QUESTCHAINS__APP_URL + '/arbitrum/:slug*',
        permanent: true,
      },
    ];
  },
};
