import { Server, mimic } from './src';

const port = process.env.PORT || 8080;

mimic('https://jsonplaceholder.typicode.com/', '/test/');

Server.listen(port, () =>
	console.log(`App listening at http://localhost:${port}`)
);
