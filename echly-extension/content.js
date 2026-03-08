"use strict";(()=>{var Nk=Object.create;var lm=Object.defineProperty;var Vk=Object.getOwnPropertyDescriptor;var Fk=Object.getOwnPropertyNames;var Uk=Object.getPrototypeOf,Bk=Object.prototype.hasOwnProperty;var rE=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,n)=>(typeof require<"u"?require:e)[n]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var qk=(t,e)=>()=>(t&&(e=t(t=0)),e);var Fe=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),zk=(t,e)=>{for(var n in e)lm(t,n,{get:e[n],enumerable:!0})},Hk=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Fk(e))!Bk.call(t,r)&&r!==n&&lm(t,r,{get:()=>e[r],enumerable:!(a=Vk(e,r))||a.enumerable});return t};var Ce=(t,e,n)=>(n=t!=null?Nk(Uk(t)):{},Hk(e||!t||!t.__esModule?lm(n,"default",{value:t,enumerable:!0}):n,t));var mE=Fe(he=>{"use strict";var fm=Symbol.for("react.transitional.element"),Gk=Symbol.for("react.portal"),jk=Symbol.for("react.fragment"),Kk=Symbol.for("react.strict_mode"),Wk=Symbol.for("react.profiler"),Xk=Symbol.for("react.consumer"),Yk=Symbol.for("react.context"),Qk=Symbol.for("react.forward_ref"),$k=Symbol.for("react.suspense"),Jk=Symbol.for("react.memo"),lE=Symbol.for("react.lazy"),Zk=Symbol.for("react.activity"),sE=Symbol.iterator;function e1(t){return t===null||typeof t!="object"?null:(t=sE&&t[sE]||t["@@iterator"],typeof t=="function"?t:null)}var cE={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},dE=Object.assign,fE={};function $i(t,e,n){this.props=t,this.context=e,this.refs=fE,this.updater=n||cE}$i.prototype.isReactComponent={};$i.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};$i.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function hE(){}hE.prototype=$i.prototype;function hm(t,e,n){this.props=t,this.context=e,this.refs=fE,this.updater=n||cE}var pm=hm.prototype=new hE;pm.constructor=hm;dE(pm,$i.prototype);pm.isPureReactComponent=!0;var iE=Array.isArray;function dm(){}var lt={H:null,A:null,T:null,S:null},pE=Object.prototype.hasOwnProperty;function mm(t,e,n){var a=n.ref;return{$$typeof:fm,type:t,key:e,ref:a!==void 0?a:null,props:n}}function t1(t,e){return mm(t.type,e,t.props)}function gm(t){return typeof t=="object"&&t!==null&&t.$$typeof===fm}function n1(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var oE=/\/+/g;function cm(t,e){return typeof t=="object"&&t!==null&&t.key!=null?n1(""+t.key):e.toString(36)}function a1(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(dm,dm):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function Qi(t,e,n,a,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case fm:case Gk:i=!0;break;case lE:return i=t._init,Qi(i(t._payload),e,n,a,r)}}if(i)return r=r(t),i=a===""?"."+cm(t,0):a,iE(r)?(n="",i!=null&&(n=i.replace(oE,"$&/")+"/"),Qi(r,e,n,"",function(c){return c})):r!=null&&(gm(r)&&(r=t1(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(oE,"$&/")+"/")+i)),e.push(r)),1;i=0;var u=a===""?".":a+":";if(iE(t))for(var l=0;l<t.length;l++)a=t[l],s=u+cm(a,l),i+=Qi(a,e,n,s,r);else if(l=e1(t),typeof l=="function")for(t=l.call(t),l=0;!(a=t.next()).done;)a=a.value,s=u+cm(a,l++),i+=Qi(a,e,n,s,r);else if(s==="object"){if(typeof t.then=="function")return Qi(a1(t),e,n,a,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function Td(t,e,n){if(t==null)return t;var a=[],r=0;return Qi(t,a,"","",function(s){return e.call(n,s,r++)}),a}function r1(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var uE=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},s1={map:Td,forEach:function(t,e,n){Td(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Td(t,function(){e++}),e},toArray:function(t){return Td(t,function(e){return e})||[]},only:function(t){if(!gm(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};he.Activity=Zk;he.Children=s1;he.Component=$i;he.Fragment=jk;he.Profiler=Wk;he.PureComponent=hm;he.StrictMode=Kk;he.Suspense=$k;he.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=lt;he.__COMPILER_RUNTIME={__proto__:null,c:function(t){return lt.H.useMemoCache(t)}};he.cache=function(t){return function(){return t.apply(null,arguments)}};he.cacheSignal=function(){return null};he.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var a=dE({},t.props),r=t.key;if(e!=null)for(s in e.key!==void 0&&(r=""+e.key),e)!pE.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(a[s]=e[s]);var s=arguments.length-2;if(s===1)a.children=n;else if(1<s){for(var i=Array(s),u=0;u<s;u++)i[u]=arguments[u+2];a.children=i}return mm(t.type,r,a)};he.createContext=function(t){return t={$$typeof:Yk,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:Xk,_context:t},t};he.createElement=function(t,e,n){var a,r={},s=null;if(e!=null)for(a in e.key!==void 0&&(s=""+e.key),e)pE.call(e,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(r[a]=e[a]);var i=arguments.length-2;if(i===1)r.children=n;else if(1<i){for(var u=Array(i),l=0;l<i;l++)u[l]=arguments[l+2];r.children=u}if(t&&t.defaultProps)for(a in i=t.defaultProps,i)r[a]===void 0&&(r[a]=i[a]);return mm(t,s,r)};he.createRef=function(){return{current:null}};he.forwardRef=function(t){return{$$typeof:Qk,render:t}};he.isValidElement=gm;he.lazy=function(t){return{$$typeof:lE,_payload:{_status:-1,_result:t},_init:r1}};he.memo=function(t,e){return{$$typeof:Jk,type:t,compare:e===void 0?null:e}};he.startTransition=function(t){var e=lt.T,n={};lt.T=n;try{var a=t(),r=lt.S;r!==null&&r(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(dm,uE)}catch(s){uE(s)}finally{e!==null&&n.types!==null&&(e.types=n.types),lt.T=e}};he.unstable_useCacheRefresh=function(){return lt.H.useCacheRefresh()};he.use=function(t){return lt.H.use(t)};he.useActionState=function(t,e,n){return lt.H.useActionState(t,e,n)};he.useCallback=function(t,e){return lt.H.useCallback(t,e)};he.useContext=function(t){return lt.H.useContext(t)};he.useDebugValue=function(){};he.useDeferredValue=function(t,e){return lt.H.useDeferredValue(t,e)};he.useEffect=function(t,e){return lt.H.useEffect(t,e)};he.useEffectEvent=function(t){return lt.H.useEffectEvent(t)};he.useId=function(){return lt.H.useId()};he.useImperativeHandle=function(t,e,n){return lt.H.useImperativeHandle(t,e,n)};he.useInsertionEffect=function(t,e){return lt.H.useInsertionEffect(t,e)};he.useLayoutEffect=function(t,e){return lt.H.useLayoutEffect(t,e)};he.useMemo=function(t,e){return lt.H.useMemo(t,e)};he.useOptimistic=function(t,e){return lt.H.useOptimistic(t,e)};he.useReducer=function(t,e,n){return lt.H.useReducer(t,e,n)};he.useRef=function(t){return lt.H.useRef(t)};he.useState=function(t){return lt.H.useState(t)};he.useSyncExternalStore=function(t,e,n){return lt.H.useSyncExternalStore(t,e,n)};he.useTransition=function(){return lt.H.useTransition()};he.version="19.2.3"});var Kn=Fe((zU,gE)=>{"use strict";gE.exports=mE()});var CE=Fe(pt=>{"use strict";function Sm(t,e){var n=t.length;t.push(e);e:for(;0<n;){var a=n-1>>>1,r=t[a];if(0<bd(r,e))t[a]=e,t[n]=r,n=a;else break e}}function Na(t){return t.length===0?null:t[0]}function Cd(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var a=0,r=t.length,s=r>>>1;a<s;){var i=2*(a+1)-1,u=t[i],l=i+1,c=t[l];if(0>bd(u,n))l<r&&0>bd(c,u)?(t[a]=c,t[l]=n,a=l):(t[a]=u,t[i]=n,a=i);else if(l<r&&0>bd(c,n))t[a]=c,t[l]=n,a=l;else break e}}return e}function bd(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}pt.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(yE=performance,pt.unstable_now=function(){return yE.now()}):(ym=Date,IE=ym.now(),pt.unstable_now=function(){return ym.now()-IE});var yE,ym,IE,fr=[],ds=[],i1=1,la=null,Sn=3,vm=!1,$u=!1,Ju=!1,Em=!1,vE=typeof setTimeout=="function"?setTimeout:null,EE=typeof clearTimeout=="function"?clearTimeout:null,_E=typeof setImmediate<"u"?setImmediate:null;function wd(t){for(var e=Na(ds);e!==null;){if(e.callback===null)Cd(ds);else if(e.startTime<=t)Cd(ds),e.sortIndex=e.expirationTime,Sm(fr,e);else break;e=Na(ds)}}function Tm(t){if(Ju=!1,wd(t),!$u)if(Na(fr)!==null)$u=!0,Zi||(Zi=!0,Ji());else{var e=Na(ds);e!==null&&bm(Tm,e.startTime-t)}}var Zi=!1,Zu=-1,TE=5,bE=-1;function wE(){return Em?!0:!(pt.unstable_now()-bE<TE)}function Im(){if(Em=!1,Zi){var t=pt.unstable_now();bE=t;var e=!0;try{e:{$u=!1,Ju&&(Ju=!1,EE(Zu),Zu=-1),vm=!0;var n=Sn;try{t:{for(wd(t),la=Na(fr);la!==null&&!(la.expirationTime>t&&wE());){var a=la.callback;if(typeof a=="function"){la.callback=null,Sn=la.priorityLevel;var r=a(la.expirationTime<=t);if(t=pt.unstable_now(),typeof r=="function"){la.callback=r,wd(t),e=!0;break t}la===Na(fr)&&Cd(fr),wd(t)}else Cd(fr);la=Na(fr)}if(la!==null)e=!0;else{var s=Na(ds);s!==null&&bm(Tm,s.startTime-t),e=!1}}break e}finally{la=null,Sn=n,vm=!1}e=void 0}}finally{e?Ji():Zi=!1}}}var Ji;typeof _E=="function"?Ji=function(){_E(Im)}:typeof MessageChannel<"u"?(_m=new MessageChannel,SE=_m.port2,_m.port1.onmessage=Im,Ji=function(){SE.postMessage(null)}):Ji=function(){vE(Im,0)};var _m,SE;function bm(t,e){Zu=vE(function(){t(pt.unstable_now())},e)}pt.unstable_IdlePriority=5;pt.unstable_ImmediatePriority=1;pt.unstable_LowPriority=4;pt.unstable_NormalPriority=3;pt.unstable_Profiling=null;pt.unstable_UserBlockingPriority=2;pt.unstable_cancelCallback=function(t){t.callback=null};pt.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):TE=0<t?Math.floor(1e3/t):5};pt.unstable_getCurrentPriorityLevel=function(){return Sn};pt.unstable_next=function(t){switch(Sn){case 1:case 2:case 3:var e=3;break;default:e=Sn}var n=Sn;Sn=e;try{return t()}finally{Sn=n}};pt.unstable_requestPaint=function(){Em=!0};pt.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=Sn;Sn=t;try{return e()}finally{Sn=n}};pt.unstable_scheduleCallback=function(t,e,n){var a=pt.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:i1++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>a?(t.sortIndex=n,Sm(ds,t),Na(fr)===null&&t===Na(ds)&&(Ju?(EE(Zu),Zu=-1):Ju=!0,bm(Tm,n-a))):(t.sortIndex=r,Sm(fr,t),$u||vm||($u=!0,Zi||(Zi=!0,Ji()))),t};pt.unstable_shouldYield=wE;pt.unstable_wrapCallback=function(t){var e=Sn;return function(){var n=Sn;Sn=e;try{return t.apply(this,arguments)}finally{Sn=n}}}});var AE=Fe((GU,LE)=>{"use strict";LE.exports=CE()});var RE=Fe(Ln=>{"use strict";var o1=Kn();function xE(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function fs(){}var Cn={d:{f:fs,r:function(){throw Error(xE(522))},D:fs,C:fs,L:fs,m:fs,X:fs,S:fs,M:fs},p:0,findDOMNode:null},u1=Symbol.for("react.portal");function l1(t,e,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:u1,key:a==null?null:""+a,children:t,containerInfo:e,implementation:n}}var el=o1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Ld(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}Ln.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Cn;Ln.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(xE(299));return l1(t,e,null,n)};Ln.flushSync=function(t){var e=el.T,n=Cn.p;try{if(el.T=null,Cn.p=2,t)return t()}finally{el.T=e,Cn.p=n,Cn.d.f()}};Ln.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,Cn.d.C(t,e))};Ln.prefetchDNS=function(t){typeof t=="string"&&Cn.d.D(t)};Ln.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,a=Ld(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,s=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?Cn.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:a,integrity:r,fetchPriority:s}):n==="script"&&Cn.d.X(t,{crossOrigin:a,integrity:r,fetchPriority:s,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};Ln.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Ld(e.as,e.crossOrigin);Cn.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&Cn.d.M(t)};Ln.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,a=Ld(n,e.crossOrigin);Cn.d.L(t,n,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};Ln.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Ld(e.as,e.crossOrigin);Cn.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else Cn.d.m(t)};Ln.requestFormReset=function(t){Cn.d.r(t)};Ln.unstable_batchedUpdates=function(t,e){return t(e)};Ln.useFormState=function(t,e,n){return el.H.useFormState(t,e,n)};Ln.useFormStatus=function(){return el.H.useHostTransitionStatus()};Ln.version="19.2.3"});var Ad=Fe((KU,DE)=>{"use strict";function kE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(kE)}catch(t){console.error(t)}}kE(),DE.exports=RE()});var GC=Fe(eh=>{"use strict";var Yt=AE(),rb=Kn(),c1=Ad();function V(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function sb(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Bl(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function ib(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function ob(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function PE(t){if(Bl(t)!==t)throw Error(V(188))}function d1(t){var e=t.alternate;if(!e){if(e=Bl(t),e===null)throw Error(V(188));return e!==t?null:t}for(var n=t,a=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(a=r.return,a!==null){n=a;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return PE(r),t;if(s===a)return PE(r),e;s=s.sibling}throw Error(V(188))}if(n.return!==a.return)n=r,a=s;else{for(var i=!1,u=r.child;u;){if(u===n){i=!0,n=r,a=s;break}if(u===a){i=!0,a=r,n=s;break}u=u.sibling}if(!i){for(u=s.child;u;){if(u===n){i=!0,n=s,a=r;break}if(u===a){i=!0,a=s,n=r;break}u=u.sibling}if(!i)throw Error(V(189))}}if(n.alternate!==a)throw Error(V(190))}if(n.tag!==3)throw Error(V(188));return n.stateNode.current===n?t:e}function ub(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=ub(t),e!==null)return e;t=t.sibling}return null}var ft=Object.assign,f1=Symbol.for("react.element"),xd=Symbol.for("react.transitional.element"),ul=Symbol.for("react.portal"),so=Symbol.for("react.fragment"),lb=Symbol.for("react.strict_mode"),rg=Symbol.for("react.profiler"),cb=Symbol.for("react.consumer"),Sr=Symbol.for("react.context"),Zg=Symbol.for("react.forward_ref"),sg=Symbol.for("react.suspense"),ig=Symbol.for("react.suspense_list"),ey=Symbol.for("react.memo"),hs=Symbol.for("react.lazy");Symbol.for("react.scope");var og=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var h1=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var OE=Symbol.iterator;function tl(t){return t===null||typeof t!="object"?null:(t=OE&&t[OE]||t["@@iterator"],typeof t=="function"?t:null)}var p1=Symbol.for("react.client.reference");function ug(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===p1?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case so:return"Fragment";case rg:return"Profiler";case lb:return"StrictMode";case sg:return"Suspense";case ig:return"SuspenseList";case og:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case ul:return"Portal";case Sr:return t.displayName||"Context";case cb:return(t._context.displayName||"Context")+".Consumer";case Zg:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case ey:return e=t.displayName||null,e!==null?e:ug(t.type)||"Memo";case hs:e=t._payload,t=t._init;try{return ug(t(e))}catch{}}return null}var ll=Array.isArray,se=rb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,He=c1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ii={pending:!1,data:null,method:null,action:null},lg=[],io=-1;function qa(t){return{current:t}}function tn(t){0>io||(t.current=lg[io],lg[io]=null,io--)}function it(t,e){io++,lg[io]=t.current,t.current=e}var Ba=qa(null),Cl=qa(null),bs=qa(null),lf=qa(null);function cf(t,e){switch(it(bs,e),it(Cl,t),it(Ba,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?qT(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=qT(e),t=RC(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}tn(Ba),it(Ba,t)}function wo(){tn(Ba),tn(Cl),tn(bs)}function cg(t){t.memoizedState!==null&&it(lf,t);var e=Ba.current,n=RC(e,t.type);e!==n&&(it(Cl,t),it(Ba,n))}function df(t){Cl.current===t&&(tn(Ba),tn(Cl)),lf.current===t&&(tn(lf),Vl._currentValue=ii)}var wm,ME;function ni(t){if(wm===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);wm=e&&e[1]||"",ME=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+wm+t+ME}var Cm=!1;function Lm(t,e){if(!t||Cm)return"";Cm=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(e){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(v){var m=v}Reflect.construct(t,[],p)}else{try{p.call()}catch(v){m=v}t.call(p.prototype)}}else{try{throw Error()}catch(v){m=v}(p=t())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(v){if(v&&m&&typeof v.stack=="string")return[v.stack,m.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=a.DetermineComponentFrameRoot(),i=s[0],u=s[1];if(i&&u){var l=i.split(`
`),c=u.split(`
`);for(r=a=0;a<l.length&&!l[a].includes("DetermineComponentFrameRoot");)a++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(a===l.length||r===c.length)for(a=l.length-1,r=c.length-1;1<=a&&0<=r&&l[a]!==c[r];)r--;for(;1<=a&&0<=r;a--,r--)if(l[a]!==c[r]){if(a!==1||r!==1)do if(a--,r--,0>r||l[a]!==c[r]){var f=`
`+l[a].replace(" at new "," at ");return t.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",t.displayName)),f}while(1<=a&&0<=r);break}}}finally{Cm=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?ni(n):""}function m1(t,e){switch(t.tag){case 26:case 27:case 5:return ni(t.type);case 16:return ni("Lazy");case 13:return t.child!==e&&e!==null?ni("Suspense Fallback"):ni("Suspense");case 19:return ni("SuspenseList");case 0:case 15:return Lm(t.type,!1);case 11:return Lm(t.type.render,!1);case 1:return Lm(t.type,!0);case 31:return ni("Activity");default:return""}}function NE(t){try{var e="",n=null;do e+=m1(t,n),n=t,t=t.return;while(t);return e}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var dg=Object.prototype.hasOwnProperty,ty=Yt.unstable_scheduleCallback,Am=Yt.unstable_cancelCallback,g1=Yt.unstable_shouldYield,y1=Yt.unstable_requestPaint,$n=Yt.unstable_now,I1=Yt.unstable_getCurrentPriorityLevel,db=Yt.unstable_ImmediatePriority,fb=Yt.unstable_UserBlockingPriority,ff=Yt.unstable_NormalPriority,_1=Yt.unstable_LowPriority,hb=Yt.unstable_IdlePriority,S1=Yt.log,v1=Yt.unstable_setDisableYieldValue,ql=null,Jn=null;function _s(t){if(typeof S1=="function"&&v1(t),Jn&&typeof Jn.setStrictMode=="function")try{Jn.setStrictMode(ql,t)}catch{}}var Zn=Math.clz32?Math.clz32:b1,E1=Math.log,T1=Math.LN2;function b1(t){return t>>>=0,t===0?32:31-(E1(t)/T1|0)|0}var Rd=256,kd=262144,Dd=4194304;function ai(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Ff(t,e,n){var a=t.pendingLanes;if(a===0)return 0;var r=0,s=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var u=a&134217727;return u!==0?(a=u&~s,a!==0?r=ai(a):(i&=u,i!==0?r=ai(i):n||(n=u&~t,n!==0&&(r=ai(n))))):(u=a&~s,u!==0?r=ai(u):i!==0?r=ai(i):n||(n=a&~t,n!==0&&(r=ai(n)))),r===0?0:e!==0&&e!==r&&!(e&s)&&(s=r&-r,n=e&-e,s>=n||s===32&&(n&4194048)!==0)?e:r}function zl(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function w1(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function pb(){var t=Dd;return Dd<<=1,!(Dd&62914560)&&(Dd=4194304),t}function xm(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Hl(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function C1(t,e,n,a,r,s){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var u=t.entanglements,l=t.expirationTimes,c=t.hiddenUpdates;for(n=i&~n;0<n;){var f=31-Zn(n),p=1<<f;u[f]=0,l[f]=-1;var m=c[f];if(m!==null)for(c[f]=null,f=0;f<m.length;f++){var v=m[f];v!==null&&(v.lane&=-536870913)}n&=~p}a!==0&&mb(t,a,0),s!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=s&~(i&~e))}function mb(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var a=31-Zn(e);t.entangledLanes|=e,t.entanglements[a]=t.entanglements[a]|1073741824|n&261930}function gb(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var a=31-Zn(n),r=1<<a;r&e|t[a]&e&&(t[a]|=e),n&=~r}}function yb(t,e){var n=e&-e;return n=n&42?1:ny(n),n&(t.suspendedLanes|e)?0:n}function ny(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function ay(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function Ib(){var t=He.p;return t!==0?t:(t=window.event,t===void 0?32:qC(t.type))}function VE(t,e){var n=He.p;try{return He.p=t,e()}finally{He.p=n}}var Vs=Math.random().toString(36).slice(2),fn="__reactFiber$"+Vs,Nn="__reactProps$"+Vs,No="__reactContainer$"+Vs,fg="__reactEvents$"+Vs,L1="__reactListeners$"+Vs,A1="__reactHandles$"+Vs,FE="__reactResources$"+Vs,Gl="__reactMarker$"+Vs;function ry(t){delete t[fn],delete t[Nn],delete t[fg],delete t[L1],delete t[A1]}function oo(t){var e=t[fn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[No]||n[fn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=KT(t);t!==null;){if(n=t[fn])return n;t=KT(t)}return e}t=n,n=t.parentNode}return null}function Vo(t){if(t=t[fn]||t[No]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function cl(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(V(33))}function Io(t){var e=t[FE];return e||(e=t[FE]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function en(t){t[Gl]=!0}var _b=new Set,Sb={};function gi(t,e){Co(t,e),Co(t+"Capture",e)}function Co(t,e){for(Sb[t]=e,t=0;t<e.length;t++)_b.add(e[t])}var x1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),UE={},BE={};function R1(t){return dg.call(BE,t)?!0:dg.call(UE,t)?!1:x1.test(t)?BE[t]=!0:(UE[t]=!0,!1)}function Wd(t,e,n){if(R1(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var a=e.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Pd(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function hr(t,e,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+a)}}function da(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function vb(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function k1(t,e,n){var a=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var r=a.get,s=a.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(i){n=""+i,s.call(this,i)}}),Object.defineProperty(t,e,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function hg(t){if(!t._valueTracker){var e=vb(t)?"checked":"value";t._valueTracker=k1(t,e,""+t[e])}}function Eb(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),a="";return t&&(a=vb(t)?t.checked?"true":"false":t.value),t=a,t!==n?(e.setValue(t),!0):!1}function hf(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var D1=/[\n"\\]/g;function pa(t){return t.replace(D1,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function pg(t,e,n,a,r,s,i,u){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+da(e)):t.value!==""+da(e)&&(t.value=""+da(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?mg(t,i,da(e)):n!=null?mg(t,i,da(n)):a!=null&&t.removeAttribute("value"),r==null&&s!=null&&(t.defaultChecked=!!s),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.name=""+da(u):t.removeAttribute("name")}function Tb(t,e,n,a,r,s,i,u){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.type=s),e!=null||n!=null){if(!(s!=="submit"&&s!=="reset"||e!=null)){hg(t);return}n=n!=null?""+da(n):"",e=e!=null?""+da(e):n,u||e===t.value||(t.value=e),t.defaultValue=e}a=a??r,a=typeof a!="function"&&typeof a!="symbol"&&!!a,t.checked=u?t.checked:!!a,t.defaultChecked=!!a,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),hg(t)}function mg(t,e,n){e==="number"&&hf(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function _o(t,e,n,a){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&a&&(t[n].defaultSelected=!0)}else{for(n=""+da(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,a&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function bb(t,e,n){if(e!=null&&(e=""+da(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+da(n):""}function wb(t,e,n,a){if(e==null){if(a!=null){if(n!=null)throw Error(V(92));if(ll(a)){if(1<a.length)throw Error(V(93));a=a[0]}n=a}n==null&&(n=""),e=n}n=da(e),t.defaultValue=n,a=t.textContent,a===n&&a!==""&&a!==null&&(t.value=a),hg(t)}function Lo(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var P1=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function qE(t,e,n){var a=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":a?t.setProperty(e,n):typeof n!="number"||n===0||P1.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function Cb(t,e,n){if(e!=null&&typeof e!="object")throw Error(V(62));if(t=t.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||e!=null&&e.hasOwnProperty(a)||(a.indexOf("--")===0?t.setProperty(a,""):a==="float"?t.cssFloat="":t[a]="");for(var r in e)a=e[r],e.hasOwnProperty(r)&&n[r]!==a&&qE(t,r,a)}else for(var s in e)e.hasOwnProperty(s)&&qE(t,s,e[s])}function sy(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var O1=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),M1=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Xd(t){return M1.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function vr(){}var gg=null;function iy(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var uo=null,So=null;function zE(t){var e=Vo(t);if(e&&(t=e.stateNode)){var n=t[Nn]||null;e:switch(t=e.stateNode,e.type){case"input":if(pg(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+pa(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var a=n[e];if(a!==t&&a.form===t.form){var r=a[Nn]||null;if(!r)throw Error(V(90));pg(a,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)a=n[e],a.form===t.form&&Eb(a)}break e;case"textarea":bb(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&_o(t,!!n.multiple,e,!1)}}}var Rm=!1;function Lb(t,e,n){if(Rm)return t(e,n);Rm=!0;try{var a=t(e);return a}finally{if(Rm=!1,(uo!==null||So!==null)&&(Qf(),uo&&(e=uo,t=So,So=uo=null,zE(e),t)))for(e=0;e<t.length;e++)zE(t[e])}}function Ll(t,e){var n=t.stateNode;if(n===null)return null;var a=n[Nn]||null;if(a===null)return null;n=a[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(t=t.type,a=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!a;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(V(231,e,typeof n));return n}var Cr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),yg=!1;if(Cr)try{eo={},Object.defineProperty(eo,"passive",{get:function(){yg=!0}}),window.addEventListener("test",eo,eo),window.removeEventListener("test",eo,eo)}catch{yg=!1}var eo,Ss=null,oy=null,Yd=null;function Ab(){if(Yd)return Yd;var t,e=oy,n=e.length,a,r="value"in Ss?Ss.value:Ss.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var i=n-t;for(a=1;a<=i&&e[n-a]===r[s-a];a++);return Yd=r.slice(t,1<a?1-a:void 0)}function Qd(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Od(){return!0}function HE(){return!1}function Vn(t){function e(n,a,r,s,i){this._reactName=n,this._targetInst=r,this.type=a,this.nativeEvent=s,this.target=i,this.currentTarget=null;for(var u in t)t.hasOwnProperty(u)&&(n=t[u],this[u]=n?n(s):s[u]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Od:HE,this.isPropagationStopped=HE,this}return ft(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Od)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Od)},persist:function(){},isPersistent:Od}),e}var yi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Uf=Vn(yi),jl=ft({},yi,{view:0,detail:0}),N1=Vn(jl),km,Dm,nl,Bf=ft({},jl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:uy,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==nl&&(nl&&t.type==="mousemove"?(km=t.screenX-nl.screenX,Dm=t.screenY-nl.screenY):Dm=km=0,nl=t),km)},movementY:function(t){return"movementY"in t?t.movementY:Dm}}),GE=Vn(Bf),V1=ft({},Bf,{dataTransfer:0}),F1=Vn(V1),U1=ft({},jl,{relatedTarget:0}),Pm=Vn(U1),B1=ft({},yi,{animationName:0,elapsedTime:0,pseudoElement:0}),q1=Vn(B1),z1=ft({},yi,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),H1=Vn(z1),G1=ft({},yi,{data:0}),jE=Vn(G1),j1={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},K1={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},W1={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function X1(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=W1[t])?!!e[t]:!1}function uy(){return X1}var Y1=ft({},jl,{key:function(t){if(t.key){var e=j1[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Qd(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?K1[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:uy,charCode:function(t){return t.type==="keypress"?Qd(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Qd(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Q1=Vn(Y1),$1=ft({},Bf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),KE=Vn($1),J1=ft({},jl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:uy}),Z1=Vn(J1),eD=ft({},yi,{propertyName:0,elapsedTime:0,pseudoElement:0}),tD=Vn(eD),nD=ft({},Bf,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),aD=Vn(nD),rD=ft({},yi,{newState:0,oldState:0}),sD=Vn(rD),iD=[9,13,27,32],ly=Cr&&"CompositionEvent"in window,hl=null;Cr&&"documentMode"in document&&(hl=document.documentMode);var oD=Cr&&"TextEvent"in window&&!hl,xb=Cr&&(!ly||hl&&8<hl&&11>=hl),WE=" ",XE=!1;function Rb(t,e){switch(t){case"keyup":return iD.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function kb(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var lo=!1;function uD(t,e){switch(t){case"compositionend":return kb(e);case"keypress":return e.which!==32?null:(XE=!0,WE);case"textInput":return t=e.data,t===WE&&XE?null:t;default:return null}}function lD(t,e){if(lo)return t==="compositionend"||!ly&&Rb(t,e)?(t=Ab(),Yd=oy=Ss=null,lo=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return xb&&e.locale!=="ko"?null:e.data;default:return null}}var cD={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function YE(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!cD[t.type]:e==="textarea"}function Db(t,e,n,a){uo?So?So.push(a):So=[a]:uo=a,e=kf(e,"onChange"),0<e.length&&(n=new Uf("onChange","change",null,n,a),t.push({event:n,listeners:e}))}var pl=null,Al=null;function dD(t){LC(t,0)}function qf(t){var e=cl(t);if(Eb(e))return t}function QE(t,e){if(t==="change")return e}var Pb=!1;Cr&&(Cr?(Nd="oninput"in document,Nd||(Om=document.createElement("div"),Om.setAttribute("oninput","return;"),Nd=typeof Om.oninput=="function"),Md=Nd):Md=!1,Pb=Md&&(!document.documentMode||9<document.documentMode));var Md,Nd,Om;function $E(){pl&&(pl.detachEvent("onpropertychange",Ob),Al=pl=null)}function Ob(t){if(t.propertyName==="value"&&qf(Al)){var e=[];Db(e,Al,t,iy(t)),Lb(dD,e)}}function fD(t,e,n){t==="focusin"?($E(),pl=e,Al=n,pl.attachEvent("onpropertychange",Ob)):t==="focusout"&&$E()}function hD(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return qf(Al)}function pD(t,e){if(t==="click")return qf(e)}function mD(t,e){if(t==="input"||t==="change")return qf(e)}function gD(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var ta=typeof Object.is=="function"?Object.is:gD;function xl(t,e){if(ta(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),a=Object.keys(e);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var r=n[a];if(!dg.call(e,r)||!ta(t[r],e[r]))return!1}return!0}function JE(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function ZE(t,e){var n=JE(t);t=0;for(var a;n;){if(n.nodeType===3){if(a=t+n.textContent.length,t<=e&&a>=e)return{node:n,offset:e-t};t=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=JE(n)}}function Mb(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Mb(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Nb(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=hf(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=hf(t.document)}return e}function cy(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var yD=Cr&&"documentMode"in document&&11>=document.documentMode,co=null,Ig=null,ml=null,_g=!1;function eT(t,e,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;_g||co==null||co!==hf(a)||(a=co,"selectionStart"in a&&cy(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),ml&&xl(ml,a)||(ml=a,a=kf(Ig,"onSelect"),0<a.length&&(e=new Uf("onSelect","select",null,e,n),t.push({event:e,listeners:a}),e.target=co)))}function ti(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var fo={animationend:ti("Animation","AnimationEnd"),animationiteration:ti("Animation","AnimationIteration"),animationstart:ti("Animation","AnimationStart"),transitionrun:ti("Transition","TransitionRun"),transitionstart:ti("Transition","TransitionStart"),transitioncancel:ti("Transition","TransitionCancel"),transitionend:ti("Transition","TransitionEnd")},Mm={},Vb={};Cr&&(Vb=document.createElement("div").style,"AnimationEvent"in window||(delete fo.animationend.animation,delete fo.animationiteration.animation,delete fo.animationstart.animation),"TransitionEvent"in window||delete fo.transitionend.transition);function Ii(t){if(Mm[t])return Mm[t];if(!fo[t])return t;var e=fo[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Vb)return Mm[t]=e[n];return t}var Fb=Ii("animationend"),Ub=Ii("animationiteration"),Bb=Ii("animationstart"),ID=Ii("transitionrun"),_D=Ii("transitionstart"),SD=Ii("transitioncancel"),qb=Ii("transitionend"),zb=new Map,Sg="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Sg.push("scrollEnd");function Ca(t,e){zb.set(t,e),gi(e,[t])}var pf=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ca=[],ho=0,dy=0;function zf(){for(var t=ho,e=dy=ho=0;e<t;){var n=ca[e];ca[e++]=null;var a=ca[e];ca[e++]=null;var r=ca[e];ca[e++]=null;var s=ca[e];if(ca[e++]=null,a!==null&&r!==null){var i=a.pending;i===null?r.next=r:(r.next=i.next,i.next=r),a.pending=r}s!==0&&Hb(n,r,s)}}function Hf(t,e,n,a){ca[ho++]=t,ca[ho++]=e,ca[ho++]=n,ca[ho++]=a,dy|=a,t.lanes|=a,t=t.alternate,t!==null&&(t.lanes|=a)}function fy(t,e,n,a){return Hf(t,e,n,a),mf(t)}function _i(t,e){return Hf(t,null,null,e),mf(t)}function Hb(t,e,n){t.lanes|=n;var a=t.alternate;a!==null&&(a.lanes|=n);for(var r=!1,s=t.return;s!==null;)s.childLanes|=n,a=s.alternate,a!==null&&(a.childLanes|=n),s.tag===22&&(t=s.stateNode,t===null||t._visibility&1||(r=!0)),t=s,s=s.return;return t.tag===3?(s=t.stateNode,r&&e!==null&&(r=31-Zn(n),t=s.hiddenUpdates,a=t[r],a===null?t[r]=[e]:a.push(e),e.lane=n|536870912),s):null}function mf(t){if(50<bl)throw bl=0,qg=null,Error(V(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var po={};function vD(t,e,n,a){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Yn(t,e,n,a){return new vD(t,e,n,a)}function hy(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Tr(t,e){var n=t.alternate;return n===null?(n=Yn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function Gb(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function $d(t,e,n,a,r,s){var i=0;if(a=t,typeof t=="function")hy(t)&&(i=1);else if(typeof t=="string")i=bP(t,n,Ba.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case og:return t=Yn(31,n,e,r),t.elementType=og,t.lanes=s,t;case so:return oi(n.children,r,s,e);case lb:i=8,r|=24;break;case rg:return t=Yn(12,n,e,r|2),t.elementType=rg,t.lanes=s,t;case sg:return t=Yn(13,n,e,r),t.elementType=sg,t.lanes=s,t;case ig:return t=Yn(19,n,e,r),t.elementType=ig,t.lanes=s,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Sr:i=10;break e;case cb:i=9;break e;case Zg:i=11;break e;case ey:i=14;break e;case hs:i=16,a=null;break e}i=29,n=Error(V(130,t===null?"null":typeof t,"")),a=null}return e=Yn(i,n,e,r),e.elementType=t,e.type=a,e.lanes=s,e}function oi(t,e,n,a){return t=Yn(7,t,a,e),t.lanes=n,t}function Nm(t,e,n){return t=Yn(6,t,null,e),t.lanes=n,t}function jb(t){var e=Yn(18,null,null,0);return e.stateNode=t,e}function Vm(t,e,n){return e=Yn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var tT=new WeakMap;function ma(t,e){if(typeof t=="object"&&t!==null){var n=tT.get(t);return n!==void 0?n:(e={value:t,source:e,stack:NE(e)},tT.set(t,e),e)}return{value:t,source:e,stack:NE(e)}}var mo=[],go=0,gf=null,Rl=0,fa=[],ha=0,Ps=null,Va=1,Fa="";function Ir(t,e){mo[go++]=Rl,mo[go++]=gf,gf=t,Rl=e}function Kb(t,e,n){fa[ha++]=Va,fa[ha++]=Fa,fa[ha++]=Ps,Ps=t;var a=Va;t=Fa;var r=32-Zn(a)-1;a&=~(1<<r),n+=1;var s=32-Zn(e)+r;if(30<s){var i=r-r%5;s=(a&(1<<i)-1).toString(32),a>>=i,r-=i,Va=1<<32-Zn(e)+r|n<<r|a,Fa=s+t}else Va=1<<s|n<<r|a,Fa=t}function py(t){t.return!==null&&(Ir(t,1),Kb(t,1,0))}function my(t){for(;t===gf;)gf=mo[--go],mo[go]=null,Rl=mo[--go],mo[go]=null;for(;t===Ps;)Ps=fa[--ha],fa[ha]=null,Fa=fa[--ha],fa[ha]=null,Va=fa[--ha],fa[ha]=null}function Wb(t,e){fa[ha++]=Va,fa[ha++]=Fa,fa[ha++]=Ps,Va=e.id,Fa=e.overflow,Ps=t}var hn=null,dt=null,xe=!1,ws=null,ga=!1,vg=Error(V(519));function Os(t){var e=Error(V(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw kl(ma(e,t)),vg}function nT(t){var e=t.stateNode,n=t.type,a=t.memoizedProps;switch(e[fn]=t,e[Nn]=a,n){case"dialog":Te("cancel",e),Te("close",e);break;case"iframe":case"object":case"embed":Te("load",e);break;case"video":case"audio":for(n=0;n<Ml.length;n++)Te(Ml[n],e);break;case"source":Te("error",e);break;case"img":case"image":case"link":Te("error",e),Te("load",e);break;case"details":Te("toggle",e);break;case"input":Te("invalid",e),Tb(e,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":Te("invalid",e);break;case"textarea":Te("invalid",e),wb(e,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||a.suppressHydrationWarning===!0||xC(e.textContent,n)?(a.popover!=null&&(Te("beforetoggle",e),Te("toggle",e)),a.onScroll!=null&&Te("scroll",e),a.onScrollEnd!=null&&Te("scrollend",e),a.onClick!=null&&(e.onclick=vr),e=!0):e=!1,e||Os(t,!0)}function aT(t){for(hn=t.return;hn;)switch(hn.tag){case 5:case 31:case 13:ga=!1;return;case 27:case 3:ga=!0;return;default:hn=hn.return}}function to(t){if(t!==hn)return!1;if(!xe)return aT(t),xe=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||Kg(t.type,t.memoizedProps)),n=!n),n&&dt&&Os(t),aT(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(317));dt=jT(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(317));dt=jT(t)}else e===27?(e=dt,Fs(t.type)?(t=Qg,Qg=null,dt=t):dt=e):dt=hn?Ia(t.stateNode.nextSibling):null;return!0}function di(){dt=hn=null,xe=!1}function Fm(){var t=ws;return t!==null&&(On===null?On=t:On.push.apply(On,t),ws=null),t}function kl(t){ws===null?ws=[t]:ws.push(t)}var Eg=qa(null),Si=null,Er=null;function ms(t,e,n){it(Eg,e._currentValue),e._currentValue=n}function br(t){t._currentValue=Eg.current,tn(Eg)}function Tg(t,e,n){for(;t!==null;){var a=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,a!==null&&(a.childLanes|=e)):a!==null&&(a.childLanes&e)!==e&&(a.childLanes|=e),t===n)break;t=t.return}}function bg(t,e,n,a){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var s=r.dependencies;if(s!==null){var i=r.child;s=s.firstContext;e:for(;s!==null;){var u=s;s=r;for(var l=0;l<e.length;l++)if(u.context===e[l]){s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),Tg(s.return,n,t),a||(i=null);break e}s=u.next}}else if(r.tag===18){if(i=r.return,i===null)throw Error(V(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),Tg(i,n,t),i=null}else i=r.child;if(i!==null)i.return=r;else for(i=r;i!==null;){if(i===t){i=null;break}if(r=i.sibling,r!==null){r.return=i.return,i=r;break}i=i.return}r=i}}function Fo(t,e,n,a){t=null;for(var r=e,s=!1;r!==null;){if(!s){if(r.flags&524288)s=!0;else if(r.flags&262144)break}if(r.tag===10){var i=r.alternate;if(i===null)throw Error(V(387));if(i=i.memoizedProps,i!==null){var u=r.type;ta(r.pendingProps.value,i.value)||(t!==null?t.push(u):t=[u])}}else if(r===lf.current){if(i=r.alternate,i===null)throw Error(V(387));i.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(Vl):t=[Vl])}r=r.return}t!==null&&bg(e,t,n,a),e.flags|=262144}function yf(t){for(t=t.firstContext;t!==null;){if(!ta(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function fi(t){Si=t,Er=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function pn(t){return Xb(Si,t)}function Vd(t,e){return Si===null&&fi(t),Xb(t,e)}function Xb(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},Er===null){if(t===null)throw Error(V(308));Er=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else Er=Er.next=e;return n}var ED=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,a){t.push(a)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},TD=Yt.unstable_scheduleCallback,bD=Yt.unstable_NormalPriority,Nt={$$typeof:Sr,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function gy(){return{controller:new ED,data:new Map,refCount:0}}function Kl(t){t.refCount--,t.refCount===0&&TD(bD,function(){t.controller.abort()})}var gl=null,wg=0,Ao=0,vo=null;function wD(t,e){if(gl===null){var n=gl=[];wg=0,Ao=qy(),vo={status:"pending",value:void 0,then:function(a){n.push(a)}}}return wg++,e.then(rT,rT),e}function rT(){if(--wg===0&&gl!==null){vo!==null&&(vo.status="fulfilled");var t=gl;gl=null,Ao=0,vo=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function CD(t,e){var n=[],a={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){a.status="fulfilled",a.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(a.status="rejected",a.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),a}var sT=se.S;se.S=function(t,e){uC=$n(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&wD(t,e),sT!==null&&sT(t,e)};var ui=qa(null);function yy(){var t=ui.current;return t!==null?t:nt.pooledCache}function Jd(t,e){e===null?it(ui,ui.current):it(ui,e.pool)}function Yb(){var t=yy();return t===null?null:{parent:Nt._currentValue,pool:t}}var Uo=Error(V(460)),Iy=Error(V(474)),Gf=Error(V(542)),If={then:function(){}};function iT(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Qb(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(vr,vr),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,uT(t),t;default:if(typeof e.status=="string")e.then(vr,vr);else{if(t=nt,t!==null&&100<t.shellSuspendCounter)throw Error(V(482));t=e,t.status="pending",t.then(function(a){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=a}},function(a){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=a}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,uT(t),t}throw li=e,Uo}}function ri(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(li=n,Uo):n}}var li=null;function oT(){if(li===null)throw Error(V(459));var t=li;return li=null,t}function uT(t){if(t===Uo||t===Gf)throw Error(V(483))}var Eo=null,Dl=0;function Fd(t){var e=Dl;return Dl+=1,Eo===null&&(Eo=[]),Qb(Eo,t,e)}function al(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Ud(t,e){throw e.$$typeof===f1?Error(V(525)):(t=Object.prototype.toString.call(e),Error(V(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function $b(t){function e(E,I){if(t){var w=E.deletions;w===null?(E.deletions=[I],E.flags|=16):w.push(I)}}function n(E,I){if(!t)return null;for(;I!==null;)e(E,I),I=I.sibling;return null}function a(E){for(var I=new Map;E!==null;)E.key!==null?I.set(E.key,E):I.set(E.index,E),E=E.sibling;return I}function r(E,I){return E=Tr(E,I),E.index=0,E.sibling=null,E}function s(E,I,w){return E.index=w,t?(w=E.alternate,w!==null?(w=w.index,w<I?(E.flags|=67108866,I):w):(E.flags|=67108866,I)):(E.flags|=1048576,I)}function i(E){return t&&E.alternate===null&&(E.flags|=67108866),E}function u(E,I,w,A){return I===null||I.tag!==6?(I=Nm(w,E.mode,A),I.return=E,I):(I=r(I,w),I.return=E,I)}function l(E,I,w,A){var B=w.type;return B===so?f(E,I,w.props.children,A,w.key):I!==null&&(I.elementType===B||typeof B=="object"&&B!==null&&B.$$typeof===hs&&ri(B)===I.type)?(I=r(I,w.props),al(I,w),I.return=E,I):(I=$d(w.type,w.key,w.props,null,E.mode,A),al(I,w),I.return=E,I)}function c(E,I,w,A){return I===null||I.tag!==4||I.stateNode.containerInfo!==w.containerInfo||I.stateNode.implementation!==w.implementation?(I=Vm(w,E.mode,A),I.return=E,I):(I=r(I,w.children||[]),I.return=E,I)}function f(E,I,w,A,B){return I===null||I.tag!==7?(I=oi(w,E.mode,A,B),I.return=E,I):(I=r(I,w),I.return=E,I)}function p(E,I,w){if(typeof I=="string"&&I!==""||typeof I=="number"||typeof I=="bigint")return I=Nm(""+I,E.mode,w),I.return=E,I;if(typeof I=="object"&&I!==null){switch(I.$$typeof){case xd:return w=$d(I.type,I.key,I.props,null,E.mode,w),al(w,I),w.return=E,w;case ul:return I=Vm(I,E.mode,w),I.return=E,I;case hs:return I=ri(I),p(E,I,w)}if(ll(I)||tl(I))return I=oi(I,E.mode,w,null),I.return=E,I;if(typeof I.then=="function")return p(E,Fd(I),w);if(I.$$typeof===Sr)return p(E,Vd(E,I),w);Ud(E,I)}return null}function m(E,I,w,A){var B=I!==null?I.key:null;if(typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint")return B!==null?null:u(E,I,""+w,A);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case xd:return w.key===B?l(E,I,w,A):null;case ul:return w.key===B?c(E,I,w,A):null;case hs:return w=ri(w),m(E,I,w,A)}if(ll(w)||tl(w))return B!==null?null:f(E,I,w,A,null);if(typeof w.then=="function")return m(E,I,Fd(w),A);if(w.$$typeof===Sr)return m(E,I,Vd(E,w),A);Ud(E,w)}return null}function v(E,I,w,A,B){if(typeof A=="string"&&A!==""||typeof A=="number"||typeof A=="bigint")return E=E.get(w)||null,u(I,E,""+A,B);if(typeof A=="object"&&A!==null){switch(A.$$typeof){case xd:return E=E.get(A.key===null?w:A.key)||null,l(I,E,A,B);case ul:return E=E.get(A.key===null?w:A.key)||null,c(I,E,A,B);case hs:return A=ri(A),v(E,I,w,A,B)}if(ll(A)||tl(A))return E=E.get(w)||null,f(I,E,A,B,null);if(typeof A.then=="function")return v(E,I,w,Fd(A),B);if(A.$$typeof===Sr)return v(E,I,w,Vd(I,A),B);Ud(I,A)}return null}function R(E,I,w,A){for(var B=null,j=null,_=I,g=I=0,S=null;_!==null&&g<w.length;g++){_.index>g?(S=_,_=null):S=_.sibling;var T=m(E,_,w[g],A);if(T===null){_===null&&(_=S);break}t&&_&&T.alternate===null&&e(E,_),I=s(T,I,g),j===null?B=T:j.sibling=T,j=T,_=S}if(g===w.length)return n(E,_),xe&&Ir(E,g),B;if(_===null){for(;g<w.length;g++)_=p(E,w[g],A),_!==null&&(I=s(_,I,g),j===null?B=_:j.sibling=_,j=_);return xe&&Ir(E,g),B}for(_=a(_);g<w.length;g++)S=v(_,E,g,w[g],A),S!==null&&(t&&S.alternate!==null&&_.delete(S.key===null?g:S.key),I=s(S,I,g),j===null?B=S:j.sibling=S,j=S);return t&&_.forEach(function(C){return e(E,C)}),xe&&Ir(E,g),B}function P(E,I,w,A){if(w==null)throw Error(V(151));for(var B=null,j=null,_=I,g=I=0,S=null,T=w.next();_!==null&&!T.done;g++,T=w.next()){_.index>g?(S=_,_=null):S=_.sibling;var C=m(E,_,T.value,A);if(C===null){_===null&&(_=S);break}t&&_&&C.alternate===null&&e(E,_),I=s(C,I,g),j===null?B=C:j.sibling=C,j=C,_=S}if(T.done)return n(E,_),xe&&Ir(E,g),B;if(_===null){for(;!T.done;g++,T=w.next())T=p(E,T.value,A),T!==null&&(I=s(T,I,g),j===null?B=T:j.sibling=T,j=T);return xe&&Ir(E,g),B}for(_=a(_);!T.done;g++,T=w.next())T=v(_,E,g,T.value,A),T!==null&&(t&&T.alternate!==null&&_.delete(T.key===null?g:T.key),I=s(T,I,g),j===null?B=T:j.sibling=T,j=T);return t&&_.forEach(function(L){return e(E,L)}),xe&&Ir(E,g),B}function x(E,I,w,A){if(typeof w=="object"&&w!==null&&w.type===so&&w.key===null&&(w=w.props.children),typeof w=="object"&&w!==null){switch(w.$$typeof){case xd:e:{for(var B=w.key;I!==null;){if(I.key===B){if(B=w.type,B===so){if(I.tag===7){n(E,I.sibling),A=r(I,w.props.children),A.return=E,E=A;break e}}else if(I.elementType===B||typeof B=="object"&&B!==null&&B.$$typeof===hs&&ri(B)===I.type){n(E,I.sibling),A=r(I,w.props),al(A,w),A.return=E,E=A;break e}n(E,I);break}else e(E,I);I=I.sibling}w.type===so?(A=oi(w.props.children,E.mode,A,w.key),A.return=E,E=A):(A=$d(w.type,w.key,w.props,null,E.mode,A),al(A,w),A.return=E,E=A)}return i(E);case ul:e:{for(B=w.key;I!==null;){if(I.key===B)if(I.tag===4&&I.stateNode.containerInfo===w.containerInfo&&I.stateNode.implementation===w.implementation){n(E,I.sibling),A=r(I,w.children||[]),A.return=E,E=A;break e}else{n(E,I);break}else e(E,I);I=I.sibling}A=Vm(w,E.mode,A),A.return=E,E=A}return i(E);case hs:return w=ri(w),x(E,I,w,A)}if(ll(w))return R(E,I,w,A);if(tl(w)){if(B=tl(w),typeof B!="function")throw Error(V(150));return w=B.call(w),P(E,I,w,A)}if(typeof w.then=="function")return x(E,I,Fd(w),A);if(w.$$typeof===Sr)return x(E,I,Vd(E,w),A);Ud(E,w)}return typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint"?(w=""+w,I!==null&&I.tag===6?(n(E,I.sibling),A=r(I,w),A.return=E,E=A):(n(E,I),A=Nm(w,E.mode,A),A.return=E,E=A),i(E)):n(E,I)}return function(E,I,w,A){try{Dl=0;var B=x(E,I,w,A);return Eo=null,B}catch(_){if(_===Uo||_===Gf)throw _;var j=Yn(29,_,null,E.mode);return j.lanes=A,j.return=E,j}finally{}}}var hi=$b(!0),Jb=$b(!1),ps=!1;function _y(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Cg(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function Cs(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Ls(t,e,n){var a=t.updateQueue;if(a===null)return null;if(a=a.shared,ze&2){var r=a.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),a.pending=e,e=mf(t),Hb(t,null,n),e}return Hf(t,a,e,n),mf(t)}function yl(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,gb(t,n)}}function Um(t,e){var n=t.updateQueue,a=t.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};s===null?r=s=i:s=s.next=i,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:a.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:a.shared,callbacks:a.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var Lg=!1;function Il(){if(Lg){var t=vo;if(t!==null)throw t}}function _l(t,e,n,a){Lg=!1;var r=t.updateQueue;ps=!1;var s=r.firstBaseUpdate,i=r.lastBaseUpdate,u=r.shared.pending;if(u!==null){r.shared.pending=null;var l=u,c=l.next;l.next=null,i===null?s=c:i.next=c,i=l;var f=t.alternate;f!==null&&(f=f.updateQueue,u=f.lastBaseUpdate,u!==i&&(u===null?f.firstBaseUpdate=c:u.next=c,f.lastBaseUpdate=l))}if(s!==null){var p=r.baseState;i=0,f=c=l=null,u=s;do{var m=u.lane&-536870913,v=m!==u.lane;if(v?(Le&m)===m:(a&m)===m){m!==0&&m===Ao&&(Lg=!0),f!==null&&(f=f.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var R=t,P=u;m=e;var x=n;switch(P.tag){case 1:if(R=P.payload,typeof R=="function"){p=R.call(x,p,m);break e}p=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=P.payload,m=typeof R=="function"?R.call(x,p,m):R,m==null)break e;p=ft({},p,m);break e;case 2:ps=!0}}m=u.callback,m!==null&&(t.flags|=64,v&&(t.flags|=8192),v=r.callbacks,v===null?r.callbacks=[m]:v.push(m))}else v={lane:m,tag:u.tag,payload:u.payload,callback:u.callback,next:null},f===null?(c=f=v,l=p):f=f.next=v,i|=m;if(u=u.next,u===null){if(u=r.shared.pending,u===null)break;v=u,u=v.next,v.next=null,r.lastBaseUpdate=v,r.shared.pending=null}}while(!0);f===null&&(l=p),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=f,s===null&&(r.shared.lanes=0),Ns|=i,t.lanes=i,t.memoizedState=p}}function Zb(t,e){if(typeof t!="function")throw Error(V(191,t));t.call(e)}function ew(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)Zb(n[t],e)}var xo=qa(null),_f=qa(0);function lT(t,e){t=Rr,it(_f,t),it(xo,e),Rr=t|e.baseLanes}function Ag(){it(_f,Rr),it(xo,xo.current)}function Sy(){Rr=_f.current,tn(xo),tn(_f)}var na=qa(null),ya=null;function gs(t){var e=t.alternate;it(Lt,Lt.current&1),it(na,t),ya===null&&(e===null||xo.current!==null||e.memoizedState!==null)&&(ya=t)}function xg(t){it(Lt,Lt.current),it(na,t),ya===null&&(ya=t)}function tw(t){t.tag===22?(it(Lt,Lt.current),it(na,t),ya===null&&(ya=t)):ys(t)}function ys(){it(Lt,Lt.current),it(na,na.current)}function Xn(t){tn(na),ya===t&&(ya=null),tn(Lt)}var Lt=qa(0);function Sf(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Xg(n)||Yg(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Lr=0,me=null,Ze=null,Ot=null,vf=!1,To=!1,pi=!1,Ef=0,Pl=0,bo=null,LD=0;function bt(){throw Error(V(321))}function vy(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!ta(t[n],e[n]))return!1;return!0}function Ey(t,e,n,a,r,s){return Lr=s,me=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,se.H=t===null||t.memoizedState===null?Dw:Py,pi=!1,s=n(a,r),pi=!1,To&&(s=aw(e,n,a,r)),nw(t),s}function nw(t){se.H=Ol;var e=Ze!==null&&Ze.next!==null;if(Lr=0,Ot=Ze=me=null,vf=!1,Pl=0,bo=null,e)throw Error(V(300));t===null||Vt||(t=t.dependencies,t!==null&&yf(t)&&(Vt=!0))}function aw(t,e,n,a){me=t;var r=0;do{if(To&&(bo=null),Pl=0,To=!1,25<=r)throw Error(V(301));if(r+=1,Ot=Ze=null,t.updateQueue!=null){var s=t.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}se.H=Pw,s=e(n,a)}while(To);return s}function AD(){var t=se.H,e=t.useState()[0];return e=typeof e.then=="function"?Wl(e):e,t=t.useState()[0],(Ze!==null?Ze.memoizedState:null)!==t&&(me.flags|=1024),e}function Ty(){var t=Ef!==0;return Ef=0,t}function by(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function wy(t){if(vf){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}vf=!1}Lr=0,Ot=Ze=me=null,To=!1,Pl=Ef=0,bo=null}function An(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ot===null?me.memoizedState=Ot=t:Ot=Ot.next=t,Ot}function At(){if(Ze===null){var t=me.alternate;t=t!==null?t.memoizedState:null}else t=Ze.next;var e=Ot===null?me.memoizedState:Ot.next;if(e!==null)Ot=e,Ze=t;else{if(t===null)throw me.alternate===null?Error(V(467)):Error(V(310));Ze=t,t={memoizedState:Ze.memoizedState,baseState:Ze.baseState,baseQueue:Ze.baseQueue,queue:Ze.queue,next:null},Ot===null?me.memoizedState=Ot=t:Ot=Ot.next=t}return Ot}function jf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Wl(t){var e=Pl;return Pl+=1,bo===null&&(bo=[]),t=Qb(bo,t,e),e=me,(Ot===null?e.memoizedState:Ot.next)===null&&(e=e.alternate,se.H=e===null||e.memoizedState===null?Dw:Py),t}function Kf(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Wl(t);if(t.$$typeof===Sr)return pn(t)}throw Error(V(438,String(t)))}function Cy(t){var e=null,n=me.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var a=me.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(e={data:a.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=jf(),me.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),a=0;a<t;a++)n[a]=h1;return e.index++,n}function Ar(t,e){return typeof e=="function"?e(t):e}function Zd(t){var e=At();return Ly(e,Ze,t)}function Ly(t,e,n){var a=t.queue;if(a===null)throw Error(V(311));a.lastRenderedReducer=n;var r=t.baseQueue,s=a.pending;if(s!==null){if(r!==null){var i=r.next;r.next=s.next,s.next=i}e.baseQueue=r=s,a.pending=null}if(s=t.baseState,r===null)t.memoizedState=s;else{e=r.next;var u=i=null,l=null,c=e,f=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(Le&p)===p:(Lr&p)===p){var m=c.revertLane;if(m===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===Ao&&(f=!0);else if((Lr&m)===m){c=c.next,m===Ao&&(f=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=p,i=s):l=l.next=p,me.lanes|=m,Ns|=m;p=c.action,pi&&n(s,p),s=c.hasEagerState?c.eagerState:n(s,p)}else m={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=m,i=s):l=l.next=m,me.lanes|=p,Ns|=p;c=c.next}while(c!==null&&c!==e);if(l===null?i=s:l.next=u,!ta(s,t.memoizedState)&&(Vt=!0,f&&(n=vo,n!==null)))throw n;t.memoizedState=s,t.baseState=i,t.baseQueue=l,a.lastRenderedState=s}return r===null&&(a.lanes=0),[t.memoizedState,a.dispatch]}function Bm(t){var e=At(),n=e.queue;if(n===null)throw Error(V(311));n.lastRenderedReducer=t;var a=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var i=r=r.next;do s=t(s,i.action),i=i.next;while(i!==r);ta(s,e.memoizedState)||(Vt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,a]}function rw(t,e,n){var a=me,r=At(),s=xe;if(s){if(n===void 0)throw Error(V(407));n=n()}else n=e();var i=!ta((Ze||r).memoizedState,n);if(i&&(r.memoizedState=n,Vt=!0),r=r.queue,Ay(ow.bind(null,a,r,t),[t]),r.getSnapshot!==e||i||Ot!==null&&Ot.memoizedState.tag&1){if(a.flags|=2048,Ro(9,{destroy:void 0},iw.bind(null,a,r,n,e),null),nt===null)throw Error(V(349));s||Lr&127||sw(a,e,n)}return n}function sw(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=me.updateQueue,e===null?(e=jf(),me.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function iw(t,e,n,a){e.value=n,e.getSnapshot=a,uw(e)&&lw(t)}function ow(t,e,n){return n(function(){uw(e)&&lw(t)})}function uw(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!ta(t,n)}catch{return!0}}function lw(t){var e=_i(t,2);e!==null&&Mn(e,t,2)}function Rg(t){var e=An();if(typeof t=="function"){var n=t;if(t=n(),pi){_s(!0);try{n()}finally{_s(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ar,lastRenderedState:t},e}function cw(t,e,n,a){return t.baseState=n,Ly(t,Ze,typeof a=="function"?a:Ar)}function xD(t,e,n,a,r){if(Xf(t))throw Error(V(485));if(t=e.action,t!==null){var s={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){s.listeners.push(i)}};se.T!==null?n(!0):s.isTransition=!1,a(s),n=e.pending,n===null?(s.next=e.pending=s,dw(e,s)):(s.next=n.next,e.pending=n.next=s)}}function dw(t,e){var n=e.action,a=e.payload,r=t.state;if(e.isTransition){var s=se.T,i={};se.T=i;try{var u=n(r,a),l=se.S;l!==null&&l(i,u),cT(t,e,u)}catch(c){kg(t,e,c)}finally{s!==null&&i.types!==null&&(s.types=i.types),se.T=s}}else try{s=n(r,a),cT(t,e,s)}catch(c){kg(t,e,c)}}function cT(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){dT(t,e,a)},function(a){return kg(t,e,a)}):dT(t,e,n)}function dT(t,e,n){e.status="fulfilled",e.value=n,fw(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,dw(t,n)))}function kg(t,e,n){var a=t.pending;if(t.pending=null,a!==null){a=a.next;do e.status="rejected",e.reason=n,fw(e),e=e.next;while(e!==a)}t.action=null}function fw(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function hw(t,e){return e}function fT(t,e){if(xe){var n=nt.formState;if(n!==null){e:{var a=me;if(xe){if(dt){t:{for(var r=dt,s=ga;r.nodeType!==8;){if(!s){r=null;break t}if(r=Ia(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){dt=Ia(r.nextSibling),a=r.data==="F!";break e}}Os(a)}a=!1}a&&(e=n[0])}}return n=An(),n.memoizedState=n.baseState=e,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:hw,lastRenderedState:e},n.queue=a,n=xw.bind(null,me,a),a.dispatch=n,a=Rg(!1),s=Dy.bind(null,me,!1,a.queue),a=An(),r={state:e,dispatch:null,action:t,pending:null},a.queue=r,n=xD.bind(null,me,r,s,n),r.dispatch=n,a.memoizedState=t,[e,n,!1]}function hT(t){var e=At();return pw(e,Ze,t)}function pw(t,e,n){if(e=Ly(t,e,hw)[0],t=Zd(Ar)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var a=Wl(e)}catch(i){throw i===Uo?Gf:i}else a=e;e=At();var r=e.queue,s=r.dispatch;return n!==e.memoizedState&&(me.flags|=2048,Ro(9,{destroy:void 0},RD.bind(null,r,n),null)),[a,s,t]}function RD(t,e){t.action=e}function pT(t){var e=At(),n=Ze;if(n!==null)return pw(e,n,t);At(),e=e.memoizedState,n=At();var a=n.queue.dispatch;return n.memoizedState=t,[e,a,!1]}function Ro(t,e,n,a){return t={tag:t,create:n,deps:a,inst:e,next:null},e=me.updateQueue,e===null&&(e=jf(),me.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(a=n.next,n.next=t,t.next=a,e.lastEffect=t),t}function mw(){return At().memoizedState}function ef(t,e,n,a){var r=An();me.flags|=t,r.memoizedState=Ro(1|e,{destroy:void 0},n,a===void 0?null:a)}function Wf(t,e,n,a){var r=At();a=a===void 0?null:a;var s=r.memoizedState.inst;Ze!==null&&a!==null&&vy(a,Ze.memoizedState.deps)?r.memoizedState=Ro(e,s,n,a):(me.flags|=t,r.memoizedState=Ro(1|e,s,n,a))}function mT(t,e){ef(8390656,8,t,e)}function Ay(t,e){Wf(2048,8,t,e)}function kD(t){me.flags|=4;var e=me.updateQueue;if(e===null)e=jf(),me.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function gw(t){var e=At().memoizedState;return kD({ref:e,nextImpl:t}),function(){if(ze&2)throw Error(V(440));return e.impl.apply(void 0,arguments)}}function yw(t,e){return Wf(4,2,t,e)}function Iw(t,e){return Wf(4,4,t,e)}function _w(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Sw(t,e,n){n=n!=null?n.concat([t]):null,Wf(4,4,_w.bind(null,e,t),n)}function xy(){}function vw(t,e){var n=At();e=e===void 0?null:e;var a=n.memoizedState;return e!==null&&vy(e,a[1])?a[0]:(n.memoizedState=[t,e],t)}function Ew(t,e){var n=At();e=e===void 0?null:e;var a=n.memoizedState;if(e!==null&&vy(e,a[1]))return a[0];if(a=t(),pi){_s(!0);try{t()}finally{_s(!1)}}return n.memoizedState=[a,e],a}function Ry(t,e,n){return n===void 0||Lr&1073741824&&!(Le&261930)?t.memoizedState=e:(t.memoizedState=n,t=cC(),me.lanes|=t,Ns|=t,n)}function Tw(t,e,n,a){return ta(n,e)?n:xo.current!==null?(t=Ry(t,n,a),ta(t,e)||(Vt=!0),t):!(Lr&42)||Lr&1073741824&&!(Le&261930)?(Vt=!0,t.memoizedState=n):(t=cC(),me.lanes|=t,Ns|=t,e)}function bw(t,e,n,a,r){var s=He.p;He.p=s!==0&&8>s?s:8;var i=se.T,u={};se.T=u,Dy(t,!1,e,n);try{var l=r(),c=se.S;if(c!==null&&c(u,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=CD(l,a);Sl(t,e,f,ea(t))}else Sl(t,e,a,ea(t))}catch(p){Sl(t,e,{then:function(){},status:"rejected",reason:p},ea())}finally{He.p=s,i!==null&&u.types!==null&&(i.types=u.types),se.T=i}}function DD(){}function Dg(t,e,n,a){if(t.tag!==5)throw Error(V(476));var r=ww(t).queue;bw(t,r,e,ii,n===null?DD:function(){return Cw(t),n(a)})}function ww(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:ii,baseState:ii,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ar,lastRenderedState:ii},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ar,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function Cw(t){var e=ww(t);e.next===null&&(e=t.alternate.memoizedState),Sl(t,e.next.queue,{},ea())}function ky(){return pn(Vl)}function Lw(){return At().memoizedState}function Aw(){return At().memoizedState}function PD(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=ea();t=Cs(n);var a=Ls(e,t,n);a!==null&&(Mn(a,e,n),yl(a,e,n)),e={cache:gy()},t.payload=e;return}e=e.return}}function OD(t,e,n){var a=ea();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Xf(t)?Rw(e,n):(n=fy(t,e,n,a),n!==null&&(Mn(n,t,a),kw(n,e,a)))}function xw(t,e,n){var a=ea();Sl(t,e,n,a)}function Sl(t,e,n,a){var r={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Xf(t))Rw(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var i=e.lastRenderedState,u=s(i,n);if(r.hasEagerState=!0,r.eagerState=u,ta(u,i))return Hf(t,e,r,0),nt===null&&zf(),!1}catch{}finally{}if(n=fy(t,e,r,a),n!==null)return Mn(n,t,a),kw(n,e,a),!0}return!1}function Dy(t,e,n,a){if(a={lane:2,revertLane:qy(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Xf(t)){if(e)throw Error(V(479))}else e=fy(t,n,a,2),e!==null&&Mn(e,t,2)}function Xf(t){var e=t.alternate;return t===me||e!==null&&e===me}function Rw(t,e){To=vf=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function kw(t,e,n){if(n&4194048){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,gb(t,n)}}var Ol={readContext:pn,use:Kf,useCallback:bt,useContext:bt,useEffect:bt,useImperativeHandle:bt,useLayoutEffect:bt,useInsertionEffect:bt,useMemo:bt,useReducer:bt,useRef:bt,useState:bt,useDebugValue:bt,useDeferredValue:bt,useTransition:bt,useSyncExternalStore:bt,useId:bt,useHostTransitionStatus:bt,useFormState:bt,useActionState:bt,useOptimistic:bt,useMemoCache:bt,useCacheRefresh:bt};Ol.useEffectEvent=bt;var Dw={readContext:pn,use:Kf,useCallback:function(t,e){return An().memoizedState=[t,e===void 0?null:e],t},useContext:pn,useEffect:mT,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,ef(4194308,4,_w.bind(null,e,t),n)},useLayoutEffect:function(t,e){return ef(4194308,4,t,e)},useInsertionEffect:function(t,e){ef(4,2,t,e)},useMemo:function(t,e){var n=An();e=e===void 0?null:e;var a=t();if(pi){_s(!0);try{t()}finally{_s(!1)}}return n.memoizedState=[a,e],a},useReducer:function(t,e,n){var a=An();if(n!==void 0){var r=n(e);if(pi){_s(!0);try{n(e)}finally{_s(!1)}}}else r=e;return a.memoizedState=a.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},a.queue=t,t=t.dispatch=OD.bind(null,me,t),[a.memoizedState,t]},useRef:function(t){var e=An();return t={current:t},e.memoizedState=t},useState:function(t){t=Rg(t);var e=t.queue,n=xw.bind(null,me,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:xy,useDeferredValue:function(t,e){var n=An();return Ry(n,t,e)},useTransition:function(){var t=Rg(!1);return t=bw.bind(null,me,t.queue,!0,!1),An().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var a=me,r=An();if(xe){if(n===void 0)throw Error(V(407));n=n()}else{if(n=e(),nt===null)throw Error(V(349));Le&127||sw(a,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,mT(ow.bind(null,a,s,t),[t]),a.flags|=2048,Ro(9,{destroy:void 0},iw.bind(null,a,s,n,e),null),n},useId:function(){var t=An(),e=nt.identifierPrefix;if(xe){var n=Fa,a=Va;n=(a&~(1<<32-Zn(a)-1)).toString(32)+n,e="_"+e+"R_"+n,n=Ef++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=LD++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:ky,useFormState:fT,useActionState:fT,useOptimistic:function(t){var e=An();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=Dy.bind(null,me,!0,n),n.dispatch=e,[t,e]},useMemoCache:Cy,useCacheRefresh:function(){return An().memoizedState=PD.bind(null,me)},useEffectEvent:function(t){var e=An(),n={impl:t};return e.memoizedState=n,function(){if(ze&2)throw Error(V(440));return n.impl.apply(void 0,arguments)}}},Py={readContext:pn,use:Kf,useCallback:vw,useContext:pn,useEffect:Ay,useImperativeHandle:Sw,useInsertionEffect:yw,useLayoutEffect:Iw,useMemo:Ew,useReducer:Zd,useRef:mw,useState:function(){return Zd(Ar)},useDebugValue:xy,useDeferredValue:function(t,e){var n=At();return Tw(n,Ze.memoizedState,t,e)},useTransition:function(){var t=Zd(Ar)[0],e=At().memoizedState;return[typeof t=="boolean"?t:Wl(t),e]},useSyncExternalStore:rw,useId:Lw,useHostTransitionStatus:ky,useFormState:hT,useActionState:hT,useOptimistic:function(t,e){var n=At();return cw(n,Ze,t,e)},useMemoCache:Cy,useCacheRefresh:Aw};Py.useEffectEvent=gw;var Pw={readContext:pn,use:Kf,useCallback:vw,useContext:pn,useEffect:Ay,useImperativeHandle:Sw,useInsertionEffect:yw,useLayoutEffect:Iw,useMemo:Ew,useReducer:Bm,useRef:mw,useState:function(){return Bm(Ar)},useDebugValue:xy,useDeferredValue:function(t,e){var n=At();return Ze===null?Ry(n,t,e):Tw(n,Ze.memoizedState,t,e)},useTransition:function(){var t=Bm(Ar)[0],e=At().memoizedState;return[typeof t=="boolean"?t:Wl(t),e]},useSyncExternalStore:rw,useId:Lw,useHostTransitionStatus:ky,useFormState:pT,useActionState:pT,useOptimistic:function(t,e){var n=At();return Ze!==null?cw(n,Ze,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:Cy,useCacheRefresh:Aw};Pw.useEffectEvent=gw;function qm(t,e,n,a){e=t.memoizedState,n=n(a,e),n=n==null?e:ft({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Pg={enqueueSetState:function(t,e,n){t=t._reactInternals;var a=ea(),r=Cs(a);r.payload=e,n!=null&&(r.callback=n),e=Ls(t,r,a),e!==null&&(Mn(e,t,a),yl(e,t,a))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var a=ea(),r=Cs(a);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=Ls(t,r,a),e!==null&&(Mn(e,t,a),yl(e,t,a))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=ea(),a=Cs(n);a.tag=2,e!=null&&(a.callback=e),e=Ls(t,a,n),e!==null&&(Mn(e,t,n),yl(e,t,n))}};function gT(t,e,n,a,r,s,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(a,s,i):e.prototype&&e.prototype.isPureReactComponent?!xl(n,a)||!xl(r,s):!0}function yT(t,e,n,a){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,a),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,a),e.state!==t&&Pg.enqueueReplaceState(e,e.state,null)}function mi(t,e){var n=e;if("ref"in e){n={};for(var a in e)a!=="ref"&&(n[a]=e[a])}if(t=t.defaultProps){n===e&&(n=ft({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function Ow(t){pf(t)}function Mw(t){console.error(t)}function Nw(t){pf(t)}function Tf(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(a){setTimeout(function(){throw a})}}function IT(t,e,n){try{var a=t.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Og(t,e,n){return n=Cs(n),n.tag=3,n.payload={element:null},n.callback=function(){Tf(t,e)},n}function Vw(t){return t=Cs(t),t.tag=3,t}function Fw(t,e,n,a){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var s=a.value;t.payload=function(){return r(s)},t.callback=function(){IT(e,n,a)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){IT(e,n,a),typeof r!="function"&&(As===null?As=new Set([this]):As.add(this));var u=a.stack;this.componentDidCatch(a.value,{componentStack:u!==null?u:""})})}function MD(t,e,n,a,r){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(e=n.alternate,e!==null&&Fo(e,n,r,!0),n=na.current,n!==null){switch(n.tag){case 31:case 13:return ya===null?Af():n.alternate===null&&wt===0&&(wt=3),n.flags&=-257,n.flags|=65536,n.lanes=r,a===If?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([a]):e.add(a),Jm(t,a,r)),!1;case 22:return n.flags|=65536,a===If?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([a]):n.add(a)),Jm(t,a,r)),!1}throw Error(V(435,n.tag))}return Jm(t,a,r),Af(),!1}if(xe)return e=na.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,a!==vg&&(t=Error(V(422),{cause:a}),kl(ma(t,n)))):(a!==vg&&(e=Error(V(423),{cause:a}),kl(ma(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,a=ma(a,n),r=Og(t.stateNode,a,r),Um(t,r),wt!==4&&(wt=2)),!1;var s=Error(V(520),{cause:a});if(s=ma(s,n),Tl===null?Tl=[s]:Tl.push(s),wt!==4&&(wt=2),e===null)return!0;a=ma(a,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=Og(n.stateNode,a,t),Um(n,t),!1;case 1:if(e=n.type,s=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(As===null||!As.has(s))))return n.flags|=65536,r&=-r,n.lanes|=r,r=Vw(r),Fw(r,t,n,a),Um(n,r),!1}n=n.return}while(n!==null);return!1}var Oy=Error(V(461)),Vt=!1;function dn(t,e,n,a){e.child=t===null?Jb(e,null,n,a):hi(e,t.child,n,a)}function _T(t,e,n,a,r){n=n.render;var s=e.ref;if("ref"in a){var i={};for(var u in a)u!=="ref"&&(i[u]=a[u])}else i=a;return fi(e),a=Ey(t,e,n,i,s,r),u=Ty(),t!==null&&!Vt?(by(t,e,r),xr(t,e,r)):(xe&&u&&py(e),e.flags|=1,dn(t,e,a,r),e.child)}function ST(t,e,n,a,r){if(t===null){var s=n.type;return typeof s=="function"&&!hy(s)&&s.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=s,Uw(t,e,s,a,r)):(t=$d(n.type,null,a,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!My(t,r)){var i=s.memoizedProps;if(n=n.compare,n=n!==null?n:xl,n(i,a)&&t.ref===e.ref)return xr(t,e,r)}return e.flags|=1,t=Tr(s,a),t.ref=e.ref,t.return=e,e.child=t}function Uw(t,e,n,a,r){if(t!==null){var s=t.memoizedProps;if(xl(s,a)&&t.ref===e.ref)if(Vt=!1,e.pendingProps=a=s,My(t,r))t.flags&131072&&(Vt=!0);else return e.lanes=t.lanes,xr(t,e,r)}return Mg(t,e,n,a,r)}function Bw(t,e,n,a){var r=a.children,s=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(e.flags&128){if(s=s!==null?s.baseLanes|n:n,t!==null){for(a=e.child=t.child,r=0;a!==null;)r=r|a.lanes|a.childLanes,a=a.sibling;a=r&~s}else a=0,e.child=null;return vT(t,e,s,n,a)}if(n&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&Jd(e,s!==null?s.cachePool:null),s!==null?lT(e,s):Ag(),tw(e);else return a=e.lanes=536870912,vT(t,e,s!==null?s.baseLanes|n:n,n,a)}else s!==null?(Jd(e,s.cachePool),lT(e,s),ys(e),e.memoizedState=null):(t!==null&&Jd(e,null),Ag(),ys(e));return dn(t,e,r,n),e.child}function dl(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function vT(t,e,n,a,r){var s=yy();return s=s===null?null:{parent:Nt._currentValue,pool:s},e.memoizedState={baseLanes:n,cachePool:s},t!==null&&Jd(e,null),Ag(),tw(e),t!==null&&Fo(t,e,a,!0),e.childLanes=r,null}function tf(t,e){return e=bf({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function ET(t,e,n){return hi(e,t.child,null,n),t=tf(e,e.pendingProps),t.flags|=2,Xn(e),e.memoizedState=null,t}function ND(t,e,n){var a=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(xe){if(a.mode==="hidden")return t=tf(e,a),e.lanes=536870912,dl(null,t);if(xg(e),(t=dt)?(t=DC(t,ga),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ps!==null?{id:Va,overflow:Fa}:null,retryLane:536870912,hydrationErrors:null},n=jb(t),n.return=e,e.child=n,hn=e,dt=null)):t=null,t===null)throw Os(e);return e.lanes=536870912,null}return tf(e,a)}var s=t.memoizedState;if(s!==null){var i=s.dehydrated;if(xg(e),r)if(e.flags&256)e.flags&=-257,e=ET(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(V(558));else if(Vt||Fo(t,e,n,!1),r=(n&t.childLanes)!==0,Vt||r){if(a=nt,a!==null&&(i=yb(a,n),i!==0&&i!==s.retryLane))throw s.retryLane=i,_i(t,i),Mn(a,t,i),Oy;Af(),e=ET(t,e,n)}else t=s.treeContext,dt=Ia(i.nextSibling),hn=e,xe=!0,ws=null,ga=!1,t!==null&&Wb(e,t),e=tf(e,a),e.flags|=4096;return e}return t=Tr(t.child,{mode:a.mode,children:a.children}),t.ref=e.ref,e.child=t,t.return=e,t}function nf(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(V(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Mg(t,e,n,a,r){return fi(e),n=Ey(t,e,n,a,void 0,r),a=Ty(),t!==null&&!Vt?(by(t,e,r),xr(t,e,r)):(xe&&a&&py(e),e.flags|=1,dn(t,e,n,r),e.child)}function TT(t,e,n,a,r,s){return fi(e),e.updateQueue=null,n=aw(e,a,n,r),nw(t),a=Ty(),t!==null&&!Vt?(by(t,e,s),xr(t,e,s)):(xe&&a&&py(e),e.flags|=1,dn(t,e,n,s),e.child)}function bT(t,e,n,a,r){if(fi(e),e.stateNode===null){var s=po,i=n.contextType;typeof i=="object"&&i!==null&&(s=pn(i)),s=new n(a,s),e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Pg,e.stateNode=s,s._reactInternals=e,s=e.stateNode,s.props=a,s.state=e.memoizedState,s.refs={},_y(e),i=n.contextType,s.context=typeof i=="object"&&i!==null?pn(i):po,s.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(qm(e,n,i,a),s.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(i=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),i!==s.state&&Pg.enqueueReplaceState(s,s.state,null),_l(e,a,s,r),Il(),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!0}else if(t===null){s=e.stateNode;var u=e.memoizedProps,l=mi(n,u);s.props=l;var c=s.context,f=n.contextType;i=po,typeof f=="object"&&f!==null&&(i=pn(f));var p=n.getDerivedStateFromProps;f=typeof p=="function"||typeof s.getSnapshotBeforeUpdate=="function",u=e.pendingProps!==u,f||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u||c!==i)&&yT(e,s,a,i),ps=!1;var m=e.memoizedState;s.state=m,_l(e,a,s,r),Il(),c=e.memoizedState,u||m!==c||ps?(typeof p=="function"&&(qm(e,n,p,a),c=e.memoizedState),(l=ps||gT(e,n,l,a,m,c,i))?(f||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(e.flags|=4194308)):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=a,e.memoizedState=c),s.props=a,s.state=c,s.context=i,a=l):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!1)}else{s=e.stateNode,Cg(t,e),i=e.memoizedProps,f=mi(n,i),s.props=f,p=e.pendingProps,m=s.context,c=n.contextType,l=po,typeof c=="object"&&c!==null&&(l=pn(c)),u=n.getDerivedStateFromProps,(c=typeof u=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(i!==p||m!==l)&&yT(e,s,a,l),ps=!1,m=e.memoizedState,s.state=m,_l(e,a,s,r),Il();var v=e.memoizedState;i!==p||m!==v||ps||t!==null&&t.dependencies!==null&&yf(t.dependencies)?(typeof u=="function"&&(qm(e,n,u,a),v=e.memoizedState),(f=ps||gT(e,n,f,a,m,v,l)||t!==null&&t.dependencies!==null&&yf(t.dependencies))?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(a,v,l),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(a,v,l)),typeof s.componentDidUpdate=="function"&&(e.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=a,e.memoizedState=v),s.props=a,s.state=v,s.context=l,a=f):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),a=!1)}return s=a,nf(t,e),a=(e.flags&128)!==0,s||a?(s=e.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:s.render(),e.flags|=1,t!==null&&a?(e.child=hi(e,t.child,null,r),e.child=hi(e,null,n,r)):dn(t,e,n,r),e.memoizedState=s.state,t=e.child):t=xr(t,e,r),t}function wT(t,e,n,a){return di(),e.flags|=256,dn(t,e,n,a),e.child}var zm={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Hm(t){return{baseLanes:t,cachePool:Yb()}}function Gm(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=Qn),t}function qw(t,e,n){var a=e.pendingProps,r=!1,s=(e.flags&128)!==0,i;if((i=s)||(i=t!==null&&t.memoizedState===null?!1:(Lt.current&2)!==0),i&&(r=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(xe){if(r?gs(e):ys(e),(t=dt)?(t=DC(t,ga),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ps!==null?{id:Va,overflow:Fa}:null,retryLane:536870912,hydrationErrors:null},n=jb(t),n.return=e,e.child=n,hn=e,dt=null)):t=null,t===null)throw Os(e);return Yg(t)?e.lanes=32:e.lanes=536870912,null}var u=a.children;return a=a.fallback,r?(ys(e),r=e.mode,u=bf({mode:"hidden",children:u},r),a=oi(a,r,n,null),u.return=e,a.return=e,u.sibling=a,e.child=u,a=e.child,a.memoizedState=Hm(n),a.childLanes=Gm(t,i,n),e.memoizedState=zm,dl(null,a)):(gs(e),Ng(e,u))}var l=t.memoizedState;if(l!==null&&(u=l.dehydrated,u!==null)){if(s)e.flags&256?(gs(e),e.flags&=-257,e=jm(t,e,n)):e.memoizedState!==null?(ys(e),e.child=t.child,e.flags|=128,e=null):(ys(e),u=a.fallback,r=e.mode,a=bf({mode:"visible",children:a.children},r),u=oi(u,r,n,null),u.flags|=2,a.return=e,u.return=e,a.sibling=u,e.child=a,hi(e,t.child,null,n),a=e.child,a.memoizedState=Hm(n),a.childLanes=Gm(t,i,n),e.memoizedState=zm,e=dl(null,a));else if(gs(e),Yg(u)){if(i=u.nextSibling&&u.nextSibling.dataset,i)var c=i.dgst;i=c,a=Error(V(419)),a.stack="",a.digest=i,kl({value:a,source:null,stack:null}),e=jm(t,e,n)}else if(Vt||Fo(t,e,n,!1),i=(n&t.childLanes)!==0,Vt||i){if(i=nt,i!==null&&(a=yb(i,n),a!==0&&a!==l.retryLane))throw l.retryLane=a,_i(t,a),Mn(i,t,a),Oy;Xg(u)||Af(),e=jm(t,e,n)}else Xg(u)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,dt=Ia(u.nextSibling),hn=e,xe=!0,ws=null,ga=!1,t!==null&&Wb(e,t),e=Ng(e,a.children),e.flags|=4096);return e}return r?(ys(e),u=a.fallback,r=e.mode,l=t.child,c=l.sibling,a=Tr(l,{mode:"hidden",children:a.children}),a.subtreeFlags=l.subtreeFlags&65011712,c!==null?u=Tr(c,u):(u=oi(u,r,n,null),u.flags|=2),u.return=e,a.return=e,a.sibling=u,e.child=a,dl(null,a),a=e.child,u=t.child.memoizedState,u===null?u=Hm(n):(r=u.cachePool,r!==null?(l=Nt._currentValue,r=r.parent!==l?{parent:l,pool:l}:r):r=Yb(),u={baseLanes:u.baseLanes|n,cachePool:r}),a.memoizedState=u,a.childLanes=Gm(t,i,n),e.memoizedState=zm,dl(t.child,a)):(gs(e),n=t.child,t=n.sibling,n=Tr(n,{mode:"visible",children:a.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function Ng(t,e){return e=bf({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function bf(t,e){return t=Yn(22,t,null,e),t.lanes=0,t}function jm(t,e,n){return hi(e,t.child,null,n),t=Ng(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function CT(t,e,n){t.lanes|=e;var a=t.alternate;a!==null&&(a.lanes|=e),Tg(t.return,e,n)}function Km(t,e,n,a,r,s){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:r,treeForkCount:s}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=a,i.tail=n,i.tailMode=r,i.treeForkCount=s)}function zw(t,e,n){var a=e.pendingProps,r=a.revealOrder,s=a.tail;a=a.children;var i=Lt.current,u=(i&2)!==0;if(u?(i=i&1|2,e.flags|=128):i&=1,it(Lt,i),dn(t,e,a,n),a=xe?Rl:0,!u&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&CT(t,n,e);else if(t.tag===19)CT(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&Sf(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),Km(e,!1,r,n,s,a);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&Sf(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}Km(e,!0,n,null,s,a);break;case"together":Km(e,!1,null,null,void 0,a);break;default:e.memoizedState=null}return e.child}function xr(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Ns|=e.lanes,!(n&e.childLanes))if(t!==null){if(Fo(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(V(153));if(e.child!==null){for(t=e.child,n=Tr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Tr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function My(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&yf(t)))}function VD(t,e,n){switch(e.tag){case 3:cf(e,e.stateNode.containerInfo),ms(e,Nt,t.memoizedState.cache),di();break;case 27:case 5:cg(e);break;case 4:cf(e,e.stateNode.containerInfo);break;case 10:ms(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,xg(e),null;break;case 13:var a=e.memoizedState;if(a!==null)return a.dehydrated!==null?(gs(e),e.flags|=128,null):n&e.child.childLanes?qw(t,e,n):(gs(e),t=xr(t,e,n),t!==null?t.sibling:null);gs(e);break;case 19:var r=(t.flags&128)!==0;if(a=(n&e.childLanes)!==0,a||(Fo(t,e,n,!1),a=(n&e.childLanes)!==0),r){if(a)return zw(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),it(Lt,Lt.current),a)break;return null;case 22:return e.lanes=0,Bw(t,e,n,e.pendingProps);case 24:ms(e,Nt,t.memoizedState.cache)}return xr(t,e,n)}function Hw(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)Vt=!0;else{if(!My(t,n)&&!(e.flags&128))return Vt=!1,VD(t,e,n);Vt=!!(t.flags&131072)}else Vt=!1,xe&&e.flags&1048576&&Kb(e,Rl,e.index);switch(e.lanes=0,e.tag){case 16:e:{var a=e.pendingProps;if(t=ri(e.elementType),e.type=t,typeof t=="function")hy(t)?(a=mi(t,a),e.tag=1,e=bT(null,e,t,a,n)):(e.tag=0,e=Mg(null,e,t,a,n));else{if(t!=null){var r=t.$$typeof;if(r===Zg){e.tag=11,e=_T(null,e,t,a,n);break e}else if(r===ey){e.tag=14,e=ST(null,e,t,a,n);break e}}throw e=ug(t)||t,Error(V(306,e,""))}}return e;case 0:return Mg(t,e,e.type,e.pendingProps,n);case 1:return a=e.type,r=mi(a,e.pendingProps),bT(t,e,a,r,n);case 3:e:{if(cf(e,e.stateNode.containerInfo),t===null)throw Error(V(387));a=e.pendingProps;var s=e.memoizedState;r=s.element,Cg(t,e),_l(e,a,null,n);var i=e.memoizedState;if(a=i.cache,ms(e,Nt,a),a!==s.cache&&bg(e,[Nt],n,!0),Il(),a=i.element,s.isDehydrated)if(s={element:a,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){e=wT(t,e,a,n);break e}else if(a!==r){r=ma(Error(V(424)),e),kl(r),e=wT(t,e,a,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(dt=Ia(t.firstChild),hn=e,xe=!0,ws=null,ga=!0,n=Jb(e,null,a,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(di(),a===r){e=xr(t,e,n);break e}dn(t,e,a,n)}e=e.child}return e;case 26:return nf(t,e),t===null?(n=XT(e.type,null,e.pendingProps,null))?e.memoizedState=n:xe||(n=e.type,t=e.pendingProps,a=Df(bs.current).createElement(n),a[fn]=e,a[Nn]=t,mn(a,n,t),en(a),e.stateNode=a):e.memoizedState=XT(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return cg(e),t===null&&xe&&(a=e.stateNode=PC(e.type,e.pendingProps,bs.current),hn=e,ga=!0,r=dt,Fs(e.type)?(Qg=r,dt=Ia(a.firstChild)):dt=r),dn(t,e,e.pendingProps.children,n),nf(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&xe&&((r=a=dt)&&(a=dP(a,e.type,e.pendingProps,ga),a!==null?(e.stateNode=a,hn=e,dt=Ia(a.firstChild),ga=!1,r=!0):r=!1),r||Os(e)),cg(e),r=e.type,s=e.pendingProps,i=t!==null?t.memoizedProps:null,a=s.children,Kg(r,s)?a=null:i!==null&&Kg(r,i)&&(e.flags|=32),e.memoizedState!==null&&(r=Ey(t,e,AD,null,null,n),Vl._currentValue=r),nf(t,e),dn(t,e,a,n),e.child;case 6:return t===null&&xe&&((t=n=dt)&&(n=fP(n,e.pendingProps,ga),n!==null?(e.stateNode=n,hn=e,dt=null,t=!0):t=!1),t||Os(e)),null;case 13:return qw(t,e,n);case 4:return cf(e,e.stateNode.containerInfo),a=e.pendingProps,t===null?e.child=hi(e,null,a,n):dn(t,e,a,n),e.child;case 11:return _T(t,e,e.type,e.pendingProps,n);case 7:return dn(t,e,e.pendingProps,n),e.child;case 8:return dn(t,e,e.pendingProps.children,n),e.child;case 12:return dn(t,e,e.pendingProps.children,n),e.child;case 10:return a=e.pendingProps,ms(e,e.type,a.value),dn(t,e,a.children,n),e.child;case 9:return r=e.type._context,a=e.pendingProps.children,fi(e),r=pn(r),a=a(r),e.flags|=1,dn(t,e,a,n),e.child;case 14:return ST(t,e,e.type,e.pendingProps,n);case 15:return Uw(t,e,e.type,e.pendingProps,n);case 19:return zw(t,e,n);case 31:return ND(t,e,n);case 22:return Bw(t,e,n,e.pendingProps);case 24:return fi(e),a=pn(Nt),t===null?(r=yy(),r===null&&(r=nt,s=gy(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=n),r=s),e.memoizedState={parent:a,cache:r},_y(e),ms(e,Nt,r)):(t.lanes&n&&(Cg(t,e),_l(e,null,null,n),Il()),r=t.memoizedState,s=e.memoizedState,r.parent!==a?(r={parent:a,cache:a},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),ms(e,Nt,a)):(a=s.cache,ms(e,Nt,a),a!==r.cache&&bg(e,[Nt],n,!0))),dn(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(V(156,e.tag))}function pr(t){t.flags|=4}function Wm(t,e,n,a,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(hC())t.flags|=8192;else throw li=If,Iy}else t.flags&=-16777217}function LT(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!NC(e))if(hC())t.flags|=8192;else throw li=If,Iy}function Bd(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?pb():536870912,t.lanes|=e,ko|=e)}function rl(t,e){if(!xe)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:a.sibling=null}}function ct(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,a=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags&65011712,a|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags,a|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=a,t.childLanes=n,e}function FD(t,e,n){var a=e.pendingProps;switch(my(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ct(e),null;case 1:return ct(e),null;case 3:return n=e.stateNode,a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),br(Nt),wo(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(to(e)?pr(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Fm())),ct(e),null;case 26:var r=e.type,s=e.memoizedState;return t===null?(pr(e),s!==null?(ct(e),LT(e,s)):(ct(e),Wm(e,r,null,a,n))):s?s!==t.memoizedState?(pr(e),ct(e),LT(e,s)):(ct(e),e.flags&=-16777217):(t=t.memoizedProps,t!==a&&pr(e),ct(e),Wm(e,r,t,a,n)),null;case 27:if(df(e),n=bs.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&pr(e);else{if(!a){if(e.stateNode===null)throw Error(V(166));return ct(e),null}t=Ba.current,to(e)?nT(e,t):(t=PC(r,a,n),e.stateNode=t,pr(e))}return ct(e),null;case 5:if(df(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&pr(e);else{if(!a){if(e.stateNode===null)throw Error(V(166));return ct(e),null}if(s=Ba.current,to(e))nT(e,s);else{var i=Df(bs.current);switch(s){case 1:s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=i.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof a.is=="string"?i.createElement("select",{is:a.is}):i.createElement("select"),a.multiple?s.multiple=!0:a.size&&(s.size=a.size);break;default:s=typeof a.is=="string"?i.createElement(r,{is:a.is}):i.createElement(r)}}s[fn]=e,s[Nn]=a;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)s.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=s;e:switch(mn(s,r,a),r){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&pr(e)}}return ct(e),Wm(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==a&&pr(e);else{if(typeof a!="string"&&e.stateNode===null)throw Error(V(166));if(t=bs.current,to(e)){if(t=e.stateNode,n=e.memoizedProps,a=null,r=hn,r!==null)switch(r.tag){case 27:case 5:a=r.memoizedProps}t[fn]=e,t=!!(t.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||xC(t.nodeValue,n)),t||Os(e,!0)}else t=Df(t).createTextNode(a),t[fn]=e,e.stateNode=t}return ct(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(a=to(e),n!==null){if(t===null){if(!a)throw Error(V(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(557));t[fn]=e}else di(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;ct(e),t=!1}else n=Fm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(Xn(e),e):(Xn(e),null);if(e.flags&128)throw Error(V(558))}return ct(e),null;case 13:if(a=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=to(e),a!==null&&a.dehydrated!==null){if(t===null){if(!r)throw Error(V(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(V(317));r[fn]=e}else di(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;ct(e),r=!1}else r=Fm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(Xn(e),e):(Xn(e),null)}return Xn(e),e.flags&128?(e.lanes=n,e):(n=a!==null,t=t!==null&&t.memoizedState!==null,n&&(a=e.child,r=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(r=a.alternate.memoizedState.cachePool.pool),s=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(s=a.memoizedState.cachePool.pool),s!==r&&(a.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Bd(e,e.updateQueue),ct(e),null);case 4:return wo(),t===null&&zy(e.stateNode.containerInfo),ct(e),null;case 10:return br(e.type),ct(e),null;case 19:if(tn(Lt),a=e.memoizedState,a===null)return ct(e),null;if(r=(e.flags&128)!==0,s=a.rendering,s===null)if(r)rl(a,!1);else{if(wt!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(s=Sf(t),s!==null){for(e.flags|=128,rl(a,!1),t=s.updateQueue,e.updateQueue=t,Bd(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)Gb(n,t),n=n.sibling;return it(Lt,Lt.current&1|2),xe&&Ir(e,a.treeForkCount),e.child}t=t.sibling}a.tail!==null&&$n()>Cf&&(e.flags|=128,r=!0,rl(a,!1),e.lanes=4194304)}else{if(!r)if(t=Sf(s),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Bd(e,t),rl(a,!0),a.tail===null&&a.tailMode==="hidden"&&!s.alternate&&!xe)return ct(e),null}else 2*$n()-a.renderingStartTime>Cf&&n!==536870912&&(e.flags|=128,r=!0,rl(a,!1),e.lanes=4194304);a.isBackwards?(s.sibling=e.child,e.child=s):(t=a.last,t!==null?t.sibling=s:e.child=s,a.last=s)}return a.tail!==null?(t=a.tail,a.rendering=t,a.tail=t.sibling,a.renderingStartTime=$n(),t.sibling=null,n=Lt.current,it(Lt,r?n&1|2:n&1),xe&&Ir(e,a.treeForkCount),t):(ct(e),null);case 22:case 23:return Xn(e),Sy(),a=e.memoizedState!==null,t!==null?t.memoizedState!==null!==a&&(e.flags|=8192):a&&(e.flags|=8192),a?n&536870912&&!(e.flags&128)&&(ct(e),e.subtreeFlags&6&&(e.flags|=8192)):ct(e),n=e.updateQueue,n!==null&&Bd(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),a=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),a!==n&&(e.flags|=2048),t!==null&&tn(ui),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),br(Nt),ct(e),null;case 25:return null;case 30:return null}throw Error(V(156,e.tag))}function UD(t,e){switch(my(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return br(Nt),wo(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return df(e),null;case 31:if(e.memoizedState!==null){if(Xn(e),e.alternate===null)throw Error(V(340));di()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(Xn(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(V(340));di()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return tn(Lt),null;case 4:return wo(),null;case 10:return br(e.type),null;case 22:case 23:return Xn(e),Sy(),t!==null&&tn(ui),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return br(Nt),null;case 25:return null;default:return null}}function Gw(t,e){switch(my(e),e.tag){case 3:br(Nt),wo();break;case 26:case 27:case 5:df(e);break;case 4:wo();break;case 31:e.memoizedState!==null&&Xn(e);break;case 13:Xn(e);break;case 19:tn(Lt);break;case 10:br(e.type);break;case 22:case 23:Xn(e),Sy(),t!==null&&tn(ui);break;case 24:br(Nt)}}function Xl(t,e){try{var n=e.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var r=a.next;n=r;do{if((n.tag&t)===t){a=void 0;var s=n.create,i=n.inst;a=s(),i.destroy=a}n=n.next}while(n!==r)}}catch(u){We(e,e.return,u)}}function Ms(t,e,n){try{var a=e.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var s=r.next;a=s;do{if((a.tag&t)===t){var i=a.inst,u=i.destroy;if(u!==void 0){i.destroy=void 0,r=e;var l=n,c=u;try{c()}catch(f){We(r,l,f)}}}a=a.next}while(a!==s)}}catch(f){We(e,e.return,f)}}function jw(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{ew(e,n)}catch(a){We(t,t.return,a)}}}function Kw(t,e,n){n.props=mi(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(a){We(t,e,a)}}function vl(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var a=t.stateNode;break;case 30:a=t.stateNode;break;default:a=t.stateNode}typeof n=="function"?t.refCleanup=n(a):n.current=a}}catch(r){We(t,e,r)}}function Ua(t,e){var n=t.ref,a=t.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(r){We(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){We(t,e,r)}else n.current=null}function Ww(t){var e=t.type,n=t.memoizedProps,a=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(r){We(t,t.return,r)}}function Xm(t,e,n){try{var a=t.stateNode;sP(a,t.type,n,e),a[Nn]=e}catch(r){We(t,t.return,r)}}function Xw(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Fs(t.type)||t.tag===4}function Ym(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Xw(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Fs(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Vg(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=vr));else if(a!==4&&(a===27&&Fs(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(Vg(t,e,n),t=t.sibling;t!==null;)Vg(t,e,n),t=t.sibling}function wf(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(a!==4&&(a===27&&Fs(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(wf(t,e,n),t=t.sibling;t!==null;)wf(t,e,n),t=t.sibling}function Yw(t){var e=t.stateNode,n=t.memoizedProps;try{for(var a=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);mn(e,a,n),e[fn]=t,e[Nn]=n}catch(s){We(t,t.return,s)}}var _r=!1,Mt=!1,Qm=!1,AT=typeof WeakSet=="function"?WeakSet:Set,Zt=null;function BD(t,e){if(t=t.containerInfo,Gg=Nf,t=Nb(t),cy(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var a=n.getSelection&&n.getSelection();if(a&&a.rangeCount!==0){n=a.anchorNode;var r=a.anchorOffset,s=a.focusNode;a=a.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var i=0,u=-1,l=-1,c=0,f=0,p=t,m=null;t:for(;;){for(var v;p!==n||r!==0&&p.nodeType!==3||(u=i+r),p!==s||a!==0&&p.nodeType!==3||(l=i+a),p.nodeType===3&&(i+=p.nodeValue.length),(v=p.firstChild)!==null;)m=p,p=v;for(;;){if(p===t)break t;if(m===n&&++c===r&&(u=i),m===s&&++f===a&&(l=i),(v=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=v}n=u===-1||l===-1?null:{start:u,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(jg={focusedElem:t,selectionRange:n},Nf=!1,Zt=e;Zt!==null;)if(e=Zt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Zt=t;else for(;Zt!==null;){switch(e=Zt,s=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&s!==null){t=void 0,n=e,r=s.memoizedProps,s=s.memoizedState,a=n.stateNode;try{var R=mi(n.type,r);t=a.getSnapshotBeforeUpdate(R,s),a.__reactInternalSnapshotBeforeUpdate=t}catch(P){We(n,n.return,P)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Wg(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Wg(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(V(163))}if(t=e.sibling,t!==null){t.return=e.return,Zt=t;break}Zt=e.return}}function Qw(t,e,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:gr(t,n),a&4&&Xl(5,n);break;case 1:if(gr(t,n),a&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){We(n,n.return,i)}else{var r=mi(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){We(n,n.return,i)}}a&64&&jw(n),a&512&&vl(n,n.return);break;case 3:if(gr(t,n),a&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{ew(t,e)}catch(i){We(n,n.return,i)}}break;case 27:e===null&&a&4&&Yw(n);case 26:case 5:gr(t,n),e===null&&a&4&&Ww(n),a&512&&vl(n,n.return);break;case 12:gr(t,n);break;case 31:gr(t,n),a&4&&Zw(t,n);break;case 13:gr(t,n),a&4&&eC(t,n),a&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=YD.bind(null,n),hP(t,n))));break;case 22:if(a=n.memoizedState!==null||_r,!a){e=e!==null&&e.memoizedState!==null||Mt,r=_r;var s=Mt;_r=a,(Mt=e)&&!s?yr(t,n,(n.subtreeFlags&8772)!==0):gr(t,n),_r=r,Mt=s}break;case 30:break;default:gr(t,n)}}function $w(t){var e=t.alternate;e!==null&&(t.alternate=null,$w(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&ry(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var mt=null,Pn=!1;function mr(t,e,n){for(n=n.child;n!==null;)Jw(t,e,n),n=n.sibling}function Jw(t,e,n){if(Jn&&typeof Jn.onCommitFiberUnmount=="function")try{Jn.onCommitFiberUnmount(ql,n)}catch{}switch(n.tag){case 26:Mt||Ua(n,e),mr(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Mt||Ua(n,e);var a=mt,r=Pn;Fs(n.type)&&(mt=n.stateNode,Pn=!1),mr(t,e,n),wl(n.stateNode),mt=a,Pn=r;break;case 5:Mt||Ua(n,e);case 6:if(a=mt,r=Pn,mt=null,mr(t,e,n),mt=a,Pn=r,mt!==null)if(Pn)try{(mt.nodeType===9?mt.body:mt.nodeName==="HTML"?mt.ownerDocument.body:mt).removeChild(n.stateNode)}catch(s){We(n,e,s)}else try{mt.removeChild(n.stateNode)}catch(s){We(n,e,s)}break;case 18:mt!==null&&(Pn?(t=mt,HT(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),Mo(t)):HT(mt,n.stateNode));break;case 4:a=mt,r=Pn,mt=n.stateNode.containerInfo,Pn=!0,mr(t,e,n),mt=a,Pn=r;break;case 0:case 11:case 14:case 15:Ms(2,n,e),Mt||Ms(4,n,e),mr(t,e,n);break;case 1:Mt||(Ua(n,e),a=n.stateNode,typeof a.componentWillUnmount=="function"&&Kw(n,e,a)),mr(t,e,n);break;case 21:mr(t,e,n);break;case 22:Mt=(a=Mt)||n.memoizedState!==null,mr(t,e,n),Mt=a;break;default:mr(t,e,n)}}function Zw(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Mo(t)}catch(n){We(e,e.return,n)}}}function eC(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Mo(t)}catch(n){We(e,e.return,n)}}function qD(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new AT),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new AT),e;default:throw Error(V(435,t.tag))}}function qd(t,e){var n=qD(t);e.forEach(function(a){if(!n.has(a)){n.add(a);var r=QD.bind(null,t,a);a.then(r,r)}})}function kn(t,e){var n=e.deletions;if(n!==null)for(var a=0;a<n.length;a++){var r=n[a],s=t,i=e,u=i;e:for(;u!==null;){switch(u.tag){case 27:if(Fs(u.type)){mt=u.stateNode,Pn=!1;break e}break;case 5:mt=u.stateNode,Pn=!1;break e;case 3:case 4:mt=u.stateNode.containerInfo,Pn=!0;break e}u=u.return}if(mt===null)throw Error(V(160));Jw(s,i,r),mt=null,Pn=!1,s=r.alternate,s!==null&&(s.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)tC(e,t),e=e.sibling}var wa=null;function tC(t,e){var n=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:kn(e,t),Dn(t),a&4&&(Ms(3,t,t.return),Xl(3,t),Ms(5,t,t.return));break;case 1:kn(e,t),Dn(t),a&512&&(Mt||n===null||Ua(n,n.return)),a&64&&_r&&(t=t.updateQueue,t!==null&&(a=t.callbacks,a!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?a:n.concat(a))));break;case 26:var r=wa;if(kn(e,t),Dn(t),a&512&&(Mt||n===null||Ua(n,n.return)),a&4){var s=n!==null?n.memoizedState:null;if(a=t.memoizedState,n===null)if(a===null)if(t.stateNode===null){e:{a=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(a){case"title":s=r.getElementsByTagName("title")[0],(!s||s[Gl]||s[fn]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=r.createElement(a),r.head.insertBefore(s,r.querySelector("head > title"))),mn(s,a,n),s[fn]=t,en(s),a=s;break e;case"link":var i=QT("link","href",r).get(a+(n.href||""));if(i){for(var u=0;u<i.length;u++)if(s=i[u],s.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&s.getAttribute("rel")===(n.rel==null?null:n.rel)&&s.getAttribute("title")===(n.title==null?null:n.title)&&s.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(u,1);break t}}s=r.createElement(a),mn(s,a,n),r.head.appendChild(s);break;case"meta":if(i=QT("meta","content",r).get(a+(n.content||""))){for(u=0;u<i.length;u++)if(s=i[u],s.getAttribute("content")===(n.content==null?null:""+n.content)&&s.getAttribute("name")===(n.name==null?null:n.name)&&s.getAttribute("property")===(n.property==null?null:n.property)&&s.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&s.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(u,1);break t}}s=r.createElement(a),mn(s,a,n),r.head.appendChild(s);break;default:throw Error(V(468,a))}s[fn]=t,en(s),a=s}t.stateNode=a}else $T(r,t.type,t.stateNode);else t.stateNode=YT(r,a,t.memoizedProps);else s!==a?(s===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):s.count--,a===null?$T(r,t.type,t.stateNode):YT(r,a,t.memoizedProps)):a===null&&t.stateNode!==null&&Xm(t,t.memoizedProps,n.memoizedProps)}break;case 27:kn(e,t),Dn(t),a&512&&(Mt||n===null||Ua(n,n.return)),n!==null&&a&4&&Xm(t,t.memoizedProps,n.memoizedProps);break;case 5:if(kn(e,t),Dn(t),a&512&&(Mt||n===null||Ua(n,n.return)),t.flags&32){r=t.stateNode;try{Lo(r,"")}catch(R){We(t,t.return,R)}}a&4&&t.stateNode!=null&&(r=t.memoizedProps,Xm(t,r,n!==null?n.memoizedProps:r)),a&1024&&(Qm=!0);break;case 6:if(kn(e,t),Dn(t),a&4){if(t.stateNode===null)throw Error(V(162));a=t.memoizedProps,n=t.stateNode;try{n.nodeValue=a}catch(R){We(t,t.return,R)}}break;case 3:if(sf=null,r=wa,wa=Pf(e.containerInfo),kn(e,t),wa=r,Dn(t),a&4&&n!==null&&n.memoizedState.isDehydrated)try{Mo(e.containerInfo)}catch(R){We(t,t.return,R)}Qm&&(Qm=!1,nC(t));break;case 4:a=wa,wa=Pf(t.stateNode.containerInfo),kn(e,t),Dn(t),wa=a;break;case 12:kn(e,t),Dn(t);break;case 31:kn(e,t),Dn(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,qd(t,a)));break;case 13:kn(e,t),Dn(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Yf=$n()),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,qd(t,a)));break;case 22:r=t.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=_r,f=Mt;if(_r=c||r,Mt=f||l,kn(e,t),Mt=f,_r=c,Dn(t),a&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||l||_r||Mt||si(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){l=n=e;try{if(s=l.stateNode,r)i=s.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{u=l.stateNode;var p=l.memoizedProps.style,m=p!=null&&p.hasOwnProperty("display")?p.display:null;u.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(R){We(l,l.return,R)}}}else if(e.tag===6){if(n===null){l=e;try{l.stateNode.nodeValue=r?"":l.memoizedProps}catch(R){We(l,l.return,R)}}}else if(e.tag===18){if(n===null){l=e;try{var v=l.stateNode;r?GT(v,!0):GT(l.stateNode,!1)}catch(R){We(l,l.return,R)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}a&4&&(a=t.updateQueue,a!==null&&(n=a.retryQueue,n!==null&&(a.retryQueue=null,qd(t,n))));break;case 19:kn(e,t),Dn(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,qd(t,a)));break;case 30:break;case 21:break;default:kn(e,t),Dn(t)}}function Dn(t){var e=t.flags;if(e&2){try{for(var n,a=t.return;a!==null;){if(Xw(a)){n=a;break}a=a.return}if(n==null)throw Error(V(160));switch(n.tag){case 27:var r=n.stateNode,s=Ym(t);wf(t,s,r);break;case 5:var i=n.stateNode;n.flags&32&&(Lo(i,""),n.flags&=-33);var u=Ym(t);wf(t,u,i);break;case 3:case 4:var l=n.stateNode.containerInfo,c=Ym(t);Vg(t,c,l);break;default:throw Error(V(161))}}catch(f){We(t,t.return,f)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function nC(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;nC(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function gr(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)Qw(t,e.alternate,e),e=e.sibling}function si(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Ms(4,e,e.return),si(e);break;case 1:Ua(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&Kw(e,e.return,n),si(e);break;case 27:wl(e.stateNode);case 26:case 5:Ua(e,e.return),si(e);break;case 22:e.memoizedState===null&&si(e);break;case 30:si(e);break;default:si(e)}t=t.sibling}}function yr(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var a=e.alternate,r=t,s=e,i=s.flags;switch(s.tag){case 0:case 11:case 15:yr(r,s,n),Xl(4,s);break;case 1:if(yr(r,s,n),a=s,r=a.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){We(a,a.return,c)}if(a=s,r=a.updateQueue,r!==null){var u=a.stateNode;try{var l=r.shared.hiddenCallbacks;if(l!==null)for(r.shared.hiddenCallbacks=null,r=0;r<l.length;r++)Zb(l[r],u)}catch(c){We(a,a.return,c)}}n&&i&64&&jw(s),vl(s,s.return);break;case 27:Yw(s);case 26:case 5:yr(r,s,n),n&&a===null&&i&4&&Ww(s),vl(s,s.return);break;case 12:yr(r,s,n);break;case 31:yr(r,s,n),n&&i&4&&Zw(r,s);break;case 13:yr(r,s,n),n&&i&4&&eC(r,s);break;case 22:s.memoizedState===null&&yr(r,s,n),vl(s,s.return);break;case 30:break;default:yr(r,s,n)}e=e.sibling}}function Ny(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&Kl(n))}function Vy(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Kl(t))}function ba(t,e,n,a){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)aC(t,e,n,a),e=e.sibling}function aC(t,e,n,a){var r=e.flags;switch(e.tag){case 0:case 11:case 15:ba(t,e,n,a),r&2048&&Xl(9,e);break;case 1:ba(t,e,n,a);break;case 3:ba(t,e,n,a),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Kl(t)));break;case 12:if(r&2048){ba(t,e,n,a),t=e.stateNode;try{var s=e.memoizedProps,i=s.id,u=s.onPostCommit;typeof u=="function"&&u(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){We(e,e.return,l)}}else ba(t,e,n,a);break;case 31:ba(t,e,n,a);break;case 13:ba(t,e,n,a);break;case 23:break;case 22:s=e.stateNode,i=e.alternate,e.memoizedState!==null?s._visibility&2?ba(t,e,n,a):El(t,e):s._visibility&2?ba(t,e,n,a):(s._visibility|=2,ao(t,e,n,a,(e.subtreeFlags&10256)!==0||!1)),r&2048&&Ny(i,e);break;case 24:ba(t,e,n,a),r&2048&&Vy(e.alternate,e);break;default:ba(t,e,n,a)}}function ao(t,e,n,a,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var s=t,i=e,u=n,l=a,c=i.flags;switch(i.tag){case 0:case 11:case 15:ao(s,i,u,l,r),Xl(8,i);break;case 23:break;case 22:var f=i.stateNode;i.memoizedState!==null?f._visibility&2?ao(s,i,u,l,r):El(s,i):(f._visibility|=2,ao(s,i,u,l,r)),r&&c&2048&&Ny(i.alternate,i);break;case 24:ao(s,i,u,l,r),r&&c&2048&&Vy(i.alternate,i);break;default:ao(s,i,u,l,r)}e=e.sibling}}function El(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,a=e,r=a.flags;switch(a.tag){case 22:El(n,a),r&2048&&Ny(a.alternate,a);break;case 24:El(n,a),r&2048&&Vy(a.alternate,a);break;default:El(n,a)}e=e.sibling}}var fl=8192;function no(t,e,n){if(t.subtreeFlags&fl)for(t=t.child;t!==null;)rC(t,e,n),t=t.sibling}function rC(t,e,n){switch(t.tag){case 26:no(t,e,n),t.flags&fl&&t.memoizedState!==null&&wP(n,wa,t.memoizedState,t.memoizedProps);break;case 5:no(t,e,n);break;case 3:case 4:var a=wa;wa=Pf(t.stateNode.containerInfo),no(t,e,n),wa=a;break;case 22:t.memoizedState===null&&(a=t.alternate,a!==null&&a.memoizedState!==null?(a=fl,fl=16777216,no(t,e,n),fl=a):no(t,e,n));break;default:no(t,e,n)}}function sC(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function sl(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];Zt=a,oC(a,t)}sC(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)iC(t),t=t.sibling}function iC(t){switch(t.tag){case 0:case 11:case 15:sl(t),t.flags&2048&&Ms(9,t,t.return);break;case 3:sl(t);break;case 12:sl(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,af(t)):sl(t);break;default:sl(t)}}function af(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];Zt=a,oC(a,t)}sC(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Ms(8,e,e.return),af(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,af(e));break;default:af(e)}t=t.sibling}}function oC(t,e){for(;Zt!==null;){var n=Zt;switch(n.tag){case 0:case 11:case 15:Ms(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:Kl(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,Zt=a;else e:for(n=t;Zt!==null;){a=Zt;var r=a.sibling,s=a.return;if($w(a),a===n){Zt=null;break e}if(r!==null){r.return=s,Zt=r;break e}Zt=s}}}var zD={getCacheForType:function(t){var e=pn(Nt),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return pn(Nt).controller.signal}},HD=typeof WeakMap=="function"?WeakMap:Map,ze=0,nt=null,be=null,Le=0,Ke=0,Wn=null,vs=!1,Bo=!1,Fy=!1,Rr=0,wt=0,Ns=0,ci=0,Uy=0,Qn=0,ko=0,Tl=null,On=null,Fg=!1,Yf=0,uC=0,Cf=1/0,Lf=null,As=null,Xt=0,xs=null,Do=null,wr=0,Ug=0,Bg=null,lC=null,bl=0,qg=null;function ea(){return ze&2&&Le!==0?Le&-Le:se.T!==null?qy():Ib()}function cC(){if(Qn===0)if(!(Le&536870912)||xe){var t=kd;kd<<=1,!(kd&3932160)&&(kd=262144),Qn=t}else Qn=536870912;return t=na.current,t!==null&&(t.flags|=32),Qn}function Mn(t,e,n){(t===nt&&(Ke===2||Ke===9)||t.cancelPendingCommit!==null)&&(Po(t,0),Es(t,Le,Qn,!1)),Hl(t,n),(!(ze&2)||t!==nt)&&(t===nt&&(!(ze&2)&&(ci|=n),wt===4&&Es(t,Le,Qn,!1)),za(t))}function dC(t,e,n){if(ze&6)throw Error(V(327));var a=!n&&(e&127)===0&&(e&t.expiredLanes)===0||zl(t,e),r=a?KD(t,e):$m(t,e,!0),s=a;do{if(r===0){Bo&&!a&&Es(t,e,0,!1);break}else{if(n=t.current.alternate,s&&!GD(n)){r=$m(t,e,!1),s=!1;continue}if(r===2){if(s=e,t.errorRecoveryDisabledLanes&s)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var u=t;r=Tl;var l=u.current.memoizedState.isDehydrated;if(l&&(Po(u,i).flags|=256),i=$m(u,i,!1),i!==2){if(Fy&&!l){u.errorRecoveryDisabledLanes|=s,ci|=s,r=4;break e}s=On,On=r,s!==null&&(On===null?On=s:On.push.apply(On,s))}r=i}if(s=!1,r!==2)continue}}if(r===1){Po(t,0),Es(t,e,0,!0);break}e:{switch(a=t,s=r,s){case 0:case 1:throw Error(V(345));case 4:if((e&4194048)!==e)break;case 6:Es(a,e,Qn,!vs);break e;case 2:On=null;break;case 3:case 5:break;default:throw Error(V(329))}if((e&62914560)===e&&(r=Yf+300-$n(),10<r)){if(Es(a,e,Qn,!vs),Ff(a,0,!0)!==0)break e;wr=e,a.timeoutHandle=kC(xT.bind(null,a,n,On,Lf,Fg,e,Qn,ci,ko,vs,s,"Throttled",-0,0),r);break e}xT(a,n,On,Lf,Fg,e,Qn,ci,ko,vs,s,null,-0,0)}}break}while(!0);za(t)}function xT(t,e,n,a,r,s,i,u,l,c,f,p,m,v){if(t.timeoutHandle=-1,p=e.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:vr},rC(e,s,p);var R=(s&62914560)===s?Yf-$n():(s&4194048)===s?uC-$n():0;if(R=CP(p,R),R!==null){wr=s,t.cancelPendingCommit=R(kT.bind(null,t,e,s,n,a,r,i,u,l,f,p,null,m,v)),Es(t,s,i,!c);return}}kT(t,e,s,n,a,r,i,u,l)}function GD(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var r=n[a],s=r.getSnapshot;r=r.value;try{if(!ta(s(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Es(t,e,n,a){e&=~Uy,e&=~ci,t.suspendedLanes|=e,t.pingedLanes&=~e,a&&(t.warmLanes|=e),a=t.expirationTimes;for(var r=e;0<r;){var s=31-Zn(r),i=1<<s;a[s]=-1,r&=~i}n!==0&&mb(t,n,e)}function Qf(){return ze&6?!0:(Yl(0,!1),!1)}function By(){if(be!==null){if(Ke===0)var t=be.return;else t=be,Er=Si=null,wy(t),Eo=null,Dl=0,t=be;for(;t!==null;)Gw(t.alternate,t),t=t.return;be=null}}function Po(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,uP(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),wr=0,By(),nt=t,be=n=Tr(t.current,null),Le=e,Ke=0,Wn=null,vs=!1,Bo=zl(t,e),Fy=!1,ko=Qn=Uy=ci=Ns=wt=0,On=Tl=null,Fg=!1,e&8&&(e|=e&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=e;0<a;){var r=31-Zn(a),s=1<<r;e|=t[r],a&=~s}return Rr=e,zf(),n}function fC(t,e){me=null,se.H=Ol,e===Uo||e===Gf?(e=oT(),Ke=3):e===Iy?(e=oT(),Ke=4):Ke=e===Oy?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Wn=e,be===null&&(wt=1,Tf(t,ma(e,t.current)))}function hC(){var t=na.current;return t===null?!0:(Le&4194048)===Le?ya===null:(Le&62914560)===Le||Le&536870912?t===ya:!1}function pC(){var t=se.H;return se.H=Ol,t===null?Ol:t}function mC(){var t=se.A;return se.A=zD,t}function Af(){wt=4,vs||(Le&4194048)!==Le&&na.current!==null||(Bo=!0),!(Ns&134217727)&&!(ci&134217727)||nt===null||Es(nt,Le,Qn,!1)}function $m(t,e,n){var a=ze;ze|=2;var r=pC(),s=mC();(nt!==t||Le!==e)&&(Lf=null,Po(t,e)),e=!1;var i=wt;e:do try{if(Ke!==0&&be!==null){var u=be,l=Wn;switch(Ke){case 8:By(),i=6;break e;case 3:case 2:case 9:case 6:na.current===null&&(e=!0);var c=Ke;if(Ke=0,Wn=null,yo(t,u,l,c),n&&Bo){i=0;break e}break;default:c=Ke,Ke=0,Wn=null,yo(t,u,l,c)}}jD(),i=wt;break}catch(f){fC(t,f)}while(!0);return e&&t.shellSuspendCounter++,Er=Si=null,ze=a,se.H=r,se.A=s,be===null&&(nt=null,Le=0,zf()),i}function jD(){for(;be!==null;)gC(be)}function KD(t,e){var n=ze;ze|=2;var a=pC(),r=mC();nt!==t||Le!==e?(Lf=null,Cf=$n()+500,Po(t,e)):Bo=zl(t,e);e:do try{if(Ke!==0&&be!==null){e=be;var s=Wn;t:switch(Ke){case 1:Ke=0,Wn=null,yo(t,e,s,1);break;case 2:case 9:if(iT(s)){Ke=0,Wn=null,RT(e);break}e=function(){Ke!==2&&Ke!==9||nt!==t||(Ke=7),za(t)},s.then(e,e);break e;case 3:Ke=7;break e;case 4:Ke=5;break e;case 7:iT(s)?(Ke=0,Wn=null,RT(e)):(Ke=0,Wn=null,yo(t,e,s,7));break;case 5:var i=null;switch(be.tag){case 26:i=be.memoizedState;case 5:case 27:var u=be;if(i?NC(i):u.stateNode.complete){Ke=0,Wn=null;var l=u.sibling;if(l!==null)be=l;else{var c=u.return;c!==null?(be=c,$f(c)):be=null}break t}}Ke=0,Wn=null,yo(t,e,s,5);break;case 6:Ke=0,Wn=null,yo(t,e,s,6);break;case 8:By(),wt=6;break e;default:throw Error(V(462))}}WD();break}catch(f){fC(t,f)}while(!0);return Er=Si=null,se.H=a,se.A=r,ze=n,be!==null?0:(nt=null,Le=0,zf(),wt)}function WD(){for(;be!==null&&!g1();)gC(be)}function gC(t){var e=Hw(t.alternate,t,Rr);t.memoizedProps=t.pendingProps,e===null?$f(t):be=e}function RT(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=TT(n,e,e.pendingProps,e.type,void 0,Le);break;case 11:e=TT(n,e,e.pendingProps,e.type.render,e.ref,Le);break;case 5:wy(e);default:Gw(n,e),e=be=Gb(e,Rr),e=Hw(n,e,Rr)}t.memoizedProps=t.pendingProps,e===null?$f(t):be=e}function yo(t,e,n,a){Er=Si=null,wy(e),Eo=null,Dl=0;var r=e.return;try{if(MD(t,r,e,n,Le)){wt=1,Tf(t,ma(n,t.current)),be=null;return}}catch(s){if(r!==null)throw be=r,s;wt=1,Tf(t,ma(n,t.current)),be=null;return}e.flags&32768?(xe||a===1?t=!0:Bo||Le&536870912?t=!1:(vs=t=!0,(a===2||a===9||a===3||a===6)&&(a=na.current,a!==null&&a.tag===13&&(a.flags|=16384))),yC(e,t)):$f(e)}function $f(t){var e=t;do{if(e.flags&32768){yC(e,vs);return}t=e.return;var n=FD(e.alternate,e,Rr);if(n!==null){be=n;return}if(e=e.sibling,e!==null){be=e;return}be=e=t}while(e!==null);wt===0&&(wt=5)}function yC(t,e){do{var n=UD(t.alternate,t);if(n!==null){n.flags&=32767,be=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){be=t;return}be=t=n}while(t!==null);wt=6,be=null}function kT(t,e,n,a,r,s,i,u,l){t.cancelPendingCommit=null;do Jf();while(Xt!==0);if(ze&6)throw Error(V(327));if(e!==null){if(e===t.current)throw Error(V(177));if(s=e.lanes|e.childLanes,s|=dy,C1(t,n,s,i,u,l),t===nt&&(be=nt=null,Le=0),Do=e,xs=t,wr=n,Ug=s,Bg=r,lC=a,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,$D(ff,function(){return EC(),null})):(t.callbackNode=null,t.callbackPriority=0),a=(e.flags&13878)!==0,e.subtreeFlags&13878||a){a=se.T,se.T=null,r=He.p,He.p=2,i=ze,ze|=4;try{BD(t,e,n)}finally{ze=i,He.p=r,se.T=a}}Xt=1,IC(),_C(),SC()}}function IC(){if(Xt===1){Xt=0;var t=xs,e=Do,n=(e.flags&13878)!==0;if(e.subtreeFlags&13878||n){n=se.T,se.T=null;var a=He.p;He.p=2;var r=ze;ze|=4;try{tC(e,t);var s=jg,i=Nb(t.containerInfo),u=s.focusedElem,l=s.selectionRange;if(i!==u&&u&&u.ownerDocument&&Mb(u.ownerDocument.documentElement,u)){if(l!==null&&cy(u)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in u)u.selectionStart=c,u.selectionEnd=Math.min(f,u.value.length);else{var p=u.ownerDocument||document,m=p&&p.defaultView||window;if(m.getSelection){var v=m.getSelection(),R=u.textContent.length,P=Math.min(l.start,R),x=l.end===void 0?P:Math.min(l.end,R);!v.extend&&P>x&&(i=x,x=P,P=i);var E=ZE(u,P),I=ZE(u,x);if(E&&I&&(v.rangeCount!==1||v.anchorNode!==E.node||v.anchorOffset!==E.offset||v.focusNode!==I.node||v.focusOffset!==I.offset)){var w=p.createRange();w.setStart(E.node,E.offset),v.removeAllRanges(),P>x?(v.addRange(w),v.extend(I.node,I.offset)):(w.setEnd(I.node,I.offset),v.addRange(w))}}}}for(p=[],v=u;v=v.parentNode;)v.nodeType===1&&p.push({element:v,left:v.scrollLeft,top:v.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<p.length;u++){var A=p[u];A.element.scrollLeft=A.left,A.element.scrollTop=A.top}}Nf=!!Gg,jg=Gg=null}finally{ze=r,He.p=a,se.T=n}}t.current=e,Xt=2}}function _C(){if(Xt===2){Xt=0;var t=xs,e=Do,n=(e.flags&8772)!==0;if(e.subtreeFlags&8772||n){n=se.T,se.T=null;var a=He.p;He.p=2;var r=ze;ze|=4;try{Qw(t,e.alternate,e)}finally{ze=r,He.p=a,se.T=n}}Xt=3}}function SC(){if(Xt===4||Xt===3){Xt=0,y1();var t=xs,e=Do,n=wr,a=lC;e.subtreeFlags&10256||e.flags&10256?Xt=5:(Xt=0,Do=xs=null,vC(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(As=null),ay(n),e=e.stateNode,Jn&&typeof Jn.onCommitFiberRoot=="function")try{Jn.onCommitFiberRoot(ql,e,void 0,(e.current.flags&128)===128)}catch{}if(a!==null){e=se.T,r=He.p,He.p=2,se.T=null;try{for(var s=t.onRecoverableError,i=0;i<a.length;i++){var u=a[i];s(u.value,{componentStack:u.stack})}}finally{se.T=e,He.p=r}}wr&3&&Jf(),za(t),r=t.pendingLanes,n&261930&&r&42?t===qg?bl++:(bl=0,qg=t):bl=0,Yl(0,!1)}}function vC(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,Kl(e)))}function Jf(){return IC(),_C(),SC(),EC()}function EC(){if(Xt!==5)return!1;var t=xs,e=Ug;Ug=0;var n=ay(wr),a=se.T,r=He.p;try{He.p=32>n?32:n,se.T=null,n=Bg,Bg=null;var s=xs,i=wr;if(Xt=0,Do=xs=null,wr=0,ze&6)throw Error(V(331));var u=ze;if(ze|=4,iC(s.current),aC(s,s.current,i,n),ze=u,Yl(0,!1),Jn&&typeof Jn.onPostCommitFiberRoot=="function")try{Jn.onPostCommitFiberRoot(ql,s)}catch{}return!0}finally{He.p=r,se.T=a,vC(t,e)}}function DT(t,e,n){e=ma(n,e),e=Og(t.stateNode,e,2),t=Ls(t,e,2),t!==null&&(Hl(t,2),za(t))}function We(t,e,n){if(t.tag===3)DT(t,t,n);else for(;e!==null;){if(e.tag===3){DT(e,t,n);break}else if(e.tag===1){var a=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(As===null||!As.has(a))){t=ma(n,t),n=Vw(2),a=Ls(e,n,2),a!==null&&(Fw(n,a,e,t),Hl(a,2),za(a));break}}e=e.return}}function Jm(t,e,n){var a=t.pingCache;if(a===null){a=t.pingCache=new HD;var r=new Set;a.set(e,r)}else r=a.get(e),r===void 0&&(r=new Set,a.set(e,r));r.has(n)||(Fy=!0,r.add(n),t=XD.bind(null,t,e,n),e.then(t,t))}function XD(t,e,n){var a=t.pingCache;a!==null&&a.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,nt===t&&(Le&n)===n&&(wt===4||wt===3&&(Le&62914560)===Le&&300>$n()-Yf?!(ze&2)&&Po(t,0):Uy|=n,ko===Le&&(ko=0)),za(t)}function TC(t,e){e===0&&(e=pb()),t=_i(t,e),t!==null&&(Hl(t,e),za(t))}function YD(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),TC(t,n)}function QD(t,e){var n=0;switch(t.tag){case 31:case 13:var a=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:a=t.stateNode;break;case 22:a=t.stateNode._retryCache;break;default:throw Error(V(314))}a!==null&&a.delete(e),TC(t,n)}function $D(t,e){return ty(t,e)}var xf=null,ro=null,zg=!1,Rf=!1,Zm=!1,Ts=0;function za(t){t!==ro&&t.next===null&&(ro===null?xf=ro=t:ro=ro.next=t),Rf=!0,zg||(zg=!0,ZD())}function Yl(t,e){if(!Zm&&Rf){Zm=!0;do for(var n=!1,a=xf;a!==null;){if(!e)if(t!==0){var r=a.pendingLanes;if(r===0)var s=0;else{var i=a.suspendedLanes,u=a.pingedLanes;s=(1<<31-Zn(42|t)+1)-1,s&=r&~(i&~u),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(n=!0,PT(a,s))}else s=Le,s=Ff(a,a===nt?s:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(s&3)||zl(a,s)||(n=!0,PT(a,s));a=a.next}while(n);Zm=!1}}function JD(){bC()}function bC(){Rf=zg=!1;var t=0;Ts!==0&&oP()&&(t=Ts);for(var e=$n(),n=null,a=xf;a!==null;){var r=a.next,s=wC(a,e);s===0?(a.next=null,n===null?xf=r:n.next=r,r===null&&(ro=n)):(n=a,(t!==0||s&3)&&(Rf=!0)),a=r}Xt!==0&&Xt!==5||Yl(t,!1),Ts!==0&&(Ts=0)}function wC(t,e){for(var n=t.suspendedLanes,a=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes&-62914561;0<s;){var i=31-Zn(s),u=1<<i,l=r[i];l===-1?(!(u&n)||u&a)&&(r[i]=w1(u,e)):l<=e&&(t.expiredLanes|=u),s&=~u}if(e=nt,n=Le,n=Ff(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a=t.callbackNode,n===0||t===e&&(Ke===2||Ke===9)||t.cancelPendingCommit!==null)return a!==null&&a!==null&&Am(a),t.callbackNode=null,t.callbackPriority=0;if(!(n&3)||zl(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(a!==null&&Am(a),ay(n)){case 2:case 8:n=fb;break;case 32:n=ff;break;case 268435456:n=hb;break;default:n=ff}return a=CC.bind(null,t),n=ty(n,a),t.callbackPriority=e,t.callbackNode=n,e}return a!==null&&a!==null&&Am(a),t.callbackPriority=2,t.callbackNode=null,2}function CC(t,e){if(Xt!==0&&Xt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(Jf()&&t.callbackNode!==n)return null;var a=Le;return a=Ff(t,t===nt?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a===0?null:(dC(t,a,e),wC(t,$n()),t.callbackNode!=null&&t.callbackNode===n?CC.bind(null,t):null)}function PT(t,e){if(Jf())return null;dC(t,e,!0)}function ZD(){lP(function(){ze&6?ty(db,JD):bC()})}function qy(){if(Ts===0){var t=Ao;t===0&&(t=Rd,Rd<<=1,!(Rd&261888)&&(Rd=256)),Ts=t}return Ts}function OT(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Xd(""+t)}function MT(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function eP(t,e,n,a,r){if(e==="submit"&&n&&n.stateNode===r){var s=OT((r[Nn]||null).action),i=a.submitter;i&&(e=(e=i[Nn]||null)?OT(e.formAction):i.getAttribute("formAction"),e!==null&&(s=e,i=null));var u=new Uf("action","action",null,a,r);t.push({event:u,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(Ts!==0){var l=i?MT(r,i):new FormData(r);Dg(n,{pending:!0,data:l,method:r.method,action:s},null,l)}}else typeof s=="function"&&(u.preventDefault(),l=i?MT(r,i):new FormData(r),Dg(n,{pending:!0,data:l,method:r.method,action:s},s,l))},currentTarget:r}]})}}for(zd=0;zd<Sg.length;zd++)Hd=Sg[zd],NT=Hd.toLowerCase(),VT=Hd[0].toUpperCase()+Hd.slice(1),Ca(NT,"on"+VT);var Hd,NT,VT,zd;Ca(Fb,"onAnimationEnd");Ca(Ub,"onAnimationIteration");Ca(Bb,"onAnimationStart");Ca("dblclick","onDoubleClick");Ca("focusin","onFocus");Ca("focusout","onBlur");Ca(ID,"onTransitionRun");Ca(_D,"onTransitionStart");Ca(SD,"onTransitionCancel");Ca(qb,"onTransitionEnd");Co("onMouseEnter",["mouseout","mouseover"]);Co("onMouseLeave",["mouseout","mouseover"]);Co("onPointerEnter",["pointerout","pointerover"]);Co("onPointerLeave",["pointerout","pointerover"]);gi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));gi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));gi("onBeforeInput",["compositionend","keypress","textInput","paste"]);gi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));gi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));gi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ml="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),tP=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ml));function LC(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var a=t[n],r=a.event;a=a.listeners;e:{var s=void 0;if(e)for(var i=a.length-1;0<=i;i--){var u=a[i],l=u.instance,c=u.currentTarget;if(u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=c;try{s(r)}catch(f){pf(f)}r.currentTarget=null,s=l}else for(i=0;i<a.length;i++){if(u=a[i],l=u.instance,c=u.currentTarget,u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=c;try{s(r)}catch(f){pf(f)}r.currentTarget=null,s=l}}}}function Te(t,e){var n=e[fg];n===void 0&&(n=e[fg]=new Set);var a=t+"__bubble";n.has(a)||(AC(e,t,2,!1),n.add(a))}function eg(t,e,n){var a=0;e&&(a|=4),AC(n,t,a,e)}var Gd="_reactListening"+Math.random().toString(36).slice(2);function zy(t){if(!t[Gd]){t[Gd]=!0,_b.forEach(function(n){n!=="selectionchange"&&(tP.has(n)||eg(n,!1,t),eg(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Gd]||(e[Gd]=!0,eg("selectionchange",!1,e))}}function AC(t,e,n,a){switch(qC(e)){case 2:var r=xP;break;case 8:r=RP;break;default:r=Ky}n=r.bind(null,e,n,t),r=void 0,!yg||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),a?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function tg(t,e,n,a,r){var s=a;if(!(e&1)&&!(e&2)&&a!==null)e:for(;;){if(a===null)return;var i=a.tag;if(i===3||i===4){var u=a.stateNode.containerInfo;if(u===r)break;if(i===4)for(i=a.return;i!==null;){var l=i.tag;if((l===3||l===4)&&i.stateNode.containerInfo===r)return;i=i.return}for(;u!==null;){if(i=oo(u),i===null)return;if(l=i.tag,l===5||l===6||l===26||l===27){a=s=i;continue e}u=u.parentNode}}a=a.return}Lb(function(){var c=s,f=iy(n),p=[];e:{var m=zb.get(t);if(m!==void 0){var v=Uf,R=t;switch(t){case"keypress":if(Qd(n)===0)break e;case"keydown":case"keyup":v=Q1;break;case"focusin":R="focus",v=Pm;break;case"focusout":R="blur",v=Pm;break;case"beforeblur":case"afterblur":v=Pm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":v=GE;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":v=F1;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":v=Z1;break;case Fb:case Ub:case Bb:v=q1;break;case qb:v=tD;break;case"scroll":case"scrollend":v=N1;break;case"wheel":v=aD;break;case"copy":case"cut":case"paste":v=H1;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":v=KE;break;case"toggle":case"beforetoggle":v=sD}var P=(e&4)!==0,x=!P&&(t==="scroll"||t==="scrollend"),E=P?m!==null?m+"Capture":null:m;P=[];for(var I=c,w;I!==null;){var A=I;if(w=A.stateNode,A=A.tag,A!==5&&A!==26&&A!==27||w===null||E===null||(A=Ll(I,E),A!=null&&P.push(Nl(I,A,w))),x)break;I=I.return}0<P.length&&(m=new v(m,R,null,n,f),p.push({event:m,listeners:P}))}}if(!(e&7)){e:{if(m=t==="mouseover"||t==="pointerover",v=t==="mouseout"||t==="pointerout",m&&n!==gg&&(R=n.relatedTarget||n.fromElement)&&(oo(R)||R[No]))break e;if((v||m)&&(m=f.window===f?f:(m=f.ownerDocument)?m.defaultView||m.parentWindow:window,v?(R=n.relatedTarget||n.toElement,v=c,R=R?oo(R):null,R!==null&&(x=Bl(R),P=R.tag,R!==x||P!==5&&P!==27&&P!==6)&&(R=null)):(v=null,R=c),v!==R)){if(P=GE,A="onMouseLeave",E="onMouseEnter",I="mouse",(t==="pointerout"||t==="pointerover")&&(P=KE,A="onPointerLeave",E="onPointerEnter",I="pointer"),x=v==null?m:cl(v),w=R==null?m:cl(R),m=new P(A,I+"leave",v,n,f),m.target=x,m.relatedTarget=w,A=null,oo(f)===c&&(P=new P(E,I+"enter",R,n,f),P.target=w,P.relatedTarget=x,A=P),x=A,v&&R)t:{for(P=nP,E=v,I=R,w=0,A=E;A;A=P(A))w++;A=0;for(var B=I;B;B=P(B))A++;for(;0<w-A;)E=P(E),w--;for(;0<A-w;)I=P(I),A--;for(;w--;){if(E===I||I!==null&&E===I.alternate){P=E;break t}E=P(E),I=P(I)}P=null}else P=null;v!==null&&FT(p,m,v,P,!1),R!==null&&x!==null&&FT(p,x,R,P,!0)}}e:{if(m=c?cl(c):window,v=m.nodeName&&m.nodeName.toLowerCase(),v==="select"||v==="input"&&m.type==="file")var j=QE;else if(YE(m))if(Pb)j=mD;else{j=hD;var _=fD}else v=m.nodeName,!v||v.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?c&&sy(c.elementType)&&(j=QE):j=pD;if(j&&(j=j(t,c))){Db(p,j,n,f);break e}_&&_(t,m,c),t==="focusout"&&c&&m.type==="number"&&c.memoizedProps.value!=null&&mg(m,"number",m.value)}switch(_=c?cl(c):window,t){case"focusin":(YE(_)||_.contentEditable==="true")&&(co=_,Ig=c,ml=null);break;case"focusout":ml=Ig=co=null;break;case"mousedown":_g=!0;break;case"contextmenu":case"mouseup":case"dragend":_g=!1,eT(p,n,f);break;case"selectionchange":if(yD)break;case"keydown":case"keyup":eT(p,n,f)}var g;if(ly)e:{switch(t){case"compositionstart":var S="onCompositionStart";break e;case"compositionend":S="onCompositionEnd";break e;case"compositionupdate":S="onCompositionUpdate";break e}S=void 0}else lo?Rb(t,n)&&(S="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(S="onCompositionStart");S&&(xb&&n.locale!=="ko"&&(lo||S!=="onCompositionStart"?S==="onCompositionEnd"&&lo&&(g=Ab()):(Ss=f,oy="value"in Ss?Ss.value:Ss.textContent,lo=!0)),_=kf(c,S),0<_.length&&(S=new jE(S,t,null,n,f),p.push({event:S,listeners:_}),g?S.data=g:(g=kb(n),g!==null&&(S.data=g)))),(g=oD?uD(t,n):lD(t,n))&&(S=kf(c,"onBeforeInput"),0<S.length&&(_=new jE("onBeforeInput","beforeinput",null,n,f),p.push({event:_,listeners:S}),_.data=g)),eP(p,t,c,n,f)}LC(p,e)})}function Nl(t,e,n){return{instance:t,listener:e,currentTarget:n}}function kf(t,e){for(var n=e+"Capture",a=[];t!==null;){var r=t,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=Ll(t,n),r!=null&&a.unshift(Nl(t,r,s)),r=Ll(t,e),r!=null&&a.push(Nl(t,r,s))),t.tag===3)return a;t=t.return}return[]}function nP(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function FT(t,e,n,a,r){for(var s=e._reactName,i=[];n!==null&&n!==a;){var u=n,l=u.alternate,c=u.stateNode;if(u=u.tag,l!==null&&l===a)break;u!==5&&u!==26&&u!==27||c===null||(l=c,r?(c=Ll(n,s),c!=null&&i.unshift(Nl(n,c,l))):r||(c=Ll(n,s),c!=null&&i.push(Nl(n,c,l)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var aP=/\r\n?/g,rP=/\u0000|\uFFFD/g;function UT(t){return(typeof t=="string"?t:""+t).replace(aP,`
`).replace(rP,"")}function xC(t,e){return e=UT(e),UT(t)===e}function Je(t,e,n,a,r,s){switch(n){case"children":typeof a=="string"?e==="body"||e==="textarea"&&a===""||Lo(t,a):(typeof a=="number"||typeof a=="bigint")&&e!=="body"&&Lo(t,""+a);break;case"className":Pd(t,"class",a);break;case"tabIndex":Pd(t,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":Pd(t,n,a);break;case"style":Cb(t,a,s);break;case"data":if(e!=="object"){Pd(t,"data",a);break}case"src":case"href":if(a===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Xd(""+a),t.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(n==="formAction"?(e!=="input"&&Je(t,e,"name",r.name,r,null),Je(t,e,"formEncType",r.formEncType,r,null),Je(t,e,"formMethod",r.formMethod,r,null),Je(t,e,"formTarget",r.formTarget,r,null)):(Je(t,e,"encType",r.encType,r,null),Je(t,e,"method",r.method,r,null),Je(t,e,"target",r.target,r,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Xd(""+a),t.setAttribute(n,a);break;case"onClick":a!=null&&(t.onclick=vr);break;case"onScroll":a!=null&&Te("scroll",t);break;case"onScrollEnd":a!=null&&Te("scrollend",t);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(V(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(V(60));t.innerHTML=n}}break;case"multiple":t.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":t.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){t.removeAttribute("xlink:href");break}n=Xd(""+a),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""+a):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":a===!0?t.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,a):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?t.setAttribute(n,a):t.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?t.removeAttribute(n):t.setAttribute(n,a);break;case"popover":Te("beforetoggle",t),Te("toggle",t),Wd(t,"popover",a);break;case"xlinkActuate":hr(t,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":hr(t,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":hr(t,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":hr(t,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":hr(t,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":hr(t,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":hr(t,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":hr(t,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":hr(t,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":Wd(t,"is",a);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=O1.get(n)||n,Wd(t,n,a))}}function Hg(t,e,n,a,r,s){switch(n){case"style":Cb(t,a,s);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(V(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(V(60));t.innerHTML=n}}break;case"children":typeof a=="string"?Lo(t,a):(typeof a=="number"||typeof a=="bigint")&&Lo(t,""+a);break;case"onScroll":a!=null&&Te("scroll",t);break;case"onScrollEnd":a!=null&&Te("scrollend",t);break;case"onClick":a!=null&&(t.onclick=vr);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Sb.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),s=t[Nn]||null,s=s!=null?s[n]:null,typeof s=="function"&&t.removeEventListener(e,s,r),typeof a=="function")){typeof s!="function"&&s!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,a,r);break e}n in t?t[n]=a:a===!0?t.setAttribute(n,""):Wd(t,n,a)}}}function mn(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Te("error",t),Te("load",t);var a=!1,r=!1,s;for(s in n)if(n.hasOwnProperty(s)){var i=n[s];if(i!=null)switch(s){case"src":a=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(V(137,e));default:Je(t,e,s,i,n,null)}}r&&Je(t,e,"srcSet",n.srcSet,n,null),a&&Je(t,e,"src",n.src,n,null);return;case"input":Te("invalid",t);var u=s=i=r=null,l=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":r=f;break;case"type":i=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":s=f;break;case"defaultValue":u=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(V(137,e));break;default:Je(t,e,a,f,n,null)}}Tb(t,s,u,l,c,i,r,!1);return;case"select":Te("invalid",t),a=i=s=null;for(r in n)if(n.hasOwnProperty(r)&&(u=n[r],u!=null))switch(r){case"value":s=u;break;case"defaultValue":i=u;break;case"multiple":a=u;default:Je(t,e,r,u,n,null)}e=s,n=i,t.multiple=!!a,e!=null?_o(t,!!a,e,!1):n!=null&&_o(t,!!a,n,!0);return;case"textarea":Te("invalid",t),s=r=a=null;for(i in n)if(n.hasOwnProperty(i)&&(u=n[i],u!=null))switch(i){case"value":a=u;break;case"defaultValue":r=u;break;case"children":s=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(V(91));break;default:Je(t,e,i,u,n,null)}wb(t,a,r,s);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(a=n[l],a!=null))switch(l){case"selected":t.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:Je(t,e,l,a,n,null)}return;case"dialog":Te("beforetoggle",t),Te("toggle",t),Te("cancel",t),Te("close",t);break;case"iframe":case"object":Te("load",t);break;case"video":case"audio":for(a=0;a<Ml.length;a++)Te(Ml[a],t);break;case"image":Te("error",t),Te("load",t);break;case"details":Te("toggle",t);break;case"embed":case"source":case"link":Te("error",t),Te("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(V(137,e));default:Je(t,e,c,a,n,null)}return;default:if(sy(e)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&Hg(t,e,f,a,n,void 0));return}}for(u in n)n.hasOwnProperty(u)&&(a=n[u],a!=null&&Je(t,e,u,a,n,null))}function sP(t,e,n,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,i=null,u=null,l=null,c=null,f=null;for(v in n){var p=n[v];if(n.hasOwnProperty(v)&&p!=null)switch(v){case"checked":break;case"value":break;case"defaultValue":l=p;default:a.hasOwnProperty(v)||Je(t,e,v,null,a,p)}}for(var m in a){var v=a[m];if(p=n[m],a.hasOwnProperty(m)&&(v!=null||p!=null))switch(m){case"type":s=v;break;case"name":r=v;break;case"checked":c=v;break;case"defaultChecked":f=v;break;case"value":i=v;break;case"defaultValue":u=v;break;case"children":case"dangerouslySetInnerHTML":if(v!=null)throw Error(V(137,e));break;default:v!==p&&Je(t,e,m,v,a,p)}}pg(t,i,u,l,c,f,s,r);return;case"select":v=i=u=m=null;for(s in n)if(l=n[s],n.hasOwnProperty(s)&&l!=null)switch(s){case"value":break;case"multiple":v=l;default:a.hasOwnProperty(s)||Je(t,e,s,null,a,l)}for(r in a)if(s=a[r],l=n[r],a.hasOwnProperty(r)&&(s!=null||l!=null))switch(r){case"value":m=s;break;case"defaultValue":u=s;break;case"multiple":i=s;default:s!==l&&Je(t,e,r,s,a,l)}e=u,n=i,a=v,m!=null?_o(t,!!n,m,!1):!!a!=!!n&&(e!=null?_o(t,!!n,e,!0):_o(t,!!n,n?[]:"",!1));return;case"textarea":v=m=null;for(u in n)if(r=n[u],n.hasOwnProperty(u)&&r!=null&&!a.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Je(t,e,u,null,a,r)}for(i in a)if(r=a[i],s=n[i],a.hasOwnProperty(i)&&(r!=null||s!=null))switch(i){case"value":m=r;break;case"defaultValue":v=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(V(91));break;default:r!==s&&Je(t,e,i,r,a,s)}bb(t,m,v);return;case"option":for(var R in n)if(m=n[R],n.hasOwnProperty(R)&&m!=null&&!a.hasOwnProperty(R))switch(R){case"selected":t.selected=!1;break;default:Je(t,e,R,null,a,m)}for(l in a)if(m=a[l],v=n[l],a.hasOwnProperty(l)&&m!==v&&(m!=null||v!=null))switch(l){case"selected":t.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:Je(t,e,l,m,a,v)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var P in n)m=n[P],n.hasOwnProperty(P)&&m!=null&&!a.hasOwnProperty(P)&&Je(t,e,P,null,a,m);for(c in a)if(m=a[c],v=n[c],a.hasOwnProperty(c)&&m!==v&&(m!=null||v!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(V(137,e));break;default:Je(t,e,c,m,a,v)}return;default:if(sy(e)){for(var x in n)m=n[x],n.hasOwnProperty(x)&&m!==void 0&&!a.hasOwnProperty(x)&&Hg(t,e,x,void 0,a,m);for(f in a)m=a[f],v=n[f],!a.hasOwnProperty(f)||m===v||m===void 0&&v===void 0||Hg(t,e,f,m,a,v);return}}for(var E in n)m=n[E],n.hasOwnProperty(E)&&m!=null&&!a.hasOwnProperty(E)&&Je(t,e,E,null,a,m);for(p in a)m=a[p],v=n[p],!a.hasOwnProperty(p)||m===v||m==null&&v==null||Je(t,e,p,m,a,v)}function BT(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function iP(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var r=n[a],s=r.transferSize,i=r.initiatorType,u=r.duration;if(s&&u&&BT(i)){for(i=0,u=r.responseEnd,a+=1;a<n.length;a++){var l=n[a],c=l.startTime;if(c>u)break;var f=l.transferSize,p=l.initiatorType;f&&BT(p)&&(l=l.responseEnd,i+=f*(l<u?1:(u-c)/(l-c)))}if(--a,e+=8*(s+i)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Gg=null,jg=null;function Df(t){return t.nodeType===9?t:t.ownerDocument}function qT(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function RC(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function Kg(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var ng=null;function oP(){var t=window.event;return t&&t.type==="popstate"?t===ng?!1:(ng=t,!0):(ng=null,!1)}var kC=typeof setTimeout=="function"?setTimeout:void 0,uP=typeof clearTimeout=="function"?clearTimeout:void 0,zT=typeof Promise=="function"?Promise:void 0,lP=typeof queueMicrotask=="function"?queueMicrotask:typeof zT<"u"?function(t){return zT.resolve(null).then(t).catch(cP)}:kC;function cP(t){setTimeout(function(){throw t})}function Fs(t){return t==="head"}function HT(t,e){var n=e,a=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(a===0){t.removeChild(r),Mo(e);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")wl(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,wl(n);for(var s=n.firstChild;s;){var i=s.nextSibling,u=s.nodeName;s[Gl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&s.rel.toLowerCase()==="stylesheet"||n.removeChild(s),s=i}}else n==="body"&&wl(t.ownerDocument.body);n=r}while(n);Mo(e)}function GT(t,e){var n=t;t=0;do{var a=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=a}while(n)}function Wg(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Wg(n),ry(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function dP(t,e,n,a){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!a&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(a){if(!t[Gl])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(s=t.getAttribute("rel"),s==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(s!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(s=t.getAttribute("src"),(s!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===s)return t}else return t;if(t=Ia(t.nextSibling),t===null)break}return null}function fP(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=Ia(t.nextSibling),t===null))return null;return t}function DC(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=Ia(t.nextSibling),t===null))return null;return t}function Xg(t){return t.data==="$?"||t.data==="$~"}function Yg(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function hP(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var a=function(){e(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),t._reactRetry=a}}function Ia(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Qg=null;function jT(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return Ia(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function KT(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function PC(t,e,n){switch(e=Df(n),t){case"html":if(t=e.documentElement,!t)throw Error(V(452));return t;case"head":if(t=e.head,!t)throw Error(V(453));return t;case"body":if(t=e.body,!t)throw Error(V(454));return t;default:throw Error(V(451))}}function wl(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);ry(t)}var _a=new Map,WT=new Set;function Pf(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var kr=He.d;He.d={f:pP,r:mP,D:gP,C:yP,L:IP,m:_P,X:vP,S:SP,M:EP};function pP(){var t=kr.f(),e=Qf();return t||e}function mP(t){var e=Vo(t);e!==null&&e.tag===5&&e.type==="form"?Cw(e):kr.r(t)}var qo=typeof document>"u"?null:document;function OC(t,e,n){var a=qo;if(a&&typeof e=="string"&&e){var r=pa(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),WT.has(r)||(WT.add(r),t={rel:t,crossOrigin:n,href:e},a.querySelector(r)===null&&(e=a.createElement("link"),mn(e,"link",t),en(e),a.head.appendChild(e)))}}function gP(t){kr.D(t),OC("dns-prefetch",t,null)}function yP(t,e){kr.C(t,e),OC("preconnect",t,e)}function IP(t,e,n){kr.L(t,e,n);var a=qo;if(a&&t&&e){var r='link[rel="preload"][as="'+pa(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+pa(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+pa(n.imageSizes)+'"]')):r+='[href="'+pa(t)+'"]';var s=r;switch(e){case"style":s=Oo(t);break;case"script":s=zo(t)}_a.has(s)||(t=ft({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),_a.set(s,t),a.querySelector(r)!==null||e==="style"&&a.querySelector(Ql(s))||e==="script"&&a.querySelector($l(s))||(e=a.createElement("link"),mn(e,"link",t),en(e),a.head.appendChild(e)))}}function _P(t,e){kr.m(t,e);var n=qo;if(n&&t){var a=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+pa(a)+'"][href="'+pa(t)+'"]',s=r;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=zo(t)}if(!_a.has(s)&&(t=ft({rel:"modulepreload",href:t},e),_a.set(s,t),n.querySelector(r)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector($l(s)))return}a=n.createElement("link"),mn(a,"link",t),en(a),n.head.appendChild(a)}}}function SP(t,e,n){kr.S(t,e,n);var a=qo;if(a&&t){var r=Io(a).hoistableStyles,s=Oo(t);e=e||"default";var i=r.get(s);if(!i){var u={loading:0,preload:null};if(i=a.querySelector(Ql(s)))u.loading=5;else{t=ft({rel:"stylesheet",href:t,"data-precedence":e},n),(n=_a.get(s))&&Hy(t,n);var l=i=a.createElement("link");en(l),mn(l,"link",t),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){u.loading|=1}),l.addEventListener("error",function(){u.loading|=2}),u.loading|=4,rf(i,e,a)}i={type:"stylesheet",instance:i,count:1,state:u},r.set(s,i)}}}function vP(t,e){kr.X(t,e);var n=qo;if(n&&t){var a=Io(n).hoistableScripts,r=zo(t),s=a.get(r);s||(s=n.querySelector($l(r)),s||(t=ft({src:t,async:!0},e),(e=_a.get(r))&&Gy(t,e),s=n.createElement("script"),en(s),mn(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function EP(t,e){kr.M(t,e);var n=qo;if(n&&t){var a=Io(n).hoistableScripts,r=zo(t),s=a.get(r);s||(s=n.querySelector($l(r)),s||(t=ft({src:t,async:!0,type:"module"},e),(e=_a.get(r))&&Gy(t,e),s=n.createElement("script"),en(s),mn(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function XT(t,e,n,a){var r=(r=bs.current)?Pf(r):null;if(!r)throw Error(V(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Oo(n.href),n=Io(r).hoistableStyles,a=n.get(e),a||(a={type:"style",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Oo(n.href);var s=Io(r).hoistableStyles,i=s.get(t);if(i||(r=r.ownerDocument||r,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(t,i),(s=r.querySelector(Ql(t)))&&!s._p&&(i.instance=s,i.state.loading=5),_a.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},_a.set(t,n),s||TP(r,t,n,i.state))),e&&a===null)throw Error(V(528,""));return i}if(e&&a!==null)throw Error(V(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=zo(n),n=Io(r).hoistableScripts,a=n.get(e),a||(a={type:"script",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(V(444,t))}}function Oo(t){return'href="'+pa(t)+'"'}function Ql(t){return'link[rel="stylesheet"]['+t+"]"}function MC(t){return ft({},t,{"data-precedence":t.precedence,precedence:null})}function TP(t,e,n,a){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?a.loading=1:(e=t.createElement("link"),a.preload=e,e.addEventListener("load",function(){return a.loading|=1}),e.addEventListener("error",function(){return a.loading|=2}),mn(e,"link",n),en(e),t.head.appendChild(e))}function zo(t){return'[src="'+pa(t)+'"]'}function $l(t){return"script[async]"+t}function YT(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var a=t.querySelector('style[data-href~="'+pa(n.href)+'"]');if(a)return e.instance=a,en(a),a;var r=ft({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(t.ownerDocument||t).createElement("style"),en(a),mn(a,"style",r),rf(a,n.precedence,t),e.instance=a;case"stylesheet":r=Oo(n.href);var s=t.querySelector(Ql(r));if(s)return e.state.loading|=4,e.instance=s,en(s),s;a=MC(n),(r=_a.get(r))&&Hy(a,r),s=(t.ownerDocument||t).createElement("link"),en(s);var i=s;return i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),mn(s,"link",a),e.state.loading|=4,rf(s,n.precedence,t),e.instance=s;case"script":return s=zo(n.src),(r=t.querySelector($l(s)))?(e.instance=r,en(r),r):(a=n,(r=_a.get(s))&&(a=ft({},n),Gy(a,r)),t=t.ownerDocument||t,r=t.createElement("script"),en(r),mn(r,"link",a),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(V(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(a=e.instance,e.state.loading|=4,rf(a,n.precedence,t));return e.instance}function rf(t,e,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=a.length?a[a.length-1]:null,s=r,i=0;i<a.length;i++){var u=a[i];if(u.dataset.precedence===e)s=u;else if(s!==r)break}s?s.parentNode.insertBefore(t,s.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function Hy(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Gy(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var sf=null;function QT(t,e,n){if(sf===null){var a=new Map,r=sf=new Map;r.set(n,a)}else r=sf,a=r.get(n),a||(a=new Map,r.set(n,a));if(a.has(t))return a;for(a.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var s=n[r];if(!(s[Gl]||s[fn]||t==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var i=s.getAttribute(e)||"";i=t+i;var u=a.get(i);u?u.push(s):a.set(i,[s])}}return a}function $T(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function bP(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function NC(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function wP(t,e,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(n.state.loading&4)){if(n.instance===null){var r=Oo(a.href),s=e.querySelector(Ql(r));if(s){e=s._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Of.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=s,en(s);return}s=e.ownerDocument||e,a=MC(a),(r=_a.get(r))&&Hy(a,r),s=s.createElement("link"),en(s);var i=s;i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),mn(s,"link",a),n.instance=s}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&!(n.state.loading&3)&&(t.count++,n=Of.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var ag=0;function CP(t,e){return t.stylesheets&&t.count===0&&of(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var a=setTimeout(function(){if(t.stylesheets&&of(t,t.stylesheets),t.unsuspend){var s=t.unsuspend;t.unsuspend=null,s()}},6e4+e);0<t.imgBytes&&ag===0&&(ag=62500*iP());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&of(t,t.stylesheets),t.unsuspend)){var s=t.unsuspend;t.unsuspend=null,s()}},(t.imgBytes>ag?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(a),clearTimeout(r)}}:null}function Of(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)of(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Mf=null;function of(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Mf=new Map,e.forEach(LP,t),Mf=null,Of.call(t))}function LP(t,e){if(!(e.state.loading&4)){var n=Mf.get(t);if(n)var a=n.get(null);else{n=new Map,Mf.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var i=r[s];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),a=i)}a&&n.set(null,a)}r=e.instance,i=r.getAttribute("data-precedence"),s=n.get(i)||a,s===a&&n.set(null,r),n.set(i,r),this.count++,a=Of.bind(this),r.addEventListener("load",a),r.addEventListener("error",a),s?s.parentNode.insertBefore(r,s.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var Vl={$$typeof:Sr,Provider:null,Consumer:null,_currentValue:ii,_currentValue2:ii,_threadCount:0};function AP(t,e,n,a,r,s,i,u,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=xm(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=xm(0),this.hiddenUpdates=xm(null),this.identifierPrefix=a,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function VC(t,e,n,a,r,s,i,u,l,c,f,p){return t=new AP(t,e,n,i,l,c,f,p,u),e=1,s===!0&&(e|=24),s=Yn(3,null,null,e),t.current=s,s.stateNode=t,e=gy(),e.refCount++,t.pooledCache=e,e.refCount++,s.memoizedState={element:a,isDehydrated:n,cache:e},_y(s),t}function FC(t){return t?(t=po,t):po}function UC(t,e,n,a,r,s){r=FC(r),a.context===null?a.context=r:a.pendingContext=r,a=Cs(e),a.payload={element:n},s=s===void 0?null:s,s!==null&&(a.callback=s),n=Ls(t,a,e),n!==null&&(Mn(n,t,e),yl(n,t,e))}function JT(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function jy(t,e){JT(t,e),(t=t.alternate)&&JT(t,e)}function BC(t){if(t.tag===13||t.tag===31){var e=_i(t,67108864);e!==null&&Mn(e,t,67108864),jy(t,67108864)}}function ZT(t){if(t.tag===13||t.tag===31){var e=ea();e=ny(e);var n=_i(t,e);n!==null&&Mn(n,t,e),jy(t,e)}}var Nf=!0;function xP(t,e,n,a){var r=se.T;se.T=null;var s=He.p;try{He.p=2,Ky(t,e,n,a)}finally{He.p=s,se.T=r}}function RP(t,e,n,a){var r=se.T;se.T=null;var s=He.p;try{He.p=8,Ky(t,e,n,a)}finally{He.p=s,se.T=r}}function Ky(t,e,n,a){if(Nf){var r=$g(a);if(r===null)tg(t,e,a,Vf,n),eb(t,a);else if(DP(r,t,e,n,a))a.stopPropagation();else if(eb(t,a),e&4&&-1<kP.indexOf(t)){for(;r!==null;){var s=Vo(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var i=ai(s.pendingLanes);if(i!==0){var u=s;for(u.pendingLanes|=2,u.entangledLanes|=2;i;){var l=1<<31-Zn(i);u.entanglements[1]|=l,i&=~l}za(s),!(ze&6)&&(Cf=$n()+500,Yl(0,!1))}}break;case 31:case 13:u=_i(s,2),u!==null&&Mn(u,s,2),Qf(),jy(s,2)}if(s=$g(a),s===null&&tg(t,e,a,Vf,n),s===r)break;r=s}r!==null&&a.stopPropagation()}else tg(t,e,a,null,n)}}function $g(t){return t=iy(t),Wy(t)}var Vf=null;function Wy(t){if(Vf=null,t=oo(t),t!==null){var e=Bl(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=ib(e),t!==null)return t;t=null}else if(n===31){if(t=ob(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Vf=t,null}function qC(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(I1()){case db:return 2;case fb:return 8;case ff:case _1:return 32;case hb:return 268435456;default:return 32}default:return 32}}var Jg=!1,Rs=null,ks=null,Ds=null,Fl=new Map,Ul=new Map,Is=[],kP="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function eb(t,e){switch(t){case"focusin":case"focusout":Rs=null;break;case"dragenter":case"dragleave":ks=null;break;case"mouseover":case"mouseout":Ds=null;break;case"pointerover":case"pointerout":Fl.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Ul.delete(e.pointerId)}}function il(t,e,n,a,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:a,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Vo(e),e!==null&&BC(e)),t):(t.eventSystemFlags|=a,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function DP(t,e,n,a,r){switch(e){case"focusin":return Rs=il(Rs,t,e,n,a,r),!0;case"dragenter":return ks=il(ks,t,e,n,a,r),!0;case"mouseover":return Ds=il(Ds,t,e,n,a,r),!0;case"pointerover":var s=r.pointerId;return Fl.set(s,il(Fl.get(s)||null,t,e,n,a,r)),!0;case"gotpointercapture":return s=r.pointerId,Ul.set(s,il(Ul.get(s)||null,t,e,n,a,r)),!0}return!1}function zC(t){var e=oo(t.target);if(e!==null){var n=Bl(e);if(n!==null){if(e=n.tag,e===13){if(e=ib(n),e!==null){t.blockedOn=e,VE(t.priority,function(){ZT(n)});return}}else if(e===31){if(e=ob(n),e!==null){t.blockedOn=e,VE(t.priority,function(){ZT(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function uf(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=$g(t.nativeEvent);if(n===null){n=t.nativeEvent;var a=new n.constructor(n.type,n);gg=a,n.target.dispatchEvent(a),gg=null}else return e=Vo(n),e!==null&&BC(e),t.blockedOn=n,!1;e.shift()}return!0}function tb(t,e,n){uf(t)&&n.delete(e)}function PP(){Jg=!1,Rs!==null&&uf(Rs)&&(Rs=null),ks!==null&&uf(ks)&&(ks=null),Ds!==null&&uf(Ds)&&(Ds=null),Fl.forEach(tb),Ul.forEach(tb)}function jd(t,e){t.blockedOn===e&&(t.blockedOn=null,Jg||(Jg=!0,Yt.unstable_scheduleCallback(Yt.unstable_NormalPriority,PP)))}var Kd=null;function nb(t){Kd!==t&&(Kd=t,Yt.unstable_scheduleCallback(Yt.unstable_NormalPriority,function(){Kd===t&&(Kd=null);for(var e=0;e<t.length;e+=3){var n=t[e],a=t[e+1],r=t[e+2];if(typeof a!="function"){if(Wy(a||n)===null)continue;break}var s=Vo(n);s!==null&&(t.splice(e,3),e-=3,Dg(s,{pending:!0,data:r,method:n.method,action:a},a,r))}}))}function Mo(t){function e(l){return jd(l,t)}Rs!==null&&jd(Rs,t),ks!==null&&jd(ks,t),Ds!==null&&jd(Ds,t),Fl.forEach(e),Ul.forEach(e);for(var n=0;n<Is.length;n++){var a=Is[n];a.blockedOn===t&&(a.blockedOn=null)}for(;0<Is.length&&(n=Is[0],n.blockedOn===null);)zC(n),n.blockedOn===null&&Is.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var r=n[a],s=n[a+1],i=r[Nn]||null;if(typeof s=="function")i||nb(n);else if(i){var u=null;if(s&&s.hasAttribute("formAction")){if(r=s,i=s[Nn]||null)u=i.formAction;else if(Wy(r)!==null)continue}else u=i.action;typeof u=="function"?n[a+1]=u:(n.splice(a,3),a-=3),nb(n)}}}function HC(){function t(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(i){return r=i})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function Xy(t){this._internalRoot=t}Zf.prototype.render=Xy.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(V(409));var n=e.current,a=ea();UC(n,a,t,e,null,null)};Zf.prototype.unmount=Xy.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;UC(t.current,2,null,t,null,null),Qf(),e[No]=null}};function Zf(t){this._internalRoot=t}Zf.prototype.unstable_scheduleHydration=function(t){if(t){var e=Ib();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Is.length&&e!==0&&e<Is[n].priority;n++);Is.splice(n,0,t),n===0&&zC(t)}};var ab=rb.version;if(ab!=="19.2.3")throw Error(V(527,ab,"19.2.3"));He.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(V(188)):(t=Object.keys(t).join(","),Error(V(268,t)));return t=d1(e),t=t!==null?ub(t):null,t=t===null?null:t.stateNode,t};var OP={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:se,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(ol=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ol.isDisabled&&ol.supportsFiber))try{ql=ol.inject(OP),Jn=ol}catch{}var ol;eh.createRoot=function(t,e){if(!sb(t))throw Error(V(299));var n=!1,a="",r=Ow,s=Mw,i=Nw;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(a=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(s=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=VC(t,1,!1,null,null,n,a,null,r,s,i,HC),t[No]=e.current,zy(t),new Xy(e)};eh.hydrateRoot=function(t,e,n){if(!sb(t))throw Error(V(299));var a=!1,r="",s=Ow,i=Mw,u=Nw,l=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(s=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(u=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),e=VC(t,1,!0,e,n??null,a,r,l,s,i,u,HC),e.context=FC(null),n=e.current,a=ea(),a=ny(a),r=Cs(a),r.callback=null,Ls(n,r,a),n=a,e.current.lanes=n,Hl(e,n),za(e),t[No]=e.current,zy(t),new Zf(e)};eh.version="19.2.3"});var WC=Fe((XU,KC)=>{"use strict";function jC(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(jC)}catch(t){console.error(t)}}jC(),KC.exports=GC()});var XC=Fe(($U,eI)=>{var Zy=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,a=Object.defineProperty||function(D,M,q){D[M]=q.value},r,s=typeof Symbol=="function"?Symbol:{},i=s.iterator||"@@iterator",u=s.asyncIterator||"@@asyncIterator",l=s.toStringTag||"@@toStringTag";function c(D,M,q){return Object.defineProperty(D,M,{value:q,enumerable:!0,configurable:!0,writable:!0}),D[M]}try{c({},"")}catch{c=function(M,q,Z){return M[q]=Z}}function f(D,M,q,Z){var Y=M&&M.prototype instanceof E?M:E,ne=Object.create(Y.prototype),at=new ce(Z||[]);return a(ne,"_invoke",{value:T(D,q,at)}),ne}t.wrap=f;function p(D,M,q){try{return{type:"normal",arg:D.call(M,q)}}catch(Z){return{type:"throw",arg:Z}}}var m="suspendedStart",v="suspendedYield",R="executing",P="completed",x={};function E(){}function I(){}function w(){}var A={};c(A,i,function(){return this});var B=Object.getPrototypeOf,j=B&&B(B(ve([])));j&&j!==e&&n.call(j,i)&&(A=j);var _=w.prototype=E.prototype=Object.create(A);I.prototype=w,a(_,"constructor",{value:w,configurable:!0}),a(w,"constructor",{value:I,configurable:!0}),I.displayName=c(w,l,"GeneratorFunction");function g(D){["next","throw","return"].forEach(function(M){c(D,M,function(q){return this._invoke(M,q)})})}t.isGeneratorFunction=function(D){var M=typeof D=="function"&&D.constructor;return M?M===I||(M.displayName||M.name)==="GeneratorFunction":!1},t.mark=function(D){return Object.setPrototypeOf?Object.setPrototypeOf(D,w):(D.__proto__=w,c(D,l,"GeneratorFunction")),D.prototype=Object.create(_),D},t.awrap=function(D){return{__await:D}};function S(D,M){function q(ne,at,Ue,et){var rt=p(D[ne],D,at);if(rt.type==="throw")et(rt.arg);else{var sa=rt.arg,Rn=sa.value;return Rn&&typeof Rn=="object"&&n.call(Rn,"__await")?M.resolve(Rn.__await).then(function(ln){q("next",ln,Ue,et)},function(ln){q("throw",ln,Ue,et)}):M.resolve(Rn).then(function(ln){sa.value=ln,Ue(sa)},function(ln){return q("throw",ln,Ue,et)})}}var Z;function Y(ne,at){function Ue(){return new M(function(et,rt){q(ne,at,et,rt)})}return Z=Z?Z.then(Ue,Ue):Ue()}a(this,"_invoke",{value:Y})}g(S.prototype),c(S.prototype,u,function(){return this}),t.AsyncIterator=S,t.async=function(D,M,q,Z,Y){Y===void 0&&(Y=Promise);var ne=new S(f(D,M,q,Z),Y);return t.isGeneratorFunction(M)?ne:ne.next().then(function(at){return at.done?at.value:ne.next()})};function T(D,M,q){var Z=m;return function(ne,at){if(Z===R)throw new Error("Generator is already running");if(Z===P){if(ne==="throw")throw at;return oe()}for(q.method=ne,q.arg=at;;){var Ue=q.delegate;if(Ue){var et=C(Ue,q);if(et){if(et===x)continue;return et}}if(q.method==="next")q.sent=q._sent=q.arg;else if(q.method==="throw"){if(Z===m)throw Z=P,q.arg;q.dispatchException(q.arg)}else q.method==="return"&&q.abrupt("return",q.arg);Z=R;var rt=p(D,M,q);if(rt.type==="normal"){if(Z=q.done?P:v,rt.arg===x)continue;return{value:rt.arg,done:q.done}}else rt.type==="throw"&&(Z=P,q.method="throw",q.arg=rt.arg)}}}function C(D,M){var q=M.method,Z=D.iterator[q];if(Z===r)return M.delegate=null,q==="throw"&&D.iterator.return&&(M.method="return",M.arg=r,C(D,M),M.method==="throw")||q!=="return"&&(M.method="throw",M.arg=new TypeError("The iterator does not provide a '"+q+"' method")),x;var Y=p(Z,D.iterator,M.arg);if(Y.type==="throw")return M.method="throw",M.arg=Y.arg,M.delegate=null,x;var ne=Y.arg;if(!ne)return M.method="throw",M.arg=new TypeError("iterator result is not an object"),M.delegate=null,x;if(ne.done)M[D.resultName]=ne.value,M.next=D.nextLoc,M.method!=="return"&&(M.method="next",M.arg=r);else return ne;return M.delegate=null,x}g(_),c(_,l,"Generator"),c(_,i,function(){return this}),c(_,"toString",function(){return"[object Generator]"});function L(D){var M={tryLoc:D[0]};1 in D&&(M.catchLoc=D[1]),2 in D&&(M.finallyLoc=D[2],M.afterLoc=D[3]),this.tryEntries.push(M)}function b(D){var M=D.completion||{};M.type="normal",delete M.arg,D.completion=M}function ce(D){this.tryEntries=[{tryLoc:"root"}],D.forEach(L,this),this.reset(!0)}t.keys=function(D){var M=Object(D),q=[];for(var Z in M)q.push(Z);return q.reverse(),function Y(){for(;q.length;){var ne=q.pop();if(ne in M)return Y.value=ne,Y.done=!1,Y}return Y.done=!0,Y}};function ve(D){if(D){var M=D[i];if(M)return M.call(D);if(typeof D.next=="function")return D;if(!isNaN(D.length)){var q=-1,Z=function Y(){for(;++q<D.length;)if(n.call(D,q))return Y.value=D[q],Y.done=!1,Y;return Y.value=r,Y.done=!0,Y};return Z.next=Z}}return{next:oe}}t.values=ve;function oe(){return{value:r,done:!0}}return ce.prototype={constructor:ce,reset:function(D){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(b),!D)for(var M in this)M.charAt(0)==="t"&&n.call(this,M)&&!isNaN(+M.slice(1))&&(this[M]=r)},stop:function(){this.done=!0;var D=this.tryEntries[0],M=D.completion;if(M.type==="throw")throw M.arg;return this.rval},dispatchException:function(D){if(this.done)throw D;var M=this;function q(et,rt){return ne.type="throw",ne.arg=D,M.next=et,rt&&(M.method="next",M.arg=r),!!rt}for(var Z=this.tryEntries.length-1;Z>=0;--Z){var Y=this.tryEntries[Z],ne=Y.completion;if(Y.tryLoc==="root")return q("end");if(Y.tryLoc<=this.prev){var at=n.call(Y,"catchLoc"),Ue=n.call(Y,"finallyLoc");if(at&&Ue){if(this.prev<Y.catchLoc)return q(Y.catchLoc,!0);if(this.prev<Y.finallyLoc)return q(Y.finallyLoc)}else if(at){if(this.prev<Y.catchLoc)return q(Y.catchLoc,!0)}else if(Ue){if(this.prev<Y.finallyLoc)return q(Y.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(D,M){for(var q=this.tryEntries.length-1;q>=0;--q){var Z=this.tryEntries[q];if(Z.tryLoc<=this.prev&&n.call(Z,"finallyLoc")&&this.prev<Z.finallyLoc){var Y=Z;break}}Y&&(D==="break"||D==="continue")&&Y.tryLoc<=M&&M<=Y.finallyLoc&&(Y=null);var ne=Y?Y.completion:{};return ne.type=D,ne.arg=M,Y?(this.method="next",this.next=Y.finallyLoc,x):this.complete(ne)},complete:function(D,M){if(D.type==="throw")throw D.arg;return D.type==="break"||D.type==="continue"?this.next=D.arg:D.type==="return"?(this.rval=this.arg=D.arg,this.method="return",this.next="end"):D.type==="normal"&&M&&(this.next=M),x},finish:function(D){for(var M=this.tryEntries.length-1;M>=0;--M){var q=this.tryEntries[M];if(q.finallyLoc===D)return this.complete(q.completion,q.afterLoc),b(q),x}},catch:function(D){for(var M=this.tryEntries.length-1;M>=0;--M){var q=this.tryEntries[M];if(q.tryLoc===D){var Z=q.completion;if(Z.type==="throw"){var Y=Z.arg;b(q)}return Y}}throw new Error("illegal catch attempt")},delegateYield:function(D,M,q){return this.delegate={iterator:ve(D),resultName:M,nextLoc:q},this.method==="next"&&(this.arg=r),x}},t}(typeof eI=="object"?eI.exports:{});try{regeneratorRuntime=Zy}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=Zy:Function("r","regeneratorRuntime = r")(Zy)}});var th=Fe((JU,YC)=>{"use strict";YC.exports=(t,e)=>`${t}-${e}-${Math.random().toString(16).slice(3,8)}`});var tI=Fe((ZU,$C)=>{"use strict";var VP=th(),QC=0;$C.exports=({id:t,action:e,payload:n={}})=>{let a=t;return typeof a>"u"&&(a=VP("Job",QC),QC+=1),{id:a,action:e,payload:n}}});var nh=Fe(Jl=>{"use strict";var nI=!1;Jl.logging=nI;Jl.setLogging=t=>{nI=t};Jl.log=(...t)=>nI?console.log.apply(Jl,t):null});var tL=Fe((ZC,eL)=>{"use strict";var FP=tI(),{log:ah}=nh(),UP=th(),JC=0;eL.exports=()=>{let t=UP("Scheduler",JC),e={},n={},a=[];JC+=1;let r=()=>a.length,s=()=>Object.keys(e).length,i=()=>{if(a.length!==0){let p=Object.keys(e);for(let m=0;m<p.length;m+=1)if(typeof n[p[m]]>"u"){a[0](e[p[m]]);break}}},u=(p,m)=>new Promise((v,R)=>{let P=FP({action:p,payload:m});a.push(async x=>{a.shift(),n[x.id]=P;try{v(await x[p].apply(ZC,[...m,P.id]))}catch(E){R(E)}finally{delete n[x.id],i()}}),ah(`[${t}]: Add ${P.id} to JobQueue`),ah(`[${t}]: JobQueue length=${a.length}`),i()});return{addWorker:p=>(e[p.id]=p,ah(`[${t}]: Add ${p.id}`),ah(`[${t}]: Number of workers=${s()}`),i(),p.id),addJob:async(p,...m)=>{if(s()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return u(p,m)},terminate:async()=>{Object.keys(e).forEach(async p=>{await e[p].terminate()}),a=[]},getQueueLen:r,getNumWorkers:s}}});var aL=Fe((tB,nL)=>{"use strict";nL.exports=t=>{let e={};return typeof WorkerGlobalScope<"u"?e.type="webworker":typeof document=="object"?e.type="browser":typeof process=="object"&&typeof rE=="function"&&(e.type="node"),typeof t>"u"?e:e[t]}});var sL=Fe((aB,rL)=>{"use strict";var BP=aL()("type")==="browser",qP=BP?t=>new URL(t,window.location.href).href:t=>t;rL.exports=t=>{let e={...t};return["corePath","workerPath","langPath"].forEach(n=>{t[n]&&(e[n]=qP(e[n]))}),e}});var aI=Fe((rB,iL)=>{"use strict";iL.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}});var oL=Fe((sB,zP)=>{zP.exports={name:"tesseract.js",version:"7.0.0",description:"Pure Javascript Multilingual OCR",main:"src/index.js",type:"commonjs",types:"src/index.d.ts",unpkg:"dist/tesseract.min.js",jsdelivr:"dist/tesseract.min.js",scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs","profile:tesseract":"webpack-bundle-analyzer dist/tesseract-stats.json","profile:worker":"webpack-bundle-analyzer dist/worker-stats.json",prepublishOnly:"npm run build",wait:"rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser test:node:all","test:browser":"karma start karma.conf.js","test:node":"nyc mocha --exit --bail --require ./scripts/test-helper.mjs","test:node:all":"npm run test:node -- ./tests/*.test.mjs",lint:"eslint src","lint:fix":"eslint --fix src",postinstall:"opencollective-postinstall || true"},browser:{"./src/worker/node/index.js":"./src/worker/browser/index.js"},author:"",contributors:["jeromewu"],license:"Apache-2.0",devDependencies:{"@babel/core":"^7.21.4","@babel/eslint-parser":"^7.21.3","@babel/preset-env":"^7.21.4","@rollup/plugin-commonjs":"^24.1.0",acorn:"^8.8.2","babel-loader":"^9.1.2",buffer:"^6.0.3",cors:"^2.8.5",eslint:"^7.32.0","eslint-config-airbnb-base":"^14.2.1","eslint-plugin-import":"^2.27.5","expect.js":"^0.3.1",express:"^4.18.2",mocha:"^10.2.0","npm-run-all":"^4.1.5",karma:"^6.4.2","karma-chrome-launcher":"^3.2.0","karma-firefox-launcher":"^2.1.2","karma-mocha":"^2.0.1","karma-webpack":"^5.0.0",nyc:"^15.1.0",rimraf:"^5.0.0",rollup:"^3.20.7","wait-on":"^7.0.1",webpack:"^5.79.0","webpack-bundle-analyzer":"^4.8.0","webpack-cli":"^5.0.1","webpack-dev-middleware":"^6.0.2","rollup-plugin-sourcemaps":"^0.6.3"},dependencies:{"bmp-js":"^0.1.0","idb-keyval":"^6.2.0","is-url":"^1.2.4","node-fetch":"^2.6.9","opencollective-postinstall":"^2.0.3","regenerator-runtime":"^0.13.3","tesseract.js-core":"^7.0.0","wasm-feature-detect":"^1.8.0",zlibjs:"^0.3.1"},overrides:{"@rollup/pluginutils":"^5.0.2"},repository:{type:"git",url:"https://github.com/naptha/tesseract.js.git"},bugs:{url:"https://github.com/naptha/tesseract.js/issues"},homepage:"https://github.com/naptha/tesseract.js",collective:{type:"opencollective",url:"https://opencollective.com/tesseractjs"}}});var lL=Fe((iB,uL)=>{"use strict";uL.exports={workerBlobURL:!0,logger:()=>{}}});var dL=Fe((oB,cL)=>{"use strict";var HP=oL().version,GP=lL();cL.exports={...GP,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${HP}/dist/worker.min.js`}});var hL=Fe((uB,fL)=>{"use strict";fL.exports=({workerPath:t,workerBlobURL:e})=>{let n;if(Blob&&URL&&e){let a=new Blob([`importScripts("${t}");`],{type:"application/javascript"});n=new Worker(URL.createObjectURL(a))}else n=new Worker(t);return n}});var mL=Fe((lB,pL)=>{"use strict";pL.exports=t=>{t.terminate()}});var yL=Fe((cB,gL)=>{"use strict";gL.exports=(t,e)=>{t.onmessage=({data:n})=>{e(n)}}});var _L=Fe((dB,IL)=>{"use strict";IL.exports=async(t,e)=>{t.postMessage(e)}});var vL=Fe((fB,SL)=>{"use strict";var rI=t=>new Promise((e,n)=>{let a=new FileReader;a.onload=()=>{e(a.result)},a.onerror=({target:{error:{code:r}}})=>{n(Error(`File could not be read! Code=${r}`))},a.readAsArrayBuffer(t)}),sI=async t=>{let e=t;if(typeof t>"u")return"undefined";if(typeof t=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(t)?e=atob(t.split(",")[1]).split("").map(n=>n.charCodeAt(0)):e=await(await fetch(t)).arrayBuffer();else if(typeof HTMLElement<"u"&&t instanceof HTMLElement)t.tagName==="IMG"&&(e=await sI(t.src)),t.tagName==="VIDEO"&&(e=await sI(t.poster)),t.tagName==="CANVAS"&&await new Promise(n=>{t.toBlob(async a=>{e=await rI(a),n()})});else if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas){let n=await t.convertToBlob();e=await rI(n)}else(t instanceof File||t instanceof Blob)&&(e=await rI(t));return new Uint8Array(e)};SL.exports=sI});var TL=Fe((hB,EL)=>{"use strict";var jP=dL(),KP=hL(),WP=mL(),XP=yL(),YP=_L(),QP=vL();EL.exports={defaultOptions:jP,spawnWorker:KP,terminateWorker:WP,onMessage:XP,send:YP,loadImage:QP}});var iI=Fe((pB,LL)=>{"use strict";var $P=sL(),Ha=tI(),{log:bL}=nh(),JP=th(),vi=aI(),{defaultOptions:ZP,spawnWorker:eO,terminateWorker:tO,onMessage:nO,loadImage:wL,send:aO}=TL(),CL=0;LL.exports=async(t="eng",e=vi.LSTM_ONLY,n={},a={})=>{let r=JP("Worker",CL),{logger:s,errorHandler:i,...u}=$P({...ZP,...n}),l={},c=typeof t=="string"?t.split("+"):t,f=e,p=a,m=[vi.DEFAULT,vi.LSTM_ONLY].includes(e)&&!u.legacyCore,v,R,P=new Promise((D,M)=>{R=D,v=M}),x=D=>{v(D.message)},E=eO(u);E.onerror=x,CL+=1;let I=({id:D,action:M,payload:q})=>new Promise((Z,Y)=>{bL(`[${r}]: Start ${D}, action=${M}`);let ne=`${M}-${D}`;l[ne]={resolve:Z,reject:Y},aO(E,{workerId:r,jobId:D,action:M,payload:q})}),w=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),A=D=>I(Ha({id:D,action:"load",payload:{options:{lstmOnly:m,corePath:u.corePath,logging:u.logging}}})),B=(D,M,q)=>I(Ha({id:q,action:"FS",payload:{method:"writeFile",args:[D,M]}})),j=(D,M)=>I(Ha({id:M,action:"FS",payload:{method:"readFile",args:[D,{encoding:"utf8"}]}})),_=(D,M)=>I(Ha({id:M,action:"FS",payload:{method:"unlink",args:[D]}})),g=(D,M,q)=>I(Ha({id:q,action:"FS",payload:{method:D,args:M}})),S=(D,M)=>I(Ha({id:M,action:"loadLanguage",payload:{langs:D,options:{langPath:u.langPath,dataPath:u.dataPath,cachePath:u.cachePath,cacheMethod:u.cacheMethod,gzip:u.gzip,lstmOnly:[vi.DEFAULT,vi.LSTM_ONLY].includes(f)&&!u.legacyLang}}})),T=(D,M,q,Z)=>I(Ha({id:Z,action:"initialize",payload:{langs:D,oem:M,config:q}})),C=(D="eng",M,q,Z)=>{if(m&&[vi.TESSERACT_ONLY,vi.TESSERACT_LSTM_COMBINED].includes(M))throw Error("Legacy model requested but code missing.");let Y=M||f;f=Y;let ne=q||p;p=ne;let Ue=(typeof D=="string"?D.split("+"):D).filter(et=>!c.includes(et));return c.push(...Ue),Ue.length>0?S(Ue,Z).then(()=>T(D,Y,ne,Z)):T(D,Y,ne,Z)},L=(D={},M)=>I(Ha({id:M,action:"setParameters",payload:{params:D}})),b=async(D,M={},q={text:!0},Z)=>I(Ha({id:Z,action:"recognize",payload:{image:await wL(D),options:M,output:q}})),ce=async(D,M)=>{if(m)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return I(Ha({id:M,action:"detect",payload:{image:await wL(D)}}))},ve=async()=>(E!==null&&(tO(E),E=null),Promise.resolve());nO(E,({workerId:D,jobId:M,status:q,action:Z,data:Y})=>{let ne=`${Z}-${M}`;if(q==="resolve")bL(`[${D}]: Complete ${M}`),l[ne].resolve({jobId:M,data:Y}),delete l[ne];else if(q==="reject")if(l[ne].reject(Y),delete l[ne],Z==="load"&&v(Y),i)i(Y);else throw Error(Y);else q==="progress"&&s({...Y,userJobId:M})});let oe={id:r,worker:E,load:w,writeText:B,readText:j,removeFile:_,FS:g,reinitialize:C,setParameters:L,recognize:b,detect:ce,terminate:ve};return A().then(()=>S(t)).then(()=>T(t,e,a)).then(()=>R(oe)).catch(()=>{}),P}});var RL=Fe((mB,xL)=>{"use strict";var AL=iI(),rO=async(t,e,n)=>{let a=await AL(e,1,n);return a.recognize(t).finally(async()=>{await a.terminate()})},sO=async(t,e)=>{let n=await AL("osd",0,e);return n.detect(t).finally(async()=>{await n.terminate()})};xL.exports={recognize:rO,detect:sO}});var DL=Fe((gB,kL)=>{"use strict";kL.exports={AFR:"afr",AMH:"amh",ARA:"ara",ASM:"asm",AZE:"aze",AZE_CYRL:"aze_cyrl",BEL:"bel",BEN:"ben",BOD:"bod",BOS:"bos",BUL:"bul",CAT:"cat",CEB:"ceb",CES:"ces",CHI_SIM:"chi_sim",CHI_TRA:"chi_tra",CHR:"chr",CYM:"cym",DAN:"dan",DEU:"deu",DZO:"dzo",ELL:"ell",ENG:"eng",ENM:"enm",EPO:"epo",EST:"est",EUS:"eus",FAS:"fas",FIN:"fin",FRA:"fra",FRK:"frk",FRM:"frm",GLE:"gle",GLG:"glg",GRC:"grc",GUJ:"guj",HAT:"hat",HEB:"heb",HIN:"hin",HRV:"hrv",HUN:"hun",IKU:"iku",IND:"ind",ISL:"isl",ITA:"ita",ITA_OLD:"ita_old",JAV:"jav",JPN:"jpn",KAN:"kan",KAT:"kat",KAT_OLD:"kat_old",KAZ:"kaz",KHM:"khm",KIR:"kir",KOR:"kor",KUR:"kur",LAO:"lao",LAT:"lat",LAV:"lav",LIT:"lit",MAL:"mal",MAR:"mar",MKD:"mkd",MLT:"mlt",MSA:"msa",MYA:"mya",NEP:"nep",NLD:"nld",NOR:"nor",ORI:"ori",PAN:"pan",POL:"pol",POR:"por",PUS:"pus",RON:"ron",RUS:"rus",SAN:"san",SIN:"sin",SLK:"slk",SLV:"slv",SPA:"spa",SPA_OLD:"spa_old",SQI:"sqi",SRP:"srp",SRP_LATN:"srp_latn",SWA:"swa",SWE:"swe",SYR:"syr",TAM:"tam",TEL:"tel",TGK:"tgk",TGL:"tgl",THA:"tha",TIR:"tir",TUR:"tur",UIG:"uig",UKR:"ukr",URD:"urd",UZB:"uzb",UZB_CYRL:"uzb_cyrl",VIE:"vie",YID:"yid"}});var OL=Fe((yB,PL)=>{"use strict";PL.exports={OSD_ONLY:"0",AUTO_OSD:"1",AUTO_ONLY:"2",AUTO:"3",SINGLE_COLUMN:"4",SINGLE_BLOCK_VERT_TEXT:"5",SINGLE_BLOCK:"6",SINGLE_LINE:"7",SINGLE_WORD:"8",CIRCLE_WORD:"9",SINGLE_CHAR:"10",SPARSE_TEXT:"11",SPARSE_TEXT_OSD:"12",RAW_LINE:"13"}});var NL=Fe((IB,ML)=>{"use strict";XC();var iO=tL(),oO=iI(),uO=RL(),lO=DL(),cO=aI(),dO=OL(),{setLogging:fO}=nh();ML.exports={languages:lO,OEM:cO,PSM:dO,createScheduler:iO,createWorker:oO,setLogging:fO,...uO}});var GR=Fe(Wp=>{"use strict";var iU=Symbol.for("react.transitional.element"),oU=Symbol.for("react.fragment");function HR(t,e,n){var a=null;if(n!==void 0&&(a=""+n),e.key!==void 0&&(a=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:iU,type:t,key:a,ref:e!==void 0?e:null,props:n}}Wp.Fragment=oU;Wp.jsx=HR;Wp.jsxs=HR});var St=Fe((O3,jR)=>{"use strict";jR.exports=GR()});var ek={};zk(ek,{captureScreenshot:()=>cU});var cU,tk=qk(()=>{cU=async()=>null});var Se=Ce(Kn()),bk=Ce(WC());var Yy="http://localhost:3000";console.log("[EXTENSION] Using API_BASE:",Yy);function MP(t){return typeof t=="string"?t.startsWith("http")?t:Yy+t:t instanceof URL?t.href:t.url}function NP(t,e={}){let n=MP(t),a=e.method||"GET",r=e.headers instanceof Headers||Array.isArray(e.headers)?Object.fromEntries(e.headers):{...e.headers},s=e.body??null;return new Promise((i,u)=>{chrome.runtime.sendMessage({type:"echly-api",url:n,method:a,headers:r,body:s},l=>{if(chrome.runtime.lastError){u(new Error(chrome.runtime.lastError.message));return}if(!l){u(new Error("No response from background"));return}let c=new Response(l.body??"",{status:l.status??0,headers:l.headers?new Headers(l.headers):void 0});i(c)})})}async function gt(t,e={}){let n=t.startsWith("http")?t:Yy+t;return NP(n,e)}function Qy(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function $y(){return Qy()}function Jy(t,e,n){return new Promise((a,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,screenshotId:n},s=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(s?.error){r(new Error(s.error));return}if(s?.url){a(s.url);return}r(new Error("No URL from background"))})})}async function oI(t){if(!t||typeof t!="string")return"";try{let n=await(await Promise.resolve().then(()=>Ce(NL()))).createWorker("eng",void 0,{logger:()=>{}}),{data:{text:a}}=await n.recognize(t);return await n.terminate(),!a||typeof a!="string"?"":a.replace(/\s+/g," ").trim().slice(0,2e3)}catch{return""}}var ra=Ce(Kn());var VL=()=>{};var BL=function(t){let e=[],n=0;for(let a=0;a<t.length;a++){let r=t.charCodeAt(a);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&a+1<t.length&&(t.charCodeAt(a+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++a)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},hO=function(t){let e=[],n=0,a=0;for(;n<t.length;){let r=t[n++];if(r<128)e[a++]=String.fromCharCode(r);else if(r>191&&r<224){let s=t[n++];e[a++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){let s=t[n++],i=t[n++],u=t[n++],l=((r&7)<<18|(s&63)<<12|(i&63)<<6|u&63)-65536;e[a++]=String.fromCharCode(55296+(l>>10)),e[a++]=String.fromCharCode(56320+(l&1023))}else{let s=t[n++],i=t[n++];e[a++]=String.fromCharCode((r&15)<<12|(s&63)<<6|i&63)}}return e.join("")},qL={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let r=0;r<t.length;r+=3){let s=t[r],i=r+1<t.length,u=i?t[r+1]:0,l=r+2<t.length,c=l?t[r+2]:0,f=s>>2,p=(s&3)<<4|u>>4,m=(u&15)<<2|c>>6,v=c&63;l||(v=64,i||(m=64)),a.push(n[f],n[p],n[m],n[v])}return a.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(BL(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):hO(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let n=e?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let r=0;r<t.length;){let s=n[t.charAt(r++)],u=r<t.length?n[t.charAt(r)]:0;++r;let c=r<t.length?n[t.charAt(r)]:64;++r;let p=r<t.length?n[t.charAt(r)]:64;if(++r,s==null||u==null||c==null||p==null)throw new lI;let m=s<<2|u>>4;if(a.push(m),c!==64){let v=u<<4&240|c>>2;if(a.push(v),p!==64){let R=c<<6&192|p;a.push(R)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},lI=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},pO=function(t){let e=BL(t);return qL.encodeByteArray(e,!0)},ec=function(t){return pO(t).replace(/\./g,"")},sh=function(t){try{return qL.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function zL(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var mO=()=>zL().__FIREBASE_DEFAULTS__,gO=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},yO=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&sh(t[1]);return e&&JSON.parse(e)},ih=()=>{try{return VL()||mO()||gO()||yO()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},dI=t=>ih()?.emulatorHosts?.[t],oh=t=>{let e=dI(t);if(!e)return;let n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let a=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),a]:[e.substring(0,n),a]},fI=()=>ih()?.config,hI=t=>ih()?.[`_${t}`];var rh=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,a)=>{n?this.reject(n):this.resolve(a),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,a))}}};function Ga(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Ho(t){return(await fetch(t,{credentials:"include"})).ok}function uh(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let n={alg:"none",type:"JWT"},a=e||"demo-project",r=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let i={iss:`https://securetoken.google.com/${a}`,aud:a,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[ec(JSON.stringify(n)),ec(JSON.stringify(i)),""].join(".")}var Zl={};function IO(){let t={prod:[],emulator:[]};for(let e of Object.keys(Zl))Zl[e]?t.emulator.push(e):t.prod.push(e);return t}function _O(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}var FL=!1;function Go(t,e){if(typeof window>"u"||typeof document>"u"||!Ga(window.location.host)||Zl[t]===e||Zl[t]||FL)return;Zl[t]=e;function n(m){return`__firebase__banner__${m}`}let a="__firebase__banner",s=IO().prod.length>0;function i(){let m=document.getElementById(a);m&&m.remove()}function u(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function l(m,v){m.setAttribute("width","24"),m.setAttribute("id",v),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function c(){let m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{FL=!0,i()},m}function f(m,v){m.setAttribute("id",v),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){let m=_O(a),v=n("text"),R=document.getElementById(v)||document.createElement("span"),P=n("learnmore"),x=document.getElementById(P)||document.createElement("a"),E=n("preprendIcon"),I=document.getElementById(E)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){let w=m.element;u(w),f(x,P);let A=c();l(I,E),w.append(I,R,x,A),document.body.appendChild(w)}s?(R.innerText="Preview backend disconnected.",I.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(I.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,R.innerText="Preview backend running in this workspace."),R.setAttribute("id",v)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}function nn(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function HL(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(nn())}function SO(){let t=ih()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function GL(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function jL(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function KL(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function WL(){let t=nn();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function XL(){return!SO()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function pI(){try{return typeof indexedDB=="object"}catch{return!1}}function YL(){return new Promise((t,e)=>{try{let n=!0,a="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(a);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(a),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(n){e(n)}})}var vO="FirebaseError",xn=class t extends Error{constructor(e,n,a){super(n),this.code=e,this.customData=a,this.name=vO,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Dr.prototype.create)}},Dr=class{constructor(e,n,a){this.service=e,this.serviceName=n,this.errors=a}create(e,...n){let a=n[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?EO(s,a):"Error",u=`${this.serviceName}: ${i} (${r}).`;return new xn(r,u,a)}};function EO(t,e){return t.replace(TO,(n,a)=>{let r=e[a];return r!=null?String(r):`<${a}?>`})}var TO=/\{\$([^}]+)}/g;function QL(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function La(t,e){if(t===e)return!0;let n=Object.keys(t),a=Object.keys(e);for(let r of n){if(!a.includes(r))return!1;let s=t[r],i=e[r];if(UL(s)&&UL(i)){if(!La(s,i))return!1}else if(s!==i)return!1}for(let r of a)if(!n.includes(r))return!1;return!0}function UL(t){return t!==null&&typeof t=="object"}function jo(t){let e=[];for(let[n,a]of Object.entries(t))Array.isArray(a)?a.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(a));return e.length?"&"+e.join("&"):""}function Ko(t){let e={};return t.replace(/^\?/,"").split("&").forEach(a=>{if(a){let[r,s]=a.split("=");e[decodeURIComponent(r)]=decodeURIComponent(s)}}),e}function Wo(t){let e=t.indexOf("?");if(!e)return"";let n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function $L(t,e){let n=new cI(t,e);return n.subscribe.bind(n)}var cI=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(a=>{this.error(a)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,a){let r;if(e===void 0&&n===void 0&&a===void 0)throw new Error("Missing Observer.");bO(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:a},r.next===void 0&&(r.next=uI),r.error===void 0&&(r.error=uI),r.complete===void 0&&(r.complete=uI);let s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function bO(t,e){if(typeof t!="object"||t===null)return!1;for(let n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function uI(){}var EB=4*60*60*1e3;function an(t){return t&&t._delegate?t._delegate:t}var Fn=class{constructor(e,n,a){this.name=e,this.instanceFactory=n,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var Ei="[DEFAULT]";var mI=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){let a=new rh;if(this.instancesDeferred.set(n,a),this.isInitialized(n)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:n});r&&a.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){let n=this.normalizeInstanceIdentifier(e?.identifier),a=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(a)return null;throw r}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(CO(e))try{this.getOrInitializeService({instanceIdentifier:Ei})}catch{}for(let[n,a]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(n);try{let s=this.getOrInitializeService({instanceIdentifier:r});a.resolve(s)}catch{}}}}clearInstance(e=Ei){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Ei){return this.instances.has(e)}getOptions(e=Ei){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:n={}}=e,a=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:a,options:n});for(let[s,i]of this.instancesDeferred.entries()){let u=this.normalizeInstanceIdentifier(s);a===u&&i.resolve(r)}return r}onInit(e,n){let a=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(a)??new Set;r.add(e),this.onInitCallbacks.set(a,r);let s=this.instances.get(a);return s&&e(s,a),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){let a=this.onInitCallbacks.get(n);if(a)for(let r of a)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let a=this.instances.get(e);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:wO(e),options:n}),this.instances.set(e,a),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(a,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,a)}catch{}return a||null}normalizeInstanceIdentifier(e=Ei){return this.component?this.component.multipleInstances?e:Ei:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function wO(t){return t===Ei?void 0:t}function CO(t){return t.instantiationMode==="EAGER"}var lh=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let n=new mI(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};var LO=[],Ee;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Ee||(Ee={}));var AO={debug:Ee.DEBUG,verbose:Ee.VERBOSE,info:Ee.INFO,warn:Ee.WARN,error:Ee.ERROR,silent:Ee.SILENT},xO=Ee.INFO,RO={[Ee.DEBUG]:"log",[Ee.VERBOSE]:"log",[Ee.INFO]:"info",[Ee.WARN]:"warn",[Ee.ERROR]:"error"},kO=(t,e,...n)=>{if(e<t.logLevel)return;let a=new Date().toISOString(),r=RO[e];if(r)console[r](`[${a}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},Us=class{constructor(e){this.name=e,this._logLevel=xO,this._logHandler=kO,this._userLogHandler=null,LO.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Ee))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?AO[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Ee.DEBUG,...e),this._logHandler(this,Ee.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Ee.VERBOSE,...e),this._logHandler(this,Ee.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Ee.INFO,...e),this._logHandler(this,Ee.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Ee.WARN,...e),this._logHandler(this,Ee.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Ee.ERROR,...e),this._logHandler(this,Ee.ERROR,...e)}};var DO=(t,e)=>e.some(n=>t instanceof n),JL,ZL;function PO(){return JL||(JL=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function OO(){return ZL||(ZL=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var eA=new WeakMap,yI=new WeakMap,tA=new WeakMap,gI=new WeakMap,_I=new WeakMap;function MO(t){let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{n(ja(t.result)),r()},i=()=>{a(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(n=>{n instanceof IDBCursor&&eA.set(n,t)}).catch(()=>{}),_I.set(e,t),e}function NO(t){if(yI.has(t))return;let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{n(),r()},i=()=>{a(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});yI.set(t,e)}var II={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return yI.get(t);if(e==="objectStoreNames")return t.objectStoreNames||tA.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return ja(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function nA(t){II=t(II)}function VO(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let a=t.call(ch(this),e,...n);return tA.set(a,e.sort?e.sort():[e]),ja(a)}:OO().includes(t)?function(...e){return t.apply(ch(this),e),ja(eA.get(this))}:function(...e){return ja(t.apply(ch(this),e))}}function FO(t){return typeof t=="function"?VO(t):(t instanceof IDBTransaction&&NO(t),DO(t,PO())?new Proxy(t,II):t)}function ja(t){if(t instanceof IDBRequest)return MO(t);if(gI.has(t))return gI.get(t);let e=FO(t);return e!==t&&(gI.set(t,e),_I.set(e,t)),e}var ch=t=>_I.get(t);function rA(t,e,{blocked:n,upgrade:a,blocking:r,terminated:s}={}){let i=indexedDB.open(t,e),u=ja(i);return a&&i.addEventListener("upgradeneeded",l=>{a(ja(i.result),l.oldVersion,l.newVersion,ja(i.transaction),l)}),n&&i.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),u.then(l=>{s&&l.addEventListener("close",()=>s()),r&&l.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),u}var UO=["get","getKey","getAll","getAllKeys","count"],BO=["put","add","delete","clear"],SI=new Map;function aA(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(SI.get(e))return SI.get(e);let n=e.replace(/FromIndex$/,""),a=e!==n,r=BO.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(r||UO.includes(n)))return;let s=async function(i,...u){let l=this.transaction(i,r?"readwrite":"readonly"),c=l.store;return a&&(c=c.index(u.shift())),(await Promise.all([c[n](...u),r&&l.done]))[0]};return SI.set(e,s),s}nA(t=>({...t,get:(e,n,a)=>aA(e,n)||t.get(e,n,a),has:(e,n)=>!!aA(e,n)||t.has(e,n)}));var EI=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(qO(n)){let a=n.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(n=>n).join(" ")}};function qO(t){return t.getComponent()?.type==="VERSION"}var TI="@firebase/app",sA="0.14.9";var Pr=new Us("@firebase/app"),zO="@firebase/app-compat",HO="@firebase/analytics-compat",GO="@firebase/analytics",jO="@firebase/app-check-compat",KO="@firebase/app-check",WO="@firebase/auth",XO="@firebase/auth-compat",YO="@firebase/database",QO="@firebase/data-connect",$O="@firebase/database-compat",JO="@firebase/functions",ZO="@firebase/functions-compat",eM="@firebase/installations",tM="@firebase/installations-compat",nM="@firebase/messaging",aM="@firebase/messaging-compat",rM="@firebase/performance",sM="@firebase/performance-compat",iM="@firebase/remote-config",oM="@firebase/remote-config-compat",uM="@firebase/storage",lM="@firebase/storage-compat",cM="@firebase/firestore",dM="@firebase/ai",fM="@firebase/firestore-compat",hM="firebase",pM="12.10.0";var bI="[DEFAULT]",mM={[TI]:"fire-core",[zO]:"fire-core-compat",[GO]:"fire-analytics",[HO]:"fire-analytics-compat",[KO]:"fire-app-check",[jO]:"fire-app-check-compat",[WO]:"fire-auth",[XO]:"fire-auth-compat",[YO]:"fire-rtdb",[QO]:"fire-data-connect",[$O]:"fire-rtdb-compat",[JO]:"fire-fn",[ZO]:"fire-fn-compat",[eM]:"fire-iid",[tM]:"fire-iid-compat",[nM]:"fire-fcm",[aM]:"fire-fcm-compat",[rM]:"fire-perf",[sM]:"fire-perf-compat",[iM]:"fire-rc",[oM]:"fire-rc-compat",[uM]:"fire-gcs",[lM]:"fire-gcs-compat",[cM]:"fire-fst",[fM]:"fire-fst-compat",[dM]:"fire-vertex","fire-js":"fire-js",[hM]:"fire-js-all"};var dh=new Map,gM=new Map,wI=new Map;function iA(t,e){try{t.container.addComponent(e)}catch(n){Pr.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Ka(t){let e=t.name;if(wI.has(e))return Pr.debug(`There were multiple attempts to register component ${e}.`),!1;wI.set(e,t);for(let n of dh.values())iA(n,t);for(let n of gM.values())iA(n,t);return!0}function Ti(t,e){let n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Bn(t){return t==null?!1:t.settings!==void 0}var yM={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Bs=new Dr("app","Firebase",yM);var CI=class{constructor(e,n,a){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new Fn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Bs.create("app-deleted",{appName:this._name})}};var Wa=pM;function xI(t,e={}){let n=t;typeof e!="object"&&(e={name:e});let a={name:bI,automaticDataCollectionEnabled:!0,...e},r=a.name;if(typeof r!="string"||!r)throw Bs.create("bad-app-name",{appName:String(r)});if(n||(n=fI()),!n)throw Bs.create("no-options");let s=dh.get(r);if(s){if(La(n,s.options)&&La(a,s.config))return s;throw Bs.create("duplicate-app",{appName:r})}let i=new lh(r);for(let l of wI.values())i.addComponent(l);let u=new CI(n,a,i);return dh.set(r,u),u}function Xo(t=bI){let e=dh.get(t);if(!e&&t===bI&&fI())return xI();if(!e)throw Bs.create("no-app",{appName:t});return e}function Un(t,e,n){let a=mM[t]??t;n&&(a+=`-${n}`);let r=a.match(/\s|\//),s=e.match(/\s|\//);if(r||s){let i=[`Unable to register library "${a}" with version "${e}":`];r&&i.push(`library name "${a}" contains illegal characters (whitespace or "/")`),r&&s&&i.push("and"),s&&i.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Pr.warn(i.join(" "));return}Ka(new Fn(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}var IM="firebase-heartbeat-database",_M=1,tc="firebase-heartbeat-store",vI=null;function cA(){return vI||(vI=rA(IM,_M,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(tc)}catch(n){console.warn(n)}}}}).catch(t=>{throw Bs.create("idb-open",{originalErrorMessage:t.message})})),vI}async function SM(t){try{let n=(await cA()).transaction(tc),a=await n.objectStore(tc).get(dA(t));return await n.done,a}catch(e){if(e instanceof xn)Pr.warn(e.message);else{let n=Bs.create("idb-get",{originalErrorMessage:e?.message});Pr.warn(n.message)}}}async function oA(t,e){try{let a=(await cA()).transaction(tc,"readwrite");await a.objectStore(tc).put(e,dA(t)),await a.done}catch(n){if(n instanceof xn)Pr.warn(n.message);else{let a=Bs.create("idb-set",{originalErrorMessage:n?.message});Pr.warn(a.message)}}}function dA(t){return`${t.name}!${t.options.appId}`}var vM=1024,EM=30,LI=class{constructor(e){this.container=e,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new AI(n),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=uA();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(r=>r.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:n}),this._heartbeatsCache.heartbeats.length>EM){let r=bM(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Pr.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=uA(),{heartbeatsToSend:n,unsentEntries:a}=TM(this._heartbeatsCache.heartbeats),r=ec(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return Pr.warn(e),""}}};function uA(){return new Date().toISOString().substring(0,10)}function TM(t,e=vM){let n=[],a=t.slice();for(let r of t){let s=n.find(i=>i.agent===r.agent);if(s){if(s.dates.push(r.date),lA(n)>e){s.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),lA(n)>e){n.pop();break}a=a.slice(1)}return{heartbeatsToSend:n,unsentEntries:a}}var AI=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return pI()?YL().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await SM(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return oA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return oA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}};function lA(t){return ec(JSON.stringify({version:2,heartbeats:t})).length}function bM(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let a=1;a<t.length;a++)t[a].date<n&&(n=t[a].date,e=a);return e}function wM(t){Ka(new Fn("platform-logger",e=>new EI(e),"PRIVATE")),Ka(new Fn("heartbeat",e=>new LI(e),"PRIVATE")),Un(TI,sA,t),Un(TI,sA,"esm2020"),Un("fire-js","")}wM("");var CM="firebase",LM="12.10.0";Un(CM,LM,"app");function RA(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var kA=RA,DA=new Dr("auth","Firebase",RA());var Ih=new Us("@firebase/auth");function AM(t,...e){Ih.logLevel<=Ee.WARN&&Ih.warn(`Auth (${Wa}): ${t}`,...e)}function hh(t,...e){Ih.logLevel<=Ee.ERROR&&Ih.error(`Auth (${Wa}): ${t}`,...e)}function Aa(t,...e){throw e_(t,...e)}function Ya(t,...e){return e_(t,...e)}function PA(t,e,n){let a={...kA(),[e]:n};return new Dr("auth","Firebase",a).create(e,{appName:t.name})}function bi(t){return PA(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function e_(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return DA.create(t,...e)}function ee(t,e,...n){if(!t)throw e_(e,...n)}function Xa(t){let e="INTERNAL ASSERTION FAILED: "+t;throw hh(e),new Error(e)}function Mr(t,e){t||Xa(e)}function MI(){return typeof self<"u"&&self.location?.href||""}function xM(){return fA()==="http:"||fA()==="https:"}function fA(){return typeof self<"u"&&self.location?.protocol||null}function RM(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(xM()||jL()||"connection"in navigator)?navigator.onLine:!0}function kM(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var wi=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,Mr(n>e,"Short delay should be less than long delay!"),this.isMobile=HL()||KL()}get(){return RM()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function t_(t,e){Mr(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var _h=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Xa("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Xa("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Xa("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var DM={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var PM=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],OM=new wi(3e4,6e4);function rn(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function vn(t,e,n,a,r={}){return OA(t,r,async()=>{let s={},i={};a&&(e==="GET"?i=a:s={body:JSON.stringify(a)});let u=jo({key:t.config.apiKey,...i}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:l,...s};return GL()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Ga(t.emulatorConfig.host)&&(c.credentials="include"),_h.fetch()(await MA(t,t.config.apiHost,n,u),c)})}async function OA(t,e,n){t._canInitEmulator=!1;let a={...DM,...e};try{let r=new NI(t),s=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let i=await s.json();if("needConfirmation"in i)throw ac(t,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{let u=s.ok?i.errorMessage:i.error.message,[l,c]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw ac(t,"credential-already-in-use",i);if(l==="EMAIL_EXISTS")throw ac(t,"email-already-in-use",i);if(l==="USER_DISABLED")throw ac(t,"user-disabled",i);let f=a[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw PA(t,f,c);Aa(t,f)}}catch(r){if(r instanceof xn)throw r;Aa(t,"network-request-failed",{message:String(r)})}}async function Ri(t,e,n,a,r={}){let s=await vn(t,e,n,a,r);return"mfaPendingCredential"in s&&Aa(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function MA(t,e,n,a){let r=`${e}${n}?${a}`,s=t,i=s.config.emulator?t_(t.config,r):`${t.config.apiScheme}://${r}`;return PM.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(i).toString():i}function MM(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var NI=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(Ya(this.auth,"network-request-failed")),OM.get())})}};function ac(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=Ya(t,e,a);return r.customData._tokenResponse=n,r}function hA(t){return t!==void 0&&t.enterprise!==void 0}var Sh=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return MM(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function NA(t,e){return vn(t,"GET","/v2/recaptchaConfig",rn(t,e))}async function NM(t,e){return vn(t,"POST","/v1/accounts:delete",e)}async function vh(t,e){return vn(t,"POST","/v1/accounts:lookup",e)}function rc(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function VA(t,e=!1){let n=an(t),a=await n.getIdToken(e),r=n_(a);ee(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let s=typeof r.firebase=="object"?r.firebase:void 0,i=s?.sign_in_provider;return{claims:r,token:a,authTime:rc(RI(r.auth_time)),issuedAtTime:rc(RI(r.iat)),expirationTime:rc(RI(r.exp)),signInProvider:i||null,signInSecondFactor:s?.sign_in_second_factor||null}}function RI(t){return Number(t)*1e3}function n_(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return hh("JWT malformed, contained fewer than 3 sections"),null;try{let r=sh(n);return r?JSON.parse(r):(hh("Failed to decode base64 JWT payload"),null)}catch(r){return hh("Caught error parsing JWT payload as JSON",r?.toString()),null}}function pA(t){let e=n_(t);return ee(e,"internal-error"),ee(typeof e.exp<"u","internal-error"),ee(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function uc(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof xn&&VM(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function VM({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var VI=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var lc=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=rc(this.lastLoginAt),this.creationTime=rc(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function Eh(t){let e=t.auth,n=await t.getIdToken(),a=await uc(t,vh(e,{idToken:n}));ee(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let s=r.providerUserInfo?.length?UA(r.providerUserInfo):[],i=FM(t.providerData,s),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!i?.length,c=u?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new lc(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function FA(t){let e=an(t);await Eh(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function FM(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function UA(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function UM(t,e){let n=await OA(t,{},async()=>{let a=jo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,i=await MA(t,r,"/v1/token",`key=${s}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:a};return t.emulatorConfig&&Ga(t.emulatorConfig.host)&&(l.credentials="include"),_h.fetch()(i,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function BM(t,e){return vn(t,"POST","/v2/accounts:revokeToken",rn(t,e))}var sc=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ee(e.idToken,"internal-error"),ee(typeof e.idToken<"u","internal-error"),ee(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):pA(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ee(e.length!==0,"internal-error");let n=pA(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ee(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:s}=await UM(e,n);this.updateTokensAndExpiration(a,r,Number(s))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:s}=n,i=new t;return a&&(ee(typeof a=="string","internal-error",{appName:e}),i.refreshToken=a),r&&(ee(typeof r=="string","internal-error",{appName:e}),i.accessToken=r),s&&(ee(typeof s=="number","internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return Xa("not implemented")}};function qs(t,e){ee(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var zs=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new VI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new lc(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await uc(this,this.stsTokenManager.getToken(this.auth,e));return ee(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return VA(this,e)}reload(){return FA(this)}_assign(e){this!==e&&(ee(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){ee(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await Eh(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Bn(this.auth.app))return Promise.reject(bi(this.auth));let e=await this.getIdToken();return await uc(this,NM(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,s=n.phoneNumber??void 0,i=n.photoURL??void 0,u=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:v,providerData:R,stsTokenManager:P}=n;ee(p&&P,e,"internal-error");let x=sc.fromJSON(this.name,P);ee(typeof p=="string",e,"internal-error"),qs(a,e.name),qs(r,e.name),ee(typeof m=="boolean",e,"internal-error"),ee(typeof v=="boolean",e,"internal-error"),qs(s,e.name),qs(i,e.name),qs(u,e.name),qs(l,e.name),qs(c,e.name),qs(f,e.name);let E=new t({uid:p,auth:e,email:r,emailVerified:m,displayName:a,isAnonymous:v,photoURL:i,phoneNumber:s,tenantId:u,stsTokenManager:x,createdAt:c,lastLoginAt:f});return R&&Array.isArray(R)&&(E.providerData=R.map(I=>({...I}))),l&&(E._redirectEventId=l),E}static async _fromIdTokenResponse(e,n,a=!1){let r=new sc;r.updateFromServerResponse(n);let s=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await Eh(s),s}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];ee(r.localId!==void 0,"internal-error");let s=r.providerUserInfo!==void 0?UA(r.providerUserInfo):[],i=!(r.email&&r.passwordHash)&&!s?.length,u=new sc;u.updateFromIdToken(a);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:i}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new lc(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!s?.length};return Object.assign(l,c),l}};var mA=new Map;function Or(t){Mr(t instanceof Function,"Expected a class definition");let e=mA.get(t);return e?(Mr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,mA.set(t,e),e)}var Th=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};Th.type="NONE";var FI=Th;function ph(t,e,n){return`firebase:${t}:${e}:${n}`}var bh=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:s}=this.auth;this.fullUserKey=ph(this.userKey,r.apiKey,s),this.fullPersistenceKey=ph("persistence",r.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await vh(this.auth,{idToken:e}).catch(()=>{});return n?zs._fromGetAccountInfoResponse(this.auth,n,e):null}return zs._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(Or(FI),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),s=r[0]||Or(FI),i=ph(a,e.config.apiKey,e.name),u=null;for(let c of n)try{let f=await c._get(i);if(f){let p;if(typeof f=="string"){let m=await vh(e,{idToken:f}).catch(()=>{});if(!m)break;p=await zs._fromGetAccountInfoResponse(e,m,f)}else p=zs._fromJSON(e,f);c!==s&&(u=p),s=c;break}}catch{}let l=r.filter(c=>c._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new t(s,e,a):(s=l[0],u&&await s._set(i,u.toJSON()),await Promise.all(n.map(async c=>{if(c!==s)try{await c._remove(i)}catch{}})),new t(s,e,a))}};function gA(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(HA(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(BA(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(jA(e))return"Blackberry";if(KA(e))return"Webos";if(qA(e))return"Safari";if((e.includes("chrome/")||zA(e))&&!e.includes("edge/"))return"Chrome";if(GA(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function BA(t=nn()){return/firefox\//i.test(t)}function qA(t=nn()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function zA(t=nn()){return/crios\//i.test(t)}function HA(t=nn()){return/iemobile/i.test(t)}function GA(t=nn()){return/android/i.test(t)}function jA(t=nn()){return/blackberry/i.test(t)}function KA(t=nn()){return/webos/i.test(t)}function a_(t=nn()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function qM(t=nn()){return a_(t)&&!!window.navigator?.standalone}function zM(){return WL()&&document.documentMode===10}function WA(t=nn()){return a_(t)||GA(t)||KA(t)||jA(t)||/windows phone/i.test(t)||HA(t)}function XA(t,e=[]){let n;switch(t){case"Browser":n=gA(nn());break;case"Worker":n=`${gA(nn())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Wa}/${a}`}var UI=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=s=>new Promise((i,u)=>{try{let l=e(s);i(l)}catch(l){u(l)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function HM(t,e={}){return vn(t,"GET","/v2/passwordPolicy",rn(t,e))}var GM=6,BI=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??GM,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};var qI=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new wh(this),this.idTokenSubscription=new wh(this),this.beforeStateQueue=new UI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=DA,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Or(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await bh.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await vh(this,{idToken:e}),a=await zs._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(Bn(this.app)){let s=this.app.settings.authIdToken;return s?new Promise(i=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(s).then(i,i))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let s=this.redirectUser?._redirectEventId,i=a?._redirectEventId,u=await this.tryRedirectSignIn(e);(!s||s===i)&&u?.user&&(a=u.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(s){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(s))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return ee(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Eh(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=kM()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Bn(this.app))return Promise.reject(bi(this));let n=e?an(e):null;return n&&ee(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ee(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Bn(this.app)?Promise.reject(bi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Bn(this.app)?Promise.reject(bi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Or(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await HM(this),n=new BI(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Dr("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await BM(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&Or(e)||this._popupRedirectResolver;ee(n,this,"argument-error"),this.redirectPersistenceManager=await bh.create(this,[Or(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let s=typeof n=="function"?n:n.next.bind(n),i=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(ee(u,this,"internal-error"),u.then(()=>{i||s(this.currentUser)}),typeof n=="function"){let l=e.addObserver(n,a,r);return()=>{i=!0,l()}}else{let l=e.addObserver(n);return()=>{i=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ee(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=XA(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(Bn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&AM(`Error while retrieving App Check token: ${e.error}`),e?.token}};function $o(t){return an(t)}var wh=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=$L(n=>this.observer=n)}get next(){return ee(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var Hh={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function jM(t){Hh=t}function YA(t){return Hh.loadJS(t)}function KM(){return Hh.recaptchaEnterpriseScript}function WM(){return Hh.gapiScript}function QA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var zI=class{constructor(){this.enterprise=new HI}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},HI=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var XM="recaptcha-enterprise",ic="NO_RECAPTCHA",Ch=class{constructor(e){this.type=XM,this.auth=$o(e)}async verify(e="verify",n=!1){async function a(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(i,u)=>{NA(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let c=new Sh(l);return s.tenantId==null?s._agentRecaptchaConfig=c:s._tenantRecaptchaConfigs[s.tenantId]=c,i(c.siteKey)}}).catch(l=>{u(l)})})}function r(s,i,u){let l=window.grecaptcha;hA(l)?l.enterprise.ready(()=>{l.enterprise.execute(s,{action:e}).then(c=>{i(c)}).catch(()=>{i(ic)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new zI().execute("siteKey",{action:"verify"}):new Promise((s,i)=>{a(this.auth).then(u=>{if(!n&&hA(window.grecaptcha))r(u,s,i);else{if(typeof window>"u"){i(new Error("RecaptchaVerifier is only supported in browser"));return}let l=KM();l.length!==0&&(l+=u),YA(l).then(()=>{r(u,s,i)}).catch(c=>{i(c)})}}).catch(u=>{i(u)})})}};async function nc(t,e,n,a=!1,r=!1){let s=new Ch(t),i;if(r)i=ic;else try{i=await s.verify(n)}catch{i=await s.verify(n,!0)}let u={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,c=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return a?Object.assign(u,{captchaResp:i}):Object.assign(u,{captchaResponse:i}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function oc(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let s=await nc(t,e,n,n==="getOobCode");return a(t,s)}else return a(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let i=await nc(t,e,n,n==="getOobCode");return a(t,i)}else return Promise.reject(s)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let s=await nc(t,e,n);return a(t,s).catch(async i=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(i.code==="auth/missing-recaptcha-token"||i.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let u=await nc(t,e,n,!1,!0);return a(t,u)}return Promise.reject(i)})}else{let s=await nc(t,e,n,!1,!0);return a(t,s)}else return Promise.reject(r+" provider is not supported.")}async function YM(t){let e=$o(t),n=await NA(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),a=new Sh(n);e.tenantId==null?e._agentRecaptchaConfig=a:e._tenantRecaptchaConfigs[e.tenantId]=a,a.isAnyProviderEnabled()&&new Ch(e).verify()}function $A(t,e){let n=Ti(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),s=n.getOptions();if(La(s,e??{}))return r;Aa(r,"already-initialized")}return n.initialize({options:e})}function QM(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(Or);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function JA(t,e,n){let a=$o(t);ee(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,s=ZA(e),{host:i,port:u}=$M(e),l=u===null?"":`:${u}`,c={url:`${s}//${i}${l}/`},f=Object.freeze({host:i,port:u,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){ee(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),ee(La(c,a.config.emulator)&&La(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Ga(i)?(Ho(`${s}//${i}${l}`),Go("Auth",!0)):r||JM()}function ZA(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function $M(t){let e=ZA(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let s=r[1];return{host:s,port:yA(a.substr(s.length+1))}}else{let[s,i]=a.split(":");return{host:s,port:yA(i)}}}function yA(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function JM(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var Ci=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Xa("not implemented")}_getIdTokenResponse(e){return Xa("not implemented")}_linkToIdToken(e,n){return Xa("not implemented")}_getReauthenticationResolver(e){return Xa("not implemented")}};async function ZM(t,e){return vn(t,"POST","/v1/accounts:signUp",e)}async function eN(t,e){return Ri(t,"POST","/v1/accounts:signInWithPassword",rn(t,e))}async function tN(t,e){return Ri(t,"POST","/v1/accounts:signInWithEmailLink",rn(t,e))}async function nN(t,e){return Ri(t,"POST","/v1/accounts:signInWithEmailLink",rn(t,e))}var cc=class t extends Ci{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return oc(e,n,"signInWithPassword",eN,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return tN(e,{email:this._email,oobCode:this._password});default:Aa(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return oc(e,a,"signUpPassword",ZM,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return nN(e,{idToken:n,email:this._email,oobCode:this._password});default:Aa(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function Yo(t,e){return Ri(t,"POST","/v1/accounts:signInWithIdp",rn(t,e))}var aN="http://localhost",Li=class t extends Ci{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Aa("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...s}=n;if(!a||!r)return null;let i=new t(a,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){let n=this.buildRequest();return Yo(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,Yo(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,Yo(e,n)}buildRequest(){let e={requestUri:aN,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=jo(n)}return e}};async function IA(t,e){return vn(t,"POST","/v1/accounts:sendVerificationCode",rn(t,e))}async function rN(t,e){return Ri(t,"POST","/v1/accounts:signInWithPhoneNumber",rn(t,e))}async function sN(t,e){let n=await Ri(t,"POST","/v1/accounts:signInWithPhoneNumber",rn(t,e));if(n.temporaryProof)throw ac(t,"account-exists-with-different-credential",n);return n}var iN={USER_NOT_FOUND:"user-not-found"};async function oN(t,e){let n={...e,operation:"REAUTH"};return Ri(t,"POST","/v1/accounts:signInWithPhoneNumber",rn(t,n),iN)}var dc=class t extends Ci{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new t({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new t({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return rN(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return sN(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return oN(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:n,verificationId:a,verificationCode:r}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:a,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s}=e;return!a&&!n&&!r&&!s?null:new t({verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s})}};function uN(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function lN(t){let e=Ko(Wo(t)).link,n=e?Ko(Wo(e)).deep_link_id:null,a=Ko(Wo(t)).deep_link_id;return(a?Ko(Wo(a)).link:null)||a||n||e||t}var Lh=class t{constructor(e){let n=Ko(Wo(e)),a=n.apiKey??null,r=n.oobCode??null,s=uN(n.mode??null);ee(a&&r&&s,"argument-error"),this.apiKey=a,this.operation=s,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=lN(e);try{return new t(n)}catch{return null}}};var Qo=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return cc._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=Lh.parseLink(n);return ee(a,"argument-error"),cc._fromEmailAndCode(e,a.code,a.tenantId)}};Qo.PROVIDER_ID="password";Qo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Qo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var Ah=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var Ai=class extends Ah{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var fc=class t extends Ai{constructor(){super("facebook.com")}static credential(e){return Li._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};fc.FACEBOOK_SIGN_IN_METHOD="facebook.com";fc.PROVIDER_ID="facebook.com";var hc=class t extends Ai{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Li._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};hc.GOOGLE_SIGN_IN_METHOD="google.com";hc.PROVIDER_ID="google.com";var pc=class t extends Ai{constructor(){super("github.com")}static credential(e){return Li._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};pc.GITHUB_SIGN_IN_METHOD="github.com";pc.PROVIDER_ID="github.com";var mc=class t extends Ai{constructor(){super("twitter.com")}static credential(e,n){return Li._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};mc.TWITTER_SIGN_IN_METHOD="twitter.com";mc.PROVIDER_ID="twitter.com";var gc=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,a,r=!1){let s=await zs._fromIdTokenResponse(e,a,r),i=_A(a);return new t({user:s,providerId:i,_tokenResponse:a,operationType:n})}static async _forOperation(e,n,a){await e._updateTokensIfNecessary(a,!0);let r=_A(a);return new t({user:e,providerId:r,_tokenResponse:a,operationType:n})}};function _A(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var GI=class t extends xn{constructor(e,n,a,r){super(n.code,n.message),this.operationType=a,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:a}}static _fromErrorAndOperation(e,n,a,r){return new t(e,n,a,r)}};function ex(t,e,n,a){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?GI._fromErrorAndOperation(t,s,e,a):s})}async function cN(t,e,n=!1){let a=await uc(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return gc._forOperation(t,"link",a)}async function dN(t,e,n=!1){let{auth:a}=t;if(Bn(a.app))return Promise.reject(bi(a));let r="reauthenticate";try{let s=await uc(t,ex(a,r,e,t),n);ee(s.idToken,a,"internal-error");let i=n_(s.idToken);ee(i,a,"internal-error");let{sub:u}=i;return ee(t.uid===u,a,"user-mismatch"),gc._forOperation(t,r,s)}catch(s){throw s?.code==="auth/user-not-found"&&Aa(a,"user-mismatch"),s}}async function fN(t,e,n=!1){if(Bn(t.app))return Promise.reject(bi(t));let a="signIn",r=await ex(t,a,e),s=await gc._fromIdTokenResponse(t,a,r);return n||await t._updateCurrentUser(s.user),s}function tx(t,e,n,a){return an(t).onIdTokenChanged(e,n,a)}function nx(t,e,n){return an(t).beforeAuthStateChanged(e,n)}function SA(t,e){return vn(t,"POST","/v2/accounts/mfaEnrollment:start",rn(t,e))}function hN(t,e){return vn(t,"POST","/v2/accounts/mfaEnrollment:finalize",rn(t,e))}function pN(t,e){return vn(t,"POST","/v2/accounts/mfaEnrollment:start",rn(t,e))}function mN(t,e){return vn(t,"POST","/v2/accounts/mfaEnrollment:finalize",rn(t,e))}var xh="__sak";var Rh=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(xh,"1"),this.storage.removeItem(xh),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){let n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var gN=1e3,yN=10,kh=class extends Rh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=WA(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let n of Object.keys(this.listeners)){let a=this.storage.getItem(n),r=this.localCache[n];a!==r&&e(n,r,a)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((i,u,l)=>{this.notifyListeners(i,l)});return}let a=e.key;n?this.detachListener():this.stopPolling();let r=()=>{let i=this.storage.getItem(a);!n&&this.localCache[a]===i||this.notifyListeners(a,i)},s=this.storage.getItem(a);zM()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,yN):r()}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,a)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:a}),!0)})},gN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){let n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};kh.type="LOCAL";var ax=kh;var IN=1e3;function kI(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${e}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function DI(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var jI=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let n=new URL(`${window.location.origin}/__cookies__`);return n.searchParams.set("finalTarget",e),n}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,n){}async _get(e){if(!this._isAvailable())return null;let n=DI(e);return window.cookieStore?(await window.cookieStore.get(n))?.value:kI(n)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let a=DI(e);document.cookie=`${a}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,n){if(!this._isAvailable())return;let a=DI(e);if(window.cookieStore){let u=c=>{let f=c.changed.find(m=>m.name===a);f&&n(f.value),c.deleted.find(m=>m.name===a)&&n(null)},l=()=>window.cookieStore.removeEventListener("change",u);return this.listenerUnsubscribes.set(n,l),window.cookieStore.addEventListener("change",u)}let r=kI(a),s=setInterval(()=>{let u=kI(a);u!==r&&(n(u),r=u)},IN),i=()=>clearInterval(s);this.listenerUnsubscribes.set(n,i)}_removeListener(e,n){let a=this.listenerUnsubscribes.get(n);a&&(a(),this.listenerUnsubscribes.delete(n))}};jI.type="COOKIE";var Dh=class extends Rh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};Dh.type="SESSION";var r_=Dh;function _N(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var Ph=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:s}=n.data,i=this.handlersMap[r];if(!i?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let u=Array.from(i).map(async c=>c(n.origin,s)),l=await _N(u);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Ph.receivers=[];function s_(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var KI=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((u,l)=>{let c=s_("",20);r.port1.start();let f=setTimeout(()=>{l(new Error("unsupported_event"))},a);i={messageChannel:r,onMessage(p){let m=p;if(m.data.eventId===c)switch(m.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),u(m.data.response);break;default:clearTimeout(f),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}};function Qa(){return window}function SN(t){Qa().location.href=t}function rx(){return typeof Qa().WorkerGlobalScope<"u"&&typeof Qa().importScripts=="function"}async function vN(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function EN(){return navigator?.serviceWorker?.controller||null}function TN(){return rx()?self:null}var sx="firebaseLocalStorageDb",bN=1,Oh="firebaseLocalStorage",ix="fbase_key",xi=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function Gh(t,e){return t.transaction([Oh],e?"readwrite":"readonly").objectStore(Oh)}function wN(){let t=indexedDB.deleteDatabase(sx);return new xi(t).toPromise()}function WI(){let t=indexedDB.open(sx,bN);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Oh,{keyPath:ix})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Oh)?e(a):(a.close(),await wN(),e(await WI()))})})}async function vA(t,e,n){let a=Gh(t,!0).put({[ix]:e,value:n});return new xi(a).toPromise()}async function CN(t,e){let n=Gh(t,!1).get(e),a=await new xi(n).toPromise();return a===void 0?null:a.value}function EA(t,e){let n=Gh(t,!0).delete(e);return new xi(n).toPromise()}var LN=800,AN=3,Mh=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await WI(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>AN)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return rx()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ph._getInstance(TN()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await vN(),!this.activeServiceWorker)return;this.sender=new KI(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||EN()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await WI();return await vA(e,xh,"1"),await EA(e,xh),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>vA(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>CN(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>EA(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let s=Gh(r,!1).getAll();return new xi(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:s}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),LN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Mh.type="LOCAL";var ox=Mh;function TA(t,e){return vn(t,"POST","/v2/accounts/mfaSignIn:start",rn(t,e))}function xN(t,e){return vn(t,"POST","/v2/accounts/mfaSignIn:finalize",rn(t,e))}function RN(t,e){return vn(t,"POST","/v2/accounts/mfaSignIn:finalize",rn(t,e))}var XB=QA("rcb"),YB=new wi(3e4,6e4);var mh="recaptcha";async function kN(t,e,n){if(!t._getRecaptchaConfig())try{await YM(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let a;if(typeof e=="string"?a={phoneNumber:e}:a=e,"session"in a){let r=a.session;if("phoneNumber"in a){ee(r.type==="enroll",t,"internal-error");let s={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await oc(t,s,"mfaSmsEnrollment",async(c,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===ic){ee(n?.type===mh,c,"argument-error");let p=await PI(c,f,n);return SA(c,p)}return SA(c,f)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).phoneSessionInfo.sessionInfo}else{ee(r.type==="signin",t,"internal-error");let s=a.multiFactorHint?.uid||a.multiFactorUid;ee(s,t,"missing-multi-factor-info");let i={mfaPendingCredential:r.credential,mfaEnrollmentId:s,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await oc(t,i,"mfaSmsSignIn",async(f,p)=>{if(p.phoneSignInInfo.captchaResponse===ic){ee(n?.type===mh,f,"argument-error");let m=await PI(f,p,n);return TA(f,m)}return TA(f,p)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await oc(t,r,"sendVerificationCode",async(l,c)=>{if(c.captchaResponse===ic){ee(n?.type===mh,l,"argument-error");let f=await PI(l,c,n);return IA(l,f)}return IA(l,c)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{n?._reset()}}async function PI(t,e,n){ee(n.type===mh,t,"argument-error");let a=await n.verify();ee(typeof a=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let s=r.phoneEnrollmentInfo.phoneNumber,i=r.phoneEnrollmentInfo.captchaResponse,u=r.phoneEnrollmentInfo.clientType,l=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:a,captchaResponse:i,clientType:u,recaptchaVersion:l}}),r}else if("phoneSignInInfo"in r){let s=r.phoneSignInInfo.captchaResponse,i=r.phoneSignInInfo.clientType,u=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:a,captchaResponse:s,clientType:i,recaptchaVersion:u}}),r}else return Object.assign(r,{recaptchaToken:a}),r}var yc=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=$o(e)}verifyPhoneNumber(e,n){return kN(this.auth,e,an(n))}static credential(e,n){return dc._fromVerification(e,n)}static credentialFromResult(e){let n=e;return t.credentialFromTaggedObject(n)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:n,temporaryProof:a}=e;return n&&a?dc._fromTokenResponse(n,a):null}};yc.PROVIDER_ID="phone";yc.PHONE_SIGN_IN_METHOD="phone";function DN(t,e){return e?Or(e):(ee(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var Ic=class extends Ci{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Yo(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Yo(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Yo(e,this._buildIdpRequest())}_buildIdpRequest(e){let n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function PN(t){return fN(t.auth,new Ic(t),t.bypassAuthState)}function ON(t){let{auth:e,user:n}=t;return ee(n,e,"internal-error"),dN(n,new Ic(t),t.bypassAuthState)}async function MN(t){let{auth:e,user:n}=t;return ee(n,e,"internal-error"),cN(n,new Ic(t),t.bypassAuthState)}var Nh=class{constructor(e,n,a,r,s=!1){this.auth=e,this.resolver=a,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(a){this.reject(a)}})}async onAuthEvent(e){let{urlResponse:n,sessionId:a,postBody:r,tenantId:s,error:i,type:u}=e;if(i){this.reject(i);return}let l={auth:this.auth,requestUri:n,sessionId:a,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(l))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return PN;case"linkViaPopup":case"linkViaRedirect":return MN;case"reauthViaPopup":case"reauthViaRedirect":return ON;default:Aa(this.auth,"internal-error")}}resolve(e){Mr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Mr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var NN=new wi(2e3,1e4);var XI=class t extends Nh{constructor(e,n,a,r,s){super(e,n,r,s),this.provider=a,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return ee(e,this.auth,"internal-error"),e}async onExecution(){Mr(this.filter.length===1,"Popup operations only handle one event");let e=s_();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Ya(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(Ya(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ya(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,NN.get())};e()}};XI.currentPopupAction=null;var VN="pendingRedirect",gh=new Map,YI=class extends Nh{constructor(e,n,a=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,a),this.eventId=null}async execute(){let e=gh.get(this.auth._key());if(!e){try{let a=await FN(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(a)}catch(n){e=()=>Promise.reject(n)}gh.set(this.auth._key(),e)}return this.bypassAuthState||gh.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function FN(t,e){let n=qN(e),a=BN(t);if(!await a._isAvailable())return!1;let r=await a._get(n)==="true";return await a._remove(n),r}function UN(t,e){gh.set(t._key(),e)}function BN(t){return Or(t._redirectPersistence)}function qN(t){return ph(VN,t.config.apiKey,t.name)}async function zN(t,e,n=!1){if(Bn(t.app))return Promise.reject(bi(t));let a=$o(t),r=DN(a,e),i=await new YI(a,r,n).execute();return i&&!n&&(delete i.user._redirectEventId,await a._persistUserIfCurrent(i.user),await a._setRedirectUser(null,e)),i}var HN=10*60*1e3,QI=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(a=>{this.isEventForConsumer(e,a)&&(n=!0,this.sendToConsumer(e,a),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!GN(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!ux(e)){let a=e.error.code?.split("auth/")[1]||"internal-error";n.onError(Ya(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){let a=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&a}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=HN&&this.cachedEventUids.clear(),this.cachedEventUids.has(bA(e))}saveEventToCache(e){this.cachedEventUids.add(bA(e)),this.lastProcessedEventTime=Date.now()}};function bA(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function ux({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function GN(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return ux(t);default:return!1}}async function jN(t,e={}){return vn(t,"GET","/v1/projects",e)}var KN=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,WN=/^https?/;async function XN(t){if(t.config.emulator)return;let{authorizedDomains:e}=await jN(t);for(let n of e)try{if(YN(n))return}catch{}Aa(t,"unauthorized-domain")}function YN(t){let e=MI(),{protocol:n,hostname:a}=new URL(e);if(t.startsWith("chrome-extension://")){let i=new URL(t);return i.hostname===""&&a===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&i.hostname===a}if(!WN.test(n))return!1;if(KN.test(t))return a===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(a)}var QN=new wi(3e4,6e4);function wA(){let t=Qa().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function $N(t){return new Promise((e,n)=>{function a(){wA(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{wA(),n(Ya(t,"network-request-failed"))},timeout:QN.get()})}if(Qa().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(Qa().gapi?.load)a();else{let r=QA("iframefcb");return Qa()[r]=()=>{gapi.load?a():n(Ya(t,"network-request-failed"))},YA(`${WM()}?onload=${r}`).catch(s=>n(s))}}).catch(e=>{throw yh=null,e})}var yh=null;function JN(t){return yh=yh||$N(t),yh}var ZN=new wi(5e3,15e3),e2="__/auth/iframe",t2="emulator/auth/iframe",n2={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},a2=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function r2(t){let e=t.config;ee(e.authDomain,t,"auth-domain-config-required");let n=e.emulator?t_(e,t2):`https://${t.config.authDomain}/${e2}`,a={apiKey:e.apiKey,appName:t.name,v:Wa},r=a2.get(t.config.apiHost);r&&(a.eid=r);let s=t._getFrameworks();return s.length&&(a.fw=s.join(",")),`${n}?${jo(a).slice(1)}`}async function s2(t){let e=await JN(t),n=Qa().gapi;return ee(n,t,"internal-error"),e.open({where:document.body,url:r2(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:n2,dontclear:!0},a=>new Promise(async(r,s)=>{await a.restyle({setHideOnLeave:!1});let i=Ya(t,"network-request-failed"),u=Qa().setTimeout(()=>{s(i)},ZN.get());function l(){Qa().clearTimeout(u),r(a)}a.ping(l).then(l,()=>{s(i)})}))}var i2={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},o2=500,u2=600,l2="_blank",c2="http://localhost",Vh=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function d2(t,e,n,a=o2,r=u2){let s=Math.max((window.screen.availHeight-r)/2,0).toString(),i=Math.max((window.screen.availWidth-a)/2,0).toString(),u="",l={...i2,width:a.toString(),height:r.toString(),top:s,left:i},c=nn().toLowerCase();n&&(u=zA(c)?l2:n),BA(c)&&(e=e||c2,l.scrollbars="yes");let f=Object.entries(l).reduce((m,[v,R])=>`${m}${v}=${R},`,"");if(qM(c)&&u!=="_self")return f2(e||"",u),new Vh(null);let p=window.open(e||"",u,f);ee(p,t,"popup-blocked");try{p.focus()}catch{}return new Vh(p)}function f2(t,e){let n=document.createElement("a");n.href=t,n.target=e;let a=document.createEvent("MouseEvent");a.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(a)}var h2="__/auth/handler",p2="emulator/auth/handler",m2=encodeURIComponent("fac");async function CA(t,e,n,a,r,s){ee(t.config.authDomain,t,"auth-domain-config-required"),ee(t.config.apiKey,t,"invalid-api-key");let i={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:a,v:Wa,eventId:r};if(e instanceof Ah){e.setDefaultLanguage(t.languageCode),i.providerId=e.providerId||"",QL(e.getCustomParameters())||(i.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,p]of Object.entries(s||{}))i[f]=p}if(e instanceof Ai){let f=e.getScopes().filter(p=>p!=="");f.length>0&&(i.scopes=f.join(","))}t.tenantId&&(i.tid=t.tenantId);let u=i;for(let f of Object.keys(u))u[f]===void 0&&delete u[f];let l=await t._getAppCheckToken(),c=l?`#${m2}=${encodeURIComponent(l)}`:"";return`${g2(t)}?${jo(u).slice(1)}${c}`}function g2({config:t}){return t.emulator?t_(t,p2):`https://${t.authDomain}/${h2}`}var OI="webStorageSupport",$I=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=r_,this._completeRedirectFn=zN,this._overrideRedirectResult=UN}async _openPopup(e,n,a,r){Mr(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let s=await CA(e,n,a,MI(),r);return d2(e,s,s_())}async _openRedirect(e,n,a,r){await this._originValidation(e);let s=await CA(e,n,a,MI(),r);return SN(s),new Promise(()=>{})}_initialize(e){let n=e._key();if(this.eventManagers[n]){let{manager:r,promise:s}=this.eventManagers[n];return r?Promise.resolve(r):(Mr(s,"If manager is not set, promise should be"),s)}let a=this.initAndGetManager(e);return this.eventManagers[n]={promise:a},a.catch(()=>{delete this.eventManagers[n]}),a}async initAndGetManager(e){let n=await s2(e),a=new QI(e);return n.register("authEvent",r=>(ee(r?.authEvent,e,"invalid-auth-event"),{status:a.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:a},this.iframes[e._key()]=n,a}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(OI,{type:OI},r=>{let s=r?.[0]?.[OI];s!==void 0&&n(!!s),Aa(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=XN(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return WA()||qA()||a_()}},lx=$I,Fh=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return Xa("unexpected MultiFactorSessionType")}}},JI=class t extends Fh{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,n,a){return hN(e,{idToken:n,displayName:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,n){return xN(e,{mfaPendingCredential:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Uh=class{constructor(){}static assertion(e){return JI._fromCredential(e)}};Uh.FACTOR_ID="phone";var Bh=class{static assertionForEnrollment(e,n){return qh._fromSecret(e,n)}static assertionForSignIn(e,n){return qh._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;ee(typeof n.user?.auth<"u","internal-error");let a=await pN(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return zh._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Bh.FACTOR_ID="totp";var qh=class t extends Fh{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return ee(typeof this.secret<"u",e,"argument-error"),mN(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){ee(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return RN(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},zh=class t{constructor(e,n,a,r,s,i,u){this.sessionInfo=i,this.auth=u,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(fh(e)||fh(n))&&(a=!0),a&&(fh(e)&&(e=this.auth.currentUser?.email||"unknownuser"),fh(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function fh(t){return typeof t>"u"||t?.length===0}var LA="@firebase/auth",AA="1.12.1";var ZI=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ee(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function y2(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function I2(t){Ka(new Fn("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:u}=a.options;ee(i&&!i.includes(":"),"invalid-api-key",{appName:a.name});let l={apiKey:i,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:XA(t)},c=new qI(a,r,s,l);return QM(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),Ka(new Fn("auth-internal",e=>{let n=$o(e.getProvider("auth").getImmediate());return(a=>new ZI(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Un(LA,AA,y2(t)),Un(LA,AA,"esm2020")}var _2=5*60,S2=hI("authIdTokenMaxAge")||_2,xA=null,v2=t=>async e=>{let n=e&&await e.getIdTokenResult(),a=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(a&&a>S2)return;let r=n?.token;xA!==r&&(xA=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function i_(t=Xo()){let e=Ti(t,"auth");if(e.isInitialized())return e.getImmediate();let n=$A(t,{popupRedirectResolver:lx,persistence:[ox,ax,r_]}),a=hI("authTokenSyncURL");if(a&&typeof isSecureContext=="boolean"&&isSecureContext){let s=new URL(a,location.origin);if(location.origin===s.origin){let i=v2(s.toString());nx(n,i,()=>i(n.currentUser)),tx(n,u=>i(u))}}let r=dI("auth");return r&&JA(n,`http://${r}`),n}function E2(){return document.getElementsByTagName("head")?.[0]??document}jM({loadJS(t){return new Promise((e,n)=>{let a=document.createElement("script");a.setAttribute("src",t),a.onload=e,a.onerror=r=>{let s=Ya("internal-error");s.customData=r,n(s)},a.type="text/javascript",a.charset="UTF-8",E2().appendChild(a)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});I2("Browser");var cx=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},dx={};var Nr,o_;(function(){var t;function e(_,g){function S(){}S.prototype=g.prototype,_.F=g.prototype,_.prototype=new S,_.prototype.constructor=_,_.D=function(T,C,L){for(var b=Array(arguments.length-2),ce=2;ce<arguments.length;ce++)b[ce-2]=arguments[ce];return g.prototype[C].apply(T,b)}}function n(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(a,n),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(_,g,S){S||(S=0);let T=Array(16);if(typeof g=="string")for(var C=0;C<16;++C)T[C]=g.charCodeAt(S++)|g.charCodeAt(S++)<<8|g.charCodeAt(S++)<<16|g.charCodeAt(S++)<<24;else for(C=0;C<16;++C)T[C]=g[S++]|g[S++]<<8|g[S++]<<16|g[S++]<<24;g=_.g[0],S=_.g[1],C=_.g[2];let L=_.g[3],b;b=g+(L^S&(C^L))+T[0]+3614090360&4294967295,g=S+(b<<7&4294967295|b>>>25),b=L+(C^g&(S^C))+T[1]+3905402710&4294967295,L=g+(b<<12&4294967295|b>>>20),b=C+(S^L&(g^S))+T[2]+606105819&4294967295,C=L+(b<<17&4294967295|b>>>15),b=S+(g^C&(L^g))+T[3]+3250441966&4294967295,S=C+(b<<22&4294967295|b>>>10),b=g+(L^S&(C^L))+T[4]+4118548399&4294967295,g=S+(b<<7&4294967295|b>>>25),b=L+(C^g&(S^C))+T[5]+1200080426&4294967295,L=g+(b<<12&4294967295|b>>>20),b=C+(S^L&(g^S))+T[6]+2821735955&4294967295,C=L+(b<<17&4294967295|b>>>15),b=S+(g^C&(L^g))+T[7]+4249261313&4294967295,S=C+(b<<22&4294967295|b>>>10),b=g+(L^S&(C^L))+T[8]+1770035416&4294967295,g=S+(b<<7&4294967295|b>>>25),b=L+(C^g&(S^C))+T[9]+2336552879&4294967295,L=g+(b<<12&4294967295|b>>>20),b=C+(S^L&(g^S))+T[10]+4294925233&4294967295,C=L+(b<<17&4294967295|b>>>15),b=S+(g^C&(L^g))+T[11]+2304563134&4294967295,S=C+(b<<22&4294967295|b>>>10),b=g+(L^S&(C^L))+T[12]+1804603682&4294967295,g=S+(b<<7&4294967295|b>>>25),b=L+(C^g&(S^C))+T[13]+4254626195&4294967295,L=g+(b<<12&4294967295|b>>>20),b=C+(S^L&(g^S))+T[14]+2792965006&4294967295,C=L+(b<<17&4294967295|b>>>15),b=S+(g^C&(L^g))+T[15]+1236535329&4294967295,S=C+(b<<22&4294967295|b>>>10),b=g+(C^L&(S^C))+T[1]+4129170786&4294967295,g=S+(b<<5&4294967295|b>>>27),b=L+(S^C&(g^S))+T[6]+3225465664&4294967295,L=g+(b<<9&4294967295|b>>>23),b=C+(g^S&(L^g))+T[11]+643717713&4294967295,C=L+(b<<14&4294967295|b>>>18),b=S+(L^g&(C^L))+T[0]+3921069994&4294967295,S=C+(b<<20&4294967295|b>>>12),b=g+(C^L&(S^C))+T[5]+3593408605&4294967295,g=S+(b<<5&4294967295|b>>>27),b=L+(S^C&(g^S))+T[10]+38016083&4294967295,L=g+(b<<9&4294967295|b>>>23),b=C+(g^S&(L^g))+T[15]+3634488961&4294967295,C=L+(b<<14&4294967295|b>>>18),b=S+(L^g&(C^L))+T[4]+3889429448&4294967295,S=C+(b<<20&4294967295|b>>>12),b=g+(C^L&(S^C))+T[9]+568446438&4294967295,g=S+(b<<5&4294967295|b>>>27),b=L+(S^C&(g^S))+T[14]+3275163606&4294967295,L=g+(b<<9&4294967295|b>>>23),b=C+(g^S&(L^g))+T[3]+4107603335&4294967295,C=L+(b<<14&4294967295|b>>>18),b=S+(L^g&(C^L))+T[8]+1163531501&4294967295,S=C+(b<<20&4294967295|b>>>12),b=g+(C^L&(S^C))+T[13]+2850285829&4294967295,g=S+(b<<5&4294967295|b>>>27),b=L+(S^C&(g^S))+T[2]+4243563512&4294967295,L=g+(b<<9&4294967295|b>>>23),b=C+(g^S&(L^g))+T[7]+1735328473&4294967295,C=L+(b<<14&4294967295|b>>>18),b=S+(L^g&(C^L))+T[12]+2368359562&4294967295,S=C+(b<<20&4294967295|b>>>12),b=g+(S^C^L)+T[5]+4294588738&4294967295,g=S+(b<<4&4294967295|b>>>28),b=L+(g^S^C)+T[8]+2272392833&4294967295,L=g+(b<<11&4294967295|b>>>21),b=C+(L^g^S)+T[11]+1839030562&4294967295,C=L+(b<<16&4294967295|b>>>16),b=S+(C^L^g)+T[14]+4259657740&4294967295,S=C+(b<<23&4294967295|b>>>9),b=g+(S^C^L)+T[1]+2763975236&4294967295,g=S+(b<<4&4294967295|b>>>28),b=L+(g^S^C)+T[4]+1272893353&4294967295,L=g+(b<<11&4294967295|b>>>21),b=C+(L^g^S)+T[7]+4139469664&4294967295,C=L+(b<<16&4294967295|b>>>16),b=S+(C^L^g)+T[10]+3200236656&4294967295,S=C+(b<<23&4294967295|b>>>9),b=g+(S^C^L)+T[13]+681279174&4294967295,g=S+(b<<4&4294967295|b>>>28),b=L+(g^S^C)+T[0]+3936430074&4294967295,L=g+(b<<11&4294967295|b>>>21),b=C+(L^g^S)+T[3]+3572445317&4294967295,C=L+(b<<16&4294967295|b>>>16),b=S+(C^L^g)+T[6]+76029189&4294967295,S=C+(b<<23&4294967295|b>>>9),b=g+(S^C^L)+T[9]+3654602809&4294967295,g=S+(b<<4&4294967295|b>>>28),b=L+(g^S^C)+T[12]+3873151461&4294967295,L=g+(b<<11&4294967295|b>>>21),b=C+(L^g^S)+T[15]+530742520&4294967295,C=L+(b<<16&4294967295|b>>>16),b=S+(C^L^g)+T[2]+3299628645&4294967295,S=C+(b<<23&4294967295|b>>>9),b=g+(C^(S|~L))+T[0]+4096336452&4294967295,g=S+(b<<6&4294967295|b>>>26),b=L+(S^(g|~C))+T[7]+1126891415&4294967295,L=g+(b<<10&4294967295|b>>>22),b=C+(g^(L|~S))+T[14]+2878612391&4294967295,C=L+(b<<15&4294967295|b>>>17),b=S+(L^(C|~g))+T[5]+4237533241&4294967295,S=C+(b<<21&4294967295|b>>>11),b=g+(C^(S|~L))+T[12]+1700485571&4294967295,g=S+(b<<6&4294967295|b>>>26),b=L+(S^(g|~C))+T[3]+2399980690&4294967295,L=g+(b<<10&4294967295|b>>>22),b=C+(g^(L|~S))+T[10]+4293915773&4294967295,C=L+(b<<15&4294967295|b>>>17),b=S+(L^(C|~g))+T[1]+2240044497&4294967295,S=C+(b<<21&4294967295|b>>>11),b=g+(C^(S|~L))+T[8]+1873313359&4294967295,g=S+(b<<6&4294967295|b>>>26),b=L+(S^(g|~C))+T[15]+4264355552&4294967295,L=g+(b<<10&4294967295|b>>>22),b=C+(g^(L|~S))+T[6]+2734768916&4294967295,C=L+(b<<15&4294967295|b>>>17),b=S+(L^(C|~g))+T[13]+1309151649&4294967295,S=C+(b<<21&4294967295|b>>>11),b=g+(C^(S|~L))+T[4]+4149444226&4294967295,g=S+(b<<6&4294967295|b>>>26),b=L+(S^(g|~C))+T[11]+3174756917&4294967295,L=g+(b<<10&4294967295|b>>>22),b=C+(g^(L|~S))+T[2]+718787259&4294967295,C=L+(b<<15&4294967295|b>>>17),b=S+(L^(C|~g))+T[9]+3951481745&4294967295,_.g[0]=_.g[0]+g&4294967295,_.g[1]=_.g[1]+(C+(b<<21&4294967295|b>>>11))&4294967295,_.g[2]=_.g[2]+C&4294967295,_.g[3]=_.g[3]+L&4294967295}a.prototype.v=function(_,g){g===void 0&&(g=_.length);let S=g-this.blockSize,T=this.C,C=this.h,L=0;for(;L<g;){if(C==0)for(;L<=S;)r(this,_,L),L+=this.blockSize;if(typeof _=="string"){for(;L<g;)if(T[C++]=_.charCodeAt(L++),C==this.blockSize){r(this,T),C=0;break}}else for(;L<g;)if(T[C++]=_[L++],C==this.blockSize){r(this,T),C=0;break}}this.h=C,this.o+=g},a.prototype.A=function(){var _=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);_[0]=128;for(var g=1;g<_.length-8;++g)_[g]=0;g=this.o*8;for(var S=_.length-8;S<_.length;++S)_[S]=g&255,g/=256;for(this.v(_),_=Array(16),g=0,S=0;S<4;++S)for(let T=0;T<32;T+=8)_[g++]=this.g[S]>>>T&255;return _};function s(_,g){var S=u;return Object.prototype.hasOwnProperty.call(S,_)?S[_]:S[_]=g(_)}function i(_,g){this.h=g;let S=[],T=!0;for(let C=_.length-1;C>=0;C--){let L=_[C]|0;T&&L==g||(S[C]=L,T=!1)}this.g=S}var u={};function l(_){return-128<=_&&_<128?s(_,function(g){return new i([g|0],g<0?-1:0)}):new i([_|0],_<0?-1:0)}function c(_){if(isNaN(_)||!isFinite(_))return p;if(_<0)return x(c(-_));let g=[],S=1;for(let T=0;_>=S;T++)g[T]=_/S|0,S*=4294967296;return new i(g,0)}function f(_,g){if(_.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(_.charAt(0)=="-")return x(f(_.substring(1),g));if(_.indexOf("-")>=0)throw Error('number format error: interior "-" character');let S=c(Math.pow(g,8)),T=p;for(let L=0;L<_.length;L+=8){var C=Math.min(8,_.length-L);let b=parseInt(_.substring(L,L+C),g);C<8?(C=c(Math.pow(g,C)),T=T.j(C).add(c(b))):(T=T.j(S),T=T.add(c(b)))}return T}var p=l(0),m=l(1),v=l(16777216);t=i.prototype,t.m=function(){if(P(this))return-x(this).m();let _=0,g=1;for(let S=0;S<this.g.length;S++){let T=this.i(S);_+=(T>=0?T:4294967296+T)*g,g*=4294967296}return _},t.toString=function(_){if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(R(this))return"0";if(P(this))return"-"+x(this).toString(_);let g=c(Math.pow(_,6));var S=this;let T="";for(;;){let C=A(S,g).g;S=E(S,C.j(g));let L=((S.g.length>0?S.g[0]:S.h)>>>0).toString(_);if(S=C,R(S))return L+T;for(;L.length<6;)L="0"+L;T=L+T}},t.i=function(_){return _<0?0:_<this.g.length?this.g[_]:this.h};function R(_){if(_.h!=0)return!1;for(let g=0;g<_.g.length;g++)if(_.g[g]!=0)return!1;return!0}function P(_){return _.h==-1}t.l=function(_){return _=E(this,_),P(_)?-1:R(_)?0:1};function x(_){let g=_.g.length,S=[];for(let T=0;T<g;T++)S[T]=~_.g[T];return new i(S,~_.h).add(m)}t.abs=function(){return P(this)?x(this):this},t.add=function(_){let g=Math.max(this.g.length,_.g.length),S=[],T=0;for(let C=0;C<=g;C++){let L=T+(this.i(C)&65535)+(_.i(C)&65535),b=(L>>>16)+(this.i(C)>>>16)+(_.i(C)>>>16);T=b>>>16,L&=65535,b&=65535,S[C]=b<<16|L}return new i(S,S[S.length-1]&-2147483648?-1:0)};function E(_,g){return _.add(x(g))}t.j=function(_){if(R(this)||R(_))return p;if(P(this))return P(_)?x(this).j(x(_)):x(x(this).j(_));if(P(_))return x(this.j(x(_)));if(this.l(v)<0&&_.l(v)<0)return c(this.m()*_.m());let g=this.g.length+_.g.length,S=[];for(var T=0;T<2*g;T++)S[T]=0;for(T=0;T<this.g.length;T++)for(let C=0;C<_.g.length;C++){let L=this.i(T)>>>16,b=this.i(T)&65535,ce=_.i(C)>>>16,ve=_.i(C)&65535;S[2*T+2*C]+=b*ve,I(S,2*T+2*C),S[2*T+2*C+1]+=L*ve,I(S,2*T+2*C+1),S[2*T+2*C+1]+=b*ce,I(S,2*T+2*C+1),S[2*T+2*C+2]+=L*ce,I(S,2*T+2*C+2)}for(_=0;_<g;_++)S[_]=S[2*_+1]<<16|S[2*_];for(_=g;_<2*g;_++)S[_]=0;return new i(S,0)};function I(_,g){for(;(_[g]&65535)!=_[g];)_[g+1]+=_[g]>>>16,_[g]&=65535,g++}function w(_,g){this.g=_,this.h=g}function A(_,g){if(R(g))throw Error("division by zero");if(R(_))return new w(p,p);if(P(_))return g=A(x(_),g),new w(x(g.g),x(g.h));if(P(g))return g=A(_,x(g)),new w(x(g.g),g.h);if(_.g.length>30){if(P(_)||P(g))throw Error("slowDivide_ only works with positive integers.");for(var S=m,T=g;T.l(_)<=0;)S=B(S),T=B(T);var C=j(S,1),L=j(T,1);for(T=j(T,2),S=j(S,2);!R(T);){var b=L.add(T);b.l(_)<=0&&(C=C.add(S),L=b),T=j(T,1),S=j(S,1)}return g=E(_,C.j(g)),new w(C,g)}for(C=p;_.l(g)>=0;){for(S=Math.max(1,Math.floor(_.m()/g.m())),T=Math.ceil(Math.log(S)/Math.LN2),T=T<=48?1:Math.pow(2,T-48),L=c(S),b=L.j(g);P(b)||b.l(_)>0;)S-=T,L=c(S),b=L.j(g);R(L)&&(L=m),C=C.add(L),_=E(_,b)}return new w(C,_)}t.B=function(_){return A(this,_).h},t.and=function(_){let g=Math.max(this.g.length,_.g.length),S=[];for(let T=0;T<g;T++)S[T]=this.i(T)&_.i(T);return new i(S,this.h&_.h)},t.or=function(_){let g=Math.max(this.g.length,_.g.length),S=[];for(let T=0;T<g;T++)S[T]=this.i(T)|_.i(T);return new i(S,this.h|_.h)},t.xor=function(_){let g=Math.max(this.g.length,_.g.length),S=[];for(let T=0;T<g;T++)S[T]=this.i(T)^_.i(T);return new i(S,this.h^_.h)};function B(_){let g=_.g.length+1,S=[];for(let T=0;T<g;T++)S[T]=_.i(T)<<1|_.i(T-1)>>>31;return new i(S,_.h)}function j(_,g){let S=g>>5;g%=32;let T=_.g.length-S,C=[];for(let L=0;L<T;L++)C[L]=g>0?_.i(L+S)>>>g|_.i(L+S+1)<<32-g:_.i(L+S);return new i(C,_.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,o_=dx.Md5=a,i.prototype.add=i.prototype.add,i.prototype.multiply=i.prototype.j,i.prototype.modulo=i.prototype.B,i.prototype.compare=i.prototype.l,i.prototype.toNumber=i.prototype.m,i.prototype.toString=i.prototype.toString,i.prototype.getBits=i.prototype.i,i.fromNumber=c,i.fromString=f,Nr=dx.Integer=i}).apply(typeof cx<"u"?cx:typeof self<"u"?self:typeof window<"u"?window:{});var jh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Vr={};var u_,T2,Jo,l_,_c,Kh,c_,d_,f_;(function(){var t,e=Object.defineProperty;function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof jh=="object"&&jh];for(var d=0;d<o.length;++d){var h=o[d];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var a=n(this);function r(o,d){if(d)e:{var h=a;o=o.split(".");for(var y=0;y<o.length-1;y++){var k=o[y];if(!(k in h))break e;h=h[k]}o=o[o.length-1],y=h[o],d=d(y),d!=y&&d!=null&&e(h,o,{configurable:!0,writable:!0,value:d})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(d){var h=[],y;for(y in d)Object.prototype.hasOwnProperty.call(d,y)&&h.push([y,d[y]]);return h}});var s=s||{},i=this||self;function u(o){var d=typeof o;return d=="object"&&o!=null||d=="function"}function l(o,d,h){return o.call.apply(o.bind,arguments)}function c(o,d,h){return c=l,c.apply(null,arguments)}function f(o,d){var h=Array.prototype.slice.call(arguments,1);return function(){var y=h.slice();return y.push.apply(y,arguments),o.apply(this,y)}}function p(o,d){function h(){}h.prototype=d.prototype,o.Z=d.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(y,k,O){for(var W=Array(arguments.length-2),_e=2;_e<arguments.length;_e++)W[_e-2]=arguments[_e];return d.prototype[k].apply(y,W)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function v(o){let d=o.length;if(d>0){let h=Array(d);for(let y=0;y<d;y++)h[y]=o[y];return h}return[]}function R(o,d){for(let y=1;y<arguments.length;y++){let k=arguments[y];var h=typeof k;if(h=h!="object"?h:k?Array.isArray(k)?"array":h:"null",h=="array"||h=="object"&&typeof k.length=="number"){h=o.length||0;let O=k.length||0;o.length=h+O;for(let W=0;W<O;W++)o[h+W]=k[W]}else o.push(k)}}class P{constructor(d,h){this.i=d,this.j=h,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function x(o){i.setTimeout(()=>{throw o},0)}function E(){var o=_;let d=null;return o.g&&(d=o.g,o.g=o.g.next,o.g||(o.h=null),d.next=null),d}class I{constructor(){this.h=this.g=null}add(d,h){let y=w.get();y.set(d,h),this.h?this.h.next=y:this.g=y,this.h=y}}var w=new P(()=>new A,o=>o.reset());class A{constructor(){this.next=this.g=this.h=null}set(d,h){this.h=d,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let B,j=!1,_=new I,g=()=>{let o=Promise.resolve(void 0);B=()=>{o.then(S)}};function S(){for(var o;o=E();){try{o.h.call(o.g)}catch(h){x(h)}var d=w;d.j(o),d.h<100&&(d.h++,o.next=d.g,d.g=o)}j=!1}function T(){this.u=this.u,this.C=this.C}T.prototype.u=!1,T.prototype.dispose=function(){this.u||(this.u=!0,this.N())},T.prototype[Symbol.dispose]=function(){this.dispose()},T.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function C(o,d){this.type=o,this.g=this.target=d,this.defaultPrevented=!1}C.prototype.h=function(){this.defaultPrevented=!0};var L=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var o=!1,d=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let h=()=>{};i.addEventListener("test",h,d),i.removeEventListener("test",h,d)}catch{}return o}();function b(o){return/^[\s\xa0]*$/.test(o)}function ce(o,d){C.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,d)}p(ce,C),ce.prototype.init=function(o,d){let h=this.type=o.type,y=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=d,d=o.relatedTarget,d||(h=="mouseover"?d=o.fromElement:h=="mouseout"&&(d=o.toElement)),this.relatedTarget=d,y?(this.clientX=y.clientX!==void 0?y.clientX:y.pageX,this.clientY=y.clientY!==void 0?y.clientY:y.pageY,this.screenX=y.screenX||0,this.screenY=y.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&ce.Z.h.call(this)},ce.prototype.h=function(){ce.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var ve="closure_listenable_"+(Math.random()*1e6|0),oe=0;function D(o,d,h,y,k){this.listener=o,this.proxy=null,this.src=d,this.type=h,this.capture=!!y,this.ha=k,this.key=++oe,this.da=this.fa=!1}function M(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function q(o,d,h){for(let y in o)d.call(h,o[y],y,o)}function Z(o,d){for(let h in o)d.call(void 0,o[h],h,o)}function Y(o){let d={};for(let h in o)d[h]=o[h];return d}let ne="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function at(o,d){let h,y;for(let k=1;k<arguments.length;k++){y=arguments[k];for(h in y)o[h]=y[h];for(let O=0;O<ne.length;O++)h=ne[O],Object.prototype.hasOwnProperty.call(y,h)&&(o[h]=y[h])}}function Ue(o){this.src=o,this.g={},this.h=0}Ue.prototype.add=function(o,d,h,y,k){let O=o.toString();o=this.g[O],o||(o=this.g[O]=[],this.h++);let W=rt(o,d,y,k);return W>-1?(d=o[W],h||(d.fa=!1)):(d=new D(d,this.src,O,!!y,k),d.fa=h,o.push(d)),d};function et(o,d){let h=d.type;if(h in o.g){var y=o.g[h],k=Array.prototype.indexOf.call(y,d,void 0),O;(O=k>=0)&&Array.prototype.splice.call(y,k,1),O&&(M(d),o.g[h].length==0&&(delete o.g[h],o.h--))}}function rt(o,d,h,y){for(let k=0;k<o.length;++k){let O=o[k];if(!O.da&&O.listener==d&&O.capture==!!h&&O.ha==y)return k}return-1}var sa="closure_lm_"+(Math.random()*1e6|0),Rn={};function ln(o,d,h,y,k){if(y&&y.once)return In(o,d,h,y,k);if(Array.isArray(d)){for(let O=0;O<d.length;O++)ln(o,d[O],h,y,k);return null}return h=Ve(h),o&&o[ve]?o.J(d,h,u(y)?!!y.capture:!!y,k):Da(o,d,h,!1,y,k)}function Da(o,d,h,y,k,O){if(!d)throw Error("Invalid event type");let W=u(k)?!!k.capture:!!k,_e=ue(o);if(_e||(o[sa]=_e=new Ue(o)),h=_e.add(d,h,y,W,O),h.proxy)return h;if(y=ur(),h.proxy=y,y.src=o,y.listener=h,o.addEventListener)L||(k=W),k===void 0&&(k=!1),o.addEventListener(d.toString(),y,k);else if(o.attachEvent)o.attachEvent(ae(d.toString()),y);else if(o.addListener&&o.removeListener)o.addListener(y);else throw Error("addEventListener and attachEvent are unavailable.");return h}function ur(){function o(h){return d.call(o.src,o.listener,h)}let d=fe;return o}function In(o,d,h,y,k){if(Array.isArray(d)){for(let O=0;O<d.length;O++)In(o,d[O],h,y,k);return null}return h=Ve(h),o&&o[ve]?o.K(d,h,u(y)?!!y.capture:!!y,k):Da(o,d,h,!0,y,k)}function N(o,d,h,y,k){if(Array.isArray(d))for(var O=0;O<d.length;O++)N(o,d[O],h,y,k);else y=u(y)?!!y.capture:!!y,h=Ve(h),o&&o[ve]?(o=o.i,O=String(d).toString(),O in o.g&&(d=o.g[O],h=rt(d,h,y,k),h>-1&&(M(d[h]),Array.prototype.splice.call(d,h,1),d.length==0&&(delete o.g[O],o.h--)))):o&&(o=ue(o))&&(d=o.g[d.toString()],o=-1,d&&(o=rt(d,h,y,k)),(h=o>-1?d[o]:null)&&Q(h))}function Q(o){if(typeof o!="number"&&o&&!o.da){var d=o.src;if(d&&d[ve])et(d.i,o);else{var h=o.type,y=o.proxy;d.removeEventListener?d.removeEventListener(h,y,o.capture):d.detachEvent?d.detachEvent(ae(h),y):d.addListener&&d.removeListener&&d.removeListener(y),(h=ue(d))?(et(h,o),h.h==0&&(h.src=null,d[sa]=null)):M(o)}}}function ae(o){return o in Rn?Rn[o]:Rn[o]="on"+o}function fe(o,d){if(o.da)o=!0;else{d=new ce(d,this);let h=o.listener,y=o.ha||o.src;o.fa&&Q(o),o=h.call(y,d)}return o}function ue(o){return o=o[sa],o instanceof Ue?o:null}var Ae="__closure_events_fn_"+(Math.random()*1e9>>>0);function Ve(o){return typeof o=="function"?o:(o[Ae]||(o[Ae]=function(d){return o.handleEvent(d)}),o[Ae])}function pe(){T.call(this),this.i=new Ue(this),this.M=this,this.G=null}p(pe,T),pe.prototype[ve]=!0,pe.prototype.removeEventListener=function(o,d,h,y){N(this,o,d,h,y)};function we(o,d){var h,y=o.G;if(y)for(h=[];y;y=y.G)h.push(y);if(o=o.M,y=d.type||d,typeof d=="string")d=new C(d,o);else if(d instanceof C)d.target=d.target||o;else{var k=d;d=new C(y,o),at(d,k)}k=!0;let O,W;if(h)for(W=h.length-1;W>=0;W--)O=d.g=h[W],k=Be(O,y,!0,d)&&k;if(O=d.g=o,k=Be(O,y,!0,d)&&k,k=Be(O,y,!1,d)&&k,h)for(W=0;W<h.length;W++)O=d.g=h[W],k=Be(O,y,!1,d)&&k}pe.prototype.N=function(){if(pe.Z.N.call(this),this.i){var o=this.i;for(let d in o.g){let h=o.g[d];for(let y=0;y<h.length;y++)M(h[y]);delete o.g[d],o.h--}}this.G=null},pe.prototype.J=function(o,d,h,y){return this.i.add(String(o),d,!1,h,y)},pe.prototype.K=function(o,d,h,y){return this.i.add(String(o),d,!0,h,y)};function Be(o,d,h,y){if(d=o.i.g[String(d)],!d)return!0;d=d.concat();let k=!0;for(let O=0;O<d.length;++O){let W=d[O];if(W&&!W.da&&W.capture==h){let _e=W.listener,Wt=W.ha||W.src;W.fa&&et(o.i,W),k=_e.call(Wt,y)!==!1&&k}}return k&&!y.defaultPrevented}function st(o,d){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=c(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:i.setTimeout(o,d||0)}function Xe(o){o.g=st(()=>{o.g=null,o.i&&(o.i=!1,Xe(o))},o.l);let d=o.h;o.h=null,o.m.apply(null,d)}class ht extends T{constructor(d,h){super(),this.m=d,this.l=h,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:Xe(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ye(o){T.call(this),this.h=o,this.g={}}p(ye,T);var Ne=[];function je(o){q(o.g,function(d,h){this.g.hasOwnProperty(h)&&Q(d)},o),o.g={}}ye.prototype.N=function(){ye.Z.N.call(this),je(this)},ye.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ot=i.JSON.stringify,Kt=i.JSON.parse,Et=class{stringify(o){return i.JSON.stringify(o,void 0)}parse(o){return i.JSON.parse(o,void 0)}};function Ye(){}function Ea(){}var ke={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function bn(){C.call(this,"d")}p(bn,C);function _n(){C.call(this,"c")}p(_n,C);var Ge={},De=null;function Qe(){return De=De||new pe}Ge.Ia="serverreachability";function Dt(o){C.call(this,Ge.Ia,o)}p(Dt,C);function cn(o){let d=Qe();we(d,new Dt(d))}Ge.STAT_EVENT="statevent";function Ys(o,d){C.call(this,Ge.STAT_EVENT,o),this.stat=d}p(Ys,C);function ut(o){let d=Qe();we(d,new Ys(d,o))}Ge.Ja="timingevent";function ia(o,d){C.call(this,Ge.Ja,o),this.size=d}p(ia,C);function wn(o,d){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){o()},d)}function Ct(){this.g=!0}Ct.prototype.ua=function(){this.g=!1};function Nu(o,d,h,y,k,O){o.info(function(){if(o.g)if(O){var W="",_e=O.split("&");for(let tt=0;tt<_e.length;tt++){var Wt=_e[tt].split("=");if(Wt.length>1){let Jt=Wt[0];Wt=Wt[1];let Ma=Jt.split("_");W=Ma.length>=2&&Ma[1]=="type"?W+(Jt+"="+Wt+"&"):W+(Jt+"=redacted&")}}}else W=null;else W=O;return"XMLHTTP REQ ("+y+") [attempt "+k+"]: "+d+`
`+h+`
`+W})}function cd(o,d,h,y,k,O,W){o.info(function(){return"XMLHTTP RESP ("+y+") [ attempt "+k+"]: "+d+`
`+h+`
`+O+" "+W})}function lr(o,d,h,y){o.info(function(){return"XMLHTTP TEXT ("+d+"): "+Fu(o,h)+(y?" "+y:"")})}function Vu(o,d){o.info(function(){return"TIMEOUT: "+d})}Ct.prototype.info=function(){};function Fu(o,d){if(!o.g)return d;if(!d)return null;try{let O=JSON.parse(d);if(O){for(o=0;o<O.length;o++)if(Array.isArray(O[o])){var h=O[o];if(!(h.length<2)){var y=h[1];if(Array.isArray(y)&&!(y.length<1)){var k=y[0];if(k!="noop"&&k!="stop"&&k!="close")for(let W=1;W<y.length;W++)y[W]=""}}}}return ot(O)}catch{return d}}var $r={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Jr={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Qs;function Zr(){}p(Zr,Ye),Zr.prototype.g=function(){return new XMLHttpRequest},Qs=new Zr;function cr(o){return encodeURIComponent(String(o))}function Uu(o){var d=1;o=o.split(":");let h=[];for(;d>0&&o.length;)h.push(o.shift()),d--;return o.length&&h.push(o.join(":")),h}function oa(o,d,h,y){this.j=o,this.i=d,this.l=h,this.S=y||1,this.V=new ye(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new qi}function qi(){this.i=null,this.g="",this.h=!1}var Bu={},zi={};function Hi(o,d,h){o.M=1,o.A=$s(Gn(d)),o.u=h,o.R=!0,dr(o,null)}function dr(o,d){o.F=Date.now(),Hn(o),o.B=Gn(o.A);var h=o.B,y=o.S;Array.isArray(y)||(y=[String(y)]),Pt(h.i,"t",y),o.C=0,h=o.j.L,o.h=new qi,o.g=eE(o.j,h?d:null,!o.u),o.P>0&&(o.O=new ht(c(o.Y,o,o.g),o.P)),d=o.V,h=o.g,y=o.ba;var k="readystatechange";Array.isArray(k)||(k&&(Ne[0]=k.toString()),k=Ne);for(let O=0;O<k.length;O++){let W=ln(h,k[O],y||d.handleEvent,!1,d.h||d);if(!W)break;d.g[W.key]=W}d=o.J?Y(o.J):{},o.u?(o.v||(o.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,d)):(o.v="GET",o.g.ea(o.B,o.v,null,d)),cn(),Nu(o.i,o.v,o.B,o.l,o.S,o.u)}oa.prototype.ba=function(o){o=o.target;let d=this.O;d&&us(o)==3?d.j():this.Y(o)},oa.prototype.Y=function(o){try{if(o==this.g)e:{let _e=us(this.g),Wt=this.g.ya(),tt=this.g.ca();if(!(_e<3)&&(_e!=3||this.g&&(this.h.h||this.g.la()||Hv(this.g)))){this.K||_e!=4||Wt==7||(Wt==8||tt<=0?cn(3):cn(2)),ts(this);var d=this.g.ca();this.X=d;var h=zn(this);if(this.o=d==200,cd(this.i,this.v,this.B,this.l,this.S,_e,d),this.o){if(this.U&&!this.L){t:{if(this.g){var y,k=this.g;if((y=k.g?k.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!b(y)){var O=y;break t}}O=null}if(o=O)lr(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Gi(this,o);else{this.o=!1,this.m=3,ut(12),Pa(this),ns(this);break e}}if(this.R){o=!0;let Jt;for(;!this.K&&this.C<h.length;)if(Jt=es(this,h),Jt==zi){_e==4&&(this.m=4,ut(14),o=!1),lr(this.i,this.l,null,"[Incomplete Response]");break}else if(Jt==Bu){this.m=4,ut(15),lr(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else lr(this.i,this.l,Jt,null),Gi(this,Jt);if(ua(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),_e!=4||h.length!=0||this.h.h||(this.m=1,ut(16),o=!1),this.o=this.o&&o,!o)lr(this.i,this.l,h,"[Invalid Chunked Response]"),Pa(this),ns(this);else if(h.length>0&&!this.W){this.W=!0;var W=this.j;W.g==this&&W.aa&&!W.P&&(W.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),om(W),W.P=!0,ut(11))}}else lr(this.i,this.l,h,null),Gi(this,h);_e==4&&Pa(this),this.o&&!this.K&&(_e==4?Qv(this.j,this):(this.o=!1,Hn(this)))}else Ok(this.g),d==400&&h.indexOf("Unknown SID")>0?(this.m=3,ut(12)):(this.m=0,ut(13)),Pa(this),ns(this)}}}catch{}finally{}};function zn(o){if(!ua(o))return o.g.la();let d=Hv(o.g);if(d==="")return"";let h="",y=d.length,k=us(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return Pa(o),ns(o),"";o.h.i=new i.TextDecoder}for(let O=0;O<y;O++)o.h.h=!0,h+=o.h.i.decode(d[O],{stream:!(k&&O==y-1)});return d.length=0,o.h.g+=h,o.C=0,o.h.g}function ua(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function es(o,d){var h=o.C,y=d.indexOf(`
`,h);return y==-1?zi:(h=Number(d.substring(h,y)),isNaN(h)?Bu:(y+=1,y+h>d.length?zi:(d=d.slice(y,y+h),o.C=y+h,d)))}oa.prototype.cancel=function(){this.K=!0,Pa(this)};function Hn(o){o.T=Date.now()+o.H,qu(o,o.H)}function qu(o,d){if(o.D!=null)throw Error("WatchDog timer not null");o.D=wn(c(o.aa,o),d)}function ts(o){o.D&&(i.clearTimeout(o.D),o.D=null)}oa.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?(Vu(this.i,this.B),this.M!=2&&(cn(),ut(17)),Pa(this),this.m=2,ns(this)):qu(this,this.T-o)};function ns(o){o.j.I==0||o.K||Qv(o.j,o)}function Pa(o){ts(o);var d=o.O;d&&typeof d.dispose=="function"&&d.dispose(),o.O=null,je(o.V),o.g&&(d=o.g,o.g=null,d.abort(),d.dispose())}function Gi(o,d){try{var h=o.j;if(h.I!=0&&(h.g==o||ji(h.h,o))){if(!o.L&&ji(h.h,o)&&h.I==3){try{var y=h.Ba.g.parse(d)}catch{y=null}if(Array.isArray(y)&&y.length==3){var k=y;if(k[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)Sd(h),Id(h);else break e;im(h),ut(18)}}else h.xa=k[1],0<h.xa-h.K&&k[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=wn(c(h.Va,h),6e3));Oa(h.h)<=1&&h.ta&&(h.ta=void 0)}else Zs(h,11)}else if((o.L||h.g==o)&&Sd(h),!b(d))for(k=h.Ba.g.parse(d),d=0;d<k.length;d++){let tt=k[d],Jt=tt[0];if(!(Jt<=h.K))if(h.K=Jt,tt=tt[1],h.I==2)if(tt[0]=="c"){h.M=tt[1],h.ba=tt[2];let Ma=tt[3];Ma!=null&&(h.ka=Ma,h.j.info("VER="+h.ka));let ei=tt[4];ei!=null&&(h.za=ei,h.j.info("SVER="+h.za));let ls=tt[5];ls!=null&&typeof ls=="number"&&ls>0&&(y=1.5*ls,h.O=y,h.j.info("backChannelRequestTimeoutMs_="+y)),y=h;let cs=o.g;if(cs){let Ed=cs.g?cs.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ed){var O=y.h;O.g||Ed.indexOf("spdy")==-1&&Ed.indexOf("quic")==-1&&Ed.indexOf("h2")==-1||(O.j=O.l,O.g=new Set,O.h&&(Ki(O,O.h),O.h=null))}if(y.G){let um=cs.g?cs.g.getResponseHeader("X-HTTP-Session-Id"):null;um&&(y.wa=um,$e(y.J,y.G,um))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),y=h;var W=o;if(y.na=Zv(y,y.L?y.ba:null,y.W),W.L){Gu(y.h,W);var _e=W,Wt=y.O;Wt&&(_e.H=Wt),_e.D&&(ts(_e),Hn(_e)),y.g=W}else Xv(y);h.i.length>0&&_d(h)}else tt[0]!="stop"&&tt[0]!="close"||Zs(h,7);else h.I==3&&(tt[0]=="stop"||tt[0]=="close"?tt[0]=="stop"?Zs(h,7):sm(h):tt[0]!="noop"&&h.l&&h.l.qa(tt),h.A=0)}}cn(4)}catch{}}var dd=class{constructor(o,d){this.g=o,this.map=d}};function zu(o){this.l=o||10,i.PerformanceNavigationTiming?(o=i.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Hu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Oa(o){return o.h?1:o.g?o.g.size:0}function ji(o,d){return o.h?o.h==d:o.g?o.g.has(d):!1}function Ki(o,d){o.g?o.g.add(d):o.h=d}function Gu(o,d){o.h&&o.h==d?o.h=null:o.g&&o.g.has(d)&&o.g.delete(d)}zu.prototype.cancel=function(){if(this.i=as(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function as(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let d=o.i;for(let h of o.g.values())d=d.concat(h.G);return d}return v(o.i)}var ju=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function fd(o,d){if(o){o=o.split("&");for(let h=0;h<o.length;h++){let y=o[h].indexOf("="),k,O=null;y>=0?(k=o[h].substring(0,y),O=o[h].substring(y+1)):k=o[h],d(k,O?decodeURIComponent(O.replace(/\+/g," ")):"")}}}function Ta(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;o instanceof Ta?(this.l=o.l,rs(this,o.j),this.o=o.o,this.g=o.g,ss(this,o.u),this.h=o.h,Wi(this,pd(o.i)),this.m=o.m):o&&(d=String(o).match(ju))?(this.l=!1,rs(this,d[1]||"",!0),this.o=is(d[2]||""),this.g=is(d[3]||"",!0),ss(this,d[4]),this.h=is(d[5]||"",!0),Wi(this,d[6]||"",!0),this.m=is(d[7]||"")):(this.l=!1,this.i=new J(null,this.l))}Ta.prototype.toString=function(){let o=[];var d=this.j;d&&o.push(Js(d,hd,!0),":");var h=this.g;return(h||d=="file")&&(o.push("//"),(d=this.o)&&o.push(Js(d,hd,!0),"@"),o.push(cr(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(Js(h,h.charAt(0)=="/"?U:am,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",Js(h,G)),o.join("")},Ta.prototype.resolve=function(o){let d=Gn(this),h=!!o.j;h?rs(d,o.j):h=!!o.o,h?d.o=o.o:h=!!o.g,h?d.g=o.g:h=o.u!=null;var y=o.h;if(h)ss(d,o.u);else if(h=!!o.h){if(y.charAt(0)!="/")if(this.g&&!this.h)y="/"+y;else{var k=d.h.lastIndexOf("/");k!=-1&&(y=d.h.slice(0,k+1)+y)}if(k=y,k==".."||k==".")y="";else if(k.indexOf("./")!=-1||k.indexOf("/.")!=-1){y=k.lastIndexOf("/",0)==0,k=k.split("/");let O=[];for(let W=0;W<k.length;){let _e=k[W++];_e=="."?y&&W==k.length&&O.push(""):_e==".."?((O.length>1||O.length==1&&O[0]!="")&&O.pop(),y&&W==k.length&&O.push("")):(O.push(_e),y=!0)}y=O.join("/")}else y=k}return h?d.h=y:h=o.i.toString()!=="",h?Wi(d,pd(o.i)):h=!!o.m,h&&(d.m=o.m),d};function Gn(o){return new Ta(o)}function rs(o,d,h){o.j=h?is(d,!0):d,o.j&&(o.j=o.j.replace(/:$/,""))}function ss(o,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);o.u=d}else o.u=null}function Wi(o,d,h){d instanceof J?(o.i=d,Ak(o.i,o.l)):(h||(d=Js(d,K)),o.i=new J(d,o.l))}function $e(o,d,h){o.i.set(d,h)}function $s(o){return $e(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function is(o,d){return o?d?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Js(o,d,h){return typeof o=="string"?(o=encodeURI(o).replace(d,Ku),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function Ku(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var hd=/[#\/\?@]/g,am=/[#\?:]/g,U=/[#\?]/g,K=/[#\?@]/g,G=/#/g;function J(o,d){this.h=this.g=null,this.i=o||null,this.j=!!d}function re(o){o.g||(o.g=new Map,o.h=0,o.i&&fd(o.i,function(d,h){o.add(decodeURIComponent(d.replace(/\+/g," ")),h)}))}t=J.prototype,t.add=function(o,d){re(this),this.i=null,o=Xi(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(d),this.h+=1,this};function qe(o,d){re(o),d=Xi(o,d),o.g.has(d)&&(o.i=null,o.h-=o.g.get(d).length,o.g.delete(d))}function ie(o,d){return re(o),d=Xi(o,d),o.g.has(d)}t.forEach=function(o,d){re(this),this.g.forEach(function(h,y){h.forEach(function(k){o.call(d,k,y,this)},this)},this)};function Ie(o,d){re(o);let h=[];if(typeof d=="string")ie(o,d)&&(h=h.concat(o.g.get(Xi(o,d))));else for(o=Array.from(o.g.values()),d=0;d<o.length;d++)h=h.concat(o[d]);return h}t.set=function(o,d){return re(this),this.i=null,o=Xi(this,o),ie(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[d]),this.h+=1,this},t.get=function(o,d){return o?(o=Ie(this,o),o.length>0?String(o[0]):d):d};function Pt(o,d,h){qe(o,d),h.length>0&&(o.i=null,o.g.set(Xi(o,d),v(h)),o.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],d=Array.from(this.g.keys());for(let y=0;y<d.length;y++){var h=d[y];let k=cr(h);h=Ie(this,h);for(let O=0;O<h.length;O++){let W=k;h[O]!==""&&(W+="="+cr(h[O])),o.push(W)}}return this.i=o.join("&")};function pd(o){let d=new J;return d.i=o.i,o.g&&(d.g=new Map(o.g),d.h=o.h),d}function Xi(o,d){return d=String(d),o.j&&(d=d.toLowerCase()),d}function Ak(o,d){d&&!o.j&&(re(o),o.i=null,o.g.forEach(function(h,y){let k=y.toLowerCase();y!=k&&(qe(this,y),Pt(this,k,h))},o)),o.j=d}function xk(o,d){let h=new Ct;if(i.Image){let y=new Image;y.onload=f(os,h,"TestLoadImage: loaded",!0,d,y),y.onerror=f(os,h,"TestLoadImage: error",!1,d,y),y.onabort=f(os,h,"TestLoadImage: abort",!1,d,y),y.ontimeout=f(os,h,"TestLoadImage: timeout",!1,d,y),i.setTimeout(function(){y.ontimeout&&y.ontimeout()},1e4),y.src=o}else d(!1)}function Rk(o,d){let h=new Ct,y=new AbortController,k=setTimeout(()=>{y.abort(),os(h,"TestPingServer: timeout",!1,d)},1e4);fetch(o,{signal:y.signal}).then(O=>{clearTimeout(k),O.ok?os(h,"TestPingServer: ok",!0,d):os(h,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(k),os(h,"TestPingServer: error",!1,d)})}function os(o,d,h,y,k){try{k&&(k.onload=null,k.onerror=null,k.onabort=null,k.ontimeout=null),y(h)}catch{}}function kk(){this.g=new Et}function md(o){this.i=o.Sb||null,this.h=o.ab||!1}p(md,Ye),md.prototype.g=function(){return new gd(this.i,this.h)};function gd(o,d){pe.call(this),this.H=o,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(gd,pe),t=gd.prototype,t.open=function(o,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=d,this.readyState=1,Xu(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(d.body=o),(this.H||i).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Wu(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Xu(this)),this.g&&(this.readyState=3,Xu(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof i.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Fv(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Fv(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var d=o.value?o.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!o.done}))&&(this.response=this.responseText+=d)}o.done?Wu(this):Xu(this),this.readyState==3&&Fv(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,Wu(this))},t.Na=function(o){this.g&&(this.response=o,Wu(this))},t.ga=function(){this.g&&Wu(this)};function Wu(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Xu(o)}t.setRequestHeader=function(o,d){this.A.append(o,d)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],d=this.h.entries();for(var h=d.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=d.next();return o.join(`\r
`)};function Xu(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(gd.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Uv(o){let d="";return q(o,function(h,y){d+=y,d+=":",d+=h,d+=`\r
`}),d}function rm(o,d,h){e:{for(y in h){var y=!1;break e}y=!0}y||(h=Uv(h),typeof o=="string"?h!=null&&cr(h):$e(o,d,h))}function Tt(o){pe.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(Tt,pe);var Dk=/^https?$/i,Pk=["POST","PUT"];t=Tt.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,d,h,y){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);d=d?d.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Qs.g(),this.g.onreadystatechange=m(c(this.Ca,this));try{this.B=!0,this.g.open(d,String(o),!0),this.B=!1}catch(O){Bv(this,O);return}if(o=h||"",h=new Map(this.headers),y)if(Object.getPrototypeOf(y)===Object.prototype)for(var k in y)h.set(k,y[k]);else if(typeof y.keys=="function"&&typeof y.get=="function")for(let O of y.keys())h.set(O,y.get(O));else throw Error("Unknown input type for opt_headers: "+String(y));y=Array.from(h.keys()).find(O=>O.toLowerCase()=="content-type"),k=i.FormData&&o instanceof i.FormData,!(Array.prototype.indexOf.call(Pk,d,void 0)>=0)||y||k||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[O,W]of h)this.g.setRequestHeader(O,W);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(O){Bv(this,O)}};function Bv(o,d){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=d,o.o=5,qv(o),yd(o)}function qv(o){o.A||(o.A=!0,we(o,"complete"),we(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,we(this,"complete"),we(this,"abort"),yd(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),yd(this,!0)),Tt.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?zv(this):this.Xa())},t.Xa=function(){zv(this)};function zv(o){if(o.h&&typeof s<"u"){if(o.v&&us(o)==4)setTimeout(o.Ca.bind(o),0);else if(we(o,"readystatechange"),us(o)==4){o.h=!1;try{let O=o.ca();e:switch(O){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var h;if(!(h=d)){var y;if(y=O===0){let W=String(o.D).match(ju)[1]||null;!W&&i.self&&i.self.location&&(W=i.self.location.protocol.slice(0,-1)),y=!Dk.test(W?W.toLowerCase():"")}h=y}if(h)we(o,"complete"),we(o,"success");else{o.o=6;try{var k=us(o)>2?o.g.statusText:""}catch{k=""}o.l=k+" ["+o.ca()+"]",qv(o)}}finally{yd(o)}}}}function yd(o,d){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let h=o.g;o.g=null,d||we(o,"ready");try{h.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function us(o){return o.g?o.g.readyState:0}t.ca=function(){try{return us(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var d=this.g.responseText;return o&&d.indexOf(o)==0&&(d=d.substring(o.length)),Kt(d)}};function Hv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Ok(o){let d={};o=(o.g&&us(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let y=0;y<o.length;y++){if(b(o[y]))continue;var h=Uu(o[y]);let k=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();let O=d[k]||[];d[k]=O,O.push(h)}Z(d,function(y){return y.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Yu(o,d,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||d}function Gv(o){this.za=0,this.i=[],this.j=new Ct,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Yu("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Yu("baseRetryDelayMs",5e3,o),this.Za=Yu("retryDelaySeedMs",1e4,o),this.Ta=Yu("forwardChannelMaxRetries",2,o),this.va=Yu("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new zu(o&&o.concurrentRequestLimit),this.Ba=new kk,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=Gv.prototype,t.ka=8,t.I=1,t.connect=function(o,d,h,y){ut(0),this.W=o,this.H=d||{},h&&y!==void 0&&(this.H.OSID=h,this.H.OAID=y),this.F=this.X,this.J=Zv(this,null,this.W),_d(this)};function sm(o){if(jv(o),o.I==3){var d=o.V++,h=Gn(o.J);if($e(h,"SID",o.M),$e(h,"RID",d),$e(h,"TYPE","terminate"),Qu(o,h),d=new oa(o,o.j,d),d.M=2,d.A=$s(Gn(h)),h=!1,i.navigator&&i.navigator.sendBeacon)try{h=i.navigator.sendBeacon(d.A.toString(),"")}catch{}!h&&i.Image&&(new Image().src=d.A,h=!0),h||(d.g=eE(d.j,null),d.g.ea(d.A)),d.F=Date.now(),Hn(d)}Jv(o)}function Id(o){o.g&&(om(o),o.g.cancel(),o.g=null)}function jv(o){Id(o),o.v&&(i.clearTimeout(o.v),o.v=null),Sd(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&i.clearTimeout(o.m),o.m=null)}function _d(o){if(!Hu(o.h)&&!o.m){o.m=!0;var d=o.Ea;B||g(),j||(B(),j=!0),_.add(d,o),o.D=0}}function Mk(o,d){return Oa(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=d.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=wn(c(o.Ea,o,d),$v(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let k=new oa(this,this.j,o),O=this.o;if(this.U&&(O?(O=Y(O),at(O,this.U)):O=this.U),this.u!==null||this.R||(k.J=O,O=null),this.S)e:{for(var d=0,h=0;h<this.i.length;h++){t:{var y=this.i[h];if("__data__"in y.map&&(y=y.map.__data__,typeof y=="string")){y=y.length;break t}y=void 0}if(y===void 0)break;if(d+=y,d>4096){d=h;break e}if(d===4096||h===this.i.length-1){d=h+1;break e}}d=1e3}else d=1e3;d=Wv(this,k,d),h=Gn(this.J),$e(h,"RID",o),$e(h,"CVER",22),this.G&&$e(h,"X-HTTP-Session-Id",this.G),Qu(this,h),O&&(this.R?d="headers="+cr(Uv(O))+"&"+d:this.u&&rm(h,this.u,O)),Ki(this.h,k),this.Ra&&$e(h,"TYPE","init"),this.S?($e(h,"$req",d),$e(h,"SID","null"),k.U=!0,Hi(k,h,null)):Hi(k,h,d),this.I=2}}else this.I==3&&(o?Kv(this,o):this.i.length==0||Hu(this.h)||Kv(this))};function Kv(o,d){var h;d?h=d.l:h=o.V++;let y=Gn(o.J);$e(y,"SID",o.M),$e(y,"RID",h),$e(y,"AID",o.K),Qu(o,y),o.u&&o.o&&rm(y,o.u,o.o),h=new oa(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),d&&(o.i=d.G.concat(o.i)),d=Wv(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Ki(o.h,h),Hi(h,y,d)}function Qu(o,d){o.H&&q(o.H,function(h,y){$e(d,y,h)}),o.l&&q({},function(h,y){$e(d,y,h)})}function Wv(o,d,h){h=Math.min(o.i.length,h);let y=o.l?c(o.l.Ka,o.l,o):null;e:{var k=o.i;let _e=-1;for(;;){let Wt=["count="+h];_e==-1?h>0?(_e=k[0].g,Wt.push("ofs="+_e)):_e=0:Wt.push("ofs="+_e);let tt=!0;for(let Jt=0;Jt<h;Jt++){var O=k[Jt].g;let Ma=k[Jt].map;if(O-=_e,O<0)_e=Math.max(0,k[Jt].g-100),tt=!1;else try{O="req"+O+"_"||"";try{var W=Ma instanceof Map?Ma:Object.entries(Ma);for(let[ei,ls]of W){let cs=ls;u(ls)&&(cs=ot(ls)),Wt.push(O+ei+"="+encodeURIComponent(cs))}}catch(ei){throw Wt.push(O+"type="+encodeURIComponent("_badmap")),ei}}catch{y&&y(Ma)}}if(tt){W=Wt.join("&");break e}}W=void 0}return o=o.i.splice(0,h),d.G=o,W}function Xv(o){if(!o.g&&!o.v){o.Y=1;var d=o.Da;B||g(),j||(B(),j=!0),_.add(d,o),o.A=0}}function im(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=wn(c(o.Da,o),$v(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,Yv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=wn(c(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,ut(10),Id(this),Yv(this))};function om(o){o.B!=null&&(i.clearTimeout(o.B),o.B=null)}function Yv(o){o.g=new oa(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var d=Gn(o.na);$e(d,"RID","rpc"),$e(d,"SID",o.M),$e(d,"AID",o.K),$e(d,"CI",o.F?"0":"1"),!o.F&&o.ia&&$e(d,"TO",o.ia),$e(d,"TYPE","xmlhttp"),Qu(o,d),o.u&&o.o&&rm(d,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=$s(Gn(d)),h.u=null,h.R=!0,dr(h,o)}t.Va=function(){this.C!=null&&(this.C=null,Id(this),im(this),ut(19))};function Sd(o){o.C!=null&&(i.clearTimeout(o.C),o.C=null)}function Qv(o,d){var h=null;if(o.g==d){Sd(o),om(o),o.g=null;var y=2}else if(ji(o.h,d))h=d.G,Gu(o.h,d),y=1;else return;if(o.I!=0){if(d.o)if(y==1){h=d.u?d.u.length:0,d=Date.now()-d.F;var k=o.D;y=Qe(),we(y,new ia(y,h)),_d(o)}else Xv(o);else if(k=d.m,k==3||k==0&&d.X>0||!(y==1&&Mk(o,d)||y==2&&im(o)))switch(h&&h.length>0&&(d=o.h,d.i=d.i.concat(h)),k){case 1:Zs(o,5);break;case 4:Zs(o,10);break;case 3:Zs(o,6);break;default:Zs(o,2)}}}function $v(o,d){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*d}function Zs(o,d){if(o.j.info("Error code "+d),d==2){var h=c(o.bb,o),y=o.Ua;let k=!y;y=new Ta(y||"//www.google.com/images/cleardot.gif"),i.location&&i.location.protocol=="http"||rs(y,"https"),$s(y),k?xk(y.toString(),h):Rk(y.toString(),h)}else ut(2);o.I=0,o.l&&o.l.pa(d),Jv(o),jv(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),ut(2)):(this.j.info("Failed to ping google.com"),ut(1))};function Jv(o){if(o.I=0,o.ja=[],o.l){let d=as(o.h);(d.length!=0||o.i.length!=0)&&(R(o.ja,d),R(o.ja,o.i),o.h.i.length=0,v(o.i),o.i.length=0),o.l.oa()}}function Zv(o,d,h){var y=h instanceof Ta?Gn(h):new Ta(h);if(y.g!="")d&&(y.g=d+"."+y.g),ss(y,y.u);else{var k=i.location;y=k.protocol,d=d?d+"."+k.hostname:k.hostname,k=+k.port;let O=new Ta(null);y&&rs(O,y),d&&(O.g=d),k&&ss(O,k),h&&(O.h=h),y=O}return h=o.G,d=o.wa,h&&d&&$e(y,h,d),$e(y,"VER",o.ka),Qu(o,y),y}function eE(o,d,h){if(d&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=o.Aa&&!o.ma?new Tt(new md({ab:h})):new Tt(o.ma),d.Fa(o.L),d}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function tE(){}t=tE.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function vd(){}vd.prototype.g=function(o,d){return new jn(o,d)};function jn(o,d){pe.call(this),this.g=new Gv(d),this.l=o,this.h=d&&d.messageUrlParams||null,o=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(o?o["X-WebChannel-Content-Type"]=d.messageContentType:o={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(o?o["X-WebChannel-Client-Profile"]=d.sa:o={"X-WebChannel-Client-Profile":d.sa}),this.g.U=o,(o=d&&d.Qb)&&!b(o)&&(this.g.u=o),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!b(d)&&(this.g.G=d,o=this.h,o!==null&&d in o&&(o=this.h,d in o&&delete o[d])),this.j=new Yi(this)}p(jn,pe),jn.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},jn.prototype.close=function(){sm(this.g)},jn.prototype.o=function(o){var d=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=ot(o),o=h);d.i.push(new dd(d.Ya++,o)),d.I==3&&_d(d)},jn.prototype.N=function(){this.g.l=null,delete this.j,sm(this.g),delete this.g,jn.Z.N.call(this)};function nE(o){bn.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var d=o.__sm__;if(d){e:{for(let h in d){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,d=d!==null&&o in d?d[o]:void 0),this.data=d}else this.data=o}p(nE,bn);function aE(){_n.call(this),this.status=1}p(aE,_n);function Yi(o){this.g=o}p(Yi,tE),Yi.prototype.ra=function(){we(this.g,"a")},Yi.prototype.qa=function(o){we(this.g,new nE(o))},Yi.prototype.pa=function(o){we(this.g,new aE)},Yi.prototype.oa=function(){we(this.g,"b")},vd.prototype.createWebChannel=vd.prototype.g,jn.prototype.send=jn.prototype.o,jn.prototype.open=jn.prototype.m,jn.prototype.close=jn.prototype.close,f_=Vr.createWebChannelTransport=function(){return new vd},d_=Vr.getStatEventTarget=function(){return Qe()},c_=Vr.Event=Ge,Kh=Vr.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},$r.NO_ERROR=0,$r.TIMEOUT=8,$r.HTTP_ERROR=6,_c=Vr.ErrorCode=$r,Jr.COMPLETE="complete",l_=Vr.EventType=Jr,Ea.EventType=ke,ke.OPEN="a",ke.CLOSE="b",ke.ERROR="c",ke.MESSAGE="d",pe.prototype.listen=pe.prototype.J,Jo=Vr.WebChannel=Ea,T2=Vr.FetchXmlHttpFactory=md,Tt.prototype.listenOnce=Tt.prototype.K,Tt.prototype.getLastError=Tt.prototype.Ha,Tt.prototype.getLastErrorCode=Tt.prototype.ya,Tt.prototype.getStatus=Tt.prototype.ca,Tt.prototype.getResponseJson=Tt.prototype.La,Tt.prototype.getResponseText=Tt.prototype.la,Tt.prototype.send=Tt.prototype.ea,Tt.prototype.setWithCredentials=Tt.prototype.Fa,u_=Vr.XhrIo=Tt}).apply(typeof jh<"u"?jh:typeof self<"u"?self:typeof window<"u"?window:{});var sn=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};sn.UNAUTHENTICATED=new sn(null),sn.GOOGLE_CREDENTIALS=new sn("google-credentials-uid"),sn.FIRST_PARTY=new sn("first-party-uid"),sn.MOCK_USER=new sn("mock-user");var vu="12.10.0";function $x(t){vu=t}var Ni=new Us("@firebase/firestore");function Zo(){return Ni.logLevel}function $(t,...e){if(Ni.logLevel<=Ee.DEBUG){let n=e.map(BS);Ni.debug(`Firestore (${vu}): ${t}`,...n)}}function Br(t,...e){if(Ni.logLevel<=Ee.ERROR){let n=e.map(BS);Ni.error(`Firestore (${vu}): ${t}`,...n)}}function qr(t,...e){if(Ni.logLevel<=Ee.WARN){let n=e.map(BS);Ni.warn(`Firestore (${vu}): ${t}`,...n)}}function BS(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}function le(t,e,n){let a="Unexpected state";typeof e=="string"?a=e:n=e,Jx(t,a,n)}function Jx(t,e,n){let a=`FIRESTORE (${vu}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{a+=" CONTEXT: "+JSON.stringify(n)}catch{a+=" CONTEXT: "+n}throw Br(a),new Error(a)}function _t(t,e,n,a){let r="Unexpected state";typeof n=="string"?r=n:a=n,t||Jx(e,r,a)}function Me(t,e){return t}var z={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},X=class extends xn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var Fr=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};var Jh=class{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Zh=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(sn.UNAUTHENTICATED))}shutdown(){}},__=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}},ep=class{constructor(e){this.t=e,this.currentUser=sn.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){_t(this.o===void 0,42304);let a=this.i,r=l=>this.i!==a?(a=this.i,n(l)):Promise.resolve(),s=new Fr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Fr,e.enqueueRetryable(()=>r(this.currentUser))};let i=()=>{let l=s;e.enqueueRetryable(async()=>{await l.promise,await r(this.currentUser)})},u=l=>{$("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){let l=this.t.getImmediate({optional:!0});l?u(l):($("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Fr)}},0),i()}getToken(){let e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(a=>this.i!==e?($("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):a?(_t(typeof a.accessToken=="string",31837,{l:a}),new Jh(a.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return _t(e===null||typeof e=="string",2055,{h:e}),new sn(e)}},S_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a,this.type="FirstParty",this.user=sn.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},v_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a}getToken(){return Promise.resolve(new S_(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(sn.FIRST_PARTY))}shutdown(){}invalidateToken(){}},tp=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},np=class{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Bn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){_t(this.o===void 0,3512);let a=s=>{s.error!=null&&$("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);let i=s.token!==this.m;return this.m=s.token,$("FirebaseAppCheckTokenProvider",`Received ${i?"new":"existing"} token.`),i?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>a(s))};let r=s=>{$("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>r(s)),setTimeout(()=>{if(!this.appCheck){let s=this.V.getImmediate({optional:!0});s?r(s):$("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new tp(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(_t(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new tp(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function b2(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let a=0;a<t;a++)n[a]=Math.floor(256*Math.random());return n}var ou=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516),a="";for(;a.length<20;){let r=b2(40);for(let s=0;s<r.length;++s)a.length<20&&r[s]<n&&(a+=e.charAt(r[s]%62))}return a}};function Re(t,e){return t<e?-1:t>e?1:0}function E_(t,e){let n=Math.min(t.length,e.length);for(let a=0;a<n;a++){let r=t.charAt(a),s=e.charAt(a);if(r!==s)return h_(r)===h_(s)?Re(r,s):h_(r)?1:-1}return Re(t.length,e.length)}var w2=55296,C2=57343;function h_(t){let e=t.charCodeAt(0);return e>=w2&&e<=C2}function uu(t,e,n){return t.length===e.length&&t.every((a,r)=>n(a,e[r]))}var fx="__name__",ap=class t{constructor(e,n,a){n===void 0?n=0:n>e.length&&le(637,{offset:n,range:e.length}),a===void 0?a=e.length-n:a>e.length-n&&le(1746,{length:a,range:e.length-n}),this.segments=e,this.offset=n,this.len=a}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let n=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(a=>{n.push(a)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,a=this.limit();n<a;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){let a=Math.min(e.length,n.length);for(let r=0;r<a;r++){let s=t.compareSegments(e.get(r),n.get(r));if(s!==0)return s}return Re(e.length,n.length)}static compareSegments(e,n){let a=t.isNumericId(e),r=t.isNumericId(n);return a&&!r?-1:!a&&r?1:a&&r?t.extractNumericId(e).compare(t.extractNumericId(n)):E_(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Nr.fromString(e.substring(4,e.length-2))}},It=class t extends ap{construct(e,n,a){return new t(e,n,a)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let n=[];for(let a of e){if(a.indexOf("//")>=0)throw new X(z.INVALID_ARGUMENT,`Invalid segment (${a}). Paths must not contain // in them.`);n.push(...a.split("/").filter(r=>r.length>0))}return new t(n)}static emptyPath(){return new t([])}},L2=/^[_a-zA-Z][_a-zA-Z0-9]*$/,aa=class t extends ap{construct(e,n,a){return new t(e,n,a)}static isValidIdentifier(e){return L2.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===fx}static keyField(){return new t([fx])}static fromServerFormat(e){let n=[],a="",r=0,s=()=>{if(a.length===0)throw new X(z.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(a),a=""},i=!1;for(;r<e.length;){let u=e[r];if(u==="\\"){if(r+1===e.length)throw new X(z.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new X(z.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);a+=l,r+=2}else u==="`"?(i=!i,r++):u!=="."||i?(a+=u,r++):(s(),r++)}if(s(),i)throw new X(z.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(n)}static emptyPath(){return new t([])}};var te=class t{constructor(e){this.path=e}static fromPath(e){return new t(It.fromString(e))}static fromName(e){return new t(It.fromString(e).popFirst(5))}static empty(){return new t(It.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&It.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return It.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new It(e.slice()))}};function A2(t,e,n){if(!n)throw new X(z.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function Zx(t,e,n,a){if(e===!0&&a===!0)throw new X(z.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function hx(t){if(te.isDocumentKey(t))throw new X(z.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function e0(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function Hc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(a){return a.constructor?a.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":le(12329,{type:typeof t})}function Gc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new X(z.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let n=Hc(t);throw new X(z.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function t0(t,e){if(e<=0)throw new X(z.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function Rt(t,e){let n={typeString:t};return e&&(n.value=e),n}function Eu(t,e){if(!e0(t))throw new X(z.INVALID_ARGUMENT,"JSON must be an object");let n;for(let a in e)if(e[a]){let r=e[a].typeString,s="value"in e[a]?{value:e[a].value}:void 0;if(!(a in t)){n=`JSON missing required field: '${a}'`;break}let i=t[a];if(r&&typeof i!==r){n=`JSON field '${a}' must be a ${r}.`;break}if(s!==void 0&&i!==s.value){n=`Expected '${a}' field to equal '${s.value}'`;break}}if(n)throw new X(z.INVALID_ARGUMENT,n);return!0}var px=-62135596800,mx=1e6,Bt=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let n=Math.floor(e/1e3),a=Math.floor((e-1e3*n)*mx);return new t(n,a)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new X(z.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new X(z.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<px)throw new X(z.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new X(z.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/mx}_compareTo(e){return this.seconds===e.seconds?Re(this.nanoseconds,e.nanoseconds):Re(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Eu(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-px;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};Bt._jsonSchemaVersion="firestore/timestamp/1.0",Bt._jsonSchema={type:Rt("string",Bt._jsonSchemaVersion),seconds:Rt("number"),nanoseconds:Rt("number")};var ge=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new Bt(0,0))}static max(){return new t(new Bt(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var wc=-1,rp=class{constructor(e,n,a,r){this.indexId=e,this.collectionGroup=n,this.fields=a,this.indexState=r}};rp.UNKNOWN_ID=-1;function x2(t,e){let n=t.toTimestamp().seconds,a=t.toTimestamp().nanoseconds+1,r=ge.fromTimestamp(a===1e9?new Bt(n+1,0):new Bt(n,a));return new Vi(r,te.empty(),e)}function R2(t){return new Vi(t.readTime,t.key,wc)}var Vi=class t{constructor(e,n,a){this.readTime=e,this.documentKey=n,this.largestBatchId=a}static min(){return new t(ge.min(),te.empty(),wc)}static max(){return new t(ge.max(),te.empty(),wc)}};function k2(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=te.comparator(t.documentKey,e.documentKey),n!==0?n:Re(t.largestBatchId,e.largestBatchId))}var D2="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",T_=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function xp(t){if(t.code!==z.FAILED_PRECONDITION||t.message!==D2)throw t;$("LocalStore","Unexpectedly lost primary lease")}var H=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&le(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new t((a,r)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(a,r)},this.catchCallback=s=>{this.wrapFailure(n,s).next(a,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{let n=e();return n instanceof t?n:t.resolve(n)}catch(n){return t.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):t.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):t.reject(n)}static resolve(e){return new t((n,a)=>{n(e)})}static reject(e){return new t((n,a)=>{a(e)})}static waitFor(e){return new t((n,a)=>{let r=0,s=0,i=!1;e.forEach(u=>{++r,u.next(()=>{++s,i&&s===r&&n()},l=>a(l))}),i=!0,s===r&&n()})}static or(e){let n=t.resolve(!1);for(let a of e)n=n.next(r=>r?t.resolve(r):a());return n}static forEach(e,n){let a=[];return e.forEach((r,s)=>{a.push(n.call(this,r,s))}),this.waitFor(a)}static mapArray(e,n){return new t((a,r)=>{let s=e.length,i=new Array(s),u=0;for(let l=0;l<s;l++){let c=l;n(e[c]).next(f=>{i[c]=f,++u,u===s&&a(i)},f=>r(f))}})}static doWhile(e,n){return new t((a,r)=>{let s=()=>{e()===!0?n().next(()=>{s()},r):a()};s()})}};function P2(t){let e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Tu(t){return t.name==="IndexedDbTransactionError"}var lu=class{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=a=>this.ae(a),this.ue=a=>n.writeSequenceNumber(a))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};lu.ce=-1;var O2=-1;function Rp(t){return t==null}function Cc(t){return t===0&&1/t==-1/0}function M2(t){return typeof t=="number"&&Number.isInteger(t)&&!Cc(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var n0="";function N2(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=gx(e)),e=V2(t.get(n),e);return gx(e)}function V2(t,e){let n=e,a=t.length;for(let r=0;r<a;r++){let s=t.charAt(r);switch(s){case"\0":n+="";break;case n0:n+="";break;default:n+=s}}return n}function gx(t){return t+n0+""}var F2="remoteDocuments",a0="owner";var r0="mutationQueues";var s0="mutations";var i0="documentMutations",U2="remoteDocumentsV14";var o0="remoteDocumentGlobal";var u0="targets";var l0="targetDocuments";var c0="targetGlobal",d0="collectionParents";var f0="clientMetadata";var h0="bundles";var p0="namedQueries";var B2="indexConfiguration";var q2="indexState";var z2="indexEntries";var m0="documentOverlays";var H2="globals";var G2=[r0,s0,i0,F2,u0,a0,c0,l0,f0,o0,d0,h0,p0],S4=[...G2,m0],j2=[r0,s0,i0,U2,u0,a0,c0,l0,f0,o0,d0,h0,p0,m0],K2=j2,W2=[...K2,B2,q2,z2];var v4=[...W2,H2];function yx(t){let e=0;for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function bu(t,e){for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function g0(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var kt=class t{constructor(e,n){this.comparator=e,this.root=n||Ja.EMPTY}insert(e,n){return new t(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Ja.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ja.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){let a=this.comparator(e,n.key);if(a===0)return n.value;a<0?n=n.left:a>0&&(n=n.right)}return null}indexOf(e){let n=0,a=this.root;for(;!a.isEmpty();){let r=this.comparator(e,a.key);if(r===0)return n+a.left.size;r<0?a=a.left:(n+=a.left.size+1,a=a.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,a)=>(e(n,a),!1))}toString(){let e=[];return this.inorderTraversal((n,a)=>(e.push(`${n}:${a}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new au(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new au(this.root,e,this.comparator,!1)}getReverseIterator(){return new au(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new au(this.root,e,this.comparator,!0)}},au=class{constructor(e,n,a,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?a(e.key,n):1,n&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},Ja=class t{constructor(e,n,a,r,s){this.key=e,this.value=n,this.color=a??t.RED,this.left=r??t.EMPTY,this.right=s??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,a,r,s){return new t(e??this.key,n??this.value,a??this.color,r??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,a){let r=this,s=a(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,n,a),null):s===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,a)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let a,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;a=r.right.min(),r=r.copy(a.key,a.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw le(43730,{key:this.key,value:this.value});if(this.right.isRed())throw le(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw le(27949);return e+(this.isRed()?0:1)}};Ja.EMPTY=null,Ja.RED=!0,Ja.BLACK=!1;Ja.EMPTY=new class{constructor(){this.size=0}get key(){throw le(57766)}get value(){throw le(16141)}get color(){throw le(16727)}get left(){throw le(29726)}get right(){throw le(36894)}copy(e,n,a,r,s){return this}insert(e,n,a){return new Ja(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var on=class t{constructor(e){this.comparator=e,this.data=new kt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,a)=>(e(n),!1))}forEachInRange(e,n){let a=this.data.getIteratorFrom(e[0]);for(;a.hasNext();){let r=a.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let a;for(a=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();a.hasNext();)if(!e(a.getNext().key))return}firstAfterOrEqual(e){let n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new sp(this.data.getIterator())}getIteratorFrom(e){return new sp(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(a=>{n=n.add(a)}),n}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.data.getIterator(),a=e.data.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(this.comparator(r,s)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(n=>{e.push(n)}),e}toString(){let e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){let n=new t(this.comparator);return n.data=e,n}},sp=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var ki=class t{constructor(e){this.fields=e,e.sort(aa.comparator)}static empty(){return new t([])}unionWith(e){let n=new on(aa.comparator);for(let a of this.fields)n=n.add(a);for(let a of e)n=n.add(a);return new t(n.toArray())}covers(e){for(let n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return uu(this.fields,e.fields,(n,a)=>n.isEqual(a))}};var ip=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var gn=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let n=function(r){try{return atob(r)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new ip("Invalid base64 string: "+s):s}}(e);return new t(n)}static fromUint8Array(e){let n=function(r){let s="";for(let i=0;i<r.length;++i)s+=String.fromCharCode(r[i]);return s}(e);return new t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Re(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};gn.EMPTY_BYTE_STRING=new gn("");var X2=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function zr(t){if(_t(!!t,39018),typeof t=="string"){let e=0,n=X2.exec(t);if(_t(!!n,46558,{timestamp:t}),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}let a=new Date(t);return{seconds:Math.floor(a.getTime()/1e3),nanos:e}}return{seconds:yt(t.seconds),nanos:yt(t.nanos)}}function yt(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Hr(t){return typeof t=="string"?gn.fromBase64String(t):gn.fromUint8Array(t)}var y0="server_timestamp",I0="__type__",_0="__previous_value__",S0="__local_write_time__";function jc(t){return(t?.mapValue?.fields||{})[I0]?.stringValue===y0}function kp(t){let e=t.mapValue.fields[_0];return jc(e)?kp(e):e}function Lc(t){let e=zr(t.mapValue.fields[S0].timestampValue);return new Bt(e.seconds,e.nanos)}var b_=class{constructor(e,n,a,r,s,i,u,l,c,f,p){this.databaseId=e,this.appId=n,this.persistenceKey=a,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=c,this.isUsingEmulator=f,this.apiKey=p}},op="(default)",Ac=class t{constructor(e,n){this.projectId=e,this.database=n||op}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===op}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function v0(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new X(z.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ac(t.options.projectId,e)}var qS="__type__",E0="__max__",Wh={mapValue:{fields:{__type__:{stringValue:E0}}}},zS="__vector__",cu="value";function Hs(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?jc(t)?4:b0(t)?9007199254740991:T0(t)?10:11:le(28295,{value:t})}function nr(t,e){if(t===e)return!0;let n=Hs(t);if(n!==Hs(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Lc(t).isEqual(Lc(e));case 3:return function(r,s){if(typeof r.timestampValue=="string"&&typeof s.timestampValue=="string"&&r.timestampValue.length===s.timestampValue.length)return r.timestampValue===s.timestampValue;let i=zr(r.timestampValue),u=zr(s.timestampValue);return i.seconds===u.seconds&&i.nanos===u.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,s){return Hr(r.bytesValue).isEqual(Hr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,s){return yt(r.geoPointValue.latitude)===yt(s.geoPointValue.latitude)&&yt(r.geoPointValue.longitude)===yt(s.geoPointValue.longitude)}(t,e);case 2:return function(r,s){if("integerValue"in r&&"integerValue"in s)return yt(r.integerValue)===yt(s.integerValue);if("doubleValue"in r&&"doubleValue"in s){let i=yt(r.doubleValue),u=yt(s.doubleValue);return i===u?Cc(i)===Cc(u):isNaN(i)&&isNaN(u)}return!1}(t,e);case 9:return uu(t.arrayValue.values||[],e.arrayValue.values||[],nr);case 10:case 11:return function(r,s){let i=r.mapValue.fields||{},u=s.mapValue.fields||{};if(yx(i)!==yx(u))return!1;for(let l in i)if(i.hasOwnProperty(l)&&(u[l]===void 0||!nr(i[l],u[l])))return!1;return!0}(t,e);default:return le(52216,{left:t})}}function xc(t,e){return(t.values||[]).find(n=>nr(n,e))!==void 0}function du(t,e){if(t===e)return 0;let n=Hs(t),a=Hs(e);if(n!==a)return Re(n,a);switch(n){case 0:case 9007199254740991:return 0;case 1:return Re(t.booleanValue,e.booleanValue);case 2:return function(s,i){let u=yt(s.integerValue||s.doubleValue),l=yt(i.integerValue||i.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(t,e);case 3:return Ix(t.timestampValue,e.timestampValue);case 4:return Ix(Lc(t),Lc(e));case 5:return E_(t.stringValue,e.stringValue);case 6:return function(s,i){let u=Hr(s),l=Hr(i);return u.compareTo(l)}(t.bytesValue,e.bytesValue);case 7:return function(s,i){let u=s.split("/"),l=i.split("/");for(let c=0;c<u.length&&c<l.length;c++){let f=Re(u[c],l[c]);if(f!==0)return f}return Re(u.length,l.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,i){let u=Re(yt(s.latitude),yt(i.latitude));return u!==0?u:Re(yt(s.longitude),yt(i.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return _x(t.arrayValue,e.arrayValue);case 10:return function(s,i){let u=s.fields||{},l=i.fields||{},c=u[cu]?.arrayValue,f=l[cu]?.arrayValue,p=Re(c?.values?.length||0,f?.values?.length||0);return p!==0?p:_x(c,f)}(t.mapValue,e.mapValue);case 11:return function(s,i){if(s===Wh.mapValue&&i===Wh.mapValue)return 0;if(s===Wh.mapValue)return 1;if(i===Wh.mapValue)return-1;let u=s.fields||{},l=Object.keys(u),c=i.fields||{},f=Object.keys(c);l.sort(),f.sort();for(let p=0;p<l.length&&p<f.length;++p){let m=E_(l[p],f[p]);if(m!==0)return m;let v=du(u[l[p]],c[f[p]]);if(v!==0)return v}return Re(l.length,f.length)}(t.mapValue,e.mapValue);default:throw le(23264,{he:n})}}function Ix(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Re(t,e);let n=zr(t),a=zr(e),r=Re(n.seconds,a.seconds);return r!==0?r:Re(n.nanos,a.nanos)}function _x(t,e){let n=t.values||[],a=e.values||[];for(let r=0;r<n.length&&r<a.length;++r){let s=du(n[r],a[r]);if(s)return s}return Re(n.length,a.length)}function fu(t){return w_(t)}function w_(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){let a=zr(n);return`time(${a.seconds},${a.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Hr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return te.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let a="[",r=!0;for(let s of n.values||[])r?r=!1:a+=",",a+=w_(s);return a+"]"}(t.arrayValue):"mapValue"in t?function(n){let a=Object.keys(n.fields||{}).sort(),r="{",s=!0;for(let i of a)s?s=!1:r+=",",r+=`${i}:${w_(n.fields[i])}`;return r+"}"}(t.mapValue):le(61005,{value:t})}function Qh(t){switch(Hs(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=kp(t);return e?16+Qh(e):16;case 5:return 2*t.stringValue.length;case 6:return Hr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(a){return(a.values||[]).reduce((r,s)=>r+Qh(s),0)}(t.arrayValue);case 10:case 11:return function(a){let r=0;return bu(a.fields,(s,i)=>{r+=s.length+Qh(i)}),r}(t.mapValue);default:throw le(13486,{value:t})}}function Kc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function C_(t){return!!t&&"integerValue"in t}function HS(t){return!!t&&"arrayValue"in t}function Sx(t){return!!t&&"nullValue"in t}function vx(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function p_(t){return!!t&&"mapValue"in t}function T0(t){return(t?.mapValue?.fields||{})[qS]?.stringValue===zS}function Ec(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return bu(t.mapValue.fields,(n,a)=>e.mapValue.fields[n]=Ec(a)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Ec(t.arrayValue.values[n]);return e}return{...t}}function b0(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===E0}var T4={mapValue:{fields:{[qS]:{stringValue:zS},[cu]:{arrayValue:{}}}}};var $a=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let a=0;a<e.length-1;++a)if(n=(n.mapValue.fields||{})[e.get(a)],!p_(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ec(n)}setAll(e){let n=aa.emptyPath(),a={},r=[];e.forEach((i,u)=>{if(!n.isImmediateParentOf(u)){let l=this.getFieldsMap(n);this.applyChanges(l,a,r),a={},r=[],n=u.popLast()}i?a[u.lastSegment()]=Ec(i):r.push(u.lastSegment())});let s=this.getFieldsMap(n);this.applyChanges(s,a,r)}delete(e){let n=this.field(e.popLast());p_(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return nr(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let a=0;a<e.length;++a){let r=n.mapValue.fields[e.get(a)];p_(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(a)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,a){bu(n,(r,s)=>e[r]=s);for(let r of a)delete e[r]}clone(){return new t(Ec(this.value))}};var xa=class t{constructor(e,n,a,r,s,i,u){this.key=e,this.documentType=n,this.version=a,this.readTime=r,this.createTime=s,this.data=i,this.documentState=u}static newInvalidDocument(e){return new t(e,0,ge.min(),ge.min(),ge.min(),$a.empty(),0)}static newFoundDocument(e,n,a,r){return new t(e,1,n,ge.min(),a,r,0)}static newNoDocument(e,n){return new t(e,2,n,ge.min(),ge.min(),$a.empty(),0)}static newUnknownDocument(e,n){return new t(e,3,n,ge.min(),ge.min(),$a.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(ge.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=$a.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=$a.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=ge.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var Gr=class{constructor(e,n){this.position=e,this.inclusive=n}};function Ex(t,e,n){let a=0;for(let r=0;r<t.position.length;r++){let s=e[r],i=t.position[r];if(s.field.isKeyField()?a=te.comparator(te.fromName(i.referenceValue),n.key):a=du(i,n.data.field(s.field)),s.dir==="desc"&&(a*=-1),a!==0)break}return a}function Tx(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!nr(t.position[n],e.position[n]))return!1;return!0}var Gs=class{constructor(e,n="asc"){this.field=e,this.dir=n}};function Y2(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var up=class{},xt=class t extends up{constructor(e,n,a){super(),this.field=e,this.op=n,this.value=a}static create(e,n,a){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,a):new A_(e,n,a):n==="array-contains"?new k_(e,a):n==="in"?new D_(e,a):n==="not-in"?new P_(e,a):n==="array-contains-any"?new O_(e,a):new t(e,n,a)}static createKeyFieldInFilter(e,n,a){return n==="in"?new x_(e,a):new R_(e,a)}matches(e){let n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(du(n,this.value)):n!==null&&Hs(this.value)===Hs(n)&&this.matchesComparison(du(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return le(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},va=class t extends up{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new t(e,n)}matches(e){return w0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function w0(t){return t.op==="and"}function C0(t){return Q2(t)&&w0(t)}function Q2(t){for(let e of t.filters)if(e instanceof va)return!1;return!0}function L_(t){if(t instanceof xt)return t.field.canonicalString()+t.op.toString()+fu(t.value);if(C0(t))return t.filters.map(e=>L_(e)).join(",");{let e=t.filters.map(n=>L_(n)).join(",");return`${t.op}(${e})`}}function L0(t,e){return t instanceof xt?function(a,r){return r instanceof xt&&a.op===r.op&&a.field.isEqual(r.field)&&nr(a.value,r.value)}(t,e):t instanceof va?function(a,r){return r instanceof va&&a.op===r.op&&a.filters.length===r.filters.length?a.filters.reduce((s,i,u)=>s&&L0(i,r.filters[u]),!0):!1}(t,e):void le(19439)}function A0(t){return t instanceof xt?function(n){return`${n.field.canonicalString()} ${n.op} ${fu(n.value)}`}(t):t instanceof va?function(n){return n.op.toString()+" {"+n.getFilters().map(A0).join(" ,")+"}"}(t):"Filter"}var A_=class extends xt{constructor(e,n,a){super(e,n,a),this.key=te.fromName(a.referenceValue)}matches(e){let n=te.comparator(e.key,this.key);return this.matchesComparison(n)}},x_=class extends xt{constructor(e,n){super(e,"in",n),this.keys=x0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}},R_=class extends xt{constructor(e,n){super(e,"not-in",n),this.keys=x0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}};function x0(t,e){return(e.arrayValue?.values||[]).map(n=>te.fromName(n.referenceValue))}var k_=class extends xt{constructor(e,n){super(e,"array-contains",n)}matches(e){let n=e.data.field(this.field);return HS(n)&&xc(n.arrayValue,this.value)}},D_=class extends xt{constructor(e,n){super(e,"in",n)}matches(e){let n=e.data.field(this.field);return n!==null&&xc(this.value.arrayValue,n)}},P_=class extends xt{constructor(e,n){super(e,"not-in",n)}matches(e){if(xc(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!xc(this.value.arrayValue,n)}},O_=class extends xt{constructor(e,n){super(e,"array-contains-any",n)}matches(e){let n=e.data.field(this.field);return!(!HS(n)||!n.arrayValue.values)&&n.arrayValue.values.some(a=>xc(this.value.arrayValue,a))}};var M_=class{constructor(e,n=null,a=[],r=[],s=null,i=null,u=null){this.path=e,this.collectionGroup=n,this.orderBy=a,this.filters=r,this.limit=s,this.startAt=i,this.endAt=u,this.Te=null}};function bx(t,e=null,n=[],a=[],r=null,s=null,i=null){return new M_(t,e,n,a,r,s,i)}function GS(t){let e=Me(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(a=>L_(a)).join(","),n+="|ob:",n+=e.orderBy.map(a=>function(s){return s.field.canonicalString()+s.dir}(a)).join(","),Rp(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(a=>fu(a)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(a=>fu(a)).join(",")),e.Te=n}return e.Te}function jS(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!Y2(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!L0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Tx(t.startAt,e.startAt)&&Tx(t.endAt,e.endAt)}function N_(t){return te.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var jr=class{constructor(e,n=null,a=[],r=[],s=null,i="F",u=null,l=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=a,this.filters=r,this.limit=s,this.limitType=i,this.startAt=u,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function $2(t,e,n,a,r,s,i,u){return new jr(t,e,n,a,r,s,i,u)}function KS(t){return new jr(t)}function wx(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function J2(t){return te.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function Dp(t){return t.collectionGroup!==null}function Oi(t){let e=Me(t);if(e.Ie===null){e.Ie=[];let n=new Set;for(let s of e.explicitOrderBy)e.Ie.push(s),n.add(s.field.canonicalString());let a=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(i){let u=new on(aa.comparator);return i.filters.forEach(l=>{l.getFlattenedFilters().forEach(c=>{c.isInequality()&&(u=u.add(c.field))})}),u})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new Gs(s,a))}),n.has(aa.keyField().canonicalString())||e.Ie.push(new Gs(aa.keyField(),a))}return e.Ie}function Za(t){let e=Me(t);return e.Ee||(e.Ee=Z2(e,Oi(t))),e.Ee}function Z2(t,e){if(t.limitType==="F")return bx(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let s=r.dir==="desc"?"asc":"desc";return new Gs(r.field,s)});let n=t.endAt?new Gr(t.endAt.position,t.endAt.inclusive):null,a=t.startAt?new Gr(t.startAt.position,t.startAt.inclusive):null;return bx(t.path,t.collectionGroup,e,t.filters,t.limit,n,a)}}function Pp(t,e){let n=t.filters.concat([e]);return new jr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function R0(t,e){let n=t.explicitOrderBy.concat([e]);return new jr(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function Rc(t,e,n){return new jr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function k0(t,e){return new jr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function Op(t,e){return jS(Za(t),Za(e))&&t.limitType===e.limitType}function D0(t){return`${GS(Za(t))}|lt:${t.limitType}`}function eu(t){return`Query(target=${function(n){let a=n.path.canonicalString();return n.collectionGroup!==null&&(a+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(a+=`, filters: [${n.filters.map(r=>A0(r)).join(", ")}]`),Rp(n.limit)||(a+=", limit: "+n.limit),n.orderBy.length>0&&(a+=`, orderBy: [${n.orderBy.map(r=>function(i){return`${i.field.canonicalString()} (${i.dir})`}(r)).join(", ")}]`),n.startAt&&(a+=", startAt: ",a+=n.startAt.inclusive?"b:":"a:",a+=n.startAt.position.map(r=>fu(r)).join(",")),n.endAt&&(a+=", endAt: ",a+=n.endAt.inclusive?"a:":"b:",a+=n.endAt.position.map(r=>fu(r)).join(",")),`Target(${a})`}(Za(t))}; limitType=${t.limitType})`}function Mp(t,e){return e.isFoundDocument()&&function(a,r){let s=r.key.path;return a.collectionGroup!==null?r.key.hasCollectionId(a.collectionGroup)&&a.path.isPrefixOf(s):te.isDocumentKey(a.path)?a.path.isEqual(s):a.path.isImmediateParentOf(s)}(t,e)&&function(a,r){for(let s of Oi(a))if(!s.field.isKeyField()&&r.data.field(s.field)===null)return!1;return!0}(t,e)&&function(a,r){for(let s of a.filters)if(!s.matches(r))return!1;return!0}(t,e)&&function(a,r){return!(a.startAt&&!function(i,u,l){let c=Ex(i,u,l);return i.inclusive?c<=0:c<0}(a.startAt,Oi(a),r)||a.endAt&&!function(i,u,l){let c=Ex(i,u,l);return i.inclusive?c>=0:c>0}(a.endAt,Oi(a),r))}(t,e)}function eV(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function P0(t){return(e,n)=>{let a=!1;for(let r of Oi(t)){let s=tV(r,e,n);if(s!==0)return s;a=a||r.field.isKeyField()}return 0}}function tV(t,e,n){let a=t.field.isKeyField()?te.comparator(e.key,n.key):function(s,i,u){let l=i.data.field(s),c=u.data.field(s);return l!==null&&c!==null?du(l,c):le(42886)}(t.field,e,n);switch(t.dir){case"asc":return a;case"desc":return-1*a;default:return le(19790,{direction:t.dir})}}var Kr=class{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a!==void 0){for(let[r,s]of a)if(this.equalsFn(r,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){let a=this.mapKeyFn(e),r=this.inner[a];if(r===void 0)return this.inner[a]=[[e,n]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a===void 0)return!1;for(let r=0;r<a.length;r++)if(this.equalsFn(a[r][0],e))return a.length===1?delete this.inner[n]:a.splice(r,1),this.innerSize--,!0;return!1}forEach(e){bu(this.inner,(n,a)=>{for(let[r,s]of a)e(r,s)})}isEmpty(){return g0(this.inner)}size(){return this.innerSize}};var nV=new kt(te.comparator);function js(){return nV}var O0=new kt(te.comparator);function vc(...t){let e=O0;for(let n of t)e=e.insert(n.key,n);return e}function aV(t){let e=O0;return t.forEach((n,a)=>e=e.insert(n,a.overlayedDocument)),e}function Di(){return Tc()}function M0(){return Tc()}function Tc(){return new Kr(t=>t.toString(),(t,e)=>t.isEqual(e))}var b4=new kt(te.comparator),rV=new on(te.comparator);function Oe(...t){let e=rV;for(let n of t)e=e.add(n);return e}var sV=new on(Re);function iV(){return sV}function WS(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Cc(e)?"-0":e}}function N0(t){return{integerValue:""+t}}function oV(t,e){return M2(e)?N0(e):WS(t,e)}var hu=class{constructor(){this._=void 0}};function uV(t,e,n){return t instanceof kc?function(r,s){let i={fields:{[I0]:{stringValue:y0},[S0]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return s&&jc(s)&&(s=kp(s)),s&&(i.fields[_0]=s),{mapValue:i}}(n,e):t instanceof pu?V0(t,e):t instanceof mu?F0(t,e):function(r,s){let i=cV(r,s),u=Cx(i)+Cx(r.Ae);return C_(i)&&C_(r.Ae)?N0(u):WS(r.serializer,u)}(t,e)}function lV(t,e,n){return t instanceof pu?V0(t,e):t instanceof mu?F0(t,e):n}function cV(t,e){return t instanceof Dc?function(a){return C_(a)||function(s){return!!s&&"doubleValue"in s}(a)}(e)?e:{integerValue:0}:null}var kc=class extends hu{},pu=class extends hu{constructor(e){super(),this.elements=e}};function V0(t,e){let n=U0(e);for(let a of t.elements)n.some(r=>nr(r,a))||n.push(a);return{arrayValue:{values:n}}}var mu=class extends hu{constructor(e){super(),this.elements=e}};function F0(t,e){let n=U0(e);for(let a of t.elements)n=n.filter(r=>!nr(r,a));return{arrayValue:{values:n}}}var Dc=class extends hu{constructor(e,n){super(),this.serializer=e,this.Ae=n}};function Cx(t){return yt(t.integerValue||t.doubleValue)}function U0(t){return HS(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function dV(t,e){return t.field.isEqual(e.field)&&function(a,r){return a instanceof pu&&r instanceof pu||a instanceof mu&&r instanceof mu?uu(a.elements,r.elements,nr):a instanceof Dc&&r instanceof Dc?nr(a.Ae,r.Ae):a instanceof kc&&r instanceof kc}(t.transform,e.transform)}var ru=class t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function $h(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var Pc=class{};function B0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new lp(t.key,ru.none()):new Oc(t.key,t.data,ru.none());{let n=t.data,a=$a.empty(),r=new on(aa.comparator);for(let s of e.fields)if(!r.has(s)){let i=n.field(s);i===null&&s.length>1&&(s=s.popLast(),i=n.field(s)),i===null?a.delete(s):a.set(s,i),r=r.add(s)}return new gu(t.key,a,new ki(r.toArray()),ru.none())}}function fV(t,e,n){t instanceof Oc?function(r,s,i){let u=r.value.clone(),l=Ax(r.fieldTransforms,s,i.transformResults);u.setAll(l),s.convertToFoundDocument(i.version,u).setHasCommittedMutations()}(t,e,n):t instanceof gu?function(r,s,i){if(!$h(r.precondition,s))return void s.convertToUnknownDocument(i.version);let u=Ax(r.fieldTransforms,s,i.transformResults),l=s.data;l.setAll(q0(r)),l.setAll(u),s.convertToFoundDocument(i.version,l).setHasCommittedMutations()}(t,e,n):function(r,s,i){s.convertToNoDocument(i.version).setHasCommittedMutations()}(0,e,n)}function bc(t,e,n,a){return t instanceof Oc?function(s,i,u,l){if(!$h(s.precondition,i))return u;let c=s.value.clone(),f=xx(s.fieldTransforms,l,i);return c.setAll(f),i.convertToFoundDocument(i.version,c).setHasLocalMutations(),null}(t,e,n,a):t instanceof gu?function(s,i,u,l){if(!$h(s.precondition,i))return u;let c=xx(s.fieldTransforms,l,i),f=i.data;return f.setAll(q0(s)),f.setAll(c),i.convertToFoundDocument(i.version,f).setHasLocalMutations(),u===null?null:u.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,a):function(s,i,u){return $h(s.precondition,i)?(i.convertToNoDocument(i.version).setHasLocalMutations(),null):u}(t,e,n)}function Lx(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(a,r){return a===void 0&&r===void 0||!(!a||!r)&&uu(a,r,(s,i)=>dV(s,i))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var Oc=class extends Pc{constructor(e,n,a,r=[]){super(),this.key=e,this.value=n,this.precondition=a,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},gu=class extends Pc{constructor(e,n,a,r,s=[]){super(),this.key=e,this.data=n,this.fieldMask=a,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}};function q0(t){let e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){let a=t.data.field(n);e.set(n,a)}}),e}function Ax(t,e,n){let a=new Map;_t(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let r=0;r<n.length;r++){let s=t[r],i=s.transform,u=e.data.field(s.field);a.set(s.field,lV(i,u,n[r]))}return a}function xx(t,e,n){let a=new Map;for(let r of t){let s=r.transform,i=n.data.field(r.field);a.set(r.field,uV(s,i,e))}return a}var lp=class extends Pc{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var V_=class{constructor(e,n,a,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=a,this.mutations=r}applyToRemoteDocument(e,n){let a=n.mutationResults;for(let r=0;r<this.mutations.length;r++){let s=this.mutations[r];s.key.isEqual(e.key)&&fV(s,e,a[r])}}applyToLocalView(e,n){for(let a of this.baseMutations)a.key.isEqual(e.key)&&(n=bc(a,e,n,this.localWriteTime));for(let a of this.mutations)a.key.isEqual(e.key)&&(n=bc(a,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){let a=M0();return this.mutations.forEach(r=>{let s=e.get(r.key),i=s.overlayedDocument,u=this.applyToLocalView(i,s.mutatedFields);u=n.has(r.key)?null:u;let l=B0(i,u);l!==null&&a.set(r.key,l),i.isValidDocument()||i.convertToNoDocument(ge.min())}),a}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),Oe())}isEqual(e){return this.batchId===e.batchId&&uu(this.mutations,e.mutations,(n,a)=>Lx(n,a))&&uu(this.baseMutations,e.baseMutations,(n,a)=>Lx(n,a))}};var F_=class{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var U_=class{constructor(e,n){this.count=e,this.unchangedNames=n}};var Ft,Pe;function z0(t){if(t===void 0)return Br("GRPC error has no .code"),z.UNKNOWN;switch(t){case Ft.OK:return z.OK;case Ft.CANCELLED:return z.CANCELLED;case Ft.UNKNOWN:return z.UNKNOWN;case Ft.DEADLINE_EXCEEDED:return z.DEADLINE_EXCEEDED;case Ft.RESOURCE_EXHAUSTED:return z.RESOURCE_EXHAUSTED;case Ft.INTERNAL:return z.INTERNAL;case Ft.UNAVAILABLE:return z.UNAVAILABLE;case Ft.UNAUTHENTICATED:return z.UNAUTHENTICATED;case Ft.INVALID_ARGUMENT:return z.INVALID_ARGUMENT;case Ft.NOT_FOUND:return z.NOT_FOUND;case Ft.ALREADY_EXISTS:return z.ALREADY_EXISTS;case Ft.PERMISSION_DENIED:return z.PERMISSION_DENIED;case Ft.FAILED_PRECONDITION:return z.FAILED_PRECONDITION;case Ft.ABORTED:return z.ABORTED;case Ft.OUT_OF_RANGE:return z.OUT_OF_RANGE;case Ft.UNIMPLEMENTED:return z.UNIMPLEMENTED;case Ft.DATA_LOSS:return z.DATA_LOSS;default:return le(39323,{code:t})}}(Pe=Ft||(Ft={}))[Pe.OK=0]="OK",Pe[Pe.CANCELLED=1]="CANCELLED",Pe[Pe.UNKNOWN=2]="UNKNOWN",Pe[Pe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Pe[Pe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Pe[Pe.NOT_FOUND=5]="NOT_FOUND",Pe[Pe.ALREADY_EXISTS=6]="ALREADY_EXISTS",Pe[Pe.PERMISSION_DENIED=7]="PERMISSION_DENIED",Pe[Pe.UNAUTHENTICATED=16]="UNAUTHENTICATED",Pe[Pe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Pe[Pe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Pe[Pe.ABORTED=10]="ABORTED",Pe[Pe.OUT_OF_RANGE=11]="OUT_OF_RANGE",Pe[Pe.UNIMPLEMENTED=12]="UNIMPLEMENTED",Pe[Pe.INTERNAL=13]="INTERNAL",Pe[Pe.UNAVAILABLE=14]="UNAVAILABLE",Pe[Pe.DATA_LOSS=15]="DATA_LOSS";var hV=null;function pV(){return new TextEncoder}var mV=new Nr([4294967295,4294967295],0);function Rx(t){let e=pV().encode(t),n=new o_;return n.update(e),new Uint8Array(n.digest())}function kx(t){let e=new DataView(t.buffer),n=e.getUint32(0,!0),a=e.getUint32(4,!0),r=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Nr([n,a],0),new Nr([r,s],0)]}var B_=class t{constructor(e,n,a){if(this.bitmap=e,this.padding=n,this.hashCount=a,n<0||n>=8)throw new Pi(`Invalid padding: ${n}`);if(a<0)throw new Pi(`Invalid hash count: ${a}`);if(e.length>0&&this.hashCount===0)throw new Pi(`Invalid hash count: ${a}`);if(e.length===0&&n!==0)throw new Pi(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=Nr.fromNumber(this.ge)}ye(e,n,a){let r=e.add(n.multiply(Nr.fromNumber(a)));return r.compare(mV)===1&&(r=new Nr([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let n=Rx(e),[a,r]=kx(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);if(!this.we(i))return!1}return!0}static create(e,n,a){let r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new t(s,r,n);return a.forEach(u=>i.insert(u)),i}insert(e){if(this.ge===0)return;let n=Rx(e),[a,r]=kx(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);this.be(i)}}be(e){let n=Math.floor(e/8),a=e%8;this.bitmap[n]|=1<<a}},Pi=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var cp=class t{constructor(e,n,a,r,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=a,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,a){let r=new Map;return r.set(e,Mc.createSynthesizedTargetChangeForCurrentChange(e,n,a)),new t(ge.min(),r,new kt(Re),js(),Oe())}},Mc=class t{constructor(e,n,a,r,s){this.resumeToken=e,this.current=n,this.addedDocuments=a,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,a){return new t(a,n,Oe(),Oe(),Oe())}};var su=class{constructor(e,n,a,r){this.Se=e,this.removedTargetIds=n,this.key=a,this.De=r}},dp=class{constructor(e,n){this.targetId=e,this.Ce=n}},fp=class{constructor(e,n,a=gn.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=a,this.cause=r}},hp=class{constructor(){this.ve=0,this.Fe=Dx(),this.Me=gn.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Oe(),n=Oe(),a=Oe();return this.Fe.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:a=a.add(r);break;default:le(38017,{changeType:s})}}),new Mc(this.Me,this.xe,e,n,a)}Ke(){this.Oe=!1,this.Fe=Dx()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,_t(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},q_=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=js(),this.He=Xh(),this.Je=Xh(),this.Ze=new kt(Re)}Xe(e){for(let n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(let n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{let a=this.nt(n);switch(e.state){case 0:this.rt(n)&&a.Le(e.resumeToken);break;case 1:a.We(),a.Ne||a.Ke(),a.Le(e.resumeToken);break;case 2:a.We(),a.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(a.Qe(),a.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),a.Le(e.resumeToken));break;default:le(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((a,r)=>{this.rt(r)&&n(r)})}st(e){let n=e.targetId,a=e.Ce.count,r=this.ot(n);if(r){let s=r.target;if(N_(s))if(a===0){let i=new te(s.path);this.et(n,i,xa.newNoDocument(i,ge.min()))}else _t(a===1,20013,{expectedCount:a});else{let i=this._t(n);if(i!==a){let u=this.ut(e),l=u?this.ct(u,e,i):1;if(l!==0){this.it(n);let c=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,c)}hV?.lt(function(f,p,m,v,R){let P={localCacheCount:f,existenceFilterCount:p.count,databaseId:m.database,projectId:m.projectId},x=p.unchangedNames;return x&&(P.bloomFilter={applied:R===0,hashCount:x?.hashCount??0,bitmapLength:x?.bits?.bitmap?.length??0,padding:x?.bits?.padding??0,mightContain:E=>v?.mightContain(E)??!1}),P}(i,e.Ce,this.Ge.ht(),u,l))}}}}ut(e){let n=e.Ce.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:a="",padding:r=0},hashCount:s=0}=n,i,u;try{i=Hr(a).toUint8Array()}catch(l){if(l instanceof ip)return qr("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new B_(i,r,s)}catch(l){return qr(l instanceof Pi?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.ge===0?null:u}ct(e,n,a){return n.Ce.count===a-this.Pt(e,n.targetId)?0:2}Pt(e,n){let a=this.Ge.getRemoteKeysForTarget(n),r=0;return a.forEach(s=>{let i=this.Ge.ht(),u=`projects/${i.projectId}/databases/${i.database}/documents/${s.path.canonicalString()}`;e.mightContain(u)||(this.et(n,s,null),r++)}),r}Tt(e){let n=new Map;this.ze.forEach((s,i)=>{let u=this.ot(i);if(u){if(s.current&&N_(u.target)){let l=new te(u.target.path);this.It(l).has(i)||this.Et(i,l)||this.et(i,l,xa.newNoDocument(l,e))}s.Be&&(n.set(i,s.ke()),s.Ke())}});let a=Oe();this.Je.forEach((s,i)=>{let u=!0;i.forEachWhile(l=>{let c=this.ot(l);return!c||c.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(a=a.add(s))}),this.je.forEach((s,i)=>i.setReadTime(e));let r=new cp(e,n,this.Ze,this.je,a);return this.je=js(),this.He=Xh(),this.Je=Xh(),this.Ze=new kt(Re),r}Ye(e,n){if(!this.rt(e))return;let a=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,a),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,a){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,n)?r.qe(n,1):r.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),a&&(this.je=this.je.insert(n,a))}removeTarget(e){this.ze.delete(e)}_t(e){let n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new hp,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new on(Re),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new on(Re),this.He=this.He.insert(e,n)),n}rt(e){let n=this.ot(e)!==null;return n||$("WatchChangeAggregator","Detected inactive target",e),n}ot(e){let n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new hp),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}};function Xh(){return new kt(te.comparator)}function Dx(){return new kt(te.comparator)}var gV={asc:"ASCENDING",desc:"DESCENDING"},yV={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},IV={and:"AND",or:"OR"},z_=class{constructor(e,n){this.databaseId=e,this.useProto3Json=n}};function H_(t,e){return t.useProto3Json||Rp(e)?e:{value:e}}function G_(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function H0(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function iu(t){return _t(!!t,49232),ge.fromTimestamp(function(n){let a=zr(n);return new Bt(a.seconds,a.nanos)}(t))}function G0(t,e){return j_(t,e).canonicalString()}function j_(t,e){let n=function(r){return new It(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?n:n.child(e)}function j0(t){let e=It.fromString(t);return _t(Q0(e),10190,{key:e.toString()}),e}function m_(t,e){let n=j0(e);if(n.get(1)!==t.databaseId.projectId)throw new X(z.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new X(z.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new te(W0(n))}function K0(t,e){return G0(t.databaseId,e)}function _V(t){let e=j0(t);return e.length===4?It.emptyPath():W0(e)}function Px(t){return new It(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function W0(t){return _t(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function SV(t,e){let n;if("targetChange"in e){e.targetChange;let a=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:le(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],s=function(c,f){return c.useProto3Json?(_t(f===void 0||typeof f=="string",58123),gn.fromBase64String(f||"")):(_t(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),gn.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),i=e.targetChange.cause,u=i&&function(c){let f=c.code===void 0?z.UNKNOWN:z0(c.code);return new X(f,c.message||"")}(i);n=new fp(a,r,s,u||null)}else if("documentChange"in e){e.documentChange;let a=e.documentChange;a.document,a.document.name,a.document.updateTime;let r=m_(t,a.document.name),s=iu(a.document.updateTime),i=a.document.createTime?iu(a.document.createTime):ge.min(),u=new $a({mapValue:{fields:a.document.fields}}),l=xa.newFoundDocument(r,s,i,u),c=a.targetIds||[],f=a.removedTargetIds||[];n=new su(c,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;let a=e.documentDelete;a.document;let r=m_(t,a.document),s=a.readTime?iu(a.readTime):ge.min(),i=xa.newNoDocument(r,s),u=a.removedTargetIds||[];n=new su([],u,i.key,i)}else if("documentRemove"in e){e.documentRemove;let a=e.documentRemove;a.document;let r=m_(t,a.document),s=a.removedTargetIds||[];n=new su([],s,r,null)}else{if(!("filter"in e))return le(11601,{Vt:e});{e.filter;let a=e.filter;a.targetId;let{count:r=0,unchangedNames:s}=a,i=new U_(r,s),u=a.targetId;n=new dp(u,i)}}return n}function vV(t,e){return{documents:[K0(t,e.path)]}}function EV(t,e){let n={structuredQuery:{}},a=e.path,r;e.collectionGroup!==null?(r=a,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=a.popLast(),n.structuredQuery.from=[{collectionId:a.lastSegment()}]),n.parent=K0(t,r);let s=function(c){if(c.length!==0)return Y0(va.create(c,"and"))}(e.filters);s&&(n.structuredQuery.where=s);let i=function(c){if(c.length!==0)return c.map(f=>function(m){return{field:tu(m.field),direction:wV(m.dir)}}(f))}(e.orderBy);i&&(n.structuredQuery.orderBy=i);let u=H_(t,e.limit);return u!==null&&(n.structuredQuery.limit=u),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{ft:n,parent:r}}function TV(t){let e=_V(t.parent),n=t.structuredQuery,a=n.from?n.from.length:0,r=null;if(a>0){_t(a===1,65062);let f=n.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(p){let m=X0(p);return m instanceof va&&C0(m)?m.getFilters():[m]}(n.where));let i=[];n.orderBy&&(i=function(p){return p.map(m=>function(R){return new Gs(nu(R.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(m))}(n.orderBy));let u=null;n.limit&&(u=function(p){let m;return m=typeof p=="object"?p.value:p,Rp(m)?null:m}(n.limit));let l=null;n.startAt&&(l=function(p){let m=!!p.before,v=p.values||[];return new Gr(v,m)}(n.startAt));let c=null;return n.endAt&&(c=function(p){let m=!p.before,v=p.values||[];return new Gr(v,m)}(n.endAt)),$2(e,r,i,s,u,"F",l,c)}function bV(t,e){let n=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return le(28987,{purpose:r})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function X0(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":let a=nu(n.unaryFilter.field);return xt.create(a,"==",{doubleValue:NaN});case"IS_NULL":let r=nu(n.unaryFilter.field);return xt.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let s=nu(n.unaryFilter.field);return xt.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let i=nu(n.unaryFilter.field);return xt.create(i,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return le(61313);default:return le(60726)}}(t):t.fieldFilter!==void 0?function(n){return xt.create(nu(n.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return le(58110);default:return le(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return va.create(n.compositeFilter.filters.map(a=>X0(a)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return le(1026)}}(n.compositeFilter.op))}(t):le(30097,{filter:t})}function wV(t){return gV[t]}function CV(t){return yV[t]}function LV(t){return IV[t]}function tu(t){return{fieldPath:t.canonicalString()}}function nu(t){return aa.fromServerFormat(t.fieldPath)}function Y0(t){return t instanceof xt?function(n){if(n.op==="=="){if(vx(n.value))return{unaryFilter:{field:tu(n.field),op:"IS_NAN"}};if(Sx(n.value))return{unaryFilter:{field:tu(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(vx(n.value))return{unaryFilter:{field:tu(n.field),op:"IS_NOT_NAN"}};if(Sx(n.value))return{unaryFilter:{field:tu(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:tu(n.field),op:CV(n.op),value:n.value}}}(t):t instanceof va?function(n){let a=n.getFilters().map(r=>Y0(r));return a.length===1?a[0]:{compositeFilter:{op:LV(n.op),filters:a}}}(t):le(54877,{filter:t})}function Q0(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function $0(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var Nc=class t{constructor(e,n,a,r,s=ge.min(),i=ge.min(),u=gn.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=n,this.purpose=a,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var K_=class{constructor(e){this.yt=e}};function J0(t){let e=TV({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Rc(e,e.limit,"L"):e}var pp=class{constructor(){}Dt(e,n){this.Ct(e,n),n.vt()}Ct(e,n){if("nullValue"in e)this.Ft(n,5);else if("booleanValue"in e)this.Ft(n,10),n.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(n,15),n.Mt(yt(e.integerValue));else if("doubleValue"in e){let a=yt(e.doubleValue);isNaN(a)?this.Ft(n,13):(this.Ft(n,15),Cc(a)?n.Mt(0):n.Mt(a))}else if("timestampValue"in e){let a=e.timestampValue;this.Ft(n,20),typeof a=="string"&&(a=zr(a)),n.xt(`${a.seconds||""}`),n.Mt(a.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,n),this.Nt(n);else if("bytesValue"in e)this.Ft(n,30),n.Bt(Hr(e.bytesValue)),this.Nt(n);else if("referenceValue"in e)this.Lt(e.referenceValue,n);else if("geoPointValue"in e){let a=e.geoPointValue;this.Ft(n,45),n.Mt(a.latitude||0),n.Mt(a.longitude||0)}else"mapValue"in e?b0(e)?this.Ft(n,Number.MAX_SAFE_INTEGER):T0(e)?this.kt(e.mapValue,n):(this.Kt(e.mapValue,n),this.Nt(n)):"arrayValue"in e?(this.qt(e.arrayValue,n),this.Nt(n)):le(19022,{Ut:e})}Ot(e,n){this.Ft(n,25),this.$t(e,n)}$t(e,n){n.xt(e)}Kt(e,n){let a=e.fields||{};this.Ft(n,55);for(let r of Object.keys(a))this.Ot(r,n),this.Ct(a[r],n)}kt(e,n){let a=e.fields||{};this.Ft(n,53);let r=cu,s=a[r].arrayValue?.values?.length||0;this.Ft(n,15),n.Mt(yt(s)),this.Ot(r,n),this.Ct(a[r],n)}qt(e,n){let a=e.values||[];this.Ft(n,50);for(let r of a)this.Ct(r,n)}Lt(e,n){this.Ft(n,37),te.fromName(e).path.forEach(a=>{this.Ft(n,60),this.$t(a,n)})}Ft(e,n){e.Mt(n)}Nt(e){e.Mt(2)}};pp.Wt=new pp;var W_=class{constructor(){this.Sn=new X_}addToCollectionParentIndex(e,n){return this.Sn.add(n),H.resolve()}getCollectionParents(e,n){return H.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return H.resolve()}deleteFieldIndex(e,n){return H.resolve()}deleteAllFieldIndexes(e){return H.resolve()}createTargetIndexes(e,n){return H.resolve()}getDocumentsMatchingTarget(e,n){return H.resolve(null)}getIndexType(e,n){return H.resolve(0)}getFieldIndexes(e,n){return H.resolve([])}getNextCollectionGroupToUpdate(e){return H.resolve(null)}getMinOffset(e,n){return H.resolve(Vi.min())}getMinOffsetFromCollectionGroup(e,n){return H.resolve(Vi.min())}updateCollectionGroup(e,n,a){return H.resolve()}updateIndexEntries(e,n){return H.resolve()}},X_=class{constructor(){this.index={}}add(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n]||new on(It.comparator),s=!r.has(a);return this.index[n]=r.add(a),s}has(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n];return r&&r.has(a)}getEntries(e){return(this.index[e]||new on(It.comparator)).toArray()}};var w4=new Uint8Array(0);var Ox={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Z0=41943040,Sa=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,a){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=a}};Sa.DEFAULT_COLLECTION_PERCENTILE=10,Sa.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Sa.DEFAULT=new Sa(Z0,Sa.DEFAULT_COLLECTION_PERCENTILE,Sa.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Sa.DISABLED=new Sa(-1,0,0);var Vc=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var Mx="LruGarbageCollector",AV=1048576;function Nx([t,e],[n,a]){let r=Re(t,n);return r===0?Re(e,a):r}var Y_=class{constructor(e){this.Pr=e,this.buffer=new on(Nx),this.Tr=0}Ir(){return++this.Tr}Er(e){let n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{let a=this.buffer.last();Nx(n,a)<0&&(this.buffer=this.buffer.delete(a).add(n))}}get maxValue(){return this.buffer.last()[0]}},Q_=class{constructor(e,n,a){this.garbageCollector=e,this.asyncQueue=n,this.localStore=a,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){$(Mx,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){Tu(n)?$(Mx,"Ignoring IndexedDB error during garbage collection: ",n):await xp(n)}await this.Ar(3e5)})}},$_=class{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(a=>Math.floor(n/100*a))}nthSequenceNumber(e,n){if(n===0)return H.resolve(lu.ce);let a=new Y_(n);return this.Vr.forEachTarget(e,r=>a.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>a.Er(r))).next(()=>a.maxValue)}removeTargets(e,n,a){return this.Vr.removeTargets(e,n,a)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?($("LruGarbageCollector","Garbage collection skipped; disabled"),H.resolve(Ox)):this.getCacheSize(e).next(a=>a<this.params.cacheSizeCollectionThreshold?($("LruGarbageCollector",`Garbage collection skipped; Cache size ${a} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Ox):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let a,r,s,i,u,l,c,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?($("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),r=this.params.maximumSequenceNumbersToCollect):r=p,i=Date.now(),this.nthSequenceNumber(e,r))).next(p=>(a=p,u=Date.now(),this.removeTargets(e,a,n))).next(p=>(s=p,l=Date.now(),this.removeOrphanedDocuments(e,a))).next(p=>(c=Date.now(),Zo()<=Ee.DEBUG&&$("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-f}ms
	Determined least recently used ${r} in `+(u-i)+`ms
	Removed ${s} targets in `+(l-u)+`ms
	Removed ${p} documents in `+(c-l)+`ms
Total Duration: ${c-f}ms`),H.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:p})))}};function xV(t,e){return new $_(t,e)}var J_=class{constructor(){this.changes=new Kr(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,xa.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();let a=this.changes.get(n);return a!==void 0?H.resolve(a):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var Z_=class{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}};var eS=class{constructor(e,n,a,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=a,this.indexManager=r}getDocument(e,n){let a=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(a=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(a!==null&&bc(a.mutation,r,ki.empty(),Bt.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.getLocalViewOfDocuments(e,a,Oe()).next(()=>a))}getLocalViewOfDocuments(e,n,a=Oe()){let r=Di();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,a).next(s=>{let i=vc();return s.forEach((u,l)=>{i=i.insert(u,l.overlayedDocument)}),i}))}getOverlayedDocuments(e,n){let a=Di();return this.populateOverlays(e,a,n).next(()=>this.computeViews(e,n,a,Oe()))}populateOverlays(e,n,a){let r=[];return a.forEach(s=>{n.has(s)||r.push(s)}),this.documentOverlayCache.getOverlays(e,r).next(s=>{s.forEach((i,u)=>{n.set(i,u)})})}computeViews(e,n,a,r){let s=js(),i=Tc(),u=function(){return Tc()}();return n.forEach((l,c)=>{let f=a.get(c.key);r.has(c.key)&&(f===void 0||f.mutation instanceof gu)?s=s.insert(c.key,c):f!==void 0?(i.set(c.key,f.mutation.getFieldMask()),bc(f.mutation,c,f.mutation.getFieldMask(),Bt.now())):i.set(c.key,ki.empty())}),this.recalculateAndSaveOverlays(e,s).next(l=>(l.forEach((c,f)=>i.set(c,f)),n.forEach((c,f)=>u.set(c,new Z_(f,i.get(c)??null))),u))}recalculateAndSaveOverlays(e,n){let a=Tc(),r=new kt((i,u)=>i-u),s=Oe();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(i=>{for(let u of i)u.keys().forEach(l=>{let c=n.get(l);if(c===null)return;let f=a.get(l)||ki.empty();f=u.applyToLocalView(c,f),a.set(l,f);let p=(r.get(u.batchId)||Oe()).add(l);r=r.insert(u.batchId,p)})}).next(()=>{let i=[],u=r.getReverseIterator();for(;u.hasNext();){let l=u.getNext(),c=l.key,f=l.value,p=M0();f.forEach(m=>{if(!s.has(m)){let v=B0(n.get(m),a.get(m));v!==null&&p.set(m,v),s=s.add(m)}}),i.push(this.documentOverlayCache.saveOverlays(e,c,p))}return H.waitFor(i)}).next(()=>a)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.recalculateAndSaveOverlays(e,a))}getDocumentsMatchingQuery(e,n,a,r){return J2(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):Dp(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,a,r):this.getDocumentsMatchingCollectionQuery(e,n,a,r)}getNextDocuments(e,n,a,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,a,r).next(s=>{let i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,a.largestBatchId,r-s.size):H.resolve(Di()),u=wc,l=s;return i.next(c=>H.forEach(c,(f,p)=>(u<p.largestBatchId&&(u=p.largestBatchId),s.get(f)?H.resolve():this.remoteDocumentCache.getEntry(e,f).next(m=>{l=l.insert(f,m)}))).next(()=>this.populateOverlays(e,c,s)).next(()=>this.computeViews(e,l,c,Oe())).next(f=>({batchId:u,changes:aV(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new te(n)).next(a=>{let r=vc();return a.isFoundDocument()&&(r=r.insert(a.key,a)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,a,r){let s=n.collectionGroup,i=vc();return this.indexManager.getCollectionParents(e,s).next(u=>H.forEach(u,l=>{let c=function(p,m){return new jr(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,c,a,r).next(f=>{f.forEach((p,m)=>{i=i.insert(p,m)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,n,a,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,a.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,a,s,r))).next(i=>{s.forEach((l,c)=>{let f=c.getKey();i.get(f)===null&&(i=i.insert(f,xa.newInvalidDocument(f)))});let u=vc();return i.forEach((l,c)=>{let f=s.get(l);f!==void 0&&bc(f.mutation,c,ki.empty(),Bt.now()),Mp(n,c)&&(u=u.insert(l,c))}),u})}};var tS=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return H.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(r){return{id:r.id,version:r.version,createTime:iu(r.createTime)}}(n)),H.resolve()}getNamedQuery(e,n){return H.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(r){return{name:r.name,query:J0(r.bundledQuery),readTime:iu(r.readTime)}}(n)),H.resolve()}};var nS=class{constructor(){this.overlays=new kt(te.comparator),this.Lr=new Map}getOverlay(e,n){return H.resolve(this.overlays.get(n))}getOverlays(e,n){let a=Di();return H.forEach(n,r=>this.getOverlay(e,r).next(s=>{s!==null&&a.set(r,s)})).next(()=>a)}saveOverlays(e,n,a){return a.forEach((r,s)=>{this.bt(e,n,s)}),H.resolve()}removeOverlaysForBatchId(e,n,a){let r=this.Lr.get(a);return r!==void 0&&(r.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(a)),H.resolve()}getOverlaysForCollection(e,n,a){let r=Di(),s=n.length+1,i=new te(n.child("")),u=this.overlays.getIteratorFrom(i);for(;u.hasNext();){let l=u.getNext().value,c=l.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===s&&l.largestBatchId>a&&r.set(l.getKey(),l)}return H.resolve(r)}getOverlaysForCollectionGroup(e,n,a,r){let s=new kt((c,f)=>c-f),i=this.overlays.getIterator();for(;i.hasNext();){let c=i.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>a){let f=s.get(c.largestBatchId);f===null&&(f=Di(),s=s.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}let u=Di(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((c,f)=>u.set(c,f)),!(u.size()>=r)););return H.resolve(u)}bt(e,n,a){let r=this.overlays.get(a.key);if(r!==null){let i=this.Lr.get(r.largestBatchId).delete(a.key);this.Lr.set(r.largestBatchId,i)}this.overlays=this.overlays.insert(a.key,new F_(n,a));let s=this.Lr.get(n);s===void 0&&(s=Oe(),this.Lr.set(n,s)),this.Lr.set(n,s.add(a.key))}};var aS=class{constructor(){this.sessionToken=gn.EMPTY_BYTE_STRING}getSessionToken(e){return H.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,H.resolve()}};var Fc=class{constructor(){this.kr=new on(Ut.Kr),this.qr=new on(Ut.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){let a=new Ut(e,n);this.kr=this.kr.add(a),this.qr=this.qr.add(a)}$r(e,n){e.forEach(a=>this.addReference(a,n))}removeReference(e,n){this.Wr(new Ut(e,n))}Qr(e,n){e.forEach(a=>this.removeReference(a,n))}Gr(e){let n=new te(new It([])),a=new Ut(n,e),r=new Ut(n,e+1),s=[];return this.qr.forEachInRange([a,r],i=>{this.Wr(i),s.push(i.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let n=new te(new It([])),a=new Ut(n,e),r=new Ut(n,e+1),s=Oe();return this.qr.forEachInRange([a,r],i=>{s=s.add(i.key)}),s}containsKey(e){let n=new Ut(e,0),a=this.kr.firstAfterOrEqual(n);return a!==null&&e.isEqual(a.key)}},Ut=class{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return te.comparator(e.key,n.key)||Re(e.Hr,n.Hr)}static Ur(e,n){return Re(e.Hr,n.Hr)||te.comparator(e.key,n.key)}};var rS=class{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new on(Ut.Kr)}checkEmpty(e){return H.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,a,r){let s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new V_(s,n,a,r);this.mutationQueue.push(i);for(let u of r)this.Jr=this.Jr.add(new Ut(u.key,s)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return H.resolve(i)}lookupMutationBatch(e,n){return H.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){let a=n+1,r=this.Xr(a),s=r<0?0:r;return H.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return H.resolve(this.mutationQueue.length===0?O2:this.Yn-1)}getAllMutationBatches(e){return H.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){let a=new Ut(n,0),r=new Ut(n,Number.POSITIVE_INFINITY),s=[];return this.Jr.forEachInRange([a,r],i=>{let u=this.Zr(i.Hr);s.push(u)}),H.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let a=new on(Re);return n.forEach(r=>{let s=new Ut(r,0),i=new Ut(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([s,i],u=>{a=a.add(u.Hr)})}),H.resolve(this.Yr(a))}getAllMutationBatchesAffectingQuery(e,n){let a=n.path,r=a.length+1,s=a;te.isDocumentKey(s)||(s=s.child(""));let i=new Ut(new te(s),0),u=new on(Re);return this.Jr.forEachWhile(l=>{let c=l.key.path;return!!a.isPrefixOf(c)&&(c.length===r&&(u=u.add(l.Hr)),!0)},i),H.resolve(this.Yr(u))}Yr(e){let n=[];return e.forEach(a=>{let r=this.Zr(a);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){_t(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let a=this.Jr;return H.forEach(n.mutations,r=>{let s=new Ut(r.key,n.batchId);return a=a.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=a})}nr(e){}containsKey(e,n){let a=new Ut(n,0),r=this.Jr.firstAfterOrEqual(a);return H.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,H.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}};var sS=class{constructor(e){this.ti=e,this.docs=function(){return new kt(te.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){let a=n.key,r=this.docs.get(a),s=r?r.size:0,i=this.ti(n);return this.docs=this.docs.insert(a,{document:n.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,a.path.popLast())}removeEntry(e){let n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){let a=this.docs.get(n);return H.resolve(a?a.document.mutableCopy():xa.newInvalidDocument(n))}getEntries(e,n){let a=js();return n.forEach(r=>{let s=this.docs.get(r);a=a.insert(r,s?s.document.mutableCopy():xa.newInvalidDocument(r))}),H.resolve(a)}getDocumentsMatchingQuery(e,n,a,r){let s=js(),i=n.path,u=new te(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){let{key:c,value:{document:f}}=l.getNext();if(!i.isPrefixOf(c.path))break;c.path.length>i.length+1||k2(R2(f),a)<=0||(r.has(f.key)||Mp(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return H.resolve(s)}getAllFromCollectionGroup(e,n,a,r){le(9500)}ni(e,n){return H.forEach(this.docs,a=>n(a))}newChangeBuffer(e){return new iS(this)}getSize(e){return H.resolve(this.size)}},iS=class extends J_{constructor(e){super(),this.Mr=e}applyChanges(e){let n=[];return this.changes.forEach((a,r)=>{r.isValidDocument()?n.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(a)}),H.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}};var oS=class{constructor(e){this.persistence=e,this.ri=new Kr(n=>GS(n),jS),this.lastRemoteSnapshotVersion=ge.min(),this.highestTargetId=0,this.ii=0,this.si=new Fc,this.targetCount=0,this.oi=Vc._r()}forEachTarget(e,n){return this.ri.forEach((a,r)=>n(r)),H.resolve()}getLastRemoteSnapshotVersion(e){return H.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return H.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),H.resolve(this.highestTargetId)}setTargetsMetadata(e,n,a){return a&&(this.lastRemoteSnapshotVersion=a),n>this.ii&&(this.ii=n),H.resolve()}lr(e){this.ri.set(e.target,e);let n=e.targetId;n>this.highestTargetId&&(this.oi=new Vc(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,H.resolve()}updateTargetData(e,n){return this.lr(n),H.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,H.resolve()}removeTargets(e,n,a){let r=0,s=[];return this.ri.forEach((i,u)=>{u.sequenceNumber<=n&&a.get(u.targetId)===null&&(this.ri.delete(i),s.push(this.removeMatchingKeysForTargetId(e,u.targetId)),r++)}),H.waitFor(s).next(()=>r)}getTargetCount(e){return H.resolve(this.targetCount)}getTargetData(e,n){let a=this.ri.get(n)||null;return H.resolve(a)}addMatchingKeys(e,n,a){return this.si.$r(n,a),H.resolve()}removeMatchingKeys(e,n,a){this.si.Qr(n,a);let r=this.persistence.referenceDelegate,s=[];return r&&n.forEach(i=>{s.push(r.markPotentiallyOrphaned(e,i))}),H.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),H.resolve()}getMatchingKeysForTargetId(e,n){let a=this.si.jr(n);return H.resolve(a)}containsKey(e,n){return H.resolve(this.si.containsKey(n))}};var mp=class{constructor(e,n){this._i={},this.overlays={},this.ai=new lu(0),this.ui=!1,this.ui=!0,this.ci=new aS,this.referenceDelegate=e(this),this.li=new oS(this),this.indexManager=new W_,this.remoteDocumentCache=function(r){return new sS(r)}(a=>this.referenceDelegate.hi(a)),this.serializer=new K_(n),this.Pi=new tS(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new nS,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let a=this._i[e.toKey()];return a||(a=new rS(n,this.referenceDelegate),this._i[e.toKey()]=a),a}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,a){$("MemoryPersistence","Starting transaction:",e);let r=new uS(this.ai.next());return this.referenceDelegate.Ti(),a(r).next(s=>this.referenceDelegate.Ii(r).next(()=>s)).toPromise().then(s=>(r.raiseOnCommittedEvent(),s))}Ei(e,n){return H.or(Object.values(this._i).map(a=>()=>a.containsKey(e,n)))}},uS=class extends T_{constructor(e){super(),this.currentSequenceNumber=e}},lS=class t{constructor(e){this.persistence=e,this.Ri=new Fc,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw le(60996)}addReference(e,n,a){return this.Ri.addReference(a,n),this.di.delete(a.toString()),H.resolve()}removeReference(e,n,a){return this.Ri.removeReference(a,n),this.di.add(a.toString()),H.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),H.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(r=>this.di.add(r.toString()));let a=this.persistence.getTargetCache();return a.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(s=>this.di.add(s.toString()))}).next(()=>a.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){let n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return H.forEach(this.di,a=>{let r=te.fromPath(a);return this.mi(e,r).next(s=>{s||n.removeEntry(r,ge.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(a=>{a?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return H.or([()=>H.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}},gp=class t{constructor(e,n){this.persistence=e,this.fi=new Kr(a=>N2(a.path),(a,r)=>a.isEqual(r)),this.garbageCollector=xV(this,n)}static Vi(e,n){return new t(e,n)}Ti(){}Ii(e){return H.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){let n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(a=>n.next(r=>a+r))}pr(e){let n=0;return this.mr(e,a=>{n++}).next(()=>n)}mr(e,n){return H.forEach(this.fi,(a,r)=>this.wr(e,a,r).next(s=>s?H.resolve():n(r)))}removeTargets(e,n,a){return this.persistence.getTargetCache().removeTargets(e,n,a)}removeOrphanedDocuments(e,n){let a=0,r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ni(e,i=>this.wr(e,i,n).next(u=>{u||(a++,s.removeEntry(i,ge.min()))})).next(()=>s.apply(e)).next(()=>a)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),H.resolve()}removeTarget(e,n){let a=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,a)}addReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),H.resolve()}removeReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),H.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),H.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Qh(e.data.value)),n}wr(e,n,a){return H.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{let r=this.fi.get(n);return H.resolve(r!==void 0&&r>a)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var cS=class t{constructor(e,n,a,r){this.targetId=e,this.fromCache=n,this.Ts=a,this.Is=r}static Es(e,n){let a=Oe(),r=Oe();for(let s of n.docChanges)switch(s.type){case 0:a=a.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new t(e,n.fromCache,a,r)}};var dS=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var fS=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return XL()?8:P2(nn())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,a,r){let s={result:null};return this.gs(e,n).next(i=>{s.result=i}).next(()=>{if(!s.result)return this.ps(e,n,r,a).next(i=>{s.result=i})}).next(()=>{if(s.result)return;let i=new dS;return this.ys(e,n,i).next(u=>{if(s.result=u,this.As)return this.ws(e,n,i,u.size)})}).next(()=>s.result)}ws(e,n,a,r){return a.documentReadCount<this.Vs?(Zo()<=Ee.DEBUG&&$("QueryEngine","SDK will not create cache indexes for query:",eu(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),H.resolve()):(Zo()<=Ee.DEBUG&&$("QueryEngine","Query:",eu(n),"scans",a.documentReadCount,"local documents and returns",r,"documents as results."),a.documentReadCount>this.ds*r?(Zo()<=Ee.DEBUG&&$("QueryEngine","The SDK decides to create cache indexes for query:",eu(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Za(n))):H.resolve())}gs(e,n){if(wx(n))return H.resolve(null);let a=Za(n);return this.indexManager.getIndexType(e,a).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=Rc(n,null,"F"),a=Za(n)),this.indexManager.getDocumentsMatchingTarget(e,a).next(s=>{let i=Oe(...s);return this.fs.getDocuments(e,i).next(u=>this.indexManager.getMinOffset(e,a).next(l=>{let c=this.bs(n,u);return this.Ss(n,c,i,l.readTime)?this.gs(e,Rc(n,null,"F")):this.Ds(e,c,n,l)}))})))}ps(e,n,a,r){return wx(n)||r.isEqual(ge.min())?H.resolve(null):this.fs.getDocuments(e,a).next(s=>{let i=this.bs(n,s);return this.Ss(n,i,a,r)?H.resolve(null):(Zo()<=Ee.DEBUG&&$("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),eu(n)),this.Ds(e,i,n,x2(r,wc)).next(u=>u))})}bs(e,n){let a=new on(P0(e));return n.forEach((r,s)=>{Mp(e,s)&&(a=a.add(s))}),a}Ss(e,n,a,r){if(e.limit===null)return!1;if(a.size!==n.size)return!0;let s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ys(e,n,a){return Zo()<=Ee.DEBUG&&$("QueryEngine","Using full collection scan to execute query:",eu(n)),this.fs.getDocumentsMatchingQuery(e,n,Vi.min(),a)}Ds(e,n,a,r){return this.fs.getDocumentsMatchingQuery(e,a,r).next(s=>(n.forEach(i=>{s=s.insert(i.key,i)}),s))}};var XS="LocalStore",RV=3e8,hS=class{constructor(e,n,a,r){this.persistence=e,this.Cs=n,this.serializer=r,this.vs=new kt(Re),this.Fs=new Kr(s=>GS(s),jS),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(a)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new eS(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}};function kV(t,e,n,a){return new hS(t,e,n,a)}async function eR(t,e){let n=Me(t);return await n.persistence.runTransaction("Handle user change","readonly",a=>{let r;return n.mutationQueue.getAllMutationBatches(a).next(s=>(r=s,n.Os(e),n.mutationQueue.getAllMutationBatches(a))).next(s=>{let i=[],u=[],l=Oe();for(let c of r){i.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}for(let c of s){u.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}return n.localDocuments.getDocuments(a,l).next(c=>({Ns:c,removedBatchIds:i,addedBatchIds:u}))})})}function tR(t){let e=Me(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function DV(t,e){let n=Me(t),a=e.snapshotVersion,r=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{let i=n.xs.newChangeBuffer({trackRemovals:!0});r=n.vs;let u=[];e.targetChanges.forEach((f,p)=>{let m=r.get(p);if(!m)return;u.push(n.li.removeMatchingKeys(s,f.removedDocuments,p).next(()=>n.li.addMatchingKeys(s,f.addedDocuments,p)));let v=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?v=v.withResumeToken(gn.EMPTY_BYTE_STRING,ge.min()).withLastLimboFreeSnapshotVersion(ge.min()):f.resumeToken.approximateByteSize()>0&&(v=v.withResumeToken(f.resumeToken,a)),r=r.insert(p,v),function(P,x,E){return P.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-P.snapshotVersion.toMicroseconds()>=RV?!0:E.addedDocuments.size+E.modifiedDocuments.size+E.removedDocuments.size>0}(m,v,f)&&u.push(n.li.updateTargetData(s,v))});let l=js(),c=Oe();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&u.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),u.push(PV(s,i,e.documentUpdates).next(f=>{l=f.Bs,c=f.Ls})),!a.isEqual(ge.min())){let f=n.li.getLastRemoteSnapshotVersion(s).next(p=>n.li.setTargetsMetadata(s,s.currentSequenceNumber,a));u.push(f)}return H.waitFor(u).next(()=>i.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,l,c)).next(()=>l)}).then(s=>(n.vs=r,s))}function PV(t,e,n){let a=Oe(),r=Oe();return n.forEach(s=>a=a.add(s)),e.getEntries(t,a).next(s=>{let i=js();return n.forEach((u,l)=>{let c=s.get(u);l.isFoundDocument()!==c.isFoundDocument()&&(r=r.add(u)),l.isNoDocument()&&l.version.isEqual(ge.min())?(e.removeEntry(u,l.readTime),i=i.insert(u,l)):!c.isValidDocument()||l.version.compareTo(c.version)>0||l.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(l),i=i.insert(u,l)):$(XS,"Ignoring outdated watch update for ",u,". Current version:",c.version," Watch version:",l.version)}),{Bs:i,Ls:r}})}function OV(t,e){let n=Me(t);return n.persistence.runTransaction("Allocate target","readwrite",a=>{let r;return n.li.getTargetData(a,e).next(s=>s?(r=s,H.resolve(r)):n.li.allocateTargetId(a).next(i=>(r=new Nc(e,i,"TargetPurposeListen",a.currentSequenceNumber),n.li.addTargetData(a,r).next(()=>r))))}).then(a=>{let r=n.vs.get(a.targetId);return(r===null||a.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.vs=n.vs.insert(a.targetId,a),n.Fs.set(e,a.targetId)),a})}async function pS(t,e,n){let a=Me(t),r=a.vs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await a.persistence.runTransaction("Release target",s,i=>a.persistence.referenceDelegate.removeTarget(i,r))}catch(i){if(!Tu(i))throw i;$(XS,`Failed to update sequence numbers for target ${e}: ${i}`)}a.vs=a.vs.remove(e),a.Fs.delete(r.target)}function Vx(t,e,n){let a=Me(t),r=ge.min(),s=Oe();return a.persistence.runTransaction("Execute query","readwrite",i=>function(l,c,f){let p=Me(l),m=p.Fs.get(f);return m!==void 0?H.resolve(p.vs.get(m)):p.li.getTargetData(c,f)}(a,i,Za(e)).next(u=>{if(u)return r=u.lastLimboFreeSnapshotVersion,a.li.getMatchingKeysForTargetId(i,u.targetId).next(l=>{s=l})}).next(()=>a.Cs.getDocumentsMatchingQuery(i,e,n?r:ge.min(),n?s:Oe())).next(u=>(MV(a,eV(e),u),{documents:u,ks:s})))}function MV(t,e,n){let a=t.Ms.get(e)||ge.min();n.forEach((r,s)=>{s.readTime.compareTo(a)>0&&(a=s.readTime)}),t.Ms.set(e,a)}var yp=class{constructor(){this.activeTargetIds=iV()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var mS=class{constructor(){this.vo=new yp,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,a){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,a){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new yp,Promise.resolve()}handleUserChange(e,n,a){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var gS=class{Mo(e){}shutdown(){}};var Fx="ConnectivityMonitor",Ip=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){$(Fx,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){$(Fx,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var Yh=null;function yS(){return Yh===null?Yh=function(){return 268435456+Math.round(2147483648*Math.random())}():Yh++,"0x"+Yh.toString(16)}var g_="RestConnection",NV={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},IS=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let n=e.ssl?"https":"http",a=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${a}/databases/${r}`,this.$o=this.databaseId.database===op?`project_id=${a}`:`project_id=${a}&database_id=${r}`}Wo(e,n,a,r,s){let i=yS(),u=this.Qo(e,n.toUriEncodedString());$(g_,`Sending RPC '${e}' ${i}:`,u,a);let l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,r,s);let{host:c}=new URL(u),f=Ga(c);return this.zo(e,u,l,a,f).then(p=>($(g_,`Received RPC '${e}' ${i}: `,p),p),p=>{throw qr(g_,`RPC '${e}' ${i} failed with error: `,p,"url: ",u,"request:",a),p})}jo(e,n,a,r,s,i){return this.Wo(e,n,a,r,s)}Go(e,n,a){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+vu}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,s)=>e[s]=r),a&&a.headers.forEach((r,s)=>e[s]=r)}Qo(e,n){let a=NV[e],r=`${this.qo}/v1/${n}:${a}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var _S=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var En="WebChannelConnection",Sc=(t,e,n)=>{t.listen(e,a=>{try{n(a)}catch(r){setTimeout(()=>{throw r},0)}})},_p=class t extends IS{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=d_();Sc(e,c_.STAT_EVENT,n=>{n.stat===Kh.PROXY?$(En,"STAT_EVENT: detected buffering proxy"):n.stat===Kh.NOPROXY&&$(En,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,n,a,r,s){let i=yS();return new Promise((u,l)=>{let c=new u_;c.setWithCredentials(!0),c.listenOnce(l_.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case _c.NO_ERROR:let p=c.getResponseJson();$(En,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(p)),u(p);break;case _c.TIMEOUT:$(En,`RPC '${e}' ${i} timed out`),l(new X(z.DEADLINE_EXCEEDED,"Request time out"));break;case _c.HTTP_ERROR:let m=c.getStatus();if($(En,`RPC '${e}' ${i} failed with status:`,m,"response text:",c.getResponseText()),m>0){let v=c.getResponseJson();Array.isArray(v)&&(v=v[0]);let R=v?.error;if(R&&R.status&&R.message){let P=function(E){let I=E.toLowerCase().replace(/_/g,"-");return Object.values(z).indexOf(I)>=0?I:z.UNKNOWN}(R.status);l(new X(P,R.message))}else l(new X(z.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new X(z.UNAVAILABLE,"Connection failed."));break;default:le(9055,{l_:e,streamId:i,h_:c.getLastErrorCode(),P_:c.getLastError()})}}finally{$(En,`RPC '${e}' ${i} completed.`)}});let f=JSON.stringify(r);$(En,`RPC '${e}' ${i} sending request:`,r),c.send(n,"POST",f,a,15)})}T_(e,n,a){let r=yS(),s=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(u.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,n,a),u.encodeInitMessageHeaders=!0;let c=s.join("");$(En,`Creating RPC '${e}' stream ${r}: ${c}`,u);let f=i.createWebChannel(c,u);this.I_(f);let p=!1,m=!1,v=new _S({Ho:R=>{m?$(En,`Not sending because RPC '${e}' stream ${r} is closed:`,R):(p||($(En,`Opening RPC '${e}' stream ${r} transport.`),f.open(),p=!0),$(En,`RPC '${e}' stream ${r} sending:`,R),f.send(R))},Jo:()=>f.close()});return Sc(f,Jo.EventType.OPEN,()=>{m||($(En,`RPC '${e}' stream ${r} transport opened.`),v.i_())}),Sc(f,Jo.EventType.CLOSE,()=>{m||(m=!0,$(En,`RPC '${e}' stream ${r} transport closed`),v.o_(),this.E_(f))}),Sc(f,Jo.EventType.ERROR,R=>{m||(m=!0,qr(En,`RPC '${e}' stream ${r} transport errored. Name:`,R.name,"Message:",R.message),v.o_(new X(z.UNAVAILABLE,"The operation could not be completed")))}),Sc(f,Jo.EventType.MESSAGE,R=>{if(!m){let P=R.data[0];_t(!!P,16349);let x=P,E=x?.error||x[0]?.error;if(E){$(En,`RPC '${e}' stream ${r} received error:`,E);let I=E.status,w=function(j){let _=Ft[j];if(_!==void 0)return z0(_)}(I),A=E.message;I==="NOT_FOUND"&&A.includes("database")&&A.includes("does not exist")&&A.includes(this.databaseId.database)&&qr(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),w===void 0&&(w=z.INTERNAL,A="Unknown error status: "+I+" with message "+E.message),m=!0,v.o_(new X(w,A)),f.close()}else $(En,`RPC '${e}' stream ${r} received:`,P),v.__(P)}}),t.u_(),setTimeout(()=>{v.s_()},0),v}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,a){super.Go(e,n,a),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return f_()}};function VV(t){return new _p(t)}function y_(){return typeof document<"u"?document:null}function Wc(t){return new z_(t,!0)}_p.c_=!1;var Sp=class{constructor(e,n,a=1e3,r=1.5,s=6e4){this.Ci=e,this.timerId=n,this.R_=a,this.A_=r,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let n=Math.floor(this.d_+this.y_()),a=Math.max(0,Date.now()-this.f_),r=Math.max(0,n-a);r>0&&$("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${a} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var Ux="PersistentStream",SS=class{constructor(e,n,a,r,s,i,u,l){this.Ci=e,this.b_=a,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new Sp(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===z.RESOURCE_EXHAUSTED?(Br(n.toString()),Br("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===z.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([a,r])=>{this.D_===n&&this.G_(a,r)},a=>{e(()=>{let r=new X(z.UNKNOWN,"Fetching auth token failed: "+a.message);return this.z_(r)})})}G_(e,n){let a=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{a(()=>this.listener.Zo())}),this.stream.Yo(()=>{a(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{a(()=>this.z_(r))}),this.stream.onMessage(r=>{a(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return $(Ux,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():($(Ux,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},vS=class extends SS{constructor(e,n,a,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,a,r,i),this.serializer=s}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let n=SV(this.serializer,e),a=function(s){if(!("targetChange"in s))return ge.min();let i=s.targetChange;return i.targetIds&&i.targetIds.length?ge.min():i.readTime?iu(i.readTime):ge.min()}(e);return this.listener.J_(n,a)}Z_(e){let n={};n.database=Px(this.serializer),n.addTarget=function(s,i){let u,l=i.target;if(u=N_(l)?{documents:vV(s,l)}:{query:EV(s,l).ft},u.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){u.resumeToken=H0(s,i.resumeToken);let c=H_(s,i.expectedCount);c!==null&&(u.expectedCount=c)}else if(i.snapshotVersion.compareTo(ge.min())>0){u.readTime=G_(s,i.snapshotVersion.toTimestamp());let c=H_(s,i.expectedCount);c!==null&&(u.expectedCount=c)}return u}(this.serializer,e);let a=bV(this.serializer,e);a&&(n.labels=a),this.K_(n)}X_(e){let n={};n.database=Px(this.serializer),n.removeTarget=e,this.K_(n)}};var ES=class{},TS=class extends ES{constructor(e,n,a,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=a,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new X(z.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,a,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Wo(e,j_(n,a),r,s,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===z.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new X(z.UNKNOWN,s.toString())})}jo(e,n,a,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,u])=>this.connection.jo(e,j_(n,a),r,i,u,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===z.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new X(z.UNKNOWN,i.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function FV(t,e,n,a){return new TS(t,e,n,a)}var bS=class{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Br(n),this.aa=!1):$("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var yu="RemoteStore",wS=class{constructor(e,n,a,r,s){this.localStore=e,this.datastore=n,this.asyncQueue=a,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(i=>{a.enqueueAndForget(async()=>{Yc(this)&&($(yu,"Restarting streams for network reachability change."),await async function(l){let c=Me(l);c.Ea.add(4),await Xc(c),c.Va.set("Unknown"),c.Ea.delete(4),await Np(c)}(this))})}),this.Va=new bS(a,r)}};async function Np(t){if(Yc(t))for(let e of t.Ra)await e(!0)}async function Xc(t){for(let e of t.Ra)await e(!1)}function nR(t,e){let n=Me(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),JS(n)?$S(n):wu(n).O_()&&QS(n,e))}function YS(t,e){let n=Me(t),a=wu(n);n.Ia.delete(e),a.O_()&&aR(n,e),n.Ia.size===0&&(a.O_()?a.L_():Yc(n)&&n.Va.set("Unknown"))}function QS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(ge.min())>0){let n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}wu(t).Z_(e)}function aR(t,e){t.da.$e(e),wu(t).X_(e)}function $S(t){t.da=new q_({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),wu(t).start(),t.Va.ua()}function JS(t){return Yc(t)&&!wu(t).x_()&&t.Ia.size>0}function Yc(t){return Me(t).Ea.size===0}function rR(t){t.da=void 0}async function UV(t){t.Va.set("Online")}async function BV(t){t.Ia.forEach((e,n)=>{QS(t,e)})}async function qV(t,e){rR(t),JS(t)?(t.Va.ha(e),$S(t)):t.Va.set("Unknown")}async function zV(t,e,n){if(t.Va.set("Online"),e instanceof fp&&e.state===2&&e.cause)try{await async function(r,s){let i=s.cause;for(let u of s.targetIds)r.Ia.has(u)&&(await r.remoteSyncer.rejectListen(u,i),r.Ia.delete(u),r.da.removeTarget(u))}(t,e)}catch(a){$(yu,"Failed to remove targets %s: %s ",e.targetIds.join(","),a),await Bx(t,a)}else if(e instanceof su?t.da.Xe(e):e instanceof dp?t.da.st(e):t.da.tt(e),!n.isEqual(ge.min()))try{let a=await tR(t.localStore);n.compareTo(a)>=0&&await function(s,i){let u=s.da.Tt(i);return u.targetChanges.forEach((l,c)=>{if(l.resumeToken.approximateByteSize()>0){let f=s.Ia.get(c);f&&s.Ia.set(c,f.withResumeToken(l.resumeToken,i))}}),u.targetMismatches.forEach((l,c)=>{let f=s.Ia.get(l);if(!f)return;s.Ia.set(l,f.withResumeToken(gn.EMPTY_BYTE_STRING,f.snapshotVersion)),aR(s,l);let p=new Nc(f.target,l,c,f.sequenceNumber);QS(s,p)}),s.remoteSyncer.applyRemoteEvent(u)}(t,n)}catch(a){$(yu,"Failed to raise snapshot:",a),await Bx(t,a)}}async function Bx(t,e,n){if(!Tu(e))throw e;t.Ea.add(1),await Xc(t),t.Va.set("Offline"),n||(n=()=>tR(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{$(yu,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await Np(t)})}async function qx(t,e){let n=Me(t);n.asyncQueue.verifyOperationInProgress(),$(yu,"RemoteStore received new credentials");let a=Yc(n);n.Ea.add(3),await Xc(n),a&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await Np(n)}async function HV(t,e){let n=Me(t);e?(n.Ea.delete(2),await Np(n)):e||(n.Ea.add(2),await Xc(n),n.Va.set("Unknown"))}function wu(t){return t.ma||(t.ma=function(n,a,r){let s=Me(n);return s.sa(),new vS(a,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,r)}(t.datastore,t.asyncQueue,{Zo:UV.bind(null,t),Yo:BV.bind(null,t),t_:qV.bind(null,t),J_:zV.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),JS(t)?$S(t):t.Va.set("Unknown")):(await t.ma.stop(),rR(t))})),t.ma}var CS=class t{constructor(e,n,a,r,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=a,this.op=r,this.removalCallback=s,this.deferred=new Fr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(i=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,a,r,s){let i=Date.now()+a,u=new t(e,n,i,r,s);return u.start(a),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new X(z.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function sR(t,e){if(Br("AsyncQueue",`${e}: ${t}`),Tu(t))return new X(z.UNAVAILABLE,`${e}: ${t}`);throw t}var Uc=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(n,a)=>e(n,a)||te.comparator(n.key,a.key):(n,a)=>te.comparator(n.key,a.key),this.keyedMap=vc(),this.sortedSet=new kt(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,a)=>(e(n),!1))}add(e){let n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){let n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.sortedSet.getIterator(),a=e.sortedSet.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(!r.isEqual(s))return!1}return!0}toString(){let e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){let a=new t;return a.comparator=this.comparator,a.keyedMap=e,a.sortedSet=n,a}};var vp=class{constructor(){this.ga=new kt(te.comparator)}track(e){let n=e.doc.key,a=this.ga.get(n);a?e.type!==0&&a.type===3?this.ga=this.ga.insert(n,e):e.type===3&&a.type!==1?this.ga=this.ga.insert(n,{type:a.type,doc:e.doc}):e.type===2&&a.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&a.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&a.type===0?this.ga=this.ga.remove(n):e.type===1&&a.type===2?this.ga=this.ga.insert(n,{type:1,doc:a.doc}):e.type===0&&a.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):le(63341,{Vt:e,pa:a}):this.ga=this.ga.insert(n,e)}ya(){let e=[];return this.ga.inorderTraversal((n,a)=>{e.push(a)}),e}},Fi=class t{constructor(e,n,a,r,s,i,u,l,c){this.query=e,this.docs=n,this.oldDocs=a,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=c}static fromInitialDocuments(e,n,a,r,s){let i=[];return n.forEach(u=>{i.push({type:0,doc:u})}),new t(e,n,Uc.emptySet(n),i,a,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Op(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let n=this.docChanges,a=e.docChanges;if(n.length!==a.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==a[r].type||!n[r].doc.isEqual(a[r].doc))return!1;return!0}};var LS=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},AS=class{constructor(){this.queries=zx(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,a){let r=Me(n),s=r.queries;r.queries=zx(),s.forEach((i,u)=>{for(let l of u.ba)l.onError(a)})})(this,new X(z.ABORTED,"Firestore shutting down"))}};function zx(){return new Kr(t=>D0(t),Op)}async function GV(t,e){let n=Me(t),a=3,r=e.query,s=n.queries.get(r);s?!s.Sa()&&e.Da()&&(a=2):(s=new LS,a=e.Da()?0:1);try{switch(a){case 0:s.wa=await n.onListen(r,!0);break;case 1:s.wa=await n.onListen(r,!1);break;case 2:await n.onFirstRemoteStoreListen(r)}}catch(i){let u=sR(i,`Initialization of query '${eu(e.query)}' failed`);return void e.onError(u)}n.queries.set(r,s),s.ba.push(e),e.va(n.onlineState),s.wa&&e.Fa(s.wa)&&ZS(n)}async function jV(t,e){let n=Me(t),a=e.query,r=3,s=n.queries.get(a);if(s){let i=s.ba.indexOf(e);i>=0&&(s.ba.splice(i,1),s.ba.length===0?r=e.Da()?0:1:!s.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return n.queries.delete(a),n.onUnlisten(a,!0);case 1:return n.queries.delete(a),n.onUnlisten(a,!1);case 2:return n.onLastRemoteStoreUnlisten(a);default:return}}function KV(t,e){let n=Me(t),a=!1;for(let r of e){let s=r.query,i=n.queries.get(s);if(i){for(let u of i.ba)u.Fa(r)&&(a=!0);i.wa=r}}a&&ZS(n)}function WV(t,e,n){let a=Me(t),r=a.queries.get(e);if(r)for(let s of r.ba)s.onError(n);a.queries.delete(e)}function ZS(t){t.Ca.forEach(e=>{e.next()})}var xS,Hx;(Hx=xS||(xS={})).Ma="default",Hx.Cache="cache";var RS=class{constructor(e,n,a){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=a||{}}Fa(e){if(!this.options.includeMetadataChanges){let a=[];for(let r of e.docChanges)r.type!==3&&a.push(r);e=new Fi(e.query,e.docs,e.oldDocs,a,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;let a=n!=="Offline";return(!this.options.Ka||!a)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=Fi.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==xS.Cache}};var Ep=class{constructor(e){this.key=e}},Tp=class{constructor(e){this.key=e}},kS=class{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Oe(),this.mutatedKeys=Oe(),this.eu=P0(e),this.tu=new Uc(this.eu)}get nu(){return this.Za}ru(e,n){let a=n?n.iu:new vp,r=n?n.tu:this.tu,s=n?n.mutatedKeys:this.mutatedKeys,i=r,u=!1,l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,c=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((f,p)=>{let m=r.get(f),v=Mp(this.query,p)?p:null,R=!!m&&this.mutatedKeys.has(m.key),P=!!v&&(v.hasLocalMutations||this.mutatedKeys.has(v.key)&&v.hasCommittedMutations),x=!1;m&&v?m.data.isEqual(v.data)?R!==P&&(a.track({type:3,doc:v}),x=!0):this.su(m,v)||(a.track({type:2,doc:v}),x=!0,(l&&this.eu(v,l)>0||c&&this.eu(v,c)<0)&&(u=!0)):!m&&v?(a.track({type:0,doc:v}),x=!0):m&&!v&&(a.track({type:1,doc:m}),x=!0,(l||c)&&(u=!0)),x&&(v?(i=i.add(v),s=P?s.add(f):s.delete(f)):(i=i.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;i.size>this.query.limit;){let f=this.query.limitType==="F"?i.last():i.first();i=i.delete(f.key),s=s.delete(f.key),a.track({type:1,doc:f})}return{tu:i,iu:a,Ss:u,mutatedKeys:s}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,a,r){let s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let i=e.iu.ya();i.sort((f,p)=>function(v,R){let P=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return le(20277,{Vt:x})}};return P(v)-P(R)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(a),r=r??!1;let u=n&&!r?this._u():[],l=this.Ya.size===0&&this.current&&!r?1:0,c=l!==this.Xa;return this.Xa=l,i.length!==0||c?{snapshot:new Fi(this.query,e.tu,s,i,e.mutatedKeys,l===0,c,!1,!!a&&a.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new vp,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=Oe(),this.tu.forEach(a=>{this.uu(a.key)&&(this.Ya=this.Ya.add(a.key))});let n=[];return e.forEach(a=>{this.Ya.has(a)||n.push(new Tp(a))}),this.Ya.forEach(a=>{e.has(a)||n.push(new Ep(a))}),n}cu(e){this.Za=e.ks,this.Ya=Oe();let n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return Fi.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},ev="SyncEngine",DS=class{constructor(e,n,a){this.query=e,this.targetId=n,this.view=a}},PS=class{constructor(e){this.key=e,this.hu=!1}},OS=class{constructor(e,n,a,r,s,i){this.localStore=e,this.remoteStore=n,this.eventManager=a,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new Kr(u=>D0(u),Op),this.Iu=new Map,this.Eu=new Set,this.Ru=new kt(te.comparator),this.Au=new Map,this.Vu=new Fc,this.du={},this.mu=new Map,this.fu=Vc.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function XV(t,e,n=!0){let a=cR(t),r,s=a.Tu.get(e);return s?(a.sharedClientState.addLocalQueryTarget(s.targetId),r=s.view.lu()):r=await iR(a,e,n,!0),r}async function YV(t,e){let n=cR(t);await iR(n,e,!0,!1)}async function iR(t,e,n,a){let r=await OV(t.localStore,Za(e)),s=r.targetId,i=t.sharedClientState.addLocalQueryTarget(s,n),u;return a&&(u=await QV(t,e,s,i==="current",r.resumeToken)),t.isPrimaryClient&&n&&nR(t.remoteStore,r),u}async function QV(t,e,n,a,r){t.pu=(p,m,v)=>async function(P,x,E,I){let w=x.view.ru(E);w.Ss&&(w=await Vx(P.localStore,x.query,!1).then(({documents:_})=>x.view.ru(_,w)));let A=I&&I.targetChanges.get(x.targetId),B=I&&I.targetMismatches.get(x.targetId)!=null,j=x.view.applyChanges(w,P.isPrimaryClient,A,B);return jx(P,x.targetId,j.au),j.snapshot}(t,p,m,v);let s=await Vx(t.localStore,e,!0),i=new kS(e,s.ks),u=i.ru(s.documents),l=Mc.createSynthesizedTargetChangeForCurrentChange(n,a&&t.onlineState!=="Offline",r),c=i.applyChanges(u,t.isPrimaryClient,l);jx(t,n,c.au);let f=new DS(e,n,i);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),c.snapshot}async function $V(t,e,n){let a=Me(t),r=a.Tu.get(e),s=a.Iu.get(r.targetId);if(s.length>1)return a.Iu.set(r.targetId,s.filter(i=>!Op(i,e))),void a.Tu.delete(e);a.isPrimaryClient?(a.sharedClientState.removeLocalQueryTarget(r.targetId),a.sharedClientState.isActiveQueryTarget(r.targetId)||await pS(a.localStore,r.targetId,!1).then(()=>{a.sharedClientState.clearQueryState(r.targetId),n&&YS(a.remoteStore,r.targetId),MS(a,r.targetId)}).catch(xp)):(MS(a,r.targetId),await pS(a.localStore,r.targetId,!0))}async function JV(t,e){let n=Me(t),a=n.Tu.get(e),r=n.Iu.get(a.targetId);n.isPrimaryClient&&r.length===1&&(n.sharedClientState.removeLocalQueryTarget(a.targetId),YS(n.remoteStore,a.targetId))}async function oR(t,e){let n=Me(t);try{let a=await DV(n.localStore,e);e.targetChanges.forEach((r,s)=>{let i=n.Au.get(s);i&&(_t(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?i.hu=!0:r.modifiedDocuments.size>0?_t(i.hu,14607):r.removedDocuments.size>0&&(_t(i.hu,42227),i.hu=!1))}),await lR(n,a,e)}catch(a){await xp(a)}}function Gx(t,e,n){let a=Me(t);if(a.isPrimaryClient&&n===0||!a.isPrimaryClient&&n===1){let r=[];a.Tu.forEach((s,i)=>{let u=i.view.va(e);u.snapshot&&r.push(u.snapshot)}),function(i,u){let l=Me(i);l.onlineState=u;let c=!1;l.queries.forEach((f,p)=>{for(let m of p.ba)m.va(u)&&(c=!0)}),c&&ZS(l)}(a.eventManager,e),r.length&&a.Pu.J_(r),a.onlineState=e,a.isPrimaryClient&&a.sharedClientState.setOnlineState(e)}}async function ZV(t,e,n){let a=Me(t);a.sharedClientState.updateQueryState(e,"rejected",n);let r=a.Au.get(e),s=r&&r.key;if(s){let i=new kt(te.comparator);i=i.insert(s,xa.newNoDocument(s,ge.min()));let u=Oe().add(s),l=new cp(ge.min(),new Map,new kt(Re),i,u);await oR(a,l),a.Ru=a.Ru.remove(s),a.Au.delete(e),tv(a)}else await pS(a.localStore,e,!1).then(()=>MS(a,e,n)).catch(xp)}function MS(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(let a of t.Iu.get(e))t.Tu.delete(a),n&&t.Pu.yu(a,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(a=>{t.Vu.containsKey(a)||uR(t,a)})}function uR(t,e){t.Eu.delete(e.path.canonicalString());let n=t.Ru.get(e);n!==null&&(YS(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),tv(t))}function jx(t,e,n){for(let a of n)a instanceof Ep?(t.Vu.addReference(a.key,e),eF(t,a)):a instanceof Tp?($(ev,"Document no longer in limbo: "+a.key),t.Vu.removeReference(a.key,e),t.Vu.containsKey(a.key)||uR(t,a.key)):le(19791,{wu:a})}function eF(t,e){let n=e.key,a=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(a)||($(ev,"New document in limbo: "+n),t.Eu.add(a),tv(t))}function tv(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let n=new te(It.fromString(e)),a=t.fu.next();t.Au.set(a,new PS(n)),t.Ru=t.Ru.insert(n,a),nR(t.remoteStore,new Nc(Za(KS(n.path)),a,"TargetPurposeLimboResolution",lu.ce))}}async function lR(t,e,n){let a=Me(t),r=[],s=[],i=[];a.Tu.isEmpty()||(a.Tu.forEach((u,l)=>{i.push(a.pu(l,e,n).then(c=>{if((c||n)&&a.isPrimaryClient){let f=c?!c.fromCache:n?.targetChanges.get(l.targetId)?.current;a.sharedClientState.updateQueryState(l.targetId,f?"current":"not-current")}if(c){r.push(c);let f=cS.Es(l.targetId,c);s.push(f)}}))}),await Promise.all(i),a.Pu.J_(r),await async function(l,c){let f=Me(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>H.forEach(c,m=>H.forEach(m.Ts,v=>f.persistence.referenceDelegate.addReference(p,m.targetId,v)).next(()=>H.forEach(m.Is,v=>f.persistence.referenceDelegate.removeReference(p,m.targetId,v)))))}catch(p){if(!Tu(p))throw p;$(XS,"Failed to update sequence numbers: "+p)}for(let p of c){let m=p.targetId;if(!p.fromCache){let v=f.vs.get(m),R=v.snapshotVersion,P=v.withLastLimboFreeSnapshotVersion(R);f.vs=f.vs.insert(m,P)}}}(a.localStore,s))}async function tF(t,e){let n=Me(t);if(!n.currentUser.isEqual(e)){$(ev,"User change. New user:",e.toKey());let a=await eR(n.localStore,e);n.currentUser=e,function(s,i){s.mu.forEach(u=>{u.forEach(l=>{l.reject(new X(z.CANCELLED,i))})}),s.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,a.removedBatchIds,a.addedBatchIds),await lR(n,a.Ns)}}function nF(t,e){let n=Me(t),a=n.Au.get(e);if(a&&a.hu)return Oe().add(a.key);{let r=Oe(),s=n.Iu.get(e);if(!s)return r;for(let i of s){let u=n.Tu.get(i);r=r.unionWith(u.view.nu)}return r}}function cR(t){let e=Me(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=oR.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=nF.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=ZV.bind(null,e),e.Pu.J_=KV.bind(null,e.eventManager),e.Pu.yu=WV.bind(null,e.eventManager),e}var Ui=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Wc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return kV(this.persistence,new fS,e.initialUser,this.serializer)}Cu(e){return new mp(lS.Vi,this.serializer)}Du(e){return new mS}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};Ui.provider={build:()=>new Ui};var bp=class extends Ui{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){_t(this.persistence.referenceDelegate instanceof gp,46915);let a=this.persistence.referenceDelegate.garbageCollector;return new Q_(a,e.asyncQueue,n)}Cu(e){let n=this.cacheSizeBytes!==void 0?Sa.withCacheSize(this.cacheSizeBytes):Sa.DEFAULT;return new mp(a=>gp.Vi(a,n),this.serializer)}};var Iu=class{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=a=>Gx(this.syncEngine,a,1),this.remoteStore.remoteSyncer.handleCredentialChange=tF.bind(null,this.syncEngine),await HV(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new AS}()}createDatastore(e){let n=Wc(e.databaseInfo.databaseId),a=VV(e.databaseInfo);return FV(e.authCredentials,e.appCheckCredentials,a,n)}createRemoteStore(e){return function(a,r,s,i,u){return new wS(a,r,s,i,u)}(this.localStore,this.datastore,e.asyncQueue,n=>Gx(this.syncEngine,n,0),function(){return Ip.v()?new Ip:new gS}())}createSyncEngine(e,n){return function(r,s,i,u,l,c,f){let p=new OS(r,s,i,u,l,c);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){await async function(n){let a=Me(n);$(yu,"RemoteStore shutting down."),a.Ea.add(5),await Xc(a),a.Aa.shutdown(),a.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};Iu.provider={build:()=>new Iu};var NS=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):Br("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}};var Ks="FirestoreClient",VS=class{constructor(e,n,a,r,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=a,this._databaseInfo=r,this.user=sn.UNAUTHENTICATED,this.clientId=ou.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(a,async i=>{$(Ks,"Received user=",i.uid),await this.authCredentialListener(i),this.user=i}),this.appCheckCredentials.start(a,i=>($(Ks,"Received new app check token=",i),this.appCheckCredentialListener(i,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new Fr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){let a=sR(n,"Failed to shutdown persistence");e.reject(a)}}),e.promise}};async function I_(t,e){t.asyncQueue.verifyOperationInProgress(),$(Ks,"Initializing OfflineComponentProvider");let n=t.configuration;await e.initialize(n);let a=n.initialUser;t.setCredentialChangeListener(async r=>{a.isEqual(r)||(await eR(e.localStore,r),a=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Kx(t,e){t.asyncQueue.verifyOperationInProgress();let n=await aF(t);$(Ks,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(a=>qx(e.remoteStore,a)),t.setAppCheckTokenChangeListener((a,r)=>qx(e.remoteStore,r)),t._onlineComponents=e}async function aF(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){$(Ks,"Using user provided OfflineComponentProvider");try{await I_(t,t._uninitializedComponentsProvider._offline)}catch(e){let n=e;if(!function(r){return r.name==="FirebaseError"?r.code===z.FAILED_PRECONDITION||r.code===z.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(n))throw n;qr("Error using user provided cache. Falling back to memory cache: "+n),await I_(t,new Ui)}}else $(Ks,"Using default OfflineComponentProvider"),await I_(t,new bp(void 0));return t._offlineComponents}async function rF(t){return t._onlineComponents||(t._uninitializedComponentsProvider?($(Ks,"Using user provided OnlineComponentProvider"),await Kx(t,t._uninitializedComponentsProvider._online)):($(Ks,"Using default OnlineComponentProvider"),await Kx(t,new Iu))),t._onlineComponents}async function sF(t){let e=await rF(t),n=e.eventManager;return n.onListen=XV.bind(null,e.syncEngine),n.onUnlisten=$V.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=YV.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=JV.bind(null,e.syncEngine),n}function dR(t,e,n={}){let a=new Fr;return t.asyncQueue.enqueueAndForget(async()=>function(s,i,u,l,c){let f=new NS({next:m=>{f.Nu(),i.enqueueAndForget(()=>jV(s,p)),m.fromCache&&l.source==="server"?c.reject(new X(z.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(m)},error:m=>c.reject(m)}),p=new RS(u,f,{includeMetadataChanges:!0,Ka:!0});return GV(s,p)}(await sF(t),t.asyncQueue,e,n,a)),a.promise}function fR(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var iF="ComponentProvider",Wx=new Map;function oF(t,e,n,a,r){return new b_(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,fR(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,a)}var hR="firestore.googleapis.com",Xx=!0,wp=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new X(z.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=hR,this.ssl=Xx}else this.host=e.host,this.ssl=e.ssl??Xx;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Z0;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<AV)throw new X(z.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Zx("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=fR(e.experimentalLongPollingOptions??{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new X(z.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new X(z.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new X(z.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(a,r){return a.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},Bc=class{constructor(e,n,a,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=a,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new wp({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new X(z.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new X(z.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new wp(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(a){if(!a)return new Zh;switch(a.type){case"firstParty":return new v_(a.sessionIndex||"0",a.iamToken||null,a.authTokenFactory||null);case"provider":return a.client;default:throw new X(z.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){let a=Wx.get(n);a&&($(iF,"Removing Datastore"),Wx.delete(n),a.terminate())}(this),Promise.resolve()}};function pR(t,e,n,a={}){t=Gc(t,Bc);let r=Ga(e),s=t._getSettings(),i={...s,emulatorOptions:t._getEmulatorOptions()},u=`${e}:${n}`;r&&(Ho(`https://${u}`),Go("Firestore",!0)),s.host!==hR&&s.host!==u&&qr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...s,host:u,ssl:r,emulatorOptions:a};if(!La(l,i)&&(t._setSettings(l),a.mockUserToken)){let c,f;if(typeof a.mockUserToken=="string")c=a.mockUserToken,f=sn.MOCK_USER;else{c=uh(a.mockUserToken,t._app?.options.projectId);let p=a.mockUserToken.sub||a.mockUserToken.user_id;if(!p)throw new X(z.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new sn(p)}t._authCredentials=new __(new Jh(c,f))}}var Ra=class t{constructor(e,n,a){this.converter=n,this._query=a,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},qn=class t{constructor(e,n,a){this.converter=n,this._key=a,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Mi(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,a){if(Eu(n,t._jsonSchema))return new t(e,a||null,new te(It.fromString(n.referencePath)))}};qn._jsonSchemaVersion="firestore/documentReference/1.0",qn._jsonSchema={type:Rt("string",qn._jsonSchemaVersion),referencePath:Rt("string")};var Mi=class t extends Ra{constructor(e,n,a){super(e,n,KS(a)),this._path=a,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new qn(this.firestore,null,new te(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function Qc(t,e,...n){if(t=an(t),A2("collection","path",e),t instanceof Bc){let a=It.fromString(e,...n);return hx(a),new Mi(t,null,a)}{if(!(t instanceof qn||t instanceof Mi))throw new X(z.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let a=t._path.child(It.fromString(e,...n));return hx(a),new Mi(t.firestore,null,a)}}var Yx="AsyncQueue",Cp=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Sp(this,"async_queue_retry"),this._c=()=>{let a=y_();a&&$(Yx,"Visibility state changed to "+a.visibilityState),this.M_.w_()},this.ac=e;let n=y_();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let n=y_();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let n=new Fr;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!Tu(e))throw e;$(Yx,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let n=this.ac.then(()=>(this.rc=!0,e().catch(a=>{throw this.nc=a,this.rc=!1,Br("INTERNAL UNHANDLED ERROR: ",Qx(a)),a}).then(a=>(this.rc=!1,a))));return this.ac=n,n}enqueueAfterDelay(e,n,a){this.uc(),this.oc.indexOf(e)>-1&&(n=0);let r=CS.createAndSchedule(this,e,n,a,s=>this.hc(s));return this.tc.push(r),r}uc(){this.nc&&le(47125,{Pc:Qx(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,a)=>n.targetTimeMs-a.targetTimeMs);for(let n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let n=this.tc.indexOf(e);this.tc.splice(n,1)}};function Qx(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var _u=class extends Bc{constructor(e,n,a,r){super(e,n,a,r),this.type="firestore",this._queue=new Cp,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new Cp(e),this._firestoreClient=void 0,await e}}};function nv(t,e){let n=typeof t=="object"?t:Xo(),a=typeof t=="string"?t:e||op,r=Ti(n,"firestore").getImmediate({identifier:a});if(!r._initialized){let s=oh("firestore");s&&pR(r,...s)}return r}function av(t){if(t._terminated)throw new X(z.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||uF(t),t._firestoreClient}function uF(t){let e=t._freezeSettings(),n=oF(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new VS(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(r){let s=r?._online.build();return{_offline:r?._offline.build(s),_online:s}}(t._componentsProvider))}var er=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(gn.fromBase64String(e))}catch(n){throw new X(z.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new t(gn.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Eu(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};er._jsonSchemaVersion="firestore/bytes/1.0",er._jsonSchema={type:Rt("string",er._jsonSchemaVersion),bytes:Rt("string")};var Su=class{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new X(z.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new aa(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var qc=class{constructor(e){this._methodName=e}};var Ur=class t{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new X(z.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new X(z.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Re(this._lat,e._lat)||Re(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(Eu(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};Ur._jsonSchemaVersion="firestore/geoPoint/1.0",Ur._jsonSchema={type:Rt("string",Ur._jsonSchemaVersion),latitude:Rt("number"),longitude:Rt("number")};var tr=class t{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(a,r){if(a.length!==r.length)return!1;for(let s=0;s<a.length;++s)if(a[s]!==r[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Eu(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new t(e.vectorValues);throw new X(z.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};tr._jsonSchemaVersion="firestore/vectorValue/1.0",tr._jsonSchema={type:Rt("string",tr._jsonSchemaVersion),vectorValues:Rt("object")};var lF=/^__.*__$/;function mR(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw le(40011,{dataSource:t})}}var FS=class t{constructor(e,n,a,r,s,i){this.settings=e,this.databaseId=n,this.serializer=a,this.ignoreUndefinedProperties=r,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePathSegment(e),a}childContextForFieldPath(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePath(),a}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Lp(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(mR(this.dataSource)&&lF.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},US=class{constructor(e,n,a){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=a||Wc(e)}createContext(e,n,a,r=!1){return new FS({dataSource:e,methodName:n,targetDoc:a,path:aa.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function rv(t){let e=t._freezeSettings(),n=Wc(t._databaseId);return new US(t._databaseId,!!e.ignoreUndefinedProperties,n)}function sv(t,e,n,a=!1){return iv(n,t.createContext(a?4:3,e))}function iv(t,e){if(gR(t=an(t)))return dF("Unsupported field value:",e,t),cF(t,e);if(t instanceof qc)return function(a,r){if(!mR(r.dataSource))throw r.createError(`${a._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${a._methodName}() is not currently supported inside arrays`);let s=a._toFieldTransform(r);s&&r.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(a,r){let s=[],i=0;for(let u of a){let l=iv(u,r.childContextForArray(i));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),i++}return{arrayValue:{values:s}}}(t,e)}return function(a,r){if((a=an(a))===null)return{nullValue:"NULL_VALUE"};if(typeof a=="number")return oV(r.serializer,a);if(typeof a=="boolean")return{booleanValue:a};if(typeof a=="string")return{stringValue:a};if(a instanceof Date){let s=Bt.fromDate(a);return{timestampValue:G_(r.serializer,s)}}if(a instanceof Bt){let s=new Bt(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:G_(r.serializer,s)}}if(a instanceof Ur)return{geoPointValue:{latitude:a.latitude,longitude:a.longitude}};if(a instanceof er)return{bytesValue:H0(r.serializer,a._byteString)};if(a instanceof qn){let s=r.databaseId,i=a.firestore._databaseId;if(!i.isEqual(s))throw r.createError(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:G0(a.firestore._databaseId||r.databaseId,a._key.path)}}if(a instanceof tr)return function(i,u){let l=i instanceof tr?i.toArray():i;return{mapValue:{fields:{[qS]:{stringValue:zS},[cu]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw u.createError("VectorValues must only contain numeric values.");return WS(u.serializer,f)})}}}}}}(a,r);if($0(a))return a._toProto(r.serializer);throw r.createError(`Unsupported field value: ${Hc(a)}`)}(t,e)}function cF(t,e){let n={};return g0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):bu(t,(a,r)=>{let s=iv(r,e.childContextForField(a));s!=null&&(n[a]=s)}),{mapValue:{fields:n}}}function gR(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof Bt||t instanceof Ur||t instanceof er||t instanceof qn||t instanceof qc||t instanceof tr||$0(t))}function dF(t,e,n){if(!gR(n)||!e0(n)){let a=Hc(n);throw a==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+a)}}function $c(t,e,n){if((e=an(e))instanceof Su)return e._internalPath;if(typeof e=="string")return yR(t,e);throw Lp("Field path arguments must be of type string or ",t,!1,void 0,n)}var fF=new RegExp("[~\\*/\\[\\]]");function yR(t,e,n){if(e.search(fF)>=0)throw Lp(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Su(...e.split("."))._internalPath}catch{throw Lp(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Lp(t,e,n,a,r){let s=a&&!a.isEmpty(),i=r!==void 0,u=`Function ${e}() called with invalid data`;n&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(s||i)&&(l+=" (found",s&&(l+=` in field ${a}`),i&&(l+=` in document ${r}`),l+=")"),new X(z.INVALID_ARGUMENT,u+t+l)}var zc=class{convertValue(e,n="none"){switch(Hs(e)){case 0:return null;case 1:return e.booleanValue;case 2:return yt(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Hr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw le(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){let a={};return bu(e,(r,s)=>{a[r]=this.convertValue(s,n)}),a}convertVectorValue(e){let n=e.fields?.[cu].arrayValue?.values?.map(a=>yt(a.doubleValue));return new tr(n)}convertGeoPoint(e){return new Ur(yt(e.latitude),yt(e.longitude))}convertArray(e,n){return(e.values||[]).map(a=>this.convertValue(a,n))}convertServerTimestamp(e,n){switch(n){case"previous":let a=kp(e);return a==null?null:this.convertValue(a,n);case"estimate":return this.convertTimestamp(Lc(e));default:return null}}convertTimestamp(e){let n=zr(e);return new Bt(n.seconds,n.nanos)}convertDocumentKey(e,n){let a=It.fromString(e);_t(Q0(a),9688,{name:e});let r=new Ac(a.get(1),a.get(3)),s=new te(a.popFirst(5));return r.isEqual(n)||Br(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}};var Ap=class extends zc{constructor(e){super(),this.firestore=e}convertBytes(e){return new er(e)}convertReference(e){let n=this.convertDocumentKey(e,this.firestore._databaseId);return new qn(this.firestore,null,n)}};var IR="@firebase/firestore",_R="4.12.0";var Jc=class{constructor(e,n,a,r,s){this._firestore=e,this._userDataWriter=n,this._key=a,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new qn(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new ov(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let n=this._document.data.field($c("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}},ov=class extends Jc{data(){return super.data()}};function gF(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new X(z.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var Zc=class{},Ru=class extends Zc{};function ed(t,e,...n){let a=[];e instanceof Zc&&a.push(e),a=a.concat(n),function(s){let i=s.filter(l=>l instanceof uv).length,u=s.filter(l=>l instanceof Vp).length;if(i>1||i>0&&u>0)throw new X(z.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(a);for(let r of a)t=r._apply(t);return t}var Vp=class t extends Ru{constructor(e,n,a){super(),this._field=e,this._op=n,this._value=a,this.type="where"}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=this._parse(e);return bR(e._query,n),new Ra(e.firestore,e.converter,Pp(e._query,n))}_parse(e){let n=rv(e.firestore);return function(s,i,u,l,c,f,p){let m;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new X(z.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){vR(p,f);let R=[];for(let P of p)R.push(SR(l,s,P));m={arrayValue:{values:R}}}else m=SR(l,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||vR(p,f),m=sv(u,i,p,f==="in"||f==="not-in");return xt.create(c,f,m)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}};function td(t,e,n){let a=e,r=$c("where",t);return Vp._create(r,a,n)}var uv=class t extends Zc{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new t(e,n)}_parse(e){let n=this._queryConstraints.map(a=>a._parse(e)).filter(a=>a.getFilters().length>0);return n.length===1?n[0]:va.create(n,this._getOperator())}_apply(e){let n=this._parse(e);return n.getFilters().length===0?e:(function(r,s){let i=r,u=s.getFlattenedFilters();for(let l of u)bR(i,l),i=Pp(i,l)}(e._query,n),new Ra(e.firestore,e.converter,Pp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var lv=class t extends Ru{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new t(e,n)}_apply(e){let n=function(r,s,i){if(r.startAt!==null)throw new X(z.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new X(z.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Gs(s,i)}(e._query,this._field,this._direction);return new Ra(e.firestore,e.converter,R0(e._query,n))}};function nd(t,e="asc"){let n=e,a=$c("orderBy",t);return lv._create(a,n)}var cv=class t extends Ru{constructor(e,n,a){super(),this.type=e,this._limit=n,this._limitType=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){return new Ra(e.firestore,e.converter,Rc(e._query,this._limit,this._limitType))}};function ad(t){return t0("limit",t),cv._create("limit",t,"F")}var dv=class t extends Ru{constructor(e,n,a){super(),this.type=e,this._docOrFields=n,this._inclusive=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=yF(e,this.type,this._docOrFields,this._inclusive);return new Ra(e.firestore,e.converter,k0(e._query,n))}};function TR(...t){return dv._create("startAfter",t,!1)}function yF(t,e,n,a){if(n[0]=an(n[0]),n[0]instanceof Jc)return function(s,i,u,l,c){if(!l)throw new X(z.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);let f=[];for(let p of Oi(s))if(p.field.isKeyField())f.push(Kc(i,l.key));else{let m=l.data.field(p.field);if(jc(m))throw new X(z.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+p.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(m===null){let v=p.field.canonicalString();throw new X(z.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${v}' (used as the orderBy) does not exist.`)}f.push(m)}return new Gr(f,c)}(t._query,t.firestore._databaseId,e,n[0]._document,a);{let r=rv(t.firestore);return function(i,u,l,c,f,p){let m=i.explicitOrderBy;if(f.length>m.length)throw new X(z.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let v=[];for(let R=0;R<f.length;R++){let P=f[R];if(m[R].field.isKeyField()){if(typeof P!="string")throw new X(z.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof P}`);if(!Dp(i)&&P.indexOf("/")!==-1)throw new X(z.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${P}' contains a slash.`);let x=i.path.child(It.fromString(P));if(!te.isDocumentKey(x))throw new X(z.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${x}' is not because it contains an odd number of segments.`);let E=new te(x);v.push(Kc(u,E))}else{let x=sv(l,c,P);v.push(x)}}return new Gr(v,p)}(t._query,t.firestore._databaseId,r,e,n,a)}}function SR(t,e,n){if(typeof(n=an(n))=="string"){if(n==="")throw new X(z.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Dp(e)&&n.indexOf("/")!==-1)throw new X(z.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);let a=e.path.child(It.fromString(n));if(!te.isDocumentKey(a))throw new X(z.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${a}' is not because it has an odd number of segments (${a.length}).`);return Kc(t,new te(a))}if(n instanceof qn)return Kc(t,n._key);throw new X(z.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Hc(n)}.`)}function vR(t,e){if(!Array.isArray(t)||t.length===0)throw new X(z.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function bR(t,e){let n=function(r,s){for(let i of r)for(let u of i.getFlattenedFilters())if(s.indexOf(u.op)>=0)return u.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new X(z.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new X(z.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}var Cu=class{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},Lu=class t extends Jc{constructor(e,n,a,r,s,i){super(e,n,a,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let n=new Au(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){let a=this._document.data.field($c("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new X(z.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,n={};return n.type=t._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}};Lu._jsonSchemaVersion="firestore/documentSnapshot/1.0",Lu._jsonSchema={type:Rt("string",Lu._jsonSchemaVersion),bundleSource:Rt("string","DocumentSnapshot"),bundleName:Rt("string"),bundle:Rt("string")};var Au=class extends Lu{data(e={}){return super.data(e)}},xu=class t{constructor(e,n,a,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new Cu(r.hasPendingWrites,r.fromCache),this.query=a}get docs(){let e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(a=>{e.call(n,new Au(this._firestore,this._userDataWriter,a.key,a,new Cu(this._snapshot.mutatedKeys.has(a.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new X(z.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(r,s){if(r._snapshot.oldDocs.isEmpty()){let i=0;return r._snapshot.docChanges.map(u=>{let l=new Au(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Cu(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:i++}})}{let i=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(u=>s||u.type!==3).map(u=>{let l=new Au(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Cu(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter),c=-1,f=-1;return u.type!==0&&(c=i.indexOf(u.doc.key),i=i.delete(u.doc.key)),u.type!==1&&(i=i.add(u.doc),f=i.indexOf(u.doc.key)),{type:IF(u.type),doc:l,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new X(z.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=ou.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let n=[],a=[],r=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),a.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),r.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function IF(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return le(61501,{type:t})}}xu._jsonSchemaVersion="firestore/querySnapshot/1.0",xu._jsonSchema={type:Rt("string",xu._jsonSchemaVersion),bundleSource:Rt("string","QuerySnapshot"),bundleName:Rt("string"),bundle:Rt("string")};function Up(t){t=Gc(t,Ra);let e=Gc(t.firestore,_u),n=av(e),a=new Ap(e);return gF(t._query),dR(n,t._query).then(r=>new xu(e,a,t,r))}(function(e,n=!0){$x(Wa),Ka(new Fn("firestore",(a,{instanceIdentifier:r,options:s})=>{let i=a.getProvider("app").getImmediate(),u=new _u(new ep(a.getProvider("auth-internal")),new np(i,a.getProvider("app-check-internal")),v0(i,r),i);return s={useFetchStreams:n,...s},u._setSettings(s),u},"PUBLIC").setMultipleInstances(!0)),Un(IR,_R,e),Un(IR,_R,"esm2020")})();var RR="firebasestorage.googleapis.com",_F="storageBucket",SF=2*60*1e3,vF=10*60*1e3;var ar=class t extends xn{constructor(e,n,a=0){super(hv(e),`Firebase Storage: ${n} (${hv(e)})`),this.status_=a,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return hv(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},rr;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(rr||(rr={}));function hv(t){return"storage/"+t}function EF(){let t="An unknown error occurred, please check the error payload for server response.";return new ar(rr.UNKNOWN,t)}function TF(){return new ar(rr.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function bF(){return new ar(rr.CANCELED,"User canceled the upload/download.")}function wF(t){return new ar(rr.INVALID_URL,"Invalid URL '"+t+"'.")}function CF(t){return new ar(rr.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function wR(t){return new ar(rr.INVALID_ARGUMENT,t)}function kR(){return new ar(rr.APP_DELETED,"The Firebase app was deleted.")}function LF(t){return new ar(rr.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}var Wr=class t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let a;try{a=t.makeFromUrl(e,n)}catch{return new t(e,"")}if(a.path==="")return a;throw CF(e)}static makeFromUrl(e,n){let a=null,r="([A-Za-z0-9.\\-_]+)";function s(A){A.path.charAt(A.path.length-1)==="/"&&(A.path_=A.path_.slice(0,-1))}let i="(/(.*))?$",u=new RegExp("^gs://"+r+i,"i"),l={bucket:1,path:3};function c(A){A.path_=decodeURIComponent(A.path)}let f="v[A-Za-z0-9_]+",p=n.replace(/[.]/g,"\\."),m="(/([^?#]*).*)?$",v=new RegExp(`^https?://${p}/${f}/b/${r}/o${m}`,"i"),R={bucket:1,path:3},P=n===RR?"(?:storage.googleapis.com|storage.cloud.google.com)":n,x="([^?#]*)",E=new RegExp(`^https?://${P}/${r}/${x}`,"i"),w=[{regex:u,indices:l,postModify:s},{regex:v,indices:R,postModify:c},{regex:E,indices:{bucket:1,path:2},postModify:c}];for(let A=0;A<w.length;A++){let B=w[A],j=B.regex.exec(e);if(j){let _=j[B.indices.bucket],g=j[B.indices.path];g||(g=""),a=new t(_,g),B.postModify(a);break}}if(a==null)throw wF(e);return a}},pv=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function AF(t,e,n){let a=1,r=null,s=null,i=!1,u=0;function l(){return u===2}let c=!1;function f(...x){c||(c=!0,e.apply(null,x))}function p(x){r=setTimeout(()=>{r=null,t(v,l())},x)}function m(){s&&clearTimeout(s)}function v(x,...E){if(c){m();return}if(x){m(),f.call(null,x,...E);return}if(l()||i){m(),f.call(null,x,...E);return}a<64&&(a*=2);let w;u===1?(u=2,w=0):w=(a+Math.random())*1e3,p(w)}let R=!1;function P(x){R||(R=!0,m(),!c&&(r!==null?(x||(u=2),clearTimeout(r),p(0)):x||(u=1)))}return p(0),s=setTimeout(()=>{i=!0,P(!0)},n),P}function xF(t){t(!1)}function RF(t){return t!==void 0}function CR(t,e,n,a){if(a<e)throw wR(`Invalid value for '${t}'. Expected ${e} or greater.`);if(a>n)throw wR(`Invalid value for '${t}'. Expected ${n} or less.`)}function kF(t){let e=encodeURIComponent,n="?";for(let a in t)if(t.hasOwnProperty(a)){let r=e(a)+"="+e(t[a]);n=n+r+"&"}return n=n.slice(0,-1),n}var Bp;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Bp||(Bp={}));function DF(t,e){let n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return n||r||s}var mv=class{constructor(e,n,a,r,s,i,u,l,c,f,p,m=!0,v=!1){this.url_=e,this.method_=n,this.headers_=a,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=i,this.callback_=u,this.errorCallback_=l,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=p,this.retry=m,this.isUsingEmulator=v,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,P)=>{this.resolve_=R,this.reject_=P,this.start_()})}start_(){let e=(a,r)=>{if(r){a(!1,new ku(!1,null,!0));return}let s=this.connectionFactory_();this.pendingConnection_=s;let i=u=>{let l=u.loaded,c=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,c)};this.progressCallback_!==null&&s.addUploadProgressListener(i),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(i),this.pendingConnection_=null;let u=s.getErrorCode()===Bp.NO_ERROR,l=s.getStatus();if(!u||DF(l,this.additionalRetryCodes_)&&this.retry){let f=s.getErrorCode()===Bp.ABORT;a(!1,new ku(!1,null,f));return}let c=this.successCodes_.indexOf(l)!==-1;a(!0,new ku(c,s))})},n=(a,r)=>{let s=this.resolve_,i=this.reject_,u=r.connection;if(r.wasSuccessCode)try{let l=this.callback_(u,u.getResponse());RF(l)?s(l):s()}catch(l){i(l)}else if(u!==null){let l=EF();l.serverResponse=u.getErrorText(),this.errorCallback_?i(this.errorCallback_(u,l)):i(l)}else if(r.canceled){let l=this.appDelete_?kR():bF();i(l)}else{let l=TF();i(l)}};this.canceled_?n(!1,new ku(!1,null,!0)):this.backoffId_=AF(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&xF(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},ku=class{constructor(e,n,a){this.wasSuccessCode=e,this.connection=n,this.canceled=!!a}};function PF(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function OF(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function MF(t,e){e&&(t["X-Firebase-GMPID"]=e)}function NF(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function VF(t,e,n,a,r,s,i=!0,u=!1){let l=kF(t.urlParams),c=t.url+l,f=Object.assign({},t.headers);return MF(f,e),PF(f,n),OF(f,s),NF(f,a),new mv(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,i,u)}function FF(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function UF(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}var M6=256*1024;var gv=class t{constructor(e,n){this._service=e,n instanceof Wr?this._location=n:this._location=Wr.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new t(e,n)}get root(){let e=new Wr(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return UF(this._location.path)}get storage(){return this._service}get parent(){let e=FF(this._location.path);if(e===null)return null;let n=new Wr(this._location.bucket,e);return new t(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw LF(e)}};function LR(t,e){let n=e?.[_F];return n==null?null:Wr.makeFromBucketSpec(n,t)}function BF(t,e,n,a={}){t.host=`${e}:${n}`;let r=Ga(e);r&&(Ho(`https://${t.host}/b`),Go("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:s}=a;s&&(t._overrideAuthToken=typeof s=="string"?s:uh(s,t.app.options.projectId))}var yv=class{constructor(e,n,a,r,s,i=!1){this.app=e,this._authProvider=n,this._appCheckProvider=a,this._url=r,this._firebaseVersion=s,this._isUsingEmulator=i,this._bucket=null,this._host=RR,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=SF,this._maxUploadRetryTime=vF,this._requests=new Set,r!=null?this._bucket=Wr.makeFromBucketSpec(r,this._host):this._bucket=LR(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Wr.makeFromBucketSpec(this._url,e):this._bucket=LR(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){CR("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){CR("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Bn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new gv(this,e)}_makeRequest(e,n,a,r,s=!0){if(this._deleted)return new pv(kR());{let i=VF(e,this._appId,a,r,n,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(e,n){let[a,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,a,r).getPromise()}},AR="@firebase/storage",xR="0.14.1";var DR="storage";function PR(t=Xo(),e){t=an(t);let a=Ti(t,DR).getImmediate({identifier:e}),r=oh("storage");return r&&qF(a,...r),a}function qF(t,e,n,a={}){BF(t,e,n,a)}function zF(t,{instanceIdentifier:e}){let n=t.getProvider("app").getImmediate(),a=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new yv(n,a,r,e,Wa)}function HF(){Ka(new Fn(DR,zF,"PUBLIC").setMultipleInstances(!0)),Un(AR,xR,""),Un(AR,xR,"esm2020")}HF();var OR={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var Iv=xI(OR),MR=i_(Iv),qp=nv(Iv),j6=PR(Iv);var _v=null,Sv=null;async function GF(t){let e=Date.now();if(_v&&Sv&&e<Sv)return _v;let n=await t.getIdToken(),a=await t.getIdTokenResult();return _v=n,Sv=a.expirationTime?new Date(a.expirationTime).getTime()-6e4:e+6e4,n}function jF(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let n=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return n.startsWith("http")?t:e+n}var KF=25e3;async function vv(t,e={}){let n=MR.currentUser;if(!n)throw new Error("User not authenticated");let a=await GF(n),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${a}`);let s=e.timeout!==void 0?e.timeout:KF,{timeout:i,...u}=e,l=u.signal,c=null,f=null;s>0&&(c=new AbortController,f=setTimeout(()=>{console.warn("[authFetch] Request exceeded timeout threshold:",s,"ms"),c.abort()},s),l=u.signal?(()=>{let p=new AbortController;return u.signal?.addEventListener("abort",()=>{clearTimeout(f),p.abort()}),c.signal.addEventListener("abort",()=>p.abort()),p.signal})():c.signal);try{let p=await fetch(jF(t),{...u,headers:r,signal:l??u.signal});return f&&clearTimeout(f),p}catch(p){throw f&&clearTimeout(f),p instanceof Error&&p.name==="AbortError"&&c?.signal.aborted?new Error("Request timed out"):p}}var Ev=null;function WF(){if(typeof window>"u")return null;if(!Ev)try{Ev=new AudioContext}catch{return null}return Ev}function NR(){let t=WF();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(400,e+.02),n.type="sine",a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.05),n.start(e),n.stop(e+.05)}var F=Ce(Kn());var XF=typeof process<"u"&&!1;function zp(t,e){if(XF&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var $F=20;function JF(t){let e=t.data(),n=e.status??"open",a=e.isResolved===!0||n==="resolved"||n==="done",r=n==="skipped";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:a,isSkipped:r||void 0,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null,clarityScore:e.clarityScore??null,clarityStatus:e.clarityStatus??null,clarityIssues:e.clarityIssues??null,clarityConfidence:e.clarityConfidence??null,clarityCheckedAt:e.clarityCheckedAt??null}}async function BR(t,e=$F,n){zp(e,"getSessionFeedbackPageRepo");let a=Qc(qp,"feedback"),r=n!=null?ed(a,td("sessionId","==",t),nd("createdAt","desc"),ad(e),TR(n)):ed(a,td("sessionId","==",t),nd("createdAt","desc"),ad(e)),s=Date.now(),i=await Up(r),u=Date.now()-s;console.log(`[FIRESTORE] query duration: ${u}ms`);let l=i.docs,c=l.map(JF),f=l.length>0?l[l.length-1]:null,p=l.length===e;return{feedback:c,lastVisibleDoc:f,hasMore:p}}async function qR(t,e=50){let{feedback:n}=await BR(t,e);return n}var zR=new Set(["script","style","noscript","iframe","svg"]);function qt(t){if(!t)return!1;let e=t instanceof Element?t:t.parentElement;if(!e)return!1;let n=t instanceof Element?t:e;if(n.id&&String(n.id).toLowerCase().startsWith("echly"))return!0;let a=n.className;if(a&&typeof a=="string"&&a.includes("echly")||n instanceof Element&&n.getAttribute?.("data-echly-ui")!=null||n instanceof Element&&n.closest?.("[data-echly-ui]"))return!0;let r=n.getRootNode?.();return!!(r&&r instanceof ShadowRoot&&qt(r.host))}function Hp(t){if(!(t instanceof HTMLElement)||t.getAttribute?.("aria-hidden")==="true")return!0;let e=t.ownerDocument?.defaultView?.getComputedStyle?.(t);return e?e.display==="none"||e.visibility==="hidden":!1}function eU(t){if(!t?.getRootNode||qt(t))return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let n=[],a=t;for(;a&&a!==e.body&&n.length<12;){let s=a.tagName.toLowerCase(),i=a.id?.trim();if(i&&/^[a-zA-Z][\w-]*$/.test(i)&&!i.includes(" ")){s+=`#${i}`,n.unshift(s);break}let u=a.getAttribute?.("class")?.trim();if(u){let p=u.split(/\s+/).find(m=>m.length>0&&/^[a-zA-Z_][\w-]*$/.test(m));p&&(s+=`.${p}`)}let l=a.parentElement;if(!l)break;let c=l.children,f=0;for(let p=0;p<c.length;p++)if(c[p]===a){f=p+1;break}s+=`:nth-child(${f})`,n.unshift(s),a=l}return n.length===0?null:n.join(" > ")}function tU(t){if(!t||qt(t))return null;let e=[],n=t.ownerDocument.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode(i){let u=i.parentElement;if(!u||qt(u))return NodeFilter.FILTER_REJECT;let l=u.getRootNode?.();if(l&&l instanceof ShadowRoot&&qt(l.host))return NodeFilter.FILTER_REJECT;let c=u.tagName.toLowerCase();return zR.has(c)||Hp(u)?NodeFilter.FILTER_REJECT:(i.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),a=0,r=n.nextNode();for(;r&&a<2e3;){let i=(r.textContent??"").trim();if(i.length>0){let u=i.slice(0,2e3-a);e.push(u),a+=u.length}r=n.nextNode()}return e.length===0?null:e.join(" ").replace(/\s+/g," ").trim().slice(0,2e3)||null}function nU(t){if(!t||qt(t))return null;let e=[];function n(i){if(!i||qt(i)||Hp(i))return;let l=(i.innerText??i.textContent??"").replace(/\s+/g," ").trim().slice(0,200);l.length>0&&e.push(l)}let a=t.getAttribute?.("aria-label")||t.placeholder||(t.innerText??t.textContent??"").trim();a&&e.push(String(a).slice(0,120));let r=t.parentElement;if(r&&!qt(r)&&!Hp(r)&&n(r),r)for(let i=0;i<r.children.length;i++){let u=r.children[i];u!==t&&!qt(u)&&n(u)}for(let i=0;i<t.children.length;i++)qt(t.children[i])||n(t.children[i]);let s=e.filter(Boolean).join(" ").replace(/\s+/g," ").trim();return s?s.length>800?s.slice(0,800)+"\u2026":s:null}function aU(t){if(!t?.document?.body)return null;let e=t.document,n=e.body,a=[],r=e.createTreeWalker(n,NodeFilter.SHOW_TEXT,{acceptNode(l){let c=l.parentElement;if(!c||qt(c))return NodeFilter.FILTER_REJECT;let f=c.getRootNode?.();if(f&&f instanceof ShadowRoot&&qt(f.host))return NodeFilter.FILTER_REJECT;let p=c.tagName.toLowerCase();if(zR.has(p)||Hp(c))return NodeFilter.FILTER_REJECT;let m=c.getBoundingClientRect?.();return m&&(m.top>=t.innerHeight||m.bottom<=0||m.left>=t.innerWidth||m.right<=0)?NodeFilter.FILTER_REJECT:(l.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),s=0,i=r.nextNode();for(;i&&s<1500;){let l=(i.textContent??"").trim();if(l.length>0){let c=l.slice(0,1500-s);a.push(c),s+=c.length}i=r.nextNode()}return a.length===0?null:a.join(" ").replace(/\s+/g," ").trim().slice(0,1500)||null}function sr(t,e){try{typeof console<"u"&&console.log&&console.log(`ECHLY DEBUG \u2014 ${t}`,e)}catch{}}function Gp(t,e){let n=e;for(;n&&qt(n);)n=n.parentElement;let a=n?eU(n):null,r=n?tU(n):null,s=n?nU(n):null,i=aU(t);if(n&&!qt(n)&&n!==t.document?.body){if(!r?.trim()){let c=(n.innerText??n.textContent??"").replace(/\s+/g," ").trim().slice(0,2e3)||null;c&&(r=c),r&&sr("SUBTREE TEXT FALLBACK USED","element.innerText")}!s?.trim()&&n.parentElement&&!qt(n.parentElement)&&(s=(n.parentElement.innerText??n.parentElement.textContent??"").replace(/\s+/g," ").trim().slice(0,800)||null,s&&sr("NEARBY TEXT FALLBACK USED","parent.innerText"))}i?.trim()||sr("VISIBLE TEXT FALLBACK USED","(skipped to avoid Echly UI)");let u={url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:a,nearbyText:s??null,subtreeText:r??null,visibleText:i??null,capturedAt:Date.now()};return sr("DOM PATH",u.domPath??"(none)"),sr("SUBTREE TEXT SIZE",u.subtreeText?.length??0),sr("NEARBY TEXT SIZE",u.nearbyText?.length??0),sr("VISIBLE TEXT SIZE",u.visibleText?.length??0),sr("DOM SCOPE SAMPLE",(u.subtreeText??"").slice(0,200)||"(empty)"),sr("NEARBY SCOPE SAMPLE",(u.nearbyText??"").slice(0,200)||"(empty)"),sr("VISIBLE TEXT SAMPLE",(u.visibleText??"").slice(0,200)||"(empty)"),u}var Tv=null;function rU(){if(typeof window>"u")return null;if(!Tv)try{Tv=new AudioContext}catch{return null}return Tv}function jp(){let t=rU();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(600,e+.04),n.type="sine",a.gain.setValueAtTime(.04,e),a.gain.exponentialRampToValueAtTime(.001,e+.06),n.start(e),n.stop(e+.06)}var sU="[SESSION]";function Ws(t){typeof console<"u"&&console.debug&&console.debug(`${sU} ${t}`)}function Kp(t){if(!t||t===document.body||qt(t))return!1;let e=document.getElementById("echly-shadow-host");if(e&&e.contains(t))return!1;let n=t.tagName?.toLowerCase();if(n==="input"||n==="textarea"||n==="select")return!1;let a=t.getAttribute?.("contenteditable");return!(a==="true"||a==="")}var Qt=Ce(Kn());var Xr=Ce(St()),Du=24,Xp="cubic-bezier(0.22, 0.61, 0.36, 1)";async function bv(t,e,n){return new Promise((a,r)=>{let s=new Image;s.crossOrigin="anonymous",s.onload=()=>{let i=Math.round(e.x*n),u=Math.round(e.y*n),l=Math.round(e.w*n),c=Math.round(e.h*n),f=document.createElement("canvas");f.width=l,f.height=c;let p=f.getContext("2d");if(!p){r(new Error("No canvas context"));return}p.drawImage(s,i,u,l,c,0,0,l,c);try{a(f.toDataURL("image/png"))}catch(m){r(m)}},s.onerror=()=>r(new Error("Image load failed")),s.src=t})}function KR({getFullTabImage:t,onAddVoice:e,onCancel:n,onSelectionStart:a}){let[r,s]=(0,Qt.useState)(null),[i,u]=(0,Qt.useState)(null),[l,c]=(0,Qt.useState)(!1),[f,p]=(0,Qt.useState)(!1),m=(0,Qt.useRef)(null),v=(0,Qt.useRef)(null),R=(0,Qt.useCallback)(()=>{s(null),u(null),m.current=null,v.current=null,setTimeout(()=>n(),120)},[n]);(0,Qt.useEffect)(()=>{let g=S=>{S.key==="Escape"&&(S.preventDefault(),i?(u(null),s(null),v.current=null,m.current=null):R())};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[R,i]),(0,Qt.useEffect)(()=>{let g=()=>{document.visibilityState==="hidden"&&R()};return document.addEventListener("visibilitychange",g),()=>document.removeEventListener("visibilitychange",g)},[R]);let P=(0,Qt.useCallback)(async g=>{if(l)return;c(!0),jp(),p(!0),setTimeout(()=>p(!1),150),await new Promise(oe=>setTimeout(oe,200));let S=null;try{S=await t()}catch{c(!1),n();return}if(!S){c(!1),n();return}let T=typeof window<"u"&&window.devicePixelRatio||1,C;try{C=await bv(S,g,T)}catch{c(!1),n();return}let L=g.x+g.w/2,b=g.y+g.h/2,ce=null;if(typeof document<"u"&&document.elementsFromPoint)for(ce=document.elementsFromPoint(L,b).find(D=>!qt(D))??document.elementFromPoint(L,b)??document.elementFromPoint(g.x+2,g.y+2);ce&&qt(ce);)ce=ce.parentElement;let ve=typeof window<"u"?Gp(window,ce):null;e(C,ve),c(!1),u(null)},[t,e,n,l]),x=(0,Qt.useCallback)(()=>{u(null),s(null),v.current=null,m.current=null},[]),E=(0,Qt.useCallback)(g=>{if(g.button!==0||i)return;g.preventDefault(),a?.();let S=g.clientX,T=g.clientY;m.current={x:S,y:T},s({x:S,y:T,w:0,h:0})},[a,i]),I=(0,Qt.useCallback)(g=>{if(g.button!==0)return;g.preventDefault();let S=v.current,T=m.current;if(m.current=null,!T||!S||S.w<Du||S.h<Du){s(null);return}s(null),v.current=null,u({x:S.x,y:S.y,w:S.w,h:S.h})},[]),w=(0,Qt.useCallback)(g=>{if(!m.current||i)return;let S=m.current.x,T=m.current.y,C=Math.min(S,g.clientX),L=Math.min(T,g.clientY),b=Math.abs(g.clientX-S),ce=Math.abs(g.clientY-T),ve={x:C,y:L,w:b,h:ce};v.current=ve,s(ve)},[i]);(0,Qt.useEffect)(()=>{let g=S=>{if(S.button!==0||!m.current||i)return;let T=v.current,C=m.current;if(m.current=null,!C||!T||T.w<Du||T.h<Du){s(null),v.current=null;return}s(null),v.current=null,u({x:T.x,y:T.y,w:T.w,h:T.h})};return window.addEventListener("mouseup",g),()=>window.removeEventListener("mouseup",g)},[i]);let A=!!r&&(r.w>=Du||r.h>=Du),B=i!==null,j=A&&r||B&&i,_=B?i:r;return(0,Xr.jsxs)("div",{id:"echly-overlay",role:"presentation","aria-hidden":!0,className:"echly-region-overlay","data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,Xr.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:j?"transparent":"rgba(0,0,0,0.4)",pointerEvents:i?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${Xp}`},onMouseDown:E,onMouseMove:w,onMouseUp:I,onMouseLeave:()=>{!m.current||i||(s(null),m.current=null,v.current=null)}}),(0,Xr.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",zIndex:2147483647,pointerEvents:"none",opacity:i?0:1,transition:`opacity 180ms ${Xp}`},children:"Drag to capture area \u2014 ESC to cancel"}),j&&_&&(0,Xr.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:_.x,top:_.y,width:Math.max(_.w,1),height:Math.max(_.h,1),border:`2px solid ${f?"#FFFFFF":"#466EFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.4)",pointerEvents:"none",zIndex:2147483646,borderRadius:14,transition:f?"none":`border-color 150ms ${Xp}`}}),B&&i&&(0,Xr.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:i.x+i.w/2,bottom:Math.max(12,i.y+i.h-48),transform:"translate(-50%, 100%)",display:"flex",background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${Xp} forwards`},children:[(0,Xr.jsx)("button",{type:"button",onClick:x,className:"echly-region-confirm-btn",style:{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",cursor:"pointer"},children:"Retake"}),(0,Xr.jsx)("button",{type:"button",onClick:()=>P(i),disabled:l,className:"echly-region-confirm-btn",style:{background:"#466EFF",color:"#fff",fontWeight:600,cursor:l?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var WR=40;function uU(t,e=WR,n,a){let r=t.getBoundingClientRect(),s=n??(typeof window<"u"?window.innerWidth:0),i=a??(typeof window<"u"?window.innerHeight:0),u=Math.max(0,r.left-e),l=Math.max(0,r.top-e),c=s-u,f=i-l,p=Math.min(r.width+e*2,c),m=Math.min(r.height+e*2,f);return{x:u,y:l,w:Math.max(1,p),h:Math.max(1,m)}}async function XR(t,e,n=WR){let a=typeof window<"u"&&window.devicePixelRatio||1,r=uU(e,n);return bv(t,r,a)}var wv="[SESSION]",Cv=null,ka=[],Pu=null,Ou=null;function QR(t){let e=t.getBoundingClientRect();return{x:e.left+e.width/2,y:e.top+e.height/2}}function $R(t,e,n){t.style.left=`${e}px`,t.style.top=`${n}px`,t.style.transform="translate(-50%, -50%)"}function lU(){Pu&&Ou||(Pu=()=>YR(),Ou=()=>YR(),window.addEventListener("scroll",Pu,{passive:!0,capture:!0}),window.addEventListener("resize",Ou))}function JR(){Pu&&(window.removeEventListener("scroll",Pu,{capture:!0}),Pu=null),Ou&&(window.removeEventListener("resize",Ou),Ou=null)}function Lv(t,e,n={}){let{onMarkerClick:a,getSessionPaused:r}=n;if(!t)return;let s=document.getElementById("echly-marker-layer");if(!s)return;Cv=s;let i=ka.length+1,u=e.x,l=e.y;if(e.element){let p=QR(e.element);u=p.x,l=p.y}let c=document.createElement("div");c.className="echly-feedback-marker",c.setAttribute("data-echly-ui","true"),c.setAttribute("aria-label",`Feedback ${i}`),c.textContent=String(i),c.title=e.title??`Feedback #${i}`,c.style.cssText=["width:22px","height:22px","border-radius:50%","background:#2563eb","color:white","font-size:12px","font-weight:600","display:flex","align-items:center","justify-content:center","position:fixed","z-index:2147483646","box-shadow:0 4px 12px rgba(0,0,0,0.15)","cursor:pointer","pointer-events:auto","box-sizing:border-box"].join(";"),$R(c,u,l);let f={...e,x:u,y:l,index:i,domElement:c};ka.push(f),c.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation(),!r?.()&&(console.log(`${wv} marker clicked`,f.id),a?.({id:f.id,x:f.x,y:f.y,element:f.element,title:f.title,index:f.index}))}),Cv.appendChild(c),ka.length===1&&lU(),console.log(`${wv} marker created`,f.id,i)}function Av(t,e){let n=ka.find(a=>a.id===t);n&&(e.id!=null&&(n.id=e.id),e.title!=null&&(n.title=e.title),n.domElement.title=n.title??`Feedback #${n.index}`)}function rd(t){let e=ka.findIndex(a=>a.id===t);if(e===-1)return;ka[e].domElement.remove(),ka.splice(e,1),ka.length===0&&JR()}function YR(){for(let t of ka)if(t.element&&t.element.isConnected){let{x:e,y:n}=QR(t.element);t.x=e,t.y=n,$R(t.domElement,e,n)}}function ZR(){let t=document.getElementById("echly-marker-layer");if(t)for(;t.firstChild;)t.removeChild(t.firstChild);for(let e of ka)console.log(`${wv} marker removed`,e.id);ka.length=0,Cv=null,JR()}function de(t,e,n){let a=`[ECHLY][${t}]`;n!==void 0?console.log(a,e,n):console.log(a,e)}var Yp=24;var dU="echly-capture-root",nk=120;function fU(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let n=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),a=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(n&&!a)return"negative";if(a&&!n)return"positive";if(n&&a){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,s=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>s?"negative":s>r?"positive":"neutral"}return"neutral"}function xv(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}async function hU(t){let e=document.getElementById(dU),n=e?.style.display??"";try{return e&&(e.style.display="none",await new Promise(a=>requestAnimationFrame(()=>a()))),await t()}finally{e&&(e.style.display=n)}}var Qp=["focus_mode","region_selecting","voice_listening","processing"];function ak({sessionId:t,extensionMode:e=!1,initialPointers:n,onComplete:a,onDelete:r,onUpdate:s,onRecordingChange:i,loadSessionWithPointers:u,onSessionLoaded:l,onCreateSession:c,onActiveSessionChange:f,globalSessionModeActive:p,globalSessionPaused:m,onSessionModeStart:v,onSessionModePause:R,onSessionModeResume:P,onSessionModeEnd:x}){let[E,I]=(0,F.useState)([]),[w,A]=(0,F.useState)(null),[B,j]=(0,F.useState)(!1),[_,g]=(0,F.useState)("idle"),[S,T]=(0,F.useState)(null),[C,L]=(0,F.useState)(n??[]),[b,ce]=(0,F.useState)(null),[ve,oe]=(0,F.useState)(null),[D,M]=(0,F.useState)(""),[q,Z]=(0,F.useState)([]),[Y,ne]=(0,F.useState)(!1),[at,Ue]=(0,F.useState)(null),[et,rt]=(0,F.useState)(!1),[sa,Rn]=(0,F.useState)(null),[ln,Da]=(0,F.useState)(0),[ur,In]=(0,F.useState)(!0),[N,Q]=(0,F.useState)(null),[ae,fe]=(0,F.useState)(!1),[ue,Ae]=(0,F.useState)(!1),[Ve,pe]=(0,F.useState)(null),[we,Be]=(0,F.useState)(!1),[st,Xe]=(0,F.useState)(!1),[ht,ye]=(0,F.useState)(!1),[Ne,je]=(0,F.useState)(!1),[ot,Kt]=(0,F.useState)(!1),[Et,Ye]=(0,F.useState)(null),[Ea,ke]=(0,F.useState)(!1),bn=(0,F.useRef)(!1),_n=(0,F.useRef)(!1),Ge=(0,F.useRef)(null);(0,F.useEffect)(()=>{bn.current=st},[st]),(0,F.useEffect)(()=>{_n.current=ht},[ht]);let De=(0,F.useRef)({x:0,y:0}),Qe=(0,F.useRef)(null),Dt=(0,F.useRef)(null),cn=(0,F.useRef)(null),Ys=(0,F.useRef)(null),ut=(0,F.useRef)(null),ia=(0,F.useRef)(E),wn=(0,F.useRef)(_),Ct=(0,F.useRef)(!1),Nu=(0,F.useRef)(!1),cd=(0,F.useRef)(null),lr=(0,F.useRef)(!1),Vu=(0,F.useRef)(null),Fu=(0,F.useRef)(null),$r=(0,F.useRef)(null),Jr=(0,F.useRef)(null),Qs=(0,F.useRef)(null),Zr=(0,F.useRef)(null),cr=(0,F.useRef)(null),Uu=(0,F.useRef)(null),oa=(0,F.useRef)(!1);(0,F.useEffect)(()=>{wn.current=_},[_]),(0,F.useEffect)(()=>(_==="focus_mode"||_==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[_]),(0,F.useEffect)(()=>{if(_!=="voice_listening"){Jr.current!=null&&(cancelAnimationFrame(Jr.current),Jr.current=null),Vu.current?.getTracks().forEach(re=>re.stop()),Vu.current=null,Fu.current?.close().catch(()=>{}),Fu.current=null,$r.current=null,Da(0);return}let U=$r.current;if(!U)return;let K=new Uint8Array(U.frequencyBinCount),G,J=()=>{U.getByteFrequencyData(K);let re=K.reduce((Ie,Pt)=>Ie+Pt,0),qe=K.length?re/K.length:0,ie=Math.min(1,qe/128);Da(ie),G=requestAnimationFrame(J)};return G=requestAnimationFrame(J),Jr.current=G,()=>{cancelAnimationFrame(G),Jr.current=null}},[_]),(0,F.useEffect)(()=>{cd.current=ve},[ve]),(0,F.useEffect)(()=>{lr.current=Qp.includes(_)},[_]);let qi=(0,F.useRef)(!1);(0,F.useEffect)(()=>{if(!i)return;Qp.includes(_)?(qi.current=!0,i(!0)):qi.current&&(qi.current=!1,i(!1))},[_,i]);let Bu=(0,F.useCallback)(U=>{U===!1&&(lr.current||e||Qp.includes(wn.current)||cd.current)||j(U)},[e]),zi=(0,F.useCallback)(()=>{j(U=>!U)},[]);(0,F.useEffect)(()=>{ut.current=w},[w]),(0,F.useEffect)(()=>{ia.current=E},[E]),(0,F.useEffect)(()=>{let U=G=>{if(!et||!Qe.current)return;G.preventDefault();let J=Qe.current.offsetWidth,re=Qe.current.offsetHeight,qe=G.clientX-De.current.x,ie=G.clientY-De.current.y,Ie=window.innerWidth-J-Yp,Pt=window.innerHeight-re-Yp;qe=Math.max(Yp,Math.min(qe,Ie)),ie=Math.max(Yp,Math.min(ie,Pt)),Ue({x:qe,y:ie})},K=()=>{et&&(rt(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",U),window.addEventListener("mouseup",K),()=>{window.removeEventListener("mousemove",U),window.removeEventListener("mouseup",K)}},[et]);let Hi=(0,F.useCallback)(U=>{if(U.button!==0||!Qe.current)return;let K=Qe.current.getBoundingClientRect();rt(!0),document.body.style.userSelect="none",De.current={x:U.clientX-K.left,y:U.clientY-K.top},Ue({x:K.left,y:K.top})},[]),dr=(0,F.useCallback)(()=>{if(Dt.current)return;Ye(null);let U=document.createElement("div");U.id="echly-capture-root",document.body.appendChild(U),Dt.current=U,pe(U),Ae(!0)},[]);(0,F.useEffect)(()=>{let U=document.getElementById("echly-capture-root");if(!U||U.querySelector("#echly-marker-layer"))return;let K=document.createElement("div");K.id="echly-marker-layer",K.style.cssText=["position:fixed","top:0","left:0","width:100%","height:100%","pointer-events:none","z-index:2147483646"].join(";"),U.appendChild(K)},[Ve]);let zn=(0,F.useCallback)(()=>{if(!(e&&p!==!1)){if(Dt.current){try{document.body.removeChild(Dt.current)}catch(U){console.error("CaptureWidget error:",U)}Dt.current=null}pe(null),Ae(!1)}},[e,p]),ua=(0,F.useCallback)(()=>{g("idle"),j(ur)},[ur]),es=(0,F.useCallback)(U=>{let K=U==="pause"?Qs:Zr;K.current!=null&&(window.clearTimeout(K.current),K.current=null)},[]);(0,F.useEffect)(()=>()=>{Qs.current!=null&&window.clearTimeout(Qs.current),Zr.current!=null&&window.clearTimeout(Zr.current)},[]),(0,F.useEffect)(()=>{if(n!=null){L(n);return}if(!t)return;(async()=>{let K=await qR(t);L(K.map(G=>({id:G.id,title:G.title,actionSteps:G.actionSteps??(G.description?G.description.split(`
`):[]),type:G.type})))})()},[t,n]),(0,F.useEffect)(()=>{let U=window.SpeechRecognition||window.webkitSpeechRecognition;if(!U)return;let K=new U;return K.continuous=!0,K.interimResults=!0,K.lang="en-US",K.onstart=()=>{let G=Date.now();Uu.current=G,console.log("[VOICE] recognition.onstart",G);let J=cr.current;J!=null&&console.log("[VOICE] delay UI recording start\u2192onstart:",G-J,"ms")},K.onspeechstart=()=>{console.log("[VOICE] speech detected",Date.now())},K.onaudiostart=()=>{console.log("[VOICE] audio start",Date.now())},K.onresult=G=>{let J="";for(let ie=0;ie<G.results.length;++ie){let Pt=G.results[ie][0];Pt&&(J+=Pt.transcript+" ")}J=J.replace(/\s+/g," ").trim();let re=Date.now();if(de("RECORDING","result",{transcript:J}),console.log("[VOICE] transcript received",re,J),J&&!oa.current){oa.current=!0,console.log("[VOICE] first transcript chunk:",J,"length:",J.length);let ie=cr.current,Ie=Uu.current;ie!=null&&console.log("[VOICE] delay UI\u2192first transcript:",re-ie,"ms"),Ie!=null&&console.log("[VOICE] delay onstart\u2192first transcript:",re-Ie,"ms")}let qe=ut.current;qe&&I(ie=>ie.map(Ie=>Ie.id===qe?{...Ie,transcript:J}:Ie))},K.onend=()=>{if(!Nu.current){de("RECORDING","unexpected end"),wn.current==="voice_listening"&&g("idle");return}Nu.current=!1;let G=wn.current;G==="processing"||G==="success"||g("idle")},cn.current=K,()=>{try{K.stop()}catch(G){console.error("CaptureWidget error:",G)}}},[]);let Hn=(0,F.useCallback)(async()=>{de("RECORDING","start");let U=Date.now();cr.current=U,Uu.current=null,oa.current=!1,console.log("[VOICE] UI recording started",U);try{let K=await navigator.mediaDevices.getUserMedia({audio:!0});Vu.current=K;let G=new AudioContext,J=G.createAnalyser();J.fftSize=256,J.smoothingTimeConstant=.7,G.createMediaStreamSource(K).connect(J),Fu.current=G,$r.current=J,console.log("[VOICE] recognition.start() called",Date.now()),cn.current?.start(),g("voice_listening"),Da(0)}catch(K){console.error("Microphone permission denied:",K),T("Microphone permission denied."),g("error"),zn(),ua()}},[]),qu=(0,F.useCallback)(async()=>{de("RECORDING","finish requested"),Nu.current=!0,typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),NR(),cn.current?.stop();let U=ut.current;if(!U){g("idle");return}let G=ia.current.find(J=>J.id===U);if(console.log("[VOICE] finishListening transcript:",G?.transcript),!G||!G.transcript||G.transcript.trim().length<5){console.warn("[VOICE] transcript too short, skipping pipeline"),g("idle");return}if(e){if(bn.current){let re=Dt.current,qe=Ge.current??void 0,ie=`pending-${Date.now()}`;re&&Lv(re,{id:ie,x:0,y:0,element:qe,title:"Saving feedback\u2026"},{getSessionPaused:()=>_n.current,onMarkerClick:Ie=>{Q(Ie.id),ce(Ie.id)}}),Ye(null),ke(!0),I(Ie=>Ie.filter(Pt=>Pt.id!==U)),A(null),g("idle"),Ge.current=null,console.log("[VOICE] final transcript sent to pipeline:",G.transcript);try{Ct.current=!0,a(G.transcript,G.screenshot,{onSuccess:Ie=>{Ct.current=!1,ke(!1),re&&Av(ie,{id:Ie.id,title:Ie.title});let Pt=Ie;L(pd=>[{id:Pt.id,title:Pt.title,actionSteps:Pt.actionSteps??(Pt.description?Pt.description.split(`
`):[]),type:Pt.type},...pd]),Q(Ie.id),setTimeout(()=>Q(null),1200)},onError:()=>{Ct.current=!1,ke(!1),re&&rd(ie),T("AI processing failed.")}},G.context??void 0,{sessionMode:!0})}catch(Ie){Ct.current=!1,ke(!1),re&&rd(ie),console.error(Ie),T("AI processing failed.")}return}g("processing"),console.log("[VOICE] final transcript sent to pipeline:",G.transcript),Ct.current=!0,a(G.transcript,G.screenshot,{onSuccess:re=>{Ct.current=!1;let qe=re;L(ie=>[{id:qe.id,title:qe.title,actionSteps:qe.actionSteps??(qe.description?qe.description.split(`
`):[]),type:qe.type},...ie]),I(ie=>ie.filter(Ie=>Ie.id!==U)),A(null),Q(re.id),setTimeout(()=>Q(null),1200),Be(!0),setTimeout(()=>Be(!1),200),fe(!0),setTimeout(()=>{zn(),ua(),fe(!1)},120)},onError:()=>{Ct.current=!1,T("AI processing failed."),g("voice_listening")}},G.context??void 0);return}g("processing"),console.log("[VOICE] final transcript sent to pipeline:",G.transcript);try{let J=await a(G.transcript,G.screenshot);if(!J){g("idle"),zn(),ua();return}L(re=>[{id:J.id,title:J.title,actionSteps:J.actionSteps??[],type:J.type},...re]),I(re=>re.filter(qe=>qe.id!==U)),A(null),Q(J.id),setTimeout(()=>Q(null),1200),Be(!0),setTimeout(()=>Be(!1),200),fe(!0),setTimeout(()=>{zn(),ua(),fe(!1)},120)}catch(J){console.error(J),T("AI processing failed."),g("voice_listening")}},[a,e,zn,ua]),ts=(0,F.useCallback)(()=>{de("RECORDING","discard"),cn.current?.stop();let U=ut.current;I(K=>K.filter(G=>G.id!==U)),A(null),g("cancelled"),zn(),ua()},[zn,ua]);(0,F.useEffect)(()=>{if(!ue)return;let U=K=>{K.key==="Escape"&&(K.preventDefault(),Qp.includes(wn.current)&&ts())};return document.addEventListener("keydown",U),()=>document.removeEventListener("keydown",U)},[ue,ts]);let ns=(0,F.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),Pa=(0,F.useCallback)(()=>{L([]),I([]),A(null),g("idle"),ce(null),oe(null),ne(!1)},[]);(0,F.useEffect)(()=>{if(e)return;let U=K=>{let G=K.target;Ys.current&&G&&!Ys.current.contains(G)&&ne(!1)};return document.addEventListener("mousedown",U),()=>document.removeEventListener("mousedown",U)},[e]);let Gi=(0,F.useCallback)(async U=>{try{await r(U),L(K=>K.filter(G=>G.id!==U))}catch(K){console.error("Delete failed:",K)}},[r]),dd=(0,F.useCallback)(U=>{oe(U.id),M(U.title),Z(U.actionSteps??[])},[]),zu=(0,F.useCallback)(async U=>{let K=D.trim()||D,G=q;L(J=>J.map(re=>re.id===U?{...re,title:K||re.title,actionSteps:G}:re)),oe(null);try{let J=await vv(`/api/tickets/${U}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:K||D,actionSteps:G})}),re=await J.json();if(J.ok&&re.success&&re.ticket){let qe=re.ticket;L(ie=>ie.map(Ie=>Ie.id===U?{...Ie,title:qe.title,actionSteps:qe.actionSteps??Ie.actionSteps,type:qe.type??Ie.type}:Ie))}}catch(J){console.error("Save edit failed:",J)}},[D,q]),Hu=(0,F.useCallback)(async(U,K)=>{try{if(s){await s(U,K),L(qe=>qe.map(ie=>ie.id===U?{...ie,title:K.title,actionSteps:K.actionSteps}:ie));return}let G=await vv(`/api/tickets/${U}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:K.title,actionSteps:K.actionSteps})}),J=await G.json();if(!G.ok||!J.success)throw new Error("Update failed");let re=J.ticket;L(qe=>qe.map(ie=>ie.id===U?{...ie,title:re?.title??ie.title,actionSteps:re?.actionSteps??K.actionSteps}:ie))}catch(G){throw console.error("Ticket update failed:",G),G}},[s]),Oa=(0,F.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?hU(()=>new Promise((U,K)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},G=>{!G||!G.success?K(new Error("Capture failed")):U(G.screenshot??null)})})):Promise.resolve(null),[]),ji=(0,F.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return Oa();let{captureScreenshot:U}=await Promise.resolve().then(()=>(tk(),ek));return U()},[Oa]),Ki=(0,F.useCallback)(()=>{g("region_selecting")},[]),Gu=(0,F.useCallback)((U,K)=>{let G=xv(),J={id:G,screenshot:U,transcript:"",structuredOutput:null,context:K??null,createdAt:Date.now()};I(re=>[...re,J]),A(G),Hn()},[Hn]),as=(0,F.useCallback)(()=>{g("cancelled"),zn(),ua()},[zn,ua]),ju=(0,F.useCallback)(U=>{let K=ut.current;K&&I(G=>G.map(J=>J.id===K?{...J,transcript:U}:J))},[]),fd=(0,F.useCallback)(async()=>{if(!(wn.current!=="idle"||bn.current||p)){if(de("SESSION","start"),console.log("[Echly] Start New Feedback Session clicked"),Ws("start"),e&&c&&f){let U=await c();if(!U?.id)return;f(U.id),L([]),v?.()}Ye(null),ke(!1),je(!1),Kt(!1)}},[e,c,f,v,p]),Ta=(0,F.useCallback)(()=>{if(!bn.current&&!p||_n.current||Ne||ot)return;de("SESSION","pause requested");let U=()=>{de("SESSION","pause finalized"),es("pause"),Ws("pause"),R?.(),je(!1)};if(Ct.current){es("pause"),je(!0);let K=()=>{if(Ct.current){Qs.current=window.setTimeout(K,nk);return}U()};K();return}U()},[es,ot,p,R,Ne]),Gn=(0,F.useCallback)(()=>{!bn.current&&!p||(de("SESSION","resume"),je(!1),Kt(!1),Ws("resume"),P?.())},[p,P]),rs=(0,F.useCallback)(U=>{if(!bn.current&&!p||ot)return;de("SESSION","end requested");let K=()=>{de("SESSION","end finalized"),es("end"),Ws("end"),je(!1),Kt(!1),Ye(null),ke(!1),L([]),x?.(),U?.()};if(Ct.current){es("end"),Kt(!0);let G=()=>{if(Ct.current){Zr.current=window.setTimeout(G,nk);return}K()};G();return}K()},[es,ot,p,x]);(0,F.useEffect)(()=>{!e||p===void 0||(de("SESSION","global sync",{active:p,paused:m}),p===!0&&(Xe(!0),ye(m??!1),Ye(null),Kt(!1),Dt.current||dr()),m===!0&&(ye(!0),je(!1)),p===!1&&(Xe(!1),ye(!1),je(!1),Kt(!1),Ye(null),ke(!1),ZR(),zn()))},[e,p,m,dr,zn]),(0,F.useEffect)(()=>{e&&p&&m!==void 0&&(ye(m),m&&je(!1))},[e,p,m]),(0,F.useEffect)(()=>{if(!e||p!==!0)return;let U=()=>{document.hidden||!p||Dt.current||(Xe(!0),ye(m??!1),Ye(null),Kt(!1),dr())};return document.addEventListener("visibilitychange",U),()=>document.removeEventListener("visibilitychange",U)},[e,p,m,dr]),(0,F.useEffect)(()=>{!e||!u?.sessionId||(L(u.pointers??[]),Ye(null),l?.())},[e,u,l]);let ss=(0,F.useCallback)(async U=>{if(Et&&!Dt.current){Ye(null);return}if(!Oa||Et!=null)return;Ws("element clicked"),jp();let K=null;try{K=await Oa()}catch{return}if(!K)return;let G;try{G=await XR(K,U)}catch{return}let J=Gp(window,U);Ge.current=U instanceof HTMLElement?U:null,Ye({screenshot:G,context:J})},[Oa,Et]),Wi=(0,F.useCallback)(U=>{let K=Et;if(!K||!U||U.trim().length===0){Ye(null);return}let G=Dt.current,J=Ge.current??void 0,re=`pending-${Date.now()}`;G&&Lv(G,{id:re,x:0,y:0,element:J??void 0,title:"Saving feedback\u2026"},{getSessionPaused:()=>_n.current,onMarkerClick:ie=>{Q(ie.id),ce(ie.id)}}),Ye(null),ke(!0),g("idle"),Ge.current=null,console.log("[VOICE] final transcript sent to pipeline:",U);try{Ct.current=!0,a(U,K.screenshot,{onSuccess:ie=>{Ct.current=!1,ke(!1),G&&Av(re,{id:ie.id,title:ie.title});let Ie=ie;L(Pt=>[{id:Ie.id,title:Ie.title,actionSteps:Ie.actionSteps??(Ie.description?Ie.description.split(`
`):[]),type:Ie.type},...Pt]),Q(ie.id),setTimeout(()=>Q(null),1200)},onError:()=>{Ct.current=!1,ke(!1),G&&rd(re),T("AI processing failed.")}},K.context??void 0,{sessionMode:!0})}catch(ie){Ct.current=!1,ke(!1),G&&rd(re),console.error(ie),T("AI processing failed.")}},[Et,a]),$e=(0,F.useCallback)(()=>{Ye(null),ke(!1)},[]),$s=(0,F.useCallback)(()=>{let U=Et;if(!U)return;let K=xv(),G={id:K,screenshot:U.screenshot,transcript:"",structuredOutput:null,context:U.context??null,createdAt:Date.now()};I(J=>[...J,G]),A(K),Hn()},[Et,Hn]),is=(0,F.useCallback)(async()=>{if(wn.current==="idle"&&(T(null),cn.current?.stop(),In(B),j(!1),dr(),g("focus_mode"),!e))try{let U=await ji();if(!U){as();return}let K=xv(),G={id:K,screenshot:U,transcript:"",structuredOutput:null,createdAt:Date.now()};I(J=>[...J,G]),A(K),Hn()}catch(U){console.error(U),T("Screen capture failed."),g("error"),as()}},[e,B,ji,Hn,dr,as]),Js=(0,F.useMemo)(()=>({setIsOpen:Bu,toggleOpen:zi,startDrag:Hi,handleShare:ns,setShowMenu:ne,resetSession:Pa,startListening:Hn,finishListening:qu,discardListening:ts,deletePointer:Gi,updatePointer:Hu,startEditing:dd,saveEdit:zu,setExpandedId:ce,setEditedTitle:M,setEditedSteps:Z,handleAddFeedback:is,handleRegionCaptured:Gu,handleRegionSelectStart:Ki,handleCancelCapture:as,getFullTabImage:Oa,setActiveRecordingTranscript:ju,startSession:fd,pauseSession:Ta,resumeSession:Gn,endSession:rs,handleSessionElementClicked:ss,handleSessionFeedbackSubmit:Wi,handleSessionFeedbackCancel:$e,handleSessionStartVoice:$s}),[Bu,zi,Hi,ns,Pa,Hn,qu,ts,Gi,Hu,dd,zu,ce,M,Z,is,Gu,Ki,as,Oa,ju,fd,Ta,Gn,rs,ss,Wi,$e,$s]),Ku=(0,F.useMemo)(()=>w?E.find(U=>U.id===w):null,[w,E]),hd=(0,F.useMemo)(()=>_!=="voice_listening"?"neutral":fU(Ku?.transcript??""),[_,Ku?.transcript]),am=Ku?.transcript?.trim()??"";return{state:{isOpen:B,state:_,errorMessage:S,pointers:C,expandedId:b,editingId:ve,editedTitle:D,editedSteps:q,showMenu:Y,position:at,liveTranscript:am,listeningAudioLevel:ln,listeningSentiment:hd,highlightTicketId:N,pillExiting:ae,orbSuccess:we,sessionMode:st,sessionPaused:ht,pausePending:Ne,endPending:ot,sessionFeedbackPending:Et},handlers:Js,refs:{widgetRef:Qe,menuRef:Ys,captureRootRef:Dt},captureRootReady:ue,captureRootEl:Ve}}var Jp=Ce(Kn());var $p=(...t)=>t.filter((e,n,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===n).join(" ").trim();var rk=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var sk=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,a)=>a?a.toUpperCase():n.toLowerCase());var Rv=t=>{let e=sk(t);return e.charAt(0).toUpperCase()+e.slice(1)};var sd=Ce(Kn());var ik={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var ok=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var uk=(0,sd.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:r="",children:s,iconNode:i,...u},l)=>(0,sd.createElement)("svg",{ref:l,...ik,width:e,height:e,stroke:t,strokeWidth:a?Number(n)*24/Number(e):n,className:$p("lucide",r),...!s&&!ok(u)&&{"aria-hidden":"true"},...u},[...i.map(([c,f])=>(0,sd.createElement)(c,f)),...Array.isArray(s)?s:[s]]));var Mu=(t,e)=>{let n=(0,Jp.forwardRef)(({className:a,...r},s)=>(0,Jp.createElement)(uk,{ref:s,iconNode:e,className:$p(`lucide-${rk(Rv(t))}`,`lucide-${t}`,a),...r}));return n.displayName=Rv(t),n};var pU=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],id=Mu("expand",pU);var mU=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],od=Mu("trash-2",mU);var gU=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ud=Mu("x",gU);var yn=Ce(St()),yU=()=>(0,yn.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,yn.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,yn.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),IU=()=>(0,yn.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,yn.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function kv({onClose:t,summary:e=null,theme:n="dark",onThemeToggle:a,handlers:r,onShowCommandScreen:s}){return(0,yn.jsxs)("div",{className:"echly-sidebar-header",children:[(0,yn.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,yn.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,yn.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),(0,yn.jsxs)("div",{className:"echly-header-actions",children:[a&&(0,yn.jsx)("button",{type:"button",id:"theme-toggle",onClick:a,className:"echly-theme-toggle","aria-label":n==="dark"?"Switch to light mode":"Switch to dark mode",children:n==="dark"?(0,yn.jsx)(yU,{}):(0,yn.jsx)(IU,{})}),(0,yn.jsx)("button",{type:"button",onClick:()=>{r?.endSession?.(),r?.clearPointers?.(),s?.(),t()},className:"echly-sidebar-close","aria-label":"Close",children:(0,yn.jsx)(ud,{size:16,strokeWidth:1.5})})]})]})}var Tn=Ce(Kn());var zt=Ce(St());function _U(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function SU({item:t,onUpdate:e,onDelete:n,highlightTicketId:a=null,onExpandChange:r}){let[s,i]=(0,Tn.useState)(!1),[u,l]=(0,Tn.useState)(t.title),[c,f]=(0,Tn.useState)(t.actionSteps??[]),[p,m]=(0,Tn.useState)(!1),[v,R]=(0,Tn.useState)(null),P=a===t.id,x=_U(t.type);(0,Tn.useEffect)(()=>{l(t.title),f(t.actionSteps??[])},[t]),(0,Tn.useEffect)(()=>{a===t.id&&(i(!0),r?.(t.id))},[a,t.id,r]);let E=(0,Tn.useCallback)(()=>{i(B=>{let j=!B;return r?.(j?t.id:null),j})},[t.id,r]),I=(0,Tn.useCallback)(async()=>{m(!0),R(null);try{await e(t.id,{title:u.trim()||u,actionSteps:c}),i(!1),r?.(null)}catch(B){console.error("Save failed",B),R("Failed to save changes")}finally{m(!1)}},[t.id,u,c,e,r]),w=(0,Tn.useCallback)(()=>{i(!1),r?.(null)},[r]),A=(0,Tn.useCallback)(async()=>{try{await n(t.id)}catch(B){console.error("Delete failed",B)}},[t.id,n]);return(0,zt.jsx)("div",{className:`echly-feedback-item ${P?"echly-ticket-highlight":""}`,"data-priority":x,children:(0,zt.jsxs)("div",{className:"echly-ticket-row",children:[(0,zt.jsx)("div",{className:"echly-ticket-dot echly-priority-dot","aria-hidden":!0}),(0,zt.jsx)("div",{className:"echly-ticket-content",children:s?(0,zt.jsxs)("div",{className:"echly-ticket-expanded",children:[(0,zt.jsx)("textarea",{className:"echly-title-editor",value:u,onChange:B=>l(B.target.value)}),(0,zt.jsx)("textarea",{className:"echly-action-editor",value:c.join(`

`),onChange:B=>{f(B.target.value.split(/\n\s*\n/))}}),v&&(0,zt.jsx)("div",{className:"echly-ticket-error",role:"alert",children:v}),(0,zt.jsxs)("div",{className:"echly-edit-actions",children:[(0,zt.jsx)("button",{type:"button",className:"echly-primary-button",disabled:p,onClick:I,children:p?"Saving...":"Save"}),(0,zt.jsx)("button",{type:"button",className:"echly-secondary-button",onClick:w,children:"Cancel"})]})]}):(0,zt.jsxs)("div",{className:"echly-ticket-header",children:[(0,zt.jsx)("input",{className:"echly-edit-title",value:u,onChange:B=>l(B.target.value),style:{width:"100%"}}),(0,zt.jsxs)("div",{className:"echly-header-actions",children:[(0,zt.jsx)("button",{type:"button",onClick:E,className:"echly-expand-btn echly-widget-action-icon","aria-label":"Expand",children:(0,zt.jsx)(id,{size:16,strokeWidth:1.5})}),(0,zt.jsx)("button",{type:"button",onClick:A,className:"echly-delete-btn echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,zt.jsx)(od,{size:16,strokeWidth:1.5})})]})]})})]})})}var lk=Tn.default.memo(SU,(t,e)=>t.item===e.item&&t.highlightTicketId===e.highlightTicketId);var Yr=Ce(St());function Dv({isIdle:t,onAddFeedback:e,extensionMode:n=!1,onStartSession:a,onResumeSession:r,onOpenPreviousSession:s,hasActiveSession:i=!1,captureDisabled:u=!1}){let l=!t||u,c=l||!i||!r,f=!!(r||s);return n?(0,Yr.jsxs)("div",{className:"echly-add-insight-wrap",children:[(0,Yr.jsx)("button",{type:"button",onClick:l?void 0:a,disabled:l,className:`echly-add-insight-btn ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Start New Feedback Session",children:"Start New Feedback Session"}),f&&(0,Yr.jsxs)("div",{className:"echly-add-insight-secondary-row",children:[(0,Yr.jsx)("button",{type:"button",onClick:c?void 0:r,disabled:c,className:`echly-add-insight-btn echly-add-insight-btn--secondary ${c?"echly-add-insight-btn--disabled":""}`,"aria-label":"Resume Session",children:"Resume Session"}),(0,Yr.jsx)("button",{type:"button",onClick:l?void 0:s,disabled:l,className:`echly-add-insight-btn echly-add-insight-btn--secondary ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Previous Sessions",children:"Previous Sessions"})]})]}):(0,Yr.jsx)("div",{className:"echly-add-insight-wrap",children:(0,Yr.jsx)("button",{type:"button",onClick:l?void 0:e,disabled:l,className:`echly-add-insight-btn ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var vk=Ce(Ad());var Xs=Ce(Kn()),_k=Ce(Ad());var ck={outline:"2px solid #2563eb",background:"rgba(37,99,235,0.1)"},Ht=null,ld=null,Zp=null;function vU(t,e){if(typeof document.elementsFromPoint!="function")return document.elementFromPoint(t,e);let n=document.elementsFromPoint(t,e);for(let a of n)if(Kp(a))return a;return null}function dk(t){if(Ht){if(!t||t.width===0||t.height===0){Ht.style.display="none";return}Ht.style.display="block",Ht.style.left=`${t.left}px`,Ht.style.top=`${t.top}px`,Ht.style.width=`${t.width}px`,Ht.style.height=`${t.height}px`}}function EU(t,e){if(!e()){Ht&&(Ht.style.display="none"),Zp=null;return}let n=vU(t.clientX,t.clientY);if(n!==Zp){if(Zp=n,!n){dk(null);return}let a=n.getBoundingClientRect();dk(a)}}function fk(t,e){return Ht&&Ht.parentNode&&em(),Ht=document.createElement("div"),Ht.setAttribute("aria-hidden","true"),Ht.setAttribute("data-echly-ui","true"),Ht.style.cssText=["position:fixed","pointer-events:none","z-index:2147483646","box-sizing:border-box","border-radius:4px",`outline:${ck.outline}`,`background:${ck.background}`,"display:none"].join(";"),t.appendChild(Ht),ld=n=>EU(n,e.getActive),document.addEventListener("mousemove",ld,{passive:!0}),()=>em()}function em(){ld&&(document.removeEventListener("mousemove",ld),ld=null),Zp=null,Ht?.parentNode&&Ht.parentNode.removeChild(Ht),Ht=null}var Bi=null,Pv=()=>!1,Ov=()=>{};function TU(t){if(t.button!==0||!Pv())return;let e=t.target;!e||!Kp(e)||(t.preventDefault(),t.stopPropagation(),Ws("element clicked"),Ov(e))}function hk(t,e){return Pv=e.enabled,Ov=e.onElementClicked,Bi&&document.removeEventListener("click",Bi,!0),Bi=TU,document.addEventListener("click",Bi,!0),()=>Mv()}function Mv(){Bi&&(document.removeEventListener("click",Bi,!0),Bi=null),Pv=()=>!1,Ov=()=>{}}var un=Ce(St());function pk(){return(0,un.jsxs)(un.Fragment,{children:[(0,un.jsx)("style",{children:`
        @keyframes echly-inline-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}),(0,un.jsx)("span",{"aria-hidden":!0,style:{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.28)",borderTopColor:"rgba(255,255,255,0.92)",opacity:.8,animation:"echly-inline-spin 0.8s linear infinite",flexShrink:0}})]})}function mk({sessionPaused:t,pausePending:e=!1,endPending:n=!1,onPause:a,onResume:r,onEnd:s}){return(0,un.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderRadius:18,background:"rgba(20,22,28,0.82)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",zIndex:2147483647,border:"1px solid rgba(255,255,255,0.08)",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},children:[(0,un.jsx)("span",{style:{fontSize:14,fontWeight:600,color:"#F3F4F6"},children:t?"Session paused":"Session started"}),e?(0,un.jsxs)("button",{type:"button",disabled:!0,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:8,opacity:.9,cursor:"default"},children:[(0,un.jsx)(pk,{}),(0,un.jsx)("span",{children:"Pausing\u2026"})]}):t?(0,un.jsx)("button",{type:"button",onClick:r,disabled:e,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#466EFF",color:"#fff",fontSize:13,fontWeight:500,cursor:e?"default":"pointer",opacity:e?.7:1},children:"Resume Feedback Session"}):(0,un.jsx)("button",{type:"button",onClick:a,disabled:n,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:n?"default":"pointer",opacity:n?.7:1},children:"Pause"}),n?(0,un.jsxs)("button",{type:"button",disabled:!0,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#EF4444",color:"#fff",fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:8,opacity:.9,cursor:"default"},children:[(0,un.jsx)(pk,{}),(0,un.jsx)("span",{children:"Ending\u2026"})]}):(0,un.jsx)("button",{type:"button",onClick:s,disabled:e,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#EF4444",color:"#fff",fontSize:13,fontWeight:500,cursor:e?"default":"pointer",opacity:e?.7:1},children:"End"})]})}var Nv=Ce(Kn()),$t=Ce(St());function gk({screenshot:t,isVoiceListening:e,onRecordVoice:n,onDoneVoice:a,onSaveText:r,onCancel:s}){let[i,u]=(0,Nv.useState)("choose"),[l,c]=(0,Nv.useState)("");return(0,$t.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"min(380px, 92vw)",borderRadius:14,background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.08)",zIndex:2147483647,overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},children:[(0,$t.jsxs)("div",{style:{padding:20,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,$t.jsx)("div",{style:{borderRadius:14,overflow:"hidden",background:"rgba(0,0,0,0.3)",aspectRatio:"16/10",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,$t.jsx)("img",{src:t,alt:"Capture",style:{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}})}),(0,$t.jsx)("p",{style:{margin:"12px 0 0",fontSize:13,fontWeight:500,color:"#A1A1AA"},children:"Speak or type feedback"})]}),(0,$t.jsxs)("div",{style:{padding:20,display:"flex",flexDirection:"column",gap:12},children:[i==="choose"&&(0,$t.jsxs)($t.Fragment,{children:[(0,$t.jsx)("button",{type:"button",onClick:()=>{u("voice"),n()},style:{padding:"12px 16px",borderRadius:10,border:"none",background:"#466EFF",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"},children:"Describe the change"}),(0,$t.jsx)("button",{type:"button",onClick:()=>{u("text")},style:{padding:"12px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14,fontWeight:500,cursor:"pointer"},children:"Type feedback"})]}),i==="voice"&&(0,$t.jsx)("button",{type:"button",onClick:a,disabled:!e,style:{padding:"12px 16px",borderRadius:10,border:"none",background:e?"#466EFF":"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,fontWeight:600,cursor:e?"pointer":"default"},children:e?"Save feedback":"Saving feedback\u2026"}),i==="text"&&(0,$t.jsxs)($t.Fragment,{children:[(0,$t.jsx)("textarea",{value:l,onChange:v=>c(v.target.value),placeholder:"Describe feedback","aria-label":"Feedback text",rows:3,style:{width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14,resize:"vertical",minHeight:80}}),(0,$t.jsx)("button",{type:"button",onClick:()=>{let v=l.trim();v&&r(v)},disabled:!l.trim(),style:{padding:"12px 16px",borderRadius:10,border:"none",background:l.trim()?"#466EFF":"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,fontWeight:600,cursor:l.trim()?"pointer":"default"},children:"Save feedback"})]}),s&&i==="choose"&&(0,$t.jsx)("button",{type:"button",onClick:s,style:{padding:"8px 12px",border:"none",background:"transparent",color:"#A1A1AA",fontSize:13,fontWeight:500,cursor:"pointer",alignSelf:"flex-start"},children:"Discard"})]})]})}var Qr=Ce(St()),yk=12;function bU(){let t=['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">','<path fill="white" stroke="black" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',"</svg>"].join("");return`url("data:image/svg+xml;utf8,${encodeURIComponent(t)}") 6 6, auto`}var Ik=bU();function Sk({captureRoot:t,sessionMode:e,sessionPaused:n,pausePending:a=!1,endPending:r=!1,sessionFeedbackPending:s,state:i,onElementClicked:u,onPause:l,onResume:c,onEnd:f,onRecordVoice:p,onDoneVoice:m,onSaveText:v,onCancel:R}){let P=(0,Xs.useRef)([]),[x,E]=(0,Xs.useState)(null),I=a||r,w=e&&!n&&!I,A=e&&!n&&!I&&s==null;if((0,Xs.useEffect)(()=>{if(!e||!t)return;let j=()=>e&&!n&&!I&&s==null;return P.current.push(fk(t,{getActive:j})),P.current.push(hk(t,{enabled:j,onElementClicked:u})),()=>{P.current.forEach(_=>_()),P.current=[],em(),Mv()}},[e,t,n,I,s,u]),(0,Xs.useEffect)(()=>{if(!t?.isConnected)return;let j=document.body.style.cursor;return document.body.style.cursor=w?Ik:"",()=>{document.body.style.cursor=j}},[w,t]),(0,Xs.useEffect)(()=>{if(!A){E(null);return}let j=_=>{E({x:_.clientX+yk,y:_.clientY+yk})};return window.addEventListener("mousemove",j,{passive:!0}),()=>window.removeEventListener("mousemove",j)},[A]),!e||!t)return null;let B=(0,Qr.jsxs)(Qr.Fragment,{children:[(0,Qr.jsx)("div",{"aria-hidden":!0,className:"echly-session-overlay-cursor",style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:2147483645,cursor:w?Ik:"default"}}),(0,Qr.jsx)(mk,{sessionPaused:n,pausePending:a,endPending:r,onPause:l,onResume:c,onEnd:f}),A&&x!=null&&(0,Qr.jsx)("div",{"aria-hidden":!0,className:"echly-capture-tooltip",style:{position:"fixed",left:x.x,top:x.y,pointerEvents:"none",zIndex:2147483646,padding:"6px 10px",fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.95)",background:"rgba(0,0,0,0.75)",borderRadius:6,whiteSpace:"nowrap",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"},children:"Click to add feedback"}),s&&(0,Qr.jsx)(gk,{screenshot:s.screenshot,isVoiceListening:i==="voice_listening",onRecordVoice:p,onDoneVoice:m,onSaveText:v,onCancel:R})]});return(0,_k.createPortal)(B,t)}var ir=Ce(St());function Ek({captureRoot:t,extensionMode:e,state:n,getFullTabImage:a,onRegionCaptured:r,onRegionSelectStart:s,onCancelCapture:i,sessionMode:u=!1,sessionPaused:l=!1,pausePending:c=!1,endPending:f=!1,sessionFeedbackPending:p=null,onSessionElementClicked:m,onSessionPause:v,onSessionResume:R,onSessionEnd:P,onSessionRecordVoice:x,onSessionDoneVoice:E,onSessionSaveText:I,onSessionFeedbackCancel:w=()=>{}}){let A=u&&e;return(0,ir.jsx)(ir.Fragment,{children:(0,vk.createPortal)((0,ir.jsxs)(ir.Fragment,{children:[A&&m&&v&&R&&P&&x&&E&&I&&(0,ir.jsx)(Sk,{captureRoot:t,sessionMode:u,sessionPaused:l,pausePending:c,endPending:f,sessionFeedbackPending:p??null,state:n,onElementClicked:m,onPause:v,onResume:R,onEnd:P,onRecordVoice:x,onDoneVoice:E,onSaveText:I,onCancel:w}),!A&&(n==="focus_mode"||n==="region_selecting")&&(0,ir.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.08)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),!A&&e&&(n==="focus_mode"||n==="region_selecting")&&(0,ir.jsx)(KR,{getFullTabImage:a,onAddVoice:r,onCancel:i,onSelectionStart:s})]}),t)})}var or=Ce(Kn()),Gt=Ce(St());function wU(t,e){if(e==="all")return t;let n=Date.now(),a={today:24*60*60*1e3,"7days":7*24*60*60*1e3,"30days":30*24*60*60*1e3},r=n-a[e];return t.filter(s=>(s.updatedAt?new Date(s.updatedAt).getTime():0)>=r)}function CU(t){if(!t)return"\u2014";let e=new Date(t),a=new Date().getTime()-e.getTime(),r=Math.floor(a/6e4);if(r<1)return"Just now";if(r<60)return`${r}m ago`;let s=Math.floor(r/60);if(s<24)return`${s}h ago`;let i=Math.floor(s/24);return i<7?`${i}d ago`:e.toLocaleDateString()}function Tk({open:t,onClose:e,fetchSessions:n,onSelectSession:a}){let[r,s]=(0,or.useState)([]),[i,u]=(0,or.useState)(!1),[l,c]=(0,or.useState)(null),[f,p]=(0,or.useState)(""),[m,v]=(0,or.useState)("all");(0,or.useEffect)(()=>{t&&(p(""),v("all"),c(null),u(!0),n().then(x=>{console.log("[Echly] Sessions returned:",x),s(x)}).catch(x=>c(x instanceof Error?x.message:"Failed to load sessions")).finally(()=>u(!1)))},[t,n]);let R=(0,or.useMemo)(()=>{let x=wU(r,m);if(f.trim()){let E=f.trim().toLowerCase();x=x.filter(I=>(I.title??"").toLowerCase().includes(E)||(I.id??"").toLowerCase().includes(E))}return x},[r,m,f]),P=x=>{if(typeof x.feedbackCount=="number")return x.feedbackCount;let E=typeof x.openCount=="number"?x.openCount:0,I=typeof x.resolvedCount=="number"?x.resolvedCount:0,w=typeof x.skippedCount=="number"?x.skippedCount:0;return E+I+w};return t?(0,Gt.jsx)("div",{"data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:24},onClick:x=>x.target===x.currentTarget&&e(),role:"dialog","aria-modal":"true","aria-labelledby":"resume-session-modal-title",children:(0,Gt.jsxs)("div",{style:{width:"min(420px, 100%)",maxHeight:"85vh",borderRadius:18,background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},onClick:x=>x.stopPropagation(),children:[(0,Gt.jsxs)("div",{style:{padding:20,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,Gt.jsx)("h2",{id:"resume-session-modal-title",style:{margin:"0 0 16px",fontSize:18,fontWeight:600,color:"#F3F4F6"},children:"Resume Feedback Session"}),(0,Gt.jsx)("input",{type:"search",placeholder:"Search sessions",value:f,onChange:x=>p(x.target.value),"aria-label":"Search sessions",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14}}),(0,Gt.jsx)("div",{style:{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"},children:["today","7days","30days","all"].map(x=>(0,Gt.jsx)("button",{type:"button",onClick:()=>v(x),style:{padding:"8px 12px",borderRadius:10,border:"none",background:m===x?"rgba(70, 110, 255, 0.2)":"rgba(255,255,255,0.08)",color:"#F3F4F6",fontSize:12,fontWeight:500,cursor:"pointer"},children:x==="today"?"Today":x==="7days"?"Last 7 days":x==="30days"?"Last 30 days":"All sessions"},x))})]}),(0,Gt.jsxs)("div",{style:{flex:1,overflow:"auto",minHeight:200,maxHeight:360},children:[i&&(0,Gt.jsx)("div",{style:{padding:24,textAlign:"center",color:"#A1A1AA",fontSize:14},children:"Loading sessions\u2026"}),l&&(0,Gt.jsx)("div",{style:{padding:24,color:"#EF4444",fontSize:14},children:l}),!i&&!l&&R.length===0&&(0,Gt.jsx)("div",{style:{padding:24,textAlign:"center",color:"#A1A1AA",fontSize:14},children:"No sessions match."}),!i&&!l&&R.length>0&&(0,Gt.jsx)("ul",{style:{listStyle:"none",margin:0,padding:12},children:R.map(x=>(0,Gt.jsx)("li",{style:{marginBottom:4},children:(0,Gt.jsxs)("button",{type:"button",onClick:()=>{a(x.id),e()},style:{width:"100%",textAlign:"left",padding:"14px 16px",borderRadius:14,border:"none",background:"transparent",color:"#F3F4F6",fontSize:14,cursor:"pointer"},onMouseEnter:E=>{E.currentTarget.style.background="rgba(255,255,255,0.06)"},onMouseLeave:E=>{E.currentTarget.style.background="transparent"},children:[(0,Gt.jsx)("div",{style:{fontWeight:600},children:x.title?.trim()||"Untitled Session"}),(0,Gt.jsxs)("div",{style:{fontSize:12,fontWeight:500,color:"#A1A1AA",marginTop:4},children:[P(x)," feedback items \xB7 ",CU(x.updatedAt)]})]})},x.id))})]}),(0,Gt.jsx)("div",{style:{padding:16,borderTop:"1px solid rgba(255,255,255,0.08)"},children:(0,Gt.jsx)("button",{type:"button",onClick:e,style:{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#A1A1AA",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Cancel"})})]})}):null}var jt=Ce(St()),LU=["focus_mode","region_selecting","voice_listening","processing"];function tm({sessionId:t,userId:e,extensionMode:n=!1,initialPointers:a,onComplete:r,onDelete:s,onUpdate:i,widgetToggleRef:u,onRecordingChange:l,expanded:c,onExpandRequest:f,onCollapseRequest:p,captureDisabled:m=!1,theme:v="dark",onThemeToggle:R,fetchSessions:P,onResumeSessionSelect:x,loadSessionWithPointers:E,onSessionLoaded:I,onSessionEnd:w,onCreateSession:A,onActiveSessionChange:B,globalSessionModeActive:j,globalSessionPaused:_,onSessionModeStart:g,onSessionModePause:S,onSessionModeResume:T,onSessionModeEnd:C}){let[L,b]=(0,ra.useState)(!1),[ce,ve]=(0,ra.useState)(!0),{state:oe,handlers:D,refs:M,captureRootEl:q}=ak({sessionId:t,userId:e,extensionMode:n,initialPointers:a,onComplete:r,onDelete:s,onUpdate:i,onRecordingChange:l,loadSessionWithPointers:E,onSessionLoaded:I,onCreateSession:A,onActiveSessionChange:B,globalSessionModeActive:j,globalSessionPaused:_,onSessionModeStart:g,onSessionModePause:S,onSessionModeResume:T,onSessionModeEnd:C}),Y=c!==void 0?c:oe.isOpen,ne=(0,ra.useRef)(null),at=LU.includes(oe.state)||oe.pillExiting,Ue=!!t,et=!at&&!oe.sessionMode,rt=oe.sessionMode&&oe.sessionPaused,sa=!Y&&et&&!rt,Rn=Y&&et||rt,ln=!!oe.pointers?.length,Da=!ln&&oe.state==="idle",ur=(0,ra.useRef)(!1);(0,ra.useEffect)(()=>{if(!at){ur.current=!1;return}ur.current||(ur.current=!0,p?.())},[at,p]);let In=oe.pointers.length,N=oe.pointers.filter(fe=>/critical|bug|high|urgent/i.test(fe.type||"")).length,Q=In>0?N>0?`${In} insights \u2022 ${N} need attention`:`${In} insights`:null;(0,ra.useEffect)(()=>{oe.highlightTicketId&&ne.current&&ne.current.scrollTo({top:0,behavior:"smooth"})},[oe.highlightTicketId]),(0,ra.useEffect)(()=>{E?.sessionId&&ve(!1)},[E?.sessionId]),ra.default.useEffect(()=>{if(u)return u.current=D.toggleOpen,()=>{u.current=null}},[D,u]);let ae=ra.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_ACTIVE_SESSION"},fe=>{let ue=fe?.sessionId;ue&&x?.(ue,{enterCaptureImmediately:!0})})},[x]);return(0,jt.jsxs)(jt.Fragment,{children:[n&&P&&x&&(0,jt.jsx)(Tk,{open:L,onClose:()=>b(!1),fetchSessions:P,onSelectSession:fe=>{ve(!1),x(fe),b(!1)}}),q&&(0,jt.jsx)(Ek,{captureRoot:q,extensionMode:n,state:oe.state,getFullTabImage:D.getFullTabImage,onRegionCaptured:D.handleRegionCaptured,onRegionSelectStart:D.handleRegionSelectStart,onCancelCapture:D.handleCancelCapture,sessionMode:oe.sessionMode,sessionPaused:oe.sessionPaused,pausePending:oe.pausePending,endPending:oe.endPending,sessionFeedbackPending:oe.sessionFeedbackPending,onSessionElementClicked:D.handleSessionElementClicked,onSessionPause:()=>{D.pauseSession(),f?.()},onSessionResume:()=>{D.resumeSession(),p?.()},onSessionEnd:()=>{D.endSession(()=>{ve(!0),w?.()})},onSessionRecordVoice:D.handleSessionStartVoice,onSessionDoneVoice:D.finishListening,onSessionSaveText:D.handleSessionFeedbackSubmit,onSessionFeedbackCancel:D.handleSessionFeedbackCancel}),sa&&(0,jt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,jt.jsx)("button",{type:"button",onClick:()=>f?f():D.setIsOpen(!0),className:"echly-floating-trigger",children:n?"Echly":"Capture feedback"})}),Rn&&(0,jt.jsxs)(jt.Fragment,{children:[!n&&(0,jt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,jt.jsx)("div",{ref:M.widgetRef,className:"echly-sidebar-container",style:n?{position:"fixed",...oe.position?{left:oe.position.x,top:oe.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,jt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,jt.jsx)(kv,{onClose:()=>p?p():D.setIsOpen(!1),summary:Q,theme:v,onThemeToggle:R,handlers:{endSession:D.endSession,clearPointers:void 0},onShowCommandScreen:()=>ve(!0)}),(0,jt.jsxs)("div",{ref:ne,className:"echly-sidebar-body",children:[ln&&(0,jt.jsx)("div",{className:"echly-feedback-list",children:oe.pointers.map(fe=>(0,jt.jsx)(lk,{item:fe,onUpdate:i??D.updatePointer,onDelete:D.deletePointer,highlightTicketId:oe.highlightTicketId,onExpandChange:D.setExpandedId},fe.id))}),oe.errorMessage&&(0,jt.jsx)("div",{className:"echly-sidebar-error",children:oe.errorMessage}),Da&&(0,jt.jsx)(Dv,{isIdle:!0,onAddFeedback:D.handleAddFeedback,extensionMode:n,onStartSession:n?D.startSession:void 0,onResumeSession:n&&Ue?ae:void 0,onOpenPreviousSession:n&&P&&x?()=>b(!0):void 0,hasActiveSession:Ue,captureDisabled:m})]})]})})]})]})}var vt=Ce(St()),AU="echly-root",nm="echly-shadow-host",wk="widget-theme";function xU(){try{let t=localStorage.getItem(wk);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function RU(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem(wk,e)}catch{}}function Vv(t){let e=document.getElementById(nm);e&&(e.style.display=t?"block":"none")}function kU(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function DU({widgetRoot:t,initialTheme:e}){let[n,a]=Se.default.useState(null),[r,s]=Se.default.useState(null),[i,u]=Se.default.useState(!1),[l,c]=Se.default.useState(e),[f,p]=Se.default.useState({visible:!1,expanded:!1,isRecording:!1,sessionId:null,sessionModeActive:!1,sessionPaused:!1}),[m,v]=Se.default.useState(null),[R,P]=Se.default.useState(null),[x,E]=Se.default.useState(0),I=m??f.sessionId,w=Se.default.useRef(null),A=Se.default.useRef(!1),[B,j]=Se.default.useState(null),[_,g]=Se.default.useState(!1),[S,T]=Se.default.useState(!1),[C,L]=Se.default.useState(""),b=Se.default.useRef(null),ce=Se.default.useRef(!1),[ve,oe]=Se.default.useState(!1),D=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";Se.default.useEffect(()=>{let N=()=>{w.current?.()};return window.addEventListener("ECHLY_TOGGLE_WIDGET",N),()=>{window.removeEventListener("ECHLY_TOGGLE_WIDGET",N)}},[]),Se.default.useEffect(()=>{let N=()=>{P(null),p(Q=>({...Q,expanded:!1})),E(Q=>Q+1)};return window.addEventListener("ECHLY_RESET_WIDGET",N),()=>window.removeEventListener("ECHLY_RESET_WIDGET",N)},[]),Se.default.useEffect(()=>{let N=Q=>{let ae=Q.detail?.state;ae&&(de("CONTENT","global state received",ae),Vv(ae.visible),p(ae))};return window.addEventListener("ECHLY_GLOBAL_STATE",N),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",N)},[]),Se.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},N=>{N?.state&&(Vv(N.state.visible??!1),p(N.state))})},[]),Se.default.useEffect(()=>{if(!f.sessionModeActive||!f.sessionId)return;let N=!1;return(async()=>{try{let Q=await gt(`/api/feedback?sessionId=${encodeURIComponent(f.sessionId)}&limit=50`);if(N)return;let ue=((await Q.json()).feedback??[]).map(Ae=>{let Ve=Ae.actionSteps??(Ae.description?Ae.description.split(/\n\s*\n/):[]);return{id:Ae.id,title:Ae.title??"",description:Ae.description??Ve.join(`

`),type:Ae.type??"Feedback",actionSteps:Ve}});if(N)return;P({sessionId:f.sessionId,pointers:ue})}catch(Q){N||(console.error("[Echly] Failed to load session feedback for markers:",Q),P({sessionId:f.sessionId,pointers:[]}))}})(),()=>{N=!0}},[f.sessionModeActive,f.sessionId]),Se.default.useEffect(()=>{let N=()=>{let ae=window.location.origin;if(!(ae==="https://echly-web.vercel.app"||ae==="http://localhost:3000"))return;let ue=window.location.pathname.split("/").filter(Boolean);ue[0]==="dashboard"&&ue[1]&&chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:ue[1]},()=>{})};N(),window.addEventListener("popstate",N);let Q=setInterval(N,2e3);return()=>{window.removeEventListener("popstate",N),clearInterval(Q)}},[]);let M=Se.default.useCallback(N=>{N?chrome.runtime.sendMessage({type:"START_RECORDING"},Q=>{if(chrome.runtime.lastError){s(chrome.runtime.lastError.message||"Failed to start recording");return}Q?.ok||s(Q?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),q=Se.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{})},[]),Z=Se.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{})},[]),Y=Se.default.useCallback(()=>{let N=l==="dark"?"light":"dark";c(N),RU(t,N)},[l,t]);Se.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},N=>{N?.authenticated&&N.user?.uid?a({uid:N.user.uid,name:N.user.name??null,email:N.user.email??null,photoURL:N.user.photoURL??null}):a(null),u(!0)})},[]);let ne=Se.default.useCallback(async(N,Q,ae,fe,ue)=>{if(de("PIPELINE","start"),A.current){de("PIPELINE","blocked by submissionLock"),ae?.onError?.();return}if(A.current=!0,!I||!n){de("PIPELINE","error"),ae?.onError(),A.current=!1;return}if(ae){(async()=>{let Ae=oI(Q??null),Ve=Qy(),pe=$y(),we=Q?Jy(Q,I,pe):Promise.resolve(null),Be=await Ae;console.log("[OCR] Extracted visibleText:",Be);let st=typeof window<"u"?window.location.href:"",Xe={...fe??{},visibleText:Be?.trim()&&Be||fe?.visibleText||null,url:fe?.url??st},ht={transcript:N,context:Xe};try{de("PIPELINE","structure request"),console.log("[VOICE] final transcript submitted",N);let Ne=await(await gt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ht)})).json(),je=Array.isArray(Ne.tickets)?Ne.tickets:[],ot=typeof Ne.clarityScore=="number"?Ne.clarityScore:Ne.clarityScore!=null?Number(Ne.clarityScore):100,Kt=Ne.clarityIssues??[],Et=Ne.suggestedRewrite??null,Ye=Ne.confidence??.5;if(!!!ue?.sessionMode){if(Ne.success&&ot<=20){console.log("CLARITY GUARD TRIGGERED",ot),j({tickets:je,screenshotUrl:null,screenshotId:pe,uploadPromise:we,transcript:N,screenshot:Q,firstFeedbackId:Ve,clarityScore:ot,clarityIssues:Kt,suggestedRewrite:Et,confidence:Ye,callbacks:ae,context:Xe}),L(N),T(!1),ce.current=!1,oe(!1),g(!0),A.current=!1;return}let Ge=!!Ne.needsClarification,De=Ne.verificationIssues??[];if(Ne.success&&Ge&&je.length===0){console.log("PIPELINE NEEDS CLARIFICATION",De),j({tickets:[],screenshotUrl:null,screenshotId:pe,uploadPromise:we,transcript:N,screenshot:Q,firstFeedbackId:Ve,clarityScore:ot,clarityIssues:De.length>0?De:Kt,suggestedRewrite:Et,confidence:Ye,callbacks:ae,context:Xe}),L(N),T(!1),ce.current=!1,oe(!1),g(!0),A.current=!1;return}}if(!Ne.success||je.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N,screenshotUrl:null,screenshotId:pe,sessionId:I,context:Xe}},Ge=>{if(A.current=!1,chrome.runtime.lastError){de("PIPELINE","error"),ae.onError();return}if(Ge?.success&&Ge.ticket){let De=Ge.ticket.id,Qe=Ge.ticket,Dt=Array.isArray(Qe.actionSteps)?Qe.actionSteps:Qe.description?Qe.description.split(/\n\s*\n/):[];de("PIPELINE","ticket created",{ticketId:De}),ae.onSuccess({id:De,title:Qe.title,actionSteps:Dt,type:Qe.type??"Feedback"}),we.then(cn=>{cn&&(de("PIPELINE","screenshot uploaded",{screenshotUrl:cn}),de("PIPELINE","screenshot patched",{ticketId:De}),gt(`/api/tickets/${De}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:cn})}).catch(()=>{}))}).catch(()=>{})}else de("PIPELINE","error"),ae.onError()});return}let ke=ot>=85?"clear":ot>=60?"needs_improvement":"unclear",bn={clarityScore:ot,clarityIssues:Kt,clarityConfidence:Ye,clarityStatus:ke},_n;for(let Ge=0;Ge<je.length;Ge++){let De=je[Ge],Qe=typeof De.description=="string"?De.description:De.title??"",Dt=Array.isArray(De.actionSteps)?De.actionSteps:[],cn={sessionId:I,title:De.title??"",description:Qe,type:Array.isArray(De.suggestedTags)&&De.suggestedTags[0]?De.suggestedTags[0]:"Feedback",contextSummary:Qe,actionSteps:Dt,suggestedTags:De.suggestedTags,screenshotUrl:null,screenshotId:Ge===0?pe:void 0,metadata:{clientTimestamp:Date.now()},...bn},ut=await(await gt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cn)})).json();if(ut.success&&ut.ticket){let ia=ut.ticket,wn=ia.actionSteps??(ia.description?ia.description.split(/\n\s*\n/):[]);_n||(_n={id:ia.id,title:ia.title,actionSteps:wn,type:ia.type??"Feedback"})}}if(A.current=!1,_n){let Ge=_n.id;de("PIPELINE","ticket created",{ticketId:Ge}),we.then(De=>{De&&(de("PIPELINE","screenshot uploaded",{screenshotUrl:De}),de("PIPELINE","screenshot patched",{ticketId:Ge}),gt(`/api/tickets/${Ge}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:De})}).catch(()=>{}))}).catch(()=>{}),ae.onSuccess(_n)}else de("PIPELINE","error"),ae.onError()}catch(ye){console.error("[Echly] Structure or submit failed:",ye),A.current=!1,de("PIPELINE","error"),ae.onError()}})();return}try{let Ae=$y(),Ve=Q?Jy(Q,I,Ae):Promise.resolve(null),pe=await oI(Q??null);console.log("[OCR] Extracted visibleText:",pe);let we=typeof window<"u"?window.location.href:"",Be={transcript:N,context:{...fe??{},visibleText:pe?.trim()&&pe||fe?.visibleText||null,url:fe?.url??we}};de("PIPELINE","structure request"),console.log("[VOICE] final transcript submitted",N);let Xe=await(await gt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Be)})).json(),ht=Array.isArray(Xe.tickets)?Xe.tickets:[],ye=Xe.clarityScore??100,Ne=Xe.clarityIssues??[],je=Xe.suggestedRewrite??null,ot=Xe.confidence??.5;if(!Xe.success||ht.length===0)return;let Kt=ye>=85?"clear":ye>=60?"needs_improvement":"unclear",Et={clarityScore:ye,clarityIssues:Ne,clarityConfidence:ot,clarityStatus:Kt},Ye;for(let Ea=0;Ea<ht.length;Ea++){let ke=ht[Ea],bn=typeof ke.description=="string"?ke.description:ke.title??"",_n={sessionId:I,title:ke.title??"",description:bn,type:Array.isArray(ke.suggestedTags)&&ke.suggestedTags[0]?ke.suggestedTags[0]:"Feedback",contextSummary:bn,actionSteps:Array.isArray(ke.actionSteps)?ke.actionSteps:[],suggestedTags:ke.suggestedTags,screenshotUrl:null,screenshotId:Ea===0?Ae:void 0,metadata:{clientTimestamp:Date.now()},...Et},De=await(await gt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(_n)})).json();if(De.success&&De.ticket){let Qe=De.ticket,Dt=Qe.actionSteps??(Qe.description?Qe.description.split(/\n\s*\n/):[]);Ye||(Ye={id:Qe.id,title:Qe.title,actionSteps:Dt,type:Qe.type??"Feedback"})}}if(Ye){let Ea=Ye.id;Ve.then(ke=>{ke&&gt(`/api/tickets/${Ea}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ke})}).catch(()=>{})}).catch(()=>{})}return Ye}finally{A.current=!1}},[I,n]),at=Se.default.useCallback(async N=>{try{await gt(`/api/tickets/${N}`,{method:"DELETE"})}catch(Q){throw console.error("[Echly] Delete ticket failed:",Q),Q}},[]),Ue=Se.default.useCallback(async(N,Q)=>{await gt(`/api/tickets/${N}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:Q.title,description:Q.actionSteps?.join(`
`)??"",actionSteps:Q.actionSteps??[]})})},[]),et=Se.default.useCallback(async()=>{let N=await gt("/api/sessions"),Q=await N.json(),ae=Q.sessions??[];return console.log("[Echly] Sessions returned:",{ok:N.ok,status:N.status,success:Q.success,count:ae.length,sessions:ae}),!N.ok||!Q.success?[]:ae},[]),rt=Se.default.useCallback(async()=>{console.log("[Echly] Creating session");try{let N=await gt("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),Q=await N.json();return console.log("[Echly] Create session response:",{ok:N.ok,status:N.status,success:Q.success,sessionId:Q.session?.id}),!N.ok||!Q.success||!Q.session?.id?null:{id:Q.session.id}}catch(N){return console.error("[Echly] Failed to create session:",N),null}},[]),sa=Se.default.useCallback(N=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:N},()=>{}),v(N)},[]),Rn=Se.default.useCallback(async(N,Q)=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:N},()=>{}),v(N);try{let Ae=((await(await gt(`/api/feedback?sessionId=${encodeURIComponent(N)}&limit=50`)).json()).feedback??[]).map(Ve=>{let pe=Ve.actionSteps??(Ve.description?Ve.description.split(/\n\s*\n/):[]);return{id:Ve.id,title:Ve.title??"",description:Ve.description??pe.join(`

`),type:Ve.type??"Feedback",actionSteps:pe}});P({sessionId:N,pointers:Ae}),Q?.enterCaptureImmediately&&chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{})}catch(ae){console.error("[Echly] Failed to load session feedback:",ae),P({sessionId:N,pointers:[]}),Q?.enterCaptureImmediately&&chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{})}},[]),ln=Se.default.useCallback(async N=>{if(!I)return;if(N.tickets.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N.transcript,screenshotUrl:null,screenshotId:N.screenshotId,sessionId:I,context:N.context??{}}},fe=>{if(chrome.runtime.lastError){console.error("[Echly] Submit anyway failed:",chrome.runtime.lastError.message),de("PIPELINE","error"),N.callbacks.onError();return}if(fe?.success&&fe.ticket){let ue=fe.ticket,Ae=ue.id,Ve=Array.isArray(ue.actionSteps)?ue.actionSteps:ue.description?ue.description.split(/\n\s*\n/):[];N.callbacks.onSuccess({id:Ae,title:ue.title,actionSteps:Ve,type:ue.type??"Feedback"}),N.uploadPromise.then(pe=>{pe&&gt(`/api/tickets/${Ae}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:pe})}).catch(()=>{})}).catch(()=>{})}else de("PIPELINE","error"),N.callbacks.onError()});return}let Q={clarityScore:N.clarityScore,clarityIssues:N.clarityIssues,clarityConfidence:N.confidence,clarityStatus:N.clarityScore>=85?"clear":N.clarityScore>=60?"needs_improvement":"unclear"},ae;for(let fe=0;fe<N.tickets.length;fe++){let ue=N.tickets[fe],Ae=typeof ue.description=="string"?ue.description:ue.title??"",Ve={sessionId:I,title:ue.title??"",description:Ae,type:Array.isArray(ue.suggestedTags)&&ue.suggestedTags[0]?ue.suggestedTags[0]:"Feedback",contextSummary:Ae,actionSteps:Array.isArray(ue.actionSteps)?ue.actionSteps:[],suggestedTags:ue.suggestedTags,screenshotUrl:null,screenshotId:fe===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...Q},we=await(await gt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Ve)})).json();if(we.success&&we.ticket){let Be=we.ticket,st=Be.actionSteps??(Be.description?Be.description.split(/\n\s*\n/):[]);ae||(ae={id:Be.id,title:Be.title,actionSteps:st,type:Be.type??"Feedback"})}}if(ae){let fe=ae.id;N.uploadPromise.then(ue=>{ue&&gt(`/api/tickets/${fe}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ue})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(ae)}else de("PIPELINE","error"),N.callbacks.onError()},[I]),Da=Se.default.useCallback(async(N,Q)=>{if(!I)return;let ae=Q.trim();try{let fe={transcript:ae,context:N.context??{}},Ae=await(await gt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fe)})).json(),Ve=Array.isArray(Ae.tickets)?Ae.tickets:[],pe=Ae.clarityScore??100,we=Ae.confidence??.5,Be=pe>=85?"clear":pe>=60?"needs_improvement":"unclear",st={clarityScore:pe,clarityIssues:Ae.clarityIssues??[],clarityConfidence:we,clarityStatus:Be};if(Ve.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:ae,screenshotUrl:null,screenshotId:N.screenshotId,sessionId:I,context:N.context??{}}},ht=>{if(chrome.runtime.lastError){console.error("[Echly] Submit edited feedback failed:",chrome.runtime.lastError.message),de("PIPELINE","error"),N.callbacks.onError();return}if(ht?.success&&ht.ticket){let ye=ht.ticket,Ne=ye.id,je=Array.isArray(ye.actionSteps)?ye.actionSteps:ye.description?ye.description.split(/\n\s*\n/):[];N.callbacks.onSuccess({id:Ne,title:ye.title,actionSteps:je,type:ye.type??"Feedback"}),N.uploadPromise.then(ot=>{ot&&gt(`/api/tickets/${Ne}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ot})}).catch(()=>{})}).catch(()=>{})}else de("PIPELINE","error"),N.callbacks.onError()});return}let Xe;for(let ht=0;ht<Ve.length;ht++){let ye=Ve[ht],Ne=typeof ye.description=="string"?ye.description:ye.title??"",je={sessionId:I,title:ye.title??"",description:Ne,type:Array.isArray(ye.suggestedTags)&&ye.suggestedTags[0]?ye.suggestedTags[0]:"Feedback",contextSummary:Ne,actionSteps:Array.isArray(ye.actionSteps)?ye.actionSteps:[],suggestedTags:ye.suggestedTags,screenshotUrl:null,screenshotId:ht===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...st},Kt=await(await gt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(je)})).json();if(Kt.success&&Kt.ticket){let Et=Kt.ticket,Ye=Et.actionSteps??(Et.description?Et.description.split(/\n\s*\n/):[]);Xe||(Xe={id:Et.id,title:Et.title,actionSteps:Ye,type:Et.type??"Feedback"})}}if(Xe){let ht=Xe.id;N.uploadPromise.then(ye=>{ye&&gt(`/api/tickets/${ht}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ye})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(Xe)}else de("PIPELINE","error"),N.callbacks.onError()}catch(fe){console.error("[Echly] Submit edited feedback failed:",fe),de("PIPELINE","error"),N.callbacks.onError()}},[I]),ur=Se.default.useCallback(async()=>{let N=B;if(!(!N?.suggestedRewrite?.trim()||!I)){j(null);try{let ae=await(await gt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:N.suggestedRewrite.trim()})})).json(),fe=Array.isArray(ae.tickets)?ae.tickets:[],ue=ae.clarityScore??100,Ae=ae.confidence??.5,Ve=ue>=85?"clear":ue>=60?"needs_improvement":"unclear",pe={clarityScore:ue,clarityIssues:ae.clarityIssues??[],clarityConfidence:Ae,clarityStatus:Ve},we;for(let Be=0;Be<fe.length;Be++){let st=fe[Be],Xe=typeof st.description=="string"?st.description:st.title??"",ht={sessionId:I,title:st.title??"",description:Xe,type:Array.isArray(st.suggestedTags)&&st.suggestedTags[0]?st.suggestedTags[0]:"Feedback",contextSummary:Xe,actionSteps:Array.isArray(st.actionSteps)?st.actionSteps:[],suggestedTags:st.suggestedTags,screenshotUrl:null,screenshotId:Be===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...pe},Ne=await(await gt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ht)})).json();if(Ne.success&&Ne.ticket){let je=Ne.ticket,ot=je.actionSteps??(je.description?je.description.split(/\n\s*\n/):[]);we||(we={id:je.id,title:je.title,actionSteps:ot,type:je.type??"Feedback"})}}if(we){let Be=we.id;N.uploadPromise.then(st=>{st&&gt(`/api/tickets/${Be}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:st})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(we)}else de("PIPELINE","error"),N.callbacks.onError()}catch(Q){console.error("[Echly] Use suggestion failed:",Q),de("PIPELINE","error"),N.callbacks.onError()}}},[B,I]);if(Se.default.useEffect(()=>{S&&b.current&&b.current.focus()},[S]),!i)return null;if(!n)return(0,vt.jsx)("div",{style:{pointerEvents:"auto"},children:(0,vt.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:kU,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,vt.jsx)("img",{src:D,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})});let In=B;return(0,vt.jsxs)(vt.Fragment,{children:[_&&In&&(0,vt.jsx)("div",{style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.15)",zIndex:999999,fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif'},children:(0,vt.jsxs)("div",{style:{maxWidth:420,width:"90%",background:"#F8FBFF",borderRadius:12,padding:20,boxShadow:"0 12px 32px rgba(0,0,0,0.12)",border:"1px solid #E6F0FF",animation:"echly-clarity-card-in 150ms ease-out"},children:[(0,vt.jsx)("div",{style:{fontWeight:600,fontSize:15,marginBottom:6,color:"#111"},children:"Quick suggestion"}),(0,vt.jsx)("div",{style:{fontSize:14,color:"#374151",marginBottom:8},children:"Your feedback may be unclear."}),(0,vt.jsx)("div",{style:{fontSize:13,color:"#6b7280",marginBottom:10},children:"Try specifying what looks wrong and what change you want."}),In.suggestedRewrite&&(0,vt.jsxs)("div",{style:{fontSize:13,fontStyle:"italic",color:"#4b5563",marginBottom:12,opacity:.9},children:['Example: "',In.suggestedRewrite,'"']}),(0,vt.jsx)("textarea",{ref:b,value:C,onChange:N=>L(N.target.value),disabled:!S,rows:3,placeholder:"Your feedback","aria-label":"Feedback message",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid #E6F0FF",fontSize:14,resize:"vertical",minHeight:72,marginBottom:16,background:S?"#fff":"#f3f4f6",color:"#111"}}),(0,vt.jsx)("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:S?(0,vt.jsx)("button",{type:"button",disabled:ve,onClick:()=>{if(ce.current||!In)return;ce.current=!0,oe(!0),g(!1),j(null),T(!1),Da(In,C).catch(ae=>console.error("[Echly] Done submission failed:",ae)).finally(()=>{ce.current=!1,oe(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:ve?"default":"pointer",opacity:ve?.8:1},children:"Done"}):(0,vt.jsxs)(vt.Fragment,{children:[(0,vt.jsx)("button",{type:"button",disabled:ve,onClick:()=>T(!0),style:{background:"transparent",border:"1px solid #E6F0FF",borderRadius:8,padding:"8px 14px",fontSize:14,color:"#374151",cursor:ve?"default":"pointer",opacity:ve?.7:1},children:"Edit feedback"}),(0,vt.jsx)("button",{type:"button",disabled:ve,onClick:()=>{if(ce.current||!In)return;ce.current=!0,oe(!0),g(!1),j(null),T(!1),ln(In).catch(Q=>console.error("[Echly] Submit anyway failed:",Q)).finally(()=>{ce.current=!1,oe(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:ve?"default":"pointer",opacity:ve?.8:1},children:"Submit anyway"})]})})]})}),(0,vt.jsx)(tm,{sessionId:I??"",userId:n.uid,extensionMode:!0,onComplete:ne,onDelete:at,onUpdate:Ue,widgetToggleRef:w,onRecordingChange:M,expanded:f.expanded,onExpandRequest:q,onCollapseRequest:Z,captureDisabled:!1,theme:l,onThemeToggle:Y,fetchSessions:et,onResumeSessionSelect:Rn,loadSessionWithPointers:R,onSessionLoaded:()=>P(null),onSessionEnd:()=>v(null),onCreateSession:rt,onActiveSessionChange:sa,globalSessionModeActive:f.sessionModeActive??!1,globalSessionPaused:f.sessionPaused??!1,onSessionModeStart:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{}),onSessionModePause:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_PAUSE"}).catch(()=>{}),onSessionModeResume:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_RESUME"}).catch(()=>{}),onSessionModeEnd:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_END"}).catch(()=>{})},x)]})}var PU=`
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
  }
  #echly-root * { box-sizing: border-box; }
`;function OU(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let n=document.createElement("style");n.id="echly-reset",n.textContent=PU,t.appendChild(n)}function MU(t){let e=t.attachShadow({mode:"open"});OU(e);let n=document.createElement("div");n.id=AU,n.setAttribute("data-echly-ui","true"),n.style.all="initial",n.style.boxSizing="border-box",n.style.pointerEvents="auto",n.style.width="auto",n.style.height="auto";let a=xU();n.setAttribute("data-theme",a),e.appendChild(n),(0,bk.createRoot)(n).render((0,vt.jsx)(DU,{widgetRoot:n,initialTheme:a}))}function Ck(t){return t?{visible:t.visible??!1,expanded:t.expanded??!1,isRecording:t.isRecording??!1,sessionId:t.sessionId??null,sessionModeActive:t.sessionModeActive??!1,sessionPaused:t.sessionPaused??!1}:null}function Lk(t){de("CONTENT","dispatch event",{type:"ECHLY_GLOBAL_STATE"}),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:t}}))}function NU(t){chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},e=>{let n=Ck(e?.state);n&&(t.style.display=n.visible?"block":"none",Lk(n))})}function VU(){document.addEventListener("visibilitychange",()=>{document.hidden||chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},t=>{let e=Ck(t?.state);e&&(Vv(e.visible),Lk(e))})})}function FU(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(n=>{if(n.type==="ECHLY_FEEDBACK_CREATED"&&n.ticket&&n.sessionId){de("CONTENT","dispatch event",{type:"ECHLY_FEEDBACK_CREATED"}),window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:n.ticket,sessionId:n.sessionId}}));return}let a=document.getElementById(nm);a&&(n.type==="ECHLY_GLOBAL_STATE"&&n.state&&(de("CONTENT","global state received",n.state),a.style.display=n.state.visible?"block":"none",de("CONTENT","dispatch event",{type:"ECHLY_GLOBAL_STATE"}),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:n.state}}))),n.type==="ECHLY_TOGGLE"&&(de("CONTENT","dispatch event",{type:"ECHLY_TOGGLE_WIDGET"}),window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET"))),n.type==="ECHLY_RESET_WIDGET"&&(de("CONTENT","dispatch event",{type:"ECHLY_RESET_WIDGET"}),window.dispatchEvent(new CustomEvent("ECHLY_RESET_WIDGET"))))}))}function UU(){let t=document.getElementById(nm);t||(t=document.createElement("div"),t.id=nm,t.setAttribute("data-echly-ui","true"),t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),MU(t)),FU(t),NU(t),VU()}UU();})();
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

@firebase/storage/dist/index.esm.js:
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

lucide-react/dist/esm/icons/expand.js:
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
