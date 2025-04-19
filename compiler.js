import {lexer} from './lexer.js';
import {parser} from './parser.js';
import {runner} from './runner.js'

export function compiler(input) { 
    const token = lexer(input);
    console.table(token);
    const ast = parser(token);
    console.dir(ast);
    runner(ast);
}