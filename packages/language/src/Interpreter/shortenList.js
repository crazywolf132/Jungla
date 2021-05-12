import core from './core';
import hasKey from './hasKey';

export default (data, field) => {
	return data
		.map((d, index) => {
			if (hasKey(field, 'sizeLimit') && Array.isArray(field.sizeLimit)) {
				const [start, finish] = field.sizeLimit;

				if (
					index + 1 >= start &&
					index + 1 <= (finish ?? data.length)
				) {
					return core(field.fields, d);
				} else return null;
			}

			if (index + 1 <= (field.sizeLimit ?? data.length))
				return core(field.fields, d);
			else return null;
		})
		.filter((i) => i); // Do this to remove empty objects...
};
