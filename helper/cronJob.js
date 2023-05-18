var cron = require("node-cron");
const db = require("../queries/aggregate");

function updateSyncDBMorning() {
  cron.schedule(
    "30 06 * * *",
    async () => {
      db.syncDhisAggregate()
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}
function updateSyncDBMidMorning() {
  cron.schedule(
    "30 10 * * *",
    async () => {
      db.syncDhisAggregate()
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}

function updateSyncDBAfternoon() {
  cron.schedule(
    "30 15 * * *",
    async () => {
      db.syncDhisAggregate()
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}
function updateSyncDBNight() {
  cron.schedule(
    "30 20 * * *",
    async () => {
      db.syncDhisAggregate()
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}
function updateSyncDBTest() {
  cron.schedule(
    "* * * * *",
    async () => {
      db.syncTest()
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}



module.exports = { updateSyncDBMorning,updateSyncDBMidMorning,updateSyncDBAfternoon,updateSyncDBNight,updateSyncDBTest}

