module.exports = {
  apps: [
    {
      name: "index",
      script: "./index.js",
      cron_restart: "* * * * *",
      autorestart: true,
    },
    // {
    //   name: "transactions",
    //   script: "./transactions/transactions.js",
    //   cron_restart: "* * * * *",
    //   autorestart: false,
    // }
  ]
}
