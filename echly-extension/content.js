"use strict";(()=>{var Fk=Object.create;var um=Object.defineProperty;var Uk=Object.getOwnPropertyDescriptor;var Bk=Object.getOwnPropertyNames;var qk=Object.getPrototypeOf,zk=Object.prototype.hasOwnProperty;var sE=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,n)=>(typeof require<"u"?require:e)[n]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var Hk=(t,e)=>()=>(t&&(e=t(t=0)),e);var Ne=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),Gk=(t,e)=>{for(var n in e)um(t,n,{get:e[n],enumerable:!0})},jk=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Bk(e))!zk.call(t,r)&&r!==n&&um(t,r,{get:()=>e[r],enumerable:!(a=Uk(e,r))||a.enumerable});return t};var Ce=(t,e,n)=>(n=t!=null?Fk(qk(t)):{},jk(e||!t||!t.__esModule?um(n,"default",{value:t,enumerable:!0}):n,t));var gE=Ne(fe=>{"use strict";var dm=Symbol.for("react.transitional.element"),Kk=Symbol.for("react.portal"),Wk=Symbol.for("react.fragment"),Xk=Symbol.for("react.strict_mode"),Yk=Symbol.for("react.profiler"),Qk=Symbol.for("react.consumer"),$k=Symbol.for("react.context"),Jk=Symbol.for("react.forward_ref"),Zk=Symbol.for("react.suspense"),e1=Symbol.for("react.memo"),cE=Symbol.for("react.lazy"),t1=Symbol.for("react.activity"),iE=Symbol.iterator;function n1(t){return t===null||typeof t!="object"?null:(t=iE&&t[iE]||t["@@iterator"],typeof t=="function"?t:null)}var dE={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},fE=Object.assign,hE={};function $i(t,e,n){this.props=t,this.context=e,this.refs=hE,this.updater=n||dE}$i.prototype.isReactComponent={};$i.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};$i.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function pE(){}pE.prototype=$i.prototype;function fm(t,e,n){this.props=t,this.context=e,this.refs=hE,this.updater=n||dE}var hm=fm.prototype=new pE;hm.constructor=fm;fE(hm,$i.prototype);hm.isPureReactComponent=!0;var oE=Array.isArray;function cm(){}var at={H:null,A:null,T:null,S:null},mE=Object.prototype.hasOwnProperty;function pm(t,e,n){var a=n.ref;return{$$typeof:dm,type:t,key:e,ref:a!==void 0?a:null,props:n}}function a1(t,e){return pm(t.type,e,t.props)}function mm(t){return typeof t=="object"&&t!==null&&t.$$typeof===dm}function r1(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var uE=/\/+/g;function lm(t,e){return typeof t=="object"&&t!==null&&t.key!=null?r1(""+t.key):e.toString(36)}function s1(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(cm,cm):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function Qi(t,e,n,a,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case dm:case Kk:i=!0;break;case cE:return i=t._init,Qi(i(t._payload),e,n,a,r)}}if(i)return r=r(t),i=a===""?"."+lm(t,0):a,oE(r)?(n="",i!=null&&(n=i.replace(uE,"$&/")+"/"),Qi(r,e,n,"",function(c){return c})):r!=null&&(mm(r)&&(r=a1(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(uE,"$&/")+"/")+i)),e.push(r)),1;i=0;var u=a===""?".":a+":";if(oE(t))for(var l=0;l<t.length;l++)a=t[l],s=u+lm(a,l),i+=Qi(a,e,n,s,r);else if(l=n1(t),typeof l=="function")for(t=l.call(t),l=0;!(a=t.next()).done;)a=a.value,s=u+lm(a,l++),i+=Qi(a,e,n,s,r);else if(s==="object"){if(typeof t.then=="function")return Qi(s1(t),e,n,a,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function Ed(t,e,n){if(t==null)return t;var a=[],r=0;return Qi(t,a,"","",function(s){return e.call(n,s,r++)}),a}function i1(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var lE=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},o1={map:Ed,forEach:function(t,e,n){Ed(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ed(t,function(){e++}),e},toArray:function(t){return Ed(t,function(e){return e})||[]},only:function(t){if(!mm(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};fe.Activity=t1;fe.Children=o1;fe.Component=$i;fe.Fragment=Wk;fe.Profiler=Yk;fe.PureComponent=fm;fe.StrictMode=Xk;fe.Suspense=Zk;fe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=at;fe.__COMPILER_RUNTIME={__proto__:null,c:function(t){return at.H.useMemoCache(t)}};fe.cache=function(t){return function(){return t.apply(null,arguments)}};fe.cacheSignal=function(){return null};fe.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var a=fE({},t.props),r=t.key;if(e!=null)for(s in e.key!==void 0&&(r=""+e.key),e)!mE.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(a[s]=e[s]);var s=arguments.length-2;if(s===1)a.children=n;else if(1<s){for(var i=Array(s),u=0;u<s;u++)i[u]=arguments[u+2];a.children=i}return pm(t.type,r,a)};fe.createContext=function(t){return t={$$typeof:$k,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:Qk,_context:t},t};fe.createElement=function(t,e,n){var a,r={},s=null;if(e!=null)for(a in e.key!==void 0&&(s=""+e.key),e)mE.call(e,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(r[a]=e[a]);var i=arguments.length-2;if(i===1)r.children=n;else if(1<i){for(var u=Array(i),l=0;l<i;l++)u[l]=arguments[l+2];r.children=u}if(t&&t.defaultProps)for(a in i=t.defaultProps,i)r[a]===void 0&&(r[a]=i[a]);return pm(t,s,r)};fe.createRef=function(){return{current:null}};fe.forwardRef=function(t){return{$$typeof:Jk,render:t}};fe.isValidElement=mm;fe.lazy=function(t){return{$$typeof:cE,_payload:{_status:-1,_result:t},_init:i1}};fe.memo=function(t,e){return{$$typeof:e1,type:t,compare:e===void 0?null:e}};fe.startTransition=function(t){var e=at.T,n={};at.T=n;try{var a=t(),r=at.S;r!==null&&r(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(cm,lE)}catch(s){lE(s)}finally{e!==null&&n.types!==null&&(e.types=n.types),at.T=e}};fe.unstable_useCacheRefresh=function(){return at.H.useCacheRefresh()};fe.use=function(t){return at.H.use(t)};fe.useActionState=function(t,e,n){return at.H.useActionState(t,e,n)};fe.useCallback=function(t,e){return at.H.useCallback(t,e)};fe.useContext=function(t){return at.H.useContext(t)};fe.useDebugValue=function(){};fe.useDeferredValue=function(t,e){return at.H.useDeferredValue(t,e)};fe.useEffect=function(t,e){return at.H.useEffect(t,e)};fe.useEffectEvent=function(t){return at.H.useEffectEvent(t)};fe.useId=function(){return at.H.useId()};fe.useImperativeHandle=function(t,e,n){return at.H.useImperativeHandle(t,e,n)};fe.useInsertionEffect=function(t,e){return at.H.useInsertionEffect(t,e)};fe.useLayoutEffect=function(t,e){return at.H.useLayoutEffect(t,e)};fe.useMemo=function(t,e){return at.H.useMemo(t,e)};fe.useOptimistic=function(t,e){return at.H.useOptimistic(t,e)};fe.useReducer=function(t,e,n){return at.H.useReducer(t,e,n)};fe.useRef=function(t){return at.H.useRef(t)};fe.useState=function(t){return at.H.useState(t)};fe.useSyncExternalStore=function(t,e,n){return at.H.useSyncExternalStore(t,e,n)};fe.useTransition=function(){return at.H.useTransition()};fe.version="19.2.3"});var Hn=Ne((KU,yE)=>{"use strict";yE.exports=gE()});var LE=Ne(ot=>{"use strict";function _m(t,e){var n=t.length;t.push(e);e:for(;0<n;){var a=n-1>>>1,r=t[a];if(0<Td(r,e))t[a]=e,t[n]=r,n=a;else break e}}function Na(t){return t.length===0?null:t[0]}function wd(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var a=0,r=t.length,s=r>>>1;a<s;){var i=2*(a+1)-1,u=t[i],l=i+1,c=t[l];if(0>Td(u,n))l<r&&0>Td(c,u)?(t[a]=c,t[l]=n,a=l):(t[a]=u,t[i]=n,a=i);else if(l<r&&0>Td(c,n))t[a]=c,t[l]=n,a=l;else break e}}return e}function Td(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}ot.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(IE=performance,ot.unstable_now=function(){return IE.now()}):(gm=Date,_E=gm.now(),ot.unstable_now=function(){return gm.now()-_E});var IE,gm,_E,mr=[],cs=[],u1=1,aa=null,In=3,Sm=!1,Yu=!1,Qu=!1,vm=!1,EE=typeof setTimeout=="function"?setTimeout:null,TE=typeof clearTimeout=="function"?clearTimeout:null,SE=typeof setImmediate<"u"?setImmediate:null;function bd(t){for(var e=Na(cs);e!==null;){if(e.callback===null)wd(cs);else if(e.startTime<=t)wd(cs),e.sortIndex=e.expirationTime,_m(mr,e);else break;e=Na(cs)}}function Em(t){if(Qu=!1,bd(t),!Yu)if(Na(mr)!==null)Yu=!0,Zi||(Zi=!0,Ji());else{var e=Na(cs);e!==null&&Tm(Em,e.startTime-t)}}var Zi=!1,$u=-1,bE=5,wE=-1;function CE(){return vm?!0:!(ot.unstable_now()-wE<bE)}function ym(){if(vm=!1,Zi){var t=ot.unstable_now();wE=t;var e=!0;try{e:{Yu=!1,Qu&&(Qu=!1,TE($u),$u=-1),Sm=!0;var n=In;try{t:{for(bd(t),aa=Na(mr);aa!==null&&!(aa.expirationTime>t&&CE());){var a=aa.callback;if(typeof a=="function"){aa.callback=null,In=aa.priorityLevel;var r=a(aa.expirationTime<=t);if(t=ot.unstable_now(),typeof r=="function"){aa.callback=r,bd(t),e=!0;break t}aa===Na(mr)&&wd(mr),bd(t)}else wd(mr);aa=Na(mr)}if(aa!==null)e=!0;else{var s=Na(cs);s!==null&&Tm(Em,s.startTime-t),e=!1}}break e}finally{aa=null,In=n,Sm=!1}e=void 0}}finally{e?Ji():Zi=!1}}}var Ji;typeof SE=="function"?Ji=function(){SE(ym)}:typeof MessageChannel<"u"?(Im=new MessageChannel,vE=Im.port2,Im.port1.onmessage=ym,Ji=function(){vE.postMessage(null)}):Ji=function(){EE(ym,0)};var Im,vE;function Tm(t,e){$u=EE(function(){t(ot.unstable_now())},e)}ot.unstable_IdlePriority=5;ot.unstable_ImmediatePriority=1;ot.unstable_LowPriority=4;ot.unstable_NormalPriority=3;ot.unstable_Profiling=null;ot.unstable_UserBlockingPriority=2;ot.unstable_cancelCallback=function(t){t.callback=null};ot.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):bE=0<t?Math.floor(1e3/t):5};ot.unstable_getCurrentPriorityLevel=function(){return In};ot.unstable_next=function(t){switch(In){case 1:case 2:case 3:var e=3;break;default:e=In}var n=In;In=e;try{return t()}finally{In=n}};ot.unstable_requestPaint=function(){vm=!0};ot.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=In;In=t;try{return e()}finally{In=n}};ot.unstable_scheduleCallback=function(t,e,n){var a=ot.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:u1++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>a?(t.sortIndex=n,_m(cs,t),Na(mr)===null&&t===Na(cs)&&(Qu?(TE($u),$u=-1):Qu=!0,Tm(Em,n-a))):(t.sortIndex=r,_m(mr,t),Yu||Sm||(Yu=!0,Zi||(Zi=!0,Ji()))),t};ot.unstable_shouldYield=CE;ot.unstable_wrapCallback=function(t){var e=In;return function(){var n=In;In=e;try{return t.apply(this,arguments)}finally{In=n}}}});var xE=Ne((XU,AE)=>{"use strict";AE.exports=LE()});var kE=Ne(Tn=>{"use strict";var l1=Hn();function RE(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ds(){}var En={d:{f:ds,r:function(){throw Error(RE(522))},D:ds,C:ds,L:ds,m:ds,X:ds,S:ds,M:ds},p:0,findDOMNode:null},c1=Symbol.for("react.portal");function d1(t,e,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:c1,key:a==null?null:""+a,children:t,containerInfo:e,implementation:n}}var Ju=l1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Cd(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}Tn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=En;Tn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(RE(299));return d1(t,e,null,n)};Tn.flushSync=function(t){var e=Ju.T,n=En.p;try{if(Ju.T=null,En.p=2,t)return t()}finally{Ju.T=e,En.p=n,En.d.f()}};Tn.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,En.d.C(t,e))};Tn.prefetchDNS=function(t){typeof t=="string"&&En.d.D(t)};Tn.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,a=Cd(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,s=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?En.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:a,integrity:r,fetchPriority:s}):n==="script"&&En.d.X(t,{crossOrigin:a,integrity:r,fetchPriority:s,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};Tn.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Cd(e.as,e.crossOrigin);En.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&En.d.M(t)};Tn.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,a=Cd(n,e.crossOrigin);En.d.L(t,n,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};Tn.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Cd(e.as,e.crossOrigin);En.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else En.d.m(t)};Tn.requestFormReset=function(t){En.d.r(t)};Tn.unstable_batchedUpdates=function(t,e){return t(e)};Tn.useFormState=function(t,e,n){return Ju.H.useFormState(t,e,n)};Tn.useFormStatus=function(){return Ju.H.useHostTransitionStatus()};Tn.version="19.2.3"});var Ld=Ne((QU,PE)=>{"use strict";function DE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(DE)}catch(t){console.error(t)}}DE(),PE.exports=kE()});var jC=Ne(Zf=>{"use strict";var Xt=xE(),sb=Hn(),f1=Ld();function V(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ib(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Fl(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function ob(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function ub(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function OE(t){if(Fl(t)!==t)throw Error(V(188))}function h1(t){var e=t.alternate;if(!e){if(e=Fl(t),e===null)throw Error(V(188));return e!==t?null:t}for(var n=t,a=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(a=r.return,a!==null){n=a;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return OE(r),t;if(s===a)return OE(r),e;s=s.sibling}throw Error(V(188))}if(n.return!==a.return)n=r,a=s;else{for(var i=!1,u=r.child;u;){if(u===n){i=!0,n=r,a=s;break}if(u===a){i=!0,a=r,n=s;break}u=u.sibling}if(!i){for(u=s.child;u;){if(u===n){i=!0,n=s,a=r;break}if(u===a){i=!0,a=s,n=r;break}u=u.sibling}if(!i)throw Error(V(189))}}if(n.alternate!==a)throw Error(V(190))}if(n.tag!==3)throw Error(V(188));return n.stateNode.current===n?t:e}function lb(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=lb(t),e!==null)return e;t=t.sibling}return null}var it=Object.assign,p1=Symbol.for("react.element"),Ad=Symbol.for("react.transitional.element"),il=Symbol.for("react.portal"),so=Symbol.for("react.fragment"),cb=Symbol.for("react.strict_mode"),ag=Symbol.for("react.profiler"),db=Symbol.for("react.consumer"),Tr=Symbol.for("react.context"),Jg=Symbol.for("react.forward_ref"),rg=Symbol.for("react.suspense"),sg=Symbol.for("react.suspense_list"),Zg=Symbol.for("react.memo"),fs=Symbol.for("react.lazy");Symbol.for("react.scope");var ig=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var m1=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var ME=Symbol.iterator;function Zu(t){return t===null||typeof t!="object"?null:(t=ME&&t[ME]||t["@@iterator"],typeof t=="function"?t:null)}var g1=Symbol.for("react.client.reference");function og(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===g1?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case so:return"Fragment";case ag:return"Profiler";case cb:return"StrictMode";case rg:return"Suspense";case sg:return"SuspenseList";case ig:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case il:return"Portal";case Tr:return t.displayName||"Context";case db:return(t._context.displayName||"Context")+".Consumer";case Jg:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Zg:return e=t.displayName||null,e!==null?e:og(t.type)||"Memo";case fs:e=t._payload,t=t._init;try{return og(t(e))}catch{}}return null}var ol=Array.isArray,ie=sb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Be=f1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,oi={pending:!1,data:null,method:null,action:null},ug=[],io=-1;function qa(t){return{current:t}}function an(t){0>io||(t.current=ug[io],ug[io]=null,io--)}function tt(t,e){io++,ug[io]=t.current,t.current=e}var Ba=qa(null),bl=qa(null),Ts=qa(null),uf=qa(null);function lf(t,e){switch(tt(Ts,e),tt(bl,t),tt(Ba,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?zT(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=zT(e),t=kC(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}an(Ba),tt(Ba,t)}function wo(){an(Ba),an(bl),an(Ts)}function lg(t){t.memoizedState!==null&&tt(uf,t);var e=Ba.current,n=kC(e,t.type);e!==n&&(tt(bl,t),tt(Ba,n))}function cf(t){bl.current===t&&(an(Ba),an(bl)),uf.current===t&&(an(uf),Ml._currentValue=oi)}var bm,NE;function ai(t){if(bm===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);bm=e&&e[1]||"",NE=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+bm+t+NE}var wm=!1;function Cm(t,e){if(!t||wm)return"";wm=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(e){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(S){var m=S}Reflect.construct(t,[],p)}else{try{p.call()}catch(S){m=S}t.call(p.prototype)}}else{try{throw Error()}catch(S){m=S}(p=t())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(S){if(S&&m&&typeof S.stack=="string")return[S.stack,m.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=a.DetermineComponentFrameRoot(),i=s[0],u=s[1];if(i&&u){var l=i.split(`
`),c=u.split(`
`);for(r=a=0;a<l.length&&!l[a].includes("DetermineComponentFrameRoot");)a++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(a===l.length||r===c.length)for(a=l.length-1,r=c.length-1;1<=a&&0<=r&&l[a]!==c[r];)r--;for(;1<=a&&0<=r;a--,r--)if(l[a]!==c[r]){if(a!==1||r!==1)do if(a--,r--,0>r||l[a]!==c[r]){var f=`
`+l[a].replace(" at new "," at ");return t.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",t.displayName)),f}while(1<=a&&0<=r);break}}}finally{wm=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?ai(n):""}function y1(t,e){switch(t.tag){case 26:case 27:case 5:return ai(t.type);case 16:return ai("Lazy");case 13:return t.child!==e&&e!==null?ai("Suspense Fallback"):ai("Suspense");case 19:return ai("SuspenseList");case 0:case 15:return Cm(t.type,!1);case 11:return Cm(t.type.render,!1);case 1:return Cm(t.type,!0);case 31:return ai("Activity");default:return""}}function VE(t){try{var e="",n=null;do e+=y1(t,n),n=t,t=t.return;while(t);return e}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var cg=Object.prototype.hasOwnProperty,ey=Xt.unstable_scheduleCallback,Lm=Xt.unstable_cancelCallback,I1=Xt.unstable_shouldYield,_1=Xt.unstable_requestPaint,Xn=Xt.unstable_now,S1=Xt.unstable_getCurrentPriorityLevel,fb=Xt.unstable_ImmediatePriority,hb=Xt.unstable_UserBlockingPriority,df=Xt.unstable_NormalPriority,v1=Xt.unstable_LowPriority,pb=Xt.unstable_IdlePriority,E1=Xt.log,T1=Xt.unstable_setDisableYieldValue,Ul=null,Yn=null;function Is(t){if(typeof E1=="function"&&T1(t),Yn&&typeof Yn.setStrictMode=="function")try{Yn.setStrictMode(Ul,t)}catch{}}var Qn=Math.clz32?Math.clz32:C1,b1=Math.log,w1=Math.LN2;function C1(t){return t>>>=0,t===0?32:31-(b1(t)/w1|0)|0}var xd=256,Rd=262144,kd=4194304;function ri(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Vf(t,e,n){var a=t.pendingLanes;if(a===0)return 0;var r=0,s=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var u=a&134217727;return u!==0?(a=u&~s,a!==0?r=ri(a):(i&=u,i!==0?r=ri(i):n||(n=u&~t,n!==0&&(r=ri(n))))):(u=a&~s,u!==0?r=ri(u):i!==0?r=ri(i):n||(n=a&~t,n!==0&&(r=ri(n)))),r===0?0:e!==0&&e!==r&&!(e&s)&&(s=r&-r,n=e&-e,s>=n||s===32&&(n&4194048)!==0)?e:r}function Bl(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function L1(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function mb(){var t=kd;return kd<<=1,!(kd&62914560)&&(kd=4194304),t}function Am(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function ql(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function A1(t,e,n,a,r,s){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var u=t.entanglements,l=t.expirationTimes,c=t.hiddenUpdates;for(n=i&~n;0<n;){var f=31-Qn(n),p=1<<f;u[f]=0,l[f]=-1;var m=c[f];if(m!==null)for(c[f]=null,f=0;f<m.length;f++){var S=m[f];S!==null&&(S.lane&=-536870913)}n&=~p}a!==0&&gb(t,a,0),s!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=s&~(i&~e))}function gb(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var a=31-Qn(e);t.entangledLanes|=e,t.entanglements[a]=t.entanglements[a]|1073741824|n&261930}function yb(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var a=31-Qn(n),r=1<<a;r&e|t[a]&e&&(t[a]|=e),n&=~r}}function Ib(t,e){var n=e&-e;return n=n&42?1:ty(n),n&(t.suspendedLanes|e)?0:n}function ty(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function ny(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function _b(){var t=Be.p;return t!==0?t:(t=window.event,t===void 0?32:zC(t.type))}function FE(t,e){var n=Be.p;try{return Be.p=t,e()}finally{Be.p=n}}var Ns=Math.random().toString(36).slice(2),fn="__reactFiber$"+Ns,Dn="__reactProps$"+Ns,No="__reactContainer$"+Ns,dg="__reactEvents$"+Ns,x1="__reactListeners$"+Ns,R1="__reactHandles$"+Ns,UE="__reactResources$"+Ns,zl="__reactMarker$"+Ns;function ay(t){delete t[fn],delete t[Dn],delete t[dg],delete t[x1],delete t[R1]}function oo(t){var e=t[fn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[No]||n[fn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=WT(t);t!==null;){if(n=t[fn])return n;t=WT(t)}return e}t=n,n=t.parentNode}return null}function Vo(t){if(t=t[fn]||t[No]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function ul(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(V(33))}function Io(t){var e=t[UE];return e||(e=t[UE]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function nn(t){t[zl]=!0}var Sb=new Set,vb={};function yi(t,e){Co(t,e),Co(t+"Capture",e)}function Co(t,e){for(vb[t]=e,t=0;t<e.length;t++)Sb.add(e[t])}var k1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),BE={},qE={};function D1(t){return cg.call(qE,t)?!0:cg.call(BE,t)?!1:k1.test(t)?qE[t]=!0:(BE[t]=!0,!1)}function Kd(t,e,n){if(D1(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var a=e.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Dd(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function gr(t,e,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+a)}}function sa(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Eb(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function P1(t,e,n){var a=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var r=a.get,s=a.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(i){n=""+i,s.call(this,i)}}),Object.defineProperty(t,e,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function fg(t){if(!t._valueTracker){var e=Eb(t)?"checked":"value";t._valueTracker=P1(t,e,""+t[e])}}function Tb(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),a="";return t&&(a=Eb(t)?t.checked?"true":"false":t.value),t=a,t!==n?(e.setValue(t),!0):!1}function ff(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var O1=/[\n"\\]/g;function ua(t){return t.replace(O1,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function hg(t,e,n,a,r,s,i,u){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+sa(e)):t.value!==""+sa(e)&&(t.value=""+sa(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?pg(t,i,sa(e)):n!=null?pg(t,i,sa(n)):a!=null&&t.removeAttribute("value"),r==null&&s!=null&&(t.defaultChecked=!!s),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.name=""+sa(u):t.removeAttribute("name")}function bb(t,e,n,a,r,s,i,u){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.type=s),e!=null||n!=null){if(!(s!=="submit"&&s!=="reset"||e!=null)){fg(t);return}n=n!=null?""+sa(n):"",e=e!=null?""+sa(e):n,u||e===t.value||(t.value=e),t.defaultValue=e}a=a??r,a=typeof a!="function"&&typeof a!="symbol"&&!!a,t.checked=u?t.checked:!!a,t.defaultChecked=!!a,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),fg(t)}function pg(t,e,n){e==="number"&&ff(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function _o(t,e,n,a){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&a&&(t[n].defaultSelected=!0)}else{for(n=""+sa(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,a&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function wb(t,e,n){if(e!=null&&(e=""+sa(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+sa(n):""}function Cb(t,e,n,a){if(e==null){if(a!=null){if(n!=null)throw Error(V(92));if(ol(a)){if(1<a.length)throw Error(V(93));a=a[0]}n=a}n==null&&(n=""),e=n}n=sa(e),t.defaultValue=n,a=t.textContent,a===n&&a!==""&&a!==null&&(t.value=a),fg(t)}function Lo(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var M1=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function zE(t,e,n){var a=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":a?t.setProperty(e,n):typeof n!="number"||n===0||M1.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function Lb(t,e,n){if(e!=null&&typeof e!="object")throw Error(V(62));if(t=t.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||e!=null&&e.hasOwnProperty(a)||(a.indexOf("--")===0?t.setProperty(a,""):a==="float"?t.cssFloat="":t[a]="");for(var r in e)a=e[r],e.hasOwnProperty(r)&&n[r]!==a&&zE(t,r,a)}else for(var s in e)e.hasOwnProperty(s)&&zE(t,s,e[s])}function ry(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var N1=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),V1=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Wd(t){return V1.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function br(){}var mg=null;function sy(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var uo=null,So=null;function HE(t){var e=Vo(t);if(e&&(t=e.stateNode)){var n=t[Dn]||null;e:switch(t=e.stateNode,e.type){case"input":if(hg(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+ua(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var a=n[e];if(a!==t&&a.form===t.form){var r=a[Dn]||null;if(!r)throw Error(V(90));hg(a,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)a=n[e],a.form===t.form&&Tb(a)}break e;case"textarea":wb(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&_o(t,!!n.multiple,e,!1)}}}var xm=!1;function Ab(t,e,n){if(xm)return t(e,n);xm=!0;try{var a=t(e);return a}finally{if(xm=!1,(uo!==null||So!==null)&&(Yf(),uo&&(e=uo,t=So,So=uo=null,HE(e),t)))for(e=0;e<t.length;e++)HE(t[e])}}function wl(t,e){var n=t.stateNode;if(n===null)return null;var a=n[Dn]||null;if(a===null)return null;n=a[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(t=t.type,a=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!a;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(V(231,e,typeof n));return n}var xr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),gg=!1;if(xr)try{eo={},Object.defineProperty(eo,"passive",{get:function(){gg=!0}}),window.addEventListener("test",eo,eo),window.removeEventListener("test",eo,eo)}catch{gg=!1}var eo,_s=null,iy=null,Xd=null;function xb(){if(Xd)return Xd;var t,e=iy,n=e.length,a,r="value"in _s?_s.value:_s.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var i=n-t;for(a=1;a<=i&&e[n-a]===r[s-a];a++);return Xd=r.slice(t,1<a?1-a:void 0)}function Yd(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Pd(){return!0}function GE(){return!1}function Pn(t){function e(n,a,r,s,i){this._reactName=n,this._targetInst=r,this.type=a,this.nativeEvent=s,this.target=i,this.currentTarget=null;for(var u in t)t.hasOwnProperty(u)&&(n=t[u],this[u]=n?n(s):s[u]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Pd:GE,this.isPropagationStopped=GE,this}return it(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Pd)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Pd)},persist:function(){},isPersistent:Pd}),e}var Ii={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ff=Pn(Ii),Hl=it({},Ii,{view:0,detail:0}),F1=Pn(Hl),Rm,km,el,Uf=it({},Hl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:oy,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==el&&(el&&t.type==="mousemove"?(Rm=t.screenX-el.screenX,km=t.screenY-el.screenY):km=Rm=0,el=t),Rm)},movementY:function(t){return"movementY"in t?t.movementY:km}}),jE=Pn(Uf),U1=it({},Uf,{dataTransfer:0}),B1=Pn(U1),q1=it({},Hl,{relatedTarget:0}),Dm=Pn(q1),z1=it({},Ii,{animationName:0,elapsedTime:0,pseudoElement:0}),H1=Pn(z1),G1=it({},Ii,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),j1=Pn(G1),K1=it({},Ii,{data:0}),KE=Pn(K1),W1={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},X1={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Y1={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Q1(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Y1[t])?!!e[t]:!1}function oy(){return Q1}var $1=it({},Hl,{key:function(t){if(t.key){var e=W1[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Yd(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?X1[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:oy,charCode:function(t){return t.type==="keypress"?Yd(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Yd(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),J1=Pn($1),Z1=it({},Uf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),WE=Pn(Z1),eD=it({},Hl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:oy}),tD=Pn(eD),nD=it({},Ii,{propertyName:0,elapsedTime:0,pseudoElement:0}),aD=Pn(nD),rD=it({},Uf,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),sD=Pn(rD),iD=it({},Ii,{newState:0,oldState:0}),oD=Pn(iD),uD=[9,13,27,32],uy=xr&&"CompositionEvent"in window,dl=null;xr&&"documentMode"in document&&(dl=document.documentMode);var lD=xr&&"TextEvent"in window&&!dl,Rb=xr&&(!uy||dl&&8<dl&&11>=dl),XE=" ",YE=!1;function kb(t,e){switch(t){case"keyup":return uD.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Db(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var lo=!1;function cD(t,e){switch(t){case"compositionend":return Db(e);case"keypress":return e.which!==32?null:(YE=!0,XE);case"textInput":return t=e.data,t===XE&&YE?null:t;default:return null}}function dD(t,e){if(lo)return t==="compositionend"||!uy&&kb(t,e)?(t=xb(),Xd=iy=_s=null,lo=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Rb&&e.locale!=="ko"?null:e.data;default:return null}}var fD={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function QE(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!fD[t.type]:e==="textarea"}function Pb(t,e,n,a){uo?So?So.push(a):So=[a]:uo=a,e=Rf(e,"onChange"),0<e.length&&(n=new Ff("onChange","change",null,n,a),t.push({event:n,listeners:e}))}var fl=null,Cl=null;function hD(t){AC(t,0)}function Bf(t){var e=ul(t);if(Tb(e))return t}function $E(t,e){if(t==="change")return e}var Ob=!1;xr&&(xr?(Md="oninput"in document,Md||(Pm=document.createElement("div"),Pm.setAttribute("oninput","return;"),Md=typeof Pm.oninput=="function"),Od=Md):Od=!1,Ob=Od&&(!document.documentMode||9<document.documentMode));var Od,Md,Pm;function JE(){fl&&(fl.detachEvent("onpropertychange",Mb),Cl=fl=null)}function Mb(t){if(t.propertyName==="value"&&Bf(Cl)){var e=[];Pb(e,Cl,t,sy(t)),Ab(hD,e)}}function pD(t,e,n){t==="focusin"?(JE(),fl=e,Cl=n,fl.attachEvent("onpropertychange",Mb)):t==="focusout"&&JE()}function mD(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Bf(Cl)}function gD(t,e){if(t==="click")return Bf(e)}function yD(t,e){if(t==="input"||t==="change")return Bf(e)}function ID(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Jn=typeof Object.is=="function"?Object.is:ID;function Ll(t,e){if(Jn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),a=Object.keys(e);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var r=n[a];if(!cg.call(e,r)||!Jn(t[r],e[r]))return!1}return!0}function ZE(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function eT(t,e){var n=ZE(t);t=0;for(var a;n;){if(n.nodeType===3){if(a=t+n.textContent.length,t<=e&&a>=e)return{node:n,offset:e-t};t=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=ZE(n)}}function Nb(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Nb(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Vb(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=ff(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=ff(t.document)}return e}function ly(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var _D=xr&&"documentMode"in document&&11>=document.documentMode,co=null,yg=null,hl=null,Ig=!1;function tT(t,e,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Ig||co==null||co!==ff(a)||(a=co,"selectionStart"in a&&ly(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),hl&&Ll(hl,a)||(hl=a,a=Rf(yg,"onSelect"),0<a.length&&(e=new Ff("onSelect","select",null,e,n),t.push({event:e,listeners:a}),e.target=co)))}function ni(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var fo={animationend:ni("Animation","AnimationEnd"),animationiteration:ni("Animation","AnimationIteration"),animationstart:ni("Animation","AnimationStart"),transitionrun:ni("Transition","TransitionRun"),transitionstart:ni("Transition","TransitionStart"),transitioncancel:ni("Transition","TransitionCancel"),transitionend:ni("Transition","TransitionEnd")},Om={},Fb={};xr&&(Fb=document.createElement("div").style,"AnimationEvent"in window||(delete fo.animationend.animation,delete fo.animationiteration.animation,delete fo.animationstart.animation),"TransitionEvent"in window||delete fo.transitionend.transition);function _i(t){if(Om[t])return Om[t];if(!fo[t])return t;var e=fo[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Fb)return Om[t]=e[n];return t}var Ub=_i("animationend"),Bb=_i("animationiteration"),qb=_i("animationstart"),SD=_i("transitionrun"),vD=_i("transitionstart"),ED=_i("transitioncancel"),zb=_i("transitionend"),Hb=new Map,_g="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");_g.push("scrollEnd");function va(t,e){Hb.set(t,e),yi(e,[t])}var hf=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ra=[],ho=0,cy=0;function qf(){for(var t=ho,e=cy=ho=0;e<t;){var n=ra[e];ra[e++]=null;var a=ra[e];ra[e++]=null;var r=ra[e];ra[e++]=null;var s=ra[e];if(ra[e++]=null,a!==null&&r!==null){var i=a.pending;i===null?r.next=r:(r.next=i.next,i.next=r),a.pending=r}s!==0&&Gb(n,r,s)}}function zf(t,e,n,a){ra[ho++]=t,ra[ho++]=e,ra[ho++]=n,ra[ho++]=a,cy|=a,t.lanes|=a,t=t.alternate,t!==null&&(t.lanes|=a)}function dy(t,e,n,a){return zf(t,e,n,a),pf(t)}function Si(t,e){return zf(t,null,null,e),pf(t)}function Gb(t,e,n){t.lanes|=n;var a=t.alternate;a!==null&&(a.lanes|=n);for(var r=!1,s=t.return;s!==null;)s.childLanes|=n,a=s.alternate,a!==null&&(a.childLanes|=n),s.tag===22&&(t=s.stateNode,t===null||t._visibility&1||(r=!0)),t=s,s=s.return;return t.tag===3?(s=t.stateNode,r&&e!==null&&(r=31-Qn(n),t=s.hiddenUpdates,a=t[r],a===null?t[r]=[e]:a.push(e),e.lane=n|536870912),s):null}function pf(t){if(50<El)throw El=0,Bg=null,Error(V(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var po={};function TD(t,e,n,a){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Kn(t,e,n,a){return new TD(t,e,n,a)}function fy(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Cr(t,e){var n=t.alternate;return n===null?(n=Kn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function jb(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Qd(t,e,n,a,r,s){var i=0;if(a=t,typeof t=="function")fy(t)&&(i=1);else if(typeof t=="string")i=CP(t,n,Ba.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case ig:return t=Kn(31,n,e,r),t.elementType=ig,t.lanes=s,t;case so:return ui(n.children,r,s,e);case cb:i=8,r|=24;break;case ag:return t=Kn(12,n,e,r|2),t.elementType=ag,t.lanes=s,t;case rg:return t=Kn(13,n,e,r),t.elementType=rg,t.lanes=s,t;case sg:return t=Kn(19,n,e,r),t.elementType=sg,t.lanes=s,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Tr:i=10;break e;case db:i=9;break e;case Jg:i=11;break e;case Zg:i=14;break e;case fs:i=16,a=null;break e}i=29,n=Error(V(130,t===null?"null":typeof t,"")),a=null}return e=Kn(i,n,e,r),e.elementType=t,e.type=a,e.lanes=s,e}function ui(t,e,n,a){return t=Kn(7,t,a,e),t.lanes=n,t}function Mm(t,e,n){return t=Kn(6,t,null,e),t.lanes=n,t}function Kb(t){var e=Kn(18,null,null,0);return e.stateNode=t,e}function Nm(t,e,n){return e=Kn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var nT=new WeakMap;function la(t,e){if(typeof t=="object"&&t!==null){var n=nT.get(t);return n!==void 0?n:(e={value:t,source:e,stack:VE(e)},nT.set(t,e),e)}return{value:t,source:e,stack:VE(e)}}var mo=[],go=0,mf=null,Al=0,ia=[],oa=0,Ds=null,Va=1,Fa="";function vr(t,e){mo[go++]=Al,mo[go++]=mf,mf=t,Al=e}function Wb(t,e,n){ia[oa++]=Va,ia[oa++]=Fa,ia[oa++]=Ds,Ds=t;var a=Va;t=Fa;var r=32-Qn(a)-1;a&=~(1<<r),n+=1;var s=32-Qn(e)+r;if(30<s){var i=r-r%5;s=(a&(1<<i)-1).toString(32),a>>=i,r-=i,Va=1<<32-Qn(e)+r|n<<r|a,Fa=s+t}else Va=1<<s|n<<r|a,Fa=t}function hy(t){t.return!==null&&(vr(t,1),Wb(t,1,0))}function py(t){for(;t===mf;)mf=mo[--go],mo[go]=null,Al=mo[--go],mo[go]=null;for(;t===Ds;)Ds=ia[--oa],ia[oa]=null,Fa=ia[--oa],ia[oa]=null,Va=ia[--oa],ia[oa]=null}function Xb(t,e){ia[oa++]=Va,ia[oa++]=Fa,ia[oa++]=Ds,Va=e.id,Fa=e.overflow,Ds=t}var hn=null,st=null,Ae=!1,bs=null,ca=!1,Sg=Error(V(519));function Ps(t){var e=Error(V(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw xl(la(e,t)),Sg}function aT(t){var e=t.stateNode,n=t.type,a=t.memoizedProps;switch(e[fn]=t,e[Dn]=a,n){case"dialog":ve("cancel",e),ve("close",e);break;case"iframe":case"object":case"embed":ve("load",e);break;case"video":case"audio":for(n=0;n<Pl.length;n++)ve(Pl[n],e);break;case"source":ve("error",e);break;case"img":case"image":case"link":ve("error",e),ve("load",e);break;case"details":ve("toggle",e);break;case"input":ve("invalid",e),bb(e,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":ve("invalid",e);break;case"textarea":ve("invalid",e),Cb(e,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||a.suppressHydrationWarning===!0||RC(e.textContent,n)?(a.popover!=null&&(ve("beforetoggle",e),ve("toggle",e)),a.onScroll!=null&&ve("scroll",e),a.onScrollEnd!=null&&ve("scrollend",e),a.onClick!=null&&(e.onclick=br),e=!0):e=!1,e||Ps(t,!0)}function rT(t){for(hn=t.return;hn;)switch(hn.tag){case 5:case 31:case 13:ca=!1;return;case 27:case 3:ca=!0;return;default:hn=hn.return}}function to(t){if(t!==hn)return!1;if(!Ae)return rT(t),Ae=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||jg(t.type,t.memoizedProps)),n=!n),n&&st&&Ps(t),rT(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(317));st=KT(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(317));st=KT(t)}else e===27?(e=st,Vs(t.type)?(t=Yg,Yg=null,st=t):st=e):st=hn?fa(t.stateNode.nextSibling):null;return!0}function fi(){st=hn=null,Ae=!1}function Vm(){var t=bs;return t!==null&&(Rn===null?Rn=t:Rn.push.apply(Rn,t),bs=null),t}function xl(t){bs===null?bs=[t]:bs.push(t)}var vg=qa(null),vi=null,wr=null;function ps(t,e,n){tt(vg,e._currentValue),e._currentValue=n}function Lr(t){t._currentValue=vg.current,an(vg)}function Eg(t,e,n){for(;t!==null;){var a=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,a!==null&&(a.childLanes|=e)):a!==null&&(a.childLanes&e)!==e&&(a.childLanes|=e),t===n)break;t=t.return}}function Tg(t,e,n,a){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var s=r.dependencies;if(s!==null){var i=r.child;s=s.firstContext;e:for(;s!==null;){var u=s;s=r;for(var l=0;l<e.length;l++)if(u.context===e[l]){s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),Eg(s.return,n,t),a||(i=null);break e}s=u.next}}else if(r.tag===18){if(i=r.return,i===null)throw Error(V(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),Eg(i,n,t),i=null}else i=r.child;if(i!==null)i.return=r;else for(i=r;i!==null;){if(i===t){i=null;break}if(r=i.sibling,r!==null){r.return=i.return,i=r;break}i=i.return}r=i}}function Fo(t,e,n,a){t=null;for(var r=e,s=!1;r!==null;){if(!s){if(r.flags&524288)s=!0;else if(r.flags&262144)break}if(r.tag===10){var i=r.alternate;if(i===null)throw Error(V(387));if(i=i.memoizedProps,i!==null){var u=r.type;Jn(r.pendingProps.value,i.value)||(t!==null?t.push(u):t=[u])}}else if(r===uf.current){if(i=r.alternate,i===null)throw Error(V(387));i.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(Ml):t=[Ml])}r=r.return}t!==null&&Tg(e,t,n,a),e.flags|=262144}function gf(t){for(t=t.firstContext;t!==null;){if(!Jn(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function hi(t){vi=t,wr=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function pn(t){return Yb(vi,t)}function Nd(t,e){return vi===null&&hi(t),Yb(t,e)}function Yb(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},wr===null){if(t===null)throw Error(V(308));wr=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else wr=wr.next=e;return n}var bD=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,a){t.push(a)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},wD=Xt.unstable_scheduleCallback,CD=Xt.unstable_NormalPriority,Ft={$$typeof:Tr,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function my(){return{controller:new bD,data:new Map,refCount:0}}function Gl(t){t.refCount--,t.refCount===0&&wD(CD,function(){t.controller.abort()})}var pl=null,bg=0,Ao=0,vo=null;function LD(t,e){if(pl===null){var n=pl=[];bg=0,Ao=By(),vo={status:"pending",value:void 0,then:function(a){n.push(a)}}}return bg++,e.then(sT,sT),e}function sT(){if(--bg===0&&pl!==null){vo!==null&&(vo.status="fulfilled");var t=pl;pl=null,Ao=0,vo=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function AD(t,e){var n=[],a={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){a.status="fulfilled",a.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(a.status="rejected",a.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),a}var iT=ie.S;ie.S=function(t,e){lC=Xn(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&LD(t,e),iT!==null&&iT(t,e)};var li=qa(null);function gy(){var t=li.current;return t!==null?t:$e.pooledCache}function $d(t,e){e===null?tt(li,li.current):tt(li,e.pool)}function Qb(){var t=gy();return t===null?null:{parent:Ft._currentValue,pool:t}}var Uo=Error(V(460)),yy=Error(V(474)),Hf=Error(V(542)),yf={then:function(){}};function oT(t){return t=t.status,t==="fulfilled"||t==="rejected"}function $b(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(br,br),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,lT(t),t;default:if(typeof e.status=="string")e.then(br,br);else{if(t=$e,t!==null&&100<t.shellSuspendCounter)throw Error(V(482));t=e,t.status="pending",t.then(function(a){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=a}},function(a){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=a}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,lT(t),t}throw ci=e,Uo}}function si(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(ci=n,Uo):n}}var ci=null;function uT(){if(ci===null)throw Error(V(459));var t=ci;return ci=null,t}function lT(t){if(t===Uo||t===Hf)throw Error(V(483))}var Eo=null,Rl=0;function Vd(t){var e=Rl;return Rl+=1,Eo===null&&(Eo=[]),$b(Eo,t,e)}function tl(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Fd(t,e){throw e.$$typeof===p1?Error(V(525)):(t=Object.prototype.toString.call(e),Error(V(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function Jb(t){function e(E,v){if(t){var C=E.deletions;C===null?(E.deletions=[v],E.flags|=16):C.push(v)}}function n(E,v){if(!t)return null;for(;v!==null;)e(E,v),v=v.sibling;return null}function a(E){for(var v=new Map;E!==null;)E.key!==null?v.set(E.key,E):v.set(E.index,E),E=E.sibling;return v}function r(E,v){return E=Cr(E,v),E.index=0,E.sibling=null,E}function s(E,v,C){return E.index=C,t?(C=E.alternate,C!==null?(C=C.index,C<v?(E.flags|=67108866,v):C):(E.flags|=67108866,v)):(E.flags|=1048576,v)}function i(E){return t&&E.alternate===null&&(E.flags|=67108866),E}function u(E,v,C,x){return v===null||v.tag!==6?(v=Mm(C,E.mode,x),v.return=E,v):(v=r(v,C),v.return=E,v)}function l(E,v,C,x){var G=C.type;return G===so?f(E,v,C.props.children,x,C.key):v!==null&&(v.elementType===G||typeof G=="object"&&G!==null&&G.$$typeof===fs&&si(G)===v.type)?(v=r(v,C.props),tl(v,C),v.return=E,v):(v=Qd(C.type,C.key,C.props,null,E.mode,x),tl(v,C),v.return=E,v)}function c(E,v,C,x){return v===null||v.tag!==4||v.stateNode.containerInfo!==C.containerInfo||v.stateNode.implementation!==C.implementation?(v=Nm(C,E.mode,x),v.return=E,v):(v=r(v,C.children||[]),v.return=E,v)}function f(E,v,C,x,G){return v===null||v.tag!==7?(v=ui(C,E.mode,x,G),v.return=E,v):(v=r(v,C),v.return=E,v)}function p(E,v,C){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Mm(""+v,E.mode,C),v.return=E,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Ad:return C=Qd(v.type,v.key,v.props,null,E.mode,C),tl(C,v),C.return=E,C;case il:return v=Nm(v,E.mode,C),v.return=E,v;case fs:return v=si(v),p(E,v,C)}if(ol(v)||Zu(v))return v=ui(v,E.mode,C,null),v.return=E,v;if(typeof v.then=="function")return p(E,Vd(v),C);if(v.$$typeof===Tr)return p(E,Nd(E,v),C);Fd(E,v)}return null}function m(E,v,C,x){var G=v!==null?v.key:null;if(typeof C=="string"&&C!==""||typeof C=="number"||typeof C=="bigint")return G!==null?null:u(E,v,""+C,x);if(typeof C=="object"&&C!==null){switch(C.$$typeof){case Ad:return C.key===G?l(E,v,C,x):null;case il:return C.key===G?c(E,v,C,x):null;case fs:return C=si(C),m(E,v,C,x)}if(ol(C)||Zu(C))return G!==null?null:f(E,v,C,x,null);if(typeof C.then=="function")return m(E,v,Vd(C),x);if(C.$$typeof===Tr)return m(E,v,Nd(E,C),x);Fd(E,C)}return null}function S(E,v,C,x,G){if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return E=E.get(C)||null,u(v,E,""+x,G);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Ad:return E=E.get(x.key===null?C:x.key)||null,l(v,E,x,G);case il:return E=E.get(x.key===null?C:x.key)||null,c(v,E,x,G);case fs:return x=si(x),S(E,v,C,x,G)}if(ol(x)||Zu(x))return E=E.get(C)||null,f(v,E,x,G,null);if(typeof x.then=="function")return S(E,v,C,Vd(x),G);if(x.$$typeof===Tr)return S(E,v,C,Nd(v,x),G);Fd(v,x)}return null}function R(E,v,C,x){for(var G=null,z=null,I=v,y=v=0,_=null;I!==null&&y<C.length;y++){I.index>y?(_=I,I=null):_=I.sibling;var b=m(E,I,C[y],x);if(b===null){I===null&&(I=_);break}t&&I&&b.alternate===null&&e(E,I),v=s(b,v,y),z===null?G=b:z.sibling=b,z=b,I=_}if(y===C.length)return n(E,I),Ae&&vr(E,y),G;if(I===null){for(;y<C.length;y++)I=p(E,C[y],x),I!==null&&(v=s(I,v,y),z===null?G=I:z.sibling=I,z=I);return Ae&&vr(E,y),G}for(I=a(I);y<C.length;y++)_=S(I,E,y,C[y],x),_!==null&&(t&&_.alternate!==null&&I.delete(_.key===null?y:_.key),v=s(_,v,y),z===null?G=_:z.sibling=_,z=_);return t&&I.forEach(function(w){return e(E,w)}),Ae&&vr(E,y),G}function D(E,v,C,x){if(C==null)throw Error(V(151));for(var G=null,z=null,I=v,y=v=0,_=null,b=C.next();I!==null&&!b.done;y++,b=C.next()){I.index>y?(_=I,I=null):_=I.sibling;var w=m(E,I,b.value,x);if(w===null){I===null&&(I=_);break}t&&I&&w.alternate===null&&e(E,I),v=s(w,v,y),z===null?G=w:z.sibling=w,z=w,I=_}if(b.done)return n(E,I),Ae&&vr(E,y),G;if(I===null){for(;!b.done;y++,b=C.next())b=p(E,b.value,x),b!==null&&(v=s(b,v,y),z===null?G=b:z.sibling=b,z=b);return Ae&&vr(E,y),G}for(I=a(I);!b.done;y++,b=C.next())b=S(I,E,y,b.value,x),b!==null&&(t&&b.alternate!==null&&I.delete(b.key===null?y:b.key),v=s(b,v,y),z===null?G=b:z.sibling=b,z=b);return t&&I.forEach(function(A){return e(E,A)}),Ae&&vr(E,y),G}function L(E,v,C,x){if(typeof C=="object"&&C!==null&&C.type===so&&C.key===null&&(C=C.props.children),typeof C=="object"&&C!==null){switch(C.$$typeof){case Ad:e:{for(var G=C.key;v!==null;){if(v.key===G){if(G=C.type,G===so){if(v.tag===7){n(E,v.sibling),x=r(v,C.props.children),x.return=E,E=x;break e}}else if(v.elementType===G||typeof G=="object"&&G!==null&&G.$$typeof===fs&&si(G)===v.type){n(E,v.sibling),x=r(v,C.props),tl(x,C),x.return=E,E=x;break e}n(E,v);break}else e(E,v);v=v.sibling}C.type===so?(x=ui(C.props.children,E.mode,x,C.key),x.return=E,E=x):(x=Qd(C.type,C.key,C.props,null,E.mode,x),tl(x,C),x.return=E,E=x)}return i(E);case il:e:{for(G=C.key;v!==null;){if(v.key===G)if(v.tag===4&&v.stateNode.containerInfo===C.containerInfo&&v.stateNode.implementation===C.implementation){n(E,v.sibling),x=r(v,C.children||[]),x.return=E,E=x;break e}else{n(E,v);break}else e(E,v);v=v.sibling}x=Nm(C,E.mode,x),x.return=E,E=x}return i(E);case fs:return C=si(C),L(E,v,C,x)}if(ol(C))return R(E,v,C,x);if(Zu(C)){if(G=Zu(C),typeof G!="function")throw Error(V(150));return C=G.call(C),D(E,v,C,x)}if(typeof C.then=="function")return L(E,v,Vd(C),x);if(C.$$typeof===Tr)return L(E,v,Nd(E,C),x);Fd(E,C)}return typeof C=="string"&&C!==""||typeof C=="number"||typeof C=="bigint"?(C=""+C,v!==null&&v.tag===6?(n(E,v.sibling),x=r(v,C),x.return=E,E=x):(n(E,v),x=Mm(C,E.mode,x),x.return=E,E=x),i(E)):n(E,v)}return function(E,v,C,x){try{Rl=0;var G=L(E,v,C,x);return Eo=null,G}catch(I){if(I===Uo||I===Hf)throw I;var z=Kn(29,I,null,E.mode);return z.lanes=x,z.return=E,z}finally{}}}var pi=Jb(!0),Zb=Jb(!1),hs=!1;function Iy(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function wg(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function ws(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Cs(t,e,n){var a=t.updateQueue;if(a===null)return null;if(a=a.shared,Ue&2){var r=a.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),a.pending=e,e=pf(t),Gb(t,null,n),e}return zf(t,a,e,n),pf(t)}function ml(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,yb(t,n)}}function Fm(t,e){var n=t.updateQueue,a=t.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};s===null?r=s=i:s=s.next=i,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:a.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:a.shared,callbacks:a.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var Cg=!1;function gl(){if(Cg){var t=vo;if(t!==null)throw t}}function yl(t,e,n,a){Cg=!1;var r=t.updateQueue;hs=!1;var s=r.firstBaseUpdate,i=r.lastBaseUpdate,u=r.shared.pending;if(u!==null){r.shared.pending=null;var l=u,c=l.next;l.next=null,i===null?s=c:i.next=c,i=l;var f=t.alternate;f!==null&&(f=f.updateQueue,u=f.lastBaseUpdate,u!==i&&(u===null?f.firstBaseUpdate=c:u.next=c,f.lastBaseUpdate=l))}if(s!==null){var p=r.baseState;i=0,f=c=l=null,u=s;do{var m=u.lane&-536870913,S=m!==u.lane;if(S?(Le&m)===m:(a&m)===m){m!==0&&m===Ao&&(Cg=!0),f!==null&&(f=f.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var R=t,D=u;m=e;var L=n;switch(D.tag){case 1:if(R=D.payload,typeof R=="function"){p=R.call(L,p,m);break e}p=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=D.payload,m=typeof R=="function"?R.call(L,p,m):R,m==null)break e;p=it({},p,m);break e;case 2:hs=!0}}m=u.callback,m!==null&&(t.flags|=64,S&&(t.flags|=8192),S=r.callbacks,S===null?r.callbacks=[m]:S.push(m))}else S={lane:m,tag:u.tag,payload:u.payload,callback:u.callback,next:null},f===null?(c=f=S,l=p):f=f.next=S,i|=m;if(u=u.next,u===null){if(u=r.shared.pending,u===null)break;S=u,u=S.next,S.next=null,r.lastBaseUpdate=S,r.shared.pending=null}}while(!0);f===null&&(l=p),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=f,s===null&&(r.shared.lanes=0),Ms|=i,t.lanes=i,t.memoizedState=p}}function ew(t,e){if(typeof t!="function")throw Error(V(191,t));t.call(e)}function tw(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)ew(n[t],e)}var xo=qa(null),If=qa(0);function cT(t,e){t=Pr,tt(If,t),tt(xo,e),Pr=t|e.baseLanes}function Lg(){tt(If,Pr),tt(xo,xo.current)}function _y(){Pr=If.current,an(xo),an(If)}var Zn=qa(null),da=null;function ms(t){var e=t.alternate;tt(xt,xt.current&1),tt(Zn,t),da===null&&(e===null||xo.current!==null||e.memoizedState!==null)&&(da=t)}function Ag(t){tt(xt,xt.current),tt(Zn,t),da===null&&(da=t)}function nw(t){t.tag===22?(tt(xt,xt.current),tt(Zn,t),da===null&&(da=t)):gs(t)}function gs(){tt(xt,xt.current),tt(Zn,Zn.current)}function jn(t){an(Zn),da===t&&(da=null),an(xt)}var xt=qa(0);function _f(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Wg(n)||Xg(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Rr=0,me=null,We=null,Nt=null,Sf=!1,To=!1,mi=!1,vf=0,kl=0,bo=null,xD=0;function St(){throw Error(V(321))}function Sy(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Jn(t[n],e[n]))return!1;return!0}function vy(t,e,n,a,r,s){return Rr=s,me=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,ie.H=t===null||t.memoizedState===null?Pw:Dy,mi=!1,s=n(a,r),mi=!1,To&&(s=rw(e,n,a,r)),aw(t),s}function aw(t){ie.H=Dl;var e=We!==null&&We.next!==null;if(Rr=0,Nt=We=me=null,Sf=!1,kl=0,bo=null,e)throw Error(V(300));t===null||Ut||(t=t.dependencies,t!==null&&gf(t)&&(Ut=!0))}function rw(t,e,n,a){me=t;var r=0;do{if(To&&(bo=null),kl=0,To=!1,25<=r)throw Error(V(301));if(r+=1,Nt=We=null,t.updateQueue!=null){var s=t.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}ie.H=Ow,s=e(n,a)}while(To);return s}function RD(){var t=ie.H,e=t.useState()[0];return e=typeof e.then=="function"?jl(e):e,t=t.useState()[0],(We!==null?We.memoizedState:null)!==t&&(me.flags|=1024),e}function Ey(){var t=vf!==0;return vf=0,t}function Ty(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function by(t){if(Sf){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}Sf=!1}Rr=0,Nt=We=me=null,To=!1,kl=vf=0,bo=null}function bn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Nt===null?me.memoizedState=Nt=t:Nt=Nt.next=t,Nt}function Rt(){if(We===null){var t=me.alternate;t=t!==null?t.memoizedState:null}else t=We.next;var e=Nt===null?me.memoizedState:Nt.next;if(e!==null)Nt=e,We=t;else{if(t===null)throw me.alternate===null?Error(V(467)):Error(V(310));We=t,t={memoizedState:We.memoizedState,baseState:We.baseState,baseQueue:We.baseQueue,queue:We.queue,next:null},Nt===null?me.memoizedState=Nt=t:Nt=Nt.next=t}return Nt}function Gf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function jl(t){var e=kl;return kl+=1,bo===null&&(bo=[]),t=$b(bo,t,e),e=me,(Nt===null?e.memoizedState:Nt.next)===null&&(e=e.alternate,ie.H=e===null||e.memoizedState===null?Pw:Dy),t}function jf(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return jl(t);if(t.$$typeof===Tr)return pn(t)}throw Error(V(438,String(t)))}function wy(t){var e=null,n=me.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var a=me.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(e={data:a.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Gf(),me.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),a=0;a<t;a++)n[a]=m1;return e.index++,n}function kr(t,e){return typeof e=="function"?e(t):e}function Jd(t){var e=Rt();return Cy(e,We,t)}function Cy(t,e,n){var a=t.queue;if(a===null)throw Error(V(311));a.lastRenderedReducer=n;var r=t.baseQueue,s=a.pending;if(s!==null){if(r!==null){var i=r.next;r.next=s.next,s.next=i}e.baseQueue=r=s,a.pending=null}if(s=t.baseState,r===null)t.memoizedState=s;else{e=r.next;var u=i=null,l=null,c=e,f=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(Le&p)===p:(Rr&p)===p){var m=c.revertLane;if(m===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===Ao&&(f=!0);else if((Rr&m)===m){c=c.next,m===Ao&&(f=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=p,i=s):l=l.next=p,me.lanes|=m,Ms|=m;p=c.action,mi&&n(s,p),s=c.hasEagerState?c.eagerState:n(s,p)}else m={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=m,i=s):l=l.next=m,me.lanes|=p,Ms|=p;c=c.next}while(c!==null&&c!==e);if(l===null?i=s:l.next=u,!Jn(s,t.memoizedState)&&(Ut=!0,f&&(n=vo,n!==null)))throw n;t.memoizedState=s,t.baseState=i,t.baseQueue=l,a.lastRenderedState=s}return r===null&&(a.lanes=0),[t.memoizedState,a.dispatch]}function Um(t){var e=Rt(),n=e.queue;if(n===null)throw Error(V(311));n.lastRenderedReducer=t;var a=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var i=r=r.next;do s=t(s,i.action),i=i.next;while(i!==r);Jn(s,e.memoizedState)||(Ut=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,a]}function sw(t,e,n){var a=me,r=Rt(),s=Ae;if(s){if(n===void 0)throw Error(V(407));n=n()}else n=e();var i=!Jn((We||r).memoizedState,n);if(i&&(r.memoizedState=n,Ut=!0),r=r.queue,Ly(uw.bind(null,a,r,t),[t]),r.getSnapshot!==e||i||Nt!==null&&Nt.memoizedState.tag&1){if(a.flags|=2048,Ro(9,{destroy:void 0},ow.bind(null,a,r,n,e),null),$e===null)throw Error(V(349));s||Rr&127||iw(a,e,n)}return n}function iw(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=me.updateQueue,e===null?(e=Gf(),me.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function ow(t,e,n,a){e.value=n,e.getSnapshot=a,lw(e)&&cw(t)}function uw(t,e,n){return n(function(){lw(e)&&cw(t)})}function lw(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Jn(t,n)}catch{return!0}}function cw(t){var e=Si(t,2);e!==null&&kn(e,t,2)}function xg(t){var e=bn();if(typeof t=="function"){var n=t;if(t=n(),mi){Is(!0);try{n()}finally{Is(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:kr,lastRenderedState:t},e}function dw(t,e,n,a){return t.baseState=n,Cy(t,We,typeof a=="function"?a:kr)}function kD(t,e,n,a,r){if(Wf(t))throw Error(V(485));if(t=e.action,t!==null){var s={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){s.listeners.push(i)}};ie.T!==null?n(!0):s.isTransition=!1,a(s),n=e.pending,n===null?(s.next=e.pending=s,fw(e,s)):(s.next=n.next,e.pending=n.next=s)}}function fw(t,e){var n=e.action,a=e.payload,r=t.state;if(e.isTransition){var s=ie.T,i={};ie.T=i;try{var u=n(r,a),l=ie.S;l!==null&&l(i,u),dT(t,e,u)}catch(c){Rg(t,e,c)}finally{s!==null&&i.types!==null&&(s.types=i.types),ie.T=s}}else try{s=n(r,a),dT(t,e,s)}catch(c){Rg(t,e,c)}}function dT(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){fT(t,e,a)},function(a){return Rg(t,e,a)}):fT(t,e,n)}function fT(t,e,n){e.status="fulfilled",e.value=n,hw(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,fw(t,n)))}function Rg(t,e,n){var a=t.pending;if(t.pending=null,a!==null){a=a.next;do e.status="rejected",e.reason=n,hw(e),e=e.next;while(e!==a)}t.action=null}function hw(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function pw(t,e){return e}function hT(t,e){if(Ae){var n=$e.formState;if(n!==null){e:{var a=me;if(Ae){if(st){t:{for(var r=st,s=ca;r.nodeType!==8;){if(!s){r=null;break t}if(r=fa(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){st=fa(r.nextSibling),a=r.data==="F!";break e}}Ps(a)}a=!1}a&&(e=n[0])}}return n=bn(),n.memoizedState=n.baseState=e,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:pw,lastRenderedState:e},n.queue=a,n=Rw.bind(null,me,a),a.dispatch=n,a=xg(!1),s=ky.bind(null,me,!1,a.queue),a=bn(),r={state:e,dispatch:null,action:t,pending:null},a.queue=r,n=kD.bind(null,me,r,s,n),r.dispatch=n,a.memoizedState=t,[e,n,!1]}function pT(t){var e=Rt();return mw(e,We,t)}function mw(t,e,n){if(e=Cy(t,e,pw)[0],t=Jd(kr)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var a=jl(e)}catch(i){throw i===Uo?Hf:i}else a=e;e=Rt();var r=e.queue,s=r.dispatch;return n!==e.memoizedState&&(me.flags|=2048,Ro(9,{destroy:void 0},DD.bind(null,r,n),null)),[a,s,t]}function DD(t,e){t.action=e}function mT(t){var e=Rt(),n=We;if(n!==null)return mw(e,n,t);Rt(),e=e.memoizedState,n=Rt();var a=n.queue.dispatch;return n.memoizedState=t,[e,a,!1]}function Ro(t,e,n,a){return t={tag:t,create:n,deps:a,inst:e,next:null},e=me.updateQueue,e===null&&(e=Gf(),me.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(a=n.next,n.next=t,t.next=a,e.lastEffect=t),t}function gw(){return Rt().memoizedState}function Zd(t,e,n,a){var r=bn();me.flags|=t,r.memoizedState=Ro(1|e,{destroy:void 0},n,a===void 0?null:a)}function Kf(t,e,n,a){var r=Rt();a=a===void 0?null:a;var s=r.memoizedState.inst;We!==null&&a!==null&&Sy(a,We.memoizedState.deps)?r.memoizedState=Ro(e,s,n,a):(me.flags|=t,r.memoizedState=Ro(1|e,s,n,a))}function gT(t,e){Zd(8390656,8,t,e)}function Ly(t,e){Kf(2048,8,t,e)}function PD(t){me.flags|=4;var e=me.updateQueue;if(e===null)e=Gf(),me.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function yw(t){var e=Rt().memoizedState;return PD({ref:e,nextImpl:t}),function(){if(Ue&2)throw Error(V(440));return e.impl.apply(void 0,arguments)}}function Iw(t,e){return Kf(4,2,t,e)}function _w(t,e){return Kf(4,4,t,e)}function Sw(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function vw(t,e,n){n=n!=null?n.concat([t]):null,Kf(4,4,Sw.bind(null,e,t),n)}function Ay(){}function Ew(t,e){var n=Rt();e=e===void 0?null:e;var a=n.memoizedState;return e!==null&&Sy(e,a[1])?a[0]:(n.memoizedState=[t,e],t)}function Tw(t,e){var n=Rt();e=e===void 0?null:e;var a=n.memoizedState;if(e!==null&&Sy(e,a[1]))return a[0];if(a=t(),mi){Is(!0);try{t()}finally{Is(!1)}}return n.memoizedState=[a,e],a}function xy(t,e,n){return n===void 0||Rr&1073741824&&!(Le&261930)?t.memoizedState=e:(t.memoizedState=n,t=dC(),me.lanes|=t,Ms|=t,n)}function bw(t,e,n,a){return Jn(n,e)?n:xo.current!==null?(t=xy(t,n,a),Jn(t,e)||(Ut=!0),t):!(Rr&42)||Rr&1073741824&&!(Le&261930)?(Ut=!0,t.memoizedState=n):(t=dC(),me.lanes|=t,Ms|=t,e)}function ww(t,e,n,a,r){var s=Be.p;Be.p=s!==0&&8>s?s:8;var i=ie.T,u={};ie.T=u,ky(t,!1,e,n);try{var l=r(),c=ie.S;if(c!==null&&c(u,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=AD(l,a);Il(t,e,f,$n(t))}else Il(t,e,a,$n(t))}catch(p){Il(t,e,{then:function(){},status:"rejected",reason:p},$n())}finally{Be.p=s,i!==null&&u.types!==null&&(i.types=u.types),ie.T=i}}function OD(){}function kg(t,e,n,a){if(t.tag!==5)throw Error(V(476));var r=Cw(t).queue;ww(t,r,e,oi,n===null?OD:function(){return Lw(t),n(a)})}function Cw(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:oi,baseState:oi,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:kr,lastRenderedState:oi},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:kr,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function Lw(t){var e=Cw(t);e.next===null&&(e=t.alternate.memoizedState),Il(t,e.next.queue,{},$n())}function Ry(){return pn(Ml)}function Aw(){return Rt().memoizedState}function xw(){return Rt().memoizedState}function MD(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=$n();t=ws(n);var a=Cs(e,t,n);a!==null&&(kn(a,e,n),ml(a,e,n)),e={cache:my()},t.payload=e;return}e=e.return}}function ND(t,e,n){var a=$n();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Wf(t)?kw(e,n):(n=dy(t,e,n,a),n!==null&&(kn(n,t,a),Dw(n,e,a)))}function Rw(t,e,n){var a=$n();Il(t,e,n,a)}function Il(t,e,n,a){var r={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Wf(t))kw(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var i=e.lastRenderedState,u=s(i,n);if(r.hasEagerState=!0,r.eagerState=u,Jn(u,i))return zf(t,e,r,0),$e===null&&qf(),!1}catch{}finally{}if(n=dy(t,e,r,a),n!==null)return kn(n,t,a),Dw(n,e,a),!0}return!1}function ky(t,e,n,a){if(a={lane:2,revertLane:By(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Wf(t)){if(e)throw Error(V(479))}else e=dy(t,n,a,2),e!==null&&kn(e,t,2)}function Wf(t){var e=t.alternate;return t===me||e!==null&&e===me}function kw(t,e){To=Sf=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Dw(t,e,n){if(n&4194048){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,yb(t,n)}}var Dl={readContext:pn,use:jf,useCallback:St,useContext:St,useEffect:St,useImperativeHandle:St,useLayoutEffect:St,useInsertionEffect:St,useMemo:St,useReducer:St,useRef:St,useState:St,useDebugValue:St,useDeferredValue:St,useTransition:St,useSyncExternalStore:St,useId:St,useHostTransitionStatus:St,useFormState:St,useActionState:St,useOptimistic:St,useMemoCache:St,useCacheRefresh:St};Dl.useEffectEvent=St;var Pw={readContext:pn,use:jf,useCallback:function(t,e){return bn().memoizedState=[t,e===void 0?null:e],t},useContext:pn,useEffect:gT,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,Zd(4194308,4,Sw.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Zd(4194308,4,t,e)},useInsertionEffect:function(t,e){Zd(4,2,t,e)},useMemo:function(t,e){var n=bn();e=e===void 0?null:e;var a=t();if(mi){Is(!0);try{t()}finally{Is(!1)}}return n.memoizedState=[a,e],a},useReducer:function(t,e,n){var a=bn();if(n!==void 0){var r=n(e);if(mi){Is(!0);try{n(e)}finally{Is(!1)}}}else r=e;return a.memoizedState=a.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},a.queue=t,t=t.dispatch=ND.bind(null,me,t),[a.memoizedState,t]},useRef:function(t){var e=bn();return t={current:t},e.memoizedState=t},useState:function(t){t=xg(t);var e=t.queue,n=Rw.bind(null,me,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Ay,useDeferredValue:function(t,e){var n=bn();return xy(n,t,e)},useTransition:function(){var t=xg(!1);return t=ww.bind(null,me,t.queue,!0,!1),bn().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var a=me,r=bn();if(Ae){if(n===void 0)throw Error(V(407));n=n()}else{if(n=e(),$e===null)throw Error(V(349));Le&127||iw(a,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,gT(uw.bind(null,a,s,t),[t]),a.flags|=2048,Ro(9,{destroy:void 0},ow.bind(null,a,s,n,e),null),n},useId:function(){var t=bn(),e=$e.identifierPrefix;if(Ae){var n=Fa,a=Va;n=(a&~(1<<32-Qn(a)-1)).toString(32)+n,e="_"+e+"R_"+n,n=vf++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=xD++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Ry,useFormState:hT,useActionState:hT,useOptimistic:function(t){var e=bn();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=ky.bind(null,me,!0,n),n.dispatch=e,[t,e]},useMemoCache:wy,useCacheRefresh:function(){return bn().memoizedState=MD.bind(null,me)},useEffectEvent:function(t){var e=bn(),n={impl:t};return e.memoizedState=n,function(){if(Ue&2)throw Error(V(440));return n.impl.apply(void 0,arguments)}}},Dy={readContext:pn,use:jf,useCallback:Ew,useContext:pn,useEffect:Ly,useImperativeHandle:vw,useInsertionEffect:Iw,useLayoutEffect:_w,useMemo:Tw,useReducer:Jd,useRef:gw,useState:function(){return Jd(kr)},useDebugValue:Ay,useDeferredValue:function(t,e){var n=Rt();return bw(n,We.memoizedState,t,e)},useTransition:function(){var t=Jd(kr)[0],e=Rt().memoizedState;return[typeof t=="boolean"?t:jl(t),e]},useSyncExternalStore:sw,useId:Aw,useHostTransitionStatus:Ry,useFormState:pT,useActionState:pT,useOptimistic:function(t,e){var n=Rt();return dw(n,We,t,e)},useMemoCache:wy,useCacheRefresh:xw};Dy.useEffectEvent=yw;var Ow={readContext:pn,use:jf,useCallback:Ew,useContext:pn,useEffect:Ly,useImperativeHandle:vw,useInsertionEffect:Iw,useLayoutEffect:_w,useMemo:Tw,useReducer:Um,useRef:gw,useState:function(){return Um(kr)},useDebugValue:Ay,useDeferredValue:function(t,e){var n=Rt();return We===null?xy(n,t,e):bw(n,We.memoizedState,t,e)},useTransition:function(){var t=Um(kr)[0],e=Rt().memoizedState;return[typeof t=="boolean"?t:jl(t),e]},useSyncExternalStore:sw,useId:Aw,useHostTransitionStatus:Ry,useFormState:mT,useActionState:mT,useOptimistic:function(t,e){var n=Rt();return We!==null?dw(n,We,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:wy,useCacheRefresh:xw};Ow.useEffectEvent=yw;function Bm(t,e,n,a){e=t.memoizedState,n=n(a,e),n=n==null?e:it({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Dg={enqueueSetState:function(t,e,n){t=t._reactInternals;var a=$n(),r=ws(a);r.payload=e,n!=null&&(r.callback=n),e=Cs(t,r,a),e!==null&&(kn(e,t,a),ml(e,t,a))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var a=$n(),r=ws(a);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=Cs(t,r,a),e!==null&&(kn(e,t,a),ml(e,t,a))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=$n(),a=ws(n);a.tag=2,e!=null&&(a.callback=e),e=Cs(t,a,n),e!==null&&(kn(e,t,n),ml(e,t,n))}};function yT(t,e,n,a,r,s,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(a,s,i):e.prototype&&e.prototype.isPureReactComponent?!Ll(n,a)||!Ll(r,s):!0}function IT(t,e,n,a){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,a),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,a),e.state!==t&&Dg.enqueueReplaceState(e,e.state,null)}function gi(t,e){var n=e;if("ref"in e){n={};for(var a in e)a!=="ref"&&(n[a]=e[a])}if(t=t.defaultProps){n===e&&(n=it({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function Mw(t){hf(t)}function Nw(t){console.error(t)}function Vw(t){hf(t)}function Ef(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(a){setTimeout(function(){throw a})}}function _T(t,e,n){try{var a=t.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Pg(t,e,n){return n=ws(n),n.tag=3,n.payload={element:null},n.callback=function(){Ef(t,e)},n}function Fw(t){return t=ws(t),t.tag=3,t}function Uw(t,e,n,a){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var s=a.value;t.payload=function(){return r(s)},t.callback=function(){_T(e,n,a)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){_T(e,n,a),typeof r!="function"&&(Ls===null?Ls=new Set([this]):Ls.add(this));var u=a.stack;this.componentDidCatch(a.value,{componentStack:u!==null?u:""})})}function VD(t,e,n,a,r){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(e=n.alternate,e!==null&&Fo(e,n,r,!0),n=Zn.current,n!==null){switch(n.tag){case 31:case 13:return da===null?Lf():n.alternate===null&&vt===0&&(vt=3),n.flags&=-257,n.flags|=65536,n.lanes=r,a===yf?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([a]):e.add(a),$m(t,a,r)),!1;case 22:return n.flags|=65536,a===yf?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([a]):n.add(a)),$m(t,a,r)),!1}throw Error(V(435,n.tag))}return $m(t,a,r),Lf(),!1}if(Ae)return e=Zn.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,a!==Sg&&(t=Error(V(422),{cause:a}),xl(la(t,n)))):(a!==Sg&&(e=Error(V(423),{cause:a}),xl(la(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,a=la(a,n),r=Pg(t.stateNode,a,r),Fm(t,r),vt!==4&&(vt=2)),!1;var s=Error(V(520),{cause:a});if(s=la(s,n),vl===null?vl=[s]:vl.push(s),vt!==4&&(vt=2),e===null)return!0;a=la(a,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=Pg(n.stateNode,a,t),Fm(n,t),!1;case 1:if(e=n.type,s=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(Ls===null||!Ls.has(s))))return n.flags|=65536,r&=-r,n.lanes|=r,r=Fw(r),Uw(r,t,n,a),Fm(n,r),!1}n=n.return}while(n!==null);return!1}var Py=Error(V(461)),Ut=!1;function dn(t,e,n,a){e.child=t===null?Zb(e,null,n,a):pi(e,t.child,n,a)}function ST(t,e,n,a,r){n=n.render;var s=e.ref;if("ref"in a){var i={};for(var u in a)u!=="ref"&&(i[u]=a[u])}else i=a;return hi(e),a=vy(t,e,n,i,s,r),u=Ey(),t!==null&&!Ut?(Ty(t,e,r),Dr(t,e,r)):(Ae&&u&&hy(e),e.flags|=1,dn(t,e,a,r),e.child)}function vT(t,e,n,a,r){if(t===null){var s=n.type;return typeof s=="function"&&!fy(s)&&s.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=s,Bw(t,e,s,a,r)):(t=Qd(n.type,null,a,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!Oy(t,r)){var i=s.memoizedProps;if(n=n.compare,n=n!==null?n:Ll,n(i,a)&&t.ref===e.ref)return Dr(t,e,r)}return e.flags|=1,t=Cr(s,a),t.ref=e.ref,t.return=e,e.child=t}function Bw(t,e,n,a,r){if(t!==null){var s=t.memoizedProps;if(Ll(s,a)&&t.ref===e.ref)if(Ut=!1,e.pendingProps=a=s,Oy(t,r))t.flags&131072&&(Ut=!0);else return e.lanes=t.lanes,Dr(t,e,r)}return Og(t,e,n,a,r)}function qw(t,e,n,a){var r=a.children,s=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(e.flags&128){if(s=s!==null?s.baseLanes|n:n,t!==null){for(a=e.child=t.child,r=0;a!==null;)r=r|a.lanes|a.childLanes,a=a.sibling;a=r&~s}else a=0,e.child=null;return ET(t,e,s,n,a)}if(n&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&$d(e,s!==null?s.cachePool:null),s!==null?cT(e,s):Lg(),nw(e);else return a=e.lanes=536870912,ET(t,e,s!==null?s.baseLanes|n:n,n,a)}else s!==null?($d(e,s.cachePool),cT(e,s),gs(e),e.memoizedState=null):(t!==null&&$d(e,null),Lg(),gs(e));return dn(t,e,r,n),e.child}function ll(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function ET(t,e,n,a,r){var s=gy();return s=s===null?null:{parent:Ft._currentValue,pool:s},e.memoizedState={baseLanes:n,cachePool:s},t!==null&&$d(e,null),Lg(),nw(e),t!==null&&Fo(t,e,a,!0),e.childLanes=r,null}function ef(t,e){return e=Tf({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function TT(t,e,n){return pi(e,t.child,null,n),t=ef(e,e.pendingProps),t.flags|=2,jn(e),e.memoizedState=null,t}function FD(t,e,n){var a=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(Ae){if(a.mode==="hidden")return t=ef(e,a),e.lanes=536870912,ll(null,t);if(Ag(e),(t=st)?(t=PC(t,ca),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ds!==null?{id:Va,overflow:Fa}:null,retryLane:536870912,hydrationErrors:null},n=Kb(t),n.return=e,e.child=n,hn=e,st=null)):t=null,t===null)throw Ps(e);return e.lanes=536870912,null}return ef(e,a)}var s=t.memoizedState;if(s!==null){var i=s.dehydrated;if(Ag(e),r)if(e.flags&256)e.flags&=-257,e=TT(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(V(558));else if(Ut||Fo(t,e,n,!1),r=(n&t.childLanes)!==0,Ut||r){if(a=$e,a!==null&&(i=Ib(a,n),i!==0&&i!==s.retryLane))throw s.retryLane=i,Si(t,i),kn(a,t,i),Py;Lf(),e=TT(t,e,n)}else t=s.treeContext,st=fa(i.nextSibling),hn=e,Ae=!0,bs=null,ca=!1,t!==null&&Xb(e,t),e=ef(e,a),e.flags|=4096;return e}return t=Cr(t.child,{mode:a.mode,children:a.children}),t.ref=e.ref,e.child=t,t.return=e,t}function tf(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(V(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Og(t,e,n,a,r){return hi(e),n=vy(t,e,n,a,void 0,r),a=Ey(),t!==null&&!Ut?(Ty(t,e,r),Dr(t,e,r)):(Ae&&a&&hy(e),e.flags|=1,dn(t,e,n,r),e.child)}function bT(t,e,n,a,r,s){return hi(e),e.updateQueue=null,n=rw(e,a,n,r),aw(t),a=Ey(),t!==null&&!Ut?(Ty(t,e,s),Dr(t,e,s)):(Ae&&a&&hy(e),e.flags|=1,dn(t,e,n,s),e.child)}function wT(t,e,n,a,r){if(hi(e),e.stateNode===null){var s=po,i=n.contextType;typeof i=="object"&&i!==null&&(s=pn(i)),s=new n(a,s),e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Dg,e.stateNode=s,s._reactInternals=e,s=e.stateNode,s.props=a,s.state=e.memoizedState,s.refs={},Iy(e),i=n.contextType,s.context=typeof i=="object"&&i!==null?pn(i):po,s.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(Bm(e,n,i,a),s.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(i=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),i!==s.state&&Dg.enqueueReplaceState(s,s.state,null),yl(e,a,s,r),gl(),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!0}else if(t===null){s=e.stateNode;var u=e.memoizedProps,l=gi(n,u);s.props=l;var c=s.context,f=n.contextType;i=po,typeof f=="object"&&f!==null&&(i=pn(f));var p=n.getDerivedStateFromProps;f=typeof p=="function"||typeof s.getSnapshotBeforeUpdate=="function",u=e.pendingProps!==u,f||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u||c!==i)&&IT(e,s,a,i),hs=!1;var m=e.memoizedState;s.state=m,yl(e,a,s,r),gl(),c=e.memoizedState,u||m!==c||hs?(typeof p=="function"&&(Bm(e,n,p,a),c=e.memoizedState),(l=hs||yT(e,n,l,a,m,c,i))?(f||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(e.flags|=4194308)):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=a,e.memoizedState=c),s.props=a,s.state=c,s.context=i,a=l):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!1)}else{s=e.stateNode,wg(t,e),i=e.memoizedProps,f=gi(n,i),s.props=f,p=e.pendingProps,m=s.context,c=n.contextType,l=po,typeof c=="object"&&c!==null&&(l=pn(c)),u=n.getDerivedStateFromProps,(c=typeof u=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(i!==p||m!==l)&&IT(e,s,a,l),hs=!1,m=e.memoizedState,s.state=m,yl(e,a,s,r),gl();var S=e.memoizedState;i!==p||m!==S||hs||t!==null&&t.dependencies!==null&&gf(t.dependencies)?(typeof u=="function"&&(Bm(e,n,u,a),S=e.memoizedState),(f=hs||yT(e,n,f,a,m,S,l)||t!==null&&t.dependencies!==null&&gf(t.dependencies))?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(a,S,l),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(a,S,l)),typeof s.componentDidUpdate=="function"&&(e.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=a,e.memoizedState=S),s.props=a,s.state=S,s.context=l,a=f):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),a=!1)}return s=a,tf(t,e),a=(e.flags&128)!==0,s||a?(s=e.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:s.render(),e.flags|=1,t!==null&&a?(e.child=pi(e,t.child,null,r),e.child=pi(e,null,n,r)):dn(t,e,n,r),e.memoizedState=s.state,t=e.child):t=Dr(t,e,r),t}function CT(t,e,n,a){return fi(),e.flags|=256,dn(t,e,n,a),e.child}var qm={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function zm(t){return{baseLanes:t,cachePool:Qb()}}function Hm(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=Wn),t}function zw(t,e,n){var a=e.pendingProps,r=!1,s=(e.flags&128)!==0,i;if((i=s)||(i=t!==null&&t.memoizedState===null?!1:(xt.current&2)!==0),i&&(r=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(Ae){if(r?ms(e):gs(e),(t=st)?(t=PC(t,ca),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ds!==null?{id:Va,overflow:Fa}:null,retryLane:536870912,hydrationErrors:null},n=Kb(t),n.return=e,e.child=n,hn=e,st=null)):t=null,t===null)throw Ps(e);return Xg(t)?e.lanes=32:e.lanes=536870912,null}var u=a.children;return a=a.fallback,r?(gs(e),r=e.mode,u=Tf({mode:"hidden",children:u},r),a=ui(a,r,n,null),u.return=e,a.return=e,u.sibling=a,e.child=u,a=e.child,a.memoizedState=zm(n),a.childLanes=Hm(t,i,n),e.memoizedState=qm,ll(null,a)):(ms(e),Mg(e,u))}var l=t.memoizedState;if(l!==null&&(u=l.dehydrated,u!==null)){if(s)e.flags&256?(ms(e),e.flags&=-257,e=Gm(t,e,n)):e.memoizedState!==null?(gs(e),e.child=t.child,e.flags|=128,e=null):(gs(e),u=a.fallback,r=e.mode,a=Tf({mode:"visible",children:a.children},r),u=ui(u,r,n,null),u.flags|=2,a.return=e,u.return=e,a.sibling=u,e.child=a,pi(e,t.child,null,n),a=e.child,a.memoizedState=zm(n),a.childLanes=Hm(t,i,n),e.memoizedState=qm,e=ll(null,a));else if(ms(e),Xg(u)){if(i=u.nextSibling&&u.nextSibling.dataset,i)var c=i.dgst;i=c,a=Error(V(419)),a.stack="",a.digest=i,xl({value:a,source:null,stack:null}),e=Gm(t,e,n)}else if(Ut||Fo(t,e,n,!1),i=(n&t.childLanes)!==0,Ut||i){if(i=$e,i!==null&&(a=Ib(i,n),a!==0&&a!==l.retryLane))throw l.retryLane=a,Si(t,a),kn(i,t,a),Py;Wg(u)||Lf(),e=Gm(t,e,n)}else Wg(u)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,st=fa(u.nextSibling),hn=e,Ae=!0,bs=null,ca=!1,t!==null&&Xb(e,t),e=Mg(e,a.children),e.flags|=4096);return e}return r?(gs(e),u=a.fallback,r=e.mode,l=t.child,c=l.sibling,a=Cr(l,{mode:"hidden",children:a.children}),a.subtreeFlags=l.subtreeFlags&65011712,c!==null?u=Cr(c,u):(u=ui(u,r,n,null),u.flags|=2),u.return=e,a.return=e,a.sibling=u,e.child=a,ll(null,a),a=e.child,u=t.child.memoizedState,u===null?u=zm(n):(r=u.cachePool,r!==null?(l=Ft._currentValue,r=r.parent!==l?{parent:l,pool:l}:r):r=Qb(),u={baseLanes:u.baseLanes|n,cachePool:r}),a.memoizedState=u,a.childLanes=Hm(t,i,n),e.memoizedState=qm,ll(t.child,a)):(ms(e),n=t.child,t=n.sibling,n=Cr(n,{mode:"visible",children:a.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function Mg(t,e){return e=Tf({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Tf(t,e){return t=Kn(22,t,null,e),t.lanes=0,t}function Gm(t,e,n){return pi(e,t.child,null,n),t=Mg(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function LT(t,e,n){t.lanes|=e;var a=t.alternate;a!==null&&(a.lanes|=e),Eg(t.return,e,n)}function jm(t,e,n,a,r,s){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:r,treeForkCount:s}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=a,i.tail=n,i.tailMode=r,i.treeForkCount=s)}function Hw(t,e,n){var a=e.pendingProps,r=a.revealOrder,s=a.tail;a=a.children;var i=xt.current,u=(i&2)!==0;if(u?(i=i&1|2,e.flags|=128):i&=1,tt(xt,i),dn(t,e,a,n),a=Ae?Al:0,!u&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&LT(t,n,e);else if(t.tag===19)LT(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&_f(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),jm(e,!1,r,n,s,a);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&_f(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}jm(e,!0,n,null,s,a);break;case"together":jm(e,!1,null,null,void 0,a);break;default:e.memoizedState=null}return e.child}function Dr(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Ms|=e.lanes,!(n&e.childLanes))if(t!==null){if(Fo(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(V(153));if(e.child!==null){for(t=e.child,n=Cr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Cr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Oy(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&gf(t)))}function UD(t,e,n){switch(e.tag){case 3:lf(e,e.stateNode.containerInfo),ps(e,Ft,t.memoizedState.cache),fi();break;case 27:case 5:lg(e);break;case 4:lf(e,e.stateNode.containerInfo);break;case 10:ps(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Ag(e),null;break;case 13:var a=e.memoizedState;if(a!==null)return a.dehydrated!==null?(ms(e),e.flags|=128,null):n&e.child.childLanes?zw(t,e,n):(ms(e),t=Dr(t,e,n),t!==null?t.sibling:null);ms(e);break;case 19:var r=(t.flags&128)!==0;if(a=(n&e.childLanes)!==0,a||(Fo(t,e,n,!1),a=(n&e.childLanes)!==0),r){if(a)return Hw(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),tt(xt,xt.current),a)break;return null;case 22:return e.lanes=0,qw(t,e,n,e.pendingProps);case 24:ps(e,Ft,t.memoizedState.cache)}return Dr(t,e,n)}function Gw(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)Ut=!0;else{if(!Oy(t,n)&&!(e.flags&128))return Ut=!1,UD(t,e,n);Ut=!!(t.flags&131072)}else Ut=!1,Ae&&e.flags&1048576&&Wb(e,Al,e.index);switch(e.lanes=0,e.tag){case 16:e:{var a=e.pendingProps;if(t=si(e.elementType),e.type=t,typeof t=="function")fy(t)?(a=gi(t,a),e.tag=1,e=wT(null,e,t,a,n)):(e.tag=0,e=Og(null,e,t,a,n));else{if(t!=null){var r=t.$$typeof;if(r===Jg){e.tag=11,e=ST(null,e,t,a,n);break e}else if(r===Zg){e.tag=14,e=vT(null,e,t,a,n);break e}}throw e=og(t)||t,Error(V(306,e,""))}}return e;case 0:return Og(t,e,e.type,e.pendingProps,n);case 1:return a=e.type,r=gi(a,e.pendingProps),wT(t,e,a,r,n);case 3:e:{if(lf(e,e.stateNode.containerInfo),t===null)throw Error(V(387));a=e.pendingProps;var s=e.memoizedState;r=s.element,wg(t,e),yl(e,a,null,n);var i=e.memoizedState;if(a=i.cache,ps(e,Ft,a),a!==s.cache&&Tg(e,[Ft],n,!0),gl(),a=i.element,s.isDehydrated)if(s={element:a,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){e=CT(t,e,a,n);break e}else if(a!==r){r=la(Error(V(424)),e),xl(r),e=CT(t,e,a,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(st=fa(t.firstChild),hn=e,Ae=!0,bs=null,ca=!0,n=Zb(e,null,a,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(fi(),a===r){e=Dr(t,e,n);break e}dn(t,e,a,n)}e=e.child}return e;case 26:return tf(t,e),t===null?(n=YT(e.type,null,e.pendingProps,null))?e.memoizedState=n:Ae||(n=e.type,t=e.pendingProps,a=kf(Ts.current).createElement(n),a[fn]=e,a[Dn]=t,mn(a,n,t),nn(a),e.stateNode=a):e.memoizedState=YT(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return lg(e),t===null&&Ae&&(a=e.stateNode=OC(e.type,e.pendingProps,Ts.current),hn=e,ca=!0,r=st,Vs(e.type)?(Yg=r,st=fa(a.firstChild)):st=r),dn(t,e,e.pendingProps.children,n),tf(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&Ae&&((r=a=st)&&(a=hP(a,e.type,e.pendingProps,ca),a!==null?(e.stateNode=a,hn=e,st=fa(a.firstChild),ca=!1,r=!0):r=!1),r||Ps(e)),lg(e),r=e.type,s=e.pendingProps,i=t!==null?t.memoizedProps:null,a=s.children,jg(r,s)?a=null:i!==null&&jg(r,i)&&(e.flags|=32),e.memoizedState!==null&&(r=vy(t,e,RD,null,null,n),Ml._currentValue=r),tf(t,e),dn(t,e,a,n),e.child;case 6:return t===null&&Ae&&((t=n=st)&&(n=pP(n,e.pendingProps,ca),n!==null?(e.stateNode=n,hn=e,st=null,t=!0):t=!1),t||Ps(e)),null;case 13:return zw(t,e,n);case 4:return lf(e,e.stateNode.containerInfo),a=e.pendingProps,t===null?e.child=pi(e,null,a,n):dn(t,e,a,n),e.child;case 11:return ST(t,e,e.type,e.pendingProps,n);case 7:return dn(t,e,e.pendingProps,n),e.child;case 8:return dn(t,e,e.pendingProps.children,n),e.child;case 12:return dn(t,e,e.pendingProps.children,n),e.child;case 10:return a=e.pendingProps,ps(e,e.type,a.value),dn(t,e,a.children,n),e.child;case 9:return r=e.type._context,a=e.pendingProps.children,hi(e),r=pn(r),a=a(r),e.flags|=1,dn(t,e,a,n),e.child;case 14:return vT(t,e,e.type,e.pendingProps,n);case 15:return Bw(t,e,e.type,e.pendingProps,n);case 19:return Hw(t,e,n);case 31:return FD(t,e,n);case 22:return qw(t,e,n,e.pendingProps);case 24:return hi(e),a=pn(Ft),t===null?(r=gy(),r===null&&(r=$e,s=my(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=n),r=s),e.memoizedState={parent:a,cache:r},Iy(e),ps(e,Ft,r)):(t.lanes&n&&(wg(t,e),yl(e,null,null,n),gl()),r=t.memoizedState,s=e.memoizedState,r.parent!==a?(r={parent:a,cache:a},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),ps(e,Ft,a)):(a=s.cache,ps(e,Ft,a),a!==r.cache&&Tg(e,[Ft],n,!0))),dn(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(V(156,e.tag))}function yr(t){t.flags|=4}function Km(t,e,n,a,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(pC())t.flags|=8192;else throw ci=yf,yy}else t.flags&=-16777217}function AT(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!VC(e))if(pC())t.flags|=8192;else throw ci=yf,yy}function Ud(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?mb():536870912,t.lanes|=e,ko|=e)}function nl(t,e){if(!Ae)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:a.sibling=null}}function rt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,a=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags&65011712,a|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags,a|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=a,t.childLanes=n,e}function BD(t,e,n){var a=e.pendingProps;switch(py(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return rt(e),null;case 1:return rt(e),null;case 3:return n=e.stateNode,a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),Lr(Ft),wo(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(to(e)?yr(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Vm())),rt(e),null;case 26:var r=e.type,s=e.memoizedState;return t===null?(yr(e),s!==null?(rt(e),AT(e,s)):(rt(e),Km(e,r,null,a,n))):s?s!==t.memoizedState?(yr(e),rt(e),AT(e,s)):(rt(e),e.flags&=-16777217):(t=t.memoizedProps,t!==a&&yr(e),rt(e),Km(e,r,t,a,n)),null;case 27:if(cf(e),n=Ts.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&yr(e);else{if(!a){if(e.stateNode===null)throw Error(V(166));return rt(e),null}t=Ba.current,to(e)?aT(e,t):(t=OC(r,a,n),e.stateNode=t,yr(e))}return rt(e),null;case 5:if(cf(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&yr(e);else{if(!a){if(e.stateNode===null)throw Error(V(166));return rt(e),null}if(s=Ba.current,to(e))aT(e,s);else{var i=kf(Ts.current);switch(s){case 1:s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=i.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof a.is=="string"?i.createElement("select",{is:a.is}):i.createElement("select"),a.multiple?s.multiple=!0:a.size&&(s.size=a.size);break;default:s=typeof a.is=="string"?i.createElement(r,{is:a.is}):i.createElement(r)}}s[fn]=e,s[Dn]=a;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)s.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=s;e:switch(mn(s,r,a),r){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&yr(e)}}return rt(e),Km(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==a&&yr(e);else{if(typeof a!="string"&&e.stateNode===null)throw Error(V(166));if(t=Ts.current,to(e)){if(t=e.stateNode,n=e.memoizedProps,a=null,r=hn,r!==null)switch(r.tag){case 27:case 5:a=r.memoizedProps}t[fn]=e,t=!!(t.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||RC(t.nodeValue,n)),t||Ps(e,!0)}else t=kf(t).createTextNode(a),t[fn]=e,e.stateNode=t}return rt(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(a=to(e),n!==null){if(t===null){if(!a)throw Error(V(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(557));t[fn]=e}else fi(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;rt(e),t=!1}else n=Vm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(jn(e),e):(jn(e),null);if(e.flags&128)throw Error(V(558))}return rt(e),null;case 13:if(a=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=to(e),a!==null&&a.dehydrated!==null){if(t===null){if(!r)throw Error(V(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(V(317));r[fn]=e}else fi(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;rt(e),r=!1}else r=Vm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(jn(e),e):(jn(e),null)}return jn(e),e.flags&128?(e.lanes=n,e):(n=a!==null,t=t!==null&&t.memoizedState!==null,n&&(a=e.child,r=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(r=a.alternate.memoizedState.cachePool.pool),s=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(s=a.memoizedState.cachePool.pool),s!==r&&(a.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Ud(e,e.updateQueue),rt(e),null);case 4:return wo(),t===null&&qy(e.stateNode.containerInfo),rt(e),null;case 10:return Lr(e.type),rt(e),null;case 19:if(an(xt),a=e.memoizedState,a===null)return rt(e),null;if(r=(e.flags&128)!==0,s=a.rendering,s===null)if(r)nl(a,!1);else{if(vt!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(s=_f(t),s!==null){for(e.flags|=128,nl(a,!1),t=s.updateQueue,e.updateQueue=t,Ud(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)jb(n,t),n=n.sibling;return tt(xt,xt.current&1|2),Ae&&vr(e,a.treeForkCount),e.child}t=t.sibling}a.tail!==null&&Xn()>wf&&(e.flags|=128,r=!0,nl(a,!1),e.lanes=4194304)}else{if(!r)if(t=_f(s),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Ud(e,t),nl(a,!0),a.tail===null&&a.tailMode==="hidden"&&!s.alternate&&!Ae)return rt(e),null}else 2*Xn()-a.renderingStartTime>wf&&n!==536870912&&(e.flags|=128,r=!0,nl(a,!1),e.lanes=4194304);a.isBackwards?(s.sibling=e.child,e.child=s):(t=a.last,t!==null?t.sibling=s:e.child=s,a.last=s)}return a.tail!==null?(t=a.tail,a.rendering=t,a.tail=t.sibling,a.renderingStartTime=Xn(),t.sibling=null,n=xt.current,tt(xt,r?n&1|2:n&1),Ae&&vr(e,a.treeForkCount),t):(rt(e),null);case 22:case 23:return jn(e),_y(),a=e.memoizedState!==null,t!==null?t.memoizedState!==null!==a&&(e.flags|=8192):a&&(e.flags|=8192),a?n&536870912&&!(e.flags&128)&&(rt(e),e.subtreeFlags&6&&(e.flags|=8192)):rt(e),n=e.updateQueue,n!==null&&Ud(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),a=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),a!==n&&(e.flags|=2048),t!==null&&an(li),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),Lr(Ft),rt(e),null;case 25:return null;case 30:return null}throw Error(V(156,e.tag))}function qD(t,e){switch(py(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Lr(Ft),wo(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return cf(e),null;case 31:if(e.memoizedState!==null){if(jn(e),e.alternate===null)throw Error(V(340));fi()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(jn(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(V(340));fi()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return an(xt),null;case 4:return wo(),null;case 10:return Lr(e.type),null;case 22:case 23:return jn(e),_y(),t!==null&&an(li),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Lr(Ft),null;case 25:return null;default:return null}}function jw(t,e){switch(py(e),e.tag){case 3:Lr(Ft),wo();break;case 26:case 27:case 5:cf(e);break;case 4:wo();break;case 31:e.memoizedState!==null&&jn(e);break;case 13:jn(e);break;case 19:an(xt);break;case 10:Lr(e.type);break;case 22:case 23:jn(e),_y(),t!==null&&an(li);break;case 24:Lr(Ft)}}function Kl(t,e){try{var n=e.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var r=a.next;n=r;do{if((n.tag&t)===t){a=void 0;var s=n.create,i=n.inst;a=s(),i.destroy=a}n=n.next}while(n!==r)}}catch(u){Ge(e,e.return,u)}}function Os(t,e,n){try{var a=e.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var s=r.next;a=s;do{if((a.tag&t)===t){var i=a.inst,u=i.destroy;if(u!==void 0){i.destroy=void 0,r=e;var l=n,c=u;try{c()}catch(f){Ge(r,l,f)}}}a=a.next}while(a!==s)}}catch(f){Ge(e,e.return,f)}}function Kw(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{tw(e,n)}catch(a){Ge(t,t.return,a)}}}function Ww(t,e,n){n.props=gi(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(a){Ge(t,e,a)}}function _l(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var a=t.stateNode;break;case 30:a=t.stateNode;break;default:a=t.stateNode}typeof n=="function"?t.refCleanup=n(a):n.current=a}}catch(r){Ge(t,e,r)}}function Ua(t,e){var n=t.ref,a=t.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(r){Ge(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){Ge(t,e,r)}else n.current=null}function Xw(t){var e=t.type,n=t.memoizedProps,a=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(r){Ge(t,t.return,r)}}function Wm(t,e,n){try{var a=t.stateNode;oP(a,t.type,n,e),a[Dn]=e}catch(r){Ge(t,t.return,r)}}function Yw(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Vs(t.type)||t.tag===4}function Xm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Yw(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Vs(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Ng(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=br));else if(a!==4&&(a===27&&Vs(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(Ng(t,e,n),t=t.sibling;t!==null;)Ng(t,e,n),t=t.sibling}function bf(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(a!==4&&(a===27&&Vs(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(bf(t,e,n),t=t.sibling;t!==null;)bf(t,e,n),t=t.sibling}function Qw(t){var e=t.stateNode,n=t.memoizedProps;try{for(var a=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);mn(e,a,n),e[fn]=t,e[Dn]=n}catch(s){Ge(t,t.return,s)}}var Er=!1,Vt=!1,Ym=!1,xT=typeof WeakSet=="function"?WeakSet:Set,tn=null;function zD(t,e){if(t=t.containerInfo,Hg=Mf,t=Vb(t),ly(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var a=n.getSelection&&n.getSelection();if(a&&a.rangeCount!==0){n=a.anchorNode;var r=a.anchorOffset,s=a.focusNode;a=a.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var i=0,u=-1,l=-1,c=0,f=0,p=t,m=null;t:for(;;){for(var S;p!==n||r!==0&&p.nodeType!==3||(u=i+r),p!==s||a!==0&&p.nodeType!==3||(l=i+a),p.nodeType===3&&(i+=p.nodeValue.length),(S=p.firstChild)!==null;)m=p,p=S;for(;;){if(p===t)break t;if(m===n&&++c===r&&(u=i),m===s&&++f===a&&(l=i),(S=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=S}n=u===-1||l===-1?null:{start:u,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Gg={focusedElem:t,selectionRange:n},Mf=!1,tn=e;tn!==null;)if(e=tn,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,tn=t;else for(;tn!==null;){switch(e=tn,s=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&s!==null){t=void 0,n=e,r=s.memoizedProps,s=s.memoizedState,a=n.stateNode;try{var R=gi(n.type,r);t=a.getSnapshotBeforeUpdate(R,s),a.__reactInternalSnapshotBeforeUpdate=t}catch(D){Ge(n,n.return,D)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Kg(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Kg(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(V(163))}if(t=e.sibling,t!==null){t.return=e.return,tn=t;break}tn=e.return}}function $w(t,e,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:_r(t,n),a&4&&Kl(5,n);break;case 1:if(_r(t,n),a&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){Ge(n,n.return,i)}else{var r=gi(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){Ge(n,n.return,i)}}a&64&&Kw(n),a&512&&_l(n,n.return);break;case 3:if(_r(t,n),a&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{tw(t,e)}catch(i){Ge(n,n.return,i)}}break;case 27:e===null&&a&4&&Qw(n);case 26:case 5:_r(t,n),e===null&&a&4&&Xw(n),a&512&&_l(n,n.return);break;case 12:_r(t,n);break;case 31:_r(t,n),a&4&&eC(t,n);break;case 13:_r(t,n),a&4&&tC(t,n),a&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=$D.bind(null,n),mP(t,n))));break;case 22:if(a=n.memoizedState!==null||Er,!a){e=e!==null&&e.memoizedState!==null||Vt,r=Er;var s=Vt;Er=a,(Vt=e)&&!s?Sr(t,n,(n.subtreeFlags&8772)!==0):_r(t,n),Er=r,Vt=s}break;case 30:break;default:_r(t,n)}}function Jw(t){var e=t.alternate;e!==null&&(t.alternate=null,Jw(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&ay(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var ut=null,xn=!1;function Ir(t,e,n){for(n=n.child;n!==null;)Zw(t,e,n),n=n.sibling}function Zw(t,e,n){if(Yn&&typeof Yn.onCommitFiberUnmount=="function")try{Yn.onCommitFiberUnmount(Ul,n)}catch{}switch(n.tag){case 26:Vt||Ua(n,e),Ir(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Vt||Ua(n,e);var a=ut,r=xn;Vs(n.type)&&(ut=n.stateNode,xn=!1),Ir(t,e,n),Tl(n.stateNode),ut=a,xn=r;break;case 5:Vt||Ua(n,e);case 6:if(a=ut,r=xn,ut=null,Ir(t,e,n),ut=a,xn=r,ut!==null)if(xn)try{(ut.nodeType===9?ut.body:ut.nodeName==="HTML"?ut.ownerDocument.body:ut).removeChild(n.stateNode)}catch(s){Ge(n,e,s)}else try{ut.removeChild(n.stateNode)}catch(s){Ge(n,e,s)}break;case 18:ut!==null&&(xn?(t=ut,GT(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),Mo(t)):GT(ut,n.stateNode));break;case 4:a=ut,r=xn,ut=n.stateNode.containerInfo,xn=!0,Ir(t,e,n),ut=a,xn=r;break;case 0:case 11:case 14:case 15:Os(2,n,e),Vt||Os(4,n,e),Ir(t,e,n);break;case 1:Vt||(Ua(n,e),a=n.stateNode,typeof a.componentWillUnmount=="function"&&Ww(n,e,a)),Ir(t,e,n);break;case 21:Ir(t,e,n);break;case 22:Vt=(a=Vt)||n.memoizedState!==null,Ir(t,e,n),Vt=a;break;default:Ir(t,e,n)}}function eC(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Mo(t)}catch(n){Ge(e,e.return,n)}}}function tC(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Mo(t)}catch(n){Ge(e,e.return,n)}}function HD(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new xT),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new xT),e;default:throw Error(V(435,t.tag))}}function Bd(t,e){var n=HD(t);e.forEach(function(a){if(!n.has(a)){n.add(a);var r=JD.bind(null,t,a);a.then(r,r)}})}function Ln(t,e){var n=e.deletions;if(n!==null)for(var a=0;a<n.length;a++){var r=n[a],s=t,i=e,u=i;e:for(;u!==null;){switch(u.tag){case 27:if(Vs(u.type)){ut=u.stateNode,xn=!1;break e}break;case 5:ut=u.stateNode,xn=!1;break e;case 3:case 4:ut=u.stateNode.containerInfo,xn=!0;break e}u=u.return}if(ut===null)throw Error(V(160));Zw(s,i,r),ut=null,xn=!1,s=r.alternate,s!==null&&(s.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)nC(e,t),e=e.sibling}var Sa=null;function nC(t,e){var n=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Ln(e,t),An(t),a&4&&(Os(3,t,t.return),Kl(3,t),Os(5,t,t.return));break;case 1:Ln(e,t),An(t),a&512&&(Vt||n===null||Ua(n,n.return)),a&64&&Er&&(t=t.updateQueue,t!==null&&(a=t.callbacks,a!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?a:n.concat(a))));break;case 26:var r=Sa;if(Ln(e,t),An(t),a&512&&(Vt||n===null||Ua(n,n.return)),a&4){var s=n!==null?n.memoizedState:null;if(a=t.memoizedState,n===null)if(a===null)if(t.stateNode===null){e:{a=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(a){case"title":s=r.getElementsByTagName("title")[0],(!s||s[zl]||s[fn]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=r.createElement(a),r.head.insertBefore(s,r.querySelector("head > title"))),mn(s,a,n),s[fn]=t,nn(s),a=s;break e;case"link":var i=$T("link","href",r).get(a+(n.href||""));if(i){for(var u=0;u<i.length;u++)if(s=i[u],s.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&s.getAttribute("rel")===(n.rel==null?null:n.rel)&&s.getAttribute("title")===(n.title==null?null:n.title)&&s.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(u,1);break t}}s=r.createElement(a),mn(s,a,n),r.head.appendChild(s);break;case"meta":if(i=$T("meta","content",r).get(a+(n.content||""))){for(u=0;u<i.length;u++)if(s=i[u],s.getAttribute("content")===(n.content==null?null:""+n.content)&&s.getAttribute("name")===(n.name==null?null:n.name)&&s.getAttribute("property")===(n.property==null?null:n.property)&&s.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&s.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(u,1);break t}}s=r.createElement(a),mn(s,a,n),r.head.appendChild(s);break;default:throw Error(V(468,a))}s[fn]=t,nn(s),a=s}t.stateNode=a}else JT(r,t.type,t.stateNode);else t.stateNode=QT(r,a,t.memoizedProps);else s!==a?(s===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):s.count--,a===null?JT(r,t.type,t.stateNode):QT(r,a,t.memoizedProps)):a===null&&t.stateNode!==null&&Wm(t,t.memoizedProps,n.memoizedProps)}break;case 27:Ln(e,t),An(t),a&512&&(Vt||n===null||Ua(n,n.return)),n!==null&&a&4&&Wm(t,t.memoizedProps,n.memoizedProps);break;case 5:if(Ln(e,t),An(t),a&512&&(Vt||n===null||Ua(n,n.return)),t.flags&32){r=t.stateNode;try{Lo(r,"")}catch(R){Ge(t,t.return,R)}}a&4&&t.stateNode!=null&&(r=t.memoizedProps,Wm(t,r,n!==null?n.memoizedProps:r)),a&1024&&(Ym=!0);break;case 6:if(Ln(e,t),An(t),a&4){if(t.stateNode===null)throw Error(V(162));a=t.memoizedProps,n=t.stateNode;try{n.nodeValue=a}catch(R){Ge(t,t.return,R)}}break;case 3:if(rf=null,r=Sa,Sa=Df(e.containerInfo),Ln(e,t),Sa=r,An(t),a&4&&n!==null&&n.memoizedState.isDehydrated)try{Mo(e.containerInfo)}catch(R){Ge(t,t.return,R)}Ym&&(Ym=!1,aC(t));break;case 4:a=Sa,Sa=Df(t.stateNode.containerInfo),Ln(e,t),An(t),Sa=a;break;case 12:Ln(e,t),An(t);break;case 31:Ln(e,t),An(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Bd(t,a)));break;case 13:Ln(e,t),An(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Xf=Xn()),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Bd(t,a)));break;case 22:r=t.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=Er,f=Vt;if(Er=c||r,Vt=f||l,Ln(e,t),Vt=f,Er=c,An(t),a&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||l||Er||Vt||ii(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){l=n=e;try{if(s=l.stateNode,r)i=s.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{u=l.stateNode;var p=l.memoizedProps.style,m=p!=null&&p.hasOwnProperty("display")?p.display:null;u.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(R){Ge(l,l.return,R)}}}else if(e.tag===6){if(n===null){l=e;try{l.stateNode.nodeValue=r?"":l.memoizedProps}catch(R){Ge(l,l.return,R)}}}else if(e.tag===18){if(n===null){l=e;try{var S=l.stateNode;r?jT(S,!0):jT(l.stateNode,!1)}catch(R){Ge(l,l.return,R)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}a&4&&(a=t.updateQueue,a!==null&&(n=a.retryQueue,n!==null&&(a.retryQueue=null,Bd(t,n))));break;case 19:Ln(e,t),An(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Bd(t,a)));break;case 30:break;case 21:break;default:Ln(e,t),An(t)}}function An(t){var e=t.flags;if(e&2){try{for(var n,a=t.return;a!==null;){if(Yw(a)){n=a;break}a=a.return}if(n==null)throw Error(V(160));switch(n.tag){case 27:var r=n.stateNode,s=Xm(t);bf(t,s,r);break;case 5:var i=n.stateNode;n.flags&32&&(Lo(i,""),n.flags&=-33);var u=Xm(t);bf(t,u,i);break;case 3:case 4:var l=n.stateNode.containerInfo,c=Xm(t);Ng(t,c,l);break;default:throw Error(V(161))}}catch(f){Ge(t,t.return,f)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function aC(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;aC(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function _r(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)$w(t,e.alternate,e),e=e.sibling}function ii(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Os(4,e,e.return),ii(e);break;case 1:Ua(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&Ww(e,e.return,n),ii(e);break;case 27:Tl(e.stateNode);case 26:case 5:Ua(e,e.return),ii(e);break;case 22:e.memoizedState===null&&ii(e);break;case 30:ii(e);break;default:ii(e)}t=t.sibling}}function Sr(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var a=e.alternate,r=t,s=e,i=s.flags;switch(s.tag){case 0:case 11:case 15:Sr(r,s,n),Kl(4,s);break;case 1:if(Sr(r,s,n),a=s,r=a.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){Ge(a,a.return,c)}if(a=s,r=a.updateQueue,r!==null){var u=a.stateNode;try{var l=r.shared.hiddenCallbacks;if(l!==null)for(r.shared.hiddenCallbacks=null,r=0;r<l.length;r++)ew(l[r],u)}catch(c){Ge(a,a.return,c)}}n&&i&64&&Kw(s),_l(s,s.return);break;case 27:Qw(s);case 26:case 5:Sr(r,s,n),n&&a===null&&i&4&&Xw(s),_l(s,s.return);break;case 12:Sr(r,s,n);break;case 31:Sr(r,s,n),n&&i&4&&eC(r,s);break;case 13:Sr(r,s,n),n&&i&4&&tC(r,s);break;case 22:s.memoizedState===null&&Sr(r,s,n),_l(s,s.return);break;case 30:break;default:Sr(r,s,n)}e=e.sibling}}function My(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&Gl(n))}function Ny(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Gl(t))}function _a(t,e,n,a){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)rC(t,e,n,a),e=e.sibling}function rC(t,e,n,a){var r=e.flags;switch(e.tag){case 0:case 11:case 15:_a(t,e,n,a),r&2048&&Kl(9,e);break;case 1:_a(t,e,n,a);break;case 3:_a(t,e,n,a),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Gl(t)));break;case 12:if(r&2048){_a(t,e,n,a),t=e.stateNode;try{var s=e.memoizedProps,i=s.id,u=s.onPostCommit;typeof u=="function"&&u(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){Ge(e,e.return,l)}}else _a(t,e,n,a);break;case 31:_a(t,e,n,a);break;case 13:_a(t,e,n,a);break;case 23:break;case 22:s=e.stateNode,i=e.alternate,e.memoizedState!==null?s._visibility&2?_a(t,e,n,a):Sl(t,e):s._visibility&2?_a(t,e,n,a):(s._visibility|=2,ao(t,e,n,a,(e.subtreeFlags&10256)!==0||!1)),r&2048&&My(i,e);break;case 24:_a(t,e,n,a),r&2048&&Ny(e.alternate,e);break;default:_a(t,e,n,a)}}function ao(t,e,n,a,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var s=t,i=e,u=n,l=a,c=i.flags;switch(i.tag){case 0:case 11:case 15:ao(s,i,u,l,r),Kl(8,i);break;case 23:break;case 22:var f=i.stateNode;i.memoizedState!==null?f._visibility&2?ao(s,i,u,l,r):Sl(s,i):(f._visibility|=2,ao(s,i,u,l,r)),r&&c&2048&&My(i.alternate,i);break;case 24:ao(s,i,u,l,r),r&&c&2048&&Ny(i.alternate,i);break;default:ao(s,i,u,l,r)}e=e.sibling}}function Sl(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,a=e,r=a.flags;switch(a.tag){case 22:Sl(n,a),r&2048&&My(a.alternate,a);break;case 24:Sl(n,a),r&2048&&Ny(a.alternate,a);break;default:Sl(n,a)}e=e.sibling}}var cl=8192;function no(t,e,n){if(t.subtreeFlags&cl)for(t=t.child;t!==null;)sC(t,e,n),t=t.sibling}function sC(t,e,n){switch(t.tag){case 26:no(t,e,n),t.flags&cl&&t.memoizedState!==null&&LP(n,Sa,t.memoizedState,t.memoizedProps);break;case 5:no(t,e,n);break;case 3:case 4:var a=Sa;Sa=Df(t.stateNode.containerInfo),no(t,e,n),Sa=a;break;case 22:t.memoizedState===null&&(a=t.alternate,a!==null&&a.memoizedState!==null?(a=cl,cl=16777216,no(t,e,n),cl=a):no(t,e,n));break;default:no(t,e,n)}}function iC(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function al(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];tn=a,uC(a,t)}iC(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)oC(t),t=t.sibling}function oC(t){switch(t.tag){case 0:case 11:case 15:al(t),t.flags&2048&&Os(9,t,t.return);break;case 3:al(t);break;case 12:al(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,nf(t)):al(t);break;default:al(t)}}function nf(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];tn=a,uC(a,t)}iC(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Os(8,e,e.return),nf(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,nf(e));break;default:nf(e)}t=t.sibling}}function uC(t,e){for(;tn!==null;){var n=tn;switch(n.tag){case 0:case 11:case 15:Os(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:Gl(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,tn=a;else e:for(n=t;tn!==null;){a=tn;var r=a.sibling,s=a.return;if(Jw(a),a===n){tn=null;break e}if(r!==null){r.return=s,tn=r;break e}tn=s}}}var GD={getCacheForType:function(t){var e=pn(Ft),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return pn(Ft).controller.signal}},jD=typeof WeakMap=="function"?WeakMap:Map,Ue=0,$e=null,Ee=null,Le=0,He=0,Gn=null,Ss=!1,Bo=!1,Vy=!1,Pr=0,vt=0,Ms=0,di=0,Fy=0,Wn=0,ko=0,vl=null,Rn=null,Vg=!1,Xf=0,lC=0,wf=1/0,Cf=null,Ls=null,Wt=0,As=null,Do=null,Ar=0,Fg=0,Ug=null,cC=null,El=0,Bg=null;function $n(){return Ue&2&&Le!==0?Le&-Le:ie.T!==null?By():_b()}function dC(){if(Wn===0)if(!(Le&536870912)||Ae){var t=Rd;Rd<<=1,!(Rd&3932160)&&(Rd=262144),Wn=t}else Wn=536870912;return t=Zn.current,t!==null&&(t.flags|=32),Wn}function kn(t,e,n){(t===$e&&(He===2||He===9)||t.cancelPendingCommit!==null)&&(Po(t,0),vs(t,Le,Wn,!1)),ql(t,n),(!(Ue&2)||t!==$e)&&(t===$e&&(!(Ue&2)&&(di|=n),vt===4&&vs(t,Le,Wn,!1)),za(t))}function fC(t,e,n){if(Ue&6)throw Error(V(327));var a=!n&&(e&127)===0&&(e&t.expiredLanes)===0||Bl(t,e),r=a?XD(t,e):Qm(t,e,!0),s=a;do{if(r===0){Bo&&!a&&vs(t,e,0,!1);break}else{if(n=t.current.alternate,s&&!KD(n)){r=Qm(t,e,!1),s=!1;continue}if(r===2){if(s=e,t.errorRecoveryDisabledLanes&s)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var u=t;r=vl;var l=u.current.memoizedState.isDehydrated;if(l&&(Po(u,i).flags|=256),i=Qm(u,i,!1),i!==2){if(Vy&&!l){u.errorRecoveryDisabledLanes|=s,di|=s,r=4;break e}s=Rn,Rn=r,s!==null&&(Rn===null?Rn=s:Rn.push.apply(Rn,s))}r=i}if(s=!1,r!==2)continue}}if(r===1){Po(t,0),vs(t,e,0,!0);break}e:{switch(a=t,s=r,s){case 0:case 1:throw Error(V(345));case 4:if((e&4194048)!==e)break;case 6:vs(a,e,Wn,!Ss);break e;case 2:Rn=null;break;case 3:case 5:break;default:throw Error(V(329))}if((e&62914560)===e&&(r=Xf+300-Xn(),10<r)){if(vs(a,e,Wn,!Ss),Vf(a,0,!0)!==0)break e;Ar=e,a.timeoutHandle=DC(RT.bind(null,a,n,Rn,Cf,Vg,e,Wn,di,ko,Ss,s,"Throttled",-0,0),r);break e}RT(a,n,Rn,Cf,Vg,e,Wn,di,ko,Ss,s,null,-0,0)}}break}while(!0);za(t)}function RT(t,e,n,a,r,s,i,u,l,c,f,p,m,S){if(t.timeoutHandle=-1,p=e.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:br},sC(e,s,p);var R=(s&62914560)===s?Xf-Xn():(s&4194048)===s?lC-Xn():0;if(R=AP(p,R),R!==null){Ar=s,t.cancelPendingCommit=R(DT.bind(null,t,e,s,n,a,r,i,u,l,f,p,null,m,S)),vs(t,s,i,!c);return}}DT(t,e,s,n,a,r,i,u,l)}function KD(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var r=n[a],s=r.getSnapshot;r=r.value;try{if(!Jn(s(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function vs(t,e,n,a){e&=~Fy,e&=~di,t.suspendedLanes|=e,t.pingedLanes&=~e,a&&(t.warmLanes|=e),a=t.expirationTimes;for(var r=e;0<r;){var s=31-Qn(r),i=1<<s;a[s]=-1,r&=~i}n!==0&&gb(t,n,e)}function Yf(){return Ue&6?!0:(Wl(0,!1),!1)}function Uy(){if(Ee!==null){if(He===0)var t=Ee.return;else t=Ee,wr=vi=null,by(t),Eo=null,Rl=0,t=Ee;for(;t!==null;)jw(t.alternate,t),t=t.return;Ee=null}}function Po(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,cP(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),Ar=0,Uy(),$e=t,Ee=n=Cr(t.current,null),Le=e,He=0,Gn=null,Ss=!1,Bo=Bl(t,e),Vy=!1,ko=Wn=Fy=di=Ms=vt=0,Rn=vl=null,Vg=!1,e&8&&(e|=e&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=e;0<a;){var r=31-Qn(a),s=1<<r;e|=t[r],a&=~s}return Pr=e,qf(),n}function hC(t,e){me=null,ie.H=Dl,e===Uo||e===Hf?(e=uT(),He=3):e===yy?(e=uT(),He=4):He=e===Py?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Gn=e,Ee===null&&(vt=1,Ef(t,la(e,t.current)))}function pC(){var t=Zn.current;return t===null?!0:(Le&4194048)===Le?da===null:(Le&62914560)===Le||Le&536870912?t===da:!1}function mC(){var t=ie.H;return ie.H=Dl,t===null?Dl:t}function gC(){var t=ie.A;return ie.A=GD,t}function Lf(){vt=4,Ss||(Le&4194048)!==Le&&Zn.current!==null||(Bo=!0),!(Ms&134217727)&&!(di&134217727)||$e===null||vs($e,Le,Wn,!1)}function Qm(t,e,n){var a=Ue;Ue|=2;var r=mC(),s=gC();($e!==t||Le!==e)&&(Cf=null,Po(t,e)),e=!1;var i=vt;e:do try{if(He!==0&&Ee!==null){var u=Ee,l=Gn;switch(He){case 8:Uy(),i=6;break e;case 3:case 2:case 9:case 6:Zn.current===null&&(e=!0);var c=He;if(He=0,Gn=null,yo(t,u,l,c),n&&Bo){i=0;break e}break;default:c=He,He=0,Gn=null,yo(t,u,l,c)}}WD(),i=vt;break}catch(f){hC(t,f)}while(!0);return e&&t.shellSuspendCounter++,wr=vi=null,Ue=a,ie.H=r,ie.A=s,Ee===null&&($e=null,Le=0,qf()),i}function WD(){for(;Ee!==null;)yC(Ee)}function XD(t,e){var n=Ue;Ue|=2;var a=mC(),r=gC();$e!==t||Le!==e?(Cf=null,wf=Xn()+500,Po(t,e)):Bo=Bl(t,e);e:do try{if(He!==0&&Ee!==null){e=Ee;var s=Gn;t:switch(He){case 1:He=0,Gn=null,yo(t,e,s,1);break;case 2:case 9:if(oT(s)){He=0,Gn=null,kT(e);break}e=function(){He!==2&&He!==9||$e!==t||(He=7),za(t)},s.then(e,e);break e;case 3:He=7;break e;case 4:He=5;break e;case 7:oT(s)?(He=0,Gn=null,kT(e)):(He=0,Gn=null,yo(t,e,s,7));break;case 5:var i=null;switch(Ee.tag){case 26:i=Ee.memoizedState;case 5:case 27:var u=Ee;if(i?VC(i):u.stateNode.complete){He=0,Gn=null;var l=u.sibling;if(l!==null)Ee=l;else{var c=u.return;c!==null?(Ee=c,Qf(c)):Ee=null}break t}}He=0,Gn=null,yo(t,e,s,5);break;case 6:He=0,Gn=null,yo(t,e,s,6);break;case 8:Uy(),vt=6;break e;default:throw Error(V(462))}}YD();break}catch(f){hC(t,f)}while(!0);return wr=vi=null,ie.H=a,ie.A=r,Ue=n,Ee!==null?0:($e=null,Le=0,qf(),vt)}function YD(){for(;Ee!==null&&!I1();)yC(Ee)}function yC(t){var e=Gw(t.alternate,t,Pr);t.memoizedProps=t.pendingProps,e===null?Qf(t):Ee=e}function kT(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=bT(n,e,e.pendingProps,e.type,void 0,Le);break;case 11:e=bT(n,e,e.pendingProps,e.type.render,e.ref,Le);break;case 5:by(e);default:jw(n,e),e=Ee=jb(e,Pr),e=Gw(n,e,Pr)}t.memoizedProps=t.pendingProps,e===null?Qf(t):Ee=e}function yo(t,e,n,a){wr=vi=null,by(e),Eo=null,Rl=0;var r=e.return;try{if(VD(t,r,e,n,Le)){vt=1,Ef(t,la(n,t.current)),Ee=null;return}}catch(s){if(r!==null)throw Ee=r,s;vt=1,Ef(t,la(n,t.current)),Ee=null;return}e.flags&32768?(Ae||a===1?t=!0:Bo||Le&536870912?t=!1:(Ss=t=!0,(a===2||a===9||a===3||a===6)&&(a=Zn.current,a!==null&&a.tag===13&&(a.flags|=16384))),IC(e,t)):Qf(e)}function Qf(t){var e=t;do{if(e.flags&32768){IC(e,Ss);return}t=e.return;var n=BD(e.alternate,e,Pr);if(n!==null){Ee=n;return}if(e=e.sibling,e!==null){Ee=e;return}Ee=e=t}while(e!==null);vt===0&&(vt=5)}function IC(t,e){do{var n=qD(t.alternate,t);if(n!==null){n.flags&=32767,Ee=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){Ee=t;return}Ee=t=n}while(t!==null);vt=6,Ee=null}function DT(t,e,n,a,r,s,i,u,l){t.cancelPendingCommit=null;do $f();while(Wt!==0);if(Ue&6)throw Error(V(327));if(e!==null){if(e===t.current)throw Error(V(177));if(s=e.lanes|e.childLanes,s|=cy,A1(t,n,s,i,u,l),t===$e&&(Ee=$e=null,Le=0),Do=e,As=t,Ar=n,Fg=s,Ug=r,cC=a,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,ZD(df,function(){return TC(),null})):(t.callbackNode=null,t.callbackPriority=0),a=(e.flags&13878)!==0,e.subtreeFlags&13878||a){a=ie.T,ie.T=null,r=Be.p,Be.p=2,i=Ue,Ue|=4;try{zD(t,e,n)}finally{Ue=i,Be.p=r,ie.T=a}}Wt=1,_C(),SC(),vC()}}function _C(){if(Wt===1){Wt=0;var t=As,e=Do,n=(e.flags&13878)!==0;if(e.subtreeFlags&13878||n){n=ie.T,ie.T=null;var a=Be.p;Be.p=2;var r=Ue;Ue|=4;try{nC(e,t);var s=Gg,i=Vb(t.containerInfo),u=s.focusedElem,l=s.selectionRange;if(i!==u&&u&&u.ownerDocument&&Nb(u.ownerDocument.documentElement,u)){if(l!==null&&ly(u)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in u)u.selectionStart=c,u.selectionEnd=Math.min(f,u.value.length);else{var p=u.ownerDocument||document,m=p&&p.defaultView||window;if(m.getSelection){var S=m.getSelection(),R=u.textContent.length,D=Math.min(l.start,R),L=l.end===void 0?D:Math.min(l.end,R);!S.extend&&D>L&&(i=L,L=D,D=i);var E=eT(u,D),v=eT(u,L);if(E&&v&&(S.rangeCount!==1||S.anchorNode!==E.node||S.anchorOffset!==E.offset||S.focusNode!==v.node||S.focusOffset!==v.offset)){var C=p.createRange();C.setStart(E.node,E.offset),S.removeAllRanges(),D>L?(S.addRange(C),S.extend(v.node,v.offset)):(C.setEnd(v.node,v.offset),S.addRange(C))}}}}for(p=[],S=u;S=S.parentNode;)S.nodeType===1&&p.push({element:S,left:S.scrollLeft,top:S.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<p.length;u++){var x=p[u];x.element.scrollLeft=x.left,x.element.scrollTop=x.top}}Mf=!!Hg,Gg=Hg=null}finally{Ue=r,Be.p=a,ie.T=n}}t.current=e,Wt=2}}function SC(){if(Wt===2){Wt=0;var t=As,e=Do,n=(e.flags&8772)!==0;if(e.subtreeFlags&8772||n){n=ie.T,ie.T=null;var a=Be.p;Be.p=2;var r=Ue;Ue|=4;try{$w(t,e.alternate,e)}finally{Ue=r,Be.p=a,ie.T=n}}Wt=3}}function vC(){if(Wt===4||Wt===3){Wt=0,_1();var t=As,e=Do,n=Ar,a=cC;e.subtreeFlags&10256||e.flags&10256?Wt=5:(Wt=0,Do=As=null,EC(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(Ls=null),ny(n),e=e.stateNode,Yn&&typeof Yn.onCommitFiberRoot=="function")try{Yn.onCommitFiberRoot(Ul,e,void 0,(e.current.flags&128)===128)}catch{}if(a!==null){e=ie.T,r=Be.p,Be.p=2,ie.T=null;try{for(var s=t.onRecoverableError,i=0;i<a.length;i++){var u=a[i];s(u.value,{componentStack:u.stack})}}finally{ie.T=e,Be.p=r}}Ar&3&&$f(),za(t),r=t.pendingLanes,n&261930&&r&42?t===Bg?El++:(El=0,Bg=t):El=0,Wl(0,!1)}}function EC(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,Gl(e)))}function $f(){return _C(),SC(),vC(),TC()}function TC(){if(Wt!==5)return!1;var t=As,e=Fg;Fg=0;var n=ny(Ar),a=ie.T,r=Be.p;try{Be.p=32>n?32:n,ie.T=null,n=Ug,Ug=null;var s=As,i=Ar;if(Wt=0,Do=As=null,Ar=0,Ue&6)throw Error(V(331));var u=Ue;if(Ue|=4,oC(s.current),rC(s,s.current,i,n),Ue=u,Wl(0,!1),Yn&&typeof Yn.onPostCommitFiberRoot=="function")try{Yn.onPostCommitFiberRoot(Ul,s)}catch{}return!0}finally{Be.p=r,ie.T=a,EC(t,e)}}function PT(t,e,n){e=la(n,e),e=Pg(t.stateNode,e,2),t=Cs(t,e,2),t!==null&&(ql(t,2),za(t))}function Ge(t,e,n){if(t.tag===3)PT(t,t,n);else for(;e!==null;){if(e.tag===3){PT(e,t,n);break}else if(e.tag===1){var a=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(Ls===null||!Ls.has(a))){t=la(n,t),n=Fw(2),a=Cs(e,n,2),a!==null&&(Uw(n,a,e,t),ql(a,2),za(a));break}}e=e.return}}function $m(t,e,n){var a=t.pingCache;if(a===null){a=t.pingCache=new jD;var r=new Set;a.set(e,r)}else r=a.get(e),r===void 0&&(r=new Set,a.set(e,r));r.has(n)||(Vy=!0,r.add(n),t=QD.bind(null,t,e,n),e.then(t,t))}function QD(t,e,n){var a=t.pingCache;a!==null&&a.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,$e===t&&(Le&n)===n&&(vt===4||vt===3&&(Le&62914560)===Le&&300>Xn()-Xf?!(Ue&2)&&Po(t,0):Fy|=n,ko===Le&&(ko=0)),za(t)}function bC(t,e){e===0&&(e=mb()),t=Si(t,e),t!==null&&(ql(t,e),za(t))}function $D(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),bC(t,n)}function JD(t,e){var n=0;switch(t.tag){case 31:case 13:var a=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:a=t.stateNode;break;case 22:a=t.stateNode._retryCache;break;default:throw Error(V(314))}a!==null&&a.delete(e),bC(t,n)}function ZD(t,e){return ey(t,e)}var Af=null,ro=null,qg=!1,xf=!1,Jm=!1,Es=0;function za(t){t!==ro&&t.next===null&&(ro===null?Af=ro=t:ro=ro.next=t),xf=!0,qg||(qg=!0,tP())}function Wl(t,e){if(!Jm&&xf){Jm=!0;do for(var n=!1,a=Af;a!==null;){if(!e)if(t!==0){var r=a.pendingLanes;if(r===0)var s=0;else{var i=a.suspendedLanes,u=a.pingedLanes;s=(1<<31-Qn(42|t)+1)-1,s&=r&~(i&~u),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(n=!0,OT(a,s))}else s=Le,s=Vf(a,a===$e?s:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(s&3)||Bl(a,s)||(n=!0,OT(a,s));a=a.next}while(n);Jm=!1}}function eP(){wC()}function wC(){xf=qg=!1;var t=0;Es!==0&&lP()&&(t=Es);for(var e=Xn(),n=null,a=Af;a!==null;){var r=a.next,s=CC(a,e);s===0?(a.next=null,n===null?Af=r:n.next=r,r===null&&(ro=n)):(n=a,(t!==0||s&3)&&(xf=!0)),a=r}Wt!==0&&Wt!==5||Wl(t,!1),Es!==0&&(Es=0)}function CC(t,e){for(var n=t.suspendedLanes,a=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes&-62914561;0<s;){var i=31-Qn(s),u=1<<i,l=r[i];l===-1?(!(u&n)||u&a)&&(r[i]=L1(u,e)):l<=e&&(t.expiredLanes|=u),s&=~u}if(e=$e,n=Le,n=Vf(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a=t.callbackNode,n===0||t===e&&(He===2||He===9)||t.cancelPendingCommit!==null)return a!==null&&a!==null&&Lm(a),t.callbackNode=null,t.callbackPriority=0;if(!(n&3)||Bl(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(a!==null&&Lm(a),ny(n)){case 2:case 8:n=hb;break;case 32:n=df;break;case 268435456:n=pb;break;default:n=df}return a=LC.bind(null,t),n=ey(n,a),t.callbackPriority=e,t.callbackNode=n,e}return a!==null&&a!==null&&Lm(a),t.callbackPriority=2,t.callbackNode=null,2}function LC(t,e){if(Wt!==0&&Wt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if($f()&&t.callbackNode!==n)return null;var a=Le;return a=Vf(t,t===$e?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a===0?null:(fC(t,a,e),CC(t,Xn()),t.callbackNode!=null&&t.callbackNode===n?LC.bind(null,t):null)}function OT(t,e){if($f())return null;fC(t,e,!0)}function tP(){dP(function(){Ue&6?ey(fb,eP):wC()})}function By(){if(Es===0){var t=Ao;t===0&&(t=xd,xd<<=1,!(xd&261888)&&(xd=256)),Es=t}return Es}function MT(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Wd(""+t)}function NT(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function nP(t,e,n,a,r){if(e==="submit"&&n&&n.stateNode===r){var s=MT((r[Dn]||null).action),i=a.submitter;i&&(e=(e=i[Dn]||null)?MT(e.formAction):i.getAttribute("formAction"),e!==null&&(s=e,i=null));var u=new Ff("action","action",null,a,r);t.push({event:u,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(Es!==0){var l=i?NT(r,i):new FormData(r);kg(n,{pending:!0,data:l,method:r.method,action:s},null,l)}}else typeof s=="function"&&(u.preventDefault(),l=i?NT(r,i):new FormData(r),kg(n,{pending:!0,data:l,method:r.method,action:s},s,l))},currentTarget:r}]})}}for(qd=0;qd<_g.length;qd++)zd=_g[qd],VT=zd.toLowerCase(),FT=zd[0].toUpperCase()+zd.slice(1),va(VT,"on"+FT);var zd,VT,FT,qd;va(Ub,"onAnimationEnd");va(Bb,"onAnimationIteration");va(qb,"onAnimationStart");va("dblclick","onDoubleClick");va("focusin","onFocus");va("focusout","onBlur");va(SD,"onTransitionRun");va(vD,"onTransitionStart");va(ED,"onTransitionCancel");va(zb,"onTransitionEnd");Co("onMouseEnter",["mouseout","mouseover"]);Co("onMouseLeave",["mouseout","mouseover"]);Co("onPointerEnter",["pointerout","pointerover"]);Co("onPointerLeave",["pointerout","pointerover"]);yi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));yi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));yi("onBeforeInput",["compositionend","keypress","textInput","paste"]);yi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));yi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));yi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Pl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),aP=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Pl));function AC(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var a=t[n],r=a.event;a=a.listeners;e:{var s=void 0;if(e)for(var i=a.length-1;0<=i;i--){var u=a[i],l=u.instance,c=u.currentTarget;if(u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=c;try{s(r)}catch(f){hf(f)}r.currentTarget=null,s=l}else for(i=0;i<a.length;i++){if(u=a[i],l=u.instance,c=u.currentTarget,u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=c;try{s(r)}catch(f){hf(f)}r.currentTarget=null,s=l}}}}function ve(t,e){var n=e[dg];n===void 0&&(n=e[dg]=new Set);var a=t+"__bubble";n.has(a)||(xC(e,t,2,!1),n.add(a))}function Zm(t,e,n){var a=0;e&&(a|=4),xC(n,t,a,e)}var Hd="_reactListening"+Math.random().toString(36).slice(2);function qy(t){if(!t[Hd]){t[Hd]=!0,Sb.forEach(function(n){n!=="selectionchange"&&(aP.has(n)||Zm(n,!1,t),Zm(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Hd]||(e[Hd]=!0,Zm("selectionchange",!1,e))}}function xC(t,e,n,a){switch(zC(e)){case 2:var r=kP;break;case 8:r=DP;break;default:r=jy}n=r.bind(null,e,n,t),r=void 0,!gg||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),a?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function eg(t,e,n,a,r){var s=a;if(!(e&1)&&!(e&2)&&a!==null)e:for(;;){if(a===null)return;var i=a.tag;if(i===3||i===4){var u=a.stateNode.containerInfo;if(u===r)break;if(i===4)for(i=a.return;i!==null;){var l=i.tag;if((l===3||l===4)&&i.stateNode.containerInfo===r)return;i=i.return}for(;u!==null;){if(i=oo(u),i===null)return;if(l=i.tag,l===5||l===6||l===26||l===27){a=s=i;continue e}u=u.parentNode}}a=a.return}Ab(function(){var c=s,f=sy(n),p=[];e:{var m=Hb.get(t);if(m!==void 0){var S=Ff,R=t;switch(t){case"keypress":if(Yd(n)===0)break e;case"keydown":case"keyup":S=J1;break;case"focusin":R="focus",S=Dm;break;case"focusout":R="blur",S=Dm;break;case"beforeblur":case"afterblur":S=Dm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":S=jE;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":S=B1;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":S=tD;break;case Ub:case Bb:case qb:S=H1;break;case zb:S=aD;break;case"scroll":case"scrollend":S=F1;break;case"wheel":S=sD;break;case"copy":case"cut":case"paste":S=j1;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":S=WE;break;case"toggle":case"beforetoggle":S=oD}var D=(e&4)!==0,L=!D&&(t==="scroll"||t==="scrollend"),E=D?m!==null?m+"Capture":null:m;D=[];for(var v=c,C;v!==null;){var x=v;if(C=x.stateNode,x=x.tag,x!==5&&x!==26&&x!==27||C===null||E===null||(x=wl(v,E),x!=null&&D.push(Ol(v,x,C))),L)break;v=v.return}0<D.length&&(m=new S(m,R,null,n,f),p.push({event:m,listeners:D}))}}if(!(e&7)){e:{if(m=t==="mouseover"||t==="pointerover",S=t==="mouseout"||t==="pointerout",m&&n!==mg&&(R=n.relatedTarget||n.fromElement)&&(oo(R)||R[No]))break e;if((S||m)&&(m=f.window===f?f:(m=f.ownerDocument)?m.defaultView||m.parentWindow:window,S?(R=n.relatedTarget||n.toElement,S=c,R=R?oo(R):null,R!==null&&(L=Fl(R),D=R.tag,R!==L||D!==5&&D!==27&&D!==6)&&(R=null)):(S=null,R=c),S!==R)){if(D=jE,x="onMouseLeave",E="onMouseEnter",v="mouse",(t==="pointerout"||t==="pointerover")&&(D=WE,x="onPointerLeave",E="onPointerEnter",v="pointer"),L=S==null?m:ul(S),C=R==null?m:ul(R),m=new D(x,v+"leave",S,n,f),m.target=L,m.relatedTarget=C,x=null,oo(f)===c&&(D=new D(E,v+"enter",R,n,f),D.target=C,D.relatedTarget=L,x=D),L=x,S&&R)t:{for(D=rP,E=S,v=R,C=0,x=E;x;x=D(x))C++;x=0;for(var G=v;G;G=D(G))x++;for(;0<C-x;)E=D(E),C--;for(;0<x-C;)v=D(v),x--;for(;C--;){if(E===v||v!==null&&E===v.alternate){D=E;break t}E=D(E),v=D(v)}D=null}else D=null;S!==null&&UT(p,m,S,D,!1),R!==null&&L!==null&&UT(p,L,R,D,!0)}}e:{if(m=c?ul(c):window,S=m.nodeName&&m.nodeName.toLowerCase(),S==="select"||S==="input"&&m.type==="file")var z=$E;else if(QE(m))if(Ob)z=yD;else{z=mD;var I=pD}else S=m.nodeName,!S||S.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?c&&ry(c.elementType)&&(z=$E):z=gD;if(z&&(z=z(t,c))){Pb(p,z,n,f);break e}I&&I(t,m,c),t==="focusout"&&c&&m.type==="number"&&c.memoizedProps.value!=null&&pg(m,"number",m.value)}switch(I=c?ul(c):window,t){case"focusin":(QE(I)||I.contentEditable==="true")&&(co=I,yg=c,hl=null);break;case"focusout":hl=yg=co=null;break;case"mousedown":Ig=!0;break;case"contextmenu":case"mouseup":case"dragend":Ig=!1,tT(p,n,f);break;case"selectionchange":if(_D)break;case"keydown":case"keyup":tT(p,n,f)}var y;if(uy)e:{switch(t){case"compositionstart":var _="onCompositionStart";break e;case"compositionend":_="onCompositionEnd";break e;case"compositionupdate":_="onCompositionUpdate";break e}_=void 0}else lo?kb(t,n)&&(_="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(_="onCompositionStart");_&&(Rb&&n.locale!=="ko"&&(lo||_!=="onCompositionStart"?_==="onCompositionEnd"&&lo&&(y=xb()):(_s=f,iy="value"in _s?_s.value:_s.textContent,lo=!0)),I=Rf(c,_),0<I.length&&(_=new KE(_,t,null,n,f),p.push({event:_,listeners:I}),y?_.data=y:(y=Db(n),y!==null&&(_.data=y)))),(y=lD?cD(t,n):dD(t,n))&&(_=Rf(c,"onBeforeInput"),0<_.length&&(I=new KE("onBeforeInput","beforeinput",null,n,f),p.push({event:I,listeners:_}),I.data=y)),nP(p,t,c,n,f)}AC(p,e)})}function Ol(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Rf(t,e){for(var n=e+"Capture",a=[];t!==null;){var r=t,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=wl(t,n),r!=null&&a.unshift(Ol(t,r,s)),r=wl(t,e),r!=null&&a.push(Ol(t,r,s))),t.tag===3)return a;t=t.return}return[]}function rP(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function UT(t,e,n,a,r){for(var s=e._reactName,i=[];n!==null&&n!==a;){var u=n,l=u.alternate,c=u.stateNode;if(u=u.tag,l!==null&&l===a)break;u!==5&&u!==26&&u!==27||c===null||(l=c,r?(c=wl(n,s),c!=null&&i.unshift(Ol(n,c,l))):r||(c=wl(n,s),c!=null&&i.push(Ol(n,c,l)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var sP=/\r\n?/g,iP=/\u0000|\uFFFD/g;function BT(t){return(typeof t=="string"?t:""+t).replace(sP,`
`).replace(iP,"")}function RC(t,e){return e=BT(e),BT(t)===e}function Ke(t,e,n,a,r,s){switch(n){case"children":typeof a=="string"?e==="body"||e==="textarea"&&a===""||Lo(t,a):(typeof a=="number"||typeof a=="bigint")&&e!=="body"&&Lo(t,""+a);break;case"className":Dd(t,"class",a);break;case"tabIndex":Dd(t,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":Dd(t,n,a);break;case"style":Lb(t,a,s);break;case"data":if(e!=="object"){Dd(t,"data",a);break}case"src":case"href":if(a===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Wd(""+a),t.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(n==="formAction"?(e!=="input"&&Ke(t,e,"name",r.name,r,null),Ke(t,e,"formEncType",r.formEncType,r,null),Ke(t,e,"formMethod",r.formMethod,r,null),Ke(t,e,"formTarget",r.formTarget,r,null)):(Ke(t,e,"encType",r.encType,r,null),Ke(t,e,"method",r.method,r,null),Ke(t,e,"target",r.target,r,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Wd(""+a),t.setAttribute(n,a);break;case"onClick":a!=null&&(t.onclick=br);break;case"onScroll":a!=null&&ve("scroll",t);break;case"onScrollEnd":a!=null&&ve("scrollend",t);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(V(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(V(60));t.innerHTML=n}}break;case"multiple":t.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":t.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){t.removeAttribute("xlink:href");break}n=Wd(""+a),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""+a):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":a===!0?t.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,a):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?t.setAttribute(n,a):t.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?t.removeAttribute(n):t.setAttribute(n,a);break;case"popover":ve("beforetoggle",t),ve("toggle",t),Kd(t,"popover",a);break;case"xlinkActuate":gr(t,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":gr(t,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":gr(t,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":gr(t,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":gr(t,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":gr(t,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":gr(t,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":gr(t,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":gr(t,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":Kd(t,"is",a);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=N1.get(n)||n,Kd(t,n,a))}}function zg(t,e,n,a,r,s){switch(n){case"style":Lb(t,a,s);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(V(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(V(60));t.innerHTML=n}}break;case"children":typeof a=="string"?Lo(t,a):(typeof a=="number"||typeof a=="bigint")&&Lo(t,""+a);break;case"onScroll":a!=null&&ve("scroll",t);break;case"onScrollEnd":a!=null&&ve("scrollend",t);break;case"onClick":a!=null&&(t.onclick=br);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!vb.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),s=t[Dn]||null,s=s!=null?s[n]:null,typeof s=="function"&&t.removeEventListener(e,s,r),typeof a=="function")){typeof s!="function"&&s!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,a,r);break e}n in t?t[n]=a:a===!0?t.setAttribute(n,""):Kd(t,n,a)}}}function mn(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ve("error",t),ve("load",t);var a=!1,r=!1,s;for(s in n)if(n.hasOwnProperty(s)){var i=n[s];if(i!=null)switch(s){case"src":a=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(V(137,e));default:Ke(t,e,s,i,n,null)}}r&&Ke(t,e,"srcSet",n.srcSet,n,null),a&&Ke(t,e,"src",n.src,n,null);return;case"input":ve("invalid",t);var u=s=i=r=null,l=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":r=f;break;case"type":i=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":s=f;break;case"defaultValue":u=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(V(137,e));break;default:Ke(t,e,a,f,n,null)}}bb(t,s,u,l,c,i,r,!1);return;case"select":ve("invalid",t),a=i=s=null;for(r in n)if(n.hasOwnProperty(r)&&(u=n[r],u!=null))switch(r){case"value":s=u;break;case"defaultValue":i=u;break;case"multiple":a=u;default:Ke(t,e,r,u,n,null)}e=s,n=i,t.multiple=!!a,e!=null?_o(t,!!a,e,!1):n!=null&&_o(t,!!a,n,!0);return;case"textarea":ve("invalid",t),s=r=a=null;for(i in n)if(n.hasOwnProperty(i)&&(u=n[i],u!=null))switch(i){case"value":a=u;break;case"defaultValue":r=u;break;case"children":s=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(V(91));break;default:Ke(t,e,i,u,n,null)}Cb(t,a,r,s);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(a=n[l],a!=null))switch(l){case"selected":t.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:Ke(t,e,l,a,n,null)}return;case"dialog":ve("beforetoggle",t),ve("toggle",t),ve("cancel",t),ve("close",t);break;case"iframe":case"object":ve("load",t);break;case"video":case"audio":for(a=0;a<Pl.length;a++)ve(Pl[a],t);break;case"image":ve("error",t),ve("load",t);break;case"details":ve("toggle",t);break;case"embed":case"source":case"link":ve("error",t),ve("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(V(137,e));default:Ke(t,e,c,a,n,null)}return;default:if(ry(e)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&zg(t,e,f,a,n,void 0));return}}for(u in n)n.hasOwnProperty(u)&&(a=n[u],a!=null&&Ke(t,e,u,a,n,null))}function oP(t,e,n,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,i=null,u=null,l=null,c=null,f=null;for(S in n){var p=n[S];if(n.hasOwnProperty(S)&&p!=null)switch(S){case"checked":break;case"value":break;case"defaultValue":l=p;default:a.hasOwnProperty(S)||Ke(t,e,S,null,a,p)}}for(var m in a){var S=a[m];if(p=n[m],a.hasOwnProperty(m)&&(S!=null||p!=null))switch(m){case"type":s=S;break;case"name":r=S;break;case"checked":c=S;break;case"defaultChecked":f=S;break;case"value":i=S;break;case"defaultValue":u=S;break;case"children":case"dangerouslySetInnerHTML":if(S!=null)throw Error(V(137,e));break;default:S!==p&&Ke(t,e,m,S,a,p)}}hg(t,i,u,l,c,f,s,r);return;case"select":S=i=u=m=null;for(s in n)if(l=n[s],n.hasOwnProperty(s)&&l!=null)switch(s){case"value":break;case"multiple":S=l;default:a.hasOwnProperty(s)||Ke(t,e,s,null,a,l)}for(r in a)if(s=a[r],l=n[r],a.hasOwnProperty(r)&&(s!=null||l!=null))switch(r){case"value":m=s;break;case"defaultValue":u=s;break;case"multiple":i=s;default:s!==l&&Ke(t,e,r,s,a,l)}e=u,n=i,a=S,m!=null?_o(t,!!n,m,!1):!!a!=!!n&&(e!=null?_o(t,!!n,e,!0):_o(t,!!n,n?[]:"",!1));return;case"textarea":S=m=null;for(u in n)if(r=n[u],n.hasOwnProperty(u)&&r!=null&&!a.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Ke(t,e,u,null,a,r)}for(i in a)if(r=a[i],s=n[i],a.hasOwnProperty(i)&&(r!=null||s!=null))switch(i){case"value":m=r;break;case"defaultValue":S=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(V(91));break;default:r!==s&&Ke(t,e,i,r,a,s)}wb(t,m,S);return;case"option":for(var R in n)if(m=n[R],n.hasOwnProperty(R)&&m!=null&&!a.hasOwnProperty(R))switch(R){case"selected":t.selected=!1;break;default:Ke(t,e,R,null,a,m)}for(l in a)if(m=a[l],S=n[l],a.hasOwnProperty(l)&&m!==S&&(m!=null||S!=null))switch(l){case"selected":t.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:Ke(t,e,l,m,a,S)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var D in n)m=n[D],n.hasOwnProperty(D)&&m!=null&&!a.hasOwnProperty(D)&&Ke(t,e,D,null,a,m);for(c in a)if(m=a[c],S=n[c],a.hasOwnProperty(c)&&m!==S&&(m!=null||S!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(V(137,e));break;default:Ke(t,e,c,m,a,S)}return;default:if(ry(e)){for(var L in n)m=n[L],n.hasOwnProperty(L)&&m!==void 0&&!a.hasOwnProperty(L)&&zg(t,e,L,void 0,a,m);for(f in a)m=a[f],S=n[f],!a.hasOwnProperty(f)||m===S||m===void 0&&S===void 0||zg(t,e,f,m,a,S);return}}for(var E in n)m=n[E],n.hasOwnProperty(E)&&m!=null&&!a.hasOwnProperty(E)&&Ke(t,e,E,null,a,m);for(p in a)m=a[p],S=n[p],!a.hasOwnProperty(p)||m===S||m==null&&S==null||Ke(t,e,p,m,a,S)}function qT(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function uP(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var r=n[a],s=r.transferSize,i=r.initiatorType,u=r.duration;if(s&&u&&qT(i)){for(i=0,u=r.responseEnd,a+=1;a<n.length;a++){var l=n[a],c=l.startTime;if(c>u)break;var f=l.transferSize,p=l.initiatorType;f&&qT(p)&&(l=l.responseEnd,i+=f*(l<u?1:(u-c)/(l-c)))}if(--a,e+=8*(s+i)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Hg=null,Gg=null;function kf(t){return t.nodeType===9?t:t.ownerDocument}function zT(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function kC(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function jg(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var tg=null;function lP(){var t=window.event;return t&&t.type==="popstate"?t===tg?!1:(tg=t,!0):(tg=null,!1)}var DC=typeof setTimeout=="function"?setTimeout:void 0,cP=typeof clearTimeout=="function"?clearTimeout:void 0,HT=typeof Promise=="function"?Promise:void 0,dP=typeof queueMicrotask=="function"?queueMicrotask:typeof HT<"u"?function(t){return HT.resolve(null).then(t).catch(fP)}:DC;function fP(t){setTimeout(function(){throw t})}function Vs(t){return t==="head"}function GT(t,e){var n=e,a=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(a===0){t.removeChild(r),Mo(e);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")Tl(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,Tl(n);for(var s=n.firstChild;s;){var i=s.nextSibling,u=s.nodeName;s[zl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&s.rel.toLowerCase()==="stylesheet"||n.removeChild(s),s=i}}else n==="body"&&Tl(t.ownerDocument.body);n=r}while(n);Mo(e)}function jT(t,e){var n=t;t=0;do{var a=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=a}while(n)}function Kg(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Kg(n),ay(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function hP(t,e,n,a){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!a&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(a){if(!t[zl])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(s=t.getAttribute("rel"),s==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(s!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(s=t.getAttribute("src"),(s!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===s)return t}else return t;if(t=fa(t.nextSibling),t===null)break}return null}function pP(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=fa(t.nextSibling),t===null))return null;return t}function PC(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=fa(t.nextSibling),t===null))return null;return t}function Wg(t){return t.data==="$?"||t.data==="$~"}function Xg(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function mP(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var a=function(){e(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),t._reactRetry=a}}function fa(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Yg=null;function KT(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return fa(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function WT(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function OC(t,e,n){switch(e=kf(n),t){case"html":if(t=e.documentElement,!t)throw Error(V(452));return t;case"head":if(t=e.head,!t)throw Error(V(453));return t;case"body":if(t=e.body,!t)throw Error(V(454));return t;default:throw Error(V(451))}}function Tl(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);ay(t)}var ha=new Map,XT=new Set;function Df(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var Or=Be.d;Be.d={f:gP,r:yP,D:IP,C:_P,L:SP,m:vP,X:TP,S:EP,M:bP};function gP(){var t=Or.f(),e=Yf();return t||e}function yP(t){var e=Vo(t);e!==null&&e.tag===5&&e.type==="form"?Lw(e):Or.r(t)}var qo=typeof document>"u"?null:document;function MC(t,e,n){var a=qo;if(a&&typeof e=="string"&&e){var r=ua(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),XT.has(r)||(XT.add(r),t={rel:t,crossOrigin:n,href:e},a.querySelector(r)===null&&(e=a.createElement("link"),mn(e,"link",t),nn(e),a.head.appendChild(e)))}}function IP(t){Or.D(t),MC("dns-prefetch",t,null)}function _P(t,e){Or.C(t,e),MC("preconnect",t,e)}function SP(t,e,n){Or.L(t,e,n);var a=qo;if(a&&t&&e){var r='link[rel="preload"][as="'+ua(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+ua(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+ua(n.imageSizes)+'"]')):r+='[href="'+ua(t)+'"]';var s=r;switch(e){case"style":s=Oo(t);break;case"script":s=zo(t)}ha.has(s)||(t=it({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),ha.set(s,t),a.querySelector(r)!==null||e==="style"&&a.querySelector(Xl(s))||e==="script"&&a.querySelector(Yl(s))||(e=a.createElement("link"),mn(e,"link",t),nn(e),a.head.appendChild(e)))}}function vP(t,e){Or.m(t,e);var n=qo;if(n&&t){var a=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+ua(a)+'"][href="'+ua(t)+'"]',s=r;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=zo(t)}if(!ha.has(s)&&(t=it({rel:"modulepreload",href:t},e),ha.set(s,t),n.querySelector(r)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Yl(s)))return}a=n.createElement("link"),mn(a,"link",t),nn(a),n.head.appendChild(a)}}}function EP(t,e,n){Or.S(t,e,n);var a=qo;if(a&&t){var r=Io(a).hoistableStyles,s=Oo(t);e=e||"default";var i=r.get(s);if(!i){var u={loading:0,preload:null};if(i=a.querySelector(Xl(s)))u.loading=5;else{t=it({rel:"stylesheet",href:t,"data-precedence":e},n),(n=ha.get(s))&&zy(t,n);var l=i=a.createElement("link");nn(l),mn(l,"link",t),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){u.loading|=1}),l.addEventListener("error",function(){u.loading|=2}),u.loading|=4,af(i,e,a)}i={type:"stylesheet",instance:i,count:1,state:u},r.set(s,i)}}}function TP(t,e){Or.X(t,e);var n=qo;if(n&&t){var a=Io(n).hoistableScripts,r=zo(t),s=a.get(r);s||(s=n.querySelector(Yl(r)),s||(t=it({src:t,async:!0},e),(e=ha.get(r))&&Hy(t,e),s=n.createElement("script"),nn(s),mn(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function bP(t,e){Or.M(t,e);var n=qo;if(n&&t){var a=Io(n).hoistableScripts,r=zo(t),s=a.get(r);s||(s=n.querySelector(Yl(r)),s||(t=it({src:t,async:!0,type:"module"},e),(e=ha.get(r))&&Hy(t,e),s=n.createElement("script"),nn(s),mn(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function YT(t,e,n,a){var r=(r=Ts.current)?Df(r):null;if(!r)throw Error(V(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Oo(n.href),n=Io(r).hoistableStyles,a=n.get(e),a||(a={type:"style",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Oo(n.href);var s=Io(r).hoistableStyles,i=s.get(t);if(i||(r=r.ownerDocument||r,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(t,i),(s=r.querySelector(Xl(t)))&&!s._p&&(i.instance=s,i.state.loading=5),ha.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},ha.set(t,n),s||wP(r,t,n,i.state))),e&&a===null)throw Error(V(528,""));return i}if(e&&a!==null)throw Error(V(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=zo(n),n=Io(r).hoistableScripts,a=n.get(e),a||(a={type:"script",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(V(444,t))}}function Oo(t){return'href="'+ua(t)+'"'}function Xl(t){return'link[rel="stylesheet"]['+t+"]"}function NC(t){return it({},t,{"data-precedence":t.precedence,precedence:null})}function wP(t,e,n,a){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?a.loading=1:(e=t.createElement("link"),a.preload=e,e.addEventListener("load",function(){return a.loading|=1}),e.addEventListener("error",function(){return a.loading|=2}),mn(e,"link",n),nn(e),t.head.appendChild(e))}function zo(t){return'[src="'+ua(t)+'"]'}function Yl(t){return"script[async]"+t}function QT(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var a=t.querySelector('style[data-href~="'+ua(n.href)+'"]');if(a)return e.instance=a,nn(a),a;var r=it({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(t.ownerDocument||t).createElement("style"),nn(a),mn(a,"style",r),af(a,n.precedence,t),e.instance=a;case"stylesheet":r=Oo(n.href);var s=t.querySelector(Xl(r));if(s)return e.state.loading|=4,e.instance=s,nn(s),s;a=NC(n),(r=ha.get(r))&&zy(a,r),s=(t.ownerDocument||t).createElement("link"),nn(s);var i=s;return i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),mn(s,"link",a),e.state.loading|=4,af(s,n.precedence,t),e.instance=s;case"script":return s=zo(n.src),(r=t.querySelector(Yl(s)))?(e.instance=r,nn(r),r):(a=n,(r=ha.get(s))&&(a=it({},n),Hy(a,r)),t=t.ownerDocument||t,r=t.createElement("script"),nn(r),mn(r,"link",a),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(V(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(a=e.instance,e.state.loading|=4,af(a,n.precedence,t));return e.instance}function af(t,e,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=a.length?a[a.length-1]:null,s=r,i=0;i<a.length;i++){var u=a[i];if(u.dataset.precedence===e)s=u;else if(s!==r)break}s?s.parentNode.insertBefore(t,s.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function zy(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Hy(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var rf=null;function $T(t,e,n){if(rf===null){var a=new Map,r=rf=new Map;r.set(n,a)}else r=rf,a=r.get(n),a||(a=new Map,r.set(n,a));if(a.has(t))return a;for(a.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var s=n[r];if(!(s[zl]||s[fn]||t==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var i=s.getAttribute(e)||"";i=t+i;var u=a.get(i);u?u.push(s):a.set(i,[s])}}return a}function JT(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function CP(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function VC(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function LP(t,e,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(n.state.loading&4)){if(n.instance===null){var r=Oo(a.href),s=e.querySelector(Xl(r));if(s){e=s._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Pf.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=s,nn(s);return}s=e.ownerDocument||e,a=NC(a),(r=ha.get(r))&&zy(a,r),s=s.createElement("link"),nn(s);var i=s;i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),mn(s,"link",a),n.instance=s}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&!(n.state.loading&3)&&(t.count++,n=Pf.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var ng=0;function AP(t,e){return t.stylesheets&&t.count===0&&sf(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var a=setTimeout(function(){if(t.stylesheets&&sf(t,t.stylesheets),t.unsuspend){var s=t.unsuspend;t.unsuspend=null,s()}},6e4+e);0<t.imgBytes&&ng===0&&(ng=62500*uP());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&sf(t,t.stylesheets),t.unsuspend)){var s=t.unsuspend;t.unsuspend=null,s()}},(t.imgBytes>ng?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(a),clearTimeout(r)}}:null}function Pf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)sf(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Of=null;function sf(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Of=new Map,e.forEach(xP,t),Of=null,Pf.call(t))}function xP(t,e){if(!(e.state.loading&4)){var n=Of.get(t);if(n)var a=n.get(null);else{n=new Map,Of.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var i=r[s];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),a=i)}a&&n.set(null,a)}r=e.instance,i=r.getAttribute("data-precedence"),s=n.get(i)||a,s===a&&n.set(null,r),n.set(i,r),this.count++,a=Pf.bind(this),r.addEventListener("load",a),r.addEventListener("error",a),s?s.parentNode.insertBefore(r,s.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var Ml={$$typeof:Tr,Provider:null,Consumer:null,_currentValue:oi,_currentValue2:oi,_threadCount:0};function RP(t,e,n,a,r,s,i,u,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Am(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Am(0),this.hiddenUpdates=Am(null),this.identifierPrefix=a,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function FC(t,e,n,a,r,s,i,u,l,c,f,p){return t=new RP(t,e,n,i,l,c,f,p,u),e=1,s===!0&&(e|=24),s=Kn(3,null,null,e),t.current=s,s.stateNode=t,e=my(),e.refCount++,t.pooledCache=e,e.refCount++,s.memoizedState={element:a,isDehydrated:n,cache:e},Iy(s),t}function UC(t){return t?(t=po,t):po}function BC(t,e,n,a,r,s){r=UC(r),a.context===null?a.context=r:a.pendingContext=r,a=ws(e),a.payload={element:n},s=s===void 0?null:s,s!==null&&(a.callback=s),n=Cs(t,a,e),n!==null&&(kn(n,t,e),ml(n,t,e))}function ZT(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Gy(t,e){ZT(t,e),(t=t.alternate)&&ZT(t,e)}function qC(t){if(t.tag===13||t.tag===31){var e=Si(t,67108864);e!==null&&kn(e,t,67108864),Gy(t,67108864)}}function eb(t){if(t.tag===13||t.tag===31){var e=$n();e=ty(e);var n=Si(t,e);n!==null&&kn(n,t,e),Gy(t,e)}}var Mf=!0;function kP(t,e,n,a){var r=ie.T;ie.T=null;var s=Be.p;try{Be.p=2,jy(t,e,n,a)}finally{Be.p=s,ie.T=r}}function DP(t,e,n,a){var r=ie.T;ie.T=null;var s=Be.p;try{Be.p=8,jy(t,e,n,a)}finally{Be.p=s,ie.T=r}}function jy(t,e,n,a){if(Mf){var r=Qg(a);if(r===null)eg(t,e,a,Nf,n),tb(t,a);else if(OP(r,t,e,n,a))a.stopPropagation();else if(tb(t,a),e&4&&-1<PP.indexOf(t)){for(;r!==null;){var s=Vo(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var i=ri(s.pendingLanes);if(i!==0){var u=s;for(u.pendingLanes|=2,u.entangledLanes|=2;i;){var l=1<<31-Qn(i);u.entanglements[1]|=l,i&=~l}za(s),!(Ue&6)&&(wf=Xn()+500,Wl(0,!1))}}break;case 31:case 13:u=Si(s,2),u!==null&&kn(u,s,2),Yf(),Gy(s,2)}if(s=Qg(a),s===null&&eg(t,e,a,Nf,n),s===r)break;r=s}r!==null&&a.stopPropagation()}else eg(t,e,a,null,n)}}function Qg(t){return t=sy(t),Ky(t)}var Nf=null;function Ky(t){if(Nf=null,t=oo(t),t!==null){var e=Fl(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=ob(e),t!==null)return t;t=null}else if(n===31){if(t=ub(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Nf=t,null}function zC(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(S1()){case fb:return 2;case hb:return 8;case df:case v1:return 32;case pb:return 268435456;default:return 32}default:return 32}}var $g=!1,xs=null,Rs=null,ks=null,Nl=new Map,Vl=new Map,ys=[],PP="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function tb(t,e){switch(t){case"focusin":case"focusout":xs=null;break;case"dragenter":case"dragleave":Rs=null;break;case"mouseover":case"mouseout":ks=null;break;case"pointerover":case"pointerout":Nl.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Vl.delete(e.pointerId)}}function rl(t,e,n,a,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:a,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Vo(e),e!==null&&qC(e)),t):(t.eventSystemFlags|=a,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function OP(t,e,n,a,r){switch(e){case"focusin":return xs=rl(xs,t,e,n,a,r),!0;case"dragenter":return Rs=rl(Rs,t,e,n,a,r),!0;case"mouseover":return ks=rl(ks,t,e,n,a,r),!0;case"pointerover":var s=r.pointerId;return Nl.set(s,rl(Nl.get(s)||null,t,e,n,a,r)),!0;case"gotpointercapture":return s=r.pointerId,Vl.set(s,rl(Vl.get(s)||null,t,e,n,a,r)),!0}return!1}function HC(t){var e=oo(t.target);if(e!==null){var n=Fl(e);if(n!==null){if(e=n.tag,e===13){if(e=ob(n),e!==null){t.blockedOn=e,FE(t.priority,function(){eb(n)});return}}else if(e===31){if(e=ub(n),e!==null){t.blockedOn=e,FE(t.priority,function(){eb(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function of(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Qg(t.nativeEvent);if(n===null){n=t.nativeEvent;var a=new n.constructor(n.type,n);mg=a,n.target.dispatchEvent(a),mg=null}else return e=Vo(n),e!==null&&qC(e),t.blockedOn=n,!1;e.shift()}return!0}function nb(t,e,n){of(t)&&n.delete(e)}function MP(){$g=!1,xs!==null&&of(xs)&&(xs=null),Rs!==null&&of(Rs)&&(Rs=null),ks!==null&&of(ks)&&(ks=null),Nl.forEach(nb),Vl.forEach(nb)}function Gd(t,e){t.blockedOn===e&&(t.blockedOn=null,$g||($g=!0,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,MP)))}var jd=null;function ab(t){jd!==t&&(jd=t,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,function(){jd===t&&(jd=null);for(var e=0;e<t.length;e+=3){var n=t[e],a=t[e+1],r=t[e+2];if(typeof a!="function"){if(Ky(a||n)===null)continue;break}var s=Vo(n);s!==null&&(t.splice(e,3),e-=3,kg(s,{pending:!0,data:r,method:n.method,action:a},a,r))}}))}function Mo(t){function e(l){return Gd(l,t)}xs!==null&&Gd(xs,t),Rs!==null&&Gd(Rs,t),ks!==null&&Gd(ks,t),Nl.forEach(e),Vl.forEach(e);for(var n=0;n<ys.length;n++){var a=ys[n];a.blockedOn===t&&(a.blockedOn=null)}for(;0<ys.length&&(n=ys[0],n.blockedOn===null);)HC(n),n.blockedOn===null&&ys.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var r=n[a],s=n[a+1],i=r[Dn]||null;if(typeof s=="function")i||ab(n);else if(i){var u=null;if(s&&s.hasAttribute("formAction")){if(r=s,i=s[Dn]||null)u=i.formAction;else if(Ky(r)!==null)continue}else u=i.action;typeof u=="function"?n[a+1]=u:(n.splice(a,3),a-=3),ab(n)}}}function GC(){function t(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(i){return r=i})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function Wy(t){this._internalRoot=t}Jf.prototype.render=Wy.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(V(409));var n=e.current,a=$n();BC(n,a,t,e,null,null)};Jf.prototype.unmount=Wy.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;BC(t.current,2,null,t,null,null),Yf(),e[No]=null}};function Jf(t){this._internalRoot=t}Jf.prototype.unstable_scheduleHydration=function(t){if(t){var e=_b();t={blockedOn:null,target:t,priority:e};for(var n=0;n<ys.length&&e!==0&&e<ys[n].priority;n++);ys.splice(n,0,t),n===0&&HC(t)}};var rb=sb.version;if(rb!=="19.2.3")throw Error(V(527,rb,"19.2.3"));Be.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(V(188)):(t=Object.keys(t).join(","),Error(V(268,t)));return t=h1(e),t=t!==null?lb(t):null,t=t===null?null:t.stateNode,t};var NP={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:ie,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(sl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!sl.isDisabled&&sl.supportsFiber))try{Ul=sl.inject(NP),Yn=sl}catch{}var sl;Zf.createRoot=function(t,e){if(!ib(t))throw Error(V(299));var n=!1,a="",r=Mw,s=Nw,i=Vw;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(a=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(s=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=FC(t,1,!1,null,null,n,a,null,r,s,i,GC),t[No]=e.current,qy(t),new Wy(e)};Zf.hydrateRoot=function(t,e,n){if(!ib(t))throw Error(V(299));var a=!1,r="",s=Mw,i=Nw,u=Vw,l=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(s=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(u=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),e=FC(t,1,!0,e,n??null,a,r,l,s,i,u,GC),e.context=UC(null),n=e.current,a=$n(),a=ty(a),r=ws(a),r.callback=null,Cs(n,r,a),n=a,e.current.lanes=n,ql(e,n),za(e),t[No]=e.current,qy(t),new Jf(e)};Zf.version="19.2.3"});var XC=Ne((JU,WC)=>{"use strict";function KC(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(KC)}catch(t){console.error(t)}}KC(),WC.exports=jC()});var YC=Ne((tB,Zy)=>{var Jy=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,a=Object.defineProperty||function(M,O,B){M[O]=B.value},r,s=typeof Symbol=="function"?Symbol:{},i=s.iterator||"@@iterator",u=s.asyncIterator||"@@asyncIterator",l=s.toStringTag||"@@toStringTag";function c(M,O,B){return Object.defineProperty(M,O,{value:B,enumerable:!0,configurable:!0,writable:!0}),M[O]}try{c({},"")}catch{c=function(O,B,$){return O[B]=$}}function f(M,O,B,$){var Y=O&&O.prototype instanceof E?O:E,re=Object.create(Y.prototype),Je=new de($||[]);return a(re,"_invoke",{value:b(M,B,Je)}),re}t.wrap=f;function p(M,O,B){try{return{type:"normal",arg:M.call(O,B)}}catch($){return{type:"throw",arg:$}}}var m="suspendedStart",S="suspendedYield",R="executing",D="completed",L={};function E(){}function v(){}function C(){}var x={};c(x,i,function(){return this});var G=Object.getPrototypeOf,z=G&&G(G(ee([])));z&&z!==e&&n.call(z,i)&&(x=z);var I=C.prototype=E.prototype=Object.create(x);v.prototype=C,a(I,"constructor",{value:C,configurable:!0}),a(C,"constructor",{value:v,configurable:!0}),v.displayName=c(C,l,"GeneratorFunction");function y(M){["next","throw","return"].forEach(function(O){c(M,O,function(B){return this._invoke(O,B)})})}t.isGeneratorFunction=function(M){var O=typeof M=="function"&&M.constructor;return O?O===v||(O.displayName||O.name)==="GeneratorFunction":!1},t.mark=function(M){return Object.setPrototypeOf?Object.setPrototypeOf(M,C):(M.__proto__=C,c(M,l,"GeneratorFunction")),M.prototype=Object.create(I),M},t.awrap=function(M){return{__await:M}};function _(M,O){function B(re,Je,Me,Xe){var dt=p(M[re],M,Je);if(dt.type==="throw")Xe(dt.arg);else{var ta=dt.arg,yn=ta.value;return yn&&typeof yn=="object"&&n.call(yn,"__await")?O.resolve(yn.__await).then(function(Ze){B("next",Ze,Me,Xe)},function(Ze){B("throw",Ze,Me,Xe)}):O.resolve(yn).then(function(Ze){ta.value=Ze,Me(ta)},function(Ze){return B("throw",Ze,Me,Xe)})}}var $;function Y(re,Je){function Me(){return new O(function(Xe,dt){B(re,Je,Xe,dt)})}return $=$?$.then(Me,Me):Me()}a(this,"_invoke",{value:Y})}y(_.prototype),c(_.prototype,u,function(){return this}),t.AsyncIterator=_,t.async=function(M,O,B,$,Y){Y===void 0&&(Y=Promise);var re=new _(f(M,O,B,$),Y);return t.isGeneratorFunction(O)?re:re.next().then(function(Je){return Je.done?Je.value:re.next()})};function b(M,O,B){var $=m;return function(re,Je){if($===R)throw new Error("Generator is already running");if($===D){if(re==="throw")throw Je;return he()}for(B.method=re,B.arg=Je;;){var Me=B.delegate;if(Me){var Xe=w(Me,B);if(Xe){if(Xe===L)continue;return Xe}}if(B.method==="next")B.sent=B._sent=B.arg;else if(B.method==="throw"){if($===m)throw $=D,B.arg;B.dispatchException(B.arg)}else B.method==="return"&&B.abrupt("return",B.arg);$=R;var dt=p(M,O,B);if(dt.type==="normal"){if($=B.done?D:S,dt.arg===L)continue;return{value:dt.arg,done:B.done}}else dt.type==="throw"&&($=D,B.method="throw",B.arg=dt.arg)}}}function w(M,O){var B=O.method,$=M.iterator[B];if($===r)return O.delegate=null,B==="throw"&&M.iterator.return&&(O.method="return",O.arg=r,w(M,O),O.method==="throw")||B!=="return"&&(O.method="throw",O.arg=new TypeError("The iterator does not provide a '"+B+"' method")),L;var Y=p($,M.iterator,O.arg);if(Y.type==="throw")return O.method="throw",O.arg=Y.arg,O.delegate=null,L;var re=Y.arg;if(!re)return O.method="throw",O.arg=new TypeError("iterator result is not an object"),O.delegate=null,L;if(re.done)O[M.resultName]=re.value,O.next=M.nextLoc,O.method!=="return"&&(O.method="next",O.arg=r);else return re;return O.delegate=null,L}y(I),c(I,l,"Generator"),c(I,i,function(){return this}),c(I,"toString",function(){return"[object Generator]"});function A(M){var O={tryLoc:M[0]};1 in M&&(O.catchLoc=M[1]),2 in M&&(O.finallyLoc=M[2],O.afterLoc=M[3]),this.tryEntries.push(O)}function T(M){var O=M.completion||{};O.type="normal",delete O.arg,M.completion=O}function de(M){this.tryEntries=[{tryLoc:"root"}],M.forEach(A,this),this.reset(!0)}t.keys=function(M){var O=Object(M),B=[];for(var $ in O)B.push($);return B.reverse(),function Y(){for(;B.length;){var re=B.pop();if(re in O)return Y.value=re,Y.done=!1,Y}return Y.done=!0,Y}};function ee(M){if(M){var O=M[i];if(O)return O.call(M);if(typeof M.next=="function")return M;if(!isNaN(M.length)){var B=-1,$=function Y(){for(;++B<M.length;)if(n.call(M,B))return Y.value=M[B],Y.done=!1,Y;return Y.value=r,Y.done=!0,Y};return $.next=$}}return{next:he}}t.values=ee;function he(){return{value:r,done:!0}}return de.prototype={constructor:de,reset:function(M){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(T),!M)for(var O in this)O.charAt(0)==="t"&&n.call(this,O)&&!isNaN(+O.slice(1))&&(this[O]=r)},stop:function(){this.done=!0;var M=this.tryEntries[0],O=M.completion;if(O.type==="throw")throw O.arg;return this.rval},dispatchException:function(M){if(this.done)throw M;var O=this;function B(Xe,dt){return re.type="throw",re.arg=M,O.next=Xe,dt&&(O.method="next",O.arg=r),!!dt}for(var $=this.tryEntries.length-1;$>=0;--$){var Y=this.tryEntries[$],re=Y.completion;if(Y.tryLoc==="root")return B("end");if(Y.tryLoc<=this.prev){var Je=n.call(Y,"catchLoc"),Me=n.call(Y,"finallyLoc");if(Je&&Me){if(this.prev<Y.catchLoc)return B(Y.catchLoc,!0);if(this.prev<Y.finallyLoc)return B(Y.finallyLoc)}else if(Je){if(this.prev<Y.catchLoc)return B(Y.catchLoc,!0)}else if(Me){if(this.prev<Y.finallyLoc)return B(Y.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(M,O){for(var B=this.tryEntries.length-1;B>=0;--B){var $=this.tryEntries[B];if($.tryLoc<=this.prev&&n.call($,"finallyLoc")&&this.prev<$.finallyLoc){var Y=$;break}}Y&&(M==="break"||M==="continue")&&Y.tryLoc<=O&&O<=Y.finallyLoc&&(Y=null);var re=Y?Y.completion:{};return re.type=M,re.arg=O,Y?(this.method="next",this.next=Y.finallyLoc,L):this.complete(re)},complete:function(M,O){if(M.type==="throw")throw M.arg;return M.type==="break"||M.type==="continue"?this.next=M.arg:M.type==="return"?(this.rval=this.arg=M.arg,this.method="return",this.next="end"):M.type==="normal"&&O&&(this.next=O),L},finish:function(M){for(var O=this.tryEntries.length-1;O>=0;--O){var B=this.tryEntries[O];if(B.finallyLoc===M)return this.complete(B.completion,B.afterLoc),T(B),L}},catch:function(M){for(var O=this.tryEntries.length-1;O>=0;--O){var B=this.tryEntries[O];if(B.tryLoc===M){var $=B.completion;if($.type==="throw"){var Y=$.arg;T(B)}return Y}}throw new Error("illegal catch attempt")},delegateYield:function(M,O,B){return this.delegate={iterator:ee(M),resultName:O,nextLoc:B},this.method==="next"&&(this.arg=r),L}},t}(typeof Zy=="object"?Zy.exports:{});try{regeneratorRuntime=Jy}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=Jy:Function("r","regeneratorRuntime = r")(Jy)}});var eh=Ne((nB,QC)=>{"use strict";QC.exports=(t,e)=>`${t}-${e}-${Math.random().toString(16).slice(3,8)}`});var eI=Ne((aB,JC)=>{"use strict";var UP=eh(),$C=0;JC.exports=({id:t,action:e,payload:n={}})=>{let a=t;return typeof a>"u"&&(a=UP("Job",$C),$C+=1),{id:a,action:e,payload:n}}});var th=Ne(Ql=>{"use strict";var tI=!1;Ql.logging=tI;Ql.setLogging=t=>{tI=t};Ql.log=(...t)=>tI?console.log.apply(Ql,t):null});var nL=Ne((eL,tL)=>{"use strict";var BP=eI(),{log:nh}=th(),qP=eh(),ZC=0;tL.exports=()=>{let t=qP("Scheduler",ZC),e={},n={},a=[];ZC+=1;let r=()=>a.length,s=()=>Object.keys(e).length,i=()=>{if(a.length!==0){let p=Object.keys(e);for(let m=0;m<p.length;m+=1)if(typeof n[p[m]]>"u"){a[0](e[p[m]]);break}}},u=(p,m)=>new Promise((S,R)=>{let D=BP({action:p,payload:m});a.push(async L=>{a.shift(),n[L.id]=D;try{S(await L[p].apply(eL,[...m,D.id]))}catch(E){R(E)}finally{delete n[L.id],i()}}),nh(`[${t}]: Add ${D.id} to JobQueue`),nh(`[${t}]: JobQueue length=${a.length}`),i()});return{addWorker:p=>(e[p.id]=p,nh(`[${t}]: Add ${p.id}`),nh(`[${t}]: Number of workers=${s()}`),i(),p.id),addJob:async(p,...m)=>{if(s()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return u(p,m)},terminate:async()=>{Object.keys(e).forEach(async p=>{await e[p].terminate()}),a=[]},getQueueLen:r,getNumWorkers:s}}});var rL=Ne((sB,aL)=>{"use strict";aL.exports=t=>{let e={};return typeof WorkerGlobalScope<"u"?e.type="webworker":typeof document=="object"?e.type="browser":typeof process=="object"&&typeof sE=="function"&&(e.type="node"),typeof t>"u"?e:e[t]}});var iL=Ne((oB,sL)=>{"use strict";var zP=rL()("type")==="browser",HP=zP?t=>new URL(t,window.location.href).href:t=>t;sL.exports=t=>{let e={...t};return["corePath","workerPath","langPath"].forEach(n=>{t[n]&&(e[n]=HP(e[n]))}),e}});var nI=Ne((uB,oL)=>{"use strict";oL.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}});var uL=Ne((lB,GP)=>{GP.exports={name:"tesseract.js",version:"7.0.0",description:"Pure Javascript Multilingual OCR",main:"src/index.js",type:"commonjs",types:"src/index.d.ts",unpkg:"dist/tesseract.min.js",jsdelivr:"dist/tesseract.min.js",scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs","profile:tesseract":"webpack-bundle-analyzer dist/tesseract-stats.json","profile:worker":"webpack-bundle-analyzer dist/worker-stats.json",prepublishOnly:"npm run build",wait:"rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser test:node:all","test:browser":"karma start karma.conf.js","test:node":"nyc mocha --exit --bail --require ./scripts/test-helper.mjs","test:node:all":"npm run test:node -- ./tests/*.test.mjs",lint:"eslint src","lint:fix":"eslint --fix src",postinstall:"opencollective-postinstall || true"},browser:{"./src/worker/node/index.js":"./src/worker/browser/index.js"},author:"",contributors:["jeromewu"],license:"Apache-2.0",devDependencies:{"@babel/core":"^7.21.4","@babel/eslint-parser":"^7.21.3","@babel/preset-env":"^7.21.4","@rollup/plugin-commonjs":"^24.1.0",acorn:"^8.8.2","babel-loader":"^9.1.2",buffer:"^6.0.3",cors:"^2.8.5",eslint:"^7.32.0","eslint-config-airbnb-base":"^14.2.1","eslint-plugin-import":"^2.27.5","expect.js":"^0.3.1",express:"^4.18.2",mocha:"^10.2.0","npm-run-all":"^4.1.5",karma:"^6.4.2","karma-chrome-launcher":"^3.2.0","karma-firefox-launcher":"^2.1.2","karma-mocha":"^2.0.1","karma-webpack":"^5.0.0",nyc:"^15.1.0",rimraf:"^5.0.0",rollup:"^3.20.7","wait-on":"^7.0.1",webpack:"^5.79.0","webpack-bundle-analyzer":"^4.8.0","webpack-cli":"^5.0.1","webpack-dev-middleware":"^6.0.2","rollup-plugin-sourcemaps":"^0.6.3"},dependencies:{"bmp-js":"^0.1.0","idb-keyval":"^6.2.0","is-url":"^1.2.4","node-fetch":"^2.6.9","opencollective-postinstall":"^2.0.3","regenerator-runtime":"^0.13.3","tesseract.js-core":"^7.0.0","wasm-feature-detect":"^1.8.0",zlibjs:"^0.3.1"},overrides:{"@rollup/pluginutils":"^5.0.2"},repository:{type:"git",url:"https://github.com/naptha/tesseract.js.git"},bugs:{url:"https://github.com/naptha/tesseract.js/issues"},homepage:"https://github.com/naptha/tesseract.js",collective:{type:"opencollective",url:"https://opencollective.com/tesseractjs"}}});var cL=Ne((cB,lL)=>{"use strict";lL.exports={workerBlobURL:!0,logger:()=>{}}});var fL=Ne((dB,dL)=>{"use strict";var jP=uL().version,KP=cL();dL.exports={...KP,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${jP}/dist/worker.min.js`}});var pL=Ne((fB,hL)=>{"use strict";hL.exports=({workerPath:t,workerBlobURL:e})=>{let n;if(Blob&&URL&&e){let a=new Blob([`importScripts("${t}");`],{type:"application/javascript"});n=new Worker(URL.createObjectURL(a))}else n=new Worker(t);return n}});var gL=Ne((hB,mL)=>{"use strict";mL.exports=t=>{t.terminate()}});var IL=Ne((pB,yL)=>{"use strict";yL.exports=(t,e)=>{t.onmessage=({data:n})=>{e(n)}}});var SL=Ne((mB,_L)=>{"use strict";_L.exports=async(t,e)=>{t.postMessage(e)}});var EL=Ne((gB,vL)=>{"use strict";var aI=t=>new Promise((e,n)=>{let a=new FileReader;a.onload=()=>{e(a.result)},a.onerror=({target:{error:{code:r}}})=>{n(Error(`File could not be read! Code=${r}`))},a.readAsArrayBuffer(t)}),rI=async t=>{let e=t;if(typeof t>"u")return"undefined";if(typeof t=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(t)?e=atob(t.split(",")[1]).split("").map(n=>n.charCodeAt(0)):e=await(await fetch(t)).arrayBuffer();else if(typeof HTMLElement<"u"&&t instanceof HTMLElement)t.tagName==="IMG"&&(e=await rI(t.src)),t.tagName==="VIDEO"&&(e=await rI(t.poster)),t.tagName==="CANVAS"&&await new Promise(n=>{t.toBlob(async a=>{e=await aI(a),n()})});else if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas){let n=await t.convertToBlob();e=await aI(n)}else(t instanceof File||t instanceof Blob)&&(e=await aI(t));return new Uint8Array(e)};vL.exports=rI});var bL=Ne((yB,TL)=>{"use strict";var WP=fL(),XP=pL(),YP=gL(),QP=IL(),$P=SL(),JP=EL();TL.exports={defaultOptions:WP,spawnWorker:XP,terminateWorker:YP,onMessage:QP,send:$P,loadImage:JP}});var sI=Ne((IB,AL)=>{"use strict";var ZP=iL(),Ha=eI(),{log:wL}=th(),eO=eh(),Ei=nI(),{defaultOptions:tO,spawnWorker:nO,terminateWorker:aO,onMessage:rO,loadImage:CL,send:sO}=bL(),LL=0;AL.exports=async(t="eng",e=Ei.LSTM_ONLY,n={},a={})=>{let r=eO("Worker",LL),{logger:s,errorHandler:i,...u}=ZP({...tO,...n}),l={},c=typeof t=="string"?t.split("+"):t,f=e,p=a,m=[Ei.DEFAULT,Ei.LSTM_ONLY].includes(e)&&!u.legacyCore,S,R,D=new Promise((M,O)=>{R=M,S=O}),L=M=>{S(M.message)},E=nO(u);E.onerror=L,LL+=1;let v=({id:M,action:O,payload:B})=>new Promise(($,Y)=>{wL(`[${r}]: Start ${M}, action=${O}`);let re=`${O}-${M}`;l[re]={resolve:$,reject:Y},sO(E,{workerId:r,jobId:M,action:O,payload:B})}),C=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),x=M=>v(Ha({id:M,action:"load",payload:{options:{lstmOnly:m,corePath:u.corePath,logging:u.logging}}})),G=(M,O,B)=>v(Ha({id:B,action:"FS",payload:{method:"writeFile",args:[M,O]}})),z=(M,O)=>v(Ha({id:O,action:"FS",payload:{method:"readFile",args:[M,{encoding:"utf8"}]}})),I=(M,O)=>v(Ha({id:O,action:"FS",payload:{method:"unlink",args:[M]}})),y=(M,O,B)=>v(Ha({id:B,action:"FS",payload:{method:M,args:O}})),_=(M,O)=>v(Ha({id:O,action:"loadLanguage",payload:{langs:M,options:{langPath:u.langPath,dataPath:u.dataPath,cachePath:u.cachePath,cacheMethod:u.cacheMethod,gzip:u.gzip,lstmOnly:[Ei.DEFAULT,Ei.LSTM_ONLY].includes(f)&&!u.legacyLang}}})),b=(M,O,B,$)=>v(Ha({id:$,action:"initialize",payload:{langs:M,oem:O,config:B}})),w=(M="eng",O,B,$)=>{if(m&&[Ei.TESSERACT_ONLY,Ei.TESSERACT_LSTM_COMBINED].includes(O))throw Error("Legacy model requested but code missing.");let Y=O||f;f=Y;let re=B||p;p=re;let Me=(typeof M=="string"?M.split("+"):M).filter(Xe=>!c.includes(Xe));return c.push(...Me),Me.length>0?_(Me,$).then(()=>b(M,Y,re,$)):b(M,Y,re,$)},A=(M={},O)=>v(Ha({id:O,action:"setParameters",payload:{params:M}})),T=async(M,O={},B={text:!0},$)=>v(Ha({id:$,action:"recognize",payload:{image:await CL(M),options:O,output:B}})),de=async(M,O)=>{if(m)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return v(Ha({id:O,action:"detect",payload:{image:await CL(M)}}))},ee=async()=>(E!==null&&(aO(E),E=null),Promise.resolve());rO(E,({workerId:M,jobId:O,status:B,action:$,data:Y})=>{let re=`${$}-${O}`;if(B==="resolve")wL(`[${M}]: Complete ${O}`),l[re].resolve({jobId:O,data:Y}),delete l[re];else if(B==="reject")if(l[re].reject(Y),delete l[re],$==="load"&&S(Y),i)i(Y);else throw Error(Y);else B==="progress"&&s({...Y,userJobId:O})});let he={id:r,worker:E,load:C,writeText:G,readText:z,removeFile:I,FS:y,reinitialize:w,setParameters:A,recognize:T,detect:de,terminate:ee};return x().then(()=>_(t)).then(()=>b(t,e,a)).then(()=>R(he)).catch(()=>{}),D}});var kL=Ne((_B,RL)=>{"use strict";var xL=sI(),iO=async(t,e,n)=>{let a=await xL(e,1,n);return a.recognize(t).finally(async()=>{await a.terminate()})},oO=async(t,e)=>{let n=await xL("osd",0,e);return n.detect(t).finally(async()=>{await n.terminate()})};RL.exports={recognize:iO,detect:oO}});var PL=Ne((SB,DL)=>{"use strict";DL.exports={AFR:"afr",AMH:"amh",ARA:"ara",ASM:"asm",AZE:"aze",AZE_CYRL:"aze_cyrl",BEL:"bel",BEN:"ben",BOD:"bod",BOS:"bos",BUL:"bul",CAT:"cat",CEB:"ceb",CES:"ces",CHI_SIM:"chi_sim",CHI_TRA:"chi_tra",CHR:"chr",CYM:"cym",DAN:"dan",DEU:"deu",DZO:"dzo",ELL:"ell",ENG:"eng",ENM:"enm",EPO:"epo",EST:"est",EUS:"eus",FAS:"fas",FIN:"fin",FRA:"fra",FRK:"frk",FRM:"frm",GLE:"gle",GLG:"glg",GRC:"grc",GUJ:"guj",HAT:"hat",HEB:"heb",HIN:"hin",HRV:"hrv",HUN:"hun",IKU:"iku",IND:"ind",ISL:"isl",ITA:"ita",ITA_OLD:"ita_old",JAV:"jav",JPN:"jpn",KAN:"kan",KAT:"kat",KAT_OLD:"kat_old",KAZ:"kaz",KHM:"khm",KIR:"kir",KOR:"kor",KUR:"kur",LAO:"lao",LAT:"lat",LAV:"lav",LIT:"lit",MAL:"mal",MAR:"mar",MKD:"mkd",MLT:"mlt",MSA:"msa",MYA:"mya",NEP:"nep",NLD:"nld",NOR:"nor",ORI:"ori",PAN:"pan",POL:"pol",POR:"por",PUS:"pus",RON:"ron",RUS:"rus",SAN:"san",SIN:"sin",SLK:"slk",SLV:"slv",SPA:"spa",SPA_OLD:"spa_old",SQI:"sqi",SRP:"srp",SRP_LATN:"srp_latn",SWA:"swa",SWE:"swe",SYR:"syr",TAM:"tam",TEL:"tel",TGK:"tgk",TGL:"tgl",THA:"tha",TIR:"tir",TUR:"tur",UIG:"uig",UKR:"ukr",URD:"urd",UZB:"uzb",UZB_CYRL:"uzb_cyrl",VIE:"vie",YID:"yid"}});var ML=Ne((vB,OL)=>{"use strict";OL.exports={OSD_ONLY:"0",AUTO_OSD:"1",AUTO_ONLY:"2",AUTO:"3",SINGLE_COLUMN:"4",SINGLE_BLOCK_VERT_TEXT:"5",SINGLE_BLOCK:"6",SINGLE_LINE:"7",SINGLE_WORD:"8",CIRCLE_WORD:"9",SINGLE_CHAR:"10",SPARSE_TEXT:"11",SPARSE_TEXT_OSD:"12",RAW_LINE:"13"}});var VL=Ne((EB,NL)=>{"use strict";YC();var uO=nL(),lO=sI(),cO=kL(),dO=PL(),fO=nI(),hO=ML(),{setLogging:pO}=th();NL.exports={languages:dO,OEM:fO,PSM:hO,createScheduler:uO,createWorker:lO,setLogging:pO,...cO}});var KR=Ne(Kp=>{"use strict";var uU=Symbol.for("react.transitional.element"),lU=Symbol.for("react.fragment");function jR(t,e,n){var a=null;if(n!==void 0&&(a=""+n),e.key!==void 0&&(a=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:uU,type:t,key:a,ref:e!==void 0?e:null,props:n}}Kp.Fragment=lU;Kp.jsx=jR;Kp.jsxs=jR});var gt=Ne((F3,WR)=>{"use strict";WR.exports=KR()});var nk={};Gk(nk,{captureScreenshot:()=>fU});var fU,ak=Hk(()=>{fU=async()=>null});var Te=Ce(Hn()),Ck=Ce(XC());var Xy="http://localhost:3000";console.log("[EXTENSION] Using API_BASE:",Xy);function VP(t){return typeof t=="string"?t.startsWith("http")?t:Xy+t:t instanceof URL?t.href:t.url}function FP(t,e={}){let n=VP(t),a=e.method||"GET",r=e.headers instanceof Headers||Array.isArray(e.headers)?Object.fromEntries(e.headers):{...e.headers},s=e.body??null;return new Promise((i,u)=>{chrome.runtime.sendMessage({type:"echly-api",url:n,method:a,headers:r,body:s},l=>{if(chrome.runtime.lastError){u(new Error(chrome.runtime.lastError.message));return}if(!l){u(new Error("No response from background"));return}let c=new Response(l.body??"",{status:l.status??0,headers:l.headers?new Headers(l.headers):void 0});i(c)})})}async function Et(t,e={}){let n=t.startsWith("http")?t:Xy+t;return FP(n,e)}function Yy(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function Qy(){return Yy()}function $y(t,e,n){return new Promise((a,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,screenshotId:n},s=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(s?.error){r(new Error(s.error));return}if(s?.url){a(s.url);return}r(new Error("No URL from background"))})})}async function iI(t){if(!t||typeof t!="string")return"";try{let n=await(await Promise.resolve().then(()=>Ce(VL()))).createWorker("eng",void 0,{logger:()=>{}}),{data:{text:a}}=await n.recognize(t);return await n.terminate(),!a||typeof a!="string"?"":a.replace(/\s+/g," ").trim().slice(0,2e3)}catch{return""}}var ga=Ce(Hn());var FL=()=>{};var qL=function(t){let e=[],n=0;for(let a=0;a<t.length;a++){let r=t.charCodeAt(a);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&a+1<t.length&&(t.charCodeAt(a+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++a)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},mO=function(t){let e=[],n=0,a=0;for(;n<t.length;){let r=t[n++];if(r<128)e[a++]=String.fromCharCode(r);else if(r>191&&r<224){let s=t[n++];e[a++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){let s=t[n++],i=t[n++],u=t[n++],l=((r&7)<<18|(s&63)<<12|(i&63)<<6|u&63)-65536;e[a++]=String.fromCharCode(55296+(l>>10)),e[a++]=String.fromCharCode(56320+(l&1023))}else{let s=t[n++],i=t[n++];e[a++]=String.fromCharCode((r&15)<<12|(s&63)<<6|i&63)}}return e.join("")},zL={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let r=0;r<t.length;r+=3){let s=t[r],i=r+1<t.length,u=i?t[r+1]:0,l=r+2<t.length,c=l?t[r+2]:0,f=s>>2,p=(s&3)<<4|u>>4,m=(u&15)<<2|c>>6,S=c&63;l||(S=64,i||(m=64)),a.push(n[f],n[p],n[m],n[S])}return a.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(qL(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):mO(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let n=e?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let r=0;r<t.length;){let s=n[t.charAt(r++)],u=r<t.length?n[t.charAt(r)]:0;++r;let c=r<t.length?n[t.charAt(r)]:64;++r;let p=r<t.length?n[t.charAt(r)]:64;if(++r,s==null||u==null||c==null||p==null)throw new uI;let m=s<<2|u>>4;if(a.push(m),c!==64){let S=u<<4&240|c>>2;if(a.push(S),p!==64){let R=c<<6&192|p;a.push(R)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},uI=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},gO=function(t){let e=qL(t);return zL.encodeByteArray(e,!0)},Jl=function(t){return gO(t).replace(/\./g,"")},rh=function(t){try{return zL.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function HL(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var yO=()=>HL().__FIREBASE_DEFAULTS__,IO=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},_O=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&rh(t[1]);return e&&JSON.parse(e)},sh=()=>{try{return FL()||yO()||IO()||_O()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},cI=t=>sh()?.emulatorHosts?.[t],ih=t=>{let e=cI(t);if(!e)return;let n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let a=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),a]:[e.substring(0,n),a]},dI=()=>sh()?.config,fI=t=>sh()?.[`_${t}`];var ah=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,a)=>{n?this.reject(n):this.resolve(a),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,a))}}};function Ga(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Ho(t){return(await fetch(t,{credentials:"include"})).ok}function oh(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let n={alg:"none",type:"JWT"},a=e||"demo-project",r=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let i={iss:`https://securetoken.google.com/${a}`,aud:a,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[Jl(JSON.stringify(n)),Jl(JSON.stringify(i)),""].join(".")}var $l={};function SO(){let t={prod:[],emulator:[]};for(let e of Object.keys($l))$l[e]?t.emulator.push(e):t.prod.push(e);return t}function vO(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}var UL=!1;function Go(t,e){if(typeof window>"u"||typeof document>"u"||!Ga(window.location.host)||$l[t]===e||$l[t]||UL)return;$l[t]=e;function n(m){return`__firebase__banner__${m}`}let a="__firebase__banner",s=SO().prod.length>0;function i(){let m=document.getElementById(a);m&&m.remove()}function u(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function l(m,S){m.setAttribute("width","24"),m.setAttribute("id",S),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function c(){let m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{UL=!0,i()},m}function f(m,S){m.setAttribute("id",S),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){let m=vO(a),S=n("text"),R=document.getElementById(S)||document.createElement("span"),D=n("learnmore"),L=document.getElementById(D)||document.createElement("a"),E=n("preprendIcon"),v=document.getElementById(E)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){let C=m.element;u(C),f(L,D);let x=c();l(v,E),C.append(v,R,L,x),document.body.appendChild(C)}s?(R.innerText="Preview backend disconnected.",v.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(v.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,R.innerText="Preview backend running in this workspace."),R.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}function rn(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function GL(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(rn())}function EO(){let t=sh()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function jL(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function KL(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function WL(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function XL(){let t=rn();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function YL(){return!EO()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function hI(){try{return typeof indexedDB=="object"}catch{return!1}}function QL(){return new Promise((t,e)=>{try{let n=!0,a="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(a);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(a),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(n){e(n)}})}var TO="FirebaseError",wn=class t extends Error{constructor(e,n,a){super(n),this.code=e,this.customData=a,this.name=TO,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Mr.prototype.create)}},Mr=class{constructor(e,n,a){this.service=e,this.serviceName=n,this.errors=a}create(e,...n){let a=n[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?bO(s,a):"Error",u=`${this.serviceName}: ${i} (${r}).`;return new wn(r,u,a)}};function bO(t,e){return t.replace(wO,(n,a)=>{let r=e[a];return r!=null?String(r):`<${a}?>`})}var wO=/\{\$([^}]+)}/g;function $L(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Ea(t,e){if(t===e)return!0;let n=Object.keys(t),a=Object.keys(e);for(let r of n){if(!a.includes(r))return!1;let s=t[r],i=e[r];if(BL(s)&&BL(i)){if(!Ea(s,i))return!1}else if(s!==i)return!1}for(let r of a)if(!n.includes(r))return!1;return!0}function BL(t){return t!==null&&typeof t=="object"}function jo(t){let e=[];for(let[n,a]of Object.entries(t))Array.isArray(a)?a.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(a));return e.length?"&"+e.join("&"):""}function Ko(t){let e={};return t.replace(/^\?/,"").split("&").forEach(a=>{if(a){let[r,s]=a.split("=");e[decodeURIComponent(r)]=decodeURIComponent(s)}}),e}function Wo(t){let e=t.indexOf("?");if(!e)return"";let n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function JL(t,e){let n=new lI(t,e);return n.subscribe.bind(n)}var lI=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(a=>{this.error(a)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,a){let r;if(e===void 0&&n===void 0&&a===void 0)throw new Error("Missing Observer.");CO(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:a},r.next===void 0&&(r.next=oI),r.error===void 0&&(r.error=oI),r.complete===void 0&&(r.complete=oI);let s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function CO(t,e){if(typeof t!="object"||t===null)return!1;for(let n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function oI(){}var CB=4*60*60*1e3;function sn(t){return t&&t._delegate?t._delegate:t}var On=class{constructor(e,n,a){this.name=e,this.instanceFactory=n,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var Ti="[DEFAULT]";var pI=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){let a=new ah;if(this.instancesDeferred.set(n,a),this.isInitialized(n)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:n});r&&a.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){let n=this.normalizeInstanceIdentifier(e?.identifier),a=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(a)return null;throw r}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(AO(e))try{this.getOrInitializeService({instanceIdentifier:Ti})}catch{}for(let[n,a]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(n);try{let s=this.getOrInitializeService({instanceIdentifier:r});a.resolve(s)}catch{}}}}clearInstance(e=Ti){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Ti){return this.instances.has(e)}getOptions(e=Ti){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:n={}}=e,a=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:a,options:n});for(let[s,i]of this.instancesDeferred.entries()){let u=this.normalizeInstanceIdentifier(s);a===u&&i.resolve(r)}return r}onInit(e,n){let a=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(a)??new Set;r.add(e),this.onInitCallbacks.set(a,r);let s=this.instances.get(a);return s&&e(s,a),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){let a=this.onInitCallbacks.get(n);if(a)for(let r of a)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let a=this.instances.get(e);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:LO(e),options:n}),this.instances.set(e,a),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(a,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,a)}catch{}return a||null}normalizeInstanceIdentifier(e=Ti){return this.component?this.component.multipleInstances?e:Ti:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function LO(t){return t===Ti?void 0:t}function AO(t){return t.instantiationMode==="EAGER"}var uh=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let n=new pI(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};var xO=[],_e;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(_e||(_e={}));var RO={debug:_e.DEBUG,verbose:_e.VERBOSE,info:_e.INFO,warn:_e.WARN,error:_e.ERROR,silent:_e.SILENT},kO=_e.INFO,DO={[_e.DEBUG]:"log",[_e.VERBOSE]:"log",[_e.INFO]:"info",[_e.WARN]:"warn",[_e.ERROR]:"error"},PO=(t,e,...n)=>{if(e<t.logLevel)return;let a=new Date().toISOString(),r=DO[e];if(r)console[r](`[${a}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},Fs=class{constructor(e){this.name=e,this._logLevel=kO,this._logHandler=PO,this._userLogHandler=null,xO.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in _e))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?RO[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,_e.DEBUG,...e),this._logHandler(this,_e.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,_e.VERBOSE,...e),this._logHandler(this,_e.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,_e.INFO,...e),this._logHandler(this,_e.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,_e.WARN,...e),this._logHandler(this,_e.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,_e.ERROR,...e),this._logHandler(this,_e.ERROR,...e)}};var OO=(t,e)=>e.some(n=>t instanceof n),ZL,eA;function MO(){return ZL||(ZL=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function NO(){return eA||(eA=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var tA=new WeakMap,gI=new WeakMap,nA=new WeakMap,mI=new WeakMap,II=new WeakMap;function VO(t){let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{n(ja(t.result)),r()},i=()=>{a(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(n=>{n instanceof IDBCursor&&tA.set(n,t)}).catch(()=>{}),II.set(e,t),e}function FO(t){if(gI.has(t))return;let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{n(),r()},i=()=>{a(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});gI.set(t,e)}var yI={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return gI.get(t);if(e==="objectStoreNames")return t.objectStoreNames||nA.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return ja(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function aA(t){yI=t(yI)}function UO(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let a=t.call(lh(this),e,...n);return nA.set(a,e.sort?e.sort():[e]),ja(a)}:NO().includes(t)?function(...e){return t.apply(lh(this),e),ja(tA.get(this))}:function(...e){return ja(t.apply(lh(this),e))}}function BO(t){return typeof t=="function"?UO(t):(t instanceof IDBTransaction&&FO(t),OO(t,MO())?new Proxy(t,yI):t)}function ja(t){if(t instanceof IDBRequest)return VO(t);if(mI.has(t))return mI.get(t);let e=BO(t);return e!==t&&(mI.set(t,e),II.set(e,t)),e}var lh=t=>II.get(t);function sA(t,e,{blocked:n,upgrade:a,blocking:r,terminated:s}={}){let i=indexedDB.open(t,e),u=ja(i);return a&&i.addEventListener("upgradeneeded",l=>{a(ja(i.result),l.oldVersion,l.newVersion,ja(i.transaction),l)}),n&&i.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),u.then(l=>{s&&l.addEventListener("close",()=>s()),r&&l.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),u}var qO=["get","getKey","getAll","getAllKeys","count"],zO=["put","add","delete","clear"],_I=new Map;function rA(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(_I.get(e))return _I.get(e);let n=e.replace(/FromIndex$/,""),a=e!==n,r=zO.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(r||qO.includes(n)))return;let s=async function(i,...u){let l=this.transaction(i,r?"readwrite":"readonly"),c=l.store;return a&&(c=c.index(u.shift())),(await Promise.all([c[n](...u),r&&l.done]))[0]};return _I.set(e,s),s}aA(t=>({...t,get:(e,n,a)=>rA(e,n)||t.get(e,n,a),has:(e,n)=>!!rA(e,n)||t.has(e,n)}));var vI=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(HO(n)){let a=n.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(n=>n).join(" ")}};function HO(t){return t.getComponent()?.type==="VERSION"}var EI="@firebase/app",iA="0.14.9";var Nr=new Fs("@firebase/app"),GO="@firebase/app-compat",jO="@firebase/analytics-compat",KO="@firebase/analytics",WO="@firebase/app-check-compat",XO="@firebase/app-check",YO="@firebase/auth",QO="@firebase/auth-compat",$O="@firebase/database",JO="@firebase/data-connect",ZO="@firebase/database-compat",eM="@firebase/functions",tM="@firebase/functions-compat",nM="@firebase/installations",aM="@firebase/installations-compat",rM="@firebase/messaging",sM="@firebase/messaging-compat",iM="@firebase/performance",oM="@firebase/performance-compat",uM="@firebase/remote-config",lM="@firebase/remote-config-compat",cM="@firebase/storage",dM="@firebase/storage-compat",fM="@firebase/firestore",hM="@firebase/ai",pM="@firebase/firestore-compat",mM="firebase",gM="12.10.0";var TI="[DEFAULT]",yM={[EI]:"fire-core",[GO]:"fire-core-compat",[KO]:"fire-analytics",[jO]:"fire-analytics-compat",[XO]:"fire-app-check",[WO]:"fire-app-check-compat",[YO]:"fire-auth",[QO]:"fire-auth-compat",[$O]:"fire-rtdb",[JO]:"fire-data-connect",[ZO]:"fire-rtdb-compat",[eM]:"fire-fn",[tM]:"fire-fn-compat",[nM]:"fire-iid",[aM]:"fire-iid-compat",[rM]:"fire-fcm",[sM]:"fire-fcm-compat",[iM]:"fire-perf",[oM]:"fire-perf-compat",[uM]:"fire-rc",[lM]:"fire-rc-compat",[cM]:"fire-gcs",[dM]:"fire-gcs-compat",[fM]:"fire-fst",[pM]:"fire-fst-compat",[hM]:"fire-vertex","fire-js":"fire-js",[mM]:"fire-js-all"};var ch=new Map,IM=new Map,bI=new Map;function oA(t,e){try{t.container.addComponent(e)}catch(n){Nr.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Ka(t){let e=t.name;if(bI.has(e))return Nr.debug(`There were multiple attempts to register component ${e}.`),!1;bI.set(e,t);for(let n of ch.values())oA(n,t);for(let n of IM.values())oA(n,t);return!0}function bi(t,e){let n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Nn(t){return t==null?!1:t.settings!==void 0}var _M={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Us=new Mr("app","Firebase",_M);var wI=class{constructor(e,n,a){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new On("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Us.create("app-deleted",{appName:this._name})}};var Wa=gM;function AI(t,e={}){let n=t;typeof e!="object"&&(e={name:e});let a={name:TI,automaticDataCollectionEnabled:!0,...e},r=a.name;if(typeof r!="string"||!r)throw Us.create("bad-app-name",{appName:String(r)});if(n||(n=dI()),!n)throw Us.create("no-options");let s=ch.get(r);if(s){if(Ea(n,s.options)&&Ea(a,s.config))return s;throw Us.create("duplicate-app",{appName:r})}let i=new uh(r);for(let l of bI.values())i.addComponent(l);let u=new wI(n,a,i);return ch.set(r,u),u}function Xo(t=TI){let e=ch.get(t);if(!e&&t===TI&&dI())return AI();if(!e)throw Us.create("no-app",{appName:t});return e}function Mn(t,e,n){let a=yM[t]??t;n&&(a+=`-${n}`);let r=a.match(/\s|\//),s=e.match(/\s|\//);if(r||s){let i=[`Unable to register library "${a}" with version "${e}":`];r&&i.push(`library name "${a}" contains illegal characters (whitespace or "/")`),r&&s&&i.push("and"),s&&i.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Nr.warn(i.join(" "));return}Ka(new On(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}var SM="firebase-heartbeat-database",vM=1,Zl="firebase-heartbeat-store",SI=null;function dA(){return SI||(SI=sA(SM,vM,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Zl)}catch(n){console.warn(n)}}}}).catch(t=>{throw Us.create("idb-open",{originalErrorMessage:t.message})})),SI}async function EM(t){try{let n=(await dA()).transaction(Zl),a=await n.objectStore(Zl).get(fA(t));return await n.done,a}catch(e){if(e instanceof wn)Nr.warn(e.message);else{let n=Us.create("idb-get",{originalErrorMessage:e?.message});Nr.warn(n.message)}}}async function uA(t,e){try{let a=(await dA()).transaction(Zl,"readwrite");await a.objectStore(Zl).put(e,fA(t)),await a.done}catch(n){if(n instanceof wn)Nr.warn(n.message);else{let a=Us.create("idb-set",{originalErrorMessage:n?.message});Nr.warn(a.message)}}}function fA(t){return`${t.name}!${t.options.appId}`}var TM=1024,bM=30,CI=class{constructor(e){this.container=e,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new LI(n),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=lA();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(r=>r.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:n}),this._heartbeatsCache.heartbeats.length>bM){let r=CM(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Nr.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=lA(),{heartbeatsToSend:n,unsentEntries:a}=wM(this._heartbeatsCache.heartbeats),r=Jl(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return Nr.warn(e),""}}};function lA(){return new Date().toISOString().substring(0,10)}function wM(t,e=TM){let n=[],a=t.slice();for(let r of t){let s=n.find(i=>i.agent===r.agent);if(s){if(s.dates.push(r.date),cA(n)>e){s.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),cA(n)>e){n.pop();break}a=a.slice(1)}return{heartbeatsToSend:n,unsentEntries:a}}var LI=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return hI()?QL().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await EM(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return uA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return uA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}};function cA(t){return Jl(JSON.stringify({version:2,heartbeats:t})).length}function CM(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let a=1;a<t.length;a++)t[a].date<n&&(n=t[a].date,e=a);return e}function LM(t){Ka(new On("platform-logger",e=>new vI(e),"PRIVATE")),Ka(new On("heartbeat",e=>new CI(e),"PRIVATE")),Mn(EI,iA,t),Mn(EI,iA,"esm2020"),Mn("fire-js","")}LM("");var AM="firebase",xM="12.10.0";Mn(AM,xM,"app");function kA(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var DA=kA,PA=new Mr("auth","Firebase",kA());var yh=new Fs("@firebase/auth");function RM(t,...e){yh.logLevel<=_e.WARN&&yh.warn(`Auth (${Wa}): ${t}`,...e)}function fh(t,...e){yh.logLevel<=_e.ERROR&&yh.error(`Auth (${Wa}): ${t}`,...e)}function Ta(t,...e){throw ZI(t,...e)}function Ya(t,...e){return ZI(t,...e)}function OA(t,e,n){let a={...DA(),[e]:n};return new Mr("auth","Firebase",a).create(e,{appName:t.name})}function wi(t){return OA(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ZI(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return PA.create(t,...e)}function J(t,e,...n){if(!t)throw ZI(e,...n)}function Xa(t){let e="INTERNAL ASSERTION FAILED: "+t;throw fh(e),new Error(e)}function Fr(t,e){t||Xa(e)}function OI(){return typeof self<"u"&&self.location?.href||""}function kM(){return hA()==="http:"||hA()==="https:"}function hA(){return typeof self<"u"&&self.location?.protocol||null}function DM(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(kM()||KL()||"connection"in navigator)?navigator.onLine:!0}function PM(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var Ci=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,Fr(n>e,"Short delay should be less than long delay!"),this.isMobile=GL()||WL()}get(){return DM()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function e_(t,e){Fr(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var Ih=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Xa("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Xa("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Xa("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var OM={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var MM=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],NM=new Ci(3e4,6e4);function on(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function _n(t,e,n,a,r={}){return MA(t,r,async()=>{let s={},i={};a&&(e==="GET"?i=a:s={body:JSON.stringify(a)});let u=jo({key:t.config.apiKey,...i}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:l,...s};return jL()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Ga(t.emulatorConfig.host)&&(c.credentials="include"),Ih.fetch()(await NA(t,t.config.apiHost,n,u),c)})}async function MA(t,e,n){t._canInitEmulator=!1;let a={...OM,...e};try{let r=new MI(t),s=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let i=await s.json();if("needConfirmation"in i)throw tc(t,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{let u=s.ok?i.errorMessage:i.error.message,[l,c]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw tc(t,"credential-already-in-use",i);if(l==="EMAIL_EXISTS")throw tc(t,"email-already-in-use",i);if(l==="USER_DISABLED")throw tc(t,"user-disabled",i);let f=a[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw OA(t,f,c);Ta(t,f)}}catch(r){if(r instanceof wn)throw r;Ta(t,"network-request-failed",{message:String(r)})}}async function ki(t,e,n,a,r={}){let s=await _n(t,e,n,a,r);return"mfaPendingCredential"in s&&Ta(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function NA(t,e,n,a){let r=`${e}${n}?${a}`,s=t,i=s.config.emulator?e_(t.config,r):`${t.config.apiScheme}://${r}`;return MM.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(i).toString():i}function VM(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var MI=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(Ya(this.auth,"network-request-failed")),NM.get())})}};function tc(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=Ya(t,e,a);return r.customData._tokenResponse=n,r}function pA(t){return t!==void 0&&t.enterprise!==void 0}var _h=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return VM(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function VA(t,e){return _n(t,"GET","/v2/recaptchaConfig",on(t,e))}async function FM(t,e){return _n(t,"POST","/v1/accounts:delete",e)}async function Sh(t,e){return _n(t,"POST","/v1/accounts:lookup",e)}function nc(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function FA(t,e=!1){let n=sn(t),a=await n.getIdToken(e),r=t_(a);J(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let s=typeof r.firebase=="object"?r.firebase:void 0,i=s?.sign_in_provider;return{claims:r,token:a,authTime:nc(xI(r.auth_time)),issuedAtTime:nc(xI(r.iat)),expirationTime:nc(xI(r.exp)),signInProvider:i||null,signInSecondFactor:s?.sign_in_second_factor||null}}function xI(t){return Number(t)*1e3}function t_(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return fh("JWT malformed, contained fewer than 3 sections"),null;try{let r=rh(n);return r?JSON.parse(r):(fh("Failed to decode base64 JWT payload"),null)}catch(r){return fh("Caught error parsing JWT payload as JSON",r?.toString()),null}}function mA(t){let e=t_(t);return J(e,"internal-error"),J(typeof e.exp<"u","internal-error"),J(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function ic(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof wn&&UM(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function UM({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var NI=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var oc=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=nc(this.lastLoginAt),this.creationTime=nc(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function vh(t){let e=t.auth,n=await t.getIdToken(),a=await ic(t,Sh(e,{idToken:n}));J(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let s=r.providerUserInfo?.length?BA(r.providerUserInfo):[],i=BM(t.providerData,s),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!i?.length,c=u?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new oc(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function UA(t){let e=sn(t);await vh(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function BM(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function BA(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function qM(t,e){let n=await MA(t,{},async()=>{let a=jo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,i=await NA(t,r,"/v1/token",`key=${s}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:a};return t.emulatorConfig&&Ga(t.emulatorConfig.host)&&(l.credentials="include"),Ih.fetch()(i,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function zM(t,e){return _n(t,"POST","/v2/accounts:revokeToken",on(t,e))}var ac=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){J(e.idToken,"internal-error"),J(typeof e.idToken<"u","internal-error"),J(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):mA(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){J(e.length!==0,"internal-error");let n=mA(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(J(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:s}=await qM(e,n);this.updateTokensAndExpiration(a,r,Number(s))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:s}=n,i=new t;return a&&(J(typeof a=="string","internal-error",{appName:e}),i.refreshToken=a),r&&(J(typeof r=="string","internal-error",{appName:e}),i.accessToken=r),s&&(J(typeof s=="number","internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return Xa("not implemented")}};function Bs(t,e){J(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var qs=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new NI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new oc(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await ic(this,this.stsTokenManager.getToken(this.auth,e));return J(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return FA(this,e)}reload(){return UA(this)}_assign(e){this!==e&&(J(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){J(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await vh(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Nn(this.auth.app))return Promise.reject(wi(this.auth));let e=await this.getIdToken();return await ic(this,FM(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,s=n.phoneNumber??void 0,i=n.photoURL??void 0,u=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:S,providerData:R,stsTokenManager:D}=n;J(p&&D,e,"internal-error");let L=ac.fromJSON(this.name,D);J(typeof p=="string",e,"internal-error"),Bs(a,e.name),Bs(r,e.name),J(typeof m=="boolean",e,"internal-error"),J(typeof S=="boolean",e,"internal-error"),Bs(s,e.name),Bs(i,e.name),Bs(u,e.name),Bs(l,e.name),Bs(c,e.name),Bs(f,e.name);let E=new t({uid:p,auth:e,email:r,emailVerified:m,displayName:a,isAnonymous:S,photoURL:i,phoneNumber:s,tenantId:u,stsTokenManager:L,createdAt:c,lastLoginAt:f});return R&&Array.isArray(R)&&(E.providerData=R.map(v=>({...v}))),l&&(E._redirectEventId=l),E}static async _fromIdTokenResponse(e,n,a=!1){let r=new ac;r.updateFromServerResponse(n);let s=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await vh(s),s}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];J(r.localId!==void 0,"internal-error");let s=r.providerUserInfo!==void 0?BA(r.providerUserInfo):[],i=!(r.email&&r.passwordHash)&&!s?.length,u=new ac;u.updateFromIdToken(a);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:i}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new oc(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!s?.length};return Object.assign(l,c),l}};var gA=new Map;function Vr(t){Fr(t instanceof Function,"Expected a class definition");let e=gA.get(t);return e?(Fr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,gA.set(t,e),e)}var Eh=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};Eh.type="NONE";var VI=Eh;function hh(t,e,n){return`firebase:${t}:${e}:${n}`}var Th=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:s}=this.auth;this.fullUserKey=hh(this.userKey,r.apiKey,s),this.fullPersistenceKey=hh("persistence",r.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await Sh(this.auth,{idToken:e}).catch(()=>{});return n?qs._fromGetAccountInfoResponse(this.auth,n,e):null}return qs._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(Vr(VI),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),s=r[0]||Vr(VI),i=hh(a,e.config.apiKey,e.name),u=null;for(let c of n)try{let f=await c._get(i);if(f){let p;if(typeof f=="string"){let m=await Sh(e,{idToken:f}).catch(()=>{});if(!m)break;p=await qs._fromGetAccountInfoResponse(e,m,f)}else p=qs._fromJSON(e,f);c!==s&&(u=p),s=c;break}}catch{}let l=r.filter(c=>c._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new t(s,e,a):(s=l[0],u&&await s._set(i,u.toJSON()),await Promise.all(n.map(async c=>{if(c!==s)try{await c._remove(i)}catch{}})),new t(s,e,a))}};function yA(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(GA(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(qA(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(KA(e))return"Blackberry";if(WA(e))return"Webos";if(zA(e))return"Safari";if((e.includes("chrome/")||HA(e))&&!e.includes("edge/"))return"Chrome";if(jA(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function qA(t=rn()){return/firefox\//i.test(t)}function zA(t=rn()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function HA(t=rn()){return/crios\//i.test(t)}function GA(t=rn()){return/iemobile/i.test(t)}function jA(t=rn()){return/android/i.test(t)}function KA(t=rn()){return/blackberry/i.test(t)}function WA(t=rn()){return/webos/i.test(t)}function n_(t=rn()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function HM(t=rn()){return n_(t)&&!!window.navigator?.standalone}function GM(){return XL()&&document.documentMode===10}function XA(t=rn()){return n_(t)||jA(t)||WA(t)||KA(t)||/windows phone/i.test(t)||GA(t)}function YA(t,e=[]){let n;switch(t){case"Browser":n=yA(rn());break;case"Worker":n=`${yA(rn())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Wa}/${a}`}var FI=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=s=>new Promise((i,u)=>{try{let l=e(s);i(l)}catch(l){u(l)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function jM(t,e={}){return _n(t,"GET","/v2/passwordPolicy",on(t,e))}var KM=6,UI=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??KM,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};var BI=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new bh(this),this.idTokenSubscription=new bh(this),this.beforeStateQueue=new FI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=PA,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Vr(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Th.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await Sh(this,{idToken:e}),a=await qs._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(Nn(this.app)){let s=this.app.settings.authIdToken;return s?new Promise(i=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(s).then(i,i))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let s=this.redirectUser?._redirectEventId,i=a?._redirectEventId,u=await this.tryRedirectSignIn(e);(!s||s===i)&&u?.user&&(a=u.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(s){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(s))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return J(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await vh(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=PM()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Nn(this.app))return Promise.reject(wi(this));let n=e?sn(e):null;return n&&J(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&J(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Nn(this.app)?Promise.reject(wi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Nn(this.app)?Promise.reject(wi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Vr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await jM(this),n=new UI(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Mr("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await zM(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&Vr(e)||this._popupRedirectResolver;J(n,this,"argument-error"),this.redirectPersistenceManager=await Th.create(this,[Vr(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let s=typeof n=="function"?n:n.next.bind(n),i=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(J(u,this,"internal-error"),u.then(()=>{i||s(this.currentUser)}),typeof n=="function"){let l=e.addObserver(n,a,r);return()=>{i=!0,l()}}else{let l=e.addObserver(n);return()=>{i=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return J(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=YA(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(Nn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&RM(`Error while retrieving App Check token: ${e.error}`),e?.token}};function $o(t){return sn(t)}var bh=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=JL(n=>this.observer=n)}get next(){return J(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var zh={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function WM(t){zh=t}function QA(t){return zh.loadJS(t)}function XM(){return zh.recaptchaEnterpriseScript}function YM(){return zh.gapiScript}function $A(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var qI=class{constructor(){this.enterprise=new zI}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},zI=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var QM="recaptcha-enterprise",rc="NO_RECAPTCHA",wh=class{constructor(e){this.type=QM,this.auth=$o(e)}async verify(e="verify",n=!1){async function a(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(i,u)=>{VA(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let c=new _h(l);return s.tenantId==null?s._agentRecaptchaConfig=c:s._tenantRecaptchaConfigs[s.tenantId]=c,i(c.siteKey)}}).catch(l=>{u(l)})})}function r(s,i,u){let l=window.grecaptcha;pA(l)?l.enterprise.ready(()=>{l.enterprise.execute(s,{action:e}).then(c=>{i(c)}).catch(()=>{i(rc)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new qI().execute("siteKey",{action:"verify"}):new Promise((s,i)=>{a(this.auth).then(u=>{if(!n&&pA(window.grecaptcha))r(u,s,i);else{if(typeof window>"u"){i(new Error("RecaptchaVerifier is only supported in browser"));return}let l=XM();l.length!==0&&(l+=u),QA(l).then(()=>{r(u,s,i)}).catch(c=>{i(c)})}}).catch(u=>{i(u)})})}};async function ec(t,e,n,a=!1,r=!1){let s=new wh(t),i;if(r)i=rc;else try{i=await s.verify(n)}catch{i=await s.verify(n,!0)}let u={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,c=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return a?Object.assign(u,{captchaResp:i}):Object.assign(u,{captchaResponse:i}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function sc(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let s=await ec(t,e,n,n==="getOobCode");return a(t,s)}else return a(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let i=await ec(t,e,n,n==="getOobCode");return a(t,i)}else return Promise.reject(s)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let s=await ec(t,e,n);return a(t,s).catch(async i=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(i.code==="auth/missing-recaptcha-token"||i.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let u=await ec(t,e,n,!1,!0);return a(t,u)}return Promise.reject(i)})}else{let s=await ec(t,e,n,!1,!0);return a(t,s)}else return Promise.reject(r+" provider is not supported.")}async function $M(t){let e=$o(t),n=await VA(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),a=new _h(n);e.tenantId==null?e._agentRecaptchaConfig=a:e._tenantRecaptchaConfigs[e.tenantId]=a,a.isAnyProviderEnabled()&&new wh(e).verify()}function JA(t,e){let n=bi(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),s=n.getOptions();if(Ea(s,e??{}))return r;Ta(r,"already-initialized")}return n.initialize({options:e})}function JM(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(Vr);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function ZA(t,e,n){let a=$o(t);J(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,s=ex(e),{host:i,port:u}=ZM(e),l=u===null?"":`:${u}`,c={url:`${s}//${i}${l}/`},f=Object.freeze({host:i,port:u,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){J(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),J(Ea(c,a.config.emulator)&&Ea(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Ga(i)?(Ho(`${s}//${i}${l}`),Go("Auth",!0)):r||eN()}function ex(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function ZM(t){let e=ex(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let s=r[1];return{host:s,port:IA(a.substr(s.length+1))}}else{let[s,i]=a.split(":");return{host:s,port:IA(i)}}}function IA(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function eN(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var Li=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Xa("not implemented")}_getIdTokenResponse(e){return Xa("not implemented")}_linkToIdToken(e,n){return Xa("not implemented")}_getReauthenticationResolver(e){return Xa("not implemented")}};async function tN(t,e){return _n(t,"POST","/v1/accounts:signUp",e)}async function nN(t,e){return ki(t,"POST","/v1/accounts:signInWithPassword",on(t,e))}async function aN(t,e){return ki(t,"POST","/v1/accounts:signInWithEmailLink",on(t,e))}async function rN(t,e){return ki(t,"POST","/v1/accounts:signInWithEmailLink",on(t,e))}var uc=class t extends Li{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return sc(e,n,"signInWithPassword",nN,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return aN(e,{email:this._email,oobCode:this._password});default:Ta(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return sc(e,a,"signUpPassword",tN,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return rN(e,{idToken:n,email:this._email,oobCode:this._password});default:Ta(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function Yo(t,e){return ki(t,"POST","/v1/accounts:signInWithIdp",on(t,e))}var sN="http://localhost",Ai=class t extends Li{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Ta("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...s}=n;if(!a||!r)return null;let i=new t(a,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){let n=this.buildRequest();return Yo(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,Yo(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,Yo(e,n)}buildRequest(){let e={requestUri:sN,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=jo(n)}return e}};async function _A(t,e){return _n(t,"POST","/v1/accounts:sendVerificationCode",on(t,e))}async function iN(t,e){return ki(t,"POST","/v1/accounts:signInWithPhoneNumber",on(t,e))}async function oN(t,e){let n=await ki(t,"POST","/v1/accounts:signInWithPhoneNumber",on(t,e));if(n.temporaryProof)throw tc(t,"account-exists-with-different-credential",n);return n}var uN={USER_NOT_FOUND:"user-not-found"};async function lN(t,e){let n={...e,operation:"REAUTH"};return ki(t,"POST","/v1/accounts:signInWithPhoneNumber",on(t,n),uN)}var lc=class t extends Li{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new t({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new t({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return iN(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return oN(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return lN(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:n,verificationId:a,verificationCode:r}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:a,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s}=e;return!a&&!n&&!r&&!s?null:new t({verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s})}};function cN(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function dN(t){let e=Ko(Wo(t)).link,n=e?Ko(Wo(e)).deep_link_id:null,a=Ko(Wo(t)).deep_link_id;return(a?Ko(Wo(a)).link:null)||a||n||e||t}var Ch=class t{constructor(e){let n=Ko(Wo(e)),a=n.apiKey??null,r=n.oobCode??null,s=cN(n.mode??null);J(a&&r&&s,"argument-error"),this.apiKey=a,this.operation=s,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=dN(e);try{return new t(n)}catch{return null}}};var Qo=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return uc._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=Ch.parseLink(n);return J(a,"argument-error"),uc._fromEmailAndCode(e,a.code,a.tenantId)}};Qo.PROVIDER_ID="password";Qo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Qo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var Lh=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var xi=class extends Lh{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var cc=class t extends xi{constructor(){super("facebook.com")}static credential(e){return Ai._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};cc.FACEBOOK_SIGN_IN_METHOD="facebook.com";cc.PROVIDER_ID="facebook.com";var dc=class t extends xi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Ai._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};dc.GOOGLE_SIGN_IN_METHOD="google.com";dc.PROVIDER_ID="google.com";var fc=class t extends xi{constructor(){super("github.com")}static credential(e){return Ai._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};fc.GITHUB_SIGN_IN_METHOD="github.com";fc.PROVIDER_ID="github.com";var hc=class t extends xi{constructor(){super("twitter.com")}static credential(e,n){return Ai._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};hc.TWITTER_SIGN_IN_METHOD="twitter.com";hc.PROVIDER_ID="twitter.com";var pc=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,a,r=!1){let s=await qs._fromIdTokenResponse(e,a,r),i=SA(a);return new t({user:s,providerId:i,_tokenResponse:a,operationType:n})}static async _forOperation(e,n,a){await e._updateTokensIfNecessary(a,!0);let r=SA(a);return new t({user:e,providerId:r,_tokenResponse:a,operationType:n})}};function SA(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var HI=class t extends wn{constructor(e,n,a,r){super(n.code,n.message),this.operationType=a,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:a}}static _fromErrorAndOperation(e,n,a,r){return new t(e,n,a,r)}};function tx(t,e,n,a){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?HI._fromErrorAndOperation(t,s,e,a):s})}async function fN(t,e,n=!1){let a=await ic(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return pc._forOperation(t,"link",a)}async function hN(t,e,n=!1){let{auth:a}=t;if(Nn(a.app))return Promise.reject(wi(a));let r="reauthenticate";try{let s=await ic(t,tx(a,r,e,t),n);J(s.idToken,a,"internal-error");let i=t_(s.idToken);J(i,a,"internal-error");let{sub:u}=i;return J(t.uid===u,a,"user-mismatch"),pc._forOperation(t,r,s)}catch(s){throw s?.code==="auth/user-not-found"&&Ta(a,"user-mismatch"),s}}async function pN(t,e,n=!1){if(Nn(t.app))return Promise.reject(wi(t));let a="signIn",r=await tx(t,a,e),s=await pc._fromIdTokenResponse(t,a,r);return n||await t._updateCurrentUser(s.user),s}function nx(t,e,n,a){return sn(t).onIdTokenChanged(e,n,a)}function ax(t,e,n){return sn(t).beforeAuthStateChanged(e,n)}function vA(t,e){return _n(t,"POST","/v2/accounts/mfaEnrollment:start",on(t,e))}function mN(t,e){return _n(t,"POST","/v2/accounts/mfaEnrollment:finalize",on(t,e))}function gN(t,e){return _n(t,"POST","/v2/accounts/mfaEnrollment:start",on(t,e))}function yN(t,e){return _n(t,"POST","/v2/accounts/mfaEnrollment:finalize",on(t,e))}var Ah="__sak";var xh=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Ah,"1"),this.storage.removeItem(Ah),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){let n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var IN=1e3,_N=10,Rh=class extends xh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=XA(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let n of Object.keys(this.listeners)){let a=this.storage.getItem(n),r=this.localCache[n];a!==r&&e(n,r,a)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((i,u,l)=>{this.notifyListeners(i,l)});return}let a=e.key;n?this.detachListener():this.stopPolling();let r=()=>{let i=this.storage.getItem(a);!n&&this.localCache[a]===i||this.notifyListeners(a,i)},s=this.storage.getItem(a);GM()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,_N):r()}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,a)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:a}),!0)})},IN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){let n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};Rh.type="LOCAL";var rx=Rh;var SN=1e3;function RI(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${e}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function kI(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var GI=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let n=new URL(`${window.location.origin}/__cookies__`);return n.searchParams.set("finalTarget",e),n}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,n){}async _get(e){if(!this._isAvailable())return null;let n=kI(e);return window.cookieStore?(await window.cookieStore.get(n))?.value:RI(n)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let a=kI(e);document.cookie=`${a}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,n){if(!this._isAvailable())return;let a=kI(e);if(window.cookieStore){let u=c=>{let f=c.changed.find(m=>m.name===a);f&&n(f.value),c.deleted.find(m=>m.name===a)&&n(null)},l=()=>window.cookieStore.removeEventListener("change",u);return this.listenerUnsubscribes.set(n,l),window.cookieStore.addEventListener("change",u)}let r=RI(a),s=setInterval(()=>{let u=RI(a);u!==r&&(n(u),r=u)},SN),i=()=>clearInterval(s);this.listenerUnsubscribes.set(n,i)}_removeListener(e,n){let a=this.listenerUnsubscribes.get(n);a&&(a(),this.listenerUnsubscribes.delete(n))}};GI.type="COOKIE";var kh=class extends xh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};kh.type="SESSION";var a_=kh;function vN(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var Dh=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:s}=n.data,i=this.handlersMap[r];if(!i?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let u=Array.from(i).map(async c=>c(n.origin,s)),l=await vN(u);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Dh.receivers=[];function r_(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var jI=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((u,l)=>{let c=r_("",20);r.port1.start();let f=setTimeout(()=>{l(new Error("unsupported_event"))},a);i={messageChannel:r,onMessage(p){let m=p;if(m.data.eventId===c)switch(m.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),u(m.data.response);break;default:clearTimeout(f),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}};function Qa(){return window}function EN(t){Qa().location.href=t}function sx(){return typeof Qa().WorkerGlobalScope<"u"&&typeof Qa().importScripts=="function"}async function TN(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function bN(){return navigator?.serviceWorker?.controller||null}function wN(){return sx()?self:null}var ix="firebaseLocalStorageDb",CN=1,Ph="firebaseLocalStorage",ox="fbase_key",Ri=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function Hh(t,e){return t.transaction([Ph],e?"readwrite":"readonly").objectStore(Ph)}function LN(){let t=indexedDB.deleteDatabase(ix);return new Ri(t).toPromise()}function KI(){let t=indexedDB.open(ix,CN);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Ph,{keyPath:ox})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Ph)?e(a):(a.close(),await LN(),e(await KI()))})})}async function EA(t,e,n){let a=Hh(t,!0).put({[ox]:e,value:n});return new Ri(a).toPromise()}async function AN(t,e){let n=Hh(t,!1).get(e),a=await new Ri(n).toPromise();return a===void 0?null:a.value}function TA(t,e){let n=Hh(t,!0).delete(e);return new Ri(n).toPromise()}var xN=800,RN=3,Oh=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await KI(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>RN)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return sx()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Dh._getInstance(wN()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await TN(),!this.activeServiceWorker)return;this.sender=new jI(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||bN()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await KI();return await EA(e,Ah,"1"),await TA(e,Ah),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>EA(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>AN(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>TA(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let s=Hh(r,!1).getAll();return new Ri(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:s}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),xN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Oh.type="LOCAL";var ux=Oh;function bA(t,e){return _n(t,"POST","/v2/accounts/mfaSignIn:start",on(t,e))}function kN(t,e){return _n(t,"POST","/v2/accounts/mfaSignIn:finalize",on(t,e))}function DN(t,e){return _n(t,"POST","/v2/accounts/mfaSignIn:finalize",on(t,e))}var JB=$A("rcb"),ZB=new Ci(3e4,6e4);var ph="recaptcha";async function PN(t,e,n){if(!t._getRecaptchaConfig())try{await $M(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let a;if(typeof e=="string"?a={phoneNumber:e}:a=e,"session"in a){let r=a.session;if("phoneNumber"in a){J(r.type==="enroll",t,"internal-error");let s={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await sc(t,s,"mfaSmsEnrollment",async(c,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===rc){J(n?.type===ph,c,"argument-error");let p=await DI(c,f,n);return vA(c,p)}return vA(c,f)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).phoneSessionInfo.sessionInfo}else{J(r.type==="signin",t,"internal-error");let s=a.multiFactorHint?.uid||a.multiFactorUid;J(s,t,"missing-multi-factor-info");let i={mfaPendingCredential:r.credential,mfaEnrollmentId:s,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await sc(t,i,"mfaSmsSignIn",async(f,p)=>{if(p.phoneSignInInfo.captchaResponse===rc){J(n?.type===ph,f,"argument-error");let m=await DI(f,p,n);return bA(f,m)}return bA(f,p)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await sc(t,r,"sendVerificationCode",async(l,c)=>{if(c.captchaResponse===rc){J(n?.type===ph,l,"argument-error");let f=await DI(l,c,n);return _A(l,f)}return _A(l,c)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{n?._reset()}}async function DI(t,e,n){J(n.type===ph,t,"argument-error");let a=await n.verify();J(typeof a=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let s=r.phoneEnrollmentInfo.phoneNumber,i=r.phoneEnrollmentInfo.captchaResponse,u=r.phoneEnrollmentInfo.clientType,l=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:a,captchaResponse:i,clientType:u,recaptchaVersion:l}}),r}else if("phoneSignInInfo"in r){let s=r.phoneSignInInfo.captchaResponse,i=r.phoneSignInInfo.clientType,u=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:a,captchaResponse:s,clientType:i,recaptchaVersion:u}}),r}else return Object.assign(r,{recaptchaToken:a}),r}var mc=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=$o(e)}verifyPhoneNumber(e,n){return PN(this.auth,e,sn(n))}static credential(e,n){return lc._fromVerification(e,n)}static credentialFromResult(e){let n=e;return t.credentialFromTaggedObject(n)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:n,temporaryProof:a}=e;return n&&a?lc._fromTokenResponse(n,a):null}};mc.PROVIDER_ID="phone";mc.PHONE_SIGN_IN_METHOD="phone";function ON(t,e){return e?Vr(e):(J(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var gc=class extends Li{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Yo(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Yo(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Yo(e,this._buildIdpRequest())}_buildIdpRequest(e){let n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function MN(t){return pN(t.auth,new gc(t),t.bypassAuthState)}function NN(t){let{auth:e,user:n}=t;return J(n,e,"internal-error"),hN(n,new gc(t),t.bypassAuthState)}async function VN(t){let{auth:e,user:n}=t;return J(n,e,"internal-error"),fN(n,new gc(t),t.bypassAuthState)}var Mh=class{constructor(e,n,a,r,s=!1){this.auth=e,this.resolver=a,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(a){this.reject(a)}})}async onAuthEvent(e){let{urlResponse:n,sessionId:a,postBody:r,tenantId:s,error:i,type:u}=e;if(i){this.reject(i);return}let l={auth:this.auth,requestUri:n,sessionId:a,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(l))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return MN;case"linkViaPopup":case"linkViaRedirect":return VN;case"reauthViaPopup":case"reauthViaRedirect":return NN;default:Ta(this.auth,"internal-error")}}resolve(e){Fr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Fr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var FN=new Ci(2e3,1e4);var WI=class t extends Mh{constructor(e,n,a,r,s){super(e,n,r,s),this.provider=a,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return J(e,this.auth,"internal-error"),e}async onExecution(){Fr(this.filter.length===1,"Popup operations only handle one event");let e=r_();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Ya(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(Ya(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ya(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,FN.get())};e()}};WI.currentPopupAction=null;var UN="pendingRedirect",mh=new Map,XI=class extends Mh{constructor(e,n,a=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,a),this.eventId=null}async execute(){let e=mh.get(this.auth._key());if(!e){try{let a=await BN(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(a)}catch(n){e=()=>Promise.reject(n)}mh.set(this.auth._key(),e)}return this.bypassAuthState||mh.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function BN(t,e){let n=HN(e),a=zN(t);if(!await a._isAvailable())return!1;let r=await a._get(n)==="true";return await a._remove(n),r}function qN(t,e){mh.set(t._key(),e)}function zN(t){return Vr(t._redirectPersistence)}function HN(t){return hh(UN,t.config.apiKey,t.name)}async function GN(t,e,n=!1){if(Nn(t.app))return Promise.reject(wi(t));let a=$o(t),r=ON(a,e),i=await new XI(a,r,n).execute();return i&&!n&&(delete i.user._redirectEventId,await a._persistUserIfCurrent(i.user),await a._setRedirectUser(null,e)),i}var jN=10*60*1e3,YI=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(a=>{this.isEventForConsumer(e,a)&&(n=!0,this.sendToConsumer(e,a),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!KN(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!lx(e)){let a=e.error.code?.split("auth/")[1]||"internal-error";n.onError(Ya(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){let a=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&a}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=jN&&this.cachedEventUids.clear(),this.cachedEventUids.has(wA(e))}saveEventToCache(e){this.cachedEventUids.add(wA(e)),this.lastProcessedEventTime=Date.now()}};function wA(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function lx({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function KN(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return lx(t);default:return!1}}async function WN(t,e={}){return _n(t,"GET","/v1/projects",e)}var XN=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,YN=/^https?/;async function QN(t){if(t.config.emulator)return;let{authorizedDomains:e}=await WN(t);for(let n of e)try{if($N(n))return}catch{}Ta(t,"unauthorized-domain")}function $N(t){let e=OI(),{protocol:n,hostname:a}=new URL(e);if(t.startsWith("chrome-extension://")){let i=new URL(t);return i.hostname===""&&a===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&i.hostname===a}if(!YN.test(n))return!1;if(XN.test(t))return a===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(a)}var JN=new Ci(3e4,6e4);function CA(){let t=Qa().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function ZN(t){return new Promise((e,n)=>{function a(){CA(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{CA(),n(Ya(t,"network-request-failed"))},timeout:JN.get()})}if(Qa().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(Qa().gapi?.load)a();else{let r=$A("iframefcb");return Qa()[r]=()=>{gapi.load?a():n(Ya(t,"network-request-failed"))},QA(`${YM()}?onload=${r}`).catch(s=>n(s))}}).catch(e=>{throw gh=null,e})}var gh=null;function e2(t){return gh=gh||ZN(t),gh}var t2=new Ci(5e3,15e3),n2="__/auth/iframe",a2="emulator/auth/iframe",r2={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},s2=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function i2(t){let e=t.config;J(e.authDomain,t,"auth-domain-config-required");let n=e.emulator?e_(e,a2):`https://${t.config.authDomain}/${n2}`,a={apiKey:e.apiKey,appName:t.name,v:Wa},r=s2.get(t.config.apiHost);r&&(a.eid=r);let s=t._getFrameworks();return s.length&&(a.fw=s.join(",")),`${n}?${jo(a).slice(1)}`}async function o2(t){let e=await e2(t),n=Qa().gapi;return J(n,t,"internal-error"),e.open({where:document.body,url:i2(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:r2,dontclear:!0},a=>new Promise(async(r,s)=>{await a.restyle({setHideOnLeave:!1});let i=Ya(t,"network-request-failed"),u=Qa().setTimeout(()=>{s(i)},t2.get());function l(){Qa().clearTimeout(u),r(a)}a.ping(l).then(l,()=>{s(i)})}))}var u2={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},l2=500,c2=600,d2="_blank",f2="http://localhost",Nh=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function h2(t,e,n,a=l2,r=c2){let s=Math.max((window.screen.availHeight-r)/2,0).toString(),i=Math.max((window.screen.availWidth-a)/2,0).toString(),u="",l={...u2,width:a.toString(),height:r.toString(),top:s,left:i},c=rn().toLowerCase();n&&(u=HA(c)?d2:n),qA(c)&&(e=e||f2,l.scrollbars="yes");let f=Object.entries(l).reduce((m,[S,R])=>`${m}${S}=${R},`,"");if(HM(c)&&u!=="_self")return p2(e||"",u),new Nh(null);let p=window.open(e||"",u,f);J(p,t,"popup-blocked");try{p.focus()}catch{}return new Nh(p)}function p2(t,e){let n=document.createElement("a");n.href=t,n.target=e;let a=document.createEvent("MouseEvent");a.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(a)}var m2="__/auth/handler",g2="emulator/auth/handler",y2=encodeURIComponent("fac");async function LA(t,e,n,a,r,s){J(t.config.authDomain,t,"auth-domain-config-required"),J(t.config.apiKey,t,"invalid-api-key");let i={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:a,v:Wa,eventId:r};if(e instanceof Lh){e.setDefaultLanguage(t.languageCode),i.providerId=e.providerId||"",$L(e.getCustomParameters())||(i.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,p]of Object.entries(s||{}))i[f]=p}if(e instanceof xi){let f=e.getScopes().filter(p=>p!=="");f.length>0&&(i.scopes=f.join(","))}t.tenantId&&(i.tid=t.tenantId);let u=i;for(let f of Object.keys(u))u[f]===void 0&&delete u[f];let l=await t._getAppCheckToken(),c=l?`#${y2}=${encodeURIComponent(l)}`:"";return`${I2(t)}?${jo(u).slice(1)}${c}`}function I2({config:t}){return t.emulator?e_(t,g2):`https://${t.authDomain}/${m2}`}var PI="webStorageSupport",QI=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=a_,this._completeRedirectFn=GN,this._overrideRedirectResult=qN}async _openPopup(e,n,a,r){Fr(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let s=await LA(e,n,a,OI(),r);return h2(e,s,r_())}async _openRedirect(e,n,a,r){await this._originValidation(e);let s=await LA(e,n,a,OI(),r);return EN(s),new Promise(()=>{})}_initialize(e){let n=e._key();if(this.eventManagers[n]){let{manager:r,promise:s}=this.eventManagers[n];return r?Promise.resolve(r):(Fr(s,"If manager is not set, promise should be"),s)}let a=this.initAndGetManager(e);return this.eventManagers[n]={promise:a},a.catch(()=>{delete this.eventManagers[n]}),a}async initAndGetManager(e){let n=await o2(e),a=new YI(e);return n.register("authEvent",r=>(J(r?.authEvent,e,"invalid-auth-event"),{status:a.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:a},this.iframes[e._key()]=n,a}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(PI,{type:PI},r=>{let s=r?.[0]?.[PI];s!==void 0&&n(!!s),Ta(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=QN(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return XA()||zA()||n_()}},cx=QI,Vh=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return Xa("unexpected MultiFactorSessionType")}}},$I=class t extends Vh{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,n,a){return mN(e,{idToken:n,displayName:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,n){return kN(e,{mfaPendingCredential:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Fh=class{constructor(){}static assertion(e){return $I._fromCredential(e)}};Fh.FACTOR_ID="phone";var Uh=class{static assertionForEnrollment(e,n){return Bh._fromSecret(e,n)}static assertionForSignIn(e,n){return Bh._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;J(typeof n.user?.auth<"u","internal-error");let a=await gN(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return qh._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Uh.FACTOR_ID="totp";var Bh=class t extends Vh{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return J(typeof this.secret<"u",e,"argument-error"),yN(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){J(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return DN(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},qh=class t{constructor(e,n,a,r,s,i,u){this.sessionInfo=i,this.auth=u,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(dh(e)||dh(n))&&(a=!0),a&&(dh(e)&&(e=this.auth.currentUser?.email||"unknownuser"),dh(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function dh(t){return typeof t>"u"||t?.length===0}var AA="@firebase/auth",xA="1.12.1";var JI=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){J(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function _2(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function S2(t){Ka(new On("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:u}=a.options;J(i&&!i.includes(":"),"invalid-api-key",{appName:a.name});let l={apiKey:i,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:YA(t)},c=new BI(a,r,s,l);return JM(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),Ka(new On("auth-internal",e=>{let n=$o(e.getProvider("auth").getImmediate());return(a=>new JI(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Mn(AA,xA,_2(t)),Mn(AA,xA,"esm2020")}var v2=5*60,E2=fI("authIdTokenMaxAge")||v2,RA=null,T2=t=>async e=>{let n=e&&await e.getIdTokenResult(),a=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(a&&a>E2)return;let r=n?.token;RA!==r&&(RA=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function s_(t=Xo()){let e=bi(t,"auth");if(e.isInitialized())return e.getImmediate();let n=JA(t,{popupRedirectResolver:cx,persistence:[ux,rx,a_]}),a=fI("authTokenSyncURL");if(a&&typeof isSecureContext=="boolean"&&isSecureContext){let s=new URL(a,location.origin);if(location.origin===s.origin){let i=T2(s.toString());ax(n,i,()=>i(n.currentUser)),nx(n,u=>i(u))}}let r=cI("auth");return r&&ZA(n,`http://${r}`),n}function b2(){return document.getElementsByTagName("head")?.[0]??document}WM({loadJS(t){return new Promise((e,n)=>{let a=document.createElement("script");a.setAttribute("src",t),a.onload=e,a.onerror=r=>{let s=Ya("internal-error");s.customData=r,n(s)},a.type="text/javascript",a.charset="UTF-8",b2().appendChild(a)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});S2("Browser");var dx=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},fx={};var Ur,i_;(function(){var t;function e(I,y){function _(){}_.prototype=y.prototype,I.F=y.prototype,I.prototype=new _,I.prototype.constructor=I,I.D=function(b,w,A){for(var T=Array(arguments.length-2),de=2;de<arguments.length;de++)T[de-2]=arguments[de];return y.prototype[w].apply(b,T)}}function n(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(a,n),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(I,y,_){_||(_=0);let b=Array(16);if(typeof y=="string")for(var w=0;w<16;++w)b[w]=y.charCodeAt(_++)|y.charCodeAt(_++)<<8|y.charCodeAt(_++)<<16|y.charCodeAt(_++)<<24;else for(w=0;w<16;++w)b[w]=y[_++]|y[_++]<<8|y[_++]<<16|y[_++]<<24;y=I.g[0],_=I.g[1],w=I.g[2];let A=I.g[3],T;T=y+(A^_&(w^A))+b[0]+3614090360&4294967295,y=_+(T<<7&4294967295|T>>>25),T=A+(w^y&(_^w))+b[1]+3905402710&4294967295,A=y+(T<<12&4294967295|T>>>20),T=w+(_^A&(y^_))+b[2]+606105819&4294967295,w=A+(T<<17&4294967295|T>>>15),T=_+(y^w&(A^y))+b[3]+3250441966&4294967295,_=w+(T<<22&4294967295|T>>>10),T=y+(A^_&(w^A))+b[4]+4118548399&4294967295,y=_+(T<<7&4294967295|T>>>25),T=A+(w^y&(_^w))+b[5]+1200080426&4294967295,A=y+(T<<12&4294967295|T>>>20),T=w+(_^A&(y^_))+b[6]+2821735955&4294967295,w=A+(T<<17&4294967295|T>>>15),T=_+(y^w&(A^y))+b[7]+4249261313&4294967295,_=w+(T<<22&4294967295|T>>>10),T=y+(A^_&(w^A))+b[8]+1770035416&4294967295,y=_+(T<<7&4294967295|T>>>25),T=A+(w^y&(_^w))+b[9]+2336552879&4294967295,A=y+(T<<12&4294967295|T>>>20),T=w+(_^A&(y^_))+b[10]+4294925233&4294967295,w=A+(T<<17&4294967295|T>>>15),T=_+(y^w&(A^y))+b[11]+2304563134&4294967295,_=w+(T<<22&4294967295|T>>>10),T=y+(A^_&(w^A))+b[12]+1804603682&4294967295,y=_+(T<<7&4294967295|T>>>25),T=A+(w^y&(_^w))+b[13]+4254626195&4294967295,A=y+(T<<12&4294967295|T>>>20),T=w+(_^A&(y^_))+b[14]+2792965006&4294967295,w=A+(T<<17&4294967295|T>>>15),T=_+(y^w&(A^y))+b[15]+1236535329&4294967295,_=w+(T<<22&4294967295|T>>>10),T=y+(w^A&(_^w))+b[1]+4129170786&4294967295,y=_+(T<<5&4294967295|T>>>27),T=A+(_^w&(y^_))+b[6]+3225465664&4294967295,A=y+(T<<9&4294967295|T>>>23),T=w+(y^_&(A^y))+b[11]+643717713&4294967295,w=A+(T<<14&4294967295|T>>>18),T=_+(A^y&(w^A))+b[0]+3921069994&4294967295,_=w+(T<<20&4294967295|T>>>12),T=y+(w^A&(_^w))+b[5]+3593408605&4294967295,y=_+(T<<5&4294967295|T>>>27),T=A+(_^w&(y^_))+b[10]+38016083&4294967295,A=y+(T<<9&4294967295|T>>>23),T=w+(y^_&(A^y))+b[15]+3634488961&4294967295,w=A+(T<<14&4294967295|T>>>18),T=_+(A^y&(w^A))+b[4]+3889429448&4294967295,_=w+(T<<20&4294967295|T>>>12),T=y+(w^A&(_^w))+b[9]+568446438&4294967295,y=_+(T<<5&4294967295|T>>>27),T=A+(_^w&(y^_))+b[14]+3275163606&4294967295,A=y+(T<<9&4294967295|T>>>23),T=w+(y^_&(A^y))+b[3]+4107603335&4294967295,w=A+(T<<14&4294967295|T>>>18),T=_+(A^y&(w^A))+b[8]+1163531501&4294967295,_=w+(T<<20&4294967295|T>>>12),T=y+(w^A&(_^w))+b[13]+2850285829&4294967295,y=_+(T<<5&4294967295|T>>>27),T=A+(_^w&(y^_))+b[2]+4243563512&4294967295,A=y+(T<<9&4294967295|T>>>23),T=w+(y^_&(A^y))+b[7]+1735328473&4294967295,w=A+(T<<14&4294967295|T>>>18),T=_+(A^y&(w^A))+b[12]+2368359562&4294967295,_=w+(T<<20&4294967295|T>>>12),T=y+(_^w^A)+b[5]+4294588738&4294967295,y=_+(T<<4&4294967295|T>>>28),T=A+(y^_^w)+b[8]+2272392833&4294967295,A=y+(T<<11&4294967295|T>>>21),T=w+(A^y^_)+b[11]+1839030562&4294967295,w=A+(T<<16&4294967295|T>>>16),T=_+(w^A^y)+b[14]+4259657740&4294967295,_=w+(T<<23&4294967295|T>>>9),T=y+(_^w^A)+b[1]+2763975236&4294967295,y=_+(T<<4&4294967295|T>>>28),T=A+(y^_^w)+b[4]+1272893353&4294967295,A=y+(T<<11&4294967295|T>>>21),T=w+(A^y^_)+b[7]+4139469664&4294967295,w=A+(T<<16&4294967295|T>>>16),T=_+(w^A^y)+b[10]+3200236656&4294967295,_=w+(T<<23&4294967295|T>>>9),T=y+(_^w^A)+b[13]+681279174&4294967295,y=_+(T<<4&4294967295|T>>>28),T=A+(y^_^w)+b[0]+3936430074&4294967295,A=y+(T<<11&4294967295|T>>>21),T=w+(A^y^_)+b[3]+3572445317&4294967295,w=A+(T<<16&4294967295|T>>>16),T=_+(w^A^y)+b[6]+76029189&4294967295,_=w+(T<<23&4294967295|T>>>9),T=y+(_^w^A)+b[9]+3654602809&4294967295,y=_+(T<<4&4294967295|T>>>28),T=A+(y^_^w)+b[12]+3873151461&4294967295,A=y+(T<<11&4294967295|T>>>21),T=w+(A^y^_)+b[15]+530742520&4294967295,w=A+(T<<16&4294967295|T>>>16),T=_+(w^A^y)+b[2]+3299628645&4294967295,_=w+(T<<23&4294967295|T>>>9),T=y+(w^(_|~A))+b[0]+4096336452&4294967295,y=_+(T<<6&4294967295|T>>>26),T=A+(_^(y|~w))+b[7]+1126891415&4294967295,A=y+(T<<10&4294967295|T>>>22),T=w+(y^(A|~_))+b[14]+2878612391&4294967295,w=A+(T<<15&4294967295|T>>>17),T=_+(A^(w|~y))+b[5]+4237533241&4294967295,_=w+(T<<21&4294967295|T>>>11),T=y+(w^(_|~A))+b[12]+1700485571&4294967295,y=_+(T<<6&4294967295|T>>>26),T=A+(_^(y|~w))+b[3]+2399980690&4294967295,A=y+(T<<10&4294967295|T>>>22),T=w+(y^(A|~_))+b[10]+4293915773&4294967295,w=A+(T<<15&4294967295|T>>>17),T=_+(A^(w|~y))+b[1]+2240044497&4294967295,_=w+(T<<21&4294967295|T>>>11),T=y+(w^(_|~A))+b[8]+1873313359&4294967295,y=_+(T<<6&4294967295|T>>>26),T=A+(_^(y|~w))+b[15]+4264355552&4294967295,A=y+(T<<10&4294967295|T>>>22),T=w+(y^(A|~_))+b[6]+2734768916&4294967295,w=A+(T<<15&4294967295|T>>>17),T=_+(A^(w|~y))+b[13]+1309151649&4294967295,_=w+(T<<21&4294967295|T>>>11),T=y+(w^(_|~A))+b[4]+4149444226&4294967295,y=_+(T<<6&4294967295|T>>>26),T=A+(_^(y|~w))+b[11]+3174756917&4294967295,A=y+(T<<10&4294967295|T>>>22),T=w+(y^(A|~_))+b[2]+718787259&4294967295,w=A+(T<<15&4294967295|T>>>17),T=_+(A^(w|~y))+b[9]+3951481745&4294967295,I.g[0]=I.g[0]+y&4294967295,I.g[1]=I.g[1]+(w+(T<<21&4294967295|T>>>11))&4294967295,I.g[2]=I.g[2]+w&4294967295,I.g[3]=I.g[3]+A&4294967295}a.prototype.v=function(I,y){y===void 0&&(y=I.length);let _=y-this.blockSize,b=this.C,w=this.h,A=0;for(;A<y;){if(w==0)for(;A<=_;)r(this,I,A),A+=this.blockSize;if(typeof I=="string"){for(;A<y;)if(b[w++]=I.charCodeAt(A++),w==this.blockSize){r(this,b),w=0;break}}else for(;A<y;)if(b[w++]=I[A++],w==this.blockSize){r(this,b),w=0;break}}this.h=w,this.o+=y},a.prototype.A=function(){var I=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);I[0]=128;for(var y=1;y<I.length-8;++y)I[y]=0;y=this.o*8;for(var _=I.length-8;_<I.length;++_)I[_]=y&255,y/=256;for(this.v(I),I=Array(16),y=0,_=0;_<4;++_)for(let b=0;b<32;b+=8)I[y++]=this.g[_]>>>b&255;return I};function s(I,y){var _=u;return Object.prototype.hasOwnProperty.call(_,I)?_[I]:_[I]=y(I)}function i(I,y){this.h=y;let _=[],b=!0;for(let w=I.length-1;w>=0;w--){let A=I[w]|0;b&&A==y||(_[w]=A,b=!1)}this.g=_}var u={};function l(I){return-128<=I&&I<128?s(I,function(y){return new i([y|0],y<0?-1:0)}):new i([I|0],I<0?-1:0)}function c(I){if(isNaN(I)||!isFinite(I))return p;if(I<0)return L(c(-I));let y=[],_=1;for(let b=0;I>=_;b++)y[b]=I/_|0,_*=4294967296;return new i(y,0)}function f(I,y){if(I.length==0)throw Error("number format error: empty string");if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(I.charAt(0)=="-")return L(f(I.substring(1),y));if(I.indexOf("-")>=0)throw Error('number format error: interior "-" character');let _=c(Math.pow(y,8)),b=p;for(let A=0;A<I.length;A+=8){var w=Math.min(8,I.length-A);let T=parseInt(I.substring(A,A+w),y);w<8?(w=c(Math.pow(y,w)),b=b.j(w).add(c(T))):(b=b.j(_),b=b.add(c(T)))}return b}var p=l(0),m=l(1),S=l(16777216);t=i.prototype,t.m=function(){if(D(this))return-L(this).m();let I=0,y=1;for(let _=0;_<this.g.length;_++){let b=this.i(_);I+=(b>=0?b:4294967296+b)*y,y*=4294967296}return I},t.toString=function(I){if(I=I||10,I<2||36<I)throw Error("radix out of range: "+I);if(R(this))return"0";if(D(this))return"-"+L(this).toString(I);let y=c(Math.pow(I,6));var _=this;let b="";for(;;){let w=x(_,y).g;_=E(_,w.j(y));let A=((_.g.length>0?_.g[0]:_.h)>>>0).toString(I);if(_=w,R(_))return A+b;for(;A.length<6;)A="0"+A;b=A+b}},t.i=function(I){return I<0?0:I<this.g.length?this.g[I]:this.h};function R(I){if(I.h!=0)return!1;for(let y=0;y<I.g.length;y++)if(I.g[y]!=0)return!1;return!0}function D(I){return I.h==-1}t.l=function(I){return I=E(this,I),D(I)?-1:R(I)?0:1};function L(I){let y=I.g.length,_=[];for(let b=0;b<y;b++)_[b]=~I.g[b];return new i(_,~I.h).add(m)}t.abs=function(){return D(this)?L(this):this},t.add=function(I){let y=Math.max(this.g.length,I.g.length),_=[],b=0;for(let w=0;w<=y;w++){let A=b+(this.i(w)&65535)+(I.i(w)&65535),T=(A>>>16)+(this.i(w)>>>16)+(I.i(w)>>>16);b=T>>>16,A&=65535,T&=65535,_[w]=T<<16|A}return new i(_,_[_.length-1]&-2147483648?-1:0)};function E(I,y){return I.add(L(y))}t.j=function(I){if(R(this)||R(I))return p;if(D(this))return D(I)?L(this).j(L(I)):L(L(this).j(I));if(D(I))return L(this.j(L(I)));if(this.l(S)<0&&I.l(S)<0)return c(this.m()*I.m());let y=this.g.length+I.g.length,_=[];for(var b=0;b<2*y;b++)_[b]=0;for(b=0;b<this.g.length;b++)for(let w=0;w<I.g.length;w++){let A=this.i(b)>>>16,T=this.i(b)&65535,de=I.i(w)>>>16,ee=I.i(w)&65535;_[2*b+2*w]+=T*ee,v(_,2*b+2*w),_[2*b+2*w+1]+=A*ee,v(_,2*b+2*w+1),_[2*b+2*w+1]+=T*de,v(_,2*b+2*w+1),_[2*b+2*w+2]+=A*de,v(_,2*b+2*w+2)}for(I=0;I<y;I++)_[I]=_[2*I+1]<<16|_[2*I];for(I=y;I<2*y;I++)_[I]=0;return new i(_,0)};function v(I,y){for(;(I[y]&65535)!=I[y];)I[y+1]+=I[y]>>>16,I[y]&=65535,y++}function C(I,y){this.g=I,this.h=y}function x(I,y){if(R(y))throw Error("division by zero");if(R(I))return new C(p,p);if(D(I))return y=x(L(I),y),new C(L(y.g),L(y.h));if(D(y))return y=x(I,L(y)),new C(L(y.g),y.h);if(I.g.length>30){if(D(I)||D(y))throw Error("slowDivide_ only works with positive integers.");for(var _=m,b=y;b.l(I)<=0;)_=G(_),b=G(b);var w=z(_,1),A=z(b,1);for(b=z(b,2),_=z(_,2);!R(b);){var T=A.add(b);T.l(I)<=0&&(w=w.add(_),A=T),b=z(b,1),_=z(_,1)}return y=E(I,w.j(y)),new C(w,y)}for(w=p;I.l(y)>=0;){for(_=Math.max(1,Math.floor(I.m()/y.m())),b=Math.ceil(Math.log(_)/Math.LN2),b=b<=48?1:Math.pow(2,b-48),A=c(_),T=A.j(y);D(T)||T.l(I)>0;)_-=b,A=c(_),T=A.j(y);R(A)&&(A=m),w=w.add(A),I=E(I,T)}return new C(w,I)}t.B=function(I){return x(this,I).h},t.and=function(I){let y=Math.max(this.g.length,I.g.length),_=[];for(let b=0;b<y;b++)_[b]=this.i(b)&I.i(b);return new i(_,this.h&I.h)},t.or=function(I){let y=Math.max(this.g.length,I.g.length),_=[];for(let b=0;b<y;b++)_[b]=this.i(b)|I.i(b);return new i(_,this.h|I.h)},t.xor=function(I){let y=Math.max(this.g.length,I.g.length),_=[];for(let b=0;b<y;b++)_[b]=this.i(b)^I.i(b);return new i(_,this.h^I.h)};function G(I){let y=I.g.length+1,_=[];for(let b=0;b<y;b++)_[b]=I.i(b)<<1|I.i(b-1)>>>31;return new i(_,I.h)}function z(I,y){let _=y>>5;y%=32;let b=I.g.length-_,w=[];for(let A=0;A<b;A++)w[A]=y>0?I.i(A+_)>>>y|I.i(A+_+1)<<32-y:I.i(A+_);return new i(w,I.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,i_=fx.Md5=a,i.prototype.add=i.prototype.add,i.prototype.multiply=i.prototype.j,i.prototype.modulo=i.prototype.B,i.prototype.compare=i.prototype.l,i.prototype.toNumber=i.prototype.m,i.prototype.toString=i.prototype.toString,i.prototype.getBits=i.prototype.i,i.fromNumber=c,i.fromString=f,Ur=fx.Integer=i}).apply(typeof dx<"u"?dx:typeof self<"u"?self:typeof window<"u"?window:{});var Gh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Br={};var o_,w2,Jo,u_,yc,jh,l_,c_,d_;(function(){var t,e=Object.defineProperty;function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Gh=="object"&&Gh];for(var d=0;d<o.length;++d){var h=o[d];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var a=n(this);function r(o,d){if(d)e:{var h=a;o=o.split(".");for(var g=0;g<o.length-1;g++){var k=o[g];if(!(k in h))break e;h=h[k]}o=o[o.length-1],g=h[o],d=d(g),d!=g&&d!=null&&e(h,o,{configurable:!0,writable:!0,value:d})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(d){var h=[],g;for(g in d)Object.prototype.hasOwnProperty.call(d,g)&&h.push([g,d[g]]);return h}});var s=s||{},i=this||self;function u(o){var d=typeof o;return d=="object"&&o!=null||d=="function"}function l(o,d,h){return o.call.apply(o.bind,arguments)}function c(o,d,h){return c=l,c.apply(null,arguments)}function f(o,d){var h=Array.prototype.slice.call(arguments,1);return function(){var g=h.slice();return g.push.apply(g,arguments),o.apply(this,g)}}function p(o,d){function h(){}h.prototype=d.prototype,o.Z=d.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(g,k,P){for(var W=Array(arguments.length-2),ye=2;ye<arguments.length;ye++)W[ye-2]=arguments[ye];return d.prototype[k].apply(g,W)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function S(o){let d=o.length;if(d>0){let h=Array(d);for(let g=0;g<d;g++)h[g]=o[g];return h}return[]}function R(o,d){for(let g=1;g<arguments.length;g++){let k=arguments[g];var h=typeof k;if(h=h!="object"?h:k?Array.isArray(k)?"array":h:"null",h=="array"||h=="object"&&typeof k.length=="number"){h=o.length||0;let P=k.length||0;o.length=h+P;for(let W=0;W<P;W++)o[h+W]=k[W]}else o.push(k)}}class D{constructor(d,h){this.i=d,this.j=h,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function L(o){i.setTimeout(()=>{throw o},0)}function E(){var o=I;let d=null;return o.g&&(d=o.g,o.g=o.g.next,o.g||(o.h=null),d.next=null),d}class v{constructor(){this.h=this.g=null}add(d,h){let g=C.get();g.set(d,h),this.h?this.h.next=g:this.g=g,this.h=g}}var C=new D(()=>new x,o=>o.reset());class x{constructor(){this.next=this.g=this.h=null}set(d,h){this.h=d,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let G,z=!1,I=new v,y=()=>{let o=Promise.resolve(void 0);G=()=>{o.then(_)}};function _(){for(var o;o=E();){try{o.h.call(o.g)}catch(h){L(h)}var d=C;d.j(o),d.h<100&&(d.h++,o.next=d.g,d.g=o)}z=!1}function b(){this.u=this.u,this.C=this.C}b.prototype.u=!1,b.prototype.dispose=function(){this.u||(this.u=!0,this.N())},b.prototype[Symbol.dispose]=function(){this.dispose()},b.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(o,d){this.type=o,this.g=this.target=d,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var A=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var o=!1,d=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let h=()=>{};i.addEventListener("test",h,d),i.removeEventListener("test",h,d)}catch{}return o}();function T(o){return/^[\s\xa0]*$/.test(o)}function de(o,d){w.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,d)}p(de,w),de.prototype.init=function(o,d){let h=this.type=o.type,g=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=d,d=o.relatedTarget,d||(h=="mouseover"?d=o.fromElement:h=="mouseout"&&(d=o.toElement)),this.relatedTarget=d,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&de.Z.h.call(this)},de.prototype.h=function(){de.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var ee="closure_listenable_"+(Math.random()*1e6|0),he=0;function M(o,d,h,g,k){this.listener=o,this.proxy=null,this.src=d,this.type=h,this.capture=!!g,this.ha=k,this.key=++he,this.da=this.fa=!1}function O(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function B(o,d,h){for(let g in o)d.call(h,o[g],g,o)}function $(o,d){for(let h in o)d.call(void 0,o[h],h,o)}function Y(o){let d={};for(let h in o)d[h]=o[h];return d}let re="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Je(o,d){let h,g;for(let k=1;k<arguments.length;k++){g=arguments[k];for(h in g)o[h]=g[h];for(let P=0;P<re.length;P++)h=re[P],Object.prototype.hasOwnProperty.call(g,h)&&(o[h]=g[h])}}function Me(o){this.src=o,this.g={},this.h=0}Me.prototype.add=function(o,d,h,g,k){let P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);let W=dt(o,d,g,k);return W>-1?(d=o[W],h||(d.fa=!1)):(d=new M(d,this.src,P,!!g,k),d.fa=h,o.push(d)),d};function Xe(o,d){let h=d.type;if(h in o.g){var g=o.g[h],k=Array.prototype.indexOf.call(g,d,void 0),P;(P=k>=0)&&Array.prototype.splice.call(g,k,1),P&&(O(d),o.g[h].length==0&&(delete o.g[h],o.h--))}}function dt(o,d,h,g){for(let k=0;k<o.length;++k){let P=o[k];if(!P.da&&P.listener==d&&P.capture==!!h&&P.ha==g)return k}return-1}var ta="closure_lm_"+(Math.random()*1e6|0),yn={};function Ze(o,d,h,g,k){if(g&&g.once)return ae(o,d,h,g,k);if(Array.isArray(d)){for(let P=0;P<d.length;P++)Ze(o,d[P],h,g,k);return null}return h=et(h),o&&o[ee]?o.J(d,h,u(g)?!!g.capture:!!g,k):N(o,d,h,!1,g,k)}function N(o,d,h,g,k,P){if(!d)throw Error("Invalid event type");let W=u(k)?!!k.capture:!!k,ye=ht(o);if(ye||(o[ta]=ye=new Me(o)),h=ye.add(d,h,g,W,P),h.proxy)return h;if(g=se(),h.proxy=g,g.src=o,g.listener=h,o.addEventListener)A||(k=W),k===void 0&&(k=!1),o.addEventListener(d.toString(),g,k);else if(o.attachEvent)o.attachEvent(Pe(d.toString()),g);else if(o.addListener&&o.removeListener)o.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return h}function se(){function o(h){return d.call(o.src,o.listener,h)}let d=ft;return o}function ae(o,d,h,g,k){if(Array.isArray(d)){for(let P=0;P<d.length;P++)ae(o,d[P],h,g,k);return null}return h=et(h),o&&o[ee]?o.K(d,h,u(g)?!!g.capture:!!g,k):N(o,d,h,!0,g,k)}function ne(o,d,h,g,k){if(Array.isArray(d))for(var P=0;P<d.length;P++)ne(o,d[P],h,g,k);else g=u(g)?!!g.capture:!!g,h=et(h),o&&o[ee]?(o=o.i,P=String(d).toString(),P in o.g&&(d=o.g[P],h=dt(d,h,g,k),h>-1&&(O(d[h]),Array.prototype.splice.call(d,h,1),d.length==0&&(delete o.g[P],o.h--)))):o&&(o=ht(o))&&(d=o.g[d.toString()],o=-1,d&&(o=dt(d,h,g,k)),(h=o>-1?d[o]:null)&&Ie(h))}function Ie(o){if(typeof o!="number"&&o&&!o.da){var d=o.src;if(d&&d[ee])Xe(d.i,o);else{var h=o.type,g=o.proxy;d.removeEventListener?d.removeEventListener(h,g,o.capture):d.detachEvent?d.detachEvent(Pe(h),g):d.addListener&&d.removeListener&&d.removeListener(g),(h=ht(d))?(Xe(h,o),h.h==0&&(h.src=null,d[ta]=null)):O(o)}}}function Pe(o){return o in yn?yn[o]:yn[o]="on"+o}function ft(o,d){if(o.da)o=!0;else{d=new de(d,this);let h=o.listener,g=o.ha||o.src;o.fa&&Ie(o),o=h.call(g,d)}return o}function ht(o){return o=o[ta],o instanceof Me?o:null}var nt="__closure_events_fn_"+(Math.random()*1e9>>>0);function et(o){return typeof o=="function"?o:(o[nt]||(o[nt]=function(d){return o.handleEvent(d)}),o[nt])}function Se(){b.call(this),this.i=new Me(this),this.M=this,this.G=null}p(Se,b),Se.prototype[ee]=!0,Se.prototype.removeEventListener=function(o,d,h,g){ne(this,o,d,h,g)};function pe(o,d){var h,g=o.G;if(g)for(h=[];g;g=g.G)h.push(g);if(o=o.M,g=d.type||d,typeof d=="string")d=new w(d,o);else if(d instanceof w)d.target=d.target||o;else{var k=d;d=new w(g,o),Je(d,k)}k=!0;let P,W;if(h)for(W=h.length-1;W>=0;W--)P=d.g=h[W],k=qe(P,g,!0,d)&&k;if(P=d.g=o,k=qe(P,g,!0,d)&&k,k=qe(P,g,!1,d)&&k,h)for(W=0;W<h.length;W++)P=d.g=h[W],k=qe(P,g,!1,d)&&k}Se.prototype.N=function(){if(Se.Z.N.call(this),this.i){var o=this.i;for(let d in o.g){let h=o.g[d];for(let g=0;g<h.length;g++)O(h[g]);delete o.g[d],o.h--}}this.G=null},Se.prototype.J=function(o,d,h,g){return this.i.add(String(o),d,!1,h,g)},Se.prototype.K=function(o,d,h,g){return this.i.add(String(o),d,!0,h,g)};function qe(o,d,h,g){if(d=o.i.g[String(d)],!d)return!0;d=d.concat();let k=!0;for(let P=0;P<d.length;++P){let W=d[P];if(W&&!W.da&&W.capture==h){let ye=W.listener,Kt=W.ha||W.src;W.fa&&Xe(o.i,W),k=ye.call(Kt,g)!==!1&&k}}return k&&!g.defaultPrevented}function ze(o,d){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=c(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:i.setTimeout(o,d||0)}function Oe(o){o.g=ze(()=>{o.g=null,o.i&&(o.i=!1,Oe(o))},o.l);let d=o.h;o.h=null,o.m.apply(null,d)}class bt extends b{constructor(d,h){super(),this.m=d,this.l=h,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:Oe(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ot(o){b.call(this),this.h=o,this.g={}}p(Ot,b);var wt=[];function $t(o){B(o.g,function(d,h){this.g.hasOwnProperty(h)&&Ie(d)},o),o.g={}}Ot.prototype.N=function(){Ot.Z.N.call(this),$t(this)},Ot.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ct=i.JSON.stringify,Jt=i.JSON.parse,Ve=class{stringify(o){return i.JSON.stringify(o,void 0)}parse(o){return i.JSON.parse(o,void 0)}};function ts(){}function pt(){}var Fe={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function be(){w.call(this,"d")}p(be,w);function Lt(){w.call(this,"c")}p(Lt,w);var Fn={},La=null;function Mt(){return La=La||new Se}Fn.Ia="serverreachability";function Un(o){w.call(this,Fn.Ia,o)}p(Un,w);function lr(o){let d=Mt();pe(d,new Un(d))}Fn.STAT_EVENT="statevent";function ns(o,d){w.call(this,Fn.STAT_EVENT,o),this.stat=d}p(ns,w);function Zt(o){let d=Mt();pe(d,new ns(d,o))}Fn.Ja="timingevent";function Aa(o,d){w.call(this,Fn.Ja,o),this.size=d}p(Aa,w);function At(o,d){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){o()},d)}function cr(){this.g=!0}cr.prototype.ua=function(){this.g=!1};function cd(o,d,h,g,k,P){o.info(function(){if(o.g)if(P){var W="",ye=P.split("&");for(let Qe=0;Qe<ye.length;Qe++){var Kt=ye[Qe].split("=");if(Kt.length>1){let en=Kt[0];Kt=Kt[1];let Ma=en.split("_");W=Ma.length>=2&&Ma[1]=="type"?W+(en+"="+Kt+"&"):W+(en+"=redacted&")}}}else W=null;else W=P;return"XMLHTTP REQ ("+g+") [attempt "+k+"]: "+d+`
`+h+`
`+W})}function dd(o,d,h,g,k,P,W){o.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+k+"]: "+d+`
`+h+`
`+P+" "+W})}function xa(o,d,h,g){o.info(function(){return"XMLHTTP TEXT ("+d+"): "+Nu(o,h)+(g?" "+g:"")})}function Mu(o,d){o.info(function(){return"TIMEOUT: "+d})}cr.prototype.info=function(){};function Nu(o,d){if(!o.g)return d;if(!d)return null;try{let P=JSON.parse(d);if(P){for(o=0;o<P.length;o++)if(Array.isArray(P[o])){var h=P[o];if(!(h.length<2)){var g=h[1];if(Array.isArray(g)&&!(g.length<1)){var k=g[0];if(k!="noop"&&k!="stop"&&k!="close")for(let W=1;W<g.length;W++)g[W]=""}}}}return Ct(P)}catch{return d}}var Ra={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Xs={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Ys;function Qs(){}p(Qs,ts),Qs.prototype.g=function(){return new XMLHttpRequest},Ys=new Qs;function dr(o){return encodeURIComponent(String(o))}function Vu(o){var d=1;o=o.split(":");let h=[];for(;d>0&&o.length;)h.push(o.shift()),d--;return o.length&&h.push(o.join(":")),h}function na(o,d,h,g){this.j=o,this.i=d,this.l=h,this.S=g||1,this.V=new Ot(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Fu}function Fu(){this.i=null,this.g="",this.h=!1}var Uu={},zi={};function ka(o,d,h){o.M=1,o.A=Wi(Bn(d)),o.u=h,o.R=!0,Cn(o,null)}function Cn(o,d){o.F=Date.now(),$s(o),o.B=Bn(o.A);var h=o.B,g=o.S;Array.isArray(g)||(g=[String(g)]),Vv(h.i,"t",g),o.C=0,h=o.j.L,o.h=new Fu,o.g=tE(o.j,h?d:null,!o.u),o.P>0&&(o.O=new bt(c(o.Y,o,o.g),o.P)),d=o.V,h=o.g,g=o.ba;var k="readystatechange";Array.isArray(k)||(k&&(wt[0]=k.toString()),k=wt);for(let P=0;P<k.length;P++){let W=Ze(h,k[P],g||d.handleEvent,!1,d.h||d);if(!W)break;d.g[W.key]=W}d=o.J?Y(o.J):{},o.u?(o.v||(o.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,d)):(o.v="GET",o.g.ea(o.B,o.v,null,d)),lr(),cd(o.i,o.v,o.B,o.l,o.S,o.u)}na.prototype.ba=function(o){o=o.target;let d=this.O;d&&os(o)==3?d.j():this.Y(o)},na.prototype.Y=function(o){try{if(o==this.g)e:{let ye=os(this.g),Kt=this.g.ya(),Qe=this.g.ca();if(!(ye<3)&&(ye!=3||this.g&&(this.h.h||this.g.la()||Gv(this.g)))){this.K||ye!=4||Kt==7||(Kt==8||Qe<=0?lr(3):lr(2)),Hi(this);var d=this.g.ca();this.X=d;var h=ya(this);if(this.o=d==200,dd(this.i,this.v,this.B,this.l,this.S,ye,d),this.o){if(this.U&&!this.L){t:{if(this.g){var g,k=this.g;if((g=k.g?k.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!T(g)){var P=g;break t}}P=null}if(o=P)xa(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Gi(this,o);else{this.o=!1,this.m=3,Zt(12),Pa(this),as(this);break e}}if(this.R){o=!0;let en;for(;!this.K&&this.C<h.length;)if(en=Da(this,h),en==zi){ye==4&&(this.m=4,Zt(14),o=!1),xa(this.i,this.l,null,"[Incomplete Response]");break}else if(en==Uu){this.m=4,Zt(15),xa(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else xa(this.i,this.l,en,null),Gi(this,en);if(fr(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ye!=4||h.length!=0||this.h.h||(this.m=1,Zt(16),o=!1),this.o=this.o&&o,!o)xa(this.i,this.l,h,"[Invalid Chunked Response]"),Pa(this),as(this);else if(h.length>0&&!this.W){this.W=!0;var W=this.j;W.g==this&&W.aa&&!W.P&&(W.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),im(W),W.P=!0,Zt(11))}}else xa(this.i,this.l,h,null),Gi(this,h);ye==4&&Pa(this),this.o&&!this.K&&(ye==4?$v(this.j,this):(this.o=!1,$s(this)))}else Nk(this.g),d==400&&h.indexOf("Unknown SID")>0?(this.m=3,Zt(12)):(this.m=0,Zt(13)),Pa(this),as(this)}}}catch{}finally{}};function ya(o){if(!fr(o))return o.g.la();let d=Gv(o.g);if(d==="")return"";let h="",g=d.length,k=os(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return Pa(o),as(o),"";o.h.i=new i.TextDecoder}for(let P=0;P<g;P++)o.h.h=!0,h+=o.h.i.decode(d[P],{stream:!(k&&P==g-1)});return d.length=0,o.h.g+=h,o.C=0,o.h.g}function fr(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function Da(o,d){var h=o.C,g=d.indexOf(`
`,h);return g==-1?zi:(h=Number(d.substring(h,g)),isNaN(h)?Uu:(g+=1,g+h>d.length?zi:(d=d.slice(g,g+h),o.C=g+h,d)))}na.prototype.cancel=function(){this.K=!0,Pa(this)};function $s(o){o.T=Date.now()+o.H,Js(o,o.H)}function Js(o,d){if(o.D!=null)throw Error("WatchDog timer not null");o.D=At(c(o.aa,o),d)}function Hi(o){o.D&&(i.clearTimeout(o.D),o.D=null)}na.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?(Mu(this.i,this.B),this.M!=2&&(lr(),Zt(17)),Pa(this),this.m=2,as(this)):Js(this,this.T-o)};function as(o){o.j.I==0||o.K||$v(o.j,o)}function Pa(o){Hi(o);var d=o.O;d&&typeof d.dispose=="function"&&d.dispose(),o.O=null,$t(o.V),o.g&&(d=o.g,o.g=null,d.abort(),d.dispose())}function Gi(o,d){try{var h=o.j;if(h.I!=0&&(h.g==o||ji(h.h,o))){if(!o.L&&ji(h.h,o)&&h.I==3){try{var g=h.Ba.g.parse(d)}catch{g=null}if(Array.isArray(g)&&g.length==3){var k=g;if(k[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)_d(h),yd(h);else break e;sm(h),Zt(18)}}else h.xa=k[1],0<h.xa-h.K&&k[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=At(c(h.Va,h),6e3));qu(h.h)<=1&&h.ta&&(h.ta=void 0)}else ei(h,11)}else if((o.L||h.g==o)&&_d(h),!T(d))for(k=h.Ba.g.parse(d),d=0;d<k.length;d++){let Qe=k[d],en=Qe[0];if(!(en<=h.K))if(h.K=en,Qe=Qe[1],h.I==2)if(Qe[0]=="c"){h.M=Qe[1],h.ba=Qe[2];let Ma=Qe[3];Ma!=null&&(h.ka=Ma,h.j.info("VER="+h.ka));let ti=Qe[4];ti!=null&&(h.za=ti,h.j.info("SVER="+h.za));let us=Qe[5];us!=null&&typeof us=="number"&&us>0&&(g=1.5*us,h.O=g,h.j.info("backChannelRequestTimeoutMs_="+g)),g=h;let ls=o.g;if(ls){let vd=ls.g?ls.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(vd){var P=g.h;P.g||vd.indexOf("spdy")==-1&&vd.indexOf("quic")==-1&&vd.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(hr(P,P.h),P.h=null))}if(g.G){let om=ls.g?ls.g.getResponseHeader("X-HTTP-Session-Id"):null;om&&(g.wa=om,je(g.J,g.G,om))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),g=h;var W=o;if(g.na=eE(g,g.L?g.ba:null,g.W),W.L){zu(g.h,W);var ye=W,Kt=g.O;Kt&&(ye.H=Kt),ye.D&&(Hi(ye),$s(ye)),g.g=W}else Yv(g);h.i.length>0&&Id(h)}else Qe[0]!="stop"&&Qe[0]!="close"||ei(h,7);else h.I==3&&(Qe[0]=="stop"||Qe[0]=="close"?Qe[0]=="stop"?ei(h,7):rm(h):Qe[0]!="noop"&&h.l&&h.l.qa(Qe),h.A=0)}}lr(4)}catch{}}var fd=class{constructor(o,d){this.g=o,this.map=d}};function Oa(o){this.l=o||10,i.PerformanceNavigationTiming?(o=i.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Bu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function qu(o){return o.h?1:o.g?o.g.size:0}function ji(o,d){return o.h?o.h==d:o.g?o.g.has(d):!1}function hr(o,d){o.g?o.g.add(d):o.h=d}function zu(o,d){o.h&&o.h==d?o.h=null:o.g&&o.g.has(d)&&o.g.delete(d)}Oa.prototype.cancel=function(){if(this.i=Hu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function Hu(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let d=o.i;for(let h of o.g.values())d=d.concat(h.G);return d}return S(o.i)}var Gu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function hd(o,d){if(o){o=o.split("&");for(let h=0;h<o.length;h++){let g=o[h].indexOf("="),k,P=null;g>=0?(k=o[h].substring(0,g),P=o[h].substring(g+1)):k=o[h],d(k,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function Ia(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;o instanceof Ia?(this.l=o.l,rs(this,o.j),this.o=o.o,this.g=o.g,ss(this,o.u),this.h=o.h,Ki(this,Fv(o.i)),this.m=o.m):o&&(d=String(o).match(Gu))?(this.l=!1,rs(this,d[1]||"",!0),this.o=pr(d[2]||""),this.g=pr(d[3]||"",!0),ss(this,d[4]),this.h=pr(d[5]||"",!0),Ki(this,d[6]||"",!0),this.m=pr(d[7]||"")):(this.l=!1,this.i=new Ye(null,this.l))}Ia.prototype.toString=function(){let o=[];var d=this.j;d&&o.push(Zs(d,U,!0),":");var h=this.g;return(h||d=="file")&&(o.push("//"),(d=this.o)&&o.push(Zs(d,U,!0),"@"),o.push(dr(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(Zs(h,h.charAt(0)=="/"?K:j,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",Zs(h,ue)),o.join("")},Ia.prototype.resolve=function(o){let d=Bn(this),h=!!o.j;h?rs(d,o.j):h=!!o.o,h?d.o=o.o:h=!!o.g,h?d.g=o.g:h=o.u!=null;var g=o.h;if(h)ss(d,o.u);else if(h=!!o.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var k=d.h.lastIndexOf("/");k!=-1&&(g=d.h.slice(0,k+1)+g)}if(k=g,k==".."||k==".")g="";else if(k.indexOf("./")!=-1||k.indexOf("/.")!=-1){g=k.lastIndexOf("/",0)==0,k=k.split("/");let P=[];for(let W=0;W<k.length;){let ye=k[W++];ye=="."?g&&W==k.length&&P.push(""):ye==".."?((P.length>1||P.length==1&&P[0]!="")&&P.pop(),g&&W==k.length&&P.push("")):(P.push(ye),g=!0)}g=P.join("/")}else g=k}return h?d.h=g:h=o.i.toString()!=="",h?Ki(d,Fv(o.i)):h=!!o.m,h&&(d.m=o.m),d};function Bn(o){return new Ia(o)}function rs(o,d,h){o.j=h?pr(d,!0):d,o.j&&(o.j=o.j.replace(/:$/,""))}function ss(o,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);o.u=d}else o.u=null}function Ki(o,d,h){d instanceof Ye?(o.i=d,Rk(o.i,o.l)):(h||(d=Zs(d,Z)),o.i=new Ye(d,o.l))}function je(o,d,h){o.i.set(d,h)}function Wi(o){return je(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function pr(o,d){return o?d?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Zs(o,d,h){return typeof o=="string"?(o=encodeURI(o).replace(d,nm),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function nm(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var U=/[#\/\?@]/g,j=/[#\?:]/g,K=/[#\?]/g,Z=/[#\?@]/g,ue=/#/g;function Ye(o,d){this.h=this.g=null,this.i=o||null,this.j=!!d}function le(o){o.g||(o.g=new Map,o.h=0,o.i&&hd(o.i,function(d,h){o.add(decodeURIComponent(d.replace(/\+/g," ")),h)}))}t=Ye.prototype,t.add=function(o,d){le(this),this.i=null,o=Xi(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(d),this.h+=1,this};function we(o,d){le(o),d=Xi(o,d),o.g.has(d)&&(o.i=null,o.h-=o.g.get(d).length,o.g.delete(d))}function qn(o,d){return le(o),d=Xi(o,d),o.g.has(d)}t.forEach=function(o,d){le(this),this.g.forEach(function(h,g){h.forEach(function(k){o.call(d,k,g,this)},this)},this)};function Nv(o,d){le(o);let h=[];if(typeof d=="string")qn(o,d)&&(h=h.concat(o.g.get(Xi(o,d))));else for(o=Array.from(o.g.values()),d=0;d<o.length;d++)h=h.concat(o[d]);return h}t.set=function(o,d){return le(this),this.i=null,o=Xi(this,o),qn(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[d]),this.h+=1,this},t.get=function(o,d){return o?(o=Nv(this,o),o.length>0?String(o[0]):d):d};function Vv(o,d,h){we(o,d),h.length>0&&(o.i=null,o.g.set(Xi(o,d),S(h)),o.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],d=Array.from(this.g.keys());for(let g=0;g<d.length;g++){var h=d[g];let k=dr(h);h=Nv(this,h);for(let P=0;P<h.length;P++){let W=k;h[P]!==""&&(W+="="+dr(h[P])),o.push(W)}}return this.i=o.join("&")};function Fv(o){let d=new Ye;return d.i=o.i,o.g&&(d.g=new Map(o.g),d.h=o.h),d}function Xi(o,d){return d=String(d),o.j&&(d=d.toLowerCase()),d}function Rk(o,d){d&&!o.j&&(le(o),o.i=null,o.g.forEach(function(h,g){let k=g.toLowerCase();g!=k&&(we(this,g),Vv(this,k,h))},o)),o.j=d}function kk(o,d){let h=new cr;if(i.Image){let g=new Image;g.onload=f(is,h,"TestLoadImage: loaded",!0,d,g),g.onerror=f(is,h,"TestLoadImage: error",!1,d,g),g.onabort=f(is,h,"TestLoadImage: abort",!1,d,g),g.ontimeout=f(is,h,"TestLoadImage: timeout",!1,d,g),i.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=o}else d(!1)}function Dk(o,d){let h=new cr,g=new AbortController,k=setTimeout(()=>{g.abort(),is(h,"TestPingServer: timeout",!1,d)},1e4);fetch(o,{signal:g.signal}).then(P=>{clearTimeout(k),P.ok?is(h,"TestPingServer: ok",!0,d):is(h,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(k),is(h,"TestPingServer: error",!1,d)})}function is(o,d,h,g,k){try{k&&(k.onload=null,k.onerror=null,k.onabort=null,k.ontimeout=null),g(h)}catch{}}function Pk(){this.g=new Ve}function pd(o){this.i=o.Sb||null,this.h=o.ab||!1}p(pd,ts),pd.prototype.g=function(){return new md(this.i,this.h)};function md(o,d){Se.call(this),this.H=o,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(md,Se),t=md.prototype,t.open=function(o,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=d,this.readyState=1,Ku(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(d.body=o),(this.H||i).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,ju(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Ku(this)),this.g&&(this.readyState=3,Ku(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof i.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Uv(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Uv(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var d=o.value?o.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!o.done}))&&(this.response=this.responseText+=d)}o.done?ju(this):Ku(this),this.readyState==3&&Uv(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,ju(this))},t.Na=function(o){this.g&&(this.response=o,ju(this))},t.ga=function(){this.g&&ju(this)};function ju(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Ku(o)}t.setRequestHeader=function(o,d){this.A.append(o,d)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],d=this.h.entries();for(var h=d.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=d.next();return o.join(`\r
`)};function Ku(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(md.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Bv(o){let d="";return B(o,function(h,g){d+=g,d+=":",d+=h,d+=`\r
`}),d}function am(o,d,h){e:{for(g in h){var g=!1;break e}g=!0}g||(h=Bv(h),typeof o=="string"?h!=null&&dr(h):je(o,d,h))}function _t(o){Se.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(_t,Se);var Ok=/^https?$/i,Mk=["POST","PUT"];t=_t.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,d,h,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);d=d?d.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Ys.g(),this.g.onreadystatechange=m(c(this.Ca,this));try{this.B=!0,this.g.open(d,String(o),!0),this.B=!1}catch(P){qv(this,P);return}if(o=h||"",h=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var k in g)h.set(k,g[k]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(let P of g.keys())h.set(P,g.get(P));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(h.keys()).find(P=>P.toLowerCase()=="content-type"),k=i.FormData&&o instanceof i.FormData,!(Array.prototype.indexOf.call(Mk,d,void 0)>=0)||g||k||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[P,W]of h)this.g.setRequestHeader(P,W);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(P){qv(this,P)}};function qv(o,d){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=d,o.o=5,zv(o),gd(o)}function zv(o){o.A||(o.A=!0,pe(o,"complete"),pe(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,pe(this,"complete"),pe(this,"abort"),gd(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),gd(this,!0)),_t.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?Hv(this):this.Xa())},t.Xa=function(){Hv(this)};function Hv(o){if(o.h&&typeof s<"u"){if(o.v&&os(o)==4)setTimeout(o.Ca.bind(o),0);else if(pe(o,"readystatechange"),os(o)==4){o.h=!1;try{let P=o.ca();e:switch(P){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var h;if(!(h=d)){var g;if(g=P===0){let W=String(o.D).match(Gu)[1]||null;!W&&i.self&&i.self.location&&(W=i.self.location.protocol.slice(0,-1)),g=!Ok.test(W?W.toLowerCase():"")}h=g}if(h)pe(o,"complete"),pe(o,"success");else{o.o=6;try{var k=os(o)>2?o.g.statusText:""}catch{k=""}o.l=k+" ["+o.ca()+"]",zv(o)}}finally{gd(o)}}}}function gd(o,d){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let h=o.g;o.g=null,d||pe(o,"ready");try{h.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function os(o){return o.g?o.g.readyState:0}t.ca=function(){try{return os(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var d=this.g.responseText;return o&&d.indexOf(o)==0&&(d=d.substring(o.length)),Jt(d)}};function Gv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Nk(o){let d={};o=(o.g&&os(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<o.length;g++){if(T(o[g]))continue;var h=Vu(o[g]);let k=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();let P=d[k]||[];d[k]=P,P.push(h)}$(d,function(g){return g.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Wu(o,d,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||d}function jv(o){this.za=0,this.i=[],this.j=new cr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Wu("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Wu("baseRetryDelayMs",5e3,o),this.Za=Wu("retryDelaySeedMs",1e4,o),this.Ta=Wu("forwardChannelMaxRetries",2,o),this.va=Wu("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new Oa(o&&o.concurrentRequestLimit),this.Ba=new Pk,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=jv.prototype,t.ka=8,t.I=1,t.connect=function(o,d,h,g){Zt(0),this.W=o,this.H=d||{},h&&g!==void 0&&(this.H.OSID=h,this.H.OAID=g),this.F=this.X,this.J=eE(this,null,this.W),Id(this)};function rm(o){if(Kv(o),o.I==3){var d=o.V++,h=Bn(o.J);if(je(h,"SID",o.M),je(h,"RID",d),je(h,"TYPE","terminate"),Xu(o,h),d=new na(o,o.j,d),d.M=2,d.A=Wi(Bn(h)),h=!1,i.navigator&&i.navigator.sendBeacon)try{h=i.navigator.sendBeacon(d.A.toString(),"")}catch{}!h&&i.Image&&(new Image().src=d.A,h=!0),h||(d.g=tE(d.j,null),d.g.ea(d.A)),d.F=Date.now(),$s(d)}Zv(o)}function yd(o){o.g&&(im(o),o.g.cancel(),o.g=null)}function Kv(o){yd(o),o.v&&(i.clearTimeout(o.v),o.v=null),_d(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&i.clearTimeout(o.m),o.m=null)}function Id(o){if(!Bu(o.h)&&!o.m){o.m=!0;var d=o.Ea;G||y(),z||(G(),z=!0),I.add(d,o),o.D=0}}function Vk(o,d){return qu(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=d.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=At(c(o.Ea,o,d),Jv(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let k=new na(this,this.j,o),P=this.o;if(this.U&&(P?(P=Y(P),Je(P,this.U)):P=this.U),this.u!==null||this.R||(k.J=P,P=null),this.S)e:{for(var d=0,h=0;h<this.i.length;h++){t:{var g=this.i[h];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(d+=g,d>4096){d=h;break e}if(d===4096||h===this.i.length-1){d=h+1;break e}}d=1e3}else d=1e3;d=Xv(this,k,d),h=Bn(this.J),je(h,"RID",o),je(h,"CVER",22),this.G&&je(h,"X-HTTP-Session-Id",this.G),Xu(this,h),P&&(this.R?d="headers="+dr(Bv(P))+"&"+d:this.u&&am(h,this.u,P)),hr(this.h,k),this.Ra&&je(h,"TYPE","init"),this.S?(je(h,"$req",d),je(h,"SID","null"),k.U=!0,ka(k,h,null)):ka(k,h,d),this.I=2}}else this.I==3&&(o?Wv(this,o):this.i.length==0||Bu(this.h)||Wv(this))};function Wv(o,d){var h;d?h=d.l:h=o.V++;let g=Bn(o.J);je(g,"SID",o.M),je(g,"RID",h),je(g,"AID",o.K),Xu(o,g),o.u&&o.o&&am(g,o.u,o.o),h=new na(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),d&&(o.i=d.G.concat(o.i)),d=Xv(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),hr(o.h,h),ka(h,g,d)}function Xu(o,d){o.H&&B(o.H,function(h,g){je(d,g,h)}),o.l&&B({},function(h,g){je(d,g,h)})}function Xv(o,d,h){h=Math.min(o.i.length,h);let g=o.l?c(o.l.Ka,o.l,o):null;e:{var k=o.i;let ye=-1;for(;;){let Kt=["count="+h];ye==-1?h>0?(ye=k[0].g,Kt.push("ofs="+ye)):ye=0:Kt.push("ofs="+ye);let Qe=!0;for(let en=0;en<h;en++){var P=k[en].g;let Ma=k[en].map;if(P-=ye,P<0)ye=Math.max(0,k[en].g-100),Qe=!1;else try{P="req"+P+"_"||"";try{var W=Ma instanceof Map?Ma:Object.entries(Ma);for(let[ti,us]of W){let ls=us;u(us)&&(ls=Ct(us)),Kt.push(P+ti+"="+encodeURIComponent(ls))}}catch(ti){throw Kt.push(P+"type="+encodeURIComponent("_badmap")),ti}}catch{g&&g(Ma)}}if(Qe){W=Kt.join("&");break e}}W=void 0}return o=o.i.splice(0,h),d.G=o,W}function Yv(o){if(!o.g&&!o.v){o.Y=1;var d=o.Da;G||y(),z||(G(),z=!0),I.add(d,o),o.A=0}}function sm(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=At(c(o.Da,o),Jv(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,Qv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=At(c(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Zt(10),yd(this),Qv(this))};function im(o){o.B!=null&&(i.clearTimeout(o.B),o.B=null)}function Qv(o){o.g=new na(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var d=Bn(o.na);je(d,"RID","rpc"),je(d,"SID",o.M),je(d,"AID",o.K),je(d,"CI",o.F?"0":"1"),!o.F&&o.ia&&je(d,"TO",o.ia),je(d,"TYPE","xmlhttp"),Xu(o,d),o.u&&o.o&&am(d,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=Wi(Bn(d)),h.u=null,h.R=!0,Cn(h,o)}t.Va=function(){this.C!=null&&(this.C=null,yd(this),sm(this),Zt(19))};function _d(o){o.C!=null&&(i.clearTimeout(o.C),o.C=null)}function $v(o,d){var h=null;if(o.g==d){_d(o),im(o),o.g=null;var g=2}else if(ji(o.h,d))h=d.G,zu(o.h,d),g=1;else return;if(o.I!=0){if(d.o)if(g==1){h=d.u?d.u.length:0,d=Date.now()-d.F;var k=o.D;g=Mt(),pe(g,new Aa(g,h)),Id(o)}else Yv(o);else if(k=d.m,k==3||k==0&&d.X>0||!(g==1&&Vk(o,d)||g==2&&sm(o)))switch(h&&h.length>0&&(d=o.h,d.i=d.i.concat(h)),k){case 1:ei(o,5);break;case 4:ei(o,10);break;case 3:ei(o,6);break;default:ei(o,2)}}}function Jv(o,d){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*d}function ei(o,d){if(o.j.info("Error code "+d),d==2){var h=c(o.bb,o),g=o.Ua;let k=!g;g=new Ia(g||"//www.google.com/images/cleardot.gif"),i.location&&i.location.protocol=="http"||rs(g,"https"),Wi(g),k?kk(g.toString(),h):Dk(g.toString(),h)}else Zt(2);o.I=0,o.l&&o.l.pa(d),Zv(o),Kv(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),Zt(2)):(this.j.info("Failed to ping google.com"),Zt(1))};function Zv(o){if(o.I=0,o.ja=[],o.l){let d=Hu(o.h);(d.length!=0||o.i.length!=0)&&(R(o.ja,d),R(o.ja,o.i),o.h.i.length=0,S(o.i),o.i.length=0),o.l.oa()}}function eE(o,d,h){var g=h instanceof Ia?Bn(h):new Ia(h);if(g.g!="")d&&(g.g=d+"."+g.g),ss(g,g.u);else{var k=i.location;g=k.protocol,d=d?d+"."+k.hostname:k.hostname,k=+k.port;let P=new Ia(null);g&&rs(P,g),d&&(P.g=d),k&&ss(P,k),h&&(P.h=h),g=P}return h=o.G,d=o.wa,h&&d&&je(g,h,d),je(g,"VER",o.ka),Xu(o,g),g}function tE(o,d,h){if(d&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=o.Aa&&!o.ma?new _t(new pd({ab:h})):new _t(o.ma),d.Fa(o.L),d}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function nE(){}t=nE.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function Sd(){}Sd.prototype.g=function(o,d){return new zn(o,d)};function zn(o,d){Se.call(this),this.g=new jv(d),this.l=o,this.h=d&&d.messageUrlParams||null,o=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(o?o["X-WebChannel-Content-Type"]=d.messageContentType:o={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(o?o["X-WebChannel-Client-Profile"]=d.sa:o={"X-WebChannel-Client-Profile":d.sa}),this.g.U=o,(o=d&&d.Qb)&&!T(o)&&(this.g.u=o),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!T(d)&&(this.g.G=d,o=this.h,o!==null&&d in o&&(o=this.h,d in o&&delete o[d])),this.j=new Yi(this)}p(zn,Se),zn.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},zn.prototype.close=function(){rm(this.g)},zn.prototype.o=function(o){var d=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=Ct(o),o=h);d.i.push(new fd(d.Ya++,o)),d.I==3&&Id(d)},zn.prototype.N=function(){this.g.l=null,delete this.j,rm(this.g),delete this.g,zn.Z.N.call(this)};function aE(o){be.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var d=o.__sm__;if(d){e:{for(let h in d){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,d=d!==null&&o in d?d[o]:void 0),this.data=d}else this.data=o}p(aE,be);function rE(){Lt.call(this),this.status=1}p(rE,Lt);function Yi(o){this.g=o}p(Yi,nE),Yi.prototype.ra=function(){pe(this.g,"a")},Yi.prototype.qa=function(o){pe(this.g,new aE(o))},Yi.prototype.pa=function(o){pe(this.g,new rE)},Yi.prototype.oa=function(){pe(this.g,"b")},Sd.prototype.createWebChannel=Sd.prototype.g,zn.prototype.send=zn.prototype.o,zn.prototype.open=zn.prototype.m,zn.prototype.close=zn.prototype.close,d_=Br.createWebChannelTransport=function(){return new Sd},c_=Br.getStatEventTarget=function(){return Mt()},l_=Br.Event=Fn,jh=Br.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Ra.NO_ERROR=0,Ra.TIMEOUT=8,Ra.HTTP_ERROR=6,yc=Br.ErrorCode=Ra,Xs.COMPLETE="complete",u_=Br.EventType=Xs,pt.EventType=Fe,Fe.OPEN="a",Fe.CLOSE="b",Fe.ERROR="c",Fe.MESSAGE="d",Se.prototype.listen=Se.prototype.J,Jo=Br.WebChannel=pt,w2=Br.FetchXmlHttpFactory=pd,_t.prototype.listenOnce=_t.prototype.K,_t.prototype.getLastError=_t.prototype.Ha,_t.prototype.getLastErrorCode=_t.prototype.ya,_t.prototype.getStatus=_t.prototype.ca,_t.prototype.getResponseJson=_t.prototype.La,_t.prototype.getResponseText=_t.prototype.la,_t.prototype.send=_t.prototype.ea,_t.prototype.setWithCredentials=_t.prototype.Fa,o_=Br.XhrIo=_t}).apply(typeof Gh<"u"?Gh:typeof self<"u"?self:typeof window<"u"?window:{});var un=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};un.UNAUTHENTICATED=new un(null),un.GOOGLE_CREDENTIALS=new un("google-credentials-uid"),un.FIRST_PARTY=new un("first-party-uid"),un.MOCK_USER=new un("mock-user");var vu="12.10.0";function Jx(t){vu=t}var Vi=new Fs("@firebase/firestore");function Zo(){return Vi.logLevel}function Q(t,...e){if(Vi.logLevel<=_e.DEBUG){let n=e.map(US);Vi.debug(`Firestore (${vu}): ${t}`,...n)}}function Hr(t,...e){if(Vi.logLevel<=_e.ERROR){let n=e.map(US);Vi.error(`Firestore (${vu}): ${t}`,...n)}}function Gr(t,...e){if(Vi.logLevel<=_e.WARN){let n=e.map(US);Vi.warn(`Firestore (${vu}): ${t}`,...n)}}function US(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}function oe(t,e,n){let a="Unexpected state";typeof e=="string"?a=e:n=e,Zx(t,a,n)}function Zx(t,e,n){let a=`FIRESTORE (${vu}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{a+=" CONTEXT: "+JSON.stringify(n)}catch{a+=" CONTEXT: "+n}throw Hr(a),new Error(a)}function mt(t,e,n,a){let r="Unexpected state";typeof n=="string"?r=n:a=n,t||Zx(e,r,a)}function De(t,e){return t}var q={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},X=class extends wn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var qr=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};var $h=class{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Jh=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(un.UNAUTHENTICATED))}shutdown(){}},I_=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}},Zh=class{constructor(e){this.t=e,this.currentUser=un.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){mt(this.o===void 0,42304);let a=this.i,r=l=>this.i!==a?(a=this.i,n(l)):Promise.resolve(),s=new qr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new qr,e.enqueueRetryable(()=>r(this.currentUser))};let i=()=>{let l=s;e.enqueueRetryable(async()=>{await l.promise,await r(this.currentUser)})},u=l=>{Q("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){let l=this.t.getImmediate({optional:!0});l?u(l):(Q("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new qr)}},0),i()}getToken(){let e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(a=>this.i!==e?(Q("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):a?(mt(typeof a.accessToken=="string",31837,{l:a}),new $h(a.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return mt(e===null||typeof e=="string",2055,{h:e}),new un(e)}},__=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a,this.type="FirstParty",this.user=un.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},S_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a}getToken(){return Promise.resolve(new __(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(un.FIRST_PARTY))}shutdown(){}invalidateToken(){}},ep=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},tp=class{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Nn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){mt(this.o===void 0,3512);let a=s=>{s.error!=null&&Q("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);let i=s.token!==this.m;return this.m=s.token,Q("FirebaseAppCheckTokenProvider",`Received ${i?"new":"existing"} token.`),i?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>a(s))};let r=s=>{Q("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>r(s)),setTimeout(()=>{if(!this.appCheck){let s=this.V.getImmediate({optional:!0});s?r(s):Q("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new ep(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(mt(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new ep(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function C2(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let a=0;a<t;a++)n[a]=Math.floor(256*Math.random());return n}var ou=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516),a="";for(;a.length<20;){let r=C2(40);for(let s=0;s<r.length;++s)a.length<20&&r[s]<n&&(a+=e.charAt(r[s]%62))}return a}};function xe(t,e){return t<e?-1:t>e?1:0}function v_(t,e){let n=Math.min(t.length,e.length);for(let a=0;a<n;a++){let r=t.charAt(a),s=e.charAt(a);if(r!==s)return f_(r)===f_(s)?xe(r,s):f_(r)?1:-1}return xe(t.length,e.length)}var L2=55296,A2=57343;function f_(t){let e=t.charCodeAt(0);return e>=L2&&e<=A2}function uu(t,e,n){return t.length===e.length&&t.every((a,r)=>n(a,e[r]))}var hx="__name__",np=class t{constructor(e,n,a){n===void 0?n=0:n>e.length&&oe(637,{offset:n,range:e.length}),a===void 0?a=e.length-n:a>e.length-n&&oe(1746,{length:a,range:e.length-n}),this.segments=e,this.offset=n,this.len=a}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let n=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(a=>{n.push(a)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,a=this.limit();n<a;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){let a=Math.min(e.length,n.length);for(let r=0;r<a;r++){let s=t.compareSegments(e.get(r),n.get(r));if(s!==0)return s}return xe(e.length,n.length)}static compareSegments(e,n){let a=t.isNumericId(e),r=t.isNumericId(n);return a&&!r?-1:!a&&r?1:a&&r?t.extractNumericId(e).compare(t.extractNumericId(n)):v_(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Ur.fromString(e.substring(4,e.length-2))}},ct=class t extends np{construct(e,n,a){return new t(e,n,a)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let n=[];for(let a of e){if(a.indexOf("//")>=0)throw new X(q.INVALID_ARGUMENT,`Invalid segment (${a}). Paths must not contain // in them.`);n.push(...a.split("/").filter(r=>r.length>0))}return new t(n)}static emptyPath(){return new t([])}},x2=/^[_a-zA-Z][_a-zA-Z0-9]*$/,ea=class t extends np{construct(e,n,a){return new t(e,n,a)}static isValidIdentifier(e){return x2.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===hx}static keyField(){return new t([hx])}static fromServerFormat(e){let n=[],a="",r=0,s=()=>{if(a.length===0)throw new X(q.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(a),a=""},i=!1;for(;r<e.length;){let u=e[r];if(u==="\\"){if(r+1===e.length)throw new X(q.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new X(q.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);a+=l,r+=2}else u==="`"?(i=!i,r++):u!=="."||i?(a+=u,r++):(s(),r++)}if(s(),i)throw new X(q.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(n)}static emptyPath(){return new t([])}};var te=class t{constructor(e){this.path=e}static fromPath(e){return new t(ct.fromString(e))}static fromName(e){return new t(ct.fromString(e).popFirst(5))}static empty(){return new t(ct.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ct.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return ct.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new ct(e.slice()))}};function R2(t,e,n){if(!n)throw new X(q.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function e0(t,e,n,a){if(e===!0&&a===!0)throw new X(q.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function px(t){if(te.isDocumentKey(t))throw new X(q.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function t0(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function qc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(a){return a.constructor?a.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":oe(12329,{type:typeof t})}function zc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new X(q.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let n=qc(t);throw new X(q.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function n0(t,e){if(e<=0)throw new X(q.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function Dt(t,e){let n={typeString:t};return e&&(n.value=e),n}function Eu(t,e){if(!t0(t))throw new X(q.INVALID_ARGUMENT,"JSON must be an object");let n;for(let a in e)if(e[a]){let r=e[a].typeString,s="value"in e[a]?{value:e[a].value}:void 0;if(!(a in t)){n=`JSON missing required field: '${a}'`;break}let i=t[a];if(r&&typeof i!==r){n=`JSON field '${a}' must be a ${r}.`;break}if(s!==void 0&&i!==s.value){n=`Expected '${a}' field to equal '${s.value}'`;break}}if(n)throw new X(q.INVALID_ARGUMENT,n);return!0}var mx=-62135596800,gx=1e6,zt=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let n=Math.floor(e/1e3),a=Math.floor((e-1e3*n)*gx);return new t(n,a)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new X(q.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new X(q.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<mx)throw new X(q.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new X(q.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/gx}_compareTo(e){return this.seconds===e.seconds?xe(this.nanoseconds,e.nanoseconds):xe(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Eu(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-mx;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};zt._jsonSchemaVersion="firestore/timestamp/1.0",zt._jsonSchema={type:Dt("string",zt._jsonSchemaVersion),seconds:Dt("number"),nanoseconds:Dt("number")};var ge=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new zt(0,0))}static max(){return new t(new zt(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var Tc=-1,ap=class{constructor(e,n,a,r){this.indexId=e,this.collectionGroup=n,this.fields=a,this.indexState=r}};ap.UNKNOWN_ID=-1;function k2(t,e){let n=t.toTimestamp().seconds,a=t.toTimestamp().nanoseconds+1,r=ge.fromTimestamp(a===1e9?new zt(n+1,0):new zt(n,a));return new Fi(r,te.empty(),e)}function D2(t){return new Fi(t.readTime,t.key,Tc)}var Fi=class t{constructor(e,n,a){this.readTime=e,this.documentKey=n,this.largestBatchId=a}static min(){return new t(ge.min(),te.empty(),Tc)}static max(){return new t(ge.max(),te.empty(),Tc)}};function P2(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=te.comparator(t.documentKey,e.documentKey),n!==0?n:xe(t.largestBatchId,e.largestBatchId))}var O2="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",E_=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function Ap(t){if(t.code!==q.FAILED_PRECONDITION||t.message!==O2)throw t;Q("LocalStore","Unexpectedly lost primary lease")}var H=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&oe(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new t((a,r)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(a,r)},this.catchCallback=s=>{this.wrapFailure(n,s).next(a,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{let n=e();return n instanceof t?n:t.resolve(n)}catch(n){return t.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):t.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):t.reject(n)}static resolve(e){return new t((n,a)=>{n(e)})}static reject(e){return new t((n,a)=>{a(e)})}static waitFor(e){return new t((n,a)=>{let r=0,s=0,i=!1;e.forEach(u=>{++r,u.next(()=>{++s,i&&s===r&&n()},l=>a(l))}),i=!0,s===r&&n()})}static or(e){let n=t.resolve(!1);for(let a of e)n=n.next(r=>r?t.resolve(r):a());return n}static forEach(e,n){let a=[];return e.forEach((r,s)=>{a.push(n.call(this,r,s))}),this.waitFor(a)}static mapArray(e,n){return new t((a,r)=>{let s=e.length,i=new Array(s),u=0;for(let l=0;l<s;l++){let c=l;n(e[c]).next(f=>{i[c]=f,++u,u===s&&a(i)},f=>r(f))}})}static doWhile(e,n){return new t((a,r)=>{let s=()=>{e()===!0?n().next(()=>{s()},r):a()};s()})}};function M2(t){let e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Tu(t){return t.name==="IndexedDbTransactionError"}var lu=class{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=a=>this.ae(a),this.ue=a=>n.writeSequenceNumber(a))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};lu.ce=-1;var N2=-1;function xp(t){return t==null}function bc(t){return t===0&&1/t==-1/0}function V2(t){return typeof t=="number"&&Number.isInteger(t)&&!bc(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var a0="";function F2(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=yx(e)),e=U2(t.get(n),e);return yx(e)}function U2(t,e){let n=e,a=t.length;for(let r=0;r<a;r++){let s=t.charAt(r);switch(s){case"\0":n+="";break;case a0:n+="";break;default:n+=s}}return n}function yx(t){return t+a0+""}var B2="remoteDocuments",r0="owner";var s0="mutationQueues";var i0="mutations";var o0="documentMutations",q2="remoteDocumentsV14";var u0="remoteDocumentGlobal";var l0="targets";var c0="targetDocuments";var d0="targetGlobal",f0="collectionParents";var h0="clientMetadata";var p0="bundles";var m0="namedQueries";var z2="indexConfiguration";var H2="indexState";var G2="indexEntries";var g0="documentOverlays";var j2="globals";var K2=[s0,i0,o0,B2,l0,r0,d0,c0,h0,u0,f0,p0,m0],b4=[...K2,g0],W2=[s0,i0,o0,q2,l0,r0,d0,c0,h0,u0,f0,p0,m0,g0],X2=W2,Y2=[...X2,z2,H2,G2];var w4=[...Y2,j2];function Ix(t){let e=0;for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function bu(t,e){for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function y0(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var Pt=class t{constructor(e,n){this.comparator=e,this.root=n||Ja.EMPTY}insert(e,n){return new t(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Ja.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ja.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){let a=this.comparator(e,n.key);if(a===0)return n.value;a<0?n=n.left:a>0&&(n=n.right)}return null}indexOf(e){let n=0,a=this.root;for(;!a.isEmpty();){let r=this.comparator(e,a.key);if(r===0)return n+a.left.size;r<0?a=a.left:(n+=a.left.size+1,a=a.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,a)=>(e(n,a),!1))}toString(){let e=[];return this.inorderTraversal((n,a)=>(e.push(`${n}:${a}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new au(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new au(this.root,e,this.comparator,!1)}getReverseIterator(){return new au(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new au(this.root,e,this.comparator,!0)}},au=class{constructor(e,n,a,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?a(e.key,n):1,n&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},Ja=class t{constructor(e,n,a,r,s){this.key=e,this.value=n,this.color=a??t.RED,this.left=r??t.EMPTY,this.right=s??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,a,r,s){return new t(e??this.key,n??this.value,a??this.color,r??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,a){let r=this,s=a(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,n,a),null):s===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,a)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let a,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;a=r.right.min(),r=r.copy(a.key,a.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw oe(43730,{key:this.key,value:this.value});if(this.right.isRed())throw oe(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw oe(27949);return e+(this.isRed()?0:1)}};Ja.EMPTY=null,Ja.RED=!0,Ja.BLACK=!1;Ja.EMPTY=new class{constructor(){this.size=0}get key(){throw oe(57766)}get value(){throw oe(16141)}get color(){throw oe(16727)}get left(){throw oe(29726)}get right(){throw oe(36894)}copy(e,n,a,r,s){return this}insert(e,n,a){return new Ja(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var ln=class t{constructor(e){this.comparator=e,this.data=new Pt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,a)=>(e(n),!1))}forEachInRange(e,n){let a=this.data.getIteratorFrom(e[0]);for(;a.hasNext();){let r=a.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let a;for(a=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();a.hasNext();)if(!e(a.getNext().key))return}firstAfterOrEqual(e){let n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new rp(this.data.getIterator())}getIteratorFrom(e){return new rp(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(a=>{n=n.add(a)}),n}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.data.getIterator(),a=e.data.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(this.comparator(r,s)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(n=>{e.push(n)}),e}toString(){let e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){let n=new t(this.comparator);return n.data=e,n}},rp=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var Di=class t{constructor(e){this.fields=e,e.sort(ea.comparator)}static empty(){return new t([])}unionWith(e){let n=new ln(ea.comparator);for(let a of this.fields)n=n.add(a);for(let a of e)n=n.add(a);return new t(n.toArray())}covers(e){for(let n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return uu(this.fields,e.fields,(n,a)=>n.isEqual(a))}};var sp=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var gn=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let n=function(r){try{return atob(r)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new sp("Invalid base64 string: "+s):s}}(e);return new t(n)}static fromUint8Array(e){let n=function(r){let s="";for(let i=0;i<r.length;++i)s+=String.fromCharCode(r[i]);return s}(e);return new t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return xe(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};gn.EMPTY_BYTE_STRING=new gn("");var Q2=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function jr(t){if(mt(!!t,39018),typeof t=="string"){let e=0,n=Q2.exec(t);if(mt(!!n,46558,{timestamp:t}),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}let a=new Date(t);return{seconds:Math.floor(a.getTime()/1e3),nanos:e}}return{seconds:lt(t.seconds),nanos:lt(t.nanos)}}function lt(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Kr(t){return typeof t=="string"?gn.fromBase64String(t):gn.fromUint8Array(t)}var I0="server_timestamp",_0="__type__",S0="__previous_value__",v0="__local_write_time__";function Hc(t){return(t?.mapValue?.fields||{})[_0]?.stringValue===I0}function Rp(t){let e=t.mapValue.fields[S0];return Hc(e)?Rp(e):e}function wc(t){let e=jr(t.mapValue.fields[v0].timestampValue);return new zt(e.seconds,e.nanos)}var T_=class{constructor(e,n,a,r,s,i,u,l,c,f,p){this.databaseId=e,this.appId=n,this.persistenceKey=a,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=c,this.isUsingEmulator=f,this.apiKey=p}},ip="(default)",Cc=class t{constructor(e,n){this.projectId=e,this.database=n||ip}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===ip}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function E0(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new X(q.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Cc(t.options.projectId,e)}var BS="__type__",T0="__max__",Kh={mapValue:{fields:{__type__:{stringValue:T0}}}},qS="__vector__",cu="value";function zs(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Hc(t)?4:w0(t)?9007199254740991:b0(t)?10:11:oe(28295,{value:t})}function nr(t,e){if(t===e)return!0;let n=zs(t);if(n!==zs(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return wc(t).isEqual(wc(e));case 3:return function(r,s){if(typeof r.timestampValue=="string"&&typeof s.timestampValue=="string"&&r.timestampValue.length===s.timestampValue.length)return r.timestampValue===s.timestampValue;let i=jr(r.timestampValue),u=jr(s.timestampValue);return i.seconds===u.seconds&&i.nanos===u.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,s){return Kr(r.bytesValue).isEqual(Kr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,s){return lt(r.geoPointValue.latitude)===lt(s.geoPointValue.latitude)&&lt(r.geoPointValue.longitude)===lt(s.geoPointValue.longitude)}(t,e);case 2:return function(r,s){if("integerValue"in r&&"integerValue"in s)return lt(r.integerValue)===lt(s.integerValue);if("doubleValue"in r&&"doubleValue"in s){let i=lt(r.doubleValue),u=lt(s.doubleValue);return i===u?bc(i)===bc(u):isNaN(i)&&isNaN(u)}return!1}(t,e);case 9:return uu(t.arrayValue.values||[],e.arrayValue.values||[],nr);case 10:case 11:return function(r,s){let i=r.mapValue.fields||{},u=s.mapValue.fields||{};if(Ix(i)!==Ix(u))return!1;for(let l in i)if(i.hasOwnProperty(l)&&(u[l]===void 0||!nr(i[l],u[l])))return!1;return!0}(t,e);default:return oe(52216,{left:t})}}function Lc(t,e){return(t.values||[]).find(n=>nr(n,e))!==void 0}function du(t,e){if(t===e)return 0;let n=zs(t),a=zs(e);if(n!==a)return xe(n,a);switch(n){case 0:case 9007199254740991:return 0;case 1:return xe(t.booleanValue,e.booleanValue);case 2:return function(s,i){let u=lt(s.integerValue||s.doubleValue),l=lt(i.integerValue||i.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(t,e);case 3:return _x(t.timestampValue,e.timestampValue);case 4:return _x(wc(t),wc(e));case 5:return v_(t.stringValue,e.stringValue);case 6:return function(s,i){let u=Kr(s),l=Kr(i);return u.compareTo(l)}(t.bytesValue,e.bytesValue);case 7:return function(s,i){let u=s.split("/"),l=i.split("/");for(let c=0;c<u.length&&c<l.length;c++){let f=xe(u[c],l[c]);if(f!==0)return f}return xe(u.length,l.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,i){let u=xe(lt(s.latitude),lt(i.latitude));return u!==0?u:xe(lt(s.longitude),lt(i.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Sx(t.arrayValue,e.arrayValue);case 10:return function(s,i){let u=s.fields||{},l=i.fields||{},c=u[cu]?.arrayValue,f=l[cu]?.arrayValue,p=xe(c?.values?.length||0,f?.values?.length||0);return p!==0?p:Sx(c,f)}(t.mapValue,e.mapValue);case 11:return function(s,i){if(s===Kh.mapValue&&i===Kh.mapValue)return 0;if(s===Kh.mapValue)return 1;if(i===Kh.mapValue)return-1;let u=s.fields||{},l=Object.keys(u),c=i.fields||{},f=Object.keys(c);l.sort(),f.sort();for(let p=0;p<l.length&&p<f.length;++p){let m=v_(l[p],f[p]);if(m!==0)return m;let S=du(u[l[p]],c[f[p]]);if(S!==0)return S}return xe(l.length,f.length)}(t.mapValue,e.mapValue);default:throw oe(23264,{he:n})}}function _x(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return xe(t,e);let n=jr(t),a=jr(e),r=xe(n.seconds,a.seconds);return r!==0?r:xe(n.nanos,a.nanos)}function Sx(t,e){let n=t.values||[],a=e.values||[];for(let r=0;r<n.length&&r<a.length;++r){let s=du(n[r],a[r]);if(s)return s}return xe(n.length,a.length)}function fu(t){return b_(t)}function b_(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){let a=jr(n);return`time(${a.seconds},${a.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Kr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return te.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let a="[",r=!0;for(let s of n.values||[])r?r=!1:a+=",",a+=b_(s);return a+"]"}(t.arrayValue):"mapValue"in t?function(n){let a=Object.keys(n.fields||{}).sort(),r="{",s=!0;for(let i of a)s?s=!1:r+=",",r+=`${i}:${b_(n.fields[i])}`;return r+"}"}(t.mapValue):oe(61005,{value:t})}function Yh(t){switch(zs(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=Rp(t);return e?16+Yh(e):16;case 5:return 2*t.stringValue.length;case 6:return Kr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(a){return(a.values||[]).reduce((r,s)=>r+Yh(s),0)}(t.arrayValue);case 10:case 11:return function(a){let r=0;return bu(a.fields,(s,i)=>{r+=s.length+Yh(i)}),r}(t.mapValue);default:throw oe(13486,{value:t})}}function Gc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function w_(t){return!!t&&"integerValue"in t}function zS(t){return!!t&&"arrayValue"in t}function vx(t){return!!t&&"nullValue"in t}function Ex(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function h_(t){return!!t&&"mapValue"in t}function b0(t){return(t?.mapValue?.fields||{})[BS]?.stringValue===qS}function Sc(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return bu(t.mapValue.fields,(n,a)=>e.mapValue.fields[n]=Sc(a)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Sc(t.arrayValue.values[n]);return e}return{...t}}function w0(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===T0}var L4={mapValue:{fields:{[BS]:{stringValue:qS},[cu]:{arrayValue:{}}}}};var $a=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let a=0;a<e.length-1;++a)if(n=(n.mapValue.fields||{})[e.get(a)],!h_(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Sc(n)}setAll(e){let n=ea.emptyPath(),a={},r=[];e.forEach((i,u)=>{if(!n.isImmediateParentOf(u)){let l=this.getFieldsMap(n);this.applyChanges(l,a,r),a={},r=[],n=u.popLast()}i?a[u.lastSegment()]=Sc(i):r.push(u.lastSegment())});let s=this.getFieldsMap(n);this.applyChanges(s,a,r)}delete(e){let n=this.field(e.popLast());h_(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return nr(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let a=0;a<e.length;++a){let r=n.mapValue.fields[e.get(a)];h_(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(a)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,a){bu(n,(r,s)=>e[r]=s);for(let r of a)delete e[r]}clone(){return new t(Sc(this.value))}};var ba=class t{constructor(e,n,a,r,s,i,u){this.key=e,this.documentType=n,this.version=a,this.readTime=r,this.createTime=s,this.data=i,this.documentState=u}static newInvalidDocument(e){return new t(e,0,ge.min(),ge.min(),ge.min(),$a.empty(),0)}static newFoundDocument(e,n,a,r){return new t(e,1,n,ge.min(),a,r,0)}static newNoDocument(e,n){return new t(e,2,n,ge.min(),ge.min(),$a.empty(),0)}static newUnknownDocument(e,n){return new t(e,3,n,ge.min(),ge.min(),$a.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(ge.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=$a.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=$a.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=ge.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var Wr=class{constructor(e,n){this.position=e,this.inclusive=n}};function Tx(t,e,n){let a=0;for(let r=0;r<t.position.length;r++){let s=e[r],i=t.position[r];if(s.field.isKeyField()?a=te.comparator(te.fromName(i.referenceValue),n.key):a=du(i,n.data.field(s.field)),s.dir==="desc"&&(a*=-1),a!==0)break}return a}function bx(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!nr(t.position[n],e.position[n]))return!1;return!0}var Hs=class{constructor(e,n="asc"){this.field=e,this.dir=n}};function $2(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var op=class{},kt=class t extends op{constructor(e,n,a){super(),this.field=e,this.op=n,this.value=a}static create(e,n,a){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,a):new L_(e,n,a):n==="array-contains"?new R_(e,a):n==="in"?new k_(e,a):n==="not-in"?new D_(e,a):n==="array-contains-any"?new P_(e,a):new t(e,n,a)}static createKeyFieldInFilter(e,n,a){return n==="in"?new A_(e,a):new x_(e,a)}matches(e){let n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(du(n,this.value)):n!==null&&zs(this.value)===zs(n)&&this.matchesComparison(du(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return oe(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},ma=class t extends op{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new t(e,n)}matches(e){return C0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function C0(t){return t.op==="and"}function L0(t){return J2(t)&&C0(t)}function J2(t){for(let e of t.filters)if(e instanceof ma)return!1;return!0}function C_(t){if(t instanceof kt)return t.field.canonicalString()+t.op.toString()+fu(t.value);if(L0(t))return t.filters.map(e=>C_(e)).join(",");{let e=t.filters.map(n=>C_(n)).join(",");return`${t.op}(${e})`}}function A0(t,e){return t instanceof kt?function(a,r){return r instanceof kt&&a.op===r.op&&a.field.isEqual(r.field)&&nr(a.value,r.value)}(t,e):t instanceof ma?function(a,r){return r instanceof ma&&a.op===r.op&&a.filters.length===r.filters.length?a.filters.reduce((s,i,u)=>s&&A0(i,r.filters[u]),!0):!1}(t,e):void oe(19439)}function x0(t){return t instanceof kt?function(n){return`${n.field.canonicalString()} ${n.op} ${fu(n.value)}`}(t):t instanceof ma?function(n){return n.op.toString()+" {"+n.getFilters().map(x0).join(" ,")+"}"}(t):"Filter"}var L_=class extends kt{constructor(e,n,a){super(e,n,a),this.key=te.fromName(a.referenceValue)}matches(e){let n=te.comparator(e.key,this.key);return this.matchesComparison(n)}},A_=class extends kt{constructor(e,n){super(e,"in",n),this.keys=R0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}},x_=class extends kt{constructor(e,n){super(e,"not-in",n),this.keys=R0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}};function R0(t,e){return(e.arrayValue?.values||[]).map(n=>te.fromName(n.referenceValue))}var R_=class extends kt{constructor(e,n){super(e,"array-contains",n)}matches(e){let n=e.data.field(this.field);return zS(n)&&Lc(n.arrayValue,this.value)}},k_=class extends kt{constructor(e,n){super(e,"in",n)}matches(e){let n=e.data.field(this.field);return n!==null&&Lc(this.value.arrayValue,n)}},D_=class extends kt{constructor(e,n){super(e,"not-in",n)}matches(e){if(Lc(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Lc(this.value.arrayValue,n)}},P_=class extends kt{constructor(e,n){super(e,"array-contains-any",n)}matches(e){let n=e.data.field(this.field);return!(!zS(n)||!n.arrayValue.values)&&n.arrayValue.values.some(a=>Lc(this.value.arrayValue,a))}};var O_=class{constructor(e,n=null,a=[],r=[],s=null,i=null,u=null){this.path=e,this.collectionGroup=n,this.orderBy=a,this.filters=r,this.limit=s,this.startAt=i,this.endAt=u,this.Te=null}};function wx(t,e=null,n=[],a=[],r=null,s=null,i=null){return new O_(t,e,n,a,r,s,i)}function HS(t){let e=De(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(a=>C_(a)).join(","),n+="|ob:",n+=e.orderBy.map(a=>function(s){return s.field.canonicalString()+s.dir}(a)).join(","),xp(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(a=>fu(a)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(a=>fu(a)).join(",")),e.Te=n}return e.Te}function GS(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!$2(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!A0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!bx(t.startAt,e.startAt)&&bx(t.endAt,e.endAt)}function M_(t){return te.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var Xr=class{constructor(e,n=null,a=[],r=[],s=null,i="F",u=null,l=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=a,this.filters=r,this.limit=s,this.limitType=i,this.startAt=u,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function Z2(t,e,n,a,r,s,i,u){return new Xr(t,e,n,a,r,s,i,u)}function jS(t){return new Xr(t)}function Cx(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function eV(t){return te.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function kp(t){return t.collectionGroup!==null}function Mi(t){let e=De(t);if(e.Ie===null){e.Ie=[];let n=new Set;for(let s of e.explicitOrderBy)e.Ie.push(s),n.add(s.field.canonicalString());let a=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(i){let u=new ln(ea.comparator);return i.filters.forEach(l=>{l.getFlattenedFilters().forEach(c=>{c.isInequality()&&(u=u.add(c.field))})}),u})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new Hs(s,a))}),n.has(ea.keyField().canonicalString())||e.Ie.push(new Hs(ea.keyField(),a))}return e.Ie}function Za(t){let e=De(t);return e.Ee||(e.Ee=tV(e,Mi(t))),e.Ee}function tV(t,e){if(t.limitType==="F")return wx(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let s=r.dir==="desc"?"asc":"desc";return new Hs(r.field,s)});let n=t.endAt?new Wr(t.endAt.position,t.endAt.inclusive):null,a=t.startAt?new Wr(t.startAt.position,t.startAt.inclusive):null;return wx(t.path,t.collectionGroup,e,t.filters,t.limit,n,a)}}function Dp(t,e){let n=t.filters.concat([e]);return new Xr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function k0(t,e){let n=t.explicitOrderBy.concat([e]);return new Xr(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function Ac(t,e,n){return new Xr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function D0(t,e){return new Xr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function Pp(t,e){return GS(Za(t),Za(e))&&t.limitType===e.limitType}function P0(t){return`${HS(Za(t))}|lt:${t.limitType}`}function eu(t){return`Query(target=${function(n){let a=n.path.canonicalString();return n.collectionGroup!==null&&(a+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(a+=`, filters: [${n.filters.map(r=>x0(r)).join(", ")}]`),xp(n.limit)||(a+=", limit: "+n.limit),n.orderBy.length>0&&(a+=`, orderBy: [${n.orderBy.map(r=>function(i){return`${i.field.canonicalString()} (${i.dir})`}(r)).join(", ")}]`),n.startAt&&(a+=", startAt: ",a+=n.startAt.inclusive?"b:":"a:",a+=n.startAt.position.map(r=>fu(r)).join(",")),n.endAt&&(a+=", endAt: ",a+=n.endAt.inclusive?"a:":"b:",a+=n.endAt.position.map(r=>fu(r)).join(",")),`Target(${a})`}(Za(t))}; limitType=${t.limitType})`}function Op(t,e){return e.isFoundDocument()&&function(a,r){let s=r.key.path;return a.collectionGroup!==null?r.key.hasCollectionId(a.collectionGroup)&&a.path.isPrefixOf(s):te.isDocumentKey(a.path)?a.path.isEqual(s):a.path.isImmediateParentOf(s)}(t,e)&&function(a,r){for(let s of Mi(a))if(!s.field.isKeyField()&&r.data.field(s.field)===null)return!1;return!0}(t,e)&&function(a,r){for(let s of a.filters)if(!s.matches(r))return!1;return!0}(t,e)&&function(a,r){return!(a.startAt&&!function(i,u,l){let c=Tx(i,u,l);return i.inclusive?c<=0:c<0}(a.startAt,Mi(a),r)||a.endAt&&!function(i,u,l){let c=Tx(i,u,l);return i.inclusive?c>=0:c>0}(a.endAt,Mi(a),r))}(t,e)}function nV(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function O0(t){return(e,n)=>{let a=!1;for(let r of Mi(t)){let s=aV(r,e,n);if(s!==0)return s;a=a||r.field.isKeyField()}return 0}}function aV(t,e,n){let a=t.field.isKeyField()?te.comparator(e.key,n.key):function(s,i,u){let l=i.data.field(s),c=u.data.field(s);return l!==null&&c!==null?du(l,c):oe(42886)}(t.field,e,n);switch(t.dir){case"asc":return a;case"desc":return-1*a;default:return oe(19790,{direction:t.dir})}}var Yr=class{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a!==void 0){for(let[r,s]of a)if(this.equalsFn(r,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){let a=this.mapKeyFn(e),r=this.inner[a];if(r===void 0)return this.inner[a]=[[e,n]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a===void 0)return!1;for(let r=0;r<a.length;r++)if(this.equalsFn(a[r][0],e))return a.length===1?delete this.inner[n]:a.splice(r,1),this.innerSize--,!0;return!1}forEach(e){bu(this.inner,(n,a)=>{for(let[r,s]of a)e(r,s)})}isEmpty(){return y0(this.inner)}size(){return this.innerSize}};var rV=new Pt(te.comparator);function Gs(){return rV}var M0=new Pt(te.comparator);function _c(...t){let e=M0;for(let n of t)e=e.insert(n.key,n);return e}function sV(t){let e=M0;return t.forEach((n,a)=>e=e.insert(n,a.overlayedDocument)),e}function Pi(){return vc()}function N0(){return vc()}function vc(){return new Yr(t=>t.toString(),(t,e)=>t.isEqual(e))}var A4=new Pt(te.comparator),iV=new ln(te.comparator);function ke(...t){let e=iV;for(let n of t)e=e.add(n);return e}var oV=new ln(xe);function uV(){return oV}function KS(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:bc(e)?"-0":e}}function V0(t){return{integerValue:""+t}}function lV(t,e){return V2(e)?V0(e):KS(t,e)}var hu=class{constructor(){this._=void 0}};function cV(t,e,n){return t instanceof xc?function(r,s){let i={fields:{[_0]:{stringValue:I0},[v0]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return s&&Hc(s)&&(s=Rp(s)),s&&(i.fields[S0]=s),{mapValue:i}}(n,e):t instanceof pu?F0(t,e):t instanceof mu?U0(t,e):function(r,s){let i=fV(r,s),u=Lx(i)+Lx(r.Ae);return w_(i)&&w_(r.Ae)?V0(u):KS(r.serializer,u)}(t,e)}function dV(t,e,n){return t instanceof pu?F0(t,e):t instanceof mu?U0(t,e):n}function fV(t,e){return t instanceof Rc?function(a){return w_(a)||function(s){return!!s&&"doubleValue"in s}(a)}(e)?e:{integerValue:0}:null}var xc=class extends hu{},pu=class extends hu{constructor(e){super(),this.elements=e}};function F0(t,e){let n=B0(e);for(let a of t.elements)n.some(r=>nr(r,a))||n.push(a);return{arrayValue:{values:n}}}var mu=class extends hu{constructor(e){super(),this.elements=e}};function U0(t,e){let n=B0(e);for(let a of t.elements)n=n.filter(r=>!nr(r,a));return{arrayValue:{values:n}}}var Rc=class extends hu{constructor(e,n){super(),this.serializer=e,this.Ae=n}};function Lx(t){return lt(t.integerValue||t.doubleValue)}function B0(t){return zS(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function hV(t,e){return t.field.isEqual(e.field)&&function(a,r){return a instanceof pu&&r instanceof pu||a instanceof mu&&r instanceof mu?uu(a.elements,r.elements,nr):a instanceof Rc&&r instanceof Rc?nr(a.Ae,r.Ae):a instanceof xc&&r instanceof xc}(t.transform,e.transform)}var ru=class t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function Qh(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var kc=class{};function q0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new up(t.key,ru.none()):new Dc(t.key,t.data,ru.none());{let n=t.data,a=$a.empty(),r=new ln(ea.comparator);for(let s of e.fields)if(!r.has(s)){let i=n.field(s);i===null&&s.length>1&&(s=s.popLast(),i=n.field(s)),i===null?a.delete(s):a.set(s,i),r=r.add(s)}return new gu(t.key,a,new Di(r.toArray()),ru.none())}}function pV(t,e,n){t instanceof Dc?function(r,s,i){let u=r.value.clone(),l=xx(r.fieldTransforms,s,i.transformResults);u.setAll(l),s.convertToFoundDocument(i.version,u).setHasCommittedMutations()}(t,e,n):t instanceof gu?function(r,s,i){if(!Qh(r.precondition,s))return void s.convertToUnknownDocument(i.version);let u=xx(r.fieldTransforms,s,i.transformResults),l=s.data;l.setAll(z0(r)),l.setAll(u),s.convertToFoundDocument(i.version,l).setHasCommittedMutations()}(t,e,n):function(r,s,i){s.convertToNoDocument(i.version).setHasCommittedMutations()}(0,e,n)}function Ec(t,e,n,a){return t instanceof Dc?function(s,i,u,l){if(!Qh(s.precondition,i))return u;let c=s.value.clone(),f=Rx(s.fieldTransforms,l,i);return c.setAll(f),i.convertToFoundDocument(i.version,c).setHasLocalMutations(),null}(t,e,n,a):t instanceof gu?function(s,i,u,l){if(!Qh(s.precondition,i))return u;let c=Rx(s.fieldTransforms,l,i),f=i.data;return f.setAll(z0(s)),f.setAll(c),i.convertToFoundDocument(i.version,f).setHasLocalMutations(),u===null?null:u.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,a):function(s,i,u){return Qh(s.precondition,i)?(i.convertToNoDocument(i.version).setHasLocalMutations(),null):u}(t,e,n)}function Ax(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(a,r){return a===void 0&&r===void 0||!(!a||!r)&&uu(a,r,(s,i)=>hV(s,i))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var Dc=class extends kc{constructor(e,n,a,r=[]){super(),this.key=e,this.value=n,this.precondition=a,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},gu=class extends kc{constructor(e,n,a,r,s=[]){super(),this.key=e,this.data=n,this.fieldMask=a,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}};function z0(t){let e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){let a=t.data.field(n);e.set(n,a)}}),e}function xx(t,e,n){let a=new Map;mt(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let r=0;r<n.length;r++){let s=t[r],i=s.transform,u=e.data.field(s.field);a.set(s.field,dV(i,u,n[r]))}return a}function Rx(t,e,n){let a=new Map;for(let r of t){let s=r.transform,i=n.data.field(r.field);a.set(r.field,cV(s,i,e))}return a}var up=class extends kc{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var N_=class{constructor(e,n,a,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=a,this.mutations=r}applyToRemoteDocument(e,n){let a=n.mutationResults;for(let r=0;r<this.mutations.length;r++){let s=this.mutations[r];s.key.isEqual(e.key)&&pV(s,e,a[r])}}applyToLocalView(e,n){for(let a of this.baseMutations)a.key.isEqual(e.key)&&(n=Ec(a,e,n,this.localWriteTime));for(let a of this.mutations)a.key.isEqual(e.key)&&(n=Ec(a,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){let a=N0();return this.mutations.forEach(r=>{let s=e.get(r.key),i=s.overlayedDocument,u=this.applyToLocalView(i,s.mutatedFields);u=n.has(r.key)?null:u;let l=q0(i,u);l!==null&&a.set(r.key,l),i.isValidDocument()||i.convertToNoDocument(ge.min())}),a}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),ke())}isEqual(e){return this.batchId===e.batchId&&uu(this.mutations,e.mutations,(n,a)=>Ax(n,a))&&uu(this.baseMutations,e.baseMutations,(n,a)=>Ax(n,a))}};var V_=class{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var F_=class{constructor(e,n){this.count=e,this.unchangedNames=n}};var Bt,Re;function H0(t){if(t===void 0)return Hr("GRPC error has no .code"),q.UNKNOWN;switch(t){case Bt.OK:return q.OK;case Bt.CANCELLED:return q.CANCELLED;case Bt.UNKNOWN:return q.UNKNOWN;case Bt.DEADLINE_EXCEEDED:return q.DEADLINE_EXCEEDED;case Bt.RESOURCE_EXHAUSTED:return q.RESOURCE_EXHAUSTED;case Bt.INTERNAL:return q.INTERNAL;case Bt.UNAVAILABLE:return q.UNAVAILABLE;case Bt.UNAUTHENTICATED:return q.UNAUTHENTICATED;case Bt.INVALID_ARGUMENT:return q.INVALID_ARGUMENT;case Bt.NOT_FOUND:return q.NOT_FOUND;case Bt.ALREADY_EXISTS:return q.ALREADY_EXISTS;case Bt.PERMISSION_DENIED:return q.PERMISSION_DENIED;case Bt.FAILED_PRECONDITION:return q.FAILED_PRECONDITION;case Bt.ABORTED:return q.ABORTED;case Bt.OUT_OF_RANGE:return q.OUT_OF_RANGE;case Bt.UNIMPLEMENTED:return q.UNIMPLEMENTED;case Bt.DATA_LOSS:return q.DATA_LOSS;default:return oe(39323,{code:t})}}(Re=Bt||(Bt={}))[Re.OK=0]="OK",Re[Re.CANCELLED=1]="CANCELLED",Re[Re.UNKNOWN=2]="UNKNOWN",Re[Re.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Re[Re.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Re[Re.NOT_FOUND=5]="NOT_FOUND",Re[Re.ALREADY_EXISTS=6]="ALREADY_EXISTS",Re[Re.PERMISSION_DENIED=7]="PERMISSION_DENIED",Re[Re.UNAUTHENTICATED=16]="UNAUTHENTICATED",Re[Re.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Re[Re.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Re[Re.ABORTED=10]="ABORTED",Re[Re.OUT_OF_RANGE=11]="OUT_OF_RANGE",Re[Re.UNIMPLEMENTED=12]="UNIMPLEMENTED",Re[Re.INTERNAL=13]="INTERNAL",Re[Re.UNAVAILABLE=14]="UNAVAILABLE",Re[Re.DATA_LOSS=15]="DATA_LOSS";var mV=null;function gV(){return new TextEncoder}var yV=new Ur([4294967295,4294967295],0);function kx(t){let e=gV().encode(t),n=new i_;return n.update(e),new Uint8Array(n.digest())}function Dx(t){let e=new DataView(t.buffer),n=e.getUint32(0,!0),a=e.getUint32(4,!0),r=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Ur([n,a],0),new Ur([r,s],0)]}var U_=class t{constructor(e,n,a){if(this.bitmap=e,this.padding=n,this.hashCount=a,n<0||n>=8)throw new Oi(`Invalid padding: ${n}`);if(a<0)throw new Oi(`Invalid hash count: ${a}`);if(e.length>0&&this.hashCount===0)throw new Oi(`Invalid hash count: ${a}`);if(e.length===0&&n!==0)throw new Oi(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=Ur.fromNumber(this.ge)}ye(e,n,a){let r=e.add(n.multiply(Ur.fromNumber(a)));return r.compare(yV)===1&&(r=new Ur([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let n=kx(e),[a,r]=Dx(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);if(!this.we(i))return!1}return!0}static create(e,n,a){let r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new t(s,r,n);return a.forEach(u=>i.insert(u)),i}insert(e){if(this.ge===0)return;let n=kx(e),[a,r]=Dx(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);this.be(i)}}be(e){let n=Math.floor(e/8),a=e%8;this.bitmap[n]|=1<<a}},Oi=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var lp=class t{constructor(e,n,a,r,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=a,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,a){let r=new Map;return r.set(e,Pc.createSynthesizedTargetChangeForCurrentChange(e,n,a)),new t(ge.min(),r,new Pt(xe),Gs(),ke())}},Pc=class t{constructor(e,n,a,r,s){this.resumeToken=e,this.current=n,this.addedDocuments=a,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,a){return new t(a,n,ke(),ke(),ke())}};var su=class{constructor(e,n,a,r){this.Se=e,this.removedTargetIds=n,this.key=a,this.De=r}},cp=class{constructor(e,n){this.targetId=e,this.Ce=n}},dp=class{constructor(e,n,a=gn.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=a,this.cause=r}},fp=class{constructor(){this.ve=0,this.Fe=Px(),this.Me=gn.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=ke(),n=ke(),a=ke();return this.Fe.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:a=a.add(r);break;default:oe(38017,{changeType:s})}}),new Pc(this.Me,this.xe,e,n,a)}Ke(){this.Oe=!1,this.Fe=Px()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,mt(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},B_=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=Gs(),this.He=Wh(),this.Je=Wh(),this.Ze=new Pt(xe)}Xe(e){for(let n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(let n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{let a=this.nt(n);switch(e.state){case 0:this.rt(n)&&a.Le(e.resumeToken);break;case 1:a.We(),a.Ne||a.Ke(),a.Le(e.resumeToken);break;case 2:a.We(),a.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(a.Qe(),a.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),a.Le(e.resumeToken));break;default:oe(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((a,r)=>{this.rt(r)&&n(r)})}st(e){let n=e.targetId,a=e.Ce.count,r=this.ot(n);if(r){let s=r.target;if(M_(s))if(a===0){let i=new te(s.path);this.et(n,i,ba.newNoDocument(i,ge.min()))}else mt(a===1,20013,{expectedCount:a});else{let i=this._t(n);if(i!==a){let u=this.ut(e),l=u?this.ct(u,e,i):1;if(l!==0){this.it(n);let c=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,c)}mV?.lt(function(f,p,m,S,R){let D={localCacheCount:f,existenceFilterCount:p.count,databaseId:m.database,projectId:m.projectId},L=p.unchangedNames;return L&&(D.bloomFilter={applied:R===0,hashCount:L?.hashCount??0,bitmapLength:L?.bits?.bitmap?.length??0,padding:L?.bits?.padding??0,mightContain:E=>S?.mightContain(E)??!1}),D}(i,e.Ce,this.Ge.ht(),u,l))}}}}ut(e){let n=e.Ce.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:a="",padding:r=0},hashCount:s=0}=n,i,u;try{i=Kr(a).toUint8Array()}catch(l){if(l instanceof sp)return Gr("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new U_(i,r,s)}catch(l){return Gr(l instanceof Oi?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.ge===0?null:u}ct(e,n,a){return n.Ce.count===a-this.Pt(e,n.targetId)?0:2}Pt(e,n){let a=this.Ge.getRemoteKeysForTarget(n),r=0;return a.forEach(s=>{let i=this.Ge.ht(),u=`projects/${i.projectId}/databases/${i.database}/documents/${s.path.canonicalString()}`;e.mightContain(u)||(this.et(n,s,null),r++)}),r}Tt(e){let n=new Map;this.ze.forEach((s,i)=>{let u=this.ot(i);if(u){if(s.current&&M_(u.target)){let l=new te(u.target.path);this.It(l).has(i)||this.Et(i,l)||this.et(i,l,ba.newNoDocument(l,e))}s.Be&&(n.set(i,s.ke()),s.Ke())}});let a=ke();this.Je.forEach((s,i)=>{let u=!0;i.forEachWhile(l=>{let c=this.ot(l);return!c||c.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(a=a.add(s))}),this.je.forEach((s,i)=>i.setReadTime(e));let r=new lp(e,n,this.Ze,this.je,a);return this.je=Gs(),this.He=Wh(),this.Je=Wh(),this.Ze=new Pt(xe),r}Ye(e,n){if(!this.rt(e))return;let a=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,a),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,a){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,n)?r.qe(n,1):r.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),a&&(this.je=this.je.insert(n,a))}removeTarget(e){this.ze.delete(e)}_t(e){let n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new fp,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new ln(xe),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new ln(xe),this.He=this.He.insert(e,n)),n}rt(e){let n=this.ot(e)!==null;return n||Q("WatchChangeAggregator","Detected inactive target",e),n}ot(e){let n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new fp),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}};function Wh(){return new Pt(te.comparator)}function Px(){return new Pt(te.comparator)}var IV={asc:"ASCENDING",desc:"DESCENDING"},_V={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},SV={and:"AND",or:"OR"},q_=class{constructor(e,n){this.databaseId=e,this.useProto3Json=n}};function z_(t,e){return t.useProto3Json||xp(e)?e:{value:e}}function H_(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function G0(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function iu(t){return mt(!!t,49232),ge.fromTimestamp(function(n){let a=jr(n);return new zt(a.seconds,a.nanos)}(t))}function j0(t,e){return G_(t,e).canonicalString()}function G_(t,e){let n=function(r){return new ct(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?n:n.child(e)}function K0(t){let e=ct.fromString(t);return mt($0(e),10190,{key:e.toString()}),e}function p_(t,e){let n=K0(e);if(n.get(1)!==t.databaseId.projectId)throw new X(q.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new X(q.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new te(X0(n))}function W0(t,e){return j0(t.databaseId,e)}function vV(t){let e=K0(t);return e.length===4?ct.emptyPath():X0(e)}function Ox(t){return new ct(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function X0(t){return mt(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function EV(t,e){let n;if("targetChange"in e){e.targetChange;let a=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:oe(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],s=function(c,f){return c.useProto3Json?(mt(f===void 0||typeof f=="string",58123),gn.fromBase64String(f||"")):(mt(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),gn.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),i=e.targetChange.cause,u=i&&function(c){let f=c.code===void 0?q.UNKNOWN:H0(c.code);return new X(f,c.message||"")}(i);n=new dp(a,r,s,u||null)}else if("documentChange"in e){e.documentChange;let a=e.documentChange;a.document,a.document.name,a.document.updateTime;let r=p_(t,a.document.name),s=iu(a.document.updateTime),i=a.document.createTime?iu(a.document.createTime):ge.min(),u=new $a({mapValue:{fields:a.document.fields}}),l=ba.newFoundDocument(r,s,i,u),c=a.targetIds||[],f=a.removedTargetIds||[];n=new su(c,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;let a=e.documentDelete;a.document;let r=p_(t,a.document),s=a.readTime?iu(a.readTime):ge.min(),i=ba.newNoDocument(r,s),u=a.removedTargetIds||[];n=new su([],u,i.key,i)}else if("documentRemove"in e){e.documentRemove;let a=e.documentRemove;a.document;let r=p_(t,a.document),s=a.removedTargetIds||[];n=new su([],s,r,null)}else{if(!("filter"in e))return oe(11601,{Vt:e});{e.filter;let a=e.filter;a.targetId;let{count:r=0,unchangedNames:s}=a,i=new F_(r,s),u=a.targetId;n=new cp(u,i)}}return n}function TV(t,e){return{documents:[W0(t,e.path)]}}function bV(t,e){let n={structuredQuery:{}},a=e.path,r;e.collectionGroup!==null?(r=a,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=a.popLast(),n.structuredQuery.from=[{collectionId:a.lastSegment()}]),n.parent=W0(t,r);let s=function(c){if(c.length!==0)return Q0(ma.create(c,"and"))}(e.filters);s&&(n.structuredQuery.where=s);let i=function(c){if(c.length!==0)return c.map(f=>function(m){return{field:tu(m.field),direction:LV(m.dir)}}(f))}(e.orderBy);i&&(n.structuredQuery.orderBy=i);let u=z_(t,e.limit);return u!==null&&(n.structuredQuery.limit=u),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{ft:n,parent:r}}function wV(t){let e=vV(t.parent),n=t.structuredQuery,a=n.from?n.from.length:0,r=null;if(a>0){mt(a===1,65062);let f=n.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(p){let m=Y0(p);return m instanceof ma&&L0(m)?m.getFilters():[m]}(n.where));let i=[];n.orderBy&&(i=function(p){return p.map(m=>function(R){return new Hs(nu(R.field),function(L){switch(L){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(m))}(n.orderBy));let u=null;n.limit&&(u=function(p){let m;return m=typeof p=="object"?p.value:p,xp(m)?null:m}(n.limit));let l=null;n.startAt&&(l=function(p){let m=!!p.before,S=p.values||[];return new Wr(S,m)}(n.startAt));let c=null;return n.endAt&&(c=function(p){let m=!p.before,S=p.values||[];return new Wr(S,m)}(n.endAt)),Z2(e,r,i,s,u,"F",l,c)}function CV(t,e){let n=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return oe(28987,{purpose:r})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function Y0(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":let a=nu(n.unaryFilter.field);return kt.create(a,"==",{doubleValue:NaN});case"IS_NULL":let r=nu(n.unaryFilter.field);return kt.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let s=nu(n.unaryFilter.field);return kt.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let i=nu(n.unaryFilter.field);return kt.create(i,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return oe(61313);default:return oe(60726)}}(t):t.fieldFilter!==void 0?function(n){return kt.create(nu(n.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return oe(58110);default:return oe(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return ma.create(n.compositeFilter.filters.map(a=>Y0(a)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return oe(1026)}}(n.compositeFilter.op))}(t):oe(30097,{filter:t})}function LV(t){return IV[t]}function AV(t){return _V[t]}function xV(t){return SV[t]}function tu(t){return{fieldPath:t.canonicalString()}}function nu(t){return ea.fromServerFormat(t.fieldPath)}function Q0(t){return t instanceof kt?function(n){if(n.op==="=="){if(Ex(n.value))return{unaryFilter:{field:tu(n.field),op:"IS_NAN"}};if(vx(n.value))return{unaryFilter:{field:tu(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(Ex(n.value))return{unaryFilter:{field:tu(n.field),op:"IS_NOT_NAN"}};if(vx(n.value))return{unaryFilter:{field:tu(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:tu(n.field),op:AV(n.op),value:n.value}}}(t):t instanceof ma?function(n){let a=n.getFilters().map(r=>Q0(r));return a.length===1?a[0]:{compositeFilter:{op:xV(n.op),filters:a}}}(t):oe(54877,{filter:t})}function $0(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function J0(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var Oc=class t{constructor(e,n,a,r,s=ge.min(),i=ge.min(),u=gn.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=n,this.purpose=a,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var j_=class{constructor(e){this.yt=e}};function Z0(t){let e=wV({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Ac(e,e.limit,"L"):e}var hp=class{constructor(){}Dt(e,n){this.Ct(e,n),n.vt()}Ct(e,n){if("nullValue"in e)this.Ft(n,5);else if("booleanValue"in e)this.Ft(n,10),n.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(n,15),n.Mt(lt(e.integerValue));else if("doubleValue"in e){let a=lt(e.doubleValue);isNaN(a)?this.Ft(n,13):(this.Ft(n,15),bc(a)?n.Mt(0):n.Mt(a))}else if("timestampValue"in e){let a=e.timestampValue;this.Ft(n,20),typeof a=="string"&&(a=jr(a)),n.xt(`${a.seconds||""}`),n.Mt(a.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,n),this.Nt(n);else if("bytesValue"in e)this.Ft(n,30),n.Bt(Kr(e.bytesValue)),this.Nt(n);else if("referenceValue"in e)this.Lt(e.referenceValue,n);else if("geoPointValue"in e){let a=e.geoPointValue;this.Ft(n,45),n.Mt(a.latitude||0),n.Mt(a.longitude||0)}else"mapValue"in e?w0(e)?this.Ft(n,Number.MAX_SAFE_INTEGER):b0(e)?this.kt(e.mapValue,n):(this.Kt(e.mapValue,n),this.Nt(n)):"arrayValue"in e?(this.qt(e.arrayValue,n),this.Nt(n)):oe(19022,{Ut:e})}Ot(e,n){this.Ft(n,25),this.$t(e,n)}$t(e,n){n.xt(e)}Kt(e,n){let a=e.fields||{};this.Ft(n,55);for(let r of Object.keys(a))this.Ot(r,n),this.Ct(a[r],n)}kt(e,n){let a=e.fields||{};this.Ft(n,53);let r=cu,s=a[r].arrayValue?.values?.length||0;this.Ft(n,15),n.Mt(lt(s)),this.Ot(r,n),this.Ct(a[r],n)}qt(e,n){let a=e.values||[];this.Ft(n,50);for(let r of a)this.Ct(r,n)}Lt(e,n){this.Ft(n,37),te.fromName(e).path.forEach(a=>{this.Ft(n,60),this.$t(a,n)})}Ft(e,n){e.Mt(n)}Nt(e){e.Mt(2)}};hp.Wt=new hp;var K_=class{constructor(){this.Sn=new W_}addToCollectionParentIndex(e,n){return this.Sn.add(n),H.resolve()}getCollectionParents(e,n){return H.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return H.resolve()}deleteFieldIndex(e,n){return H.resolve()}deleteAllFieldIndexes(e){return H.resolve()}createTargetIndexes(e,n){return H.resolve()}getDocumentsMatchingTarget(e,n){return H.resolve(null)}getIndexType(e,n){return H.resolve(0)}getFieldIndexes(e,n){return H.resolve([])}getNextCollectionGroupToUpdate(e){return H.resolve(null)}getMinOffset(e,n){return H.resolve(Fi.min())}getMinOffsetFromCollectionGroup(e,n){return H.resolve(Fi.min())}updateCollectionGroup(e,n,a){return H.resolve()}updateIndexEntries(e,n){return H.resolve()}},W_=class{constructor(){this.index={}}add(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n]||new ln(ct.comparator),s=!r.has(a);return this.index[n]=r.add(a),s}has(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n];return r&&r.has(a)}getEntries(e){return(this.index[e]||new ln(ct.comparator)).toArray()}};var x4=new Uint8Array(0);var Mx={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},eR=41943040,pa=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,a){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=a}};pa.DEFAULT_COLLECTION_PERCENTILE=10,pa.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,pa.DEFAULT=new pa(eR,pa.DEFAULT_COLLECTION_PERCENTILE,pa.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),pa.DISABLED=new pa(-1,0,0);var Mc=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var Nx="LruGarbageCollector",RV=1048576;function Vx([t,e],[n,a]){let r=xe(t,n);return r===0?xe(e,a):r}var X_=class{constructor(e){this.Pr=e,this.buffer=new ln(Vx),this.Tr=0}Ir(){return++this.Tr}Er(e){let n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{let a=this.buffer.last();Vx(n,a)<0&&(this.buffer=this.buffer.delete(a).add(n))}}get maxValue(){return this.buffer.last()[0]}},Y_=class{constructor(e,n,a){this.garbageCollector=e,this.asyncQueue=n,this.localStore=a,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){Q(Nx,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){Tu(n)?Q(Nx,"Ignoring IndexedDB error during garbage collection: ",n):await Ap(n)}await this.Ar(3e5)})}},Q_=class{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(a=>Math.floor(n/100*a))}nthSequenceNumber(e,n){if(n===0)return H.resolve(lu.ce);let a=new X_(n);return this.Vr.forEachTarget(e,r=>a.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>a.Er(r))).next(()=>a.maxValue)}removeTargets(e,n,a){return this.Vr.removeTargets(e,n,a)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(Q("LruGarbageCollector","Garbage collection skipped; disabled"),H.resolve(Mx)):this.getCacheSize(e).next(a=>a<this.params.cacheSizeCollectionThreshold?(Q("LruGarbageCollector",`Garbage collection skipped; Cache size ${a} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Mx):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let a,r,s,i,u,l,c,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(Q("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),r=this.params.maximumSequenceNumbersToCollect):r=p,i=Date.now(),this.nthSequenceNumber(e,r))).next(p=>(a=p,u=Date.now(),this.removeTargets(e,a,n))).next(p=>(s=p,l=Date.now(),this.removeOrphanedDocuments(e,a))).next(p=>(c=Date.now(),Zo()<=_e.DEBUG&&Q("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-f}ms
	Determined least recently used ${r} in `+(u-i)+`ms
	Removed ${s} targets in `+(l-u)+`ms
	Removed ${p} documents in `+(c-l)+`ms
Total Duration: ${c-f}ms`),H.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:p})))}};function kV(t,e){return new Q_(t,e)}var $_=class{constructor(){this.changes=new Yr(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,ba.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();let a=this.changes.get(n);return a!==void 0?H.resolve(a):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var J_=class{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}};var Z_=class{constructor(e,n,a,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=a,this.indexManager=r}getDocument(e,n){let a=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(a=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(a!==null&&Ec(a.mutation,r,Di.empty(),zt.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.getLocalViewOfDocuments(e,a,ke()).next(()=>a))}getLocalViewOfDocuments(e,n,a=ke()){let r=Pi();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,a).next(s=>{let i=_c();return s.forEach((u,l)=>{i=i.insert(u,l.overlayedDocument)}),i}))}getOverlayedDocuments(e,n){let a=Pi();return this.populateOverlays(e,a,n).next(()=>this.computeViews(e,n,a,ke()))}populateOverlays(e,n,a){let r=[];return a.forEach(s=>{n.has(s)||r.push(s)}),this.documentOverlayCache.getOverlays(e,r).next(s=>{s.forEach((i,u)=>{n.set(i,u)})})}computeViews(e,n,a,r){let s=Gs(),i=vc(),u=function(){return vc()}();return n.forEach((l,c)=>{let f=a.get(c.key);r.has(c.key)&&(f===void 0||f.mutation instanceof gu)?s=s.insert(c.key,c):f!==void 0?(i.set(c.key,f.mutation.getFieldMask()),Ec(f.mutation,c,f.mutation.getFieldMask(),zt.now())):i.set(c.key,Di.empty())}),this.recalculateAndSaveOverlays(e,s).next(l=>(l.forEach((c,f)=>i.set(c,f)),n.forEach((c,f)=>u.set(c,new J_(f,i.get(c)??null))),u))}recalculateAndSaveOverlays(e,n){let a=vc(),r=new Pt((i,u)=>i-u),s=ke();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(i=>{for(let u of i)u.keys().forEach(l=>{let c=n.get(l);if(c===null)return;let f=a.get(l)||Di.empty();f=u.applyToLocalView(c,f),a.set(l,f);let p=(r.get(u.batchId)||ke()).add(l);r=r.insert(u.batchId,p)})}).next(()=>{let i=[],u=r.getReverseIterator();for(;u.hasNext();){let l=u.getNext(),c=l.key,f=l.value,p=N0();f.forEach(m=>{if(!s.has(m)){let S=q0(n.get(m),a.get(m));S!==null&&p.set(m,S),s=s.add(m)}}),i.push(this.documentOverlayCache.saveOverlays(e,c,p))}return H.waitFor(i)}).next(()=>a)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.recalculateAndSaveOverlays(e,a))}getDocumentsMatchingQuery(e,n,a,r){return eV(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):kp(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,a,r):this.getDocumentsMatchingCollectionQuery(e,n,a,r)}getNextDocuments(e,n,a,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,a,r).next(s=>{let i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,a.largestBatchId,r-s.size):H.resolve(Pi()),u=Tc,l=s;return i.next(c=>H.forEach(c,(f,p)=>(u<p.largestBatchId&&(u=p.largestBatchId),s.get(f)?H.resolve():this.remoteDocumentCache.getEntry(e,f).next(m=>{l=l.insert(f,m)}))).next(()=>this.populateOverlays(e,c,s)).next(()=>this.computeViews(e,l,c,ke())).next(f=>({batchId:u,changes:sV(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new te(n)).next(a=>{let r=_c();return a.isFoundDocument()&&(r=r.insert(a.key,a)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,a,r){let s=n.collectionGroup,i=_c();return this.indexManager.getCollectionParents(e,s).next(u=>H.forEach(u,l=>{let c=function(p,m){return new Xr(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,c,a,r).next(f=>{f.forEach((p,m)=>{i=i.insert(p,m)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,n,a,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,a.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,a,s,r))).next(i=>{s.forEach((l,c)=>{let f=c.getKey();i.get(f)===null&&(i=i.insert(f,ba.newInvalidDocument(f)))});let u=_c();return i.forEach((l,c)=>{let f=s.get(l);f!==void 0&&Ec(f.mutation,c,Di.empty(),zt.now()),Op(n,c)&&(u=u.insert(l,c))}),u})}};var eS=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return H.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(r){return{id:r.id,version:r.version,createTime:iu(r.createTime)}}(n)),H.resolve()}getNamedQuery(e,n){return H.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(r){return{name:r.name,query:Z0(r.bundledQuery),readTime:iu(r.readTime)}}(n)),H.resolve()}};var tS=class{constructor(){this.overlays=new Pt(te.comparator),this.Lr=new Map}getOverlay(e,n){return H.resolve(this.overlays.get(n))}getOverlays(e,n){let a=Pi();return H.forEach(n,r=>this.getOverlay(e,r).next(s=>{s!==null&&a.set(r,s)})).next(()=>a)}saveOverlays(e,n,a){return a.forEach((r,s)=>{this.bt(e,n,s)}),H.resolve()}removeOverlaysForBatchId(e,n,a){let r=this.Lr.get(a);return r!==void 0&&(r.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(a)),H.resolve()}getOverlaysForCollection(e,n,a){let r=Pi(),s=n.length+1,i=new te(n.child("")),u=this.overlays.getIteratorFrom(i);for(;u.hasNext();){let l=u.getNext().value,c=l.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===s&&l.largestBatchId>a&&r.set(l.getKey(),l)}return H.resolve(r)}getOverlaysForCollectionGroup(e,n,a,r){let s=new Pt((c,f)=>c-f),i=this.overlays.getIterator();for(;i.hasNext();){let c=i.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>a){let f=s.get(c.largestBatchId);f===null&&(f=Pi(),s=s.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}let u=Pi(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((c,f)=>u.set(c,f)),!(u.size()>=r)););return H.resolve(u)}bt(e,n,a){let r=this.overlays.get(a.key);if(r!==null){let i=this.Lr.get(r.largestBatchId).delete(a.key);this.Lr.set(r.largestBatchId,i)}this.overlays=this.overlays.insert(a.key,new V_(n,a));let s=this.Lr.get(n);s===void 0&&(s=ke(),this.Lr.set(n,s)),this.Lr.set(n,s.add(a.key))}};var nS=class{constructor(){this.sessionToken=gn.EMPTY_BYTE_STRING}getSessionToken(e){return H.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,H.resolve()}};var Nc=class{constructor(){this.kr=new ln(qt.Kr),this.qr=new ln(qt.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){let a=new qt(e,n);this.kr=this.kr.add(a),this.qr=this.qr.add(a)}$r(e,n){e.forEach(a=>this.addReference(a,n))}removeReference(e,n){this.Wr(new qt(e,n))}Qr(e,n){e.forEach(a=>this.removeReference(a,n))}Gr(e){let n=new te(new ct([])),a=new qt(n,e),r=new qt(n,e+1),s=[];return this.qr.forEachInRange([a,r],i=>{this.Wr(i),s.push(i.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let n=new te(new ct([])),a=new qt(n,e),r=new qt(n,e+1),s=ke();return this.qr.forEachInRange([a,r],i=>{s=s.add(i.key)}),s}containsKey(e){let n=new qt(e,0),a=this.kr.firstAfterOrEqual(n);return a!==null&&e.isEqual(a.key)}},qt=class{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return te.comparator(e.key,n.key)||xe(e.Hr,n.Hr)}static Ur(e,n){return xe(e.Hr,n.Hr)||te.comparator(e.key,n.key)}};var aS=class{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new ln(qt.Kr)}checkEmpty(e){return H.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,a,r){let s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new N_(s,n,a,r);this.mutationQueue.push(i);for(let u of r)this.Jr=this.Jr.add(new qt(u.key,s)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return H.resolve(i)}lookupMutationBatch(e,n){return H.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){let a=n+1,r=this.Xr(a),s=r<0?0:r;return H.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return H.resolve(this.mutationQueue.length===0?N2:this.Yn-1)}getAllMutationBatches(e){return H.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){let a=new qt(n,0),r=new qt(n,Number.POSITIVE_INFINITY),s=[];return this.Jr.forEachInRange([a,r],i=>{let u=this.Zr(i.Hr);s.push(u)}),H.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let a=new ln(xe);return n.forEach(r=>{let s=new qt(r,0),i=new qt(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([s,i],u=>{a=a.add(u.Hr)})}),H.resolve(this.Yr(a))}getAllMutationBatchesAffectingQuery(e,n){let a=n.path,r=a.length+1,s=a;te.isDocumentKey(s)||(s=s.child(""));let i=new qt(new te(s),0),u=new ln(xe);return this.Jr.forEachWhile(l=>{let c=l.key.path;return!!a.isPrefixOf(c)&&(c.length===r&&(u=u.add(l.Hr)),!0)},i),H.resolve(this.Yr(u))}Yr(e){let n=[];return e.forEach(a=>{let r=this.Zr(a);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){mt(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let a=this.Jr;return H.forEach(n.mutations,r=>{let s=new qt(r.key,n.batchId);return a=a.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=a})}nr(e){}containsKey(e,n){let a=new qt(n,0),r=this.Jr.firstAfterOrEqual(a);return H.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,H.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}};var rS=class{constructor(e){this.ti=e,this.docs=function(){return new Pt(te.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){let a=n.key,r=this.docs.get(a),s=r?r.size:0,i=this.ti(n);return this.docs=this.docs.insert(a,{document:n.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,a.path.popLast())}removeEntry(e){let n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){let a=this.docs.get(n);return H.resolve(a?a.document.mutableCopy():ba.newInvalidDocument(n))}getEntries(e,n){let a=Gs();return n.forEach(r=>{let s=this.docs.get(r);a=a.insert(r,s?s.document.mutableCopy():ba.newInvalidDocument(r))}),H.resolve(a)}getDocumentsMatchingQuery(e,n,a,r){let s=Gs(),i=n.path,u=new te(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){let{key:c,value:{document:f}}=l.getNext();if(!i.isPrefixOf(c.path))break;c.path.length>i.length+1||P2(D2(f),a)<=0||(r.has(f.key)||Op(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return H.resolve(s)}getAllFromCollectionGroup(e,n,a,r){oe(9500)}ni(e,n){return H.forEach(this.docs,a=>n(a))}newChangeBuffer(e){return new sS(this)}getSize(e){return H.resolve(this.size)}},sS=class extends $_{constructor(e){super(),this.Mr=e}applyChanges(e){let n=[];return this.changes.forEach((a,r)=>{r.isValidDocument()?n.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(a)}),H.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}};var iS=class{constructor(e){this.persistence=e,this.ri=new Yr(n=>HS(n),GS),this.lastRemoteSnapshotVersion=ge.min(),this.highestTargetId=0,this.ii=0,this.si=new Nc,this.targetCount=0,this.oi=Mc._r()}forEachTarget(e,n){return this.ri.forEach((a,r)=>n(r)),H.resolve()}getLastRemoteSnapshotVersion(e){return H.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return H.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),H.resolve(this.highestTargetId)}setTargetsMetadata(e,n,a){return a&&(this.lastRemoteSnapshotVersion=a),n>this.ii&&(this.ii=n),H.resolve()}lr(e){this.ri.set(e.target,e);let n=e.targetId;n>this.highestTargetId&&(this.oi=new Mc(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,H.resolve()}updateTargetData(e,n){return this.lr(n),H.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,H.resolve()}removeTargets(e,n,a){let r=0,s=[];return this.ri.forEach((i,u)=>{u.sequenceNumber<=n&&a.get(u.targetId)===null&&(this.ri.delete(i),s.push(this.removeMatchingKeysForTargetId(e,u.targetId)),r++)}),H.waitFor(s).next(()=>r)}getTargetCount(e){return H.resolve(this.targetCount)}getTargetData(e,n){let a=this.ri.get(n)||null;return H.resolve(a)}addMatchingKeys(e,n,a){return this.si.$r(n,a),H.resolve()}removeMatchingKeys(e,n,a){this.si.Qr(n,a);let r=this.persistence.referenceDelegate,s=[];return r&&n.forEach(i=>{s.push(r.markPotentiallyOrphaned(e,i))}),H.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),H.resolve()}getMatchingKeysForTargetId(e,n){let a=this.si.jr(n);return H.resolve(a)}containsKey(e,n){return H.resolve(this.si.containsKey(n))}};var pp=class{constructor(e,n){this._i={},this.overlays={},this.ai=new lu(0),this.ui=!1,this.ui=!0,this.ci=new nS,this.referenceDelegate=e(this),this.li=new iS(this),this.indexManager=new K_,this.remoteDocumentCache=function(r){return new rS(r)}(a=>this.referenceDelegate.hi(a)),this.serializer=new j_(n),this.Pi=new eS(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new tS,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let a=this._i[e.toKey()];return a||(a=new aS(n,this.referenceDelegate),this._i[e.toKey()]=a),a}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,a){Q("MemoryPersistence","Starting transaction:",e);let r=new oS(this.ai.next());return this.referenceDelegate.Ti(),a(r).next(s=>this.referenceDelegate.Ii(r).next(()=>s)).toPromise().then(s=>(r.raiseOnCommittedEvent(),s))}Ei(e,n){return H.or(Object.values(this._i).map(a=>()=>a.containsKey(e,n)))}},oS=class extends E_{constructor(e){super(),this.currentSequenceNumber=e}},uS=class t{constructor(e){this.persistence=e,this.Ri=new Nc,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw oe(60996)}addReference(e,n,a){return this.Ri.addReference(a,n),this.di.delete(a.toString()),H.resolve()}removeReference(e,n,a){return this.Ri.removeReference(a,n),this.di.add(a.toString()),H.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),H.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(r=>this.di.add(r.toString()));let a=this.persistence.getTargetCache();return a.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(s=>this.di.add(s.toString()))}).next(()=>a.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){let n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return H.forEach(this.di,a=>{let r=te.fromPath(a);return this.mi(e,r).next(s=>{s||n.removeEntry(r,ge.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(a=>{a?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return H.or([()=>H.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}},mp=class t{constructor(e,n){this.persistence=e,this.fi=new Yr(a=>F2(a.path),(a,r)=>a.isEqual(r)),this.garbageCollector=kV(this,n)}static Vi(e,n){return new t(e,n)}Ti(){}Ii(e){return H.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){let n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(a=>n.next(r=>a+r))}pr(e){let n=0;return this.mr(e,a=>{n++}).next(()=>n)}mr(e,n){return H.forEach(this.fi,(a,r)=>this.wr(e,a,r).next(s=>s?H.resolve():n(r)))}removeTargets(e,n,a){return this.persistence.getTargetCache().removeTargets(e,n,a)}removeOrphanedDocuments(e,n){let a=0,r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ni(e,i=>this.wr(e,i,n).next(u=>{u||(a++,s.removeEntry(i,ge.min()))})).next(()=>s.apply(e)).next(()=>a)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),H.resolve()}removeTarget(e,n){let a=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,a)}addReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),H.resolve()}removeReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),H.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),H.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Yh(e.data.value)),n}wr(e,n,a){return H.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{let r=this.fi.get(n);return H.resolve(r!==void 0&&r>a)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var lS=class t{constructor(e,n,a,r){this.targetId=e,this.fromCache=n,this.Ts=a,this.Is=r}static Es(e,n){let a=ke(),r=ke();for(let s of n.docChanges)switch(s.type){case 0:a=a.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new t(e,n.fromCache,a,r)}};var cS=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var dS=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return YL()?8:M2(rn())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,a,r){let s={result:null};return this.gs(e,n).next(i=>{s.result=i}).next(()=>{if(!s.result)return this.ps(e,n,r,a).next(i=>{s.result=i})}).next(()=>{if(s.result)return;let i=new cS;return this.ys(e,n,i).next(u=>{if(s.result=u,this.As)return this.ws(e,n,i,u.size)})}).next(()=>s.result)}ws(e,n,a,r){return a.documentReadCount<this.Vs?(Zo()<=_e.DEBUG&&Q("QueryEngine","SDK will not create cache indexes for query:",eu(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),H.resolve()):(Zo()<=_e.DEBUG&&Q("QueryEngine","Query:",eu(n),"scans",a.documentReadCount,"local documents and returns",r,"documents as results."),a.documentReadCount>this.ds*r?(Zo()<=_e.DEBUG&&Q("QueryEngine","The SDK decides to create cache indexes for query:",eu(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Za(n))):H.resolve())}gs(e,n){if(Cx(n))return H.resolve(null);let a=Za(n);return this.indexManager.getIndexType(e,a).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=Ac(n,null,"F"),a=Za(n)),this.indexManager.getDocumentsMatchingTarget(e,a).next(s=>{let i=ke(...s);return this.fs.getDocuments(e,i).next(u=>this.indexManager.getMinOffset(e,a).next(l=>{let c=this.bs(n,u);return this.Ss(n,c,i,l.readTime)?this.gs(e,Ac(n,null,"F")):this.Ds(e,c,n,l)}))})))}ps(e,n,a,r){return Cx(n)||r.isEqual(ge.min())?H.resolve(null):this.fs.getDocuments(e,a).next(s=>{let i=this.bs(n,s);return this.Ss(n,i,a,r)?H.resolve(null):(Zo()<=_e.DEBUG&&Q("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),eu(n)),this.Ds(e,i,n,k2(r,Tc)).next(u=>u))})}bs(e,n){let a=new ln(O0(e));return n.forEach((r,s)=>{Op(e,s)&&(a=a.add(s))}),a}Ss(e,n,a,r){if(e.limit===null)return!1;if(a.size!==n.size)return!0;let s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ys(e,n,a){return Zo()<=_e.DEBUG&&Q("QueryEngine","Using full collection scan to execute query:",eu(n)),this.fs.getDocumentsMatchingQuery(e,n,Fi.min(),a)}Ds(e,n,a,r){return this.fs.getDocumentsMatchingQuery(e,a,r).next(s=>(n.forEach(i=>{s=s.insert(i.key,i)}),s))}};var WS="LocalStore",DV=3e8,fS=class{constructor(e,n,a,r){this.persistence=e,this.Cs=n,this.serializer=r,this.vs=new Pt(xe),this.Fs=new Yr(s=>HS(s),GS),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(a)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Z_(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}};function PV(t,e,n,a){return new fS(t,e,n,a)}async function tR(t,e){let n=De(t);return await n.persistence.runTransaction("Handle user change","readonly",a=>{let r;return n.mutationQueue.getAllMutationBatches(a).next(s=>(r=s,n.Os(e),n.mutationQueue.getAllMutationBatches(a))).next(s=>{let i=[],u=[],l=ke();for(let c of r){i.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}for(let c of s){u.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}return n.localDocuments.getDocuments(a,l).next(c=>({Ns:c,removedBatchIds:i,addedBatchIds:u}))})})}function nR(t){let e=De(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function OV(t,e){let n=De(t),a=e.snapshotVersion,r=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{let i=n.xs.newChangeBuffer({trackRemovals:!0});r=n.vs;let u=[];e.targetChanges.forEach((f,p)=>{let m=r.get(p);if(!m)return;u.push(n.li.removeMatchingKeys(s,f.removedDocuments,p).next(()=>n.li.addMatchingKeys(s,f.addedDocuments,p)));let S=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?S=S.withResumeToken(gn.EMPTY_BYTE_STRING,ge.min()).withLastLimboFreeSnapshotVersion(ge.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,a)),r=r.insert(p,S),function(D,L,E){return D.resumeToken.approximateByteSize()===0||L.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=DV?!0:E.addedDocuments.size+E.modifiedDocuments.size+E.removedDocuments.size>0}(m,S,f)&&u.push(n.li.updateTargetData(s,S))});let l=Gs(),c=ke();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&u.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),u.push(MV(s,i,e.documentUpdates).next(f=>{l=f.Bs,c=f.Ls})),!a.isEqual(ge.min())){let f=n.li.getLastRemoteSnapshotVersion(s).next(p=>n.li.setTargetsMetadata(s,s.currentSequenceNumber,a));u.push(f)}return H.waitFor(u).next(()=>i.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,l,c)).next(()=>l)}).then(s=>(n.vs=r,s))}function MV(t,e,n){let a=ke(),r=ke();return n.forEach(s=>a=a.add(s)),e.getEntries(t,a).next(s=>{let i=Gs();return n.forEach((u,l)=>{let c=s.get(u);l.isFoundDocument()!==c.isFoundDocument()&&(r=r.add(u)),l.isNoDocument()&&l.version.isEqual(ge.min())?(e.removeEntry(u,l.readTime),i=i.insert(u,l)):!c.isValidDocument()||l.version.compareTo(c.version)>0||l.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(l),i=i.insert(u,l)):Q(WS,"Ignoring outdated watch update for ",u,". Current version:",c.version," Watch version:",l.version)}),{Bs:i,Ls:r}})}function NV(t,e){let n=De(t);return n.persistence.runTransaction("Allocate target","readwrite",a=>{let r;return n.li.getTargetData(a,e).next(s=>s?(r=s,H.resolve(r)):n.li.allocateTargetId(a).next(i=>(r=new Oc(e,i,"TargetPurposeListen",a.currentSequenceNumber),n.li.addTargetData(a,r).next(()=>r))))}).then(a=>{let r=n.vs.get(a.targetId);return(r===null||a.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.vs=n.vs.insert(a.targetId,a),n.Fs.set(e,a.targetId)),a})}async function hS(t,e,n){let a=De(t),r=a.vs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await a.persistence.runTransaction("Release target",s,i=>a.persistence.referenceDelegate.removeTarget(i,r))}catch(i){if(!Tu(i))throw i;Q(WS,`Failed to update sequence numbers for target ${e}: ${i}`)}a.vs=a.vs.remove(e),a.Fs.delete(r.target)}function Fx(t,e,n){let a=De(t),r=ge.min(),s=ke();return a.persistence.runTransaction("Execute query","readwrite",i=>function(l,c,f){let p=De(l),m=p.Fs.get(f);return m!==void 0?H.resolve(p.vs.get(m)):p.li.getTargetData(c,f)}(a,i,Za(e)).next(u=>{if(u)return r=u.lastLimboFreeSnapshotVersion,a.li.getMatchingKeysForTargetId(i,u.targetId).next(l=>{s=l})}).next(()=>a.Cs.getDocumentsMatchingQuery(i,e,n?r:ge.min(),n?s:ke())).next(u=>(VV(a,nV(e),u),{documents:u,ks:s})))}function VV(t,e,n){let a=t.Ms.get(e)||ge.min();n.forEach((r,s)=>{s.readTime.compareTo(a)>0&&(a=s.readTime)}),t.Ms.set(e,a)}var gp=class{constructor(){this.activeTargetIds=uV()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var pS=class{constructor(){this.vo=new gp,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,a){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,a){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new gp,Promise.resolve()}handleUserChange(e,n,a){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var mS=class{Mo(e){}shutdown(){}};var Ux="ConnectivityMonitor",yp=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){Q(Ux,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){Q(Ux,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var Xh=null;function gS(){return Xh===null?Xh=function(){return 268435456+Math.round(2147483648*Math.random())}():Xh++,"0x"+Xh.toString(16)}var m_="RestConnection",FV={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},yS=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let n=e.ssl?"https":"http",a=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${a}/databases/${r}`,this.$o=this.databaseId.database===ip?`project_id=${a}`:`project_id=${a}&database_id=${r}`}Wo(e,n,a,r,s){let i=gS(),u=this.Qo(e,n.toUriEncodedString());Q(m_,`Sending RPC '${e}' ${i}:`,u,a);let l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,r,s);let{host:c}=new URL(u),f=Ga(c);return this.zo(e,u,l,a,f).then(p=>(Q(m_,`Received RPC '${e}' ${i}: `,p),p),p=>{throw Gr(m_,`RPC '${e}' ${i} failed with error: `,p,"url: ",u,"request:",a),p})}jo(e,n,a,r,s,i){return this.Wo(e,n,a,r,s)}Go(e,n,a){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+vu}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,s)=>e[s]=r),a&&a.headers.forEach((r,s)=>e[s]=r)}Qo(e,n){let a=FV[e],r=`${this.qo}/v1/${n}:${a}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var IS=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var Sn="WebChannelConnection",Ic=(t,e,n)=>{t.listen(e,a=>{try{n(a)}catch(r){setTimeout(()=>{throw r},0)}})},Ip=class t extends yS{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=c_();Ic(e,l_.STAT_EVENT,n=>{n.stat===jh.PROXY?Q(Sn,"STAT_EVENT: detected buffering proxy"):n.stat===jh.NOPROXY&&Q(Sn,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,n,a,r,s){let i=gS();return new Promise((u,l)=>{let c=new o_;c.setWithCredentials(!0),c.listenOnce(u_.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case yc.NO_ERROR:let p=c.getResponseJson();Q(Sn,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(p)),u(p);break;case yc.TIMEOUT:Q(Sn,`RPC '${e}' ${i} timed out`),l(new X(q.DEADLINE_EXCEEDED,"Request time out"));break;case yc.HTTP_ERROR:let m=c.getStatus();if(Q(Sn,`RPC '${e}' ${i} failed with status:`,m,"response text:",c.getResponseText()),m>0){let S=c.getResponseJson();Array.isArray(S)&&(S=S[0]);let R=S?.error;if(R&&R.status&&R.message){let D=function(E){let v=E.toLowerCase().replace(/_/g,"-");return Object.values(q).indexOf(v)>=0?v:q.UNKNOWN}(R.status);l(new X(D,R.message))}else l(new X(q.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new X(q.UNAVAILABLE,"Connection failed."));break;default:oe(9055,{l_:e,streamId:i,h_:c.getLastErrorCode(),P_:c.getLastError()})}}finally{Q(Sn,`RPC '${e}' ${i} completed.`)}});let f=JSON.stringify(r);Q(Sn,`RPC '${e}' ${i} sending request:`,r),c.send(n,"POST",f,a,15)})}T_(e,n,a){let r=gS(),s=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(u.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,n,a),u.encodeInitMessageHeaders=!0;let c=s.join("");Q(Sn,`Creating RPC '${e}' stream ${r}: ${c}`,u);let f=i.createWebChannel(c,u);this.I_(f);let p=!1,m=!1,S=new IS({Ho:R=>{m?Q(Sn,`Not sending because RPC '${e}' stream ${r} is closed:`,R):(p||(Q(Sn,`Opening RPC '${e}' stream ${r} transport.`),f.open(),p=!0),Q(Sn,`RPC '${e}' stream ${r} sending:`,R),f.send(R))},Jo:()=>f.close()});return Ic(f,Jo.EventType.OPEN,()=>{m||(Q(Sn,`RPC '${e}' stream ${r} transport opened.`),S.i_())}),Ic(f,Jo.EventType.CLOSE,()=>{m||(m=!0,Q(Sn,`RPC '${e}' stream ${r} transport closed`),S.o_(),this.E_(f))}),Ic(f,Jo.EventType.ERROR,R=>{m||(m=!0,Gr(Sn,`RPC '${e}' stream ${r} transport errored. Name:`,R.name,"Message:",R.message),S.o_(new X(q.UNAVAILABLE,"The operation could not be completed")))}),Ic(f,Jo.EventType.MESSAGE,R=>{if(!m){let D=R.data[0];mt(!!D,16349);let L=D,E=L?.error||L[0]?.error;if(E){Q(Sn,`RPC '${e}' stream ${r} received error:`,E);let v=E.status,C=function(z){let I=Bt[z];if(I!==void 0)return H0(I)}(v),x=E.message;v==="NOT_FOUND"&&x.includes("database")&&x.includes("does not exist")&&x.includes(this.databaseId.database)&&Gr(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),C===void 0&&(C=q.INTERNAL,x="Unknown error status: "+v+" with message "+E.message),m=!0,S.o_(new X(C,x)),f.close()}else Q(Sn,`RPC '${e}' stream ${r} received:`,D),S.__(D)}}),t.u_(),setTimeout(()=>{S.s_()},0),S}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,a){super.Go(e,n,a),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return d_()}};function UV(t){return new Ip(t)}function g_(){return typeof document<"u"?document:null}function jc(t){return new q_(t,!0)}Ip.c_=!1;var _p=class{constructor(e,n,a=1e3,r=1.5,s=6e4){this.Ci=e,this.timerId=n,this.R_=a,this.A_=r,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let n=Math.floor(this.d_+this.y_()),a=Math.max(0,Date.now()-this.f_),r=Math.max(0,n-a);r>0&&Q("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${a} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var Bx="PersistentStream",_S=class{constructor(e,n,a,r,s,i,u,l){this.Ci=e,this.b_=a,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new _p(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===q.RESOURCE_EXHAUSTED?(Hr(n.toString()),Hr("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===q.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([a,r])=>{this.D_===n&&this.G_(a,r)},a=>{e(()=>{let r=new X(q.UNKNOWN,"Fetching auth token failed: "+a.message);return this.z_(r)})})}G_(e,n){let a=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{a(()=>this.listener.Zo())}),this.stream.Yo(()=>{a(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{a(()=>this.z_(r))}),this.stream.onMessage(r=>{a(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return Q(Bx,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():(Q(Bx,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},SS=class extends _S{constructor(e,n,a,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,a,r,i),this.serializer=s}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let n=EV(this.serializer,e),a=function(s){if(!("targetChange"in s))return ge.min();let i=s.targetChange;return i.targetIds&&i.targetIds.length?ge.min():i.readTime?iu(i.readTime):ge.min()}(e);return this.listener.J_(n,a)}Z_(e){let n={};n.database=Ox(this.serializer),n.addTarget=function(s,i){let u,l=i.target;if(u=M_(l)?{documents:TV(s,l)}:{query:bV(s,l).ft},u.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){u.resumeToken=G0(s,i.resumeToken);let c=z_(s,i.expectedCount);c!==null&&(u.expectedCount=c)}else if(i.snapshotVersion.compareTo(ge.min())>0){u.readTime=H_(s,i.snapshotVersion.toTimestamp());let c=z_(s,i.expectedCount);c!==null&&(u.expectedCount=c)}return u}(this.serializer,e);let a=CV(this.serializer,e);a&&(n.labels=a),this.K_(n)}X_(e){let n={};n.database=Ox(this.serializer),n.removeTarget=e,this.K_(n)}};var vS=class{},ES=class extends vS{constructor(e,n,a,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=a,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new X(q.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,a,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Wo(e,G_(n,a),r,s,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===q.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new X(q.UNKNOWN,s.toString())})}jo(e,n,a,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,u])=>this.connection.jo(e,G_(n,a),r,i,u,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===q.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new X(q.UNKNOWN,i.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function BV(t,e,n,a){return new ES(t,e,n,a)}var TS=class{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Hr(n),this.aa=!1):Q("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var yu="RemoteStore",bS=class{constructor(e,n,a,r,s){this.localStore=e,this.datastore=n,this.asyncQueue=a,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(i=>{a.enqueueAndForget(async()=>{Wc(this)&&(Q(yu,"Restarting streams for network reachability change."),await async function(l){let c=De(l);c.Ea.add(4),await Kc(c),c.Va.set("Unknown"),c.Ea.delete(4),await Mp(c)}(this))})}),this.Va=new TS(a,r)}};async function Mp(t){if(Wc(t))for(let e of t.Ra)await e(!0)}async function Kc(t){for(let e of t.Ra)await e(!1)}function aR(t,e){let n=De(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),$S(n)?QS(n):wu(n).O_()&&YS(n,e))}function XS(t,e){let n=De(t),a=wu(n);n.Ia.delete(e),a.O_()&&rR(n,e),n.Ia.size===0&&(a.O_()?a.L_():Wc(n)&&n.Va.set("Unknown"))}function YS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(ge.min())>0){let n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}wu(t).Z_(e)}function rR(t,e){t.da.$e(e),wu(t).X_(e)}function QS(t){t.da=new B_({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),wu(t).start(),t.Va.ua()}function $S(t){return Wc(t)&&!wu(t).x_()&&t.Ia.size>0}function Wc(t){return De(t).Ea.size===0}function sR(t){t.da=void 0}async function qV(t){t.Va.set("Online")}async function zV(t){t.Ia.forEach((e,n)=>{YS(t,e)})}async function HV(t,e){sR(t),$S(t)?(t.Va.ha(e),QS(t)):t.Va.set("Unknown")}async function GV(t,e,n){if(t.Va.set("Online"),e instanceof dp&&e.state===2&&e.cause)try{await async function(r,s){let i=s.cause;for(let u of s.targetIds)r.Ia.has(u)&&(await r.remoteSyncer.rejectListen(u,i),r.Ia.delete(u),r.da.removeTarget(u))}(t,e)}catch(a){Q(yu,"Failed to remove targets %s: %s ",e.targetIds.join(","),a),await qx(t,a)}else if(e instanceof su?t.da.Xe(e):e instanceof cp?t.da.st(e):t.da.tt(e),!n.isEqual(ge.min()))try{let a=await nR(t.localStore);n.compareTo(a)>=0&&await function(s,i){let u=s.da.Tt(i);return u.targetChanges.forEach((l,c)=>{if(l.resumeToken.approximateByteSize()>0){let f=s.Ia.get(c);f&&s.Ia.set(c,f.withResumeToken(l.resumeToken,i))}}),u.targetMismatches.forEach((l,c)=>{let f=s.Ia.get(l);if(!f)return;s.Ia.set(l,f.withResumeToken(gn.EMPTY_BYTE_STRING,f.snapshotVersion)),rR(s,l);let p=new Oc(f.target,l,c,f.sequenceNumber);YS(s,p)}),s.remoteSyncer.applyRemoteEvent(u)}(t,n)}catch(a){Q(yu,"Failed to raise snapshot:",a),await qx(t,a)}}async function qx(t,e,n){if(!Tu(e))throw e;t.Ea.add(1),await Kc(t),t.Va.set("Offline"),n||(n=()=>nR(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{Q(yu,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await Mp(t)})}async function zx(t,e){let n=De(t);n.asyncQueue.verifyOperationInProgress(),Q(yu,"RemoteStore received new credentials");let a=Wc(n);n.Ea.add(3),await Kc(n),a&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await Mp(n)}async function jV(t,e){let n=De(t);e?(n.Ea.delete(2),await Mp(n)):e||(n.Ea.add(2),await Kc(n),n.Va.set("Unknown"))}function wu(t){return t.ma||(t.ma=function(n,a,r){let s=De(n);return s.sa(),new SS(a,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,r)}(t.datastore,t.asyncQueue,{Zo:qV.bind(null,t),Yo:zV.bind(null,t),t_:HV.bind(null,t),J_:GV.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),$S(t)?QS(t):t.Va.set("Unknown")):(await t.ma.stop(),sR(t))})),t.ma}var wS=class t{constructor(e,n,a,r,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=a,this.op=r,this.removalCallback=s,this.deferred=new qr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(i=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,a,r,s){let i=Date.now()+a,u=new t(e,n,i,r,s);return u.start(a),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new X(q.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function iR(t,e){if(Hr("AsyncQueue",`${e}: ${t}`),Tu(t))return new X(q.UNAVAILABLE,`${e}: ${t}`);throw t}var Vc=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(n,a)=>e(n,a)||te.comparator(n.key,a.key):(n,a)=>te.comparator(n.key,a.key),this.keyedMap=_c(),this.sortedSet=new Pt(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,a)=>(e(n),!1))}add(e){let n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){let n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.sortedSet.getIterator(),a=e.sortedSet.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(!r.isEqual(s))return!1}return!0}toString(){let e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){let a=new t;return a.comparator=this.comparator,a.keyedMap=e,a.sortedSet=n,a}};var Sp=class{constructor(){this.ga=new Pt(te.comparator)}track(e){let n=e.doc.key,a=this.ga.get(n);a?e.type!==0&&a.type===3?this.ga=this.ga.insert(n,e):e.type===3&&a.type!==1?this.ga=this.ga.insert(n,{type:a.type,doc:e.doc}):e.type===2&&a.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&a.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&a.type===0?this.ga=this.ga.remove(n):e.type===1&&a.type===2?this.ga=this.ga.insert(n,{type:1,doc:a.doc}):e.type===0&&a.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):oe(63341,{Vt:e,pa:a}):this.ga=this.ga.insert(n,e)}ya(){let e=[];return this.ga.inorderTraversal((n,a)=>{e.push(a)}),e}},Ui=class t{constructor(e,n,a,r,s,i,u,l,c){this.query=e,this.docs=n,this.oldDocs=a,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=c}static fromInitialDocuments(e,n,a,r,s){let i=[];return n.forEach(u=>{i.push({type:0,doc:u})}),new t(e,n,Vc.emptySet(n),i,a,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Pp(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let n=this.docChanges,a=e.docChanges;if(n.length!==a.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==a[r].type||!n[r].doc.isEqual(a[r].doc))return!1;return!0}};var CS=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},LS=class{constructor(){this.queries=Hx(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,a){let r=De(n),s=r.queries;r.queries=Hx(),s.forEach((i,u)=>{for(let l of u.ba)l.onError(a)})})(this,new X(q.ABORTED,"Firestore shutting down"))}};function Hx(){return new Yr(t=>P0(t),Pp)}async function KV(t,e){let n=De(t),a=3,r=e.query,s=n.queries.get(r);s?!s.Sa()&&e.Da()&&(a=2):(s=new CS,a=e.Da()?0:1);try{switch(a){case 0:s.wa=await n.onListen(r,!0);break;case 1:s.wa=await n.onListen(r,!1);break;case 2:await n.onFirstRemoteStoreListen(r)}}catch(i){let u=iR(i,`Initialization of query '${eu(e.query)}' failed`);return void e.onError(u)}n.queries.set(r,s),s.ba.push(e),e.va(n.onlineState),s.wa&&e.Fa(s.wa)&&JS(n)}async function WV(t,e){let n=De(t),a=e.query,r=3,s=n.queries.get(a);if(s){let i=s.ba.indexOf(e);i>=0&&(s.ba.splice(i,1),s.ba.length===0?r=e.Da()?0:1:!s.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return n.queries.delete(a),n.onUnlisten(a,!0);case 1:return n.queries.delete(a),n.onUnlisten(a,!1);case 2:return n.onLastRemoteStoreUnlisten(a);default:return}}function XV(t,e){let n=De(t),a=!1;for(let r of e){let s=r.query,i=n.queries.get(s);if(i){for(let u of i.ba)u.Fa(r)&&(a=!0);i.wa=r}}a&&JS(n)}function YV(t,e,n){let a=De(t),r=a.queries.get(e);if(r)for(let s of r.ba)s.onError(n);a.queries.delete(e)}function JS(t){t.Ca.forEach(e=>{e.next()})}var AS,Gx;(Gx=AS||(AS={})).Ma="default",Gx.Cache="cache";var xS=class{constructor(e,n,a){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=a||{}}Fa(e){if(!this.options.includeMetadataChanges){let a=[];for(let r of e.docChanges)r.type!==3&&a.push(r);e=new Ui(e.query,e.docs,e.oldDocs,a,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;let a=n!=="Offline";return(!this.options.Ka||!a)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=Ui.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==AS.Cache}};var vp=class{constructor(e){this.key=e}},Ep=class{constructor(e){this.key=e}},RS=class{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=ke(),this.mutatedKeys=ke(),this.eu=O0(e),this.tu=new Vc(this.eu)}get nu(){return this.Za}ru(e,n){let a=n?n.iu:new Sp,r=n?n.tu:this.tu,s=n?n.mutatedKeys:this.mutatedKeys,i=r,u=!1,l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,c=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((f,p)=>{let m=r.get(f),S=Op(this.query,p)?p:null,R=!!m&&this.mutatedKeys.has(m.key),D=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations),L=!1;m&&S?m.data.isEqual(S.data)?R!==D&&(a.track({type:3,doc:S}),L=!0):this.su(m,S)||(a.track({type:2,doc:S}),L=!0,(l&&this.eu(S,l)>0||c&&this.eu(S,c)<0)&&(u=!0)):!m&&S?(a.track({type:0,doc:S}),L=!0):m&&!S&&(a.track({type:1,doc:m}),L=!0,(l||c)&&(u=!0)),L&&(S?(i=i.add(S),s=D?s.add(f):s.delete(f)):(i=i.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;i.size>this.query.limit;){let f=this.query.limitType==="F"?i.last():i.first();i=i.delete(f.key),s=s.delete(f.key),a.track({type:1,doc:f})}return{tu:i,iu:a,Ss:u,mutatedKeys:s}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,a,r){let s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let i=e.iu.ya();i.sort((f,p)=>function(S,R){let D=L=>{switch(L){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return oe(20277,{Vt:L})}};return D(S)-D(R)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(a),r=r??!1;let u=n&&!r?this._u():[],l=this.Ya.size===0&&this.current&&!r?1:0,c=l!==this.Xa;return this.Xa=l,i.length!==0||c?{snapshot:new Ui(this.query,e.tu,s,i,e.mutatedKeys,l===0,c,!1,!!a&&a.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Sp,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=ke(),this.tu.forEach(a=>{this.uu(a.key)&&(this.Ya=this.Ya.add(a.key))});let n=[];return e.forEach(a=>{this.Ya.has(a)||n.push(new Ep(a))}),this.Ya.forEach(a=>{e.has(a)||n.push(new vp(a))}),n}cu(e){this.Za=e.ks,this.Ya=ke();let n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return Ui.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},ZS="SyncEngine",kS=class{constructor(e,n,a){this.query=e,this.targetId=n,this.view=a}},DS=class{constructor(e){this.key=e,this.hu=!1}},PS=class{constructor(e,n,a,r,s,i){this.localStore=e,this.remoteStore=n,this.eventManager=a,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new Yr(u=>P0(u),Pp),this.Iu=new Map,this.Eu=new Set,this.Ru=new Pt(te.comparator),this.Au=new Map,this.Vu=new Nc,this.du={},this.mu=new Map,this.fu=Mc.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function QV(t,e,n=!0){let a=dR(t),r,s=a.Tu.get(e);return s?(a.sharedClientState.addLocalQueryTarget(s.targetId),r=s.view.lu()):r=await oR(a,e,n,!0),r}async function $V(t,e){let n=dR(t);await oR(n,e,!0,!1)}async function oR(t,e,n,a){let r=await NV(t.localStore,Za(e)),s=r.targetId,i=t.sharedClientState.addLocalQueryTarget(s,n),u;return a&&(u=await JV(t,e,s,i==="current",r.resumeToken)),t.isPrimaryClient&&n&&aR(t.remoteStore,r),u}async function JV(t,e,n,a,r){t.pu=(p,m,S)=>async function(D,L,E,v){let C=L.view.ru(E);C.Ss&&(C=await Fx(D.localStore,L.query,!1).then(({documents:I})=>L.view.ru(I,C)));let x=v&&v.targetChanges.get(L.targetId),G=v&&v.targetMismatches.get(L.targetId)!=null,z=L.view.applyChanges(C,D.isPrimaryClient,x,G);return Kx(D,L.targetId,z.au),z.snapshot}(t,p,m,S);let s=await Fx(t.localStore,e,!0),i=new RS(e,s.ks),u=i.ru(s.documents),l=Pc.createSynthesizedTargetChangeForCurrentChange(n,a&&t.onlineState!=="Offline",r),c=i.applyChanges(u,t.isPrimaryClient,l);Kx(t,n,c.au);let f=new kS(e,n,i);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),c.snapshot}async function ZV(t,e,n){let a=De(t),r=a.Tu.get(e),s=a.Iu.get(r.targetId);if(s.length>1)return a.Iu.set(r.targetId,s.filter(i=>!Pp(i,e))),void a.Tu.delete(e);a.isPrimaryClient?(a.sharedClientState.removeLocalQueryTarget(r.targetId),a.sharedClientState.isActiveQueryTarget(r.targetId)||await hS(a.localStore,r.targetId,!1).then(()=>{a.sharedClientState.clearQueryState(r.targetId),n&&XS(a.remoteStore,r.targetId),OS(a,r.targetId)}).catch(Ap)):(OS(a,r.targetId),await hS(a.localStore,r.targetId,!0))}async function eF(t,e){let n=De(t),a=n.Tu.get(e),r=n.Iu.get(a.targetId);n.isPrimaryClient&&r.length===1&&(n.sharedClientState.removeLocalQueryTarget(a.targetId),XS(n.remoteStore,a.targetId))}async function uR(t,e){let n=De(t);try{let a=await OV(n.localStore,e);e.targetChanges.forEach((r,s)=>{let i=n.Au.get(s);i&&(mt(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?i.hu=!0:r.modifiedDocuments.size>0?mt(i.hu,14607):r.removedDocuments.size>0&&(mt(i.hu,42227),i.hu=!1))}),await cR(n,a,e)}catch(a){await Ap(a)}}function jx(t,e,n){let a=De(t);if(a.isPrimaryClient&&n===0||!a.isPrimaryClient&&n===1){let r=[];a.Tu.forEach((s,i)=>{let u=i.view.va(e);u.snapshot&&r.push(u.snapshot)}),function(i,u){let l=De(i);l.onlineState=u;let c=!1;l.queries.forEach((f,p)=>{for(let m of p.ba)m.va(u)&&(c=!0)}),c&&JS(l)}(a.eventManager,e),r.length&&a.Pu.J_(r),a.onlineState=e,a.isPrimaryClient&&a.sharedClientState.setOnlineState(e)}}async function tF(t,e,n){let a=De(t);a.sharedClientState.updateQueryState(e,"rejected",n);let r=a.Au.get(e),s=r&&r.key;if(s){let i=new Pt(te.comparator);i=i.insert(s,ba.newNoDocument(s,ge.min()));let u=ke().add(s),l=new lp(ge.min(),new Map,new Pt(xe),i,u);await uR(a,l),a.Ru=a.Ru.remove(s),a.Au.delete(e),ev(a)}else await hS(a.localStore,e,!1).then(()=>OS(a,e,n)).catch(Ap)}function OS(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(let a of t.Iu.get(e))t.Tu.delete(a),n&&t.Pu.yu(a,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(a=>{t.Vu.containsKey(a)||lR(t,a)})}function lR(t,e){t.Eu.delete(e.path.canonicalString());let n=t.Ru.get(e);n!==null&&(XS(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),ev(t))}function Kx(t,e,n){for(let a of n)a instanceof vp?(t.Vu.addReference(a.key,e),nF(t,a)):a instanceof Ep?(Q(ZS,"Document no longer in limbo: "+a.key),t.Vu.removeReference(a.key,e),t.Vu.containsKey(a.key)||lR(t,a.key)):oe(19791,{wu:a})}function nF(t,e){let n=e.key,a=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(a)||(Q(ZS,"New document in limbo: "+n),t.Eu.add(a),ev(t))}function ev(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let n=new te(ct.fromString(e)),a=t.fu.next();t.Au.set(a,new DS(n)),t.Ru=t.Ru.insert(n,a),aR(t.remoteStore,new Oc(Za(jS(n.path)),a,"TargetPurposeLimboResolution",lu.ce))}}async function cR(t,e,n){let a=De(t),r=[],s=[],i=[];a.Tu.isEmpty()||(a.Tu.forEach((u,l)=>{i.push(a.pu(l,e,n).then(c=>{if((c||n)&&a.isPrimaryClient){let f=c?!c.fromCache:n?.targetChanges.get(l.targetId)?.current;a.sharedClientState.updateQueryState(l.targetId,f?"current":"not-current")}if(c){r.push(c);let f=lS.Es(l.targetId,c);s.push(f)}}))}),await Promise.all(i),a.Pu.J_(r),await async function(l,c){let f=De(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>H.forEach(c,m=>H.forEach(m.Ts,S=>f.persistence.referenceDelegate.addReference(p,m.targetId,S)).next(()=>H.forEach(m.Is,S=>f.persistence.referenceDelegate.removeReference(p,m.targetId,S)))))}catch(p){if(!Tu(p))throw p;Q(WS,"Failed to update sequence numbers: "+p)}for(let p of c){let m=p.targetId;if(!p.fromCache){let S=f.vs.get(m),R=S.snapshotVersion,D=S.withLastLimboFreeSnapshotVersion(R);f.vs=f.vs.insert(m,D)}}}(a.localStore,s))}async function aF(t,e){let n=De(t);if(!n.currentUser.isEqual(e)){Q(ZS,"User change. New user:",e.toKey());let a=await tR(n.localStore,e);n.currentUser=e,function(s,i){s.mu.forEach(u=>{u.forEach(l=>{l.reject(new X(q.CANCELLED,i))})}),s.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,a.removedBatchIds,a.addedBatchIds),await cR(n,a.Ns)}}function rF(t,e){let n=De(t),a=n.Au.get(e);if(a&&a.hu)return ke().add(a.key);{let r=ke(),s=n.Iu.get(e);if(!s)return r;for(let i of s){let u=n.Tu.get(i);r=r.unionWith(u.view.nu)}return r}}function dR(t){let e=De(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=uR.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=rF.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=tF.bind(null,e),e.Pu.J_=XV.bind(null,e.eventManager),e.Pu.yu=YV.bind(null,e.eventManager),e}var Bi=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=jc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return PV(this.persistence,new dS,e.initialUser,this.serializer)}Cu(e){return new pp(uS.Vi,this.serializer)}Du(e){return new pS}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};Bi.provider={build:()=>new Bi};var Tp=class extends Bi{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){mt(this.persistence.referenceDelegate instanceof mp,46915);let a=this.persistence.referenceDelegate.garbageCollector;return new Y_(a,e.asyncQueue,n)}Cu(e){let n=this.cacheSizeBytes!==void 0?pa.withCacheSize(this.cacheSizeBytes):pa.DEFAULT;return new pp(a=>mp.Vi(a,n),this.serializer)}};var Iu=class{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=a=>jx(this.syncEngine,a,1),this.remoteStore.remoteSyncer.handleCredentialChange=aF.bind(null,this.syncEngine),await jV(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new LS}()}createDatastore(e){let n=jc(e.databaseInfo.databaseId),a=UV(e.databaseInfo);return BV(e.authCredentials,e.appCheckCredentials,a,n)}createRemoteStore(e){return function(a,r,s,i,u){return new bS(a,r,s,i,u)}(this.localStore,this.datastore,e.asyncQueue,n=>jx(this.syncEngine,n,0),function(){return yp.v()?new yp:new mS}())}createSyncEngine(e,n){return function(r,s,i,u,l,c,f){let p=new PS(r,s,i,u,l,c);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){await async function(n){let a=De(n);Q(yu,"RemoteStore shutting down."),a.Ea.add(5),await Kc(a),a.Aa.shutdown(),a.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};Iu.provider={build:()=>new Iu};var MS=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):Hr("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}};var js="FirestoreClient",NS=class{constructor(e,n,a,r,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=a,this._databaseInfo=r,this.user=un.UNAUTHENTICATED,this.clientId=ou.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(a,async i=>{Q(js,"Received user=",i.uid),await this.authCredentialListener(i),this.user=i}),this.appCheckCredentials.start(a,i=>(Q(js,"Received new app check token=",i),this.appCheckCredentialListener(i,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new qr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){let a=iR(n,"Failed to shutdown persistence");e.reject(a)}}),e.promise}};async function y_(t,e){t.asyncQueue.verifyOperationInProgress(),Q(js,"Initializing OfflineComponentProvider");let n=t.configuration;await e.initialize(n);let a=n.initialUser;t.setCredentialChangeListener(async r=>{a.isEqual(r)||(await tR(e.localStore,r),a=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Wx(t,e){t.asyncQueue.verifyOperationInProgress();let n=await sF(t);Q(js,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(a=>zx(e.remoteStore,a)),t.setAppCheckTokenChangeListener((a,r)=>zx(e.remoteStore,r)),t._onlineComponents=e}async function sF(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){Q(js,"Using user provided OfflineComponentProvider");try{await y_(t,t._uninitializedComponentsProvider._offline)}catch(e){let n=e;if(!function(r){return r.name==="FirebaseError"?r.code===q.FAILED_PRECONDITION||r.code===q.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(n))throw n;Gr("Error using user provided cache. Falling back to memory cache: "+n),await y_(t,new Bi)}}else Q(js,"Using default OfflineComponentProvider"),await y_(t,new Tp(void 0));return t._offlineComponents}async function iF(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(Q(js,"Using user provided OnlineComponentProvider"),await Wx(t,t._uninitializedComponentsProvider._online)):(Q(js,"Using default OnlineComponentProvider"),await Wx(t,new Iu))),t._onlineComponents}async function oF(t){let e=await iF(t),n=e.eventManager;return n.onListen=QV.bind(null,e.syncEngine),n.onUnlisten=ZV.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=$V.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=eF.bind(null,e.syncEngine),n}function fR(t,e,n={}){let a=new qr;return t.asyncQueue.enqueueAndForget(async()=>function(s,i,u,l,c){let f=new MS({next:m=>{f.Nu(),i.enqueueAndForget(()=>WV(s,p)),m.fromCache&&l.source==="server"?c.reject(new X(q.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(m)},error:m=>c.reject(m)}),p=new xS(u,f,{includeMetadataChanges:!0,Ka:!0});return KV(s,p)}(await oF(t),t.asyncQueue,e,n,a)),a.promise}function hR(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var uF="ComponentProvider",Xx=new Map;function lF(t,e,n,a,r){return new T_(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,hR(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,a)}var pR="firestore.googleapis.com",Yx=!0,bp=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new X(q.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=pR,this.ssl=Yx}else this.host=e.host,this.ssl=e.ssl??Yx;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=eR;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<RV)throw new X(q.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}e0("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=hR(e.experimentalLongPollingOptions??{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new X(q.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new X(q.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new X(q.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(a,r){return a.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},Fc=class{constructor(e,n,a,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=a,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new bp({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new X(q.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new X(q.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new bp(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(a){if(!a)return new Jh;switch(a.type){case"firstParty":return new S_(a.sessionIndex||"0",a.iamToken||null,a.authTokenFactory||null);case"provider":return a.client;default:throw new X(q.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){let a=Xx.get(n);a&&(Q(uF,"Removing Datastore"),Xx.delete(n),a.terminate())}(this),Promise.resolve()}};function mR(t,e,n,a={}){t=zc(t,Fc);let r=Ga(e),s=t._getSettings(),i={...s,emulatorOptions:t._getEmulatorOptions()},u=`${e}:${n}`;r&&(Ho(`https://${u}`),Go("Firestore",!0)),s.host!==pR&&s.host!==u&&Gr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...s,host:u,ssl:r,emulatorOptions:a};if(!Ea(l,i)&&(t._setSettings(l),a.mockUserToken)){let c,f;if(typeof a.mockUserToken=="string")c=a.mockUserToken,f=un.MOCK_USER;else{c=oh(a.mockUserToken,t._app?.options.projectId);let p=a.mockUserToken.sub||a.mockUserToken.user_id;if(!p)throw new X(q.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new un(p)}t._authCredentials=new I_(new $h(c,f))}}var wa=class t{constructor(e,n,a){this.converter=n,this._query=a,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},Vn=class t{constructor(e,n,a){this.converter=n,this._key=a,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ni(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,a){if(Eu(n,t._jsonSchema))return new t(e,a||null,new te(ct.fromString(n.referencePath)))}};Vn._jsonSchemaVersion="firestore/documentReference/1.0",Vn._jsonSchema={type:Dt("string",Vn._jsonSchemaVersion),referencePath:Dt("string")};var Ni=class t extends wa{constructor(e,n,a){super(e,n,jS(a)),this._path=a,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new Vn(this.firestore,null,new te(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function Xc(t,e,...n){if(t=sn(t),R2("collection","path",e),t instanceof Fc){let a=ct.fromString(e,...n);return px(a),new Ni(t,null,a)}{if(!(t instanceof Vn||t instanceof Ni))throw new X(q.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let a=t._path.child(ct.fromString(e,...n));return px(a),new Ni(t.firestore,null,a)}}var Qx="AsyncQueue",wp=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new _p(this,"async_queue_retry"),this._c=()=>{let a=g_();a&&Q(Qx,"Visibility state changed to "+a.visibilityState),this.M_.w_()},this.ac=e;let n=g_();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let n=g_();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let n=new qr;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!Tu(e))throw e;Q(Qx,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let n=this.ac.then(()=>(this.rc=!0,e().catch(a=>{throw this.nc=a,this.rc=!1,Hr("INTERNAL UNHANDLED ERROR: ",$x(a)),a}).then(a=>(this.rc=!1,a))));return this.ac=n,n}enqueueAfterDelay(e,n,a){this.uc(),this.oc.indexOf(e)>-1&&(n=0);let r=wS.createAndSchedule(this,e,n,a,s=>this.hc(s));return this.tc.push(r),r}uc(){this.nc&&oe(47125,{Pc:$x(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,a)=>n.targetTimeMs-a.targetTimeMs);for(let n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let n=this.tc.indexOf(e);this.tc.splice(n,1)}};function $x(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var _u=class extends Fc{constructor(e,n,a,r){super(e,n,a,r),this.type="firestore",this._queue=new wp,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new wp(e),this._firestoreClient=void 0,await e}}};function tv(t,e){let n=typeof t=="object"?t:Xo(),a=typeof t=="string"?t:e||ip,r=bi(n,"firestore").getImmediate({identifier:a});if(!r._initialized){let s=ih("firestore");s&&mR(r,...s)}return r}function nv(t){if(t._terminated)throw new X(q.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||cF(t),t._firestoreClient}function cF(t){let e=t._freezeSettings(),n=lF(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new NS(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(r){let s=r?._online.build();return{_offline:r?._offline.build(s),_online:s}}(t._componentsProvider))}var er=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(gn.fromBase64String(e))}catch(n){throw new X(q.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new t(gn.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Eu(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};er._jsonSchemaVersion="firestore/bytes/1.0",er._jsonSchema={type:Dt("string",er._jsonSchemaVersion),bytes:Dt("string")};var Su=class{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new X(q.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ea(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var Uc=class{constructor(e){this._methodName=e}};var zr=class t{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new X(q.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new X(q.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return xe(this._lat,e._lat)||xe(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(Eu(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};zr._jsonSchemaVersion="firestore/geoPoint/1.0",zr._jsonSchema={type:Dt("string",zr._jsonSchemaVersion),latitude:Dt("number"),longitude:Dt("number")};var tr=class t{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(a,r){if(a.length!==r.length)return!1;for(let s=0;s<a.length;++s)if(a[s]!==r[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Eu(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new t(e.vectorValues);throw new X(q.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};tr._jsonSchemaVersion="firestore/vectorValue/1.0",tr._jsonSchema={type:Dt("string",tr._jsonSchemaVersion),vectorValues:Dt("object")};var dF=/^__.*__$/;function gR(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw oe(40011,{dataSource:t})}}var VS=class t{constructor(e,n,a,r,s,i){this.settings=e,this.databaseId=n,this.serializer=a,this.ignoreUndefinedProperties=r,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePathSegment(e),a}childContextForFieldPath(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePath(),a}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Cp(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(gR(this.dataSource)&&dF.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},FS=class{constructor(e,n,a){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=a||jc(e)}createContext(e,n,a,r=!1){return new VS({dataSource:e,methodName:n,targetDoc:a,path:ea.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function av(t){let e=t._freezeSettings(),n=jc(t._databaseId);return new FS(t._databaseId,!!e.ignoreUndefinedProperties,n)}function rv(t,e,n,a=!1){return sv(n,t.createContext(a?4:3,e))}function sv(t,e){if(yR(t=sn(t)))return hF("Unsupported field value:",e,t),fF(t,e);if(t instanceof Uc)return function(a,r){if(!gR(r.dataSource))throw r.createError(`${a._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${a._methodName}() is not currently supported inside arrays`);let s=a._toFieldTransform(r);s&&r.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(a,r){let s=[],i=0;for(let u of a){let l=sv(u,r.childContextForArray(i));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),i++}return{arrayValue:{values:s}}}(t,e)}return function(a,r){if((a=sn(a))===null)return{nullValue:"NULL_VALUE"};if(typeof a=="number")return lV(r.serializer,a);if(typeof a=="boolean")return{booleanValue:a};if(typeof a=="string")return{stringValue:a};if(a instanceof Date){let s=zt.fromDate(a);return{timestampValue:H_(r.serializer,s)}}if(a instanceof zt){let s=new zt(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:H_(r.serializer,s)}}if(a instanceof zr)return{geoPointValue:{latitude:a.latitude,longitude:a.longitude}};if(a instanceof er)return{bytesValue:G0(r.serializer,a._byteString)};if(a instanceof Vn){let s=r.databaseId,i=a.firestore._databaseId;if(!i.isEqual(s))throw r.createError(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:j0(a.firestore._databaseId||r.databaseId,a._key.path)}}if(a instanceof tr)return function(i,u){let l=i instanceof tr?i.toArray():i;return{mapValue:{fields:{[BS]:{stringValue:qS},[cu]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw u.createError("VectorValues must only contain numeric values.");return KS(u.serializer,f)})}}}}}}(a,r);if(J0(a))return a._toProto(r.serializer);throw r.createError(`Unsupported field value: ${qc(a)}`)}(t,e)}function fF(t,e){let n={};return y0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):bu(t,(a,r)=>{let s=sv(r,e.childContextForField(a));s!=null&&(n[a]=s)}),{mapValue:{fields:n}}}function yR(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof zt||t instanceof zr||t instanceof er||t instanceof Vn||t instanceof Uc||t instanceof tr||J0(t))}function hF(t,e,n){if(!yR(n)||!t0(n)){let a=qc(n);throw a==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+a)}}function Yc(t,e,n){if((e=sn(e))instanceof Su)return e._internalPath;if(typeof e=="string")return IR(t,e);throw Cp("Field path arguments must be of type string or ",t,!1,void 0,n)}var pF=new RegExp("[~\\*/\\[\\]]");function IR(t,e,n){if(e.search(pF)>=0)throw Cp(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Su(...e.split("."))._internalPath}catch{throw Cp(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Cp(t,e,n,a,r){let s=a&&!a.isEmpty(),i=r!==void 0,u=`Function ${e}() called with invalid data`;n&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(s||i)&&(l+=" (found",s&&(l+=` in field ${a}`),i&&(l+=` in document ${r}`),l+=")"),new X(q.INVALID_ARGUMENT,u+t+l)}var Bc=class{convertValue(e,n="none"){switch(zs(e)){case 0:return null;case 1:return e.booleanValue;case 2:return lt(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Kr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw oe(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){let a={};return bu(e,(r,s)=>{a[r]=this.convertValue(s,n)}),a}convertVectorValue(e){let n=e.fields?.[cu].arrayValue?.values?.map(a=>lt(a.doubleValue));return new tr(n)}convertGeoPoint(e){return new zr(lt(e.latitude),lt(e.longitude))}convertArray(e,n){return(e.values||[]).map(a=>this.convertValue(a,n))}convertServerTimestamp(e,n){switch(n){case"previous":let a=Rp(e);return a==null?null:this.convertValue(a,n);case"estimate":return this.convertTimestamp(wc(e));default:return null}}convertTimestamp(e){let n=jr(e);return new zt(n.seconds,n.nanos)}convertDocumentKey(e,n){let a=ct.fromString(e);mt($0(a),9688,{name:e});let r=new Cc(a.get(1),a.get(3)),s=new te(a.popFirst(5));return r.isEqual(n)||Hr(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}};var Lp=class extends Bc{constructor(e){super(),this.firestore=e}convertBytes(e){return new er(e)}convertReference(e){let n=this.convertDocumentKey(e,this.firestore._databaseId);return new Vn(this.firestore,null,n)}};var _R="@firebase/firestore",SR="4.12.0";var Qc=class{constructor(e,n,a,r,s){this._firestore=e,this._userDataWriter=n,this._key=a,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Vn(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new iv(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let n=this._document.data.field(Yc("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}},iv=class extends Qc{data(){return super.data()}};function IF(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new X(q.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var $c=class{},Ru=class extends $c{};function Jc(t,e,...n){let a=[];e instanceof $c&&a.push(e),a=a.concat(n),function(s){let i=s.filter(l=>l instanceof ov).length,u=s.filter(l=>l instanceof Np).length;if(i>1||i>0&&u>0)throw new X(q.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(a);for(let r of a)t=r._apply(t);return t}var Np=class t extends Ru{constructor(e,n,a){super(),this._field=e,this._op=n,this._value=a,this.type="where"}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=this._parse(e);return wR(e._query,n),new wa(e.firestore,e.converter,Dp(e._query,n))}_parse(e){let n=av(e.firestore);return function(s,i,u,l,c,f,p){let m;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new X(q.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){ER(p,f);let R=[];for(let D of p)R.push(vR(l,s,D));m={arrayValue:{values:R}}}else m=vR(l,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||ER(p,f),m=rv(u,i,p,f==="in"||f==="not-in");return kt.create(c,f,m)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}};function Zc(t,e,n){let a=e,r=Yc("where",t);return Np._create(r,a,n)}var ov=class t extends $c{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new t(e,n)}_parse(e){let n=this._queryConstraints.map(a=>a._parse(e)).filter(a=>a.getFilters().length>0);return n.length===1?n[0]:ma.create(n,this._getOperator())}_apply(e){let n=this._parse(e);return n.getFilters().length===0?e:(function(r,s){let i=r,u=s.getFlattenedFilters();for(let l of u)wR(i,l),i=Dp(i,l)}(e._query,n),new wa(e.firestore,e.converter,Dp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var uv=class t extends Ru{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new t(e,n)}_apply(e){let n=function(r,s,i){if(r.startAt!==null)throw new X(q.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new X(q.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Hs(s,i)}(e._query,this._field,this._direction);return new wa(e.firestore,e.converter,k0(e._query,n))}};function ed(t,e="asc"){let n=e,a=Yc("orderBy",t);return uv._create(a,n)}var lv=class t extends Ru{constructor(e,n,a){super(),this.type=e,this._limit=n,this._limitType=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){return new wa(e.firestore,e.converter,Ac(e._query,this._limit,this._limitType))}};function td(t){return n0("limit",t),lv._create("limit",t,"F")}var cv=class t extends Ru{constructor(e,n,a){super(),this.type=e,this._docOrFields=n,this._inclusive=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=_F(e,this.type,this._docOrFields,this._inclusive);return new wa(e.firestore,e.converter,D0(e._query,n))}};function bR(...t){return cv._create("startAfter",t,!1)}function _F(t,e,n,a){if(n[0]=sn(n[0]),n[0]instanceof Qc)return function(s,i,u,l,c){if(!l)throw new X(q.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);let f=[];for(let p of Mi(s))if(p.field.isKeyField())f.push(Gc(i,l.key));else{let m=l.data.field(p.field);if(Hc(m))throw new X(q.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+p.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(m===null){let S=p.field.canonicalString();throw new X(q.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${S}' (used as the orderBy) does not exist.`)}f.push(m)}return new Wr(f,c)}(t._query,t.firestore._databaseId,e,n[0]._document,a);{let r=av(t.firestore);return function(i,u,l,c,f,p){let m=i.explicitOrderBy;if(f.length>m.length)throw new X(q.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let S=[];for(let R=0;R<f.length;R++){let D=f[R];if(m[R].field.isKeyField()){if(typeof D!="string")throw new X(q.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof D}`);if(!kp(i)&&D.indexOf("/")!==-1)throw new X(q.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${D}' contains a slash.`);let L=i.path.child(ct.fromString(D));if(!te.isDocumentKey(L))throw new X(q.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${L}' is not because it contains an odd number of segments.`);let E=new te(L);S.push(Gc(u,E))}else{let L=rv(l,c,D);S.push(L)}}return new Wr(S,p)}(t._query,t.firestore._databaseId,r,e,n,a)}}function vR(t,e,n){if(typeof(n=sn(n))=="string"){if(n==="")throw new X(q.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!kp(e)&&n.indexOf("/")!==-1)throw new X(q.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);let a=e.path.child(ct.fromString(n));if(!te.isDocumentKey(a))throw new X(q.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${a}' is not because it has an odd number of segments (${a.length}).`);return Gc(t,new te(a))}if(n instanceof Vn)return Gc(t,n._key);throw new X(q.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${qc(n)}.`)}function ER(t,e){if(!Array.isArray(t)||t.length===0)throw new X(q.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function wR(t,e){let n=function(r,s){for(let i of r)for(let u of i.getFlattenedFilters())if(s.indexOf(u.op)>=0)return u.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new X(q.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new X(q.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}var Cu=class{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},Lu=class t extends Qc{constructor(e,n,a,r,s,i){super(e,n,a,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let n=new Au(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){let a=this._document.data.field(Yc("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new X(q.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,n={};return n.type=t._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}};Lu._jsonSchemaVersion="firestore/documentSnapshot/1.0",Lu._jsonSchema={type:Dt("string",Lu._jsonSchemaVersion),bundleSource:Dt("string","DocumentSnapshot"),bundleName:Dt("string"),bundle:Dt("string")};var Au=class extends Lu{data(e={}){return super.data(e)}},xu=class t{constructor(e,n,a,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new Cu(r.hasPendingWrites,r.fromCache),this.query=a}get docs(){let e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(a=>{e.call(n,new Au(this._firestore,this._userDataWriter,a.key,a,new Cu(this._snapshot.mutatedKeys.has(a.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new X(q.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(r,s){if(r._snapshot.oldDocs.isEmpty()){let i=0;return r._snapshot.docChanges.map(u=>{let l=new Au(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Cu(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:i++}})}{let i=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(u=>s||u.type!==3).map(u=>{let l=new Au(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Cu(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter),c=-1,f=-1;return u.type!==0&&(c=i.indexOf(u.doc.key),i=i.delete(u.doc.key)),u.type!==1&&(i=i.add(u.doc),f=i.indexOf(u.doc.key)),{type:SF(u.type),doc:l,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new X(q.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=ou.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let n=[],a=[],r=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),a.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),r.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function SF(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return oe(61501,{type:t})}}xu._jsonSchemaVersion="firestore/querySnapshot/1.0",xu._jsonSchema={type:Dt("string",xu._jsonSchemaVersion),bundleSource:Dt("string","QuerySnapshot"),bundleName:Dt("string"),bundle:Dt("string")};function Fp(t){t=zc(t,wa);let e=zc(t.firestore,_u),n=nv(e),a=new Lp(e);return IF(t._query),fR(n,t._query).then(r=>new xu(e,a,t,r))}(function(e,n=!0){Jx(Wa),Ka(new On("firestore",(a,{instanceIdentifier:r,options:s})=>{let i=a.getProvider("app").getImmediate(),u=new _u(new Zh(a.getProvider("auth-internal")),new tp(i,a.getProvider("app-check-internal")),E0(i,r),i);return s={useFetchStreams:n,...s},u._setSettings(s),u},"PUBLIC").setMultipleInstances(!0)),Mn(_R,SR,e),Mn(_R,SR,"esm2020")})();var kR="firebasestorage.googleapis.com",vF="storageBucket",EF=2*60*1e3,TF=10*60*1e3;var ar=class t extends wn{constructor(e,n,a=0){super(fv(e),`Firebase Storage: ${n} (${fv(e)})`),this.status_=a,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return fv(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},rr;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(rr||(rr={}));function fv(t){return"storage/"+t}function bF(){let t="An unknown error occurred, please check the error payload for server response.";return new ar(rr.UNKNOWN,t)}function wF(){return new ar(rr.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function CF(){return new ar(rr.CANCELED,"User canceled the upload/download.")}function LF(t){return new ar(rr.INVALID_URL,"Invalid URL '"+t+"'.")}function AF(t){return new ar(rr.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function CR(t){return new ar(rr.INVALID_ARGUMENT,t)}function DR(){return new ar(rr.APP_DELETED,"The Firebase app was deleted.")}function xF(t){return new ar(rr.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}var Qr=class t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let a;try{a=t.makeFromUrl(e,n)}catch{return new t(e,"")}if(a.path==="")return a;throw AF(e)}static makeFromUrl(e,n){let a=null,r="([A-Za-z0-9.\\-_]+)";function s(x){x.path.charAt(x.path.length-1)==="/"&&(x.path_=x.path_.slice(0,-1))}let i="(/(.*))?$",u=new RegExp("^gs://"+r+i,"i"),l={bucket:1,path:3};function c(x){x.path_=decodeURIComponent(x.path)}let f="v[A-Za-z0-9_]+",p=n.replace(/[.]/g,"\\."),m="(/([^?#]*).*)?$",S=new RegExp(`^https?://${p}/${f}/b/${r}/o${m}`,"i"),R={bucket:1,path:3},D=n===kR?"(?:storage.googleapis.com|storage.cloud.google.com)":n,L="([^?#]*)",E=new RegExp(`^https?://${D}/${r}/${L}`,"i"),C=[{regex:u,indices:l,postModify:s},{regex:S,indices:R,postModify:c},{regex:E,indices:{bucket:1,path:2},postModify:c}];for(let x=0;x<C.length;x++){let G=C[x],z=G.regex.exec(e);if(z){let I=z[G.indices.bucket],y=z[G.indices.path];y||(y=""),a=new t(I,y),G.postModify(a);break}}if(a==null)throw LF(e);return a}},hv=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function RF(t,e,n){let a=1,r=null,s=null,i=!1,u=0;function l(){return u===2}let c=!1;function f(...L){c||(c=!0,e.apply(null,L))}function p(L){r=setTimeout(()=>{r=null,t(S,l())},L)}function m(){s&&clearTimeout(s)}function S(L,...E){if(c){m();return}if(L){m(),f.call(null,L,...E);return}if(l()||i){m(),f.call(null,L,...E);return}a<64&&(a*=2);let C;u===1?(u=2,C=0):C=(a+Math.random())*1e3,p(C)}let R=!1;function D(L){R||(R=!0,m(),!c&&(r!==null?(L||(u=2),clearTimeout(r),p(0)):L||(u=1)))}return p(0),s=setTimeout(()=>{i=!0,D(!0)},n),D}function kF(t){t(!1)}function DF(t){return t!==void 0}function LR(t,e,n,a){if(a<e)throw CR(`Invalid value for '${t}'. Expected ${e} or greater.`);if(a>n)throw CR(`Invalid value for '${t}'. Expected ${n} or less.`)}function PF(t){let e=encodeURIComponent,n="?";for(let a in t)if(t.hasOwnProperty(a)){let r=e(a)+"="+e(t[a]);n=n+r+"&"}return n=n.slice(0,-1),n}var Up;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Up||(Up={}));function OF(t,e){let n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return n||r||s}var pv=class{constructor(e,n,a,r,s,i,u,l,c,f,p,m=!0,S=!1){this.url_=e,this.method_=n,this.headers_=a,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=i,this.callback_=u,this.errorCallback_=l,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=p,this.retry=m,this.isUsingEmulator=S,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,D)=>{this.resolve_=R,this.reject_=D,this.start_()})}start_(){let e=(a,r)=>{if(r){a(!1,new ku(!1,null,!0));return}let s=this.connectionFactory_();this.pendingConnection_=s;let i=u=>{let l=u.loaded,c=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,c)};this.progressCallback_!==null&&s.addUploadProgressListener(i),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(i),this.pendingConnection_=null;let u=s.getErrorCode()===Up.NO_ERROR,l=s.getStatus();if(!u||OF(l,this.additionalRetryCodes_)&&this.retry){let f=s.getErrorCode()===Up.ABORT;a(!1,new ku(!1,null,f));return}let c=this.successCodes_.indexOf(l)!==-1;a(!0,new ku(c,s))})},n=(a,r)=>{let s=this.resolve_,i=this.reject_,u=r.connection;if(r.wasSuccessCode)try{let l=this.callback_(u,u.getResponse());DF(l)?s(l):s()}catch(l){i(l)}else if(u!==null){let l=bF();l.serverResponse=u.getErrorText(),this.errorCallback_?i(this.errorCallback_(u,l)):i(l)}else if(r.canceled){let l=this.appDelete_?DR():CF();i(l)}else{let l=wF();i(l)}};this.canceled_?n(!1,new ku(!1,null,!0)):this.backoffId_=RF(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&kF(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},ku=class{constructor(e,n,a){this.wasSuccessCode=e,this.connection=n,this.canceled=!!a}};function MF(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function NF(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function VF(t,e){e&&(t["X-Firebase-GMPID"]=e)}function FF(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function UF(t,e,n,a,r,s,i=!0,u=!1){let l=PF(t.urlParams),c=t.url+l,f=Object.assign({},t.headers);return VF(f,e),MF(f,n),NF(f,s),FF(f,a),new pv(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,i,u)}function BF(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function qF(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}var U6=256*1024;var mv=class t{constructor(e,n){this._service=e,n instanceof Qr?this._location=n:this._location=Qr.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new t(e,n)}get root(){let e=new Qr(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return qF(this._location.path)}get storage(){return this._service}get parent(){let e=BF(this._location.path);if(e===null)return null;let n=new Qr(this._location.bucket,e);return new t(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw xF(e)}};function AR(t,e){let n=e?.[vF];return n==null?null:Qr.makeFromBucketSpec(n,t)}function zF(t,e,n,a={}){t.host=`${e}:${n}`;let r=Ga(e);r&&(Ho(`https://${t.host}/b`),Go("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:s}=a;s&&(t._overrideAuthToken=typeof s=="string"?s:oh(s,t.app.options.projectId))}var gv=class{constructor(e,n,a,r,s,i=!1){this.app=e,this._authProvider=n,this._appCheckProvider=a,this._url=r,this._firebaseVersion=s,this._isUsingEmulator=i,this._bucket=null,this._host=kR,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=EF,this._maxUploadRetryTime=TF,this._requests=new Set,r!=null?this._bucket=Qr.makeFromBucketSpec(r,this._host):this._bucket=AR(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Qr.makeFromBucketSpec(this._url,e):this._bucket=AR(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){LR("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){LR("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Nn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new mv(this,e)}_makeRequest(e,n,a,r,s=!0){if(this._deleted)return new hv(DR());{let i=UF(e,this._appId,a,r,n,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(e,n){let[a,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,a,r).getPromise()}},xR="@firebase/storage",RR="0.14.1";var PR="storage";function OR(t=Xo(),e){t=sn(t);let a=bi(t,PR).getImmediate({identifier:e}),r=ih("storage");return r&&HF(a,...r),a}function HF(t,e,n,a={}){zF(t,e,n,a)}function GF(t,{instanceIdentifier:e}){let n=t.getProvider("app").getImmediate(),a=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new gv(n,a,r,e,Wa)}function jF(){Ka(new On(PR,GF,"PUBLIC").setMultipleInstances(!0)),Mn(xR,RR,""),Mn(xR,RR,"esm2020")}jF();var MR={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var yv=AI(MR),NR=s_(yv),Bp=tv(yv),Y6=OR(yv);var Iv=null,_v=null;async function KF(t){let e=Date.now();if(Iv&&_v&&e<_v)return Iv;let n=await t.getIdToken(),a=await t.getIdTokenResult();return Iv=n,_v=a.expirationTime?new Date(a.expirationTime).getTime()-6e4:e+6e4,n}function WF(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let n=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return n.startsWith("http")?t:e+n}var XF=25e3;async function VR(t,e={}){let n=NR.currentUser;if(!n)throw new Error("User not authenticated");let a=await KF(n),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${a}`);let s=e.timeout!==void 0?e.timeout:XF,{timeout:i,...u}=e,l=u.signal,c=null,f=null;s>0&&(c=new AbortController,f=setTimeout(()=>{console.warn("[authFetch] Request exceeded timeout threshold:",s,"ms"),c.abort()},s),l=u.signal?(()=>{let p=new AbortController;return u.signal?.addEventListener("abort",()=>{clearTimeout(f),p.abort()}),c.signal.addEventListener("abort",()=>p.abort()),p.signal})():c.signal);try{let p=await fetch(WF(t),{...u,headers:r,signal:l??u.signal});return f&&clearTimeout(f),p}catch(p){throw f&&clearTimeout(f),p instanceof Error&&p.name==="AbortError"&&c?.signal.aborted?new Error("Request timed out"):p}}var Sv=null;function YF(){if(typeof window>"u")return null;if(!Sv)try{Sv=new AudioContext}catch{return null}return Sv}function FR(){let t=YF();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(400,e+.02),n.type="sine",a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.05),n.start(e),n.stop(e+.05)}var F=Ce(Hn());var QF=typeof process<"u"&&!1;function qp(t,e){if(QF&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var ZF=20;function eU(t){let e=t.data(),n=e.status??"open",a=e.isResolved===!0||n==="resolved"||n==="done",r=n==="skipped";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:a,isSkipped:r||void 0,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null,clarityScore:e.clarityScore??null,clarityStatus:e.clarityStatus??null,clarityIssues:e.clarityIssues??null,clarityConfidence:e.clarityConfidence??null,clarityCheckedAt:e.clarityCheckedAt??null}}async function zR(t,e=ZF,n){qp(e,"getSessionFeedbackPageRepo");let a=Xc(Bp,"feedback"),r=n!=null?Jc(a,Zc("sessionId","==",t),ed("createdAt","desc"),td(e),bR(n)):Jc(a,Zc("sessionId","==",t),ed("createdAt","desc"),td(e)),s=Date.now(),i=await Fp(r),u=Date.now()-s;console.log(`[FIRESTORE] query duration: ${u}ms`);let l=i.docs,c=l.map(eU),f=l.length>0?l[l.length-1]:null,p=l.length===e;return{feedback:c,lastVisibleDoc:f,hasMore:p}}async function HR(t,e=50){let{feedback:n}=await zR(t,e);return n}var GR=new Set(["script","style","noscript","iframe","svg"]);function Ht(t){if(!t)return!1;let e=t instanceof Element?t:t.parentElement;if(!e)return!1;let n=t instanceof Element?t:e;if(n.id&&String(n.id).toLowerCase().startsWith("echly"))return!0;let a=n.className;if(a&&typeof a=="string"&&a.includes("echly")||n instanceof Element&&n.getAttribute?.("data-echly-ui")!=null||n instanceof Element&&n.closest?.("[data-echly-ui]"))return!0;let r=n.getRootNode?.();return!!(r&&r instanceof ShadowRoot&&Ht(r.host))}function zp(t){if(!(t instanceof HTMLElement)||t.getAttribute?.("aria-hidden")==="true")return!0;let e=t.ownerDocument?.defaultView?.getComputedStyle?.(t);return e?e.display==="none"||e.visibility==="hidden":!1}function nU(t){if(!t?.getRootNode||Ht(t))return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let n=[],a=t;for(;a&&a!==e.body&&n.length<12;){let s=a.tagName.toLowerCase(),i=a.id?.trim();if(i&&/^[a-zA-Z][\w-]*$/.test(i)&&!i.includes(" ")){s+=`#${i}`,n.unshift(s);break}let u=a.getAttribute?.("class")?.trim();if(u){let p=u.split(/\s+/).find(m=>m.length>0&&/^[a-zA-Z_][\w-]*$/.test(m));p&&(s+=`.${p}`)}let l=a.parentElement;if(!l)break;let c=l.children,f=0;for(let p=0;p<c.length;p++)if(c[p]===a){f=p+1;break}s+=`:nth-child(${f})`,n.unshift(s),a=l}return n.length===0?null:n.join(" > ")}function aU(t){if(!t||Ht(t))return null;let e=[],n=t.ownerDocument.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode(i){let u=i.parentElement;if(!u||Ht(u))return NodeFilter.FILTER_REJECT;let l=u.getRootNode?.();if(l&&l instanceof ShadowRoot&&Ht(l.host))return NodeFilter.FILTER_REJECT;let c=u.tagName.toLowerCase();return GR.has(c)||zp(u)?NodeFilter.FILTER_REJECT:(i.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),a=0,r=n.nextNode();for(;r&&a<2e3;){let i=(r.textContent??"").trim();if(i.length>0){let u=i.slice(0,2e3-a);e.push(u),a+=u.length}r=n.nextNode()}return e.length===0?null:e.join(" ").replace(/\s+/g," ").trim().slice(0,2e3)||null}function rU(t){if(!t||Ht(t))return null;let e=[];function n(i){if(!i||Ht(i)||zp(i))return;let l=(i.innerText??i.textContent??"").replace(/\s+/g," ").trim().slice(0,200);l.length>0&&e.push(l)}let a=t.getAttribute?.("aria-label")||t.placeholder||(t.innerText??t.textContent??"").trim();a&&e.push(String(a).slice(0,120));let r=t.parentElement;if(r&&!Ht(r)&&!zp(r)&&n(r),r)for(let i=0;i<r.children.length;i++){let u=r.children[i];u!==t&&!Ht(u)&&n(u)}for(let i=0;i<t.children.length;i++)Ht(t.children[i])||n(t.children[i]);let s=e.filter(Boolean).join(" ").replace(/\s+/g," ").trim();return s?s.length>800?s.slice(0,800)+"\u2026":s:null}function sU(t){if(!t?.document?.body)return null;let e=t.document,n=e.body,a=[],r=e.createTreeWalker(n,NodeFilter.SHOW_TEXT,{acceptNode(l){let c=l.parentElement;if(!c||Ht(c))return NodeFilter.FILTER_REJECT;let f=c.getRootNode?.();if(f&&f instanceof ShadowRoot&&Ht(f.host))return NodeFilter.FILTER_REJECT;let p=c.tagName.toLowerCase();if(GR.has(p)||zp(c))return NodeFilter.FILTER_REJECT;let m=c.getBoundingClientRect?.();return m&&(m.top>=t.innerHeight||m.bottom<=0||m.left>=t.innerWidth||m.right<=0)?NodeFilter.FILTER_REJECT:(l.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),s=0,i=r.nextNode();for(;i&&s<1500;){let l=(i.textContent??"").trim();if(l.length>0){let c=l.slice(0,1500-s);a.push(c),s+=c.length}i=r.nextNode()}return a.length===0?null:a.join(" ").replace(/\s+/g," ").trim().slice(0,1500)||null}function sr(t,e){try{typeof console<"u"&&console.log&&console.log(`ECHLY DEBUG \u2014 ${t}`,e)}catch{}}function Hp(t,e){let n=e;for(;n&&Ht(n);)n=n.parentElement;let a=n?nU(n):null,r=n?aU(n):null,s=n?rU(n):null,i=sU(t);if(n&&!Ht(n)&&n!==t.document?.body){if(!r?.trim()){let c=(n.innerText??n.textContent??"").replace(/\s+/g," ").trim().slice(0,2e3)||null;c&&(r=c),r&&sr("SUBTREE TEXT FALLBACK USED","element.innerText")}!s?.trim()&&n.parentElement&&!Ht(n.parentElement)&&(s=(n.parentElement.innerText??n.parentElement.textContent??"").replace(/\s+/g," ").trim().slice(0,800)||null,s&&sr("NEARBY TEXT FALLBACK USED","parent.innerText"))}i?.trim()||sr("VISIBLE TEXT FALLBACK USED","(skipped to avoid Echly UI)");let u={url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:a,nearbyText:s??null,subtreeText:r??null,visibleText:i??null,capturedAt:Date.now()};return sr("DOM PATH",u.domPath??"(none)"),sr("SUBTREE TEXT SIZE",u.subtreeText?.length??0),sr("NEARBY TEXT SIZE",u.nearbyText?.length??0),sr("VISIBLE TEXT SIZE",u.visibleText?.length??0),sr("DOM SCOPE SAMPLE",(u.subtreeText??"").slice(0,200)||"(empty)"),sr("NEARBY SCOPE SAMPLE",(u.nearbyText??"").slice(0,200)||"(empty)"),sr("VISIBLE TEXT SAMPLE",(u.visibleText??"").slice(0,200)||"(empty)"),u}var vv=null;function iU(){if(typeof window>"u")return null;if(!vv)try{vv=new AudioContext}catch{return null}return vv}function Gp(){let t=iU();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(600,e+.04),n.type="sine",a.gain.setValueAtTime(.04,e),a.gain.exponentialRampToValueAtTime(.001,e+.06),n.start(e),n.stop(e+.06)}var oU="[SESSION]";function Ks(t){typeof console<"u"&&console.debug&&console.debug(`${oU} ${t}`)}function jp(t){if(!t||t===document.body||Ht(t))return!1;let e=document.getElementById("echly-shadow-host");if(e&&e.contains(t))return!1;let n=t.tagName?.toLowerCase();if(n==="input"||n==="textarea"||n==="select")return!1;let a=t.getAttribute?.("contenteditable");return!(a==="true"||a==="")}var Yt=Ce(Hn());var $r=Ce(gt()),Du=24,Wp="cubic-bezier(0.22, 0.61, 0.36, 1)";async function Ev(t,e,n){return new Promise((a,r)=>{let s=new Image;s.crossOrigin="anonymous",s.onload=()=>{let i=Math.round(e.x*n),u=Math.round(e.y*n),l=Math.round(e.w*n),c=Math.round(e.h*n),f=document.createElement("canvas");f.width=l,f.height=c;let p=f.getContext("2d");if(!p){r(new Error("No canvas context"));return}p.drawImage(s,i,u,l,c,0,0,l,c);try{a(f.toDataURL("image/png"))}catch(m){r(m)}},s.onerror=()=>r(new Error("Image load failed")),s.src=t})}function XR({getFullTabImage:t,onAddVoice:e,onCancel:n,onSelectionStart:a}){let[r,s]=(0,Yt.useState)(null),[i,u]=(0,Yt.useState)(null),[l,c]=(0,Yt.useState)(!1),[f,p]=(0,Yt.useState)(!1),m=(0,Yt.useRef)(null),S=(0,Yt.useRef)(null),R=(0,Yt.useCallback)(()=>{s(null),u(null),m.current=null,S.current=null,setTimeout(()=>n(),120)},[n]);(0,Yt.useEffect)(()=>{let y=_=>{_.key==="Escape"&&(_.preventDefault(),i?(u(null),s(null),S.current=null,m.current=null):R())};return document.addEventListener("keydown",y),()=>document.removeEventListener("keydown",y)},[R,i]),(0,Yt.useEffect)(()=>{let y=()=>{document.visibilityState==="hidden"&&R()};return document.addEventListener("visibilitychange",y),()=>document.removeEventListener("visibilitychange",y)},[R]);let D=(0,Yt.useCallback)(async y=>{if(l)return;c(!0),Gp(),p(!0),setTimeout(()=>p(!1),150),await new Promise(he=>setTimeout(he,200));let _=null;try{_=await t()}catch{c(!1),n();return}if(!_){c(!1),n();return}let b=typeof window<"u"&&window.devicePixelRatio||1,w;try{w=await Ev(_,y,b)}catch{c(!1),n();return}let A=y.x+y.w/2,T=y.y+y.h/2,de=null;if(typeof document<"u"&&document.elementsFromPoint)for(de=document.elementsFromPoint(A,T).find(M=>!Ht(M))??document.elementFromPoint(A,T)??document.elementFromPoint(y.x+2,y.y+2);de&&Ht(de);)de=de.parentElement;let ee=typeof window<"u"?Hp(window,de):null;e(w,ee),c(!1),u(null)},[t,e,n,l]),L=(0,Yt.useCallback)(()=>{u(null),s(null),S.current=null,m.current=null},[]),E=(0,Yt.useCallback)(y=>{if(y.button!==0||i)return;y.preventDefault(),a?.();let _=y.clientX,b=y.clientY;m.current={x:_,y:b},s({x:_,y:b,w:0,h:0})},[a,i]),v=(0,Yt.useCallback)(y=>{if(y.button!==0)return;y.preventDefault();let _=S.current,b=m.current;if(m.current=null,!b||!_||_.w<Du||_.h<Du){s(null);return}s(null),S.current=null,u({x:_.x,y:_.y,w:_.w,h:_.h})},[]),C=(0,Yt.useCallback)(y=>{if(!m.current||i)return;let _=m.current.x,b=m.current.y,w=Math.min(_,y.clientX),A=Math.min(b,y.clientY),T=Math.abs(y.clientX-_),de=Math.abs(y.clientY-b),ee={x:w,y:A,w:T,h:de};S.current=ee,s(ee)},[i]);(0,Yt.useEffect)(()=>{let y=_=>{if(_.button!==0||!m.current||i)return;let b=S.current,w=m.current;if(m.current=null,!w||!b||b.w<Du||b.h<Du){s(null),S.current=null;return}s(null),S.current=null,u({x:b.x,y:b.y,w:b.w,h:b.h})};return window.addEventListener("mouseup",y),()=>window.removeEventListener("mouseup",y)},[i]);let x=!!r&&(r.w>=Du||r.h>=Du),G=i!==null,z=x&&r||G&&i,I=G?i:r;return(0,$r.jsxs)("div",{id:"echly-overlay",role:"presentation","aria-hidden":!0,className:"echly-region-overlay","data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,$r.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:z?"transparent":"rgba(0,0,0,0.4)",pointerEvents:i?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${Wp}`},onMouseDown:E,onMouseMove:C,onMouseUp:v,onMouseLeave:()=>{!m.current||i||(s(null),m.current=null,S.current=null)}}),(0,$r.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",zIndex:2147483647,pointerEvents:"none",opacity:i?0:1,transition:`opacity 180ms ${Wp}`},children:"Drag to capture area \u2014 ESC to cancel"}),z&&I&&(0,$r.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:I.x,top:I.y,width:Math.max(I.w,1),height:Math.max(I.h,1),border:`2px solid ${f?"#FFFFFF":"#466EFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.4)",pointerEvents:"none",zIndex:2147483646,borderRadius:14,transition:f?"none":`border-color 150ms ${Wp}`}}),G&&i&&(0,$r.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:i.x+i.w/2,bottom:Math.max(12,i.y+i.h-48),transform:"translate(-50%, 100%)",display:"flex",background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${Wp} forwards`},children:[(0,$r.jsx)("button",{type:"button",onClick:L,className:"echly-region-confirm-btn",style:{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",cursor:"pointer"},children:"Retake"}),(0,$r.jsx)("button",{type:"button",onClick:()=>D(i),disabled:l,className:"echly-region-confirm-btn",style:{background:"#466EFF",color:"#fff",fontWeight:600,cursor:l?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var YR=40;function cU(t,e=YR,n,a){let r=t.getBoundingClientRect(),s=n??(typeof window<"u"?window.innerWidth:0),i=a??(typeof window<"u"?window.innerHeight:0),u=Math.max(0,r.left-e),l=Math.max(0,r.top-e),c=s-u,f=i-l,p=Math.min(r.width+e*2,c),m=Math.min(r.height+e*2,f);return{x:u,y:l,w:Math.max(1,p),h:Math.max(1,m)}}async function QR(t,e,n=YR){let a=typeof window<"u"&&window.devicePixelRatio||1,r=cU(e,n);return Ev(t,r,a)}var Tv="[SESSION]",bv=null,Ca=[],Pu=null,Ou=null;function JR(t){let e=t.getBoundingClientRect();return{x:e.left+e.width/2,y:e.top+e.height/2}}function ZR(t,e,n){t.style.left=`${e}px`,t.style.top=`${n}px`,t.style.transform="translate(-50%, -50%)"}function dU(){Pu&&Ou||(Pu=()=>$R(),Ou=()=>$R(),window.addEventListener("scroll",Pu,{passive:!0,capture:!0}),window.addEventListener("resize",Ou))}function ek(){Pu&&(window.removeEventListener("scroll",Pu,{capture:!0}),Pu=null),Ou&&(window.removeEventListener("resize",Ou),Ou=null)}function wv(t,e,n={}){let{onMarkerClick:a,getSessionPaused:r}=n;if(!t)return;let s=document.getElementById("echly-marker-layer");if(!s)return;bv=s;let i=Ca.length+1,u=e.x,l=e.y;if(e.element){let p=JR(e.element);u=p.x,l=p.y}let c=document.createElement("div");c.className="echly-feedback-marker",c.setAttribute("data-echly-ui","true"),c.setAttribute("aria-label",`Feedback ${i}`),c.textContent=String(i),c.title=e.title??`Feedback #${i}`,c.style.cssText=["width:22px","height:22px","border-radius:50%","background:#2563eb","color:white","font-size:12px","font-weight:600","display:flex","align-items:center","justify-content:center","position:fixed","z-index:2147483646","box-shadow:0 4px 12px rgba(0,0,0,0.15)","cursor:pointer","pointer-events:auto","box-sizing:border-box"].join(";"),ZR(c,u,l);let f={...e,x:u,y:l,index:i,domElement:c};Ca.push(f),c.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation(),!r?.()&&(console.log(`${Tv} marker clicked`,f.id),a?.({id:f.id,x:f.x,y:f.y,element:f.element,title:f.title,index:f.index}))}),bv.appendChild(c),Ca.length===1&&dU(),console.log(`${Tv} marker created`,f.id,i)}function Cv(t,e){let n=Ca.find(a=>a.id===t);n&&(e.id!=null&&(n.id=e.id),e.title!=null&&(n.title=e.title),n.domElement.title=n.title??`Feedback #${n.index}`)}function nd(t){let e=Ca.findIndex(a=>a.id===t);if(e===-1)return;Ca[e].domElement.remove(),Ca.splice(e,1),Ca.length===0&&ek()}function $R(){for(let t of Ca)if(t.element&&t.element.isConnected){let{x:e,y:n}=JR(t.element);t.x=e,t.y=n,ZR(t.domElement,e,n)}}function tk(){let t=document.getElementById("echly-marker-layer");if(t)for(;t.firstChild;)t.removeChild(t.firstChild);for(let e of Ca)console.log(`${Tv} marker removed`,e.id);Ca.length=0,bv=null,ek()}function ce(t,e,n){let a=`[ECHLY][${t}]`;n!==void 0?console.log(a,e,n):console.log(a,e)}var Xp=24;var hU="echly-capture-root",rk=120;function pU(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let n=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),a=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(n&&!a)return"negative";if(a&&!n)return"positive";if(n&&a){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,s=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>s?"negative":s>r?"positive":"neutral"}return"neutral"}function Lv(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}async function mU(t){let e=document.getElementById(hU),n=e?.style.display??"";try{return e&&(e.style.display="none",await new Promise(a=>requestAnimationFrame(()=>a()))),await t()}finally{e&&(e.style.display=n)}}var Yp=["focus_mode","region_selecting","voice_listening","processing"];function sk({sessionId:t,extensionMode:e=!1,initialPointers:n,onComplete:a,onDelete:r,onRecordingChange:s,loadSessionWithPointers:i,onSessionLoaded:u,onCreateSession:l,onActiveSessionChange:c,globalSessionModeActive:f,globalSessionPaused:p,onSessionModeStart:m,onSessionModePause:S,onSessionModeResume:R,onSessionModeEnd:D}){let[L,E]=(0,F.useState)([]),[v,C]=(0,F.useState)(null),[x,G]=(0,F.useState)(!1),[z,I]=(0,F.useState)("idle"),[y,_]=(0,F.useState)(null),[b,w]=(0,F.useState)(n??[]),[A,T]=(0,F.useState)(null),[de,ee]=(0,F.useState)(null),[he,M]=(0,F.useState)(""),[O,B]=(0,F.useState)(""),[$,Y]=(0,F.useState)(!1),[re,Je]=(0,F.useState)(null),[Me,Xe]=(0,F.useState)(!1),[dt,ta]=(0,F.useState)(null),[yn,Ze]=(0,F.useState)(0),[N,se]=(0,F.useState)(!0),[ae,ne]=(0,F.useState)(null),[Ie,Pe]=(0,F.useState)(!1),[ft,ht]=(0,F.useState)(!1),[nt,et]=(0,F.useState)(null),[Se,pe]=(0,F.useState)(!1),[qe,ze]=(0,F.useState)(!1),[Oe,bt]=(0,F.useState)(!1),[Ot,wt]=(0,F.useState)(!1),[$t,Ct]=(0,F.useState)(!1),[Jt,Ve]=(0,F.useState)(null),[ts,pt]=(0,F.useState)(!1),Fe=(0,F.useRef)(!1),be=(0,F.useRef)(!1),Lt=(0,F.useRef)(null);(0,F.useEffect)(()=>{Fe.current=qe},[qe]),(0,F.useEffect)(()=>{be.current=Oe},[Oe]);let Fn=(0,F.useRef)({x:0,y:0}),La=(0,F.useRef)(null),Mt=(0,F.useRef)(null),Un=(0,F.useRef)(null),lr=(0,F.useRef)(null),ns=(0,F.useRef)(null),Zt=(0,F.useRef)(L),Aa=(0,F.useRef)(z),At=(0,F.useRef)(!1),cr=(0,F.useRef)(!1),cd=(0,F.useRef)(null),dd=(0,F.useRef)(!1),xa=(0,F.useRef)(null),Mu=(0,F.useRef)(null),Nu=(0,F.useRef)(null),Ra=(0,F.useRef)(null),Xs=(0,F.useRef)(null),Ys=(0,F.useRef)(null),Qs=(0,F.useRef)(null),dr=(0,F.useRef)(null),Vu=(0,F.useRef)(!1);(0,F.useEffect)(()=>{Aa.current=z},[z]),(0,F.useEffect)(()=>(z==="focus_mode"||z==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[z]),(0,F.useEffect)(()=>{if(z!=="voice_listening"){Ra.current!=null&&(cancelAnimationFrame(Ra.current),Ra.current=null),xa.current?.getTracks().forEach(ue=>ue.stop()),xa.current=null,Mu.current?.close().catch(()=>{}),Mu.current=null,Nu.current=null,Ze(0);return}let U=Nu.current;if(!U)return;let j=new Uint8Array(U.frequencyBinCount),K,Z=()=>{U.getByteFrequencyData(j);let ue=j.reduce((we,qn)=>we+qn,0),Ye=j.length?ue/j.length:0,le=Math.min(1,Ye/128);Ze(le),K=requestAnimationFrame(Z)};return K=requestAnimationFrame(Z),Ra.current=K,()=>{cancelAnimationFrame(K),Ra.current=null}},[z]),(0,F.useEffect)(()=>{cd.current=de},[de]),(0,F.useEffect)(()=>{dd.current=Yp.includes(z)},[z]);let na=(0,F.useRef)(!1);(0,F.useEffect)(()=>{if(!s)return;Yp.includes(z)?(na.current=!0,s(!0)):na.current&&(na.current=!1,s(!1))},[z,s]);let Fu=(0,F.useCallback)(U=>{U===!1&&(dd.current||e||Yp.includes(Aa.current)||cd.current)||G(U)},[e]),Uu=(0,F.useCallback)(()=>{G(U=>!U)},[]);(0,F.useEffect)(()=>{ns.current=v},[v]),(0,F.useEffect)(()=>{Zt.current=L},[L]),(0,F.useEffect)(()=>{let U=K=>{if(!Me||!La.current)return;K.preventDefault();let Z=La.current.offsetWidth,ue=La.current.offsetHeight,Ye=K.clientX-Fn.current.x,le=K.clientY-Fn.current.y,we=window.innerWidth-Z-Xp,qn=window.innerHeight-ue-Xp;Ye=Math.max(Xp,Math.min(Ye,we)),le=Math.max(Xp,Math.min(le,qn)),Je({x:Ye,y:le})},j=()=>{Me&&(Xe(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",U),window.addEventListener("mouseup",j),()=>{window.removeEventListener("mousemove",U),window.removeEventListener("mouseup",j)}},[Me]);let zi=(0,F.useCallback)(U=>{if(U.button!==0||!La.current)return;let j=La.current.getBoundingClientRect();Xe(!0),document.body.style.userSelect="none",Fn.current={x:U.clientX-j.left,y:U.clientY-j.top},Je({x:j.left,y:j.top})},[]),ka=(0,F.useCallback)(()=>{if(Mt.current)return;Ve(null);let U=document.createElement("div");U.id="echly-capture-root",document.body.appendChild(U),Mt.current=U,et(U),ht(!0)},[]);(0,F.useEffect)(()=>{let U=document.getElementById("echly-capture-root");if(!U||U.querySelector("#echly-marker-layer"))return;let j=document.createElement("div");j.id="echly-marker-layer",j.style.cssText=["position:fixed","top:0","left:0","width:100%","height:100%","pointer-events:none","z-index:2147483646"].join(";"),U.appendChild(j)},[nt]);let Cn=(0,F.useCallback)(()=>{if(!(e&&f!==!1)){if(Mt.current){try{document.body.removeChild(Mt.current)}catch(U){console.error("CaptureWidget error:",U)}Mt.current=null}et(null),ht(!1)}},[e,f]),ya=(0,F.useCallback)(()=>{I("idle"),G(N)},[N]),fr=(0,F.useCallback)(U=>{let j=U==="pause"?Xs:Ys;j.current!=null&&(window.clearTimeout(j.current),j.current=null)},[]);(0,F.useEffect)(()=>()=>{Xs.current!=null&&window.clearTimeout(Xs.current),Ys.current!=null&&window.clearTimeout(Ys.current)},[]),(0,F.useEffect)(()=>{if(n!=null){w(n);return}if(!t)return;(async()=>{let j=await HR(t);w(j.map(K=>({id:K.id,title:K.title,description:K.description,type:K.type})))})()},[t,n]),(0,F.useEffect)(()=>{let U=window.SpeechRecognition||window.webkitSpeechRecognition;if(!U)return;let j=new U;return j.continuous=!0,j.interimResults=!0,j.lang="en-US",j.onstart=()=>{let K=Date.now();dr.current=K,console.log("[VOICE] recognition.onstart",K);let Z=Qs.current;Z!=null&&console.log("[VOICE] delay UI recording start\u2192onstart:",K-Z,"ms")},j.onspeechstart=()=>{console.log("[VOICE] speech detected",Date.now())},j.onaudiostart=()=>{console.log("[VOICE] audio start",Date.now())},j.onresult=K=>{let Z="";for(let le=0;le<K.results.length;++le){let qn=K.results[le][0];qn&&(Z+=qn.transcript+" ")}Z=Z.replace(/\s+/g," ").trim();let ue=Date.now();if(ce("RECORDING","result",{transcript:Z}),console.log("[VOICE] transcript received",ue,Z),Z&&!Vu.current){Vu.current=!0,console.log("[VOICE] first transcript chunk:",Z,"length:",Z.length);let le=Qs.current,we=dr.current;le!=null&&console.log("[VOICE] delay UI\u2192first transcript:",ue-le,"ms"),we!=null&&console.log("[VOICE] delay onstart\u2192first transcript:",ue-we,"ms")}let Ye=ns.current;Ye&&E(le=>le.map(we=>we.id===Ye?{...we,transcript:Z}:we))},j.onend=()=>{if(!cr.current){ce("RECORDING","unexpected end"),Aa.current==="voice_listening"&&I("idle");return}cr.current=!1;let K=Aa.current;K==="processing"||K==="success"||I("idle")},Un.current=j,()=>{try{j.stop()}catch(K){console.error("CaptureWidget error:",K)}}},[]);let Da=(0,F.useCallback)(async()=>{ce("RECORDING","start");let U=Date.now();Qs.current=U,dr.current=null,Vu.current=!1,console.log("[VOICE] UI recording started",U);try{let j=await navigator.mediaDevices.getUserMedia({audio:!0});xa.current=j;let K=new AudioContext,Z=K.createAnalyser();Z.fftSize=256,Z.smoothingTimeConstant=.7,K.createMediaStreamSource(j).connect(Z),Mu.current=K,Nu.current=Z,console.log("[VOICE] recognition.start() called",Date.now()),Un.current?.start(),I("voice_listening"),Ze(0)}catch(j){console.error("Microphone permission denied:",j),_("Microphone permission denied."),I("error"),Cn(),ya()}},[]),$s=(0,F.useCallback)(async()=>{ce("RECORDING","finish requested"),cr.current=!0,typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),FR(),Un.current?.stop();let U=ns.current;if(!U){I("idle");return}let K=Zt.current.find(Z=>Z.id===U);if(console.log("[VOICE] finishListening transcript:",K?.transcript),!K||!K.transcript||K.transcript.trim().length<5){console.warn("[VOICE] transcript too short, skipping pipeline"),I("idle");return}if(e){if(Fe.current){let ue=Mt.current,Ye=Lt.current??void 0,le=`pending-${Date.now()}`;ue&&wv(ue,{id:le,x:0,y:0,element:Ye,title:"Saving feedback\u2026"},{getSessionPaused:()=>be.current,onMarkerClick:we=>{ne(we.id),T(we.id)}}),Ve(null),pt(!0),E(we=>we.filter(qn=>qn.id!==U)),C(null),I("idle"),Lt.current=null,console.log("[VOICE] final transcript sent to pipeline:",K.transcript);try{At.current=!0,a(K.transcript,K.screenshot,{onSuccess:we=>{At.current=!1,pt(!1),ue&&Cv(le,{id:we.id,title:we.title}),w(qn=>[{id:we.id,title:we.title,description:we.description,type:we.type},...qn]),ne(we.id),setTimeout(()=>ne(null),1200)},onError:()=>{At.current=!1,pt(!1),ue&&nd(le),_("AI processing failed.")}},K.context??void 0,{sessionMode:!0})}catch(we){At.current=!1,pt(!1),ue&&nd(le),console.error(we),_("AI processing failed.")}return}I("processing"),console.log("[VOICE] final transcript sent to pipeline:",K.transcript),At.current=!0,a(K.transcript,K.screenshot,{onSuccess:ue=>{At.current=!1,w(Ye=>[{id:ue.id,title:ue.title,description:ue.description,type:ue.type},...Ye]),E(Ye=>Ye.filter(le=>le.id!==U)),C(null),ne(ue.id),setTimeout(()=>ne(null),1200),pe(!0),setTimeout(()=>pe(!1),200),Pe(!0),setTimeout(()=>{Cn(),ya(),Pe(!1)},120)},onError:()=>{At.current=!1,_("AI processing failed."),I("voice_listening")}},K.context??void 0);return}I("processing"),console.log("[VOICE] final transcript sent to pipeline:",K.transcript);try{let Z=await a(K.transcript,K.screenshot);if(!Z){I("idle"),Cn(),ya();return}w(ue=>[{id:Z.id,title:Z.title,description:Z.description,type:Z.type},...ue]),E(ue=>ue.filter(Ye=>Ye.id!==U)),C(null),ne(Z.id),setTimeout(()=>ne(null),1200),pe(!0),setTimeout(()=>pe(!1),200),Pe(!0),setTimeout(()=>{Cn(),ya(),Pe(!1)},120)}catch(Z){console.error(Z),_("AI processing failed."),I("voice_listening")}},[a,e,Cn,ya]),Js=(0,F.useCallback)(()=>{ce("RECORDING","discard"),Un.current?.stop();let U=ns.current;E(j=>j.filter(K=>K.id!==U)),C(null),I("cancelled"),Cn(),ya()},[Cn,ya]);(0,F.useEffect)(()=>{if(!ft)return;let U=j=>{j.key==="Escape"&&(j.preventDefault(),Yp.includes(Aa.current)&&Js())};return document.addEventListener("keydown",U),()=>document.removeEventListener("keydown",U)},[ft,Js]);let Hi=(0,F.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),as=(0,F.useCallback)(()=>{w([]),E([]),C(null),I("idle"),T(null),ee(null),Y(!1)},[]);(0,F.useEffect)(()=>{if(e)return;let U=j=>{let K=j.target;lr.current&&K&&!lr.current.contains(K)&&Y(!1)};return document.addEventListener("mousedown",U),()=>document.removeEventListener("mousedown",U)},[e]);let Pa=(0,F.useCallback)(async U=>{try{await r(U),w(j=>j.filter(K=>K.id!==U))}catch(j){console.error("Delete failed:",j)}},[r]),Gi=(0,F.useCallback)(U=>{ee(U.id),M(U.title),B(U.description)},[]),fd=(0,F.useCallback)(async U=>{let j=he.trim()||he,K=O;w(Z=>Z.map(ue=>ue.id===U?{...ue,title:j||ue.title,description:K}:ue)),ee(null);try{let Z=await VR(`/api/tickets/${U}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:j||he,description:K})}),ue=await Z.json();if(Z.ok&&ue.success&&ue.ticket){let Ye=ue.ticket;w(le=>le.map(we=>we.id===U?{...we,title:Ye.title,description:Ye.description,type:Ye.type??we.type}:we))}}catch(Z){console.error("Save edit failed:",Z)}},[he,O]),Oa=(0,F.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?mU(()=>new Promise((U,j)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},K=>{!K||!K.success?j(new Error("Capture failed")):U(K.screenshot??null)})})):Promise.resolve(null),[]),Bu=(0,F.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return Oa();let{captureScreenshot:U}=await Promise.resolve().then(()=>(ak(),nk));return U()},[Oa]),qu=(0,F.useCallback)(()=>{I("region_selecting")},[]),ji=(0,F.useCallback)((U,j)=>{let K=Lv(),Z={id:K,screenshot:U,transcript:"",structuredOutput:null,context:j??null,createdAt:Date.now()};E(ue=>[...ue,Z]),C(K),Da()},[Da]),hr=(0,F.useCallback)(()=>{I("cancelled"),Cn(),ya()},[Cn,ya]),zu=(0,F.useCallback)(U=>{let j=ns.current;j&&E(K=>K.map(Z=>Z.id===j?{...Z,transcript:U}:Z))},[]),Hu=(0,F.useCallback)(async()=>{if(!(Aa.current!=="idle"||Fe.current||f)){if(ce("SESSION","start"),console.log("[Echly] Start New Feedback Session clicked"),Ks("start"),e&&l&&c){let U=await l();if(!U?.id)return;c(U.id),w([]),m?.()}Ve(null),pt(!1),wt(!1),Ct(!1)}},[e,l,c,m,f]),Gu=(0,F.useCallback)(()=>{if(!Fe.current&&!f||be.current||Ot||$t)return;ce("SESSION","pause requested");let U=()=>{ce("SESSION","pause finalized"),fr("pause"),Ks("pause"),S?.(),wt(!1)};if(At.current){fr("pause"),wt(!0);let j=()=>{if(At.current){Xs.current=window.setTimeout(j,rk);return}U()};j();return}U()},[fr,$t,f,S,Ot]),hd=(0,F.useCallback)(()=>{!Fe.current&&!f||(ce("SESSION","resume"),wt(!1),Ct(!1),Ks("resume"),R?.())},[f,R]),Ia=(0,F.useCallback)(U=>{if(!Fe.current&&!f||$t)return;ce("SESSION","end requested");let j=()=>{ce("SESSION","end finalized"),fr("end"),Ks("end"),wt(!1),Ct(!1),Ve(null),pt(!1),w([]),D?.(),U?.()};if(At.current){fr("end"),Ct(!0);let K=()=>{if(At.current){Ys.current=window.setTimeout(K,rk);return}j()};K();return}j()},[fr,$t,f,D]);(0,F.useEffect)(()=>{!e||f===void 0||(ce("SESSION","global sync",{active:f,paused:p}),f===!0&&(ze(!0),bt(p??!1),Ve(null),Ct(!1),Mt.current||ka()),p===!0&&(bt(!0),wt(!1)),f===!1&&(ze(!1),bt(!1),wt(!1),Ct(!1),Ve(null),pt(!1),tk(),Cn()))},[e,f,p,ka,Cn]),(0,F.useEffect)(()=>{e&&f&&p!==void 0&&(bt(p),p&&wt(!1))},[e,f,p]),(0,F.useEffect)(()=>{if(!e||f!==!0)return;let U=()=>{document.hidden||!f||Mt.current||(ze(!0),bt(p??!1),Ve(null),Ct(!1),ka())};return document.addEventListener("visibilitychange",U),()=>document.removeEventListener("visibilitychange",U)},[e,f,p,ka]),(0,F.useEffect)(()=>{!e||!i?.sessionId||(w(i.pointers??[]),Ve(null),u?.())},[e,i,u]);let Bn=(0,F.useCallback)(async U=>{if(Jt&&!Mt.current){Ve(null);return}if(!Oa||Jt!=null)return;Ks("element clicked"),Gp();let j=null;try{j=await Oa()}catch{return}if(!j)return;let K;try{K=await QR(j,U)}catch{return}let Z=Hp(window,U);Lt.current=U instanceof HTMLElement?U:null,Ve({screenshot:K,context:Z})},[Oa,Jt]),rs=(0,F.useCallback)(U=>{let j=Jt;if(!j||!U||U.trim().length===0){Ve(null);return}let K=Mt.current,Z=Lt.current??void 0,ue=`pending-${Date.now()}`;K&&wv(K,{id:ue,x:0,y:0,element:Z??void 0,title:"Saving feedback\u2026"},{getSessionPaused:()=>be.current,onMarkerClick:le=>{ne(le.id),T(le.id)}}),Ve(null),pt(!0),I("idle"),Lt.current=null,console.log("[VOICE] final transcript sent to pipeline:",U);try{At.current=!0,a(U,j.screenshot,{onSuccess:le=>{At.current=!1,pt(!1),K&&Cv(ue,{id:le.id,title:le.title}),w(we=>[{id:le.id,title:le.title,description:le.description,type:le.type},...we]),ne(le.id),setTimeout(()=>ne(null),1200)},onError:()=>{At.current=!1,pt(!1),K&&nd(ue),_("AI processing failed.")}},j.context??void 0,{sessionMode:!0})}catch(le){At.current=!1,pt(!1),K&&nd(ue),console.error(le),_("AI processing failed.")}},[Jt,a]),ss=(0,F.useCallback)(()=>{Ve(null),pt(!1)},[]),Ki=(0,F.useCallback)(()=>{let U=Jt;if(!U)return;let j=Lv(),K={id:j,screenshot:U.screenshot,transcript:"",structuredOutput:null,context:U.context??null,createdAt:Date.now()};E(Z=>[...Z,K]),C(j),Da()},[Jt,Da]),je=(0,F.useCallback)(async()=>{if(Aa.current==="idle"&&(_(null),Un.current?.stop(),se(x),G(!1),ka(),I("focus_mode"),!e))try{let U=await Bu();if(!U){hr();return}let j=Lv(),K={id:j,screenshot:U,transcript:"",structuredOutput:null,createdAt:Date.now()};E(Z=>[...Z,K]),C(j),Da()}catch(U){console.error(U),_("Screen capture failed."),I("error"),hr()}},[e,x,Bu,Da,ka,hr]),Wi=(0,F.useMemo)(()=>({setIsOpen:Fu,toggleOpen:Uu,startDrag:zi,handleShare:Hi,setShowMenu:Y,resetSession:as,startListening:Da,finishListening:$s,discardListening:Js,deletePointer:Pa,startEditing:Gi,saveEdit:fd,setExpandedId:T,setEditedTitle:M,setEditedDescription:B,handleAddFeedback:je,handleRegionCaptured:ji,handleRegionSelectStart:qu,handleCancelCapture:hr,getFullTabImage:Oa,setActiveRecordingTranscript:zu,startSession:Hu,pauseSession:Gu,resumeSession:hd,endSession:Ia,handleSessionElementClicked:Bn,handleSessionFeedbackSubmit:rs,handleSessionFeedbackCancel:ss,handleSessionStartVoice:Ki}),[Fu,Uu,zi,Hi,as,Da,$s,Js,Pa,Gi,fd,T,M,B,je,ji,qu,hr,Oa,zu,Hu,Gu,hd,Ia,Bn,rs,ss,Ki]),pr=(0,F.useMemo)(()=>v?L.find(U=>U.id===v):null,[v,L]),Zs=(0,F.useMemo)(()=>z!=="voice_listening"?"neutral":pU(pr?.transcript??""),[z,pr?.transcript]),nm=pr?.transcript?.trim()??"";return{state:{isOpen:x,state:z,errorMessage:y,pointers:b,expandedId:A,editingId:de,editedTitle:he,editedDescription:O,showMenu:$,position:re,liveTranscript:nm,listeningAudioLevel:yn,listeningSentiment:Zs,highlightTicketId:ae,pillExiting:Ie,orbSuccess:Se,sessionMode:qe,sessionPaused:Oe,pausePending:Ot,endPending:$t,sessionFeedbackPending:Jt},handlers:Wi,refs:{widgetRef:La,menuRef:lr,captureRootRef:Mt},captureRootReady:ft,captureRootEl:nt}}var $p=Ce(Hn());var Qp=(...t)=>t.filter((e,n,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===n).join(" ").trim();var ik=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var ok=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,a)=>a?a.toUpperCase():n.toLowerCase());var Av=t=>{let e=ok(t);return e.charAt(0).toUpperCase()+e.slice(1)};var ad=Ce(Hn());var uk={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var lk=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var ck=(0,ad.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:r="",children:s,iconNode:i,...u},l)=>(0,ad.createElement)("svg",{ref:l,...uk,width:e,height:e,stroke:t,strokeWidth:a?Number(n)*24/Number(e):n,className:Qp("lucide",r),...!s&&!lk(u)&&{"aria-hidden":"true"},...u},[...i.map(([c,f])=>(0,ad.createElement)(c,f)),...Array.isArray(s)?s:[s]]));var ir=(t,e)=>{let n=(0,$p.forwardRef)(({className:a,...r},s)=>(0,$p.createElement)(ck,{ref:s,iconNode:e,className:Qp(`lucide-${ik(Av(t))}`,`lucide-${t}`,a),...r}));return n.displayName=Av(t),n};var gU=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],rd=ir("check",gU);var yU=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],sd=ir("expand",yU);var IU=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],id=ir("pencil",IU);var _U=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],od=ir("trash-2",_U);var SU=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ud=ir("x",SU);var vn=Ce(gt()),vU=()=>(0,vn.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,vn.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,vn.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),EU=()=>(0,vn.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,vn.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function xv({onClose:t,summary:e=null,theme:n="dark",onThemeToggle:a}){return(0,vn.jsxs)("div",{className:"echly-sidebar-header",children:[(0,vn.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,vn.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,vn.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),a&&(0,vn.jsx)("button",{type:"button",id:"theme-toggle",onClick:a,className:"echly-theme-toggle","aria-label":n==="dark"?"Switch to light mode":"Switch to dark mode",children:n==="dark"?(0,vn.jsx)(vU,{}):(0,vn.jsx)(EU,{})}),(0,vn.jsx)("button",{type:"button",onClick:t,className:"echly-sidebar-close","aria-label":"Close",children:(0,vn.jsx)(ud,{size:16,strokeWidth:1.5})})]})}var Jr=Ce(Hn());var yt=Ce(gt());function TU(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function bU({item:t,expandedId:e,editingId:n,editedTitle:a,editedDescription:r,onExpand:s,onStartEdit:i,onSaveEdit:u,onDelete:l,onEditedTitleChange:c,onEditedDescriptionChange:f,highlightTicketId:p=null}){let m=e===t.id,S=n===t.id,R=p===t.id,D=TU(t.type),[L,E]=(0,Jr.useState)(!1),v=(0,Jr.useCallback)(()=>{s(m?null:t.id)},[m,t.id,s]),C=(0,Jr.useCallback)(()=>{i(t)},[t,i]),x=(0,Jr.useCallback)(()=>{u(t.id),E(!0),setTimeout(()=>E(!1),220)},[t.id,u]),G=(0,Jr.useCallback)(()=>{l(t.id)},[t.id,l]);return(0,yt.jsxs)("div",{className:`echly-feedback-item ${R?"echly-ticket-highlight":""}`,"data-priority":D,children:[(0,yt.jsx)("span",{className:"echly-priority-dot","aria-hidden":!0}),(0,yt.jsxs)("div",{className:"echly-feedback-item-inner",children:[(0,yt.jsx)("div",{className:"echly-feedback-item-content",children:S?(0,yt.jsxs)(yt.Fragment,{children:[(0,yt.jsx)("input",{value:a,onChange:z=>c(z.target.value),className:"echly-widget-input echly-feedback-item-input"}),(0,yt.jsx)("textarea",{value:r,onChange:z=>f(z.target.value),rows:3,className:"echly-widget-input echly-feedback-item-textarea"})]}):(0,yt.jsx)(yt.Fragment,{children:(0,yt.jsx)("h3",{className:"echly-widget-item-title",children:t.title})})}),(0,yt.jsxs)("div",{className:"echly-feedback-item-actions",children:[(0,yt.jsx)("button",{type:"button",onClick:v,className:"echly-widget-action-icon","aria-label":m?"Collapse":"Expand",children:(0,yt.jsx)(sd,{size:16,strokeWidth:1.5})}),S?(0,yt.jsx)("button",{type:"button",onClick:x,className:`echly-widget-action-icon echly-widget-action-icon--confirm ${L?"echly-widget-action-icon--confirm-success":""}`,"aria-label":"Save",children:(0,yt.jsx)(rd,{size:16,strokeWidth:1.5})}):(0,yt.jsx)("button",{type:"button",onClick:C,className:"echly-widget-action-icon","aria-label":"Edit",children:(0,yt.jsx)(id,{size:16,strokeWidth:1.5})}),(0,yt.jsx)("button",{type:"button",onClick:G,className:"echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,yt.jsx)(od,{size:16,strokeWidth:1.5})})]})]})]})}var dk=Jr.default.memo(bU,(t,e)=>t.item===e.item&&t.expandedId===e.expandedId&&t.editingId===e.editingId&&t.editedTitle===e.editedTitle&&t.editedDescription===e.editedDescription&&t.highlightTicketId===e.highlightTicketId);var Zr=Ce(gt());function Rv({isIdle:t,onAddFeedback:e,extensionMode:n=!1,onStartSession:a,onResumeSession:r,onOpenPreviousSession:s,hasActiveSession:i=!1,captureDisabled:u=!1}){let l=!t||u,c=l||!i||!r,f=!!(r||s);return n?(0,Zr.jsxs)("div",{className:"echly-add-insight-wrap",children:[(0,Zr.jsx)("button",{type:"button",onClick:l?void 0:a,disabled:l,className:`echly-add-insight-btn ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Start New Feedback Session",children:"Start New Feedback Session"}),f&&(0,Zr.jsxs)("div",{style:{display:"flex",gap:8,marginTop:8},children:[(0,Zr.jsx)("button",{type:"button",onClick:c?void 0:r,disabled:c,className:`echly-add-insight-btn echly-add-insight-btn--secondary ${c?"echly-add-insight-btn--disabled":""}`,"aria-label":"Resume Session",style:{flex:1,minWidth:0},children:"Resume Session"}),(0,Zr.jsx)("button",{type:"button",onClick:l?void 0:s,disabled:l,className:`echly-add-insight-btn echly-add-insight-btn--secondary ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Open Previous Session",style:{flex:1,minWidth:0},children:"Open Previous Session"})]})]}):(0,Zr.jsx)("div",{className:"echly-add-insight-wrap",children:(0,Zr.jsx)("button",{type:"button",onClick:l?void 0:e,disabled:l,className:`echly-add-insight-btn ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var Tk=Ce(Ld());var Ws=Ce(Hn()),vk=Ce(Ld());var fk={outline:"2px solid #2563eb",background:"rgba(37,99,235,0.1)"},Gt=null,ld=null,Jp=null;function wU(t,e){if(typeof document.elementsFromPoint!="function")return document.elementFromPoint(t,e);let n=document.elementsFromPoint(t,e);for(let a of n)if(jp(a))return a;return null}function hk(t){if(Gt){if(!t||t.width===0||t.height===0){Gt.style.display="none";return}Gt.style.display="block",Gt.style.left=`${t.left}px`,Gt.style.top=`${t.top}px`,Gt.style.width=`${t.width}px`,Gt.style.height=`${t.height}px`}}function CU(t,e){if(!e()){Gt&&(Gt.style.display="none"),Jp=null;return}let n=wU(t.clientX,t.clientY);if(n!==Jp){if(Jp=n,!n){hk(null);return}let a=n.getBoundingClientRect();hk(a)}}function pk(t,e){return Gt&&Gt.parentNode&&Zp(),Gt=document.createElement("div"),Gt.setAttribute("aria-hidden","true"),Gt.setAttribute("data-echly-ui","true"),Gt.style.cssText=["position:fixed","pointer-events:none","z-index:2147483646","box-sizing:border-box","border-radius:4px",`outline:${fk.outline}`,`background:${fk.background}`,"display:none"].join(";"),t.appendChild(Gt),ld=n=>CU(n,e.getActive),document.addEventListener("mousemove",ld,{passive:!0}),()=>Zp()}function Zp(){ld&&(document.removeEventListener("mousemove",ld),ld=null),Jp=null,Gt?.parentNode&&Gt.parentNode.removeChild(Gt),Gt=null}var qi=null,kv=()=>!1,Dv=()=>{};function LU(t){if(t.button!==0||!kv())return;let e=t.target;!e||!jp(e)||(t.preventDefault(),t.stopPropagation(),Ks("element clicked"),Dv(e))}function mk(t,e){return kv=e.enabled,Dv=e.onElementClicked,qi&&document.removeEventListener("click",qi,!0),qi=LU,document.addEventListener("click",qi,!0),()=>Pv()}function Pv(){qi&&(document.removeEventListener("click",qi,!0),qi=null),kv=()=>!1,Dv=()=>{}}var cn=Ce(gt());function gk(){return(0,cn.jsxs)(cn.Fragment,{children:[(0,cn.jsx)("style",{children:`
        @keyframes echly-inline-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}),(0,cn.jsx)("span",{"aria-hidden":!0,style:{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.28)",borderTopColor:"rgba(255,255,255,0.92)",opacity:.8,animation:"echly-inline-spin 0.8s linear infinite",flexShrink:0}})]})}function yk({sessionPaused:t,pausePending:e=!1,endPending:n=!1,onPause:a,onResume:r,onEnd:s}){return(0,cn.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderRadius:18,background:"rgba(20,22,28,0.82)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",zIndex:2147483647,border:"1px solid rgba(255,255,255,0.08)",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},children:[(0,cn.jsx)("span",{style:{fontSize:14,fontWeight:600,color:"#F3F4F6"},children:t?"Session paused":"Recording Session"}),e?(0,cn.jsxs)("button",{type:"button",disabled:!0,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:8,opacity:.9,cursor:"default"},children:[(0,cn.jsx)(gk,{}),(0,cn.jsx)("span",{children:"Pausing\u2026"})]}):t?(0,cn.jsx)("button",{type:"button",onClick:r,disabled:e,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#466EFF",color:"#fff",fontSize:13,fontWeight:500,cursor:e?"default":"pointer",opacity:e?.7:1},children:"Resume Feedback Session"}):(0,cn.jsx)("button",{type:"button",onClick:a,disabled:n,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:n?"default":"pointer",opacity:n?.7:1},children:"Pause"}),n?(0,cn.jsxs)("button",{type:"button",disabled:!0,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#EF4444",color:"#fff",fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:8,opacity:.9,cursor:"default"},children:[(0,cn.jsx)(gk,{}),(0,cn.jsx)("span",{children:"Ending\u2026"})]}):(0,cn.jsx)("button",{type:"button",onClick:s,disabled:e,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#EF4444",color:"#fff",fontSize:13,fontWeight:500,cursor:e?"default":"pointer",opacity:e?.7:1},children:"End"})]})}var Ov=Ce(Hn()),Qt=Ce(gt());function Ik({screenshot:t,isVoiceListening:e,onRecordVoice:n,onDoneVoice:a,onSaveText:r,onCancel:s}){let[i,u]=(0,Ov.useState)("choose"),[l,c]=(0,Ov.useState)("");return(0,Qt.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"min(380px, 92vw)",borderRadius:14,background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.08)",zIndex:2147483647,overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},children:[(0,Qt.jsxs)("div",{style:{padding:20,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,Qt.jsx)("div",{style:{borderRadius:14,overflow:"hidden",background:"rgba(0,0,0,0.3)",aspectRatio:"16/10",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,Qt.jsx)("img",{src:t,alt:"Capture",style:{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}})}),(0,Qt.jsx)("p",{style:{margin:"12px 0 0",fontSize:13,fontWeight:500,color:"#A1A1AA"},children:"Speak or type feedback"})]}),(0,Qt.jsxs)("div",{style:{padding:20,display:"flex",flexDirection:"column",gap:12},children:[i==="choose"&&(0,Qt.jsxs)(Qt.Fragment,{children:[(0,Qt.jsx)("button",{type:"button",onClick:()=>{u("voice"),n()},style:{padding:"12px 16px",borderRadius:10,border:"none",background:"#466EFF",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"},children:"Describe the change"}),(0,Qt.jsx)("button",{type:"button",onClick:()=>{u("text")},style:{padding:"12px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14,fontWeight:500,cursor:"pointer"},children:"Type feedback"})]}),i==="voice"&&(0,Qt.jsx)("button",{type:"button",onClick:a,disabled:!e,style:{padding:"12px 16px",borderRadius:10,border:"none",background:e?"#466EFF":"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,fontWeight:600,cursor:e?"pointer":"default"},children:e?"Save feedback":"Saving feedback\u2026"}),i==="text"&&(0,Qt.jsxs)(Qt.Fragment,{children:[(0,Qt.jsx)("textarea",{value:l,onChange:S=>c(S.target.value),placeholder:"Describe feedback","aria-label":"Feedback text",rows:3,style:{width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14,resize:"vertical",minHeight:80}}),(0,Qt.jsx)("button",{type:"button",onClick:()=>{let S=l.trim();S&&r(S)},disabled:!l.trim(),style:{padding:"12px 16px",borderRadius:10,border:"none",background:l.trim()?"#466EFF":"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,fontWeight:600,cursor:l.trim()?"pointer":"default"},children:"Save feedback"})]}),s&&i==="choose"&&(0,Qt.jsx)("button",{type:"button",onClick:s,style:{padding:"8px 12px",border:"none",background:"transparent",color:"#A1A1AA",fontSize:13,fontWeight:500,cursor:"pointer",alignSelf:"flex-start"},children:"Discard"})]})]})}var es=Ce(gt()),_k=12;function AU(){let t=['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">','<path fill="white" stroke="black" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',"</svg>"].join("");return`url("data:image/svg+xml;utf8,${encodeURIComponent(t)}") 6 6, auto`}var Sk=AU();function Ek({captureRoot:t,sessionMode:e,sessionPaused:n,pausePending:a=!1,endPending:r=!1,sessionFeedbackPending:s,state:i,onElementClicked:u,onPause:l,onResume:c,onEnd:f,onRecordVoice:p,onDoneVoice:m,onSaveText:S,onCancel:R}){let D=(0,Ws.useRef)([]),[L,E]=(0,Ws.useState)(null),v=a||r,C=e&&!n&&!v,x=e&&!n&&!v&&s==null;if((0,Ws.useEffect)(()=>{if(!e||!t)return;let z=()=>e&&!n&&!v&&s==null;return D.current.push(pk(t,{getActive:z})),D.current.push(mk(t,{enabled:z,onElementClicked:u})),()=>{D.current.forEach(I=>I()),D.current=[],Zp(),Pv()}},[e,t,n,v,s,u]),(0,Ws.useEffect)(()=>{if(!t?.isConnected)return;let z=document.body.style.cursor;return document.body.style.cursor=C?Sk:"",()=>{document.body.style.cursor=z}},[C,t]),(0,Ws.useEffect)(()=>{if(!x){E(null);return}let z=I=>{E({x:I.clientX+_k,y:I.clientY+_k})};return window.addEventListener("mousemove",z,{passive:!0}),()=>window.removeEventListener("mousemove",z)},[x]),!e||!t)return null;let G=(0,es.jsxs)(es.Fragment,{children:[(0,es.jsx)("div",{"aria-hidden":!0,className:"echly-session-overlay-cursor",style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:2147483645,cursor:C?Sk:"default"}}),(0,es.jsx)(yk,{sessionPaused:n,pausePending:a,endPending:r,onPause:l,onResume:c,onEnd:f}),x&&L!=null&&(0,es.jsx)("div",{"aria-hidden":!0,className:"echly-capture-tooltip",style:{position:"fixed",left:L.x,top:L.y,pointerEvents:"none",zIndex:2147483646,padding:"6px 10px",fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.95)",background:"rgba(0,0,0,0.75)",borderRadius:6,whiteSpace:"nowrap",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"},children:"Click to add feedback"}),s&&(0,es.jsx)(Ik,{screenshot:s.screenshot,isVoiceListening:i==="voice_listening",onRecordVoice:p,onDoneVoice:m,onSaveText:S,onCancel:R})]});return(0,vk.createPortal)(G,t)}var or=Ce(gt());function bk({captureRoot:t,extensionMode:e,state:n,getFullTabImage:a,onRegionCaptured:r,onRegionSelectStart:s,onCancelCapture:i,sessionMode:u=!1,sessionPaused:l=!1,pausePending:c=!1,endPending:f=!1,sessionFeedbackPending:p=null,onSessionElementClicked:m,onSessionPause:S,onSessionResume:R,onSessionEnd:D,onSessionRecordVoice:L,onSessionDoneVoice:E,onSessionSaveText:v,onSessionFeedbackCancel:C=()=>{}}){let x=u&&e;return(0,or.jsx)(or.Fragment,{children:(0,Tk.createPortal)((0,or.jsxs)(or.Fragment,{children:[x&&m&&S&&R&&D&&L&&E&&v&&(0,or.jsx)(Ek,{captureRoot:t,sessionMode:u,sessionPaused:l,pausePending:c,endPending:f,sessionFeedbackPending:p??null,state:n,onElementClicked:m,onPause:S,onResume:R,onEnd:D,onRecordVoice:L,onDoneVoice:E,onSaveText:v,onCancel:C}),!x&&(n==="focus_mode"||n==="region_selecting")&&(0,or.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.08)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),!x&&e&&(n==="focus_mode"||n==="region_selecting")&&(0,or.jsx)(XR,{getFullTabImage:a,onAddVoice:r,onCancel:i,onSelectionStart:s})]}),t)})}var ur=Ce(Hn()),jt=Ce(gt());function xU(t,e){if(e==="all")return t;let n=Date.now(),a={today:24*60*60*1e3,"7days":7*24*60*60*1e3,"30days":30*24*60*60*1e3},r=n-a[e];return t.filter(s=>(s.updatedAt?new Date(s.updatedAt).getTime():0)>=r)}function RU(t){if(!t)return"\u2014";let e=new Date(t),a=new Date().getTime()-e.getTime(),r=Math.floor(a/6e4);if(r<1)return"Just now";if(r<60)return`${r}m ago`;let s=Math.floor(r/60);if(s<24)return`${s}h ago`;let i=Math.floor(s/24);return i<7?`${i}d ago`:e.toLocaleDateString()}function wk({open:t,onClose:e,fetchSessions:n,onSelectSession:a}){let[r,s]=(0,ur.useState)([]),[i,u]=(0,ur.useState)(!1),[l,c]=(0,ur.useState)(null),[f,p]=(0,ur.useState)(""),[m,S]=(0,ur.useState)("all");(0,ur.useEffect)(()=>{t&&(p(""),S("all"),c(null),u(!0),n().then(L=>{console.log("[Echly] Sessions returned:",L),s(L)}).catch(L=>c(L instanceof Error?L.message:"Failed to load sessions")).finally(()=>u(!1)))},[t,n]);let R=(0,ur.useMemo)(()=>{let L=xU(r,m);if(f.trim()){let E=f.trim().toLowerCase();L=L.filter(v=>(v.title??"").toLowerCase().includes(E)||(v.id??"").toLowerCase().includes(E))}return L},[r,m,f]),D=L=>{if(typeof L.feedbackCount=="number")return L.feedbackCount;let E=typeof L.openCount=="number"?L.openCount:0,v=typeof L.resolvedCount=="number"?L.resolvedCount:0,C=typeof L.skippedCount=="number"?L.skippedCount:0;return E+v+C};return t?(0,jt.jsx)("div",{"data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:24},onClick:L=>L.target===L.currentTarget&&e(),role:"dialog","aria-modal":"true","aria-labelledby":"resume-session-modal-title",children:(0,jt.jsxs)("div",{style:{width:"min(420px, 100%)",maxHeight:"85vh",borderRadius:18,background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},onClick:L=>L.stopPropagation(),children:[(0,jt.jsxs)("div",{style:{padding:20,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,jt.jsx)("h2",{id:"resume-session-modal-title",style:{margin:"0 0 16px",fontSize:18,fontWeight:600,color:"#F3F4F6"},children:"Resume Feedback Session"}),(0,jt.jsx)("input",{type:"search",placeholder:"Search sessions",value:f,onChange:L=>p(L.target.value),"aria-label":"Search sessions",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14}}),(0,jt.jsx)("div",{style:{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"},children:["today","7days","30days","all"].map(L=>(0,jt.jsx)("button",{type:"button",onClick:()=>S(L),style:{padding:"8px 12px",borderRadius:10,border:"none",background:m===L?"rgba(70, 110, 255, 0.2)":"rgba(255,255,255,0.08)",color:"#F3F4F6",fontSize:12,fontWeight:500,cursor:"pointer"},children:L==="today"?"Today":L==="7days"?"Last 7 days":L==="30days"?"Last 30 days":"All sessions"},L))})]}),(0,jt.jsxs)("div",{style:{flex:1,overflow:"auto",minHeight:200,maxHeight:360},children:[i&&(0,jt.jsx)("div",{style:{padding:24,textAlign:"center",color:"#A1A1AA",fontSize:14},children:"Loading sessions\u2026"}),l&&(0,jt.jsx)("div",{style:{padding:24,color:"#EF4444",fontSize:14},children:l}),!i&&!l&&R.length===0&&(0,jt.jsx)("div",{style:{padding:24,textAlign:"center",color:"#A1A1AA",fontSize:14},children:"No sessions match."}),!i&&!l&&R.length>0&&(0,jt.jsx)("ul",{style:{listStyle:"none",margin:0,padding:12},children:R.map(L=>(0,jt.jsx)("li",{style:{marginBottom:4},children:(0,jt.jsxs)("button",{type:"button",onClick:()=>{a(L.id),e()},style:{width:"100%",textAlign:"left",padding:"14px 16px",borderRadius:14,border:"none",background:"transparent",color:"#F3F4F6",fontSize:14,cursor:"pointer"},onMouseEnter:E=>{E.currentTarget.style.background="rgba(255,255,255,0.06)"},onMouseLeave:E=>{E.currentTarget.style.background="transparent"},children:[(0,jt.jsx)("div",{style:{fontWeight:600},children:L.title?.trim()||"Untitled Session"}),(0,jt.jsxs)("div",{style:{fontSize:12,fontWeight:500,color:"#A1A1AA",marginTop:4},children:[D(L)," feedback items \xB7 ",RU(L.updatedAt)]})]})},L.id))})]}),(0,jt.jsx)("div",{style:{padding:16,borderTop:"1px solid rgba(255,255,255,0.08)"},children:(0,jt.jsx)("button",{type:"button",onClick:e,style:{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#A1A1AA",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Cancel"})})]})}):null}var Tt=Ce(gt()),kU=["focus_mode","region_selecting","voice_listening","processing"];function em({sessionId:t,userId:e,extensionMode:n=!1,initialPointers:a,onComplete:r,onDelete:s,widgetToggleRef:i,onRecordingChange:u,expanded:l,onExpandRequest:c,onCollapseRequest:f,captureDisabled:p=!1,theme:m="dark",onThemeToggle:S,fetchSessions:R,onResumeSessionSelect:D,loadSessionWithPointers:L,onSessionLoaded:E,onSessionEnd:v,onCreateSession:C,onActiveSessionChange:x,globalSessionModeActive:G,globalSessionPaused:z,onSessionModeStart:I,onSessionModePause:y,onSessionModeResume:_,onSessionModeEnd:b}){let[w,A]=(0,ga.useState)(!1),[T,de]=(0,ga.useState)(!0),{state:ee,handlers:he,refs:M,captureRootEl:O}=sk({sessionId:t,userId:e,extensionMode:n,initialPointers:a,onComplete:r,onDelete:s,onRecordingChange:u,loadSessionWithPointers:L,onSessionLoaded:E,onCreateSession:C,onActiveSessionChange:x,globalSessionModeActive:G,globalSessionPaused:z,onSessionModeStart:I,onSessionModePause:y,onSessionModeResume:_,onSessionModeEnd:b}),$=l!==void 0?l:ee.isOpen,Y=(0,ga.useRef)(null),re=kU.includes(ee.state)||ee.pillExiting,Je=!!t,Me=!re&&!ee.sessionMode,Xe=ee.sessionMode&&ee.sessionPaused,dt=!$&&Me&&!Xe,ta=$&&Me||Xe,yn=(0,ga.useRef)(!1);(0,ga.useEffect)(()=>{if(!re){yn.current=!1;return}yn.current||(yn.current=!0,f?.())},[re,f]);let Ze=ee.pointers.length,N=ee.pointers.filter(ne=>/critical|bug|high|urgent/i.test(ne.type||"")).length,se=Ze>0?N>0?`${Ze} insights \u2022 ${N} need attention`:`${Ze} insights`:null;(0,ga.useEffect)(()=>{ee.highlightTicketId&&Y.current&&Y.current.scrollTo({top:0,behavior:"smooth"})},[ee.highlightTicketId]),ga.default.useEffect(()=>{if(i)return i.current=he.toggleOpen,()=>{i.current=null}},[he,i]);let ae=ga.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_ACTIVE_SESSION"},ne=>{let Ie=ne?.sessionId;Ie&&D?.(Ie,{enterCaptureImmediately:!0})})},[D]);return(0,Tt.jsxs)(Tt.Fragment,{children:[n&&R&&D&&(0,Tt.jsx)(wk,{open:w,onClose:()=>A(!1),fetchSessions:R,onSelectSession:ne=>{de(!1),D(ne),A(!1)}}),O&&(0,Tt.jsx)(bk,{captureRoot:O,extensionMode:n,state:ee.state,getFullTabImage:he.getFullTabImage,onRegionCaptured:he.handleRegionCaptured,onRegionSelectStart:he.handleRegionSelectStart,onCancelCapture:he.handleCancelCapture,sessionMode:ee.sessionMode,sessionPaused:ee.sessionPaused,pausePending:ee.pausePending,endPending:ee.endPending,sessionFeedbackPending:ee.sessionFeedbackPending,onSessionElementClicked:he.handleSessionElementClicked,onSessionPause:()=>{he.pauseSession(),c?.()},onSessionResume:()=>{he.resumeSession(),f?.()},onSessionEnd:()=>{he.endSession(()=>{de(!0),v?.()})},onSessionRecordVoice:he.handleSessionStartVoice,onSessionDoneVoice:he.finishListening,onSessionSaveText:he.handleSessionFeedbackSubmit,onSessionFeedbackCancel:he.handleSessionFeedbackCancel}),dt&&(0,Tt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,Tt.jsx)("button",{type:"button",onClick:()=>c?c():he.setIsOpen(!0),className:"echly-floating-trigger",children:n?"Echly":"Capture feedback"})}),ta&&(0,Tt.jsxs)(Tt.Fragment,{children:[!n&&(0,Tt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,Tt.jsx)("div",{ref:M.widgetRef,className:"echly-sidebar-container",style:n?{position:"fixed",...ee.position?{left:ee.position.x,top:ee.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,Tt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,Tt.jsx)(xv,{onClose:()=>f?f():he.setIsOpen(!1),summary:se,theme:m,onThemeToggle:S}),(0,Tt.jsxs)("div",{ref:Y,className:"echly-sidebar-body",children:[!(n&&T&&!Xe)&&(0,Tt.jsxs)(Tt.Fragment,{children:[(0,Tt.jsx)("div",{className:"echly-feedback-list",children:ee.pointers.map(ne=>(0,Tt.jsx)(dk,{item:ne,expandedId:ee.expandedId,editingId:ee.editingId,editedTitle:ee.editedTitle,editedDescription:ee.editedDescription,onExpand:he.setExpandedId,onStartEdit:he.startEditing,onSaveEdit:he.saveEdit,onDelete:he.deletePointer,onEditedTitleChange:he.setEditedTitle,onEditedDescriptionChange:he.setEditedDescription,highlightTicketId:ee.highlightTicketId},ne.id))}),ee.errorMessage&&(0,Tt.jsx)("div",{className:"echly-sidebar-error",children:ee.errorMessage})]}),ee.state==="idle"&&(0,Tt.jsx)(Rv,{isIdle:!0,onAddFeedback:he.handleAddFeedback,extensionMode:n,onStartSession:n?he.startSession:void 0,onResumeSession:n&&Je?ae:void 0,onOpenPreviousSession:n&&R&&D?()=>A(!0):void 0,hasActiveSession:Je,captureDisabled:p})]})]})})]})]})}var It=Ce(gt()),DU="echly-root",tm="echly-shadow-host",Lk="widget-theme";function PU(){try{let t=localStorage.getItem(Lk);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function OU(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem(Lk,e)}catch{}}function Mv(t){let e=document.getElementById(tm);e&&(e.style.display=t?"block":"none")}function MU(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function NU({widgetRoot:t,initialTheme:e}){let[n,a]=Te.default.useState(null),[r,s]=Te.default.useState(null),[i,u]=Te.default.useState(!1),[l,c]=Te.default.useState(e),[f,p]=Te.default.useState({visible:!1,expanded:!1,isRecording:!1,sessionId:null,sessionModeActive:!1,sessionPaused:!1}),[m,S]=Te.default.useState(null),[R,D]=Te.default.useState(null),L=m??f.sessionId,E=Te.default.useRef(null),v=Te.default.useRef(!1),[C,x]=Te.default.useState(null),[G,z]=Te.default.useState(!1),[I,y]=Te.default.useState(!1),[_,b]=Te.default.useState(""),w=Te.default.useRef(null),A=Te.default.useRef(!1),[T,de]=Te.default.useState(!1),ee=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";Te.default.useEffect(()=>{let N=()=>{E.current?.()};return window.addEventListener("ECHLY_TOGGLE_WIDGET",N),()=>{window.removeEventListener("ECHLY_TOGGLE_WIDGET",N)}},[]),Te.default.useEffect(()=>{let N=se=>{let ae=se.detail?.state;ae&&(ce("CONTENT","global state received",ae),Mv(ae.visible),p(ae))};return window.addEventListener("ECHLY_GLOBAL_STATE",N),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",N)},[]),Te.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},N=>{N?.state&&(Mv(N.state.visible??!1),p(N.state))})},[]),Te.default.useEffect(()=>{if(!f.sessionModeActive||!f.sessionId)return;let N=!1;return(async()=>{try{let se=await Et(`/api/feedback?sessionId=${encodeURIComponent(f.sessionId)}&limit=50`);if(N)return;let Ie=((await se.json()).feedback??[]).map(Pe=>({id:Pe.id,title:Pe.title??"",description:Pe.description??"",type:Pe.type??"Feedback"}));if(N)return;D({sessionId:f.sessionId,pointers:Ie})}catch(se){N||(console.error("[Echly] Failed to load session feedback for markers:",se),D({sessionId:f.sessionId,pointers:[]}))}})(),()=>{N=!0}},[f.sessionModeActive,f.sessionId]),Te.default.useEffect(()=>{let N=()=>{let ae=window.location.origin;if(!(ae==="https://echly-web.vercel.app"||ae==="http://localhost:3000"))return;let Ie=window.location.pathname.split("/").filter(Boolean);Ie[0]==="dashboard"&&Ie[1]&&chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:Ie[1]},()=>{})};N(),window.addEventListener("popstate",N);let se=setInterval(N,2e3);return()=>{window.removeEventListener("popstate",N),clearInterval(se)}},[]);let he=Te.default.useCallback(N=>{N?chrome.runtime.sendMessage({type:"START_RECORDING"},se=>{if(chrome.runtime.lastError){s(chrome.runtime.lastError.message||"Failed to start recording");return}se?.ok||s(se?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),M=Te.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{})},[]),O=Te.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{})},[]),B=Te.default.useCallback(()=>{let N=l==="dark"?"light":"dark";c(N),OU(t,N)},[l,t]);Te.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},N=>{N?.authenticated&&N.user?.uid?a({uid:N.user.uid,name:N.user.name??null,email:N.user.email??null,photoURL:N.user.photoURL??null}):a(null),u(!0)})},[]);let $=Te.default.useCallback(async(N,se,ae,ne,Ie)=>{if(ce("PIPELINE","start"),v.current){ce("PIPELINE","blocked by submissionLock"),ae?.onError?.();return}if(v.current=!0,!L||!n){ce("PIPELINE","error"),ae?.onError(),v.current=!1;return}if(ae){(async()=>{let Pe=iI(se??null),ft=Yy(),ht=Qy(),nt=se?$y(se,L,ht):Promise.resolve(null),et=await Pe;console.log("[OCR] Extracted visibleText:",et);let Se=typeof window<"u"?window.location.href:"",pe={...ne??{},visibleText:et?.trim()&&et||ne?.visibleText||null,url:ne?.url??Se},qe={transcript:N,context:pe};try{ce("PIPELINE","structure request"),console.log("[VOICE] final transcript submitted",N);let Oe=await(await Et("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(qe)})).json(),bt=Array.isArray(Oe.tickets)?Oe.tickets:[],Ot=typeof Oe.clarityScore=="number"?Oe.clarityScore:Oe.clarityScore!=null?Number(Oe.clarityScore):100,wt=Oe.clarityIssues??[],$t=Oe.suggestedRewrite??null,Ct=Oe.confidence??.5;if(!!!Ie?.sessionMode){if(Oe.success&&Ot<=20){console.log("CLARITY GUARD TRIGGERED",Ot),x({tickets:bt,screenshotUrl:null,screenshotId:ht,uploadPromise:nt,transcript:N,screenshot:se,firstFeedbackId:ft,clarityScore:Ot,clarityIssues:wt,suggestedRewrite:$t,confidence:Ct,callbacks:ae,context:pe}),b(N),y(!1),A.current=!1,de(!1),z(!0),v.current=!1;return}let Fe=!!Oe.needsClarification,be=Oe.verificationIssues??[];if(Oe.success&&Fe&&bt.length===0){console.log("PIPELINE NEEDS CLARIFICATION",be),x({tickets:[],screenshotUrl:null,screenshotId:ht,uploadPromise:nt,transcript:N,screenshot:se,firstFeedbackId:ft,clarityScore:Ot,clarityIssues:be.length>0?be:wt,suggestedRewrite:$t,confidence:Ct,callbacks:ae,context:pe}),b(N),y(!1),A.current=!1,de(!1),z(!0),v.current=!1;return}}if(!Oe.success||bt.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N,screenshotUrl:null,screenshotId:ht,sessionId:L,context:pe}},Fe=>{if(v.current=!1,chrome.runtime.lastError){ce("PIPELINE","error"),ae.onError();return}if(Fe?.success&&Fe.ticket){let be=Fe.ticket.id;ce("PIPELINE","ticket created",{ticketId:be}),ae.onSuccess({id:be,title:Fe.ticket.title,description:Fe.ticket.description,type:Fe.ticket.type??"Feedback"}),nt.then(Lt=>{Lt&&(ce("PIPELINE","screenshot uploaded",{screenshotUrl:Lt}),ce("PIPELINE","screenshot patched",{ticketId:be}),Et(`/api/tickets/${be}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Lt})}).catch(()=>{}))}).catch(()=>{})}else ce("PIPELINE","error"),ae.onError()});return}let Ve=Ot>=85?"clear":Ot>=60?"needs_improvement":"unclear",ts={clarityScore:Ot,clarityIssues:wt,clarityConfidence:Ct,clarityStatus:Ve},pt;for(let Fe=0;Fe<bt.length;Fe++){let be=bt[Fe],Lt=typeof be.description=="string"?be.description:be.title??"",Fn={sessionId:L,title:be.title??"",description:Lt,type:Array.isArray(be.suggestedTags)&&be.suggestedTags[0]?be.suggestedTags[0]:"Feedback",contextSummary:Lt,actionSteps:Array.isArray(be.actionSteps)?be.actionSteps:[],suggestedTags:be.suggestedTags,screenshotUrl:null,screenshotId:Fe===0?ht:void 0,metadata:{clientTimestamp:Date.now()},...ts},Mt=await(await Et("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Fn)})).json();if(Mt.success&&Mt.ticket){let Un=Mt.ticket;pt||(pt={id:Un.id,title:Un.title,description:Un.description,type:Un.type??"Feedback"})}}if(v.current=!1,pt){let Fe=pt.id;ce("PIPELINE","ticket created",{ticketId:Fe}),nt.then(be=>{be&&(ce("PIPELINE","screenshot uploaded",{screenshotUrl:be}),ce("PIPELINE","screenshot patched",{ticketId:Fe}),Et(`/api/tickets/${Fe}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:be})}).catch(()=>{}))}).catch(()=>{}),ae.onSuccess(pt)}else ce("PIPELINE","error"),ae.onError()}catch(ze){console.error("[Echly] Structure or submit failed:",ze),v.current=!1,ce("PIPELINE","error"),ae.onError()}})();return}try{let Pe=Qy(),ft=se?$y(se,L,Pe):Promise.resolve(null),ht=await iI(se??null);console.log("[OCR] Extracted visibleText:",ht);let nt=typeof window<"u"?window.location.href:"",et={transcript:N,context:{...ne??{},visibleText:ht?.trim()&&ht||ne?.visibleText||null,url:ne?.url??nt}};ce("PIPELINE","structure request"),console.log("[VOICE] final transcript submitted",N);let pe=await(await Et("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(et)})).json(),qe=Array.isArray(pe.tickets)?pe.tickets:[],ze=pe.clarityScore??100,Oe=pe.clarityIssues??[],bt=pe.suggestedRewrite??null,Ot=pe.confidence??.5;if(!pe.success||qe.length===0)return;let wt=ze>=85?"clear":ze>=60?"needs_improvement":"unclear",$t={clarityScore:ze,clarityIssues:Oe,clarityConfidence:Ot,clarityStatus:wt},Ct;for(let Jt=0;Jt<qe.length;Jt++){let Ve=qe[Jt],ts=typeof Ve.description=="string"?Ve.description:Ve.title??"",pt={sessionId:L,title:Ve.title??"",description:ts,type:Array.isArray(Ve.suggestedTags)&&Ve.suggestedTags[0]?Ve.suggestedTags[0]:"Feedback",contextSummary:ts,actionSteps:Array.isArray(Ve.actionSteps)?Ve.actionSteps:[],suggestedTags:Ve.suggestedTags,screenshotUrl:null,screenshotId:Jt===0?Pe:void 0,metadata:{clientTimestamp:Date.now()},...$t},be=await(await Et("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pt)})).json();if(be.success&&be.ticket){let Lt=be.ticket;Ct||(Ct={id:Lt.id,title:Lt.title,description:Lt.description,type:Lt.type??"Feedback"})}}if(Ct){let Jt=Ct.id;ft.then(Ve=>{Ve&&Et(`/api/tickets/${Jt}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Ve})}).catch(()=>{})}).catch(()=>{})}return Ct}finally{v.current=!1}},[L,n]),Y=Te.default.useCallback(async N=>{},[]),re=Te.default.useCallback(async()=>{let N=await Et("/api/sessions"),se=await N.json(),ae=se.sessions??[];return console.log("[Echly] Sessions returned:",{ok:N.ok,status:N.status,success:se.success,count:ae.length,sessions:ae}),!N.ok||!se.success?[]:ae},[]),Je=Te.default.useCallback(async()=>{console.log("[Echly] Creating session");try{let N=await Et("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),se=await N.json();return console.log("[Echly] Create session response:",{ok:N.ok,status:N.status,success:se.success,sessionId:se.session?.id}),!N.ok||!se.success||!se.session?.id?null:{id:se.session.id}}catch(N){return console.error("[Echly] Failed to create session:",N),null}},[]),Me=Te.default.useCallback(N=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:N},()=>{}),S(N)},[]),Xe=Te.default.useCallback(async(N,se)=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:N},()=>{}),S(N);try{let Pe=((await(await Et(`/api/feedback?sessionId=${encodeURIComponent(N)}&limit=50`)).json()).feedback??[]).map(ft=>({id:ft.id,title:ft.title??"",description:ft.description??"",type:ft.type??"Feedback"}));D({sessionId:N,pointers:Pe}),se?.enterCaptureImmediately&&chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{})}catch(ae){console.error("[Echly] Failed to load session feedback:",ae),D({sessionId:N,pointers:[]}),se?.enterCaptureImmediately&&chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{})}},[]),dt=Te.default.useCallback(async N=>{if(!L)return;if(N.tickets.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N.transcript,screenshotUrl:null,screenshotId:N.screenshotId,sessionId:L,context:N.context??{}}},ne=>{if(chrome.runtime.lastError){console.error("[Echly] Submit anyway failed:",chrome.runtime.lastError.message),ce("PIPELINE","error"),N.callbacks.onError();return}if(ne?.success&&ne.ticket){let Ie=ne.ticket.id;N.callbacks.onSuccess({id:Ie,title:ne.ticket.title,description:ne.ticket.description,type:ne.ticket.type??"Feedback"}),N.uploadPromise.then(Pe=>{Pe&&Et(`/api/tickets/${Ie}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Pe})}).catch(()=>{})}).catch(()=>{})}else ce("PIPELINE","error"),N.callbacks.onError()});return}let se={clarityScore:N.clarityScore,clarityIssues:N.clarityIssues,clarityConfidence:N.confidence,clarityStatus:N.clarityScore>=85?"clear":N.clarityScore>=60?"needs_improvement":"unclear"},ae;for(let ne=0;ne<N.tickets.length;ne++){let Ie=N.tickets[ne],Pe=typeof Ie.description=="string"?Ie.description:Ie.title??"",ft={sessionId:L,title:Ie.title??"",description:Pe,type:Array.isArray(Ie.suggestedTags)&&Ie.suggestedTags[0]?Ie.suggestedTags[0]:"Feedback",contextSummary:Pe,actionSteps:Array.isArray(Ie.actionSteps)?Ie.actionSteps:[],suggestedTags:Ie.suggestedTags,screenshotUrl:null,screenshotId:ne===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...se},nt=await(await Et("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ft)})).json();if(nt.success&&nt.ticket){let et=nt.ticket;ae||(ae={id:et.id,title:et.title,description:et.description,type:et.type??"Feedback"})}}if(ae){let ne=ae.id;N.uploadPromise.then(Ie=>{Ie&&Et(`/api/tickets/${ne}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Ie})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(ae)}else ce("PIPELINE","error"),N.callbacks.onError()},[L]),ta=Te.default.useCallback(async(N,se)=>{if(!L)return;let ae=se.trim();try{let ne={transcript:ae,context:N.context??{}},Pe=await(await Et("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ne)})).json(),ft=Array.isArray(Pe.tickets)?Pe.tickets:[],ht=Pe.clarityScore??100,nt=Pe.confidence??.5,et=ht>=85?"clear":ht>=60?"needs_improvement":"unclear",Se={clarityScore:ht,clarityIssues:Pe.clarityIssues??[],clarityConfidence:nt,clarityStatus:et};if(ft.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:ae,screenshotUrl:null,screenshotId:N.screenshotId,sessionId:L,context:N.context??{}}},qe=>{if(chrome.runtime.lastError){console.error("[Echly] Submit edited feedback failed:",chrome.runtime.lastError.message),ce("PIPELINE","error"),N.callbacks.onError();return}if(qe?.success&&qe.ticket){let ze=qe.ticket.id;N.callbacks.onSuccess({id:ze,title:qe.ticket.title,description:qe.ticket.description,type:qe.ticket.type??"Feedback"}),N.uploadPromise.then(Oe=>{Oe&&Et(`/api/tickets/${ze}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Oe})}).catch(()=>{})}).catch(()=>{})}else ce("PIPELINE","error"),N.callbacks.onError()});return}let pe;for(let qe=0;qe<ft.length;qe++){let ze=ft[qe],Oe=typeof ze.description=="string"?ze.description:ze.title??"",bt={sessionId:L,title:ze.title??"",description:Oe,type:Array.isArray(ze.suggestedTags)&&ze.suggestedTags[0]?ze.suggestedTags[0]:"Feedback",contextSummary:Oe,actionSteps:Array.isArray(ze.actionSteps)?ze.actionSteps:[],suggestedTags:ze.suggestedTags,screenshotUrl:null,screenshotId:qe===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...Se},wt=await(await Et("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(bt)})).json();if(wt.success&&wt.ticket){let $t=wt.ticket;pe||(pe={id:$t.id,title:$t.title,description:$t.description,type:$t.type??"Feedback"})}}if(pe){let qe=pe.id;N.uploadPromise.then(ze=>{ze&&Et(`/api/tickets/${qe}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ze})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(pe)}else ce("PIPELINE","error"),N.callbacks.onError()}catch(ne){console.error("[Echly] Submit edited feedback failed:",ne),ce("PIPELINE","error"),N.callbacks.onError()}},[L]),yn=Te.default.useCallback(async()=>{let N=C;if(!(!N?.suggestedRewrite?.trim()||!L)){x(null);try{let ae=await(await Et("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:N.suggestedRewrite.trim()})})).json(),ne=Array.isArray(ae.tickets)?ae.tickets:[],Ie=ae.clarityScore??100,Pe=ae.confidence??.5,ft=Ie>=85?"clear":Ie>=60?"needs_improvement":"unclear",ht={clarityScore:Ie,clarityIssues:ae.clarityIssues??[],clarityConfidence:Pe,clarityStatus:ft},nt;for(let et=0;et<ne.length;et++){let Se=ne[et],pe=typeof Se.description=="string"?Se.description:Se.title??"",qe={sessionId:L,title:Se.title??"",description:pe,type:Array.isArray(Se.suggestedTags)&&Se.suggestedTags[0]?Se.suggestedTags[0]:"Feedback",contextSummary:pe,actionSteps:Array.isArray(Se.actionSteps)?Se.actionSteps:[],suggestedTags:Se.suggestedTags,screenshotUrl:null,screenshotId:et===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...ht},Oe=await(await Et("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(qe)})).json();if(Oe.success&&Oe.ticket){let bt=Oe.ticket;nt||(nt={id:bt.id,title:bt.title,description:bt.description,type:bt.type??"Feedback"})}}if(nt){let et=nt.id;N.uploadPromise.then(Se=>{Se&&Et(`/api/tickets/${et}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Se})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(nt)}else ce("PIPELINE","error"),N.callbacks.onError()}catch(se){console.error("[Echly] Use suggestion failed:",se),ce("PIPELINE","error"),N.callbacks.onError()}}},[C,L]);if(Te.default.useEffect(()=>{I&&w.current&&w.current.focus()},[I]),!i)return null;if(!n)return(0,It.jsx)("div",{style:{pointerEvents:"auto"},children:(0,It.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:MU,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,It.jsx)("img",{src:ee,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})});let Ze=C;return(0,It.jsxs)(It.Fragment,{children:[G&&Ze&&(0,It.jsx)("div",{style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.15)",zIndex:999999,fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif'},children:(0,It.jsxs)("div",{style:{maxWidth:420,width:"90%",background:"#F8FBFF",borderRadius:12,padding:20,boxShadow:"0 12px 32px rgba(0,0,0,0.12)",border:"1px solid #E6F0FF",animation:"echly-clarity-card-in 150ms ease-out"},children:[(0,It.jsx)("div",{style:{fontWeight:600,fontSize:15,marginBottom:6,color:"#111"},children:"Quick suggestion"}),(0,It.jsx)("div",{style:{fontSize:14,color:"#374151",marginBottom:8},children:"Your feedback may be unclear."}),(0,It.jsx)("div",{style:{fontSize:13,color:"#6b7280",marginBottom:10},children:"Try specifying what looks wrong and what change you want."}),Ze.suggestedRewrite&&(0,It.jsxs)("div",{style:{fontSize:13,fontStyle:"italic",color:"#4b5563",marginBottom:12,opacity:.9},children:['Example: "',Ze.suggestedRewrite,'"']}),(0,It.jsx)("textarea",{ref:w,value:_,onChange:N=>b(N.target.value),disabled:!I,rows:3,placeholder:"Your feedback","aria-label":"Feedback message",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid #E6F0FF",fontSize:14,resize:"vertical",minHeight:72,marginBottom:16,background:I?"#fff":"#f3f4f6",color:"#111"}}),(0,It.jsx)("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:I?(0,It.jsx)("button",{type:"button",disabled:T,onClick:()=>{if(A.current||!Ze)return;A.current=!0,de(!0),z(!1),x(null),y(!1),ta(Ze,_).catch(ae=>console.error("[Echly] Done submission failed:",ae)).finally(()=>{A.current=!1,de(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:T?"default":"pointer",opacity:T?.8:1},children:"Done"}):(0,It.jsxs)(It.Fragment,{children:[(0,It.jsx)("button",{type:"button",disabled:T,onClick:()=>y(!0),style:{background:"transparent",border:"1px solid #E6F0FF",borderRadius:8,padding:"8px 14px",fontSize:14,color:"#374151",cursor:T?"default":"pointer",opacity:T?.7:1},children:"Edit feedback"}),(0,It.jsx)("button",{type:"button",disabled:T,onClick:()=>{if(A.current||!Ze)return;A.current=!0,de(!0),z(!1),x(null),y(!1),dt(Ze).catch(se=>console.error("[Echly] Submit anyway failed:",se)).finally(()=>{A.current=!1,de(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:T?"default":"pointer",opacity:T?.8:1},children:"Submit anyway"})]})})]})}),(0,It.jsx)(em,{sessionId:L??"",userId:n.uid,extensionMode:!0,onComplete:$,onDelete:Y,widgetToggleRef:E,onRecordingChange:he,expanded:f.expanded,onExpandRequest:M,onCollapseRequest:O,captureDisabled:!1,theme:l,onThemeToggle:B,fetchSessions:re,onResumeSessionSelect:Xe,loadSessionWithPointers:R,onSessionLoaded:()=>D(null),onSessionEnd:()=>S(null),onCreateSession:Je,onActiveSessionChange:Me,globalSessionModeActive:f.sessionModeActive??!1,globalSessionPaused:f.sessionPaused??!1,onSessionModeStart:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{}),onSessionModePause:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_PAUSE"}).catch(()=>{}),onSessionModeResume:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_RESUME"}).catch(()=>{}),onSessionModeEnd:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_END"}).catch(()=>{})})]})}var VU=`
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
  }
  #echly-root * { box-sizing: border-box; }
`;function FU(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let n=document.createElement("style");n.id="echly-reset",n.textContent=VU,t.appendChild(n)}function UU(t){let e=t.attachShadow({mode:"open"});FU(e);let n=document.createElement("div");n.id=DU,n.setAttribute("data-echly-ui","true"),n.style.all="initial",n.style.boxSizing="border-box",n.style.pointerEvents="auto",n.style.width="auto",n.style.height="auto";let a=PU();n.setAttribute("data-theme",a),e.appendChild(n),(0,Ck.createRoot)(n).render((0,It.jsx)(NU,{widgetRoot:n,initialTheme:a}))}function Ak(t){return t?{visible:t.visible??!1,expanded:t.expanded??!1,isRecording:t.isRecording??!1,sessionId:t.sessionId??null,sessionModeActive:t.sessionModeActive??!1,sessionPaused:t.sessionPaused??!1}:null}function xk(t){ce("CONTENT","dispatch event",{type:"ECHLY_GLOBAL_STATE"}),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:t}}))}function BU(t){chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},e=>{let n=Ak(e?.state);n&&(t.style.display=n.visible?"block":"none",xk(n))})}function qU(){document.addEventListener("visibilitychange",()=>{document.hidden||chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},t=>{let e=Ak(t?.state);e&&(Mv(e.visible),xk(e))})})}function zU(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(n=>{if(n.type==="ECHLY_FEEDBACK_CREATED"&&n.ticket&&n.sessionId){ce("CONTENT","dispatch event",{type:"ECHLY_FEEDBACK_CREATED"}),window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:n.ticket,sessionId:n.sessionId}}));return}let a=document.getElementById(tm);a&&(n.type==="ECHLY_GLOBAL_STATE"&&n.state&&(ce("CONTENT","global state received",n.state),a.style.display=n.state.visible?"block":"none",ce("CONTENT","dispatch event",{type:"ECHLY_GLOBAL_STATE"}),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:n.state}}))),n.type==="ECHLY_TOGGLE"&&(ce("CONTENT","dispatch event",{type:"ECHLY_TOGGLE_WIDGET"}),window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET"))))}))}function HU(){let t=document.getElementById(tm);t||(t=document.createElement("div"),t.id=tm,t.setAttribute("data-echly-ui","true"),t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),UU(t)),zU(t),BU(t),qU()}HU();})();
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
