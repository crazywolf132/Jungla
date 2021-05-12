import Jungla, { log } from './src';

import { data } from './data.json';

log(
	Jungla(
		`
{
	(basics.model.label = "1999") {
		_id as id,
		basics,
		description,
		listingDate
	}
}
`,
		data
	)
);
