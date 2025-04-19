import keywords from './Keywords.js';
import operators from './Operators.js';
import delimiters from './Delimiters.js';
import dataTypes from './DataTypes.js';
import {code} from './code.js';

export function lexer(input) {        
    const token = [];
    let cursor = 0;

    while(cursor < input.length) {
        let char = input[cursor];
        
        // Skip whitespace and newlines
        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

        // Handle words (keywords, identifiers, data types)
        if(/[a-zA-Z]/.test(char)) {
            let word = "";
            while(cursor < input.length && /[a-zA-Z]/.test(input[cursor])) {
                word += input[cursor];
                cursor++;
            }
            
            if (keywords.includes(word)) {
                token.push({ type: "keyword", value: word });
            } else if (dataTypes.includes(word)) {
                token.push({ type: "datatype", value: word });
            } else {
                token.push({ type: "identifier", value: word });
            }
            continue;
        }

        // Handle numbers
        if(/[0-9]/.test(char)) {
            let number = "";
            while(cursor < input.length && /[0-9.]/.test(input[cursor])) {
                number += input[cursor];
                cursor++;
            }
            token.push({ type: "number", value: number });
            continue;
        }

        // Handle strings
        if(char === '"' || char === "'") {
            let string = "";
            const quote = char;
            cursor++;
            while(cursor < input.length && input[cursor] !== quote) {
                string += input[cursor];
                cursor++;
            }
            cursor++; // Skip closing quote
            token.push({ type: "string", value: string });
            continue;
        }

        // Handle operators
        if(operators.includes(char)) {
            let op = char;
            if(operators.includes(char + input[cursor + 1])) {
                op += input[cursor + 1];
                cursor++;
            }
            token.push({ type: "operator", value: op });
            cursor++;
            continue;
        }

        // Handle delimiters
        if(delimiters.includes(char)) {
            token.push({ type: "delimiter", value: char });
            cursor++;
            continue;
        }

        cursor++;
    }
    
    return token;
}
