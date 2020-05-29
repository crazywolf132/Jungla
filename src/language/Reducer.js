import { log } from './utils';
import * as _ from 'lodash';

export default class Reducer {
	constructor(ast) {
		this.ast = ast;
		this.starter = {
			type: 'Query',
			fields: []
		};
		this.result = Array.isArray(this.ast) ? this.start() : this.ast;
	}

	start() {
		let res = _.clone(this.starter);
		this.ast.forEach(part => {
			// We are going to get the type... double check that it is a `Query` Type.
			if (part.type === 'Query') {
				part.fields.map(f => res.fields.push(f));
			}
		});

		return res;
	}
}
