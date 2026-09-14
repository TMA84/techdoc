var te=Object.defineProperty;var ee=Object.getOwnPropertyDescriptor;var l=(i,e,t,s)=>{for(var n=s>1?void 0:s?ee(e,t):e,r=i.length-1,a;r>=0;r--)(a=i[r])&&(n=(s?a(e,t,n):a(n))||n);return s&&n&&te(e,t,n),n};var K=globalThis,V=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,et=Symbol(),gt=new WeakMap,U=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==et)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(V&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=gt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&gt.set(t,e))}return e}toString(){return this.cssText}},_t=i=>new U(typeof i=="string"?i:i+"",void 0,et),O=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((s,n,r)=>s+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+i[r+1],i[0]);return new U(t,i,et)},ft=(i,e)=>{if(V)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),n=K.litNonce;n!==void 0&&s.setAttribute("nonce",n),s.textContent=t.cssText,i.appendChild(s)}},st=V?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return _t(t)})(i):i;var{is:se,defineProperty:ie,getOwnPropertyDescriptor:ne,getOwnPropertyNames:re,getOwnPropertySymbols:ae,getPrototypeOf:oe}=Object,Y=globalThis,yt=Y.trustedTypes,le=yt?yt.emptyScript:"",ce=Y.reactiveElementPolyfillSupport,N=(i,e)=>i,L={toAttribute(i,e){switch(e){case Boolean:i=i?le:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},G=(i,e)=>!se(i,e),vt={attribute:!0,type:String,converter:L,reflect:!1,useDefault:!1,hasChanged:G};Symbol.metadata??=Symbol("metadata"),Y.litPropertyMetadata??=new WeakMap;var E=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=vt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),n=this.getPropertyDescriptor(e,s,t);n!==void 0&&ie(this.prototype,e,n)}}static getPropertyDescriptor(e,t,s){let{get:n,set:r}=ne(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:n,set(a){let p=n?.call(this);r?.call(this,a),this.requestUpdate(e,p,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??vt}static _$Ei(){if(this.hasOwnProperty(N("elementProperties")))return;let e=oe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(N("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(N("properties"))){let t=this.properties,s=[...re(t),...ae(t)];for(let n of s)this.createProperty(n,t[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,n]of t)this.elementProperties.set(s,n)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let n=this._$Eu(t,s);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let n of s)t.unshift(st(n))}else e!==void 0&&t.push(st(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ft(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,s);if(n!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:L).toAttribute(t,s.type);this._$Em=e,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(e,t){let s=this.constructor,n=s._$Eh.get(e);if(n!==void 0&&this._$Em!==n){let r=s.getPropertyOptions(n),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:L;this._$Em=n;let p=a.fromAttribute(t,r.type);this[n]=p??this._$Ej?.get(n)??p,this._$Em=null}}requestUpdate(e,t,s,n=!1,r){if(e!==void 0){let a=this.constructor;if(n===!1&&(r=this[e]),s??=a.getPropertyOptions(e),!((s.hasChanged??G)(r,t)||s.useDefault&&s.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:n,wrapped:r},a){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),r!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),n===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,r]of this._$Ep)this[n]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[n,r]of s){let{wrapped:a}=r,p=this[n];a!==!0||this._$AL.has(n)||p===void 0||this.C(n,void 0,r,p)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[N("elementProperties")]=new Map,E[N("finalized")]=new Map,ce?.({ReactiveElement:E}),(Y.reactiveElementVersions??=[]).push("2.1.2");var ct=globalThis,bt=i=>i,J=ct.trustedTypes,$t=J?J.createPolicy("lit-html",{createHTML:i=>i}):void 0,Mt="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,Pt="?"+x,pe=`<${Pt}>`,H=document,j=()=>H.createComment(""),z=i=>i===null||typeof i!="object"&&typeof i!="function",pt=Array.isArray,de=i=>pt(i)||typeof i?.[Symbol.iterator]=="function",it=`[ 	
\f\r]`,W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,At=/-->/g,wt=/>/g,C=RegExp(`>|${it}(?:([^\\s"'>=/]+)(${it}*=${it}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Et=/'/g,St=/"/g,Ct=/^(?:script|style|textarea|title)$/i,dt=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),o=dt(1),Se=dt(2),xe=dt(3),I=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),xt=new WeakMap,k=H.createTreeWalker(H,129);function kt(i,e){if(!pt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return $t!==void 0?$t.createHTML(e):e}var he=(i,e)=>{let t=i.length-1,s=[],n,r=e===2?"<svg>":e===3?"<math>":"",a=W;for(let p=0;p<t;p++){let c=i[p],f,v,u=-1,w=0;for(;w<c.length&&(a.lastIndex=w,v=a.exec(c),v!==null);)w=a.lastIndex,a===W?v[1]==="!--"?a=At:v[1]!==void 0?a=wt:v[2]!==void 0?(Ct.test(v[2])&&(n=RegExp("</"+v[2],"g")),a=C):v[3]!==void 0&&(a=C):a===C?v[0]===">"?(a=n??W,u=-1):v[1]===void 0?u=-2:(u=a.lastIndex-v[2].length,f=v[1],a=v[3]===void 0?C:v[3]==='"'?St:Et):a===St||a===Et?a=C:a===At||a===wt?a=W:(a=C,n=void 0);let S=a===C&&i[p+1].startsWith("/>")?" ":"";r+=a===W?c+pe:u>=0?(s.push(f),c.slice(0,u)+Mt+c.slice(u)+x+S):c+x+(u===-2?p:S)}return[kt(i,r+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},F=class i{constructor({strings:e,_$litType$:t},s){let n;this.parts=[];let r=0,a=0,p=e.length-1,c=this.parts,[f,v]=he(e,t);if(this.el=i.createElement(f,s),k.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(n=k.nextNode())!==null&&c.length<p;){if(n.nodeType===1){if(n.hasAttributes())for(let u of n.getAttributeNames())if(u.endsWith(Mt)){let w=v[a++],S=n.getAttribute(u).split(x),B=/([.?@])?(.*)/.exec(w);c.push({type:1,index:r,name:B[2],strings:S,ctor:B[1]==="."?rt:B[1]==="?"?at:B[1]==="@"?ot:T}),n.removeAttribute(u)}else u.startsWith(x)&&(c.push({type:6,index:r}),n.removeAttribute(u));if(Ct.test(n.tagName)){let u=n.textContent.split(x),w=u.length-1;if(w>0){n.textContent=J?J.emptyScript:"";for(let S=0;S<w;S++)n.append(u[S],j()),k.nextNode(),c.push({type:2,index:++r});n.append(u[w],j())}}}else if(n.nodeType===8)if(n.data===Pt)c.push({type:2,index:r});else{let u=-1;for(;(u=n.data.indexOf(x,u+1))!==-1;)c.push({type:7,index:r}),u+=x.length-1}r++}}static createElement(e,t){let s=H.createElement("template");return s.innerHTML=e,s}};function R(i,e,t=i,s){if(e===I)return e;let n=s!==void 0?t._$Co?.[s]:t._$Cl,r=z(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),r===void 0?n=void 0:(n=new r(i),n._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=n:t._$Cl=n),n!==void 0&&(e=R(i,n._$AS(i,e.values),n,s)),e}var nt=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,n=(e?.creationScope??H).importNode(t,!0);k.currentNode=n;let r=k.nextNode(),a=0,p=0,c=s[0];for(;c!==void 0;){if(a===c.index){let f;c.type===2?f=new q(r,r.nextSibling,this,e):c.type===1?f=new c.ctor(r,c.name,c.strings,this,e):c.type===6&&(f=new lt(r,this,e)),this._$AV.push(f),c=s[++p]}a!==c?.index&&(r=k.nextNode(),a++)}return k.currentNode=H,n}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},q=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,n){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=R(this,e,t),z(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==I&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):de(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&z(this._$AH)?this._$AA.nextSibling.data=e:this.T(H.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,n=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=F.createElement(kt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===n)this._$AH.p(t);else{let r=new nt(n,this),a=r.u(this.options);r.p(t),this.T(a),this._$AH=r}}_$AC(e){let t=xt.get(e.strings);return t===void 0&&xt.set(e.strings,t=new F(e)),t}k(e){pt(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,n=0;for(let r of e)n===t.length?t.push(s=new i(this.O(j()),this.O(j()),this,this.options)):s=t[n],s._$AI(r),n++;n<t.length&&(this._$AR(s&&s._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=bt(e).nextSibling;bt(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},T=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,n,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(e,t=this,s,n){let r=this.strings,a=!1;if(r===void 0)e=R(this,e,t,0),a=!z(e)||e!==this._$AH&&e!==I,a&&(this._$AH=e);else{let p=e,c,f;for(e=r[0],c=0;c<r.length-1;c++)f=R(this,p[s+c],t,c),f===I&&(f=this._$AH[c]),a||=!z(f)||f!==this._$AH[c],f===d?e=d:e!==d&&(e+=(f??"")+r[c+1]),this._$AH[c]=f}a&&!n&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},rt=class extends T{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},at=class extends T{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}},ot=class extends T{constructor(e,t,s,n,r){super(e,t,s,n,r),this.type=5}_$AI(e,t=this){if((e=R(this,e,t,0)??d)===I)return;let s=this._$AH,n=e===d&&s!==d||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==d&&(s===d||n);n&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},lt=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){R(this,e)}};var ue=ct.litHtmlPolyfillSupport;ue?.(F,q),(ct.litHtmlVersions??=[]).push("3.3.3");var Ht=(i,e,t)=>{let s=t?.renderBefore??e,n=s._$litPart$;if(n===void 0){let r=t?.renderBefore??null;s._$litPart$=n=new q(e.insertBefore(j(),r),r,void 0,t??{})}return n._$AI(i),n};var ht=globalThis,b=class extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ht(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};b._$litElement$=!0,b.finalized=!0,ht.litElementHydrateSupport?.({LitElement:b});var me=ht.litElementPolyfillSupport;me?.({LitElement:b});(ht.litElementVersions??=[]).push("4.2.2");var $=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};var ge={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:G},_e=(i=ge,e,t)=>{let{kind:s,metadata:n}=t,r=globalThis.litPropertyMetadata.get(n);if(r===void 0&&globalThis.litPropertyMetadata.set(n,r=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),r.set(t.name,i),s==="accessor"){let{name:a}=t;return{set(p){let c=e.get.call(this);e.set.call(this,p),this.requestUpdate(a,c,i,!0,p)},init(p){return p!==void 0&&this.C(a,void 0,i,p),p}}}if(s==="setter"){let{name:a}=t;return function(p){let c=this[a];e.call(this,p),this.requestUpdate(a,c,i,!0,p)}}throw Error("Unsupported decorator location: "+s)};function m(i){return(e,t)=>typeof t=="object"?_e(i,e,t):((s,n,r)=>{let a=n.hasOwnProperty(r);return n.constructor.createProperty(r,s),a?Object.getOwnPropertyDescriptor(n,r):void 0})(i,e,t)}function h(i){return m({...i,state:!0,attribute:!1})}var M=O`
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
`;function fe(i){return i instanceof Error||i&&typeof i=="object"&&"message"in i&&typeof i.message=="string"?i.message:String(i)}async function g(i,e){try{await e()}catch(t){i.dispatchEvent(new CustomEvent("techdoc-error",{detail:{message:fe(t)},bubbles:!0,composed:!0}))}}var It=i=>i.callWS({type:"techdoc/plant_type_list"}),Dt=i=>i.callWS({type:"techdoc/plant_list"}),Rt=(i,e,t)=>i.callWS({type:"techdoc/plant_create",name:e,plant_type_id:t}),Tt=(i,e,t)=>i.callWS({type:"techdoc/plant_update",plant_id:e,...t}),Ut=(i,e)=>i.callWS({type:"techdoc/plant_delete",plant_id:e}),Ot=i=>i.callWS({type:"techdoc/metric_catalogue"}),Nt=i=>i.callWS({type:"techdoc/device_list"}),Lt=(i,e)=>i.callWS({type:"techdoc/device_entities",device_id:e}),Wt=(i,e,t)=>i.callWS({type:"techdoc/device_entity_suggestions",plant_id:e,device_id:t}),jt=(i,e)=>i.callWS({type:"techdoc/inspection_list",plant_id:e}),zt=(i,e,t,s,n)=>i.callWS({type:"techdoc/inspection_create",plant_id:e,date:t,inspection_type:s,inspector:n}),Ft=(i,e)=>i.callWS({type:"techdoc/inspection_complete",inspection_id:e}),Q=(i,e,t)=>i.callWS({type:"techdoc/finding_list",plant_id:e,status:t}),qt=(i,e,t,s,n)=>i.callWS({type:"techdoc/finding_create",plant_id:e,description:t,date:s,priority:n}),Bt=(i,e,t,s)=>i.callWS({type:"techdoc/finding_update_status",finding_id:e,status:t,resolved_at:s}),Kt=(i,e)=>i.callWS({type:"techdoc/sensor_mapping_list",plant_id:e}),ut=(i,e,t,s,n)=>i.callWS({type:"techdoc/sensor_mapping_upsert",plant_id:e,metric_key:t,entity_id:s,unit:n}),Vt=(i,e)=>i.callWS({type:"techdoc/sensor_mapping_delete",mapping_id:e}),Yt=(i,e,t)=>i.callWS({type:"techdoc/plant_metric_yearly",plant_id:e,metric_key:t}),X=(i,e,t)=>i.callWS({type:"techdoc/anomaly_list",plant_id:e,status:t}),Gt=(i,e,t)=>i.callWS({type:"techdoc/anomaly_update_status",anomaly_id:e,status:t}),Jt=(i,e)=>i.callWS({type:"techdoc/document_list",plant_id:e}),tt=(i,e,t=300)=>i.callWS({type:"auth/sign_path",path:e,expires:t}),Zt=(i,e)=>i.callWS({type:"techdoc/report_generate_inspection",inspection_id:e}),Qt=(i,e)=>i.callWS({type:"techdoc/report_generate_annual",year:e});async function Xt(i,e,t,s){let n=new FormData;n.append("file",t),n.append("type",s||"Sonstiges"),n.append("plant_id",String(e));let r=await fetch("/api/techdoc/documents",{method:"POST",headers:{Authorization:`Bearer ${i.auth.data.access_token}`},body:n});if(!r.ok)throw new Error(`Upload fehlgeschlagen (${r.status})`);return r.json()}var ye={ok:"\u{1F7E2}",info:"\u26AA",niedrig:"\u{1F535}",mittel:"\u{1F7E1}",hoch:"\u{1F7E0}",kritisch:"\u{1F534}",due:"\u{1F7E1}",overdue:"\u{1F534}"},D=class extends b{constructor(){super(...arguments);this.status="info";this.label=""}render(){return o`
      <span class="badge ${this.status}">${ye[this.status]??""} ${this.label}</span>
    `}};D.styles=O`
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
  `,l([m()],D.prototype,"status",2),l([m()],D.prototype,"label",2),D=l([$("techdoc-status-badge")],D);function ve(i){let e=new Date().toISOString().slice(0,10);return i.next_inspection&&i.next_inspection<e?o`<techdoc-status-badge status="overdue" label="Prüfung überfällig"></techdoc-status-badge>`:i.status==="kritisch"?o`<techdoc-status-badge status="kritisch" label="Kritisch"></techdoc-status-badge>`:i.status==="auffaellig"?o`<techdoc-status-badge status="hoch" label="Auffällig"></techdoc-status-badge>`:o`<techdoc-status-badge status="ok" label="OK"></techdoc-status-badge>`}var A=class extends b{constructor(){super(...arguments);this.plants=[];this.plantTypes=[];this.selectedPlantId=null;this._editingPlantId=null}_plantTypeName(t){return this.plantTypes.find(s=>s.id===t)?.name??`Typ ${t}`}async _handleCreateSubmit(t){t.preventDefault();let s=t.target;await g(this,async()=>{let n=s.elements.namedItem("name").value.trim(),r=s.elements.namedItem("plant_type_id").value;if(!n)throw new Error("Bitte einen Namen f\xFCr die Anlage eingeben.");if(!r)throw new Error("Bitte einen Anlagentyp ausw\xE4hlen.");await Rt(this.hass,n,parseInt(r,10)),s.reset(),this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}_select(t){this.dispatchEvent(new CustomEvent("plant-select",{detail:{id:t},bubbles:!0,composed:!0}))}_startEdit(t,s){t.stopPropagation(),this._editingPlantId=s}_cancelEdit(t){t.stopPropagation(),this._editingPlantId=null}async _handleEditSubmit(t,s){t.preventDefault(),t.stopPropagation();let n=t.target;await g(this,async()=>{let r=n.elements.namedItem("name").value.trim(),a=n.elements.namedItem("plant_type_id").value;if(!r)throw new Error("Bitte einen Namen f\xFCr die Anlage eingeben.");await Tt(this.hass,s,{name:r,plant_type_id:parseInt(a,10)}),this._editingPlantId=null,this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}async _handleDelete(t,s){t.stopPropagation(),confirm(`Anlage "${s.name}" wirklich l\xF6schen? Damit werden auch alle zugeh\xF6rigen Pr\xFCfungen, M\xE4ngel, Dokumente und Sensor-Zuordnungen unwiderruflich gel\xF6scht.`)&&await g(this,async()=>{await Ut(this.hass,s.id),this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}_renderPlantRow(t){return this._editingPlantId===t.id?o`
        <form
          class="inline"
          style="padding: 10px 0;"
          @submit=${s=>this._handleEditSubmit(s,t.id)}
          @click=${s=>s.stopPropagation()}
        >
          <input name="name" .value=${t.name} required />
          <select name="plant_type_id" required>
            ${this.plantTypes.map(s=>o`<option value=${s.id} ?selected=${s.id===t.plant_type_id}>${s.name}</option>`)}
          </select>
          <button type="submit">Speichern</button>
          <button type="button" class="text" @click=${s=>this._cancelEdit(s)}>Abbrechen</button>
        </form>
      `:o`
      <div
        class="row clickable"
        @click=${()=>this._select(t.id)}
        style=${t.id===this.selectedPlantId?"background: var(--secondary-background-color, #f4f4f4); margin: 0 -20px; padding: 10px 20px;":""}
      >
        <div class="row-main">
          <span class="row-title">${t.name}</span>
          <span class="row-subtitle">
            ${this._plantTypeName(t.plant_type_id)}
            ${t.next_inspection?o` · nächste Prüfung: ${t.next_inspection}`:d}
          </span>
        </div>
        <div class="row-actions">
          ${ve(t)}
          <button class="text" @click=${s=>this._startEdit(s,t.id)}>Bearbeiten</button>
          <button class="text" @click=${s=>this._handleDelete(s,t)}>Löschen</button>
        </div>
      </div>
    `}render(){return o`
      <div class="card">
        <h2>Anlagen</h2>
        ${this.plants.length?this.plants.map(t=>this._renderPlantRow(t)):o`<p class="empty">Noch keine Anlagen angelegt.</p>`}

        <h3>Anlage anlegen</h3>
        ${this.plantTypes.length?o`
              <form class="inline" @submit=${this._handleCreateSubmit}>
                <input name="name" placeholder="Name der Anlage" required />
                <select name="plant_type_id" required>
                  ${this.plantTypes.map(t=>o`<option value=${t.id}>${t.name}</option>`)}
                </select>
                <button type="submit">Anlegen</button>
              </form>
            `:o`<p class="empty">
              Keine Anlagentypen geladen — Integration neu laden oder Home-Assistant-Protokoll
              nach "techdoc" durchsuchen.
            </p>`}
      </div>
    `}};A.styles=M,l([m({attribute:!1})],A.prototype,"hass",2),l([m({attribute:!1})],A.prototype,"plants",2),l([m({attribute:!1})],A.prototype,"plantTypes",2),l([m({type:Number})],A.prototype,"selectedPlantId",2),l([h()],A.prototype,"_editingPlantId",2),A=l([$("techdoc-plant-list")],A);function mt(i){i.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))}var _=class extends b{constructor(){super(...arguments);this.metricCatalogue={};this.plantTypeKey="";this._inspections=[];this._findings=[];this._sensorMappings=[];this._anomalies=[];this._documents=[];this._yearlyTotals=null;this._yearlyTotalsMetricKey=null;this._devices=[];this._deviceEntities=[];this._selectedDeviceId="";this._entityIdDraft="";this._suggestions=[]}willUpdate(t){if(t.has("plant")&&this.plant){let s=t.get("plant");(!s||s.id!==this.plant.id)&&(this._yearlyTotals=null,this._yearlyTotalsMetricKey=null,this._selectedDeviceId="",this._deviceEntities=[],this._suggestions=[],this._load(),this._devices.length||Nt(this.hass).then(n=>this._devices=n))}}async _load(){let t=this.plant.id,[s,n,r,a,p]=await Promise.all([jt(this.hass,t),Q(this.hass,t),Kt(this.hass,t),X(this.hass,t,"offen"),Jt(this.hass,t)]);this._inspections=s,this._findings=n,this._sensorMappings=r,this._anomalies=a,this._documents=p}async _handleCreateInspection(t){t.preventDefault();let s=t.target;await g(this,async()=>{let n=s.elements.namedItem("type").value.trim()||"sonstige",r=s.elements.namedItem("inspector").value.trim();await zt(this.hass,this.plant.id,new Date().toISOString().slice(0,10),n,r||void 0),s.reset(),await this._load(),mt(this)})}async _handleCompleteInspection(t){await g(this,async()=>{await Ft(this.hass,t),await this._load(),mt(this)})}async _handleGenerateReport(t){await g(this,async()=>{await Zt(this.hass,t),await this._load()})}async _handleCreateFinding(t){t.preventDefault();let s=t.target;await g(this,async()=>{let n=s.elements.namedItem("description").value.trim(),r=s.elements.namedItem("priority").value;if(!n)throw new Error("Bitte eine Beschreibung f\xFCr den Mangel eingeben.");await qt(this.hass,this.plant.id,n,new Date().toISOString().slice(0,10),r),s.reset(),await this._load(),mt(this)})}async _handleDeviceChange(t){let s=t.target.value;if(this._selectedDeviceId=s,!s){this._deviceEntities=[],this._suggestions=[];return}await g(this,async()=>{let[n,r]=await Promise.all([Lt(this.hass,s),Wt(this.hass,this.plant.id,s)]);this._deviceEntities=n,this._suggestions=r})}_handleEntityPick(t){let s=t.target.value;s&&(this._entityIdDraft=s)}async _handleApplySuggestion(t){await g(this,async()=>{await ut(this.hass,this.plant.id,t.metric_key,t.entity_id),this._suggestions=this._suggestions.filter(s=>s.metric_key!==t.metric_key),await this._load()})}async _handleAddSensorMapping(t){t.preventDefault();let s=t.target;await g(this,async()=>{let n=s.elements.namedItem("metric_key").value.trim(),r=s.elements.namedItem("entity_id").value.trim();if(!n||!r)throw new Error("Bitte eine Kennzahl angeben und ein Ger\xE4t + Sensor ausw\xE4hlen (oder die Entity-ID direkt eingeben).");let a=this._currentMetricOptions().find(p=>p.key===n);await ut(this.hass,this.plant.id,n,r,a?.unit??void 0),s.reset(),this._entityIdDraft="",this._deviceEntities=[],this._selectedDeviceId="",this._suggestions=[],await this._load()})}async _handleDeleteSensorMapping(t){await g(this,async()=>{await Vt(this.hass,t),await this._load()})}async _handleShowYearly(t){await g(this,async()=>{this._yearlyTotalsMetricKey=t,this._yearlyTotals=await Yt(this.hass,this.plant.id,t)})}async _handleAnomalyStatus(t,s){await g(this,async()=>{await Gt(this.hass,t,s),await this._load()})}async _handleUpload(t){t.preventDefault();let s=t.target;await g(this,async()=>{let n=s.elements.namedItem("file"),r=s.elements.namedItem("doc_type").value,a=n.files?.[0];if(!a)throw new Error("Bitte eine Datei ausw\xE4hlen.");await Xt(this.hass,this.plant.id,a,r),s.reset(),await this._load()})}_currentMetricOptions(){return this.metricCatalogue[this.plantTypeKey]??[]}render(){return o`
      ${this._renderAnomalies()}
      ${this._renderInspections()}
      ${this._renderFindings()}
      ${this._renderMetrics()}
      ${this._renderDocuments()}
    `}_renderAnomalies(){return this._anomalies.length?o`
      <div class="card">
        <h2>Anomalien</h2>
        ${this._anomalies.map(t=>{let s=t.possible_causes_json?JSON.parse(t.possible_causes_json):[];return o`
            <div class="row" style="align-items: flex-start; flex-direction: column; gap: 6px;">
              <div style="display:flex; justify-content: space-between; width: 100%;">
                <strong>${t.metric_key}</strong>
                <techdoc-status-badge
                  status=${t.severity}
                  label=${`${t.severity} \xB7 ${(t.confidence*100).toFixed(0)}% Konfidenz`}
                ></techdoc-status-badge>
              </div>
              <div>${t.description}</div>
              ${s.length?o`<div class="row-subtitle">Mögliche Ursachen: ${s.join(", ")}</div>`:d}
              <div class="row-actions">
                <button class="secondary" @click=${()=>this._handleAnomalyStatus(t.id,"bestaetigt")}>
                  Bestätigen
                </button>
                <button class="text" @click=${()=>this._handleAnomalyStatus(t.id,"nicht_relevant")}>
                  Nicht relevant
                </button>
              </div>
            </div>
          `})}
      </div>
    `:d}_renderInspections(){return o`
      <div class="card">
        <h2>Prüfungen</h2>
        ${this._inspections.length?this._inspections.map(t=>o`
                <div class="row">
                  <div class="row-main">
                    <span class="row-title">${t.type} · ${t.date}</span>
                    <span class="row-subtitle">
                      ${t.inspector?`Pr\xFCfer: ${t.inspector} \xB7 `:""}nächste Prüfung:
                      ${t.next_due_date??"\u2013"}
                    </span>
                  </div>
                  <div class="row-actions">
                    <techdoc-status-badge
                      status=${t.status==="abgeschlossen"?"ok":"info"}
                      label=${t.status}
                    ></techdoc-status-badge>
                    ${t.status!=="abgeschlossen"?o`<button class="secondary" @click=${()=>this._handleCompleteInspection(t.id)}>
                          Abschließen
                        </button>`:d}
                    <button class="text" @click=${()=>this._handleGenerateReport(t.id)}>
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
        ${this._findings.length?this._findings.map(t=>o`
                <div class="row">
                  <div class="row-main">
                    <span class="row-title">${t.description}</span>
                    <span class="row-subtitle">${t.date}${t.due_date?` \xB7 Frist: ${t.due_date}`:""}</span>
                  </div>
                  <techdoc-status-badge status=${t.priority} label=${t.status}></techdoc-status-badge>
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
    `}_renderMetrics(){let t=this._currentMetricOptions();return o`
      <div class="card">
        <h2>Kennzahlen &amp; Sensor-Zuordnung</h2>
        ${this._sensorMappings.length?this._sensorMappings.map(s=>o`
                <div class="row">
                  <div class="row-main">
                    <a href="#" @click=${n=>{n.preventDefault(),this._handleShowYearly(s.metric_key)}}
                      >${s.metric_key}</a
                    >
                    <span class="row-subtitle">${s.entity_id} · ${s.aggregation==="mean"?"Mittelwert":"Summe"}</span>
                  </div>
                  <button class="text" @click=${()=>this._handleDeleteSensorMapping(s.id)}>Entfernen</button>
                </div>
              `):o`<p class="empty">Noch keine Sensoren zugeordnet.</p>`}
        <h3>Gerät wählen</h3>
        <select class="inline" @change=${this._handleDeviceChange} .value=${this._selectedDeviceId}>
          <option value="">Gerät wählen …</option>
          ${this._devices.map(s=>o`<option value=${s.id}>${s.name}</option>`)}
        </select>

        ${this._suggestions.length?o`
              <h3>Vorschläge für dieses Gerät</h3>
              ${this._suggestions.map(s=>o`
                  <div class="row">
                    <div class="row-main">
                      <span class="row-title">${s.metric_name}</span>
                      <span class="row-subtitle">${s.entity_name} (${s.entity_id})</span>
                    </div>
                    <button @click=${()=>this._handleApplySuggestion(s)}>Übernehmen</button>
                  </div>
                `)}
            `:d}

        <h3>Manuell zuordnen</h3>
        <form class="inline" @submit=${this._handleAddSensorMapping}>
          <input name="metric_key" list="metric-key-options" placeholder="Kennzahl (metric_key)" required />
          <datalist id="metric-key-options">
            ${t.map(s=>o`<option value=${s.key}>${s.name}</option>`)}
          </datalist>
          <select @change=${this._handleEntityPick} ?disabled=${!this._deviceEntities.length}>
            <option value="">${this._deviceEntities.length?"Sensor w\xE4hlen \u2026":"(erst Ger\xE4t w\xE4hlen)"}</option>
            ${this._deviceEntities.map(s=>o`<option value=${s.entity_id}>${s.name} (${s.entity_id})</option>`)}
          </select>
          <input
            name="entity_id"
            placeholder="oder Entity-ID direkt eingeben, z. B. sensor.pv_jahresertrag"
            .value=${this._entityIdDraft}
            @input=${s=>this._entityIdDraft=s.target.value}
            required
          />
          <button type="submit">Zuordnen</button>
        </form>
        <p class="row-subtitle">
          Summe/Mittelwert wird automatisch aus dem state_class-Attribut des gewählten Sensors erkannt.
        </p>
        ${this._renderYearlyTotals()}
      </div>
    `}_renderYearlyTotals(){if(!this._yearlyTotals)return d;let t=Object.keys(this._yearlyTotals.totals).sort();return t.length?o`
      <h3>Jahresvergleich: ${this._yearlyTotalsMetricKey}</h3>
      ${t.map(s=>o`
          <div class="row">
            <span>${s}</span>
            <span>${this._yearlyTotals.totals[s].toFixed(1)} ${this._yearlyTotals.unit??""}</span>
          </div>
        `)}
    `:o`<p class="empty">Keine Daten für ${this._yearlyTotalsMetricKey} verfügbar.</p>`}async _handleOpenDocument(t,s){t.preventDefault(),await g(this,async()=>{let{path:n}=await tt(this.hass,`/api/techdoc/documents/${s}`);window.open(n,"_blank")})}_renderDocuments(){return o`
      <div class="card">
        <h2>Dokumente</h2>
        ${this._documents.length?this._documents.map(t=>o`
                <div class="row">
                  <a href="#" @click=${s=>this._handleOpenDocument(s,t.id)}
                    >${t.type}: ${t.filename}</a
                  >
                </div>
              `):o`<p class="empty">Noch keine Dokumente.</p>`}
        <form class="inline" @submit=${this._handleUpload}>
          <input name="doc_type" placeholder="Dokumenttyp (z. B. Datenblatt)" />
          <input name="file" type="file" required />
          <button type="submit">Hochladen</button>
        </form>
      </div>
    `}};_.styles=M,l([m({attribute:!1})],_.prototype,"hass",2),l([m({attribute:!1})],_.prototype,"plant",2),l([m({attribute:!1})],_.prototype,"metricCatalogue",2),l([m()],_.prototype,"plantTypeKey",2),l([h()],_.prototype,"_inspections",2),l([h()],_.prototype,"_findings",2),l([h()],_.prototype,"_sensorMappings",2),l([h()],_.prototype,"_anomalies",2),l([h()],_.prototype,"_documents",2),l([h()],_.prototype,"_yearlyTotals",2),l([h()],_.prototype,"_yearlyTotalsMetricKey",2),l([h()],_.prototype,"_devices",2),l([h()],_.prototype,"_deviceEntities",2),l([h()],_.prototype,"_selectedDeviceId",2),l([h()],_.prototype,"_entityIdDraft",2),l([h()],_.prototype,"_suggestions",2),_=l([$("techdoc-plant-detail")],_);var P=class extends b{constructor(){super(...arguments);this.findings=[];this.plants=[]}_plantName(t){return this.plants.find(s=>s.id===t)?.name??`Anlage ${t}`}async _close(t){await g(this,async()=>{await Bt(this.hass,t,"erledigt",new Date().toISOString().slice(0,10)),this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}render(){let t=this.findings.filter(s=>s.status==="offen");return o`
      <div class="card">
        <h2>Offene Mängel</h2>
        ${t.length?t.map(s=>o`
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
    `}};P.styles=M,l([m({attribute:!1})],P.prototype,"hass",2),l([m({attribute:!1})],P.prototype,"findings",2),l([m({attribute:!1})],P.prototype,"plants",2),P=l([$("techdoc-findings-overview")],P);var y=class extends b{constructor(){super(...arguments);this.narrow=!1;this._tab="anlagen";this._plantTypes=[];this._plants=[];this._findings=[];this._anomalies=[];this._metricCatalogue={};this._selectedPlantId=null;this._lastAnnualReportUrl=null;this._loaded=!1;this._errorMessage=null}updated(t){t.has("hass")&&this.hass&&!this._loaded&&(this._loaded=!0,this._loadOverview())}async _loadOverview(){let[t,s,n,r,a]=await Promise.all([It(this.hass),Dt(this.hass),Q(this.hass),X(this.hass,void 0,"offen"),Ot(this.hass)]);this._plantTypes=t,this._plants=s,this._findings=n,this._anomalies=r,this._metricCatalogue=a}_onPlantSelect(t){this._selectedPlantId=t.detail.id}async _onChanged(){await this._loadOverview()}async _handleGenerateAnnualReport(){await g(this,async()=>{let t=await Qt(this.hass,new Date().getFullYear()),s=await tt(this.hass,`/api/techdoc/documents/${t.document_id}`);this._lastAnnualReportUrl=s.path})}_onError(t){this._errorMessage=t.detail.message}_selectedPlant(){return this._plants.find(t=>t.id===this._selectedPlantId)}_selectedPlantTypeKey(){let t=this._selectedPlant();return t?this._plantTypes.find(s=>s.id===t.plant_type_id)?.key??"":""}render(){let t=this._findings.filter(s=>s.status==="offen").length;return o`
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
          <div><strong>${t}</strong> offene Mängel</div>
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
            Mängel (${t})
          </button>
        </div>

        ${this._tab==="anlagen"?this._renderAnlagenTab():this._renderMaengelTab()}
      </div>
    `}_renderAnlagenTab(){let t=this._selectedPlant();return o`
      <div class="card">
        <button class="secondary" @click=${this._handleGenerateAnnualReport}>
          Jahresbericht ${new Date().getFullYear()} erzeugen
        </button>
        ${this._lastAnnualReportUrl?o`<p>
              <a href=${this._lastAnnualReportUrl} target="_blank"> Jahresbericht herunterladen </a>
            </p>`:d}
      </div>

      <techdoc-plant-list
        .hass=${this.hass}
        .plants=${this._plants}
        .plantTypes=${this._plantTypes}
        .selectedPlantId=${this._selectedPlantId}
        @plant-select=${this._onPlantSelect}
        @techdoc-changed=${this._onChanged}
      ></techdoc-plant-list>

      ${t?o`
            <h2 style="margin-top: 24px;">${t.name}</h2>
            <techdoc-plant-detail
              .hass=${this.hass}
              .plant=${t}
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
    `}};y.styles=M,l([m({attribute:!1})],y.prototype,"hass",2),l([m({type:Boolean})],y.prototype,"narrow",2),l([h()],y.prototype,"_tab",2),l([h()],y.prototype,"_plantTypes",2),l([h()],y.prototype,"_plants",2),l([h()],y.prototype,"_findings",2),l([h()],y.prototype,"_anomalies",2),l([h()],y.prototype,"_metricCatalogue",2),l([h()],y.prototype,"_selectedPlantId",2),l([h()],y.prototype,"_lastAnnualReportUrl",2),l([h()],y.prototype,"_loaded",2),l([h()],y.prototype,"_errorMessage",2),y=l([$("techdoc-panel")],y);export{y as TechdocPanel};
