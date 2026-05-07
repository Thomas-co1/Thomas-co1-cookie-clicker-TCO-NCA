module.exports = function(req, res, next) {
  if (req.session && req.session.userId) {
    res.locals.user = {
      id: req.session.userId,
      username: req.session.username
    };
    return next();
  }
  res.locals.user = null;
  next();
};
