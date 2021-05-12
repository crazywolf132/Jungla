import hasKey from './hasKey';
import CleanList from './cleanList';
import shortenList from './shortenList';
import meetsParams from './meetsParams';
import core from './core';
import compare from './compare';
import listLength from './listLength';

export const handleList = (key, field, data) => {
	let name = field.alias ?? key;
	let result;

	if (Array.isArray(data)) {
		result = CleanList(
			shortenList(data, field).filter((child) => {
				if (hasKey(field, 'params')) {
					// Incase we were asked to filter it.
					return meetsParams(child, field.params);
				}

				return true; // We weren't asked to filter it... so we don't care.
			})
		);
	} else {
		result = core(field.fields, data ?? {});
	}

	return { name, result };
};

export const handleConvertType = (key, field, data) => {
	let name = field.alias ?? key;
	let children = Object.values(core(field, data) ?? {}).filter((i) => i); // Just cleaning up the children

	switch (field.toConvert) {
		case 'LIST':
			return { name, result: children };
		case 'LIST_KEYS':
			return { name, result: Object.keys(children) };
		case 'COUNT':
			return { name, result: Array.isArray(data) ? data.length : 0 };
		case 'STRING':
		default:
			return { name, result: (children ?? data).join(' ') };
	}
};

export const handleChildren = (key, field, data) => {
	let name = field.alias ?? key;
	let result;
	if (
		(hasKey(field, 'params') && meetsParams(data, field.params)) ||
		!hasKey(field, 'params')
	) {
		if (hasKey(field, 'toConvert')) {
			result = handleConvertType(key, field, data).result;
		} else {
			result = core(field, data);
		}
	}

	return { name, result };
};

export const handleRequiredType = (key, field, data) => {
	let name = field.alias ?? key;
	let result =
		typeof data === field.RequiredType.value.toLowerCase() ? data : null;

	return { name, result };
};

export const handleFields = (key, field, data) => {
	return { result: core(field, data) };
};

export const handleValue = (key, field, data) => {
	let name = field.alias ?? key;
	let result = field.value;

	return { name, result };
};

export const handleControlFlow = (key, field, data) => {
	let name = field.alias ?? key;
	let result;

	if (compare(data[key], field.ifelse._comparator, field.ifelse._check)) {
		if (field.ifelse._if instanceof Object) {
			result = core(field.ifelse._if, data);
		} else {
			result = data[field.ifelse._if] ?? field.ifelse._if;
		}
	} else {
		if (field.ifelse._else instanceof Object) {
			result = core(field.ifelse._else, data);
		} else {
			result = data[field.ifelse._else] ?? field.ifelse._else;
		}
	}

	return { name, result };
};

export const handleRegularField = (key, field, data) => {
	return {
		result: field.value
			? field.value
			: field.fields
			? core(field.fields, data)
			: field,
	};
};

export const handleBasicList = (key, field, data) => {
	return {
		result: listLength(
			field,
			data
				.filter((item) =>
					hasKey(field, 'params')
						? meetsParams(item, field.params)
							? true
							: false
						: true
				)
				.filter((d) => {
					if (hasKey(field, 'fields')) {
						return core(field.fields, d);
					} else return d;
				})
		).filter((i) => i), // This will remove null results,
	};
};

export const handleCleanBasicField = (key, field, data) => {
	let final = data;
	if (hasKey(field, 'sizeLimit')) {
		final = listLength(field, final);
	}

	if (hasKey(field, 'add')) {
		final = `${final}${field.add.value}`;
	}

	return { result: final };
};

export const handleBasicField = (key, field, data) => {
	let result = undefined;
	if (Array.isArray(data)) {
		if (data.length >= 1) {
			result = handleBasicList(key, field, data).result;
		} else if (field.defaultValue !== undefined) {
			result = handleRegularField(key, field.defaultValue, data).result;
		}
	} else {
		if (data != undefined) {
			result = handleCleanBasicField(key, field, data).result;
		} else if (field.defaultValue !== undefined) {
			result = handleRegularField(key, field, data).result;
		}
	}

	return { result };
};

export const handleDefault = (key, field, data) => {
	let name;
	let result;
	// Checking to see if we are working with an array.
	if (Array.isArray(field)) {
		field.map((child) => {
			// TODO: try and send it back throught the compiler instead of copy and paste of code.
			if (hasKey(child, 'fields')) {
				let children = handleChildren(child, data[key] ?? data).result;

				if (result == undefined) {
					result = [{ name: child.alias, result: children }];
				} else {
					result = [
						...result,
						{ name: child.alias, result: children },
					];
				}
			} else {
				if (result == undefined) {
					result = [
						{
							name: child.alias,
							result: handleBasicField(
								key,
								child,
								data[key] == undefined ? null : data[key]
							).result,
						},
					];
				} else {
					result = [
						...result,
						{
							name: child.alias,
							result: handleBasicField(
								key,
								child,
								data[key] == undefined ? null : data[key]
							).result,
						},
					];
				}
			}
		});
	} else {
		if (
			(hasKey(field, 'params') && meetsParams(data, field.params)) ||
			!hasKey(field, 'params')
		) {
			name = field.alias ?? key;
			result = handleBasicField(
				key,
				field,
				data[key] == undefined ? null : data[key]
			).result;
		} else {
			name = null;
			result = null;
		}
	}

	return { name, result };
};
