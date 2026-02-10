var cron = require("node-cron");
const agregate = require("../queries/dhis_aggregate");

function updateSyncDBMorning() {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      await agregate.syncDhisAggregate(false)
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}

function updateSyncDBMidMorning() {
  cron.schedule(
    "00 11 * * *",
    async () => {
     await agregate.syncDhisAggregate(false)
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}

function updateSyncDBAfternoon() {
  cron.schedule(
    "55 15 * * *",
    async () => {
      await agregate.syncDhisAggregate(false)
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}
function updateSyncDBNight() {
  cron.schedule(
    "50 17 * * *",
    async () => {
      await agregate.syncDhisAggregate(false)
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}
function updateSyncFailed() {
  cron.schedule(
    "*/30 * * * *",
    async () => {
      await agregate.syncDhisAggregate(true)
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}




module.exports = { updateSyncDBMorning,updateSyncDBMidMorning,updateSyncDBAfternoon,updateSyncDBNight,updateSyncFailed}

