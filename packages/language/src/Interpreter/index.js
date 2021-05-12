import _ from 'lodash';
import Core from './core';
import { log } from '../utils';

export default class Interpreter {
	constructor(ast, data) {
		this.ast = ast;
		this.data = data;

		this.result = !Array.isArray(this.data)
			? Core(this.ast, this.data)
			: this.data
					.map((d) => Core(this.ast, d))
					.filter((i) => Object.keys(i).length >= 1);
	}
}
