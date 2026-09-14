var Vt=Object.defineProperty;var Jt=Object.getOwnPropertyDescriptor;var l=(n,t,e,s)=>{for(var i=s>1?void 0:s?Jt(t,e):t,r=n.length-1,a;r>=0;r--)(a=n[r])&&(i=(s?a(t,e,i):a(i))||i);return s&&i&&Vt(t,e,i),i};var B=globalThis,Y=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,tt=Symbol(),ut=new WeakMap,U=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==tt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(Y&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ut.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ut.set(e,t))}return t}toString(){return this.cssText}},mt=n=>new U(typeof n=="string"?n:n+"",void 0,tt),N=(n,...t)=>{let e=n.length===1?n[0]:t.reduce((s,i,r)=>s+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+n[r+1],n[0]);return new U(e,n,tt)},gt=(n,t)=>{if(Y)n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=B.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,n.appendChild(s)}},et=Y?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return mt(e)})(n):n;var{is:Gt,defineProperty:Zt,getOwnPropertyDescriptor:Qt,getOwnPropertyNames:Xt,getOwnPropertySymbols:te,getPrototypeOf:ee}=Object,V=globalThis,ft=V.trustedTypes,se=ft?ft.emptyScript:"",ne=V.reactiveElementPolyfillSupport,D=(n,t)=>n,L={toAttribute(n,t){switch(t){case Boolean:n=n?se:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},J=(n,t)=>!Gt(n,t),_t={attribute:!0,type:String,converter:L,reflect:!1,useDefault:!1,hasChanged:J};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;var x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=_t){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Zt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:r}=Qt(this.prototype,t)??{get(){return this[e]},set(a){this[e]=a}};return{get:i,set(a){let p=i?.call(this);r?.call(this,a),this.requestUpdate(t,p,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??_t}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;let t=ee(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){let e=this.properties,s=[...Xt(e),...te(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(et(i))}else t!==void 0&&e.push(et(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return gt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:L).toAttribute(e,s.type);this._$Em=t,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let r=s.getPropertyOptions(i),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:L;this._$Em=i;let p=a.fromAttribute(e,r.type);this[i]=p??this._$Ej?.get(i)??p,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){if(t!==void 0){let a=this.constructor;if(i===!1&&(r=this[t]),s??=a.getPropertyOptions(t),!((s.hasChanged??J)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},a){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),r!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,r]of s){let{wrapped:a}=r,p=this[i];a!==!0||this._$AL.has(i)||p===void 0||this.C(i,void 0,r,p)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[D("elementProperties")]=new Map,x[D("finalized")]=new Map,ne?.({ReactiveElement:x}),(V.reactiveElementVersions??=[]).push("2.1.2");var lt=globalThis,yt=n=>n,G=lt.trustedTypes,bt=G?G.createPolicy("lit-html",{createHTML:n=>n}):void 0,St="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,Et="?"+E,ie=`<${Et}>`,H=document,z=()=>H.createComment(""),F=n=>n===null||typeof n!="object"&&typeof n!="function",ct=Array.isArray,re=n=>ct(n)||typeof n?.[Symbol.iterator]=="function",st=`[ 	
\f\r]`,j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$t=/-->/g,vt=/>/g,P=RegExp(`>|${st}(?:([^\\s"'>=/]+)(${st}*=${st}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),At=/'/g,xt=/"/g,Mt=/^(?:script|style|textarea|title)$/i,pt=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),o=pt(1),ye=pt(2),be=pt(3),I=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),wt=new WeakMap,k=H.createTreeWalker(H,129);function Ct(n,t){if(!ct(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return bt!==void 0?bt.createHTML(t):t}var ae=(n,t)=>{let e=n.length-1,s=[],i,r=t===2?"<svg>":t===3?"<math>":"",a=j;for(let p=0;p<e;p++){let c=n[p],g,_,h=-1,A=0;for(;A<c.length&&(a.lastIndex=A,_=a.exec(c),_!==null);)A=a.lastIndex,a===j?_[1]==="!--"?a=$t:_[1]!==void 0?a=vt:_[2]!==void 0?(Mt.test(_[2])&&(i=RegExp("</"+_[2],"g")),a=P):_[3]!==void 0&&(a=P):a===P?_[0]===">"?(a=i??j,h=-1):_[1]===void 0?h=-2:(h=a.lastIndex-_[2].length,g=_[1],a=_[3]===void 0?P:_[3]==='"'?xt:At):a===xt||a===At?a=P:a===$t||a===vt?a=j:(a=P,i=void 0);let S=a===P&&n[p+1].startsWith("/>")?" ":"";r+=a===j?c+ie:h>=0?(s.push(g),c.slice(0,h)+St+c.slice(h)+E+S):c+E+(h===-2?p:S)}return[Ct(n,r+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},W=class n{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,a=0,p=t.length-1,c=this.parts,[g,_]=ae(t,e);if(this.el=n.createElement(g,s),k.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=k.nextNode())!==null&&c.length<p;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(St)){let A=_[a++],S=i.getAttribute(h).split(E),K=/([.?@])?(.*)/.exec(A);c.push({type:1,index:r,name:K[2],strings:S,ctor:K[1]==="."?it:K[1]==="?"?rt:K[1]==="@"?at:O}),i.removeAttribute(h)}else h.startsWith(E)&&(c.push({type:6,index:r}),i.removeAttribute(h));if(Mt.test(i.tagName)){let h=i.textContent.split(E),A=h.length-1;if(A>0){i.textContent=G?G.emptyScript:"";for(let S=0;S<A;S++)i.append(h[S],z()),k.nextNode(),c.push({type:2,index:++r});i.append(h[A],z())}}}else if(i.nodeType===8)if(i.data===Et)c.push({type:2,index:r});else{let h=-1;for(;(h=i.data.indexOf(E,h+1))!==-1;)c.push({type:7,index:r}),h+=E.length-1}r++}}static createElement(t,e){let s=H.createElement("template");return s.innerHTML=t,s}};function T(n,t,e=n,s){if(t===I)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,r=F(t)?void 0:t._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(n),i._$AT(n,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=T(n,i._$AS(n,t.values),i,s)),t}var nt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??H).importNode(e,!0);k.currentNode=i;let r=k.nextNode(),a=0,p=0,c=s[0];for(;c!==void 0;){if(a===c.index){let g;c.type===2?g=new q(r,r.nextSibling,this,t):c.type===1?g=new c.ctor(r,c.name,c.strings,this,t):c.type===6&&(g=new ot(r,this,t)),this._$AV.push(g),c=s[++p]}a!==c?.index&&(r=k.nextNode(),a++)}return k.currentNode=H,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},q=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=T(this,t,e),F(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==I&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):re(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&F(this._$AH)?this._$AA.nextSibling.data=t:this.T(H.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=W.createElement(Ct(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let r=new nt(i,this),a=r.u(this.options);r.p(e),this.T(a),this._$AH=r}}_$AC(t){let e=wt.get(t.strings);return e===void 0&&wt.set(t.strings,e=new W(t)),e}k(t){ct(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let r of t)i===e.length?e.push(s=new n(this.O(z()),this.O(z()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=yt(t).nextSibling;yt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},O=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,i){let r=this.strings,a=!1;if(r===void 0)t=T(this,t,e,0),a=!F(t)||t!==this._$AH&&t!==I,a&&(this._$AH=t);else{let p=t,c,g;for(t=r[0],c=0;c<r.length-1;c++)g=T(this,p[s+c],e,c),g===I&&(g=this._$AH[c]),a||=!F(g)||g!==this._$AH[c],g===d?t=d:t!==d&&(t+=(g??"")+r[c+1]),this._$AH[c]=g}a&&!i&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},it=class extends O{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},rt=class extends O{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},at=class extends O{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=T(this,t,e,0)??d)===I)return;let s=this._$AH,i=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==d&&(s===d||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},ot=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){T(this,t)}};var oe=lt.litHtmlPolyfillSupport;oe?.(W,q),(lt.litHtmlVersions??=[]).push("3.3.3");var Pt=(n,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let r=e?.renderBefore??null;s._$litPart$=i=new q(t.insertBefore(z(),r),r,void 0,e??{})}return i._$AI(n),i};var dt=globalThis,y=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Pt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};y._$litElement$=!0,y.finalized=!0,dt.litElementHydrateSupport?.({LitElement:y});var le=dt.litElementPolyfillSupport;le?.({LitElement:y});(dt.litElementVersions??=[]).push("4.2.2");var v=n=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(n,t)}):customElements.define(n,t)};var ce={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:J},pe=(n=ce,t,e)=>{let{kind:s,metadata:i}=e,r=globalThis.litPropertyMetadata.get(i);if(r===void 0&&globalThis.litPropertyMetadata.set(i,r=new Map),s==="setter"&&((n=Object.create(n)).wrapped=!0),r.set(e.name,n),s==="accessor"){let{name:a}=e;return{set(p){let c=t.get.call(this);t.set.call(this,p),this.requestUpdate(a,c,n,!0,p)},init(p){return p!==void 0&&this.C(a,void 0,n,p),p}}}if(s==="setter"){let{name:a}=e;return function(p){let c=this[a];t.call(this,p),this.requestUpdate(a,c,n,!0,p)}}throw Error("Unsupported decorator location: "+s)};function u(n){return(t,e)=>typeof e=="object"?pe(n,t,e):((s,i,r)=>{let a=i.hasOwnProperty(r);return i.constructor.createProperty(r,s),a?Object.getOwnPropertyDescriptor(i,r):void 0})(n,t,e)}function m(n){return u({...n,state:!0,attribute:!1})}var M=N`
  :host {
    display: block;
    padding: 16px;
    max-width: 960px;
    margin: 0 auto;
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, "Roboto", sans-serif);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0 0 16px;
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 24px 0 8px;
  }

  h3 {
    font-size: 0.95rem;
    font-weight: 500;
    margin: 16px 0 8px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .card {
    background: var(--card-background-color, var(--ha-card-background, white));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.12));
    padding: 16px 20px;
    margin-bottom: 16px;
  }

  .clickable {
    cursor: pointer;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  .row:last-child {
    border-bottom: none;
  }

  .row-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .row-title {
    font-weight: 500;
  }
  .row-subtitle {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }
  .row-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .empty {
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px 0;
  }

  form.inline {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 12px;
  }

  input,
  select {
    font: inherit;
    padding: 8px 10px;
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 8px;
    background: var(--card-background-color, white);
    color: var(--primary-text-color);
  }

  button {
    font: inherit;
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, white);
    cursor: pointer;
  }
  button:hover {
    filter: brightness(1.08);
  }
  button.secondary {
    background: transparent;
    color: var(--primary-color, #03a9f4);
    border: 1px solid var(--primary-color, #03a9f4);
  }
  button.text {
    background: transparent;
    color: var(--secondary-text-color);
    padding: 4px 8px;
  }

  .tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  .tabs button {
    background: none;
    color: var(--secondary-text-color);
    border-radius: 0;
    padding: 10px 16px;
    border-bottom: 2px solid transparent;
  }
  .tabs button.active {
    color: var(--primary-color, #03a9f4);
    border-bottom-color: var(--primary-color, #03a9f4);
    font-weight: 500;
  }

  a {
    color: var(--primary-color, #03a9f4);
  }
`;async function b(n,t){try{await t()}catch(e){let s=e instanceof Error?e.message:String(e);n.dispatchEvent(new CustomEvent("techdoc-error",{detail:{message:s},bubbles:!0,composed:!0}))}}var kt=n=>n.callWS({type:"techdoc/plant_type_list"}),Ht=n=>n.callWS({type:"techdoc/plant_list"}),It=(n,t,e)=>n.callWS({type:"techdoc/plant_create",name:t,plant_type_id:e}),Rt=n=>n.callWS({type:"techdoc/metric_catalogue"}),Tt=(n,t)=>n.callWS({type:"techdoc/inspection_list",plant_id:t}),Ot=(n,t,e,s,i)=>n.callWS({type:"techdoc/inspection_create",plant_id:t,date:e,inspection_type:s,inspector:i}),Ut=(n,t)=>n.callWS({type:"techdoc/inspection_complete",inspection_id:t}),Q=(n,t,e)=>n.callWS({type:"techdoc/finding_list",plant_id:t,status:e}),Nt=(n,t,e,s,i)=>n.callWS({type:"techdoc/finding_create",plant_id:t,description:e,date:s,priority:i}),Dt=(n,t,e,s)=>n.callWS({type:"techdoc/finding_update_status",finding_id:t,status:e,resolved_at:s}),Lt=(n,t)=>n.callWS({type:"techdoc/sensor_mapping_list",plant_id:t}),jt=(n,t,e,s,i)=>n.callWS({type:"techdoc/sensor_mapping_upsert",plant_id:t,metric_key:e,entity_id:s,unit:i}),zt=(n,t)=>n.callWS({type:"techdoc/sensor_mapping_delete",mapping_id:t}),Ft=(n,t,e)=>n.callWS({type:"techdoc/plant_metric_yearly",plant_id:t,metric_key:e}),X=(n,t,e)=>n.callWS({type:"techdoc/anomaly_list",plant_id:t,status:e}),Wt=(n,t,e)=>n.callWS({type:"techdoc/anomaly_update_status",anomaly_id:t,status:e}),qt=(n,t)=>n.callWS({type:"techdoc/document_list",plant_id:t}),Kt=(n,t)=>n.callWS({type:"techdoc/report_generate_inspection",inspection_id:t}),Bt=(n,t)=>n.callWS({type:"techdoc/report_generate_annual",year:t});async function Yt(n,t,e,s){let i=new FormData;i.append("file",e),i.append("type",s||"Sonstiges"),i.append("plant_id",String(t));let r=await fetch("/api/techdoc/documents",{method:"POST",headers:{Authorization:`Bearer ${n.auth.data.access_token}`},body:i});if(!r.ok)throw new Error(`Upload fehlgeschlagen (${r.status})`);return r.json()}var de={ok:"\u{1F7E2}",info:"\u26AA",niedrig:"\u{1F535}",mittel:"\u{1F7E1}",hoch:"\u{1F7E0}",kritisch:"\u{1F534}",due:"\u{1F7E1}",overdue:"\u{1F534}"},R=class extends y{constructor(){super(...arguments);this.status="info";this.label=""}render(){return o`
      <span class="badge ${this.status}">${de[this.status]??""} ${this.label}</span>
    `}};R.styles=N`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .ok { background: #e3f6e8; color: #1e7e34; }
    .info { background: #eef0f2; color: #5f6a72; }
    .niedrig { background: #e5f0fb; color: #1565c0; }
    .mittel { background: #fff6d9; color: #9a7d0a; }
    .hoch { background: #ffe9d6; color: #b25a00; }
    .kritisch { background: #fde1e1; color: #c62828; }
    .due { background: #fff6d9; color: #9a7d0a; }
    .overdue { background: #fde1e1; color: #c62828; }
  `,l([u()],R.prototype,"status",2),l([u()],R.prototype,"label",2),R=l([v("techdoc-status-badge")],R);function he(n){let t=new Date().toISOString().slice(0,10);return n.next_inspection&&n.next_inspection<t?o`<techdoc-status-badge status="overdue" label="Prüfung überfällig"></techdoc-status-badge>`:n.status==="kritisch"?o`<techdoc-status-badge status="kritisch" label="Kritisch"></techdoc-status-badge>`:n.status==="auffaellig"?o`<techdoc-status-badge status="hoch" label="Auffällig"></techdoc-status-badge>`:o`<techdoc-status-badge status="ok" label="OK"></techdoc-status-badge>`}var w=class extends y{constructor(){super(...arguments);this.plants=[];this.plantTypes=[];this.selectedPlantId=null}_plantTypeName(e){return this.plantTypes.find(s=>s.id===e)?.name??`Typ ${e}`}async _handleSubmit(e){e.preventDefault();let s=e.target;await b(this,async()=>{let i=s.elements.namedItem("name").value.trim(),r=s.elements.namedItem("plant_type_id").value;if(!i)throw new Error("Bitte einen Namen f\xFCr die Anlage eingeben.");if(!r)throw new Error("Bitte einen Anlagentyp ausw\xE4hlen.");await It(this.hass,i,parseInt(r,10)),s.reset(),this.dispatchEvent(new CustomEvent("plant-created",{bubbles:!0,composed:!0}))})}_select(e){this.dispatchEvent(new CustomEvent("plant-select",{detail:{id:e},bubbles:!0,composed:!0}))}render(){return o`
      <div class="card">
        <h2>Anlagen</h2>
        ${this.plants.length?o`
              ${this.plants.map(e=>o`
                  <div
                    class="row clickable"
                    @click=${()=>this._select(e.id)}
                    style=${e.id===this.selectedPlantId?"background: var(--secondary-background-color, #f4f4f4); margin: 0 -20px; padding: 10px 20px;":""}
                  >
                    <div class="row-main">
                      <span class="row-title">${e.name}</span>
                      <span class="row-subtitle">
                        ${this._plantTypeName(e.plant_type_id)}
                        ${e.next_inspection?o` · nächste Prüfung: ${e.next_inspection}`:d}
                      </span>
                    </div>
                    <div class="row-actions">${he(e)}</div>
                  </div>
                `)}
            `:o`<p class="empty">Noch keine Anlagen angelegt.</p>`}

        <h3>Anlage anlegen</h3>
        ${this.plantTypes.length?o`
              <form class="inline" @submit=${this._handleSubmit}>
                <input name="name" placeholder="Name der Anlage" required />
                <select name="plant_type_id" required>
                  ${this.plantTypes.map(e=>o`<option value=${e.id}>${e.name}</option>`)}
                </select>
                <button type="submit">Anlegen</button>
              </form>
            `:o`<p class="empty">
              Keine Anlagentypen geladen — Integration neu laden oder Home-Assistant-Protokoll
              nach "techdoc" durchsuchen.
            </p>`}
      </div>
    `}};w.styles=M,l([u({attribute:!1})],w.prototype,"hass",2),l([u({attribute:!1})],w.prototype,"plants",2),l([u({attribute:!1})],w.prototype,"plantTypes",2),l([u({type:Number})],w.prototype,"selectedPlantId",2),w=l([v("techdoc-plant-list")],w);function ht(n){n.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))}var $=class extends y{constructor(){super(...arguments);this.metricCatalogue={};this.plantTypeKey="";this._inspections=[];this._findings=[];this._sensorMappings=[];this._anomalies=[];this._documents=[];this._yearlyTotals=null;this._yearlyTotalsMetricKey=null}willUpdate(e){if(e.has("plant")&&this.plant){let s=e.get("plant");(!s||s.id!==this.plant.id)&&(this._yearlyTotals=null,this._yearlyTotalsMetricKey=null,this._load())}}async _load(){let e=this.plant.id,[s,i,r,a,p]=await Promise.all([Tt(this.hass,e),Q(this.hass,e),Lt(this.hass,e),X(this.hass,e,"offen"),qt(this.hass,e)]);this._inspections=s,this._findings=i,this._sensorMappings=r,this._anomalies=a,this._documents=p}async _handleCreateInspection(e){e.preventDefault();let s=e.target;await b(this,async()=>{let i=s.elements.namedItem("type").value.trim()||"sonstige",r=s.elements.namedItem("inspector").value.trim();await Ot(this.hass,this.plant.id,new Date().toISOString().slice(0,10),i,r||void 0),s.reset(),await this._load(),ht(this)})}async _handleCompleteInspection(e){await b(this,async()=>{await Ut(this.hass,e),await this._load(),ht(this)})}async _handleGenerateReport(e){await b(this,async()=>{await Kt(this.hass,e),await this._load()})}async _handleCreateFinding(e){e.preventDefault();let s=e.target;await b(this,async()=>{let i=s.elements.namedItem("description").value.trim(),r=s.elements.namedItem("priority").value;if(!i)throw new Error("Bitte eine Beschreibung f\xFCr den Mangel eingeben.");await Nt(this.hass,this.plant.id,i,new Date().toISOString().slice(0,10),r),s.reset(),await this._load(),ht(this)})}async _handleAddSensorMapping(e){e.preventDefault();let s=e.target;await b(this,async()=>{let i=s.elements.namedItem("metric_key").value.trim(),r=s.elements.namedItem("entity_id").value.trim();if(!i||!r)throw new Error("Bitte Kennzahl und Entity-ID angeben.");let a=this._currentMetricOptions().find(p=>p.key===i);await jt(this.hass,this.plant.id,i,r,a?.unit??void 0),s.reset(),await this._load()})}async _handleDeleteSensorMapping(e){await b(this,async()=>{await zt(this.hass,e),await this._load()})}async _handleShowYearly(e){await b(this,async()=>{this._yearlyTotalsMetricKey=e,this._yearlyTotals=await Ft(this.hass,this.plant.id,e)})}async _handleAnomalyStatus(e,s){await b(this,async()=>{await Wt(this.hass,e,s),await this._load()})}async _handleUpload(e){e.preventDefault();let s=e.target;await b(this,async()=>{let i=s.elements.namedItem("file"),r=s.elements.namedItem("doc_type").value,a=i.files?.[0];if(!a)throw new Error("Bitte eine Datei ausw\xE4hlen.");await Yt(this.hass,this.plant.id,a,r),s.reset(),await this._load()})}_currentMetricOptions(){return this.metricCatalogue[this.plantTypeKey]??[]}render(){return o`
      ${this._renderAnomalies()}
      ${this._renderInspections()}
      ${this._renderFindings()}
      ${this._renderMetrics()}
      ${this._renderDocuments()}
    `}_renderAnomalies(){return this._anomalies.length?o`
      <div class="card">
        <h2>Anomalien</h2>
        ${this._anomalies.map(e=>{let s=e.possible_causes_json?JSON.parse(e.possible_causes_json):[];return o`
            <div class="row" style="align-items: flex-start; flex-direction: column; gap: 6px;">
              <div style="display:flex; justify-content: space-between; width: 100%;">
                <strong>${e.metric_key}</strong>
                <techdoc-status-badge
                  status=${e.severity}
                  label=${`${e.severity} \xB7 ${(e.confidence*100).toFixed(0)}% Konfidenz`}
                ></techdoc-status-badge>
              </div>
              <div>${e.description}</div>
              ${s.length?o`<div class="row-subtitle">Mögliche Ursachen: ${s.join(", ")}</div>`:d}
              <div class="row-actions">
                <button class="secondary" @click=${()=>this._handleAnomalyStatus(e.id,"bestaetigt")}>
                  Bestätigen
                </button>
                <button class="text" @click=${()=>this._handleAnomalyStatus(e.id,"nicht_relevant")}>
                  Nicht relevant
                </button>
              </div>
            </div>
          `})}
      </div>
    `:d}_renderInspections(){return o`
      <div class="card">
        <h2>Prüfungen</h2>
        ${this._inspections.length?this._inspections.map(e=>o`
                <div class="row">
                  <div class="row-main">
                    <span class="row-title">${e.type} · ${e.date}</span>
                    <span class="row-subtitle">
                      ${e.inspector?`Pr\xFCfer: ${e.inspector} \xB7 `:""}nächste Prüfung:
                      ${e.next_due_date??"\u2013"}
                    </span>
                  </div>
                  <div class="row-actions">
                    <techdoc-status-badge
                      status=${e.status==="abgeschlossen"?"ok":"info"}
                      label=${e.status}
                    ></techdoc-status-badge>
                    ${e.status!=="abgeschlossen"?o`<button class="secondary" @click=${()=>this._handleCompleteInspection(e.id)}>
                          Abschließen
                        </button>`:d}
                    <button class="text" @click=${()=>this._handleGenerateReport(e.id)}>
                      Bericht (PDF)
                    </button>
                  </div>
                </div>
              `):o`<p class="empty">Noch keine Prüfungen.</p>`}
        <form class="inline" @submit=${this._handleCreateInspection}>
          <input name="type" placeholder="Prüfungsart (z. B. Jahresprüfung)" />
          <input name="inspector" placeholder="Prüfer" />
          <button type="submit">Prüfung starten</button>
        </form>
      </div>
    `}_renderFindings(){return o`
      <div class="card">
        <h2>Mängel</h2>
        ${this._findings.length?this._findings.map(e=>o`
                <div class="row">
                  <div class="row-main">
                    <span class="row-title">${e.description}</span>
                    <span class="row-subtitle">${e.date}${e.due_date?` \xB7 Frist: ${e.due_date}`:""}</span>
                  </div>
                  <techdoc-status-badge status=${e.priority} label=${e.status}></techdoc-status-badge>
                </div>
              `):o`<p class="empty">Keine Mängel für diese Anlage.</p>`}
        <form class="inline" @submit=${this._handleCreateFinding}>
          <input name="description" placeholder="Beschreibung" required />
          <select name="priority">
            <option value="niedrig">niedrig</option>
            <option value="mittel" selected>mittel</option>
            <option value="hoch">hoch</option>
            <option value="kritisch">kritisch</option>
          </select>
          <button type="submit">Anlegen</button>
        </form>
      </div>
    `}_renderMetrics(){let e=this._currentMetricOptions();return o`
      <div class="card">
        <h2>Kennzahlen &amp; Sensor-Zuordnung</h2>
        ${this._sensorMappings.length?this._sensorMappings.map(s=>o`
                <div class="row">
                  <div class="row-main">
                    <a href="#" @click=${i=>{i.preventDefault(),this._handleShowYearly(s.metric_key)}}
                      >${s.metric_key}</a
                    >
                    <span class="row-subtitle">${s.entity_id}</span>
                  </div>
                  <button class="text" @click=${()=>this._handleDeleteSensorMapping(s.id)}>Entfernen</button>
                </div>
              `):o`<p class="empty">Noch keine Sensoren zugeordnet.</p>`}
        <form class="inline" @submit=${this._handleAddSensorMapping}>
          <input name="metric_key" list="metric-key-options" placeholder="Kennzahl (metric_key)" required />
          <datalist id="metric-key-options">
            ${e.map(s=>o`<option value=${s.key}>${s.name}</option>`)}
          </datalist>
          <input name="entity_id" placeholder="z. B. sensor.pv_jahresertrag" required />
          <button type="submit">Zuordnen</button>
        </form>
        ${this._renderYearlyTotals()}
      </div>
    `}_renderYearlyTotals(){if(!this._yearlyTotals)return d;let e=Object.keys(this._yearlyTotals.totals).sort();return e.length?o`
      <h3>Jahresvergleich: ${this._yearlyTotalsMetricKey}</h3>
      ${e.map(s=>o`
          <div class="row">
            <span>${s}</span>
            <span>${this._yearlyTotals.totals[s].toFixed(1)} ${this._yearlyTotals.unit??""}</span>
          </div>
        `)}
    `:o`<p class="empty">Keine Daten für ${this._yearlyTotalsMetricKey} verfügbar.</p>`}_renderDocuments(){return o`
      <div class="card">
        <h2>Dokumente</h2>
        ${this._documents.length?this._documents.map(e=>o`
                <div class="row">
                  <a href="/api/techdoc/documents/${e.id}" target="_blank">${e.type}: ${e.filename}</a>
                </div>
              `):o`<p class="empty">Noch keine Dokumente.</p>`}
        <form class="inline" @submit=${this._handleUpload}>
          <input name="doc_type" placeholder="Dokumenttyp (z. B. Datenblatt)" />
          <input name="file" type="file" required />
          <button type="submit">Hochladen</button>
        </form>
      </div>
    `}};$.styles=M,l([u({attribute:!1})],$.prototype,"hass",2),l([u({attribute:!1})],$.prototype,"plant",2),l([u({attribute:!1})],$.prototype,"metricCatalogue",2),l([u()],$.prototype,"plantTypeKey",2),l([m()],$.prototype,"_inspections",2),l([m()],$.prototype,"_findings",2),l([m()],$.prototype,"_sensorMappings",2),l([m()],$.prototype,"_anomalies",2),l([m()],$.prototype,"_documents",2),l([m()],$.prototype,"_yearlyTotals",2),l([m()],$.prototype,"_yearlyTotalsMetricKey",2),$=l([v("techdoc-plant-detail")],$);var C=class extends y{constructor(){super(...arguments);this.findings=[];this.plants=[]}_plantName(e){return this.plants.find(s=>s.id===e)?.name??`Anlage ${e}`}async _close(e){await b(this,async()=>{await Dt(this.hass,e,"erledigt",new Date().toISOString().slice(0,10)),this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}render(){let e=this.findings.filter(s=>s.status==="offen");return o`
      <div class="card">
        <h2>Offene Mängel</h2>
        ${e.length?e.map(s=>o`
                <div class="row">
                  <div class="row-main">
                    <span class="row-title">${this._plantName(s.plant_id)}</span>
                    <span class="row-subtitle">${s.description} · ${s.date}</span>
                  </div>
                  <div class="row-actions">
                    <techdoc-status-badge status=${s.priority} label=${s.priority}></techdoc-status-badge>
                    <button class="secondary" @click=${()=>this._close(s.id)}>Erledigt</button>
                  </div>
                </div>
              `):o`<p class="empty">Keine offenen Mängel. 🟢</p>`}
      </div>
    `}};C.styles=M,l([u({attribute:!1})],C.prototype,"hass",2),l([u({attribute:!1})],C.prototype,"findings",2),l([u({attribute:!1})],C.prototype,"plants",2),C=l([v("techdoc-findings-overview")],C);var f=class extends y{constructor(){super(...arguments);this.narrow=!1;this._tab="anlagen";this._plantTypes=[];this._plants=[];this._findings=[];this._anomalies=[];this._metricCatalogue={};this._selectedPlantId=null;this._lastAnnualReportDocumentId=null;this._loaded=!1;this._errorMessage=null}updated(e){e.has("hass")&&this.hass&&!this._loaded&&(this._loaded=!0,this._loadOverview())}async _loadOverview(){let[e,s,i,r,a]=await Promise.all([kt(this.hass),Ht(this.hass),Q(this.hass),X(this.hass,void 0,"offen"),Rt(this.hass)]);this._plantTypes=e,this._plants=s,this._findings=i,this._anomalies=r,this._metricCatalogue=a}_onPlantSelect(e){this._selectedPlantId=e.detail.id}async _onPlantCreated(){await this._loadOverview()}async _onChanged(){await this._loadOverview()}async _handleGenerateAnnualReport(){await b(this,async()=>{let e=await Bt(this.hass,new Date().getFullYear());this._lastAnnualReportDocumentId=e.document_id})}_onError(e){this._errorMessage=e.detail.message}_selectedPlant(){return this._plants.find(e=>e.id===this._selectedPlantId)}_selectedPlantTypeKey(){let e=this._selectedPlant();return e?this._plantTypes.find(s=>s.id===e.plant_type_id)?.key??"":""}render(){let e=this._findings.filter(s=>s.status==="offen").length;return o`
      <div @techdoc-error=${this._onError}>
        <h1>TechDoc</h1>

        ${this._errorMessage?o`
              <div class="card" style="border: 1px solid #c62828; display:flex; justify-content: space-between; align-items: center;">
                <span>⚠️ ${this._errorMessage}</span>
                <button class="text" @click=${()=>this._errorMessage=null}>Schließen</button>
              </div>
            `:d}

        <div class="card" style="display:flex; gap: 24px; flex-wrap: wrap;">
          <div><strong>${this._plants.length}</strong> Anlagen</div>
          <div><strong>${e}</strong> offene Mängel</div>
          <div><strong>${this._anomalies.length}</strong> offene Anomalien</div>
        </div>

        <div class="tabs">
          <button
            class=${this._tab==="anlagen"?"active":""}
            @click=${()=>this._tab="anlagen"}
          >
            Anlagen
          </button>
          <button
            class=${this._tab==="maengel"?"active":""}
            @click=${()=>this._tab="maengel"}
          >
            Mängel (${e})
          </button>
        </div>

        ${this._tab==="anlagen"?this._renderAnlagenTab():this._renderMaengelTab()}
      </div>
    `}_renderAnlagenTab(){let e=this._selectedPlant();return o`
      <div class="card">
        <button class="secondary" @click=${this._handleGenerateAnnualReport}>
          Jahresbericht ${new Date().getFullYear()} erzeugen
        </button>
        ${this._lastAnnualReportDocumentId?o`<p>
              <a href="/api/techdoc/documents/${this._lastAnnualReportDocumentId}" target="_blank">
                Jahresbericht herunterladen
              </a>
            </p>`:d}
      </div>

      <techdoc-plant-list
        .hass=${this.hass}
        .plants=${this._plants}
        .plantTypes=${this._plantTypes}
        .selectedPlantId=${this._selectedPlantId}
        @plant-select=${this._onPlantSelect}
        @plant-created=${this._onPlantCreated}
      ></techdoc-plant-list>

      ${e?o`
            <h2 style="margin-top: 24px;">${e.name}</h2>
            <techdoc-plant-detail
              .hass=${this.hass}
              .plant=${e}
              .metricCatalogue=${this._metricCatalogue}
              .plantTypeKey=${this._selectedPlantTypeKey()}
              @techdoc-changed=${this._onChanged}
            ></techdoc-plant-detail>
          `:d}
    `}_renderMaengelTab(){return o`
      <techdoc-findings-overview
        .hass=${this.hass}
        .findings=${this._findings}
        .plants=${this._plants}
        @techdoc-changed=${this._onChanged}
      ></techdoc-findings-overview>
    `}};f.styles=M,l([u({attribute:!1})],f.prototype,"hass",2),l([u({type:Boolean})],f.prototype,"narrow",2),l([m()],f.prototype,"_tab",2),l([m()],f.prototype,"_plantTypes",2),l([m()],f.prototype,"_plants",2),l([m()],f.prototype,"_findings",2),l([m()],f.prototype,"_anomalies",2),l([m()],f.prototype,"_metricCatalogue",2),l([m()],f.prototype,"_selectedPlantId",2),l([m()],f.prototype,"_lastAnnualReportDocumentId",2),l([m()],f.prototype,"_loaded",2),l([m()],f.prototype,"_errorMessage",2),f=l([v("techdoc-panel")],f);export{f as TechdocPanel};
