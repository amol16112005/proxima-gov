/** PM2 process file for VPS deployment — run: pm2 start devops/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "proxima-gov",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname + "/..",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "512M",
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};