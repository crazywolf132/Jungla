import hasKey from './hasKey';

export default (field, data) => {
	if (Array.isArray(data) && hasKey(field, 'sizeLimit')) {
		if (Array.isArray(field.sizeLimit)) {
			let [start, finish] = field.sizeLimit;
			if (String(finish) === '...') {
				finish = data.length + 1;
			}
			return data.slice(start - 1, finish - 1);
		} else {
			final = data.slice(0, field.sizeLimit);
		}
	}
	return data;
};
