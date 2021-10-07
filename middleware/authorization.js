const redisClient = require('../controller/signIn').redisClient;

const requireAuth = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        res.status(400).json('Unauthorized');
    }
	return redisClient.get(authorization, (err, data) => {
		if (err || !data) {
			res.status(400).json('Unauthorized');
        }
		return next();
	});
};

module.exports = {
    requireAuth
};