const client = require('../database-connection/postgres-client');
const handleError = require('../error/handle-error');

// updates the name of asteroid, adds nickname to the front but keeps the original classifier name
module.exports = (request, response) => {
  // the classifier name for the asteroid, in parenthesis
  let name = request.params.name.match(/\([a-z0-9\s]+\)/i);

  const updateSQL = `UPDATE asteroids SET name=$1 WHERE id=$2 RETURNING *;`;
  const values = [`${request.body.name} ${name}`, request.params.id];

  return client
    .query(updateSQL, values)
    .then((sqlReturn) => {
      response.redirect(`/location/${request.params.id}`);
    })
    .catch((error) => handleError(error));
};
