import express, { request, Router } from 'express';
import morgan from 'morgan';
import timeout from 'express-timeout-handler';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';
import Jungla from '@jungla/language';
import Introspection from './handlers/introspection';

/*
 
 ███████╗███████╗████████╗██╗   ██╗██████╗ 
 ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
 ███████╗█████╗     ██║   ██║   ██║██████╔╝
 ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ 
 ███████║███████╗   ██║   ╚██████╔╝██║     
 ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     
                                           
 
*/

const app = express();

if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('dev'));
}

app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true }));

app.use(
	timeout.handler({
		timeout: 60000,
		onTimeout: function (req, res) {
			res.status(503).send('Request timeout. Please retry again later');
		},
	})
);

/*
 
 ██████╗  ██████╗ ██╗   ██╗████████╗███████╗███████╗
 ██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔════╝
 ██████╔╝██║   ██║██║   ██║   ██║   █████╗  ███████╗
 ██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ╚════██║
 ██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗███████║
 ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚══════╝
                                                    
 
*/

import route from './routes/basicRoute';

export const defaultCors = () => {
	const corsOptions = {
		origin: '*',
		credentials: true,
		methods: ['GET', 'POST', 'OPTIONS'],
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
		'Access-Control-Expose-Headers': '*',
	};
	app.use('*', cors(corsOptions));
	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Expose-Headers', '*');
		res.header(
			'Access-Control-Allow-Headers',
			'Origin, X-Requested-With, Content-Type, Accept'
		);
		next();
	});
};

export const enableDataRoute = () => {
	app.use('/', route);
};

export const mimic = (websiteURL, routeName, options = {}) => {
	const router = Router();

	router.all('/*', async (req, res) => {
		const { method, body: requestBody, headers: oldHeaders } = req;
		const { operationName } = requestBody;
		const additionalHeaders = {};

		if (options.copyHeaders) {
			options.copyHeaders.forEach((header) => {
				additionalHeaders[header] = JSON.stringify(
					req.headers[header] ?? {}
				);
			});
		}

		// We are going to determine if this is a real `post` (just an example) request
		// or a JUNGLA request.
		const realRequest =
			(Object.keys(requestBody).length >= 1 &&
				!Object.keys(requestBody).includes('query')) ||
			Object.keys(requestBody).length === 0;

		try {
			const response = await fetch(`${websiteURL}${req.params['0']}`, {
				method: realRequest ? method : 'get',
				body:
					realRequest && Object.keys(requestBody).length >= 1
						? JSON.stringify(requestBody)
						: undefined,
				headers: {
					'content-type': 'application/json; charset=utf-8',
					...additionalHeaders,
				},
			});

			if (response.status !== 200) {
				return res.status(response.status).end(response.statusText);
			}

			let body;

			if (
				response.headers
					.get('content-type')
					.includes('application/json')
			) {
				body = await response.json();
			} else {
				body = await response.buffer();
			}

			if (
				operationName !== null &&
				operationName == 'IntrospectionQuery'
			) {
				return res.json({
					data: Introspection(body[0]),
				});
			}

			const tempHeaders = {};
			const responseHeaders = response.headers.raw();

			Object.keys(responseHeaders).forEach((headerKey) => {
				const val = responseHeaders[headerKey];
				tempHeaders[headerKey] = Array.isArray(val) ? val[0] : val;
			});

			res.set({
				...tempHeaders,
			});
			// res.set('content-type', response.headers.get('content-type'));
			// Only going to bother with the JUNGLA part if the response is json... otherwise it is pointless wasting time
			if (
				response.headers
					.get('content-type')
					.includes('application/json')
			) {
				res.json(Jungla(req.body.query || '{}', body ?? {}));
			} else {
				res.end(body);
			}
		} catch {}
	});

	app.use(routeName, router);
};

export default app;
