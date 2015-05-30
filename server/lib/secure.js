/**
 * Pre-defined paths
 * 
 * @type {Object}
 */
module.exports.paths = {
  ADMIN: '/admin/login',
  ADMIN_INDEX: '/admin/dashboard'
}

/**
 * Check is user authenticated
 * 
 * @return {Boolean}
 */
module.exports.isAuthenticated =  function (redirect_path) {
  return function (req, res, next) {
    if (!req.isAuthenticated())
      (redirect_path) 
        ? res.redirect(redirect_path)
        : res.sendStatus(401);
    else
      next();
  };
}

/**
 * Check is user has role
 * 
 * @param  {String}  role
 * @return {Boolean}
 */
module.exports.hasRole = function (role) {
  return function (req, res, next) {
    if (req.user && req.user.role === role)
      next();
    else
      res.sendStatus(401);
  };
};
