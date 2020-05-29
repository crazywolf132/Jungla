import Template from '../../../data/test.json';
import _ from 'lodash';

const log = console.log;

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const introspection = (data) => {
	let current = {};

	let keys = Object.keys(data);

	keys.map((key, index) => {
		let value = data[key];

		if (value instanceof Object) {
			current[key] = introspection(data[key]);
		} else {
			current[key] = typeof value;
		}
	});

	return current;
};

const generateDeepObject = (key, data, fieldList, ObjectList) => {
	let localObj = {
		kind: 'OBJECT',
		name: key,
		description: null,
		fields: [],
		inputFields: null,
		interfaces: [],
		enumValues: null,
		possibleTypes: null,
	};

	Object.keys(data).map((field) => {
		if (data[field] instanceof Object) {
			generateDeepObject(field, data[field], fieldList, ObjectList);
		} else {
			localObj.fields.push({
				name: field,
				description: null,
				args: [],
				type: {
					kind: 'JUNGLA',
					name: capitalize(data[field]),
					ofType: null,
				},
			});
		}
	});

	ObjectList.push(localObj);
};

const generateIntrospectionOBJ = (data) => {
	let result = introspection(data);

	let final = Template;

	let indexPosition = final.__schema.types.indexOf(
		final['__schema'].types.filter((type) => type.name === 'Query')[0]
	);

	let fieldList = final.__schema.types[indexPosition].fields;

	log(Object.keys(result));

	Object.keys(result).map((key) => {
		if (result[key] instanceof Object) {
			generateDeepObject(
				key,
				result[key],
				fieldList,
				final.__schema.types
			);
		} else {
			fieldList.push({
				name: key,
				description: null,
				args: [],
				type: {
					kind: 'JUNGLA',
					name: capitalize(result[key]),
					ofType: null,
				},
			});
		}
	});

	final.__schema.types[indexPosition].fields = fieldList;

	return final;
};

export default generateIntrospectionOBJ;
