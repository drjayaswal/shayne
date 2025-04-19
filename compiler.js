import {lexer} from './lexer.js';
import {parser} from './parser.js';
import keywords from './Keywords.js';
import operators from './Operators.js';
import delimiters from './Delimiters.js';
import dataTypes from './DataTypes.js';

export function compiler(input) { 
    const token = lexer(input);
    console.table(token);
    const ast = parser(token);
    console.dir(ast);
}