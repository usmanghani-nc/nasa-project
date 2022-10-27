const axios = require('axios');
const launchesDB = require('./launches.mongoos');
const planets = require('./planets.mongoos');

const LATEST_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  try {
    const response = await axios.post(SPACEX_API_URL, {
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: 'rocket',
            select: {
              name: 1,
            },
          },
          {
            path: 'payloads',
            select: {
              customers: 1,
            },
          },
        ],
      },
    });

    if (response.status !== 200) {
      console.log('Problem downloading launch data');
      throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
      const payloads = launchDoc['payloads'];

      const customer = payloads.flatMap((payload) => {
        return payload['customers'];
      });

      const launch = {
        flightNumber: launchDoc['flight_number'],
        mission: launchDoc['name'],
        rocket: launchDoc['rocket']['name'],
        launchDate: launchDoc['date_local'],
        upcoming: launchDoc['upcoming'],
        success: launchDoc['success'],
        customer,
        // target: launchDoc["flight_number"],
      };
      console.log(launch);

      await saveLaunches(launch);
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('launch data already loaded!!');
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDB.findOne(filter);
}

async function existsLauncheWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
  const latestLauch = await launchesDB.findOne({}).sort('-flightNumber');

  if (!latestLauch) {
    return LATEST_FLIGHT_NUMBER;
  }

  return latestLauch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDB
    .find({}, { __v: 0 })
    .sort({
      flightNumber: 1,
    })
    .skip(skip)
    .limit(limit);
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    customer: ['Zero To Mastery', 'NASA'],
    upcoming: true,
    success: true,
    flightNumber: newFlightNumber,
  });

  await saveLaunches(newLaunch);
}

async function saveLaunches(launch) {
  await launchesDB.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true },
  );
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDB.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    },
  );

  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  existsLauncheWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
