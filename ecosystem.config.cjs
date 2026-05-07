module.exports = {
  apps: [
    {
      name: "zonoir",
      cwd: "/home/zonoir/htdocs/zonoir.com",
      script: "npm",
      args: "run preview -- --host 0.0.0.0 --port 3035",
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
//for Zonoir