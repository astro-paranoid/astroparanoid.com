// Error handler, outputs error to console and to front end if response argument passed in
module.exports = (err, res, errorMessage) => {
  console.error(err);
  if (res) res.render('pages/error', { status: err.status, message: errorMessage });
};
