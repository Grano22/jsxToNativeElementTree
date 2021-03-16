const jsxParse = require('html-react-parser');
const fs = require("fs");
/*var acorn = require("acorn");
var jsx = require("acorn-jsx");
let parsed = acorn.Parser.extend(jsx()).parse(`<div id="me"></div>`);
console.log(parsed.body[0].expression);*/

fs.readFile('./parser.jsx', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    //console.log(data);
});

let parsedContext = jsxParse('<div id="me"><span>jpd</span><p>Sm</p></div>');
console.log(parsedContext);

class NativeDOMConverter {
    allowedTags = [

    ];

    static toNativeJSLine(reactContext, seed=0) {
        let outputJSCode = "", varName = "rel"+seed;
        try {
            //Symbol(react.element)  reactContext["$$typeof"] 
            outputJSCode = `let ${varName} = document.createElement("${reactContext.type}");`;
            for(let propName in reactContext.props) {
                if(propName!="children") {
                    outputJSCode += `${varName}.setAttribute("${propName}", "${reactContext.props[propName]}");`;
                }
            }
            return { outputCode:outputJSCode, varName:varName };
        } catch(err) {
            console.error(err);
        }
    }

    static toNativeJS(inputReactOutput, pvarName="", gseed = 0, partialCode="") {
        let outputJSCode = "";
        try {
            if(Array.isArray(inputReactOutput)) {
                for(let reactContext of inputReactOutput) {
                    let { outputCode, varName } = NativeDOMConverter.toNativeJSLine(reactContext, gseed);
                    outputJSCode += outputCode;
                    outputJSCode += `${pvarName}.appendChild(${varName});`;
                    if(typeof reactContext.props.children=="object") {
                        outputJSCode += NativeDOMConverter.toNativeJS(reactContext.props.children, varName, gseed);
                        outputJSCode += `${pvarName}.appendChild(${varName});`;
                        ++gseed;
                    } else if(typeof reactContext.props.children!=="string") {
                        outputJSCode += `${varName}.appendChild(document.createTextNode("${reactContext.props.children}"))`;
                    }
                }
            } else if(typeof inputReactOutput=="object") {
                let { outputCode, varName } = NativeDOMConverter.toNativeJSLine(inputReactOutput, gseed);
                outputJSCode += outputCode;
                if(typeof inputReactOutput.props.children=="object") {
                    outputJSCode += NativeDOMConverter.toNativeJS(inputReactOutput.props.children, varName, ++gseed);
                } else if(typeof inputReactOutput.props.children!=="string") {
                    outputJSCode += `${varName}.appendChild(document.createTextNode("${inputReactOutput.props.children}"))`;
                }
            } else throw "";
            return outputJSCode;
        } catch(err) {
            console.error(err);
        }
    }
}

let JScode = NativeDOMConverter.toNativeJS(parsedContext);
//let JScode = NativeDOMConverter.toNativeJSLine(parsedContext);
console.log(JScode);
console.log(jsxParse('<Fragment><div id="me" onClick={()=>null}>me<>Fragment</></div></Fragment>').props);