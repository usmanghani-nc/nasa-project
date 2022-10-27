const { getAllPlantes } = require('../../models/planets.model');

async function httpGetAllPlanets(req, res) {
  return res.status(200).json(await getAllPlantes());
}

module.exports = {
  httpGetAllPlanets,
};
