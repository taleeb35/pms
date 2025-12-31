module.exports = {
  apps: [
    {
      name: "zonoir",
      cwd: "/home/zonoir/htdocs/zonoir.com",
      script: "./pm2-start.sh",
      env: {
        NODE_ENV: "production",
        PORT: "3035",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};