"use strict";(()=>{var mP=Object.create;var Lm=Object.defineProperty;var gP=Object.getOwnPropertyDescriptor;var yP=Object.getOwnPropertyNames;var _P=Object.getPrototypeOf,IP=Object.prototype.hasOwnProperty;var eE=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,n)=>(typeof require<"u"?require:e)[n]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var TP=(t,e)=>()=>(t&&(e=t(t=0)),e);var Ie=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),SP=(t,e)=>{for(var n in e)Lm(t,n,{get:e[n],enumerable:!0})},vP=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of yP(e))!IP.call(t,r)&&r!==n&&Lm(t,r,{get:()=>e[r],enumerable:!(a=gP(e,r))||a.enumerable});return t};var Ce=(t,e,n)=>(n=t!=null?mP(_P(t)):{},vP(e||!t||!t.__esModule?Lm(n,"default",{value:t,enumerable:!0}):n,t));var dE=Ie(ae=>{"use strict";var km=Symbol.for("react.transitional.element"),EP=Symbol.for("react.portal"),wP=Symbol.for("react.fragment"),CP=Symbol.for("react.strict_mode"),AP=Symbol.for("react.profiler"),bP=Symbol.for("react.consumer"),LP=Symbol.for("react.context"),RP=Symbol.for("react.forward_ref"),xP=Symbol.for("react.suspense"),kP=Symbol.for("react.memo"),iE=Symbol.for("react.lazy"),DP=Symbol.for("react.activity"),tE=Symbol.iterator;function PP(t){return t===null||typeof t!="object"?null:(t=tE&&t[tE]||t["@@iterator"],typeof t=="function"?t:null)}var sE={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},oE=Object.assign,uE={};function Is(t,e,n){this.props=t,this.context=e,this.refs=uE,this.updater=n||sE}Is.prototype.isReactComponent={};Is.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Is.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function lE(){}lE.prototype=Is.prototype;function Dm(t,e,n){this.props=t,this.context=e,this.refs=uE,this.updater=n||sE}var Pm=Dm.prototype=new lE;Pm.constructor=Dm;oE(Pm,Is.prototype);Pm.isPureReactComponent=!0;var nE=Array.isArray;function xm(){}var Me={H:null,A:null,T:null,S:null},cE=Object.prototype.hasOwnProperty;function Om(t,e,n){var a=n.ref;return{$$typeof:km,type:t,key:e,ref:a!==void 0?a:null,props:n}}function OP(t,e){return Om(t.type,e,t.props)}function Nm(t){return typeof t=="object"&&t!==null&&t.$$typeof===km}function NP(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var aE=/\/+/g;function Rm(t,e){return typeof t=="object"&&t!==null&&t.key!=null?NP(""+t.key):e.toString(36)}function MP(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(xm,xm):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function _s(t,e,n,a,r){var i=typeof t;(i==="undefined"||i==="boolean")&&(t=null);var s=!1;if(t===null)s=!0;else switch(i){case"bigint":case"string":case"number":s=!0;break;case"object":switch(t.$$typeof){case km:case EP:s=!0;break;case iE:return s=t._init,_s(s(t._payload),e,n,a,r)}}if(s)return r=r(t),s=a===""?"."+Rm(t,0):a,nE(r)?(n="",s!=null&&(n=s.replace(aE,"$&/")+"/"),_s(r,e,n,"",function(c){return c})):r!=null&&(Nm(r)&&(r=OP(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(aE,"$&/")+"/")+s)),e.push(r)),1;s=0;var u=a===""?".":a+":";if(nE(t))for(var l=0;l<t.length;l++)a=t[l],i=u+Rm(a,l),s+=_s(a,e,n,i,r);else if(l=PP(t),typeof l=="function")for(t=l.call(t),l=0;!(a=t.next()).done;)a=a.value,i=u+Rm(a,l++),s+=_s(a,e,n,i,r);else if(i==="object"){if(typeof t.then=="function")return _s(MP(t),e,n,a,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return s}function hd(t,e,n){if(t==null)return t;var a=[],r=0;return _s(t,a,"","",function(i){return e.call(n,i,r++)}),a}function UP(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var rE=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},VP={map:hd,forEach:function(t,e,n){hd(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return hd(t,function(){e++}),e},toArray:function(t){return hd(t,function(e){return e})||[]},only:function(t){if(!Nm(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};ae.Activity=DP;ae.Children=VP;ae.Component=Is;ae.Fragment=wP;ae.Profiler=AP;ae.PureComponent=Dm;ae.StrictMode=CP;ae.Suspense=xP;ae.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Me;ae.__COMPILER_RUNTIME={__proto__:null,c:function(t){return Me.H.useMemoCache(t)}};ae.cache=function(t){return function(){return t.apply(null,arguments)}};ae.cacheSignal=function(){return null};ae.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var a=oE({},t.props),r=t.key;if(e!=null)for(i in e.key!==void 0&&(r=""+e.key),e)!cE.call(e,i)||i==="key"||i==="__self"||i==="__source"||i==="ref"&&e.ref===void 0||(a[i]=e[i]);var i=arguments.length-2;if(i===1)a.children=n;else if(1<i){for(var s=Array(i),u=0;u<i;u++)s[u]=arguments[u+2];a.children=s}return Om(t.type,r,a)};ae.createContext=function(t){return t={$$typeof:LP,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:bP,_context:t},t};ae.createElement=function(t,e,n){var a,r={},i=null;if(e!=null)for(a in e.key!==void 0&&(i=""+e.key),e)cE.call(e,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(r[a]=e[a]);var s=arguments.length-2;if(s===1)r.children=n;else if(1<s){for(var u=Array(s),l=0;l<s;l++)u[l]=arguments[l+2];r.children=u}if(t&&t.defaultProps)for(a in s=t.defaultProps,s)r[a]===void 0&&(r[a]=s[a]);return Om(t,i,r)};ae.createRef=function(){return{current:null}};ae.forwardRef=function(t){return{$$typeof:RP,render:t}};ae.isValidElement=Nm;ae.lazy=function(t){return{$$typeof:iE,_payload:{_status:-1,_result:t},_init:UP}};ae.memo=function(t,e){return{$$typeof:kP,type:t,compare:e===void 0?null:e}};ae.startTransition=function(t){var e=Me.T,n={};Me.T=n;try{var a=t(),r=Me.S;r!==null&&r(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(xm,rE)}catch(i){rE(i)}finally{e!==null&&n.types!==null&&(e.types=n.types),Me.T=e}};ae.unstable_useCacheRefresh=function(){return Me.H.useCacheRefresh()};ae.use=function(t){return Me.H.use(t)};ae.useActionState=function(t,e,n){return Me.H.useActionState(t,e,n)};ae.useCallback=function(t,e){return Me.H.useCallback(t,e)};ae.useContext=function(t){return Me.H.useContext(t)};ae.useDebugValue=function(){};ae.useDeferredValue=function(t,e){return Me.H.useDeferredValue(t,e)};ae.useEffect=function(t,e){return Me.H.useEffect(t,e)};ae.useEffectEvent=function(t){return Me.H.useEffectEvent(t)};ae.useId=function(){return Me.H.useId()};ae.useImperativeHandle=function(t,e,n){return Me.H.useImperativeHandle(t,e,n)};ae.useInsertionEffect=function(t,e){return Me.H.useInsertionEffect(t,e)};ae.useLayoutEffect=function(t,e){return Me.H.useLayoutEffect(t,e)};ae.useMemo=function(t,e){return Me.H.useMemo(t,e)};ae.useOptimistic=function(t,e){return Me.H.useOptimistic(t,e)};ae.useReducer=function(t,e,n){return Me.H.useReducer(t,e,n)};ae.useRef=function(t){return Me.H.useRef(t)};ae.useState=function(t){return Me.H.useState(t)};ae.useSyncExternalStore=function(t,e,n){return Me.H.useSyncExternalStore(t,e,n)};ae.useTransition=function(){return Me.H.useTransition()};ae.version="19.2.3"});var Wn=Ie((W4,fE)=>{"use strict";fE.exports=dE()});var vE=Ie(Be=>{"use strict";function Fm(t,e){var n=t.length;t.push(e);e:for(;0<n;){var a=n-1>>>1,r=t[a];if(0<pd(r,e))t[a]=e,t[n]=r,n=a;else break e}}function sa(t){return t.length===0?null:t[0]}function gd(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var a=0,r=t.length,i=r>>>1;a<i;){var s=2*(a+1)-1,u=t[s],l=s+1,c=t[l];if(0>pd(u,n))l<r&&0>pd(c,u)?(t[a]=c,t[l]=n,a=l):(t[a]=u,t[s]=n,a=s);else if(l<r&&0>pd(c,n))t[a]=c,t[l]=n,a=l;else break e}}return e}function pd(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}Be.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(hE=performance,Be.unstable_now=function(){return hE.now()}):(Mm=Date,pE=Mm.now(),Be.unstable_now=function(){return Mm.now()-pE});var hE,Mm,pE,Na=[],xr=[],FP=1,Rn=null,qt=3,Bm=!1,Iu=!1,Tu=!1,qm=!1,yE=typeof setTimeout=="function"?setTimeout:null,_E=typeof clearTimeout=="function"?clearTimeout:null,mE=typeof setImmediate<"u"?setImmediate:null;function md(t){for(var e=sa(xr);e!==null;){if(e.callback===null)gd(xr);else if(e.startTime<=t)gd(xr),e.sortIndex=e.expirationTime,Fm(Na,e);else break;e=sa(xr)}}function zm(t){if(Tu=!1,md(t),!Iu)if(sa(Na)!==null)Iu=!0,Ss||(Ss=!0,Ts());else{var e=sa(xr);e!==null&&Hm(zm,e.startTime-t)}}var Ss=!1,Su=-1,IE=5,TE=-1;function SE(){return qm?!0:!(Be.unstable_now()-TE<IE)}function Um(){if(qm=!1,Ss){var t=Be.unstable_now();TE=t;var e=!0;try{e:{Iu=!1,Tu&&(Tu=!1,_E(Su),Su=-1),Bm=!0;var n=qt;try{t:{for(md(t),Rn=sa(Na);Rn!==null&&!(Rn.expirationTime>t&&SE());){var a=Rn.callback;if(typeof a=="function"){Rn.callback=null,qt=Rn.priorityLevel;var r=a(Rn.expirationTime<=t);if(t=Be.unstable_now(),typeof r=="function"){Rn.callback=r,md(t),e=!0;break t}Rn===sa(Na)&&gd(Na),md(t)}else gd(Na);Rn=sa(Na)}if(Rn!==null)e=!0;else{var i=sa(xr);i!==null&&Hm(zm,i.startTime-t),e=!1}}break e}finally{Rn=null,qt=n,Bm=!1}e=void 0}}finally{e?Ts():Ss=!1}}}var Ts;typeof mE=="function"?Ts=function(){mE(Um)}:typeof MessageChannel<"u"?(Vm=new MessageChannel,gE=Vm.port2,Vm.port1.onmessage=Um,Ts=function(){gE.postMessage(null)}):Ts=function(){yE(Um,0)};var Vm,gE;function Hm(t,e){Su=yE(function(){t(Be.unstable_now())},e)}Be.unstable_IdlePriority=5;Be.unstable_ImmediatePriority=1;Be.unstable_LowPriority=4;Be.unstable_NormalPriority=3;Be.unstable_Profiling=null;Be.unstable_UserBlockingPriority=2;Be.unstable_cancelCallback=function(t){t.callback=null};Be.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):IE=0<t?Math.floor(1e3/t):5};Be.unstable_getCurrentPriorityLevel=function(){return qt};Be.unstable_next=function(t){switch(qt){case 1:case 2:case 3:var e=3;break;default:e=qt}var n=qt;qt=e;try{return t()}finally{qt=n}};Be.unstable_requestPaint=function(){qm=!0};Be.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=qt;qt=t;try{return e()}finally{qt=n}};Be.unstable_scheduleCallback=function(t,e,n){var a=Be.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:FP++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>a?(t.sortIndex=n,Fm(xr,t),sa(Na)===null&&t===sa(xr)&&(Tu?(_E(Su),Su=-1):Tu=!0,Hm(zm,n-a))):(t.sortIndex=r,Fm(Na,t),Iu||Bm||(Iu=!0,Ss||(Ss=!0,Ts()))),t};Be.unstable_shouldYield=SE;Be.unstable_wrapCallback=function(t){var e=qt;return function(){var n=qt;qt=e;try{return t.apply(this,arguments)}finally{qt=n}}}});var wE=Ie((Y4,EE)=>{"use strict";EE.exports=vE()});var AE=Ie(Kt=>{"use strict";var BP=Wn();function CE(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function kr(){}var Wt={d:{f:kr,r:function(){throw Error(CE(522))},D:kr,C:kr,L:kr,m:kr,X:kr,S:kr,M:kr},p:0,findDOMNode:null},qP=Symbol.for("react.portal");function zP(t,e,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:qP,key:a==null?null:""+a,children:t,containerInfo:e,implementation:n}}var vu=BP.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function yd(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}Kt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Wt;Kt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(CE(299));return zP(t,e,null,n)};Kt.flushSync=function(t){var e=vu.T,n=Wt.p;try{if(vu.T=null,Wt.p=2,t)return t()}finally{vu.T=e,Wt.p=n,Wt.d.f()}};Kt.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,Wt.d.C(t,e))};Kt.prefetchDNS=function(t){typeof t=="string"&&Wt.d.D(t)};Kt.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,a=yd(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,i=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?Wt.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:a,integrity:r,fetchPriority:i}):n==="script"&&Wt.d.X(t,{crossOrigin:a,integrity:r,fetchPriority:i,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};Kt.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=yd(e.as,e.crossOrigin);Wt.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&Wt.d.M(t)};Kt.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,a=yd(n,e.crossOrigin);Wt.d.L(t,n,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};Kt.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=yd(e.as,e.crossOrigin);Wt.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else Wt.d.m(t)};Kt.requestFormReset=function(t){Wt.d.r(t)};Kt.unstable_batchedUpdates=function(t,e){return t(e)};Kt.useFormState=function(t,e,n){return vu.H.useFormState(t,e,n)};Kt.useFormStatus=function(){return vu.H.useHostTransitionStatus()};Kt.version="19.2.3"});var Gm=Ie((X4,LE)=>{"use strict";function bE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(bE)}catch(t){console.error(t)}}bE(),LE.exports=AE()});var Bb=Ie(Hf=>{"use strict";var _t=wE(),eC=Wn(),HP=Gm();function M(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function tC(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function ul(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function nC(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function aC(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function RE(t){if(ul(t)!==t)throw Error(M(188))}function GP(t){var e=t.alternate;if(!e){if(e=ul(t),e===null)throw Error(M(188));return e!==t?null:t}for(var n=t,a=e;;){var r=n.return;if(r===null)break;var i=r.alternate;if(i===null){if(a=r.return,a!==null){n=a;continue}break}if(r.child===i.child){for(i=r.child;i;){if(i===n)return RE(r),t;if(i===a)return RE(r),e;i=i.sibling}throw Error(M(188))}if(n.return!==a.return)n=r,a=i;else{for(var s=!1,u=r.child;u;){if(u===n){s=!0,n=r,a=i;break}if(u===a){s=!0,a=r,n=i;break}u=u.sibling}if(!s){for(u=i.child;u;){if(u===n){s=!0,n=i,a=r;break}if(u===a){s=!0,a=i,n=r;break}u=u.sibling}if(!s)throw Error(M(189))}}if(n.alternate!==a)throw Error(M(190))}if(n.tag!==3)throw Error(M(188));return n.stateNode.current===n?t:e}function rC(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=rC(t),e!==null)return e;t=t.sibling}return null}var Fe=Object.assign,jP=Symbol.for("react.element"),_d=Symbol.for("react.transitional.element"),xu=Symbol.for("react.portal"),bs=Symbol.for("react.fragment"),iC=Symbol.for("react.strict_mode"),wg=Symbol.for("react.profiler"),sC=Symbol.for("react.consumer"),Ha=Symbol.for("react.context"),Iy=Symbol.for("react.forward_ref"),Cg=Symbol.for("react.suspense"),Ag=Symbol.for("react.suspense_list"),Ty=Symbol.for("react.memo"),Dr=Symbol.for("react.lazy");Symbol.for("react.scope");var bg=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var WP=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var xE=Symbol.iterator;function Eu(t){return t===null||typeof t!="object"?null:(t=xE&&t[xE]||t["@@iterator"],typeof t=="function"?t:null)}var KP=Symbol.for("react.client.reference");function Lg(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===KP?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case bs:return"Fragment";case wg:return"Profiler";case iC:return"StrictMode";case Cg:return"Suspense";case Ag:return"SuspenseList";case bg:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case xu:return"Portal";case Ha:return t.displayName||"Context";case sC:return(t._context.displayName||"Context")+".Consumer";case Iy:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Ty:return e=t.displayName||null,e!==null?e:Lg(t.type)||"Memo";case Dr:e=t._payload,t=t._init;try{return Lg(t(e))}catch{}}return null}var ku=Array.isArray,ee=eC.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ee=HP.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ai={pending:!1,data:null,method:null,action:null},Rg=[],Ls=-1;function da(t){return{current:t}}function At(t){0>Ls||(t.current=Rg[Ls],Rg[Ls]=null,Ls--)}function Pe(t,e){Ls++,Rg[Ls]=t.current,t.current=e}var ca=da(null),Yu=da(null),Hr=da(null),$d=da(null);function Jd(t,e){switch(Pe(Hr,e),Pe(Yu,t),Pe(ca,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?Uw(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=Uw(e),t=Ab(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}At(ca),Pe(ca,t)}function Ws(){At(ca),At(Yu),At(Hr)}function xg(t){t.memoizedState!==null&&Pe($d,t);var e=ca.current,n=Ab(e,t.type);e!==n&&(Pe(Yu,t),Pe(ca,n))}function Zd(t){Yu.current===t&&(At(ca),At(Yu)),$d.current===t&&(At($d),il._currentValue=Ai)}var jm,kE;function vi(t){if(jm===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);jm=e&&e[1]||"",kE=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+jm+t+kE}var Wm=!1;function Km(t,e){if(!t||Wm)return"";Wm=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(e){var m=function(){throw Error()};if(Object.defineProperty(m.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(m,[])}catch(I){var p=I}Reflect.construct(t,[],m)}else{try{m.call()}catch(I){p=I}t.call(m.prototype)}}else{try{throw Error()}catch(I){p=I}(m=t())&&typeof m.catch=="function"&&m.catch(function(){})}}catch(I){if(I&&p&&typeof I.stack=="string")return[I.stack,p.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var i=a.DetermineComponentFrameRoot(),s=i[0],u=i[1];if(s&&u){var l=s.split(`
`),c=u.split(`
`);for(r=a=0;a<l.length&&!l[a].includes("DetermineComponentFrameRoot");)a++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(a===l.length||r===c.length)for(a=l.length-1,r=c.length-1;1<=a&&0<=r&&l[a]!==c[r];)r--;for(;1<=a&&0<=r;a--,r--)if(l[a]!==c[r]){if(a!==1||r!==1)do if(a--,r--,0>r||l[a]!==c[r]){var f=`
`+l[a].replace(" at new "," at ");return t.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",t.displayName)),f}while(1<=a&&0<=r);break}}}finally{Wm=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?vi(n):""}function YP(t,e){switch(t.tag){case 26:case 27:case 5:return vi(t.type);case 16:return vi("Lazy");case 13:return t.child!==e&&e!==null?vi("Suspense Fallback"):vi("Suspense");case 19:return vi("SuspenseList");case 0:case 15:return Km(t.type,!1);case 11:return Km(t.type.render,!1);case 1:return Km(t.type,!0);case 31:return vi("Activity");default:return""}}function DE(t){try{var e="",n=null;do e+=YP(t,n),n=t,t=t.return;while(t);return e}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var kg=Object.prototype.hasOwnProperty,Sy=_t.unstable_scheduleCallback,Ym=_t.unstable_cancelCallback,QP=_t.unstable_shouldYield,XP=_t.unstable_requestPaint,yn=_t.unstable_now,$P=_t.unstable_getCurrentPriorityLevel,oC=_t.unstable_ImmediatePriority,uC=_t.unstable_UserBlockingPriority,ef=_t.unstable_NormalPriority,JP=_t.unstable_LowPriority,lC=_t.unstable_IdlePriority,ZP=_t.log,e1=_t.unstable_setDisableYieldValue,ll=null,_n=null;function Vr(t){if(typeof ZP=="function"&&e1(t),_n&&typeof _n.setStrictMode=="function")try{_n.setStrictMode(ll,t)}catch{}}var In=Math.clz32?Math.clz32:a1,t1=Math.log,n1=Math.LN2;function a1(t){return t>>>=0,t===0?32:31-(t1(t)/n1|0)|0}var Id=256,Td=262144,Sd=4194304;function Ei(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function bf(t,e,n){var a=t.pendingLanes;if(a===0)return 0;var r=0,i=t.suspendedLanes,s=t.pingedLanes;t=t.warmLanes;var u=a&134217727;return u!==0?(a=u&~i,a!==0?r=Ei(a):(s&=u,s!==0?r=Ei(s):n||(n=u&~t,n!==0&&(r=Ei(n))))):(u=a&~i,u!==0?r=Ei(u):s!==0?r=Ei(s):n||(n=a&~t,n!==0&&(r=Ei(n)))),r===0?0:e!==0&&e!==r&&!(e&i)&&(i=r&-r,n=e&-e,i>=n||i===32&&(n&4194048)!==0)?e:r}function cl(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function r1(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function cC(){var t=Sd;return Sd<<=1,!(Sd&62914560)&&(Sd=4194304),t}function Qm(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function dl(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function i1(t,e,n,a,r,i){var s=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var u=t.entanglements,l=t.expirationTimes,c=t.hiddenUpdates;for(n=s&~n;0<n;){var f=31-In(n),m=1<<f;u[f]=0,l[f]=-1;var p=c[f];if(p!==null)for(c[f]=null,f=0;f<p.length;f++){var I=p[f];I!==null&&(I.lane&=-536870913)}n&=~m}a!==0&&dC(t,a,0),i!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=i&~(s&~e))}function dC(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var a=31-In(e);t.entangledLanes|=e,t.entanglements[a]=t.entanglements[a]|1073741824|n&261930}function fC(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var a=31-In(n),r=1<<a;r&e|t[a]&e&&(t[a]|=e),n&=~r}}function hC(t,e){var n=e&-e;return n=n&42?1:vy(n),n&(t.suspendedLanes|e)?0:n}function vy(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Ey(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function pC(){var t=Ee.p;return t!==0?t:(t=window.event,t===void 0?32:Ub(t.type))}function PE(t,e){var n=Ee.p;try{return Ee.p=t,e()}finally{Ee.p=n}}var ni=Math.random().toString(36).slice(2),Pt="__reactFiber$"+ni,sn="__reactProps$"+ni,ao="__reactContainer$"+ni,Dg="__reactEvents$"+ni,s1="__reactListeners$"+ni,o1="__reactHandles$"+ni,OE="__reactResources$"+ni,fl="__reactMarker$"+ni;function wy(t){delete t[Pt],delete t[sn],delete t[Dg],delete t[s1],delete t[o1]}function Rs(t){var e=t[Pt];if(e)return e;for(var n=t.parentNode;n;){if(e=n[ao]||n[Pt]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=zw(t);t!==null;){if(n=t[Pt])return n;t=zw(t)}return e}t=n,n=t.parentNode}return null}function ro(t){if(t=t[Pt]||t[ao]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function Du(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(M(33))}function Fs(t){var e=t[OE];return e||(e=t[OE]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Ct(t){t[fl]=!0}var mC=new Set,gC={};function Mi(t,e){Ks(t,e),Ks(t+"Capture",e)}function Ks(t,e){for(gC[t]=e,t=0;t<e.length;t++)mC.add(e[t])}var u1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),NE={},ME={};function l1(t){return kg.call(ME,t)?!0:kg.call(NE,t)?!1:u1.test(t)?ME[t]=!0:(NE[t]=!0,!1)}function Md(t,e,n){if(l1(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var a=e.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function vd(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function Ma(t,e,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+a)}}function kn(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function yC(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function c1(t,e,n){var a=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var r=a.get,i=a.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(s){n=""+s,i.call(this,s)}}),Object.defineProperty(t,e,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(s){n=""+s},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Pg(t){if(!t._valueTracker){var e=yC(t)?"checked":"value";t._valueTracker=c1(t,e,""+t[e])}}function _C(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),a="";return t&&(a=yC(t)?t.checked?"true":"false":t.value),t=a,t!==n?(e.setValue(t),!0):!1}function tf(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var d1=/[\n"\\]/g;function On(t){return t.replace(d1,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function Og(t,e,n,a,r,i,s,u){t.name="",s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?t.type=s:t.removeAttribute("type"),e!=null?s==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+kn(e)):t.value!==""+kn(e)&&(t.value=""+kn(e)):s!=="submit"&&s!=="reset"||t.removeAttribute("value"),e!=null?Ng(t,s,kn(e)):n!=null?Ng(t,s,kn(n)):a!=null&&t.removeAttribute("value"),r==null&&i!=null&&(t.defaultChecked=!!i),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.name=""+kn(u):t.removeAttribute("name")}function IC(t,e,n,a,r,i,s,u){if(i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.type=i),e!=null||n!=null){if(!(i!=="submit"&&i!=="reset"||e!=null)){Pg(t);return}n=n!=null?""+kn(n):"",e=e!=null?""+kn(e):n,u||e===t.value||(t.value=e),t.defaultValue=e}a=a??r,a=typeof a!="function"&&typeof a!="symbol"&&!!a,t.checked=u?t.checked:!!a,t.defaultChecked=!!a,s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.name=s),Pg(t)}function Ng(t,e,n){e==="number"&&tf(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function Bs(t,e,n,a){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&a&&(t[n].defaultSelected=!0)}else{for(n=""+kn(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,a&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function TC(t,e,n){if(e!=null&&(e=""+kn(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+kn(n):""}function SC(t,e,n,a){if(e==null){if(a!=null){if(n!=null)throw Error(M(92));if(ku(a)){if(1<a.length)throw Error(M(93));a=a[0]}n=a}n==null&&(n=""),e=n}n=kn(e),t.defaultValue=n,a=t.textContent,a===n&&a!==""&&a!==null&&(t.value=a),Pg(t)}function Ys(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var f1=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function UE(t,e,n){var a=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":a?t.setProperty(e,n):typeof n!="number"||n===0||f1.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function vC(t,e,n){if(e!=null&&typeof e!="object")throw Error(M(62));if(t=t.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||e!=null&&e.hasOwnProperty(a)||(a.indexOf("--")===0?t.setProperty(a,""):a==="float"?t.cssFloat="":t[a]="");for(var r in e)a=e[r],e.hasOwnProperty(r)&&n[r]!==a&&UE(t,r,a)}else for(var i in e)e.hasOwnProperty(i)&&UE(t,i,e[i])}function Cy(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var h1=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),p1=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Ud(t){return p1.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function Ga(){}var Mg=null;function Ay(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var xs=null,qs=null;function VE(t){var e=ro(t);if(e&&(t=e.stateNode)){var n=t[sn]||null;e:switch(t=e.stateNode,e.type){case"input":if(Og(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+On(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var a=n[e];if(a!==t&&a.form===t.form){var r=a[sn]||null;if(!r)throw Error(M(90));Og(a,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)a=n[e],a.form===t.form&&_C(a)}break e;case"textarea":TC(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&Bs(t,!!n.multiple,e,!1)}}}var Xm=!1;function EC(t,e,n){if(Xm)return t(e,n);Xm=!0;try{var a=t(e);return a}finally{if(Xm=!1,(xs!==null||qs!==null)&&(Ff(),xs&&(e=xs,t=qs,qs=xs=null,VE(e),t)))for(e=0;e<t.length;e++)VE(t[e])}}function Qu(t,e){var n=t.stateNode;if(n===null)return null;var a=n[sn]||null;if(a===null)return null;n=a[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(t=t.type,a=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!a;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(M(231,e,typeof n));return n}var Qa=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Ug=!1;if(Qa)try{vs={},Object.defineProperty(vs,"passive",{get:function(){Ug=!0}}),window.addEventListener("test",vs,vs),window.removeEventListener("test",vs,vs)}catch{Ug=!1}var vs,Fr=null,by=null,Vd=null;function wC(){if(Vd)return Vd;var t,e=by,n=e.length,a,r="value"in Fr?Fr.value:Fr.textContent,i=r.length;for(t=0;t<n&&e[t]===r[t];t++);var s=n-t;for(a=1;a<=s&&e[n-a]===r[i-a];a++);return Vd=r.slice(t,1<a?1-a:void 0)}function Fd(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Ed(){return!0}function FE(){return!1}function on(t){function e(n,a,r,i,s){this._reactName=n,this._targetInst=r,this.type=a,this.nativeEvent=i,this.target=s,this.currentTarget=null;for(var u in t)t.hasOwnProperty(u)&&(n=t[u],this[u]=n?n(i):i[u]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Ed:FE,this.isPropagationStopped=FE,this}return Fe(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Ed)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Ed)},persist:function(){},isPersistent:Ed}),e}var Ui={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Lf=on(Ui),hl=Fe({},Ui,{view:0,detail:0}),m1=on(hl),$m,Jm,wu,Rf=Fe({},hl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ly,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==wu&&(wu&&t.type==="mousemove"?($m=t.screenX-wu.screenX,Jm=t.screenY-wu.screenY):Jm=$m=0,wu=t),$m)},movementY:function(t){return"movementY"in t?t.movementY:Jm}}),BE=on(Rf),g1=Fe({},Rf,{dataTransfer:0}),y1=on(g1),_1=Fe({},hl,{relatedTarget:0}),Zm=on(_1),I1=Fe({},Ui,{animationName:0,elapsedTime:0,pseudoElement:0}),T1=on(I1),S1=Fe({},Ui,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),v1=on(S1),E1=Fe({},Ui,{data:0}),qE=on(E1),w1={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},C1={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},A1={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function b1(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=A1[t])?!!e[t]:!1}function Ly(){return b1}var L1=Fe({},hl,{key:function(t){if(t.key){var e=w1[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Fd(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?C1[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ly,charCode:function(t){return t.type==="keypress"?Fd(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Fd(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),R1=on(L1),x1=Fe({},Rf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),zE=on(x1),k1=Fe({},hl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ly}),D1=on(k1),P1=Fe({},Ui,{propertyName:0,elapsedTime:0,pseudoElement:0}),O1=on(P1),N1=Fe({},Rf,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),M1=on(N1),U1=Fe({},Ui,{newState:0,oldState:0}),V1=on(U1),F1=[9,13,27,32],Ry=Qa&&"CompositionEvent"in window,Nu=null;Qa&&"documentMode"in document&&(Nu=document.documentMode);var B1=Qa&&"TextEvent"in window&&!Nu,CC=Qa&&(!Ry||Nu&&8<Nu&&11>=Nu),HE=" ",GE=!1;function AC(t,e){switch(t){case"keyup":return F1.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function bC(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var ks=!1;function q1(t,e){switch(t){case"compositionend":return bC(e);case"keypress":return e.which!==32?null:(GE=!0,HE);case"textInput":return t=e.data,t===HE&&GE?null:t;default:return null}}function z1(t,e){if(ks)return t==="compositionend"||!Ry&&AC(t,e)?(t=wC(),Vd=by=Fr=null,ks=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return CC&&e.locale!=="ko"?null:e.data;default:return null}}var H1={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function jE(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!H1[t.type]:e==="textarea"}function LC(t,e,n,a){xs?qs?qs.push(a):qs=[a]:xs=a,e=Tf(e,"onChange"),0<e.length&&(n=new Lf("onChange","change",null,n,a),t.push({event:n,listeners:e}))}var Mu=null,Xu=null;function G1(t){Eb(t,0)}function xf(t){var e=Du(t);if(_C(e))return t}function WE(t,e){if(t==="change")return e}var RC=!1;Qa&&(Qa?(Cd="oninput"in document,Cd||(eg=document.createElement("div"),eg.setAttribute("oninput","return;"),Cd=typeof eg.oninput=="function"),wd=Cd):wd=!1,RC=wd&&(!document.documentMode||9<document.documentMode));var wd,Cd,eg;function KE(){Mu&&(Mu.detachEvent("onpropertychange",xC),Xu=Mu=null)}function xC(t){if(t.propertyName==="value"&&xf(Xu)){var e=[];LC(e,Xu,t,Ay(t)),EC(G1,e)}}function j1(t,e,n){t==="focusin"?(KE(),Mu=e,Xu=n,Mu.attachEvent("onpropertychange",xC)):t==="focusout"&&KE()}function W1(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return xf(Xu)}function K1(t,e){if(t==="click")return xf(e)}function Y1(t,e){if(t==="input"||t==="change")return xf(e)}function Q1(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Sn=typeof Object.is=="function"?Object.is:Q1;function $u(t,e){if(Sn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),a=Object.keys(e);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var r=n[a];if(!kg.call(e,r)||!Sn(t[r],e[r]))return!1}return!0}function YE(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function QE(t,e){var n=YE(t);t=0;for(var a;n;){if(n.nodeType===3){if(a=t+n.textContent.length,t<=e&&a>=e)return{node:n,offset:e-t};t=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=YE(n)}}function kC(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?kC(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function DC(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=tf(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=tf(t.document)}return e}function xy(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var X1=Qa&&"documentMode"in document&&11>=document.documentMode,Ds=null,Vg=null,Uu=null,Fg=!1;function XE(t,e,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Fg||Ds==null||Ds!==tf(a)||(a=Ds,"selectionStart"in a&&xy(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),Uu&&$u(Uu,a)||(Uu=a,a=Tf(Vg,"onSelect"),0<a.length&&(e=new Lf("onSelect","select",null,e,n),t.push({event:e,listeners:a}),e.target=Ds)))}function Si(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Ps={animationend:Si("Animation","AnimationEnd"),animationiteration:Si("Animation","AnimationIteration"),animationstart:Si("Animation","AnimationStart"),transitionrun:Si("Transition","TransitionRun"),transitionstart:Si("Transition","TransitionStart"),transitioncancel:Si("Transition","TransitionCancel"),transitionend:Si("Transition","TransitionEnd")},tg={},PC={};Qa&&(PC=document.createElement("div").style,"AnimationEvent"in window||(delete Ps.animationend.animation,delete Ps.animationiteration.animation,delete Ps.animationstart.animation),"TransitionEvent"in window||delete Ps.transitionend.transition);function Vi(t){if(tg[t])return tg[t];if(!Ps[t])return t;var e=Ps[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in PC)return tg[t]=e[n];return t}var OC=Vi("animationend"),NC=Vi("animationiteration"),MC=Vi("animationstart"),$1=Vi("transitionrun"),J1=Vi("transitionstart"),Z1=Vi("transitioncancel"),UC=Vi("transitionend"),VC=new Map,Bg="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Bg.push("scrollEnd");function Qn(t,e){VC.set(t,e),Mi(e,[t])}var nf=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},xn=[],Os=0,ky=0;function kf(){for(var t=Os,e=ky=Os=0;e<t;){var n=xn[e];xn[e++]=null;var a=xn[e];xn[e++]=null;var r=xn[e];xn[e++]=null;var i=xn[e];if(xn[e++]=null,a!==null&&r!==null){var s=a.pending;s===null?r.next=r:(r.next=s.next,s.next=r),a.pending=r}i!==0&&FC(n,r,i)}}function Df(t,e,n,a){xn[Os++]=t,xn[Os++]=e,xn[Os++]=n,xn[Os++]=a,ky|=a,t.lanes|=a,t=t.alternate,t!==null&&(t.lanes|=a)}function Dy(t,e,n,a){return Df(t,e,n,a),af(t)}function Fi(t,e){return Df(t,null,null,e),af(t)}function FC(t,e,n){t.lanes|=n;var a=t.alternate;a!==null&&(a.lanes|=n);for(var r=!1,i=t.return;i!==null;)i.childLanes|=n,a=i.alternate,a!==null&&(a.childLanes|=n),i.tag===22&&(t=i.stateNode,t===null||t._visibility&1||(r=!0)),t=i,i=i.return;return t.tag===3?(i=t.stateNode,r&&e!==null&&(r=31-In(n),t=i.hiddenUpdates,a=t[r],a===null?t[r]=[e]:a.push(e),e.lane=n|536870912),i):null}function af(t){if(50<Wu)throw Wu=0,oy=null,Error(M(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var Ns={};function eO(t,e,n,a){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function mn(t,e,n,a){return new eO(t,e,n,a)}function Py(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Wa(t,e){var n=t.alternate;return n===null?(n=mn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function BC(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Bd(t,e,n,a,r,i){var s=0;if(a=t,typeof t=="function")Py(t)&&(s=1);else if(typeof t=="string")s=aN(t,n,ca.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case bg:return t=mn(31,n,e,r),t.elementType=bg,t.lanes=i,t;case bs:return bi(n.children,r,i,e);case iC:s=8,r|=24;break;case wg:return t=mn(12,n,e,r|2),t.elementType=wg,t.lanes=i,t;case Cg:return t=mn(13,n,e,r),t.elementType=Cg,t.lanes=i,t;case Ag:return t=mn(19,n,e,r),t.elementType=Ag,t.lanes=i,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Ha:s=10;break e;case sC:s=9;break e;case Iy:s=11;break e;case Ty:s=14;break e;case Dr:s=16,a=null;break e}s=29,n=Error(M(130,t===null?"null":typeof t,"")),a=null}return e=mn(s,n,e,r),e.elementType=t,e.type=a,e.lanes=i,e}function bi(t,e,n,a){return t=mn(7,t,a,e),t.lanes=n,t}function ng(t,e,n){return t=mn(6,t,null,e),t.lanes=n,t}function qC(t){var e=mn(18,null,null,0);return e.stateNode=t,e}function ag(t,e,n){return e=mn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var $E=new WeakMap;function Nn(t,e){if(typeof t=="object"&&t!==null){var n=$E.get(t);return n!==void 0?n:(e={value:t,source:e,stack:DE(e)},$E.set(t,e),e)}return{value:t,source:e,stack:DE(e)}}var Ms=[],Us=0,rf=null,Ju=0,Dn=[],Pn=0,Jr=null,oa=1,ua="";function qa(t,e){Ms[Us++]=Ju,Ms[Us++]=rf,rf=t,Ju=e}function zC(t,e,n){Dn[Pn++]=oa,Dn[Pn++]=ua,Dn[Pn++]=Jr,Jr=t;var a=oa;t=ua;var r=32-In(a)-1;a&=~(1<<r),n+=1;var i=32-In(e)+r;if(30<i){var s=r-r%5;i=(a&(1<<s)-1).toString(32),a>>=s,r-=s,oa=1<<32-In(e)+r|n<<r|a,ua=i+t}else oa=1<<i|n<<r|a,ua=t}function Oy(t){t.return!==null&&(qa(t,1),zC(t,1,0))}function Ny(t){for(;t===rf;)rf=Ms[--Us],Ms[Us]=null,Ju=Ms[--Us],Ms[Us]=null;for(;t===Jr;)Jr=Dn[--Pn],Dn[Pn]=null,ua=Dn[--Pn],Dn[Pn]=null,oa=Dn[--Pn],Dn[Pn]=null}function HC(t,e){Dn[Pn++]=oa,Dn[Pn++]=ua,Dn[Pn++]=Jr,oa=e.id,ua=e.overflow,Jr=t}var Ot=null,Ve=null,he=!1,Gr=null,Mn=!1,qg=Error(M(519));function Zr(t){var e=Error(M(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Zu(Nn(e,t)),qg}function JE(t){var e=t.stateNode,n=t.type,a=t.memoizedProps;switch(e[Pt]=t,e[sn]=a,n){case"dialog":ce("cancel",e),ce("close",e);break;case"iframe":case"object":case"embed":ce("load",e);break;case"video":case"audio":for(n=0;n<al.length;n++)ce(al[n],e);break;case"source":ce("error",e);break;case"img":case"image":case"link":ce("error",e),ce("load",e);break;case"details":ce("toggle",e);break;case"input":ce("invalid",e),IC(e,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":ce("invalid",e);break;case"textarea":ce("invalid",e),SC(e,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||a.suppressHydrationWarning===!0||Cb(e.textContent,n)?(a.popover!=null&&(ce("beforetoggle",e),ce("toggle",e)),a.onScroll!=null&&ce("scroll",e),a.onScrollEnd!=null&&ce("scrollend",e),a.onClick!=null&&(e.onclick=Ga),e=!0):e=!1,e||Zr(t,!0)}function ZE(t){for(Ot=t.return;Ot;)switch(Ot.tag){case 5:case 31:case 13:Mn=!1;return;case 27:case 3:Mn=!0;return;default:Ot=Ot.return}}function Es(t){if(t!==Ot)return!1;if(!he)return ZE(t),he=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||fy(t.type,t.memoizedProps)),n=!n),n&&Ve&&Zr(t),ZE(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(M(317));Ve=qw(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(M(317));Ve=qw(t)}else e===27?(e=Ve,ai(t.type)?(t=gy,gy=null,Ve=t):Ve=e):Ve=Ot?Vn(t.stateNode.nextSibling):null;return!0}function ki(){Ve=Ot=null,he=!1}function rg(){var t=Gr;return t!==null&&(an===null?an=t:an.push.apply(an,t),Gr=null),t}function Zu(t){Gr===null?Gr=[t]:Gr.push(t)}var zg=da(null),Bi=null,ja=null;function Or(t,e,n){Pe(zg,e._currentValue),e._currentValue=n}function Ka(t){t._currentValue=zg.current,At(zg)}function Hg(t,e,n){for(;t!==null;){var a=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,a!==null&&(a.childLanes|=e)):a!==null&&(a.childLanes&e)!==e&&(a.childLanes|=e),t===n)break;t=t.return}}function Gg(t,e,n,a){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var i=r.dependencies;if(i!==null){var s=r.child;i=i.firstContext;e:for(;i!==null;){var u=i;i=r;for(var l=0;l<e.length;l++)if(u.context===e[l]){i.lanes|=n,u=i.alternate,u!==null&&(u.lanes|=n),Hg(i.return,n,t),a||(s=null);break e}i=u.next}}else if(r.tag===18){if(s=r.return,s===null)throw Error(M(341));s.lanes|=n,i=s.alternate,i!==null&&(i.lanes|=n),Hg(s,n,t),s=null}else s=r.child;if(s!==null)s.return=r;else for(s=r;s!==null;){if(s===t){s=null;break}if(r=s.sibling,r!==null){r.return=s.return,s=r;break}s=s.return}r=s}}function io(t,e,n,a){t=null;for(var r=e,i=!1;r!==null;){if(!i){if(r.flags&524288)i=!0;else if(r.flags&262144)break}if(r.tag===10){var s=r.alternate;if(s===null)throw Error(M(387));if(s=s.memoizedProps,s!==null){var u=r.type;Sn(r.pendingProps.value,s.value)||(t!==null?t.push(u):t=[u])}}else if(r===$d.current){if(s=r.alternate,s===null)throw Error(M(387));s.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(il):t=[il])}r=r.return}t!==null&&Gg(e,t,n,a),e.flags|=262144}function sf(t){for(t=t.firstContext;t!==null;){if(!Sn(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Di(t){Bi=t,ja=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function Nt(t){return GC(Bi,t)}function Ad(t,e){return Bi===null&&Di(t),GC(t,e)}function GC(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},ja===null){if(t===null)throw Error(M(308));ja=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else ja=ja.next=e;return n}var tO=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,a){t.push(a)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},nO=_t.unstable_scheduleCallback,aO=_t.unstable_NormalPriority,lt={$$typeof:Ha,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function My(){return{controller:new tO,data:new Map,refCount:0}}function pl(t){t.refCount--,t.refCount===0&&nO(aO,function(){t.controller.abort()})}var Vu=null,jg=0,Qs=0,zs=null;function rO(t,e){if(Vu===null){var n=Vu=[];jg=0,Qs=o_(),zs={status:"pending",value:void 0,then:function(a){n.push(a)}}}return jg++,e.then(ew,ew),e}function ew(){if(--jg===0&&Vu!==null){zs!==null&&(zs.status="fulfilled");var t=Vu;Vu=null,Qs=0,zs=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function iO(t,e){var n=[],a={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){a.status="fulfilled",a.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(a.status="rejected",a.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),a}var tw=ee.S;ee.S=function(t,e){rb=yn(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&rO(t,e),tw!==null&&tw(t,e)};var Li=da(null);function Uy(){var t=Li.current;return t!==null?t:De.pooledCache}function qd(t,e){e===null?Pe(Li,Li.current):Pe(Li,e.pool)}function jC(){var t=Uy();return t===null?null:{parent:lt._currentValue,pool:t}}var so=Error(M(460)),Vy=Error(M(474)),Pf=Error(M(542)),of={then:function(){}};function nw(t){return t=t.status,t==="fulfilled"||t==="rejected"}function WC(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(Ga,Ga),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,rw(t),t;default:if(typeof e.status=="string")e.then(Ga,Ga);else{if(t=De,t!==null&&100<t.shellSuspendCounter)throw Error(M(482));t=e,t.status="pending",t.then(function(a){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=a}},function(a){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=a}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,rw(t),t}throw Ri=e,so}}function wi(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Ri=n,so):n}}var Ri=null;function aw(){if(Ri===null)throw Error(M(459));var t=Ri;return Ri=null,t}function rw(t){if(t===so||t===Pf)throw Error(M(483))}var Hs=null,el=0;function bd(t){var e=el;return el+=1,Hs===null&&(Hs=[]),WC(Hs,t,e)}function Cu(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Ld(t,e){throw e.$$typeof===jP?Error(M(525)):(t=Object.prototype.toString.call(e),Error(M(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function KC(t){function e(v,S){if(t){var A=v.deletions;A===null?(v.deletions=[S],v.flags|=16):A.push(S)}}function n(v,S){if(!t)return null;for(;S!==null;)e(v,S),S=S.sibling;return null}function a(v){for(var S=new Map;v!==null;)v.key!==null?S.set(v.key,v):S.set(v.index,v),v=v.sibling;return S}function r(v,S){return v=Wa(v,S),v.index=0,v.sibling=null,v}function i(v,S,A){return v.index=A,t?(A=v.alternate,A!==null?(A=A.index,A<S?(v.flags|=67108866,S):A):(v.flags|=67108866,S)):(v.flags|=1048576,S)}function s(v){return t&&v.alternate===null&&(v.flags|=67108866),v}function u(v,S,A,R){return S===null||S.tag!==6?(S=ng(A,v.mode,R),S.return=v,S):(S=r(S,A),S.return=v,S)}function l(v,S,A,R){var q=A.type;return q===bs?f(v,S,A.props.children,R,A.key):S!==null&&(S.elementType===q||typeof q=="object"&&q!==null&&q.$$typeof===Dr&&wi(q)===S.type)?(S=r(S,A.props),Cu(S,A),S.return=v,S):(S=Bd(A.type,A.key,A.props,null,v.mode,R),Cu(S,A),S.return=v,S)}function c(v,S,A,R){return S===null||S.tag!==4||S.stateNode.containerInfo!==A.containerInfo||S.stateNode.implementation!==A.implementation?(S=ag(A,v.mode,R),S.return=v,S):(S=r(S,A.children||[]),S.return=v,S)}function f(v,S,A,R,q){return S===null||S.tag!==7?(S=bi(A,v.mode,R,q),S.return=v,S):(S=r(S,A),S.return=v,S)}function m(v,S,A){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return S=ng(""+S,v.mode,A),S.return=v,S;if(typeof S=="object"&&S!==null){switch(S.$$typeof){case _d:return A=Bd(S.type,S.key,S.props,null,v.mode,A),Cu(A,S),A.return=v,A;case xu:return S=ag(S,v.mode,A),S.return=v,S;case Dr:return S=wi(S),m(v,S,A)}if(ku(S)||Eu(S))return S=bi(S,v.mode,A,null),S.return=v,S;if(typeof S.then=="function")return m(v,bd(S),A);if(S.$$typeof===Ha)return m(v,Ad(v,S),A);Ld(v,S)}return null}function p(v,S,A,R){var q=S!==null?S.key:null;if(typeof A=="string"&&A!==""||typeof A=="number"||typeof A=="bigint")return q!==null?null:u(v,S,""+A,R);if(typeof A=="object"&&A!==null){switch(A.$$typeof){case _d:return A.key===q?l(v,S,A,R):null;case xu:return A.key===q?c(v,S,A,R):null;case Dr:return A=wi(A),p(v,S,A,R)}if(ku(A)||Eu(A))return q!==null?null:f(v,S,A,R,null);if(typeof A.then=="function")return p(v,S,bd(A),R);if(A.$$typeof===Ha)return p(v,S,Ad(v,A),R);Ld(v,A)}return null}function I(v,S,A,R,q){if(typeof R=="string"&&R!==""||typeof R=="number"||typeof R=="bigint")return v=v.get(A)||null,u(S,v,""+R,q);if(typeof R=="object"&&R!==null){switch(R.$$typeof){case _d:return v=v.get(R.key===null?A:R.key)||null,l(S,v,R,q);case xu:return v=v.get(R.key===null?A:R.key)||null,c(S,v,R,q);case Dr:return R=wi(R),I(v,S,A,R,q)}if(ku(R)||Eu(R))return v=v.get(A)||null,f(S,v,R,q,null);if(typeof R.then=="function")return I(v,S,A,bd(R),q);if(R.$$typeof===Ha)return I(v,S,A,Ad(S,R),q);Ld(S,R)}return null}function b(v,S,A,R){for(var q=null,V=null,T=S,g=S=0,_=null;T!==null&&g<A.length;g++){T.index>g?(_=T,T=null):_=T.sibling;var E=p(v,T,A[g],R);if(E===null){T===null&&(T=_);break}t&&T&&E.alternate===null&&e(v,T),S=i(E,S,g),V===null?q=E:V.sibling=E,V=E,T=_}if(g===A.length)return n(v,T),he&&qa(v,g),q;if(T===null){for(;g<A.length;g++)T=m(v,A[g],R),T!==null&&(S=i(T,S,g),V===null?q=T:V.sibling=T,V=T);return he&&qa(v,g),q}for(T=a(T);g<A.length;g++)_=I(T,v,g,A[g],R),_!==null&&(t&&_.alternate!==null&&T.delete(_.key===null?g:_.key),S=i(_,S,g),V===null?q=_:V.sibling=_,V=_);return t&&T.forEach(function(C){return e(v,C)}),he&&qa(v,g),q}function x(v,S,A,R){if(A==null)throw Error(M(151));for(var q=null,V=null,T=S,g=S=0,_=null,E=A.next();T!==null&&!E.done;g++,E=A.next()){T.index>g?(_=T,T=null):_=T.sibling;var C=p(v,T,E.value,R);if(C===null){T===null&&(T=_);break}t&&T&&C.alternate===null&&e(v,T),S=i(C,S,g),V===null?q=C:V.sibling=C,V=C,T=_}if(E.done)return n(v,T),he&&qa(v,g),q;if(T===null){for(;!E.done;g++,E=A.next())E=m(v,E.value,R),E!==null&&(S=i(E,S,g),V===null?q=E:V.sibling=E,V=E);return he&&qa(v,g),q}for(T=a(T);!E.done;g++,E=A.next())E=I(T,v,g,E.value,R),E!==null&&(t&&E.alternate!==null&&T.delete(E.key===null?g:E.key),S=i(E,S,g),V===null?q=E:V.sibling=E,V=E);return t&&T.forEach(function(L){return e(v,L)}),he&&qa(v,g),q}function D(v,S,A,R){if(typeof A=="object"&&A!==null&&A.type===bs&&A.key===null&&(A=A.props.children),typeof A=="object"&&A!==null){switch(A.$$typeof){case _d:e:{for(var q=A.key;S!==null;){if(S.key===q){if(q=A.type,q===bs){if(S.tag===7){n(v,S.sibling),R=r(S,A.props.children),R.return=v,v=R;break e}}else if(S.elementType===q||typeof q=="object"&&q!==null&&q.$$typeof===Dr&&wi(q)===S.type){n(v,S.sibling),R=r(S,A.props),Cu(R,A),R.return=v,v=R;break e}n(v,S);break}else e(v,S);S=S.sibling}A.type===bs?(R=bi(A.props.children,v.mode,R,A.key),R.return=v,v=R):(R=Bd(A.type,A.key,A.props,null,v.mode,R),Cu(R,A),R.return=v,v=R)}return s(v);case xu:e:{for(q=A.key;S!==null;){if(S.key===q)if(S.tag===4&&S.stateNode.containerInfo===A.containerInfo&&S.stateNode.implementation===A.implementation){n(v,S.sibling),R=r(S,A.children||[]),R.return=v,v=R;break e}else{n(v,S);break}else e(v,S);S=S.sibling}R=ag(A,v.mode,R),R.return=v,v=R}return s(v);case Dr:return A=wi(A),D(v,S,A,R)}if(ku(A))return b(v,S,A,R);if(Eu(A)){if(q=Eu(A),typeof q!="function")throw Error(M(150));return A=q.call(A),x(v,S,A,R)}if(typeof A.then=="function")return D(v,S,bd(A),R);if(A.$$typeof===Ha)return D(v,S,Ad(v,A),R);Ld(v,A)}return typeof A=="string"&&A!==""||typeof A=="number"||typeof A=="bigint"?(A=""+A,S!==null&&S.tag===6?(n(v,S.sibling),R=r(S,A),R.return=v,v=R):(n(v,S),R=ng(A,v.mode,R),R.return=v,v=R),s(v)):n(v,S)}return function(v,S,A,R){try{el=0;var q=D(v,S,A,R);return Hs=null,q}catch(T){if(T===so||T===Pf)throw T;var V=mn(29,T,null,v.mode);return V.lanes=R,V.return=v,V}finally{}}}var Pi=KC(!0),YC=KC(!1),Pr=!1;function Fy(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Wg(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function jr(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Wr(t,e,n){var a=t.updateQueue;if(a===null)return null;if(a=a.shared,ve&2){var r=a.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),a.pending=e,e=af(t),FC(t,null,n),e}return Df(t,a,e,n),af(t)}function Fu(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,fC(t,n)}}function ig(t,e){var n=t.updateQueue,a=t.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var r=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var s={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};i===null?r=i=s:i=i.next=s,n=n.next}while(n!==null);i===null?r=i=e:i=i.next=e}else r=i=e;n={baseState:a.baseState,firstBaseUpdate:r,lastBaseUpdate:i,shared:a.shared,callbacks:a.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var Kg=!1;function Bu(){if(Kg){var t=zs;if(t!==null)throw t}}function qu(t,e,n,a){Kg=!1;var r=t.updateQueue;Pr=!1;var i=r.firstBaseUpdate,s=r.lastBaseUpdate,u=r.shared.pending;if(u!==null){r.shared.pending=null;var l=u,c=l.next;l.next=null,s===null?i=c:s.next=c,s=l;var f=t.alternate;f!==null&&(f=f.updateQueue,u=f.lastBaseUpdate,u!==s&&(u===null?f.firstBaseUpdate=c:u.next=c,f.lastBaseUpdate=l))}if(i!==null){var m=r.baseState;s=0,f=c=l=null,u=i;do{var p=u.lane&-536870913,I=p!==u.lane;if(I?(fe&p)===p:(a&p)===p){p!==0&&p===Qs&&(Kg=!0),f!==null&&(f=f.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var b=t,x=u;p=e;var D=n;switch(x.tag){case 1:if(b=x.payload,typeof b=="function"){m=b.call(D,m,p);break e}m=b;break e;case 3:b.flags=b.flags&-65537|128;case 0:if(b=x.payload,p=typeof b=="function"?b.call(D,m,p):b,p==null)break e;m=Fe({},m,p);break e;case 2:Pr=!0}}p=u.callback,p!==null&&(t.flags|=64,I&&(t.flags|=8192),I=r.callbacks,I===null?r.callbacks=[p]:I.push(p))}else I={lane:p,tag:u.tag,payload:u.payload,callback:u.callback,next:null},f===null?(c=f=I,l=m):f=f.next=I,s|=p;if(u=u.next,u===null){if(u=r.shared.pending,u===null)break;I=u,u=I.next,I.next=null,r.lastBaseUpdate=I,r.shared.pending=null}}while(!0);f===null&&(l=m),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=f,i===null&&(r.shared.lanes=0),ti|=s,t.lanes=s,t.memoizedState=m}}function QC(t,e){if(typeof t!="function")throw Error(M(191,t));t.call(e)}function XC(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)QC(n[t],e)}var Xs=da(null),uf=da(0);function iw(t,e){t=Za,Pe(uf,t),Pe(Xs,e),Za=t|e.baseLanes}function Yg(){Pe(uf,Za),Pe(Xs,Xs.current)}function By(){Za=uf.current,At(Xs),At(uf)}var vn=da(null),Un=null;function Nr(t){var e=t.alternate;Pe(tt,tt.current&1),Pe(vn,t),Un===null&&(e===null||Xs.current!==null||e.memoizedState!==null)&&(Un=t)}function Qg(t){Pe(tt,tt.current),Pe(vn,t),Un===null&&(Un=t)}function $C(t){t.tag===22?(Pe(tt,tt.current),Pe(vn,t),Un===null&&(Un=t)):Mr(t)}function Mr(){Pe(tt,tt.current),Pe(vn,vn.current)}function pn(t){At(vn),Un===t&&(Un=null),At(tt)}var tt=da(0);function lf(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||py(n)||my(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Xa=0,re=null,Re=null,ot=null,cf=!1,Gs=!1,Oi=!1,df=0,tl=0,js=null,sO=0;function Xe(){throw Error(M(321))}function qy(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Sn(t[n],e[n]))return!1;return!0}function zy(t,e,n,a,r,i){return Xa=i,re=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,ee.H=t===null||t.memoizedState===null?LA:Zy,Oi=!1,i=n(a,r),Oi=!1,Gs&&(i=ZC(e,n,a,r)),JC(t),i}function JC(t){ee.H=nl;var e=Re!==null&&Re.next!==null;if(Xa=0,ot=Re=re=null,cf=!1,tl=0,js=null,e)throw Error(M(300));t===null||ct||(t=t.dependencies,t!==null&&sf(t)&&(ct=!0))}function ZC(t,e,n,a){re=t;var r=0;do{if(Gs&&(js=null),tl=0,Gs=!1,25<=r)throw Error(M(301));if(r+=1,ot=Re=null,t.updateQueue!=null){var i=t.updateQueue;i.lastEffect=null,i.events=null,i.stores=null,i.memoCache!=null&&(i.memoCache.index=0)}ee.H=RA,i=e(n,a)}while(Gs);return i}function oO(){var t=ee.H,e=t.useState()[0];return e=typeof e.then=="function"?ml(e):e,t=t.useState()[0],(Re!==null?Re.memoizedState:null)!==t&&(re.flags|=1024),e}function Hy(){var t=df!==0;return df=0,t}function Gy(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function jy(t){if(cf){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}cf=!1}Xa=0,ot=Re=re=null,Gs=!1,tl=df=0,js=null}function Yt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ot===null?re.memoizedState=ot=t:ot=ot.next=t,ot}function nt(){if(Re===null){var t=re.alternate;t=t!==null?t.memoizedState:null}else t=Re.next;var e=ot===null?re.memoizedState:ot.next;if(e!==null)ot=e,Re=t;else{if(t===null)throw re.alternate===null?Error(M(467)):Error(M(310));Re=t,t={memoizedState:Re.memoizedState,baseState:Re.baseState,baseQueue:Re.baseQueue,queue:Re.queue,next:null},ot===null?re.memoizedState=ot=t:ot=ot.next=t}return ot}function Of(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function ml(t){var e=tl;return tl+=1,js===null&&(js=[]),t=WC(js,t,e),e=re,(ot===null?e.memoizedState:ot.next)===null&&(e=e.alternate,ee.H=e===null||e.memoizedState===null?LA:Zy),t}function Nf(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return ml(t);if(t.$$typeof===Ha)return Nt(t)}throw Error(M(438,String(t)))}function Wy(t){var e=null,n=re.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var a=re.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(e={data:a.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Of(),re.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),a=0;a<t;a++)n[a]=WP;return e.index++,n}function $a(t,e){return typeof e=="function"?e(t):e}function zd(t){var e=nt();return Ky(e,Re,t)}function Ky(t,e,n){var a=t.queue;if(a===null)throw Error(M(311));a.lastRenderedReducer=n;var r=t.baseQueue,i=a.pending;if(i!==null){if(r!==null){var s=r.next;r.next=i.next,i.next=s}e.baseQueue=r=i,a.pending=null}if(i=t.baseState,r===null)t.memoizedState=i;else{e=r.next;var u=s=null,l=null,c=e,f=!1;do{var m=c.lane&-536870913;if(m!==c.lane?(fe&m)===m:(Xa&m)===m){var p=c.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),m===Qs&&(f=!0);else if((Xa&p)===p){c=c.next,p===Qs&&(f=!0);continue}else m={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=m,s=i):l=l.next=m,re.lanes|=p,ti|=p;m=c.action,Oi&&n(i,m),i=c.hasEagerState?c.eagerState:n(i,m)}else p={lane:m,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=p,s=i):l=l.next=p,re.lanes|=m,ti|=m;c=c.next}while(c!==null&&c!==e);if(l===null?s=i:l.next=u,!Sn(i,t.memoizedState)&&(ct=!0,f&&(n=zs,n!==null)))throw n;t.memoizedState=i,t.baseState=s,t.baseQueue=l,a.lastRenderedState=i}return r===null&&(a.lanes=0),[t.memoizedState,a.dispatch]}function sg(t){var e=nt(),n=e.queue;if(n===null)throw Error(M(311));n.lastRenderedReducer=t;var a=n.dispatch,r=n.pending,i=e.memoizedState;if(r!==null){n.pending=null;var s=r=r.next;do i=t(i,s.action),s=s.next;while(s!==r);Sn(i,e.memoizedState)||(ct=!0),e.memoizedState=i,e.baseQueue===null&&(e.baseState=i),n.lastRenderedState=i}return[i,a]}function eA(t,e,n){var a=re,r=nt(),i=he;if(i){if(n===void 0)throw Error(M(407));n=n()}else n=e();var s=!Sn((Re||r).memoizedState,n);if(s&&(r.memoizedState=n,ct=!0),r=r.queue,Yy(aA.bind(null,a,r,t),[t]),r.getSnapshot!==e||s||ot!==null&&ot.memoizedState.tag&1){if(a.flags|=2048,$s(9,{destroy:void 0},nA.bind(null,a,r,n,e),null),De===null)throw Error(M(349));i||Xa&127||tA(a,e,n)}return n}function tA(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=re.updateQueue,e===null?(e=Of(),re.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function nA(t,e,n,a){e.value=n,e.getSnapshot=a,rA(e)&&iA(t)}function aA(t,e,n){return n(function(){rA(e)&&iA(t)})}function rA(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Sn(t,n)}catch{return!0}}function iA(t){var e=Fi(t,2);e!==null&&rn(e,t,2)}function Xg(t){var e=Yt();if(typeof t=="function"){var n=t;if(t=n(),Oi){Vr(!0);try{n()}finally{Vr(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:$a,lastRenderedState:t},e}function sA(t,e,n,a){return t.baseState=n,Ky(t,Re,typeof a=="function"?a:$a)}function uO(t,e,n,a,r){if(Uf(t))throw Error(M(485));if(t=e.action,t!==null){var i={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(s){i.listeners.push(s)}};ee.T!==null?n(!0):i.isTransition=!1,a(i),n=e.pending,n===null?(i.next=e.pending=i,oA(e,i)):(i.next=n.next,e.pending=n.next=i)}}function oA(t,e){var n=e.action,a=e.payload,r=t.state;if(e.isTransition){var i=ee.T,s={};ee.T=s;try{var u=n(r,a),l=ee.S;l!==null&&l(s,u),sw(t,e,u)}catch(c){$g(t,e,c)}finally{i!==null&&s.types!==null&&(i.types=s.types),ee.T=i}}else try{i=n(r,a),sw(t,e,i)}catch(c){$g(t,e,c)}}function sw(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){ow(t,e,a)},function(a){return $g(t,e,a)}):ow(t,e,n)}function ow(t,e,n){e.status="fulfilled",e.value=n,uA(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,oA(t,n)))}function $g(t,e,n){var a=t.pending;if(t.pending=null,a!==null){a=a.next;do e.status="rejected",e.reason=n,uA(e),e=e.next;while(e!==a)}t.action=null}function uA(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function lA(t,e){return e}function uw(t,e){if(he){var n=De.formState;if(n!==null){e:{var a=re;if(he){if(Ve){t:{for(var r=Ve,i=Mn;r.nodeType!==8;){if(!i){r=null;break t}if(r=Vn(r.nextSibling),r===null){r=null;break t}}i=r.data,r=i==="F!"||i==="F"?r:null}if(r){Ve=Vn(r.nextSibling),a=r.data==="F!";break e}}Zr(a)}a=!1}a&&(e=n[0])}}return n=Yt(),n.memoizedState=n.baseState=e,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:lA,lastRenderedState:e},n.queue=a,n=CA.bind(null,re,a),a.dispatch=n,a=Xg(!1),i=Jy.bind(null,re,!1,a.queue),a=Yt(),r={state:e,dispatch:null,action:t,pending:null},a.queue=r,n=uO.bind(null,re,r,i,n),r.dispatch=n,a.memoizedState=t,[e,n,!1]}function lw(t){var e=nt();return cA(e,Re,t)}function cA(t,e,n){if(e=Ky(t,e,lA)[0],t=zd($a)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var a=ml(e)}catch(s){throw s===so?Pf:s}else a=e;e=nt();var r=e.queue,i=r.dispatch;return n!==e.memoizedState&&(re.flags|=2048,$s(9,{destroy:void 0},lO.bind(null,r,n),null)),[a,i,t]}function lO(t,e){t.action=e}function cw(t){var e=nt(),n=Re;if(n!==null)return cA(e,n,t);nt(),e=e.memoizedState,n=nt();var a=n.queue.dispatch;return n.memoizedState=t,[e,a,!1]}function $s(t,e,n,a){return t={tag:t,create:n,deps:a,inst:e,next:null},e=re.updateQueue,e===null&&(e=Of(),re.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(a=n.next,n.next=t,t.next=a,e.lastEffect=t),t}function dA(){return nt().memoizedState}function Hd(t,e,n,a){var r=Yt();re.flags|=t,r.memoizedState=$s(1|e,{destroy:void 0},n,a===void 0?null:a)}function Mf(t,e,n,a){var r=nt();a=a===void 0?null:a;var i=r.memoizedState.inst;Re!==null&&a!==null&&qy(a,Re.memoizedState.deps)?r.memoizedState=$s(e,i,n,a):(re.flags|=t,r.memoizedState=$s(1|e,i,n,a))}function dw(t,e){Hd(8390656,8,t,e)}function Yy(t,e){Mf(2048,8,t,e)}function cO(t){re.flags|=4;var e=re.updateQueue;if(e===null)e=Of(),re.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function fA(t){var e=nt().memoizedState;return cO({ref:e,nextImpl:t}),function(){if(ve&2)throw Error(M(440));return e.impl.apply(void 0,arguments)}}function hA(t,e){return Mf(4,2,t,e)}function pA(t,e){return Mf(4,4,t,e)}function mA(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function gA(t,e,n){n=n!=null?n.concat([t]):null,Mf(4,4,mA.bind(null,e,t),n)}function Qy(){}function yA(t,e){var n=nt();e=e===void 0?null:e;var a=n.memoizedState;return e!==null&&qy(e,a[1])?a[0]:(n.memoizedState=[t,e],t)}function _A(t,e){var n=nt();e=e===void 0?null:e;var a=n.memoizedState;if(e!==null&&qy(e,a[1]))return a[0];if(a=t(),Oi){Vr(!0);try{t()}finally{Vr(!1)}}return n.memoizedState=[a,e],a}function Xy(t,e,n){return n===void 0||Xa&1073741824&&!(fe&261930)?t.memoizedState=e:(t.memoizedState=n,t=sb(),re.lanes|=t,ti|=t,n)}function IA(t,e,n,a){return Sn(n,e)?n:Xs.current!==null?(t=Xy(t,n,a),Sn(t,e)||(ct=!0),t):!(Xa&42)||Xa&1073741824&&!(fe&261930)?(ct=!0,t.memoizedState=n):(t=sb(),re.lanes|=t,ti|=t,e)}function TA(t,e,n,a,r){var i=Ee.p;Ee.p=i!==0&&8>i?i:8;var s=ee.T,u={};ee.T=u,Jy(t,!1,e,n);try{var l=r(),c=ee.S;if(c!==null&&c(u,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=iO(l,a);zu(t,e,f,Tn(t))}else zu(t,e,a,Tn(t))}catch(m){zu(t,e,{then:function(){},status:"rejected",reason:m},Tn())}finally{Ee.p=i,s!==null&&u.types!==null&&(s.types=u.types),ee.T=s}}function dO(){}function Jg(t,e,n,a){if(t.tag!==5)throw Error(M(476));var r=SA(t).queue;TA(t,r,e,Ai,n===null?dO:function(){return vA(t),n(a)})}function SA(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Ai,baseState:Ai,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:$a,lastRenderedState:Ai},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:$a,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function vA(t){var e=SA(t);e.next===null&&(e=t.alternate.memoizedState),zu(t,e.next.queue,{},Tn())}function $y(){return Nt(il)}function EA(){return nt().memoizedState}function wA(){return nt().memoizedState}function fO(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Tn();t=jr(n);var a=Wr(e,t,n);a!==null&&(rn(a,e,n),Fu(a,e,n)),e={cache:My()},t.payload=e;return}e=e.return}}function hO(t,e,n){var a=Tn();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Uf(t)?AA(e,n):(n=Dy(t,e,n,a),n!==null&&(rn(n,t,a),bA(n,e,a)))}function CA(t,e,n){var a=Tn();zu(t,e,n,a)}function zu(t,e,n,a){var r={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Uf(t))AA(e,r);else{var i=t.alternate;if(t.lanes===0&&(i===null||i.lanes===0)&&(i=e.lastRenderedReducer,i!==null))try{var s=e.lastRenderedState,u=i(s,n);if(r.hasEagerState=!0,r.eagerState=u,Sn(u,s))return Df(t,e,r,0),De===null&&kf(),!1}catch{}finally{}if(n=Dy(t,e,r,a),n!==null)return rn(n,t,a),bA(n,e,a),!0}return!1}function Jy(t,e,n,a){if(a={lane:2,revertLane:o_(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Uf(t)){if(e)throw Error(M(479))}else e=Dy(t,n,a,2),e!==null&&rn(e,t,2)}function Uf(t){var e=t.alternate;return t===re||e!==null&&e===re}function AA(t,e){Gs=cf=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function bA(t,e,n){if(n&4194048){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,fC(t,n)}}var nl={readContext:Nt,use:Nf,useCallback:Xe,useContext:Xe,useEffect:Xe,useImperativeHandle:Xe,useLayoutEffect:Xe,useInsertionEffect:Xe,useMemo:Xe,useReducer:Xe,useRef:Xe,useState:Xe,useDebugValue:Xe,useDeferredValue:Xe,useTransition:Xe,useSyncExternalStore:Xe,useId:Xe,useHostTransitionStatus:Xe,useFormState:Xe,useActionState:Xe,useOptimistic:Xe,useMemoCache:Xe,useCacheRefresh:Xe};nl.useEffectEvent=Xe;var LA={readContext:Nt,use:Nf,useCallback:function(t,e){return Yt().memoizedState=[t,e===void 0?null:e],t},useContext:Nt,useEffect:dw,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,Hd(4194308,4,mA.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Hd(4194308,4,t,e)},useInsertionEffect:function(t,e){Hd(4,2,t,e)},useMemo:function(t,e){var n=Yt();e=e===void 0?null:e;var a=t();if(Oi){Vr(!0);try{t()}finally{Vr(!1)}}return n.memoizedState=[a,e],a},useReducer:function(t,e,n){var a=Yt();if(n!==void 0){var r=n(e);if(Oi){Vr(!0);try{n(e)}finally{Vr(!1)}}}else r=e;return a.memoizedState=a.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},a.queue=t,t=t.dispatch=hO.bind(null,re,t),[a.memoizedState,t]},useRef:function(t){var e=Yt();return t={current:t},e.memoizedState=t},useState:function(t){t=Xg(t);var e=t.queue,n=CA.bind(null,re,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Qy,useDeferredValue:function(t,e){var n=Yt();return Xy(n,t,e)},useTransition:function(){var t=Xg(!1);return t=TA.bind(null,re,t.queue,!0,!1),Yt().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var a=re,r=Yt();if(he){if(n===void 0)throw Error(M(407));n=n()}else{if(n=e(),De===null)throw Error(M(349));fe&127||tA(a,e,n)}r.memoizedState=n;var i={value:n,getSnapshot:e};return r.queue=i,dw(aA.bind(null,a,i,t),[t]),a.flags|=2048,$s(9,{destroy:void 0},nA.bind(null,a,i,n,e),null),n},useId:function(){var t=Yt(),e=De.identifierPrefix;if(he){var n=ua,a=oa;n=(a&~(1<<32-In(a)-1)).toString(32)+n,e="_"+e+"R_"+n,n=df++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=sO++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:$y,useFormState:uw,useActionState:uw,useOptimistic:function(t){var e=Yt();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=Jy.bind(null,re,!0,n),n.dispatch=e,[t,e]},useMemoCache:Wy,useCacheRefresh:function(){return Yt().memoizedState=fO.bind(null,re)},useEffectEvent:function(t){var e=Yt(),n={impl:t};return e.memoizedState=n,function(){if(ve&2)throw Error(M(440));return n.impl.apply(void 0,arguments)}}},Zy={readContext:Nt,use:Nf,useCallback:yA,useContext:Nt,useEffect:Yy,useImperativeHandle:gA,useInsertionEffect:hA,useLayoutEffect:pA,useMemo:_A,useReducer:zd,useRef:dA,useState:function(){return zd($a)},useDebugValue:Qy,useDeferredValue:function(t,e){var n=nt();return IA(n,Re.memoizedState,t,e)},useTransition:function(){var t=zd($a)[0],e=nt().memoizedState;return[typeof t=="boolean"?t:ml(t),e]},useSyncExternalStore:eA,useId:EA,useHostTransitionStatus:$y,useFormState:lw,useActionState:lw,useOptimistic:function(t,e){var n=nt();return sA(n,Re,t,e)},useMemoCache:Wy,useCacheRefresh:wA};Zy.useEffectEvent=fA;var RA={readContext:Nt,use:Nf,useCallback:yA,useContext:Nt,useEffect:Yy,useImperativeHandle:gA,useInsertionEffect:hA,useLayoutEffect:pA,useMemo:_A,useReducer:sg,useRef:dA,useState:function(){return sg($a)},useDebugValue:Qy,useDeferredValue:function(t,e){var n=nt();return Re===null?Xy(n,t,e):IA(n,Re.memoizedState,t,e)},useTransition:function(){var t=sg($a)[0],e=nt().memoizedState;return[typeof t=="boolean"?t:ml(t),e]},useSyncExternalStore:eA,useId:EA,useHostTransitionStatus:$y,useFormState:cw,useActionState:cw,useOptimistic:function(t,e){var n=nt();return Re!==null?sA(n,Re,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:Wy,useCacheRefresh:wA};RA.useEffectEvent=fA;function og(t,e,n,a){e=t.memoizedState,n=n(a,e),n=n==null?e:Fe({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Zg={enqueueSetState:function(t,e,n){t=t._reactInternals;var a=Tn(),r=jr(a);r.payload=e,n!=null&&(r.callback=n),e=Wr(t,r,a),e!==null&&(rn(e,t,a),Fu(e,t,a))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var a=Tn(),r=jr(a);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=Wr(t,r,a),e!==null&&(rn(e,t,a),Fu(e,t,a))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Tn(),a=jr(n);a.tag=2,e!=null&&(a.callback=e),e=Wr(t,a,n),e!==null&&(rn(e,t,n),Fu(e,t,n))}};function fw(t,e,n,a,r,i,s){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(a,i,s):e.prototype&&e.prototype.isPureReactComponent?!$u(n,a)||!$u(r,i):!0}function hw(t,e,n,a){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,a),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,a),e.state!==t&&Zg.enqueueReplaceState(e,e.state,null)}function Ni(t,e){var n=e;if("ref"in e){n={};for(var a in e)a!=="ref"&&(n[a]=e[a])}if(t=t.defaultProps){n===e&&(n=Fe({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function xA(t){nf(t)}function kA(t){console.error(t)}function DA(t){nf(t)}function ff(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(a){setTimeout(function(){throw a})}}function pw(t,e,n){try{var a=t.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function ey(t,e,n){return n=jr(n),n.tag=3,n.payload={element:null},n.callback=function(){ff(t,e)},n}function PA(t){return t=jr(t),t.tag=3,t}function OA(t,e,n,a){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var i=a.value;t.payload=function(){return r(i)},t.callback=function(){pw(e,n,a)}}var s=n.stateNode;s!==null&&typeof s.componentDidCatch=="function"&&(t.callback=function(){pw(e,n,a),typeof r!="function"&&(Kr===null?Kr=new Set([this]):Kr.add(this));var u=a.stack;this.componentDidCatch(a.value,{componentStack:u!==null?u:""})})}function pO(t,e,n,a,r){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(e=n.alternate,e!==null&&io(e,n,r,!0),n=vn.current,n!==null){switch(n.tag){case 31:case 13:return Un===null?yf():n.alternate===null&&$e===0&&($e=3),n.flags&=-257,n.flags|=65536,n.lanes=r,a===of?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([a]):e.add(a),_g(t,a,r)),!1;case 22:return n.flags|=65536,a===of?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([a]):n.add(a)),_g(t,a,r)),!1}throw Error(M(435,n.tag))}return _g(t,a,r),yf(),!1}if(he)return e=vn.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,a!==qg&&(t=Error(M(422),{cause:a}),Zu(Nn(t,n)))):(a!==qg&&(e=Error(M(423),{cause:a}),Zu(Nn(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,a=Nn(a,n),r=ey(t.stateNode,a,r),ig(t,r),$e!==4&&($e=2)),!1;var i=Error(M(520),{cause:a});if(i=Nn(i,n),ju===null?ju=[i]:ju.push(i),$e!==4&&($e=2),e===null)return!0;a=Nn(a,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=ey(n.stateNode,a,t),ig(n,t),!1;case 1:if(e=n.type,i=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||i!==null&&typeof i.componentDidCatch=="function"&&(Kr===null||!Kr.has(i))))return n.flags|=65536,r&=-r,n.lanes|=r,r=PA(r),OA(r,t,n,a),ig(n,r),!1}n=n.return}while(n!==null);return!1}var e_=Error(M(461)),ct=!1;function Dt(t,e,n,a){e.child=t===null?YC(e,null,n,a):Pi(e,t.child,n,a)}function mw(t,e,n,a,r){n=n.render;var i=e.ref;if("ref"in a){var s={};for(var u in a)u!=="ref"&&(s[u]=a[u])}else s=a;return Di(e),a=zy(t,e,n,s,i,r),u=Hy(),t!==null&&!ct?(Gy(t,e,r),Ja(t,e,r)):(he&&u&&Oy(e),e.flags|=1,Dt(t,e,a,r),e.child)}function gw(t,e,n,a,r){if(t===null){var i=n.type;return typeof i=="function"&&!Py(i)&&i.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=i,NA(t,e,i,a,r)):(t=Bd(n.type,null,a,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(i=t.child,!t_(t,r)){var s=i.memoizedProps;if(n=n.compare,n=n!==null?n:$u,n(s,a)&&t.ref===e.ref)return Ja(t,e,r)}return e.flags|=1,t=Wa(i,a),t.ref=e.ref,t.return=e,e.child=t}function NA(t,e,n,a,r){if(t!==null){var i=t.memoizedProps;if($u(i,a)&&t.ref===e.ref)if(ct=!1,e.pendingProps=a=i,t_(t,r))t.flags&131072&&(ct=!0);else return e.lanes=t.lanes,Ja(t,e,r)}return ty(t,e,n,a,r)}function MA(t,e,n,a){var r=a.children,i=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(e.flags&128){if(i=i!==null?i.baseLanes|n:n,t!==null){for(a=e.child=t.child,r=0;a!==null;)r=r|a.lanes|a.childLanes,a=a.sibling;a=r&~i}else a=0,e.child=null;return yw(t,e,i,n,a)}if(n&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&qd(e,i!==null?i.cachePool:null),i!==null?iw(e,i):Yg(),$C(e);else return a=e.lanes=536870912,yw(t,e,i!==null?i.baseLanes|n:n,n,a)}else i!==null?(qd(e,i.cachePool),iw(e,i),Mr(e),e.memoizedState=null):(t!==null&&qd(e,null),Yg(),Mr(e));return Dt(t,e,r,n),e.child}function Pu(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function yw(t,e,n,a,r){var i=Uy();return i=i===null?null:{parent:lt._currentValue,pool:i},e.memoizedState={baseLanes:n,cachePool:i},t!==null&&qd(e,null),Yg(),$C(e),t!==null&&io(t,e,a,!0),e.childLanes=r,null}function Gd(t,e){return e=hf({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function _w(t,e,n){return Pi(e,t.child,null,n),t=Gd(e,e.pendingProps),t.flags|=2,pn(e),e.memoizedState=null,t}function mO(t,e,n){var a=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(he){if(a.mode==="hidden")return t=Gd(e,a),e.lanes=536870912,Pu(null,t);if(Qg(e),(t=Ve)?(t=Lb(t,Mn),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Jr!==null?{id:oa,overflow:ua}:null,retryLane:536870912,hydrationErrors:null},n=qC(t),n.return=e,e.child=n,Ot=e,Ve=null)):t=null,t===null)throw Zr(e);return e.lanes=536870912,null}return Gd(e,a)}var i=t.memoizedState;if(i!==null){var s=i.dehydrated;if(Qg(e),r)if(e.flags&256)e.flags&=-257,e=_w(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(M(558));else if(ct||io(t,e,n,!1),r=(n&t.childLanes)!==0,ct||r){if(a=De,a!==null&&(s=hC(a,n),s!==0&&s!==i.retryLane))throw i.retryLane=s,Fi(t,s),rn(a,t,s),e_;yf(),e=_w(t,e,n)}else t=i.treeContext,Ve=Vn(s.nextSibling),Ot=e,he=!0,Gr=null,Mn=!1,t!==null&&HC(e,t),e=Gd(e,a),e.flags|=4096;return e}return t=Wa(t.child,{mode:a.mode,children:a.children}),t.ref=e.ref,e.child=t,t.return=e,t}function jd(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(M(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function ty(t,e,n,a,r){return Di(e),n=zy(t,e,n,a,void 0,r),a=Hy(),t!==null&&!ct?(Gy(t,e,r),Ja(t,e,r)):(he&&a&&Oy(e),e.flags|=1,Dt(t,e,n,r),e.child)}function Iw(t,e,n,a,r,i){return Di(e),e.updateQueue=null,n=ZC(e,a,n,r),JC(t),a=Hy(),t!==null&&!ct?(Gy(t,e,i),Ja(t,e,i)):(he&&a&&Oy(e),e.flags|=1,Dt(t,e,n,i),e.child)}function Tw(t,e,n,a,r){if(Di(e),e.stateNode===null){var i=Ns,s=n.contextType;typeof s=="object"&&s!==null&&(i=Nt(s)),i=new n(a,i),e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Zg,e.stateNode=i,i._reactInternals=e,i=e.stateNode,i.props=a,i.state=e.memoizedState,i.refs={},Fy(e),s=n.contextType,i.context=typeof s=="object"&&s!==null?Nt(s):Ns,i.state=e.memoizedState,s=n.getDerivedStateFromProps,typeof s=="function"&&(og(e,n,s,a),i.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(s=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),s!==i.state&&Zg.enqueueReplaceState(i,i.state,null),qu(e,a,i,r),Bu(),i.state=e.memoizedState),typeof i.componentDidMount=="function"&&(e.flags|=4194308),a=!0}else if(t===null){i=e.stateNode;var u=e.memoizedProps,l=Ni(n,u);i.props=l;var c=i.context,f=n.contextType;s=Ns,typeof f=="object"&&f!==null&&(s=Nt(f));var m=n.getDerivedStateFromProps;f=typeof m=="function"||typeof i.getSnapshotBeforeUpdate=="function",u=e.pendingProps!==u,f||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(u||c!==s)&&hw(e,i,a,s),Pr=!1;var p=e.memoizedState;i.state=p,qu(e,a,i,r),Bu(),c=e.memoizedState,u||p!==c||Pr?(typeof m=="function"&&(og(e,n,m,a),c=e.memoizedState),(l=Pr||fw(e,n,l,a,p,c,s))?(f||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(e.flags|=4194308)):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=a,e.memoizedState=c),i.props=a,i.state=c,i.context=s,a=l):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),a=!1)}else{i=e.stateNode,Wg(t,e),s=e.memoizedProps,f=Ni(n,s),i.props=f,m=e.pendingProps,p=i.context,c=n.contextType,l=Ns,typeof c=="object"&&c!==null&&(l=Nt(c)),u=n.getDerivedStateFromProps,(c=typeof u=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==m||p!==l)&&hw(e,i,a,l),Pr=!1,p=e.memoizedState,i.state=p,qu(e,a,i,r),Bu();var I=e.memoizedState;s!==m||p!==I||Pr||t!==null&&t.dependencies!==null&&sf(t.dependencies)?(typeof u=="function"&&(og(e,n,u,a),I=e.memoizedState),(f=Pr||fw(e,n,f,a,p,I,l)||t!==null&&t.dependencies!==null&&sf(t.dependencies))?(c||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(a,I,l),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(a,I,l)),typeof i.componentDidUpdate=="function"&&(e.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof i.componentDidUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),e.memoizedProps=a,e.memoizedState=I),i.props=a,i.state=I,i.context=l,a=f):(typeof i.componentDidUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),a=!1)}return i=a,jd(t,e),a=(e.flags&128)!==0,i||a?(i=e.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:i.render(),e.flags|=1,t!==null&&a?(e.child=Pi(e,t.child,null,r),e.child=Pi(e,null,n,r)):Dt(t,e,n,r),e.memoizedState=i.state,t=e.child):t=Ja(t,e,r),t}function Sw(t,e,n,a){return ki(),e.flags|=256,Dt(t,e,n,a),e.child}var ug={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function lg(t){return{baseLanes:t,cachePool:jC()}}function cg(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=gn),t}function UA(t,e,n){var a=e.pendingProps,r=!1,i=(e.flags&128)!==0,s;if((s=i)||(s=t!==null&&t.memoizedState===null?!1:(tt.current&2)!==0),s&&(r=!0,e.flags&=-129),s=(e.flags&32)!==0,e.flags&=-33,t===null){if(he){if(r?Nr(e):Mr(e),(t=Ve)?(t=Lb(t,Mn),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Jr!==null?{id:oa,overflow:ua}:null,retryLane:536870912,hydrationErrors:null},n=qC(t),n.return=e,e.child=n,Ot=e,Ve=null)):t=null,t===null)throw Zr(e);return my(t)?e.lanes=32:e.lanes=536870912,null}var u=a.children;return a=a.fallback,r?(Mr(e),r=e.mode,u=hf({mode:"hidden",children:u},r),a=bi(a,r,n,null),u.return=e,a.return=e,u.sibling=a,e.child=u,a=e.child,a.memoizedState=lg(n),a.childLanes=cg(t,s,n),e.memoizedState=ug,Pu(null,a)):(Nr(e),ny(e,u))}var l=t.memoizedState;if(l!==null&&(u=l.dehydrated,u!==null)){if(i)e.flags&256?(Nr(e),e.flags&=-257,e=dg(t,e,n)):e.memoizedState!==null?(Mr(e),e.child=t.child,e.flags|=128,e=null):(Mr(e),u=a.fallback,r=e.mode,a=hf({mode:"visible",children:a.children},r),u=bi(u,r,n,null),u.flags|=2,a.return=e,u.return=e,a.sibling=u,e.child=a,Pi(e,t.child,null,n),a=e.child,a.memoizedState=lg(n),a.childLanes=cg(t,s,n),e.memoizedState=ug,e=Pu(null,a));else if(Nr(e),my(u)){if(s=u.nextSibling&&u.nextSibling.dataset,s)var c=s.dgst;s=c,a=Error(M(419)),a.stack="",a.digest=s,Zu({value:a,source:null,stack:null}),e=dg(t,e,n)}else if(ct||io(t,e,n,!1),s=(n&t.childLanes)!==0,ct||s){if(s=De,s!==null&&(a=hC(s,n),a!==0&&a!==l.retryLane))throw l.retryLane=a,Fi(t,a),rn(s,t,a),e_;py(u)||yf(),e=dg(t,e,n)}else py(u)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,Ve=Vn(u.nextSibling),Ot=e,he=!0,Gr=null,Mn=!1,t!==null&&HC(e,t),e=ny(e,a.children),e.flags|=4096);return e}return r?(Mr(e),u=a.fallback,r=e.mode,l=t.child,c=l.sibling,a=Wa(l,{mode:"hidden",children:a.children}),a.subtreeFlags=l.subtreeFlags&65011712,c!==null?u=Wa(c,u):(u=bi(u,r,n,null),u.flags|=2),u.return=e,a.return=e,a.sibling=u,e.child=a,Pu(null,a),a=e.child,u=t.child.memoizedState,u===null?u=lg(n):(r=u.cachePool,r!==null?(l=lt._currentValue,r=r.parent!==l?{parent:l,pool:l}:r):r=jC(),u={baseLanes:u.baseLanes|n,cachePool:r}),a.memoizedState=u,a.childLanes=cg(t,s,n),e.memoizedState=ug,Pu(t.child,a)):(Nr(e),n=t.child,t=n.sibling,n=Wa(n,{mode:"visible",children:a.children}),n.return=e,n.sibling=null,t!==null&&(s=e.deletions,s===null?(e.deletions=[t],e.flags|=16):s.push(t)),e.child=n,e.memoizedState=null,n)}function ny(t,e){return e=hf({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function hf(t,e){return t=mn(22,t,null,e),t.lanes=0,t}function dg(t,e,n){return Pi(e,t.child,null,n),t=ny(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function vw(t,e,n){t.lanes|=e;var a=t.alternate;a!==null&&(a.lanes|=e),Hg(t.return,e,n)}function fg(t,e,n,a,r,i){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:r,treeForkCount:i}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=a,s.tail=n,s.tailMode=r,s.treeForkCount=i)}function VA(t,e,n){var a=e.pendingProps,r=a.revealOrder,i=a.tail;a=a.children;var s=tt.current,u=(s&2)!==0;if(u?(s=s&1|2,e.flags|=128):s&=1,Pe(tt,s),Dt(t,e,a,n),a=he?Ju:0,!u&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&vw(t,n,e);else if(t.tag===19)vw(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&lf(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),fg(e,!1,r,n,i,a);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&lf(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}fg(e,!0,n,null,i,a);break;case"together":fg(e,!1,null,null,void 0,a);break;default:e.memoizedState=null}return e.child}function Ja(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),ti|=e.lanes,!(n&e.childLanes))if(t!==null){if(io(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(M(153));if(e.child!==null){for(t=e.child,n=Wa(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Wa(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function t_(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&sf(t)))}function gO(t,e,n){switch(e.tag){case 3:Jd(e,e.stateNode.containerInfo),Or(e,lt,t.memoizedState.cache),ki();break;case 27:case 5:xg(e);break;case 4:Jd(e,e.stateNode.containerInfo);break;case 10:Or(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Qg(e),null;break;case 13:var a=e.memoizedState;if(a!==null)return a.dehydrated!==null?(Nr(e),e.flags|=128,null):n&e.child.childLanes?UA(t,e,n):(Nr(e),t=Ja(t,e,n),t!==null?t.sibling:null);Nr(e);break;case 19:var r=(t.flags&128)!==0;if(a=(n&e.childLanes)!==0,a||(io(t,e,n,!1),a=(n&e.childLanes)!==0),r){if(a)return VA(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Pe(tt,tt.current),a)break;return null;case 22:return e.lanes=0,MA(t,e,n,e.pendingProps);case 24:Or(e,lt,t.memoizedState.cache)}return Ja(t,e,n)}function FA(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)ct=!0;else{if(!t_(t,n)&&!(e.flags&128))return ct=!1,gO(t,e,n);ct=!!(t.flags&131072)}else ct=!1,he&&e.flags&1048576&&zC(e,Ju,e.index);switch(e.lanes=0,e.tag){case 16:e:{var a=e.pendingProps;if(t=wi(e.elementType),e.type=t,typeof t=="function")Py(t)?(a=Ni(t,a),e.tag=1,e=Tw(null,e,t,a,n)):(e.tag=0,e=ty(null,e,t,a,n));else{if(t!=null){var r=t.$$typeof;if(r===Iy){e.tag=11,e=mw(null,e,t,a,n);break e}else if(r===Ty){e.tag=14,e=gw(null,e,t,a,n);break e}}throw e=Lg(t)||t,Error(M(306,e,""))}}return e;case 0:return ty(t,e,e.type,e.pendingProps,n);case 1:return a=e.type,r=Ni(a,e.pendingProps),Tw(t,e,a,r,n);case 3:e:{if(Jd(e,e.stateNode.containerInfo),t===null)throw Error(M(387));a=e.pendingProps;var i=e.memoizedState;r=i.element,Wg(t,e),qu(e,a,null,n);var s=e.memoizedState;if(a=s.cache,Or(e,lt,a),a!==i.cache&&Gg(e,[lt],n,!0),Bu(),a=s.element,i.isDehydrated)if(i={element:a,isDehydrated:!1,cache:s.cache},e.updateQueue.baseState=i,e.memoizedState=i,e.flags&256){e=Sw(t,e,a,n);break e}else if(a!==r){r=Nn(Error(M(424)),e),Zu(r),e=Sw(t,e,a,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(Ve=Vn(t.firstChild),Ot=e,he=!0,Gr=null,Mn=!0,n=YC(e,null,a,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(ki(),a===r){e=Ja(t,e,n);break e}Dt(t,e,a,n)}e=e.child}return e;case 26:return jd(t,e),t===null?(n=Gw(e.type,null,e.pendingProps,null))?e.memoizedState=n:he||(n=e.type,t=e.pendingProps,a=Sf(Hr.current).createElement(n),a[Pt]=e,a[sn]=t,Mt(a,n,t),Ct(a),e.stateNode=a):e.memoizedState=Gw(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return xg(e),t===null&&he&&(a=e.stateNode=Rb(e.type,e.pendingProps,Hr.current),Ot=e,Mn=!0,r=Ve,ai(e.type)?(gy=r,Ve=Vn(a.firstChild)):Ve=r),Dt(t,e,e.pendingProps.children,n),jd(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&he&&((r=a=Ve)&&(a=GO(a,e.type,e.pendingProps,Mn),a!==null?(e.stateNode=a,Ot=e,Ve=Vn(a.firstChild),Mn=!1,r=!0):r=!1),r||Zr(e)),xg(e),r=e.type,i=e.pendingProps,s=t!==null?t.memoizedProps:null,a=i.children,fy(r,i)?a=null:s!==null&&fy(r,s)&&(e.flags|=32),e.memoizedState!==null&&(r=zy(t,e,oO,null,null,n),il._currentValue=r),jd(t,e),Dt(t,e,a,n),e.child;case 6:return t===null&&he&&((t=n=Ve)&&(n=jO(n,e.pendingProps,Mn),n!==null?(e.stateNode=n,Ot=e,Ve=null,t=!0):t=!1),t||Zr(e)),null;case 13:return UA(t,e,n);case 4:return Jd(e,e.stateNode.containerInfo),a=e.pendingProps,t===null?e.child=Pi(e,null,a,n):Dt(t,e,a,n),e.child;case 11:return mw(t,e,e.type,e.pendingProps,n);case 7:return Dt(t,e,e.pendingProps,n),e.child;case 8:return Dt(t,e,e.pendingProps.children,n),e.child;case 12:return Dt(t,e,e.pendingProps.children,n),e.child;case 10:return a=e.pendingProps,Or(e,e.type,a.value),Dt(t,e,a.children,n),e.child;case 9:return r=e.type._context,a=e.pendingProps.children,Di(e),r=Nt(r),a=a(r),e.flags|=1,Dt(t,e,a,n),e.child;case 14:return gw(t,e,e.type,e.pendingProps,n);case 15:return NA(t,e,e.type,e.pendingProps,n);case 19:return VA(t,e,n);case 31:return mO(t,e,n);case 22:return MA(t,e,n,e.pendingProps);case 24:return Di(e),a=Nt(lt),t===null?(r=Uy(),r===null&&(r=De,i=My(),r.pooledCache=i,i.refCount++,i!==null&&(r.pooledCacheLanes|=n),r=i),e.memoizedState={parent:a,cache:r},Fy(e),Or(e,lt,r)):(t.lanes&n&&(Wg(t,e),qu(e,null,null,n),Bu()),r=t.memoizedState,i=e.memoizedState,r.parent!==a?(r={parent:a,cache:a},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),Or(e,lt,a)):(a=i.cache,Or(e,lt,a),a!==r.cache&&Gg(e,[lt],n,!0))),Dt(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(M(156,e.tag))}function Ua(t){t.flags|=4}function hg(t,e,n,a,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(lb())t.flags|=8192;else throw Ri=of,Vy}else t.flags&=-16777217}function Ew(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!Db(e))if(lb())t.flags|=8192;else throw Ri=of,Vy}function Rd(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?cC():536870912,t.lanes|=e,Js|=e)}function Au(t,e){if(!he)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:a.sibling=null}}function Ue(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,a=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags&65011712,a|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags,a|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=a,t.childLanes=n,e}function yO(t,e,n){var a=e.pendingProps;switch(Ny(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ue(e),null;case 1:return Ue(e),null;case 3:return n=e.stateNode,a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),Ka(lt),Ws(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(Es(e)?Ua(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,rg())),Ue(e),null;case 26:var r=e.type,i=e.memoizedState;return t===null?(Ua(e),i!==null?(Ue(e),Ew(e,i)):(Ue(e),hg(e,r,null,a,n))):i?i!==t.memoizedState?(Ua(e),Ue(e),Ew(e,i)):(Ue(e),e.flags&=-16777217):(t=t.memoizedProps,t!==a&&Ua(e),Ue(e),hg(e,r,t,a,n)),null;case 27:if(Zd(e),n=Hr.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&Ua(e);else{if(!a){if(e.stateNode===null)throw Error(M(166));return Ue(e),null}t=ca.current,Es(e)?JE(e,t):(t=Rb(r,a,n),e.stateNode=t,Ua(e))}return Ue(e),null;case 5:if(Zd(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&Ua(e);else{if(!a){if(e.stateNode===null)throw Error(M(166));return Ue(e),null}if(i=ca.current,Es(e))JE(e,i);else{var s=Sf(Hr.current);switch(i){case 1:i=s.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:i=s.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":i=s.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":i=s.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":i=s.createElement("div"),i.innerHTML="<script><\/script>",i=i.removeChild(i.firstChild);break;case"select":i=typeof a.is=="string"?s.createElement("select",{is:a.is}):s.createElement("select"),a.multiple?i.multiple=!0:a.size&&(i.size=a.size);break;default:i=typeof a.is=="string"?s.createElement(r,{is:a.is}):s.createElement(r)}}i[Pt]=e,i[sn]=a;e:for(s=e.child;s!==null;){if(s.tag===5||s.tag===6)i.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===e)break e;for(;s.sibling===null;){if(s.return===null||s.return===e)break e;s=s.return}s.sibling.return=s.return,s=s.sibling}e.stateNode=i;e:switch(Mt(i,r,a),r){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&Ua(e)}}return Ue(e),hg(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==a&&Ua(e);else{if(typeof a!="string"&&e.stateNode===null)throw Error(M(166));if(t=Hr.current,Es(e)){if(t=e.stateNode,n=e.memoizedProps,a=null,r=Ot,r!==null)switch(r.tag){case 27:case 5:a=r.memoizedProps}t[Pt]=e,t=!!(t.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||Cb(t.nodeValue,n)),t||Zr(e,!0)}else t=Sf(t).createTextNode(a),t[Pt]=e,e.stateNode=t}return Ue(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(a=Es(e),n!==null){if(t===null){if(!a)throw Error(M(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(M(557));t[Pt]=e}else ki(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Ue(e),t=!1}else n=rg(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(pn(e),e):(pn(e),null);if(e.flags&128)throw Error(M(558))}return Ue(e),null;case 13:if(a=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=Es(e),a!==null&&a.dehydrated!==null){if(t===null){if(!r)throw Error(M(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(M(317));r[Pt]=e}else ki(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Ue(e),r=!1}else r=rg(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(pn(e),e):(pn(e),null)}return pn(e),e.flags&128?(e.lanes=n,e):(n=a!==null,t=t!==null&&t.memoizedState!==null,n&&(a=e.child,r=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(r=a.alternate.memoizedState.cachePool.pool),i=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(i=a.memoizedState.cachePool.pool),i!==r&&(a.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Rd(e,e.updateQueue),Ue(e),null);case 4:return Ws(),t===null&&u_(e.stateNode.containerInfo),Ue(e),null;case 10:return Ka(e.type),Ue(e),null;case 19:if(At(tt),a=e.memoizedState,a===null)return Ue(e),null;if(r=(e.flags&128)!==0,i=a.rendering,i===null)if(r)Au(a,!1);else{if($e!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(i=lf(t),i!==null){for(e.flags|=128,Au(a,!1),t=i.updateQueue,e.updateQueue=t,Rd(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)BC(n,t),n=n.sibling;return Pe(tt,tt.current&1|2),he&&qa(e,a.treeForkCount),e.child}t=t.sibling}a.tail!==null&&yn()>mf&&(e.flags|=128,r=!0,Au(a,!1),e.lanes=4194304)}else{if(!r)if(t=lf(i),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Rd(e,t),Au(a,!0),a.tail===null&&a.tailMode==="hidden"&&!i.alternate&&!he)return Ue(e),null}else 2*yn()-a.renderingStartTime>mf&&n!==536870912&&(e.flags|=128,r=!0,Au(a,!1),e.lanes=4194304);a.isBackwards?(i.sibling=e.child,e.child=i):(t=a.last,t!==null?t.sibling=i:e.child=i,a.last=i)}return a.tail!==null?(t=a.tail,a.rendering=t,a.tail=t.sibling,a.renderingStartTime=yn(),t.sibling=null,n=tt.current,Pe(tt,r?n&1|2:n&1),he&&qa(e,a.treeForkCount),t):(Ue(e),null);case 22:case 23:return pn(e),By(),a=e.memoizedState!==null,t!==null?t.memoizedState!==null!==a&&(e.flags|=8192):a&&(e.flags|=8192),a?n&536870912&&!(e.flags&128)&&(Ue(e),e.subtreeFlags&6&&(e.flags|=8192)):Ue(e),n=e.updateQueue,n!==null&&Rd(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),a=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),a!==n&&(e.flags|=2048),t!==null&&At(Li),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),Ka(lt),Ue(e),null;case 25:return null;case 30:return null}throw Error(M(156,e.tag))}function _O(t,e){switch(Ny(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Ka(lt),Ws(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return Zd(e),null;case 31:if(e.memoizedState!==null){if(pn(e),e.alternate===null)throw Error(M(340));ki()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(pn(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(M(340));ki()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return At(tt),null;case 4:return Ws(),null;case 10:return Ka(e.type),null;case 22:case 23:return pn(e),By(),t!==null&&At(Li),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Ka(lt),null;case 25:return null;default:return null}}function BA(t,e){switch(Ny(e),e.tag){case 3:Ka(lt),Ws();break;case 26:case 27:case 5:Zd(e);break;case 4:Ws();break;case 31:e.memoizedState!==null&&pn(e);break;case 13:pn(e);break;case 19:At(tt);break;case 10:Ka(e.type);break;case 22:case 23:pn(e),By(),t!==null&&At(Li);break;case 24:Ka(lt)}}function gl(t,e){try{var n=e.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var r=a.next;n=r;do{if((n.tag&t)===t){a=void 0;var i=n.create,s=n.inst;a=i(),s.destroy=a}n=n.next}while(n!==r)}}catch(u){be(e,e.return,u)}}function ei(t,e,n){try{var a=e.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var i=r.next;a=i;do{if((a.tag&t)===t){var s=a.inst,u=s.destroy;if(u!==void 0){s.destroy=void 0,r=e;var l=n,c=u;try{c()}catch(f){be(r,l,f)}}}a=a.next}while(a!==i)}}catch(f){be(e,e.return,f)}}function qA(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{XC(e,n)}catch(a){be(t,t.return,a)}}}function zA(t,e,n){n.props=Ni(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(a){be(t,e,a)}}function Hu(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var a=t.stateNode;break;case 30:a=t.stateNode;break;default:a=t.stateNode}typeof n=="function"?t.refCleanup=n(a):n.current=a}}catch(r){be(t,e,r)}}function la(t,e){var n=t.ref,a=t.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(r){be(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){be(t,e,r)}else n.current=null}function HA(t){var e=t.type,n=t.memoizedProps,a=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(r){be(t,t.return,r)}}function pg(t,e,n){try{var a=t.stateNode;VO(a,t.type,n,e),a[sn]=e}catch(r){be(t,t.return,r)}}function GA(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&ai(t.type)||t.tag===4}function mg(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||GA(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&ai(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function ay(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Ga));else if(a!==4&&(a===27&&ai(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(ay(t,e,n),t=t.sibling;t!==null;)ay(t,e,n),t=t.sibling}function pf(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(a!==4&&(a===27&&ai(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(pf(t,e,n),t=t.sibling;t!==null;)pf(t,e,n),t=t.sibling}function jA(t){var e=t.stateNode,n=t.memoizedProps;try{for(var a=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);Mt(e,a,n),e[Pt]=t,e[sn]=n}catch(i){be(t,t.return,i)}}var za=!1,ut=!1,gg=!1,ww=typeof WeakSet=="function"?WeakSet:Set,wt=null;function IO(t,e){if(t=t.containerInfo,cy=Cf,t=DC(t),xy(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var a=n.getSelection&&n.getSelection();if(a&&a.rangeCount!==0){n=a.anchorNode;var r=a.anchorOffset,i=a.focusNode;a=a.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var s=0,u=-1,l=-1,c=0,f=0,m=t,p=null;t:for(;;){for(var I;m!==n||r!==0&&m.nodeType!==3||(u=s+r),m!==i||a!==0&&m.nodeType!==3||(l=s+a),m.nodeType===3&&(s+=m.nodeValue.length),(I=m.firstChild)!==null;)p=m,m=I;for(;;){if(m===t)break t;if(p===n&&++c===r&&(u=s),p===i&&++f===a&&(l=s),(I=m.nextSibling)!==null)break;m=p,p=m.parentNode}m=I}n=u===-1||l===-1?null:{start:u,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(dy={focusedElem:t,selectionRange:n},Cf=!1,wt=e;wt!==null;)if(e=wt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,wt=t;else for(;wt!==null;){switch(e=wt,i=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&i!==null){t=void 0,n=e,r=i.memoizedProps,i=i.memoizedState,a=n.stateNode;try{var b=Ni(n.type,r);t=a.getSnapshotBeforeUpdate(b,i),a.__reactInternalSnapshotBeforeUpdate=t}catch(x){be(n,n.return,x)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)hy(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":hy(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(M(163))}if(t=e.sibling,t!==null){t.return=e.return,wt=t;break}wt=e.return}}function WA(t,e,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:Fa(t,n),a&4&&gl(5,n);break;case 1:if(Fa(t,n),a&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(s){be(n,n.return,s)}else{var r=Ni(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(s){be(n,n.return,s)}}a&64&&qA(n),a&512&&Hu(n,n.return);break;case 3:if(Fa(t,n),a&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{XC(t,e)}catch(s){be(n,n.return,s)}}break;case 27:e===null&&a&4&&jA(n);case 26:case 5:Fa(t,n),e===null&&a&4&&HA(n),a&512&&Hu(n,n.return);break;case 12:Fa(t,n);break;case 31:Fa(t,n),a&4&&QA(t,n);break;case 13:Fa(t,n),a&4&&XA(t,n),a&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=LO.bind(null,n),WO(t,n))));break;case 22:if(a=n.memoizedState!==null||za,!a){e=e!==null&&e.memoizedState!==null||ut,r=za;var i=ut;za=a,(ut=e)&&!i?Ba(t,n,(n.subtreeFlags&8772)!==0):Fa(t,n),za=r,ut=i}break;case 30:break;default:Fa(t,n)}}function KA(t){var e=t.alternate;e!==null&&(t.alternate=null,KA(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&wy(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var qe=null,nn=!1;function Va(t,e,n){for(n=n.child;n!==null;)YA(t,e,n),n=n.sibling}function YA(t,e,n){if(_n&&typeof _n.onCommitFiberUnmount=="function")try{_n.onCommitFiberUnmount(ll,n)}catch{}switch(n.tag){case 26:ut||la(n,e),Va(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:ut||la(n,e);var a=qe,r=nn;ai(n.type)&&(qe=n.stateNode,nn=!1),Va(t,e,n),Ku(n.stateNode),qe=a,nn=r;break;case 5:ut||la(n,e);case 6:if(a=qe,r=nn,qe=null,Va(t,e,n),qe=a,nn=r,qe!==null)if(nn)try{(qe.nodeType===9?qe.body:qe.nodeName==="HTML"?qe.ownerDocument.body:qe).removeChild(n.stateNode)}catch(i){be(n,e,i)}else try{qe.removeChild(n.stateNode)}catch(i){be(n,e,i)}break;case 18:qe!==null&&(nn?(t=qe,Fw(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),no(t)):Fw(qe,n.stateNode));break;case 4:a=qe,r=nn,qe=n.stateNode.containerInfo,nn=!0,Va(t,e,n),qe=a,nn=r;break;case 0:case 11:case 14:case 15:ei(2,n,e),ut||ei(4,n,e),Va(t,e,n);break;case 1:ut||(la(n,e),a=n.stateNode,typeof a.componentWillUnmount=="function"&&zA(n,e,a)),Va(t,e,n);break;case 21:Va(t,e,n);break;case 22:ut=(a=ut)||n.memoizedState!==null,Va(t,e,n),ut=a;break;default:Va(t,e,n)}}function QA(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{no(t)}catch(n){be(e,e.return,n)}}}function XA(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{no(t)}catch(n){be(e,e.return,n)}}function TO(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new ww),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new ww),e;default:throw Error(M(435,t.tag))}}function xd(t,e){var n=TO(t);e.forEach(function(a){if(!n.has(a)){n.add(a);var r=RO.bind(null,t,a);a.then(r,r)}})}function en(t,e){var n=e.deletions;if(n!==null)for(var a=0;a<n.length;a++){var r=n[a],i=t,s=e,u=s;e:for(;u!==null;){switch(u.tag){case 27:if(ai(u.type)){qe=u.stateNode,nn=!1;break e}break;case 5:qe=u.stateNode,nn=!1;break e;case 3:case 4:qe=u.stateNode.containerInfo,nn=!0;break e}u=u.return}if(qe===null)throw Error(M(160));YA(i,s,r),qe=null,nn=!1,i=r.alternate,i!==null&&(i.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)$A(e,t),e=e.sibling}var Yn=null;function $A(t,e){var n=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:en(e,t),tn(t),a&4&&(ei(3,t,t.return),gl(3,t),ei(5,t,t.return));break;case 1:en(e,t),tn(t),a&512&&(ut||n===null||la(n,n.return)),a&64&&za&&(t=t.updateQueue,t!==null&&(a=t.callbacks,a!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?a:n.concat(a))));break;case 26:var r=Yn;if(en(e,t),tn(t),a&512&&(ut||n===null||la(n,n.return)),a&4){var i=n!==null?n.memoizedState:null;if(a=t.memoizedState,n===null)if(a===null)if(t.stateNode===null){e:{a=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(a){case"title":i=r.getElementsByTagName("title")[0],(!i||i[fl]||i[Pt]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=r.createElement(a),r.head.insertBefore(i,r.querySelector("head > title"))),Mt(i,a,n),i[Pt]=t,Ct(i),a=i;break e;case"link":var s=Ww("link","href",r).get(a+(n.href||""));if(s){for(var u=0;u<s.length;u++)if(i=s[u],i.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&i.getAttribute("rel")===(n.rel==null?null:n.rel)&&i.getAttribute("title")===(n.title==null?null:n.title)&&i.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(u,1);break t}}i=r.createElement(a),Mt(i,a,n),r.head.appendChild(i);break;case"meta":if(s=Ww("meta","content",r).get(a+(n.content||""))){for(u=0;u<s.length;u++)if(i=s[u],i.getAttribute("content")===(n.content==null?null:""+n.content)&&i.getAttribute("name")===(n.name==null?null:n.name)&&i.getAttribute("property")===(n.property==null?null:n.property)&&i.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&i.getAttribute("charset")===(n.charSet==null?null:n.charSet)){s.splice(u,1);break t}}i=r.createElement(a),Mt(i,a,n),r.head.appendChild(i);break;default:throw Error(M(468,a))}i[Pt]=t,Ct(i),a=i}t.stateNode=a}else Kw(r,t.type,t.stateNode);else t.stateNode=jw(r,a,t.memoizedProps);else i!==a?(i===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):i.count--,a===null?Kw(r,t.type,t.stateNode):jw(r,a,t.memoizedProps)):a===null&&t.stateNode!==null&&pg(t,t.memoizedProps,n.memoizedProps)}break;case 27:en(e,t),tn(t),a&512&&(ut||n===null||la(n,n.return)),n!==null&&a&4&&pg(t,t.memoizedProps,n.memoizedProps);break;case 5:if(en(e,t),tn(t),a&512&&(ut||n===null||la(n,n.return)),t.flags&32){r=t.stateNode;try{Ys(r,"")}catch(b){be(t,t.return,b)}}a&4&&t.stateNode!=null&&(r=t.memoizedProps,pg(t,r,n!==null?n.memoizedProps:r)),a&1024&&(gg=!0);break;case 6:if(en(e,t),tn(t),a&4){if(t.stateNode===null)throw Error(M(162));a=t.memoizedProps,n=t.stateNode;try{n.nodeValue=a}catch(b){be(t,t.return,b)}}break;case 3:if(Yd=null,r=Yn,Yn=vf(e.containerInfo),en(e,t),Yn=r,tn(t),a&4&&n!==null&&n.memoizedState.isDehydrated)try{no(e.containerInfo)}catch(b){be(t,t.return,b)}gg&&(gg=!1,JA(t));break;case 4:a=Yn,Yn=vf(t.stateNode.containerInfo),en(e,t),tn(t),Yn=a;break;case 12:en(e,t),tn(t);break;case 31:en(e,t),tn(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,xd(t,a)));break;case 13:en(e,t),tn(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Vf=yn()),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,xd(t,a)));break;case 22:r=t.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=za,f=ut;if(za=c||r,ut=f||l,en(e,t),ut=f,za=c,tn(t),a&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||l||za||ut||Ci(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){l=n=e;try{if(i=l.stateNode,r)s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none";else{u=l.stateNode;var m=l.memoizedProps.style,p=m!=null&&m.hasOwnProperty("display")?m.display:null;u.style.display=p==null||typeof p=="boolean"?"":(""+p).trim()}}catch(b){be(l,l.return,b)}}}else if(e.tag===6){if(n===null){l=e;try{l.stateNode.nodeValue=r?"":l.memoizedProps}catch(b){be(l,l.return,b)}}}else if(e.tag===18){if(n===null){l=e;try{var I=l.stateNode;r?Bw(I,!0):Bw(l.stateNode,!1)}catch(b){be(l,l.return,b)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}a&4&&(a=t.updateQueue,a!==null&&(n=a.retryQueue,n!==null&&(a.retryQueue=null,xd(t,n))));break;case 19:en(e,t),tn(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,xd(t,a)));break;case 30:break;case 21:break;default:en(e,t),tn(t)}}function tn(t){var e=t.flags;if(e&2){try{for(var n,a=t.return;a!==null;){if(GA(a)){n=a;break}a=a.return}if(n==null)throw Error(M(160));switch(n.tag){case 27:var r=n.stateNode,i=mg(t);pf(t,i,r);break;case 5:var s=n.stateNode;n.flags&32&&(Ys(s,""),n.flags&=-33);var u=mg(t);pf(t,u,s);break;case 3:case 4:var l=n.stateNode.containerInfo,c=mg(t);ay(t,c,l);break;default:throw Error(M(161))}}catch(f){be(t,t.return,f)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function JA(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;JA(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function Fa(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)WA(t,e.alternate,e),e=e.sibling}function Ci(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:ei(4,e,e.return),Ci(e);break;case 1:la(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&zA(e,e.return,n),Ci(e);break;case 27:Ku(e.stateNode);case 26:case 5:la(e,e.return),Ci(e);break;case 22:e.memoizedState===null&&Ci(e);break;case 30:Ci(e);break;default:Ci(e)}t=t.sibling}}function Ba(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var a=e.alternate,r=t,i=e,s=i.flags;switch(i.tag){case 0:case 11:case 15:Ba(r,i,n),gl(4,i);break;case 1:if(Ba(r,i,n),a=i,r=a.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){be(a,a.return,c)}if(a=i,r=a.updateQueue,r!==null){var u=a.stateNode;try{var l=r.shared.hiddenCallbacks;if(l!==null)for(r.shared.hiddenCallbacks=null,r=0;r<l.length;r++)QC(l[r],u)}catch(c){be(a,a.return,c)}}n&&s&64&&qA(i),Hu(i,i.return);break;case 27:jA(i);case 26:case 5:Ba(r,i,n),n&&a===null&&s&4&&HA(i),Hu(i,i.return);break;case 12:Ba(r,i,n);break;case 31:Ba(r,i,n),n&&s&4&&QA(r,i);break;case 13:Ba(r,i,n),n&&s&4&&XA(r,i);break;case 22:i.memoizedState===null&&Ba(r,i,n),Hu(i,i.return);break;case 30:break;default:Ba(r,i,n)}e=e.sibling}}function n_(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&pl(n))}function a_(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&pl(t))}function Kn(t,e,n,a){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)ZA(t,e,n,a),e=e.sibling}function ZA(t,e,n,a){var r=e.flags;switch(e.tag){case 0:case 11:case 15:Kn(t,e,n,a),r&2048&&gl(9,e);break;case 1:Kn(t,e,n,a);break;case 3:Kn(t,e,n,a),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&pl(t)));break;case 12:if(r&2048){Kn(t,e,n,a),t=e.stateNode;try{var i=e.memoizedProps,s=i.id,u=i.onPostCommit;typeof u=="function"&&u(s,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){be(e,e.return,l)}}else Kn(t,e,n,a);break;case 31:Kn(t,e,n,a);break;case 13:Kn(t,e,n,a);break;case 23:break;case 22:i=e.stateNode,s=e.alternate,e.memoizedState!==null?i._visibility&2?Kn(t,e,n,a):Gu(t,e):i._visibility&2?Kn(t,e,n,a):(i._visibility|=2,Cs(t,e,n,a,(e.subtreeFlags&10256)!==0||!1)),r&2048&&n_(s,e);break;case 24:Kn(t,e,n,a),r&2048&&a_(e.alternate,e);break;default:Kn(t,e,n,a)}}function Cs(t,e,n,a,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var i=t,s=e,u=n,l=a,c=s.flags;switch(s.tag){case 0:case 11:case 15:Cs(i,s,u,l,r),gl(8,s);break;case 23:break;case 22:var f=s.stateNode;s.memoizedState!==null?f._visibility&2?Cs(i,s,u,l,r):Gu(i,s):(f._visibility|=2,Cs(i,s,u,l,r)),r&&c&2048&&n_(s.alternate,s);break;case 24:Cs(i,s,u,l,r),r&&c&2048&&a_(s.alternate,s);break;default:Cs(i,s,u,l,r)}e=e.sibling}}function Gu(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,a=e,r=a.flags;switch(a.tag){case 22:Gu(n,a),r&2048&&n_(a.alternate,a);break;case 24:Gu(n,a),r&2048&&a_(a.alternate,a);break;default:Gu(n,a)}e=e.sibling}}var Ou=8192;function ws(t,e,n){if(t.subtreeFlags&Ou)for(t=t.child;t!==null;)eb(t,e,n),t=t.sibling}function eb(t,e,n){switch(t.tag){case 26:ws(t,e,n),t.flags&Ou&&t.memoizedState!==null&&rN(n,Yn,t.memoizedState,t.memoizedProps);break;case 5:ws(t,e,n);break;case 3:case 4:var a=Yn;Yn=vf(t.stateNode.containerInfo),ws(t,e,n),Yn=a;break;case 22:t.memoizedState===null&&(a=t.alternate,a!==null&&a.memoizedState!==null?(a=Ou,Ou=16777216,ws(t,e,n),Ou=a):ws(t,e,n));break;default:ws(t,e,n)}}function tb(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function bu(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];wt=a,ab(a,t)}tb(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)nb(t),t=t.sibling}function nb(t){switch(t.tag){case 0:case 11:case 15:bu(t),t.flags&2048&&ei(9,t,t.return);break;case 3:bu(t);break;case 12:bu(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,Wd(t)):bu(t);break;default:bu(t)}}function Wd(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];wt=a,ab(a,t)}tb(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:ei(8,e,e.return),Wd(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,Wd(e));break;default:Wd(e)}t=t.sibling}}function ab(t,e){for(;wt!==null;){var n=wt;switch(n.tag){case 0:case 11:case 15:ei(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:pl(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,wt=a;else e:for(n=t;wt!==null;){a=wt;var r=a.sibling,i=a.return;if(KA(a),a===n){wt=null;break e}if(r!==null){r.return=i,wt=r;break e}wt=i}}}var SO={getCacheForType:function(t){var e=Nt(lt),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return Nt(lt).controller.signal}},vO=typeof WeakMap=="function"?WeakMap:Map,ve=0,De=null,de=null,fe=0,Ae=0,hn=null,Br=!1,oo=!1,r_=!1,Za=0,$e=0,ti=0,xi=0,i_=0,gn=0,Js=0,ju=null,an=null,ry=!1,Vf=0,rb=0,mf=1/0,gf=null,Kr=null,yt=0,Yr=null,Zs=null,Ya=0,iy=0,sy=null,ib=null,Wu=0,oy=null;function Tn(){return ve&2&&fe!==0?fe&-fe:ee.T!==null?o_():pC()}function sb(){if(gn===0)if(!(fe&536870912)||he){var t=Td;Td<<=1,!(Td&3932160)&&(Td=262144),gn=t}else gn=536870912;return t=vn.current,t!==null&&(t.flags|=32),gn}function rn(t,e,n){(t===De&&(Ae===2||Ae===9)||t.cancelPendingCommit!==null)&&(eo(t,0),qr(t,fe,gn,!1)),dl(t,n),(!(ve&2)||t!==De)&&(t===De&&(!(ve&2)&&(xi|=n),$e===4&&qr(t,fe,gn,!1)),fa(t))}function ob(t,e,n){if(ve&6)throw Error(M(327));var a=!n&&(e&127)===0&&(e&t.expiredLanes)===0||cl(t,e),r=a?CO(t,e):yg(t,e,!0),i=a;do{if(r===0){oo&&!a&&qr(t,e,0,!1);break}else{if(n=t.current.alternate,i&&!EO(n)){r=yg(t,e,!1),i=!1;continue}if(r===2){if(i=e,t.errorRecoveryDisabledLanes&i)var s=0;else s=t.pendingLanes&-536870913,s=s!==0?s:s&536870912?536870912:0;if(s!==0){e=s;e:{var u=t;r=ju;var l=u.current.memoizedState.isDehydrated;if(l&&(eo(u,s).flags|=256),s=yg(u,s,!1),s!==2){if(r_&&!l){u.errorRecoveryDisabledLanes|=i,xi|=i,r=4;break e}i=an,an=r,i!==null&&(an===null?an=i:an.push.apply(an,i))}r=s}if(i=!1,r!==2)continue}}if(r===1){eo(t,0),qr(t,e,0,!0);break}e:{switch(a=t,i=r,i){case 0:case 1:throw Error(M(345));case 4:if((e&4194048)!==e)break;case 6:qr(a,e,gn,!Br);break e;case 2:an=null;break;case 3:case 5:break;default:throw Error(M(329))}if((e&62914560)===e&&(r=Vf+300-yn(),10<r)){if(qr(a,e,gn,!Br),bf(a,0,!0)!==0)break e;Ya=e,a.timeoutHandle=bb(Cw.bind(null,a,n,an,gf,ry,e,gn,xi,Js,Br,i,"Throttled",-0,0),r);break e}Cw(a,n,an,gf,ry,e,gn,xi,Js,Br,i,null,-0,0)}}break}while(!0);fa(t)}function Cw(t,e,n,a,r,i,s,u,l,c,f,m,p,I){if(t.timeoutHandle=-1,m=e.subtreeFlags,m&8192||(m&16785408)===16785408){m={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Ga},eb(e,i,m);var b=(i&62914560)===i?Vf-yn():(i&4194048)===i?rb-yn():0;if(b=iN(m,b),b!==null){Ya=i,t.cancelPendingCommit=b(bw.bind(null,t,e,i,n,a,r,s,u,l,f,m,null,p,I)),qr(t,i,s,!c);return}}bw(t,e,i,n,a,r,s,u,l)}function EO(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var r=n[a],i=r.getSnapshot;r=r.value;try{if(!Sn(i(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function qr(t,e,n,a){e&=~i_,e&=~xi,t.suspendedLanes|=e,t.pingedLanes&=~e,a&&(t.warmLanes|=e),a=t.expirationTimes;for(var r=e;0<r;){var i=31-In(r),s=1<<i;a[i]=-1,r&=~s}n!==0&&dC(t,n,e)}function Ff(){return ve&6?!0:(yl(0,!1),!1)}function s_(){if(de!==null){if(Ae===0)var t=de.return;else t=de,ja=Bi=null,jy(t),Hs=null,el=0,t=de;for(;t!==null;)BA(t.alternate,t),t=t.return;de=null}}function eo(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,qO(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),Ya=0,s_(),De=t,de=n=Wa(t.current,null),fe=e,Ae=0,hn=null,Br=!1,oo=cl(t,e),r_=!1,Js=gn=i_=xi=ti=$e=0,an=ju=null,ry=!1,e&8&&(e|=e&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=e;0<a;){var r=31-In(a),i=1<<r;e|=t[r],a&=~i}return Za=e,kf(),n}function ub(t,e){re=null,ee.H=nl,e===so||e===Pf?(e=aw(),Ae=3):e===Vy?(e=aw(),Ae=4):Ae=e===e_?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,hn=e,de===null&&($e=1,ff(t,Nn(e,t.current)))}function lb(){var t=vn.current;return t===null?!0:(fe&4194048)===fe?Un===null:(fe&62914560)===fe||fe&536870912?t===Un:!1}function cb(){var t=ee.H;return ee.H=nl,t===null?nl:t}function db(){var t=ee.A;return ee.A=SO,t}function yf(){$e=4,Br||(fe&4194048)!==fe&&vn.current!==null||(oo=!0),!(ti&134217727)&&!(xi&134217727)||De===null||qr(De,fe,gn,!1)}function yg(t,e,n){var a=ve;ve|=2;var r=cb(),i=db();(De!==t||fe!==e)&&(gf=null,eo(t,e)),e=!1;var s=$e;e:do try{if(Ae!==0&&de!==null){var u=de,l=hn;switch(Ae){case 8:s_(),s=6;break e;case 3:case 2:case 9:case 6:vn.current===null&&(e=!0);var c=Ae;if(Ae=0,hn=null,Vs(t,u,l,c),n&&oo){s=0;break e}break;default:c=Ae,Ae=0,hn=null,Vs(t,u,l,c)}}wO(),s=$e;break}catch(f){ub(t,f)}while(!0);return e&&t.shellSuspendCounter++,ja=Bi=null,ve=a,ee.H=r,ee.A=i,de===null&&(De=null,fe=0,kf()),s}function wO(){for(;de!==null;)fb(de)}function CO(t,e){var n=ve;ve|=2;var a=cb(),r=db();De!==t||fe!==e?(gf=null,mf=yn()+500,eo(t,e)):oo=cl(t,e);e:do try{if(Ae!==0&&de!==null){e=de;var i=hn;t:switch(Ae){case 1:Ae=0,hn=null,Vs(t,e,i,1);break;case 2:case 9:if(nw(i)){Ae=0,hn=null,Aw(e);break}e=function(){Ae!==2&&Ae!==9||De!==t||(Ae=7),fa(t)},i.then(e,e);break e;case 3:Ae=7;break e;case 4:Ae=5;break e;case 7:nw(i)?(Ae=0,hn=null,Aw(e)):(Ae=0,hn=null,Vs(t,e,i,7));break;case 5:var s=null;switch(de.tag){case 26:s=de.memoizedState;case 5:case 27:var u=de;if(s?Db(s):u.stateNode.complete){Ae=0,hn=null;var l=u.sibling;if(l!==null)de=l;else{var c=u.return;c!==null?(de=c,Bf(c)):de=null}break t}}Ae=0,hn=null,Vs(t,e,i,5);break;case 6:Ae=0,hn=null,Vs(t,e,i,6);break;case 8:s_(),$e=6;break e;default:throw Error(M(462))}}AO();break}catch(f){ub(t,f)}while(!0);return ja=Bi=null,ee.H=a,ee.A=r,ve=n,de!==null?0:(De=null,fe=0,kf(),$e)}function AO(){for(;de!==null&&!QP();)fb(de)}function fb(t){var e=FA(t.alternate,t,Za);t.memoizedProps=t.pendingProps,e===null?Bf(t):de=e}function Aw(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=Iw(n,e,e.pendingProps,e.type,void 0,fe);break;case 11:e=Iw(n,e,e.pendingProps,e.type.render,e.ref,fe);break;case 5:jy(e);default:BA(n,e),e=de=BC(e,Za),e=FA(n,e,Za)}t.memoizedProps=t.pendingProps,e===null?Bf(t):de=e}function Vs(t,e,n,a){ja=Bi=null,jy(e),Hs=null,el=0;var r=e.return;try{if(pO(t,r,e,n,fe)){$e=1,ff(t,Nn(n,t.current)),de=null;return}}catch(i){if(r!==null)throw de=r,i;$e=1,ff(t,Nn(n,t.current)),de=null;return}e.flags&32768?(he||a===1?t=!0:oo||fe&536870912?t=!1:(Br=t=!0,(a===2||a===9||a===3||a===6)&&(a=vn.current,a!==null&&a.tag===13&&(a.flags|=16384))),hb(e,t)):Bf(e)}function Bf(t){var e=t;do{if(e.flags&32768){hb(e,Br);return}t=e.return;var n=yO(e.alternate,e,Za);if(n!==null){de=n;return}if(e=e.sibling,e!==null){de=e;return}de=e=t}while(e!==null);$e===0&&($e=5)}function hb(t,e){do{var n=_O(t.alternate,t);if(n!==null){n.flags&=32767,de=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){de=t;return}de=t=n}while(t!==null);$e=6,de=null}function bw(t,e,n,a,r,i,s,u,l){t.cancelPendingCommit=null;do qf();while(yt!==0);if(ve&6)throw Error(M(327));if(e!==null){if(e===t.current)throw Error(M(177));if(i=e.lanes|e.childLanes,i|=ky,i1(t,n,i,s,u,l),t===De&&(de=De=null,fe=0),Zs=e,Yr=t,Ya=n,iy=i,sy=r,ib=a,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,xO(ef,function(){return _b(),null})):(t.callbackNode=null,t.callbackPriority=0),a=(e.flags&13878)!==0,e.subtreeFlags&13878||a){a=ee.T,ee.T=null,r=Ee.p,Ee.p=2,s=ve,ve|=4;try{IO(t,e,n)}finally{ve=s,Ee.p=r,ee.T=a}}yt=1,pb(),mb(),gb()}}function pb(){if(yt===1){yt=0;var t=Yr,e=Zs,n=(e.flags&13878)!==0;if(e.subtreeFlags&13878||n){n=ee.T,ee.T=null;var a=Ee.p;Ee.p=2;var r=ve;ve|=4;try{$A(e,t);var i=dy,s=DC(t.containerInfo),u=i.focusedElem,l=i.selectionRange;if(s!==u&&u&&u.ownerDocument&&kC(u.ownerDocument.documentElement,u)){if(l!==null&&xy(u)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in u)u.selectionStart=c,u.selectionEnd=Math.min(f,u.value.length);else{var m=u.ownerDocument||document,p=m&&m.defaultView||window;if(p.getSelection){var I=p.getSelection(),b=u.textContent.length,x=Math.min(l.start,b),D=l.end===void 0?x:Math.min(l.end,b);!I.extend&&x>D&&(s=D,D=x,x=s);var v=QE(u,x),S=QE(u,D);if(v&&S&&(I.rangeCount!==1||I.anchorNode!==v.node||I.anchorOffset!==v.offset||I.focusNode!==S.node||I.focusOffset!==S.offset)){var A=m.createRange();A.setStart(v.node,v.offset),I.removeAllRanges(),x>D?(I.addRange(A),I.extend(S.node,S.offset)):(A.setEnd(S.node,S.offset),I.addRange(A))}}}}for(m=[],I=u;I=I.parentNode;)I.nodeType===1&&m.push({element:I,left:I.scrollLeft,top:I.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<m.length;u++){var R=m[u];R.element.scrollLeft=R.left,R.element.scrollTop=R.top}}Cf=!!cy,dy=cy=null}finally{ve=r,Ee.p=a,ee.T=n}}t.current=e,yt=2}}function mb(){if(yt===2){yt=0;var t=Yr,e=Zs,n=(e.flags&8772)!==0;if(e.subtreeFlags&8772||n){n=ee.T,ee.T=null;var a=Ee.p;Ee.p=2;var r=ve;ve|=4;try{WA(t,e.alternate,e)}finally{ve=r,Ee.p=a,ee.T=n}}yt=3}}function gb(){if(yt===4||yt===3){yt=0,XP();var t=Yr,e=Zs,n=Ya,a=ib;e.subtreeFlags&10256||e.flags&10256?yt=5:(yt=0,Zs=Yr=null,yb(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(Kr=null),Ey(n),e=e.stateNode,_n&&typeof _n.onCommitFiberRoot=="function")try{_n.onCommitFiberRoot(ll,e,void 0,(e.current.flags&128)===128)}catch{}if(a!==null){e=ee.T,r=Ee.p,Ee.p=2,ee.T=null;try{for(var i=t.onRecoverableError,s=0;s<a.length;s++){var u=a[s];i(u.value,{componentStack:u.stack})}}finally{ee.T=e,Ee.p=r}}Ya&3&&qf(),fa(t),r=t.pendingLanes,n&261930&&r&42?t===oy?Wu++:(Wu=0,oy=t):Wu=0,yl(0,!1)}}function yb(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,pl(e)))}function qf(){return pb(),mb(),gb(),_b()}function _b(){if(yt!==5)return!1;var t=Yr,e=iy;iy=0;var n=Ey(Ya),a=ee.T,r=Ee.p;try{Ee.p=32>n?32:n,ee.T=null,n=sy,sy=null;var i=Yr,s=Ya;if(yt=0,Zs=Yr=null,Ya=0,ve&6)throw Error(M(331));var u=ve;if(ve|=4,nb(i.current),ZA(i,i.current,s,n),ve=u,yl(0,!1),_n&&typeof _n.onPostCommitFiberRoot=="function")try{_n.onPostCommitFiberRoot(ll,i)}catch{}return!0}finally{Ee.p=r,ee.T=a,yb(t,e)}}function Lw(t,e,n){e=Nn(n,e),e=ey(t.stateNode,e,2),t=Wr(t,e,2),t!==null&&(dl(t,2),fa(t))}function be(t,e,n){if(t.tag===3)Lw(t,t,n);else for(;e!==null;){if(e.tag===3){Lw(e,t,n);break}else if(e.tag===1){var a=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(Kr===null||!Kr.has(a))){t=Nn(n,t),n=PA(2),a=Wr(e,n,2),a!==null&&(OA(n,a,e,t),dl(a,2),fa(a));break}}e=e.return}}function _g(t,e,n){var a=t.pingCache;if(a===null){a=t.pingCache=new vO;var r=new Set;a.set(e,r)}else r=a.get(e),r===void 0&&(r=new Set,a.set(e,r));r.has(n)||(r_=!0,r.add(n),t=bO.bind(null,t,e,n),e.then(t,t))}function bO(t,e,n){var a=t.pingCache;a!==null&&a.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,De===t&&(fe&n)===n&&($e===4||$e===3&&(fe&62914560)===fe&&300>yn()-Vf?!(ve&2)&&eo(t,0):i_|=n,Js===fe&&(Js=0)),fa(t)}function Ib(t,e){e===0&&(e=cC()),t=Fi(t,e),t!==null&&(dl(t,e),fa(t))}function LO(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),Ib(t,n)}function RO(t,e){var n=0;switch(t.tag){case 31:case 13:var a=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:a=t.stateNode;break;case 22:a=t.stateNode._retryCache;break;default:throw Error(M(314))}a!==null&&a.delete(e),Ib(t,n)}function xO(t,e){return Sy(t,e)}var _f=null,As=null,uy=!1,If=!1,Ig=!1,zr=0;function fa(t){t!==As&&t.next===null&&(As===null?_f=As=t:As=As.next=t),If=!0,uy||(uy=!0,DO())}function yl(t,e){if(!Ig&&If){Ig=!0;do for(var n=!1,a=_f;a!==null;){if(!e)if(t!==0){var r=a.pendingLanes;if(r===0)var i=0;else{var s=a.suspendedLanes,u=a.pingedLanes;i=(1<<31-In(42|t)+1)-1,i&=r&~(s&~u),i=i&201326741?i&201326741|1:i?i|2:0}i!==0&&(n=!0,Rw(a,i))}else i=fe,i=bf(a,a===De?i:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(i&3)||cl(a,i)||(n=!0,Rw(a,i));a=a.next}while(n);Ig=!1}}function kO(){Tb()}function Tb(){If=uy=!1;var t=0;zr!==0&&BO()&&(t=zr);for(var e=yn(),n=null,a=_f;a!==null;){var r=a.next,i=Sb(a,e);i===0?(a.next=null,n===null?_f=r:n.next=r,r===null&&(As=n)):(n=a,(t!==0||i&3)&&(If=!0)),a=r}yt!==0&&yt!==5||yl(t,!1),zr!==0&&(zr=0)}function Sb(t,e){for(var n=t.suspendedLanes,a=t.pingedLanes,r=t.expirationTimes,i=t.pendingLanes&-62914561;0<i;){var s=31-In(i),u=1<<s,l=r[s];l===-1?(!(u&n)||u&a)&&(r[s]=r1(u,e)):l<=e&&(t.expiredLanes|=u),i&=~u}if(e=De,n=fe,n=bf(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a=t.callbackNode,n===0||t===e&&(Ae===2||Ae===9)||t.cancelPendingCommit!==null)return a!==null&&a!==null&&Ym(a),t.callbackNode=null,t.callbackPriority=0;if(!(n&3)||cl(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(a!==null&&Ym(a),Ey(n)){case 2:case 8:n=uC;break;case 32:n=ef;break;case 268435456:n=lC;break;default:n=ef}return a=vb.bind(null,t),n=Sy(n,a),t.callbackPriority=e,t.callbackNode=n,e}return a!==null&&a!==null&&Ym(a),t.callbackPriority=2,t.callbackNode=null,2}function vb(t,e){if(yt!==0&&yt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(qf()&&t.callbackNode!==n)return null;var a=fe;return a=bf(t,t===De?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a===0?null:(ob(t,a,e),Sb(t,yn()),t.callbackNode!=null&&t.callbackNode===n?vb.bind(null,t):null)}function Rw(t,e){if(qf())return null;ob(t,e,!0)}function DO(){zO(function(){ve&6?Sy(oC,kO):Tb()})}function o_(){if(zr===0){var t=Qs;t===0&&(t=Id,Id<<=1,!(Id&261888)&&(Id=256)),zr=t}return zr}function xw(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Ud(""+t)}function kw(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function PO(t,e,n,a,r){if(e==="submit"&&n&&n.stateNode===r){var i=xw((r[sn]||null).action),s=a.submitter;s&&(e=(e=s[sn]||null)?xw(e.formAction):s.getAttribute("formAction"),e!==null&&(i=e,s=null));var u=new Lf("action","action",null,a,r);t.push({event:u,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(zr!==0){var l=s?kw(r,s):new FormData(r);Jg(n,{pending:!0,data:l,method:r.method,action:i},null,l)}}else typeof i=="function"&&(u.preventDefault(),l=s?kw(r,s):new FormData(r),Jg(n,{pending:!0,data:l,method:r.method,action:i},i,l))},currentTarget:r}]})}}for(kd=0;kd<Bg.length;kd++)Dd=Bg[kd],Dw=Dd.toLowerCase(),Pw=Dd[0].toUpperCase()+Dd.slice(1),Qn(Dw,"on"+Pw);var Dd,Dw,Pw,kd;Qn(OC,"onAnimationEnd");Qn(NC,"onAnimationIteration");Qn(MC,"onAnimationStart");Qn("dblclick","onDoubleClick");Qn("focusin","onFocus");Qn("focusout","onBlur");Qn($1,"onTransitionRun");Qn(J1,"onTransitionStart");Qn(Z1,"onTransitionCancel");Qn(UC,"onTransitionEnd");Ks("onMouseEnter",["mouseout","mouseover"]);Ks("onMouseLeave",["mouseout","mouseover"]);Ks("onPointerEnter",["pointerout","pointerover"]);Ks("onPointerLeave",["pointerout","pointerover"]);Mi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Mi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Mi("onBeforeInput",["compositionend","keypress","textInput","paste"]);Mi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Mi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Mi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var al="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),OO=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(al));function Eb(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var a=t[n],r=a.event;a=a.listeners;e:{var i=void 0;if(e)for(var s=a.length-1;0<=s;s--){var u=a[s],l=u.instance,c=u.currentTarget;if(u=u.listener,l!==i&&r.isPropagationStopped())break e;i=u,r.currentTarget=c;try{i(r)}catch(f){nf(f)}r.currentTarget=null,i=l}else for(s=0;s<a.length;s++){if(u=a[s],l=u.instance,c=u.currentTarget,u=u.listener,l!==i&&r.isPropagationStopped())break e;i=u,r.currentTarget=c;try{i(r)}catch(f){nf(f)}r.currentTarget=null,i=l}}}}function ce(t,e){var n=e[Dg];n===void 0&&(n=e[Dg]=new Set);var a=t+"__bubble";n.has(a)||(wb(e,t,2,!1),n.add(a))}function Tg(t,e,n){var a=0;e&&(a|=4),wb(n,t,a,e)}var Pd="_reactListening"+Math.random().toString(36).slice(2);function u_(t){if(!t[Pd]){t[Pd]=!0,mC.forEach(function(n){n!=="selectionchange"&&(OO.has(n)||Tg(n,!1,t),Tg(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Pd]||(e[Pd]=!0,Tg("selectionchange",!1,e))}}function wb(t,e,n,a){switch(Ub(e)){case 2:var r=uN;break;case 8:r=lN;break;default:r=f_}n=r.bind(null,e,n,t),r=void 0,!Ug||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),a?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function Sg(t,e,n,a,r){var i=a;if(!(e&1)&&!(e&2)&&a!==null)e:for(;;){if(a===null)return;var s=a.tag;if(s===3||s===4){var u=a.stateNode.containerInfo;if(u===r)break;if(s===4)for(s=a.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===r)return;s=s.return}for(;u!==null;){if(s=Rs(u),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){a=i=s;continue e}u=u.parentNode}}a=a.return}EC(function(){var c=i,f=Ay(n),m=[];e:{var p=VC.get(t);if(p!==void 0){var I=Lf,b=t;switch(t){case"keypress":if(Fd(n)===0)break e;case"keydown":case"keyup":I=R1;break;case"focusin":b="focus",I=Zm;break;case"focusout":b="blur",I=Zm;break;case"beforeblur":case"afterblur":I=Zm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":I=BE;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":I=y1;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":I=D1;break;case OC:case NC:case MC:I=T1;break;case UC:I=O1;break;case"scroll":case"scrollend":I=m1;break;case"wheel":I=M1;break;case"copy":case"cut":case"paste":I=v1;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":I=zE;break;case"toggle":case"beforetoggle":I=V1}var x=(e&4)!==0,D=!x&&(t==="scroll"||t==="scrollend"),v=x?p!==null?p+"Capture":null:p;x=[];for(var S=c,A;S!==null;){var R=S;if(A=R.stateNode,R=R.tag,R!==5&&R!==26&&R!==27||A===null||v===null||(R=Qu(S,v),R!=null&&x.push(rl(S,R,A))),D)break;S=S.return}0<x.length&&(p=new I(p,b,null,n,f),m.push({event:p,listeners:x}))}}if(!(e&7)){e:{if(p=t==="mouseover"||t==="pointerover",I=t==="mouseout"||t==="pointerout",p&&n!==Mg&&(b=n.relatedTarget||n.fromElement)&&(Rs(b)||b[ao]))break e;if((I||p)&&(p=f.window===f?f:(p=f.ownerDocument)?p.defaultView||p.parentWindow:window,I?(b=n.relatedTarget||n.toElement,I=c,b=b?Rs(b):null,b!==null&&(D=ul(b),x=b.tag,b!==D||x!==5&&x!==27&&x!==6)&&(b=null)):(I=null,b=c),I!==b)){if(x=BE,R="onMouseLeave",v="onMouseEnter",S="mouse",(t==="pointerout"||t==="pointerover")&&(x=zE,R="onPointerLeave",v="onPointerEnter",S="pointer"),D=I==null?p:Du(I),A=b==null?p:Du(b),p=new x(R,S+"leave",I,n,f),p.target=D,p.relatedTarget=A,R=null,Rs(f)===c&&(x=new x(v,S+"enter",b,n,f),x.target=A,x.relatedTarget=D,R=x),D=R,I&&b)t:{for(x=NO,v=I,S=b,A=0,R=v;R;R=x(R))A++;R=0;for(var q=S;q;q=x(q))R++;for(;0<A-R;)v=x(v),A--;for(;0<R-A;)S=x(S),R--;for(;A--;){if(v===S||S!==null&&v===S.alternate){x=v;break t}v=x(v),S=x(S)}x=null}else x=null;I!==null&&Ow(m,p,I,x,!1),b!==null&&D!==null&&Ow(m,D,b,x,!0)}}e:{if(p=c?Du(c):window,I=p.nodeName&&p.nodeName.toLowerCase(),I==="select"||I==="input"&&p.type==="file")var V=WE;else if(jE(p))if(RC)V=Y1;else{V=W1;var T=j1}else I=p.nodeName,!I||I.toLowerCase()!=="input"||p.type!=="checkbox"&&p.type!=="radio"?c&&Cy(c.elementType)&&(V=WE):V=K1;if(V&&(V=V(t,c))){LC(m,V,n,f);break e}T&&T(t,p,c),t==="focusout"&&c&&p.type==="number"&&c.memoizedProps.value!=null&&Ng(p,"number",p.value)}switch(T=c?Du(c):window,t){case"focusin":(jE(T)||T.contentEditable==="true")&&(Ds=T,Vg=c,Uu=null);break;case"focusout":Uu=Vg=Ds=null;break;case"mousedown":Fg=!0;break;case"contextmenu":case"mouseup":case"dragend":Fg=!1,XE(m,n,f);break;case"selectionchange":if(X1)break;case"keydown":case"keyup":XE(m,n,f)}var g;if(Ry)e:{switch(t){case"compositionstart":var _="onCompositionStart";break e;case"compositionend":_="onCompositionEnd";break e;case"compositionupdate":_="onCompositionUpdate";break e}_=void 0}else ks?AC(t,n)&&(_="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(_="onCompositionStart");_&&(CC&&n.locale!=="ko"&&(ks||_!=="onCompositionStart"?_==="onCompositionEnd"&&ks&&(g=wC()):(Fr=f,by="value"in Fr?Fr.value:Fr.textContent,ks=!0)),T=Tf(c,_),0<T.length&&(_=new qE(_,t,null,n,f),m.push({event:_,listeners:T}),g?_.data=g:(g=bC(n),g!==null&&(_.data=g)))),(g=B1?q1(t,n):z1(t,n))&&(_=Tf(c,"onBeforeInput"),0<_.length&&(T=new qE("onBeforeInput","beforeinput",null,n,f),m.push({event:T,listeners:_}),T.data=g)),PO(m,t,c,n,f)}Eb(m,e)})}function rl(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Tf(t,e){for(var n=e+"Capture",a=[];t!==null;){var r=t,i=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||i===null||(r=Qu(t,n),r!=null&&a.unshift(rl(t,r,i)),r=Qu(t,e),r!=null&&a.push(rl(t,r,i))),t.tag===3)return a;t=t.return}return[]}function NO(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function Ow(t,e,n,a,r){for(var i=e._reactName,s=[];n!==null&&n!==a;){var u=n,l=u.alternate,c=u.stateNode;if(u=u.tag,l!==null&&l===a)break;u!==5&&u!==26&&u!==27||c===null||(l=c,r?(c=Qu(n,i),c!=null&&s.unshift(rl(n,c,l))):r||(c=Qu(n,i),c!=null&&s.push(rl(n,c,l)))),n=n.return}s.length!==0&&t.push({event:e,listeners:s})}var MO=/\r\n?/g,UO=/\u0000|\uFFFD/g;function Nw(t){return(typeof t=="string"?t:""+t).replace(MO,`
`).replace(UO,"")}function Cb(t,e){return e=Nw(e),Nw(t)===e}function Le(t,e,n,a,r,i){switch(n){case"children":typeof a=="string"?e==="body"||e==="textarea"&&a===""||Ys(t,a):(typeof a=="number"||typeof a=="bigint")&&e!=="body"&&Ys(t,""+a);break;case"className":vd(t,"class",a);break;case"tabIndex":vd(t,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":vd(t,n,a);break;case"style":vC(t,a,i);break;case"data":if(e!=="object"){vd(t,"data",a);break}case"src":case"href":if(a===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Ud(""+a),t.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof i=="function"&&(n==="formAction"?(e!=="input"&&Le(t,e,"name",r.name,r,null),Le(t,e,"formEncType",r.formEncType,r,null),Le(t,e,"formMethod",r.formMethod,r,null),Le(t,e,"formTarget",r.formTarget,r,null)):(Le(t,e,"encType",r.encType,r,null),Le(t,e,"method",r.method,r,null),Le(t,e,"target",r.target,r,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Ud(""+a),t.setAttribute(n,a);break;case"onClick":a!=null&&(t.onclick=Ga);break;case"onScroll":a!=null&&ce("scroll",t);break;case"onScrollEnd":a!=null&&ce("scrollend",t);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(M(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(M(60));t.innerHTML=n}}break;case"multiple":t.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":t.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){t.removeAttribute("xlink:href");break}n=Ud(""+a),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""+a):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":a===!0?t.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,a):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?t.setAttribute(n,a):t.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?t.removeAttribute(n):t.setAttribute(n,a);break;case"popover":ce("beforetoggle",t),ce("toggle",t),Md(t,"popover",a);break;case"xlinkActuate":Ma(t,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":Ma(t,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":Ma(t,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":Ma(t,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":Ma(t,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":Ma(t,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":Ma(t,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":Ma(t,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":Ma(t,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":Md(t,"is",a);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=h1.get(n)||n,Md(t,n,a))}}function ly(t,e,n,a,r,i){switch(n){case"style":vC(t,a,i);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(M(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(M(60));t.innerHTML=n}}break;case"children":typeof a=="string"?Ys(t,a):(typeof a=="number"||typeof a=="bigint")&&Ys(t,""+a);break;case"onScroll":a!=null&&ce("scroll",t);break;case"onScrollEnd":a!=null&&ce("scrollend",t);break;case"onClick":a!=null&&(t.onclick=Ga);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!gC.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),i=t[sn]||null,i=i!=null?i[n]:null,typeof i=="function"&&t.removeEventListener(e,i,r),typeof a=="function")){typeof i!="function"&&i!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,a,r);break e}n in t?t[n]=a:a===!0?t.setAttribute(n,""):Md(t,n,a)}}}function Mt(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ce("error",t),ce("load",t);var a=!1,r=!1,i;for(i in n)if(n.hasOwnProperty(i)){var s=n[i];if(s!=null)switch(i){case"src":a=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(M(137,e));default:Le(t,e,i,s,n,null)}}r&&Le(t,e,"srcSet",n.srcSet,n,null),a&&Le(t,e,"src",n.src,n,null);return;case"input":ce("invalid",t);var u=i=s=r=null,l=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":r=f;break;case"type":s=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":i=f;break;case"defaultValue":u=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(M(137,e));break;default:Le(t,e,a,f,n,null)}}IC(t,i,u,l,c,s,r,!1);return;case"select":ce("invalid",t),a=s=i=null;for(r in n)if(n.hasOwnProperty(r)&&(u=n[r],u!=null))switch(r){case"value":i=u;break;case"defaultValue":s=u;break;case"multiple":a=u;default:Le(t,e,r,u,n,null)}e=i,n=s,t.multiple=!!a,e!=null?Bs(t,!!a,e,!1):n!=null&&Bs(t,!!a,n,!0);return;case"textarea":ce("invalid",t),i=r=a=null;for(s in n)if(n.hasOwnProperty(s)&&(u=n[s],u!=null))switch(s){case"value":a=u;break;case"defaultValue":r=u;break;case"children":i=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(M(91));break;default:Le(t,e,s,u,n,null)}SC(t,a,r,i);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(a=n[l],a!=null))switch(l){case"selected":t.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:Le(t,e,l,a,n,null)}return;case"dialog":ce("beforetoggle",t),ce("toggle",t),ce("cancel",t),ce("close",t);break;case"iframe":case"object":ce("load",t);break;case"video":case"audio":for(a=0;a<al.length;a++)ce(al[a],t);break;case"image":ce("error",t),ce("load",t);break;case"details":ce("toggle",t);break;case"embed":case"source":case"link":ce("error",t),ce("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(M(137,e));default:Le(t,e,c,a,n,null)}return;default:if(Cy(e)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&ly(t,e,f,a,n,void 0));return}}for(u in n)n.hasOwnProperty(u)&&(a=n[u],a!=null&&Le(t,e,u,a,n,null))}function VO(t,e,n,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,i=null,s=null,u=null,l=null,c=null,f=null;for(I in n){var m=n[I];if(n.hasOwnProperty(I)&&m!=null)switch(I){case"checked":break;case"value":break;case"defaultValue":l=m;default:a.hasOwnProperty(I)||Le(t,e,I,null,a,m)}}for(var p in a){var I=a[p];if(m=n[p],a.hasOwnProperty(p)&&(I!=null||m!=null))switch(p){case"type":i=I;break;case"name":r=I;break;case"checked":c=I;break;case"defaultChecked":f=I;break;case"value":s=I;break;case"defaultValue":u=I;break;case"children":case"dangerouslySetInnerHTML":if(I!=null)throw Error(M(137,e));break;default:I!==m&&Le(t,e,p,I,a,m)}}Og(t,s,u,l,c,f,i,r);return;case"select":I=s=u=p=null;for(i in n)if(l=n[i],n.hasOwnProperty(i)&&l!=null)switch(i){case"value":break;case"multiple":I=l;default:a.hasOwnProperty(i)||Le(t,e,i,null,a,l)}for(r in a)if(i=a[r],l=n[r],a.hasOwnProperty(r)&&(i!=null||l!=null))switch(r){case"value":p=i;break;case"defaultValue":u=i;break;case"multiple":s=i;default:i!==l&&Le(t,e,r,i,a,l)}e=u,n=s,a=I,p!=null?Bs(t,!!n,p,!1):!!a!=!!n&&(e!=null?Bs(t,!!n,e,!0):Bs(t,!!n,n?[]:"",!1));return;case"textarea":I=p=null;for(u in n)if(r=n[u],n.hasOwnProperty(u)&&r!=null&&!a.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Le(t,e,u,null,a,r)}for(s in a)if(r=a[s],i=n[s],a.hasOwnProperty(s)&&(r!=null||i!=null))switch(s){case"value":p=r;break;case"defaultValue":I=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(M(91));break;default:r!==i&&Le(t,e,s,r,a,i)}TC(t,p,I);return;case"option":for(var b in n)if(p=n[b],n.hasOwnProperty(b)&&p!=null&&!a.hasOwnProperty(b))switch(b){case"selected":t.selected=!1;break;default:Le(t,e,b,null,a,p)}for(l in a)if(p=a[l],I=n[l],a.hasOwnProperty(l)&&p!==I&&(p!=null||I!=null))switch(l){case"selected":t.selected=p&&typeof p!="function"&&typeof p!="symbol";break;default:Le(t,e,l,p,a,I)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var x in n)p=n[x],n.hasOwnProperty(x)&&p!=null&&!a.hasOwnProperty(x)&&Le(t,e,x,null,a,p);for(c in a)if(p=a[c],I=n[c],a.hasOwnProperty(c)&&p!==I&&(p!=null||I!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(M(137,e));break;default:Le(t,e,c,p,a,I)}return;default:if(Cy(e)){for(var D in n)p=n[D],n.hasOwnProperty(D)&&p!==void 0&&!a.hasOwnProperty(D)&&ly(t,e,D,void 0,a,p);for(f in a)p=a[f],I=n[f],!a.hasOwnProperty(f)||p===I||p===void 0&&I===void 0||ly(t,e,f,p,a,I);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!a.hasOwnProperty(v)&&Le(t,e,v,null,a,p);for(m in a)p=a[m],I=n[m],!a.hasOwnProperty(m)||p===I||p==null&&I==null||Le(t,e,m,p,a,I)}function Mw(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function FO(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var r=n[a],i=r.transferSize,s=r.initiatorType,u=r.duration;if(i&&u&&Mw(s)){for(s=0,u=r.responseEnd,a+=1;a<n.length;a++){var l=n[a],c=l.startTime;if(c>u)break;var f=l.transferSize,m=l.initiatorType;f&&Mw(m)&&(l=l.responseEnd,s+=f*(l<u?1:(u-c)/(l-c)))}if(--a,e+=8*(i+s)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var cy=null,dy=null;function Sf(t){return t.nodeType===9?t:t.ownerDocument}function Uw(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Ab(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function fy(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var vg=null;function BO(){var t=window.event;return t&&t.type==="popstate"?t===vg?!1:(vg=t,!0):(vg=null,!1)}var bb=typeof setTimeout=="function"?setTimeout:void 0,qO=typeof clearTimeout=="function"?clearTimeout:void 0,Vw=typeof Promise=="function"?Promise:void 0,zO=typeof queueMicrotask=="function"?queueMicrotask:typeof Vw<"u"?function(t){return Vw.resolve(null).then(t).catch(HO)}:bb;function HO(t){setTimeout(function(){throw t})}function ai(t){return t==="head"}function Fw(t,e){var n=e,a=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(a===0){t.removeChild(r),no(e);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")Ku(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,Ku(n);for(var i=n.firstChild;i;){var s=i.nextSibling,u=i.nodeName;i[fl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&i.rel.toLowerCase()==="stylesheet"||n.removeChild(i),i=s}}else n==="body"&&Ku(t.ownerDocument.body);n=r}while(n);no(e)}function Bw(t,e){var n=t;t=0;do{var a=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=a}while(n)}function hy(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":hy(n),wy(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function GO(t,e,n,a){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!a&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(a){if(!t[fl])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(i=t.getAttribute("rel"),i==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(i!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(i=t.getAttribute("src"),(i!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&i&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var i=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===i)return t}else return t;if(t=Vn(t.nextSibling),t===null)break}return null}function jO(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=Vn(t.nextSibling),t===null))return null;return t}function Lb(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=Vn(t.nextSibling),t===null))return null;return t}function py(t){return t.data==="$?"||t.data==="$~"}function my(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function WO(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var a=function(){e(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),t._reactRetry=a}}function Vn(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var gy=null;function qw(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return Vn(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function zw(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function Rb(t,e,n){switch(e=Sf(n),t){case"html":if(t=e.documentElement,!t)throw Error(M(452));return t;case"head":if(t=e.head,!t)throw Error(M(453));return t;case"body":if(t=e.body,!t)throw Error(M(454));return t;default:throw Error(M(451))}}function Ku(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);wy(t)}var Fn=new Map,Hw=new Set;function vf(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var er=Ee.d;Ee.d={f:KO,r:YO,D:QO,C:XO,L:$O,m:JO,X:eN,S:ZO,M:tN};function KO(){var t=er.f(),e=Ff();return t||e}function YO(t){var e=ro(t);e!==null&&e.tag===5&&e.type==="form"?vA(e):er.r(t)}var uo=typeof document>"u"?null:document;function xb(t,e,n){var a=uo;if(a&&typeof e=="string"&&e){var r=On(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),Hw.has(r)||(Hw.add(r),t={rel:t,crossOrigin:n,href:e},a.querySelector(r)===null&&(e=a.createElement("link"),Mt(e,"link",t),Ct(e),a.head.appendChild(e)))}}function QO(t){er.D(t),xb("dns-prefetch",t,null)}function XO(t,e){er.C(t,e),xb("preconnect",t,e)}function $O(t,e,n){er.L(t,e,n);var a=uo;if(a&&t&&e){var r='link[rel="preload"][as="'+On(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+On(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+On(n.imageSizes)+'"]')):r+='[href="'+On(t)+'"]';var i=r;switch(e){case"style":i=to(t);break;case"script":i=lo(t)}Fn.has(i)||(t=Fe({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),Fn.set(i,t),a.querySelector(r)!==null||e==="style"&&a.querySelector(_l(i))||e==="script"&&a.querySelector(Il(i))||(e=a.createElement("link"),Mt(e,"link",t),Ct(e),a.head.appendChild(e)))}}function JO(t,e){er.m(t,e);var n=uo;if(n&&t){var a=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+On(a)+'"][href="'+On(t)+'"]',i=r;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":i=lo(t)}if(!Fn.has(i)&&(t=Fe({rel:"modulepreload",href:t},e),Fn.set(i,t),n.querySelector(r)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Il(i)))return}a=n.createElement("link"),Mt(a,"link",t),Ct(a),n.head.appendChild(a)}}}function ZO(t,e,n){er.S(t,e,n);var a=uo;if(a&&t){var r=Fs(a).hoistableStyles,i=to(t);e=e||"default";var s=r.get(i);if(!s){var u={loading:0,preload:null};if(s=a.querySelector(_l(i)))u.loading=5;else{t=Fe({rel:"stylesheet",href:t,"data-precedence":e},n),(n=Fn.get(i))&&l_(t,n);var l=s=a.createElement("link");Ct(l),Mt(l,"link",t),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){u.loading|=1}),l.addEventListener("error",function(){u.loading|=2}),u.loading|=4,Kd(s,e,a)}s={type:"stylesheet",instance:s,count:1,state:u},r.set(i,s)}}}function eN(t,e){er.X(t,e);var n=uo;if(n&&t){var a=Fs(n).hoistableScripts,r=lo(t),i=a.get(r);i||(i=n.querySelector(Il(r)),i||(t=Fe({src:t,async:!0},e),(e=Fn.get(r))&&c_(t,e),i=n.createElement("script"),Ct(i),Mt(i,"link",t),n.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},a.set(r,i))}}function tN(t,e){er.M(t,e);var n=uo;if(n&&t){var a=Fs(n).hoistableScripts,r=lo(t),i=a.get(r);i||(i=n.querySelector(Il(r)),i||(t=Fe({src:t,async:!0,type:"module"},e),(e=Fn.get(r))&&c_(t,e),i=n.createElement("script"),Ct(i),Mt(i,"link",t),n.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},a.set(r,i))}}function Gw(t,e,n,a){var r=(r=Hr.current)?vf(r):null;if(!r)throw Error(M(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=to(n.href),n=Fs(r).hoistableStyles,a=n.get(e),a||(a={type:"style",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=to(n.href);var i=Fs(r).hoistableStyles,s=i.get(t);if(s||(r=r.ownerDocument||r,s={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},i.set(t,s),(i=r.querySelector(_l(t)))&&!i._p&&(s.instance=i,s.state.loading=5),Fn.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Fn.set(t,n),i||nN(r,t,n,s.state))),e&&a===null)throw Error(M(528,""));return s}if(e&&a!==null)throw Error(M(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=lo(n),n=Fs(r).hoistableScripts,a=n.get(e),a||(a={type:"script",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(M(444,t))}}function to(t){return'href="'+On(t)+'"'}function _l(t){return'link[rel="stylesheet"]['+t+"]"}function kb(t){return Fe({},t,{"data-precedence":t.precedence,precedence:null})}function nN(t,e,n,a){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?a.loading=1:(e=t.createElement("link"),a.preload=e,e.addEventListener("load",function(){return a.loading|=1}),e.addEventListener("error",function(){return a.loading|=2}),Mt(e,"link",n),Ct(e),t.head.appendChild(e))}function lo(t){return'[src="'+On(t)+'"]'}function Il(t){return"script[async]"+t}function jw(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var a=t.querySelector('style[data-href~="'+On(n.href)+'"]');if(a)return e.instance=a,Ct(a),a;var r=Fe({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(t.ownerDocument||t).createElement("style"),Ct(a),Mt(a,"style",r),Kd(a,n.precedence,t),e.instance=a;case"stylesheet":r=to(n.href);var i=t.querySelector(_l(r));if(i)return e.state.loading|=4,e.instance=i,Ct(i),i;a=kb(n),(r=Fn.get(r))&&l_(a,r),i=(t.ownerDocument||t).createElement("link"),Ct(i);var s=i;return s._p=new Promise(function(u,l){s.onload=u,s.onerror=l}),Mt(i,"link",a),e.state.loading|=4,Kd(i,n.precedence,t),e.instance=i;case"script":return i=lo(n.src),(r=t.querySelector(Il(i)))?(e.instance=r,Ct(r),r):(a=n,(r=Fn.get(i))&&(a=Fe({},n),c_(a,r)),t=t.ownerDocument||t,r=t.createElement("script"),Ct(r),Mt(r,"link",a),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(M(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(a=e.instance,e.state.loading|=4,Kd(a,n.precedence,t));return e.instance}function Kd(t,e,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=a.length?a[a.length-1]:null,i=r,s=0;s<a.length;s++){var u=a[s];if(u.dataset.precedence===e)i=u;else if(i!==r)break}i?i.parentNode.insertBefore(t,i.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function l_(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function c_(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var Yd=null;function Ww(t,e,n){if(Yd===null){var a=new Map,r=Yd=new Map;r.set(n,a)}else r=Yd,a=r.get(n),a||(a=new Map,r.set(n,a));if(a.has(t))return a;for(a.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var i=n[r];if(!(i[fl]||i[Pt]||t==="link"&&i.getAttribute("rel")==="stylesheet")&&i.namespaceURI!=="http://www.w3.org/2000/svg"){var s=i.getAttribute(e)||"";s=t+s;var u=a.get(s);u?u.push(i):a.set(s,[i])}}return a}function Kw(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function aN(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function Db(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function rN(t,e,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(n.state.loading&4)){if(n.instance===null){var r=to(a.href),i=e.querySelector(_l(r));if(i){e=i._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Ef.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=i,Ct(i);return}i=e.ownerDocument||e,a=kb(a),(r=Fn.get(r))&&l_(a,r),i=i.createElement("link"),Ct(i);var s=i;s._p=new Promise(function(u,l){s.onload=u,s.onerror=l}),Mt(i,"link",a),n.instance=i}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&!(n.state.loading&3)&&(t.count++,n=Ef.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var Eg=0;function iN(t,e){return t.stylesheets&&t.count===0&&Qd(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var a=setTimeout(function(){if(t.stylesheets&&Qd(t,t.stylesheets),t.unsuspend){var i=t.unsuspend;t.unsuspend=null,i()}},6e4+e);0<t.imgBytes&&Eg===0&&(Eg=62500*FO());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Qd(t,t.stylesheets),t.unsuspend)){var i=t.unsuspend;t.unsuspend=null,i()}},(t.imgBytes>Eg?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(a),clearTimeout(r)}}:null}function Ef(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Qd(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var wf=null;function Qd(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,wf=new Map,e.forEach(sN,t),wf=null,Ef.call(t))}function sN(t,e){if(!(e.state.loading&4)){var n=wf.get(t);if(n)var a=n.get(null);else{n=new Map,wf.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),i=0;i<r.length;i++){var s=r[i];(s.nodeName==="LINK"||s.getAttribute("media")!=="not all")&&(n.set(s.dataset.precedence,s),a=s)}a&&n.set(null,a)}r=e.instance,s=r.getAttribute("data-precedence"),i=n.get(s)||a,i===a&&n.set(null,r),n.set(s,r),this.count++,a=Ef.bind(this),r.addEventListener("load",a),r.addEventListener("error",a),i?i.parentNode.insertBefore(r,i.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var il={$$typeof:Ha,Provider:null,Consumer:null,_currentValue:Ai,_currentValue2:Ai,_threadCount:0};function oN(t,e,n,a,r,i,s,u,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Qm(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Qm(0),this.hiddenUpdates=Qm(null),this.identifierPrefix=a,this.onUncaughtError=r,this.onCaughtError=i,this.onRecoverableError=s,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function Pb(t,e,n,a,r,i,s,u,l,c,f,m){return t=new oN(t,e,n,s,l,c,f,m,u),e=1,i===!0&&(e|=24),i=mn(3,null,null,e),t.current=i,i.stateNode=t,e=My(),e.refCount++,t.pooledCache=e,e.refCount++,i.memoizedState={element:a,isDehydrated:n,cache:e},Fy(i),t}function Ob(t){return t?(t=Ns,t):Ns}function Nb(t,e,n,a,r,i){r=Ob(r),a.context===null?a.context=r:a.pendingContext=r,a=jr(e),a.payload={element:n},i=i===void 0?null:i,i!==null&&(a.callback=i),n=Wr(t,a,e),n!==null&&(rn(n,t,e),Fu(n,t,e))}function Yw(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function d_(t,e){Yw(t,e),(t=t.alternate)&&Yw(t,e)}function Mb(t){if(t.tag===13||t.tag===31){var e=Fi(t,67108864);e!==null&&rn(e,t,67108864),d_(t,67108864)}}function Qw(t){if(t.tag===13||t.tag===31){var e=Tn();e=vy(e);var n=Fi(t,e);n!==null&&rn(n,t,e),d_(t,e)}}var Cf=!0;function uN(t,e,n,a){var r=ee.T;ee.T=null;var i=Ee.p;try{Ee.p=2,f_(t,e,n,a)}finally{Ee.p=i,ee.T=r}}function lN(t,e,n,a){var r=ee.T;ee.T=null;var i=Ee.p;try{Ee.p=8,f_(t,e,n,a)}finally{Ee.p=i,ee.T=r}}function f_(t,e,n,a){if(Cf){var r=yy(a);if(r===null)Sg(t,e,a,Af,n),Xw(t,a);else if(dN(r,t,e,n,a))a.stopPropagation();else if(Xw(t,a),e&4&&-1<cN.indexOf(t)){for(;r!==null;){var i=ro(r);if(i!==null)switch(i.tag){case 3:if(i=i.stateNode,i.current.memoizedState.isDehydrated){var s=Ei(i.pendingLanes);if(s!==0){var u=i;for(u.pendingLanes|=2,u.entangledLanes|=2;s;){var l=1<<31-In(s);u.entanglements[1]|=l,s&=~l}fa(i),!(ve&6)&&(mf=yn()+500,yl(0,!1))}}break;case 31:case 13:u=Fi(i,2),u!==null&&rn(u,i,2),Ff(),d_(i,2)}if(i=yy(a),i===null&&Sg(t,e,a,Af,n),i===r)break;r=i}r!==null&&a.stopPropagation()}else Sg(t,e,a,null,n)}}function yy(t){return t=Ay(t),h_(t)}var Af=null;function h_(t){if(Af=null,t=Rs(t),t!==null){var e=ul(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=nC(e),t!==null)return t;t=null}else if(n===31){if(t=aC(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Af=t,null}function Ub(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch($P()){case oC:return 2;case uC:return 8;case ef:case JP:return 32;case lC:return 268435456;default:return 32}default:return 32}}var _y=!1,Qr=null,Xr=null,$r=null,sl=new Map,ol=new Map,Ur=[],cN="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Xw(t,e){switch(t){case"focusin":case"focusout":Qr=null;break;case"dragenter":case"dragleave":Xr=null;break;case"mouseover":case"mouseout":$r=null;break;case"pointerover":case"pointerout":sl.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":ol.delete(e.pointerId)}}function Lu(t,e,n,a,r,i){return t===null||t.nativeEvent!==i?(t={blockedOn:e,domEventName:n,eventSystemFlags:a,nativeEvent:i,targetContainers:[r]},e!==null&&(e=ro(e),e!==null&&Mb(e)),t):(t.eventSystemFlags|=a,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function dN(t,e,n,a,r){switch(e){case"focusin":return Qr=Lu(Qr,t,e,n,a,r),!0;case"dragenter":return Xr=Lu(Xr,t,e,n,a,r),!0;case"mouseover":return $r=Lu($r,t,e,n,a,r),!0;case"pointerover":var i=r.pointerId;return sl.set(i,Lu(sl.get(i)||null,t,e,n,a,r)),!0;case"gotpointercapture":return i=r.pointerId,ol.set(i,Lu(ol.get(i)||null,t,e,n,a,r)),!0}return!1}function Vb(t){var e=Rs(t.target);if(e!==null){var n=ul(e);if(n!==null){if(e=n.tag,e===13){if(e=nC(n),e!==null){t.blockedOn=e,PE(t.priority,function(){Qw(n)});return}}else if(e===31){if(e=aC(n),e!==null){t.blockedOn=e,PE(t.priority,function(){Qw(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Xd(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=yy(t.nativeEvent);if(n===null){n=t.nativeEvent;var a=new n.constructor(n.type,n);Mg=a,n.target.dispatchEvent(a),Mg=null}else return e=ro(n),e!==null&&Mb(e),t.blockedOn=n,!1;e.shift()}return!0}function $w(t,e,n){Xd(t)&&n.delete(e)}function fN(){_y=!1,Qr!==null&&Xd(Qr)&&(Qr=null),Xr!==null&&Xd(Xr)&&(Xr=null),$r!==null&&Xd($r)&&($r=null),sl.forEach($w),ol.forEach($w)}function Od(t,e){t.blockedOn===e&&(t.blockedOn=null,_y||(_y=!0,_t.unstable_scheduleCallback(_t.unstable_NormalPriority,fN)))}var Nd=null;function Jw(t){Nd!==t&&(Nd=t,_t.unstable_scheduleCallback(_t.unstable_NormalPriority,function(){Nd===t&&(Nd=null);for(var e=0;e<t.length;e+=3){var n=t[e],a=t[e+1],r=t[e+2];if(typeof a!="function"){if(h_(a||n)===null)continue;break}var i=ro(n);i!==null&&(t.splice(e,3),e-=3,Jg(i,{pending:!0,data:r,method:n.method,action:a},a,r))}}))}function no(t){function e(l){return Od(l,t)}Qr!==null&&Od(Qr,t),Xr!==null&&Od(Xr,t),$r!==null&&Od($r,t),sl.forEach(e),ol.forEach(e);for(var n=0;n<Ur.length;n++){var a=Ur[n];a.blockedOn===t&&(a.blockedOn=null)}for(;0<Ur.length&&(n=Ur[0],n.blockedOn===null);)Vb(n),n.blockedOn===null&&Ur.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var r=n[a],i=n[a+1],s=r[sn]||null;if(typeof i=="function")s||Jw(n);else if(s){var u=null;if(i&&i.hasAttribute("formAction")){if(r=i,s=i[sn]||null)u=s.formAction;else if(h_(r)!==null)continue}else u=s.action;typeof u=="function"?n[a+1]=u:(n.splice(a,3),a-=3),Jw(n)}}}function Fb(){function t(i){i.canIntercept&&i.info==="react-transition"&&i.intercept({handler:function(){return new Promise(function(s){return r=s})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var i=navigation.currentEntry;i&&i.url!=null&&navigation.navigate(i.url,{state:i.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function p_(t){this._internalRoot=t}zf.prototype.render=p_.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(M(409));var n=e.current,a=Tn();Nb(n,a,t,e,null,null)};zf.prototype.unmount=p_.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Nb(t.current,2,null,t,null,null),Ff(),e[ao]=null}};function zf(t){this._internalRoot=t}zf.prototype.unstable_scheduleHydration=function(t){if(t){var e=pC();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Ur.length&&e!==0&&e<Ur[n].priority;n++);Ur.splice(n,0,t),n===0&&Vb(t)}};var Zw=eC.version;if(Zw!=="19.2.3")throw Error(M(527,Zw,"19.2.3"));Ee.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(M(188)):(t=Object.keys(t).join(","),Error(M(268,t)));return t=GP(e),t=t!==null?rC(t):null,t=t===null?null:t.stateNode,t};var hN={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:ee,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ru=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ru.isDisabled&&Ru.supportsFiber))try{ll=Ru.inject(hN),_n=Ru}catch{}var Ru;Hf.createRoot=function(t,e){if(!tC(t))throw Error(M(299));var n=!1,a="",r=xA,i=kA,s=DA;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(a=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(i=e.onCaughtError),e.onRecoverableError!==void 0&&(s=e.onRecoverableError)),e=Pb(t,1,!1,null,null,n,a,null,r,i,s,Fb),t[ao]=e.current,u_(t),new p_(e)};Hf.hydrateRoot=function(t,e,n){if(!tC(t))throw Error(M(299));var a=!1,r="",i=xA,s=kA,u=DA,l=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(i=n.onUncaughtError),n.onCaughtError!==void 0&&(s=n.onCaughtError),n.onRecoverableError!==void 0&&(u=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),e=Pb(t,1,!0,e,n??null,a,r,l,i,s,u,Fb),e.context=Ob(null),n=e.current,a=Tn(),a=vy(a),r=jr(a),r.callback=null,Wr(n,r,a),n=a,e.current.lanes=n,dl(e,n),fa(e),t[ao]=e.current,u_(t),new zf(e)};Hf.version="19.2.3"});var Hb=Ie((J4,zb)=>{"use strict";function qb(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(qb)}catch(t){console.error(t)}}qb(),zb.exports=Bb()});var N0=Ie((h6,CS)=>{var wS=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,a=Object.defineProperty||function(N,O,U){N[O]=U.value},r,i=typeof Symbol=="function"?Symbol:{},s=i.iterator||"@@iterator",u=i.asyncIterator||"@@asyncIterator",l=i.toStringTag||"@@toStringTag";function c(N,O,U){return Object.defineProperty(N,O,{value:U,enumerable:!0,configurable:!0,writable:!0}),N[O]}try{c({},"")}catch{c=function(O,U,Y){return O[U]=Y}}function f(N,O,U,Y){var W=O&&O.prototype instanceof v?O:v,Z=Object.create(W.prototype),le=new Te(Y||[]);return a(Z,"_invoke",{value:E(N,U,le)}),Z}t.wrap=f;function m(N,O,U){try{return{type:"normal",arg:N.call(O,U)}}catch(Y){return{type:"throw",arg:Y}}}var p="suspendedStart",I="suspendedYield",b="executing",x="completed",D={};function v(){}function S(){}function A(){}var R={};c(R,s,function(){return this});var q=Object.getPrototypeOf,V=q&&q(q(Se([])));V&&V!==e&&n.call(V,s)&&(R=V);var T=A.prototype=v.prototype=Object.create(R);S.prototype=A,a(T,"constructor",{value:A,configurable:!0}),a(A,"constructor",{value:S,configurable:!0}),S.displayName=c(A,l,"GeneratorFunction");function g(N){["next","throw","return"].forEach(function(O){c(N,O,function(U){return this._invoke(O,U)})})}t.isGeneratorFunction=function(N){var O=typeof N=="function"&&N.constructor;return O?O===S||(O.displayName||O.name)==="GeneratorFunction":!1},t.mark=function(N){return Object.setPrototypeOf?Object.setPrototypeOf(N,A):(N.__proto__=A,c(N,l,"GeneratorFunction")),N.prototype=Object.create(T),N},t.awrap=function(N){return{__await:N}};function _(N,O){function U(Z,le,_e,je){var We=m(N[Z],N,le);if(We.type==="throw")je(We.arg);else{var xa=We.arg,$t=xa.value;return $t&&typeof $t=="object"&&n.call($t,"__await")?O.resolve($t.__await).then(function(Jt){U("next",Jt,_e,je)},function(Jt){U("throw",Jt,_e,je)}):O.resolve($t).then(function(Jt){xa.value=Jt,_e(xa)},function(Jt){return U("throw",Jt,_e,je)})}}var Y;function W(Z,le){function _e(){return new O(function(je,We){U(Z,le,je,We)})}return Y=Y?Y.then(_e,_e):_e()}a(this,"_invoke",{value:W})}g(_.prototype),c(_.prototype,u,function(){return this}),t.AsyncIterator=_,t.async=function(N,O,U,Y,W){W===void 0&&(W=Promise);var Z=new _(f(N,O,U,Y),W);return t.isGeneratorFunction(O)?Z:Z.next().then(function(le){return le.done?le.value:Z.next()})};function E(N,O,U){var Y=p;return function(Z,le){if(Y===b)throw new Error("Generator is already running");if(Y===x){if(Z==="throw")throw le;return An()}for(U.method=Z,U.arg=le;;){var _e=U.delegate;if(_e){var je=C(_e,U);if(je){if(je===D)continue;return je}}if(U.method==="next")U.sent=U._sent=U.arg;else if(U.method==="throw"){if(Y===p)throw Y=x,U.arg;U.dispatchException(U.arg)}else U.method==="return"&&U.abrupt("return",U.arg);Y=b;var We=m(N,O,U);if(We.type==="normal"){if(Y=U.done?x:I,We.arg===D)continue;return{value:We.arg,done:U.done}}else We.type==="throw"&&(Y=x,U.method="throw",U.arg=We.arg)}}}function C(N,O){var U=O.method,Y=N.iterator[U];if(Y===r)return O.delegate=null,U==="throw"&&N.iterator.return&&(O.method="return",O.arg=r,C(N,O),O.method==="throw")||U!=="return"&&(O.method="throw",O.arg=new TypeError("The iterator does not provide a '"+U+"' method")),D;var W=m(Y,N.iterator,O.arg);if(W.type==="throw")return O.method="throw",O.arg=W.arg,O.delegate=null,D;var Z=W.arg;if(!Z)return O.method="throw",O.arg=new TypeError("iterator result is not an object"),O.delegate=null,D;if(Z.done)O[N.resultName]=Z.value,O.next=N.nextLoc,O.method!=="return"&&(O.method="next",O.arg=r);else return Z;return O.delegate=null,D}g(T),c(T,l,"Generator"),c(T,s,function(){return this}),c(T,"toString",function(){return"[object Generator]"});function L(N){var O={tryLoc:N[0]};1 in N&&(O.catchLoc=N[1]),2 in N&&(O.finallyLoc=N[2],O.afterLoc=N[3]),this.tryEntries.push(O)}function w(N){var O=N.completion||{};O.type="normal",delete O.arg,N.completion=O}function Te(N){this.tryEntries=[{tryLoc:"root"}],N.forEach(L,this),this.reset(!0)}t.keys=function(N){var O=Object(N),U=[];for(var Y in O)U.push(Y);return U.reverse(),function W(){for(;U.length;){var Z=U.pop();if(Z in O)return W.value=Z,W.done=!1,W}return W.done=!0,W}};function Se(N){if(N){var O=N[s];if(O)return O.call(N);if(typeof N.next=="function")return N;if(!isNaN(N.length)){var U=-1,Y=function W(){for(;++U<N.length;)if(n.call(N,U))return W.value=N[U],W.done=!1,W;return W.value=r,W.done=!0,W};return Y.next=Y}}return{next:An}}t.values=Se;function An(){return{value:r,done:!0}}return Te.prototype={constructor:Te,reset:function(N){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(w),!N)for(var O in this)O.charAt(0)==="t"&&n.call(this,O)&&!isNaN(+O.slice(1))&&(this[O]=r)},stop:function(){this.done=!0;var N=this.tryEntries[0],O=N.completion;if(O.type==="throw")throw O.arg;return this.rval},dispatchException:function(N){if(this.done)throw N;var O=this;function U(je,We){return Z.type="throw",Z.arg=N,O.next=je,We&&(O.method="next",O.arg=r),!!We}for(var Y=this.tryEntries.length-1;Y>=0;--Y){var W=this.tryEntries[Y],Z=W.completion;if(W.tryLoc==="root")return U("end");if(W.tryLoc<=this.prev){var le=n.call(W,"catchLoc"),_e=n.call(W,"finallyLoc");if(le&&_e){if(this.prev<W.catchLoc)return U(W.catchLoc,!0);if(this.prev<W.finallyLoc)return U(W.finallyLoc)}else if(le){if(this.prev<W.catchLoc)return U(W.catchLoc,!0)}else if(_e){if(this.prev<W.finallyLoc)return U(W.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(N,O){for(var U=this.tryEntries.length-1;U>=0;--U){var Y=this.tryEntries[U];if(Y.tryLoc<=this.prev&&n.call(Y,"finallyLoc")&&this.prev<Y.finallyLoc){var W=Y;break}}W&&(N==="break"||N==="continue")&&W.tryLoc<=O&&O<=W.finallyLoc&&(W=null);var Z=W?W.completion:{};return Z.type=N,Z.arg=O,W?(this.method="next",this.next=W.finallyLoc,D):this.complete(Z)},complete:function(N,O){if(N.type==="throw")throw N.arg;return N.type==="break"||N.type==="continue"?this.next=N.arg:N.type==="return"?(this.rval=this.arg=N.arg,this.method="return",this.next="end"):N.type==="normal"&&O&&(this.next=O),D},finish:function(N){for(var O=this.tryEntries.length-1;O>=0;--O){var U=this.tryEntries[O];if(U.finallyLoc===N)return this.complete(U.completion,U.afterLoc),w(U),D}},catch:function(N){for(var O=this.tryEntries.length-1;O>=0;--O){var U=this.tryEntries[O];if(U.tryLoc===N){var Y=U.completion;if(Y.type==="throw"){var W=Y.arg;w(U)}return W}}throw new Error("illegal catch attempt")},delegateYield:function(N,O,U){return this.delegate={iterator:Se(N),resultName:O,nextLoc:U},this.method==="next"&&(this.arg=r),D}},t}(typeof CS=="object"?CS.exports:{});try{regeneratorRuntime=wS}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=wS:Function("r","regeneratorRuntime = r")(wS)}});var wp=Ie((p6,M0)=>{"use strict";M0.exports=(t,e)=>`${t}-${e}-${Math.random().toString(16).slice(3,8)}`});var AS=Ie((m6,V0)=>{"use strict";var kF=wp(),U0=0;V0.exports=({id:t,action:e,payload:n={}})=>{let a=t;return typeof a>"u"&&(a=kF("Job",U0),U0+=1),{id:a,action:e,payload:n}}});var Cp=Ie(Cc=>{"use strict";var bS=!1;Cc.logging=bS;Cc.setLogging=t=>{bS=t};Cc.log=(...t)=>bS?console.log.apply(Cc,t):null});var z0=Ie((B0,q0)=>{"use strict";var DF=AS(),{log:Ap}=Cp(),PF=wp(),F0=0;q0.exports=()=>{let t=PF("Scheduler",F0),e={},n={},a=[];F0+=1;let r=()=>a.length,i=()=>Object.keys(e).length,s=()=>{if(a.length!==0){let m=Object.keys(e);for(let p=0;p<m.length;p+=1)if(typeof n[m[p]]>"u"){a[0](e[m[p]]);break}}},u=(m,p)=>new Promise((I,b)=>{let x=DF({action:m,payload:p});a.push(async D=>{a.shift(),n[D.id]=x;try{I(await D[m].apply(B0,[...p,x.id]))}catch(v){b(v)}finally{delete n[D.id],s()}}),Ap(`[${t}]: Add ${x.id} to JobQueue`),Ap(`[${t}]: JobQueue length=${a.length}`),s()});return{addWorker:m=>(e[m.id]=m,Ap(`[${t}]: Add ${m.id}`),Ap(`[${t}]: Number of workers=${i()}`),s(),m.id),addJob:async(m,...p)=>{if(i()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return u(m,p)},terminate:async()=>{Object.keys(e).forEach(async m=>{await e[m].terminate()}),a=[]},getQueueLen:r,getNumWorkers:i}}});var G0=Ie((y6,H0)=>{"use strict";H0.exports=t=>{let e={};return typeof WorkerGlobalScope<"u"?e.type="webworker":typeof document=="object"?e.type="browser":typeof process=="object"&&typeof eE=="function"&&(e.type="node"),typeof t>"u"?e:e[t]}});var W0=Ie((I6,j0)=>{"use strict";var OF=G0()("type")==="browser",NF=OF?t=>new URL(t,window.location.href).href:t=>t;j0.exports=t=>{let e={...t};return["corePath","workerPath","langPath"].forEach(n=>{t[n]&&(e[n]=NF(e[n]))}),e}});var LS=Ie((T6,K0)=>{"use strict";K0.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}});var Y0=Ie((S6,MF)=>{MF.exports={name:"tesseract.js",version:"7.0.0",description:"Pure Javascript Multilingual OCR",main:"src/index.js",type:"commonjs",types:"src/index.d.ts",unpkg:"dist/tesseract.min.js",jsdelivr:"dist/tesseract.min.js",scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs","profile:tesseract":"webpack-bundle-analyzer dist/tesseract-stats.json","profile:worker":"webpack-bundle-analyzer dist/worker-stats.json",prepublishOnly:"npm run build",wait:"rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser test:node:all","test:browser":"karma start karma.conf.js","test:node":"nyc mocha --exit --bail --require ./scripts/test-helper.mjs","test:node:all":"npm run test:node -- ./tests/*.test.mjs",lint:"eslint src","lint:fix":"eslint --fix src",postinstall:"opencollective-postinstall || true"},browser:{"./src/worker/node/index.js":"./src/worker/browser/index.js"},author:"",contributors:["jeromewu"],license:"Apache-2.0",devDependencies:{"@babel/core":"^7.21.4","@babel/eslint-parser":"^7.21.3","@babel/preset-env":"^7.21.4","@rollup/plugin-commonjs":"^24.1.0",acorn:"^8.8.2","babel-loader":"^9.1.2",buffer:"^6.0.3",cors:"^2.8.5",eslint:"^7.32.0","eslint-config-airbnb-base":"^14.2.1","eslint-plugin-import":"^2.27.5","expect.js":"^0.3.1",express:"^4.18.2",mocha:"^10.2.0","npm-run-all":"^4.1.5",karma:"^6.4.2","karma-chrome-launcher":"^3.2.0","karma-firefox-launcher":"^2.1.2","karma-mocha":"^2.0.1","karma-webpack":"^5.0.0",nyc:"^15.1.0",rimraf:"^5.0.0",rollup:"^3.20.7","wait-on":"^7.0.1",webpack:"^5.79.0","webpack-bundle-analyzer":"^4.8.0","webpack-cli":"^5.0.1","webpack-dev-middleware":"^6.0.2","rollup-plugin-sourcemaps":"^0.6.3"},dependencies:{"bmp-js":"^0.1.0","idb-keyval":"^6.2.0","is-url":"^1.2.4","node-fetch":"^2.6.9","opencollective-postinstall":"^2.0.3","regenerator-runtime":"^0.13.3","tesseract.js-core":"^7.0.0","wasm-feature-detect":"^1.8.0",zlibjs:"^0.3.1"},overrides:{"@rollup/pluginutils":"^5.0.2"},repository:{type:"git",url:"https://github.com/naptha/tesseract.js.git"},bugs:{url:"https://github.com/naptha/tesseract.js/issues"},homepage:"https://github.com/naptha/tesseract.js",collective:{type:"opencollective",url:"https://opencollective.com/tesseractjs"}}});var X0=Ie((v6,Q0)=>{"use strict";Q0.exports={workerBlobURL:!0,logger:()=>{}}});var J0=Ie((E6,$0)=>{"use strict";var UF=Y0().version,VF=X0();$0.exports={...VF,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${UF}/dist/worker.min.js`}});var ek=Ie((w6,Z0)=>{"use strict";Z0.exports=({workerPath:t,workerBlobURL:e})=>{let n;if(Blob&&URL&&e){let a=new Blob([`importScripts("${t}");`],{type:"application/javascript"});n=new Worker(URL.createObjectURL(a))}else n=new Worker(t);return n}});var nk=Ie((C6,tk)=>{"use strict";tk.exports=t=>{t.terminate()}});var rk=Ie((A6,ak)=>{"use strict";ak.exports=(t,e)=>{t.onmessage=({data:n})=>{e(n)}}});var sk=Ie((b6,ik)=>{"use strict";ik.exports=async(t,e)=>{t.postMessage(e)}});var uk=Ie((L6,ok)=>{"use strict";var RS=t=>new Promise((e,n)=>{let a=new FileReader;a.onload=()=>{e(a.result)},a.onerror=({target:{error:{code:r}}})=>{n(Error(`File could not be read! Code=${r}`))},a.readAsArrayBuffer(t)}),xS=async t=>{let e=t;if(typeof t>"u")return"undefined";if(typeof t=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(t)?e=atob(t.split(",")[1]).split("").map(n=>n.charCodeAt(0)):e=await(await fetch(t)).arrayBuffer();else if(typeof HTMLElement<"u"&&t instanceof HTMLElement)t.tagName==="IMG"&&(e=await xS(t.src)),t.tagName==="VIDEO"&&(e=await xS(t.poster)),t.tagName==="CANVAS"&&await new Promise(n=>{t.toBlob(async a=>{e=await RS(a),n()})});else if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas){let n=await t.convertToBlob();e=await RS(n)}else(t instanceof File||t instanceof Blob)&&(e=await RS(t));return new Uint8Array(e)};ok.exports=xS});var ck=Ie((R6,lk)=>{"use strict";var FF=J0(),BF=ek(),qF=nk(),zF=rk(),HF=sk(),GF=uk();lk.exports={defaultOptions:FF,spawnWorker:BF,terminateWorker:qF,onMessage:zF,send:HF,loadImage:GF}});var kS=Ie((x6,pk)=>{"use strict";var jF=W0(),Ca=AS(),{log:dk}=Cp(),WF=wp(),as=LS(),{defaultOptions:KF,spawnWorker:YF,terminateWorker:QF,onMessage:XF,loadImage:fk,send:$F}=ck(),hk=0;pk.exports=async(t="eng",e=as.LSTM_ONLY,n={},a={})=>{let r=WF("Worker",hk),{logger:i,errorHandler:s,...u}=jF({...KF,...n}),l={},c=typeof t=="string"?t.split("+"):t,f=e,m=a,p=[as.DEFAULT,as.LSTM_ONLY].includes(e)&&!u.legacyCore,I,b,x=new Promise((N,O)=>{b=N,I=O}),D=N=>{I(N.message)},v=YF(u);v.onerror=D,hk+=1;let S=({id:N,action:O,payload:U})=>new Promise((Y,W)=>{dk(`[${r}]: Start ${N}, action=${O}`);let Z=`${O}-${N}`;l[Z]={resolve:Y,reject:W},$F(v,{workerId:r,jobId:N,action:O,payload:U})}),A=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),R=N=>S(Ca({id:N,action:"load",payload:{options:{lstmOnly:p,corePath:u.corePath,logging:u.logging}}})),q=(N,O,U)=>S(Ca({id:U,action:"FS",payload:{method:"writeFile",args:[N,O]}})),V=(N,O)=>S(Ca({id:O,action:"FS",payload:{method:"readFile",args:[N,{encoding:"utf8"}]}})),T=(N,O)=>S(Ca({id:O,action:"FS",payload:{method:"unlink",args:[N]}})),g=(N,O,U)=>S(Ca({id:U,action:"FS",payload:{method:N,args:O}})),_=(N,O)=>S(Ca({id:O,action:"loadLanguage",payload:{langs:N,options:{langPath:u.langPath,dataPath:u.dataPath,cachePath:u.cachePath,cacheMethod:u.cacheMethod,gzip:u.gzip,lstmOnly:[as.DEFAULT,as.LSTM_ONLY].includes(f)&&!u.legacyLang}}})),E=(N,O,U,Y)=>S(Ca({id:Y,action:"initialize",payload:{langs:N,oem:O,config:U}})),C=(N="eng",O,U,Y)=>{if(p&&[as.TESSERACT_ONLY,as.TESSERACT_LSTM_COMBINED].includes(O))throw Error("Legacy model requested but code missing.");let W=O||f;f=W;let Z=U||m;m=Z;let _e=(typeof N=="string"?N.split("+"):N).filter(je=>!c.includes(je));return c.push(..._e),_e.length>0?_(_e,Y).then(()=>E(N,W,Z,Y)):E(N,W,Z,Y)},L=(N={},O)=>S(Ca({id:O,action:"setParameters",payload:{params:N}})),w=async(N,O={},U={text:!0},Y)=>S(Ca({id:Y,action:"recognize",payload:{image:await fk(N),options:O,output:U}})),Te=async(N,O)=>{if(p)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return S(Ca({id:O,action:"detect",payload:{image:await fk(N)}}))},Se=async()=>(v!==null&&(QF(v),v=null),Promise.resolve());XF(v,({workerId:N,jobId:O,status:U,action:Y,data:W})=>{let Z=`${Y}-${O}`;if(U==="resolve")dk(`[${N}]: Complete ${O}`),l[Z].resolve({jobId:O,data:W}),delete l[Z];else if(U==="reject")if(l[Z].reject(W),delete l[Z],Y==="load"&&I(W),s)s(W);else throw Error(W);else U==="progress"&&i({...W,userJobId:O})});let An={id:r,worker:v,load:A,writeText:q,readText:V,removeFile:T,FS:g,reinitialize:C,setParameters:L,recognize:w,detect:Te,terminate:Se};return R().then(()=>_(t)).then(()=>E(t,e,a)).then(()=>b(An)).catch(()=>{}),x}});var yk=Ie((k6,gk)=>{"use strict";var mk=kS(),JF=async(t,e,n)=>{let a=await mk(e,1,n);return a.recognize(t).finally(async()=>{await a.terminate()})},ZF=async(t,e)=>{let n=await mk("osd",0,e);return n.detect(t).finally(async()=>{await n.terminate()})};gk.exports={recognize:JF,detect:ZF}});var Ik=Ie((D6,_k)=>{"use strict";_k.exports={AFR:"afr",AMH:"amh",ARA:"ara",ASM:"asm",AZE:"aze",AZE_CYRL:"aze_cyrl",BEL:"bel",BEN:"ben",BOD:"bod",BOS:"bos",BUL:"bul",CAT:"cat",CEB:"ceb",CES:"ces",CHI_SIM:"chi_sim",CHI_TRA:"chi_tra",CHR:"chr",CYM:"cym",DAN:"dan",DEU:"deu",DZO:"dzo",ELL:"ell",ENG:"eng",ENM:"enm",EPO:"epo",EST:"est",EUS:"eus",FAS:"fas",FIN:"fin",FRA:"fra",FRK:"frk",FRM:"frm",GLE:"gle",GLG:"glg",GRC:"grc",GUJ:"guj",HAT:"hat",HEB:"heb",HIN:"hin",HRV:"hrv",HUN:"hun",IKU:"iku",IND:"ind",ISL:"isl",ITA:"ita",ITA_OLD:"ita_old",JAV:"jav",JPN:"jpn",KAN:"kan",KAT:"kat",KAT_OLD:"kat_old",KAZ:"kaz",KHM:"khm",KIR:"kir",KOR:"kor",KUR:"kur",LAO:"lao",LAT:"lat",LAV:"lav",LIT:"lit",MAL:"mal",MAR:"mar",MKD:"mkd",MLT:"mlt",MSA:"msa",MYA:"mya",NEP:"nep",NLD:"nld",NOR:"nor",ORI:"ori",PAN:"pan",POL:"pol",POR:"por",PUS:"pus",RON:"ron",RUS:"rus",SAN:"san",SIN:"sin",SLK:"slk",SLV:"slv",SPA:"spa",SPA_OLD:"spa_old",SQI:"sqi",SRP:"srp",SRP_LATN:"srp_latn",SWA:"swa",SWE:"swe",SYR:"syr",TAM:"tam",TEL:"tel",TGK:"tgk",TGL:"tgl",THA:"tha",TIR:"tir",TUR:"tur",UIG:"uig",UKR:"ukr",URD:"urd",UZB:"uzb",UZB_CYRL:"uzb_cyrl",VIE:"vie",YID:"yid"}});var Sk=Ie((P6,Tk)=>{"use strict";Tk.exports={OSD_ONLY:"0",AUTO_OSD:"1",AUTO_ONLY:"2",AUTO:"3",SINGLE_COLUMN:"4",SINGLE_BLOCK_VERT_TEXT:"5",SINGLE_BLOCK:"6",SINGLE_LINE:"7",SINGLE_WORD:"8",CIRCLE_WORD:"9",SINGLE_CHAR:"10",SPARSE_TEXT:"11",SPARSE_TEXT_OSD:"12",RAW_LINE:"13"}});var Ek=Ie((O6,vk)=>{"use strict";N0();var eB=z0(),tB=kS(),nB=yk(),aB=Ik(),rB=LS(),iB=Sk(),{setLogging:sB}=Cp();vk.exports={languages:aB,OEM:rB,PSM:iB,createScheduler:eB,createWorker:tB,setLogging:sB,...nB}});var RD={};SP(RD,{captureScreenshot:()=>d4});var d4,xD=TP(()=>{d4=async()=>null});var FD=Ie(fm=>{"use strict";var T4=Symbol.for("react.transitional.element"),S4=Symbol.for("react.fragment");function VD(t,e,n){var a=null;if(n!==void 0&&(a=""+n),e.key!==void 0&&(a=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:T4,type:t,key:a,ref:e!==void 0?e:null,props:n}}fm.Fragment=S4;fm.jsx=VD;fm.jsxs=VD});var It=Ie((L9,BD)=>{"use strict";BD.exports=FD()});var kt=Ce(Wn()),XD=Ce(Hb());var Gb=()=>{};var Kb=function(t){let e=[],n=0;for(let a=0;a<t.length;a++){let r=t.charCodeAt(a);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&a+1<t.length&&(t.charCodeAt(a+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++a)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},pN=function(t){let e=[],n=0,a=0;for(;n<t.length;){let r=t[n++];if(r<128)e[a++]=String.fromCharCode(r);else if(r>191&&r<224){let i=t[n++];e[a++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){let i=t[n++],s=t[n++],u=t[n++],l=((r&7)<<18|(i&63)<<12|(s&63)<<6|u&63)-65536;e[a++]=String.fromCharCode(55296+(l>>10)),e[a++]=String.fromCharCode(56320+(l&1023))}else{let i=t[n++],s=t[n++];e[a++]=String.fromCharCode((r&15)<<12|(i&63)<<6|s&63)}}return e.join("")},Yb={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let r=0;r<t.length;r+=3){let i=t[r],s=r+1<t.length,u=s?t[r+1]:0,l=r+2<t.length,c=l?t[r+2]:0,f=i>>2,m=(i&3)<<4|u>>4,p=(u&15)<<2|c>>6,I=c&63;l||(I=64,s||(p=64)),a.push(n[f],n[m],n[p],n[I])}return a.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Kb(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):pN(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let n=e?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let r=0;r<t.length;){let i=n[t.charAt(r++)],u=r<t.length?n[t.charAt(r)]:0;++r;let c=r<t.length?n[t.charAt(r)]:64;++r;let m=r<t.length?n[t.charAt(r)]:64;if(++r,i==null||u==null||c==null||m==null)throw new g_;let p=i<<2|u>>4;if(a.push(p),c!==64){let I=u<<4&240|c>>2;if(a.push(I),m!==64){let b=c<<6&192|m;a.push(b)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},g_=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},mN=function(t){let e=Kb(t);return Yb.encodeByteArray(e,!0)},Sl=function(t){return mN(t).replace(/\./g,"")},co=function(t){try{return Yb.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function Qb(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var gN=()=>Qb().__FIREBASE_DEFAULTS__,yN=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},_N=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&co(t[1]);return e&&JSON.parse(e)},jf=()=>{try{return Gb()||gN()||yN()||_N()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},vl=t=>jf()?.emulatorHosts?.[t],Wf=t=>{let e=vl(t);if(!e)return;let n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let a=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),a]:[e.substring(0,n),a]},__=()=>jf()?.config,I_=t=>jf()?.[`_${t}`];var Gf=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,a)=>{n?this.reject(n):this.resolve(a),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,a))}}};function Qt(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function ri(t){return(await fetch(t,{credentials:"include"})).ok}function Kf(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let n={alg:"none",type:"JWT"},a=e||"demo-project",r=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let s={iss:`https://securetoken.google.com/${a}`,aud:a,iat:r,exp:r+3600,auth_time:r,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...t};return[Sl(JSON.stringify(n)),Sl(JSON.stringify(s)),""].join(".")}var Tl={};function IN(){let t={prod:[],emulator:[]};for(let e of Object.keys(Tl))Tl[e]?t.emulator.push(e):t.prod.push(e);return t}function TN(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}var jb=!1;function ii(t,e){if(typeof window>"u"||typeof document>"u"||!Qt(window.location.host)||Tl[t]===e||Tl[t]||jb)return;Tl[t]=e;function n(p){return`__firebase__banner__${p}`}let a="__firebase__banner",i=IN().prod.length>0;function s(){let p=document.getElementById(a);p&&p.remove()}function u(p){p.style.display="flex",p.style.background="#7faaf0",p.style.position="fixed",p.style.bottom="5px",p.style.left="5px",p.style.padding=".5em",p.style.borderRadius="5px",p.style.alignItems="center"}function l(p,I){p.setAttribute("width","24"),p.setAttribute("id",I),p.setAttribute("height","24"),p.setAttribute("viewBox","0 0 24 24"),p.setAttribute("fill","none"),p.style.marginLeft="-6px"}function c(){let p=document.createElement("span");return p.style.cursor="pointer",p.style.marginLeft="16px",p.style.fontSize="24px",p.innerHTML=" &times;",p.onclick=()=>{jb=!0,s()},p}function f(p,I){p.setAttribute("id",I),p.innerText="Learn more",p.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",p.setAttribute("target","__blank"),p.style.paddingLeft="5px",p.style.textDecoration="underline"}function m(){let p=TN(a),I=n("text"),b=document.getElementById(I)||document.createElement("span"),x=n("learnmore"),D=document.getElementById(x)||document.createElement("a"),v=n("preprendIcon"),S=document.getElementById(v)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(p.created){let A=p.element;u(A),f(D,x);let R=c();l(S,v),A.append(S,b,D,R),document.body.appendChild(A)}i?(b.innerText="Preview backend disconnected.",S.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
</defs>`,b.innerText="Preview backend running in this workspace."),b.setAttribute("id",I)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}function xe(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Yf(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(xe())}function SN(){let t=jf()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Qf(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Xf(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function $f(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function T_(){let t=xe();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Xb(){return!SN()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function S_(){try{return typeof indexedDB=="object"}catch{return!1}}function $b(){return new Promise((t,e)=>{try{let n=!0,a="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(a);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(a),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(n){e(n)}})}var vN="FirebaseError",bt=class t extends Error{constructor(e,n,a){super(n),this.code=e,this.customData=a,this.name=vN,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,En.prototype.create)}},En=class{constructor(e,n,a){this.service=e,this.serviceName=n,this.errors=a}create(e,...n){let a=n[0]||{},r=`${this.service}/${e}`,i=this.errors[e],s=i?EN(i,a):"Error",u=`${this.serviceName}: ${s} (${r}).`;return new bt(r,u,a)}};function EN(t,e){return t.replace(wN,(n,a)=>{let r=e[a];return r!=null?String(r):`<${a}?>`})}var wN=/\{\$([^}]+)}/g;function Jb(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Xt(t,e){if(t===e)return!0;let n=Object.keys(t),a=Object.keys(e);for(let r of n){if(!a.includes(r))return!1;let i=t[r],s=e[r];if(Wb(i)&&Wb(s)){if(!Xt(i,s))return!1}else if(i!==s)return!1}for(let r of a)if(!n.includes(r))return!1;return!0}function Wb(t){return t!==null&&typeof t=="object"}function ha(t){let e=[];for(let[n,a]of Object.entries(t))Array.isArray(a)?a.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(a));return e.length?"&"+e.join("&"):""}function Bn(t){let e={};return t.replace(/^\?/,"").split("&").forEach(a=>{if(a){let[r,i]=a.split("=");e[decodeURIComponent(r)]=decodeURIComponent(i)}}),e}function qn(t){let e=t.indexOf("?");if(!e)return"";let n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function Jf(t,e){let n=new y_(t,e);return n.subscribe.bind(n)}var y_=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(a=>{this.error(a)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,a){let r;if(e===void 0&&n===void 0&&a===void 0)throw new Error("Missing Observer.");CN(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:a},r.next===void 0&&(r.next=m_),r.error===void 0&&(r.error=m_),r.complete===void 0&&(r.complete=m_);let i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function CN(t,e){if(typeof t!="object"||t===null)return!1;for(let n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function m_(){}var tz=4*60*60*1e3;function Oe(t){return t&&t._delegate?t._delegate:t}var Ut=class{constructor(e,n,a){this.name=e,this.instanceFactory=n,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var qi="[DEFAULT]";var v_=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){let a=new Gf;if(this.instancesDeferred.set(n,a),this.isInitialized(n)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:n});r&&a.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){let n=this.normalizeInstanceIdentifier(e?.identifier),a=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(a)return null;throw r}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(bN(e))try{this.getOrInitializeService({instanceIdentifier:qi})}catch{}for(let[n,a]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(n);try{let i=this.getOrInitializeService({instanceIdentifier:r});a.resolve(i)}catch{}}}}clearInstance(e=qi){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=qi){return this.instances.has(e)}getOptions(e=qi){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:n={}}=e,a=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:a,options:n});for(let[i,s]of this.instancesDeferred.entries()){let u=this.normalizeInstanceIdentifier(i);a===u&&s.resolve(r)}return r}onInit(e,n){let a=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(a)??new Set;r.add(e),this.onInitCallbacks.set(a,r);let i=this.instances.get(a);return i&&e(i,a),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){let a=this.onInitCallbacks.get(n);if(a)for(let r of a)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let a=this.instances.get(e);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:AN(e),options:n}),this.instances.set(e,a),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(a,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,a)}catch{}return a||null}normalizeInstanceIdentifier(e=qi){return this.component?this.component.multipleInstances?e:qi:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function AN(t){return t===qi?void 0:t}function bN(t){return t.instantiationMode==="EAGER"}var Zf=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let n=new v_(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};var LN=[],se;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(se||(se={}));var RN={debug:se.DEBUG,verbose:se.VERBOSE,info:se.INFO,warn:se.WARN,error:se.ERROR,silent:se.SILENT},xN=se.INFO,kN={[se.DEBUG]:"log",[se.VERBOSE]:"log",[se.INFO]:"info",[se.WARN]:"warn",[se.ERROR]:"error"},DN=(t,e,...n)=>{if(e<t.logLevel)return;let a=new Date().toISOString(),r=kN[e];if(r)console[r](`[${a}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},pa=class{constructor(e){this.name=e,this._logLevel=xN,this._logHandler=DN,this._userLogHandler=null,LN.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in se))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?RN[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,se.DEBUG,...e),this._logHandler(this,se.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,se.VERBOSE,...e),this._logHandler(this,se.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,se.INFO,...e),this._logHandler(this,se.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,se.WARN,...e),this._logHandler(this,se.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,se.ERROR,...e),this._logHandler(this,se.ERROR,...e)}};var PN=(t,e)=>e.some(n=>t instanceof n),Zb,eL;function ON(){return Zb||(Zb=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function NN(){return eL||(eL=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var tL=new WeakMap,w_=new WeakMap,nL=new WeakMap,E_=new WeakMap,A_=new WeakMap;function MN(t){let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("success",i),t.removeEventListener("error",s)},i=()=>{n(ma(t.result)),r()},s=()=>{a(t.error),r()};t.addEventListener("success",i),t.addEventListener("error",s)});return e.then(n=>{n instanceof IDBCursor&&tL.set(n,t)}).catch(()=>{}),A_.set(e,t),e}function UN(t){if(w_.has(t))return;let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",s),t.removeEventListener("abort",s)},i=()=>{n(),r()},s=()=>{a(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",i),t.addEventListener("error",s),t.addEventListener("abort",s)});w_.set(t,e)}var C_={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return w_.get(t);if(e==="objectStoreNames")return t.objectStoreNames||nL.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return ma(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function aL(t){C_=t(C_)}function VN(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let a=t.call(eh(this),e,...n);return nL.set(a,e.sort?e.sort():[e]),ma(a)}:NN().includes(t)?function(...e){return t.apply(eh(this),e),ma(tL.get(this))}:function(...e){return ma(t.apply(eh(this),e))}}function FN(t){return typeof t=="function"?VN(t):(t instanceof IDBTransaction&&UN(t),PN(t,ON())?new Proxy(t,C_):t)}function ma(t){if(t instanceof IDBRequest)return MN(t);if(E_.has(t))return E_.get(t);let e=FN(t);return e!==t&&(E_.set(t,e),A_.set(e,t)),e}var eh=t=>A_.get(t);function iL(t,e,{blocked:n,upgrade:a,blocking:r,terminated:i}={}){let s=indexedDB.open(t,e),u=ma(s);return a&&s.addEventListener("upgradeneeded",l=>{a(ma(s.result),l.oldVersion,l.newVersion,ma(s.transaction),l)}),n&&s.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),u.then(l=>{i&&l.addEventListener("close",()=>i()),r&&l.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),u}var BN=["get","getKey","getAll","getAllKeys","count"],qN=["put","add","delete","clear"],b_=new Map;function rL(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(b_.get(e))return b_.get(e);let n=e.replace(/FromIndex$/,""),a=e!==n,r=qN.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(r||BN.includes(n)))return;let i=async function(s,...u){let l=this.transaction(s,r?"readwrite":"readonly"),c=l.store;return a&&(c=c.index(u.shift())),(await Promise.all([c[n](...u),r&&l.done]))[0]};return b_.set(e,i),i}aL(t=>({...t,get:(e,n,a)=>rL(e,n)||t.get(e,n,a),has:(e,n)=>!!rL(e,n)||t.has(e,n)}));var R_=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(zN(n)){let a=n.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(n=>n).join(" ")}};function zN(t){return t.getComponent()?.type==="VERSION"}var x_="@firebase/app",sL="0.14.9";var tr=new pa("@firebase/app"),HN="@firebase/app-compat",GN="@firebase/analytics-compat",jN="@firebase/analytics",WN="@firebase/app-check-compat",KN="@firebase/app-check",YN="@firebase/auth",QN="@firebase/auth-compat",XN="@firebase/database",$N="@firebase/data-connect",JN="@firebase/database-compat",ZN="@firebase/functions",eM="@firebase/functions-compat",tM="@firebase/installations",nM="@firebase/installations-compat",aM="@firebase/messaging",rM="@firebase/messaging-compat",iM="@firebase/performance",sM="@firebase/performance-compat",oM="@firebase/remote-config",uM="@firebase/remote-config-compat",lM="@firebase/storage",cM="@firebase/storage-compat",dM="@firebase/firestore",fM="@firebase/ai",hM="@firebase/firestore-compat",pM="firebase",mM="12.10.0";var k_="[DEFAULT]",gM={[x_]:"fire-core",[HN]:"fire-core-compat",[jN]:"fire-analytics",[GN]:"fire-analytics-compat",[KN]:"fire-app-check",[WN]:"fire-app-check-compat",[YN]:"fire-auth",[QN]:"fire-auth-compat",[XN]:"fire-rtdb",[$N]:"fire-data-connect",[JN]:"fire-rtdb-compat",[ZN]:"fire-fn",[eM]:"fire-fn-compat",[tM]:"fire-iid",[nM]:"fire-iid-compat",[aM]:"fire-fcm",[rM]:"fire-fcm-compat",[iM]:"fire-perf",[sM]:"fire-perf-compat",[oM]:"fire-rc",[uM]:"fire-rc-compat",[lM]:"fire-gcs",[cM]:"fire-gcs-compat",[dM]:"fire-fst",[hM]:"fire-fst-compat",[fM]:"fire-vertex","fire-js":"fire-js",[pM]:"fire-js-all"};var th=new Map,yM=new Map,D_=new Map;function oL(t,e){try{t.container.addComponent(e)}catch(n){tr.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function wn(t){let e=t.name;if(D_.has(e))return tr.debug(`There were multiple attempts to register component ${e}.`),!1;D_.set(e,t);for(let n of th.values())oL(n,t);for(let n of yM.values())oL(n,t);return!0}function Xn(t,e){let n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function at(t){return t==null?!1:t.settings!==void 0}var _M={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},si=new En("app","Firebase",_M);var P_=class{constructor(e,n,a){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new Ut("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw si.create("app-deleted",{appName:this._name})}};var un=mM;function wl(t,e={}){let n=t;typeof e!="object"&&(e={name:e});let a={name:k_,automaticDataCollectionEnabled:!0,...e},r=a.name;if(typeof r!="string"||!r)throw si.create("bad-app-name",{appName:String(r)});if(n||(n=__()),!n)throw si.create("no-options");let i=th.get(r);if(i){if(Xt(n,i.options)&&Xt(a,i.config))return i;throw si.create("duplicate-app",{appName:r})}let s=new Zf(r);for(let l of D_.values())s.addComponent(l);let u=new P_(n,a,s);return th.set(r,u),u}function oi(t=k_){let e=th.get(t);if(!e&&t===k_&&__())return wl();if(!e)throw si.create("no-app",{appName:t});return e}function Vt(t,e,n){let a=gM[t]??t;n&&(a+=`-${n}`);let r=a.match(/\s|\//),i=e.match(/\s|\//);if(r||i){let s=[`Unable to register library "${a}" with version "${e}":`];r&&s.push(`library name "${a}" contains illegal characters (whitespace or "/")`),r&&i&&s.push("and"),i&&s.push(`version name "${e}" contains illegal characters (whitespace or "/")`),tr.warn(s.join(" "));return}wn(new Ut(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}var IM="firebase-heartbeat-database",TM=1,El="firebase-heartbeat-store",L_=null;function dL(){return L_||(L_=iL(IM,TM,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(El)}catch(n){console.warn(n)}}}}).catch(t=>{throw si.create("idb-open",{originalErrorMessage:t.message})})),L_}async function SM(t){try{let n=(await dL()).transaction(El),a=await n.objectStore(El).get(fL(t));return await n.done,a}catch(e){if(e instanceof bt)tr.warn(e.message);else{let n=si.create("idb-get",{originalErrorMessage:e?.message});tr.warn(n.message)}}}async function uL(t,e){try{let a=(await dL()).transaction(El,"readwrite");await a.objectStore(El).put(e,fL(t)),await a.done}catch(n){if(n instanceof bt)tr.warn(n.message);else{let a=si.create("idb-set",{originalErrorMessage:n?.message});tr.warn(a.message)}}}function fL(t){return`${t.name}!${t.options.appId}`}var vM=1024,EM=30,O_=class{constructor(e){this.container=e,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new N_(n),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=lL();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(r=>r.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:n}),this._heartbeatsCache.heartbeats.length>EM){let r=CM(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){tr.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=lL(),{heartbeatsToSend:n,unsentEntries:a}=wM(this._heartbeatsCache.heartbeats),r=Sl(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return tr.warn(e),""}}};function lL(){return new Date().toISOString().substring(0,10)}function wM(t,e=vM){let n=[],a=t.slice();for(let r of t){let i=n.find(s=>s.agent===r.agent);if(i){if(i.dates.push(r.date),cL(n)>e){i.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),cL(n)>e){n.pop();break}a=a.slice(1)}return{heartbeatsToSend:n,unsentEntries:a}}var N_=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return S_()?$b().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await SM(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return uL(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return uL(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}};function cL(t){return Sl(JSON.stringify({version:2,heartbeats:t})).length}function CM(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let a=1;a<t.length;a++)t[a].date<n&&(n=t[a].date,e=a);return e}function AM(t){wn(new Ut("platform-logger",e=>new R_(e),"PRIVATE")),wn(new Ut("heartbeat",e=>new O_(e),"PRIVATE")),Vt(x_,sL,t),Vt(x_,sL,"esm2020"),Vt("fire-js","")}AM("");var IL="firebasestorage.googleapis.com",TL="storageBucket",bM=2*60*1e3,LM=10*60*1e3;var Je=class t extends bt{constructor(e,n,a=0){super(M_(e),`Firebase Storage: ${n} (${M_(e)})`),this.status_=a,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return M_(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},Ze;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Ze||(Ze={}));function M_(t){return"storage/"+t}function z_(){let t="An unknown error occurred, please check the error payload for server response.";return new Je(Ze.UNKNOWN,t)}function RM(t){return new Je(Ze.OBJECT_NOT_FOUND,"Object '"+t+"' does not exist.")}function xM(t){return new Je(Ze.QUOTA_EXCEEDED,"Quota for bucket '"+t+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function kM(){let t="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new Je(Ze.UNAUTHENTICATED,t)}function DM(){return new Je(Ze.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function PM(t){return new Je(Ze.UNAUTHORIZED,"User does not have permission to access '"+t+"'.")}function OM(){return new Je(Ze.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function NM(){return new Je(Ze.CANCELED,"User canceled the upload/download.")}function MM(t){return new Je(Ze.INVALID_URL,"Invalid URL '"+t+"'.")}function UM(t){return new Je(Ze.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function VM(){return new Je(Ze.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+TL+"' property when initializing the app?")}function FM(){return new Je(Ze.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function BM(){return new Je(Ze.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function qM(t){return new Je(Ze.UNSUPPORTED_ENVIRONMENT,`${t} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function U_(t){return new Je(Ze.INVALID_ARGUMENT,t)}function SL(){return new Je(Ze.APP_DELETED,"The Firebase app was deleted.")}function zM(t){return new Je(Ze.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Al(t,e){return new Je(Ze.INVALID_FORMAT,"String does not match format '"+t+"': "+e)}function Cl(t){throw new Je(Ze.INTERNAL_ERROR,"Internal error: "+t)}var $n=class t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let a;try{a=t.makeFromUrl(e,n)}catch{return new t(e,"")}if(a.path==="")return a;throw UM(e)}static makeFromUrl(e,n){let a=null,r="([A-Za-z0-9.\\-_]+)";function i(R){R.path.charAt(R.path.length-1)==="/"&&(R.path_=R.path_.slice(0,-1))}let s="(/(.*))?$",u=new RegExp("^gs://"+r+s,"i"),l={bucket:1,path:3};function c(R){R.path_=decodeURIComponent(R.path)}let f="v[A-Za-z0-9_]+",m=n.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",I=new RegExp(`^https?://${m}/${f}/b/${r}/o${p}`,"i"),b={bucket:1,path:3},x=n===IL?"(?:storage.googleapis.com|storage.cloud.google.com)":n,D="([^?#]*)",v=new RegExp(`^https?://${x}/${r}/${D}`,"i"),A=[{regex:u,indices:l,postModify:i},{regex:I,indices:b,postModify:c},{regex:v,indices:{bucket:1,path:2},postModify:c}];for(let R=0;R<A.length;R++){let q=A[R],V=q.regex.exec(e);if(V){let T=V[q.indices.bucket],g=V[q.indices.path];g||(g=""),a=new t(T,g),q.postModify(a);break}}if(a==null)throw MM(e);return a}},V_=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function HM(t,e,n){let a=1,r=null,i=null,s=!1,u=0;function l(){return u===2}let c=!1;function f(...D){c||(c=!0,e.apply(null,D))}function m(D){r=setTimeout(()=>{r=null,t(I,l())},D)}function p(){i&&clearTimeout(i)}function I(D,...v){if(c){p();return}if(D){p(),f.call(null,D,...v);return}if(l()||s){p(),f.call(null,D,...v);return}a<64&&(a*=2);let A;u===1?(u=2,A=0):A=(a+Math.random())*1e3,m(A)}let b=!1;function x(D){b||(b=!0,p(),!c&&(r!==null?(D||(u=2),clearTimeout(r),m(0)):D||(u=1)))}return m(0),i=setTimeout(()=>{s=!0,x(!0)},n),x}function GM(t){t(!1)}function jM(t){return t!==void 0}function WM(t){return typeof t=="object"&&!Array.isArray(t)}function H_(t){return typeof t=="string"||t instanceof String}function hL(t){return G_()&&t instanceof Blob}function G_(){return typeof Blob<"u"}function pL(t,e,n,a){if(a<e)throw U_(`Invalid value for '${t}'. Expected ${e} or greater.`);if(a>n)throw U_(`Invalid value for '${t}'. Expected ${n} or less.`)}function j_(t,e,n){let a=e;return n==null&&(a=`https://${e}`),`${n}://${a}/v0${t}`}function vL(t){let e=encodeURIComponent,n="?";for(let a in t)if(t.hasOwnProperty(a)){let r=e(a)+"="+e(t[a]);n=n+r+"&"}return n=n.slice(0,-1),n}var zi;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(zi||(zi={}));function KM(t,e){let n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,i=e.indexOf(t)!==-1;return n||r||i}var F_=class{constructor(e,n,a,r,i,s,u,l,c,f,m,p=!0,I=!1){this.url_=e,this.method_=n,this.headers_=a,this.body_=r,this.successCodes_=i,this.additionalRetryCodes_=s,this.callback_=u,this.errorCallback_=l,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=m,this.retry=p,this.isUsingEmulator=I,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((b,x)=>{this.resolve_=b,this.reject_=x,this.start_()})}start_(){let e=(a,r)=>{if(r){a(!1,new fo(!1,null,!0));return}let i=this.connectionFactory_();this.pendingConnection_=i;let s=u=>{let l=u.loaded,c=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,c)};this.progressCallback_!==null&&i.addUploadProgressListener(s),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(s),this.pendingConnection_=null;let u=i.getErrorCode()===zi.NO_ERROR,l=i.getStatus();if(!u||KM(l,this.additionalRetryCodes_)&&this.retry){let f=i.getErrorCode()===zi.ABORT;a(!1,new fo(!1,null,f));return}let c=this.successCodes_.indexOf(l)!==-1;a(!0,new fo(c,i))})},n=(a,r)=>{let i=this.resolve_,s=this.reject_,u=r.connection;if(r.wasSuccessCode)try{let l=this.callback_(u,u.getResponse());jM(l)?i(l):i()}catch(l){s(l)}else if(u!==null){let l=z_();l.serverResponse=u.getErrorText(),this.errorCallback_?s(this.errorCallback_(u,l)):s(l)}else if(r.canceled){let l=this.appDelete_?SL():NM();s(l)}else{let l=OM();s(l)}};this.canceled_?n(!1,new fo(!1,null,!0)):this.backoffId_=HM(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&GM(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},fo=class{constructor(e,n,a){this.wasSuccessCode=e,this.connection=n,this.canceled=!!a}};function YM(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function QM(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function XM(t,e){e&&(t["X-Firebase-GMPID"]=e)}function $M(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function JM(t,e,n,a,r,i,s=!0,u=!1){let l=vL(t.urlParams),c=t.url+l,f=Object.assign({},t.headers);return XM(f,e),YM(f,n),QM(f,i),$M(f,a),new F_(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,s,u)}function ZM(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function e2(...t){let e=ZM();if(e!==void 0){let n=new e;for(let a=0;a<t.length;a++)n.append(t[a]);return n.getBlob()}else{if(G_())return new Blob(t);throw new Je(Ze.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function t2(t,e,n){return t.webkitSlice?t.webkitSlice(e,n):t.mozSlice?t.mozSlice(e,n):t.slice?t.slice(e,n):null}function n2(t){if(typeof atob>"u")throw qM("base-64");return atob(t)}var Jn={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"},bl=class{constructor(e,n){this.data=e,this.contentType=n||null}};function EL(t,e){switch(t){case Jn.RAW:return new bl(wL(e));case Jn.BASE64:case Jn.BASE64URL:return new bl(CL(t,e));case Jn.DATA_URL:return new bl(r2(e),i2(e))}throw z_()}function wL(t){let e=[];for(let n=0;n<t.length;n++){let a=t.charCodeAt(n);if(a<=127)e.push(a);else if(a<=2047)e.push(192|a>>6,128|a&63);else if((a&64512)===55296)if(!(n<t.length-1&&(t.charCodeAt(n+1)&64512)===56320))e.push(239,191,189);else{let i=a,s=t.charCodeAt(++n);a=65536|(i&1023)<<10|s&1023,e.push(240|a>>18,128|a>>12&63,128|a>>6&63,128|a&63)}else(a&64512)===56320?e.push(239,191,189):e.push(224|a>>12,128|a>>6&63,128|a&63)}return new Uint8Array(e)}function a2(t){let e;try{e=decodeURIComponent(t)}catch{throw Al(Jn.DATA_URL,"Malformed data URL.")}return wL(e)}function CL(t,e){switch(t){case Jn.BASE64:{let r=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(r||i)throw Al(t,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case Jn.BASE64URL:{let r=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(r||i)throw Al(t,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=n2(e)}catch(r){throw r.message.includes("polyfill")?r:Al(t,"Invalid character found")}let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}var ah=class{constructor(e){this.base64=!1,this.contentType=null;let n=e.match(/^data:([^,]+)?,/);if(n===null)throw Al(Jn.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");let a=n[1]||null;a!=null&&(this.base64=s2(a,";base64"),this.contentType=this.base64?a.substring(0,a.length-7):a),this.rest=e.substring(e.indexOf(",")+1)}};function r2(t){let e=new ah(t);return e.base64?CL(Jn.BASE64,e.rest):a2(e.rest)}function i2(t){return new ah(t).contentType}function s2(t,e){return t.length>=e.length?t.substring(t.length-e.length)===e:!1}var rh=class t{constructor(e,n){let a=0,r="";hL(e)?(this.data_=e,a=e.size,r=e.type):e instanceof ArrayBuffer?(n?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),a=this.data_.length):e instanceof Uint8Array&&(n?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),a=e.length),this.size_=a,this.type_=r}size(){return this.size_}type(){return this.type_}slice(e,n){if(hL(this.data_)){let a=this.data_,r=t2(a,e,n);return r===null?null:new t(r)}else{let a=new Uint8Array(this.data_.buffer,e,n-e);return new t(a,!0)}}static getBlob(...e){if(G_()){let n=e.map(a=>a instanceof t?a.data_:a);return new t(e2.apply(null,n))}else{let n=e.map(s=>H_(s)?EL(Jn.RAW,s).data:s.data_),a=0;n.forEach(s=>{a+=s.byteLength});let r=new Uint8Array(a),i=0;return n.forEach(s=>{for(let u=0;u<s.length;u++)r[i++]=s[u]}),new t(r,!0)}}uploadData(){return this.data_}};function AL(t){let e;try{e=JSON.parse(t)}catch{return null}return WM(e)?e:null}function o2(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function u2(t,e){let n=e.split("/").filter(a=>a.length>0).join("/");return t.length===0?n:t+"/"+n}function bL(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}function l2(t,e){return e}var Ft=class{constructor(e,n,a,r){this.server=e,this.local=n||e,this.writable=!!a,this.xform=r||l2}},nh=null;function c2(t){return!H_(t)||t.length<2?t:bL(t)}function LL(){if(nh)return nh;let t=[];t.push(new Ft("bucket")),t.push(new Ft("generation")),t.push(new Ft("metageneration")),t.push(new Ft("name","fullPath",!0));function e(i,s){return c2(s)}let n=new Ft("name");n.xform=e,t.push(n);function a(i,s){return s!==void 0?Number(s):s}let r=new Ft("size");return r.xform=a,t.push(r),t.push(new Ft("timeCreated")),t.push(new Ft("updated")),t.push(new Ft("md5Hash",null,!0)),t.push(new Ft("cacheControl",null,!0)),t.push(new Ft("contentDisposition",null,!0)),t.push(new Ft("contentEncoding",null,!0)),t.push(new Ft("contentLanguage",null,!0)),t.push(new Ft("contentType",null,!0)),t.push(new Ft("metadata","customMetadata",!0)),nh=t,nh}function d2(t,e){function n(){let a=t.bucket,r=t.fullPath,i=new $n(a,r);return e._makeStorageReference(i)}Object.defineProperty(t,"ref",{get:n})}function f2(t,e,n){let a={};a.type="file";let r=n.length;for(let i=0;i<r;i++){let s=n[i];a[s.local]=s.xform(a,e[s.server])}return d2(a,t),a}function RL(t,e,n){let a=AL(e);return a===null?null:f2(t,a,n)}function h2(t,e,n,a){let r=AL(e);if(r===null||!H_(r.downloadTokens))return null;let i=r.downloadTokens;if(i.length===0)return null;let s=encodeURIComponent;return i.split(",").map(c=>{let f=t.bucket,m=t.fullPath,p="/b/"+s(f)+"/o/"+s(m),I=j_(p,n,a),b=vL({alt:"media",token:c});return I+b})[0]}function p2(t,e){let n={},a=e.length;for(let r=0;r<a;r++){let i=e[r];i.writable&&(n[i.server]=t[i.local])}return JSON.stringify(n)}var ih=class{constructor(e,n,a,r){this.url=e,this.method=n,this.handler=a,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}};function xL(t){if(!t)throw z_()}function m2(t,e){function n(a,r){let i=RL(t,r,e);return xL(i!==null),i}return n}function g2(t,e){function n(a,r){let i=RL(t,r,e);return xL(i!==null),h2(i,r,t.host,t._protocol)}return n}function kL(t){function e(n,a){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=DM():r=kM():n.getStatus()===402?r=xM(t.bucket):n.getStatus()===403?r=PM(t.path):r=a,r.status=n.getStatus(),r.serverResponse=a.serverResponse,r}return e}function y2(t){let e=kL(t);function n(a,r){let i=e(a,r);return a.getStatus()===404&&(i=RM(t.path)),i.serverResponse=r.serverResponse,i}return n}function _2(t,e,n){let a=e.fullServerUrl(),r=j_(a,t.host,t._protocol),i="GET",s=t.maxOperationRetryTime,u=new ih(r,i,g2(t,n),s);return u.errorHandler=y2(e),u}function I2(t,e){return t&&t.contentType||e&&e.type()||"application/octet-stream"}function T2(t,e,n){let a=Object.assign({},n);return a.fullPath=t.path,a.size=e.size(),a.contentType||(a.contentType=I2(null,e)),a}function S2(t,e,n,a,r){let i=e.bucketOnlyServerUrl(),s={"X-Goog-Upload-Protocol":"multipart"};function u(){let A="";for(let R=0;R<2;R++)A=A+Math.random().toString().slice(2);return A}let l=u();s["Content-Type"]="multipart/related; boundary="+l;let c=T2(e,a,r),f=p2(c,n),m="--"+l+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+l+`\r
Content-Type: `+c.contentType+`\r
\r
`,p=`\r
--`+l+"--",I=rh.getBlob(m,a,p);if(I===null)throw FM();let b={name:c.fullPath},x=j_(i,t.host,t._protocol),D="POST",v=t.maxUploadRetryTime,S=new ih(x,D,m2(t,n),v);return S.urlParams=b,S.headers=s,S.body=I.uploadData(),S.errorHandler=kL(e),S}var Ez=256*1024;var mL=null,B_=class{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=zi.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=zi.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=zi.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,n,a,r,i){if(this.sent_)throw Cl("cannot .send() more than once");if(Qt(e)&&a&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,e,!0),i!==void 0)for(let s in i)i.hasOwnProperty(s)&&this.xhr_.setRequestHeader(s,i[s].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw Cl("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw Cl("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw Cl("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw Cl("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}},q_=class extends B_{initXhr(){this.xhr_.responseType="text"}};function DL(){return mL?mL():new q_}var ho=class t{constructor(e,n){this._service=e,n instanceof $n?this._location=n:this._location=$n.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new t(e,n)}get root(){let e=new $n(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return bL(this._location.path)}get storage(){return this._service}get parent(){let e=o2(this._location.path);if(e===null)return null;let n=new $n(this._location.bucket,e);return new t(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw zM(e)}};function v2(t,e,n){t._throwIfRoot("uploadBytes");let a=S2(t.storage,t._location,LL(),new rh(e,!0),n);return t.storage.makeRequestWithTokens(a,DL).then(r=>({metadata:r,ref:t}))}function E2(t,e,n=Jn.RAW,a){t._throwIfRoot("uploadString");let r=EL(n,e),i={...a};return i.contentType==null&&r.contentType!=null&&(i.contentType=r.contentType),v2(t,r.data,i)}function w2(t){t._throwIfRoot("getDownloadURL");let e=_2(t.storage,t._location,LL());return t.storage.makeRequestWithTokens(e,DL).then(n=>{if(n===null)throw BM();return n})}function C2(t,e){let n=u2(t._location.path,e),a=new $n(t._location.bucket,n);return new ho(t.storage,a)}function A2(t){return/^[A-Za-z]+:\/\//.test(t)}function b2(t,e){return new ho(t,e)}function PL(t,e){if(t instanceof Ll){let n=t;if(n._bucket==null)throw VM();let a=new ho(n,n._bucket);return e!=null?PL(a,e):a}else return e!==void 0?C2(t,e):t}function L2(t,e){if(e&&A2(e)){if(t instanceof Ll)return b2(t,e);throw U_("To use ref(service, url), the first argument must be a Storage instance.")}else return PL(t,e)}function gL(t,e){let n=e?.[TL];return n==null?null:$n.makeFromBucketSpec(n,t)}function R2(t,e,n,a={}){t.host=`${e}:${n}`;let r=Qt(e);r&&(ri(`https://${t.host}/b`),ii("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:i}=a;i&&(t._overrideAuthToken=typeof i=="string"?i:Kf(i,t.app.options.projectId))}var Ll=class{constructor(e,n,a,r,i,s=!1){this.app=e,this._authProvider=n,this._appCheckProvider=a,this._url=r,this._firebaseVersion=i,this._isUsingEmulator=s,this._bucket=null,this._host=IL,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=bM,this._maxUploadRetryTime=LM,this._requests=new Set,r!=null?this._bucket=$n.makeFromBucketSpec(r,this._host):this._bucket=gL(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=$n.makeFromBucketSpec(this._url,e):this._bucket=gL(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){pL("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){pL("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(at(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new ho(this,e)}_makeRequest(e,n,a,r,i=!0){if(this._deleted)return new V_(SL());{let s=JM(e,this._appId,a,r,n,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(s),s.getPromise().then(()=>this._requests.delete(s),()=>this._requests.delete(s)),s}}async makeRequestWithTokens(e,n){let[a,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,a,r).getPromise()}},yL="@firebase/storage",_L="0.14.1";var OL="storage";function NL(t,e,n,a){return t=Oe(t),E2(t,e,n,a)}function ML(t){return t=Oe(t),w2(t)}function UL(t,e){return t=Oe(t),L2(t,e)}function sh(t=oi(),e){t=Oe(t);let a=Xn(t,OL).getImmediate({identifier:e}),r=Wf("storage");return r&&x2(a,...r),a}function x2(t,e,n,a={}){R2(t,e,n,a)}function k2(t,{instanceIdentifier:e}){let n=t.getProvider("app").getImmediate(),a=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new Ll(n,a,r,e,un)}function D2(){wn(new Ut(OL,k2,"PUBLIC").setMultipleInstances(!0)),Vt(yL,_L,""),Vt(yL,_L,"esm2020")}D2();var P2="firebase",O2="12.10.0";Vt(P2,O2,"app");function $L(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var JL=$L,ZL=new En("auth","Firebase",$L());var dh=new pa("@firebase/auth");function N2(t,...e){dh.logLevel<=se.WARN&&dh.warn(`Auth (${un}): ${t}`,...e)}function lh(t,...e){dh.logLevel<=se.ERROR&&dh.error(`Auth (${un}): ${t}`,...e)}function ji(t,...e){throw fI(t,...e)}function eR(t,...e){return fI(t,...e)}function tR(t,e,n){let a={...JL(),[e]:n};return new En("auth","Firebase",a).create(e,{appName:t.name})}function ch(t){return tR(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function fI(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return ZL.create(t,...e)}function ue(t,e,...n){if(!t)throw fI(e,...n)}function ga(t){let e="INTERNAL ASSERTION FAILED: "+t;throw lh(e),new Error(e)}function fh(t,e){t||ga(e)}function M2(){return VL()==="http:"||VL()==="https:"}function VL(){return typeof self<"u"&&self.location?.protocol||null}function U2(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(M2()||Xf()||"connection"in navigator)?navigator.onLine:!0}function V2(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var Q_=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,fh(n>e,"Short delay should be less than long delay!"),this.isMobile=Yf()||$f()}get(){return U2()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function F2(t,e){fh(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var hh=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ga("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ga("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ga("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var B2={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var q2=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],z2=new Q_(3e4,6e4);function ya(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function _a(t,e,n,a,r={}){return nR(t,r,async()=>{let i={},s={};a&&(e==="GET"?s=a:i={body:JSON.stringify(a)});let u=ha({key:t.config.apiKey,...s}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:l,...i};return Qf()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Qt(t.emulatorConfig.host)&&(c.credentials="include"),hh.fetch()(await aR(t,t.config.apiHost,n,u),c)})}async function nR(t,e,n){t._canInitEmulator=!1;let a={...B2,...e};try{let r=new X_(t),i=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let s=await i.json();if("needConfirmation"in s)throw oh(t,"account-exists-with-different-credential",s);if(i.ok&&!("errorMessage"in s))return s;{let u=i.ok?s.errorMessage:s.error.message,[l,c]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw oh(t,"credential-already-in-use",s);if(l==="EMAIL_EXISTS")throw oh(t,"email-already-in-use",s);if(l==="USER_DISABLED")throw oh(t,"user-disabled",s);let f=a[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw tR(t,f,c);ji(t,f)}}catch(r){if(r instanceof bt)throw r;ji(t,"network-request-failed",{message:String(r)})}}async function Ah(t,e,n,a,r={}){let i=await _a(t,e,n,a,r);return"mfaPendingCredential"in i&&ji(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function aR(t,e,n,a){let r=`${e}${n}?${a}`,i=t,s=i.config.emulator?F2(t.config,r):`${t.config.apiScheme}://${r}`;return q2.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(s).toString():s}function H2(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var X_=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(eR(this.auth,"network-request-failed")),z2.get())})}};function oh(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=eR(t,e,a);return r.customData._tokenResponse=n,r}function FL(t){return t!==void 0&&t.enterprise!==void 0}var $_=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return H2(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function G2(t,e){return _a(t,"GET","/v2/recaptchaConfig",ya(t,e))}async function j2(t,e){return _a(t,"POST","/v1/accounts:delete",e)}async function ph(t,e){return _a(t,"POST","/v1/accounts:lookup",e)}function xl(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function rR(t,e=!1){let n=Oe(t),a=await n.getIdToken(e),r=iR(a);ue(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let i=typeof r.firebase=="object"?r.firebase:void 0,s=i?.sign_in_provider;return{claims:r,token:a,authTime:xl(W_(r.auth_time)),issuedAtTime:xl(W_(r.iat)),expirationTime:xl(W_(r.exp)),signInProvider:s||null,signInSecondFactor:i?.sign_in_second_factor||null}}function W_(t){return Number(t)*1e3}function iR(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return lh("JWT malformed, contained fewer than 3 sections"),null;try{let r=co(n);return r?JSON.parse(r):(lh("Failed to decode base64 JWT payload"),null)}catch(r){return lh("Caught error parsing JWT payload as JSON",r?.toString()),null}}function BL(t){let e=iR(t);return ue(e,"internal-error"),ue(typeof e.exp<"u","internal-error"),ue(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function J_(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof bt&&W2(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function W2({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var Z_=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var Dl=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=xl(this.lastLoginAt),this.creationTime=xl(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function mh(t){let e=t.auth,n=await t.getIdToken(),a=await J_(t,ph(e,{idToken:n}));ue(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let i=r.providerUserInfo?.length?oR(r.providerUserInfo):[],s=K2(t.providerData,i),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!s?.length,c=u?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new Dl(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function sR(t){let e=Oe(t);await mh(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function K2(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function oR(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function Y2(t,e){let n=await nR(t,{},async()=>{let a=ha({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=t.config,s=await aR(t,r,"/v1/token",`key=${i}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:a};return t.emulatorConfig&&Qt(t.emulatorConfig.host)&&(l.credentials="include"),hh.fetch()(s,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Q2(t,e){return _a(t,"POST","/v2/accounts:revokeToken",ya(t,e))}var kl=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ue(e.idToken,"internal-error"),ue(typeof e.idToken<"u","internal-error"),ue(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):BL(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ue(e.length!==0,"internal-error");let n=BL(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ue(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:i}=await Y2(e,n);this.updateTokensAndExpiration(a,r,Number(i))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:i}=n,s=new t;return a&&(ue(typeof a=="string","internal-error",{appName:e}),s.refreshToken=a),r&&(ue(typeof r=="string","internal-error",{appName:e}),s.accessToken=r),i&&(ue(typeof i=="number","internal-error",{appName:e}),s.expirationTime=i),s}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return ga("not implemented")}};function ui(t,e){ue(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var Hi=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new Z_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Dl(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await J_(this,this.stsTokenManager.getToken(this.auth,e));return ue(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return rR(this,e)}reload(){return sR(this)}_assign(e){this!==e&&(ue(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){ue(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await mh(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(at(this.auth.app))return Promise.reject(ch(this.auth));let e=await this.getIdToken();return await J_(this,j2(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,i=n.phoneNumber??void 0,s=n.photoURL??void 0,u=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:m,emailVerified:p,isAnonymous:I,providerData:b,stsTokenManager:x}=n;ue(m&&x,e,"internal-error");let D=kl.fromJSON(this.name,x);ue(typeof m=="string",e,"internal-error"),ui(a,e.name),ui(r,e.name),ue(typeof p=="boolean",e,"internal-error"),ue(typeof I=="boolean",e,"internal-error"),ui(i,e.name),ui(s,e.name),ui(u,e.name),ui(l,e.name),ui(c,e.name),ui(f,e.name);let v=new t({uid:m,auth:e,email:r,emailVerified:p,displayName:a,isAnonymous:I,photoURL:s,phoneNumber:i,tenantId:u,stsTokenManager:D,createdAt:c,lastLoginAt:f});return b&&Array.isArray(b)&&(v.providerData=b.map(S=>({...S}))),l&&(v._redirectEventId=l),v}static async _fromIdTokenResponse(e,n,a=!1){let r=new kl;r.updateFromServerResponse(n);let i=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await mh(i),i}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];ue(r.localId!==void 0,"internal-error");let i=r.providerUserInfo!==void 0?oR(r.providerUserInfo):[],s=!(r.email&&r.passwordHash)&&!i?.length,u=new kl;u.updateFromIdToken(a);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:s}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new Dl(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!i?.length};return Object.assign(l,c),l}};var qL=new Map;function Gi(t){fh(t instanceof Function,"Expected a class definition");let e=qL.get(t);return e?(fh(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,qL.set(t,e),e)}var gh=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};gh.type="NONE";var eI=gh;function K_(t,e,n){return`firebase:${t}:${e}:${n}`}var yh=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:i}=this.auth;this.fullUserKey=K_(this.userKey,r.apiKey,i),this.fullPersistenceKey=K_("persistence",r.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await ph(this.auth,{idToken:e}).catch(()=>{});return n?Hi._fromGetAccountInfoResponse(this.auth,n,e):null}return Hi._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(Gi(eI),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),i=r[0]||Gi(eI),s=K_(a,e.config.apiKey,e.name),u=null;for(let c of n)try{let f=await c._get(s);if(f){let m;if(typeof f=="string"){let p=await ph(e,{idToken:f}).catch(()=>{});if(!p)break;m=await Hi._fromGetAccountInfoResponse(e,p,f)}else m=Hi._fromJSON(e,f);c!==i&&(u=m),i=c;break}}catch{}let l=r.filter(c=>c._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new t(i,e,a):(i=l[0],u&&await i._set(s,u.toJSON()),await Promise.all(n.map(async c=>{if(c!==i)try{await c._remove(s)}catch{}})),new t(i,e,a))}};function zL(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Z2(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(X2(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(tU(e))return"Blackberry";if(nU(e))return"Webos";if($2(e))return"Safari";if((e.includes("chrome/")||J2(e))&&!e.includes("edge/"))return"Chrome";if(eU(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function X2(t=xe()){return/firefox\//i.test(t)}function $2(t=xe()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function J2(t=xe()){return/crios\//i.test(t)}function Z2(t=xe()){return/iemobile/i.test(t)}function eU(t=xe()){return/android/i.test(t)}function tU(t=xe()){return/blackberry/i.test(t)}function nU(t=xe()){return/webos/i.test(t)}function uR(t,e=[]){let n;switch(t){case"Browser":n=zL(xe());break;case"Worker":n=`${zL(xe())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${un}/${a}`}var tI=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=i=>new Promise((s,u)=>{try{let l=e(i);s(l)}catch(l){u(l)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function aU(t,e={}){return _a(t,"GET","/v2/passwordPolicy",ya(t,e))}var rU=6,nI=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??rU,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}};var aI=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new _h(this),this.idTokenSubscription=new _h(this),this.beforeStateQueue=new tI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=ZL,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Gi(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await yh.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await ph(this,{idToken:e}),a=await Hi._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(at(this.app)){let i=this.app.settings.authIdToken;return i?new Promise(s=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(i).then(s,s))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let i=this.redirectUser?._redirectEventId,s=a?._redirectEventId,u=await this.tryRedirectSignIn(e);(!i||i===s)&&u?.user&&(a=u.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(i){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(i))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return ue(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await mh(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=V2()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(at(this.app))return Promise.reject(ch(this));let n=e?Oe(e):null;return n&&ue(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ue(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return at(this.app)?Promise.reject(ch(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return at(this.app)?Promise.reject(ch(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Gi(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await aU(this),n=new nI(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new En("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await Q2(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&Gi(e)||this._popupRedirectResolver;ue(n,this,"argument-error"),this.redirectPersistenceManager=await yh.create(this,[Gi(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let i=typeof n=="function"?n:n.next.bind(n),s=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(ue(u,this,"internal-error"),u.then(()=>{s||i(this.currentUser)}),typeof n=="function"){let l=e.addObserver(n,a,r);return()=>{s=!0,l()}}else{let l=e.addObserver(n);return()=>{s=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ue(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=uR(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(at(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&N2(`Error while retrieving App Check token: ${e.error}`),e?.token}};function hI(t){return Oe(t)}var _h=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=Jf(n=>this.observer=n)}get next(){return ue(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var lR={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function iU(t){return lR.loadJS(t)}function sU(){return lR.recaptchaEnterpriseScript}var rI=class{constructor(){this.enterprise=new iI}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},iI=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var oU="recaptcha-enterprise",cR="NO_RECAPTCHA",sI=class{constructor(e){this.type=oU,this.auth=hI(e)}async verify(e="verify",n=!1){async function a(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(s,u)=>{G2(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let c=new $_(l);return i.tenantId==null?i._agentRecaptchaConfig=c:i._tenantRecaptchaConfigs[i.tenantId]=c,s(c.siteKey)}}).catch(l=>{u(l)})})}function r(i,s,u){let l=window.grecaptcha;FL(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(c=>{s(c)}).catch(()=>{s(cR)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new rI().execute("siteKey",{action:"verify"}):new Promise((i,s)=>{a(this.auth).then(u=>{if(!n&&FL(window.grecaptcha))r(u,i,s);else{if(typeof window>"u"){s(new Error("RecaptchaVerifier is only supported in browser"));return}let l=sU();l.length!==0&&(l+=u),iU(l).then(()=>{r(u,i,s)}).catch(c=>{s(c)})}}).catch(u=>{s(u)})})}};async function Rl(t,e,n,a=!1,r=!1){let i=new sI(t),s;if(r)s=cR;else try{s=await i.verify(n)}catch{s=await i.verify(n,!0)}let u={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,c=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return a?Object.assign(u,{captchaResp:s}):Object.assign(u,{captchaResponse:s}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function HL(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let i=await Rl(t,e,n,n==="getOobCode");return a(t,i)}else return a(t,e).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let s=await Rl(t,e,n,n==="getOobCode");return a(t,s)}else return Promise.reject(i)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let i=await Rl(t,e,n);return a(t,i).catch(async s=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(s.code==="auth/missing-recaptcha-token"||s.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let u=await Rl(t,e,n,!1,!0);return a(t,u)}return Promise.reject(s)})}else{let i=await Rl(t,e,n,!1,!0);return a(t,i)}else return Promise.reject(r+" provider is not supported.")}function pI(t,e){let n=Xn(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),i=n.getOptions();if(Xt(i,e??{}))return r;ji(r,"already-initialized")}return n.initialize({options:e})}function uU(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(Gi);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function mI(t,e,n){let a=hI(t);ue(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,i=dR(e),{host:s,port:u}=lU(e),l=u===null?"":`:${u}`,c={url:`${i}//${s}${l}/`},f=Object.freeze({host:s,port:u,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){ue(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),ue(Xt(c,a.config.emulator)&&Xt(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Qt(s)?(ri(`${i}//${s}${l}`),ii("Auth",!0)):r||cU()}function dR(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function lU(t){let e=dR(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let i=r[1];return{host:i,port:GL(a.substr(i.length+1))}}else{let[i,s]=a.split(":");return{host:i,port:GL(s)}}}function GL(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function cU(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var Pl=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return ga("not implemented")}_getIdTokenResponse(e){return ga("not implemented")}_linkToIdToken(e,n){return ga("not implemented")}_getReauthenticationResolver(e){return ga("not implemented")}};async function dU(t,e){return _a(t,"POST","/v1/accounts:signUp",e)}async function fU(t,e){return Ah(t,"POST","/v1/accounts:signInWithPassword",ya(t,e))}async function hU(t,e){return Ah(t,"POST","/v1/accounts:signInWithEmailLink",ya(t,e))}async function pU(t,e){return Ah(t,"POST","/v1/accounts:signInWithEmailLink",ya(t,e))}var Ol=class t extends Pl{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return HL(e,n,"signInWithPassword",fU,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return hU(e,{email:this._email,oobCode:this._password});default:ji(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return HL(e,a,"signUpPassword",dU,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return pU(e,{idToken:n,email:this._email,oobCode:this._password});default:ji(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function Y_(t,e){return Ah(t,"POST","/v1/accounts:signInWithIdp",ya(t,e))}var mU="http://localhost",Wi=class t extends Pl{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):ji("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...i}=n;if(!a||!r)return null;let s=new t(a,r);return s.idToken=i.idToken||void 0,s.accessToken=i.accessToken||void 0,s.secret=i.secret,s.nonce=i.nonce,s.pendingToken=i.pendingToken||null,s}_getIdTokenResponse(e){let n=this.buildRequest();return Y_(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,Y_(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,Y_(e,n)}buildRequest(){let e={requestUri:mU,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=ha(n)}return e}};function gU(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function yU(t){let e=Bn(qn(t)).link,n=e?Bn(qn(e)).deep_link_id:null,a=Bn(qn(t)).deep_link_id;return(a?Bn(qn(a)).link:null)||a||n||e||t}var Ih=class t{constructor(e){let n=Bn(qn(e)),a=n.apiKey??null,r=n.oobCode??null,i=gU(n.mode??null);ue(a&&r&&i,"argument-error"),this.apiKey=a,this.operation=i,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=yU(e);try{return new t(n)}catch{return null}}};var po=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return Ol._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=Ih.parseLink(n);return ue(a,"argument-error"),Ol._fromEmailAndCode(e,a.code,a.tenantId)}};po.PROVIDER_ID="password";po.EMAIL_PASSWORD_SIGN_IN_METHOD="password";po.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var oI=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var mo=class extends oI{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var Nl=class t extends mo{constructor(){super("facebook.com")}static credential(e){return Wi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Nl.FACEBOOK_SIGN_IN_METHOD="facebook.com";Nl.PROVIDER_ID="facebook.com";var Ml=class t extends mo{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Wi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};Ml.GOOGLE_SIGN_IN_METHOD="google.com";Ml.PROVIDER_ID="google.com";var Ul=class t extends mo{constructor(){super("github.com")}static credential(e){return Wi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Ul.GITHUB_SIGN_IN_METHOD="github.com";Ul.PROVIDER_ID="github.com";var Vl=class t extends mo{constructor(){super("twitter.com")}static credential(e,n){return Wi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};Vl.TWITTER_SIGN_IN_METHOD="twitter.com";Vl.PROVIDER_ID="twitter.com";function _U(t,e){return _a(t,"POST","/v2/accounts/mfaEnrollment:start",ya(t,e))}function IU(t,e){return _a(t,"POST","/v2/accounts/mfaEnrollment:finalize",ya(t,e))}var jL="__sak";function TU(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var Th=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:i}=n.data,s=this.handlersMap[r];if(!s?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let u=Array.from(s).map(async c=>c(n.origin,i)),l=await TU(u);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Th.receivers=[];function SU(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var uI=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,s;return new Promise((u,l)=>{let c=SU("",20);r.port1.start();let f=setTimeout(()=>{l(new Error("unsupported_event"))},a);s={messageChannel:r,onMessage(m){let p=m;if(p.data.eventId===c)switch(p.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),u(p.data.response);break;default:clearTimeout(f),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(s),r.port1.addEventListener("message",s.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{s&&this.removeMessageHandler(s)})}};function WL(){return window}function fR(){return typeof WL().WorkerGlobalScope<"u"&&typeof WL().importScripts=="function"}async function vU(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function EU(){return navigator?.serviceWorker?.controller||null}function wU(){return fR()?self:null}var hR="firebaseLocalStorageDb",CU=1,Sh="firebaseLocalStorage",pR="fbase_key",Ki=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function bh(t,e){return t.transaction([Sh],e?"readwrite":"readonly").objectStore(Sh)}function AU(){let t=indexedDB.deleteDatabase(hR);return new Ki(t).toPromise()}function lI(){let t=indexedDB.open(hR,CU);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Sh,{keyPath:pR})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Sh)?e(a):(a.close(),await AU(),e(await lI()))})})}async function KL(t,e,n){let a=bh(t,!0).put({[pR]:e,value:n});return new Ki(a).toPromise()}async function bU(t,e){let n=bh(t,!1).get(e),a=await new Ki(n).toPromise();return a===void 0?null:a.value}function YL(t,e){let n=bh(t,!0).delete(e);return new Ki(n).toPromise()}var LU=800,RU=3,vh=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await lI(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>RU)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return fR()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Th._getInstance(wU()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await vU(),!this.activeServiceWorker)return;this.sender=new uI(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||EU()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await lI();return await KL(e,jL,"1"),await YL(e,jL),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>KL(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>bU(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>YL(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let i=bh(r,!1).getAll();return new Ki(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:i}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),LU)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};vh.type="LOCAL";var gI=vh;function xU(t,e){return _a(t,"POST","/v2/accounts/mfaSignIn:finalize",ya(t,e))}var cI=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return ga("unexpected MultiFactorSessionType")}}},Eh=class{static assertionForEnrollment(e,n){return wh._fromSecret(e,n)}static assertionForSignIn(e,n){return wh._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;ue(typeof n.user?.auth<"u","internal-error");let a=await _U(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return Ch._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Eh.FACTOR_ID="totp";var wh=class t extends cI{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return ue(typeof this.secret<"u",e,"argument-error"),IU(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){ue(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return xU(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},Ch=class t{constructor(e,n,a,r,i,s,u){this.sessionInfo=s,this.auth=u,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=i}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(uh(e)||uh(n))&&(a=!0),a&&(uh(e)&&(e=this.auth.currentUser?.email||"unknownuser"),uh(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function uh(t){return typeof t>"u"||t?.length===0}var QL="@firebase/auth",XL="1.12.1";var dI=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ue(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function kU(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function mR(t){wn(new Ut("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:s,authDomain:u}=a.options;ue(s&&!s.includes(":"),"invalid-api-key",{appName:a.name});let l={apiKey:s,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:uR(t)},c=new aI(a,r,i,l);return uU(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),wn(new Ut("auth-internal",e=>{let n=hI(e.getProvider("auth").getImmediate());return(a=>new dI(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Vt(QL,XL,kU(t)),Vt(QL,XL,"esm2020")}function gR(t=oi()){let e=Xn(t,"auth");if(e.isInitialized())return e.getImmediate();let n=pI(t,{persistence:[gI]}),a=vl("auth");return a&&mI(n,`http://${a}`),n}mR("WebExtension");var yR=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},_R={};var nr,yI;(function(){var t;function e(T,g){function _(){}_.prototype=g.prototype,T.F=g.prototype,T.prototype=new _,T.prototype.constructor=T,T.D=function(E,C,L){for(var w=Array(arguments.length-2),Te=2;Te<arguments.length;Te++)w[Te-2]=arguments[Te];return g.prototype[C].apply(E,w)}}function n(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(a,n),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(T,g,_){_||(_=0);let E=Array(16);if(typeof g=="string")for(var C=0;C<16;++C)E[C]=g.charCodeAt(_++)|g.charCodeAt(_++)<<8|g.charCodeAt(_++)<<16|g.charCodeAt(_++)<<24;else for(C=0;C<16;++C)E[C]=g[_++]|g[_++]<<8|g[_++]<<16|g[_++]<<24;g=T.g[0],_=T.g[1],C=T.g[2];let L=T.g[3],w;w=g+(L^_&(C^L))+E[0]+3614090360&4294967295,g=_+(w<<7&4294967295|w>>>25),w=L+(C^g&(_^C))+E[1]+3905402710&4294967295,L=g+(w<<12&4294967295|w>>>20),w=C+(_^L&(g^_))+E[2]+606105819&4294967295,C=L+(w<<17&4294967295|w>>>15),w=_+(g^C&(L^g))+E[3]+3250441966&4294967295,_=C+(w<<22&4294967295|w>>>10),w=g+(L^_&(C^L))+E[4]+4118548399&4294967295,g=_+(w<<7&4294967295|w>>>25),w=L+(C^g&(_^C))+E[5]+1200080426&4294967295,L=g+(w<<12&4294967295|w>>>20),w=C+(_^L&(g^_))+E[6]+2821735955&4294967295,C=L+(w<<17&4294967295|w>>>15),w=_+(g^C&(L^g))+E[7]+4249261313&4294967295,_=C+(w<<22&4294967295|w>>>10),w=g+(L^_&(C^L))+E[8]+1770035416&4294967295,g=_+(w<<7&4294967295|w>>>25),w=L+(C^g&(_^C))+E[9]+2336552879&4294967295,L=g+(w<<12&4294967295|w>>>20),w=C+(_^L&(g^_))+E[10]+4294925233&4294967295,C=L+(w<<17&4294967295|w>>>15),w=_+(g^C&(L^g))+E[11]+2304563134&4294967295,_=C+(w<<22&4294967295|w>>>10),w=g+(L^_&(C^L))+E[12]+1804603682&4294967295,g=_+(w<<7&4294967295|w>>>25),w=L+(C^g&(_^C))+E[13]+4254626195&4294967295,L=g+(w<<12&4294967295|w>>>20),w=C+(_^L&(g^_))+E[14]+2792965006&4294967295,C=L+(w<<17&4294967295|w>>>15),w=_+(g^C&(L^g))+E[15]+1236535329&4294967295,_=C+(w<<22&4294967295|w>>>10),w=g+(C^L&(_^C))+E[1]+4129170786&4294967295,g=_+(w<<5&4294967295|w>>>27),w=L+(_^C&(g^_))+E[6]+3225465664&4294967295,L=g+(w<<9&4294967295|w>>>23),w=C+(g^_&(L^g))+E[11]+643717713&4294967295,C=L+(w<<14&4294967295|w>>>18),w=_+(L^g&(C^L))+E[0]+3921069994&4294967295,_=C+(w<<20&4294967295|w>>>12),w=g+(C^L&(_^C))+E[5]+3593408605&4294967295,g=_+(w<<5&4294967295|w>>>27),w=L+(_^C&(g^_))+E[10]+38016083&4294967295,L=g+(w<<9&4294967295|w>>>23),w=C+(g^_&(L^g))+E[15]+3634488961&4294967295,C=L+(w<<14&4294967295|w>>>18),w=_+(L^g&(C^L))+E[4]+3889429448&4294967295,_=C+(w<<20&4294967295|w>>>12),w=g+(C^L&(_^C))+E[9]+568446438&4294967295,g=_+(w<<5&4294967295|w>>>27),w=L+(_^C&(g^_))+E[14]+3275163606&4294967295,L=g+(w<<9&4294967295|w>>>23),w=C+(g^_&(L^g))+E[3]+4107603335&4294967295,C=L+(w<<14&4294967295|w>>>18),w=_+(L^g&(C^L))+E[8]+1163531501&4294967295,_=C+(w<<20&4294967295|w>>>12),w=g+(C^L&(_^C))+E[13]+2850285829&4294967295,g=_+(w<<5&4294967295|w>>>27),w=L+(_^C&(g^_))+E[2]+4243563512&4294967295,L=g+(w<<9&4294967295|w>>>23),w=C+(g^_&(L^g))+E[7]+1735328473&4294967295,C=L+(w<<14&4294967295|w>>>18),w=_+(L^g&(C^L))+E[12]+2368359562&4294967295,_=C+(w<<20&4294967295|w>>>12),w=g+(_^C^L)+E[5]+4294588738&4294967295,g=_+(w<<4&4294967295|w>>>28),w=L+(g^_^C)+E[8]+2272392833&4294967295,L=g+(w<<11&4294967295|w>>>21),w=C+(L^g^_)+E[11]+1839030562&4294967295,C=L+(w<<16&4294967295|w>>>16),w=_+(C^L^g)+E[14]+4259657740&4294967295,_=C+(w<<23&4294967295|w>>>9),w=g+(_^C^L)+E[1]+2763975236&4294967295,g=_+(w<<4&4294967295|w>>>28),w=L+(g^_^C)+E[4]+1272893353&4294967295,L=g+(w<<11&4294967295|w>>>21),w=C+(L^g^_)+E[7]+4139469664&4294967295,C=L+(w<<16&4294967295|w>>>16),w=_+(C^L^g)+E[10]+3200236656&4294967295,_=C+(w<<23&4294967295|w>>>9),w=g+(_^C^L)+E[13]+681279174&4294967295,g=_+(w<<4&4294967295|w>>>28),w=L+(g^_^C)+E[0]+3936430074&4294967295,L=g+(w<<11&4294967295|w>>>21),w=C+(L^g^_)+E[3]+3572445317&4294967295,C=L+(w<<16&4294967295|w>>>16),w=_+(C^L^g)+E[6]+76029189&4294967295,_=C+(w<<23&4294967295|w>>>9),w=g+(_^C^L)+E[9]+3654602809&4294967295,g=_+(w<<4&4294967295|w>>>28),w=L+(g^_^C)+E[12]+3873151461&4294967295,L=g+(w<<11&4294967295|w>>>21),w=C+(L^g^_)+E[15]+530742520&4294967295,C=L+(w<<16&4294967295|w>>>16),w=_+(C^L^g)+E[2]+3299628645&4294967295,_=C+(w<<23&4294967295|w>>>9),w=g+(C^(_|~L))+E[0]+4096336452&4294967295,g=_+(w<<6&4294967295|w>>>26),w=L+(_^(g|~C))+E[7]+1126891415&4294967295,L=g+(w<<10&4294967295|w>>>22),w=C+(g^(L|~_))+E[14]+2878612391&4294967295,C=L+(w<<15&4294967295|w>>>17),w=_+(L^(C|~g))+E[5]+4237533241&4294967295,_=C+(w<<21&4294967295|w>>>11),w=g+(C^(_|~L))+E[12]+1700485571&4294967295,g=_+(w<<6&4294967295|w>>>26),w=L+(_^(g|~C))+E[3]+2399980690&4294967295,L=g+(w<<10&4294967295|w>>>22),w=C+(g^(L|~_))+E[10]+4293915773&4294967295,C=L+(w<<15&4294967295|w>>>17),w=_+(L^(C|~g))+E[1]+2240044497&4294967295,_=C+(w<<21&4294967295|w>>>11),w=g+(C^(_|~L))+E[8]+1873313359&4294967295,g=_+(w<<6&4294967295|w>>>26),w=L+(_^(g|~C))+E[15]+4264355552&4294967295,L=g+(w<<10&4294967295|w>>>22),w=C+(g^(L|~_))+E[6]+2734768916&4294967295,C=L+(w<<15&4294967295|w>>>17),w=_+(L^(C|~g))+E[13]+1309151649&4294967295,_=C+(w<<21&4294967295|w>>>11),w=g+(C^(_|~L))+E[4]+4149444226&4294967295,g=_+(w<<6&4294967295|w>>>26),w=L+(_^(g|~C))+E[11]+3174756917&4294967295,L=g+(w<<10&4294967295|w>>>22),w=C+(g^(L|~_))+E[2]+718787259&4294967295,C=L+(w<<15&4294967295|w>>>17),w=_+(L^(C|~g))+E[9]+3951481745&4294967295,T.g[0]=T.g[0]+g&4294967295,T.g[1]=T.g[1]+(C+(w<<21&4294967295|w>>>11))&4294967295,T.g[2]=T.g[2]+C&4294967295,T.g[3]=T.g[3]+L&4294967295}a.prototype.v=function(T,g){g===void 0&&(g=T.length);let _=g-this.blockSize,E=this.C,C=this.h,L=0;for(;L<g;){if(C==0)for(;L<=_;)r(this,T,L),L+=this.blockSize;if(typeof T=="string"){for(;L<g;)if(E[C++]=T.charCodeAt(L++),C==this.blockSize){r(this,E),C=0;break}}else for(;L<g;)if(E[C++]=T[L++],C==this.blockSize){r(this,E),C=0;break}}this.h=C,this.o+=g},a.prototype.A=function(){var T=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);T[0]=128;for(var g=1;g<T.length-8;++g)T[g]=0;g=this.o*8;for(var _=T.length-8;_<T.length;++_)T[_]=g&255,g/=256;for(this.v(T),T=Array(16),g=0,_=0;_<4;++_)for(let E=0;E<32;E+=8)T[g++]=this.g[_]>>>E&255;return T};function i(T,g){var _=u;return Object.prototype.hasOwnProperty.call(_,T)?_[T]:_[T]=g(T)}function s(T,g){this.h=g;let _=[],E=!0;for(let C=T.length-1;C>=0;C--){let L=T[C]|0;E&&L==g||(_[C]=L,E=!1)}this.g=_}var u={};function l(T){return-128<=T&&T<128?i(T,function(g){return new s([g|0],g<0?-1:0)}):new s([T|0],T<0?-1:0)}function c(T){if(isNaN(T)||!isFinite(T))return m;if(T<0)return D(c(-T));let g=[],_=1;for(let E=0;T>=_;E++)g[E]=T/_|0,_*=4294967296;return new s(g,0)}function f(T,g){if(T.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(T.charAt(0)=="-")return D(f(T.substring(1),g));if(T.indexOf("-")>=0)throw Error('number format error: interior "-" character');let _=c(Math.pow(g,8)),E=m;for(let L=0;L<T.length;L+=8){var C=Math.min(8,T.length-L);let w=parseInt(T.substring(L,L+C),g);C<8?(C=c(Math.pow(g,C)),E=E.j(C).add(c(w))):(E=E.j(_),E=E.add(c(w)))}return E}var m=l(0),p=l(1),I=l(16777216);t=s.prototype,t.m=function(){if(x(this))return-D(this).m();let T=0,g=1;for(let _=0;_<this.g.length;_++){let E=this.i(_);T+=(E>=0?E:4294967296+E)*g,g*=4294967296}return T},t.toString=function(T){if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(b(this))return"0";if(x(this))return"-"+D(this).toString(T);let g=c(Math.pow(T,6));var _=this;let E="";for(;;){let C=R(_,g).g;_=v(_,C.j(g));let L=((_.g.length>0?_.g[0]:_.h)>>>0).toString(T);if(_=C,b(_))return L+E;for(;L.length<6;)L="0"+L;E=L+E}},t.i=function(T){return T<0?0:T<this.g.length?this.g[T]:this.h};function b(T){if(T.h!=0)return!1;for(let g=0;g<T.g.length;g++)if(T.g[g]!=0)return!1;return!0}function x(T){return T.h==-1}t.l=function(T){return T=v(this,T),x(T)?-1:b(T)?0:1};function D(T){let g=T.g.length,_=[];for(let E=0;E<g;E++)_[E]=~T.g[E];return new s(_,~T.h).add(p)}t.abs=function(){return x(this)?D(this):this},t.add=function(T){let g=Math.max(this.g.length,T.g.length),_=[],E=0;for(let C=0;C<=g;C++){let L=E+(this.i(C)&65535)+(T.i(C)&65535),w=(L>>>16)+(this.i(C)>>>16)+(T.i(C)>>>16);E=w>>>16,L&=65535,w&=65535,_[C]=w<<16|L}return new s(_,_[_.length-1]&-2147483648?-1:0)};function v(T,g){return T.add(D(g))}t.j=function(T){if(b(this)||b(T))return m;if(x(this))return x(T)?D(this).j(D(T)):D(D(this).j(T));if(x(T))return D(this.j(D(T)));if(this.l(I)<0&&T.l(I)<0)return c(this.m()*T.m());let g=this.g.length+T.g.length,_=[];for(var E=0;E<2*g;E++)_[E]=0;for(E=0;E<this.g.length;E++)for(let C=0;C<T.g.length;C++){let L=this.i(E)>>>16,w=this.i(E)&65535,Te=T.i(C)>>>16,Se=T.i(C)&65535;_[2*E+2*C]+=w*Se,S(_,2*E+2*C),_[2*E+2*C+1]+=L*Se,S(_,2*E+2*C+1),_[2*E+2*C+1]+=w*Te,S(_,2*E+2*C+1),_[2*E+2*C+2]+=L*Te,S(_,2*E+2*C+2)}for(T=0;T<g;T++)_[T]=_[2*T+1]<<16|_[2*T];for(T=g;T<2*g;T++)_[T]=0;return new s(_,0)};function S(T,g){for(;(T[g]&65535)!=T[g];)T[g+1]+=T[g]>>>16,T[g]&=65535,g++}function A(T,g){this.g=T,this.h=g}function R(T,g){if(b(g))throw Error("division by zero");if(b(T))return new A(m,m);if(x(T))return g=R(D(T),g),new A(D(g.g),D(g.h));if(x(g))return g=R(T,D(g)),new A(D(g.g),g.h);if(T.g.length>30){if(x(T)||x(g))throw Error("slowDivide_ only works with positive integers.");for(var _=p,E=g;E.l(T)<=0;)_=q(_),E=q(E);var C=V(_,1),L=V(E,1);for(E=V(E,2),_=V(_,2);!b(E);){var w=L.add(E);w.l(T)<=0&&(C=C.add(_),L=w),E=V(E,1),_=V(_,1)}return g=v(T,C.j(g)),new A(C,g)}for(C=m;T.l(g)>=0;){for(_=Math.max(1,Math.floor(T.m()/g.m())),E=Math.ceil(Math.log(_)/Math.LN2),E=E<=48?1:Math.pow(2,E-48),L=c(_),w=L.j(g);x(w)||w.l(T)>0;)_-=E,L=c(_),w=L.j(g);b(L)&&(L=p),C=C.add(L),T=v(T,w)}return new A(C,T)}t.B=function(T){return R(this,T).h},t.and=function(T){let g=Math.max(this.g.length,T.g.length),_=[];for(let E=0;E<g;E++)_[E]=this.i(E)&T.i(E);return new s(_,this.h&T.h)},t.or=function(T){let g=Math.max(this.g.length,T.g.length),_=[];for(let E=0;E<g;E++)_[E]=this.i(E)|T.i(E);return new s(_,this.h|T.h)},t.xor=function(T){let g=Math.max(this.g.length,T.g.length),_=[];for(let E=0;E<g;E++)_[E]=this.i(E)^T.i(E);return new s(_,this.h^T.h)};function q(T){let g=T.g.length+1,_=[];for(let E=0;E<g;E++)_[E]=T.i(E)<<1|T.i(E-1)>>>31;return new s(_,T.h)}function V(T,g){let _=g>>5;g%=32;let E=T.g.length-_,C=[];for(let L=0;L<E;L++)C[L]=g>0?T.i(L+_)>>>g|T.i(L+_+1)<<32-g:T.i(L+_);return new s(C,T.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,yI=_R.Md5=a,s.prototype.add=s.prototype.add,s.prototype.multiply=s.prototype.j,s.prototype.modulo=s.prototype.B,s.prototype.compare=s.prototype.l,s.prototype.toNumber=s.prototype.m,s.prototype.toString=s.prototype.toString,s.prototype.getBits=s.prototype.i,s.fromNumber=c,s.fromString=f,nr=_R.Integer=s}).apply(typeof yR<"u"?yR:typeof self<"u"?self:typeof window<"u"?window:{});var Lh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},ar={};var _I,DU,go,II,Fl,Rh,TI,SI,vI;(function(){var t,e=Object.defineProperty;function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Lh=="object"&&Lh];for(var d=0;d<o.length;++d){var h=o[d];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var a=n(this);function r(o,d){if(d)e:{var h=a;o=o.split(".");for(var y=0;y<o.length-1;y++){var k=o[y];if(!(k in h))break e;h=h[k]}o=o[o.length-1],y=h[o],d=d(y),d!=y&&d!=null&&e(h,o,{configurable:!0,writable:!0,value:d})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(d){var h=[],y;for(y in d)Object.prototype.hasOwnProperty.call(d,y)&&h.push([y,d[y]]);return h}});var i=i||{},s=this||self;function u(o){var d=typeof o;return d=="object"&&o!=null||d=="function"}function l(o,d,h){return o.call.apply(o.bind,arguments)}function c(o,d,h){return c=l,c.apply(null,arguments)}function f(o,d){var h=Array.prototype.slice.call(arguments,1);return function(){var y=h.slice();return y.push.apply(y,arguments),o.apply(this,y)}}function m(o,d){function h(){}h.prototype=d.prototype,o.Z=d.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(y,k,P){for(var z=Array(arguments.length-2),oe=2;oe<arguments.length;oe++)z[oe-2]=arguments[oe];return d.prototype[k].apply(y,z)}}var p=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function I(o){let d=o.length;if(d>0){let h=Array(d);for(let y=0;y<d;y++)h[y]=o[y];return h}return[]}function b(o,d){for(let y=1;y<arguments.length;y++){let k=arguments[y];var h=typeof k;if(h=h!="object"?h:k?Array.isArray(k)?"array":h:"null",h=="array"||h=="object"&&typeof k.length=="number"){h=o.length||0;let P=k.length||0;o.length=h+P;for(let z=0;z<P;z++)o[h+z]=k[z]}else o.push(k)}}class x{constructor(d,h){this.i=d,this.j=h,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function D(o){s.setTimeout(()=>{throw o},0)}function v(){var o=T;let d=null;return o.g&&(d=o.g,o.g=o.g.next,o.g||(o.h=null),d.next=null),d}class S{constructor(){this.h=this.g=null}add(d,h){let y=A.get();y.set(d,h),this.h?this.h.next=y:this.g=y,this.h=y}}var A=new x(()=>new R,o=>o.reset());class R{constructor(){this.next=this.g=this.h=null}set(d,h){this.h=d,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let q,V=!1,T=new S,g=()=>{let o=Promise.resolve(void 0);q=()=>{o.then(_)}};function _(){for(var o;o=v();){try{o.h.call(o.g)}catch(h){D(h)}var d=A;d.j(o),d.h<100&&(d.h++,o.next=d.g,d.g=o)}V=!1}function E(){this.u=this.u,this.C=this.C}E.prototype.u=!1,E.prototype.dispose=function(){this.u||(this.u=!0,this.N())},E.prototype[Symbol.dispose]=function(){this.dispose()},E.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function C(o,d){this.type=o,this.g=this.target=d,this.defaultPrevented=!1}C.prototype.h=function(){this.defaultPrevented=!0};var L=function(){if(!s.addEventListener||!Object.defineProperty)return!1;var o=!1,d=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let h=()=>{};s.addEventListener("test",h,d),s.removeEventListener("test",h,d)}catch{}return o}();function w(o){return/^[\s\xa0]*$/.test(o)}function Te(o,d){C.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,d)}m(Te,C),Te.prototype.init=function(o,d){let h=this.type=o.type,y=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=d,d=o.relatedTarget,d||(h=="mouseover"?d=o.fromElement:h=="mouseout"&&(d=o.toElement)),this.relatedTarget=d,y?(this.clientX=y.clientX!==void 0?y.clientX:y.pageX,this.clientY=y.clientY!==void 0?y.clientY:y.pageY,this.screenX=y.screenX||0,this.screenY=y.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&Te.Z.h.call(this)},Te.prototype.h=function(){Te.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Se="closure_listenable_"+(Math.random()*1e6|0),An=0;function N(o,d,h,y,k){this.listener=o,this.proxy=null,this.src=d,this.type=h,this.capture=!!y,this.ha=k,this.key=++An,this.da=this.fa=!1}function O(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function U(o,d,h){for(let y in o)d.call(h,o[y],y,o)}function Y(o,d){for(let h in o)d.call(void 0,o[h],h,o)}function W(o){let d={};for(let h in o)d[h]=o[h];return d}let Z="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function le(o,d){let h,y;for(let k=1;k<arguments.length;k++){y=arguments[k];for(h in y)o[h]=y[h];for(let P=0;P<Z.length;P++)h=Z[P],Object.prototype.hasOwnProperty.call(y,h)&&(o[h]=y[h])}}function _e(o){this.src=o,this.g={},this.h=0}_e.prototype.add=function(o,d,h,y,k){let P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);let z=We(o,d,y,k);return z>-1?(d=o[z],h||(d.fa=!1)):(d=new N(d,this.src,P,!!y,k),d.fa=h,o.push(d)),d};function je(o,d){let h=d.type;if(h in o.g){var y=o.g[h],k=Array.prototype.indexOf.call(y,d,void 0),P;(P=k>=0)&&Array.prototype.splice.call(y,k,1),P&&(O(d),o.g[h].length==0&&(delete o.g[h],o.h--))}}function We(o,d,h,y){for(let k=0;k<o.length;++k){let P=o[k];if(!P.da&&P.listener==d&&P.capture==!!h&&P.ha==y)return k}return-1}var xa="closure_lm_"+(Math.random()*1e6|0),$t={};function Jt(o,d,h,y,k){if(y&&y.once)return eu(o,d,h,y,k);if(Array.isArray(d)){for(let P=0;P<d.length;P++)Jt(o,d[P],h,y,k);return null}return h=gi(h),o&&o[Se]?o.J(d,h,u(y)?!!y.capture:!!y,k):Zo(o,d,h,!1,y,k)}function Zo(o,d,h,y,k,P){if(!d)throw Error("Invalid event type");let z=u(k)?!!k.capture:!!k,oe=na(o);if(oe||(o[xa]=oe=new _e(o)),h=oe.add(d,h,y,z,P),h.proxy)return h;if(y=gm(),h.proxy=y,y.src=o,y.listener=h,o.addEventListener)L||(k=z),k===void 0&&(k=!1),o.addEventListener(d.toString(),y,k);else if(o.attachEvent)o.attachEvent(fs(d.toString()),y);else if(o.addListener&&o.removeListener)o.addListener(y);else throw Error("addEventListener and attachEvent are unavailable.");return h}function gm(){function o(h){return d.call(o.src,o.listener,h)}let d=Tr;return o}function eu(o,d,h,y,k){if(Array.isArray(d)){for(let P=0;P<d.length;P++)eu(o,d[P],h,y,k);return null}return h=gi(h),o&&o[Se]?o.K(d,h,u(y)?!!y.capture:!!y,k):Zo(o,d,h,!0,y,k)}function Qc(o,d,h,y,k){if(Array.isArray(d))for(var P=0;P<d.length;P++)Qc(o,d[P],h,y,k);else y=u(y)?!!y.capture:!!y,h=gi(h),o&&o[Se]?(o=o.i,P=String(d).toString(),P in o.g&&(d=o.g[P],h=We(d,h,y,k),h>-1&&(O(d[h]),Array.prototype.splice.call(d,h,1),d.length==0&&(delete o.g[P],o.h--)))):o&&(o=na(o))&&(d=o.g[d.toString()],o=-1,d&&(o=We(d,h,y,k)),(h=o>-1?d[o]:null)&&Ir(h))}function Ir(o){if(typeof o!="number"&&o&&!o.da){var d=o.src;if(d&&d[Se])je(d.i,o);else{var h=o.type,y=o.proxy;d.removeEventListener?d.removeEventListener(h,y,o.capture):d.detachEvent?d.detachEvent(fs(h),y):d.addListener&&d.removeListener&&d.removeListener(y),(h=na(d))?(je(h,o),h.h==0&&(h.src=null,d[xa]=null)):O(o)}}}function fs(o){return o in $t?$t[o]:$t[o]="on"+o}function Tr(o,d){if(o.da)o=!0;else{d=new Te(d,this);let h=o.listener,y=o.ha||o.src;o.fa&&Ir(o),o=h.call(y,d)}return o}function na(o){return o=o[xa],o instanceof _e?o:null}var ka="__closure_events_fn_"+(Math.random()*1e9>>>0);function gi(o){return typeof o=="function"?o:(o[ka]||(o[ka]=function(d){return o.handleEvent(d)}),o[ka])}function et(){E.call(this),this.i=new _e(this),this.M=this,this.G=null}m(et,E),et.prototype[Se]=!0,et.prototype.removeEventListener=function(o,d,h,y){Qc(this,o,d,h,y)};function St(o,d){var h,y=o.G;if(y)for(h=[];y;y=y.G)h.push(y);if(o=o.M,y=d.type||d,typeof d=="string")d=new C(d,o);else if(d instanceof C)d.target=d.target||o;else{var k=d;d=new C(y,o),le(d,k)}k=!0;let P,z;if(h)for(z=h.length-1;z>=0;z--)P=d.g=h[z],k=jn(P,y,!0,d)&&k;if(P=d.g=o,k=jn(P,y,!0,d)&&k,k=jn(P,y,!1,d)&&k,h)for(z=0;z<h.length;z++)P=d.g=h[z],k=jn(P,y,!1,d)&&k}et.prototype.N=function(){if(et.Z.N.call(this),this.i){var o=this.i;for(let d in o.g){let h=o.g[d];for(let y=0;y<h.length;y++)O(h[y]);delete o.g[d],o.h--}}this.G=null},et.prototype.J=function(o,d,h,y){return this.i.add(String(o),d,!1,h,y)},et.prototype.K=function(o,d,h,y){return this.i.add(String(o),d,!0,h,y)};function jn(o,d,h,y){if(d=o.i.g[String(d)],!d)return!0;d=d.concat();let k=!0;for(let P=0;P<d.length;++P){let z=d[P];if(z&&!z.da&&z.capture==h){let oe=z.listener,gt=z.ha||z.src;z.fa&&je(o.i,z),k=oe.call(gt,y)!==!1&&k}}return k&&!y.defaultPrevented}function Xc(o,d){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=c(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:s.setTimeout(o,d||0)}function tu(o){o.g=Xc(()=>{o.g=null,o.i&&(o.i=!1,tu(o))},o.l);let d=o.h;o.h=null,o.m.apply(null,d)}class jt extends E{constructor(d,h){super(),this.m=d,this.l=h,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:tu(this)}N(){super.N(),this.g&&(s.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Da(o){E.call(this),this.h=o,this.g={}}m(Da,E);var hs=[];function ps(o){U(o.g,function(d,h){this.g.hasOwnProperty(h)&&Ir(d)},o),o.g={}}Da.prototype.N=function(){Da.Z.N.call(this),ps(this)},Da.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Pa=s.JSON.stringify,nu=s.JSON.parse,$c=class{stringify(o){return s.JSON.stringify(o,void 0)}parse(o){return s.JSON.parse(o,void 0)}};function au(){}function ru(){}var Sr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function cn(){C.call(this,"d")}m(cn,C);function dn(){C.call(this,"c")}m(dn,C);var Zt={},iu=null;function Oa(){return iu=iu||new et}Zt.Ia="serverreachability";function su(o){C.call(this,Zt.Ia,o)}m(su,C);function vr(o){let d=Oa();St(d,new su(d))}Zt.STAT_EVENT="statevent";function ou(o,d){C.call(this,Zt.STAT_EVENT,o),this.stat=d}m(ou,C);function vt(o){let d=Oa();St(d,new ou(d,o))}Zt.Ja="timingevent";function uu(o,d){C.call(this,Zt.Ja,o),this.size=d}m(uu,C);function aa(o,d){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return s.setTimeout(function(){o()},d)}function Er(){this.g=!0}Er.prototype.ua=function(){this.g=!1};function Jc(o,d,h,y,k,P){o.info(function(){if(o.g)if(P){var z="",oe=P.split("&");for(let ke=0;ke<oe.length;ke++){var gt=oe[ke].split("=");if(gt.length>1){let Et=gt[0];gt=gt[1];let ia=Et.split("_");z=ia.length>=2&&ia[1]=="type"?z+(Et+"="+gt+"&"):z+(Et+"=redacted&")}}}else z=null;else z=P;return"XMLHTTP REQ ("+y+") [attempt "+k+"]: "+d+`
`+h+`
`+z})}function Zc(o,d,h,y,k,P,z){o.info(function(){return"XMLHTTP RESP ("+y+") [ attempt "+k+"]: "+d+`
`+h+`
`+P+" "+z})}function bn(o,d,h,y){o.info(function(){return"XMLHTTP TEXT ("+d+"): "+ym(o,h)+(y?" "+y:"")})}function ed(o,d){o.info(function(){return"TIMEOUT: "+d})}Er.prototype.info=function(){};function ym(o,d){if(!o.g)return d;if(!d)return null;try{let P=JSON.parse(d);if(P){for(o=0;o<P.length;o++)if(Array.isArray(P[o])){var h=P[o];if(!(h.length<2)){var y=h[1];if(Array.isArray(y)&&!(y.length<1)){var k=y[0];if(k!="noop"&&k!="stop"&&k!="close")for(let z=1;z<y.length;z++)y[z]=""}}}}return Pa(P)}catch{return d}}var wr={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},td={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},nd;function j(){}m(j,au),j.prototype.g=function(){return new XMLHttpRequest},nd=new j;function $(o){return encodeURIComponent(String(o))}function Q(o){var d=1;o=o.split(":");let h=[];for(;d>0&&o.length;)h.push(o.shift()),d--;return o.length&&h.push(o.join(":")),h}function ne(o,d,h,y){this.j=o,this.i=d,this.l=h,this.S=y||1,this.V=new Da(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new we}function we(){this.i=null,this.g="",this.h=!1}var Ye={},mt={};function Ln(o,d,h){o.M=1,o.A=rd(ra(d)),o.u=h,o.R=!0,ms(o,null)}function ms(o,d){o.F=Date.now(),ad(o),o.B=ra(o.A);var h=o.B,y=o.S;Array.isArray(y)||(y=[String(y)]),Dv(h.i,"t",y),o.C=0,h=o.j.L,o.h=new we,o.g=Xv(o.j,h?d:null,!o.u),o.P>0&&(o.O=new jt(c(o.Y,o,o.g),o.P)),d=o.V,h=o.g,y=o.ba;var k="readystatechange";Array.isArray(k)||(k&&(hs[0]=k.toString()),k=hs);for(let P=0;P<k.length;P++){let z=Jt(h,k[P],y||d.handleEvent,!1,d.h||d);if(!z)break;d.g[z.key]=z}d=o.J?W(o.J):{},o.u?(o.v||(o.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,d)):(o.v="GET",o.g.ea(o.B,o.v,null,d)),vr(),Jc(o.i,o.v,o.B,o.l,o.S,o.u)}ne.prototype.ba=function(o){o=o.target;let d=this.O;d&&br(o)==3?d.j():this.Y(o)},ne.prototype.Y=function(o){try{if(o==this.g)e:{let oe=br(this.g),gt=this.g.ya(),ke=this.g.ca();if(!(oe<3)&&(oe!=3||this.g&&(this.h.h||this.g.la()||Fv(this.g)))){this.K||oe!=4||gt==7||(gt==8||ke<=0?vr(3):vr(2)),_m(this);var d=this.g.ca();this.X=d;var h=JD(this);if(this.o=d==200,Zc(this.i,this.v,this.B,this.l,this.S,oe,d),this.o){if(this.U&&!this.L){t:{if(this.g){var y,k=this.g;if((y=k.g?k.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!w(y)){var P=y;break t}}P=null}if(o=P)bn(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Im(this,o);else{this.o=!1,this.m=3,vt(12),yi(this),lu(this);break e}}if(this.R){o=!0;let Et;for(;!this.K&&this.C<h.length;)if(Et=ZD(this,h),Et==mt){oe==4&&(this.m=4,vt(14),o=!1),bn(this.i,this.l,null,"[Incomplete Response]");break}else if(Et==Ye){this.m=4,vt(15),bn(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else bn(this.i,this.l,Et,null),Im(this,Et);if(Tv(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),oe!=4||h.length!=0||this.h.h||(this.m=1,vt(16),o=!1),this.o=this.o&&o,!o)bn(this.i,this.l,h,"[Invalid Chunked Response]"),yi(this),lu(this);else if(h.length>0&&!this.W){this.W=!0;var z=this.j;z.g==this&&z.aa&&!z.P&&(z.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),Am(z),z.P=!0,vt(11))}}else bn(this.i,this.l,h,null),Im(this,h);oe==4&&yi(this),this.o&&!this.K&&(oe==4?Wv(this.j,this):(this.o=!1,ad(this)))}else hP(this.g),d==400&&h.indexOf("Unknown SID")>0?(this.m=3,vt(12)):(this.m=0,vt(13)),yi(this),lu(this)}}}catch{}finally{}};function JD(o){if(!Tv(o))return o.g.la();let d=Fv(o.g);if(d==="")return"";let h="",y=d.length,k=br(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return yi(o),lu(o),"";o.h.i=new s.TextDecoder}for(let P=0;P<y;P++)o.h.h=!0,h+=o.h.i.decode(d[P],{stream:!(k&&P==y-1)});return d.length=0,o.h.g+=h,o.C=0,o.h.g}function Tv(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function ZD(o,d){var h=o.C,y=d.indexOf(`
`,h);return y==-1?mt:(h=Number(d.substring(h,y)),isNaN(h)?Ye:(y+=1,y+h>d.length?mt:(d=d.slice(y,y+h),o.C=y+h,d)))}ne.prototype.cancel=function(){this.K=!0,yi(this)};function ad(o){o.T=Date.now()+o.H,Sv(o,o.H)}function Sv(o,d){if(o.D!=null)throw Error("WatchDog timer not null");o.D=aa(c(o.aa,o),d)}function _m(o){o.D&&(s.clearTimeout(o.D),o.D=null)}ne.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?(ed(this.i,this.B),this.M!=2&&(vr(),vt(17)),yi(this),this.m=2,lu(this)):Sv(this,this.T-o)};function lu(o){o.j.I==0||o.K||Wv(o.j,o)}function yi(o){_m(o);var d=o.O;d&&typeof d.dispose=="function"&&d.dispose(),o.O=null,ps(o.V),o.g&&(d=o.g,o.g=null,d.abort(),d.dispose())}function Im(o,d){try{var h=o.j;if(h.I!=0&&(h.g==o||Tm(h.h,o))){if(!o.L&&Tm(h.h,o)&&h.I==3){try{var y=h.Ba.g.parse(d)}catch{y=null}if(Array.isArray(y)&&y.length==3){var k=y;if(k[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)cd(h),ud(h);else break e;Cm(h),vt(18)}}else h.xa=k[1],0<h.xa-h.K&&k[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=aa(c(h.Va,h),6e3));wv(h.h)<=1&&h.ta&&(h.ta=void 0)}else Ii(h,11)}else if((o.L||h.g==o)&&cd(h),!w(d))for(k=h.Ba.g.parse(d),d=0;d<k.length;d++){let ke=k[d],Et=ke[0];if(!(Et<=h.K))if(h.K=Et,ke=ke[1],h.I==2)if(ke[0]=="c"){h.M=ke[1],h.ba=ke[2];let ia=ke[3];ia!=null&&(h.ka=ia,h.j.info("VER="+h.ka));let Ti=ke[4];Ti!=null&&(h.za=Ti,h.j.info("SVER="+h.za));let Lr=ke[5];Lr!=null&&typeof Lr=="number"&&Lr>0&&(y=1.5*Lr,h.O=y,h.j.info("backChannelRequestTimeoutMs_="+y)),y=h;let Rr=o.g;if(Rr){let fd=Rr.g?Rr.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(fd){var P=y.h;P.g||fd.indexOf("spdy")==-1&&fd.indexOf("quic")==-1&&fd.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(Sm(P,P.h),P.h=null))}if(y.G){let bm=Rr.g?Rr.g.getResponseHeader("X-HTTP-Session-Id"):null;bm&&(y.wa=bm,Ne(y.J,y.G,bm))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),y=h;var z=o;if(y.na=Qv(y,y.L?y.ba:null,y.W),z.L){Cv(y.h,z);var oe=z,gt=y.O;gt&&(oe.H=gt),oe.D&&(_m(oe),ad(oe)),y.g=z}else Gv(y);h.i.length>0&&ld(h)}else ke[0]!="stop"&&ke[0]!="close"||Ii(h,7);else h.I==3&&(ke[0]=="stop"||ke[0]=="close"?ke[0]=="stop"?Ii(h,7):wm(h):ke[0]!="noop"&&h.l&&h.l.qa(ke),h.A=0)}}vr(4)}catch{}}var eP=class{constructor(o,d){this.g=o,this.map=d}};function vv(o){this.l=o||10,s.PerformanceNavigationTiming?(o=s.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(s.chrome&&s.chrome.loadTimes&&s.chrome.loadTimes()&&s.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Ev(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function wv(o){return o.h?1:o.g?o.g.size:0}function Tm(o,d){return o.h?o.h==d:o.g?o.g.has(d):!1}function Sm(o,d){o.g?o.g.add(d):o.h=d}function Cv(o,d){o.h&&o.h==d?o.h=null:o.g&&o.g.has(d)&&o.g.delete(d)}vv.prototype.cancel=function(){if(this.i=Av(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function Av(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let d=o.i;for(let h of o.g.values())d=d.concat(h.G);return d}return I(o.i)}var bv=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function tP(o,d){if(o){o=o.split("&");for(let h=0;h<o.length;h++){let y=o[h].indexOf("="),k,P=null;y>=0?(k=o[h].substring(0,y),P=o[h].substring(y+1)):k=o[h],d(k,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function Cr(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;o instanceof Cr?(this.l=o.l,cu(this,o.j),this.o=o.o,this.g=o.g,du(this,o.u),this.h=o.h,vm(this,Pv(o.i)),this.m=o.m):o&&(d=String(o).match(bv))?(this.l=!1,cu(this,d[1]||"",!0),this.o=fu(d[2]||""),this.g=fu(d[3]||"",!0),du(this,d[4]),this.h=fu(d[5]||"",!0),vm(this,d[6]||"",!0),this.m=fu(d[7]||"")):(this.l=!1,this.i=new pu(null,this.l))}Cr.prototype.toString=function(){let o=[];var d=this.j;d&&o.push(hu(d,Lv,!0),":");var h=this.g;return(h||d=="file")&&(o.push("//"),(d=this.o)&&o.push(hu(d,Lv,!0),"@"),o.push($(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(hu(h,h.charAt(0)=="/"?rP:aP,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",hu(h,sP)),o.join("")},Cr.prototype.resolve=function(o){let d=ra(this),h=!!o.j;h?cu(d,o.j):h=!!o.o,h?d.o=o.o:h=!!o.g,h?d.g=o.g:h=o.u!=null;var y=o.h;if(h)du(d,o.u);else if(h=!!o.h){if(y.charAt(0)!="/")if(this.g&&!this.h)y="/"+y;else{var k=d.h.lastIndexOf("/");k!=-1&&(y=d.h.slice(0,k+1)+y)}if(k=y,k==".."||k==".")y="";else if(k.indexOf("./")!=-1||k.indexOf("/.")!=-1){y=k.lastIndexOf("/",0)==0,k=k.split("/");let P=[];for(let z=0;z<k.length;){let oe=k[z++];oe=="."?y&&z==k.length&&P.push(""):oe==".."?((P.length>1||P.length==1&&P[0]!="")&&P.pop(),y&&z==k.length&&P.push("")):(P.push(oe),y=!0)}y=P.join("/")}else y=k}return h?d.h=y:h=o.i.toString()!=="",h?vm(d,Pv(o.i)):h=!!o.m,h&&(d.m=o.m),d};function ra(o){return new Cr(o)}function cu(o,d,h){o.j=h?fu(d,!0):d,o.j&&(o.j=o.j.replace(/:$/,""))}function du(o,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);o.u=d}else o.u=null}function vm(o,d,h){d instanceof pu?(o.i=d,oP(o.i,o.l)):(h||(d=hu(d,iP)),o.i=new pu(d,o.l))}function Ne(o,d,h){o.i.set(d,h)}function rd(o){return Ne(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function fu(o,d){return o?d?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function hu(o,d,h){return typeof o=="string"?(o=encodeURI(o).replace(d,nP),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function nP(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Lv=/[#\/\?@]/g,aP=/[#\?:]/g,rP=/[#\?]/g,iP=/[#\?@]/g,sP=/#/g;function pu(o,d){this.h=this.g=null,this.i=o||null,this.j=!!d}function _i(o){o.g||(o.g=new Map,o.h=0,o.i&&tP(o.i,function(d,h){o.add(decodeURIComponent(d.replace(/\+/g," ")),h)}))}t=pu.prototype,t.add=function(o,d){_i(this),this.i=null,o=gs(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(d),this.h+=1,this};function Rv(o,d){_i(o),d=gs(o,d),o.g.has(d)&&(o.i=null,o.h-=o.g.get(d).length,o.g.delete(d))}function xv(o,d){return _i(o),d=gs(o,d),o.g.has(d)}t.forEach=function(o,d){_i(this),this.g.forEach(function(h,y){h.forEach(function(k){o.call(d,k,y,this)},this)},this)};function kv(o,d){_i(o);let h=[];if(typeof d=="string")xv(o,d)&&(h=h.concat(o.g.get(gs(o,d))));else for(o=Array.from(o.g.values()),d=0;d<o.length;d++)h=h.concat(o[d]);return h}t.set=function(o,d){return _i(this),this.i=null,o=gs(this,o),xv(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[d]),this.h+=1,this},t.get=function(o,d){return o?(o=kv(this,o),o.length>0?String(o[0]):d):d};function Dv(o,d,h){Rv(o,d),h.length>0&&(o.i=null,o.g.set(gs(o,d),I(h)),o.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],d=Array.from(this.g.keys());for(let y=0;y<d.length;y++){var h=d[y];let k=$(h);h=kv(this,h);for(let P=0;P<h.length;P++){let z=k;h[P]!==""&&(z+="="+$(h[P])),o.push(z)}}return this.i=o.join("&")};function Pv(o){let d=new pu;return d.i=o.i,o.g&&(d.g=new Map(o.g),d.h=o.h),d}function gs(o,d){return d=String(d),o.j&&(d=d.toLowerCase()),d}function oP(o,d){d&&!o.j&&(_i(o),o.i=null,o.g.forEach(function(h,y){let k=y.toLowerCase();y!=k&&(Rv(this,y),Dv(this,k,h))},o)),o.j=d}function uP(o,d){let h=new Er;if(s.Image){let y=new Image;y.onload=f(Ar,h,"TestLoadImage: loaded",!0,d,y),y.onerror=f(Ar,h,"TestLoadImage: error",!1,d,y),y.onabort=f(Ar,h,"TestLoadImage: abort",!1,d,y),y.ontimeout=f(Ar,h,"TestLoadImage: timeout",!1,d,y),s.setTimeout(function(){y.ontimeout&&y.ontimeout()},1e4),y.src=o}else d(!1)}function lP(o,d){let h=new Er,y=new AbortController,k=setTimeout(()=>{y.abort(),Ar(h,"TestPingServer: timeout",!1,d)},1e4);fetch(o,{signal:y.signal}).then(P=>{clearTimeout(k),P.ok?Ar(h,"TestPingServer: ok",!0,d):Ar(h,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(k),Ar(h,"TestPingServer: error",!1,d)})}function Ar(o,d,h,y,k){try{k&&(k.onload=null,k.onerror=null,k.onabort=null,k.ontimeout=null),y(h)}catch{}}function cP(){this.g=new $c}function id(o){this.i=o.Sb||null,this.h=o.ab||!1}m(id,au),id.prototype.g=function(){return new sd(this.i,this.h)};function sd(o,d){et.call(this),this.H=o,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(sd,et),t=sd.prototype,t.open=function(o,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=d,this.readyState=1,gu(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(d.body=o),(this.H||s).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,mu(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,gu(this)),this.g&&(this.readyState=3,gu(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof s.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Ov(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Ov(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var d=o.value?o.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!o.done}))&&(this.response=this.responseText+=d)}o.done?mu(this):gu(this),this.readyState==3&&Ov(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,mu(this))},t.Na=function(o){this.g&&(this.response=o,mu(this))},t.ga=function(){this.g&&mu(this)};function mu(o){o.readyState=4,o.l=null,o.j=null,o.B=null,gu(o)}t.setRequestHeader=function(o,d){this.A.append(o,d)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],d=this.h.entries();for(var h=d.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=d.next();return o.join(`\r
`)};function gu(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(sd.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Nv(o){let d="";return U(o,function(h,y){d+=y,d+=":",d+=h,d+=`\r
`}),d}function Em(o,d,h){e:{for(y in h){var y=!1;break e}y=!0}y||(h=Nv(h),typeof o=="string"?h!=null&&$(h):Ne(o,d,h))}function Qe(o){et.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(Qe,et);var dP=/^https?$/i,fP=["POST","PUT"];t=Qe.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,d,h,y){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);d=d?d.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():nd.g(),this.g.onreadystatechange=p(c(this.Ca,this));try{this.B=!0,this.g.open(d,String(o),!0),this.B=!1}catch(P){Mv(this,P);return}if(o=h||"",h=new Map(this.headers),y)if(Object.getPrototypeOf(y)===Object.prototype)for(var k in y)h.set(k,y[k]);else if(typeof y.keys=="function"&&typeof y.get=="function")for(let P of y.keys())h.set(P,y.get(P));else throw Error("Unknown input type for opt_headers: "+String(y));y=Array.from(h.keys()).find(P=>P.toLowerCase()=="content-type"),k=s.FormData&&o instanceof s.FormData,!(Array.prototype.indexOf.call(fP,d,void 0)>=0)||y||k||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[P,z]of h)this.g.setRequestHeader(P,z);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(P){Mv(this,P)}};function Mv(o,d){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=d,o.o=5,Uv(o),od(o)}function Uv(o){o.A||(o.A=!0,St(o,"complete"),St(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,St(this,"complete"),St(this,"abort"),od(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),od(this,!0)),Qe.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?Vv(this):this.Xa())},t.Xa=function(){Vv(this)};function Vv(o){if(o.h&&typeof i<"u"){if(o.v&&br(o)==4)setTimeout(o.Ca.bind(o),0);else if(St(o,"readystatechange"),br(o)==4){o.h=!1;try{let P=o.ca();e:switch(P){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var h;if(!(h=d)){var y;if(y=P===0){let z=String(o.D).match(bv)[1]||null;!z&&s.self&&s.self.location&&(z=s.self.location.protocol.slice(0,-1)),y=!dP.test(z?z.toLowerCase():"")}h=y}if(h)St(o,"complete"),St(o,"success");else{o.o=6;try{var k=br(o)>2?o.g.statusText:""}catch{k=""}o.l=k+" ["+o.ca()+"]",Uv(o)}}finally{od(o)}}}}function od(o,d){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let h=o.g;o.g=null,d||St(o,"ready");try{h.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function br(o){return o.g?o.g.readyState:0}t.ca=function(){try{return br(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var d=this.g.responseText;return o&&d.indexOf(o)==0&&(d=d.substring(o.length)),nu(d)}};function Fv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function hP(o){let d={};o=(o.g&&br(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let y=0;y<o.length;y++){if(w(o[y]))continue;var h=Q(o[y]);let k=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();let P=d[k]||[];d[k]=P,P.push(h)}Y(d,function(y){return y.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function yu(o,d,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||d}function Bv(o){this.za=0,this.i=[],this.j=new Er,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=yu("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=yu("baseRetryDelayMs",5e3,o),this.Za=yu("retryDelaySeedMs",1e4,o),this.Ta=yu("forwardChannelMaxRetries",2,o),this.va=yu("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new vv(o&&o.concurrentRequestLimit),this.Ba=new cP,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=Bv.prototype,t.ka=8,t.I=1,t.connect=function(o,d,h,y){vt(0),this.W=o,this.H=d||{},h&&y!==void 0&&(this.H.OSID=h,this.H.OAID=y),this.F=this.X,this.J=Qv(this,null,this.W),ld(this)};function wm(o){if(qv(o),o.I==3){var d=o.V++,h=ra(o.J);if(Ne(h,"SID",o.M),Ne(h,"RID",d),Ne(h,"TYPE","terminate"),_u(o,h),d=new ne(o,o.j,d),d.M=2,d.A=rd(ra(h)),h=!1,s.navigator&&s.navigator.sendBeacon)try{h=s.navigator.sendBeacon(d.A.toString(),"")}catch{}!h&&s.Image&&(new Image().src=d.A,h=!0),h||(d.g=Xv(d.j,null),d.g.ea(d.A)),d.F=Date.now(),ad(d)}Yv(o)}function ud(o){o.g&&(Am(o),o.g.cancel(),o.g=null)}function qv(o){ud(o),o.v&&(s.clearTimeout(o.v),o.v=null),cd(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&s.clearTimeout(o.m),o.m=null)}function ld(o){if(!Ev(o.h)&&!o.m){o.m=!0;var d=o.Ea;q||g(),V||(q(),V=!0),T.add(d,o),o.D=0}}function pP(o,d){return wv(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=d.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=aa(c(o.Ea,o,d),Kv(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let k=new ne(this,this.j,o),P=this.o;if(this.U&&(P?(P=W(P),le(P,this.U)):P=this.U),this.u!==null||this.R||(k.J=P,P=null),this.S)e:{for(var d=0,h=0;h<this.i.length;h++){t:{var y=this.i[h];if("__data__"in y.map&&(y=y.map.__data__,typeof y=="string")){y=y.length;break t}y=void 0}if(y===void 0)break;if(d+=y,d>4096){d=h;break e}if(d===4096||h===this.i.length-1){d=h+1;break e}}d=1e3}else d=1e3;d=Hv(this,k,d),h=ra(this.J),Ne(h,"RID",o),Ne(h,"CVER",22),this.G&&Ne(h,"X-HTTP-Session-Id",this.G),_u(this,h),P&&(this.R?d="headers="+$(Nv(P))+"&"+d:this.u&&Em(h,this.u,P)),Sm(this.h,k),this.Ra&&Ne(h,"TYPE","init"),this.S?(Ne(h,"$req",d),Ne(h,"SID","null"),k.U=!0,Ln(k,h,null)):Ln(k,h,d),this.I=2}}else this.I==3&&(o?zv(this,o):this.i.length==0||Ev(this.h)||zv(this))};function zv(o,d){var h;d?h=d.l:h=o.V++;let y=ra(o.J);Ne(y,"SID",o.M),Ne(y,"RID",h),Ne(y,"AID",o.K),_u(o,y),o.u&&o.o&&Em(y,o.u,o.o),h=new ne(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),d&&(o.i=d.G.concat(o.i)),d=Hv(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Sm(o.h,h),Ln(h,y,d)}function _u(o,d){o.H&&U(o.H,function(h,y){Ne(d,y,h)}),o.l&&U({},function(h,y){Ne(d,y,h)})}function Hv(o,d,h){h=Math.min(o.i.length,h);let y=o.l?c(o.l.Ka,o.l,o):null;e:{var k=o.i;let oe=-1;for(;;){let gt=["count="+h];oe==-1?h>0?(oe=k[0].g,gt.push("ofs="+oe)):oe=0:gt.push("ofs="+oe);let ke=!0;for(let Et=0;Et<h;Et++){var P=k[Et].g;let ia=k[Et].map;if(P-=oe,P<0)oe=Math.max(0,k[Et].g-100),ke=!1;else try{P="req"+P+"_"||"";try{var z=ia instanceof Map?ia:Object.entries(ia);for(let[Ti,Lr]of z){let Rr=Lr;u(Lr)&&(Rr=Pa(Lr)),gt.push(P+Ti+"="+encodeURIComponent(Rr))}}catch(Ti){throw gt.push(P+"type="+encodeURIComponent("_badmap")),Ti}}catch{y&&y(ia)}}if(ke){z=gt.join("&");break e}}z=void 0}return o=o.i.splice(0,h),d.G=o,z}function Gv(o){if(!o.g&&!o.v){o.Y=1;var d=o.Da;q||g(),V||(q(),V=!0),T.add(d,o),o.A=0}}function Cm(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=aa(c(o.Da,o),Kv(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,jv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=aa(c(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,vt(10),ud(this),jv(this))};function Am(o){o.B!=null&&(s.clearTimeout(o.B),o.B=null)}function jv(o){o.g=new ne(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var d=ra(o.na);Ne(d,"RID","rpc"),Ne(d,"SID",o.M),Ne(d,"AID",o.K),Ne(d,"CI",o.F?"0":"1"),!o.F&&o.ia&&Ne(d,"TO",o.ia),Ne(d,"TYPE","xmlhttp"),_u(o,d),o.u&&o.o&&Em(d,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=rd(ra(d)),h.u=null,h.R=!0,ms(h,o)}t.Va=function(){this.C!=null&&(this.C=null,ud(this),Cm(this),vt(19))};function cd(o){o.C!=null&&(s.clearTimeout(o.C),o.C=null)}function Wv(o,d){var h=null;if(o.g==d){cd(o),Am(o),o.g=null;var y=2}else if(Tm(o.h,d))h=d.G,Cv(o.h,d),y=1;else return;if(o.I!=0){if(d.o)if(y==1){h=d.u?d.u.length:0,d=Date.now()-d.F;var k=o.D;y=Oa(),St(y,new uu(y,h)),ld(o)}else Gv(o);else if(k=d.m,k==3||k==0&&d.X>0||!(y==1&&pP(o,d)||y==2&&Cm(o)))switch(h&&h.length>0&&(d=o.h,d.i=d.i.concat(h)),k){case 1:Ii(o,5);break;case 4:Ii(o,10);break;case 3:Ii(o,6);break;default:Ii(o,2)}}}function Kv(o,d){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*d}function Ii(o,d){if(o.j.info("Error code "+d),d==2){var h=c(o.bb,o),y=o.Ua;let k=!y;y=new Cr(y||"//www.google.com/images/cleardot.gif"),s.location&&s.location.protocol=="http"||cu(y,"https"),rd(y),k?uP(y.toString(),h):lP(y.toString(),h)}else vt(2);o.I=0,o.l&&o.l.pa(d),Yv(o),qv(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),vt(2)):(this.j.info("Failed to ping google.com"),vt(1))};function Yv(o){if(o.I=0,o.ja=[],o.l){let d=Av(o.h);(d.length!=0||o.i.length!=0)&&(b(o.ja,d),b(o.ja,o.i),o.h.i.length=0,I(o.i),o.i.length=0),o.l.oa()}}function Qv(o,d,h){var y=h instanceof Cr?ra(h):new Cr(h);if(y.g!="")d&&(y.g=d+"."+y.g),du(y,y.u);else{var k=s.location;y=k.protocol,d=d?d+"."+k.hostname:k.hostname,k=+k.port;let P=new Cr(null);y&&cu(P,y),d&&(P.g=d),k&&du(P,k),h&&(P.h=h),y=P}return h=o.G,d=o.wa,h&&d&&Ne(y,h,d),Ne(y,"VER",o.ka),_u(o,y),y}function Xv(o,d,h){if(d&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=o.Aa&&!o.ma?new Qe(new id({ab:h})):new Qe(o.ma),d.Fa(o.L),d}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function $v(){}t=$v.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function dd(){}dd.prototype.g=function(o,d){return new fn(o,d)};function fn(o,d){et.call(this),this.g=new Bv(d),this.l=o,this.h=d&&d.messageUrlParams||null,o=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(o?o["X-WebChannel-Content-Type"]=d.messageContentType:o={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(o?o["X-WebChannel-Client-Profile"]=d.sa:o={"X-WebChannel-Client-Profile":d.sa}),this.g.U=o,(o=d&&d.Qb)&&!w(o)&&(this.g.u=o),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!w(d)&&(this.g.G=d,o=this.h,o!==null&&d in o&&(o=this.h,d in o&&delete o[d])),this.j=new ys(this)}m(fn,et),fn.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},fn.prototype.close=function(){wm(this.g)},fn.prototype.o=function(o){var d=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=Pa(o),o=h);d.i.push(new eP(d.Ya++,o)),d.I==3&&ld(d)},fn.prototype.N=function(){this.g.l=null,delete this.j,wm(this.g),delete this.g,fn.Z.N.call(this)};function Jv(o){cn.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var d=o.__sm__;if(d){e:{for(let h in d){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,d=d!==null&&o in d?d[o]:void 0),this.data=d}else this.data=o}m(Jv,cn);function Zv(){dn.call(this),this.status=1}m(Zv,dn);function ys(o){this.g=o}m(ys,$v),ys.prototype.ra=function(){St(this.g,"a")},ys.prototype.qa=function(o){St(this.g,new Jv(o))},ys.prototype.pa=function(o){St(this.g,new Zv)},ys.prototype.oa=function(){St(this.g,"b")},dd.prototype.createWebChannel=dd.prototype.g,fn.prototype.send=fn.prototype.o,fn.prototype.open=fn.prototype.m,fn.prototype.close=fn.prototype.close,vI=ar.createWebChannelTransport=function(){return new dd},SI=ar.getStatEventTarget=function(){return Oa()},TI=ar.Event=Zt,Rh=ar.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},wr.NO_ERROR=0,wr.TIMEOUT=8,wr.HTTP_ERROR=6,Fl=ar.ErrorCode=wr,td.COMPLETE="complete",II=ar.EventType=td,ru.EventType=Sr,Sr.OPEN="a",Sr.CLOSE="b",Sr.ERROR="c",Sr.MESSAGE="d",et.prototype.listen=et.prototype.J,go=ar.WebChannel=ru,DU=ar.FetchXmlHttpFactory=id,Qe.prototype.listenOnce=Qe.prototype.K,Qe.prototype.getLastError=Qe.prototype.Ha,Qe.prototype.getLastErrorCode=Qe.prototype.ya,Qe.prototype.getStatus=Qe.prototype.ca,Qe.prototype.getResponseJson=Qe.prototype.La,Qe.prototype.getResponseText=Qe.prototype.la,Qe.prototype.send=Qe.prototype.ea,Qe.prototype.setWithCredentials=Qe.prototype.Fa,_I=ar.XhrIo=Qe}).apply(typeof Lh<"u"?Lh:typeof self<"u"?self:typeof window<"u"?window:{});var Lt=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};Lt.UNAUTHENTICATED=new Lt(null),Lt.GOOGLE_CREDENTIALS=new Lt("google-credentials-uid"),Lt.FIRST_PARTY=new Lt("first-party-uid"),Lt.MOCK_USER=new Lt("mock-user");var Fo="12.10.0";function rx(t){Fo=t}var Zi=new pa("@firebase/firestore");function yo(){return Zi.logLevel}function K(t,...e){if(Zi.logLevel<=se.DEBUG){let n=e.map(XT);Zi.debug(`Firestore (${Fo}): ${t}`,...n)}}function sr(t,...e){if(Zi.logLevel<=se.ERROR){let n=e.map(XT);Zi.error(`Firestore (${Fo}): ${t}`,...n)}}function or(t,...e){if(Zi.logLevel<=se.WARN){let n=e.map(XT);Zi.warn(`Firestore (${Fo}): ${t}`,...n)}}function XT(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}function te(t,e,n){let a="Unexpected state";typeof e=="string"?a=e:n=e,ix(t,a,n)}function ix(t,e,n){let a=`FIRESTORE (${Fo}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{a+=" CONTEXT: "+JSON.stringify(n)}catch{a+=" CONTEXT: "+n}throw sr(a),new Error(a)}function Ke(t,e,n,a){let r="Unexpected state";typeof n=="string"?r=n:a=n,t||ix(e,r,a)}function ye(t,e){return t}var F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},G=class extends bt{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var rr=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};var Nh=class{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Mh=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(Lt.UNAUTHENTICATED))}shutdown(){}},RI=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}},Uh=class{constructor(e){this.t=e,this.currentUser=Lt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){Ke(this.o===void 0,42304);let a=this.i,r=l=>this.i!==a?(a=this.i,n(l)):Promise.resolve(),i=new rr;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new rr,e.enqueueRetryable(()=>r(this.currentUser))};let s=()=>{let l=i;e.enqueueRetryable(async()=>{await l.promise,await r(this.currentUser)})},u=l=>{K("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),s())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){let l=this.t.getImmediate({optional:!0});l?u(l):(K("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new rr)}},0),s()}getToken(){let e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(a=>this.i!==e?(K("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):a?(Ke(typeof a.accessToken=="string",31837,{l:a}),new Nh(a.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return Ke(e===null||typeof e=="string",2055,{h:e}),new Lt(e)}},xI=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a,this.type="FirstParty",this.user=Lt.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},kI=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a}getToken(){return Promise.resolve(new xI(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(Lt.FIRST_PARTY))}shutdown(){}invalidateToken(){}},Vh=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},Fh=class{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,at(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){Ke(this.o===void 0,3512);let a=i=>{i.error!=null&&K("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);let s=i.token!==this.m;return this.m=i.token,K("FirebaseAppCheckTokenProvider",`Received ${s?"new":"existing"} token.`),s?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>a(i))};let r=i=>{K("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>r(i)),setTimeout(()=>{if(!this.appCheck){let i=this.V.getImmediate({optional:!0});i?r(i):K("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Vh(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(Ke(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Vh(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function PU(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let a=0;a<t;a++)n[a]=Math.floor(256*Math.random());return n}var Co=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516),a="";for(;a.length<20;){let r=PU(40);for(let i=0;i<r.length;++i)a.length<20&&r[i]<n&&(a+=e.charAt(r[i]%62))}return a}};function pe(t,e){return t<e?-1:t>e?1:0}function DI(t,e){let n=Math.min(t.length,e.length);for(let a=0;a<n;a++){let r=t.charAt(a),i=e.charAt(a);if(r!==i)return EI(r)===EI(i)?pe(r,i):EI(r)?1:-1}return pe(t.length,e.length)}var OU=55296,NU=57343;function EI(t){let e=t.charCodeAt(0);return e>=OU&&e<=NU}function Ao(t,e,n){return t.length===e.length&&t.every((a,r)=>n(a,e[r]))}var IR="__name__",Bh=class t{constructor(e,n,a){n===void 0?n=0:n>e.length&&te(637,{offset:n,range:e.length}),a===void 0?a=e.length-n:a>e.length-n&&te(1746,{length:a,range:e.length-n}),this.segments=e,this.offset=n,this.len=a}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let n=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(a=>{n.push(a)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,a=this.limit();n<a;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){let a=Math.min(e.length,n.length);for(let r=0;r<a;r++){let i=t.compareSegments(e.get(r),n.get(r));if(i!==0)return i}return pe(e.length,n.length)}static compareSegments(e,n){let a=t.isNumericId(e),r=t.isNumericId(n);return a&&!r?-1:!a&&r?1:a&&r?t.extractNumericId(e).compare(t.extractNumericId(n)):DI(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return nr.fromString(e.substring(4,e.length-2))}},He=class t extends Bh{construct(e,n,a){return new t(e,n,a)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let n=[];for(let a of e){if(a.indexOf("//")>=0)throw new G(F.INVALID_ARGUMENT,`Invalid segment (${a}). Paths must not contain // in them.`);n.push(...a.split("/").filter(r=>r.length>0))}return new t(n)}static emptyPath(){return new t([])}},MU=/^[_a-zA-Z][_a-zA-Z0-9]*$/,Cn=class t extends Bh{construct(e,n,a){return new t(e,n,a)}static isValidIdentifier(e){return MU.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===IR}static keyField(){return new t([IR])}static fromServerFormat(e){let n=[],a="",r=0,i=()=>{if(a.length===0)throw new G(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(a),a=""},s=!1;for(;r<e.length;){let u=e[r];if(u==="\\"){if(r+1===e.length)throw new G(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new G(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);a+=l,r+=2}else u==="`"?(s=!s,r++):u!=="."||s?(a+=u,r++):(i(),r++)}if(i(),s)throw new G(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(n)}static emptyPath(){return new t([])}};var J=class t{constructor(e){this.path=e}static fromPath(e){return new t(He.fromString(e))}static fromName(e){return new t(He.fromString(e).popFirst(5))}static empty(){return new t(He.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&He.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return He.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new He(e.slice()))}};function UU(t,e,n){if(!n)throw new G(F.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function sx(t,e,n,a){if(e===!0&&a===!0)throw new G(F.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function TR(t){if(J.isDocumentKey(t))throw new G(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function ox(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function lc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(a){return a.constructor?a.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":te(12329,{type:typeof t})}function cc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new G(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let n=lc(t);throw new G(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function ux(t,e){if(e<=0)throw new G(F.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function it(t,e){let n={typeString:t};return e&&(n.value=e),n}function Bo(t,e){if(!ox(t))throw new G(F.INVALID_ARGUMENT,"JSON must be an object");let n;for(let a in e)if(e[a]){let r=e[a].typeString,i="value"in e[a]?{value:e[a].value}:void 0;if(!(a in t)){n=`JSON missing required field: '${a}'`;break}let s=t[a];if(r&&typeof s!==r){n=`JSON field '${a}' must be a ${r}.`;break}if(i!==void 0&&s!==i.value){n=`Expected '${a}' field to equal '${i.value}'`;break}}if(n)throw new G(F.INVALID_ARGUMENT,n);return!0}var SR=-62135596800,vR=1e6,ht=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let n=Math.floor(e/1e3),a=Math.floor((e-1e3*n)*vR);return new t(n,a)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new G(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new G(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<SR)throw new G(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new G(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/vR}_compareTo(e){return this.seconds===e.seconds?pe(this.nanoseconds,e.nanoseconds):pe(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Bo(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-SR;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};ht._jsonSchemaVersion="firestore/timestamp/1.0",ht._jsonSchema={type:it("string",ht._jsonSchemaVersion),seconds:it("number"),nanoseconds:it("number")};var ie=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new ht(0,0))}static max(){return new t(new ht(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var jl=-1,qh=class{constructor(e,n,a,r){this.indexId=e,this.collectionGroup=n,this.fields=a,this.indexState=r}};qh.UNKNOWN_ID=-1;function VU(t,e){let n=t.toTimestamp().seconds,a=t.toTimestamp().nanoseconds+1,r=ie.fromTimestamp(a===1e9?new ht(n+1,0):new ht(n,a));return new es(r,J.empty(),e)}function FU(t){return new es(t.readTime,t.key,jl)}var es=class t{constructor(e,n,a){this.readTime=e,this.documentKey=n,this.largestBatchId=a}static min(){return new t(ie.min(),J.empty(),jl)}static max(){return new t(ie.max(),J.empty(),jl)}};function BU(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=J.comparator(t.documentKey,e.documentKey),n!==0?n:pe(t.largestBatchId,e.largestBatchId))}var qU="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",PI=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function fp(t){if(t.code!==F.FAILED_PRECONDITION||t.message!==qU)throw t;K("LocalStore","Unexpectedly lost primary lease")}var B=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&te(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new t((a,r)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(a,r)},this.catchCallback=i=>{this.wrapFailure(n,i).next(a,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{let n=e();return n instanceof t?n:t.resolve(n)}catch(n){return t.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):t.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):t.reject(n)}static resolve(e){return new t((n,a)=>{n(e)})}static reject(e){return new t((n,a)=>{a(e)})}static waitFor(e){return new t((n,a)=>{let r=0,i=0,s=!1;e.forEach(u=>{++r,u.next(()=>{++i,s&&i===r&&n()},l=>a(l))}),s=!0,i===r&&n()})}static or(e){let n=t.resolve(!1);for(let a of e)n=n.next(r=>r?t.resolve(r):a());return n}static forEach(e,n){let a=[];return e.forEach((r,i)=>{a.push(n.call(this,r,i))}),this.waitFor(a)}static mapArray(e,n){return new t((a,r)=>{let i=e.length,s=new Array(i),u=0;for(let l=0;l<i;l++){let c=l;n(e[c]).next(f=>{s[c]=f,++u,u===i&&a(s)},f=>r(f))}})}static doWhile(e,n){return new t((a,r)=>{let i=()=>{e()===!0?n().next(()=>{i()},r):a()};i()})}};function zU(t){let e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function qo(t){return t.name==="IndexedDbTransactionError"}var bo=class{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=a=>this.ae(a),this.ue=a=>n.writeSequenceNumber(a))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};bo.ce=-1;var HU=-1;function hp(t){return t==null}function Wl(t){return t===0&&1/t==-1/0}function GU(t){return typeof t=="number"&&Number.isInteger(t)&&!Wl(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var lx="";function jU(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=ER(e)),e=WU(t.get(n),e);return ER(e)}function WU(t,e){let n=e,a=t.length;for(let r=0;r<a;r++){let i=t.charAt(r);switch(i){case"\0":n+="";break;case lx:n+="";break;default:n+=i}}return n}function ER(t){return t+lx+""}var KU="remoteDocuments",cx="owner";var dx="mutationQueues";var fx="mutations";var hx="documentMutations",YU="remoteDocumentsV14";var px="remoteDocumentGlobal";var mx="targets";var gx="targetDocuments";var yx="targetGlobal",_x="collectionParents";var Ix="clientMetadata";var Tx="bundles";var Sx="namedQueries";var QU="indexConfiguration";var XU="indexState";var $U="indexEntries";var vx="documentOverlays";var JU="globals";var ZU=[dx,fx,hx,KU,mx,cx,yx,gx,Ix,px,_x,Tx,Sx],GH=[...ZU,vx],eV=[dx,fx,hx,YU,mx,cx,yx,gx,Ix,px,_x,Tx,Sx,vx],tV=eV,nV=[...tV,QU,XU,$U];var jH=[...nV,JU];function wR(t){let e=0;for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function zo(t,e){for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function Ex(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var st=class t{constructor(e,n){this.comparator=e,this.root=n||Ta.EMPTY}insert(e,n){return new t(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Ta.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ta.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){let a=this.comparator(e,n.key);if(a===0)return n.value;a<0?n=n.left:a>0&&(n=n.right)}return null}indexOf(e){let n=0,a=this.root;for(;!a.isEmpty();){let r=this.comparator(e,a.key);if(r===0)return n+a.left.size;r<0?a=a.left:(n+=a.left.size+1,a=a.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,a)=>(e(n,a),!1))}toString(){let e=[];return this.inorderTraversal((n,a)=>(e.push(`${n}:${a}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new So(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new So(this.root,e,this.comparator,!1)}getReverseIterator(){return new So(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new So(this.root,e,this.comparator,!0)}},So=class{constructor(e,n,a,r){this.isReverse=r,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?a(e.key,n):1,n&&r&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},Ta=class t{constructor(e,n,a,r,i){this.key=e,this.value=n,this.color=a??t.RED,this.left=r??t.EMPTY,this.right=i??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,a,r,i){return new t(e??this.key,n??this.value,a??this.color,r??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,a){let r=this,i=a(e,r.key);return r=i<0?r.copy(null,null,null,r.left.insert(e,n,a),null):i===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,a)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let a,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;a=r.right.min(),r=r.copy(a.key,a.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw te(43730,{key:this.key,value:this.value});if(this.right.isRed())throw te(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw te(27949);return e+(this.isRed()?0:1)}};Ta.EMPTY=null,Ta.RED=!0,Ta.BLACK=!1;Ta.EMPTY=new class{constructor(){this.size=0}get key(){throw te(57766)}get value(){throw te(16141)}get color(){throw te(16727)}get left(){throw te(29726)}get right(){throw te(36894)}copy(e,n,a,r,i){return this}insert(e,n,a){return new Ta(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var Rt=class t{constructor(e){this.comparator=e,this.data=new st(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,a)=>(e(n),!1))}forEachInRange(e,n){let a=this.data.getIteratorFrom(e[0]);for(;a.hasNext();){let r=a.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let a;for(a=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();a.hasNext();)if(!e(a.getNext().key))return}firstAfterOrEqual(e){let n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new zh(this.data.getIterator())}getIteratorFrom(e){return new zh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(a=>{n=n.add(a)}),n}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.data.getIterator(),a=e.data.getIterator();for(;n.hasNext();){let r=n.getNext().key,i=a.getNext().key;if(this.comparator(r,i)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(n=>{e.push(n)}),e}toString(){let e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){let n=new t(this.comparator);return n.data=e,n}},zh=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var Yi=class t{constructor(e){this.fields=e,e.sort(Cn.comparator)}static empty(){return new t([])}unionWith(e){let n=new Rt(Cn.comparator);for(let a of this.fields)n=n.add(a);for(let a of e)n=n.add(a);return new t(n.toArray())}covers(e){for(let n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return Ao(this.fields,e.fields,(n,a)=>n.isEqual(a))}};var Hh=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var Bt=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let n=function(r){try{return atob(r)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Hh("Invalid base64 string: "+i):i}}(e);return new t(n)}static fromUint8Array(e){let n=function(r){let i="";for(let s=0;s<r.length;++s)i+=String.fromCharCode(r[s]);return i}(e);return new t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return pe(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};Bt.EMPTY_BYTE_STRING=new Bt("");var aV=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ur(t){if(Ke(!!t,39018),typeof t=="string"){let e=0,n=aV.exec(t);if(Ke(!!n,46558,{timestamp:t}),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}let a=new Date(t);return{seconds:Math.floor(a.getTime()/1e3),nanos:e}}return{seconds:ze(t.seconds),nanos:ze(t.nanos)}}function ze(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function lr(t){return typeof t=="string"?Bt.fromBase64String(t):Bt.fromUint8Array(t)}var wx="server_timestamp",Cx="__type__",Ax="__previous_value__",bx="__local_write_time__";function dc(t){return(t?.mapValue?.fields||{})[Cx]?.stringValue===wx}function pp(t){let e=t.mapValue.fields[Ax];return dc(e)?pp(e):e}function Kl(t){let e=ur(t.mapValue.fields[bx].timestampValue);return new ht(e.seconds,e.nanos)}var OI=class{constructor(e,n,a,r,i,s,u,l,c,f,m){this.databaseId=e,this.appId=n,this.persistenceKey=a,this.host=r,this.ssl=i,this.forceLongPolling=s,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=c,this.isUsingEmulator=f,this.apiKey=m}},Gh="(default)",Yl=class t{constructor(e,n){this.projectId=e,this.database=n||Gh}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===Gh}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function Lx(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new G(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Yl(t.options.projectId,e)}var $T="__type__",Rx="__max__",xh={mapValue:{fields:{__type__:{stringValue:Rx}}}},JT="__vector__",Lo="value";function li(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?dc(t)?4:kx(t)?9007199254740991:xx(t)?10:11:te(28295,{value:t})}function wa(t,e){if(t===e)return!0;let n=li(t);if(n!==li(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Kl(t).isEqual(Kl(e));case 3:return function(r,i){if(typeof r.timestampValue=="string"&&typeof i.timestampValue=="string"&&r.timestampValue.length===i.timestampValue.length)return r.timestampValue===i.timestampValue;let s=ur(r.timestampValue),u=ur(i.timestampValue);return s.seconds===u.seconds&&s.nanos===u.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,i){return lr(r.bytesValue).isEqual(lr(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,i){return ze(r.geoPointValue.latitude)===ze(i.geoPointValue.latitude)&&ze(r.geoPointValue.longitude)===ze(i.geoPointValue.longitude)}(t,e);case 2:return function(r,i){if("integerValue"in r&&"integerValue"in i)return ze(r.integerValue)===ze(i.integerValue);if("doubleValue"in r&&"doubleValue"in i){let s=ze(r.doubleValue),u=ze(i.doubleValue);return s===u?Wl(s)===Wl(u):isNaN(s)&&isNaN(u)}return!1}(t,e);case 9:return Ao(t.arrayValue.values||[],e.arrayValue.values||[],wa);case 10:case 11:return function(r,i){let s=r.mapValue.fields||{},u=i.mapValue.fields||{};if(wR(s)!==wR(u))return!1;for(let l in s)if(s.hasOwnProperty(l)&&(u[l]===void 0||!wa(s[l],u[l])))return!1;return!0}(t,e);default:return te(52216,{left:t})}}function Ql(t,e){return(t.values||[]).find(n=>wa(n,e))!==void 0}function Ro(t,e){if(t===e)return 0;let n=li(t),a=li(e);if(n!==a)return pe(n,a);switch(n){case 0:case 9007199254740991:return 0;case 1:return pe(t.booleanValue,e.booleanValue);case 2:return function(i,s){let u=ze(i.integerValue||i.doubleValue),l=ze(s.integerValue||s.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(t,e);case 3:return CR(t.timestampValue,e.timestampValue);case 4:return CR(Kl(t),Kl(e));case 5:return DI(t.stringValue,e.stringValue);case 6:return function(i,s){let u=lr(i),l=lr(s);return u.compareTo(l)}(t.bytesValue,e.bytesValue);case 7:return function(i,s){let u=i.split("/"),l=s.split("/");for(let c=0;c<u.length&&c<l.length;c++){let f=pe(u[c],l[c]);if(f!==0)return f}return pe(u.length,l.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,s){let u=pe(ze(i.latitude),ze(s.latitude));return u!==0?u:pe(ze(i.longitude),ze(s.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return AR(t.arrayValue,e.arrayValue);case 10:return function(i,s){let u=i.fields||{},l=s.fields||{},c=u[Lo]?.arrayValue,f=l[Lo]?.arrayValue,m=pe(c?.values?.length||0,f?.values?.length||0);return m!==0?m:AR(c,f)}(t.mapValue,e.mapValue);case 11:return function(i,s){if(i===xh.mapValue&&s===xh.mapValue)return 0;if(i===xh.mapValue)return 1;if(s===xh.mapValue)return-1;let u=i.fields||{},l=Object.keys(u),c=s.fields||{},f=Object.keys(c);l.sort(),f.sort();for(let m=0;m<l.length&&m<f.length;++m){let p=DI(l[m],f[m]);if(p!==0)return p;let I=Ro(u[l[m]],c[f[m]]);if(I!==0)return I}return pe(l.length,f.length)}(t.mapValue,e.mapValue);default:throw te(23264,{he:n})}}function CR(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return pe(t,e);let n=ur(t),a=ur(e),r=pe(n.seconds,a.seconds);return r!==0?r:pe(n.nanos,a.nanos)}function AR(t,e){let n=t.values||[],a=e.values||[];for(let r=0;r<n.length&&r<a.length;++r){let i=Ro(n[r],a[r]);if(i)return i}return pe(n.length,a.length)}function xo(t){return NI(t)}function NI(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){let a=ur(n);return`time(${a.seconds},${a.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return lr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return J.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let a="[",r=!0;for(let i of n.values||[])r?r=!1:a+=",",a+=NI(i);return a+"]"}(t.arrayValue):"mapValue"in t?function(n){let a=Object.keys(n.fields||{}).sort(),r="{",i=!0;for(let s of a)i?i=!1:r+=",",r+=`${s}:${NI(n.fields[s])}`;return r+"}"}(t.mapValue):te(61005,{value:t})}function Ph(t){switch(li(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=pp(t);return e?16+Ph(e):16;case 5:return 2*t.stringValue.length;case 6:return lr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(a){return(a.values||[]).reduce((r,i)=>r+Ph(i),0)}(t.arrayValue);case 10:case 11:return function(a){let r=0;return zo(a.fields,(i,s)=>{r+=i.length+Ph(s)}),r}(t.mapValue);default:throw te(13486,{value:t})}}function fc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function MI(t){return!!t&&"integerValue"in t}function ZT(t){return!!t&&"arrayValue"in t}function bR(t){return!!t&&"nullValue"in t}function LR(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function wI(t){return!!t&&"mapValue"in t}function xx(t){return(t?.mapValue?.fields||{})[$T]?.stringValue===JT}function zl(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return zo(t.mapValue.fields,(n,a)=>e.mapValue.fields[n]=zl(a)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=zl(t.arrayValue.values[n]);return e}return{...t}}function kx(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===Rx}var KH={mapValue:{fields:{[$T]:{stringValue:JT},[Lo]:{arrayValue:{}}}}};var Ia=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let a=0;a<e.length-1;++a)if(n=(n.mapValue.fields||{})[e.get(a)],!wI(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=zl(n)}setAll(e){let n=Cn.emptyPath(),a={},r=[];e.forEach((s,u)=>{if(!n.isImmediateParentOf(u)){let l=this.getFieldsMap(n);this.applyChanges(l,a,r),a={},r=[],n=u.popLast()}s?a[u.lastSegment()]=zl(s):r.push(u.lastSegment())});let i=this.getFieldsMap(n);this.applyChanges(i,a,r)}delete(e){let n=this.field(e.popLast());wI(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return wa(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let a=0;a<e.length;++a){let r=n.mapValue.fields[e.get(a)];wI(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(a)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,a){zo(n,(r,i)=>e[r]=i);for(let r of a)delete e[r]}clone(){return new t(zl(this.value))}};var Zn=class t{constructor(e,n,a,r,i,s,u){this.key=e,this.documentType=n,this.version=a,this.readTime=r,this.createTime=i,this.data=s,this.documentState=u}static newInvalidDocument(e){return new t(e,0,ie.min(),ie.min(),ie.min(),Ia.empty(),0)}static newFoundDocument(e,n,a,r){return new t(e,1,n,ie.min(),a,r,0)}static newNoDocument(e,n){return new t(e,2,n,ie.min(),ie.min(),Ia.empty(),0)}static newUnknownDocument(e,n){return new t(e,3,n,ie.min(),ie.min(),Ia.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(ie.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ia.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ia.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=ie.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var cr=class{constructor(e,n){this.position=e,this.inclusive=n}};function RR(t,e,n){let a=0;for(let r=0;r<t.position.length;r++){let i=e[r],s=t.position[r];if(i.field.isKeyField()?a=J.comparator(J.fromName(s.referenceValue),n.key):a=Ro(s,n.data.field(i.field)),i.dir==="desc"&&(a*=-1),a!==0)break}return a}function xR(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!wa(t.position[n],e.position[n]))return!1;return!0}var ci=class{constructor(e,n="asc"){this.field=e,this.dir=n}};function rV(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var jh=class{},rt=class t extends jh{constructor(e,n,a){super(),this.field=e,this.op=n,this.value=a}static create(e,n,a){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,a):new VI(e,n,a):n==="array-contains"?new qI(e,a):n==="in"?new zI(e,a):n==="not-in"?new HI(e,a):n==="array-contains-any"?new GI(e,a):new t(e,n,a)}static createKeyFieldInFilter(e,n,a){return n==="in"?new FI(e,a):new BI(e,a)}matches(e){let n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(Ro(n,this.value)):n!==null&&li(this.value)===li(n)&&this.matchesComparison(Ro(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return te(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},Hn=class t extends jh{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new t(e,n)}matches(e){return Dx(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function Dx(t){return t.op==="and"}function Px(t){return iV(t)&&Dx(t)}function iV(t){for(let e of t.filters)if(e instanceof Hn)return!1;return!0}function UI(t){if(t instanceof rt)return t.field.canonicalString()+t.op.toString()+xo(t.value);if(Px(t))return t.filters.map(e=>UI(e)).join(",");{let e=t.filters.map(n=>UI(n)).join(",");return`${t.op}(${e})`}}function Ox(t,e){return t instanceof rt?function(a,r){return r instanceof rt&&a.op===r.op&&a.field.isEqual(r.field)&&wa(a.value,r.value)}(t,e):t instanceof Hn?function(a,r){return r instanceof Hn&&a.op===r.op&&a.filters.length===r.filters.length?a.filters.reduce((i,s,u)=>i&&Ox(s,r.filters[u]),!0):!1}(t,e):void te(19439)}function Nx(t){return t instanceof rt?function(n){return`${n.field.canonicalString()} ${n.op} ${xo(n.value)}`}(t):t instanceof Hn?function(n){return n.op.toString()+" {"+n.getFilters().map(Nx).join(" ,")+"}"}(t):"Filter"}var VI=class extends rt{constructor(e,n,a){super(e,n,a),this.key=J.fromName(a.referenceValue)}matches(e){let n=J.comparator(e.key,this.key);return this.matchesComparison(n)}},FI=class extends rt{constructor(e,n){super(e,"in",n),this.keys=Mx("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}},BI=class extends rt{constructor(e,n){super(e,"not-in",n),this.keys=Mx("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}};function Mx(t,e){return(e.arrayValue?.values||[]).map(n=>J.fromName(n.referenceValue))}var qI=class extends rt{constructor(e,n){super(e,"array-contains",n)}matches(e){let n=e.data.field(this.field);return ZT(n)&&Ql(n.arrayValue,this.value)}},zI=class extends rt{constructor(e,n){super(e,"in",n)}matches(e){let n=e.data.field(this.field);return n!==null&&Ql(this.value.arrayValue,n)}},HI=class extends rt{constructor(e,n){super(e,"not-in",n)}matches(e){if(Ql(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Ql(this.value.arrayValue,n)}},GI=class extends rt{constructor(e,n){super(e,"array-contains-any",n)}matches(e){let n=e.data.field(this.field);return!(!ZT(n)||!n.arrayValue.values)&&n.arrayValue.values.some(a=>Ql(this.value.arrayValue,a))}};var jI=class{constructor(e,n=null,a=[],r=[],i=null,s=null,u=null){this.path=e,this.collectionGroup=n,this.orderBy=a,this.filters=r,this.limit=i,this.startAt=s,this.endAt=u,this.Te=null}};function kR(t,e=null,n=[],a=[],r=null,i=null,s=null){return new jI(t,e,n,a,r,i,s)}function eS(t){let e=ye(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(a=>UI(a)).join(","),n+="|ob:",n+=e.orderBy.map(a=>function(i){return i.field.canonicalString()+i.dir}(a)).join(","),hp(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(a=>xo(a)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(a=>xo(a)).join(",")),e.Te=n}return e.Te}function tS(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!rV(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!Ox(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!xR(t.startAt,e.startAt)&&xR(t.endAt,e.endAt)}function WI(t){return J.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var dr=class{constructor(e,n=null,a=[],r=[],i=null,s="F",u=null,l=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=a,this.filters=r,this.limit=i,this.limitType=s,this.startAt=u,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function sV(t,e,n,a,r,i,s,u){return new dr(t,e,n,a,r,i,s,u)}function nS(t){return new dr(t)}function DR(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function oV(t){return J.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function mp(t){return t.collectionGroup!==null}function $i(t){let e=ye(t);if(e.Ie===null){e.Ie=[];let n=new Set;for(let i of e.explicitOrderBy)e.Ie.push(i),n.add(i.field.canonicalString());let a=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(s){let u=new Rt(Cn.comparator);return s.filters.forEach(l=>{l.getFlattenedFilters().forEach(c=>{c.isInequality()&&(u=u.add(c.field))})}),u})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.Ie.push(new ci(i,a))}),n.has(Cn.keyField().canonicalString())||e.Ie.push(new ci(Cn.keyField(),a))}return e.Ie}function Sa(t){let e=ye(t);return e.Ee||(e.Ee=uV(e,$i(t))),e.Ee}function uV(t,e){if(t.limitType==="F")return kR(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let i=r.dir==="desc"?"asc":"desc";return new ci(r.field,i)});let n=t.endAt?new cr(t.endAt.position,t.endAt.inclusive):null,a=t.startAt?new cr(t.startAt.position,t.startAt.inclusive):null;return kR(t.path,t.collectionGroup,e,t.filters,t.limit,n,a)}}function gp(t,e){let n=t.filters.concat([e]);return new dr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function Ux(t,e){let n=t.explicitOrderBy.concat([e]);return new dr(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function Xl(t,e,n){return new dr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Vx(t,e){return new dr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function yp(t,e){return tS(Sa(t),Sa(e))&&t.limitType===e.limitType}function Fx(t){return`${eS(Sa(t))}|lt:${t.limitType}`}function _o(t){return`Query(target=${function(n){let a=n.path.canonicalString();return n.collectionGroup!==null&&(a+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(a+=`, filters: [${n.filters.map(r=>Nx(r)).join(", ")}]`),hp(n.limit)||(a+=", limit: "+n.limit),n.orderBy.length>0&&(a+=`, orderBy: [${n.orderBy.map(r=>function(s){return`${s.field.canonicalString()} (${s.dir})`}(r)).join(", ")}]`),n.startAt&&(a+=", startAt: ",a+=n.startAt.inclusive?"b:":"a:",a+=n.startAt.position.map(r=>xo(r)).join(",")),n.endAt&&(a+=", endAt: ",a+=n.endAt.inclusive?"a:":"b:",a+=n.endAt.position.map(r=>xo(r)).join(",")),`Target(${a})`}(Sa(t))}; limitType=${t.limitType})`}function _p(t,e){return e.isFoundDocument()&&function(a,r){let i=r.key.path;return a.collectionGroup!==null?r.key.hasCollectionId(a.collectionGroup)&&a.path.isPrefixOf(i):J.isDocumentKey(a.path)?a.path.isEqual(i):a.path.isImmediateParentOf(i)}(t,e)&&function(a,r){for(let i of $i(a))if(!i.field.isKeyField()&&r.data.field(i.field)===null)return!1;return!0}(t,e)&&function(a,r){for(let i of a.filters)if(!i.matches(r))return!1;return!0}(t,e)&&function(a,r){return!(a.startAt&&!function(s,u,l){let c=RR(s,u,l);return s.inclusive?c<=0:c<0}(a.startAt,$i(a),r)||a.endAt&&!function(s,u,l){let c=RR(s,u,l);return s.inclusive?c>=0:c>0}(a.endAt,$i(a),r))}(t,e)}function lV(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function Bx(t){return(e,n)=>{let a=!1;for(let r of $i(t)){let i=cV(r,e,n);if(i!==0)return i;a=a||r.field.isKeyField()}return 0}}function cV(t,e,n){let a=t.field.isKeyField()?J.comparator(e.key,n.key):function(i,s,u){let l=s.data.field(i),c=u.data.field(i);return l!==null&&c!==null?Ro(l,c):te(42886)}(t.field,e,n);switch(t.dir){case"asc":return a;case"desc":return-1*a;default:return te(19790,{direction:t.dir})}}var fr=class{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a!==void 0){for(let[r,i]of a)if(this.equalsFn(r,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){let a=this.mapKeyFn(e),r=this.inner[a];if(r===void 0)return this.inner[a]=[[e,n]],void this.innerSize++;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return void(r[i]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a===void 0)return!1;for(let r=0;r<a.length;r++)if(this.equalsFn(a[r][0],e))return a.length===1?delete this.inner[n]:a.splice(r,1),this.innerSize--,!0;return!1}forEach(e){zo(this.inner,(n,a)=>{for(let[r,i]of a)e(r,i)})}isEmpty(){return Ex(this.inner)}size(){return this.innerSize}};var dV=new st(J.comparator);function di(){return dV}var qx=new st(J.comparator);function ql(...t){let e=qx;for(let n of t)e=e.insert(n.key,n);return e}function fV(t){let e=qx;return t.forEach((n,a)=>e=e.insert(n,a.overlayedDocument)),e}function Qi(){return Hl()}function zx(){return Hl()}function Hl(){return new fr(t=>t.toString(),(t,e)=>t.isEqual(e))}var YH=new st(J.comparator),hV=new Rt(J.comparator);function ge(...t){let e=hV;for(let n of t)e=e.add(n);return e}var pV=new Rt(pe);function mV(){return pV}function aS(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Wl(e)?"-0":e}}function Hx(t){return{integerValue:""+t}}function gV(t,e){return GU(e)?Hx(e):aS(t,e)}var ko=class{constructor(){this._=void 0}};function yV(t,e,n){return t instanceof $l?function(r,i){let s={fields:{[Cx]:{stringValue:wx},[bx]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return i&&dc(i)&&(i=pp(i)),i&&(s.fields[Ax]=i),{mapValue:s}}(n,e):t instanceof Do?Gx(t,e):t instanceof Po?jx(t,e):function(r,i){let s=IV(r,i),u=PR(s)+PR(r.Ae);return MI(s)&&MI(r.Ae)?Hx(u):aS(r.serializer,u)}(t,e)}function _V(t,e,n){return t instanceof Do?Gx(t,e):t instanceof Po?jx(t,e):n}function IV(t,e){return t instanceof Jl?function(a){return MI(a)||function(i){return!!i&&"doubleValue"in i}(a)}(e)?e:{integerValue:0}:null}var $l=class extends ko{},Do=class extends ko{constructor(e){super(),this.elements=e}};function Gx(t,e){let n=Wx(e);for(let a of t.elements)n.some(r=>wa(r,a))||n.push(a);return{arrayValue:{values:n}}}var Po=class extends ko{constructor(e){super(),this.elements=e}};function jx(t,e){let n=Wx(e);for(let a of t.elements)n=n.filter(r=>!wa(r,a));return{arrayValue:{values:n}}}var Jl=class extends ko{constructor(e,n){super(),this.serializer=e,this.Ae=n}};function PR(t){return ze(t.integerValue||t.doubleValue)}function Wx(t){return ZT(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function TV(t,e){return t.field.isEqual(e.field)&&function(a,r){return a instanceof Do&&r instanceof Do||a instanceof Po&&r instanceof Po?Ao(a.elements,r.elements,wa):a instanceof Jl&&r instanceof Jl?wa(a.Ae,r.Ae):a instanceof $l&&r instanceof $l}(t.transform,e.transform)}var vo=class t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function Oh(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var Zl=class{};function Kx(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new Wh(t.key,vo.none()):new ec(t.key,t.data,vo.none());{let n=t.data,a=Ia.empty(),r=new Rt(Cn.comparator);for(let i of e.fields)if(!r.has(i)){let s=n.field(i);s===null&&i.length>1&&(i=i.popLast(),s=n.field(i)),s===null?a.delete(i):a.set(i,s),r=r.add(i)}return new Oo(t.key,a,new Yi(r.toArray()),vo.none())}}function SV(t,e,n){t instanceof ec?function(r,i,s){let u=r.value.clone(),l=NR(r.fieldTransforms,i,s.transformResults);u.setAll(l),i.convertToFoundDocument(s.version,u).setHasCommittedMutations()}(t,e,n):t instanceof Oo?function(r,i,s){if(!Oh(r.precondition,i))return void i.convertToUnknownDocument(s.version);let u=NR(r.fieldTransforms,i,s.transformResults),l=i.data;l.setAll(Yx(r)),l.setAll(u),i.convertToFoundDocument(s.version,l).setHasCommittedMutations()}(t,e,n):function(r,i,s){i.convertToNoDocument(s.version).setHasCommittedMutations()}(0,e,n)}function Gl(t,e,n,a){return t instanceof ec?function(i,s,u,l){if(!Oh(i.precondition,s))return u;let c=i.value.clone(),f=MR(i.fieldTransforms,l,s);return c.setAll(f),s.convertToFoundDocument(s.version,c).setHasLocalMutations(),null}(t,e,n,a):t instanceof Oo?function(i,s,u,l){if(!Oh(i.precondition,s))return u;let c=MR(i.fieldTransforms,l,s),f=s.data;return f.setAll(Yx(i)),f.setAll(c),s.convertToFoundDocument(s.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(t,e,n,a):function(i,s,u){return Oh(i.precondition,s)?(s.convertToNoDocument(s.version).setHasLocalMutations(),null):u}(t,e,n)}function OR(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(a,r){return a===void 0&&r===void 0||!(!a||!r)&&Ao(a,r,(i,s)=>TV(i,s))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var ec=class extends Zl{constructor(e,n,a,r=[]){super(),this.key=e,this.value=n,this.precondition=a,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},Oo=class extends Zl{constructor(e,n,a,r,i=[]){super(),this.key=e,this.data=n,this.fieldMask=a,this.precondition=r,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}};function Yx(t){let e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){let a=t.data.field(n);e.set(n,a)}}),e}function NR(t,e,n){let a=new Map;Ke(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let r=0;r<n.length;r++){let i=t[r],s=i.transform,u=e.data.field(i.field);a.set(i.field,_V(s,u,n[r]))}return a}function MR(t,e,n){let a=new Map;for(let r of t){let i=r.transform,s=n.data.field(r.field);a.set(r.field,yV(i,s,e))}return a}var Wh=class extends Zl{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var KI=class{constructor(e,n,a,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=a,this.mutations=r}applyToRemoteDocument(e,n){let a=n.mutationResults;for(let r=0;r<this.mutations.length;r++){let i=this.mutations[r];i.key.isEqual(e.key)&&SV(i,e,a[r])}}applyToLocalView(e,n){for(let a of this.baseMutations)a.key.isEqual(e.key)&&(n=Gl(a,e,n,this.localWriteTime));for(let a of this.mutations)a.key.isEqual(e.key)&&(n=Gl(a,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){let a=zx();return this.mutations.forEach(r=>{let i=e.get(r.key),s=i.overlayedDocument,u=this.applyToLocalView(s,i.mutatedFields);u=n.has(r.key)?null:u;let l=Kx(s,u);l!==null&&a.set(r.key,l),s.isValidDocument()||s.convertToNoDocument(ie.min())}),a}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),ge())}isEqual(e){return this.batchId===e.batchId&&Ao(this.mutations,e.mutations,(n,a)=>OR(n,a))&&Ao(this.baseMutations,e.baseMutations,(n,a)=>OR(n,a))}};var YI=class{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var QI=class{constructor(e,n){this.count=e,this.unchangedNames=n}};var dt,me;function Qx(t){if(t===void 0)return sr("GRPC error has no .code"),F.UNKNOWN;switch(t){case dt.OK:return F.OK;case dt.CANCELLED:return F.CANCELLED;case dt.UNKNOWN:return F.UNKNOWN;case dt.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case dt.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case dt.INTERNAL:return F.INTERNAL;case dt.UNAVAILABLE:return F.UNAVAILABLE;case dt.UNAUTHENTICATED:return F.UNAUTHENTICATED;case dt.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case dt.NOT_FOUND:return F.NOT_FOUND;case dt.ALREADY_EXISTS:return F.ALREADY_EXISTS;case dt.PERMISSION_DENIED:return F.PERMISSION_DENIED;case dt.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case dt.ABORTED:return F.ABORTED;case dt.OUT_OF_RANGE:return F.OUT_OF_RANGE;case dt.UNIMPLEMENTED:return F.UNIMPLEMENTED;case dt.DATA_LOSS:return F.DATA_LOSS;default:return te(39323,{code:t})}}(me=dt||(dt={}))[me.OK=0]="OK",me[me.CANCELLED=1]="CANCELLED",me[me.UNKNOWN=2]="UNKNOWN",me[me.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",me[me.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",me[me.NOT_FOUND=5]="NOT_FOUND",me[me.ALREADY_EXISTS=6]="ALREADY_EXISTS",me[me.PERMISSION_DENIED=7]="PERMISSION_DENIED",me[me.UNAUTHENTICATED=16]="UNAUTHENTICATED",me[me.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",me[me.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",me[me.ABORTED=10]="ABORTED",me[me.OUT_OF_RANGE=11]="OUT_OF_RANGE",me[me.UNIMPLEMENTED=12]="UNIMPLEMENTED",me[me.INTERNAL=13]="INTERNAL",me[me.UNAVAILABLE=14]="UNAVAILABLE",me[me.DATA_LOSS=15]="DATA_LOSS";var vV=null;function EV(){return new TextEncoder}var wV=new nr([4294967295,4294967295],0);function UR(t){let e=EV().encode(t),n=new yI;return n.update(e),new Uint8Array(n.digest())}function VR(t){let e=new DataView(t.buffer),n=e.getUint32(0,!0),a=e.getUint32(4,!0),r=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new nr([n,a],0),new nr([r,i],0)]}var XI=class t{constructor(e,n,a){if(this.bitmap=e,this.padding=n,this.hashCount=a,n<0||n>=8)throw new Xi(`Invalid padding: ${n}`);if(a<0)throw new Xi(`Invalid hash count: ${a}`);if(e.length>0&&this.hashCount===0)throw new Xi(`Invalid hash count: ${a}`);if(e.length===0&&n!==0)throw new Xi(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=nr.fromNumber(this.ge)}ye(e,n,a){let r=e.add(n.multiply(nr.fromNumber(a)));return r.compare(wV)===1&&(r=new nr([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let n=UR(e),[a,r]=VR(n);for(let i=0;i<this.hashCount;i++){let s=this.ye(a,r,i);if(!this.we(s))return!1}return!0}static create(e,n,a){let r=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),s=new t(i,r,n);return a.forEach(u=>s.insert(u)),s}insert(e){if(this.ge===0)return;let n=UR(e),[a,r]=VR(n);for(let i=0;i<this.hashCount;i++){let s=this.ye(a,r,i);this.be(s)}}be(e){let n=Math.floor(e/8),a=e%8;this.bitmap[n]|=1<<a}},Xi=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var Kh=class t{constructor(e,n,a,r,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=a,this.documentUpdates=r,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,a){let r=new Map;return r.set(e,tc.createSynthesizedTargetChangeForCurrentChange(e,n,a)),new t(ie.min(),r,new st(pe),di(),ge())}},tc=class t{constructor(e,n,a,r,i){this.resumeToken=e,this.current=n,this.addedDocuments=a,this.modifiedDocuments=r,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,a){return new t(a,n,ge(),ge(),ge())}};var Eo=class{constructor(e,n,a,r){this.Se=e,this.removedTargetIds=n,this.key=a,this.De=r}},Yh=class{constructor(e,n){this.targetId=e,this.Ce=n}},Qh=class{constructor(e,n,a=Bt.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=a,this.cause=r}},Xh=class{constructor(){this.ve=0,this.Fe=FR(),this.Me=Bt.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=ge(),n=ge(),a=ge();return this.Fe.forEach((r,i)=>{switch(i){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:a=a.add(r);break;default:te(38017,{changeType:i})}}),new tc(this.Me,this.xe,e,n,a)}Ke(){this.Oe=!1,this.Fe=FR()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,Ke(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},$I=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=di(),this.He=kh(),this.Je=kh(),this.Ze=new st(pe)}Xe(e){for(let n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(let n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{let a=this.nt(n);switch(e.state){case 0:this.rt(n)&&a.Le(e.resumeToken);break;case 1:a.We(),a.Ne||a.Ke(),a.Le(e.resumeToken);break;case 2:a.We(),a.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(a.Qe(),a.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),a.Le(e.resumeToken));break;default:te(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((a,r)=>{this.rt(r)&&n(r)})}st(e){let n=e.targetId,a=e.Ce.count,r=this.ot(n);if(r){let i=r.target;if(WI(i))if(a===0){let s=new J(i.path);this.et(n,s,Zn.newNoDocument(s,ie.min()))}else Ke(a===1,20013,{expectedCount:a});else{let s=this._t(n);if(s!==a){let u=this.ut(e),l=u?this.ct(u,e,s):1;if(l!==0){this.it(n);let c=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,c)}vV?.lt(function(f,m,p,I,b){let x={localCacheCount:f,existenceFilterCount:m.count,databaseId:p.database,projectId:p.projectId},D=m.unchangedNames;return D&&(x.bloomFilter={applied:b===0,hashCount:D?.hashCount??0,bitmapLength:D?.bits?.bitmap?.length??0,padding:D?.bits?.padding??0,mightContain:v=>I?.mightContain(v)??!1}),x}(s,e.Ce,this.Ge.ht(),u,l))}}}}ut(e){let n=e.Ce.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:a="",padding:r=0},hashCount:i=0}=n,s,u;try{s=lr(a).toUint8Array()}catch(l){if(l instanceof Hh)return or("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new XI(s,r,i)}catch(l){return or(l instanceof Xi?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.ge===0?null:u}ct(e,n,a){return n.Ce.count===a-this.Pt(e,n.targetId)?0:2}Pt(e,n){let a=this.Ge.getRemoteKeysForTarget(n),r=0;return a.forEach(i=>{let s=this.Ge.ht(),u=`projects/${s.projectId}/databases/${s.database}/documents/${i.path.canonicalString()}`;e.mightContain(u)||(this.et(n,i,null),r++)}),r}Tt(e){let n=new Map;this.ze.forEach((i,s)=>{let u=this.ot(s);if(u){if(i.current&&WI(u.target)){let l=new J(u.target.path);this.It(l).has(s)||this.Et(s,l)||this.et(s,l,Zn.newNoDocument(l,e))}i.Be&&(n.set(s,i.ke()),i.Ke())}});let a=ge();this.Je.forEach((i,s)=>{let u=!0;s.forEachWhile(l=>{let c=this.ot(l);return!c||c.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(a=a.add(i))}),this.je.forEach((i,s)=>s.setReadTime(e));let r=new Kh(e,n,this.Ze,this.je,a);return this.je=di(),this.He=kh(),this.Je=kh(),this.Ze=new st(pe),r}Ye(e,n){if(!this.rt(e))return;let a=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,a),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,a){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,n)?r.qe(n,1):r.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),a&&(this.je=this.je.insert(n,a))}removeTarget(e){this.ze.delete(e)}_t(e){let n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new Xh,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new Rt(pe),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new Rt(pe),this.He=this.He.insert(e,n)),n}rt(e){let n=this.ot(e)!==null;return n||K("WatchChangeAggregator","Detected inactive target",e),n}ot(e){let n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new Xh),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}};function kh(){return new st(J.comparator)}function FR(){return new st(J.comparator)}var CV={asc:"ASCENDING",desc:"DESCENDING"},AV={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},bV={and:"AND",or:"OR"},JI=class{constructor(e,n){this.databaseId=e,this.useProto3Json=n}};function ZI(t,e){return t.useProto3Json||hp(e)?e:{value:e}}function eT(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Xx(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function wo(t){return Ke(!!t,49232),ie.fromTimestamp(function(n){let a=ur(n);return new ht(a.seconds,a.nanos)}(t))}function $x(t,e){return tT(t,e).canonicalString()}function tT(t,e){let n=function(r){return new He(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?n:n.child(e)}function Jx(t){let e=He.fromString(t);return Ke(a0(e),10190,{key:e.toString()}),e}function CI(t,e){let n=Jx(e);if(n.get(1)!==t.databaseId.projectId)throw new G(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new G(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new J(e0(n))}function Zx(t,e){return $x(t.databaseId,e)}function LV(t){let e=Jx(t);return e.length===4?He.emptyPath():e0(e)}function BR(t){return new He(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function e0(t){return Ke(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function RV(t,e){let n;if("targetChange"in e){e.targetChange;let a=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:te(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],i=function(c,f){return c.useProto3Json?(Ke(f===void 0||typeof f=="string",58123),Bt.fromBase64String(f||"")):(Ke(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Bt.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),s=e.targetChange.cause,u=s&&function(c){let f=c.code===void 0?F.UNKNOWN:Qx(c.code);return new G(f,c.message||"")}(s);n=new Qh(a,r,i,u||null)}else if("documentChange"in e){e.documentChange;let a=e.documentChange;a.document,a.document.name,a.document.updateTime;let r=CI(t,a.document.name),i=wo(a.document.updateTime),s=a.document.createTime?wo(a.document.createTime):ie.min(),u=new Ia({mapValue:{fields:a.document.fields}}),l=Zn.newFoundDocument(r,i,s,u),c=a.targetIds||[],f=a.removedTargetIds||[];n=new Eo(c,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;let a=e.documentDelete;a.document;let r=CI(t,a.document),i=a.readTime?wo(a.readTime):ie.min(),s=Zn.newNoDocument(r,i),u=a.removedTargetIds||[];n=new Eo([],u,s.key,s)}else if("documentRemove"in e){e.documentRemove;let a=e.documentRemove;a.document;let r=CI(t,a.document),i=a.removedTargetIds||[];n=new Eo([],i,r,null)}else{if(!("filter"in e))return te(11601,{Vt:e});{e.filter;let a=e.filter;a.targetId;let{count:r=0,unchangedNames:i}=a,s=new QI(r,i),u=a.targetId;n=new Yh(u,s)}}return n}function xV(t,e){return{documents:[Zx(t,e.path)]}}function kV(t,e){let n={structuredQuery:{}},a=e.path,r;e.collectionGroup!==null?(r=a,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=a.popLast(),n.structuredQuery.from=[{collectionId:a.lastSegment()}]),n.parent=Zx(t,r);let i=function(c){if(c.length!==0)return n0(Hn.create(c,"and"))}(e.filters);i&&(n.structuredQuery.where=i);let s=function(c){if(c.length!==0)return c.map(f=>function(p){return{field:Io(p.field),direction:OV(p.dir)}}(f))}(e.orderBy);s&&(n.structuredQuery.orderBy=s);let u=ZI(t,e.limit);return u!==null&&(n.structuredQuery.limit=u),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{ft:n,parent:r}}function DV(t){let e=LV(t.parent),n=t.structuredQuery,a=n.from?n.from.length:0,r=null;if(a>0){Ke(a===1,65062);let f=n.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let i=[];n.where&&(i=function(m){let p=t0(m);return p instanceof Hn&&Px(p)?p.getFilters():[p]}(n.where));let s=[];n.orderBy&&(s=function(m){return m.map(p=>function(b){return new ci(To(b.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(b.direction))}(p))}(n.orderBy));let u=null;n.limit&&(u=function(m){let p;return p=typeof m=="object"?m.value:m,hp(p)?null:p}(n.limit));let l=null;n.startAt&&(l=function(m){let p=!!m.before,I=m.values||[];return new cr(I,p)}(n.startAt));let c=null;return n.endAt&&(c=function(m){let p=!m.before,I=m.values||[];return new cr(I,p)}(n.endAt)),sV(e,r,s,i,u,"F",l,c)}function PV(t,e){let n=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return te(28987,{purpose:r})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function t0(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":let a=To(n.unaryFilter.field);return rt.create(a,"==",{doubleValue:NaN});case"IS_NULL":let r=To(n.unaryFilter.field);return rt.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let i=To(n.unaryFilter.field);return rt.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let s=To(n.unaryFilter.field);return rt.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return te(61313);default:return te(60726)}}(t):t.fieldFilter!==void 0?function(n){return rt.create(To(n.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return te(58110);default:return te(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return Hn.create(n.compositeFilter.filters.map(a=>t0(a)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return te(1026)}}(n.compositeFilter.op))}(t):te(30097,{filter:t})}function OV(t){return CV[t]}function NV(t){return AV[t]}function MV(t){return bV[t]}function Io(t){return{fieldPath:t.canonicalString()}}function To(t){return Cn.fromServerFormat(t.fieldPath)}function n0(t){return t instanceof rt?function(n){if(n.op==="=="){if(LR(n.value))return{unaryFilter:{field:Io(n.field),op:"IS_NAN"}};if(bR(n.value))return{unaryFilter:{field:Io(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(LR(n.value))return{unaryFilter:{field:Io(n.field),op:"IS_NOT_NAN"}};if(bR(n.value))return{unaryFilter:{field:Io(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Io(n.field),op:NV(n.op),value:n.value}}}(t):t instanceof Hn?function(n){let a=n.getFilters().map(r=>n0(r));return a.length===1?a[0]:{compositeFilter:{op:MV(n.op),filters:a}}}(t):te(54877,{filter:t})}function a0(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function r0(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var nc=class t{constructor(e,n,a,r,i=ie.min(),s=ie.min(),u=Bt.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=n,this.purpose=a,this.sequenceNumber=r,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=s,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var nT=class{constructor(e){this.yt=e}};function i0(t){let e=DV({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Xl(e,e.limit,"L"):e}var $h=class{constructor(){}Dt(e,n){this.Ct(e,n),n.vt()}Ct(e,n){if("nullValue"in e)this.Ft(n,5);else if("booleanValue"in e)this.Ft(n,10),n.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(n,15),n.Mt(ze(e.integerValue));else if("doubleValue"in e){let a=ze(e.doubleValue);isNaN(a)?this.Ft(n,13):(this.Ft(n,15),Wl(a)?n.Mt(0):n.Mt(a))}else if("timestampValue"in e){let a=e.timestampValue;this.Ft(n,20),typeof a=="string"&&(a=ur(a)),n.xt(`${a.seconds||""}`),n.Mt(a.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,n),this.Nt(n);else if("bytesValue"in e)this.Ft(n,30),n.Bt(lr(e.bytesValue)),this.Nt(n);else if("referenceValue"in e)this.Lt(e.referenceValue,n);else if("geoPointValue"in e){let a=e.geoPointValue;this.Ft(n,45),n.Mt(a.latitude||0),n.Mt(a.longitude||0)}else"mapValue"in e?kx(e)?this.Ft(n,Number.MAX_SAFE_INTEGER):xx(e)?this.kt(e.mapValue,n):(this.Kt(e.mapValue,n),this.Nt(n)):"arrayValue"in e?(this.qt(e.arrayValue,n),this.Nt(n)):te(19022,{Ut:e})}Ot(e,n){this.Ft(n,25),this.$t(e,n)}$t(e,n){n.xt(e)}Kt(e,n){let a=e.fields||{};this.Ft(n,55);for(let r of Object.keys(a))this.Ot(r,n),this.Ct(a[r],n)}kt(e,n){let a=e.fields||{};this.Ft(n,53);let r=Lo,i=a[r].arrayValue?.values?.length||0;this.Ft(n,15),n.Mt(ze(i)),this.Ot(r,n),this.Ct(a[r],n)}qt(e,n){let a=e.values||[];this.Ft(n,50);for(let r of a)this.Ct(r,n)}Lt(e,n){this.Ft(n,37),J.fromName(e).path.forEach(a=>{this.Ft(n,60),this.$t(a,n)})}Ft(e,n){e.Mt(n)}Nt(e){e.Mt(2)}};$h.Wt=new $h;var aT=class{constructor(){this.Sn=new rT}addToCollectionParentIndex(e,n){return this.Sn.add(n),B.resolve()}getCollectionParents(e,n){return B.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return B.resolve()}deleteFieldIndex(e,n){return B.resolve()}deleteAllFieldIndexes(e){return B.resolve()}createTargetIndexes(e,n){return B.resolve()}getDocumentsMatchingTarget(e,n){return B.resolve(null)}getIndexType(e,n){return B.resolve(0)}getFieldIndexes(e,n){return B.resolve([])}getNextCollectionGroupToUpdate(e){return B.resolve(null)}getMinOffset(e,n){return B.resolve(es.min())}getMinOffsetFromCollectionGroup(e,n){return B.resolve(es.min())}updateCollectionGroup(e,n,a){return B.resolve()}updateIndexEntries(e,n){return B.resolve()}},rT=class{constructor(){this.index={}}add(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n]||new Rt(He.comparator),i=!r.has(a);return this.index[n]=r.add(a),i}has(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n];return r&&r.has(a)}getEntries(e){return(this.index[e]||new Rt(He.comparator)).toArray()}};var QH=new Uint8Array(0);var qR={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},s0=41943040,zn=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,a){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=a}};zn.DEFAULT_COLLECTION_PERCENTILE=10,zn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,zn.DEFAULT=new zn(s0,zn.DEFAULT_COLLECTION_PERCENTILE,zn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),zn.DISABLED=new zn(-1,0,0);var ac=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var zR="LruGarbageCollector",UV=1048576;function HR([t,e],[n,a]){let r=pe(t,n);return r===0?pe(e,a):r}var iT=class{constructor(e){this.Pr=e,this.buffer=new Rt(HR),this.Tr=0}Ir(){return++this.Tr}Er(e){let n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{let a=this.buffer.last();HR(n,a)<0&&(this.buffer=this.buffer.delete(a).add(n))}}get maxValue(){return this.buffer.last()[0]}},sT=class{constructor(e,n,a){this.garbageCollector=e,this.asyncQueue=n,this.localStore=a,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){K(zR,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){qo(n)?K(zR,"Ignoring IndexedDB error during garbage collection: ",n):await fp(n)}await this.Ar(3e5)})}},oT=class{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(a=>Math.floor(n/100*a))}nthSequenceNumber(e,n){if(n===0)return B.resolve(bo.ce);let a=new iT(n);return this.Vr.forEachTarget(e,r=>a.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>a.Er(r))).next(()=>a.maxValue)}removeTargets(e,n,a){return this.Vr.removeTargets(e,n,a)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(K("LruGarbageCollector","Garbage collection skipped; disabled"),B.resolve(qR)):this.getCacheSize(e).next(a=>a<this.params.cacheSizeCollectionThreshold?(K("LruGarbageCollector",`Garbage collection skipped; Cache size ${a} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),qR):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let a,r,i,s,u,l,c,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(K("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),r=this.params.maximumSequenceNumbersToCollect):r=m,s=Date.now(),this.nthSequenceNumber(e,r))).next(m=>(a=m,u=Date.now(),this.removeTargets(e,a,n))).next(m=>(i=m,l=Date.now(),this.removeOrphanedDocuments(e,a))).next(m=>(c=Date.now(),yo()<=se.DEBUG&&K("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${s-f}ms
	Determined least recently used ${r} in `+(u-s)+`ms
	Removed ${i} targets in `+(l-u)+`ms
	Removed ${m} documents in `+(c-l)+`ms
Total Duration: ${c-f}ms`),B.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:i,documentsRemoved:m})))}};function VV(t,e){return new oT(t,e)}var uT=class{constructor(){this.changes=new fr(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Zn.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();let a=this.changes.get(n);return a!==void 0?B.resolve(a):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var lT=class{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}};var cT=class{constructor(e,n,a,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=a,this.indexManager=r}getDocument(e,n){let a=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(a=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(a!==null&&Gl(a.mutation,r,Yi.empty(),ht.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.getLocalViewOfDocuments(e,a,ge()).next(()=>a))}getLocalViewOfDocuments(e,n,a=ge()){let r=Qi();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,a).next(i=>{let s=ql();return i.forEach((u,l)=>{s=s.insert(u,l.overlayedDocument)}),s}))}getOverlayedDocuments(e,n){let a=Qi();return this.populateOverlays(e,a,n).next(()=>this.computeViews(e,n,a,ge()))}populateOverlays(e,n,a){let r=[];return a.forEach(i=>{n.has(i)||r.push(i)}),this.documentOverlayCache.getOverlays(e,r).next(i=>{i.forEach((s,u)=>{n.set(s,u)})})}computeViews(e,n,a,r){let i=di(),s=Hl(),u=function(){return Hl()}();return n.forEach((l,c)=>{let f=a.get(c.key);r.has(c.key)&&(f===void 0||f.mutation instanceof Oo)?i=i.insert(c.key,c):f!==void 0?(s.set(c.key,f.mutation.getFieldMask()),Gl(f.mutation,c,f.mutation.getFieldMask(),ht.now())):s.set(c.key,Yi.empty())}),this.recalculateAndSaveOverlays(e,i).next(l=>(l.forEach((c,f)=>s.set(c,f)),n.forEach((c,f)=>u.set(c,new lT(f,s.get(c)??null))),u))}recalculateAndSaveOverlays(e,n){let a=Hl(),r=new st((s,u)=>s-u),i=ge();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(s=>{for(let u of s)u.keys().forEach(l=>{let c=n.get(l);if(c===null)return;let f=a.get(l)||Yi.empty();f=u.applyToLocalView(c,f),a.set(l,f);let m=(r.get(u.batchId)||ge()).add(l);r=r.insert(u.batchId,m)})}).next(()=>{let s=[],u=r.getReverseIterator();for(;u.hasNext();){let l=u.getNext(),c=l.key,f=l.value,m=zx();f.forEach(p=>{if(!i.has(p)){let I=Kx(n.get(p),a.get(p));I!==null&&m.set(p,I),i=i.add(p)}}),s.push(this.documentOverlayCache.saveOverlays(e,c,m))}return B.waitFor(s)}).next(()=>a)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.recalculateAndSaveOverlays(e,a))}getDocumentsMatchingQuery(e,n,a,r){return oV(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):mp(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,a,r):this.getDocumentsMatchingCollectionQuery(e,n,a,r)}getNextDocuments(e,n,a,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,a,r).next(i=>{let s=r-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,a.largestBatchId,r-i.size):B.resolve(Qi()),u=jl,l=i;return s.next(c=>B.forEach(c,(f,m)=>(u<m.largestBatchId&&(u=m.largestBatchId),i.get(f)?B.resolve():this.remoteDocumentCache.getEntry(e,f).next(p=>{l=l.insert(f,p)}))).next(()=>this.populateOverlays(e,c,i)).next(()=>this.computeViews(e,l,c,ge())).next(f=>({batchId:u,changes:fV(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new J(n)).next(a=>{let r=ql();return a.isFoundDocument()&&(r=r.insert(a.key,a)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,a,r){let i=n.collectionGroup,s=ql();return this.indexManager.getCollectionParents(e,i).next(u=>B.forEach(u,l=>{let c=function(m,p){return new dr(p,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(n,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,c,a,r).next(f=>{f.forEach((m,p)=>{s=s.insert(m,p)})})}).next(()=>s))}getDocumentsMatchingCollectionQuery(e,n,a,r){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,a.largestBatchId).next(s=>(i=s,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,a,i,r))).next(s=>{i.forEach((l,c)=>{let f=c.getKey();s.get(f)===null&&(s=s.insert(f,Zn.newInvalidDocument(f)))});let u=ql();return s.forEach((l,c)=>{let f=i.get(l);f!==void 0&&Gl(f.mutation,c,Yi.empty(),ht.now()),_p(n,c)&&(u=u.insert(l,c))}),u})}};var dT=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return B.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(r){return{id:r.id,version:r.version,createTime:wo(r.createTime)}}(n)),B.resolve()}getNamedQuery(e,n){return B.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(r){return{name:r.name,query:i0(r.bundledQuery),readTime:wo(r.readTime)}}(n)),B.resolve()}};var fT=class{constructor(){this.overlays=new st(J.comparator),this.Lr=new Map}getOverlay(e,n){return B.resolve(this.overlays.get(n))}getOverlays(e,n){let a=Qi();return B.forEach(n,r=>this.getOverlay(e,r).next(i=>{i!==null&&a.set(r,i)})).next(()=>a)}saveOverlays(e,n,a){return a.forEach((r,i)=>{this.bt(e,n,i)}),B.resolve()}removeOverlaysForBatchId(e,n,a){let r=this.Lr.get(a);return r!==void 0&&(r.forEach(i=>this.overlays=this.overlays.remove(i)),this.Lr.delete(a)),B.resolve()}getOverlaysForCollection(e,n,a){let r=Qi(),i=n.length+1,s=new J(n.child("")),u=this.overlays.getIteratorFrom(s);for(;u.hasNext();){let l=u.getNext().value,c=l.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===i&&l.largestBatchId>a&&r.set(l.getKey(),l)}return B.resolve(r)}getOverlaysForCollectionGroup(e,n,a,r){let i=new st((c,f)=>c-f),s=this.overlays.getIterator();for(;s.hasNext();){let c=s.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>a){let f=i.get(c.largestBatchId);f===null&&(f=Qi(),i=i.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}let u=Qi(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((c,f)=>u.set(c,f)),!(u.size()>=r)););return B.resolve(u)}bt(e,n,a){let r=this.overlays.get(a.key);if(r!==null){let s=this.Lr.get(r.largestBatchId).delete(a.key);this.Lr.set(r.largestBatchId,s)}this.overlays=this.overlays.insert(a.key,new YI(n,a));let i=this.Lr.get(n);i===void 0&&(i=ge(),this.Lr.set(n,i)),this.Lr.set(n,i.add(a.key))}};var hT=class{constructor(){this.sessionToken=Bt.EMPTY_BYTE_STRING}getSessionToken(e){return B.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,B.resolve()}};var rc=class{constructor(){this.kr=new Rt(ft.Kr),this.qr=new Rt(ft.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){let a=new ft(e,n);this.kr=this.kr.add(a),this.qr=this.qr.add(a)}$r(e,n){e.forEach(a=>this.addReference(a,n))}removeReference(e,n){this.Wr(new ft(e,n))}Qr(e,n){e.forEach(a=>this.removeReference(a,n))}Gr(e){let n=new J(new He([])),a=new ft(n,e),r=new ft(n,e+1),i=[];return this.qr.forEachInRange([a,r],s=>{this.Wr(s),i.push(s.key)}),i}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let n=new J(new He([])),a=new ft(n,e),r=new ft(n,e+1),i=ge();return this.qr.forEachInRange([a,r],s=>{i=i.add(s.key)}),i}containsKey(e){let n=new ft(e,0),a=this.kr.firstAfterOrEqual(n);return a!==null&&e.isEqual(a.key)}},ft=class{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return J.comparator(e.key,n.key)||pe(e.Hr,n.Hr)}static Ur(e,n){return pe(e.Hr,n.Hr)||J.comparator(e.key,n.key)}};var pT=class{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new Rt(ft.Kr)}checkEmpty(e){return B.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,a,r){let i=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let s=new KI(i,n,a,r);this.mutationQueue.push(s);for(let u of r)this.Jr=this.Jr.add(new ft(u.key,i)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return B.resolve(s)}lookupMutationBatch(e,n){return B.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){let a=n+1,r=this.Xr(a),i=r<0?0:r;return B.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return B.resolve(this.mutationQueue.length===0?HU:this.Yn-1)}getAllMutationBatches(e){return B.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){let a=new ft(n,0),r=new ft(n,Number.POSITIVE_INFINITY),i=[];return this.Jr.forEachInRange([a,r],s=>{let u=this.Zr(s.Hr);i.push(u)}),B.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let a=new Rt(pe);return n.forEach(r=>{let i=new ft(r,0),s=new ft(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([i,s],u=>{a=a.add(u.Hr)})}),B.resolve(this.Yr(a))}getAllMutationBatchesAffectingQuery(e,n){let a=n.path,r=a.length+1,i=a;J.isDocumentKey(i)||(i=i.child(""));let s=new ft(new J(i),0),u=new Rt(pe);return this.Jr.forEachWhile(l=>{let c=l.key.path;return!!a.isPrefixOf(c)&&(c.length===r&&(u=u.add(l.Hr)),!0)},s),B.resolve(this.Yr(u))}Yr(e){let n=[];return e.forEach(a=>{let r=this.Zr(a);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){Ke(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let a=this.Jr;return B.forEach(n.mutations,r=>{let i=new ft(r.key,n.batchId);return a=a.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=a})}nr(e){}containsKey(e,n){let a=new ft(n,0),r=this.Jr.firstAfterOrEqual(a);return B.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,B.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}};var mT=class{constructor(e){this.ti=e,this.docs=function(){return new st(J.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){let a=n.key,r=this.docs.get(a),i=r?r.size:0,s=this.ti(n);return this.docs=this.docs.insert(a,{document:n.mutableCopy(),size:s}),this.size+=s-i,this.indexManager.addToCollectionParentIndex(e,a.path.popLast())}removeEntry(e){let n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){let a=this.docs.get(n);return B.resolve(a?a.document.mutableCopy():Zn.newInvalidDocument(n))}getEntries(e,n){let a=di();return n.forEach(r=>{let i=this.docs.get(r);a=a.insert(r,i?i.document.mutableCopy():Zn.newInvalidDocument(r))}),B.resolve(a)}getDocumentsMatchingQuery(e,n,a,r){let i=di(),s=n.path,u=new J(s.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){let{key:c,value:{document:f}}=l.getNext();if(!s.isPrefixOf(c.path))break;c.path.length>s.length+1||BU(FU(f),a)<=0||(r.has(f.key)||_p(n,f))&&(i=i.insert(f.key,f.mutableCopy()))}return B.resolve(i)}getAllFromCollectionGroup(e,n,a,r){te(9500)}ni(e,n){return B.forEach(this.docs,a=>n(a))}newChangeBuffer(e){return new gT(this)}getSize(e){return B.resolve(this.size)}},gT=class extends uT{constructor(e){super(),this.Mr=e}applyChanges(e){let n=[];return this.changes.forEach((a,r)=>{r.isValidDocument()?n.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(a)}),B.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}};var yT=class{constructor(e){this.persistence=e,this.ri=new fr(n=>eS(n),tS),this.lastRemoteSnapshotVersion=ie.min(),this.highestTargetId=0,this.ii=0,this.si=new rc,this.targetCount=0,this.oi=ac._r()}forEachTarget(e,n){return this.ri.forEach((a,r)=>n(r)),B.resolve()}getLastRemoteSnapshotVersion(e){return B.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return B.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),B.resolve(this.highestTargetId)}setTargetsMetadata(e,n,a){return a&&(this.lastRemoteSnapshotVersion=a),n>this.ii&&(this.ii=n),B.resolve()}lr(e){this.ri.set(e.target,e);let n=e.targetId;n>this.highestTargetId&&(this.oi=new ac(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,B.resolve()}updateTargetData(e,n){return this.lr(n),B.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,B.resolve()}removeTargets(e,n,a){let r=0,i=[];return this.ri.forEach((s,u)=>{u.sequenceNumber<=n&&a.get(u.targetId)===null&&(this.ri.delete(s),i.push(this.removeMatchingKeysForTargetId(e,u.targetId)),r++)}),B.waitFor(i).next(()=>r)}getTargetCount(e){return B.resolve(this.targetCount)}getTargetData(e,n){let a=this.ri.get(n)||null;return B.resolve(a)}addMatchingKeys(e,n,a){return this.si.$r(n,a),B.resolve()}removeMatchingKeys(e,n,a){this.si.Qr(n,a);let r=this.persistence.referenceDelegate,i=[];return r&&n.forEach(s=>{i.push(r.markPotentiallyOrphaned(e,s))}),B.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),B.resolve()}getMatchingKeysForTargetId(e,n){let a=this.si.jr(n);return B.resolve(a)}containsKey(e,n){return B.resolve(this.si.containsKey(n))}};var Jh=class{constructor(e,n){this._i={},this.overlays={},this.ai=new bo(0),this.ui=!1,this.ui=!0,this.ci=new hT,this.referenceDelegate=e(this),this.li=new yT(this),this.indexManager=new aT,this.remoteDocumentCache=function(r){return new mT(r)}(a=>this.referenceDelegate.hi(a)),this.serializer=new nT(n),this.Pi=new dT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new fT,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let a=this._i[e.toKey()];return a||(a=new pT(n,this.referenceDelegate),this._i[e.toKey()]=a),a}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,a){K("MemoryPersistence","Starting transaction:",e);let r=new _T(this.ai.next());return this.referenceDelegate.Ti(),a(r).next(i=>this.referenceDelegate.Ii(r).next(()=>i)).toPromise().then(i=>(r.raiseOnCommittedEvent(),i))}Ei(e,n){return B.or(Object.values(this._i).map(a=>()=>a.containsKey(e,n)))}},_T=class extends PI{constructor(e){super(),this.currentSequenceNumber=e}},IT=class t{constructor(e){this.persistence=e,this.Ri=new rc,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw te(60996)}addReference(e,n,a){return this.Ri.addReference(a,n),this.di.delete(a.toString()),B.resolve()}removeReference(e,n,a){return this.Ri.removeReference(a,n),this.di.add(a.toString()),B.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),B.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(r=>this.di.add(r.toString()));let a=this.persistence.getTargetCache();return a.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(i=>this.di.add(i.toString()))}).next(()=>a.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){let n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return B.forEach(this.di,a=>{let r=J.fromPath(a);return this.mi(e,r).next(i=>{i||n.removeEntry(r,ie.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(a=>{a?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return B.or([()=>B.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}},Zh=class t{constructor(e,n){this.persistence=e,this.fi=new fr(a=>jU(a.path),(a,r)=>a.isEqual(r)),this.garbageCollector=VV(this,n)}static Vi(e,n){return new t(e,n)}Ti(){}Ii(e){return B.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){let n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(a=>n.next(r=>a+r))}pr(e){let n=0;return this.mr(e,a=>{n++}).next(()=>n)}mr(e,n){return B.forEach(this.fi,(a,r)=>this.wr(e,a,r).next(i=>i?B.resolve():n(r)))}removeTargets(e,n,a){return this.persistence.getTargetCache().removeTargets(e,n,a)}removeOrphanedDocuments(e,n){let a=0,r=this.persistence.getRemoteDocumentCache(),i=r.newChangeBuffer();return r.ni(e,s=>this.wr(e,s,n).next(u=>{u||(a++,i.removeEntry(s,ie.min()))})).next(()=>i.apply(e)).next(()=>a)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),B.resolve()}removeTarget(e,n){let a=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,a)}addReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),B.resolve()}removeReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),B.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),B.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Ph(e.data.value)),n}wr(e,n,a){return B.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{let r=this.fi.get(n);return B.resolve(r!==void 0&&r>a)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var TT=class t{constructor(e,n,a,r){this.targetId=e,this.fromCache=n,this.Ts=a,this.Is=r}static Es(e,n){let a=ge(),r=ge();for(let i of n.docChanges)switch(i.type){case 0:a=a.add(i.doc.key);break;case 1:r=r.add(i.doc.key)}return new t(e,n.fromCache,a,r)}};var ST=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var vT=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return Xb()?8:zU(xe())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,a,r){let i={result:null};return this.gs(e,n).next(s=>{i.result=s}).next(()=>{if(!i.result)return this.ps(e,n,r,a).next(s=>{i.result=s})}).next(()=>{if(i.result)return;let s=new ST;return this.ys(e,n,s).next(u=>{if(i.result=u,this.As)return this.ws(e,n,s,u.size)})}).next(()=>i.result)}ws(e,n,a,r){return a.documentReadCount<this.Vs?(yo()<=se.DEBUG&&K("QueryEngine","SDK will not create cache indexes for query:",_o(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),B.resolve()):(yo()<=se.DEBUG&&K("QueryEngine","Query:",_o(n),"scans",a.documentReadCount,"local documents and returns",r,"documents as results."),a.documentReadCount>this.ds*r?(yo()<=se.DEBUG&&K("QueryEngine","The SDK decides to create cache indexes for query:",_o(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Sa(n))):B.resolve())}gs(e,n){if(DR(n))return B.resolve(null);let a=Sa(n);return this.indexManager.getIndexType(e,a).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=Xl(n,null,"F"),a=Sa(n)),this.indexManager.getDocumentsMatchingTarget(e,a).next(i=>{let s=ge(...i);return this.fs.getDocuments(e,s).next(u=>this.indexManager.getMinOffset(e,a).next(l=>{let c=this.bs(n,u);return this.Ss(n,c,s,l.readTime)?this.gs(e,Xl(n,null,"F")):this.Ds(e,c,n,l)}))})))}ps(e,n,a,r){return DR(n)||r.isEqual(ie.min())?B.resolve(null):this.fs.getDocuments(e,a).next(i=>{let s=this.bs(n,i);return this.Ss(n,s,a,r)?B.resolve(null):(yo()<=se.DEBUG&&K("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),_o(n)),this.Ds(e,s,n,VU(r,jl)).next(u=>u))})}bs(e,n){let a=new Rt(Bx(e));return n.forEach((r,i)=>{_p(e,i)&&(a=a.add(i))}),a}Ss(e,n,a,r){if(e.limit===null)return!1;if(a.size!==n.size)return!0;let i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(r)>0)}ys(e,n,a){return yo()<=se.DEBUG&&K("QueryEngine","Using full collection scan to execute query:",_o(n)),this.fs.getDocumentsMatchingQuery(e,n,es.min(),a)}Ds(e,n,a,r){return this.fs.getDocumentsMatchingQuery(e,a,r).next(i=>(n.forEach(s=>{i=i.insert(s.key,s)}),i))}};var rS="LocalStore",FV=3e8,ET=class{constructor(e,n,a,r){this.persistence=e,this.Cs=n,this.serializer=r,this.vs=new st(pe),this.Fs=new fr(i=>eS(i),tS),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(a)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new cT(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}};function BV(t,e,n,a){return new ET(t,e,n,a)}async function o0(t,e){let n=ye(t);return await n.persistence.runTransaction("Handle user change","readonly",a=>{let r;return n.mutationQueue.getAllMutationBatches(a).next(i=>(r=i,n.Os(e),n.mutationQueue.getAllMutationBatches(a))).next(i=>{let s=[],u=[],l=ge();for(let c of r){s.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}for(let c of i){u.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}return n.localDocuments.getDocuments(a,l).next(c=>({Ns:c,removedBatchIds:s,addedBatchIds:u}))})})}function u0(t){let e=ye(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function qV(t,e){let n=ye(t),a=e.snapshotVersion,r=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{let s=n.xs.newChangeBuffer({trackRemovals:!0});r=n.vs;let u=[];e.targetChanges.forEach((f,m)=>{let p=r.get(m);if(!p)return;u.push(n.li.removeMatchingKeys(i,f.removedDocuments,m).next(()=>n.li.addMatchingKeys(i,f.addedDocuments,m)));let I=p.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?I=I.withResumeToken(Bt.EMPTY_BYTE_STRING,ie.min()).withLastLimboFreeSnapshotVersion(ie.min()):f.resumeToken.approximateByteSize()>0&&(I=I.withResumeToken(f.resumeToken,a)),r=r.insert(m,I),function(x,D,v){return x.resumeToken.approximateByteSize()===0||D.snapshotVersion.toMicroseconds()-x.snapshotVersion.toMicroseconds()>=FV?!0:v.addedDocuments.size+v.modifiedDocuments.size+v.removedDocuments.size>0}(p,I,f)&&u.push(n.li.updateTargetData(i,I))});let l=di(),c=ge();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&u.push(n.persistence.referenceDelegate.updateLimboDocument(i,f))}),u.push(zV(i,s,e.documentUpdates).next(f=>{l=f.Bs,c=f.Ls})),!a.isEqual(ie.min())){let f=n.li.getLastRemoteSnapshotVersion(i).next(m=>n.li.setTargetsMetadata(i,i.currentSequenceNumber,a));u.push(f)}return B.waitFor(u).next(()=>s.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,l,c)).next(()=>l)}).then(i=>(n.vs=r,i))}function zV(t,e,n){let a=ge(),r=ge();return n.forEach(i=>a=a.add(i)),e.getEntries(t,a).next(i=>{let s=di();return n.forEach((u,l)=>{let c=i.get(u);l.isFoundDocument()!==c.isFoundDocument()&&(r=r.add(u)),l.isNoDocument()&&l.version.isEqual(ie.min())?(e.removeEntry(u,l.readTime),s=s.insert(u,l)):!c.isValidDocument()||l.version.compareTo(c.version)>0||l.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(l),s=s.insert(u,l)):K(rS,"Ignoring outdated watch update for ",u,". Current version:",c.version," Watch version:",l.version)}),{Bs:s,Ls:r}})}function HV(t,e){let n=ye(t);return n.persistence.runTransaction("Allocate target","readwrite",a=>{let r;return n.li.getTargetData(a,e).next(i=>i?(r=i,B.resolve(r)):n.li.allocateTargetId(a).next(s=>(r=new nc(e,s,"TargetPurposeListen",a.currentSequenceNumber),n.li.addTargetData(a,r).next(()=>r))))}).then(a=>{let r=n.vs.get(a.targetId);return(r===null||a.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.vs=n.vs.insert(a.targetId,a),n.Fs.set(e,a.targetId)),a})}async function wT(t,e,n){let a=ye(t),r=a.vs.get(e),i=n?"readwrite":"readwrite-primary";try{n||await a.persistence.runTransaction("Release target",i,s=>a.persistence.referenceDelegate.removeTarget(s,r))}catch(s){if(!qo(s))throw s;K(rS,`Failed to update sequence numbers for target ${e}: ${s}`)}a.vs=a.vs.remove(e),a.Fs.delete(r.target)}function GR(t,e,n){let a=ye(t),r=ie.min(),i=ge();return a.persistence.runTransaction("Execute query","readwrite",s=>function(l,c,f){let m=ye(l),p=m.Fs.get(f);return p!==void 0?B.resolve(m.vs.get(p)):m.li.getTargetData(c,f)}(a,s,Sa(e)).next(u=>{if(u)return r=u.lastLimboFreeSnapshotVersion,a.li.getMatchingKeysForTargetId(s,u.targetId).next(l=>{i=l})}).next(()=>a.Cs.getDocumentsMatchingQuery(s,e,n?r:ie.min(),n?i:ge())).next(u=>(GV(a,lV(e),u),{documents:u,ks:i})))}function GV(t,e,n){let a=t.Ms.get(e)||ie.min();n.forEach((r,i)=>{i.readTime.compareTo(a)>0&&(a=i.readTime)}),t.Ms.set(e,a)}var ep=class{constructor(){this.activeTargetIds=mV()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var CT=class{constructor(){this.vo=new ep,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,a){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,a){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new ep,Promise.resolve()}handleUserChange(e,n,a){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var AT=class{Mo(e){}shutdown(){}};var jR="ConnectivityMonitor",tp=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){K(jR,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){K(jR,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var Dh=null;function bT(){return Dh===null?Dh=function(){return 268435456+Math.round(2147483648*Math.random())}():Dh++,"0x"+Dh.toString(16)}var AI="RestConnection",jV={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},LT=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let n=e.ssl?"https":"http",a=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${a}/databases/${r}`,this.$o=this.databaseId.database===Gh?`project_id=${a}`:`project_id=${a}&database_id=${r}`}Wo(e,n,a,r,i){let s=bT(),u=this.Qo(e,n.toUriEncodedString());K(AI,`Sending RPC '${e}' ${s}:`,u,a);let l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,r,i);let{host:c}=new URL(u),f=Qt(c);return this.zo(e,u,l,a,f).then(m=>(K(AI,`Received RPC '${e}' ${s}: `,m),m),m=>{throw or(AI,`RPC '${e}' ${s} failed with error: `,m,"url: ",u,"request:",a),m})}jo(e,n,a,r,i,s){return this.Wo(e,n,a,r,i)}Go(e,n,a){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Fo}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,i)=>e[i]=r),a&&a.headers.forEach((r,i)=>e[i]=r)}Qo(e,n){let a=jV[e],r=`${this.qo}/v1/${n}:${a}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var RT=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var zt="WebChannelConnection",Bl=(t,e,n)=>{t.listen(e,a=>{try{n(a)}catch(r){setTimeout(()=>{throw r},0)}})},np=class t extends LT{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=SI();Bl(e,TI.STAT_EVENT,n=>{n.stat===Rh.PROXY?K(zt,"STAT_EVENT: detected buffering proxy"):n.stat===Rh.NOPROXY&&K(zt,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,n,a,r,i){let s=bT();return new Promise((u,l)=>{let c=new _I;c.setWithCredentials(!0),c.listenOnce(II.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case Fl.NO_ERROR:let m=c.getResponseJson();K(zt,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(m)),u(m);break;case Fl.TIMEOUT:K(zt,`RPC '${e}' ${s} timed out`),l(new G(F.DEADLINE_EXCEEDED,"Request time out"));break;case Fl.HTTP_ERROR:let p=c.getStatus();if(K(zt,`RPC '${e}' ${s} failed with status:`,p,"response text:",c.getResponseText()),p>0){let I=c.getResponseJson();Array.isArray(I)&&(I=I[0]);let b=I?.error;if(b&&b.status&&b.message){let x=function(v){let S=v.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(S)>=0?S:F.UNKNOWN}(b.status);l(new G(x,b.message))}else l(new G(F.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new G(F.UNAVAILABLE,"Connection failed."));break;default:te(9055,{l_:e,streamId:s,h_:c.getLastErrorCode(),P_:c.getLastError()})}}finally{K(zt,`RPC '${e}' ${s} completed.`)}});let f=JSON.stringify(r);K(zt,`RPC '${e}' ${s} sending request:`,r),c.send(n,"POST",f,a,15)})}T_(e,n,a){let r=bT(),i=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],s=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(u.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,n,a),u.encodeInitMessageHeaders=!0;let c=i.join("");K(zt,`Creating RPC '${e}' stream ${r}: ${c}`,u);let f=s.createWebChannel(c,u);this.I_(f);let m=!1,p=!1,I=new RT({Ho:b=>{p?K(zt,`Not sending because RPC '${e}' stream ${r} is closed:`,b):(m||(K(zt,`Opening RPC '${e}' stream ${r} transport.`),f.open(),m=!0),K(zt,`RPC '${e}' stream ${r} sending:`,b),f.send(b))},Jo:()=>f.close()});return Bl(f,go.EventType.OPEN,()=>{p||(K(zt,`RPC '${e}' stream ${r} transport opened.`),I.i_())}),Bl(f,go.EventType.CLOSE,()=>{p||(p=!0,K(zt,`RPC '${e}' stream ${r} transport closed`),I.o_(),this.E_(f))}),Bl(f,go.EventType.ERROR,b=>{p||(p=!0,or(zt,`RPC '${e}' stream ${r} transport errored. Name:`,b.name,"Message:",b.message),I.o_(new G(F.UNAVAILABLE,"The operation could not be completed")))}),Bl(f,go.EventType.MESSAGE,b=>{if(!p){let x=b.data[0];Ke(!!x,16349);let D=x,v=D?.error||D[0]?.error;if(v){K(zt,`RPC '${e}' stream ${r} received error:`,v);let S=v.status,A=function(V){let T=dt[V];if(T!==void 0)return Qx(T)}(S),R=v.message;S==="NOT_FOUND"&&R.includes("database")&&R.includes("does not exist")&&R.includes(this.databaseId.database)&&or(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),A===void 0&&(A=F.INTERNAL,R="Unknown error status: "+S+" with message "+v.message),p=!0,I.o_(new G(A,R)),f.close()}else K(zt,`RPC '${e}' stream ${r} received:`,x),I.__(x)}}),t.u_(),setTimeout(()=>{I.s_()},0),I}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,a){super.Go(e,n,a),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return vI()}};function WV(t){return new np(t)}function bI(){return typeof document<"u"?document:null}function hc(t){return new JI(t,!0)}np.c_=!1;var ap=class{constructor(e,n,a=1e3,r=1.5,i=6e4){this.Ci=e,this.timerId=n,this.R_=a,this.A_=r,this.V_=i,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let n=Math.floor(this.d_+this.y_()),a=Math.max(0,Date.now()-this.f_),r=Math.max(0,n-a);r>0&&K("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${a} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var WR="PersistentStream",xT=class{constructor(e,n,a,r,i,s,u,l){this.Ci=e,this.b_=a,this.S_=r,this.connection=i,this.authCredentialsProvider=s,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new ap(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===F.RESOURCE_EXHAUSTED?(sr(n.toString()),sr("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([a,r])=>{this.D_===n&&this.G_(a,r)},a=>{e(()=>{let r=new G(F.UNKNOWN,"Fetching auth token failed: "+a.message);return this.z_(r)})})}G_(e,n){let a=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{a(()=>this.listener.Zo())}),this.stream.Yo(()=>{a(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{a(()=>this.z_(r))}),this.stream.onMessage(r=>{a(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return K(WR,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():(K(WR,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},kT=class extends xT{constructor(e,n,a,r,i,s){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,a,r,s),this.serializer=i}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let n=RV(this.serializer,e),a=function(i){if(!("targetChange"in i))return ie.min();let s=i.targetChange;return s.targetIds&&s.targetIds.length?ie.min():s.readTime?wo(s.readTime):ie.min()}(e);return this.listener.J_(n,a)}Z_(e){let n={};n.database=BR(this.serializer),n.addTarget=function(i,s){let u,l=s.target;if(u=WI(l)?{documents:xV(i,l)}:{query:kV(i,l).ft},u.targetId=s.targetId,s.resumeToken.approximateByteSize()>0){u.resumeToken=Xx(i,s.resumeToken);let c=ZI(i,s.expectedCount);c!==null&&(u.expectedCount=c)}else if(s.snapshotVersion.compareTo(ie.min())>0){u.readTime=eT(i,s.snapshotVersion.toTimestamp());let c=ZI(i,s.expectedCount);c!==null&&(u.expectedCount=c)}return u}(this.serializer,e);let a=PV(this.serializer,e);a&&(n.labels=a),this.K_(n)}X_(e){let n={};n.database=BR(this.serializer),n.removeTarget=e,this.K_(n)}};var DT=class{},PT=class extends DT{constructor(e,n,a,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=a,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new G(F.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,a,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,s])=>this.connection.Wo(e,tT(n,a),r,i,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new G(F.UNKNOWN,i.toString())})}jo(e,n,a,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,u])=>this.connection.jo(e,tT(n,a),r,s,u,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new G(F.UNKNOWN,s.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function KV(t,e,n,a){return new PT(t,e,n,a)}var OT=class{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(sr(n),this.aa=!1):K("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var No="RemoteStore",NT=class{constructor(e,n,a,r,i){this.localStore=e,this.datastore=n,this.asyncQueue=a,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=i,this.Aa.Mo(s=>{a.enqueueAndForget(async()=>{mc(this)&&(K(No,"Restarting streams for network reachability change."),await async function(l){let c=ye(l);c.Ea.add(4),await pc(c),c.Va.set("Unknown"),c.Ea.delete(4),await Ip(c)}(this))})}),this.Va=new OT(a,r)}};async function Ip(t){if(mc(t))for(let e of t.Ra)await e(!0)}async function pc(t){for(let e of t.Ra)await e(!1)}function l0(t,e){let n=ye(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),uS(n)?oS(n):Ho(n).O_()&&sS(n,e))}function iS(t,e){let n=ye(t),a=Ho(n);n.Ia.delete(e),a.O_()&&c0(n,e),n.Ia.size===0&&(a.O_()?a.L_():mc(n)&&n.Va.set("Unknown"))}function sS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(ie.min())>0){let n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Ho(t).Z_(e)}function c0(t,e){t.da.$e(e),Ho(t).X_(e)}function oS(t){t.da=new $I({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),Ho(t).start(),t.Va.ua()}function uS(t){return mc(t)&&!Ho(t).x_()&&t.Ia.size>0}function mc(t){return ye(t).Ea.size===0}function d0(t){t.da=void 0}async function YV(t){t.Va.set("Online")}async function QV(t){t.Ia.forEach((e,n)=>{sS(t,e)})}async function XV(t,e){d0(t),uS(t)?(t.Va.ha(e),oS(t)):t.Va.set("Unknown")}async function $V(t,e,n){if(t.Va.set("Online"),e instanceof Qh&&e.state===2&&e.cause)try{await async function(r,i){let s=i.cause;for(let u of i.targetIds)r.Ia.has(u)&&(await r.remoteSyncer.rejectListen(u,s),r.Ia.delete(u),r.da.removeTarget(u))}(t,e)}catch(a){K(No,"Failed to remove targets %s: %s ",e.targetIds.join(","),a),await KR(t,a)}else if(e instanceof Eo?t.da.Xe(e):e instanceof Yh?t.da.st(e):t.da.tt(e),!n.isEqual(ie.min()))try{let a=await u0(t.localStore);n.compareTo(a)>=0&&await function(i,s){let u=i.da.Tt(s);return u.targetChanges.forEach((l,c)=>{if(l.resumeToken.approximateByteSize()>0){let f=i.Ia.get(c);f&&i.Ia.set(c,f.withResumeToken(l.resumeToken,s))}}),u.targetMismatches.forEach((l,c)=>{let f=i.Ia.get(l);if(!f)return;i.Ia.set(l,f.withResumeToken(Bt.EMPTY_BYTE_STRING,f.snapshotVersion)),c0(i,l);let m=new nc(f.target,l,c,f.sequenceNumber);sS(i,m)}),i.remoteSyncer.applyRemoteEvent(u)}(t,n)}catch(a){K(No,"Failed to raise snapshot:",a),await KR(t,a)}}async function KR(t,e,n){if(!qo(e))throw e;t.Ea.add(1),await pc(t),t.Va.set("Offline"),n||(n=()=>u0(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{K(No,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await Ip(t)})}async function YR(t,e){let n=ye(t);n.asyncQueue.verifyOperationInProgress(),K(No,"RemoteStore received new credentials");let a=mc(n);n.Ea.add(3),await pc(n),a&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await Ip(n)}async function JV(t,e){let n=ye(t);e?(n.Ea.delete(2),await Ip(n)):e||(n.Ea.add(2),await pc(n),n.Va.set("Unknown"))}function Ho(t){return t.ma||(t.ma=function(n,a,r){let i=ye(n);return i.sa(),new kT(a,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,r)}(t.datastore,t.asyncQueue,{Zo:YV.bind(null,t),Yo:QV.bind(null,t),t_:XV.bind(null,t),J_:$V.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),uS(t)?oS(t):t.Va.set("Unknown")):(await t.ma.stop(),d0(t))})),t.ma}var MT=class t{constructor(e,n,a,r,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=a,this.op=r,this.removalCallback=i,this.deferred=new rr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(s=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,a,r,i){let s=Date.now()+a,u=new t(e,n,s,r,i);return u.start(a),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new G(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function f0(t,e){if(sr("AsyncQueue",`${e}: ${t}`),qo(t))return new G(F.UNAVAILABLE,`${e}: ${t}`);throw t}var ic=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(n,a)=>e(n,a)||J.comparator(n.key,a.key):(n,a)=>J.comparator(n.key,a.key),this.keyedMap=ql(),this.sortedSet=new st(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,a)=>(e(n),!1))}add(e){let n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){let n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.sortedSet.getIterator(),a=e.sortedSet.getIterator();for(;n.hasNext();){let r=n.getNext().key,i=a.getNext().key;if(!r.isEqual(i))return!1}return!0}toString(){let e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){let a=new t;return a.comparator=this.comparator,a.keyedMap=e,a.sortedSet=n,a}};var rp=class{constructor(){this.ga=new st(J.comparator)}track(e){let n=e.doc.key,a=this.ga.get(n);a?e.type!==0&&a.type===3?this.ga=this.ga.insert(n,e):e.type===3&&a.type!==1?this.ga=this.ga.insert(n,{type:a.type,doc:e.doc}):e.type===2&&a.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&a.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&a.type===0?this.ga=this.ga.remove(n):e.type===1&&a.type===2?this.ga=this.ga.insert(n,{type:1,doc:a.doc}):e.type===0&&a.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):te(63341,{Vt:e,pa:a}):this.ga=this.ga.insert(n,e)}ya(){let e=[];return this.ga.inorderTraversal((n,a)=>{e.push(a)}),e}},ts=class t{constructor(e,n,a,r,i,s,u,l,c){this.query=e,this.docs=n,this.oldDocs=a,this.docChanges=r,this.mutatedKeys=i,this.fromCache=s,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=c}static fromInitialDocuments(e,n,a,r,i){let s=[];return n.forEach(u=>{s.push({type:0,doc:u})}),new t(e,n,ic.emptySet(n),s,a,r,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&yp(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let n=this.docChanges,a=e.docChanges;if(n.length!==a.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==a[r].type||!n[r].doc.isEqual(a[r].doc))return!1;return!0}};var UT=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},VT=class{constructor(){this.queries=QR(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,a){let r=ye(n),i=r.queries;r.queries=QR(),i.forEach((s,u)=>{for(let l of u.ba)l.onError(a)})})(this,new G(F.ABORTED,"Firestore shutting down"))}};function QR(){return new fr(t=>Fx(t),yp)}async function ZV(t,e){let n=ye(t),a=3,r=e.query,i=n.queries.get(r);i?!i.Sa()&&e.Da()&&(a=2):(i=new UT,a=e.Da()?0:1);try{switch(a){case 0:i.wa=await n.onListen(r,!0);break;case 1:i.wa=await n.onListen(r,!1);break;case 2:await n.onFirstRemoteStoreListen(r)}}catch(s){let u=f0(s,`Initialization of query '${_o(e.query)}' failed`);return void e.onError(u)}n.queries.set(r,i),i.ba.push(e),e.va(n.onlineState),i.wa&&e.Fa(i.wa)&&lS(n)}async function eF(t,e){let n=ye(t),a=e.query,r=3,i=n.queries.get(a);if(i){let s=i.ba.indexOf(e);s>=0&&(i.ba.splice(s,1),i.ba.length===0?r=e.Da()?0:1:!i.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return n.queries.delete(a),n.onUnlisten(a,!0);case 1:return n.queries.delete(a),n.onUnlisten(a,!1);case 2:return n.onLastRemoteStoreUnlisten(a);default:return}}function tF(t,e){let n=ye(t),a=!1;for(let r of e){let i=r.query,s=n.queries.get(i);if(s){for(let u of s.ba)u.Fa(r)&&(a=!0);s.wa=r}}a&&lS(n)}function nF(t,e,n){let a=ye(t),r=a.queries.get(e);if(r)for(let i of r.ba)i.onError(n);a.queries.delete(e)}function lS(t){t.Ca.forEach(e=>{e.next()})}var FT,XR;(XR=FT||(FT={})).Ma="default",XR.Cache="cache";var BT=class{constructor(e,n,a){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=a||{}}Fa(e){if(!this.options.includeMetadataChanges){let a=[];for(let r of e.docChanges)r.type!==3&&a.push(r);e=new ts(e.query,e.docs,e.oldDocs,a,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;let a=n!=="Offline";return(!this.options.Ka||!a)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=ts.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==FT.Cache}};var ip=class{constructor(e){this.key=e}},sp=class{constructor(e){this.key=e}},qT=class{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=ge(),this.mutatedKeys=ge(),this.eu=Bx(e),this.tu=new ic(this.eu)}get nu(){return this.Za}ru(e,n){let a=n?n.iu:new rp,r=n?n.tu:this.tu,i=n?n.mutatedKeys:this.mutatedKeys,s=r,u=!1,l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,c=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((f,m)=>{let p=r.get(f),I=_p(this.query,m)?m:null,b=!!p&&this.mutatedKeys.has(p.key),x=!!I&&(I.hasLocalMutations||this.mutatedKeys.has(I.key)&&I.hasCommittedMutations),D=!1;p&&I?p.data.isEqual(I.data)?b!==x&&(a.track({type:3,doc:I}),D=!0):this.su(p,I)||(a.track({type:2,doc:I}),D=!0,(l&&this.eu(I,l)>0||c&&this.eu(I,c)<0)&&(u=!0)):!p&&I?(a.track({type:0,doc:I}),D=!0):p&&!I&&(a.track({type:1,doc:p}),D=!0,(l||c)&&(u=!0)),D&&(I?(s=s.add(I),i=x?i.add(f):i.delete(f)):(s=s.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;s.size>this.query.limit;){let f=this.query.limitType==="F"?s.last():s.first();s=s.delete(f.key),i=i.delete(f.key),a.track({type:1,doc:f})}return{tu:s,iu:a,Ss:u,mutatedKeys:i}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,a,r){let i=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let s=e.iu.ya();s.sort((f,m)=>function(I,b){let x=D=>{switch(D){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return te(20277,{Vt:D})}};return x(I)-x(b)}(f.type,m.type)||this.eu(f.doc,m.doc)),this.ou(a),r=r??!1;let u=n&&!r?this._u():[],l=this.Ya.size===0&&this.current&&!r?1:0,c=l!==this.Xa;return this.Xa=l,s.length!==0||c?{snapshot:new ts(this.query,e.tu,i,s,e.mutatedKeys,l===0,c,!1,!!a&&a.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new rp,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=ge(),this.tu.forEach(a=>{this.uu(a.key)&&(this.Ya=this.Ya.add(a.key))});let n=[];return e.forEach(a=>{this.Ya.has(a)||n.push(new sp(a))}),this.Ya.forEach(a=>{e.has(a)||n.push(new ip(a))}),n}cu(e){this.Za=e.ks,this.Ya=ge();let n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return ts.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},cS="SyncEngine",zT=class{constructor(e,n,a){this.query=e,this.targetId=n,this.view=a}},HT=class{constructor(e){this.key=e,this.hu=!1}},GT=class{constructor(e,n,a,r,i,s){this.localStore=e,this.remoteStore=n,this.eventManager=a,this.sharedClientState=r,this.currentUser=i,this.maxConcurrentLimboResolutions=s,this.Pu={},this.Tu=new fr(u=>Fx(u),yp),this.Iu=new Map,this.Eu=new Set,this.Ru=new st(J.comparator),this.Au=new Map,this.Vu=new rc,this.du={},this.mu=new Map,this.fu=ac.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function aF(t,e,n=!0){let a=y0(t),r,i=a.Tu.get(e);return i?(a.sharedClientState.addLocalQueryTarget(i.targetId),r=i.view.lu()):r=await h0(a,e,n,!0),r}async function rF(t,e){let n=y0(t);await h0(n,e,!0,!1)}async function h0(t,e,n,a){let r=await HV(t.localStore,Sa(e)),i=r.targetId,s=t.sharedClientState.addLocalQueryTarget(i,n),u;return a&&(u=await iF(t,e,i,s==="current",r.resumeToken)),t.isPrimaryClient&&n&&l0(t.remoteStore,r),u}async function iF(t,e,n,a,r){t.pu=(m,p,I)=>async function(x,D,v,S){let A=D.view.ru(v);A.Ss&&(A=await GR(x.localStore,D.query,!1).then(({documents:T})=>D.view.ru(T,A)));let R=S&&S.targetChanges.get(D.targetId),q=S&&S.targetMismatches.get(D.targetId)!=null,V=D.view.applyChanges(A,x.isPrimaryClient,R,q);return JR(x,D.targetId,V.au),V.snapshot}(t,m,p,I);let i=await GR(t.localStore,e,!0),s=new qT(e,i.ks),u=s.ru(i.documents),l=tc.createSynthesizedTargetChangeForCurrentChange(n,a&&t.onlineState!=="Offline",r),c=s.applyChanges(u,t.isPrimaryClient,l);JR(t,n,c.au);let f=new zT(e,n,s);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),c.snapshot}async function sF(t,e,n){let a=ye(t),r=a.Tu.get(e),i=a.Iu.get(r.targetId);if(i.length>1)return a.Iu.set(r.targetId,i.filter(s=>!yp(s,e))),void a.Tu.delete(e);a.isPrimaryClient?(a.sharedClientState.removeLocalQueryTarget(r.targetId),a.sharedClientState.isActiveQueryTarget(r.targetId)||await wT(a.localStore,r.targetId,!1).then(()=>{a.sharedClientState.clearQueryState(r.targetId),n&&iS(a.remoteStore,r.targetId),jT(a,r.targetId)}).catch(fp)):(jT(a,r.targetId),await wT(a.localStore,r.targetId,!0))}async function oF(t,e){let n=ye(t),a=n.Tu.get(e),r=n.Iu.get(a.targetId);n.isPrimaryClient&&r.length===1&&(n.sharedClientState.removeLocalQueryTarget(a.targetId),iS(n.remoteStore,a.targetId))}async function p0(t,e){let n=ye(t);try{let a=await qV(n.localStore,e);e.targetChanges.forEach((r,i)=>{let s=n.Au.get(i);s&&(Ke(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?s.hu=!0:r.modifiedDocuments.size>0?Ke(s.hu,14607):r.removedDocuments.size>0&&(Ke(s.hu,42227),s.hu=!1))}),await g0(n,a,e)}catch(a){await fp(a)}}function $R(t,e,n){let a=ye(t);if(a.isPrimaryClient&&n===0||!a.isPrimaryClient&&n===1){let r=[];a.Tu.forEach((i,s)=>{let u=s.view.va(e);u.snapshot&&r.push(u.snapshot)}),function(s,u){let l=ye(s);l.onlineState=u;let c=!1;l.queries.forEach((f,m)=>{for(let p of m.ba)p.va(u)&&(c=!0)}),c&&lS(l)}(a.eventManager,e),r.length&&a.Pu.J_(r),a.onlineState=e,a.isPrimaryClient&&a.sharedClientState.setOnlineState(e)}}async function uF(t,e,n){let a=ye(t);a.sharedClientState.updateQueryState(e,"rejected",n);let r=a.Au.get(e),i=r&&r.key;if(i){let s=new st(J.comparator);s=s.insert(i,Zn.newNoDocument(i,ie.min()));let u=ge().add(i),l=new Kh(ie.min(),new Map,new st(pe),s,u);await p0(a,l),a.Ru=a.Ru.remove(i),a.Au.delete(e),dS(a)}else await wT(a.localStore,e,!1).then(()=>jT(a,e,n)).catch(fp)}function jT(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(let a of t.Iu.get(e))t.Tu.delete(a),n&&t.Pu.yu(a,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(a=>{t.Vu.containsKey(a)||m0(t,a)})}function m0(t,e){t.Eu.delete(e.path.canonicalString());let n=t.Ru.get(e);n!==null&&(iS(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),dS(t))}function JR(t,e,n){for(let a of n)a instanceof ip?(t.Vu.addReference(a.key,e),lF(t,a)):a instanceof sp?(K(cS,"Document no longer in limbo: "+a.key),t.Vu.removeReference(a.key,e),t.Vu.containsKey(a.key)||m0(t,a.key)):te(19791,{wu:a})}function lF(t,e){let n=e.key,a=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(a)||(K(cS,"New document in limbo: "+n),t.Eu.add(a),dS(t))}function dS(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let n=new J(He.fromString(e)),a=t.fu.next();t.Au.set(a,new HT(n)),t.Ru=t.Ru.insert(n,a),l0(t.remoteStore,new nc(Sa(nS(n.path)),a,"TargetPurposeLimboResolution",bo.ce))}}async function g0(t,e,n){let a=ye(t),r=[],i=[],s=[];a.Tu.isEmpty()||(a.Tu.forEach((u,l)=>{s.push(a.pu(l,e,n).then(c=>{if((c||n)&&a.isPrimaryClient){let f=c?!c.fromCache:n?.targetChanges.get(l.targetId)?.current;a.sharedClientState.updateQueryState(l.targetId,f?"current":"not-current")}if(c){r.push(c);let f=TT.Es(l.targetId,c);i.push(f)}}))}),await Promise.all(s),a.Pu.J_(r),await async function(l,c){let f=ye(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>B.forEach(c,p=>B.forEach(p.Ts,I=>f.persistence.referenceDelegate.addReference(m,p.targetId,I)).next(()=>B.forEach(p.Is,I=>f.persistence.referenceDelegate.removeReference(m,p.targetId,I)))))}catch(m){if(!qo(m))throw m;K(rS,"Failed to update sequence numbers: "+m)}for(let m of c){let p=m.targetId;if(!m.fromCache){let I=f.vs.get(p),b=I.snapshotVersion,x=I.withLastLimboFreeSnapshotVersion(b);f.vs=f.vs.insert(p,x)}}}(a.localStore,i))}async function cF(t,e){let n=ye(t);if(!n.currentUser.isEqual(e)){K(cS,"User change. New user:",e.toKey());let a=await o0(n.localStore,e);n.currentUser=e,function(i,s){i.mu.forEach(u=>{u.forEach(l=>{l.reject(new G(F.CANCELLED,s))})}),i.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,a.removedBatchIds,a.addedBatchIds),await g0(n,a.Ns)}}function dF(t,e){let n=ye(t),a=n.Au.get(e);if(a&&a.hu)return ge().add(a.key);{let r=ge(),i=n.Iu.get(e);if(!i)return r;for(let s of i){let u=n.Tu.get(s);r=r.unionWith(u.view.nu)}return r}}function y0(t){let e=ye(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=p0.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=dF.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=uF.bind(null,e),e.Pu.J_=tF.bind(null,e.eventManager),e.Pu.yu=nF.bind(null,e.eventManager),e}var ns=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=hc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return BV(this.persistence,new vT,e.initialUser,this.serializer)}Cu(e){return new Jh(IT.Vi,this.serializer)}Du(e){return new CT}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};ns.provider={build:()=>new ns};var op=class extends ns{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){Ke(this.persistence.referenceDelegate instanceof Zh,46915);let a=this.persistence.referenceDelegate.garbageCollector;return new sT(a,e.asyncQueue,n)}Cu(e){let n=this.cacheSizeBytes!==void 0?zn.withCacheSize(this.cacheSizeBytes):zn.DEFAULT;return new Jh(a=>Zh.Vi(a,n),this.serializer)}};var Mo=class{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=a=>$R(this.syncEngine,a,1),this.remoteStore.remoteSyncer.handleCredentialChange=cF.bind(null,this.syncEngine),await JV(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new VT}()}createDatastore(e){let n=hc(e.databaseInfo.databaseId),a=WV(e.databaseInfo);return KV(e.authCredentials,e.appCheckCredentials,a,n)}createRemoteStore(e){return function(a,r,i,s,u){return new NT(a,r,i,s,u)}(this.localStore,this.datastore,e.asyncQueue,n=>$R(this.syncEngine,n,0),function(){return tp.v()?new tp:new AT}())}createSyncEngine(e,n){return function(r,i,s,u,l,c,f){let m=new GT(r,i,s,u,l,c);return f&&(m.gu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){await async function(n){let a=ye(n);K(No,"RemoteStore shutting down."),a.Ea.add(5),await pc(a),a.Aa.shutdown(),a.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};Mo.provider={build:()=>new Mo};var WT=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):sr("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}};var fi="FirestoreClient",KT=class{constructor(e,n,a,r,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=a,this._databaseInfo=r,this.user=Lt.UNAUTHENTICATED,this.clientId=Co.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(a,async s=>{K(fi,"Received user=",s.uid),await this.authCredentialListener(s),this.user=s}),this.appCheckCredentials.start(a,s=>(K(fi,"Received new app check token=",s),this.appCheckCredentialListener(s,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new rr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){let a=f0(n,"Failed to shutdown persistence");e.reject(a)}}),e.promise}};async function LI(t,e){t.asyncQueue.verifyOperationInProgress(),K(fi,"Initializing OfflineComponentProvider");let n=t.configuration;await e.initialize(n);let a=n.initialUser;t.setCredentialChangeListener(async r=>{a.isEqual(r)||(await o0(e.localStore,r),a=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function ZR(t,e){t.asyncQueue.verifyOperationInProgress();let n=await fF(t);K(fi,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(a=>YR(e.remoteStore,a)),t.setAppCheckTokenChangeListener((a,r)=>YR(e.remoteStore,r)),t._onlineComponents=e}async function fF(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){K(fi,"Using user provided OfflineComponentProvider");try{await LI(t,t._uninitializedComponentsProvider._offline)}catch(e){let n=e;if(!function(r){return r.name==="FirebaseError"?r.code===F.FAILED_PRECONDITION||r.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(n))throw n;or("Error using user provided cache. Falling back to memory cache: "+n),await LI(t,new ns)}}else K(fi,"Using default OfflineComponentProvider"),await LI(t,new op(void 0));return t._offlineComponents}async function hF(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(K(fi,"Using user provided OnlineComponentProvider"),await ZR(t,t._uninitializedComponentsProvider._online)):(K(fi,"Using default OnlineComponentProvider"),await ZR(t,new Mo))),t._onlineComponents}async function pF(t){let e=await hF(t),n=e.eventManager;return n.onListen=aF.bind(null,e.syncEngine),n.onUnlisten=sF.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=rF.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=oF.bind(null,e.syncEngine),n}function _0(t,e,n={}){let a=new rr;return t.asyncQueue.enqueueAndForget(async()=>function(i,s,u,l,c){let f=new WT({next:p=>{f.Nu(),s.enqueueAndForget(()=>eF(i,m)),p.fromCache&&l.source==="server"?c.reject(new G(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(p)},error:p=>c.reject(p)}),m=new BT(u,f,{includeMetadataChanges:!0,Ka:!0});return ZV(i,m)}(await pF(t),t.asyncQueue,e,n,a)),a.promise}function I0(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var mF="ComponentProvider",ex=new Map;function gF(t,e,n,a,r){return new OI(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,I0(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,a)}var T0="firestore.googleapis.com",tx=!0,up=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new G(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=T0,this.ssl=tx}else this.host=e.host,this.ssl=e.ssl??tx;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=s0;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<UV)throw new G(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}sx("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=I0(e.experimentalLongPollingOptions??{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new G(F.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new G(F.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new G(F.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(a,r){return a.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},sc=class{constructor(e,n,a,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=a,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new up({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new G(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new G(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new up(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(a){if(!a)return new Mh;switch(a.type){case"firstParty":return new kI(a.sessionIndex||"0",a.iamToken||null,a.authTokenFactory||null);case"provider":return a.client;default:throw new G(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){let a=ex.get(n);a&&(K(mF,"Removing Datastore"),ex.delete(n),a.terminate())}(this),Promise.resolve()}};function S0(t,e,n,a={}){t=cc(t,sc);let r=Qt(e),i=t._getSettings(),s={...i,emulatorOptions:t._getEmulatorOptions()},u=`${e}:${n}`;r&&(ri(`https://${u}`),ii("Firestore",!0)),i.host!==T0&&i.host!==u&&or("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...i,host:u,ssl:r,emulatorOptions:a};if(!Xt(l,s)&&(t._setSettings(l),a.mockUserToken)){let c,f;if(typeof a.mockUserToken=="string")c=a.mockUserToken,f=Lt.MOCK_USER;else{c=Kf(a.mockUserToken,t._app?.options.projectId);let m=a.mockUserToken.sub||a.mockUserToken.user_id;if(!m)throw new G(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new Lt(m)}t._authCredentials=new RI(new Nh(c,f))}}var ea=class t{constructor(e,n,a){this.converter=n,this._query=a,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},ln=class t{constructor(e,n,a){this.converter=n,this._key=a,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ji(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,a){if(Bo(n,t._jsonSchema))return new t(e,a||null,new J(He.fromString(n.referencePath)))}};ln._jsonSchemaVersion="firestore/documentReference/1.0",ln._jsonSchema={type:it("string",ln._jsonSchemaVersion),referencePath:it("string")};var Ji=class t extends ea{constructor(e,n,a){super(e,n,nS(a)),this._path=a,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new ln(this.firestore,null,new J(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function gc(t,e,...n){if(t=Oe(t),UU("collection","path",e),t instanceof sc){let a=He.fromString(e,...n);return TR(a),new Ji(t,null,a)}{if(!(t instanceof ln||t instanceof Ji))throw new G(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let a=t._path.child(He.fromString(e,...n));return TR(a),new Ji(t.firestore,null,a)}}var nx="AsyncQueue",lp=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new ap(this,"async_queue_retry"),this._c=()=>{let a=bI();a&&K(nx,"Visibility state changed to "+a.visibilityState),this.M_.w_()},this.ac=e;let n=bI();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let n=bI();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let n=new rr;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!qo(e))throw e;K(nx,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let n=this.ac.then(()=>(this.rc=!0,e().catch(a=>{throw this.nc=a,this.rc=!1,sr("INTERNAL UNHANDLED ERROR: ",ax(a)),a}).then(a=>(this.rc=!1,a))));return this.ac=n,n}enqueueAfterDelay(e,n,a){this.uc(),this.oc.indexOf(e)>-1&&(n=0);let r=MT.createAndSchedule(this,e,n,a,i=>this.hc(i));return this.tc.push(r),r}uc(){this.nc&&te(47125,{Pc:ax(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,a)=>n.targetTimeMs-a.targetTimeMs);for(let n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let n=this.tc.indexOf(e);this.tc.splice(n,1)}};function ax(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var Uo=class extends sc{constructor(e,n,a,r){super(e,n,a,r),this.type="firestore",this._queue=new lp,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new lp(e),this._firestoreClient=void 0,await e}}};function yc(t,e){let n=typeof t=="object"?t:oi(),a=typeof t=="string"?t:e||Gh,r=Xn(n,"firestore").getImmediate({identifier:a});if(!r._initialized){let i=Wf("firestore");i&&S0(r,...i)}return r}function fS(t){if(t._terminated)throw new G(F.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||yF(t),t._firestoreClient}function yF(t){let e=t._freezeSettings(),n=gF(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new KT(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(r){let i=r?._online.build();return{_offline:r?._offline.build(i),_online:i}}(t._componentsProvider))}var va=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(Bt.fromBase64String(e))}catch(n){throw new G(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new t(Bt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Bo(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};va._jsonSchemaVersion="firestore/bytes/1.0",va._jsonSchema={type:it("string",va._jsonSchemaVersion),bytes:it("string")};var Vo=class{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new G(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Cn(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var oc=class{constructor(e){this._methodName=e}};var ir=class t{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new G(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new G(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return pe(this._lat,e._lat)||pe(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(Bo(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};ir._jsonSchemaVersion="firestore/geoPoint/1.0",ir._jsonSchema={type:it("string",ir._jsonSchemaVersion),latitude:it("number"),longitude:it("number")};var Ea=class t{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(a,r){if(a.length!==r.length)return!1;for(let i=0;i<a.length;++i)if(a[i]!==r[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Bo(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new t(e.vectorValues);throw new G(F.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};Ea._jsonSchemaVersion="firestore/vectorValue/1.0",Ea._jsonSchema={type:it("string",Ea._jsonSchemaVersion),vectorValues:it("object")};var _F=/^__.*__$/;function v0(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw te(40011,{dataSource:t})}}var YT=class t{constructor(e,n,a,r,i,s){this.settings=e,this.databaseId=n,this.serializer=a,this.ignoreUndefinedProperties=r,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=s||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePathSegment(e),a}childContextForFieldPath(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePath(),a}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return cp(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(v0(this.dataSource)&&_F.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},QT=class{constructor(e,n,a){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=a||hc(e)}createContext(e,n,a,r=!1){return new YT({dataSource:e,methodName:n,targetDoc:a,path:Cn.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function hS(t){let e=t._freezeSettings(),n=hc(t._databaseId);return new QT(t._databaseId,!!e.ignoreUndefinedProperties,n)}function pS(t,e,n,a=!1){return mS(n,t.createContext(a?4:3,e))}function mS(t,e){if(E0(t=Oe(t)))return TF("Unsupported field value:",e,t),IF(t,e);if(t instanceof oc)return function(a,r){if(!v0(r.dataSource))throw r.createError(`${a._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${a._methodName}() is not currently supported inside arrays`);let i=a._toFieldTransform(r);i&&r.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(a,r){let i=[],s=0;for(let u of a){let l=mS(u,r.childContextForArray(s));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),s++}return{arrayValue:{values:i}}}(t,e)}return function(a,r){if((a=Oe(a))===null)return{nullValue:"NULL_VALUE"};if(typeof a=="number")return gV(r.serializer,a);if(typeof a=="boolean")return{booleanValue:a};if(typeof a=="string")return{stringValue:a};if(a instanceof Date){let i=ht.fromDate(a);return{timestampValue:eT(r.serializer,i)}}if(a instanceof ht){let i=new ht(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:eT(r.serializer,i)}}if(a instanceof ir)return{geoPointValue:{latitude:a.latitude,longitude:a.longitude}};if(a instanceof va)return{bytesValue:Xx(r.serializer,a._byteString)};if(a instanceof ln){let i=r.databaseId,s=a.firestore._databaseId;if(!s.isEqual(i))throw r.createError(`Document reference is for database ${s.projectId}/${s.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:$x(a.firestore._databaseId||r.databaseId,a._key.path)}}if(a instanceof Ea)return function(s,u){let l=s instanceof Ea?s.toArray():s;return{mapValue:{fields:{[$T]:{stringValue:JT},[Lo]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw u.createError("VectorValues must only contain numeric values.");return aS(u.serializer,f)})}}}}}}(a,r);if(r0(a))return a._toProto(r.serializer);throw r.createError(`Unsupported field value: ${lc(a)}`)}(t,e)}function IF(t,e){let n={};return Ex(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):zo(t,(a,r)=>{let i=mS(r,e.childContextForField(a));i!=null&&(n[a]=i)}),{mapValue:{fields:n}}}function E0(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof ht||t instanceof ir||t instanceof va||t instanceof ln||t instanceof oc||t instanceof Ea||r0(t))}function TF(t,e,n){if(!E0(n)||!ox(n)){let a=lc(n);throw a==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+a)}}function _c(t,e,n){if((e=Oe(e))instanceof Vo)return e._internalPath;if(typeof e=="string")return w0(t,e);throw cp("Field path arguments must be of type string or ",t,!1,void 0,n)}var SF=new RegExp("[~\\*/\\[\\]]");function w0(t,e,n){if(e.search(SF)>=0)throw cp(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Vo(...e.split("."))._internalPath}catch{throw cp(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function cp(t,e,n,a,r){let i=a&&!a.isEmpty(),s=r!==void 0,u=`Function ${e}() called with invalid data`;n&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(i||s)&&(l+=" (found",i&&(l+=` in field ${a}`),s&&(l+=` in document ${r}`),l+=")"),new G(F.INVALID_ARGUMENT,u+t+l)}var uc=class{convertValue(e,n="none"){switch(li(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ze(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(lr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw te(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){let a={};return zo(e,(r,i)=>{a[r]=this.convertValue(i,n)}),a}convertVectorValue(e){let n=e.fields?.[Lo].arrayValue?.values?.map(a=>ze(a.doubleValue));return new Ea(n)}convertGeoPoint(e){return new ir(ze(e.latitude),ze(e.longitude))}convertArray(e,n){return(e.values||[]).map(a=>this.convertValue(a,n))}convertServerTimestamp(e,n){switch(n){case"previous":let a=pp(e);return a==null?null:this.convertValue(a,n);case"estimate":return this.convertTimestamp(Kl(e));default:return null}}convertTimestamp(e){let n=ur(e);return new ht(n.seconds,n.nanos)}convertDocumentKey(e,n){let a=He.fromString(e);Ke(a0(a),9688,{name:e});let r=new Yl(a.get(1),a.get(3)),i=new J(a.popFirst(5));return r.isEqual(n)||sr(`Document ${i} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}};var dp=class extends uc{constructor(e){super(),this.firestore=e}convertBytes(e){return new va(e)}convertReference(e){let n=this.convertDocumentKey(e,this.firestore._databaseId);return new ln(this.firestore,null,n)}};var C0="@firebase/firestore",A0="4.12.0";var Ic=class{constructor(e,n,a,r,i){this._firestore=e,this._userDataWriter=n,this._key=a,this._document=r,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ln(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new gS(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let n=this._document.data.field(_c("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}},gS=class extends Ic{data(){return super.data()}};function AF(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new G(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var Tc=class{},Yo=class extends Tc{};function Sc(t,e,...n){let a=[];e instanceof Tc&&a.push(e),a=a.concat(n),function(i){let s=i.filter(l=>l instanceof yS).length,u=i.filter(l=>l instanceof Tp).length;if(s>1||s>0&&u>0)throw new G(F.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(a);for(let r of a)t=r._apply(t);return t}var Tp=class t extends Yo{constructor(e,n,a){super(),this._field=e,this._op=n,this._value=a,this.type="where"}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=this._parse(e);return x0(e._query,n),new ea(e.firestore,e.converter,gp(e._query,n))}_parse(e){let n=hS(e.firestore);return function(i,s,u,l,c,f,m){let p;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new G(F.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){L0(m,f);let b=[];for(let x of m)b.push(b0(l,i,x));p={arrayValue:{values:b}}}else p=b0(l,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||L0(m,f),p=pS(u,s,m,f==="in"||f==="not-in");return rt.create(c,f,p)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}};function vc(t,e,n){let a=e,r=_c("where",t);return Tp._create(r,a,n)}var yS=class t extends Tc{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new t(e,n)}_parse(e){let n=this._queryConstraints.map(a=>a._parse(e)).filter(a=>a.getFilters().length>0);return n.length===1?n[0]:Hn.create(n,this._getOperator())}_apply(e){let n=this._parse(e);return n.getFilters().length===0?e:(function(r,i){let s=r,u=i.getFlattenedFilters();for(let l of u)x0(s,l),s=gp(s,l)}(e._query,n),new ea(e.firestore,e.converter,gp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var _S=class t extends Yo{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new t(e,n)}_apply(e){let n=function(r,i,s){if(r.startAt!==null)throw new G(F.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new G(F.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ci(i,s)}(e._query,this._field,this._direction);return new ea(e.firestore,e.converter,Ux(e._query,n))}};function Ec(t,e="asc"){let n=e,a=_c("orderBy",t);return _S._create(a,n)}var IS=class t extends Yo{constructor(e,n,a){super(),this.type=e,this._limit=n,this._limitType=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){return new ea(e.firestore,e.converter,Xl(e._query,this._limit,this._limitType))}};function wc(t){return ux("limit",t),IS._create("limit",t,"F")}var TS=class t extends Yo{constructor(e,n,a){super(),this.type=e,this._docOrFields=n,this._inclusive=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=bF(e,this.type,this._docOrFields,this._inclusive);return new ea(e.firestore,e.converter,Vx(e._query,n))}};function R0(...t){return TS._create("startAfter",t,!1)}function bF(t,e,n,a){if(n[0]=Oe(n[0]),n[0]instanceof Ic)return function(i,s,u,l,c){if(!l)throw new G(F.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);let f=[];for(let m of $i(i))if(m.field.isKeyField())f.push(fc(s,l.key));else{let p=l.data.field(m.field);if(dc(p))throw new G(F.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+m.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(p===null){let I=m.field.canonicalString();throw new G(F.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${I}' (used as the orderBy) does not exist.`)}f.push(p)}return new cr(f,c)}(t._query,t.firestore._databaseId,e,n[0]._document,a);{let r=hS(t.firestore);return function(s,u,l,c,f,m){let p=s.explicitOrderBy;if(f.length>p.length)throw new G(F.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let I=[];for(let b=0;b<f.length;b++){let x=f[b];if(p[b].field.isKeyField()){if(typeof x!="string")throw new G(F.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof x}`);if(!mp(s)&&x.indexOf("/")!==-1)throw new G(F.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${x}' contains a slash.`);let D=s.path.child(He.fromString(x));if(!J.isDocumentKey(D))throw new G(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${D}' is not because it contains an odd number of segments.`);let v=new J(D);I.push(fc(u,v))}else{let D=pS(l,c,x);I.push(D)}}return new cr(I,m)}(t._query,t.firestore._databaseId,r,e,n,a)}}function b0(t,e,n){if(typeof(n=Oe(n))=="string"){if(n==="")throw new G(F.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!mp(e)&&n.indexOf("/")!==-1)throw new G(F.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);let a=e.path.child(He.fromString(n));if(!J.isDocumentKey(a))throw new G(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${a}' is not because it has an odd number of segments (${a.length}).`);return fc(t,new J(a))}if(n instanceof ln)return fc(t,n._key);throw new G(F.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${lc(n)}.`)}function L0(t,e){if(!Array.isArray(t)||t.length===0)throw new G(F.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function x0(t,e){let n=function(r,i){for(let s of r)for(let u of s.getFlattenedFilters())if(i.indexOf(u.op)>=0)return u.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new G(F.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new G(F.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}var Go=class{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},jo=class t extends Ic{constructor(e,n,a,r,i,s){super(e,n,a,r,s),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let n=new Wo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){let a=this._document.data.field(_c("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new G(F.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,n={};return n.type=t._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}};jo._jsonSchemaVersion="firestore/documentSnapshot/1.0",jo._jsonSchema={type:it("string",jo._jsonSchemaVersion),bundleSource:it("string","DocumentSnapshot"),bundleName:it("string"),bundle:it("string")};var Wo=class extends jo{data(e={}){return super.data(e)}},Ko=class t{constructor(e,n,a,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new Go(r.hasPendingWrites,r.fromCache),this.query=a}get docs(){let e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(a=>{e.call(n,new Wo(this._firestore,this._userDataWriter,a.key,a,new Go(this._snapshot.mutatedKeys.has(a.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new G(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(r,i){if(r._snapshot.oldDocs.isEmpty()){let s=0;return r._snapshot.docChanges.map(u=>{let l=new Wo(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Go(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:s++}})}{let s=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(u=>i||u.type!==3).map(u=>{let l=new Wo(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Go(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter),c=-1,f=-1;return u.type!==0&&(c=s.indexOf(u.doc.key),s=s.delete(u.doc.key)),u.type!==1&&(s=s.add(u.doc),f=s.indexOf(u.doc.key)),{type:LF(u.type),doc:l,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new G(F.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Co.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let n=[],a=[],r=[];return this.docs.forEach(i=>{i._document!==null&&(n.push(i._document),a.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),r.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function LF(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return te(61501,{type:t})}}Ko._jsonSchemaVersion="firestore/querySnapshot/1.0",Ko._jsonSchema={type:it("string",Ko._jsonSchemaVersion),bundleSource:it("string","QuerySnapshot"),bundleName:it("string"),bundle:it("string")};function Sp(t){t=cc(t,ea);let e=cc(t.firestore,Uo),n=fS(e),a=new dp(e);return AF(t._query),_0(n,t._query).then(r=>new Ko(e,a,t,r))}(function(e,n=!0){rx(un),wn(new Ut("firestore",(a,{instanceIdentifier:r,options:i})=>{let s=a.getProvider("app").getImmediate(),u=new Uo(new Uh(a.getProvider("auth-internal")),new Fh(s,a.getProvider("app-check-internal")),Lx(s,r),s);return i={useFetchStreams:n,...i},u._setSettings(i),u},"PUBLIC").setMultipleInstances(!0)),Vt(C0,A0,e),Vt(C0,A0,"esm2020")})();var vp={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var ES=wl(vp),u6=gR(ES),l6=yc(ES),k0=sh(ES);var D0="https://echly-web.vercel.app";function RF(t){return typeof t=="string"?t.startsWith("http")?t:D0+t:t instanceof URL?t.href:t.url}function xF(t,e={}){let n=RF(t),a=e.method||"GET",r=e.headers instanceof Headers||Array.isArray(e.headers)?Object.fromEntries(e.headers):{...e.headers},i=e.body??null;return new Promise((s,u)=>{chrome.runtime.sendMessage({type:"echly-api",url:n,method:a,headers:r,body:i},l=>{if(chrome.runtime.lastError){u(new Error(chrome.runtime.lastError.message));return}if(!l){u(new Error("No response from background"));return}let c=new Response(l.body??"",{status:l.status??0,headers:l.headers?new Headers(l.headers):void 0});s(c)})})}async function Ep(t,e={}){let n=t.startsWith("http")?t:D0+t;return xF(n,e)}function P0(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function O0(t,e,n){return new Promise((a,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,feedbackId:n},i=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(i?.error){r(new Error(i.error));return}if(i?.url){a(i.url);return}r(new Error("No URL from background"))})})}async function DS(t){if(!t||typeof t!="string")return"";try{let n=await(await Promise.resolve().then(()=>Ce(Ek()))).createWorker("eng",void 0,{logger:()=>{}}),{data:{text:a}}=await n.recognize(t);return await n.terminate(),!a||typeof a!="string"?"":a.replace(/\s+/g," ").trim().slice(0,2e3)}catch{return""}}var mi=Ce(Wn());function zk(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var Hk=zk,Gk=new En("auth","Firebase",zk());var Pp=new pa("@firebase/auth");function oB(t,...e){Pp.logLevel<=se.WARN&&Pp.warn(`Auth (${un}): ${t}`,...e)}function Lp(t,...e){Pp.logLevel<=se.ERROR&&Pp.error(`Auth (${un}): ${t}`,...e)}function ta(t,...e){throw av(t,...e)}function ba(t,...e){return av(t,...e)}function jk(t,e,n){let a={...Hk(),[e]:n};return new En("auth","Firebase",a).create(e,{appName:t.name})}function rs(t){return jk(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function av(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return Gk.create(t,...e)}function X(t,e,...n){if(!t)throw av(e,...n)}function Aa(t){let e="INTERNAL ASSERTION FAILED: "+t;throw Lp(e),new Error(e)}function pr(t,e){t||Aa(e)}function VS(){return typeof self<"u"&&self.location?.href||""}function uB(){return wk()==="http:"||wk()==="https:"}function wk(){return typeof self<"u"&&self.location?.protocol||null}function lB(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(uB()||Xf()||"connection"in navigator)?navigator.onLine:!0}function cB(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var is=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,pr(n>e,"Short delay should be less than long delay!"),this.isMobile=Yf()||$f()}get(){return lB()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function rv(t,e){pr(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var Op=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Aa("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Aa("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Aa("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var dB={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var fB=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],hB=new is(3e4,6e4);function xt(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function Ht(t,e,n,a,r={}){return Wk(t,r,async()=>{let i={},s={};a&&(e==="GET"?s=a:i={body:JSON.stringify(a)});let u=ha({key:t.config.apiKey,...s}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:l,...i};return Qf()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Qt(t.emulatorConfig.host)&&(c.credentials="include"),Op.fetch()(await Kk(t,t.config.apiHost,n,u),c)})}async function Wk(t,e,n){t._canInitEmulator=!1;let a={...dB,...e};try{let r=new FS(t),i=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let s=await i.json();if("needConfirmation"in s)throw bc(t,"account-exists-with-different-credential",s);if(i.ok&&!("errorMessage"in s))return s;{let u=i.ok?s.errorMessage:s.error.message,[l,c]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw bc(t,"credential-already-in-use",s);if(l==="EMAIL_EXISTS")throw bc(t,"email-already-in-use",s);if(l==="USER_DISABLED")throw bc(t,"user-disabled",s);let f=a[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw jk(t,f,c);ta(t,f)}}catch(r){if(r instanceof bt)throw r;ta(t,"network-request-failed",{message:String(r)})}}async function cs(t,e,n,a,r={}){let i=await Ht(t,e,n,a,r);return"mfaPendingCredential"in i&&ta(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function Kk(t,e,n,a){let r=`${e}${n}?${a}`,i=t,s=i.config.emulator?rv(t.config,r):`${t.config.apiScheme}://${r}`;return fB.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(s).toString():s}function pB(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var FS=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(ba(this.auth,"network-request-failed")),hB.get())})}};function bc(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=ba(t,e,a);return r.customData._tokenResponse=n,r}function Ck(t){return t!==void 0&&t.enterprise!==void 0}var Np=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return pB(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function Yk(t,e){return Ht(t,"GET","/v2/recaptchaConfig",xt(t,e))}async function mB(t,e){return Ht(t,"POST","/v1/accounts:delete",e)}async function Mp(t,e){return Ht(t,"POST","/v1/accounts:lookup",e)}function Lc(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Qk(t,e=!1){let n=Oe(t),a=await n.getIdToken(e),r=iv(a);X(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let i=typeof r.firebase=="object"?r.firebase:void 0,s=i?.sign_in_provider;return{claims:r,token:a,authTime:Lc(PS(r.auth_time)),issuedAtTime:Lc(PS(r.iat)),expirationTime:Lc(PS(r.exp)),signInProvider:s||null,signInSecondFactor:i?.sign_in_second_factor||null}}function PS(t){return Number(t)*1e3}function iv(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return Lp("JWT malformed, contained fewer than 3 sections"),null;try{let r=co(n);return r?JSON.parse(r):(Lp("Failed to decode base64 JWT payload"),null)}catch(r){return Lp("Caught error parsing JWT payload as JSON",r?.toString()),null}}function Ak(t){let e=iv(t);return X(e,"internal-error"),X(typeof e.exp<"u","internal-error"),X(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function Dc(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof bt&&gB(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function gB({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var BS=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var Pc=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Lc(this.lastLoginAt),this.creationTime=Lc(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function Up(t){let e=t.auth,n=await t.getIdToken(),a=await Dc(t,Mp(e,{idToken:n}));X(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let i=r.providerUserInfo?.length?$k(r.providerUserInfo):[],s=yB(t.providerData,i),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!s?.length,c=u?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new Pc(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function Xk(t){let e=Oe(t);await Up(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function yB(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function $k(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function _B(t,e){let n=await Wk(t,{},async()=>{let a=ha({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=t.config,s=await Kk(t,r,"/v1/token",`key=${i}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:a};return t.emulatorConfig&&Qt(t.emulatorConfig.host)&&(l.credentials="include"),Op.fetch()(s,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function IB(t,e){return Ht(t,"POST","/v2/accounts:revokeToken",xt(t,e))}var Rc=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){X(e.idToken,"internal-error"),X(typeof e.idToken<"u","internal-error"),X(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Ak(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){X(e.length!==0,"internal-error");let n=Ak(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(X(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:i}=await _B(e,n);this.updateTokensAndExpiration(a,r,Number(i))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:i}=n,s=new t;return a&&(X(typeof a=="string","internal-error",{appName:e}),s.refreshToken=a),r&&(X(typeof r=="string","internal-error",{appName:e}),s.accessToken=r),i&&(X(typeof i=="number","internal-error",{appName:e}),s.expirationTime=i),s}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return Aa("not implemented")}};function hi(t,e){X(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var pi=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new BS(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Pc(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await Dc(this,this.stsTokenManager.getToken(this.auth,e));return X(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return Qk(this,e)}reload(){return Xk(this)}_assign(e){this!==e&&(X(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){X(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await Up(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(at(this.auth.app))return Promise.reject(rs(this.auth));let e=await this.getIdToken();return await Dc(this,mB(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,i=n.phoneNumber??void 0,s=n.photoURL??void 0,u=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:m,emailVerified:p,isAnonymous:I,providerData:b,stsTokenManager:x}=n;X(m&&x,e,"internal-error");let D=Rc.fromJSON(this.name,x);X(typeof m=="string",e,"internal-error"),hi(a,e.name),hi(r,e.name),X(typeof p=="boolean",e,"internal-error"),X(typeof I=="boolean",e,"internal-error"),hi(i,e.name),hi(s,e.name),hi(u,e.name),hi(l,e.name),hi(c,e.name),hi(f,e.name);let v=new t({uid:m,auth:e,email:r,emailVerified:p,displayName:a,isAnonymous:I,photoURL:s,phoneNumber:i,tenantId:u,stsTokenManager:D,createdAt:c,lastLoginAt:f});return b&&Array.isArray(b)&&(v.providerData=b.map(S=>({...S}))),l&&(v._redirectEventId=l),v}static async _fromIdTokenResponse(e,n,a=!1){let r=new Rc;r.updateFromServerResponse(n);let i=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await Up(i),i}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];X(r.localId!==void 0,"internal-error");let i=r.providerUserInfo!==void 0?$k(r.providerUserInfo):[],s=!(r.email&&r.passwordHash)&&!i?.length,u=new Rc;u.updateFromIdToken(a);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:s}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new Pc(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!i?.length};return Object.assign(l,c),l}};var bk=new Map;function hr(t){pr(t instanceof Function,"Expected a class definition");let e=bk.get(t);return e?(pr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,bk.set(t,e),e)}var Vp=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};Vp.type="NONE";var qS=Vp;function Rp(t,e,n){return`firebase:${t}:${e}:${n}`}var Fp=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:i}=this.auth;this.fullUserKey=Rp(this.userKey,r.apiKey,i),this.fullPersistenceKey=Rp("persistence",r.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await Mp(this.auth,{idToken:e}).catch(()=>{});return n?pi._fromGetAccountInfoResponse(this.auth,n,e):null}return pi._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(hr(qS),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),i=r[0]||hr(qS),s=Rp(a,e.config.apiKey,e.name),u=null;for(let c of n)try{let f=await c._get(s);if(f){let m;if(typeof f=="string"){let p=await Mp(e,{idToken:f}).catch(()=>{});if(!p)break;m=await pi._fromGetAccountInfoResponse(e,p,f)}else m=pi._fromJSON(e,f);c!==i&&(u=m),i=c;break}}catch{}let l=r.filter(c=>c._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new t(i,e,a):(i=l[0],u&&await i._set(s,u.toJSON()),await Promise.all(n.map(async c=>{if(c!==i)try{await c._remove(s)}catch{}})),new t(i,e,a))}};function Lk(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(tD(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Jk(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(aD(e))return"Blackberry";if(rD(e))return"Webos";if(Zk(e))return"Safari";if((e.includes("chrome/")||eD(e))&&!e.includes("edge/"))return"Chrome";if(nD(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function Jk(t=xe()){return/firefox\//i.test(t)}function Zk(t=xe()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function eD(t=xe()){return/crios\//i.test(t)}function tD(t=xe()){return/iemobile/i.test(t)}function nD(t=xe()){return/android/i.test(t)}function aD(t=xe()){return/blackberry/i.test(t)}function rD(t=xe()){return/webos/i.test(t)}function sv(t=xe()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function TB(t=xe()){return sv(t)&&!!window.navigator?.standalone}function SB(){return T_()&&document.documentMode===10}function iD(t=xe()){return sv(t)||nD(t)||rD(t)||aD(t)||/windows phone/i.test(t)||tD(t)}function sD(t,e=[]){let n;switch(t){case"Browser":n=Lk(xe());break;case"Worker":n=`${Lk(xe())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${un}/${a}`}var zS=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=i=>new Promise((s,u)=>{try{let l=e(i);s(l)}catch(l){u(l)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function vB(t,e={}){return Ht(t,"GET","/v2/passwordPolicy",xt(t,e))}var EB=6,HS=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??EB,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}};var GS=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Bp(this),this.idTokenSubscription=new Bp(this),this.beforeStateQueue=new zS(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Gk,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=hr(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Fp.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await Mp(this,{idToken:e}),a=await pi._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(at(this.app)){let i=this.app.settings.authIdToken;return i?new Promise(s=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(i).then(s,s))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let i=this.redirectUser?._redirectEventId,s=a?._redirectEventId,u=await this.tryRedirectSignIn(e);(!i||i===s)&&u?.user&&(a=u.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(i){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(i))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return X(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Up(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=cB()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(at(this.app))return Promise.reject(rs(this));let n=e?Oe(e):null;return n&&X(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&X(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return at(this.app)?Promise.reject(rs(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return at(this.app)?Promise.reject(rs(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(hr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await vB(this),n=new HS(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new En("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await IB(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&hr(e)||this._popupRedirectResolver;X(n,this,"argument-error"),this.redirectPersistenceManager=await Fp.create(this,[hr(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let i=typeof n=="function"?n:n.next.bind(n),s=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(X(u,this,"internal-error"),u.then(()=>{s||i(this.currentUser)}),typeof n=="function"){let l=e.addObserver(n,a,r);return()=>{s=!0,l()}}else{let l=e.addObserver(n);return()=>{s=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return X(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=sD(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(at(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&oB(`Error while retrieving App Check token: ${e.error}`),e?.token}};function $o(t){return Oe(t)}var Bp=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=Jf(n=>this.observer=n)}get next(){return X(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var rm={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function wB(t){rm=t}function oD(t){return rm.loadJS(t)}function CB(){return rm.recaptchaEnterpriseScript}function AB(){return rm.gapiScript}function uD(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var jS=class{constructor(){this.enterprise=new WS}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},WS=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var bB="recaptcha-enterprise",xc="NO_RECAPTCHA",qp=class{constructor(e){this.type=bB,this.auth=$o(e)}async verify(e="verify",n=!1){async function a(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(s,u)=>{Yk(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let c=new Np(l);return i.tenantId==null?i._agentRecaptchaConfig=c:i._tenantRecaptchaConfigs[i.tenantId]=c,s(c.siteKey)}}).catch(l=>{u(l)})})}function r(i,s,u){let l=window.grecaptcha;Ck(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(c=>{s(c)}).catch(()=>{s(xc)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new jS().execute("siteKey",{action:"verify"}):new Promise((i,s)=>{a(this.auth).then(u=>{if(!n&&Ck(window.grecaptcha))r(u,i,s);else{if(typeof window>"u"){s(new Error("RecaptchaVerifier is only supported in browser"));return}let l=CB();l.length!==0&&(l+=u),oD(l).then(()=>{r(u,i,s)}).catch(c=>{s(c)})}}).catch(u=>{s(u)})})}};async function Ac(t,e,n,a=!1,r=!1){let i=new qp(t),s;if(r)s=xc;else try{s=await i.verify(n)}catch{s=await i.verify(n,!0)}let u={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,c=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return a?Object.assign(u,{captchaResp:s}):Object.assign(u,{captchaResponse:s}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function kc(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let i=await Ac(t,e,n,n==="getOobCode");return a(t,i)}else return a(t,e).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let s=await Ac(t,e,n,n==="getOobCode");return a(t,s)}else return Promise.reject(i)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let i=await Ac(t,e,n);return a(t,i).catch(async s=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(s.code==="auth/missing-recaptcha-token"||s.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let u=await Ac(t,e,n,!1,!0);return a(t,u)}return Promise.reject(s)})}else{let i=await Ac(t,e,n,!1,!0);return a(t,i)}else return Promise.reject(r+" provider is not supported.")}async function LB(t){let e=$o(t),n=await Yk(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),a=new Np(n);e.tenantId==null?e._agentRecaptchaConfig=a:e._tenantRecaptchaConfigs[e.tenantId]=a,a.isAnyProviderEnabled()&&new qp(e).verify()}function lD(t,e){let n=Xn(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),i=n.getOptions();if(Xt(i,e??{}))return r;ta(r,"already-initialized")}return n.initialize({options:e})}function RB(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(hr);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function cD(t,e,n){let a=$o(t);X(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,i=dD(e),{host:s,port:u}=xB(e),l=u===null?"":`:${u}`,c={url:`${i}//${s}${l}/`},f=Object.freeze({host:s,port:u,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){X(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),X(Xt(c,a.config.emulator)&&Xt(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Qt(s)?(ri(`${i}//${s}${l}`),ii("Auth",!0)):r||kB()}function dD(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function xB(t){let e=dD(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let i=r[1];return{host:i,port:Rk(a.substr(i.length+1))}}else{let[i,s]=a.split(":");return{host:i,port:Rk(s)}}}function Rk(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function kB(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var ss=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Aa("not implemented")}_getIdTokenResponse(e){return Aa("not implemented")}_linkToIdToken(e,n){return Aa("not implemented")}_getReauthenticationResolver(e){return Aa("not implemented")}};async function DB(t,e){return Ht(t,"POST","/v1/accounts:signUp",e)}async function PB(t,e){return cs(t,"POST","/v1/accounts:signInWithPassword",xt(t,e))}async function OB(t,e){return cs(t,"POST","/v1/accounts:signInWithEmailLink",xt(t,e))}async function NB(t,e){return cs(t,"POST","/v1/accounts:signInWithEmailLink",xt(t,e))}var Oc=class t extends ss{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return kc(e,n,"signInWithPassword",PB,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return OB(e,{email:this._email,oobCode:this._password});default:ta(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return kc(e,a,"signUpPassword",DB,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return NB(e,{idToken:n,email:this._email,oobCode:this._password});default:ta(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function Qo(t,e){return cs(t,"POST","/v1/accounts:signInWithIdp",xt(t,e))}var MB="http://localhost",os=class t extends ss{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):ta("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...i}=n;if(!a||!r)return null;let s=new t(a,r);return s.idToken=i.idToken||void 0,s.accessToken=i.accessToken||void 0,s.secret=i.secret,s.nonce=i.nonce,s.pendingToken=i.pendingToken||null,s}_getIdTokenResponse(e){let n=this.buildRequest();return Qo(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,Qo(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,Qo(e,n)}buildRequest(){let e={requestUri:MB,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=ha(n)}return e}};async function xk(t,e){return Ht(t,"POST","/v1/accounts:sendVerificationCode",xt(t,e))}async function UB(t,e){return cs(t,"POST","/v1/accounts:signInWithPhoneNumber",xt(t,e))}async function VB(t,e){let n=await cs(t,"POST","/v1/accounts:signInWithPhoneNumber",xt(t,e));if(n.temporaryProof)throw bc(t,"account-exists-with-different-credential",n);return n}var FB={USER_NOT_FOUND:"user-not-found"};async function BB(t,e){let n={...e,operation:"REAUTH"};return cs(t,"POST","/v1/accounts:signInWithPhoneNumber",xt(t,n),FB)}var Nc=class t extends ss{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new t({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new t({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return UB(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return VB(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return BB(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:n,verificationId:a,verificationCode:r}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:a,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:i}=e;return!a&&!n&&!r&&!i?null:new t({verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:i})}};function qB(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function zB(t){let e=Bn(qn(t)).link,n=e?Bn(qn(e)).deep_link_id:null,a=Bn(qn(t)).deep_link_id;return(a?Bn(qn(a)).link:null)||a||n||e||t}var zp=class t{constructor(e){let n=Bn(qn(e)),a=n.apiKey??null,r=n.oobCode??null,i=qB(n.mode??null);X(a&&r&&i,"argument-error"),this.apiKey=a,this.operation=i,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=zB(e);try{return new t(n)}catch{return null}}};var Xo=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return Oc._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=zp.parseLink(n);return X(a,"argument-error"),Oc._fromEmailAndCode(e,a.code,a.tenantId)}};Xo.PROVIDER_ID="password";Xo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Xo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var Hp=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var us=class extends Hp{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var Mc=class t extends us{constructor(){super("facebook.com")}static credential(e){return os._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Mc.FACEBOOK_SIGN_IN_METHOD="facebook.com";Mc.PROVIDER_ID="facebook.com";var Uc=class t extends us{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return os._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};Uc.GOOGLE_SIGN_IN_METHOD="google.com";Uc.PROVIDER_ID="google.com";var Vc=class t extends us{constructor(){super("github.com")}static credential(e){return os._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Vc.GITHUB_SIGN_IN_METHOD="github.com";Vc.PROVIDER_ID="github.com";var Fc=class t extends us{constructor(){super("twitter.com")}static credential(e,n){return os._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};Fc.TWITTER_SIGN_IN_METHOD="twitter.com";Fc.PROVIDER_ID="twitter.com";var Bc=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,a,r=!1){let i=await pi._fromIdTokenResponse(e,a,r),s=kk(a);return new t({user:i,providerId:s,_tokenResponse:a,operationType:n})}static async _forOperation(e,n,a){await e._updateTokensIfNecessary(a,!0);let r=kk(a);return new t({user:e,providerId:r,_tokenResponse:a,operationType:n})}};function kk(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var KS=class t extends bt{constructor(e,n,a,r){super(n.code,n.message),this.operationType=a,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:a}}static _fromErrorAndOperation(e,n,a,r){return new t(e,n,a,r)}};function fD(t,e,n,a){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?KS._fromErrorAndOperation(t,i,e,a):i})}async function HB(t,e,n=!1){let a=await Dc(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Bc._forOperation(t,"link",a)}async function GB(t,e,n=!1){let{auth:a}=t;if(at(a.app))return Promise.reject(rs(a));let r="reauthenticate";try{let i=await Dc(t,fD(a,r,e,t),n);X(i.idToken,a,"internal-error");let s=iv(i.idToken);X(s,a,"internal-error");let{sub:u}=s;return X(t.uid===u,a,"user-mismatch"),Bc._forOperation(t,r,i)}catch(i){throw i?.code==="auth/user-not-found"&&ta(a,"user-mismatch"),i}}async function jB(t,e,n=!1){if(at(t.app))return Promise.reject(rs(t));let a="signIn",r=await fD(t,a,e),i=await Bc._fromIdTokenResponse(t,a,r);return n||await t._updateCurrentUser(i.user),i}function hD(t,e,n,a){return Oe(t).onIdTokenChanged(e,n,a)}function pD(t,e,n){return Oe(t).beforeAuthStateChanged(e,n)}function Dk(t,e){return Ht(t,"POST","/v2/accounts/mfaEnrollment:start",xt(t,e))}function WB(t,e){return Ht(t,"POST","/v2/accounts/mfaEnrollment:finalize",xt(t,e))}function KB(t,e){return Ht(t,"POST","/v2/accounts/mfaEnrollment:start",xt(t,e))}function YB(t,e){return Ht(t,"POST","/v2/accounts/mfaEnrollment:finalize",xt(t,e))}var Gp="__sak";var jp=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Gp,"1"),this.storage.removeItem(Gp),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){let n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var QB=1e3,XB=10,Wp=class extends jp{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=iD(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let n of Object.keys(this.listeners)){let a=this.storage.getItem(n),r=this.localCache[n];a!==r&&e(n,r,a)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((s,u,l)=>{this.notifyListeners(s,l)});return}let a=e.key;n?this.detachListener():this.stopPolling();let r=()=>{let s=this.storage.getItem(a);!n&&this.localCache[a]===s||this.notifyListeners(a,s)},i=this.storage.getItem(a);SB()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,XB):r()}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,a)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:a}),!0)})},QB)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){let n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};Wp.type="LOCAL";var mD=Wp;var $B=1e3;function OS(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${e}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function NS(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var YS=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let n=new URL(`${window.location.origin}/__cookies__`);return n.searchParams.set("finalTarget",e),n}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,n){}async _get(e){if(!this._isAvailable())return null;let n=NS(e);return window.cookieStore?(await window.cookieStore.get(n))?.value:OS(n)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let a=NS(e);document.cookie=`${a}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,n){if(!this._isAvailable())return;let a=NS(e);if(window.cookieStore){let u=c=>{let f=c.changed.find(p=>p.name===a);f&&n(f.value),c.deleted.find(p=>p.name===a)&&n(null)},l=()=>window.cookieStore.removeEventListener("change",u);return this.listenerUnsubscribes.set(n,l),window.cookieStore.addEventListener("change",u)}let r=OS(a),i=setInterval(()=>{let u=OS(a);u!==r&&(n(u),r=u)},$B),s=()=>clearInterval(i);this.listenerUnsubscribes.set(n,s)}_removeListener(e,n){let a=this.listenerUnsubscribes.get(n);a&&(a(),this.listenerUnsubscribes.delete(n))}};YS.type="COOKIE";var Kp=class extends jp{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};Kp.type="SESSION";var ov=Kp;function JB(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var Yp=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:i}=n.data,s=this.handlersMap[r];if(!s?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let u=Array.from(s).map(async c=>c(n.origin,i)),l=await JB(u);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Yp.receivers=[];function uv(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var QS=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,s;return new Promise((u,l)=>{let c=uv("",20);r.port1.start();let f=setTimeout(()=>{l(new Error("unsupported_event"))},a);s={messageChannel:r,onMessage(m){let p=m;if(p.data.eventId===c)switch(p.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),u(p.data.response);break;default:clearTimeout(f),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(s),r.port1.addEventListener("message",s.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{s&&this.removeMessageHandler(s)})}};function La(){return window}function ZB(t){La().location.href=t}function gD(){return typeof La().WorkerGlobalScope<"u"&&typeof La().importScripts=="function"}async function eq(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function tq(){return navigator?.serviceWorker?.controller||null}function nq(){return gD()?self:null}var yD="firebaseLocalStorageDb",aq=1,Qp="firebaseLocalStorage",_D="fbase_key",ls=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function im(t,e){return t.transaction([Qp],e?"readwrite":"readonly").objectStore(Qp)}function rq(){let t=indexedDB.deleteDatabase(yD);return new ls(t).toPromise()}function XS(){let t=indexedDB.open(yD,aq);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Qp,{keyPath:_D})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Qp)?e(a):(a.close(),await rq(),e(await XS()))})})}async function Pk(t,e,n){let a=im(t,!0).put({[_D]:e,value:n});return new ls(a).toPromise()}async function iq(t,e){let n=im(t,!1).get(e),a=await new ls(n).toPromise();return a===void 0?null:a.value}function Ok(t,e){let n=im(t,!0).delete(e);return new ls(n).toPromise()}var sq=800,oq=3,Xp=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await XS(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>oq)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return gD()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Yp._getInstance(nq()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await eq(),!this.activeServiceWorker)return;this.sender=new QS(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||tq()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await XS();return await Pk(e,Gp,"1"),await Ok(e,Gp),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>Pk(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>iq(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>Ok(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let i=im(r,!1).getAll();return new ls(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:i}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),sq)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Xp.type="LOCAL";var ID=Xp;function Nk(t,e){return Ht(t,"POST","/v2/accounts/mfaSignIn:start",xt(t,e))}function uq(t,e){return Ht(t,"POST","/v2/accounts/mfaSignIn:finalize",xt(t,e))}function lq(t,e){return Ht(t,"POST","/v2/accounts/mfaSignIn:finalize",xt(t,e))}var B6=uD("rcb"),q6=new is(3e4,6e4);var xp="recaptcha";async function cq(t,e,n){if(!t._getRecaptchaConfig())try{await LB(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let a;if(typeof e=="string"?a={phoneNumber:e}:a=e,"session"in a){let r=a.session;if("phoneNumber"in a){X(r.type==="enroll",t,"internal-error");let i={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await kc(t,i,"mfaSmsEnrollment",async(c,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===xc){X(n?.type===xp,c,"argument-error");let m=await MS(c,f,n);return Dk(c,m)}return Dk(c,f)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).phoneSessionInfo.sessionInfo}else{X(r.type==="signin",t,"internal-error");let i=a.multiFactorHint?.uid||a.multiFactorUid;X(i,t,"missing-multi-factor-info");let s={mfaPendingCredential:r.credential,mfaEnrollmentId:i,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await kc(t,s,"mfaSmsSignIn",async(f,m)=>{if(m.phoneSignInInfo.captchaResponse===xc){X(n?.type===xp,f,"argument-error");let p=await MS(f,m,n);return Nk(f,p)}return Nk(f,m)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await kc(t,r,"sendVerificationCode",async(l,c)=>{if(c.captchaResponse===xc){X(n?.type===xp,l,"argument-error");let f=await MS(l,c,n);return xk(l,f)}return xk(l,c)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{n?._reset()}}async function MS(t,e,n){X(n.type===xp,t,"argument-error");let a=await n.verify();X(typeof a=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let i=r.phoneEnrollmentInfo.phoneNumber,s=r.phoneEnrollmentInfo.captchaResponse,u=r.phoneEnrollmentInfo.clientType,l=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:a,captchaResponse:s,clientType:u,recaptchaVersion:l}}),r}else if("phoneSignInInfo"in r){let i=r.phoneSignInInfo.captchaResponse,s=r.phoneSignInInfo.clientType,u=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:a,captchaResponse:i,clientType:s,recaptchaVersion:u}}),r}else return Object.assign(r,{recaptchaToken:a}),r}var qc=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=$o(e)}verifyPhoneNumber(e,n){return cq(this.auth,e,Oe(n))}static credential(e,n){return Nc._fromVerification(e,n)}static credentialFromResult(e){let n=e;return t.credentialFromTaggedObject(n)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:n,temporaryProof:a}=e;return n&&a?Nc._fromTokenResponse(n,a):null}};qc.PROVIDER_ID="phone";qc.PHONE_SIGN_IN_METHOD="phone";function dq(t,e){return e?hr(e):(X(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var zc=class extends ss{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Qo(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Qo(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Qo(e,this._buildIdpRequest())}_buildIdpRequest(e){let n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function fq(t){return jB(t.auth,new zc(t),t.bypassAuthState)}function hq(t){let{auth:e,user:n}=t;return X(n,e,"internal-error"),GB(n,new zc(t),t.bypassAuthState)}async function pq(t){let{auth:e,user:n}=t;return X(n,e,"internal-error"),HB(n,new zc(t),t.bypassAuthState)}var $p=class{constructor(e,n,a,r,i=!1){this.auth=e,this.resolver=a,this.user=r,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(a){this.reject(a)}})}async onAuthEvent(e){let{urlResponse:n,sessionId:a,postBody:r,tenantId:i,error:s,type:u}=e;if(s){this.reject(s);return}let l={auth:this.auth,requestUri:n,sessionId:a,tenantId:i||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(l))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return fq;case"linkViaPopup":case"linkViaRedirect":return pq;case"reauthViaPopup":case"reauthViaRedirect":return hq;default:ta(this.auth,"internal-error")}}resolve(e){pr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){pr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var mq=new is(2e3,1e4);var $S=class t extends $p{constructor(e,n,a,r,i){super(e,n,r,i),this.provider=a,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return X(e,this.auth,"internal-error"),e}async onExecution(){pr(this.filter.length===1,"Popup operations only handle one event");let e=uv();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(ba(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(ba(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ba(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,mq.get())};e()}};$S.currentPopupAction=null;var gq="pendingRedirect",kp=new Map,JS=class extends $p{constructor(e,n,a=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,a),this.eventId=null}async execute(){let e=kp.get(this.auth._key());if(!e){try{let a=await yq(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(a)}catch(n){e=()=>Promise.reject(n)}kp.set(this.auth._key(),e)}return this.bypassAuthState||kp.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function yq(t,e){let n=Tq(e),a=Iq(t);if(!await a._isAvailable())return!1;let r=await a._get(n)==="true";return await a._remove(n),r}function _q(t,e){kp.set(t._key(),e)}function Iq(t){return hr(t._redirectPersistence)}function Tq(t){return Rp(gq,t.config.apiKey,t.name)}async function Sq(t,e,n=!1){if(at(t.app))return Promise.reject(rs(t));let a=$o(t),r=dq(a,e),s=await new JS(a,r,n).execute();return s&&!n&&(delete s.user._redirectEventId,await a._persistUserIfCurrent(s.user),await a._setRedirectUser(null,e)),s}var vq=10*60*1e3,ZS=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(a=>{this.isEventForConsumer(e,a)&&(n=!0,this.sendToConsumer(e,a),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Eq(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!TD(e)){let a=e.error.code?.split("auth/")[1]||"internal-error";n.onError(ba(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){let a=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&a}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=vq&&this.cachedEventUids.clear(),this.cachedEventUids.has(Mk(e))}saveEventToCache(e){this.cachedEventUids.add(Mk(e)),this.lastProcessedEventTime=Date.now()}};function Mk(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function TD({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function Eq(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return TD(t);default:return!1}}async function wq(t,e={}){return Ht(t,"GET","/v1/projects",e)}var Cq=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Aq=/^https?/;async function bq(t){if(t.config.emulator)return;let{authorizedDomains:e}=await wq(t);for(let n of e)try{if(Lq(n))return}catch{}ta(t,"unauthorized-domain")}function Lq(t){let e=VS(),{protocol:n,hostname:a}=new URL(e);if(t.startsWith("chrome-extension://")){let s=new URL(t);return s.hostname===""&&a===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&s.hostname===a}if(!Aq.test(n))return!1;if(Cq.test(t))return a===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(a)}var Rq=new is(3e4,6e4);function Uk(){let t=La().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function xq(t){return new Promise((e,n)=>{function a(){Uk(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Uk(),n(ba(t,"network-request-failed"))},timeout:Rq.get()})}if(La().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(La().gapi?.load)a();else{let r=uD("iframefcb");return La()[r]=()=>{gapi.load?a():n(ba(t,"network-request-failed"))},oD(`${AB()}?onload=${r}`).catch(i=>n(i))}}).catch(e=>{throw Dp=null,e})}var Dp=null;function kq(t){return Dp=Dp||xq(t),Dp}var Dq=new is(5e3,15e3),Pq="__/auth/iframe",Oq="emulator/auth/iframe",Nq={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Mq=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Uq(t){let e=t.config;X(e.authDomain,t,"auth-domain-config-required");let n=e.emulator?rv(e,Oq):`https://${t.config.authDomain}/${Pq}`,a={apiKey:e.apiKey,appName:t.name,v:un},r=Mq.get(t.config.apiHost);r&&(a.eid=r);let i=t._getFrameworks();return i.length&&(a.fw=i.join(",")),`${n}?${ha(a).slice(1)}`}async function Vq(t){let e=await kq(t),n=La().gapi;return X(n,t,"internal-error"),e.open({where:document.body,url:Uq(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Nq,dontclear:!0},a=>new Promise(async(r,i)=>{await a.restyle({setHideOnLeave:!1});let s=ba(t,"network-request-failed"),u=La().setTimeout(()=>{i(s)},Dq.get());function l(){La().clearTimeout(u),r(a)}a.ping(l).then(l,()=>{i(s)})}))}var Fq={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Bq=500,qq=600,zq="_blank",Hq="http://localhost",Jp=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function Gq(t,e,n,a=Bq,r=qq){let i=Math.max((window.screen.availHeight-r)/2,0).toString(),s=Math.max((window.screen.availWidth-a)/2,0).toString(),u="",l={...Fq,width:a.toString(),height:r.toString(),top:i,left:s},c=xe().toLowerCase();n&&(u=eD(c)?zq:n),Jk(c)&&(e=e||Hq,l.scrollbars="yes");let f=Object.entries(l).reduce((p,[I,b])=>`${p}${I}=${b},`,"");if(TB(c)&&u!=="_self")return jq(e||"",u),new Jp(null);let m=window.open(e||"",u,f);X(m,t,"popup-blocked");try{m.focus()}catch{}return new Jp(m)}function jq(t,e){let n=document.createElement("a");n.href=t,n.target=e;let a=document.createEvent("MouseEvent");a.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(a)}var Wq="__/auth/handler",Kq="emulator/auth/handler",Yq=encodeURIComponent("fac");async function Vk(t,e,n,a,r,i){X(t.config.authDomain,t,"auth-domain-config-required"),X(t.config.apiKey,t,"invalid-api-key");let s={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:a,v:un,eventId:r};if(e instanceof Hp){e.setDefaultLanguage(t.languageCode),s.providerId=e.providerId||"",Jb(e.getCustomParameters())||(s.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,m]of Object.entries(i||{}))s[f]=m}if(e instanceof us){let f=e.getScopes().filter(m=>m!=="");f.length>0&&(s.scopes=f.join(","))}t.tenantId&&(s.tid=t.tenantId);let u=s;for(let f of Object.keys(u))u[f]===void 0&&delete u[f];let l=await t._getAppCheckToken(),c=l?`#${Yq}=${encodeURIComponent(l)}`:"";return`${Qq(t)}?${ha(u).slice(1)}${c}`}function Qq({config:t}){return t.emulator?rv(t,Kq):`https://${t.authDomain}/${Wq}`}var US="webStorageSupport",ev=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=ov,this._completeRedirectFn=Sq,this._overrideRedirectResult=_q}async _openPopup(e,n,a,r){pr(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let i=await Vk(e,n,a,VS(),r);return Gq(e,i,uv())}async _openRedirect(e,n,a,r){await this._originValidation(e);let i=await Vk(e,n,a,VS(),r);return ZB(i),new Promise(()=>{})}_initialize(e){let n=e._key();if(this.eventManagers[n]){let{manager:r,promise:i}=this.eventManagers[n];return r?Promise.resolve(r):(pr(i,"If manager is not set, promise should be"),i)}let a=this.initAndGetManager(e);return this.eventManagers[n]={promise:a},a.catch(()=>{delete this.eventManagers[n]}),a}async initAndGetManager(e){let n=await Vq(e),a=new ZS(e);return n.register("authEvent",r=>(X(r?.authEvent,e,"invalid-auth-event"),{status:a.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:a},this.iframes[e._key()]=n,a}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(US,{type:US},r=>{let i=r?.[0]?.[US];i!==void 0&&n(!!i),ta(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=bq(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return iD()||Zk()||sv()}},SD=ev,Zp=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return Aa("unexpected MultiFactorSessionType")}}},tv=class t extends Zp{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,n,a){return WB(e,{idToken:n,displayName:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,n){return uq(e,{mfaPendingCredential:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},em=class{constructor(){}static assertion(e){return tv._fromCredential(e)}};em.FACTOR_ID="phone";var tm=class{static assertionForEnrollment(e,n){return nm._fromSecret(e,n)}static assertionForSignIn(e,n){return nm._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;X(typeof n.user?.auth<"u","internal-error");let a=await KB(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return am._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};tm.FACTOR_ID="totp";var nm=class t extends Zp{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return X(typeof this.secret<"u",e,"argument-error"),YB(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){X(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return lq(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},am=class t{constructor(e,n,a,r,i,s,u){this.sessionInfo=s,this.auth=u,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=i}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(bp(e)||bp(n))&&(a=!0),a&&(bp(e)&&(e=this.auth.currentUser?.email||"unknownuser"),bp(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function bp(t){return typeof t>"u"||t?.length===0}var Fk="@firebase/auth",Bk="1.12.1";var nv=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){X(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function Xq(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function $q(t){wn(new Ut("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:s,authDomain:u}=a.options;X(s&&!s.includes(":"),"invalid-api-key",{appName:a.name});let l={apiKey:s,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:sD(t)},c=new GS(a,r,i,l);return RB(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),wn(new Ut("auth-internal",e=>{let n=$o(e.getProvider("auth").getImmediate());return(a=>new nv(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Vt(Fk,Bk,Xq(t)),Vt(Fk,Bk,"esm2020")}var Jq=5*60,Zq=I_("authIdTokenMaxAge")||Jq,qk=null,e4=t=>async e=>{let n=e&&await e.getIdTokenResult(),a=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(a&&a>Zq)return;let r=n?.token;qk!==r&&(qk=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function lv(t=oi()){let e=Xn(t,"auth");if(e.isInitialized())return e.getImmediate();let n=lD(t,{popupRedirectResolver:SD,persistence:[ID,mD,ov]}),a=I_("authTokenSyncURL");if(a&&typeof isSecureContext=="boolean"&&isSecureContext){let i=new URL(a,location.origin);if(location.origin===i.origin){let s=e4(i.toString());pD(n,s,()=>s(n.currentUser)),hD(n,u=>s(u))}}let r=vl("auth");return r&&cD(n,`http://${r}`),n}function t4(){return document.getElementsByTagName("head")?.[0]??document}wB({loadJS(t){return new Promise((e,n)=>{let a=document.createElement("script");a.setAttribute("src",t),a.onload=e,a.onerror=r=>{let i=ba("internal-error");i.customData=r,n(i)},a.type="text/javascript",a.charset="UTF-8",t4().appendChild(a)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});$q("Browser");var cv=wl(vp),vD=lv(cv),sm=yc(cv),s5=sh(cv);var dv=null,fv=null;async function n4(t){let e=Date.now();if(dv&&fv&&e<fv)return dv;let n=await t.getIdToken(),a=await t.getIdTokenResult();return dv=n,fv=a.expirationTime?new Date(a.expirationTime).getTime()-6e4:e+6e4,n}function a4(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let n=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return n.startsWith("http")?t:e+n}var r4=15e3;async function ED(t,e={}){let n=vD.currentUser;if(!n)throw new Error("User not authenticated");let a=await n4(n),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${a}`);let i=e.timeout!==void 0?e.timeout:r4,{timeout:s,...u}=e,l=u.signal,c=null,f=null;i>0&&(c=new AbortController,f=setTimeout(()=>c.abort(),i),l=u.signal?(()=>{let m=new AbortController;return u.signal?.addEventListener("abort",()=>{clearTimeout(f),m.abort()}),c.signal.addEventListener("abort",()=>m.abort()),m.signal})():c.signal);try{let m=await fetch(a4(t),{...u,headers:r,signal:l??u.signal});return f&&clearTimeout(f),m}catch(m){throw f&&clearTimeout(f),m instanceof Error&&m.name==="AbortError"&&c?.signal.aborted?new Error("Request timed out"):m}}var hv=null;function i4(){if(typeof window>"u")return null;if(!hv)try{hv=new AudioContext}catch{return null}return hv}function wD(){let t=i4();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(400,e+.02),n.type="sine",a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.05),n.start(e),n.stop(e+.05)}var H=Ce(Wn());var s4=typeof process<"u"&&!1;function om(t,e){if(s4&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var l4=20;function c4(t){let e=t.data(),n=e.status??"open",a=e.isResolved===!0||n==="resolved"||n==="done";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:a,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null}}async function bD(t,e=l4,n){om(e,"getSessionFeedbackPageRepo");let a=gc(sm,"feedback"),r=n!=null?Sc(a,vc("sessionId","==",t),Ec("createdAt","desc"),wc(e),R0(n)):Sc(a,vc("sessionId","==",t),Ec("createdAt","desc"),wc(e)),s=(await Sp(r)).docs,u=s.map(c4),l=s.length>0?s[s.length-1]:null,c=s.length===e;return{feedback:u,lastVisibleDoc:l,hasMore:c}}async function LD(t,e=50){let{feedback:n}=await bD(t,e);return n}var um=24;function f4(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let n=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),a=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(n&&!a)return"negative";if(a&&!n)return"positive";if(n&&a){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,i=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>i?"negative":i>r?"positive":"neutral"}return"neutral"}function kD(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}var lm=["focus_mode","region_selecting","voice_listening","processing"],h4=1800,p4=12;function DD({sessionId:t,extensionMode:e=!1,initialPointers:n,onComplete:a,onDelete:r,onRecordingChange:i,liveStructureFetch:s}){let[u,l]=(0,H.useState)([]),[c,f]=(0,H.useState)(null),[m,p]=(0,H.useState)(!1),[I,b]=(0,H.useState)("idle"),[x,D]=(0,H.useState)(null),[v,S]=(0,H.useState)(n??[]),[A,R]=(0,H.useState)(null),[q,V]=(0,H.useState)(null),[T,g]=(0,H.useState)(""),[_,E]=(0,H.useState)(""),[C,L]=(0,H.useState)(!1),[w,Te]=(0,H.useState)(null),[Se,An]=(0,H.useState)(!1),[N,O]=(0,H.useState)(null),[U,Y]=(0,H.useState)(null),[W,Z]=(0,H.useState)(0),[le,_e]=(0,H.useState)(!0),[je,We]=(0,H.useState)(null),[xa,$t]=(0,H.useState)(!1),[Jt,Zo]=(0,H.useState)(!1),[gm,eu]=(0,H.useState)(null),[Qc,Ir]=(0,H.useState)(!1),fs=(0,H.useRef)({x:0,y:0}),Tr=(0,H.useRef)(null),na=(0,H.useRef)(null),ka=(0,H.useRef)(null),gi=(0,H.useRef)(null),et=(0,H.useRef)(null),St=(0,H.useRef)(u),jn=(0,H.useRef)(I),Xc=(0,H.useRef)(null),tu=(0,H.useRef)(!1),jt=(0,H.useRef)(null),Da=(0,H.useRef)(null),hs=(0,H.useRef)(null),ps=(0,H.useRef)(null),Pa=(0,H.useRef)(null);(0,H.useEffect)(()=>{jn.current=I},[I]),(0,H.useEffect)(()=>(I==="focus_mode"||I==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[I]),(0,H.useEffect)(()=>{if(I!=="voice_listening"){Pa.current!=null&&(cancelAnimationFrame(Pa.current),Pa.current=null),Da.current?.getTracks().forEach(we=>we.stop()),Da.current=null,hs.current?.close().catch(()=>{}),hs.current=null,ps.current=null,Z(0);return}let j=ps.current;if(!j)return;let $=new Uint8Array(j.frequencyBinCount),Q,ne=()=>{j.getByteFrequencyData($);let we=$.reduce((Ln,ms)=>Ln+ms,0),Ye=$.length?we/$.length:0,mt=Math.min(1,Ye/128);Z(mt),Q=requestAnimationFrame(ne)};return Q=requestAnimationFrame(ne),Pa.current=Q,()=>{cancelAnimationFrame(Q),Pa.current=null}},[I]),(0,H.useEffect)(()=>{Xc.current=q},[q]),(0,H.useEffect)(()=>{tu.current=lm.includes(I)},[I]);let nu=(0,H.useRef)(!1);(0,H.useEffect)(()=>{if(!i)return;lm.includes(I)?(nu.current=!0,i(!0)):nu.current&&(nu.current=!1,i(!1))},[I,i]),(0,H.useEffect)(()=>{if(I!=="voice_listening"||!s||!c){Y(null),jt.current&&(clearTimeout(jt.current),jt.current=null);return}let $=(u.find(Q=>Q.id===c)?.transcript??"").trim();if($.length<p4){jt.current&&(clearTimeout(jt.current),jt.current=null);return}return jt.current&&clearTimeout(jt.current),jt.current=setTimeout(()=>{jt.current=null,s($).then(Q=>{Q&&jn.current==="voice_listening"&&Y(Q)}).catch(()=>{})},h4),()=>{jt.current&&(clearTimeout(jt.current),jt.current=null)}},[I,c,u,s]);let $c=(0,H.useCallback)(j=>{j===!1&&(tu.current||e||lm.includes(jn.current)||Xc.current)||p(j)},[e]),au=(0,H.useCallback)(()=>{p(j=>!j)},[]);(0,H.useEffect)(()=>{et.current=c},[c]),(0,H.useEffect)(()=>{St.current=u},[u]),(0,H.useEffect)(()=>{let j=Q=>{if(!Se||!Tr.current)return;Q.preventDefault();let ne=Tr.current.offsetWidth,we=Tr.current.offsetHeight,Ye=Q.clientX-fs.current.x,mt=Q.clientY-fs.current.y,Ln=window.innerWidth-ne-um,ms=window.innerHeight-we-um;Ye=Math.max(um,Math.min(Ye,Ln)),mt=Math.max(um,Math.min(mt,ms)),Te({x:Ye,y:mt})},$=()=>{Se&&(An(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",j),window.addEventListener("mouseup",$),()=>{window.removeEventListener("mousemove",j),window.removeEventListener("mouseup",$)}},[Se]);let ru=(0,H.useCallback)(j=>{if(j.button!==0||!Tr.current)return;let $=Tr.current.getBoundingClientRect();An(!0),document.body.style.userSelect="none",fs.current={x:j.clientX-$.left,y:j.clientY-$.top},Te({x:$.left,y:$.top})},[]),Sr=(0,H.useCallback)(()=>{if(na.current)return;let j=document.createElement("div");j.id="echly-capture-root",document.body.appendChild(j),na.current=j,eu(j),Zo(!0)},[]),cn=(0,H.useCallback)(()=>{if(na.current){try{document.body.removeChild(na.current)}catch(j){console.error("CaptureWidget error:",j)}na.current=null}eu(null),Zo(!1)},[]),dn=(0,H.useCallback)(()=>{b("idle"),p(le)},[le]);(0,H.useEffect)(()=>{if(n!=null){S(n);return}if(!t)return;(async()=>{let $=await LD(t);S($.map(Q=>({id:Q.id,title:Q.title,description:Q.description,type:Q.type})))})()},[t,n]),(0,H.useEffect)(()=>{let j=window.SpeechRecognition||window.webkitSpeechRecognition;if(!j)return;let $=new j;return $.continuous=!0,$.interimResults=!0,$.lang="en-US",$.onresult=Q=>{let ne="";for(let Ye=Q.resultIndex;Ye<Q.results.length;++Ye){let mt=Q.results[Ye];mt&&mt[0]&&(ne+=mt[0].transcript)}let we=et.current;we&&l(Ye=>Ye.map(mt=>mt.id===we?{...mt,transcript:ne}:mt))},$.onend=()=>{let Q=jn.current;Q==="processing"||Q==="success"||b("idle")},ka.current=$,()=>{try{$.stop()}catch(Q){console.error("CaptureWidget error:",Q)}}},[]);let Zt=(0,H.useCallback)(async()=>{try{let j=await navigator.mediaDevices.getUserMedia({audio:!0});Da.current=j;let $=new AudioContext,Q=$.createAnalyser();Q.fftSize=256,Q.smoothingTimeConstant=.7,$.createMediaStreamSource(j).connect(Q),hs.current=$,ps.current=Q,ka.current?.start(),b("voice_listening"),Z(0)}catch(j){console.error("Microphone permission denied:",j),D("Microphone permission denied."),b("error"),cn(),dn()}},[]),iu=(0,H.useCallback)(async()=>{typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),wD(),ka.current?.stop();let j=et.current;if(!j){b("idle");return}let Q=St.current.find(ne=>ne.id===j);if(!Q||!Q.transcript.trim()){b("idle");return}if(b("processing"),e){a(Q.transcript,Q.screenshot,{onSuccess:ne=>{S(we=>[{id:ne.id,title:ne.title,description:ne.description,type:ne.type},...we]),l(we=>we.filter(Ye=>Ye.id!==j)),f(null),We(ne.id),setTimeout(()=>We(null),1200),Ir(!0),setTimeout(()=>Ir(!1),200),$t(!0),setTimeout(()=>{cn(),dn(),$t(!1)},120)},onError:()=>{D("AI processing failed."),b("voice_listening")}},Q.context??void 0);return}try{let ne=await a(Q.transcript,Q.screenshot);if(!ne){b("idle"),cn(),dn();return}S(we=>[{id:ne.id,title:ne.title,description:ne.description,type:ne.type},...we]),l(we=>we.filter(Ye=>Ye.id!==j)),f(null),We(ne.id),setTimeout(()=>We(null),1200),Ir(!0),setTimeout(()=>Ir(!1),200),$t(!0),setTimeout(()=>{cn(),dn(),$t(!1)},120)}catch(ne){console.error(ne),D("AI processing failed."),b("voice_listening")}},[a,e,cn,dn]),Oa=(0,H.useCallback)(()=>{ka.current?.stop();let j=et.current;l($=>$.filter(Q=>Q.id!==j)),f(null),b("cancelled"),cn(),dn()},[cn,dn]);(0,H.useEffect)(()=>{if(!Jt)return;let j=$=>{$.key==="Escape"&&($.preventDefault(),lm.includes(jn.current)&&Oa())};return document.addEventListener("keydown",j),()=>document.removeEventListener("keydown",j)},[Jt,Oa]);let su=(0,H.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),vr=(0,H.useCallback)(()=>{S([]),l([]),f(null),b("idle"),R(null),V(null),L(!1)},[]);(0,H.useEffect)(()=>{if(e)return;let j=$=>{let Q=$.target;gi.current&&Q&&!gi.current.contains(Q)&&L(!1)};return document.addEventListener("mousedown",j),()=>document.removeEventListener("mousedown",j)},[e]);let ou=(0,H.useCallback)(async j=>{try{await r(j),S($=>$.filter(Q=>Q.id!==j))}catch($){console.error("Delete failed:",$)}},[r]),vt=(0,H.useCallback)(j=>{V(j.id),g(j.title),E(j.description)},[]),uu=(0,H.useCallback)(async j=>{let $=T.trim()||T,Q=_;S(ne=>ne.map(we=>we.id===j?{...we,title:$||we.title,description:Q}:we)),V(null);try{let ne=await ED(`/api/tickets/${j}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:$||T,description:Q})}),we=await ne.json();if(ne.ok&&we.success&&we.ticket){let Ye=we.ticket;S(mt=>mt.map(Ln=>Ln.id===j?{...Ln,title:Ye.title,description:Ye.description,type:Ye.type??Ln.type}:Ln))}}catch(ne){console.error("Save edit failed:",ne)}},[T,_]),aa=(0,H.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?new Promise((j,$)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},Q=>{!Q||!Q.success?$(new Error("Capture failed")):j(Q.image??null)})}):Promise.resolve(null),[]),Er=(0,H.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return aa();let{captureScreenshot:j}=await Promise.resolve().then(()=>(xD(),RD));return j()},[aa]),Jc=(0,H.useCallback)(()=>{b("region_selecting")},[]),Zc=(0,H.useCallback)((j,$)=>{let Q=kD(),ne={id:Q,screenshot:j,transcript:"",structuredOutput:null,context:$??null,createdAt:Date.now()};l(we=>[...we,ne]),f(Q),Zt()},[Zt]),bn=(0,H.useCallback)(()=>{b("cancelled"),cn(),dn()},[cn,dn]),ed=(0,H.useCallback)(async()=>{if(jn.current==="idle"&&(D(null),ka.current?.stop(),_e(m),p(!1),Sr(),b("focus_mode"),!e))try{let j=await Er();if(!j){bn();return}let $=kD(),Q={id:$,screenshot:j,transcript:"",structuredOutput:null,createdAt:Date.now()};l(ne=>[...ne,Q]),f($),Zt()}catch(j){console.error(j),D("Screen capture failed."),b("error"),bn()}},[e,m,Er,Zt,Sr,bn]),ym=(0,H.useMemo)(()=>({setIsOpen:$c,toggleOpen:au,startDrag:ru,handleShare:su,setShowMenu:L,resetSession:vr,startListening:Zt,finishListening:iu,discardListening:Oa,deletePointer:ou,startEditing:vt,saveEdit:uu,setExpandedId:R,setEditedTitle:g,setEditedDescription:E,handleAddFeedback:ed,handleRegionCaptured:Zc,handleRegionSelectStart:Jc,handleCancelCapture:bn,getFullTabImage:aa}),[$c,au,ru,su,vr,Zt,iu,Oa,ou,vt,uu,ed,Zc,Jc,bn,aa]),wr=(0,H.useMemo)(()=>c?u.find(j=>j.id===c):null,[c,u]),td=(0,H.useMemo)(()=>I!=="voice_listening"?"neutral":f4(wr?.transcript??""),[I,wr?.transcript]),nd=wr?.transcript?.trim()??"";return{state:{isOpen:m,state:I,errorMessage:x,pointers:v,expandedId:A,editingId:q,editedTitle:T,editedDescription:_,showMenu:C,position:w,liveStructured:U,liveTranscript:nd,listeningAudioLevel:W,listeningSentiment:td,highlightTicketId:je,pillExiting:xa,orbSuccess:Qc},handlers:ym,refs:{widgetRef:Tr,menuRef:gi,captureRootRef:na},captureRootReady:Jt,captureRootEl:gm}}var dm=Ce(Wn());var cm=(...t)=>t.filter((e,n,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===n).join(" ").trim();var PD=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var OD=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,a)=>a?a.toUpperCase():n.toLowerCase());var pv=t=>{let e=OD(t);return e.charAt(0).toUpperCase()+e.slice(1)};var Hc=Ce(Wn());var ND={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var MD=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var UD=(0,Hc.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:r="",children:i,iconNode:s,...u},l)=>(0,Hc.createElement)("svg",{ref:l,...ND,width:e,height:e,stroke:t,strokeWidth:a?Number(n)*24/Number(e):n,className:cm("lucide",r),...!i&&!MD(u)&&{"aria-hidden":"true"},...u},[...s.map(([c,f])=>(0,Hc.createElement)(c,f)),...Array.isArray(i)?i:[i]]));var Ra=(t,e)=>{let n=(0,dm.forwardRef)(({className:a,...r},i)=>(0,dm.createElement)(UD,{ref:i,iconNode:e,className:cm(`lucide-${PD(pv(t))}`,`lucide-${t}`,a),...r}));return n.displayName=pv(t),n};var m4=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Gc=Ra("check",m4);var g4=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],jc=Ra("expand",g4);var y4=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],Wc=Ra("pencil",y4);var _4=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],Kc=Ra("trash-2",_4);var I4=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Yc=Ra("x",I4);var Gt=Ce(It()),v4=()=>(0,Gt.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,Gt.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,Gt.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),E4=()=>(0,Gt.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,Gt.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function mv({onClose:t,summary:e=null,theme:n="dark",onThemeToggle:a}){return(0,Gt.jsxs)("div",{className:"echly-sidebar-header",children:[(0,Gt.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,Gt.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,Gt.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),a&&(0,Gt.jsx)("button",{type:"button",id:"theme-toggle",onClick:a,className:"echly-theme-toggle","aria-label":n==="dark"?"Switch to light mode":"Switch to dark mode",children:n==="dark"?(0,Gt.jsx)(v4,{}):(0,Gt.jsx)(E4,{})}),(0,Gt.jsx)("button",{type:"button",onClick:t,className:"echly-sidebar-close","aria-label":"Close",children:(0,Gt.jsx)(Yc,{size:16,strokeWidth:1.5})})]})}var mr=Ce(Wn());var Ge=Ce(It());function w4(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function C4({item:t,expandedId:e,editingId:n,editedTitle:a,editedDescription:r,onExpand:i,onStartEdit:s,onSaveEdit:u,onDelete:l,onEditedTitleChange:c,onEditedDescriptionChange:f,highlightTicketId:m=null}){let p=e===t.id,I=n===t.id,b=m===t.id,x=w4(t.type),[D,v]=(0,mr.useState)(!1),S=(0,mr.useCallback)(()=>{i(p?null:t.id)},[p,t.id,i]),A=(0,mr.useCallback)(()=>{s(t)},[t,s]),R=(0,mr.useCallback)(()=>{u(t.id),v(!0),setTimeout(()=>v(!1),220)},[t.id,u]),q=(0,mr.useCallback)(()=>{l(t.id)},[t.id,l]);return(0,Ge.jsxs)("div",{className:`echly-feedback-item ${b?"echly-ticket-highlight":""}`,"data-priority":x,children:[(0,Ge.jsx)("span",{className:"echly-priority-dot","aria-hidden":!0}),(0,Ge.jsxs)("div",{className:"echly-feedback-item-inner",children:[(0,Ge.jsx)("div",{className:"echly-feedback-item-content",children:I?(0,Ge.jsxs)(Ge.Fragment,{children:[(0,Ge.jsx)("input",{value:a,onChange:V=>c(V.target.value),className:"echly-widget-input echly-feedback-item-input"}),(0,Ge.jsx)("textarea",{value:r,onChange:V=>f(V.target.value),rows:3,className:"echly-widget-input echly-feedback-item-textarea"})]}):(0,Ge.jsxs)(Ge.Fragment,{children:[(0,Ge.jsx)("h3",{className:"echly-widget-item-title",children:t.title}),p&&(0,Ge.jsx)("p",{className:"echly-widget-item-desc",children:t.description})]})}),(0,Ge.jsxs)("div",{className:"echly-feedback-item-actions",children:[(0,Ge.jsx)("button",{type:"button",onClick:S,className:"echly-widget-action-icon","aria-label":p?"Collapse":"Expand",children:(0,Ge.jsx)(jc,{size:16,strokeWidth:1.5})}),I?(0,Ge.jsx)("button",{type:"button",onClick:R,className:`echly-widget-action-icon echly-widget-action-icon--confirm ${D?"echly-widget-action-icon--confirm-success":""}`,"aria-label":"Save",children:(0,Ge.jsx)(Gc,{size:16,strokeWidth:1.5})}):(0,Ge.jsx)("button",{type:"button",onClick:A,className:"echly-widget-action-icon","aria-label":"Edit",children:(0,Ge.jsx)(Wc,{size:16,strokeWidth:1.5})}),(0,Ge.jsx)("button",{type:"button",onClick:q,className:"echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,Ge.jsx)(Kc,{size:16,strokeWidth:1.5})})]})]})]})}var qD=mr.default.memo(C4,(t,e)=>t.item===e.item&&t.expandedId===e.expandedId&&t.editingId===e.editingId&&t.editedTitle===e.editedTitle&&t.editedDescription===e.editedDescription&&t.highlightTicketId===e.highlightTicketId);var gv=Ce(It());function yv({isIdle:t,onAddFeedback:e,captureDisabled:n=!1}){let a=!t||n;return(0,gv.jsx)("div",{className:"echly-add-insight-wrap",children:(0,gv.jsx)("button",{type:"button",onClick:a?void 0:e,disabled:a,className:`echly-add-insight-btn ${a?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var jD=Ce(Gm());var Tt=Ce(Wn());function A4(t){if(!t||!t.getRootNode)return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let n=[],a=t;for(;a&&a!==e.body&&n.length<12;){let r=a.tagName.toLowerCase();if(a.id&&/^[a-zA-Z][\w-]*$/.test(a.id)){r+=`#${a.id}`,n.unshift(r);break}let i=a.parentElement;if(!i)break;let s=i.children,u=0;for(let l=0;l<s.length;l++)if(s[l]===a){u=l+1;break}r+=`:nth-child(${u})`,n.unshift(r),a=i}return n.length===0?null:n.join(" > ")}function b4(t){if(!t)return null;let e=[],n=t.getAttribute("aria-label")||t.placeholder||t.textContent?.trim()||"";n.length>0&&e.push(n.slice(0,120));let a=t.parentElement;for(let i=0;i<3&&a;i++){let s=a.tagName.toLowerCase();if(s==="label"||s==="h1"||s==="h2"||s==="h3"||s==="h4"){let u=a.textContent?.trim().slice(0,80);u&&e.push(u);break}a=a.parentElement}let r=e.filter(Boolean).join(" \xB7 ");return r?r.length>300?r.slice(0,300)+"\u2026":r:null}function zD(t,e){return{url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:e?A4(e):null,nearbyText:e?b4(e):null,capturedAt:Date.now()}}var _v=null;function L4(){if(typeof window>"u")return null;if(!_v)try{_v=new AudioContext}catch{return null}return _v}function HD(){let t=L4();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(600,e+.04),n.type="sine",a.gain.setValueAtTime(.04,e),a.gain.exponentialRampToValueAtTime(.001,e+.06),n.start(e),n.stop(e+.06)}var gr=Ce(It()),Jo=24,hm="cubic-bezier(0.22, 0.61, 0.36, 1)";async function R4(t,e,n){return new Promise((a,r)=>{let i=new Image;i.crossOrigin="anonymous",i.onload=()=>{let s=Math.round(e.x*n),u=Math.round(e.y*n),l=Math.round(e.w*n),c=Math.round(e.h*n),f=document.createElement("canvas");f.width=l,f.height=c;let m=f.getContext("2d");if(!m){r(new Error("No canvas context"));return}m.drawImage(i,s,u,l,c,0,0,l,c);try{a(f.toDataURL("image/png"))}catch(p){r(p)}},i.onerror=()=>r(new Error("Image load failed")),i.src=t})}function GD({getFullTabImage:t,onAddVoice:e,onCancel:n,onSelectionStart:a}){let[r,i]=(0,Tt.useState)(null),[s,u]=(0,Tt.useState)(null),[l,c]=(0,Tt.useState)(!1),[f,m]=(0,Tt.useState)(!1),p=(0,Tt.useRef)(null),I=(0,Tt.useRef)(null),b=(0,Tt.useCallback)(()=>{i(null),u(null),p.current=null,I.current=null,setTimeout(()=>n(),120)},[n]);(0,Tt.useEffect)(()=>{let g=_=>{_.key==="Escape"&&(_.preventDefault(),s?(u(null),i(null),I.current=null,p.current=null):b())};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[b,s]),(0,Tt.useEffect)(()=>{let g=()=>{document.visibilityState==="hidden"&&b()};return document.addEventListener("visibilitychange",g),()=>document.removeEventListener("visibilitychange",g)},[b]);let x=(0,Tt.useCallback)(async g=>{if(l)return;c(!0),HD(),m(!0),setTimeout(()=>m(!1),150),await new Promise(w=>setTimeout(w,200));let _=null;try{_=await t()}catch{c(!1),n();return}if(!_){c(!1),n();return}let E=typeof window<"u"&&window.devicePixelRatio||1,C;try{C=await R4(_,g,E)}catch{c(!1),n();return}let L=typeof window<"u"?zD(window,null):null;e(C,L),c(!1),u(null)},[t,e,n,l]),D=(0,Tt.useCallback)(()=>{u(null),i(null),I.current=null,p.current=null},[]),v=(0,Tt.useCallback)(g=>{if(g.button!==0||s)return;g.preventDefault(),a?.();let _=g.clientX,E=g.clientY;p.current={x:_,y:E},i({x:_,y:E,w:0,h:0})},[a,s]),S=(0,Tt.useCallback)(g=>{if(g.button!==0)return;g.preventDefault();let _=I.current,E=p.current;if(p.current=null,!E||!_||_.w<Jo||_.h<Jo){i(null);return}i(null),I.current=null,u({x:_.x,y:_.y,w:_.w,h:_.h})},[]),A=(0,Tt.useCallback)(g=>{if(!p.current||s)return;let _=p.current.x,E=p.current.y,C=Math.min(_,g.clientX),L=Math.min(E,g.clientY),w=Math.abs(g.clientX-_),Te=Math.abs(g.clientY-E),Se={x:C,y:L,w,h:Te};I.current=Se,i(Se)},[s]);(0,Tt.useEffect)(()=>{let g=_=>{if(_.button!==0||!p.current||s)return;let E=I.current,C=p.current;if(p.current=null,!C||!E||E.w<Jo||E.h<Jo){i(null),I.current=null;return}i(null),I.current=null,u({x:E.x,y:E.y,w:E.w,h:E.h})};return window.addEventListener("mouseup",g),()=>window.removeEventListener("mouseup",g)},[s]);let R=!!r&&(r.w>=Jo||r.h>=Jo),q=s!==null,V=R&&r||q&&s,T=q?s:r;return(0,gr.jsxs)("div",{role:"presentation","aria-hidden":!0,className:"echly-region-overlay",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,gr.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:V?"transparent":"rgba(0,0,0,0.35)",pointerEvents:s?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${hm}`},onMouseDown:v,onMouseMove:A,onMouseUp:S,onMouseLeave:()=>{!p.current||s||(i(null),p.current=null,I.current=null)}}),(0,gr.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",fontSize:13,color:"rgba(255,255,255,0.8)",zIndex:2147483647,pointerEvents:"none",opacity:s?0:1,transition:`opacity 180ms ${hm}`},children:"Drag to capture area \u2014 ESC to cancel"}),V&&T&&(0,gr.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:T.x,top:T.y,width:Math.max(T.w,1),height:Math.max(T.h,1),borderRadius:6,border:`2px solid ${f?"#FFFFFF":"#5B8CFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.35)",pointerEvents:"none",zIndex:2147483646,transition:f?"none":`border-color 150ms ${hm}`}}),q&&s&&(0,gr.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:s.x+s.w/2,bottom:Math.max(12,s.y+s.h-48),transform:"translate(-50%, 100%)",display:"flex",gap:8,padding:"8px 12px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${hm} forwards`},children:[(0,gr.jsx)("button",{type:"button",onClick:D,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Retake"}),(0,gr.jsx)("button",{type:"button",onClick:()=>x(s),disabled:l,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"linear-gradient(135deg, #5B8CFF, #466EFF)",color:"#fff",fontSize:13,fontWeight:600,cursor:l?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var yr=Ce(It());function WD({captureRoot:t,extensionMode:e,state:n,getFullTabImage:a,onRegionCaptured:r,onRegionSelectStart:i,onCancelCapture:s}){return(0,yr.jsx)(yr.Fragment,{children:(0,jD.createPortal)((0,yr.jsxs)(yr.Fragment,{children:[(n==="focus_mode"||n==="region_selecting")&&(0,yr.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.04)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),e&&(n==="focus_mode"||n==="region_selecting")&&(0,yr.jsx)(GD,{getFullTabImage:a,onAddVoice:r,onCancel:s,onSelectionStart:i})]}),t)})}var pm=Ce(Wn());var _r=Ce(It());function x4(){return(0,_r.jsxs)("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,_r.jsx)("path",{d:"M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"}),(0,_r.jsx)("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2"}),(0,_r.jsx)("line",{x1:"12",x2:"12",y1:"19",y2:"22"})]})}function KD({isRecording:t,isProcessing:e,audioLevel:n}){let a=t&&!e?1+Math.min(.1,n*.1):1;return(0,_r.jsx)("div",{className:["echly-recording-orb-inner",e?"echly-recording-orb-inner--processing":"",t&&!e?"echly-recording-orb-inner--listening":""].filter(Boolean).join(" "),style:t&&!e?{transform:`scale(${a})`}:void 0,"aria-hidden":!0,children:(0,_r.jsx)("span",{className:"echly-recording-orb-icon",style:{color:"#FFFFFF"},children:(0,_r.jsx)(x4,{})})})}var Gn=Ce(It());function YD({visible:t,isActive:e,isProcessing:n,isExiting:a=!1,audioLevel:r,onDone:i,onCancel:s}){let[u,l]=(0,pm.useState)(!1);(0,pm.useEffect)(()=>{if(e||n){let p=requestAnimationFrame(()=>{requestAnimationFrame(()=>l(!0))});return()=>cancelAnimationFrame(p)}let m=requestAnimationFrame(()=>l(!1));return()=>cancelAnimationFrame(m)},[e,n]);let c=n?"Structuring your feedback\u2026":e?"Listening\u2026":"Tell us what's happening \u2014 we'll structure it.",f=e&&!n;return t?(0,Gn.jsx)("div",{className:"echly-recording-row","aria-live":"polite",role:"status",children:(0,Gn.jsxs)("div",{className:["echly-recording-capsule",u?"echly-recording-capsule--expanded":"",n?"echly-recording-capsule--processing":"",a?"echly-recording-capsule--exiting":"",e&&!n?"echly-recording-capsule--recording":""].filter(Boolean).join(" "),children:[(0,Gn.jsx)("div",{className:"echly-recording-orb",children:(0,Gn.jsx)(KD,{isRecording:e,isProcessing:n,audioLevel:r})}),(0,Gn.jsxs)("div",{className:"echly-recording-center",children:[(0,Gn.jsx)("span",{className:"echly-recording-status",children:c}),f&&(0,Gn.jsx)("span",{className:"echly-recording-esc-hint",children:"Press Esc to cancel"}),(0,Gn.jsxs)("div",{className:"echly-recording-action-row",children:[(0,Gn.jsx)("button",{type:"button",onClick:s,className:"echly-recording-cancel-pill","aria-label":"Cancel recording",children:"Cancel"}),e&&!n&&(0,Gn.jsx)("button",{type:"button",className:"echly-recording-done",onClick:i,"aria-label":"Done recording",children:"Done"})]})]})]})}):null}var pt=Ce(It()),k4=["focus_mode","region_selecting","voice_listening","processing"],D4=["voice_listening","processing"];function mm({sessionId:t,userId:e,extensionMode:n=!1,initialPointers:a,onComplete:r,onDelete:i,widgetToggleRef:s,onRecordingChange:u,expanded:l,onExpandRequest:c,onCollapseRequest:f,liveStructureFetch:m,captureDisabled:p=!1,theme:I="dark",onThemeToggle:b}){let{state:x,handlers:D,refs:v,captureRootEl:S}=DD({sessionId:t,userId:e,extensionMode:n,initialPointers:a,onComplete:r,onDelete:i,onRecordingChange:u,liveStructureFetch:m}),R=l!==void 0?l:x.isOpen,q=(0,mi.useRef)(null),V=k4.includes(x.state)||x.pillExiting,T=D4.includes(x.state)||x.pillExiting,g=!V,_=!R&&g,E=R&&g,C=(0,mi.useRef)(!1);(0,mi.useEffect)(()=>{if(!V){C.current=!1;return}C.current||(C.current=!0,f?.())},[V,f]);let L=x.pointers.length,w=x.pointers.filter(Se=>/critical|bug|high|urgent/i.test(Se.type||"")).length,Te=L>0?w>0?`${L} insights \u2022 ${w} need attention`:`${L} insights`:null;return(0,mi.useEffect)(()=>{x.highlightTicketId&&q.current&&q.current.scrollTo({top:0,behavior:"smooth"})},[x.highlightTicketId]),mi.default.useEffect(()=>{if(s)return s.current=D.toggleOpen,()=>{s.current=null}},[D,s]),(0,pt.jsxs)(pt.Fragment,{children:[S&&(0,pt.jsx)(WD,{captureRoot:S,extensionMode:n,state:x.state,getFullTabImage:D.getFullTabImage,onRegionCaptured:D.handleRegionCaptured,onRegionSelectStart:D.handleRegionSelectStart,onCancelCapture:D.handleCancelCapture}),(0,pt.jsx)(YD,{visible:T,isActive:x.state==="voice_listening",isProcessing:x.state==="processing"||x.pillExiting,isExiting:x.pillExiting,audioLevel:x.listeningAudioLevel??0,sentiment:x.listeningSentiment??"neutral",liveTranscript:x.liveTranscript??"",onDone:D.finishListening,onCancel:D.handleCancelCapture}),_&&(0,pt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,pt.jsx)("button",{type:"button",onClick:()=>c?c():D.setIsOpen(!0),className:"echly-floating-trigger",children:"Capture feedback"})}),E&&(0,pt.jsxs)(pt.Fragment,{children:[!n&&(0,pt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,pt.jsx)("div",{ref:v.widgetRef,className:"echly-sidebar-container",style:n?{position:"fixed",...x.position?{left:x.position.x,top:x.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,pt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,pt.jsx)(mv,{onClose:()=>f?f():D.setIsOpen(!1),summary:Te,theme:I,onThemeToggle:b}),(0,pt.jsxs)("div",{ref:q,className:"echly-sidebar-body",children:[(0,pt.jsx)("div",{className:"echly-feedback-list",children:x.pointers.map(Se=>(0,pt.jsx)(qD,{item:Se,expandedId:x.expandedId,editingId:x.editingId,editedTitle:x.editedTitle,editedDescription:x.editedDescription,onExpand:D.setExpandedId,onStartEdit:D.startEditing,onSaveEdit:D.saveEdit,onDelete:D.deletePointer,onEditedTitleChange:D.setEditedTitle,onEditedDescriptionChange:D.setEditedDescription,highlightTicketId:x.highlightTicketId},Se.id))}),x.errorMessage&&(0,pt.jsx)("div",{className:"echly-sidebar-error",children:x.errorMessage}),x.state==="idle"&&(0,pt.jsx)(yv,{isIdle:!0,onAddFeedback:D.handleAddFeedback,captureDisabled:p})]})]})})]})]})}function QD(...t){}var ds=Ce(It()),P4="echly-root",Iv="echly-shadow-host",$D="widget-theme";function O4(){try{let t=localStorage.getItem($D);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function N4(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem($D,e)}catch{}}function M4(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function U4({widgetRoot:t,initialTheme:e}){let[n,a]=kt.default.useState(null),[r,i]=kt.default.useState(null),[s,u]=kt.default.useState(!1),[l,c]=kt.default.useState(e),[f,m]=kt.default.useState({visible:!1,expanded:!1,isRecording:!1,sessionId:null}),p=f.sessionId,I=kt.default.useRef(null),b=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";kt.default.useEffect(()=>{let V=()=>{I.current?.()};return window.addEventListener("ECHLY_TOGGLE_WIDGET",V),()=>{window.removeEventListener("ECHLY_TOGGLE_WIDGET",V)}},[]),kt.default.useEffect(()=>{let V=T=>{let g=T.detail?.state;g&&m(g)};return window.addEventListener("ECHLY_GLOBAL_STATE",V),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",V)},[]),kt.default.useEffect(()=>{let V=()=>{let g=window.location.origin;if(!(g==="https://echly-web.vercel.app"||g==="http://localhost:3000"))return;let E=window.location.pathname.split("/").filter(Boolean);E[0]==="dashboard"&&E[1]&&chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:E[1]},()=>{})};V(),window.addEventListener("popstate",V);let T=setInterval(V,2e3);return()=>{window.removeEventListener("popstate",V),clearInterval(T)}},[]);let x=kt.default.useCallback(V=>{V?chrome.runtime.sendMessage({type:"START_RECORDING"},T=>{if(chrome.runtime.lastError){i(chrome.runtime.lastError.message||"Failed to start recording");return}T?.ok||i(T?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),D=kt.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{})},[]),v=kt.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{})},[]),S=kt.default.useCallback(()=>{let V=l==="dark"?"light":"dark";c(V),N4(t,V)},[l,t]);kt.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},V=>{V?.authenticated&&V.user?.uid?a({uid:V.user.uid,name:V.user.name??null,email:V.user.email??null,photoURL:V.user.photoURL??null}):a(null),u(!0)})},[]);let A=kt.default.useCallback(async(V,T,g,_)=>{if(!p||!n){g?.onError();return}if(g){(async()=>{let O=DS(T??null),U=null;if(T)try{let le=crypto.randomUUID(),_e=`sessions/${p}/feedback/${le}/${Date.now()}.png`,je=UL(k0,_e);await NL(je,T,"data_url",{contentType:"image/png"}),U=await ML(je)}catch(le){console.error("[Echly] Screenshot upload failed:",le),g.onError();return}let Y=await O,W=typeof window<"u"?window.location.href:"",Z={..._??{},visibleText:Y,url:_?.url??W};chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:V,screenshotUrl:U,sessionId:p,context:Z}},le=>{if(chrome.runtime.lastError){console.error("Runtime error",chrome.runtime.lastError),g?.onError();return}if(!le?.success||!le.ticket){console.error("No success in response",le),g?.onError();return}QD("[CONTENT] Ticket received:",le.ticket),g?.onSuccess({id:le.ticket.id,title:le.ticket.title,description:le.ticket.description,type:le.ticket.type??"Feedback"})})})();return}let E=await DS(T??null),C=typeof window<"u"?window.location.href:"",L={transcript:V,context:{..._??{},visibleText:E,url:_?.url??C}},Te=await(await Ep("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(L)})).json(),Se=Array.isArray(Te.tickets)?Te.tickets:[];if(!Te.success||Se.length===0)return;let An=null;if(Se.length>0&&T){let O=P0();An=await O0(T,p,O)}let N;for(let O=0;O<Se.length;O++){let U=Se[O],Y=typeof U.description=="string"?U.description:U.title??"",W={sessionId:p,title:U.title??"",description:Y,type:Array.isArray(U.suggestedTags)&&U.suggestedTags[0]?U.suggestedTags[0]:"Feedback",contextSummary:Y,actionSteps:Array.isArray(U.actionSteps)?U.actionSteps:[],suggestedTags:U.suggestedTags,screenshotUrl:O===0?An:null,metadata:{clientTimestamp:Date.now()}},le=await(await Ep("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(W)})).json();if(le.success&&le.ticket){let _e=le.ticket;N||(N={id:_e.id,title:_e.title,description:_e.description,type:_e.type??"Feedback"})}}return N},[p,n]),R=kt.default.useCallback(async V=>{},[]),q=kt.default.useCallback(async V=>{try{let g=await(await Ep("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:V.trim()})})).json();if(!g.success||!Array.isArray(g.tickets)||g.tickets.length===0)return null;let _=g.tickets[0],E=typeof _.title=="string"?_.title:"",C=Array.isArray(_.suggestedTags)?_.suggestedTags:[];return{title:E,tags:C,priority:"medium"}}catch{return null}},[]);return s?n?(0,ds.jsx)(mm,{sessionId:p??"",userId:n.uid,extensionMode:!0,onComplete:A,onDelete:R,widgetToggleRef:I,onRecordingChange:x,expanded:f.expanded,onExpandRequest:D,onCollapseRequest:v,liveStructureFetch:q,captureDisabled:!p,theme:l,onThemeToggle:S}):(0,ds.jsx)("div",{style:{pointerEvents:"auto"},children:(0,ds.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:M4,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,ds.jsx)("img",{src:b,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})}):null}var V4=`
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif;
  }
  #echly-root * { box-sizing: border-box; }
`;function F4(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let n=document.createElement("style");n.id="echly-reset",n.textContent=V4,t.appendChild(n)}function B4(t){let e=t.attachShadow({mode:"open"});F4(e);let n=document.createElement("div");n.id=P4,n.style.all="initial",n.style.boxSizing="border-box",n.style.pointerEvents="auto",n.style.width="auto",n.style.height="auto";let a=O4();n.setAttribute("data-theme",a),e.appendChild(n),(0,XD.createRoot)(n).render((0,ds.jsx)(U4,{widgetRoot:n,initialTheme:a}))}function q4(t){chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},e=>{e&&(t.style.display=e.visible?"block":"none",window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:{visible:e.visible??!1,expanded:e.expanded??!1,isRecording:e.isRecording??!1,sessionId:e.sessionId??null}}})))})}function z4(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(n=>{if(n.type==="ECHLY_FEEDBACK_CREATED"&&n.ticket&&n.sessionId){window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:n.ticket,sessionId:n.sessionId}}));return}let a=document.getElementById(Iv);a&&(n.type==="ECHLY_GLOBAL_STATE"&&n.state&&(a.style.display=n.state.visible?"block":"none",window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:n.state}}))),n.type==="ECHLY_TOGGLE"&&window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET")))}))}function H4(){let t=document.getElementById(Iv);t||(t=document.createElement("div"),t.id=Iv,t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),B4(t)),z4(t),q4(t)}H4();})();
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
