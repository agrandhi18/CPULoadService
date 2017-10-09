const os = require('os')

let percentageValuesPerCore = null;
let overAllPercentage;
let isServerStarted = false;
let totalCores = 0;

/**
 * This function calculates the nuber os milliseconds cpu sent on nonIdle mode and idle mode 
 * 
 * @return [{nonIdleTicks, idleTicks }] Returns an array of objects, each object has cpu core nonIdleTicks
 *          and idleTicks 
 */
function getCurrentCpusData() {
  const cpus = os.cpus();
  totalCores = cpus.length;
  return cpus.map(cpu => {
    const times = cpu.times
    return {
      nonIdleTicks: Object.keys(times).filter(time => time !== 'idle').reduce((nonIdleTicks, time) => { nonIdleTicks += times[time]; return nonIdleTicks }, 0),
      idleTicks: times.idle,
    }
  })
}


/**
 * This function calculates the percentage of system load for each core and over all system load for all cores
 * @param {*} timeInterval The time gap for comparing cpu core ticks
 */
function startSystemLoadCalculation(timeInterval) {
  let startMeasures = getCurrentCpusData();
  let totalNonIdleTicksForAllCpus;
  let totalIdeTicksForAlllCpus;
  setInterval(() => {
    const endMeasures = getCurrentCpusData();
    totalNonIdleTicksForAllCpus = 0;
    totalIdeTicksForAlllCpus = 0;
    percentageValuesPerCore = endMeasures.map((end, i) => {
      totalNonIdleTicksForAllCpus += end.nonIdleTicks - startMeasures[i].nonIdleTicks;
      totalIdeTicksForAlllCpus += end.idleTicks - startMeasures[i].idleTicks;
      return ((end.nonIdleTicks - startMeasures[i].nonIdleTicks) / ((end.nonIdleTicks - startMeasures[i].nonIdleTicks) + (end.idleTicks - startMeasures[i].idleTicks)) * 100).toFixed(2);
    })
    overAllPercentage = (totalNonIdleTicksForAllCpus / (totalNonIdleTicksForAllCpus + totalIdeTicksForAlllCpus) * 100).toFixed(2);
    console.log(percentageValuesPerCore.join(' '), '\n');
    startMeasures = getCurrentCpusData()
  }, timeInterval);

}

/**
 * This function starts the system load calculation if the first param is "start" or else would 
 * send back the cpu load averages
 */
process.on('message', (requestParams) => {
  if (requestParams[0] == "start" && !isServerStarted) {
    isServerStarted = true;
    startSystemLoadCalculation(requestParams[1]);
    setTimeout(() => {
      process.send({
        value: {
          totalCores: totalCores,
          corePercentages: percentageValuesPerCore,
          totalPercentage: overAllPercentage
        },
        initiatedFor: "start"
      });
    }, 1100);
  } else if (requestParams[0] === "getInfo") {
    process.send({
      value: {
        totalCores: totalCores,
        corePercentages: percentageValuesPerCore,
        totalPercentage: overAllPercentage
      },
      initiatedFor: "getInfo"
    });
  }
});
