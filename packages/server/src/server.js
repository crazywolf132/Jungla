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

	router.all('/*', (req, res) => {
		const { method, body: requestBody } = req;
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

		fetch(`${websiteURL}${req.params['0']}`, {
			method: realRequest ? method : 'get',
			body:
				realRequest && Object.keys(requestBody).length >= 1
					? JSON.stringify(requestBody)
					: undefined,
			headers: {
				'Content-Type': 'application/json',
				...additionalHeaders,
			},
			...options,
		})
			.then((response) =>
				response.status === 200
					? response
					: res.status(response.status).end(response.statusText)
			)
			.then((res) => res.json())
			.then((body) => {
				if (
					operationName !== null &&
					operationName == 'IntrospectionQuery'
				) {
					return res.json({
						data: Introspection(body[0]),
					});
				}
				if (body) res.json(Jungla(req.body.query || '{}', body));
			})
			.catch((e) => e);
	});

	app.use(routeName, router);
};

export default app;
