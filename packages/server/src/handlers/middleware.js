/**
 * This route will only ever be called if a POST method was used...
 * as this is the way to then use JUNGLA to parse the data.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export default (req, res, next) => {
	if (req.body.query) {
		req.header.useJungla = true;
		next();
	} else {
		res.status(400).json({
			status: 'Failed',
			message: 'Failed to pass query field',
		});
	}
};
