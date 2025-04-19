import keywords from './Keywords.js';

const determineType = (expression) => {
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
const fetchIdenttifiers = (tokens) => {
    const identifiers = [];
    for (const token of tokens) {
        if (token.type === "identifier" && !identifiers.includes(token.value)) {
            identifiers.push(token.value);
        }
    }
    return identifiers;
}
const identifiers = {};
export const parser = (tokens) => {
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
                type: "Declared",
                kind: token.value === "anc" ? "Anchor" : "Flux",
                return: undefined,
                dType: undefined,
                name: variableName,
                value: undefined
            };

            identifiers[variableName] = token.value;

            if (tokens.length > 0 && tokens[0].type === "operator" && tokens[0].value === "=") {
                declaration.type = "Declared & Assigned";
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
                const existingDeclared = ast.body.find(
                    (node) => ((node.type === "Declared & Assigned") && node.value == undefined)
                );
                if(existingDeclared){
                    existingDeclared.value = token.value;
                }else{
                    throw new Error(`Anchor Pulse '${token.value}' cannot be reassigned`);
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


                const existingDeclared = ast.body.find(
                    (node) => (node.type === "Declared" || node.type === "Declared & Assigned") && node.name === variableName
                );

                if (existingDeclared) {
                    existingDeclared.type = "Declared & Assigned"
                    existingDeclared.value = typeInfo.value;
                    existingDeclared.dType = typeInfo.type;
                } else {
                    throw new Error(`Missing Nature of Pulse '${variableName}'`);
                }
            }
        }

        // evaluate
        if (token.type === "keyword" && token.value === "evaluate") {
            let statement = {
                type: "Labeled",
                kind: "Label",
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
                    throw new Error("Missing closing bracket ']' for evaluate statement");
                }
            } else {
                throw new Error("Missing opening bracket '[' for evaluate statement");
            }
            const typeInfo = determineType(expression);

            statement.dType = typeInfo.type;
            statement.return = expression

            const operands = expression.split(/[\+\-\*\/]/)
            const operators = expression.match(/[+\-*()]/g)
            let exp = ''
            let i = 0
            let j = 0
            if(!operators && operands.length == 1){
                if(operands[i] != Number(operands[i])){
                    const expressionValue = ast.body.find(
                        (node) => (node.name === operands[i])
                    )
                    if(expressionValue){
                        exp += expressionValue.value
                    }else{
                        throw new Error(`Pulse '${operands[i]}' is undiscoverable`)
                    }
                }else{
                    exp += operands[i++]
                }
                try {
                    const evaluation = eval(exp)
                    statement.return = evaluation
                    statement.value = typeInfo.value;
                    ast.body.push(statement)
                } catch (error) {
                    throw new Error(`No expression is found in Evaluate`)
                }
            }else{
                while(i < operands.length || j < operators.length){
                    if(operands[i] != Number(operands[i])){
                        const expressionValue = ast.body.find(
                            (node) => (node.name === operands[i])
                        )
                        if(expressionValue){
                            exp += expressionValue.value
                            if(j < operators.length) exp += operators[j++]
                        }
                        i++
                    }else{
                        exp += operands[i++]
                        if(j < operators.length) exp += operators[j++]
                    }
                }
                while(i<operands.length){
                    exp+=operands[i++]
                }
                statement.return = eval(exp)
                statement.value = typeInfo.value;
                ast.body.push(statement)
            }
        }


        // message
        if (token.type === "keyword" && token.value === "message") {
            let statement = {
                type: "Message",
                kind: "Message",
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
                    throw new Error("Missing closing bracket ']' for message statement");
                }
            } else {
                throw new Error("Missing opening bracket '[' for message statement");
            }
            const typeInfo = determineType(expression);

            statement.dType = typeInfo.type;
            statement.return = expression
            statement.value = typeInfo.value;
            ast.body.push(statement)
        }
    }
    return ast;
}