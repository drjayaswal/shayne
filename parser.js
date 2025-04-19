import keywords from './Keywords.js';
import operators from './Operators.js';
import delimiters from './Delimiters.js';
import dataTypes from './DataTypes.js';
import { lexer } from './lexer.js';
import { code } from './code.js';

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

    // Identifier check (variable names)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
        return {
            type: "string",
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
function fetchIdenttifiers(tokens) {
    const identifiers = [];
    for (const token of tokens) {
        if (token.type === "identifier" && !identifiers.includes(token.value)) {
            identifiers.push(token.value);
        }
    }
    return identifiers;
}
const identifiers = {};
export function parser(tokens) {
    const ast = {
        type: "Program",
        body: []
    };
    while (tokens.length > 0) {
        const token = tokens.shift();



        // dealare and assign
        if (token.type === "keyword" && (token.value === "anc" || token.value === "flx")) {
            // Check if the pulse is not defined
            if (tokens.length === 0) {
                throw new Error(`${token.value === "flx" ? "Flux" : "Anchor" } Pulse is not defined`);
            }

            // Check if the pulse is already been declared
            const variableName = tokens.shift().value;
            if (identifiers[variableName] == "anc" || identifiers[variableName] == "flx") {
                throw new Error(`${identifiers[variableName] === "anc" ? "Anchor" : "Flux"} Pulse '${variableName}' is alive`);
            }


            let declaration = {
                type: "Declaration",
                kind: token.value === "anc" ? "anchor" : "flux",
                return: undefined,
                dType: undefined,
                name: variableName,
                value: undefined
            };

            identifiers[variableName] = token.value;

            if (tokens.length > 0 && tokens[0].type === "operator" && tokens[0].value === "=") {
                declaration.type = "Declaration & Assignment";
                tokens.shift();
                let expression = '';
                while (tokens.length > 0 && !keywords.includes(tokens[0].value) && tokens[0].type !== "identifier") {
                    expression += tokens.shift().value;
                }
                const typeInfo = determineType(expression);
                declaration.dType = typeInfo.type;
                declaration.value = typeInfo.value;
            }

            ast.body.push(declaration);
        }

        // re-declare flux pulse and aborting re-declaration to anchor pulse  
        if (token.type === "identifier") {
            if (!identifiers[token.value]) {
                throw new Error(`Missing Nature of Pulse '${token.value}'`);
            }

            if (identifiers[token.value] === "anc") {
                const existingDeclaration = ast.body.find(
                    (node) => (node.type === "Declaration" || node.type === "Declaration & Assignment" && node.value == undefined)
                );
                if(existingDeclaration){
                    existingDeclaration.value = token.value;
                }else{
                    throw new Error(`Anchor Pulse cannot be reassigned`);
                }
            }

            const variableName = token.value;

            if (tokens.value === "anc") {
                throw new Error(`Pulse '${variableName}' has already been declared`);
            }

            if (tokens.length > 0 && tokens[0].type === "operator" && tokens[0].value === "=") {
                tokens.shift();
                let expression = '';
                while (tokens.length > 0 && !keywords.includes(tokens[0].value) && tokens[0].type !== "identifier") {
                    expression += tokens.shift().value;
                }
                const typeInfo = determineType(expression);


                const existingDeclaration = ast.body.find(
                    (node) => (node.type === "Declaration" || node.type === "Declaration & Assignment") && node.name === variableName
                );

                if (existingDeclaration) {
                    existingDeclaration.type = "Declaration & Assignment"
                    existingDeclaration.value = typeInfo.value;
                    existingDeclaration.dType = typeInfo.type;
                } else {
                    throw new Error(`Missing Nature of Pulse '${variableName}'`);
                }
            }
        }

        // label
        if (token.type === "keyword" && token.value === "label") {
            let statement = {
                type: "Labelation",
                kind: "label",
                return: undefined,
                dType: undefined,
                name: undefined,
                value: undefined,
            };
            let expression = '';
            if (tokens.length > 0 && tokens[0].type === "delimiter" && tokens[0].value === "[") {
                tokens.shift();
                while (tokens.length > 0 && (tokens[0].type !== "delimiter" || tokens[0].value !== "]")) {
                    expression += tokens.shift().value;
                }
                if (tokens.length > 0 && tokens[0].type === "delimiter" && tokens[0].value === "]") {
                    tokens.shift();
                } else {
                    throw new Error("Missing closing bracket ']' for label statement");
                }
            } else {
                throw new Error("Missing opening bracket '[' for label statement");
            }
            const typeInfo = determineType(expression);

            statement.dType = typeInfo.type;
            statement.value = typeInfo.value;
            statement.return = 'expression'
        }
    }
    return ast;
}