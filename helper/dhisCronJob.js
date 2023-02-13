var utils = require("./JsonUtils");
var cron = require("node-cron");
const db = require("../queries");
const valueUtils = require("./getValueFromKey");
const fetch = require("cross-fetch");
const config = require("../config/dev").default;

function exportToDHIS() {
  cron.schedule(
    "* * * * *",
    async () => {
      const dataValues = [];
      const admissions = await db
        .getSessionsByScriptId("-MLb2EC2TCNLYqizkH8z")
        .then((res) => {
          return res;
        });

      const admissionsJson = utils.getJSON(admissions);
      let hchFemales = 0;
      let hchMales = 0;
      let chcFemales = 0;
      let chcMales = 0;
      let hchDischargesCount = 0;
      let chcDischargesCount = 0;
      let hchNNDCount = 0;
      let chcNNDCount = 0;
      let hchRecoveriesCount = 0;
      let chcRecoveriesCount = 0;
      const period = new Date();
      const fommattedPeriod = period
        .toISOString()
        .substr(0, 10)
        .replace(/-/g, "")
        .substr(0, 6);

      //ADMISSIONS
      admissionsJson.map((v) => {
        if (Array.isArray(v.value) && v.value.length > 0) {
          const station = valueUtils.getValueFromKey(v.value, "station");
          const gender = valueUtils.getValueFromKey(v.value, "gender");

          if (gender === "male") {
            if (station === "xMjHRUR4xmo") {
              hchMales = hchMales + 1;
            } else {
              chcMales = chcMales + 1;
            }
          } else {
            if (station === "xMjHRUR4xmo") {
              hchFemales = hchFemales + 1;
            } else {
              chcFemales = chcFemales + 1;
            }
          }
          if (admissionsJson.lastIndexOf(v) == admissionsJson.length - 1) {
            //Add The Data Values
            dataValues.push({
              dataElement: "PYAidEqFuZ1",
              value: hchFemales,
              orgUnit: "xMjHRUR4xmo",
            });
            dataValues.push({
              dataElement: "PYAidEqFuZ1",
              value: chcFemales,
              orgUnit: "N8aN69Vqi4l",
            });
            dataValues.push({
              dataElement: "jRsJ44sVDJK",
              value: hchMales,
              orgUnit: "xMjHRUR4xmo",
            });
            dataValues.push({
              dataElement: "jRsJ44sVDJK",
              value: chcMales,
              orgUnit: "N8aN69Vqi4l",
            });
          }
        }
      });

      //DISCHARGES
      const discharges = await db
        .getSessionsByScriptId("-MLbZQBn3_BXE1uGhTim")
        .then((res) => {
          return res;
        });

      const dischargeJson = utils.getJSON(discharges);
      dischargeJson.map((v) => {
        if (Array.isArray(v.value) && v.value.length > 0) {
          const patientOutcome = valueUtils.getValueFromKey(
            v.value,
            "patientOutcome"
          );
          const dateOfDischarge = valueUtils.getValueFromKey(
            v.value,
            "dateOfDischarge"
          );
          const station = valueUtils.getValueFromKey(v.value, "station");
          //const completeDate = dateOfDischarge.substr(0, 10);

          if (station === "xMjHRUR4xmo") {
            hchDischargesCount = hchDischargesCount + 1;
            if (patientOutcome === "death") {
              hchNNDCount = hchNNDCount + 1;
            } else {
              hchRecoveriesCount = hchRecoveriesCount + 1;
            }
          } else {
            chcDischargesCount = chcDischargesCount + 1;
            if (patientOutcome === "death") {
              chcNNDCount = chcNNDCount + 1;
            } else {
              chcRecoveriesCount = chcRecoveriesCount + 1;
            }
          }

          if (dischargeJson.lastIndexOf(v) == dischargeJson.length - 1) {
            //Add The Data Values
            dataValues.push({
              dataElement: "gw3I6DKkHkR",
              value: hchDischargesCount,
              orgUnit: "xMjHRUR4xmo",
            });
            dataValues.push({
              dataElement: "d0lhC0669Dv",
              value: hchNNDCount,
              orgUnit: "xMjHRUR4xmo",
            });
            dataValues.push({
              dataElement: "d31Hiii6n9C",
              value: hchRecoveriesCount,
              orgUnit: "xMjHRUR4xmo",
            });
            dataValues.push({
              dataElement: "gw3I6DKkHkR",
              value: chcDischargesCount,
              orgUnit: "N8aN69Vqi4l",
            });
            dataValues.push({
              dataElement: "d0lhC0669Dv",
              value: chcNNDCount,
              orgUnit: "N8aN69Vqi4l",
            });
            dataValues.push({
              dataElement: "d31Hiii6n9C",
              value: chcRecoveriesCount,
              orgUnit: "N8aN69Vqi4l",
            });

            const url = `http://${config.DHIS_HOST}:${config.DHIS_PORT}/dhis/api/32/dataValueSets`;
            let reqOpts = {};
          
            var auth ="Basic " +
              Buffer.from(config.DHIS_USER + ":" + config.DHIS_PW).toString(
                "base64"
              );

            let body = {
              dataSet: "gTPdKMpqffZ",
              period: fommattedPeriod,
              dataValues: dataValues,
            };
            reqOpts.headers = { Authorization: auth };
            reqOpts.headers["Content-Type"] = "application/json";
            reqOpts.body = JSON.stringify({ ...body });

            fetch(url, {
              method: "POST",
              ...reqOpts,
            })
              .then((res) => res.json())
              .then((res) => {
                console.log("Period:--", fommattedPeriod);
                console.log("Description:--", res.description);
                console.log("import Stats:--", res.importCount);
                console.log("Issues:--", res.conflicts);
              })
              .catch((err) => {
              });
          }
        }
      });
    },
    {
      scheduled: true,
      timezone: "Africa/Harare",
    }
  );
}

module.exports = { exportToDHIS };
