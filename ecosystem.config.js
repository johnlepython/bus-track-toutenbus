module.exports = {
  apps: [
    {
      name: 'bus-server-toutenbus',
      script: 'pnpm',
      args: 'start:server',
      env: {
        PORT: 3010,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'bus-client-toutenbus',
      script: 'pnpm',
      args: 'start:client',
      env: {
        PORT: 3010,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'bus-provider-toutenbus',
      script: 'pnpm',
      args: 'dev:gtfs configurations/toutenbus_20.mjs',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
