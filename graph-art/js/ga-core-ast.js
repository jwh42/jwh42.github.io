define("ga-core-ast",["require","exports"],(function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0})})),define("ga-core-ast",["require","exports"],(function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0})})),define("ga-core-ast",["require","exports","ga-core-utils"],(function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r{}t.AstNode=r;t.Binary=class extends r{constructor(e,t){super(),this.lhs=e,this.rhs=t,s.throwIfNull(e,"lhs"),s.throwIfNull(t,"rhs")}accept(e){e.visitBinary(this)}};t.Negate=class extends r{constructor(e){super(),this.value=e,s.throwIfNull(e,"value")}get(e){return-this.value.get(e)}accept(e){e.visitNegate(this)}};t.Constant=class extends r{constructor(e){super(),this.value=e}get(){return this.value}accept(e){e.visitConstant(this)}};t.VariableRef=class extends r{constructor(e){super(),this.name=e,s.throwIfEmpty(e,"name")}get(e){return s.throwIfNull(e,"refs"),e.getVariableValue(this.name)}accept(e){e.visitVariableRef(this)}};t.FunctionRef=class extends r{constructor(e,t){super(),this.name=e,this.args=t,s.throwIfEmpty(e,"name"),s.throwIfNull(t,"args")}accept(e){e.visitFunctionRef(this)}get(e){return s.throwIfNull(e,"refs"),e.getFunctionValue(this.name,this.args)}}})),define("ga-core-ast",["require","exports"],(function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class s extends Error{constructor(e,t,s){super(s||"Syntax error"),this.position=e,this.length=null===t?0:"string"==typeof t?t.length:t}}t.AstParseError=s})),define("ga-core-ast",["require","exports"],(function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0})})),define("ga-core-ast",["require","exports","ga-core-utils","ga-core-ast"],(function(e,t,s,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.TokenReader=class{constructor(e,t,r){this._index=0,this._position=0,s.throwIfNull(e,"tokenizer"),s.throwIfNull(t,"ignore"),s.throwIfNull(r,"input"),this._ignore=t,this._tokens=r.match(e),this._skipIgnorableTokens()}get position(){return this._position}peek(){return this._index>=this._tokens.length?null:this._tokens[this._index]}read(){const e=this.peek();return null!=e&&(this._index++,this._position+=e.length,this._skipIgnorableTokens()),e}skip(e){const t=this._position,s=this.read();if(")"!=s)throw new r.AstParseError(t,s)}_skipIgnorableTokens(){let e=null;for(;this._index<this._tokens.length&&this._ignore.test(e=this._tokens[this._index]);)this._index++,this._position+=e.length}}})),define("ga-core-ast",["require","exports","ga-core-utils","ga-core-ast","ga-core-ast","ga-core-ast"],(function(e,t,s,r,i,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class o{constructor(e,t){this._tokenReader=e,this._refValidator=t,this._regexVarRef=/^[_a-zA-Z][_a-zA-Z0-9]*$/,this._regexNumber=/^([0-9]*\.[0-9]+)$|^([0-9]+)$/,this._regexOperator=/^[\+\-\*\/]$/,this._parseStack=new Array,this._positionStack=new Array,s.throwIfNull(e,"tokenReader"),s.throwIfNull(t,"refValidator")}static createTokenReader(e){return new n.TokenReader(/([0-9]*\.[0-9]+)|([0-9]+)|[_a-zA-Z][_a-zA-Z0-9]*|\s+|./g,/^\s+$/,e)}static parseString(e,t){const s=o.createTokenReader(e);return new o(s,t)._parseExpression([])}_parseExpression(e){const t=this._tokenReader,s=this._parseStack.length;for(;;){const n=t.peek(),o=t.position;if(null==n||e.indexOf(n)>=0)return this._finishExpression(s,o,n);if(t.read(),"("==n){const e=this._parseExpression([")"]);t.skip(")"),this._pushSymbol(o,e)}else if(this._regexOperator.test(n))this._pushSymbol(o,n);else if(this._regexNumber.test(n))this._pushSymbol(o,new r.Constant(parseFloat(n)));else{if(!this._regexVarRef.test(n))throw new i.AstParseError(o,n);"("==t.peek()?this._handleFunctionRef(o,n):this._handleVariableRef(o,n)}for(;this._tryReduceBin(s,a,"+","*","/")||this._tryReduceBin(s,h,"-","*","/")||this._tryReduceBin(s,c,"*","\0","\0")||this._tryReduceBin(s,u,"/","\0","\0")||this._tryReduceUnary(s,r.Negate,"-"););}}_finishExpression(e,t,s){const n=this._positionStack,o=this._parseStack;if(o.length==e)throw new i.AstParseError(t,s);let a=o.length-1;if(a!=e)throw o[a]instanceof r.AstNode&&o.length>=2&&a--,this._errorBadExpr(a);if(!(o[a]instanceof r.AstNode))throw this._errorBadExpr(a);return n.pop(),o.pop()}_errorBadExpr(e){const t=this._positionStack,s=t[e];let r=e+1<t.length?t[e+1]:this._tokenReader.position;return new i.AstParseError(s,r-s)}_handleFunctionRef(e,t){const s=[],n=this._tokenReader;do{n.read(),s.push(this._parseExpression([",",")"]))}while(","==n.peek());n.skip(")");const o=this._refValidator.validateFunctionRef(t,s.length);if(o)throw new i.AstParseError(e,t,o);this._pushSymbol(e,new r.FunctionRef(t,s))}_handleVariableRef(e,t){const s=this._refValidator.validateVariableRef(t);if(s)throw new i.AstParseError(e,t,s);this._pushSymbol(e,new r.VariableRef(t))}_tryReduceUnary(e,t,s){const i=this._positionStack,n=this._parseStack,o=n.length;if(o-e>=2&&n[o-1]instanceof r.AstNode&&n[o-2]==s){i.pop();const e=i.pop(),s=n.pop();n.pop();return this._pushSymbol(e,new t(s)),!0}return!1}_tryReduceBin(e,t,s,i,n){const o=this._tokenReader.peek(),a=this._positionStack,h=this._parseStack,c=h.length;if(c-e>=3&&h[c-1]instanceof r.AstNode&&h[c-2]==s&&h[c-3]instanceof r.AstNode&&o!=i&&o!=n){a.pop(),a.pop();const e=a.pop(),s=h.pop(),r=(h.pop(),h.pop());return this._pushSymbol(e,new t(r,s)),!0}return!1}_pushSymbol(e,t){this._parseStack.push(t),this._positionStack.push(e)}}t.AstParser=o;class a extends r.Binary{constructor(){super(...arguments),this.operator="+"}get(e){return this.lhs.get(e)+this.rhs.get(e)}}class h extends r.Binary{constructor(){super(...arguments),this.operator="-"}get(e){return this.lhs.get(e)-this.rhs.get(e)}}class c extends r.Binary{constructor(){super(...arguments),this.operator="*"}get(e){return this.lhs.get(e)*this.rhs.get(e)}}class u extends r.Binary{constructor(){super(...arguments),this.operator="/"}get(e){return this.lhs.get(e)/this.rhs.get(e)}}})),define("ga-core-ast",["require","exports"],(function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class s{constructor(){this._vars=new Set}static enumerate(e){const t=new s;return e.accept(t),t._vars}visitConstant(){}visitFunctionRef(e){for(let t=0,s=e.args.length;t<s;t++)e.args[t].accept(this)}visitNegate(e){e.value.accept(this)}visitBinary(e){e.lhs.accept(this),e.rhs.accept(this)}visitVariableRef(e){this._vars.add(e.name)}}t.VariableRefEnumerator=s}));