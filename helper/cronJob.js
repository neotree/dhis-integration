var cron = require("node-cron");
const agregate = require("../queries/dhis_aggregate");

function updateSyncDBMorning() {
  cron.schedule(
    "10 23 * * *",
    async () => {
      await agregate.syncDhisAggregate()
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}

function updateSyncDBMidMorning() {
  cron.schedule(
    "24 23 * * *",
    async () => {
     await agregate.syncDhisAggregate()
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
      await agregate.syncDhisAggregate()
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
      await agregate.syncDhisAggregate()
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}



module.exports = { updateSyncDBMorning,updateSyncDBMidMorning,updateSyncDBAfternoon,updateSyncDBNight}

