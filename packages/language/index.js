import Jungla, { log } from './src';

import data from './data.json';

log(
	Jungla(
		`
{
  name,
  _id as id,
  options -> COUNT
}
`,
		data
	)
);
