var cron = require("node-cron");
const agregate = require("../queries/dhis_aggregate");

function updateSyncDBMorning() {
  cron.schedule(
    "00 00 * * *",
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
    "40 09 * * *",
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
    "25 14 * * *",
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
    "50 20 * * *",
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

