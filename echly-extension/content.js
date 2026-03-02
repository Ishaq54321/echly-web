"use strict";(()=>{var cD=Object.create;var vm=Object.defineProperty;var dD=Object.getOwnPropertyDescriptor;var fD=Object.getOwnPropertyNames;var hD=Object.getPrototypeOf,pD=Object.prototype.hasOwnProperty;var mD=(t,e)=>()=>(t&&(e=t(t=0)),e);var Qn=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),gD=(t,e)=>{for(var n in e)vm(t,n,{get:e[n],enumerable:!0})},yD=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of fD(e))!pD.call(t,r)&&r!==n&&vm(t,r,{get:()=>e[r],enumerable:!(a=dD(e,r))||a.enumerable});return t};var _e=(t,e,n)=>(n=t!=null?cD(hD(t)):{},yD(e||!t||!t.__esModule?vm(n,"default",{value:t,enumerable:!0}):n,t));var Yv=Qn($=>{"use strict";var Cm=Symbol.for("react.transitional.element"),_D=Symbol.for("react.portal"),ID=Symbol.for("react.fragment"),TD=Symbol.for("react.strict_mode"),SD=Symbol.for("react.profiler"),vD=Symbol.for("react.consumer"),ED=Symbol.for("react.context"),wD=Symbol.for("react.forward_ref"),CD=Symbol.for("react.suspense"),AD=Symbol.for("react.memo"),Hv=Symbol.for("react.lazy"),bD=Symbol.for("react.activity"),Fv=Symbol.iterator;function LD(t){return t===null||typeof t!="object"?null:(t=Fv&&t[Fv]||t["@@iterator"],typeof t=="function"?t:null)}var Gv={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},jv=Object.assign,Wv={};function ps(t,e,n){this.props=t,this.context=e,this.refs=Wv,this.updater=n||Gv}ps.prototype.isReactComponent={};ps.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};ps.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Kv(){}Kv.prototype=ps.prototype;function Am(t,e,n){this.props=t,this.context=e,this.refs=Wv,this.updater=n||Gv}var bm=Am.prototype=new Kv;bm.constructor=Am;jv(bm,ps.prototype);bm.isPureReactComponent=!0;var Bv=Array.isArray;function wm(){}var Le={H:null,A:null,T:null,S:null},Qv=Object.prototype.hasOwnProperty;function Lm(t,e,n){var a=n.ref;return{$$typeof:Cm,type:t,key:e,ref:a!==void 0?a:null,props:n}}function RD(t,e){return Lm(t.type,e,t.props)}function Rm(t){return typeof t=="object"&&t!==null&&t.$$typeof===Cm}function xD(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var qv=/\/+/g;function Em(t,e){return typeof t=="object"&&t!==null&&t.key!=null?xD(""+t.key):e.toString(36)}function kD(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(wm,wm):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function hs(t,e,n,a,r){var i=typeof t;(i==="undefined"||i==="boolean")&&(t=null);var s=!1;if(t===null)s=!0;else switch(i){case"bigint":case"string":case"number":s=!0;break;case"object":switch(t.$$typeof){case Cm:case _D:s=!0;break;case Hv:return s=t._init,hs(s(t._payload),e,n,a,r)}}if(s)return r=r(t),s=a===""?"."+Em(t,0):a,Bv(r)?(n="",s!=null&&(n=s.replace(qv,"$&/")+"/"),hs(r,e,n,"",function(c){return c})):r!=null&&(Rm(r)&&(r=RD(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(qv,"$&/")+"/")+s)),e.push(r)),1;s=0;var u=a===""?".":a+":";if(Bv(t))for(var l=0;l<t.length;l++)a=t[l],i=u+Em(a,l),s+=hs(a,e,n,i,r);else if(l=LD(t),typeof l=="function")for(t=l.call(t),l=0;!(a=t.next()).done;)a=a.value,i=u+Em(a,l++),s+=hs(a,e,n,i,r);else if(i==="object"){if(typeof t.then=="function")return hs(kD(t),e,n,a,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return s}function cd(t,e,n){if(t==null)return t;var a=[],r=0;return hs(t,a,"","",function(i){return e.call(n,i,r++)}),a}function DD(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var zv=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},PD={map:cd,forEach:function(t,e,n){cd(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return cd(t,function(){e++}),e},toArray:function(t){return cd(t,function(e){return e})||[]},only:function(t){if(!Rm(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};$.Activity=bD;$.Children=PD;$.Component=ps;$.Fragment=ID;$.Profiler=SD;$.PureComponent=Am;$.StrictMode=TD;$.Suspense=CD;$.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Le;$.__COMPILER_RUNTIME={__proto__:null,c:function(t){return Le.H.useMemoCache(t)}};$.cache=function(t){return function(){return t.apply(null,arguments)}};$.cacheSignal=function(){return null};$.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var a=jv({},t.props),r=t.key;if(e!=null)for(i in e.key!==void 0&&(r=""+e.key),e)!Qv.call(e,i)||i==="key"||i==="__self"||i==="__source"||i==="ref"&&e.ref===void 0||(a[i]=e[i]);var i=arguments.length-2;if(i===1)a.children=n;else if(1<i){for(var s=Array(i),u=0;u<i;u++)s[u]=arguments[u+2];a.children=s}return Lm(t.type,r,a)};$.createContext=function(t){return t={$$typeof:ED,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:vD,_context:t},t};$.createElement=function(t,e,n){var a,r={},i=null;if(e!=null)for(a in e.key!==void 0&&(i=""+e.key),e)Qv.call(e,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(r[a]=e[a]);var s=arguments.length-2;if(s===1)r.children=n;else if(1<s){for(var u=Array(s),l=0;l<s;l++)u[l]=arguments[l+2];r.children=u}if(t&&t.defaultProps)for(a in s=t.defaultProps,s)r[a]===void 0&&(r[a]=s[a]);return Lm(t,i,r)};$.createRef=function(){return{current:null}};$.forwardRef=function(t){return{$$typeof:wD,render:t}};$.isValidElement=Rm;$.lazy=function(t){return{$$typeof:Hv,_payload:{_status:-1,_result:t},_init:DD}};$.memo=function(t,e){return{$$typeof:AD,type:t,compare:e===void 0?null:e}};$.startTransition=function(t){var e=Le.T,n={};Le.T=n;try{var a=t(),r=Le.S;r!==null&&r(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(wm,zv)}catch(i){zv(i)}finally{e!==null&&n.types!==null&&(e.types=n.types),Le.T=e}};$.unstable_useCacheRefresh=function(){return Le.H.useCacheRefresh()};$.use=function(t){return Le.H.use(t)};$.useActionState=function(t,e,n){return Le.H.useActionState(t,e,n)};$.useCallback=function(t,e){return Le.H.useCallback(t,e)};$.useContext=function(t){return Le.H.useContext(t)};$.useDebugValue=function(){};$.useDeferredValue=function(t,e){return Le.H.useDeferredValue(t,e)};$.useEffect=function(t,e){return Le.H.useEffect(t,e)};$.useEffectEvent=function(t){return Le.H.useEffectEvent(t)};$.useId=function(){return Le.H.useId()};$.useImperativeHandle=function(t,e,n){return Le.H.useImperativeHandle(t,e,n)};$.useInsertionEffect=function(t,e){return Le.H.useInsertionEffect(t,e)};$.useLayoutEffect=function(t,e){return Le.H.useLayoutEffect(t,e)};$.useMemo=function(t,e){return Le.H.useMemo(t,e)};$.useOptimistic=function(t,e){return Le.H.useOptimistic(t,e)};$.useReducer=function(t,e,n){return Le.H.useReducer(t,e,n)};$.useRef=function(t){return Le.H.useRef(t)};$.useState=function(t){return Le.H.useState(t)};$.useSyncExternalStore=function(t,e,n){return Le.H.useSyncExternalStore(t,e,n)};$.useTransition=function(){return Le.H.useTransition()};$.version="19.2.3"});var Pn=Qn((dq,Xv)=>{"use strict";Xv.exports=Yv()});var sE=Qn(De=>{"use strict";function Pm(t,e){var n=t.length;t.push(e);e:for(;0<n;){var a=n-1>>>1,r=t[a];if(0<dd(r,e))t[a]=e,t[n]=r,n=a;else break e}}function Yn(t){return t.length===0?null:t[0]}function hd(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var a=0,r=t.length,i=r>>>1;a<i;){var s=2*(a+1)-1,u=t[s],l=s+1,c=t[l];if(0>dd(u,n))l<r&&0>dd(c,u)?(t[a]=c,t[l]=n,a=l):(t[a]=u,t[s]=n,a=s);else if(l<r&&0>dd(c,n))t[a]=c,t[l]=n,a=l;else break e}}return e}function dd(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}De.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?($v=performance,De.unstable_now=function(){return $v.now()}):(xm=Date,Jv=xm.now(),De.unstable_now=function(){return xm.now()-Jv});var $v,xm,Jv,Ea=[],Sr=[],OD=1,gn=null,kt=3,Om=!1,yu=!1,_u=!1,Nm=!1,tE=typeof setTimeout=="function"?setTimeout:null,nE=typeof clearTimeout=="function"?clearTimeout:null,Zv=typeof setImmediate<"u"?setImmediate:null;function fd(t){for(var e=Yn(Sr);e!==null;){if(e.callback===null)hd(Sr);else if(e.startTime<=t)hd(Sr),e.sortIndex=e.expirationTime,Pm(Ea,e);else break;e=Yn(Sr)}}function Mm(t){if(_u=!1,fd(t),!yu)if(Yn(Ea)!==null)yu=!0,gs||(gs=!0,ms());else{var e=Yn(Sr);e!==null&&Um(Mm,e.startTime-t)}}var gs=!1,Iu=-1,aE=5,rE=-1;function iE(){return Nm?!0:!(De.unstable_now()-rE<aE)}function km(){if(Nm=!1,gs){var t=De.unstable_now();rE=t;var e=!0;try{e:{yu=!1,_u&&(_u=!1,nE(Iu),Iu=-1),Om=!0;var n=kt;try{t:{for(fd(t),gn=Yn(Ea);gn!==null&&!(gn.expirationTime>t&&iE());){var a=gn.callback;if(typeof a=="function"){gn.callback=null,kt=gn.priorityLevel;var r=a(gn.expirationTime<=t);if(t=De.unstable_now(),typeof r=="function"){gn.callback=r,fd(t),e=!0;break t}gn===Yn(Ea)&&hd(Ea),fd(t)}else hd(Ea);gn=Yn(Ea)}if(gn!==null)e=!0;else{var i=Yn(Sr);i!==null&&Um(Mm,i.startTime-t),e=!1}}break e}finally{gn=null,kt=n,Om=!1}e=void 0}}finally{e?ms():gs=!1}}}var ms;typeof Zv=="function"?ms=function(){Zv(km)}:typeof MessageChannel<"u"?(Dm=new MessageChannel,eE=Dm.port2,Dm.port1.onmessage=km,ms=function(){eE.postMessage(null)}):ms=function(){tE(km,0)};var Dm,eE;function Um(t,e){Iu=tE(function(){t(De.unstable_now())},e)}De.unstable_IdlePriority=5;De.unstable_ImmediatePriority=1;De.unstable_LowPriority=4;De.unstable_NormalPriority=3;De.unstable_Profiling=null;De.unstable_UserBlockingPriority=2;De.unstable_cancelCallback=function(t){t.callback=null};De.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):aE=0<t?Math.floor(1e3/t):5};De.unstable_getCurrentPriorityLevel=function(){return kt};De.unstable_next=function(t){switch(kt){case 1:case 2:case 3:var e=3;break;default:e=kt}var n=kt;kt=e;try{return t()}finally{kt=n}};De.unstable_requestPaint=function(){Nm=!0};De.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=kt;kt=t;try{return e()}finally{kt=n}};De.unstable_scheduleCallback=function(t,e,n){var a=De.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:OD++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>a?(t.sortIndex=n,Pm(Sr,t),Yn(Ea)===null&&t===Yn(Sr)&&(_u?(nE(Iu),Iu=-1):_u=!0,Um(Mm,n-a))):(t.sortIndex=r,Pm(Ea,t),yu||Om||(yu=!0,gs||(gs=!0,ms()))),t};De.unstable_shouldYield=iE;De.unstable_wrapCallback=function(t){var e=kt;return function(){var n=kt;kt=e;try{return t.apply(this,arguments)}finally{kt=n}}}});var uE=Qn((hq,oE)=>{"use strict";oE.exports=sE()});var cE=Qn(Ut=>{"use strict";var ND=Pn();function lE(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function vr(){}var Mt={d:{f:vr,r:function(){throw Error(lE(522))},D:vr,C:vr,L:vr,m:vr,X:vr,S:vr,M:vr},p:0,findDOMNode:null},MD=Symbol.for("react.portal");function UD(t,e,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:MD,key:a==null?null:""+a,children:t,containerInfo:e,implementation:n}}var Tu=ND.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function pd(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}Ut.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Mt;Ut.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(lE(299));return UD(t,e,null,n)};Ut.flushSync=function(t){var e=Tu.T,n=Mt.p;try{if(Tu.T=null,Mt.p=2,t)return t()}finally{Tu.T=e,Mt.p=n,Mt.d.f()}};Ut.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,Mt.d.C(t,e))};Ut.prefetchDNS=function(t){typeof t=="string"&&Mt.d.D(t)};Ut.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,a=pd(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,i=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?Mt.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:a,integrity:r,fetchPriority:i}):n==="script"&&Mt.d.X(t,{crossOrigin:a,integrity:r,fetchPriority:i,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};Ut.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=pd(e.as,e.crossOrigin);Mt.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&Mt.d.M(t)};Ut.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,a=pd(n,e.crossOrigin);Mt.d.L(t,n,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};Ut.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=pd(e.as,e.crossOrigin);Mt.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else Mt.d.m(t)};Ut.requestFormReset=function(t){Mt.d.r(t)};Ut.unstable_batchedUpdates=function(t,e){return t(e)};Ut.useFormState=function(t,e,n){return Tu.H.useFormState(t,e,n)};Ut.useFormStatus=function(){return Tu.H.useHostTransitionStatus()};Ut.version="19.2.3"});var Vm=Qn((mq,fE)=>{"use strict";function dE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(dE)}catch(t){console.error(t)}}dE(),fE.exports=cE()});var wb=Qn(Bf=>{"use strict";var ut=uE(),Vw=Pn(),VD=Vm();function O(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Fw(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function sl(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Bw(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function qw(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function hE(t){if(sl(t)!==t)throw Error(O(188))}function FD(t){var e=t.alternate;if(!e){if(e=sl(t),e===null)throw Error(O(188));return e!==t?null:t}for(var n=t,a=e;;){var r=n.return;if(r===null)break;var i=r.alternate;if(i===null){if(a=r.return,a!==null){n=a;continue}break}if(r.child===i.child){for(i=r.child;i;){if(i===n)return hE(r),t;if(i===a)return hE(r),e;i=i.sibling}throw Error(O(188))}if(n.return!==a.return)n=r,a=i;else{for(var s=!1,u=r.child;u;){if(u===n){s=!0,n=r,a=i;break}if(u===a){s=!0,a=r,n=i;break}u=u.sibling}if(!s){for(u=i.child;u;){if(u===n){s=!0,n=i,a=r;break}if(u===a){s=!0,a=i,n=r;break}u=u.sibling}if(!s)throw Error(O(189))}}if(n.alternate!==a)throw Error(O(190))}if(n.tag!==3)throw Error(O(188));return n.stateNode.current===n?t:e}function zw(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=zw(t),e!==null)return e;t=t.sibling}return null}var ke=Object.assign,BD=Symbol.for("react.element"),md=Symbol.for("react.transitional.element"),Lu=Symbol.for("react.portal"),vs=Symbol.for("react.fragment"),Hw=Symbol.for("react.strict_mode"),_g=Symbol.for("react.profiler"),Gw=Symbol.for("react.consumer"),ka=Symbol.for("react.context"),hy=Symbol.for("react.forward_ref"),Ig=Symbol.for("react.suspense"),Tg=Symbol.for("react.suspense_list"),py=Symbol.for("react.memo"),Er=Symbol.for("react.lazy");Symbol.for("react.scope");var Sg=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var qD=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var pE=Symbol.iterator;function Su(t){return t===null||typeof t!="object"?null:(t=pE&&t[pE]||t["@@iterator"],typeof t=="function"?t:null)}var zD=Symbol.for("react.client.reference");function vg(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===zD?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case vs:return"Fragment";case _g:return"Profiler";case Hw:return"StrictMode";case Ig:return"Suspense";case Tg:return"SuspenseList";case Sg:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case Lu:return"Portal";case ka:return t.displayName||"Context";case Gw:return(t._context.displayName||"Context")+".Consumer";case hy:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case py:return e=t.displayName||null,e!==null?e:vg(t.type)||"Memo";case Er:e=t._payload,t=t._init;try{return vg(t(e))}catch{}}return null}var Ru=Array.isArray,Q=Vw.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,fe=VD.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ii={pending:!1,data:null,method:null,action:null},Eg=[],Es=-1;function ea(t){return{current:t}}function gt(t){0>Es||(t.current=Eg[Es],Eg[Es]=null,Es--)}function we(t,e){Es++,Eg[Es]=t.current,t.current=e}var Zn=ea(null),Wu=ea(null),Or=ea(null),Qd=ea(null);function Yd(t,e){switch(we(Or,e),we(Wu,t),we(Zn,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?Sw(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=Sw(e),t=cb(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}gt(Zn),we(Zn,t)}function qs(){gt(Zn),gt(Wu),gt(Or)}function wg(t){t.memoizedState!==null&&we(Qd,t);var e=Zn.current,n=cb(e,t.type);e!==n&&(we(Wu,t),we(Zn,n))}function Xd(t){Wu.current===t&&(gt(Zn),gt(Wu)),Qd.current===t&&(gt(Qd),al._currentValue=Ii)}var Fm,mE;function mi(t){if(Fm===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Fm=e&&e[1]||"",mE=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Fm+t+mE}var Bm=!1;function qm(t,e){if(!t||Bm)return"";Bm=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(e){var m=function(){throw Error()};if(Object.defineProperty(m.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(m,[])}catch(_){var p=_}Reflect.construct(t,[],m)}else{try{m.call()}catch(_){p=_}t.call(m.prototype)}}else{try{throw Error()}catch(_){p=_}(m=t())&&typeof m.catch=="function"&&m.catch(function(){})}}catch(_){if(_&&p&&typeof _.stack=="string")return[_.stack,p.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var i=a.DetermineComponentFrameRoot(),s=i[0],u=i[1];if(s&&u){var l=s.split(`
`),c=u.split(`
`);for(r=a=0;a<l.length&&!l[a].includes("DetermineComponentFrameRoot");)a++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(a===l.length||r===c.length)for(a=l.length-1,r=c.length-1;1<=a&&0<=r&&l[a]!==c[r];)r--;for(;1<=a&&0<=r;a--,r--)if(l[a]!==c[r]){if(a!==1||r!==1)do if(a--,r--,0>r||l[a]!==c[r]){var f=`
`+l[a].replace(" at new "," at ");return t.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",t.displayName)),f}while(1<=a&&0<=r);break}}}finally{Bm=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?mi(n):""}function HD(t,e){switch(t.tag){case 26:case 27:case 5:return mi(t.type);case 16:return mi("Lazy");case 13:return t.child!==e&&e!==null?mi("Suspense Fallback"):mi("Suspense");case 19:return mi("SuspenseList");case 0:case 15:return qm(t.type,!1);case 11:return qm(t.type.render,!1);case 1:return qm(t.type,!0);case 31:return mi("Activity");default:return""}}function gE(t){try{var e="",n=null;do e+=HD(t,n),n=t,t=t.return;while(t);return e}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var Cg=Object.prototype.hasOwnProperty,my=ut.unstable_scheduleCallback,zm=ut.unstable_cancelCallback,GD=ut.unstable_shouldYield,jD=ut.unstable_requestPaint,rn=ut.unstable_now,WD=ut.unstable_getCurrentPriorityLevel,jw=ut.unstable_ImmediatePriority,Ww=ut.unstable_UserBlockingPriority,$d=ut.unstable_NormalPriority,KD=ut.unstable_LowPriority,Kw=ut.unstable_IdlePriority,QD=ut.log,YD=ut.unstable_setDisableYieldValue,ol=null,sn=null;function Rr(t){if(typeof QD=="function"&&YD(t),sn&&typeof sn.setStrictMode=="function")try{sn.setStrictMode(ol,t)}catch{}}var on=Math.clz32?Math.clz32:JD,XD=Math.log,$D=Math.LN2;function JD(t){return t>>>=0,t===0?32:31-(XD(t)/$D|0)|0}var gd=256,yd=262144,_d=4194304;function gi(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function wf(t,e,n){var a=t.pendingLanes;if(a===0)return 0;var r=0,i=t.suspendedLanes,s=t.pingedLanes;t=t.warmLanes;var u=a&134217727;return u!==0?(a=u&~i,a!==0?r=gi(a):(s&=u,s!==0?r=gi(s):n||(n=u&~t,n!==0&&(r=gi(n))))):(u=a&~i,u!==0?r=gi(u):s!==0?r=gi(s):n||(n=a&~t,n!==0&&(r=gi(n)))),r===0?0:e!==0&&e!==r&&!(e&i)&&(i=r&-r,n=e&-e,i>=n||i===32&&(n&4194048)!==0)?e:r}function ul(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function ZD(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Qw(){var t=_d;return _d<<=1,!(_d&62914560)&&(_d=4194304),t}function Hm(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function ll(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function eP(t,e,n,a,r,i){var s=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var u=t.entanglements,l=t.expirationTimes,c=t.hiddenUpdates;for(n=s&~n;0<n;){var f=31-on(n),m=1<<f;u[f]=0,l[f]=-1;var p=c[f];if(p!==null)for(c[f]=null,f=0;f<p.length;f++){var _=p[f];_!==null&&(_.lane&=-536870913)}n&=~m}a!==0&&Yw(t,a,0),i!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=i&~(s&~e))}function Yw(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var a=31-on(e);t.entangledLanes|=e,t.entanglements[a]=t.entanglements[a]|1073741824|n&261930}function Xw(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var a=31-on(n),r=1<<a;r&e|t[a]&e&&(t[a]|=e),n&=~r}}function $w(t,e){var n=e&-e;return n=n&42?1:gy(n),n&(t.suspendedLanes|e)?0:n}function gy(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function yy(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function Jw(){var t=fe.p;return t!==0?t:(t=window.event,t===void 0?32:Sb(t.type))}function yE(t,e){var n=fe.p;try{return fe.p=t,e()}finally{fe.p=n}}var Kr=Math.random().toString(36).slice(2),Et="__reactFiber$"+Kr,Kt="__reactProps$"+Kr,Js="__reactContainer$"+Kr,Ag="__reactEvents$"+Kr,tP="__reactListeners$"+Kr,nP="__reactHandles$"+Kr,_E="__reactResources$"+Kr,cl="__reactMarker$"+Kr;function _y(t){delete t[Et],delete t[Kt],delete t[Ag],delete t[tP],delete t[nP]}function ws(t){var e=t[Et];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Js]||n[Et]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Aw(t);t!==null;){if(n=t[Et])return n;t=Aw(t)}return e}t=n,n=t.parentNode}return null}function Zs(t){if(t=t[Et]||t[Js]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function xu(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(O(33))}function Os(t){var e=t[_E];return e||(e=t[_E]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function mt(t){t[cl]=!0}var Zw=new Set,eC={};function Ri(t,e){zs(t,e),zs(t+"Capture",e)}function zs(t,e){for(eC[t]=e,t=0;t<e.length;t++)Zw.add(e[t])}var aP=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),IE={},TE={};function rP(t){return Cg.call(TE,t)?!0:Cg.call(IE,t)?!1:aP.test(t)?TE[t]=!0:(IE[t]=!0,!1)}function Pd(t,e,n){if(rP(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var a=e.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Id(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function wa(t,e,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+a)}}function _n(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function tC(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function iP(t,e,n){var a=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var r=a.get,i=a.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(s){n=""+s,i.call(this,s)}}),Object.defineProperty(t,e,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(s){n=""+s},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function bg(t){if(!t._valueTracker){var e=tC(t)?"checked":"value";t._valueTracker=iP(t,e,""+t[e])}}function nC(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),a="";return t&&(a=tC(t)?t.checked?"true":"false":t.value),t=a,t!==n?(e.setValue(t),!0):!1}function Jd(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var sP=/[\n"\\]/g;function Sn(t){return t.replace(sP,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function Lg(t,e,n,a,r,i,s,u){t.name="",s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?t.type=s:t.removeAttribute("type"),e!=null?s==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+_n(e)):t.value!==""+_n(e)&&(t.value=""+_n(e)):s!=="submit"&&s!=="reset"||t.removeAttribute("value"),e!=null?Rg(t,s,_n(e)):n!=null?Rg(t,s,_n(n)):a!=null&&t.removeAttribute("value"),r==null&&i!=null&&(t.defaultChecked=!!i),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.name=""+_n(u):t.removeAttribute("name")}function aC(t,e,n,a,r,i,s,u){if(i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.type=i),e!=null||n!=null){if(!(i!=="submit"&&i!=="reset"||e!=null)){bg(t);return}n=n!=null?""+_n(n):"",e=e!=null?""+_n(e):n,u||e===t.value||(t.value=e),t.defaultValue=e}a=a??r,a=typeof a!="function"&&typeof a!="symbol"&&!!a,t.checked=u?t.checked:!!a,t.defaultChecked=!!a,s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.name=s),bg(t)}function Rg(t,e,n){e==="number"&&Jd(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function Ns(t,e,n,a){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&a&&(t[n].defaultSelected=!0)}else{for(n=""+_n(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,a&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function rC(t,e,n){if(e!=null&&(e=""+_n(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+_n(n):""}function iC(t,e,n,a){if(e==null){if(a!=null){if(n!=null)throw Error(O(92));if(Ru(a)){if(1<a.length)throw Error(O(93));a=a[0]}n=a}n==null&&(n=""),e=n}n=_n(e),t.defaultValue=n,a=t.textContent,a===n&&a!==""&&a!==null&&(t.value=a),bg(t)}function Hs(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var oP=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function SE(t,e,n){var a=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":a?t.setProperty(e,n):typeof n!="number"||n===0||oP.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function sC(t,e,n){if(e!=null&&typeof e!="object")throw Error(O(62));if(t=t.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||e!=null&&e.hasOwnProperty(a)||(a.indexOf("--")===0?t.setProperty(a,""):a==="float"?t.cssFloat="":t[a]="");for(var r in e)a=e[r],e.hasOwnProperty(r)&&n[r]!==a&&SE(t,r,a)}else for(var i in e)e.hasOwnProperty(i)&&SE(t,i,e[i])}function Iy(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var uP=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),lP=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Od(t){return lP.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function Da(){}var xg=null;function Ty(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Cs=null,Ms=null;function vE(t){var e=Zs(t);if(e&&(t=e.stateNode)){var n=t[Kt]||null;e:switch(t=e.stateNode,e.type){case"input":if(Lg(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+Sn(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var a=n[e];if(a!==t&&a.form===t.form){var r=a[Kt]||null;if(!r)throw Error(O(90));Lg(a,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)a=n[e],a.form===t.form&&nC(a)}break e;case"textarea":rC(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&Ns(t,!!n.multiple,e,!1)}}}var Gm=!1;function oC(t,e,n){if(Gm)return t(e,n);Gm=!0;try{var a=t(e);return a}finally{if(Gm=!1,(Cs!==null||Ms!==null)&&(Mf(),Cs&&(e=Cs,t=Ms,Ms=Cs=null,vE(e),t)))for(e=0;e<t.length;e++)vE(t[e])}}function Ku(t,e){var n=t.stateNode;if(n===null)return null;var a=n[Kt]||null;if(a===null)return null;n=a[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(t=t.type,a=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!a;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(O(231,e,typeof n));return n}var Ua=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),kg=!1;if(Ua)try{ys={},Object.defineProperty(ys,"passive",{get:function(){kg=!0}}),window.addEventListener("test",ys,ys),window.removeEventListener("test",ys,ys)}catch{kg=!1}var ys,xr=null,Sy=null,Nd=null;function uC(){if(Nd)return Nd;var t,e=Sy,n=e.length,a,r="value"in xr?xr.value:xr.textContent,i=r.length;for(t=0;t<n&&e[t]===r[t];t++);var s=n-t;for(a=1;a<=s&&e[n-a]===r[i-a];a++);return Nd=r.slice(t,1<a?1-a:void 0)}function Md(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Td(){return!0}function EE(){return!1}function Qt(t){function e(n,a,r,i,s){this._reactName=n,this._targetInst=r,this.type=a,this.nativeEvent=i,this.target=s,this.currentTarget=null;for(var u in t)t.hasOwnProperty(u)&&(n=t[u],this[u]=n?n(i):i[u]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Td:EE,this.isPropagationStopped=EE,this}return ke(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Td)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Td)},persist:function(){},isPersistent:Td}),e}var xi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Cf=Qt(xi),dl=ke({},xi,{view:0,detail:0}),cP=Qt(dl),jm,Wm,vu,Af=ke({},dl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:vy,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==vu&&(vu&&t.type==="mousemove"?(jm=t.screenX-vu.screenX,Wm=t.screenY-vu.screenY):Wm=jm=0,vu=t),jm)},movementY:function(t){return"movementY"in t?t.movementY:Wm}}),wE=Qt(Af),dP=ke({},Af,{dataTransfer:0}),fP=Qt(dP),hP=ke({},dl,{relatedTarget:0}),Km=Qt(hP),pP=ke({},xi,{animationName:0,elapsedTime:0,pseudoElement:0}),mP=Qt(pP),gP=ke({},xi,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),yP=Qt(gP),_P=ke({},xi,{data:0}),CE=Qt(_P),IP={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},TP={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},SP={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function vP(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=SP[t])?!!e[t]:!1}function vy(){return vP}var EP=ke({},dl,{key:function(t){if(t.key){var e=IP[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Md(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?TP[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:vy,charCode:function(t){return t.type==="keypress"?Md(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Md(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),wP=Qt(EP),CP=ke({},Af,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),AE=Qt(CP),AP=ke({},dl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:vy}),bP=Qt(AP),LP=ke({},xi,{propertyName:0,elapsedTime:0,pseudoElement:0}),RP=Qt(LP),xP=ke({},Af,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),kP=Qt(xP),DP=ke({},xi,{newState:0,oldState:0}),PP=Qt(DP),OP=[9,13,27,32],Ey=Ua&&"CompositionEvent"in window,Pu=null;Ua&&"documentMode"in document&&(Pu=document.documentMode);var NP=Ua&&"TextEvent"in window&&!Pu,lC=Ua&&(!Ey||Pu&&8<Pu&&11>=Pu),bE=" ",LE=!1;function cC(t,e){switch(t){case"keyup":return OP.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function dC(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var As=!1;function MP(t,e){switch(t){case"compositionend":return dC(e);case"keypress":return e.which!==32?null:(LE=!0,bE);case"textInput":return t=e.data,t===bE&&LE?null:t;default:return null}}function UP(t,e){if(As)return t==="compositionend"||!Ey&&cC(t,e)?(t=uC(),Nd=Sy=xr=null,As=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return lC&&e.locale!=="ko"?null:e.data;default:return null}}var VP={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function RE(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!VP[t.type]:e==="textarea"}function fC(t,e,n,a){Cs?Ms?Ms.push(a):Ms=[a]:Cs=a,e=yf(e,"onChange"),0<e.length&&(n=new Cf("onChange","change",null,n,a),t.push({event:n,listeners:e}))}var Ou=null,Qu=null;function FP(t){ob(t,0)}function bf(t){var e=xu(t);if(nC(e))return t}function xE(t,e){if(t==="change")return e}var hC=!1;Ua&&(Ua?(vd="oninput"in document,vd||(Qm=document.createElement("div"),Qm.setAttribute("oninput","return;"),vd=typeof Qm.oninput=="function"),Sd=vd):Sd=!1,hC=Sd&&(!document.documentMode||9<document.documentMode));var Sd,vd,Qm;function kE(){Ou&&(Ou.detachEvent("onpropertychange",pC),Qu=Ou=null)}function pC(t){if(t.propertyName==="value"&&bf(Qu)){var e=[];fC(e,Qu,t,Ty(t)),oC(FP,e)}}function BP(t,e,n){t==="focusin"?(kE(),Ou=e,Qu=n,Ou.attachEvent("onpropertychange",pC)):t==="focusout"&&kE()}function qP(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return bf(Qu)}function zP(t,e){if(t==="click")return bf(e)}function HP(t,e){if(t==="input"||t==="change")return bf(e)}function GP(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var ln=typeof Object.is=="function"?Object.is:GP;function Yu(t,e){if(ln(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),a=Object.keys(e);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var r=n[a];if(!Cg.call(e,r)||!ln(t[r],e[r]))return!1}return!0}function DE(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function PE(t,e){var n=DE(t);t=0;for(var a;n;){if(n.nodeType===3){if(a=t+n.textContent.length,t<=e&&a>=e)return{node:n,offset:e-t};t=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=DE(n)}}function mC(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?mC(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function gC(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=Jd(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Jd(t.document)}return e}function wy(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var jP=Ua&&"documentMode"in document&&11>=document.documentMode,bs=null,Dg=null,Nu=null,Pg=!1;function OE(t,e,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Pg||bs==null||bs!==Jd(a)||(a=bs,"selectionStart"in a&&wy(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),Nu&&Yu(Nu,a)||(Nu=a,a=yf(Dg,"onSelect"),0<a.length&&(e=new Cf("onSelect","select",null,e,n),t.push({event:e,listeners:a}),e.target=bs)))}function pi(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Ls={animationend:pi("Animation","AnimationEnd"),animationiteration:pi("Animation","AnimationIteration"),animationstart:pi("Animation","AnimationStart"),transitionrun:pi("Transition","TransitionRun"),transitionstart:pi("Transition","TransitionStart"),transitioncancel:pi("Transition","TransitionCancel"),transitionend:pi("Transition","TransitionEnd")},Ym={},yC={};Ua&&(yC=document.createElement("div").style,"AnimationEvent"in window||(delete Ls.animationend.animation,delete Ls.animationiteration.animation,delete Ls.animationstart.animation),"TransitionEvent"in window||delete Ls.transitionend.transition);function ki(t){if(Ym[t])return Ym[t];if(!Ls[t])return t;var e=Ls[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in yC)return Ym[t]=e[n];return t}var _C=ki("animationend"),IC=ki("animationiteration"),TC=ki("animationstart"),WP=ki("transitionrun"),KP=ki("transitionstart"),QP=ki("transitioncancel"),SC=ki("transitionend"),vC=new Map,Og="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Og.push("scrollEnd");function Mn(t,e){vC.set(t,e),Ri(e,[t])}var Zd=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},yn=[],Rs=0,Cy=0;function Lf(){for(var t=Rs,e=Cy=Rs=0;e<t;){var n=yn[e];yn[e++]=null;var a=yn[e];yn[e++]=null;var r=yn[e];yn[e++]=null;var i=yn[e];if(yn[e++]=null,a!==null&&r!==null){var s=a.pending;s===null?r.next=r:(r.next=s.next,s.next=r),a.pending=r}i!==0&&EC(n,r,i)}}function Rf(t,e,n,a){yn[Rs++]=t,yn[Rs++]=e,yn[Rs++]=n,yn[Rs++]=a,Cy|=a,t.lanes|=a,t=t.alternate,t!==null&&(t.lanes|=a)}function Ay(t,e,n,a){return Rf(t,e,n,a),ef(t)}function Di(t,e){return Rf(t,null,null,e),ef(t)}function EC(t,e,n){t.lanes|=n;var a=t.alternate;a!==null&&(a.lanes|=n);for(var r=!1,i=t.return;i!==null;)i.childLanes|=n,a=i.alternate,a!==null&&(a.childLanes|=n),i.tag===22&&(t=i.stateNode,t===null||t._visibility&1||(r=!0)),t=i,i=i.return;return t.tag===3?(i=t.stateNode,r&&e!==null&&(r=31-on(n),t=i.hiddenUpdates,a=t[r],a===null?t[r]=[e]:a.push(e),e.lane=n|536870912),i):null}function ef(t){if(50<Gu)throw Gu=0,ty=null,Error(O(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var xs={};function YP(t,e,n,a){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function nn(t,e,n,a){return new YP(t,e,n,a)}function by(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Oa(t,e){var n=t.alternate;return n===null?(n=nn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function wC(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Ud(t,e,n,a,r,i){var s=0;if(a=t,typeof t=="function")by(t)&&(s=1);else if(typeof t=="string")s=J1(t,n,Zn.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case Sg:return t=nn(31,n,e,r),t.elementType=Sg,t.lanes=i,t;case vs:return Ti(n.children,r,i,e);case Hw:s=8,r|=24;break;case _g:return t=nn(12,n,e,r|2),t.elementType=_g,t.lanes=i,t;case Ig:return t=nn(13,n,e,r),t.elementType=Ig,t.lanes=i,t;case Tg:return t=nn(19,n,e,r),t.elementType=Tg,t.lanes=i,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case ka:s=10;break e;case Gw:s=9;break e;case hy:s=11;break e;case py:s=14;break e;case Er:s=16,a=null;break e}s=29,n=Error(O(130,t===null?"null":typeof t,"")),a=null}return e=nn(s,n,e,r),e.elementType=t,e.type=a,e.lanes=i,e}function Ti(t,e,n,a){return t=nn(7,t,a,e),t.lanes=n,t}function Xm(t,e,n){return t=nn(6,t,null,e),t.lanes=n,t}function CC(t){var e=nn(18,null,null,0);return e.stateNode=t,e}function $m(t,e,n){return e=nn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var NE=new WeakMap;function vn(t,e){if(typeof t=="object"&&t!==null){var n=NE.get(t);return n!==void 0?n:(e={value:t,source:e,stack:gE(e)},NE.set(t,e),e)}return{value:t,source:e,stack:gE(e)}}var ks=[],Ds=0,tf=null,Xu=0,In=[],Tn=0,Hr=null,Xn=1,$n="";function Ra(t,e){ks[Ds++]=Xu,ks[Ds++]=tf,tf=t,Xu=e}function AC(t,e,n){In[Tn++]=Xn,In[Tn++]=$n,In[Tn++]=Hr,Hr=t;var a=Xn;t=$n;var r=32-on(a)-1;a&=~(1<<r),n+=1;var i=32-on(e)+r;if(30<i){var s=r-r%5;i=(a&(1<<s)-1).toString(32),a>>=s,r-=s,Xn=1<<32-on(e)+r|n<<r|a,$n=i+t}else Xn=1<<i|n<<r|a,$n=t}function Ly(t){t.return!==null&&(Ra(t,1),AC(t,1,0))}function Ry(t){for(;t===tf;)tf=ks[--Ds],ks[Ds]=null,Xu=ks[--Ds],ks[Ds]=null;for(;t===Hr;)Hr=In[--Tn],In[Tn]=null,$n=In[--Tn],In[Tn]=null,Xn=In[--Tn],In[Tn]=null}function bC(t,e){In[Tn++]=Xn,In[Tn++]=$n,In[Tn++]=Hr,Xn=e.id,$n=e.overflow,Hr=t}var wt=null,xe=null,se=!1,Nr=null,En=!1,Ng=Error(O(519));function Gr(t){var e=Error(O(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw $u(vn(e,t)),Ng}function ME(t){var e=t.stateNode,n=t.type,a=t.memoizedProps;switch(e[Et]=t,e[Kt]=a,n){case"dialog":ae("cancel",e),ae("close",e);break;case"iframe":case"object":case"embed":ae("load",e);break;case"video":case"audio":for(n=0;n<tl.length;n++)ae(tl[n],e);break;case"source":ae("error",e);break;case"img":case"image":case"link":ae("error",e),ae("load",e);break;case"details":ae("toggle",e);break;case"input":ae("invalid",e),aC(e,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":ae("invalid",e);break;case"textarea":ae("invalid",e),iC(e,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||a.suppressHydrationWarning===!0||lb(e.textContent,n)?(a.popover!=null&&(ae("beforetoggle",e),ae("toggle",e)),a.onScroll!=null&&ae("scroll",e),a.onScrollEnd!=null&&ae("scrollend",e),a.onClick!=null&&(e.onclick=Da),e=!0):e=!1,e||Gr(t,!0)}function UE(t){for(wt=t.return;wt;)switch(wt.tag){case 5:case 31:case 13:En=!1;return;case 27:case 3:En=!0;return;default:wt=wt.return}}function _s(t){if(t!==wt)return!1;if(!se)return UE(t),se=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||sy(t.type,t.memoizedProps)),n=!n),n&&xe&&Gr(t),UE(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(O(317));xe=Cw(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(O(317));xe=Cw(t)}else e===27?(e=xe,Qr(t.type)?(t=cy,cy=null,xe=t):xe=e):xe=wt?Cn(t.stateNode.nextSibling):null;return!0}function wi(){xe=wt=null,se=!1}function Jm(){var t=Nr;return t!==null&&(jt===null?jt=t:jt.push.apply(jt,t),Nr=null),t}function $u(t){Nr===null?Nr=[t]:Nr.push(t)}var Mg=ea(null),Pi=null,Pa=null;function Cr(t,e,n){we(Mg,e._currentValue),e._currentValue=n}function Na(t){t._currentValue=Mg.current,gt(Mg)}function Ug(t,e,n){for(;t!==null;){var a=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,a!==null&&(a.childLanes|=e)):a!==null&&(a.childLanes&e)!==e&&(a.childLanes|=e),t===n)break;t=t.return}}function Vg(t,e,n,a){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var i=r.dependencies;if(i!==null){var s=r.child;i=i.firstContext;e:for(;i!==null;){var u=i;i=r;for(var l=0;l<e.length;l++)if(u.context===e[l]){i.lanes|=n,u=i.alternate,u!==null&&(u.lanes|=n),Ug(i.return,n,t),a||(s=null);break e}i=u.next}}else if(r.tag===18){if(s=r.return,s===null)throw Error(O(341));s.lanes|=n,i=s.alternate,i!==null&&(i.lanes|=n),Ug(s,n,t),s=null}else s=r.child;if(s!==null)s.return=r;else for(s=r;s!==null;){if(s===t){s=null;break}if(r=s.sibling,r!==null){r.return=s.return,s=r;break}s=s.return}r=s}}function eo(t,e,n,a){t=null;for(var r=e,i=!1;r!==null;){if(!i){if(r.flags&524288)i=!0;else if(r.flags&262144)break}if(r.tag===10){var s=r.alternate;if(s===null)throw Error(O(387));if(s=s.memoizedProps,s!==null){var u=r.type;ln(r.pendingProps.value,s.value)||(t!==null?t.push(u):t=[u])}}else if(r===Qd.current){if(s=r.alternate,s===null)throw Error(O(387));s.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(al):t=[al])}r=r.return}t!==null&&Vg(e,t,n,a),e.flags|=262144}function nf(t){for(t=t.firstContext;t!==null;){if(!ln(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Ci(t){Pi=t,Pa=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function Ct(t){return LC(Pi,t)}function Ed(t,e){return Pi===null&&Ci(t),LC(t,e)}function LC(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},Pa===null){if(t===null)throw Error(O(308));Pa=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else Pa=Pa.next=e;return n}var XP=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,a){t.push(a)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},$P=ut.unstable_scheduleCallback,JP=ut.unstable_NormalPriority,Ze={$$typeof:ka,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function xy(){return{controller:new XP,data:new Map,refCount:0}}function fl(t){t.refCount--,t.refCount===0&&$P(JP,function(){t.controller.abort()})}var Mu=null,Fg=0,Gs=0,Us=null;function ZP(t,e){if(Mu===null){var n=Mu=[];Fg=0,Gs=t_(),Us={status:"pending",value:void 0,then:function(a){n.push(a)}}}return Fg++,e.then(VE,VE),e}function VE(){if(--Fg===0&&Mu!==null){Us!==null&&(Us.status="fulfilled");var t=Mu;Mu=null,Gs=0,Us=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function e1(t,e){var n=[],a={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){a.status="fulfilled",a.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(a.status="rejected",a.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),a}var FE=Q.S;Q.S=function(t,e){zA=rn(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&ZP(t,e),FE!==null&&FE(t,e)};var Si=ea(null);function ky(){var t=Si.current;return t!==null?t:Ee.pooledCache}function Vd(t,e){e===null?we(Si,Si.current):we(Si,e.pool)}function RC(){var t=ky();return t===null?null:{parent:Ze._currentValue,pool:t}}var to=Error(O(460)),Dy=Error(O(474)),xf=Error(O(542)),af={then:function(){}};function BE(t){return t=t.status,t==="fulfilled"||t==="rejected"}function xC(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(Da,Da),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,zE(t),t;default:if(typeof e.status=="string")e.then(Da,Da);else{if(t=Ee,t!==null&&100<t.shellSuspendCounter)throw Error(O(482));t=e,t.status="pending",t.then(function(a){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=a}},function(a){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=a}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,zE(t),t}throw vi=e,to}}function yi(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(vi=n,to):n}}var vi=null;function qE(){if(vi===null)throw Error(O(459));var t=vi;return vi=null,t}function zE(t){if(t===to||t===xf)throw Error(O(483))}var Vs=null,Ju=0;function wd(t){var e=Ju;return Ju+=1,Vs===null&&(Vs=[]),xC(Vs,t,e)}function Eu(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Cd(t,e){throw e.$$typeof===BD?Error(O(525)):(t=Object.prototype.toString.call(e),Error(O(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function kC(t){function e(E,S){if(t){var A=E.deletions;A===null?(E.deletions=[S],E.flags|=16):A.push(S)}}function n(E,S){if(!t)return null;for(;S!==null;)e(E,S),S=S.sibling;return null}function a(E){for(var S=new Map;E!==null;)E.key!==null?S.set(E.key,E):S.set(E.index,E),E=E.sibling;return S}function r(E,S){return E=Oa(E,S),E.index=0,E.sibling=null,E}function i(E,S,A){return E.index=A,t?(A=E.alternate,A!==null?(A=A.index,A<S?(E.flags|=67108866,S):A):(E.flags|=67108866,S)):(E.flags|=1048576,S)}function s(E){return t&&E.alternate===null&&(E.flags|=67108866),E}function u(E,S,A,x){return S===null||S.tag!==6?(S=Xm(A,E.mode,x),S.return=E,S):(S=r(S,A),S.return=E,S)}function l(E,S,A,x){var V=A.type;return V===vs?f(E,S,A.props.children,x,A.key):S!==null&&(S.elementType===V||typeof V=="object"&&V!==null&&V.$$typeof===Er&&yi(V)===S.type)?(S=r(S,A.props),Eu(S,A),S.return=E,S):(S=Ud(A.type,A.key,A.props,null,E.mode,x),Eu(S,A),S.return=E,S)}function c(E,S,A,x){return S===null||S.tag!==4||S.stateNode.containerInfo!==A.containerInfo||S.stateNode.implementation!==A.implementation?(S=$m(A,E.mode,x),S.return=E,S):(S=r(S,A.children||[]),S.return=E,S)}function f(E,S,A,x,V){return S===null||S.tag!==7?(S=Ti(A,E.mode,x,V),S.return=E,S):(S=r(S,A),S.return=E,S)}function m(E,S,A){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return S=Xm(""+S,E.mode,A),S.return=E,S;if(typeof S=="object"&&S!==null){switch(S.$$typeof){case md:return A=Ud(S.type,S.key,S.props,null,E.mode,A),Eu(A,S),A.return=E,A;case Lu:return S=$m(S,E.mode,A),S.return=E,S;case Er:return S=yi(S),m(E,S,A)}if(Ru(S)||Su(S))return S=Ti(S,E.mode,A,null),S.return=E,S;if(typeof S.then=="function")return m(E,wd(S),A);if(S.$$typeof===ka)return m(E,Ed(E,S),A);Cd(E,S)}return null}function p(E,S,A,x){var V=S!==null?S.key:null;if(typeof A=="string"&&A!==""||typeof A=="number"||typeof A=="bigint")return V!==null?null:u(E,S,""+A,x);if(typeof A=="object"&&A!==null){switch(A.$$typeof){case md:return A.key===V?l(E,S,A,x):null;case Lu:return A.key===V?c(E,S,A,x):null;case Er:return A=yi(A),p(E,S,A,x)}if(Ru(A)||Su(A))return V!==null?null:f(E,S,A,x,null);if(typeof A.then=="function")return p(E,S,wd(A),x);if(A.$$typeof===ka)return p(E,S,Ed(E,A),x);Cd(E,A)}return null}function _(E,S,A,x,V){if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return E=E.get(A)||null,u(S,E,""+x,V);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case md:return E=E.get(x.key===null?A:x.key)||null,l(S,E,x,V);case Lu:return E=E.get(x.key===null?A:x.key)||null,c(S,E,x,V);case Er:return x=yi(x),_(E,S,A,x,V)}if(Ru(x)||Su(x))return E=E.get(A)||null,f(S,E,x,V,null);if(typeof x.then=="function")return _(E,S,A,wd(x),V);if(x.$$typeof===ka)return _(E,S,A,Ed(S,x),V);Cd(S,x)}return null}function L(E,S,A,x){for(var V=null,M=null,T=S,g=S=0,I=null;T!==null&&g<A.length;g++){T.index>g?(I=T,T=null):I=T.sibling;var v=p(E,T,A[g],x);if(v===null){T===null&&(T=I);break}t&&T&&v.alternate===null&&e(E,T),S=i(v,S,g),M===null?V=v:M.sibling=v,M=v,T=I}if(g===A.length)return n(E,T),se&&Ra(E,g),V;if(T===null){for(;g<A.length;g++)T=m(E,A[g],x),T!==null&&(S=i(T,S,g),M===null?V=T:M.sibling=T,M=T);return se&&Ra(E,g),V}for(T=a(T);g<A.length;g++)I=_(T,E,g,A[g],x),I!==null&&(t&&I.alternate!==null&&T.delete(I.key===null?g:I.key),S=i(I,S,g),M===null?V=I:M.sibling=I,M=I);return t&&T.forEach(function(C){return e(E,C)}),se&&Ra(E,g),V}function k(E,S,A,x){if(A==null)throw Error(O(151));for(var V=null,M=null,T=S,g=S=0,I=null,v=A.next();T!==null&&!v.done;g++,v=A.next()){T.index>g?(I=T,T=null):I=T.sibling;var C=p(E,T,v.value,x);if(C===null){T===null&&(T=I);break}t&&T&&C.alternate===null&&e(E,T),S=i(C,S,g),M===null?V=C:M.sibling=C,M=C,T=I}if(v.done)return n(E,T),se&&Ra(E,g),V;if(T===null){for(;!v.done;g++,v=A.next())v=m(E,v.value,x),v!==null&&(S=i(v,S,g),M===null?V=v:M.sibling=v,M=v);return se&&Ra(E,g),V}for(T=a(T);!v.done;g++,v=A.next())v=_(T,E,g,v.value,x),v!==null&&(t&&v.alternate!==null&&T.delete(v.key===null?g:v.key),S=i(v,S,g),M===null?V=v:M.sibling=v,M=v);return t&&T.forEach(function(b){return e(E,b)}),se&&Ra(E,g),V}function P(E,S,A,x){if(typeof A=="object"&&A!==null&&A.type===vs&&A.key===null&&(A=A.props.children),typeof A=="object"&&A!==null){switch(A.$$typeof){case md:e:{for(var V=A.key;S!==null;){if(S.key===V){if(V=A.type,V===vs){if(S.tag===7){n(E,S.sibling),x=r(S,A.props.children),x.return=E,E=x;break e}}else if(S.elementType===V||typeof V=="object"&&V!==null&&V.$$typeof===Er&&yi(V)===S.type){n(E,S.sibling),x=r(S,A.props),Eu(x,A),x.return=E,E=x;break e}n(E,S);break}else e(E,S);S=S.sibling}A.type===vs?(x=Ti(A.props.children,E.mode,x,A.key),x.return=E,E=x):(x=Ud(A.type,A.key,A.props,null,E.mode,x),Eu(x,A),x.return=E,E=x)}return s(E);case Lu:e:{for(V=A.key;S!==null;){if(S.key===V)if(S.tag===4&&S.stateNode.containerInfo===A.containerInfo&&S.stateNode.implementation===A.implementation){n(E,S.sibling),x=r(S,A.children||[]),x.return=E,E=x;break e}else{n(E,S);break}else e(E,S);S=S.sibling}x=$m(A,E.mode,x),x.return=E,E=x}return s(E);case Er:return A=yi(A),P(E,S,A,x)}if(Ru(A))return L(E,S,A,x);if(Su(A)){if(V=Su(A),typeof V!="function")throw Error(O(150));return A=V.call(A),k(E,S,A,x)}if(typeof A.then=="function")return P(E,S,wd(A),x);if(A.$$typeof===ka)return P(E,S,Ed(E,A),x);Cd(E,A)}return typeof A=="string"&&A!==""||typeof A=="number"||typeof A=="bigint"?(A=""+A,S!==null&&S.tag===6?(n(E,S.sibling),x=r(S,A),x.return=E,E=x):(n(E,S),x=Xm(A,E.mode,x),x.return=E,E=x),s(E)):n(E,S)}return function(E,S,A,x){try{Ju=0;var V=P(E,S,A,x);return Vs=null,V}catch(T){if(T===to||T===xf)throw T;var M=nn(29,T,null,E.mode);return M.lanes=x,M.return=E,M}finally{}}}var Ai=kC(!0),DC=kC(!1),wr=!1;function Py(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Bg(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function Mr(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Ur(t,e,n){var a=t.updateQueue;if(a===null)return null;if(a=a.shared,de&2){var r=a.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),a.pending=e,e=ef(t),EC(t,null,n),e}return Rf(t,a,e,n),ef(t)}function Uu(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,Xw(t,n)}}function Zm(t,e){var n=t.updateQueue,a=t.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var r=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var s={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};i===null?r=i=s:i=i.next=s,n=n.next}while(n!==null);i===null?r=i=e:i=i.next=e}else r=i=e;n={baseState:a.baseState,firstBaseUpdate:r,lastBaseUpdate:i,shared:a.shared,callbacks:a.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var qg=!1;function Vu(){if(qg){var t=Us;if(t!==null)throw t}}function Fu(t,e,n,a){qg=!1;var r=t.updateQueue;wr=!1;var i=r.firstBaseUpdate,s=r.lastBaseUpdate,u=r.shared.pending;if(u!==null){r.shared.pending=null;var l=u,c=l.next;l.next=null,s===null?i=c:s.next=c,s=l;var f=t.alternate;f!==null&&(f=f.updateQueue,u=f.lastBaseUpdate,u!==s&&(u===null?f.firstBaseUpdate=c:u.next=c,f.lastBaseUpdate=l))}if(i!==null){var m=r.baseState;s=0,f=c=l=null,u=i;do{var p=u.lane&-536870913,_=p!==u.lane;if(_?(ie&p)===p:(a&p)===p){p!==0&&p===Gs&&(qg=!0),f!==null&&(f=f.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var L=t,k=u;p=e;var P=n;switch(k.tag){case 1:if(L=k.payload,typeof L=="function"){m=L.call(P,m,p);break e}m=L;break e;case 3:L.flags=L.flags&-65537|128;case 0:if(L=k.payload,p=typeof L=="function"?L.call(P,m,p):L,p==null)break e;m=ke({},m,p);break e;case 2:wr=!0}}p=u.callback,p!==null&&(t.flags|=64,_&&(t.flags|=8192),_=r.callbacks,_===null?r.callbacks=[p]:_.push(p))}else _={lane:p,tag:u.tag,payload:u.payload,callback:u.callback,next:null},f===null?(c=f=_,l=m):f=f.next=_,s|=p;if(u=u.next,u===null){if(u=r.shared.pending,u===null)break;_=u,u=_.next,_.next=null,r.lastBaseUpdate=_,r.shared.pending=null}}while(!0);f===null&&(l=m),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=f,i===null&&(r.shared.lanes=0),Wr|=s,t.lanes=s,t.memoizedState=m}}function PC(t,e){if(typeof t!="function")throw Error(O(191,t));t.call(e)}function OC(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)PC(n[t],e)}var js=ea(null),rf=ea(0);function HE(t,e){t=qa,we(rf,t),we(js,e),qa=t|e.baseLanes}function zg(){we(rf,qa),we(js,js.current)}function Oy(){qa=rf.current,gt(js),gt(rf)}var cn=ea(null),wn=null;function Ar(t){var e=t.alternate;we(je,je.current&1),we(cn,t),wn===null&&(e===null||js.current!==null||e.memoizedState!==null)&&(wn=t)}function Hg(t){we(je,je.current),we(cn,t),wn===null&&(wn=t)}function NC(t){t.tag===22?(we(je,je.current),we(cn,t),wn===null&&(wn=t)):br(t)}function br(){we(je,je.current),we(cn,cn.current)}function tn(t){gt(cn),wn===t&&(wn=null),gt(je)}var je=ea(0);function sf(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||uy(n)||ly(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Va=0,J=null,Te=null,$e=null,of=!1,Fs=!1,bi=!1,uf=0,Zu=0,Bs=null,t1=0;function Be(){throw Error(O(321))}function Ny(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!ln(t[n],e[n]))return!1;return!0}function My(t,e,n,a,r,i){return Va=i,J=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,Q.H=t===null||t.memoizedState===null?fA:Ky,bi=!1,i=n(a,r),bi=!1,Fs&&(i=UC(e,n,a,r)),MC(t),i}function MC(t){Q.H=el;var e=Te!==null&&Te.next!==null;if(Va=0,$e=Te=J=null,of=!1,Zu=0,Bs=null,e)throw Error(O(300));t===null||et||(t=t.dependencies,t!==null&&nf(t)&&(et=!0))}function UC(t,e,n,a){J=t;var r=0;do{if(Fs&&(Bs=null),Zu=0,Fs=!1,25<=r)throw Error(O(301));if(r+=1,$e=Te=null,t.updateQueue!=null){var i=t.updateQueue;i.lastEffect=null,i.events=null,i.stores=null,i.memoCache!=null&&(i.memoCache.index=0)}Q.H=hA,i=e(n,a)}while(Fs);return i}function n1(){var t=Q.H,e=t.useState()[0];return e=typeof e.then=="function"?hl(e):e,t=t.useState()[0],(Te!==null?Te.memoizedState:null)!==t&&(J.flags|=1024),e}function Uy(){var t=uf!==0;return uf=0,t}function Vy(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function Fy(t){if(of){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}of=!1}Va=0,$e=Te=J=null,Fs=!1,Zu=uf=0,Bs=null}function Vt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return $e===null?J.memoizedState=$e=t:$e=$e.next=t,$e}function We(){if(Te===null){var t=J.alternate;t=t!==null?t.memoizedState:null}else t=Te.next;var e=$e===null?J.memoizedState:$e.next;if(e!==null)$e=e,Te=t;else{if(t===null)throw J.alternate===null?Error(O(467)):Error(O(310));Te=t,t={memoizedState:Te.memoizedState,baseState:Te.baseState,baseQueue:Te.baseQueue,queue:Te.queue,next:null},$e===null?J.memoizedState=$e=t:$e=$e.next=t}return $e}function kf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function hl(t){var e=Zu;return Zu+=1,Bs===null&&(Bs=[]),t=xC(Bs,t,e),e=J,($e===null?e.memoizedState:$e.next)===null&&(e=e.alternate,Q.H=e===null||e.memoizedState===null?fA:Ky),t}function Df(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return hl(t);if(t.$$typeof===ka)return Ct(t)}throw Error(O(438,String(t)))}function By(t){var e=null,n=J.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var a=J.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(e={data:a.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=kf(),J.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),a=0;a<t;a++)n[a]=qD;return e.index++,n}function Fa(t,e){return typeof e=="function"?e(t):e}function Fd(t){var e=We();return qy(e,Te,t)}function qy(t,e,n){var a=t.queue;if(a===null)throw Error(O(311));a.lastRenderedReducer=n;var r=t.baseQueue,i=a.pending;if(i!==null){if(r!==null){var s=r.next;r.next=i.next,i.next=s}e.baseQueue=r=i,a.pending=null}if(i=t.baseState,r===null)t.memoizedState=i;else{e=r.next;var u=s=null,l=null,c=e,f=!1;do{var m=c.lane&-536870913;if(m!==c.lane?(ie&m)===m:(Va&m)===m){var p=c.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),m===Gs&&(f=!0);else if((Va&p)===p){c=c.next,p===Gs&&(f=!0);continue}else m={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=m,s=i):l=l.next=m,J.lanes|=p,Wr|=p;m=c.action,bi&&n(i,m),i=c.hasEagerState?c.eagerState:n(i,m)}else p={lane:m,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=p,s=i):l=l.next=p,J.lanes|=m,Wr|=m;c=c.next}while(c!==null&&c!==e);if(l===null?s=i:l.next=u,!ln(i,t.memoizedState)&&(et=!0,f&&(n=Us,n!==null)))throw n;t.memoizedState=i,t.baseState=s,t.baseQueue=l,a.lastRenderedState=i}return r===null&&(a.lanes=0),[t.memoizedState,a.dispatch]}function eg(t){var e=We(),n=e.queue;if(n===null)throw Error(O(311));n.lastRenderedReducer=t;var a=n.dispatch,r=n.pending,i=e.memoizedState;if(r!==null){n.pending=null;var s=r=r.next;do i=t(i,s.action),s=s.next;while(s!==r);ln(i,e.memoizedState)||(et=!0),e.memoizedState=i,e.baseQueue===null&&(e.baseState=i),n.lastRenderedState=i}return[i,a]}function VC(t,e,n){var a=J,r=We(),i=se;if(i){if(n===void 0)throw Error(O(407));n=n()}else n=e();var s=!ln((Te||r).memoizedState,n);if(s&&(r.memoizedState=n,et=!0),r=r.queue,zy(qC.bind(null,a,r,t),[t]),r.getSnapshot!==e||s||$e!==null&&$e.memoizedState.tag&1){if(a.flags|=2048,Ws(9,{destroy:void 0},BC.bind(null,a,r,n,e),null),Ee===null)throw Error(O(349));i||Va&127||FC(a,e,n)}return n}function FC(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=J.updateQueue,e===null?(e=kf(),J.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function BC(t,e,n,a){e.value=n,e.getSnapshot=a,zC(e)&&HC(t)}function qC(t,e,n){return n(function(){zC(e)&&HC(t)})}function zC(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!ln(t,n)}catch{return!0}}function HC(t){var e=Di(t,2);e!==null&&Wt(e,t,2)}function Gg(t){var e=Vt();if(typeof t=="function"){var n=t;if(t=n(),bi){Rr(!0);try{n()}finally{Rr(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fa,lastRenderedState:t},e}function GC(t,e,n,a){return t.baseState=n,qy(t,Te,typeof a=="function"?a:Fa)}function a1(t,e,n,a,r){if(Of(t))throw Error(O(485));if(t=e.action,t!==null){var i={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(s){i.listeners.push(s)}};Q.T!==null?n(!0):i.isTransition=!1,a(i),n=e.pending,n===null?(i.next=e.pending=i,jC(e,i)):(i.next=n.next,e.pending=n.next=i)}}function jC(t,e){var n=e.action,a=e.payload,r=t.state;if(e.isTransition){var i=Q.T,s={};Q.T=s;try{var u=n(r,a),l=Q.S;l!==null&&l(s,u),GE(t,e,u)}catch(c){jg(t,e,c)}finally{i!==null&&s.types!==null&&(i.types=s.types),Q.T=i}}else try{i=n(r,a),GE(t,e,i)}catch(c){jg(t,e,c)}}function GE(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){jE(t,e,a)},function(a){return jg(t,e,a)}):jE(t,e,n)}function jE(t,e,n){e.status="fulfilled",e.value=n,WC(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,jC(t,n)))}function jg(t,e,n){var a=t.pending;if(t.pending=null,a!==null){a=a.next;do e.status="rejected",e.reason=n,WC(e),e=e.next;while(e!==a)}t.action=null}function WC(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function KC(t,e){return e}function WE(t,e){if(se){var n=Ee.formState;if(n!==null){e:{var a=J;if(se){if(xe){t:{for(var r=xe,i=En;r.nodeType!==8;){if(!i){r=null;break t}if(r=Cn(r.nextSibling),r===null){r=null;break t}}i=r.data,r=i==="F!"||i==="F"?r:null}if(r){xe=Cn(r.nextSibling),a=r.data==="F!";break e}}Gr(a)}a=!1}a&&(e=n[0])}}return n=Vt(),n.memoizedState=n.baseState=e,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:KC,lastRenderedState:e},n.queue=a,n=lA.bind(null,J,a),a.dispatch=n,a=Gg(!1),i=Wy.bind(null,J,!1,a.queue),a=Vt(),r={state:e,dispatch:null,action:t,pending:null},a.queue=r,n=a1.bind(null,J,r,i,n),r.dispatch=n,a.memoizedState=t,[e,n,!1]}function KE(t){var e=We();return QC(e,Te,t)}function QC(t,e,n){if(e=qy(t,e,KC)[0],t=Fd(Fa)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var a=hl(e)}catch(s){throw s===to?xf:s}else a=e;e=We();var r=e.queue,i=r.dispatch;return n!==e.memoizedState&&(J.flags|=2048,Ws(9,{destroy:void 0},r1.bind(null,r,n),null)),[a,i,t]}function r1(t,e){t.action=e}function QE(t){var e=We(),n=Te;if(n!==null)return QC(e,n,t);We(),e=e.memoizedState,n=We();var a=n.queue.dispatch;return n.memoizedState=t,[e,a,!1]}function Ws(t,e,n,a){return t={tag:t,create:n,deps:a,inst:e,next:null},e=J.updateQueue,e===null&&(e=kf(),J.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(a=n.next,n.next=t,t.next=a,e.lastEffect=t),t}function YC(){return We().memoizedState}function Bd(t,e,n,a){var r=Vt();J.flags|=t,r.memoizedState=Ws(1|e,{destroy:void 0},n,a===void 0?null:a)}function Pf(t,e,n,a){var r=We();a=a===void 0?null:a;var i=r.memoizedState.inst;Te!==null&&a!==null&&Ny(a,Te.memoizedState.deps)?r.memoizedState=Ws(e,i,n,a):(J.flags|=t,r.memoizedState=Ws(1|e,i,n,a))}function YE(t,e){Bd(8390656,8,t,e)}function zy(t,e){Pf(2048,8,t,e)}function i1(t){J.flags|=4;var e=J.updateQueue;if(e===null)e=kf(),J.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function XC(t){var e=We().memoizedState;return i1({ref:e,nextImpl:t}),function(){if(de&2)throw Error(O(440));return e.impl.apply(void 0,arguments)}}function $C(t,e){return Pf(4,2,t,e)}function JC(t,e){return Pf(4,4,t,e)}function ZC(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function eA(t,e,n){n=n!=null?n.concat([t]):null,Pf(4,4,ZC.bind(null,e,t),n)}function Hy(){}function tA(t,e){var n=We();e=e===void 0?null:e;var a=n.memoizedState;return e!==null&&Ny(e,a[1])?a[0]:(n.memoizedState=[t,e],t)}function nA(t,e){var n=We();e=e===void 0?null:e;var a=n.memoizedState;if(e!==null&&Ny(e,a[1]))return a[0];if(a=t(),bi){Rr(!0);try{t()}finally{Rr(!1)}}return n.memoizedState=[a,e],a}function Gy(t,e,n){return n===void 0||Va&1073741824&&!(ie&261930)?t.memoizedState=e:(t.memoizedState=n,t=GA(),J.lanes|=t,Wr|=t,n)}function aA(t,e,n,a){return ln(n,e)?n:js.current!==null?(t=Gy(t,n,a),ln(t,e)||(et=!0),t):!(Va&42)||Va&1073741824&&!(ie&261930)?(et=!0,t.memoizedState=n):(t=GA(),J.lanes|=t,Wr|=t,e)}function rA(t,e,n,a,r){var i=fe.p;fe.p=i!==0&&8>i?i:8;var s=Q.T,u={};Q.T=u,Wy(t,!1,e,n);try{var l=r(),c=Q.S;if(c!==null&&c(u,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=e1(l,a);Bu(t,e,f,un(t))}else Bu(t,e,a,un(t))}catch(m){Bu(t,e,{then:function(){},status:"rejected",reason:m},un())}finally{fe.p=i,s!==null&&u.types!==null&&(s.types=u.types),Q.T=s}}function s1(){}function Wg(t,e,n,a){if(t.tag!==5)throw Error(O(476));var r=iA(t).queue;rA(t,r,e,Ii,n===null?s1:function(){return sA(t),n(a)})}function iA(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Ii,baseState:Ii,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fa,lastRenderedState:Ii},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fa,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function sA(t){var e=iA(t);e.next===null&&(e=t.alternate.memoizedState),Bu(t,e.next.queue,{},un())}function jy(){return Ct(al)}function oA(){return We().memoizedState}function uA(){return We().memoizedState}function o1(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=un();t=Mr(n);var a=Ur(e,t,n);a!==null&&(Wt(a,e,n),Uu(a,e,n)),e={cache:xy()},t.payload=e;return}e=e.return}}function u1(t,e,n){var a=un();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Of(t)?cA(e,n):(n=Ay(t,e,n,a),n!==null&&(Wt(n,t,a),dA(n,e,a)))}function lA(t,e,n){var a=un();Bu(t,e,n,a)}function Bu(t,e,n,a){var r={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Of(t))cA(e,r);else{var i=t.alternate;if(t.lanes===0&&(i===null||i.lanes===0)&&(i=e.lastRenderedReducer,i!==null))try{var s=e.lastRenderedState,u=i(s,n);if(r.hasEagerState=!0,r.eagerState=u,ln(u,s))return Rf(t,e,r,0),Ee===null&&Lf(),!1}catch{}finally{}if(n=Ay(t,e,r,a),n!==null)return Wt(n,t,a),dA(n,e,a),!0}return!1}function Wy(t,e,n,a){if(a={lane:2,revertLane:t_(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Of(t)){if(e)throw Error(O(479))}else e=Ay(t,n,a,2),e!==null&&Wt(e,t,2)}function Of(t){var e=t.alternate;return t===J||e!==null&&e===J}function cA(t,e){Fs=of=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function dA(t,e,n){if(n&4194048){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,Xw(t,n)}}var el={readContext:Ct,use:Df,useCallback:Be,useContext:Be,useEffect:Be,useImperativeHandle:Be,useLayoutEffect:Be,useInsertionEffect:Be,useMemo:Be,useReducer:Be,useRef:Be,useState:Be,useDebugValue:Be,useDeferredValue:Be,useTransition:Be,useSyncExternalStore:Be,useId:Be,useHostTransitionStatus:Be,useFormState:Be,useActionState:Be,useOptimistic:Be,useMemoCache:Be,useCacheRefresh:Be};el.useEffectEvent=Be;var fA={readContext:Ct,use:Df,useCallback:function(t,e){return Vt().memoizedState=[t,e===void 0?null:e],t},useContext:Ct,useEffect:YE,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,Bd(4194308,4,ZC.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Bd(4194308,4,t,e)},useInsertionEffect:function(t,e){Bd(4,2,t,e)},useMemo:function(t,e){var n=Vt();e=e===void 0?null:e;var a=t();if(bi){Rr(!0);try{t()}finally{Rr(!1)}}return n.memoizedState=[a,e],a},useReducer:function(t,e,n){var a=Vt();if(n!==void 0){var r=n(e);if(bi){Rr(!0);try{n(e)}finally{Rr(!1)}}}else r=e;return a.memoizedState=a.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},a.queue=t,t=t.dispatch=u1.bind(null,J,t),[a.memoizedState,t]},useRef:function(t){var e=Vt();return t={current:t},e.memoizedState=t},useState:function(t){t=Gg(t);var e=t.queue,n=lA.bind(null,J,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Hy,useDeferredValue:function(t,e){var n=Vt();return Gy(n,t,e)},useTransition:function(){var t=Gg(!1);return t=rA.bind(null,J,t.queue,!0,!1),Vt().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var a=J,r=Vt();if(se){if(n===void 0)throw Error(O(407));n=n()}else{if(n=e(),Ee===null)throw Error(O(349));ie&127||FC(a,e,n)}r.memoizedState=n;var i={value:n,getSnapshot:e};return r.queue=i,YE(qC.bind(null,a,i,t),[t]),a.flags|=2048,Ws(9,{destroy:void 0},BC.bind(null,a,i,n,e),null),n},useId:function(){var t=Vt(),e=Ee.identifierPrefix;if(se){var n=$n,a=Xn;n=(a&~(1<<32-on(a)-1)).toString(32)+n,e="_"+e+"R_"+n,n=uf++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=t1++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:jy,useFormState:WE,useActionState:WE,useOptimistic:function(t){var e=Vt();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=Wy.bind(null,J,!0,n),n.dispatch=e,[t,e]},useMemoCache:By,useCacheRefresh:function(){return Vt().memoizedState=o1.bind(null,J)},useEffectEvent:function(t){var e=Vt(),n={impl:t};return e.memoizedState=n,function(){if(de&2)throw Error(O(440));return n.impl.apply(void 0,arguments)}}},Ky={readContext:Ct,use:Df,useCallback:tA,useContext:Ct,useEffect:zy,useImperativeHandle:eA,useInsertionEffect:$C,useLayoutEffect:JC,useMemo:nA,useReducer:Fd,useRef:YC,useState:function(){return Fd(Fa)},useDebugValue:Hy,useDeferredValue:function(t,e){var n=We();return aA(n,Te.memoizedState,t,e)},useTransition:function(){var t=Fd(Fa)[0],e=We().memoizedState;return[typeof t=="boolean"?t:hl(t),e]},useSyncExternalStore:VC,useId:oA,useHostTransitionStatus:jy,useFormState:KE,useActionState:KE,useOptimistic:function(t,e){var n=We();return GC(n,Te,t,e)},useMemoCache:By,useCacheRefresh:uA};Ky.useEffectEvent=XC;var hA={readContext:Ct,use:Df,useCallback:tA,useContext:Ct,useEffect:zy,useImperativeHandle:eA,useInsertionEffect:$C,useLayoutEffect:JC,useMemo:nA,useReducer:eg,useRef:YC,useState:function(){return eg(Fa)},useDebugValue:Hy,useDeferredValue:function(t,e){var n=We();return Te===null?Gy(n,t,e):aA(n,Te.memoizedState,t,e)},useTransition:function(){var t=eg(Fa)[0],e=We().memoizedState;return[typeof t=="boolean"?t:hl(t),e]},useSyncExternalStore:VC,useId:oA,useHostTransitionStatus:jy,useFormState:QE,useActionState:QE,useOptimistic:function(t,e){var n=We();return Te!==null?GC(n,Te,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:By,useCacheRefresh:uA};hA.useEffectEvent=XC;function tg(t,e,n,a){e=t.memoizedState,n=n(a,e),n=n==null?e:ke({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Kg={enqueueSetState:function(t,e,n){t=t._reactInternals;var a=un(),r=Mr(a);r.payload=e,n!=null&&(r.callback=n),e=Ur(t,r,a),e!==null&&(Wt(e,t,a),Uu(e,t,a))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var a=un(),r=Mr(a);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=Ur(t,r,a),e!==null&&(Wt(e,t,a),Uu(e,t,a))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=un(),a=Mr(n);a.tag=2,e!=null&&(a.callback=e),e=Ur(t,a,n),e!==null&&(Wt(e,t,n),Uu(e,t,n))}};function XE(t,e,n,a,r,i,s){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(a,i,s):e.prototype&&e.prototype.isPureReactComponent?!Yu(n,a)||!Yu(r,i):!0}function $E(t,e,n,a){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,a),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,a),e.state!==t&&Kg.enqueueReplaceState(e,e.state,null)}function Li(t,e){var n=e;if("ref"in e){n={};for(var a in e)a!=="ref"&&(n[a]=e[a])}if(t=t.defaultProps){n===e&&(n=ke({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function pA(t){Zd(t)}function mA(t){console.error(t)}function gA(t){Zd(t)}function lf(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(a){setTimeout(function(){throw a})}}function JE(t,e,n){try{var a=t.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Qg(t,e,n){return n=Mr(n),n.tag=3,n.payload={element:null},n.callback=function(){lf(t,e)},n}function yA(t){return t=Mr(t),t.tag=3,t}function _A(t,e,n,a){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var i=a.value;t.payload=function(){return r(i)},t.callback=function(){JE(e,n,a)}}var s=n.stateNode;s!==null&&typeof s.componentDidCatch=="function"&&(t.callback=function(){JE(e,n,a),typeof r!="function"&&(Vr===null?Vr=new Set([this]):Vr.add(this));var u=a.stack;this.componentDidCatch(a.value,{componentStack:u!==null?u:""})})}function l1(t,e,n,a,r){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(e=n.alternate,e!==null&&eo(e,n,r,!0),n=cn.current,n!==null){switch(n.tag){case 31:case 13:return wn===null?pf():n.alternate===null&&qe===0&&(qe=3),n.flags&=-257,n.flags|=65536,n.lanes=r,a===af?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([a]):e.add(a),fg(t,a,r)),!1;case 22:return n.flags|=65536,a===af?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([a]):n.add(a)),fg(t,a,r)),!1}throw Error(O(435,n.tag))}return fg(t,a,r),pf(),!1}if(se)return e=cn.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,a!==Ng&&(t=Error(O(422),{cause:a}),$u(vn(t,n)))):(a!==Ng&&(e=Error(O(423),{cause:a}),$u(vn(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,a=vn(a,n),r=Qg(t.stateNode,a,r),Zm(t,r),qe!==4&&(qe=2)),!1;var i=Error(O(520),{cause:a});if(i=vn(i,n),Hu===null?Hu=[i]:Hu.push(i),qe!==4&&(qe=2),e===null)return!0;a=vn(a,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=Qg(n.stateNode,a,t),Zm(n,t),!1;case 1:if(e=n.type,i=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||i!==null&&typeof i.componentDidCatch=="function"&&(Vr===null||!Vr.has(i))))return n.flags|=65536,r&=-r,n.lanes|=r,r=yA(r),_A(r,t,n,a),Zm(n,r),!1}n=n.return}while(n!==null);return!1}var Qy=Error(O(461)),et=!1;function vt(t,e,n,a){e.child=t===null?DC(e,null,n,a):Ai(e,t.child,n,a)}function ZE(t,e,n,a,r){n=n.render;var i=e.ref;if("ref"in a){var s={};for(var u in a)u!=="ref"&&(s[u]=a[u])}else s=a;return Ci(e),a=My(t,e,n,s,i,r),u=Uy(),t!==null&&!et?(Vy(t,e,r),Ba(t,e,r)):(se&&u&&Ly(e),e.flags|=1,vt(t,e,a,r),e.child)}function ew(t,e,n,a,r){if(t===null){var i=n.type;return typeof i=="function"&&!by(i)&&i.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=i,IA(t,e,i,a,r)):(t=Ud(n.type,null,a,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(i=t.child,!Yy(t,r)){var s=i.memoizedProps;if(n=n.compare,n=n!==null?n:Yu,n(s,a)&&t.ref===e.ref)return Ba(t,e,r)}return e.flags|=1,t=Oa(i,a),t.ref=e.ref,t.return=e,e.child=t}function IA(t,e,n,a,r){if(t!==null){var i=t.memoizedProps;if(Yu(i,a)&&t.ref===e.ref)if(et=!1,e.pendingProps=a=i,Yy(t,r))t.flags&131072&&(et=!0);else return e.lanes=t.lanes,Ba(t,e,r)}return Yg(t,e,n,a,r)}function TA(t,e,n,a){var r=a.children,i=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(e.flags&128){if(i=i!==null?i.baseLanes|n:n,t!==null){for(a=e.child=t.child,r=0;a!==null;)r=r|a.lanes|a.childLanes,a=a.sibling;a=r&~i}else a=0,e.child=null;return tw(t,e,i,n,a)}if(n&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&Vd(e,i!==null?i.cachePool:null),i!==null?HE(e,i):zg(),NC(e);else return a=e.lanes=536870912,tw(t,e,i!==null?i.baseLanes|n:n,n,a)}else i!==null?(Vd(e,i.cachePool),HE(e,i),br(e),e.memoizedState=null):(t!==null&&Vd(e,null),zg(),br(e));return vt(t,e,r,n),e.child}function ku(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function tw(t,e,n,a,r){var i=ky();return i=i===null?null:{parent:Ze._currentValue,pool:i},e.memoizedState={baseLanes:n,cachePool:i},t!==null&&Vd(e,null),zg(),NC(e),t!==null&&eo(t,e,a,!0),e.childLanes=r,null}function qd(t,e){return e=cf({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function nw(t,e,n){return Ai(e,t.child,null,n),t=qd(e,e.pendingProps),t.flags|=2,tn(e),e.memoizedState=null,t}function c1(t,e,n){var a=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(se){if(a.mode==="hidden")return t=qd(e,a),e.lanes=536870912,ku(null,t);if(Hg(e),(t=xe)?(t=fb(t,En),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Hr!==null?{id:Xn,overflow:$n}:null,retryLane:536870912,hydrationErrors:null},n=CC(t),n.return=e,e.child=n,wt=e,xe=null)):t=null,t===null)throw Gr(e);return e.lanes=536870912,null}return qd(e,a)}var i=t.memoizedState;if(i!==null){var s=i.dehydrated;if(Hg(e),r)if(e.flags&256)e.flags&=-257,e=nw(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(O(558));else if(et||eo(t,e,n,!1),r=(n&t.childLanes)!==0,et||r){if(a=Ee,a!==null&&(s=$w(a,n),s!==0&&s!==i.retryLane))throw i.retryLane=s,Di(t,s),Wt(a,t,s),Qy;pf(),e=nw(t,e,n)}else t=i.treeContext,xe=Cn(s.nextSibling),wt=e,se=!0,Nr=null,En=!1,t!==null&&bC(e,t),e=qd(e,a),e.flags|=4096;return e}return t=Oa(t.child,{mode:a.mode,children:a.children}),t.ref=e.ref,e.child=t,t.return=e,t}function zd(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(O(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Yg(t,e,n,a,r){return Ci(e),n=My(t,e,n,a,void 0,r),a=Uy(),t!==null&&!et?(Vy(t,e,r),Ba(t,e,r)):(se&&a&&Ly(e),e.flags|=1,vt(t,e,n,r),e.child)}function aw(t,e,n,a,r,i){return Ci(e),e.updateQueue=null,n=UC(e,a,n,r),MC(t),a=Uy(),t!==null&&!et?(Vy(t,e,i),Ba(t,e,i)):(se&&a&&Ly(e),e.flags|=1,vt(t,e,n,i),e.child)}function rw(t,e,n,a,r){if(Ci(e),e.stateNode===null){var i=xs,s=n.contextType;typeof s=="object"&&s!==null&&(i=Ct(s)),i=new n(a,i),e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Kg,e.stateNode=i,i._reactInternals=e,i=e.stateNode,i.props=a,i.state=e.memoizedState,i.refs={},Py(e),s=n.contextType,i.context=typeof s=="object"&&s!==null?Ct(s):xs,i.state=e.memoizedState,s=n.getDerivedStateFromProps,typeof s=="function"&&(tg(e,n,s,a),i.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(s=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),s!==i.state&&Kg.enqueueReplaceState(i,i.state,null),Fu(e,a,i,r),Vu(),i.state=e.memoizedState),typeof i.componentDidMount=="function"&&(e.flags|=4194308),a=!0}else if(t===null){i=e.stateNode;var u=e.memoizedProps,l=Li(n,u);i.props=l;var c=i.context,f=n.contextType;s=xs,typeof f=="object"&&f!==null&&(s=Ct(f));var m=n.getDerivedStateFromProps;f=typeof m=="function"||typeof i.getSnapshotBeforeUpdate=="function",u=e.pendingProps!==u,f||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(u||c!==s)&&$E(e,i,a,s),wr=!1;var p=e.memoizedState;i.state=p,Fu(e,a,i,r),Vu(),c=e.memoizedState,u||p!==c||wr?(typeof m=="function"&&(tg(e,n,m,a),c=e.memoizedState),(l=wr||XE(e,n,l,a,p,c,s))?(f||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(e.flags|=4194308)):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=a,e.memoizedState=c),i.props=a,i.state=c,i.context=s,a=l):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),a=!1)}else{i=e.stateNode,Bg(t,e),s=e.memoizedProps,f=Li(n,s),i.props=f,m=e.pendingProps,p=i.context,c=n.contextType,l=xs,typeof c=="object"&&c!==null&&(l=Ct(c)),u=n.getDerivedStateFromProps,(c=typeof u=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==m||p!==l)&&$E(e,i,a,l),wr=!1,p=e.memoizedState,i.state=p,Fu(e,a,i,r),Vu();var _=e.memoizedState;s!==m||p!==_||wr||t!==null&&t.dependencies!==null&&nf(t.dependencies)?(typeof u=="function"&&(tg(e,n,u,a),_=e.memoizedState),(f=wr||XE(e,n,f,a,p,_,l)||t!==null&&t.dependencies!==null&&nf(t.dependencies))?(c||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(a,_,l),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(a,_,l)),typeof i.componentDidUpdate=="function"&&(e.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof i.componentDidUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),e.memoizedProps=a,e.memoizedState=_),i.props=a,i.state=_,i.context=l,a=f):(typeof i.componentDidUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),a=!1)}return i=a,zd(t,e),a=(e.flags&128)!==0,i||a?(i=e.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:i.render(),e.flags|=1,t!==null&&a?(e.child=Ai(e,t.child,null,r),e.child=Ai(e,null,n,r)):vt(t,e,n,r),e.memoizedState=i.state,t=e.child):t=Ba(t,e,r),t}function iw(t,e,n,a){return wi(),e.flags|=256,vt(t,e,n,a),e.child}var ng={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function ag(t){return{baseLanes:t,cachePool:RC()}}function rg(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=an),t}function SA(t,e,n){var a=e.pendingProps,r=!1,i=(e.flags&128)!==0,s;if((s=i)||(s=t!==null&&t.memoizedState===null?!1:(je.current&2)!==0),s&&(r=!0,e.flags&=-129),s=(e.flags&32)!==0,e.flags&=-33,t===null){if(se){if(r?Ar(e):br(e),(t=xe)?(t=fb(t,En),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Hr!==null?{id:Xn,overflow:$n}:null,retryLane:536870912,hydrationErrors:null},n=CC(t),n.return=e,e.child=n,wt=e,xe=null)):t=null,t===null)throw Gr(e);return ly(t)?e.lanes=32:e.lanes=536870912,null}var u=a.children;return a=a.fallback,r?(br(e),r=e.mode,u=cf({mode:"hidden",children:u},r),a=Ti(a,r,n,null),u.return=e,a.return=e,u.sibling=a,e.child=u,a=e.child,a.memoizedState=ag(n),a.childLanes=rg(t,s,n),e.memoizedState=ng,ku(null,a)):(Ar(e),Xg(e,u))}var l=t.memoizedState;if(l!==null&&(u=l.dehydrated,u!==null)){if(i)e.flags&256?(Ar(e),e.flags&=-257,e=ig(t,e,n)):e.memoizedState!==null?(br(e),e.child=t.child,e.flags|=128,e=null):(br(e),u=a.fallback,r=e.mode,a=cf({mode:"visible",children:a.children},r),u=Ti(u,r,n,null),u.flags|=2,a.return=e,u.return=e,a.sibling=u,e.child=a,Ai(e,t.child,null,n),a=e.child,a.memoizedState=ag(n),a.childLanes=rg(t,s,n),e.memoizedState=ng,e=ku(null,a));else if(Ar(e),ly(u)){if(s=u.nextSibling&&u.nextSibling.dataset,s)var c=s.dgst;s=c,a=Error(O(419)),a.stack="",a.digest=s,$u({value:a,source:null,stack:null}),e=ig(t,e,n)}else if(et||eo(t,e,n,!1),s=(n&t.childLanes)!==0,et||s){if(s=Ee,s!==null&&(a=$w(s,n),a!==0&&a!==l.retryLane))throw l.retryLane=a,Di(t,a),Wt(s,t,a),Qy;uy(u)||pf(),e=ig(t,e,n)}else uy(u)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,xe=Cn(u.nextSibling),wt=e,se=!0,Nr=null,En=!1,t!==null&&bC(e,t),e=Xg(e,a.children),e.flags|=4096);return e}return r?(br(e),u=a.fallback,r=e.mode,l=t.child,c=l.sibling,a=Oa(l,{mode:"hidden",children:a.children}),a.subtreeFlags=l.subtreeFlags&65011712,c!==null?u=Oa(c,u):(u=Ti(u,r,n,null),u.flags|=2),u.return=e,a.return=e,a.sibling=u,e.child=a,ku(null,a),a=e.child,u=t.child.memoizedState,u===null?u=ag(n):(r=u.cachePool,r!==null?(l=Ze._currentValue,r=r.parent!==l?{parent:l,pool:l}:r):r=RC(),u={baseLanes:u.baseLanes|n,cachePool:r}),a.memoizedState=u,a.childLanes=rg(t,s,n),e.memoizedState=ng,ku(t.child,a)):(Ar(e),n=t.child,t=n.sibling,n=Oa(n,{mode:"visible",children:a.children}),n.return=e,n.sibling=null,t!==null&&(s=e.deletions,s===null?(e.deletions=[t],e.flags|=16):s.push(t)),e.child=n,e.memoizedState=null,n)}function Xg(t,e){return e=cf({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function cf(t,e){return t=nn(22,t,null,e),t.lanes=0,t}function ig(t,e,n){return Ai(e,t.child,null,n),t=Xg(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function sw(t,e,n){t.lanes|=e;var a=t.alternate;a!==null&&(a.lanes|=e),Ug(t.return,e,n)}function sg(t,e,n,a,r,i){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:r,treeForkCount:i}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=a,s.tail=n,s.tailMode=r,s.treeForkCount=i)}function vA(t,e,n){var a=e.pendingProps,r=a.revealOrder,i=a.tail;a=a.children;var s=je.current,u=(s&2)!==0;if(u?(s=s&1|2,e.flags|=128):s&=1,we(je,s),vt(t,e,a,n),a=se?Xu:0,!u&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&sw(t,n,e);else if(t.tag===19)sw(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&sf(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),sg(e,!1,r,n,i,a);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&sf(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}sg(e,!0,n,null,i,a);break;case"together":sg(e,!1,null,null,void 0,a);break;default:e.memoizedState=null}return e.child}function Ba(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Wr|=e.lanes,!(n&e.childLanes))if(t!==null){if(eo(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(O(153));if(e.child!==null){for(t=e.child,n=Oa(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Oa(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Yy(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&nf(t)))}function d1(t,e,n){switch(e.tag){case 3:Yd(e,e.stateNode.containerInfo),Cr(e,Ze,t.memoizedState.cache),wi();break;case 27:case 5:wg(e);break;case 4:Yd(e,e.stateNode.containerInfo);break;case 10:Cr(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Hg(e),null;break;case 13:var a=e.memoizedState;if(a!==null)return a.dehydrated!==null?(Ar(e),e.flags|=128,null):n&e.child.childLanes?SA(t,e,n):(Ar(e),t=Ba(t,e,n),t!==null?t.sibling:null);Ar(e);break;case 19:var r=(t.flags&128)!==0;if(a=(n&e.childLanes)!==0,a||(eo(t,e,n,!1),a=(n&e.childLanes)!==0),r){if(a)return vA(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),we(je,je.current),a)break;return null;case 22:return e.lanes=0,TA(t,e,n,e.pendingProps);case 24:Cr(e,Ze,t.memoizedState.cache)}return Ba(t,e,n)}function EA(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)et=!0;else{if(!Yy(t,n)&&!(e.flags&128))return et=!1,d1(t,e,n);et=!!(t.flags&131072)}else et=!1,se&&e.flags&1048576&&AC(e,Xu,e.index);switch(e.lanes=0,e.tag){case 16:e:{var a=e.pendingProps;if(t=yi(e.elementType),e.type=t,typeof t=="function")by(t)?(a=Li(t,a),e.tag=1,e=rw(null,e,t,a,n)):(e.tag=0,e=Yg(null,e,t,a,n));else{if(t!=null){var r=t.$$typeof;if(r===hy){e.tag=11,e=ZE(null,e,t,a,n);break e}else if(r===py){e.tag=14,e=ew(null,e,t,a,n);break e}}throw e=vg(t)||t,Error(O(306,e,""))}}return e;case 0:return Yg(t,e,e.type,e.pendingProps,n);case 1:return a=e.type,r=Li(a,e.pendingProps),rw(t,e,a,r,n);case 3:e:{if(Yd(e,e.stateNode.containerInfo),t===null)throw Error(O(387));a=e.pendingProps;var i=e.memoizedState;r=i.element,Bg(t,e),Fu(e,a,null,n);var s=e.memoizedState;if(a=s.cache,Cr(e,Ze,a),a!==i.cache&&Vg(e,[Ze],n,!0),Vu(),a=s.element,i.isDehydrated)if(i={element:a,isDehydrated:!1,cache:s.cache},e.updateQueue.baseState=i,e.memoizedState=i,e.flags&256){e=iw(t,e,a,n);break e}else if(a!==r){r=vn(Error(O(424)),e),$u(r),e=iw(t,e,a,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(xe=Cn(t.firstChild),wt=e,se=!0,Nr=null,En=!0,n=DC(e,null,a,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(wi(),a===r){e=Ba(t,e,n);break e}vt(t,e,a,n)}e=e.child}return e;case 26:return zd(t,e),t===null?(n=Lw(e.type,null,e.pendingProps,null))?e.memoizedState=n:se||(n=e.type,t=e.pendingProps,a=_f(Or.current).createElement(n),a[Et]=e,a[Kt]=t,At(a,n,t),mt(a),e.stateNode=a):e.memoizedState=Lw(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return wg(e),t===null&&se&&(a=e.stateNode=hb(e.type,e.pendingProps,Or.current),wt=e,En=!0,r=xe,Qr(e.type)?(cy=r,xe=Cn(a.firstChild)):xe=r),vt(t,e,e.pendingProps.children,n),zd(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&se&&((r=a=xe)&&(a=F1(a,e.type,e.pendingProps,En),a!==null?(e.stateNode=a,wt=e,xe=Cn(a.firstChild),En=!1,r=!0):r=!1),r||Gr(e)),wg(e),r=e.type,i=e.pendingProps,s=t!==null?t.memoizedProps:null,a=i.children,sy(r,i)?a=null:s!==null&&sy(r,s)&&(e.flags|=32),e.memoizedState!==null&&(r=My(t,e,n1,null,null,n),al._currentValue=r),zd(t,e),vt(t,e,a,n),e.child;case 6:return t===null&&se&&((t=n=xe)&&(n=B1(n,e.pendingProps,En),n!==null?(e.stateNode=n,wt=e,xe=null,t=!0):t=!1),t||Gr(e)),null;case 13:return SA(t,e,n);case 4:return Yd(e,e.stateNode.containerInfo),a=e.pendingProps,t===null?e.child=Ai(e,null,a,n):vt(t,e,a,n),e.child;case 11:return ZE(t,e,e.type,e.pendingProps,n);case 7:return vt(t,e,e.pendingProps,n),e.child;case 8:return vt(t,e,e.pendingProps.children,n),e.child;case 12:return vt(t,e,e.pendingProps.children,n),e.child;case 10:return a=e.pendingProps,Cr(e,e.type,a.value),vt(t,e,a.children,n),e.child;case 9:return r=e.type._context,a=e.pendingProps.children,Ci(e),r=Ct(r),a=a(r),e.flags|=1,vt(t,e,a,n),e.child;case 14:return ew(t,e,e.type,e.pendingProps,n);case 15:return IA(t,e,e.type,e.pendingProps,n);case 19:return vA(t,e,n);case 31:return c1(t,e,n);case 22:return TA(t,e,n,e.pendingProps);case 24:return Ci(e),a=Ct(Ze),t===null?(r=ky(),r===null&&(r=Ee,i=xy(),r.pooledCache=i,i.refCount++,i!==null&&(r.pooledCacheLanes|=n),r=i),e.memoizedState={parent:a,cache:r},Py(e),Cr(e,Ze,r)):(t.lanes&n&&(Bg(t,e),Fu(e,null,null,n),Vu()),r=t.memoizedState,i=e.memoizedState,r.parent!==a?(r={parent:a,cache:a},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),Cr(e,Ze,a)):(a=i.cache,Cr(e,Ze,a),a!==r.cache&&Vg(e,[Ze],n,!0))),vt(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(O(156,e.tag))}function Ca(t){t.flags|=4}function og(t,e,n,a,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(KA())t.flags|=8192;else throw vi=af,Dy}else t.flags&=-16777217}function ow(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!gb(e))if(KA())t.flags|=8192;else throw vi=af,Dy}function Ad(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?Qw():536870912,t.lanes|=e,Ks|=e)}function wu(t,e){if(!se)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:a.sibling=null}}function Re(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,a=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags&65011712,a|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags,a|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=a,t.childLanes=n,e}function f1(t,e,n){var a=e.pendingProps;switch(Ry(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Re(e),null;case 1:return Re(e),null;case 3:return n=e.stateNode,a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),Na(Ze),qs(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(_s(e)?Ca(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Jm())),Re(e),null;case 26:var r=e.type,i=e.memoizedState;return t===null?(Ca(e),i!==null?(Re(e),ow(e,i)):(Re(e),og(e,r,null,a,n))):i?i!==t.memoizedState?(Ca(e),Re(e),ow(e,i)):(Re(e),e.flags&=-16777217):(t=t.memoizedProps,t!==a&&Ca(e),Re(e),og(e,r,t,a,n)),null;case 27:if(Xd(e),n=Or.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&Ca(e);else{if(!a){if(e.stateNode===null)throw Error(O(166));return Re(e),null}t=Zn.current,_s(e)?ME(e,t):(t=hb(r,a,n),e.stateNode=t,Ca(e))}return Re(e),null;case 5:if(Xd(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&Ca(e);else{if(!a){if(e.stateNode===null)throw Error(O(166));return Re(e),null}if(i=Zn.current,_s(e))ME(e,i);else{var s=_f(Or.current);switch(i){case 1:i=s.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:i=s.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":i=s.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":i=s.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":i=s.createElement("div"),i.innerHTML="<script><\/script>",i=i.removeChild(i.firstChild);break;case"select":i=typeof a.is=="string"?s.createElement("select",{is:a.is}):s.createElement("select"),a.multiple?i.multiple=!0:a.size&&(i.size=a.size);break;default:i=typeof a.is=="string"?s.createElement(r,{is:a.is}):s.createElement(r)}}i[Et]=e,i[Kt]=a;e:for(s=e.child;s!==null;){if(s.tag===5||s.tag===6)i.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===e)break e;for(;s.sibling===null;){if(s.return===null||s.return===e)break e;s=s.return}s.sibling.return=s.return,s=s.sibling}e.stateNode=i;e:switch(At(i,r,a),r){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&Ca(e)}}return Re(e),og(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==a&&Ca(e);else{if(typeof a!="string"&&e.stateNode===null)throw Error(O(166));if(t=Or.current,_s(e)){if(t=e.stateNode,n=e.memoizedProps,a=null,r=wt,r!==null)switch(r.tag){case 27:case 5:a=r.memoizedProps}t[Et]=e,t=!!(t.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||lb(t.nodeValue,n)),t||Gr(e,!0)}else t=_f(t).createTextNode(a),t[Et]=e,e.stateNode=t}return Re(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(a=_s(e),n!==null){if(t===null){if(!a)throw Error(O(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(O(557));t[Et]=e}else wi(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Re(e),t=!1}else n=Jm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(tn(e),e):(tn(e),null);if(e.flags&128)throw Error(O(558))}return Re(e),null;case 13:if(a=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=_s(e),a!==null&&a.dehydrated!==null){if(t===null){if(!r)throw Error(O(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(O(317));r[Et]=e}else wi(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Re(e),r=!1}else r=Jm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(tn(e),e):(tn(e),null)}return tn(e),e.flags&128?(e.lanes=n,e):(n=a!==null,t=t!==null&&t.memoizedState!==null,n&&(a=e.child,r=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(r=a.alternate.memoizedState.cachePool.pool),i=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(i=a.memoizedState.cachePool.pool),i!==r&&(a.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Ad(e,e.updateQueue),Re(e),null);case 4:return qs(),t===null&&n_(e.stateNode.containerInfo),Re(e),null;case 10:return Na(e.type),Re(e),null;case 19:if(gt(je),a=e.memoizedState,a===null)return Re(e),null;if(r=(e.flags&128)!==0,i=a.rendering,i===null)if(r)wu(a,!1);else{if(qe!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(i=sf(t),i!==null){for(e.flags|=128,wu(a,!1),t=i.updateQueue,e.updateQueue=t,Ad(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)wC(n,t),n=n.sibling;return we(je,je.current&1|2),se&&Ra(e,a.treeForkCount),e.child}t=t.sibling}a.tail!==null&&rn()>ff&&(e.flags|=128,r=!0,wu(a,!1),e.lanes=4194304)}else{if(!r)if(t=sf(i),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Ad(e,t),wu(a,!0),a.tail===null&&a.tailMode==="hidden"&&!i.alternate&&!se)return Re(e),null}else 2*rn()-a.renderingStartTime>ff&&n!==536870912&&(e.flags|=128,r=!0,wu(a,!1),e.lanes=4194304);a.isBackwards?(i.sibling=e.child,e.child=i):(t=a.last,t!==null?t.sibling=i:e.child=i,a.last=i)}return a.tail!==null?(t=a.tail,a.rendering=t,a.tail=t.sibling,a.renderingStartTime=rn(),t.sibling=null,n=je.current,we(je,r?n&1|2:n&1),se&&Ra(e,a.treeForkCount),t):(Re(e),null);case 22:case 23:return tn(e),Oy(),a=e.memoizedState!==null,t!==null?t.memoizedState!==null!==a&&(e.flags|=8192):a&&(e.flags|=8192),a?n&536870912&&!(e.flags&128)&&(Re(e),e.subtreeFlags&6&&(e.flags|=8192)):Re(e),n=e.updateQueue,n!==null&&Ad(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),a=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),a!==n&&(e.flags|=2048),t!==null&&gt(Si),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),Na(Ze),Re(e),null;case 25:return null;case 30:return null}throw Error(O(156,e.tag))}function h1(t,e){switch(Ry(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Na(Ze),qs(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return Xd(e),null;case 31:if(e.memoizedState!==null){if(tn(e),e.alternate===null)throw Error(O(340));wi()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(tn(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(O(340));wi()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return gt(je),null;case 4:return qs(),null;case 10:return Na(e.type),null;case 22:case 23:return tn(e),Oy(),t!==null&&gt(Si),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Na(Ze),null;case 25:return null;default:return null}}function wA(t,e){switch(Ry(e),e.tag){case 3:Na(Ze),qs();break;case 26:case 27:case 5:Xd(e);break;case 4:qs();break;case 31:e.memoizedState!==null&&tn(e);break;case 13:tn(e);break;case 19:gt(je);break;case 10:Na(e.type);break;case 22:case 23:tn(e),Oy(),t!==null&&gt(Si);break;case 24:Na(Ze)}}function pl(t,e){try{var n=e.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var r=a.next;n=r;do{if((n.tag&t)===t){a=void 0;var i=n.create,s=n.inst;a=i(),s.destroy=a}n=n.next}while(n!==r)}}catch(u){ge(e,e.return,u)}}function jr(t,e,n){try{var a=e.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var i=r.next;a=i;do{if((a.tag&t)===t){var s=a.inst,u=s.destroy;if(u!==void 0){s.destroy=void 0,r=e;var l=n,c=u;try{c()}catch(f){ge(r,l,f)}}}a=a.next}while(a!==i)}}catch(f){ge(e,e.return,f)}}function CA(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{OC(e,n)}catch(a){ge(t,t.return,a)}}}function AA(t,e,n){n.props=Li(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(a){ge(t,e,a)}}function qu(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var a=t.stateNode;break;case 30:a=t.stateNode;break;default:a=t.stateNode}typeof n=="function"?t.refCleanup=n(a):n.current=a}}catch(r){ge(t,e,r)}}function Jn(t,e){var n=t.ref,a=t.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(r){ge(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){ge(t,e,r)}else n.current=null}function bA(t){var e=t.type,n=t.memoizedProps,a=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(r){ge(t,t.return,r)}}function ug(t,e,n){try{var a=t.stateNode;P1(a,t.type,n,e),a[Kt]=e}catch(r){ge(t,t.return,r)}}function LA(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Qr(t.type)||t.tag===4}function lg(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||LA(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Qr(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function $g(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Da));else if(a!==4&&(a===27&&Qr(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for($g(t,e,n),t=t.sibling;t!==null;)$g(t,e,n),t=t.sibling}function df(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(a!==4&&(a===27&&Qr(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(df(t,e,n),t=t.sibling;t!==null;)df(t,e,n),t=t.sibling}function RA(t){var e=t.stateNode,n=t.memoizedProps;try{for(var a=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);At(e,a,n),e[Et]=t,e[Kt]=n}catch(i){ge(t,t.return,i)}}var xa=!1,Je=!1,cg=!1,uw=typeof WeakSet=="function"?WeakSet:Set,pt=null;function p1(t,e){if(t=t.containerInfo,ry=vf,t=gC(t),wy(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var a=n.getSelection&&n.getSelection();if(a&&a.rangeCount!==0){n=a.anchorNode;var r=a.anchorOffset,i=a.focusNode;a=a.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var s=0,u=-1,l=-1,c=0,f=0,m=t,p=null;t:for(;;){for(var _;m!==n||r!==0&&m.nodeType!==3||(u=s+r),m!==i||a!==0&&m.nodeType!==3||(l=s+a),m.nodeType===3&&(s+=m.nodeValue.length),(_=m.firstChild)!==null;)p=m,m=_;for(;;){if(m===t)break t;if(p===n&&++c===r&&(u=s),p===i&&++f===a&&(l=s),(_=m.nextSibling)!==null)break;m=p,p=m.parentNode}m=_}n=u===-1||l===-1?null:{start:u,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(iy={focusedElem:t,selectionRange:n},vf=!1,pt=e;pt!==null;)if(e=pt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,pt=t;else for(;pt!==null;){switch(e=pt,i=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&i!==null){t=void 0,n=e,r=i.memoizedProps,i=i.memoizedState,a=n.stateNode;try{var L=Li(n.type,r);t=a.getSnapshotBeforeUpdate(L,i),a.__reactInternalSnapshotBeforeUpdate=t}catch(k){ge(n,n.return,k)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)oy(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":oy(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(O(163))}if(t=e.sibling,t!==null){t.return=e.return,pt=t;break}pt=e.return}}function xA(t,e,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:ba(t,n),a&4&&pl(5,n);break;case 1:if(ba(t,n),a&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(s){ge(n,n.return,s)}else{var r=Li(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(s){ge(n,n.return,s)}}a&64&&CA(n),a&512&&qu(n,n.return);break;case 3:if(ba(t,n),a&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{OC(t,e)}catch(s){ge(n,n.return,s)}}break;case 27:e===null&&a&4&&RA(n);case 26:case 5:ba(t,n),e===null&&a&4&&bA(n),a&512&&qu(n,n.return);break;case 12:ba(t,n);break;case 31:ba(t,n),a&4&&PA(t,n);break;case 13:ba(t,n),a&4&&OA(t,n),a&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=E1.bind(null,n),q1(t,n))));break;case 22:if(a=n.memoizedState!==null||xa,!a){e=e!==null&&e.memoizedState!==null||Je,r=xa;var i=Je;xa=a,(Je=e)&&!i?La(t,n,(n.subtreeFlags&8772)!==0):ba(t,n),xa=r,Je=i}break;case 30:break;default:ba(t,n)}}function kA(t){var e=t.alternate;e!==null&&(t.alternate=null,kA(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&_y(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var Pe=null,Gt=!1;function Aa(t,e,n){for(n=n.child;n!==null;)DA(t,e,n),n=n.sibling}function DA(t,e,n){if(sn&&typeof sn.onCommitFiberUnmount=="function")try{sn.onCommitFiberUnmount(ol,n)}catch{}switch(n.tag){case 26:Je||Jn(n,e),Aa(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Je||Jn(n,e);var a=Pe,r=Gt;Qr(n.type)&&(Pe=n.stateNode,Gt=!1),Aa(t,e,n),ju(n.stateNode),Pe=a,Gt=r;break;case 5:Je||Jn(n,e);case 6:if(a=Pe,r=Gt,Pe=null,Aa(t,e,n),Pe=a,Gt=r,Pe!==null)if(Gt)try{(Pe.nodeType===9?Pe.body:Pe.nodeName==="HTML"?Pe.ownerDocument.body:Pe).removeChild(n.stateNode)}catch(i){ge(n,e,i)}else try{Pe.removeChild(n.stateNode)}catch(i){ge(n,e,i)}break;case 18:Pe!==null&&(Gt?(t=Pe,Ew(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),$s(t)):Ew(Pe,n.stateNode));break;case 4:a=Pe,r=Gt,Pe=n.stateNode.containerInfo,Gt=!0,Aa(t,e,n),Pe=a,Gt=r;break;case 0:case 11:case 14:case 15:jr(2,n,e),Je||jr(4,n,e),Aa(t,e,n);break;case 1:Je||(Jn(n,e),a=n.stateNode,typeof a.componentWillUnmount=="function"&&AA(n,e,a)),Aa(t,e,n);break;case 21:Aa(t,e,n);break;case 22:Je=(a=Je)||n.memoizedState!==null,Aa(t,e,n),Je=a;break;default:Aa(t,e,n)}}function PA(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{$s(t)}catch(n){ge(e,e.return,n)}}}function OA(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{$s(t)}catch(n){ge(e,e.return,n)}}function m1(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new uw),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new uw),e;default:throw Error(O(435,t.tag))}}function bd(t,e){var n=m1(t);e.forEach(function(a){if(!n.has(a)){n.add(a);var r=w1.bind(null,t,a);a.then(r,r)}})}function zt(t,e){var n=e.deletions;if(n!==null)for(var a=0;a<n.length;a++){var r=n[a],i=t,s=e,u=s;e:for(;u!==null;){switch(u.tag){case 27:if(Qr(u.type)){Pe=u.stateNode,Gt=!1;break e}break;case 5:Pe=u.stateNode,Gt=!1;break e;case 3:case 4:Pe=u.stateNode.containerInfo,Gt=!0;break e}u=u.return}if(Pe===null)throw Error(O(160));DA(i,s,r),Pe=null,Gt=!1,i=r.alternate,i!==null&&(i.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)NA(e,t),e=e.sibling}var Nn=null;function NA(t,e){var n=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:zt(e,t),Ht(t),a&4&&(jr(3,t,t.return),pl(3,t),jr(5,t,t.return));break;case 1:zt(e,t),Ht(t),a&512&&(Je||n===null||Jn(n,n.return)),a&64&&xa&&(t=t.updateQueue,t!==null&&(a=t.callbacks,a!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?a:n.concat(a))));break;case 26:var r=Nn;if(zt(e,t),Ht(t),a&512&&(Je||n===null||Jn(n,n.return)),a&4){var i=n!==null?n.memoizedState:null;if(a=t.memoizedState,n===null)if(a===null)if(t.stateNode===null){e:{a=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(a){case"title":i=r.getElementsByTagName("title")[0],(!i||i[cl]||i[Et]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=r.createElement(a),r.head.insertBefore(i,r.querySelector("head > title"))),At(i,a,n),i[Et]=t,mt(i),a=i;break e;case"link":var s=xw("link","href",r).get(a+(n.href||""));if(s){for(var u=0;u<s.length;u++)if(i=s[u],i.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&i.getAttribute("rel")===(n.rel==null?null:n.rel)&&i.getAttribute("title")===(n.title==null?null:n.title)&&i.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(u,1);break t}}i=r.createElement(a),At(i,a,n),r.head.appendChild(i);break;case"meta":if(s=xw("meta","content",r).get(a+(n.content||""))){for(u=0;u<s.length;u++)if(i=s[u],i.getAttribute("content")===(n.content==null?null:""+n.content)&&i.getAttribute("name")===(n.name==null?null:n.name)&&i.getAttribute("property")===(n.property==null?null:n.property)&&i.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&i.getAttribute("charset")===(n.charSet==null?null:n.charSet)){s.splice(u,1);break t}}i=r.createElement(a),At(i,a,n),r.head.appendChild(i);break;default:throw Error(O(468,a))}i[Et]=t,mt(i),a=i}t.stateNode=a}else kw(r,t.type,t.stateNode);else t.stateNode=Rw(r,a,t.memoizedProps);else i!==a?(i===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):i.count--,a===null?kw(r,t.type,t.stateNode):Rw(r,a,t.memoizedProps)):a===null&&t.stateNode!==null&&ug(t,t.memoizedProps,n.memoizedProps)}break;case 27:zt(e,t),Ht(t),a&512&&(Je||n===null||Jn(n,n.return)),n!==null&&a&4&&ug(t,t.memoizedProps,n.memoizedProps);break;case 5:if(zt(e,t),Ht(t),a&512&&(Je||n===null||Jn(n,n.return)),t.flags&32){r=t.stateNode;try{Hs(r,"")}catch(L){ge(t,t.return,L)}}a&4&&t.stateNode!=null&&(r=t.memoizedProps,ug(t,r,n!==null?n.memoizedProps:r)),a&1024&&(cg=!0);break;case 6:if(zt(e,t),Ht(t),a&4){if(t.stateNode===null)throw Error(O(162));a=t.memoizedProps,n=t.stateNode;try{n.nodeValue=a}catch(L){ge(t,t.return,L)}}break;case 3:if(jd=null,r=Nn,Nn=If(e.containerInfo),zt(e,t),Nn=r,Ht(t),a&4&&n!==null&&n.memoizedState.isDehydrated)try{$s(e.containerInfo)}catch(L){ge(t,t.return,L)}cg&&(cg=!1,MA(t));break;case 4:a=Nn,Nn=If(t.stateNode.containerInfo),zt(e,t),Ht(t),Nn=a;break;case 12:zt(e,t),Ht(t);break;case 31:zt(e,t),Ht(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,bd(t,a)));break;case 13:zt(e,t),Ht(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Nf=rn()),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,bd(t,a)));break;case 22:r=t.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=xa,f=Je;if(xa=c||r,Je=f||l,zt(e,t),Je=f,xa=c,Ht(t),a&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||l||xa||Je||_i(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){l=n=e;try{if(i=l.stateNode,r)s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none";else{u=l.stateNode;var m=l.memoizedProps.style,p=m!=null&&m.hasOwnProperty("display")?m.display:null;u.style.display=p==null||typeof p=="boolean"?"":(""+p).trim()}}catch(L){ge(l,l.return,L)}}}else if(e.tag===6){if(n===null){l=e;try{l.stateNode.nodeValue=r?"":l.memoizedProps}catch(L){ge(l,l.return,L)}}}else if(e.tag===18){if(n===null){l=e;try{var _=l.stateNode;r?ww(_,!0):ww(l.stateNode,!1)}catch(L){ge(l,l.return,L)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}a&4&&(a=t.updateQueue,a!==null&&(n=a.retryQueue,n!==null&&(a.retryQueue=null,bd(t,n))));break;case 19:zt(e,t),Ht(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,bd(t,a)));break;case 30:break;case 21:break;default:zt(e,t),Ht(t)}}function Ht(t){var e=t.flags;if(e&2){try{for(var n,a=t.return;a!==null;){if(LA(a)){n=a;break}a=a.return}if(n==null)throw Error(O(160));switch(n.tag){case 27:var r=n.stateNode,i=lg(t);df(t,i,r);break;case 5:var s=n.stateNode;n.flags&32&&(Hs(s,""),n.flags&=-33);var u=lg(t);df(t,u,s);break;case 3:case 4:var l=n.stateNode.containerInfo,c=lg(t);$g(t,c,l);break;default:throw Error(O(161))}}catch(f){ge(t,t.return,f)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function MA(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;MA(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function ba(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)xA(t,e.alternate,e),e=e.sibling}function _i(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:jr(4,e,e.return),_i(e);break;case 1:Jn(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&AA(e,e.return,n),_i(e);break;case 27:ju(e.stateNode);case 26:case 5:Jn(e,e.return),_i(e);break;case 22:e.memoizedState===null&&_i(e);break;case 30:_i(e);break;default:_i(e)}t=t.sibling}}function La(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var a=e.alternate,r=t,i=e,s=i.flags;switch(i.tag){case 0:case 11:case 15:La(r,i,n),pl(4,i);break;case 1:if(La(r,i,n),a=i,r=a.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){ge(a,a.return,c)}if(a=i,r=a.updateQueue,r!==null){var u=a.stateNode;try{var l=r.shared.hiddenCallbacks;if(l!==null)for(r.shared.hiddenCallbacks=null,r=0;r<l.length;r++)PC(l[r],u)}catch(c){ge(a,a.return,c)}}n&&s&64&&CA(i),qu(i,i.return);break;case 27:RA(i);case 26:case 5:La(r,i,n),n&&a===null&&s&4&&bA(i),qu(i,i.return);break;case 12:La(r,i,n);break;case 31:La(r,i,n),n&&s&4&&PA(r,i);break;case 13:La(r,i,n),n&&s&4&&OA(r,i);break;case 22:i.memoizedState===null&&La(r,i,n),qu(i,i.return);break;case 30:break;default:La(r,i,n)}e=e.sibling}}function Xy(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&fl(n))}function $y(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&fl(t))}function On(t,e,n,a){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)UA(t,e,n,a),e=e.sibling}function UA(t,e,n,a){var r=e.flags;switch(e.tag){case 0:case 11:case 15:On(t,e,n,a),r&2048&&pl(9,e);break;case 1:On(t,e,n,a);break;case 3:On(t,e,n,a),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&fl(t)));break;case 12:if(r&2048){On(t,e,n,a),t=e.stateNode;try{var i=e.memoizedProps,s=i.id,u=i.onPostCommit;typeof u=="function"&&u(s,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){ge(e,e.return,l)}}else On(t,e,n,a);break;case 31:On(t,e,n,a);break;case 13:On(t,e,n,a);break;case 23:break;case 22:i=e.stateNode,s=e.alternate,e.memoizedState!==null?i._visibility&2?On(t,e,n,a):zu(t,e):i._visibility&2?On(t,e,n,a):(i._visibility|=2,Ts(t,e,n,a,(e.subtreeFlags&10256)!==0||!1)),r&2048&&Xy(s,e);break;case 24:On(t,e,n,a),r&2048&&$y(e.alternate,e);break;default:On(t,e,n,a)}}function Ts(t,e,n,a,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var i=t,s=e,u=n,l=a,c=s.flags;switch(s.tag){case 0:case 11:case 15:Ts(i,s,u,l,r),pl(8,s);break;case 23:break;case 22:var f=s.stateNode;s.memoizedState!==null?f._visibility&2?Ts(i,s,u,l,r):zu(i,s):(f._visibility|=2,Ts(i,s,u,l,r)),r&&c&2048&&Xy(s.alternate,s);break;case 24:Ts(i,s,u,l,r),r&&c&2048&&$y(s.alternate,s);break;default:Ts(i,s,u,l,r)}e=e.sibling}}function zu(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,a=e,r=a.flags;switch(a.tag){case 22:zu(n,a),r&2048&&Xy(a.alternate,a);break;case 24:zu(n,a),r&2048&&$y(a.alternate,a);break;default:zu(n,a)}e=e.sibling}}var Du=8192;function Is(t,e,n){if(t.subtreeFlags&Du)for(t=t.child;t!==null;)VA(t,e,n),t=t.sibling}function VA(t,e,n){switch(t.tag){case 26:Is(t,e,n),t.flags&Du&&t.memoizedState!==null&&Z1(n,Nn,t.memoizedState,t.memoizedProps);break;case 5:Is(t,e,n);break;case 3:case 4:var a=Nn;Nn=If(t.stateNode.containerInfo),Is(t,e,n),Nn=a;break;case 22:t.memoizedState===null&&(a=t.alternate,a!==null&&a.memoizedState!==null?(a=Du,Du=16777216,Is(t,e,n),Du=a):Is(t,e,n));break;default:Is(t,e,n)}}function FA(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function Cu(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];pt=a,qA(a,t)}FA(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)BA(t),t=t.sibling}function BA(t){switch(t.tag){case 0:case 11:case 15:Cu(t),t.flags&2048&&jr(9,t,t.return);break;case 3:Cu(t);break;case 12:Cu(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,Hd(t)):Cu(t);break;default:Cu(t)}}function Hd(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];pt=a,qA(a,t)}FA(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:jr(8,e,e.return),Hd(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,Hd(e));break;default:Hd(e)}t=t.sibling}}function qA(t,e){for(;pt!==null;){var n=pt;switch(n.tag){case 0:case 11:case 15:jr(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:fl(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,pt=a;else e:for(n=t;pt!==null;){a=pt;var r=a.sibling,i=a.return;if(kA(a),a===n){pt=null;break e}if(r!==null){r.return=i,pt=r;break e}pt=i}}}var g1={getCacheForType:function(t){var e=Ct(Ze),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return Ct(Ze).controller.signal}},y1=typeof WeakMap=="function"?WeakMap:Map,de=0,Ee=null,re=null,ie=0,me=0,en=null,kr=!1,no=!1,Jy=!1,qa=0,qe=0,Wr=0,Ei=0,Zy=0,an=0,Ks=0,Hu=null,jt=null,Jg=!1,Nf=0,zA=0,ff=1/0,hf=null,Vr=null,ot=0,Fr=null,Qs=null,Ma=0,Zg=0,ey=null,HA=null,Gu=0,ty=null;function un(){return de&2&&ie!==0?ie&-ie:Q.T!==null?t_():Jw()}function GA(){if(an===0)if(!(ie&536870912)||se){var t=yd;yd<<=1,!(yd&3932160)&&(yd=262144),an=t}else an=536870912;return t=cn.current,t!==null&&(t.flags|=32),an}function Wt(t,e,n){(t===Ee&&(me===2||me===9)||t.cancelPendingCommit!==null)&&(Ys(t,0),Dr(t,ie,an,!1)),ll(t,n),(!(de&2)||t!==Ee)&&(t===Ee&&(!(de&2)&&(Ei|=n),qe===4&&Dr(t,ie,an,!1)),ta(t))}function jA(t,e,n){if(de&6)throw Error(O(327));var a=!n&&(e&127)===0&&(e&t.expiredLanes)===0||ul(t,e),r=a?T1(t,e):dg(t,e,!0),i=a;do{if(r===0){no&&!a&&Dr(t,e,0,!1);break}else{if(n=t.current.alternate,i&&!_1(n)){r=dg(t,e,!1),i=!1;continue}if(r===2){if(i=e,t.errorRecoveryDisabledLanes&i)var s=0;else s=t.pendingLanes&-536870913,s=s!==0?s:s&536870912?536870912:0;if(s!==0){e=s;e:{var u=t;r=Hu;var l=u.current.memoizedState.isDehydrated;if(l&&(Ys(u,s).flags|=256),s=dg(u,s,!1),s!==2){if(Jy&&!l){u.errorRecoveryDisabledLanes|=i,Ei|=i,r=4;break e}i=jt,jt=r,i!==null&&(jt===null?jt=i:jt.push.apply(jt,i))}r=s}if(i=!1,r!==2)continue}}if(r===1){Ys(t,0),Dr(t,e,0,!0);break}e:{switch(a=t,i=r,i){case 0:case 1:throw Error(O(345));case 4:if((e&4194048)!==e)break;case 6:Dr(a,e,an,!kr);break e;case 2:jt=null;break;case 3:case 5:break;default:throw Error(O(329))}if((e&62914560)===e&&(r=Nf+300-rn(),10<r)){if(Dr(a,e,an,!kr),wf(a,0,!0)!==0)break e;Ma=e,a.timeoutHandle=db(lw.bind(null,a,n,jt,hf,Jg,e,an,Ei,Ks,kr,i,"Throttled",-0,0),r);break e}lw(a,n,jt,hf,Jg,e,an,Ei,Ks,kr,i,null,-0,0)}}break}while(!0);ta(t)}function lw(t,e,n,a,r,i,s,u,l,c,f,m,p,_){if(t.timeoutHandle=-1,m=e.subtreeFlags,m&8192||(m&16785408)===16785408){m={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Da},VA(e,i,m);var L=(i&62914560)===i?Nf-rn():(i&4194048)===i?zA-rn():0;if(L=eO(m,L),L!==null){Ma=i,t.cancelPendingCommit=L(dw.bind(null,t,e,i,n,a,r,s,u,l,f,m,null,p,_)),Dr(t,i,s,!c);return}}dw(t,e,i,n,a,r,s,u,l)}function _1(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var r=n[a],i=r.getSnapshot;r=r.value;try{if(!ln(i(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Dr(t,e,n,a){e&=~Zy,e&=~Ei,t.suspendedLanes|=e,t.pingedLanes&=~e,a&&(t.warmLanes|=e),a=t.expirationTimes;for(var r=e;0<r;){var i=31-on(r),s=1<<i;a[i]=-1,r&=~s}n!==0&&Yw(t,n,e)}function Mf(){return de&6?!0:(ml(0,!1),!1)}function e_(){if(re!==null){if(me===0)var t=re.return;else t=re,Pa=Pi=null,Fy(t),Vs=null,Ju=0,t=re;for(;t!==null;)wA(t.alternate,t),t=t.return;re=null}}function Ys(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,M1(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),Ma=0,e_(),Ee=t,re=n=Oa(t.current,null),ie=e,me=0,en=null,kr=!1,no=ul(t,e),Jy=!1,Ks=an=Zy=Ei=Wr=qe=0,jt=Hu=null,Jg=!1,e&8&&(e|=e&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=e;0<a;){var r=31-on(a),i=1<<r;e|=t[r],a&=~i}return qa=e,Lf(),n}function WA(t,e){J=null,Q.H=el,e===to||e===xf?(e=qE(),me=3):e===Dy?(e=qE(),me=4):me=e===Qy?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,en=e,re===null&&(qe=1,lf(t,vn(e,t.current)))}function KA(){var t=cn.current;return t===null?!0:(ie&4194048)===ie?wn===null:(ie&62914560)===ie||ie&536870912?t===wn:!1}function QA(){var t=Q.H;return Q.H=el,t===null?el:t}function YA(){var t=Q.A;return Q.A=g1,t}function pf(){qe=4,kr||(ie&4194048)!==ie&&cn.current!==null||(no=!0),!(Wr&134217727)&&!(Ei&134217727)||Ee===null||Dr(Ee,ie,an,!1)}function dg(t,e,n){var a=de;de|=2;var r=QA(),i=YA();(Ee!==t||ie!==e)&&(hf=null,Ys(t,e)),e=!1;var s=qe;e:do try{if(me!==0&&re!==null){var u=re,l=en;switch(me){case 8:e_(),s=6;break e;case 3:case 2:case 9:case 6:cn.current===null&&(e=!0);var c=me;if(me=0,en=null,Ps(t,u,l,c),n&&no){s=0;break e}break;default:c=me,me=0,en=null,Ps(t,u,l,c)}}I1(),s=qe;break}catch(f){WA(t,f)}while(!0);return e&&t.shellSuspendCounter++,Pa=Pi=null,de=a,Q.H=r,Q.A=i,re===null&&(Ee=null,ie=0,Lf()),s}function I1(){for(;re!==null;)XA(re)}function T1(t,e){var n=de;de|=2;var a=QA(),r=YA();Ee!==t||ie!==e?(hf=null,ff=rn()+500,Ys(t,e)):no=ul(t,e);e:do try{if(me!==0&&re!==null){e=re;var i=en;t:switch(me){case 1:me=0,en=null,Ps(t,e,i,1);break;case 2:case 9:if(BE(i)){me=0,en=null,cw(e);break}e=function(){me!==2&&me!==9||Ee!==t||(me=7),ta(t)},i.then(e,e);break e;case 3:me=7;break e;case 4:me=5;break e;case 7:BE(i)?(me=0,en=null,cw(e)):(me=0,en=null,Ps(t,e,i,7));break;case 5:var s=null;switch(re.tag){case 26:s=re.memoizedState;case 5:case 27:var u=re;if(s?gb(s):u.stateNode.complete){me=0,en=null;var l=u.sibling;if(l!==null)re=l;else{var c=u.return;c!==null?(re=c,Uf(c)):re=null}break t}}me=0,en=null,Ps(t,e,i,5);break;case 6:me=0,en=null,Ps(t,e,i,6);break;case 8:e_(),qe=6;break e;default:throw Error(O(462))}}S1();break}catch(f){WA(t,f)}while(!0);return Pa=Pi=null,Q.H=a,Q.A=r,de=n,re!==null?0:(Ee=null,ie=0,Lf(),qe)}function S1(){for(;re!==null&&!GD();)XA(re)}function XA(t){var e=EA(t.alternate,t,qa);t.memoizedProps=t.pendingProps,e===null?Uf(t):re=e}function cw(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=aw(n,e,e.pendingProps,e.type,void 0,ie);break;case 11:e=aw(n,e,e.pendingProps,e.type.render,e.ref,ie);break;case 5:Fy(e);default:wA(n,e),e=re=wC(e,qa),e=EA(n,e,qa)}t.memoizedProps=t.pendingProps,e===null?Uf(t):re=e}function Ps(t,e,n,a){Pa=Pi=null,Fy(e),Vs=null,Ju=0;var r=e.return;try{if(l1(t,r,e,n,ie)){qe=1,lf(t,vn(n,t.current)),re=null;return}}catch(i){if(r!==null)throw re=r,i;qe=1,lf(t,vn(n,t.current)),re=null;return}e.flags&32768?(se||a===1?t=!0:no||ie&536870912?t=!1:(kr=t=!0,(a===2||a===9||a===3||a===6)&&(a=cn.current,a!==null&&a.tag===13&&(a.flags|=16384))),$A(e,t)):Uf(e)}function Uf(t){var e=t;do{if(e.flags&32768){$A(e,kr);return}t=e.return;var n=f1(e.alternate,e,qa);if(n!==null){re=n;return}if(e=e.sibling,e!==null){re=e;return}re=e=t}while(e!==null);qe===0&&(qe=5)}function $A(t,e){do{var n=h1(t.alternate,t);if(n!==null){n.flags&=32767,re=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){re=t;return}re=t=n}while(t!==null);qe=6,re=null}function dw(t,e,n,a,r,i,s,u,l){t.cancelPendingCommit=null;do Vf();while(ot!==0);if(de&6)throw Error(O(327));if(e!==null){if(e===t.current)throw Error(O(177));if(i=e.lanes|e.childLanes,i|=Cy,eP(t,n,i,s,u,l),t===Ee&&(re=Ee=null,ie=0),Qs=e,Fr=t,Ma=n,Zg=i,ey=r,HA=a,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,C1($d,function(){return nb(),null})):(t.callbackNode=null,t.callbackPriority=0),a=(e.flags&13878)!==0,e.subtreeFlags&13878||a){a=Q.T,Q.T=null,r=fe.p,fe.p=2,s=de,de|=4;try{p1(t,e,n)}finally{de=s,fe.p=r,Q.T=a}}ot=1,JA(),ZA(),eb()}}function JA(){if(ot===1){ot=0;var t=Fr,e=Qs,n=(e.flags&13878)!==0;if(e.subtreeFlags&13878||n){n=Q.T,Q.T=null;var a=fe.p;fe.p=2;var r=de;de|=4;try{NA(e,t);var i=iy,s=gC(t.containerInfo),u=i.focusedElem,l=i.selectionRange;if(s!==u&&u&&u.ownerDocument&&mC(u.ownerDocument.documentElement,u)){if(l!==null&&wy(u)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in u)u.selectionStart=c,u.selectionEnd=Math.min(f,u.value.length);else{var m=u.ownerDocument||document,p=m&&m.defaultView||window;if(p.getSelection){var _=p.getSelection(),L=u.textContent.length,k=Math.min(l.start,L),P=l.end===void 0?k:Math.min(l.end,L);!_.extend&&k>P&&(s=P,P=k,k=s);var E=PE(u,k),S=PE(u,P);if(E&&S&&(_.rangeCount!==1||_.anchorNode!==E.node||_.anchorOffset!==E.offset||_.focusNode!==S.node||_.focusOffset!==S.offset)){var A=m.createRange();A.setStart(E.node,E.offset),_.removeAllRanges(),k>P?(_.addRange(A),_.extend(S.node,S.offset)):(A.setEnd(S.node,S.offset),_.addRange(A))}}}}for(m=[],_=u;_=_.parentNode;)_.nodeType===1&&m.push({element:_,left:_.scrollLeft,top:_.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<m.length;u++){var x=m[u];x.element.scrollLeft=x.left,x.element.scrollTop=x.top}}vf=!!ry,iy=ry=null}finally{de=r,fe.p=a,Q.T=n}}t.current=e,ot=2}}function ZA(){if(ot===2){ot=0;var t=Fr,e=Qs,n=(e.flags&8772)!==0;if(e.subtreeFlags&8772||n){n=Q.T,Q.T=null;var a=fe.p;fe.p=2;var r=de;de|=4;try{xA(t,e.alternate,e)}finally{de=r,fe.p=a,Q.T=n}}ot=3}}function eb(){if(ot===4||ot===3){ot=0,jD();var t=Fr,e=Qs,n=Ma,a=HA;e.subtreeFlags&10256||e.flags&10256?ot=5:(ot=0,Qs=Fr=null,tb(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(Vr=null),yy(n),e=e.stateNode,sn&&typeof sn.onCommitFiberRoot=="function")try{sn.onCommitFiberRoot(ol,e,void 0,(e.current.flags&128)===128)}catch{}if(a!==null){e=Q.T,r=fe.p,fe.p=2,Q.T=null;try{for(var i=t.onRecoverableError,s=0;s<a.length;s++){var u=a[s];i(u.value,{componentStack:u.stack})}}finally{Q.T=e,fe.p=r}}Ma&3&&Vf(),ta(t),r=t.pendingLanes,n&261930&&r&42?t===ty?Gu++:(Gu=0,ty=t):Gu=0,ml(0,!1)}}function tb(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,fl(e)))}function Vf(){return JA(),ZA(),eb(),nb()}function nb(){if(ot!==5)return!1;var t=Fr,e=Zg;Zg=0;var n=yy(Ma),a=Q.T,r=fe.p;try{fe.p=32>n?32:n,Q.T=null,n=ey,ey=null;var i=Fr,s=Ma;if(ot=0,Qs=Fr=null,Ma=0,de&6)throw Error(O(331));var u=de;if(de|=4,BA(i.current),UA(i,i.current,s,n),de=u,ml(0,!1),sn&&typeof sn.onPostCommitFiberRoot=="function")try{sn.onPostCommitFiberRoot(ol,i)}catch{}return!0}finally{fe.p=r,Q.T=a,tb(t,e)}}function fw(t,e,n){e=vn(n,e),e=Qg(t.stateNode,e,2),t=Ur(t,e,2),t!==null&&(ll(t,2),ta(t))}function ge(t,e,n){if(t.tag===3)fw(t,t,n);else for(;e!==null;){if(e.tag===3){fw(e,t,n);break}else if(e.tag===1){var a=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(Vr===null||!Vr.has(a))){t=vn(n,t),n=yA(2),a=Ur(e,n,2),a!==null&&(_A(n,a,e,t),ll(a,2),ta(a));break}}e=e.return}}function fg(t,e,n){var a=t.pingCache;if(a===null){a=t.pingCache=new y1;var r=new Set;a.set(e,r)}else r=a.get(e),r===void 0&&(r=new Set,a.set(e,r));r.has(n)||(Jy=!0,r.add(n),t=v1.bind(null,t,e,n),e.then(t,t))}function v1(t,e,n){var a=t.pingCache;a!==null&&a.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,Ee===t&&(ie&n)===n&&(qe===4||qe===3&&(ie&62914560)===ie&&300>rn()-Nf?!(de&2)&&Ys(t,0):Zy|=n,Ks===ie&&(Ks=0)),ta(t)}function ab(t,e){e===0&&(e=Qw()),t=Di(t,e),t!==null&&(ll(t,e),ta(t))}function E1(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),ab(t,n)}function w1(t,e){var n=0;switch(t.tag){case 31:case 13:var a=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:a=t.stateNode;break;case 22:a=t.stateNode._retryCache;break;default:throw Error(O(314))}a!==null&&a.delete(e),ab(t,n)}function C1(t,e){return my(t,e)}var mf=null,Ss=null,ny=!1,gf=!1,hg=!1,Pr=0;function ta(t){t!==Ss&&t.next===null&&(Ss===null?mf=Ss=t:Ss=Ss.next=t),gf=!0,ny||(ny=!0,b1())}function ml(t,e){if(!hg&&gf){hg=!0;do for(var n=!1,a=mf;a!==null;){if(!e)if(t!==0){var r=a.pendingLanes;if(r===0)var i=0;else{var s=a.suspendedLanes,u=a.pingedLanes;i=(1<<31-on(42|t)+1)-1,i&=r&~(s&~u),i=i&201326741?i&201326741|1:i?i|2:0}i!==0&&(n=!0,hw(a,i))}else i=ie,i=wf(a,a===Ee?i:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(i&3)||ul(a,i)||(n=!0,hw(a,i));a=a.next}while(n);hg=!1}}function A1(){rb()}function rb(){gf=ny=!1;var t=0;Pr!==0&&N1()&&(t=Pr);for(var e=rn(),n=null,a=mf;a!==null;){var r=a.next,i=ib(a,e);i===0?(a.next=null,n===null?mf=r:n.next=r,r===null&&(Ss=n)):(n=a,(t!==0||i&3)&&(gf=!0)),a=r}ot!==0&&ot!==5||ml(t,!1),Pr!==0&&(Pr=0)}function ib(t,e){for(var n=t.suspendedLanes,a=t.pingedLanes,r=t.expirationTimes,i=t.pendingLanes&-62914561;0<i;){var s=31-on(i),u=1<<s,l=r[s];l===-1?(!(u&n)||u&a)&&(r[s]=ZD(u,e)):l<=e&&(t.expiredLanes|=u),i&=~u}if(e=Ee,n=ie,n=wf(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a=t.callbackNode,n===0||t===e&&(me===2||me===9)||t.cancelPendingCommit!==null)return a!==null&&a!==null&&zm(a),t.callbackNode=null,t.callbackPriority=0;if(!(n&3)||ul(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(a!==null&&zm(a),yy(n)){case 2:case 8:n=Ww;break;case 32:n=$d;break;case 268435456:n=Kw;break;default:n=$d}return a=sb.bind(null,t),n=my(n,a),t.callbackPriority=e,t.callbackNode=n,e}return a!==null&&a!==null&&zm(a),t.callbackPriority=2,t.callbackNode=null,2}function sb(t,e){if(ot!==0&&ot!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(Vf()&&t.callbackNode!==n)return null;var a=ie;return a=wf(t,t===Ee?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a===0?null:(jA(t,a,e),ib(t,rn()),t.callbackNode!=null&&t.callbackNode===n?sb.bind(null,t):null)}function hw(t,e){if(Vf())return null;jA(t,e,!0)}function b1(){U1(function(){de&6?my(jw,A1):rb()})}function t_(){if(Pr===0){var t=Gs;t===0&&(t=gd,gd<<=1,!(gd&261888)&&(gd=256)),Pr=t}return Pr}function pw(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Od(""+t)}function mw(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function L1(t,e,n,a,r){if(e==="submit"&&n&&n.stateNode===r){var i=pw((r[Kt]||null).action),s=a.submitter;s&&(e=(e=s[Kt]||null)?pw(e.formAction):s.getAttribute("formAction"),e!==null&&(i=e,s=null));var u=new Cf("action","action",null,a,r);t.push({event:u,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(Pr!==0){var l=s?mw(r,s):new FormData(r);Wg(n,{pending:!0,data:l,method:r.method,action:i},null,l)}}else typeof i=="function"&&(u.preventDefault(),l=s?mw(r,s):new FormData(r),Wg(n,{pending:!0,data:l,method:r.method,action:i},i,l))},currentTarget:r}]})}}for(Ld=0;Ld<Og.length;Ld++)Rd=Og[Ld],gw=Rd.toLowerCase(),yw=Rd[0].toUpperCase()+Rd.slice(1),Mn(gw,"on"+yw);var Rd,gw,yw,Ld;Mn(_C,"onAnimationEnd");Mn(IC,"onAnimationIteration");Mn(TC,"onAnimationStart");Mn("dblclick","onDoubleClick");Mn("focusin","onFocus");Mn("focusout","onBlur");Mn(WP,"onTransitionRun");Mn(KP,"onTransitionStart");Mn(QP,"onTransitionCancel");Mn(SC,"onTransitionEnd");zs("onMouseEnter",["mouseout","mouseover"]);zs("onMouseLeave",["mouseout","mouseover"]);zs("onPointerEnter",["pointerout","pointerover"]);zs("onPointerLeave",["pointerout","pointerover"]);Ri("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ri("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ri("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ri("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ri("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ri("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var tl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),R1=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(tl));function ob(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var a=t[n],r=a.event;a=a.listeners;e:{var i=void 0;if(e)for(var s=a.length-1;0<=s;s--){var u=a[s],l=u.instance,c=u.currentTarget;if(u=u.listener,l!==i&&r.isPropagationStopped())break e;i=u,r.currentTarget=c;try{i(r)}catch(f){Zd(f)}r.currentTarget=null,i=l}else for(s=0;s<a.length;s++){if(u=a[s],l=u.instance,c=u.currentTarget,u=u.listener,l!==i&&r.isPropagationStopped())break e;i=u,r.currentTarget=c;try{i(r)}catch(f){Zd(f)}r.currentTarget=null,i=l}}}}function ae(t,e){var n=e[Ag];n===void 0&&(n=e[Ag]=new Set);var a=t+"__bubble";n.has(a)||(ub(e,t,2,!1),n.add(a))}function pg(t,e,n){var a=0;e&&(a|=4),ub(n,t,a,e)}var xd="_reactListening"+Math.random().toString(36).slice(2);function n_(t){if(!t[xd]){t[xd]=!0,Zw.forEach(function(n){n!=="selectionchange"&&(R1.has(n)||pg(n,!1,t),pg(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[xd]||(e[xd]=!0,pg("selectionchange",!1,e))}}function ub(t,e,n,a){switch(Sb(e)){case 2:var r=aO;break;case 8:r=rO;break;default:r=s_}n=r.bind(null,e,n,t),r=void 0,!kg||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),a?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function mg(t,e,n,a,r){var i=a;if(!(e&1)&&!(e&2)&&a!==null)e:for(;;){if(a===null)return;var s=a.tag;if(s===3||s===4){var u=a.stateNode.containerInfo;if(u===r)break;if(s===4)for(s=a.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===r)return;s=s.return}for(;u!==null;){if(s=ws(u),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){a=i=s;continue e}u=u.parentNode}}a=a.return}oC(function(){var c=i,f=Ty(n),m=[];e:{var p=vC.get(t);if(p!==void 0){var _=Cf,L=t;switch(t){case"keypress":if(Md(n)===0)break e;case"keydown":case"keyup":_=wP;break;case"focusin":L="focus",_=Km;break;case"focusout":L="blur",_=Km;break;case"beforeblur":case"afterblur":_=Km;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":_=wE;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":_=fP;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":_=bP;break;case _C:case IC:case TC:_=mP;break;case SC:_=RP;break;case"scroll":case"scrollend":_=cP;break;case"wheel":_=kP;break;case"copy":case"cut":case"paste":_=yP;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":_=AE;break;case"toggle":case"beforetoggle":_=PP}var k=(e&4)!==0,P=!k&&(t==="scroll"||t==="scrollend"),E=k?p!==null?p+"Capture":null:p;k=[];for(var S=c,A;S!==null;){var x=S;if(A=x.stateNode,x=x.tag,x!==5&&x!==26&&x!==27||A===null||E===null||(x=Ku(S,E),x!=null&&k.push(nl(S,x,A))),P)break;S=S.return}0<k.length&&(p=new _(p,L,null,n,f),m.push({event:p,listeners:k}))}}if(!(e&7)){e:{if(p=t==="mouseover"||t==="pointerover",_=t==="mouseout"||t==="pointerout",p&&n!==xg&&(L=n.relatedTarget||n.fromElement)&&(ws(L)||L[Js]))break e;if((_||p)&&(p=f.window===f?f:(p=f.ownerDocument)?p.defaultView||p.parentWindow:window,_?(L=n.relatedTarget||n.toElement,_=c,L=L?ws(L):null,L!==null&&(P=sl(L),k=L.tag,L!==P||k!==5&&k!==27&&k!==6)&&(L=null)):(_=null,L=c),_!==L)){if(k=wE,x="onMouseLeave",E="onMouseEnter",S="mouse",(t==="pointerout"||t==="pointerover")&&(k=AE,x="onPointerLeave",E="onPointerEnter",S="pointer"),P=_==null?p:xu(_),A=L==null?p:xu(L),p=new k(x,S+"leave",_,n,f),p.target=P,p.relatedTarget=A,x=null,ws(f)===c&&(k=new k(E,S+"enter",L,n,f),k.target=A,k.relatedTarget=P,x=k),P=x,_&&L)t:{for(k=x1,E=_,S=L,A=0,x=E;x;x=k(x))A++;x=0;for(var V=S;V;V=k(V))x++;for(;0<A-x;)E=k(E),A--;for(;0<x-A;)S=k(S),x--;for(;A--;){if(E===S||S!==null&&E===S.alternate){k=E;break t}E=k(E),S=k(S)}k=null}else k=null;_!==null&&_w(m,p,_,k,!1),L!==null&&P!==null&&_w(m,P,L,k,!0)}}e:{if(p=c?xu(c):window,_=p.nodeName&&p.nodeName.toLowerCase(),_==="select"||_==="input"&&p.type==="file")var M=xE;else if(RE(p))if(hC)M=HP;else{M=qP;var T=BP}else _=p.nodeName,!_||_.toLowerCase()!=="input"||p.type!=="checkbox"&&p.type!=="radio"?c&&Iy(c.elementType)&&(M=xE):M=zP;if(M&&(M=M(t,c))){fC(m,M,n,f);break e}T&&T(t,p,c),t==="focusout"&&c&&p.type==="number"&&c.memoizedProps.value!=null&&Rg(p,"number",p.value)}switch(T=c?xu(c):window,t){case"focusin":(RE(T)||T.contentEditable==="true")&&(bs=T,Dg=c,Nu=null);break;case"focusout":Nu=Dg=bs=null;break;case"mousedown":Pg=!0;break;case"contextmenu":case"mouseup":case"dragend":Pg=!1,OE(m,n,f);break;case"selectionchange":if(jP)break;case"keydown":case"keyup":OE(m,n,f)}var g;if(Ey)e:{switch(t){case"compositionstart":var I="onCompositionStart";break e;case"compositionend":I="onCompositionEnd";break e;case"compositionupdate":I="onCompositionUpdate";break e}I=void 0}else As?cC(t,n)&&(I="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(I="onCompositionStart");I&&(lC&&n.locale!=="ko"&&(As||I!=="onCompositionStart"?I==="onCompositionEnd"&&As&&(g=uC()):(xr=f,Sy="value"in xr?xr.value:xr.textContent,As=!0)),T=yf(c,I),0<T.length&&(I=new CE(I,t,null,n,f),m.push({event:I,listeners:T}),g?I.data=g:(g=dC(n),g!==null&&(I.data=g)))),(g=NP?MP(t,n):UP(t,n))&&(I=yf(c,"onBeforeInput"),0<I.length&&(T=new CE("onBeforeInput","beforeinput",null,n,f),m.push({event:T,listeners:I}),T.data=g)),L1(m,t,c,n,f)}ob(m,e)})}function nl(t,e,n){return{instance:t,listener:e,currentTarget:n}}function yf(t,e){for(var n=e+"Capture",a=[];t!==null;){var r=t,i=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||i===null||(r=Ku(t,n),r!=null&&a.unshift(nl(t,r,i)),r=Ku(t,e),r!=null&&a.push(nl(t,r,i))),t.tag===3)return a;t=t.return}return[]}function x1(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function _w(t,e,n,a,r){for(var i=e._reactName,s=[];n!==null&&n!==a;){var u=n,l=u.alternate,c=u.stateNode;if(u=u.tag,l!==null&&l===a)break;u!==5&&u!==26&&u!==27||c===null||(l=c,r?(c=Ku(n,i),c!=null&&s.unshift(nl(n,c,l))):r||(c=Ku(n,i),c!=null&&s.push(nl(n,c,l)))),n=n.return}s.length!==0&&t.push({event:e,listeners:s})}var k1=/\r\n?/g,D1=/\u0000|\uFFFD/g;function Iw(t){return(typeof t=="string"?t:""+t).replace(k1,`
`).replace(D1,"")}function lb(t,e){return e=Iw(e),Iw(t)===e}function Ie(t,e,n,a,r,i){switch(n){case"children":typeof a=="string"?e==="body"||e==="textarea"&&a===""||Hs(t,a):(typeof a=="number"||typeof a=="bigint")&&e!=="body"&&Hs(t,""+a);break;case"className":Id(t,"class",a);break;case"tabIndex":Id(t,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":Id(t,n,a);break;case"style":sC(t,a,i);break;case"data":if(e!=="object"){Id(t,"data",a);break}case"src":case"href":if(a===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Od(""+a),t.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof i=="function"&&(n==="formAction"?(e!=="input"&&Ie(t,e,"name",r.name,r,null),Ie(t,e,"formEncType",r.formEncType,r,null),Ie(t,e,"formMethod",r.formMethod,r,null),Ie(t,e,"formTarget",r.formTarget,r,null)):(Ie(t,e,"encType",r.encType,r,null),Ie(t,e,"method",r.method,r,null),Ie(t,e,"target",r.target,r,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Od(""+a),t.setAttribute(n,a);break;case"onClick":a!=null&&(t.onclick=Da);break;case"onScroll":a!=null&&ae("scroll",t);break;case"onScrollEnd":a!=null&&ae("scrollend",t);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(O(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(O(60));t.innerHTML=n}}break;case"multiple":t.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":t.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){t.removeAttribute("xlink:href");break}n=Od(""+a),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""+a):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":a===!0?t.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,a):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?t.setAttribute(n,a):t.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?t.removeAttribute(n):t.setAttribute(n,a);break;case"popover":ae("beforetoggle",t),ae("toggle",t),Pd(t,"popover",a);break;case"xlinkActuate":wa(t,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":wa(t,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":wa(t,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":wa(t,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":wa(t,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":wa(t,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":wa(t,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":wa(t,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":wa(t,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":Pd(t,"is",a);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=uP.get(n)||n,Pd(t,n,a))}}function ay(t,e,n,a,r,i){switch(n){case"style":sC(t,a,i);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(O(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(O(60));t.innerHTML=n}}break;case"children":typeof a=="string"?Hs(t,a):(typeof a=="number"||typeof a=="bigint")&&Hs(t,""+a);break;case"onScroll":a!=null&&ae("scroll",t);break;case"onScrollEnd":a!=null&&ae("scrollend",t);break;case"onClick":a!=null&&(t.onclick=Da);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!eC.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),i=t[Kt]||null,i=i!=null?i[n]:null,typeof i=="function"&&t.removeEventListener(e,i,r),typeof a=="function")){typeof i!="function"&&i!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,a,r);break e}n in t?t[n]=a:a===!0?t.setAttribute(n,""):Pd(t,n,a)}}}function At(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ae("error",t),ae("load",t);var a=!1,r=!1,i;for(i in n)if(n.hasOwnProperty(i)){var s=n[i];if(s!=null)switch(i){case"src":a=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(O(137,e));default:Ie(t,e,i,s,n,null)}}r&&Ie(t,e,"srcSet",n.srcSet,n,null),a&&Ie(t,e,"src",n.src,n,null);return;case"input":ae("invalid",t);var u=i=s=r=null,l=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":r=f;break;case"type":s=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":i=f;break;case"defaultValue":u=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(O(137,e));break;default:Ie(t,e,a,f,n,null)}}aC(t,i,u,l,c,s,r,!1);return;case"select":ae("invalid",t),a=s=i=null;for(r in n)if(n.hasOwnProperty(r)&&(u=n[r],u!=null))switch(r){case"value":i=u;break;case"defaultValue":s=u;break;case"multiple":a=u;default:Ie(t,e,r,u,n,null)}e=i,n=s,t.multiple=!!a,e!=null?Ns(t,!!a,e,!1):n!=null&&Ns(t,!!a,n,!0);return;case"textarea":ae("invalid",t),i=r=a=null;for(s in n)if(n.hasOwnProperty(s)&&(u=n[s],u!=null))switch(s){case"value":a=u;break;case"defaultValue":r=u;break;case"children":i=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(O(91));break;default:Ie(t,e,s,u,n,null)}iC(t,a,r,i);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(a=n[l],a!=null))switch(l){case"selected":t.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:Ie(t,e,l,a,n,null)}return;case"dialog":ae("beforetoggle",t),ae("toggle",t),ae("cancel",t),ae("close",t);break;case"iframe":case"object":ae("load",t);break;case"video":case"audio":for(a=0;a<tl.length;a++)ae(tl[a],t);break;case"image":ae("error",t),ae("load",t);break;case"details":ae("toggle",t);break;case"embed":case"source":case"link":ae("error",t),ae("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(O(137,e));default:Ie(t,e,c,a,n,null)}return;default:if(Iy(e)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&ay(t,e,f,a,n,void 0));return}}for(u in n)n.hasOwnProperty(u)&&(a=n[u],a!=null&&Ie(t,e,u,a,n,null))}function P1(t,e,n,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,i=null,s=null,u=null,l=null,c=null,f=null;for(_ in n){var m=n[_];if(n.hasOwnProperty(_)&&m!=null)switch(_){case"checked":break;case"value":break;case"defaultValue":l=m;default:a.hasOwnProperty(_)||Ie(t,e,_,null,a,m)}}for(var p in a){var _=a[p];if(m=n[p],a.hasOwnProperty(p)&&(_!=null||m!=null))switch(p){case"type":i=_;break;case"name":r=_;break;case"checked":c=_;break;case"defaultChecked":f=_;break;case"value":s=_;break;case"defaultValue":u=_;break;case"children":case"dangerouslySetInnerHTML":if(_!=null)throw Error(O(137,e));break;default:_!==m&&Ie(t,e,p,_,a,m)}}Lg(t,s,u,l,c,f,i,r);return;case"select":_=s=u=p=null;for(i in n)if(l=n[i],n.hasOwnProperty(i)&&l!=null)switch(i){case"value":break;case"multiple":_=l;default:a.hasOwnProperty(i)||Ie(t,e,i,null,a,l)}for(r in a)if(i=a[r],l=n[r],a.hasOwnProperty(r)&&(i!=null||l!=null))switch(r){case"value":p=i;break;case"defaultValue":u=i;break;case"multiple":s=i;default:i!==l&&Ie(t,e,r,i,a,l)}e=u,n=s,a=_,p!=null?Ns(t,!!n,p,!1):!!a!=!!n&&(e!=null?Ns(t,!!n,e,!0):Ns(t,!!n,n?[]:"",!1));return;case"textarea":_=p=null;for(u in n)if(r=n[u],n.hasOwnProperty(u)&&r!=null&&!a.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Ie(t,e,u,null,a,r)}for(s in a)if(r=a[s],i=n[s],a.hasOwnProperty(s)&&(r!=null||i!=null))switch(s){case"value":p=r;break;case"defaultValue":_=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(O(91));break;default:r!==i&&Ie(t,e,s,r,a,i)}rC(t,p,_);return;case"option":for(var L in n)if(p=n[L],n.hasOwnProperty(L)&&p!=null&&!a.hasOwnProperty(L))switch(L){case"selected":t.selected=!1;break;default:Ie(t,e,L,null,a,p)}for(l in a)if(p=a[l],_=n[l],a.hasOwnProperty(l)&&p!==_&&(p!=null||_!=null))switch(l){case"selected":t.selected=p&&typeof p!="function"&&typeof p!="symbol";break;default:Ie(t,e,l,p,a,_)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var k in n)p=n[k],n.hasOwnProperty(k)&&p!=null&&!a.hasOwnProperty(k)&&Ie(t,e,k,null,a,p);for(c in a)if(p=a[c],_=n[c],a.hasOwnProperty(c)&&p!==_&&(p!=null||_!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(O(137,e));break;default:Ie(t,e,c,p,a,_)}return;default:if(Iy(e)){for(var P in n)p=n[P],n.hasOwnProperty(P)&&p!==void 0&&!a.hasOwnProperty(P)&&ay(t,e,P,void 0,a,p);for(f in a)p=a[f],_=n[f],!a.hasOwnProperty(f)||p===_||p===void 0&&_===void 0||ay(t,e,f,p,a,_);return}}for(var E in n)p=n[E],n.hasOwnProperty(E)&&p!=null&&!a.hasOwnProperty(E)&&Ie(t,e,E,null,a,p);for(m in a)p=a[m],_=n[m],!a.hasOwnProperty(m)||p===_||p==null&&_==null||Ie(t,e,m,p,a,_)}function Tw(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function O1(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var r=n[a],i=r.transferSize,s=r.initiatorType,u=r.duration;if(i&&u&&Tw(s)){for(s=0,u=r.responseEnd,a+=1;a<n.length;a++){var l=n[a],c=l.startTime;if(c>u)break;var f=l.transferSize,m=l.initiatorType;f&&Tw(m)&&(l=l.responseEnd,s+=f*(l<u?1:(u-c)/(l-c)))}if(--a,e+=8*(i+s)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var ry=null,iy=null;function _f(t){return t.nodeType===9?t:t.ownerDocument}function Sw(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function cb(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function sy(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var gg=null;function N1(){var t=window.event;return t&&t.type==="popstate"?t===gg?!1:(gg=t,!0):(gg=null,!1)}var db=typeof setTimeout=="function"?setTimeout:void 0,M1=typeof clearTimeout=="function"?clearTimeout:void 0,vw=typeof Promise=="function"?Promise:void 0,U1=typeof queueMicrotask=="function"?queueMicrotask:typeof vw<"u"?function(t){return vw.resolve(null).then(t).catch(V1)}:db;function V1(t){setTimeout(function(){throw t})}function Qr(t){return t==="head"}function Ew(t,e){var n=e,a=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(a===0){t.removeChild(r),$s(e);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")ju(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,ju(n);for(var i=n.firstChild;i;){var s=i.nextSibling,u=i.nodeName;i[cl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&i.rel.toLowerCase()==="stylesheet"||n.removeChild(i),i=s}}else n==="body"&&ju(t.ownerDocument.body);n=r}while(n);$s(e)}function ww(t,e){var n=t;t=0;do{var a=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=a}while(n)}function oy(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":oy(n),_y(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function F1(t,e,n,a){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!a&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(a){if(!t[cl])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(i=t.getAttribute("rel"),i==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(i!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(i=t.getAttribute("src"),(i!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&i&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var i=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===i)return t}else return t;if(t=Cn(t.nextSibling),t===null)break}return null}function B1(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=Cn(t.nextSibling),t===null))return null;return t}function fb(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=Cn(t.nextSibling),t===null))return null;return t}function uy(t){return t.data==="$?"||t.data==="$~"}function ly(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function q1(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var a=function(){e(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),t._reactRetry=a}}function Cn(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var cy=null;function Cw(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return Cn(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function Aw(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function hb(t,e,n){switch(e=_f(n),t){case"html":if(t=e.documentElement,!t)throw Error(O(452));return t;case"head":if(t=e.head,!t)throw Error(O(453));return t;case"body":if(t=e.body,!t)throw Error(O(454));return t;default:throw Error(O(451))}}function ju(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);_y(t)}var An=new Map,bw=new Set;function If(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var za=fe.d;fe.d={f:z1,r:H1,D:G1,C:j1,L:W1,m:K1,X:Y1,S:Q1,M:X1};function z1(){var t=za.f(),e=Mf();return t||e}function H1(t){var e=Zs(t);e!==null&&e.tag===5&&e.type==="form"?sA(e):za.r(t)}var ao=typeof document>"u"?null:document;function pb(t,e,n){var a=ao;if(a&&typeof e=="string"&&e){var r=Sn(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),bw.has(r)||(bw.add(r),t={rel:t,crossOrigin:n,href:e},a.querySelector(r)===null&&(e=a.createElement("link"),At(e,"link",t),mt(e),a.head.appendChild(e)))}}function G1(t){za.D(t),pb("dns-prefetch",t,null)}function j1(t,e){za.C(t,e),pb("preconnect",t,e)}function W1(t,e,n){za.L(t,e,n);var a=ao;if(a&&t&&e){var r='link[rel="preload"][as="'+Sn(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+Sn(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+Sn(n.imageSizes)+'"]')):r+='[href="'+Sn(t)+'"]';var i=r;switch(e){case"style":i=Xs(t);break;case"script":i=ro(t)}An.has(i)||(t=ke({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),An.set(i,t),a.querySelector(r)!==null||e==="style"&&a.querySelector(gl(i))||e==="script"&&a.querySelector(yl(i))||(e=a.createElement("link"),At(e,"link",t),mt(e),a.head.appendChild(e)))}}function K1(t,e){za.m(t,e);var n=ao;if(n&&t){var a=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+Sn(a)+'"][href="'+Sn(t)+'"]',i=r;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":i=ro(t)}if(!An.has(i)&&(t=ke({rel:"modulepreload",href:t},e),An.set(i,t),n.querySelector(r)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(yl(i)))return}a=n.createElement("link"),At(a,"link",t),mt(a),n.head.appendChild(a)}}}function Q1(t,e,n){za.S(t,e,n);var a=ao;if(a&&t){var r=Os(a).hoistableStyles,i=Xs(t);e=e||"default";var s=r.get(i);if(!s){var u={loading:0,preload:null};if(s=a.querySelector(gl(i)))u.loading=5;else{t=ke({rel:"stylesheet",href:t,"data-precedence":e},n),(n=An.get(i))&&a_(t,n);var l=s=a.createElement("link");mt(l),At(l,"link",t),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){u.loading|=1}),l.addEventListener("error",function(){u.loading|=2}),u.loading|=4,Gd(s,e,a)}s={type:"stylesheet",instance:s,count:1,state:u},r.set(i,s)}}}function Y1(t,e){za.X(t,e);var n=ao;if(n&&t){var a=Os(n).hoistableScripts,r=ro(t),i=a.get(r);i||(i=n.querySelector(yl(r)),i||(t=ke({src:t,async:!0},e),(e=An.get(r))&&r_(t,e),i=n.createElement("script"),mt(i),At(i,"link",t),n.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},a.set(r,i))}}function X1(t,e){za.M(t,e);var n=ao;if(n&&t){var a=Os(n).hoistableScripts,r=ro(t),i=a.get(r);i||(i=n.querySelector(yl(r)),i||(t=ke({src:t,async:!0,type:"module"},e),(e=An.get(r))&&r_(t,e),i=n.createElement("script"),mt(i),At(i,"link",t),n.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},a.set(r,i))}}function Lw(t,e,n,a){var r=(r=Or.current)?If(r):null;if(!r)throw Error(O(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Xs(n.href),n=Os(r).hoistableStyles,a=n.get(e),a||(a={type:"style",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Xs(n.href);var i=Os(r).hoistableStyles,s=i.get(t);if(s||(r=r.ownerDocument||r,s={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},i.set(t,s),(i=r.querySelector(gl(t)))&&!i._p&&(s.instance=i,s.state.loading=5),An.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},An.set(t,n),i||$1(r,t,n,s.state))),e&&a===null)throw Error(O(528,""));return s}if(e&&a!==null)throw Error(O(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=ro(n),n=Os(r).hoistableScripts,a=n.get(e),a||(a={type:"script",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(O(444,t))}}function Xs(t){return'href="'+Sn(t)+'"'}function gl(t){return'link[rel="stylesheet"]['+t+"]"}function mb(t){return ke({},t,{"data-precedence":t.precedence,precedence:null})}function $1(t,e,n,a){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?a.loading=1:(e=t.createElement("link"),a.preload=e,e.addEventListener("load",function(){return a.loading|=1}),e.addEventListener("error",function(){return a.loading|=2}),At(e,"link",n),mt(e),t.head.appendChild(e))}function ro(t){return'[src="'+Sn(t)+'"]'}function yl(t){return"script[async]"+t}function Rw(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var a=t.querySelector('style[data-href~="'+Sn(n.href)+'"]');if(a)return e.instance=a,mt(a),a;var r=ke({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(t.ownerDocument||t).createElement("style"),mt(a),At(a,"style",r),Gd(a,n.precedence,t),e.instance=a;case"stylesheet":r=Xs(n.href);var i=t.querySelector(gl(r));if(i)return e.state.loading|=4,e.instance=i,mt(i),i;a=mb(n),(r=An.get(r))&&a_(a,r),i=(t.ownerDocument||t).createElement("link"),mt(i);var s=i;return s._p=new Promise(function(u,l){s.onload=u,s.onerror=l}),At(i,"link",a),e.state.loading|=4,Gd(i,n.precedence,t),e.instance=i;case"script":return i=ro(n.src),(r=t.querySelector(yl(i)))?(e.instance=r,mt(r),r):(a=n,(r=An.get(i))&&(a=ke({},n),r_(a,r)),t=t.ownerDocument||t,r=t.createElement("script"),mt(r),At(r,"link",a),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(O(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(a=e.instance,e.state.loading|=4,Gd(a,n.precedence,t));return e.instance}function Gd(t,e,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=a.length?a[a.length-1]:null,i=r,s=0;s<a.length;s++){var u=a[s];if(u.dataset.precedence===e)i=u;else if(i!==r)break}i?i.parentNode.insertBefore(t,i.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function a_(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function r_(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var jd=null;function xw(t,e,n){if(jd===null){var a=new Map,r=jd=new Map;r.set(n,a)}else r=jd,a=r.get(n),a||(a=new Map,r.set(n,a));if(a.has(t))return a;for(a.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var i=n[r];if(!(i[cl]||i[Et]||t==="link"&&i.getAttribute("rel")==="stylesheet")&&i.namespaceURI!=="http://www.w3.org/2000/svg"){var s=i.getAttribute(e)||"";s=t+s;var u=a.get(s);u?u.push(i):a.set(s,[i])}}return a}function kw(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function J1(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function gb(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function Z1(t,e,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(n.state.loading&4)){if(n.instance===null){var r=Xs(a.href),i=e.querySelector(gl(r));if(i){e=i._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Tf.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=i,mt(i);return}i=e.ownerDocument||e,a=mb(a),(r=An.get(r))&&a_(a,r),i=i.createElement("link"),mt(i);var s=i;s._p=new Promise(function(u,l){s.onload=u,s.onerror=l}),At(i,"link",a),n.instance=i}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&!(n.state.loading&3)&&(t.count++,n=Tf.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var yg=0;function eO(t,e){return t.stylesheets&&t.count===0&&Wd(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var a=setTimeout(function(){if(t.stylesheets&&Wd(t,t.stylesheets),t.unsuspend){var i=t.unsuspend;t.unsuspend=null,i()}},6e4+e);0<t.imgBytes&&yg===0&&(yg=62500*O1());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Wd(t,t.stylesheets),t.unsuspend)){var i=t.unsuspend;t.unsuspend=null,i()}},(t.imgBytes>yg?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(a),clearTimeout(r)}}:null}function Tf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Wd(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Sf=null;function Wd(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Sf=new Map,e.forEach(tO,t),Sf=null,Tf.call(t))}function tO(t,e){if(!(e.state.loading&4)){var n=Sf.get(t);if(n)var a=n.get(null);else{n=new Map,Sf.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),i=0;i<r.length;i++){var s=r[i];(s.nodeName==="LINK"||s.getAttribute("media")!=="not all")&&(n.set(s.dataset.precedence,s),a=s)}a&&n.set(null,a)}r=e.instance,s=r.getAttribute("data-precedence"),i=n.get(s)||a,i===a&&n.set(null,r),n.set(s,r),this.count++,a=Tf.bind(this),r.addEventListener("load",a),r.addEventListener("error",a),i?i.parentNode.insertBefore(r,i.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var al={$$typeof:ka,Provider:null,Consumer:null,_currentValue:Ii,_currentValue2:Ii,_threadCount:0};function nO(t,e,n,a,r,i,s,u,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Hm(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Hm(0),this.hiddenUpdates=Hm(null),this.identifierPrefix=a,this.onUncaughtError=r,this.onCaughtError=i,this.onRecoverableError=s,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function yb(t,e,n,a,r,i,s,u,l,c,f,m){return t=new nO(t,e,n,s,l,c,f,m,u),e=1,i===!0&&(e|=24),i=nn(3,null,null,e),t.current=i,i.stateNode=t,e=xy(),e.refCount++,t.pooledCache=e,e.refCount++,i.memoizedState={element:a,isDehydrated:n,cache:e},Py(i),t}function _b(t){return t?(t=xs,t):xs}function Ib(t,e,n,a,r,i){r=_b(r),a.context===null?a.context=r:a.pendingContext=r,a=Mr(e),a.payload={element:n},i=i===void 0?null:i,i!==null&&(a.callback=i),n=Ur(t,a,e),n!==null&&(Wt(n,t,e),Uu(n,t,e))}function Dw(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function i_(t,e){Dw(t,e),(t=t.alternate)&&Dw(t,e)}function Tb(t){if(t.tag===13||t.tag===31){var e=Di(t,67108864);e!==null&&Wt(e,t,67108864),i_(t,67108864)}}function Pw(t){if(t.tag===13||t.tag===31){var e=un();e=gy(e);var n=Di(t,e);n!==null&&Wt(n,t,e),i_(t,e)}}var vf=!0;function aO(t,e,n,a){var r=Q.T;Q.T=null;var i=fe.p;try{fe.p=2,s_(t,e,n,a)}finally{fe.p=i,Q.T=r}}function rO(t,e,n,a){var r=Q.T;Q.T=null;var i=fe.p;try{fe.p=8,s_(t,e,n,a)}finally{fe.p=i,Q.T=r}}function s_(t,e,n,a){if(vf){var r=dy(a);if(r===null)mg(t,e,a,Ef,n),Ow(t,a);else if(sO(r,t,e,n,a))a.stopPropagation();else if(Ow(t,a),e&4&&-1<iO.indexOf(t)){for(;r!==null;){var i=Zs(r);if(i!==null)switch(i.tag){case 3:if(i=i.stateNode,i.current.memoizedState.isDehydrated){var s=gi(i.pendingLanes);if(s!==0){var u=i;for(u.pendingLanes|=2,u.entangledLanes|=2;s;){var l=1<<31-on(s);u.entanglements[1]|=l,s&=~l}ta(i),!(de&6)&&(ff=rn()+500,ml(0,!1))}}break;case 31:case 13:u=Di(i,2),u!==null&&Wt(u,i,2),Mf(),i_(i,2)}if(i=dy(a),i===null&&mg(t,e,a,Ef,n),i===r)break;r=i}r!==null&&a.stopPropagation()}else mg(t,e,a,null,n)}}function dy(t){return t=Ty(t),o_(t)}var Ef=null;function o_(t){if(Ef=null,t=ws(t),t!==null){var e=sl(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=Bw(e),t!==null)return t;t=null}else if(n===31){if(t=qw(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Ef=t,null}function Sb(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(WD()){case jw:return 2;case Ww:return 8;case $d:case KD:return 32;case Kw:return 268435456;default:return 32}default:return 32}}var fy=!1,Br=null,qr=null,zr=null,rl=new Map,il=new Map,Lr=[],iO="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Ow(t,e){switch(t){case"focusin":case"focusout":Br=null;break;case"dragenter":case"dragleave":qr=null;break;case"mouseover":case"mouseout":zr=null;break;case"pointerover":case"pointerout":rl.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":il.delete(e.pointerId)}}function Au(t,e,n,a,r,i){return t===null||t.nativeEvent!==i?(t={blockedOn:e,domEventName:n,eventSystemFlags:a,nativeEvent:i,targetContainers:[r]},e!==null&&(e=Zs(e),e!==null&&Tb(e)),t):(t.eventSystemFlags|=a,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function sO(t,e,n,a,r){switch(e){case"focusin":return Br=Au(Br,t,e,n,a,r),!0;case"dragenter":return qr=Au(qr,t,e,n,a,r),!0;case"mouseover":return zr=Au(zr,t,e,n,a,r),!0;case"pointerover":var i=r.pointerId;return rl.set(i,Au(rl.get(i)||null,t,e,n,a,r)),!0;case"gotpointercapture":return i=r.pointerId,il.set(i,Au(il.get(i)||null,t,e,n,a,r)),!0}return!1}function vb(t){var e=ws(t.target);if(e!==null){var n=sl(e);if(n!==null){if(e=n.tag,e===13){if(e=Bw(n),e!==null){t.blockedOn=e,yE(t.priority,function(){Pw(n)});return}}else if(e===31){if(e=qw(n),e!==null){t.blockedOn=e,yE(t.priority,function(){Pw(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Kd(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=dy(t.nativeEvent);if(n===null){n=t.nativeEvent;var a=new n.constructor(n.type,n);xg=a,n.target.dispatchEvent(a),xg=null}else return e=Zs(n),e!==null&&Tb(e),t.blockedOn=n,!1;e.shift()}return!0}function Nw(t,e,n){Kd(t)&&n.delete(e)}function oO(){fy=!1,Br!==null&&Kd(Br)&&(Br=null),qr!==null&&Kd(qr)&&(qr=null),zr!==null&&Kd(zr)&&(zr=null),rl.forEach(Nw),il.forEach(Nw)}function kd(t,e){t.blockedOn===e&&(t.blockedOn=null,fy||(fy=!0,ut.unstable_scheduleCallback(ut.unstable_NormalPriority,oO)))}var Dd=null;function Mw(t){Dd!==t&&(Dd=t,ut.unstable_scheduleCallback(ut.unstable_NormalPriority,function(){Dd===t&&(Dd=null);for(var e=0;e<t.length;e+=3){var n=t[e],a=t[e+1],r=t[e+2];if(typeof a!="function"){if(o_(a||n)===null)continue;break}var i=Zs(n);i!==null&&(t.splice(e,3),e-=3,Wg(i,{pending:!0,data:r,method:n.method,action:a},a,r))}}))}function $s(t){function e(l){return kd(l,t)}Br!==null&&kd(Br,t),qr!==null&&kd(qr,t),zr!==null&&kd(zr,t),rl.forEach(e),il.forEach(e);for(var n=0;n<Lr.length;n++){var a=Lr[n];a.blockedOn===t&&(a.blockedOn=null)}for(;0<Lr.length&&(n=Lr[0],n.blockedOn===null);)vb(n),n.blockedOn===null&&Lr.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var r=n[a],i=n[a+1],s=r[Kt]||null;if(typeof i=="function")s||Mw(n);else if(s){var u=null;if(i&&i.hasAttribute("formAction")){if(r=i,s=i[Kt]||null)u=s.formAction;else if(o_(r)!==null)continue}else u=s.action;typeof u=="function"?n[a+1]=u:(n.splice(a,3),a-=3),Mw(n)}}}function Eb(){function t(i){i.canIntercept&&i.info==="react-transition"&&i.intercept({handler:function(){return new Promise(function(s){return r=s})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var i=navigation.currentEntry;i&&i.url!=null&&navigation.navigate(i.url,{state:i.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function u_(t){this._internalRoot=t}Ff.prototype.render=u_.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(O(409));var n=e.current,a=un();Ib(n,a,t,e,null,null)};Ff.prototype.unmount=u_.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Ib(t.current,2,null,t,null,null),Mf(),e[Js]=null}};function Ff(t){this._internalRoot=t}Ff.prototype.unstable_scheduleHydration=function(t){if(t){var e=Jw();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Lr.length&&e!==0&&e<Lr[n].priority;n++);Lr.splice(n,0,t),n===0&&vb(t)}};var Uw=Vw.version;if(Uw!=="19.2.3")throw Error(O(527,Uw,"19.2.3"));fe.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(O(188)):(t=Object.keys(t).join(","),Error(O(268,t)));return t=FD(e),t=t!==null?zw(t):null,t=t===null?null:t.stateNode,t};var uO={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:Q,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(bu=__REACT_DEVTOOLS_GLOBAL_HOOK__,!bu.isDisabled&&bu.supportsFiber))try{ol=bu.inject(uO),sn=bu}catch{}var bu;Bf.createRoot=function(t,e){if(!Fw(t))throw Error(O(299));var n=!1,a="",r=pA,i=mA,s=gA;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(a=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(i=e.onCaughtError),e.onRecoverableError!==void 0&&(s=e.onRecoverableError)),e=yb(t,1,!1,null,null,n,a,null,r,i,s,Eb),t[Js]=e.current,n_(t),new u_(e)};Bf.hydrateRoot=function(t,e,n){if(!Fw(t))throw Error(O(299));var a=!1,r="",i=pA,s=mA,u=gA,l=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(i=n.onUncaughtError),n.onCaughtError!==void 0&&(s=n.onCaughtError),n.onRecoverableError!==void 0&&(u=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),e=yb(t,1,!0,e,n??null,a,r,l,i,s,u,Eb),e.context=_b(null),n=e.current,a=un(),a=gy(a),r=Mr(a),r.callback=null,Ur(n,r,a),n=a,e.current.lanes=n,ll(e,n),ta(e),t[Js]=e.current,n_(t),new Ff(e)};Bf.version="19.2.3"});var bb=Qn((yq,Ab)=>{"use strict";function Cb(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Cb)}catch(t){console.error(t)}}Cb(),Ab.exports=wb()});var wk={};gD(wk,{captureScreenshot:()=>xB});var xB,Ck=mD(()=>{xB=async()=>null});var Ok=Qn(sm=>{"use strict";var FB=Symbol.for("react.transitional.element"),BB=Symbol.for("react.fragment");function Pk(t,e,n){var a=null;if(n!==void 0&&(a=""+n),e.key!==void 0&&(a=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:FB,type:t,key:a,ref:e!==void 0?e:null,props:n}}sm.Fragment=BB;sm.jsx=Pk;sm.jsxs=Pk});var lt=Qn((wG,Nk)=>{"use strict";Nk.exports=Ok()});var St=_e(Pn()),jk=_e(bb());var Lb=()=>{};var kb=function(t){let e=[],n=0;for(let a=0;a<t.length;a++){let r=t.charCodeAt(a);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&a+1<t.length&&(t.charCodeAt(a+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++a)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},lO=function(t){let e=[],n=0,a=0;for(;n<t.length;){let r=t[n++];if(r<128)e[a++]=String.fromCharCode(r);else if(r>191&&r<224){let i=t[n++];e[a++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){let i=t[n++],s=t[n++],u=t[n++],l=((r&7)<<18|(i&63)<<12|(s&63)<<6|u&63)-65536;e[a++]=String.fromCharCode(55296+(l>>10)),e[a++]=String.fromCharCode(56320+(l&1023))}else{let i=t[n++],s=t[n++];e[a++]=String.fromCharCode((r&15)<<12|(i&63)<<6|s&63)}}return e.join("")},Db={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let r=0;r<t.length;r+=3){let i=t[r],s=r+1<t.length,u=s?t[r+1]:0,l=r+2<t.length,c=l?t[r+2]:0,f=i>>2,m=(i&3)<<4|u>>4,p=(u&15)<<2|c>>6,_=c&63;l||(_=64,s||(p=64)),a.push(n[f],n[m],n[p],n[_])}return a.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(kb(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):lO(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let n=e?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let r=0;r<t.length;){let i=n[t.charAt(r++)],u=r<t.length?n[t.charAt(r)]:0;++r;let c=r<t.length?n[t.charAt(r)]:64;++r;let m=r<t.length?n[t.charAt(r)]:64;if(++r,i==null||u==null||c==null||m==null)throw new c_;let p=i<<2|u>>4;if(a.push(p),c!==64){let _=u<<4&240|c>>2;if(a.push(_),m!==64){let L=c<<6&192|m;a.push(L)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},c_=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},cO=function(t){let e=kb(t);return Db.encodeByteArray(e,!0)},Il=function(t){return cO(t).replace(/\./g,"")},io=function(t){try{return Db.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function Pb(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var dO=()=>Pb().__FIREBASE_DEFAULTS__,fO=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},hO=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&io(t[1]);return e&&JSON.parse(e)},zf=()=>{try{return Lb()||dO()||fO()||hO()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Tl=t=>zf()?.emulatorHosts?.[t],Hf=t=>{let e=Tl(t);if(!e)return;let n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let a=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),a]:[e.substring(0,n),a]},f_=()=>zf()?.config,h_=t=>zf()?.[`_${t}`];var qf=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,a)=>{n?this.reject(n):this.resolve(a),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,a))}}};function Ft(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Yr(t){return(await fetch(t,{credentials:"include"})).ok}function Gf(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let n={alg:"none",type:"JWT"},a=e||"demo-project",r=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let s={iss:`https://securetoken.google.com/${a}`,aud:a,iat:r,exp:r+3600,auth_time:r,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...t};return[Il(JSON.stringify(n)),Il(JSON.stringify(s)),""].join(".")}var _l={};function pO(){let t={prod:[],emulator:[]};for(let e of Object.keys(_l))_l[e]?t.emulator.push(e):t.prod.push(e);return t}function mO(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}var Rb=!1;function Xr(t,e){if(typeof window>"u"||typeof document>"u"||!Ft(window.location.host)||_l[t]===e||_l[t]||Rb)return;_l[t]=e;function n(p){return`__firebase__banner__${p}`}let a="__firebase__banner",i=pO().prod.length>0;function s(){let p=document.getElementById(a);p&&p.remove()}function u(p){p.style.display="flex",p.style.background="#7faaf0",p.style.position="fixed",p.style.bottom="5px",p.style.left="5px",p.style.padding=".5em",p.style.borderRadius="5px",p.style.alignItems="center"}function l(p,_){p.setAttribute("width","24"),p.setAttribute("id",_),p.setAttribute("height","24"),p.setAttribute("viewBox","0 0 24 24"),p.setAttribute("fill","none"),p.style.marginLeft="-6px"}function c(){let p=document.createElement("span");return p.style.cursor="pointer",p.style.marginLeft="16px",p.style.fontSize="24px",p.innerHTML=" &times;",p.onclick=()=>{Rb=!0,s()},p}function f(p,_){p.setAttribute("id",_),p.innerText="Learn more",p.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",p.setAttribute("target","__blank"),p.style.paddingLeft="5px",p.style.textDecoration="underline"}function m(){let p=mO(a),_=n("text"),L=document.getElementById(_)||document.createElement("span"),k=n("learnmore"),P=document.getElementById(k)||document.createElement("a"),E=n("preprendIcon"),S=document.getElementById(E)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(p.created){let A=p.element;u(A),f(P,k);let x=c();l(S,E),A.append(S,L,P,x),document.body.appendChild(A)}i?(L.innerText="Preview backend disconnected.",S.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(S.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,L.innerText="Preview backend running in this workspace."),L.setAttribute("id",_)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}function Se(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function jf(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Se())}function gO(){let t=zf()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Wf(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Kf(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Qf(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function p_(){let t=Se();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Ob(){return!gO()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function m_(){try{return typeof indexedDB=="object"}catch{return!1}}function Nb(){return new Promise((t,e)=>{try{let n=!0,a="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(a);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(a),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(n){e(n)}})}var yO="FirebaseError",yt=class t extends Error{constructor(e,n,a){super(n),this.code=e,this.customData=a,this.name=yO,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,dn.prototype.create)}},dn=class{constructor(e,n,a){this.service=e,this.serviceName=n,this.errors=a}create(e,...n){let a=n[0]||{},r=`${this.service}/${e}`,i=this.errors[e],s=i?_O(i,a):"Error",u=`${this.serviceName}: ${s} (${r}).`;return new yt(r,u,a)}};function _O(t,e){return t.replace(IO,(n,a)=>{let r=e[a];return r!=null?String(r):`<${a}?>`})}var IO=/\{\$([^}]+)}/g;function Mb(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Bt(t,e){if(t===e)return!0;let n=Object.keys(t),a=Object.keys(e);for(let r of n){if(!a.includes(r))return!1;let i=t[r],s=e[r];if(xb(i)&&xb(s)){if(!Bt(i,s))return!1}else if(i!==s)return!1}for(let r of a)if(!n.includes(r))return!1;return!0}function xb(t){return t!==null&&typeof t=="object"}function na(t){let e=[];for(let[n,a]of Object.entries(t))Array.isArray(a)?a.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(a));return e.length?"&"+e.join("&"):""}function bn(t){let e={};return t.replace(/^\?/,"").split("&").forEach(a=>{if(a){let[r,i]=a.split("=");e[decodeURIComponent(r)]=decodeURIComponent(i)}}),e}function Ln(t){let e=t.indexOf("?");if(!e)return"";let n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function Yf(t,e){let n=new d_(t,e);return n.subscribe.bind(n)}var d_=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(a=>{this.error(a)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,a){let r;if(e===void 0&&n===void 0&&a===void 0)throw new Error("Missing Observer.");TO(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:a},r.next===void 0&&(r.next=l_),r.error===void 0&&(r.error=l_),r.complete===void 0&&(r.complete=l_);let i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function TO(t,e){if(typeof t!="object"||t===null)return!1;for(let n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function l_(){}var Tq=4*60*60*1e3;function Ce(t){return t&&t._delegate?t._delegate:t}var bt=class{constructor(e,n,a){this.name=e,this.instanceFactory=n,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var Oi="[DEFAULT]";var g_=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){let a=new qf;if(this.instancesDeferred.set(n,a),this.isInitialized(n)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:n});r&&a.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){let n=this.normalizeInstanceIdentifier(e?.identifier),a=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(a)return null;throw r}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(vO(e))try{this.getOrInitializeService({instanceIdentifier:Oi})}catch{}for(let[n,a]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(n);try{let i=this.getOrInitializeService({instanceIdentifier:r});a.resolve(i)}catch{}}}}clearInstance(e=Oi){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Oi){return this.instances.has(e)}getOptions(e=Oi){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:n={}}=e,a=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:a,options:n});for(let[i,s]of this.instancesDeferred.entries()){let u=this.normalizeInstanceIdentifier(i);a===u&&s.resolve(r)}return r}onInit(e,n){let a=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(a)??new Set;r.add(e),this.onInitCallbacks.set(a,r);let i=this.instances.get(a);return i&&e(i,a),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){let a=this.onInitCallbacks.get(n);if(a)for(let r of a)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let a=this.instances.get(e);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:SO(e),options:n}),this.instances.set(e,a),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(a,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,a)}catch{}return a||null}normalizeInstanceIdentifier(e=Oi){return this.component?this.component.multipleInstances?e:Oi:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function SO(t){return t===Oi?void 0:t}function vO(t){return t.instantiationMode==="EAGER"}var Xf=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let n=new g_(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};var EO=[],ee;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(ee||(ee={}));var wO={debug:ee.DEBUG,verbose:ee.VERBOSE,info:ee.INFO,warn:ee.WARN,error:ee.ERROR,silent:ee.SILENT},CO=ee.INFO,AO={[ee.DEBUG]:"log",[ee.VERBOSE]:"log",[ee.INFO]:"info",[ee.WARN]:"warn",[ee.ERROR]:"error"},bO=(t,e,...n)=>{if(e<t.logLevel)return;let a=new Date().toISOString(),r=AO[e];if(r)console[r](`[${a}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},aa=class{constructor(e){this.name=e,this._logLevel=CO,this._logHandler=bO,this._userLogHandler=null,EO.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ee))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?wO[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ee.DEBUG,...e),this._logHandler(this,ee.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ee.VERBOSE,...e),this._logHandler(this,ee.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ee.INFO,...e),this._logHandler(this,ee.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ee.WARN,...e),this._logHandler(this,ee.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ee.ERROR,...e),this._logHandler(this,ee.ERROR,...e)}};var LO=(t,e)=>e.some(n=>t instanceof n),Ub,Vb;function RO(){return Ub||(Ub=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function xO(){return Vb||(Vb=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var Fb=new WeakMap,__=new WeakMap,Bb=new WeakMap,y_=new WeakMap,T_=new WeakMap;function kO(t){let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("success",i),t.removeEventListener("error",s)},i=()=>{n(ra(t.result)),r()},s=()=>{a(t.error),r()};t.addEventListener("success",i),t.addEventListener("error",s)});return e.then(n=>{n instanceof IDBCursor&&Fb.set(n,t)}).catch(()=>{}),T_.set(e,t),e}function DO(t){if(__.has(t))return;let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",s),t.removeEventListener("abort",s)},i=()=>{n(),r()},s=()=>{a(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",i),t.addEventListener("error",s),t.addEventListener("abort",s)});__.set(t,e)}var I_={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return __.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Bb.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return ra(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function qb(t){I_=t(I_)}function PO(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let a=t.call($f(this),e,...n);return Bb.set(a,e.sort?e.sort():[e]),ra(a)}:xO().includes(t)?function(...e){return t.apply($f(this),e),ra(Fb.get(this))}:function(...e){return ra(t.apply($f(this),e))}}function OO(t){return typeof t=="function"?PO(t):(t instanceof IDBTransaction&&DO(t),LO(t,RO())?new Proxy(t,I_):t)}function ra(t){if(t instanceof IDBRequest)return kO(t);if(y_.has(t))return y_.get(t);let e=OO(t);return e!==t&&(y_.set(t,e),T_.set(e,t)),e}var $f=t=>T_.get(t);function Hb(t,e,{blocked:n,upgrade:a,blocking:r,terminated:i}={}){let s=indexedDB.open(t,e),u=ra(s);return a&&s.addEventListener("upgradeneeded",l=>{a(ra(s.result),l.oldVersion,l.newVersion,ra(s.transaction),l)}),n&&s.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),u.then(l=>{i&&l.addEventListener("close",()=>i()),r&&l.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),u}var NO=["get","getKey","getAll","getAllKeys","count"],MO=["put","add","delete","clear"],S_=new Map;function zb(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(S_.get(e))return S_.get(e);let n=e.replace(/FromIndex$/,""),a=e!==n,r=MO.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(r||NO.includes(n)))return;let i=async function(s,...u){let l=this.transaction(s,r?"readwrite":"readonly"),c=l.store;return a&&(c=c.index(u.shift())),(await Promise.all([c[n](...u),r&&l.done]))[0]};return S_.set(e,i),i}qb(t=>({...t,get:(e,n,a)=>zb(e,n)||t.get(e,n,a),has:(e,n)=>!!zb(e,n)||t.has(e,n)}));var E_=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(UO(n)){let a=n.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(n=>n).join(" ")}};function UO(t){return t.getComponent()?.type==="VERSION"}var w_="@firebase/app",Gb="0.14.9";var Ha=new aa("@firebase/app"),VO="@firebase/app-compat",FO="@firebase/analytics-compat",BO="@firebase/analytics",qO="@firebase/app-check-compat",zO="@firebase/app-check",HO="@firebase/auth",GO="@firebase/auth-compat",jO="@firebase/database",WO="@firebase/data-connect",KO="@firebase/database-compat",QO="@firebase/functions",YO="@firebase/functions-compat",XO="@firebase/installations",$O="@firebase/installations-compat",JO="@firebase/messaging",ZO="@firebase/messaging-compat",eN="@firebase/performance",tN="@firebase/performance-compat",nN="@firebase/remote-config",aN="@firebase/remote-config-compat",rN="@firebase/storage",iN="@firebase/storage-compat",sN="@firebase/firestore",oN="@firebase/ai",uN="@firebase/firestore-compat",lN="firebase",cN="12.10.0";var C_="[DEFAULT]",dN={[w_]:"fire-core",[VO]:"fire-core-compat",[BO]:"fire-analytics",[FO]:"fire-analytics-compat",[zO]:"fire-app-check",[qO]:"fire-app-check-compat",[HO]:"fire-auth",[GO]:"fire-auth-compat",[jO]:"fire-rtdb",[WO]:"fire-data-connect",[KO]:"fire-rtdb-compat",[QO]:"fire-fn",[YO]:"fire-fn-compat",[XO]:"fire-iid",[$O]:"fire-iid-compat",[JO]:"fire-fcm",[ZO]:"fire-fcm-compat",[eN]:"fire-perf",[tN]:"fire-perf-compat",[nN]:"fire-rc",[aN]:"fire-rc-compat",[rN]:"fire-gcs",[iN]:"fire-gcs-compat",[sN]:"fire-fst",[uN]:"fire-fst-compat",[oN]:"fire-vertex","fire-js":"fire-js",[lN]:"fire-js-all"};var Jf=new Map,fN=new Map,A_=new Map;function jb(t,e){try{t.container.addComponent(e)}catch(n){Ha.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function fn(t){let e=t.name;if(A_.has(e))return Ha.debug(`There were multiple attempts to register component ${e}.`),!1;A_.set(e,t);for(let n of Jf.values())jb(n,t);for(let n of fN.values())jb(n,t);return!0}function Un(t,e){let n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Ke(t){return t==null?!1:t.settings!==void 0}var hN={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},$r=new dn("app","Firebase",hN);var b_=class{constructor(e,n,a){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new bt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw $r.create("app-deleted",{appName:this._name})}};var Yt=cN;function vl(t,e={}){let n=t;typeof e!="object"&&(e={name:e});let a={name:C_,automaticDataCollectionEnabled:!0,...e},r=a.name;if(typeof r!="string"||!r)throw $r.create("bad-app-name",{appName:String(r)});if(n||(n=f_()),!n)throw $r.create("no-options");let i=Jf.get(r);if(i){if(Bt(n,i.options)&&Bt(a,i.config))return i;throw $r.create("duplicate-app",{appName:r})}let s=new Xf(r);for(let l of A_.values())s.addComponent(l);let u=new b_(n,a,s);return Jf.set(r,u),u}function Jr(t=C_){let e=Jf.get(t);if(!e&&t===C_&&f_())return vl();if(!e)throw $r.create("no-app",{appName:t});return e}function Lt(t,e,n){let a=dN[t]??t;n&&(a+=`-${n}`);let r=a.match(/\s|\//),i=e.match(/\s|\//);if(r||i){let s=[`Unable to register library "${a}" with version "${e}":`];r&&s.push(`library name "${a}" contains illegal characters (whitespace or "/")`),r&&i&&s.push("and"),i&&s.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ha.warn(s.join(" "));return}fn(new bt(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}var pN="firebase-heartbeat-database",mN=1,Sl="firebase-heartbeat-store",v_=null;function Yb(){return v_||(v_=Hb(pN,mN,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Sl)}catch(n){console.warn(n)}}}}).catch(t=>{throw $r.create("idb-open",{originalErrorMessage:t.message})})),v_}async function gN(t){try{let n=(await Yb()).transaction(Sl),a=await n.objectStore(Sl).get(Xb(t));return await n.done,a}catch(e){if(e instanceof yt)Ha.warn(e.message);else{let n=$r.create("idb-get",{originalErrorMessage:e?.message});Ha.warn(n.message)}}}async function Wb(t,e){try{let a=(await Yb()).transaction(Sl,"readwrite");await a.objectStore(Sl).put(e,Xb(t)),await a.done}catch(n){if(n instanceof yt)Ha.warn(n.message);else{let a=$r.create("idb-set",{originalErrorMessage:n?.message});Ha.warn(a.message)}}}function Xb(t){return`${t.name}!${t.options.appId}`}var yN=1024,_N=30,L_=class{constructor(e){this.container=e,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new R_(n),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=Kb();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(r=>r.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:n}),this._heartbeatsCache.heartbeats.length>_N){let r=TN(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Ha.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=Kb(),{heartbeatsToSend:n,unsentEntries:a}=IN(this._heartbeatsCache.heartbeats),r=Il(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return Ha.warn(e),""}}};function Kb(){return new Date().toISOString().substring(0,10)}function IN(t,e=yN){let n=[],a=t.slice();for(let r of t){let i=n.find(s=>s.agent===r.agent);if(i){if(i.dates.push(r.date),Qb(n)>e){i.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),Qb(n)>e){n.pop();break}a=a.slice(1)}return{heartbeatsToSend:n,unsentEntries:a}}var R_=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return m_()?Nb().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await gN(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return Wb(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return Wb(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}};function Qb(t){return Il(JSON.stringify({version:2,heartbeats:t})).length}function TN(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let a=1;a<t.length;a++)t[a].date<n&&(n=t[a].date,e=a);return e}function SN(t){fn(new bt("platform-logger",e=>new E_(e),"PRIVATE")),fn(new bt("heartbeat",e=>new L_(e),"PRIVATE")),Lt(w_,Gb,t),Lt(w_,Gb,"esm2020"),Lt("fire-js","")}SN("");var aL="firebasestorage.googleapis.com",rL="storageBucket",vN=2*60*1e3,EN=10*60*1e3;var ze=class t extends yt{constructor(e,n,a=0){super(x_(e),`Firebase Storage: ${n} (${x_(e)})`),this.status_=a,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return x_(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},He;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(He||(He={}));function x_(t){return"storage/"+t}function M_(){let t="An unknown error occurred, please check the error payload for server response.";return new ze(He.UNKNOWN,t)}function wN(t){return new ze(He.OBJECT_NOT_FOUND,"Object '"+t+"' does not exist.")}function CN(t){return new ze(He.QUOTA_EXCEEDED,"Quota for bucket '"+t+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function AN(){let t="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new ze(He.UNAUTHENTICATED,t)}function bN(){return new ze(He.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function LN(t){return new ze(He.UNAUTHORIZED,"User does not have permission to access '"+t+"'.")}function RN(){return new ze(He.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function xN(){return new ze(He.CANCELED,"User canceled the upload/download.")}function kN(t){return new ze(He.INVALID_URL,"Invalid URL '"+t+"'.")}function DN(t){return new ze(He.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function PN(){return new ze(He.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+rL+"' property when initializing the app?")}function ON(){return new ze(He.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function NN(){return new ze(He.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function MN(t){return new ze(He.UNSUPPORTED_ENVIRONMENT,`${t} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function k_(t){return new ze(He.INVALID_ARGUMENT,t)}function iL(){return new ze(He.APP_DELETED,"The Firebase app was deleted.")}function UN(t){return new ze(He.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function wl(t,e){return new ze(He.INVALID_FORMAT,"String does not match format '"+t+"': "+e)}function El(t){throw new ze(He.INTERNAL_ERROR,"Internal error: "+t)}var Vn=class t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let a;try{a=t.makeFromUrl(e,n)}catch{return new t(e,"")}if(a.path==="")return a;throw DN(e)}static makeFromUrl(e,n){let a=null,r="([A-Za-z0-9.\\-_]+)";function i(x){x.path.charAt(x.path.length-1)==="/"&&(x.path_=x.path_.slice(0,-1))}let s="(/(.*))?$",u=new RegExp("^gs://"+r+s,"i"),l={bucket:1,path:3};function c(x){x.path_=decodeURIComponent(x.path)}let f="v[A-Za-z0-9_]+",m=n.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",_=new RegExp(`^https?://${m}/${f}/b/${r}/o${p}`,"i"),L={bucket:1,path:3},k=n===aL?"(?:storage.googleapis.com|storage.cloud.google.com)":n,P="([^?#]*)",E=new RegExp(`^https?://${k}/${r}/${P}`,"i"),A=[{regex:u,indices:l,postModify:i},{regex:_,indices:L,postModify:c},{regex:E,indices:{bucket:1,path:2},postModify:c}];for(let x=0;x<A.length;x++){let V=A[x],M=V.regex.exec(e);if(M){let T=M[V.indices.bucket],g=M[V.indices.path];g||(g=""),a=new t(T,g),V.postModify(a);break}}if(a==null)throw kN(e);return a}},D_=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function VN(t,e,n){let a=1,r=null,i=null,s=!1,u=0;function l(){return u===2}let c=!1;function f(...P){c||(c=!0,e.apply(null,P))}function m(P){r=setTimeout(()=>{r=null,t(_,l())},P)}function p(){i&&clearTimeout(i)}function _(P,...E){if(c){p();return}if(P){p(),f.call(null,P,...E);return}if(l()||s){p(),f.call(null,P,...E);return}a<64&&(a*=2);let A;u===1?(u=2,A=0):A=(a+Math.random())*1e3,m(A)}let L=!1;function k(P){L||(L=!0,p(),!c&&(r!==null?(P||(u=2),clearTimeout(r),m(0)):P||(u=1)))}return m(0),i=setTimeout(()=>{s=!0,k(!0)},n),k}function FN(t){t(!1)}function BN(t){return t!==void 0}function qN(t){return typeof t=="object"&&!Array.isArray(t)}function U_(t){return typeof t=="string"||t instanceof String}function $b(t){return V_()&&t instanceof Blob}function V_(){return typeof Blob<"u"}function Jb(t,e,n,a){if(a<e)throw k_(`Invalid value for '${t}'. Expected ${e} or greater.`);if(a>n)throw k_(`Invalid value for '${t}'. Expected ${n} or less.`)}function F_(t,e,n){let a=e;return n==null&&(a=`https://${e}`),`${n}://${a}/v0${t}`}function sL(t){let e=encodeURIComponent,n="?";for(let a in t)if(t.hasOwnProperty(a)){let r=e(a)+"="+e(t[a]);n=n+r+"&"}return n=n.slice(0,-1),n}var Ni;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Ni||(Ni={}));function zN(t,e){let n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,i=e.indexOf(t)!==-1;return n||r||i}var P_=class{constructor(e,n,a,r,i,s,u,l,c,f,m,p=!0,_=!1){this.url_=e,this.method_=n,this.headers_=a,this.body_=r,this.successCodes_=i,this.additionalRetryCodes_=s,this.callback_=u,this.errorCallback_=l,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=m,this.retry=p,this.isUsingEmulator=_,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((L,k)=>{this.resolve_=L,this.reject_=k,this.start_()})}start_(){let e=(a,r)=>{if(r){a(!1,new so(!1,null,!0));return}let i=this.connectionFactory_();this.pendingConnection_=i;let s=u=>{let l=u.loaded,c=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,c)};this.progressCallback_!==null&&i.addUploadProgressListener(s),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(s),this.pendingConnection_=null;let u=i.getErrorCode()===Ni.NO_ERROR,l=i.getStatus();if(!u||zN(l,this.additionalRetryCodes_)&&this.retry){let f=i.getErrorCode()===Ni.ABORT;a(!1,new so(!1,null,f));return}let c=this.successCodes_.indexOf(l)!==-1;a(!0,new so(c,i))})},n=(a,r)=>{let i=this.resolve_,s=this.reject_,u=r.connection;if(r.wasSuccessCode)try{let l=this.callback_(u,u.getResponse());BN(l)?i(l):i()}catch(l){s(l)}else if(u!==null){let l=M_();l.serverResponse=u.getErrorText(),this.errorCallback_?s(this.errorCallback_(u,l)):s(l)}else if(r.canceled){let l=this.appDelete_?iL():xN();s(l)}else{let l=RN();s(l)}};this.canceled_?n(!1,new so(!1,null,!0)):this.backoffId_=VN(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&FN(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},so=class{constructor(e,n,a){this.wasSuccessCode=e,this.connection=n,this.canceled=!!a}};function HN(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function GN(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function jN(t,e){e&&(t["X-Firebase-GMPID"]=e)}function WN(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function KN(t,e,n,a,r,i,s=!0,u=!1){let l=sL(t.urlParams),c=t.url+l,f=Object.assign({},t.headers);return jN(f,e),HN(f,n),GN(f,i),WN(f,a),new P_(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,s,u)}function QN(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function YN(...t){let e=QN();if(e!==void 0){let n=new e;for(let a=0;a<t.length;a++)n.append(t[a]);return n.getBlob()}else{if(V_())return new Blob(t);throw new ze(He.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function XN(t,e,n){return t.webkitSlice?t.webkitSlice(e,n):t.mozSlice?t.mozSlice(e,n):t.slice?t.slice(e,n):null}function $N(t){if(typeof atob>"u")throw MN("base-64");return atob(t)}var Fn={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"},Cl=class{constructor(e,n){this.data=e,this.contentType=n||null}};function oL(t,e){switch(t){case Fn.RAW:return new Cl(uL(e));case Fn.BASE64:case Fn.BASE64URL:return new Cl(lL(t,e));case Fn.DATA_URL:return new Cl(ZN(e),eM(e))}throw M_()}function uL(t){let e=[];for(let n=0;n<t.length;n++){let a=t.charCodeAt(n);if(a<=127)e.push(a);else if(a<=2047)e.push(192|a>>6,128|a&63);else if((a&64512)===55296)if(!(n<t.length-1&&(t.charCodeAt(n+1)&64512)===56320))e.push(239,191,189);else{let i=a,s=t.charCodeAt(++n);a=65536|(i&1023)<<10|s&1023,e.push(240|a>>18,128|a>>12&63,128|a>>6&63,128|a&63)}else(a&64512)===56320?e.push(239,191,189):e.push(224|a>>12,128|a>>6&63,128|a&63)}return new Uint8Array(e)}function JN(t){let e;try{e=decodeURIComponent(t)}catch{throw wl(Fn.DATA_URL,"Malformed data URL.")}return uL(e)}function lL(t,e){switch(t){case Fn.BASE64:{let r=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(r||i)throw wl(t,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case Fn.BASE64URL:{let r=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(r||i)throw wl(t,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=$N(e)}catch(r){throw r.message.includes("polyfill")?r:wl(t,"Invalid character found")}let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}var eh=class{constructor(e){this.base64=!1,this.contentType=null;let n=e.match(/^data:([^,]+)?,/);if(n===null)throw wl(Fn.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");let a=n[1]||null;a!=null&&(this.base64=tM(a,";base64"),this.contentType=this.base64?a.substring(0,a.length-7):a),this.rest=e.substring(e.indexOf(",")+1)}};function ZN(t){let e=new eh(t);return e.base64?lL(Fn.BASE64,e.rest):JN(e.rest)}function eM(t){return new eh(t).contentType}function tM(t,e){return t.length>=e.length?t.substring(t.length-e.length)===e:!1}var th=class t{constructor(e,n){let a=0,r="";$b(e)?(this.data_=e,a=e.size,r=e.type):e instanceof ArrayBuffer?(n?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),a=this.data_.length):e instanceof Uint8Array&&(n?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),a=e.length),this.size_=a,this.type_=r}size(){return this.size_}type(){return this.type_}slice(e,n){if($b(this.data_)){let a=this.data_,r=XN(a,e,n);return r===null?null:new t(r)}else{let a=new Uint8Array(this.data_.buffer,e,n-e);return new t(a,!0)}}static getBlob(...e){if(V_()){let n=e.map(a=>a instanceof t?a.data_:a);return new t(YN.apply(null,n))}else{let n=e.map(s=>U_(s)?oL(Fn.RAW,s).data:s.data_),a=0;n.forEach(s=>{a+=s.byteLength});let r=new Uint8Array(a),i=0;return n.forEach(s=>{for(let u=0;u<s.length;u++)r[i++]=s[u]}),new t(r,!0)}}uploadData(){return this.data_}};function cL(t){let e;try{e=JSON.parse(t)}catch{return null}return qN(e)?e:null}function nM(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function aM(t,e){let n=e.split("/").filter(a=>a.length>0).join("/");return t.length===0?n:t+"/"+n}function dL(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}function rM(t,e){return e}var Rt=class{constructor(e,n,a,r){this.server=e,this.local=n||e,this.writable=!!a,this.xform=r||rM}},Zf=null;function iM(t){return!U_(t)||t.length<2?t:dL(t)}function fL(){if(Zf)return Zf;let t=[];t.push(new Rt("bucket")),t.push(new Rt("generation")),t.push(new Rt("metageneration")),t.push(new Rt("name","fullPath",!0));function e(i,s){return iM(s)}let n=new Rt("name");n.xform=e,t.push(n);function a(i,s){return s!==void 0?Number(s):s}let r=new Rt("size");return r.xform=a,t.push(r),t.push(new Rt("timeCreated")),t.push(new Rt("updated")),t.push(new Rt("md5Hash",null,!0)),t.push(new Rt("cacheControl",null,!0)),t.push(new Rt("contentDisposition",null,!0)),t.push(new Rt("contentEncoding",null,!0)),t.push(new Rt("contentLanguage",null,!0)),t.push(new Rt("contentType",null,!0)),t.push(new Rt("metadata","customMetadata",!0)),Zf=t,Zf}function sM(t,e){function n(){let a=t.bucket,r=t.fullPath,i=new Vn(a,r);return e._makeStorageReference(i)}Object.defineProperty(t,"ref",{get:n})}function oM(t,e,n){let a={};a.type="file";let r=n.length;for(let i=0;i<r;i++){let s=n[i];a[s.local]=s.xform(a,e[s.server])}return sM(a,t),a}function hL(t,e,n){let a=cL(e);return a===null?null:oM(t,a,n)}function uM(t,e,n,a){let r=cL(e);if(r===null||!U_(r.downloadTokens))return null;let i=r.downloadTokens;if(i.length===0)return null;let s=encodeURIComponent;return i.split(",").map(c=>{let f=t.bucket,m=t.fullPath,p="/b/"+s(f)+"/o/"+s(m),_=F_(p,n,a),L=sL({alt:"media",token:c});return _+L})[0]}function lM(t,e){let n={},a=e.length;for(let r=0;r<a;r++){let i=e[r];i.writable&&(n[i.server]=t[i.local])}return JSON.stringify(n)}var nh=class{constructor(e,n,a,r){this.url=e,this.method=n,this.handler=a,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}};function pL(t){if(!t)throw M_()}function cM(t,e){function n(a,r){let i=hL(t,r,e);return pL(i!==null),i}return n}function dM(t,e){function n(a,r){let i=hL(t,r,e);return pL(i!==null),uM(i,r,t.host,t._protocol)}return n}function mL(t){function e(n,a){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=bN():r=AN():n.getStatus()===402?r=CN(t.bucket):n.getStatus()===403?r=LN(t.path):r=a,r.status=n.getStatus(),r.serverResponse=a.serverResponse,r}return e}function fM(t){let e=mL(t);function n(a,r){let i=e(a,r);return a.getStatus()===404&&(i=wN(t.path)),i.serverResponse=r.serverResponse,i}return n}function hM(t,e,n){let a=e.fullServerUrl(),r=F_(a,t.host,t._protocol),i="GET",s=t.maxOperationRetryTime,u=new nh(r,i,dM(t,n),s);return u.errorHandler=fM(e),u}function pM(t,e){return t&&t.contentType||e&&e.type()||"application/octet-stream"}function mM(t,e,n){let a=Object.assign({},n);return a.fullPath=t.path,a.size=e.size(),a.contentType||(a.contentType=pM(null,e)),a}function gM(t,e,n,a,r){let i=e.bucketOnlyServerUrl(),s={"X-Goog-Upload-Protocol":"multipart"};function u(){let A="";for(let x=0;x<2;x++)A=A+Math.random().toString().slice(2);return A}let l=u();s["Content-Type"]="multipart/related; boundary="+l;let c=mM(e,a,r),f=lM(c,n),m="--"+l+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+l+`\r
Content-Type: `+c.contentType+`\r
\r
`,p=`\r
--`+l+"--",_=th.getBlob(m,a,p);if(_===null)throw ON();let L={name:c.fullPath},k=F_(i,t.host,t._protocol),P="POST",E=t.maxUploadRetryTime,S=new nh(k,P,cM(t,n),E);return S.urlParams=L,S.headers=s,S.body=_.uploadData(),S.errorHandler=mL(e),S}var zq=256*1024;var Zb=null,O_=class{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Ni.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Ni.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Ni.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,n,a,r,i){if(this.sent_)throw El("cannot .send() more than once");if(Ft(e)&&a&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,e,!0),i!==void 0)for(let s in i)i.hasOwnProperty(s)&&this.xhr_.setRequestHeader(s,i[s].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw El("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw El("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw El("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw El("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}},N_=class extends O_{initXhr(){this.xhr_.responseType="text"}};function gL(){return Zb?Zb():new N_}var oo=class t{constructor(e,n){this._service=e,n instanceof Vn?this._location=n:this._location=Vn.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new t(e,n)}get root(){let e=new Vn(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return dL(this._location.path)}get storage(){return this._service}get parent(){let e=nM(this._location.path);if(e===null)return null;let n=new Vn(this._location.bucket,e);return new t(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw UN(e)}};function yM(t,e,n){t._throwIfRoot("uploadBytes");let a=gM(t.storage,t._location,fL(),new th(e,!0),n);return t.storage.makeRequestWithTokens(a,gL).then(r=>({metadata:r,ref:t}))}function _M(t,e,n=Fn.RAW,a){t._throwIfRoot("uploadString");let r=oL(n,e),i={...a};return i.contentType==null&&r.contentType!=null&&(i.contentType=r.contentType),yM(t,r.data,i)}function IM(t){t._throwIfRoot("getDownloadURL");let e=hM(t.storage,t._location,fL());return t.storage.makeRequestWithTokens(e,gL).then(n=>{if(n===null)throw NN();return n})}function TM(t,e){let n=aM(t._location.path,e),a=new Vn(t._location.bucket,n);return new oo(t.storage,a)}function SM(t){return/^[A-Za-z]+:\/\//.test(t)}function vM(t,e){return new oo(t,e)}function yL(t,e){if(t instanceof Al){let n=t;if(n._bucket==null)throw PN();let a=new oo(n,n._bucket);return e!=null?yL(a,e):a}else return e!==void 0?TM(t,e):t}function EM(t,e){if(e&&SM(e)){if(t instanceof Al)return vM(t,e);throw k_("To use ref(service, url), the first argument must be a Storage instance.")}else return yL(t,e)}function eL(t,e){let n=e?.[rL];return n==null?null:Vn.makeFromBucketSpec(n,t)}function wM(t,e,n,a={}){t.host=`${e}:${n}`;let r=Ft(e);r&&(Yr(`https://${t.host}/b`),Xr("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:i}=a;i&&(t._overrideAuthToken=typeof i=="string"?i:Gf(i,t.app.options.projectId))}var Al=class{constructor(e,n,a,r,i,s=!1){this.app=e,this._authProvider=n,this._appCheckProvider=a,this._url=r,this._firebaseVersion=i,this._isUsingEmulator=s,this._bucket=null,this._host=aL,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=vN,this._maxUploadRetryTime=EN,this._requests=new Set,r!=null?this._bucket=Vn.makeFromBucketSpec(r,this._host):this._bucket=eL(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Vn.makeFromBucketSpec(this._url,e):this._bucket=eL(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){Jb("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){Jb("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Ke(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new oo(this,e)}_makeRequest(e,n,a,r,i=!0){if(this._deleted)return new D_(iL());{let s=KN(e,this._appId,a,r,n,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(s),s.getPromise().then(()=>this._requests.delete(s),()=>this._requests.delete(s)),s}}async makeRequestWithTokens(e,n){let[a,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,a,r).getPromise()}},tL="@firebase/storage",nL="0.14.1";var _L="storage";function IL(t,e,n,a){return t=Ce(t),_M(t,e,n,a)}function TL(t){return t=Ce(t),IM(t)}function SL(t,e){return t=Ce(t),EM(t,e)}function ah(t=Jr(),e){t=Ce(t);let a=Un(t,_L).getImmediate({identifier:e}),r=Hf("storage");return r&&CM(a,...r),a}function CM(t,e,n,a={}){wM(t,e,n,a)}function AM(t,{instanceIdentifier:e}){let n=t.getProvider("app").getImmediate(),a=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new Al(n,a,r,e,Yt)}function bM(){fn(new bt(_L,AM,"PUBLIC").setMultipleInstances(!0)),Lt(tL,nL,""),Lt(tL,nL,"esm2020")}bM();var LM="firebase",RM="12.10.0";Lt(LM,RM,"app");function NL(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var ML=NL,UL=new dn("auth","Firebase",NL());var uh=new aa("@firebase/auth");function xM(t,...e){uh.logLevel<=ee.WARN&&uh.warn(`Auth (${Yt}): ${t}`,...e)}function sh(t,...e){uh.logLevel<=ee.ERROR&&uh.error(`Auth (${Yt}): ${t}`,...e)}function Vi(t,...e){throw sI(t,...e)}function VL(t,...e){return sI(t,...e)}function FL(t,e,n){let a={...ML(),[e]:n};return new dn("auth","Firebase",a).create(e,{appName:t.name})}function oh(t){return FL(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function sI(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return UL.create(t,...e)}function ne(t,e,...n){if(!t)throw sI(e,...n)}function ia(t){let e="INTERNAL ASSERTION FAILED: "+t;throw sh(e),new Error(e)}function lh(t,e){t||ia(e)}function kM(){return vL()==="http:"||vL()==="https:"}function vL(){return typeof self<"u"&&self.location?.protocol||null}function DM(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(kM()||Kf()||"connection"in navigator)?navigator.onLine:!0}function PM(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var H_=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,lh(n>e,"Short delay should be less than long delay!"),this.isMobile=jf()||Qf()}get(){return DM()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function OM(t,e){lh(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var ch=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ia("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ia("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ia("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var NM={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var MM=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],UM=new H_(3e4,6e4);function sa(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function oa(t,e,n,a,r={}){return BL(t,r,async()=>{let i={},s={};a&&(e==="GET"?s=a:i={body:JSON.stringify(a)});let u=na({key:t.config.apiKey,...s}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:l,...i};return Wf()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Ft(t.emulatorConfig.host)&&(c.credentials="include"),ch.fetch()(await qL(t,t.config.apiHost,n,u),c)})}async function BL(t,e,n){t._canInitEmulator=!1;let a={...NM,...e};try{let r=new G_(t),i=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let s=await i.json();if("needConfirmation"in s)throw rh(t,"account-exists-with-different-credential",s);if(i.ok&&!("errorMessage"in s))return s;{let u=i.ok?s.errorMessage:s.error.message,[l,c]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw rh(t,"credential-already-in-use",s);if(l==="EMAIL_EXISTS")throw rh(t,"email-already-in-use",s);if(l==="USER_DISABLED")throw rh(t,"user-disabled",s);let f=a[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw FL(t,f,c);Vi(t,f)}}catch(r){if(r instanceof yt)throw r;Vi(t,"network-request-failed",{message:String(r)})}}async function Eh(t,e,n,a,r={}){let i=await oa(t,e,n,a,r);return"mfaPendingCredential"in i&&Vi(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function qL(t,e,n,a){let r=`${e}${n}?${a}`,i=t,s=i.config.emulator?OM(t.config,r):`${t.config.apiScheme}://${r}`;return MM.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(s).toString():s}function VM(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var G_=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(VL(this.auth,"network-request-failed")),UM.get())})}};function rh(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=VL(t,e,a);return r.customData._tokenResponse=n,r}function EL(t){return t!==void 0&&t.enterprise!==void 0}var j_=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return VM(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function FM(t,e){return oa(t,"GET","/v2/recaptchaConfig",sa(t,e))}async function BM(t,e){return oa(t,"POST","/v1/accounts:delete",e)}async function dh(t,e){return oa(t,"POST","/v1/accounts:lookup",e)}function Ll(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function zL(t,e=!1){let n=Ce(t),a=await n.getIdToken(e),r=HL(a);ne(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let i=typeof r.firebase=="object"?r.firebase:void 0,s=i?.sign_in_provider;return{claims:r,token:a,authTime:Ll(B_(r.auth_time)),issuedAtTime:Ll(B_(r.iat)),expirationTime:Ll(B_(r.exp)),signInProvider:s||null,signInSecondFactor:i?.sign_in_second_factor||null}}function B_(t){return Number(t)*1e3}function HL(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return sh("JWT malformed, contained fewer than 3 sections"),null;try{let r=io(n);return r?JSON.parse(r):(sh("Failed to decode base64 JWT payload"),null)}catch(r){return sh("Caught error parsing JWT payload as JSON",r?.toString()),null}}function wL(t){let e=HL(t);return ne(e,"internal-error"),ne(typeof e.exp<"u","internal-error"),ne(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function W_(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof yt&&qM(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function qM({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var K_=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var xl=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ll(this.lastLoginAt),this.creationTime=Ll(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function fh(t){let e=t.auth,n=await t.getIdToken(),a=await W_(t,dh(e,{idToken:n}));ne(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let i=r.providerUserInfo?.length?jL(r.providerUserInfo):[],s=zM(t.providerData,i),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!s?.length,c=u?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new xl(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function GL(t){let e=Ce(t);await fh(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function zM(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function jL(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function HM(t,e){let n=await BL(t,{},async()=>{let a=na({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=t.config,s=await qL(t,r,"/v1/token",`key=${i}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:a};return t.emulatorConfig&&Ft(t.emulatorConfig.host)&&(l.credentials="include"),ch.fetch()(s,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function GM(t,e){return oa(t,"POST","/v2/accounts:revokeToken",sa(t,e))}var Rl=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ne(e.idToken,"internal-error"),ne(typeof e.idToken<"u","internal-error"),ne(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):wL(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ne(e.length!==0,"internal-error");let n=wL(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ne(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:i}=await HM(e,n);this.updateTokensAndExpiration(a,r,Number(i))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:i}=n,s=new t;return a&&(ne(typeof a=="string","internal-error",{appName:e}),s.refreshToken=a),r&&(ne(typeof r=="string","internal-error",{appName:e}),s.accessToken=r),i&&(ne(typeof i=="number","internal-error",{appName:e}),s.expirationTime=i),s}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return ia("not implemented")}};function Zr(t,e){ne(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var Mi=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new K_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new xl(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await W_(this,this.stsTokenManager.getToken(this.auth,e));return ne(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return zL(this,e)}reload(){return GL(this)}_assign(e){this!==e&&(ne(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){ne(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await fh(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ke(this.auth.app))return Promise.reject(oh(this.auth));let e=await this.getIdToken();return await W_(this,BM(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,i=n.phoneNumber??void 0,s=n.photoURL??void 0,u=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:m,emailVerified:p,isAnonymous:_,providerData:L,stsTokenManager:k}=n;ne(m&&k,e,"internal-error");let P=Rl.fromJSON(this.name,k);ne(typeof m=="string",e,"internal-error"),Zr(a,e.name),Zr(r,e.name),ne(typeof p=="boolean",e,"internal-error"),ne(typeof _=="boolean",e,"internal-error"),Zr(i,e.name),Zr(s,e.name),Zr(u,e.name),Zr(l,e.name),Zr(c,e.name),Zr(f,e.name);let E=new t({uid:m,auth:e,email:r,emailVerified:p,displayName:a,isAnonymous:_,photoURL:s,phoneNumber:i,tenantId:u,stsTokenManager:P,createdAt:c,lastLoginAt:f});return L&&Array.isArray(L)&&(E.providerData=L.map(S=>({...S}))),l&&(E._redirectEventId=l),E}static async _fromIdTokenResponse(e,n,a=!1){let r=new Rl;r.updateFromServerResponse(n);let i=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await fh(i),i}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];ne(r.localId!==void 0,"internal-error");let i=r.providerUserInfo!==void 0?jL(r.providerUserInfo):[],s=!(r.email&&r.passwordHash)&&!i?.length,u=new Rl;u.updateFromIdToken(a);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:s}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new xl(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!i?.length};return Object.assign(l,c),l}};var CL=new Map;function Ui(t){lh(t instanceof Function,"Expected a class definition");let e=CL.get(t);return e?(lh(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,CL.set(t,e),e)}var hh=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};hh.type="NONE";var Q_=hh;function q_(t,e,n){return`firebase:${t}:${e}:${n}`}var ph=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:i}=this.auth;this.fullUserKey=q_(this.userKey,r.apiKey,i),this.fullPersistenceKey=q_("persistence",r.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await dh(this.auth,{idToken:e}).catch(()=>{});return n?Mi._fromGetAccountInfoResponse(this.auth,n,e):null}return Mi._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(Ui(Q_),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),i=r[0]||Ui(Q_),s=q_(a,e.config.apiKey,e.name),u=null;for(let c of n)try{let f=await c._get(s);if(f){let m;if(typeof f=="string"){let p=await dh(e,{idToken:f}).catch(()=>{});if(!p)break;m=await Mi._fromGetAccountInfoResponse(e,p,f)}else m=Mi._fromJSON(e,f);c!==i&&(u=m),i=c;break}}catch{}let l=r.filter(c=>c._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new t(i,e,a):(i=l[0],u&&await i._set(s,u.toJSON()),await Promise.all(n.map(async c=>{if(c!==i)try{await c._remove(s)}catch{}})),new t(i,e,a))}};function AL(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(QM(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(jM(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(XM(e))return"Blackberry";if($M(e))return"Webos";if(WM(e))return"Safari";if((e.includes("chrome/")||KM(e))&&!e.includes("edge/"))return"Chrome";if(YM(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function jM(t=Se()){return/firefox\//i.test(t)}function WM(t=Se()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function KM(t=Se()){return/crios\//i.test(t)}function QM(t=Se()){return/iemobile/i.test(t)}function YM(t=Se()){return/android/i.test(t)}function XM(t=Se()){return/blackberry/i.test(t)}function $M(t=Se()){return/webos/i.test(t)}function WL(t,e=[]){let n;switch(t){case"Browser":n=AL(Se());break;case"Worker":n=`${AL(Se())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Yt}/${a}`}var Y_=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=i=>new Promise((s,u)=>{try{let l=e(i);s(l)}catch(l){u(l)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function JM(t,e={}){return oa(t,"GET","/v2/passwordPolicy",sa(t,e))}var ZM=6,X_=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??ZM,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}};var $_=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new mh(this),this.idTokenSubscription=new mh(this),this.beforeStateQueue=new Y_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=UL,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Ui(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await ph.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await dh(this,{idToken:e}),a=await Mi._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(Ke(this.app)){let i=this.app.settings.authIdToken;return i?new Promise(s=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(i).then(s,s))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let i=this.redirectUser?._redirectEventId,s=a?._redirectEventId,u=await this.tryRedirectSignIn(e);(!i||i===s)&&u?.user&&(a=u.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(i){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(i))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return ne(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await fh(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=PM()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ke(this.app))return Promise.reject(oh(this));let n=e?Ce(e):null;return n&&ne(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ne(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ke(this.app)?Promise.reject(oh(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ke(this.app)?Promise.reject(oh(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ui(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await JM(this),n=new X_(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new dn("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await GM(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&Ui(e)||this._popupRedirectResolver;ne(n,this,"argument-error"),this.redirectPersistenceManager=await ph.create(this,[Ui(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let i=typeof n=="function"?n:n.next.bind(n),s=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(ne(u,this,"internal-error"),u.then(()=>{s||i(this.currentUser)}),typeof n=="function"){let l=e.addObserver(n,a,r);return()=>{s=!0,l()}}else{let l=e.addObserver(n);return()=>{s=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ne(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=WL(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(Ke(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&xM(`Error while retrieving App Check token: ${e.error}`),e?.token}};function oI(t){return Ce(t)}var mh=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=Yf(n=>this.observer=n)}get next(){return ne(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var KL={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function e2(t){return KL.loadJS(t)}function t2(){return KL.recaptchaEnterpriseScript}var J_=class{constructor(){this.enterprise=new Z_}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},Z_=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var n2="recaptcha-enterprise",QL="NO_RECAPTCHA",eI=class{constructor(e){this.type=n2,this.auth=oI(e)}async verify(e="verify",n=!1){async function a(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(s,u)=>{FM(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let c=new j_(l);return i.tenantId==null?i._agentRecaptchaConfig=c:i._tenantRecaptchaConfigs[i.tenantId]=c,s(c.siteKey)}}).catch(l=>{u(l)})})}function r(i,s,u){let l=window.grecaptcha;EL(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(c=>{s(c)}).catch(()=>{s(QL)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new J_().execute("siteKey",{action:"verify"}):new Promise((i,s)=>{a(this.auth).then(u=>{if(!n&&EL(window.grecaptcha))r(u,i,s);else{if(typeof window>"u"){s(new Error("RecaptchaVerifier is only supported in browser"));return}let l=t2();l.length!==0&&(l+=u),e2(l).then(()=>{r(u,i,s)}).catch(c=>{s(c)})}}).catch(u=>{s(u)})})}};async function bl(t,e,n,a=!1,r=!1){let i=new eI(t),s;if(r)s=QL;else try{s=await i.verify(n)}catch{s=await i.verify(n,!0)}let u={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,c=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return a?Object.assign(u,{captchaResp:s}):Object.assign(u,{captchaResponse:s}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function bL(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let i=await bl(t,e,n,n==="getOobCode");return a(t,i)}else return a(t,e).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let s=await bl(t,e,n,n==="getOobCode");return a(t,s)}else return Promise.reject(i)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let i=await bl(t,e,n);return a(t,i).catch(async s=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(s.code==="auth/missing-recaptcha-token"||s.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let u=await bl(t,e,n,!1,!0);return a(t,u)}return Promise.reject(s)})}else{let i=await bl(t,e,n,!1,!0);return a(t,i)}else return Promise.reject(r+" provider is not supported.")}function uI(t,e){let n=Un(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),i=n.getOptions();if(Bt(i,e??{}))return r;Vi(r,"already-initialized")}return n.initialize({options:e})}function a2(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(Ui);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function lI(t,e,n){let a=oI(t);ne(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,i=YL(e),{host:s,port:u}=r2(e),l=u===null?"":`:${u}`,c={url:`${i}//${s}${l}/`},f=Object.freeze({host:s,port:u,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){ne(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),ne(Bt(c,a.config.emulator)&&Bt(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Ft(s)?(Yr(`${i}//${s}${l}`),Xr("Auth",!0)):r||i2()}function YL(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function r2(t){let e=YL(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let i=r[1];return{host:i,port:LL(a.substr(i.length+1))}}else{let[i,s]=a.split(":");return{host:i,port:LL(s)}}}function LL(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function i2(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var kl=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return ia("not implemented")}_getIdTokenResponse(e){return ia("not implemented")}_linkToIdToken(e,n){return ia("not implemented")}_getReauthenticationResolver(e){return ia("not implemented")}};async function s2(t,e){return oa(t,"POST","/v1/accounts:signUp",e)}async function o2(t,e){return Eh(t,"POST","/v1/accounts:signInWithPassword",sa(t,e))}async function u2(t,e){return Eh(t,"POST","/v1/accounts:signInWithEmailLink",sa(t,e))}async function l2(t,e){return Eh(t,"POST","/v1/accounts:signInWithEmailLink",sa(t,e))}var Dl=class t extends kl{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return bL(e,n,"signInWithPassword",o2,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return u2(e,{email:this._email,oobCode:this._password});default:Vi(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return bL(e,a,"signUpPassword",s2,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return l2(e,{idToken:n,email:this._email,oobCode:this._password});default:Vi(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function z_(t,e){return Eh(t,"POST","/v1/accounts:signInWithIdp",sa(t,e))}var c2="http://localhost",Fi=class t extends kl{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Vi("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...i}=n;if(!a||!r)return null;let s=new t(a,r);return s.idToken=i.idToken||void 0,s.accessToken=i.accessToken||void 0,s.secret=i.secret,s.nonce=i.nonce,s.pendingToken=i.pendingToken||null,s}_getIdTokenResponse(e){let n=this.buildRequest();return z_(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,z_(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,z_(e,n)}buildRequest(){let e={requestUri:c2,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=na(n)}return e}};function d2(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function f2(t){let e=bn(Ln(t)).link,n=e?bn(Ln(e)).deep_link_id:null,a=bn(Ln(t)).deep_link_id;return(a?bn(Ln(a)).link:null)||a||n||e||t}var gh=class t{constructor(e){let n=bn(Ln(e)),a=n.apiKey??null,r=n.oobCode??null,i=d2(n.mode??null);ne(a&&r&&i,"argument-error"),this.apiKey=a,this.operation=i,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=f2(e);try{return new t(n)}catch{return null}}};var uo=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return Dl._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=gh.parseLink(n);return ne(a,"argument-error"),Dl._fromEmailAndCode(e,a.code,a.tenantId)}};uo.PROVIDER_ID="password";uo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";uo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var tI=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var lo=class extends tI{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var Pl=class t extends lo{constructor(){super("facebook.com")}static credential(e){return Fi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Pl.FACEBOOK_SIGN_IN_METHOD="facebook.com";Pl.PROVIDER_ID="facebook.com";var Ol=class t extends lo{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Fi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};Ol.GOOGLE_SIGN_IN_METHOD="google.com";Ol.PROVIDER_ID="google.com";var Nl=class t extends lo{constructor(){super("github.com")}static credential(e){return Fi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Nl.GITHUB_SIGN_IN_METHOD="github.com";Nl.PROVIDER_ID="github.com";var Ml=class t extends lo{constructor(){super("twitter.com")}static credential(e,n){return Fi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};Ml.TWITTER_SIGN_IN_METHOD="twitter.com";Ml.PROVIDER_ID="twitter.com";function h2(t,e){return oa(t,"POST","/v2/accounts/mfaEnrollment:start",sa(t,e))}function p2(t,e){return oa(t,"POST","/v2/accounts/mfaEnrollment:finalize",sa(t,e))}var RL="__sak";function m2(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var yh=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:i}=n.data,s=this.handlersMap[r];if(!s?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let u=Array.from(s).map(async c=>c(n.origin,i)),l=await m2(u);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};yh.receivers=[];function g2(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var nI=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,s;return new Promise((u,l)=>{let c=g2("",20);r.port1.start();let f=setTimeout(()=>{l(new Error("unsupported_event"))},a);s={messageChannel:r,onMessage(m){let p=m;if(p.data.eventId===c)switch(p.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),u(p.data.response);break;default:clearTimeout(f),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(s),r.port1.addEventListener("message",s.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{s&&this.removeMessageHandler(s)})}};function xL(){return window}function XL(){return typeof xL().WorkerGlobalScope<"u"&&typeof xL().importScripts=="function"}async function y2(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function _2(){return navigator?.serviceWorker?.controller||null}function I2(){return XL()?self:null}var $L="firebaseLocalStorageDb",T2=1,_h="firebaseLocalStorage",JL="fbase_key",Bi=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function wh(t,e){return t.transaction([_h],e?"readwrite":"readonly").objectStore(_h)}function S2(){let t=indexedDB.deleteDatabase($L);return new Bi(t).toPromise()}function aI(){let t=indexedDB.open($L,T2);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(_h,{keyPath:JL})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(_h)?e(a):(a.close(),await S2(),e(await aI()))})})}async function kL(t,e,n){let a=wh(t,!0).put({[JL]:e,value:n});return new Bi(a).toPromise()}async function v2(t,e){let n=wh(t,!1).get(e),a=await new Bi(n).toPromise();return a===void 0?null:a.value}function DL(t,e){let n=wh(t,!0).delete(e);return new Bi(n).toPromise()}var E2=800,w2=3,Ih=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await aI(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>w2)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return XL()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=yh._getInstance(I2()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await y2(),!this.activeServiceWorker)return;this.sender=new nI(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||_2()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await aI();return await kL(e,RL,"1"),await DL(e,RL),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>kL(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>v2(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>DL(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let i=wh(r,!1).getAll();return new Bi(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:i}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),E2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Ih.type="LOCAL";var cI=Ih;function C2(t,e){return oa(t,"POST","/v2/accounts/mfaSignIn:finalize",sa(t,e))}var rI=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return ia("unexpected MultiFactorSessionType")}}},Th=class{static assertionForEnrollment(e,n){return Sh._fromSecret(e,n)}static assertionForSignIn(e,n){return Sh._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;ne(typeof n.user?.auth<"u","internal-error");let a=await h2(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return vh._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Th.FACTOR_ID="totp";var Sh=class t extends rI{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return ne(typeof this.secret<"u",e,"argument-error"),p2(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){ne(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return C2(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},vh=class t{constructor(e,n,a,r,i,s,u){this.sessionInfo=s,this.auth=u,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=i}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(ih(e)||ih(n))&&(a=!0),a&&(ih(e)&&(e=this.auth.currentUser?.email||"unknownuser"),ih(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function ih(t){return typeof t>"u"||t?.length===0}var PL="@firebase/auth",OL="1.12.1";var iI=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ne(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function A2(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function ZL(t){fn(new bt("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:s,authDomain:u}=a.options;ne(s&&!s.includes(":"),"invalid-api-key",{appName:a.name});let l={apiKey:s,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:WL(t)},c=new $_(a,r,i,l);return a2(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),fn(new bt("auth-internal",e=>{let n=oI(e.getProvider("auth").getImmediate());return(a=>new iI(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Lt(PL,OL,A2(t)),Lt(PL,OL,"esm2020")}function eR(t=Jr()){let e=Un(t,"auth");if(e.isInitialized())return e.getImmediate();let n=uI(t,{persistence:[cI]}),a=Tl("auth");return a&&lI(n,`http://${a}`),n}ZL("WebExtension");var tR=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},nR={};var Ga,dI;(function(){var t;function e(T,g){function I(){}I.prototype=g.prototype,T.F=g.prototype,T.prototype=new I,T.prototype.constructor=T,T.D=function(v,C,b){for(var w=Array(arguments.length-2),Ae=2;Ae<arguments.length;Ae++)w[Ae-2]=arguments[Ae];return g.prototype[C].apply(v,w)}}function n(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(a,n),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(T,g,I){I||(I=0);let v=Array(16);if(typeof g=="string")for(var C=0;C<16;++C)v[C]=g.charCodeAt(I++)|g.charCodeAt(I++)<<8|g.charCodeAt(I++)<<16|g.charCodeAt(I++)<<24;else for(C=0;C<16;++C)v[C]=g[I++]|g[I++]<<8|g[I++]<<16|g[I++]<<24;g=T.g[0],I=T.g[1],C=T.g[2];let b=T.g[3],w;w=g+(b^I&(C^b))+v[0]+3614090360&4294967295,g=I+(w<<7&4294967295|w>>>25),w=b+(C^g&(I^C))+v[1]+3905402710&4294967295,b=g+(w<<12&4294967295|w>>>20),w=C+(I^b&(g^I))+v[2]+606105819&4294967295,C=b+(w<<17&4294967295|w>>>15),w=I+(g^C&(b^g))+v[3]+3250441966&4294967295,I=C+(w<<22&4294967295|w>>>10),w=g+(b^I&(C^b))+v[4]+4118548399&4294967295,g=I+(w<<7&4294967295|w>>>25),w=b+(C^g&(I^C))+v[5]+1200080426&4294967295,b=g+(w<<12&4294967295|w>>>20),w=C+(I^b&(g^I))+v[6]+2821735955&4294967295,C=b+(w<<17&4294967295|w>>>15),w=I+(g^C&(b^g))+v[7]+4249261313&4294967295,I=C+(w<<22&4294967295|w>>>10),w=g+(b^I&(C^b))+v[8]+1770035416&4294967295,g=I+(w<<7&4294967295|w>>>25),w=b+(C^g&(I^C))+v[9]+2336552879&4294967295,b=g+(w<<12&4294967295|w>>>20),w=C+(I^b&(g^I))+v[10]+4294925233&4294967295,C=b+(w<<17&4294967295|w>>>15),w=I+(g^C&(b^g))+v[11]+2304563134&4294967295,I=C+(w<<22&4294967295|w>>>10),w=g+(b^I&(C^b))+v[12]+1804603682&4294967295,g=I+(w<<7&4294967295|w>>>25),w=b+(C^g&(I^C))+v[13]+4254626195&4294967295,b=g+(w<<12&4294967295|w>>>20),w=C+(I^b&(g^I))+v[14]+2792965006&4294967295,C=b+(w<<17&4294967295|w>>>15),w=I+(g^C&(b^g))+v[15]+1236535329&4294967295,I=C+(w<<22&4294967295|w>>>10),w=g+(C^b&(I^C))+v[1]+4129170786&4294967295,g=I+(w<<5&4294967295|w>>>27),w=b+(I^C&(g^I))+v[6]+3225465664&4294967295,b=g+(w<<9&4294967295|w>>>23),w=C+(g^I&(b^g))+v[11]+643717713&4294967295,C=b+(w<<14&4294967295|w>>>18),w=I+(b^g&(C^b))+v[0]+3921069994&4294967295,I=C+(w<<20&4294967295|w>>>12),w=g+(C^b&(I^C))+v[5]+3593408605&4294967295,g=I+(w<<5&4294967295|w>>>27),w=b+(I^C&(g^I))+v[10]+38016083&4294967295,b=g+(w<<9&4294967295|w>>>23),w=C+(g^I&(b^g))+v[15]+3634488961&4294967295,C=b+(w<<14&4294967295|w>>>18),w=I+(b^g&(C^b))+v[4]+3889429448&4294967295,I=C+(w<<20&4294967295|w>>>12),w=g+(C^b&(I^C))+v[9]+568446438&4294967295,g=I+(w<<5&4294967295|w>>>27),w=b+(I^C&(g^I))+v[14]+3275163606&4294967295,b=g+(w<<9&4294967295|w>>>23),w=C+(g^I&(b^g))+v[3]+4107603335&4294967295,C=b+(w<<14&4294967295|w>>>18),w=I+(b^g&(C^b))+v[8]+1163531501&4294967295,I=C+(w<<20&4294967295|w>>>12),w=g+(C^b&(I^C))+v[13]+2850285829&4294967295,g=I+(w<<5&4294967295|w>>>27),w=b+(I^C&(g^I))+v[2]+4243563512&4294967295,b=g+(w<<9&4294967295|w>>>23),w=C+(g^I&(b^g))+v[7]+1735328473&4294967295,C=b+(w<<14&4294967295|w>>>18),w=I+(b^g&(C^b))+v[12]+2368359562&4294967295,I=C+(w<<20&4294967295|w>>>12),w=g+(I^C^b)+v[5]+4294588738&4294967295,g=I+(w<<4&4294967295|w>>>28),w=b+(g^I^C)+v[8]+2272392833&4294967295,b=g+(w<<11&4294967295|w>>>21),w=C+(b^g^I)+v[11]+1839030562&4294967295,C=b+(w<<16&4294967295|w>>>16),w=I+(C^b^g)+v[14]+4259657740&4294967295,I=C+(w<<23&4294967295|w>>>9),w=g+(I^C^b)+v[1]+2763975236&4294967295,g=I+(w<<4&4294967295|w>>>28),w=b+(g^I^C)+v[4]+1272893353&4294967295,b=g+(w<<11&4294967295|w>>>21),w=C+(b^g^I)+v[7]+4139469664&4294967295,C=b+(w<<16&4294967295|w>>>16),w=I+(C^b^g)+v[10]+3200236656&4294967295,I=C+(w<<23&4294967295|w>>>9),w=g+(I^C^b)+v[13]+681279174&4294967295,g=I+(w<<4&4294967295|w>>>28),w=b+(g^I^C)+v[0]+3936430074&4294967295,b=g+(w<<11&4294967295|w>>>21),w=C+(b^g^I)+v[3]+3572445317&4294967295,C=b+(w<<16&4294967295|w>>>16),w=I+(C^b^g)+v[6]+76029189&4294967295,I=C+(w<<23&4294967295|w>>>9),w=g+(I^C^b)+v[9]+3654602809&4294967295,g=I+(w<<4&4294967295|w>>>28),w=b+(g^I^C)+v[12]+3873151461&4294967295,b=g+(w<<11&4294967295|w>>>21),w=C+(b^g^I)+v[15]+530742520&4294967295,C=b+(w<<16&4294967295|w>>>16),w=I+(C^b^g)+v[2]+3299628645&4294967295,I=C+(w<<23&4294967295|w>>>9),w=g+(C^(I|~b))+v[0]+4096336452&4294967295,g=I+(w<<6&4294967295|w>>>26),w=b+(I^(g|~C))+v[7]+1126891415&4294967295,b=g+(w<<10&4294967295|w>>>22),w=C+(g^(b|~I))+v[14]+2878612391&4294967295,C=b+(w<<15&4294967295|w>>>17),w=I+(b^(C|~g))+v[5]+4237533241&4294967295,I=C+(w<<21&4294967295|w>>>11),w=g+(C^(I|~b))+v[12]+1700485571&4294967295,g=I+(w<<6&4294967295|w>>>26),w=b+(I^(g|~C))+v[3]+2399980690&4294967295,b=g+(w<<10&4294967295|w>>>22),w=C+(g^(b|~I))+v[10]+4293915773&4294967295,C=b+(w<<15&4294967295|w>>>17),w=I+(b^(C|~g))+v[1]+2240044497&4294967295,I=C+(w<<21&4294967295|w>>>11),w=g+(C^(I|~b))+v[8]+1873313359&4294967295,g=I+(w<<6&4294967295|w>>>26),w=b+(I^(g|~C))+v[15]+4264355552&4294967295,b=g+(w<<10&4294967295|w>>>22),w=C+(g^(b|~I))+v[6]+2734768916&4294967295,C=b+(w<<15&4294967295|w>>>17),w=I+(b^(C|~g))+v[13]+1309151649&4294967295,I=C+(w<<21&4294967295|w>>>11),w=g+(C^(I|~b))+v[4]+4149444226&4294967295,g=I+(w<<6&4294967295|w>>>26),w=b+(I^(g|~C))+v[11]+3174756917&4294967295,b=g+(w<<10&4294967295|w>>>22),w=C+(g^(b|~I))+v[2]+718787259&4294967295,C=b+(w<<15&4294967295|w>>>17),w=I+(b^(C|~g))+v[9]+3951481745&4294967295,T.g[0]=T.g[0]+g&4294967295,T.g[1]=T.g[1]+(C+(w<<21&4294967295|w>>>11))&4294967295,T.g[2]=T.g[2]+C&4294967295,T.g[3]=T.g[3]+b&4294967295}a.prototype.v=function(T,g){g===void 0&&(g=T.length);let I=g-this.blockSize,v=this.C,C=this.h,b=0;for(;b<g;){if(C==0)for(;b<=I;)r(this,T,b),b+=this.blockSize;if(typeof T=="string"){for(;b<g;)if(v[C++]=T.charCodeAt(b++),C==this.blockSize){r(this,v),C=0;break}}else for(;b<g;)if(v[C++]=T[b++],C==this.blockSize){r(this,v),C=0;break}}this.h=C,this.o+=g},a.prototype.A=function(){var T=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);T[0]=128;for(var g=1;g<T.length-8;++g)T[g]=0;g=this.o*8;for(var I=T.length-8;I<T.length;++I)T[I]=g&255,g/=256;for(this.v(T),T=Array(16),g=0,I=0;I<4;++I)for(let v=0;v<32;v+=8)T[g++]=this.g[I]>>>v&255;return T};function i(T,g){var I=u;return Object.prototype.hasOwnProperty.call(I,T)?I[T]:I[T]=g(T)}function s(T,g){this.h=g;let I=[],v=!0;for(let C=T.length-1;C>=0;C--){let b=T[C]|0;v&&b==g||(I[C]=b,v=!1)}this.g=I}var u={};function l(T){return-128<=T&&T<128?i(T,function(g){return new s([g|0],g<0?-1:0)}):new s([T|0],T<0?-1:0)}function c(T){if(isNaN(T)||!isFinite(T))return m;if(T<0)return P(c(-T));let g=[],I=1;for(let v=0;T>=I;v++)g[v]=T/I|0,I*=4294967296;return new s(g,0)}function f(T,g){if(T.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(T.charAt(0)=="-")return P(f(T.substring(1),g));if(T.indexOf("-")>=0)throw Error('number format error: interior "-" character');let I=c(Math.pow(g,8)),v=m;for(let b=0;b<T.length;b+=8){var C=Math.min(8,T.length-b);let w=parseInt(T.substring(b,b+C),g);C<8?(C=c(Math.pow(g,C)),v=v.j(C).add(c(w))):(v=v.j(I),v=v.add(c(w)))}return v}var m=l(0),p=l(1),_=l(16777216);t=s.prototype,t.m=function(){if(k(this))return-P(this).m();let T=0,g=1;for(let I=0;I<this.g.length;I++){let v=this.i(I);T+=(v>=0?v:4294967296+v)*g,g*=4294967296}return T},t.toString=function(T){if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(L(this))return"0";if(k(this))return"-"+P(this).toString(T);let g=c(Math.pow(T,6));var I=this;let v="";for(;;){let C=x(I,g).g;I=E(I,C.j(g));let b=((I.g.length>0?I.g[0]:I.h)>>>0).toString(T);if(I=C,L(I))return b+v;for(;b.length<6;)b="0"+b;v=b+v}},t.i=function(T){return T<0?0:T<this.g.length?this.g[T]:this.h};function L(T){if(T.h!=0)return!1;for(let g=0;g<T.g.length;g++)if(T.g[g]!=0)return!1;return!0}function k(T){return T.h==-1}t.l=function(T){return T=E(this,T),k(T)?-1:L(T)?0:1};function P(T){let g=T.g.length,I=[];for(let v=0;v<g;v++)I[v]=~T.g[v];return new s(I,~T.h).add(p)}t.abs=function(){return k(this)?P(this):this},t.add=function(T){let g=Math.max(this.g.length,T.g.length),I=[],v=0;for(let C=0;C<=g;C++){let b=v+(this.i(C)&65535)+(T.i(C)&65535),w=(b>>>16)+(this.i(C)>>>16)+(T.i(C)>>>16);v=w>>>16,b&=65535,w&=65535,I[C]=w<<16|b}return new s(I,I[I.length-1]&-2147483648?-1:0)};function E(T,g){return T.add(P(g))}t.j=function(T){if(L(this)||L(T))return m;if(k(this))return k(T)?P(this).j(P(T)):P(P(this).j(T));if(k(T))return P(this.j(P(T)));if(this.l(_)<0&&T.l(_)<0)return c(this.m()*T.m());let g=this.g.length+T.g.length,I=[];for(var v=0;v<2*g;v++)I[v]=0;for(v=0;v<this.g.length;v++)for(let C=0;C<T.g.length;C++){let b=this.i(v)>>>16,w=this.i(v)&65535,Ae=T.i(C)>>>16,he=T.i(C)&65535;I[2*v+2*C]+=w*he,S(I,2*v+2*C),I[2*v+2*C+1]+=b*he,S(I,2*v+2*C+1),I[2*v+2*C+1]+=w*Ae,S(I,2*v+2*C+1),I[2*v+2*C+2]+=b*Ae,S(I,2*v+2*C+2)}for(T=0;T<g;T++)I[T]=I[2*T+1]<<16|I[2*T];for(T=g;T<2*g;T++)I[T]=0;return new s(I,0)};function S(T,g){for(;(T[g]&65535)!=T[g];)T[g+1]+=T[g]>>>16,T[g]&=65535,g++}function A(T,g){this.g=T,this.h=g}function x(T,g){if(L(g))throw Error("division by zero");if(L(T))return new A(m,m);if(k(T))return g=x(P(T),g),new A(P(g.g),P(g.h));if(k(g))return g=x(T,P(g)),new A(P(g.g),g.h);if(T.g.length>30){if(k(T)||k(g))throw Error("slowDivide_ only works with positive integers.");for(var I=p,v=g;v.l(T)<=0;)I=V(I),v=V(v);var C=M(I,1),b=M(v,1);for(v=M(v,2),I=M(I,2);!L(v);){var w=b.add(v);w.l(T)<=0&&(C=C.add(I),b=w),v=M(v,1),I=M(I,1)}return g=E(T,C.j(g)),new A(C,g)}for(C=m;T.l(g)>=0;){for(I=Math.max(1,Math.floor(T.m()/g.m())),v=Math.ceil(Math.log(I)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),b=c(I),w=b.j(g);k(w)||w.l(T)>0;)I-=v,b=c(I),w=b.j(g);L(b)&&(b=p),C=C.add(b),T=E(T,w)}return new A(C,T)}t.B=function(T){return x(this,T).h},t.and=function(T){let g=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<g;v++)I[v]=this.i(v)&T.i(v);return new s(I,this.h&T.h)},t.or=function(T){let g=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<g;v++)I[v]=this.i(v)|T.i(v);return new s(I,this.h|T.h)},t.xor=function(T){let g=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<g;v++)I[v]=this.i(v)^T.i(v);return new s(I,this.h^T.h)};function V(T){let g=T.g.length+1,I=[];for(let v=0;v<g;v++)I[v]=T.i(v)<<1|T.i(v-1)>>>31;return new s(I,T.h)}function M(T,g){let I=g>>5;g%=32;let v=T.g.length-I,C=[];for(let b=0;b<v;b++)C[b]=g>0?T.i(b+I)>>>g|T.i(b+I+1)<<32-g:T.i(b+I);return new s(C,T.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,dI=nR.Md5=a,s.prototype.add=s.prototype.add,s.prototype.multiply=s.prototype.j,s.prototype.modulo=s.prototype.B,s.prototype.compare=s.prototype.l,s.prototype.toNumber=s.prototype.m,s.prototype.toString=s.prototype.toString,s.prototype.getBits=s.prototype.i,s.fromNumber=c,s.fromString=f,Ga=nR.Integer=s}).apply(typeof tR<"u"?tR:typeof self<"u"?self:typeof window<"u"?window:{});var Ch=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},ja={};var fI,b2,co,hI,Ul,Ah,pI,mI,gI;(function(){var t,e=Object.defineProperty;function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ch=="object"&&Ch];for(var d=0;d<o.length;++d){var h=o[d];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var a=n(this);function r(o,d){if(d)e:{var h=a;o=o.split(".");for(var y=0;y<o.length-1;y++){var R=o[y];if(!(R in h))break e;h=h[R]}o=o[o.length-1],y=h[o],d=d(y),d!=y&&d!=null&&e(h,o,{configurable:!0,writable:!0,value:d})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(d){var h=[],y;for(y in d)Object.prototype.hasOwnProperty.call(d,y)&&h.push([y,d[y]]);return h}});var i=i||{},s=this||self;function u(o){var d=typeof o;return d=="object"&&o!=null||d=="function"}function l(o,d,h){return o.call.apply(o.bind,arguments)}function c(o,d,h){return c=l,c.apply(null,arguments)}function f(o,d){var h=Array.prototype.slice.call(arguments,1);return function(){var y=h.slice();return y.push.apply(y,arguments),o.apply(this,y)}}function m(o,d){function h(){}h.prototype=d.prototype,o.Z=d.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(y,R,D){for(var F=Array(arguments.length-2),te=2;te<arguments.length;te++)F[te-2]=arguments[te];return d.prototype[R].apply(y,F)}}var p=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function _(o){let d=o.length;if(d>0){let h=Array(d);for(let y=0;y<d;y++)h[y]=o[y];return h}return[]}function L(o,d){for(let y=1;y<arguments.length;y++){let R=arguments[y];var h=typeof R;if(h=h!="object"?h:R?Array.isArray(R)?"array":h:"null",h=="array"||h=="object"&&typeof R.length=="number"){h=o.length||0;let D=R.length||0;o.length=h+D;for(let F=0;F<D;F++)o[h+F]=R[F]}else o.push(R)}}class k{constructor(d,h){this.i=d,this.j=h,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function P(o){s.setTimeout(()=>{throw o},0)}function E(){var o=T;let d=null;return o.g&&(d=o.g,o.g=o.g.next,o.g||(o.h=null),d.next=null),d}class S{constructor(){this.h=this.g=null}add(d,h){let y=A.get();y.set(d,h),this.h?this.h.next=y:this.g=y,this.h=y}}var A=new k(()=>new x,o=>o.reset());class x{constructor(){this.next=this.g=this.h=null}set(d,h){this.h=d,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let V,M=!1,T=new S,g=()=>{let o=Promise.resolve(void 0);V=()=>{o.then(I)}};function I(){for(var o;o=E();){try{o.h.call(o.g)}catch(h){P(h)}var d=A;d.j(o),d.h<100&&(d.h++,o.next=d.g,d.g=o)}M=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function C(o,d){this.type=o,this.g=this.target=d,this.defaultPrevented=!1}C.prototype.h=function(){this.defaultPrevented=!0};var b=function(){if(!s.addEventListener||!Object.defineProperty)return!1;var o=!1,d=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let h=()=>{};s.addEventListener("test",h,d),s.removeEventListener("test",h,d)}catch{}return o}();function w(o){return/^[\s\xa0]*$/.test(o)}function Ae(o,d){C.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,d)}m(Ae,C),Ae.prototype.init=function(o,d){let h=this.type=o.type,y=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=d,d=o.relatedTarget,d||(h=="mouseover"?d=o.fromElement:h=="mouseout"&&(d=o.toElement)),this.relatedTarget=d,y?(this.clientX=y.clientX!==void 0?y.clientX:y.pageX,this.clientY=y.clientY!==void 0?y.clientY:y.pageY,this.screenX=y.screenX||0,this.screenY=y.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&Ae.Z.h.call(this)},Ae.prototype.h=function(){Ae.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var he="closure_listenable_"+(Math.random()*1e6|0),ye=0;function oi(o,d,h,y,R){this.listener=o,this.proxy=null,this.src=d,this.type=h,this.capture=!!y,this.ha=R,this.key=++ye,this.da=this.fa=!1}function Hn(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function ui(o,d,h){for(let y in o)d.call(h,o[y],y,o)}function or(o,d){for(let h in o)d.call(void 0,o[h],h,o)}function _a(o){let d={};for(let h in o)d[h]=o[h];return d}let rs="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Qo(o,d){let h,y;for(let R=1;R<arguments.length;R++){y=arguments[R];for(h in y)o[h]=y[h];for(let D=0;D<rs.length;D++)h=rs[D],Object.prototype.hasOwnProperty.call(y,h)&&(o[h]=y[h])}}function is(o){this.src=o,this.g={},this.h=0}is.prototype.add=function(o,d,h,y,R){let D=o.toString();o=this.g[D],o||(o=this.g[D]=[],this.h++);let F=ur(o,d,y,R);return F>-1?(d=o[F],h||(d.fa=!1)):(d=new oi(d,this.src,D,!!y,R),d.fa=h,o.push(d)),d};function Yo(o,d){let h=d.type;if(h in o.g){var y=o.g[h],R=Array.prototype.indexOf.call(y,d,void 0),D;(D=R>=0)&&Array.prototype.splice.call(y,R,1),D&&(Hn(d),o.g[h].length==0&&(delete o.g[h],o.h--))}}function ur(o,d,h,y){for(let R=0;R<o.length;++R){let D=o[R];if(!D.da&&D.listener==d&&D.capture==!!h&&D.ha==y)return R}return-1}var Xo="closure_lm_"+(Math.random()*1e6|0),lr={};function ss(o,d,h,y,R){if(y&&y.once)return Jo(o,d,h,y,R);if(Array.isArray(d)){for(let D=0;D<d.length;D++)ss(o,d[D],h,y,R);return null}return h=li(h),o&&o[he]?o.J(d,h,u(y)?!!y.capture:!!y,R):$o(o,d,h,!1,y,R)}function $o(o,d,h,y,R,D){if(!d)throw Error("Invalid event type");let F=u(R)?!!R.capture:!!R,te=Gn(o);if(te||(o[Xo]=te=new is(o)),h=te.add(d,h,y,F,D),h.proxy)return h;if(y=cm(),h.proxy=y,y.src=o,y.listener=h,o.addEventListener)b||(R=F),R===void 0&&(R=!1),o.addEventListener(d.toString(),y,R);else if(o.attachEvent)o.attachEvent(os(d.toString()),y);else if(o.addListener&&o.removeListener)o.addListener(y);else throw Error("addEventListener and attachEvent are unavailable.");return h}function cm(){function o(h){return d.call(o.src,o.listener,h)}let d=dr;return o}function Jo(o,d,h,y,R){if(Array.isArray(d)){for(let D=0;D<d.length;D++)Jo(o,d[D],h,y,R);return null}return h=li(h),o&&o[he]?o.K(d,h,u(y)?!!y.capture:!!y,R):$o(o,d,h,!0,y,R)}function Wc(o,d,h,y,R){if(Array.isArray(d))for(var D=0;D<d.length;D++)Wc(o,d[D],h,y,R);else y=u(y)?!!y.capture:!!y,h=li(h),o&&o[he]?(o=o.i,D=String(d).toString(),D in o.g&&(d=o.g[D],h=ur(d,h,y,R),h>-1&&(Hn(d[h]),Array.prototype.splice.call(d,h,1),d.length==0&&(delete o.g[D],o.h--)))):o&&(o=Gn(o))&&(d=o.g[d.toString()],o=-1,d&&(o=ur(d,h,y,R)),(h=o>-1?d[o]:null)&&cr(h))}function cr(o){if(typeof o!="number"&&o&&!o.da){var d=o.src;if(d&&d[he])Yo(d.i,o);else{var h=o.type,y=o.proxy;d.removeEventListener?d.removeEventListener(h,y,o.capture):d.detachEvent?d.detachEvent(os(h),y):d.addListener&&d.removeListener&&d.removeListener(y),(h=Gn(d))?(Yo(h,o),h.h==0&&(h.src=null,d[Xo]=null)):Hn(o)}}}function os(o){return o in lr?lr[o]:lr[o]="on"+o}function dr(o,d){if(o.da)o=!0;else{d=new Ae(d,this);let h=o.listener,y=o.ha||o.src;o.fa&&cr(o),o=h.call(y,d)}return o}function Gn(o){return o=o[Xo],o instanceof is?o:null}var Ia="__closure_events_fn_"+(Math.random()*1e9>>>0);function li(o){return typeof o=="function"?o:(o[Ia]||(o[Ia]=function(d){return o.handleEvent(d)}),o[Ia])}function Ge(){v.call(this),this.i=new is(this),this.M=this,this.G=null}m(Ge,v),Ge.prototype[he]=!0,Ge.prototype.removeEventListener=function(o,d,h,y){Wc(this,o,d,h,y)};function dt(o,d){var h,y=o.G;if(y)for(h=[];y;y=y.G)h.push(y);if(o=o.M,y=d.type||d,typeof d=="string")d=new C(d,o);else if(d instanceof C)d.target=d.target||o;else{var R=d;d=new C(y,o),Qo(d,R)}R=!0;let D,F;if(h)for(F=h.length-1;F>=0;F--)D=d.g=h[F],R=Dn(D,y,!0,d)&&R;if(D=d.g=o,R=Dn(D,y,!0,d)&&R,R=Dn(D,y,!1,d)&&R,h)for(F=0;F<h.length;F++)D=d.g=h[F],R=Dn(D,y,!1,d)&&R}Ge.prototype.N=function(){if(Ge.Z.N.call(this),this.i){var o=this.i;for(let d in o.g){let h=o.g[d];for(let y=0;y<h.length;y++)Hn(h[y]);delete o.g[d],o.h--}}this.G=null},Ge.prototype.J=function(o,d,h,y){return this.i.add(String(o),d,!1,h,y)},Ge.prototype.K=function(o,d,h,y){return this.i.add(String(o),d,!0,h,y)};function Dn(o,d,h,y){if(d=o.i.g[String(d)],!d)return!0;d=d.concat();let R=!0;for(let D=0;D<d.length;++D){let F=d[D];if(F&&!F.da&&F.capture==h){let te=F.listener,st=F.ha||F.src;F.fa&&Yo(o.i,F),R=te.call(st,y)!==!1&&R}}return R&&!y.defaultPrevented}function Kc(o,d){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=c(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:s.setTimeout(o,d||0)}function Zo(o){o.g=Kc(()=>{o.g=null,o.i&&(o.i=!1,Zo(o))},o.l);let d=o.h;o.h=null,o.m.apply(null,d)}class Nt extends v{constructor(d,h){super(),this.m=d,this.l=h,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:Zo(this)}N(){super.N(),this.g&&(s.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ta(o){v.call(this),this.h=o,this.g={}}m(Ta,v);var us=[];function ls(o){ui(o.g,function(d,h){this.g.hasOwnProperty(h)&&cr(d)},o),o.g={}}Ta.prototype.N=function(){Ta.Z.N.call(this),ls(this)},Ta.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Sa=s.JSON.stringify,eu=s.JSON.parse,Qc=class{stringify(o){return s.JSON.stringify(o,void 0)}parse(o){return s.JSON.parse(o,void 0)}};function tu(){}function nu(){}var fr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function $t(){C.call(this,"d")}m($t,C);function Jt(){C.call(this,"c")}m(Jt,C);var qt={},au=null;function va(){return au=au||new Ge}qt.Ia="serverreachability";function ru(o){C.call(this,qt.Ia,o)}m(ru,C);function hr(o){let d=va();dt(d,new ru(d))}qt.STAT_EVENT="statevent";function iu(o,d){C.call(this,qt.STAT_EVENT,o),this.stat=d}m(iu,C);function ft(o){let d=va();dt(d,new iu(d,o))}qt.Ja="timingevent";function su(o,d){C.call(this,qt.Ja,o),this.size=d}m(su,C);function jn(o,d){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return s.setTimeout(function(){o()},d)}function pr(){this.g=!0}pr.prototype.ua=function(){this.g=!1};function Yc(o,d,h,y,R,D){o.info(function(){if(o.g)if(D){var F="",te=D.split("&");for(let ve=0;ve<te.length;ve++){var st=te[ve].split("=");if(st.length>1){let ht=st[0];st=st[1];let Kn=ht.split("_");F=Kn.length>=2&&Kn[1]=="type"?F+(ht+"="+st+"&"):F+(ht+"=redacted&")}}}else F=null;else F=D;return"XMLHTTP REQ ("+y+") [attempt "+R+"]: "+d+`
`+h+`
`+F})}function Xc(o,d,h,y,R,D,F){o.info(function(){return"XMLHTTP RESP ("+y+") [ attempt "+R+"]: "+d+`
`+h+`
`+D+" "+F})}function pn(o,d,h,y){o.info(function(){return"XMLHTTP TEXT ("+d+"): "+dm(o,h)+(y?" "+y:"")})}function $c(o,d){o.info(function(){return"TIMEOUT: "+d})}pr.prototype.info=function(){};function dm(o,d){if(!o.g)return d;if(!d)return null;try{let D=JSON.parse(d);if(D){for(o=0;o<D.length;o++)if(Array.isArray(D[o])){var h=D[o];if(!(h.length<2)){var y=h[1];if(Array.isArray(y)&&!(y.length<1)){var R=y[0];if(R!="noop"&&R!="stop"&&R!="close")for(let F=1;F<y.length;F++)y[F]=""}}}}return Sa(D)}catch{return d}}var mr={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Jc={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Zc;function z(){}m(z,tu),z.prototype.g=function(){return new XMLHttpRequest},Zc=new z;function W(o){return encodeURIComponent(String(o))}function G(o){var d=1;o=o.split(":");let h=[];for(;d>0&&o.length;)h.push(o.shift()),d--;return o.length&&h.push(o.join(":")),h}function X(o,d,h,y){this.j=o,this.i=d,this.l=h,this.S=y||1,this.V=new Ta(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new pe}function pe(){this.i=null,this.g="",this.h=!1}var Ve={},it={};function mn(o,d,h){o.M=1,o.A=td(Wn(d)),o.u=h,o.R=!0,cs(o,null)}function cs(o,d){o.F=Date.now(),ed(o),o.B=Wn(o.A);var h=o.B,y=o.S;Array.isArray(y)||(y=[String(y)]),yv(h.i,"t",y),o.C=0,h=o.j.L,o.h=new pe,o.g=Nv(o.j,h?d:null,!o.u),o.P>0&&(o.O=new Nt(c(o.Y,o,o.g),o.P)),d=o.V,h=o.g,y=o.ba;var R="readystatechange";Array.isArray(R)||(R&&(us[0]=R.toString()),R=us);for(let D=0;D<R.length;D++){let F=ss(h,R[D],y||d.handleEvent,!1,d.h||d);if(!F)break;d.g[F.key]=F}d=o.J?_a(o.J):{},o.u?(o.v||(o.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,d)):(o.v="GET",o.g.ea(o.B,o.v,null,d)),hr(),Yc(o.i,o.v,o.B,o.l,o.S,o.u)}X.prototype.ba=function(o){o=o.target;let d=this.O;d&&_r(o)==3?d.j():this.Y(o)},X.prototype.Y=function(o){try{if(o==this.g)e:{let te=_r(this.g),st=this.g.ya(),ve=this.g.ca();if(!(te<3)&&(te!=3||this.g&&(this.h.h||this.g.la()||wv(this.g)))){this.K||te!=4||st==7||(st==8||ve<=0?hr(3):hr(2)),fm(this);var d=this.g.ca();this.X=d;var h=Kk(this);if(this.o=d==200,Xc(this.i,this.v,this.B,this.l,this.S,te,d),this.o){if(this.U&&!this.L){t:{if(this.g){var y,R=this.g;if((y=R.g?R.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!w(y)){var D=y;break t}}D=null}if(o=D)pn(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,hm(this,o);else{this.o=!1,this.m=3,ft(12),ci(this),ou(this);break e}}if(this.R){o=!0;let ht;for(;!this.K&&this.C<h.length;)if(ht=Qk(this,h),ht==it){te==4&&(this.m=4,ft(14),o=!1),pn(this.i,this.l,null,"[Incomplete Response]");break}else if(ht==Ve){this.m=4,ft(15),pn(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else pn(this.i,this.l,ht,null),hm(this,ht);if(iv(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),te!=4||h.length!=0||this.h.h||(this.m=1,ft(16),o=!1),this.o=this.o&&o,!o)pn(this.i,this.l,h,"[Invalid Chunked Response]"),ci(this),ou(this);else if(h.length>0&&!this.W){this.W=!0;var F=this.j;F.g==this&&F.aa&&!F.P&&(F.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),Tm(F),F.P=!0,ft(11))}}else pn(this.i,this.l,h,null),hm(this,h);te==4&&ci(this),this.o&&!this.K&&(te==4?kv(this.j,this):(this.o=!1,ed(this)))}else uD(this.g),d==400&&h.indexOf("Unknown SID")>0?(this.m=3,ft(12)):(this.m=0,ft(13)),ci(this),ou(this)}}}catch{}finally{}};function Kk(o){if(!iv(o))return o.g.la();let d=wv(o.g);if(d==="")return"";let h="",y=d.length,R=_r(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return ci(o),ou(o),"";o.h.i=new s.TextDecoder}for(let D=0;D<y;D++)o.h.h=!0,h+=o.h.i.decode(d[D],{stream:!(R&&D==y-1)});return d.length=0,o.h.g+=h,o.C=0,o.h.g}function iv(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function Qk(o,d){var h=o.C,y=d.indexOf(`
`,h);return y==-1?it:(h=Number(d.substring(h,y)),isNaN(h)?Ve:(y+=1,y+h>d.length?it:(d=d.slice(y,y+h),o.C=y+h,d)))}X.prototype.cancel=function(){this.K=!0,ci(this)};function ed(o){o.T=Date.now()+o.H,sv(o,o.H)}function sv(o,d){if(o.D!=null)throw Error("WatchDog timer not null");o.D=jn(c(o.aa,o),d)}function fm(o){o.D&&(s.clearTimeout(o.D),o.D=null)}X.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?($c(this.i,this.B),this.M!=2&&(hr(),ft(17)),ci(this),this.m=2,ou(this)):sv(this,this.T-o)};function ou(o){o.j.I==0||o.K||kv(o.j,o)}function ci(o){fm(o);var d=o.O;d&&typeof d.dispose=="function"&&d.dispose(),o.O=null,ls(o.V),o.g&&(d=o.g,o.g=null,d.abort(),d.dispose())}function hm(o,d){try{var h=o.j;if(h.I!=0&&(h.g==o||pm(h.h,o))){if(!o.L&&pm(h.h,o)&&h.I==3){try{var y=h.Ba.g.parse(d)}catch{y=null}if(Array.isArray(y)&&y.length==3){var R=y;if(R[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)od(h),id(h);else break e;Im(h),ft(18)}}else h.xa=R[1],0<h.xa-h.K&&R[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=jn(c(h.Va,h),6e3));lv(h.h)<=1&&h.ta&&(h.ta=void 0)}else fi(h,11)}else if((o.L||h.g==o)&&od(h),!w(d))for(R=h.Ba.g.parse(d),d=0;d<R.length;d++){let ve=R[d],ht=ve[0];if(!(ht<=h.K))if(h.K=ht,ve=ve[1],h.I==2)if(ve[0]=="c"){h.M=ve[1],h.ba=ve[2];let Kn=ve[3];Kn!=null&&(h.ka=Kn,h.j.info("VER="+h.ka));let hi=ve[4];hi!=null&&(h.za=hi,h.j.info("SVER="+h.za));let Ir=ve[5];Ir!=null&&typeof Ir=="number"&&Ir>0&&(y=1.5*Ir,h.O=y,h.j.info("backChannelRequestTimeoutMs_="+y)),y=h;let Tr=o.g;if(Tr){let ld=Tr.g?Tr.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(ld){var D=y.h;D.g||ld.indexOf("spdy")==-1&&ld.indexOf("quic")==-1&&ld.indexOf("h2")==-1||(D.j=D.l,D.g=new Set,D.h&&(mm(D,D.h),D.h=null))}if(y.G){let Sm=Tr.g?Tr.g.getResponseHeader("X-HTTP-Session-Id"):null;Sm&&(y.wa=Sm,be(y.J,y.G,Sm))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),y=h;var F=o;if(y.na=Ov(y,y.L?y.ba:null,y.W),F.L){cv(y.h,F);var te=F,st=y.O;st&&(te.H=st),te.D&&(fm(te),ed(te)),y.g=F}else Rv(y);h.i.length>0&&sd(h)}else ve[0]!="stop"&&ve[0]!="close"||fi(h,7);else h.I==3&&(ve[0]=="stop"||ve[0]=="close"?ve[0]=="stop"?fi(h,7):_m(h):ve[0]!="noop"&&h.l&&h.l.qa(ve),h.A=0)}}hr(4)}catch{}}var Yk=class{constructor(o,d){this.g=o,this.map=d}};function ov(o){this.l=o||10,s.PerformanceNavigationTiming?(o=s.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(s.chrome&&s.chrome.loadTimes&&s.chrome.loadTimes()&&s.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function uv(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function lv(o){return o.h?1:o.g?o.g.size:0}function pm(o,d){return o.h?o.h==d:o.g?o.g.has(d):!1}function mm(o,d){o.g?o.g.add(d):o.h=d}function cv(o,d){o.h&&o.h==d?o.h=null:o.g&&o.g.has(d)&&o.g.delete(d)}ov.prototype.cancel=function(){if(this.i=dv(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function dv(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let d=o.i;for(let h of o.g.values())d=d.concat(h.G);return d}return _(o.i)}var fv=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Xk(o,d){if(o){o=o.split("&");for(let h=0;h<o.length;h++){let y=o[h].indexOf("="),R,D=null;y>=0?(R=o[h].substring(0,y),D=o[h].substring(y+1)):R=o[h],d(R,D?decodeURIComponent(D.replace(/\+/g," ")):"")}}}function gr(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;o instanceof gr?(this.l=o.l,uu(this,o.j),this.o=o.o,this.g=o.g,lu(this,o.u),this.h=o.h,gm(this,_v(o.i)),this.m=o.m):o&&(d=String(o).match(fv))?(this.l=!1,uu(this,d[1]||"",!0),this.o=cu(d[2]||""),this.g=cu(d[3]||"",!0),lu(this,d[4]),this.h=cu(d[5]||"",!0),gm(this,d[6]||"",!0),this.m=cu(d[7]||"")):(this.l=!1,this.i=new fu(null,this.l))}gr.prototype.toString=function(){let o=[];var d=this.j;d&&o.push(du(d,hv,!0),":");var h=this.g;return(h||d=="file")&&(o.push("//"),(d=this.o)&&o.push(du(d,hv,!0),"@"),o.push(W(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(du(h,h.charAt(0)=="/"?Zk:Jk,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",du(h,tD)),o.join("")},gr.prototype.resolve=function(o){let d=Wn(this),h=!!o.j;h?uu(d,o.j):h=!!o.o,h?d.o=o.o:h=!!o.g,h?d.g=o.g:h=o.u!=null;var y=o.h;if(h)lu(d,o.u);else if(h=!!o.h){if(y.charAt(0)!="/")if(this.g&&!this.h)y="/"+y;else{var R=d.h.lastIndexOf("/");R!=-1&&(y=d.h.slice(0,R+1)+y)}if(R=y,R==".."||R==".")y="";else if(R.indexOf("./")!=-1||R.indexOf("/.")!=-1){y=R.lastIndexOf("/",0)==0,R=R.split("/");let D=[];for(let F=0;F<R.length;){let te=R[F++];te=="."?y&&F==R.length&&D.push(""):te==".."?((D.length>1||D.length==1&&D[0]!="")&&D.pop(),y&&F==R.length&&D.push("")):(D.push(te),y=!0)}y=D.join("/")}else y=R}return h?d.h=y:h=o.i.toString()!=="",h?gm(d,_v(o.i)):h=!!o.m,h&&(d.m=o.m),d};function Wn(o){return new gr(o)}function uu(o,d,h){o.j=h?cu(d,!0):d,o.j&&(o.j=o.j.replace(/:$/,""))}function lu(o,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);o.u=d}else o.u=null}function gm(o,d,h){d instanceof fu?(o.i=d,nD(o.i,o.l)):(h||(d=du(d,eD)),o.i=new fu(d,o.l))}function be(o,d,h){o.i.set(d,h)}function td(o){return be(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function cu(o,d){return o?d?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function du(o,d,h){return typeof o=="string"?(o=encodeURI(o).replace(d,$k),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function $k(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var hv=/[#\/\?@]/g,Jk=/[#\?:]/g,Zk=/[#\?]/g,eD=/[#\?@]/g,tD=/#/g;function fu(o,d){this.h=this.g=null,this.i=o||null,this.j=!!d}function di(o){o.g||(o.g=new Map,o.h=0,o.i&&Xk(o.i,function(d,h){o.add(decodeURIComponent(d.replace(/\+/g," ")),h)}))}t=fu.prototype,t.add=function(o,d){di(this),this.i=null,o=ds(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(d),this.h+=1,this};function pv(o,d){di(o),d=ds(o,d),o.g.has(d)&&(o.i=null,o.h-=o.g.get(d).length,o.g.delete(d))}function mv(o,d){return di(o),d=ds(o,d),o.g.has(d)}t.forEach=function(o,d){di(this),this.g.forEach(function(h,y){h.forEach(function(R){o.call(d,R,y,this)},this)},this)};function gv(o,d){di(o);let h=[];if(typeof d=="string")mv(o,d)&&(h=h.concat(o.g.get(ds(o,d))));else for(o=Array.from(o.g.values()),d=0;d<o.length;d++)h=h.concat(o[d]);return h}t.set=function(o,d){return di(this),this.i=null,o=ds(this,o),mv(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[d]),this.h+=1,this},t.get=function(o,d){return o?(o=gv(this,o),o.length>0?String(o[0]):d):d};function yv(o,d,h){pv(o,d),h.length>0&&(o.i=null,o.g.set(ds(o,d),_(h)),o.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],d=Array.from(this.g.keys());for(let y=0;y<d.length;y++){var h=d[y];let R=W(h);h=gv(this,h);for(let D=0;D<h.length;D++){let F=R;h[D]!==""&&(F+="="+W(h[D])),o.push(F)}}return this.i=o.join("&")};function _v(o){let d=new fu;return d.i=o.i,o.g&&(d.g=new Map(o.g),d.h=o.h),d}function ds(o,d){return d=String(d),o.j&&(d=d.toLowerCase()),d}function nD(o,d){d&&!o.j&&(di(o),o.i=null,o.g.forEach(function(h,y){let R=y.toLowerCase();y!=R&&(pv(this,y),yv(this,R,h))},o)),o.j=d}function aD(o,d){let h=new pr;if(s.Image){let y=new Image;y.onload=f(yr,h,"TestLoadImage: loaded",!0,d,y),y.onerror=f(yr,h,"TestLoadImage: error",!1,d,y),y.onabort=f(yr,h,"TestLoadImage: abort",!1,d,y),y.ontimeout=f(yr,h,"TestLoadImage: timeout",!1,d,y),s.setTimeout(function(){y.ontimeout&&y.ontimeout()},1e4),y.src=o}else d(!1)}function rD(o,d){let h=new pr,y=new AbortController,R=setTimeout(()=>{y.abort(),yr(h,"TestPingServer: timeout",!1,d)},1e4);fetch(o,{signal:y.signal}).then(D=>{clearTimeout(R),D.ok?yr(h,"TestPingServer: ok",!0,d):yr(h,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(R),yr(h,"TestPingServer: error",!1,d)})}function yr(o,d,h,y,R){try{R&&(R.onload=null,R.onerror=null,R.onabort=null,R.ontimeout=null),y(h)}catch{}}function iD(){this.g=new Qc}function nd(o){this.i=o.Sb||null,this.h=o.ab||!1}m(nd,tu),nd.prototype.g=function(){return new ad(this.i,this.h)};function ad(o,d){Ge.call(this),this.H=o,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(ad,Ge),t=ad.prototype,t.open=function(o,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=d,this.readyState=1,pu(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(d.body=o),(this.H||s).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,hu(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,pu(this)),this.g&&(this.readyState=3,pu(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof s.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Iv(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Iv(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var d=o.value?o.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!o.done}))&&(this.response=this.responseText+=d)}o.done?hu(this):pu(this),this.readyState==3&&Iv(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,hu(this))},t.Na=function(o){this.g&&(this.response=o,hu(this))},t.ga=function(){this.g&&hu(this)};function hu(o){o.readyState=4,o.l=null,o.j=null,o.B=null,pu(o)}t.setRequestHeader=function(o,d){this.A.append(o,d)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],d=this.h.entries();for(var h=d.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=d.next();return o.join(`\r
`)};function pu(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(ad.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Tv(o){let d="";return ui(o,function(h,y){d+=y,d+=":",d+=h,d+=`\r
`}),d}function ym(o,d,h){e:{for(y in h){var y=!1;break e}y=!0}y||(h=Tv(h),typeof o=="string"?h!=null&&W(h):be(o,d,h))}function Fe(o){Ge.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(Fe,Ge);var sD=/^https?$/i,oD=["POST","PUT"];t=Fe.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,d,h,y){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);d=d?d.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Zc.g(),this.g.onreadystatechange=p(c(this.Ca,this));try{this.B=!0,this.g.open(d,String(o),!0),this.B=!1}catch(D){Sv(this,D);return}if(o=h||"",h=new Map(this.headers),y)if(Object.getPrototypeOf(y)===Object.prototype)for(var R in y)h.set(R,y[R]);else if(typeof y.keys=="function"&&typeof y.get=="function")for(let D of y.keys())h.set(D,y.get(D));else throw Error("Unknown input type for opt_headers: "+String(y));y=Array.from(h.keys()).find(D=>D.toLowerCase()=="content-type"),R=s.FormData&&o instanceof s.FormData,!(Array.prototype.indexOf.call(oD,d,void 0)>=0)||y||R||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[D,F]of h)this.g.setRequestHeader(D,F);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(D){Sv(this,D)}};function Sv(o,d){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=d,o.o=5,vv(o),rd(o)}function vv(o){o.A||(o.A=!0,dt(o,"complete"),dt(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,dt(this,"complete"),dt(this,"abort"),rd(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),rd(this,!0)),Fe.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?Ev(this):this.Xa())},t.Xa=function(){Ev(this)};function Ev(o){if(o.h&&typeof i<"u"){if(o.v&&_r(o)==4)setTimeout(o.Ca.bind(o),0);else if(dt(o,"readystatechange"),_r(o)==4){o.h=!1;try{let D=o.ca();e:switch(D){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var h;if(!(h=d)){var y;if(y=D===0){let F=String(o.D).match(fv)[1]||null;!F&&s.self&&s.self.location&&(F=s.self.location.protocol.slice(0,-1)),y=!sD.test(F?F.toLowerCase():"")}h=y}if(h)dt(o,"complete"),dt(o,"success");else{o.o=6;try{var R=_r(o)>2?o.g.statusText:""}catch{R=""}o.l=R+" ["+o.ca()+"]",vv(o)}}finally{rd(o)}}}}function rd(o,d){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let h=o.g;o.g=null,d||dt(o,"ready");try{h.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function _r(o){return o.g?o.g.readyState:0}t.ca=function(){try{return _r(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var d=this.g.responseText;return o&&d.indexOf(o)==0&&(d=d.substring(o.length)),eu(d)}};function wv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function uD(o){let d={};o=(o.g&&_r(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let y=0;y<o.length;y++){if(w(o[y]))continue;var h=G(o[y]);let R=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();let D=d[R]||[];d[R]=D,D.push(h)}or(d,function(y){return y.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function mu(o,d,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||d}function Cv(o){this.za=0,this.i=[],this.j=new pr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=mu("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=mu("baseRetryDelayMs",5e3,o),this.Za=mu("retryDelaySeedMs",1e4,o),this.Ta=mu("forwardChannelMaxRetries",2,o),this.va=mu("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new ov(o&&o.concurrentRequestLimit),this.Ba=new iD,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=Cv.prototype,t.ka=8,t.I=1,t.connect=function(o,d,h,y){ft(0),this.W=o,this.H=d||{},h&&y!==void 0&&(this.H.OSID=h,this.H.OAID=y),this.F=this.X,this.J=Ov(this,null,this.W),sd(this)};function _m(o){if(Av(o),o.I==3){var d=o.V++,h=Wn(o.J);if(be(h,"SID",o.M),be(h,"RID",d),be(h,"TYPE","terminate"),gu(o,h),d=new X(o,o.j,d),d.M=2,d.A=td(Wn(h)),h=!1,s.navigator&&s.navigator.sendBeacon)try{h=s.navigator.sendBeacon(d.A.toString(),"")}catch{}!h&&s.Image&&(new Image().src=d.A,h=!0),h||(d.g=Nv(d.j,null),d.g.ea(d.A)),d.F=Date.now(),ed(d)}Pv(o)}function id(o){o.g&&(Tm(o),o.g.cancel(),o.g=null)}function Av(o){id(o),o.v&&(s.clearTimeout(o.v),o.v=null),od(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&s.clearTimeout(o.m),o.m=null)}function sd(o){if(!uv(o.h)&&!o.m){o.m=!0;var d=o.Ea;V||g(),M||(V(),M=!0),T.add(d,o),o.D=0}}function lD(o,d){return lv(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=d.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=jn(c(o.Ea,o,d),Dv(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let R=new X(this,this.j,o),D=this.o;if(this.U&&(D?(D=_a(D),Qo(D,this.U)):D=this.U),this.u!==null||this.R||(R.J=D,D=null),this.S)e:{for(var d=0,h=0;h<this.i.length;h++){t:{var y=this.i[h];if("__data__"in y.map&&(y=y.map.__data__,typeof y=="string")){y=y.length;break t}y=void 0}if(y===void 0)break;if(d+=y,d>4096){d=h;break e}if(d===4096||h===this.i.length-1){d=h+1;break e}}d=1e3}else d=1e3;d=Lv(this,R,d),h=Wn(this.J),be(h,"RID",o),be(h,"CVER",22),this.G&&be(h,"X-HTTP-Session-Id",this.G),gu(this,h),D&&(this.R?d="headers="+W(Tv(D))+"&"+d:this.u&&ym(h,this.u,D)),mm(this.h,R),this.Ra&&be(h,"TYPE","init"),this.S?(be(h,"$req",d),be(h,"SID","null"),R.U=!0,mn(R,h,null)):mn(R,h,d),this.I=2}}else this.I==3&&(o?bv(this,o):this.i.length==0||uv(this.h)||bv(this))};function bv(o,d){var h;d?h=d.l:h=o.V++;let y=Wn(o.J);be(y,"SID",o.M),be(y,"RID",h),be(y,"AID",o.K),gu(o,y),o.u&&o.o&&ym(y,o.u,o.o),h=new X(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),d&&(o.i=d.G.concat(o.i)),d=Lv(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),mm(o.h,h),mn(h,y,d)}function gu(o,d){o.H&&ui(o.H,function(h,y){be(d,y,h)}),o.l&&ui({},function(h,y){be(d,y,h)})}function Lv(o,d,h){h=Math.min(o.i.length,h);let y=o.l?c(o.l.Ka,o.l,o):null;e:{var R=o.i;let te=-1;for(;;){let st=["count="+h];te==-1?h>0?(te=R[0].g,st.push("ofs="+te)):te=0:st.push("ofs="+te);let ve=!0;for(let ht=0;ht<h;ht++){var D=R[ht].g;let Kn=R[ht].map;if(D-=te,D<0)te=Math.max(0,R[ht].g-100),ve=!1;else try{D="req"+D+"_"||"";try{var F=Kn instanceof Map?Kn:Object.entries(Kn);for(let[hi,Ir]of F){let Tr=Ir;u(Ir)&&(Tr=Sa(Ir)),st.push(D+hi+"="+encodeURIComponent(Tr))}}catch(hi){throw st.push(D+"type="+encodeURIComponent("_badmap")),hi}}catch{y&&y(Kn)}}if(ve){F=st.join("&");break e}}F=void 0}return o=o.i.splice(0,h),d.G=o,F}function Rv(o){if(!o.g&&!o.v){o.Y=1;var d=o.Da;V||g(),M||(V(),M=!0),T.add(d,o),o.A=0}}function Im(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=jn(c(o.Da,o),Dv(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,xv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=jn(c(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,ft(10),id(this),xv(this))};function Tm(o){o.B!=null&&(s.clearTimeout(o.B),o.B=null)}function xv(o){o.g=new X(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var d=Wn(o.na);be(d,"RID","rpc"),be(d,"SID",o.M),be(d,"AID",o.K),be(d,"CI",o.F?"0":"1"),!o.F&&o.ia&&be(d,"TO",o.ia),be(d,"TYPE","xmlhttp"),gu(o,d),o.u&&o.o&&ym(d,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=td(Wn(d)),h.u=null,h.R=!0,cs(h,o)}t.Va=function(){this.C!=null&&(this.C=null,id(this),Im(this),ft(19))};function od(o){o.C!=null&&(s.clearTimeout(o.C),o.C=null)}function kv(o,d){var h=null;if(o.g==d){od(o),Tm(o),o.g=null;var y=2}else if(pm(o.h,d))h=d.G,cv(o.h,d),y=1;else return;if(o.I!=0){if(d.o)if(y==1){h=d.u?d.u.length:0,d=Date.now()-d.F;var R=o.D;y=va(),dt(y,new su(y,h)),sd(o)}else Rv(o);else if(R=d.m,R==3||R==0&&d.X>0||!(y==1&&lD(o,d)||y==2&&Im(o)))switch(h&&h.length>0&&(d=o.h,d.i=d.i.concat(h)),R){case 1:fi(o,5);break;case 4:fi(o,10);break;case 3:fi(o,6);break;default:fi(o,2)}}}function Dv(o,d){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*d}function fi(o,d){if(o.j.info("Error code "+d),d==2){var h=c(o.bb,o),y=o.Ua;let R=!y;y=new gr(y||"//www.google.com/images/cleardot.gif"),s.location&&s.location.protocol=="http"||uu(y,"https"),td(y),R?aD(y.toString(),h):rD(y.toString(),h)}else ft(2);o.I=0,o.l&&o.l.pa(d),Pv(o),Av(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),ft(2)):(this.j.info("Failed to ping google.com"),ft(1))};function Pv(o){if(o.I=0,o.ja=[],o.l){let d=dv(o.h);(d.length!=0||o.i.length!=0)&&(L(o.ja,d),L(o.ja,o.i),o.h.i.length=0,_(o.i),o.i.length=0),o.l.oa()}}function Ov(o,d,h){var y=h instanceof gr?Wn(h):new gr(h);if(y.g!="")d&&(y.g=d+"."+y.g),lu(y,y.u);else{var R=s.location;y=R.protocol,d=d?d+"."+R.hostname:R.hostname,R=+R.port;let D=new gr(null);y&&uu(D,y),d&&(D.g=d),R&&lu(D,R),h&&(D.h=h),y=D}return h=o.G,d=o.wa,h&&d&&be(y,h,d),be(y,"VER",o.ka),gu(o,y),y}function Nv(o,d,h){if(d&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=o.Aa&&!o.ma?new Fe(new nd({ab:h})):new Fe(o.ma),d.Fa(o.L),d}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function Mv(){}t=Mv.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function ud(){}ud.prototype.g=function(o,d){return new Zt(o,d)};function Zt(o,d){Ge.call(this),this.g=new Cv(d),this.l=o,this.h=d&&d.messageUrlParams||null,o=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(o?o["X-WebChannel-Content-Type"]=d.messageContentType:o={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(o?o["X-WebChannel-Client-Profile"]=d.sa:o={"X-WebChannel-Client-Profile":d.sa}),this.g.U=o,(o=d&&d.Qb)&&!w(o)&&(this.g.u=o),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!w(d)&&(this.g.G=d,o=this.h,o!==null&&d in o&&(o=this.h,d in o&&delete o[d])),this.j=new fs(this)}m(Zt,Ge),Zt.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Zt.prototype.close=function(){_m(this.g)},Zt.prototype.o=function(o){var d=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=Sa(o),o=h);d.i.push(new Yk(d.Ya++,o)),d.I==3&&sd(d)},Zt.prototype.N=function(){this.g.l=null,delete this.j,_m(this.g),delete this.g,Zt.Z.N.call(this)};function Uv(o){$t.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var d=o.__sm__;if(d){e:{for(let h in d){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,d=d!==null&&o in d?d[o]:void 0),this.data=d}else this.data=o}m(Uv,$t);function Vv(){Jt.call(this),this.status=1}m(Vv,Jt);function fs(o){this.g=o}m(fs,Mv),fs.prototype.ra=function(){dt(this.g,"a")},fs.prototype.qa=function(o){dt(this.g,new Uv(o))},fs.prototype.pa=function(o){dt(this.g,new Vv)},fs.prototype.oa=function(){dt(this.g,"b")},ud.prototype.createWebChannel=ud.prototype.g,Zt.prototype.send=Zt.prototype.o,Zt.prototype.open=Zt.prototype.m,Zt.prototype.close=Zt.prototype.close,gI=ja.createWebChannelTransport=function(){return new ud},mI=ja.getStatEventTarget=function(){return va()},pI=ja.Event=qt,Ah=ja.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},mr.NO_ERROR=0,mr.TIMEOUT=8,mr.HTTP_ERROR=6,Ul=ja.ErrorCode=mr,Jc.COMPLETE="complete",hI=ja.EventType=Jc,nu.EventType=fr,fr.OPEN="a",fr.CLOSE="b",fr.ERROR="c",fr.MESSAGE="d",Ge.prototype.listen=Ge.prototype.J,co=ja.WebChannel=nu,b2=ja.FetchXmlHttpFactory=nd,Fe.prototype.listenOnce=Fe.prototype.K,Fe.prototype.getLastError=Fe.prototype.Ha,Fe.prototype.getLastErrorCode=Fe.prototype.ya,Fe.prototype.getStatus=Fe.prototype.ca,Fe.prototype.getResponseJson=Fe.prototype.La,Fe.prototype.getResponseText=Fe.prototype.la,Fe.prototype.send=Fe.prototype.ea,Fe.prototype.setWithCredentials=Fe.prototype.Fa,fI=ja.XhrIo=Fe}).apply(typeof Ch<"u"?Ch:typeof self<"u"?self:typeof window<"u"?window:{});var _t=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};_t.UNAUTHENTICATED=new _t(null),_t.GOOGLE_CREDENTIALS=new _t("google-credentials-uid"),_t.FIRST_PARTY=new _t("first-party-uid"),_t.MOCK_USER=new _t("mock-user");var Oo="12.10.0";function zR(t){Oo=t}var Wi=new aa("@firebase/firestore");function fo(){return Wi.logLevel}function H(t,...e){if(Wi.logLevel<=ee.DEBUG){let n=e.map(GT);Wi.debug(`Firestore (${Oo}): ${t}`,...n)}}function Qa(t,...e){if(Wi.logLevel<=ee.ERROR){let n=e.map(GT);Wi.error(`Firestore (${Oo}): ${t}`,...n)}}function Ya(t,...e){if(Wi.logLevel<=ee.WARN){let n=e.map(GT);Wi.warn(`Firestore (${Oo}): ${t}`,...n)}}function GT(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}function Y(t,e,n){let a="Unexpected state";typeof e=="string"?a=e:n=e,HR(t,a,n)}function HR(t,e,n){let a=`FIRESTORE (${Oo}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{a+=" CONTEXT: "+JSON.stringify(n)}catch{a+=" CONTEXT: "+n}throw Qa(a),new Error(a)}function Ue(t,e,n,a){let r="Unexpected state";typeof n=="string"?r=n:a=n,t||HR(e,r,a)}function ce(t,e){return t}var N={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},q=class extends yt{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var Wa=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};var Dh=class{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Ph=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(_t.UNAUTHENTICATED))}shutdown(){}},EI=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}},Oh=class{constructor(e){this.t=e,this.currentUser=_t.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){Ue(this.o===void 0,42304);let a=this.i,r=l=>this.i!==a?(a=this.i,n(l)):Promise.resolve(),i=new Wa;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Wa,e.enqueueRetryable(()=>r(this.currentUser))};let s=()=>{let l=i;e.enqueueRetryable(async()=>{await l.promise,await r(this.currentUser)})},u=l=>{H("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),s())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){let l=this.t.getImmediate({optional:!0});l?u(l):(H("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Wa)}},0),s()}getToken(){let e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(a=>this.i!==e?(H("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):a?(Ue(typeof a.accessToken=="string",31837,{l:a}),new Dh(a.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return Ue(e===null||typeof e=="string",2055,{h:e}),new _t(e)}},wI=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a,this.type="FirstParty",this.user=_t.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},CI=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a}getToken(){return Promise.resolve(new wI(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(_t.FIRST_PARTY))}shutdown(){}invalidateToken(){}},Nh=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},Mh=class{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Ke(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){Ue(this.o===void 0,3512);let a=i=>{i.error!=null&&H("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);let s=i.token!==this.m;return this.m=i.token,H("FirebaseAppCheckTokenProvider",`Received ${s?"new":"existing"} token.`),s?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>a(i))};let r=i=>{H("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>r(i)),setTimeout(()=>{if(!this.appCheck){let i=this.V.getImmediate({optional:!0});i?r(i):H("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Nh(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(Ue(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Nh(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function L2(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let a=0;a<t;a++)n[a]=Math.floor(256*Math.random());return n}var To=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516),a="";for(;a.length<20;){let r=L2(40);for(let i=0;i<r.length;++i)a.length<20&&r[i]<n&&(a+=e.charAt(r[i]%62))}return a}};function oe(t,e){return t<e?-1:t>e?1:0}function AI(t,e){let n=Math.min(t.length,e.length);for(let a=0;a<n;a++){let r=t.charAt(a),i=e.charAt(a);if(r!==i)return yI(r)===yI(i)?oe(r,i):yI(r)?1:-1}return oe(t.length,e.length)}var R2=55296,x2=57343;function yI(t){let e=t.charCodeAt(0);return e>=R2&&e<=x2}function So(t,e,n){return t.length===e.length&&t.every((a,r)=>n(a,e[r]))}var aR="__name__",Uh=class t{constructor(e,n,a){n===void 0?n=0:n>e.length&&Y(637,{offset:n,range:e.length}),a===void 0?a=e.length-n:a>e.length-n&&Y(1746,{length:a,range:e.length-n}),this.segments=e,this.offset=n,this.len=a}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let n=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(a=>{n.push(a)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,a=this.limit();n<a;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){let a=Math.min(e.length,n.length);for(let r=0;r<a;r++){let i=t.compareSegments(e.get(r),n.get(r));if(i!==0)return i}return oe(e.length,n.length)}static compareSegments(e,n){let a=t.isNumericId(e),r=t.isNumericId(n);return a&&!r?-1:!a&&r?1:a&&r?t.extractNumericId(e).compare(t.extractNumericId(n)):AI(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Ga.fromString(e.substring(4,e.length-2))}},Ne=class t extends Uh{construct(e,n,a){return new t(e,n,a)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let n=[];for(let a of e){if(a.indexOf("//")>=0)throw new q(N.INVALID_ARGUMENT,`Invalid segment (${a}). Paths must not contain // in them.`);n.push(...a.split("/").filter(r=>r.length>0))}return new t(n)}static emptyPath(){return new t([])}},k2=/^[_a-zA-Z][_a-zA-Z0-9]*$/,hn=class t extends Uh{construct(e,n,a){return new t(e,n,a)}static isValidIdentifier(e){return k2.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===aR}static keyField(){return new t([aR])}static fromServerFormat(e){let n=[],a="",r=0,i=()=>{if(a.length===0)throw new q(N.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(a),a=""},s=!1;for(;r<e.length;){let u=e[r];if(u==="\\"){if(r+1===e.length)throw new q(N.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new q(N.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);a+=l,r+=2}else u==="`"?(s=!s,r++):u!=="."||s?(a+=u,r++):(i(),r++)}if(i(),s)throw new q(N.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(n)}static emptyPath(){return new t([])}};var K=class t{constructor(e){this.path=e}static fromPath(e){return new t(Ne.fromString(e))}static fromName(e){return new t(Ne.fromString(e).popFirst(5))}static empty(){return new t(Ne.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ne.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return Ne.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new Ne(e.slice()))}};function D2(t,e,n){if(!n)throw new q(N.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function GR(t,e,n,a){if(e===!0&&a===!0)throw new q(N.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function rR(t){if(K.isDocumentKey(t))throw new q(N.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function jR(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function oc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(a){return a.constructor?a.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":Y(12329,{type:typeof t})}function uc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new q(N.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let n=oc(t);throw new q(N.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function WR(t,e){if(e<=0)throw new q(N.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function Ye(t,e){let n={typeString:t};return e&&(n.value=e),n}function No(t,e){if(!jR(t))throw new q(N.INVALID_ARGUMENT,"JSON must be an object");let n;for(let a in e)if(e[a]){let r=e[a].typeString,i="value"in e[a]?{value:e[a].value}:void 0;if(!(a in t)){n=`JSON missing required field: '${a}'`;break}let s=t[a];if(r&&typeof s!==r){n=`JSON field '${a}' must be a ${r}.`;break}if(i!==void 0&&s!==i.value){n=`Expected '${a}' field to equal '${i.value}'`;break}}if(n)throw new q(N.INVALID_ARGUMENT,n);return!0}var iR=-62135596800,sR=1e6,at=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let n=Math.floor(e/1e3),a=Math.floor((e-1e3*n)*sR);return new t(n,a)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new q(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new q(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<iR)throw new q(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new q(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/sR}_compareTo(e){return this.seconds===e.seconds?oe(this.nanoseconds,e.nanoseconds):oe(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(No(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-iR;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};at._jsonSchemaVersion="firestore/timestamp/1.0",at._jsonSchema={type:Ye("string",at._jsonSchemaVersion),seconds:Ye("number"),nanoseconds:Ye("number")};var Z=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new at(0,0))}static max(){return new t(new at(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var Hl=-1,Vh=class{constructor(e,n,a,r){this.indexId=e,this.collectionGroup=n,this.fields=a,this.indexState=r}};Vh.UNKNOWN_ID=-1;function P2(t,e){let n=t.toTimestamp().seconds,a=t.toTimestamp().nanoseconds+1,r=Z.fromTimestamp(a===1e9?new at(n+1,0):new at(n,a));return new Ki(r,K.empty(),e)}function O2(t){return new Ki(t.readTime,t.key,Hl)}var Ki=class t{constructor(e,n,a){this.readTime=e,this.documentKey=n,this.largestBatchId=a}static min(){return new t(Z.min(),K.empty(),Hl)}static max(){return new t(Z.max(),K.empty(),Hl)}};function N2(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=K.comparator(t.documentKey,e.documentKey),n!==0?n:oe(t.largestBatchId,e.largestBatchId))}var M2="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",bI=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function lp(t){if(t.code!==N.FAILED_PRECONDITION||t.message!==M2)throw t;H("LocalStore","Unexpectedly lost primary lease")}var U=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&Y(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new t((a,r)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(a,r)},this.catchCallback=i=>{this.wrapFailure(n,i).next(a,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{let n=e();return n instanceof t?n:t.resolve(n)}catch(n){return t.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):t.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):t.reject(n)}static resolve(e){return new t((n,a)=>{n(e)})}static reject(e){return new t((n,a)=>{a(e)})}static waitFor(e){return new t((n,a)=>{let r=0,i=0,s=!1;e.forEach(u=>{++r,u.next(()=>{++i,s&&i===r&&n()},l=>a(l))}),s=!0,i===r&&n()})}static or(e){let n=t.resolve(!1);for(let a of e)n=n.next(r=>r?t.resolve(r):a());return n}static forEach(e,n){let a=[];return e.forEach((r,i)=>{a.push(n.call(this,r,i))}),this.waitFor(a)}static mapArray(e,n){return new t((a,r)=>{let i=e.length,s=new Array(i),u=0;for(let l=0;l<i;l++){let c=l;n(e[c]).next(f=>{s[c]=f,++u,u===i&&a(s)},f=>r(f))}})}static doWhile(e,n){return new t((a,r)=>{let i=()=>{e()===!0?n().next(()=>{i()},r):a()};i()})}};function U2(t){let e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Mo(t){return t.name==="IndexedDbTransactionError"}var vo=class{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=a=>this.ae(a),this.ue=a=>n.writeSequenceNumber(a))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};vo.ce=-1;var V2=-1;function cp(t){return t==null}function Gl(t){return t===0&&1/t==-1/0}function F2(t){return typeof t=="number"&&Number.isInteger(t)&&!Gl(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var KR="";function B2(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=oR(e)),e=q2(t.get(n),e);return oR(e)}function q2(t,e){let n=e,a=t.length;for(let r=0;r<a;r++){let i=t.charAt(r);switch(i){case"\0":n+="";break;case KR:n+="";break;default:n+=i}}return n}function oR(t){return t+KR+""}var z2="remoteDocuments",QR="owner";var YR="mutationQueues";var XR="mutations";var $R="documentMutations",H2="remoteDocumentsV14";var JR="remoteDocumentGlobal";var ZR="targets";var ex="targetDocuments";var tx="targetGlobal",nx="collectionParents";var ax="clientMetadata";var rx="bundles";var ix="namedQueries";var G2="indexConfiguration";var j2="indexState";var W2="indexEntries";var sx="documentOverlays";var K2="globals";var Q2=[YR,XR,$R,z2,ZR,QR,tx,ex,ax,JR,nx,rx,ix],lz=[...Q2,sx],Y2=[YR,XR,$R,H2,ZR,QR,tx,ex,ax,JR,nx,rx,ix,sx],X2=Y2,$2=[...X2,G2,j2,W2];var cz=[...$2,K2];function uR(t){let e=0;for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Uo(t,e){for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function ox(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var Xe=class t{constructor(e,n){this.comparator=e,this.root=n||la.EMPTY}insert(e,n){return new t(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,la.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,la.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){let a=this.comparator(e,n.key);if(a===0)return n.value;a<0?n=n.left:a>0&&(n=n.right)}return null}indexOf(e){let n=0,a=this.root;for(;!a.isEmpty();){let r=this.comparator(e,a.key);if(r===0)return n+a.left.size;r<0?a=a.left:(n+=a.left.size+1,a=a.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,a)=>(e(n,a),!1))}toString(){let e=[];return this.inorderTraversal((n,a)=>(e.push(`${n}:${a}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new go(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new go(this.root,e,this.comparator,!1)}getReverseIterator(){return new go(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new go(this.root,e,this.comparator,!0)}},go=class{constructor(e,n,a,r){this.isReverse=r,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?a(e.key,n):1,n&&r&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},la=class t{constructor(e,n,a,r,i){this.key=e,this.value=n,this.color=a??t.RED,this.left=r??t.EMPTY,this.right=i??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,a,r,i){return new t(e??this.key,n??this.value,a??this.color,r??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,a){let r=this,i=a(e,r.key);return r=i<0?r.copy(null,null,null,r.left.insert(e,n,a),null):i===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,a)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let a,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;a=r.right.min(),r=r.copy(a.key,a.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Y(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Y(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw Y(27949);return e+(this.isRed()?0:1)}};la.EMPTY=null,la.RED=!0,la.BLACK=!1;la.EMPTY=new class{constructor(){this.size=0}get key(){throw Y(57766)}get value(){throw Y(16141)}get color(){throw Y(16727)}get left(){throw Y(29726)}get right(){throw Y(36894)}copy(e,n,a,r,i){return this}insert(e,n,a){return new la(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var It=class t{constructor(e){this.comparator=e,this.data=new Xe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,a)=>(e(n),!1))}forEachInRange(e,n){let a=this.data.getIteratorFrom(e[0]);for(;a.hasNext();){let r=a.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let a;for(a=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();a.hasNext();)if(!e(a.getNext().key))return}firstAfterOrEqual(e){let n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new Fh(this.data.getIterator())}getIteratorFrom(e){return new Fh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(a=>{n=n.add(a)}),n}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.data.getIterator(),a=e.data.getIterator();for(;n.hasNext();){let r=n.getNext().key,i=a.getNext().key;if(this.comparator(r,i)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(n=>{e.push(n)}),e}toString(){let e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){let n=new t(this.comparator);return n.data=e,n}},Fh=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var qi=class t{constructor(e){this.fields=e,e.sort(hn.comparator)}static empty(){return new t([])}unionWith(e){let n=new It(hn.comparator);for(let a of this.fields)n=n.add(a);for(let a of e)n=n.add(a);return new t(n.toArray())}covers(e){for(let n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return So(this.fields,e.fields,(n,a)=>n.isEqual(a))}};var Bh=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var xt=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let n=function(r){try{return atob(r)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Bh("Invalid base64 string: "+i):i}}(e);return new t(n)}static fromUint8Array(e){let n=function(r){let i="";for(let s=0;s<r.length;++s)i+=String.fromCharCode(r[s]);return i}(e);return new t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return oe(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};xt.EMPTY_BYTE_STRING=new xt("");var J2=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Xa(t){if(Ue(!!t,39018),typeof t=="string"){let e=0,n=J2.exec(t);if(Ue(!!n,46558,{timestamp:t}),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}let a=new Date(t);return{seconds:Math.floor(a.getTime()/1e3),nanos:e}}return{seconds:Oe(t.seconds),nanos:Oe(t.nanos)}}function Oe(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function $a(t){return typeof t=="string"?xt.fromBase64String(t):xt.fromUint8Array(t)}var ux="server_timestamp",lx="__type__",cx="__previous_value__",dx="__local_write_time__";function lc(t){return(t?.mapValue?.fields||{})[lx]?.stringValue===ux}function dp(t){let e=t.mapValue.fields[cx];return lc(e)?dp(e):e}function jl(t){let e=Xa(t.mapValue.fields[dx].timestampValue);return new at(e.seconds,e.nanos)}var LI=class{constructor(e,n,a,r,i,s,u,l,c,f,m){this.databaseId=e,this.appId=n,this.persistenceKey=a,this.host=r,this.ssl=i,this.forceLongPolling=s,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=c,this.isUsingEmulator=f,this.apiKey=m}},qh="(default)",Wl=class t{constructor(e,n){this.projectId=e,this.database=n||qh}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===qh}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function fx(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new q(N.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Wl(t.options.projectId,e)}var jT="__type__",hx="__max__",bh={mapValue:{fields:{__type__:{stringValue:hx}}}},WT="__vector__",Eo="value";function ei(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?lc(t)?4:mx(t)?9007199254740991:px(t)?10:11:Y(28295,{value:t})}function ha(t,e){if(t===e)return!0;let n=ei(t);if(n!==ei(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return jl(t).isEqual(jl(e));case 3:return function(r,i){if(typeof r.timestampValue=="string"&&typeof i.timestampValue=="string"&&r.timestampValue.length===i.timestampValue.length)return r.timestampValue===i.timestampValue;let s=Xa(r.timestampValue),u=Xa(i.timestampValue);return s.seconds===u.seconds&&s.nanos===u.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,i){return $a(r.bytesValue).isEqual($a(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,i){return Oe(r.geoPointValue.latitude)===Oe(i.geoPointValue.latitude)&&Oe(r.geoPointValue.longitude)===Oe(i.geoPointValue.longitude)}(t,e);case 2:return function(r,i){if("integerValue"in r&&"integerValue"in i)return Oe(r.integerValue)===Oe(i.integerValue);if("doubleValue"in r&&"doubleValue"in i){let s=Oe(r.doubleValue),u=Oe(i.doubleValue);return s===u?Gl(s)===Gl(u):isNaN(s)&&isNaN(u)}return!1}(t,e);case 9:return So(t.arrayValue.values||[],e.arrayValue.values||[],ha);case 10:case 11:return function(r,i){let s=r.mapValue.fields||{},u=i.mapValue.fields||{};if(uR(s)!==uR(u))return!1;for(let l in s)if(s.hasOwnProperty(l)&&(u[l]===void 0||!ha(s[l],u[l])))return!1;return!0}(t,e);default:return Y(52216,{left:t})}}function Kl(t,e){return(t.values||[]).find(n=>ha(n,e))!==void 0}function wo(t,e){if(t===e)return 0;let n=ei(t),a=ei(e);if(n!==a)return oe(n,a);switch(n){case 0:case 9007199254740991:return 0;case 1:return oe(t.booleanValue,e.booleanValue);case 2:return function(i,s){let u=Oe(i.integerValue||i.doubleValue),l=Oe(s.integerValue||s.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(t,e);case 3:return lR(t.timestampValue,e.timestampValue);case 4:return lR(jl(t),jl(e));case 5:return AI(t.stringValue,e.stringValue);case 6:return function(i,s){let u=$a(i),l=$a(s);return u.compareTo(l)}(t.bytesValue,e.bytesValue);case 7:return function(i,s){let u=i.split("/"),l=s.split("/");for(let c=0;c<u.length&&c<l.length;c++){let f=oe(u[c],l[c]);if(f!==0)return f}return oe(u.length,l.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,s){let u=oe(Oe(i.latitude),Oe(s.latitude));return u!==0?u:oe(Oe(i.longitude),Oe(s.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return cR(t.arrayValue,e.arrayValue);case 10:return function(i,s){let u=i.fields||{},l=s.fields||{},c=u[Eo]?.arrayValue,f=l[Eo]?.arrayValue,m=oe(c?.values?.length||0,f?.values?.length||0);return m!==0?m:cR(c,f)}(t.mapValue,e.mapValue);case 11:return function(i,s){if(i===bh.mapValue&&s===bh.mapValue)return 0;if(i===bh.mapValue)return 1;if(s===bh.mapValue)return-1;let u=i.fields||{},l=Object.keys(u),c=s.fields||{},f=Object.keys(c);l.sort(),f.sort();for(let m=0;m<l.length&&m<f.length;++m){let p=AI(l[m],f[m]);if(p!==0)return p;let _=wo(u[l[m]],c[f[m]]);if(_!==0)return _}return oe(l.length,f.length)}(t.mapValue,e.mapValue);default:throw Y(23264,{he:n})}}function lR(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return oe(t,e);let n=Xa(t),a=Xa(e),r=oe(n.seconds,a.seconds);return r!==0?r:oe(n.nanos,a.nanos)}function cR(t,e){let n=t.values||[],a=e.values||[];for(let r=0;r<n.length&&r<a.length;++r){let i=wo(n[r],a[r]);if(i)return i}return oe(n.length,a.length)}function Co(t){return RI(t)}function RI(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){let a=Xa(n);return`time(${a.seconds},${a.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return $a(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return K.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let a="[",r=!0;for(let i of n.values||[])r?r=!1:a+=",",a+=RI(i);return a+"]"}(t.arrayValue):"mapValue"in t?function(n){let a=Object.keys(n.fields||{}).sort(),r="{",i=!0;for(let s of a)i?i=!1:r+=",",r+=`${s}:${RI(n.fields[s])}`;return r+"}"}(t.mapValue):Y(61005,{value:t})}function xh(t){switch(ei(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=dp(t);return e?16+xh(e):16;case 5:return 2*t.stringValue.length;case 6:return $a(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(a){return(a.values||[]).reduce((r,i)=>r+xh(i),0)}(t.arrayValue);case 10:case 11:return function(a){let r=0;return Uo(a.fields,(i,s)=>{r+=i.length+xh(s)}),r}(t.mapValue);default:throw Y(13486,{value:t})}}function cc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function xI(t){return!!t&&"integerValue"in t}function KT(t){return!!t&&"arrayValue"in t}function dR(t){return!!t&&"nullValue"in t}function fR(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function _I(t){return!!t&&"mapValue"in t}function px(t){return(t?.mapValue?.fields||{})[jT]?.stringValue===WT}function Bl(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return Uo(t.mapValue.fields,(n,a)=>e.mapValue.fields[n]=Bl(a)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Bl(t.arrayValue.values[n]);return e}return{...t}}function mx(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===hx}var fz={mapValue:{fields:{[jT]:{stringValue:WT},[Eo]:{arrayValue:{}}}}};var ua=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let a=0;a<e.length-1;++a)if(n=(n.mapValue.fields||{})[e.get(a)],!_I(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Bl(n)}setAll(e){let n=hn.emptyPath(),a={},r=[];e.forEach((s,u)=>{if(!n.isImmediateParentOf(u)){let l=this.getFieldsMap(n);this.applyChanges(l,a,r),a={},r=[],n=u.popLast()}s?a[u.lastSegment()]=Bl(s):r.push(u.lastSegment())});let i=this.getFieldsMap(n);this.applyChanges(i,a,r)}delete(e){let n=this.field(e.popLast());_I(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return ha(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let a=0;a<e.length;++a){let r=n.mapValue.fields[e.get(a)];_I(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(a)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,a){Uo(n,(r,i)=>e[r]=i);for(let r of a)delete e[r]}clone(){return new t(Bl(this.value))}};var Bn=class t{constructor(e,n,a,r,i,s,u){this.key=e,this.documentType=n,this.version=a,this.readTime=r,this.createTime=i,this.data=s,this.documentState=u}static newInvalidDocument(e){return new t(e,0,Z.min(),Z.min(),Z.min(),ua.empty(),0)}static newFoundDocument(e,n,a,r){return new t(e,1,n,Z.min(),a,r,0)}static newNoDocument(e,n){return new t(e,2,n,Z.min(),Z.min(),ua.empty(),0)}static newUnknownDocument(e,n){return new t(e,3,n,Z.min(),Z.min(),ua.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(Z.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ua.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ua.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=Z.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var Ja=class{constructor(e,n){this.position=e,this.inclusive=n}};function hR(t,e,n){let a=0;for(let r=0;r<t.position.length;r++){let i=e[r],s=t.position[r];if(i.field.isKeyField()?a=K.comparator(K.fromName(s.referenceValue),n.key):a=wo(s,n.data.field(i.field)),i.dir==="desc"&&(a*=-1),a!==0)break}return a}function pR(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!ha(t.position[n],e.position[n]))return!1;return!0}var ti=class{constructor(e,n="asc"){this.field=e,this.dir=n}};function Z2(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var zh=class{},Qe=class t extends zh{constructor(e,n,a){super(),this.field=e,this.op=n,this.value=a}static create(e,n,a){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,a):new DI(e,n,a):n==="array-contains"?new NI(e,a):n==="in"?new MI(e,a):n==="not-in"?new UI(e,a):n==="array-contains-any"?new VI(e,a):new t(e,n,a)}static createKeyFieldInFilter(e,n,a){return n==="in"?new PI(e,a):new OI(e,a)}matches(e){let n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(wo(n,this.value)):n!==null&&ei(this.value)===ei(n)&&this.matchesComparison(wo(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Y(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},xn=class t extends zh{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new t(e,n)}matches(e){return gx(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function gx(t){return t.op==="and"}function yx(t){return eU(t)&&gx(t)}function eU(t){for(let e of t.filters)if(e instanceof xn)return!1;return!0}function kI(t){if(t instanceof Qe)return t.field.canonicalString()+t.op.toString()+Co(t.value);if(yx(t))return t.filters.map(e=>kI(e)).join(",");{let e=t.filters.map(n=>kI(n)).join(",");return`${t.op}(${e})`}}function _x(t,e){return t instanceof Qe?function(a,r){return r instanceof Qe&&a.op===r.op&&a.field.isEqual(r.field)&&ha(a.value,r.value)}(t,e):t instanceof xn?function(a,r){return r instanceof xn&&a.op===r.op&&a.filters.length===r.filters.length?a.filters.reduce((i,s,u)=>i&&_x(s,r.filters[u]),!0):!1}(t,e):void Y(19439)}function Ix(t){return t instanceof Qe?function(n){return`${n.field.canonicalString()} ${n.op} ${Co(n.value)}`}(t):t instanceof xn?function(n){return n.op.toString()+" {"+n.getFilters().map(Ix).join(" ,")+"}"}(t):"Filter"}var DI=class extends Qe{constructor(e,n,a){super(e,n,a),this.key=K.fromName(a.referenceValue)}matches(e){let n=K.comparator(e.key,this.key);return this.matchesComparison(n)}},PI=class extends Qe{constructor(e,n){super(e,"in",n),this.keys=Tx("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}},OI=class extends Qe{constructor(e,n){super(e,"not-in",n),this.keys=Tx("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}};function Tx(t,e){return(e.arrayValue?.values||[]).map(n=>K.fromName(n.referenceValue))}var NI=class extends Qe{constructor(e,n){super(e,"array-contains",n)}matches(e){let n=e.data.field(this.field);return KT(n)&&Kl(n.arrayValue,this.value)}},MI=class extends Qe{constructor(e,n){super(e,"in",n)}matches(e){let n=e.data.field(this.field);return n!==null&&Kl(this.value.arrayValue,n)}},UI=class extends Qe{constructor(e,n){super(e,"not-in",n)}matches(e){if(Kl(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Kl(this.value.arrayValue,n)}},VI=class extends Qe{constructor(e,n){super(e,"array-contains-any",n)}matches(e){let n=e.data.field(this.field);return!(!KT(n)||!n.arrayValue.values)&&n.arrayValue.values.some(a=>Kl(this.value.arrayValue,a))}};var FI=class{constructor(e,n=null,a=[],r=[],i=null,s=null,u=null){this.path=e,this.collectionGroup=n,this.orderBy=a,this.filters=r,this.limit=i,this.startAt=s,this.endAt=u,this.Te=null}};function mR(t,e=null,n=[],a=[],r=null,i=null,s=null){return new FI(t,e,n,a,r,i,s)}function QT(t){let e=ce(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(a=>kI(a)).join(","),n+="|ob:",n+=e.orderBy.map(a=>function(i){return i.field.canonicalString()+i.dir}(a)).join(","),cp(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(a=>Co(a)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(a=>Co(a)).join(",")),e.Te=n}return e.Te}function YT(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!Z2(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!_x(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!pR(t.startAt,e.startAt)&&pR(t.endAt,e.endAt)}function BI(t){return K.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var Za=class{constructor(e,n=null,a=[],r=[],i=null,s="F",u=null,l=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=a,this.filters=r,this.limit=i,this.limitType=s,this.startAt=u,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function tU(t,e,n,a,r,i,s,u){return new Za(t,e,n,a,r,i,s,u)}function XT(t){return new Za(t)}function gR(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function nU(t){return K.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function fp(t){return t.collectionGroup!==null}function Gi(t){let e=ce(t);if(e.Ie===null){e.Ie=[];let n=new Set;for(let i of e.explicitOrderBy)e.Ie.push(i),n.add(i.field.canonicalString());let a=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(s){let u=new It(hn.comparator);return s.filters.forEach(l=>{l.getFlattenedFilters().forEach(c=>{c.isInequality()&&(u=u.add(c.field))})}),u})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.Ie.push(new ti(i,a))}),n.has(hn.keyField().canonicalString())||e.Ie.push(new ti(hn.keyField(),a))}return e.Ie}function ca(t){let e=ce(t);return e.Ee||(e.Ee=aU(e,Gi(t))),e.Ee}function aU(t,e){if(t.limitType==="F")return mR(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let i=r.dir==="desc"?"asc":"desc";return new ti(r.field,i)});let n=t.endAt?new Ja(t.endAt.position,t.endAt.inclusive):null,a=t.startAt?new Ja(t.startAt.position,t.startAt.inclusive):null;return mR(t.path,t.collectionGroup,e,t.filters,t.limit,n,a)}}function hp(t,e){let n=t.filters.concat([e]);return new Za(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function Sx(t,e){let n=t.explicitOrderBy.concat([e]);return new Za(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function Ql(t,e,n){return new Za(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function vx(t,e){return new Za(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function pp(t,e){return YT(ca(t),ca(e))&&t.limitType===e.limitType}function Ex(t){return`${QT(ca(t))}|lt:${t.limitType}`}function ho(t){return`Query(target=${function(n){let a=n.path.canonicalString();return n.collectionGroup!==null&&(a+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(a+=`, filters: [${n.filters.map(r=>Ix(r)).join(", ")}]`),cp(n.limit)||(a+=", limit: "+n.limit),n.orderBy.length>0&&(a+=`, orderBy: [${n.orderBy.map(r=>function(s){return`${s.field.canonicalString()} (${s.dir})`}(r)).join(", ")}]`),n.startAt&&(a+=", startAt: ",a+=n.startAt.inclusive?"b:":"a:",a+=n.startAt.position.map(r=>Co(r)).join(",")),n.endAt&&(a+=", endAt: ",a+=n.endAt.inclusive?"a:":"b:",a+=n.endAt.position.map(r=>Co(r)).join(",")),`Target(${a})`}(ca(t))}; limitType=${t.limitType})`}function mp(t,e){return e.isFoundDocument()&&function(a,r){let i=r.key.path;return a.collectionGroup!==null?r.key.hasCollectionId(a.collectionGroup)&&a.path.isPrefixOf(i):K.isDocumentKey(a.path)?a.path.isEqual(i):a.path.isImmediateParentOf(i)}(t,e)&&function(a,r){for(let i of Gi(a))if(!i.field.isKeyField()&&r.data.field(i.field)===null)return!1;return!0}(t,e)&&function(a,r){for(let i of a.filters)if(!i.matches(r))return!1;return!0}(t,e)&&function(a,r){return!(a.startAt&&!function(s,u,l){let c=hR(s,u,l);return s.inclusive?c<=0:c<0}(a.startAt,Gi(a),r)||a.endAt&&!function(s,u,l){let c=hR(s,u,l);return s.inclusive?c>=0:c>0}(a.endAt,Gi(a),r))}(t,e)}function rU(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function wx(t){return(e,n)=>{let a=!1;for(let r of Gi(t)){let i=iU(r,e,n);if(i!==0)return i;a=a||r.field.isKeyField()}return 0}}function iU(t,e,n){let a=t.field.isKeyField()?K.comparator(e.key,n.key):function(i,s,u){let l=s.data.field(i),c=u.data.field(i);return l!==null&&c!==null?wo(l,c):Y(42886)}(t.field,e,n);switch(t.dir){case"asc":return a;case"desc":return-1*a;default:return Y(19790,{direction:t.dir})}}var er=class{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a!==void 0){for(let[r,i]of a)if(this.equalsFn(r,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){let a=this.mapKeyFn(e),r=this.inner[a];if(r===void 0)return this.inner[a]=[[e,n]],void this.innerSize++;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return void(r[i]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a===void 0)return!1;for(let r=0;r<a.length;r++)if(this.equalsFn(a[r][0],e))return a.length===1?delete this.inner[n]:a.splice(r,1),this.innerSize--,!0;return!1}forEach(e){Uo(this.inner,(n,a)=>{for(let[r,i]of a)e(r,i)})}isEmpty(){return ox(this.inner)}size(){return this.innerSize}};var sU=new Xe(K.comparator);function ni(){return sU}var Cx=new Xe(K.comparator);function Fl(...t){let e=Cx;for(let n of t)e=e.insert(n.key,n);return e}function oU(t){let e=Cx;return t.forEach((n,a)=>e=e.insert(n,a.overlayedDocument)),e}function zi(){return ql()}function Ax(){return ql()}function ql(){return new er(t=>t.toString(),(t,e)=>t.isEqual(e))}var hz=new Xe(K.comparator),uU=new It(K.comparator);function le(...t){let e=uU;for(let n of t)e=e.add(n);return e}var lU=new It(oe);function cU(){return lU}function $T(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Gl(e)?"-0":e}}function bx(t){return{integerValue:""+t}}function dU(t,e){return F2(e)?bx(e):$T(t,e)}var Ao=class{constructor(){this._=void 0}};function fU(t,e,n){return t instanceof Yl?function(r,i){let s={fields:{[lx]:{stringValue:ux},[dx]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return i&&lc(i)&&(i=dp(i)),i&&(s.fields[cx]=i),{mapValue:s}}(n,e):t instanceof bo?Lx(t,e):t instanceof Lo?Rx(t,e):function(r,i){let s=pU(r,i),u=yR(s)+yR(r.Ae);return xI(s)&&xI(r.Ae)?bx(u):$T(r.serializer,u)}(t,e)}function hU(t,e,n){return t instanceof bo?Lx(t,e):t instanceof Lo?Rx(t,e):n}function pU(t,e){return t instanceof Xl?function(a){return xI(a)||function(i){return!!i&&"doubleValue"in i}(a)}(e)?e:{integerValue:0}:null}var Yl=class extends Ao{},bo=class extends Ao{constructor(e){super(),this.elements=e}};function Lx(t,e){let n=xx(e);for(let a of t.elements)n.some(r=>ha(r,a))||n.push(a);return{arrayValue:{values:n}}}var Lo=class extends Ao{constructor(e){super(),this.elements=e}};function Rx(t,e){let n=xx(e);for(let a of t.elements)n=n.filter(r=>!ha(r,a));return{arrayValue:{values:n}}}var Xl=class extends Ao{constructor(e,n){super(),this.serializer=e,this.Ae=n}};function yR(t){return Oe(t.integerValue||t.doubleValue)}function xx(t){return KT(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function mU(t,e){return t.field.isEqual(e.field)&&function(a,r){return a instanceof bo&&r instanceof bo||a instanceof Lo&&r instanceof Lo?So(a.elements,r.elements,ha):a instanceof Xl&&r instanceof Xl?ha(a.Ae,r.Ae):a instanceof Yl&&r instanceof Yl}(t.transform,e.transform)}var yo=class t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function kh(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var $l=class{};function kx(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new Hh(t.key,yo.none()):new Jl(t.key,t.data,yo.none());{let n=t.data,a=ua.empty(),r=new It(hn.comparator);for(let i of e.fields)if(!r.has(i)){let s=n.field(i);s===null&&i.length>1&&(i=i.popLast(),s=n.field(i)),s===null?a.delete(i):a.set(i,s),r=r.add(i)}return new Ro(t.key,a,new qi(r.toArray()),yo.none())}}function gU(t,e,n){t instanceof Jl?function(r,i,s){let u=r.value.clone(),l=IR(r.fieldTransforms,i,s.transformResults);u.setAll(l),i.convertToFoundDocument(s.version,u).setHasCommittedMutations()}(t,e,n):t instanceof Ro?function(r,i,s){if(!kh(r.precondition,i))return void i.convertToUnknownDocument(s.version);let u=IR(r.fieldTransforms,i,s.transformResults),l=i.data;l.setAll(Dx(r)),l.setAll(u),i.convertToFoundDocument(s.version,l).setHasCommittedMutations()}(t,e,n):function(r,i,s){i.convertToNoDocument(s.version).setHasCommittedMutations()}(0,e,n)}function zl(t,e,n,a){return t instanceof Jl?function(i,s,u,l){if(!kh(i.precondition,s))return u;let c=i.value.clone(),f=TR(i.fieldTransforms,l,s);return c.setAll(f),s.convertToFoundDocument(s.version,c).setHasLocalMutations(),null}(t,e,n,a):t instanceof Ro?function(i,s,u,l){if(!kh(i.precondition,s))return u;let c=TR(i.fieldTransforms,l,s),f=s.data;return f.setAll(Dx(i)),f.setAll(c),s.convertToFoundDocument(s.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(t,e,n,a):function(i,s,u){return kh(i.precondition,s)?(s.convertToNoDocument(s.version).setHasLocalMutations(),null):u}(t,e,n)}function _R(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(a,r){return a===void 0&&r===void 0||!(!a||!r)&&So(a,r,(i,s)=>mU(i,s))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var Jl=class extends $l{constructor(e,n,a,r=[]){super(),this.key=e,this.value=n,this.precondition=a,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},Ro=class extends $l{constructor(e,n,a,r,i=[]){super(),this.key=e,this.data=n,this.fieldMask=a,this.precondition=r,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}};function Dx(t){let e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){let a=t.data.field(n);e.set(n,a)}}),e}function IR(t,e,n){let a=new Map;Ue(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let r=0;r<n.length;r++){let i=t[r],s=i.transform,u=e.data.field(i.field);a.set(i.field,hU(s,u,n[r]))}return a}function TR(t,e,n){let a=new Map;for(let r of t){let i=r.transform,s=n.data.field(r.field);a.set(r.field,fU(i,s,e))}return a}var Hh=class extends $l{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var qI=class{constructor(e,n,a,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=a,this.mutations=r}applyToRemoteDocument(e,n){let a=n.mutationResults;for(let r=0;r<this.mutations.length;r++){let i=this.mutations[r];i.key.isEqual(e.key)&&gU(i,e,a[r])}}applyToLocalView(e,n){for(let a of this.baseMutations)a.key.isEqual(e.key)&&(n=zl(a,e,n,this.localWriteTime));for(let a of this.mutations)a.key.isEqual(e.key)&&(n=zl(a,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){let a=Ax();return this.mutations.forEach(r=>{let i=e.get(r.key),s=i.overlayedDocument,u=this.applyToLocalView(s,i.mutatedFields);u=n.has(r.key)?null:u;let l=kx(s,u);l!==null&&a.set(r.key,l),s.isValidDocument()||s.convertToNoDocument(Z.min())}),a}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),le())}isEqual(e){return this.batchId===e.batchId&&So(this.mutations,e.mutations,(n,a)=>_R(n,a))&&So(this.baseMutations,e.baseMutations,(n,a)=>_R(n,a))}};var zI=class{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var HI=class{constructor(e,n){this.count=e,this.unchangedNames=n}};var tt,ue;function Px(t){if(t===void 0)return Qa("GRPC error has no .code"),N.UNKNOWN;switch(t){case tt.OK:return N.OK;case tt.CANCELLED:return N.CANCELLED;case tt.UNKNOWN:return N.UNKNOWN;case tt.DEADLINE_EXCEEDED:return N.DEADLINE_EXCEEDED;case tt.RESOURCE_EXHAUSTED:return N.RESOURCE_EXHAUSTED;case tt.INTERNAL:return N.INTERNAL;case tt.UNAVAILABLE:return N.UNAVAILABLE;case tt.UNAUTHENTICATED:return N.UNAUTHENTICATED;case tt.INVALID_ARGUMENT:return N.INVALID_ARGUMENT;case tt.NOT_FOUND:return N.NOT_FOUND;case tt.ALREADY_EXISTS:return N.ALREADY_EXISTS;case tt.PERMISSION_DENIED:return N.PERMISSION_DENIED;case tt.FAILED_PRECONDITION:return N.FAILED_PRECONDITION;case tt.ABORTED:return N.ABORTED;case tt.OUT_OF_RANGE:return N.OUT_OF_RANGE;case tt.UNIMPLEMENTED:return N.UNIMPLEMENTED;case tt.DATA_LOSS:return N.DATA_LOSS;default:return Y(39323,{code:t})}}(ue=tt||(tt={}))[ue.OK=0]="OK",ue[ue.CANCELLED=1]="CANCELLED",ue[ue.UNKNOWN=2]="UNKNOWN",ue[ue.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ue[ue.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ue[ue.NOT_FOUND=5]="NOT_FOUND",ue[ue.ALREADY_EXISTS=6]="ALREADY_EXISTS",ue[ue.PERMISSION_DENIED=7]="PERMISSION_DENIED",ue[ue.UNAUTHENTICATED=16]="UNAUTHENTICATED",ue[ue.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ue[ue.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ue[ue.ABORTED=10]="ABORTED",ue[ue.OUT_OF_RANGE=11]="OUT_OF_RANGE",ue[ue.UNIMPLEMENTED=12]="UNIMPLEMENTED",ue[ue.INTERNAL=13]="INTERNAL",ue[ue.UNAVAILABLE=14]="UNAVAILABLE",ue[ue.DATA_LOSS=15]="DATA_LOSS";var yU=null;function _U(){return new TextEncoder}var IU=new Ga([4294967295,4294967295],0);function SR(t){let e=_U().encode(t),n=new dI;return n.update(e),new Uint8Array(n.digest())}function vR(t){let e=new DataView(t.buffer),n=e.getUint32(0,!0),a=e.getUint32(4,!0),r=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Ga([n,a],0),new Ga([r,i],0)]}var GI=class t{constructor(e,n,a){if(this.bitmap=e,this.padding=n,this.hashCount=a,n<0||n>=8)throw new Hi(`Invalid padding: ${n}`);if(a<0)throw new Hi(`Invalid hash count: ${a}`);if(e.length>0&&this.hashCount===0)throw new Hi(`Invalid hash count: ${a}`);if(e.length===0&&n!==0)throw new Hi(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=Ga.fromNumber(this.ge)}ye(e,n,a){let r=e.add(n.multiply(Ga.fromNumber(a)));return r.compare(IU)===1&&(r=new Ga([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let n=SR(e),[a,r]=vR(n);for(let i=0;i<this.hashCount;i++){let s=this.ye(a,r,i);if(!this.we(s))return!1}return!0}static create(e,n,a){let r=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),s=new t(i,r,n);return a.forEach(u=>s.insert(u)),s}insert(e){if(this.ge===0)return;let n=SR(e),[a,r]=vR(n);for(let i=0;i<this.hashCount;i++){let s=this.ye(a,r,i);this.be(s)}}be(e){let n=Math.floor(e/8),a=e%8;this.bitmap[n]|=1<<a}},Hi=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var Gh=class t{constructor(e,n,a,r,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=a,this.documentUpdates=r,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,a){let r=new Map;return r.set(e,Zl.createSynthesizedTargetChangeForCurrentChange(e,n,a)),new t(Z.min(),r,new Xe(oe),ni(),le())}},Zl=class t{constructor(e,n,a,r,i){this.resumeToken=e,this.current=n,this.addedDocuments=a,this.modifiedDocuments=r,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,a){return new t(a,n,le(),le(),le())}};var _o=class{constructor(e,n,a,r){this.Se=e,this.removedTargetIds=n,this.key=a,this.De=r}},jh=class{constructor(e,n){this.targetId=e,this.Ce=n}},Wh=class{constructor(e,n,a=xt.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=a,this.cause=r}},Kh=class{constructor(){this.ve=0,this.Fe=ER(),this.Me=xt.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=le(),n=le(),a=le();return this.Fe.forEach((r,i)=>{switch(i){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:a=a.add(r);break;default:Y(38017,{changeType:i})}}),new Zl(this.Me,this.xe,e,n,a)}Ke(){this.Oe=!1,this.Fe=ER()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,Ue(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},jI=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=ni(),this.He=Lh(),this.Je=Lh(),this.Ze=new Xe(oe)}Xe(e){for(let n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(let n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{let a=this.nt(n);switch(e.state){case 0:this.rt(n)&&a.Le(e.resumeToken);break;case 1:a.We(),a.Ne||a.Ke(),a.Le(e.resumeToken);break;case 2:a.We(),a.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(a.Qe(),a.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),a.Le(e.resumeToken));break;default:Y(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((a,r)=>{this.rt(r)&&n(r)})}st(e){let n=e.targetId,a=e.Ce.count,r=this.ot(n);if(r){let i=r.target;if(BI(i))if(a===0){let s=new K(i.path);this.et(n,s,Bn.newNoDocument(s,Z.min()))}else Ue(a===1,20013,{expectedCount:a});else{let s=this._t(n);if(s!==a){let u=this.ut(e),l=u?this.ct(u,e,s):1;if(l!==0){this.it(n);let c=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,c)}yU?.lt(function(f,m,p,_,L){let k={localCacheCount:f,existenceFilterCount:m.count,databaseId:p.database,projectId:p.projectId},P=m.unchangedNames;return P&&(k.bloomFilter={applied:L===0,hashCount:P?.hashCount??0,bitmapLength:P?.bits?.bitmap?.length??0,padding:P?.bits?.padding??0,mightContain:E=>_?.mightContain(E)??!1}),k}(s,e.Ce,this.Ge.ht(),u,l))}}}}ut(e){let n=e.Ce.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:a="",padding:r=0},hashCount:i=0}=n,s,u;try{s=$a(a).toUint8Array()}catch(l){if(l instanceof Bh)return Ya("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new GI(s,r,i)}catch(l){return Ya(l instanceof Hi?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.ge===0?null:u}ct(e,n,a){return n.Ce.count===a-this.Pt(e,n.targetId)?0:2}Pt(e,n){let a=this.Ge.getRemoteKeysForTarget(n),r=0;return a.forEach(i=>{let s=this.Ge.ht(),u=`projects/${s.projectId}/databases/${s.database}/documents/${i.path.canonicalString()}`;e.mightContain(u)||(this.et(n,i,null),r++)}),r}Tt(e){let n=new Map;this.ze.forEach((i,s)=>{let u=this.ot(s);if(u){if(i.current&&BI(u.target)){let l=new K(u.target.path);this.It(l).has(s)||this.Et(s,l)||this.et(s,l,Bn.newNoDocument(l,e))}i.Be&&(n.set(s,i.ke()),i.Ke())}});let a=le();this.Je.forEach((i,s)=>{let u=!0;s.forEachWhile(l=>{let c=this.ot(l);return!c||c.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(a=a.add(i))}),this.je.forEach((i,s)=>s.setReadTime(e));let r=new Gh(e,n,this.Ze,this.je,a);return this.je=ni(),this.He=Lh(),this.Je=Lh(),this.Ze=new Xe(oe),r}Ye(e,n){if(!this.rt(e))return;let a=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,a),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,a){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,n)?r.qe(n,1):r.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),a&&(this.je=this.je.insert(n,a))}removeTarget(e){this.ze.delete(e)}_t(e){let n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new Kh,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new It(oe),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new It(oe),this.He=this.He.insert(e,n)),n}rt(e){let n=this.ot(e)!==null;return n||H("WatchChangeAggregator","Detected inactive target",e),n}ot(e){let n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new Kh),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}};function Lh(){return new Xe(K.comparator)}function ER(){return new Xe(K.comparator)}var TU={asc:"ASCENDING",desc:"DESCENDING"},SU={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},vU={and:"AND",or:"OR"},WI=class{constructor(e,n){this.databaseId=e,this.useProto3Json=n}};function KI(t,e){return t.useProto3Json||cp(e)?e:{value:e}}function QI(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Ox(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function Io(t){return Ue(!!t,49232),Z.fromTimestamp(function(n){let a=Xa(n);return new at(a.seconds,a.nanos)}(t))}function Nx(t,e){return YI(t,e).canonicalString()}function YI(t,e){let n=function(r){return new Ne(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?n:n.child(e)}function Mx(t){let e=Ne.fromString(t);return Ue(qx(e),10190,{key:e.toString()}),e}function II(t,e){let n=Mx(e);if(n.get(1)!==t.databaseId.projectId)throw new q(N.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new q(N.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new K(Vx(n))}function Ux(t,e){return Nx(t.databaseId,e)}function EU(t){let e=Mx(t);return e.length===4?Ne.emptyPath():Vx(e)}function wR(t){return new Ne(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function Vx(t){return Ue(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function wU(t,e){let n;if("targetChange"in e){e.targetChange;let a=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:Y(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],i=function(c,f){return c.useProto3Json?(Ue(f===void 0||typeof f=="string",58123),xt.fromBase64String(f||"")):(Ue(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),xt.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),s=e.targetChange.cause,u=s&&function(c){let f=c.code===void 0?N.UNKNOWN:Px(c.code);return new q(f,c.message||"")}(s);n=new Wh(a,r,i,u||null)}else if("documentChange"in e){e.documentChange;let a=e.documentChange;a.document,a.document.name,a.document.updateTime;let r=II(t,a.document.name),i=Io(a.document.updateTime),s=a.document.createTime?Io(a.document.createTime):Z.min(),u=new ua({mapValue:{fields:a.document.fields}}),l=Bn.newFoundDocument(r,i,s,u),c=a.targetIds||[],f=a.removedTargetIds||[];n=new _o(c,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;let a=e.documentDelete;a.document;let r=II(t,a.document),i=a.readTime?Io(a.readTime):Z.min(),s=Bn.newNoDocument(r,i),u=a.removedTargetIds||[];n=new _o([],u,s.key,s)}else if("documentRemove"in e){e.documentRemove;let a=e.documentRemove;a.document;let r=II(t,a.document),i=a.removedTargetIds||[];n=new _o([],i,r,null)}else{if(!("filter"in e))return Y(11601,{Vt:e});{e.filter;let a=e.filter;a.targetId;let{count:r=0,unchangedNames:i}=a,s=new HI(r,i),u=a.targetId;n=new jh(u,s)}}return n}function CU(t,e){return{documents:[Ux(t,e.path)]}}function AU(t,e){let n={structuredQuery:{}},a=e.path,r;e.collectionGroup!==null?(r=a,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=a.popLast(),n.structuredQuery.from=[{collectionId:a.lastSegment()}]),n.parent=Ux(t,r);let i=function(c){if(c.length!==0)return Bx(xn.create(c,"and"))}(e.filters);i&&(n.structuredQuery.where=i);let s=function(c){if(c.length!==0)return c.map(f=>function(p){return{field:po(p.field),direction:RU(p.dir)}}(f))}(e.orderBy);s&&(n.structuredQuery.orderBy=s);let u=KI(t,e.limit);return u!==null&&(n.structuredQuery.limit=u),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{ft:n,parent:r}}function bU(t){let e=EU(t.parent),n=t.structuredQuery,a=n.from?n.from.length:0,r=null;if(a>0){Ue(a===1,65062);let f=n.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let i=[];n.where&&(i=function(m){let p=Fx(m);return p instanceof xn&&yx(p)?p.getFilters():[p]}(n.where));let s=[];n.orderBy&&(s=function(m){return m.map(p=>function(L){return new ti(mo(L.field),function(P){switch(P){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(L.direction))}(p))}(n.orderBy));let u=null;n.limit&&(u=function(m){let p;return p=typeof m=="object"?m.value:m,cp(p)?null:p}(n.limit));let l=null;n.startAt&&(l=function(m){let p=!!m.before,_=m.values||[];return new Ja(_,p)}(n.startAt));let c=null;return n.endAt&&(c=function(m){let p=!m.before,_=m.values||[];return new Ja(_,p)}(n.endAt)),tU(e,r,s,i,u,"F",l,c)}function LU(t,e){let n=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Y(28987,{purpose:r})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function Fx(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":let a=mo(n.unaryFilter.field);return Qe.create(a,"==",{doubleValue:NaN});case"IS_NULL":let r=mo(n.unaryFilter.field);return Qe.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let i=mo(n.unaryFilter.field);return Qe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let s=mo(n.unaryFilter.field);return Qe.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Y(61313);default:return Y(60726)}}(t):t.fieldFilter!==void 0?function(n){return Qe.create(mo(n.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Y(58110);default:return Y(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return xn.create(n.compositeFilter.filters.map(a=>Fx(a)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return Y(1026)}}(n.compositeFilter.op))}(t):Y(30097,{filter:t})}function RU(t){return TU[t]}function xU(t){return SU[t]}function kU(t){return vU[t]}function po(t){return{fieldPath:t.canonicalString()}}function mo(t){return hn.fromServerFormat(t.fieldPath)}function Bx(t){return t instanceof Qe?function(n){if(n.op==="=="){if(fR(n.value))return{unaryFilter:{field:po(n.field),op:"IS_NAN"}};if(dR(n.value))return{unaryFilter:{field:po(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(fR(n.value))return{unaryFilter:{field:po(n.field),op:"IS_NOT_NAN"}};if(dR(n.value))return{unaryFilter:{field:po(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:po(n.field),op:xU(n.op),value:n.value}}}(t):t instanceof xn?function(n){let a=n.getFilters().map(r=>Bx(r));return a.length===1?a[0]:{compositeFilter:{op:kU(n.op),filters:a}}}(t):Y(54877,{filter:t})}function qx(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function zx(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var ec=class t{constructor(e,n,a,r,i=Z.min(),s=Z.min(),u=xt.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=n,this.purpose=a,this.sequenceNumber=r,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=s,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var XI=class{constructor(e){this.yt=e}};function Hx(t){let e=bU({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Ql(e,e.limit,"L"):e}var Qh=class{constructor(){}Dt(e,n){this.Ct(e,n),n.vt()}Ct(e,n){if("nullValue"in e)this.Ft(n,5);else if("booleanValue"in e)this.Ft(n,10),n.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(n,15),n.Mt(Oe(e.integerValue));else if("doubleValue"in e){let a=Oe(e.doubleValue);isNaN(a)?this.Ft(n,13):(this.Ft(n,15),Gl(a)?n.Mt(0):n.Mt(a))}else if("timestampValue"in e){let a=e.timestampValue;this.Ft(n,20),typeof a=="string"&&(a=Xa(a)),n.xt(`${a.seconds||""}`),n.Mt(a.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,n),this.Nt(n);else if("bytesValue"in e)this.Ft(n,30),n.Bt($a(e.bytesValue)),this.Nt(n);else if("referenceValue"in e)this.Lt(e.referenceValue,n);else if("geoPointValue"in e){let a=e.geoPointValue;this.Ft(n,45),n.Mt(a.latitude||0),n.Mt(a.longitude||0)}else"mapValue"in e?mx(e)?this.Ft(n,Number.MAX_SAFE_INTEGER):px(e)?this.kt(e.mapValue,n):(this.Kt(e.mapValue,n),this.Nt(n)):"arrayValue"in e?(this.qt(e.arrayValue,n),this.Nt(n)):Y(19022,{Ut:e})}Ot(e,n){this.Ft(n,25),this.$t(e,n)}$t(e,n){n.xt(e)}Kt(e,n){let a=e.fields||{};this.Ft(n,55);for(let r of Object.keys(a))this.Ot(r,n),this.Ct(a[r],n)}kt(e,n){let a=e.fields||{};this.Ft(n,53);let r=Eo,i=a[r].arrayValue?.values?.length||0;this.Ft(n,15),n.Mt(Oe(i)),this.Ot(r,n),this.Ct(a[r],n)}qt(e,n){let a=e.values||[];this.Ft(n,50);for(let r of a)this.Ct(r,n)}Lt(e,n){this.Ft(n,37),K.fromName(e).path.forEach(a=>{this.Ft(n,60),this.$t(a,n)})}Ft(e,n){e.Mt(n)}Nt(e){e.Mt(2)}};Qh.Wt=new Qh;var $I=class{constructor(){this.Sn=new JI}addToCollectionParentIndex(e,n){return this.Sn.add(n),U.resolve()}getCollectionParents(e,n){return U.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return U.resolve()}deleteFieldIndex(e,n){return U.resolve()}deleteAllFieldIndexes(e){return U.resolve()}createTargetIndexes(e,n){return U.resolve()}getDocumentsMatchingTarget(e,n){return U.resolve(null)}getIndexType(e,n){return U.resolve(0)}getFieldIndexes(e,n){return U.resolve([])}getNextCollectionGroupToUpdate(e){return U.resolve(null)}getMinOffset(e,n){return U.resolve(Ki.min())}getMinOffsetFromCollectionGroup(e,n){return U.resolve(Ki.min())}updateCollectionGroup(e,n,a){return U.resolve()}updateIndexEntries(e,n){return U.resolve()}},JI=class{constructor(){this.index={}}add(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n]||new It(Ne.comparator),i=!r.has(a);return this.index[n]=r.add(a),i}has(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n];return r&&r.has(a)}getEntries(e){return(this.index[e]||new It(Ne.comparator)).toArray()}};var pz=new Uint8Array(0);var CR={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Gx=41943040,Rn=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,a){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=a}};Rn.DEFAULT_COLLECTION_PERCENTILE=10,Rn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Rn.DEFAULT=new Rn(Gx,Rn.DEFAULT_COLLECTION_PERCENTILE,Rn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Rn.DISABLED=new Rn(-1,0,0);var tc=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var AR="LruGarbageCollector",DU=1048576;function bR([t,e],[n,a]){let r=oe(t,n);return r===0?oe(e,a):r}var ZI=class{constructor(e){this.Pr=e,this.buffer=new It(bR),this.Tr=0}Ir(){return++this.Tr}Er(e){let n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{let a=this.buffer.last();bR(n,a)<0&&(this.buffer=this.buffer.delete(a).add(n))}}get maxValue(){return this.buffer.last()[0]}},eT=class{constructor(e,n,a){this.garbageCollector=e,this.asyncQueue=n,this.localStore=a,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){H(AR,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){Mo(n)?H(AR,"Ignoring IndexedDB error during garbage collection: ",n):await lp(n)}await this.Ar(3e5)})}},tT=class{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(a=>Math.floor(n/100*a))}nthSequenceNumber(e,n){if(n===0)return U.resolve(vo.ce);let a=new ZI(n);return this.Vr.forEachTarget(e,r=>a.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>a.Er(r))).next(()=>a.maxValue)}removeTargets(e,n,a){return this.Vr.removeTargets(e,n,a)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(H("LruGarbageCollector","Garbage collection skipped; disabled"),U.resolve(CR)):this.getCacheSize(e).next(a=>a<this.params.cacheSizeCollectionThreshold?(H("LruGarbageCollector",`Garbage collection skipped; Cache size ${a} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),CR):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let a,r,i,s,u,l,c,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(H("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),r=this.params.maximumSequenceNumbersToCollect):r=m,s=Date.now(),this.nthSequenceNumber(e,r))).next(m=>(a=m,u=Date.now(),this.removeTargets(e,a,n))).next(m=>(i=m,l=Date.now(),this.removeOrphanedDocuments(e,a))).next(m=>(c=Date.now(),fo()<=ee.DEBUG&&H("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${s-f}ms
	Determined least recently used ${r} in `+(u-s)+`ms
	Removed ${i} targets in `+(l-u)+`ms
	Removed ${m} documents in `+(c-l)+`ms
Total Duration: ${c-f}ms`),U.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:i,documentsRemoved:m})))}};function PU(t,e){return new tT(t,e)}var nT=class{constructor(){this.changes=new er(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Bn.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();let a=this.changes.get(n);return a!==void 0?U.resolve(a):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var aT=class{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}};var rT=class{constructor(e,n,a,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=a,this.indexManager=r}getDocument(e,n){let a=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(a=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(a!==null&&zl(a.mutation,r,qi.empty(),at.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.getLocalViewOfDocuments(e,a,le()).next(()=>a))}getLocalViewOfDocuments(e,n,a=le()){let r=zi();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,a).next(i=>{let s=Fl();return i.forEach((u,l)=>{s=s.insert(u,l.overlayedDocument)}),s}))}getOverlayedDocuments(e,n){let a=zi();return this.populateOverlays(e,a,n).next(()=>this.computeViews(e,n,a,le()))}populateOverlays(e,n,a){let r=[];return a.forEach(i=>{n.has(i)||r.push(i)}),this.documentOverlayCache.getOverlays(e,r).next(i=>{i.forEach((s,u)=>{n.set(s,u)})})}computeViews(e,n,a,r){let i=ni(),s=ql(),u=function(){return ql()}();return n.forEach((l,c)=>{let f=a.get(c.key);r.has(c.key)&&(f===void 0||f.mutation instanceof Ro)?i=i.insert(c.key,c):f!==void 0?(s.set(c.key,f.mutation.getFieldMask()),zl(f.mutation,c,f.mutation.getFieldMask(),at.now())):s.set(c.key,qi.empty())}),this.recalculateAndSaveOverlays(e,i).next(l=>(l.forEach((c,f)=>s.set(c,f)),n.forEach((c,f)=>u.set(c,new aT(f,s.get(c)??null))),u))}recalculateAndSaveOverlays(e,n){let a=ql(),r=new Xe((s,u)=>s-u),i=le();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(s=>{for(let u of s)u.keys().forEach(l=>{let c=n.get(l);if(c===null)return;let f=a.get(l)||qi.empty();f=u.applyToLocalView(c,f),a.set(l,f);let m=(r.get(u.batchId)||le()).add(l);r=r.insert(u.batchId,m)})}).next(()=>{let s=[],u=r.getReverseIterator();for(;u.hasNext();){let l=u.getNext(),c=l.key,f=l.value,m=Ax();f.forEach(p=>{if(!i.has(p)){let _=kx(n.get(p),a.get(p));_!==null&&m.set(p,_),i=i.add(p)}}),s.push(this.documentOverlayCache.saveOverlays(e,c,m))}return U.waitFor(s)}).next(()=>a)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.recalculateAndSaveOverlays(e,a))}getDocumentsMatchingQuery(e,n,a,r){return nU(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):fp(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,a,r):this.getDocumentsMatchingCollectionQuery(e,n,a,r)}getNextDocuments(e,n,a,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,a,r).next(i=>{let s=r-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,a.largestBatchId,r-i.size):U.resolve(zi()),u=Hl,l=i;return s.next(c=>U.forEach(c,(f,m)=>(u<m.largestBatchId&&(u=m.largestBatchId),i.get(f)?U.resolve():this.remoteDocumentCache.getEntry(e,f).next(p=>{l=l.insert(f,p)}))).next(()=>this.populateOverlays(e,c,i)).next(()=>this.computeViews(e,l,c,le())).next(f=>({batchId:u,changes:oU(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new K(n)).next(a=>{let r=Fl();return a.isFoundDocument()&&(r=r.insert(a.key,a)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,a,r){let i=n.collectionGroup,s=Fl();return this.indexManager.getCollectionParents(e,i).next(u=>U.forEach(u,l=>{let c=function(m,p){return new Za(p,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(n,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,c,a,r).next(f=>{f.forEach((m,p)=>{s=s.insert(m,p)})})}).next(()=>s))}getDocumentsMatchingCollectionQuery(e,n,a,r){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,a.largestBatchId).next(s=>(i=s,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,a,i,r))).next(s=>{i.forEach((l,c)=>{let f=c.getKey();s.get(f)===null&&(s=s.insert(f,Bn.newInvalidDocument(f)))});let u=Fl();return s.forEach((l,c)=>{let f=i.get(l);f!==void 0&&zl(f.mutation,c,qi.empty(),at.now()),mp(n,c)&&(u=u.insert(l,c))}),u})}};var iT=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return U.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(r){return{id:r.id,version:r.version,createTime:Io(r.createTime)}}(n)),U.resolve()}getNamedQuery(e,n){return U.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(r){return{name:r.name,query:Hx(r.bundledQuery),readTime:Io(r.readTime)}}(n)),U.resolve()}};var sT=class{constructor(){this.overlays=new Xe(K.comparator),this.Lr=new Map}getOverlay(e,n){return U.resolve(this.overlays.get(n))}getOverlays(e,n){let a=zi();return U.forEach(n,r=>this.getOverlay(e,r).next(i=>{i!==null&&a.set(r,i)})).next(()=>a)}saveOverlays(e,n,a){return a.forEach((r,i)=>{this.bt(e,n,i)}),U.resolve()}removeOverlaysForBatchId(e,n,a){let r=this.Lr.get(a);return r!==void 0&&(r.forEach(i=>this.overlays=this.overlays.remove(i)),this.Lr.delete(a)),U.resolve()}getOverlaysForCollection(e,n,a){let r=zi(),i=n.length+1,s=new K(n.child("")),u=this.overlays.getIteratorFrom(s);for(;u.hasNext();){let l=u.getNext().value,c=l.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===i&&l.largestBatchId>a&&r.set(l.getKey(),l)}return U.resolve(r)}getOverlaysForCollectionGroup(e,n,a,r){let i=new Xe((c,f)=>c-f),s=this.overlays.getIterator();for(;s.hasNext();){let c=s.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>a){let f=i.get(c.largestBatchId);f===null&&(f=zi(),i=i.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}let u=zi(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((c,f)=>u.set(c,f)),!(u.size()>=r)););return U.resolve(u)}bt(e,n,a){let r=this.overlays.get(a.key);if(r!==null){let s=this.Lr.get(r.largestBatchId).delete(a.key);this.Lr.set(r.largestBatchId,s)}this.overlays=this.overlays.insert(a.key,new zI(n,a));let i=this.Lr.get(n);i===void 0&&(i=le(),this.Lr.set(n,i)),this.Lr.set(n,i.add(a.key))}};var oT=class{constructor(){this.sessionToken=xt.EMPTY_BYTE_STRING}getSessionToken(e){return U.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,U.resolve()}};var nc=class{constructor(){this.kr=new It(nt.Kr),this.qr=new It(nt.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){let a=new nt(e,n);this.kr=this.kr.add(a),this.qr=this.qr.add(a)}$r(e,n){e.forEach(a=>this.addReference(a,n))}removeReference(e,n){this.Wr(new nt(e,n))}Qr(e,n){e.forEach(a=>this.removeReference(a,n))}Gr(e){let n=new K(new Ne([])),a=new nt(n,e),r=new nt(n,e+1),i=[];return this.qr.forEachInRange([a,r],s=>{this.Wr(s),i.push(s.key)}),i}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let n=new K(new Ne([])),a=new nt(n,e),r=new nt(n,e+1),i=le();return this.qr.forEachInRange([a,r],s=>{i=i.add(s.key)}),i}containsKey(e){let n=new nt(e,0),a=this.kr.firstAfterOrEqual(n);return a!==null&&e.isEqual(a.key)}},nt=class{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return K.comparator(e.key,n.key)||oe(e.Hr,n.Hr)}static Ur(e,n){return oe(e.Hr,n.Hr)||K.comparator(e.key,n.key)}};var uT=class{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new It(nt.Kr)}checkEmpty(e){return U.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,a,r){let i=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let s=new qI(i,n,a,r);this.mutationQueue.push(s);for(let u of r)this.Jr=this.Jr.add(new nt(u.key,i)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return U.resolve(s)}lookupMutationBatch(e,n){return U.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){let a=n+1,r=this.Xr(a),i=r<0?0:r;return U.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return U.resolve(this.mutationQueue.length===0?V2:this.Yn-1)}getAllMutationBatches(e){return U.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){let a=new nt(n,0),r=new nt(n,Number.POSITIVE_INFINITY),i=[];return this.Jr.forEachInRange([a,r],s=>{let u=this.Zr(s.Hr);i.push(u)}),U.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let a=new It(oe);return n.forEach(r=>{let i=new nt(r,0),s=new nt(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([i,s],u=>{a=a.add(u.Hr)})}),U.resolve(this.Yr(a))}getAllMutationBatchesAffectingQuery(e,n){let a=n.path,r=a.length+1,i=a;K.isDocumentKey(i)||(i=i.child(""));let s=new nt(new K(i),0),u=new It(oe);return this.Jr.forEachWhile(l=>{let c=l.key.path;return!!a.isPrefixOf(c)&&(c.length===r&&(u=u.add(l.Hr)),!0)},s),U.resolve(this.Yr(u))}Yr(e){let n=[];return e.forEach(a=>{let r=this.Zr(a);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){Ue(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let a=this.Jr;return U.forEach(n.mutations,r=>{let i=new nt(r.key,n.batchId);return a=a.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=a})}nr(e){}containsKey(e,n){let a=new nt(n,0),r=this.Jr.firstAfterOrEqual(a);return U.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,U.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}};var lT=class{constructor(e){this.ti=e,this.docs=function(){return new Xe(K.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){let a=n.key,r=this.docs.get(a),i=r?r.size:0,s=this.ti(n);return this.docs=this.docs.insert(a,{document:n.mutableCopy(),size:s}),this.size+=s-i,this.indexManager.addToCollectionParentIndex(e,a.path.popLast())}removeEntry(e){let n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){let a=this.docs.get(n);return U.resolve(a?a.document.mutableCopy():Bn.newInvalidDocument(n))}getEntries(e,n){let a=ni();return n.forEach(r=>{let i=this.docs.get(r);a=a.insert(r,i?i.document.mutableCopy():Bn.newInvalidDocument(r))}),U.resolve(a)}getDocumentsMatchingQuery(e,n,a,r){let i=ni(),s=n.path,u=new K(s.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){let{key:c,value:{document:f}}=l.getNext();if(!s.isPrefixOf(c.path))break;c.path.length>s.length+1||N2(O2(f),a)<=0||(r.has(f.key)||mp(n,f))&&(i=i.insert(f.key,f.mutableCopy()))}return U.resolve(i)}getAllFromCollectionGroup(e,n,a,r){Y(9500)}ni(e,n){return U.forEach(this.docs,a=>n(a))}newChangeBuffer(e){return new cT(this)}getSize(e){return U.resolve(this.size)}},cT=class extends nT{constructor(e){super(),this.Mr=e}applyChanges(e){let n=[];return this.changes.forEach((a,r)=>{r.isValidDocument()?n.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(a)}),U.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}};var dT=class{constructor(e){this.persistence=e,this.ri=new er(n=>QT(n),YT),this.lastRemoteSnapshotVersion=Z.min(),this.highestTargetId=0,this.ii=0,this.si=new nc,this.targetCount=0,this.oi=tc._r()}forEachTarget(e,n){return this.ri.forEach((a,r)=>n(r)),U.resolve()}getLastRemoteSnapshotVersion(e){return U.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return U.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),U.resolve(this.highestTargetId)}setTargetsMetadata(e,n,a){return a&&(this.lastRemoteSnapshotVersion=a),n>this.ii&&(this.ii=n),U.resolve()}lr(e){this.ri.set(e.target,e);let n=e.targetId;n>this.highestTargetId&&(this.oi=new tc(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,U.resolve()}updateTargetData(e,n){return this.lr(n),U.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,U.resolve()}removeTargets(e,n,a){let r=0,i=[];return this.ri.forEach((s,u)=>{u.sequenceNumber<=n&&a.get(u.targetId)===null&&(this.ri.delete(s),i.push(this.removeMatchingKeysForTargetId(e,u.targetId)),r++)}),U.waitFor(i).next(()=>r)}getTargetCount(e){return U.resolve(this.targetCount)}getTargetData(e,n){let a=this.ri.get(n)||null;return U.resolve(a)}addMatchingKeys(e,n,a){return this.si.$r(n,a),U.resolve()}removeMatchingKeys(e,n,a){this.si.Qr(n,a);let r=this.persistence.referenceDelegate,i=[];return r&&n.forEach(s=>{i.push(r.markPotentiallyOrphaned(e,s))}),U.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),U.resolve()}getMatchingKeysForTargetId(e,n){let a=this.si.jr(n);return U.resolve(a)}containsKey(e,n){return U.resolve(this.si.containsKey(n))}};var Yh=class{constructor(e,n){this._i={},this.overlays={},this.ai=new vo(0),this.ui=!1,this.ui=!0,this.ci=new oT,this.referenceDelegate=e(this),this.li=new dT(this),this.indexManager=new $I,this.remoteDocumentCache=function(r){return new lT(r)}(a=>this.referenceDelegate.hi(a)),this.serializer=new XI(n),this.Pi=new iT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new sT,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let a=this._i[e.toKey()];return a||(a=new uT(n,this.referenceDelegate),this._i[e.toKey()]=a),a}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,a){H("MemoryPersistence","Starting transaction:",e);let r=new fT(this.ai.next());return this.referenceDelegate.Ti(),a(r).next(i=>this.referenceDelegate.Ii(r).next(()=>i)).toPromise().then(i=>(r.raiseOnCommittedEvent(),i))}Ei(e,n){return U.or(Object.values(this._i).map(a=>()=>a.containsKey(e,n)))}},fT=class extends bI{constructor(e){super(),this.currentSequenceNumber=e}},hT=class t{constructor(e){this.persistence=e,this.Ri=new nc,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw Y(60996)}addReference(e,n,a){return this.Ri.addReference(a,n),this.di.delete(a.toString()),U.resolve()}removeReference(e,n,a){return this.Ri.removeReference(a,n),this.di.add(a.toString()),U.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),U.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(r=>this.di.add(r.toString()));let a=this.persistence.getTargetCache();return a.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(i=>this.di.add(i.toString()))}).next(()=>a.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){let n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return U.forEach(this.di,a=>{let r=K.fromPath(a);return this.mi(e,r).next(i=>{i||n.removeEntry(r,Z.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(a=>{a?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return U.or([()=>U.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}},Xh=class t{constructor(e,n){this.persistence=e,this.fi=new er(a=>B2(a.path),(a,r)=>a.isEqual(r)),this.garbageCollector=PU(this,n)}static Vi(e,n){return new t(e,n)}Ti(){}Ii(e){return U.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){let n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(a=>n.next(r=>a+r))}pr(e){let n=0;return this.mr(e,a=>{n++}).next(()=>n)}mr(e,n){return U.forEach(this.fi,(a,r)=>this.wr(e,a,r).next(i=>i?U.resolve():n(r)))}removeTargets(e,n,a){return this.persistence.getTargetCache().removeTargets(e,n,a)}removeOrphanedDocuments(e,n){let a=0,r=this.persistence.getRemoteDocumentCache(),i=r.newChangeBuffer();return r.ni(e,s=>this.wr(e,s,n).next(u=>{u||(a++,i.removeEntry(s,Z.min()))})).next(()=>i.apply(e)).next(()=>a)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),U.resolve()}removeTarget(e,n){let a=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,a)}addReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),U.resolve()}removeReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),U.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),U.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=xh(e.data.value)),n}wr(e,n,a){return U.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{let r=this.fi.get(n);return U.resolve(r!==void 0&&r>a)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var pT=class t{constructor(e,n,a,r){this.targetId=e,this.fromCache=n,this.Ts=a,this.Is=r}static Es(e,n){let a=le(),r=le();for(let i of n.docChanges)switch(i.type){case 0:a=a.add(i.doc.key);break;case 1:r=r.add(i.doc.key)}return new t(e,n.fromCache,a,r)}};var mT=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var gT=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return Ob()?8:U2(Se())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,a,r){let i={result:null};return this.gs(e,n).next(s=>{i.result=s}).next(()=>{if(!i.result)return this.ps(e,n,r,a).next(s=>{i.result=s})}).next(()=>{if(i.result)return;let s=new mT;return this.ys(e,n,s).next(u=>{if(i.result=u,this.As)return this.ws(e,n,s,u.size)})}).next(()=>i.result)}ws(e,n,a,r){return a.documentReadCount<this.Vs?(fo()<=ee.DEBUG&&H("QueryEngine","SDK will not create cache indexes for query:",ho(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),U.resolve()):(fo()<=ee.DEBUG&&H("QueryEngine","Query:",ho(n),"scans",a.documentReadCount,"local documents and returns",r,"documents as results."),a.documentReadCount>this.ds*r?(fo()<=ee.DEBUG&&H("QueryEngine","The SDK decides to create cache indexes for query:",ho(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ca(n))):U.resolve())}gs(e,n){if(gR(n))return U.resolve(null);let a=ca(n);return this.indexManager.getIndexType(e,a).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=Ql(n,null,"F"),a=ca(n)),this.indexManager.getDocumentsMatchingTarget(e,a).next(i=>{let s=le(...i);return this.fs.getDocuments(e,s).next(u=>this.indexManager.getMinOffset(e,a).next(l=>{let c=this.bs(n,u);return this.Ss(n,c,s,l.readTime)?this.gs(e,Ql(n,null,"F")):this.Ds(e,c,n,l)}))})))}ps(e,n,a,r){return gR(n)||r.isEqual(Z.min())?U.resolve(null):this.fs.getDocuments(e,a).next(i=>{let s=this.bs(n,i);return this.Ss(n,s,a,r)?U.resolve(null):(fo()<=ee.DEBUG&&H("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),ho(n)),this.Ds(e,s,n,P2(r,Hl)).next(u=>u))})}bs(e,n){let a=new It(wx(e));return n.forEach((r,i)=>{mp(e,i)&&(a=a.add(i))}),a}Ss(e,n,a,r){if(e.limit===null)return!1;if(a.size!==n.size)return!0;let i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(r)>0)}ys(e,n,a){return fo()<=ee.DEBUG&&H("QueryEngine","Using full collection scan to execute query:",ho(n)),this.fs.getDocumentsMatchingQuery(e,n,Ki.min(),a)}Ds(e,n,a,r){return this.fs.getDocumentsMatchingQuery(e,a,r).next(i=>(n.forEach(s=>{i=i.insert(s.key,s)}),i))}};var JT="LocalStore",OU=3e8,yT=class{constructor(e,n,a,r){this.persistence=e,this.Cs=n,this.serializer=r,this.vs=new Xe(oe),this.Fs=new er(i=>QT(i),YT),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(a)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new rT(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}};function NU(t,e,n,a){return new yT(t,e,n,a)}async function jx(t,e){let n=ce(t);return await n.persistence.runTransaction("Handle user change","readonly",a=>{let r;return n.mutationQueue.getAllMutationBatches(a).next(i=>(r=i,n.Os(e),n.mutationQueue.getAllMutationBatches(a))).next(i=>{let s=[],u=[],l=le();for(let c of r){s.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}for(let c of i){u.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}return n.localDocuments.getDocuments(a,l).next(c=>({Ns:c,removedBatchIds:s,addedBatchIds:u}))})})}function Wx(t){let e=ce(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function MU(t,e){let n=ce(t),a=e.snapshotVersion,r=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{let s=n.xs.newChangeBuffer({trackRemovals:!0});r=n.vs;let u=[];e.targetChanges.forEach((f,m)=>{let p=r.get(m);if(!p)return;u.push(n.li.removeMatchingKeys(i,f.removedDocuments,m).next(()=>n.li.addMatchingKeys(i,f.addedDocuments,m)));let _=p.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?_=_.withResumeToken(xt.EMPTY_BYTE_STRING,Z.min()).withLastLimboFreeSnapshotVersion(Z.min()):f.resumeToken.approximateByteSize()>0&&(_=_.withResumeToken(f.resumeToken,a)),r=r.insert(m,_),function(k,P,E){return k.resumeToken.approximateByteSize()===0||P.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=OU?!0:E.addedDocuments.size+E.modifiedDocuments.size+E.removedDocuments.size>0}(p,_,f)&&u.push(n.li.updateTargetData(i,_))});let l=ni(),c=le();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&u.push(n.persistence.referenceDelegate.updateLimboDocument(i,f))}),u.push(UU(i,s,e.documentUpdates).next(f=>{l=f.Bs,c=f.Ls})),!a.isEqual(Z.min())){let f=n.li.getLastRemoteSnapshotVersion(i).next(m=>n.li.setTargetsMetadata(i,i.currentSequenceNumber,a));u.push(f)}return U.waitFor(u).next(()=>s.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,l,c)).next(()=>l)}).then(i=>(n.vs=r,i))}function UU(t,e,n){let a=le(),r=le();return n.forEach(i=>a=a.add(i)),e.getEntries(t,a).next(i=>{let s=ni();return n.forEach((u,l)=>{let c=i.get(u);l.isFoundDocument()!==c.isFoundDocument()&&(r=r.add(u)),l.isNoDocument()&&l.version.isEqual(Z.min())?(e.removeEntry(u,l.readTime),s=s.insert(u,l)):!c.isValidDocument()||l.version.compareTo(c.version)>0||l.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(l),s=s.insert(u,l)):H(JT,"Ignoring outdated watch update for ",u,". Current version:",c.version," Watch version:",l.version)}),{Bs:s,Ls:r}})}function VU(t,e){let n=ce(t);return n.persistence.runTransaction("Allocate target","readwrite",a=>{let r;return n.li.getTargetData(a,e).next(i=>i?(r=i,U.resolve(r)):n.li.allocateTargetId(a).next(s=>(r=new ec(e,s,"TargetPurposeListen",a.currentSequenceNumber),n.li.addTargetData(a,r).next(()=>r))))}).then(a=>{let r=n.vs.get(a.targetId);return(r===null||a.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.vs=n.vs.insert(a.targetId,a),n.Fs.set(e,a.targetId)),a})}async function _T(t,e,n){let a=ce(t),r=a.vs.get(e),i=n?"readwrite":"readwrite-primary";try{n||await a.persistence.runTransaction("Release target",i,s=>a.persistence.referenceDelegate.removeTarget(s,r))}catch(s){if(!Mo(s))throw s;H(JT,`Failed to update sequence numbers for target ${e}: ${s}`)}a.vs=a.vs.remove(e),a.Fs.delete(r.target)}function LR(t,e,n){let a=ce(t),r=Z.min(),i=le();return a.persistence.runTransaction("Execute query","readwrite",s=>function(l,c,f){let m=ce(l),p=m.Fs.get(f);return p!==void 0?U.resolve(m.vs.get(p)):m.li.getTargetData(c,f)}(a,s,ca(e)).next(u=>{if(u)return r=u.lastLimboFreeSnapshotVersion,a.li.getMatchingKeysForTargetId(s,u.targetId).next(l=>{i=l})}).next(()=>a.Cs.getDocumentsMatchingQuery(s,e,n?r:Z.min(),n?i:le())).next(u=>(FU(a,rU(e),u),{documents:u,ks:i})))}function FU(t,e,n){let a=t.Ms.get(e)||Z.min();n.forEach((r,i)=>{i.readTime.compareTo(a)>0&&(a=i.readTime)}),t.Ms.set(e,a)}var $h=class{constructor(){this.activeTargetIds=cU()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var IT=class{constructor(){this.vo=new $h,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,a){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,a){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new $h,Promise.resolve()}handleUserChange(e,n,a){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var TT=class{Mo(e){}shutdown(){}};var RR="ConnectivityMonitor",Jh=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){H(RR,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){H(RR,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var Rh=null;function ST(){return Rh===null?Rh=function(){return 268435456+Math.round(2147483648*Math.random())}():Rh++,"0x"+Rh.toString(16)}var TI="RestConnection",BU={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},vT=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let n=e.ssl?"https":"http",a=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${a}/databases/${r}`,this.$o=this.databaseId.database===qh?`project_id=${a}`:`project_id=${a}&database_id=${r}`}Wo(e,n,a,r,i){let s=ST(),u=this.Qo(e,n.toUriEncodedString());H(TI,`Sending RPC '${e}' ${s}:`,u,a);let l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,r,i);let{host:c}=new URL(u),f=Ft(c);return this.zo(e,u,l,a,f).then(m=>(H(TI,`Received RPC '${e}' ${s}: `,m),m),m=>{throw Ya(TI,`RPC '${e}' ${s} failed with error: `,m,"url: ",u,"request:",a),m})}jo(e,n,a,r,i,s){return this.Wo(e,n,a,r,i)}Go(e,n,a){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Oo}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,i)=>e[i]=r),a&&a.headers.forEach((r,i)=>e[i]=r)}Qo(e,n){let a=BU[e],r=`${this.qo}/v1/${n}:${a}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var ET=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var Dt="WebChannelConnection",Vl=(t,e,n)=>{t.listen(e,a=>{try{n(a)}catch(r){setTimeout(()=>{throw r},0)}})},Zh=class t extends vT{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=mI();Vl(e,pI.STAT_EVENT,n=>{n.stat===Ah.PROXY?H(Dt,"STAT_EVENT: detected buffering proxy"):n.stat===Ah.NOPROXY&&H(Dt,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,n,a,r,i){let s=ST();return new Promise((u,l)=>{let c=new fI;c.setWithCredentials(!0),c.listenOnce(hI.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case Ul.NO_ERROR:let m=c.getResponseJson();H(Dt,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(m)),u(m);break;case Ul.TIMEOUT:H(Dt,`RPC '${e}' ${s} timed out`),l(new q(N.DEADLINE_EXCEEDED,"Request time out"));break;case Ul.HTTP_ERROR:let p=c.getStatus();if(H(Dt,`RPC '${e}' ${s} failed with status:`,p,"response text:",c.getResponseText()),p>0){let _=c.getResponseJson();Array.isArray(_)&&(_=_[0]);let L=_?.error;if(L&&L.status&&L.message){let k=function(E){let S=E.toLowerCase().replace(/_/g,"-");return Object.values(N).indexOf(S)>=0?S:N.UNKNOWN}(L.status);l(new q(k,L.message))}else l(new q(N.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new q(N.UNAVAILABLE,"Connection failed."));break;default:Y(9055,{l_:e,streamId:s,h_:c.getLastErrorCode(),P_:c.getLastError()})}}finally{H(Dt,`RPC '${e}' ${s} completed.`)}});let f=JSON.stringify(r);H(Dt,`RPC '${e}' ${s} sending request:`,r),c.send(n,"POST",f,a,15)})}T_(e,n,a){let r=ST(),i=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],s=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(u.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,n,a),u.encodeInitMessageHeaders=!0;let c=i.join("");H(Dt,`Creating RPC '${e}' stream ${r}: ${c}`,u);let f=s.createWebChannel(c,u);this.I_(f);let m=!1,p=!1,_=new ET({Ho:L=>{p?H(Dt,`Not sending because RPC '${e}' stream ${r} is closed:`,L):(m||(H(Dt,`Opening RPC '${e}' stream ${r} transport.`),f.open(),m=!0),H(Dt,`RPC '${e}' stream ${r} sending:`,L),f.send(L))},Jo:()=>f.close()});return Vl(f,co.EventType.OPEN,()=>{p||(H(Dt,`RPC '${e}' stream ${r} transport opened.`),_.i_())}),Vl(f,co.EventType.CLOSE,()=>{p||(p=!0,H(Dt,`RPC '${e}' stream ${r} transport closed`),_.o_(),this.E_(f))}),Vl(f,co.EventType.ERROR,L=>{p||(p=!0,Ya(Dt,`RPC '${e}' stream ${r} transport errored. Name:`,L.name,"Message:",L.message),_.o_(new q(N.UNAVAILABLE,"The operation could not be completed")))}),Vl(f,co.EventType.MESSAGE,L=>{if(!p){let k=L.data[0];Ue(!!k,16349);let P=k,E=P?.error||P[0]?.error;if(E){H(Dt,`RPC '${e}' stream ${r} received error:`,E);let S=E.status,A=function(M){let T=tt[M];if(T!==void 0)return Px(T)}(S),x=E.message;S==="NOT_FOUND"&&x.includes("database")&&x.includes("does not exist")&&x.includes(this.databaseId.database)&&Ya(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),A===void 0&&(A=N.INTERNAL,x="Unknown error status: "+S+" with message "+E.message),p=!0,_.o_(new q(A,x)),f.close()}else H(Dt,`RPC '${e}' stream ${r} received:`,k),_.__(k)}}),t.u_(),setTimeout(()=>{_.s_()},0),_}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,a){super.Go(e,n,a),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return gI()}};function qU(t){return new Zh(t)}function SI(){return typeof document<"u"?document:null}function dc(t){return new WI(t,!0)}Zh.c_=!1;var ep=class{constructor(e,n,a=1e3,r=1.5,i=6e4){this.Ci=e,this.timerId=n,this.R_=a,this.A_=r,this.V_=i,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let n=Math.floor(this.d_+this.y_()),a=Math.max(0,Date.now()-this.f_),r=Math.max(0,n-a);r>0&&H("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${a} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var xR="PersistentStream",wT=class{constructor(e,n,a,r,i,s,u,l){this.Ci=e,this.b_=a,this.S_=r,this.connection=i,this.authCredentialsProvider=s,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new ep(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===N.RESOURCE_EXHAUSTED?(Qa(n.toString()),Qa("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===N.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([a,r])=>{this.D_===n&&this.G_(a,r)},a=>{e(()=>{let r=new q(N.UNKNOWN,"Fetching auth token failed: "+a.message);return this.z_(r)})})}G_(e,n){let a=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{a(()=>this.listener.Zo())}),this.stream.Yo(()=>{a(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{a(()=>this.z_(r))}),this.stream.onMessage(r=>{a(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return H(xR,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():(H(xR,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},CT=class extends wT{constructor(e,n,a,r,i,s){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,a,r,s),this.serializer=i}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let n=wU(this.serializer,e),a=function(i){if(!("targetChange"in i))return Z.min();let s=i.targetChange;return s.targetIds&&s.targetIds.length?Z.min():s.readTime?Io(s.readTime):Z.min()}(e);return this.listener.J_(n,a)}Z_(e){let n={};n.database=wR(this.serializer),n.addTarget=function(i,s){let u,l=s.target;if(u=BI(l)?{documents:CU(i,l)}:{query:AU(i,l).ft},u.targetId=s.targetId,s.resumeToken.approximateByteSize()>0){u.resumeToken=Ox(i,s.resumeToken);let c=KI(i,s.expectedCount);c!==null&&(u.expectedCount=c)}else if(s.snapshotVersion.compareTo(Z.min())>0){u.readTime=QI(i,s.snapshotVersion.toTimestamp());let c=KI(i,s.expectedCount);c!==null&&(u.expectedCount=c)}return u}(this.serializer,e);let a=LU(this.serializer,e);a&&(n.labels=a),this.K_(n)}X_(e){let n={};n.database=wR(this.serializer),n.removeTarget=e,this.K_(n)}};var AT=class{},bT=class extends AT{constructor(e,n,a,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=a,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new q(N.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,a,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,s])=>this.connection.Wo(e,YI(n,a),r,i,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new q(N.UNKNOWN,i.toString())})}jo(e,n,a,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,u])=>this.connection.jo(e,YI(n,a),r,s,u,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new q(N.UNKNOWN,s.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function zU(t,e,n,a){return new bT(t,e,n,a)}var LT=class{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Qa(n),this.aa=!1):H("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var xo="RemoteStore",RT=class{constructor(e,n,a,r,i){this.localStore=e,this.datastore=n,this.asyncQueue=a,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=i,this.Aa.Mo(s=>{a.enqueueAndForget(async()=>{hc(this)&&(H(xo,"Restarting streams for network reachability change."),await async function(l){let c=ce(l);c.Ea.add(4),await fc(c),c.Va.set("Unknown"),c.Ea.delete(4),await gp(c)}(this))})}),this.Va=new LT(a,r)}};async function gp(t){if(hc(t))for(let e of t.Ra)await e(!0)}async function fc(t){for(let e of t.Ra)await e(!1)}function Kx(t,e){let n=ce(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),nS(n)?tS(n):Vo(n).O_()&&eS(n,e))}function ZT(t,e){let n=ce(t),a=Vo(n);n.Ia.delete(e),a.O_()&&Qx(n,e),n.Ia.size===0&&(a.O_()?a.L_():hc(n)&&n.Va.set("Unknown"))}function eS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(Z.min())>0){let n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Vo(t).Z_(e)}function Qx(t,e){t.da.$e(e),Vo(t).X_(e)}function tS(t){t.da=new jI({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),Vo(t).start(),t.Va.ua()}function nS(t){return hc(t)&&!Vo(t).x_()&&t.Ia.size>0}function hc(t){return ce(t).Ea.size===0}function Yx(t){t.da=void 0}async function HU(t){t.Va.set("Online")}async function GU(t){t.Ia.forEach((e,n)=>{eS(t,e)})}async function jU(t,e){Yx(t),nS(t)?(t.Va.ha(e),tS(t)):t.Va.set("Unknown")}async function WU(t,e,n){if(t.Va.set("Online"),e instanceof Wh&&e.state===2&&e.cause)try{await async function(r,i){let s=i.cause;for(let u of i.targetIds)r.Ia.has(u)&&(await r.remoteSyncer.rejectListen(u,s),r.Ia.delete(u),r.da.removeTarget(u))}(t,e)}catch(a){H(xo,"Failed to remove targets %s: %s ",e.targetIds.join(","),a),await kR(t,a)}else if(e instanceof _o?t.da.Xe(e):e instanceof jh?t.da.st(e):t.da.tt(e),!n.isEqual(Z.min()))try{let a=await Wx(t.localStore);n.compareTo(a)>=0&&await function(i,s){let u=i.da.Tt(s);return u.targetChanges.forEach((l,c)=>{if(l.resumeToken.approximateByteSize()>0){let f=i.Ia.get(c);f&&i.Ia.set(c,f.withResumeToken(l.resumeToken,s))}}),u.targetMismatches.forEach((l,c)=>{let f=i.Ia.get(l);if(!f)return;i.Ia.set(l,f.withResumeToken(xt.EMPTY_BYTE_STRING,f.snapshotVersion)),Qx(i,l);let m=new ec(f.target,l,c,f.sequenceNumber);eS(i,m)}),i.remoteSyncer.applyRemoteEvent(u)}(t,n)}catch(a){H(xo,"Failed to raise snapshot:",a),await kR(t,a)}}async function kR(t,e,n){if(!Mo(e))throw e;t.Ea.add(1),await fc(t),t.Va.set("Offline"),n||(n=()=>Wx(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{H(xo,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await gp(t)})}async function DR(t,e){let n=ce(t);n.asyncQueue.verifyOperationInProgress(),H(xo,"RemoteStore received new credentials");let a=hc(n);n.Ea.add(3),await fc(n),a&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await gp(n)}async function KU(t,e){let n=ce(t);e?(n.Ea.delete(2),await gp(n)):e||(n.Ea.add(2),await fc(n),n.Va.set("Unknown"))}function Vo(t){return t.ma||(t.ma=function(n,a,r){let i=ce(n);return i.sa(),new CT(a,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,r)}(t.datastore,t.asyncQueue,{Zo:HU.bind(null,t),Yo:GU.bind(null,t),t_:jU.bind(null,t),J_:WU.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),nS(t)?tS(t):t.Va.set("Unknown")):(await t.ma.stop(),Yx(t))})),t.ma}var xT=class t{constructor(e,n,a,r,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=a,this.op=r,this.removalCallback=i,this.deferred=new Wa,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(s=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,a,r,i){let s=Date.now()+a,u=new t(e,n,s,r,i);return u.start(a),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new q(N.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function Xx(t,e){if(Qa("AsyncQueue",`${e}: ${t}`),Mo(t))return new q(N.UNAVAILABLE,`${e}: ${t}`);throw t}var ac=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(n,a)=>e(n,a)||K.comparator(n.key,a.key):(n,a)=>K.comparator(n.key,a.key),this.keyedMap=Fl(),this.sortedSet=new Xe(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,a)=>(e(n),!1))}add(e){let n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){let n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.sortedSet.getIterator(),a=e.sortedSet.getIterator();for(;n.hasNext();){let r=n.getNext().key,i=a.getNext().key;if(!r.isEqual(i))return!1}return!0}toString(){let e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){let a=new t;return a.comparator=this.comparator,a.keyedMap=e,a.sortedSet=n,a}};var tp=class{constructor(){this.ga=new Xe(K.comparator)}track(e){let n=e.doc.key,a=this.ga.get(n);a?e.type!==0&&a.type===3?this.ga=this.ga.insert(n,e):e.type===3&&a.type!==1?this.ga=this.ga.insert(n,{type:a.type,doc:e.doc}):e.type===2&&a.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&a.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&a.type===0?this.ga=this.ga.remove(n):e.type===1&&a.type===2?this.ga=this.ga.insert(n,{type:1,doc:a.doc}):e.type===0&&a.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):Y(63341,{Vt:e,pa:a}):this.ga=this.ga.insert(n,e)}ya(){let e=[];return this.ga.inorderTraversal((n,a)=>{e.push(a)}),e}},Qi=class t{constructor(e,n,a,r,i,s,u,l,c){this.query=e,this.docs=n,this.oldDocs=a,this.docChanges=r,this.mutatedKeys=i,this.fromCache=s,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=c}static fromInitialDocuments(e,n,a,r,i){let s=[];return n.forEach(u=>{s.push({type:0,doc:u})}),new t(e,n,ac.emptySet(n),s,a,r,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&pp(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let n=this.docChanges,a=e.docChanges;if(n.length!==a.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==a[r].type||!n[r].doc.isEqual(a[r].doc))return!1;return!0}};var kT=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},DT=class{constructor(){this.queries=PR(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,a){let r=ce(n),i=r.queries;r.queries=PR(),i.forEach((s,u)=>{for(let l of u.ba)l.onError(a)})})(this,new q(N.ABORTED,"Firestore shutting down"))}};function PR(){return new er(t=>Ex(t),pp)}async function QU(t,e){let n=ce(t),a=3,r=e.query,i=n.queries.get(r);i?!i.Sa()&&e.Da()&&(a=2):(i=new kT,a=e.Da()?0:1);try{switch(a){case 0:i.wa=await n.onListen(r,!0);break;case 1:i.wa=await n.onListen(r,!1);break;case 2:await n.onFirstRemoteStoreListen(r)}}catch(s){let u=Xx(s,`Initialization of query '${ho(e.query)}' failed`);return void e.onError(u)}n.queries.set(r,i),i.ba.push(e),e.va(n.onlineState),i.wa&&e.Fa(i.wa)&&aS(n)}async function YU(t,e){let n=ce(t),a=e.query,r=3,i=n.queries.get(a);if(i){let s=i.ba.indexOf(e);s>=0&&(i.ba.splice(s,1),i.ba.length===0?r=e.Da()?0:1:!i.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return n.queries.delete(a),n.onUnlisten(a,!0);case 1:return n.queries.delete(a),n.onUnlisten(a,!1);case 2:return n.onLastRemoteStoreUnlisten(a);default:return}}function XU(t,e){let n=ce(t),a=!1;for(let r of e){let i=r.query,s=n.queries.get(i);if(s){for(let u of s.ba)u.Fa(r)&&(a=!0);s.wa=r}}a&&aS(n)}function $U(t,e,n){let a=ce(t),r=a.queries.get(e);if(r)for(let i of r.ba)i.onError(n);a.queries.delete(e)}function aS(t){t.Ca.forEach(e=>{e.next()})}var PT,OR;(OR=PT||(PT={})).Ma="default",OR.Cache="cache";var OT=class{constructor(e,n,a){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=a||{}}Fa(e){if(!this.options.includeMetadataChanges){let a=[];for(let r of e.docChanges)r.type!==3&&a.push(r);e=new Qi(e.query,e.docs,e.oldDocs,a,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;let a=n!=="Offline";return(!this.options.Ka||!a)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=Qi.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==PT.Cache}};var np=class{constructor(e){this.key=e}},ap=class{constructor(e){this.key=e}},NT=class{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=le(),this.mutatedKeys=le(),this.eu=wx(e),this.tu=new ac(this.eu)}get nu(){return this.Za}ru(e,n){let a=n?n.iu:new tp,r=n?n.tu:this.tu,i=n?n.mutatedKeys:this.mutatedKeys,s=r,u=!1,l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,c=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((f,m)=>{let p=r.get(f),_=mp(this.query,m)?m:null,L=!!p&&this.mutatedKeys.has(p.key),k=!!_&&(_.hasLocalMutations||this.mutatedKeys.has(_.key)&&_.hasCommittedMutations),P=!1;p&&_?p.data.isEqual(_.data)?L!==k&&(a.track({type:3,doc:_}),P=!0):this.su(p,_)||(a.track({type:2,doc:_}),P=!0,(l&&this.eu(_,l)>0||c&&this.eu(_,c)<0)&&(u=!0)):!p&&_?(a.track({type:0,doc:_}),P=!0):p&&!_&&(a.track({type:1,doc:p}),P=!0,(l||c)&&(u=!0)),P&&(_?(s=s.add(_),i=k?i.add(f):i.delete(f)):(s=s.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;s.size>this.query.limit;){let f=this.query.limitType==="F"?s.last():s.first();s=s.delete(f.key),i=i.delete(f.key),a.track({type:1,doc:f})}return{tu:s,iu:a,Ss:u,mutatedKeys:i}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,a,r){let i=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let s=e.iu.ya();s.sort((f,m)=>function(_,L){let k=P=>{switch(P){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Y(20277,{Vt:P})}};return k(_)-k(L)}(f.type,m.type)||this.eu(f.doc,m.doc)),this.ou(a),r=r??!1;let u=n&&!r?this._u():[],l=this.Ya.size===0&&this.current&&!r?1:0,c=l!==this.Xa;return this.Xa=l,s.length!==0||c?{snapshot:new Qi(this.query,e.tu,i,s,e.mutatedKeys,l===0,c,!1,!!a&&a.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new tp,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=le(),this.tu.forEach(a=>{this.uu(a.key)&&(this.Ya=this.Ya.add(a.key))});let n=[];return e.forEach(a=>{this.Ya.has(a)||n.push(new ap(a))}),this.Ya.forEach(a=>{e.has(a)||n.push(new np(a))}),n}cu(e){this.Za=e.ks,this.Ya=le();let n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return Qi.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},rS="SyncEngine",MT=class{constructor(e,n,a){this.query=e,this.targetId=n,this.view=a}},UT=class{constructor(e){this.key=e,this.hu=!1}},VT=class{constructor(e,n,a,r,i,s){this.localStore=e,this.remoteStore=n,this.eventManager=a,this.sharedClientState=r,this.currentUser=i,this.maxConcurrentLimboResolutions=s,this.Pu={},this.Tu=new er(u=>Ex(u),pp),this.Iu=new Map,this.Eu=new Set,this.Ru=new Xe(K.comparator),this.Au=new Map,this.Vu=new nc,this.du={},this.mu=new Map,this.fu=tc.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function JU(t,e,n=!0){let a=t0(t),r,i=a.Tu.get(e);return i?(a.sharedClientState.addLocalQueryTarget(i.targetId),r=i.view.lu()):r=await $x(a,e,n,!0),r}async function ZU(t,e){let n=t0(t);await $x(n,e,!0,!1)}async function $x(t,e,n,a){let r=await VU(t.localStore,ca(e)),i=r.targetId,s=t.sharedClientState.addLocalQueryTarget(i,n),u;return a&&(u=await eV(t,e,i,s==="current",r.resumeToken)),t.isPrimaryClient&&n&&Kx(t.remoteStore,r),u}async function eV(t,e,n,a,r){t.pu=(m,p,_)=>async function(k,P,E,S){let A=P.view.ru(E);A.Ss&&(A=await LR(k.localStore,P.query,!1).then(({documents:T})=>P.view.ru(T,A)));let x=S&&S.targetChanges.get(P.targetId),V=S&&S.targetMismatches.get(P.targetId)!=null,M=P.view.applyChanges(A,k.isPrimaryClient,x,V);return MR(k,P.targetId,M.au),M.snapshot}(t,m,p,_);let i=await LR(t.localStore,e,!0),s=new NT(e,i.ks),u=s.ru(i.documents),l=Zl.createSynthesizedTargetChangeForCurrentChange(n,a&&t.onlineState!=="Offline",r),c=s.applyChanges(u,t.isPrimaryClient,l);MR(t,n,c.au);let f=new MT(e,n,s);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),c.snapshot}async function tV(t,e,n){let a=ce(t),r=a.Tu.get(e),i=a.Iu.get(r.targetId);if(i.length>1)return a.Iu.set(r.targetId,i.filter(s=>!pp(s,e))),void a.Tu.delete(e);a.isPrimaryClient?(a.sharedClientState.removeLocalQueryTarget(r.targetId),a.sharedClientState.isActiveQueryTarget(r.targetId)||await _T(a.localStore,r.targetId,!1).then(()=>{a.sharedClientState.clearQueryState(r.targetId),n&&ZT(a.remoteStore,r.targetId),FT(a,r.targetId)}).catch(lp)):(FT(a,r.targetId),await _T(a.localStore,r.targetId,!0))}async function nV(t,e){let n=ce(t),a=n.Tu.get(e),r=n.Iu.get(a.targetId);n.isPrimaryClient&&r.length===1&&(n.sharedClientState.removeLocalQueryTarget(a.targetId),ZT(n.remoteStore,a.targetId))}async function Jx(t,e){let n=ce(t);try{let a=await MU(n.localStore,e);e.targetChanges.forEach((r,i)=>{let s=n.Au.get(i);s&&(Ue(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?s.hu=!0:r.modifiedDocuments.size>0?Ue(s.hu,14607):r.removedDocuments.size>0&&(Ue(s.hu,42227),s.hu=!1))}),await e0(n,a,e)}catch(a){await lp(a)}}function NR(t,e,n){let a=ce(t);if(a.isPrimaryClient&&n===0||!a.isPrimaryClient&&n===1){let r=[];a.Tu.forEach((i,s)=>{let u=s.view.va(e);u.snapshot&&r.push(u.snapshot)}),function(s,u){let l=ce(s);l.onlineState=u;let c=!1;l.queries.forEach((f,m)=>{for(let p of m.ba)p.va(u)&&(c=!0)}),c&&aS(l)}(a.eventManager,e),r.length&&a.Pu.J_(r),a.onlineState=e,a.isPrimaryClient&&a.sharedClientState.setOnlineState(e)}}async function aV(t,e,n){let a=ce(t);a.sharedClientState.updateQueryState(e,"rejected",n);let r=a.Au.get(e),i=r&&r.key;if(i){let s=new Xe(K.comparator);s=s.insert(i,Bn.newNoDocument(i,Z.min()));let u=le().add(i),l=new Gh(Z.min(),new Map,new Xe(oe),s,u);await Jx(a,l),a.Ru=a.Ru.remove(i),a.Au.delete(e),iS(a)}else await _T(a.localStore,e,!1).then(()=>FT(a,e,n)).catch(lp)}function FT(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(let a of t.Iu.get(e))t.Tu.delete(a),n&&t.Pu.yu(a,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(a=>{t.Vu.containsKey(a)||Zx(t,a)})}function Zx(t,e){t.Eu.delete(e.path.canonicalString());let n=t.Ru.get(e);n!==null&&(ZT(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),iS(t))}function MR(t,e,n){for(let a of n)a instanceof np?(t.Vu.addReference(a.key,e),rV(t,a)):a instanceof ap?(H(rS,"Document no longer in limbo: "+a.key),t.Vu.removeReference(a.key,e),t.Vu.containsKey(a.key)||Zx(t,a.key)):Y(19791,{wu:a})}function rV(t,e){let n=e.key,a=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(a)||(H(rS,"New document in limbo: "+n),t.Eu.add(a),iS(t))}function iS(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let n=new K(Ne.fromString(e)),a=t.fu.next();t.Au.set(a,new UT(n)),t.Ru=t.Ru.insert(n,a),Kx(t.remoteStore,new ec(ca(XT(n.path)),a,"TargetPurposeLimboResolution",vo.ce))}}async function e0(t,e,n){let a=ce(t),r=[],i=[],s=[];a.Tu.isEmpty()||(a.Tu.forEach((u,l)=>{s.push(a.pu(l,e,n).then(c=>{if((c||n)&&a.isPrimaryClient){let f=c?!c.fromCache:n?.targetChanges.get(l.targetId)?.current;a.sharedClientState.updateQueryState(l.targetId,f?"current":"not-current")}if(c){r.push(c);let f=pT.Es(l.targetId,c);i.push(f)}}))}),await Promise.all(s),a.Pu.J_(r),await async function(l,c){let f=ce(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>U.forEach(c,p=>U.forEach(p.Ts,_=>f.persistence.referenceDelegate.addReference(m,p.targetId,_)).next(()=>U.forEach(p.Is,_=>f.persistence.referenceDelegate.removeReference(m,p.targetId,_)))))}catch(m){if(!Mo(m))throw m;H(JT,"Failed to update sequence numbers: "+m)}for(let m of c){let p=m.targetId;if(!m.fromCache){let _=f.vs.get(p),L=_.snapshotVersion,k=_.withLastLimboFreeSnapshotVersion(L);f.vs=f.vs.insert(p,k)}}}(a.localStore,i))}async function iV(t,e){let n=ce(t);if(!n.currentUser.isEqual(e)){H(rS,"User change. New user:",e.toKey());let a=await jx(n.localStore,e);n.currentUser=e,function(i,s){i.mu.forEach(u=>{u.forEach(l=>{l.reject(new q(N.CANCELLED,s))})}),i.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,a.removedBatchIds,a.addedBatchIds),await e0(n,a.Ns)}}function sV(t,e){let n=ce(t),a=n.Au.get(e);if(a&&a.hu)return le().add(a.key);{let r=le(),i=n.Iu.get(e);if(!i)return r;for(let s of i){let u=n.Tu.get(s);r=r.unionWith(u.view.nu)}return r}}function t0(t){let e=ce(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=Jx.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=sV.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=aV.bind(null,e),e.Pu.J_=XU.bind(null,e.eventManager),e.Pu.yu=$U.bind(null,e.eventManager),e}var Yi=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=dc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return NU(this.persistence,new gT,e.initialUser,this.serializer)}Cu(e){return new Yh(hT.Vi,this.serializer)}Du(e){return new IT}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};Yi.provider={build:()=>new Yi};var rp=class extends Yi{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){Ue(this.persistence.referenceDelegate instanceof Xh,46915);let a=this.persistence.referenceDelegate.garbageCollector;return new eT(a,e.asyncQueue,n)}Cu(e){let n=this.cacheSizeBytes!==void 0?Rn.withCacheSize(this.cacheSizeBytes):Rn.DEFAULT;return new Yh(a=>Xh.Vi(a,n),this.serializer)}};var ko=class{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=a=>NR(this.syncEngine,a,1),this.remoteStore.remoteSyncer.handleCredentialChange=iV.bind(null,this.syncEngine),await KU(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new DT}()}createDatastore(e){let n=dc(e.databaseInfo.databaseId),a=qU(e.databaseInfo);return zU(e.authCredentials,e.appCheckCredentials,a,n)}createRemoteStore(e){return function(a,r,i,s,u){return new RT(a,r,i,s,u)}(this.localStore,this.datastore,e.asyncQueue,n=>NR(this.syncEngine,n,0),function(){return Jh.v()?new Jh:new TT}())}createSyncEngine(e,n){return function(r,i,s,u,l,c,f){let m=new VT(r,i,s,u,l,c);return f&&(m.gu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){await async function(n){let a=ce(n);H(xo,"RemoteStore shutting down."),a.Ea.add(5),await fc(a),a.Aa.shutdown(),a.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};ko.provider={build:()=>new ko};var BT=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):Qa("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}};var ai="FirestoreClient",qT=class{constructor(e,n,a,r,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=a,this._databaseInfo=r,this.user=_t.UNAUTHENTICATED,this.clientId=To.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(a,async s=>{H(ai,"Received user=",s.uid),await this.authCredentialListener(s),this.user=s}),this.appCheckCredentials.start(a,s=>(H(ai,"Received new app check token=",s),this.appCheckCredentialListener(s,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new Wa;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){let a=Xx(n,"Failed to shutdown persistence");e.reject(a)}}),e.promise}};async function vI(t,e){t.asyncQueue.verifyOperationInProgress(),H(ai,"Initializing OfflineComponentProvider");let n=t.configuration;await e.initialize(n);let a=n.initialUser;t.setCredentialChangeListener(async r=>{a.isEqual(r)||(await jx(e.localStore,r),a=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function UR(t,e){t.asyncQueue.verifyOperationInProgress();let n=await oV(t);H(ai,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(a=>DR(e.remoteStore,a)),t.setAppCheckTokenChangeListener((a,r)=>DR(e.remoteStore,r)),t._onlineComponents=e}async function oV(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){H(ai,"Using user provided OfflineComponentProvider");try{await vI(t,t._uninitializedComponentsProvider._offline)}catch(e){let n=e;if(!function(r){return r.name==="FirebaseError"?r.code===N.FAILED_PRECONDITION||r.code===N.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(n))throw n;Ya("Error using user provided cache. Falling back to memory cache: "+n),await vI(t,new Yi)}}else H(ai,"Using default OfflineComponentProvider"),await vI(t,new rp(void 0));return t._offlineComponents}async function uV(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(H(ai,"Using user provided OnlineComponentProvider"),await UR(t,t._uninitializedComponentsProvider._online)):(H(ai,"Using default OnlineComponentProvider"),await UR(t,new ko))),t._onlineComponents}async function lV(t){let e=await uV(t),n=e.eventManager;return n.onListen=JU.bind(null,e.syncEngine),n.onUnlisten=tV.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=ZU.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=nV.bind(null,e.syncEngine),n}function n0(t,e,n={}){let a=new Wa;return t.asyncQueue.enqueueAndForget(async()=>function(i,s,u,l,c){let f=new BT({next:p=>{f.Nu(),s.enqueueAndForget(()=>YU(i,m)),p.fromCache&&l.source==="server"?c.reject(new q(N.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(p)},error:p=>c.reject(p)}),m=new OT(u,f,{includeMetadataChanges:!0,Ka:!0});return QU(i,m)}(await lV(t),t.asyncQueue,e,n,a)),a.promise}function a0(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var cV="ComponentProvider",VR=new Map;function dV(t,e,n,a,r){return new LI(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,a0(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,a)}var r0="firestore.googleapis.com",FR=!0,ip=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new q(N.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=r0,this.ssl=FR}else this.host=e.host,this.ssl=e.ssl??FR;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Gx;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<DU)throw new q(N.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}GR("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=a0(e.experimentalLongPollingOptions??{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new q(N.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new q(N.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new q(N.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(a,r){return a.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},rc=class{constructor(e,n,a,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=a,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ip({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new q(N.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new q(N.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ip(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(a){if(!a)return new Ph;switch(a.type){case"firstParty":return new CI(a.sessionIndex||"0",a.iamToken||null,a.authTokenFactory||null);case"provider":return a.client;default:throw new q(N.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){let a=VR.get(n);a&&(H(cV,"Removing Datastore"),VR.delete(n),a.terminate())}(this),Promise.resolve()}};function i0(t,e,n,a={}){t=uc(t,rc);let r=Ft(e),i=t._getSettings(),s={...i,emulatorOptions:t._getEmulatorOptions()},u=`${e}:${n}`;r&&(Yr(`https://${u}`),Xr("Firestore",!0)),i.host!==r0&&i.host!==u&&Ya("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...i,host:u,ssl:r,emulatorOptions:a};if(!Bt(l,s)&&(t._setSettings(l),a.mockUserToken)){let c,f;if(typeof a.mockUserToken=="string")c=a.mockUserToken,f=_t.MOCK_USER;else{c=Gf(a.mockUserToken,t._app?.options.projectId);let m=a.mockUserToken.sub||a.mockUserToken.user_id;if(!m)throw new q(N.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new _t(m)}t._authCredentials=new EI(new Dh(c,f))}}var qn=class t{constructor(e,n,a){this.converter=n,this._query=a,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},Xt=class t{constructor(e,n,a){this.converter=n,this._key=a,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ji(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,a){if(No(n,t._jsonSchema))return new t(e,a||null,new K(Ne.fromString(n.referencePath)))}};Xt._jsonSchemaVersion="firestore/documentReference/1.0",Xt._jsonSchema={type:Ye("string",Xt._jsonSchemaVersion),referencePath:Ye("string")};var ji=class t extends qn{constructor(e,n,a){super(e,n,XT(a)),this._path=a,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new Xt(this.firestore,null,new K(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function pc(t,e,...n){if(t=Ce(t),D2("collection","path",e),t instanceof rc){let a=Ne.fromString(e,...n);return rR(a),new ji(t,null,a)}{if(!(t instanceof Xt||t instanceof ji))throw new q(N.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let a=t._path.child(Ne.fromString(e,...n));return rR(a),new ji(t.firestore,null,a)}}var BR="AsyncQueue",sp=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new ep(this,"async_queue_retry"),this._c=()=>{let a=SI();a&&H(BR,"Visibility state changed to "+a.visibilityState),this.M_.w_()},this.ac=e;let n=SI();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let n=SI();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let n=new Wa;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!Mo(e))throw e;H(BR,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let n=this.ac.then(()=>(this.rc=!0,e().catch(a=>{throw this.nc=a,this.rc=!1,Qa("INTERNAL UNHANDLED ERROR: ",qR(a)),a}).then(a=>(this.rc=!1,a))));return this.ac=n,n}enqueueAfterDelay(e,n,a){this.uc(),this.oc.indexOf(e)>-1&&(n=0);let r=xT.createAndSchedule(this,e,n,a,i=>this.hc(i));return this.tc.push(r),r}uc(){this.nc&&Y(47125,{Pc:qR(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,a)=>n.targetTimeMs-a.targetTimeMs);for(let n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let n=this.tc.indexOf(e);this.tc.splice(n,1)}};function qR(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var Do=class extends rc{constructor(e,n,a,r){super(e,n,a,r),this.type="firestore",this._queue=new sp,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new sp(e),this._firestoreClient=void 0,await e}}};function mc(t,e){let n=typeof t=="object"?t:Jr(),a=typeof t=="string"?t:e||qh,r=Un(n,"firestore").getImmediate({identifier:a});if(!r._initialized){let i=Hf("firestore");i&&i0(r,...i)}return r}function sS(t){if(t._terminated)throw new q(N.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||fV(t),t._firestoreClient}function fV(t){let e=t._freezeSettings(),n=dV(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new qT(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(r){let i=r?._online.build();return{_offline:r?._offline.build(i),_online:i}}(t._componentsProvider))}var da=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(xt.fromBase64String(e))}catch(n){throw new q(N.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new t(xt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(No(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};da._jsonSchemaVersion="firestore/bytes/1.0",da._jsonSchema={type:Ye("string",da._jsonSchemaVersion),bytes:Ye("string")};var Po=class{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new q(N.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new hn(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var ic=class{constructor(e){this._methodName=e}};var Ka=class t{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new q(N.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new q(N.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return oe(this._lat,e._lat)||oe(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(No(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};Ka._jsonSchemaVersion="firestore/geoPoint/1.0",Ka._jsonSchema={type:Ye("string",Ka._jsonSchemaVersion),latitude:Ye("number"),longitude:Ye("number")};var fa=class t{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(a,r){if(a.length!==r.length)return!1;for(let i=0;i<a.length;++i)if(a[i]!==r[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(No(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new t(e.vectorValues);throw new q(N.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};fa._jsonSchemaVersion="firestore/vectorValue/1.0",fa._jsonSchema={type:Ye("string",fa._jsonSchemaVersion),vectorValues:Ye("object")};var hV=/^__.*__$/;function s0(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Y(40011,{dataSource:t})}}var zT=class t{constructor(e,n,a,r,i,s){this.settings=e,this.databaseId=n,this.serializer=a,this.ignoreUndefinedProperties=r,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=s||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePathSegment(e),a}childContextForFieldPath(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePath(),a}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return op(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(s0(this.dataSource)&&hV.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},HT=class{constructor(e,n,a){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=a||dc(e)}createContext(e,n,a,r=!1){return new zT({dataSource:e,methodName:n,targetDoc:a,path:hn.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function oS(t){let e=t._freezeSettings(),n=dc(t._databaseId);return new HT(t._databaseId,!!e.ignoreUndefinedProperties,n)}function uS(t,e,n,a=!1){return lS(n,t.createContext(a?4:3,e))}function lS(t,e){if(o0(t=Ce(t)))return mV("Unsupported field value:",e,t),pV(t,e);if(t instanceof ic)return function(a,r){if(!s0(r.dataSource))throw r.createError(`${a._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${a._methodName}() is not currently supported inside arrays`);let i=a._toFieldTransform(r);i&&r.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(a,r){let i=[],s=0;for(let u of a){let l=lS(u,r.childContextForArray(s));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),s++}return{arrayValue:{values:i}}}(t,e)}return function(a,r){if((a=Ce(a))===null)return{nullValue:"NULL_VALUE"};if(typeof a=="number")return dU(r.serializer,a);if(typeof a=="boolean")return{booleanValue:a};if(typeof a=="string")return{stringValue:a};if(a instanceof Date){let i=at.fromDate(a);return{timestampValue:QI(r.serializer,i)}}if(a instanceof at){let i=new at(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:QI(r.serializer,i)}}if(a instanceof Ka)return{geoPointValue:{latitude:a.latitude,longitude:a.longitude}};if(a instanceof da)return{bytesValue:Ox(r.serializer,a._byteString)};if(a instanceof Xt){let i=r.databaseId,s=a.firestore._databaseId;if(!s.isEqual(i))throw r.createError(`Document reference is for database ${s.projectId}/${s.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Nx(a.firestore._databaseId||r.databaseId,a._key.path)}}if(a instanceof fa)return function(s,u){let l=s instanceof fa?s.toArray():s;return{mapValue:{fields:{[jT]:{stringValue:WT},[Eo]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw u.createError("VectorValues must only contain numeric values.");return $T(u.serializer,f)})}}}}}}(a,r);if(zx(a))return a._toProto(r.serializer);throw r.createError(`Unsupported field value: ${oc(a)}`)}(t,e)}function pV(t,e){let n={};return ox(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Uo(t,(a,r)=>{let i=lS(r,e.childContextForField(a));i!=null&&(n[a]=i)}),{mapValue:{fields:n}}}function o0(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof at||t instanceof Ka||t instanceof da||t instanceof Xt||t instanceof ic||t instanceof fa||zx(t))}function mV(t,e,n){if(!o0(n)||!jR(n)){let a=oc(n);throw a==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+a)}}function gc(t,e,n){if((e=Ce(e))instanceof Po)return e._internalPath;if(typeof e=="string")return u0(t,e);throw op("Field path arguments must be of type string or ",t,!1,void 0,n)}var gV=new RegExp("[~\\*/\\[\\]]");function u0(t,e,n){if(e.search(gV)>=0)throw op(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Po(...e.split("."))._internalPath}catch{throw op(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function op(t,e,n,a,r){let i=a&&!a.isEmpty(),s=r!==void 0,u=`Function ${e}() called with invalid data`;n&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(i||s)&&(l+=" (found",i&&(l+=` in field ${a}`),s&&(l+=` in document ${r}`),l+=")"),new q(N.INVALID_ARGUMENT,u+t+l)}var sc=class{convertValue(e,n="none"){switch(ei(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Oe(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes($a(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw Y(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){let a={};return Uo(e,(r,i)=>{a[r]=this.convertValue(i,n)}),a}convertVectorValue(e){let n=e.fields?.[Eo].arrayValue?.values?.map(a=>Oe(a.doubleValue));return new fa(n)}convertGeoPoint(e){return new Ka(Oe(e.latitude),Oe(e.longitude))}convertArray(e,n){return(e.values||[]).map(a=>this.convertValue(a,n))}convertServerTimestamp(e,n){switch(n){case"previous":let a=dp(e);return a==null?null:this.convertValue(a,n);case"estimate":return this.convertTimestamp(jl(e));default:return null}}convertTimestamp(e){let n=Xa(e);return new at(n.seconds,n.nanos)}convertDocumentKey(e,n){let a=Ne.fromString(e);Ue(qx(a),9688,{name:e});let r=new Wl(a.get(1),a.get(3)),i=new K(a.popFirst(5));return r.isEqual(n)||Qa(`Document ${i} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}};var up=class extends sc{constructor(e){super(),this.firestore=e}convertBytes(e){return new da(e)}convertReference(e){let n=this.convertDocumentKey(e,this.firestore._databaseId);return new Xt(this.firestore,null,n)}};var l0="@firebase/firestore",c0="4.12.0";var yc=class{constructor(e,n,a,r,i){this._firestore=e,this._userDataWriter=n,this._key=a,this._document=r,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Xt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new cS(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let n=this._document.data.field(gc("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}},cS=class extends yc{data(){return super.data()}};function SV(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new q(N.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var _c=class{},Ho=class extends _c{};function Ic(t,e,...n){let a=[];e instanceof _c&&a.push(e),a=a.concat(n),function(i){let s=i.filter(l=>l instanceof dS).length,u=i.filter(l=>l instanceof yp).length;if(s>1||s>0&&u>0)throw new q(N.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(a);for(let r of a)t=r._apply(t);return t}var yp=class t extends Ho{constructor(e,n,a){super(),this._field=e,this._op=n,this._value=a,this.type="where"}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=this._parse(e);return p0(e._query,n),new qn(e.firestore,e.converter,hp(e._query,n))}_parse(e){let n=oS(e.firestore);return function(i,s,u,l,c,f,m){let p;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new q(N.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){f0(m,f);let L=[];for(let k of m)L.push(d0(l,i,k));p={arrayValue:{values:L}}}else p=d0(l,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||f0(m,f),p=uS(u,s,m,f==="in"||f==="not-in");return Qe.create(c,f,p)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}};function Tc(t,e,n){let a=e,r=gc("where",t);return yp._create(r,a,n)}var dS=class t extends _c{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new t(e,n)}_parse(e){let n=this._queryConstraints.map(a=>a._parse(e)).filter(a=>a.getFilters().length>0);return n.length===1?n[0]:xn.create(n,this._getOperator())}_apply(e){let n=this._parse(e);return n.getFilters().length===0?e:(function(r,i){let s=r,u=i.getFlattenedFilters();for(let l of u)p0(s,l),s=hp(s,l)}(e._query,n),new qn(e.firestore,e.converter,hp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var fS=class t extends Ho{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new t(e,n)}_apply(e){let n=function(r,i,s){if(r.startAt!==null)throw new q(N.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new q(N.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ti(i,s)}(e._query,this._field,this._direction);return new qn(e.firestore,e.converter,Sx(e._query,n))}};function Sc(t,e="asc"){let n=e,a=gc("orderBy",t);return fS._create(a,n)}var hS=class t extends Ho{constructor(e,n,a){super(),this.type=e,this._limit=n,this._limitType=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){return new qn(e.firestore,e.converter,Ql(e._query,this._limit,this._limitType))}};function vc(t){return WR("limit",t),hS._create("limit",t,"F")}var pS=class t extends Ho{constructor(e,n,a){super(),this.type=e,this._docOrFields=n,this._inclusive=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=vV(e,this.type,this._docOrFields,this._inclusive);return new qn(e.firestore,e.converter,vx(e._query,n))}};function h0(...t){return pS._create("startAfter",t,!1)}function vV(t,e,n,a){if(n[0]=Ce(n[0]),n[0]instanceof yc)return function(i,s,u,l,c){if(!l)throw new q(N.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);let f=[];for(let m of Gi(i))if(m.field.isKeyField())f.push(cc(s,l.key));else{let p=l.data.field(m.field);if(lc(p))throw new q(N.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+m.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(p===null){let _=m.field.canonicalString();throw new q(N.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${_}' (used as the orderBy) does not exist.`)}f.push(p)}return new Ja(f,c)}(t._query,t.firestore._databaseId,e,n[0]._document,a);{let r=oS(t.firestore);return function(s,u,l,c,f,m){let p=s.explicitOrderBy;if(f.length>p.length)throw new q(N.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let _=[];for(let L=0;L<f.length;L++){let k=f[L];if(p[L].field.isKeyField()){if(typeof k!="string")throw new q(N.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof k}`);if(!fp(s)&&k.indexOf("/")!==-1)throw new q(N.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${k}' contains a slash.`);let P=s.path.child(Ne.fromString(k));if(!K.isDocumentKey(P))throw new q(N.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${P}' is not because it contains an odd number of segments.`);let E=new K(P);_.push(cc(u,E))}else{let P=uS(l,c,k);_.push(P)}}return new Ja(_,m)}(t._query,t.firestore._databaseId,r,e,n,a)}}function d0(t,e,n){if(typeof(n=Ce(n))=="string"){if(n==="")throw new q(N.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!fp(e)&&n.indexOf("/")!==-1)throw new q(N.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);let a=e.path.child(Ne.fromString(n));if(!K.isDocumentKey(a))throw new q(N.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${a}' is not because it has an odd number of segments (${a.length}).`);return cc(t,new K(a))}if(n instanceof Xt)return cc(t,n._key);throw new q(N.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${oc(n)}.`)}function f0(t,e){if(!Array.isArray(t)||t.length===0)throw new q(N.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function p0(t,e){let n=function(r,i){for(let s of r)for(let u of s.getFlattenedFilters())if(i.indexOf(u.op)>=0)return u.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new q(N.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new q(N.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}var Fo=class{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},Bo=class t extends yc{constructor(e,n,a,r,i,s){super(e,n,a,r,s),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let n=new qo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){let a=this._document.data.field(gc("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new q(N.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,n={};return n.type=t._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}};Bo._jsonSchemaVersion="firestore/documentSnapshot/1.0",Bo._jsonSchema={type:Ye("string",Bo._jsonSchemaVersion),bundleSource:Ye("string","DocumentSnapshot"),bundleName:Ye("string"),bundle:Ye("string")};var qo=class extends Bo{data(e={}){return super.data(e)}},zo=class t{constructor(e,n,a,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new Fo(r.hasPendingWrites,r.fromCache),this.query=a}get docs(){let e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(a=>{e.call(n,new qo(this._firestore,this._userDataWriter,a.key,a,new Fo(this._snapshot.mutatedKeys.has(a.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new q(N.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(r,i){if(r._snapshot.oldDocs.isEmpty()){let s=0;return r._snapshot.docChanges.map(u=>{let l=new qo(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Fo(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:s++}})}{let s=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(u=>i||u.type!==3).map(u=>{let l=new qo(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Fo(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter),c=-1,f=-1;return u.type!==0&&(c=s.indexOf(u.doc.key),s=s.delete(u.doc.key)),u.type!==1&&(s=s.add(u.doc),f=s.indexOf(u.doc.key)),{type:EV(u.type),doc:l,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new q(N.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=To.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let n=[],a=[],r=[];return this.docs.forEach(i=>{i._document!==null&&(n.push(i._document),a.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),r.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function EV(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Y(61501,{type:t})}}zo._jsonSchemaVersion="firestore/querySnapshot/1.0",zo._jsonSchema={type:Ye("string",zo._jsonSchemaVersion),bundleSource:Ye("string","QuerySnapshot"),bundleName:Ye("string"),bundle:Ye("string")};function _p(t){t=uc(t,qn);let e=uc(t.firestore,Do),n=sS(e),a=new up(e);return SV(t._query),n0(n,t._query).then(r=>new zo(e,a,t,r))}(function(e,n=!0){zR(Yt),fn(new bt("firestore",(a,{instanceIdentifier:r,options:i})=>{let s=a.getProvider("app").getImmediate(),u=new Do(new Oh(a.getProvider("auth-internal")),new Mh(s,a.getProvider("app-check-internal")),fx(s,r),s);return i={useFetchStreams:n,...i},u._setSettings(i),u},"PUBLIC").setMultipleInstances(!0)),Lt(l0,c0,e),Lt(l0,c0,"esm2020")})();var Ip={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var yS=vl(Ip),bH=eR(yS),LH=mc(yS),m0=ah(yS);var g0="https://echly-web.vercel.app";function wV(t){return typeof t=="string"?t.startsWith("http")?t:g0+t:t instanceof URL?t.href:t.url}function CV(t,e={}){let n=wV(t),a=e.method||"GET",r=e.headers instanceof Headers||Array.isArray(e.headers)?Object.fromEntries(e.headers):{...e.headers},i=e.body??null;return new Promise((s,u)=>{chrome.runtime.sendMessage({type:"echly-api",url:n,method:a,headers:r,body:i},l=>{if(chrome.runtime.lastError){u(new Error(chrome.runtime.lastError.message));return}if(!l){u(new Error("No response from background"));return}let c=new Response(l.body??"",{status:l.status??0,headers:l.headers?new Headers(l.headers):void 0});s(c)})})}async function Tp(t,e={}){let n=t.startsWith("http")?t:g0+t;return CV(n,e)}function y0(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function _0(t,e,n){return new Promise((a,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,feedbackId:n},i=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(i?.error){r(new Error(i.error));return}if(i?.url){a(i.url);return}r(new Error("No URL from background"))})})}var si=_e(Pn());function U0(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var V0=U0,F0=new dn("auth","Firebase",U0());var bp=new aa("@firebase/auth");function AV(t,...e){bp.logLevel<=ee.WARN&&bp.warn(`Auth (${Yt}): ${t}`,...e)}function vp(t,...e){bp.logLevel<=ee.ERROR&&bp.error(`Auth (${Yt}): ${t}`,...e)}function zn(t,...e){throw zS(t,...e)}function ma(t,...e){return zS(t,...e)}function B0(t,e,n){let a={...V0(),[e]:n};return new dn("auth","Firebase",a).create(e,{appName:t.name})}function Xi(t){return B0(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function zS(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return F0.create(t,...e)}function j(t,e,...n){if(!t)throw zS(e,...n)}function pa(t){let e="INTERNAL ASSERTION FAILED: "+t;throw vp(e),new Error(e)}function nr(t,e){t||pa(e)}function ES(){return typeof self<"u"&&self.location?.href||""}function bV(){return I0()==="http:"||I0()==="https:"}function I0(){return typeof self<"u"&&self.location?.protocol||null}function LV(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(bV()||Kf()||"connection"in navigator)?navigator.onLine:!0}function RV(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var $i=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,nr(n>e,"Short delay should be less than long delay!"),this.isMobile=jf()||Qf()}get(){return LV()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function HS(t,e){nr(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var Lp=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;pa("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;pa("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;pa("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var xV={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var kV=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],DV=new $i(3e4,6e4);function Tt(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function Pt(t,e,n,a,r={}){return q0(t,r,async()=>{let i={},s={};a&&(e==="GET"?s=a:i={body:JSON.stringify(a)});let u=na({key:t.config.apiKey,...s}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:l,...i};return Wf()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Ft(t.emulatorConfig.host)&&(c.credentials="include"),Lp.fetch()(await z0(t,t.config.apiHost,n,u),c)})}async function q0(t,e,n){t._canInitEmulator=!1;let a={...xV,...e};try{let r=new wS(t),i=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let s=await i.json();if("needConfirmation"in s)throw wc(t,"account-exists-with-different-credential",s);if(i.ok&&!("errorMessage"in s))return s;{let u=i.ok?s.errorMessage:s.error.message,[l,c]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw wc(t,"credential-already-in-use",s);if(l==="EMAIL_EXISTS")throw wc(t,"email-already-in-use",s);if(l==="USER_DISABLED")throw wc(t,"user-disabled",s);let f=a[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw B0(t,f,c);zn(t,f)}}catch(r){if(r instanceof yt)throw r;zn(t,"network-request-failed",{message:String(r)})}}async function ns(t,e,n,a,r={}){let i=await Pt(t,e,n,a,r);return"mfaPendingCredential"in i&&zn(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function z0(t,e,n,a){let r=`${e}${n}?${a}`,i=t,s=i.config.emulator?HS(t.config,r):`${t.config.apiScheme}://${r}`;return kV.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(s).toString():s}function PV(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var wS=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(ma(this.auth,"network-request-failed")),DV.get())})}};function wc(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=ma(t,e,a);return r.customData._tokenResponse=n,r}function T0(t){return t!==void 0&&t.enterprise!==void 0}var Rp=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return PV(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function H0(t,e){return Pt(t,"GET","/v2/recaptchaConfig",Tt(t,e))}async function OV(t,e){return Pt(t,"POST","/v1/accounts:delete",e)}async function xp(t,e){return Pt(t,"POST","/v1/accounts:lookup",e)}function Cc(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function G0(t,e=!1){let n=Ce(t),a=await n.getIdToken(e),r=GS(a);j(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let i=typeof r.firebase=="object"?r.firebase:void 0,s=i?.sign_in_provider;return{claims:r,token:a,authTime:Cc(_S(r.auth_time)),issuedAtTime:Cc(_S(r.iat)),expirationTime:Cc(_S(r.exp)),signInProvider:s||null,signInSecondFactor:i?.sign_in_second_factor||null}}function _S(t){return Number(t)*1e3}function GS(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return vp("JWT malformed, contained fewer than 3 sections"),null;try{let r=io(n);return r?JSON.parse(r):(vp("Failed to decode base64 JWT payload"),null)}catch(r){return vp("Caught error parsing JWT payload as JSON",r?.toString()),null}}function S0(t){let e=GS(t);return j(e,"internal-error"),j(typeof e.exp<"u","internal-error"),j(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function Rc(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof yt&&NV(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function NV({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var CS=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var xc=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Cc(this.lastLoginAt),this.creationTime=Cc(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function kp(t){let e=t.auth,n=await t.getIdToken(),a=await Rc(t,xp(e,{idToken:n}));j(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let i=r.providerUserInfo?.length?W0(r.providerUserInfo):[],s=MV(t.providerData,i),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!s?.length,c=u?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new xc(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function j0(t){let e=Ce(t);await kp(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function MV(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function W0(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function UV(t,e){let n=await q0(t,{},async()=>{let a=na({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=t.config,s=await z0(t,r,"/v1/token",`key=${i}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:a};return t.emulatorConfig&&Ft(t.emulatorConfig.host)&&(l.credentials="include"),Lp.fetch()(s,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function VV(t,e){return Pt(t,"POST","/v2/accounts:revokeToken",Tt(t,e))}var Ac=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){j(e.idToken,"internal-error"),j(typeof e.idToken<"u","internal-error"),j(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):S0(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){j(e.length!==0,"internal-error");let n=S0(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(j(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:i}=await UV(e,n);this.updateTokensAndExpiration(a,r,Number(i))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:i}=n,s=new t;return a&&(j(typeof a=="string","internal-error",{appName:e}),s.refreshToken=a),r&&(j(typeof r=="string","internal-error",{appName:e}),s.accessToken=r),i&&(j(typeof i=="number","internal-error",{appName:e}),s.expirationTime=i),s}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return pa("not implemented")}};function ri(t,e){j(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var ii=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new CS(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new xc(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await Rc(this,this.stsTokenManager.getToken(this.auth,e));return j(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return G0(this,e)}reload(){return j0(this)}_assign(e){this!==e&&(j(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){j(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await kp(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ke(this.auth.app))return Promise.reject(Xi(this.auth));let e=await this.getIdToken();return await Rc(this,OV(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,i=n.phoneNumber??void 0,s=n.photoURL??void 0,u=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:m,emailVerified:p,isAnonymous:_,providerData:L,stsTokenManager:k}=n;j(m&&k,e,"internal-error");let P=Ac.fromJSON(this.name,k);j(typeof m=="string",e,"internal-error"),ri(a,e.name),ri(r,e.name),j(typeof p=="boolean",e,"internal-error"),j(typeof _=="boolean",e,"internal-error"),ri(i,e.name),ri(s,e.name),ri(u,e.name),ri(l,e.name),ri(c,e.name),ri(f,e.name);let E=new t({uid:m,auth:e,email:r,emailVerified:p,displayName:a,isAnonymous:_,photoURL:s,phoneNumber:i,tenantId:u,stsTokenManager:P,createdAt:c,lastLoginAt:f});return L&&Array.isArray(L)&&(E.providerData=L.map(S=>({...S}))),l&&(E._redirectEventId=l),E}static async _fromIdTokenResponse(e,n,a=!1){let r=new Ac;r.updateFromServerResponse(n);let i=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await kp(i),i}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];j(r.localId!==void 0,"internal-error");let i=r.providerUserInfo!==void 0?W0(r.providerUserInfo):[],s=!(r.email&&r.passwordHash)&&!i?.length,u=new Ac;u.updateFromIdToken(a);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:s}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new xc(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!i?.length};return Object.assign(l,c),l}};var v0=new Map;function tr(t){nr(t instanceof Function,"Expected a class definition");let e=v0.get(t);return e?(nr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,v0.set(t,e),e)}var Dp=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};Dp.type="NONE";var AS=Dp;function Ep(t,e,n){return`firebase:${t}:${e}:${n}`}var Pp=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:i}=this.auth;this.fullUserKey=Ep(this.userKey,r.apiKey,i),this.fullPersistenceKey=Ep("persistence",r.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await xp(this.auth,{idToken:e}).catch(()=>{});return n?ii._fromGetAccountInfoResponse(this.auth,n,e):null}return ii._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(tr(AS),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),i=r[0]||tr(AS),s=Ep(a,e.config.apiKey,e.name),u=null;for(let c of n)try{let f=await c._get(s);if(f){let m;if(typeof f=="string"){let p=await xp(e,{idToken:f}).catch(()=>{});if(!p)break;m=await ii._fromGetAccountInfoResponse(e,p,f)}else m=ii._fromJSON(e,f);c!==i&&(u=m),i=c;break}}catch{}let l=r.filter(c=>c._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new t(i,e,a):(i=l[0],u&&await i._set(s,u.toJSON()),await Promise.all(n.map(async c=>{if(c!==i)try{await c._remove(s)}catch{}})),new t(i,e,a))}};function E0(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(X0(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(K0(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(J0(e))return"Blackberry";if(Z0(e))return"Webos";if(Q0(e))return"Safari";if((e.includes("chrome/")||Y0(e))&&!e.includes("edge/"))return"Chrome";if($0(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function K0(t=Se()){return/firefox\//i.test(t)}function Q0(t=Se()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Y0(t=Se()){return/crios\//i.test(t)}function X0(t=Se()){return/iemobile/i.test(t)}function $0(t=Se()){return/android/i.test(t)}function J0(t=Se()){return/blackberry/i.test(t)}function Z0(t=Se()){return/webos/i.test(t)}function jS(t=Se()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function FV(t=Se()){return jS(t)&&!!window.navigator?.standalone}function BV(){return p_()&&document.documentMode===10}function ek(t=Se()){return jS(t)||$0(t)||Z0(t)||J0(t)||/windows phone/i.test(t)||X0(t)}function tk(t,e=[]){let n;switch(t){case"Browser":n=E0(Se());break;case"Worker":n=`${E0(Se())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Yt}/${a}`}var bS=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=i=>new Promise((s,u)=>{try{let l=e(i);s(l)}catch(l){u(l)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function qV(t,e={}){return Pt(t,"GET","/v2/passwordPolicy",Tt(t,e))}var zV=6,LS=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??zV,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}};var RS=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Op(this),this.idTokenSubscription=new Op(this),this.beforeStateQueue=new bS(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=F0,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=tr(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Pp.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await xp(this,{idToken:e}),a=await ii._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(Ke(this.app)){let i=this.app.settings.authIdToken;return i?new Promise(s=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(i).then(s,s))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let i=this.redirectUser?._redirectEventId,s=a?._redirectEventId,u=await this.tryRedirectSignIn(e);(!i||i===s)&&u?.user&&(a=u.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(i){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(i))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return j(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await kp(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=RV()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ke(this.app))return Promise.reject(Xi(this));let n=e?Ce(e):null;return n&&j(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&j(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ke(this.app)?Promise.reject(Xi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ke(this.app)?Promise.reject(Xi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(tr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await qV(this),n=new LS(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new dn("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await VV(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&tr(e)||this._popupRedirectResolver;j(n,this,"argument-error"),this.redirectPersistenceManager=await Pp.create(this,[tr(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let i=typeof n=="function"?n:n.next.bind(n),s=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(j(u,this,"internal-error"),u.then(()=>{s||i(this.currentUser)}),typeof n=="function"){let l=e.addObserver(n,a,r);return()=>{s=!0,l()}}else{let l=e.addObserver(n);return()=>{s=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return j(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=tk(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(Ke(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&AV(`Error while retrieving App Check token: ${e.error}`),e?.token}};function Wo(t){return Ce(t)}var Op=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=Yf(n=>this.observer=n)}get next(){return j(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var Jp={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function HV(t){Jp=t}function nk(t){return Jp.loadJS(t)}function GV(){return Jp.recaptchaEnterpriseScript}function jV(){return Jp.gapiScript}function ak(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var xS=class{constructor(){this.enterprise=new kS}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},kS=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var WV="recaptcha-enterprise",bc="NO_RECAPTCHA",Np=class{constructor(e){this.type=WV,this.auth=Wo(e)}async verify(e="verify",n=!1){async function a(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(s,u)=>{H0(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let c=new Rp(l);return i.tenantId==null?i._agentRecaptchaConfig=c:i._tenantRecaptchaConfigs[i.tenantId]=c,s(c.siteKey)}}).catch(l=>{u(l)})})}function r(i,s,u){let l=window.grecaptcha;T0(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(c=>{s(c)}).catch(()=>{s(bc)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new xS().execute("siteKey",{action:"verify"}):new Promise((i,s)=>{a(this.auth).then(u=>{if(!n&&T0(window.grecaptcha))r(u,i,s);else{if(typeof window>"u"){s(new Error("RecaptchaVerifier is only supported in browser"));return}let l=GV();l.length!==0&&(l+=u),nk(l).then(()=>{r(u,i,s)}).catch(c=>{s(c)})}}).catch(u=>{s(u)})})}};async function Ec(t,e,n,a=!1,r=!1){let i=new Np(t),s;if(r)s=bc;else try{s=await i.verify(n)}catch{s=await i.verify(n,!0)}let u={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,c=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return a?Object.assign(u,{captchaResp:s}):Object.assign(u,{captchaResponse:s}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function Lc(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let i=await Ec(t,e,n,n==="getOobCode");return a(t,i)}else return a(t,e).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let s=await Ec(t,e,n,n==="getOobCode");return a(t,s)}else return Promise.reject(i)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let i=await Ec(t,e,n);return a(t,i).catch(async s=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(s.code==="auth/missing-recaptcha-token"||s.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let u=await Ec(t,e,n,!1,!0);return a(t,u)}return Promise.reject(s)})}else{let i=await Ec(t,e,n,!1,!0);return a(t,i)}else return Promise.reject(r+" provider is not supported.")}async function KV(t){let e=Wo(t),n=await H0(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),a=new Rp(n);e.tenantId==null?e._agentRecaptchaConfig=a:e._tenantRecaptchaConfigs[e.tenantId]=a,a.isAnyProviderEnabled()&&new Np(e).verify()}function rk(t,e){let n=Un(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),i=n.getOptions();if(Bt(i,e??{}))return r;zn(r,"already-initialized")}return n.initialize({options:e})}function QV(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(tr);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function ik(t,e,n){let a=Wo(t);j(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,i=sk(e),{host:s,port:u}=YV(e),l=u===null?"":`:${u}`,c={url:`${i}//${s}${l}/`},f=Object.freeze({host:s,port:u,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){j(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),j(Bt(c,a.config.emulator)&&Bt(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Ft(s)?(Yr(`${i}//${s}${l}`),Xr("Auth",!0)):r||XV()}function sk(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function YV(t){let e=sk(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let i=r[1];return{host:i,port:w0(a.substr(i.length+1))}}else{let[i,s]=a.split(":");return{host:i,port:w0(s)}}}function w0(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function XV(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var Ji=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return pa("not implemented")}_getIdTokenResponse(e){return pa("not implemented")}_linkToIdToken(e,n){return pa("not implemented")}_getReauthenticationResolver(e){return pa("not implemented")}};async function $V(t,e){return Pt(t,"POST","/v1/accounts:signUp",e)}async function JV(t,e){return ns(t,"POST","/v1/accounts:signInWithPassword",Tt(t,e))}async function ZV(t,e){return ns(t,"POST","/v1/accounts:signInWithEmailLink",Tt(t,e))}async function eF(t,e){return ns(t,"POST","/v1/accounts:signInWithEmailLink",Tt(t,e))}var kc=class t extends Ji{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Lc(e,n,"signInWithPassword",JV,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return ZV(e,{email:this._email,oobCode:this._password});default:zn(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Lc(e,a,"signUpPassword",$V,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return eF(e,{idToken:n,email:this._email,oobCode:this._password});default:zn(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function Go(t,e){return ns(t,"POST","/v1/accounts:signInWithIdp",Tt(t,e))}var tF="http://localhost",Zi=class t extends Ji{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):zn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...i}=n;if(!a||!r)return null;let s=new t(a,r);return s.idToken=i.idToken||void 0,s.accessToken=i.accessToken||void 0,s.secret=i.secret,s.nonce=i.nonce,s.pendingToken=i.pendingToken||null,s}_getIdTokenResponse(e){let n=this.buildRequest();return Go(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,Go(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,Go(e,n)}buildRequest(){let e={requestUri:tF,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=na(n)}return e}};async function C0(t,e){return Pt(t,"POST","/v1/accounts:sendVerificationCode",Tt(t,e))}async function nF(t,e){return ns(t,"POST","/v1/accounts:signInWithPhoneNumber",Tt(t,e))}async function aF(t,e){let n=await ns(t,"POST","/v1/accounts:signInWithPhoneNumber",Tt(t,e));if(n.temporaryProof)throw wc(t,"account-exists-with-different-credential",n);return n}var rF={USER_NOT_FOUND:"user-not-found"};async function iF(t,e){let n={...e,operation:"REAUTH"};return ns(t,"POST","/v1/accounts:signInWithPhoneNumber",Tt(t,n),rF)}var Dc=class t extends Ji{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new t({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new t({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return nF(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return aF(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return iF(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:n,verificationId:a,verificationCode:r}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:a,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:i}=e;return!a&&!n&&!r&&!i?null:new t({verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:i})}};function sF(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function oF(t){let e=bn(Ln(t)).link,n=e?bn(Ln(e)).deep_link_id:null,a=bn(Ln(t)).deep_link_id;return(a?bn(Ln(a)).link:null)||a||n||e||t}var Mp=class t{constructor(e){let n=bn(Ln(e)),a=n.apiKey??null,r=n.oobCode??null,i=sF(n.mode??null);j(a&&r&&i,"argument-error"),this.apiKey=a,this.operation=i,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=oF(e);try{return new t(n)}catch{return null}}};var jo=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return kc._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=Mp.parseLink(n);return j(a,"argument-error"),kc._fromEmailAndCode(e,a.code,a.tenantId)}};jo.PROVIDER_ID="password";jo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";jo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var Up=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var es=class extends Up{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var Pc=class t extends es{constructor(){super("facebook.com")}static credential(e){return Zi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Pc.FACEBOOK_SIGN_IN_METHOD="facebook.com";Pc.PROVIDER_ID="facebook.com";var Oc=class t extends es{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Zi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};Oc.GOOGLE_SIGN_IN_METHOD="google.com";Oc.PROVIDER_ID="google.com";var Nc=class t extends es{constructor(){super("github.com")}static credential(e){return Zi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Nc.GITHUB_SIGN_IN_METHOD="github.com";Nc.PROVIDER_ID="github.com";var Mc=class t extends es{constructor(){super("twitter.com")}static credential(e,n){return Zi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};Mc.TWITTER_SIGN_IN_METHOD="twitter.com";Mc.PROVIDER_ID="twitter.com";var Uc=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,a,r=!1){let i=await ii._fromIdTokenResponse(e,a,r),s=A0(a);return new t({user:i,providerId:s,_tokenResponse:a,operationType:n})}static async _forOperation(e,n,a){await e._updateTokensIfNecessary(a,!0);let r=A0(a);return new t({user:e,providerId:r,_tokenResponse:a,operationType:n})}};function A0(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var DS=class t extends yt{constructor(e,n,a,r){super(n.code,n.message),this.operationType=a,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:a}}static _fromErrorAndOperation(e,n,a,r){return new t(e,n,a,r)}};function ok(t,e,n,a){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?DS._fromErrorAndOperation(t,i,e,a):i})}async function uF(t,e,n=!1){let a=await Rc(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Uc._forOperation(t,"link",a)}async function lF(t,e,n=!1){let{auth:a}=t;if(Ke(a.app))return Promise.reject(Xi(a));let r="reauthenticate";try{let i=await Rc(t,ok(a,r,e,t),n);j(i.idToken,a,"internal-error");let s=GS(i.idToken);j(s,a,"internal-error");let{sub:u}=s;return j(t.uid===u,a,"user-mismatch"),Uc._forOperation(t,r,i)}catch(i){throw i?.code==="auth/user-not-found"&&zn(a,"user-mismatch"),i}}async function cF(t,e,n=!1){if(Ke(t.app))return Promise.reject(Xi(t));let a="signIn",r=await ok(t,a,e),i=await Uc._fromIdTokenResponse(t,a,r);return n||await t._updateCurrentUser(i.user),i}function uk(t,e,n,a){return Ce(t).onIdTokenChanged(e,n,a)}function lk(t,e,n){return Ce(t).beforeAuthStateChanged(e,n)}function b0(t,e){return Pt(t,"POST","/v2/accounts/mfaEnrollment:start",Tt(t,e))}function dF(t,e){return Pt(t,"POST","/v2/accounts/mfaEnrollment:finalize",Tt(t,e))}function fF(t,e){return Pt(t,"POST","/v2/accounts/mfaEnrollment:start",Tt(t,e))}function hF(t,e){return Pt(t,"POST","/v2/accounts/mfaEnrollment:finalize",Tt(t,e))}var Vp="__sak";var Fp=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Vp,"1"),this.storage.removeItem(Vp),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){let n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var pF=1e3,mF=10,Bp=class extends Fp{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=ek(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let n of Object.keys(this.listeners)){let a=this.storage.getItem(n),r=this.localCache[n];a!==r&&e(n,r,a)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((s,u,l)=>{this.notifyListeners(s,l)});return}let a=e.key;n?this.detachListener():this.stopPolling();let r=()=>{let s=this.storage.getItem(a);!n&&this.localCache[a]===s||this.notifyListeners(a,s)},i=this.storage.getItem(a);BV()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,mF):r()}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,a)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:a}),!0)})},pF)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){let n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};Bp.type="LOCAL";var ck=Bp;var gF=1e3;function IS(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${e}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function TS(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var PS=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let n=new URL(`${window.location.origin}/__cookies__`);return n.searchParams.set("finalTarget",e),n}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,n){}async _get(e){if(!this._isAvailable())return null;let n=TS(e);return window.cookieStore?(await window.cookieStore.get(n))?.value:IS(n)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let a=TS(e);document.cookie=`${a}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,n){if(!this._isAvailable())return;let a=TS(e);if(window.cookieStore){let u=c=>{let f=c.changed.find(p=>p.name===a);f&&n(f.value),c.deleted.find(p=>p.name===a)&&n(null)},l=()=>window.cookieStore.removeEventListener("change",u);return this.listenerUnsubscribes.set(n,l),window.cookieStore.addEventListener("change",u)}let r=IS(a),i=setInterval(()=>{let u=IS(a);u!==r&&(n(u),r=u)},gF),s=()=>clearInterval(i);this.listenerUnsubscribes.set(n,s)}_removeListener(e,n){let a=this.listenerUnsubscribes.get(n);a&&(a(),this.listenerUnsubscribes.delete(n))}};PS.type="COOKIE";var qp=class extends Fp{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};qp.type="SESSION";var WS=qp;function yF(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var zp=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:i}=n.data,s=this.handlersMap[r];if(!s?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let u=Array.from(s).map(async c=>c(n.origin,i)),l=await yF(u);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};zp.receivers=[];function KS(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var OS=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,s;return new Promise((u,l)=>{let c=KS("",20);r.port1.start();let f=setTimeout(()=>{l(new Error("unsupported_event"))},a);s={messageChannel:r,onMessage(m){let p=m;if(p.data.eventId===c)switch(p.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),u(p.data.response);break;default:clearTimeout(f),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(s),r.port1.addEventListener("message",s.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{s&&this.removeMessageHandler(s)})}};function ga(){return window}function _F(t){ga().location.href=t}function dk(){return typeof ga().WorkerGlobalScope<"u"&&typeof ga().importScripts=="function"}async function IF(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function TF(){return navigator?.serviceWorker?.controller||null}function SF(){return dk()?self:null}var fk="firebaseLocalStorageDb",vF=1,Hp="firebaseLocalStorage",hk="fbase_key",ts=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function Zp(t,e){return t.transaction([Hp],e?"readwrite":"readonly").objectStore(Hp)}function EF(){let t=indexedDB.deleteDatabase(fk);return new ts(t).toPromise()}function NS(){let t=indexedDB.open(fk,vF);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Hp,{keyPath:hk})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Hp)?e(a):(a.close(),await EF(),e(await NS()))})})}async function L0(t,e,n){let a=Zp(t,!0).put({[hk]:e,value:n});return new ts(a).toPromise()}async function wF(t,e){let n=Zp(t,!1).get(e),a=await new ts(n).toPromise();return a===void 0?null:a.value}function R0(t,e){let n=Zp(t,!0).delete(e);return new ts(n).toPromise()}var CF=800,AF=3,Gp=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await NS(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>AF)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return dk()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=zp._getInstance(SF()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await IF(),!this.activeServiceWorker)return;this.sender=new OS(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||TF()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await NS();return await L0(e,Vp,"1"),await R0(e,Vp),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>L0(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>wF(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>R0(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let i=Zp(r,!1).getAll();return new ts(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:i}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),CF)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Gp.type="LOCAL";var pk=Gp;function x0(t,e){return Pt(t,"POST","/v2/accounts/mfaSignIn:start",Tt(t,e))}function bF(t,e){return Pt(t,"POST","/v2/accounts/mfaSignIn:finalize",Tt(t,e))}function LF(t,e){return Pt(t,"POST","/v2/accounts/mfaSignIn:finalize",Tt(t,e))}var MH=ak("rcb"),UH=new $i(3e4,6e4);var wp="recaptcha";async function RF(t,e,n){if(!t._getRecaptchaConfig())try{await KV(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let a;if(typeof e=="string"?a={phoneNumber:e}:a=e,"session"in a){let r=a.session;if("phoneNumber"in a){j(r.type==="enroll",t,"internal-error");let i={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Lc(t,i,"mfaSmsEnrollment",async(c,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===bc){j(n?.type===wp,c,"argument-error");let m=await SS(c,f,n);return b0(c,m)}return b0(c,f)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).phoneSessionInfo.sessionInfo}else{j(r.type==="signin",t,"internal-error");let i=a.multiFactorHint?.uid||a.multiFactorUid;j(i,t,"missing-multi-factor-info");let s={mfaPendingCredential:r.credential,mfaEnrollmentId:i,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Lc(t,s,"mfaSmsSignIn",async(f,m)=>{if(m.phoneSignInInfo.captchaResponse===bc){j(n?.type===wp,f,"argument-error");let p=await SS(f,m,n);return x0(f,p)}return x0(f,m)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Lc(t,r,"sendVerificationCode",async(l,c)=>{if(c.captchaResponse===bc){j(n?.type===wp,l,"argument-error");let f=await SS(l,c,n);return C0(l,f)}return C0(l,c)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{n?._reset()}}async function SS(t,e,n){j(n.type===wp,t,"argument-error");let a=await n.verify();j(typeof a=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let i=r.phoneEnrollmentInfo.phoneNumber,s=r.phoneEnrollmentInfo.captchaResponse,u=r.phoneEnrollmentInfo.clientType,l=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:a,captchaResponse:s,clientType:u,recaptchaVersion:l}}),r}else if("phoneSignInInfo"in r){let i=r.phoneSignInInfo.captchaResponse,s=r.phoneSignInInfo.clientType,u=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:a,captchaResponse:i,clientType:s,recaptchaVersion:u}}),r}else return Object.assign(r,{recaptchaToken:a}),r}var Vc=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=Wo(e)}verifyPhoneNumber(e,n){return RF(this.auth,e,Ce(n))}static credential(e,n){return Dc._fromVerification(e,n)}static credentialFromResult(e){let n=e;return t.credentialFromTaggedObject(n)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:n,temporaryProof:a}=e;return n&&a?Dc._fromTokenResponse(n,a):null}};Vc.PROVIDER_ID="phone";Vc.PHONE_SIGN_IN_METHOD="phone";function xF(t,e){return e?tr(e):(j(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var Fc=class extends Ji{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Go(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Go(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Go(e,this._buildIdpRequest())}_buildIdpRequest(e){let n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function kF(t){return cF(t.auth,new Fc(t),t.bypassAuthState)}function DF(t){let{auth:e,user:n}=t;return j(n,e,"internal-error"),lF(n,new Fc(t),t.bypassAuthState)}async function PF(t){let{auth:e,user:n}=t;return j(n,e,"internal-error"),uF(n,new Fc(t),t.bypassAuthState)}var jp=class{constructor(e,n,a,r,i=!1){this.auth=e,this.resolver=a,this.user=r,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(a){this.reject(a)}})}async onAuthEvent(e){let{urlResponse:n,sessionId:a,postBody:r,tenantId:i,error:s,type:u}=e;if(s){this.reject(s);return}let l={auth:this.auth,requestUri:n,sessionId:a,tenantId:i||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(l))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return kF;case"linkViaPopup":case"linkViaRedirect":return PF;case"reauthViaPopup":case"reauthViaRedirect":return DF;default:zn(this.auth,"internal-error")}}resolve(e){nr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){nr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var OF=new $i(2e3,1e4);var MS=class t extends jp{constructor(e,n,a,r,i){super(e,n,r,i),this.provider=a,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return j(e,this.auth,"internal-error"),e}async onExecution(){nr(this.filter.length===1,"Popup operations only handle one event");let e=KS();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(ma(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(ma(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ma(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,OF.get())};e()}};MS.currentPopupAction=null;var NF="pendingRedirect",Cp=new Map,US=class extends jp{constructor(e,n,a=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,a),this.eventId=null}async execute(){let e=Cp.get(this.auth._key());if(!e){try{let a=await MF(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(a)}catch(n){e=()=>Promise.reject(n)}Cp.set(this.auth._key(),e)}return this.bypassAuthState||Cp.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function MF(t,e){let n=FF(e),a=VF(t);if(!await a._isAvailable())return!1;let r=await a._get(n)==="true";return await a._remove(n),r}function UF(t,e){Cp.set(t._key(),e)}function VF(t){return tr(t._redirectPersistence)}function FF(t){return Ep(NF,t.config.apiKey,t.name)}async function BF(t,e,n=!1){if(Ke(t.app))return Promise.reject(Xi(t));let a=Wo(t),r=xF(a,e),s=await new US(a,r,n).execute();return s&&!n&&(delete s.user._redirectEventId,await a._persistUserIfCurrent(s.user),await a._setRedirectUser(null,e)),s}var qF=10*60*1e3,VS=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(a=>{this.isEventForConsumer(e,a)&&(n=!0,this.sendToConsumer(e,a),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!zF(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!mk(e)){let a=e.error.code?.split("auth/")[1]||"internal-error";n.onError(ma(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){let a=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&a}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=qF&&this.cachedEventUids.clear(),this.cachedEventUids.has(k0(e))}saveEventToCache(e){this.cachedEventUids.add(k0(e)),this.lastProcessedEventTime=Date.now()}};function k0(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function mk({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function zF(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return mk(t);default:return!1}}async function HF(t,e={}){return Pt(t,"GET","/v1/projects",e)}var GF=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,jF=/^https?/;async function WF(t){if(t.config.emulator)return;let{authorizedDomains:e}=await HF(t);for(let n of e)try{if(KF(n))return}catch{}zn(t,"unauthorized-domain")}function KF(t){let e=ES(),{protocol:n,hostname:a}=new URL(e);if(t.startsWith("chrome-extension://")){let s=new URL(t);return s.hostname===""&&a===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&s.hostname===a}if(!jF.test(n))return!1;if(GF.test(t))return a===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(a)}var QF=new $i(3e4,6e4);function D0(){let t=ga().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function YF(t){return new Promise((e,n)=>{function a(){D0(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{D0(),n(ma(t,"network-request-failed"))},timeout:QF.get()})}if(ga().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(ga().gapi?.load)a();else{let r=ak("iframefcb");return ga()[r]=()=>{gapi.load?a():n(ma(t,"network-request-failed"))},nk(`${jV()}?onload=${r}`).catch(i=>n(i))}}).catch(e=>{throw Ap=null,e})}var Ap=null;function XF(t){return Ap=Ap||YF(t),Ap}var $F=new $i(5e3,15e3),JF="__/auth/iframe",ZF="emulator/auth/iframe",eB={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},tB=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function nB(t){let e=t.config;j(e.authDomain,t,"auth-domain-config-required");let n=e.emulator?HS(e,ZF):`https://${t.config.authDomain}/${JF}`,a={apiKey:e.apiKey,appName:t.name,v:Yt},r=tB.get(t.config.apiHost);r&&(a.eid=r);let i=t._getFrameworks();return i.length&&(a.fw=i.join(",")),`${n}?${na(a).slice(1)}`}async function aB(t){let e=await XF(t),n=ga().gapi;return j(n,t,"internal-error"),e.open({where:document.body,url:nB(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:eB,dontclear:!0},a=>new Promise(async(r,i)=>{await a.restyle({setHideOnLeave:!1});let s=ma(t,"network-request-failed"),u=ga().setTimeout(()=>{i(s)},$F.get());function l(){ga().clearTimeout(u),r(a)}a.ping(l).then(l,()=>{i(s)})}))}var rB={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},iB=500,sB=600,oB="_blank",uB="http://localhost",Wp=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function lB(t,e,n,a=iB,r=sB){let i=Math.max((window.screen.availHeight-r)/2,0).toString(),s=Math.max((window.screen.availWidth-a)/2,0).toString(),u="",l={...rB,width:a.toString(),height:r.toString(),top:i,left:s},c=Se().toLowerCase();n&&(u=Y0(c)?oB:n),K0(c)&&(e=e||uB,l.scrollbars="yes");let f=Object.entries(l).reduce((p,[_,L])=>`${p}${_}=${L},`,"");if(FV(c)&&u!=="_self")return cB(e||"",u),new Wp(null);let m=window.open(e||"",u,f);j(m,t,"popup-blocked");try{m.focus()}catch{}return new Wp(m)}function cB(t,e){let n=document.createElement("a");n.href=t,n.target=e;let a=document.createEvent("MouseEvent");a.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(a)}var dB="__/auth/handler",fB="emulator/auth/handler",hB=encodeURIComponent("fac");async function P0(t,e,n,a,r,i){j(t.config.authDomain,t,"auth-domain-config-required"),j(t.config.apiKey,t,"invalid-api-key");let s={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:a,v:Yt,eventId:r};if(e instanceof Up){e.setDefaultLanguage(t.languageCode),s.providerId=e.providerId||"",Mb(e.getCustomParameters())||(s.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,m]of Object.entries(i||{}))s[f]=m}if(e instanceof es){let f=e.getScopes().filter(m=>m!=="");f.length>0&&(s.scopes=f.join(","))}t.tenantId&&(s.tid=t.tenantId);let u=s;for(let f of Object.keys(u))u[f]===void 0&&delete u[f];let l=await t._getAppCheckToken(),c=l?`#${hB}=${encodeURIComponent(l)}`:"";return`${pB(t)}?${na(u).slice(1)}${c}`}function pB({config:t}){return t.emulator?HS(t,fB):`https://${t.authDomain}/${dB}`}var vS="webStorageSupport",FS=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=WS,this._completeRedirectFn=BF,this._overrideRedirectResult=UF}async _openPopup(e,n,a,r){nr(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let i=await P0(e,n,a,ES(),r);return lB(e,i,KS())}async _openRedirect(e,n,a,r){await this._originValidation(e);let i=await P0(e,n,a,ES(),r);return _F(i),new Promise(()=>{})}_initialize(e){let n=e._key();if(this.eventManagers[n]){let{manager:r,promise:i}=this.eventManagers[n];return r?Promise.resolve(r):(nr(i,"If manager is not set, promise should be"),i)}let a=this.initAndGetManager(e);return this.eventManagers[n]={promise:a},a.catch(()=>{delete this.eventManagers[n]}),a}async initAndGetManager(e){let n=await aB(e),a=new VS(e);return n.register("authEvent",r=>(j(r?.authEvent,e,"invalid-auth-event"),{status:a.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:a},this.iframes[e._key()]=n,a}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(vS,{type:vS},r=>{let i=r?.[0]?.[vS];i!==void 0&&n(!!i),zn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=WF(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return ek()||Q0()||jS()}},gk=FS,Kp=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return pa("unexpected MultiFactorSessionType")}}},BS=class t extends Kp{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,n,a){return dF(e,{idToken:n,displayName:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,n){return bF(e,{mfaPendingCredential:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Qp=class{constructor(){}static assertion(e){return BS._fromCredential(e)}};Qp.FACTOR_ID="phone";var Yp=class{static assertionForEnrollment(e,n){return Xp._fromSecret(e,n)}static assertionForSignIn(e,n){return Xp._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;j(typeof n.user?.auth<"u","internal-error");let a=await fF(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return $p._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Yp.FACTOR_ID="totp";var Xp=class t extends Kp{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return j(typeof this.secret<"u",e,"argument-error"),hF(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){j(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return LF(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},$p=class t{constructor(e,n,a,r,i,s,u){this.sessionInfo=s,this.auth=u,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=i}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(Sp(e)||Sp(n))&&(a=!0),a&&(Sp(e)&&(e=this.auth.currentUser?.email||"unknownuser"),Sp(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function Sp(t){return typeof t>"u"||t?.length===0}var O0="@firebase/auth",N0="1.12.1";var qS=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){j(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function mB(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function gB(t){fn(new bt("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:s,authDomain:u}=a.options;j(s&&!s.includes(":"),"invalid-api-key",{appName:a.name});let l={apiKey:s,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:tk(t)},c=new RS(a,r,i,l);return QV(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),fn(new bt("auth-internal",e=>{let n=Wo(e.getProvider("auth").getImmediate());return(a=>new qS(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Lt(O0,N0,mB(t)),Lt(O0,N0,"esm2020")}var yB=5*60,_B=h_("authIdTokenMaxAge")||yB,M0=null,IB=t=>async e=>{let n=e&&await e.getIdTokenResult(),a=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(a&&a>_B)return;let r=n?.token;M0!==r&&(M0=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function QS(t=Jr()){let e=Un(t,"auth");if(e.isInitialized())return e.getImmediate();let n=rk(t,{popupRedirectResolver:gk,persistence:[pk,ck,WS]}),a=h_("authTokenSyncURL");if(a&&typeof isSecureContext=="boolean"&&isSecureContext){let i=new URL(a,location.origin);if(location.origin===i.origin){let s=IB(i.toString());lk(n,s,()=>s(n.currentUser)),uk(n,u=>s(u))}}let r=Tl("auth");return r&&ik(n,`http://${r}`),n}function TB(){return document.getElementsByTagName("head")?.[0]??document}HV({loadJS(t){return new Promise((e,n)=>{let a=document.createElement("script");a.setAttribute("src",t),a.onload=e,a.onerror=r=>{let i=ma("internal-error");i.customData=r,n(i)},a.type="text/javascript",a.charset="UTF-8",TB().appendChild(a)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});gB("Browser");var YS=vl(Ip),yk=QS(YS),em=mc(YS),n6=ah(YS);var XS=null,$S=null;async function SB(t){let e=Date.now();if(XS&&$S&&e<$S)return XS;let n=await t.getIdToken(),a=await t.getIdTokenResult();return XS=n,$S=a.expirationTime?new Date(a.expirationTime).getTime()-6e4:e+6e4,n}function vB(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let n=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return n.startsWith("http")?t:e+n}var EB=15e3;async function _k(t,e={}){let n=yk.currentUser;if(!n)throw new Error("User not authenticated");let a=await SB(n),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${a}`);let i=e.timeout!==void 0?e.timeout:EB,{timeout:s,...u}=e,l=u.signal,c=null,f=null;i>0&&(c=new AbortController,f=setTimeout(()=>c.abort(),i),l=u.signal?(()=>{let m=new AbortController;return u.signal?.addEventListener("abort",()=>{clearTimeout(f),m.abort()}),c.signal.addEventListener("abort",()=>m.abort()),m.signal})():c.signal);try{let m=await fetch(vB(t),{...u,headers:r,signal:l??u.signal});return f&&clearTimeout(f),m}catch(m){throw f&&clearTimeout(f),m instanceof Error&&m.name==="AbortError"&&c?.signal.aborted?new Error("Request timed out"):m}}var JS=null;function wB(){if(typeof window>"u")return null;if(!JS)try{JS=new AudioContext}catch{return null}return JS}function Ik(){let t=wB();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(400,e+.02),n.type="sine",a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.05),n.start(e),n.stop(e+.05)}var B=_e(Pn());var CB=typeof process<"u"&&!1;function tm(t,e){if(CB&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var LB=20;function RB(t){let e=t.data(),n=e.status??"open",a=e.isResolved===!0||n==="resolved"||n==="done";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:a,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null}}async function vk(t,e=LB,n){tm(e,"getSessionFeedbackPageRepo");let a=pc(em,"feedback"),r=n!=null?Ic(a,Tc("sessionId","==",t),Sc("createdAt","desc"),vc(e),h0(n)):Ic(a,Tc("sessionId","==",t),Sc("createdAt","desc"),vc(e)),s=(await _p(r)).docs,u=s.map(RB),l=s.length>0?s[s.length-1]:null,c=s.length===e;return{feedback:u,lastVisibleDoc:l,hasMore:c}}async function Ek(t,e=50){let{feedback:n}=await vk(t,e);return n}var nm=24;function kB(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let n=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),a=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(n&&!a)return"negative";if(a&&!n)return"positive";if(n&&a){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,i=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>i?"negative":i>r?"positive":"neutral"}return"neutral"}function Ak(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}var am=["focus_mode","region_selecting","voice_listening","processing"],DB=1800,PB=12;function bk({sessionId:t,extensionMode:e=!1,initialPointers:n,onComplete:a,onDelete:r,onRecordingChange:i,liveStructureFetch:s}){let[u,l]=(0,B.useState)([]),[c,f]=(0,B.useState)(null),[m,p]=(0,B.useState)(!1),[_,L]=(0,B.useState)("idle"),[k,P]=(0,B.useState)(null),[E,S]=(0,B.useState)(n??[]),[A,x]=(0,B.useState)(null),[V,M]=(0,B.useState)(null),[T,g]=(0,B.useState)(""),[I,v]=(0,B.useState)(""),[C,b]=(0,B.useState)(!1),[w,Ae]=(0,B.useState)(null),[he,ye]=(0,B.useState)(!1),[oi,Hn]=(0,B.useState)(null),[ui,or]=(0,B.useState)(null),[_a,rs]=(0,B.useState)(0),[Qo,is]=(0,B.useState)(!0),[Yo,ur]=(0,B.useState)(null),[Xo,lr]=(0,B.useState)(!1),[ss,$o]=(0,B.useState)(!1),[cm,Jo]=(0,B.useState)(null),[Wc,cr]=(0,B.useState)(!1),os=(0,B.useRef)({x:0,y:0}),dr=(0,B.useRef)(null),Gn=(0,B.useRef)(null),Ia=(0,B.useRef)(null),li=(0,B.useRef)(null),Ge=(0,B.useRef)(null),dt=(0,B.useRef)(u),Dn=(0,B.useRef)(_),Kc=(0,B.useRef)(null),Zo=(0,B.useRef)(!1),Nt=(0,B.useRef)(null),Ta=(0,B.useRef)(null),us=(0,B.useRef)(null),ls=(0,B.useRef)(null),Sa=(0,B.useRef)(null);(0,B.useEffect)(()=>{Dn.current=_},[_]),(0,B.useEffect)(()=>(_==="focus_mode"||_==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[_]),(0,B.useEffect)(()=>{if(_!=="voice_listening"){Sa.current!=null&&(cancelAnimationFrame(Sa.current),Sa.current=null),Ta.current?.getTracks().forEach(pe=>pe.stop()),Ta.current=null,us.current?.close().catch(()=>{}),us.current=null,ls.current=null,rs(0);return}let z=ls.current;if(!z)return;let W=new Uint8Array(z.frequencyBinCount),G,X=()=>{z.getByteFrequencyData(W);let pe=W.reduce((mn,cs)=>mn+cs,0),Ve=W.length?pe/W.length:0,it=Math.min(1,Ve/128);rs(it),G=requestAnimationFrame(X)};return G=requestAnimationFrame(X),Sa.current=G,()=>{cancelAnimationFrame(G),Sa.current=null}},[_]),(0,B.useEffect)(()=>{Kc.current=V},[V]),(0,B.useEffect)(()=>{Zo.current=am.includes(_)},[_]);let eu=(0,B.useRef)(!1);(0,B.useEffect)(()=>{if(!i)return;am.includes(_)?(eu.current=!0,i(!0)):eu.current&&(eu.current=!1,i(!1))},[_,i]),(0,B.useEffect)(()=>{if(_!=="voice_listening"||!s||!c){or(null),Nt.current&&(clearTimeout(Nt.current),Nt.current=null);return}let W=(u.find(G=>G.id===c)?.transcript??"").trim();if(W.length<PB){Nt.current&&(clearTimeout(Nt.current),Nt.current=null);return}return Nt.current&&clearTimeout(Nt.current),Nt.current=setTimeout(()=>{Nt.current=null,s(W).then(G=>{G&&Dn.current==="voice_listening"&&or(G)}).catch(()=>{})},DB),()=>{Nt.current&&(clearTimeout(Nt.current),Nt.current=null)}},[_,c,u,s]);let Qc=(0,B.useCallback)(z=>{z===!1&&(Zo.current||e||am.includes(Dn.current)||Kc.current)||p(z)},[e]),tu=(0,B.useCallback)(()=>{p(z=>!z)},[]);(0,B.useEffect)(()=>{Ge.current=c},[c]),(0,B.useEffect)(()=>{dt.current=u},[u]),(0,B.useEffect)(()=>{let z=G=>{if(!he||!dr.current)return;G.preventDefault();let X=dr.current.offsetWidth,pe=dr.current.offsetHeight,Ve=G.clientX-os.current.x,it=G.clientY-os.current.y,mn=window.innerWidth-X-nm,cs=window.innerHeight-pe-nm;Ve=Math.max(nm,Math.min(Ve,mn)),it=Math.max(nm,Math.min(it,cs)),Ae({x:Ve,y:it})},W=()=>{he&&(ye(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",z),window.addEventListener("mouseup",W),()=>{window.removeEventListener("mousemove",z),window.removeEventListener("mouseup",W)}},[he]);let nu=(0,B.useCallback)(z=>{if(z.button!==0||!dr.current)return;let W=dr.current.getBoundingClientRect();ye(!0),document.body.style.userSelect="none",os.current={x:z.clientX-W.left,y:z.clientY-W.top},Ae({x:W.left,y:W.top})},[]),fr=(0,B.useCallback)(()=>{if(Gn.current)return;let z=document.createElement("div");z.id="echly-capture-root",document.body.appendChild(z),Gn.current=z,Jo(z),$o(!0)},[]),$t=(0,B.useCallback)(()=>{if(Gn.current){try{document.body.removeChild(Gn.current)}catch(z){console.error("CaptureWidget error:",z)}Gn.current=null}Jo(null),$o(!1)},[]),Jt=(0,B.useCallback)(()=>{L("idle"),p(Qo)},[Qo]);(0,B.useEffect)(()=>{if(n!=null){S(n);return}if(!t)return;(async()=>{let W=await Ek(t);S(W.map(G=>({id:G.id,title:G.title,description:G.description,type:G.type})))})()},[t,n]),(0,B.useEffect)(()=>{let z=window.SpeechRecognition||window.webkitSpeechRecognition;if(!z)return;let W=new z;return W.continuous=!0,W.interimResults=!0,W.lang="en-US",W.onresult=G=>{let X="";for(let Ve=G.resultIndex;Ve<G.results.length;++Ve){let it=G.results[Ve];it&&it[0]&&(X+=it[0].transcript)}let pe=Ge.current;pe&&l(Ve=>Ve.map(it=>it.id===pe?{...it,transcript:X}:it))},W.onend=()=>{let G=Dn.current;G==="processing"||G==="success"||L("idle")},Ia.current=W,()=>{try{W.stop()}catch(G){console.error("CaptureWidget error:",G)}}},[]);let qt=(0,B.useCallback)(async()=>{try{let z=await navigator.mediaDevices.getUserMedia({audio:!0});Ta.current=z;let W=new AudioContext,G=W.createAnalyser();G.fftSize=256,G.smoothingTimeConstant=.7,W.createMediaStreamSource(z).connect(G),us.current=W,ls.current=G,Ia.current?.start(),L("voice_listening"),rs(0)}catch(z){console.error("Microphone permission denied:",z),P("Microphone permission denied."),L("error"),$t(),Jt()}},[]),au=(0,B.useCallback)(async()=>{typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),Ik(),Ia.current?.stop();let z=Ge.current;if(!z){L("idle");return}let G=dt.current.find(X=>X.id===z);if(!G||!G.transcript.trim()){L("idle");return}if(L("processing"),e){a(G.transcript,G.screenshot,{onSuccess:X=>{S(pe=>[{id:X.id,title:X.title,description:X.description,type:X.type},...pe]),l(pe=>pe.filter(Ve=>Ve.id!==z)),f(null),ur(X.id),setTimeout(()=>ur(null),1200),cr(!0),setTimeout(()=>cr(!1),200),lr(!0),setTimeout(()=>{$t(),Jt(),lr(!1)},120)},onError:()=>{P("AI processing failed."),L("voice_listening")}},G.context??void 0);return}try{let X=await a(G.transcript,G.screenshot);if(!X){L("idle"),$t(),Jt();return}S(pe=>[{id:X.id,title:X.title,description:X.description,type:X.type},...pe]),l(pe=>pe.filter(Ve=>Ve.id!==z)),f(null),ur(X.id),setTimeout(()=>ur(null),1200),cr(!0),setTimeout(()=>cr(!1),200),lr(!0),setTimeout(()=>{$t(),Jt(),lr(!1)},120)}catch(X){console.error(X),P("AI processing failed."),L("voice_listening")}},[a,e,$t,Jt]),va=(0,B.useCallback)(()=>{Ia.current?.stop();let z=Ge.current;l(W=>W.filter(G=>G.id!==z)),f(null),L("cancelled"),$t(),Jt()},[$t,Jt]);(0,B.useEffect)(()=>{if(!ss)return;let z=W=>{W.key==="Escape"&&(W.preventDefault(),am.includes(Dn.current)&&va())};return document.addEventListener("keydown",z),()=>document.removeEventListener("keydown",z)},[ss,va]);let ru=(0,B.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),hr=(0,B.useCallback)(()=>{S([]),l([]),f(null),L("idle"),x(null),M(null),b(!1)},[]);(0,B.useEffect)(()=>{if(e)return;let z=W=>{let G=W.target;li.current&&G&&!li.current.contains(G)&&b(!1)};return document.addEventListener("mousedown",z),()=>document.removeEventListener("mousedown",z)},[e]);let iu=(0,B.useCallback)(async z=>{try{await r(z),S(W=>W.filter(G=>G.id!==z))}catch(W){console.error("Delete failed:",W)}},[r]),ft=(0,B.useCallback)(z=>{M(z.id),g(z.title),v(z.description)},[]),su=(0,B.useCallback)(async z=>{let W=T.trim()||T,G=I;S(X=>X.map(pe=>pe.id===z?{...pe,title:W||pe.title,description:G}:pe)),M(null);try{let X=await _k(`/api/tickets/${z}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:W||T,description:G})}),pe=await X.json();if(X.ok&&pe.success&&pe.ticket){let Ve=pe.ticket;S(it=>it.map(mn=>mn.id===z?{...mn,title:Ve.title,description:Ve.description,type:Ve.type??mn.type}:mn))}}catch(X){console.error("Save edit failed:",X)}},[T,I]),jn=(0,B.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?new Promise((z,W)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},G=>{!G||!G.success?W(new Error("Capture failed")):z(G.image??null)})}):Promise.resolve(null),[]),pr=(0,B.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return jn();let{captureScreenshot:z}=await Promise.resolve().then(()=>(Ck(),wk));return z()},[jn]),Yc=(0,B.useCallback)(()=>{L("region_selecting")},[]),Xc=(0,B.useCallback)((z,W)=>{let G=Ak(),X={id:G,screenshot:z,transcript:"",structuredOutput:null,context:W??null,createdAt:Date.now()};l(pe=>[...pe,X]),f(G),qt()},[qt]),pn=(0,B.useCallback)(()=>{L("cancelled"),$t(),Jt()},[$t,Jt]),$c=(0,B.useCallback)(async()=>{if(Dn.current==="idle"&&(P(null),Ia.current?.stop(),is(m),p(!1),fr(),L("focus_mode"),!e))try{let z=await pr();if(!z){pn();return}let W=Ak(),G={id:W,screenshot:z,transcript:"",structuredOutput:null,createdAt:Date.now()};l(X=>[...X,G]),f(W),qt()}catch(z){console.error(z),P("Screen capture failed."),L("error"),pn()}},[e,m,pr,qt,fr,pn]),dm=(0,B.useMemo)(()=>({setIsOpen:Qc,toggleOpen:tu,startDrag:nu,handleShare:ru,setShowMenu:b,resetSession:hr,startListening:qt,finishListening:au,discardListening:va,deletePointer:iu,startEditing:ft,saveEdit:su,setExpandedId:x,setEditedTitle:g,setEditedDescription:v,handleAddFeedback:$c,handleRegionCaptured:Xc,handleRegionSelectStart:Yc,handleCancelCapture:pn,getFullTabImage:jn}),[Qc,tu,nu,ru,hr,qt,au,va,iu,ft,su,$c,Xc,Yc,pn,jn]),mr=(0,B.useMemo)(()=>c?u.find(z=>z.id===c):null,[c,u]),Jc=(0,B.useMemo)(()=>_!=="voice_listening"?"neutral":kB(mr?.transcript??""),[_,mr?.transcript]),Zc=mr?.transcript?.trim()??"";return{state:{isOpen:m,state:_,errorMessage:k,pointers:E,expandedId:A,editingId:V,editedTitle:T,editedDescription:I,showMenu:C,position:w,liveStructured:ui,liveTranscript:Zc,listeningAudioLevel:_a,listeningSentiment:Jc,highlightTicketId:Yo,pillExiting:Xo,orbSuccess:Wc},handlers:dm,refs:{widgetRef:dr,menuRef:li,captureRootRef:Gn},captureRootReady:ss,captureRootEl:cm}}var im=_e(Pn());var rm=(...t)=>t.filter((e,n,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===n).join(" ").trim();var Lk=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var Rk=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,a)=>a?a.toUpperCase():n.toLowerCase());var ZS=t=>{let e=Rk(t);return e.charAt(0).toUpperCase()+e.slice(1)};var Bc=_e(Pn());var xk={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var kk=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var Dk=(0,Bc.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:r="",children:i,iconNode:s,...u},l)=>(0,Bc.createElement)("svg",{ref:l,...xk,width:e,height:e,stroke:t,strokeWidth:a?Number(n)*24/Number(e):n,className:rm("lucide",r),...!i&&!kk(u)&&{"aria-hidden":"true"},...u},[...s.map(([c,f])=>(0,Bc.createElement)(c,f)),...Array.isArray(i)?i:[i]]));var ya=(t,e)=>{let n=(0,im.forwardRef)(({className:a,...r},i)=>(0,im.createElement)(Dk,{ref:i,iconNode:e,className:rm(`lucide-${Lk(ZS(t))}`,`lucide-${t}`,a),...r}));return n.displayName=ZS(t),n};var OB=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],qc=ya("check",OB);var NB=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],zc=ya("expand",NB);var MB=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],Hc=ya("pencil",MB);var UB=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],Gc=ya("trash-2",UB);var VB=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],jc=ya("x",VB);var Ot=_e(lt()),qB=()=>(0,Ot.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,Ot.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,Ot.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),zB=()=>(0,Ot.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,Ot.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function ev({onClose:t,summary:e=null,theme:n="dark",onThemeToggle:a}){return(0,Ot.jsxs)("div",{className:"echly-sidebar-header",children:[(0,Ot.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,Ot.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,Ot.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),a&&(0,Ot.jsx)("button",{type:"button",id:"theme-toggle",onClick:a,className:"echly-theme-toggle","aria-label":n==="dark"?"Switch to light mode":"Switch to dark mode",children:n==="dark"?(0,Ot.jsx)(qB,{}):(0,Ot.jsx)(zB,{})}),(0,Ot.jsx)("button",{type:"button",onClick:t,className:"echly-sidebar-close","aria-label":"Close",children:(0,Ot.jsx)(jc,{size:16,strokeWidth:1.5})})]})}var ar=_e(Pn());var Me=_e(lt());function HB(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function GB({item:t,expandedId:e,editingId:n,editedTitle:a,editedDescription:r,onExpand:i,onStartEdit:s,onSaveEdit:u,onDelete:l,onEditedTitleChange:c,onEditedDescriptionChange:f,highlightTicketId:m=null}){let p=e===t.id,_=n===t.id,L=m===t.id,k=HB(t.type),[P,E]=(0,ar.useState)(!1),S=(0,ar.useCallback)(()=>{i(p?null:t.id)},[p,t.id,i]),A=(0,ar.useCallback)(()=>{s(t)},[t,s]),x=(0,ar.useCallback)(()=>{u(t.id),E(!0),setTimeout(()=>E(!1),220)},[t.id,u]),V=(0,ar.useCallback)(()=>{l(t.id)},[t.id,l]);return(0,Me.jsxs)("div",{className:`echly-feedback-item ${L?"echly-ticket-highlight":""}`,"data-priority":k,children:[(0,Me.jsx)("span",{className:"echly-priority-dot","aria-hidden":!0}),(0,Me.jsxs)("div",{className:"echly-feedback-item-inner",children:[(0,Me.jsx)("div",{className:"echly-feedback-item-content",children:_?(0,Me.jsxs)(Me.Fragment,{children:[(0,Me.jsx)("input",{value:a,onChange:M=>c(M.target.value),className:"echly-widget-input echly-feedback-item-input"}),(0,Me.jsx)("textarea",{value:r,onChange:M=>f(M.target.value),rows:3,className:"echly-widget-input echly-feedback-item-textarea"})]}):(0,Me.jsxs)(Me.Fragment,{children:[(0,Me.jsx)("h3",{className:"echly-widget-item-title",children:t.title}),p&&(0,Me.jsx)("p",{className:"echly-widget-item-desc",children:t.description})]})}),(0,Me.jsxs)("div",{className:"echly-feedback-item-actions",children:[(0,Me.jsx)("button",{type:"button",onClick:S,className:"echly-widget-action-icon","aria-label":p?"Collapse":"Expand",children:(0,Me.jsx)(zc,{size:16,strokeWidth:1.5})}),_?(0,Me.jsx)("button",{type:"button",onClick:x,className:`echly-widget-action-icon echly-widget-action-icon--confirm ${P?"echly-widget-action-icon--confirm-success":""}`,"aria-label":"Save",children:(0,Me.jsx)(qc,{size:16,strokeWidth:1.5})}):(0,Me.jsx)("button",{type:"button",onClick:A,className:"echly-widget-action-icon","aria-label":"Edit",children:(0,Me.jsx)(Hc,{size:16,strokeWidth:1.5})}),(0,Me.jsx)("button",{type:"button",onClick:V,className:"echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,Me.jsx)(Gc,{size:16,strokeWidth:1.5})})]})]})]})}var Mk=ar.default.memo(GB,(t,e)=>t.item===e.item&&t.expandedId===e.expandedId&&t.editingId===e.editingId&&t.editedTitle===e.editedTitle&&t.editedDescription===e.editedDescription&&t.highlightTicketId===e.highlightTicketId);var tv=_e(lt());function nv({isIdle:t,onAddFeedback:e,captureDisabled:n=!1}){let a=!t||n;return(0,tv.jsx)("div",{className:"echly-add-insight-wrap",children:(0,tv.jsx)("button",{type:"button",onClick:a?void 0:e,disabled:a,className:`echly-add-insight-btn ${a?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var Bk=_e(Vm());var ct=_e(Pn());function jB(t){if(!t||!t.getRootNode)return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let n=[],a=t;for(;a&&a!==e.body&&n.length<12;){let r=a.tagName.toLowerCase();if(a.id&&/^[a-zA-Z][\w-]*$/.test(a.id)){r+=`#${a.id}`,n.unshift(r);break}let i=a.parentElement;if(!i)break;let s=i.children,u=0;for(let l=0;l<s.length;l++)if(s[l]===a){u=l+1;break}r+=`:nth-child(${u})`,n.unshift(r),a=i}return n.length===0?null:n.join(" > ")}function WB(t){if(!t)return null;let e=[],n=t.getAttribute("aria-label")||t.placeholder||t.textContent?.trim()||"";n.length>0&&e.push(n.slice(0,120));let a=t.parentElement;for(let i=0;i<3&&a;i++){let s=a.tagName.toLowerCase();if(s==="label"||s==="h1"||s==="h2"||s==="h3"||s==="h4"){let u=a.textContent?.trim().slice(0,80);u&&e.push(u);break}a=a.parentElement}let r=e.filter(Boolean).join(" \xB7 ");return r?r.length>300?r.slice(0,300)+"\u2026":r:null}function Uk(t,e){return{url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:e?jB(e):null,nearbyText:e?WB(e):null,capturedAt:Date.now()}}var av=null;function KB(){if(typeof window>"u")return null;if(!av)try{av=new AudioContext}catch{return null}return av}function Vk(){let t=KB();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(600,e+.04),n.type="sine",a.gain.setValueAtTime(.04,e),a.gain.exponentialRampToValueAtTime(.001,e+.06),n.start(e),n.stop(e+.06)}var rr=_e(lt()),Ko=24,om="cubic-bezier(0.22, 0.61, 0.36, 1)";async function QB(t,e,n){return new Promise((a,r)=>{let i=new Image;i.crossOrigin="anonymous",i.onload=()=>{let s=Math.round(e.x*n),u=Math.round(e.y*n),l=Math.round(e.w*n),c=Math.round(e.h*n),f=document.createElement("canvas");f.width=l,f.height=c;let m=f.getContext("2d");if(!m){r(new Error("No canvas context"));return}m.drawImage(i,s,u,l,c,0,0,l,c);try{a(f.toDataURL("image/png"))}catch(p){r(p)}},i.onerror=()=>r(new Error("Image load failed")),i.src=t})}function Fk({getFullTabImage:t,onAddVoice:e,onCancel:n,onSelectionStart:a}){let[r,i]=(0,ct.useState)(null),[s,u]=(0,ct.useState)(null),[l,c]=(0,ct.useState)(!1),[f,m]=(0,ct.useState)(!1),p=(0,ct.useRef)(null),_=(0,ct.useRef)(null),L=(0,ct.useCallback)(()=>{i(null),u(null),p.current=null,_.current=null,setTimeout(()=>n(),120)},[n]);(0,ct.useEffect)(()=>{let g=I=>{I.key==="Escape"&&(I.preventDefault(),s?(u(null),i(null),_.current=null,p.current=null):L())};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[L,s]),(0,ct.useEffect)(()=>{let g=()=>{document.visibilityState==="hidden"&&L()};return document.addEventListener("visibilitychange",g),()=>document.removeEventListener("visibilitychange",g)},[L]);let k=(0,ct.useCallback)(async g=>{if(l)return;c(!0),Vk(),m(!0),setTimeout(()=>m(!1),150),await new Promise(w=>setTimeout(w,200));let I=null;try{I=await t()}catch{c(!1),n();return}if(!I){c(!1),n();return}let v=typeof window<"u"&&window.devicePixelRatio||1,C;try{C=await QB(I,g,v)}catch{c(!1),n();return}let b=typeof window<"u"?Uk(window,null):null;e(C,b),c(!1),u(null)},[t,e,n,l]),P=(0,ct.useCallback)(()=>{u(null),i(null),_.current=null,p.current=null},[]),E=(0,ct.useCallback)(g=>{if(g.button!==0||s)return;g.preventDefault(),a?.();let I=g.clientX,v=g.clientY;p.current={x:I,y:v},i({x:I,y:v,w:0,h:0})},[a,s]),S=(0,ct.useCallback)(g=>{if(g.button!==0)return;g.preventDefault();let I=_.current,v=p.current;if(p.current=null,!v||!I||I.w<Ko||I.h<Ko){i(null);return}i(null),_.current=null,u({x:I.x,y:I.y,w:I.w,h:I.h})},[]),A=(0,ct.useCallback)(g=>{if(!p.current||s)return;let I=p.current.x,v=p.current.y,C=Math.min(I,g.clientX),b=Math.min(v,g.clientY),w=Math.abs(g.clientX-I),Ae=Math.abs(g.clientY-v),he={x:C,y:b,w,h:Ae};_.current=he,i(he)},[s]);(0,ct.useEffect)(()=>{let g=I=>{if(I.button!==0||!p.current||s)return;let v=_.current,C=p.current;if(p.current=null,!C||!v||v.w<Ko||v.h<Ko){i(null),_.current=null;return}i(null),_.current=null,u({x:v.x,y:v.y,w:v.w,h:v.h})};return window.addEventListener("mouseup",g),()=>window.removeEventListener("mouseup",g)},[s]);let x=!!r&&(r.w>=Ko||r.h>=Ko),V=s!==null,M=x&&r||V&&s,T=V?s:r;return(0,rr.jsxs)("div",{role:"presentation","aria-hidden":!0,className:"echly-region-overlay",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,rr.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:M?"transparent":"rgba(0,0,0,0.35)",pointerEvents:s?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${om}`},onMouseDown:E,onMouseMove:A,onMouseUp:S,onMouseLeave:()=>{!p.current||s||(i(null),p.current=null,_.current=null)}}),(0,rr.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",fontSize:13,color:"rgba(255,255,255,0.8)",zIndex:2147483647,pointerEvents:"none",opacity:s?0:1,transition:`opacity 180ms ${om}`},children:"Drag to capture area \u2014 ESC to cancel"}),M&&T&&(0,rr.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:T.x,top:T.y,width:Math.max(T.w,1),height:Math.max(T.h,1),borderRadius:6,border:`2px solid ${f?"#FFFFFF":"#5B8CFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.35)",pointerEvents:"none",zIndex:2147483646,transition:f?"none":`border-color 150ms ${om}`}}),V&&s&&(0,rr.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:s.x+s.w/2,bottom:Math.max(12,s.y+s.h-48),transform:"translate(-50%, 100%)",display:"flex",gap:8,padding:"8px 12px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${om} forwards`},children:[(0,rr.jsx)("button",{type:"button",onClick:P,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Retake"}),(0,rr.jsx)("button",{type:"button",onClick:()=>k(s),disabled:l,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"linear-gradient(135deg, #5B8CFF, #466EFF)",color:"#fff",fontSize:13,fontWeight:600,cursor:l?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var ir=_e(lt());function qk({captureRoot:t,extensionMode:e,state:n,getFullTabImage:a,onRegionCaptured:r,onRegionSelectStart:i,onCancelCapture:s}){return(0,ir.jsx)(ir.Fragment,{children:(0,Bk.createPortal)((0,ir.jsxs)(ir.Fragment,{children:[(n==="focus_mode"||n==="region_selecting")&&(0,ir.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.04)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),e&&(n==="focus_mode"||n==="region_selecting")&&(0,ir.jsx)(Fk,{getFullTabImage:a,onAddVoice:r,onCancel:s,onSelectionStart:i})]}),t)})}var um=_e(Pn());var sr=_e(lt());function YB(){return(0,sr.jsxs)("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,sr.jsx)("path",{d:"M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"}),(0,sr.jsx)("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2"}),(0,sr.jsx)("line",{x1:"12",x2:"12",y1:"19",y2:"22"})]})}function zk({isRecording:t,isProcessing:e,audioLevel:n}){let a=t&&!e?1+Math.min(.1,n*.1):1;return(0,sr.jsx)("div",{className:["echly-recording-orb-inner",e?"echly-recording-orb-inner--processing":"",t&&!e?"echly-recording-orb-inner--listening":""].filter(Boolean).join(" "),style:t&&!e?{transform:`scale(${a})`}:void 0,"aria-hidden":!0,children:(0,sr.jsx)("span",{className:"echly-recording-orb-icon",style:{color:"#FFFFFF"},children:(0,sr.jsx)(YB,{})})})}var kn=_e(lt());function Hk({visible:t,isActive:e,isProcessing:n,isExiting:a=!1,audioLevel:r,onDone:i,onCancel:s}){let[u,l]=(0,um.useState)(!1);(0,um.useEffect)(()=>{if(e||n){let p=requestAnimationFrame(()=>{requestAnimationFrame(()=>l(!0))});return()=>cancelAnimationFrame(p)}let m=requestAnimationFrame(()=>l(!1));return()=>cancelAnimationFrame(m)},[e,n]);let c=n?"Structuring your feedback\u2026":e?"Listening\u2026":"Tell us what's happening \u2014 we'll structure it.",f=e&&!n;return t?(0,kn.jsx)("div",{className:"echly-recording-row","aria-live":"polite",role:"status",children:(0,kn.jsxs)("div",{className:["echly-recording-capsule",u?"echly-recording-capsule--expanded":"",n?"echly-recording-capsule--processing":"",a?"echly-recording-capsule--exiting":"",e&&!n?"echly-recording-capsule--recording":""].filter(Boolean).join(" "),children:[(0,kn.jsx)("div",{className:"echly-recording-orb",children:(0,kn.jsx)(zk,{isRecording:e,isProcessing:n,audioLevel:r})}),(0,kn.jsxs)("div",{className:"echly-recording-center",children:[(0,kn.jsx)("span",{className:"echly-recording-status",children:c}),f&&(0,kn.jsx)("span",{className:"echly-recording-esc-hint",children:"Press Esc to cancel"}),(0,kn.jsxs)("div",{className:"echly-recording-action-row",children:[(0,kn.jsx)("button",{type:"button",onClick:s,className:"echly-recording-cancel-pill","aria-label":"Cancel recording",children:"Cancel"}),e&&!n&&(0,kn.jsx)("button",{type:"button",className:"echly-recording-done",onClick:i,"aria-label":"Done recording",children:"Done"})]})]})]})}):null}var rt=_e(lt()),XB=["focus_mode","region_selecting","voice_listening","processing"],$B=["voice_listening","processing"];function lm({sessionId:t,userId:e,extensionMode:n=!1,initialPointers:a,onComplete:r,onDelete:i,widgetToggleRef:s,onRecordingChange:u,expanded:l,onExpandRequest:c,onCollapseRequest:f,liveStructureFetch:m,captureDisabled:p=!1,theme:_="dark",onThemeToggle:L}){let{state:k,handlers:P,refs:E,captureRootEl:S}=bk({sessionId:t,userId:e,extensionMode:n,initialPointers:a,onComplete:r,onDelete:i,onRecordingChange:u,liveStructureFetch:m}),x=l!==void 0?l:k.isOpen,V=(0,si.useRef)(null),M=XB.includes(k.state)||k.pillExiting,T=$B.includes(k.state)||k.pillExiting,g=!M,I=!x&&g,v=x&&g,C=(0,si.useRef)(!1);(0,si.useEffect)(()=>{if(!M){C.current=!1;return}C.current||(C.current=!0,f?.())},[M,f]);let b=k.pointers.length,w=k.pointers.filter(he=>/critical|bug|high|urgent/i.test(he.type||"")).length,Ae=b>0?w>0?`${b} insights \u2022 ${w} need attention`:`${b} insights`:null;return(0,si.useEffect)(()=>{k.highlightTicketId&&V.current&&V.current.scrollTo({top:0,behavior:"smooth"})},[k.highlightTicketId]),si.default.useEffect(()=>{if(s)return s.current=P.toggleOpen,()=>{s.current=null}},[P,s]),(0,rt.jsxs)(rt.Fragment,{children:[S&&(0,rt.jsx)(qk,{captureRoot:S,extensionMode:n,state:k.state,getFullTabImage:P.getFullTabImage,onRegionCaptured:P.handleRegionCaptured,onRegionSelectStart:P.handleRegionSelectStart,onCancelCapture:P.handleCancelCapture}),(0,rt.jsx)(Hk,{visible:T,isActive:k.state==="voice_listening",isProcessing:k.state==="processing"||k.pillExiting,isExiting:k.pillExiting,audioLevel:k.listeningAudioLevel??0,sentiment:k.listeningSentiment??"neutral",liveTranscript:k.liveTranscript??"",onDone:P.finishListening,onCancel:P.handleCancelCapture}),I&&(0,rt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,rt.jsx)("button",{type:"button",onClick:()=>c?c():P.setIsOpen(!0),className:"echly-floating-trigger",children:"Capture feedback"})}),v&&(0,rt.jsxs)(rt.Fragment,{children:[!n&&(0,rt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,rt.jsx)("div",{ref:E.widgetRef,className:"echly-sidebar-container",style:n?{position:"fixed",...k.position?{left:k.position.x,top:k.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,rt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,rt.jsx)(ev,{onClose:()=>f?f():P.setIsOpen(!1),summary:Ae,theme:_,onThemeToggle:L}),(0,rt.jsxs)("div",{ref:V,className:"echly-sidebar-body",children:[(0,rt.jsx)("div",{className:"echly-feedback-list",children:k.pointers.map(he=>(0,rt.jsx)(Mk,{item:he,expandedId:k.expandedId,editingId:k.editingId,editedTitle:k.editedTitle,editedDescription:k.editedDescription,onExpand:P.setExpandedId,onStartEdit:P.startEditing,onSaveEdit:P.saveEdit,onDelete:P.deletePointer,onEditedTitleChange:P.setEditedTitle,onEditedDescriptionChange:P.setEditedDescription,highlightTicketId:k.highlightTicketId},he.id))}),k.errorMessage&&(0,rt.jsx)("div",{className:"echly-sidebar-error",children:k.errorMessage}),k.state==="idle"&&(0,rt.jsx)(nv,{isIdle:!0,onAddFeedback:P.handleAddFeedback,captureDisabled:p})]})]})})]})]})}function Gk(...t){}var as=_e(lt()),JB="echly-root",rv="echly-shadow-host",Wk="widget-theme";function ZB(){try{let t=localStorage.getItem(Wk);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function eq(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem(Wk,e)}catch{}}function tq(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function nq({widgetRoot:t,initialTheme:e}){let[n,a]=St.default.useState(null),[r,i]=St.default.useState(null),[s,u]=St.default.useState(!1),[l,c]=St.default.useState(e),[f,m]=St.default.useState({visible:!1,expanded:!1,isRecording:!1,sessionId:null}),p=f.sessionId,_=St.default.useRef(null),L=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";St.default.useEffect(()=>{let M=()=>{_.current?.()};return window.addEventListener("ECHLY_TOGGLE_WIDGET",M),()=>{window.removeEventListener("ECHLY_TOGGLE_WIDGET",M)}},[]),St.default.useEffect(()=>{let M=T=>{let g=T.detail?.state;g&&m(g)};return window.addEventListener("ECHLY_GLOBAL_STATE",M),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",M)},[]),St.default.useEffect(()=>{let M=()=>{let g=window.location.origin;if(!(g==="https://echly-web.vercel.app"||g==="http://localhost:3000"))return;let v=window.location.pathname.split("/").filter(Boolean);v[0]==="dashboard"&&v[1]&&chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:v[1]},()=>{})};M(),window.addEventListener("popstate",M);let T=setInterval(M,2e3);return()=>{window.removeEventListener("popstate",M),clearInterval(T)}},[]);let k=St.default.useCallback(M=>{M?chrome.runtime.sendMessage({type:"START_RECORDING"},T=>{if(chrome.runtime.lastError){i(chrome.runtime.lastError.message||"Failed to start recording");return}T?.ok||i(T?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),P=St.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{})},[]),E=St.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{})},[]),S=St.default.useCallback(()=>{let M=l==="dark"?"light":"dark";c(M),eq(t,M)},[l,t]);St.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},M=>{M?.authenticated&&M.user?.uid?a({uid:M.user.uid,name:M.user.name??null,email:M.user.email??null,photoURL:M.user.photoURL??null}):a(null),u(!0)})},[]);let A=St.default.useCallback(async(M,T,g,I)=>{if(!p||!n){g?.onError();return}if(g){(async()=>{let he=null;if(T)try{let ye=crypto.randomUUID(),oi=`sessions/${p}/feedback/${ye}/${Date.now()}.png`,Hn=SL(m0,oi);await IL(Hn,T,"data_url",{contentType:"image/png"}),he=await TL(Hn)}catch(ye){console.error("[Echly] Screenshot upload failed:",ye),g.onError();return}chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:M,screenshotUrl:he,sessionId:p,context:I??null}},ye=>{if(chrome.runtime.lastError){console.error("Runtime error",chrome.runtime.lastError),g?.onError();return}if(!ye?.success||!ye.ticket){console.error("No success in response",ye),g?.onError();return}Gk("[CONTENT] Ticket received:",ye.ticket),g?.onSuccess({id:ye.ticket.id,title:ye.ticket.title,description:ye.ticket.description,type:ye.ticket.type??"Feedback"})})})();return}let C=await(await Tp("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:M})})).json(),b=Array.isArray(C.tickets)?C.tickets:[];if(!C.success||b.length===0)return;let w=null;if(b.length>0&&T){let he=y0();w=await _0(T,p,he)}let Ae;for(let he=0;he<b.length;he++){let ye=b[he],oi=typeof ye.description=="string"?ye.description:ye.title??"",Hn={sessionId:p,title:ye.title??"",description:oi,type:Array.isArray(ye.suggestedTags)&&ye.suggestedTags[0]?ye.suggestedTags[0]:"Feedback",contextSummary:oi,actionSteps:Array.isArray(ye.actionSteps)?ye.actionSteps:[],suggestedTags:ye.suggestedTags,screenshotUrl:he===0?w:null,metadata:{clientTimestamp:Date.now()}},or=await(await Tp("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Hn)})).json();if(or.success&&or.ticket){let _a=or.ticket;Ae||(Ae={id:_a.id,title:_a.title,description:_a.description,type:_a.type??"Feedback"})}}return Ae},[p,n]),x=St.default.useCallback(async M=>{},[]),V=St.default.useCallback(async M=>{try{let g=await(await Tp("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:M.trim()})})).json();if(!g.success||!Array.isArray(g.tickets)||g.tickets.length===0)return null;let I=g.tickets[0],v=typeof I.title=="string"?I.title:"",C=Array.isArray(I.suggestedTags)?I.suggestedTags:[];return{title:v,tags:C,priority:"medium"}}catch{return null}},[]);return s?n?(0,as.jsx)(lm,{sessionId:p??"",userId:n.uid,extensionMode:!0,onComplete:A,onDelete:x,widgetToggleRef:_,onRecordingChange:k,expanded:f.expanded,onExpandRequest:P,onCollapseRequest:E,liveStructureFetch:V,captureDisabled:!p,theme:l,onThemeToggle:S}):(0,as.jsx)("div",{style:{pointerEvents:"auto"},children:(0,as.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:tq,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,as.jsx)("img",{src:L,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})}):null}var aq=`
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif;
  }
  #echly-root * { box-sizing: border-box; }
`;function rq(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let n=document.createElement("style");n.id="echly-reset",n.textContent=aq,t.appendChild(n)}function iq(t){let e=t.attachShadow({mode:"open"});rq(e);let n=document.createElement("div");n.id=JB,n.style.all="initial",n.style.boxSizing="border-box",n.style.pointerEvents="auto",n.style.width="auto",n.style.height="auto";let a=ZB();n.setAttribute("data-theme",a),e.appendChild(n),(0,jk.createRoot)(n).render((0,as.jsx)(nq,{widgetRoot:n,initialTheme:a}))}function sq(t){chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},e=>{e&&(t.style.display=e.visible?"block":"none",window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:{visible:e.visible??!1,expanded:e.expanded??!1,isRecording:e.isRecording??!1,sessionId:e.sessionId??null}}})))})}function oq(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(n=>{if(n.type==="ECHLY_FEEDBACK_CREATED"&&n.ticket&&n.sessionId){window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:n.ticket,sessionId:n.sessionId}}));return}let a=document.getElementById(rv);a&&(n.type==="ECHLY_GLOBAL_STATE"&&n.state&&(a.style.display=n.state.visible?"block":"none",window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:n.state}}))),n.type==="ECHLY_TOGGLE"&&window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET")))}))}function uq(){let t=document.getElementById(rv);t||(t=document.createElement("div"),t.id=rv,t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),iq(t)),oq(t),sq(t)}uq();})();
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/logger/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/register-7238101c.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/web-extension-esm/index.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js:
  (** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  *)
  (** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  *)

@firebase/webchannel-wrapper/dist/webchannel-blob/esm/webchannel_blob_es2018.js:
  (** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  *)
  (** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law | agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/common-091f2944.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm/index-3398f4bb.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

lucide-react/dist/esm/shared/src/utils/mergeClasses.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils/toKebabCase.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils/toCamelCase.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils/toPascalCase.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/defaultAttributes.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils/hasA11yProp.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/Icon.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/createLucideIcon.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/check.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/expand.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/pencil.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/trash-2.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/x.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
