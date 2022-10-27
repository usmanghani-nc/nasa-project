const DEFAULT_PAGE_SIZE = 1;
const DEFAULT_LIMIT = 0;

function getPagination(query) {
  const page = Math.abs(query.page) || DEFAULT_PAGE_SIZE;
  const limit = Math.abs(query.limit) || DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  return {
    limit,
    skip,
  };
}

module.exports = {
  getPagination,
};
