import express, { Router } from 'express';
import morgan from 'morgan';
import timeout from 'express-timeout-handler';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';
import Jungla from '../language';
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

const corsOptions = {
	origin: '*',
	credentials: true,
	methods: ['GET', 'POST', 'OPTIONS'],
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	'Access-Control-Expose-Headers': '*',
};

app.use(json());
app.use(urlencoded({ extended: true }));
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

app.use('/', route);

export const mimic = (websiteURL, routeName) => {
	const router = Router();

	router.get('/*', (req, res) => {
		console.log(req.body);
		fetch(`${websiteURL}${req.params['0']}`)
			.then((res) => res.json())
			.then((body) => {
				if (
					operationName !== null &&
					operationName == 'IntrospectionQuery'
				) {
					return res.json(Introspection(body[0]));
				}
				res.json(Jungla(req.body.query || '{}', body));
			});
	});

	router.post('/*', (req, res) => {
		const { operationName } = req.body;
		console.log(req.body);
		fetch(`${websiteURL}${req.params['0']}`)
			.then((res) => res.json())
			.then((body) => {
				if (
					operationName !== null &&
					operationName == 'IntrospectionQuery'
				) {
					let intro = Introspection(body[0]);
					// return res.json({
					// 	data: {
					// 		__schema: {
					// 			types: Object.keys(intro).map((item) => {
					// 				return {
					// 					name: item,
					// 					kind: intro[item],
					// 					description: '',
					// 					fields: [],
					// 					enumValues: [],
					// 					possibleTypes: [],
					// 				};
					// 			}),
					// 			queryType: {},
					// 			mutationType: {},
					// 			subscriptionType: {},
					// 			directives: {},
					// 		},
					// 	},
					// });
					return res.json({
						data: require('../../data/test.json'),
					});
				}
				res.json(Jungla(req.body.query || '{}', body));
			});
	});

	app.use(routeName, router);
};

export default app;
