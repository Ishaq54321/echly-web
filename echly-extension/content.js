"use strict";(()=>{var qk=Object.create;var lm=Object.defineProperty;var zk=Object.getOwnPropertyDescriptor;var Hk=Object.getOwnPropertyNames;var Gk=Object.getPrototypeOf,jk=Object.prototype.hasOwnProperty;var nE=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,n)=>(typeof require<"u"?require:e)[n]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var Kk=(t,e)=>()=>(t&&(e=t(t=0)),e);var Re=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),Wk=(t,e)=>{for(var n in e)lm(t,n,{get:e[n],enumerable:!0})},Xk=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Hk(e))!jk.call(t,r)&&r!==n&&lm(t,r,{get:()=>e[r],enumerable:!(a=zk(e,r))||a.enumerable});return t};var Ee=(t,e,n)=>(n=t!=null?qk(Gk(t)):{},Xk(e||!t||!t.__esModule?lm(n,"default",{value:t,enumerable:!0}):n,t));var hE=Re(fe=>{"use strict";var dm=Symbol.for("react.transitional.element"),Yk=Symbol.for("react.portal"),Qk=Symbol.for("react.fragment"),$k=Symbol.for("react.strict_mode"),Jk=Symbol.for("react.profiler"),Zk=Symbol.for("react.consumer"),e1=Symbol.for("react.context"),t1=Symbol.for("react.forward_ref"),n1=Symbol.for("react.suspense"),a1=Symbol.for("react.memo"),oE=Symbol.for("react.lazy"),r1=Symbol.for("react.activity"),aE=Symbol.iterator;function s1(t){return t===null||typeof t!="object"?null:(t=aE&&t[aE]||t["@@iterator"],typeof t=="function"?t:null)}var lE={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},uE=Object.assign,cE={};function Wi(t,e,n){this.props=t,this.context=e,this.refs=cE,this.updater=n||lE}Wi.prototype.isReactComponent={};Wi.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Wi.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function dE(){}dE.prototype=Wi.prototype;function fm(t,e,n){this.props=t,this.context=e,this.refs=cE,this.updater=n||lE}var hm=fm.prototype=new dE;hm.constructor=fm;uE(hm,Wi.prototype);hm.isPureReactComponent=!0;var rE=Array.isArray;function cm(){}var Ge={H:null,A:null,T:null,S:null},fE=Object.prototype.hasOwnProperty;function pm(t,e,n){var a=n.ref;return{$$typeof:dm,type:t,key:e,ref:a!==void 0?a:null,props:n}}function i1(t,e){return pm(t.type,e,t.props)}function mm(t){return typeof t=="object"&&t!==null&&t.$$typeof===dm}function o1(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var sE=/\/+/g;function um(t,e){return typeof t=="object"&&t!==null&&t.key!=null?o1(""+t.key):e.toString(36)}function l1(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(cm,cm):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function Ki(t,e,n,a,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case dm:case Yk:i=!0;break;case oE:return i=t._init,Ki(i(t._payload),e,n,a,r)}}if(i)return r=r(t),i=a===""?"."+um(t,0):a,rE(r)?(n="",i!=null&&(n=i.replace(sE,"$&/")+"/"),Ki(r,e,n,"",function(c){return c})):r!=null&&(mm(r)&&(r=i1(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(sE,"$&/")+"/")+i)),e.push(r)),1;i=0;var l=a===""?".":a+":";if(rE(t))for(var u=0;u<t.length;u++)a=t[u],s=l+um(a,u),i+=Ki(a,e,n,s,r);else if(u=s1(t),typeof u=="function")for(t=u.call(t),u=0;!(a=t.next()).done;)a=a.value,s=l+um(a,u++),i+=Ki(a,e,n,s,r);else if(s==="object"){if(typeof t.then=="function")return Ki(l1(t),e,n,a,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function vd(t,e,n){if(t==null)return t;var a=[],r=0;return Ki(t,a,"","",function(s){return e.call(n,s,r++)}),a}function u1(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var iE=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},c1={map:vd,forEach:function(t,e,n){vd(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return vd(t,function(){e++}),e},toArray:function(t){return vd(t,function(e){return e})||[]},only:function(t){if(!mm(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};fe.Activity=r1;fe.Children=c1;fe.Component=Wi;fe.Fragment=Qk;fe.Profiler=Jk;fe.PureComponent=fm;fe.StrictMode=$k;fe.Suspense=n1;fe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ge;fe.__COMPILER_RUNTIME={__proto__:null,c:function(t){return Ge.H.useMemoCache(t)}};fe.cache=function(t){return function(){return t.apply(null,arguments)}};fe.cacheSignal=function(){return null};fe.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var a=uE({},t.props),r=t.key;if(e!=null)for(s in e.key!==void 0&&(r=""+e.key),e)!fE.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(a[s]=e[s]);var s=arguments.length-2;if(s===1)a.children=n;else if(1<s){for(var i=Array(s),l=0;l<s;l++)i[l]=arguments[l+2];a.children=i}return pm(t.type,r,a)};fe.createContext=function(t){return t={$$typeof:e1,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:Zk,_context:t},t};fe.createElement=function(t,e,n){var a,r={},s=null;if(e!=null)for(a in e.key!==void 0&&(s=""+e.key),e)fE.call(e,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(r[a]=e[a]);var i=arguments.length-2;if(i===1)r.children=n;else if(1<i){for(var l=Array(i),u=0;u<i;u++)l[u]=arguments[u+2];r.children=l}if(t&&t.defaultProps)for(a in i=t.defaultProps,i)r[a]===void 0&&(r[a]=i[a]);return pm(t,s,r)};fe.createRef=function(){return{current:null}};fe.forwardRef=function(t){return{$$typeof:t1,render:t}};fe.isValidElement=mm;fe.lazy=function(t){return{$$typeof:oE,_payload:{_status:-1,_result:t},_init:u1}};fe.memo=function(t,e){return{$$typeof:a1,type:t,compare:e===void 0?null:e}};fe.startTransition=function(t){var e=Ge.T,n={};Ge.T=n;try{var a=t(),r=Ge.S;r!==null&&r(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(cm,iE)}catch(s){iE(s)}finally{e!==null&&n.types!==null&&(e.types=n.types),Ge.T=e}};fe.unstable_useCacheRefresh=function(){return Ge.H.useCacheRefresh()};fe.use=function(t){return Ge.H.use(t)};fe.useActionState=function(t,e,n){return Ge.H.useActionState(t,e,n)};fe.useCallback=function(t,e){return Ge.H.useCallback(t,e)};fe.useContext=function(t){return Ge.H.useContext(t)};fe.useDebugValue=function(){};fe.useDeferredValue=function(t,e){return Ge.H.useDeferredValue(t,e)};fe.useEffect=function(t,e){return Ge.H.useEffect(t,e)};fe.useEffectEvent=function(t){return Ge.H.useEffectEvent(t)};fe.useId=function(){return Ge.H.useId()};fe.useImperativeHandle=function(t,e,n){return Ge.H.useImperativeHandle(t,e,n)};fe.useInsertionEffect=function(t,e){return Ge.H.useInsertionEffect(t,e)};fe.useLayoutEffect=function(t,e){return Ge.H.useLayoutEffect(t,e)};fe.useMemo=function(t,e){return Ge.H.useMemo(t,e)};fe.useOptimistic=function(t,e){return Ge.H.useOptimistic(t,e)};fe.useReducer=function(t,e,n){return Ge.H.useReducer(t,e,n)};fe.useRef=function(t){return Ge.H.useRef(t)};fe.useState=function(t){return Ge.H.useState(t)};fe.useSyncExternalStore=function(t,e,n){return Ge.H.useSyncExternalStore(t,e,n)};fe.useTransition=function(){return Ge.H.useTransition()};fe.version="19.2.3"});var En=Re((jF,pE)=>{"use strict";pE.exports=hE()});var bE=Re(Ye=>{"use strict";function _m(t,e){var n=t.length;t.push(e);e:for(;0<n;){var a=n-1>>>1,r=t[a];if(0<Ed(r,e))t[a]=e,t[n]=r,n=a;else break e}}function _a(t){return t.length===0?null:t[0]}function bd(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var a=0,r=t.length,s=r>>>1;a<s;){var i=2*(a+1)-1,l=t[i],u=i+1,c=t[u];if(0>Ed(l,n))u<r&&0>Ed(c,l)?(t[a]=c,t[u]=n,a=u):(t[a]=l,t[i]=n,a=i);else if(u<r&&0>Ed(c,n))t[a]=c,t[u]=n,a=u;else break e}}return e}function Ed(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}Ye.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(mE=performance,Ye.unstable_now=function(){return mE.now()}):(gm=Date,gE=gm.now(),Ye.unstable_now=function(){return gm.now()-gE});var mE,gm,gE,tr=[],es=[],d1=1,Nn=null,Yt=3,Sm=!1,Wl=!1,Xl=!1,vm=!1,_E=typeof setTimeout=="function"?setTimeout:null,SE=typeof clearTimeout=="function"?clearTimeout:null,yE=typeof setImmediate<"u"?setImmediate:null;function Td(t){for(var e=_a(es);e!==null;){if(e.callback===null)bd(es);else if(e.startTime<=t)bd(es),e.sortIndex=e.expirationTime,_m(tr,e);else break;e=_a(es)}}function Em(t){if(Xl=!1,Td(t),!Wl)if(_a(tr)!==null)Wl=!0,Yi||(Yi=!0,Xi());else{var e=_a(es);e!==null&&Tm(Em,e.startTime-t)}}var Yi=!1,Yl=-1,vE=5,EE=-1;function TE(){return vm?!0:!(Ye.unstable_now()-EE<vE)}function ym(){if(vm=!1,Yi){var t=Ye.unstable_now();EE=t;var e=!0;try{e:{Wl=!1,Xl&&(Xl=!1,SE(Yl),Yl=-1),Sm=!0;var n=Yt;try{t:{for(Td(t),Nn=_a(tr);Nn!==null&&!(Nn.expirationTime>t&&TE());){var a=Nn.callback;if(typeof a=="function"){Nn.callback=null,Yt=Nn.priorityLevel;var r=a(Nn.expirationTime<=t);if(t=Ye.unstable_now(),typeof r=="function"){Nn.callback=r,Td(t),e=!0;break t}Nn===_a(tr)&&bd(tr),Td(t)}else bd(tr);Nn=_a(tr)}if(Nn!==null)e=!0;else{var s=_a(es);s!==null&&Tm(Em,s.startTime-t),e=!1}}break e}finally{Nn=null,Yt=n,Sm=!1}e=void 0}}finally{e?Xi():Yi=!1}}}var Xi;typeof yE=="function"?Xi=function(){yE(ym)}:typeof MessageChannel<"u"?(Im=new MessageChannel,IE=Im.port2,Im.port1.onmessage=ym,Xi=function(){IE.postMessage(null)}):Xi=function(){_E(ym,0)};var Im,IE;function Tm(t,e){Yl=_E(function(){t(Ye.unstable_now())},e)}Ye.unstable_IdlePriority=5;Ye.unstable_ImmediatePriority=1;Ye.unstable_LowPriority=4;Ye.unstable_NormalPriority=3;Ye.unstable_Profiling=null;Ye.unstable_UserBlockingPriority=2;Ye.unstable_cancelCallback=function(t){t.callback=null};Ye.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):vE=0<t?Math.floor(1e3/t):5};Ye.unstable_getCurrentPriorityLevel=function(){return Yt};Ye.unstable_next=function(t){switch(Yt){case 1:case 2:case 3:var e=3;break;default:e=Yt}var n=Yt;Yt=e;try{return t()}finally{Yt=n}};Ye.unstable_requestPaint=function(){vm=!0};Ye.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=Yt;Yt=t;try{return e()}finally{Yt=n}};Ye.unstable_scheduleCallback=function(t,e,n){var a=Ye.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:d1++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>a?(t.sortIndex=n,_m(es,t),_a(tr)===null&&t===_a(es)&&(Xl?(SE(Yl),Yl=-1):Xl=!0,Tm(Em,n-a))):(t.sortIndex=r,_m(tr,t),Wl||Sm||(Wl=!0,Yi||(Yi=!0,Xi()))),t};Ye.unstable_shouldYield=TE;Ye.unstable_wrapCallback=function(t){var e=Yt;return function(){var n=Yt;Yt=e;try{return t.apply(this,arguments)}finally{Yt=n}}}});var CE=Re((WF,wE)=>{"use strict";wE.exports=bE()});var AE=Re(nn=>{"use strict";var f1=En();function LE(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ts(){}var tn={d:{f:ts,r:function(){throw Error(LE(522))},D:ts,C:ts,L:ts,m:ts,X:ts,S:ts,M:ts},p:0,findDOMNode:null},h1=Symbol.for("react.portal");function p1(t,e,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:h1,key:a==null?null:""+a,children:t,containerInfo:e,implementation:n}}var Ql=f1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function wd(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}nn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=tn;nn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(LE(299));return p1(t,e,null,n)};nn.flushSync=function(t){var e=Ql.T,n=tn.p;try{if(Ql.T=null,tn.p=2,t)return t()}finally{Ql.T=e,tn.p=n,tn.d.f()}};nn.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,tn.d.C(t,e))};nn.prefetchDNS=function(t){typeof t=="string"&&tn.d.D(t)};nn.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,a=wd(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,s=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?tn.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:a,integrity:r,fetchPriority:s}):n==="script"&&tn.d.X(t,{crossOrigin:a,integrity:r,fetchPriority:s,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};nn.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=wd(e.as,e.crossOrigin);tn.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&tn.d.M(t)};nn.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,a=wd(n,e.crossOrigin);tn.d.L(t,n,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};nn.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=wd(e.as,e.crossOrigin);tn.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else tn.d.m(t)};nn.requestFormReset=function(t){tn.d.r(t)};nn.unstable_batchedUpdates=function(t,e){return t(e)};nn.useFormState=function(t,e,n){return Ql.H.useFormState(t,e,n)};nn.useFormStatus=function(){return Ql.H.useHostTransitionStatus()};nn.version="19.2.3"});var Cd=Re((YF,RE)=>{"use strict";function xE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(xE)}catch(t){console.error(t)}}xE(),RE.exports=AE()});var zC=Re(Jf=>{"use strict";var Ct=CE(),nb=En(),m1=Cd();function F(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ab(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Nu(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function rb(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function sb(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function kE(t){if(Nu(t)!==t)throw Error(F(188))}function g1(t){var e=t.alternate;if(!e){if(e=Nu(t),e===null)throw Error(F(188));return e!==t?null:t}for(var n=t,a=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(a=r.return,a!==null){n=a;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return kE(r),t;if(s===a)return kE(r),e;s=s.sibling}throw Error(F(188))}if(n.return!==a.return)n=r,a=s;else{for(var i=!1,l=r.child;l;){if(l===n){i=!0,n=r,a=s;break}if(l===a){i=!0,a=r,n=s;break}l=l.sibling}if(!i){for(l=s.child;l;){if(l===n){i=!0,n=s,a=r;break}if(l===a){i=!0,a=s,n=r;break}l=l.sibling}if(!i)throw Error(F(189))}}if(n.alternate!==a)throw Error(F(190))}if(n.tag!==3)throw Error(F(188));return n.stateNode.current===n?t:e}function ib(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=ib(t),e!==null)return e;t=t.sibling}return null}var We=Object.assign,y1=Symbol.for("react.element"),Ld=Symbol.for("react.transitional.element"),ru=Symbol.for("react.portal"),to=Symbol.for("react.fragment"),ob=Symbol.for("react.strict_mode"),ag=Symbol.for("react.profiler"),lb=Symbol.for("react.consumer"),ur=Symbol.for("react.context"),Jg=Symbol.for("react.forward_ref"),rg=Symbol.for("react.suspense"),sg=Symbol.for("react.suspense_list"),Zg=Symbol.for("react.memo"),ns=Symbol.for("react.lazy");Symbol.for("react.scope");var ig=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var I1=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var DE=Symbol.iterator;function $l(t){return t===null||typeof t!="object"?null:(t=DE&&t[DE]||t["@@iterator"],typeof t=="function"?t:null)}var _1=Symbol.for("react.client.reference");function og(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===_1?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case to:return"Fragment";case ag:return"Profiler";case ob:return"StrictMode";case rg:return"Suspense";case sg:return"SuspenseList";case ig:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case ru:return"Portal";case ur:return t.displayName||"Context";case lb:return(t._context.displayName||"Context")+".Consumer";case Jg:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Zg:return e=t.displayName||null,e!==null?e:og(t.type)||"Memo";case ns:e=t._payload,t=t._init;try{return og(t(e))}catch{}}return null}var su=Array.isArray,ie=nb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Pe=m1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Zs={pending:!1,data:null,method:null,action:null},lg=[],no=-1;function ba(t){return{current:t}}function Ot(t){0>no||(t.current=lg[no],lg[no]=null,no--)}function He(t,e){no++,lg[no]=t.current,t.current=e}var Ta=ba(null),Eu=ba(null),hs=ba(null),of=ba(null);function lf(t,e){switch(He(hs,e),He(Eu,t),He(Ta,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?FT(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=FT(e),t=AC(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Ot(Ta),He(Ta,t)}function vo(){Ot(Ta),Ot(Eu),Ot(hs)}function ug(t){t.memoizedState!==null&&He(of,t);var e=Ta.current,n=AC(e,t.type);e!==n&&(He(Eu,t),He(Ta,n))}function uf(t){Eu.current===t&&(Ot(Ta),Ot(Eu)),of.current===t&&(Ot(of),Pu._currentValue=Zs)}var bm,PE;function Ys(t){if(bm===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);bm=e&&e[1]||"",PE=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+bm+t+PE}var wm=!1;function Cm(t,e){if(!t||wm)return"";wm=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(e){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(v){var m=v}Reflect.construct(t,[],p)}else{try{p.call()}catch(v){m=v}t.call(p.prototype)}}else{try{throw Error()}catch(v){m=v}(p=t())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(v){if(v&&m&&typeof v.stack=="string")return[v.stack,m.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=a.DetermineComponentFrameRoot(),i=s[0],l=s[1];if(i&&l){var u=i.split(`
`),c=l.split(`
`);for(r=a=0;a<u.length&&!u[a].includes("DetermineComponentFrameRoot");)a++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(a===u.length||r===c.length)for(a=u.length-1,r=c.length-1;1<=a&&0<=r&&u[a]!==c[r];)r--;for(;1<=a&&0<=r;a--,r--)if(u[a]!==c[r]){if(a!==1||r!==1)do if(a--,r--,0>r||u[a]!==c[r]){var f=`
`+u[a].replace(" at new "," at ");return t.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",t.displayName)),f}while(1<=a&&0<=r);break}}}finally{wm=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?Ys(n):""}function S1(t,e){switch(t.tag){case 26:case 27:case 5:return Ys(t.type);case 16:return Ys("Lazy");case 13:return t.child!==e&&e!==null?Ys("Suspense Fallback"):Ys("Suspense");case 19:return Ys("SuspenseList");case 0:case 15:return Cm(t.type,!1);case 11:return Cm(t.type.render,!1);case 1:return Cm(t.type,!0);case 31:return Ys("Activity");default:return""}}function OE(t){try{var e="",n=null;do e+=S1(t,n),n=t,t=t.return;while(t);return e}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var cg=Object.prototype.hasOwnProperty,ey=Ct.unstable_scheduleCallback,Lm=Ct.unstable_cancelCallback,v1=Ct.unstable_shouldYield,E1=Ct.unstable_requestPaint,Ln=Ct.unstable_now,T1=Ct.unstable_getCurrentPriorityLevel,ub=Ct.unstable_ImmediatePriority,cb=Ct.unstable_UserBlockingPriority,cf=Ct.unstable_NormalPriority,b1=Ct.unstable_LowPriority,db=Ct.unstable_IdlePriority,w1=Ct.log,C1=Ct.unstable_setDisableYieldValue,Vu=null,An=null;function ls(t){if(typeof w1=="function"&&C1(t),An&&typeof An.setStrictMode=="function")try{An.setStrictMode(Vu,t)}catch{}}var xn=Math.clz32?Math.clz32:x1,L1=Math.log,A1=Math.LN2;function x1(t){return t>>>=0,t===0?32:31-(L1(t)/A1|0)|0}var Ad=256,xd=262144,Rd=4194304;function Qs(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Nf(t,e,n){var a=t.pendingLanes;if(a===0)return 0;var r=0,s=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var l=a&134217727;return l!==0?(a=l&~s,a!==0?r=Qs(a):(i&=l,i!==0?r=Qs(i):n||(n=l&~t,n!==0&&(r=Qs(n))))):(l=a&~s,l!==0?r=Qs(l):i!==0?r=Qs(i):n||(n=a&~t,n!==0&&(r=Qs(n)))),r===0?0:e!==0&&e!==r&&!(e&s)&&(s=r&-r,n=e&-e,s>=n||s===32&&(n&4194048)!==0)?e:r}function Uu(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function R1(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function fb(){var t=Rd;return Rd<<=1,!(Rd&62914560)&&(Rd=4194304),t}function Am(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Fu(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function k1(t,e,n,a,r,s){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var l=t.entanglements,u=t.expirationTimes,c=t.hiddenUpdates;for(n=i&~n;0<n;){var f=31-xn(n),p=1<<f;l[f]=0,u[f]=-1;var m=c[f];if(m!==null)for(c[f]=null,f=0;f<m.length;f++){var v=m[f];v!==null&&(v.lane&=-536870913)}n&=~p}a!==0&&hb(t,a,0),s!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=s&~(i&~e))}function hb(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var a=31-xn(e);t.entangledLanes|=e,t.entanglements[a]=t.entanglements[a]|1073741824|n&261930}function pb(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var a=31-xn(n),r=1<<a;r&e|t[a]&e&&(t[a]|=e),n&=~r}}function mb(t,e){var n=e&-e;return n=n&42?1:ty(n),n&(t.suspendedLanes|e)?0:n}function ty(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function ny(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function gb(){var t=Pe.p;return t!==0?t:(t=window.event,t===void 0?32:FC(t.type))}function ME(t,e){var n=Pe.p;try{return Pe.p=t,e()}finally{Pe.p=n}}var Cs=Math.random().toString(36).slice(2),Ht="__reactFiber$"+Cs,hn="__reactProps$"+Cs,Do="__reactContainer$"+Cs,dg="__reactEvents$"+Cs,D1="__reactListeners$"+Cs,P1="__reactHandles$"+Cs,NE="__reactResources$"+Cs,Bu="__reactMarker$"+Cs;function ay(t){delete t[Ht],delete t[hn],delete t[dg],delete t[D1],delete t[P1]}function ao(t){var e=t[Ht];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Do]||n[Ht]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=GT(t);t!==null;){if(n=t[Ht])return n;t=GT(t)}return e}t=n,n=t.parentNode}return null}function Po(t){if(t=t[Ht]||t[Do]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function iu(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(F(33))}function po(t){var e=t[NE];return e||(e=t[NE]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Pt(t){t[Bu]=!0}var yb=new Set,Ib={};function ui(t,e){Eo(t,e),Eo(t+"Capture",e)}function Eo(t,e){for(Ib[t]=e,t=0;t<e.length;t++)yb.add(e[t])}var O1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),VE={},UE={};function M1(t){return cg.call(UE,t)?!0:cg.call(VE,t)?!1:O1.test(t)?UE[t]=!0:(VE[t]=!0,!1)}function jd(t,e,n){if(M1(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var a=e.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function kd(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function nr(t,e,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+a)}}function Un(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function _b(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function N1(t,e,n){var a=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var r=a.get,s=a.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(i){n=""+i,s.call(this,i)}}),Object.defineProperty(t,e,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function fg(t){if(!t._valueTracker){var e=_b(t)?"checked":"value";t._valueTracker=N1(t,e,""+t[e])}}function Sb(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),a="";return t&&(a=_b(t)?t.checked?"true":"false":t.value),t=a,t!==n?(e.setValue(t),!0):!1}function df(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var V1=/[\n"\\]/g;function qn(t){return t.replace(V1,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function hg(t,e,n,a,r,s,i,l){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+Un(e)):t.value!==""+Un(e)&&(t.value=""+Un(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?pg(t,i,Un(e)):n!=null?pg(t,i,Un(n)):a!=null&&t.removeAttribute("value"),r==null&&s!=null&&(t.defaultChecked=!!s),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"?t.name=""+Un(l):t.removeAttribute("name")}function vb(t,e,n,a,r,s,i,l){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.type=s),e!=null||n!=null){if(!(s!=="submit"&&s!=="reset"||e!=null)){fg(t);return}n=n!=null?""+Un(n):"",e=e!=null?""+Un(e):n,l||e===t.value||(t.value=e),t.defaultValue=e}a=a??r,a=typeof a!="function"&&typeof a!="symbol"&&!!a,t.checked=l?t.checked:!!a,t.defaultChecked=!!a,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),fg(t)}function pg(t,e,n){e==="number"&&df(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function mo(t,e,n,a){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&a&&(t[n].defaultSelected=!0)}else{for(n=""+Un(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,a&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function Eb(t,e,n){if(e!=null&&(e=""+Un(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+Un(n):""}function Tb(t,e,n,a){if(e==null){if(a!=null){if(n!=null)throw Error(F(92));if(su(a)){if(1<a.length)throw Error(F(93));a=a[0]}n=a}n==null&&(n=""),e=n}n=Un(e),t.defaultValue=n,a=t.textContent,a===n&&a!==""&&a!==null&&(t.value=a),fg(t)}function To(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var U1=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function FE(t,e,n){var a=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":a?t.setProperty(e,n):typeof n!="number"||n===0||U1.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function bb(t,e,n){if(e!=null&&typeof e!="object")throw Error(F(62));if(t=t.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||e!=null&&e.hasOwnProperty(a)||(a.indexOf("--")===0?t.setProperty(a,""):a==="float"?t.cssFloat="":t[a]="");for(var r in e)a=e[r],e.hasOwnProperty(r)&&n[r]!==a&&FE(t,r,a)}else for(var s in e)e.hasOwnProperty(s)&&FE(t,s,e[s])}function ry(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var F1=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),B1=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Kd(t){return B1.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function cr(){}var mg=null;function sy(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var ro=null,go=null;function BE(t){var e=Po(t);if(e&&(t=e.stateNode)){var n=t[hn]||null;e:switch(t=e.stateNode,e.type){case"input":if(hg(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+qn(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var a=n[e];if(a!==t&&a.form===t.form){var r=a[hn]||null;if(!r)throw Error(F(90));hg(a,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)a=n[e],a.form===t.form&&Sb(a)}break e;case"textarea":Eb(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&mo(t,!!n.multiple,e,!1)}}}var xm=!1;function wb(t,e,n){if(xm)return t(e,n);xm=!0;try{var a=t(e);return a}finally{if(xm=!1,(ro!==null||go!==null)&&(Xf(),ro&&(e=ro,t=go,go=ro=null,BE(e),t)))for(e=0;e<t.length;e++)BE(t[e])}}function Tu(t,e){var n=t.stateNode;if(n===null)return null;var a=n[hn]||null;if(a===null)return null;n=a[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(t=t.type,a=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!a;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(F(231,e,typeof n));return n}var mr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),gg=!1;if(mr)try{Qi={},Object.defineProperty(Qi,"passive",{get:function(){gg=!0}}),window.addEventListener("test",Qi,Qi),window.removeEventListener("test",Qi,Qi)}catch{gg=!1}var Qi,us=null,iy=null,Wd=null;function Cb(){if(Wd)return Wd;var t,e=iy,n=e.length,a,r="value"in us?us.value:us.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var i=n-t;for(a=1;a<=i&&e[n-a]===r[s-a];a++);return Wd=r.slice(t,1<a?1-a:void 0)}function Xd(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Dd(){return!0}function qE(){return!1}function pn(t){function e(n,a,r,s,i){this._reactName=n,this._targetInst=r,this.type=a,this.nativeEvent=s,this.target=i,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(s):s[l]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Dd:qE,this.isPropagationStopped=qE,this}return We(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Dd)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Dd)},persist:function(){},isPersistent:Dd}),e}var ci={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Vf=pn(ci),qu=We({},ci,{view:0,detail:0}),q1=pn(qu),Rm,km,Jl,Uf=We({},qu,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:oy,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Jl&&(Jl&&t.type==="mousemove"?(Rm=t.screenX-Jl.screenX,km=t.screenY-Jl.screenY):km=Rm=0,Jl=t),Rm)},movementY:function(t){return"movementY"in t?t.movementY:km}}),zE=pn(Uf),z1=We({},Uf,{dataTransfer:0}),H1=pn(z1),G1=We({},qu,{relatedTarget:0}),Dm=pn(G1),j1=We({},ci,{animationName:0,elapsedTime:0,pseudoElement:0}),K1=pn(j1),W1=We({},ci,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),X1=pn(W1),Y1=We({},ci,{data:0}),HE=pn(Y1),Q1={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},$1={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},J1={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Z1(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=J1[t])?!!e[t]:!1}function oy(){return Z1}var eD=We({},qu,{key:function(t){if(t.key){var e=Q1[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Xd(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?$1[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:oy,charCode:function(t){return t.type==="keypress"?Xd(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Xd(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),tD=pn(eD),nD=We({},Uf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),GE=pn(nD),aD=We({},qu,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:oy}),rD=pn(aD),sD=We({},ci,{propertyName:0,elapsedTime:0,pseudoElement:0}),iD=pn(sD),oD=We({},Uf,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),lD=pn(oD),uD=We({},ci,{newState:0,oldState:0}),cD=pn(uD),dD=[9,13,27,32],ly=mr&&"CompositionEvent"in window,uu=null;mr&&"documentMode"in document&&(uu=document.documentMode);var fD=mr&&"TextEvent"in window&&!uu,Lb=mr&&(!ly||uu&&8<uu&&11>=uu),jE=" ",KE=!1;function Ab(t,e){switch(t){case"keyup":return dD.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function xb(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var so=!1;function hD(t,e){switch(t){case"compositionend":return xb(e);case"keypress":return e.which!==32?null:(KE=!0,jE);case"textInput":return t=e.data,t===jE&&KE?null:t;default:return null}}function pD(t,e){if(so)return t==="compositionend"||!ly&&Ab(t,e)?(t=Cb(),Wd=iy=us=null,so=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Lb&&e.locale!=="ko"?null:e.data;default:return null}}var mD={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function WE(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!mD[t.type]:e==="textarea"}function Rb(t,e,n,a){ro?go?go.push(a):go=[a]:ro=a,e=xf(e,"onChange"),0<e.length&&(n=new Vf("onChange","change",null,n,a),t.push({event:n,listeners:e}))}var cu=null,bu=null;function gD(t){wC(t,0)}function Ff(t){var e=iu(t);if(Sb(e))return t}function XE(t,e){if(t==="change")return e}var kb=!1;mr&&(mr?(Od="oninput"in document,Od||(Pm=document.createElement("div"),Pm.setAttribute("oninput","return;"),Od=typeof Pm.oninput=="function"),Pd=Od):Pd=!1,kb=Pd&&(!document.documentMode||9<document.documentMode));var Pd,Od,Pm;function YE(){cu&&(cu.detachEvent("onpropertychange",Db),bu=cu=null)}function Db(t){if(t.propertyName==="value"&&Ff(bu)){var e=[];Rb(e,bu,t,sy(t)),wb(gD,e)}}function yD(t,e,n){t==="focusin"?(YE(),cu=e,bu=n,cu.attachEvent("onpropertychange",Db)):t==="focusout"&&YE()}function ID(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Ff(bu)}function _D(t,e){if(t==="click")return Ff(e)}function SD(t,e){if(t==="input"||t==="change")return Ff(e)}function vD(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var kn=typeof Object.is=="function"?Object.is:vD;function wu(t,e){if(kn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),a=Object.keys(e);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var r=n[a];if(!cg.call(e,r)||!kn(t[r],e[r]))return!1}return!0}function QE(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function $E(t,e){var n=QE(t);t=0;for(var a;n;){if(n.nodeType===3){if(a=t+n.textContent.length,t<=e&&a>=e)return{node:n,offset:e-t};t=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=QE(n)}}function Pb(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Pb(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Ob(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=df(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=df(t.document)}return e}function uy(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var ED=mr&&"documentMode"in document&&11>=document.documentMode,io=null,yg=null,du=null,Ig=!1;function JE(t,e,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Ig||io==null||io!==df(a)||(a=io,"selectionStart"in a&&uy(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),du&&wu(du,a)||(du=a,a=xf(yg,"onSelect"),0<a.length&&(e=new Vf("onSelect","select",null,e,n),t.push({event:e,listeners:a}),e.target=io)))}function Xs(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var oo={animationend:Xs("Animation","AnimationEnd"),animationiteration:Xs("Animation","AnimationIteration"),animationstart:Xs("Animation","AnimationStart"),transitionrun:Xs("Transition","TransitionRun"),transitionstart:Xs("Transition","TransitionStart"),transitioncancel:Xs("Transition","TransitionCancel"),transitionend:Xs("Transition","TransitionEnd")},Om={},Mb={};mr&&(Mb=document.createElement("div").style,"AnimationEvent"in window||(delete oo.animationend.animation,delete oo.animationiteration.animation,delete oo.animationstart.animation),"TransitionEvent"in window||delete oo.transitionend.transition);function di(t){if(Om[t])return Om[t];if(!oo[t])return t;var e=oo[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Mb)return Om[t]=e[n];return t}var Nb=di("animationend"),Vb=di("animationiteration"),Ub=di("animationstart"),TD=di("transitionrun"),bD=di("transitionstart"),wD=di("transitioncancel"),Fb=di("transitionend"),Bb=new Map,_g="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");_g.push("scrollEnd");function na(t,e){Bb.set(t,e),ui(e,[t])}var ff=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},Vn=[],lo=0,cy=0;function Bf(){for(var t=lo,e=cy=lo=0;e<t;){var n=Vn[e];Vn[e++]=null;var a=Vn[e];Vn[e++]=null;var r=Vn[e];Vn[e++]=null;var s=Vn[e];if(Vn[e++]=null,a!==null&&r!==null){var i=a.pending;i===null?r.next=r:(r.next=i.next,i.next=r),a.pending=r}s!==0&&qb(n,r,s)}}function qf(t,e,n,a){Vn[lo++]=t,Vn[lo++]=e,Vn[lo++]=n,Vn[lo++]=a,cy|=a,t.lanes|=a,t=t.alternate,t!==null&&(t.lanes|=a)}function dy(t,e,n,a){return qf(t,e,n,a),hf(t)}function fi(t,e){return qf(t,null,null,e),hf(t)}function qb(t,e,n){t.lanes|=n;var a=t.alternate;a!==null&&(a.lanes|=n);for(var r=!1,s=t.return;s!==null;)s.childLanes|=n,a=s.alternate,a!==null&&(a.childLanes|=n),s.tag===22&&(t=s.stateNode,t===null||t._visibility&1||(r=!0)),t=s,s=s.return;return t.tag===3?(s=t.stateNode,r&&e!==null&&(r=31-xn(n),t=s.hiddenUpdates,a=t[r],a===null?t[r]=[e]:a.push(e),e.lane=n|536870912),s):null}function hf(t){if(50<Su)throw Su=0,Bg=null,Error(F(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var uo={};function CD(t,e,n,a){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function wn(t,e,n,a){return new CD(t,e,n,a)}function fy(t){return t=t.prototype,!(!t||!t.isReactComponent)}function fr(t,e){var n=t.alternate;return n===null?(n=wn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function zb(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Yd(t,e,n,a,r,s){var i=0;if(a=t,typeof t=="function")fy(t)&&(i=1);else if(typeof t=="string")i=xP(t,n,Ta.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case ig:return t=wn(31,n,e,r),t.elementType=ig,t.lanes=s,t;case to:return ei(n.children,r,s,e);case ob:i=8,r|=24;break;case ag:return t=wn(12,n,e,r|2),t.elementType=ag,t.lanes=s,t;case rg:return t=wn(13,n,e,r),t.elementType=rg,t.lanes=s,t;case sg:return t=wn(19,n,e,r),t.elementType=sg,t.lanes=s,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case ur:i=10;break e;case lb:i=9;break e;case Jg:i=11;break e;case Zg:i=14;break e;case ns:i=16,a=null;break e}i=29,n=Error(F(130,t===null?"null":typeof t,"")),a=null}return e=wn(i,n,e,r),e.elementType=t,e.type=a,e.lanes=s,e}function ei(t,e,n,a){return t=wn(7,t,a,e),t.lanes=n,t}function Mm(t,e,n){return t=wn(6,t,null,e),t.lanes=n,t}function Hb(t){var e=wn(18,null,null,0);return e.stateNode=t,e}function Nm(t,e,n){return e=wn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var ZE=new WeakMap;function zn(t,e){if(typeof t=="object"&&t!==null){var n=ZE.get(t);return n!==void 0?n:(e={value:t,source:e,stack:OE(e)},ZE.set(t,e),e)}return{value:t,source:e,stack:OE(e)}}var co=[],fo=0,pf=null,Cu=0,Fn=[],Bn=0,Es=null,Sa=1,va="";function or(t,e){co[fo++]=Cu,co[fo++]=pf,pf=t,Cu=e}function Gb(t,e,n){Fn[Bn++]=Sa,Fn[Bn++]=va,Fn[Bn++]=Es,Es=t;var a=Sa;t=va;var r=32-xn(a)-1;a&=~(1<<r),n+=1;var s=32-xn(e)+r;if(30<s){var i=r-r%5;s=(a&(1<<i)-1).toString(32),a>>=i,r-=i,Sa=1<<32-xn(e)+r|n<<r|a,va=s+t}else Sa=1<<s|n<<r|a,va=t}function hy(t){t.return!==null&&(or(t,1),Gb(t,1,0))}function py(t){for(;t===pf;)pf=co[--fo],co[fo]=null,Cu=co[--fo],co[fo]=null;for(;t===Es;)Es=Fn[--Bn],Fn[Bn]=null,va=Fn[--Bn],Fn[Bn]=null,Sa=Fn[--Bn],Fn[Bn]=null}function jb(t,e){Fn[Bn++]=Sa,Fn[Bn++]=va,Fn[Bn++]=Es,Sa=e.id,va=e.overflow,Es=t}var Gt=null,Ke=null,we=!1,ps=null,Hn=!1,Sg=Error(F(519));function Ts(t){var e=Error(F(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Lu(zn(e,t)),Sg}function eT(t){var e=t.stateNode,n=t.type,a=t.memoizedProps;switch(e[Ht]=t,e[hn]=a,n){case"dialog":Ie("cancel",e),Ie("close",e);break;case"iframe":case"object":case"embed":Ie("load",e);break;case"video":case"audio":for(n=0;n<ku.length;n++)Ie(ku[n],e);break;case"source":Ie("error",e);break;case"img":case"image":case"link":Ie("error",e),Ie("load",e);break;case"details":Ie("toggle",e);break;case"input":Ie("invalid",e),vb(e,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":Ie("invalid",e);break;case"textarea":Ie("invalid",e),Tb(e,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||a.suppressHydrationWarning===!0||LC(e.textContent,n)?(a.popover!=null&&(Ie("beforetoggle",e),Ie("toggle",e)),a.onScroll!=null&&Ie("scroll",e),a.onScrollEnd!=null&&Ie("scrollend",e),a.onClick!=null&&(e.onclick=cr),e=!0):e=!1,e||Ts(t,!0)}function tT(t){for(Gt=t.return;Gt;)switch(Gt.tag){case 5:case 31:case 13:Hn=!1;return;case 27:case 3:Hn=!0;return;default:Gt=Gt.return}}function $i(t){if(t!==Gt)return!1;if(!we)return tT(t),we=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||jg(t.type,t.memoizedProps)),n=!n),n&&Ke&&Ts(t),tT(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(F(317));Ke=HT(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(F(317));Ke=HT(t)}else e===27?(e=Ke,Ls(t.type)?(t=Yg,Yg=null,Ke=t):Ke=e):Ke=Gt?jn(t.stateNode.nextSibling):null;return!0}function ri(){Ke=Gt=null,we=!1}function Vm(){var t=ps;return t!==null&&(dn===null?dn=t:dn.push.apply(dn,t),ps=null),t}function Lu(t){ps===null?ps=[t]:ps.push(t)}var vg=ba(null),hi=null,dr=null;function rs(t,e,n){He(vg,e._currentValue),e._currentValue=n}function hr(t){t._currentValue=vg.current,Ot(vg)}function Eg(t,e,n){for(;t!==null;){var a=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,a!==null&&(a.childLanes|=e)):a!==null&&(a.childLanes&e)!==e&&(a.childLanes|=e),t===n)break;t=t.return}}function Tg(t,e,n,a){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var s=r.dependencies;if(s!==null){var i=r.child;s=s.firstContext;e:for(;s!==null;){var l=s;s=r;for(var u=0;u<e.length;u++)if(l.context===e[u]){s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),Eg(s.return,n,t),a||(i=null);break e}s=l.next}}else if(r.tag===18){if(i=r.return,i===null)throw Error(F(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),Eg(i,n,t),i=null}else i=r.child;if(i!==null)i.return=r;else for(i=r;i!==null;){if(i===t){i=null;break}if(r=i.sibling,r!==null){r.return=i.return,i=r;break}i=i.return}r=i}}function Oo(t,e,n,a){t=null;for(var r=e,s=!1;r!==null;){if(!s){if(r.flags&524288)s=!0;else if(r.flags&262144)break}if(r.tag===10){var i=r.alternate;if(i===null)throw Error(F(387));if(i=i.memoizedProps,i!==null){var l=r.type;kn(r.pendingProps.value,i.value)||(t!==null?t.push(l):t=[l])}}else if(r===of.current){if(i=r.alternate,i===null)throw Error(F(387));i.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(Pu):t=[Pu])}r=r.return}t!==null&&Tg(e,t,n,a),e.flags|=262144}function mf(t){for(t=t.firstContext;t!==null;){if(!kn(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function si(t){hi=t,dr=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function jt(t){return Kb(hi,t)}function Md(t,e){return hi===null&&si(t),Kb(t,e)}function Kb(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},dr===null){if(t===null)throw Error(F(308));dr=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else dr=dr.next=e;return n}var LD=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,a){t.push(a)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},AD=Ct.unstable_scheduleCallback,xD=Ct.unstable_NormalPriority,mt={$$typeof:ur,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function my(){return{controller:new LD,data:new Map,refCount:0}}function zu(t){t.refCount--,t.refCount===0&&AD(xD,function(){t.controller.abort()})}var fu=null,bg=0,bo=0,yo=null;function RD(t,e){if(fu===null){var n=fu=[];bg=0,bo=By(),yo={status:"pending",value:void 0,then:function(a){n.push(a)}}}return bg++,e.then(nT,nT),e}function nT(){if(--bg===0&&fu!==null){yo!==null&&(yo.status="fulfilled");var t=fu;fu=null,bo=0,yo=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function kD(t,e){var n=[],a={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){a.status="fulfilled",a.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(a.status="rejected",a.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),a}var aT=ie.S;ie.S=function(t,e){iC=Ln(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&RD(t,e),aT!==null&&aT(t,e)};var ti=ba(null);function gy(){var t=ti.current;return t!==null?t:ze.pooledCache}function Qd(t,e){e===null?He(ti,ti.current):He(ti,e.pool)}function Wb(){var t=gy();return t===null?null:{parent:mt._currentValue,pool:t}}var Mo=Error(F(460)),yy=Error(F(474)),zf=Error(F(542)),gf={then:function(){}};function rT(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Xb(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(cr,cr),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,iT(t),t;default:if(typeof e.status=="string")e.then(cr,cr);else{if(t=ze,t!==null&&100<t.shellSuspendCounter)throw Error(F(482));t=e,t.status="pending",t.then(function(a){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=a}},function(a){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=a}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,iT(t),t}throw ni=e,Mo}}function $s(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(ni=n,Mo):n}}var ni=null;function sT(){if(ni===null)throw Error(F(459));var t=ni;return ni=null,t}function iT(t){if(t===Mo||t===zf)throw Error(F(483))}var Io=null,Au=0;function Nd(t){var e=Au;return Au+=1,Io===null&&(Io=[]),Xb(Io,t,e)}function Zl(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Vd(t,e){throw e.$$typeof===y1?Error(F(525)):(t=Object.prototype.toString.call(e),Error(F(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function Yb(t){function e(T,E){if(t){var C=T.deletions;C===null?(T.deletions=[E],T.flags|=16):C.push(E)}}function n(T,E){if(!t)return null;for(;E!==null;)e(T,E),E=E.sibling;return null}function a(T){for(var E=new Map;T!==null;)T.key!==null?E.set(T.key,T):E.set(T.index,T),T=T.sibling;return E}function r(T,E){return T=fr(T,E),T.index=0,T.sibling=null,T}function s(T,E,C){return T.index=C,t?(C=T.alternate,C!==null?(C=C.index,C<E?(T.flags|=67108866,E):C):(T.flags|=67108866,E)):(T.flags|=1048576,E)}function i(T){return t&&T.alternate===null&&(T.flags|=67108866),T}function l(T,E,C,L){return E===null||E.tag!==6?(E=Mm(C,T.mode,L),E.return=T,E):(E=r(E,C),E.return=T,E)}function u(T,E,C,L){var U=C.type;return U===to?f(T,E,C.props.children,L,C.key):E!==null&&(E.elementType===U||typeof U=="object"&&U!==null&&U.$$typeof===ns&&$s(U)===E.type)?(E=r(E,C.props),Zl(E,C),E.return=T,E):(E=Yd(C.type,C.key,C.props,null,T.mode,L),Zl(E,C),E.return=T,E)}function c(T,E,C,L){return E===null||E.tag!==4||E.stateNode.containerInfo!==C.containerInfo||E.stateNode.implementation!==C.implementation?(E=Nm(C,T.mode,L),E.return=T,E):(E=r(E,C.children||[]),E.return=T,E)}function f(T,E,C,L,U){return E===null||E.tag!==7?(E=ei(C,T.mode,L,U),E.return=T,E):(E=r(E,C),E.return=T,E)}function p(T,E,C){if(typeof E=="string"&&E!==""||typeof E=="number"||typeof E=="bigint")return E=Mm(""+E,T.mode,C),E.return=T,E;if(typeof E=="object"&&E!==null){switch(E.$$typeof){case Ld:return C=Yd(E.type,E.key,E.props,null,T.mode,C),Zl(C,E),C.return=T,C;case ru:return E=Nm(E,T.mode,C),E.return=T,E;case ns:return E=$s(E),p(T,E,C)}if(su(E)||$l(E))return E=ei(E,T.mode,C,null),E.return=T,E;if(typeof E.then=="function")return p(T,Nd(E),C);if(E.$$typeof===ur)return p(T,Md(T,E),C);Vd(T,E)}return null}function m(T,E,C,L){var U=E!==null?E.key:null;if(typeof C=="string"&&C!==""||typeof C=="number"||typeof C=="bigint")return U!==null?null:l(T,E,""+C,L);if(typeof C=="object"&&C!==null){switch(C.$$typeof){case Ld:return C.key===U?u(T,E,C,L):null;case ru:return C.key===U?c(T,E,C,L):null;case ns:return C=$s(C),m(T,E,C,L)}if(su(C)||$l(C))return U!==null?null:f(T,E,C,L,null);if(typeof C.then=="function")return m(T,E,Nd(C),L);if(C.$$typeof===ur)return m(T,E,Md(T,C),L);Vd(T,C)}return null}function v(T,E,C,L,U){if(typeof L=="string"&&L!==""||typeof L=="number"||typeof L=="bigint")return T=T.get(C)||null,l(E,T,""+L,U);if(typeof L=="object"&&L!==null){switch(L.$$typeof){case Ld:return T=T.get(L.key===null?C:L.key)||null,u(E,T,L,U);case ru:return T=T.get(L.key===null?C:L.key)||null,c(E,T,L,U);case ns:return L=$s(L),v(T,E,C,L,U)}if(su(L)||$l(L))return T=T.get(C)||null,f(E,T,L,U,null);if(typeof L.then=="function")return v(T,E,C,Nd(L),U);if(L.$$typeof===ur)return v(T,E,C,Md(E,L),U);Vd(E,L)}return null}function R(T,E,C,L){for(var U=null,N=null,y=E,g=E=0,_=null;y!==null&&g<C.length;g++){y.index>g?(_=y,y=null):_=y.sibling;var b=m(T,y,C[g],L);if(b===null){y===null&&(y=_);break}t&&y&&b.alternate===null&&e(T,y),E=s(b,E,g),N===null?U=b:N.sibling=b,N=b,y=_}if(g===C.length)return n(T,y),we&&or(T,g),U;if(y===null){for(;g<C.length;g++)y=p(T,C[g],L),y!==null&&(E=s(y,E,g),N===null?U=y:N.sibling=y,N=y);return we&&or(T,g),U}for(y=a(y);g<C.length;g++)_=v(y,T,g,C[g],L),_!==null&&(t&&_.alternate!==null&&y.delete(_.key===null?g:_.key),E=s(_,E,g),N===null?U=_:N.sibling=_,N=_);return t&&y.forEach(function(w){return e(T,w)}),we&&or(T,g),U}function D(T,E,C,L){if(C==null)throw Error(F(151));for(var U=null,N=null,y=E,g=E=0,_=null,b=C.next();y!==null&&!b.done;g++,b=C.next()){y.index>g?(_=y,y=null):_=y.sibling;var w=m(T,y,b.value,L);if(w===null){y===null&&(y=_);break}t&&y&&w.alternate===null&&e(T,y),E=s(w,E,g),N===null?U=w:N.sibling=w,N=w,y=_}if(b.done)return n(T,y),we&&or(T,g),U;if(y===null){for(;!b.done;g++,b=C.next())b=p(T,b.value,L),b!==null&&(E=s(b,E,g),N===null?U=b:N.sibling=b,N=b);return we&&or(T,g),U}for(y=a(y);!b.done;g++,b=C.next())b=v(y,T,g,b.value,L),b!==null&&(t&&b.alternate!==null&&y.delete(b.key===null?g:b.key),E=s(b,E,g),N===null?U=b:N.sibling=b,N=b);return t&&y.forEach(function(A){return e(T,A)}),we&&or(T,g),U}function x(T,E,C,L){if(typeof C=="object"&&C!==null&&C.type===to&&C.key===null&&(C=C.props.children),typeof C=="object"&&C!==null){switch(C.$$typeof){case Ld:e:{for(var U=C.key;E!==null;){if(E.key===U){if(U=C.type,U===to){if(E.tag===7){n(T,E.sibling),L=r(E,C.props.children),L.return=T,T=L;break e}}else if(E.elementType===U||typeof U=="object"&&U!==null&&U.$$typeof===ns&&$s(U)===E.type){n(T,E.sibling),L=r(E,C.props),Zl(L,C),L.return=T,T=L;break e}n(T,E);break}else e(T,E);E=E.sibling}C.type===to?(L=ei(C.props.children,T.mode,L,C.key),L.return=T,T=L):(L=Yd(C.type,C.key,C.props,null,T.mode,L),Zl(L,C),L.return=T,T=L)}return i(T);case ru:e:{for(U=C.key;E!==null;){if(E.key===U)if(E.tag===4&&E.stateNode.containerInfo===C.containerInfo&&E.stateNode.implementation===C.implementation){n(T,E.sibling),L=r(E,C.children||[]),L.return=T,T=L;break e}else{n(T,E);break}else e(T,E);E=E.sibling}L=Nm(C,T.mode,L),L.return=T,T=L}return i(T);case ns:return C=$s(C),x(T,E,C,L)}if(su(C))return R(T,E,C,L);if($l(C)){if(U=$l(C),typeof U!="function")throw Error(F(150));return C=U.call(C),D(T,E,C,L)}if(typeof C.then=="function")return x(T,E,Nd(C),L);if(C.$$typeof===ur)return x(T,E,Md(T,C),L);Vd(T,C)}return typeof C=="string"&&C!==""||typeof C=="number"||typeof C=="bigint"?(C=""+C,E!==null&&E.tag===6?(n(T,E.sibling),L=r(E,C),L.return=T,T=L):(n(T,E),L=Mm(C,T.mode,L),L.return=T,T=L),i(T)):n(T,E)}return function(T,E,C,L){try{Au=0;var U=x(T,E,C,L);return Io=null,U}catch(y){if(y===Mo||y===zf)throw y;var N=wn(29,y,null,T.mode);return N.lanes=L,N.return=T,N}finally{}}}var ii=Yb(!0),Qb=Yb(!1),as=!1;function Iy(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function wg(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function ms(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function gs(t,e,n){var a=t.updateQueue;if(a===null)return null;if(a=a.shared,De&2){var r=a.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),a.pending=e,e=hf(t),qb(t,null,n),e}return qf(t,a,e,n),hf(t)}function hu(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,pb(t,n)}}function Um(t,e){var n=t.updateQueue,a=t.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};s===null?r=s=i:s=s.next=i,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:a.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:a.shared,callbacks:a.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var Cg=!1;function pu(){if(Cg){var t=yo;if(t!==null)throw t}}function mu(t,e,n,a){Cg=!1;var r=t.updateQueue;as=!1;var s=r.firstBaseUpdate,i=r.lastBaseUpdate,l=r.shared.pending;if(l!==null){r.shared.pending=null;var u=l,c=u.next;u.next=null,i===null?s=c:i.next=c,i=u;var f=t.alternate;f!==null&&(f=f.updateQueue,l=f.lastBaseUpdate,l!==i&&(l===null?f.firstBaseUpdate=c:l.next=c,f.lastBaseUpdate=u))}if(s!==null){var p=r.baseState;i=0,f=c=u=null,l=s;do{var m=l.lane&-536870913,v=m!==l.lane;if(v?(Te&m)===m:(a&m)===m){m!==0&&m===bo&&(Cg=!0),f!==null&&(f=f.next={lane:0,tag:l.tag,payload:l.payload,callback:null,next:null});e:{var R=t,D=l;m=e;var x=n;switch(D.tag){case 1:if(R=D.payload,typeof R=="function"){p=R.call(x,p,m);break e}p=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=D.payload,m=typeof R=="function"?R.call(x,p,m):R,m==null)break e;p=We({},p,m);break e;case 2:as=!0}}m=l.callback,m!==null&&(t.flags|=64,v&&(t.flags|=8192),v=r.callbacks,v===null?r.callbacks=[m]:v.push(m))}else v={lane:m,tag:l.tag,payload:l.payload,callback:l.callback,next:null},f===null?(c=f=v,u=p):f=f.next=v,i|=m;if(l=l.next,l===null){if(l=r.shared.pending,l===null)break;v=l,l=v.next,v.next=null,r.lastBaseUpdate=v,r.shared.pending=null}}while(!0);f===null&&(u=p),r.baseState=u,r.firstBaseUpdate=c,r.lastBaseUpdate=f,s===null&&(r.shared.lanes=0),ws|=i,t.lanes=i,t.memoizedState=p}}function $b(t,e){if(typeof t!="function")throw Error(F(191,t));t.call(e)}function Jb(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)$b(n[t],e)}var wo=ba(null),yf=ba(0);function oT(t,e){t=_r,He(yf,t),He(wo,e),_r=t|e.baseLanes}function Lg(){He(yf,_r),He(wo,wo.current)}function _y(){_r=yf.current,Ot(wo),Ot(yf)}var Dn=ba(null),Gn=null;function ss(t){var e=t.alternate;He(ot,ot.current&1),He(Dn,t),Gn===null&&(e===null||wo.current!==null||e.memoizedState!==null)&&(Gn=t)}function Ag(t){He(ot,ot.current),He(Dn,t),Gn===null&&(Gn=t)}function Zb(t){t.tag===22?(He(ot,ot.current),He(Dn,t),Gn===null&&(Gn=t)):is(t)}function is(){He(ot,ot.current),He(Dn,Dn.current)}function bn(t){Ot(Dn),Gn===t&&(Gn=null),Ot(ot)}var ot=ba(0);function If(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Wg(n)||Xg(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var gr=0,he=null,Fe=null,ht=null,_f=!1,_o=!1,oi=!1,Sf=0,xu=0,So=null,DD=0;function rt(){throw Error(F(321))}function Sy(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!kn(t[n],e[n]))return!1;return!0}function vy(t,e,n,a,r,s){return gr=s,he=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,ie.H=t===null||t.memoizedState===null?Rw:Dy,oi=!1,s=n(a,r),oi=!1,_o&&(s=tw(e,n,a,r)),ew(t),s}function ew(t){ie.H=Ru;var e=Fe!==null&&Fe.next!==null;if(gr=0,ht=Fe=he=null,_f=!1,xu=0,So=null,e)throw Error(F(300));t===null||gt||(t=t.dependencies,t!==null&&mf(t)&&(gt=!0))}function tw(t,e,n,a){he=t;var r=0;do{if(_o&&(So=null),xu=0,_o=!1,25<=r)throw Error(F(301));if(r+=1,ht=Fe=null,t.updateQueue!=null){var s=t.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}ie.H=kw,s=e(n,a)}while(_o);return s}function PD(){var t=ie.H,e=t.useState()[0];return e=typeof e.then=="function"?Hu(e):e,t=t.useState()[0],(Fe!==null?Fe.memoizedState:null)!==t&&(he.flags|=1024),e}function Ey(){var t=Sf!==0;return Sf=0,t}function Ty(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function by(t){if(_f){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}_f=!1}gr=0,ht=Fe=he=null,_o=!1,xu=Sf=0,So=null}function an(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ht===null?he.memoizedState=ht=t:ht=ht.next=t,ht}function lt(){if(Fe===null){var t=he.alternate;t=t!==null?t.memoizedState:null}else t=Fe.next;var e=ht===null?he.memoizedState:ht.next;if(e!==null)ht=e,Fe=t;else{if(t===null)throw he.alternate===null?Error(F(467)):Error(F(310));Fe=t,t={memoizedState:Fe.memoizedState,baseState:Fe.baseState,baseQueue:Fe.baseQueue,queue:Fe.queue,next:null},ht===null?he.memoizedState=ht=t:ht=ht.next=t}return ht}function Hf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Hu(t){var e=xu;return xu+=1,So===null&&(So=[]),t=Xb(So,t,e),e=he,(ht===null?e.memoizedState:ht.next)===null&&(e=e.alternate,ie.H=e===null||e.memoizedState===null?Rw:Dy),t}function Gf(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Hu(t);if(t.$$typeof===ur)return jt(t)}throw Error(F(438,String(t)))}function wy(t){var e=null,n=he.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var a=he.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(e={data:a.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Hf(),he.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),a=0;a<t;a++)n[a]=I1;return e.index++,n}function yr(t,e){return typeof e=="function"?e(t):e}function $d(t){var e=lt();return Cy(e,Fe,t)}function Cy(t,e,n){var a=t.queue;if(a===null)throw Error(F(311));a.lastRenderedReducer=n;var r=t.baseQueue,s=a.pending;if(s!==null){if(r!==null){var i=r.next;r.next=s.next,s.next=i}e.baseQueue=r=s,a.pending=null}if(s=t.baseState,r===null)t.memoizedState=s;else{e=r.next;var l=i=null,u=null,c=e,f=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(Te&p)===p:(gr&p)===p){var m=c.revertLane;if(m===0)u!==null&&(u=u.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===bo&&(f=!0);else if((gr&m)===m){c=c.next,m===bo&&(f=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},u===null?(l=u=p,i=s):u=u.next=p,he.lanes|=m,ws|=m;p=c.action,oi&&n(s,p),s=c.hasEagerState?c.eagerState:n(s,p)}else m={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},u===null?(l=u=m,i=s):u=u.next=m,he.lanes|=p,ws|=p;c=c.next}while(c!==null&&c!==e);if(u===null?i=s:u.next=l,!kn(s,t.memoizedState)&&(gt=!0,f&&(n=yo,n!==null)))throw n;t.memoizedState=s,t.baseState=i,t.baseQueue=u,a.lastRenderedState=s}return r===null&&(a.lanes=0),[t.memoizedState,a.dispatch]}function Fm(t){var e=lt(),n=e.queue;if(n===null)throw Error(F(311));n.lastRenderedReducer=t;var a=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var i=r=r.next;do s=t(s,i.action),i=i.next;while(i!==r);kn(s,e.memoizedState)||(gt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,a]}function nw(t,e,n){var a=he,r=lt(),s=we;if(s){if(n===void 0)throw Error(F(407));n=n()}else n=e();var i=!kn((Fe||r).memoizedState,n);if(i&&(r.memoizedState=n,gt=!0),r=r.queue,Ly(sw.bind(null,a,r,t),[t]),r.getSnapshot!==e||i||ht!==null&&ht.memoizedState.tag&1){if(a.flags|=2048,Co(9,{destroy:void 0},rw.bind(null,a,r,n,e),null),ze===null)throw Error(F(349));s||gr&127||aw(a,e,n)}return n}function aw(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=he.updateQueue,e===null?(e=Hf(),he.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function rw(t,e,n,a){e.value=n,e.getSnapshot=a,iw(e)&&ow(t)}function sw(t,e,n){return n(function(){iw(e)&&ow(t)})}function iw(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!kn(t,n)}catch{return!0}}function ow(t){var e=fi(t,2);e!==null&&fn(e,t,2)}function xg(t){var e=an();if(typeof t=="function"){var n=t;if(t=n(),oi){ls(!0);try{n()}finally{ls(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:yr,lastRenderedState:t},e}function lw(t,e,n,a){return t.baseState=n,Cy(t,Fe,typeof a=="function"?a:yr)}function OD(t,e,n,a,r){if(Kf(t))throw Error(F(485));if(t=e.action,t!==null){var s={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){s.listeners.push(i)}};ie.T!==null?n(!0):s.isTransition=!1,a(s),n=e.pending,n===null?(s.next=e.pending=s,uw(e,s)):(s.next=n.next,e.pending=n.next=s)}}function uw(t,e){var n=e.action,a=e.payload,r=t.state;if(e.isTransition){var s=ie.T,i={};ie.T=i;try{var l=n(r,a),u=ie.S;u!==null&&u(i,l),lT(t,e,l)}catch(c){Rg(t,e,c)}finally{s!==null&&i.types!==null&&(s.types=i.types),ie.T=s}}else try{s=n(r,a),lT(t,e,s)}catch(c){Rg(t,e,c)}}function lT(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){uT(t,e,a)},function(a){return Rg(t,e,a)}):uT(t,e,n)}function uT(t,e,n){e.status="fulfilled",e.value=n,cw(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,uw(t,n)))}function Rg(t,e,n){var a=t.pending;if(t.pending=null,a!==null){a=a.next;do e.status="rejected",e.reason=n,cw(e),e=e.next;while(e!==a)}t.action=null}function cw(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function dw(t,e){return e}function cT(t,e){if(we){var n=ze.formState;if(n!==null){e:{var a=he;if(we){if(Ke){t:{for(var r=Ke,s=Hn;r.nodeType!==8;){if(!s){r=null;break t}if(r=jn(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){Ke=jn(r.nextSibling),a=r.data==="F!";break e}}Ts(a)}a=!1}a&&(e=n[0])}}return n=an(),n.memoizedState=n.baseState=e,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:dw,lastRenderedState:e},n.queue=a,n=Lw.bind(null,he,a),a.dispatch=n,a=xg(!1),s=ky.bind(null,he,!1,a.queue),a=an(),r={state:e,dispatch:null,action:t,pending:null},a.queue=r,n=OD.bind(null,he,r,s,n),r.dispatch=n,a.memoizedState=t,[e,n,!1]}function dT(t){var e=lt();return fw(e,Fe,t)}function fw(t,e,n){if(e=Cy(t,e,dw)[0],t=$d(yr)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var a=Hu(e)}catch(i){throw i===Mo?zf:i}else a=e;e=lt();var r=e.queue,s=r.dispatch;return n!==e.memoizedState&&(he.flags|=2048,Co(9,{destroy:void 0},MD.bind(null,r,n),null)),[a,s,t]}function MD(t,e){t.action=e}function fT(t){var e=lt(),n=Fe;if(n!==null)return fw(e,n,t);lt(),e=e.memoizedState,n=lt();var a=n.queue.dispatch;return n.memoizedState=t,[e,a,!1]}function Co(t,e,n,a){return t={tag:t,create:n,deps:a,inst:e,next:null},e=he.updateQueue,e===null&&(e=Hf(),he.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(a=n.next,n.next=t,t.next=a,e.lastEffect=t),t}function hw(){return lt().memoizedState}function Jd(t,e,n,a){var r=an();he.flags|=t,r.memoizedState=Co(1|e,{destroy:void 0},n,a===void 0?null:a)}function jf(t,e,n,a){var r=lt();a=a===void 0?null:a;var s=r.memoizedState.inst;Fe!==null&&a!==null&&Sy(a,Fe.memoizedState.deps)?r.memoizedState=Co(e,s,n,a):(he.flags|=t,r.memoizedState=Co(1|e,s,n,a))}function hT(t,e){Jd(8390656,8,t,e)}function Ly(t,e){jf(2048,8,t,e)}function ND(t){he.flags|=4;var e=he.updateQueue;if(e===null)e=Hf(),he.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function pw(t){var e=lt().memoizedState;return ND({ref:e,nextImpl:t}),function(){if(De&2)throw Error(F(440));return e.impl.apply(void 0,arguments)}}function mw(t,e){return jf(4,2,t,e)}function gw(t,e){return jf(4,4,t,e)}function yw(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Iw(t,e,n){n=n!=null?n.concat([t]):null,jf(4,4,yw.bind(null,e,t),n)}function Ay(){}function _w(t,e){var n=lt();e=e===void 0?null:e;var a=n.memoizedState;return e!==null&&Sy(e,a[1])?a[0]:(n.memoizedState=[t,e],t)}function Sw(t,e){var n=lt();e=e===void 0?null:e;var a=n.memoizedState;if(e!==null&&Sy(e,a[1]))return a[0];if(a=t(),oi){ls(!0);try{t()}finally{ls(!1)}}return n.memoizedState=[a,e],a}function xy(t,e,n){return n===void 0||gr&1073741824&&!(Te&261930)?t.memoizedState=e:(t.memoizedState=n,t=lC(),he.lanes|=t,ws|=t,n)}function vw(t,e,n,a){return kn(n,e)?n:wo.current!==null?(t=xy(t,n,a),kn(t,e)||(gt=!0),t):!(gr&42)||gr&1073741824&&!(Te&261930)?(gt=!0,t.memoizedState=n):(t=lC(),he.lanes|=t,ws|=t,e)}function Ew(t,e,n,a,r){var s=Pe.p;Pe.p=s!==0&&8>s?s:8;var i=ie.T,l={};ie.T=l,ky(t,!1,e,n);try{var u=r(),c=ie.S;if(c!==null&&c(l,u),u!==null&&typeof u=="object"&&typeof u.then=="function"){var f=kD(u,a);gu(t,e,f,Rn(t))}else gu(t,e,a,Rn(t))}catch(p){gu(t,e,{then:function(){},status:"rejected",reason:p},Rn())}finally{Pe.p=s,i!==null&&l.types!==null&&(i.types=l.types),ie.T=i}}function VD(){}function kg(t,e,n,a){if(t.tag!==5)throw Error(F(476));var r=Tw(t).queue;Ew(t,r,e,Zs,n===null?VD:function(){return bw(t),n(a)})}function Tw(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Zs,baseState:Zs,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:yr,lastRenderedState:Zs},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:yr,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function bw(t){var e=Tw(t);e.next===null&&(e=t.alternate.memoizedState),gu(t,e.next.queue,{},Rn())}function Ry(){return jt(Pu)}function ww(){return lt().memoizedState}function Cw(){return lt().memoizedState}function UD(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Rn();t=ms(n);var a=gs(e,t,n);a!==null&&(fn(a,e,n),hu(a,e,n)),e={cache:my()},t.payload=e;return}e=e.return}}function FD(t,e,n){var a=Rn();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Kf(t)?Aw(e,n):(n=dy(t,e,n,a),n!==null&&(fn(n,t,a),xw(n,e,a)))}function Lw(t,e,n){var a=Rn();gu(t,e,n,a)}function gu(t,e,n,a){var r={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Kf(t))Aw(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var i=e.lastRenderedState,l=s(i,n);if(r.hasEagerState=!0,r.eagerState=l,kn(l,i))return qf(t,e,r,0),ze===null&&Bf(),!1}catch{}finally{}if(n=dy(t,e,r,a),n!==null)return fn(n,t,a),xw(n,e,a),!0}return!1}function ky(t,e,n,a){if(a={lane:2,revertLane:By(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Kf(t)){if(e)throw Error(F(479))}else e=dy(t,n,a,2),e!==null&&fn(e,t,2)}function Kf(t){var e=t.alternate;return t===he||e!==null&&e===he}function Aw(t,e){_o=_f=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function xw(t,e,n){if(n&4194048){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,pb(t,n)}}var Ru={readContext:jt,use:Gf,useCallback:rt,useContext:rt,useEffect:rt,useImperativeHandle:rt,useLayoutEffect:rt,useInsertionEffect:rt,useMemo:rt,useReducer:rt,useRef:rt,useState:rt,useDebugValue:rt,useDeferredValue:rt,useTransition:rt,useSyncExternalStore:rt,useId:rt,useHostTransitionStatus:rt,useFormState:rt,useActionState:rt,useOptimistic:rt,useMemoCache:rt,useCacheRefresh:rt};Ru.useEffectEvent=rt;var Rw={readContext:jt,use:Gf,useCallback:function(t,e){return an().memoizedState=[t,e===void 0?null:e],t},useContext:jt,useEffect:hT,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,Jd(4194308,4,yw.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Jd(4194308,4,t,e)},useInsertionEffect:function(t,e){Jd(4,2,t,e)},useMemo:function(t,e){var n=an();e=e===void 0?null:e;var a=t();if(oi){ls(!0);try{t()}finally{ls(!1)}}return n.memoizedState=[a,e],a},useReducer:function(t,e,n){var a=an();if(n!==void 0){var r=n(e);if(oi){ls(!0);try{n(e)}finally{ls(!1)}}}else r=e;return a.memoizedState=a.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},a.queue=t,t=t.dispatch=FD.bind(null,he,t),[a.memoizedState,t]},useRef:function(t){var e=an();return t={current:t},e.memoizedState=t},useState:function(t){t=xg(t);var e=t.queue,n=Lw.bind(null,he,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Ay,useDeferredValue:function(t,e){var n=an();return xy(n,t,e)},useTransition:function(){var t=xg(!1);return t=Ew.bind(null,he,t.queue,!0,!1),an().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var a=he,r=an();if(we){if(n===void 0)throw Error(F(407));n=n()}else{if(n=e(),ze===null)throw Error(F(349));Te&127||aw(a,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,hT(sw.bind(null,a,s,t),[t]),a.flags|=2048,Co(9,{destroy:void 0},rw.bind(null,a,s,n,e),null),n},useId:function(){var t=an(),e=ze.identifierPrefix;if(we){var n=va,a=Sa;n=(a&~(1<<32-xn(a)-1)).toString(32)+n,e="_"+e+"R_"+n,n=Sf++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=DD++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Ry,useFormState:cT,useActionState:cT,useOptimistic:function(t){var e=an();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=ky.bind(null,he,!0,n),n.dispatch=e,[t,e]},useMemoCache:wy,useCacheRefresh:function(){return an().memoizedState=UD.bind(null,he)},useEffectEvent:function(t){var e=an(),n={impl:t};return e.memoizedState=n,function(){if(De&2)throw Error(F(440));return n.impl.apply(void 0,arguments)}}},Dy={readContext:jt,use:Gf,useCallback:_w,useContext:jt,useEffect:Ly,useImperativeHandle:Iw,useInsertionEffect:mw,useLayoutEffect:gw,useMemo:Sw,useReducer:$d,useRef:hw,useState:function(){return $d(yr)},useDebugValue:Ay,useDeferredValue:function(t,e){var n=lt();return vw(n,Fe.memoizedState,t,e)},useTransition:function(){var t=$d(yr)[0],e=lt().memoizedState;return[typeof t=="boolean"?t:Hu(t),e]},useSyncExternalStore:nw,useId:ww,useHostTransitionStatus:Ry,useFormState:dT,useActionState:dT,useOptimistic:function(t,e){var n=lt();return lw(n,Fe,t,e)},useMemoCache:wy,useCacheRefresh:Cw};Dy.useEffectEvent=pw;var kw={readContext:jt,use:Gf,useCallback:_w,useContext:jt,useEffect:Ly,useImperativeHandle:Iw,useInsertionEffect:mw,useLayoutEffect:gw,useMemo:Sw,useReducer:Fm,useRef:hw,useState:function(){return Fm(yr)},useDebugValue:Ay,useDeferredValue:function(t,e){var n=lt();return Fe===null?xy(n,t,e):vw(n,Fe.memoizedState,t,e)},useTransition:function(){var t=Fm(yr)[0],e=lt().memoizedState;return[typeof t=="boolean"?t:Hu(t),e]},useSyncExternalStore:nw,useId:ww,useHostTransitionStatus:Ry,useFormState:fT,useActionState:fT,useOptimistic:function(t,e){var n=lt();return Fe!==null?lw(n,Fe,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:wy,useCacheRefresh:Cw};kw.useEffectEvent=pw;function Bm(t,e,n,a){e=t.memoizedState,n=n(a,e),n=n==null?e:We({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Dg={enqueueSetState:function(t,e,n){t=t._reactInternals;var a=Rn(),r=ms(a);r.payload=e,n!=null&&(r.callback=n),e=gs(t,r,a),e!==null&&(fn(e,t,a),hu(e,t,a))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var a=Rn(),r=ms(a);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=gs(t,r,a),e!==null&&(fn(e,t,a),hu(e,t,a))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Rn(),a=ms(n);a.tag=2,e!=null&&(a.callback=e),e=gs(t,a,n),e!==null&&(fn(e,t,n),hu(e,t,n))}};function pT(t,e,n,a,r,s,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(a,s,i):e.prototype&&e.prototype.isPureReactComponent?!wu(n,a)||!wu(r,s):!0}function mT(t,e,n,a){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,a),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,a),e.state!==t&&Dg.enqueueReplaceState(e,e.state,null)}function li(t,e){var n=e;if("ref"in e){n={};for(var a in e)a!=="ref"&&(n[a]=e[a])}if(t=t.defaultProps){n===e&&(n=We({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function Dw(t){ff(t)}function Pw(t){console.error(t)}function Ow(t){ff(t)}function vf(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(a){setTimeout(function(){throw a})}}function gT(t,e,n){try{var a=t.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Pg(t,e,n){return n=ms(n),n.tag=3,n.payload={element:null},n.callback=function(){vf(t,e)},n}function Mw(t){return t=ms(t),t.tag=3,t}function Nw(t,e,n,a){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var s=a.value;t.payload=function(){return r(s)},t.callback=function(){gT(e,n,a)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){gT(e,n,a),typeof r!="function"&&(ys===null?ys=new Set([this]):ys.add(this));var l=a.stack;this.componentDidCatch(a.value,{componentStack:l!==null?l:""})})}function BD(t,e,n,a,r){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(e=n.alternate,e!==null&&Oo(e,n,r,!0),n=Dn.current,n!==null){switch(n.tag){case 31:case 13:return Gn===null?Cf():n.alternate===null&&st===0&&(st=3),n.flags&=-257,n.flags|=65536,n.lanes=r,a===gf?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([a]):e.add(a),$m(t,a,r)),!1;case 22:return n.flags|=65536,a===gf?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([a]):n.add(a)),$m(t,a,r)),!1}throw Error(F(435,n.tag))}return $m(t,a,r),Cf(),!1}if(we)return e=Dn.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,a!==Sg&&(t=Error(F(422),{cause:a}),Lu(zn(t,n)))):(a!==Sg&&(e=Error(F(423),{cause:a}),Lu(zn(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,a=zn(a,n),r=Pg(t.stateNode,a,r),Um(t,r),st!==4&&(st=2)),!1;var s=Error(F(520),{cause:a});if(s=zn(s,n),_u===null?_u=[s]:_u.push(s),st!==4&&(st=2),e===null)return!0;a=zn(a,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=Pg(n.stateNode,a,t),Um(n,t),!1;case 1:if(e=n.type,s=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(ys===null||!ys.has(s))))return n.flags|=65536,r&=-r,n.lanes|=r,r=Mw(r),Nw(r,t,n,a),Um(n,r),!1}n=n.return}while(n!==null);return!1}var Py=Error(F(461)),gt=!1;function zt(t,e,n,a){e.child=t===null?Qb(e,null,n,a):ii(e,t.child,n,a)}function yT(t,e,n,a,r){n=n.render;var s=e.ref;if("ref"in a){var i={};for(var l in a)l!=="ref"&&(i[l]=a[l])}else i=a;return si(e),a=vy(t,e,n,i,s,r),l=Ey(),t!==null&&!gt?(Ty(t,e,r),Ir(t,e,r)):(we&&l&&hy(e),e.flags|=1,zt(t,e,a,r),e.child)}function IT(t,e,n,a,r){if(t===null){var s=n.type;return typeof s=="function"&&!fy(s)&&s.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=s,Vw(t,e,s,a,r)):(t=Yd(n.type,null,a,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!Oy(t,r)){var i=s.memoizedProps;if(n=n.compare,n=n!==null?n:wu,n(i,a)&&t.ref===e.ref)return Ir(t,e,r)}return e.flags|=1,t=fr(s,a),t.ref=e.ref,t.return=e,e.child=t}function Vw(t,e,n,a,r){if(t!==null){var s=t.memoizedProps;if(wu(s,a)&&t.ref===e.ref)if(gt=!1,e.pendingProps=a=s,Oy(t,r))t.flags&131072&&(gt=!0);else return e.lanes=t.lanes,Ir(t,e,r)}return Og(t,e,n,a,r)}function Uw(t,e,n,a){var r=a.children,s=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(e.flags&128){if(s=s!==null?s.baseLanes|n:n,t!==null){for(a=e.child=t.child,r=0;a!==null;)r=r|a.lanes|a.childLanes,a=a.sibling;a=r&~s}else a=0,e.child=null;return _T(t,e,s,n,a)}if(n&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&Qd(e,s!==null?s.cachePool:null),s!==null?oT(e,s):Lg(),Zb(e);else return a=e.lanes=536870912,_T(t,e,s!==null?s.baseLanes|n:n,n,a)}else s!==null?(Qd(e,s.cachePool),oT(e,s),is(e),e.memoizedState=null):(t!==null&&Qd(e,null),Lg(),is(e));return zt(t,e,r,n),e.child}function ou(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function _T(t,e,n,a,r){var s=gy();return s=s===null?null:{parent:mt._currentValue,pool:s},e.memoizedState={baseLanes:n,cachePool:s},t!==null&&Qd(e,null),Lg(),Zb(e),t!==null&&Oo(t,e,a,!0),e.childLanes=r,null}function Zd(t,e){return e=Ef({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function ST(t,e,n){return ii(e,t.child,null,n),t=Zd(e,e.pendingProps),t.flags|=2,bn(e),e.memoizedState=null,t}function qD(t,e,n){var a=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(we){if(a.mode==="hidden")return t=Zd(e,a),e.lanes=536870912,ou(null,t);if(Ag(e),(t=Ke)?(t=RC(t,Hn),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Es!==null?{id:Sa,overflow:va}:null,retryLane:536870912,hydrationErrors:null},n=Hb(t),n.return=e,e.child=n,Gt=e,Ke=null)):t=null,t===null)throw Ts(e);return e.lanes=536870912,null}return Zd(e,a)}var s=t.memoizedState;if(s!==null){var i=s.dehydrated;if(Ag(e),r)if(e.flags&256)e.flags&=-257,e=ST(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(F(558));else if(gt||Oo(t,e,n,!1),r=(n&t.childLanes)!==0,gt||r){if(a=ze,a!==null&&(i=mb(a,n),i!==0&&i!==s.retryLane))throw s.retryLane=i,fi(t,i),fn(a,t,i),Py;Cf(),e=ST(t,e,n)}else t=s.treeContext,Ke=jn(i.nextSibling),Gt=e,we=!0,ps=null,Hn=!1,t!==null&&jb(e,t),e=Zd(e,a),e.flags|=4096;return e}return t=fr(t.child,{mode:a.mode,children:a.children}),t.ref=e.ref,e.child=t,t.return=e,t}function ef(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(F(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Og(t,e,n,a,r){return si(e),n=vy(t,e,n,a,void 0,r),a=Ey(),t!==null&&!gt?(Ty(t,e,r),Ir(t,e,r)):(we&&a&&hy(e),e.flags|=1,zt(t,e,n,r),e.child)}function vT(t,e,n,a,r,s){return si(e),e.updateQueue=null,n=tw(e,a,n,r),ew(t),a=Ey(),t!==null&&!gt?(Ty(t,e,s),Ir(t,e,s)):(we&&a&&hy(e),e.flags|=1,zt(t,e,n,s),e.child)}function ET(t,e,n,a,r){if(si(e),e.stateNode===null){var s=uo,i=n.contextType;typeof i=="object"&&i!==null&&(s=jt(i)),s=new n(a,s),e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Dg,e.stateNode=s,s._reactInternals=e,s=e.stateNode,s.props=a,s.state=e.memoizedState,s.refs={},Iy(e),i=n.contextType,s.context=typeof i=="object"&&i!==null?jt(i):uo,s.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(Bm(e,n,i,a),s.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(i=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),i!==s.state&&Dg.enqueueReplaceState(s,s.state,null),mu(e,a,s,r),pu(),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!0}else if(t===null){s=e.stateNode;var l=e.memoizedProps,u=li(n,l);s.props=u;var c=s.context,f=n.contextType;i=uo,typeof f=="object"&&f!==null&&(i=jt(f));var p=n.getDerivedStateFromProps;f=typeof p=="function"||typeof s.getSnapshotBeforeUpdate=="function",l=e.pendingProps!==l,f||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(l||c!==i)&&mT(e,s,a,i),as=!1;var m=e.memoizedState;s.state=m,mu(e,a,s,r),pu(),c=e.memoizedState,l||m!==c||as?(typeof p=="function"&&(Bm(e,n,p,a),c=e.memoizedState),(u=as||pT(e,n,u,a,m,c,i))?(f||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(e.flags|=4194308)):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=a,e.memoizedState=c),s.props=a,s.state=c,s.context=i,a=u):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!1)}else{s=e.stateNode,wg(t,e),i=e.memoizedProps,f=li(n,i),s.props=f,p=e.pendingProps,m=s.context,c=n.contextType,u=uo,typeof c=="object"&&c!==null&&(u=jt(c)),l=n.getDerivedStateFromProps,(c=typeof l=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(i!==p||m!==u)&&mT(e,s,a,u),as=!1,m=e.memoizedState,s.state=m,mu(e,a,s,r),pu();var v=e.memoizedState;i!==p||m!==v||as||t!==null&&t.dependencies!==null&&mf(t.dependencies)?(typeof l=="function"&&(Bm(e,n,l,a),v=e.memoizedState),(f=as||pT(e,n,f,a,m,v,u)||t!==null&&t.dependencies!==null&&mf(t.dependencies))?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(a,v,u),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(a,v,u)),typeof s.componentDidUpdate=="function"&&(e.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=a,e.memoizedState=v),s.props=a,s.state=v,s.context=u,a=f):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),a=!1)}return s=a,ef(t,e),a=(e.flags&128)!==0,s||a?(s=e.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:s.render(),e.flags|=1,t!==null&&a?(e.child=ii(e,t.child,null,r),e.child=ii(e,null,n,r)):zt(t,e,n,r),e.memoizedState=s.state,t=e.child):t=Ir(t,e,r),t}function TT(t,e,n,a){return ri(),e.flags|=256,zt(t,e,n,a),e.child}var qm={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function zm(t){return{baseLanes:t,cachePool:Wb()}}function Hm(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=Cn),t}function Fw(t,e,n){var a=e.pendingProps,r=!1,s=(e.flags&128)!==0,i;if((i=s)||(i=t!==null&&t.memoizedState===null?!1:(ot.current&2)!==0),i&&(r=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(we){if(r?ss(e):is(e),(t=Ke)?(t=RC(t,Hn),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Es!==null?{id:Sa,overflow:va}:null,retryLane:536870912,hydrationErrors:null},n=Hb(t),n.return=e,e.child=n,Gt=e,Ke=null)):t=null,t===null)throw Ts(e);return Xg(t)?e.lanes=32:e.lanes=536870912,null}var l=a.children;return a=a.fallback,r?(is(e),r=e.mode,l=Ef({mode:"hidden",children:l},r),a=ei(a,r,n,null),l.return=e,a.return=e,l.sibling=a,e.child=l,a=e.child,a.memoizedState=zm(n),a.childLanes=Hm(t,i,n),e.memoizedState=qm,ou(null,a)):(ss(e),Mg(e,l))}var u=t.memoizedState;if(u!==null&&(l=u.dehydrated,l!==null)){if(s)e.flags&256?(ss(e),e.flags&=-257,e=Gm(t,e,n)):e.memoizedState!==null?(is(e),e.child=t.child,e.flags|=128,e=null):(is(e),l=a.fallback,r=e.mode,a=Ef({mode:"visible",children:a.children},r),l=ei(l,r,n,null),l.flags|=2,a.return=e,l.return=e,a.sibling=l,e.child=a,ii(e,t.child,null,n),a=e.child,a.memoizedState=zm(n),a.childLanes=Hm(t,i,n),e.memoizedState=qm,e=ou(null,a));else if(ss(e),Xg(l)){if(i=l.nextSibling&&l.nextSibling.dataset,i)var c=i.dgst;i=c,a=Error(F(419)),a.stack="",a.digest=i,Lu({value:a,source:null,stack:null}),e=Gm(t,e,n)}else if(gt||Oo(t,e,n,!1),i=(n&t.childLanes)!==0,gt||i){if(i=ze,i!==null&&(a=mb(i,n),a!==0&&a!==u.retryLane))throw u.retryLane=a,fi(t,a),fn(i,t,a),Py;Wg(l)||Cf(),e=Gm(t,e,n)}else Wg(l)?(e.flags|=192,e.child=t.child,e=null):(t=u.treeContext,Ke=jn(l.nextSibling),Gt=e,we=!0,ps=null,Hn=!1,t!==null&&jb(e,t),e=Mg(e,a.children),e.flags|=4096);return e}return r?(is(e),l=a.fallback,r=e.mode,u=t.child,c=u.sibling,a=fr(u,{mode:"hidden",children:a.children}),a.subtreeFlags=u.subtreeFlags&65011712,c!==null?l=fr(c,l):(l=ei(l,r,n,null),l.flags|=2),l.return=e,a.return=e,a.sibling=l,e.child=a,ou(null,a),a=e.child,l=t.child.memoizedState,l===null?l=zm(n):(r=l.cachePool,r!==null?(u=mt._currentValue,r=r.parent!==u?{parent:u,pool:u}:r):r=Wb(),l={baseLanes:l.baseLanes|n,cachePool:r}),a.memoizedState=l,a.childLanes=Hm(t,i,n),e.memoizedState=qm,ou(t.child,a)):(ss(e),n=t.child,t=n.sibling,n=fr(n,{mode:"visible",children:a.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function Mg(t,e){return e=Ef({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Ef(t,e){return t=wn(22,t,null,e),t.lanes=0,t}function Gm(t,e,n){return ii(e,t.child,null,n),t=Mg(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function bT(t,e,n){t.lanes|=e;var a=t.alternate;a!==null&&(a.lanes|=e),Eg(t.return,e,n)}function jm(t,e,n,a,r,s){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:r,treeForkCount:s}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=a,i.tail=n,i.tailMode=r,i.treeForkCount=s)}function Bw(t,e,n){var a=e.pendingProps,r=a.revealOrder,s=a.tail;a=a.children;var i=ot.current,l=(i&2)!==0;if(l?(i=i&1|2,e.flags|=128):i&=1,He(ot,i),zt(t,e,a,n),a=we?Cu:0,!l&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&bT(t,n,e);else if(t.tag===19)bT(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&If(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),jm(e,!1,r,n,s,a);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&If(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}jm(e,!0,n,null,s,a);break;case"together":jm(e,!1,null,null,void 0,a);break;default:e.memoizedState=null}return e.child}function Ir(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),ws|=e.lanes,!(n&e.childLanes))if(t!==null){if(Oo(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(F(153));if(e.child!==null){for(t=e.child,n=fr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=fr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Oy(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&mf(t)))}function zD(t,e,n){switch(e.tag){case 3:lf(e,e.stateNode.containerInfo),rs(e,mt,t.memoizedState.cache),ri();break;case 27:case 5:ug(e);break;case 4:lf(e,e.stateNode.containerInfo);break;case 10:rs(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Ag(e),null;break;case 13:var a=e.memoizedState;if(a!==null)return a.dehydrated!==null?(ss(e),e.flags|=128,null):n&e.child.childLanes?Fw(t,e,n):(ss(e),t=Ir(t,e,n),t!==null?t.sibling:null);ss(e);break;case 19:var r=(t.flags&128)!==0;if(a=(n&e.childLanes)!==0,a||(Oo(t,e,n,!1),a=(n&e.childLanes)!==0),r){if(a)return Bw(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),He(ot,ot.current),a)break;return null;case 22:return e.lanes=0,Uw(t,e,n,e.pendingProps);case 24:rs(e,mt,t.memoizedState.cache)}return Ir(t,e,n)}function qw(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)gt=!0;else{if(!Oy(t,n)&&!(e.flags&128))return gt=!1,zD(t,e,n);gt=!!(t.flags&131072)}else gt=!1,we&&e.flags&1048576&&Gb(e,Cu,e.index);switch(e.lanes=0,e.tag){case 16:e:{var a=e.pendingProps;if(t=$s(e.elementType),e.type=t,typeof t=="function")fy(t)?(a=li(t,a),e.tag=1,e=ET(null,e,t,a,n)):(e.tag=0,e=Og(null,e,t,a,n));else{if(t!=null){var r=t.$$typeof;if(r===Jg){e.tag=11,e=yT(null,e,t,a,n);break e}else if(r===Zg){e.tag=14,e=IT(null,e,t,a,n);break e}}throw e=og(t)||t,Error(F(306,e,""))}}return e;case 0:return Og(t,e,e.type,e.pendingProps,n);case 1:return a=e.type,r=li(a,e.pendingProps),ET(t,e,a,r,n);case 3:e:{if(lf(e,e.stateNode.containerInfo),t===null)throw Error(F(387));a=e.pendingProps;var s=e.memoizedState;r=s.element,wg(t,e),mu(e,a,null,n);var i=e.memoizedState;if(a=i.cache,rs(e,mt,a),a!==s.cache&&Tg(e,[mt],n,!0),pu(),a=i.element,s.isDehydrated)if(s={element:a,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){e=TT(t,e,a,n);break e}else if(a!==r){r=zn(Error(F(424)),e),Lu(r),e=TT(t,e,a,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(Ke=jn(t.firstChild),Gt=e,we=!0,ps=null,Hn=!0,n=Qb(e,null,a,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(ri(),a===r){e=Ir(t,e,n);break e}zt(t,e,a,n)}e=e.child}return e;case 26:return ef(t,e),t===null?(n=KT(e.type,null,e.pendingProps,null))?e.memoizedState=n:we||(n=e.type,t=e.pendingProps,a=Rf(hs.current).createElement(n),a[Ht]=e,a[hn]=t,Kt(a,n,t),Pt(a),e.stateNode=a):e.memoizedState=KT(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return ug(e),t===null&&we&&(a=e.stateNode=kC(e.type,e.pendingProps,hs.current),Gt=e,Hn=!0,r=Ke,Ls(e.type)?(Yg=r,Ke=jn(a.firstChild)):Ke=r),zt(t,e,e.pendingProps.children,n),ef(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&we&&((r=a=Ke)&&(a=gP(a,e.type,e.pendingProps,Hn),a!==null?(e.stateNode=a,Gt=e,Ke=jn(a.firstChild),Hn=!1,r=!0):r=!1),r||Ts(e)),ug(e),r=e.type,s=e.pendingProps,i=t!==null?t.memoizedProps:null,a=s.children,jg(r,s)?a=null:i!==null&&jg(r,i)&&(e.flags|=32),e.memoizedState!==null&&(r=vy(t,e,PD,null,null,n),Pu._currentValue=r),ef(t,e),zt(t,e,a,n),e.child;case 6:return t===null&&we&&((t=n=Ke)&&(n=yP(n,e.pendingProps,Hn),n!==null?(e.stateNode=n,Gt=e,Ke=null,t=!0):t=!1),t||Ts(e)),null;case 13:return Fw(t,e,n);case 4:return lf(e,e.stateNode.containerInfo),a=e.pendingProps,t===null?e.child=ii(e,null,a,n):zt(t,e,a,n),e.child;case 11:return yT(t,e,e.type,e.pendingProps,n);case 7:return zt(t,e,e.pendingProps,n),e.child;case 8:return zt(t,e,e.pendingProps.children,n),e.child;case 12:return zt(t,e,e.pendingProps.children,n),e.child;case 10:return a=e.pendingProps,rs(e,e.type,a.value),zt(t,e,a.children,n),e.child;case 9:return r=e.type._context,a=e.pendingProps.children,si(e),r=jt(r),a=a(r),e.flags|=1,zt(t,e,a,n),e.child;case 14:return IT(t,e,e.type,e.pendingProps,n);case 15:return Vw(t,e,e.type,e.pendingProps,n);case 19:return Bw(t,e,n);case 31:return qD(t,e,n);case 22:return Uw(t,e,n,e.pendingProps);case 24:return si(e),a=jt(mt),t===null?(r=gy(),r===null&&(r=ze,s=my(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=n),r=s),e.memoizedState={parent:a,cache:r},Iy(e),rs(e,mt,r)):(t.lanes&n&&(wg(t,e),mu(e,null,null,n),pu()),r=t.memoizedState,s=e.memoizedState,r.parent!==a?(r={parent:a,cache:a},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),rs(e,mt,a)):(a=s.cache,rs(e,mt,a),a!==r.cache&&Tg(e,[mt],n,!0))),zt(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(F(156,e.tag))}function ar(t){t.flags|=4}function Km(t,e,n,a,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(dC())t.flags|=8192;else throw ni=gf,yy}else t.flags&=-16777217}function wT(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!OC(e))if(dC())t.flags|=8192;else throw ni=gf,yy}function Ud(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?fb():536870912,t.lanes|=e,Lo|=e)}function eu(t,e){if(!we)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:a.sibling=null}}function je(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,a=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags&65011712,a|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags,a|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=a,t.childLanes=n,e}function HD(t,e,n){var a=e.pendingProps;switch(py(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return je(e),null;case 1:return je(e),null;case 3:return n=e.stateNode,a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),hr(mt),vo(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&($i(e)?ar(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Vm())),je(e),null;case 26:var r=e.type,s=e.memoizedState;return t===null?(ar(e),s!==null?(je(e),wT(e,s)):(je(e),Km(e,r,null,a,n))):s?s!==t.memoizedState?(ar(e),je(e),wT(e,s)):(je(e),e.flags&=-16777217):(t=t.memoizedProps,t!==a&&ar(e),je(e),Km(e,r,t,a,n)),null;case 27:if(uf(e),n=hs.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&ar(e);else{if(!a){if(e.stateNode===null)throw Error(F(166));return je(e),null}t=Ta.current,$i(e)?eT(e,t):(t=kC(r,a,n),e.stateNode=t,ar(e))}return je(e),null;case 5:if(uf(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&ar(e);else{if(!a){if(e.stateNode===null)throw Error(F(166));return je(e),null}if(s=Ta.current,$i(e))eT(e,s);else{var i=Rf(hs.current);switch(s){case 1:s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=i.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof a.is=="string"?i.createElement("select",{is:a.is}):i.createElement("select"),a.multiple?s.multiple=!0:a.size&&(s.size=a.size);break;default:s=typeof a.is=="string"?i.createElement(r,{is:a.is}):i.createElement(r)}}s[Ht]=e,s[hn]=a;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)s.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=s;e:switch(Kt(s,r,a),r){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&ar(e)}}return je(e),Km(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==a&&ar(e);else{if(typeof a!="string"&&e.stateNode===null)throw Error(F(166));if(t=hs.current,$i(e)){if(t=e.stateNode,n=e.memoizedProps,a=null,r=Gt,r!==null)switch(r.tag){case 27:case 5:a=r.memoizedProps}t[Ht]=e,t=!!(t.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||LC(t.nodeValue,n)),t||Ts(e,!0)}else t=Rf(t).createTextNode(a),t[Ht]=e,e.stateNode=t}return je(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(a=$i(e),n!==null){if(t===null){if(!a)throw Error(F(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(F(557));t[Ht]=e}else ri(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;je(e),t=!1}else n=Vm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(bn(e),e):(bn(e),null);if(e.flags&128)throw Error(F(558))}return je(e),null;case 13:if(a=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=$i(e),a!==null&&a.dehydrated!==null){if(t===null){if(!r)throw Error(F(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(F(317));r[Ht]=e}else ri(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;je(e),r=!1}else r=Vm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(bn(e),e):(bn(e),null)}return bn(e),e.flags&128?(e.lanes=n,e):(n=a!==null,t=t!==null&&t.memoizedState!==null,n&&(a=e.child,r=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(r=a.alternate.memoizedState.cachePool.pool),s=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(s=a.memoizedState.cachePool.pool),s!==r&&(a.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Ud(e,e.updateQueue),je(e),null);case 4:return vo(),t===null&&qy(e.stateNode.containerInfo),je(e),null;case 10:return hr(e.type),je(e),null;case 19:if(Ot(ot),a=e.memoizedState,a===null)return je(e),null;if(r=(e.flags&128)!==0,s=a.rendering,s===null)if(r)eu(a,!1);else{if(st!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(s=If(t),s!==null){for(e.flags|=128,eu(a,!1),t=s.updateQueue,e.updateQueue=t,Ud(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)zb(n,t),n=n.sibling;return He(ot,ot.current&1|2),we&&or(e,a.treeForkCount),e.child}t=t.sibling}a.tail!==null&&Ln()>bf&&(e.flags|=128,r=!0,eu(a,!1),e.lanes=4194304)}else{if(!r)if(t=If(s),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Ud(e,t),eu(a,!0),a.tail===null&&a.tailMode==="hidden"&&!s.alternate&&!we)return je(e),null}else 2*Ln()-a.renderingStartTime>bf&&n!==536870912&&(e.flags|=128,r=!0,eu(a,!1),e.lanes=4194304);a.isBackwards?(s.sibling=e.child,e.child=s):(t=a.last,t!==null?t.sibling=s:e.child=s,a.last=s)}return a.tail!==null?(t=a.tail,a.rendering=t,a.tail=t.sibling,a.renderingStartTime=Ln(),t.sibling=null,n=ot.current,He(ot,r?n&1|2:n&1),we&&or(e,a.treeForkCount),t):(je(e),null);case 22:case 23:return bn(e),_y(),a=e.memoizedState!==null,t!==null?t.memoizedState!==null!==a&&(e.flags|=8192):a&&(e.flags|=8192),a?n&536870912&&!(e.flags&128)&&(je(e),e.subtreeFlags&6&&(e.flags|=8192)):je(e),n=e.updateQueue,n!==null&&Ud(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),a=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),a!==n&&(e.flags|=2048),t!==null&&Ot(ti),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),hr(mt),je(e),null;case 25:return null;case 30:return null}throw Error(F(156,e.tag))}function GD(t,e){switch(py(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return hr(mt),vo(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return uf(e),null;case 31:if(e.memoizedState!==null){if(bn(e),e.alternate===null)throw Error(F(340));ri()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(bn(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(F(340));ri()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Ot(ot),null;case 4:return vo(),null;case 10:return hr(e.type),null;case 22:case 23:return bn(e),_y(),t!==null&&Ot(ti),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return hr(mt),null;case 25:return null;default:return null}}function zw(t,e){switch(py(e),e.tag){case 3:hr(mt),vo();break;case 26:case 27:case 5:uf(e);break;case 4:vo();break;case 31:e.memoizedState!==null&&bn(e);break;case 13:bn(e);break;case 19:Ot(ot);break;case 10:hr(e.type);break;case 22:case 23:bn(e),_y(),t!==null&&Ot(ti);break;case 24:hr(mt)}}function Gu(t,e){try{var n=e.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var r=a.next;n=r;do{if((n.tag&t)===t){a=void 0;var s=n.create,i=n.inst;a=s(),i.destroy=a}n=n.next}while(n!==r)}}catch(l){Me(e,e.return,l)}}function bs(t,e,n){try{var a=e.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var s=r.next;a=s;do{if((a.tag&t)===t){var i=a.inst,l=i.destroy;if(l!==void 0){i.destroy=void 0,r=e;var u=n,c=l;try{c()}catch(f){Me(r,u,f)}}}a=a.next}while(a!==s)}}catch(f){Me(e,e.return,f)}}function Hw(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{Jb(e,n)}catch(a){Me(t,t.return,a)}}}function Gw(t,e,n){n.props=li(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(a){Me(t,e,a)}}function yu(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var a=t.stateNode;break;case 30:a=t.stateNode;break;default:a=t.stateNode}typeof n=="function"?t.refCleanup=n(a):n.current=a}}catch(r){Me(t,e,r)}}function Ea(t,e){var n=t.ref,a=t.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(r){Me(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){Me(t,e,r)}else n.current=null}function jw(t){var e=t.type,n=t.memoizedProps,a=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(r){Me(t,t.return,r)}}function Wm(t,e,n){try{var a=t.stateNode;cP(a,t.type,n,e),a[hn]=e}catch(r){Me(t,t.return,r)}}function Kw(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Ls(t.type)||t.tag===4}function Xm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Kw(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Ls(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Ng(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=cr));else if(a!==4&&(a===27&&Ls(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(Ng(t,e,n),t=t.sibling;t!==null;)Ng(t,e,n),t=t.sibling}function Tf(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(a!==4&&(a===27&&Ls(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(Tf(t,e,n),t=t.sibling;t!==null;)Tf(t,e,n),t=t.sibling}function Ww(t){var e=t.stateNode,n=t.memoizedProps;try{for(var a=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);Kt(e,a,n),e[Ht]=t,e[hn]=n}catch(s){Me(t,t.return,s)}}var lr=!1,pt=!1,Ym=!1,CT=typeof WeakSet=="function"?WeakSet:Set,Dt=null;function jD(t,e){if(t=t.containerInfo,Hg=Of,t=Ob(t),uy(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var a=n.getSelection&&n.getSelection();if(a&&a.rangeCount!==0){n=a.anchorNode;var r=a.anchorOffset,s=a.focusNode;a=a.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var i=0,l=-1,u=-1,c=0,f=0,p=t,m=null;t:for(;;){for(var v;p!==n||r!==0&&p.nodeType!==3||(l=i+r),p!==s||a!==0&&p.nodeType!==3||(u=i+a),p.nodeType===3&&(i+=p.nodeValue.length),(v=p.firstChild)!==null;)m=p,p=v;for(;;){if(p===t)break t;if(m===n&&++c===r&&(l=i),m===s&&++f===a&&(u=i),(v=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=v}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(Gg={focusedElem:t,selectionRange:n},Of=!1,Dt=e;Dt!==null;)if(e=Dt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Dt=t;else for(;Dt!==null;){switch(e=Dt,s=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&s!==null){t=void 0,n=e,r=s.memoizedProps,s=s.memoizedState,a=n.stateNode;try{var R=li(n.type,r);t=a.getSnapshotBeforeUpdate(R,s),a.__reactInternalSnapshotBeforeUpdate=t}catch(D){Me(n,n.return,D)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Kg(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Kg(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(F(163))}if(t=e.sibling,t!==null){t.return=e.return,Dt=t;break}Dt=e.return}}function Xw(t,e,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:sr(t,n),a&4&&Gu(5,n);break;case 1:if(sr(t,n),a&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){Me(n,n.return,i)}else{var r=li(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){Me(n,n.return,i)}}a&64&&Hw(n),a&512&&yu(n,n.return);break;case 3:if(sr(t,n),a&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{Jb(t,e)}catch(i){Me(n,n.return,i)}}break;case 27:e===null&&a&4&&Ww(n);case 26:case 5:sr(t,n),e===null&&a&4&&jw(n),a&512&&yu(n,n.return);break;case 12:sr(t,n);break;case 31:sr(t,n),a&4&&$w(t,n);break;case 13:sr(t,n),a&4&&Jw(t,n),a&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=eP.bind(null,n),IP(t,n))));break;case 22:if(a=n.memoizedState!==null||lr,!a){e=e!==null&&e.memoizedState!==null||pt,r=lr;var s=pt;lr=a,(pt=e)&&!s?ir(t,n,(n.subtreeFlags&8772)!==0):sr(t,n),lr=r,pt=s}break;case 30:break;default:sr(t,n)}}function Yw(t){var e=t.alternate;e!==null&&(t.alternate=null,Yw(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&ay(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var Qe=null,cn=!1;function rr(t,e,n){for(n=n.child;n!==null;)Qw(t,e,n),n=n.sibling}function Qw(t,e,n){if(An&&typeof An.onCommitFiberUnmount=="function")try{An.onCommitFiberUnmount(Vu,n)}catch{}switch(n.tag){case 26:pt||Ea(n,e),rr(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:pt||Ea(n,e);var a=Qe,r=cn;Ls(n.type)&&(Qe=n.stateNode,cn=!1),rr(t,e,n),vu(n.stateNode),Qe=a,cn=r;break;case 5:pt||Ea(n,e);case 6:if(a=Qe,r=cn,Qe=null,rr(t,e,n),Qe=a,cn=r,Qe!==null)if(cn)try{(Qe.nodeType===9?Qe.body:Qe.nodeName==="HTML"?Qe.ownerDocument.body:Qe).removeChild(n.stateNode)}catch(s){Me(n,e,s)}else try{Qe.removeChild(n.stateNode)}catch(s){Me(n,e,s)}break;case 18:Qe!==null&&(cn?(t=Qe,qT(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),ko(t)):qT(Qe,n.stateNode));break;case 4:a=Qe,r=cn,Qe=n.stateNode.containerInfo,cn=!0,rr(t,e,n),Qe=a,cn=r;break;case 0:case 11:case 14:case 15:bs(2,n,e),pt||bs(4,n,e),rr(t,e,n);break;case 1:pt||(Ea(n,e),a=n.stateNode,typeof a.componentWillUnmount=="function"&&Gw(n,e,a)),rr(t,e,n);break;case 21:rr(t,e,n);break;case 22:pt=(a=pt)||n.memoizedState!==null,rr(t,e,n),pt=a;break;default:rr(t,e,n)}}function $w(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{ko(t)}catch(n){Me(e,e.return,n)}}}function Jw(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{ko(t)}catch(n){Me(e,e.return,n)}}function KD(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new CT),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new CT),e;default:throw Error(F(435,t.tag))}}function Fd(t,e){var n=KD(t);e.forEach(function(a){if(!n.has(a)){n.add(a);var r=tP.bind(null,t,a);a.then(r,r)}})}function ln(t,e){var n=e.deletions;if(n!==null)for(var a=0;a<n.length;a++){var r=n[a],s=t,i=e,l=i;e:for(;l!==null;){switch(l.tag){case 27:if(Ls(l.type)){Qe=l.stateNode,cn=!1;break e}break;case 5:Qe=l.stateNode,cn=!1;break e;case 3:case 4:Qe=l.stateNode.containerInfo,cn=!0;break e}l=l.return}if(Qe===null)throw Error(F(160));Qw(s,i,r),Qe=null,cn=!1,s=r.alternate,s!==null&&(s.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)Zw(e,t),e=e.sibling}var ta=null;function Zw(t,e){var n=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:ln(e,t),un(t),a&4&&(bs(3,t,t.return),Gu(3,t),bs(5,t,t.return));break;case 1:ln(e,t),un(t),a&512&&(pt||n===null||Ea(n,n.return)),a&64&&lr&&(t=t.updateQueue,t!==null&&(a=t.callbacks,a!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?a:n.concat(a))));break;case 26:var r=ta;if(ln(e,t),un(t),a&512&&(pt||n===null||Ea(n,n.return)),a&4){var s=n!==null?n.memoizedState:null;if(a=t.memoizedState,n===null)if(a===null)if(t.stateNode===null){e:{a=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(a){case"title":s=r.getElementsByTagName("title")[0],(!s||s[Bu]||s[Ht]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=r.createElement(a),r.head.insertBefore(s,r.querySelector("head > title"))),Kt(s,a,n),s[Ht]=t,Pt(s),a=s;break e;case"link":var i=XT("link","href",r).get(a+(n.href||""));if(i){for(var l=0;l<i.length;l++)if(s=i[l],s.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&s.getAttribute("rel")===(n.rel==null?null:n.rel)&&s.getAttribute("title")===(n.title==null?null:n.title)&&s.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(l,1);break t}}s=r.createElement(a),Kt(s,a,n),r.head.appendChild(s);break;case"meta":if(i=XT("meta","content",r).get(a+(n.content||""))){for(l=0;l<i.length;l++)if(s=i[l],s.getAttribute("content")===(n.content==null?null:""+n.content)&&s.getAttribute("name")===(n.name==null?null:n.name)&&s.getAttribute("property")===(n.property==null?null:n.property)&&s.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&s.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(l,1);break t}}s=r.createElement(a),Kt(s,a,n),r.head.appendChild(s);break;default:throw Error(F(468,a))}s[Ht]=t,Pt(s),a=s}t.stateNode=a}else YT(r,t.type,t.stateNode);else t.stateNode=WT(r,a,t.memoizedProps);else s!==a?(s===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):s.count--,a===null?YT(r,t.type,t.stateNode):WT(r,a,t.memoizedProps)):a===null&&t.stateNode!==null&&Wm(t,t.memoizedProps,n.memoizedProps)}break;case 27:ln(e,t),un(t),a&512&&(pt||n===null||Ea(n,n.return)),n!==null&&a&4&&Wm(t,t.memoizedProps,n.memoizedProps);break;case 5:if(ln(e,t),un(t),a&512&&(pt||n===null||Ea(n,n.return)),t.flags&32){r=t.stateNode;try{To(r,"")}catch(R){Me(t,t.return,R)}}a&4&&t.stateNode!=null&&(r=t.memoizedProps,Wm(t,r,n!==null?n.memoizedProps:r)),a&1024&&(Ym=!0);break;case 6:if(ln(e,t),un(t),a&4){if(t.stateNode===null)throw Error(F(162));a=t.memoizedProps,n=t.stateNode;try{n.nodeValue=a}catch(R){Me(t,t.return,R)}}break;case 3:if(af=null,r=ta,ta=kf(e.containerInfo),ln(e,t),ta=r,un(t),a&4&&n!==null&&n.memoizedState.isDehydrated)try{ko(e.containerInfo)}catch(R){Me(t,t.return,R)}Ym&&(Ym=!1,eC(t));break;case 4:a=ta,ta=kf(t.stateNode.containerInfo),ln(e,t),un(t),ta=a;break;case 12:ln(e,t),un(t);break;case 31:ln(e,t),un(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Fd(t,a)));break;case 13:ln(e,t),un(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Wf=Ln()),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Fd(t,a)));break;case 22:r=t.memoizedState!==null;var u=n!==null&&n.memoizedState!==null,c=lr,f=pt;if(lr=c||r,pt=f||u,ln(e,t),pt=f,lr=c,un(t),a&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||u||lr||pt||Js(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){u=n=e;try{if(s=u.stateNode,r)i=s.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{l=u.stateNode;var p=u.memoizedProps.style,m=p!=null&&p.hasOwnProperty("display")?p.display:null;l.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(R){Me(u,u.return,R)}}}else if(e.tag===6){if(n===null){u=e;try{u.stateNode.nodeValue=r?"":u.memoizedProps}catch(R){Me(u,u.return,R)}}}else if(e.tag===18){if(n===null){u=e;try{var v=u.stateNode;r?zT(v,!0):zT(u.stateNode,!1)}catch(R){Me(u,u.return,R)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}a&4&&(a=t.updateQueue,a!==null&&(n=a.retryQueue,n!==null&&(a.retryQueue=null,Fd(t,n))));break;case 19:ln(e,t),un(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Fd(t,a)));break;case 30:break;case 21:break;default:ln(e,t),un(t)}}function un(t){var e=t.flags;if(e&2){try{for(var n,a=t.return;a!==null;){if(Kw(a)){n=a;break}a=a.return}if(n==null)throw Error(F(160));switch(n.tag){case 27:var r=n.stateNode,s=Xm(t);Tf(t,s,r);break;case 5:var i=n.stateNode;n.flags&32&&(To(i,""),n.flags&=-33);var l=Xm(t);Tf(t,l,i);break;case 3:case 4:var u=n.stateNode.containerInfo,c=Xm(t);Ng(t,c,u);break;default:throw Error(F(161))}}catch(f){Me(t,t.return,f)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function eC(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;eC(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function sr(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)Xw(t,e.alternate,e),e=e.sibling}function Js(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:bs(4,e,e.return),Js(e);break;case 1:Ea(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&Gw(e,e.return,n),Js(e);break;case 27:vu(e.stateNode);case 26:case 5:Ea(e,e.return),Js(e);break;case 22:e.memoizedState===null&&Js(e);break;case 30:Js(e);break;default:Js(e)}t=t.sibling}}function ir(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var a=e.alternate,r=t,s=e,i=s.flags;switch(s.tag){case 0:case 11:case 15:ir(r,s,n),Gu(4,s);break;case 1:if(ir(r,s,n),a=s,r=a.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){Me(a,a.return,c)}if(a=s,r=a.updateQueue,r!==null){var l=a.stateNode;try{var u=r.shared.hiddenCallbacks;if(u!==null)for(r.shared.hiddenCallbacks=null,r=0;r<u.length;r++)$b(u[r],l)}catch(c){Me(a,a.return,c)}}n&&i&64&&Hw(s),yu(s,s.return);break;case 27:Ww(s);case 26:case 5:ir(r,s,n),n&&a===null&&i&4&&jw(s),yu(s,s.return);break;case 12:ir(r,s,n);break;case 31:ir(r,s,n),n&&i&4&&$w(r,s);break;case 13:ir(r,s,n),n&&i&4&&Jw(r,s);break;case 22:s.memoizedState===null&&ir(r,s,n),yu(s,s.return);break;case 30:break;default:ir(r,s,n)}e=e.sibling}}function My(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&zu(n))}function Ny(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&zu(t))}function ea(t,e,n,a){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)tC(t,e,n,a),e=e.sibling}function tC(t,e,n,a){var r=e.flags;switch(e.tag){case 0:case 11:case 15:ea(t,e,n,a),r&2048&&Gu(9,e);break;case 1:ea(t,e,n,a);break;case 3:ea(t,e,n,a),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&zu(t)));break;case 12:if(r&2048){ea(t,e,n,a),t=e.stateNode;try{var s=e.memoizedProps,i=s.id,l=s.onPostCommit;typeof l=="function"&&l(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(u){Me(e,e.return,u)}}else ea(t,e,n,a);break;case 31:ea(t,e,n,a);break;case 13:ea(t,e,n,a);break;case 23:break;case 22:s=e.stateNode,i=e.alternate,e.memoizedState!==null?s._visibility&2?ea(t,e,n,a):Iu(t,e):s._visibility&2?ea(t,e,n,a):(s._visibility|=2,Zi(t,e,n,a,(e.subtreeFlags&10256)!==0||!1)),r&2048&&My(i,e);break;case 24:ea(t,e,n,a),r&2048&&Ny(e.alternate,e);break;default:ea(t,e,n,a)}}function Zi(t,e,n,a,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var s=t,i=e,l=n,u=a,c=i.flags;switch(i.tag){case 0:case 11:case 15:Zi(s,i,l,u,r),Gu(8,i);break;case 23:break;case 22:var f=i.stateNode;i.memoizedState!==null?f._visibility&2?Zi(s,i,l,u,r):Iu(s,i):(f._visibility|=2,Zi(s,i,l,u,r)),r&&c&2048&&My(i.alternate,i);break;case 24:Zi(s,i,l,u,r),r&&c&2048&&Ny(i.alternate,i);break;default:Zi(s,i,l,u,r)}e=e.sibling}}function Iu(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,a=e,r=a.flags;switch(a.tag){case 22:Iu(n,a),r&2048&&My(a.alternate,a);break;case 24:Iu(n,a),r&2048&&Ny(a.alternate,a);break;default:Iu(n,a)}e=e.sibling}}var lu=8192;function Ji(t,e,n){if(t.subtreeFlags&lu)for(t=t.child;t!==null;)nC(t,e,n),t=t.sibling}function nC(t,e,n){switch(t.tag){case 26:Ji(t,e,n),t.flags&lu&&t.memoizedState!==null&&RP(n,ta,t.memoizedState,t.memoizedProps);break;case 5:Ji(t,e,n);break;case 3:case 4:var a=ta;ta=kf(t.stateNode.containerInfo),Ji(t,e,n),ta=a;break;case 22:t.memoizedState===null&&(a=t.alternate,a!==null&&a.memoizedState!==null?(a=lu,lu=16777216,Ji(t,e,n),lu=a):Ji(t,e,n));break;default:Ji(t,e,n)}}function aC(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function tu(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];Dt=a,sC(a,t)}aC(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)rC(t),t=t.sibling}function rC(t){switch(t.tag){case 0:case 11:case 15:tu(t),t.flags&2048&&bs(9,t,t.return);break;case 3:tu(t);break;case 12:tu(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,tf(t)):tu(t);break;default:tu(t)}}function tf(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];Dt=a,sC(a,t)}aC(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:bs(8,e,e.return),tf(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,tf(e));break;default:tf(e)}t=t.sibling}}function sC(t,e){for(;Dt!==null;){var n=Dt;switch(n.tag){case 0:case 11:case 15:bs(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:zu(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,Dt=a;else e:for(n=t;Dt!==null;){a=Dt;var r=a.sibling,s=a.return;if(Yw(a),a===n){Dt=null;break e}if(r!==null){r.return=s,Dt=r;break e}Dt=s}}}var WD={getCacheForType:function(t){var e=jt(mt),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return jt(mt).controller.signal}},XD=typeof WeakMap=="function"?WeakMap:Map,De=0,ze=null,_e=null,Te=0,Oe=0,Tn=null,cs=!1,No=!1,Vy=!1,_r=0,st=0,ws=0,ai=0,Uy=0,Cn=0,Lo=0,_u=null,dn=null,Vg=!1,Wf=0,iC=0,bf=1/0,wf=null,ys=null,wt=0,Is=null,Ao=null,pr=0,Ug=0,Fg=null,oC=null,Su=0,Bg=null;function Rn(){return De&2&&Te!==0?Te&-Te:ie.T!==null?By():gb()}function lC(){if(Cn===0)if(!(Te&536870912)||we){var t=xd;xd<<=1,!(xd&3932160)&&(xd=262144),Cn=t}else Cn=536870912;return t=Dn.current,t!==null&&(t.flags|=32),Cn}function fn(t,e,n){(t===ze&&(Oe===2||Oe===9)||t.cancelPendingCommit!==null)&&(xo(t,0),ds(t,Te,Cn,!1)),Fu(t,n),(!(De&2)||t!==ze)&&(t===ze&&(!(De&2)&&(ai|=n),st===4&&ds(t,Te,Cn,!1)),wa(t))}function uC(t,e,n){if(De&6)throw Error(F(327));var a=!n&&(e&127)===0&&(e&t.expiredLanes)===0||Uu(t,e),r=a?$D(t,e):Qm(t,e,!0),s=a;do{if(r===0){No&&!a&&ds(t,e,0,!1);break}else{if(n=t.current.alternate,s&&!YD(n)){r=Qm(t,e,!1),s=!1;continue}if(r===2){if(s=e,t.errorRecoveryDisabledLanes&s)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var l=t;r=_u;var u=l.current.memoizedState.isDehydrated;if(u&&(xo(l,i).flags|=256),i=Qm(l,i,!1),i!==2){if(Vy&&!u){l.errorRecoveryDisabledLanes|=s,ai|=s,r=4;break e}s=dn,dn=r,s!==null&&(dn===null?dn=s:dn.push.apply(dn,s))}r=i}if(s=!1,r!==2)continue}}if(r===1){xo(t,0),ds(t,e,0,!0);break}e:{switch(a=t,s=r,s){case 0:case 1:throw Error(F(345));case 4:if((e&4194048)!==e)break;case 6:ds(a,e,Cn,!cs);break e;case 2:dn=null;break;case 3:case 5:break;default:throw Error(F(329))}if((e&62914560)===e&&(r=Wf+300-Ln(),10<r)){if(ds(a,e,Cn,!cs),Nf(a,0,!0)!==0)break e;pr=e,a.timeoutHandle=xC(LT.bind(null,a,n,dn,wf,Vg,e,Cn,ai,Lo,cs,s,"Throttled",-0,0),r);break e}LT(a,n,dn,wf,Vg,e,Cn,ai,Lo,cs,s,null,-0,0)}}break}while(!0);wa(t)}function LT(t,e,n,a,r,s,i,l,u,c,f,p,m,v){if(t.timeoutHandle=-1,p=e.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:cr},nC(e,s,p);var R=(s&62914560)===s?Wf-Ln():(s&4194048)===s?iC-Ln():0;if(R=kP(p,R),R!==null){pr=s,t.cancelPendingCommit=R(xT.bind(null,t,e,s,n,a,r,i,l,u,f,p,null,m,v)),ds(t,s,i,!c);return}}xT(t,e,s,n,a,r,i,l,u)}function YD(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var r=n[a],s=r.getSnapshot;r=r.value;try{if(!kn(s(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function ds(t,e,n,a){e&=~Uy,e&=~ai,t.suspendedLanes|=e,t.pingedLanes&=~e,a&&(t.warmLanes|=e),a=t.expirationTimes;for(var r=e;0<r;){var s=31-xn(r),i=1<<s;a[s]=-1,r&=~i}n!==0&&hb(t,n,e)}function Xf(){return De&6?!0:(ju(0,!1),!1)}function Fy(){if(_e!==null){if(Oe===0)var t=_e.return;else t=_e,dr=hi=null,by(t),Io=null,Au=0,t=_e;for(;t!==null;)zw(t.alternate,t),t=t.return;_e=null}}function xo(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,hP(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),pr=0,Fy(),ze=t,_e=n=fr(t.current,null),Te=e,Oe=0,Tn=null,cs=!1,No=Uu(t,e),Vy=!1,Lo=Cn=Uy=ai=ws=st=0,dn=_u=null,Vg=!1,e&8&&(e|=e&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=e;0<a;){var r=31-xn(a),s=1<<r;e|=t[r],a&=~s}return _r=e,Bf(),n}function cC(t,e){he=null,ie.H=Ru,e===Mo||e===zf?(e=sT(),Oe=3):e===yy?(e=sT(),Oe=4):Oe=e===Py?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Tn=e,_e===null&&(st=1,vf(t,zn(e,t.current)))}function dC(){var t=Dn.current;return t===null?!0:(Te&4194048)===Te?Gn===null:(Te&62914560)===Te||Te&536870912?t===Gn:!1}function fC(){var t=ie.H;return ie.H=Ru,t===null?Ru:t}function hC(){var t=ie.A;return ie.A=WD,t}function Cf(){st=4,cs||(Te&4194048)!==Te&&Dn.current!==null||(No=!0),!(ws&134217727)&&!(ai&134217727)||ze===null||ds(ze,Te,Cn,!1)}function Qm(t,e,n){var a=De;De|=2;var r=fC(),s=hC();(ze!==t||Te!==e)&&(wf=null,xo(t,e)),e=!1;var i=st;e:do try{if(Oe!==0&&_e!==null){var l=_e,u=Tn;switch(Oe){case 8:Fy(),i=6;break e;case 3:case 2:case 9:case 6:Dn.current===null&&(e=!0);var c=Oe;if(Oe=0,Tn=null,ho(t,l,u,c),n&&No){i=0;break e}break;default:c=Oe,Oe=0,Tn=null,ho(t,l,u,c)}}QD(),i=st;break}catch(f){cC(t,f)}while(!0);return e&&t.shellSuspendCounter++,dr=hi=null,De=a,ie.H=r,ie.A=s,_e===null&&(ze=null,Te=0,Bf()),i}function QD(){for(;_e!==null;)pC(_e)}function $D(t,e){var n=De;De|=2;var a=fC(),r=hC();ze!==t||Te!==e?(wf=null,bf=Ln()+500,xo(t,e)):No=Uu(t,e);e:do try{if(Oe!==0&&_e!==null){e=_e;var s=Tn;t:switch(Oe){case 1:Oe=0,Tn=null,ho(t,e,s,1);break;case 2:case 9:if(rT(s)){Oe=0,Tn=null,AT(e);break}e=function(){Oe!==2&&Oe!==9||ze!==t||(Oe=7),wa(t)},s.then(e,e);break e;case 3:Oe=7;break e;case 4:Oe=5;break e;case 7:rT(s)?(Oe=0,Tn=null,AT(e)):(Oe=0,Tn=null,ho(t,e,s,7));break;case 5:var i=null;switch(_e.tag){case 26:i=_e.memoizedState;case 5:case 27:var l=_e;if(i?OC(i):l.stateNode.complete){Oe=0,Tn=null;var u=l.sibling;if(u!==null)_e=u;else{var c=l.return;c!==null?(_e=c,Yf(c)):_e=null}break t}}Oe=0,Tn=null,ho(t,e,s,5);break;case 6:Oe=0,Tn=null,ho(t,e,s,6);break;case 8:Fy(),st=6;break e;default:throw Error(F(462))}}JD();break}catch(f){cC(t,f)}while(!0);return dr=hi=null,ie.H=a,ie.A=r,De=n,_e!==null?0:(ze=null,Te=0,Bf(),st)}function JD(){for(;_e!==null&&!v1();)pC(_e)}function pC(t){var e=qw(t.alternate,t,_r);t.memoizedProps=t.pendingProps,e===null?Yf(t):_e=e}function AT(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=vT(n,e,e.pendingProps,e.type,void 0,Te);break;case 11:e=vT(n,e,e.pendingProps,e.type.render,e.ref,Te);break;case 5:by(e);default:zw(n,e),e=_e=zb(e,_r),e=qw(n,e,_r)}t.memoizedProps=t.pendingProps,e===null?Yf(t):_e=e}function ho(t,e,n,a){dr=hi=null,by(e),Io=null,Au=0;var r=e.return;try{if(BD(t,r,e,n,Te)){st=1,vf(t,zn(n,t.current)),_e=null;return}}catch(s){if(r!==null)throw _e=r,s;st=1,vf(t,zn(n,t.current)),_e=null;return}e.flags&32768?(we||a===1?t=!0:No||Te&536870912?t=!1:(cs=t=!0,(a===2||a===9||a===3||a===6)&&(a=Dn.current,a!==null&&a.tag===13&&(a.flags|=16384))),mC(e,t)):Yf(e)}function Yf(t){var e=t;do{if(e.flags&32768){mC(e,cs);return}t=e.return;var n=HD(e.alternate,e,_r);if(n!==null){_e=n;return}if(e=e.sibling,e!==null){_e=e;return}_e=e=t}while(e!==null);st===0&&(st=5)}function mC(t,e){do{var n=GD(t.alternate,t);if(n!==null){n.flags&=32767,_e=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){_e=t;return}_e=t=n}while(t!==null);st=6,_e=null}function xT(t,e,n,a,r,s,i,l,u){t.cancelPendingCommit=null;do Qf();while(wt!==0);if(De&6)throw Error(F(327));if(e!==null){if(e===t.current)throw Error(F(177));if(s=e.lanes|e.childLanes,s|=cy,k1(t,n,s,i,l,u),t===ze&&(_e=ze=null,Te=0),Ao=e,Is=t,pr=n,Ug=s,Fg=r,oC=a,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,nP(cf,function(){return SC(),null})):(t.callbackNode=null,t.callbackPriority=0),a=(e.flags&13878)!==0,e.subtreeFlags&13878||a){a=ie.T,ie.T=null,r=Pe.p,Pe.p=2,i=De,De|=4;try{jD(t,e,n)}finally{De=i,Pe.p=r,ie.T=a}}wt=1,gC(),yC(),IC()}}function gC(){if(wt===1){wt=0;var t=Is,e=Ao,n=(e.flags&13878)!==0;if(e.subtreeFlags&13878||n){n=ie.T,ie.T=null;var a=Pe.p;Pe.p=2;var r=De;De|=4;try{Zw(e,t);var s=Gg,i=Ob(t.containerInfo),l=s.focusedElem,u=s.selectionRange;if(i!==l&&l&&l.ownerDocument&&Pb(l.ownerDocument.documentElement,l)){if(u!==null&&uy(l)){var c=u.start,f=u.end;if(f===void 0&&(f=c),"selectionStart"in l)l.selectionStart=c,l.selectionEnd=Math.min(f,l.value.length);else{var p=l.ownerDocument||document,m=p&&p.defaultView||window;if(m.getSelection){var v=m.getSelection(),R=l.textContent.length,D=Math.min(u.start,R),x=u.end===void 0?D:Math.min(u.end,R);!v.extend&&D>x&&(i=x,x=D,D=i);var T=$E(l,D),E=$E(l,x);if(T&&E&&(v.rangeCount!==1||v.anchorNode!==T.node||v.anchorOffset!==T.offset||v.focusNode!==E.node||v.focusOffset!==E.offset)){var C=p.createRange();C.setStart(T.node,T.offset),v.removeAllRanges(),D>x?(v.addRange(C),v.extend(E.node,E.offset)):(C.setEnd(E.node,E.offset),v.addRange(C))}}}}for(p=[],v=l;v=v.parentNode;)v.nodeType===1&&p.push({element:v,left:v.scrollLeft,top:v.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<p.length;l++){var L=p[l];L.element.scrollLeft=L.left,L.element.scrollTop=L.top}}Of=!!Hg,Gg=Hg=null}finally{De=r,Pe.p=a,ie.T=n}}t.current=e,wt=2}}function yC(){if(wt===2){wt=0;var t=Is,e=Ao,n=(e.flags&8772)!==0;if(e.subtreeFlags&8772||n){n=ie.T,ie.T=null;var a=Pe.p;Pe.p=2;var r=De;De|=4;try{Xw(t,e.alternate,e)}finally{De=r,Pe.p=a,ie.T=n}}wt=3}}function IC(){if(wt===4||wt===3){wt=0,E1();var t=Is,e=Ao,n=pr,a=oC;e.subtreeFlags&10256||e.flags&10256?wt=5:(wt=0,Ao=Is=null,_C(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(ys=null),ny(n),e=e.stateNode,An&&typeof An.onCommitFiberRoot=="function")try{An.onCommitFiberRoot(Vu,e,void 0,(e.current.flags&128)===128)}catch{}if(a!==null){e=ie.T,r=Pe.p,Pe.p=2,ie.T=null;try{for(var s=t.onRecoverableError,i=0;i<a.length;i++){var l=a[i];s(l.value,{componentStack:l.stack})}}finally{ie.T=e,Pe.p=r}}pr&3&&Qf(),wa(t),r=t.pendingLanes,n&261930&&r&42?t===Bg?Su++:(Su=0,Bg=t):Su=0,ju(0,!1)}}function _C(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,zu(e)))}function Qf(){return gC(),yC(),IC(),SC()}function SC(){if(wt!==5)return!1;var t=Is,e=Ug;Ug=0;var n=ny(pr),a=ie.T,r=Pe.p;try{Pe.p=32>n?32:n,ie.T=null,n=Fg,Fg=null;var s=Is,i=pr;if(wt=0,Ao=Is=null,pr=0,De&6)throw Error(F(331));var l=De;if(De|=4,rC(s.current),tC(s,s.current,i,n),De=l,ju(0,!1),An&&typeof An.onPostCommitFiberRoot=="function")try{An.onPostCommitFiberRoot(Vu,s)}catch{}return!0}finally{Pe.p=r,ie.T=a,_C(t,e)}}function RT(t,e,n){e=zn(n,e),e=Pg(t.stateNode,e,2),t=gs(t,e,2),t!==null&&(Fu(t,2),wa(t))}function Me(t,e,n){if(t.tag===3)RT(t,t,n);else for(;e!==null;){if(e.tag===3){RT(e,t,n);break}else if(e.tag===1){var a=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(ys===null||!ys.has(a))){t=zn(n,t),n=Mw(2),a=gs(e,n,2),a!==null&&(Nw(n,a,e,t),Fu(a,2),wa(a));break}}e=e.return}}function $m(t,e,n){var a=t.pingCache;if(a===null){a=t.pingCache=new XD;var r=new Set;a.set(e,r)}else r=a.get(e),r===void 0&&(r=new Set,a.set(e,r));r.has(n)||(Vy=!0,r.add(n),t=ZD.bind(null,t,e,n),e.then(t,t))}function ZD(t,e,n){var a=t.pingCache;a!==null&&a.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,ze===t&&(Te&n)===n&&(st===4||st===3&&(Te&62914560)===Te&&300>Ln()-Wf?!(De&2)&&xo(t,0):Uy|=n,Lo===Te&&(Lo=0)),wa(t)}function vC(t,e){e===0&&(e=fb()),t=fi(t,e),t!==null&&(Fu(t,e),wa(t))}function eP(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),vC(t,n)}function tP(t,e){var n=0;switch(t.tag){case 31:case 13:var a=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:a=t.stateNode;break;case 22:a=t.stateNode._retryCache;break;default:throw Error(F(314))}a!==null&&a.delete(e),vC(t,n)}function nP(t,e){return ey(t,e)}var Lf=null,eo=null,qg=!1,Af=!1,Jm=!1,fs=0;function wa(t){t!==eo&&t.next===null&&(eo===null?Lf=eo=t:eo=eo.next=t),Af=!0,qg||(qg=!0,rP())}function ju(t,e){if(!Jm&&Af){Jm=!0;do for(var n=!1,a=Lf;a!==null;){if(!e)if(t!==0){var r=a.pendingLanes;if(r===0)var s=0;else{var i=a.suspendedLanes,l=a.pingedLanes;s=(1<<31-xn(42|t)+1)-1,s&=r&~(i&~l),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(n=!0,kT(a,s))}else s=Te,s=Nf(a,a===ze?s:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(s&3)||Uu(a,s)||(n=!0,kT(a,s));a=a.next}while(n);Jm=!1}}function aP(){EC()}function EC(){Af=qg=!1;var t=0;fs!==0&&fP()&&(t=fs);for(var e=Ln(),n=null,a=Lf;a!==null;){var r=a.next,s=TC(a,e);s===0?(a.next=null,n===null?Lf=r:n.next=r,r===null&&(eo=n)):(n=a,(t!==0||s&3)&&(Af=!0)),a=r}wt!==0&&wt!==5||ju(t,!1),fs!==0&&(fs=0)}function TC(t,e){for(var n=t.suspendedLanes,a=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes&-62914561;0<s;){var i=31-xn(s),l=1<<i,u=r[i];u===-1?(!(l&n)||l&a)&&(r[i]=R1(l,e)):u<=e&&(t.expiredLanes|=l),s&=~l}if(e=ze,n=Te,n=Nf(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a=t.callbackNode,n===0||t===e&&(Oe===2||Oe===9)||t.cancelPendingCommit!==null)return a!==null&&a!==null&&Lm(a),t.callbackNode=null,t.callbackPriority=0;if(!(n&3)||Uu(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(a!==null&&Lm(a),ny(n)){case 2:case 8:n=cb;break;case 32:n=cf;break;case 268435456:n=db;break;default:n=cf}return a=bC.bind(null,t),n=ey(n,a),t.callbackPriority=e,t.callbackNode=n,e}return a!==null&&a!==null&&Lm(a),t.callbackPriority=2,t.callbackNode=null,2}function bC(t,e){if(wt!==0&&wt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(Qf()&&t.callbackNode!==n)return null;var a=Te;return a=Nf(t,t===ze?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a===0?null:(uC(t,a,e),TC(t,Ln()),t.callbackNode!=null&&t.callbackNode===n?bC.bind(null,t):null)}function kT(t,e){if(Qf())return null;uC(t,e,!0)}function rP(){pP(function(){De&6?ey(ub,aP):EC()})}function By(){if(fs===0){var t=bo;t===0&&(t=Ad,Ad<<=1,!(Ad&261888)&&(Ad=256)),fs=t}return fs}function DT(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Kd(""+t)}function PT(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function sP(t,e,n,a,r){if(e==="submit"&&n&&n.stateNode===r){var s=DT((r[hn]||null).action),i=a.submitter;i&&(e=(e=i[hn]||null)?DT(e.formAction):i.getAttribute("formAction"),e!==null&&(s=e,i=null));var l=new Vf("action","action",null,a,r);t.push({event:l,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(fs!==0){var u=i?PT(r,i):new FormData(r);kg(n,{pending:!0,data:u,method:r.method,action:s},null,u)}}else typeof s=="function"&&(l.preventDefault(),u=i?PT(r,i):new FormData(r),kg(n,{pending:!0,data:u,method:r.method,action:s},s,u))},currentTarget:r}]})}}for(Bd=0;Bd<_g.length;Bd++)qd=_g[Bd],OT=qd.toLowerCase(),MT=qd[0].toUpperCase()+qd.slice(1),na(OT,"on"+MT);var qd,OT,MT,Bd;na(Nb,"onAnimationEnd");na(Vb,"onAnimationIteration");na(Ub,"onAnimationStart");na("dblclick","onDoubleClick");na("focusin","onFocus");na("focusout","onBlur");na(TD,"onTransitionRun");na(bD,"onTransitionStart");na(wD,"onTransitionCancel");na(Fb,"onTransitionEnd");Eo("onMouseEnter",["mouseout","mouseover"]);Eo("onMouseLeave",["mouseout","mouseover"]);Eo("onPointerEnter",["pointerout","pointerover"]);Eo("onPointerLeave",["pointerout","pointerover"]);ui("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ui("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ui("onBeforeInput",["compositionend","keypress","textInput","paste"]);ui("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ui("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ui("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var ku="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),iP=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ku));function wC(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var a=t[n],r=a.event;a=a.listeners;e:{var s=void 0;if(e)for(var i=a.length-1;0<=i;i--){var l=a[i],u=l.instance,c=l.currentTarget;if(l=l.listener,u!==s&&r.isPropagationStopped())break e;s=l,r.currentTarget=c;try{s(r)}catch(f){ff(f)}r.currentTarget=null,s=u}else for(i=0;i<a.length;i++){if(l=a[i],u=l.instance,c=l.currentTarget,l=l.listener,u!==s&&r.isPropagationStopped())break e;s=l,r.currentTarget=c;try{s(r)}catch(f){ff(f)}r.currentTarget=null,s=u}}}}function Ie(t,e){var n=e[dg];n===void 0&&(n=e[dg]=new Set);var a=t+"__bubble";n.has(a)||(CC(e,t,2,!1),n.add(a))}function Zm(t,e,n){var a=0;e&&(a|=4),CC(n,t,a,e)}var zd="_reactListening"+Math.random().toString(36).slice(2);function qy(t){if(!t[zd]){t[zd]=!0,yb.forEach(function(n){n!=="selectionchange"&&(iP.has(n)||Zm(n,!1,t),Zm(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[zd]||(e[zd]=!0,Zm("selectionchange",!1,e))}}function CC(t,e,n,a){switch(FC(e)){case 2:var r=OP;break;case 8:r=MP;break;default:r=jy}n=r.bind(null,e,n,t),r=void 0,!gg||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),a?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function eg(t,e,n,a,r){var s=a;if(!(e&1)&&!(e&2)&&a!==null)e:for(;;){if(a===null)return;var i=a.tag;if(i===3||i===4){var l=a.stateNode.containerInfo;if(l===r)break;if(i===4)for(i=a.return;i!==null;){var u=i.tag;if((u===3||u===4)&&i.stateNode.containerInfo===r)return;i=i.return}for(;l!==null;){if(i=ao(l),i===null)return;if(u=i.tag,u===5||u===6||u===26||u===27){a=s=i;continue e}l=l.parentNode}}a=a.return}wb(function(){var c=s,f=sy(n),p=[];e:{var m=Bb.get(t);if(m!==void 0){var v=Vf,R=t;switch(t){case"keypress":if(Xd(n)===0)break e;case"keydown":case"keyup":v=tD;break;case"focusin":R="focus",v=Dm;break;case"focusout":R="blur",v=Dm;break;case"beforeblur":case"afterblur":v=Dm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":v=zE;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":v=H1;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":v=rD;break;case Nb:case Vb:case Ub:v=K1;break;case Fb:v=iD;break;case"scroll":case"scrollend":v=q1;break;case"wheel":v=lD;break;case"copy":case"cut":case"paste":v=X1;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":v=GE;break;case"toggle":case"beforetoggle":v=cD}var D=(e&4)!==0,x=!D&&(t==="scroll"||t==="scrollend"),T=D?m!==null?m+"Capture":null:m;D=[];for(var E=c,C;E!==null;){var L=E;if(C=L.stateNode,L=L.tag,L!==5&&L!==26&&L!==27||C===null||T===null||(L=Tu(E,T),L!=null&&D.push(Du(E,L,C))),x)break;E=E.return}0<D.length&&(m=new v(m,R,null,n,f),p.push({event:m,listeners:D}))}}if(!(e&7)){e:{if(m=t==="mouseover"||t==="pointerover",v=t==="mouseout"||t==="pointerout",m&&n!==mg&&(R=n.relatedTarget||n.fromElement)&&(ao(R)||R[Do]))break e;if((v||m)&&(m=f.window===f?f:(m=f.ownerDocument)?m.defaultView||m.parentWindow:window,v?(R=n.relatedTarget||n.toElement,v=c,R=R?ao(R):null,R!==null&&(x=Nu(R),D=R.tag,R!==x||D!==5&&D!==27&&D!==6)&&(R=null)):(v=null,R=c),v!==R)){if(D=zE,L="onMouseLeave",T="onMouseEnter",E="mouse",(t==="pointerout"||t==="pointerover")&&(D=GE,L="onPointerLeave",T="onPointerEnter",E="pointer"),x=v==null?m:iu(v),C=R==null?m:iu(R),m=new D(L,E+"leave",v,n,f),m.target=x,m.relatedTarget=C,L=null,ao(f)===c&&(D=new D(T,E+"enter",R,n,f),D.target=C,D.relatedTarget=x,L=D),x=L,v&&R)t:{for(D=oP,T=v,E=R,C=0,L=T;L;L=D(L))C++;L=0;for(var U=E;U;U=D(U))L++;for(;0<C-L;)T=D(T),C--;for(;0<L-C;)E=D(E),L--;for(;C--;){if(T===E||E!==null&&T===E.alternate){D=T;break t}T=D(T),E=D(E)}D=null}else D=null;v!==null&&NT(p,m,v,D,!1),R!==null&&x!==null&&NT(p,x,R,D,!0)}}e:{if(m=c?iu(c):window,v=m.nodeName&&m.nodeName.toLowerCase(),v==="select"||v==="input"&&m.type==="file")var N=XE;else if(WE(m))if(kb)N=SD;else{N=ID;var y=yD}else v=m.nodeName,!v||v.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?c&&ry(c.elementType)&&(N=XE):N=_D;if(N&&(N=N(t,c))){Rb(p,N,n,f);break e}y&&y(t,m,c),t==="focusout"&&c&&m.type==="number"&&c.memoizedProps.value!=null&&pg(m,"number",m.value)}switch(y=c?iu(c):window,t){case"focusin":(WE(y)||y.contentEditable==="true")&&(io=y,yg=c,du=null);break;case"focusout":du=yg=io=null;break;case"mousedown":Ig=!0;break;case"contextmenu":case"mouseup":case"dragend":Ig=!1,JE(p,n,f);break;case"selectionchange":if(ED)break;case"keydown":case"keyup":JE(p,n,f)}var g;if(ly)e:{switch(t){case"compositionstart":var _="onCompositionStart";break e;case"compositionend":_="onCompositionEnd";break e;case"compositionupdate":_="onCompositionUpdate";break e}_=void 0}else so?Ab(t,n)&&(_="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(_="onCompositionStart");_&&(Lb&&n.locale!=="ko"&&(so||_!=="onCompositionStart"?_==="onCompositionEnd"&&so&&(g=Cb()):(us=f,iy="value"in us?us.value:us.textContent,so=!0)),y=xf(c,_),0<y.length&&(_=new HE(_,t,null,n,f),p.push({event:_,listeners:y}),g?_.data=g:(g=xb(n),g!==null&&(_.data=g)))),(g=fD?hD(t,n):pD(t,n))&&(_=xf(c,"onBeforeInput"),0<_.length&&(y=new HE("onBeforeInput","beforeinput",null,n,f),p.push({event:y,listeners:_}),y.data=g)),sP(p,t,c,n,f)}wC(p,e)})}function Du(t,e,n){return{instance:t,listener:e,currentTarget:n}}function xf(t,e){for(var n=e+"Capture",a=[];t!==null;){var r=t,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=Tu(t,n),r!=null&&a.unshift(Du(t,r,s)),r=Tu(t,e),r!=null&&a.push(Du(t,r,s))),t.tag===3)return a;t=t.return}return[]}function oP(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function NT(t,e,n,a,r){for(var s=e._reactName,i=[];n!==null&&n!==a;){var l=n,u=l.alternate,c=l.stateNode;if(l=l.tag,u!==null&&u===a)break;l!==5&&l!==26&&l!==27||c===null||(u=c,r?(c=Tu(n,s),c!=null&&i.unshift(Du(n,c,u))):r||(c=Tu(n,s),c!=null&&i.push(Du(n,c,u)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var lP=/\r\n?/g,uP=/\u0000|\uFFFD/g;function VT(t){return(typeof t=="string"?t:""+t).replace(lP,`
`).replace(uP,"")}function LC(t,e){return e=VT(e),VT(t)===e}function Ue(t,e,n,a,r,s){switch(n){case"children":typeof a=="string"?e==="body"||e==="textarea"&&a===""||To(t,a):(typeof a=="number"||typeof a=="bigint")&&e!=="body"&&To(t,""+a);break;case"className":kd(t,"class",a);break;case"tabIndex":kd(t,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":kd(t,n,a);break;case"style":bb(t,a,s);break;case"data":if(e!=="object"){kd(t,"data",a);break}case"src":case"href":if(a===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Kd(""+a),t.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(n==="formAction"?(e!=="input"&&Ue(t,e,"name",r.name,r,null),Ue(t,e,"formEncType",r.formEncType,r,null),Ue(t,e,"formMethod",r.formMethod,r,null),Ue(t,e,"formTarget",r.formTarget,r,null)):(Ue(t,e,"encType",r.encType,r,null),Ue(t,e,"method",r.method,r,null),Ue(t,e,"target",r.target,r,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Kd(""+a),t.setAttribute(n,a);break;case"onClick":a!=null&&(t.onclick=cr);break;case"onScroll":a!=null&&Ie("scroll",t);break;case"onScrollEnd":a!=null&&Ie("scrollend",t);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(F(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(F(60));t.innerHTML=n}}break;case"multiple":t.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":t.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){t.removeAttribute("xlink:href");break}n=Kd(""+a),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""+a):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":a===!0?t.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,a):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?t.setAttribute(n,a):t.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?t.removeAttribute(n):t.setAttribute(n,a);break;case"popover":Ie("beforetoggle",t),Ie("toggle",t),jd(t,"popover",a);break;case"xlinkActuate":nr(t,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":nr(t,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":nr(t,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":nr(t,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":nr(t,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":nr(t,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":nr(t,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":nr(t,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":nr(t,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":jd(t,"is",a);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=F1.get(n)||n,jd(t,n,a))}}function zg(t,e,n,a,r,s){switch(n){case"style":bb(t,a,s);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(F(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(F(60));t.innerHTML=n}}break;case"children":typeof a=="string"?To(t,a):(typeof a=="number"||typeof a=="bigint")&&To(t,""+a);break;case"onScroll":a!=null&&Ie("scroll",t);break;case"onScrollEnd":a!=null&&Ie("scrollend",t);break;case"onClick":a!=null&&(t.onclick=cr);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Ib.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),s=t[hn]||null,s=s!=null?s[n]:null,typeof s=="function"&&t.removeEventListener(e,s,r),typeof a=="function")){typeof s!="function"&&s!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,a,r);break e}n in t?t[n]=a:a===!0?t.setAttribute(n,""):jd(t,n,a)}}}function Kt(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Ie("error",t),Ie("load",t);var a=!1,r=!1,s;for(s in n)if(n.hasOwnProperty(s)){var i=n[s];if(i!=null)switch(s){case"src":a=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(F(137,e));default:Ue(t,e,s,i,n,null)}}r&&Ue(t,e,"srcSet",n.srcSet,n,null),a&&Ue(t,e,"src",n.src,n,null);return;case"input":Ie("invalid",t);var l=s=i=r=null,u=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":r=f;break;case"type":i=f;break;case"checked":u=f;break;case"defaultChecked":c=f;break;case"value":s=f;break;case"defaultValue":l=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(F(137,e));break;default:Ue(t,e,a,f,n,null)}}vb(t,s,l,u,c,i,r,!1);return;case"select":Ie("invalid",t),a=i=s=null;for(r in n)if(n.hasOwnProperty(r)&&(l=n[r],l!=null))switch(r){case"value":s=l;break;case"defaultValue":i=l;break;case"multiple":a=l;default:Ue(t,e,r,l,n,null)}e=s,n=i,t.multiple=!!a,e!=null?mo(t,!!a,e,!1):n!=null&&mo(t,!!a,n,!0);return;case"textarea":Ie("invalid",t),s=r=a=null;for(i in n)if(n.hasOwnProperty(i)&&(l=n[i],l!=null))switch(i){case"value":a=l;break;case"defaultValue":r=l;break;case"children":s=l;break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(F(91));break;default:Ue(t,e,i,l,n,null)}Tb(t,a,r,s);return;case"option":for(u in n)if(n.hasOwnProperty(u)&&(a=n[u],a!=null))switch(u){case"selected":t.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:Ue(t,e,u,a,n,null)}return;case"dialog":Ie("beforetoggle",t),Ie("toggle",t),Ie("cancel",t),Ie("close",t);break;case"iframe":case"object":Ie("load",t);break;case"video":case"audio":for(a=0;a<ku.length;a++)Ie(ku[a],t);break;case"image":Ie("error",t),Ie("load",t);break;case"details":Ie("toggle",t);break;case"embed":case"source":case"link":Ie("error",t),Ie("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(F(137,e));default:Ue(t,e,c,a,n,null)}return;default:if(ry(e)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&zg(t,e,f,a,n,void 0));return}}for(l in n)n.hasOwnProperty(l)&&(a=n[l],a!=null&&Ue(t,e,l,a,n,null))}function cP(t,e,n,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,i=null,l=null,u=null,c=null,f=null;for(v in n){var p=n[v];if(n.hasOwnProperty(v)&&p!=null)switch(v){case"checked":break;case"value":break;case"defaultValue":u=p;default:a.hasOwnProperty(v)||Ue(t,e,v,null,a,p)}}for(var m in a){var v=a[m];if(p=n[m],a.hasOwnProperty(m)&&(v!=null||p!=null))switch(m){case"type":s=v;break;case"name":r=v;break;case"checked":c=v;break;case"defaultChecked":f=v;break;case"value":i=v;break;case"defaultValue":l=v;break;case"children":case"dangerouslySetInnerHTML":if(v!=null)throw Error(F(137,e));break;default:v!==p&&Ue(t,e,m,v,a,p)}}hg(t,i,l,u,c,f,s,r);return;case"select":v=i=l=m=null;for(s in n)if(u=n[s],n.hasOwnProperty(s)&&u!=null)switch(s){case"value":break;case"multiple":v=u;default:a.hasOwnProperty(s)||Ue(t,e,s,null,a,u)}for(r in a)if(s=a[r],u=n[r],a.hasOwnProperty(r)&&(s!=null||u!=null))switch(r){case"value":m=s;break;case"defaultValue":l=s;break;case"multiple":i=s;default:s!==u&&Ue(t,e,r,s,a,u)}e=l,n=i,a=v,m!=null?mo(t,!!n,m,!1):!!a!=!!n&&(e!=null?mo(t,!!n,e,!0):mo(t,!!n,n?[]:"",!1));return;case"textarea":v=m=null;for(l in n)if(r=n[l],n.hasOwnProperty(l)&&r!=null&&!a.hasOwnProperty(l))switch(l){case"value":break;case"children":break;default:Ue(t,e,l,null,a,r)}for(i in a)if(r=a[i],s=n[i],a.hasOwnProperty(i)&&(r!=null||s!=null))switch(i){case"value":m=r;break;case"defaultValue":v=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(F(91));break;default:r!==s&&Ue(t,e,i,r,a,s)}Eb(t,m,v);return;case"option":for(var R in n)if(m=n[R],n.hasOwnProperty(R)&&m!=null&&!a.hasOwnProperty(R))switch(R){case"selected":t.selected=!1;break;default:Ue(t,e,R,null,a,m)}for(u in a)if(m=a[u],v=n[u],a.hasOwnProperty(u)&&m!==v&&(m!=null||v!=null))switch(u){case"selected":t.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:Ue(t,e,u,m,a,v)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var D in n)m=n[D],n.hasOwnProperty(D)&&m!=null&&!a.hasOwnProperty(D)&&Ue(t,e,D,null,a,m);for(c in a)if(m=a[c],v=n[c],a.hasOwnProperty(c)&&m!==v&&(m!=null||v!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(F(137,e));break;default:Ue(t,e,c,m,a,v)}return;default:if(ry(e)){for(var x in n)m=n[x],n.hasOwnProperty(x)&&m!==void 0&&!a.hasOwnProperty(x)&&zg(t,e,x,void 0,a,m);for(f in a)m=a[f],v=n[f],!a.hasOwnProperty(f)||m===v||m===void 0&&v===void 0||zg(t,e,f,m,a,v);return}}for(var T in n)m=n[T],n.hasOwnProperty(T)&&m!=null&&!a.hasOwnProperty(T)&&Ue(t,e,T,null,a,m);for(p in a)m=a[p],v=n[p],!a.hasOwnProperty(p)||m===v||m==null&&v==null||Ue(t,e,p,m,a,v)}function UT(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function dP(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var r=n[a],s=r.transferSize,i=r.initiatorType,l=r.duration;if(s&&l&&UT(i)){for(i=0,l=r.responseEnd,a+=1;a<n.length;a++){var u=n[a],c=u.startTime;if(c>l)break;var f=u.transferSize,p=u.initiatorType;f&&UT(p)&&(u=u.responseEnd,i+=f*(u<l?1:(l-c)/(u-c)))}if(--a,e+=8*(s+i)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Hg=null,Gg=null;function Rf(t){return t.nodeType===9?t:t.ownerDocument}function FT(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function AC(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function jg(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var tg=null;function fP(){var t=window.event;return t&&t.type==="popstate"?t===tg?!1:(tg=t,!0):(tg=null,!1)}var xC=typeof setTimeout=="function"?setTimeout:void 0,hP=typeof clearTimeout=="function"?clearTimeout:void 0,BT=typeof Promise=="function"?Promise:void 0,pP=typeof queueMicrotask=="function"?queueMicrotask:typeof BT<"u"?function(t){return BT.resolve(null).then(t).catch(mP)}:xC;function mP(t){setTimeout(function(){throw t})}function Ls(t){return t==="head"}function qT(t,e){var n=e,a=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(a===0){t.removeChild(r),ko(e);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")vu(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,vu(n);for(var s=n.firstChild;s;){var i=s.nextSibling,l=s.nodeName;s[Bu]||l==="SCRIPT"||l==="STYLE"||l==="LINK"&&s.rel.toLowerCase()==="stylesheet"||n.removeChild(s),s=i}}else n==="body"&&vu(t.ownerDocument.body);n=r}while(n);ko(e)}function zT(t,e){var n=t;t=0;do{var a=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=a}while(n)}function Kg(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Kg(n),ay(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function gP(t,e,n,a){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!a&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(a){if(!t[Bu])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(s=t.getAttribute("rel"),s==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(s!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(s=t.getAttribute("src"),(s!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===s)return t}else return t;if(t=jn(t.nextSibling),t===null)break}return null}function yP(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=jn(t.nextSibling),t===null))return null;return t}function RC(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=jn(t.nextSibling),t===null))return null;return t}function Wg(t){return t.data==="$?"||t.data==="$~"}function Xg(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function IP(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var a=function(){e(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),t._reactRetry=a}}function jn(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Yg=null;function HT(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return jn(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function GT(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function kC(t,e,n){switch(e=Rf(n),t){case"html":if(t=e.documentElement,!t)throw Error(F(452));return t;case"head":if(t=e.head,!t)throw Error(F(453));return t;case"body":if(t=e.body,!t)throw Error(F(454));return t;default:throw Error(F(451))}}function vu(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);ay(t)}var Kn=new Map,jT=new Set;function kf(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var Sr=Pe.d;Pe.d={f:_P,r:SP,D:vP,C:EP,L:TP,m:bP,X:CP,S:wP,M:LP};function _P(){var t=Sr.f(),e=Xf();return t||e}function SP(t){var e=Po(t);e!==null&&e.tag===5&&e.type==="form"?bw(e):Sr.r(t)}var Vo=typeof document>"u"?null:document;function DC(t,e,n){var a=Vo;if(a&&typeof e=="string"&&e){var r=qn(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),jT.has(r)||(jT.add(r),t={rel:t,crossOrigin:n,href:e},a.querySelector(r)===null&&(e=a.createElement("link"),Kt(e,"link",t),Pt(e),a.head.appendChild(e)))}}function vP(t){Sr.D(t),DC("dns-prefetch",t,null)}function EP(t,e){Sr.C(t,e),DC("preconnect",t,e)}function TP(t,e,n){Sr.L(t,e,n);var a=Vo;if(a&&t&&e){var r='link[rel="preload"][as="'+qn(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+qn(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+qn(n.imageSizes)+'"]')):r+='[href="'+qn(t)+'"]';var s=r;switch(e){case"style":s=Ro(t);break;case"script":s=Uo(t)}Kn.has(s)||(t=We({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),Kn.set(s,t),a.querySelector(r)!==null||e==="style"&&a.querySelector(Ku(s))||e==="script"&&a.querySelector(Wu(s))||(e=a.createElement("link"),Kt(e,"link",t),Pt(e),a.head.appendChild(e)))}}function bP(t,e){Sr.m(t,e);var n=Vo;if(n&&t){var a=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+qn(a)+'"][href="'+qn(t)+'"]',s=r;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=Uo(t)}if(!Kn.has(s)&&(t=We({rel:"modulepreload",href:t},e),Kn.set(s,t),n.querySelector(r)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Wu(s)))return}a=n.createElement("link"),Kt(a,"link",t),Pt(a),n.head.appendChild(a)}}}function wP(t,e,n){Sr.S(t,e,n);var a=Vo;if(a&&t){var r=po(a).hoistableStyles,s=Ro(t);e=e||"default";var i=r.get(s);if(!i){var l={loading:0,preload:null};if(i=a.querySelector(Ku(s)))l.loading=5;else{t=We({rel:"stylesheet",href:t,"data-precedence":e},n),(n=Kn.get(s))&&zy(t,n);var u=i=a.createElement("link");Pt(u),Kt(u,"link",t),u._p=new Promise(function(c,f){u.onload=c,u.onerror=f}),u.addEventListener("load",function(){l.loading|=1}),u.addEventListener("error",function(){l.loading|=2}),l.loading|=4,nf(i,e,a)}i={type:"stylesheet",instance:i,count:1,state:l},r.set(s,i)}}}function CP(t,e){Sr.X(t,e);var n=Vo;if(n&&t){var a=po(n).hoistableScripts,r=Uo(t),s=a.get(r);s||(s=n.querySelector(Wu(r)),s||(t=We({src:t,async:!0},e),(e=Kn.get(r))&&Hy(t,e),s=n.createElement("script"),Pt(s),Kt(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function LP(t,e){Sr.M(t,e);var n=Vo;if(n&&t){var a=po(n).hoistableScripts,r=Uo(t),s=a.get(r);s||(s=n.querySelector(Wu(r)),s||(t=We({src:t,async:!0,type:"module"},e),(e=Kn.get(r))&&Hy(t,e),s=n.createElement("script"),Pt(s),Kt(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function KT(t,e,n,a){var r=(r=hs.current)?kf(r):null;if(!r)throw Error(F(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Ro(n.href),n=po(r).hoistableStyles,a=n.get(e),a||(a={type:"style",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Ro(n.href);var s=po(r).hoistableStyles,i=s.get(t);if(i||(r=r.ownerDocument||r,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(t,i),(s=r.querySelector(Ku(t)))&&!s._p&&(i.instance=s,i.state.loading=5),Kn.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Kn.set(t,n),s||AP(r,t,n,i.state))),e&&a===null)throw Error(F(528,""));return i}if(e&&a!==null)throw Error(F(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=Uo(n),n=po(r).hoistableScripts,a=n.get(e),a||(a={type:"script",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(F(444,t))}}function Ro(t){return'href="'+qn(t)+'"'}function Ku(t){return'link[rel="stylesheet"]['+t+"]"}function PC(t){return We({},t,{"data-precedence":t.precedence,precedence:null})}function AP(t,e,n,a){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?a.loading=1:(e=t.createElement("link"),a.preload=e,e.addEventListener("load",function(){return a.loading|=1}),e.addEventListener("error",function(){return a.loading|=2}),Kt(e,"link",n),Pt(e),t.head.appendChild(e))}function Uo(t){return'[src="'+qn(t)+'"]'}function Wu(t){return"script[async]"+t}function WT(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var a=t.querySelector('style[data-href~="'+qn(n.href)+'"]');if(a)return e.instance=a,Pt(a),a;var r=We({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(t.ownerDocument||t).createElement("style"),Pt(a),Kt(a,"style",r),nf(a,n.precedence,t),e.instance=a;case"stylesheet":r=Ro(n.href);var s=t.querySelector(Ku(r));if(s)return e.state.loading|=4,e.instance=s,Pt(s),s;a=PC(n),(r=Kn.get(r))&&zy(a,r),s=(t.ownerDocument||t).createElement("link"),Pt(s);var i=s;return i._p=new Promise(function(l,u){i.onload=l,i.onerror=u}),Kt(s,"link",a),e.state.loading|=4,nf(s,n.precedence,t),e.instance=s;case"script":return s=Uo(n.src),(r=t.querySelector(Wu(s)))?(e.instance=r,Pt(r),r):(a=n,(r=Kn.get(s))&&(a=We({},n),Hy(a,r)),t=t.ownerDocument||t,r=t.createElement("script"),Pt(r),Kt(r,"link",a),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(F(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(a=e.instance,e.state.loading|=4,nf(a,n.precedence,t));return e.instance}function nf(t,e,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=a.length?a[a.length-1]:null,s=r,i=0;i<a.length;i++){var l=a[i];if(l.dataset.precedence===e)s=l;else if(s!==r)break}s?s.parentNode.insertBefore(t,s.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function zy(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Hy(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var af=null;function XT(t,e,n){if(af===null){var a=new Map,r=af=new Map;r.set(n,a)}else r=af,a=r.get(n),a||(a=new Map,r.set(n,a));if(a.has(t))return a;for(a.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var s=n[r];if(!(s[Bu]||s[Ht]||t==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var i=s.getAttribute(e)||"";i=t+i;var l=a.get(i);l?l.push(s):a.set(i,[s])}}return a}function YT(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function xP(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function OC(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function RP(t,e,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(n.state.loading&4)){if(n.instance===null){var r=Ro(a.href),s=e.querySelector(Ku(r));if(s){e=s._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Df.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=s,Pt(s);return}s=e.ownerDocument||e,a=PC(a),(r=Kn.get(r))&&zy(a,r),s=s.createElement("link"),Pt(s);var i=s;i._p=new Promise(function(l,u){i.onload=l,i.onerror=u}),Kt(s,"link",a),n.instance=s}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&!(n.state.loading&3)&&(t.count++,n=Df.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var ng=0;function kP(t,e){return t.stylesheets&&t.count===0&&rf(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var a=setTimeout(function(){if(t.stylesheets&&rf(t,t.stylesheets),t.unsuspend){var s=t.unsuspend;t.unsuspend=null,s()}},6e4+e);0<t.imgBytes&&ng===0&&(ng=62500*dP());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&rf(t,t.stylesheets),t.unsuspend)){var s=t.unsuspend;t.unsuspend=null,s()}},(t.imgBytes>ng?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(a),clearTimeout(r)}}:null}function Df(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)rf(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Pf=null;function rf(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Pf=new Map,e.forEach(DP,t),Pf=null,Df.call(t))}function DP(t,e){if(!(e.state.loading&4)){var n=Pf.get(t);if(n)var a=n.get(null);else{n=new Map,Pf.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var i=r[s];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),a=i)}a&&n.set(null,a)}r=e.instance,i=r.getAttribute("data-precedence"),s=n.get(i)||a,s===a&&n.set(null,r),n.set(i,r),this.count++,a=Df.bind(this),r.addEventListener("load",a),r.addEventListener("error",a),s?s.parentNode.insertBefore(r,s.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var Pu={$$typeof:ur,Provider:null,Consumer:null,_currentValue:Zs,_currentValue2:Zs,_threadCount:0};function PP(t,e,n,a,r,s,i,l,u){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Am(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Am(0),this.hiddenUpdates=Am(null),this.identifierPrefix=a,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=u,this.incompleteTransitions=new Map}function MC(t,e,n,a,r,s,i,l,u,c,f,p){return t=new PP(t,e,n,i,u,c,f,p,l),e=1,s===!0&&(e|=24),s=wn(3,null,null,e),t.current=s,s.stateNode=t,e=my(),e.refCount++,t.pooledCache=e,e.refCount++,s.memoizedState={element:a,isDehydrated:n,cache:e},Iy(s),t}function NC(t){return t?(t=uo,t):uo}function VC(t,e,n,a,r,s){r=NC(r),a.context===null?a.context=r:a.pendingContext=r,a=ms(e),a.payload={element:n},s=s===void 0?null:s,s!==null&&(a.callback=s),n=gs(t,a,e),n!==null&&(fn(n,t,e),hu(n,t,e))}function QT(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Gy(t,e){QT(t,e),(t=t.alternate)&&QT(t,e)}function UC(t){if(t.tag===13||t.tag===31){var e=fi(t,67108864);e!==null&&fn(e,t,67108864),Gy(t,67108864)}}function $T(t){if(t.tag===13||t.tag===31){var e=Rn();e=ty(e);var n=fi(t,e);n!==null&&fn(n,t,e),Gy(t,e)}}var Of=!0;function OP(t,e,n,a){var r=ie.T;ie.T=null;var s=Pe.p;try{Pe.p=2,jy(t,e,n,a)}finally{Pe.p=s,ie.T=r}}function MP(t,e,n,a){var r=ie.T;ie.T=null;var s=Pe.p;try{Pe.p=8,jy(t,e,n,a)}finally{Pe.p=s,ie.T=r}}function jy(t,e,n,a){if(Of){var r=Qg(a);if(r===null)eg(t,e,a,Mf,n),JT(t,a);else if(VP(r,t,e,n,a))a.stopPropagation();else if(JT(t,a),e&4&&-1<NP.indexOf(t)){for(;r!==null;){var s=Po(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var i=Qs(s.pendingLanes);if(i!==0){var l=s;for(l.pendingLanes|=2,l.entangledLanes|=2;i;){var u=1<<31-xn(i);l.entanglements[1]|=u,i&=~u}wa(s),!(De&6)&&(bf=Ln()+500,ju(0,!1))}}break;case 31:case 13:l=fi(s,2),l!==null&&fn(l,s,2),Xf(),Gy(s,2)}if(s=Qg(a),s===null&&eg(t,e,a,Mf,n),s===r)break;r=s}r!==null&&a.stopPropagation()}else eg(t,e,a,null,n)}}function Qg(t){return t=sy(t),Ky(t)}var Mf=null;function Ky(t){if(Mf=null,t=ao(t),t!==null){var e=Nu(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=rb(e),t!==null)return t;t=null}else if(n===31){if(t=sb(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Mf=t,null}function FC(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(T1()){case ub:return 2;case cb:return 8;case cf:case b1:return 32;case db:return 268435456;default:return 32}default:return 32}}var $g=!1,_s=null,Ss=null,vs=null,Ou=new Map,Mu=new Map,os=[],NP="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function JT(t,e){switch(t){case"focusin":case"focusout":_s=null;break;case"dragenter":case"dragleave":Ss=null;break;case"mouseover":case"mouseout":vs=null;break;case"pointerover":case"pointerout":Ou.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Mu.delete(e.pointerId)}}function nu(t,e,n,a,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:a,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Po(e),e!==null&&UC(e)),t):(t.eventSystemFlags|=a,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function VP(t,e,n,a,r){switch(e){case"focusin":return _s=nu(_s,t,e,n,a,r),!0;case"dragenter":return Ss=nu(Ss,t,e,n,a,r),!0;case"mouseover":return vs=nu(vs,t,e,n,a,r),!0;case"pointerover":var s=r.pointerId;return Ou.set(s,nu(Ou.get(s)||null,t,e,n,a,r)),!0;case"gotpointercapture":return s=r.pointerId,Mu.set(s,nu(Mu.get(s)||null,t,e,n,a,r)),!0}return!1}function BC(t){var e=ao(t.target);if(e!==null){var n=Nu(e);if(n!==null){if(e=n.tag,e===13){if(e=rb(n),e!==null){t.blockedOn=e,ME(t.priority,function(){$T(n)});return}}else if(e===31){if(e=sb(n),e!==null){t.blockedOn=e,ME(t.priority,function(){$T(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function sf(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Qg(t.nativeEvent);if(n===null){n=t.nativeEvent;var a=new n.constructor(n.type,n);mg=a,n.target.dispatchEvent(a),mg=null}else return e=Po(n),e!==null&&UC(e),t.blockedOn=n,!1;e.shift()}return!0}function ZT(t,e,n){sf(t)&&n.delete(e)}function UP(){$g=!1,_s!==null&&sf(_s)&&(_s=null),Ss!==null&&sf(Ss)&&(Ss=null),vs!==null&&sf(vs)&&(vs=null),Ou.forEach(ZT),Mu.forEach(ZT)}function Hd(t,e){t.blockedOn===e&&(t.blockedOn=null,$g||($g=!0,Ct.unstable_scheduleCallback(Ct.unstable_NormalPriority,UP)))}var Gd=null;function eb(t){Gd!==t&&(Gd=t,Ct.unstable_scheduleCallback(Ct.unstable_NormalPriority,function(){Gd===t&&(Gd=null);for(var e=0;e<t.length;e+=3){var n=t[e],a=t[e+1],r=t[e+2];if(typeof a!="function"){if(Ky(a||n)===null)continue;break}var s=Po(n);s!==null&&(t.splice(e,3),e-=3,kg(s,{pending:!0,data:r,method:n.method,action:a},a,r))}}))}function ko(t){function e(u){return Hd(u,t)}_s!==null&&Hd(_s,t),Ss!==null&&Hd(Ss,t),vs!==null&&Hd(vs,t),Ou.forEach(e),Mu.forEach(e);for(var n=0;n<os.length;n++){var a=os[n];a.blockedOn===t&&(a.blockedOn=null)}for(;0<os.length&&(n=os[0],n.blockedOn===null);)BC(n),n.blockedOn===null&&os.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var r=n[a],s=n[a+1],i=r[hn]||null;if(typeof s=="function")i||eb(n);else if(i){var l=null;if(s&&s.hasAttribute("formAction")){if(r=s,i=s[hn]||null)l=i.formAction;else if(Ky(r)!==null)continue}else l=i.action;typeof l=="function"?n[a+1]=l:(n.splice(a,3),a-=3),eb(n)}}}function qC(){function t(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(i){return r=i})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function Wy(t){this._internalRoot=t}$f.prototype.render=Wy.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(F(409));var n=e.current,a=Rn();VC(n,a,t,e,null,null)};$f.prototype.unmount=Wy.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;VC(t.current,2,null,t,null,null),Xf(),e[Do]=null}};function $f(t){this._internalRoot=t}$f.prototype.unstable_scheduleHydration=function(t){if(t){var e=gb();t={blockedOn:null,target:t,priority:e};for(var n=0;n<os.length&&e!==0&&e<os[n].priority;n++);os.splice(n,0,t),n===0&&BC(t)}};var tb=nb.version;if(tb!=="19.2.3")throw Error(F(527,tb,"19.2.3"));Pe.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(F(188)):(t=Object.keys(t).join(","),Error(F(268,t)));return t=g1(e),t=t!==null?ib(t):null,t=t===null?null:t.stateNode,t};var FP={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:ie,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(au=__REACT_DEVTOOLS_GLOBAL_HOOK__,!au.isDisabled&&au.supportsFiber))try{Vu=au.inject(FP),An=au}catch{}var au;Jf.createRoot=function(t,e){if(!ab(t))throw Error(F(299));var n=!1,a="",r=Dw,s=Pw,i=Ow;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(a=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(s=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=MC(t,1,!1,null,null,n,a,null,r,s,i,qC),t[Do]=e.current,qy(t),new Wy(e)};Jf.hydrateRoot=function(t,e,n){if(!ab(t))throw Error(F(299));var a=!1,r="",s=Dw,i=Pw,l=Ow,u=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(s=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(l=n.onRecoverableError),n.formState!==void 0&&(u=n.formState)),e=MC(t,1,!0,e,n??null,a,r,u,s,i,l,qC),e.context=NC(null),n=e.current,a=Rn(),a=ty(a),r=ms(a),r.callback=null,gs(n,r,a),n=a,e.current.lanes=n,Fu(e,n),wa(e),t[Do]=e.current,qy(t),new $f(e)};Jf.version="19.2.3"});var jC=Re(($F,GC)=>{"use strict";function HC(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(HC)}catch(t){console.error(t)}}HC(),GC.exports=zC()});var ZC=Re((lB,$y)=>{var Qy=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,a=Object.defineProperty||function(O,P,V){O[P]=V.value},r,s=typeof Symbol=="function"?Symbol:{},i=s.iterator||"@@iterator",l=s.asyncIterator||"@@asyncIterator",u=s.toStringTag||"@@toStringTag";function c(O,P,V){return Object.defineProperty(O,P,{value:V,enumerable:!0,configurable:!0,writable:!0}),O[P]}try{c({},"")}catch{c=function(P,V,Q){return P[V]=Q}}function f(O,P,V,Q){var G=P&&P.prototype instanceof T?P:T,te=Object.create(G.prototype),Se=new $(Q||[]);return a(te,"_invoke",{value:b(O,V,Se)}),te}t.wrap=f;function p(O,P,V){try{return{type:"normal",arg:O.call(P,V)}}catch(Q){return{type:"throw",arg:Q}}}var m="suspendedStart",v="suspendedYield",R="executing",D="completed",x={};function T(){}function E(){}function C(){}var L={};c(L,i,function(){return this});var U=Object.getPrototypeOf,N=U&&U(U(Z([])));N&&N!==e&&n.call(N,i)&&(L=N);var y=C.prototype=T.prototype=Object.create(L);E.prototype=C,a(y,"constructor",{value:C,configurable:!0}),a(C,"constructor",{value:E,configurable:!0}),E.displayName=c(C,u,"GeneratorFunction");function g(O){["next","throw","return"].forEach(function(P){c(O,P,function(V){return this._invoke(P,V)})})}t.isGeneratorFunction=function(O){var P=typeof O=="function"&&O.constructor;return P?P===E||(P.displayName||P.name)==="GeneratorFunction":!1},t.mark=function(O){return Object.setPrototypeOf?Object.setPrototypeOf(O,C):(O.__proto__=C,c(O,u,"GeneratorFunction")),O.prototype=Object.create(y),O},t.awrap=function(O){return{__await:O}};function _(O,P){function V(te,Se,ue,X){var me=p(O[te],O,Se);if(me.type==="throw")X(me.arg);else{var Ne=me.arg,be=Ne.value;return be&&typeof be=="object"&&n.call(be,"__await")?P.resolve(be.__await).then(function(re){V("next",re,ue,X)},function(re){V("throw",re,ue,X)}):P.resolve(be).then(function(re){Ne.value=re,ue(Ne)},function(re){return V("throw",re,ue,X)})}}var Q;function G(te,Se){function ue(){return new P(function(X,me){V(te,Se,X,me)})}return Q=Q?Q.then(ue,ue):ue()}a(this,"_invoke",{value:G})}g(_.prototype),c(_.prototype,l,function(){return this}),t.AsyncIterator=_,t.async=function(O,P,V,Q,G){G===void 0&&(G=Promise);var te=new _(f(O,P,V,Q),G);return t.isGeneratorFunction(P)?te:te.next().then(function(Se){return Se.done?Se.value:te.next()})};function b(O,P,V){var Q=m;return function(te,Se){if(Q===R)throw new Error("Generator is already running");if(Q===D){if(te==="throw")throw Se;return se()}for(V.method=te,V.arg=Se;;){var ue=V.delegate;if(ue){var X=w(ue,V);if(X){if(X===x)continue;return X}}if(V.method==="next")V.sent=V._sent=V.arg;else if(V.method==="throw"){if(Q===m)throw Q=D,V.arg;V.dispatchException(V.arg)}else V.method==="return"&&V.abrupt("return",V.arg);Q=R;var me=p(O,P,V);if(me.type==="normal"){if(Q=V.done?D:v,me.arg===x)continue;return{value:me.arg,done:V.done}}else me.type==="throw"&&(Q=D,V.method="throw",V.arg=me.arg)}}}function w(O,P){var V=P.method,Q=O.iterator[V];if(Q===r)return P.delegate=null,V==="throw"&&O.iterator.return&&(P.method="return",P.arg=r,w(O,P),P.method==="throw")||V!=="return"&&(P.method="throw",P.arg=new TypeError("The iterator does not provide a '"+V+"' method")),x;var G=p(Q,O.iterator,P.arg);if(G.type==="throw")return P.method="throw",P.arg=G.arg,P.delegate=null,x;var te=G.arg;if(!te)return P.method="throw",P.arg=new TypeError("iterator result is not an object"),P.delegate=null,x;if(te.done)P[O.resultName]=te.value,P.next=O.nextLoc,P.method!=="return"&&(P.method="next",P.arg=r);else return te;return P.delegate=null,x}g(y),c(y,u,"Generator"),c(y,i,function(){return this}),c(y,"toString",function(){return"[object Generator]"});function A(O){var P={tryLoc:O[0]};1 in O&&(P.catchLoc=O[1]),2 in O&&(P.finallyLoc=O[2],P.afterLoc=O[3]),this.tryEntries.push(P)}function S(O){var P=O.completion||{};P.type="normal",delete P.arg,O.completion=P}function $(O){this.tryEntries=[{tryLoc:"root"}],O.forEach(A,this),this.reset(!0)}t.keys=function(O){var P=Object(O),V=[];for(var Q in P)V.push(Q);return V.reverse(),function G(){for(;V.length;){var te=V.pop();if(te in P)return G.value=te,G.done=!1,G}return G.done=!0,G}};function Z(O){if(O){var P=O[i];if(P)return P.call(O);if(typeof O.next=="function")return O;if(!isNaN(O.length)){var V=-1,Q=function G(){for(;++V<O.length;)if(n.call(O,V))return G.value=O[V],G.done=!1,G;return G.value=r,G.done=!0,G};return Q.next=Q}}return{next:se}}t.values=Z;function se(){return{value:r,done:!0}}return $.prototype={constructor:$,reset:function(O){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(S),!O)for(var P in this)P.charAt(0)==="t"&&n.call(this,P)&&!isNaN(+P.slice(1))&&(this[P]=r)},stop:function(){this.done=!0;var O=this.tryEntries[0],P=O.completion;if(P.type==="throw")throw P.arg;return this.rval},dispatchException:function(O){if(this.done)throw O;var P=this;function V(X,me){return te.type="throw",te.arg=O,P.next=X,me&&(P.method="next",P.arg=r),!!me}for(var Q=this.tryEntries.length-1;Q>=0;--Q){var G=this.tryEntries[Q],te=G.completion;if(G.tryLoc==="root")return V("end");if(G.tryLoc<=this.prev){var Se=n.call(G,"catchLoc"),ue=n.call(G,"finallyLoc");if(Se&&ue){if(this.prev<G.catchLoc)return V(G.catchLoc,!0);if(this.prev<G.finallyLoc)return V(G.finallyLoc)}else if(Se){if(this.prev<G.catchLoc)return V(G.catchLoc,!0)}else if(ue){if(this.prev<G.finallyLoc)return V(G.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(O,P){for(var V=this.tryEntries.length-1;V>=0;--V){var Q=this.tryEntries[V];if(Q.tryLoc<=this.prev&&n.call(Q,"finallyLoc")&&this.prev<Q.finallyLoc){var G=Q;break}}G&&(O==="break"||O==="continue")&&G.tryLoc<=P&&P<=G.finallyLoc&&(G=null);var te=G?G.completion:{};return te.type=O,te.arg=P,G?(this.method="next",this.next=G.finallyLoc,x):this.complete(te)},complete:function(O,P){if(O.type==="throw")throw O.arg;return O.type==="break"||O.type==="continue"?this.next=O.arg:O.type==="return"?(this.rval=this.arg=O.arg,this.method="return",this.next="end"):O.type==="normal"&&P&&(this.next=P),x},finish:function(O){for(var P=this.tryEntries.length-1;P>=0;--P){var V=this.tryEntries[P];if(V.finallyLoc===O)return this.complete(V.completion,V.afterLoc),S(V),x}},catch:function(O){for(var P=this.tryEntries.length-1;P>=0;--P){var V=this.tryEntries[P];if(V.tryLoc===O){var Q=V.completion;if(Q.type==="throw"){var G=Q.arg;S(V)}return G}}throw new Error("illegal catch attempt")},delegateYield:function(O,P,V){return this.delegate={iterator:Z(O),resultName:P,nextLoc:V},this.method==="next"&&(this.arg=r),x}},t}(typeof $y=="object"?$y.exports:{});try{regeneratorRuntime=Qy}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=Qy:Function("r","regeneratorRuntime = r")(Qy)}});var Zf=Re((uB,eL)=>{"use strict";eL.exports=(t,e)=>`${t}-${e}-${Math.random().toString(16).slice(3,8)}`});var Jy=Re((cB,nL)=>{"use strict";var qP=Zf(),tL=0;nL.exports=({id:t,action:e,payload:n={}})=>{let a=t;return typeof a>"u"&&(a=qP("Job",tL),tL+=1),{id:a,action:e,payload:n}}});var eh=Re(Xu=>{"use strict";var Zy=!1;Xu.logging=Zy;Xu.setLogging=t=>{Zy=t};Xu.log=(...t)=>Zy?console.log.apply(Xu,t):null});var iL=Re((rL,sL)=>{"use strict";var zP=Jy(),{log:th}=eh(),HP=Zf(),aL=0;sL.exports=()=>{let t=HP("Scheduler",aL),e={},n={},a=[];aL+=1;let r=()=>a.length,s=()=>Object.keys(e).length,i=()=>{if(a.length!==0){let p=Object.keys(e);for(let m=0;m<p.length;m+=1)if(typeof n[p[m]]>"u"){a[0](e[p[m]]);break}}},l=(p,m)=>new Promise((v,R)=>{let D=zP({action:p,payload:m});a.push(async x=>{a.shift(),n[x.id]=D;try{v(await x[p].apply(rL,[...m,D.id]))}catch(T){R(T)}finally{delete n[x.id],i()}}),th(`[${t}]: Add ${D.id} to JobQueue`),th(`[${t}]: JobQueue length=${a.length}`),i()});return{addWorker:p=>(e[p.id]=p,th(`[${t}]: Add ${p.id}`),th(`[${t}]: Number of workers=${s()}`),i(),p.id),addJob:async(p,...m)=>{if(s()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return l(p,m)},terminate:async()=>{Object.keys(e).forEach(async p=>{await e[p].terminate()}),a=[]},getQueueLen:r,getNumWorkers:s}}});var lL=Re((fB,oL)=>{"use strict";oL.exports=t=>{let e={};return typeof WorkerGlobalScope<"u"?e.type="webworker":typeof document=="object"?e.type="browser":typeof process=="object"&&typeof nE=="function"&&(e.type="node"),typeof t>"u"?e:e[t]}});var cL=Re((pB,uL)=>{"use strict";var GP=lL()("type")==="browser",jP=GP?t=>new URL(t,window.location.href).href:t=>t;uL.exports=t=>{let e={...t};return["corePath","workerPath","langPath"].forEach(n=>{t[n]&&(e[n]=jP(e[n]))}),e}});var eI=Re((mB,dL)=>{"use strict";dL.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}});var fL=Re((gB,KP)=>{KP.exports={name:"tesseract.js",version:"7.0.0",description:"Pure Javascript Multilingual OCR",main:"src/index.js",type:"commonjs",types:"src/index.d.ts",unpkg:"dist/tesseract.min.js",jsdelivr:"dist/tesseract.min.js",scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs","profile:tesseract":"webpack-bundle-analyzer dist/tesseract-stats.json","profile:worker":"webpack-bundle-analyzer dist/worker-stats.json",prepublishOnly:"npm run build",wait:"rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser test:node:all","test:browser":"karma start karma.conf.js","test:node":"nyc mocha --exit --bail --require ./scripts/test-helper.mjs","test:node:all":"npm run test:node -- ./tests/*.test.mjs",lint:"eslint src","lint:fix":"eslint --fix src",postinstall:"opencollective-postinstall || true"},browser:{"./src/worker/node/index.js":"./src/worker/browser/index.js"},author:"",contributors:["jeromewu"],license:"Apache-2.0",devDependencies:{"@babel/core":"^7.21.4","@babel/eslint-parser":"^7.21.3","@babel/preset-env":"^7.21.4","@rollup/plugin-commonjs":"^24.1.0",acorn:"^8.8.2","babel-loader":"^9.1.2",buffer:"^6.0.3",cors:"^2.8.5",eslint:"^7.32.0","eslint-config-airbnb-base":"^14.2.1","eslint-plugin-import":"^2.27.5","expect.js":"^0.3.1",express:"^4.18.2",mocha:"^10.2.0","npm-run-all":"^4.1.5",karma:"^6.4.2","karma-chrome-launcher":"^3.2.0","karma-firefox-launcher":"^2.1.2","karma-mocha":"^2.0.1","karma-webpack":"^5.0.0",nyc:"^15.1.0",rimraf:"^5.0.0",rollup:"^3.20.7","wait-on":"^7.0.1",webpack:"^5.79.0","webpack-bundle-analyzer":"^4.8.0","webpack-cli":"^5.0.1","webpack-dev-middleware":"^6.0.2","rollup-plugin-sourcemaps":"^0.6.3"},dependencies:{"bmp-js":"^0.1.0","idb-keyval":"^6.2.0","is-url":"^1.2.4","node-fetch":"^2.6.9","opencollective-postinstall":"^2.0.3","regenerator-runtime":"^0.13.3","tesseract.js-core":"^7.0.0","wasm-feature-detect":"^1.8.0",zlibjs:"^0.3.1"},overrides:{"@rollup/pluginutils":"^5.0.2"},repository:{type:"git",url:"https://github.com/naptha/tesseract.js.git"},bugs:{url:"https://github.com/naptha/tesseract.js/issues"},homepage:"https://github.com/naptha/tesseract.js",collective:{type:"opencollective",url:"https://opencollective.com/tesseractjs"}}});var pL=Re((yB,hL)=>{"use strict";hL.exports={workerBlobURL:!0,logger:()=>{}}});var gL=Re((IB,mL)=>{"use strict";var WP=fL().version,XP=pL();mL.exports={...XP,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${WP}/dist/worker.min.js`}});var IL=Re((_B,yL)=>{"use strict";yL.exports=({workerPath:t,workerBlobURL:e})=>{let n;if(Blob&&URL&&e){let a=new Blob([`importScripts("${t}");`],{type:"application/javascript"});n=new Worker(URL.createObjectURL(a))}else n=new Worker(t);return n}});var SL=Re((SB,_L)=>{"use strict";_L.exports=t=>{t.terminate()}});var EL=Re((vB,vL)=>{"use strict";vL.exports=(t,e)=>{t.onmessage=({data:n})=>{e(n)}}});var bL=Re((EB,TL)=>{"use strict";TL.exports=async(t,e)=>{t.postMessage(e)}});var CL=Re((TB,wL)=>{"use strict";var tI=t=>new Promise((e,n)=>{let a=new FileReader;a.onload=()=>{e(a.result)},a.onerror=({target:{error:{code:r}}})=>{n(Error(`File could not be read! Code=${r}`))},a.readAsArrayBuffer(t)}),nI=async t=>{let e=t;if(typeof t>"u")return"undefined";if(typeof t=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(t)?e=atob(t.split(",")[1]).split("").map(n=>n.charCodeAt(0)):e=await(await fetch(t)).arrayBuffer();else if(typeof HTMLElement<"u"&&t instanceof HTMLElement)t.tagName==="IMG"&&(e=await nI(t.src)),t.tagName==="VIDEO"&&(e=await nI(t.poster)),t.tagName==="CANVAS"&&await new Promise(n=>{t.toBlob(async a=>{e=await tI(a),n()})});else if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas){let n=await t.convertToBlob();e=await tI(n)}else(t instanceof File||t instanceof Blob)&&(e=await tI(t));return new Uint8Array(e)};wL.exports=nI});var AL=Re((bB,LL)=>{"use strict";var YP=gL(),QP=IL(),$P=SL(),JP=EL(),ZP=bL(),eO=CL();LL.exports={defaultOptions:YP,spawnWorker:QP,terminateWorker:$P,onMessage:JP,send:ZP,loadImage:eO}});var aI=Re((wB,DL)=>{"use strict";var tO=cL(),Ca=Jy(),{log:xL}=eh(),nO=Zf(),pi=eI(),{defaultOptions:aO,spawnWorker:rO,terminateWorker:sO,onMessage:iO,loadImage:RL,send:oO}=AL(),kL=0;DL.exports=async(t="eng",e=pi.LSTM_ONLY,n={},a={})=>{let r=nO("Worker",kL),{logger:s,errorHandler:i,...l}=tO({...aO,...n}),u={},c=typeof t=="string"?t.split("+"):t,f=e,p=a,m=[pi.DEFAULT,pi.LSTM_ONLY].includes(e)&&!l.legacyCore,v,R,D=new Promise((O,P)=>{R=O,v=P}),x=O=>{v(O.message)},T=rO(l);T.onerror=x,kL+=1;let E=({id:O,action:P,payload:V})=>new Promise((Q,G)=>{xL(`[${r}]: Start ${O}, action=${P}`);let te=`${P}-${O}`;u[te]={resolve:Q,reject:G},oO(T,{workerId:r,jobId:O,action:P,payload:V})}),C=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),L=O=>E(Ca({id:O,action:"load",payload:{options:{lstmOnly:m,corePath:l.corePath,logging:l.logging}}})),U=(O,P,V)=>E(Ca({id:V,action:"FS",payload:{method:"writeFile",args:[O,P]}})),N=(O,P)=>E(Ca({id:P,action:"FS",payload:{method:"readFile",args:[O,{encoding:"utf8"}]}})),y=(O,P)=>E(Ca({id:P,action:"FS",payload:{method:"unlink",args:[O]}})),g=(O,P,V)=>E(Ca({id:V,action:"FS",payload:{method:O,args:P}})),_=(O,P)=>E(Ca({id:P,action:"loadLanguage",payload:{langs:O,options:{langPath:l.langPath,dataPath:l.dataPath,cachePath:l.cachePath,cacheMethod:l.cacheMethod,gzip:l.gzip,lstmOnly:[pi.DEFAULT,pi.LSTM_ONLY].includes(f)&&!l.legacyLang}}})),b=(O,P,V,Q)=>E(Ca({id:Q,action:"initialize",payload:{langs:O,oem:P,config:V}})),w=(O="eng",P,V,Q)=>{if(m&&[pi.TESSERACT_ONLY,pi.TESSERACT_LSTM_COMBINED].includes(P))throw Error("Legacy model requested but code missing.");let G=P||f;f=G;let te=V||p;p=te;let ue=(typeof O=="string"?O.split("+"):O).filter(X=>!c.includes(X));return c.push(...ue),ue.length>0?_(ue,Q).then(()=>b(O,G,te,Q)):b(O,G,te,Q)},A=(O={},P)=>E(Ca({id:P,action:"setParameters",payload:{params:O}})),S=async(O,P={},V={text:!0},Q)=>E(Ca({id:Q,action:"recognize",payload:{image:await RL(O),options:P,output:V}})),$=async(O,P)=>{if(m)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return E(Ca({id:P,action:"detect",payload:{image:await RL(O)}}))},Z=async()=>(T!==null&&(sO(T),T=null),Promise.resolve());iO(T,({workerId:O,jobId:P,status:V,action:Q,data:G})=>{let te=`${Q}-${P}`;if(V==="resolve")xL(`[${O}]: Complete ${P}`),u[te].resolve({jobId:P,data:G}),delete u[te];else if(V==="reject")if(u[te].reject(G),delete u[te],Q==="load"&&v(G),i)i(G);else throw Error(G);else V==="progress"&&s({...G,userJobId:P})});let se={id:r,worker:T,load:C,writeText:U,readText:N,removeFile:y,FS:g,reinitialize:w,setParameters:A,recognize:S,detect:$,terminate:Z};return L().then(()=>_(t)).then(()=>b(t,e,a)).then(()=>R(se)).catch(()=>{}),D}});var ML=Re((CB,OL)=>{"use strict";var PL=aI(),lO=async(t,e,n)=>{let a=await PL(e,1,n);return a.recognize(t).finally(async()=>{await a.terminate()})},uO=async(t,e)=>{let n=await PL("osd",0,e);return n.detect(t).finally(async()=>{await n.terminate()})};OL.exports={recognize:lO,detect:uO}});var VL=Re((LB,NL)=>{"use strict";NL.exports={AFR:"afr",AMH:"amh",ARA:"ara",ASM:"asm",AZE:"aze",AZE_CYRL:"aze_cyrl",BEL:"bel",BEN:"ben",BOD:"bod",BOS:"bos",BUL:"bul",CAT:"cat",CEB:"ceb",CES:"ces",CHI_SIM:"chi_sim",CHI_TRA:"chi_tra",CHR:"chr",CYM:"cym",DAN:"dan",DEU:"deu",DZO:"dzo",ELL:"ell",ENG:"eng",ENM:"enm",EPO:"epo",EST:"est",EUS:"eus",FAS:"fas",FIN:"fin",FRA:"fra",FRK:"frk",FRM:"frm",GLE:"gle",GLG:"glg",GRC:"grc",GUJ:"guj",HAT:"hat",HEB:"heb",HIN:"hin",HRV:"hrv",HUN:"hun",IKU:"iku",IND:"ind",ISL:"isl",ITA:"ita",ITA_OLD:"ita_old",JAV:"jav",JPN:"jpn",KAN:"kan",KAT:"kat",KAT_OLD:"kat_old",KAZ:"kaz",KHM:"khm",KIR:"kir",KOR:"kor",KUR:"kur",LAO:"lao",LAT:"lat",LAV:"lav",LIT:"lit",MAL:"mal",MAR:"mar",MKD:"mkd",MLT:"mlt",MSA:"msa",MYA:"mya",NEP:"nep",NLD:"nld",NOR:"nor",ORI:"ori",PAN:"pan",POL:"pol",POR:"por",PUS:"pus",RON:"ron",RUS:"rus",SAN:"san",SIN:"sin",SLK:"slk",SLV:"slv",SPA:"spa",SPA_OLD:"spa_old",SQI:"sqi",SRP:"srp",SRP_LATN:"srp_latn",SWA:"swa",SWE:"swe",SYR:"syr",TAM:"tam",TEL:"tel",TGK:"tgk",TGL:"tgl",THA:"tha",TIR:"tir",TUR:"tur",UIG:"uig",UKR:"ukr",URD:"urd",UZB:"uzb",UZB_CYRL:"uzb_cyrl",VIE:"vie",YID:"yid"}});var FL=Re((AB,UL)=>{"use strict";UL.exports={OSD_ONLY:"0",AUTO_OSD:"1",AUTO_ONLY:"2",AUTO:"3",SINGLE_COLUMN:"4",SINGLE_BLOCK_VERT_TEXT:"5",SINGLE_BLOCK:"6",SINGLE_LINE:"7",SINGLE_WORD:"8",CIRCLE_WORD:"9",SINGLE_CHAR:"10",SPARSE_TEXT:"11",SPARSE_TEXT_OSD:"12",RAW_LINE:"13"}});var qL=Re((xB,BL)=>{"use strict";ZC();var cO=iL(),dO=aI(),fO=ML(),hO=VL(),pO=eI(),mO=FL(),{setLogging:gO}=eh();BL.exports={languages:hO,OEM:pO,PSM:mO,createScheduler:cO,createWorker:dO,setLogging:gO,...fO}});var $R=Re(jp=>{"use strict";var cF=Symbol.for("react.transitional.element"),dF=Symbol.for("react.fragment");function QR(t,e,n){var a=null;if(n!==void 0&&(a=""+n),e.key!==void 0&&(a=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:cF,type:t,key:a,ref:e!==void 0?e:null,props:n}}jp.Fragment=dF;jp.jsx=QR;jp.jsxs=QR});var et=Re((j6,JR)=>{"use strict";JR.exports=$R()});var ok={};Wk(ok,{captureScreenshot:()=>pF});var pF,lk=Kk(()=>{pF=async()=>null});var ke=Ee(En()),kk=Ee(jC());var Xy="http://localhost:3000";console.log("[EXTENSION] Using API_BASE:",Xy);function BP(t){return typeof t=="string"?t.startsWith("http")?t:Xy+t:t instanceof URL?t.href:t.url}function KC(){function t(){}function e(a,r={}){let s=BP(a),i=r.method||"GET",l=r.headers instanceof Headers||Array.isArray(r.headers)?Object.fromEntries(r.headers):{...r.headers},u=r.body??null;return new Promise((c,f)=>{chrome.runtime.sendMessage({type:"echly-api",url:s,method:i,headers:l,body:u},p=>{if(chrome.runtime.lastError){f(new Error(chrome.runtime.lastError.message));return}if(!p){f(new Error("No response from background"));return}let m=new Response(p.body??"",{status:p.status??0,headers:p.headers?new Headers(p.headers):void 0});c(m)})})}async function n(a,r={}){let s=a.startsWith("http")?a:Xy+a;return e(s,r)}return{apiFetch:n,authFetch:e,clearAuthTokenCache:t}}function oe(t,e,n){let a=`[ECHLY][${t}]`;n!==void 0?console.log(a,e,n):console.log(a,e)}function WC(t){let{shadowHostId:e}=t;function n(c){let f=document.getElementById(e);f&&(f.style.display=c?"block":"none")}function a(){return{visible:!1,expanded:!1,isRecording:!1,sessionId:null,sessionModeActive:!1,sessionPaused:!1}}function r(c){let f=p=>{let m=p.detail?.state;m&&(oe("CONTENT","global state received",m),n(m.visible),c(m))};return window.addEventListener("ECHLY_GLOBAL_STATE",f),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",f)}function s(c){return c?{visible:c.visible??!1,expanded:c.expanded??!1,isRecording:c.isRecording??!1,sessionId:c.sessionId??null,sessionModeActive:c.sessionModeActive??!1,sessionPaused:c.sessionPaused??!1}:null}function i(c){oe("CONTENT","dispatch event",{type:"ECHLY_GLOBAL_STATE"}),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:c}}))}function l(c){chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},f=>{let p=s(f?.state);p&&(c.style.display=p.visible?"block":"none",i(p))})}function u(){document.addEventListener("visibilitychange",()=>{document.hidden||chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},c=>{let f=s(c?.state);f&&(n(f.visible),i(f))})})}return{getInitialState:a,setHostVisibility:n,subscribeGlobalState:r,normalizeGlobalState:s,dispatchGlobalState:i,syncInitialGlobalState:l,ensureVisibilityStateRefresh:u}}function XC(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(n=>{if(n.type==="ECHLY_FEEDBACK_CREATED"&&n.ticket&&n.sessionId){oe("CONTENT","dispatch event",{type:"ECHLY_FEEDBACK_CREATED"}),window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:n.ticket,sessionId:n.sessionId}}));return}n.type==="ECHLY_GLOBAL_STATE"&&n.state&&(oe("CONTENT","global state received",n.state),t.style.display=n.state.visible?"block":"none",oe("CONTENT","dispatch event",{type:"ECHLY_GLOBAL_STATE"}),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:n.state}}))),n.type==="ECHLY_TOGGLE"&&(oe("CONTENT","dispatch event",{type:"ECHLY_TOGGLE_WIDGET"}),window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET")))}))}function YC(t){let{apiFetch:e,setSessionIdOverride:n,setLoadSessionWithPointers:a}=t;async function r(){console.log("[Echly] Creating session");try{let p=await e("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),m=await p.json();return console.log("[Echly] Create session response:",{ok:p.ok,status:p.status,success:m.success,sessionId:m.session?.id}),!p.ok||!m.success||!m.session?.id?null:{id:m.session.id}}catch(p){return console.error("[Echly] Failed to create session:",p),null}}function s(p){chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:p},()=>{}),n(p)}async function i(p){chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:p},()=>{chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_RESUME"}).catch(()=>{})}),n(p);try{let D=((await(await e(`/api/feedback?sessionId=${encodeURIComponent(p)}&limit=50`)).json()).feedback??[]).map(x=>({id:x.id,title:x.title??"",description:x.description??"",type:x.type??"Feedback"}));a({sessionId:p,pointers:D})}catch(m){console.error("[Echly] Failed to load session feedback:",m),a({sessionId:p,pointers:[]})}}function l(){chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{})}function u(){chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_PAUSE"}).catch(()=>{})}function c(){chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_RESUME"}).catch(()=>{})}function f(){chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_END"}).catch(()=>{})}return{createSession:r,onActiveSessionChange:s,onResumeSessionSelect:i,onSessionModeStart:l,onSessionModePause:u,onSessionModeResume:c,onSessionModeEnd:f}}function QC(t){let{effectiveSessionId:e,user:n,apiFetch:a,getVisibleTextFromScreenshot:r,uploadScreenshot:s,generateFeedbackId:i,generateScreenshotId:l,submissionLockRef:u,clarityAssistantSubmitLockRef:c,setExtensionClarityPending:f,setEditedTranscript:p,setIsEditingFeedback:m,setClarityAssistantSubmitting:v,setShowClarityAssistant:R}=t,D=u;function x(L,U,N,y,g){return oe("PIPELINE","start"),D.current?(oe("PIPELINE","blocked by submissionLock"),N?.onError?.(),Promise.resolve(void 0)):(D.current=!0,!e||!n?(oe("PIPELINE","error"),N?.onError?.(),D.current=!1,Promise.resolve(void 0)):N?((async()=>{let _=r(U??null),b=i(),w=l(),A=U?s(U,e,w):Promise.resolve(null),S=await _;console.log("[OCR] Extracted visibleText:",S);let $=typeof window<"u"?window.location.href:"",Z={...y??{},visibleText:S?.trim()&&S||y?.visibleText||null,url:y?.url??$},se={transcript:L,context:Z};try{oe("PIPELINE","structure request"),console.log("[VOICE] final transcript submitted",L);let P=await(await a("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(se)})).json(),V=Array.isArray(P.tickets)?P.tickets:[],Q=typeof P.clarityScore=="number"?P.clarityScore:P.clarityScore!=null?Number(P.clarityScore):100,G=P.clarityIssues??[],te=P.suggestedRewrite??null,Se=P.confidence??.5;if(!!!g?.sessionMode){if(P.success&&Q<=20){console.log("CLARITY GUARD TRIGGERED",Q),f({tickets:V,screenshotUrl:null,screenshotId:w,uploadPromise:A,transcript:L,screenshot:U,firstFeedbackId:b,clarityScore:Q,clarityIssues:G,suggestedRewrite:te,confidence:Se,callbacks:N,context:Z}),p(L),m(!1),c.current=!1,v(!1),R(!0),D.current=!1;return}let be=!!P.needsClarification,re=P.verificationIssues??[];if(P.success&&be&&V.length===0){console.log("PIPELINE NEEDS CLARIFICATION",re),f({tickets:[],screenshotUrl:null,screenshotId:w,uploadPromise:A,transcript:L,screenshot:U,firstFeedbackId:b,clarityScore:Q,clarityIssues:re.length>0?re:G,suggestedRewrite:te,confidence:Se,callbacks:N,context:Z}),p(L),m(!1),c.current=!1,v(!1),R(!0),D.current=!1;return}}if(!P.success||V.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:L,screenshotUrl:null,screenshotId:w,sessionId:e,context:Z}},be=>{if(D.current=!1,chrome.runtime.lastError){oe("PIPELINE","error"),N.onError();return}if(be?.success&&be.ticket){let re=be.ticket.id;oe("PIPELINE","ticket created",{ticketId:re}),N.onSuccess({id:re,title:be.ticket.title,description:be.ticket.description,type:be.ticket.type??"Feedback"}),A.then(Xe=>{Xe&&(oe("PIPELINE","screenshot uploaded",{screenshotUrl:Xe}),oe("PIPELINE","screenshot patched",{ticketId:re}),a(`/api/tickets/${re}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Xe})}).catch(()=>{}))}).catch(()=>{})}else oe("PIPELINE","error"),N.onError()});return}let X=Q>=85?"clear":Q>=60?"needs_improvement":"unclear",me={clarityScore:Q,clarityIssues:G,clarityConfidence:Se,clarityStatus:X},Ne;for(let be=0;be<V.length;be++){let re=V[be],Xe=typeof re.description=="string"?re.description:re.title??"",sn={sessionId:e,title:re.title??"",description:Xe,type:Array.isArray(re.suggestedTags)&&re.suggestedTags[0]?re.suggestedTags[0]:"Feedback",contextSummary:Xe,actionSteps:Array.isArray(re.actionSteps)?re.actionSteps:[],suggestedTags:re.suggestedTags,screenshotUrl:null,screenshotId:be===0?w:void 0,metadata:{clientTimestamp:Date.now()},...me},qt=await(await a("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sn)})).json();if(qt.success&&qt.ticket){let ua=qt.ticket;Ne||(Ne={id:ua.id,title:ua.title,description:ua.description,type:ua.type??"Feedback"})}}if(D.current=!1,Ne){let be=Ne.id;oe("PIPELINE","ticket created",{ticketId:be}),A.then(re=>{re&&(oe("PIPELINE","screenshot uploaded",{screenshotUrl:re}),oe("PIPELINE","screenshot patched",{ticketId:be}),a(`/api/tickets/${be}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:re})}).catch(()=>{}))}).catch(()=>{}),N.onSuccess(Ne)}else oe("PIPELINE","error"),N.onError()}catch(O){console.error("[Echly] Structure or submit failed:",O),D.current=!1,oe("PIPELINE","error"),N.onError()}})(),Promise.resolve(void 0)):(async()=>{try{let _=l(),b=U?s(U,e,_):Promise.resolve(null),w=await r(U??null);console.log("[OCR] Extracted visibleText:",w);let A=typeof window<"u"?window.location.href:"",S={transcript:L,context:{...y??{},visibleText:w?.trim()&&w||y?.visibleText||null,url:y?.url??A}};oe("PIPELINE","structure request"),console.log("[VOICE] final transcript submitted",L);let Z=await(await a("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(S)})).json(),se=Array.isArray(Z.tickets)?Z.tickets:[],O=Z.clarityScore??100,P=Z.clarityIssues??[],V=Z.suggestedRewrite??null,Q=Z.confidence??.5;if(!Z.success||se.length===0)return;let G=O>=85?"clear":O>=60?"needs_improvement":"unclear",te={clarityScore:O,clarityIssues:P,clarityConfidence:Q,clarityStatus:G},Se;for(let ue=0;ue<se.length;ue++){let X=se[ue],me=typeof X.description=="string"?X.description:X.title??"",Ne={sessionId:e,title:X.title??"",description:me,type:Array.isArray(X.suggestedTags)&&X.suggestedTags[0]?X.suggestedTags[0]:"Feedback",contextSummary:me,actionSteps:Array.isArray(X.actionSteps)?X.actionSteps:[],suggestedTags:X.suggestedTags,screenshotUrl:null,screenshotId:ue===0?_:void 0,metadata:{clientTimestamp:Date.now()},...te},re=await(await a("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Ne)})).json();if(re.success&&re.ticket){let Xe=re.ticket;Se||(Se={id:Xe.id,title:Xe.title,description:Xe.description,type:Xe.type??"Feedback"})}}if(Se){let ue=Se.id;b.then(X=>{X&&a(`/api/tickets/${ue}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:X})}).catch(()=>{})}).catch(()=>{})}return Se}finally{D.current=!1}})())}async function T(L){if(!e)return;if(L.tickets.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:L.transcript,screenshotUrl:null,screenshotId:L.screenshotId,sessionId:e,context:L.context??{}}},y=>{if(chrome.runtime.lastError){console.error("[Echly] Submit anyway failed:",chrome.runtime.lastError.message),oe("PIPELINE","error"),L.callbacks.onError();return}if(y?.success&&y.ticket){let g=y.ticket.id;L.callbacks.onSuccess({id:g,title:y.ticket.title,description:y.ticket.description,type:y.ticket.type??"Feedback"}),L.uploadPromise.then(_=>{_&&a(`/api/tickets/${g}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:_})}).catch(()=>{})}).catch(()=>{})}else oe("PIPELINE","error"),L.callbacks.onError()});return}let U={clarityScore:L.clarityScore,clarityIssues:L.clarityIssues,clarityConfidence:L.confidence,clarityStatus:L.clarityScore>=85?"clear":L.clarityScore>=60?"needs_improvement":"unclear"},N;for(let y=0;y<L.tickets.length;y++){let g=L.tickets[y],_=typeof g.description=="string"?g.description:g.title??"",b={sessionId:e,title:g.title??"",description:_,type:Array.isArray(g.suggestedTags)&&g.suggestedTags[0]?g.suggestedTags[0]:"Feedback",contextSummary:_,actionSteps:Array.isArray(g.actionSteps)?g.actionSteps:[],suggestedTags:g.suggestedTags,screenshotUrl:null,screenshotId:y===0?L.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...U},A=await(await a("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)})).json();if(A.success&&A.ticket){let S=A.ticket;N||(N={id:S.id,title:S.title,description:S.description,type:S.type??"Feedback"})}}if(N){let y=N.id;L.uploadPromise.then(g=>{g&&a(`/api/tickets/${y}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:g})}).catch(()=>{})}).catch(()=>{}),L.callbacks.onSuccess(N)}else oe("PIPELINE","error"),L.callbacks.onError()}async function E(L,U){if(!e)return;let N=U.trim();try{let y={transcript:N,context:L.context??{}},_=await(await a("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(y)})).json(),b=Array.isArray(_.tickets)?_.tickets:[],w=_.clarityScore??100,A=_.confidence??.5,S=w>=85?"clear":w>=60?"needs_improvement":"unclear",$={clarityScore:w,clarityIssues:_.clarityIssues??[],clarityConfidence:A,clarityStatus:S};if(b.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N,screenshotUrl:null,screenshotId:L.screenshotId,sessionId:e,context:L.context??{}}},se=>{if(chrome.runtime.lastError){console.error("[Echly] Submit edited feedback failed:",chrome.runtime.lastError.message),oe("PIPELINE","error"),L.callbacks.onError();return}if(se?.success&&se.ticket){let O=se.ticket.id;L.callbacks.onSuccess({id:O,title:se.ticket.title,description:se.ticket.description,type:se.ticket.type??"Feedback"}),L.uploadPromise.then(P=>{P&&a(`/api/tickets/${O}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:P})}).catch(()=>{})}).catch(()=>{})}else oe("PIPELINE","error"),L.callbacks.onError()});return}let Z;for(let se=0;se<b.length;se++){let O=b[se],P=typeof O.description=="string"?O.description:O.title??"",V={sessionId:e,title:O.title??"",description:P,type:Array.isArray(O.suggestedTags)&&O.suggestedTags[0]?O.suggestedTags[0]:"Feedback",contextSummary:P,actionSteps:Array.isArray(O.actionSteps)?O.actionSteps:[],suggestedTags:O.suggestedTags,screenshotUrl:null,screenshotId:se===0?L.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...$},G=await(await a("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(V)})).json();if(G.success&&G.ticket){let te=G.ticket;Z||(Z={id:te.id,title:te.title,description:te.description,type:te.type??"Feedback"})}}if(Z){let se=Z.id;L.uploadPromise.then(O=>{O&&a(`/api/tickets/${se}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:O})}).catch(()=>{})}).catch(()=>{}),L.callbacks.onSuccess(Z)}else oe("PIPELINE","error"),L.callbacks.onError()}catch(y){console.error("[Echly] Submit edited feedback failed:",y),oe("PIPELINE","error"),L.callbacks.onError()}}function C(L){let U=L;return!U?.suggestedRewrite?.trim()||!e?Promise.resolve():(f(null),(async()=>{try{let y=await(await a("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:U.suggestedRewrite.trim()})})).json(),g=Array.isArray(y.tickets)?y.tickets:[],_=y.clarityScore??100,b=y.confidence??.5,w=_>=85?"clear":_>=60?"needs_improvement":"unclear",A={clarityScore:_,clarityIssues:y.clarityIssues??[],clarityConfidence:b,clarityStatus:w},S;for(let $=0;$<g.length;$++){let Z=g[$],se=typeof Z.description=="string"?Z.description:Z.title??"",O={sessionId:e,title:Z.title??"",description:se,type:Array.isArray(Z.suggestedTags)&&Z.suggestedTags[0]?Z.suggestedTags[0]:"Feedback",contextSummary:se,actionSteps:Array.isArray(Z.actionSteps)?Z.actionSteps:[],suggestedTags:Z.suggestedTags,screenshotUrl:null,screenshotId:$===0?U.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...A},V=await(await a("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(O)})).json();if(V.success&&V.ticket){let Q=V.ticket;S||(S={id:Q.id,title:Q.title,description:Q.description,type:Q.type??"Feedback"})}}if(S){let $=S.id;U.uploadPromise.then(Z=>{Z&&a(`/api/tickets/${$}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Z})}).catch(()=>{})}).catch(()=>{}),U.callbacks.onSuccess(S)}else oe("PIPELINE","error"),U.callbacks.onError()}catch(N){console.error("[Echly] Use suggestion failed:",N),oe("PIPELINE","error"),U.callbacks.onError()}})())}return{handleComplete:x,submitPendingFeedback:T,submitEditedFeedback:E,handleExtensionClarityUseSuggestion:C}}function Yy(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function $C(){return Yy()}function JC(t,e,n){return new Promise((a,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,screenshotId:n},s=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(s?.error){r(new Error(s.error));return}if(s?.url){a(s.url);return}r(new Error("No URL from background"))})})}async function zL(t){if(!t||typeof t!="string")return"";try{let n=await(await Promise.resolve().then(()=>Ee(qL()))).createWorker("eng",void 0,{logger:()=>{}}),{data:{text:a}}=await n.recognize(t);return await n.terminate(),!a||typeof a!="string"?"":a.replace(/\s+/g," ").trim().slice(0,2e3)}catch{return""}}var la=Ee(En());var HL=()=>{};var KL=function(t){let e=[],n=0;for(let a=0;a<t.length;a++){let r=t.charCodeAt(a);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&a+1<t.length&&(t.charCodeAt(a+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++a)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},yO=function(t){let e=[],n=0,a=0;for(;n<t.length;){let r=t[n++];if(r<128)e[a++]=String.fromCharCode(r);else if(r>191&&r<224){let s=t[n++];e[a++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){let s=t[n++],i=t[n++],l=t[n++],u=((r&7)<<18|(s&63)<<12|(i&63)<<6|l&63)-65536;e[a++]=String.fromCharCode(55296+(u>>10)),e[a++]=String.fromCharCode(56320+(u&1023))}else{let s=t[n++],i=t[n++];e[a++]=String.fromCharCode((r&15)<<12|(s&63)<<6|i&63)}}return e.join("")},WL={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let r=0;r<t.length;r+=3){let s=t[r],i=r+1<t.length,l=i?t[r+1]:0,u=r+2<t.length,c=u?t[r+2]:0,f=s>>2,p=(s&3)<<4|l>>4,m=(l&15)<<2|c>>6,v=c&63;u||(v=64,i||(m=64)),a.push(n[f],n[p],n[m],n[v])}return a.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(KL(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):yO(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let n=e?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let r=0;r<t.length;){let s=n[t.charAt(r++)],l=r<t.length?n[t.charAt(r)]:0;++r;let c=r<t.length?n[t.charAt(r)]:64;++r;let p=r<t.length?n[t.charAt(r)]:64;if(++r,s==null||l==null||c==null||p==null)throw new sI;let m=s<<2|l>>4;if(a.push(m),c!==64){let v=l<<4&240|c>>2;if(a.push(v),p!==64){let R=c<<6&192|p;a.push(R)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},sI=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},IO=function(t){let e=KL(t);return WL.encodeByteArray(e,!0)},Qu=function(t){return IO(t).replace(/\./g,"")},ah=function(t){try{return WL.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function XL(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var _O=()=>XL().__FIREBASE_DEFAULTS__,SO=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},vO=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&ah(t[1]);return e&&JSON.parse(e)},rh=()=>{try{return HL()||_O()||SO()||vO()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},oI=t=>rh()?.emulatorHosts?.[t],sh=t=>{let e=oI(t);if(!e)return;let n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let a=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),a]:[e.substring(0,n),a]},lI=()=>rh()?.config,uI=t=>rh()?.[`_${t}`];var nh=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,a)=>{n?this.reject(n):this.resolve(a),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,a))}}};function La(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Fo(t){return(await fetch(t,{credentials:"include"})).ok}function ih(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let n={alg:"none",type:"JWT"},a=e||"demo-project",r=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let i={iss:`https://securetoken.google.com/${a}`,aud:a,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[Qu(JSON.stringify(n)),Qu(JSON.stringify(i)),""].join(".")}var Yu={};function EO(){let t={prod:[],emulator:[]};for(let e of Object.keys(Yu))Yu[e]?t.emulator.push(e):t.prod.push(e);return t}function TO(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}var GL=!1;function Bo(t,e){if(typeof window>"u"||typeof document>"u"||!La(window.location.host)||Yu[t]===e||Yu[t]||GL)return;Yu[t]=e;function n(m){return`__firebase__banner__${m}`}let a="__firebase__banner",s=EO().prod.length>0;function i(){let m=document.getElementById(a);m&&m.remove()}function l(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function u(m,v){m.setAttribute("width","24"),m.setAttribute("id",v),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function c(){let m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{GL=!0,i()},m}function f(m,v){m.setAttribute("id",v),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){let m=TO(a),v=n("text"),R=document.getElementById(v)||document.createElement("span"),D=n("learnmore"),x=document.getElementById(D)||document.createElement("a"),T=n("preprendIcon"),E=document.getElementById(T)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){let C=m.element;l(C),f(x,D);let L=c();u(E,T),C.append(E,R,x,L),document.body.appendChild(C)}s?(R.innerText="Preview backend disconnected.",E.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(E.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,R.innerText="Preview backend running in this workspace."),R.setAttribute("id",v)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}function Mt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function YL(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Mt())}function bO(){let t=rh()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function QL(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function $L(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function JL(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function ZL(){let t=Mt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function eA(){return!bO()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function cI(){try{return typeof indexedDB=="object"}catch{return!1}}function tA(){return new Promise((t,e)=>{try{let n=!0,a="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(a);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(a),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(n){e(n)}})}var wO="FirebaseError",rn=class t extends Error{constructor(e,n,a){super(n),this.code=e,this.customData=a,this.name=wO,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,vr.prototype.create)}},vr=class{constructor(e,n,a){this.service=e,this.serviceName=n,this.errors=a}create(e,...n){let a=n[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?CO(s,a):"Error",l=`${this.serviceName}: ${i} (${r}).`;return new rn(r,l,a)}};function CO(t,e){return t.replace(LO,(n,a)=>{let r=e[a];return r!=null?String(r):`<${a}?>`})}var LO=/\{\$([^}]+)}/g;function nA(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function aa(t,e){if(t===e)return!0;let n=Object.keys(t),a=Object.keys(e);for(let r of n){if(!a.includes(r))return!1;let s=t[r],i=e[r];if(jL(s)&&jL(i)){if(!aa(s,i))return!1}else if(s!==i)return!1}for(let r of a)if(!n.includes(r))return!1;return!0}function jL(t){return t!==null&&typeof t=="object"}function qo(t){let e=[];for(let[n,a]of Object.entries(t))Array.isArray(a)?a.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(a));return e.length?"&"+e.join("&"):""}function zo(t){let e={};return t.replace(/^\?/,"").split("&").forEach(a=>{if(a){let[r,s]=a.split("=");e[decodeURIComponent(r)]=decodeURIComponent(s)}}),e}function Ho(t){let e=t.indexOf("?");if(!e)return"";let n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function aA(t,e){let n=new iI(t,e);return n.subscribe.bind(n)}var iI=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(a=>{this.error(a)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,a){let r;if(e===void 0&&n===void 0&&a===void 0)throw new Error("Missing Observer.");AO(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:a},r.next===void 0&&(r.next=rI),r.error===void 0&&(r.error=rI),r.complete===void 0&&(r.complete=rI);let s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function AO(t,e){if(typeof t!="object"||t===null)return!1;for(let n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function rI(){}var PB=4*60*60*1e3;function Nt(t){return t&&t._delegate?t._delegate:t}var mn=class{constructor(e,n,a){this.name=e,this.instanceFactory=n,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var mi="[DEFAULT]";var dI=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){let a=new nh;if(this.instancesDeferred.set(n,a),this.isInitialized(n)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:n});r&&a.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){let n=this.normalizeInstanceIdentifier(e?.identifier),a=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(a)return null;throw r}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(RO(e))try{this.getOrInitializeService({instanceIdentifier:mi})}catch{}for(let[n,a]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(n);try{let s=this.getOrInitializeService({instanceIdentifier:r});a.resolve(s)}catch{}}}}clearInstance(e=mi){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=mi){return this.instances.has(e)}getOptions(e=mi){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:n={}}=e,a=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:a,options:n});for(let[s,i]of this.instancesDeferred.entries()){let l=this.normalizeInstanceIdentifier(s);a===l&&i.resolve(r)}return r}onInit(e,n){let a=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(a)??new Set;r.add(e),this.onInitCallbacks.set(a,r);let s=this.instances.get(a);return s&&e(s,a),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){let a=this.onInitCallbacks.get(n);if(a)for(let r of a)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let a=this.instances.get(e);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:xO(e),options:n}),this.instances.set(e,a),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(a,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,a)}catch{}return a||null}normalizeInstanceIdentifier(e=mi){return this.component?this.component.multipleInstances?e:mi:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function xO(t){return t===mi?void 0:t}function RO(t){return t.instantiationMode==="EAGER"}var oh=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let n=new dI(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};var kO=[],ye;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(ye||(ye={}));var DO={debug:ye.DEBUG,verbose:ye.VERBOSE,info:ye.INFO,warn:ye.WARN,error:ye.ERROR,silent:ye.SILENT},PO=ye.INFO,OO={[ye.DEBUG]:"log",[ye.VERBOSE]:"log",[ye.INFO]:"info",[ye.WARN]:"warn",[ye.ERROR]:"error"},MO=(t,e,...n)=>{if(e<t.logLevel)return;let a=new Date().toISOString(),r=OO[e];if(r)console[r](`[${a}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},As=class{constructor(e){this.name=e,this._logLevel=PO,this._logHandler=MO,this._userLogHandler=null,kO.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ye))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?DO[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ye.DEBUG,...e),this._logHandler(this,ye.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ye.VERBOSE,...e),this._logHandler(this,ye.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ye.INFO,...e),this._logHandler(this,ye.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ye.WARN,...e),this._logHandler(this,ye.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ye.ERROR,...e),this._logHandler(this,ye.ERROR,...e)}};var NO=(t,e)=>e.some(n=>t instanceof n),rA,sA;function VO(){return rA||(rA=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function UO(){return sA||(sA=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var iA=new WeakMap,hI=new WeakMap,oA=new WeakMap,fI=new WeakMap,mI=new WeakMap;function FO(t){let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{n(Aa(t.result)),r()},i=()=>{a(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(n=>{n instanceof IDBCursor&&iA.set(n,t)}).catch(()=>{}),mI.set(e,t),e}function BO(t){if(hI.has(t))return;let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{n(),r()},i=()=>{a(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});hI.set(t,e)}var pI={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return hI.get(t);if(e==="objectStoreNames")return t.objectStoreNames||oA.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Aa(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function lA(t){pI=t(pI)}function qO(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let a=t.call(lh(this),e,...n);return oA.set(a,e.sort?e.sort():[e]),Aa(a)}:UO().includes(t)?function(...e){return t.apply(lh(this),e),Aa(iA.get(this))}:function(...e){return Aa(t.apply(lh(this),e))}}function zO(t){return typeof t=="function"?qO(t):(t instanceof IDBTransaction&&BO(t),NO(t,VO())?new Proxy(t,pI):t)}function Aa(t){if(t instanceof IDBRequest)return FO(t);if(fI.has(t))return fI.get(t);let e=zO(t);return e!==t&&(fI.set(t,e),mI.set(e,t)),e}var lh=t=>mI.get(t);function cA(t,e,{blocked:n,upgrade:a,blocking:r,terminated:s}={}){let i=indexedDB.open(t,e),l=Aa(i);return a&&i.addEventListener("upgradeneeded",u=>{a(Aa(i.result),u.oldVersion,u.newVersion,Aa(i.transaction),u)}),n&&i.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{s&&u.addEventListener("close",()=>s()),r&&u.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),l}var HO=["get","getKey","getAll","getAllKeys","count"],GO=["put","add","delete","clear"],gI=new Map;function uA(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(gI.get(e))return gI.get(e);let n=e.replace(/FromIndex$/,""),a=e!==n,r=GO.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(r||HO.includes(n)))return;let s=async function(i,...l){let u=this.transaction(i,r?"readwrite":"readonly"),c=u.store;return a&&(c=c.index(l.shift())),(await Promise.all([c[n](...l),r&&u.done]))[0]};return gI.set(e,s),s}lA(t=>({...t,get:(e,n,a)=>uA(e,n)||t.get(e,n,a),has:(e,n)=>!!uA(e,n)||t.has(e,n)}));var II=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(jO(n)){let a=n.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(n=>n).join(" ")}};function jO(t){return t.getComponent()?.type==="VERSION"}var _I="@firebase/app",dA="0.14.9";var Er=new As("@firebase/app"),KO="@firebase/app-compat",WO="@firebase/analytics-compat",XO="@firebase/analytics",YO="@firebase/app-check-compat",QO="@firebase/app-check",$O="@firebase/auth",JO="@firebase/auth-compat",ZO="@firebase/database",eM="@firebase/data-connect",tM="@firebase/database-compat",nM="@firebase/functions",aM="@firebase/functions-compat",rM="@firebase/installations",sM="@firebase/installations-compat",iM="@firebase/messaging",oM="@firebase/messaging-compat",lM="@firebase/performance",uM="@firebase/performance-compat",cM="@firebase/remote-config",dM="@firebase/remote-config-compat",fM="@firebase/storage",hM="@firebase/storage-compat",pM="@firebase/firestore",mM="@firebase/ai",gM="@firebase/firestore-compat",yM="firebase",IM="12.10.0";var SI="[DEFAULT]",_M={[_I]:"fire-core",[KO]:"fire-core-compat",[XO]:"fire-analytics",[WO]:"fire-analytics-compat",[QO]:"fire-app-check",[YO]:"fire-app-check-compat",[$O]:"fire-auth",[JO]:"fire-auth-compat",[ZO]:"fire-rtdb",[eM]:"fire-data-connect",[tM]:"fire-rtdb-compat",[nM]:"fire-fn",[aM]:"fire-fn-compat",[rM]:"fire-iid",[sM]:"fire-iid-compat",[iM]:"fire-fcm",[oM]:"fire-fcm-compat",[lM]:"fire-perf",[uM]:"fire-perf-compat",[cM]:"fire-rc",[dM]:"fire-rc-compat",[fM]:"fire-gcs",[hM]:"fire-gcs-compat",[pM]:"fire-fst",[gM]:"fire-fst-compat",[mM]:"fire-vertex","fire-js":"fire-js",[yM]:"fire-js-all"};var uh=new Map,SM=new Map,vI=new Map;function fA(t,e){try{t.container.addComponent(e)}catch(n){Er.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function xa(t){let e=t.name;if(vI.has(e))return Er.debug(`There were multiple attempts to register component ${e}.`),!1;vI.set(e,t);for(let n of uh.values())fA(n,t);for(let n of SM.values())fA(n,t);return!0}function gi(t,e){let n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function yn(t){return t==null?!1:t.settings!==void 0}var vM={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},xs=new vr("app","Firebase",vM);var EI=class{constructor(e,n,a){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new mn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw xs.create("app-deleted",{appName:this._name})}};var Ra=IM;function wI(t,e={}){let n=t;typeof e!="object"&&(e={name:e});let a={name:SI,automaticDataCollectionEnabled:!0,...e},r=a.name;if(typeof r!="string"||!r)throw xs.create("bad-app-name",{appName:String(r)});if(n||(n=lI()),!n)throw xs.create("no-options");let s=uh.get(r);if(s){if(aa(n,s.options)&&aa(a,s.config))return s;throw xs.create("duplicate-app",{appName:r})}let i=new oh(r);for(let u of vI.values())i.addComponent(u);let l=new EI(n,a,i);return uh.set(r,l),l}function Go(t=SI){let e=uh.get(t);if(!e&&t===SI&&lI())return wI();if(!e)throw xs.create("no-app",{appName:t});return e}function gn(t,e,n){let a=_M[t]??t;n&&(a+=`-${n}`);let r=a.match(/\s|\//),s=e.match(/\s|\//);if(r||s){let i=[`Unable to register library "${a}" with version "${e}":`];r&&i.push(`library name "${a}" contains illegal characters (whitespace or "/")`),r&&s&&i.push("and"),s&&i.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Er.warn(i.join(" "));return}xa(new mn(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}var EM="firebase-heartbeat-database",TM=1,$u="firebase-heartbeat-store",yI=null;function gA(){return yI||(yI=cA(EM,TM,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore($u)}catch(n){console.warn(n)}}}}).catch(t=>{throw xs.create("idb-open",{originalErrorMessage:t.message})})),yI}async function bM(t){try{let n=(await gA()).transaction($u),a=await n.objectStore($u).get(yA(t));return await n.done,a}catch(e){if(e instanceof rn)Er.warn(e.message);else{let n=xs.create("idb-get",{originalErrorMessage:e?.message});Er.warn(n.message)}}}async function hA(t,e){try{let a=(await gA()).transaction($u,"readwrite");await a.objectStore($u).put(e,yA(t)),await a.done}catch(n){if(n instanceof rn)Er.warn(n.message);else{let a=xs.create("idb-set",{originalErrorMessage:n?.message});Er.warn(a.message)}}}function yA(t){return`${t.name}!${t.options.appId}`}var wM=1024,CM=30,TI=class{constructor(e){this.container=e,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new bI(n),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=pA();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(r=>r.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:n}),this._heartbeatsCache.heartbeats.length>CM){let r=AM(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Er.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=pA(),{heartbeatsToSend:n,unsentEntries:a}=LM(this._heartbeatsCache.heartbeats),r=Qu(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return Er.warn(e),""}}};function pA(){return new Date().toISOString().substring(0,10)}function LM(t,e=wM){let n=[],a=t.slice();for(let r of t){let s=n.find(i=>i.agent===r.agent);if(s){if(s.dates.push(r.date),mA(n)>e){s.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),mA(n)>e){n.pop();break}a=a.slice(1)}return{heartbeatsToSend:n,unsentEntries:a}}var bI=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return cI()?tA().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await bM(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return hA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return hA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}};function mA(t){return Qu(JSON.stringify({version:2,heartbeats:t})).length}function AM(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let a=1;a<t.length;a++)t[a].date<n&&(n=t[a].date,e=a);return e}function xM(t){xa(new mn("platform-logger",e=>new II(e),"PRIVATE")),xa(new mn("heartbeat",e=>new TI(e),"PRIVATE")),gn(_I,dA,t),gn(_I,dA,"esm2020"),gn("fire-js","")}xM("");var RM="firebase",kM="12.10.0";gn(RM,kM,"app");function NA(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var VA=NA,UA=new vr("auth","Firebase",NA());var gh=new As("@firebase/auth");function DM(t,...e){gh.logLevel<=ye.WARN&&gh.warn(`Auth (${Ra}): ${t}`,...e)}function dh(t,...e){gh.logLevel<=ye.ERROR&&gh.error(`Auth (${Ra}): ${t}`,...e)}function ra(t,...e){throw QI(t,...e)}function Da(t,...e){return QI(t,...e)}function FA(t,e,n){let a={...VA(),[e]:n};return new vr("auth","Firebase",a).create(e,{appName:t.name})}function yi(t){return FA(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function QI(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return UA.create(t,...e)}function ee(t,e,...n){if(!t)throw QI(e,...n)}function ka(t){let e="INTERNAL ASSERTION FAILED: "+t;throw dh(e),new Error(e)}function br(t,e){t||ka(e)}function kI(){return typeof self<"u"&&self.location?.href||""}function PM(){return IA()==="http:"||IA()==="https:"}function IA(){return typeof self<"u"&&self.location?.protocol||null}function OM(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(PM()||$L()||"connection"in navigator)?navigator.onLine:!0}function MM(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var Ii=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,br(n>e,"Short delay should be less than long delay!"),this.isMobile=YL()||JL()}get(){return OM()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function $I(t,e){br(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var yh=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ka("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ka("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ka("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var NM={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var VM=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],UM=new Ii(3e4,6e4);function Vt(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function Qt(t,e,n,a,r={}){return BA(t,r,async()=>{let s={},i={};a&&(e==="GET"?i=a:s={body:JSON.stringify(a)});let l=qo({key:t.config.apiKey,...i}).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:u,...s};return QL()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&La(t.emulatorConfig.host)&&(c.credentials="include"),yh.fetch()(await qA(t,t.config.apiHost,n,l),c)})}async function BA(t,e,n){t._canInitEmulator=!1;let a={...NM,...e};try{let r=new DI(t),s=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let i=await s.json();if("needConfirmation"in i)throw Zu(t,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{let l=s.ok?i.errorMessage:i.error.message,[u,c]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Zu(t,"credential-already-in-use",i);if(u==="EMAIL_EXISTS")throw Zu(t,"email-already-in-use",i);if(u==="USER_DISABLED")throw Zu(t,"user-disabled",i);let f=a[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw FA(t,f,c);ra(t,f)}}catch(r){if(r instanceof rn)throw r;ra(t,"network-request-failed",{message:String(r)})}}async function Ti(t,e,n,a,r={}){let s=await Qt(t,e,n,a,r);return"mfaPendingCredential"in s&&ra(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function qA(t,e,n,a){let r=`${e}${n}?${a}`,s=t,i=s.config.emulator?$I(t.config,r):`${t.config.apiScheme}://${r}`;return VM.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(i).toString():i}function FM(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var DI=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(Da(this.auth,"network-request-failed")),UM.get())})}};function Zu(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=Da(t,e,a);return r.customData._tokenResponse=n,r}function _A(t){return t!==void 0&&t.enterprise!==void 0}var Ih=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return FM(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function zA(t,e){return Qt(t,"GET","/v2/recaptchaConfig",Vt(t,e))}async function BM(t,e){return Qt(t,"POST","/v1/accounts:delete",e)}async function _h(t,e){return Qt(t,"POST","/v1/accounts:lookup",e)}function ec(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function HA(t,e=!1){let n=Nt(t),a=await n.getIdToken(e),r=JI(a);ee(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let s=typeof r.firebase=="object"?r.firebase:void 0,i=s?.sign_in_provider;return{claims:r,token:a,authTime:ec(CI(r.auth_time)),issuedAtTime:ec(CI(r.iat)),expirationTime:ec(CI(r.exp)),signInProvider:i||null,signInSecondFactor:s?.sign_in_second_factor||null}}function CI(t){return Number(t)*1e3}function JI(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return dh("JWT malformed, contained fewer than 3 sections"),null;try{let r=ah(n);return r?JSON.parse(r):(dh("Failed to decode base64 JWT payload"),null)}catch(r){return dh("Caught error parsing JWT payload as JSON",r?.toString()),null}}function SA(t){let e=JI(t);return ee(e,"internal-error"),ee(typeof e.exp<"u","internal-error"),ee(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function rc(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof rn&&qM(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function qM({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var PI=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var sc=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ec(this.lastLoginAt),this.creationTime=ec(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function Sh(t){let e=t.auth,n=await t.getIdToken(),a=await rc(t,_h(e,{idToken:n}));ee(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let s=r.providerUserInfo?.length?jA(r.providerUserInfo):[],i=zM(t.providerData,s),l=t.isAnonymous,u=!(t.email&&r.passwordHash)&&!i?.length,c=l?u:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new sc(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function GA(t){let e=Nt(t);await Sh(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function zM(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function jA(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function HM(t,e){let n=await BA(t,{},async()=>{let a=qo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,i=await qA(t,r,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";let u={method:"POST",headers:l,body:a};return t.emulatorConfig&&La(t.emulatorConfig.host)&&(u.credentials="include"),yh.fetch()(i,u)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function GM(t,e){return Qt(t,"POST","/v2/accounts:revokeToken",Vt(t,e))}var tc=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ee(e.idToken,"internal-error"),ee(typeof e.idToken<"u","internal-error"),ee(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):SA(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ee(e.length!==0,"internal-error");let n=SA(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ee(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:s}=await HM(e,n);this.updateTokensAndExpiration(a,r,Number(s))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:s}=n,i=new t;return a&&(ee(typeof a=="string","internal-error",{appName:e}),i.refreshToken=a),r&&(ee(typeof r=="string","internal-error",{appName:e}),i.accessToken=r),s&&(ee(typeof s=="number","internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return ka("not implemented")}};function Rs(t,e){ee(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var ks=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new PI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new sc(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await rc(this,this.stsTokenManager.getToken(this.auth,e));return ee(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return HA(this,e)}reload(){return GA(this)}_assign(e){this!==e&&(ee(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){ee(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await Sh(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(yn(this.auth.app))return Promise.reject(yi(this.auth));let e=await this.getIdToken();return await rc(this,BM(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,s=n.phoneNumber??void 0,i=n.photoURL??void 0,l=n.tenantId??void 0,u=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:v,providerData:R,stsTokenManager:D}=n;ee(p&&D,e,"internal-error");let x=tc.fromJSON(this.name,D);ee(typeof p=="string",e,"internal-error"),Rs(a,e.name),Rs(r,e.name),ee(typeof m=="boolean",e,"internal-error"),ee(typeof v=="boolean",e,"internal-error"),Rs(s,e.name),Rs(i,e.name),Rs(l,e.name),Rs(u,e.name),Rs(c,e.name),Rs(f,e.name);let T=new t({uid:p,auth:e,email:r,emailVerified:m,displayName:a,isAnonymous:v,photoURL:i,phoneNumber:s,tenantId:l,stsTokenManager:x,createdAt:c,lastLoginAt:f});return R&&Array.isArray(R)&&(T.providerData=R.map(E=>({...E}))),u&&(T._redirectEventId=u),T}static async _fromIdTokenResponse(e,n,a=!1){let r=new tc;r.updateFromServerResponse(n);let s=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await Sh(s),s}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];ee(r.localId!==void 0,"internal-error");let s=r.providerUserInfo!==void 0?jA(r.providerUserInfo):[],i=!(r.email&&r.passwordHash)&&!s?.length,l=new tc;l.updateFromIdToken(a);let u=new t({uid:r.localId,auth:e,stsTokenManager:l,isAnonymous:i}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new sc(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!s?.length};return Object.assign(u,c),u}};var vA=new Map;function Tr(t){br(t instanceof Function,"Expected a class definition");let e=vA.get(t);return e?(br(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,vA.set(t,e),e)}var vh=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};vh.type="NONE";var OI=vh;function fh(t,e,n){return`firebase:${t}:${e}:${n}`}var Eh=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:s}=this.auth;this.fullUserKey=fh(this.userKey,r.apiKey,s),this.fullPersistenceKey=fh("persistence",r.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await _h(this.auth,{idToken:e}).catch(()=>{});return n?ks._fromGetAccountInfoResponse(this.auth,n,e):null}return ks._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(Tr(OI),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),s=r[0]||Tr(OI),i=fh(a,e.config.apiKey,e.name),l=null;for(let c of n)try{let f=await c._get(i);if(f){let p;if(typeof f=="string"){let m=await _h(e,{idToken:f}).catch(()=>{});if(!m)break;p=await ks._fromGetAccountInfoResponse(e,m,f)}else p=ks._fromJSON(e,f);c!==s&&(l=p),s=c;break}}catch{}let u=r.filter(c=>c._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new t(s,e,a):(s=u[0],l&&await s._set(i,l.toJSON()),await Promise.all(n.map(async c=>{if(c!==s)try{await c._remove(i)}catch{}})),new t(s,e,a))}};function EA(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(YA(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(KA(e))return"Firefox";if(e.includes("silk/"))return"Silk";if($A(e))return"Blackberry";if(JA(e))return"Webos";if(WA(e))return"Safari";if((e.includes("chrome/")||XA(e))&&!e.includes("edge/"))return"Chrome";if(QA(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function KA(t=Mt()){return/firefox\//i.test(t)}function WA(t=Mt()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function XA(t=Mt()){return/crios\//i.test(t)}function YA(t=Mt()){return/iemobile/i.test(t)}function QA(t=Mt()){return/android/i.test(t)}function $A(t=Mt()){return/blackberry/i.test(t)}function JA(t=Mt()){return/webos/i.test(t)}function ZI(t=Mt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function jM(t=Mt()){return ZI(t)&&!!window.navigator?.standalone}function KM(){return ZL()&&document.documentMode===10}function ZA(t=Mt()){return ZI(t)||QA(t)||JA(t)||$A(t)||/windows phone/i.test(t)||YA(t)}function ex(t,e=[]){let n;switch(t){case"Browser":n=EA(Mt());break;case"Worker":n=`${EA(Mt())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Ra}/${a}`}var MI=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=s=>new Promise((i,l)=>{try{let u=e(s);i(u)}catch(u){l(u)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function WM(t,e={}){return Qt(t,"GET","/v2/passwordPolicy",Vt(t,e))}var XM=6,NI=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??XM,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};var VI=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Th(this),this.idTokenSubscription=new Th(this),this.beforeStateQueue=new MI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=UA,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Tr(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Eh.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await _h(this,{idToken:e}),a=await ks._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(yn(this.app)){let s=this.app.settings.authIdToken;return s?new Promise(i=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(s).then(i,i))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let s=this.redirectUser?._redirectEventId,i=a?._redirectEventId,l=await this.tryRedirectSignIn(e);(!s||s===i)&&l?.user&&(a=l.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(s){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(s))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return ee(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Sh(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=MM()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(yn(this.app))return Promise.reject(yi(this));let n=e?Nt(e):null;return n&&ee(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ee(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return yn(this.app)?Promise.reject(yi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return yn(this.app)?Promise.reject(yi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Tr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await WM(this),n=new NI(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new vr("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await GM(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&Tr(e)||this._popupRedirectResolver;ee(n,this,"argument-error"),this.redirectPersistenceManager=await Eh.create(this,[Tr(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let s=typeof n=="function"?n:n.next.bind(n),i=!1,l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ee(l,this,"internal-error"),l.then(()=>{i||s(this.currentUser)}),typeof n=="function"){let u=e.addObserver(n,a,r);return()=>{i=!0,u()}}else{let u=e.addObserver(n);return()=>{i=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ee(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ex(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(yn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&DM(`Error while retrieving App Check token: ${e.error}`),e?.token}};function Wo(t){return Nt(t)}var Th=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=aA(n=>this.observer=n)}get next(){return ee(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var qh={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function YM(t){qh=t}function tx(t){return qh.loadJS(t)}function QM(){return qh.recaptchaEnterpriseScript}function $M(){return qh.gapiScript}function nx(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var UI=class{constructor(){this.enterprise=new FI}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},FI=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var JM="recaptcha-enterprise",nc="NO_RECAPTCHA",bh=class{constructor(e){this.type=JM,this.auth=Wo(e)}async verify(e="verify",n=!1){async function a(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(i,l)=>{zA(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{let c=new Ih(u);return s.tenantId==null?s._agentRecaptchaConfig=c:s._tenantRecaptchaConfigs[s.tenantId]=c,i(c.siteKey)}}).catch(u=>{l(u)})})}function r(s,i,l){let u=window.grecaptcha;_A(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(c=>{i(c)}).catch(()=>{i(nc)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new UI().execute("siteKey",{action:"verify"}):new Promise((s,i)=>{a(this.auth).then(l=>{if(!n&&_A(window.grecaptcha))r(l,s,i);else{if(typeof window>"u"){i(new Error("RecaptchaVerifier is only supported in browser"));return}let u=QM();u.length!==0&&(u+=l),tx(u).then(()=>{r(l,s,i)}).catch(c=>{i(c)})}}).catch(l=>{i(l)})})}};async function Ju(t,e,n,a=!1,r=!1){let s=new bh(t),i;if(r)i=nc;else try{i=await s.verify(n)}catch{i=await s.verify(n,!0)}let l={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){let u=l.phoneEnrollmentInfo.phoneNumber,c=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:c,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){let u=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return a?Object.assign(l,{captchaResp:i}):Object.assign(l,{captchaResponse:i}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function ac(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let s=await Ju(t,e,n,n==="getOobCode");return a(t,s)}else return a(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let i=await Ju(t,e,n,n==="getOobCode");return a(t,i)}else return Promise.reject(s)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let s=await Ju(t,e,n);return a(t,s).catch(async i=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(i.code==="auth/missing-recaptcha-token"||i.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let l=await Ju(t,e,n,!1,!0);return a(t,l)}return Promise.reject(i)})}else{let s=await Ju(t,e,n,!1,!0);return a(t,s)}else return Promise.reject(r+" provider is not supported.")}async function ZM(t){let e=Wo(t),n=await zA(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),a=new Ih(n);e.tenantId==null?e._agentRecaptchaConfig=a:e._tenantRecaptchaConfigs[e.tenantId]=a,a.isAnyProviderEnabled()&&new bh(e).verify()}function ax(t,e){let n=gi(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),s=n.getOptions();if(aa(s,e??{}))return r;ra(r,"already-initialized")}return n.initialize({options:e})}function e2(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(Tr);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function rx(t,e,n){let a=Wo(t);ee(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,s=sx(e),{host:i,port:l}=t2(e),u=l===null?"":`:${l}`,c={url:`${s}//${i}${u}/`},f=Object.freeze({host:i,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){ee(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),ee(aa(c,a.config.emulator)&&aa(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,La(i)?(Fo(`${s}//${i}${u}`),Bo("Auth",!0)):r||n2()}function sx(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function t2(t){let e=sx(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let s=r[1];return{host:s,port:TA(a.substr(s.length+1))}}else{let[s,i]=a.split(":");return{host:s,port:TA(i)}}}function TA(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function n2(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var _i=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return ka("not implemented")}_getIdTokenResponse(e){return ka("not implemented")}_linkToIdToken(e,n){return ka("not implemented")}_getReauthenticationResolver(e){return ka("not implemented")}};async function a2(t,e){return Qt(t,"POST","/v1/accounts:signUp",e)}async function r2(t,e){return Ti(t,"POST","/v1/accounts:signInWithPassword",Vt(t,e))}async function s2(t,e){return Ti(t,"POST","/v1/accounts:signInWithEmailLink",Vt(t,e))}async function i2(t,e){return Ti(t,"POST","/v1/accounts:signInWithEmailLink",Vt(t,e))}var ic=class t extends _i{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ac(e,n,"signInWithPassword",r2,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return s2(e,{email:this._email,oobCode:this._password});default:ra(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ac(e,a,"signUpPassword",a2,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return i2(e,{idToken:n,email:this._email,oobCode:this._password});default:ra(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function jo(t,e){return Ti(t,"POST","/v1/accounts:signInWithIdp",Vt(t,e))}var o2="http://localhost",Si=class t extends _i{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):ra("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...s}=n;if(!a||!r)return null;let i=new t(a,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){let n=this.buildRequest();return jo(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,jo(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,jo(e,n)}buildRequest(){let e={requestUri:o2,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=qo(n)}return e}};async function bA(t,e){return Qt(t,"POST","/v1/accounts:sendVerificationCode",Vt(t,e))}async function l2(t,e){return Ti(t,"POST","/v1/accounts:signInWithPhoneNumber",Vt(t,e))}async function u2(t,e){let n=await Ti(t,"POST","/v1/accounts:signInWithPhoneNumber",Vt(t,e));if(n.temporaryProof)throw Zu(t,"account-exists-with-different-credential",n);return n}var c2={USER_NOT_FOUND:"user-not-found"};async function d2(t,e){let n={...e,operation:"REAUTH"};return Ti(t,"POST","/v1/accounts:signInWithPhoneNumber",Vt(t,n),c2)}var oc=class t extends _i{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new t({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new t({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return l2(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return u2(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return d2(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:n,verificationId:a,verificationCode:r}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:a,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s}=e;return!a&&!n&&!r&&!s?null:new t({verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s})}};function f2(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function h2(t){let e=zo(Ho(t)).link,n=e?zo(Ho(e)).deep_link_id:null,a=zo(Ho(t)).deep_link_id;return(a?zo(Ho(a)).link:null)||a||n||e||t}var wh=class t{constructor(e){let n=zo(Ho(e)),a=n.apiKey??null,r=n.oobCode??null,s=f2(n.mode??null);ee(a&&r&&s,"argument-error"),this.apiKey=a,this.operation=s,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=h2(e);try{return new t(n)}catch{return null}}};var Ko=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return ic._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=wh.parseLink(n);return ee(a,"argument-error"),ic._fromEmailAndCode(e,a.code,a.tenantId)}};Ko.PROVIDER_ID="password";Ko.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Ko.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var Ch=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var vi=class extends Ch{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var lc=class t extends vi{constructor(){super("facebook.com")}static credential(e){return Si._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};lc.FACEBOOK_SIGN_IN_METHOD="facebook.com";lc.PROVIDER_ID="facebook.com";var uc=class t extends vi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Si._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};uc.GOOGLE_SIGN_IN_METHOD="google.com";uc.PROVIDER_ID="google.com";var cc=class t extends vi{constructor(){super("github.com")}static credential(e){return Si._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};cc.GITHUB_SIGN_IN_METHOD="github.com";cc.PROVIDER_ID="github.com";var dc=class t extends vi{constructor(){super("twitter.com")}static credential(e,n){return Si._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};dc.TWITTER_SIGN_IN_METHOD="twitter.com";dc.PROVIDER_ID="twitter.com";var fc=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,a,r=!1){let s=await ks._fromIdTokenResponse(e,a,r),i=wA(a);return new t({user:s,providerId:i,_tokenResponse:a,operationType:n})}static async _forOperation(e,n,a){await e._updateTokensIfNecessary(a,!0);let r=wA(a);return new t({user:e,providerId:r,_tokenResponse:a,operationType:n})}};function wA(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var BI=class t extends rn{constructor(e,n,a,r){super(n.code,n.message),this.operationType=a,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:a}}static _fromErrorAndOperation(e,n,a,r){return new t(e,n,a,r)}};function ix(t,e,n,a){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?BI._fromErrorAndOperation(t,s,e,a):s})}async function p2(t,e,n=!1){let a=await rc(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return fc._forOperation(t,"link",a)}async function m2(t,e,n=!1){let{auth:a}=t;if(yn(a.app))return Promise.reject(yi(a));let r="reauthenticate";try{let s=await rc(t,ix(a,r,e,t),n);ee(s.idToken,a,"internal-error");let i=JI(s.idToken);ee(i,a,"internal-error");let{sub:l}=i;return ee(t.uid===l,a,"user-mismatch"),fc._forOperation(t,r,s)}catch(s){throw s?.code==="auth/user-not-found"&&ra(a,"user-mismatch"),s}}async function g2(t,e,n=!1){if(yn(t.app))return Promise.reject(yi(t));let a="signIn",r=await ix(t,a,e),s=await fc._fromIdTokenResponse(t,a,r);return n||await t._updateCurrentUser(s.user),s}function ox(t,e,n,a){return Nt(t).onIdTokenChanged(e,n,a)}function lx(t,e,n){return Nt(t).beforeAuthStateChanged(e,n)}function CA(t,e){return Qt(t,"POST","/v2/accounts/mfaEnrollment:start",Vt(t,e))}function y2(t,e){return Qt(t,"POST","/v2/accounts/mfaEnrollment:finalize",Vt(t,e))}function I2(t,e){return Qt(t,"POST","/v2/accounts/mfaEnrollment:start",Vt(t,e))}function _2(t,e){return Qt(t,"POST","/v2/accounts/mfaEnrollment:finalize",Vt(t,e))}var Lh="__sak";var Ah=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Lh,"1"),this.storage.removeItem(Lh),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){let n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var S2=1e3,v2=10,xh=class extends Ah{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=ZA(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let n of Object.keys(this.listeners)){let a=this.storage.getItem(n),r=this.localCache[n];a!==r&&e(n,r,a)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((i,l,u)=>{this.notifyListeners(i,u)});return}let a=e.key;n?this.detachListener():this.stopPolling();let r=()=>{let i=this.storage.getItem(a);!n&&this.localCache[a]===i||this.notifyListeners(a,i)},s=this.storage.getItem(a);KM()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,v2):r()}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,a)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:a}),!0)})},S2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){let n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};xh.type="LOCAL";var ux=xh;var E2=1e3;function LI(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${e}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function AI(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var qI=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let n=new URL(`${window.location.origin}/__cookies__`);return n.searchParams.set("finalTarget",e),n}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,n){}async _get(e){if(!this._isAvailable())return null;let n=AI(e);return window.cookieStore?(await window.cookieStore.get(n))?.value:LI(n)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let a=AI(e);document.cookie=`${a}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,n){if(!this._isAvailable())return;let a=AI(e);if(window.cookieStore){let l=c=>{let f=c.changed.find(m=>m.name===a);f&&n(f.value),c.deleted.find(m=>m.name===a)&&n(null)},u=()=>window.cookieStore.removeEventListener("change",l);return this.listenerUnsubscribes.set(n,u),window.cookieStore.addEventListener("change",l)}let r=LI(a),s=setInterval(()=>{let l=LI(a);l!==r&&(n(l),r=l)},E2),i=()=>clearInterval(s);this.listenerUnsubscribes.set(n,i)}_removeListener(e,n){let a=this.listenerUnsubscribes.get(n);a&&(a(),this.listenerUnsubscribes.delete(n))}};qI.type="COOKIE";var Rh=class extends Ah{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};Rh.type="SESSION";var e_=Rh;function T2(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var kh=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:s}=n.data,i=this.handlersMap[r];if(!i?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let l=Array.from(i).map(async c=>c(n.origin,s)),u=await T2(l);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};kh.receivers=[];function t_(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var zI=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((l,u)=>{let c=t_("",20);r.port1.start();let f=setTimeout(()=>{u(new Error("unsupported_event"))},a);i={messageChannel:r,onMessage(p){let m=p;if(m.data.eventId===c)switch(m.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(m.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}};function Pa(){return window}function b2(t){Pa().location.href=t}function cx(){return typeof Pa().WorkerGlobalScope<"u"&&typeof Pa().importScripts=="function"}async function w2(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function C2(){return navigator?.serviceWorker?.controller||null}function L2(){return cx()?self:null}var dx="firebaseLocalStorageDb",A2=1,Dh="firebaseLocalStorage",fx="fbase_key",Ei=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function zh(t,e){return t.transaction([Dh],e?"readwrite":"readonly").objectStore(Dh)}function x2(){let t=indexedDB.deleteDatabase(dx);return new Ei(t).toPromise()}function HI(){let t=indexedDB.open(dx,A2);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Dh,{keyPath:fx})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Dh)?e(a):(a.close(),await x2(),e(await HI()))})})}async function LA(t,e,n){let a=zh(t,!0).put({[fx]:e,value:n});return new Ei(a).toPromise()}async function R2(t,e){let n=zh(t,!1).get(e),a=await new Ei(n).toPromise();return a===void 0?null:a.value}function AA(t,e){let n=zh(t,!0).delete(e);return new Ei(n).toPromise()}var k2=800,D2=3,Ph=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await HI(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>D2)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return cx()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=kh._getInstance(L2()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await w2(),!this.activeServiceWorker)return;this.sender=new zI(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||C2()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await HI();return await LA(e,Lh,"1"),await AA(e,Lh),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>LA(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>R2(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>AA(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let s=zh(r,!1).getAll();return new Ei(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:s}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),k2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Ph.type="LOCAL";var hx=Ph;function xA(t,e){return Qt(t,"POST","/v2/accounts/mfaSignIn:start",Vt(t,e))}function P2(t,e){return Qt(t,"POST","/v2/accounts/mfaSignIn:finalize",Vt(t,e))}function O2(t,e){return Qt(t,"POST","/v2/accounts/mfaSignIn:finalize",Vt(t,e))}var sq=nx("rcb"),iq=new Ii(3e4,6e4);var hh="recaptcha";async function M2(t,e,n){if(!t._getRecaptchaConfig())try{await ZM(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let a;if(typeof e=="string"?a={phoneNumber:e}:a=e,"session"in a){let r=a.session;if("phoneNumber"in a){ee(r.type==="enroll",t,"internal-error");let s={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await ac(t,s,"mfaSmsEnrollment",async(c,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===nc){ee(n?.type===hh,c,"argument-error");let p=await xI(c,f,n);return CA(c,p)}return CA(c,f)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).phoneSessionInfo.sessionInfo}else{ee(r.type==="signin",t,"internal-error");let s=a.multiFactorHint?.uid||a.multiFactorUid;ee(s,t,"missing-multi-factor-info");let i={mfaPendingCredential:r.credential,mfaEnrollmentId:s,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await ac(t,i,"mfaSmsSignIn",async(f,p)=>{if(p.phoneSignInInfo.captchaResponse===nc){ee(n?.type===hh,f,"argument-error");let m=await xI(f,p,n);return xA(f,m)}return xA(f,p)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await ac(t,r,"sendVerificationCode",async(u,c)=>{if(c.captchaResponse===nc){ee(n?.type===hh,u,"argument-error");let f=await xI(u,c,n);return bA(u,f)}return bA(u,c)},"PHONE_PROVIDER").catch(u=>Promise.reject(u))).sessionInfo}}finally{n?._reset()}}async function xI(t,e,n){ee(n.type===hh,t,"argument-error");let a=await n.verify();ee(typeof a=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let s=r.phoneEnrollmentInfo.phoneNumber,i=r.phoneEnrollmentInfo.captchaResponse,l=r.phoneEnrollmentInfo.clientType,u=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:a,captchaResponse:i,clientType:l,recaptchaVersion:u}}),r}else if("phoneSignInInfo"in r){let s=r.phoneSignInInfo.captchaResponse,i=r.phoneSignInInfo.clientType,l=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:a,captchaResponse:s,clientType:i,recaptchaVersion:l}}),r}else return Object.assign(r,{recaptchaToken:a}),r}var hc=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=Wo(e)}verifyPhoneNumber(e,n){return M2(this.auth,e,Nt(n))}static credential(e,n){return oc._fromVerification(e,n)}static credentialFromResult(e){let n=e;return t.credentialFromTaggedObject(n)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:n,temporaryProof:a}=e;return n&&a?oc._fromTokenResponse(n,a):null}};hc.PROVIDER_ID="phone";hc.PHONE_SIGN_IN_METHOD="phone";function N2(t,e){return e?Tr(e):(ee(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var pc=class extends _i{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return jo(e,this._buildIdpRequest())}_linkToIdToken(e,n){return jo(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return jo(e,this._buildIdpRequest())}_buildIdpRequest(e){let n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function V2(t){return g2(t.auth,new pc(t),t.bypassAuthState)}function U2(t){let{auth:e,user:n}=t;return ee(n,e,"internal-error"),m2(n,new pc(t),t.bypassAuthState)}async function F2(t){let{auth:e,user:n}=t;return ee(n,e,"internal-error"),p2(n,new pc(t),t.bypassAuthState)}var Oh=class{constructor(e,n,a,r,s=!1){this.auth=e,this.resolver=a,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(a){this.reject(a)}})}async onAuthEvent(e){let{urlResponse:n,sessionId:a,postBody:r,tenantId:s,error:i,type:l}=e;if(i){this.reject(i);return}let u={auth:this.auth,requestUri:n,sessionId:a,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return V2;case"linkViaPopup":case"linkViaRedirect":return F2;case"reauthViaPopup":case"reauthViaRedirect":return U2;default:ra(this.auth,"internal-error")}}resolve(e){br(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){br(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var B2=new Ii(2e3,1e4);var GI=class t extends Oh{constructor(e,n,a,r,s){super(e,n,r,s),this.provider=a,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return ee(e,this.auth,"internal-error"),e}async onExecution(){br(this.filter.length===1,"Popup operations only handle one event");let e=t_();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Da(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(Da(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Da(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,B2.get())};e()}};GI.currentPopupAction=null;var q2="pendingRedirect",ph=new Map,jI=class extends Oh{constructor(e,n,a=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,a),this.eventId=null}async execute(){let e=ph.get(this.auth._key());if(!e){try{let a=await z2(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(a)}catch(n){e=()=>Promise.reject(n)}ph.set(this.auth._key(),e)}return this.bypassAuthState||ph.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function z2(t,e){let n=j2(e),a=G2(t);if(!await a._isAvailable())return!1;let r=await a._get(n)==="true";return await a._remove(n),r}function H2(t,e){ph.set(t._key(),e)}function G2(t){return Tr(t._redirectPersistence)}function j2(t){return fh(q2,t.config.apiKey,t.name)}async function K2(t,e,n=!1){if(yn(t.app))return Promise.reject(yi(t));let a=Wo(t),r=N2(a,e),i=await new jI(a,r,n).execute();return i&&!n&&(delete i.user._redirectEventId,await a._persistUserIfCurrent(i.user),await a._setRedirectUser(null,e)),i}var W2=10*60*1e3,KI=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(a=>{this.isEventForConsumer(e,a)&&(n=!0,this.sendToConsumer(e,a),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!X2(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!px(e)){let a=e.error.code?.split("auth/")[1]||"internal-error";n.onError(Da(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){let a=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&a}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=W2&&this.cachedEventUids.clear(),this.cachedEventUids.has(RA(e))}saveEventToCache(e){this.cachedEventUids.add(RA(e)),this.lastProcessedEventTime=Date.now()}};function RA(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function px({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function X2(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return px(t);default:return!1}}async function Y2(t,e={}){return Qt(t,"GET","/v1/projects",e)}var Q2=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,$2=/^https?/;async function J2(t){if(t.config.emulator)return;let{authorizedDomains:e}=await Y2(t);for(let n of e)try{if(Z2(n))return}catch{}ra(t,"unauthorized-domain")}function Z2(t){let e=kI(),{protocol:n,hostname:a}=new URL(e);if(t.startsWith("chrome-extension://")){let i=new URL(t);return i.hostname===""&&a===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&i.hostname===a}if(!$2.test(n))return!1;if(Q2.test(t))return a===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(a)}var eN=new Ii(3e4,6e4);function kA(){let t=Pa().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function tN(t){return new Promise((e,n)=>{function a(){kA(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{kA(),n(Da(t,"network-request-failed"))},timeout:eN.get()})}if(Pa().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(Pa().gapi?.load)a();else{let r=nx("iframefcb");return Pa()[r]=()=>{gapi.load?a():n(Da(t,"network-request-failed"))},tx(`${$M()}?onload=${r}`).catch(s=>n(s))}}).catch(e=>{throw mh=null,e})}var mh=null;function nN(t){return mh=mh||tN(t),mh}var aN=new Ii(5e3,15e3),rN="__/auth/iframe",sN="emulator/auth/iframe",iN={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},oN=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function lN(t){let e=t.config;ee(e.authDomain,t,"auth-domain-config-required");let n=e.emulator?$I(e,sN):`https://${t.config.authDomain}/${rN}`,a={apiKey:e.apiKey,appName:t.name,v:Ra},r=oN.get(t.config.apiHost);r&&(a.eid=r);let s=t._getFrameworks();return s.length&&(a.fw=s.join(",")),`${n}?${qo(a).slice(1)}`}async function uN(t){let e=await nN(t),n=Pa().gapi;return ee(n,t,"internal-error"),e.open({where:document.body,url:lN(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:iN,dontclear:!0},a=>new Promise(async(r,s)=>{await a.restyle({setHideOnLeave:!1});let i=Da(t,"network-request-failed"),l=Pa().setTimeout(()=>{s(i)},aN.get());function u(){Pa().clearTimeout(l),r(a)}a.ping(u).then(u,()=>{s(i)})}))}var cN={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},dN=500,fN=600,hN="_blank",pN="http://localhost",Mh=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function mN(t,e,n,a=dN,r=fN){let s=Math.max((window.screen.availHeight-r)/2,0).toString(),i=Math.max((window.screen.availWidth-a)/2,0).toString(),l="",u={...cN,width:a.toString(),height:r.toString(),top:s,left:i},c=Mt().toLowerCase();n&&(l=XA(c)?hN:n),KA(c)&&(e=e||pN,u.scrollbars="yes");let f=Object.entries(u).reduce((m,[v,R])=>`${m}${v}=${R},`,"");if(jM(c)&&l!=="_self")return gN(e||"",l),new Mh(null);let p=window.open(e||"",l,f);ee(p,t,"popup-blocked");try{p.focus()}catch{}return new Mh(p)}function gN(t,e){let n=document.createElement("a");n.href=t,n.target=e;let a=document.createEvent("MouseEvent");a.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(a)}var yN="__/auth/handler",IN="emulator/auth/handler",_N=encodeURIComponent("fac");async function DA(t,e,n,a,r,s){ee(t.config.authDomain,t,"auth-domain-config-required"),ee(t.config.apiKey,t,"invalid-api-key");let i={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:a,v:Ra,eventId:r};if(e instanceof Ch){e.setDefaultLanguage(t.languageCode),i.providerId=e.providerId||"",nA(e.getCustomParameters())||(i.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,p]of Object.entries(s||{}))i[f]=p}if(e instanceof vi){let f=e.getScopes().filter(p=>p!=="");f.length>0&&(i.scopes=f.join(","))}t.tenantId&&(i.tid=t.tenantId);let l=i;for(let f of Object.keys(l))l[f]===void 0&&delete l[f];let u=await t._getAppCheckToken(),c=u?`#${_N}=${encodeURIComponent(u)}`:"";return`${SN(t)}?${qo(l).slice(1)}${c}`}function SN({config:t}){return t.emulator?$I(t,IN):`https://${t.authDomain}/${yN}`}var RI="webStorageSupport",WI=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=e_,this._completeRedirectFn=K2,this._overrideRedirectResult=H2}async _openPopup(e,n,a,r){br(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let s=await DA(e,n,a,kI(),r);return mN(e,s,t_())}async _openRedirect(e,n,a,r){await this._originValidation(e);let s=await DA(e,n,a,kI(),r);return b2(s),new Promise(()=>{})}_initialize(e){let n=e._key();if(this.eventManagers[n]){let{manager:r,promise:s}=this.eventManagers[n];return r?Promise.resolve(r):(br(s,"If manager is not set, promise should be"),s)}let a=this.initAndGetManager(e);return this.eventManagers[n]={promise:a},a.catch(()=>{delete this.eventManagers[n]}),a}async initAndGetManager(e){let n=await uN(e),a=new KI(e);return n.register("authEvent",r=>(ee(r?.authEvent,e,"invalid-auth-event"),{status:a.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:a},this.iframes[e._key()]=n,a}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(RI,{type:RI},r=>{let s=r?.[0]?.[RI];s!==void 0&&n(!!s),ra(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=J2(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return ZA()||WA()||ZI()}},mx=WI,Nh=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return ka("unexpected MultiFactorSessionType")}}},XI=class t extends Nh{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,n,a){return y2(e,{idToken:n,displayName:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,n){return P2(e,{mfaPendingCredential:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Vh=class{constructor(){}static assertion(e){return XI._fromCredential(e)}};Vh.FACTOR_ID="phone";var Uh=class{static assertionForEnrollment(e,n){return Fh._fromSecret(e,n)}static assertionForSignIn(e,n){return Fh._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;ee(typeof n.user?.auth<"u","internal-error");let a=await I2(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return Bh._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Uh.FACTOR_ID="totp";var Fh=class t extends Nh{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return ee(typeof this.secret<"u",e,"argument-error"),_2(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){ee(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return O2(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},Bh=class t{constructor(e,n,a,r,s,i,l){this.sessionInfo=i,this.auth=l,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(ch(e)||ch(n))&&(a=!0),a&&(ch(e)&&(e=this.auth.currentUser?.email||"unknownuser"),ch(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function ch(t){return typeof t>"u"||t?.length===0}var PA="@firebase/auth",OA="1.12.1";var YI=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ee(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function vN(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function EN(t){xa(new mn("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:l}=a.options;ee(i&&!i.includes(":"),"invalid-api-key",{appName:a.name});let u={apiKey:i,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ex(t)},c=new VI(a,r,s,u);return e2(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),xa(new mn("auth-internal",e=>{let n=Wo(e.getProvider("auth").getImmediate());return(a=>new YI(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),gn(PA,OA,vN(t)),gn(PA,OA,"esm2020")}var TN=5*60,bN=uI("authIdTokenMaxAge")||TN,MA=null,wN=t=>async e=>{let n=e&&await e.getIdTokenResult(),a=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(a&&a>bN)return;let r=n?.token;MA!==r&&(MA=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function n_(t=Go()){let e=gi(t,"auth");if(e.isInitialized())return e.getImmediate();let n=ax(t,{popupRedirectResolver:mx,persistence:[hx,ux,e_]}),a=uI("authTokenSyncURL");if(a&&typeof isSecureContext=="boolean"&&isSecureContext){let s=new URL(a,location.origin);if(location.origin===s.origin){let i=wN(s.toString());lx(n,i,()=>i(n.currentUser)),ox(n,l=>i(l))}}let r=oI("auth");return r&&rx(n,`http://${r}`),n}function CN(){return document.getElementsByTagName("head")?.[0]??document}YM({loadJS(t){return new Promise((e,n)=>{let a=document.createElement("script");a.setAttribute("src",t),a.onload=e,a.onerror=r=>{let s=Da("internal-error");s.customData=r,n(s)},a.type="text/javascript",a.charset="UTF-8",CN().appendChild(a)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});EN("Browser");var gx=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},yx={};var wr,a_;(function(){var t;function e(y,g){function _(){}_.prototype=g.prototype,y.F=g.prototype,y.prototype=new _,y.prototype.constructor=y,y.D=function(b,w,A){for(var S=Array(arguments.length-2),$=2;$<arguments.length;$++)S[$-2]=arguments[$];return g.prototype[w].apply(b,S)}}function n(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(a,n),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(y,g,_){_||(_=0);let b=Array(16);if(typeof g=="string")for(var w=0;w<16;++w)b[w]=g.charCodeAt(_++)|g.charCodeAt(_++)<<8|g.charCodeAt(_++)<<16|g.charCodeAt(_++)<<24;else for(w=0;w<16;++w)b[w]=g[_++]|g[_++]<<8|g[_++]<<16|g[_++]<<24;g=y.g[0],_=y.g[1],w=y.g[2];let A=y.g[3],S;S=g+(A^_&(w^A))+b[0]+3614090360&4294967295,g=_+(S<<7&4294967295|S>>>25),S=A+(w^g&(_^w))+b[1]+3905402710&4294967295,A=g+(S<<12&4294967295|S>>>20),S=w+(_^A&(g^_))+b[2]+606105819&4294967295,w=A+(S<<17&4294967295|S>>>15),S=_+(g^w&(A^g))+b[3]+3250441966&4294967295,_=w+(S<<22&4294967295|S>>>10),S=g+(A^_&(w^A))+b[4]+4118548399&4294967295,g=_+(S<<7&4294967295|S>>>25),S=A+(w^g&(_^w))+b[5]+1200080426&4294967295,A=g+(S<<12&4294967295|S>>>20),S=w+(_^A&(g^_))+b[6]+2821735955&4294967295,w=A+(S<<17&4294967295|S>>>15),S=_+(g^w&(A^g))+b[7]+4249261313&4294967295,_=w+(S<<22&4294967295|S>>>10),S=g+(A^_&(w^A))+b[8]+1770035416&4294967295,g=_+(S<<7&4294967295|S>>>25),S=A+(w^g&(_^w))+b[9]+2336552879&4294967295,A=g+(S<<12&4294967295|S>>>20),S=w+(_^A&(g^_))+b[10]+4294925233&4294967295,w=A+(S<<17&4294967295|S>>>15),S=_+(g^w&(A^g))+b[11]+2304563134&4294967295,_=w+(S<<22&4294967295|S>>>10),S=g+(A^_&(w^A))+b[12]+1804603682&4294967295,g=_+(S<<7&4294967295|S>>>25),S=A+(w^g&(_^w))+b[13]+4254626195&4294967295,A=g+(S<<12&4294967295|S>>>20),S=w+(_^A&(g^_))+b[14]+2792965006&4294967295,w=A+(S<<17&4294967295|S>>>15),S=_+(g^w&(A^g))+b[15]+1236535329&4294967295,_=w+(S<<22&4294967295|S>>>10),S=g+(w^A&(_^w))+b[1]+4129170786&4294967295,g=_+(S<<5&4294967295|S>>>27),S=A+(_^w&(g^_))+b[6]+3225465664&4294967295,A=g+(S<<9&4294967295|S>>>23),S=w+(g^_&(A^g))+b[11]+643717713&4294967295,w=A+(S<<14&4294967295|S>>>18),S=_+(A^g&(w^A))+b[0]+3921069994&4294967295,_=w+(S<<20&4294967295|S>>>12),S=g+(w^A&(_^w))+b[5]+3593408605&4294967295,g=_+(S<<5&4294967295|S>>>27),S=A+(_^w&(g^_))+b[10]+38016083&4294967295,A=g+(S<<9&4294967295|S>>>23),S=w+(g^_&(A^g))+b[15]+3634488961&4294967295,w=A+(S<<14&4294967295|S>>>18),S=_+(A^g&(w^A))+b[4]+3889429448&4294967295,_=w+(S<<20&4294967295|S>>>12),S=g+(w^A&(_^w))+b[9]+568446438&4294967295,g=_+(S<<5&4294967295|S>>>27),S=A+(_^w&(g^_))+b[14]+3275163606&4294967295,A=g+(S<<9&4294967295|S>>>23),S=w+(g^_&(A^g))+b[3]+4107603335&4294967295,w=A+(S<<14&4294967295|S>>>18),S=_+(A^g&(w^A))+b[8]+1163531501&4294967295,_=w+(S<<20&4294967295|S>>>12),S=g+(w^A&(_^w))+b[13]+2850285829&4294967295,g=_+(S<<5&4294967295|S>>>27),S=A+(_^w&(g^_))+b[2]+4243563512&4294967295,A=g+(S<<9&4294967295|S>>>23),S=w+(g^_&(A^g))+b[7]+1735328473&4294967295,w=A+(S<<14&4294967295|S>>>18),S=_+(A^g&(w^A))+b[12]+2368359562&4294967295,_=w+(S<<20&4294967295|S>>>12),S=g+(_^w^A)+b[5]+4294588738&4294967295,g=_+(S<<4&4294967295|S>>>28),S=A+(g^_^w)+b[8]+2272392833&4294967295,A=g+(S<<11&4294967295|S>>>21),S=w+(A^g^_)+b[11]+1839030562&4294967295,w=A+(S<<16&4294967295|S>>>16),S=_+(w^A^g)+b[14]+4259657740&4294967295,_=w+(S<<23&4294967295|S>>>9),S=g+(_^w^A)+b[1]+2763975236&4294967295,g=_+(S<<4&4294967295|S>>>28),S=A+(g^_^w)+b[4]+1272893353&4294967295,A=g+(S<<11&4294967295|S>>>21),S=w+(A^g^_)+b[7]+4139469664&4294967295,w=A+(S<<16&4294967295|S>>>16),S=_+(w^A^g)+b[10]+3200236656&4294967295,_=w+(S<<23&4294967295|S>>>9),S=g+(_^w^A)+b[13]+681279174&4294967295,g=_+(S<<4&4294967295|S>>>28),S=A+(g^_^w)+b[0]+3936430074&4294967295,A=g+(S<<11&4294967295|S>>>21),S=w+(A^g^_)+b[3]+3572445317&4294967295,w=A+(S<<16&4294967295|S>>>16),S=_+(w^A^g)+b[6]+76029189&4294967295,_=w+(S<<23&4294967295|S>>>9),S=g+(_^w^A)+b[9]+3654602809&4294967295,g=_+(S<<4&4294967295|S>>>28),S=A+(g^_^w)+b[12]+3873151461&4294967295,A=g+(S<<11&4294967295|S>>>21),S=w+(A^g^_)+b[15]+530742520&4294967295,w=A+(S<<16&4294967295|S>>>16),S=_+(w^A^g)+b[2]+3299628645&4294967295,_=w+(S<<23&4294967295|S>>>9),S=g+(w^(_|~A))+b[0]+4096336452&4294967295,g=_+(S<<6&4294967295|S>>>26),S=A+(_^(g|~w))+b[7]+1126891415&4294967295,A=g+(S<<10&4294967295|S>>>22),S=w+(g^(A|~_))+b[14]+2878612391&4294967295,w=A+(S<<15&4294967295|S>>>17),S=_+(A^(w|~g))+b[5]+4237533241&4294967295,_=w+(S<<21&4294967295|S>>>11),S=g+(w^(_|~A))+b[12]+1700485571&4294967295,g=_+(S<<6&4294967295|S>>>26),S=A+(_^(g|~w))+b[3]+2399980690&4294967295,A=g+(S<<10&4294967295|S>>>22),S=w+(g^(A|~_))+b[10]+4293915773&4294967295,w=A+(S<<15&4294967295|S>>>17),S=_+(A^(w|~g))+b[1]+2240044497&4294967295,_=w+(S<<21&4294967295|S>>>11),S=g+(w^(_|~A))+b[8]+1873313359&4294967295,g=_+(S<<6&4294967295|S>>>26),S=A+(_^(g|~w))+b[15]+4264355552&4294967295,A=g+(S<<10&4294967295|S>>>22),S=w+(g^(A|~_))+b[6]+2734768916&4294967295,w=A+(S<<15&4294967295|S>>>17),S=_+(A^(w|~g))+b[13]+1309151649&4294967295,_=w+(S<<21&4294967295|S>>>11),S=g+(w^(_|~A))+b[4]+4149444226&4294967295,g=_+(S<<6&4294967295|S>>>26),S=A+(_^(g|~w))+b[11]+3174756917&4294967295,A=g+(S<<10&4294967295|S>>>22),S=w+(g^(A|~_))+b[2]+718787259&4294967295,w=A+(S<<15&4294967295|S>>>17),S=_+(A^(w|~g))+b[9]+3951481745&4294967295,y.g[0]=y.g[0]+g&4294967295,y.g[1]=y.g[1]+(w+(S<<21&4294967295|S>>>11))&4294967295,y.g[2]=y.g[2]+w&4294967295,y.g[3]=y.g[3]+A&4294967295}a.prototype.v=function(y,g){g===void 0&&(g=y.length);let _=g-this.blockSize,b=this.C,w=this.h,A=0;for(;A<g;){if(w==0)for(;A<=_;)r(this,y,A),A+=this.blockSize;if(typeof y=="string"){for(;A<g;)if(b[w++]=y.charCodeAt(A++),w==this.blockSize){r(this,b),w=0;break}}else for(;A<g;)if(b[w++]=y[A++],w==this.blockSize){r(this,b),w=0;break}}this.h=w,this.o+=g},a.prototype.A=function(){var y=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);y[0]=128;for(var g=1;g<y.length-8;++g)y[g]=0;g=this.o*8;for(var _=y.length-8;_<y.length;++_)y[_]=g&255,g/=256;for(this.v(y),y=Array(16),g=0,_=0;_<4;++_)for(let b=0;b<32;b+=8)y[g++]=this.g[_]>>>b&255;return y};function s(y,g){var _=l;return Object.prototype.hasOwnProperty.call(_,y)?_[y]:_[y]=g(y)}function i(y,g){this.h=g;let _=[],b=!0;for(let w=y.length-1;w>=0;w--){let A=y[w]|0;b&&A==g||(_[w]=A,b=!1)}this.g=_}var l={};function u(y){return-128<=y&&y<128?s(y,function(g){return new i([g|0],g<0?-1:0)}):new i([y|0],y<0?-1:0)}function c(y){if(isNaN(y)||!isFinite(y))return p;if(y<0)return x(c(-y));let g=[],_=1;for(let b=0;y>=_;b++)g[b]=y/_|0,_*=4294967296;return new i(g,0)}function f(y,g){if(y.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(y.charAt(0)=="-")return x(f(y.substring(1),g));if(y.indexOf("-")>=0)throw Error('number format error: interior "-" character');let _=c(Math.pow(g,8)),b=p;for(let A=0;A<y.length;A+=8){var w=Math.min(8,y.length-A);let S=parseInt(y.substring(A,A+w),g);w<8?(w=c(Math.pow(g,w)),b=b.j(w).add(c(S))):(b=b.j(_),b=b.add(c(S)))}return b}var p=u(0),m=u(1),v=u(16777216);t=i.prototype,t.m=function(){if(D(this))return-x(this).m();let y=0,g=1;for(let _=0;_<this.g.length;_++){let b=this.i(_);y+=(b>=0?b:4294967296+b)*g,g*=4294967296}return y},t.toString=function(y){if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(R(this))return"0";if(D(this))return"-"+x(this).toString(y);let g=c(Math.pow(y,6));var _=this;let b="";for(;;){let w=L(_,g).g;_=T(_,w.j(g));let A=((_.g.length>0?_.g[0]:_.h)>>>0).toString(y);if(_=w,R(_))return A+b;for(;A.length<6;)A="0"+A;b=A+b}},t.i=function(y){return y<0?0:y<this.g.length?this.g[y]:this.h};function R(y){if(y.h!=0)return!1;for(let g=0;g<y.g.length;g++)if(y.g[g]!=0)return!1;return!0}function D(y){return y.h==-1}t.l=function(y){return y=T(this,y),D(y)?-1:R(y)?0:1};function x(y){let g=y.g.length,_=[];for(let b=0;b<g;b++)_[b]=~y.g[b];return new i(_,~y.h).add(m)}t.abs=function(){return D(this)?x(this):this},t.add=function(y){let g=Math.max(this.g.length,y.g.length),_=[],b=0;for(let w=0;w<=g;w++){let A=b+(this.i(w)&65535)+(y.i(w)&65535),S=(A>>>16)+(this.i(w)>>>16)+(y.i(w)>>>16);b=S>>>16,A&=65535,S&=65535,_[w]=S<<16|A}return new i(_,_[_.length-1]&-2147483648?-1:0)};function T(y,g){return y.add(x(g))}t.j=function(y){if(R(this)||R(y))return p;if(D(this))return D(y)?x(this).j(x(y)):x(x(this).j(y));if(D(y))return x(this.j(x(y)));if(this.l(v)<0&&y.l(v)<0)return c(this.m()*y.m());let g=this.g.length+y.g.length,_=[];for(var b=0;b<2*g;b++)_[b]=0;for(b=0;b<this.g.length;b++)for(let w=0;w<y.g.length;w++){let A=this.i(b)>>>16,S=this.i(b)&65535,$=y.i(w)>>>16,Z=y.i(w)&65535;_[2*b+2*w]+=S*Z,E(_,2*b+2*w),_[2*b+2*w+1]+=A*Z,E(_,2*b+2*w+1),_[2*b+2*w+1]+=S*$,E(_,2*b+2*w+1),_[2*b+2*w+2]+=A*$,E(_,2*b+2*w+2)}for(y=0;y<g;y++)_[y]=_[2*y+1]<<16|_[2*y];for(y=g;y<2*g;y++)_[y]=0;return new i(_,0)};function E(y,g){for(;(y[g]&65535)!=y[g];)y[g+1]+=y[g]>>>16,y[g]&=65535,g++}function C(y,g){this.g=y,this.h=g}function L(y,g){if(R(g))throw Error("division by zero");if(R(y))return new C(p,p);if(D(y))return g=L(x(y),g),new C(x(g.g),x(g.h));if(D(g))return g=L(y,x(g)),new C(x(g.g),g.h);if(y.g.length>30){if(D(y)||D(g))throw Error("slowDivide_ only works with positive integers.");for(var _=m,b=g;b.l(y)<=0;)_=U(_),b=U(b);var w=N(_,1),A=N(b,1);for(b=N(b,2),_=N(_,2);!R(b);){var S=A.add(b);S.l(y)<=0&&(w=w.add(_),A=S),b=N(b,1),_=N(_,1)}return g=T(y,w.j(g)),new C(w,g)}for(w=p;y.l(g)>=0;){for(_=Math.max(1,Math.floor(y.m()/g.m())),b=Math.ceil(Math.log(_)/Math.LN2),b=b<=48?1:Math.pow(2,b-48),A=c(_),S=A.j(g);D(S)||S.l(y)>0;)_-=b,A=c(_),S=A.j(g);R(A)&&(A=m),w=w.add(A),y=T(y,S)}return new C(w,y)}t.B=function(y){return L(this,y).h},t.and=function(y){let g=Math.max(this.g.length,y.g.length),_=[];for(let b=0;b<g;b++)_[b]=this.i(b)&y.i(b);return new i(_,this.h&y.h)},t.or=function(y){let g=Math.max(this.g.length,y.g.length),_=[];for(let b=0;b<g;b++)_[b]=this.i(b)|y.i(b);return new i(_,this.h|y.h)},t.xor=function(y){let g=Math.max(this.g.length,y.g.length),_=[];for(let b=0;b<g;b++)_[b]=this.i(b)^y.i(b);return new i(_,this.h^y.h)};function U(y){let g=y.g.length+1,_=[];for(let b=0;b<g;b++)_[b]=y.i(b)<<1|y.i(b-1)>>>31;return new i(_,y.h)}function N(y,g){let _=g>>5;g%=32;let b=y.g.length-_,w=[];for(let A=0;A<b;A++)w[A]=g>0?y.i(A+_)>>>g|y.i(A+_+1)<<32-g:y.i(A+_);return new i(w,y.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,a_=yx.Md5=a,i.prototype.add=i.prototype.add,i.prototype.multiply=i.prototype.j,i.prototype.modulo=i.prototype.B,i.prototype.compare=i.prototype.l,i.prototype.toNumber=i.prototype.m,i.prototype.toString=i.prototype.toString,i.prototype.getBits=i.prototype.i,i.fromNumber=c,i.fromString=f,wr=yx.Integer=i}).apply(typeof gx<"u"?gx:typeof self<"u"?self:typeof window<"u"?window:{});var Hh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Cr={};var r_,LN,Xo,s_,mc,Gh,i_,o_,l_;(function(){var t,e=Object.defineProperty;function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Hh=="object"&&Hh];for(var d=0;d<o.length;++d){var h=o[d];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var a=n(this);function r(o,d){if(d)e:{var h=a;o=o.split(".");for(var I=0;I<o.length-1;I++){var k=o[I];if(!(k in h))break e;h=h[k]}o=o[o.length-1],I=h[o],d=d(I),d!=I&&d!=null&&e(h,o,{configurable:!0,writable:!0,value:d})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(d){var h=[],I;for(I in d)Object.prototype.hasOwnProperty.call(d,I)&&h.push([I,d[I]]);return h}});var s=s||{},i=this||self;function l(o){var d=typeof o;return d=="object"&&o!=null||d=="function"}function u(o,d,h){return o.call.apply(o.bind,arguments)}function c(o,d,h){return c=u,c.apply(null,arguments)}function f(o,d){var h=Array.prototype.slice.call(arguments,1);return function(){var I=h.slice();return I.push.apply(I,arguments),o.apply(this,I)}}function p(o,d){function h(){}h.prototype=d.prototype,o.Z=d.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(I,k,M){for(var W=Array(arguments.length-2),ge=2;ge<arguments.length;ge++)W[ge-2]=arguments[ge];return d.prototype[k].apply(I,W)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function v(o){let d=o.length;if(d>0){let h=Array(d);for(let I=0;I<d;I++)h[I]=o[I];return h}return[]}function R(o,d){for(let I=1;I<arguments.length;I++){let k=arguments[I];var h=typeof k;if(h=h!="object"?h:k?Array.isArray(k)?"array":h:"null",h=="array"||h=="object"&&typeof k.length=="number"){h=o.length||0;let M=k.length||0;o.length=h+M;for(let W=0;W<M;W++)o[h+W]=k[W]}else o.push(k)}}class D{constructor(d,h){this.i=d,this.j=h,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function x(o){i.setTimeout(()=>{throw o},0)}function T(){var o=y;let d=null;return o.g&&(d=o.g,o.g=o.g.next,o.g||(o.h=null),d.next=null),d}class E{constructor(){this.h=this.g=null}add(d,h){let I=C.get();I.set(d,h),this.h?this.h.next=I:this.g=I,this.h=I}}var C=new D(()=>new L,o=>o.reset());class L{constructor(){this.next=this.g=this.h=null}set(d,h){this.h=d,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let U,N=!1,y=new E,g=()=>{let o=Promise.resolve(void 0);U=()=>{o.then(_)}};function _(){for(var o;o=T();){try{o.h.call(o.g)}catch(h){x(h)}var d=C;d.j(o),d.h<100&&(d.h++,o.next=d.g,d.g=o)}N=!1}function b(){this.u=this.u,this.C=this.C}b.prototype.u=!1,b.prototype.dispose=function(){this.u||(this.u=!0,this.N())},b.prototype[Symbol.dispose]=function(){this.dispose()},b.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(o,d){this.type=o,this.g=this.target=d,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var A=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var o=!1,d=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let h=()=>{};i.addEventListener("test",h,d),i.removeEventListener("test",h,d)}catch{}return o}();function S(o){return/^[\s\xa0]*$/.test(o)}function $(o,d){w.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,d)}p($,w),$.prototype.init=function(o,d){let h=this.type=o.type,I=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=d,d=o.relatedTarget,d||(h=="mouseover"?d=o.fromElement:h=="mouseout"&&(d=o.toElement)),this.relatedTarget=d,I?(this.clientX=I.clientX!==void 0?I.clientX:I.pageX,this.clientY=I.clientY!==void 0?I.clientY:I.pageY,this.screenX=I.screenX||0,this.screenY=I.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&$.Z.h.call(this)},$.prototype.h=function(){$.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Z="closure_listenable_"+(Math.random()*1e6|0),se=0;function O(o,d,h,I,k){this.listener=o,this.proxy=null,this.src=d,this.type=h,this.capture=!!I,this.ha=k,this.key=++se,this.da=this.fa=!1}function P(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function V(o,d,h){for(let I in o)d.call(h,o[I],I,o)}function Q(o,d){for(let h in o)d.call(void 0,o[h],h,o)}function G(o){let d={};for(let h in o)d[h]=o[h];return d}let te="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Se(o,d){let h,I;for(let k=1;k<arguments.length;k++){I=arguments[k];for(h in I)o[h]=I[h];for(let M=0;M<te.length;M++)h=te[M],Object.prototype.hasOwnProperty.call(I,h)&&(o[h]=I[h])}}function ue(o){this.src=o,this.g={},this.h=0}ue.prototype.add=function(o,d,h,I,k){let M=o.toString();o=this.g[M],o||(o=this.g[M]=[],this.h++);let W=me(o,d,I,k);return W>-1?(d=o[W],h||(d.fa=!1)):(d=new O(d,this.src,M,!!I,k),d.fa=h,o.push(d)),d};function X(o,d){let h=d.type;if(h in o.g){var I=o.g[h],k=Array.prototype.indexOf.call(I,d,void 0),M;(M=k>=0)&&Array.prototype.splice.call(I,k,1),M&&(P(d),o.g[h].length==0&&(delete o.g[h],o.h--))}}function me(o,d,h,I){for(let k=0;k<o.length;++k){let M=o[k];if(!M.da&&M.listener==d&&M.capture==!!h&&M.ha==I)return k}return-1}var Ne="closure_lm_"+(Math.random()*1e6|0),be={};function re(o,d,h,I,k){if(I&&I.once)return qr(o,d,h,I,k);if(Array.isArray(d)){for(let M=0;M<d.length;M++)re(o,d[M],h,I,k);return null}return h=Ni(h),o&&o[Z]?o.J(d,h,l(I)?!!I.capture:!!I,k):Xe(o,d,h,!1,I,k)}function Xe(o,d,h,I,k,M){if(!d)throw Error("Invalid event type");let W=l(k)?!!k.capture:!!k,ge=Oi(o);if(ge||(o[Ne]=ge=new ue(o)),h=ge.add(d,h,I,W,M),h.proxy)return h;if(I=sn(),h.proxy=I,I.src=o,I.listener=h,o.addEventListener)A||(k=W),k===void 0&&(k=!1),o.addEventListener(d.toString(),I,k);else if(o.attachEvent)o.attachEvent(Us(d.toString()),I);else if(o.addListener&&o.removeListener)o.addListener(I);else throw Error("addEventListener and attachEvent are unavailable.");return h}function sn(){function o(h){return d.call(o.src,o.listener,h)}let d=kl;return o}function qr(o,d,h,I,k){if(Array.isArray(d)){for(let M=0;M<d.length;M++)qr(o,d[M],h,I,k);return null}return h=Ni(h),o&&o[Z]?o.K(d,h,l(I)?!!I.capture:!!I,k):Xe(o,d,h,!0,I,k)}function qt(o,d,h,I,k){if(Array.isArray(d))for(var M=0;M<d.length;M++)qt(o,d[M],h,I,k);else I=l(I)?!!I.capture:!!I,h=Ni(h),o&&o[Z]?(o=o.i,M=String(d).toString(),M in o.g&&(d=o.g[M],h=me(d,h,I,k),h>-1&&(P(d[h]),Array.prototype.splice.call(d,h,1),d.length==0&&(delete o.g[M],o.h--)))):o&&(o=Oi(o))&&(d=o.g[d.toString()],o=-1,d&&(o=me(d,h,I,k)),(h=o>-1?d[o]:null)&&ua(h))}function ua(o){if(typeof o!="number"&&o&&!o.da){var d=o.src;if(d&&d[Z])X(d.i,o);else{var h=o.type,I=o.proxy;d.removeEventListener?d.removeEventListener(h,I,o.capture):d.detachEvent?d.detachEvent(Us(h),I):d.addListener&&d.removeListener&&d.removeListener(I),(h=Oi(d))?(X(h,o),h.h==0&&(h.src=null,d[Ne]=null)):P(o)}}}function Us(o){return o in be?be[o]:be[o]="on"+o}function kl(o,d){if(o.da)o=!0;else{d=new $(d,this);let h=o.listener,I=o.ha||o.src;o.fa&&ua(o),o=h.call(I,d)}return o}function Oi(o){return o=o[Ne],o instanceof ue?o:null}var Mi="__closure_events_fn_"+(Math.random()*1e9>>>0);function Ni(o){return typeof o=="function"?o:(o[Mi]||(o[Mi]=function(d){return o.handleEvent(d)}),o[Mi])}function xt(){b.call(this),this.i=new ue(this),this.M=this,this.G=null}p(xt,b),xt.prototype[Z]=!0,xt.prototype.removeEventListener=function(o,d,h,I){qt(this,o,d,h,I)};function ft(o,d){var h,I=o.G;if(I)for(h=[];I;I=I.G)h.push(I);if(o=o.M,I=d.type||d,typeof d=="string")d=new w(d,o);else if(d instanceof w)d.target=d.target||o;else{var k=d;d=new w(I,o),Se(d,k)}k=!0;let M,W;if(h)for(W=h.length-1;W>=0;W--)M=d.g=h[W],k=zr(M,I,!0,d)&&k;if(M=d.g=o,k=zr(M,I,!0,d)&&k,k=zr(M,I,!1,d)&&k,h)for(W=0;W<h.length;W++)M=d.g=h[W],k=zr(M,I,!1,d)&&k}xt.prototype.N=function(){if(xt.Z.N.call(this),this.i){var o=this.i;for(let d in o.g){let h=o.g[d];for(let I=0;I<h.length;I++)P(h[I]);delete o.g[d],o.h--}}this.G=null},xt.prototype.J=function(o,d,h,I){return this.i.add(String(o),d,!1,h,I)},xt.prototype.K=function(o,d,h,I){return this.i.add(String(o),d,!0,h,I)};function zr(o,d,h,I){if(d=o.i.g[String(d)],!d)return!0;d=d.concat();let k=!0;for(let M=0;M<d.length;++M){let W=d[M];if(W&&!W.da&&W.capture==h){let ge=W.listener,bt=W.ha||W.src;W.fa&&X(o.i,W),k=ge.call(bt,I)!==!1&&k}}return k&&!I.defaultPrevented}function Dl(o,d){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=c(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:i.setTimeout(o,d||0)}function Vi(o){o.g=Dl(()=>{o.g=null,o.i&&(o.i=!1,Vi(o))},o.l);let d=o.h;o.h=null,o.m.apply(null,d)}class Fs extends b{constructor(d,h){super(),this.m=d,this.l=h,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:Vi(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ka(o){b.call(this),this.h=o,this.g={}}p(Ka,b);var Yn=[];function Hr(o){V(o.g,function(d,h){this.g.hasOwnProperty(h)&&ua(d)},o),o.g={}}Ka.prototype.N=function(){Ka.Z.N.call(this),Hr(this)},Ka.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Qn=i.JSON.stringify,ca=i.JSON.parse,Zt=class{stringify(o){return i.JSON.stringify(o,void 0)}parse(o){return i.JSON.parse(o,void 0)}};function tm(){}function en(){}var On={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Gr(){w.call(this,"d")}p(Gr,w);function Wa(){w.call(this,"c")}p(Wa,w);var $n={},Xa=null;function Xt(){return Xa=Xa||new xt}$n.Ia="serverreachability";function jr(o){w.call(this,$n.Ia,o)}p(jr,w);function Ya(o){let d=Xt();ft(d,new jr(d))}$n.STAT_EVENT="statevent";function Kr(o,d){w.call(this,$n.STAT_EVENT,o),this.stat=d}p(Kr,w);function Rt(o){let d=Xt();ft(d,new Kr(d,o))}$n.Ja="timingevent";function da(o,d){w.call(this,$n.Ja,o),this.size=d}p(da,w);function it(o,d){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){o()},d)}function Qa(){this.g=!0}Qa.prototype.ua=function(){this.g=!1};function ud(o,d,h,I,k,M){o.info(function(){if(o.g)if(M){var W="",ge=M.split("&");for(let qe=0;qe<ge.length;qe++){var bt=ge[qe].split("=");if(bt.length>1){let kt=bt[0];bt=bt[1];let Ia=kt.split("_");W=Ia.length>=2&&Ia[1]=="type"?W+(kt+"="+bt+"&"):W+(kt+"=redacted&")}}}else W=null;else W=M;return"XMLHTTP REQ ("+I+") [attempt "+k+"]: "+d+`
`+h+`
`+W})}function cd(o,d,h,I,k,M,W){o.info(function(){return"XMLHTTP RESP ("+I+") [ attempt "+k+"]: "+d+`
`+h+`
`+M+" "+W})}function fa(o,d,h,I){o.info(function(){return"XMLHTTP TEXT ("+d+"): "+Ol(o,h)+(I?" "+I:"")})}function Pl(o,d){o.info(function(){return"TIMEOUT: "+d})}Qa.prototype.info=function(){};function Ol(o,d){if(!o.g)return d;if(!d)return null;try{let M=JSON.parse(d);if(M){for(o=0;o<M.length;o++)if(Array.isArray(M[o])){var h=M[o];if(!(h.length<2)){var I=h[1];if(Array.isArray(I)&&!(I.length<1)){var k=I[0];if(k!="noop"&&k!="stop"&&k!="close")for(let W=1;W<I.length;W++)I[W]=""}}}}return Qn(M)}catch{return d}}var ha={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Bs={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},qs;function zs(){}p(zs,tm),zs.prototype.g=function(){return new XMLHttpRequest},qs=new zs;function $a(o){return encodeURIComponent(String(o))}function Ml(o){var d=1;o=o.split(":");let h=[];for(;d>0&&o.length;)h.push(o.shift()),d--;return o.length&&h.push(o.join(":")),h}function Mn(o,d,h,I){this.j=o,this.i=d,this.l=h,this.S=I||1,this.V=new Ka(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Nl}function Nl(){this.i=null,this.g="",this.h=!1}var Vl={},Ui={};function pa(o,d,h){o.M=1,o.A=Hi(_n(d)),o.u=h,o.R=!0,on(o,null)}function on(o,d){o.F=Date.now(),Hs(o),o.B=_n(o.A);var h=o.B,I=o.S;Array.isArray(I)||(I=[String(I)]),Ov(h.i,"t",I),o.C=0,h=o.j.L,o.h=new Nl,o.g=Jv(o.j,h?d:null,!o.u),o.P>0&&(o.O=new Fs(c(o.Y,o,o.g),o.P)),d=o.V,h=o.g,I=o.ba;var k="readystatechange";Array.isArray(k)||(k&&(Yn[0]=k.toString()),k=Yn);for(let M=0;M<k.length;M++){let W=re(h,k[M],I||d.handleEvent,!1,d.h||d);if(!W)break;d.g[W.key]=W}d=o.J?G(o.J):{},o.u?(o.v||(o.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,d)):(o.v="GET",o.g.ea(o.B,o.v,null,d)),Ya(),ud(o.i,o.v,o.B,o.l,o.S,o.u)}Mn.prototype.ba=function(o){o=o.target;let d=this.O;d&&$r(o)==3?d.j():this.Y(o)},Mn.prototype.Y=function(o){try{if(o==this.g)e:{let ge=$r(this.g),bt=this.g.ya(),qe=this.g.ca();if(!(ge<3)&&(ge!=3||this.g&&(this.h.h||this.g.la()||qv(this.g)))){this.K||ge!=4||bt==7||(bt==8||qe<=0?Ya(3):Ya(2)),Fi(this);var d=this.g.ca();this.X=d;var h=Jn(this);if(this.o=d==200,cd(this.i,this.v,this.B,this.l,this.S,ge,d),this.o){if(this.U&&!this.L){t:{if(this.g){var I,k=this.g;if((I=k.g?k.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!S(I)){var M=I;break t}}M=null}if(o=M)fa(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Bi(this,o);else{this.o=!1,this.m=3,Rt(12),ga(this),Wr(this);break e}}if(this.R){o=!0;let kt;for(;!this.K&&this.C<h.length;)if(kt=ma(this,h),kt==Ui){ge==4&&(this.m=4,Rt(14),o=!1),fa(this.i,this.l,null,"[Incomplete Response]");break}else if(kt==Vl){this.m=4,Rt(15),fa(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else fa(this.i,this.l,kt,null),Bi(this,kt);if(Ja(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ge!=4||h.length!=0||this.h.h||(this.m=1,Rt(16),o=!1),this.o=this.o&&o,!o)fa(this.i,this.l,h,"[Invalid Chunked Response]"),ga(this),Wr(this);else if(h.length>0&&!this.W){this.W=!0;var W=this.j;W.g==this&&W.aa&&!W.P&&(W.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),im(W),W.P=!0,Rt(11))}}else fa(this.i,this.l,h,null),Bi(this,h);ge==4&&ga(this),this.o&&!this.K&&(ge==4?Xv(this.j,this):(this.o=!1,Hs(this)))}else Fk(this.g),d==400&&h.indexOf("Unknown SID")>0?(this.m=3,Rt(12)):(this.m=0,Rt(13)),ga(this),Wr(this)}}}catch{}finally{}};function Jn(o){if(!Ja(o))return o.g.la();let d=qv(o.g);if(d==="")return"";let h="",I=d.length,k=$r(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return ga(o),Wr(o),"";o.h.i=new i.TextDecoder}for(let M=0;M<I;M++)o.h.h=!0,h+=o.h.i.decode(d[M],{stream:!(k&&M==I-1)});return d.length=0,o.h.g+=h,o.C=0,o.h.g}function Ja(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function ma(o,d){var h=o.C,I=d.indexOf(`
`,h);return I==-1?Ui:(h=Number(d.substring(h,I)),isNaN(h)?Vl:(I+=1,I+h>d.length?Ui:(d=d.slice(I,I+h),o.C=I+h,d)))}Mn.prototype.cancel=function(){this.K=!0,ga(this)};function Hs(o){o.T=Date.now()+o.H,Gs(o,o.H)}function Gs(o,d){if(o.D!=null)throw Error("WatchDog timer not null");o.D=it(c(o.aa,o),d)}function Fi(o){o.D&&(i.clearTimeout(o.D),o.D=null)}Mn.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?(Pl(this.i,this.B),this.M!=2&&(Ya(),Rt(17)),ga(this),this.m=2,Wr(this)):Gs(this,this.T-o)};function Wr(o){o.j.I==0||o.K||Xv(o.j,o)}function ga(o){Fi(o);var d=o.O;d&&typeof d.dispose=="function"&&d.dispose(),o.O=null,Hr(o.V),o.g&&(d=o.g,o.g=null,d.abort(),d.dispose())}function Bi(o,d){try{var h=o.j;if(h.I!=0&&(h.g==o||qi(h.h,o))){if(!o.L&&qi(h.h,o)&&h.I==3){try{var I=h.Ba.g.parse(d)}catch{I=null}if(Array.isArray(I)&&I.length==3){var k=I;if(k[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)Id(h),gd(h);else break e;sm(h),Rt(18)}}else h.xa=k[1],0<h.xa-h.K&&k[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=it(c(h.Va,h),6e3));Fl(h.h)<=1&&h.ta&&(h.ta=void 0)}else Ks(h,11)}else if((o.L||h.g==o)&&Id(h),!S(d))for(k=h.Ba.g.parse(d),d=0;d<k.length;d++){let qe=k[d],kt=qe[0];if(!(kt<=h.K))if(h.K=kt,qe=qe[1],h.I==2)if(qe[0]=="c"){h.M=qe[1],h.ba=qe[2];let Ia=qe[3];Ia!=null&&(h.ka=Ia,h.j.info("VER="+h.ka));let Ws=qe[4];Ws!=null&&(h.za=Ws,h.j.info("SVER="+h.za));let Jr=qe[5];Jr!=null&&typeof Jr=="number"&&Jr>0&&(I=1.5*Jr,h.O=I,h.j.info("backChannelRequestTimeoutMs_="+I)),I=h;let Zr=o.g;if(Zr){let Sd=Zr.g?Zr.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Sd){var M=I.h;M.g||Sd.indexOf("spdy")==-1&&Sd.indexOf("quic")==-1&&Sd.indexOf("h2")==-1||(M.j=M.l,M.g=new Set,M.h&&(Za(M,M.h),M.h=null))}if(I.G){let om=Zr.g?Zr.g.getResponseHeader("X-HTTP-Session-Id"):null;om&&(I.wa=om,Ve(I.J,I.G,om))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),I=h;var W=o;if(I.na=$v(I,I.L?I.ba:null,I.W),W.L){Bl(I.h,W);var ge=W,bt=I.O;bt&&(ge.H=bt),ge.D&&(Fi(ge),Hs(ge)),I.g=W}else Kv(I);h.i.length>0&&yd(h)}else qe[0]!="stop"&&qe[0]!="close"||Ks(h,7);else h.I==3&&(qe[0]=="stop"||qe[0]=="close"?qe[0]=="stop"?Ks(h,7):rm(h):qe[0]!="noop"&&h.l&&h.l.qa(qe),h.A=0)}}Ya(4)}catch{}}var dd=class{constructor(o,d){this.g=o,this.map=d}};function ya(o){this.l=o||10,i.PerformanceNavigationTiming?(o=i.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Ul(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Fl(o){return o.h?1:o.g?o.g.size:0}function qi(o,d){return o.h?o.h==d:o.g?o.g.has(d):!1}function Za(o,d){o.g?o.g.add(d):o.h=d}function Bl(o,d){o.h&&o.h==d?o.h=null:o.g&&o.g.has(d)&&o.g.delete(d)}ya.prototype.cancel=function(){if(this.i=ql(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function ql(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let d=o.i;for(let h of o.g.values())d=d.concat(h.G);return d}return v(o.i)}var zl=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function fd(o,d){if(o){o=o.split("&");for(let h=0;h<o.length;h++){let I=o[h].indexOf("="),k,M=null;I>=0?(k=o[h].substring(0,I),M=o[h].substring(I+1)):k=o[h],d(k,M?decodeURIComponent(M.replace(/\+/g," ")):"")}}}function Zn(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;o instanceof Zn?(this.l=o.l,Xr(this,o.j),this.o=o.o,this.g=o.g,Yr(this,o.u),this.h=o.h,zi(this,Mv(o.i)),this.m=o.m):o&&(d=String(o).match(zl))?(this.l=!1,Xr(this,d[1]||"",!0),this.o=er(d[2]||""),this.g=er(d[3]||"",!0),Yr(this,d[4]),this.h=er(d[5]||"",!0),zi(this,d[6]||"",!0),this.m=er(d[7]||"")):(this.l=!1,this.i=new Be(null,this.l))}Zn.prototype.toString=function(){let o=[];var d=this.j;d&&o.push(js(d,q,!0),":");var h=this.g;return(h||d=="file")&&(o.push("//"),(d=this.o)&&o.push(js(d,q,!0),"@"),o.push($a(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(js(h,h.charAt(0)=="/"?K:j,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",js(h,ce)),o.join("")},Zn.prototype.resolve=function(o){let d=_n(this),h=!!o.j;h?Xr(d,o.j):h=!!o.o,h?d.o=o.o:h=!!o.g,h?d.g=o.g:h=o.u!=null;var I=o.h;if(h)Yr(d,o.u);else if(h=!!o.h){if(I.charAt(0)!="/")if(this.g&&!this.h)I="/"+I;else{var k=d.h.lastIndexOf("/");k!=-1&&(I=d.h.slice(0,k+1)+I)}if(k=I,k==".."||k==".")I="";else if(k.indexOf("./")!=-1||k.indexOf("/.")!=-1){I=k.lastIndexOf("/",0)==0,k=k.split("/");let M=[];for(let W=0;W<k.length;){let ge=k[W++];ge=="."?I&&W==k.length&&M.push(""):ge==".."?((M.length>1||M.length==1&&M[0]!="")&&M.pop(),I&&W==k.length&&M.push("")):(M.push(ge),I=!0)}I=M.join("/")}else I=k}return h?d.h=I:h=o.i.toString()!=="",h?zi(d,Mv(o.i)):h=!!o.m,h&&(d.m=o.m),d};function _n(o){return new Zn(o)}function Xr(o,d,h){o.j=h?er(d,!0):d,o.j&&(o.j=o.j.replace(/:$/,""))}function Yr(o,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);o.u=d}else o.u=null}function zi(o,d,h){d instanceof Be?(o.i=d,Pk(o.i,o.l)):(h||(d=js(d,ne)),o.i=new Be(d,o.l))}function Ve(o,d,h){o.i.set(d,h)}function Hi(o){return Ve(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function er(o,d){return o?d?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function js(o,d,h){return typeof o=="string"?(o=encodeURI(o).replace(d,nm),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function nm(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var q=/[#\/\?@]/g,j=/[#\?:]/g,K=/[#\?]/g,ne=/[#\?@]/g,ce=/#/g;function Be(o,d){this.h=this.g=null,this.i=o||null,this.j=!!d}function de(o){o.g||(o.g=new Map,o.h=0,o.i&&fd(o.i,function(d,h){o.add(decodeURIComponent(d.replace(/\+/g," ")),h)}))}t=Be.prototype,t.add=function(o,d){de(this),this.i=null,o=Gi(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(d),this.h+=1,this};function ve(o,d){de(o),d=Gi(o,d),o.g.has(d)&&(o.i=null,o.h-=o.g.get(d).length,o.g.delete(d))}function Sn(o,d){return de(o),d=Gi(o,d),o.g.has(d)}t.forEach=function(o,d){de(this),this.g.forEach(function(h,I){h.forEach(function(k){o.call(d,k,I,this)},this)},this)};function Pv(o,d){de(o);let h=[];if(typeof d=="string")Sn(o,d)&&(h=h.concat(o.g.get(Gi(o,d))));else for(o=Array.from(o.g.values()),d=0;d<o.length;d++)h=h.concat(o[d]);return h}t.set=function(o,d){return de(this),this.i=null,o=Gi(this,o),Sn(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[d]),this.h+=1,this},t.get=function(o,d){return o?(o=Pv(this,o),o.length>0?String(o[0]):d):d};function Ov(o,d,h){ve(o,d),h.length>0&&(o.i=null,o.g.set(Gi(o,d),v(h)),o.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],d=Array.from(this.g.keys());for(let I=0;I<d.length;I++){var h=d[I];let k=$a(h);h=Pv(this,h);for(let M=0;M<h.length;M++){let W=k;h[M]!==""&&(W+="="+$a(h[M])),o.push(W)}}return this.i=o.join("&")};function Mv(o){let d=new Be;return d.i=o.i,o.g&&(d.g=new Map(o.g),d.h=o.h),d}function Gi(o,d){return d=String(d),o.j&&(d=d.toLowerCase()),d}function Pk(o,d){d&&!o.j&&(de(o),o.i=null,o.g.forEach(function(h,I){let k=I.toLowerCase();I!=k&&(ve(this,I),Ov(this,k,h))},o)),o.j=d}function Ok(o,d){let h=new Qa;if(i.Image){let I=new Image;I.onload=f(Qr,h,"TestLoadImage: loaded",!0,d,I),I.onerror=f(Qr,h,"TestLoadImage: error",!1,d,I),I.onabort=f(Qr,h,"TestLoadImage: abort",!1,d,I),I.ontimeout=f(Qr,h,"TestLoadImage: timeout",!1,d,I),i.setTimeout(function(){I.ontimeout&&I.ontimeout()},1e4),I.src=o}else d(!1)}function Mk(o,d){let h=new Qa,I=new AbortController,k=setTimeout(()=>{I.abort(),Qr(h,"TestPingServer: timeout",!1,d)},1e4);fetch(o,{signal:I.signal}).then(M=>{clearTimeout(k),M.ok?Qr(h,"TestPingServer: ok",!0,d):Qr(h,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(k),Qr(h,"TestPingServer: error",!1,d)})}function Qr(o,d,h,I,k){try{k&&(k.onload=null,k.onerror=null,k.onabort=null,k.ontimeout=null),I(h)}catch{}}function Nk(){this.g=new Zt}function hd(o){this.i=o.Sb||null,this.h=o.ab||!1}p(hd,tm),hd.prototype.g=function(){return new pd(this.i,this.h)};function pd(o,d){xt.call(this),this.H=o,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(pd,xt),t=pd.prototype,t.open=function(o,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=d,this.readyState=1,Gl(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(d.body=o),(this.H||i).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Hl(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Gl(this)),this.g&&(this.readyState=3,Gl(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof i.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Nv(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Nv(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var d=o.value?o.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!o.done}))&&(this.response=this.responseText+=d)}o.done?Hl(this):Gl(this),this.readyState==3&&Nv(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,Hl(this))},t.Na=function(o){this.g&&(this.response=o,Hl(this))},t.ga=function(){this.g&&Hl(this)};function Hl(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Gl(o)}t.setRequestHeader=function(o,d){this.A.append(o,d)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],d=this.h.entries();for(var h=d.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=d.next();return o.join(`\r
`)};function Gl(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(pd.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Vv(o){let d="";return V(o,function(h,I){d+=I,d+=":",d+=h,d+=`\r
`}),d}function am(o,d,h){e:{for(I in h){var I=!1;break e}I=!0}I||(h=Vv(h),typeof o=="string"?h!=null&&$a(h):Ve(o,d,h))}function at(o){xt.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(at,xt);var Vk=/^https?$/i,Uk=["POST","PUT"];t=at.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,d,h,I){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);d=d?d.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():qs.g(),this.g.onreadystatechange=m(c(this.Ca,this));try{this.B=!0,this.g.open(d,String(o),!0),this.B=!1}catch(M){Uv(this,M);return}if(o=h||"",h=new Map(this.headers),I)if(Object.getPrototypeOf(I)===Object.prototype)for(var k in I)h.set(k,I[k]);else if(typeof I.keys=="function"&&typeof I.get=="function")for(let M of I.keys())h.set(M,I.get(M));else throw Error("Unknown input type for opt_headers: "+String(I));I=Array.from(h.keys()).find(M=>M.toLowerCase()=="content-type"),k=i.FormData&&o instanceof i.FormData,!(Array.prototype.indexOf.call(Uk,d,void 0)>=0)||I||k||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[M,W]of h)this.g.setRequestHeader(M,W);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(M){Uv(this,M)}};function Uv(o,d){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=d,o.o=5,Fv(o),md(o)}function Fv(o){o.A||(o.A=!0,ft(o,"complete"),ft(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,ft(this,"complete"),ft(this,"abort"),md(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),md(this,!0)),at.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?Bv(this):this.Xa())},t.Xa=function(){Bv(this)};function Bv(o){if(o.h&&typeof s<"u"){if(o.v&&$r(o)==4)setTimeout(o.Ca.bind(o),0);else if(ft(o,"readystatechange"),$r(o)==4){o.h=!1;try{let M=o.ca();e:switch(M){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var h;if(!(h=d)){var I;if(I=M===0){let W=String(o.D).match(zl)[1]||null;!W&&i.self&&i.self.location&&(W=i.self.location.protocol.slice(0,-1)),I=!Vk.test(W?W.toLowerCase():"")}h=I}if(h)ft(o,"complete"),ft(o,"success");else{o.o=6;try{var k=$r(o)>2?o.g.statusText:""}catch{k=""}o.l=k+" ["+o.ca()+"]",Fv(o)}}finally{md(o)}}}}function md(o,d){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let h=o.g;o.g=null,d||ft(o,"ready");try{h.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function $r(o){return o.g?o.g.readyState:0}t.ca=function(){try{return $r(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var d=this.g.responseText;return o&&d.indexOf(o)==0&&(d=d.substring(o.length)),ca(d)}};function qv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Fk(o){let d={};o=(o.g&&$r(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let I=0;I<o.length;I++){if(S(o[I]))continue;var h=Ml(o[I]);let k=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();let M=d[k]||[];d[k]=M,M.push(h)}Q(d,function(I){return I.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function jl(o,d,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||d}function zv(o){this.za=0,this.i=[],this.j=new Qa,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=jl("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=jl("baseRetryDelayMs",5e3,o),this.Za=jl("retryDelaySeedMs",1e4,o),this.Ta=jl("forwardChannelMaxRetries",2,o),this.va=jl("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new ya(o&&o.concurrentRequestLimit),this.Ba=new Nk,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=zv.prototype,t.ka=8,t.I=1,t.connect=function(o,d,h,I){Rt(0),this.W=o,this.H=d||{},h&&I!==void 0&&(this.H.OSID=h,this.H.OAID=I),this.F=this.X,this.J=$v(this,null,this.W),yd(this)};function rm(o){if(Hv(o),o.I==3){var d=o.V++,h=_n(o.J);if(Ve(h,"SID",o.M),Ve(h,"RID",d),Ve(h,"TYPE","terminate"),Kl(o,h),d=new Mn(o,o.j,d),d.M=2,d.A=Hi(_n(h)),h=!1,i.navigator&&i.navigator.sendBeacon)try{h=i.navigator.sendBeacon(d.A.toString(),"")}catch{}!h&&i.Image&&(new Image().src=d.A,h=!0),h||(d.g=Jv(d.j,null),d.g.ea(d.A)),d.F=Date.now(),Hs(d)}Qv(o)}function gd(o){o.g&&(im(o),o.g.cancel(),o.g=null)}function Hv(o){gd(o),o.v&&(i.clearTimeout(o.v),o.v=null),Id(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&i.clearTimeout(o.m),o.m=null)}function yd(o){if(!Ul(o.h)&&!o.m){o.m=!0;var d=o.Ea;U||g(),N||(U(),N=!0),y.add(d,o),o.D=0}}function Bk(o,d){return Fl(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=d.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=it(c(o.Ea,o,d),Yv(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let k=new Mn(this,this.j,o),M=this.o;if(this.U&&(M?(M=G(M),Se(M,this.U)):M=this.U),this.u!==null||this.R||(k.J=M,M=null),this.S)e:{for(var d=0,h=0;h<this.i.length;h++){t:{var I=this.i[h];if("__data__"in I.map&&(I=I.map.__data__,typeof I=="string")){I=I.length;break t}I=void 0}if(I===void 0)break;if(d+=I,d>4096){d=h;break e}if(d===4096||h===this.i.length-1){d=h+1;break e}}d=1e3}else d=1e3;d=jv(this,k,d),h=_n(this.J),Ve(h,"RID",o),Ve(h,"CVER",22),this.G&&Ve(h,"X-HTTP-Session-Id",this.G),Kl(this,h),M&&(this.R?d="headers="+$a(Vv(M))+"&"+d:this.u&&am(h,this.u,M)),Za(this.h,k),this.Ra&&Ve(h,"TYPE","init"),this.S?(Ve(h,"$req",d),Ve(h,"SID","null"),k.U=!0,pa(k,h,null)):pa(k,h,d),this.I=2}}else this.I==3&&(o?Gv(this,o):this.i.length==0||Ul(this.h)||Gv(this))};function Gv(o,d){var h;d?h=d.l:h=o.V++;let I=_n(o.J);Ve(I,"SID",o.M),Ve(I,"RID",h),Ve(I,"AID",o.K),Kl(o,I),o.u&&o.o&&am(I,o.u,o.o),h=new Mn(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),d&&(o.i=d.G.concat(o.i)),d=jv(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Za(o.h,h),pa(h,I,d)}function Kl(o,d){o.H&&V(o.H,function(h,I){Ve(d,I,h)}),o.l&&V({},function(h,I){Ve(d,I,h)})}function jv(o,d,h){h=Math.min(o.i.length,h);let I=o.l?c(o.l.Ka,o.l,o):null;e:{var k=o.i;let ge=-1;for(;;){let bt=["count="+h];ge==-1?h>0?(ge=k[0].g,bt.push("ofs="+ge)):ge=0:bt.push("ofs="+ge);let qe=!0;for(let kt=0;kt<h;kt++){var M=k[kt].g;let Ia=k[kt].map;if(M-=ge,M<0)ge=Math.max(0,k[kt].g-100),qe=!1;else try{M="req"+M+"_"||"";try{var W=Ia instanceof Map?Ia:Object.entries(Ia);for(let[Ws,Jr]of W){let Zr=Jr;l(Jr)&&(Zr=Qn(Jr)),bt.push(M+Ws+"="+encodeURIComponent(Zr))}}catch(Ws){throw bt.push(M+"type="+encodeURIComponent("_badmap")),Ws}}catch{I&&I(Ia)}}if(qe){W=bt.join("&");break e}}W=void 0}return o=o.i.splice(0,h),d.G=o,W}function Kv(o){if(!o.g&&!o.v){o.Y=1;var d=o.Da;U||g(),N||(U(),N=!0),y.add(d,o),o.A=0}}function sm(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=it(c(o.Da,o),Yv(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,Wv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=it(c(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Rt(10),gd(this),Wv(this))};function im(o){o.B!=null&&(i.clearTimeout(o.B),o.B=null)}function Wv(o){o.g=new Mn(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var d=_n(o.na);Ve(d,"RID","rpc"),Ve(d,"SID",o.M),Ve(d,"AID",o.K),Ve(d,"CI",o.F?"0":"1"),!o.F&&o.ia&&Ve(d,"TO",o.ia),Ve(d,"TYPE","xmlhttp"),Kl(o,d),o.u&&o.o&&am(d,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=Hi(_n(d)),h.u=null,h.R=!0,on(h,o)}t.Va=function(){this.C!=null&&(this.C=null,gd(this),sm(this),Rt(19))};function Id(o){o.C!=null&&(i.clearTimeout(o.C),o.C=null)}function Xv(o,d){var h=null;if(o.g==d){Id(o),im(o),o.g=null;var I=2}else if(qi(o.h,d))h=d.G,Bl(o.h,d),I=1;else return;if(o.I!=0){if(d.o)if(I==1){h=d.u?d.u.length:0,d=Date.now()-d.F;var k=o.D;I=Xt(),ft(I,new da(I,h)),yd(o)}else Kv(o);else if(k=d.m,k==3||k==0&&d.X>0||!(I==1&&Bk(o,d)||I==2&&sm(o)))switch(h&&h.length>0&&(d=o.h,d.i=d.i.concat(h)),k){case 1:Ks(o,5);break;case 4:Ks(o,10);break;case 3:Ks(o,6);break;default:Ks(o,2)}}}function Yv(o,d){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*d}function Ks(o,d){if(o.j.info("Error code "+d),d==2){var h=c(o.bb,o),I=o.Ua;let k=!I;I=new Zn(I||"//www.google.com/images/cleardot.gif"),i.location&&i.location.protocol=="http"||Xr(I,"https"),Hi(I),k?Ok(I.toString(),h):Mk(I.toString(),h)}else Rt(2);o.I=0,o.l&&o.l.pa(d),Qv(o),Hv(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),Rt(2)):(this.j.info("Failed to ping google.com"),Rt(1))};function Qv(o){if(o.I=0,o.ja=[],o.l){let d=ql(o.h);(d.length!=0||o.i.length!=0)&&(R(o.ja,d),R(o.ja,o.i),o.h.i.length=0,v(o.i),o.i.length=0),o.l.oa()}}function $v(o,d,h){var I=h instanceof Zn?_n(h):new Zn(h);if(I.g!="")d&&(I.g=d+"."+I.g),Yr(I,I.u);else{var k=i.location;I=k.protocol,d=d?d+"."+k.hostname:k.hostname,k=+k.port;let M=new Zn(null);I&&Xr(M,I),d&&(M.g=d),k&&Yr(M,k),h&&(M.h=h),I=M}return h=o.G,d=o.wa,h&&d&&Ve(I,h,d),Ve(I,"VER",o.ka),Kl(o,I),I}function Jv(o,d,h){if(d&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=o.Aa&&!o.ma?new at(new hd({ab:h})):new at(o.ma),d.Fa(o.L),d}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function Zv(){}t=Zv.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function _d(){}_d.prototype.g=function(o,d){return new vn(o,d)};function vn(o,d){xt.call(this),this.g=new zv(d),this.l=o,this.h=d&&d.messageUrlParams||null,o=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(o?o["X-WebChannel-Content-Type"]=d.messageContentType:o={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(o?o["X-WebChannel-Client-Profile"]=d.sa:o={"X-WebChannel-Client-Profile":d.sa}),this.g.U=o,(o=d&&d.Qb)&&!S(o)&&(this.g.u=o),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!S(d)&&(this.g.G=d,o=this.h,o!==null&&d in o&&(o=this.h,d in o&&delete o[d])),this.j=new ji(this)}p(vn,xt),vn.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},vn.prototype.close=function(){rm(this.g)},vn.prototype.o=function(o){var d=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=Qn(o),o=h);d.i.push(new dd(d.Ya++,o)),d.I==3&&yd(d)},vn.prototype.N=function(){this.g.l=null,delete this.j,rm(this.g),delete this.g,vn.Z.N.call(this)};function eE(o){Gr.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var d=o.__sm__;if(d){e:{for(let h in d){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,d=d!==null&&o in d?d[o]:void 0),this.data=d}else this.data=o}p(eE,Gr);function tE(){Wa.call(this),this.status=1}p(tE,Wa);function ji(o){this.g=o}p(ji,Zv),ji.prototype.ra=function(){ft(this.g,"a")},ji.prototype.qa=function(o){ft(this.g,new eE(o))},ji.prototype.pa=function(o){ft(this.g,new tE)},ji.prototype.oa=function(){ft(this.g,"b")},_d.prototype.createWebChannel=_d.prototype.g,vn.prototype.send=vn.prototype.o,vn.prototype.open=vn.prototype.m,vn.prototype.close=vn.prototype.close,l_=Cr.createWebChannelTransport=function(){return new _d},o_=Cr.getStatEventTarget=function(){return Xt()},i_=Cr.Event=$n,Gh=Cr.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ha.NO_ERROR=0,ha.TIMEOUT=8,ha.HTTP_ERROR=6,mc=Cr.ErrorCode=ha,Bs.COMPLETE="complete",s_=Cr.EventType=Bs,en.EventType=On,On.OPEN="a",On.CLOSE="b",On.ERROR="c",On.MESSAGE="d",xt.prototype.listen=xt.prototype.J,Xo=Cr.WebChannel=en,LN=Cr.FetchXmlHttpFactory=hd,at.prototype.listenOnce=at.prototype.K,at.prototype.getLastError=at.prototype.Ha,at.prototype.getLastErrorCode=at.prototype.ya,at.prototype.getStatus=at.prototype.ca,at.prototype.getResponseJson=at.prototype.La,at.prototype.getResponseText=at.prototype.la,at.prototype.send=at.prototype.ea,at.prototype.setWithCredentials=at.prototype.Fa,r_=Cr.XhrIo=at}).apply(typeof Hh<"u"?Hh:typeof self<"u"?self:typeof window<"u"?window:{});var Ut=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};Ut.UNAUTHENTICATED=new Ut(null),Ut.GOOGLE_CREDENTIALS=new Ut("google-credentials-uid"),Ut.FIRST_PARTY=new Ut("first-party-uid"),Ut.MOCK_USER=new Ut("mock-user");var yl="12.10.0";function a0(t){yl=t}var xi=new As("@firebase/firestore");function Yo(){return xi.logLevel}function J(t,...e){if(xi.logLevel<=ye.DEBUG){let n=e.map(NS);xi.debug(`Firestore (${yl}): ${t}`,...n)}}function xr(t,...e){if(xi.logLevel<=ye.ERROR){let n=e.map(NS);xi.error(`Firestore (${yl}): ${t}`,...n)}}function Rr(t,...e){if(xi.logLevel<=ye.WARN){let n=e.map(NS);xi.warn(`Firestore (${yl}): ${t}`,...n)}}function NS(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}function le(t,e,n){let a="Unexpected state";typeof e=="string"?a=e:n=e,r0(t,a,n)}function r0(t,e,n){let a=`FIRESTORE (${yl}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{a+=" CONTEXT: "+JSON.stringify(n)}catch{a+=" CONTEXT: "+n}throw xr(a),new Error(a)}function Ze(t,e,n,a){let r="Unexpected state";typeof n=="string"?r=n:a=n,t||r0(e,r,a)}function xe(t,e){return t}var z={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},Y=class extends rn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var Lr=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};var Qh=class{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},$h=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(Ut.UNAUTHENTICATED))}shutdown(){}},m_=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}},Jh=class{constructor(e){this.t=e,this.currentUser=Ut.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){Ze(this.o===void 0,42304);let a=this.i,r=u=>this.i!==a?(a=this.i,n(u)):Promise.resolve(),s=new Lr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Lr,e.enqueueRetryable(()=>r(this.currentUser))};let i=()=>{let u=s;e.enqueueRetryable(async()=>{await u.promise,await r(this.currentUser)})},l=u=>{J("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){let u=this.t.getImmediate({optional:!0});u?l(u):(J("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Lr)}},0),i()}getToken(){let e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(a=>this.i!==e?(J("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):a?(Ze(typeof a.accessToken=="string",31837,{l:a}),new Qh(a.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return Ze(e===null||typeof e=="string",2055,{h:e}),new Ut(e)}},g_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a,this.type="FirstParty",this.user=Ut.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},y_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a}getToken(){return Promise.resolve(new g_(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(Ut.FIRST_PARTY))}shutdown(){}invalidateToken(){}},Zh=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},ep=class{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,yn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){Ze(this.o===void 0,3512);let a=s=>{s.error!=null&&J("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);let i=s.token!==this.m;return this.m=s.token,J("FirebaseAppCheckTokenProvider",`Received ${i?"new":"existing"} token.`),i?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>a(s))};let r=s=>{J("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>r(s)),setTimeout(()=>{if(!this.appCheck){let s=this.V.getImmediate({optional:!0});s?r(s):J("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Zh(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(Ze(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Zh(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function AN(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let a=0;a<t;a++)n[a]=Math.floor(256*Math.random());return n}var al=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516),a="";for(;a.length<20;){let r=AN(40);for(let s=0;s<r.length;++s)a.length<20&&r[s]<n&&(a+=e.charAt(r[s]%62))}return a}};function Ce(t,e){return t<e?-1:t>e?1:0}function I_(t,e){let n=Math.min(t.length,e.length);for(let a=0;a<n;a++){let r=t.charAt(a),s=e.charAt(a);if(r!==s)return u_(r)===u_(s)?Ce(r,s):u_(r)?1:-1}return Ce(t.length,e.length)}var xN=55296,RN=57343;function u_(t){let e=t.charCodeAt(0);return e>=xN&&e<=RN}function rl(t,e,n){return t.length===e.length&&t.every((a,r)=>n(a,e[r]))}var Ix="__name__",tp=class t{constructor(e,n,a){n===void 0?n=0:n>e.length&&le(637,{offset:n,range:e.length}),a===void 0?a=e.length-n:a>e.length-n&&le(1746,{length:a,range:e.length-n}),this.segments=e,this.offset=n,this.len=a}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let n=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(a=>{n.push(a)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,a=this.limit();n<a;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){let a=Math.min(e.length,n.length);for(let r=0;r<a;r++){let s=t.compareSegments(e.get(r),n.get(r));if(s!==0)return s}return Ce(e.length,n.length)}static compareSegments(e,n){let a=t.isNumericId(e),r=t.isNumericId(n);return a&&!r?-1:!a&&r?1:a&&r?t.extractNumericId(e).compare(t.extractNumericId(n)):I_(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return wr.fromString(e.substring(4,e.length-2))}},Je=class t extends tp{construct(e,n,a){return new t(e,n,a)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let n=[];for(let a of e){if(a.indexOf("//")>=0)throw new Y(z.INVALID_ARGUMENT,`Invalid segment (${a}). Paths must not contain // in them.`);n.push(...a.split("/").filter(r=>r.length>0))}return new t(n)}static emptyPath(){return new t([])}},kN=/^[_a-zA-Z][_a-zA-Z0-9]*$/,Pn=class t extends tp{construct(e,n,a){return new t(e,n,a)}static isValidIdentifier(e){return kN.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Ix}static keyField(){return new t([Ix])}static fromServerFormat(e){let n=[],a="",r=0,s=()=>{if(a.length===0)throw new Y(z.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(a),a=""},i=!1;for(;r<e.length;){let l=e[r];if(l==="\\"){if(r+1===e.length)throw new Y(z.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let u=e[r+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new Y(z.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);a+=u,r+=2}else l==="`"?(i=!i,r++):l!=="."||i?(a+=l,r++):(s(),r++)}if(s(),i)throw new Y(z.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(n)}static emptyPath(){return new t([])}};var ae=class t{constructor(e){this.path=e}static fromPath(e){return new t(Je.fromString(e))}static fromName(e){return new t(Je.fromString(e).popFirst(5))}static empty(){return new t(Je.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Je.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return Je.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new Je(e.slice()))}};function DN(t,e,n){if(!n)throw new Y(z.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function s0(t,e,n,a){if(e===!0&&a===!0)throw new Y(z.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function _x(t){if(ae.isDocumentKey(t))throw new Y(z.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function i0(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function Fc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(a){return a.constructor?a.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":le(12329,{type:typeof t})}function Bc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new Y(z.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let n=Fc(t);throw new Y(z.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function o0(t,e){if(e<=0)throw new Y(z.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function ct(t,e){let n={typeString:t};return e&&(n.value=e),n}function Il(t,e){if(!i0(t))throw new Y(z.INVALID_ARGUMENT,"JSON must be an object");let n;for(let a in e)if(e[a]){let r=e[a].typeString,s="value"in e[a]?{value:e[a].value}:void 0;if(!(a in t)){n=`JSON missing required field: '${a}'`;break}let i=t[a];if(r&&typeof i!==r){n=`JSON field '${a}' must be a ${r}.`;break}if(s!==void 0&&i!==s.value){n=`Expected '${a}' field to equal '${s.value}'`;break}}if(n)throw new Y(z.INVALID_ARGUMENT,n);return!0}var Sx=-62135596800,vx=1e6,_t=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let n=Math.floor(e/1e3),a=Math.floor((e-1e3*n)*vx);return new t(n,a)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new Y(z.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new Y(z.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<Sx)throw new Y(z.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new Y(z.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/vx}_compareTo(e){return this.seconds===e.seconds?Ce(this.nanoseconds,e.nanoseconds):Ce(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Il(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-Sx;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};_t._jsonSchemaVersion="firestore/timestamp/1.0",_t._jsonSchema={type:ct("string",_t._jsonSchemaVersion),seconds:ct("number"),nanoseconds:ct("number")};var pe=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new _t(0,0))}static max(){return new t(new _t(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var vc=-1,np=class{constructor(e,n,a,r){this.indexId=e,this.collectionGroup=n,this.fields=a,this.indexState=r}};np.UNKNOWN_ID=-1;function PN(t,e){let n=t.toTimestamp().seconds,a=t.toTimestamp().nanoseconds+1,r=pe.fromTimestamp(a===1e9?new _t(n+1,0):new _t(n,a));return new Ri(r,ae.empty(),e)}function ON(t){return new Ri(t.readTime,t.key,vc)}var Ri=class t{constructor(e,n,a){this.readTime=e,this.documentKey=n,this.largestBatchId=a}static min(){return new t(pe.min(),ae.empty(),vc)}static max(){return new t(pe.max(),ae.empty(),vc)}};function MN(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ae.comparator(t.documentKey,e.documentKey),n!==0?n:Ce(t.largestBatchId,e.largestBatchId))}var NN="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",__=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function Lp(t){if(t.code!==z.FAILED_PRECONDITION||t.message!==NN)throw t;J("LocalStore","Unexpectedly lost primary lease")}var H=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&le(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new t((a,r)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(a,r)},this.catchCallback=s=>{this.wrapFailure(n,s).next(a,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{let n=e();return n instanceof t?n:t.resolve(n)}catch(n){return t.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):t.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):t.reject(n)}static resolve(e){return new t((n,a)=>{n(e)})}static reject(e){return new t((n,a)=>{a(e)})}static waitFor(e){return new t((n,a)=>{let r=0,s=0,i=!1;e.forEach(l=>{++r,l.next(()=>{++s,i&&s===r&&n()},u=>a(u))}),i=!0,s===r&&n()})}static or(e){let n=t.resolve(!1);for(let a of e)n=n.next(r=>r?t.resolve(r):a());return n}static forEach(e,n){let a=[];return e.forEach((r,s)=>{a.push(n.call(this,r,s))}),this.waitFor(a)}static mapArray(e,n){return new t((a,r)=>{let s=e.length,i=new Array(s),l=0;for(let u=0;u<s;u++){let c=u;n(e[c]).next(f=>{i[c]=f,++l,l===s&&a(i)},f=>r(f))}})}static doWhile(e,n){return new t((a,r)=>{let s=()=>{e()===!0?n().next(()=>{s()},r):a()};s()})}};function VN(t){let e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function _l(t){return t.name==="IndexedDbTransactionError"}var sl=class{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=a=>this.ae(a),this.ue=a=>n.writeSequenceNumber(a))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};sl.ce=-1;var UN=-1;function Ap(t){return t==null}function Ec(t){return t===0&&1/t==-1/0}function FN(t){return typeof t=="number"&&Number.isInteger(t)&&!Ec(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var l0="";function BN(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=Ex(e)),e=qN(t.get(n),e);return Ex(e)}function qN(t,e){let n=e,a=t.length;for(let r=0;r<a;r++){let s=t.charAt(r);switch(s){case"\0":n+="";break;case l0:n+="";break;default:n+=s}}return n}function Ex(t){return t+l0+""}var zN="remoteDocuments",u0="owner";var c0="mutationQueues";var d0="mutations";var f0="documentMutations",HN="remoteDocumentsV14";var h0="remoteDocumentGlobal";var p0="targets";var m0="targetDocuments";var g0="targetGlobal",y0="collectionParents";var I0="clientMetadata";var _0="bundles";var S0="namedQueries";var GN="indexConfiguration";var jN="indexState";var KN="indexEntries";var v0="documentOverlays";var WN="globals";var XN=[c0,d0,f0,zN,p0,u0,g0,m0,I0,h0,y0,_0,S0],k4=[...XN,v0],YN=[c0,d0,f0,HN,p0,u0,g0,m0,I0,h0,y0,_0,S0,v0],QN=YN,$N=[...QN,GN,jN,KN];var D4=[...$N,WN];function Tx(t){let e=0;for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Sl(t,e){for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function E0(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var dt=class t{constructor(e,n){this.comparator=e,this.root=n||Ma.EMPTY}insert(e,n){return new t(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Ma.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ma.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){let a=this.comparator(e,n.key);if(a===0)return n.value;a<0?n=n.left:a>0&&(n=n.right)}return null}indexOf(e){let n=0,a=this.root;for(;!a.isEmpty();){let r=this.comparator(e,a.key);if(r===0)return n+a.left.size;r<0?a=a.left:(n+=a.left.size+1,a=a.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,a)=>(e(n,a),!1))}toString(){let e=[];return this.inorderTraversal((n,a)=>(e.push(`${n}:${a}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Zo(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Zo(this.root,e,this.comparator,!1)}getReverseIterator(){return new Zo(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Zo(this.root,e,this.comparator,!0)}},Zo=class{constructor(e,n,a,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?a(e.key,n):1,n&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},Ma=class t{constructor(e,n,a,r,s){this.key=e,this.value=n,this.color=a??t.RED,this.left=r??t.EMPTY,this.right=s??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,a,r,s){return new t(e??this.key,n??this.value,a??this.color,r??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,a){let r=this,s=a(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,n,a),null):s===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,a)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let a,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;a=r.right.min(),r=r.copy(a.key,a.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw le(43730,{key:this.key,value:this.value});if(this.right.isRed())throw le(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw le(27949);return e+(this.isRed()?0:1)}};Ma.EMPTY=null,Ma.RED=!0,Ma.BLACK=!1;Ma.EMPTY=new class{constructor(){this.size=0}get key(){throw le(57766)}get value(){throw le(16141)}get color(){throw le(16727)}get left(){throw le(29726)}get right(){throw le(36894)}copy(e,n,a,r,s){return this}insert(e,n,a){return new Ma(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var Ft=class t{constructor(e){this.comparator=e,this.data=new dt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,a)=>(e(n),!1))}forEachInRange(e,n){let a=this.data.getIteratorFrom(e[0]);for(;a.hasNext();){let r=a.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let a;for(a=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();a.hasNext();)if(!e(a.getNext().key))return}firstAfterOrEqual(e){let n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new ap(this.data.getIterator())}getIteratorFrom(e){return new ap(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(a=>{n=n.add(a)}),n}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.data.getIterator(),a=e.data.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(this.comparator(r,s)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(n=>{e.push(n)}),e}toString(){let e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){let n=new t(this.comparator);return n.data=e,n}},ap=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var bi=class t{constructor(e){this.fields=e,e.sort(Pn.comparator)}static empty(){return new t([])}unionWith(e){let n=new Ft(Pn.comparator);for(let a of this.fields)n=n.add(a);for(let a of e)n=n.add(a);return new t(n.toArray())}covers(e){for(let n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return rl(this.fields,e.fields,(n,a)=>n.isEqual(a))}};var rp=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var Wt=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let n=function(r){try{return atob(r)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new rp("Invalid base64 string: "+s):s}}(e);return new t(n)}static fromUint8Array(e){let n=function(r){let s="";for(let i=0;i<r.length;++i)s+=String.fromCharCode(r[i]);return s}(e);return new t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ce(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};Wt.EMPTY_BYTE_STRING=new Wt("");var JN=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function kr(t){if(Ze(!!t,39018),typeof t=="string"){let e=0,n=JN.exec(t);if(Ze(!!n,46558,{timestamp:t}),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}let a=new Date(t);return{seconds:Math.floor(a.getTime()/1e3),nanos:e}}return{seconds:$e(t.seconds),nanos:$e(t.nanos)}}function $e(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Dr(t){return typeof t=="string"?Wt.fromBase64String(t):Wt.fromUint8Array(t)}var T0="server_timestamp",b0="__type__",w0="__previous_value__",C0="__local_write_time__";function qc(t){return(t?.mapValue?.fields||{})[b0]?.stringValue===T0}function xp(t){let e=t.mapValue.fields[w0];return qc(e)?xp(e):e}function Tc(t){let e=kr(t.mapValue.fields[C0].timestampValue);return new _t(e.seconds,e.nanos)}var S_=class{constructor(e,n,a,r,s,i,l,u,c,f,p){this.databaseId=e,this.appId=n,this.persistenceKey=a,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=c,this.isUsingEmulator=f,this.apiKey=p}},sp="(default)",bc=class t{constructor(e,n){this.projectId=e,this.database=n||sp}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===sp}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function L0(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new Y(z.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new bc(t.options.projectId,e)}var VS="__type__",A0="__max__",jh={mapValue:{fields:{__type__:{stringValue:A0}}}},US="__vector__",il="value";function Ds(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?qc(t)?4:R0(t)?9007199254740991:x0(t)?10:11:le(28295,{value:t})}function Fa(t,e){if(t===e)return!0;let n=Ds(t);if(n!==Ds(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Tc(t).isEqual(Tc(e));case 3:return function(r,s){if(typeof r.timestampValue=="string"&&typeof s.timestampValue=="string"&&r.timestampValue.length===s.timestampValue.length)return r.timestampValue===s.timestampValue;let i=kr(r.timestampValue),l=kr(s.timestampValue);return i.seconds===l.seconds&&i.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,s){return Dr(r.bytesValue).isEqual(Dr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,s){return $e(r.geoPointValue.latitude)===$e(s.geoPointValue.latitude)&&$e(r.geoPointValue.longitude)===$e(s.geoPointValue.longitude)}(t,e);case 2:return function(r,s){if("integerValue"in r&&"integerValue"in s)return $e(r.integerValue)===$e(s.integerValue);if("doubleValue"in r&&"doubleValue"in s){let i=$e(r.doubleValue),l=$e(s.doubleValue);return i===l?Ec(i)===Ec(l):isNaN(i)&&isNaN(l)}return!1}(t,e);case 9:return rl(t.arrayValue.values||[],e.arrayValue.values||[],Fa);case 10:case 11:return function(r,s){let i=r.mapValue.fields||{},l=s.mapValue.fields||{};if(Tx(i)!==Tx(l))return!1;for(let u in i)if(i.hasOwnProperty(u)&&(l[u]===void 0||!Fa(i[u],l[u])))return!1;return!0}(t,e);default:return le(52216,{left:t})}}function wc(t,e){return(t.values||[]).find(n=>Fa(n,e))!==void 0}function ol(t,e){if(t===e)return 0;let n=Ds(t),a=Ds(e);if(n!==a)return Ce(n,a);switch(n){case 0:case 9007199254740991:return 0;case 1:return Ce(t.booleanValue,e.booleanValue);case 2:return function(s,i){let l=$e(s.integerValue||s.doubleValue),u=$e(i.integerValue||i.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return bx(t.timestampValue,e.timestampValue);case 4:return bx(Tc(t),Tc(e));case 5:return I_(t.stringValue,e.stringValue);case 6:return function(s,i){let l=Dr(s),u=Dr(i);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(s,i){let l=s.split("/"),u=i.split("/");for(let c=0;c<l.length&&c<u.length;c++){let f=Ce(l[c],u[c]);if(f!==0)return f}return Ce(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,i){let l=Ce($e(s.latitude),$e(i.latitude));return l!==0?l:Ce($e(s.longitude),$e(i.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return wx(t.arrayValue,e.arrayValue);case 10:return function(s,i){let l=s.fields||{},u=i.fields||{},c=l[il]?.arrayValue,f=u[il]?.arrayValue,p=Ce(c?.values?.length||0,f?.values?.length||0);return p!==0?p:wx(c,f)}(t.mapValue,e.mapValue);case 11:return function(s,i){if(s===jh.mapValue&&i===jh.mapValue)return 0;if(s===jh.mapValue)return 1;if(i===jh.mapValue)return-1;let l=s.fields||{},u=Object.keys(l),c=i.fields||{},f=Object.keys(c);u.sort(),f.sort();for(let p=0;p<u.length&&p<f.length;++p){let m=I_(u[p],f[p]);if(m!==0)return m;let v=ol(l[u[p]],c[f[p]]);if(v!==0)return v}return Ce(u.length,f.length)}(t.mapValue,e.mapValue);default:throw le(23264,{he:n})}}function bx(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Ce(t,e);let n=kr(t),a=kr(e),r=Ce(n.seconds,a.seconds);return r!==0?r:Ce(n.nanos,a.nanos)}function wx(t,e){let n=t.values||[],a=e.values||[];for(let r=0;r<n.length&&r<a.length;++r){let s=ol(n[r],a[r]);if(s)return s}return Ce(n.length,a.length)}function ll(t){return v_(t)}function v_(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){let a=kr(n);return`time(${a.seconds},${a.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Dr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ae.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let a="[",r=!0;for(let s of n.values||[])r?r=!1:a+=",",a+=v_(s);return a+"]"}(t.arrayValue):"mapValue"in t?function(n){let a=Object.keys(n.fields||{}).sort(),r="{",s=!0;for(let i of a)s?s=!1:r+=",",r+=`${i}:${v_(n.fields[i])}`;return r+"}"}(t.mapValue):le(61005,{value:t})}function Xh(t){switch(Ds(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=xp(t);return e?16+Xh(e):16;case 5:return 2*t.stringValue.length;case 6:return Dr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(a){return(a.values||[]).reduce((r,s)=>r+Xh(s),0)}(t.arrayValue);case 10:case 11:return function(a){let r=0;return Sl(a.fields,(s,i)=>{r+=s.length+Xh(i)}),r}(t.mapValue);default:throw le(13486,{value:t})}}function zc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function E_(t){return!!t&&"integerValue"in t}function FS(t){return!!t&&"arrayValue"in t}function Cx(t){return!!t&&"nullValue"in t}function Lx(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function c_(t){return!!t&&"mapValue"in t}function x0(t){return(t?.mapValue?.fields||{})[VS]?.stringValue===US}function Ic(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return Sl(t.mapValue.fields,(n,a)=>e.mapValue.fields[n]=Ic(a)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Ic(t.arrayValue.values[n]);return e}return{...t}}function R0(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===A0}var O4={mapValue:{fields:{[VS]:{stringValue:US},[il]:{arrayValue:{}}}}};var Oa=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let a=0;a<e.length-1;++a)if(n=(n.mapValue.fields||{})[e.get(a)],!c_(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ic(n)}setAll(e){let n=Pn.emptyPath(),a={},r=[];e.forEach((i,l)=>{if(!n.isImmediateParentOf(l)){let u=this.getFieldsMap(n);this.applyChanges(u,a,r),a={},r=[],n=l.popLast()}i?a[l.lastSegment()]=Ic(i):r.push(l.lastSegment())});let s=this.getFieldsMap(n);this.applyChanges(s,a,r)}delete(e){let n=this.field(e.popLast());c_(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return Fa(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let a=0;a<e.length;++a){let r=n.mapValue.fields[e.get(a)];c_(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(a)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,a){Sl(n,(r,s)=>e[r]=s);for(let r of a)delete e[r]}clone(){return new t(Ic(this.value))}};var sa=class t{constructor(e,n,a,r,s,i,l){this.key=e,this.documentType=n,this.version=a,this.readTime=r,this.createTime=s,this.data=i,this.documentState=l}static newInvalidDocument(e){return new t(e,0,pe.min(),pe.min(),pe.min(),Oa.empty(),0)}static newFoundDocument(e,n,a,r){return new t(e,1,n,pe.min(),a,r,0)}static newNoDocument(e,n){return new t(e,2,n,pe.min(),pe.min(),Oa.empty(),0)}static newUnknownDocument(e,n){return new t(e,3,n,pe.min(),pe.min(),Oa.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(pe.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Oa.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Oa.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=pe.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var Pr=class{constructor(e,n){this.position=e,this.inclusive=n}};function Ax(t,e,n){let a=0;for(let r=0;r<t.position.length;r++){let s=e[r],i=t.position[r];if(s.field.isKeyField()?a=ae.comparator(ae.fromName(i.referenceValue),n.key):a=ol(i,n.data.field(s.field)),s.dir==="desc"&&(a*=-1),a!==0)break}return a}function xx(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!Fa(t.position[n],e.position[n]))return!1;return!0}var Ps=class{constructor(e,n="asc"){this.field=e,this.dir=n}};function ZN(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var ip=class{},ut=class t extends ip{constructor(e,n,a){super(),this.field=e,this.op=n,this.value=a}static create(e,n,a){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,a):new b_(e,n,a):n==="array-contains"?new L_(e,a):n==="in"?new A_(e,a):n==="not-in"?new x_(e,a):n==="array-contains-any"?new R_(e,a):new t(e,n,a)}static createKeyFieldInFilter(e,n,a){return n==="in"?new w_(e,a):new C_(e,a)}matches(e){let n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(ol(n,this.value)):n!==null&&Ds(this.value)===Ds(n)&&this.matchesComparison(ol(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return le(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},Xn=class t extends ip{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new t(e,n)}matches(e){return k0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function k0(t){return t.op==="and"}function D0(t){return eV(t)&&k0(t)}function eV(t){for(let e of t.filters)if(e instanceof Xn)return!1;return!0}function T_(t){if(t instanceof ut)return t.field.canonicalString()+t.op.toString()+ll(t.value);if(D0(t))return t.filters.map(e=>T_(e)).join(",");{let e=t.filters.map(n=>T_(n)).join(",");return`${t.op}(${e})`}}function P0(t,e){return t instanceof ut?function(a,r){return r instanceof ut&&a.op===r.op&&a.field.isEqual(r.field)&&Fa(a.value,r.value)}(t,e):t instanceof Xn?function(a,r){return r instanceof Xn&&a.op===r.op&&a.filters.length===r.filters.length?a.filters.reduce((s,i,l)=>s&&P0(i,r.filters[l]),!0):!1}(t,e):void le(19439)}function O0(t){return t instanceof ut?function(n){return`${n.field.canonicalString()} ${n.op} ${ll(n.value)}`}(t):t instanceof Xn?function(n){return n.op.toString()+" {"+n.getFilters().map(O0).join(" ,")+"}"}(t):"Filter"}var b_=class extends ut{constructor(e,n,a){super(e,n,a),this.key=ae.fromName(a.referenceValue)}matches(e){let n=ae.comparator(e.key,this.key);return this.matchesComparison(n)}},w_=class extends ut{constructor(e,n){super(e,"in",n),this.keys=M0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}},C_=class extends ut{constructor(e,n){super(e,"not-in",n),this.keys=M0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}};function M0(t,e){return(e.arrayValue?.values||[]).map(n=>ae.fromName(n.referenceValue))}var L_=class extends ut{constructor(e,n){super(e,"array-contains",n)}matches(e){let n=e.data.field(this.field);return FS(n)&&wc(n.arrayValue,this.value)}},A_=class extends ut{constructor(e,n){super(e,"in",n)}matches(e){let n=e.data.field(this.field);return n!==null&&wc(this.value.arrayValue,n)}},x_=class extends ut{constructor(e,n){super(e,"not-in",n)}matches(e){if(wc(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!wc(this.value.arrayValue,n)}},R_=class extends ut{constructor(e,n){super(e,"array-contains-any",n)}matches(e){let n=e.data.field(this.field);return!(!FS(n)||!n.arrayValue.values)&&n.arrayValue.values.some(a=>wc(this.value.arrayValue,a))}};var k_=class{constructor(e,n=null,a=[],r=[],s=null,i=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=a,this.filters=r,this.limit=s,this.startAt=i,this.endAt=l,this.Te=null}};function Rx(t,e=null,n=[],a=[],r=null,s=null,i=null){return new k_(t,e,n,a,r,s,i)}function BS(t){let e=xe(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(a=>T_(a)).join(","),n+="|ob:",n+=e.orderBy.map(a=>function(s){return s.field.canonicalString()+s.dir}(a)).join(","),Ap(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(a=>ll(a)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(a=>ll(a)).join(",")),e.Te=n}return e.Te}function qS(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!ZN(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!P0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!xx(t.startAt,e.startAt)&&xx(t.endAt,e.endAt)}function D_(t){return ae.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var Or=class{constructor(e,n=null,a=[],r=[],s=null,i="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=a,this.filters=r,this.limit=s,this.limitType=i,this.startAt=l,this.endAt=u,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function tV(t,e,n,a,r,s,i,l){return new Or(t,e,n,a,r,s,i,l)}function zS(t){return new Or(t)}function kx(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function nV(t){return ae.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function Rp(t){return t.collectionGroup!==null}function Li(t){let e=xe(t);if(e.Ie===null){e.Ie=[];let n=new Set;for(let s of e.explicitOrderBy)e.Ie.push(s),n.add(s.field.canonicalString());let a=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(i){let l=new Ft(Pn.comparator);return i.filters.forEach(u=>{u.getFlattenedFilters().forEach(c=>{c.isInequality()&&(l=l.add(c.field))})}),l})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new Ps(s,a))}),n.has(Pn.keyField().canonicalString())||e.Ie.push(new Ps(Pn.keyField(),a))}return e.Ie}function Na(t){let e=xe(t);return e.Ee||(e.Ee=aV(e,Li(t))),e.Ee}function aV(t,e){if(t.limitType==="F")return Rx(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let s=r.dir==="desc"?"asc":"desc";return new Ps(r.field,s)});let n=t.endAt?new Pr(t.endAt.position,t.endAt.inclusive):null,a=t.startAt?new Pr(t.startAt.position,t.startAt.inclusive):null;return Rx(t.path,t.collectionGroup,e,t.filters,t.limit,n,a)}}function kp(t,e){let n=t.filters.concat([e]);return new Or(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function N0(t,e){let n=t.explicitOrderBy.concat([e]);return new Or(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function Cc(t,e,n){return new Or(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function V0(t,e){return new Or(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function Dp(t,e){return qS(Na(t),Na(e))&&t.limitType===e.limitType}function U0(t){return`${BS(Na(t))}|lt:${t.limitType}`}function Qo(t){return`Query(target=${function(n){let a=n.path.canonicalString();return n.collectionGroup!==null&&(a+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(a+=`, filters: [${n.filters.map(r=>O0(r)).join(", ")}]`),Ap(n.limit)||(a+=", limit: "+n.limit),n.orderBy.length>0&&(a+=`, orderBy: [${n.orderBy.map(r=>function(i){return`${i.field.canonicalString()} (${i.dir})`}(r)).join(", ")}]`),n.startAt&&(a+=", startAt: ",a+=n.startAt.inclusive?"b:":"a:",a+=n.startAt.position.map(r=>ll(r)).join(",")),n.endAt&&(a+=", endAt: ",a+=n.endAt.inclusive?"a:":"b:",a+=n.endAt.position.map(r=>ll(r)).join(",")),`Target(${a})`}(Na(t))}; limitType=${t.limitType})`}function Pp(t,e){return e.isFoundDocument()&&function(a,r){let s=r.key.path;return a.collectionGroup!==null?r.key.hasCollectionId(a.collectionGroup)&&a.path.isPrefixOf(s):ae.isDocumentKey(a.path)?a.path.isEqual(s):a.path.isImmediateParentOf(s)}(t,e)&&function(a,r){for(let s of Li(a))if(!s.field.isKeyField()&&r.data.field(s.field)===null)return!1;return!0}(t,e)&&function(a,r){for(let s of a.filters)if(!s.matches(r))return!1;return!0}(t,e)&&function(a,r){return!(a.startAt&&!function(i,l,u){let c=Ax(i,l,u);return i.inclusive?c<=0:c<0}(a.startAt,Li(a),r)||a.endAt&&!function(i,l,u){let c=Ax(i,l,u);return i.inclusive?c>=0:c>0}(a.endAt,Li(a),r))}(t,e)}function rV(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function F0(t){return(e,n)=>{let a=!1;for(let r of Li(t)){let s=sV(r,e,n);if(s!==0)return s;a=a||r.field.isKeyField()}return 0}}function sV(t,e,n){let a=t.field.isKeyField()?ae.comparator(e.key,n.key):function(s,i,l){let u=i.data.field(s),c=l.data.field(s);return u!==null&&c!==null?ol(u,c):le(42886)}(t.field,e,n);switch(t.dir){case"asc":return a;case"desc":return-1*a;default:return le(19790,{direction:t.dir})}}var Mr=class{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a!==void 0){for(let[r,s]of a)if(this.equalsFn(r,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){let a=this.mapKeyFn(e),r=this.inner[a];if(r===void 0)return this.inner[a]=[[e,n]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a===void 0)return!1;for(let r=0;r<a.length;r++)if(this.equalsFn(a[r][0],e))return a.length===1?delete this.inner[n]:a.splice(r,1),this.innerSize--,!0;return!1}forEach(e){Sl(this.inner,(n,a)=>{for(let[r,s]of a)e(r,s)})}isEmpty(){return E0(this.inner)}size(){return this.innerSize}};var iV=new dt(ae.comparator);function Os(){return iV}var B0=new dt(ae.comparator);function yc(...t){let e=B0;for(let n of t)e=e.insert(n.key,n);return e}function oV(t){let e=B0;return t.forEach((n,a)=>e=e.insert(n,a.overlayedDocument)),e}function wi(){return _c()}function q0(){return _c()}function _c(){return new Mr(t=>t.toString(),(t,e)=>t.isEqual(e))}var M4=new dt(ae.comparator),lV=new Ft(ae.comparator);function Ae(...t){let e=lV;for(let n of t)e=e.add(n);return e}var uV=new Ft(Ce);function cV(){return uV}function HS(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ec(e)?"-0":e}}function z0(t){return{integerValue:""+t}}function dV(t,e){return FN(e)?z0(e):HS(t,e)}var ul=class{constructor(){this._=void 0}};function fV(t,e,n){return t instanceof Lc?function(r,s){let i={fields:{[b0]:{stringValue:T0},[C0]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return s&&qc(s)&&(s=xp(s)),s&&(i.fields[w0]=s),{mapValue:i}}(n,e):t instanceof cl?H0(t,e):t instanceof dl?G0(t,e):function(r,s){let i=pV(r,s),l=Dx(i)+Dx(r.Ae);return E_(i)&&E_(r.Ae)?z0(l):HS(r.serializer,l)}(t,e)}function hV(t,e,n){return t instanceof cl?H0(t,e):t instanceof dl?G0(t,e):n}function pV(t,e){return t instanceof Ac?function(a){return E_(a)||function(s){return!!s&&"doubleValue"in s}(a)}(e)?e:{integerValue:0}:null}var Lc=class extends ul{},cl=class extends ul{constructor(e){super(),this.elements=e}};function H0(t,e){let n=j0(e);for(let a of t.elements)n.some(r=>Fa(r,a))||n.push(a);return{arrayValue:{values:n}}}var dl=class extends ul{constructor(e){super(),this.elements=e}};function G0(t,e){let n=j0(e);for(let a of t.elements)n=n.filter(r=>!Fa(r,a));return{arrayValue:{values:n}}}var Ac=class extends ul{constructor(e,n){super(),this.serializer=e,this.Ae=n}};function Dx(t){return $e(t.integerValue||t.doubleValue)}function j0(t){return FS(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function mV(t,e){return t.field.isEqual(e.field)&&function(a,r){return a instanceof cl&&r instanceof cl||a instanceof dl&&r instanceof dl?rl(a.elements,r.elements,Fa):a instanceof Ac&&r instanceof Ac?Fa(a.Ae,r.Ae):a instanceof Lc&&r instanceof Lc}(t.transform,e.transform)}var el=class t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function Yh(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var xc=class{};function K0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new op(t.key,el.none()):new Rc(t.key,t.data,el.none());{let n=t.data,a=Oa.empty(),r=new Ft(Pn.comparator);for(let s of e.fields)if(!r.has(s)){let i=n.field(s);i===null&&s.length>1&&(s=s.popLast(),i=n.field(s)),i===null?a.delete(s):a.set(s,i),r=r.add(s)}return new fl(t.key,a,new bi(r.toArray()),el.none())}}function gV(t,e,n){t instanceof Rc?function(r,s,i){let l=r.value.clone(),u=Ox(r.fieldTransforms,s,i.transformResults);l.setAll(u),s.convertToFoundDocument(i.version,l).setHasCommittedMutations()}(t,e,n):t instanceof fl?function(r,s,i){if(!Yh(r.precondition,s))return void s.convertToUnknownDocument(i.version);let l=Ox(r.fieldTransforms,s,i.transformResults),u=s.data;u.setAll(W0(r)),u.setAll(l),s.convertToFoundDocument(i.version,u).setHasCommittedMutations()}(t,e,n):function(r,s,i){s.convertToNoDocument(i.version).setHasCommittedMutations()}(0,e,n)}function Sc(t,e,n,a){return t instanceof Rc?function(s,i,l,u){if(!Yh(s.precondition,i))return l;let c=s.value.clone(),f=Mx(s.fieldTransforms,u,i);return c.setAll(f),i.convertToFoundDocument(i.version,c).setHasLocalMutations(),null}(t,e,n,a):t instanceof fl?function(s,i,l,u){if(!Yh(s.precondition,i))return l;let c=Mx(s.fieldTransforms,u,i),f=i.data;return f.setAll(W0(s)),f.setAll(c),i.convertToFoundDocument(i.version,f).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,a):function(s,i,l){return Yh(s.precondition,i)?(i.convertToNoDocument(i.version).setHasLocalMutations(),null):l}(t,e,n)}function Px(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(a,r){return a===void 0&&r===void 0||!(!a||!r)&&rl(a,r,(s,i)=>mV(s,i))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var Rc=class extends xc{constructor(e,n,a,r=[]){super(),this.key=e,this.value=n,this.precondition=a,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},fl=class extends xc{constructor(e,n,a,r,s=[]){super(),this.key=e,this.data=n,this.fieldMask=a,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}};function W0(t){let e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){let a=t.data.field(n);e.set(n,a)}}),e}function Ox(t,e,n){let a=new Map;Ze(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let r=0;r<n.length;r++){let s=t[r],i=s.transform,l=e.data.field(s.field);a.set(s.field,hV(i,l,n[r]))}return a}function Mx(t,e,n){let a=new Map;for(let r of t){let s=r.transform,i=n.data.field(r.field);a.set(r.field,fV(s,i,e))}return a}var op=class extends xc{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var P_=class{constructor(e,n,a,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=a,this.mutations=r}applyToRemoteDocument(e,n){let a=n.mutationResults;for(let r=0;r<this.mutations.length;r++){let s=this.mutations[r];s.key.isEqual(e.key)&&gV(s,e,a[r])}}applyToLocalView(e,n){for(let a of this.baseMutations)a.key.isEqual(e.key)&&(n=Sc(a,e,n,this.localWriteTime));for(let a of this.mutations)a.key.isEqual(e.key)&&(n=Sc(a,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){let a=q0();return this.mutations.forEach(r=>{let s=e.get(r.key),i=s.overlayedDocument,l=this.applyToLocalView(i,s.mutatedFields);l=n.has(r.key)?null:l;let u=K0(i,l);u!==null&&a.set(r.key,u),i.isValidDocument()||i.convertToNoDocument(pe.min())}),a}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),Ae())}isEqual(e){return this.batchId===e.batchId&&rl(this.mutations,e.mutations,(n,a)=>Px(n,a))&&rl(this.baseMutations,e.baseMutations,(n,a)=>Px(n,a))}};var O_=class{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var M_=class{constructor(e,n){this.count=e,this.unchangedNames=n}};var yt,Le;function X0(t){if(t===void 0)return xr("GRPC error has no .code"),z.UNKNOWN;switch(t){case yt.OK:return z.OK;case yt.CANCELLED:return z.CANCELLED;case yt.UNKNOWN:return z.UNKNOWN;case yt.DEADLINE_EXCEEDED:return z.DEADLINE_EXCEEDED;case yt.RESOURCE_EXHAUSTED:return z.RESOURCE_EXHAUSTED;case yt.INTERNAL:return z.INTERNAL;case yt.UNAVAILABLE:return z.UNAVAILABLE;case yt.UNAUTHENTICATED:return z.UNAUTHENTICATED;case yt.INVALID_ARGUMENT:return z.INVALID_ARGUMENT;case yt.NOT_FOUND:return z.NOT_FOUND;case yt.ALREADY_EXISTS:return z.ALREADY_EXISTS;case yt.PERMISSION_DENIED:return z.PERMISSION_DENIED;case yt.FAILED_PRECONDITION:return z.FAILED_PRECONDITION;case yt.ABORTED:return z.ABORTED;case yt.OUT_OF_RANGE:return z.OUT_OF_RANGE;case yt.UNIMPLEMENTED:return z.UNIMPLEMENTED;case yt.DATA_LOSS:return z.DATA_LOSS;default:return le(39323,{code:t})}}(Le=yt||(yt={}))[Le.OK=0]="OK",Le[Le.CANCELLED=1]="CANCELLED",Le[Le.UNKNOWN=2]="UNKNOWN",Le[Le.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Le[Le.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Le[Le.NOT_FOUND=5]="NOT_FOUND",Le[Le.ALREADY_EXISTS=6]="ALREADY_EXISTS",Le[Le.PERMISSION_DENIED=7]="PERMISSION_DENIED",Le[Le.UNAUTHENTICATED=16]="UNAUTHENTICATED",Le[Le.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Le[Le.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Le[Le.ABORTED=10]="ABORTED",Le[Le.OUT_OF_RANGE=11]="OUT_OF_RANGE",Le[Le.UNIMPLEMENTED=12]="UNIMPLEMENTED",Le[Le.INTERNAL=13]="INTERNAL",Le[Le.UNAVAILABLE=14]="UNAVAILABLE",Le[Le.DATA_LOSS=15]="DATA_LOSS";var yV=null;function IV(){return new TextEncoder}var _V=new wr([4294967295,4294967295],0);function Nx(t){let e=IV().encode(t),n=new a_;return n.update(e),new Uint8Array(n.digest())}function Vx(t){let e=new DataView(t.buffer),n=e.getUint32(0,!0),a=e.getUint32(4,!0),r=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new wr([n,a],0),new wr([r,s],0)]}var N_=class t{constructor(e,n,a){if(this.bitmap=e,this.padding=n,this.hashCount=a,n<0||n>=8)throw new Ci(`Invalid padding: ${n}`);if(a<0)throw new Ci(`Invalid hash count: ${a}`);if(e.length>0&&this.hashCount===0)throw new Ci(`Invalid hash count: ${a}`);if(e.length===0&&n!==0)throw new Ci(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=wr.fromNumber(this.ge)}ye(e,n,a){let r=e.add(n.multiply(wr.fromNumber(a)));return r.compare(_V)===1&&(r=new wr([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let n=Nx(e),[a,r]=Vx(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);if(!this.we(i))return!1}return!0}static create(e,n,a){let r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new t(s,r,n);return a.forEach(l=>i.insert(l)),i}insert(e){if(this.ge===0)return;let n=Nx(e),[a,r]=Vx(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);this.be(i)}}be(e){let n=Math.floor(e/8),a=e%8;this.bitmap[n]|=1<<a}},Ci=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var lp=class t{constructor(e,n,a,r,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=a,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,a){let r=new Map;return r.set(e,kc.createSynthesizedTargetChangeForCurrentChange(e,n,a)),new t(pe.min(),r,new dt(Ce),Os(),Ae())}},kc=class t{constructor(e,n,a,r,s){this.resumeToken=e,this.current=n,this.addedDocuments=a,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,a){return new t(a,n,Ae(),Ae(),Ae())}};var tl=class{constructor(e,n,a,r){this.Se=e,this.removedTargetIds=n,this.key=a,this.De=r}},up=class{constructor(e,n){this.targetId=e,this.Ce=n}},cp=class{constructor(e,n,a=Wt.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=a,this.cause=r}},dp=class{constructor(){this.ve=0,this.Fe=Ux(),this.Me=Wt.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Ae(),n=Ae(),a=Ae();return this.Fe.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:a=a.add(r);break;default:le(38017,{changeType:s})}}),new kc(this.Me,this.xe,e,n,a)}Ke(){this.Oe=!1,this.Fe=Ux()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,Ze(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},V_=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=Os(),this.He=Kh(),this.Je=Kh(),this.Ze=new dt(Ce)}Xe(e){for(let n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(let n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{let a=this.nt(n);switch(e.state){case 0:this.rt(n)&&a.Le(e.resumeToken);break;case 1:a.We(),a.Ne||a.Ke(),a.Le(e.resumeToken);break;case 2:a.We(),a.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(a.Qe(),a.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),a.Le(e.resumeToken));break;default:le(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((a,r)=>{this.rt(r)&&n(r)})}st(e){let n=e.targetId,a=e.Ce.count,r=this.ot(n);if(r){let s=r.target;if(D_(s))if(a===0){let i=new ae(s.path);this.et(n,i,sa.newNoDocument(i,pe.min()))}else Ze(a===1,20013,{expectedCount:a});else{let i=this._t(n);if(i!==a){let l=this.ut(e),u=l?this.ct(l,e,i):1;if(u!==0){this.it(n);let c=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,c)}yV?.lt(function(f,p,m,v,R){let D={localCacheCount:f,existenceFilterCount:p.count,databaseId:m.database,projectId:m.projectId},x=p.unchangedNames;return x&&(D.bloomFilter={applied:R===0,hashCount:x?.hashCount??0,bitmapLength:x?.bits?.bitmap?.length??0,padding:x?.bits?.padding??0,mightContain:T=>v?.mightContain(T)??!1}),D}(i,e.Ce,this.Ge.ht(),l,u))}}}}ut(e){let n=e.Ce.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:a="",padding:r=0},hashCount:s=0}=n,i,l;try{i=Dr(a).toUint8Array()}catch(u){if(u instanceof rp)return Rr("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new N_(i,r,s)}catch(u){return Rr(u instanceof Ci?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.ge===0?null:l}ct(e,n,a){return n.Ce.count===a-this.Pt(e,n.targetId)?0:2}Pt(e,n){let a=this.Ge.getRemoteKeysForTarget(n),r=0;return a.forEach(s=>{let i=this.Ge.ht(),l=`projects/${i.projectId}/databases/${i.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.et(n,s,null),r++)}),r}Tt(e){let n=new Map;this.ze.forEach((s,i)=>{let l=this.ot(i);if(l){if(s.current&&D_(l.target)){let u=new ae(l.target.path);this.It(u).has(i)||this.Et(i,u)||this.et(i,u,sa.newNoDocument(u,e))}s.Be&&(n.set(i,s.ke()),s.Ke())}});let a=Ae();this.Je.forEach((s,i)=>{let l=!0;i.forEachWhile(u=>{let c=this.ot(u);return!c||c.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(a=a.add(s))}),this.je.forEach((s,i)=>i.setReadTime(e));let r=new lp(e,n,this.Ze,this.je,a);return this.je=Os(),this.He=Kh(),this.Je=Kh(),this.Ze=new dt(Ce),r}Ye(e,n){if(!this.rt(e))return;let a=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,a),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,a){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,n)?r.qe(n,1):r.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),a&&(this.je=this.je.insert(n,a))}removeTarget(e){this.ze.delete(e)}_t(e){let n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new dp,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new Ft(Ce),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new Ft(Ce),this.He=this.He.insert(e,n)),n}rt(e){let n=this.ot(e)!==null;return n||J("WatchChangeAggregator","Detected inactive target",e),n}ot(e){let n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new dp),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}};function Kh(){return new dt(ae.comparator)}function Ux(){return new dt(ae.comparator)}var SV={asc:"ASCENDING",desc:"DESCENDING"},vV={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},EV={and:"AND",or:"OR"},U_=class{constructor(e,n){this.databaseId=e,this.useProto3Json=n}};function F_(t,e){return t.useProto3Json||Ap(e)?e:{value:e}}function B_(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Y0(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function nl(t){return Ze(!!t,49232),pe.fromTimestamp(function(n){let a=kr(n);return new _t(a.seconds,a.nanos)}(t))}function Q0(t,e){return q_(t,e).canonicalString()}function q_(t,e){let n=function(r){return new Je(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?n:n.child(e)}function $0(t){let e=Je.fromString(t);return Ze(nR(e),10190,{key:e.toString()}),e}function d_(t,e){let n=$0(e);if(n.get(1)!==t.databaseId.projectId)throw new Y(z.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new Y(z.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ae(Z0(n))}function J0(t,e){return Q0(t.databaseId,e)}function TV(t){let e=$0(t);return e.length===4?Je.emptyPath():Z0(e)}function Fx(t){return new Je(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function Z0(t){return Ze(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function bV(t,e){let n;if("targetChange"in e){e.targetChange;let a=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:le(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],s=function(c,f){return c.useProto3Json?(Ze(f===void 0||typeof f=="string",58123),Wt.fromBase64String(f||"")):(Ze(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Wt.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),i=e.targetChange.cause,l=i&&function(c){let f=c.code===void 0?z.UNKNOWN:X0(c.code);return new Y(f,c.message||"")}(i);n=new cp(a,r,s,l||null)}else if("documentChange"in e){e.documentChange;let a=e.documentChange;a.document,a.document.name,a.document.updateTime;let r=d_(t,a.document.name),s=nl(a.document.updateTime),i=a.document.createTime?nl(a.document.createTime):pe.min(),l=new Oa({mapValue:{fields:a.document.fields}}),u=sa.newFoundDocument(r,s,i,l),c=a.targetIds||[],f=a.removedTargetIds||[];n=new tl(c,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;let a=e.documentDelete;a.document;let r=d_(t,a.document),s=a.readTime?nl(a.readTime):pe.min(),i=sa.newNoDocument(r,s),l=a.removedTargetIds||[];n=new tl([],l,i.key,i)}else if("documentRemove"in e){e.documentRemove;let a=e.documentRemove;a.document;let r=d_(t,a.document),s=a.removedTargetIds||[];n=new tl([],s,r,null)}else{if(!("filter"in e))return le(11601,{Vt:e});{e.filter;let a=e.filter;a.targetId;let{count:r=0,unchangedNames:s}=a,i=new M_(r,s),l=a.targetId;n=new up(l,i)}}return n}function wV(t,e){return{documents:[J0(t,e.path)]}}function CV(t,e){let n={structuredQuery:{}},a=e.path,r;e.collectionGroup!==null?(r=a,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=a.popLast(),n.structuredQuery.from=[{collectionId:a.lastSegment()}]),n.parent=J0(t,r);let s=function(c){if(c.length!==0)return tR(Xn.create(c,"and"))}(e.filters);s&&(n.structuredQuery.where=s);let i=function(c){if(c.length!==0)return c.map(f=>function(m){return{field:$o(m.field),direction:xV(m.dir)}}(f))}(e.orderBy);i&&(n.structuredQuery.orderBy=i);let l=F_(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{ft:n,parent:r}}function LV(t){let e=TV(t.parent),n=t.structuredQuery,a=n.from?n.from.length:0,r=null;if(a>0){Ze(a===1,65062);let f=n.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(p){let m=eR(p);return m instanceof Xn&&D0(m)?m.getFilters():[m]}(n.where));let i=[];n.orderBy&&(i=function(p){return p.map(m=>function(R){return new Ps(Jo(R.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(m))}(n.orderBy));let l=null;n.limit&&(l=function(p){let m;return m=typeof p=="object"?p.value:p,Ap(m)?null:m}(n.limit));let u=null;n.startAt&&(u=function(p){let m=!!p.before,v=p.values||[];return new Pr(v,m)}(n.startAt));let c=null;return n.endAt&&(c=function(p){let m=!p.before,v=p.values||[];return new Pr(v,m)}(n.endAt)),tV(e,r,i,s,l,"F",u,c)}function AV(t,e){let n=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return le(28987,{purpose:r})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function eR(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":let a=Jo(n.unaryFilter.field);return ut.create(a,"==",{doubleValue:NaN});case"IS_NULL":let r=Jo(n.unaryFilter.field);return ut.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let s=Jo(n.unaryFilter.field);return ut.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let i=Jo(n.unaryFilter.field);return ut.create(i,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return le(61313);default:return le(60726)}}(t):t.fieldFilter!==void 0?function(n){return ut.create(Jo(n.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return le(58110);default:return le(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return Xn.create(n.compositeFilter.filters.map(a=>eR(a)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return le(1026)}}(n.compositeFilter.op))}(t):le(30097,{filter:t})}function xV(t){return SV[t]}function RV(t){return vV[t]}function kV(t){return EV[t]}function $o(t){return{fieldPath:t.canonicalString()}}function Jo(t){return Pn.fromServerFormat(t.fieldPath)}function tR(t){return t instanceof ut?function(n){if(n.op==="=="){if(Lx(n.value))return{unaryFilter:{field:$o(n.field),op:"IS_NAN"}};if(Cx(n.value))return{unaryFilter:{field:$o(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(Lx(n.value))return{unaryFilter:{field:$o(n.field),op:"IS_NOT_NAN"}};if(Cx(n.value))return{unaryFilter:{field:$o(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:$o(n.field),op:RV(n.op),value:n.value}}}(t):t instanceof Xn?function(n){let a=n.getFilters().map(r=>tR(r));return a.length===1?a[0]:{compositeFilter:{op:kV(n.op),filters:a}}}(t):le(54877,{filter:t})}function nR(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function aR(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var Dc=class t{constructor(e,n,a,r,s=pe.min(),i=pe.min(),l=Wt.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=a,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var z_=class{constructor(e){this.yt=e}};function rR(t){let e=LV({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Cc(e,e.limit,"L"):e}var fp=class{constructor(){}Dt(e,n){this.Ct(e,n),n.vt()}Ct(e,n){if("nullValue"in e)this.Ft(n,5);else if("booleanValue"in e)this.Ft(n,10),n.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(n,15),n.Mt($e(e.integerValue));else if("doubleValue"in e){let a=$e(e.doubleValue);isNaN(a)?this.Ft(n,13):(this.Ft(n,15),Ec(a)?n.Mt(0):n.Mt(a))}else if("timestampValue"in e){let a=e.timestampValue;this.Ft(n,20),typeof a=="string"&&(a=kr(a)),n.xt(`${a.seconds||""}`),n.Mt(a.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,n),this.Nt(n);else if("bytesValue"in e)this.Ft(n,30),n.Bt(Dr(e.bytesValue)),this.Nt(n);else if("referenceValue"in e)this.Lt(e.referenceValue,n);else if("geoPointValue"in e){let a=e.geoPointValue;this.Ft(n,45),n.Mt(a.latitude||0),n.Mt(a.longitude||0)}else"mapValue"in e?R0(e)?this.Ft(n,Number.MAX_SAFE_INTEGER):x0(e)?this.kt(e.mapValue,n):(this.Kt(e.mapValue,n),this.Nt(n)):"arrayValue"in e?(this.qt(e.arrayValue,n),this.Nt(n)):le(19022,{Ut:e})}Ot(e,n){this.Ft(n,25),this.$t(e,n)}$t(e,n){n.xt(e)}Kt(e,n){let a=e.fields||{};this.Ft(n,55);for(let r of Object.keys(a))this.Ot(r,n),this.Ct(a[r],n)}kt(e,n){let a=e.fields||{};this.Ft(n,53);let r=il,s=a[r].arrayValue?.values?.length||0;this.Ft(n,15),n.Mt($e(s)),this.Ot(r,n),this.Ct(a[r],n)}qt(e,n){let a=e.values||[];this.Ft(n,50);for(let r of a)this.Ct(r,n)}Lt(e,n){this.Ft(n,37),ae.fromName(e).path.forEach(a=>{this.Ft(n,60),this.$t(a,n)})}Ft(e,n){e.Mt(n)}Nt(e){e.Mt(2)}};fp.Wt=new fp;var H_=class{constructor(){this.Sn=new G_}addToCollectionParentIndex(e,n){return this.Sn.add(n),H.resolve()}getCollectionParents(e,n){return H.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return H.resolve()}deleteFieldIndex(e,n){return H.resolve()}deleteAllFieldIndexes(e){return H.resolve()}createTargetIndexes(e,n){return H.resolve()}getDocumentsMatchingTarget(e,n){return H.resolve(null)}getIndexType(e,n){return H.resolve(0)}getFieldIndexes(e,n){return H.resolve([])}getNextCollectionGroupToUpdate(e){return H.resolve(null)}getMinOffset(e,n){return H.resolve(Ri.min())}getMinOffsetFromCollectionGroup(e,n){return H.resolve(Ri.min())}updateCollectionGroup(e,n,a){return H.resolve()}updateIndexEntries(e,n){return H.resolve()}},G_=class{constructor(){this.index={}}add(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n]||new Ft(Je.comparator),s=!r.has(a);return this.index[n]=r.add(a),s}has(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n];return r&&r.has(a)}getEntries(e){return(this.index[e]||new Ft(Je.comparator)).toArray()}};var N4=new Uint8Array(0);var Bx={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},sR=41943040,Wn=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,a){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=a}};Wn.DEFAULT_COLLECTION_PERCENTILE=10,Wn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Wn.DEFAULT=new Wn(sR,Wn.DEFAULT_COLLECTION_PERCENTILE,Wn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Wn.DISABLED=new Wn(-1,0,0);var Pc=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var qx="LruGarbageCollector",DV=1048576;function zx([t,e],[n,a]){let r=Ce(t,n);return r===0?Ce(e,a):r}var j_=class{constructor(e){this.Pr=e,this.buffer=new Ft(zx),this.Tr=0}Ir(){return++this.Tr}Er(e){let n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{let a=this.buffer.last();zx(n,a)<0&&(this.buffer=this.buffer.delete(a).add(n))}}get maxValue(){return this.buffer.last()[0]}},K_=class{constructor(e,n,a){this.garbageCollector=e,this.asyncQueue=n,this.localStore=a,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){J(qx,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){_l(n)?J(qx,"Ignoring IndexedDB error during garbage collection: ",n):await Lp(n)}await this.Ar(3e5)})}},W_=class{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(a=>Math.floor(n/100*a))}nthSequenceNumber(e,n){if(n===0)return H.resolve(sl.ce);let a=new j_(n);return this.Vr.forEachTarget(e,r=>a.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>a.Er(r))).next(()=>a.maxValue)}removeTargets(e,n,a){return this.Vr.removeTargets(e,n,a)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(J("LruGarbageCollector","Garbage collection skipped; disabled"),H.resolve(Bx)):this.getCacheSize(e).next(a=>a<this.params.cacheSizeCollectionThreshold?(J("LruGarbageCollector",`Garbage collection skipped; Cache size ${a} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Bx):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let a,r,s,i,l,u,c,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(J("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),r=this.params.maximumSequenceNumbersToCollect):r=p,i=Date.now(),this.nthSequenceNumber(e,r))).next(p=>(a=p,l=Date.now(),this.removeTargets(e,a,n))).next(p=>(s=p,u=Date.now(),this.removeOrphanedDocuments(e,a))).next(p=>(c=Date.now(),Yo()<=ye.DEBUG&&J("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-f}ms
	Determined least recently used ${r} in `+(l-i)+`ms
	Removed ${s} targets in `+(u-l)+`ms
	Removed ${p} documents in `+(c-u)+`ms
Total Duration: ${c-f}ms`),H.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:p})))}};function PV(t,e){return new W_(t,e)}var X_=class{constructor(){this.changes=new Mr(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,sa.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();let a=this.changes.get(n);return a!==void 0?H.resolve(a):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var Y_=class{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}};var Q_=class{constructor(e,n,a,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=a,this.indexManager=r}getDocument(e,n){let a=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(a=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(a!==null&&Sc(a.mutation,r,bi.empty(),_t.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.getLocalViewOfDocuments(e,a,Ae()).next(()=>a))}getLocalViewOfDocuments(e,n,a=Ae()){let r=wi();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,a).next(s=>{let i=yc();return s.forEach((l,u)=>{i=i.insert(l,u.overlayedDocument)}),i}))}getOverlayedDocuments(e,n){let a=wi();return this.populateOverlays(e,a,n).next(()=>this.computeViews(e,n,a,Ae()))}populateOverlays(e,n,a){let r=[];return a.forEach(s=>{n.has(s)||r.push(s)}),this.documentOverlayCache.getOverlays(e,r).next(s=>{s.forEach((i,l)=>{n.set(i,l)})})}computeViews(e,n,a,r){let s=Os(),i=_c(),l=function(){return _c()}();return n.forEach((u,c)=>{let f=a.get(c.key);r.has(c.key)&&(f===void 0||f.mutation instanceof fl)?s=s.insert(c.key,c):f!==void 0?(i.set(c.key,f.mutation.getFieldMask()),Sc(f.mutation,c,f.mutation.getFieldMask(),_t.now())):i.set(c.key,bi.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((c,f)=>i.set(c,f)),n.forEach((c,f)=>l.set(c,new Y_(f,i.get(c)??null))),l))}recalculateAndSaveOverlays(e,n){let a=_c(),r=new dt((i,l)=>i-l),s=Ae();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(i=>{for(let l of i)l.keys().forEach(u=>{let c=n.get(u);if(c===null)return;let f=a.get(u)||bi.empty();f=l.applyToLocalView(c,f),a.set(u,f);let p=(r.get(l.batchId)||Ae()).add(u);r=r.insert(l.batchId,p)})}).next(()=>{let i=[],l=r.getReverseIterator();for(;l.hasNext();){let u=l.getNext(),c=u.key,f=u.value,p=q0();f.forEach(m=>{if(!s.has(m)){let v=K0(n.get(m),a.get(m));v!==null&&p.set(m,v),s=s.add(m)}}),i.push(this.documentOverlayCache.saveOverlays(e,c,p))}return H.waitFor(i)}).next(()=>a)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.recalculateAndSaveOverlays(e,a))}getDocumentsMatchingQuery(e,n,a,r){return nV(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):Rp(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,a,r):this.getDocumentsMatchingCollectionQuery(e,n,a,r)}getNextDocuments(e,n,a,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,a,r).next(s=>{let i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,a.largestBatchId,r-s.size):H.resolve(wi()),l=vc,u=s;return i.next(c=>H.forEach(c,(f,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),s.get(f)?H.resolve():this.remoteDocumentCache.getEntry(e,f).next(m=>{u=u.insert(f,m)}))).next(()=>this.populateOverlays(e,c,s)).next(()=>this.computeViews(e,u,c,Ae())).next(f=>({batchId:l,changes:oV(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ae(n)).next(a=>{let r=yc();return a.isFoundDocument()&&(r=r.insert(a.key,a)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,a,r){let s=n.collectionGroup,i=yc();return this.indexManager.getCollectionParents(e,s).next(l=>H.forEach(l,u=>{let c=function(p,m){return new Or(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,c,a,r).next(f=>{f.forEach((p,m)=>{i=i.insert(p,m)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,n,a,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,a.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,a,s,r))).next(i=>{s.forEach((u,c)=>{let f=c.getKey();i.get(f)===null&&(i=i.insert(f,sa.newInvalidDocument(f)))});let l=yc();return i.forEach((u,c)=>{let f=s.get(u);f!==void 0&&Sc(f.mutation,c,bi.empty(),_t.now()),Pp(n,c)&&(l=l.insert(u,c))}),l})}};var $_=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return H.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(r){return{id:r.id,version:r.version,createTime:nl(r.createTime)}}(n)),H.resolve()}getNamedQuery(e,n){return H.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(r){return{name:r.name,query:rR(r.bundledQuery),readTime:nl(r.readTime)}}(n)),H.resolve()}};var J_=class{constructor(){this.overlays=new dt(ae.comparator),this.Lr=new Map}getOverlay(e,n){return H.resolve(this.overlays.get(n))}getOverlays(e,n){let a=wi();return H.forEach(n,r=>this.getOverlay(e,r).next(s=>{s!==null&&a.set(r,s)})).next(()=>a)}saveOverlays(e,n,a){return a.forEach((r,s)=>{this.bt(e,n,s)}),H.resolve()}removeOverlaysForBatchId(e,n,a){let r=this.Lr.get(a);return r!==void 0&&(r.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(a)),H.resolve()}getOverlaysForCollection(e,n,a){let r=wi(),s=n.length+1,i=new ae(n.child("")),l=this.overlays.getIteratorFrom(i);for(;l.hasNext();){let u=l.getNext().value,c=u.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===s&&u.largestBatchId>a&&r.set(u.getKey(),u)}return H.resolve(r)}getOverlaysForCollectionGroup(e,n,a,r){let s=new dt((c,f)=>c-f),i=this.overlays.getIterator();for(;i.hasNext();){let c=i.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>a){let f=s.get(c.largestBatchId);f===null&&(f=wi(),s=s.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}let l=wi(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((c,f)=>l.set(c,f)),!(l.size()>=r)););return H.resolve(l)}bt(e,n,a){let r=this.overlays.get(a.key);if(r!==null){let i=this.Lr.get(r.largestBatchId).delete(a.key);this.Lr.set(r.largestBatchId,i)}this.overlays=this.overlays.insert(a.key,new O_(n,a));let s=this.Lr.get(n);s===void 0&&(s=Ae(),this.Lr.set(n,s)),this.Lr.set(n,s.add(a.key))}};var Z_=class{constructor(){this.sessionToken=Wt.EMPTY_BYTE_STRING}getSessionToken(e){return H.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,H.resolve()}};var Oc=class{constructor(){this.kr=new Ft(It.Kr),this.qr=new Ft(It.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){let a=new It(e,n);this.kr=this.kr.add(a),this.qr=this.qr.add(a)}$r(e,n){e.forEach(a=>this.addReference(a,n))}removeReference(e,n){this.Wr(new It(e,n))}Qr(e,n){e.forEach(a=>this.removeReference(a,n))}Gr(e){let n=new ae(new Je([])),a=new It(n,e),r=new It(n,e+1),s=[];return this.qr.forEachInRange([a,r],i=>{this.Wr(i),s.push(i.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let n=new ae(new Je([])),a=new It(n,e),r=new It(n,e+1),s=Ae();return this.qr.forEachInRange([a,r],i=>{s=s.add(i.key)}),s}containsKey(e){let n=new It(e,0),a=this.kr.firstAfterOrEqual(n);return a!==null&&e.isEqual(a.key)}},It=class{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return ae.comparator(e.key,n.key)||Ce(e.Hr,n.Hr)}static Ur(e,n){return Ce(e.Hr,n.Hr)||ae.comparator(e.key,n.key)}};var eS=class{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new Ft(It.Kr)}checkEmpty(e){return H.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,a,r){let s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new P_(s,n,a,r);this.mutationQueue.push(i);for(let l of r)this.Jr=this.Jr.add(new It(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return H.resolve(i)}lookupMutationBatch(e,n){return H.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){let a=n+1,r=this.Xr(a),s=r<0?0:r;return H.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return H.resolve(this.mutationQueue.length===0?UN:this.Yn-1)}getAllMutationBatches(e){return H.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){let a=new It(n,0),r=new It(n,Number.POSITIVE_INFINITY),s=[];return this.Jr.forEachInRange([a,r],i=>{let l=this.Zr(i.Hr);s.push(l)}),H.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let a=new Ft(Ce);return n.forEach(r=>{let s=new It(r,0),i=new It(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([s,i],l=>{a=a.add(l.Hr)})}),H.resolve(this.Yr(a))}getAllMutationBatchesAffectingQuery(e,n){let a=n.path,r=a.length+1,s=a;ae.isDocumentKey(s)||(s=s.child(""));let i=new It(new ae(s),0),l=new Ft(Ce);return this.Jr.forEachWhile(u=>{let c=u.key.path;return!!a.isPrefixOf(c)&&(c.length===r&&(l=l.add(u.Hr)),!0)},i),H.resolve(this.Yr(l))}Yr(e){let n=[];return e.forEach(a=>{let r=this.Zr(a);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){Ze(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let a=this.Jr;return H.forEach(n.mutations,r=>{let s=new It(r.key,n.batchId);return a=a.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=a})}nr(e){}containsKey(e,n){let a=new It(n,0),r=this.Jr.firstAfterOrEqual(a);return H.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,H.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}};var tS=class{constructor(e){this.ti=e,this.docs=function(){return new dt(ae.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){let a=n.key,r=this.docs.get(a),s=r?r.size:0,i=this.ti(n);return this.docs=this.docs.insert(a,{document:n.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,a.path.popLast())}removeEntry(e){let n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){let a=this.docs.get(n);return H.resolve(a?a.document.mutableCopy():sa.newInvalidDocument(n))}getEntries(e,n){let a=Os();return n.forEach(r=>{let s=this.docs.get(r);a=a.insert(r,s?s.document.mutableCopy():sa.newInvalidDocument(r))}),H.resolve(a)}getDocumentsMatchingQuery(e,n,a,r){let s=Os(),i=n.path,l=new ae(i.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){let{key:c,value:{document:f}}=u.getNext();if(!i.isPrefixOf(c.path))break;c.path.length>i.length+1||MN(ON(f),a)<=0||(r.has(f.key)||Pp(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return H.resolve(s)}getAllFromCollectionGroup(e,n,a,r){le(9500)}ni(e,n){return H.forEach(this.docs,a=>n(a))}newChangeBuffer(e){return new nS(this)}getSize(e){return H.resolve(this.size)}},nS=class extends X_{constructor(e){super(),this.Mr=e}applyChanges(e){let n=[];return this.changes.forEach((a,r)=>{r.isValidDocument()?n.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(a)}),H.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}};var aS=class{constructor(e){this.persistence=e,this.ri=new Mr(n=>BS(n),qS),this.lastRemoteSnapshotVersion=pe.min(),this.highestTargetId=0,this.ii=0,this.si=new Oc,this.targetCount=0,this.oi=Pc._r()}forEachTarget(e,n){return this.ri.forEach((a,r)=>n(r)),H.resolve()}getLastRemoteSnapshotVersion(e){return H.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return H.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),H.resolve(this.highestTargetId)}setTargetsMetadata(e,n,a){return a&&(this.lastRemoteSnapshotVersion=a),n>this.ii&&(this.ii=n),H.resolve()}lr(e){this.ri.set(e.target,e);let n=e.targetId;n>this.highestTargetId&&(this.oi=new Pc(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,H.resolve()}updateTargetData(e,n){return this.lr(n),H.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,H.resolve()}removeTargets(e,n,a){let r=0,s=[];return this.ri.forEach((i,l)=>{l.sequenceNumber<=n&&a.get(l.targetId)===null&&(this.ri.delete(i),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),r++)}),H.waitFor(s).next(()=>r)}getTargetCount(e){return H.resolve(this.targetCount)}getTargetData(e,n){let a=this.ri.get(n)||null;return H.resolve(a)}addMatchingKeys(e,n,a){return this.si.$r(n,a),H.resolve()}removeMatchingKeys(e,n,a){this.si.Qr(n,a);let r=this.persistence.referenceDelegate,s=[];return r&&n.forEach(i=>{s.push(r.markPotentiallyOrphaned(e,i))}),H.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),H.resolve()}getMatchingKeysForTargetId(e,n){let a=this.si.jr(n);return H.resolve(a)}containsKey(e,n){return H.resolve(this.si.containsKey(n))}};var hp=class{constructor(e,n){this._i={},this.overlays={},this.ai=new sl(0),this.ui=!1,this.ui=!0,this.ci=new Z_,this.referenceDelegate=e(this),this.li=new aS(this),this.indexManager=new H_,this.remoteDocumentCache=function(r){return new tS(r)}(a=>this.referenceDelegate.hi(a)),this.serializer=new z_(n),this.Pi=new $_(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new J_,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let a=this._i[e.toKey()];return a||(a=new eS(n,this.referenceDelegate),this._i[e.toKey()]=a),a}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,a){J("MemoryPersistence","Starting transaction:",e);let r=new rS(this.ai.next());return this.referenceDelegate.Ti(),a(r).next(s=>this.referenceDelegate.Ii(r).next(()=>s)).toPromise().then(s=>(r.raiseOnCommittedEvent(),s))}Ei(e,n){return H.or(Object.values(this._i).map(a=>()=>a.containsKey(e,n)))}},rS=class extends __{constructor(e){super(),this.currentSequenceNumber=e}},sS=class t{constructor(e){this.persistence=e,this.Ri=new Oc,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw le(60996)}addReference(e,n,a){return this.Ri.addReference(a,n),this.di.delete(a.toString()),H.resolve()}removeReference(e,n,a){return this.Ri.removeReference(a,n),this.di.add(a.toString()),H.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),H.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(r=>this.di.add(r.toString()));let a=this.persistence.getTargetCache();return a.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(s=>this.di.add(s.toString()))}).next(()=>a.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){let n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return H.forEach(this.di,a=>{let r=ae.fromPath(a);return this.mi(e,r).next(s=>{s||n.removeEntry(r,pe.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(a=>{a?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return H.or([()=>H.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}},pp=class t{constructor(e,n){this.persistence=e,this.fi=new Mr(a=>BN(a.path),(a,r)=>a.isEqual(r)),this.garbageCollector=PV(this,n)}static Vi(e,n){return new t(e,n)}Ti(){}Ii(e){return H.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){let n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(a=>n.next(r=>a+r))}pr(e){let n=0;return this.mr(e,a=>{n++}).next(()=>n)}mr(e,n){return H.forEach(this.fi,(a,r)=>this.wr(e,a,r).next(s=>s?H.resolve():n(r)))}removeTargets(e,n,a){return this.persistence.getTargetCache().removeTargets(e,n,a)}removeOrphanedDocuments(e,n){let a=0,r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ni(e,i=>this.wr(e,i,n).next(l=>{l||(a++,s.removeEntry(i,pe.min()))})).next(()=>s.apply(e)).next(()=>a)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),H.resolve()}removeTarget(e,n){let a=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,a)}addReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),H.resolve()}removeReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),H.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),H.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Xh(e.data.value)),n}wr(e,n,a){return H.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{let r=this.fi.get(n);return H.resolve(r!==void 0&&r>a)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var iS=class t{constructor(e,n,a,r){this.targetId=e,this.fromCache=n,this.Ts=a,this.Is=r}static Es(e,n){let a=Ae(),r=Ae();for(let s of n.docChanges)switch(s.type){case 0:a=a.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new t(e,n.fromCache,a,r)}};var oS=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var lS=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return eA()?8:VN(Mt())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,a,r){let s={result:null};return this.gs(e,n).next(i=>{s.result=i}).next(()=>{if(!s.result)return this.ps(e,n,r,a).next(i=>{s.result=i})}).next(()=>{if(s.result)return;let i=new oS;return this.ys(e,n,i).next(l=>{if(s.result=l,this.As)return this.ws(e,n,i,l.size)})}).next(()=>s.result)}ws(e,n,a,r){return a.documentReadCount<this.Vs?(Yo()<=ye.DEBUG&&J("QueryEngine","SDK will not create cache indexes for query:",Qo(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),H.resolve()):(Yo()<=ye.DEBUG&&J("QueryEngine","Query:",Qo(n),"scans",a.documentReadCount,"local documents and returns",r,"documents as results."),a.documentReadCount>this.ds*r?(Yo()<=ye.DEBUG&&J("QueryEngine","The SDK decides to create cache indexes for query:",Qo(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Na(n))):H.resolve())}gs(e,n){if(kx(n))return H.resolve(null);let a=Na(n);return this.indexManager.getIndexType(e,a).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=Cc(n,null,"F"),a=Na(n)),this.indexManager.getDocumentsMatchingTarget(e,a).next(s=>{let i=Ae(...s);return this.fs.getDocuments(e,i).next(l=>this.indexManager.getMinOffset(e,a).next(u=>{let c=this.bs(n,l);return this.Ss(n,c,i,u.readTime)?this.gs(e,Cc(n,null,"F")):this.Ds(e,c,n,u)}))})))}ps(e,n,a,r){return kx(n)||r.isEqual(pe.min())?H.resolve(null):this.fs.getDocuments(e,a).next(s=>{let i=this.bs(n,s);return this.Ss(n,i,a,r)?H.resolve(null):(Yo()<=ye.DEBUG&&J("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),Qo(n)),this.Ds(e,i,n,PN(r,vc)).next(l=>l))})}bs(e,n){let a=new Ft(F0(e));return n.forEach((r,s)=>{Pp(e,s)&&(a=a.add(s))}),a}Ss(e,n,a,r){if(e.limit===null)return!1;if(a.size!==n.size)return!0;let s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ys(e,n,a){return Yo()<=ye.DEBUG&&J("QueryEngine","Using full collection scan to execute query:",Qo(n)),this.fs.getDocumentsMatchingQuery(e,n,Ri.min(),a)}Ds(e,n,a,r){return this.fs.getDocumentsMatchingQuery(e,a,r).next(s=>(n.forEach(i=>{s=s.insert(i.key,i)}),s))}};var GS="LocalStore",OV=3e8,uS=class{constructor(e,n,a,r){this.persistence=e,this.Cs=n,this.serializer=r,this.vs=new dt(Ce),this.Fs=new Mr(s=>BS(s),qS),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(a)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Q_(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}};function MV(t,e,n,a){return new uS(t,e,n,a)}async function iR(t,e){let n=xe(t);return await n.persistence.runTransaction("Handle user change","readonly",a=>{let r;return n.mutationQueue.getAllMutationBatches(a).next(s=>(r=s,n.Os(e),n.mutationQueue.getAllMutationBatches(a))).next(s=>{let i=[],l=[],u=Ae();for(let c of r){i.push(c.batchId);for(let f of c.mutations)u=u.add(f.key)}for(let c of s){l.push(c.batchId);for(let f of c.mutations)u=u.add(f.key)}return n.localDocuments.getDocuments(a,u).next(c=>({Ns:c,removedBatchIds:i,addedBatchIds:l}))})})}function oR(t){let e=xe(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function NV(t,e){let n=xe(t),a=e.snapshotVersion,r=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{let i=n.xs.newChangeBuffer({trackRemovals:!0});r=n.vs;let l=[];e.targetChanges.forEach((f,p)=>{let m=r.get(p);if(!m)return;l.push(n.li.removeMatchingKeys(s,f.removedDocuments,p).next(()=>n.li.addMatchingKeys(s,f.addedDocuments,p)));let v=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?v=v.withResumeToken(Wt.EMPTY_BYTE_STRING,pe.min()).withLastLimboFreeSnapshotVersion(pe.min()):f.resumeToken.approximateByteSize()>0&&(v=v.withResumeToken(f.resumeToken,a)),r=r.insert(p,v),function(D,x,T){return D.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=OV?!0:T.addedDocuments.size+T.modifiedDocuments.size+T.removedDocuments.size>0}(m,v,f)&&l.push(n.li.updateTargetData(s,v))});let u=Os(),c=Ae();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),l.push(VV(s,i,e.documentUpdates).next(f=>{u=f.Bs,c=f.Ls})),!a.isEqual(pe.min())){let f=n.li.getLastRemoteSnapshotVersion(s).next(p=>n.li.setTargetsMetadata(s,s.currentSequenceNumber,a));l.push(f)}return H.waitFor(l).next(()=>i.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,u,c)).next(()=>u)}).then(s=>(n.vs=r,s))}function VV(t,e,n){let a=Ae(),r=Ae();return n.forEach(s=>a=a.add(s)),e.getEntries(t,a).next(s=>{let i=Os();return n.forEach((l,u)=>{let c=s.get(l);u.isFoundDocument()!==c.isFoundDocument()&&(r=r.add(l)),u.isNoDocument()&&u.version.isEqual(pe.min())?(e.removeEntry(l,u.readTime),i=i.insert(l,u)):!c.isValidDocument()||u.version.compareTo(c.version)>0||u.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(u),i=i.insert(l,u)):J(GS,"Ignoring outdated watch update for ",l,". Current version:",c.version," Watch version:",u.version)}),{Bs:i,Ls:r}})}function UV(t,e){let n=xe(t);return n.persistence.runTransaction("Allocate target","readwrite",a=>{let r;return n.li.getTargetData(a,e).next(s=>s?(r=s,H.resolve(r)):n.li.allocateTargetId(a).next(i=>(r=new Dc(e,i,"TargetPurposeListen",a.currentSequenceNumber),n.li.addTargetData(a,r).next(()=>r))))}).then(a=>{let r=n.vs.get(a.targetId);return(r===null||a.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.vs=n.vs.insert(a.targetId,a),n.Fs.set(e,a.targetId)),a})}async function cS(t,e,n){let a=xe(t),r=a.vs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await a.persistence.runTransaction("Release target",s,i=>a.persistence.referenceDelegate.removeTarget(i,r))}catch(i){if(!_l(i))throw i;J(GS,`Failed to update sequence numbers for target ${e}: ${i}`)}a.vs=a.vs.remove(e),a.Fs.delete(r.target)}function Hx(t,e,n){let a=xe(t),r=pe.min(),s=Ae();return a.persistence.runTransaction("Execute query","readwrite",i=>function(u,c,f){let p=xe(u),m=p.Fs.get(f);return m!==void 0?H.resolve(p.vs.get(m)):p.li.getTargetData(c,f)}(a,i,Na(e)).next(l=>{if(l)return r=l.lastLimboFreeSnapshotVersion,a.li.getMatchingKeysForTargetId(i,l.targetId).next(u=>{s=u})}).next(()=>a.Cs.getDocumentsMatchingQuery(i,e,n?r:pe.min(),n?s:Ae())).next(l=>(FV(a,rV(e),l),{documents:l,ks:s})))}function FV(t,e,n){let a=t.Ms.get(e)||pe.min();n.forEach((r,s)=>{s.readTime.compareTo(a)>0&&(a=s.readTime)}),t.Ms.set(e,a)}var mp=class{constructor(){this.activeTargetIds=cV()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var dS=class{constructor(){this.vo=new mp,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,a){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,a){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new mp,Promise.resolve()}handleUserChange(e,n,a){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var fS=class{Mo(e){}shutdown(){}};var Gx="ConnectivityMonitor",gp=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){J(Gx,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){J(Gx,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var Wh=null;function hS(){return Wh===null?Wh=function(){return 268435456+Math.round(2147483648*Math.random())}():Wh++,"0x"+Wh.toString(16)}var f_="RestConnection",BV={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},pS=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let n=e.ssl?"https":"http",a=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${a}/databases/${r}`,this.$o=this.databaseId.database===sp?`project_id=${a}`:`project_id=${a}&database_id=${r}`}Wo(e,n,a,r,s){let i=hS(),l=this.Qo(e,n.toUriEncodedString());J(f_,`Sending RPC '${e}' ${i}:`,l,a);let u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(u,r,s);let{host:c}=new URL(l),f=La(c);return this.zo(e,l,u,a,f).then(p=>(J(f_,`Received RPC '${e}' ${i}: `,p),p),p=>{throw Rr(f_,`RPC '${e}' ${i} failed with error: `,p,"url: ",l,"request:",a),p})}jo(e,n,a,r,s,i){return this.Wo(e,n,a,r,s)}Go(e,n,a){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+yl}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,s)=>e[s]=r),a&&a.headers.forEach((r,s)=>e[s]=r)}Qo(e,n){let a=BV[e],r=`${this.qo}/v1/${n}:${a}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var mS=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var $t="WebChannelConnection",gc=(t,e,n)=>{t.listen(e,a=>{try{n(a)}catch(r){setTimeout(()=>{throw r},0)}})},yp=class t extends pS{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=o_();gc(e,i_.STAT_EVENT,n=>{n.stat===Gh.PROXY?J($t,"STAT_EVENT: detected buffering proxy"):n.stat===Gh.NOPROXY&&J($t,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,n,a,r,s){let i=hS();return new Promise((l,u)=>{let c=new r_;c.setWithCredentials(!0),c.listenOnce(s_.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case mc.NO_ERROR:let p=c.getResponseJson();J($t,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(p)),l(p);break;case mc.TIMEOUT:J($t,`RPC '${e}' ${i} timed out`),u(new Y(z.DEADLINE_EXCEEDED,"Request time out"));break;case mc.HTTP_ERROR:let m=c.getStatus();if(J($t,`RPC '${e}' ${i} failed with status:`,m,"response text:",c.getResponseText()),m>0){let v=c.getResponseJson();Array.isArray(v)&&(v=v[0]);let R=v?.error;if(R&&R.status&&R.message){let D=function(T){let E=T.toLowerCase().replace(/_/g,"-");return Object.values(z).indexOf(E)>=0?E:z.UNKNOWN}(R.status);u(new Y(D,R.message))}else u(new Y(z.UNKNOWN,"Server responded with status "+c.getStatus()))}else u(new Y(z.UNAVAILABLE,"Connection failed."));break;default:le(9055,{l_:e,streamId:i,h_:c.getLastErrorCode(),P_:c.getLastError()})}}finally{J($t,`RPC '${e}' ${i} completed.`)}});let f=JSON.stringify(r);J($t,`RPC '${e}' ${i} sending request:`,r),c.send(n,"POST",f,a,15)})}T_(e,n,a){let r=hS(),s=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(l.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(l.useFetchStreams=!0),this.Go(l.initMessageHeaders,n,a),l.encodeInitMessageHeaders=!0;let c=s.join("");J($t,`Creating RPC '${e}' stream ${r}: ${c}`,l);let f=i.createWebChannel(c,l);this.I_(f);let p=!1,m=!1,v=new mS({Ho:R=>{m?J($t,`Not sending because RPC '${e}' stream ${r} is closed:`,R):(p||(J($t,`Opening RPC '${e}' stream ${r} transport.`),f.open(),p=!0),J($t,`RPC '${e}' stream ${r} sending:`,R),f.send(R))},Jo:()=>f.close()});return gc(f,Xo.EventType.OPEN,()=>{m||(J($t,`RPC '${e}' stream ${r} transport opened.`),v.i_())}),gc(f,Xo.EventType.CLOSE,()=>{m||(m=!0,J($t,`RPC '${e}' stream ${r} transport closed`),v.o_(),this.E_(f))}),gc(f,Xo.EventType.ERROR,R=>{m||(m=!0,Rr($t,`RPC '${e}' stream ${r} transport errored. Name:`,R.name,"Message:",R.message),v.o_(new Y(z.UNAVAILABLE,"The operation could not be completed")))}),gc(f,Xo.EventType.MESSAGE,R=>{if(!m){let D=R.data[0];Ze(!!D,16349);let x=D,T=x?.error||x[0]?.error;if(T){J($t,`RPC '${e}' stream ${r} received error:`,T);let E=T.status,C=function(N){let y=yt[N];if(y!==void 0)return X0(y)}(E),L=T.message;E==="NOT_FOUND"&&L.includes("database")&&L.includes("does not exist")&&L.includes(this.databaseId.database)&&Rr(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),C===void 0&&(C=z.INTERNAL,L="Unknown error status: "+E+" with message "+T.message),m=!0,v.o_(new Y(C,L)),f.close()}else J($t,`RPC '${e}' stream ${r} received:`,D),v.__(D)}}),t.u_(),setTimeout(()=>{v.s_()},0),v}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,a){super.Go(e,n,a),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return l_()}};function qV(t){return new yp(t)}function h_(){return typeof document<"u"?document:null}function Hc(t){return new U_(t,!0)}yp.c_=!1;var Ip=class{constructor(e,n,a=1e3,r=1.5,s=6e4){this.Ci=e,this.timerId=n,this.R_=a,this.A_=r,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let n=Math.floor(this.d_+this.y_()),a=Math.max(0,Date.now()-this.f_),r=Math.max(0,n-a);r>0&&J("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${a} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var jx="PersistentStream",gS=class{constructor(e,n,a,r,s,i,l,u){this.Ci=e,this.b_=a,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new Ip(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===z.RESOURCE_EXHAUSTED?(xr(n.toString()),xr("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===z.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([a,r])=>{this.D_===n&&this.G_(a,r)},a=>{e(()=>{let r=new Y(z.UNKNOWN,"Fetching auth token failed: "+a.message);return this.z_(r)})})}G_(e,n){let a=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{a(()=>this.listener.Zo())}),this.stream.Yo(()=>{a(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{a(()=>this.z_(r))}),this.stream.onMessage(r=>{a(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return J(jx,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():(J(jx,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},yS=class extends gS{constructor(e,n,a,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,a,r,i),this.serializer=s}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let n=bV(this.serializer,e),a=function(s){if(!("targetChange"in s))return pe.min();let i=s.targetChange;return i.targetIds&&i.targetIds.length?pe.min():i.readTime?nl(i.readTime):pe.min()}(e);return this.listener.J_(n,a)}Z_(e){let n={};n.database=Fx(this.serializer),n.addTarget=function(s,i){let l,u=i.target;if(l=D_(u)?{documents:wV(s,u)}:{query:CV(s,u).ft},l.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){l.resumeToken=Y0(s,i.resumeToken);let c=F_(s,i.expectedCount);c!==null&&(l.expectedCount=c)}else if(i.snapshotVersion.compareTo(pe.min())>0){l.readTime=B_(s,i.snapshotVersion.toTimestamp());let c=F_(s,i.expectedCount);c!==null&&(l.expectedCount=c)}return l}(this.serializer,e);let a=AV(this.serializer,e);a&&(n.labels=a),this.K_(n)}X_(e){let n={};n.database=Fx(this.serializer),n.removeTarget=e,this.K_(n)}};var IS=class{},_S=class extends IS{constructor(e,n,a,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=a,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new Y(z.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,a,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Wo(e,q_(n,a),r,s,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===z.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new Y(z.UNKNOWN,s.toString())})}jo(e,n,a,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,l])=>this.connection.jo(e,q_(n,a),r,i,l,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===z.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new Y(z.UNKNOWN,i.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function zV(t,e,n,a){return new _S(t,e,n,a)}var SS=class{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(xr(n),this.aa=!1):J("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var hl="RemoteStore",vS=class{constructor(e,n,a,r,s){this.localStore=e,this.datastore=n,this.asyncQueue=a,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(i=>{a.enqueueAndForget(async()=>{jc(this)&&(J(hl,"Restarting streams for network reachability change."),await async function(u){let c=xe(u);c.Ea.add(4),await Gc(c),c.Va.set("Unknown"),c.Ea.delete(4),await Op(c)}(this))})}),this.Va=new SS(a,r)}};async function Op(t){if(jc(t))for(let e of t.Ra)await e(!0)}async function Gc(t){for(let e of t.Ra)await e(!1)}function lR(t,e){let n=xe(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),XS(n)?WS(n):vl(n).O_()&&KS(n,e))}function jS(t,e){let n=xe(t),a=vl(n);n.Ia.delete(e),a.O_()&&uR(n,e),n.Ia.size===0&&(a.O_()?a.L_():jc(n)&&n.Va.set("Unknown"))}function KS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(pe.min())>0){let n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}vl(t).Z_(e)}function uR(t,e){t.da.$e(e),vl(t).X_(e)}function WS(t){t.da=new V_({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),vl(t).start(),t.Va.ua()}function XS(t){return jc(t)&&!vl(t).x_()&&t.Ia.size>0}function jc(t){return xe(t).Ea.size===0}function cR(t){t.da=void 0}async function HV(t){t.Va.set("Online")}async function GV(t){t.Ia.forEach((e,n)=>{KS(t,e)})}async function jV(t,e){cR(t),XS(t)?(t.Va.ha(e),WS(t)):t.Va.set("Unknown")}async function KV(t,e,n){if(t.Va.set("Online"),e instanceof cp&&e.state===2&&e.cause)try{await async function(r,s){let i=s.cause;for(let l of s.targetIds)r.Ia.has(l)&&(await r.remoteSyncer.rejectListen(l,i),r.Ia.delete(l),r.da.removeTarget(l))}(t,e)}catch(a){J(hl,"Failed to remove targets %s: %s ",e.targetIds.join(","),a),await Kx(t,a)}else if(e instanceof tl?t.da.Xe(e):e instanceof up?t.da.st(e):t.da.tt(e),!n.isEqual(pe.min()))try{let a=await oR(t.localStore);n.compareTo(a)>=0&&await function(s,i){let l=s.da.Tt(i);return l.targetChanges.forEach((u,c)=>{if(u.resumeToken.approximateByteSize()>0){let f=s.Ia.get(c);f&&s.Ia.set(c,f.withResumeToken(u.resumeToken,i))}}),l.targetMismatches.forEach((u,c)=>{let f=s.Ia.get(u);if(!f)return;s.Ia.set(u,f.withResumeToken(Wt.EMPTY_BYTE_STRING,f.snapshotVersion)),uR(s,u);let p=new Dc(f.target,u,c,f.sequenceNumber);KS(s,p)}),s.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(a){J(hl,"Failed to raise snapshot:",a),await Kx(t,a)}}async function Kx(t,e,n){if(!_l(e))throw e;t.Ea.add(1),await Gc(t),t.Va.set("Offline"),n||(n=()=>oR(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{J(hl,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await Op(t)})}async function Wx(t,e){let n=xe(t);n.asyncQueue.verifyOperationInProgress(),J(hl,"RemoteStore received new credentials");let a=jc(n);n.Ea.add(3),await Gc(n),a&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await Op(n)}async function WV(t,e){let n=xe(t);e?(n.Ea.delete(2),await Op(n)):e||(n.Ea.add(2),await Gc(n),n.Va.set("Unknown"))}function vl(t){return t.ma||(t.ma=function(n,a,r){let s=xe(n);return s.sa(),new yS(a,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,r)}(t.datastore,t.asyncQueue,{Zo:HV.bind(null,t),Yo:GV.bind(null,t),t_:jV.bind(null,t),J_:KV.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),XS(t)?WS(t):t.Va.set("Unknown")):(await t.ma.stop(),cR(t))})),t.ma}var ES=class t{constructor(e,n,a,r,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=a,this.op=r,this.removalCallback=s,this.deferred=new Lr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(i=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,a,r,s){let i=Date.now()+a,l=new t(e,n,i,r,s);return l.start(a),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new Y(z.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function dR(t,e){if(xr("AsyncQueue",`${e}: ${t}`),_l(t))return new Y(z.UNAVAILABLE,`${e}: ${t}`);throw t}var Mc=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(n,a)=>e(n,a)||ae.comparator(n.key,a.key):(n,a)=>ae.comparator(n.key,a.key),this.keyedMap=yc(),this.sortedSet=new dt(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,a)=>(e(n),!1))}add(e){let n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){let n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.sortedSet.getIterator(),a=e.sortedSet.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(!r.isEqual(s))return!1}return!0}toString(){let e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){let a=new t;return a.comparator=this.comparator,a.keyedMap=e,a.sortedSet=n,a}};var _p=class{constructor(){this.ga=new dt(ae.comparator)}track(e){let n=e.doc.key,a=this.ga.get(n);a?e.type!==0&&a.type===3?this.ga=this.ga.insert(n,e):e.type===3&&a.type!==1?this.ga=this.ga.insert(n,{type:a.type,doc:e.doc}):e.type===2&&a.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&a.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&a.type===0?this.ga=this.ga.remove(n):e.type===1&&a.type===2?this.ga=this.ga.insert(n,{type:1,doc:a.doc}):e.type===0&&a.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):le(63341,{Vt:e,pa:a}):this.ga=this.ga.insert(n,e)}ya(){let e=[];return this.ga.inorderTraversal((n,a)=>{e.push(a)}),e}},ki=class t{constructor(e,n,a,r,s,i,l,u,c){this.query=e,this.docs=n,this.oldDocs=a,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=c}static fromInitialDocuments(e,n,a,r,s){let i=[];return n.forEach(l=>{i.push({type:0,doc:l})}),new t(e,n,Mc.emptySet(n),i,a,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Dp(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let n=this.docChanges,a=e.docChanges;if(n.length!==a.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==a[r].type||!n[r].doc.isEqual(a[r].doc))return!1;return!0}};var TS=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},bS=class{constructor(){this.queries=Xx(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,a){let r=xe(n),s=r.queries;r.queries=Xx(),s.forEach((i,l)=>{for(let u of l.ba)u.onError(a)})})(this,new Y(z.ABORTED,"Firestore shutting down"))}};function Xx(){return new Mr(t=>U0(t),Dp)}async function XV(t,e){let n=xe(t),a=3,r=e.query,s=n.queries.get(r);s?!s.Sa()&&e.Da()&&(a=2):(s=new TS,a=e.Da()?0:1);try{switch(a){case 0:s.wa=await n.onListen(r,!0);break;case 1:s.wa=await n.onListen(r,!1);break;case 2:await n.onFirstRemoteStoreListen(r)}}catch(i){let l=dR(i,`Initialization of query '${Qo(e.query)}' failed`);return void e.onError(l)}n.queries.set(r,s),s.ba.push(e),e.va(n.onlineState),s.wa&&e.Fa(s.wa)&&YS(n)}async function YV(t,e){let n=xe(t),a=e.query,r=3,s=n.queries.get(a);if(s){let i=s.ba.indexOf(e);i>=0&&(s.ba.splice(i,1),s.ba.length===0?r=e.Da()?0:1:!s.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return n.queries.delete(a),n.onUnlisten(a,!0);case 1:return n.queries.delete(a),n.onUnlisten(a,!1);case 2:return n.onLastRemoteStoreUnlisten(a);default:return}}function QV(t,e){let n=xe(t),a=!1;for(let r of e){let s=r.query,i=n.queries.get(s);if(i){for(let l of i.ba)l.Fa(r)&&(a=!0);i.wa=r}}a&&YS(n)}function $V(t,e,n){let a=xe(t),r=a.queries.get(e);if(r)for(let s of r.ba)s.onError(n);a.queries.delete(e)}function YS(t){t.Ca.forEach(e=>{e.next()})}var wS,Yx;(Yx=wS||(wS={})).Ma="default",Yx.Cache="cache";var CS=class{constructor(e,n,a){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=a||{}}Fa(e){if(!this.options.includeMetadataChanges){let a=[];for(let r of e.docChanges)r.type!==3&&a.push(r);e=new ki(e.query,e.docs,e.oldDocs,a,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;let a=n!=="Offline";return(!this.options.Ka||!a)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=ki.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==wS.Cache}};var Sp=class{constructor(e){this.key=e}},vp=class{constructor(e){this.key=e}},LS=class{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Ae(),this.mutatedKeys=Ae(),this.eu=F0(e),this.tu=new Mc(this.eu)}get nu(){return this.Za}ru(e,n){let a=n?n.iu:new _p,r=n?n.tu:this.tu,s=n?n.mutatedKeys:this.mutatedKeys,i=r,l=!1,u=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,c=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((f,p)=>{let m=r.get(f),v=Pp(this.query,p)?p:null,R=!!m&&this.mutatedKeys.has(m.key),D=!!v&&(v.hasLocalMutations||this.mutatedKeys.has(v.key)&&v.hasCommittedMutations),x=!1;m&&v?m.data.isEqual(v.data)?R!==D&&(a.track({type:3,doc:v}),x=!0):this.su(m,v)||(a.track({type:2,doc:v}),x=!0,(u&&this.eu(v,u)>0||c&&this.eu(v,c)<0)&&(l=!0)):!m&&v?(a.track({type:0,doc:v}),x=!0):m&&!v&&(a.track({type:1,doc:m}),x=!0,(u||c)&&(l=!0)),x&&(v?(i=i.add(v),s=D?s.add(f):s.delete(f)):(i=i.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;i.size>this.query.limit;){let f=this.query.limitType==="F"?i.last():i.first();i=i.delete(f.key),s=s.delete(f.key),a.track({type:1,doc:f})}return{tu:i,iu:a,Ss:l,mutatedKeys:s}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,a,r){let s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let i=e.iu.ya();i.sort((f,p)=>function(v,R){let D=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return le(20277,{Vt:x})}};return D(v)-D(R)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(a),r=r??!1;let l=n&&!r?this._u():[],u=this.Ya.size===0&&this.current&&!r?1:0,c=u!==this.Xa;return this.Xa=u,i.length!==0||c?{snapshot:new ki(this.query,e.tu,s,i,e.mutatedKeys,u===0,c,!1,!!a&&a.resumeToken.approximateByteSize()>0),au:l}:{au:l}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new _p,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=Ae(),this.tu.forEach(a=>{this.uu(a.key)&&(this.Ya=this.Ya.add(a.key))});let n=[];return e.forEach(a=>{this.Ya.has(a)||n.push(new vp(a))}),this.Ya.forEach(a=>{e.has(a)||n.push(new Sp(a))}),n}cu(e){this.Za=e.ks,this.Ya=Ae();let n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return ki.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},QS="SyncEngine",AS=class{constructor(e,n,a){this.query=e,this.targetId=n,this.view=a}},xS=class{constructor(e){this.key=e,this.hu=!1}},RS=class{constructor(e,n,a,r,s,i){this.localStore=e,this.remoteStore=n,this.eventManager=a,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new Mr(l=>U0(l),Dp),this.Iu=new Map,this.Eu=new Set,this.Ru=new dt(ae.comparator),this.Au=new Map,this.Vu=new Oc,this.du={},this.mu=new Map,this.fu=Pc.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function JV(t,e,n=!0){let a=gR(t),r,s=a.Tu.get(e);return s?(a.sharedClientState.addLocalQueryTarget(s.targetId),r=s.view.lu()):r=await fR(a,e,n,!0),r}async function ZV(t,e){let n=gR(t);await fR(n,e,!0,!1)}async function fR(t,e,n,a){let r=await UV(t.localStore,Na(e)),s=r.targetId,i=t.sharedClientState.addLocalQueryTarget(s,n),l;return a&&(l=await eU(t,e,s,i==="current",r.resumeToken)),t.isPrimaryClient&&n&&lR(t.remoteStore,r),l}async function eU(t,e,n,a,r){t.pu=(p,m,v)=>async function(D,x,T,E){let C=x.view.ru(T);C.Ss&&(C=await Hx(D.localStore,x.query,!1).then(({documents:y})=>x.view.ru(y,C)));let L=E&&E.targetChanges.get(x.targetId),U=E&&E.targetMismatches.get(x.targetId)!=null,N=x.view.applyChanges(C,D.isPrimaryClient,L,U);return $x(D,x.targetId,N.au),N.snapshot}(t,p,m,v);let s=await Hx(t.localStore,e,!0),i=new LS(e,s.ks),l=i.ru(s.documents),u=kc.createSynthesizedTargetChangeForCurrentChange(n,a&&t.onlineState!=="Offline",r),c=i.applyChanges(l,t.isPrimaryClient,u);$x(t,n,c.au);let f=new AS(e,n,i);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),c.snapshot}async function tU(t,e,n){let a=xe(t),r=a.Tu.get(e),s=a.Iu.get(r.targetId);if(s.length>1)return a.Iu.set(r.targetId,s.filter(i=>!Dp(i,e))),void a.Tu.delete(e);a.isPrimaryClient?(a.sharedClientState.removeLocalQueryTarget(r.targetId),a.sharedClientState.isActiveQueryTarget(r.targetId)||await cS(a.localStore,r.targetId,!1).then(()=>{a.sharedClientState.clearQueryState(r.targetId),n&&jS(a.remoteStore,r.targetId),kS(a,r.targetId)}).catch(Lp)):(kS(a,r.targetId),await cS(a.localStore,r.targetId,!0))}async function nU(t,e){let n=xe(t),a=n.Tu.get(e),r=n.Iu.get(a.targetId);n.isPrimaryClient&&r.length===1&&(n.sharedClientState.removeLocalQueryTarget(a.targetId),jS(n.remoteStore,a.targetId))}async function hR(t,e){let n=xe(t);try{let a=await NV(n.localStore,e);e.targetChanges.forEach((r,s)=>{let i=n.Au.get(s);i&&(Ze(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?i.hu=!0:r.modifiedDocuments.size>0?Ze(i.hu,14607):r.removedDocuments.size>0&&(Ze(i.hu,42227),i.hu=!1))}),await mR(n,a,e)}catch(a){await Lp(a)}}function Qx(t,e,n){let a=xe(t);if(a.isPrimaryClient&&n===0||!a.isPrimaryClient&&n===1){let r=[];a.Tu.forEach((s,i)=>{let l=i.view.va(e);l.snapshot&&r.push(l.snapshot)}),function(i,l){let u=xe(i);u.onlineState=l;let c=!1;u.queries.forEach((f,p)=>{for(let m of p.ba)m.va(l)&&(c=!0)}),c&&YS(u)}(a.eventManager,e),r.length&&a.Pu.J_(r),a.onlineState=e,a.isPrimaryClient&&a.sharedClientState.setOnlineState(e)}}async function aU(t,e,n){let a=xe(t);a.sharedClientState.updateQueryState(e,"rejected",n);let r=a.Au.get(e),s=r&&r.key;if(s){let i=new dt(ae.comparator);i=i.insert(s,sa.newNoDocument(s,pe.min()));let l=Ae().add(s),u=new lp(pe.min(),new Map,new dt(Ce),i,l);await hR(a,u),a.Ru=a.Ru.remove(s),a.Au.delete(e),$S(a)}else await cS(a.localStore,e,!1).then(()=>kS(a,e,n)).catch(Lp)}function kS(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(let a of t.Iu.get(e))t.Tu.delete(a),n&&t.Pu.yu(a,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(a=>{t.Vu.containsKey(a)||pR(t,a)})}function pR(t,e){t.Eu.delete(e.path.canonicalString());let n=t.Ru.get(e);n!==null&&(jS(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),$S(t))}function $x(t,e,n){for(let a of n)a instanceof Sp?(t.Vu.addReference(a.key,e),rU(t,a)):a instanceof vp?(J(QS,"Document no longer in limbo: "+a.key),t.Vu.removeReference(a.key,e),t.Vu.containsKey(a.key)||pR(t,a.key)):le(19791,{wu:a})}function rU(t,e){let n=e.key,a=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(a)||(J(QS,"New document in limbo: "+n),t.Eu.add(a),$S(t))}function $S(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let n=new ae(Je.fromString(e)),a=t.fu.next();t.Au.set(a,new xS(n)),t.Ru=t.Ru.insert(n,a),lR(t.remoteStore,new Dc(Na(zS(n.path)),a,"TargetPurposeLimboResolution",sl.ce))}}async function mR(t,e,n){let a=xe(t),r=[],s=[],i=[];a.Tu.isEmpty()||(a.Tu.forEach((l,u)=>{i.push(a.pu(u,e,n).then(c=>{if((c||n)&&a.isPrimaryClient){let f=c?!c.fromCache:n?.targetChanges.get(u.targetId)?.current;a.sharedClientState.updateQueryState(u.targetId,f?"current":"not-current")}if(c){r.push(c);let f=iS.Es(u.targetId,c);s.push(f)}}))}),await Promise.all(i),a.Pu.J_(r),await async function(u,c){let f=xe(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>H.forEach(c,m=>H.forEach(m.Ts,v=>f.persistence.referenceDelegate.addReference(p,m.targetId,v)).next(()=>H.forEach(m.Is,v=>f.persistence.referenceDelegate.removeReference(p,m.targetId,v)))))}catch(p){if(!_l(p))throw p;J(GS,"Failed to update sequence numbers: "+p)}for(let p of c){let m=p.targetId;if(!p.fromCache){let v=f.vs.get(m),R=v.snapshotVersion,D=v.withLastLimboFreeSnapshotVersion(R);f.vs=f.vs.insert(m,D)}}}(a.localStore,s))}async function sU(t,e){let n=xe(t);if(!n.currentUser.isEqual(e)){J(QS,"User change. New user:",e.toKey());let a=await iR(n.localStore,e);n.currentUser=e,function(s,i){s.mu.forEach(l=>{l.forEach(u=>{u.reject(new Y(z.CANCELLED,i))})}),s.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,a.removedBatchIds,a.addedBatchIds),await mR(n,a.Ns)}}function iU(t,e){let n=xe(t),a=n.Au.get(e);if(a&&a.hu)return Ae().add(a.key);{let r=Ae(),s=n.Iu.get(e);if(!s)return r;for(let i of s){let l=n.Tu.get(i);r=r.unionWith(l.view.nu)}return r}}function gR(t){let e=xe(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=hR.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=iU.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=aU.bind(null,e),e.Pu.J_=QV.bind(null,e.eventManager),e.Pu.yu=$V.bind(null,e.eventManager),e}var Di=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Hc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return MV(this.persistence,new lS,e.initialUser,this.serializer)}Cu(e){return new hp(sS.Vi,this.serializer)}Du(e){return new dS}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};Di.provider={build:()=>new Di};var Ep=class extends Di{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){Ze(this.persistence.referenceDelegate instanceof pp,46915);let a=this.persistence.referenceDelegate.garbageCollector;return new K_(a,e.asyncQueue,n)}Cu(e){let n=this.cacheSizeBytes!==void 0?Wn.withCacheSize(this.cacheSizeBytes):Wn.DEFAULT;return new hp(a=>pp.Vi(a,n),this.serializer)}};var pl=class{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=a=>Qx(this.syncEngine,a,1),this.remoteStore.remoteSyncer.handleCredentialChange=sU.bind(null,this.syncEngine),await WV(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new bS}()}createDatastore(e){let n=Hc(e.databaseInfo.databaseId),a=qV(e.databaseInfo);return zV(e.authCredentials,e.appCheckCredentials,a,n)}createRemoteStore(e){return function(a,r,s,i,l){return new vS(a,r,s,i,l)}(this.localStore,this.datastore,e.asyncQueue,n=>Qx(this.syncEngine,n,0),function(){return gp.v()?new gp:new fS}())}createSyncEngine(e,n){return function(r,s,i,l,u,c,f){let p=new RS(r,s,i,l,u,c);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){await async function(n){let a=xe(n);J(hl,"RemoteStore shutting down."),a.Ea.add(5),await Gc(a),a.Aa.shutdown(),a.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};pl.provider={build:()=>new pl};var DS=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):xr("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}};var Ms="FirestoreClient",PS=class{constructor(e,n,a,r,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=a,this._databaseInfo=r,this.user=Ut.UNAUTHENTICATED,this.clientId=al.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(a,async i=>{J(Ms,"Received user=",i.uid),await this.authCredentialListener(i),this.user=i}),this.appCheckCredentials.start(a,i=>(J(Ms,"Received new app check token=",i),this.appCheckCredentialListener(i,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new Lr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){let a=dR(n,"Failed to shutdown persistence");e.reject(a)}}),e.promise}};async function p_(t,e){t.asyncQueue.verifyOperationInProgress(),J(Ms,"Initializing OfflineComponentProvider");let n=t.configuration;await e.initialize(n);let a=n.initialUser;t.setCredentialChangeListener(async r=>{a.isEqual(r)||(await iR(e.localStore,r),a=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Jx(t,e){t.asyncQueue.verifyOperationInProgress();let n=await oU(t);J(Ms,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(a=>Wx(e.remoteStore,a)),t.setAppCheckTokenChangeListener((a,r)=>Wx(e.remoteStore,r)),t._onlineComponents=e}async function oU(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){J(Ms,"Using user provided OfflineComponentProvider");try{await p_(t,t._uninitializedComponentsProvider._offline)}catch(e){let n=e;if(!function(r){return r.name==="FirebaseError"?r.code===z.FAILED_PRECONDITION||r.code===z.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(n))throw n;Rr("Error using user provided cache. Falling back to memory cache: "+n),await p_(t,new Di)}}else J(Ms,"Using default OfflineComponentProvider"),await p_(t,new Ep(void 0));return t._offlineComponents}async function lU(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(J(Ms,"Using user provided OnlineComponentProvider"),await Jx(t,t._uninitializedComponentsProvider._online)):(J(Ms,"Using default OnlineComponentProvider"),await Jx(t,new pl))),t._onlineComponents}async function uU(t){let e=await lU(t),n=e.eventManager;return n.onListen=JV.bind(null,e.syncEngine),n.onUnlisten=tU.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=ZV.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=nU.bind(null,e.syncEngine),n}function yR(t,e,n={}){let a=new Lr;return t.asyncQueue.enqueueAndForget(async()=>function(s,i,l,u,c){let f=new DS({next:m=>{f.Nu(),i.enqueueAndForget(()=>YV(s,p)),m.fromCache&&u.source==="server"?c.reject(new Y(z.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(m)},error:m=>c.reject(m)}),p=new CS(l,f,{includeMetadataChanges:!0,Ka:!0});return XV(s,p)}(await uU(t),t.asyncQueue,e,n,a)),a.promise}function IR(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var cU="ComponentProvider",Zx=new Map;function dU(t,e,n,a,r){return new S_(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,IR(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,a)}var _R="firestore.googleapis.com",e0=!0,Tp=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new Y(z.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=_R,this.ssl=e0}else this.host=e.host,this.ssl=e.ssl??e0;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=sR;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<DV)throw new Y(z.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}s0("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=IR(e.experimentalLongPollingOptions??{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new Y(z.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new Y(z.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new Y(z.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(a,r){return a.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},Nc=class{constructor(e,n,a,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=a,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Tp({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Y(z.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new Y(z.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Tp(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(a){if(!a)return new $h;switch(a.type){case"firstParty":return new y_(a.sessionIndex||"0",a.iamToken||null,a.authTokenFactory||null);case"provider":return a.client;default:throw new Y(z.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){let a=Zx.get(n);a&&(J(cU,"Removing Datastore"),Zx.delete(n),a.terminate())}(this),Promise.resolve()}};function SR(t,e,n,a={}){t=Bc(t,Nc);let r=La(e),s=t._getSettings(),i={...s,emulatorOptions:t._getEmulatorOptions()},l=`${e}:${n}`;r&&(Fo(`https://${l}`),Bo("Firestore",!0)),s.host!==_R&&s.host!==l&&Rr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let u={...s,host:l,ssl:r,emulatorOptions:a};if(!aa(u,i)&&(t._setSettings(u),a.mockUserToken)){let c,f;if(typeof a.mockUserToken=="string")c=a.mockUserToken,f=Ut.MOCK_USER;else{c=ih(a.mockUserToken,t._app?.options.projectId);let p=a.mockUserToken.sub||a.mockUserToken.user_id;if(!p)throw new Y(z.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new Ut(p)}t._authCredentials=new m_(new Qh(c,f))}}var ia=class t{constructor(e,n,a){this.converter=n,this._query=a,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},In=class t{constructor(e,n,a){this.converter=n,this._key=a,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ai(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,a){if(Il(n,t._jsonSchema))return new t(e,a||null,new ae(Je.fromString(n.referencePath)))}};In._jsonSchemaVersion="firestore/documentReference/1.0",In._jsonSchema={type:ct("string",In._jsonSchemaVersion),referencePath:ct("string")};var Ai=class t extends ia{constructor(e,n,a){super(e,n,zS(a)),this._path=a,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new In(this.firestore,null,new ae(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function Kc(t,e,...n){if(t=Nt(t),DN("collection","path",e),t instanceof Nc){let a=Je.fromString(e,...n);return _x(a),new Ai(t,null,a)}{if(!(t instanceof In||t instanceof Ai))throw new Y(z.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let a=t._path.child(Je.fromString(e,...n));return _x(a),new Ai(t.firestore,null,a)}}var t0="AsyncQueue",bp=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Ip(this,"async_queue_retry"),this._c=()=>{let a=h_();a&&J(t0,"Visibility state changed to "+a.visibilityState),this.M_.w_()},this.ac=e;let n=h_();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let n=h_();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let n=new Lr;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!_l(e))throw e;J(t0,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let n=this.ac.then(()=>(this.rc=!0,e().catch(a=>{throw this.nc=a,this.rc=!1,xr("INTERNAL UNHANDLED ERROR: ",n0(a)),a}).then(a=>(this.rc=!1,a))));return this.ac=n,n}enqueueAfterDelay(e,n,a){this.uc(),this.oc.indexOf(e)>-1&&(n=0);let r=ES.createAndSchedule(this,e,n,a,s=>this.hc(s));return this.tc.push(r),r}uc(){this.nc&&le(47125,{Pc:n0(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,a)=>n.targetTimeMs-a.targetTimeMs);for(let n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let n=this.tc.indexOf(e);this.tc.splice(n,1)}};function n0(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var ml=class extends Nc{constructor(e,n,a,r){super(e,n,a,r),this.type="firestore",this._queue=new bp,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new bp(e),this._firestoreClient=void 0,await e}}};function JS(t,e){let n=typeof t=="object"?t:Go(),a=typeof t=="string"?t:e||sp,r=gi(n,"firestore").getImmediate({identifier:a});if(!r._initialized){let s=sh("firestore");s&&SR(r,...s)}return r}function ZS(t){if(t._terminated)throw new Y(z.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||fU(t),t._firestoreClient}function fU(t){let e=t._freezeSettings(),n=dU(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new PS(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(r){let s=r?._online.build();return{_offline:r?._offline.build(s),_online:s}}(t._componentsProvider))}var Va=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(Wt.fromBase64String(e))}catch(n){throw new Y(z.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new t(Wt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Il(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};Va._jsonSchemaVersion="firestore/bytes/1.0",Va._jsonSchema={type:ct("string",Va._jsonSchemaVersion),bytes:ct("string")};var gl=class{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new Y(z.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Pn(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var Vc=class{constructor(e){this._methodName=e}};var Ar=class t{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new Y(z.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new Y(z.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Ce(this._lat,e._lat)||Ce(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(Il(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};Ar._jsonSchemaVersion="firestore/geoPoint/1.0",Ar._jsonSchema={type:ct("string",Ar._jsonSchemaVersion),latitude:ct("number"),longitude:ct("number")};var Ua=class t{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(a,r){if(a.length!==r.length)return!1;for(let s=0;s<a.length;++s)if(a[s]!==r[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Il(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new t(e.vectorValues);throw new Y(z.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};Ua._jsonSchemaVersion="firestore/vectorValue/1.0",Ua._jsonSchema={type:ct("string",Ua._jsonSchemaVersion),vectorValues:ct("object")};var hU=/^__.*__$/;function vR(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw le(40011,{dataSource:t})}}var OS=class t{constructor(e,n,a,r,s,i){this.settings=e,this.databaseId=n,this.serializer=a,this.ignoreUndefinedProperties=r,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePathSegment(e),a}childContextForFieldPath(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePath(),a}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return wp(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(vR(this.dataSource)&&hU.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},MS=class{constructor(e,n,a){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=a||Hc(e)}createContext(e,n,a,r=!1){return new OS({dataSource:e,methodName:n,targetDoc:a,path:Pn.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function ev(t){let e=t._freezeSettings(),n=Hc(t._databaseId);return new MS(t._databaseId,!!e.ignoreUndefinedProperties,n)}function tv(t,e,n,a=!1){return nv(n,t.createContext(a?4:3,e))}function nv(t,e){if(ER(t=Nt(t)))return mU("Unsupported field value:",e,t),pU(t,e);if(t instanceof Vc)return function(a,r){if(!vR(r.dataSource))throw r.createError(`${a._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${a._methodName}() is not currently supported inside arrays`);let s=a._toFieldTransform(r);s&&r.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(a,r){let s=[],i=0;for(let l of a){let u=nv(l,r.childContextForArray(i));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),i++}return{arrayValue:{values:s}}}(t,e)}return function(a,r){if((a=Nt(a))===null)return{nullValue:"NULL_VALUE"};if(typeof a=="number")return dV(r.serializer,a);if(typeof a=="boolean")return{booleanValue:a};if(typeof a=="string")return{stringValue:a};if(a instanceof Date){let s=_t.fromDate(a);return{timestampValue:B_(r.serializer,s)}}if(a instanceof _t){let s=new _t(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:B_(r.serializer,s)}}if(a instanceof Ar)return{geoPointValue:{latitude:a.latitude,longitude:a.longitude}};if(a instanceof Va)return{bytesValue:Y0(r.serializer,a._byteString)};if(a instanceof In){let s=r.databaseId,i=a.firestore._databaseId;if(!i.isEqual(s))throw r.createError(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Q0(a.firestore._databaseId||r.databaseId,a._key.path)}}if(a instanceof Ua)return function(i,l){let u=i instanceof Ua?i.toArray():i;return{mapValue:{fields:{[VS]:{stringValue:US},[il]:{arrayValue:{values:u.map(f=>{if(typeof f!="number")throw l.createError("VectorValues must only contain numeric values.");return HS(l.serializer,f)})}}}}}}(a,r);if(aR(a))return a._toProto(r.serializer);throw r.createError(`Unsupported field value: ${Fc(a)}`)}(t,e)}function pU(t,e){let n={};return E0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Sl(t,(a,r)=>{let s=nv(r,e.childContextForField(a));s!=null&&(n[a]=s)}),{mapValue:{fields:n}}}function ER(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof _t||t instanceof Ar||t instanceof Va||t instanceof In||t instanceof Vc||t instanceof Ua||aR(t))}function mU(t,e,n){if(!ER(n)||!i0(n)){let a=Fc(n);throw a==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+a)}}function Wc(t,e,n){if((e=Nt(e))instanceof gl)return e._internalPath;if(typeof e=="string")return TR(t,e);throw wp("Field path arguments must be of type string or ",t,!1,void 0,n)}var gU=new RegExp("[~\\*/\\[\\]]");function TR(t,e,n){if(e.search(gU)>=0)throw wp(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new gl(...e.split("."))._internalPath}catch{throw wp(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function wp(t,e,n,a,r){let s=a&&!a.isEmpty(),i=r!==void 0,l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(s||i)&&(u+=" (found",s&&(u+=` in field ${a}`),i&&(u+=` in document ${r}`),u+=")"),new Y(z.INVALID_ARGUMENT,l+t+u)}var Uc=class{convertValue(e,n="none"){switch(Ds(e)){case 0:return null;case 1:return e.booleanValue;case 2:return $e(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Dr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw le(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){let a={};return Sl(e,(r,s)=>{a[r]=this.convertValue(s,n)}),a}convertVectorValue(e){let n=e.fields?.[il].arrayValue?.values?.map(a=>$e(a.doubleValue));return new Ua(n)}convertGeoPoint(e){return new Ar($e(e.latitude),$e(e.longitude))}convertArray(e,n){return(e.values||[]).map(a=>this.convertValue(a,n))}convertServerTimestamp(e,n){switch(n){case"previous":let a=xp(e);return a==null?null:this.convertValue(a,n);case"estimate":return this.convertTimestamp(Tc(e));default:return null}}convertTimestamp(e){let n=kr(e);return new _t(n.seconds,n.nanos)}convertDocumentKey(e,n){let a=Je.fromString(e);Ze(nR(a),9688,{name:e});let r=new bc(a.get(1),a.get(3)),s=new ae(a.popFirst(5));return r.isEqual(n)||xr(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}};var Cp=class extends Uc{constructor(e){super(),this.firestore=e}convertBytes(e){return new Va(e)}convertReference(e){let n=this.convertDocumentKey(e,this.firestore._databaseId);return new In(this.firestore,null,n)}};var bR="@firebase/firestore",wR="4.12.0";var Xc=class{constructor(e,n,a,r,s){this._firestore=e,this._userDataWriter=n,this._key=a,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new In(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new av(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let n=this._document.data.field(Wc("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}},av=class extends Xc{data(){return super.data()}};function SU(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new Y(z.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var Yc=class{},Cl=class extends Yc{};function Qc(t,e,...n){let a=[];e instanceof Yc&&a.push(e),a=a.concat(n),function(s){let i=s.filter(u=>u instanceof rv).length,l=s.filter(u=>u instanceof Mp).length;if(i>1||i>0&&l>0)throw new Y(z.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(a);for(let r of a)t=r._apply(t);return t}var Mp=class t extends Cl{constructor(e,n,a){super(),this._field=e,this._op=n,this._value=a,this.type="where"}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=this._parse(e);return RR(e._query,n),new ia(e.firestore,e.converter,kp(e._query,n))}_parse(e){let n=ev(e.firestore);return function(s,i,l,u,c,f,p){let m;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new Y(z.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){LR(p,f);let R=[];for(let D of p)R.push(CR(u,s,D));m={arrayValue:{values:R}}}else m=CR(u,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||LR(p,f),m=tv(l,i,p,f==="in"||f==="not-in");return ut.create(c,f,m)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}};function $c(t,e,n){let a=e,r=Wc("where",t);return Mp._create(r,a,n)}var rv=class t extends Yc{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new t(e,n)}_parse(e){let n=this._queryConstraints.map(a=>a._parse(e)).filter(a=>a.getFilters().length>0);return n.length===1?n[0]:Xn.create(n,this._getOperator())}_apply(e){let n=this._parse(e);return n.getFilters().length===0?e:(function(r,s){let i=r,l=s.getFlattenedFilters();for(let u of l)RR(i,u),i=kp(i,u)}(e._query,n),new ia(e.firestore,e.converter,kp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var sv=class t extends Cl{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new t(e,n)}_apply(e){let n=function(r,s,i){if(r.startAt!==null)throw new Y(z.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new Y(z.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Ps(s,i)}(e._query,this._field,this._direction);return new ia(e.firestore,e.converter,N0(e._query,n))}};function Jc(t,e="asc"){let n=e,a=Wc("orderBy",t);return sv._create(a,n)}var iv=class t extends Cl{constructor(e,n,a){super(),this.type=e,this._limit=n,this._limitType=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){return new ia(e.firestore,e.converter,Cc(e._query,this._limit,this._limitType))}};function Zc(t){return o0("limit",t),iv._create("limit",t,"F")}var ov=class t extends Cl{constructor(e,n,a){super(),this.type=e,this._docOrFields=n,this._inclusive=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=vU(e,this.type,this._docOrFields,this._inclusive);return new ia(e.firestore,e.converter,V0(e._query,n))}};function xR(...t){return ov._create("startAfter",t,!1)}function vU(t,e,n,a){if(n[0]=Nt(n[0]),n[0]instanceof Xc)return function(s,i,l,u,c){if(!u)throw new Y(z.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${l}().`);let f=[];for(let p of Li(s))if(p.field.isKeyField())f.push(zc(i,u.key));else{let m=u.data.field(p.field);if(qc(m))throw new Y(z.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+p.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(m===null){let v=p.field.canonicalString();throw new Y(z.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${v}' (used as the orderBy) does not exist.`)}f.push(m)}return new Pr(f,c)}(t._query,t.firestore._databaseId,e,n[0]._document,a);{let r=ev(t.firestore);return function(i,l,u,c,f,p){let m=i.explicitOrderBy;if(f.length>m.length)throw new Y(z.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let v=[];for(let R=0;R<f.length;R++){let D=f[R];if(m[R].field.isKeyField()){if(typeof D!="string")throw new Y(z.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof D}`);if(!Rp(i)&&D.indexOf("/")!==-1)throw new Y(z.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${D}' contains a slash.`);let x=i.path.child(Je.fromString(D));if(!ae.isDocumentKey(x))throw new Y(z.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${x}' is not because it contains an odd number of segments.`);let T=new ae(x);v.push(zc(l,T))}else{let x=tv(u,c,D);v.push(x)}}return new Pr(v,p)}(t._query,t.firestore._databaseId,r,e,n,a)}}function CR(t,e,n){if(typeof(n=Nt(n))=="string"){if(n==="")throw new Y(z.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Rp(e)&&n.indexOf("/")!==-1)throw new Y(z.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);let a=e.path.child(Je.fromString(n));if(!ae.isDocumentKey(a))throw new Y(z.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${a}' is not because it has an odd number of segments (${a.length}).`);return zc(t,new ae(a))}if(n instanceof In)return zc(t,n._key);throw new Y(z.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Fc(n)}.`)}function LR(t,e){if(!Array.isArray(t)||t.length===0)throw new Y(z.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function RR(t,e){let n=function(r,s){for(let i of r)for(let l of i.getFlattenedFilters())if(s.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new Y(z.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new Y(z.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}var El=class{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},Tl=class t extends Xc{constructor(e,n,a,r,s,i){super(e,n,a,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let n=new bl(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){let a=this._document.data.field(Wc("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new Y(z.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,n={};return n.type=t._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}};Tl._jsonSchemaVersion="firestore/documentSnapshot/1.0",Tl._jsonSchema={type:ct("string",Tl._jsonSchemaVersion),bundleSource:ct("string","DocumentSnapshot"),bundleName:ct("string"),bundle:ct("string")};var bl=class extends Tl{data(e={}){return super.data(e)}},wl=class t{constructor(e,n,a,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new El(r.hasPendingWrites,r.fromCache),this.query=a}get docs(){let e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(a=>{e.call(n,new bl(this._firestore,this._userDataWriter,a.key,a,new El(this._snapshot.mutatedKeys.has(a.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new Y(z.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(r,s){if(r._snapshot.oldDocs.isEmpty()){let i=0;return r._snapshot.docChanges.map(l=>{let u=new bl(r._firestore,r._userDataWriter,l.doc.key,l.doc,new El(r._snapshot.mutatedKeys.has(l.doc.key),r._snapshot.fromCache),r.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:i++}})}{let i=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{let u=new bl(r._firestore,r._userDataWriter,l.doc.key,l.doc,new El(r._snapshot.mutatedKeys.has(l.doc.key),r._snapshot.fromCache),r.query.converter),c=-1,f=-1;return l.type!==0&&(c=i.indexOf(l.doc.key),i=i.delete(l.doc.key)),l.type!==1&&(i=i.add(l.doc),f=i.indexOf(l.doc.key)),{type:EU(l.type),doc:u,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new Y(z.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=al.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let n=[],a=[],r=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),a.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),r.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function EU(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return le(61501,{type:t})}}wl._jsonSchemaVersion="firestore/querySnapshot/1.0",wl._jsonSchema={type:ct("string",wl._jsonSchemaVersion),bundleSource:ct("string","QuerySnapshot"),bundleName:ct("string"),bundle:ct("string")};function Vp(t){t=Bc(t,ia);let e=Bc(t.firestore,ml),n=ZS(e),a=new Cp(e);return SU(t._query),yR(n,t._query).then(r=>new wl(e,a,t,r))}(function(e,n=!0){a0(Ra),xa(new mn("firestore",(a,{instanceIdentifier:r,options:s})=>{let i=a.getProvider("app").getImmediate(),l=new ml(new Jh(a.getProvider("auth-internal")),new ep(i,a.getProvider("app-check-internal")),L0(i,r),i);return s={useFetchStreams:n,...s},l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),gn(bR,wR,e),gn(bR,wR,"esm2020")})();var NR="firebasestorage.googleapis.com",TU="storageBucket",bU=2*60*1e3,wU=10*60*1e3;var Ba=class t extends rn{constructor(e,n,a=0){super(uv(e),`Firebase Storage: ${n} (${uv(e)})`),this.status_=a,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return uv(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},qa;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(qa||(qa={}));function uv(t){return"storage/"+t}function CU(){let t="An unknown error occurred, please check the error payload for server response.";return new Ba(qa.UNKNOWN,t)}function LU(){return new Ba(qa.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function AU(){return new Ba(qa.CANCELED,"User canceled the upload/download.")}function xU(t){return new Ba(qa.INVALID_URL,"Invalid URL '"+t+"'.")}function RU(t){return new Ba(qa.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function kR(t){return new Ba(qa.INVALID_ARGUMENT,t)}function VR(){return new Ba(qa.APP_DELETED,"The Firebase app was deleted.")}function kU(t){return new Ba(qa.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}var Nr=class t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let a;try{a=t.makeFromUrl(e,n)}catch{return new t(e,"")}if(a.path==="")return a;throw RU(e)}static makeFromUrl(e,n){let a=null,r="([A-Za-z0-9.\\-_]+)";function s(L){L.path.charAt(L.path.length-1)==="/"&&(L.path_=L.path_.slice(0,-1))}let i="(/(.*))?$",l=new RegExp("^gs://"+r+i,"i"),u={bucket:1,path:3};function c(L){L.path_=decodeURIComponent(L.path)}let f="v[A-Za-z0-9_]+",p=n.replace(/[.]/g,"\\."),m="(/([^?#]*).*)?$",v=new RegExp(`^https?://${p}/${f}/b/${r}/o${m}`,"i"),R={bucket:1,path:3},D=n===NR?"(?:storage.googleapis.com|storage.cloud.google.com)":n,x="([^?#]*)",T=new RegExp(`^https?://${D}/${r}/${x}`,"i"),C=[{regex:l,indices:u,postModify:s},{regex:v,indices:R,postModify:c},{regex:T,indices:{bucket:1,path:2},postModify:c}];for(let L=0;L<C.length;L++){let U=C[L],N=U.regex.exec(e);if(N){let y=N[U.indices.bucket],g=N[U.indices.path];g||(g=""),a=new t(y,g),U.postModify(a);break}}if(a==null)throw xU(e);return a}},cv=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function DU(t,e,n){let a=1,r=null,s=null,i=!1,l=0;function u(){return l===2}let c=!1;function f(...x){c||(c=!0,e.apply(null,x))}function p(x){r=setTimeout(()=>{r=null,t(v,u())},x)}function m(){s&&clearTimeout(s)}function v(x,...T){if(c){m();return}if(x){m(),f.call(null,x,...T);return}if(u()||i){m(),f.call(null,x,...T);return}a<64&&(a*=2);let C;l===1?(l=2,C=0):C=(a+Math.random())*1e3,p(C)}let R=!1;function D(x){R||(R=!0,m(),!c&&(r!==null?(x||(l=2),clearTimeout(r),p(0)):x||(l=1)))}return p(0),s=setTimeout(()=>{i=!0,D(!0)},n),D}function PU(t){t(!1)}function OU(t){return t!==void 0}function DR(t,e,n,a){if(a<e)throw kR(`Invalid value for '${t}'. Expected ${e} or greater.`);if(a>n)throw kR(`Invalid value for '${t}'. Expected ${n} or less.`)}function MU(t){let e=encodeURIComponent,n="?";for(let a in t)if(t.hasOwnProperty(a)){let r=e(a)+"="+e(t[a]);n=n+r+"&"}return n=n.slice(0,-1),n}var Up;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Up||(Up={}));function NU(t,e){let n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return n||r||s}var dv=class{constructor(e,n,a,r,s,i,l,u,c,f,p,m=!0,v=!1){this.url_=e,this.method_=n,this.headers_=a,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=i,this.callback_=l,this.errorCallback_=u,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=p,this.retry=m,this.isUsingEmulator=v,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,D)=>{this.resolve_=R,this.reject_=D,this.start_()})}start_(){let e=(a,r)=>{if(r){a(!1,new Ll(!1,null,!0));return}let s=this.connectionFactory_();this.pendingConnection_=s;let i=l=>{let u=l.loaded,c=l.lengthComputable?l.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,c)};this.progressCallback_!==null&&s.addUploadProgressListener(i),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(i),this.pendingConnection_=null;let l=s.getErrorCode()===Up.NO_ERROR,u=s.getStatus();if(!l||NU(u,this.additionalRetryCodes_)&&this.retry){let f=s.getErrorCode()===Up.ABORT;a(!1,new Ll(!1,null,f));return}let c=this.successCodes_.indexOf(u)!==-1;a(!0,new Ll(c,s))})},n=(a,r)=>{let s=this.resolve_,i=this.reject_,l=r.connection;if(r.wasSuccessCode)try{let u=this.callback_(l,l.getResponse());OU(u)?s(u):s()}catch(u){i(u)}else if(l!==null){let u=CU();u.serverResponse=l.getErrorText(),this.errorCallback_?i(this.errorCallback_(l,u)):i(u)}else if(r.canceled){let u=this.appDelete_?VR():AU();i(u)}else{let u=LU();i(u)}};this.canceled_?n(!1,new Ll(!1,null,!0)):this.backoffId_=DU(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&PU(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},Ll=class{constructor(e,n,a){this.wasSuccessCode=e,this.connection=n,this.canceled=!!a}};function VU(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function UU(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function FU(t,e){e&&(t["X-Firebase-GMPID"]=e)}function BU(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function qU(t,e,n,a,r,s,i=!0,l=!1){let u=MU(t.urlParams),c=t.url+u,f=Object.assign({},t.headers);return FU(f,e),VU(f,n),UU(f,s),BU(f,a),new dv(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,i,l)}function zU(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function HU(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}var K5=256*1024;var fv=class t{constructor(e,n){this._service=e,n instanceof Nr?this._location=n:this._location=Nr.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new t(e,n)}get root(){let e=new Nr(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return HU(this._location.path)}get storage(){return this._service}get parent(){let e=zU(this._location.path);if(e===null)return null;let n=new Nr(this._location.bucket,e);return new t(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw kU(e)}};function PR(t,e){let n=e?.[TU];return n==null?null:Nr.makeFromBucketSpec(n,t)}function GU(t,e,n,a={}){t.host=`${e}:${n}`;let r=La(e);r&&(Fo(`https://${t.host}/b`),Bo("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:s}=a;s&&(t._overrideAuthToken=typeof s=="string"?s:ih(s,t.app.options.projectId))}var hv=class{constructor(e,n,a,r,s,i=!1){this.app=e,this._authProvider=n,this._appCheckProvider=a,this._url=r,this._firebaseVersion=s,this._isUsingEmulator=i,this._bucket=null,this._host=NR,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=bU,this._maxUploadRetryTime=wU,this._requests=new Set,r!=null?this._bucket=Nr.makeFromBucketSpec(r,this._host):this._bucket=PR(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Nr.makeFromBucketSpec(this._url,e):this._bucket=PR(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){DR("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){DR("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(yn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new fv(this,e)}_makeRequest(e,n,a,r,s=!0){if(this._deleted)return new cv(VR());{let i=qU(e,this._appId,a,r,n,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(e,n){let[a,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,a,r).getPromise()}},OR="@firebase/storage",MR="0.14.1";var UR="storage";function FR(t=Go(),e){t=Nt(t);let a=gi(t,UR).getImmediate({identifier:e}),r=sh("storage");return r&&jU(a,...r),a}function jU(t,e,n,a={}){GU(t,e,n,a)}function KU(t,{instanceIdentifier:e}){let n=t.getProvider("app").getImmediate(),a=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new hv(n,a,r,e,Ra)}function WU(){xa(new mn(UR,KU,"PUBLIC").setMultipleInstances(!0)),gn(OR,MR,""),gn(OR,MR,"esm2020")}WU();var BR={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var pv=wI(BR),qR=n_(pv),Fp=JS(pv),n6=FR(pv);var mv=null,gv=null;async function XU(t){let e=Date.now();if(mv&&gv&&e<gv)return mv;let n=await t.getIdToken(),a=await t.getIdTokenResult();return mv=n,gv=a.expirationTime?new Date(a.expirationTime).getTime()-6e4:e+6e4,n}function YU(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let n=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return n.startsWith("http")?t:e+n}var QU=25e3;async function zR(t,e={}){let n=qR.currentUser;if(!n)throw new Error("User not authenticated");let a=await XU(n),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${a}`);let s=e.timeout!==void 0?e.timeout:QU,{timeout:i,...l}=e,u=l.signal,c=null,f=null;s>0&&(c=new AbortController,f=setTimeout(()=>{console.warn("[authFetch] Request exceeded timeout threshold:",s,"ms"),c.abort()},s),u=l.signal?(()=>{let p=new AbortController;return l.signal?.addEventListener("abort",()=>{clearTimeout(f),p.abort()}),c.signal.addEventListener("abort",()=>p.abort()),p.signal})():c.signal);try{let p=await fetch(YU(t),{...l,headers:r,signal:u??l.signal});return f&&clearTimeout(f),p}catch(p){throw f&&clearTimeout(f),p instanceof Error&&p.name==="AbortError"&&c?.signal.aborted?new Error("Request timed out"):p}}var yv=null;function $U(){if(typeof window>"u")return null;if(!yv)try{yv=new AudioContext}catch{return null}return yv}function HR(){let t=$U();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(400,e+.02),n.type="sine",a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.05),n.start(e),n.stop(e+.05)}var B=Ee(En());var JU=typeof process<"u"&&!1;function Bp(t,e){if(JU&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var tF=20;function nF(t){let e=t.data(),n=e.status??"open",a=e.isResolved===!0||n==="resolved"||n==="done",r=n==="skipped";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:a,isSkipped:r||void 0,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null,clarityScore:e.clarityScore??null,clarityStatus:e.clarityStatus??null,clarityIssues:e.clarityIssues??null,clarityConfidence:e.clarityConfidence??null,clarityCheckedAt:e.clarityCheckedAt??null}}async function WR(t,e=tF,n){Bp(e,"getSessionFeedbackPageRepo");let a=Kc(Fp,"feedback"),r=n!=null?Qc(a,$c("sessionId","==",t),Jc("createdAt","desc"),Zc(e),xR(n)):Qc(a,$c("sessionId","==",t),Jc("createdAt","desc"),Zc(e)),s=Date.now(),i=await Vp(r),l=Date.now()-s;console.log(`[FIRESTORE] query duration: ${l}ms`);let u=i.docs,c=u.map(nF),f=u.length>0?u[u.length-1]:null,p=u.length===e;return{feedback:c,lastVisibleDoc:f,hasMore:p}}async function XR(t,e=50){let{feedback:n}=await WR(t,e);return n}var YR=new Set(["script","style","noscript","iframe","svg"]);function St(t){if(!t)return!1;let e=t instanceof Element?t:t.parentElement;if(!e)return!1;let n=t instanceof Element?t:e;if(n.id&&String(n.id).toLowerCase().startsWith("echly"))return!0;let a=n.className;if(a&&typeof a=="string"&&a.includes("echly")||n instanceof Element&&n.getAttribute?.("data-echly-ui")!=null||n instanceof Element&&n.closest?.("[data-echly-ui]"))return!0;let r=n.getRootNode?.();return!!(r&&r instanceof ShadowRoot&&St(r.host))}function qp(t){if(!(t instanceof HTMLElement)||t.getAttribute?.("aria-hidden")==="true")return!0;let e=t.ownerDocument?.defaultView?.getComputedStyle?.(t);return e?e.display==="none"||e.visibility==="hidden":!1}function rF(t){if(!t?.getRootNode||St(t))return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let n=[],a=t;for(;a&&a!==e.body&&n.length<12;){let s=a.tagName.toLowerCase(),i=a.id?.trim();if(i&&/^[a-zA-Z][\w-]*$/.test(i)&&!i.includes(" ")){s+=`#${i}`,n.unshift(s);break}let l=a.getAttribute?.("class")?.trim();if(l){let p=l.split(/\s+/).find(m=>m.length>0&&/^[a-zA-Z_][\w-]*$/.test(m));p&&(s+=`.${p}`)}let u=a.parentElement;if(!u)break;let c=u.children,f=0;for(let p=0;p<c.length;p++)if(c[p]===a){f=p+1;break}s+=`:nth-child(${f})`,n.unshift(s),a=u}return n.length===0?null:n.join(" > ")}function sF(t){if(!t||St(t))return null;let e=[],n=t.ownerDocument.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode(i){let l=i.parentElement;if(!l||St(l))return NodeFilter.FILTER_REJECT;let u=l.getRootNode?.();if(u&&u instanceof ShadowRoot&&St(u.host))return NodeFilter.FILTER_REJECT;let c=l.tagName.toLowerCase();return YR.has(c)||qp(l)?NodeFilter.FILTER_REJECT:(i.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),a=0,r=n.nextNode();for(;r&&a<2e3;){let i=(r.textContent??"").trim();if(i.length>0){let l=i.slice(0,2e3-a);e.push(l),a+=l.length}r=n.nextNode()}return e.length===0?null:e.join(" ").replace(/\s+/g," ").trim().slice(0,2e3)||null}function iF(t){if(!t||St(t))return null;let e=[];function n(i){if(!i||St(i)||qp(i))return;let u=(i.innerText??i.textContent??"").replace(/\s+/g," ").trim().slice(0,200);u.length>0&&e.push(u)}let a=t.getAttribute?.("aria-label")||t.placeholder||(t.innerText??t.textContent??"").trim();a&&e.push(String(a).slice(0,120));let r=t.parentElement;if(r&&!St(r)&&!qp(r)&&n(r),r)for(let i=0;i<r.children.length;i++){let l=r.children[i];l!==t&&!St(l)&&n(l)}for(let i=0;i<t.children.length;i++)St(t.children[i])||n(t.children[i]);let s=e.filter(Boolean).join(" ").replace(/\s+/g," ").trim();return s?s.length>800?s.slice(0,800)+"\u2026":s:null}function oF(t){if(!t?.document?.body)return null;let e=t.document,n=e.body,a=[],r=e.createTreeWalker(n,NodeFilter.SHOW_TEXT,{acceptNode(u){let c=u.parentElement;if(!c||St(c))return NodeFilter.FILTER_REJECT;let f=c.getRootNode?.();if(f&&f instanceof ShadowRoot&&St(f.host))return NodeFilter.FILTER_REJECT;let p=c.tagName.toLowerCase();if(YR.has(p)||qp(c))return NodeFilter.FILTER_REJECT;let m=c.getBoundingClientRect?.();return m&&(m.top>=t.innerHeight||m.bottom<=0||m.left>=t.innerWidth||m.right<=0)?NodeFilter.FILTER_REJECT:(u.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),s=0,i=r.nextNode();for(;i&&s<1500;){let u=(i.textContent??"").trim();if(u.length>0){let c=u.slice(0,1500-s);a.push(c),s+=c.length}i=r.nextNode()}return a.length===0?null:a.join(" ").replace(/\s+/g," ").trim().slice(0,1500)||null}function za(t,e){try{typeof console<"u"&&console.log&&console.log(`ECHLY DEBUG \u2014 ${t}`,e)}catch{}}function zp(t,e){let n=e;for(;n&&St(n);)n=n.parentElement;let a=n?rF(n):null,r=n?sF(n):null,s=n?iF(n):null,i=oF(t);if(n&&!St(n)&&n!==t.document?.body){if(!r?.trim()){let c=(n.innerText??n.textContent??"").replace(/\s+/g," ").trim().slice(0,2e3)||null;c&&(r=c),r&&za("SUBTREE TEXT FALLBACK USED","element.innerText")}!s?.trim()&&n.parentElement&&!St(n.parentElement)&&(s=(n.parentElement.innerText??n.parentElement.textContent??"").replace(/\s+/g," ").trim().slice(0,800)||null,s&&za("NEARBY TEXT FALLBACK USED","parent.innerText"))}i?.trim()||za("VISIBLE TEXT FALLBACK USED","(skipped to avoid Echly UI)");let l={url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:a,nearbyText:s??null,subtreeText:r??null,visibleText:i??null,capturedAt:Date.now()};return za("DOM PATH",l.domPath??"(none)"),za("SUBTREE TEXT SIZE",l.subtreeText?.length??0),za("NEARBY TEXT SIZE",l.nearbyText?.length??0),za("VISIBLE TEXT SIZE",l.visibleText?.length??0),za("DOM SCOPE SAMPLE",(l.subtreeText??"").slice(0,200)||"(empty)"),za("NEARBY SCOPE SAMPLE",(l.nearbyText??"").slice(0,200)||"(empty)"),za("VISIBLE TEXT SAMPLE",(l.visibleText??"").slice(0,200)||"(empty)"),l}var Iv=null;function lF(){if(typeof window>"u")return null;if(!Iv)try{Iv=new AudioContext}catch{return null}return Iv}function Hp(){let t=lF();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(600,e+.04),n.type="sine",a.gain.setValueAtTime(.04,e),a.gain.exponentialRampToValueAtTime(.001,e+.06),n.start(e),n.stop(e+.06)}var uF="[SESSION]";function Ns(t){typeof console<"u"&&console.debug&&console.debug(`${uF} ${t}`)}function Gp(t){if(!t||t===document.body||St(t))return!1;let e=document.getElementById("echly-shadow-host");if(e&&e.contains(t))return!1;let n=t.tagName?.toLowerCase();if(n==="input"||n==="textarea"||n==="select")return!1;let a=t.getAttribute?.("contenteditable");return!(a==="true"||a==="")}var Lt=Ee(En());var Vr=Ee(et()),Al=24,Kp="cubic-bezier(0.22, 0.61, 0.36, 1)";async function _v(t,e,n){return new Promise((a,r)=>{let s=new Image;s.crossOrigin="anonymous",s.onload=()=>{let i=Math.round(e.x*n),l=Math.round(e.y*n),u=Math.round(e.w*n),c=Math.round(e.h*n),f=document.createElement("canvas");f.width=u,f.height=c;let p=f.getContext("2d");if(!p){r(new Error("No canvas context"));return}p.drawImage(s,i,l,u,c,0,0,u,c);try{a(f.toDataURL("image/png"))}catch(m){r(m)}},s.onerror=()=>r(new Error("Image load failed")),s.src=t})}function ZR({getFullTabImage:t,onAddVoice:e,onCancel:n,onSelectionStart:a}){let[r,s]=(0,Lt.useState)(null),[i,l]=(0,Lt.useState)(null),[u,c]=(0,Lt.useState)(!1),[f,p]=(0,Lt.useState)(!1),m=(0,Lt.useRef)(null),v=(0,Lt.useRef)(null),R=(0,Lt.useCallback)(()=>{s(null),l(null),m.current=null,v.current=null,setTimeout(()=>n(),120)},[n]);(0,Lt.useEffect)(()=>{let g=_=>{_.key==="Escape"&&(_.preventDefault(),i?(l(null),s(null),v.current=null,m.current=null):R())};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[R,i]),(0,Lt.useEffect)(()=>{let g=()=>{document.visibilityState==="hidden"&&R()};return document.addEventListener("visibilitychange",g),()=>document.removeEventListener("visibilitychange",g)},[R]);let D=(0,Lt.useCallback)(async g=>{if(u)return;c(!0),Hp(),p(!0),setTimeout(()=>p(!1),150),await new Promise(se=>setTimeout(se,200));let _=null;try{_=await t()}catch{c(!1),n();return}if(!_){c(!1),n();return}let b=typeof window<"u"&&window.devicePixelRatio||1,w;try{w=await _v(_,g,b)}catch{c(!1),n();return}let A=g.x+g.w/2,S=g.y+g.h/2,$=null;if(typeof document<"u"&&document.elementsFromPoint)for($=document.elementsFromPoint(A,S).find(O=>!St(O))??document.elementFromPoint(A,S)??document.elementFromPoint(g.x+2,g.y+2);$&&St($);)$=$.parentElement;let Z=typeof window<"u"?zp(window,$):null;e(w,Z),c(!1),l(null)},[t,e,n,u]),x=(0,Lt.useCallback)(()=>{l(null),s(null),v.current=null,m.current=null},[]),T=(0,Lt.useCallback)(g=>{if(g.button!==0||i)return;g.preventDefault(),a?.();let _=g.clientX,b=g.clientY;m.current={x:_,y:b},s({x:_,y:b,w:0,h:0})},[a,i]),E=(0,Lt.useCallback)(g=>{if(g.button!==0)return;g.preventDefault();let _=v.current,b=m.current;if(m.current=null,!b||!_||_.w<Al||_.h<Al){s(null);return}s(null),v.current=null,l({x:_.x,y:_.y,w:_.w,h:_.h})},[]),C=(0,Lt.useCallback)(g=>{if(!m.current||i)return;let _=m.current.x,b=m.current.y,w=Math.min(_,g.clientX),A=Math.min(b,g.clientY),S=Math.abs(g.clientX-_),$=Math.abs(g.clientY-b),Z={x:w,y:A,w:S,h:$};v.current=Z,s(Z)},[i]);(0,Lt.useEffect)(()=>{let g=_=>{if(_.button!==0||!m.current||i)return;let b=v.current,w=m.current;if(m.current=null,!w||!b||b.w<Al||b.h<Al){s(null),v.current=null;return}s(null),v.current=null,l({x:b.x,y:b.y,w:b.w,h:b.h})};return window.addEventListener("mouseup",g),()=>window.removeEventListener("mouseup",g)},[i]);let L=!!r&&(r.w>=Al||r.h>=Al),U=i!==null,N=L&&r||U&&i,y=U?i:r;return(0,Vr.jsxs)("div",{id:"echly-overlay",role:"presentation","aria-hidden":!0,className:"echly-region-overlay","data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,Vr.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:N?"transparent":"rgba(0,0,0,0.35)",pointerEvents:i?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${Kp}`},onMouseDown:T,onMouseMove:C,onMouseUp:E,onMouseLeave:()=>{!m.current||i||(s(null),m.current=null,v.current=null)}}),(0,Vr.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",fontSize:13,color:"rgba(255,255,255,0.8)",zIndex:2147483647,pointerEvents:"none",opacity:i?0:1,transition:`opacity 180ms ${Kp}`},children:"Drag to capture area \u2014 ESC to cancel"}),N&&y&&(0,Vr.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:y.x,top:y.y,width:Math.max(y.w,1),height:Math.max(y.h,1),borderRadius:6,border:`2px solid ${f?"#FFFFFF":"#5B8CFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.35)",pointerEvents:"none",zIndex:2147483646,transition:f?"none":`border-color 150ms ${Kp}`}}),U&&i&&(0,Vr.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:i.x+i.w/2,bottom:Math.max(12,i.y+i.h-48),transform:"translate(-50%, 100%)",display:"flex",gap:8,padding:"8px 12px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${Kp} forwards`},children:[(0,Vr.jsx)("button",{type:"button",onClick:x,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Retake"}),(0,Vr.jsx)("button",{type:"button",onClick:()=>D(i),disabled:u,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"linear-gradient(135deg, #5B8CFF, #466EFF)",color:"#fff",fontSize:13,fontWeight:600,cursor:u?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var ek=40;function fF(t,e=ek,n,a){let r=t.getBoundingClientRect(),s=n??(typeof window<"u"?window.innerWidth:0),i=a??(typeof window<"u"?window.innerHeight:0),l=Math.max(0,r.left-e),u=Math.max(0,r.top-e),c=s-l,f=i-u,p=Math.min(r.width+e*2,c),m=Math.min(r.height+e*2,f);return{x:l,y:u,w:Math.max(1,p),h:Math.max(1,m)}}async function tk(t,e,n=ek){let a=typeof window<"u"&&window.devicePixelRatio||1,r=fF(e,n);return _v(t,r,a)}var Sv="[SESSION]",vv=null,oa=[],xl=null,Rl=null;function ak(t){let e=t.getBoundingClientRect();return{x:e.left+e.width/2,y:e.top+e.height/2}}function rk(t,e,n){t.style.left=`${e}px`,t.style.top=`${n}px`,t.style.transform="translate(-50%, -50%)"}function hF(){xl&&Rl||(xl=()=>nk(),Rl=()=>nk(),window.addEventListener("scroll",xl,{passive:!0,capture:!0}),window.addEventListener("resize",Rl))}function sk(){xl&&(window.removeEventListener("scroll",xl,{capture:!0}),xl=null),Rl&&(window.removeEventListener("resize",Rl),Rl=null)}function Ev(t,e,n={}){let{onMarkerClick:a,getSessionPaused:r}=n;if(!t)return;let s=document.getElementById("echly-marker-layer");if(!s)return;vv=s;let i=oa.length+1,l=e.x,u=e.y;if(e.element){let p=ak(e.element);l=p.x,u=p.y}let c=document.createElement("div");c.className="echly-feedback-marker",c.setAttribute("data-echly-ui","true"),c.setAttribute("aria-label",`Feedback ${i}`),c.textContent=String(i),c.title=e.title??`Feedback #${i}`,c.style.cssText=["width:22px","height:22px","border-radius:50%","background:#2563eb","color:white","font-size:12px","font-weight:600","display:flex","align-items:center","justify-content:center","position:fixed","z-index:2147483646","box-shadow:0 4px 12px rgba(0,0,0,0.15)","cursor:pointer","pointer-events:auto","box-sizing:border-box"].join(";"),rk(c,l,u);let f={...e,x:l,y:u,index:i,domElement:c};oa.push(f),c.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation(),!r?.()&&(console.log(`${Sv} marker clicked`,f.id),a?.({id:f.id,x:f.x,y:f.y,element:f.element,title:f.title,index:f.index}))}),vv.appendChild(c),oa.length===1&&hF(),console.log(`${Sv} marker created`,f.id,i)}function Tv(t,e){let n=oa.find(a=>a.id===t);n&&(e.id!=null&&(n.id=e.id),e.title!=null&&(n.title=e.title),n.domElement.title=n.title??`Feedback #${n.index}`)}function ed(t){let e=oa.findIndex(a=>a.id===t);if(e===-1)return;oa[e].domElement.remove(),oa.splice(e,1),oa.length===0&&sk()}function nk(){for(let t of oa)if(t.element&&t.element.isConnected){let{x:e,y:n}=ak(t.element);t.x=e,t.y=n,rk(t.domElement,e,n)}}function ik(){let t=document.getElementById("echly-marker-layer");if(t)for(;t.firstChild;)t.removeChild(t.firstChild);for(let e of oa)console.log(`${Sv} marker removed`,e.id);oa.length=0,vv=null,sk()}var Wp=24;var mF="echly-capture-root",uk=120;function gF(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let n=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),a=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(n&&!a)return"negative";if(a&&!n)return"positive";if(n&&a){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,s=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>s?"negative":s>r?"positive":"neutral"}return"neutral"}function bv(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}async function yF(t){let e=document.getElementById(mF),n=e?.style.display??"";try{return e&&(e.style.display="none",await new Promise(a=>requestAnimationFrame(()=>a()))),await t()}finally{e&&(e.style.display=n)}}var Xp=["focus_mode","region_selecting","voice_listening","processing"];function ck({sessionId:t,extensionMode:e=!1,initialPointers:n,onComplete:a,onDelete:r,onRecordingChange:s,loadSessionWithPointers:i,onSessionLoaded:l,onCreateSession:u,onActiveSessionChange:c,globalSessionModeActive:f,globalSessionPaused:p,onSessionModeStart:m,onSessionModePause:v,onSessionModeResume:R,onSessionModeEnd:D}){let[x,T]=(0,B.useState)([]),[E,C]=(0,B.useState)(null),[L,U]=(0,B.useState)(!1),[N,y]=(0,B.useState)("idle"),[g,_]=(0,B.useState)(null),[b,w]=(0,B.useState)(n??[]),[A,S]=(0,B.useState)(null),[$,Z]=(0,B.useState)(null),[se,O]=(0,B.useState)(""),[P,V]=(0,B.useState)(""),[Q,G]=(0,B.useState)(!1),[te,Se]=(0,B.useState)(null),[ue,X]=(0,B.useState)(!1),[me,Ne]=(0,B.useState)(null),[be,re]=(0,B.useState)(0),[Xe,sn]=(0,B.useState)(!0),[qr,qt]=(0,B.useState)(null),[ua,Us]=(0,B.useState)(!1),[kl,Oi]=(0,B.useState)(!1),[Mi,Ni]=(0,B.useState)(null),[xt,ft]=(0,B.useState)(!1),[zr,Dl]=(0,B.useState)(!1),[Vi,Fs]=(0,B.useState)(!1),[Ka,Yn]=(0,B.useState)(!1),[Hr,Qn]=(0,B.useState)(!1),[ca,Zt]=(0,B.useState)(null),[tm,en]=(0,B.useState)(!1),On=(0,B.useRef)(!1),Gr=(0,B.useRef)(!1),Wa=(0,B.useRef)(null);(0,B.useEffect)(()=>{On.current=zr},[zr]),(0,B.useEffect)(()=>{Gr.current=Vi},[Vi]);let $n=(0,B.useRef)({x:0,y:0}),Xa=(0,B.useRef)(null),Xt=(0,B.useRef)(null),jr=(0,B.useRef)(null),Ya=(0,B.useRef)(null),Kr=(0,B.useRef)(null),Rt=(0,B.useRef)(x),da=(0,B.useRef)(N),it=(0,B.useRef)(!1),Qa=(0,B.useRef)(!1),ud=(0,B.useRef)(null),cd=(0,B.useRef)(!1),fa=(0,B.useRef)(null),Pl=(0,B.useRef)(null),Ol=(0,B.useRef)(null),ha=(0,B.useRef)(null),Bs=(0,B.useRef)(null),qs=(0,B.useRef)(null),zs=(0,B.useRef)(null),$a=(0,B.useRef)(null),Ml=(0,B.useRef)(!1);(0,B.useEffect)(()=>{da.current=N},[N]),(0,B.useEffect)(()=>(N==="focus_mode"||N==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[N]),(0,B.useEffect)(()=>{if(N!=="voice_listening"){ha.current!=null&&(cancelAnimationFrame(ha.current),ha.current=null),fa.current?.getTracks().forEach(ce=>ce.stop()),fa.current=null,Pl.current?.close().catch(()=>{}),Pl.current=null,Ol.current=null,re(0);return}let q=Ol.current;if(!q)return;let j=new Uint8Array(q.frequencyBinCount),K,ne=()=>{q.getByteFrequencyData(j);let ce=j.reduce((ve,Sn)=>ve+Sn,0),Be=j.length?ce/j.length:0,de=Math.min(1,Be/128);re(de),K=requestAnimationFrame(ne)};return K=requestAnimationFrame(ne),ha.current=K,()=>{cancelAnimationFrame(K),ha.current=null}},[N]),(0,B.useEffect)(()=>{ud.current=$},[$]),(0,B.useEffect)(()=>{cd.current=Xp.includes(N)},[N]);let Mn=(0,B.useRef)(!1);(0,B.useEffect)(()=>{if(!s)return;Xp.includes(N)?(Mn.current=!0,s(!0)):Mn.current&&(Mn.current=!1,s(!1))},[N,s]);let Nl=(0,B.useCallback)(q=>{q===!1&&(cd.current||e||Xp.includes(da.current)||ud.current)||U(q)},[e]),Vl=(0,B.useCallback)(()=>{U(q=>!q)},[]);(0,B.useEffect)(()=>{Kr.current=E},[E]),(0,B.useEffect)(()=>{Rt.current=x},[x]),(0,B.useEffect)(()=>{let q=K=>{if(!ue||!Xa.current)return;K.preventDefault();let ne=Xa.current.offsetWidth,ce=Xa.current.offsetHeight,Be=K.clientX-$n.current.x,de=K.clientY-$n.current.y,ve=window.innerWidth-ne-Wp,Sn=window.innerHeight-ce-Wp;Be=Math.max(Wp,Math.min(Be,ve)),de=Math.max(Wp,Math.min(de,Sn)),Se({x:Be,y:de})},j=()=>{ue&&(X(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",q),window.addEventListener("mouseup",j),()=>{window.removeEventListener("mousemove",q),window.removeEventListener("mouseup",j)}},[ue]);let Ui=(0,B.useCallback)(q=>{if(q.button!==0||!Xa.current)return;let j=Xa.current.getBoundingClientRect();X(!0),document.body.style.userSelect="none",$n.current={x:q.clientX-j.left,y:q.clientY-j.top},Se({x:j.left,y:j.top})},[]),pa=(0,B.useCallback)(()=>{if(Xt.current)return;Zt(null);let q=document.createElement("div");q.id="echly-capture-root",document.body.appendChild(q),Xt.current=q,Ni(q),Oi(!0)},[]);(0,B.useEffect)(()=>{let q=document.getElementById("echly-capture-root");if(!q||q.querySelector("#echly-marker-layer"))return;let j=document.createElement("div");j.id="echly-marker-layer",j.style.cssText=["position:fixed","top:0","left:0","width:100%","height:100%","pointer-events:none","z-index:2147483646"].join(";"),q.appendChild(j)},[Mi]);let on=(0,B.useCallback)(()=>{if(!(e&&f!==!1)){if(Xt.current){try{document.body.removeChild(Xt.current)}catch(q){console.error("CaptureWidget error:",q)}Xt.current=null}Ni(null),Oi(!1)}},[e,f]),Jn=(0,B.useCallback)(()=>{y("idle"),U(Xe)},[Xe]),Ja=(0,B.useCallback)(q=>{let j=q==="pause"?Bs:qs;j.current!=null&&(window.clearTimeout(j.current),j.current=null)},[]);(0,B.useEffect)(()=>()=>{Bs.current!=null&&window.clearTimeout(Bs.current),qs.current!=null&&window.clearTimeout(qs.current)},[]),(0,B.useEffect)(()=>{if(n!=null){w(n);return}if(!t)return;(async()=>{let j=await XR(t);w(j.map(K=>({id:K.id,title:K.title,description:K.description,type:K.type})))})()},[t,n]),(0,B.useEffect)(()=>{let q=window.SpeechRecognition||window.webkitSpeechRecognition;if(!q)return;let j=new q;return j.continuous=!0,j.interimResults=!0,j.lang="en-US",j.onstart=()=>{let K=Date.now();$a.current=K,console.log("[VOICE] recognition.onstart",K);let ne=zs.current;ne!=null&&console.log("[VOICE] delay UI recording start\u2192onstart:",K-ne,"ms")},j.onspeechstart=()=>{console.log("[VOICE] speech detected",Date.now())},j.onaudiostart=()=>{console.log("[VOICE] audio start",Date.now())},j.onresult=K=>{let ne="";for(let de=0;de<K.results.length;++de){let Sn=K.results[de][0];Sn&&(ne+=Sn.transcript+" ")}ne=ne.replace(/\s+/g," ").trim();let ce=Date.now();if(oe("RECORDING","result",{transcript:ne}),console.log("[VOICE] transcript received",ce,ne),ne&&!Ml.current){Ml.current=!0,console.log("[VOICE] first transcript chunk:",ne,"length:",ne.length);let de=zs.current,ve=$a.current;de!=null&&console.log("[VOICE] delay UI\u2192first transcript:",ce-de,"ms"),ve!=null&&console.log("[VOICE] delay onstart\u2192first transcript:",ce-ve,"ms")}let Be=Kr.current;Be&&T(de=>de.map(ve=>ve.id===Be?{...ve,transcript:ne}:ve))},j.onend=()=>{if(!Qa.current){oe("RECORDING","unexpected end"),da.current==="voice_listening"&&y("idle");return}Qa.current=!1;let K=da.current;K==="processing"||K==="success"||y("idle")},jr.current=j,()=>{try{j.stop()}catch(K){console.error("CaptureWidget error:",K)}}},[]);let ma=(0,B.useCallback)(async()=>{oe("RECORDING","start");let q=Date.now();zs.current=q,$a.current=null,Ml.current=!1,console.log("[VOICE] UI recording started",q);try{let j=await navigator.mediaDevices.getUserMedia({audio:!0});fa.current=j;let K=new AudioContext,ne=K.createAnalyser();ne.fftSize=256,ne.smoothingTimeConstant=.7,K.createMediaStreamSource(j).connect(ne),Pl.current=K,Ol.current=ne,console.log("[VOICE] recognition.start() called",Date.now()),jr.current?.start(),y("voice_listening"),re(0)}catch(j){console.error("Microphone permission denied:",j),_("Microphone permission denied."),y("error"),on(),Jn()}},[]),Hs=(0,B.useCallback)(async()=>{oe("RECORDING","finish requested"),Qa.current=!0,typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),HR(),jr.current?.stop();let q=Kr.current;if(!q){y("idle");return}let K=Rt.current.find(ne=>ne.id===q);if(console.log("[VOICE] finishListening transcript:",K?.transcript),!K||!K.transcript||K.transcript.trim().length<5){console.warn("[VOICE] transcript too short, skipping pipeline"),y("idle");return}if(e){if(On.current){let ce=Xt.current,Be=Wa.current??void 0,de=`pending-${Date.now()}`;ce&&Ev(ce,{id:de,x:0,y:0,element:Be,title:"Saving feedback\u2026"},{getSessionPaused:()=>Gr.current,onMarkerClick:ve=>{qt(ve.id),S(ve.id)}}),Zt(null),en(!0),T(ve=>ve.filter(Sn=>Sn.id!==q)),C(null),y("idle"),Wa.current=null,console.log("[VOICE] final transcript sent to pipeline:",K.transcript);try{it.current=!0,a(K.transcript,K.screenshot,{onSuccess:ve=>{it.current=!1,en(!1),ce&&Tv(de,{id:ve.id,title:ve.title}),w(Sn=>[{id:ve.id,title:ve.title,description:ve.description,type:ve.type},...Sn]),qt(ve.id),setTimeout(()=>qt(null),1200)},onError:()=>{it.current=!1,en(!1),ce&&ed(de),_("AI processing failed.")}},K.context??void 0,{sessionMode:!0})}catch(ve){it.current=!1,en(!1),ce&&ed(de),console.error(ve),_("AI processing failed.")}return}y("processing"),console.log("[VOICE] final transcript sent to pipeline:",K.transcript),it.current=!0,a(K.transcript,K.screenshot,{onSuccess:ce=>{it.current=!1,w(Be=>[{id:ce.id,title:ce.title,description:ce.description,type:ce.type},...Be]),T(Be=>Be.filter(de=>de.id!==q)),C(null),qt(ce.id),setTimeout(()=>qt(null),1200),ft(!0),setTimeout(()=>ft(!1),200),Us(!0),setTimeout(()=>{on(),Jn(),Us(!1)},120)},onError:()=>{it.current=!1,_("AI processing failed."),y("voice_listening")}},K.context??void 0);return}y("processing"),console.log("[VOICE] final transcript sent to pipeline:",K.transcript);try{let ne=await a(K.transcript,K.screenshot);if(!ne){y("idle"),on(),Jn();return}w(ce=>[{id:ne.id,title:ne.title,description:ne.description,type:ne.type},...ce]),T(ce=>ce.filter(Be=>Be.id!==q)),C(null),qt(ne.id),setTimeout(()=>qt(null),1200),ft(!0),setTimeout(()=>ft(!1),200),Us(!0),setTimeout(()=>{on(),Jn(),Us(!1)},120)}catch(ne){console.error(ne),_("AI processing failed."),y("voice_listening")}},[a,e,on,Jn]),Gs=(0,B.useCallback)(()=>{oe("RECORDING","discard"),jr.current?.stop();let q=Kr.current;T(j=>j.filter(K=>K.id!==q)),C(null),y("cancelled"),on(),Jn()},[on,Jn]);(0,B.useEffect)(()=>{if(!kl)return;let q=j=>{j.key==="Escape"&&(j.preventDefault(),Xp.includes(da.current)&&Gs())};return document.addEventListener("keydown",q),()=>document.removeEventListener("keydown",q)},[kl,Gs]);let Fi=(0,B.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),Wr=(0,B.useCallback)(()=>{w([]),T([]),C(null),y("idle"),S(null),Z(null),G(!1)},[]);(0,B.useEffect)(()=>{if(e)return;let q=j=>{let K=j.target;Ya.current&&K&&!Ya.current.contains(K)&&G(!1)};return document.addEventListener("mousedown",q),()=>document.removeEventListener("mousedown",q)},[e]);let ga=(0,B.useCallback)(async q=>{try{await r(q),w(j=>j.filter(K=>K.id!==q))}catch(j){console.error("Delete failed:",j)}},[r]),Bi=(0,B.useCallback)(q=>{Z(q.id),O(q.title),V(q.description)},[]),dd=(0,B.useCallback)(async q=>{let j=se.trim()||se,K=P;w(ne=>ne.map(ce=>ce.id===q?{...ce,title:j||ce.title,description:K}:ce)),Z(null);try{let ne=await zR(`/api/tickets/${q}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:j||se,description:K})}),ce=await ne.json();if(ne.ok&&ce.success&&ce.ticket){let Be=ce.ticket;w(de=>de.map(ve=>ve.id===q?{...ve,title:Be.title,description:Be.description,type:Be.type??ve.type}:ve))}}catch(ne){console.error("Save edit failed:",ne)}},[se,P]),ya=(0,B.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?yF(()=>new Promise((q,j)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},K=>{!K||!K.success?j(new Error("Capture failed")):q(K.screenshot??null)})})):Promise.resolve(null),[]),Ul=(0,B.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return ya();let{captureScreenshot:q}=await Promise.resolve().then(()=>(lk(),ok));return q()},[ya]),Fl=(0,B.useCallback)(()=>{y("region_selecting")},[]),qi=(0,B.useCallback)((q,j)=>{let K=bv(),ne={id:K,screenshot:q,transcript:"",structuredOutput:null,context:j??null,createdAt:Date.now()};T(ce=>[...ce,ne]),C(K),ma()},[ma]),Za=(0,B.useCallback)(()=>{y("cancelled"),on(),Jn()},[on,Jn]),Bl=(0,B.useCallback)(q=>{let j=Kr.current;j&&T(K=>K.map(ne=>ne.id===j?{...ne,transcript:q}:ne))},[]),ql=(0,B.useCallback)(async()=>{if(!(da.current!=="idle"||On.current||f)){if(oe("SESSION","start"),console.log("[Echly] Start New Feedback Session clicked"),Ns("start"),e&&u&&c){let q=await u();if(!q?.id)return;c(q.id),w([]),m?.()}Zt(null),en(!1),Yn(!1),Qn(!1)}},[e,u,c,m,f]),zl=(0,B.useCallback)(()=>{if(!On.current&&!f||Gr.current||Ka||Hr)return;oe("SESSION","pause requested");let q=()=>{oe("SESSION","pause finalized"),Ja("pause"),Ns("pause"),v?.(),Yn(!1)};if(it.current){Ja("pause"),Yn(!0);let j=()=>{if(it.current){Bs.current=window.setTimeout(j,uk);return}q()};j();return}q()},[Ja,Hr,f,v,Ka]),fd=(0,B.useCallback)(()=>{!On.current&&!f||(oe("SESSION","resume"),Yn(!1),Qn(!1),Ns("resume"),R?.())},[f,R]),Zn=(0,B.useCallback)(q=>{if(!On.current&&!f||Hr)return;oe("SESSION","end requested");let j=()=>{oe("SESSION","end finalized"),Ja("end"),Ns("end"),Yn(!1),Qn(!1),Zt(null),en(!1),D?.(),q?.()};if(it.current){Ja("end"),Qn(!0);let K=()=>{if(it.current){qs.current=window.setTimeout(K,uk);return}j()};K();return}j()},[Ja,Hr,f,D]);(0,B.useEffect)(()=>{!e||f===void 0||(oe("SESSION","global sync",{active:f,paused:p}),f===!0&&(Dl(!0),Fs(p??!1),Zt(null),Qn(!1),Xt.current||pa()),p===!0&&(Fs(!0),Yn(!1)),f===!1&&(Dl(!1),Fs(!1),Yn(!1),Qn(!1),Zt(null),en(!1),ik(),on()))},[e,f,p,pa,on]),(0,B.useEffect)(()=>{e&&f&&p!==void 0&&(Fs(p),p&&Yn(!1))},[e,f,p]),(0,B.useEffect)(()=>{if(!e||f!==!0)return;let q=()=>{document.hidden||!f||Xt.current||(Dl(!0),Fs(p??!1),Zt(null),Qn(!1),pa())};return document.addEventListener("visibilitychange",q),()=>document.removeEventListener("visibilitychange",q)},[e,f,p,pa]),(0,B.useEffect)(()=>{!e||!i?.sessionId||(w(i.pointers??[]),Zt(null),l?.())},[e,i,l]);let _n=(0,B.useCallback)(async q=>{if(ca&&!Xt.current){Zt(null);return}if(!ya||ca!=null)return;Ns("element clicked"),Hp();let j=null;try{j=await ya()}catch{return}if(!j)return;let K;try{K=await tk(j,q)}catch{return}let ne=zp(window,q);Wa.current=q instanceof HTMLElement?q:null,Zt({screenshot:K,context:ne})},[ya,ca]),Xr=(0,B.useCallback)(q=>{let j=ca;if(!j||!q||q.trim().length===0){Zt(null);return}let K=Xt.current,ne=Wa.current??void 0,ce=`pending-${Date.now()}`;K&&Ev(K,{id:ce,x:0,y:0,element:ne??void 0,title:"Saving feedback\u2026"},{getSessionPaused:()=>Gr.current,onMarkerClick:de=>{qt(de.id),S(de.id)}}),Zt(null),en(!0),y("idle"),Wa.current=null,console.log("[VOICE] final transcript sent to pipeline:",q);try{it.current=!0,a(q,j.screenshot,{onSuccess:de=>{it.current=!1,en(!1),K&&Tv(ce,{id:de.id,title:de.title}),w(ve=>[{id:de.id,title:de.title,description:de.description,type:de.type},...ve]),qt(de.id),setTimeout(()=>qt(null),1200)},onError:()=>{it.current=!1,en(!1),K&&ed(ce),_("AI processing failed.")}},j.context??void 0,{sessionMode:!0})}catch(de){it.current=!1,en(!1),K&&ed(ce),console.error(de),_("AI processing failed.")}},[ca,a]),Yr=(0,B.useCallback)(()=>{Zt(null),en(!1)},[]),zi=(0,B.useCallback)(()=>{let q=ca;if(!q)return;let j=bv(),K={id:j,screenshot:q.screenshot,transcript:"",structuredOutput:null,context:q.context??null,createdAt:Date.now()};T(ne=>[...ne,K]),C(j),ma()},[ca,ma]),Ve=(0,B.useCallback)(async()=>{if(da.current==="idle"&&(_(null),jr.current?.stop(),sn(L),U(!1),pa(),y("focus_mode"),!e))try{let q=await Ul();if(!q){Za();return}let j=bv(),K={id:j,screenshot:q,transcript:"",structuredOutput:null,createdAt:Date.now()};T(ne=>[...ne,K]),C(j),ma()}catch(q){console.error(q),_("Screen capture failed."),y("error"),Za()}},[e,L,Ul,ma,pa,Za]),Hi=(0,B.useMemo)(()=>({setIsOpen:Nl,toggleOpen:Vl,startDrag:Ui,handleShare:Fi,setShowMenu:G,resetSession:Wr,startListening:ma,finishListening:Hs,discardListening:Gs,deletePointer:ga,startEditing:Bi,saveEdit:dd,setExpandedId:S,setEditedTitle:O,setEditedDescription:V,handleAddFeedback:Ve,handleRegionCaptured:qi,handleRegionSelectStart:Fl,handleCancelCapture:Za,getFullTabImage:ya,setActiveRecordingTranscript:Bl,startSession:ql,pauseSession:zl,resumeSession:fd,endSession:Zn,handleSessionElementClicked:_n,handleSessionFeedbackSubmit:Xr,handleSessionFeedbackCancel:Yr,handleSessionStartVoice:zi}),[Nl,Vl,Ui,Fi,Wr,ma,Hs,Gs,ga,Bi,dd,S,O,V,Ve,qi,Fl,Za,ya,Bl,ql,zl,fd,Zn,_n,Xr,Yr,zi]),er=(0,B.useMemo)(()=>E?x.find(q=>q.id===E):null,[E,x]),js=(0,B.useMemo)(()=>N!=="voice_listening"?"neutral":gF(er?.transcript??""),[N,er?.transcript]),nm=er?.transcript?.trim()??"";return{state:{isOpen:L,state:N,errorMessage:g,pointers:b,expandedId:A,editingId:$,editedTitle:se,editedDescription:P,showMenu:Q,position:te,liveTranscript:nm,listeningAudioLevel:be,listeningSentiment:js,highlightTicketId:qr,pillExiting:ua,orbSuccess:xt,sessionMode:zr,sessionPaused:Vi,pausePending:Ka,endPending:Hr,sessionFeedbackPending:ca},handlers:Hi,refs:{widgetRef:Xa,menuRef:Ya,captureRootRef:Xt},captureRootReady:kl,captureRootEl:Mi}}var Qp=Ee(En());var Yp=(...t)=>t.filter((e,n,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===n).join(" ").trim();var dk=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var fk=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,a)=>a?a.toUpperCase():n.toLowerCase());var wv=t=>{let e=fk(t);return e.charAt(0).toUpperCase()+e.slice(1)};var td=Ee(En());var hk={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var pk=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var mk=(0,td.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:r="",children:s,iconNode:i,...l},u)=>(0,td.createElement)("svg",{ref:u,...hk,width:e,height:e,stroke:t,strokeWidth:a?Number(n)*24/Number(e):n,className:Yp("lucide",r),...!s&&!pk(l)&&{"aria-hidden":"true"},...l},[...i.map(([c,f])=>(0,td.createElement)(c,f)),...Array.isArray(s)?s:[s]]));var Ha=(t,e)=>{let n=(0,Qp.forwardRef)(({className:a,...r},s)=>(0,Qp.createElement)(mk,{ref:s,iconNode:e,className:Yp(`lucide-${dk(wv(t))}`,`lucide-${t}`,a),...r}));return n.displayName=wv(t),n};var IF=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],nd=Ha("check",IF);var _F=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],ad=Ha("expand",_F);var SF=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],rd=Ha("pencil",SF);var vF=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],sd=Ha("trash-2",vF);var EF=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],id=Ha("x",EF);var Jt=Ee(et()),TF=()=>(0,Jt.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,Jt.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,Jt.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),bF=()=>(0,Jt.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,Jt.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function Cv({onClose:t,summary:e=null,theme:n="dark",onThemeToggle:a}){return(0,Jt.jsxs)("div",{className:"echly-sidebar-header",children:[(0,Jt.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,Jt.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,Jt.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),a&&(0,Jt.jsx)("button",{type:"button",id:"theme-toggle",onClick:a,className:"echly-theme-toggle","aria-label":n==="dark"?"Switch to light mode":"Switch to dark mode",children:n==="dark"?(0,Jt.jsx)(TF,{}):(0,Jt.jsx)(bF,{})}),(0,Jt.jsx)("button",{type:"button",onClick:t,className:"echly-sidebar-close","aria-label":"Close",children:(0,Jt.jsx)(id,{size:16,strokeWidth:1.5})})]})}var Ur=Ee(En());var tt=Ee(et());function wF(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function CF({item:t,expandedId:e,editingId:n,editedTitle:a,editedDescription:r,onExpand:s,onStartEdit:i,onSaveEdit:l,onDelete:u,onEditedTitleChange:c,onEditedDescriptionChange:f,highlightTicketId:p=null}){let m=e===t.id,v=n===t.id,R=p===t.id,D=wF(t.type),[x,T]=(0,Ur.useState)(!1),E=(0,Ur.useCallback)(()=>{s(m?null:t.id)},[m,t.id,s]),C=(0,Ur.useCallback)(()=>{i(t)},[t,i]),L=(0,Ur.useCallback)(()=>{l(t.id),T(!0),setTimeout(()=>T(!1),220)},[t.id,l]),U=(0,Ur.useCallback)(()=>{u(t.id)},[t.id,u]);return(0,tt.jsxs)("div",{className:`echly-feedback-item ${R?"echly-ticket-highlight":""}`,"data-priority":D,children:[(0,tt.jsx)("span",{className:"echly-priority-dot","aria-hidden":!0}),(0,tt.jsxs)("div",{className:"echly-feedback-item-inner",children:[(0,tt.jsx)("div",{className:"echly-feedback-item-content",children:v?(0,tt.jsxs)(tt.Fragment,{children:[(0,tt.jsx)("input",{value:a,onChange:N=>c(N.target.value),className:"echly-widget-input echly-feedback-item-input"}),(0,tt.jsx)("textarea",{value:r,onChange:N=>f(N.target.value),rows:3,className:"echly-widget-input echly-feedback-item-textarea"})]}):(0,tt.jsx)(tt.Fragment,{children:(0,tt.jsx)("h3",{className:"echly-widget-item-title",children:t.title})})}),(0,tt.jsxs)("div",{className:"echly-feedback-item-actions",children:[(0,tt.jsx)("button",{type:"button",onClick:E,className:"echly-widget-action-icon","aria-label":m?"Collapse":"Expand",children:(0,tt.jsx)(ad,{size:16,strokeWidth:1.5})}),v?(0,tt.jsx)("button",{type:"button",onClick:L,className:`echly-widget-action-icon echly-widget-action-icon--confirm ${x?"echly-widget-action-icon--confirm-success":""}`,"aria-label":"Save",children:(0,tt.jsx)(nd,{size:16,strokeWidth:1.5})}):(0,tt.jsx)("button",{type:"button",onClick:C,className:"echly-widget-action-icon","aria-label":"Edit",children:(0,tt.jsx)(rd,{size:16,strokeWidth:1.5})}),(0,tt.jsx)("button",{type:"button",onClick:U,className:"echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,tt.jsx)(sd,{size:16,strokeWidth:1.5})})]})]})]})}var gk=Ur.default.memo(CF,(t,e)=>t.item===e.item&&t.expandedId===e.expandedId&&t.editingId===e.editingId&&t.editedTitle===e.editedTitle&&t.editedDescription===e.editedDescription&&t.highlightTicketId===e.highlightTicketId);var Fr=Ee(et());function Lv({isIdle:t,onAddFeedback:e,extensionMode:n=!1,onStartSession:a,onResumeSession:r,onOpenPreviousSession:s,hasActiveSession:i=!1,captureDisabled:l=!1}){let u=!t||l,c=u||!i||!r,f=!!(r||s);return n?(0,Fr.jsxs)("div",{className:"echly-add-insight-wrap",children:[(0,Fr.jsx)("button",{type:"button",onClick:u?void 0:a,disabled:u,className:`echly-add-insight-btn ${u?"echly-add-insight-btn--disabled":""}`,"aria-label":"Start New Feedback Session",children:"Start New Feedback Session"}),f&&(0,Fr.jsxs)("div",{style:{display:"flex",gap:8,marginTop:8},children:[(0,Fr.jsx)("button",{type:"button",onClick:c?void 0:r,disabled:c,className:`echly-add-insight-btn echly-add-insight-btn--secondary ${c?"echly-add-insight-btn--disabled":""}`,"aria-label":"Resume Session",style:{flex:1,minWidth:0,background:"rgba(37, 99, 235, 0.15)",color:"#2563eb",border:"1px solid rgba(37, 99, 235, 0.4)"},children:"Resume Session"}),(0,Fr.jsx)("button",{type:"button",onClick:u?void 0:s,disabled:u,className:`echly-add-insight-btn echly-add-insight-btn--secondary ${u?"echly-add-insight-btn--disabled":""}`,"aria-label":"Open Previous Session",style:{flex:1,minWidth:0,background:"rgba(255,255,255,0.08)",color:"#2563eb",border:"1px solid rgba(255,255,255,0.16)"},children:"Open Previous Session"})]})]}):(0,Fr.jsx)("div",{className:"echly-add-insight-wrap",children:(0,Fr.jsx)("button",{type:"button",onClick:u?void 0:e,disabled:u,className:`echly-add-insight-btn ${u?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var Ak=Ee(Cd());var Vs=Ee(En()),Ck=Ee(Cd());var yk={outline:"2px solid #2563eb",background:"rgba(37,99,235,0.1)"},vt=null,od=null,$p=null;function LF(t,e){if(typeof document.elementsFromPoint!="function")return document.elementFromPoint(t,e);let n=document.elementsFromPoint(t,e);for(let a of n)if(Gp(a))return a;return null}function Ik(t){if(vt){if(!t||t.width===0||t.height===0){vt.style.display="none";return}vt.style.display="block",vt.style.left=`${t.left}px`,vt.style.top=`${t.top}px`,vt.style.width=`${t.width}px`,vt.style.height=`${t.height}px`}}function AF(t,e){if(!e()){vt&&(vt.style.display="none"),$p=null;return}let n=LF(t.clientX,t.clientY);if(n!==$p){if($p=n,!n){Ik(null);return}let a=n.getBoundingClientRect();Ik(a)}}function _k(t,e){return vt&&vt.parentNode&&Jp(),vt=document.createElement("div"),vt.setAttribute("aria-hidden","true"),vt.setAttribute("data-echly-ui","true"),vt.style.cssText=["position:fixed","pointer-events:none","z-index:2147483646","box-sizing:border-box","border-radius:4px",`outline:${yk.outline}`,`background:${yk.background}`,"display:none"].join(";"),t.appendChild(vt),od=n=>AF(n,e.getActive),document.addEventListener("mousemove",od,{passive:!0}),()=>Jp()}function Jp(){od&&(document.removeEventListener("mousemove",od),od=null),$p=null,vt?.parentNode&&vt.parentNode.removeChild(vt),vt=null}var Pi=null,Av=()=>!1,xv=()=>{};function xF(t){if(t.button!==0||!Av())return;let e=t.target;!e||!Gp(e)||(t.preventDefault(),t.stopPropagation(),Ns("element clicked"),xv(e))}function Sk(t,e){return Av=e.enabled,xv=e.onElementClicked,Pi&&document.removeEventListener("click",Pi,!0),Pi=xF,document.addEventListener("click",Pi,!0),()=>Rv()}function Rv(){Pi&&(document.removeEventListener("click",Pi,!0),Pi=null),Av=()=>!1,xv=()=>{}}var Bt=Ee(et());function vk(){return(0,Bt.jsxs)(Bt.Fragment,{children:[(0,Bt.jsx)("style",{children:`
        @keyframes echly-inline-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}),(0,Bt.jsx)("span",{"aria-hidden":!0,style:{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.28)",borderTopColor:"rgba(255,255,255,0.92)",opacity:.8,animation:"echly-inline-spin 0.8s linear infinite",flexShrink:0}})]})}function Ek({sessionPaused:t,pausePending:e=!1,endPending:n=!1,onPause:a,onResume:r,onEnd:s}){return(0,Bt.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.3)",zIndex:2147483647,border:"1px solid rgba(255,255,255,0.08)"},children:[(0,Bt.jsx)("span",{style:{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"},children:t?"Session paused":"Recording Session"}),e?(0,Bt.jsxs)("button",{type:"button",disabled:!0,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.92)",fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:6,opacity:.9,cursor:"default"},children:[(0,Bt.jsx)(vk,{}),(0,Bt.jsx)("span",{children:"Pausing\u2026"})]}):t?(0,Bt.jsx)("button",{type:"button",onClick:r,disabled:e,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg, #2563eb, #1d4ed8)",color:"#fff",fontSize:13,fontWeight:500,cursor:e?"default":"pointer",opacity:e?.7:1},children:"Resume Feedback Session"}):(0,Bt.jsx)("button",{type:"button",onClick:a,disabled:n,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:n?"default":"pointer",opacity:n?.7:1},children:"Pause"}),n?(0,Bt.jsxs)("button",{type:"button",disabled:!0,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"rgba(239,68,68,0.9)",color:"#fff",fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:6,opacity:.9,cursor:"default"},children:[(0,Bt.jsx)(vk,{}),(0,Bt.jsx)("span",{children:"Ending\u2026"})]}):(0,Bt.jsx)("button",{type:"button",onClick:s,disabled:e,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"rgba(239,68,68,0.9)",color:"#fff",fontSize:13,fontWeight:500,cursor:e?"default":"pointer",opacity:e?.7:1},children:"End"})]})}var kv=Ee(En()),At=Ee(et());function Tk({screenshot:t,isVoiceListening:e,onRecordVoice:n,onDoneVoice:a,onSaveText:r,onCancel:s}){let[i,l]=(0,kv.useState)("choose"),[u,c]=(0,kv.useState)("");return(0,At.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"min(380px, 92vw)",borderRadius:16,background:"rgba(20,22,28,0.98)",backdropFilter:"blur(16px)",boxShadow:"0 24px 48px rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",zIndex:2147483647,overflow:"hidden",display:"flex",flexDirection:"column"},children:[(0,At.jsxs)("div",{style:{padding:16,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,At.jsx)("div",{style:{borderRadius:8,overflow:"hidden",background:"#111",aspectRatio:"16/10",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,At.jsx)("img",{src:t,alt:"Capture",style:{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}})}),(0,At.jsx)("p",{style:{margin:"12px 0 0",fontSize:13,color:"rgba(255,255,255,0.7)"},children:"Speak or type feedback"})]}),(0,At.jsxs)("div",{style:{padding:16,display:"flex",flexDirection:"column",gap:10},children:[i==="choose"&&(0,At.jsxs)(At.Fragment,{children:[(0,At.jsx)("button",{type:"button",onClick:()=>{l("voice"),n()},style:{padding:"12px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg, #2563eb, #1d4ed8)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"},children:"Describe the change"}),(0,At.jsx)("button",{type:"button",onClick:()=>{l("text")},style:{padding:"12px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.9)",fontSize:14,fontWeight:500,cursor:"pointer"},children:"Type feedback"})]}),i==="voice"&&(0,At.jsx)("button",{type:"button",onClick:a,disabled:!e,style:{padding:"12px 16px",borderRadius:10,border:"none",background:e?"linear-gradient(135deg, #2563eb, #1d4ed8)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:14,fontWeight:600,cursor:e?"pointer":"default"},children:e?"Save feedback":"Saving feedback\u2026"}),i==="text"&&(0,At.jsxs)(At.Fragment,{children:[(0,At.jsx)("textarea",{value:u,onChange:v=>c(v.target.value),placeholder:"Describe feedback","aria-label":"Feedback text",rows:3,style:{width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.95)",fontSize:14,resize:"vertical",minHeight:80}}),(0,At.jsx)("button",{type:"button",onClick:()=>{let v=u.trim();v&&r(v)},disabled:!u.trim(),style:{padding:"12px 16px",borderRadius:10,border:"none",background:u.trim()?"linear-gradient(135deg, #2563eb, #1d4ed8)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:14,fontWeight:600,cursor:u.trim()?"pointer":"default"},children:"Save feedback"})]}),s&&i==="choose"&&(0,At.jsx)("button",{type:"button",onClick:s,style:{padding:"8px 12px",border:"none",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:13,cursor:"pointer",alignSelf:"flex-start"},children:"Discard"})]})]})}var Br=Ee(et()),bk=12;function RF(){let t=['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">','<path fill="white" stroke="black" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',"</svg>"].join("");return`url("data:image/svg+xml;utf8,${encodeURIComponent(t)}") 6 6, auto`}var wk=RF();function Lk({captureRoot:t,sessionMode:e,sessionPaused:n,pausePending:a=!1,endPending:r=!1,sessionFeedbackPending:s,state:i,onElementClicked:l,onPause:u,onResume:c,onEnd:f,onRecordVoice:p,onDoneVoice:m,onSaveText:v,onCancel:R}){let D=(0,Vs.useRef)([]),[x,T]=(0,Vs.useState)(null),E=a||r,C=e&&!n&&!E,L=e&&!n&&!E&&s==null;if((0,Vs.useEffect)(()=>{if(!e||!t)return;let N=()=>e&&!n&&!E&&s==null;return D.current.push(_k(t,{getActive:N})),D.current.push(Sk(t,{enabled:N,onElementClicked:l})),()=>{D.current.forEach(y=>y()),D.current=[],Jp(),Rv()}},[e,t,n,E,s,l]),(0,Vs.useEffect)(()=>{if(!t?.isConnected)return;let N=document.body.style.cursor;return document.body.style.cursor=C?wk:"",()=>{document.body.style.cursor=N}},[C,t]),(0,Vs.useEffect)(()=>{if(!L){T(null);return}let N=y=>{T({x:y.clientX+bk,y:y.clientY+bk})};return window.addEventListener("mousemove",N,{passive:!0}),()=>window.removeEventListener("mousemove",N)},[L]),!e||!t)return null;let U=(0,Br.jsxs)(Br.Fragment,{children:[(0,Br.jsx)("div",{"aria-hidden":!0,className:"echly-session-overlay-cursor",style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:2147483645,cursor:C?wk:"default"}}),(0,Br.jsx)(Ek,{sessionPaused:n,pausePending:a,endPending:r,onPause:u,onResume:c,onEnd:f}),L&&x!=null&&(0,Br.jsx)("div",{"aria-hidden":!0,className:"echly-capture-tooltip",style:{position:"fixed",left:x.x,top:x.y,pointerEvents:"none",zIndex:2147483646,padding:"6px 10px",fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.95)",background:"rgba(0,0,0,0.75)",borderRadius:6,whiteSpace:"nowrap",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"},children:"Click to add feedback"}),s&&(0,Br.jsx)(Tk,{screenshot:s.screenshot,isVoiceListening:i==="voice_listening",onRecordVoice:p,onDoneVoice:m,onSaveText:v,onCancel:R})]});return(0,Ck.createPortal)(U,t)}var Ga=Ee(et());function xk({captureRoot:t,extensionMode:e,state:n,getFullTabImage:a,onRegionCaptured:r,onRegionSelectStart:s,onCancelCapture:i,sessionMode:l=!1,sessionPaused:u=!1,pausePending:c=!1,endPending:f=!1,sessionFeedbackPending:p=null,onSessionElementClicked:m,onSessionPause:v,onSessionResume:R,onSessionEnd:D,onSessionRecordVoice:x,onSessionDoneVoice:T,onSessionSaveText:E,onSessionFeedbackCancel:C=()=>{}}){let L=l&&e;return(0,Ga.jsx)(Ga.Fragment,{children:(0,Ak.createPortal)((0,Ga.jsxs)(Ga.Fragment,{children:[L&&m&&v&&R&&D&&x&&T&&E&&(0,Ga.jsx)(Lk,{captureRoot:t,sessionMode:l,sessionPaused:u,pausePending:c,endPending:f,sessionFeedbackPending:p??null,state:n,onElementClicked:m,onPause:v,onResume:R,onEnd:D,onRecordVoice:x,onDoneVoice:T,onSaveText:E,onCancel:C}),!L&&(n==="focus_mode"||n==="region_selecting")&&(0,Ga.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.04)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),!L&&e&&(n==="focus_mode"||n==="region_selecting")&&(0,Ga.jsx)(ZR,{getFullTabImage:a,onAddVoice:r,onCancel:i,onSelectionStart:s})]}),t)})}var ja=Ee(En()),Et=Ee(et());function kF(t,e){if(e==="all")return t;let n=Date.now(),a={today:24*60*60*1e3,"7days":7*24*60*60*1e3,"30days":30*24*60*60*1e3},r=n-a[e];return t.filter(s=>(s.updatedAt?new Date(s.updatedAt).getTime():0)>=r)}function DF(t){if(!t)return"\u2014";let e=new Date(t),a=new Date().getTime()-e.getTime(),r=Math.floor(a/6e4);if(r<1)return"Just now";if(r<60)return`${r}m ago`;let s=Math.floor(r/60);if(s<24)return`${s}h ago`;let i=Math.floor(s/24);return i<7?`${i}d ago`:e.toLocaleDateString()}function Rk({open:t,onClose:e,fetchSessions:n,onSelectSession:a}){let[r,s]=(0,ja.useState)([]),[i,l]=(0,ja.useState)(!1),[u,c]=(0,ja.useState)(null),[f,p]=(0,ja.useState)(""),[m,v]=(0,ja.useState)("all");(0,ja.useEffect)(()=>{t&&(p(""),v("all"),c(null),l(!0),n().then(x=>{console.log("[Echly] Sessions returned:",x),s(x)}).catch(x=>c(x instanceof Error?x.message:"Failed to load sessions")).finally(()=>l(!1)))},[t,n]);let R=(0,ja.useMemo)(()=>{let x=kF(r,m);if(f.trim()){let T=f.trim().toLowerCase();x=x.filter(E=>(E.title??"").toLowerCase().includes(T)||(E.id??"").toLowerCase().includes(T))}return x},[r,m,f]),D=x=>{if(typeof x.feedbackCount=="number")return x.feedbackCount;let T=typeof x.openCount=="number"?x.openCount:0,E=typeof x.resolvedCount=="number"?x.resolvedCount:0,C=typeof x.skippedCount=="number"?x.skippedCount:0;return T+E+C};return t?(0,Et.jsx)("div",{"data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:24},onClick:x=>x.target===x.currentTarget&&e(),role:"dialog","aria-modal":"true","aria-labelledby":"resume-session-modal-title",children:(0,Et.jsxs)("div",{style:{width:"min(420px, 100%)",maxHeight:"85vh",borderRadius:16,background:"rgba(20,22,28,0.98)",backdropFilter:"blur(16px)",boxShadow:"0 24px 48px rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",overflow:"hidden",display:"flex",flexDirection:"column"},onClick:x=>x.stopPropagation(),children:[(0,Et.jsxs)("div",{style:{padding:16,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,Et.jsx)("h2",{id:"resume-session-modal-title",style:{margin:"0 0 12px",fontSize:18,fontWeight:600,color:"rgba(255,255,255,0.95)"},children:"Resume Feedback Session"}),(0,Et.jsx)("input",{type:"search",placeholder:"Search sessions",value:f,onChange:x=>p(x.target.value),"aria-label":"Search sessions",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.95)",fontSize:14}}),(0,Et.jsx)("div",{style:{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"},children:["today","7days","30days","all"].map(x=>(0,Et.jsx)("button",{type:"button",onClick:()=>v(x),style:{padding:"6px 10px",borderRadius:6,border:"none",background:m===x?"rgba(37, 99, 235, 0.4)":"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:500,cursor:"pointer"},children:x==="today"?"Today":x==="7days"?"Last 7 days":x==="30days"?"Last 30 days":"All sessions"},x))})]}),(0,Et.jsxs)("div",{style:{flex:1,overflow:"auto",minHeight:200,maxHeight:360},children:[i&&(0,Et.jsx)("div",{style:{padding:24,textAlign:"center",color:"rgba(255,255,255,0.6)"},children:"Loading sessions\u2026"}),u&&(0,Et.jsx)("div",{style:{padding:24,color:"#ef4444",fontSize:14},children:u}),!i&&!u&&R.length===0&&(0,Et.jsx)("div",{style:{padding:24,textAlign:"center",color:"rgba(255,255,255,0.6)"},children:"No sessions match."}),!i&&!u&&R.length>0&&(0,Et.jsx)("ul",{style:{listStyle:"none",margin:0,padding:8},children:R.map(x=>(0,Et.jsx)("li",{children:(0,Et.jsxs)("button",{type:"button",onClick:()=>{a(x.id),e()},style:{width:"100%",textAlign:"left",padding:"12px 14px",borderRadius:10,border:"none",background:"transparent",color:"rgba(255,255,255,0.9)",fontSize:14,cursor:"pointer",marginBottom:4},onMouseEnter:T=>{T.currentTarget.style.background="rgba(255,255,255,0.08)"},onMouseLeave:T=>{T.currentTarget.style.background="transparent"},children:[(0,Et.jsx)("div",{style:{fontWeight:600},children:x.title?.trim()||"Untitled Session"}),(0,Et.jsxs)("div",{style:{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4},children:[D(x)," feedback items \xB7 ",DF(x.updatedAt)]})]})},x.id))})]}),(0,Et.jsx)("div",{style:{padding:12,borderTop:"1px solid rgba(255,255,255,0.08)"},children:(0,Et.jsx)("button",{type:"button",onClick:e,style:{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.8)",fontSize:13,cursor:"pointer"},children:"Cancel"})})]})}):null}var Tt=Ee(et()),PF=["focus_mode","region_selecting","voice_listening","processing"];function Zp({sessionId:t,userId:e,extensionMode:n=!1,initialPointers:a,onComplete:r,onDelete:s,widgetToggleRef:i,onRecordingChange:l,expanded:u,onExpandRequest:c,onCollapseRequest:f,captureDisabled:p=!1,theme:m="dark",onThemeToggle:v,fetchSessions:R,onResumeSessionSelect:D,loadSessionWithPointers:x,onSessionLoaded:T,onSessionEnd:E,onCreateSession:C,onActiveSessionChange:L,globalSessionModeActive:U,globalSessionPaused:N,onSessionModeStart:y,onSessionModePause:g,onSessionModeResume:_,onSessionModeEnd:b}){let[w,A]=(0,la.useState)(!1),{state:S,handlers:$,refs:Z,captureRootEl:se}=ck({sessionId:t,userId:e,extensionMode:n,initialPointers:a,onComplete:r,onDelete:s,onRecordingChange:l,loadSessionWithPointers:x,onSessionLoaded:T,onCreateSession:C,onActiveSessionChange:L,globalSessionModeActive:U,globalSessionPaused:N,onSessionModeStart:y,onSessionModePause:g,onSessionModeResume:_,onSessionModeEnd:b}),P=u!==void 0?u:S.isOpen,V=(0,la.useRef)(null),Q=PF.includes(S.state)||S.pillExiting,G=!!t,te=!Q&&!S.sessionMode,Se=S.sessionMode&&S.sessionPaused,ue=!P&&te&&!Se,X=P&&te||Se,me=(0,la.useRef)(!1);(0,la.useEffect)(()=>{if(!Q){me.current=!1;return}me.current||(me.current=!0,f?.())},[Q,f]);let Ne=S.pointers.length,be=S.pointers.filter(sn=>/critical|bug|high|urgent/i.test(sn.type||"")).length,re=Ne>0?be>0?`${Ne} insights \u2022 ${be} need attention`:`${Ne} insights`:null;(0,la.useEffect)(()=>{S.highlightTicketId&&V.current&&V.current.scrollTo({top:0,behavior:"smooth"})},[S.highlightTicketId]),la.default.useEffect(()=>{if(i)return i.current=$.toggleOpen,()=>{i.current=null}},[$,i]);let Xe=la.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_ACTIVE_SESSION"},sn=>{let qr=sn?.sessionId;qr&&D?.(qr)})},[D]);return(0,Tt.jsxs)(Tt.Fragment,{children:[n&&R&&D&&(0,Tt.jsx)(Rk,{open:w,onClose:()=>A(!1),fetchSessions:R,onSelectSession:sn=>{D(sn),A(!1)}}),se&&(0,Tt.jsx)(xk,{captureRoot:se,extensionMode:n,state:S.state,getFullTabImage:$.getFullTabImage,onRegionCaptured:$.handleRegionCaptured,onRegionSelectStart:$.handleRegionSelectStart,onCancelCapture:$.handleCancelCapture,sessionMode:S.sessionMode,sessionPaused:S.sessionPaused,pausePending:S.pausePending,endPending:S.endPending,sessionFeedbackPending:S.sessionFeedbackPending,onSessionElementClicked:$.handleSessionElementClicked,onSessionPause:()=>{$.pauseSession(),c?.()},onSessionResume:()=>{$.resumeSession(),f?.()},onSessionEnd:()=>{$.endSession(()=>{E?.()})},onSessionRecordVoice:$.handleSessionStartVoice,onSessionDoneVoice:$.finishListening,onSessionSaveText:$.handleSessionFeedbackSubmit,onSessionFeedbackCancel:$.handleSessionFeedbackCancel}),ue&&(0,Tt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,Tt.jsx)("button",{type:"button",onClick:()=>c?c():$.setIsOpen(!0),className:"echly-floating-trigger",children:n?"Echly":"Capture feedback"})}),X&&(0,Tt.jsxs)(Tt.Fragment,{children:[!n&&(0,Tt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,Tt.jsx)("div",{ref:Z.widgetRef,className:"echly-sidebar-container",style:n?{position:"fixed",...S.position?{left:S.position.x,top:S.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,Tt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,Tt.jsx)(Cv,{onClose:()=>f?f():$.setIsOpen(!1),summary:re,theme:m,onThemeToggle:v}),(0,Tt.jsxs)("div",{ref:V,className:"echly-sidebar-body",children:[(0,Tt.jsx)("div",{className:"echly-feedback-list",children:S.pointers.map(sn=>(0,Tt.jsx)(gk,{item:sn,expandedId:S.expandedId,editingId:S.editingId,editedTitle:S.editedTitle,editedDescription:S.editedDescription,onExpand:$.setExpandedId,onStartEdit:$.startEditing,onSaveEdit:$.saveEdit,onDelete:$.deletePointer,onEditedTitleChange:$.setEditedTitle,onEditedDescriptionChange:$.setEditedDescription,highlightTicketId:S.highlightTicketId},sn.id))}),S.errorMessage&&(0,Tt.jsx)("div",{className:"echly-sidebar-error",children:S.errorMessage}),S.state==="idle"&&(0,Tt.jsx)(Lv,{isIdle:!0,onAddFeedback:$.handleAddFeedback,extensionMode:n,onStartSession:n?$.startSession:void 0,onResumeSession:n&&G?Xe:void 0,onOpenPreviousSession:n&&R&&D?()=>A(!0):void 0,hasActiveSession:G,captureDisabled:p})]})]})})]})]})}var nt=Ee(et()),OF="echly-root",Dv="echly-shadow-host",Dk="widget-theme",em=KC(),ld=WC({shadowHostId:Dv});function MF(){try{let t=localStorage.getItem(Dk);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function NF(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem(Dk,e)}catch{}}function VF(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function UF({widgetRoot:t,initialTheme:e}){let[n,a]=ke.default.useState(null),[r,s]=ke.default.useState(null),[i,l]=ke.default.useState(!1),[u,c]=ke.default.useState(e),[f,p]=ke.default.useState(ld.getInitialState()),[m,v]=ke.default.useState(null),[R,D]=ke.default.useState(null),x=m??f.sessionId,T=ke.default.useRef(null),E=ke.default.useRef(!1),C=ke.default.useRef(!1),L=ke.default.useRef(null),[U,N]=ke.default.useState(null),[y,g]=ke.default.useState(!1),[_,b]=ke.default.useState(!1),[w,A]=ke.default.useState(""),[S,$]=ke.default.useState(!1),Z=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";ke.default.useEffect(()=>{let X=()=>T.current?.();return window.addEventListener("ECHLY_TOGGLE_WIDGET",X),()=>window.removeEventListener("ECHLY_TOGGLE_WIDGET",X)},[]),ke.default.useEffect(()=>ld.subscribeGlobalState(p),[]),ke.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},X=>{X?.state&&(ld.setHostVisibility(X.state.visible??!1),p(X.state))})},[]),ke.default.useEffect(()=>{if(!f.sessionModeActive||!f.sessionId)return;let X=!1;return(async()=>{try{let me=await em.apiFetch(`/api/feedback?sessionId=${encodeURIComponent(f.sessionId)}&limit=50`);if(X)return;let re=((await me.json()).feedback??[]).map(Xe=>({id:Xe.id,title:Xe.title??"",description:Xe.description??"",type:Xe.type??"Feedback"}));if(X)return;D({sessionId:f.sessionId,pointers:re})}catch(me){X||(console.error("[Echly] Failed to load session feedback for markers:",me),D({sessionId:f.sessionId,pointers:[]}))}})(),()=>{X=!0}},[f.sessionModeActive,f.sessionId]),ke.default.useEffect(()=>{let X=()=>{let Ne=window.location.origin;if(!(Ne==="https://echly-web.vercel.app"||Ne==="http://localhost:3000"))return;let re=window.location.pathname.split("/").filter(Boolean);re[0]==="dashboard"&&re[1]&&chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:re[1]},()=>{})};X(),window.addEventListener("popstate",X);let me=setInterval(X,2e3);return()=>{window.removeEventListener("popstate",X),clearInterval(me)}},[]),ke.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},X=>{X?.authenticated&&X.user?.uid?a({uid:X.user.uid,name:X.user.name??null,email:X.user.email??null,photoURL:X.user.photoURL??null}):a(null),l(!0)})},[]),ke.default.useEffect(()=>{_&&L.current&&L.current.focus()},[_]);let se=ke.default.useMemo(()=>YC({apiFetch:em.apiFetch,setSessionIdOverride:v,setLoadSessionWithPointers:D}),[]),O=ke.default.useMemo(()=>QC({effectiveSessionId:x,user:n,apiFetch:em.apiFetch,getVisibleTextFromScreenshot:zL,uploadScreenshot:JC,generateFeedbackId:Yy,generateScreenshotId:$C,submissionLockRef:E,clarityAssistantSubmitLockRef:C,setExtensionClarityPending:N,setEditedTranscript:A,setIsEditingFeedback:b,setClarityAssistantSubmitting:$,setShowClarityAssistant:g}),[x,n]),P=ke.default.useCallback(X=>{X?chrome.runtime.sendMessage({type:"START_RECORDING"},me=>{chrome.runtime.lastError?s(chrome.runtime.lastError.message||"Failed to start recording"):me?.ok||s(me?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),V=ke.default.useCallback(()=>chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{}),[]),Q=ke.default.useCallback(()=>chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{}),[]),G=ke.default.useCallback(()=>{let X=u==="dark"?"light":"dark";c(X),NF(t,X)},[u,t]),te=ke.default.useCallback(async()=>{let X=await em.apiFetch("/api/sessions"),me=await X.json(),Ne=me.sessions??[];return console.log("[Echly] Sessions returned:",{ok:X.ok,status:X.status,success:me.success,count:Ne.length,sessions:Ne}),!X.ok||!me.success?[]:Ne},[]),Se=ke.default.useCallback(async X=>{},[]);if(!i)return null;if(!n)return(0,nt.jsx)("div",{style:{pointerEvents:"auto"},children:(0,nt.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:VF,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,nt.jsx)("img",{src:Z,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})});let ue=U;return(0,nt.jsxs)(nt.Fragment,{children:[y&&ue&&(0,nt.jsx)("div",{style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.15)",zIndex:999999,fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif'},children:(0,nt.jsxs)("div",{style:{maxWidth:420,width:"90%",background:"#F8FBFF",borderRadius:12,padding:20,boxShadow:"0 12px 32px rgba(0,0,0,0.12)",border:"1px solid #E6F0FF",animation:"echly-clarity-card-in 150ms ease-out"},children:[(0,nt.jsx)("div",{style:{fontWeight:600,fontSize:15,marginBottom:6,color:"#111"},children:"Quick suggestion"}),(0,nt.jsx)("div",{style:{fontSize:14,color:"#374151",marginBottom:8},children:"Your feedback may be unclear."}),(0,nt.jsx)("div",{style:{fontSize:13,color:"#6b7280",marginBottom:10},children:"Try specifying what looks wrong and what change you want."}),ue.suggestedRewrite&&(0,nt.jsxs)("div",{style:{fontSize:13,fontStyle:"italic",color:"#4b5563",marginBottom:12,opacity:.9},children:['Example: "',ue.suggestedRewrite,'"']}),(0,nt.jsx)("textarea",{ref:L,value:w,onChange:X=>A(X.target.value),disabled:!_,rows:3,placeholder:"Your feedback","aria-label":"Feedback message",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid #E6F0FF",fontSize:14,resize:"vertical",minHeight:72,marginBottom:16,background:_?"#fff":"#f3f4f6",color:"#111"}}),(0,nt.jsx)("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:_?(0,nt.jsx)("button",{type:"button",disabled:S,onClick:()=>{C.current||!ue||(C.current=!0,$(!0),g(!1),N(null),b(!1),O.submitEditedFeedback(ue,w).catch(X=>console.error("[Echly] Done submission failed:",X)).finally(()=>{C.current=!1,$(!1)}))},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:S?"default":"pointer",opacity:S?.8:1},children:"Done"}):(0,nt.jsxs)(nt.Fragment,{children:[(0,nt.jsx)("button",{type:"button",disabled:S,onClick:()=>b(!0),style:{background:"transparent",border:"1px solid #E6F0FF",borderRadius:8,padding:"8px 14px",fontSize:14,color:"#374151",cursor:S?"default":"pointer",opacity:S?.7:1},children:"Edit feedback"}),(0,nt.jsx)("button",{type:"button",disabled:S,onClick:()=>{C.current||!ue||(C.current=!0,$(!0),g(!1),N(null),b(!1),O.submitPendingFeedback(ue).catch(X=>console.error("[Echly] Submit anyway failed:",X)).finally(()=>{C.current=!1,$(!1)}))},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:S?"default":"pointer",opacity:S?.8:1},children:"Submit anyway"})]})})]})}),(0,nt.jsx)(Zp,{sessionId:x??"",userId:n.uid,extensionMode:!0,onComplete:O.handleComplete,onDelete:Se,widgetToggleRef:T,onRecordingChange:P,expanded:f.expanded,onExpandRequest:V,onCollapseRequest:Q,captureDisabled:!1,theme:u,onThemeToggle:G,fetchSessions:te,onResumeSessionSelect:se.onResumeSessionSelect,loadSessionWithPointers:R,onSessionLoaded:()=>D(null),onSessionEnd:()=>v(null),onCreateSession:se.createSession,onActiveSessionChange:se.onActiveSessionChange,globalSessionModeActive:f.sessionModeActive??!1,globalSessionPaused:f.sessionPaused??!1,onSessionModeStart:se.onSessionModeStart,onSessionModePause:se.onSessionModePause,onSessionModeResume:se.onSessionModeResume,onSessionModeEnd:se.onSessionModeEnd})]})}var FF=`
  :host { all: initial; }
  #echly-root { all: initial; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif; }
  #echly-root * { box-sizing: border-box; }
`;function BF(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let n=document.createElement("style");n.id="echly-reset",n.textContent=FF,t.appendChild(n)}function qF(t){let e=t.attachShadow({mode:"open"});BF(e);let n=document.createElement("div");n.id=OF,n.setAttribute("data-echly-ui","true"),n.style.all="initial",n.style.boxSizing="border-box",n.style.pointerEvents="auto",n.style.width="auto",n.style.height="auto";let a=MF();n.setAttribute("data-theme",a),e.appendChild(n),(0,kk.createRoot)(n).render((0,nt.jsx)(UF,{widgetRoot:n,initialTheme:a}))}function zF(){let t=document.getElementById(Dv);t||(t=document.createElement("div"),t.id=Dv,t.setAttribute("data-echly-ui","true"),t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),qF(t)),XC(t),ld.syncInitialGlobalState(t),ld.ensureVisibilityStateRefresh()}zF();})();
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
