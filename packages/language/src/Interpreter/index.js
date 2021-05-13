import _ from 'lodash';
import Core from './core';
import { log } from '../utils';

// To remove all cases of empty obj's
const dive = (obj) => {
	const newObj = {};

	Object.keys(obj).forEach((key) => {
		const value = obj[key];

		if (typeof value === 'object' && Object.keys(value).length >= 1) {
			const deepDiveResult = dive(value) ?? {};
			if (Object.keys(deepDiveResult).length >= 1) {
				// This means that there are valid children here...
				newObj[key] = deepDiveResult;
			}
		} else if (value !== null && value !== undefined) {
			// We are going to assume that this is some form of value... so we will
			// add it to the list
			newObj[key] = value;
		}
	});
};

export default class Interpreter {
	constructor(ast, data) {
		this.ast = ast;
		this.data = data;

		this.result = !Array.isArray(this.data)
			? Core(this.ast, this.data)
			: this.data
					.map((d) => Core(this.ast, d))
					.filter((i) => Object.keys(i).length >= 1)
					.map(dive)
					.filter((i) => i);
	}
}
