var cron = require("node-cron");
const db = require("../queries/aggregate");
//const fetch = require("cross-fetch");

//function exportToDHIS() {
//   cron.schedule(
//     "*/2 * * * *",
//     async () => {
//       db.updateDhisSyncDB()
//     },
//     {
//       scheduled: true,
//       timezone: "Africa/Harare",
//     }
//   );
// }
function updateSyncDB() {
  cron.schedule(
    "* * * * *",
    async () => {
      db.syncDhisAggregate()
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}

module.exports = { updateSyncDB};
