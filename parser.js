import keywords from './Keywords.js';
import operators from './Operators.js';
import delimiters from './Delimiters.js';
import dataTypes from './DataTypes.js';
import { lexer } from './lexer.js';

function determineType(expression) {
    const value = expression.trim();
    
    // Boolean check
    if (value === "True" || value === "False") {
        return {
            type: "boolean",
            value: value === "True"
        };
    }
    
    // Number check
    if (!isNaN(value) && value !== '') {
        return {
            type: "number",
            value: Number(value)
        };
    }
    
    // String with quotes check
    if ((value.startsWith("'") && value.endsWith("'")) || 
        (value.startsWith('"') && value.endsWith('"'))) {
        return {
            type: "string",
            value: value.slice(1, -1) // Remove quotes
        };
    }
    
    // Identifier check (variable names)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
        return {
            type: "identifier",
            value: value
        };
    }
    
    // Expression check (contains operators)
    if (value.match(/[\+\-\*\/]/)) {
        return {
            type: "expression",
            value: value
        };
    }
    
    // Default fallback
    return {
        type: "unknown",
        value: value
    };
}

export function parser(tokens) {
    const ast = {
        type: "Program",
        body: []
    };
    const identifiers = [];
    while (tokens.length > 0) {
        const token = tokens.shift();

        if(token.type === "keyword" && (token.value === "anc" || token.value === "flx")) {
            if (tokens.length === 0) {
                throw new Error("Expected identifier after keyword");
            }

            let declaration = {
                type: "Declaration",
                kind: token.value === "anc" ? "anchor" : "flux",
                return: undefined,
                data: undefined,
                name: tokens.shift().value,
                value: undefined
            };


            if (tokens.length > 0 && tokens[0].type === "operator" && tokens[0].value === "=") {
                declaration.type = "Declaration & Assignment";
                tokens.shift();
                let expression = '';
                while (tokens.length > 0 && !keywords.includes(tokens[0].value)) {
                    expression += tokens.shift().value;
                }
                const typeInfo = determineType(expression);
                declaration.data = typeInfo.type;
                declaration.value = typeInfo.value;
            }
            
            ast.body.push(declaration);
        }

        if(token.type === "keyword" && token.value === "label") {
            let statement = {
                type: "Labelation",
                kind: "label",
                return: undefined,
                data: undefined,
                name: undefined,
                value: undefined,
            };
            let expression = '';
            while (tokens.length > 0 && !keywords.includes(tokens[0].value)) {
                expression += tokens.shift().value;
            }
            const typeInfo = determineType(expression);
            statement.value = typeInfo.value
            statement.data = typeInfo.type;
            statement.return = expression.trim();             
            ast.body.push(statement);
        }

    }
    return ast;
}
