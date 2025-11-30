module.exports = {
  apps: [
    {
      name: "myclinichq",
      cwd: "/home/myclinichq/htdocs/myclinichq.com",
      script: "./pm2-start.sh",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};