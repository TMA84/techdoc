var Gt=Object.defineProperty;var Zt=Object.getOwnPropertyDescriptor;var l=(n,e,t,s)=>{for(var i=s>1?void 0:s?Zt(e,t):e,r=n.length-1,a;r>=0;r--)(a=n[r])&&(i=(s?a(e,t,i):a(i))||i);return s&&i&&Gt(e,t,i),i};var K=globalThis,Y=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,tt=Symbol(),ut=new WeakMap,U=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==tt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(Y&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=ut.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ut.set(t,e))}return e}toString(){return this.cssText}},mt=n=>new U(typeof n=="string"?n:n+"",void 0,tt),N=(n,...e)=>{let t=n.length===1?n[0]:e.reduce((s,i,r)=>s+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+n[r+1],n[0]);return new U(t,n,tt)},gt=(n,e)=>{if(Y)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),i=K.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,n.appendChild(s)}},et=Y?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return mt(t)})(n):n;var{is:Qt,defineProperty:Xt,getOwnPropertyDescriptor:te,getOwnPropertyNames:ee,getOwnPropertySymbols:se,getPrototypeOf:ne}=Object,V=globalThis,ft=V.trustedTypes,ie=ft?ft.emptyScript:"",re=V.reactiveElementPolyfillSupport,D=(n,e)=>n,L={toAttribute(n,e){switch(e){case Boolean:n=n?ie:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},J=(n,e)=>!Qt(n,e),_t={attribute:!0,type:String,converter:L,reflect:!1,useDefault:!1,hasChanged:J};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;var x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_t){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(e,s,t);i!==void 0&&Xt(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){let{get:i,set:r}=te(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:i,set(a){let p=i?.call(this);r?.call(this,a),this.requestUpdate(e,p,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_t}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){let t=this.properties,s=[...ee(t),...se(t)];for(let i of s)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,i]of t)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let i=this._$Eu(t,s);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let i of s)t.unshift(et(i))}else e!==void 0&&t.push(et(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return gt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(i!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:L).toAttribute(t,s.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let s=this.constructor,i=s._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=s.getPropertyOptions(i),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:L;this._$Em=i;let p=a.fromAttribute(t,r.type);this[i]=p??this._$Ej?.get(i)??p,this._$Em=null}}requestUpdate(e,t,s,i=!1,r){if(e!==void 0){let a=this.constructor;if(i===!1&&(r=this[e]),s??=a.getPropertyOptions(e),!((s.hasChanged??J)(r,t)||s.useDefault&&s.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:r},a){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),r!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,r]of s){let{wrapped:a}=r,p=this[i];a!==!0||this._$AL.has(i)||p===void 0||this.C(i,void 0,r,p)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[D("elementProperties")]=new Map,x[D("finalized")]=new Map,re?.({ReactiveElement:x}),(V.reactiveElementVersions??=[]).push("2.1.2");var lt=globalThis,yt=n=>n,G=lt.trustedTypes,bt=G?G.createPolicy("lit-html",{createHTML:n=>n}):void 0,Et="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,St="?"+S,ae=`<${St}>`,H=document,z=()=>H.createComment(""),F=n=>n===null||typeof n!="object"&&typeof n!="function",ct=Array.isArray,oe=n=>ct(n)||typeof n?.[Symbol.iterator]=="function",st=`[ 	
\f\r]`,j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,vt=/-->/g,$t=/>/g,C=RegExp(`>|${st}(?:([^\\s"'>=/]+)(${st}*=${st}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),At=/'/g,wt=/"/g,Pt=/^(?:script|style|textarea|title)$/i,pt=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),o=pt(1),ve=pt(2),$e=pt(3),I=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),xt=new WeakMap,k=H.createTreeWalker(H,129);function Mt(n,e){if(!ct(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return bt!==void 0?bt.createHTML(e):e}var le=(n,e)=>{let t=n.length-1,s=[],i,r=e===2?"<svg>":e===3?"<math>":"",a=j;for(let p=0;p<t;p++){let c=n[p],g,y,h=-1,w=0;for(;w<c.length&&(a.lastIndex=w,y=a.exec(c),y!==null);)w=a.lastIndex,a===j?y[1]==="!--"?a=vt:y[1]!==void 0?a=$t:y[2]!==void 0?(Pt.test(y[2])&&(i=RegExp("</"+y[2],"g")),a=C):y[3]!==void 0&&(a=C):a===C?y[0]===">"?(a=i??j,h=-1):y[1]===void 0?h=-2:(h=a.lastIndex-y[2].length,g=y[1],a=y[3]===void 0?C:y[3]==='"'?wt:At):a===wt||a===At?a=C:a===vt||a===$t?a=j:(a=C,i=void 0);let E=a===C&&n[p+1].startsWith("/>")?" ":"";r+=a===j?c+ae:h>=0?(s.push(g),c.slice(0,h)+Et+c.slice(h)+S+E):c+S+(h===-2?p:E)}return[Mt(n,r+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},W=class n{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let r=0,a=0,p=e.length-1,c=this.parts,[g,y]=le(e,t);if(this.el=n.createElement(g,s),k.currentNode=this.el.content,t===2||t===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=k.nextNode())!==null&&c.length<p;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(Et)){let w=y[a++],E=i.getAttribute(h).split(S),B=/([.?@])?(.*)/.exec(w);c.push({type:1,index:r,name:B[2],strings:E,ctor:B[1]==="."?it:B[1]==="?"?rt:B[1]==="@"?at:O}),i.removeAttribute(h)}else h.startsWith(S)&&(c.push({type:6,index:r}),i.removeAttribute(h));if(Pt.test(i.tagName)){let h=i.textContent.split(S),w=h.length-1;if(w>0){i.textContent=G?G.emptyScript:"";for(let E=0;E<w;E++)i.append(h[E],z()),k.nextNode(),c.push({type:2,index:++r});i.append(h[w],z())}}}else if(i.nodeType===8)if(i.data===St)c.push({type:2,index:r});else{let h=-1;for(;(h=i.data.indexOf(S,h+1))!==-1;)c.push({type:7,index:r}),h+=S.length-1}r++}}static createElement(e,t){let s=H.createElement("template");return s.innerHTML=e,s}};function T(n,e,t=n,s){if(e===I)return e;let i=s!==void 0?t._$Co?.[s]:t._$Cl,r=F(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(n),i._$AT(n,t,s)),s!==void 0?(t._$Co??=[])[s]=i:t._$Cl=i),i!==void 0&&(e=T(n,i._$AS(n,e.values),i,s)),e}var nt=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??H).importNode(t,!0);k.currentNode=i;let r=k.nextNode(),a=0,p=0,c=s[0];for(;c!==void 0;){if(a===c.index){let g;c.type===2?g=new q(r,r.nextSibling,this,e):c.type===1?g=new c.ctor(r,c.name,c.strings,this,e):c.type===6&&(g=new ot(r,this,e)),this._$AV.push(g),c=s[++p]}a!==c?.index&&(r=k.nextNode(),a++)}return k.currentNode=H,i}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},q=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=T(this,e,t),F(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==I&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):oe(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&F(this._$AH)?this._$AA.nextSibling.data=e:this.T(H.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=W.createElement(Mt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new nt(i,this),a=r.u(this.options);r.p(t),this.T(a),this._$AH=r}}_$AC(e){let t=xt.get(e.strings);return t===void 0&&xt.set(e.strings,t=new W(e)),t}k(e){ct(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,i=0;for(let r of e)i===t.length?t.push(s=new n(this.O(z()),this.O(z()),this,this.options)):s=t[i],s._$AI(r),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=yt(e).nextSibling;yt(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},O=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(e,t=this,s,i){let r=this.strings,a=!1;if(r===void 0)e=T(this,e,t,0),a=!F(e)||e!==this._$AH&&e!==I,a&&(this._$AH=e);else{let p=e,c,g;for(e=r[0],c=0;c<r.length-1;c++)g=T(this,p[s+c],t,c),g===I&&(g=this._$AH[c]),a||=!F(g)||g!==this._$AH[c],g===d?e=d:e!==d&&(e+=(g??"")+r[c+1]),this._$AH[c]=g}a&&!i&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},it=class extends O{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},rt=class extends O{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}},at=class extends O{constructor(e,t,s,i,r){super(e,t,s,i,r),this.type=5}_$AI(e,t=this){if((e=T(this,e,t,0)??d)===I)return;let s=this._$AH,i=e===d&&s!==d||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==d&&(s===d||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ot=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){T(this,e)}};var ce=lt.litHtmlPolyfillSupport;ce?.(W,q),(lt.litHtmlVersions??=[]).push("3.3.3");var Ct=(n,e,t)=>{let s=t?.renderBefore??e,i=s._$litPart$;if(i===void 0){let r=t?.renderBefore??null;s._$litPart$=i=new q(e.insertBefore(z(),r),r,void 0,t??{})}return i._$AI(n),i};var dt=globalThis,b=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ct(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};b._$litElement$=!0,b.finalized=!0,dt.litElementHydrateSupport?.({LitElement:b});var pe=dt.litElementPolyfillSupport;pe?.({LitElement:b});(dt.litElementVersions??=[]).push("4.2.2");var $=n=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(n,e)}):customElements.define(n,e)};var de={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:J},he=(n=de,e,t)=>{let{kind:s,metadata:i}=t,r=globalThis.litPropertyMetadata.get(i);if(r===void 0&&globalThis.litPropertyMetadata.set(i,r=new Map),s==="setter"&&((n=Object.create(n)).wrapped=!0),r.set(t.name,n),s==="accessor"){let{name:a}=t;return{set(p){let c=e.get.call(this);e.set.call(this,p),this.requestUpdate(a,c,n,!0,p)},init(p){return p!==void 0&&this.C(a,void 0,n,p),p}}}if(s==="setter"){let{name:a}=t;return function(p){let c=this[a];e.call(this,p),this.requestUpdate(a,c,n,!0,p)}}throw Error("Unsupported decorator location: "+s)};function u(n){return(e,t)=>typeof t=="object"?he(n,e,t):((s,i,r)=>{let a=i.hasOwnProperty(r);return i.constructor.createProperty(r,s),a?Object.getOwnPropertyDescriptor(i,r):void 0})(n,e,t)}function m(n){return u({...n,state:!0,attribute:!1})}var P=N`
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
`;async function f(n,e){try{await e()}catch(t){let s=t instanceof Error?t.message:String(t);n.dispatchEvent(new CustomEvent("techdoc-error",{detail:{message:s},bubbles:!0,composed:!0}))}}var kt=n=>n.callWS({type:"techdoc/plant_type_list"}),Ht=n=>n.callWS({type:"techdoc/plant_list"}),It=(n,e,t)=>n.callWS({type:"techdoc/plant_create",name:e,plant_type_id:t}),Rt=(n,e,t)=>n.callWS({type:"techdoc/plant_update",plant_id:e,...t}),Tt=(n,e)=>n.callWS({type:"techdoc/plant_delete",plant_id:e}),Ot=n=>n.callWS({type:"techdoc/metric_catalogue"}),Ut=(n,e)=>n.callWS({type:"techdoc/inspection_list",plant_id:e}),Nt=(n,e,t,s,i)=>n.callWS({type:"techdoc/inspection_create",plant_id:e,date:t,inspection_type:s,inspector:i}),Dt=(n,e)=>n.callWS({type:"techdoc/inspection_complete",inspection_id:e}),Q=(n,e,t)=>n.callWS({type:"techdoc/finding_list",plant_id:e,status:t}),Lt=(n,e,t,s,i)=>n.callWS({type:"techdoc/finding_create",plant_id:e,description:t,date:s,priority:i}),jt=(n,e,t,s)=>n.callWS({type:"techdoc/finding_update_status",finding_id:e,status:t,resolved_at:s}),zt=(n,e)=>n.callWS({type:"techdoc/sensor_mapping_list",plant_id:e}),Ft=(n,e,t,s,i)=>n.callWS({type:"techdoc/sensor_mapping_upsert",plant_id:e,metric_key:t,entity_id:s,unit:i}),Wt=(n,e)=>n.callWS({type:"techdoc/sensor_mapping_delete",mapping_id:e}),qt=(n,e,t)=>n.callWS({type:"techdoc/plant_metric_yearly",plant_id:e,metric_key:t}),X=(n,e,t)=>n.callWS({type:"techdoc/anomaly_list",plant_id:e,status:t}),Bt=(n,e,t)=>n.callWS({type:"techdoc/anomaly_update_status",anomaly_id:e,status:t}),Kt=(n,e)=>n.callWS({type:"techdoc/document_list",plant_id:e}),Yt=(n,e)=>n.callWS({type:"techdoc/report_generate_inspection",inspection_id:e}),Vt=(n,e)=>n.callWS({type:"techdoc/report_generate_annual",year:e});async function Jt(n,e,t,s){let i=new FormData;i.append("file",t),i.append("type",s||"Sonstiges"),i.append("plant_id",String(e));let r=await fetch("/api/techdoc/documents",{method:"POST",headers:{Authorization:`Bearer ${n.auth.data.access_token}`},body:i});if(!r.ok)throw new Error(`Upload fehlgeschlagen (${r.status})`);return r.json()}var ue={ok:"\u{1F7E2}",info:"\u26AA",niedrig:"\u{1F535}",mittel:"\u{1F7E1}",hoch:"\u{1F7E0}",kritisch:"\u{1F534}",due:"\u{1F7E1}",overdue:"\u{1F534}"},R=class extends b{constructor(){super(...arguments);this.status="info";this.label=""}render(){return o`
      <span class="badge ${this.status}">${ue[this.status]??""} ${this.label}</span>
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
  `,l([u()],R.prototype,"status",2),l([u()],R.prototype,"label",2),R=l([$("techdoc-status-badge")],R);function me(n){let e=new Date().toISOString().slice(0,10);return n.next_inspection&&n.next_inspection<e?o`<techdoc-status-badge status="overdue" label="Prüfung überfällig"></techdoc-status-badge>`:n.status==="kritisch"?o`<techdoc-status-badge status="kritisch" label="Kritisch"></techdoc-status-badge>`:n.status==="auffaellig"?o`<techdoc-status-badge status="hoch" label="Auffällig"></techdoc-status-badge>`:o`<techdoc-status-badge status="ok" label="OK"></techdoc-status-badge>`}var A=class extends b{constructor(){super(...arguments);this.plants=[];this.plantTypes=[];this.selectedPlantId=null;this._editingPlantId=null}_plantTypeName(t){return this.plantTypes.find(s=>s.id===t)?.name??`Typ ${t}`}async _handleCreateSubmit(t){t.preventDefault();let s=t.target;await f(this,async()=>{let i=s.elements.namedItem("name").value.trim(),r=s.elements.namedItem("plant_type_id").value;if(!i)throw new Error("Bitte einen Namen f\xFCr die Anlage eingeben.");if(!r)throw new Error("Bitte einen Anlagentyp ausw\xE4hlen.");await It(this.hass,i,parseInt(r,10)),s.reset(),this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}_select(t){this.dispatchEvent(new CustomEvent("plant-select",{detail:{id:t},bubbles:!0,composed:!0}))}_startEdit(t,s){t.stopPropagation(),this._editingPlantId=s}_cancelEdit(t){t.stopPropagation(),this._editingPlantId=null}async _handleEditSubmit(t,s){t.preventDefault(),t.stopPropagation();let i=t.target;await f(this,async()=>{let r=i.elements.namedItem("name").value.trim(),a=i.elements.namedItem("plant_type_id").value;if(!r)throw new Error("Bitte einen Namen f\xFCr die Anlage eingeben.");await Rt(this.hass,s,{name:r,plant_type_id:parseInt(a,10)}),this._editingPlantId=null,this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}async _handleDelete(t,s){t.stopPropagation(),confirm(`Anlage "${s.name}" wirklich l\xF6schen? Damit werden auch alle zugeh\xF6rigen Pr\xFCfungen, M\xE4ngel, Dokumente und Sensor-Zuordnungen unwiderruflich gel\xF6scht.`)&&await f(this,async()=>{await Tt(this.hass,s.id),this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}_renderPlantRow(t){return this._editingPlantId===t.id?o`
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
          ${me(t)}
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
    `}};A.styles=P,l([u({attribute:!1})],A.prototype,"hass",2),l([u({attribute:!1})],A.prototype,"plants",2),l([u({attribute:!1})],A.prototype,"plantTypes",2),l([u({type:Number})],A.prototype,"selectedPlantId",2),l([m()],A.prototype,"_editingPlantId",2),A=l([$("techdoc-plant-list")],A);function ht(n){n.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))}var v=class extends b{constructor(){super(...arguments);this.metricCatalogue={};this.plantTypeKey="";this._inspections=[];this._findings=[];this._sensorMappings=[];this._anomalies=[];this._documents=[];this._yearlyTotals=null;this._yearlyTotalsMetricKey=null}willUpdate(t){if(t.has("plant")&&this.plant){let s=t.get("plant");(!s||s.id!==this.plant.id)&&(this._yearlyTotals=null,this._yearlyTotalsMetricKey=null,this._load())}}async _load(){let t=this.plant.id,[s,i,r,a,p]=await Promise.all([Ut(this.hass,t),Q(this.hass,t),zt(this.hass,t),X(this.hass,t,"offen"),Kt(this.hass,t)]);this._inspections=s,this._findings=i,this._sensorMappings=r,this._anomalies=a,this._documents=p}async _handleCreateInspection(t){t.preventDefault();let s=t.target;await f(this,async()=>{let i=s.elements.namedItem("type").value.trim()||"sonstige",r=s.elements.namedItem("inspector").value.trim();await Nt(this.hass,this.plant.id,new Date().toISOString().slice(0,10),i,r||void 0),s.reset(),await this._load(),ht(this)})}async _handleCompleteInspection(t){await f(this,async()=>{await Dt(this.hass,t),await this._load(),ht(this)})}async _handleGenerateReport(t){await f(this,async()=>{await Yt(this.hass,t),await this._load()})}async _handleCreateFinding(t){t.preventDefault();let s=t.target;await f(this,async()=>{let i=s.elements.namedItem("description").value.trim(),r=s.elements.namedItem("priority").value;if(!i)throw new Error("Bitte eine Beschreibung f\xFCr den Mangel eingeben.");await Lt(this.hass,this.plant.id,i,new Date().toISOString().slice(0,10),r),s.reset(),await this._load(),ht(this)})}async _handleAddSensorMapping(t){t.preventDefault();let s=t.target;await f(this,async()=>{let i=s.elements.namedItem("metric_key").value.trim(),r=s.elements.namedItem("entity_id").value.trim();if(!i||!r)throw new Error("Bitte Kennzahl und Entity-ID angeben.");let a=this._currentMetricOptions().find(p=>p.key===i);await Ft(this.hass,this.plant.id,i,r,a?.unit??void 0),s.reset(),await this._load()})}async _handleDeleteSensorMapping(t){await f(this,async()=>{await Wt(this.hass,t),await this._load()})}async _handleShowYearly(t){await f(this,async()=>{this._yearlyTotalsMetricKey=t,this._yearlyTotals=await qt(this.hass,this.plant.id,t)})}async _handleAnomalyStatus(t,s){await f(this,async()=>{await Bt(this.hass,t,s),await this._load()})}async _handleUpload(t){t.preventDefault();let s=t.target;await f(this,async()=>{let i=s.elements.namedItem("file"),r=s.elements.namedItem("doc_type").value,a=i.files?.[0];if(!a)throw new Error("Bitte eine Datei ausw\xE4hlen.");await Jt(this.hass,this.plant.id,a,r),s.reset(),await this._load()})}_currentMetricOptions(){return this.metricCatalogue[this.plantTypeKey]??[]}render(){return o`
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
            ${t.map(s=>o`<option value=${s.key}>${s.name}</option>`)}
          </datalist>
          <input name="entity_id" placeholder="z. B. sensor.pv_jahresertrag" required />
          <button type="submit">Zuordnen</button>
        </form>
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
    `:o`<p class="empty">Keine Daten für ${this._yearlyTotalsMetricKey} verfügbar.</p>`}_renderDocuments(){return o`
      <div class="card">
        <h2>Dokumente</h2>
        ${this._documents.length?this._documents.map(t=>o`
                <div class="row">
                  <a href="/api/techdoc/documents/${t.id}" target="_blank">${t.type}: ${t.filename}</a>
                </div>
              `):o`<p class="empty">Noch keine Dokumente.</p>`}
        <form class="inline" @submit=${this._handleUpload}>
          <input name="doc_type" placeholder="Dokumenttyp (z. B. Datenblatt)" />
          <input name="file" type="file" required />
          <button type="submit">Hochladen</button>
        </form>
      </div>
    `}};v.styles=P,l([u({attribute:!1})],v.prototype,"hass",2),l([u({attribute:!1})],v.prototype,"plant",2),l([u({attribute:!1})],v.prototype,"metricCatalogue",2),l([u()],v.prototype,"plantTypeKey",2),l([m()],v.prototype,"_inspections",2),l([m()],v.prototype,"_findings",2),l([m()],v.prototype,"_sensorMappings",2),l([m()],v.prototype,"_anomalies",2),l([m()],v.prototype,"_documents",2),l([m()],v.prototype,"_yearlyTotals",2),l([m()],v.prototype,"_yearlyTotalsMetricKey",2),v=l([$("techdoc-plant-detail")],v);var M=class extends b{constructor(){super(...arguments);this.findings=[];this.plants=[]}_plantName(t){return this.plants.find(s=>s.id===t)?.name??`Anlage ${t}`}async _close(t){await f(this,async()=>{await jt(this.hass,t,"erledigt",new Date().toISOString().slice(0,10)),this.dispatchEvent(new CustomEvent("techdoc-changed",{bubbles:!0,composed:!0}))})}render(){let t=this.findings.filter(s=>s.status==="offen");return o`
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
    `}};M.styles=P,l([u({attribute:!1})],M.prototype,"hass",2),l([u({attribute:!1})],M.prototype,"findings",2),l([u({attribute:!1})],M.prototype,"plants",2),M=l([$("techdoc-findings-overview")],M);var _=class extends b{constructor(){super(...arguments);this.narrow=!1;this._tab="anlagen";this._plantTypes=[];this._plants=[];this._findings=[];this._anomalies=[];this._metricCatalogue={};this._selectedPlantId=null;this._lastAnnualReportDocumentId=null;this._loaded=!1;this._errorMessage=null}updated(t){t.has("hass")&&this.hass&&!this._loaded&&(this._loaded=!0,this._loadOverview())}async _loadOverview(){let[t,s,i,r,a]=await Promise.all([kt(this.hass),Ht(this.hass),Q(this.hass),X(this.hass,void 0,"offen"),Ot(this.hass)]);this._plantTypes=t,this._plants=s,this._findings=i,this._anomalies=r,this._metricCatalogue=a}_onPlantSelect(t){this._selectedPlantId=t.detail.id}async _onChanged(){await this._loadOverview()}async _handleGenerateAnnualReport(){await f(this,async()=>{let t=await Vt(this.hass,new Date().getFullYear());this._lastAnnualReportDocumentId=t.document_id})}_onError(t){this._errorMessage=t.detail.message}_selectedPlant(){return this._plants.find(t=>t.id===this._selectedPlantId)}_selectedPlantTypeKey(){let t=this._selectedPlant();return t?this._plantTypes.find(s=>s.id===t.plant_type_id)?.key??"":""}render(){let t=this._findings.filter(s=>s.status==="offen").length;return o`
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
    `}};_.styles=P,l([u({attribute:!1})],_.prototype,"hass",2),l([u({type:Boolean})],_.prototype,"narrow",2),l([m()],_.prototype,"_tab",2),l([m()],_.prototype,"_plantTypes",2),l([m()],_.prototype,"_plants",2),l([m()],_.prototype,"_findings",2),l([m()],_.prototype,"_anomalies",2),l([m()],_.prototype,"_metricCatalogue",2),l([m()],_.prototype,"_selectedPlantId",2),l([m()],_.prototype,"_lastAnnualReportDocumentId",2),l([m()],_.prototype,"_loaded",2),l([m()],_.prototype,"_errorMessage",2),_=l([$("techdoc-panel")],_);export{_ as TechdocPanel};
