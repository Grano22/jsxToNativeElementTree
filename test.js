const React = require("react");
const fs = require("fs");
const bc = require("@babel/core");

class NativeDOMConverter {
  constructor() {
    
  }

  allowedTags = [

  ];

  uniqueSeed = 0;

  toNativeJSLine(reactContext, seed=0) {
      let outputJSCode = "", varName = "rel"+this.uniqueSeed;
      try {
          if(typeof reactContext.type==="symbol" && Symbol.keyFor(reactContext.type)=="react.fragment") {
            outputJSCode = `let ${varName} = document.createDocumentFragment();`;
          } else if(typeof reactContext.type==="object") {

          } else {
            outputJSCode = `let ${varName} = document.createElement("${reactContext.type}");`;
            for(let propName in reactContext.props) {
                if(propName.indexOf("on")==0) {
                    let propNamePrep = propName.toLowerCase().replace("on", "");
                    outputJSCode += `${varName}.addEventListener("${propNamePrep}", ${reactContext.props[propName]});`;
                } else if(propName!="children") {
                    outputJSCode += `${varName}.setAttribute("${propName}", "${reactContext.props[propName]}");`;
                }
            }
          }
          return { outputCode:outputJSCode, varName:varName };
      } catch(err) {
          console.error(err);
      }
  }

  toNativeJS(inputReactOutput, pvarName="", partialCode="") {
      let outputJSCode = "";
      if(pvarName==="") this.uniqueSeed = 0;
      try {
          if(Array.isArray(inputReactOutput)) {
              for(let reactContext of inputReactOutput) {
                  let { outputCode, varName } = this.toNativeJSLine(reactContext);
                  outputJSCode += outputCode;
                  outputJSCode += `${pvarName}.appendChild(${varName});`;
                  this.uniqueSeed += 1;
                  if(typeof reactContext.props.children=="object") {
                      outputJSCode += this.toNativeJS(reactContext.props.children, varName);
                      //outputJSCode += `${pvarName}.appendChild(${varName});`;
                      
                  } else if(typeof reactContext.props.children=="string") {
                      outputJSCode += `${varName}.appendChild(document.createTextNode("${reactContext.props.children}"));`;
                  }

              }
          } else if(typeof inputReactOutput=="object") {
              let { outputCode, varName } = this.toNativeJSLine(inputReactOutput);
              outputJSCode += outputCode;
              this.uniqueSeed += 1;
              if(pvarName!="") outputJSCode += `${pvarName}.appendChild(${varName});`;
              if(typeof inputReactOutput.props.children=="object") {
                  outputJSCode += this.toNativeJS(inputReactOutput.props.children, varName);
              } else if(typeof inputReactOutput.props.children=="string") {
                  outputJSCode += `${varName}.appendChild(document.createTextNode("${inputReactOutput.props.children}"));`;
              }
          } else throw "";
          return outputJSCode;
      } catch(err) {
          console.error(err);
      }
  }
}

let ndc = new NativeDOMConverter();

fs.readFile("./parsers.jsx", 'utf-8', (err, res)=>{
    try {
      if(err) throw err;
      //console.log(res);
      bc.transform(res, {
        plugins: ["@babel/plugin-transform-react-jsx"] //./plugin-transform-react-jsx-nativeElement
      }, (err, resp)=>{
        //console.log(resp.code);
        //let sp = eval(resp.code);
        //console.log(sp);
        let iop = eval(resp.code);
        let JScode = ndc.toNativeJS(iop);
        console.log(JScode);
      });
    } catch(errorNode) {
      console.log(err);
    }
});

/*let fapo = bc.transform("<><div><span onClick={()=>null}></span></div></>", {
  plugins: ["@babel/plugin-transform-react-jsx"] //./plugin-transform-react-jsx-nativeElement
}, (err, res)=>{
    //console.log(res.code);
    //console.log(res.map);
    let iop = eval(res.code);
    //console.log(iop);
    let JScode = NativeDOMConverter.toNativeJS(iop);
  console.log(JScode);
});
*/


//@babel/plugin-syntax-jsx

//console.log(fapo);