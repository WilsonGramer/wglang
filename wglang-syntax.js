const moo = require('moo')
var fs = require("fs")

let main_lexer = moo.compile({
    whitespace: /[ \t]+/,
    newline: { match: /\n/, lineBreaks: true },
    multi_line_comment: /\/{3}(?:[\s\S]*?\/{3})/,
    doc_comment: /\/{2}\:(?:[\s\S]*?\:\/{2})/,
    annotation_comment: /\/\/\-.*?$/,
    section_comment: /\/\/ \-\-\-.*?$/,
    single_line_comment: /\/\/.*?$/,
    inline_comment: /\/~.*?~\//,
    number: /\b0|[1-9][0-9]*\b/,
    string: /"(?:\\["\\]|[^\n"\\])*"/,
    opening: /\(|\{|\[|\</,
    closing: /\)|\}|\]|\>/,
    operator: /\+|\-|\*|\//,
    equals: /\=/,
    dot: /\./,
    colon: /\:/,
    comma: /\,/,
    underscore: /\_/,
    syntax: /\b(?:var|const|struct|function|async|await|return(?:s|)|if|then|else|switch|throws|try|catch|nullable|dynamic|true|false|is|not|and|or|null|void|any|override|point|define)\b/,
    type: /(?:bool|byte|char|string|int|double)/,
    type_with_value: /(?:data|list|set|dict|promise|error)/,
    attribute: { match: /@(?:json|main)/, value: x => x.substring(1) },
    identifier: { match: /[^0-9\ \!\@\#\$\%\^\&\*\(\)\+\-\=\{\}\|\[\]\\\:\"\;\'\<\>\?\,\.\/\~\`]+/, lineBreaks: true },
    unnamed_identifier: /\$[0-9]+/,
    invalid: { match: /[\$?`]/, error: true }
})

const code = fs.readFileSync("./intro.wg", "utf8")

main_lexer.reset(code)

var tokens = []

var token = main_lexer.next()
main: while (token != undefined) {
    if (token.type != "invalid") {
        tokens.push(token)
        token = main_lexer.next()
    } else {
        console.log("invalid syntax: \"" + token.text.substring(0,15) + "\"...")
        break main
    }
}

meaningfulTokens = tokens.filter((token) => {
    return token.type != "whitespace" &&
        token.type != "newline" &&
        !(token.type.includes("comment"))
})

console.log("================")
console.log("     TOKENS     ")
console.log("================")

for (const token of meaningfulTokens) console.log(`${token.line} | ${token.type} "${token.value}"`)

console.log("================")
console.log("   END TOKENS   ")
console.log("================")

////////////////

const express = require('express')
const app = express()

app.get('/', function (req, res) {
    var html =`<!DOCTYPE html><html><body><pre style="background-color: black; padding: 16px;"><code>`

    for (const token of tokens) {
        var color

        switch (token.type) {
            case "multi_line_comment": case "single_line_comment": case "inline_comment":
                color = 'gray'; break
            case "doc_comment": case "annotation_comment": case "section_comment":
                color = '#BBBBBB'; break
            case "number":
                color = '#6666FF'; break
            case "string":
                color = 'orange'; break
            case "type": case "type_with_value":
                color = 'green'; break
            case "syntax": case "attribute": case "underscore":
                color = '#FF1493'; break
            case "identifier": case "unnamed_identifier":
                color = 'yellow'; break
            default:
                color = 'lightgray'; break
        }

        html += `<div style="display: inline; color: ${color};">${token.text}</div>`
    }

    html += `</code></pre></body></html>`

    res.send(html)
})

app.listen(3000)