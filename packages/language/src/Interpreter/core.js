import hasKey from './hasKey';
import * as handlers from './handlers';
export default (tree, data) => {
	let obj = {};
	if (Object.keys(tree).length === 0) return data; // This means the tree is at the end...

	Object.keys(tree).forEach((key) => {
		const val = tree[key];
		if (!val.isVar) {
			// This is so then we don't print out vars...

			switch (true) {
				case hasKey(val, 'isList'): // We are dealing with a list of data objects
					let listResult = handlers.handleList(key, val, data[key]);
					obj[listResult.name] = listResult.result;
					break;
				case hasKey(val, 'fields'): // This means we are dealing with a data object
					let childrenResult = handlers.handleChildren(
						key,
						val,
						data[key] ?? data
					);
					obj[childrenResult.name] = childrenResult.result;
					break;
				case hasKey(val, 'RequiredType'): // This means we will only do this value, if their types match
					let requiredResult = handlers.handleRequiredType(
						key,
						val,
						data[key]
					);
					obj[requiredResult.name] = requiredResult.result;
					break;
				case hasKey(val, 'value'): // This means that we have been given a value to use...
					let valueResult = handlers.handleValue(key, val, data);
					obj[valueResult.name] = valueResult.result;
					break;
				case hasKey(val, 'ifelse'): // This means we are dealing with a control-flow statement
					let ifelseResult = handlers.handleControlFlow(
						key,
						val,
						data
					);
					obj[ifelseResult.name] = ifelseResult.result;
					break;
				case hasKey(val, 'toConvert'): // This means we are dealing with converting the values to something else.
					let convertResult = handlers.handleConvertType(
						key,
						val,
						data[key] ?? data
					);
					obj[convertResult.name] = convertResult.result;
					break;
				case key === 'fields': // This means we are already inside the data-object
					// I don't even remember what this part does.
					let basicResult = handlers.handleFields(key, val, data);
					obj = basicResult.result;
					break;
				default:
					// This is just a basic list of the fields we want... or a single field.
					let defaultResult = handlers.handleDefault(key, val, data);
					if (
						Array.isArray(defaultResult.result) &&
						defaultResult.name == undefined
					) {
						// This means that we dealt with a list rather than a single item...
						// This list should be formatted to contain { result, name } objects... so we will just link
						// them to the obj

						defaultResult.result.forEach((child) => {
							// console.log({ child });
							obj[defaultResult.name] = child;
						});
					} else {
						if (
							defaultResult.name !== null &&
							defaultResult.result !== null
						)
							obj[defaultResult.name] = defaultResult.result;
					}
			}
		}
	});

	return obj;
};
