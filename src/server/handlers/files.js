import { readdirSync } from 'fs';

export const getAllFiles = async () => {
	let results = await readdirSync(`${process.cwd()}/data/`);
	console.log(results);
	return results;
};
