import Interpreter from './Interpreter';
import Parser from './Parser';
import TaggedTemplateVisitor, { traverse } from './Visitor';
import { log } from './utils';

export default function (format, data) {
	const parsed = new Parser(format).parseQuery();
	const query = traverse(parsed, new TaggedTemplateVisitor(null, null));
	const interpreted = new Interpreter(query, data);
	return interpreted.result;
}

export function generateTree(format) {
	const parsed = new Parser(format).parseQuery();
	const query = traverse(parsed, new TaggedTemplateVisitor(null, null));
	return query;
}

export { Parser, traverse, log };
