const redisClient = require('./signIn').redisClient;

const handleSignOut = (req, res) => {
		const { authorization } = req.headers;
		return redisClient.del(authorization, (err, data) => {
			if (err || !data) {
				res.status(400).json('failed to sign out');
            }
			return res.status(200).json({ data });
		});
};

module.exports = {
	handleSignOut,
};
