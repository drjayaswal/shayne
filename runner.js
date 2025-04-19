export const runner = (ast) => {
    let i = 0;
    while(i < ast.body.length){
        const output = ast.body[i].return
        if(output != NaN && output != undefined){
            console.log(output)
        }
        i++
    }
}