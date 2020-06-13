/**
 * This route will be used to access the data in the current working directory.
 *
 * This will mean a user can run the server version of jungla in a folder, and everything
 * in there will be served and accessable.
 */
import { Router } from 'express';
import { getAllFiles } from '../handlers/files';
import middleware from '../handlers/middleware';
import Jungla from '../../language';
import Introspection from '../handlers/introspection';

const router = Router();

const getFileByName = async (req, res) => {
	const { useJungla } = req.header;
	const { fileName: name } = req.params;
	const data = await ((await getAllFiles())
		.map((item) => item.replace('.json', ''))
		.includes(name)
		? require(`${process.cwd()}/data/${name}.json`)
		: { error: 'NOTHING FOUND WITH THIS NAME' });
	res.json(useJungla ? Jungla(req.body.query, data) : data);
};

const getAllFilesIndex = async (req, res) => {
	const { useJungla } = req.header;
	const data = (await getAllFiles()).map((item) => item.replace('.json', ''));
	res.json(useJungla ? Jungla(req.body.query, data) : data);
};

router.get('/', getAllFilesIndex);
router.post('/', middleware, getAllFilesIndex);

router.get('/introspection', (req, res) => {
	let intro = Introspection(require('../../../data/todos.json')[0]);
	res.json({
		data: intro,
	});
});
router.get('/:fileName', getFileByName);
router.post('/:fileName', middleware, getFileByName);

export default router;
