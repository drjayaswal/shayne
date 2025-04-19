import {code} from './code.js';
import {compiler} from './compiler.js';

function init() {
    const input = code;
    compiler(input);
}
init();