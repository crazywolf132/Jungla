import Jungla from '@jungla/language';

export { default as Server } from './server';
export { mimic } from './server';
export { enableDataRoute } from './server';
export { default as Middleware } from './handlers/middleware';

export const Converter = (req, res, next) => {
	if (!req.header.useJungla) {
		return res.status(501).json({
			status: 'Failed',
			middlewareUsed: false,
			converterUsed: true,
			message: 'Please use the Jungla Middleware before this middleware.',
		});
	}
	const old = res.json;
	res.json = function (obj) {
		obj = Jungla(req.body.query, obj);
		old.call(this, obj);
	};

	next();
};
