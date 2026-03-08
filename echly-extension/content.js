"use strict";(()=>{var Vk=Object.create;var fm=Object.defineProperty;var Fk=Object.getOwnPropertyDescriptor;var Uk=Object.getOwnPropertyNames;var Bk=Object.getPrototypeOf,qk=Object.prototype.hasOwnProperty;var oE=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,n)=>(typeof require<"u"?require:e)[n]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var Hk=(t,e)=>()=>(t&&(e=t(t=0)),e);var Oe=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),zk=(t,e)=>{for(var n in e)fm(t,n,{get:e[n],enumerable:!0})},Gk=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Uk(e))!qk.call(t,r)&&r!==n&&fm(t,r,{get:()=>e[r],enumerable:!(a=Fk(e,r))||a.enumerable});return t};var Le=(t,e,n)=>(n=t!=null?Vk(Bk(t)):{},Gk(e||!t||!t.__esModule?fm(n,"default",{value:t,enumerable:!0}):n,t));var IE=Oe(ce=>{"use strict";var mm=Symbol.for("react.transitional.element"),jk=Symbol.for("react.portal"),Kk=Symbol.for("react.fragment"),Wk=Symbol.for("react.strict_mode"),Yk=Symbol.for("react.profiler"),Xk=Symbol.for("react.consumer"),Qk=Symbol.for("react.context"),$k=Symbol.for("react.forward_ref"),Jk=Symbol.for("react.suspense"),Zk=Symbol.for("react.memo"),fE=Symbol.for("react.lazy"),e1=Symbol.for("react.activity"),uE=Symbol.iterator;function t1(t){return t===null||typeof t!="object"?null:(t=uE&&t[uE]||t["@@iterator"],typeof t=="function"?t:null)}var hE={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},pE=Object.assign,mE={};function eo(t,e,n){this.props=t,this.context=e,this.refs=mE,this.updater=n||hE}eo.prototype.isReactComponent={};eo.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};eo.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function gE(){}gE.prototype=eo.prototype;function gm(t,e,n){this.props=t,this.context=e,this.refs=mE,this.updater=n||hE}var ym=gm.prototype=new gE;ym.constructor=gm;pE(ym,eo.prototype);ym.isPureReactComponent=!0;var lE=Array.isArray;function pm(){}var st={H:null,A:null,T:null,S:null},yE=Object.prototype.hasOwnProperty;function Im(t,e,n){var a=n.ref;return{$$typeof:mm,type:t,key:e,ref:a!==void 0?a:null,props:n}}function n1(t,e){return Im(t.type,e,t.props)}function _m(t){return typeof t=="object"&&t!==null&&t.$$typeof===mm}function a1(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var cE=/\/+/g;function hm(t,e){return typeof t=="object"&&t!==null&&t.key!=null?a1(""+t.key):e.toString(36)}function r1(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(pm,pm):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function Zi(t,e,n,a,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case mm:case jk:i=!0;break;case fE:return i=t._init,Zi(i(t._payload),e,n,a,r)}}if(i)return r=r(t),i=a===""?"."+hm(t,0):a,lE(r)?(n="",i!=null&&(n=i.replace(cE,"$&/")+"/"),Zi(r,e,n,"",function(c){return c})):r!=null&&(_m(r)&&(r=n1(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(cE,"$&/")+"/")+i)),e.push(r)),1;i=0;var u=a===""?".":a+":";if(lE(t))for(var l=0;l<t.length;l++)a=t[l],s=u+hm(a,l),i+=Zi(a,e,n,s,r);else if(l=t1(t),typeof l=="function")for(t=l.call(t),l=0;!(a=t.next()).done;)a=a.value,s=u+hm(a,l++),i+=Zi(a,e,n,s,r);else if(s==="object"){if(typeof t.then=="function")return Zi(r1(t),e,n,a,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function Ed(t,e,n){if(t==null)return t;var a=[],r=0;return Zi(t,a,"","",function(s){return e.call(n,s,r++)}),a}function s1(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var dE=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},i1={map:Ed,forEach:function(t,e,n){Ed(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ed(t,function(){e++}),e},toArray:function(t){return Ed(t,function(e){return e})||[]},only:function(t){if(!_m(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};ce.Activity=e1;ce.Children=i1;ce.Component=eo;ce.Fragment=Kk;ce.Profiler=Yk;ce.PureComponent=gm;ce.StrictMode=Wk;ce.Suspense=Jk;ce.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=st;ce.__COMPILER_RUNTIME={__proto__:null,c:function(t){return st.H.useMemoCache(t)}};ce.cache=function(t){return function(){return t.apply(null,arguments)}};ce.cacheSignal=function(){return null};ce.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var a=pE({},t.props),r=t.key;if(e!=null)for(s in e.key!==void 0&&(r=""+e.key),e)!yE.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(a[s]=e[s]);var s=arguments.length-2;if(s===1)a.children=n;else if(1<s){for(var i=Array(s),u=0;u<s;u++)i[u]=arguments[u+2];a.children=i}return Im(t.type,r,a)};ce.createContext=function(t){return t={$$typeof:Qk,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:Xk,_context:t},t};ce.createElement=function(t,e,n){var a,r={},s=null;if(e!=null)for(a in e.key!==void 0&&(s=""+e.key),e)yE.call(e,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(r[a]=e[a]);var i=arguments.length-2;if(i===1)r.children=n;else if(1<i){for(var u=Array(i),l=0;l<i;l++)u[l]=arguments[l+2];r.children=u}if(t&&t.defaultProps)for(a in i=t.defaultProps,i)r[a]===void 0&&(r[a]=i[a]);return Im(t,s,r)};ce.createRef=function(){return{current:null}};ce.forwardRef=function(t){return{$$typeof:$k,render:t}};ce.isValidElement=_m;ce.lazy=function(t){return{$$typeof:fE,_payload:{_status:-1,_result:t},_init:s1}};ce.memo=function(t,e){return{$$typeof:Zk,type:t,compare:e===void 0?null:e}};ce.startTransition=function(t){var e=st.T,n={};st.T=n;try{var a=t(),r=st.S;r!==null&&r(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(pm,dE)}catch(s){dE(s)}finally{e!==null&&n.types!==null&&(e.types=n.types),st.T=e}};ce.unstable_useCacheRefresh=function(){return st.H.useCacheRefresh()};ce.use=function(t){return st.H.use(t)};ce.useActionState=function(t,e,n){return st.H.useActionState(t,e,n)};ce.useCallback=function(t,e){return st.H.useCallback(t,e)};ce.useContext=function(t){return st.H.useContext(t)};ce.useDebugValue=function(){};ce.useDeferredValue=function(t,e){return st.H.useDeferredValue(t,e)};ce.useEffect=function(t,e){return st.H.useEffect(t,e)};ce.useEffectEvent=function(t){return st.H.useEffectEvent(t)};ce.useId=function(){return st.H.useId()};ce.useImperativeHandle=function(t,e,n){return st.H.useImperativeHandle(t,e,n)};ce.useInsertionEffect=function(t,e){return st.H.useInsertionEffect(t,e)};ce.useLayoutEffect=function(t,e){return st.H.useLayoutEffect(t,e)};ce.useMemo=function(t,e){return st.H.useMemo(t,e)};ce.useOptimistic=function(t,e){return st.H.useOptimistic(t,e)};ce.useReducer=function(t,e,n){return st.H.useReducer(t,e,n)};ce.useRef=function(t){return st.H.useRef(t)};ce.useState=function(t){return st.H.useState(t)};ce.useSyncExternalStore=function(t,e,n){return st.H.useSyncExternalStore(t,e,n)};ce.useTransition=function(){return st.H.useTransition()};ce.version="19.2.3"});var Yn=Oe((zU,_E)=>{"use strict";_E.exports=IE()});var xE=Oe(ht=>{"use strict";function Tm(t,e){var n=t.length;t.push(e);e:for(;0<n;){var a=n-1>>>1,r=t[a];if(0<Td(r,e))t[a]=e,t[n]=r,n=a;else break e}}function Ba(t){return t.length===0?null:t[0]}function wd(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var a=0,r=t.length,s=r>>>1;a<s;){var i=2*(a+1)-1,u=t[i],l=i+1,c=t[l];if(0>Td(u,n))l<r&&0>Td(c,u)?(t[a]=c,t[l]=n,a=l):(t[a]=u,t[i]=n,a=i);else if(l<r&&0>Td(c,n))t[a]=c,t[l]=n,a=l;else break e}}return e}function Td(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}ht.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(SE=performance,ht.unstable_now=function(){return SE.now()}):(Sm=Date,vE=Sm.now(),ht.unstable_now=function(){return Sm.now()-vE});var SE,Sm,vE,pr=[],ps=[],o1=1,ua=null,Tn=3,bm=!1,Ju=!1,Zu=!1,wm=!1,bE=typeof setTimeout=="function"?setTimeout:null,wE=typeof clearTimeout=="function"?clearTimeout:null,EE=typeof setImmediate<"u"?setImmediate:null;function bd(t){for(var e=Ba(ps);e!==null;){if(e.callback===null)wd(ps);else if(e.startTime<=t)wd(ps),e.sortIndex=e.expirationTime,Tm(pr,e);else break;e=Ba(ps)}}function Cm(t){if(Zu=!1,bd(t),!Ju)if(Ba(pr)!==null)Ju=!0,no||(no=!0,to());else{var e=Ba(ps);e!==null&&Lm(Cm,e.startTime-t)}}var no=!1,el=-1,CE=5,LE=-1;function AE(){return wm?!0:!(ht.unstable_now()-LE<CE)}function vm(){if(wm=!1,no){var t=ht.unstable_now();LE=t;var e=!0;try{e:{Ju=!1,Zu&&(Zu=!1,wE(el),el=-1),bm=!0;var n=Tn;try{t:{for(bd(t),ua=Ba(pr);ua!==null&&!(ua.expirationTime>t&&AE());){var a=ua.callback;if(typeof a=="function"){ua.callback=null,Tn=ua.priorityLevel;var r=a(ua.expirationTime<=t);if(t=ht.unstable_now(),typeof r=="function"){ua.callback=r,bd(t),e=!0;break t}ua===Ba(pr)&&wd(pr),bd(t)}else wd(pr);ua=Ba(pr)}if(ua!==null)e=!0;else{var s=Ba(ps);s!==null&&Lm(Cm,s.startTime-t),e=!1}}break e}finally{ua=null,Tn=n,bm=!1}e=void 0}}finally{e?to():no=!1}}}var to;typeof EE=="function"?to=function(){EE(vm)}:typeof MessageChannel<"u"?(Em=new MessageChannel,TE=Em.port2,Em.port1.onmessage=vm,to=function(){TE.postMessage(null)}):to=function(){bE(vm,0)};var Em,TE;function Lm(t,e){el=bE(function(){t(ht.unstable_now())},e)}ht.unstable_IdlePriority=5;ht.unstable_ImmediatePriority=1;ht.unstable_LowPriority=4;ht.unstable_NormalPriority=3;ht.unstable_Profiling=null;ht.unstable_UserBlockingPriority=2;ht.unstable_cancelCallback=function(t){t.callback=null};ht.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):CE=0<t?Math.floor(1e3/t):5};ht.unstable_getCurrentPriorityLevel=function(){return Tn};ht.unstable_next=function(t){switch(Tn){case 1:case 2:case 3:var e=3;break;default:e=Tn}var n=Tn;Tn=e;try{return t()}finally{Tn=n}};ht.unstable_requestPaint=function(){wm=!0};ht.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=Tn;Tn=t;try{return e()}finally{Tn=n}};ht.unstable_scheduleCallback=function(t,e,n){var a=ht.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:o1++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>a?(t.sortIndex=n,Tm(ps,t),Ba(pr)===null&&t===Ba(ps)&&(Zu?(wE(el),el=-1):Zu=!0,Lm(Cm,n-a))):(t.sortIndex=r,Tm(pr,t),Ju||bm||(Ju=!0,no||(no=!0,to()))),t};ht.unstable_shouldYield=AE;ht.unstable_wrapCallback=function(t){var e=Tn;return function(){var n=Tn;Tn=e;try{return t.apply(this,arguments)}finally{Tn=n}}}});var kE=Oe((jU,RE)=>{"use strict";RE.exports=xE()});var PE=Oe(kn=>{"use strict";var u1=Yn();function DE(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ms(){}var Rn={d:{f:ms,r:function(){throw Error(DE(522))},D:ms,C:ms,L:ms,m:ms,X:ms,S:ms,M:ms},p:0,findDOMNode:null},l1=Symbol.for("react.portal");function c1(t,e,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:l1,key:a==null?null:""+a,children:t,containerInfo:e,implementation:n}}var tl=u1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Cd(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}kn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Rn;kn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(DE(299));return c1(t,e,null,n)};kn.flushSync=function(t){var e=tl.T,n=Rn.p;try{if(tl.T=null,Rn.p=2,t)return t()}finally{tl.T=e,Rn.p=n,Rn.d.f()}};kn.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,Rn.d.C(t,e))};kn.prefetchDNS=function(t){typeof t=="string"&&Rn.d.D(t)};kn.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,a=Cd(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,s=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?Rn.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:a,integrity:r,fetchPriority:s}):n==="script"&&Rn.d.X(t,{crossOrigin:a,integrity:r,fetchPriority:s,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};kn.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Cd(e.as,e.crossOrigin);Rn.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&Rn.d.M(t)};kn.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,a=Cd(n,e.crossOrigin);Rn.d.L(t,n,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};kn.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Cd(e.as,e.crossOrigin);Rn.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else Rn.d.m(t)};kn.requestFormReset=function(t){Rn.d.r(t)};kn.unstable_batchedUpdates=function(t,e){return t(e)};kn.useFormState=function(t,e,n){return tl.H.useFormState(t,e,n)};kn.useFormStatus=function(){return tl.H.useHostTransitionStatus()};kn.version="19.2.3"});var Ld=Oe((WU,ME)=>{"use strict";function OE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(OE)}catch(t){console.error(t)}}OE(),ME.exports=PE()});var WC=Oe(Zf=>{"use strict";var Xt=kE(),ob=Yn(),d1=Ld();function F(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ub(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function ql(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function lb(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function cb(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function NE(t){if(ql(t)!==t)throw Error(F(188))}function f1(t){var e=t.alternate;if(!e){if(e=ql(t),e===null)throw Error(F(188));return e!==t?null:t}for(var n=t,a=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(a=r.return,a!==null){n=a;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return NE(r),t;if(s===a)return NE(r),e;s=s.sibling}throw Error(F(188))}if(n.return!==a.return)n=r,a=s;else{for(var i=!1,u=r.child;u;){if(u===n){i=!0,n=r,a=s;break}if(u===a){i=!0,a=r,n=s;break}u=u.sibling}if(!i){for(u=s.child;u;){if(u===n){i=!0,n=s,a=r;break}if(u===a){i=!0,a=s,n=r;break}u=u.sibling}if(!i)throw Error(F(189))}}if(n.alternate!==a)throw Error(F(190))}if(n.tag!==3)throw Error(F(188));return n.stateNode.current===n?t:e}function db(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=db(t),e!==null)return e;t=t.sibling}return null}var ut=Object.assign,h1=Symbol.for("react.element"),Ad=Symbol.for("react.transitional.element"),ll=Symbol.for("react.portal"),uo=Symbol.for("react.fragment"),fb=Symbol.for("react.strict_mode"),og=Symbol.for("react.profiler"),hb=Symbol.for("react.consumer"),Er=Symbol.for("react.context"),ny=Symbol.for("react.forward_ref"),ug=Symbol.for("react.suspense"),lg=Symbol.for("react.suspense_list"),ay=Symbol.for("react.memo"),gs=Symbol.for("react.lazy");Symbol.for("react.scope");var cg=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var p1=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var VE=Symbol.iterator;function nl(t){return t===null||typeof t!="object"?null:(t=VE&&t[VE]||t["@@iterator"],typeof t=="function"?t:null)}var m1=Symbol.for("react.client.reference");function dg(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===m1?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case uo:return"Fragment";case og:return"Profiler";case fb:return"StrictMode";case ug:return"Suspense";case lg:return"SuspenseList";case cg:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case ll:return"Portal";case Er:return t.displayName||"Context";case hb:return(t._context.displayName||"Context")+".Consumer";case ny:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case ay:return e=t.displayName||null,e!==null?e:dg(t.type)||"Memo";case gs:e=t._payload,t=t._init;try{return dg(t(e))}catch{}}return null}var cl=Array.isArray,se=ob.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ve=d1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ii={pending:!1,data:null,method:null,action:null},fg=[],lo=-1;function ja(t){return{current:t}}function nn(t){0>lo||(t.current=fg[lo],fg[lo]=null,lo--)}function nt(t,e){lo++,fg[lo]=t.current,t.current=e}var Ga=ja(null),Ll=ja(null),Ls=ja(null),uf=ja(null);function lf(t,e){switch(nt(Ls,e),nt(Ll,t),nt(Ga,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?GT(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=GT(e),t=PC(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}nn(Ga),nt(Ga,t)}function Ao(){nn(Ga),nn(Ll),nn(Ls)}function hg(t){t.memoizedState!==null&&nt(uf,t);var e=Ga.current,n=PC(e,t.type);e!==n&&(nt(Ll,t),nt(Ga,n))}function cf(t){Ll.current===t&&(nn(Ga),nn(Ll)),uf.current===t&&(nn(uf),Fl._currentValue=ii)}var Am,FE;function ni(t){if(Am===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Am=e&&e[1]||"",FE=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Am+t+FE}var xm=!1;function Rm(t,e){if(!t||xm)return"";xm=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(e){var m=function(){throw Error()};if(Object.defineProperty(m.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(m,[])}catch(S){var p=S}Reflect.construct(t,[],m)}else{try{m.call()}catch(S){p=S}t.call(m.prototype)}}else{try{throw Error()}catch(S){p=S}(m=t())&&typeof m.catch=="function"&&m.catch(function(){})}}catch(S){if(S&&p&&typeof S.stack=="string")return[S.stack,p.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=a.DetermineComponentFrameRoot(),i=s[0],u=s[1];if(i&&u){var l=i.split(`
`),c=u.split(`
`);for(r=a=0;a<l.length&&!l[a].includes("DetermineComponentFrameRoot");)a++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(a===l.length||r===c.length)for(a=l.length-1,r=c.length-1;1<=a&&0<=r&&l[a]!==c[r];)r--;for(;1<=a&&0<=r;a--,r--)if(l[a]!==c[r]){if(a!==1||r!==1)do if(a--,r--,0>r||l[a]!==c[r]){var f=`
`+l[a].replace(" at new "," at ");return t.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",t.displayName)),f}while(1<=a&&0<=r);break}}}finally{xm=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?ni(n):""}function g1(t,e){switch(t.tag){case 26:case 27:case 5:return ni(t.type);case 16:return ni("Lazy");case 13:return t.child!==e&&e!==null?ni("Suspense Fallback"):ni("Suspense");case 19:return ni("SuspenseList");case 0:case 15:return Rm(t.type,!1);case 11:return Rm(t.type.render,!1);case 1:return Rm(t.type,!0);case 31:return ni("Activity");default:return""}}function UE(t){try{var e="",n=null;do e+=g1(t,n),n=t,t=t.return;while(t);return e}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var pg=Object.prototype.hasOwnProperty,ry=Xt.unstable_scheduleCallback,km=Xt.unstable_cancelCallback,y1=Xt.unstable_shouldYield,I1=Xt.unstable_requestPaint,Zn=Xt.unstable_now,_1=Xt.unstable_getCurrentPriorityLevel,pb=Xt.unstable_ImmediatePriority,mb=Xt.unstable_UserBlockingPriority,df=Xt.unstable_NormalPriority,S1=Xt.unstable_LowPriority,gb=Xt.unstable_IdlePriority,v1=Xt.log,E1=Xt.unstable_setDisableYieldValue,Hl=null,ea=null;function Es(t){if(typeof v1=="function"&&E1(t),ea&&typeof ea.setStrictMode=="function")try{ea.setStrictMode(Hl,t)}catch{}}var ta=Math.clz32?Math.clz32:w1,T1=Math.log,b1=Math.LN2;function w1(t){return t>>>=0,t===0?32:31-(T1(t)/b1|0)|0}var xd=256,Rd=262144,kd=4194304;function ai(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Vf(t,e,n){var a=t.pendingLanes;if(a===0)return 0;var r=0,s=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var u=a&134217727;return u!==0?(a=u&~s,a!==0?r=ai(a):(i&=u,i!==0?r=ai(i):n||(n=u&~t,n!==0&&(r=ai(n))))):(u=a&~s,u!==0?r=ai(u):i!==0?r=ai(i):n||(n=a&~t,n!==0&&(r=ai(n)))),r===0?0:e!==0&&e!==r&&!(e&s)&&(s=r&-r,n=e&-e,s>=n||s===32&&(n&4194048)!==0)?e:r}function zl(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function C1(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function yb(){var t=kd;return kd<<=1,!(kd&62914560)&&(kd=4194304),t}function Dm(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Gl(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function L1(t,e,n,a,r,s){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var u=t.entanglements,l=t.expirationTimes,c=t.hiddenUpdates;for(n=i&~n;0<n;){var f=31-ta(n),m=1<<f;u[f]=0,l[f]=-1;var p=c[f];if(p!==null)for(c[f]=null,f=0;f<p.length;f++){var S=p[f];S!==null&&(S.lane&=-536870913)}n&=~m}a!==0&&Ib(t,a,0),s!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=s&~(i&~e))}function Ib(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var a=31-ta(e);t.entangledLanes|=e,t.entanglements[a]=t.entanglements[a]|1073741824|n&261930}function _b(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var a=31-ta(n),r=1<<a;r&e|t[a]&e&&(t[a]|=e),n&=~r}}function Sb(t,e){var n=e&-e;return n=n&42?1:sy(n),n&(t.suspendedLanes|e)?0:n}function sy(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function iy(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function vb(){var t=Ve.p;return t!==0?t:(t=window.event,t===void 0?32:GC(t.type))}function BE(t,e){var n=Ve.p;try{return Ve.p=t,e()}finally{Ve.p=n}}var Bs=Math.random().toString(36).slice(2),hn="__reactFiber$"+Bs,Un="__reactProps$"+Bs,Uo="__reactContainer$"+Bs,mg="__reactEvents$"+Bs,A1="__reactListeners$"+Bs,x1="__reactHandles$"+Bs,qE="__reactResources$"+Bs,jl="__reactMarker$"+Bs;function oy(t){delete t[hn],delete t[Un],delete t[mg],delete t[A1],delete t[x1]}function co(t){var e=t[hn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Uo]||n[hn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=XT(t);t!==null;){if(n=t[hn])return n;t=XT(t)}return e}t=n,n=t.parentNode}return null}function Bo(t){if(t=t[hn]||t[Uo]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function dl(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(F(33))}function vo(t){var e=t[qE];return e||(e=t[qE]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function tn(t){t[jl]=!0}var Eb=new Set,Tb={};function gi(t,e){xo(t,e),xo(t+"Capture",e)}function xo(t,e){for(Tb[t]=e,t=0;t<e.length;t++)Eb.add(e[t])}var R1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),HE={},zE={};function k1(t){return pg.call(zE,t)?!0:pg.call(HE,t)?!1:R1.test(t)?zE[t]=!0:(HE[t]=!0,!1)}function Kd(t,e,n){if(k1(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var a=e.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Dd(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function mr(t,e,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+a)}}function ca(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function bb(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function D1(t,e,n){var a=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var r=a.get,s=a.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(i){n=""+i,s.call(this,i)}}),Object.defineProperty(t,e,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function gg(t){if(!t._valueTracker){var e=bb(t)?"checked":"value";t._valueTracker=D1(t,e,""+t[e])}}function wb(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),a="";return t&&(a=bb(t)?t.checked?"true":"false":t.value),t=a,t!==n?(e.setValue(t),!0):!1}function ff(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var P1=/[\n"\\]/g;function ha(t){return t.replace(P1,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function yg(t,e,n,a,r,s,i,u){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+ca(e)):t.value!==""+ca(e)&&(t.value=""+ca(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?Ig(t,i,ca(e)):n!=null?Ig(t,i,ca(n)):a!=null&&t.removeAttribute("value"),r==null&&s!=null&&(t.defaultChecked=!!s),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.name=""+ca(u):t.removeAttribute("name")}function Cb(t,e,n,a,r,s,i,u){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.type=s),e!=null||n!=null){if(!(s!=="submit"&&s!=="reset"||e!=null)){gg(t);return}n=n!=null?""+ca(n):"",e=e!=null?""+ca(e):n,u||e===t.value||(t.value=e),t.defaultValue=e}a=a??r,a=typeof a!="function"&&typeof a!="symbol"&&!!a,t.checked=u?t.checked:!!a,t.defaultChecked=!!a,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),gg(t)}function Ig(t,e,n){e==="number"&&ff(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function Eo(t,e,n,a){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&a&&(t[n].defaultSelected=!0)}else{for(n=""+ca(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,a&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function Lb(t,e,n){if(e!=null&&(e=""+ca(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+ca(n):""}function Ab(t,e,n,a){if(e==null){if(a!=null){if(n!=null)throw Error(F(92));if(cl(a)){if(1<a.length)throw Error(F(93));a=a[0]}n=a}n==null&&(n=""),e=n}n=ca(e),t.defaultValue=n,a=t.textContent,a===n&&a!==""&&a!==null&&(t.value=a),gg(t)}function Ro(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var O1=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function GE(t,e,n){var a=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":a?t.setProperty(e,n):typeof n!="number"||n===0||O1.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function xb(t,e,n){if(e!=null&&typeof e!="object")throw Error(F(62));if(t=t.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||e!=null&&e.hasOwnProperty(a)||(a.indexOf("--")===0?t.setProperty(a,""):a==="float"?t.cssFloat="":t[a]="");for(var r in e)a=e[r],e.hasOwnProperty(r)&&n[r]!==a&&GE(t,r,a)}else for(var s in e)e.hasOwnProperty(s)&&GE(t,s,e[s])}function uy(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var M1=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),N1=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Wd(t){return N1.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function Tr(){}var _g=null;function ly(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var fo=null,To=null;function jE(t){var e=Bo(t);if(e&&(t=e.stateNode)){var n=t[Un]||null;e:switch(t=e.stateNode,e.type){case"input":if(yg(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+ha(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var a=n[e];if(a!==t&&a.form===t.form){var r=a[Un]||null;if(!r)throw Error(F(90));yg(a,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)a=n[e],a.form===t.form&&wb(a)}break e;case"textarea":Lb(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&Eo(t,!!n.multiple,e,!1)}}}var Pm=!1;function Rb(t,e,n){if(Pm)return t(e,n);Pm=!0;try{var a=t(e);return a}finally{if(Pm=!1,(fo!==null||To!==null)&&(Xf(),fo&&(e=fo,t=To,To=fo=null,jE(e),t)))for(e=0;e<t.length;e++)jE(t[e])}}function Al(t,e){var n=t.stateNode;if(n===null)return null;var a=n[Un]||null;if(a===null)return null;n=a[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(t=t.type,a=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!a;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(F(231,e,typeof n));return n}var Ar=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Sg=!1;if(Ar)try{ao={},Object.defineProperty(ao,"passive",{get:function(){Sg=!0}}),window.addEventListener("test",ao,ao),window.removeEventListener("test",ao,ao)}catch{Sg=!1}var ao,Ts=null,cy=null,Yd=null;function kb(){if(Yd)return Yd;var t,e=cy,n=e.length,a,r="value"in Ts?Ts.value:Ts.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var i=n-t;for(a=1;a<=i&&e[n-a]===r[s-a];a++);return Yd=r.slice(t,1<a?1-a:void 0)}function Xd(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Pd(){return!0}function KE(){return!1}function Bn(t){function e(n,a,r,s,i){this._reactName=n,this._targetInst=r,this.type=a,this.nativeEvent=s,this.target=i,this.currentTarget=null;for(var u in t)t.hasOwnProperty(u)&&(n=t[u],this[u]=n?n(s):s[u]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Pd:KE,this.isPropagationStopped=KE,this}return ut(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Pd)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Pd)},persist:function(){},isPersistent:Pd}),e}var yi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ff=Bn(yi),Kl=ut({},yi,{view:0,detail:0}),V1=Bn(Kl),Om,Mm,al,Uf=ut({},Kl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:dy,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==al&&(al&&t.type==="mousemove"?(Om=t.screenX-al.screenX,Mm=t.screenY-al.screenY):Mm=Om=0,al=t),Om)},movementY:function(t){return"movementY"in t?t.movementY:Mm}}),WE=Bn(Uf),F1=ut({},Uf,{dataTransfer:0}),U1=Bn(F1),B1=ut({},Kl,{relatedTarget:0}),Nm=Bn(B1),q1=ut({},yi,{animationName:0,elapsedTime:0,pseudoElement:0}),H1=Bn(q1),z1=ut({},yi,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),G1=Bn(z1),j1=ut({},yi,{data:0}),YE=Bn(j1),K1={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},W1={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Y1={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function X1(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Y1[t])?!!e[t]:!1}function dy(){return X1}var Q1=ut({},Kl,{key:function(t){if(t.key){var e=K1[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Xd(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?W1[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:dy,charCode:function(t){return t.type==="keypress"?Xd(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Xd(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),$1=Bn(Q1),J1=ut({},Uf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),XE=Bn(J1),Z1=ut({},Kl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:dy}),eD=Bn(Z1),tD=ut({},yi,{propertyName:0,elapsedTime:0,pseudoElement:0}),nD=Bn(tD),aD=ut({},Uf,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),rD=Bn(aD),sD=ut({},yi,{newState:0,oldState:0}),iD=Bn(sD),oD=[9,13,27,32],fy=Ar&&"CompositionEvent"in window,pl=null;Ar&&"documentMode"in document&&(pl=document.documentMode);var uD=Ar&&"TextEvent"in window&&!pl,Db=Ar&&(!fy||pl&&8<pl&&11>=pl),QE=" ",$E=!1;function Pb(t,e){switch(t){case"keyup":return oD.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ob(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var ho=!1;function lD(t,e){switch(t){case"compositionend":return Ob(e);case"keypress":return e.which!==32?null:($E=!0,QE);case"textInput":return t=e.data,t===QE&&$E?null:t;default:return null}}function cD(t,e){if(ho)return t==="compositionend"||!fy&&Pb(t,e)?(t=kb(),Yd=cy=Ts=null,ho=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Db&&e.locale!=="ko"?null:e.data;default:return null}}var dD={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function JE(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!dD[t.type]:e==="textarea"}function Mb(t,e,n,a){fo?To?To.push(a):To=[a]:fo=a,e=Rf(e,"onChange"),0<e.length&&(n=new Ff("onChange","change",null,n,a),t.push({event:n,listeners:e}))}var ml=null,xl=null;function fD(t){RC(t,0)}function Bf(t){var e=dl(t);if(wb(e))return t}function ZE(t,e){if(t==="change")return e}var Nb=!1;Ar&&(Ar?(Md="oninput"in document,Md||(Vm=document.createElement("div"),Vm.setAttribute("oninput","return;"),Md=typeof Vm.oninput=="function"),Od=Md):Od=!1,Nb=Od&&(!document.documentMode||9<document.documentMode));var Od,Md,Vm;function eT(){ml&&(ml.detachEvent("onpropertychange",Vb),xl=ml=null)}function Vb(t){if(t.propertyName==="value"&&Bf(xl)){var e=[];Mb(e,xl,t,ly(t)),Rb(fD,e)}}function hD(t,e,n){t==="focusin"?(eT(),ml=e,xl=n,ml.attachEvent("onpropertychange",Vb)):t==="focusout"&&eT()}function pD(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Bf(xl)}function mD(t,e){if(t==="click")return Bf(e)}function gD(t,e){if(t==="input"||t==="change")return Bf(e)}function yD(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var aa=typeof Object.is=="function"?Object.is:yD;function Rl(t,e){if(aa(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),a=Object.keys(e);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var r=n[a];if(!pg.call(e,r)||!aa(t[r],e[r]))return!1}return!0}function tT(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function nT(t,e){var n=tT(t);t=0;for(var a;n;){if(n.nodeType===3){if(a=t+n.textContent.length,t<=e&&a>=e)return{node:n,offset:e-t};t=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=tT(n)}}function Fb(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Fb(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Ub(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=ff(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=ff(t.document)}return e}function hy(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var ID=Ar&&"documentMode"in document&&11>=document.documentMode,po=null,vg=null,gl=null,Eg=!1;function aT(t,e,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Eg||po==null||po!==ff(a)||(a=po,"selectionStart"in a&&hy(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),gl&&Rl(gl,a)||(gl=a,a=Rf(vg,"onSelect"),0<a.length&&(e=new Ff("onSelect","select",null,e,n),t.push({event:e,listeners:a}),e.target=po)))}function ti(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var mo={animationend:ti("Animation","AnimationEnd"),animationiteration:ti("Animation","AnimationIteration"),animationstart:ti("Animation","AnimationStart"),transitionrun:ti("Transition","TransitionRun"),transitionstart:ti("Transition","TransitionStart"),transitioncancel:ti("Transition","TransitionCancel"),transitionend:ti("Transition","TransitionEnd")},Fm={},Bb={};Ar&&(Bb=document.createElement("div").style,"AnimationEvent"in window||(delete mo.animationend.animation,delete mo.animationiteration.animation,delete mo.animationstart.animation),"TransitionEvent"in window||delete mo.transitionend.transition);function Ii(t){if(Fm[t])return Fm[t];if(!mo[t])return t;var e=mo[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Bb)return Fm[t]=e[n];return t}var qb=Ii("animationend"),Hb=Ii("animationiteration"),zb=Ii("animationstart"),_D=Ii("transitionrun"),SD=Ii("transitionstart"),vD=Ii("transitioncancel"),Gb=Ii("transitionend"),jb=new Map,Tg="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Tg.push("scrollEnd");function Aa(t,e){jb.set(t,e),gi(e,[t])}var hf=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},la=[],go=0,py=0;function qf(){for(var t=go,e=py=go=0;e<t;){var n=la[e];la[e++]=null;var a=la[e];la[e++]=null;var r=la[e];la[e++]=null;var s=la[e];if(la[e++]=null,a!==null&&r!==null){var i=a.pending;i===null?r.next=r:(r.next=i.next,i.next=r),a.pending=r}s!==0&&Kb(n,r,s)}}function Hf(t,e,n,a){la[go++]=t,la[go++]=e,la[go++]=n,la[go++]=a,py|=a,t.lanes|=a,t=t.alternate,t!==null&&(t.lanes|=a)}function my(t,e,n,a){return Hf(t,e,n,a),pf(t)}function _i(t,e){return Hf(t,null,null,e),pf(t)}function Kb(t,e,n){t.lanes|=n;var a=t.alternate;a!==null&&(a.lanes|=n);for(var r=!1,s=t.return;s!==null;)s.childLanes|=n,a=s.alternate,a!==null&&(a.childLanes|=n),s.tag===22&&(t=s.stateNode,t===null||t._visibility&1||(r=!0)),t=s,s=s.return;return t.tag===3?(s=t.stateNode,r&&e!==null&&(r=31-ta(n),t=s.hiddenUpdates,a=t[r],a===null?t[r]=[e]:a.push(e),e.lane=n|536870912),s):null}function pf(t){if(50<wl)throw wl=0,Gg=null,Error(F(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var yo={};function ED(t,e,n,a){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function $n(t,e,n,a){return new ED(t,e,n,a)}function gy(t){return t=t.prototype,!(!t||!t.isReactComponent)}function wr(t,e){var n=t.alternate;return n===null?(n=$n(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function Wb(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Qd(t,e,n,a,r,s){var i=0;if(a=t,typeof t=="function")gy(t)&&(i=1);else if(typeof t=="string")i=wP(t,n,Ga.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case cg:return t=$n(31,n,e,r),t.elementType=cg,t.lanes=s,t;case uo:return oi(n.children,r,s,e);case fb:i=8,r|=24;break;case og:return t=$n(12,n,e,r|2),t.elementType=og,t.lanes=s,t;case ug:return t=$n(13,n,e,r),t.elementType=ug,t.lanes=s,t;case lg:return t=$n(19,n,e,r),t.elementType=lg,t.lanes=s,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Er:i=10;break e;case hb:i=9;break e;case ny:i=11;break e;case ay:i=14;break e;case gs:i=16,a=null;break e}i=29,n=Error(F(130,t===null?"null":typeof t,"")),a=null}return e=$n(i,n,e,r),e.elementType=t,e.type=a,e.lanes=s,e}function oi(t,e,n,a){return t=$n(7,t,a,e),t.lanes=n,t}function Um(t,e,n){return t=$n(6,t,null,e),t.lanes=n,t}function Yb(t){var e=$n(18,null,null,0);return e.stateNode=t,e}function Bm(t,e,n){return e=$n(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var rT=new WeakMap;function pa(t,e){if(typeof t=="object"&&t!==null){var n=rT.get(t);return n!==void 0?n:(e={value:t,source:e,stack:UE(e)},rT.set(t,e),e)}return{value:t,source:e,stack:UE(e)}}var Io=[],_o=0,mf=null,kl=0,da=[],fa=0,Ns=null,qa=1,Ha="";function Sr(t,e){Io[_o++]=kl,Io[_o++]=mf,mf=t,kl=e}function Xb(t,e,n){da[fa++]=qa,da[fa++]=Ha,da[fa++]=Ns,Ns=t;var a=qa;t=Ha;var r=32-ta(a)-1;a&=~(1<<r),n+=1;var s=32-ta(e)+r;if(30<s){var i=r-r%5;s=(a&(1<<i)-1).toString(32),a>>=i,r-=i,qa=1<<32-ta(e)+r|n<<r|a,Ha=s+t}else qa=1<<s|n<<r|a,Ha=t}function yy(t){t.return!==null&&(Sr(t,1),Xb(t,1,0))}function Iy(t){for(;t===mf;)mf=Io[--_o],Io[_o]=null,kl=Io[--_o],Io[_o]=null;for(;t===Ns;)Ns=da[--fa],da[fa]=null,Ha=da[--fa],da[fa]=null,qa=da[--fa],da[fa]=null}function Qb(t,e){da[fa++]=qa,da[fa++]=Ha,da[fa++]=Ns,qa=e.id,Ha=e.overflow,Ns=t}var pn=null,ot=null,xe=!1,As=null,ma=!1,bg=Error(F(519));function Vs(t){var e=Error(F(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Dl(pa(e,t)),bg}function sT(t){var e=t.stateNode,n=t.type,a=t.memoizedProps;switch(e[hn]=t,e[Un]=a,n){case"dialog":Te("cancel",e),Te("close",e);break;case"iframe":case"object":case"embed":Te("load",e);break;case"video":case"audio":for(n=0;n<Nl.length;n++)Te(Nl[n],e);break;case"source":Te("error",e);break;case"img":case"image":case"link":Te("error",e),Te("load",e);break;case"details":Te("toggle",e);break;case"input":Te("invalid",e),Cb(e,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":Te("invalid",e);break;case"textarea":Te("invalid",e),Ab(e,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||a.suppressHydrationWarning===!0||DC(e.textContent,n)?(a.popover!=null&&(Te("beforetoggle",e),Te("toggle",e)),a.onScroll!=null&&Te("scroll",e),a.onScrollEnd!=null&&Te("scrollend",e),a.onClick!=null&&(e.onclick=Tr),e=!0):e=!1,e||Vs(t,!0)}function iT(t){for(pn=t.return;pn;)switch(pn.tag){case 5:case 31:case 13:ma=!1;return;case 27:case 3:ma=!0;return;default:pn=pn.return}}function ro(t){if(t!==pn)return!1;if(!xe)return iT(t),xe=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||Xg(t.type,t.memoizedProps)),n=!n),n&&ot&&Vs(t),iT(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(F(317));ot=YT(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(F(317));ot=YT(t)}else e===27?(e=ot,qs(t.type)?(t=Zg,Zg=null,ot=t):ot=e):ot=pn?ya(t.stateNode.nextSibling):null;return!0}function di(){ot=pn=null,xe=!1}function qm(){var t=As;return t!==null&&(Vn===null?Vn=t:Vn.push.apply(Vn,t),As=null),t}function Dl(t){As===null?As=[t]:As.push(t)}var wg=ja(null),Si=null,br=null;function Is(t,e,n){nt(wg,e._currentValue),e._currentValue=n}function Cr(t){t._currentValue=wg.current,nn(wg)}function Cg(t,e,n){for(;t!==null;){var a=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,a!==null&&(a.childLanes|=e)):a!==null&&(a.childLanes&e)!==e&&(a.childLanes|=e),t===n)break;t=t.return}}function Lg(t,e,n,a){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var s=r.dependencies;if(s!==null){var i=r.child;s=s.firstContext;e:for(;s!==null;){var u=s;s=r;for(var l=0;l<e.length;l++)if(u.context===e[l]){s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),Cg(s.return,n,t),a||(i=null);break e}s=u.next}}else if(r.tag===18){if(i=r.return,i===null)throw Error(F(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),Cg(i,n,t),i=null}else i=r.child;if(i!==null)i.return=r;else for(i=r;i!==null;){if(i===t){i=null;break}if(r=i.sibling,r!==null){r.return=i.return,i=r;break}i=i.return}r=i}}function qo(t,e,n,a){t=null;for(var r=e,s=!1;r!==null;){if(!s){if(r.flags&524288)s=!0;else if(r.flags&262144)break}if(r.tag===10){var i=r.alternate;if(i===null)throw Error(F(387));if(i=i.memoizedProps,i!==null){var u=r.type;aa(r.pendingProps.value,i.value)||(t!==null?t.push(u):t=[u])}}else if(r===uf.current){if(i=r.alternate,i===null)throw Error(F(387));i.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(Fl):t=[Fl])}r=r.return}t!==null&&Lg(e,t,n,a),e.flags|=262144}function gf(t){for(t=t.firstContext;t!==null;){if(!aa(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function fi(t){Si=t,br=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function mn(t){return $b(Si,t)}function Nd(t,e){return Si===null&&fi(t),$b(t,e)}function $b(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},br===null){if(t===null)throw Error(F(308));br=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else br=br.next=e;return n}var TD=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,a){t.push(a)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},bD=Xt.unstable_scheduleCallback,wD=Xt.unstable_NormalPriority,Vt={$$typeof:Er,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function _y(){return{controller:new TD,data:new Map,refCount:0}}function Wl(t){t.refCount--,t.refCount===0&&bD(wD,function(){t.controller.abort()})}var yl=null,Ag=0,ko=0,bo=null;function CD(t,e){if(yl===null){var n=yl=[];Ag=0,ko=Gy(),bo={status:"pending",value:void 0,then:function(a){n.push(a)}}}return Ag++,e.then(oT,oT),e}function oT(){if(--Ag===0&&yl!==null){bo!==null&&(bo.status="fulfilled");var t=yl;yl=null,ko=0,bo=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function LD(t,e){var n=[],a={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){a.status="fulfilled",a.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(a.status="rejected",a.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),a}var uT=se.S;se.S=function(t,e){dC=Zn(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&CD(t,e),uT!==null&&uT(t,e)};var ui=ja(null);function Sy(){var t=ui.current;return t!==null?t:Ze.pooledCache}function $d(t,e){e===null?nt(ui,ui.current):nt(ui,e.pool)}function Jb(){var t=Sy();return t===null?null:{parent:Vt._currentValue,pool:t}}var Ho=Error(F(460)),vy=Error(F(474)),zf=Error(F(542)),yf={then:function(){}};function lT(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Zb(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(Tr,Tr),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,dT(t),t;default:if(typeof e.status=="string")e.then(Tr,Tr);else{if(t=Ze,t!==null&&100<t.shellSuspendCounter)throw Error(F(482));t=e,t.status="pending",t.then(function(a){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=a}},function(a){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=a}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,dT(t),t}throw li=e,Ho}}function ri(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(li=n,Ho):n}}var li=null;function cT(){if(li===null)throw Error(F(459));var t=li;return li=null,t}function dT(t){if(t===Ho||t===zf)throw Error(F(483))}var wo=null,Pl=0;function Vd(t){var e=Pl;return Pl+=1,wo===null&&(wo=[]),Zb(wo,t,e)}function rl(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Fd(t,e){throw e.$$typeof===h1?Error(F(525)):(t=Object.prototype.toString.call(e),Error(F(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function ew(t){function e(E,_){if(t){var w=E.deletions;w===null?(E.deletions=[_],E.flags|=16):w.push(_)}}function n(E,_){if(!t)return null;for(;_!==null;)e(E,_),_=_.sibling;return null}function a(E){for(var _=new Map;E!==null;)E.key!==null?_.set(E.key,E):_.set(E.index,E),E=E.sibling;return _}function r(E,_){return E=wr(E,_),E.index=0,E.sibling=null,E}function s(E,_,w){return E.index=w,t?(w=E.alternate,w!==null?(w=w.index,w<_?(E.flags|=67108866,_):w):(E.flags|=67108866,_)):(E.flags|=1048576,_)}function i(E){return t&&E.alternate===null&&(E.flags|=67108866),E}function u(E,_,w,L){return _===null||_.tag!==6?(_=Um(w,E.mode,L),_.return=E,_):(_=r(_,w),_.return=E,_)}function l(E,_,w,L){var q=w.type;return q===uo?f(E,_,w.props.children,L,w.key):_!==null&&(_.elementType===q||typeof q=="object"&&q!==null&&q.$$typeof===gs&&ri(q)===_.type)?(_=r(_,w.props),rl(_,w),_.return=E,_):(_=Qd(w.type,w.key,w.props,null,E.mode,L),rl(_,w),_.return=E,_)}function c(E,_,w,L){return _===null||_.tag!==4||_.stateNode.containerInfo!==w.containerInfo||_.stateNode.implementation!==w.implementation?(_=Bm(w,E.mode,L),_.return=E,_):(_=r(_,w.children||[]),_.return=E,_)}function f(E,_,w,L,q){return _===null||_.tag!==7?(_=oi(w,E.mode,L,q),_.return=E,_):(_=r(_,w),_.return=E,_)}function m(E,_,w){if(typeof _=="string"&&_!==""||typeof _=="number"||typeof _=="bigint")return _=Um(""+_,E.mode,w),_.return=E,_;if(typeof _=="object"&&_!==null){switch(_.$$typeof){case Ad:return w=Qd(_.type,_.key,_.props,null,E.mode,w),rl(w,_),w.return=E,w;case ll:return _=Bm(_,E.mode,w),_.return=E,_;case gs:return _=ri(_),m(E,_,w)}if(cl(_)||nl(_))return _=oi(_,E.mode,w,null),_.return=E,_;if(typeof _.then=="function")return m(E,Vd(_),w);if(_.$$typeof===Er)return m(E,Nd(E,_),w);Fd(E,_)}return null}function p(E,_,w,L){var q=_!==null?_.key:null;if(typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint")return q!==null?null:u(E,_,""+w,L);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Ad:return w.key===q?l(E,_,w,L):null;case ll:return w.key===q?c(E,_,w,L):null;case gs:return w=ri(w),p(E,_,w,L)}if(cl(w)||nl(w))return q!==null?null:f(E,_,w,L,null);if(typeof w.then=="function")return p(E,_,Vd(w),L);if(w.$$typeof===Er)return p(E,_,Nd(E,w),L);Fd(E,w)}return null}function S(E,_,w,L,q){if(typeof L=="string"&&L!==""||typeof L=="number"||typeof L=="bigint")return E=E.get(w)||null,u(_,E,""+L,q);if(typeof L=="object"&&L!==null){switch(L.$$typeof){case Ad:return E=E.get(L.key===null?w:L.key)||null,l(_,E,L,q);case ll:return E=E.get(L.key===null?w:L.key)||null,c(_,E,L,q);case gs:return L=ri(L),S(E,_,w,L,q)}if(cl(L)||nl(L))return E=E.get(w)||null,f(_,E,L,q,null);if(typeof L.then=="function")return S(E,_,w,Vd(L),q);if(L.$$typeof===Er)return S(E,_,w,Nd(_,L),q);Fd(_,L)}return null}function R(E,_,w,L){for(var q=null,z=null,v=_,g=_=0,I=null;v!==null&&g<w.length;g++){v.index>g?(I=v,v=null):I=v.sibling;var b=p(E,v,w[g],L);if(b===null){v===null&&(v=I);break}t&&v&&b.alternate===null&&e(E,v),_=s(b,_,g),z===null?q=b:z.sibling=b,z=b,v=I}if(g===w.length)return n(E,v),xe&&Sr(E,g),q;if(v===null){for(;g<w.length;g++)v=m(E,w[g],L),v!==null&&(_=s(v,_,g),z===null?q=v:z.sibling=v,z=v);return xe&&Sr(E,g),q}for(v=a(v);g<w.length;g++)I=S(v,E,g,w[g],L),I!==null&&(t&&I.alternate!==null&&v.delete(I.key===null?g:I.key),_=s(I,_,g),z===null?q=I:z.sibling=I,z=I);return t&&v.forEach(function(C){return e(E,C)}),xe&&Sr(E,g),q}function D(E,_,w,L){if(w==null)throw Error(F(151));for(var q=null,z=null,v=_,g=_=0,I=null,b=w.next();v!==null&&!b.done;g++,b=w.next()){v.index>g?(I=v,v=null):I=v.sibling;var C=p(E,v,b.value,L);if(C===null){v===null&&(v=I);break}t&&v&&C.alternate===null&&e(E,v),_=s(C,_,g),z===null?q=C:z.sibling=C,z=C,v=I}if(b.done)return n(E,v),xe&&Sr(E,g),q;if(v===null){for(;!b.done;g++,b=w.next())b=m(E,b.value,L),b!==null&&(_=s(b,_,g),z===null?q=b:z.sibling=b,z=b);return xe&&Sr(E,g),q}for(v=a(v);!b.done;g++,b=w.next())b=S(v,E,g,b.value,L),b!==null&&(t&&b.alternate!==null&&v.delete(b.key===null?g:b.key),_=s(b,_,g),z===null?q=b:z.sibling=b,z=b);return t&&v.forEach(function(x){return e(E,x)}),xe&&Sr(E,g),q}function A(E,_,w,L){if(typeof w=="object"&&w!==null&&w.type===uo&&w.key===null&&(w=w.props.children),typeof w=="object"&&w!==null){switch(w.$$typeof){case Ad:e:{for(var q=w.key;_!==null;){if(_.key===q){if(q=w.type,q===uo){if(_.tag===7){n(E,_.sibling),L=r(_,w.props.children),L.return=E,E=L;break e}}else if(_.elementType===q||typeof q=="object"&&q!==null&&q.$$typeof===gs&&ri(q)===_.type){n(E,_.sibling),L=r(_,w.props),rl(L,w),L.return=E,E=L;break e}n(E,_);break}else e(E,_);_=_.sibling}w.type===uo?(L=oi(w.props.children,E.mode,L,w.key),L.return=E,E=L):(L=Qd(w.type,w.key,w.props,null,E.mode,L),rl(L,w),L.return=E,E=L)}return i(E);case ll:e:{for(q=w.key;_!==null;){if(_.key===q)if(_.tag===4&&_.stateNode.containerInfo===w.containerInfo&&_.stateNode.implementation===w.implementation){n(E,_.sibling),L=r(_,w.children||[]),L.return=E,E=L;break e}else{n(E,_);break}else e(E,_);_=_.sibling}L=Bm(w,E.mode,L),L.return=E,E=L}return i(E);case gs:return w=ri(w),A(E,_,w,L)}if(cl(w))return R(E,_,w,L);if(nl(w)){if(q=nl(w),typeof q!="function")throw Error(F(150));return w=q.call(w),D(E,_,w,L)}if(typeof w.then=="function")return A(E,_,Vd(w),L);if(w.$$typeof===Er)return A(E,_,Nd(E,w),L);Fd(E,w)}return typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint"?(w=""+w,_!==null&&_.tag===6?(n(E,_.sibling),L=r(_,w),L.return=E,E=L):(n(E,_),L=Um(w,E.mode,L),L.return=E,E=L),i(E)):n(E,_)}return function(E,_,w,L){try{Pl=0;var q=A(E,_,w,L);return wo=null,q}catch(v){if(v===Ho||v===zf)throw v;var z=$n(29,v,null,E.mode);return z.lanes=L,z.return=E,z}finally{}}}var hi=ew(!0),tw=ew(!1),ys=!1;function Ey(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function xg(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function xs(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Rs(t,e,n){var a=t.updateQueue;if(a===null)return null;if(a=a.shared,Ne&2){var r=a.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),a.pending=e,e=pf(t),Kb(t,null,n),e}return Hf(t,a,e,n),pf(t)}function Il(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,_b(t,n)}}function Hm(t,e){var n=t.updateQueue,a=t.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};s===null?r=s=i:s=s.next=i,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:a.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:a.shared,callbacks:a.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var Rg=!1;function _l(){if(Rg){var t=bo;if(t!==null)throw t}}function Sl(t,e,n,a){Rg=!1;var r=t.updateQueue;ys=!1;var s=r.firstBaseUpdate,i=r.lastBaseUpdate,u=r.shared.pending;if(u!==null){r.shared.pending=null;var l=u,c=l.next;l.next=null,i===null?s=c:i.next=c,i=l;var f=t.alternate;f!==null&&(f=f.updateQueue,u=f.lastBaseUpdate,u!==i&&(u===null?f.firstBaseUpdate=c:u.next=c,f.lastBaseUpdate=l))}if(s!==null){var m=r.baseState;i=0,f=c=l=null,u=s;do{var p=u.lane&-536870913,S=p!==u.lane;if(S?(Ae&p)===p:(a&p)===p){p!==0&&p===ko&&(Rg=!0),f!==null&&(f=f.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var R=t,D=u;p=e;var A=n;switch(D.tag){case 1:if(R=D.payload,typeof R=="function"){m=R.call(A,m,p);break e}m=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=D.payload,p=typeof R=="function"?R.call(A,m,p):R,p==null)break e;m=ut({},m,p);break e;case 2:ys=!0}}p=u.callback,p!==null&&(t.flags|=64,S&&(t.flags|=8192),S=r.callbacks,S===null?r.callbacks=[p]:S.push(p))}else S={lane:p,tag:u.tag,payload:u.payload,callback:u.callback,next:null},f===null?(c=f=S,l=m):f=f.next=S,i|=p;if(u=u.next,u===null){if(u=r.shared.pending,u===null)break;S=u,u=S.next,S.next=null,r.lastBaseUpdate=S,r.shared.pending=null}}while(!0);f===null&&(l=m),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=f,s===null&&(r.shared.lanes=0),Us|=i,t.lanes=i,t.memoizedState=m}}function nw(t,e){if(typeof t!="function")throw Error(F(191,t));t.call(e)}function aw(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)nw(n[t],e)}var Do=ja(null),If=ja(0);function fT(t,e){t=Dr,nt(If,t),nt(Do,e),Dr=t|e.baseLanes}function kg(){nt(If,Dr),nt(Do,Do.current)}function Ty(){Dr=If.current,nn(Do),nn(If)}var ra=ja(null),ga=null;function _s(t){var e=t.alternate;nt(xt,xt.current&1),nt(ra,t),ga===null&&(e===null||Do.current!==null||e.memoizedState!==null)&&(ga=t)}function Dg(t){nt(xt,xt.current),nt(ra,t),ga===null&&(ga=t)}function rw(t){t.tag===22?(nt(xt,xt.current),nt(ra,t),ga===null&&(ga=t)):Ss(t)}function Ss(){nt(xt,xt.current),nt(ra,ra.current)}function Qn(t){nn(ra),ga===t&&(ga=null),nn(xt)}var xt=ja(0);function _f(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||$g(n)||Jg(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var xr=0,fe=null,Xe=null,Mt=null,Sf=!1,Co=!1,pi=!1,vf=0,Ol=0,Lo=null,AD=0;function Lt(){throw Error(F(321))}function by(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!aa(t[n],e[n]))return!1;return!0}function wy(t,e,n,a,r,s){return xr=s,fe=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,se.H=t===null||t.memoizedState===null?Mw:Ny,pi=!1,s=n(a,r),pi=!1,Co&&(s=iw(e,n,a,r)),sw(t),s}function sw(t){se.H=Ml;var e=Xe!==null&&Xe.next!==null;if(xr=0,Mt=Xe=fe=null,Sf=!1,Ol=0,Lo=null,e)throw Error(F(300));t===null||Ft||(t=t.dependencies,t!==null&&gf(t)&&(Ft=!0))}function iw(t,e,n,a){fe=t;var r=0;do{if(Co&&(Lo=null),Ol=0,Co=!1,25<=r)throw Error(F(301));if(r+=1,Mt=Xe=null,t.updateQueue!=null){var s=t.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}se.H=Nw,s=e(n,a)}while(Co);return s}function xD(){var t=se.H,e=t.useState()[0];return e=typeof e.then=="function"?Yl(e):e,t=t.useState()[0],(Xe!==null?Xe.memoizedState:null)!==t&&(fe.flags|=1024),e}function Cy(){var t=vf!==0;return vf=0,t}function Ly(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function Ay(t){if(Sf){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}Sf=!1}xr=0,Mt=Xe=fe=null,Co=!1,Ol=vf=0,Lo=null}function Dn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Mt===null?fe.memoizedState=Mt=t:Mt=Mt.next=t,Mt}function Rt(){if(Xe===null){var t=fe.alternate;t=t!==null?t.memoizedState:null}else t=Xe.next;var e=Mt===null?fe.memoizedState:Mt.next;if(e!==null)Mt=e,Xe=t;else{if(t===null)throw fe.alternate===null?Error(F(467)):Error(F(310));Xe=t,t={memoizedState:Xe.memoizedState,baseState:Xe.baseState,baseQueue:Xe.baseQueue,queue:Xe.queue,next:null},Mt===null?fe.memoizedState=Mt=t:Mt=Mt.next=t}return Mt}function Gf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Yl(t){var e=Ol;return Ol+=1,Lo===null&&(Lo=[]),t=Zb(Lo,t,e),e=fe,(Mt===null?e.memoizedState:Mt.next)===null&&(e=e.alternate,se.H=e===null||e.memoizedState===null?Mw:Ny),t}function jf(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Yl(t);if(t.$$typeof===Er)return mn(t)}throw Error(F(438,String(t)))}function xy(t){var e=null,n=fe.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var a=fe.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(e={data:a.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Gf(),fe.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),a=0;a<t;a++)n[a]=p1;return e.index++,n}function Rr(t,e){return typeof e=="function"?e(t):e}function Jd(t){var e=Rt();return Ry(e,Xe,t)}function Ry(t,e,n){var a=t.queue;if(a===null)throw Error(F(311));a.lastRenderedReducer=n;var r=t.baseQueue,s=a.pending;if(s!==null){if(r!==null){var i=r.next;r.next=s.next,s.next=i}e.baseQueue=r=s,a.pending=null}if(s=t.baseState,r===null)t.memoizedState=s;else{e=r.next;var u=i=null,l=null,c=e,f=!1;do{var m=c.lane&-536870913;if(m!==c.lane?(Ae&m)===m:(xr&m)===m){var p=c.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),m===ko&&(f=!0);else if((xr&p)===p){c=c.next,p===ko&&(f=!0);continue}else m={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=m,i=s):l=l.next=m,fe.lanes|=p,Us|=p;m=c.action,pi&&n(s,m),s=c.hasEagerState?c.eagerState:n(s,m)}else p={lane:m,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=p,i=s):l=l.next=p,fe.lanes|=m,Us|=m;c=c.next}while(c!==null&&c!==e);if(l===null?i=s:l.next=u,!aa(s,t.memoizedState)&&(Ft=!0,f&&(n=bo,n!==null)))throw n;t.memoizedState=s,t.baseState=i,t.baseQueue=l,a.lastRenderedState=s}return r===null&&(a.lanes=0),[t.memoizedState,a.dispatch]}function zm(t){var e=Rt(),n=e.queue;if(n===null)throw Error(F(311));n.lastRenderedReducer=t;var a=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var i=r=r.next;do s=t(s,i.action),i=i.next;while(i!==r);aa(s,e.memoizedState)||(Ft=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,a]}function ow(t,e,n){var a=fe,r=Rt(),s=xe;if(s){if(n===void 0)throw Error(F(407));n=n()}else n=e();var i=!aa((Xe||r).memoizedState,n);if(i&&(r.memoizedState=n,Ft=!0),r=r.queue,ky(cw.bind(null,a,r,t),[t]),r.getSnapshot!==e||i||Mt!==null&&Mt.memoizedState.tag&1){if(a.flags|=2048,Po(9,{destroy:void 0},lw.bind(null,a,r,n,e),null),Ze===null)throw Error(F(349));s||xr&127||uw(a,e,n)}return n}function uw(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=fe.updateQueue,e===null?(e=Gf(),fe.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function lw(t,e,n,a){e.value=n,e.getSnapshot=a,dw(e)&&fw(t)}function cw(t,e,n){return n(function(){dw(e)&&fw(t)})}function dw(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!aa(t,n)}catch{return!0}}function fw(t){var e=_i(t,2);e!==null&&Fn(e,t,2)}function Pg(t){var e=Dn();if(typeof t=="function"){var n=t;if(t=n(),pi){Es(!0);try{n()}finally{Es(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rr,lastRenderedState:t},e}function hw(t,e,n,a){return t.baseState=n,Ry(t,Xe,typeof a=="function"?a:Rr)}function RD(t,e,n,a,r){if(Wf(t))throw Error(F(485));if(t=e.action,t!==null){var s={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){s.listeners.push(i)}};se.T!==null?n(!0):s.isTransition=!1,a(s),n=e.pending,n===null?(s.next=e.pending=s,pw(e,s)):(s.next=n.next,e.pending=n.next=s)}}function pw(t,e){var n=e.action,a=e.payload,r=t.state;if(e.isTransition){var s=se.T,i={};se.T=i;try{var u=n(r,a),l=se.S;l!==null&&l(i,u),hT(t,e,u)}catch(c){Og(t,e,c)}finally{s!==null&&i.types!==null&&(s.types=i.types),se.T=s}}else try{s=n(r,a),hT(t,e,s)}catch(c){Og(t,e,c)}}function hT(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){pT(t,e,a)},function(a){return Og(t,e,a)}):pT(t,e,n)}function pT(t,e,n){e.status="fulfilled",e.value=n,mw(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,pw(t,n)))}function Og(t,e,n){var a=t.pending;if(t.pending=null,a!==null){a=a.next;do e.status="rejected",e.reason=n,mw(e),e=e.next;while(e!==a)}t.action=null}function mw(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function gw(t,e){return e}function mT(t,e){if(xe){var n=Ze.formState;if(n!==null){e:{var a=fe;if(xe){if(ot){t:{for(var r=ot,s=ma;r.nodeType!==8;){if(!s){r=null;break t}if(r=ya(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){ot=ya(r.nextSibling),a=r.data==="F!";break e}}Vs(a)}a=!1}a&&(e=n[0])}}return n=Dn(),n.memoizedState=n.baseState=e,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:gw,lastRenderedState:e},n.queue=a,n=Dw.bind(null,fe,a),a.dispatch=n,a=Pg(!1),s=My.bind(null,fe,!1,a.queue),a=Dn(),r={state:e,dispatch:null,action:t,pending:null},a.queue=r,n=RD.bind(null,fe,r,s,n),r.dispatch=n,a.memoizedState=t,[e,n,!1]}function gT(t){var e=Rt();return yw(e,Xe,t)}function yw(t,e,n){if(e=Ry(t,e,gw)[0],t=Jd(Rr)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var a=Yl(e)}catch(i){throw i===Ho?zf:i}else a=e;e=Rt();var r=e.queue,s=r.dispatch;return n!==e.memoizedState&&(fe.flags|=2048,Po(9,{destroy:void 0},kD.bind(null,r,n),null)),[a,s,t]}function kD(t,e){t.action=e}function yT(t){var e=Rt(),n=Xe;if(n!==null)return yw(e,n,t);Rt(),e=e.memoizedState,n=Rt();var a=n.queue.dispatch;return n.memoizedState=t,[e,a,!1]}function Po(t,e,n,a){return t={tag:t,create:n,deps:a,inst:e,next:null},e=fe.updateQueue,e===null&&(e=Gf(),fe.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(a=n.next,n.next=t,t.next=a,e.lastEffect=t),t}function Iw(){return Rt().memoizedState}function Zd(t,e,n,a){var r=Dn();fe.flags|=t,r.memoizedState=Po(1|e,{destroy:void 0},n,a===void 0?null:a)}function Kf(t,e,n,a){var r=Rt();a=a===void 0?null:a;var s=r.memoizedState.inst;Xe!==null&&a!==null&&by(a,Xe.memoizedState.deps)?r.memoizedState=Po(e,s,n,a):(fe.flags|=t,r.memoizedState=Po(1|e,s,n,a))}function IT(t,e){Zd(8390656,8,t,e)}function ky(t,e){Kf(2048,8,t,e)}function DD(t){fe.flags|=4;var e=fe.updateQueue;if(e===null)e=Gf(),fe.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function _w(t){var e=Rt().memoizedState;return DD({ref:e,nextImpl:t}),function(){if(Ne&2)throw Error(F(440));return e.impl.apply(void 0,arguments)}}function Sw(t,e){return Kf(4,2,t,e)}function vw(t,e){return Kf(4,4,t,e)}function Ew(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Tw(t,e,n){n=n!=null?n.concat([t]):null,Kf(4,4,Ew.bind(null,e,t),n)}function Dy(){}function bw(t,e){var n=Rt();e=e===void 0?null:e;var a=n.memoizedState;return e!==null&&by(e,a[1])?a[0]:(n.memoizedState=[t,e],t)}function ww(t,e){var n=Rt();e=e===void 0?null:e;var a=n.memoizedState;if(e!==null&&by(e,a[1]))return a[0];if(a=t(),pi){Es(!0);try{t()}finally{Es(!1)}}return n.memoizedState=[a,e],a}function Py(t,e,n){return n===void 0||xr&1073741824&&!(Ae&261930)?t.memoizedState=e:(t.memoizedState=n,t=hC(),fe.lanes|=t,Us|=t,n)}function Cw(t,e,n,a){return aa(n,e)?n:Do.current!==null?(t=Py(t,n,a),aa(t,e)||(Ft=!0),t):!(xr&42)||xr&1073741824&&!(Ae&261930)?(Ft=!0,t.memoizedState=n):(t=hC(),fe.lanes|=t,Us|=t,e)}function Lw(t,e,n,a,r){var s=Ve.p;Ve.p=s!==0&&8>s?s:8;var i=se.T,u={};se.T=u,My(t,!1,e,n);try{var l=r(),c=se.S;if(c!==null&&c(u,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=LD(l,a);vl(t,e,f,na(t))}else vl(t,e,a,na(t))}catch(m){vl(t,e,{then:function(){},status:"rejected",reason:m},na())}finally{Ve.p=s,i!==null&&u.types!==null&&(i.types=u.types),se.T=i}}function PD(){}function Mg(t,e,n,a){if(t.tag!==5)throw Error(F(476));var r=Aw(t).queue;Lw(t,r,e,ii,n===null?PD:function(){return xw(t),n(a)})}function Aw(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:ii,baseState:ii,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rr,lastRenderedState:ii},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rr,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function xw(t){var e=Aw(t);e.next===null&&(e=t.alternate.memoizedState),vl(t,e.next.queue,{},na())}function Oy(){return mn(Fl)}function Rw(){return Rt().memoizedState}function kw(){return Rt().memoizedState}function OD(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=na();t=xs(n);var a=Rs(e,t,n);a!==null&&(Fn(a,e,n),Il(a,e,n)),e={cache:_y()},t.payload=e;return}e=e.return}}function MD(t,e,n){var a=na();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Wf(t)?Pw(e,n):(n=my(t,e,n,a),n!==null&&(Fn(n,t,a),Ow(n,e,a)))}function Dw(t,e,n){var a=na();vl(t,e,n,a)}function vl(t,e,n,a){var r={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Wf(t))Pw(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var i=e.lastRenderedState,u=s(i,n);if(r.hasEagerState=!0,r.eagerState=u,aa(u,i))return Hf(t,e,r,0),Ze===null&&qf(),!1}catch{}finally{}if(n=my(t,e,r,a),n!==null)return Fn(n,t,a),Ow(n,e,a),!0}return!1}function My(t,e,n,a){if(a={lane:2,revertLane:Gy(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Wf(t)){if(e)throw Error(F(479))}else e=my(t,n,a,2),e!==null&&Fn(e,t,2)}function Wf(t){var e=t.alternate;return t===fe||e!==null&&e===fe}function Pw(t,e){Co=Sf=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Ow(t,e,n){if(n&4194048){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,_b(t,n)}}var Ml={readContext:mn,use:jf,useCallback:Lt,useContext:Lt,useEffect:Lt,useImperativeHandle:Lt,useLayoutEffect:Lt,useInsertionEffect:Lt,useMemo:Lt,useReducer:Lt,useRef:Lt,useState:Lt,useDebugValue:Lt,useDeferredValue:Lt,useTransition:Lt,useSyncExternalStore:Lt,useId:Lt,useHostTransitionStatus:Lt,useFormState:Lt,useActionState:Lt,useOptimistic:Lt,useMemoCache:Lt,useCacheRefresh:Lt};Ml.useEffectEvent=Lt;var Mw={readContext:mn,use:jf,useCallback:function(t,e){return Dn().memoizedState=[t,e===void 0?null:e],t},useContext:mn,useEffect:IT,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,Zd(4194308,4,Ew.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Zd(4194308,4,t,e)},useInsertionEffect:function(t,e){Zd(4,2,t,e)},useMemo:function(t,e){var n=Dn();e=e===void 0?null:e;var a=t();if(pi){Es(!0);try{t()}finally{Es(!1)}}return n.memoizedState=[a,e],a},useReducer:function(t,e,n){var a=Dn();if(n!==void 0){var r=n(e);if(pi){Es(!0);try{n(e)}finally{Es(!1)}}}else r=e;return a.memoizedState=a.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},a.queue=t,t=t.dispatch=MD.bind(null,fe,t),[a.memoizedState,t]},useRef:function(t){var e=Dn();return t={current:t},e.memoizedState=t},useState:function(t){t=Pg(t);var e=t.queue,n=Dw.bind(null,fe,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Dy,useDeferredValue:function(t,e){var n=Dn();return Py(n,t,e)},useTransition:function(){var t=Pg(!1);return t=Lw.bind(null,fe,t.queue,!0,!1),Dn().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var a=fe,r=Dn();if(xe){if(n===void 0)throw Error(F(407));n=n()}else{if(n=e(),Ze===null)throw Error(F(349));Ae&127||uw(a,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,IT(cw.bind(null,a,s,t),[t]),a.flags|=2048,Po(9,{destroy:void 0},lw.bind(null,a,s,n,e),null),n},useId:function(){var t=Dn(),e=Ze.identifierPrefix;if(xe){var n=Ha,a=qa;n=(a&~(1<<32-ta(a)-1)).toString(32)+n,e="_"+e+"R_"+n,n=vf++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=AD++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Oy,useFormState:mT,useActionState:mT,useOptimistic:function(t){var e=Dn();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=My.bind(null,fe,!0,n),n.dispatch=e,[t,e]},useMemoCache:xy,useCacheRefresh:function(){return Dn().memoizedState=OD.bind(null,fe)},useEffectEvent:function(t){var e=Dn(),n={impl:t};return e.memoizedState=n,function(){if(Ne&2)throw Error(F(440));return n.impl.apply(void 0,arguments)}}},Ny={readContext:mn,use:jf,useCallback:bw,useContext:mn,useEffect:ky,useImperativeHandle:Tw,useInsertionEffect:Sw,useLayoutEffect:vw,useMemo:ww,useReducer:Jd,useRef:Iw,useState:function(){return Jd(Rr)},useDebugValue:Dy,useDeferredValue:function(t,e){var n=Rt();return Cw(n,Xe.memoizedState,t,e)},useTransition:function(){var t=Jd(Rr)[0],e=Rt().memoizedState;return[typeof t=="boolean"?t:Yl(t),e]},useSyncExternalStore:ow,useId:Rw,useHostTransitionStatus:Oy,useFormState:gT,useActionState:gT,useOptimistic:function(t,e){var n=Rt();return hw(n,Xe,t,e)},useMemoCache:xy,useCacheRefresh:kw};Ny.useEffectEvent=_w;var Nw={readContext:mn,use:jf,useCallback:bw,useContext:mn,useEffect:ky,useImperativeHandle:Tw,useInsertionEffect:Sw,useLayoutEffect:vw,useMemo:ww,useReducer:zm,useRef:Iw,useState:function(){return zm(Rr)},useDebugValue:Dy,useDeferredValue:function(t,e){var n=Rt();return Xe===null?Py(n,t,e):Cw(n,Xe.memoizedState,t,e)},useTransition:function(){var t=zm(Rr)[0],e=Rt().memoizedState;return[typeof t=="boolean"?t:Yl(t),e]},useSyncExternalStore:ow,useId:Rw,useHostTransitionStatus:Oy,useFormState:yT,useActionState:yT,useOptimistic:function(t,e){var n=Rt();return Xe!==null?hw(n,Xe,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:xy,useCacheRefresh:kw};Nw.useEffectEvent=_w;function Gm(t,e,n,a){e=t.memoizedState,n=n(a,e),n=n==null?e:ut({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Ng={enqueueSetState:function(t,e,n){t=t._reactInternals;var a=na(),r=xs(a);r.payload=e,n!=null&&(r.callback=n),e=Rs(t,r,a),e!==null&&(Fn(e,t,a),Il(e,t,a))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var a=na(),r=xs(a);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=Rs(t,r,a),e!==null&&(Fn(e,t,a),Il(e,t,a))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=na(),a=xs(n);a.tag=2,e!=null&&(a.callback=e),e=Rs(t,a,n),e!==null&&(Fn(e,t,n),Il(e,t,n))}};function _T(t,e,n,a,r,s,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(a,s,i):e.prototype&&e.prototype.isPureReactComponent?!Rl(n,a)||!Rl(r,s):!0}function ST(t,e,n,a){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,a),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,a),e.state!==t&&Ng.enqueueReplaceState(e,e.state,null)}function mi(t,e){var n=e;if("ref"in e){n={};for(var a in e)a!=="ref"&&(n[a]=e[a])}if(t=t.defaultProps){n===e&&(n=ut({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function Vw(t){hf(t)}function Fw(t){console.error(t)}function Uw(t){hf(t)}function Ef(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(a){setTimeout(function(){throw a})}}function vT(t,e,n){try{var a=t.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Vg(t,e,n){return n=xs(n),n.tag=3,n.payload={element:null},n.callback=function(){Ef(t,e)},n}function Bw(t){return t=xs(t),t.tag=3,t}function qw(t,e,n,a){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var s=a.value;t.payload=function(){return r(s)},t.callback=function(){vT(e,n,a)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){vT(e,n,a),typeof r!="function"&&(ks===null?ks=new Set([this]):ks.add(this));var u=a.stack;this.componentDidCatch(a.value,{componentStack:u!==null?u:""})})}function ND(t,e,n,a,r){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(e=n.alternate,e!==null&&qo(e,n,r,!0),n=ra.current,n!==null){switch(n.tag){case 31:case 13:return ga===null?Lf():n.alternate===null&&At===0&&(At=3),n.flags&=-257,n.flags|=65536,n.lanes=r,a===yf?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([a]):e.add(a),tg(t,a,r)),!1;case 22:return n.flags|=65536,a===yf?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([a]):n.add(a)),tg(t,a,r)),!1}throw Error(F(435,n.tag))}return tg(t,a,r),Lf(),!1}if(xe)return e=ra.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,a!==bg&&(t=Error(F(422),{cause:a}),Dl(pa(t,n)))):(a!==bg&&(e=Error(F(423),{cause:a}),Dl(pa(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,a=pa(a,n),r=Vg(t.stateNode,a,r),Hm(t,r),At!==4&&(At=2)),!1;var s=Error(F(520),{cause:a});if(s=pa(s,n),bl===null?bl=[s]:bl.push(s),At!==4&&(At=2),e===null)return!0;a=pa(a,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=Vg(n.stateNode,a,t),Hm(n,t),!1;case 1:if(e=n.type,s=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(ks===null||!ks.has(s))))return n.flags|=65536,r&=-r,n.lanes|=r,r=Bw(r),qw(r,t,n,a),Hm(n,r),!1}n=n.return}while(n!==null);return!1}var Vy=Error(F(461)),Ft=!1;function fn(t,e,n,a){e.child=t===null?tw(e,null,n,a):hi(e,t.child,n,a)}function ET(t,e,n,a,r){n=n.render;var s=e.ref;if("ref"in a){var i={};for(var u in a)u!=="ref"&&(i[u]=a[u])}else i=a;return fi(e),a=wy(t,e,n,i,s,r),u=Cy(),t!==null&&!Ft?(Ly(t,e,r),kr(t,e,r)):(xe&&u&&yy(e),e.flags|=1,fn(t,e,a,r),e.child)}function TT(t,e,n,a,r){if(t===null){var s=n.type;return typeof s=="function"&&!gy(s)&&s.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=s,Hw(t,e,s,a,r)):(t=Qd(n.type,null,a,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!Fy(t,r)){var i=s.memoizedProps;if(n=n.compare,n=n!==null?n:Rl,n(i,a)&&t.ref===e.ref)return kr(t,e,r)}return e.flags|=1,t=wr(s,a),t.ref=e.ref,t.return=e,e.child=t}function Hw(t,e,n,a,r){if(t!==null){var s=t.memoizedProps;if(Rl(s,a)&&t.ref===e.ref)if(Ft=!1,e.pendingProps=a=s,Fy(t,r))t.flags&131072&&(Ft=!0);else return e.lanes=t.lanes,kr(t,e,r)}return Fg(t,e,n,a,r)}function zw(t,e,n,a){var r=a.children,s=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(e.flags&128){if(s=s!==null?s.baseLanes|n:n,t!==null){for(a=e.child=t.child,r=0;a!==null;)r=r|a.lanes|a.childLanes,a=a.sibling;a=r&~s}else a=0,e.child=null;return bT(t,e,s,n,a)}if(n&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&$d(e,s!==null?s.cachePool:null),s!==null?fT(e,s):kg(),rw(e);else return a=e.lanes=536870912,bT(t,e,s!==null?s.baseLanes|n:n,n,a)}else s!==null?($d(e,s.cachePool),fT(e,s),Ss(e),e.memoizedState=null):(t!==null&&$d(e,null),kg(),Ss(e));return fn(t,e,r,n),e.child}function fl(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function bT(t,e,n,a,r){var s=Sy();return s=s===null?null:{parent:Vt._currentValue,pool:s},e.memoizedState={baseLanes:n,cachePool:s},t!==null&&$d(e,null),kg(),rw(e),t!==null&&qo(t,e,a,!0),e.childLanes=r,null}function ef(t,e){return e=Tf({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function wT(t,e,n){return hi(e,t.child,null,n),t=ef(e,e.pendingProps),t.flags|=2,Qn(e),e.memoizedState=null,t}function VD(t,e,n){var a=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(xe){if(a.mode==="hidden")return t=ef(e,a),e.lanes=536870912,fl(null,t);if(Dg(e),(t=ot)?(t=MC(t,ma),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ns!==null?{id:qa,overflow:Ha}:null,retryLane:536870912,hydrationErrors:null},n=Yb(t),n.return=e,e.child=n,pn=e,ot=null)):t=null,t===null)throw Vs(e);return e.lanes=536870912,null}return ef(e,a)}var s=t.memoizedState;if(s!==null){var i=s.dehydrated;if(Dg(e),r)if(e.flags&256)e.flags&=-257,e=wT(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(F(558));else if(Ft||qo(t,e,n,!1),r=(n&t.childLanes)!==0,Ft||r){if(a=Ze,a!==null&&(i=Sb(a,n),i!==0&&i!==s.retryLane))throw s.retryLane=i,_i(t,i),Fn(a,t,i),Vy;Lf(),e=wT(t,e,n)}else t=s.treeContext,ot=ya(i.nextSibling),pn=e,xe=!0,As=null,ma=!1,t!==null&&Qb(e,t),e=ef(e,a),e.flags|=4096;return e}return t=wr(t.child,{mode:a.mode,children:a.children}),t.ref=e.ref,e.child=t,t.return=e,t}function tf(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(F(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Fg(t,e,n,a,r){return fi(e),n=wy(t,e,n,a,void 0,r),a=Cy(),t!==null&&!Ft?(Ly(t,e,r),kr(t,e,r)):(xe&&a&&yy(e),e.flags|=1,fn(t,e,n,r),e.child)}function CT(t,e,n,a,r,s){return fi(e),e.updateQueue=null,n=iw(e,a,n,r),sw(t),a=Cy(),t!==null&&!Ft?(Ly(t,e,s),kr(t,e,s)):(xe&&a&&yy(e),e.flags|=1,fn(t,e,n,s),e.child)}function LT(t,e,n,a,r){if(fi(e),e.stateNode===null){var s=yo,i=n.contextType;typeof i=="object"&&i!==null&&(s=mn(i)),s=new n(a,s),e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Ng,e.stateNode=s,s._reactInternals=e,s=e.stateNode,s.props=a,s.state=e.memoizedState,s.refs={},Ey(e),i=n.contextType,s.context=typeof i=="object"&&i!==null?mn(i):yo,s.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(Gm(e,n,i,a),s.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(i=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),i!==s.state&&Ng.enqueueReplaceState(s,s.state,null),Sl(e,a,s,r),_l(),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!0}else if(t===null){s=e.stateNode;var u=e.memoizedProps,l=mi(n,u);s.props=l;var c=s.context,f=n.contextType;i=yo,typeof f=="object"&&f!==null&&(i=mn(f));var m=n.getDerivedStateFromProps;f=typeof m=="function"||typeof s.getSnapshotBeforeUpdate=="function",u=e.pendingProps!==u,f||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u||c!==i)&&ST(e,s,a,i),ys=!1;var p=e.memoizedState;s.state=p,Sl(e,a,s,r),_l(),c=e.memoizedState,u||p!==c||ys?(typeof m=="function"&&(Gm(e,n,m,a),c=e.memoizedState),(l=ys||_T(e,n,l,a,p,c,i))?(f||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(e.flags|=4194308)):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=a,e.memoizedState=c),s.props=a,s.state=c,s.context=i,a=l):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!1)}else{s=e.stateNode,xg(t,e),i=e.memoizedProps,f=mi(n,i),s.props=f,m=e.pendingProps,p=s.context,c=n.contextType,l=yo,typeof c=="object"&&c!==null&&(l=mn(c)),u=n.getDerivedStateFromProps,(c=typeof u=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(i!==m||p!==l)&&ST(e,s,a,l),ys=!1,p=e.memoizedState,s.state=p,Sl(e,a,s,r),_l();var S=e.memoizedState;i!==m||p!==S||ys||t!==null&&t.dependencies!==null&&gf(t.dependencies)?(typeof u=="function"&&(Gm(e,n,u,a),S=e.memoizedState),(f=ys||_T(e,n,f,a,p,S,l)||t!==null&&t.dependencies!==null&&gf(t.dependencies))?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(a,S,l),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(a,S,l)),typeof s.componentDidUpdate=="function"&&(e.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),e.memoizedProps=a,e.memoizedState=S),s.props=a,s.state=S,s.context=l,a=f):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),a=!1)}return s=a,tf(t,e),a=(e.flags&128)!==0,s||a?(s=e.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:s.render(),e.flags|=1,t!==null&&a?(e.child=hi(e,t.child,null,r),e.child=hi(e,null,n,r)):fn(t,e,n,r),e.memoizedState=s.state,t=e.child):t=kr(t,e,r),t}function AT(t,e,n,a){return di(),e.flags|=256,fn(t,e,n,a),e.child}var jm={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Km(t){return{baseLanes:t,cachePool:Jb()}}function Wm(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=Jn),t}function Gw(t,e,n){var a=e.pendingProps,r=!1,s=(e.flags&128)!==0,i;if((i=s)||(i=t!==null&&t.memoizedState===null?!1:(xt.current&2)!==0),i&&(r=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(xe){if(r?_s(e):Ss(e),(t=ot)?(t=MC(t,ma),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ns!==null?{id:qa,overflow:Ha}:null,retryLane:536870912,hydrationErrors:null},n=Yb(t),n.return=e,e.child=n,pn=e,ot=null)):t=null,t===null)throw Vs(e);return Jg(t)?e.lanes=32:e.lanes=536870912,null}var u=a.children;return a=a.fallback,r?(Ss(e),r=e.mode,u=Tf({mode:"hidden",children:u},r),a=oi(a,r,n,null),u.return=e,a.return=e,u.sibling=a,e.child=u,a=e.child,a.memoizedState=Km(n),a.childLanes=Wm(t,i,n),e.memoizedState=jm,fl(null,a)):(_s(e),Ug(e,u))}var l=t.memoizedState;if(l!==null&&(u=l.dehydrated,u!==null)){if(s)e.flags&256?(_s(e),e.flags&=-257,e=Ym(t,e,n)):e.memoizedState!==null?(Ss(e),e.child=t.child,e.flags|=128,e=null):(Ss(e),u=a.fallback,r=e.mode,a=Tf({mode:"visible",children:a.children},r),u=oi(u,r,n,null),u.flags|=2,a.return=e,u.return=e,a.sibling=u,e.child=a,hi(e,t.child,null,n),a=e.child,a.memoizedState=Km(n),a.childLanes=Wm(t,i,n),e.memoizedState=jm,e=fl(null,a));else if(_s(e),Jg(u)){if(i=u.nextSibling&&u.nextSibling.dataset,i)var c=i.dgst;i=c,a=Error(F(419)),a.stack="",a.digest=i,Dl({value:a,source:null,stack:null}),e=Ym(t,e,n)}else if(Ft||qo(t,e,n,!1),i=(n&t.childLanes)!==0,Ft||i){if(i=Ze,i!==null&&(a=Sb(i,n),a!==0&&a!==l.retryLane))throw l.retryLane=a,_i(t,a),Fn(i,t,a),Vy;$g(u)||Lf(),e=Ym(t,e,n)}else $g(u)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,ot=ya(u.nextSibling),pn=e,xe=!0,As=null,ma=!1,t!==null&&Qb(e,t),e=Ug(e,a.children),e.flags|=4096);return e}return r?(Ss(e),u=a.fallback,r=e.mode,l=t.child,c=l.sibling,a=wr(l,{mode:"hidden",children:a.children}),a.subtreeFlags=l.subtreeFlags&65011712,c!==null?u=wr(c,u):(u=oi(u,r,n,null),u.flags|=2),u.return=e,a.return=e,a.sibling=u,e.child=a,fl(null,a),a=e.child,u=t.child.memoizedState,u===null?u=Km(n):(r=u.cachePool,r!==null?(l=Vt._currentValue,r=r.parent!==l?{parent:l,pool:l}:r):r=Jb(),u={baseLanes:u.baseLanes|n,cachePool:r}),a.memoizedState=u,a.childLanes=Wm(t,i,n),e.memoizedState=jm,fl(t.child,a)):(_s(e),n=t.child,t=n.sibling,n=wr(n,{mode:"visible",children:a.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function Ug(t,e){return e=Tf({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Tf(t,e){return t=$n(22,t,null,e),t.lanes=0,t}function Ym(t,e,n){return hi(e,t.child,null,n),t=Ug(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function xT(t,e,n){t.lanes|=e;var a=t.alternate;a!==null&&(a.lanes|=e),Cg(t.return,e,n)}function Xm(t,e,n,a,r,s){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:r,treeForkCount:s}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=a,i.tail=n,i.tailMode=r,i.treeForkCount=s)}function jw(t,e,n){var a=e.pendingProps,r=a.revealOrder,s=a.tail;a=a.children;var i=xt.current,u=(i&2)!==0;if(u?(i=i&1|2,e.flags|=128):i&=1,nt(xt,i),fn(t,e,a,n),a=xe?kl:0,!u&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&xT(t,n,e);else if(t.tag===19)xT(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&_f(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),Xm(e,!1,r,n,s,a);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&_f(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}Xm(e,!0,n,null,s,a);break;case"together":Xm(e,!1,null,null,void 0,a);break;default:e.memoizedState=null}return e.child}function kr(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Us|=e.lanes,!(n&e.childLanes))if(t!==null){if(qo(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(F(153));if(e.child!==null){for(t=e.child,n=wr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=wr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Fy(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&gf(t)))}function FD(t,e,n){switch(e.tag){case 3:lf(e,e.stateNode.containerInfo),Is(e,Vt,t.memoizedState.cache),di();break;case 27:case 5:hg(e);break;case 4:lf(e,e.stateNode.containerInfo);break;case 10:Is(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Dg(e),null;break;case 13:var a=e.memoizedState;if(a!==null)return a.dehydrated!==null?(_s(e),e.flags|=128,null):n&e.child.childLanes?Gw(t,e,n):(_s(e),t=kr(t,e,n),t!==null?t.sibling:null);_s(e);break;case 19:var r=(t.flags&128)!==0;if(a=(n&e.childLanes)!==0,a||(qo(t,e,n,!1),a=(n&e.childLanes)!==0),r){if(a)return jw(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),nt(xt,xt.current),a)break;return null;case 22:return e.lanes=0,zw(t,e,n,e.pendingProps);case 24:Is(e,Vt,t.memoizedState.cache)}return kr(t,e,n)}function Kw(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)Ft=!0;else{if(!Fy(t,n)&&!(e.flags&128))return Ft=!1,FD(t,e,n);Ft=!!(t.flags&131072)}else Ft=!1,xe&&e.flags&1048576&&Xb(e,kl,e.index);switch(e.lanes=0,e.tag){case 16:e:{var a=e.pendingProps;if(t=ri(e.elementType),e.type=t,typeof t=="function")gy(t)?(a=mi(t,a),e.tag=1,e=LT(null,e,t,a,n)):(e.tag=0,e=Fg(null,e,t,a,n));else{if(t!=null){var r=t.$$typeof;if(r===ny){e.tag=11,e=ET(null,e,t,a,n);break e}else if(r===ay){e.tag=14,e=TT(null,e,t,a,n);break e}}throw e=dg(t)||t,Error(F(306,e,""))}}return e;case 0:return Fg(t,e,e.type,e.pendingProps,n);case 1:return a=e.type,r=mi(a,e.pendingProps),LT(t,e,a,r,n);case 3:e:{if(lf(e,e.stateNode.containerInfo),t===null)throw Error(F(387));a=e.pendingProps;var s=e.memoizedState;r=s.element,xg(t,e),Sl(e,a,null,n);var i=e.memoizedState;if(a=i.cache,Is(e,Vt,a),a!==s.cache&&Lg(e,[Vt],n,!0),_l(),a=i.element,s.isDehydrated)if(s={element:a,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){e=AT(t,e,a,n);break e}else if(a!==r){r=pa(Error(F(424)),e),Dl(r),e=AT(t,e,a,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(ot=ya(t.firstChild),pn=e,xe=!0,As=null,ma=!0,n=tw(e,null,a,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(di(),a===r){e=kr(t,e,n);break e}fn(t,e,a,n)}e=e.child}return e;case 26:return tf(t,e),t===null?(n=$T(e.type,null,e.pendingProps,null))?e.memoizedState=n:xe||(n=e.type,t=e.pendingProps,a=kf(Ls.current).createElement(n),a[hn]=e,a[Un]=t,gn(a,n,t),tn(a),e.stateNode=a):e.memoizedState=$T(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return hg(e),t===null&&xe&&(a=e.stateNode=NC(e.type,e.pendingProps,Ls.current),pn=e,ma=!0,r=ot,qs(e.type)?(Zg=r,ot=ya(a.firstChild)):ot=r),fn(t,e,e.pendingProps.children,n),tf(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&xe&&((r=a=ot)&&(a=fP(a,e.type,e.pendingProps,ma),a!==null?(e.stateNode=a,pn=e,ot=ya(a.firstChild),ma=!1,r=!0):r=!1),r||Vs(e)),hg(e),r=e.type,s=e.pendingProps,i=t!==null?t.memoizedProps:null,a=s.children,Xg(r,s)?a=null:i!==null&&Xg(r,i)&&(e.flags|=32),e.memoizedState!==null&&(r=wy(t,e,xD,null,null,n),Fl._currentValue=r),tf(t,e),fn(t,e,a,n),e.child;case 6:return t===null&&xe&&((t=n=ot)&&(n=hP(n,e.pendingProps,ma),n!==null?(e.stateNode=n,pn=e,ot=null,t=!0):t=!1),t||Vs(e)),null;case 13:return Gw(t,e,n);case 4:return lf(e,e.stateNode.containerInfo),a=e.pendingProps,t===null?e.child=hi(e,null,a,n):fn(t,e,a,n),e.child;case 11:return ET(t,e,e.type,e.pendingProps,n);case 7:return fn(t,e,e.pendingProps,n),e.child;case 8:return fn(t,e,e.pendingProps.children,n),e.child;case 12:return fn(t,e,e.pendingProps.children,n),e.child;case 10:return a=e.pendingProps,Is(e,e.type,a.value),fn(t,e,a.children,n),e.child;case 9:return r=e.type._context,a=e.pendingProps.children,fi(e),r=mn(r),a=a(r),e.flags|=1,fn(t,e,a,n),e.child;case 14:return TT(t,e,e.type,e.pendingProps,n);case 15:return Hw(t,e,e.type,e.pendingProps,n);case 19:return jw(t,e,n);case 31:return VD(t,e,n);case 22:return zw(t,e,n,e.pendingProps);case 24:return fi(e),a=mn(Vt),t===null?(r=Sy(),r===null&&(r=Ze,s=_y(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=n),r=s),e.memoizedState={parent:a,cache:r},Ey(e),Is(e,Vt,r)):(t.lanes&n&&(xg(t,e),Sl(e,null,null,n),_l()),r=t.memoizedState,s=e.memoizedState,r.parent!==a?(r={parent:a,cache:a},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),Is(e,Vt,a)):(a=s.cache,Is(e,Vt,a),a!==r.cache&&Lg(e,[Vt],n,!0))),fn(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(F(156,e.tag))}function gr(t){t.flags|=4}function Qm(t,e,n,a,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(gC())t.flags|=8192;else throw li=yf,vy}else t.flags&=-16777217}function RT(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!UC(e))if(gC())t.flags|=8192;else throw li=yf,vy}function Ud(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?yb():536870912,t.lanes|=e,Oo|=e)}function sl(t,e){if(!xe)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:a.sibling=null}}function it(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,a=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags&65011712,a|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags,a|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=a,t.childLanes=n,e}function UD(t,e,n){var a=e.pendingProps;switch(Iy(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return it(e),null;case 1:return it(e),null;case 3:return n=e.stateNode,a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),Cr(Vt),Ao(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(ro(e)?gr(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,qm())),it(e),null;case 26:var r=e.type,s=e.memoizedState;return t===null?(gr(e),s!==null?(it(e),RT(e,s)):(it(e),Qm(e,r,null,a,n))):s?s!==t.memoizedState?(gr(e),it(e),RT(e,s)):(it(e),e.flags&=-16777217):(t=t.memoizedProps,t!==a&&gr(e),it(e),Qm(e,r,t,a,n)),null;case 27:if(cf(e),n=Ls.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&gr(e);else{if(!a){if(e.stateNode===null)throw Error(F(166));return it(e),null}t=Ga.current,ro(e)?sT(e,t):(t=NC(r,a,n),e.stateNode=t,gr(e))}return it(e),null;case 5:if(cf(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&gr(e);else{if(!a){if(e.stateNode===null)throw Error(F(166));return it(e),null}if(s=Ga.current,ro(e))sT(e,s);else{var i=kf(Ls.current);switch(s){case 1:s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=i.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof a.is=="string"?i.createElement("select",{is:a.is}):i.createElement("select"),a.multiple?s.multiple=!0:a.size&&(s.size=a.size);break;default:s=typeof a.is=="string"?i.createElement(r,{is:a.is}):i.createElement(r)}}s[hn]=e,s[Un]=a;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)s.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=s;e:switch(gn(s,r,a),r){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&gr(e)}}return it(e),Qm(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==a&&gr(e);else{if(typeof a!="string"&&e.stateNode===null)throw Error(F(166));if(t=Ls.current,ro(e)){if(t=e.stateNode,n=e.memoizedProps,a=null,r=pn,r!==null)switch(r.tag){case 27:case 5:a=r.memoizedProps}t[hn]=e,t=!!(t.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||DC(t.nodeValue,n)),t||Vs(e,!0)}else t=kf(t).createTextNode(a),t[hn]=e,e.stateNode=t}return it(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(a=ro(e),n!==null){if(t===null){if(!a)throw Error(F(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(F(557));t[hn]=e}else di(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;it(e),t=!1}else n=qm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(Qn(e),e):(Qn(e),null);if(e.flags&128)throw Error(F(558))}return it(e),null;case 13:if(a=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=ro(e),a!==null&&a.dehydrated!==null){if(t===null){if(!r)throw Error(F(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(F(317));r[hn]=e}else di(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;it(e),r=!1}else r=qm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(Qn(e),e):(Qn(e),null)}return Qn(e),e.flags&128?(e.lanes=n,e):(n=a!==null,t=t!==null&&t.memoizedState!==null,n&&(a=e.child,r=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(r=a.alternate.memoizedState.cachePool.pool),s=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(s=a.memoizedState.cachePool.pool),s!==r&&(a.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Ud(e,e.updateQueue),it(e),null);case 4:return Ao(),t===null&&jy(e.stateNode.containerInfo),it(e),null;case 10:return Cr(e.type),it(e),null;case 19:if(nn(xt),a=e.memoizedState,a===null)return it(e),null;if(r=(e.flags&128)!==0,s=a.rendering,s===null)if(r)sl(a,!1);else{if(At!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(s=_f(t),s!==null){for(e.flags|=128,sl(a,!1),t=s.updateQueue,e.updateQueue=t,Ud(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)Wb(n,t),n=n.sibling;return nt(xt,xt.current&1|2),xe&&Sr(e,a.treeForkCount),e.child}t=t.sibling}a.tail!==null&&Zn()>wf&&(e.flags|=128,r=!0,sl(a,!1),e.lanes=4194304)}else{if(!r)if(t=_f(s),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Ud(e,t),sl(a,!0),a.tail===null&&a.tailMode==="hidden"&&!s.alternate&&!xe)return it(e),null}else 2*Zn()-a.renderingStartTime>wf&&n!==536870912&&(e.flags|=128,r=!0,sl(a,!1),e.lanes=4194304);a.isBackwards?(s.sibling=e.child,e.child=s):(t=a.last,t!==null?t.sibling=s:e.child=s,a.last=s)}return a.tail!==null?(t=a.tail,a.rendering=t,a.tail=t.sibling,a.renderingStartTime=Zn(),t.sibling=null,n=xt.current,nt(xt,r?n&1|2:n&1),xe&&Sr(e,a.treeForkCount),t):(it(e),null);case 22:case 23:return Qn(e),Ty(),a=e.memoizedState!==null,t!==null?t.memoizedState!==null!==a&&(e.flags|=8192):a&&(e.flags|=8192),a?n&536870912&&!(e.flags&128)&&(it(e),e.subtreeFlags&6&&(e.flags|=8192)):it(e),n=e.updateQueue,n!==null&&Ud(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),a=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),a!==n&&(e.flags|=2048),t!==null&&nn(ui),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),Cr(Vt),it(e),null;case 25:return null;case 30:return null}throw Error(F(156,e.tag))}function BD(t,e){switch(Iy(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Cr(Vt),Ao(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return cf(e),null;case 31:if(e.memoizedState!==null){if(Qn(e),e.alternate===null)throw Error(F(340));di()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(Qn(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(F(340));di()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return nn(xt),null;case 4:return Ao(),null;case 10:return Cr(e.type),null;case 22:case 23:return Qn(e),Ty(),t!==null&&nn(ui),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Cr(Vt),null;case 25:return null;default:return null}}function Ww(t,e){switch(Iy(e),e.tag){case 3:Cr(Vt),Ao();break;case 26:case 27:case 5:cf(e);break;case 4:Ao();break;case 31:e.memoizedState!==null&&Qn(e);break;case 13:Qn(e);break;case 19:nn(xt);break;case 10:Cr(e.type);break;case 22:case 23:Qn(e),Ty(),t!==null&&nn(ui);break;case 24:Cr(Vt)}}function Xl(t,e){try{var n=e.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var r=a.next;n=r;do{if((n.tag&t)===t){a=void 0;var s=n.create,i=n.inst;a=s(),i.destroy=a}n=n.next}while(n!==r)}}catch(u){ze(e,e.return,u)}}function Fs(t,e,n){try{var a=e.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var s=r.next;a=s;do{if((a.tag&t)===t){var i=a.inst,u=i.destroy;if(u!==void 0){i.destroy=void 0,r=e;var l=n,c=u;try{c()}catch(f){ze(r,l,f)}}}a=a.next}while(a!==s)}}catch(f){ze(e,e.return,f)}}function Yw(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{aw(e,n)}catch(a){ze(t,t.return,a)}}}function Xw(t,e,n){n.props=mi(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(a){ze(t,e,a)}}function El(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var a=t.stateNode;break;case 30:a=t.stateNode;break;default:a=t.stateNode}typeof n=="function"?t.refCleanup=n(a):n.current=a}}catch(r){ze(t,e,r)}}function za(t,e){var n=t.ref,a=t.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(r){ze(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){ze(t,e,r)}else n.current=null}function Qw(t){var e=t.type,n=t.memoizedProps,a=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(r){ze(t,t.return,r)}}function $m(t,e,n){try{var a=t.stateNode;iP(a,t.type,n,e),a[Un]=e}catch(r){ze(t,t.return,r)}}function $w(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&qs(t.type)||t.tag===4}function Jm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||$w(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&qs(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Bg(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Tr));else if(a!==4&&(a===27&&qs(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(Bg(t,e,n),t=t.sibling;t!==null;)Bg(t,e,n),t=t.sibling}function bf(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(a!==4&&(a===27&&qs(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(bf(t,e,n),t=t.sibling;t!==null;)bf(t,e,n),t=t.sibling}function Jw(t){var e=t.stateNode,n=t.memoizedProps;try{for(var a=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);gn(e,a,n),e[hn]=t,e[Un]=n}catch(s){ze(t,t.return,s)}}var vr=!1,Nt=!1,Zm=!1,kT=typeof WeakSet=="function"?WeakSet:Set,en=null;function qD(t,e){if(t=t.containerInfo,Wg=Mf,t=Ub(t),hy(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var a=n.getSelection&&n.getSelection();if(a&&a.rangeCount!==0){n=a.anchorNode;var r=a.anchorOffset,s=a.focusNode;a=a.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var i=0,u=-1,l=-1,c=0,f=0,m=t,p=null;t:for(;;){for(var S;m!==n||r!==0&&m.nodeType!==3||(u=i+r),m!==s||a!==0&&m.nodeType!==3||(l=i+a),m.nodeType===3&&(i+=m.nodeValue.length),(S=m.firstChild)!==null;)p=m,m=S;for(;;){if(m===t)break t;if(p===n&&++c===r&&(u=i),p===s&&++f===a&&(l=i),(S=m.nextSibling)!==null)break;m=p,p=m.parentNode}m=S}n=u===-1||l===-1?null:{start:u,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Yg={focusedElem:t,selectionRange:n},Mf=!1,en=e;en!==null;)if(e=en,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,en=t;else for(;en!==null;){switch(e=en,s=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&s!==null){t=void 0,n=e,r=s.memoizedProps,s=s.memoizedState,a=n.stateNode;try{var R=mi(n.type,r);t=a.getSnapshotBeforeUpdate(R,s),a.__reactInternalSnapshotBeforeUpdate=t}catch(D){ze(n,n.return,D)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Qg(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Qg(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(F(163))}if(t=e.sibling,t!==null){t.return=e.return,en=t;break}en=e.return}}function Zw(t,e,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:Ir(t,n),a&4&&Xl(5,n);break;case 1:if(Ir(t,n),a&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){ze(n,n.return,i)}else{var r=mi(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){ze(n,n.return,i)}}a&64&&Yw(n),a&512&&El(n,n.return);break;case 3:if(Ir(t,n),a&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{aw(t,e)}catch(i){ze(n,n.return,i)}}break;case 27:e===null&&a&4&&Jw(n);case 26:case 5:Ir(t,n),e===null&&a&4&&Qw(n),a&512&&El(n,n.return);break;case 12:Ir(t,n);break;case 31:Ir(t,n),a&4&&nC(t,n);break;case 13:Ir(t,n),a&4&&aC(t,n),a&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=QD.bind(null,n),pP(t,n))));break;case 22:if(a=n.memoizedState!==null||vr,!a){e=e!==null&&e.memoizedState!==null||Nt,r=vr;var s=Nt;vr=a,(Nt=e)&&!s?_r(t,n,(n.subtreeFlags&8772)!==0):Ir(t,n),vr=r,Nt=s}break;case 30:break;default:Ir(t,n)}}function eC(t){var e=t.alternate;e!==null&&(t.alternate=null,eC(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&oy(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var pt=null,Nn=!1;function yr(t,e,n){for(n=n.child;n!==null;)tC(t,e,n),n=n.sibling}function tC(t,e,n){if(ea&&typeof ea.onCommitFiberUnmount=="function")try{ea.onCommitFiberUnmount(Hl,n)}catch{}switch(n.tag){case 26:Nt||za(n,e),yr(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Nt||za(n,e);var a=pt,r=Nn;qs(n.type)&&(pt=n.stateNode,Nn=!1),yr(t,e,n),Cl(n.stateNode),pt=a,Nn=r;break;case 5:Nt||za(n,e);case 6:if(a=pt,r=Nn,pt=null,yr(t,e,n),pt=a,Nn=r,pt!==null)if(Nn)try{(pt.nodeType===9?pt.body:pt.nodeName==="HTML"?pt.ownerDocument.body:pt).removeChild(n.stateNode)}catch(s){ze(n,e,s)}else try{pt.removeChild(n.stateNode)}catch(s){ze(n,e,s)}break;case 18:pt!==null&&(Nn?(t=pt,KT(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),Fo(t)):KT(pt,n.stateNode));break;case 4:a=pt,r=Nn,pt=n.stateNode.containerInfo,Nn=!0,yr(t,e,n),pt=a,Nn=r;break;case 0:case 11:case 14:case 15:Fs(2,n,e),Nt||Fs(4,n,e),yr(t,e,n);break;case 1:Nt||(za(n,e),a=n.stateNode,typeof a.componentWillUnmount=="function"&&Xw(n,e,a)),yr(t,e,n);break;case 21:yr(t,e,n);break;case 22:Nt=(a=Nt)||n.memoizedState!==null,yr(t,e,n),Nt=a;break;default:yr(t,e,n)}}function nC(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Fo(t)}catch(n){ze(e,e.return,n)}}}function aC(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Fo(t)}catch(n){ze(e,e.return,n)}}function HD(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new kT),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new kT),e;default:throw Error(F(435,t.tag))}}function Bd(t,e){var n=HD(t);e.forEach(function(a){if(!n.has(a)){n.add(a);var r=$D.bind(null,t,a);a.then(r,r)}})}function On(t,e){var n=e.deletions;if(n!==null)for(var a=0;a<n.length;a++){var r=n[a],s=t,i=e,u=i;e:for(;u!==null;){switch(u.tag){case 27:if(qs(u.type)){pt=u.stateNode,Nn=!1;break e}break;case 5:pt=u.stateNode,Nn=!1;break e;case 3:case 4:pt=u.stateNode.containerInfo,Nn=!0;break e}u=u.return}if(pt===null)throw Error(F(160));tC(s,i,r),pt=null,Nn=!1,s=r.alternate,s!==null&&(s.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)rC(e,t),e=e.sibling}var La=null;function rC(t,e){var n=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:On(e,t),Mn(t),a&4&&(Fs(3,t,t.return),Xl(3,t),Fs(5,t,t.return));break;case 1:On(e,t),Mn(t),a&512&&(Nt||n===null||za(n,n.return)),a&64&&vr&&(t=t.updateQueue,t!==null&&(a=t.callbacks,a!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?a:n.concat(a))));break;case 26:var r=La;if(On(e,t),Mn(t),a&512&&(Nt||n===null||za(n,n.return)),a&4){var s=n!==null?n.memoizedState:null;if(a=t.memoizedState,n===null)if(a===null)if(t.stateNode===null){e:{a=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(a){case"title":s=r.getElementsByTagName("title")[0],(!s||s[jl]||s[hn]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=r.createElement(a),r.head.insertBefore(s,r.querySelector("head > title"))),gn(s,a,n),s[hn]=t,tn(s),a=s;break e;case"link":var i=ZT("link","href",r).get(a+(n.href||""));if(i){for(var u=0;u<i.length;u++)if(s=i[u],s.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&s.getAttribute("rel")===(n.rel==null?null:n.rel)&&s.getAttribute("title")===(n.title==null?null:n.title)&&s.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(u,1);break t}}s=r.createElement(a),gn(s,a,n),r.head.appendChild(s);break;case"meta":if(i=ZT("meta","content",r).get(a+(n.content||""))){for(u=0;u<i.length;u++)if(s=i[u],s.getAttribute("content")===(n.content==null?null:""+n.content)&&s.getAttribute("name")===(n.name==null?null:n.name)&&s.getAttribute("property")===(n.property==null?null:n.property)&&s.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&s.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(u,1);break t}}s=r.createElement(a),gn(s,a,n),r.head.appendChild(s);break;default:throw Error(F(468,a))}s[hn]=t,tn(s),a=s}t.stateNode=a}else eb(r,t.type,t.stateNode);else t.stateNode=JT(r,a,t.memoizedProps);else s!==a?(s===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):s.count--,a===null?eb(r,t.type,t.stateNode):JT(r,a,t.memoizedProps)):a===null&&t.stateNode!==null&&$m(t,t.memoizedProps,n.memoizedProps)}break;case 27:On(e,t),Mn(t),a&512&&(Nt||n===null||za(n,n.return)),n!==null&&a&4&&$m(t,t.memoizedProps,n.memoizedProps);break;case 5:if(On(e,t),Mn(t),a&512&&(Nt||n===null||za(n,n.return)),t.flags&32){r=t.stateNode;try{Ro(r,"")}catch(R){ze(t,t.return,R)}}a&4&&t.stateNode!=null&&(r=t.memoizedProps,$m(t,r,n!==null?n.memoizedProps:r)),a&1024&&(Zm=!0);break;case 6:if(On(e,t),Mn(t),a&4){if(t.stateNode===null)throw Error(F(162));a=t.memoizedProps,n=t.stateNode;try{n.nodeValue=a}catch(R){ze(t,t.return,R)}}break;case 3:if(rf=null,r=La,La=Df(e.containerInfo),On(e,t),La=r,Mn(t),a&4&&n!==null&&n.memoizedState.isDehydrated)try{Fo(e.containerInfo)}catch(R){ze(t,t.return,R)}Zm&&(Zm=!1,sC(t));break;case 4:a=La,La=Df(t.stateNode.containerInfo),On(e,t),Mn(t),La=a;break;case 12:On(e,t),Mn(t);break;case 31:On(e,t),Mn(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Bd(t,a)));break;case 13:On(e,t),Mn(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Yf=Zn()),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Bd(t,a)));break;case 22:r=t.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=vr,f=Nt;if(vr=c||r,Nt=f||l,On(e,t),Nt=f,vr=c,Mn(t),a&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||l||vr||Nt||si(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){l=n=e;try{if(s=l.stateNode,r)i=s.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{u=l.stateNode;var m=l.memoizedProps.style,p=m!=null&&m.hasOwnProperty("display")?m.display:null;u.style.display=p==null||typeof p=="boolean"?"":(""+p).trim()}}catch(R){ze(l,l.return,R)}}}else if(e.tag===6){if(n===null){l=e;try{l.stateNode.nodeValue=r?"":l.memoizedProps}catch(R){ze(l,l.return,R)}}}else if(e.tag===18){if(n===null){l=e;try{var S=l.stateNode;r?WT(S,!0):WT(l.stateNode,!1)}catch(R){ze(l,l.return,R)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}a&4&&(a=t.updateQueue,a!==null&&(n=a.retryQueue,n!==null&&(a.retryQueue=null,Bd(t,n))));break;case 19:On(e,t),Mn(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Bd(t,a)));break;case 30:break;case 21:break;default:On(e,t),Mn(t)}}function Mn(t){var e=t.flags;if(e&2){try{for(var n,a=t.return;a!==null;){if($w(a)){n=a;break}a=a.return}if(n==null)throw Error(F(160));switch(n.tag){case 27:var r=n.stateNode,s=Jm(t);bf(t,s,r);break;case 5:var i=n.stateNode;n.flags&32&&(Ro(i,""),n.flags&=-33);var u=Jm(t);bf(t,u,i);break;case 3:case 4:var l=n.stateNode.containerInfo,c=Jm(t);Bg(t,c,l);break;default:throw Error(F(161))}}catch(f){ze(t,t.return,f)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function sC(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;sC(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function Ir(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)Zw(t,e.alternate,e),e=e.sibling}function si(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Fs(4,e,e.return),si(e);break;case 1:za(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&Xw(e,e.return,n),si(e);break;case 27:Cl(e.stateNode);case 26:case 5:za(e,e.return),si(e);break;case 22:e.memoizedState===null&&si(e);break;case 30:si(e);break;default:si(e)}t=t.sibling}}function _r(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var a=e.alternate,r=t,s=e,i=s.flags;switch(s.tag){case 0:case 11:case 15:_r(r,s,n),Xl(4,s);break;case 1:if(_r(r,s,n),a=s,r=a.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){ze(a,a.return,c)}if(a=s,r=a.updateQueue,r!==null){var u=a.stateNode;try{var l=r.shared.hiddenCallbacks;if(l!==null)for(r.shared.hiddenCallbacks=null,r=0;r<l.length;r++)nw(l[r],u)}catch(c){ze(a,a.return,c)}}n&&i&64&&Yw(s),El(s,s.return);break;case 27:Jw(s);case 26:case 5:_r(r,s,n),n&&a===null&&i&4&&Qw(s),El(s,s.return);break;case 12:_r(r,s,n);break;case 31:_r(r,s,n),n&&i&4&&nC(r,s);break;case 13:_r(r,s,n),n&&i&4&&aC(r,s);break;case 22:s.memoizedState===null&&_r(r,s,n),El(s,s.return);break;case 30:break;default:_r(r,s,n)}e=e.sibling}}function Uy(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&Wl(n))}function By(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Wl(t))}function Ca(t,e,n,a){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)iC(t,e,n,a),e=e.sibling}function iC(t,e,n,a){var r=e.flags;switch(e.tag){case 0:case 11:case 15:Ca(t,e,n,a),r&2048&&Xl(9,e);break;case 1:Ca(t,e,n,a);break;case 3:Ca(t,e,n,a),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Wl(t)));break;case 12:if(r&2048){Ca(t,e,n,a),t=e.stateNode;try{var s=e.memoizedProps,i=s.id,u=s.onPostCommit;typeof u=="function"&&u(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){ze(e,e.return,l)}}else Ca(t,e,n,a);break;case 31:Ca(t,e,n,a);break;case 13:Ca(t,e,n,a);break;case 23:break;case 22:s=e.stateNode,i=e.alternate,e.memoizedState!==null?s._visibility&2?Ca(t,e,n,a):Tl(t,e):s._visibility&2?Ca(t,e,n,a):(s._visibility|=2,io(t,e,n,a,(e.subtreeFlags&10256)!==0||!1)),r&2048&&Uy(i,e);break;case 24:Ca(t,e,n,a),r&2048&&By(e.alternate,e);break;default:Ca(t,e,n,a)}}function io(t,e,n,a,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var s=t,i=e,u=n,l=a,c=i.flags;switch(i.tag){case 0:case 11:case 15:io(s,i,u,l,r),Xl(8,i);break;case 23:break;case 22:var f=i.stateNode;i.memoizedState!==null?f._visibility&2?io(s,i,u,l,r):Tl(s,i):(f._visibility|=2,io(s,i,u,l,r)),r&&c&2048&&Uy(i.alternate,i);break;case 24:io(s,i,u,l,r),r&&c&2048&&By(i.alternate,i);break;default:io(s,i,u,l,r)}e=e.sibling}}function Tl(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,a=e,r=a.flags;switch(a.tag){case 22:Tl(n,a),r&2048&&Uy(a.alternate,a);break;case 24:Tl(n,a),r&2048&&By(a.alternate,a);break;default:Tl(n,a)}e=e.sibling}}var hl=8192;function so(t,e,n){if(t.subtreeFlags&hl)for(t=t.child;t!==null;)oC(t,e,n),t=t.sibling}function oC(t,e,n){switch(t.tag){case 26:so(t,e,n),t.flags&hl&&t.memoizedState!==null&&CP(n,La,t.memoizedState,t.memoizedProps);break;case 5:so(t,e,n);break;case 3:case 4:var a=La;La=Df(t.stateNode.containerInfo),so(t,e,n),La=a;break;case 22:t.memoizedState===null&&(a=t.alternate,a!==null&&a.memoizedState!==null?(a=hl,hl=16777216,so(t,e,n),hl=a):so(t,e,n));break;default:so(t,e,n)}}function uC(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function il(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];en=a,cC(a,t)}uC(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)lC(t),t=t.sibling}function lC(t){switch(t.tag){case 0:case 11:case 15:il(t),t.flags&2048&&Fs(9,t,t.return);break;case 3:il(t);break;case 12:il(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,nf(t)):il(t);break;default:il(t)}}function nf(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];en=a,cC(a,t)}uC(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Fs(8,e,e.return),nf(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,nf(e));break;default:nf(e)}t=t.sibling}}function cC(t,e){for(;en!==null;){var n=en;switch(n.tag){case 0:case 11:case 15:Fs(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:Wl(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,en=a;else e:for(n=t;en!==null;){a=en;var r=a.sibling,s=a.return;if(eC(a),a===n){en=null;break e}if(r!==null){r.return=s,en=r;break e}en=s}}}var zD={getCacheForType:function(t){var e=mn(Vt),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return mn(Vt).controller.signal}},GD=typeof WeakMap=="function"?WeakMap:Map,Ne=0,Ze=null,be=null,Ae=0,He=0,Xn=null,bs=!1,zo=!1,qy=!1,Dr=0,At=0,Us=0,ci=0,Hy=0,Jn=0,Oo=0,bl=null,Vn=null,qg=!1,Yf=0,dC=0,wf=1/0,Cf=null,ks=null,Yt=0,Ds=null,Mo=null,Lr=0,Hg=0,zg=null,fC=null,wl=0,Gg=null;function na(){return Ne&2&&Ae!==0?Ae&-Ae:se.T!==null?Gy():vb()}function hC(){if(Jn===0)if(!(Ae&536870912)||xe){var t=Rd;Rd<<=1,!(Rd&3932160)&&(Rd=262144),Jn=t}else Jn=536870912;return t=ra.current,t!==null&&(t.flags|=32),Jn}function Fn(t,e,n){(t===Ze&&(He===2||He===9)||t.cancelPendingCommit!==null)&&(No(t,0),ws(t,Ae,Jn,!1)),Gl(t,n),(!(Ne&2)||t!==Ze)&&(t===Ze&&(!(Ne&2)&&(ci|=n),At===4&&ws(t,Ae,Jn,!1)),Ka(t))}function pC(t,e,n){if(Ne&6)throw Error(F(327));var a=!n&&(e&127)===0&&(e&t.expiredLanes)===0||zl(t,e),r=a?WD(t,e):eg(t,e,!0),s=a;do{if(r===0){zo&&!a&&ws(t,e,0,!1);break}else{if(n=t.current.alternate,s&&!jD(n)){r=eg(t,e,!1),s=!1;continue}if(r===2){if(s=e,t.errorRecoveryDisabledLanes&s)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var u=t;r=bl;var l=u.current.memoizedState.isDehydrated;if(l&&(No(u,i).flags|=256),i=eg(u,i,!1),i!==2){if(qy&&!l){u.errorRecoveryDisabledLanes|=s,ci|=s,r=4;break e}s=Vn,Vn=r,s!==null&&(Vn===null?Vn=s:Vn.push.apply(Vn,s))}r=i}if(s=!1,r!==2)continue}}if(r===1){No(t,0),ws(t,e,0,!0);break}e:{switch(a=t,s=r,s){case 0:case 1:throw Error(F(345));case 4:if((e&4194048)!==e)break;case 6:ws(a,e,Jn,!bs);break e;case 2:Vn=null;break;case 3:case 5:break;default:throw Error(F(329))}if((e&62914560)===e&&(r=Yf+300-Zn(),10<r)){if(ws(a,e,Jn,!bs),Vf(a,0,!0)!==0)break e;Lr=e,a.timeoutHandle=OC(DT.bind(null,a,n,Vn,Cf,qg,e,Jn,ci,Oo,bs,s,"Throttled",-0,0),r);break e}DT(a,n,Vn,Cf,qg,e,Jn,ci,Oo,bs,s,null,-0,0)}}break}while(!0);Ka(t)}function DT(t,e,n,a,r,s,i,u,l,c,f,m,p,S){if(t.timeoutHandle=-1,m=e.subtreeFlags,m&8192||(m&16785408)===16785408){m={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Tr},oC(e,s,m);var R=(s&62914560)===s?Yf-Zn():(s&4194048)===s?dC-Zn():0;if(R=LP(m,R),R!==null){Lr=s,t.cancelPendingCommit=R(OT.bind(null,t,e,s,n,a,r,i,u,l,f,m,null,p,S)),ws(t,s,i,!c);return}}OT(t,e,s,n,a,r,i,u,l)}function jD(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var r=n[a],s=r.getSnapshot;r=r.value;try{if(!aa(s(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function ws(t,e,n,a){e&=~Hy,e&=~ci,t.suspendedLanes|=e,t.pingedLanes&=~e,a&&(t.warmLanes|=e),a=t.expirationTimes;for(var r=e;0<r;){var s=31-ta(r),i=1<<s;a[s]=-1,r&=~i}n!==0&&Ib(t,n,e)}function Xf(){return Ne&6?!0:(Ql(0,!1),!1)}function zy(){if(be!==null){if(He===0)var t=be.return;else t=be,br=Si=null,Ay(t),wo=null,Pl=0,t=be;for(;t!==null;)Ww(t.alternate,t),t=t.return;be=null}}function No(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,lP(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),Lr=0,zy(),Ze=t,be=n=wr(t.current,null),Ae=e,He=0,Xn=null,bs=!1,zo=zl(t,e),qy=!1,Oo=Jn=Hy=ci=Us=At=0,Vn=bl=null,qg=!1,e&8&&(e|=e&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=e;0<a;){var r=31-ta(a),s=1<<r;e|=t[r],a&=~s}return Dr=e,qf(),n}function mC(t,e){fe=null,se.H=Ml,e===Ho||e===zf?(e=cT(),He=3):e===vy?(e=cT(),He=4):He=e===Vy?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Xn=e,be===null&&(At=1,Ef(t,pa(e,t.current)))}function gC(){var t=ra.current;return t===null?!0:(Ae&4194048)===Ae?ga===null:(Ae&62914560)===Ae||Ae&536870912?t===ga:!1}function yC(){var t=se.H;return se.H=Ml,t===null?Ml:t}function IC(){var t=se.A;return se.A=zD,t}function Lf(){At=4,bs||(Ae&4194048)!==Ae&&ra.current!==null||(zo=!0),!(Us&134217727)&&!(ci&134217727)||Ze===null||ws(Ze,Ae,Jn,!1)}function eg(t,e,n){var a=Ne;Ne|=2;var r=yC(),s=IC();(Ze!==t||Ae!==e)&&(Cf=null,No(t,e)),e=!1;var i=At;e:do try{if(He!==0&&be!==null){var u=be,l=Xn;switch(He){case 8:zy(),i=6;break e;case 3:case 2:case 9:case 6:ra.current===null&&(e=!0);var c=He;if(He=0,Xn=null,So(t,u,l,c),n&&zo){i=0;break e}break;default:c=He,He=0,Xn=null,So(t,u,l,c)}}KD(),i=At;break}catch(f){mC(t,f)}while(!0);return e&&t.shellSuspendCounter++,br=Si=null,Ne=a,se.H=r,se.A=s,be===null&&(Ze=null,Ae=0,qf()),i}function KD(){for(;be!==null;)_C(be)}function WD(t,e){var n=Ne;Ne|=2;var a=yC(),r=IC();Ze!==t||Ae!==e?(Cf=null,wf=Zn()+500,No(t,e)):zo=zl(t,e);e:do try{if(He!==0&&be!==null){e=be;var s=Xn;t:switch(He){case 1:He=0,Xn=null,So(t,e,s,1);break;case 2:case 9:if(lT(s)){He=0,Xn=null,PT(e);break}e=function(){He!==2&&He!==9||Ze!==t||(He=7),Ka(t)},s.then(e,e);break e;case 3:He=7;break e;case 4:He=5;break e;case 7:lT(s)?(He=0,Xn=null,PT(e)):(He=0,Xn=null,So(t,e,s,7));break;case 5:var i=null;switch(be.tag){case 26:i=be.memoizedState;case 5:case 27:var u=be;if(i?UC(i):u.stateNode.complete){He=0,Xn=null;var l=u.sibling;if(l!==null)be=l;else{var c=u.return;c!==null?(be=c,Qf(c)):be=null}break t}}He=0,Xn=null,So(t,e,s,5);break;case 6:He=0,Xn=null,So(t,e,s,6);break;case 8:zy(),At=6;break e;default:throw Error(F(462))}}YD();break}catch(f){mC(t,f)}while(!0);return br=Si=null,se.H=a,se.A=r,Ne=n,be!==null?0:(Ze=null,Ae=0,qf(),At)}function YD(){for(;be!==null&&!y1();)_C(be)}function _C(t){var e=Kw(t.alternate,t,Dr);t.memoizedProps=t.pendingProps,e===null?Qf(t):be=e}function PT(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=CT(n,e,e.pendingProps,e.type,void 0,Ae);break;case 11:e=CT(n,e,e.pendingProps,e.type.render,e.ref,Ae);break;case 5:Ay(e);default:Ww(n,e),e=be=Wb(e,Dr),e=Kw(n,e,Dr)}t.memoizedProps=t.pendingProps,e===null?Qf(t):be=e}function So(t,e,n,a){br=Si=null,Ay(e),wo=null,Pl=0;var r=e.return;try{if(ND(t,r,e,n,Ae)){At=1,Ef(t,pa(n,t.current)),be=null;return}}catch(s){if(r!==null)throw be=r,s;At=1,Ef(t,pa(n,t.current)),be=null;return}e.flags&32768?(xe||a===1?t=!0:zo||Ae&536870912?t=!1:(bs=t=!0,(a===2||a===9||a===3||a===6)&&(a=ra.current,a!==null&&a.tag===13&&(a.flags|=16384))),SC(e,t)):Qf(e)}function Qf(t){var e=t;do{if(e.flags&32768){SC(e,bs);return}t=e.return;var n=UD(e.alternate,e,Dr);if(n!==null){be=n;return}if(e=e.sibling,e!==null){be=e;return}be=e=t}while(e!==null);At===0&&(At=5)}function SC(t,e){do{var n=BD(t.alternate,t);if(n!==null){n.flags&=32767,be=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){be=t;return}be=t=n}while(t!==null);At=6,be=null}function OT(t,e,n,a,r,s,i,u,l){t.cancelPendingCommit=null;do $f();while(Yt!==0);if(Ne&6)throw Error(F(327));if(e!==null){if(e===t.current)throw Error(F(177));if(s=e.lanes|e.childLanes,s|=py,L1(t,n,s,i,u,l),t===Ze&&(be=Ze=null,Ae=0),Mo=e,Ds=t,Lr=n,Hg=s,zg=r,fC=a,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,JD(df,function(){return wC(),null})):(t.callbackNode=null,t.callbackPriority=0),a=(e.flags&13878)!==0,e.subtreeFlags&13878||a){a=se.T,se.T=null,r=Ve.p,Ve.p=2,i=Ne,Ne|=4;try{qD(t,e,n)}finally{Ne=i,Ve.p=r,se.T=a}}Yt=1,vC(),EC(),TC()}}function vC(){if(Yt===1){Yt=0;var t=Ds,e=Mo,n=(e.flags&13878)!==0;if(e.subtreeFlags&13878||n){n=se.T,se.T=null;var a=Ve.p;Ve.p=2;var r=Ne;Ne|=4;try{rC(e,t);var s=Yg,i=Ub(t.containerInfo),u=s.focusedElem,l=s.selectionRange;if(i!==u&&u&&u.ownerDocument&&Fb(u.ownerDocument.documentElement,u)){if(l!==null&&hy(u)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in u)u.selectionStart=c,u.selectionEnd=Math.min(f,u.value.length);else{var m=u.ownerDocument||document,p=m&&m.defaultView||window;if(p.getSelection){var S=p.getSelection(),R=u.textContent.length,D=Math.min(l.start,R),A=l.end===void 0?D:Math.min(l.end,R);!S.extend&&D>A&&(i=A,A=D,D=i);var E=nT(u,D),_=nT(u,A);if(E&&_&&(S.rangeCount!==1||S.anchorNode!==E.node||S.anchorOffset!==E.offset||S.focusNode!==_.node||S.focusOffset!==_.offset)){var w=m.createRange();w.setStart(E.node,E.offset),S.removeAllRanges(),D>A?(S.addRange(w),S.extend(_.node,_.offset)):(w.setEnd(_.node,_.offset),S.addRange(w))}}}}for(m=[],S=u;S=S.parentNode;)S.nodeType===1&&m.push({element:S,left:S.scrollLeft,top:S.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<m.length;u++){var L=m[u];L.element.scrollLeft=L.left,L.element.scrollTop=L.top}}Mf=!!Wg,Yg=Wg=null}finally{Ne=r,Ve.p=a,se.T=n}}t.current=e,Yt=2}}function EC(){if(Yt===2){Yt=0;var t=Ds,e=Mo,n=(e.flags&8772)!==0;if(e.subtreeFlags&8772||n){n=se.T,se.T=null;var a=Ve.p;Ve.p=2;var r=Ne;Ne|=4;try{Zw(t,e.alternate,e)}finally{Ne=r,Ve.p=a,se.T=n}}Yt=3}}function TC(){if(Yt===4||Yt===3){Yt=0,I1();var t=Ds,e=Mo,n=Lr,a=fC;e.subtreeFlags&10256||e.flags&10256?Yt=5:(Yt=0,Mo=Ds=null,bC(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(ks=null),iy(n),e=e.stateNode,ea&&typeof ea.onCommitFiberRoot=="function")try{ea.onCommitFiberRoot(Hl,e,void 0,(e.current.flags&128)===128)}catch{}if(a!==null){e=se.T,r=Ve.p,Ve.p=2,se.T=null;try{for(var s=t.onRecoverableError,i=0;i<a.length;i++){var u=a[i];s(u.value,{componentStack:u.stack})}}finally{se.T=e,Ve.p=r}}Lr&3&&$f(),Ka(t),r=t.pendingLanes,n&261930&&r&42?t===Gg?wl++:(wl=0,Gg=t):wl=0,Ql(0,!1)}}function bC(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,Wl(e)))}function $f(){return vC(),EC(),TC(),wC()}function wC(){if(Yt!==5)return!1;var t=Ds,e=Hg;Hg=0;var n=iy(Lr),a=se.T,r=Ve.p;try{Ve.p=32>n?32:n,se.T=null,n=zg,zg=null;var s=Ds,i=Lr;if(Yt=0,Mo=Ds=null,Lr=0,Ne&6)throw Error(F(331));var u=Ne;if(Ne|=4,lC(s.current),iC(s,s.current,i,n),Ne=u,Ql(0,!1),ea&&typeof ea.onPostCommitFiberRoot=="function")try{ea.onPostCommitFiberRoot(Hl,s)}catch{}return!0}finally{Ve.p=r,se.T=a,bC(t,e)}}function MT(t,e,n){e=pa(n,e),e=Vg(t.stateNode,e,2),t=Rs(t,e,2),t!==null&&(Gl(t,2),Ka(t))}function ze(t,e,n){if(t.tag===3)MT(t,t,n);else for(;e!==null;){if(e.tag===3){MT(e,t,n);break}else if(e.tag===1){var a=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(ks===null||!ks.has(a))){t=pa(n,t),n=Bw(2),a=Rs(e,n,2),a!==null&&(qw(n,a,e,t),Gl(a,2),Ka(a));break}}e=e.return}}function tg(t,e,n){var a=t.pingCache;if(a===null){a=t.pingCache=new GD;var r=new Set;a.set(e,r)}else r=a.get(e),r===void 0&&(r=new Set,a.set(e,r));r.has(n)||(qy=!0,r.add(n),t=XD.bind(null,t,e,n),e.then(t,t))}function XD(t,e,n){var a=t.pingCache;a!==null&&a.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,Ze===t&&(Ae&n)===n&&(At===4||At===3&&(Ae&62914560)===Ae&&300>Zn()-Yf?!(Ne&2)&&No(t,0):Hy|=n,Oo===Ae&&(Oo=0)),Ka(t)}function CC(t,e){e===0&&(e=yb()),t=_i(t,e),t!==null&&(Gl(t,e),Ka(t))}function QD(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),CC(t,n)}function $D(t,e){var n=0;switch(t.tag){case 31:case 13:var a=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:a=t.stateNode;break;case 22:a=t.stateNode._retryCache;break;default:throw Error(F(314))}a!==null&&a.delete(e),CC(t,n)}function JD(t,e){return ry(t,e)}var Af=null,oo=null,jg=!1,xf=!1,ng=!1,Cs=0;function Ka(t){t!==oo&&t.next===null&&(oo===null?Af=oo=t:oo=oo.next=t),xf=!0,jg||(jg=!0,eP())}function Ql(t,e){if(!ng&&xf){ng=!0;do for(var n=!1,a=Af;a!==null;){if(!e)if(t!==0){var r=a.pendingLanes;if(r===0)var s=0;else{var i=a.suspendedLanes,u=a.pingedLanes;s=(1<<31-ta(42|t)+1)-1,s&=r&~(i&~u),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(n=!0,NT(a,s))}else s=Ae,s=Vf(a,a===Ze?s:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(s&3)||zl(a,s)||(n=!0,NT(a,s));a=a.next}while(n);ng=!1}}function ZD(){LC()}function LC(){xf=jg=!1;var t=0;Cs!==0&&uP()&&(t=Cs);for(var e=Zn(),n=null,a=Af;a!==null;){var r=a.next,s=AC(a,e);s===0?(a.next=null,n===null?Af=r:n.next=r,r===null&&(oo=n)):(n=a,(t!==0||s&3)&&(xf=!0)),a=r}Yt!==0&&Yt!==5||Ql(t,!1),Cs!==0&&(Cs=0)}function AC(t,e){for(var n=t.suspendedLanes,a=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes&-62914561;0<s;){var i=31-ta(s),u=1<<i,l=r[i];l===-1?(!(u&n)||u&a)&&(r[i]=C1(u,e)):l<=e&&(t.expiredLanes|=u),s&=~u}if(e=Ze,n=Ae,n=Vf(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a=t.callbackNode,n===0||t===e&&(He===2||He===9)||t.cancelPendingCommit!==null)return a!==null&&a!==null&&km(a),t.callbackNode=null,t.callbackPriority=0;if(!(n&3)||zl(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(a!==null&&km(a),iy(n)){case 2:case 8:n=mb;break;case 32:n=df;break;case 268435456:n=gb;break;default:n=df}return a=xC.bind(null,t),n=ry(n,a),t.callbackPriority=e,t.callbackNode=n,e}return a!==null&&a!==null&&km(a),t.callbackPriority=2,t.callbackNode=null,2}function xC(t,e){if(Yt!==0&&Yt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if($f()&&t.callbackNode!==n)return null;var a=Ae;return a=Vf(t,t===Ze?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a===0?null:(pC(t,a,e),AC(t,Zn()),t.callbackNode!=null&&t.callbackNode===n?xC.bind(null,t):null)}function NT(t,e){if($f())return null;pC(t,e,!0)}function eP(){cP(function(){Ne&6?ry(pb,ZD):LC()})}function Gy(){if(Cs===0){var t=ko;t===0&&(t=xd,xd<<=1,!(xd&261888)&&(xd=256)),Cs=t}return Cs}function VT(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Wd(""+t)}function FT(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function tP(t,e,n,a,r){if(e==="submit"&&n&&n.stateNode===r){var s=VT((r[Un]||null).action),i=a.submitter;i&&(e=(e=i[Un]||null)?VT(e.formAction):i.getAttribute("formAction"),e!==null&&(s=e,i=null));var u=new Ff("action","action",null,a,r);t.push({event:u,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(Cs!==0){var l=i?FT(r,i):new FormData(r);Mg(n,{pending:!0,data:l,method:r.method,action:s},null,l)}}else typeof s=="function"&&(u.preventDefault(),l=i?FT(r,i):new FormData(r),Mg(n,{pending:!0,data:l,method:r.method,action:s},s,l))},currentTarget:r}]})}}for(qd=0;qd<Tg.length;qd++)Hd=Tg[qd],UT=Hd.toLowerCase(),BT=Hd[0].toUpperCase()+Hd.slice(1),Aa(UT,"on"+BT);var Hd,UT,BT,qd;Aa(qb,"onAnimationEnd");Aa(Hb,"onAnimationIteration");Aa(zb,"onAnimationStart");Aa("dblclick","onDoubleClick");Aa("focusin","onFocus");Aa("focusout","onBlur");Aa(_D,"onTransitionRun");Aa(SD,"onTransitionStart");Aa(vD,"onTransitionCancel");Aa(Gb,"onTransitionEnd");xo("onMouseEnter",["mouseout","mouseover"]);xo("onMouseLeave",["mouseout","mouseover"]);xo("onPointerEnter",["pointerout","pointerover"]);xo("onPointerLeave",["pointerout","pointerover"]);gi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));gi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));gi("onBeforeInput",["compositionend","keypress","textInput","paste"]);gi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));gi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));gi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Nl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),nP=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Nl));function RC(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var a=t[n],r=a.event;a=a.listeners;e:{var s=void 0;if(e)for(var i=a.length-1;0<=i;i--){var u=a[i],l=u.instance,c=u.currentTarget;if(u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=c;try{s(r)}catch(f){hf(f)}r.currentTarget=null,s=l}else for(i=0;i<a.length;i++){if(u=a[i],l=u.instance,c=u.currentTarget,u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=c;try{s(r)}catch(f){hf(f)}r.currentTarget=null,s=l}}}}function Te(t,e){var n=e[mg];n===void 0&&(n=e[mg]=new Set);var a=t+"__bubble";n.has(a)||(kC(e,t,2,!1),n.add(a))}function ag(t,e,n){var a=0;e&&(a|=4),kC(n,t,a,e)}var zd="_reactListening"+Math.random().toString(36).slice(2);function jy(t){if(!t[zd]){t[zd]=!0,Eb.forEach(function(n){n!=="selectionchange"&&(nP.has(n)||ag(n,!1,t),ag(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[zd]||(e[zd]=!0,ag("selectionchange",!1,e))}}function kC(t,e,n,a){switch(GC(e)){case 2:var r=RP;break;case 8:r=kP;break;default:r=Xy}n=r.bind(null,e,n,t),r=void 0,!Sg||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),a?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function rg(t,e,n,a,r){var s=a;if(!(e&1)&&!(e&2)&&a!==null)e:for(;;){if(a===null)return;var i=a.tag;if(i===3||i===4){var u=a.stateNode.containerInfo;if(u===r)break;if(i===4)for(i=a.return;i!==null;){var l=i.tag;if((l===3||l===4)&&i.stateNode.containerInfo===r)return;i=i.return}for(;u!==null;){if(i=co(u),i===null)return;if(l=i.tag,l===5||l===6||l===26||l===27){a=s=i;continue e}u=u.parentNode}}a=a.return}Rb(function(){var c=s,f=ly(n),m=[];e:{var p=jb.get(t);if(p!==void 0){var S=Ff,R=t;switch(t){case"keypress":if(Xd(n)===0)break e;case"keydown":case"keyup":S=$1;break;case"focusin":R="focus",S=Nm;break;case"focusout":R="blur",S=Nm;break;case"beforeblur":case"afterblur":S=Nm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":S=WE;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":S=U1;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":S=eD;break;case qb:case Hb:case zb:S=H1;break;case Gb:S=nD;break;case"scroll":case"scrollend":S=V1;break;case"wheel":S=rD;break;case"copy":case"cut":case"paste":S=G1;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":S=XE;break;case"toggle":case"beforetoggle":S=iD}var D=(e&4)!==0,A=!D&&(t==="scroll"||t==="scrollend"),E=D?p!==null?p+"Capture":null:p;D=[];for(var _=c,w;_!==null;){var L=_;if(w=L.stateNode,L=L.tag,L!==5&&L!==26&&L!==27||w===null||E===null||(L=Al(_,E),L!=null&&D.push(Vl(_,L,w))),A)break;_=_.return}0<D.length&&(p=new S(p,R,null,n,f),m.push({event:p,listeners:D}))}}if(!(e&7)){e:{if(p=t==="mouseover"||t==="pointerover",S=t==="mouseout"||t==="pointerout",p&&n!==_g&&(R=n.relatedTarget||n.fromElement)&&(co(R)||R[Uo]))break e;if((S||p)&&(p=f.window===f?f:(p=f.ownerDocument)?p.defaultView||p.parentWindow:window,S?(R=n.relatedTarget||n.toElement,S=c,R=R?co(R):null,R!==null&&(A=ql(R),D=R.tag,R!==A||D!==5&&D!==27&&D!==6)&&(R=null)):(S=null,R=c),S!==R)){if(D=WE,L="onMouseLeave",E="onMouseEnter",_="mouse",(t==="pointerout"||t==="pointerover")&&(D=XE,L="onPointerLeave",E="onPointerEnter",_="pointer"),A=S==null?p:dl(S),w=R==null?p:dl(R),p=new D(L,_+"leave",S,n,f),p.target=A,p.relatedTarget=w,L=null,co(f)===c&&(D=new D(E,_+"enter",R,n,f),D.target=w,D.relatedTarget=A,L=D),A=L,S&&R)t:{for(D=aP,E=S,_=R,w=0,L=E;L;L=D(L))w++;L=0;for(var q=_;q;q=D(q))L++;for(;0<w-L;)E=D(E),w--;for(;0<L-w;)_=D(_),L--;for(;w--;){if(E===_||_!==null&&E===_.alternate){D=E;break t}E=D(E),_=D(_)}D=null}else D=null;S!==null&&qT(m,p,S,D,!1),R!==null&&A!==null&&qT(m,A,R,D,!0)}}e:{if(p=c?dl(c):window,S=p.nodeName&&p.nodeName.toLowerCase(),S==="select"||S==="input"&&p.type==="file")var z=ZE;else if(JE(p))if(Nb)z=gD;else{z=pD;var v=hD}else S=p.nodeName,!S||S.toLowerCase()!=="input"||p.type!=="checkbox"&&p.type!=="radio"?c&&uy(c.elementType)&&(z=ZE):z=mD;if(z&&(z=z(t,c))){Mb(m,z,n,f);break e}v&&v(t,p,c),t==="focusout"&&c&&p.type==="number"&&c.memoizedProps.value!=null&&Ig(p,"number",p.value)}switch(v=c?dl(c):window,t){case"focusin":(JE(v)||v.contentEditable==="true")&&(po=v,vg=c,gl=null);break;case"focusout":gl=vg=po=null;break;case"mousedown":Eg=!0;break;case"contextmenu":case"mouseup":case"dragend":Eg=!1,aT(m,n,f);break;case"selectionchange":if(ID)break;case"keydown":case"keyup":aT(m,n,f)}var g;if(fy)e:{switch(t){case"compositionstart":var I="onCompositionStart";break e;case"compositionend":I="onCompositionEnd";break e;case"compositionupdate":I="onCompositionUpdate";break e}I=void 0}else ho?Pb(t,n)&&(I="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(I="onCompositionStart");I&&(Db&&n.locale!=="ko"&&(ho||I!=="onCompositionStart"?I==="onCompositionEnd"&&ho&&(g=kb()):(Ts=f,cy="value"in Ts?Ts.value:Ts.textContent,ho=!0)),v=Rf(c,I),0<v.length&&(I=new YE(I,t,null,n,f),m.push({event:I,listeners:v}),g?I.data=g:(g=Ob(n),g!==null&&(I.data=g)))),(g=uD?lD(t,n):cD(t,n))&&(I=Rf(c,"onBeforeInput"),0<I.length&&(v=new YE("onBeforeInput","beforeinput",null,n,f),m.push({event:v,listeners:I}),v.data=g)),tP(m,t,c,n,f)}RC(m,e)})}function Vl(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Rf(t,e){for(var n=e+"Capture",a=[];t!==null;){var r=t,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=Al(t,n),r!=null&&a.unshift(Vl(t,r,s)),r=Al(t,e),r!=null&&a.push(Vl(t,r,s))),t.tag===3)return a;t=t.return}return[]}function aP(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function qT(t,e,n,a,r){for(var s=e._reactName,i=[];n!==null&&n!==a;){var u=n,l=u.alternate,c=u.stateNode;if(u=u.tag,l!==null&&l===a)break;u!==5&&u!==26&&u!==27||c===null||(l=c,r?(c=Al(n,s),c!=null&&i.unshift(Vl(n,c,l))):r||(c=Al(n,s),c!=null&&i.push(Vl(n,c,l)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var rP=/\r\n?/g,sP=/\u0000|\uFFFD/g;function HT(t){return(typeof t=="string"?t:""+t).replace(rP,`
`).replace(sP,"")}function DC(t,e){return e=HT(e),HT(t)===e}function Ye(t,e,n,a,r,s){switch(n){case"children":typeof a=="string"?e==="body"||e==="textarea"&&a===""||Ro(t,a):(typeof a=="number"||typeof a=="bigint")&&e!=="body"&&Ro(t,""+a);break;case"className":Dd(t,"class",a);break;case"tabIndex":Dd(t,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":Dd(t,n,a);break;case"style":xb(t,a,s);break;case"data":if(e!=="object"){Dd(t,"data",a);break}case"src":case"href":if(a===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Wd(""+a),t.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(n==="formAction"?(e!=="input"&&Ye(t,e,"name",r.name,r,null),Ye(t,e,"formEncType",r.formEncType,r,null),Ye(t,e,"formMethod",r.formMethod,r,null),Ye(t,e,"formTarget",r.formTarget,r,null)):(Ye(t,e,"encType",r.encType,r,null),Ye(t,e,"method",r.method,r,null),Ye(t,e,"target",r.target,r,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=Wd(""+a),t.setAttribute(n,a);break;case"onClick":a!=null&&(t.onclick=Tr);break;case"onScroll":a!=null&&Te("scroll",t);break;case"onScrollEnd":a!=null&&Te("scrollend",t);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(F(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(F(60));t.innerHTML=n}}break;case"multiple":t.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":t.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){t.removeAttribute("xlink:href");break}n=Wd(""+a),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""+a):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":a===!0?t.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,a):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?t.setAttribute(n,a):t.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?t.removeAttribute(n):t.setAttribute(n,a);break;case"popover":Te("beforetoggle",t),Te("toggle",t),Kd(t,"popover",a);break;case"xlinkActuate":mr(t,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":mr(t,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":mr(t,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":mr(t,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":mr(t,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":mr(t,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":mr(t,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":mr(t,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":mr(t,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":Kd(t,"is",a);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=M1.get(n)||n,Kd(t,n,a))}}function Kg(t,e,n,a,r,s){switch(n){case"style":xb(t,a,s);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(F(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(F(60));t.innerHTML=n}}break;case"children":typeof a=="string"?Ro(t,a):(typeof a=="number"||typeof a=="bigint")&&Ro(t,""+a);break;case"onScroll":a!=null&&Te("scroll",t);break;case"onScrollEnd":a!=null&&Te("scrollend",t);break;case"onClick":a!=null&&(t.onclick=Tr);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Tb.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),s=t[Un]||null,s=s!=null?s[n]:null,typeof s=="function"&&t.removeEventListener(e,s,r),typeof a=="function")){typeof s!="function"&&s!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,a,r);break e}n in t?t[n]=a:a===!0?t.setAttribute(n,""):Kd(t,n,a)}}}function gn(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Te("error",t),Te("load",t);var a=!1,r=!1,s;for(s in n)if(n.hasOwnProperty(s)){var i=n[s];if(i!=null)switch(s){case"src":a=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(F(137,e));default:Ye(t,e,s,i,n,null)}}r&&Ye(t,e,"srcSet",n.srcSet,n,null),a&&Ye(t,e,"src",n.src,n,null);return;case"input":Te("invalid",t);var u=s=i=r=null,l=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":r=f;break;case"type":i=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":s=f;break;case"defaultValue":u=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(F(137,e));break;default:Ye(t,e,a,f,n,null)}}Cb(t,s,u,l,c,i,r,!1);return;case"select":Te("invalid",t),a=i=s=null;for(r in n)if(n.hasOwnProperty(r)&&(u=n[r],u!=null))switch(r){case"value":s=u;break;case"defaultValue":i=u;break;case"multiple":a=u;default:Ye(t,e,r,u,n,null)}e=s,n=i,t.multiple=!!a,e!=null?Eo(t,!!a,e,!1):n!=null&&Eo(t,!!a,n,!0);return;case"textarea":Te("invalid",t),s=r=a=null;for(i in n)if(n.hasOwnProperty(i)&&(u=n[i],u!=null))switch(i){case"value":a=u;break;case"defaultValue":r=u;break;case"children":s=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(F(91));break;default:Ye(t,e,i,u,n,null)}Ab(t,a,r,s);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(a=n[l],a!=null))switch(l){case"selected":t.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:Ye(t,e,l,a,n,null)}return;case"dialog":Te("beforetoggle",t),Te("toggle",t),Te("cancel",t),Te("close",t);break;case"iframe":case"object":Te("load",t);break;case"video":case"audio":for(a=0;a<Nl.length;a++)Te(Nl[a],t);break;case"image":Te("error",t),Te("load",t);break;case"details":Te("toggle",t);break;case"embed":case"source":case"link":Te("error",t),Te("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(F(137,e));default:Ye(t,e,c,a,n,null)}return;default:if(uy(e)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&Kg(t,e,f,a,n,void 0));return}}for(u in n)n.hasOwnProperty(u)&&(a=n[u],a!=null&&Ye(t,e,u,a,n,null))}function iP(t,e,n,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,i=null,u=null,l=null,c=null,f=null;for(S in n){var m=n[S];if(n.hasOwnProperty(S)&&m!=null)switch(S){case"checked":break;case"value":break;case"defaultValue":l=m;default:a.hasOwnProperty(S)||Ye(t,e,S,null,a,m)}}for(var p in a){var S=a[p];if(m=n[p],a.hasOwnProperty(p)&&(S!=null||m!=null))switch(p){case"type":s=S;break;case"name":r=S;break;case"checked":c=S;break;case"defaultChecked":f=S;break;case"value":i=S;break;case"defaultValue":u=S;break;case"children":case"dangerouslySetInnerHTML":if(S!=null)throw Error(F(137,e));break;default:S!==m&&Ye(t,e,p,S,a,m)}}yg(t,i,u,l,c,f,s,r);return;case"select":S=i=u=p=null;for(s in n)if(l=n[s],n.hasOwnProperty(s)&&l!=null)switch(s){case"value":break;case"multiple":S=l;default:a.hasOwnProperty(s)||Ye(t,e,s,null,a,l)}for(r in a)if(s=a[r],l=n[r],a.hasOwnProperty(r)&&(s!=null||l!=null))switch(r){case"value":p=s;break;case"defaultValue":u=s;break;case"multiple":i=s;default:s!==l&&Ye(t,e,r,s,a,l)}e=u,n=i,a=S,p!=null?Eo(t,!!n,p,!1):!!a!=!!n&&(e!=null?Eo(t,!!n,e,!0):Eo(t,!!n,n?[]:"",!1));return;case"textarea":S=p=null;for(u in n)if(r=n[u],n.hasOwnProperty(u)&&r!=null&&!a.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Ye(t,e,u,null,a,r)}for(i in a)if(r=a[i],s=n[i],a.hasOwnProperty(i)&&(r!=null||s!=null))switch(i){case"value":p=r;break;case"defaultValue":S=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(F(91));break;default:r!==s&&Ye(t,e,i,r,a,s)}Lb(t,p,S);return;case"option":for(var R in n)if(p=n[R],n.hasOwnProperty(R)&&p!=null&&!a.hasOwnProperty(R))switch(R){case"selected":t.selected=!1;break;default:Ye(t,e,R,null,a,p)}for(l in a)if(p=a[l],S=n[l],a.hasOwnProperty(l)&&p!==S&&(p!=null||S!=null))switch(l){case"selected":t.selected=p&&typeof p!="function"&&typeof p!="symbol";break;default:Ye(t,e,l,p,a,S)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var D in n)p=n[D],n.hasOwnProperty(D)&&p!=null&&!a.hasOwnProperty(D)&&Ye(t,e,D,null,a,p);for(c in a)if(p=a[c],S=n[c],a.hasOwnProperty(c)&&p!==S&&(p!=null||S!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(F(137,e));break;default:Ye(t,e,c,p,a,S)}return;default:if(uy(e)){for(var A in n)p=n[A],n.hasOwnProperty(A)&&p!==void 0&&!a.hasOwnProperty(A)&&Kg(t,e,A,void 0,a,p);for(f in a)p=a[f],S=n[f],!a.hasOwnProperty(f)||p===S||p===void 0&&S===void 0||Kg(t,e,f,p,a,S);return}}for(var E in n)p=n[E],n.hasOwnProperty(E)&&p!=null&&!a.hasOwnProperty(E)&&Ye(t,e,E,null,a,p);for(m in a)p=a[m],S=n[m],!a.hasOwnProperty(m)||p===S||p==null&&S==null||Ye(t,e,m,p,a,S)}function zT(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function oP(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var r=n[a],s=r.transferSize,i=r.initiatorType,u=r.duration;if(s&&u&&zT(i)){for(i=0,u=r.responseEnd,a+=1;a<n.length;a++){var l=n[a],c=l.startTime;if(c>u)break;var f=l.transferSize,m=l.initiatorType;f&&zT(m)&&(l=l.responseEnd,i+=f*(l<u?1:(u-c)/(l-c)))}if(--a,e+=8*(s+i)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Wg=null,Yg=null;function kf(t){return t.nodeType===9?t:t.ownerDocument}function GT(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function PC(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function Xg(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var sg=null;function uP(){var t=window.event;return t&&t.type==="popstate"?t===sg?!1:(sg=t,!0):(sg=null,!1)}var OC=typeof setTimeout=="function"?setTimeout:void 0,lP=typeof clearTimeout=="function"?clearTimeout:void 0,jT=typeof Promise=="function"?Promise:void 0,cP=typeof queueMicrotask=="function"?queueMicrotask:typeof jT<"u"?function(t){return jT.resolve(null).then(t).catch(dP)}:OC;function dP(t){setTimeout(function(){throw t})}function qs(t){return t==="head"}function KT(t,e){var n=e,a=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(a===0){t.removeChild(r),Fo(e);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")Cl(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,Cl(n);for(var s=n.firstChild;s;){var i=s.nextSibling,u=s.nodeName;s[jl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&s.rel.toLowerCase()==="stylesheet"||n.removeChild(s),s=i}}else n==="body"&&Cl(t.ownerDocument.body);n=r}while(n);Fo(e)}function WT(t,e){var n=t;t=0;do{var a=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=a}while(n)}function Qg(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Qg(n),oy(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function fP(t,e,n,a){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!a&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(a){if(!t[jl])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(s=t.getAttribute("rel"),s==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(s!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(s=t.getAttribute("src"),(s!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===s)return t}else return t;if(t=ya(t.nextSibling),t===null)break}return null}function hP(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=ya(t.nextSibling),t===null))return null;return t}function MC(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=ya(t.nextSibling),t===null))return null;return t}function $g(t){return t.data==="$?"||t.data==="$~"}function Jg(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function pP(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var a=function(){e(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),t._reactRetry=a}}function ya(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Zg=null;function YT(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return ya(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function XT(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function NC(t,e,n){switch(e=kf(n),t){case"html":if(t=e.documentElement,!t)throw Error(F(452));return t;case"head":if(t=e.head,!t)throw Error(F(453));return t;case"body":if(t=e.body,!t)throw Error(F(454));return t;default:throw Error(F(451))}}function Cl(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);oy(t)}var Ia=new Map,QT=new Set;function Df(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var Pr=Ve.d;Ve.d={f:mP,r:gP,D:yP,C:IP,L:_P,m:SP,X:EP,S:vP,M:TP};function mP(){var t=Pr.f(),e=Xf();return t||e}function gP(t){var e=Bo(t);e!==null&&e.tag===5&&e.type==="form"?xw(e):Pr.r(t)}var Go=typeof document>"u"?null:document;function VC(t,e,n){var a=Go;if(a&&typeof e=="string"&&e){var r=ha(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),QT.has(r)||(QT.add(r),t={rel:t,crossOrigin:n,href:e},a.querySelector(r)===null&&(e=a.createElement("link"),gn(e,"link",t),tn(e),a.head.appendChild(e)))}}function yP(t){Pr.D(t),VC("dns-prefetch",t,null)}function IP(t,e){Pr.C(t,e),VC("preconnect",t,e)}function _P(t,e,n){Pr.L(t,e,n);var a=Go;if(a&&t&&e){var r='link[rel="preload"][as="'+ha(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+ha(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+ha(n.imageSizes)+'"]')):r+='[href="'+ha(t)+'"]';var s=r;switch(e){case"style":s=Vo(t);break;case"script":s=jo(t)}Ia.has(s)||(t=ut({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),Ia.set(s,t),a.querySelector(r)!==null||e==="style"&&a.querySelector($l(s))||e==="script"&&a.querySelector(Jl(s))||(e=a.createElement("link"),gn(e,"link",t),tn(e),a.head.appendChild(e)))}}function SP(t,e){Pr.m(t,e);var n=Go;if(n&&t){var a=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+ha(a)+'"][href="'+ha(t)+'"]',s=r;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=jo(t)}if(!Ia.has(s)&&(t=ut({rel:"modulepreload",href:t},e),Ia.set(s,t),n.querySelector(r)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Jl(s)))return}a=n.createElement("link"),gn(a,"link",t),tn(a),n.head.appendChild(a)}}}function vP(t,e,n){Pr.S(t,e,n);var a=Go;if(a&&t){var r=vo(a).hoistableStyles,s=Vo(t);e=e||"default";var i=r.get(s);if(!i){var u={loading:0,preload:null};if(i=a.querySelector($l(s)))u.loading=5;else{t=ut({rel:"stylesheet",href:t,"data-precedence":e},n),(n=Ia.get(s))&&Ky(t,n);var l=i=a.createElement("link");tn(l),gn(l,"link",t),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){u.loading|=1}),l.addEventListener("error",function(){u.loading|=2}),u.loading|=4,af(i,e,a)}i={type:"stylesheet",instance:i,count:1,state:u},r.set(s,i)}}}function EP(t,e){Pr.X(t,e);var n=Go;if(n&&t){var a=vo(n).hoistableScripts,r=jo(t),s=a.get(r);s||(s=n.querySelector(Jl(r)),s||(t=ut({src:t,async:!0},e),(e=Ia.get(r))&&Wy(t,e),s=n.createElement("script"),tn(s),gn(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function TP(t,e){Pr.M(t,e);var n=Go;if(n&&t){var a=vo(n).hoistableScripts,r=jo(t),s=a.get(r);s||(s=n.querySelector(Jl(r)),s||(t=ut({src:t,async:!0,type:"module"},e),(e=Ia.get(r))&&Wy(t,e),s=n.createElement("script"),tn(s),gn(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function $T(t,e,n,a){var r=(r=Ls.current)?Df(r):null;if(!r)throw Error(F(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Vo(n.href),n=vo(r).hoistableStyles,a=n.get(e),a||(a={type:"style",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Vo(n.href);var s=vo(r).hoistableStyles,i=s.get(t);if(i||(r=r.ownerDocument||r,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(t,i),(s=r.querySelector($l(t)))&&!s._p&&(i.instance=s,i.state.loading=5),Ia.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Ia.set(t,n),s||bP(r,t,n,i.state))),e&&a===null)throw Error(F(528,""));return i}if(e&&a!==null)throw Error(F(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=jo(n),n=vo(r).hoistableScripts,a=n.get(e),a||(a={type:"script",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(F(444,t))}}function Vo(t){return'href="'+ha(t)+'"'}function $l(t){return'link[rel="stylesheet"]['+t+"]"}function FC(t){return ut({},t,{"data-precedence":t.precedence,precedence:null})}function bP(t,e,n,a){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?a.loading=1:(e=t.createElement("link"),a.preload=e,e.addEventListener("load",function(){return a.loading|=1}),e.addEventListener("error",function(){return a.loading|=2}),gn(e,"link",n),tn(e),t.head.appendChild(e))}function jo(t){return'[src="'+ha(t)+'"]'}function Jl(t){return"script[async]"+t}function JT(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var a=t.querySelector('style[data-href~="'+ha(n.href)+'"]');if(a)return e.instance=a,tn(a),a;var r=ut({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(t.ownerDocument||t).createElement("style"),tn(a),gn(a,"style",r),af(a,n.precedence,t),e.instance=a;case"stylesheet":r=Vo(n.href);var s=t.querySelector($l(r));if(s)return e.state.loading|=4,e.instance=s,tn(s),s;a=FC(n),(r=Ia.get(r))&&Ky(a,r),s=(t.ownerDocument||t).createElement("link"),tn(s);var i=s;return i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),gn(s,"link",a),e.state.loading|=4,af(s,n.precedence,t),e.instance=s;case"script":return s=jo(n.src),(r=t.querySelector(Jl(s)))?(e.instance=r,tn(r),r):(a=n,(r=Ia.get(s))&&(a=ut({},n),Wy(a,r)),t=t.ownerDocument||t,r=t.createElement("script"),tn(r),gn(r,"link",a),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(F(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(a=e.instance,e.state.loading|=4,af(a,n.precedence,t));return e.instance}function af(t,e,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=a.length?a[a.length-1]:null,s=r,i=0;i<a.length;i++){var u=a[i];if(u.dataset.precedence===e)s=u;else if(s!==r)break}s?s.parentNode.insertBefore(t,s.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function Ky(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Wy(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var rf=null;function ZT(t,e,n){if(rf===null){var a=new Map,r=rf=new Map;r.set(n,a)}else r=rf,a=r.get(n),a||(a=new Map,r.set(n,a));if(a.has(t))return a;for(a.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var s=n[r];if(!(s[jl]||s[hn]||t==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var i=s.getAttribute(e)||"";i=t+i;var u=a.get(i);u?u.push(s):a.set(i,[s])}}return a}function eb(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function wP(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function UC(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function CP(t,e,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(n.state.loading&4)){if(n.instance===null){var r=Vo(a.href),s=e.querySelector($l(r));if(s){e=s._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Pf.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=s,tn(s);return}s=e.ownerDocument||e,a=FC(a),(r=Ia.get(r))&&Ky(a,r),s=s.createElement("link"),tn(s);var i=s;i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),gn(s,"link",a),n.instance=s}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&!(n.state.loading&3)&&(t.count++,n=Pf.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var ig=0;function LP(t,e){return t.stylesheets&&t.count===0&&sf(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var a=setTimeout(function(){if(t.stylesheets&&sf(t,t.stylesheets),t.unsuspend){var s=t.unsuspend;t.unsuspend=null,s()}},6e4+e);0<t.imgBytes&&ig===0&&(ig=62500*oP());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&sf(t,t.stylesheets),t.unsuspend)){var s=t.unsuspend;t.unsuspend=null,s()}},(t.imgBytes>ig?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(a),clearTimeout(r)}}:null}function Pf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)sf(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Of=null;function sf(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Of=new Map,e.forEach(AP,t),Of=null,Pf.call(t))}function AP(t,e){if(!(e.state.loading&4)){var n=Of.get(t);if(n)var a=n.get(null);else{n=new Map,Of.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var i=r[s];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),a=i)}a&&n.set(null,a)}r=e.instance,i=r.getAttribute("data-precedence"),s=n.get(i)||a,s===a&&n.set(null,r),n.set(i,r),this.count++,a=Pf.bind(this),r.addEventListener("load",a),r.addEventListener("error",a),s?s.parentNode.insertBefore(r,s.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var Fl={$$typeof:Er,Provider:null,Consumer:null,_currentValue:ii,_currentValue2:ii,_threadCount:0};function xP(t,e,n,a,r,s,i,u,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Dm(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Dm(0),this.hiddenUpdates=Dm(null),this.identifierPrefix=a,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function BC(t,e,n,a,r,s,i,u,l,c,f,m){return t=new xP(t,e,n,i,l,c,f,m,u),e=1,s===!0&&(e|=24),s=$n(3,null,null,e),t.current=s,s.stateNode=t,e=_y(),e.refCount++,t.pooledCache=e,e.refCount++,s.memoizedState={element:a,isDehydrated:n,cache:e},Ey(s),t}function qC(t){return t?(t=yo,t):yo}function HC(t,e,n,a,r,s){r=qC(r),a.context===null?a.context=r:a.pendingContext=r,a=xs(e),a.payload={element:n},s=s===void 0?null:s,s!==null&&(a.callback=s),n=Rs(t,a,e),n!==null&&(Fn(n,t,e),Il(n,t,e))}function tb(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Yy(t,e){tb(t,e),(t=t.alternate)&&tb(t,e)}function zC(t){if(t.tag===13||t.tag===31){var e=_i(t,67108864);e!==null&&Fn(e,t,67108864),Yy(t,67108864)}}function nb(t){if(t.tag===13||t.tag===31){var e=na();e=sy(e);var n=_i(t,e);n!==null&&Fn(n,t,e),Yy(t,e)}}var Mf=!0;function RP(t,e,n,a){var r=se.T;se.T=null;var s=Ve.p;try{Ve.p=2,Xy(t,e,n,a)}finally{Ve.p=s,se.T=r}}function kP(t,e,n,a){var r=se.T;se.T=null;var s=Ve.p;try{Ve.p=8,Xy(t,e,n,a)}finally{Ve.p=s,se.T=r}}function Xy(t,e,n,a){if(Mf){var r=ey(a);if(r===null)rg(t,e,a,Nf,n),ab(t,a);else if(PP(r,t,e,n,a))a.stopPropagation();else if(ab(t,a),e&4&&-1<DP.indexOf(t)){for(;r!==null;){var s=Bo(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var i=ai(s.pendingLanes);if(i!==0){var u=s;for(u.pendingLanes|=2,u.entangledLanes|=2;i;){var l=1<<31-ta(i);u.entanglements[1]|=l,i&=~l}Ka(s),!(Ne&6)&&(wf=Zn()+500,Ql(0,!1))}}break;case 31:case 13:u=_i(s,2),u!==null&&Fn(u,s,2),Xf(),Yy(s,2)}if(s=ey(a),s===null&&rg(t,e,a,Nf,n),s===r)break;r=s}r!==null&&a.stopPropagation()}else rg(t,e,a,null,n)}}function ey(t){return t=ly(t),Qy(t)}var Nf=null;function Qy(t){if(Nf=null,t=co(t),t!==null){var e=ql(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=lb(e),t!==null)return t;t=null}else if(n===31){if(t=cb(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Nf=t,null}function GC(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(_1()){case pb:return 2;case mb:return 8;case df:case S1:return 32;case gb:return 268435456;default:return 32}default:return 32}}var ty=!1,Ps=null,Os=null,Ms=null,Ul=new Map,Bl=new Map,vs=[],DP="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ab(t,e){switch(t){case"focusin":case"focusout":Ps=null;break;case"dragenter":case"dragleave":Os=null;break;case"mouseover":case"mouseout":Ms=null;break;case"pointerover":case"pointerout":Ul.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Bl.delete(e.pointerId)}}function ol(t,e,n,a,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:a,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Bo(e),e!==null&&zC(e)),t):(t.eventSystemFlags|=a,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function PP(t,e,n,a,r){switch(e){case"focusin":return Ps=ol(Ps,t,e,n,a,r),!0;case"dragenter":return Os=ol(Os,t,e,n,a,r),!0;case"mouseover":return Ms=ol(Ms,t,e,n,a,r),!0;case"pointerover":var s=r.pointerId;return Ul.set(s,ol(Ul.get(s)||null,t,e,n,a,r)),!0;case"gotpointercapture":return s=r.pointerId,Bl.set(s,ol(Bl.get(s)||null,t,e,n,a,r)),!0}return!1}function jC(t){var e=co(t.target);if(e!==null){var n=ql(e);if(n!==null){if(e=n.tag,e===13){if(e=lb(n),e!==null){t.blockedOn=e,BE(t.priority,function(){nb(n)});return}}else if(e===31){if(e=cb(n),e!==null){t.blockedOn=e,BE(t.priority,function(){nb(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function of(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=ey(t.nativeEvent);if(n===null){n=t.nativeEvent;var a=new n.constructor(n.type,n);_g=a,n.target.dispatchEvent(a),_g=null}else return e=Bo(n),e!==null&&zC(e),t.blockedOn=n,!1;e.shift()}return!0}function rb(t,e,n){of(t)&&n.delete(e)}function OP(){ty=!1,Ps!==null&&of(Ps)&&(Ps=null),Os!==null&&of(Os)&&(Os=null),Ms!==null&&of(Ms)&&(Ms=null),Ul.forEach(rb),Bl.forEach(rb)}function Gd(t,e){t.blockedOn===e&&(t.blockedOn=null,ty||(ty=!0,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,OP)))}var jd=null;function sb(t){jd!==t&&(jd=t,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,function(){jd===t&&(jd=null);for(var e=0;e<t.length;e+=3){var n=t[e],a=t[e+1],r=t[e+2];if(typeof a!="function"){if(Qy(a||n)===null)continue;break}var s=Bo(n);s!==null&&(t.splice(e,3),e-=3,Mg(s,{pending:!0,data:r,method:n.method,action:a},a,r))}}))}function Fo(t){function e(l){return Gd(l,t)}Ps!==null&&Gd(Ps,t),Os!==null&&Gd(Os,t),Ms!==null&&Gd(Ms,t),Ul.forEach(e),Bl.forEach(e);for(var n=0;n<vs.length;n++){var a=vs[n];a.blockedOn===t&&(a.blockedOn=null)}for(;0<vs.length&&(n=vs[0],n.blockedOn===null);)jC(n),n.blockedOn===null&&vs.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var r=n[a],s=n[a+1],i=r[Un]||null;if(typeof s=="function")i||sb(n);else if(i){var u=null;if(s&&s.hasAttribute("formAction")){if(r=s,i=s[Un]||null)u=i.formAction;else if(Qy(r)!==null)continue}else u=i.action;typeof u=="function"?n[a+1]=u:(n.splice(a,3),a-=3),sb(n)}}}function KC(){function t(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(i){return r=i})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function $y(t){this._internalRoot=t}Jf.prototype.render=$y.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(F(409));var n=e.current,a=na();HC(n,a,t,e,null,null)};Jf.prototype.unmount=$y.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;HC(t.current,2,null,t,null,null),Xf(),e[Uo]=null}};function Jf(t){this._internalRoot=t}Jf.prototype.unstable_scheduleHydration=function(t){if(t){var e=vb();t={blockedOn:null,target:t,priority:e};for(var n=0;n<vs.length&&e!==0&&e<vs[n].priority;n++);vs.splice(n,0,t),n===0&&jC(t)}};var ib=ob.version;if(ib!=="19.2.3")throw Error(F(527,ib,"19.2.3"));Ve.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(F(188)):(t=Object.keys(t).join(","),Error(F(268,t)));return t=f1(e),t=t!==null?db(t):null,t=t===null?null:t.stateNode,t};var MP={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:se,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(ul=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ul.isDisabled&&ul.supportsFiber))try{Hl=ul.inject(MP),ea=ul}catch{}var ul;Zf.createRoot=function(t,e){if(!ub(t))throw Error(F(299));var n=!1,a="",r=Vw,s=Fw,i=Uw;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(a=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(s=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=BC(t,1,!1,null,null,n,a,null,r,s,i,KC),t[Uo]=e.current,jy(t),new $y(e)};Zf.hydrateRoot=function(t,e,n){if(!ub(t))throw Error(F(299));var a=!1,r="",s=Vw,i=Fw,u=Uw,l=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(s=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(u=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),e=BC(t,1,!0,e,n??null,a,r,l,s,i,u,KC),e.context=qC(null),n=e.current,a=na(),a=sy(a),r=xs(a),r.callback=null,Rs(n,r,a),n=a,e.current.lanes=n,Gl(e,n),Ka(e),t[Uo]=e.current,jy(t),new Jf(e)};Zf.version="19.2.3"});var QC=Oe((XU,XC)=>{"use strict";function YC(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(YC)}catch(t){console.error(t)}}YC(),XC.exports=WC()});var $C=Oe((JU,aI)=>{var nI=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,a=Object.defineProperty||function(M,P,N){M[P]=N.value},r,s=typeof Symbol=="function"?Symbol:{},i=s.iterator||"@@iterator",u=s.asyncIterator||"@@asyncIterator",l=s.toStringTag||"@@toStringTag";function c(M,P,N){return Object.defineProperty(M,P,{value:N,enumerable:!0,configurable:!0,writable:!0}),M[P]}try{c({},"")}catch{c=function(P,N,W){return P[N]=W}}function f(M,P,N,W){var Q=P&&P.prototype instanceof E?P:E,ae=Object.create(Q.prototype),at=new de(W||[]);return a(ae,"_invoke",{value:b(M,N,at)}),ae}t.wrap=f;function m(M,P,N){try{return{type:"normal",arg:M.call(P,N)}}catch(W){return{type:"throw",arg:W}}}var p="suspendedStart",S="suspendedYield",R="executing",D="completed",A={};function E(){}function _(){}function w(){}var L={};c(L,i,function(){return this});var q=Object.getPrototypeOf,z=q&&q(q(Se([])));z&&z!==e&&n.call(z,i)&&(L=z);var v=w.prototype=E.prototype=Object.create(L);_.prototype=w,a(v,"constructor",{value:w,configurable:!0}),a(w,"constructor",{value:_,configurable:!0}),_.displayName=c(w,l,"GeneratorFunction");function g(M){["next","throw","return"].forEach(function(P){c(M,P,function(N){return this._invoke(P,N)})})}t.isGeneratorFunction=function(M){var P=typeof M=="function"&&M.constructor;return P?P===_||(P.displayName||P.name)==="GeneratorFunction":!1},t.mark=function(M){return Object.setPrototypeOf?Object.setPrototypeOf(M,w):(M.__proto__=w,c(M,l,"GeneratorFunction")),M.prototype=Object.create(v),M},t.awrap=function(M){return{__await:M}};function I(M,P){function N(ae,at,Fe,Qe){var Ge=m(M[ae],M,at);if(Ge.type==="throw")Qe(Ge.arg);else{var Cn=Ge.arg,Ln=Cn.value;return Ln&&typeof Ln=="object"&&n.call(Ln,"__await")?P.resolve(Ln.__await).then(function(Sn){N("next",Sn,Fe,Qe)},function(Sn){N("throw",Sn,Fe,Qe)}):P.resolve(Ln).then(function(Sn){Cn.value=Sn,Fe(Cn)},function(Sn){return N("throw",Sn,Fe,Qe)})}}var W;function Q(ae,at){function Fe(){return new P(function(Qe,Ge){N(ae,at,Qe,Ge)})}return W=W?W.then(Fe,Fe):Fe()}a(this,"_invoke",{value:Q})}g(I.prototype),c(I.prototype,u,function(){return this}),t.AsyncIterator=I,t.async=function(M,P,N,W,Q){Q===void 0&&(Q=Promise);var ae=new I(f(M,P,N,W),Q);return t.isGeneratorFunction(P)?ae:ae.next().then(function(at){return at.done?at.value:ae.next()})};function b(M,P,N){var W=p;return function(ae,at){if(W===R)throw new Error("Generator is already running");if(W===D){if(ae==="throw")throw at;return lt()}for(N.method=ae,N.arg=at;;){var Fe=N.delegate;if(Fe){var Qe=C(Fe,N);if(Qe){if(Qe===A)continue;return Qe}}if(N.method==="next")N.sent=N._sent=N.arg;else if(N.method==="throw"){if(W===p)throw W=D,N.arg;N.dispatchException(N.arg)}else N.method==="return"&&N.abrupt("return",N.arg);W=R;var Ge=m(M,P,N);if(Ge.type==="normal"){if(W=N.done?D:S,Ge.arg===A)continue;return{value:Ge.arg,done:N.done}}else Ge.type==="throw"&&(W=D,N.method="throw",N.arg=Ge.arg)}}}function C(M,P){var N=P.method,W=M.iterator[N];if(W===r)return P.delegate=null,N==="throw"&&M.iterator.return&&(P.method="return",P.arg=r,C(M,P),P.method==="throw")||N!=="return"&&(P.method="throw",P.arg=new TypeError("The iterator does not provide a '"+N+"' method")),A;var Q=m(W,M.iterator,P.arg);if(Q.type==="throw")return P.method="throw",P.arg=Q.arg,P.delegate=null,A;var ae=Q.arg;if(!ae)return P.method="throw",P.arg=new TypeError("iterator result is not an object"),P.delegate=null,A;if(ae.done)P[M.resultName]=ae.value,P.next=M.nextLoc,P.method!=="return"&&(P.method="next",P.arg=r);else return ae;return P.delegate=null,A}g(v),c(v,l,"Generator"),c(v,i,function(){return this}),c(v,"toString",function(){return"[object Generator]"});function x(M){var P={tryLoc:M[0]};1 in M&&(P.catchLoc=M[1]),2 in M&&(P.finallyLoc=M[2],P.afterLoc=M[3]),this.tryEntries.push(P)}function T(M){var P=M.completion||{};P.type="normal",delete P.arg,M.completion=P}function de(M){this.tryEntries=[{tryLoc:"root"}],M.forEach(x,this),this.reset(!0)}t.keys=function(M){var P=Object(M),N=[];for(var W in P)N.push(W);return N.reverse(),function Q(){for(;N.length;){var ae=N.pop();if(ae in P)return Q.value=ae,Q.done=!1,Q}return Q.done=!0,Q}};function Se(M){if(M){var P=M[i];if(P)return P.call(M);if(typeof M.next=="function")return M;if(!isNaN(M.length)){var N=-1,W=function Q(){for(;++N<M.length;)if(n.call(M,N))return Q.value=M[N],Q.done=!1,Q;return Q.value=r,Q.done=!0,Q};return W.next=W}}return{next:lt}}t.values=Se;function lt(){return{value:r,done:!0}}return de.prototype={constructor:de,reset:function(M){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(T),!M)for(var P in this)P.charAt(0)==="t"&&n.call(this,P)&&!isNaN(+P.slice(1))&&(this[P]=r)},stop:function(){this.done=!0;var M=this.tryEntries[0],P=M.completion;if(P.type==="throw")throw P.arg;return this.rval},dispatchException:function(M){if(this.done)throw M;var P=this;function N(Qe,Ge){return ae.type="throw",ae.arg=M,P.next=Qe,Ge&&(P.method="next",P.arg=r),!!Ge}for(var W=this.tryEntries.length-1;W>=0;--W){var Q=this.tryEntries[W],ae=Q.completion;if(Q.tryLoc==="root")return N("end");if(Q.tryLoc<=this.prev){var at=n.call(Q,"catchLoc"),Fe=n.call(Q,"finallyLoc");if(at&&Fe){if(this.prev<Q.catchLoc)return N(Q.catchLoc,!0);if(this.prev<Q.finallyLoc)return N(Q.finallyLoc)}else if(at){if(this.prev<Q.catchLoc)return N(Q.catchLoc,!0)}else if(Fe){if(this.prev<Q.finallyLoc)return N(Q.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(M,P){for(var N=this.tryEntries.length-1;N>=0;--N){var W=this.tryEntries[N];if(W.tryLoc<=this.prev&&n.call(W,"finallyLoc")&&this.prev<W.finallyLoc){var Q=W;break}}Q&&(M==="break"||M==="continue")&&Q.tryLoc<=P&&P<=Q.finallyLoc&&(Q=null);var ae=Q?Q.completion:{};return ae.type=M,ae.arg=P,Q?(this.method="next",this.next=Q.finallyLoc,A):this.complete(ae)},complete:function(M,P){if(M.type==="throw")throw M.arg;return M.type==="break"||M.type==="continue"?this.next=M.arg:M.type==="return"?(this.rval=this.arg=M.arg,this.method="return",this.next="end"):M.type==="normal"&&P&&(this.next=P),A},finish:function(M){for(var P=this.tryEntries.length-1;P>=0;--P){var N=this.tryEntries[P];if(N.finallyLoc===M)return this.complete(N.completion,N.afterLoc),T(N),A}},catch:function(M){for(var P=this.tryEntries.length-1;P>=0;--P){var N=this.tryEntries[P];if(N.tryLoc===M){var W=N.completion;if(W.type==="throw"){var Q=W.arg;T(N)}return Q}}throw new Error("illegal catch attempt")},delegateYield:function(M,P,N){return this.delegate={iterator:Se(M),resultName:P,nextLoc:N},this.method==="next"&&(this.arg=r),A}},t}(typeof aI=="object"?aI.exports:{});try{regeneratorRuntime=nI}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=nI:Function("r","regeneratorRuntime = r")(nI)}});var eh=Oe((ZU,JC)=>{"use strict";JC.exports=(t,e)=>`${t}-${e}-${Math.random().toString(16).slice(3,8)}`});var rI=Oe((eB,eL)=>{"use strict";var FP=eh(),ZC=0;eL.exports=({id:t,action:e,payload:n={}})=>{let a=t;return typeof a>"u"&&(a=FP("Job",ZC),ZC+=1),{id:a,action:e,payload:n}}});var th=Oe(Zl=>{"use strict";var sI=!1;Zl.logging=sI;Zl.setLogging=t=>{sI=t};Zl.log=(...t)=>sI?console.log.apply(Zl,t):null});var rL=Oe((nL,aL)=>{"use strict";var UP=rI(),{log:nh}=th(),BP=eh(),tL=0;aL.exports=()=>{let t=BP("Scheduler",tL),e={},n={},a=[];tL+=1;let r=()=>a.length,s=()=>Object.keys(e).length,i=()=>{if(a.length!==0){let m=Object.keys(e);for(let p=0;p<m.length;p+=1)if(typeof n[m[p]]>"u"){a[0](e[m[p]]);break}}},u=(m,p)=>new Promise((S,R)=>{let D=UP({action:m,payload:p});a.push(async A=>{a.shift(),n[A.id]=D;try{S(await A[m].apply(nL,[...p,D.id]))}catch(E){R(E)}finally{delete n[A.id],i()}}),nh(`[${t}]: Add ${D.id} to JobQueue`),nh(`[${t}]: JobQueue length=${a.length}`),i()});return{addWorker:m=>(e[m.id]=m,nh(`[${t}]: Add ${m.id}`),nh(`[${t}]: Number of workers=${s()}`),i(),m.id),addJob:async(m,...p)=>{if(s()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return u(m,p)},terminate:async()=>{Object.keys(e).forEach(async m=>{await e[m].terminate()}),a=[]},getQueueLen:r,getNumWorkers:s}}});var iL=Oe((nB,sL)=>{"use strict";sL.exports=t=>{let e={};return typeof WorkerGlobalScope<"u"?e.type="webworker":typeof document=="object"?e.type="browser":typeof process=="object"&&typeof oE=="function"&&(e.type="node"),typeof t>"u"?e:e[t]}});var uL=Oe((rB,oL)=>{"use strict";var qP=iL()("type")==="browser",HP=qP?t=>new URL(t,window.location.href).href:t=>t;oL.exports=t=>{let e={...t};return["corePath","workerPath","langPath"].forEach(n=>{t[n]&&(e[n]=HP(e[n]))}),e}});var iI=Oe((sB,lL)=>{"use strict";lL.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}});var cL=Oe((iB,zP)=>{zP.exports={name:"tesseract.js",version:"7.0.0",description:"Pure Javascript Multilingual OCR",main:"src/index.js",type:"commonjs",types:"src/index.d.ts",unpkg:"dist/tesseract.min.js",jsdelivr:"dist/tesseract.min.js",scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs","profile:tesseract":"webpack-bundle-analyzer dist/tesseract-stats.json","profile:worker":"webpack-bundle-analyzer dist/worker-stats.json",prepublishOnly:"npm run build",wait:"rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser test:node:all","test:browser":"karma start karma.conf.js","test:node":"nyc mocha --exit --bail --require ./scripts/test-helper.mjs","test:node:all":"npm run test:node -- ./tests/*.test.mjs",lint:"eslint src","lint:fix":"eslint --fix src",postinstall:"opencollective-postinstall || true"},browser:{"./src/worker/node/index.js":"./src/worker/browser/index.js"},author:"",contributors:["jeromewu"],license:"Apache-2.0",devDependencies:{"@babel/core":"^7.21.4","@babel/eslint-parser":"^7.21.3","@babel/preset-env":"^7.21.4","@rollup/plugin-commonjs":"^24.1.0",acorn:"^8.8.2","babel-loader":"^9.1.2",buffer:"^6.0.3",cors:"^2.8.5",eslint:"^7.32.0","eslint-config-airbnb-base":"^14.2.1","eslint-plugin-import":"^2.27.5","expect.js":"^0.3.1",express:"^4.18.2",mocha:"^10.2.0","npm-run-all":"^4.1.5",karma:"^6.4.2","karma-chrome-launcher":"^3.2.0","karma-firefox-launcher":"^2.1.2","karma-mocha":"^2.0.1","karma-webpack":"^5.0.0",nyc:"^15.1.0",rimraf:"^5.0.0",rollup:"^3.20.7","wait-on":"^7.0.1",webpack:"^5.79.0","webpack-bundle-analyzer":"^4.8.0","webpack-cli":"^5.0.1","webpack-dev-middleware":"^6.0.2","rollup-plugin-sourcemaps":"^0.6.3"},dependencies:{"bmp-js":"^0.1.0","idb-keyval":"^6.2.0","is-url":"^1.2.4","node-fetch":"^2.6.9","opencollective-postinstall":"^2.0.3","regenerator-runtime":"^0.13.3","tesseract.js-core":"^7.0.0","wasm-feature-detect":"^1.8.0",zlibjs:"^0.3.1"},overrides:{"@rollup/pluginutils":"^5.0.2"},repository:{type:"git",url:"https://github.com/naptha/tesseract.js.git"},bugs:{url:"https://github.com/naptha/tesseract.js/issues"},homepage:"https://github.com/naptha/tesseract.js",collective:{type:"opencollective",url:"https://opencollective.com/tesseractjs"}}});var fL=Oe((oB,dL)=>{"use strict";dL.exports={workerBlobURL:!0,logger:()=>{}}});var pL=Oe((uB,hL)=>{"use strict";var GP=cL().version,jP=fL();hL.exports={...jP,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${GP}/dist/worker.min.js`}});var gL=Oe((lB,mL)=>{"use strict";mL.exports=({workerPath:t,workerBlobURL:e})=>{let n;if(Blob&&URL&&e){let a=new Blob([`importScripts("${t}");`],{type:"application/javascript"});n=new Worker(URL.createObjectURL(a))}else n=new Worker(t);return n}});var IL=Oe((cB,yL)=>{"use strict";yL.exports=t=>{t.terminate()}});var SL=Oe((dB,_L)=>{"use strict";_L.exports=(t,e)=>{t.onmessage=({data:n})=>{e(n)}}});var EL=Oe((fB,vL)=>{"use strict";vL.exports=async(t,e)=>{t.postMessage(e)}});var bL=Oe((hB,TL)=>{"use strict";var oI=t=>new Promise((e,n)=>{let a=new FileReader;a.onload=()=>{e(a.result)},a.onerror=({target:{error:{code:r}}})=>{n(Error(`File could not be read! Code=${r}`))},a.readAsArrayBuffer(t)}),uI=async t=>{let e=t;if(typeof t>"u")return"undefined";if(typeof t=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(t)?e=atob(t.split(",")[1]).split("").map(n=>n.charCodeAt(0)):e=await(await fetch(t)).arrayBuffer();else if(typeof HTMLElement<"u"&&t instanceof HTMLElement)t.tagName==="IMG"&&(e=await uI(t.src)),t.tagName==="VIDEO"&&(e=await uI(t.poster)),t.tagName==="CANVAS"&&await new Promise(n=>{t.toBlob(async a=>{e=await oI(a),n()})});else if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas){let n=await t.convertToBlob();e=await oI(n)}else(t instanceof File||t instanceof Blob)&&(e=await oI(t));return new Uint8Array(e)};TL.exports=uI});var CL=Oe((pB,wL)=>{"use strict";var KP=pL(),WP=gL(),YP=IL(),XP=SL(),QP=EL(),$P=bL();wL.exports={defaultOptions:KP,spawnWorker:WP,terminateWorker:YP,onMessage:XP,send:QP,loadImage:$P}});var lI=Oe((mB,RL)=>{"use strict";var JP=uL(),Wa=rI(),{log:LL}=th(),ZP=eh(),vi=iI(),{defaultOptions:eO,spawnWorker:tO,terminateWorker:nO,onMessage:aO,loadImage:AL,send:rO}=CL(),xL=0;RL.exports=async(t="eng",e=vi.LSTM_ONLY,n={},a={})=>{let r=ZP("Worker",xL),{logger:s,errorHandler:i,...u}=JP({...eO,...n}),l={},c=typeof t=="string"?t.split("+"):t,f=e,m=a,p=[vi.DEFAULT,vi.LSTM_ONLY].includes(e)&&!u.legacyCore,S,R,D=new Promise((M,P)=>{R=M,S=P}),A=M=>{S(M.message)},E=tO(u);E.onerror=A,xL+=1;let _=({id:M,action:P,payload:N})=>new Promise((W,Q)=>{LL(`[${r}]: Start ${M}, action=${P}`);let ae=`${P}-${M}`;l[ae]={resolve:W,reject:Q},rO(E,{workerId:r,jobId:M,action:P,payload:N})}),w=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),L=M=>_(Wa({id:M,action:"load",payload:{options:{lstmOnly:p,corePath:u.corePath,logging:u.logging}}})),q=(M,P,N)=>_(Wa({id:N,action:"FS",payload:{method:"writeFile",args:[M,P]}})),z=(M,P)=>_(Wa({id:P,action:"FS",payload:{method:"readFile",args:[M,{encoding:"utf8"}]}})),v=(M,P)=>_(Wa({id:P,action:"FS",payload:{method:"unlink",args:[M]}})),g=(M,P,N)=>_(Wa({id:N,action:"FS",payload:{method:M,args:P}})),I=(M,P)=>_(Wa({id:P,action:"loadLanguage",payload:{langs:M,options:{langPath:u.langPath,dataPath:u.dataPath,cachePath:u.cachePath,cacheMethod:u.cacheMethod,gzip:u.gzip,lstmOnly:[vi.DEFAULT,vi.LSTM_ONLY].includes(f)&&!u.legacyLang}}})),b=(M,P,N,W)=>_(Wa({id:W,action:"initialize",payload:{langs:M,oem:P,config:N}})),C=(M="eng",P,N,W)=>{if(p&&[vi.TESSERACT_ONLY,vi.TESSERACT_LSTM_COMBINED].includes(P))throw Error("Legacy model requested but code missing.");let Q=P||f;f=Q;let ae=N||m;m=ae;let Fe=(typeof M=="string"?M.split("+"):M).filter(Qe=>!c.includes(Qe));return c.push(...Fe),Fe.length>0?I(Fe,W).then(()=>b(M,Q,ae,W)):b(M,Q,ae,W)},x=(M={},P)=>_(Wa({id:P,action:"setParameters",payload:{params:M}})),T=async(M,P={},N={text:!0},W)=>_(Wa({id:W,action:"recognize",payload:{image:await AL(M),options:P,output:N}})),de=async(M,P)=>{if(p)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return _(Wa({id:P,action:"detect",payload:{image:await AL(M)}}))},Se=async()=>(E!==null&&(nO(E),E=null),Promise.resolve());aO(E,({workerId:M,jobId:P,status:N,action:W,data:Q})=>{let ae=`${W}-${P}`;if(N==="resolve")LL(`[${M}]: Complete ${P}`),l[ae].resolve({jobId:P,data:Q}),delete l[ae];else if(N==="reject")if(l[ae].reject(Q),delete l[ae],W==="load"&&S(Q),i)i(Q);else throw Error(Q);else N==="progress"&&s({...Q,userJobId:P})});let lt={id:r,worker:E,load:w,writeText:q,readText:z,removeFile:v,FS:g,reinitialize:C,setParameters:x,recognize:T,detect:de,terminate:Se};return L().then(()=>I(t)).then(()=>b(t,e,a)).then(()=>R(lt)).catch(()=>{}),D}});var PL=Oe((gB,DL)=>{"use strict";var kL=lI(),sO=async(t,e,n)=>{let a=await kL(e,1,n);return a.recognize(t).finally(async()=>{await a.terminate()})},iO=async(t,e)=>{let n=await kL("osd",0,e);return n.detect(t).finally(async()=>{await n.terminate()})};DL.exports={recognize:sO,detect:iO}});var ML=Oe((yB,OL)=>{"use strict";OL.exports={AFR:"afr",AMH:"amh",ARA:"ara",ASM:"asm",AZE:"aze",AZE_CYRL:"aze_cyrl",BEL:"bel",BEN:"ben",BOD:"bod",BOS:"bos",BUL:"bul",CAT:"cat",CEB:"ceb",CES:"ces",CHI_SIM:"chi_sim",CHI_TRA:"chi_tra",CHR:"chr",CYM:"cym",DAN:"dan",DEU:"deu",DZO:"dzo",ELL:"ell",ENG:"eng",ENM:"enm",EPO:"epo",EST:"est",EUS:"eus",FAS:"fas",FIN:"fin",FRA:"fra",FRK:"frk",FRM:"frm",GLE:"gle",GLG:"glg",GRC:"grc",GUJ:"guj",HAT:"hat",HEB:"heb",HIN:"hin",HRV:"hrv",HUN:"hun",IKU:"iku",IND:"ind",ISL:"isl",ITA:"ita",ITA_OLD:"ita_old",JAV:"jav",JPN:"jpn",KAN:"kan",KAT:"kat",KAT_OLD:"kat_old",KAZ:"kaz",KHM:"khm",KIR:"kir",KOR:"kor",KUR:"kur",LAO:"lao",LAT:"lat",LAV:"lav",LIT:"lit",MAL:"mal",MAR:"mar",MKD:"mkd",MLT:"mlt",MSA:"msa",MYA:"mya",NEP:"nep",NLD:"nld",NOR:"nor",ORI:"ori",PAN:"pan",POL:"pol",POR:"por",PUS:"pus",RON:"ron",RUS:"rus",SAN:"san",SIN:"sin",SLK:"slk",SLV:"slv",SPA:"spa",SPA_OLD:"spa_old",SQI:"sqi",SRP:"srp",SRP_LATN:"srp_latn",SWA:"swa",SWE:"swe",SYR:"syr",TAM:"tam",TEL:"tel",TGK:"tgk",TGL:"tgl",THA:"tha",TIR:"tir",TUR:"tur",UIG:"uig",UKR:"ukr",URD:"urd",UZB:"uzb",UZB_CYRL:"uzb_cyrl",VIE:"vie",YID:"yid"}});var VL=Oe((IB,NL)=>{"use strict";NL.exports={OSD_ONLY:"0",AUTO_OSD:"1",AUTO_ONLY:"2",AUTO:"3",SINGLE_COLUMN:"4",SINGLE_BLOCK_VERT_TEXT:"5",SINGLE_BLOCK:"6",SINGLE_LINE:"7",SINGLE_WORD:"8",CIRCLE_WORD:"9",SINGLE_CHAR:"10",SPARSE_TEXT:"11",SPARSE_TEXT_OSD:"12",RAW_LINE:"13"}});var UL=Oe((_B,FL)=>{"use strict";$C();var oO=rL(),uO=lI(),lO=PL(),cO=ML(),dO=iI(),fO=VL(),{setLogging:hO}=th();FL.exports={languages:cO,OEM:dO,PSM:fO,createScheduler:oO,createWorker:uO,setLogging:hO,...lO}});var WR=Oe(Kp=>{"use strict";var oU=Symbol.for("react.transitional.element"),uU=Symbol.for("react.fragment");function KR(t,e,n){var a=null;if(n!==void 0&&(a=""+n),e.key!==void 0&&(a=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:oU,type:t,key:a,ref:e!==void 0?e:null,props:n}}Kp.Fragment=uU;Kp.jsx=KR;Kp.jsxs=KR});var vt=Oe((M3,YR)=>{"use strict";YR.exports=WR()});var nk={};zk(nk,{captureScreenshot:()=>dU});var dU,ak=Hk(()=>{dU=async()=>null});var pe=Le(Yn()),Ck=Le(QC());var Jy="http://localhost:3000";console.log("[EXTENSION] Using API_BASE:",Jy);function NP(t){return typeof t=="string"?t.startsWith("http")?t:Jy+t:t instanceof URL?t.href:t.url}function VP(t,e={}){let n=NP(t),a=e.method||"GET",r=e.headers instanceof Headers||Array.isArray(e.headers)?Object.fromEntries(e.headers):{...e.headers},s=e.body??null;return new Promise((i,u)=>{chrome.runtime.sendMessage({type:"echly-api",url:n,method:a,headers:r,body:s},l=>{if(chrome.runtime.lastError){u(new Error(chrome.runtime.lastError.message));return}if(!l){u(new Error("No response from background"));return}let c=new Response(l.body??"",{status:l.status??0,headers:l.headers?new Headers(l.headers):void 0});i(c)})})}async function mt(t,e={}){let n=t.startsWith("http")?t:Jy+t;return VP(n,e)}function Zy(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function eI(){return Zy()}function tI(t,e,n){return new Promise((a,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,screenshotId:n},s=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(s?.error){r(new Error(s.error));return}if(s?.url){a(s.url);return}r(new Error("No URL from background"))})})}async function cI(t){if(!t||typeof t!="string")return"";try{let n=await(await Promise.resolve().then(()=>Le(UL()))).createWorker("eng",void 0,{logger:()=>{}}),{data:{text:a}}=await n.recognize(t);return await n.terminate(),!a||typeof a!="string"?"":a.replace(/\s+/g," ").trim().slice(0,2e3)}catch{return""}}var ia=Le(Yn());var BL=()=>{};var zL=function(t){let e=[],n=0;for(let a=0;a<t.length;a++){let r=t.charCodeAt(a);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&a+1<t.length&&(t.charCodeAt(a+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++a)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},pO=function(t){let e=[],n=0,a=0;for(;n<t.length;){let r=t[n++];if(r<128)e[a++]=String.fromCharCode(r);else if(r>191&&r<224){let s=t[n++];e[a++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){let s=t[n++],i=t[n++],u=t[n++],l=((r&7)<<18|(s&63)<<12|(i&63)<<6|u&63)-65536;e[a++]=String.fromCharCode(55296+(l>>10)),e[a++]=String.fromCharCode(56320+(l&1023))}else{let s=t[n++],i=t[n++];e[a++]=String.fromCharCode((r&15)<<12|(s&63)<<6|i&63)}}return e.join("")},GL={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let r=0;r<t.length;r+=3){let s=t[r],i=r+1<t.length,u=i?t[r+1]:0,l=r+2<t.length,c=l?t[r+2]:0,f=s>>2,m=(s&3)<<4|u>>4,p=(u&15)<<2|c>>6,S=c&63;l||(S=64,i||(p=64)),a.push(n[f],n[m],n[p],n[S])}return a.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(zL(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):pO(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let n=e?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let r=0;r<t.length;){let s=n[t.charAt(r++)],u=r<t.length?n[t.charAt(r)]:0;++r;let c=r<t.length?n[t.charAt(r)]:64;++r;let m=r<t.length?n[t.charAt(r)]:64;if(++r,s==null||u==null||c==null||m==null)throw new fI;let p=s<<2|u>>4;if(a.push(p),c!==64){let S=u<<4&240|c>>2;if(a.push(S),m!==64){let R=c<<6&192|m;a.push(R)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},fI=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},mO=function(t){let e=zL(t);return GL.encodeByteArray(e,!0)},tc=function(t){return mO(t).replace(/\./g,"")},rh=function(t){try{return GL.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function jL(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var gO=()=>jL().__FIREBASE_DEFAULTS__,yO=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},IO=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&rh(t[1]);return e&&JSON.parse(e)},sh=()=>{try{return BL()||gO()||yO()||IO()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},pI=t=>sh()?.emulatorHosts?.[t],ih=t=>{let e=pI(t);if(!e)return;let n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let a=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),a]:[e.substring(0,n),a]},mI=()=>sh()?.config,gI=t=>sh()?.[`_${t}`];var ah=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,a)=>{n?this.reject(n):this.resolve(a),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,a))}}};function Ya(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Ko(t){return(await fetch(t,{credentials:"include"})).ok}function oh(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let n={alg:"none",type:"JWT"},a=e||"demo-project",r=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let i={iss:`https://securetoken.google.com/${a}`,aud:a,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[tc(JSON.stringify(n)),tc(JSON.stringify(i)),""].join(".")}var ec={};function _O(){let t={prod:[],emulator:[]};for(let e of Object.keys(ec))ec[e]?t.emulator.push(e):t.prod.push(e);return t}function SO(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}var qL=!1;function Wo(t,e){if(typeof window>"u"||typeof document>"u"||!Ya(window.location.host)||ec[t]===e||ec[t]||qL)return;ec[t]=e;function n(p){return`__firebase__banner__${p}`}let a="__firebase__banner",s=_O().prod.length>0;function i(){let p=document.getElementById(a);p&&p.remove()}function u(p){p.style.display="flex",p.style.background="#7faaf0",p.style.position="fixed",p.style.bottom="5px",p.style.left="5px",p.style.padding=".5em",p.style.borderRadius="5px",p.style.alignItems="center"}function l(p,S){p.setAttribute("width","24"),p.setAttribute("id",S),p.setAttribute("height","24"),p.setAttribute("viewBox","0 0 24 24"),p.setAttribute("fill","none"),p.style.marginLeft="-6px"}function c(){let p=document.createElement("span");return p.style.cursor="pointer",p.style.marginLeft="16px",p.style.fontSize="24px",p.innerHTML=" &times;",p.onclick=()=>{qL=!0,i()},p}function f(p,S){p.setAttribute("id",S),p.innerText="Learn more",p.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",p.setAttribute("target","__blank"),p.style.paddingLeft="5px",p.style.textDecoration="underline"}function m(){let p=SO(a),S=n("text"),R=document.getElementById(S)||document.createElement("span"),D=n("learnmore"),A=document.getElementById(D)||document.createElement("a"),E=n("preprendIcon"),_=document.getElementById(E)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(p.created){let w=p.element;u(w),f(A,D);let L=c();l(_,E),w.append(_,R,A,L),document.body.appendChild(w)}s?(R.innerText="Preview backend disconnected.",_.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(_.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,R.innerText="Preview backend running in this workspace."),R.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}function an(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function KL(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(an())}function vO(){let t=sh()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function WL(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function YL(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function XL(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function QL(){let t=an();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function $L(){return!vO()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function yI(){try{return typeof indexedDB=="object"}catch{return!1}}function JL(){return new Promise((t,e)=>{try{let n=!0,a="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(a);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(a),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(n){e(n)}})}var EO="FirebaseError",Pn=class t extends Error{constructor(e,n,a){super(n),this.code=e,this.customData=a,this.name=EO,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Or.prototype.create)}},Or=class{constructor(e,n,a){this.service=e,this.serviceName=n,this.errors=a}create(e,...n){let a=n[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?TO(s,a):"Error",u=`${this.serviceName}: ${i} (${r}).`;return new Pn(r,u,a)}};function TO(t,e){return t.replace(bO,(n,a)=>{let r=e[a];return r!=null?String(r):`<${a}?>`})}var bO=/\{\$([^}]+)}/g;function ZL(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function xa(t,e){if(t===e)return!0;let n=Object.keys(t),a=Object.keys(e);for(let r of n){if(!a.includes(r))return!1;let s=t[r],i=e[r];if(HL(s)&&HL(i)){if(!xa(s,i))return!1}else if(s!==i)return!1}for(let r of a)if(!n.includes(r))return!1;return!0}function HL(t){return t!==null&&typeof t=="object"}function Yo(t){let e=[];for(let[n,a]of Object.entries(t))Array.isArray(a)?a.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(a));return e.length?"&"+e.join("&"):""}function Xo(t){let e={};return t.replace(/^\?/,"").split("&").forEach(a=>{if(a){let[r,s]=a.split("=");e[decodeURIComponent(r)]=decodeURIComponent(s)}}),e}function Qo(t){let e=t.indexOf("?");if(!e)return"";let n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function eA(t,e){let n=new hI(t,e);return n.subscribe.bind(n)}var hI=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(a=>{this.error(a)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,a){let r;if(e===void 0&&n===void 0&&a===void 0)throw new Error("Missing Observer.");wO(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:a},r.next===void 0&&(r.next=dI),r.error===void 0&&(r.error=dI),r.complete===void 0&&(r.complete=dI);let s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function wO(t,e){if(typeof t!="object"||t===null)return!1;for(let n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function dI(){}var TB=4*60*60*1e3;function rn(t){return t&&t._delegate?t._delegate:t}var qn=class{constructor(e,n,a){this.name=e,this.instanceFactory=n,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var Ei="[DEFAULT]";var II=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){let a=new ah;if(this.instancesDeferred.set(n,a),this.isInitialized(n)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:n});r&&a.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){let n=this.normalizeInstanceIdentifier(e?.identifier),a=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(a)return null;throw r}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(LO(e))try{this.getOrInitializeService({instanceIdentifier:Ei})}catch{}for(let[n,a]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(n);try{let s=this.getOrInitializeService({instanceIdentifier:r});a.resolve(s)}catch{}}}}clearInstance(e=Ei){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Ei){return this.instances.has(e)}getOptions(e=Ei){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:n={}}=e,a=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:a,options:n});for(let[s,i]of this.instancesDeferred.entries()){let u=this.normalizeInstanceIdentifier(s);a===u&&i.resolve(r)}return r}onInit(e,n){let a=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(a)??new Set;r.add(e),this.onInitCallbacks.set(a,r);let s=this.instances.get(a);return s&&e(s,a),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){let a=this.onInitCallbacks.get(n);if(a)for(let r of a)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let a=this.instances.get(e);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:CO(e),options:n}),this.instances.set(e,a),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(a,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,a)}catch{}return a||null}normalizeInstanceIdentifier(e=Ei){return this.component?this.component.multipleInstances?e:Ei:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function CO(t){return t===Ei?void 0:t}function LO(t){return t.instantiationMode==="EAGER"}var uh=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let n=new II(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};var AO=[],Ee;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Ee||(Ee={}));var xO={debug:Ee.DEBUG,verbose:Ee.VERBOSE,info:Ee.INFO,warn:Ee.WARN,error:Ee.ERROR,silent:Ee.SILENT},RO=Ee.INFO,kO={[Ee.DEBUG]:"log",[Ee.VERBOSE]:"log",[Ee.INFO]:"info",[Ee.WARN]:"warn",[Ee.ERROR]:"error"},DO=(t,e,...n)=>{if(e<t.logLevel)return;let a=new Date().toISOString(),r=kO[e];if(r)console[r](`[${a}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},Hs=class{constructor(e){this.name=e,this._logLevel=RO,this._logHandler=DO,this._userLogHandler=null,AO.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Ee))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?xO[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Ee.DEBUG,...e),this._logHandler(this,Ee.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Ee.VERBOSE,...e),this._logHandler(this,Ee.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Ee.INFO,...e),this._logHandler(this,Ee.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Ee.WARN,...e),this._logHandler(this,Ee.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Ee.ERROR,...e),this._logHandler(this,Ee.ERROR,...e)}};var PO=(t,e)=>e.some(n=>t instanceof n),tA,nA;function OO(){return tA||(tA=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function MO(){return nA||(nA=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var aA=new WeakMap,SI=new WeakMap,rA=new WeakMap,_I=new WeakMap,EI=new WeakMap;function NO(t){let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{n(Xa(t.result)),r()},i=()=>{a(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(n=>{n instanceof IDBCursor&&aA.set(n,t)}).catch(()=>{}),EI.set(e,t),e}function VO(t){if(SI.has(t))return;let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{n(),r()},i=()=>{a(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});SI.set(t,e)}var vI={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return SI.get(t);if(e==="objectStoreNames")return t.objectStoreNames||rA.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Xa(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function sA(t){vI=t(vI)}function FO(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let a=t.call(lh(this),e,...n);return rA.set(a,e.sort?e.sort():[e]),Xa(a)}:MO().includes(t)?function(...e){return t.apply(lh(this),e),Xa(aA.get(this))}:function(...e){return Xa(t.apply(lh(this),e))}}function UO(t){return typeof t=="function"?FO(t):(t instanceof IDBTransaction&&VO(t),PO(t,OO())?new Proxy(t,vI):t)}function Xa(t){if(t instanceof IDBRequest)return NO(t);if(_I.has(t))return _I.get(t);let e=UO(t);return e!==t&&(_I.set(t,e),EI.set(e,t)),e}var lh=t=>EI.get(t);function oA(t,e,{blocked:n,upgrade:a,blocking:r,terminated:s}={}){let i=indexedDB.open(t,e),u=Xa(i);return a&&i.addEventListener("upgradeneeded",l=>{a(Xa(i.result),l.oldVersion,l.newVersion,Xa(i.transaction),l)}),n&&i.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),u.then(l=>{s&&l.addEventListener("close",()=>s()),r&&l.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),u}var BO=["get","getKey","getAll","getAllKeys","count"],qO=["put","add","delete","clear"],TI=new Map;function iA(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(TI.get(e))return TI.get(e);let n=e.replace(/FromIndex$/,""),a=e!==n,r=qO.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(r||BO.includes(n)))return;let s=async function(i,...u){let l=this.transaction(i,r?"readwrite":"readonly"),c=l.store;return a&&(c=c.index(u.shift())),(await Promise.all([c[n](...u),r&&l.done]))[0]};return TI.set(e,s),s}sA(t=>({...t,get:(e,n,a)=>iA(e,n)||t.get(e,n,a),has:(e,n)=>!!iA(e,n)||t.has(e,n)}));var wI=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(HO(n)){let a=n.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(n=>n).join(" ")}};function HO(t){return t.getComponent()?.type==="VERSION"}var CI="@firebase/app",uA="0.14.9";var Mr=new Hs("@firebase/app"),zO="@firebase/app-compat",GO="@firebase/analytics-compat",jO="@firebase/analytics",KO="@firebase/app-check-compat",WO="@firebase/app-check",YO="@firebase/auth",XO="@firebase/auth-compat",QO="@firebase/database",$O="@firebase/data-connect",JO="@firebase/database-compat",ZO="@firebase/functions",eM="@firebase/functions-compat",tM="@firebase/installations",nM="@firebase/installations-compat",aM="@firebase/messaging",rM="@firebase/messaging-compat",sM="@firebase/performance",iM="@firebase/performance-compat",oM="@firebase/remote-config",uM="@firebase/remote-config-compat",lM="@firebase/storage",cM="@firebase/storage-compat",dM="@firebase/firestore",fM="@firebase/ai",hM="@firebase/firestore-compat",pM="firebase",mM="12.10.0";var LI="[DEFAULT]",gM={[CI]:"fire-core",[zO]:"fire-core-compat",[jO]:"fire-analytics",[GO]:"fire-analytics-compat",[WO]:"fire-app-check",[KO]:"fire-app-check-compat",[YO]:"fire-auth",[XO]:"fire-auth-compat",[QO]:"fire-rtdb",[$O]:"fire-data-connect",[JO]:"fire-rtdb-compat",[ZO]:"fire-fn",[eM]:"fire-fn-compat",[tM]:"fire-iid",[nM]:"fire-iid-compat",[aM]:"fire-fcm",[rM]:"fire-fcm-compat",[sM]:"fire-perf",[iM]:"fire-perf-compat",[oM]:"fire-rc",[uM]:"fire-rc-compat",[lM]:"fire-gcs",[cM]:"fire-gcs-compat",[dM]:"fire-fst",[hM]:"fire-fst-compat",[fM]:"fire-vertex","fire-js":"fire-js",[pM]:"fire-js-all"};var ch=new Map,yM=new Map,AI=new Map;function lA(t,e){try{t.container.addComponent(e)}catch(n){Mr.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Qa(t){let e=t.name;if(AI.has(e))return Mr.debug(`There were multiple attempts to register component ${e}.`),!1;AI.set(e,t);for(let n of ch.values())lA(n,t);for(let n of yM.values())lA(n,t);return!0}function Ti(t,e){let n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function zn(t){return t==null?!1:t.settings!==void 0}var IM={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},zs=new Or("app","Firebase",IM);var xI=class{constructor(e,n,a){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new qn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw zs.create("app-deleted",{appName:this._name})}};var $a=mM;function DI(t,e={}){let n=t;typeof e!="object"&&(e={name:e});let a={name:LI,automaticDataCollectionEnabled:!0,...e},r=a.name;if(typeof r!="string"||!r)throw zs.create("bad-app-name",{appName:String(r)});if(n||(n=mI()),!n)throw zs.create("no-options");let s=ch.get(r);if(s){if(xa(n,s.options)&&xa(a,s.config))return s;throw zs.create("duplicate-app",{appName:r})}let i=new uh(r);for(let l of AI.values())i.addComponent(l);let u=new xI(n,a,i);return ch.set(r,u),u}function $o(t=LI){let e=ch.get(t);if(!e&&t===LI&&mI())return DI();if(!e)throw zs.create("no-app",{appName:t});return e}function Hn(t,e,n){let a=gM[t]??t;n&&(a+=`-${n}`);let r=a.match(/\s|\//),s=e.match(/\s|\//);if(r||s){let i=[`Unable to register library "${a}" with version "${e}":`];r&&i.push(`library name "${a}" contains illegal characters (whitespace or "/")`),r&&s&&i.push("and"),s&&i.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Mr.warn(i.join(" "));return}Qa(new qn(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}var _M="firebase-heartbeat-database",SM=1,nc="firebase-heartbeat-store",bI=null;function hA(){return bI||(bI=oA(_M,SM,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(nc)}catch(n){console.warn(n)}}}}).catch(t=>{throw zs.create("idb-open",{originalErrorMessage:t.message})})),bI}async function vM(t){try{let n=(await hA()).transaction(nc),a=await n.objectStore(nc).get(pA(t));return await n.done,a}catch(e){if(e instanceof Pn)Mr.warn(e.message);else{let n=zs.create("idb-get",{originalErrorMessage:e?.message});Mr.warn(n.message)}}}async function cA(t,e){try{let a=(await hA()).transaction(nc,"readwrite");await a.objectStore(nc).put(e,pA(t)),await a.done}catch(n){if(n instanceof Pn)Mr.warn(n.message);else{let a=zs.create("idb-set",{originalErrorMessage:n?.message});Mr.warn(a.message)}}}function pA(t){return`${t.name}!${t.options.appId}`}var EM=1024,TM=30,RI=class{constructor(e){this.container=e,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new kI(n),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=dA();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(r=>r.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:n}),this._heartbeatsCache.heartbeats.length>TM){let r=wM(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Mr.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=dA(),{heartbeatsToSend:n,unsentEntries:a}=bM(this._heartbeatsCache.heartbeats),r=tc(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return Mr.warn(e),""}}};function dA(){return new Date().toISOString().substring(0,10)}function bM(t,e=EM){let n=[],a=t.slice();for(let r of t){let s=n.find(i=>i.agent===r.agent);if(s){if(s.dates.push(r.date),fA(n)>e){s.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),fA(n)>e){n.pop();break}a=a.slice(1)}return{heartbeatsToSend:n,unsentEntries:a}}var kI=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return yI()?JL().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await vM(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return cA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return cA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}};function fA(t){return tc(JSON.stringify({version:2,heartbeats:t})).length}function wM(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let a=1;a<t.length;a++)t[a].date<n&&(n=t[a].date,e=a);return e}function CM(t){Qa(new qn("platform-logger",e=>new wI(e),"PRIVATE")),Qa(new qn("heartbeat",e=>new RI(e),"PRIVATE")),Hn(CI,uA,t),Hn(CI,uA,"esm2020"),Hn("fire-js","")}CM("");var LM="firebase",AM="12.10.0";Hn(LM,AM,"app");function PA(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var OA=PA,MA=new Or("auth","Firebase",PA());var yh=new Hs("@firebase/auth");function xM(t,...e){yh.logLevel<=Ee.WARN&&yh.warn(`Auth (${$a}): ${t}`,...e)}function fh(t,...e){yh.logLevel<=Ee.ERROR&&yh.error(`Auth (${$a}): ${t}`,...e)}function Ra(t,...e){throw a_(t,...e)}function Za(t,...e){return a_(t,...e)}function NA(t,e,n){let a={...OA(),[e]:n};return new Or("auth","Firebase",a).create(e,{appName:t.name})}function bi(t){return NA(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function a_(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return MA.create(t,...e)}function te(t,e,...n){if(!t)throw a_(e,...n)}function Ja(t){let e="INTERNAL ASSERTION FAILED: "+t;throw fh(e),new Error(e)}function Vr(t,e){t||Ja(e)}function FI(){return typeof self<"u"&&self.location?.href||""}function RM(){return mA()==="http:"||mA()==="https:"}function mA(){return typeof self<"u"&&self.location?.protocol||null}function kM(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(RM()||YL()||"connection"in navigator)?navigator.onLine:!0}function DM(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var wi=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,Vr(n>e,"Short delay should be less than long delay!"),this.isMobile=KL()||XL()}get(){return kM()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function r_(t,e){Vr(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var Ih=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Ja("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Ja("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Ja("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var PM={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var OM=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],MM=new wi(3e4,6e4);function sn(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function bn(t,e,n,a,r={}){return VA(t,r,async()=>{let s={},i={};a&&(e==="GET"?i=a:s={body:JSON.stringify(a)});let u=Yo({key:t.config.apiKey,...i}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:l,...s};return WL()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Ya(t.emulatorConfig.host)&&(c.credentials="include"),Ih.fetch()(await FA(t,t.config.apiHost,n,u),c)})}async function VA(t,e,n){t._canInitEmulator=!1;let a={...PM,...e};try{let r=new UI(t),s=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let i=await s.json();if("needConfirmation"in i)throw rc(t,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{let u=s.ok?i.errorMessage:i.error.message,[l,c]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw rc(t,"credential-already-in-use",i);if(l==="EMAIL_EXISTS")throw rc(t,"email-already-in-use",i);if(l==="USER_DISABLED")throw rc(t,"user-disabled",i);let f=a[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw NA(t,f,c);Ra(t,f)}}catch(r){if(r instanceof Pn)throw r;Ra(t,"network-request-failed",{message:String(r)})}}async function Ri(t,e,n,a,r={}){let s=await bn(t,e,n,a,r);return"mfaPendingCredential"in s&&Ra(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function FA(t,e,n,a){let r=`${e}${n}?${a}`,s=t,i=s.config.emulator?r_(t.config,r):`${t.config.apiScheme}://${r}`;return OM.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(i).toString():i}function NM(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var UI=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(Za(this.auth,"network-request-failed")),MM.get())})}};function rc(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=Za(t,e,a);return r.customData._tokenResponse=n,r}function gA(t){return t!==void 0&&t.enterprise!==void 0}var _h=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return NM(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function UA(t,e){return bn(t,"GET","/v2/recaptchaConfig",sn(t,e))}async function VM(t,e){return bn(t,"POST","/v1/accounts:delete",e)}async function Sh(t,e){return bn(t,"POST","/v1/accounts:lookup",e)}function sc(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function BA(t,e=!1){let n=rn(t),a=await n.getIdToken(e),r=s_(a);te(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let s=typeof r.firebase=="object"?r.firebase:void 0,i=s?.sign_in_provider;return{claims:r,token:a,authTime:sc(PI(r.auth_time)),issuedAtTime:sc(PI(r.iat)),expirationTime:sc(PI(r.exp)),signInProvider:i||null,signInSecondFactor:s?.sign_in_second_factor||null}}function PI(t){return Number(t)*1e3}function s_(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return fh("JWT malformed, contained fewer than 3 sections"),null;try{let r=rh(n);return r?JSON.parse(r):(fh("Failed to decode base64 JWT payload"),null)}catch(r){return fh("Caught error parsing JWT payload as JSON",r?.toString()),null}}function yA(t){let e=s_(t);return te(e,"internal-error"),te(typeof e.exp<"u","internal-error"),te(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function lc(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof Pn&&FM(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function FM({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var BI=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var cc=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=sc(this.lastLoginAt),this.creationTime=sc(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function vh(t){let e=t.auth,n=await t.getIdToken(),a=await lc(t,Sh(e,{idToken:n}));te(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let s=r.providerUserInfo?.length?HA(r.providerUserInfo):[],i=UM(t.providerData,s),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!i?.length,c=u?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new cc(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function qA(t){let e=rn(t);await vh(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function UM(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function HA(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function BM(t,e){let n=await VA(t,{},async()=>{let a=Yo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,i=await FA(t,r,"/v1/token",`key=${s}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:a};return t.emulatorConfig&&Ya(t.emulatorConfig.host)&&(l.credentials="include"),Ih.fetch()(i,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function qM(t,e){return bn(t,"POST","/v2/accounts:revokeToken",sn(t,e))}var ic=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){te(e.idToken,"internal-error"),te(typeof e.idToken<"u","internal-error"),te(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):yA(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){te(e.length!==0,"internal-error");let n=yA(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(te(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:s}=await BM(e,n);this.updateTokensAndExpiration(a,r,Number(s))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:s}=n,i=new t;return a&&(te(typeof a=="string","internal-error",{appName:e}),i.refreshToken=a),r&&(te(typeof r=="string","internal-error",{appName:e}),i.accessToken=r),s&&(te(typeof s=="number","internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return Ja("not implemented")}};function Gs(t,e){te(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var js=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new BI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new cc(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await lc(this,this.stsTokenManager.getToken(this.auth,e));return te(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return BA(this,e)}reload(){return qA(this)}_assign(e){this!==e&&(te(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){te(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await vh(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(zn(this.auth.app))return Promise.reject(bi(this.auth));let e=await this.getIdToken();return await lc(this,VM(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,s=n.phoneNumber??void 0,i=n.photoURL??void 0,u=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:m,emailVerified:p,isAnonymous:S,providerData:R,stsTokenManager:D}=n;te(m&&D,e,"internal-error");let A=ic.fromJSON(this.name,D);te(typeof m=="string",e,"internal-error"),Gs(a,e.name),Gs(r,e.name),te(typeof p=="boolean",e,"internal-error"),te(typeof S=="boolean",e,"internal-error"),Gs(s,e.name),Gs(i,e.name),Gs(u,e.name),Gs(l,e.name),Gs(c,e.name),Gs(f,e.name);let E=new t({uid:m,auth:e,email:r,emailVerified:p,displayName:a,isAnonymous:S,photoURL:i,phoneNumber:s,tenantId:u,stsTokenManager:A,createdAt:c,lastLoginAt:f});return R&&Array.isArray(R)&&(E.providerData=R.map(_=>({..._}))),l&&(E._redirectEventId=l),E}static async _fromIdTokenResponse(e,n,a=!1){let r=new ic;r.updateFromServerResponse(n);let s=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await vh(s),s}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];te(r.localId!==void 0,"internal-error");let s=r.providerUserInfo!==void 0?HA(r.providerUserInfo):[],i=!(r.email&&r.passwordHash)&&!s?.length,u=new ic;u.updateFromIdToken(a);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:i}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new cc(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!s?.length};return Object.assign(l,c),l}};var IA=new Map;function Nr(t){Vr(t instanceof Function,"Expected a class definition");let e=IA.get(t);return e?(Vr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,IA.set(t,e),e)}var Eh=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};Eh.type="NONE";var qI=Eh;function hh(t,e,n){return`firebase:${t}:${e}:${n}`}var Th=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:s}=this.auth;this.fullUserKey=hh(this.userKey,r.apiKey,s),this.fullPersistenceKey=hh("persistence",r.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await Sh(this.auth,{idToken:e}).catch(()=>{});return n?js._fromGetAccountInfoResponse(this.auth,n,e):null}return js._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(Nr(qI),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),s=r[0]||Nr(qI),i=hh(a,e.config.apiKey,e.name),u=null;for(let c of n)try{let f=await c._get(i);if(f){let m;if(typeof f=="string"){let p=await Sh(e,{idToken:f}).catch(()=>{});if(!p)break;m=await js._fromGetAccountInfoResponse(e,p,f)}else m=js._fromJSON(e,f);c!==s&&(u=m),s=c;break}}catch{}let l=r.filter(c=>c._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new t(s,e,a):(s=l[0],u&&await s._set(i,u.toJSON()),await Promise.all(n.map(async c=>{if(c!==s)try{await c._remove(i)}catch{}})),new t(s,e,a))}};function _A(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(KA(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(zA(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(YA(e))return"Blackberry";if(XA(e))return"Webos";if(GA(e))return"Safari";if((e.includes("chrome/")||jA(e))&&!e.includes("edge/"))return"Chrome";if(WA(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function zA(t=an()){return/firefox\//i.test(t)}function GA(t=an()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function jA(t=an()){return/crios\//i.test(t)}function KA(t=an()){return/iemobile/i.test(t)}function WA(t=an()){return/android/i.test(t)}function YA(t=an()){return/blackberry/i.test(t)}function XA(t=an()){return/webos/i.test(t)}function i_(t=an()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function HM(t=an()){return i_(t)&&!!window.navigator?.standalone}function zM(){return QL()&&document.documentMode===10}function QA(t=an()){return i_(t)||WA(t)||XA(t)||YA(t)||/windows phone/i.test(t)||KA(t)}function $A(t,e=[]){let n;switch(t){case"Browser":n=_A(an());break;case"Worker":n=`${_A(an())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${$a}/${a}`}var HI=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=s=>new Promise((i,u)=>{try{let l=e(s);i(l)}catch(l){u(l)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function GM(t,e={}){return bn(t,"GET","/v2/passwordPolicy",sn(t,e))}var jM=6,zI=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??jM,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};var GI=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new bh(this),this.idTokenSubscription=new bh(this),this.beforeStateQueue=new HI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=MA,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Nr(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Th.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await Sh(this,{idToken:e}),a=await js._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(zn(this.app)){let s=this.app.settings.authIdToken;return s?new Promise(i=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(s).then(i,i))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let s=this.redirectUser?._redirectEventId,i=a?._redirectEventId,u=await this.tryRedirectSignIn(e);(!s||s===i)&&u?.user&&(a=u.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(s){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(s))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return te(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await vh(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=DM()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(zn(this.app))return Promise.reject(bi(this));let n=e?rn(e):null;return n&&te(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&te(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return zn(this.app)?Promise.reject(bi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return zn(this.app)?Promise.reject(bi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Nr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await GM(this),n=new zI(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Or("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await qM(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&Nr(e)||this._popupRedirectResolver;te(n,this,"argument-error"),this.redirectPersistenceManager=await Th.create(this,[Nr(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let s=typeof n=="function"?n:n.next.bind(n),i=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(te(u,this,"internal-error"),u.then(()=>{i||s(this.currentUser)}),typeof n=="function"){let l=e.addObserver(n,a,r);return()=>{i=!0,l()}}else{let l=e.addObserver(n);return()=>{i=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return te(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=$A(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(zn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&xM(`Error while retrieving App Check token: ${e.error}`),e?.token}};function eu(t){return rn(t)}var bh=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=eA(n=>this.observer=n)}get next(){return te(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var Hh={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function KM(t){Hh=t}function JA(t){return Hh.loadJS(t)}function WM(){return Hh.recaptchaEnterpriseScript}function YM(){return Hh.gapiScript}function ZA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var jI=class{constructor(){this.enterprise=new KI}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},KI=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var XM="recaptcha-enterprise",oc="NO_RECAPTCHA",wh=class{constructor(e){this.type=XM,this.auth=eu(e)}async verify(e="verify",n=!1){async function a(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(i,u)=>{UA(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let c=new _h(l);return s.tenantId==null?s._agentRecaptchaConfig=c:s._tenantRecaptchaConfigs[s.tenantId]=c,i(c.siteKey)}}).catch(l=>{u(l)})})}function r(s,i,u){let l=window.grecaptcha;gA(l)?l.enterprise.ready(()=>{l.enterprise.execute(s,{action:e}).then(c=>{i(c)}).catch(()=>{i(oc)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new jI().execute("siteKey",{action:"verify"}):new Promise((s,i)=>{a(this.auth).then(u=>{if(!n&&gA(window.grecaptcha))r(u,s,i);else{if(typeof window>"u"){i(new Error("RecaptchaVerifier is only supported in browser"));return}let l=WM();l.length!==0&&(l+=u),JA(l).then(()=>{r(u,s,i)}).catch(c=>{i(c)})}}).catch(u=>{i(u)})})}};async function ac(t,e,n,a=!1,r=!1){let s=new wh(t),i;if(r)i=oc;else try{i=await s.verify(n)}catch{i=await s.verify(n,!0)}let u={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,c=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return a?Object.assign(u,{captchaResp:i}):Object.assign(u,{captchaResponse:i}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function uc(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let s=await ac(t,e,n,n==="getOobCode");return a(t,s)}else return a(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let i=await ac(t,e,n,n==="getOobCode");return a(t,i)}else return Promise.reject(s)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let s=await ac(t,e,n);return a(t,s).catch(async i=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(i.code==="auth/missing-recaptcha-token"||i.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let u=await ac(t,e,n,!1,!0);return a(t,u)}return Promise.reject(i)})}else{let s=await ac(t,e,n,!1,!0);return a(t,s)}else return Promise.reject(r+" provider is not supported.")}async function QM(t){let e=eu(t),n=await UA(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),a=new _h(n);e.tenantId==null?e._agentRecaptchaConfig=a:e._tenantRecaptchaConfigs[e.tenantId]=a,a.isAnyProviderEnabled()&&new wh(e).verify()}function ex(t,e){let n=Ti(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),s=n.getOptions();if(xa(s,e??{}))return r;Ra(r,"already-initialized")}return n.initialize({options:e})}function $M(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(Nr);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function tx(t,e,n){let a=eu(t);te(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,s=nx(e),{host:i,port:u}=JM(e),l=u===null?"":`:${u}`,c={url:`${s}//${i}${l}/`},f=Object.freeze({host:i,port:u,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){te(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),te(xa(c,a.config.emulator)&&xa(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Ya(i)?(Ko(`${s}//${i}${l}`),Wo("Auth",!0)):r||ZM()}function nx(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function JM(t){let e=nx(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let s=r[1];return{host:s,port:SA(a.substr(s.length+1))}}else{let[s,i]=a.split(":");return{host:s,port:SA(i)}}}function SA(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function ZM(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var Ci=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Ja("not implemented")}_getIdTokenResponse(e){return Ja("not implemented")}_linkToIdToken(e,n){return Ja("not implemented")}_getReauthenticationResolver(e){return Ja("not implemented")}};async function eN(t,e){return bn(t,"POST","/v1/accounts:signUp",e)}async function tN(t,e){return Ri(t,"POST","/v1/accounts:signInWithPassword",sn(t,e))}async function nN(t,e){return Ri(t,"POST","/v1/accounts:signInWithEmailLink",sn(t,e))}async function aN(t,e){return Ri(t,"POST","/v1/accounts:signInWithEmailLink",sn(t,e))}var dc=class t extends Ci{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return uc(e,n,"signInWithPassword",tN,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return nN(e,{email:this._email,oobCode:this._password});default:Ra(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return uc(e,a,"signUpPassword",eN,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return aN(e,{idToken:n,email:this._email,oobCode:this._password});default:Ra(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function Jo(t,e){return Ri(t,"POST","/v1/accounts:signInWithIdp",sn(t,e))}var rN="http://localhost",Li=class t extends Ci{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Ra("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...s}=n;if(!a||!r)return null;let i=new t(a,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){let n=this.buildRequest();return Jo(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,Jo(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,Jo(e,n)}buildRequest(){let e={requestUri:rN,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Yo(n)}return e}};async function vA(t,e){return bn(t,"POST","/v1/accounts:sendVerificationCode",sn(t,e))}async function sN(t,e){return Ri(t,"POST","/v1/accounts:signInWithPhoneNumber",sn(t,e))}async function iN(t,e){let n=await Ri(t,"POST","/v1/accounts:signInWithPhoneNumber",sn(t,e));if(n.temporaryProof)throw rc(t,"account-exists-with-different-credential",n);return n}var oN={USER_NOT_FOUND:"user-not-found"};async function uN(t,e){let n={...e,operation:"REAUTH"};return Ri(t,"POST","/v1/accounts:signInWithPhoneNumber",sn(t,n),oN)}var fc=class t extends Ci{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new t({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new t({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return sN(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return iN(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return uN(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:n,verificationId:a,verificationCode:r}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:a,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s}=e;return!a&&!n&&!r&&!s?null:new t({verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s})}};function lN(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function cN(t){let e=Xo(Qo(t)).link,n=e?Xo(Qo(e)).deep_link_id:null,a=Xo(Qo(t)).deep_link_id;return(a?Xo(Qo(a)).link:null)||a||n||e||t}var Ch=class t{constructor(e){let n=Xo(Qo(e)),a=n.apiKey??null,r=n.oobCode??null,s=lN(n.mode??null);te(a&&r&&s,"argument-error"),this.apiKey=a,this.operation=s,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=cN(e);try{return new t(n)}catch{return null}}};var Zo=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return dc._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=Ch.parseLink(n);return te(a,"argument-error"),dc._fromEmailAndCode(e,a.code,a.tenantId)}};Zo.PROVIDER_ID="password";Zo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Zo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var Lh=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var Ai=class extends Lh{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var hc=class t extends Ai{constructor(){super("facebook.com")}static credential(e){return Li._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};hc.FACEBOOK_SIGN_IN_METHOD="facebook.com";hc.PROVIDER_ID="facebook.com";var pc=class t extends Ai{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Li._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};pc.GOOGLE_SIGN_IN_METHOD="google.com";pc.PROVIDER_ID="google.com";var mc=class t extends Ai{constructor(){super("github.com")}static credential(e){return Li._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};mc.GITHUB_SIGN_IN_METHOD="github.com";mc.PROVIDER_ID="github.com";var gc=class t extends Ai{constructor(){super("twitter.com")}static credential(e,n){return Li._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};gc.TWITTER_SIGN_IN_METHOD="twitter.com";gc.PROVIDER_ID="twitter.com";var yc=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,a,r=!1){let s=await js._fromIdTokenResponse(e,a,r),i=EA(a);return new t({user:s,providerId:i,_tokenResponse:a,operationType:n})}static async _forOperation(e,n,a){await e._updateTokensIfNecessary(a,!0);let r=EA(a);return new t({user:e,providerId:r,_tokenResponse:a,operationType:n})}};function EA(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var WI=class t extends Pn{constructor(e,n,a,r){super(n.code,n.message),this.operationType=a,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:a}}static _fromErrorAndOperation(e,n,a,r){return new t(e,n,a,r)}};function ax(t,e,n,a){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?WI._fromErrorAndOperation(t,s,e,a):s})}async function dN(t,e,n=!1){let a=await lc(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return yc._forOperation(t,"link",a)}async function fN(t,e,n=!1){let{auth:a}=t;if(zn(a.app))return Promise.reject(bi(a));let r="reauthenticate";try{let s=await lc(t,ax(a,r,e,t),n);te(s.idToken,a,"internal-error");let i=s_(s.idToken);te(i,a,"internal-error");let{sub:u}=i;return te(t.uid===u,a,"user-mismatch"),yc._forOperation(t,r,s)}catch(s){throw s?.code==="auth/user-not-found"&&Ra(a,"user-mismatch"),s}}async function hN(t,e,n=!1){if(zn(t.app))return Promise.reject(bi(t));let a="signIn",r=await ax(t,a,e),s=await yc._fromIdTokenResponse(t,a,r);return n||await t._updateCurrentUser(s.user),s}function rx(t,e,n,a){return rn(t).onIdTokenChanged(e,n,a)}function sx(t,e,n){return rn(t).beforeAuthStateChanged(e,n)}function TA(t,e){return bn(t,"POST","/v2/accounts/mfaEnrollment:start",sn(t,e))}function pN(t,e){return bn(t,"POST","/v2/accounts/mfaEnrollment:finalize",sn(t,e))}function mN(t,e){return bn(t,"POST","/v2/accounts/mfaEnrollment:start",sn(t,e))}function gN(t,e){return bn(t,"POST","/v2/accounts/mfaEnrollment:finalize",sn(t,e))}var Ah="__sak";var xh=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Ah,"1"),this.storage.removeItem(Ah),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){let n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var yN=1e3,IN=10,Rh=class extends xh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=QA(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let n of Object.keys(this.listeners)){let a=this.storage.getItem(n),r=this.localCache[n];a!==r&&e(n,r,a)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((i,u,l)=>{this.notifyListeners(i,l)});return}let a=e.key;n?this.detachListener():this.stopPolling();let r=()=>{let i=this.storage.getItem(a);!n&&this.localCache[a]===i||this.notifyListeners(a,i)},s=this.storage.getItem(a);zM()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,IN):r()}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,a)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:a}),!0)})},yN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){let n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};Rh.type="LOCAL";var ix=Rh;var _N=1e3;function OI(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${e}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function MI(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var YI=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let n=new URL(`${window.location.origin}/__cookies__`);return n.searchParams.set("finalTarget",e),n}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,n){}async _get(e){if(!this._isAvailable())return null;let n=MI(e);return window.cookieStore?(await window.cookieStore.get(n))?.value:OI(n)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let a=MI(e);document.cookie=`${a}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,n){if(!this._isAvailable())return;let a=MI(e);if(window.cookieStore){let u=c=>{let f=c.changed.find(p=>p.name===a);f&&n(f.value),c.deleted.find(p=>p.name===a)&&n(null)},l=()=>window.cookieStore.removeEventListener("change",u);return this.listenerUnsubscribes.set(n,l),window.cookieStore.addEventListener("change",u)}let r=OI(a),s=setInterval(()=>{let u=OI(a);u!==r&&(n(u),r=u)},_N),i=()=>clearInterval(s);this.listenerUnsubscribes.set(n,i)}_removeListener(e,n){let a=this.listenerUnsubscribes.get(n);a&&(a(),this.listenerUnsubscribes.delete(n))}};YI.type="COOKIE";var kh=class extends xh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};kh.type="SESSION";var o_=kh;function SN(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var Dh=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:s}=n.data,i=this.handlersMap[r];if(!i?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let u=Array.from(i).map(async c=>c(n.origin,s)),l=await SN(u);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Dh.receivers=[];function u_(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var XI=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((u,l)=>{let c=u_("",20);r.port1.start();let f=setTimeout(()=>{l(new Error("unsupported_event"))},a);i={messageChannel:r,onMessage(m){let p=m;if(p.data.eventId===c)switch(p.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),u(p.data.response);break;default:clearTimeout(f),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}};function er(){return window}function vN(t){er().location.href=t}function ox(){return typeof er().WorkerGlobalScope<"u"&&typeof er().importScripts=="function"}async function EN(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function TN(){return navigator?.serviceWorker?.controller||null}function bN(){return ox()?self:null}var ux="firebaseLocalStorageDb",wN=1,Ph="firebaseLocalStorage",lx="fbase_key",xi=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function zh(t,e){return t.transaction([Ph],e?"readwrite":"readonly").objectStore(Ph)}function CN(){let t=indexedDB.deleteDatabase(ux);return new xi(t).toPromise()}function QI(){let t=indexedDB.open(ux,wN);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Ph,{keyPath:lx})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Ph)?e(a):(a.close(),await CN(),e(await QI()))})})}async function bA(t,e,n){let a=zh(t,!0).put({[lx]:e,value:n});return new xi(a).toPromise()}async function LN(t,e){let n=zh(t,!1).get(e),a=await new xi(n).toPromise();return a===void 0?null:a.value}function wA(t,e){let n=zh(t,!0).delete(e);return new xi(n).toPromise()}var AN=800,xN=3,Oh=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await QI(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>xN)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return ox()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Dh._getInstance(bN()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await EN(),!this.activeServiceWorker)return;this.sender=new XI(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||TN()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await QI();return await bA(e,Ah,"1"),await wA(e,Ah),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>bA(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>LN(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>wA(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let s=zh(r,!1).getAll();return new xi(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:s}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),AN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Oh.type="LOCAL";var cx=Oh;function CA(t,e){return bn(t,"POST","/v2/accounts/mfaSignIn:start",sn(t,e))}function RN(t,e){return bn(t,"POST","/v2/accounts/mfaSignIn:finalize",sn(t,e))}function kN(t,e){return bn(t,"POST","/v2/accounts/mfaSignIn:finalize",sn(t,e))}var XB=ZA("rcb"),QB=new wi(3e4,6e4);var ph="recaptcha";async function DN(t,e,n){if(!t._getRecaptchaConfig())try{await QM(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let a;if(typeof e=="string"?a={phoneNumber:e}:a=e,"session"in a){let r=a.session;if("phoneNumber"in a){te(r.type==="enroll",t,"internal-error");let s={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await uc(t,s,"mfaSmsEnrollment",async(c,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===oc){te(n?.type===ph,c,"argument-error");let m=await NI(c,f,n);return TA(c,m)}return TA(c,f)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).phoneSessionInfo.sessionInfo}else{te(r.type==="signin",t,"internal-error");let s=a.multiFactorHint?.uid||a.multiFactorUid;te(s,t,"missing-multi-factor-info");let i={mfaPendingCredential:r.credential,mfaEnrollmentId:s,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await uc(t,i,"mfaSmsSignIn",async(f,m)=>{if(m.phoneSignInInfo.captchaResponse===oc){te(n?.type===ph,f,"argument-error");let p=await NI(f,m,n);return CA(f,p)}return CA(f,m)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await uc(t,r,"sendVerificationCode",async(l,c)=>{if(c.captchaResponse===oc){te(n?.type===ph,l,"argument-error");let f=await NI(l,c,n);return vA(l,f)}return vA(l,c)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{n?._reset()}}async function NI(t,e,n){te(n.type===ph,t,"argument-error");let a=await n.verify();te(typeof a=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let s=r.phoneEnrollmentInfo.phoneNumber,i=r.phoneEnrollmentInfo.captchaResponse,u=r.phoneEnrollmentInfo.clientType,l=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:a,captchaResponse:i,clientType:u,recaptchaVersion:l}}),r}else if("phoneSignInInfo"in r){let s=r.phoneSignInInfo.captchaResponse,i=r.phoneSignInInfo.clientType,u=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:a,captchaResponse:s,clientType:i,recaptchaVersion:u}}),r}else return Object.assign(r,{recaptchaToken:a}),r}var Ic=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=eu(e)}verifyPhoneNumber(e,n){return DN(this.auth,e,rn(n))}static credential(e,n){return fc._fromVerification(e,n)}static credentialFromResult(e){let n=e;return t.credentialFromTaggedObject(n)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:n,temporaryProof:a}=e;return n&&a?fc._fromTokenResponse(n,a):null}};Ic.PROVIDER_ID="phone";Ic.PHONE_SIGN_IN_METHOD="phone";function PN(t,e){return e?Nr(e):(te(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var _c=class extends Ci{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Jo(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Jo(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Jo(e,this._buildIdpRequest())}_buildIdpRequest(e){let n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function ON(t){return hN(t.auth,new _c(t),t.bypassAuthState)}function MN(t){let{auth:e,user:n}=t;return te(n,e,"internal-error"),fN(n,new _c(t),t.bypassAuthState)}async function NN(t){let{auth:e,user:n}=t;return te(n,e,"internal-error"),dN(n,new _c(t),t.bypassAuthState)}var Mh=class{constructor(e,n,a,r,s=!1){this.auth=e,this.resolver=a,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(a){this.reject(a)}})}async onAuthEvent(e){let{urlResponse:n,sessionId:a,postBody:r,tenantId:s,error:i,type:u}=e;if(i){this.reject(i);return}let l={auth:this.auth,requestUri:n,sessionId:a,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(l))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return ON;case"linkViaPopup":case"linkViaRedirect":return NN;case"reauthViaPopup":case"reauthViaRedirect":return MN;default:Ra(this.auth,"internal-error")}}resolve(e){Vr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Vr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var VN=new wi(2e3,1e4);var $I=class t extends Mh{constructor(e,n,a,r,s){super(e,n,r,s),this.provider=a,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return te(e,this.auth,"internal-error"),e}async onExecution(){Vr(this.filter.length===1,"Popup operations only handle one event");let e=u_();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Za(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(Za(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Za(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,VN.get())};e()}};$I.currentPopupAction=null;var FN="pendingRedirect",mh=new Map,JI=class extends Mh{constructor(e,n,a=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,a),this.eventId=null}async execute(){let e=mh.get(this.auth._key());if(!e){try{let a=await UN(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(a)}catch(n){e=()=>Promise.reject(n)}mh.set(this.auth._key(),e)}return this.bypassAuthState||mh.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function UN(t,e){let n=HN(e),a=qN(t);if(!await a._isAvailable())return!1;let r=await a._get(n)==="true";return await a._remove(n),r}function BN(t,e){mh.set(t._key(),e)}function qN(t){return Nr(t._redirectPersistence)}function HN(t){return hh(FN,t.config.apiKey,t.name)}async function zN(t,e,n=!1){if(zn(t.app))return Promise.reject(bi(t));let a=eu(t),r=PN(a,e),i=await new JI(a,r,n).execute();return i&&!n&&(delete i.user._redirectEventId,await a._persistUserIfCurrent(i.user),await a._setRedirectUser(null,e)),i}var GN=10*60*1e3,ZI=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(a=>{this.isEventForConsumer(e,a)&&(n=!0,this.sendToConsumer(e,a),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!jN(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!dx(e)){let a=e.error.code?.split("auth/")[1]||"internal-error";n.onError(Za(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){let a=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&a}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=GN&&this.cachedEventUids.clear(),this.cachedEventUids.has(LA(e))}saveEventToCache(e){this.cachedEventUids.add(LA(e)),this.lastProcessedEventTime=Date.now()}};function LA(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function dx({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function jN(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return dx(t);default:return!1}}async function KN(t,e={}){return bn(t,"GET","/v1/projects",e)}var WN=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,YN=/^https?/;async function XN(t){if(t.config.emulator)return;let{authorizedDomains:e}=await KN(t);for(let n of e)try{if(QN(n))return}catch{}Ra(t,"unauthorized-domain")}function QN(t){let e=FI(),{protocol:n,hostname:a}=new URL(e);if(t.startsWith("chrome-extension://")){let i=new URL(t);return i.hostname===""&&a===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&i.hostname===a}if(!YN.test(n))return!1;if(WN.test(t))return a===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(a)}var $N=new wi(3e4,6e4);function AA(){let t=er().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function JN(t){return new Promise((e,n)=>{function a(){AA(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{AA(),n(Za(t,"network-request-failed"))},timeout:$N.get()})}if(er().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(er().gapi?.load)a();else{let r=ZA("iframefcb");return er()[r]=()=>{gapi.load?a():n(Za(t,"network-request-failed"))},JA(`${YM()}?onload=${r}`).catch(s=>n(s))}}).catch(e=>{throw gh=null,e})}var gh=null;function ZN(t){return gh=gh||JN(t),gh}var e2=new wi(5e3,15e3),t2="__/auth/iframe",n2="emulator/auth/iframe",a2={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},r2=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function s2(t){let e=t.config;te(e.authDomain,t,"auth-domain-config-required");let n=e.emulator?r_(e,n2):`https://${t.config.authDomain}/${t2}`,a={apiKey:e.apiKey,appName:t.name,v:$a},r=r2.get(t.config.apiHost);r&&(a.eid=r);let s=t._getFrameworks();return s.length&&(a.fw=s.join(",")),`${n}?${Yo(a).slice(1)}`}async function i2(t){let e=await ZN(t),n=er().gapi;return te(n,t,"internal-error"),e.open({where:document.body,url:s2(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:a2,dontclear:!0},a=>new Promise(async(r,s)=>{await a.restyle({setHideOnLeave:!1});let i=Za(t,"network-request-failed"),u=er().setTimeout(()=>{s(i)},e2.get());function l(){er().clearTimeout(u),r(a)}a.ping(l).then(l,()=>{s(i)})}))}var o2={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},u2=500,l2=600,c2="_blank",d2="http://localhost",Nh=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function f2(t,e,n,a=u2,r=l2){let s=Math.max((window.screen.availHeight-r)/2,0).toString(),i=Math.max((window.screen.availWidth-a)/2,0).toString(),u="",l={...o2,width:a.toString(),height:r.toString(),top:s,left:i},c=an().toLowerCase();n&&(u=jA(c)?c2:n),zA(c)&&(e=e||d2,l.scrollbars="yes");let f=Object.entries(l).reduce((p,[S,R])=>`${p}${S}=${R},`,"");if(HM(c)&&u!=="_self")return h2(e||"",u),new Nh(null);let m=window.open(e||"",u,f);te(m,t,"popup-blocked");try{m.focus()}catch{}return new Nh(m)}function h2(t,e){let n=document.createElement("a");n.href=t,n.target=e;let a=document.createEvent("MouseEvent");a.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(a)}var p2="__/auth/handler",m2="emulator/auth/handler",g2=encodeURIComponent("fac");async function xA(t,e,n,a,r,s){te(t.config.authDomain,t,"auth-domain-config-required"),te(t.config.apiKey,t,"invalid-api-key");let i={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:a,v:$a,eventId:r};if(e instanceof Lh){e.setDefaultLanguage(t.languageCode),i.providerId=e.providerId||"",ZL(e.getCustomParameters())||(i.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,m]of Object.entries(s||{}))i[f]=m}if(e instanceof Ai){let f=e.getScopes().filter(m=>m!=="");f.length>0&&(i.scopes=f.join(","))}t.tenantId&&(i.tid=t.tenantId);let u=i;for(let f of Object.keys(u))u[f]===void 0&&delete u[f];let l=await t._getAppCheckToken(),c=l?`#${g2}=${encodeURIComponent(l)}`:"";return`${y2(t)}?${Yo(u).slice(1)}${c}`}function y2({config:t}){return t.emulator?r_(t,m2):`https://${t.authDomain}/${p2}`}var VI="webStorageSupport",e_=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=o_,this._completeRedirectFn=zN,this._overrideRedirectResult=BN}async _openPopup(e,n,a,r){Vr(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let s=await xA(e,n,a,FI(),r);return f2(e,s,u_())}async _openRedirect(e,n,a,r){await this._originValidation(e);let s=await xA(e,n,a,FI(),r);return vN(s),new Promise(()=>{})}_initialize(e){let n=e._key();if(this.eventManagers[n]){let{manager:r,promise:s}=this.eventManagers[n];return r?Promise.resolve(r):(Vr(s,"If manager is not set, promise should be"),s)}let a=this.initAndGetManager(e);return this.eventManagers[n]={promise:a},a.catch(()=>{delete this.eventManagers[n]}),a}async initAndGetManager(e){let n=await i2(e),a=new ZI(e);return n.register("authEvent",r=>(te(r?.authEvent,e,"invalid-auth-event"),{status:a.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:a},this.iframes[e._key()]=n,a}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(VI,{type:VI},r=>{let s=r?.[0]?.[VI];s!==void 0&&n(!!s),Ra(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=XN(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return QA()||GA()||i_()}},fx=e_,Vh=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return Ja("unexpected MultiFactorSessionType")}}},t_=class t extends Vh{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,n,a){return pN(e,{idToken:n,displayName:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,n){return RN(e,{mfaPendingCredential:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Fh=class{constructor(){}static assertion(e){return t_._fromCredential(e)}};Fh.FACTOR_ID="phone";var Uh=class{static assertionForEnrollment(e,n){return Bh._fromSecret(e,n)}static assertionForSignIn(e,n){return Bh._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;te(typeof n.user?.auth<"u","internal-error");let a=await mN(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return qh._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Uh.FACTOR_ID="totp";var Bh=class t extends Vh{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return te(typeof this.secret<"u",e,"argument-error"),gN(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){te(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return kN(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},qh=class t{constructor(e,n,a,r,s,i,u){this.sessionInfo=i,this.auth=u,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(dh(e)||dh(n))&&(a=!0),a&&(dh(e)&&(e=this.auth.currentUser?.email||"unknownuser"),dh(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function dh(t){return typeof t>"u"||t?.length===0}var RA="@firebase/auth",kA="1.12.1";var n_=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){te(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function I2(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function _2(t){Qa(new qn("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:u}=a.options;te(i&&!i.includes(":"),"invalid-api-key",{appName:a.name});let l={apiKey:i,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:$A(t)},c=new GI(a,r,s,l);return $M(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),Qa(new qn("auth-internal",e=>{let n=eu(e.getProvider("auth").getImmediate());return(a=>new n_(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Hn(RA,kA,I2(t)),Hn(RA,kA,"esm2020")}var S2=5*60,v2=gI("authIdTokenMaxAge")||S2,DA=null,E2=t=>async e=>{let n=e&&await e.getIdTokenResult(),a=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(a&&a>v2)return;let r=n?.token;DA!==r&&(DA=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function l_(t=$o()){let e=Ti(t,"auth");if(e.isInitialized())return e.getImmediate();let n=ex(t,{popupRedirectResolver:fx,persistence:[cx,ix,o_]}),a=gI("authTokenSyncURL");if(a&&typeof isSecureContext=="boolean"&&isSecureContext){let s=new URL(a,location.origin);if(location.origin===s.origin){let i=E2(s.toString());sx(n,i,()=>i(n.currentUser)),rx(n,u=>i(u))}}let r=pI("auth");return r&&tx(n,`http://${r}`),n}function T2(){return document.getElementsByTagName("head")?.[0]??document}KM({loadJS(t){return new Promise((e,n)=>{let a=document.createElement("script");a.setAttribute("src",t),a.onload=e,a.onerror=r=>{let s=Za("internal-error");s.customData=r,n(s)},a.type="text/javascript",a.charset="UTF-8",T2().appendChild(a)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});_2("Browser");var hx=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},px={};var Fr,c_;(function(){var t;function e(v,g){function I(){}I.prototype=g.prototype,v.F=g.prototype,v.prototype=new I,v.prototype.constructor=v,v.D=function(b,C,x){for(var T=Array(arguments.length-2),de=2;de<arguments.length;de++)T[de-2]=arguments[de];return g.prototype[C].apply(b,T)}}function n(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(a,n),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(v,g,I){I||(I=0);let b=Array(16);if(typeof g=="string")for(var C=0;C<16;++C)b[C]=g.charCodeAt(I++)|g.charCodeAt(I++)<<8|g.charCodeAt(I++)<<16|g.charCodeAt(I++)<<24;else for(C=0;C<16;++C)b[C]=g[I++]|g[I++]<<8|g[I++]<<16|g[I++]<<24;g=v.g[0],I=v.g[1],C=v.g[2];let x=v.g[3],T;T=g+(x^I&(C^x))+b[0]+3614090360&4294967295,g=I+(T<<7&4294967295|T>>>25),T=x+(C^g&(I^C))+b[1]+3905402710&4294967295,x=g+(T<<12&4294967295|T>>>20),T=C+(I^x&(g^I))+b[2]+606105819&4294967295,C=x+(T<<17&4294967295|T>>>15),T=I+(g^C&(x^g))+b[3]+3250441966&4294967295,I=C+(T<<22&4294967295|T>>>10),T=g+(x^I&(C^x))+b[4]+4118548399&4294967295,g=I+(T<<7&4294967295|T>>>25),T=x+(C^g&(I^C))+b[5]+1200080426&4294967295,x=g+(T<<12&4294967295|T>>>20),T=C+(I^x&(g^I))+b[6]+2821735955&4294967295,C=x+(T<<17&4294967295|T>>>15),T=I+(g^C&(x^g))+b[7]+4249261313&4294967295,I=C+(T<<22&4294967295|T>>>10),T=g+(x^I&(C^x))+b[8]+1770035416&4294967295,g=I+(T<<7&4294967295|T>>>25),T=x+(C^g&(I^C))+b[9]+2336552879&4294967295,x=g+(T<<12&4294967295|T>>>20),T=C+(I^x&(g^I))+b[10]+4294925233&4294967295,C=x+(T<<17&4294967295|T>>>15),T=I+(g^C&(x^g))+b[11]+2304563134&4294967295,I=C+(T<<22&4294967295|T>>>10),T=g+(x^I&(C^x))+b[12]+1804603682&4294967295,g=I+(T<<7&4294967295|T>>>25),T=x+(C^g&(I^C))+b[13]+4254626195&4294967295,x=g+(T<<12&4294967295|T>>>20),T=C+(I^x&(g^I))+b[14]+2792965006&4294967295,C=x+(T<<17&4294967295|T>>>15),T=I+(g^C&(x^g))+b[15]+1236535329&4294967295,I=C+(T<<22&4294967295|T>>>10),T=g+(C^x&(I^C))+b[1]+4129170786&4294967295,g=I+(T<<5&4294967295|T>>>27),T=x+(I^C&(g^I))+b[6]+3225465664&4294967295,x=g+(T<<9&4294967295|T>>>23),T=C+(g^I&(x^g))+b[11]+643717713&4294967295,C=x+(T<<14&4294967295|T>>>18),T=I+(x^g&(C^x))+b[0]+3921069994&4294967295,I=C+(T<<20&4294967295|T>>>12),T=g+(C^x&(I^C))+b[5]+3593408605&4294967295,g=I+(T<<5&4294967295|T>>>27),T=x+(I^C&(g^I))+b[10]+38016083&4294967295,x=g+(T<<9&4294967295|T>>>23),T=C+(g^I&(x^g))+b[15]+3634488961&4294967295,C=x+(T<<14&4294967295|T>>>18),T=I+(x^g&(C^x))+b[4]+3889429448&4294967295,I=C+(T<<20&4294967295|T>>>12),T=g+(C^x&(I^C))+b[9]+568446438&4294967295,g=I+(T<<5&4294967295|T>>>27),T=x+(I^C&(g^I))+b[14]+3275163606&4294967295,x=g+(T<<9&4294967295|T>>>23),T=C+(g^I&(x^g))+b[3]+4107603335&4294967295,C=x+(T<<14&4294967295|T>>>18),T=I+(x^g&(C^x))+b[8]+1163531501&4294967295,I=C+(T<<20&4294967295|T>>>12),T=g+(C^x&(I^C))+b[13]+2850285829&4294967295,g=I+(T<<5&4294967295|T>>>27),T=x+(I^C&(g^I))+b[2]+4243563512&4294967295,x=g+(T<<9&4294967295|T>>>23),T=C+(g^I&(x^g))+b[7]+1735328473&4294967295,C=x+(T<<14&4294967295|T>>>18),T=I+(x^g&(C^x))+b[12]+2368359562&4294967295,I=C+(T<<20&4294967295|T>>>12),T=g+(I^C^x)+b[5]+4294588738&4294967295,g=I+(T<<4&4294967295|T>>>28),T=x+(g^I^C)+b[8]+2272392833&4294967295,x=g+(T<<11&4294967295|T>>>21),T=C+(x^g^I)+b[11]+1839030562&4294967295,C=x+(T<<16&4294967295|T>>>16),T=I+(C^x^g)+b[14]+4259657740&4294967295,I=C+(T<<23&4294967295|T>>>9),T=g+(I^C^x)+b[1]+2763975236&4294967295,g=I+(T<<4&4294967295|T>>>28),T=x+(g^I^C)+b[4]+1272893353&4294967295,x=g+(T<<11&4294967295|T>>>21),T=C+(x^g^I)+b[7]+4139469664&4294967295,C=x+(T<<16&4294967295|T>>>16),T=I+(C^x^g)+b[10]+3200236656&4294967295,I=C+(T<<23&4294967295|T>>>9),T=g+(I^C^x)+b[13]+681279174&4294967295,g=I+(T<<4&4294967295|T>>>28),T=x+(g^I^C)+b[0]+3936430074&4294967295,x=g+(T<<11&4294967295|T>>>21),T=C+(x^g^I)+b[3]+3572445317&4294967295,C=x+(T<<16&4294967295|T>>>16),T=I+(C^x^g)+b[6]+76029189&4294967295,I=C+(T<<23&4294967295|T>>>9),T=g+(I^C^x)+b[9]+3654602809&4294967295,g=I+(T<<4&4294967295|T>>>28),T=x+(g^I^C)+b[12]+3873151461&4294967295,x=g+(T<<11&4294967295|T>>>21),T=C+(x^g^I)+b[15]+530742520&4294967295,C=x+(T<<16&4294967295|T>>>16),T=I+(C^x^g)+b[2]+3299628645&4294967295,I=C+(T<<23&4294967295|T>>>9),T=g+(C^(I|~x))+b[0]+4096336452&4294967295,g=I+(T<<6&4294967295|T>>>26),T=x+(I^(g|~C))+b[7]+1126891415&4294967295,x=g+(T<<10&4294967295|T>>>22),T=C+(g^(x|~I))+b[14]+2878612391&4294967295,C=x+(T<<15&4294967295|T>>>17),T=I+(x^(C|~g))+b[5]+4237533241&4294967295,I=C+(T<<21&4294967295|T>>>11),T=g+(C^(I|~x))+b[12]+1700485571&4294967295,g=I+(T<<6&4294967295|T>>>26),T=x+(I^(g|~C))+b[3]+2399980690&4294967295,x=g+(T<<10&4294967295|T>>>22),T=C+(g^(x|~I))+b[10]+4293915773&4294967295,C=x+(T<<15&4294967295|T>>>17),T=I+(x^(C|~g))+b[1]+2240044497&4294967295,I=C+(T<<21&4294967295|T>>>11),T=g+(C^(I|~x))+b[8]+1873313359&4294967295,g=I+(T<<6&4294967295|T>>>26),T=x+(I^(g|~C))+b[15]+4264355552&4294967295,x=g+(T<<10&4294967295|T>>>22),T=C+(g^(x|~I))+b[6]+2734768916&4294967295,C=x+(T<<15&4294967295|T>>>17),T=I+(x^(C|~g))+b[13]+1309151649&4294967295,I=C+(T<<21&4294967295|T>>>11),T=g+(C^(I|~x))+b[4]+4149444226&4294967295,g=I+(T<<6&4294967295|T>>>26),T=x+(I^(g|~C))+b[11]+3174756917&4294967295,x=g+(T<<10&4294967295|T>>>22),T=C+(g^(x|~I))+b[2]+718787259&4294967295,C=x+(T<<15&4294967295|T>>>17),T=I+(x^(C|~g))+b[9]+3951481745&4294967295,v.g[0]=v.g[0]+g&4294967295,v.g[1]=v.g[1]+(C+(T<<21&4294967295|T>>>11))&4294967295,v.g[2]=v.g[2]+C&4294967295,v.g[3]=v.g[3]+x&4294967295}a.prototype.v=function(v,g){g===void 0&&(g=v.length);let I=g-this.blockSize,b=this.C,C=this.h,x=0;for(;x<g;){if(C==0)for(;x<=I;)r(this,v,x),x+=this.blockSize;if(typeof v=="string"){for(;x<g;)if(b[C++]=v.charCodeAt(x++),C==this.blockSize){r(this,b),C=0;break}}else for(;x<g;)if(b[C++]=v[x++],C==this.blockSize){r(this,b),C=0;break}}this.h=C,this.o+=g},a.prototype.A=function(){var v=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);v[0]=128;for(var g=1;g<v.length-8;++g)v[g]=0;g=this.o*8;for(var I=v.length-8;I<v.length;++I)v[I]=g&255,g/=256;for(this.v(v),v=Array(16),g=0,I=0;I<4;++I)for(let b=0;b<32;b+=8)v[g++]=this.g[I]>>>b&255;return v};function s(v,g){var I=u;return Object.prototype.hasOwnProperty.call(I,v)?I[v]:I[v]=g(v)}function i(v,g){this.h=g;let I=[],b=!0;for(let C=v.length-1;C>=0;C--){let x=v[C]|0;b&&x==g||(I[C]=x,b=!1)}this.g=I}var u={};function l(v){return-128<=v&&v<128?s(v,function(g){return new i([g|0],g<0?-1:0)}):new i([v|0],v<0?-1:0)}function c(v){if(isNaN(v)||!isFinite(v))return m;if(v<0)return A(c(-v));let g=[],I=1;for(let b=0;v>=I;b++)g[b]=v/I|0,I*=4294967296;return new i(g,0)}function f(v,g){if(v.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(v.charAt(0)=="-")return A(f(v.substring(1),g));if(v.indexOf("-")>=0)throw Error('number format error: interior "-" character');let I=c(Math.pow(g,8)),b=m;for(let x=0;x<v.length;x+=8){var C=Math.min(8,v.length-x);let T=parseInt(v.substring(x,x+C),g);C<8?(C=c(Math.pow(g,C)),b=b.j(C).add(c(T))):(b=b.j(I),b=b.add(c(T)))}return b}var m=l(0),p=l(1),S=l(16777216);t=i.prototype,t.m=function(){if(D(this))return-A(this).m();let v=0,g=1;for(let I=0;I<this.g.length;I++){let b=this.i(I);v+=(b>=0?b:4294967296+b)*g,g*=4294967296}return v},t.toString=function(v){if(v=v||10,v<2||36<v)throw Error("radix out of range: "+v);if(R(this))return"0";if(D(this))return"-"+A(this).toString(v);let g=c(Math.pow(v,6));var I=this;let b="";for(;;){let C=L(I,g).g;I=E(I,C.j(g));let x=((I.g.length>0?I.g[0]:I.h)>>>0).toString(v);if(I=C,R(I))return x+b;for(;x.length<6;)x="0"+x;b=x+b}},t.i=function(v){return v<0?0:v<this.g.length?this.g[v]:this.h};function R(v){if(v.h!=0)return!1;for(let g=0;g<v.g.length;g++)if(v.g[g]!=0)return!1;return!0}function D(v){return v.h==-1}t.l=function(v){return v=E(this,v),D(v)?-1:R(v)?0:1};function A(v){let g=v.g.length,I=[];for(let b=0;b<g;b++)I[b]=~v.g[b];return new i(I,~v.h).add(p)}t.abs=function(){return D(this)?A(this):this},t.add=function(v){let g=Math.max(this.g.length,v.g.length),I=[],b=0;for(let C=0;C<=g;C++){let x=b+(this.i(C)&65535)+(v.i(C)&65535),T=(x>>>16)+(this.i(C)>>>16)+(v.i(C)>>>16);b=T>>>16,x&=65535,T&=65535,I[C]=T<<16|x}return new i(I,I[I.length-1]&-2147483648?-1:0)};function E(v,g){return v.add(A(g))}t.j=function(v){if(R(this)||R(v))return m;if(D(this))return D(v)?A(this).j(A(v)):A(A(this).j(v));if(D(v))return A(this.j(A(v)));if(this.l(S)<0&&v.l(S)<0)return c(this.m()*v.m());let g=this.g.length+v.g.length,I=[];for(var b=0;b<2*g;b++)I[b]=0;for(b=0;b<this.g.length;b++)for(let C=0;C<v.g.length;C++){let x=this.i(b)>>>16,T=this.i(b)&65535,de=v.i(C)>>>16,Se=v.i(C)&65535;I[2*b+2*C]+=T*Se,_(I,2*b+2*C),I[2*b+2*C+1]+=x*Se,_(I,2*b+2*C+1),I[2*b+2*C+1]+=T*de,_(I,2*b+2*C+1),I[2*b+2*C+2]+=x*de,_(I,2*b+2*C+2)}for(v=0;v<g;v++)I[v]=I[2*v+1]<<16|I[2*v];for(v=g;v<2*g;v++)I[v]=0;return new i(I,0)};function _(v,g){for(;(v[g]&65535)!=v[g];)v[g+1]+=v[g]>>>16,v[g]&=65535,g++}function w(v,g){this.g=v,this.h=g}function L(v,g){if(R(g))throw Error("division by zero");if(R(v))return new w(m,m);if(D(v))return g=L(A(v),g),new w(A(g.g),A(g.h));if(D(g))return g=L(v,A(g)),new w(A(g.g),g.h);if(v.g.length>30){if(D(v)||D(g))throw Error("slowDivide_ only works with positive integers.");for(var I=p,b=g;b.l(v)<=0;)I=q(I),b=q(b);var C=z(I,1),x=z(b,1);for(b=z(b,2),I=z(I,2);!R(b);){var T=x.add(b);T.l(v)<=0&&(C=C.add(I),x=T),b=z(b,1),I=z(I,1)}return g=E(v,C.j(g)),new w(C,g)}for(C=m;v.l(g)>=0;){for(I=Math.max(1,Math.floor(v.m()/g.m())),b=Math.ceil(Math.log(I)/Math.LN2),b=b<=48?1:Math.pow(2,b-48),x=c(I),T=x.j(g);D(T)||T.l(v)>0;)I-=b,x=c(I),T=x.j(g);R(x)&&(x=p),C=C.add(x),v=E(v,T)}return new w(C,v)}t.B=function(v){return L(this,v).h},t.and=function(v){let g=Math.max(this.g.length,v.g.length),I=[];for(let b=0;b<g;b++)I[b]=this.i(b)&v.i(b);return new i(I,this.h&v.h)},t.or=function(v){let g=Math.max(this.g.length,v.g.length),I=[];for(let b=0;b<g;b++)I[b]=this.i(b)|v.i(b);return new i(I,this.h|v.h)},t.xor=function(v){let g=Math.max(this.g.length,v.g.length),I=[];for(let b=0;b<g;b++)I[b]=this.i(b)^v.i(b);return new i(I,this.h^v.h)};function q(v){let g=v.g.length+1,I=[];for(let b=0;b<g;b++)I[b]=v.i(b)<<1|v.i(b-1)>>>31;return new i(I,v.h)}function z(v,g){let I=g>>5;g%=32;let b=v.g.length-I,C=[];for(let x=0;x<b;x++)C[x]=g>0?v.i(x+I)>>>g|v.i(x+I+1)<<32-g:v.i(x+I);return new i(C,v.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,c_=px.Md5=a,i.prototype.add=i.prototype.add,i.prototype.multiply=i.prototype.j,i.prototype.modulo=i.prototype.B,i.prototype.compare=i.prototype.l,i.prototype.toNumber=i.prototype.m,i.prototype.toString=i.prototype.toString,i.prototype.getBits=i.prototype.i,i.fromNumber=c,i.fromString=f,Fr=px.Integer=i}).apply(typeof hx<"u"?hx:typeof self<"u"?self:typeof window<"u"?window:{});var Gh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Ur={};var d_,b2,tu,f_,Sc,jh,h_,p_,m_;(function(){var t,e=Object.defineProperty;function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Gh=="object"&&Gh];for(var d=0;d<o.length;++d){var h=o[d];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var a=n(this);function r(o,d){if(d)e:{var h=a;o=o.split(".");for(var y=0;y<o.length-1;y++){var k=o[y];if(!(k in h))break e;h=h[k]}o=o[o.length-1],y=h[o],d=d(y),d!=y&&d!=null&&e(h,o,{configurable:!0,writable:!0,value:d})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(d){var h=[],y;for(y in d)Object.prototype.hasOwnProperty.call(d,y)&&h.push([y,d[y]]);return h}});var s=s||{},i=this||self;function u(o){var d=typeof o;return d=="object"&&o!=null||d=="function"}function l(o,d,h){return o.call.apply(o.bind,arguments)}function c(o,d,h){return c=l,c.apply(null,arguments)}function f(o,d){var h=Array.prototype.slice.call(arguments,1);return function(){var y=h.slice();return y.push.apply(y,arguments),o.apply(this,y)}}function m(o,d){function h(){}h.prototype=d.prototype,o.Z=d.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(y,k,O){for(var Y=Array(arguments.length-2),Ie=2;Ie<arguments.length;Ie++)Y[Ie-2]=arguments[Ie];return d.prototype[k].apply(y,Y)}}var p=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function S(o){let d=o.length;if(d>0){let h=Array(d);for(let y=0;y<d;y++)h[y]=o[y];return h}return[]}function R(o,d){for(let y=1;y<arguments.length;y++){let k=arguments[y];var h=typeof k;if(h=h!="object"?h:k?Array.isArray(k)?"array":h:"null",h=="array"||h=="object"&&typeof k.length=="number"){h=o.length||0;let O=k.length||0;o.length=h+O;for(let Y=0;Y<O;Y++)o[h+Y]=k[Y]}else o.push(k)}}class D{constructor(d,h){this.i=d,this.j=h,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function A(o){i.setTimeout(()=>{throw o},0)}function E(){var o=v;let d=null;return o.g&&(d=o.g,o.g=o.g.next,o.g||(o.h=null),d.next=null),d}class _{constructor(){this.h=this.g=null}add(d,h){let y=w.get();y.set(d,h),this.h?this.h.next=y:this.g=y,this.h=y}}var w=new D(()=>new L,o=>o.reset());class L{constructor(){this.next=this.g=this.h=null}set(d,h){this.h=d,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let q,z=!1,v=new _,g=()=>{let o=Promise.resolve(void 0);q=()=>{o.then(I)}};function I(){for(var o;o=E();){try{o.h.call(o.g)}catch(h){A(h)}var d=w;d.j(o),d.h<100&&(d.h++,o.next=d.g,d.g=o)}z=!1}function b(){this.u=this.u,this.C=this.C}b.prototype.u=!1,b.prototype.dispose=function(){this.u||(this.u=!0,this.N())},b.prototype[Symbol.dispose]=function(){this.dispose()},b.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function C(o,d){this.type=o,this.g=this.target=d,this.defaultPrevented=!1}C.prototype.h=function(){this.defaultPrevented=!0};var x=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var o=!1,d=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let h=()=>{};i.addEventListener("test",h,d),i.removeEventListener("test",h,d)}catch{}return o}();function T(o){return/^[\s\xa0]*$/.test(o)}function de(o,d){C.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,d)}m(de,C),de.prototype.init=function(o,d){let h=this.type=o.type,y=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=d,d=o.relatedTarget,d||(h=="mouseover"?d=o.fromElement:h=="mouseout"&&(d=o.toElement)),this.relatedTarget=d,y?(this.clientX=y.clientX!==void 0?y.clientX:y.pageX,this.clientY=y.clientY!==void 0?y.clientY:y.pageY,this.screenX=y.screenX||0,this.screenY=y.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&de.Z.h.call(this)},de.prototype.h=function(){de.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Se="closure_listenable_"+(Math.random()*1e6|0),lt=0;function M(o,d,h,y,k){this.listener=o,this.proxy=null,this.src=d,this.type=h,this.capture=!!y,this.ha=k,this.key=++lt,this.da=this.fa=!1}function P(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function N(o,d,h){for(let y in o)d.call(h,o[y],y,o)}function W(o,d){for(let h in o)d.call(void 0,o[h],h,o)}function Q(o){let d={};for(let h in o)d[h]=o[h];return d}let ae="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function at(o,d){let h,y;for(let k=1;k<arguments.length;k++){y=arguments[k];for(h in y)o[h]=y[h];for(let O=0;O<ae.length;O++)h=ae[O],Object.prototype.hasOwnProperty.call(y,h)&&(o[h]=y[h])}}function Fe(o){this.src=o,this.g={},this.h=0}Fe.prototype.add=function(o,d,h,y,k){let O=o.toString();o=this.g[O],o||(o=this.g[O]=[],this.h++);let Y=Ge(o,d,y,k);return Y>-1?(d=o[Y],h||(d.fa=!1)):(d=new M(d,this.src,O,!!y,k),d.fa=h,o.push(d)),d};function Qe(o,d){let h=d.type;if(h in o.g){var y=o.g[h],k=Array.prototype.indexOf.call(y,d,void 0),O;(O=k>=0)&&Array.prototype.splice.call(y,k,1),O&&(P(d),o.g[h].length==0&&(delete o.g[h],o.h--))}}function Ge(o,d,h,y){for(let k=0;k<o.length;++k){let O=o[k];if(!O.da&&O.listener==d&&O.capture==!!h&&O.ha==y)return k}return-1}var Cn="closure_lm_"+(Math.random()*1e6|0),Ln={};function Sn(o,d,h,y,k){if(y&&y.once)return vn(o,d,h,y,k);if(Array.isArray(d)){for(let O=0;O<d.length;O++)Sn(o,d[O],h,y,k);return null}return h=ct(h),o&&o[Se]?o.J(d,h,u(y)?!!y.capture:!!y,k):Zr(o,d,h,!1,y,k)}function Zr(o,d,h,y,k,O){if(!d)throw Error("Invalid event type");let Y=u(k)?!!k.capture:!!k,Ie=me(o);if(Ie||(o[Cn]=Ie=new Fe(o)),h=Ie.add(d,h,y,Y,O),h.proxy)return h;if(y=es(),h.proxy=y,y.src=o,y.listener=h,o.addEventListener)x||(k=Y),k===void 0&&(k=!1),o.addEventListener(d.toString(),y,k);else if(o.attachEvent)o.attachEvent(ee(d.toString()),y);else if(o.addListener&&o.removeListener)o.addListener(y);else throw Error("addEventListener and attachEvent are unavailable.");return h}function es(){function o(h){return d.call(o.src,o.listener,h)}let d=ve;return o}function vn(o,d,h,y,k){if(Array.isArray(d)){for(let O=0;O<d.length;O++)vn(o,d[O],h,y,k);return null}return h=ct(h),o&&o[Se]?o.K(d,h,u(y)?!!y.capture:!!y,k):Zr(o,d,h,!0,y,k)}function V(o,d,h,y,k){if(Array.isArray(d))for(var O=0;O<d.length;O++)V(o,d[O],h,y,k);else y=u(y)?!!y.capture:!!y,h=ct(h),o&&o[Se]?(o=o.i,O=String(d).toString(),O in o.g&&(d=o.g[O],h=Ge(d,h,y,k),h>-1&&(P(d[h]),Array.prototype.splice.call(d,h,1),d.length==0&&(delete o.g[O],o.h--)))):o&&(o=me(o))&&(d=o.g[d.toString()],o=-1,d&&(o=Ge(d,h,y,k)),(h=o>-1?d[o]:null)&&J(h))}function J(o){if(typeof o!="number"&&o&&!o.da){var d=o.src;if(d&&d[Se])Qe(d.i,o);else{var h=o.type,y=o.proxy;d.removeEventListener?d.removeEventListener(h,y,o.capture):d.detachEvent?d.detachEvent(ee(h),y):d.addListener&&d.removeListener&&d.removeListener(y),(h=me(d))?(Qe(h,o),h.h==0&&(h.src=null,d[Cn]=null)):P(o)}}}function ee(o){return o in Ln?Ln[o]:Ln[o]="on"+o}function ve(o,d){if(o.da)o=!0;else{d=new de(d,this);let h=o.listener,y=o.ha||o.src;o.fa&&J(o),o=h.call(y,d)}return o}function me(o){return o=o[Cn],o instanceof Fe?o:null}var Ue="__closure_events_fn_"+(Math.random()*1e9>>>0);function ct(o){return typeof o=="function"?o:(o[Ue]||(o[Ue]=function(d){return o.handleEvent(d)}),o[Ue])}function ge(){b.call(this),this.i=new Fe(this),this.M=this,this.G=null}m(ge,b),ge.prototype[Se]=!0,ge.prototype.removeEventListener=function(o,d,h,y){V(this,o,d,h,y)};function re(o,d){var h,y=o.G;if(y)for(h=[];y;y=y.G)h.push(y);if(o=o.M,y=d.type||d,typeof d=="string")d=new C(d,o);else if(d instanceof C)d.target=d.target||o;else{var k=d;d=new C(y,o),at(d,k)}k=!0;let O,Y;if(h)for(Y=h.length-1;Y>=0;Y--)O=d.g=h[Y],k=je(O,y,!0,d)&&k;if(O=d.g=o,k=je(O,y,!0,d)&&k,k=je(O,y,!1,d)&&k,h)for(Y=0;Y<h.length;Y++)O=d.g=h[Y],k=je(O,y,!1,d)&&k}ge.prototype.N=function(){if(ge.Z.N.call(this),this.i){var o=this.i;for(let d in o.g){let h=o.g[d];for(let y=0;y<h.length;y++)P(h[y]);delete o.g[d],o.h--}}this.G=null},ge.prototype.J=function(o,d,h,y){return this.i.add(String(o),d,!1,h,y)},ge.prototype.K=function(o,d,h,y){return this.i.add(String(o),d,!0,h,y)};function je(o,d,h,y){if(d=o.i.g[String(d)],!d)return!0;d=d.concat();let k=!0;for(let O=0;O<d.length;++O){let Y=d[O];if(Y&&!Y.da&&Y.capture==h){let Ie=Y.listener,Wt=Y.ha||Y.src;Y.fa&&Qe(o.i,Y),k=Ie.call(Wt,y)!==!1&&k}}return k&&!y.defaultPrevented}function $e(o,d){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=c(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:i.setTimeout(o,d||0)}function Ke(o){o.g=$e(()=>{o.g=null,o.i&&(o.i=!1,Ke(o))},o.l);let d=o.h;o.h=null,o.m.apply(null,d)}class et extends b{constructor(d,h){super(),this.m=d,this.l=h,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:Ke(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function _e(o){b.call(this),this.h=o,this.g={}}m(_e,b);var we=[];function dt(o){N(o.g,function(d,h){this.g.hasOwnProperty(h)&&J(d)},o),o.g={}}_e.prototype.N=function(){_e.Z.N.call(this),dt(this)},_e.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Be=i.JSON.stringify,cn=i.JSON.parse,Tt=class{stringify(o){return i.JSON.stringify(o,void 0)}parse(o){return i.JSON.parse(o,void 0)}};function It(){}function tt(){}var bt={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function wt(){C.call(this,"d")}m(wt,C);function Jt(){C.call(this,"c")}m(Jt,C);var qe={},Ce=null;function rt(){return Ce=Ce||new ge}qe.Ia="serverreachability";function An(o){C.call(this,qe.Ia,o)}m(An,C);function ft(o){let d=rt();re(d,new An(d))}qe.STAT_EVENT="statevent";function fr(o,d){C.call(this,qe.STAT_EVENT,o),this.stat=d}m(fr,C);function _t(o){let d=rt();re(d,new fr(d,o))}qe.Ja="timingevent";function xn(o,d){C.call(this,qe.Ja,o),this.size=d}m(xn,C);function Oa(o,d){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){o()},d)}function jn(){this.g=!0}jn.prototype.ua=function(){this.g=!1};function dn(o,d,h,y,k,O){o.info(function(){if(o.g)if(O){var Y="",Ie=O.split("&");for(let Je=0;Je<Ie.length;Je++){var Wt=Ie[Je].split("=");if(Wt.length>1){let Zt=Wt[0];Wt=Wt[1];let Ua=Zt.split("_");Y=Ua.length>=2&&Ua[1]=="type"?Y+(Zt+"="+Wt+"&"):Y+(Zt+"=redacted&")}}}else Y=null;else Y=O;return"XMLHTTP REQ ("+y+") [attempt "+k+"]: "+d+`
`+h+`
`+Y})}function Uu(o,d,h,y,k,O,Y){o.info(function(){return"XMLHTTP RESP ("+y+") [ attempt "+k+"]: "+d+`
`+h+`
`+O+" "+Y})}function hr(o,d,h,y){o.info(function(){return"XMLHTTP TEXT ("+d+"): "+Bu(o,h)+(y?" "+y:"")})}function dd(o,d){o.info(function(){return"TIMEOUT: "+d})}jn.prototype.info=function(){};function Bu(o,d){if(!o.g)return d;if(!d)return null;try{let O=JSON.parse(d);if(O){for(o=0;o<O.length;o++)if(Array.isArray(O[o])){var h=O[o];if(!(h.length<2)){var y=h[1];if(Array.isArray(y)&&!(y.length<1)){var k=y[0];if(k!="noop"&&k!="stop"&&k!="close")for(let Y=1;Y<y.length;Y++)y[Y]=""}}}}return Be(O)}catch{return d}}var ts={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Hi={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},ns;function as(){}m(as,It),as.prototype.g=function(){return new XMLHttpRequest},ns=new as;function Ma(o){return encodeURIComponent(String(o))}function qu(o){var d=1;o=o.split(":");let h=[];for(;d>0&&o.length;)h.push(o.shift()),d--;return o.length&&h.push(o.join(":")),h}function oa(o,d,h,y){this.j=o,this.i=d,this.l=h,this.S=y||1,this.V=new _e(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new zi}function zi(){this.i=null,this.g="",this.h=!1}var Gi={},ji={};function Ki(o,d,h){o.M=1,o.A=Js(Kn(d)),o.u=h,o.R=!0,Hu(o,null)}function Hu(o,d){o.F=Date.now(),Ea(o),o.B=Kn(o.A);var h=o.B,y=o.S;Array.isArray(y)||(y=[String(y)]),ye(h.i,"t",y),o.C=0,h=o.j.L,o.h=new zi,o.g=aE(o.j,h?d:null,!o.u),o.P>0&&(o.O=new et(c(o.Y,o,o.g),o.P)),d=o.V,h=o.g,y=o.ba;var k="readystatechange";Array.isArray(k)||(k&&(we[0]=k.toString()),k=we);for(let O=0;O<k.length;O++){let Y=Sn(h,k[O],y||d.handleEvent,!1,d.h||d);if(!Y)break;d.g[Y.key]=Y}d=o.J?Q(o.J):{},o.u?(o.v||(o.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,d)):(o.v="GET",o.g.ea(o.B,o.v,null,d)),ft(),dn(o.i,o.v,o.B,o.l,o.S,o.u)}oa.prototype.ba=function(o){o=o.target;let d=this.O;d&&ds(o)==3?d.j():this.Y(o)},oa.prototype.Y=function(o){try{if(o==this.g)e:{let Ie=ds(this.g),Wt=this.g.ya(),Je=this.g.ca();if(!(Ie<3)&&(Ie!=3||this.g&&(this.h.h||this.g.la()||Kv(this.g)))){this.K||Ie!=4||Wt==7||(Wt==8||Je<=0?ft(3):ft(2)),Wi(this);var d=this.g.ca();this.X=d;var h=Na(this);if(this.o=d==200,Uu(this.i,this.v,this.B,this.l,this.S,Ie,d),this.o){if(this.U&&!this.L){t:{if(this.g){var y,k=this.g;if((y=k.g?k.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!T(y)){var O=y;break t}}O=null}if(o=O)hr(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Yi(this,o);else{this.o=!1,this.m=3,_t(12),Fa(this),Va(this);break e}}if(this.R){o=!0;let Zt;for(;!this.K&&this.C<h.length;)if(Zt=va(this,h),Zt==ji){Ie==4&&(this.m=4,_t(14),o=!1),hr(this.i,this.l,null,"[Incomplete Response]");break}else if(Zt==Gi){this.m=4,_t(15),hr(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else hr(this.i,this.l,Zt,null),Yi(this,Zt);if(En(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Ie!=4||h.length!=0||this.h.h||(this.m=1,_t(16),o=!1),this.o=this.o&&o,!o)hr(this.i,this.l,h,"[Invalid Chunked Response]"),Fa(this),Va(this);else if(h.length>0&&!this.W){this.W=!0;var Y=this.j;Y.g==this&&Y.aa&&!Y.P&&(Y.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),cm(Y),Y.P=!0,_t(11))}}else hr(this.i,this.l,h,null),Yi(this,h);Ie==4&&Fa(this),this.o&&!this.K&&(Ie==4?Zv(this.j,this):(this.o=!1,Ea(this)))}else Mk(this.g),d==400&&h.indexOf("Unknown SID")>0?(this.m=3,_t(12)):(this.m=0,_t(13)),Fa(this),Va(this)}}}catch{}finally{}};function Na(o){if(!En(o))return o.g.la();let d=Kv(o.g);if(d==="")return"";let h="",y=d.length,k=ds(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return Fa(o),Va(o),"";o.h.i=new i.TextDecoder}for(let O=0;O<y;O++)o.h.h=!0,h+=o.h.i.decode(d[O],{stream:!(k&&O==y-1)});return d.length=0,o.h.g+=h,o.C=0,o.h.g}function En(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function va(o,d){var h=o.C,y=d.indexOf(`
`,h);return y==-1?ji:(h=Number(d.substring(h,y)),isNaN(h)?Gi:(y+=1,y+h>d.length?ji:(d=d.slice(y,y+h),o.C=y+h,d)))}oa.prototype.cancel=function(){this.K=!0,Fa(this)};function Ea(o){o.T=Date.now()+o.H,Ta(o,o.H)}function Ta(o,d){if(o.D!=null)throw Error("WatchDog timer not null");o.D=Oa(c(o.aa,o),d)}function Wi(o){o.D&&(i.clearTimeout(o.D),o.D=null)}oa.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?(dd(this.i,this.B),this.M!=2&&(ft(),_t(17)),Fa(this),this.m=2,Va(this)):Ta(this,this.T-o)};function Va(o){o.j.I==0||o.K||Zv(o.j,o)}function Fa(o){Wi(o);var d=o.O;d&&typeof d.dispose=="function"&&d.dispose(),o.O=null,dt(o.V),o.g&&(d=o.g,o.g=null,d.abort(),d.dispose())}function Yi(o,d){try{var h=o.j;if(h.I!=0&&(h.g==o||ba(h.h,o))){if(!o.L&&ba(h.h,o)&&h.I==3){try{var y=h.Ba.g.parse(d)}catch{y=null}if(Array.isArray(y)&&y.length==3){var k=y;if(k[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)_d(h),yd(h);else break e;lm(h),_t(18)}}else h.xa=k[1],0<h.xa-h.K&&k[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=Oa(c(h.Va,h),6e3));ju(h.h)<=1&&h.ta&&(h.ta=void 0)}else Zs(h,11)}else if((o.L||h.g==o)&&_d(h),!T(d))for(k=h.Ba.g.parse(d),d=0;d<k.length;d++){let Je=k[d],Zt=Je[0];if(!(Zt<=h.K))if(h.K=Zt,Je=Je[1],h.I==2)if(Je[0]=="c"){h.M=Je[1],h.ba=Je[2];let Ua=Je[3];Ua!=null&&(h.ka=Ua,h.j.info("VER="+h.ka));let ei=Je[4];ei!=null&&(h.za=ei,h.j.info("SVER="+h.za));let fs=Je[5];fs!=null&&typeof fs=="number"&&fs>0&&(y=1.5*fs,h.O=y,h.j.info("backChannelRequestTimeoutMs_="+y)),y=h;let hs=o.g;if(hs){let vd=hs.g?hs.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(vd){var O=y.h;O.g||vd.indexOf("spdy")==-1&&vd.indexOf("quic")==-1&&vd.indexOf("h2")==-1||(O.j=O.l,O.g=new Set,O.h&&(Xi(O,O.h),O.h=null))}if(y.G){let dm=hs.g?hs.g.getResponseHeader("X-HTTP-Session-Id"):null;dm&&(y.wa=dm,We(y.J,y.G,dm))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),y=h;var Y=o;if(y.na=nE(y,y.L?y.ba:null,y.W),Y.L){Ku(y.h,Y);var Ie=Y,Wt=y.O;Wt&&(Ie.H=Wt),Ie.D&&(Wi(Ie),Ea(Ie)),y.g=Y}else $v(y);h.i.length>0&&Id(h)}else Je[0]!="stop"&&Je[0]!="close"||Zs(h,7);else h.I==3&&(Je[0]=="stop"||Je[0]=="close"?Je[0]=="stop"?Zs(h,7):um(h):Je[0]!="noop"&&h.l&&h.l.qa(Je),h.A=0)}}ft(4)}catch{}}var fd=class{constructor(o,d){this.g=o,this.map=d}};function zu(o){this.l=o||10,i.PerformanceNavigationTiming?(o=i.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Gu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function ju(o){return o.h?1:o.g?o.g.size:0}function ba(o,d){return o.h?o.h==d:o.g?o.g.has(d):!1}function Xi(o,d){o.g?o.g.add(d):o.h=d}function Ku(o,d){o.h&&o.h==d?o.h=null:o.g&&o.g.has(d)&&o.g.delete(d)}zu.prototype.cancel=function(){if(this.i=Wu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function Wu(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let d=o.i;for(let h of o.g.values())d=d.concat(h.G);return d}return S(o.i)}var rs=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function hd(o,d){if(o){o=o.split("&");for(let h=0;h<o.length;h++){let y=o[h].indexOf("="),k,O=null;y>=0?(k=o[h].substring(0,y),O=o[h].substring(y+1)):k=o[h],d(k,O?decodeURIComponent(O.replace(/\+/g," ")):"")}}}function wa(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;o instanceof wa?(this.l=o.l,ss(this,o.j),this.o=o.o,this.g=o.g,is(this,o.u),this.h=o.h,Qi(this,Ot(o.i)),this.m=o.m):o&&(d=String(o).match(rs))?(this.l=!1,ss(this,d[1]||"",!0),this.o=os(d[2]||""),this.g=os(d[3]||"",!0),is(this,d[4]),this.h=os(d[5]||"",!0),Qi(this,d[6]||"",!0),this.m=os(d[7]||"")):(this.l=!1,this.i=new K(null,this.l))}wa.prototype.toString=function(){let o=[];var d=this.j;d&&o.push(us(d,$i,!0),":");var h=this.g;return(h||d=="file")&&(o.push("//"),(d=this.o)&&o.push(us(d,$i,!0),"@"),o.push(Ma(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(us(h,h.charAt(0)=="/"?im:sm,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",us(h,j)),o.join("")},wa.prototype.resolve=function(o){let d=Kn(this),h=!!o.j;h?ss(d,o.j):h=!!o.o,h?d.o=o.o:h=!!o.g,h?d.g=o.g:h=o.u!=null;var y=o.h;if(h)is(d,o.u);else if(h=!!o.h){if(y.charAt(0)!="/")if(this.g&&!this.h)y="/"+y;else{var k=d.h.lastIndexOf("/");k!=-1&&(y=d.h.slice(0,k+1)+y)}if(k=y,k==".."||k==".")y="";else if(k.indexOf("./")!=-1||k.indexOf("/.")!=-1){y=k.lastIndexOf("/",0)==0,k=k.split("/");let O=[];for(let Y=0;Y<k.length;){let Ie=k[Y++];Ie=="."?y&&Y==k.length&&O.push(""):Ie==".."?((O.length>1||O.length==1&&O[0]!="")&&O.pop(),y&&Y==k.length&&O.push("")):(O.push(Ie),y=!0)}y=O.join("/")}else y=k}return h?d.h=y:h=o.i.toString()!=="",h?Qi(d,Ot(o.i)):h=!!o.m,h&&(d.m=o.m),d};function Kn(o){return new wa(o)}function ss(o,d,h){o.j=h?os(d,!0):d,o.j&&(o.j=o.j.replace(/:$/,""))}function is(o,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);o.u=d}else o.u=null}function Qi(o,d,h){d instanceof K?(o.i=d,xk(o.i,o.l)):(h||(d=us(d,B)),o.i=new K(d,o.l))}function We(o,d,h){o.i.set(d,h)}function Js(o){return We(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function os(o,d){return o?d?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function us(o,d,h){return typeof o=="string"?(o=encodeURI(o).replace(d,rm),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function rm(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var $i=/[#\/\?@]/g,sm=/[#\?:]/g,im=/[#\?]/g,B=/[#\?@]/g,j=/#/g;function K(o,d){this.h=this.g=null,this.i=o||null,this.j=!!d}function Z(o){o.g||(o.g=new Map,o.h=0,o.i&&hd(o.i,function(d,h){o.add(decodeURIComponent(d.replace(/\+/g," ")),h)}))}t=K.prototype,t.add=function(o,d){Z(this),this.i=null,o=ls(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(d),this.h+=1,this};function ue(o,d){Z(o),d=ls(o,d),o.g.has(d)&&(o.i=null,o.h-=o.g.get(d).length,o.g.delete(d))}function Me(o,d){return Z(o),d=ls(o,d),o.g.has(d)}t.forEach=function(o,d){Z(this),this.g.forEach(function(h,y){h.forEach(function(k){o.call(d,k,y,this)},this)},this)};function ie(o,d){Z(o);let h=[];if(typeof d=="string")Me(o,d)&&(h=h.concat(o.g.get(ls(o,d))));else for(o=Array.from(o.g.values()),d=0;d<o.length;d++)h=h.concat(o[d]);return h}t.set=function(o,d){return Z(this),this.i=null,o=ls(this,o),Me(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[d]),this.h+=1,this},t.get=function(o,d){return o?(o=ie(this,o),o.length>0?String(o[0]):d):d};function ye(o,d,h){ue(o,d),h.length>0&&(o.i=null,o.g.set(ls(o,d),S(h)),o.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],d=Array.from(this.g.keys());for(let y=0;y<d.length;y++){var h=d[y];let k=Ma(h);h=ie(this,h);for(let O=0;O<h.length;O++){let Y=k;h[O]!==""&&(Y+="="+Ma(h[O])),o.push(Y)}}return this.i=o.join("&")};function Ot(o){let d=new K;return d.i=o.i,o.g&&(d.g=new Map(o.g),d.h=o.h),d}function ls(o,d){return d=String(d),o.j&&(d=d.toLowerCase()),d}function xk(o,d){d&&!o.j&&(Z(o),o.i=null,o.g.forEach(function(h,y){let k=y.toLowerCase();y!=k&&(ue(this,y),ye(this,k,h))},o)),o.j=d}function Rk(o,d){let h=new jn;if(i.Image){let y=new Image;y.onload=f(cs,h,"TestLoadImage: loaded",!0,d,y),y.onerror=f(cs,h,"TestLoadImage: error",!1,d,y),y.onabort=f(cs,h,"TestLoadImage: abort",!1,d,y),y.ontimeout=f(cs,h,"TestLoadImage: timeout",!1,d,y),i.setTimeout(function(){y.ontimeout&&y.ontimeout()},1e4),y.src=o}else d(!1)}function kk(o,d){let h=new jn,y=new AbortController,k=setTimeout(()=>{y.abort(),cs(h,"TestPingServer: timeout",!1,d)},1e4);fetch(o,{signal:y.signal}).then(O=>{clearTimeout(k),O.ok?cs(h,"TestPingServer: ok",!0,d):cs(h,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(k),cs(h,"TestPingServer: error",!1,d)})}function cs(o,d,h,y,k){try{k&&(k.onload=null,k.onerror=null,k.onabort=null,k.ontimeout=null),y(h)}catch{}}function Dk(){this.g=new Tt}function pd(o){this.i=o.Sb||null,this.h=o.ab||!1}m(pd,It),pd.prototype.g=function(){return new md(this.i,this.h)};function md(o,d){ge.call(this),this.H=o,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(md,ge),t=md.prototype,t.open=function(o,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=d,this.readyState=1,Xu(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(d.body=o),(this.H||i).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Yu(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Xu(this)),this.g&&(this.readyState=3,Xu(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof i.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;qv(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function qv(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var d=o.value?o.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!o.done}))&&(this.response=this.responseText+=d)}o.done?Yu(this):Xu(this),this.readyState==3&&qv(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,Yu(this))},t.Na=function(o){this.g&&(this.response=o,Yu(this))},t.ga=function(){this.g&&Yu(this)};function Yu(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Xu(o)}t.setRequestHeader=function(o,d){this.A.append(o,d)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],d=this.h.entries();for(var h=d.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=d.next();return o.join(`\r
`)};function Xu(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(md.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Hv(o){let d="";return N(o,function(h,y){d+=y,d+=":",d+=h,d+=`\r
`}),d}function om(o,d,h){e:{for(y in h){var y=!1;break e}y=!0}y||(h=Hv(h),typeof o=="string"?h!=null&&Ma(h):We(o,d,h))}function Ct(o){ge.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(Ct,ge);var Pk=/^https?$/i,Ok=["POST","PUT"];t=Ct.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,d,h,y){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);d=d?d.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():ns.g(),this.g.onreadystatechange=p(c(this.Ca,this));try{this.B=!0,this.g.open(d,String(o),!0),this.B=!1}catch(O){zv(this,O);return}if(o=h||"",h=new Map(this.headers),y)if(Object.getPrototypeOf(y)===Object.prototype)for(var k in y)h.set(k,y[k]);else if(typeof y.keys=="function"&&typeof y.get=="function")for(let O of y.keys())h.set(O,y.get(O));else throw Error("Unknown input type for opt_headers: "+String(y));y=Array.from(h.keys()).find(O=>O.toLowerCase()=="content-type"),k=i.FormData&&o instanceof i.FormData,!(Array.prototype.indexOf.call(Ok,d,void 0)>=0)||y||k||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[O,Y]of h)this.g.setRequestHeader(O,Y);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(O){zv(this,O)}};function zv(o,d){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=d,o.o=5,Gv(o),gd(o)}function Gv(o){o.A||(o.A=!0,re(o,"complete"),re(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,re(this,"complete"),re(this,"abort"),gd(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),gd(this,!0)),Ct.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?jv(this):this.Xa())},t.Xa=function(){jv(this)};function jv(o){if(o.h&&typeof s<"u"){if(o.v&&ds(o)==4)setTimeout(o.Ca.bind(o),0);else if(re(o,"readystatechange"),ds(o)==4){o.h=!1;try{let O=o.ca();e:switch(O){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var h;if(!(h=d)){var y;if(y=O===0){let Y=String(o.D).match(rs)[1]||null;!Y&&i.self&&i.self.location&&(Y=i.self.location.protocol.slice(0,-1)),y=!Pk.test(Y?Y.toLowerCase():"")}h=y}if(h)re(o,"complete"),re(o,"success");else{o.o=6;try{var k=ds(o)>2?o.g.statusText:""}catch{k=""}o.l=k+" ["+o.ca()+"]",Gv(o)}}finally{gd(o)}}}}function gd(o,d){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let h=o.g;o.g=null,d||re(o,"ready");try{h.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function ds(o){return o.g?o.g.readyState:0}t.ca=function(){try{return ds(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var d=this.g.responseText;return o&&d.indexOf(o)==0&&(d=d.substring(o.length)),cn(d)}};function Kv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Mk(o){let d={};o=(o.g&&ds(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let y=0;y<o.length;y++){if(T(o[y]))continue;var h=qu(o[y]);let k=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();let O=d[k]||[];d[k]=O,O.push(h)}W(d,function(y){return y.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Qu(o,d,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||d}function Wv(o){this.za=0,this.i=[],this.j=new jn,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Qu("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Qu("baseRetryDelayMs",5e3,o),this.Za=Qu("retryDelaySeedMs",1e4,o),this.Ta=Qu("forwardChannelMaxRetries",2,o),this.va=Qu("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new zu(o&&o.concurrentRequestLimit),this.Ba=new Dk,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=Wv.prototype,t.ka=8,t.I=1,t.connect=function(o,d,h,y){_t(0),this.W=o,this.H=d||{},h&&y!==void 0&&(this.H.OSID=h,this.H.OAID=y),this.F=this.X,this.J=nE(this,null,this.W),Id(this)};function um(o){if(Yv(o),o.I==3){var d=o.V++,h=Kn(o.J);if(We(h,"SID",o.M),We(h,"RID",d),We(h,"TYPE","terminate"),$u(o,h),d=new oa(o,o.j,d),d.M=2,d.A=Js(Kn(h)),h=!1,i.navigator&&i.navigator.sendBeacon)try{h=i.navigator.sendBeacon(d.A.toString(),"")}catch{}!h&&i.Image&&(new Image().src=d.A,h=!0),h||(d.g=aE(d.j,null),d.g.ea(d.A)),d.F=Date.now(),Ea(d)}tE(o)}function yd(o){o.g&&(cm(o),o.g.cancel(),o.g=null)}function Yv(o){yd(o),o.v&&(i.clearTimeout(o.v),o.v=null),_d(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&i.clearTimeout(o.m),o.m=null)}function Id(o){if(!Gu(o.h)&&!o.m){o.m=!0;var d=o.Ea;q||g(),z||(q(),z=!0),v.add(d,o),o.D=0}}function Nk(o,d){return ju(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=d.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=Oa(c(o.Ea,o,d),eE(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let k=new oa(this,this.j,o),O=this.o;if(this.U&&(O?(O=Q(O),at(O,this.U)):O=this.U),this.u!==null||this.R||(k.J=O,O=null),this.S)e:{for(var d=0,h=0;h<this.i.length;h++){t:{var y=this.i[h];if("__data__"in y.map&&(y=y.map.__data__,typeof y=="string")){y=y.length;break t}y=void 0}if(y===void 0)break;if(d+=y,d>4096){d=h;break e}if(d===4096||h===this.i.length-1){d=h+1;break e}}d=1e3}else d=1e3;d=Qv(this,k,d),h=Kn(this.J),We(h,"RID",o),We(h,"CVER",22),this.G&&We(h,"X-HTTP-Session-Id",this.G),$u(this,h),O&&(this.R?d="headers="+Ma(Hv(O))+"&"+d:this.u&&om(h,this.u,O)),Xi(this.h,k),this.Ra&&We(h,"TYPE","init"),this.S?(We(h,"$req",d),We(h,"SID","null"),k.U=!0,Ki(k,h,null)):Ki(k,h,d),this.I=2}}else this.I==3&&(o?Xv(this,o):this.i.length==0||Gu(this.h)||Xv(this))};function Xv(o,d){var h;d?h=d.l:h=o.V++;let y=Kn(o.J);We(y,"SID",o.M),We(y,"RID",h),We(y,"AID",o.K),$u(o,y),o.u&&o.o&&om(y,o.u,o.o),h=new oa(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),d&&(o.i=d.G.concat(o.i)),d=Qv(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Xi(o.h,h),Ki(h,y,d)}function $u(o,d){o.H&&N(o.H,function(h,y){We(d,y,h)}),o.l&&N({},function(h,y){We(d,y,h)})}function Qv(o,d,h){h=Math.min(o.i.length,h);let y=o.l?c(o.l.Ka,o.l,o):null;e:{var k=o.i;let Ie=-1;for(;;){let Wt=["count="+h];Ie==-1?h>0?(Ie=k[0].g,Wt.push("ofs="+Ie)):Ie=0:Wt.push("ofs="+Ie);let Je=!0;for(let Zt=0;Zt<h;Zt++){var O=k[Zt].g;let Ua=k[Zt].map;if(O-=Ie,O<0)Ie=Math.max(0,k[Zt].g-100),Je=!1;else try{O="req"+O+"_"||"";try{var Y=Ua instanceof Map?Ua:Object.entries(Ua);for(let[ei,fs]of Y){let hs=fs;u(fs)&&(hs=Be(fs)),Wt.push(O+ei+"="+encodeURIComponent(hs))}}catch(ei){throw Wt.push(O+"type="+encodeURIComponent("_badmap")),ei}}catch{y&&y(Ua)}}if(Je){Y=Wt.join("&");break e}}Y=void 0}return o=o.i.splice(0,h),d.G=o,Y}function $v(o){if(!o.g&&!o.v){o.Y=1;var d=o.Da;q||g(),z||(q(),z=!0),v.add(d,o),o.A=0}}function lm(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=Oa(c(o.Da,o),eE(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,Jv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=Oa(c(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,_t(10),yd(this),Jv(this))};function cm(o){o.B!=null&&(i.clearTimeout(o.B),o.B=null)}function Jv(o){o.g=new oa(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var d=Kn(o.na);We(d,"RID","rpc"),We(d,"SID",o.M),We(d,"AID",o.K),We(d,"CI",o.F?"0":"1"),!o.F&&o.ia&&We(d,"TO",o.ia),We(d,"TYPE","xmlhttp"),$u(o,d),o.u&&o.o&&om(d,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=Js(Kn(d)),h.u=null,h.R=!0,Hu(h,o)}t.Va=function(){this.C!=null&&(this.C=null,yd(this),lm(this),_t(19))};function _d(o){o.C!=null&&(i.clearTimeout(o.C),o.C=null)}function Zv(o,d){var h=null;if(o.g==d){_d(o),cm(o),o.g=null;var y=2}else if(ba(o.h,d))h=d.G,Ku(o.h,d),y=1;else return;if(o.I!=0){if(d.o)if(y==1){h=d.u?d.u.length:0,d=Date.now()-d.F;var k=o.D;y=rt(),re(y,new xn(y,h)),Id(o)}else $v(o);else if(k=d.m,k==3||k==0&&d.X>0||!(y==1&&Nk(o,d)||y==2&&lm(o)))switch(h&&h.length>0&&(d=o.h,d.i=d.i.concat(h)),k){case 1:Zs(o,5);break;case 4:Zs(o,10);break;case 3:Zs(o,6);break;default:Zs(o,2)}}}function eE(o,d){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*d}function Zs(o,d){if(o.j.info("Error code "+d),d==2){var h=c(o.bb,o),y=o.Ua;let k=!y;y=new wa(y||"//www.google.com/images/cleardot.gif"),i.location&&i.location.protocol=="http"||ss(y,"https"),Js(y),k?Rk(y.toString(),h):kk(y.toString(),h)}else _t(2);o.I=0,o.l&&o.l.pa(d),tE(o),Yv(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),_t(2)):(this.j.info("Failed to ping google.com"),_t(1))};function tE(o){if(o.I=0,o.ja=[],o.l){let d=Wu(o.h);(d.length!=0||o.i.length!=0)&&(R(o.ja,d),R(o.ja,o.i),o.h.i.length=0,S(o.i),o.i.length=0),o.l.oa()}}function nE(o,d,h){var y=h instanceof wa?Kn(h):new wa(h);if(y.g!="")d&&(y.g=d+"."+y.g),is(y,y.u);else{var k=i.location;y=k.protocol,d=d?d+"."+k.hostname:k.hostname,k=+k.port;let O=new wa(null);y&&ss(O,y),d&&(O.g=d),k&&is(O,k),h&&(O.h=h),y=O}return h=o.G,d=o.wa,h&&d&&We(y,h,d),We(y,"VER",o.ka),$u(o,y),y}function aE(o,d,h){if(d&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=o.Aa&&!o.ma?new Ct(new pd({ab:h})):new Ct(o.ma),d.Fa(o.L),d}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function rE(){}t=rE.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function Sd(){}Sd.prototype.g=function(o,d){return new Wn(o,d)};function Wn(o,d){ge.call(this),this.g=new Wv(d),this.l=o,this.h=d&&d.messageUrlParams||null,o=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(o?o["X-WebChannel-Content-Type"]=d.messageContentType:o={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(o?o["X-WebChannel-Client-Profile"]=d.sa:o={"X-WebChannel-Client-Profile":d.sa}),this.g.U=o,(o=d&&d.Qb)&&!T(o)&&(this.g.u=o),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!T(d)&&(this.g.G=d,o=this.h,o!==null&&d in o&&(o=this.h,d in o&&delete o[d])),this.j=new Ji(this)}m(Wn,ge),Wn.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Wn.prototype.close=function(){um(this.g)},Wn.prototype.o=function(o){var d=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=Be(o),o=h);d.i.push(new fd(d.Ya++,o)),d.I==3&&Id(d)},Wn.prototype.N=function(){this.g.l=null,delete this.j,um(this.g),delete this.g,Wn.Z.N.call(this)};function sE(o){wt.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var d=o.__sm__;if(d){e:{for(let h in d){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,d=d!==null&&o in d?d[o]:void 0),this.data=d}else this.data=o}m(sE,wt);function iE(){Jt.call(this),this.status=1}m(iE,Jt);function Ji(o){this.g=o}m(Ji,rE),Ji.prototype.ra=function(){re(this.g,"a")},Ji.prototype.qa=function(o){re(this.g,new sE(o))},Ji.prototype.pa=function(o){re(this.g,new iE)},Ji.prototype.oa=function(){re(this.g,"b")},Sd.prototype.createWebChannel=Sd.prototype.g,Wn.prototype.send=Wn.prototype.o,Wn.prototype.open=Wn.prototype.m,Wn.prototype.close=Wn.prototype.close,m_=Ur.createWebChannelTransport=function(){return new Sd},p_=Ur.getStatEventTarget=function(){return rt()},h_=Ur.Event=qe,jh=Ur.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ts.NO_ERROR=0,ts.TIMEOUT=8,ts.HTTP_ERROR=6,Sc=Ur.ErrorCode=ts,Hi.COMPLETE="complete",f_=Ur.EventType=Hi,tt.EventType=bt,bt.OPEN="a",bt.CLOSE="b",bt.ERROR="c",bt.MESSAGE="d",ge.prototype.listen=ge.prototype.J,tu=Ur.WebChannel=tt,b2=Ur.FetchXmlHttpFactory=pd,Ct.prototype.listenOnce=Ct.prototype.K,Ct.prototype.getLastError=Ct.prototype.Ha,Ct.prototype.getLastErrorCode=Ct.prototype.ya,Ct.prototype.getStatus=Ct.prototype.ca,Ct.prototype.getResponseJson=Ct.prototype.La,Ct.prototype.getResponseText=Ct.prototype.la,Ct.prototype.send=Ct.prototype.ea,Ct.prototype.setWithCredentials=Ct.prototype.Fa,d_=Ur.XhrIo=Ct}).apply(typeof Gh<"u"?Gh:typeof self<"u"?self:typeof window<"u"?window:{});var on=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};on.UNAUTHENTICATED=new on(null),on.GOOGLE_CREDENTIALS=new on("google-credentials-uid"),on.FIRST_PARTY=new on("first-party-uid"),on.MOCK_USER=new on("mock-user");var bu="12.10.0";function e0(t){bu=t}var Ni=new Hs("@firebase/firestore");function nu(){return Ni.logLevel}function $(t,...e){if(Ni.logLevel<=Ee.DEBUG){let n=e.map(zS);Ni.debug(`Firestore (${bu}): ${t}`,...n)}}function Hr(t,...e){if(Ni.logLevel<=Ee.ERROR){let n=e.map(zS);Ni.error(`Firestore (${bu}): ${t}`,...n)}}function zr(t,...e){if(Ni.logLevel<=Ee.WARN){let n=e.map(zS);Ni.warn(`Firestore (${bu}): ${t}`,...n)}}function zS(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}function oe(t,e,n){let a="Unexpected state";typeof e=="string"?a=e:n=e,t0(t,a,n)}function t0(t,e,n){let a=`FIRESTORE (${bu}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{a+=" CONTEXT: "+JSON.stringify(n)}catch{a+=" CONTEXT: "+n}throw Hr(a),new Error(a)}function St(t,e,n,a){let r="Unexpected state";typeof n=="string"?r=n:a=n,t||t0(e,r,a)}function Pe(t,e){return t}var H={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},X=class extends Pn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var Br=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};var $h=class{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Jh=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(on.UNAUTHENTICATED))}shutdown(){}},E_=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}},Zh=class{constructor(e){this.t=e,this.currentUser=on.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){St(this.o===void 0,42304);let a=this.i,r=l=>this.i!==a?(a=this.i,n(l)):Promise.resolve(),s=new Br;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Br,e.enqueueRetryable(()=>r(this.currentUser))};let i=()=>{let l=s;e.enqueueRetryable(async()=>{await l.promise,await r(this.currentUser)})},u=l=>{$("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){let l=this.t.getImmediate({optional:!0});l?u(l):($("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Br)}},0),i()}getToken(){let e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(a=>this.i!==e?($("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):a?(St(typeof a.accessToken=="string",31837,{l:a}),new $h(a.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return St(e===null||typeof e=="string",2055,{h:e}),new on(e)}},T_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a,this.type="FirstParty",this.user=on.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},b_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a}getToken(){return Promise.resolve(new T_(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(on.FIRST_PARTY))}shutdown(){}invalidateToken(){}},ep=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},tp=class{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,zn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){St(this.o===void 0,3512);let a=s=>{s.error!=null&&$("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);let i=s.token!==this.m;return this.m=s.token,$("FirebaseAppCheckTokenProvider",`Received ${i?"new":"existing"} token.`),i?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>a(s))};let r=s=>{$("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>r(s)),setTimeout(()=>{if(!this.appCheck){let s=this.V.getImmediate({optional:!0});s?r(s):$("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new ep(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(St(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new ep(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function w2(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let a=0;a<t;a++)n[a]=Math.floor(256*Math.random());return n}var cu=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516),a="";for(;a.length<20;){let r=w2(40);for(let s=0;s<r.length;++s)a.length<20&&r[s]<n&&(a+=e.charAt(r[s]%62))}return a}};function Re(t,e){return t<e?-1:t>e?1:0}function w_(t,e){let n=Math.min(t.length,e.length);for(let a=0;a<n;a++){let r=t.charAt(a),s=e.charAt(a);if(r!==s)return g_(r)===g_(s)?Re(r,s):g_(r)?1:-1}return Re(t.length,e.length)}var C2=55296,L2=57343;function g_(t){let e=t.charCodeAt(0);return e>=C2&&e<=L2}function du(t,e,n){return t.length===e.length&&t.every((a,r)=>n(a,e[r]))}var mx="__name__",np=class t{constructor(e,n,a){n===void 0?n=0:n>e.length&&oe(637,{offset:n,range:e.length}),a===void 0?a=e.length-n:a>e.length-n&&oe(1746,{length:a,range:e.length-n}),this.segments=e,this.offset=n,this.len=a}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let n=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(a=>{n.push(a)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,a=this.limit();n<a;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){let a=Math.min(e.length,n.length);for(let r=0;r<a;r++){let s=t.compareSegments(e.get(r),n.get(r));if(s!==0)return s}return Re(e.length,n.length)}static compareSegments(e,n){let a=t.isNumericId(e),r=t.isNumericId(n);return a&&!r?-1:!a&&r?1:a&&r?t.extractNumericId(e).compare(t.extractNumericId(n)):w_(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Fr.fromString(e.substring(4,e.length-2))}},yt=class t extends np{construct(e,n,a){return new t(e,n,a)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let n=[];for(let a of e){if(a.indexOf("//")>=0)throw new X(H.INVALID_ARGUMENT,`Invalid segment (${a}). Paths must not contain // in them.`);n.push(...a.split("/").filter(r=>r.length>0))}return new t(n)}static emptyPath(){return new t([])}},A2=/^[_a-zA-Z][_a-zA-Z0-9]*$/,sa=class t extends np{construct(e,n,a){return new t(e,n,a)}static isValidIdentifier(e){return A2.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===mx}static keyField(){return new t([mx])}static fromServerFormat(e){let n=[],a="",r=0,s=()=>{if(a.length===0)throw new X(H.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(a),a=""},i=!1;for(;r<e.length;){let u=e[r];if(u==="\\"){if(r+1===e.length)throw new X(H.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new X(H.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);a+=l,r+=2}else u==="`"?(i=!i,r++):u!=="."||i?(a+=u,r++):(s(),r++)}if(s(),i)throw new X(H.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(n)}static emptyPath(){return new t([])}};var ne=class t{constructor(e){this.path=e}static fromPath(e){return new t(yt.fromString(e))}static fromName(e){return new t(yt.fromString(e).popFirst(5))}static empty(){return new t(yt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&yt.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return yt.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new yt(e.slice()))}};function x2(t,e,n){if(!n)throw new X(H.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function n0(t,e,n,a){if(e===!0&&a===!0)throw new X(H.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function gx(t){if(ne.isDocumentKey(t))throw new X(H.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function a0(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function Gc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(a){return a.constructor?a.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":oe(12329,{type:typeof t})}function jc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new X(H.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let n=Gc(t);throw new X(H.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function r0(t,e){if(e<=0)throw new X(H.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function Dt(t,e){let n={typeString:t};return e&&(n.value=e),n}function wu(t,e){if(!a0(t))throw new X(H.INVALID_ARGUMENT,"JSON must be an object");let n;for(let a in e)if(e[a]){let r=e[a].typeString,s="value"in e[a]?{value:e[a].value}:void 0;if(!(a in t)){n=`JSON missing required field: '${a}'`;break}let i=t[a];if(r&&typeof i!==r){n=`JSON field '${a}' must be a ${r}.`;break}if(s!==void 0&&i!==s.value){n=`Expected '${a}' field to equal '${s.value}'`;break}}if(n)throw new X(H.INVALID_ARGUMENT,n);return!0}var yx=-62135596800,Ix=1e6,qt=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let n=Math.floor(e/1e3),a=Math.floor((e-1e3*n)*Ix);return new t(n,a)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new X(H.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new X(H.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<yx)throw new X(H.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new X(H.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Ix}_compareTo(e){return this.seconds===e.seconds?Re(this.nanoseconds,e.nanoseconds):Re(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(wu(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-yx;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};qt._jsonSchemaVersion="firestore/timestamp/1.0",qt._jsonSchema={type:Dt("string",qt._jsonSchemaVersion),seconds:Dt("number"),nanoseconds:Dt("number")};var he=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new qt(0,0))}static max(){return new t(new qt(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var Cc=-1,ap=class{constructor(e,n,a,r){this.indexId=e,this.collectionGroup=n,this.fields=a,this.indexState=r}};ap.UNKNOWN_ID=-1;function R2(t,e){let n=t.toTimestamp().seconds,a=t.toTimestamp().nanoseconds+1,r=he.fromTimestamp(a===1e9?new qt(n+1,0):new qt(n,a));return new Vi(r,ne.empty(),e)}function k2(t){return new Vi(t.readTime,t.key,Cc)}var Vi=class t{constructor(e,n,a){this.readTime=e,this.documentKey=n,this.largestBatchId=a}static min(){return new t(he.min(),ne.empty(),Cc)}static max(){return new t(he.max(),ne.empty(),Cc)}};function D2(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ne.comparator(t.documentKey,e.documentKey),n!==0?n:Re(t.largestBatchId,e.largestBatchId))}var P2="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",C_=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function Ap(t){if(t.code!==H.FAILED_PRECONDITION||t.message!==P2)throw t;$("LocalStore","Unexpectedly lost primary lease")}var G=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&oe(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new t((a,r)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(a,r)},this.catchCallback=s=>{this.wrapFailure(n,s).next(a,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{let n=e();return n instanceof t?n:t.resolve(n)}catch(n){return t.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):t.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):t.reject(n)}static resolve(e){return new t((n,a)=>{n(e)})}static reject(e){return new t((n,a)=>{a(e)})}static waitFor(e){return new t((n,a)=>{let r=0,s=0,i=!1;e.forEach(u=>{++r,u.next(()=>{++s,i&&s===r&&n()},l=>a(l))}),i=!0,s===r&&n()})}static or(e){let n=t.resolve(!1);for(let a of e)n=n.next(r=>r?t.resolve(r):a());return n}static forEach(e,n){let a=[];return e.forEach((r,s)=>{a.push(n.call(this,r,s))}),this.waitFor(a)}static mapArray(e,n){return new t((a,r)=>{let s=e.length,i=new Array(s),u=0;for(let l=0;l<s;l++){let c=l;n(e[c]).next(f=>{i[c]=f,++u,u===s&&a(i)},f=>r(f))}})}static doWhile(e,n){return new t((a,r)=>{let s=()=>{e()===!0?n().next(()=>{s()},r):a()};s()})}};function O2(t){let e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Cu(t){return t.name==="IndexedDbTransactionError"}var fu=class{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=a=>this.ae(a),this.ue=a=>n.writeSequenceNumber(a))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};fu.ce=-1;var M2=-1;function xp(t){return t==null}function Lc(t){return t===0&&1/t==-1/0}function N2(t){return typeof t=="number"&&Number.isInteger(t)&&!Lc(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var s0="";function V2(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=_x(e)),e=F2(t.get(n),e);return _x(e)}function F2(t,e){let n=e,a=t.length;for(let r=0;r<a;r++){let s=t.charAt(r);switch(s){case"\0":n+="";break;case s0:n+="";break;default:n+=s}}return n}function _x(t){return t+s0+""}var U2="remoteDocuments",i0="owner";var o0="mutationQueues";var u0="mutations";var l0="documentMutations",B2="remoteDocumentsV14";var c0="remoteDocumentGlobal";var d0="targets";var f0="targetDocuments";var h0="targetGlobal",p0="collectionParents";var m0="clientMetadata";var g0="bundles";var y0="namedQueries";var q2="indexConfiguration";var H2="indexState";var z2="indexEntries";var I0="documentOverlays";var G2="globals";var j2=[o0,u0,l0,U2,d0,i0,h0,f0,m0,c0,p0,g0,y0],v4=[...j2,I0],K2=[o0,u0,l0,B2,d0,i0,h0,f0,m0,c0,p0,g0,y0,I0],W2=K2,Y2=[...W2,q2,H2,z2];var E4=[...Y2,G2];function Sx(t){let e=0;for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Lu(t,e){for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function _0(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var Pt=class t{constructor(e,n){this.comparator=e,this.root=n||nr.EMPTY}insert(e,n){return new t(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,nr.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,nr.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){let a=this.comparator(e,n.key);if(a===0)return n.value;a<0?n=n.left:a>0&&(n=n.right)}return null}indexOf(e){let n=0,a=this.root;for(;!a.isEmpty();){let r=this.comparator(e,a.key);if(r===0)return n+a.left.size;r<0?a=a.left:(n+=a.left.size+1,a=a.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,a)=>(e(n,a),!1))}toString(){let e=[];return this.inorderTraversal((n,a)=>(e.push(`${n}:${a}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new iu(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new iu(this.root,e,this.comparator,!1)}getReverseIterator(){return new iu(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new iu(this.root,e,this.comparator,!0)}},iu=class{constructor(e,n,a,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?a(e.key,n):1,n&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},nr=class t{constructor(e,n,a,r,s){this.key=e,this.value=n,this.color=a??t.RED,this.left=r??t.EMPTY,this.right=s??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,a,r,s){return new t(e??this.key,n??this.value,a??this.color,r??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,a){let r=this,s=a(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,n,a),null):s===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,a)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let a,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;a=r.right.min(),r=r.copy(a.key,a.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw oe(43730,{key:this.key,value:this.value});if(this.right.isRed())throw oe(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw oe(27949);return e+(this.isRed()?0:1)}};nr.EMPTY=null,nr.RED=!0,nr.BLACK=!1;nr.EMPTY=new class{constructor(){this.size=0}get key(){throw oe(57766)}get value(){throw oe(16141)}get color(){throw oe(16727)}get left(){throw oe(29726)}get right(){throw oe(36894)}copy(e,n,a,r,s){return this}insert(e,n,a){return new nr(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var un=class t{constructor(e){this.comparator=e,this.data=new Pt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,a)=>(e(n),!1))}forEachInRange(e,n){let a=this.data.getIteratorFrom(e[0]);for(;a.hasNext();){let r=a.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let a;for(a=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();a.hasNext();)if(!e(a.getNext().key))return}firstAfterOrEqual(e){let n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new rp(this.data.getIterator())}getIteratorFrom(e){return new rp(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(a=>{n=n.add(a)}),n}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.data.getIterator(),a=e.data.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(this.comparator(r,s)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(n=>{e.push(n)}),e}toString(){let e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){let n=new t(this.comparator);return n.data=e,n}},rp=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var ki=class t{constructor(e){this.fields=e,e.sort(sa.comparator)}static empty(){return new t([])}unionWith(e){let n=new un(sa.comparator);for(let a of this.fields)n=n.add(a);for(let a of e)n=n.add(a);return new t(n.toArray())}covers(e){for(let n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return du(this.fields,e.fields,(n,a)=>n.isEqual(a))}};var sp=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var yn=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let n=function(r){try{return atob(r)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new sp("Invalid base64 string: "+s):s}}(e);return new t(n)}static fromUint8Array(e){let n=function(r){let s="";for(let i=0;i<r.length;++i)s+=String.fromCharCode(r[i]);return s}(e);return new t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Re(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};yn.EMPTY_BYTE_STRING=new yn("");var X2=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Gr(t){if(St(!!t,39018),typeof t=="string"){let e=0,n=X2.exec(t);if(St(!!n,46558,{timestamp:t}),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}let a=new Date(t);return{seconds:Math.floor(a.getTime()/1e3),nanos:e}}return{seconds:gt(t.seconds),nanos:gt(t.nanos)}}function gt(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function jr(t){return typeof t=="string"?yn.fromBase64String(t):yn.fromUint8Array(t)}var S0="server_timestamp",v0="__type__",E0="__previous_value__",T0="__local_write_time__";function Kc(t){return(t?.mapValue?.fields||{})[v0]?.stringValue===S0}function Rp(t){let e=t.mapValue.fields[E0];return Kc(e)?Rp(e):e}function Ac(t){let e=Gr(t.mapValue.fields[T0].timestampValue);return new qt(e.seconds,e.nanos)}var L_=class{constructor(e,n,a,r,s,i,u,l,c,f,m){this.databaseId=e,this.appId=n,this.persistenceKey=a,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=c,this.isUsingEmulator=f,this.apiKey=m}},ip="(default)",xc=class t{constructor(e,n){this.projectId=e,this.database=n||ip}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===ip}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function b0(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new X(H.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new xc(t.options.projectId,e)}var GS="__type__",w0="__max__",Kh={mapValue:{fields:{__type__:{stringValue:w0}}}},jS="__vector__",hu="value";function Ks(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Kc(t)?4:L0(t)?9007199254740991:C0(t)?10:11:oe(28295,{value:t})}function ir(t,e){if(t===e)return!0;let n=Ks(t);if(n!==Ks(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Ac(t).isEqual(Ac(e));case 3:return function(r,s){if(typeof r.timestampValue=="string"&&typeof s.timestampValue=="string"&&r.timestampValue.length===s.timestampValue.length)return r.timestampValue===s.timestampValue;let i=Gr(r.timestampValue),u=Gr(s.timestampValue);return i.seconds===u.seconds&&i.nanos===u.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,s){return jr(r.bytesValue).isEqual(jr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,s){return gt(r.geoPointValue.latitude)===gt(s.geoPointValue.latitude)&&gt(r.geoPointValue.longitude)===gt(s.geoPointValue.longitude)}(t,e);case 2:return function(r,s){if("integerValue"in r&&"integerValue"in s)return gt(r.integerValue)===gt(s.integerValue);if("doubleValue"in r&&"doubleValue"in s){let i=gt(r.doubleValue),u=gt(s.doubleValue);return i===u?Lc(i)===Lc(u):isNaN(i)&&isNaN(u)}return!1}(t,e);case 9:return du(t.arrayValue.values||[],e.arrayValue.values||[],ir);case 10:case 11:return function(r,s){let i=r.mapValue.fields||{},u=s.mapValue.fields||{};if(Sx(i)!==Sx(u))return!1;for(let l in i)if(i.hasOwnProperty(l)&&(u[l]===void 0||!ir(i[l],u[l])))return!1;return!0}(t,e);default:return oe(52216,{left:t})}}function Rc(t,e){return(t.values||[]).find(n=>ir(n,e))!==void 0}function pu(t,e){if(t===e)return 0;let n=Ks(t),a=Ks(e);if(n!==a)return Re(n,a);switch(n){case 0:case 9007199254740991:return 0;case 1:return Re(t.booleanValue,e.booleanValue);case 2:return function(s,i){let u=gt(s.integerValue||s.doubleValue),l=gt(i.integerValue||i.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(t,e);case 3:return vx(t.timestampValue,e.timestampValue);case 4:return vx(Ac(t),Ac(e));case 5:return w_(t.stringValue,e.stringValue);case 6:return function(s,i){let u=jr(s),l=jr(i);return u.compareTo(l)}(t.bytesValue,e.bytesValue);case 7:return function(s,i){let u=s.split("/"),l=i.split("/");for(let c=0;c<u.length&&c<l.length;c++){let f=Re(u[c],l[c]);if(f!==0)return f}return Re(u.length,l.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,i){let u=Re(gt(s.latitude),gt(i.latitude));return u!==0?u:Re(gt(s.longitude),gt(i.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Ex(t.arrayValue,e.arrayValue);case 10:return function(s,i){let u=s.fields||{},l=i.fields||{},c=u[hu]?.arrayValue,f=l[hu]?.arrayValue,m=Re(c?.values?.length||0,f?.values?.length||0);return m!==0?m:Ex(c,f)}(t.mapValue,e.mapValue);case 11:return function(s,i){if(s===Kh.mapValue&&i===Kh.mapValue)return 0;if(s===Kh.mapValue)return 1;if(i===Kh.mapValue)return-1;let u=s.fields||{},l=Object.keys(u),c=i.fields||{},f=Object.keys(c);l.sort(),f.sort();for(let m=0;m<l.length&&m<f.length;++m){let p=w_(l[m],f[m]);if(p!==0)return p;let S=pu(u[l[m]],c[f[m]]);if(S!==0)return S}return Re(l.length,f.length)}(t.mapValue,e.mapValue);default:throw oe(23264,{he:n})}}function vx(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Re(t,e);let n=Gr(t),a=Gr(e),r=Re(n.seconds,a.seconds);return r!==0?r:Re(n.nanos,a.nanos)}function Ex(t,e){let n=t.values||[],a=e.values||[];for(let r=0;r<n.length&&r<a.length;++r){let s=pu(n[r],a[r]);if(s)return s}return Re(n.length,a.length)}function mu(t){return A_(t)}function A_(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){let a=Gr(n);return`time(${a.seconds},${a.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return jr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ne.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let a="[",r=!0;for(let s of n.values||[])r?r=!1:a+=",",a+=A_(s);return a+"]"}(t.arrayValue):"mapValue"in t?function(n){let a=Object.keys(n.fields||{}).sort(),r="{",s=!0;for(let i of a)s?s=!1:r+=",",r+=`${i}:${A_(n.fields[i])}`;return r+"}"}(t.mapValue):oe(61005,{value:t})}function Xh(t){switch(Ks(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=Rp(t);return e?16+Xh(e):16;case 5:return 2*t.stringValue.length;case 6:return jr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(a){return(a.values||[]).reduce((r,s)=>r+Xh(s),0)}(t.arrayValue);case 10:case 11:return function(a){let r=0;return Lu(a.fields,(s,i)=>{r+=s.length+Xh(i)}),r}(t.mapValue);default:throw oe(13486,{value:t})}}function Wc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function x_(t){return!!t&&"integerValue"in t}function KS(t){return!!t&&"arrayValue"in t}function Tx(t){return!!t&&"nullValue"in t}function bx(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function y_(t){return!!t&&"mapValue"in t}function C0(t){return(t?.mapValue?.fields||{})[GS]?.stringValue===jS}function Tc(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return Lu(t.mapValue.fields,(n,a)=>e.mapValue.fields[n]=Tc(a)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Tc(t.arrayValue.values[n]);return e}return{...t}}function L0(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===w0}var b4={mapValue:{fields:{[GS]:{stringValue:jS},[hu]:{arrayValue:{}}}}};var tr=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let a=0;a<e.length-1;++a)if(n=(n.mapValue.fields||{})[e.get(a)],!y_(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Tc(n)}setAll(e){let n=sa.emptyPath(),a={},r=[];e.forEach((i,u)=>{if(!n.isImmediateParentOf(u)){let l=this.getFieldsMap(n);this.applyChanges(l,a,r),a={},r=[],n=u.popLast()}i?a[u.lastSegment()]=Tc(i):r.push(u.lastSegment())});let s=this.getFieldsMap(n);this.applyChanges(s,a,r)}delete(e){let n=this.field(e.popLast());y_(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return ir(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let a=0;a<e.length;++a){let r=n.mapValue.fields[e.get(a)];y_(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(a)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,a){Lu(n,(r,s)=>e[r]=s);for(let r of a)delete e[r]}clone(){return new t(Tc(this.value))}};var ka=class t{constructor(e,n,a,r,s,i,u){this.key=e,this.documentType=n,this.version=a,this.readTime=r,this.createTime=s,this.data=i,this.documentState=u}static newInvalidDocument(e){return new t(e,0,he.min(),he.min(),he.min(),tr.empty(),0)}static newFoundDocument(e,n,a,r){return new t(e,1,n,he.min(),a,r,0)}static newNoDocument(e,n){return new t(e,2,n,he.min(),he.min(),tr.empty(),0)}static newUnknownDocument(e,n){return new t(e,3,n,he.min(),he.min(),tr.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(he.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=tr.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=tr.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=he.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var Kr=class{constructor(e,n){this.position=e,this.inclusive=n}};function wx(t,e,n){let a=0;for(let r=0;r<t.position.length;r++){let s=e[r],i=t.position[r];if(s.field.isKeyField()?a=ne.comparator(ne.fromName(i.referenceValue),n.key):a=pu(i,n.data.field(s.field)),s.dir==="desc"&&(a*=-1),a!==0)break}return a}function Cx(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!ir(t.position[n],e.position[n]))return!1;return!0}var Ws=class{constructor(e,n="asc"){this.field=e,this.dir=n}};function Q2(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var op=class{},kt=class t extends op{constructor(e,n,a){super(),this.field=e,this.op=n,this.value=a}static create(e,n,a){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,a):new k_(e,n,a):n==="array-contains"?new O_(e,a):n==="in"?new M_(e,a):n==="not-in"?new N_(e,a):n==="array-contains-any"?new V_(e,a):new t(e,n,a)}static createKeyFieldInFilter(e,n,a){return n==="in"?new D_(e,a):new P_(e,a)}matches(e){let n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(pu(n,this.value)):n!==null&&Ks(this.value)===Ks(n)&&this.matchesComparison(pu(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return oe(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},Sa=class t extends op{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new t(e,n)}matches(e){return A0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function A0(t){return t.op==="and"}function x0(t){return $2(t)&&A0(t)}function $2(t){for(let e of t.filters)if(e instanceof Sa)return!1;return!0}function R_(t){if(t instanceof kt)return t.field.canonicalString()+t.op.toString()+mu(t.value);if(x0(t))return t.filters.map(e=>R_(e)).join(",");{let e=t.filters.map(n=>R_(n)).join(",");return`${t.op}(${e})`}}function R0(t,e){return t instanceof kt?function(a,r){return r instanceof kt&&a.op===r.op&&a.field.isEqual(r.field)&&ir(a.value,r.value)}(t,e):t instanceof Sa?function(a,r){return r instanceof Sa&&a.op===r.op&&a.filters.length===r.filters.length?a.filters.reduce((s,i,u)=>s&&R0(i,r.filters[u]),!0):!1}(t,e):void oe(19439)}function k0(t){return t instanceof kt?function(n){return`${n.field.canonicalString()} ${n.op} ${mu(n.value)}`}(t):t instanceof Sa?function(n){return n.op.toString()+" {"+n.getFilters().map(k0).join(" ,")+"}"}(t):"Filter"}var k_=class extends kt{constructor(e,n,a){super(e,n,a),this.key=ne.fromName(a.referenceValue)}matches(e){let n=ne.comparator(e.key,this.key);return this.matchesComparison(n)}},D_=class extends kt{constructor(e,n){super(e,"in",n),this.keys=D0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}},P_=class extends kt{constructor(e,n){super(e,"not-in",n),this.keys=D0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}};function D0(t,e){return(e.arrayValue?.values||[]).map(n=>ne.fromName(n.referenceValue))}var O_=class extends kt{constructor(e,n){super(e,"array-contains",n)}matches(e){let n=e.data.field(this.field);return KS(n)&&Rc(n.arrayValue,this.value)}},M_=class extends kt{constructor(e,n){super(e,"in",n)}matches(e){let n=e.data.field(this.field);return n!==null&&Rc(this.value.arrayValue,n)}},N_=class extends kt{constructor(e,n){super(e,"not-in",n)}matches(e){if(Rc(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Rc(this.value.arrayValue,n)}},V_=class extends kt{constructor(e,n){super(e,"array-contains-any",n)}matches(e){let n=e.data.field(this.field);return!(!KS(n)||!n.arrayValue.values)&&n.arrayValue.values.some(a=>Rc(this.value.arrayValue,a))}};var F_=class{constructor(e,n=null,a=[],r=[],s=null,i=null,u=null){this.path=e,this.collectionGroup=n,this.orderBy=a,this.filters=r,this.limit=s,this.startAt=i,this.endAt=u,this.Te=null}};function Lx(t,e=null,n=[],a=[],r=null,s=null,i=null){return new F_(t,e,n,a,r,s,i)}function WS(t){let e=Pe(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(a=>R_(a)).join(","),n+="|ob:",n+=e.orderBy.map(a=>function(s){return s.field.canonicalString()+s.dir}(a)).join(","),xp(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(a=>mu(a)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(a=>mu(a)).join(",")),e.Te=n}return e.Te}function YS(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!Q2(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!R0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Cx(t.startAt,e.startAt)&&Cx(t.endAt,e.endAt)}function U_(t){return ne.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var Wr=class{constructor(e,n=null,a=[],r=[],s=null,i="F",u=null,l=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=a,this.filters=r,this.limit=s,this.limitType=i,this.startAt=u,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function J2(t,e,n,a,r,s,i,u){return new Wr(t,e,n,a,r,s,i,u)}function XS(t){return new Wr(t)}function Ax(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function Z2(t){return ne.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function kp(t){return t.collectionGroup!==null}function Oi(t){let e=Pe(t);if(e.Ie===null){e.Ie=[];let n=new Set;for(let s of e.explicitOrderBy)e.Ie.push(s),n.add(s.field.canonicalString());let a=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(i){let u=new un(sa.comparator);return i.filters.forEach(l=>{l.getFlattenedFilters().forEach(c=>{c.isInequality()&&(u=u.add(c.field))})}),u})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new Ws(s,a))}),n.has(sa.keyField().canonicalString())||e.Ie.push(new Ws(sa.keyField(),a))}return e.Ie}function ar(t){let e=Pe(t);return e.Ee||(e.Ee=eV(e,Oi(t))),e.Ee}function eV(t,e){if(t.limitType==="F")return Lx(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let s=r.dir==="desc"?"asc":"desc";return new Ws(r.field,s)});let n=t.endAt?new Kr(t.endAt.position,t.endAt.inclusive):null,a=t.startAt?new Kr(t.startAt.position,t.startAt.inclusive):null;return Lx(t.path,t.collectionGroup,e,t.filters,t.limit,n,a)}}function Dp(t,e){let n=t.filters.concat([e]);return new Wr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function P0(t,e){let n=t.explicitOrderBy.concat([e]);return new Wr(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function kc(t,e,n){return new Wr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function O0(t,e){return new Wr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function Pp(t,e){return YS(ar(t),ar(e))&&t.limitType===e.limitType}function M0(t){return`${WS(ar(t))}|lt:${t.limitType}`}function au(t){return`Query(target=${function(n){let a=n.path.canonicalString();return n.collectionGroup!==null&&(a+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(a+=`, filters: [${n.filters.map(r=>k0(r)).join(", ")}]`),xp(n.limit)||(a+=", limit: "+n.limit),n.orderBy.length>0&&(a+=`, orderBy: [${n.orderBy.map(r=>function(i){return`${i.field.canonicalString()} (${i.dir})`}(r)).join(", ")}]`),n.startAt&&(a+=", startAt: ",a+=n.startAt.inclusive?"b:":"a:",a+=n.startAt.position.map(r=>mu(r)).join(",")),n.endAt&&(a+=", endAt: ",a+=n.endAt.inclusive?"a:":"b:",a+=n.endAt.position.map(r=>mu(r)).join(",")),`Target(${a})`}(ar(t))}; limitType=${t.limitType})`}function Op(t,e){return e.isFoundDocument()&&function(a,r){let s=r.key.path;return a.collectionGroup!==null?r.key.hasCollectionId(a.collectionGroup)&&a.path.isPrefixOf(s):ne.isDocumentKey(a.path)?a.path.isEqual(s):a.path.isImmediateParentOf(s)}(t,e)&&function(a,r){for(let s of Oi(a))if(!s.field.isKeyField()&&r.data.field(s.field)===null)return!1;return!0}(t,e)&&function(a,r){for(let s of a.filters)if(!s.matches(r))return!1;return!0}(t,e)&&function(a,r){return!(a.startAt&&!function(i,u,l){let c=wx(i,u,l);return i.inclusive?c<=0:c<0}(a.startAt,Oi(a),r)||a.endAt&&!function(i,u,l){let c=wx(i,u,l);return i.inclusive?c>=0:c>0}(a.endAt,Oi(a),r))}(t,e)}function tV(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function N0(t){return(e,n)=>{let a=!1;for(let r of Oi(t)){let s=nV(r,e,n);if(s!==0)return s;a=a||r.field.isKeyField()}return 0}}function nV(t,e,n){let a=t.field.isKeyField()?ne.comparator(e.key,n.key):function(s,i,u){let l=i.data.field(s),c=u.data.field(s);return l!==null&&c!==null?pu(l,c):oe(42886)}(t.field,e,n);switch(t.dir){case"asc":return a;case"desc":return-1*a;default:return oe(19790,{direction:t.dir})}}var Yr=class{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a!==void 0){for(let[r,s]of a)if(this.equalsFn(r,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){let a=this.mapKeyFn(e),r=this.inner[a];if(r===void 0)return this.inner[a]=[[e,n]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a===void 0)return!1;for(let r=0;r<a.length;r++)if(this.equalsFn(a[r][0],e))return a.length===1?delete this.inner[n]:a.splice(r,1),this.innerSize--,!0;return!1}forEach(e){Lu(this.inner,(n,a)=>{for(let[r,s]of a)e(r,s)})}isEmpty(){return _0(this.inner)}size(){return this.innerSize}};var aV=new Pt(ne.comparator);function Ys(){return aV}var V0=new Pt(ne.comparator);function Ec(...t){let e=V0;for(let n of t)e=e.insert(n.key,n);return e}function rV(t){let e=V0;return t.forEach((n,a)=>e=e.insert(n,a.overlayedDocument)),e}function Di(){return bc()}function F0(){return bc()}function bc(){return new Yr(t=>t.toString(),(t,e)=>t.isEqual(e))}var w4=new Pt(ne.comparator),sV=new un(ne.comparator);function De(...t){let e=sV;for(let n of t)e=e.add(n);return e}var iV=new un(Re);function oV(){return iV}function QS(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Lc(e)?"-0":e}}function U0(t){return{integerValue:""+t}}function uV(t,e){return N2(e)?U0(e):QS(t,e)}var gu=class{constructor(){this._=void 0}};function lV(t,e,n){return t instanceof Dc?function(r,s){let i={fields:{[v0]:{stringValue:S0},[T0]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return s&&Kc(s)&&(s=Rp(s)),s&&(i.fields[E0]=s),{mapValue:i}}(n,e):t instanceof yu?B0(t,e):t instanceof Iu?q0(t,e):function(r,s){let i=dV(r,s),u=xx(i)+xx(r.Ae);return x_(i)&&x_(r.Ae)?U0(u):QS(r.serializer,u)}(t,e)}function cV(t,e,n){return t instanceof yu?B0(t,e):t instanceof Iu?q0(t,e):n}function dV(t,e){return t instanceof Pc?function(a){return x_(a)||function(s){return!!s&&"doubleValue"in s}(a)}(e)?e:{integerValue:0}:null}var Dc=class extends gu{},yu=class extends gu{constructor(e){super(),this.elements=e}};function B0(t,e){let n=H0(e);for(let a of t.elements)n.some(r=>ir(r,a))||n.push(a);return{arrayValue:{values:n}}}var Iu=class extends gu{constructor(e){super(),this.elements=e}};function q0(t,e){let n=H0(e);for(let a of t.elements)n=n.filter(r=>!ir(r,a));return{arrayValue:{values:n}}}var Pc=class extends gu{constructor(e,n){super(),this.serializer=e,this.Ae=n}};function xx(t){return gt(t.integerValue||t.doubleValue)}function H0(t){return KS(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function fV(t,e){return t.field.isEqual(e.field)&&function(a,r){return a instanceof yu&&r instanceof yu||a instanceof Iu&&r instanceof Iu?du(a.elements,r.elements,ir):a instanceof Pc&&r instanceof Pc?ir(a.Ae,r.Ae):a instanceof Dc&&r instanceof Dc}(t.transform,e.transform)}var ou=class t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function Qh(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var Oc=class{};function z0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new up(t.key,ou.none()):new Mc(t.key,t.data,ou.none());{let n=t.data,a=tr.empty(),r=new un(sa.comparator);for(let s of e.fields)if(!r.has(s)){let i=n.field(s);i===null&&s.length>1&&(s=s.popLast(),i=n.field(s)),i===null?a.delete(s):a.set(s,i),r=r.add(s)}return new _u(t.key,a,new ki(r.toArray()),ou.none())}}function hV(t,e,n){t instanceof Mc?function(r,s,i){let u=r.value.clone(),l=kx(r.fieldTransforms,s,i.transformResults);u.setAll(l),s.convertToFoundDocument(i.version,u).setHasCommittedMutations()}(t,e,n):t instanceof _u?function(r,s,i){if(!Qh(r.precondition,s))return void s.convertToUnknownDocument(i.version);let u=kx(r.fieldTransforms,s,i.transformResults),l=s.data;l.setAll(G0(r)),l.setAll(u),s.convertToFoundDocument(i.version,l).setHasCommittedMutations()}(t,e,n):function(r,s,i){s.convertToNoDocument(i.version).setHasCommittedMutations()}(0,e,n)}function wc(t,e,n,a){return t instanceof Mc?function(s,i,u,l){if(!Qh(s.precondition,i))return u;let c=s.value.clone(),f=Dx(s.fieldTransforms,l,i);return c.setAll(f),i.convertToFoundDocument(i.version,c).setHasLocalMutations(),null}(t,e,n,a):t instanceof _u?function(s,i,u,l){if(!Qh(s.precondition,i))return u;let c=Dx(s.fieldTransforms,l,i),f=i.data;return f.setAll(G0(s)),f.setAll(c),i.convertToFoundDocument(i.version,f).setHasLocalMutations(),u===null?null:u.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(m=>m.field))}(t,e,n,a):function(s,i,u){return Qh(s.precondition,i)?(i.convertToNoDocument(i.version).setHasLocalMutations(),null):u}(t,e,n)}function Rx(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(a,r){return a===void 0&&r===void 0||!(!a||!r)&&du(a,r,(s,i)=>fV(s,i))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var Mc=class extends Oc{constructor(e,n,a,r=[]){super(),this.key=e,this.value=n,this.precondition=a,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},_u=class extends Oc{constructor(e,n,a,r,s=[]){super(),this.key=e,this.data=n,this.fieldMask=a,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}};function G0(t){let e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){let a=t.data.field(n);e.set(n,a)}}),e}function kx(t,e,n){let a=new Map;St(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let r=0;r<n.length;r++){let s=t[r],i=s.transform,u=e.data.field(s.field);a.set(s.field,cV(i,u,n[r]))}return a}function Dx(t,e,n){let a=new Map;for(let r of t){let s=r.transform,i=n.data.field(r.field);a.set(r.field,lV(s,i,e))}return a}var up=class extends Oc{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var B_=class{constructor(e,n,a,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=a,this.mutations=r}applyToRemoteDocument(e,n){let a=n.mutationResults;for(let r=0;r<this.mutations.length;r++){let s=this.mutations[r];s.key.isEqual(e.key)&&hV(s,e,a[r])}}applyToLocalView(e,n){for(let a of this.baseMutations)a.key.isEqual(e.key)&&(n=wc(a,e,n,this.localWriteTime));for(let a of this.mutations)a.key.isEqual(e.key)&&(n=wc(a,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){let a=F0();return this.mutations.forEach(r=>{let s=e.get(r.key),i=s.overlayedDocument,u=this.applyToLocalView(i,s.mutatedFields);u=n.has(r.key)?null:u;let l=z0(i,u);l!==null&&a.set(r.key,l),i.isValidDocument()||i.convertToNoDocument(he.min())}),a}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),De())}isEqual(e){return this.batchId===e.batchId&&du(this.mutations,e.mutations,(n,a)=>Rx(n,a))&&du(this.baseMutations,e.baseMutations,(n,a)=>Rx(n,a))}};var q_=class{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var H_=class{constructor(e,n){this.count=e,this.unchangedNames=n}};var Ut,ke;function j0(t){if(t===void 0)return Hr("GRPC error has no .code"),H.UNKNOWN;switch(t){case Ut.OK:return H.OK;case Ut.CANCELLED:return H.CANCELLED;case Ut.UNKNOWN:return H.UNKNOWN;case Ut.DEADLINE_EXCEEDED:return H.DEADLINE_EXCEEDED;case Ut.RESOURCE_EXHAUSTED:return H.RESOURCE_EXHAUSTED;case Ut.INTERNAL:return H.INTERNAL;case Ut.UNAVAILABLE:return H.UNAVAILABLE;case Ut.UNAUTHENTICATED:return H.UNAUTHENTICATED;case Ut.INVALID_ARGUMENT:return H.INVALID_ARGUMENT;case Ut.NOT_FOUND:return H.NOT_FOUND;case Ut.ALREADY_EXISTS:return H.ALREADY_EXISTS;case Ut.PERMISSION_DENIED:return H.PERMISSION_DENIED;case Ut.FAILED_PRECONDITION:return H.FAILED_PRECONDITION;case Ut.ABORTED:return H.ABORTED;case Ut.OUT_OF_RANGE:return H.OUT_OF_RANGE;case Ut.UNIMPLEMENTED:return H.UNIMPLEMENTED;case Ut.DATA_LOSS:return H.DATA_LOSS;default:return oe(39323,{code:t})}}(ke=Ut||(Ut={}))[ke.OK=0]="OK",ke[ke.CANCELLED=1]="CANCELLED",ke[ke.UNKNOWN=2]="UNKNOWN",ke[ke.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ke[ke.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ke[ke.NOT_FOUND=5]="NOT_FOUND",ke[ke.ALREADY_EXISTS=6]="ALREADY_EXISTS",ke[ke.PERMISSION_DENIED=7]="PERMISSION_DENIED",ke[ke.UNAUTHENTICATED=16]="UNAUTHENTICATED",ke[ke.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ke[ke.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ke[ke.ABORTED=10]="ABORTED",ke[ke.OUT_OF_RANGE=11]="OUT_OF_RANGE",ke[ke.UNIMPLEMENTED=12]="UNIMPLEMENTED",ke[ke.INTERNAL=13]="INTERNAL",ke[ke.UNAVAILABLE=14]="UNAVAILABLE",ke[ke.DATA_LOSS=15]="DATA_LOSS";var pV=null;function mV(){return new TextEncoder}var gV=new Fr([4294967295,4294967295],0);function Px(t){let e=mV().encode(t),n=new c_;return n.update(e),new Uint8Array(n.digest())}function Ox(t){let e=new DataView(t.buffer),n=e.getUint32(0,!0),a=e.getUint32(4,!0),r=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Fr([n,a],0),new Fr([r,s],0)]}var z_=class t{constructor(e,n,a){if(this.bitmap=e,this.padding=n,this.hashCount=a,n<0||n>=8)throw new Pi(`Invalid padding: ${n}`);if(a<0)throw new Pi(`Invalid hash count: ${a}`);if(e.length>0&&this.hashCount===0)throw new Pi(`Invalid hash count: ${a}`);if(e.length===0&&n!==0)throw new Pi(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=Fr.fromNumber(this.ge)}ye(e,n,a){let r=e.add(n.multiply(Fr.fromNumber(a)));return r.compare(gV)===1&&(r=new Fr([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let n=Px(e),[a,r]=Ox(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);if(!this.we(i))return!1}return!0}static create(e,n,a){let r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new t(s,r,n);return a.forEach(u=>i.insert(u)),i}insert(e){if(this.ge===0)return;let n=Px(e),[a,r]=Ox(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);this.be(i)}}be(e){let n=Math.floor(e/8),a=e%8;this.bitmap[n]|=1<<a}},Pi=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var lp=class t{constructor(e,n,a,r,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=a,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,a){let r=new Map;return r.set(e,Nc.createSynthesizedTargetChangeForCurrentChange(e,n,a)),new t(he.min(),r,new Pt(Re),Ys(),De())}},Nc=class t{constructor(e,n,a,r,s){this.resumeToken=e,this.current=n,this.addedDocuments=a,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,a){return new t(a,n,De(),De(),De())}};var uu=class{constructor(e,n,a,r){this.Se=e,this.removedTargetIds=n,this.key=a,this.De=r}},cp=class{constructor(e,n){this.targetId=e,this.Ce=n}},dp=class{constructor(e,n,a=yn.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=a,this.cause=r}},fp=class{constructor(){this.ve=0,this.Fe=Mx(),this.Me=yn.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=De(),n=De(),a=De();return this.Fe.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:a=a.add(r);break;default:oe(38017,{changeType:s})}}),new Nc(this.Me,this.xe,e,n,a)}Ke(){this.Oe=!1,this.Fe=Mx()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,St(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},G_=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=Ys(),this.He=Wh(),this.Je=Wh(),this.Ze=new Pt(Re)}Xe(e){for(let n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(let n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{let a=this.nt(n);switch(e.state){case 0:this.rt(n)&&a.Le(e.resumeToken);break;case 1:a.We(),a.Ne||a.Ke(),a.Le(e.resumeToken);break;case 2:a.We(),a.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(a.Qe(),a.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),a.Le(e.resumeToken));break;default:oe(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((a,r)=>{this.rt(r)&&n(r)})}st(e){let n=e.targetId,a=e.Ce.count,r=this.ot(n);if(r){let s=r.target;if(U_(s))if(a===0){let i=new ne(s.path);this.et(n,i,ka.newNoDocument(i,he.min()))}else St(a===1,20013,{expectedCount:a});else{let i=this._t(n);if(i!==a){let u=this.ut(e),l=u?this.ct(u,e,i):1;if(l!==0){this.it(n);let c=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,c)}pV?.lt(function(f,m,p,S,R){let D={localCacheCount:f,existenceFilterCount:m.count,databaseId:p.database,projectId:p.projectId},A=m.unchangedNames;return A&&(D.bloomFilter={applied:R===0,hashCount:A?.hashCount??0,bitmapLength:A?.bits?.bitmap?.length??0,padding:A?.bits?.padding??0,mightContain:E=>S?.mightContain(E)??!1}),D}(i,e.Ce,this.Ge.ht(),u,l))}}}}ut(e){let n=e.Ce.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:a="",padding:r=0},hashCount:s=0}=n,i,u;try{i=jr(a).toUint8Array()}catch(l){if(l instanceof sp)return zr("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new z_(i,r,s)}catch(l){return zr(l instanceof Pi?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.ge===0?null:u}ct(e,n,a){return n.Ce.count===a-this.Pt(e,n.targetId)?0:2}Pt(e,n){let a=this.Ge.getRemoteKeysForTarget(n),r=0;return a.forEach(s=>{let i=this.Ge.ht(),u=`projects/${i.projectId}/databases/${i.database}/documents/${s.path.canonicalString()}`;e.mightContain(u)||(this.et(n,s,null),r++)}),r}Tt(e){let n=new Map;this.ze.forEach((s,i)=>{let u=this.ot(i);if(u){if(s.current&&U_(u.target)){let l=new ne(u.target.path);this.It(l).has(i)||this.Et(i,l)||this.et(i,l,ka.newNoDocument(l,e))}s.Be&&(n.set(i,s.ke()),s.Ke())}});let a=De();this.Je.forEach((s,i)=>{let u=!0;i.forEachWhile(l=>{let c=this.ot(l);return!c||c.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(a=a.add(s))}),this.je.forEach((s,i)=>i.setReadTime(e));let r=new lp(e,n,this.Ze,this.je,a);return this.je=Ys(),this.He=Wh(),this.Je=Wh(),this.Ze=new Pt(Re),r}Ye(e,n){if(!this.rt(e))return;let a=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,a),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,a){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,n)?r.qe(n,1):r.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),a&&(this.je=this.je.insert(n,a))}removeTarget(e){this.ze.delete(e)}_t(e){let n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new fp,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new un(Re),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new un(Re),this.He=this.He.insert(e,n)),n}rt(e){let n=this.ot(e)!==null;return n||$("WatchChangeAggregator","Detected inactive target",e),n}ot(e){let n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new fp),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}};function Wh(){return new Pt(ne.comparator)}function Mx(){return new Pt(ne.comparator)}var yV={asc:"ASCENDING",desc:"DESCENDING"},IV={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},_V={and:"AND",or:"OR"},j_=class{constructor(e,n){this.databaseId=e,this.useProto3Json=n}};function K_(t,e){return t.useProto3Json||xp(e)?e:{value:e}}function W_(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function K0(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function lu(t){return St(!!t,49232),he.fromTimestamp(function(n){let a=Gr(n);return new qt(a.seconds,a.nanos)}(t))}function W0(t,e){return Y_(t,e).canonicalString()}function Y_(t,e){let n=function(r){return new yt(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?n:n.child(e)}function Y0(t){let e=yt.fromString(t);return St(Z0(e),10190,{key:e.toString()}),e}function I_(t,e){let n=Y0(e);if(n.get(1)!==t.databaseId.projectId)throw new X(H.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new X(H.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ne(Q0(n))}function X0(t,e){return W0(t.databaseId,e)}function SV(t){let e=Y0(t);return e.length===4?yt.emptyPath():Q0(e)}function Nx(t){return new yt(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function Q0(t){return St(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function vV(t,e){let n;if("targetChange"in e){e.targetChange;let a=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:oe(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],s=function(c,f){return c.useProto3Json?(St(f===void 0||typeof f=="string",58123),yn.fromBase64String(f||"")):(St(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),yn.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),i=e.targetChange.cause,u=i&&function(c){let f=c.code===void 0?H.UNKNOWN:j0(c.code);return new X(f,c.message||"")}(i);n=new dp(a,r,s,u||null)}else if("documentChange"in e){e.documentChange;let a=e.documentChange;a.document,a.document.name,a.document.updateTime;let r=I_(t,a.document.name),s=lu(a.document.updateTime),i=a.document.createTime?lu(a.document.createTime):he.min(),u=new tr({mapValue:{fields:a.document.fields}}),l=ka.newFoundDocument(r,s,i,u),c=a.targetIds||[],f=a.removedTargetIds||[];n=new uu(c,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;let a=e.documentDelete;a.document;let r=I_(t,a.document),s=a.readTime?lu(a.readTime):he.min(),i=ka.newNoDocument(r,s),u=a.removedTargetIds||[];n=new uu([],u,i.key,i)}else if("documentRemove"in e){e.documentRemove;let a=e.documentRemove;a.document;let r=I_(t,a.document),s=a.removedTargetIds||[];n=new uu([],s,r,null)}else{if(!("filter"in e))return oe(11601,{Vt:e});{e.filter;let a=e.filter;a.targetId;let{count:r=0,unchangedNames:s}=a,i=new H_(r,s),u=a.targetId;n=new cp(u,i)}}return n}function EV(t,e){return{documents:[X0(t,e.path)]}}function TV(t,e){let n={structuredQuery:{}},a=e.path,r;e.collectionGroup!==null?(r=a,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=a.popLast(),n.structuredQuery.from=[{collectionId:a.lastSegment()}]),n.parent=X0(t,r);let s=function(c){if(c.length!==0)return J0(Sa.create(c,"and"))}(e.filters);s&&(n.structuredQuery.where=s);let i=function(c){if(c.length!==0)return c.map(f=>function(p){return{field:ru(p.field),direction:CV(p.dir)}}(f))}(e.orderBy);i&&(n.structuredQuery.orderBy=i);let u=K_(t,e.limit);return u!==null&&(n.structuredQuery.limit=u),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{ft:n,parent:r}}function bV(t){let e=SV(t.parent),n=t.structuredQuery,a=n.from?n.from.length:0,r=null;if(a>0){St(a===1,65062);let f=n.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(m){let p=$0(m);return p instanceof Sa&&x0(p)?p.getFilters():[p]}(n.where));let i=[];n.orderBy&&(i=function(m){return m.map(p=>function(R){return new Ws(su(R.field),function(A){switch(A){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(p))}(n.orderBy));let u=null;n.limit&&(u=function(m){let p;return p=typeof m=="object"?m.value:m,xp(p)?null:p}(n.limit));let l=null;n.startAt&&(l=function(m){let p=!!m.before,S=m.values||[];return new Kr(S,p)}(n.startAt));let c=null;return n.endAt&&(c=function(m){let p=!m.before,S=m.values||[];return new Kr(S,p)}(n.endAt)),J2(e,r,i,s,u,"F",l,c)}function wV(t,e){let n=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return oe(28987,{purpose:r})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function $0(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":let a=su(n.unaryFilter.field);return kt.create(a,"==",{doubleValue:NaN});case"IS_NULL":let r=su(n.unaryFilter.field);return kt.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let s=su(n.unaryFilter.field);return kt.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let i=su(n.unaryFilter.field);return kt.create(i,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return oe(61313);default:return oe(60726)}}(t):t.fieldFilter!==void 0?function(n){return kt.create(su(n.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return oe(58110);default:return oe(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return Sa.create(n.compositeFilter.filters.map(a=>$0(a)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return oe(1026)}}(n.compositeFilter.op))}(t):oe(30097,{filter:t})}function CV(t){return yV[t]}function LV(t){return IV[t]}function AV(t){return _V[t]}function ru(t){return{fieldPath:t.canonicalString()}}function su(t){return sa.fromServerFormat(t.fieldPath)}function J0(t){return t instanceof kt?function(n){if(n.op==="=="){if(bx(n.value))return{unaryFilter:{field:ru(n.field),op:"IS_NAN"}};if(Tx(n.value))return{unaryFilter:{field:ru(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(bx(n.value))return{unaryFilter:{field:ru(n.field),op:"IS_NOT_NAN"}};if(Tx(n.value))return{unaryFilter:{field:ru(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:ru(n.field),op:LV(n.op),value:n.value}}}(t):t instanceof Sa?function(n){let a=n.getFilters().map(r=>J0(r));return a.length===1?a[0]:{compositeFilter:{op:AV(n.op),filters:a}}}(t):oe(54877,{filter:t})}function Z0(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function eR(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var Vc=class t{constructor(e,n,a,r,s=he.min(),i=he.min(),u=yn.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=n,this.purpose=a,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var X_=class{constructor(e){this.yt=e}};function tR(t){let e=bV({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?kc(e,e.limit,"L"):e}var hp=class{constructor(){}Dt(e,n){this.Ct(e,n),n.vt()}Ct(e,n){if("nullValue"in e)this.Ft(n,5);else if("booleanValue"in e)this.Ft(n,10),n.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(n,15),n.Mt(gt(e.integerValue));else if("doubleValue"in e){let a=gt(e.doubleValue);isNaN(a)?this.Ft(n,13):(this.Ft(n,15),Lc(a)?n.Mt(0):n.Mt(a))}else if("timestampValue"in e){let a=e.timestampValue;this.Ft(n,20),typeof a=="string"&&(a=Gr(a)),n.xt(`${a.seconds||""}`),n.Mt(a.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,n),this.Nt(n);else if("bytesValue"in e)this.Ft(n,30),n.Bt(jr(e.bytesValue)),this.Nt(n);else if("referenceValue"in e)this.Lt(e.referenceValue,n);else if("geoPointValue"in e){let a=e.geoPointValue;this.Ft(n,45),n.Mt(a.latitude||0),n.Mt(a.longitude||0)}else"mapValue"in e?L0(e)?this.Ft(n,Number.MAX_SAFE_INTEGER):C0(e)?this.kt(e.mapValue,n):(this.Kt(e.mapValue,n),this.Nt(n)):"arrayValue"in e?(this.qt(e.arrayValue,n),this.Nt(n)):oe(19022,{Ut:e})}Ot(e,n){this.Ft(n,25),this.$t(e,n)}$t(e,n){n.xt(e)}Kt(e,n){let a=e.fields||{};this.Ft(n,55);for(let r of Object.keys(a))this.Ot(r,n),this.Ct(a[r],n)}kt(e,n){let a=e.fields||{};this.Ft(n,53);let r=hu,s=a[r].arrayValue?.values?.length||0;this.Ft(n,15),n.Mt(gt(s)),this.Ot(r,n),this.Ct(a[r],n)}qt(e,n){let a=e.values||[];this.Ft(n,50);for(let r of a)this.Ct(r,n)}Lt(e,n){this.Ft(n,37),ne.fromName(e).path.forEach(a=>{this.Ft(n,60),this.$t(a,n)})}Ft(e,n){e.Mt(n)}Nt(e){e.Mt(2)}};hp.Wt=new hp;var Q_=class{constructor(){this.Sn=new $_}addToCollectionParentIndex(e,n){return this.Sn.add(n),G.resolve()}getCollectionParents(e,n){return G.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return G.resolve()}deleteFieldIndex(e,n){return G.resolve()}deleteAllFieldIndexes(e){return G.resolve()}createTargetIndexes(e,n){return G.resolve()}getDocumentsMatchingTarget(e,n){return G.resolve(null)}getIndexType(e,n){return G.resolve(0)}getFieldIndexes(e,n){return G.resolve([])}getNextCollectionGroupToUpdate(e){return G.resolve(null)}getMinOffset(e,n){return G.resolve(Vi.min())}getMinOffsetFromCollectionGroup(e,n){return G.resolve(Vi.min())}updateCollectionGroup(e,n,a){return G.resolve()}updateIndexEntries(e,n){return G.resolve()}},$_=class{constructor(){this.index={}}add(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n]||new un(yt.comparator),s=!r.has(a);return this.index[n]=r.add(a),s}has(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n];return r&&r.has(a)}getEntries(e){return(this.index[e]||new un(yt.comparator)).toArray()}};var C4=new Uint8Array(0);var Vx={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},nR=41943040,_a=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,a){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=a}};_a.DEFAULT_COLLECTION_PERCENTILE=10,_a.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,_a.DEFAULT=new _a(nR,_a.DEFAULT_COLLECTION_PERCENTILE,_a.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),_a.DISABLED=new _a(-1,0,0);var Fc=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var Fx="LruGarbageCollector",xV=1048576;function Ux([t,e],[n,a]){let r=Re(t,n);return r===0?Re(e,a):r}var J_=class{constructor(e){this.Pr=e,this.buffer=new un(Ux),this.Tr=0}Ir(){return++this.Tr}Er(e){let n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{let a=this.buffer.last();Ux(n,a)<0&&(this.buffer=this.buffer.delete(a).add(n))}}get maxValue(){return this.buffer.last()[0]}},Z_=class{constructor(e,n,a){this.garbageCollector=e,this.asyncQueue=n,this.localStore=a,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){$(Fx,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){Cu(n)?$(Fx,"Ignoring IndexedDB error during garbage collection: ",n):await Ap(n)}await this.Ar(3e5)})}},eS=class{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(a=>Math.floor(n/100*a))}nthSequenceNumber(e,n){if(n===0)return G.resolve(fu.ce);let a=new J_(n);return this.Vr.forEachTarget(e,r=>a.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>a.Er(r))).next(()=>a.maxValue)}removeTargets(e,n,a){return this.Vr.removeTargets(e,n,a)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?($("LruGarbageCollector","Garbage collection skipped; disabled"),G.resolve(Vx)):this.getCacheSize(e).next(a=>a<this.params.cacheSizeCollectionThreshold?($("LruGarbageCollector",`Garbage collection skipped; Cache size ${a} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Vx):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let a,r,s,i,u,l,c,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?($("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),r=this.params.maximumSequenceNumbersToCollect):r=m,i=Date.now(),this.nthSequenceNumber(e,r))).next(m=>(a=m,u=Date.now(),this.removeTargets(e,a,n))).next(m=>(s=m,l=Date.now(),this.removeOrphanedDocuments(e,a))).next(m=>(c=Date.now(),nu()<=Ee.DEBUG&&$("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-f}ms
	Determined least recently used ${r} in `+(u-i)+`ms
	Removed ${s} targets in `+(l-u)+`ms
	Removed ${m} documents in `+(c-l)+`ms
Total Duration: ${c-f}ms`),G.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:m})))}};function RV(t,e){return new eS(t,e)}var tS=class{constructor(){this.changes=new Yr(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,ka.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();let a=this.changes.get(n);return a!==void 0?G.resolve(a):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var nS=class{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}};var aS=class{constructor(e,n,a,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=a,this.indexManager=r}getDocument(e,n){let a=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(a=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(a!==null&&wc(a.mutation,r,ki.empty(),qt.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.getLocalViewOfDocuments(e,a,De()).next(()=>a))}getLocalViewOfDocuments(e,n,a=De()){let r=Di();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,a).next(s=>{let i=Ec();return s.forEach((u,l)=>{i=i.insert(u,l.overlayedDocument)}),i}))}getOverlayedDocuments(e,n){let a=Di();return this.populateOverlays(e,a,n).next(()=>this.computeViews(e,n,a,De()))}populateOverlays(e,n,a){let r=[];return a.forEach(s=>{n.has(s)||r.push(s)}),this.documentOverlayCache.getOverlays(e,r).next(s=>{s.forEach((i,u)=>{n.set(i,u)})})}computeViews(e,n,a,r){let s=Ys(),i=bc(),u=function(){return bc()}();return n.forEach((l,c)=>{let f=a.get(c.key);r.has(c.key)&&(f===void 0||f.mutation instanceof _u)?s=s.insert(c.key,c):f!==void 0?(i.set(c.key,f.mutation.getFieldMask()),wc(f.mutation,c,f.mutation.getFieldMask(),qt.now())):i.set(c.key,ki.empty())}),this.recalculateAndSaveOverlays(e,s).next(l=>(l.forEach((c,f)=>i.set(c,f)),n.forEach((c,f)=>u.set(c,new nS(f,i.get(c)??null))),u))}recalculateAndSaveOverlays(e,n){let a=bc(),r=new Pt((i,u)=>i-u),s=De();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(i=>{for(let u of i)u.keys().forEach(l=>{let c=n.get(l);if(c===null)return;let f=a.get(l)||ki.empty();f=u.applyToLocalView(c,f),a.set(l,f);let m=(r.get(u.batchId)||De()).add(l);r=r.insert(u.batchId,m)})}).next(()=>{let i=[],u=r.getReverseIterator();for(;u.hasNext();){let l=u.getNext(),c=l.key,f=l.value,m=F0();f.forEach(p=>{if(!s.has(p)){let S=z0(n.get(p),a.get(p));S!==null&&m.set(p,S),s=s.add(p)}}),i.push(this.documentOverlayCache.saveOverlays(e,c,m))}return G.waitFor(i)}).next(()=>a)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.recalculateAndSaveOverlays(e,a))}getDocumentsMatchingQuery(e,n,a,r){return Z2(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):kp(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,a,r):this.getDocumentsMatchingCollectionQuery(e,n,a,r)}getNextDocuments(e,n,a,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,a,r).next(s=>{let i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,a.largestBatchId,r-s.size):G.resolve(Di()),u=Cc,l=s;return i.next(c=>G.forEach(c,(f,m)=>(u<m.largestBatchId&&(u=m.largestBatchId),s.get(f)?G.resolve():this.remoteDocumentCache.getEntry(e,f).next(p=>{l=l.insert(f,p)}))).next(()=>this.populateOverlays(e,c,s)).next(()=>this.computeViews(e,l,c,De())).next(f=>({batchId:u,changes:rV(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ne(n)).next(a=>{let r=Ec();return a.isFoundDocument()&&(r=r.insert(a.key,a)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,a,r){let s=n.collectionGroup,i=Ec();return this.indexManager.getCollectionParents(e,s).next(u=>G.forEach(u,l=>{let c=function(m,p){return new Wr(p,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(n,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,c,a,r).next(f=>{f.forEach((m,p)=>{i=i.insert(m,p)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,n,a,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,a.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,a,s,r))).next(i=>{s.forEach((l,c)=>{let f=c.getKey();i.get(f)===null&&(i=i.insert(f,ka.newInvalidDocument(f)))});let u=Ec();return i.forEach((l,c)=>{let f=s.get(l);f!==void 0&&wc(f.mutation,c,ki.empty(),qt.now()),Op(n,c)&&(u=u.insert(l,c))}),u})}};var rS=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return G.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(r){return{id:r.id,version:r.version,createTime:lu(r.createTime)}}(n)),G.resolve()}getNamedQuery(e,n){return G.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(r){return{name:r.name,query:tR(r.bundledQuery),readTime:lu(r.readTime)}}(n)),G.resolve()}};var sS=class{constructor(){this.overlays=new Pt(ne.comparator),this.Lr=new Map}getOverlay(e,n){return G.resolve(this.overlays.get(n))}getOverlays(e,n){let a=Di();return G.forEach(n,r=>this.getOverlay(e,r).next(s=>{s!==null&&a.set(r,s)})).next(()=>a)}saveOverlays(e,n,a){return a.forEach((r,s)=>{this.bt(e,n,s)}),G.resolve()}removeOverlaysForBatchId(e,n,a){let r=this.Lr.get(a);return r!==void 0&&(r.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(a)),G.resolve()}getOverlaysForCollection(e,n,a){let r=Di(),s=n.length+1,i=new ne(n.child("")),u=this.overlays.getIteratorFrom(i);for(;u.hasNext();){let l=u.getNext().value,c=l.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===s&&l.largestBatchId>a&&r.set(l.getKey(),l)}return G.resolve(r)}getOverlaysForCollectionGroup(e,n,a,r){let s=new Pt((c,f)=>c-f),i=this.overlays.getIterator();for(;i.hasNext();){let c=i.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>a){let f=s.get(c.largestBatchId);f===null&&(f=Di(),s=s.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}let u=Di(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((c,f)=>u.set(c,f)),!(u.size()>=r)););return G.resolve(u)}bt(e,n,a){let r=this.overlays.get(a.key);if(r!==null){let i=this.Lr.get(r.largestBatchId).delete(a.key);this.Lr.set(r.largestBatchId,i)}this.overlays=this.overlays.insert(a.key,new q_(n,a));let s=this.Lr.get(n);s===void 0&&(s=De(),this.Lr.set(n,s)),this.Lr.set(n,s.add(a.key))}};var iS=class{constructor(){this.sessionToken=yn.EMPTY_BYTE_STRING}getSessionToken(e){return G.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,G.resolve()}};var Uc=class{constructor(){this.kr=new un(Bt.Kr),this.qr=new un(Bt.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){let a=new Bt(e,n);this.kr=this.kr.add(a),this.qr=this.qr.add(a)}$r(e,n){e.forEach(a=>this.addReference(a,n))}removeReference(e,n){this.Wr(new Bt(e,n))}Qr(e,n){e.forEach(a=>this.removeReference(a,n))}Gr(e){let n=new ne(new yt([])),a=new Bt(n,e),r=new Bt(n,e+1),s=[];return this.qr.forEachInRange([a,r],i=>{this.Wr(i),s.push(i.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let n=new ne(new yt([])),a=new Bt(n,e),r=new Bt(n,e+1),s=De();return this.qr.forEachInRange([a,r],i=>{s=s.add(i.key)}),s}containsKey(e){let n=new Bt(e,0),a=this.kr.firstAfterOrEqual(n);return a!==null&&e.isEqual(a.key)}},Bt=class{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return ne.comparator(e.key,n.key)||Re(e.Hr,n.Hr)}static Ur(e,n){return Re(e.Hr,n.Hr)||ne.comparator(e.key,n.key)}};var oS=class{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new un(Bt.Kr)}checkEmpty(e){return G.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,a,r){let s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new B_(s,n,a,r);this.mutationQueue.push(i);for(let u of r)this.Jr=this.Jr.add(new Bt(u.key,s)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return G.resolve(i)}lookupMutationBatch(e,n){return G.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){let a=n+1,r=this.Xr(a),s=r<0?0:r;return G.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return G.resolve(this.mutationQueue.length===0?M2:this.Yn-1)}getAllMutationBatches(e){return G.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){let a=new Bt(n,0),r=new Bt(n,Number.POSITIVE_INFINITY),s=[];return this.Jr.forEachInRange([a,r],i=>{let u=this.Zr(i.Hr);s.push(u)}),G.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let a=new un(Re);return n.forEach(r=>{let s=new Bt(r,0),i=new Bt(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([s,i],u=>{a=a.add(u.Hr)})}),G.resolve(this.Yr(a))}getAllMutationBatchesAffectingQuery(e,n){let a=n.path,r=a.length+1,s=a;ne.isDocumentKey(s)||(s=s.child(""));let i=new Bt(new ne(s),0),u=new un(Re);return this.Jr.forEachWhile(l=>{let c=l.key.path;return!!a.isPrefixOf(c)&&(c.length===r&&(u=u.add(l.Hr)),!0)},i),G.resolve(this.Yr(u))}Yr(e){let n=[];return e.forEach(a=>{let r=this.Zr(a);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){St(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let a=this.Jr;return G.forEach(n.mutations,r=>{let s=new Bt(r.key,n.batchId);return a=a.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=a})}nr(e){}containsKey(e,n){let a=new Bt(n,0),r=this.Jr.firstAfterOrEqual(a);return G.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,G.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}};var uS=class{constructor(e){this.ti=e,this.docs=function(){return new Pt(ne.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){let a=n.key,r=this.docs.get(a),s=r?r.size:0,i=this.ti(n);return this.docs=this.docs.insert(a,{document:n.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,a.path.popLast())}removeEntry(e){let n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){let a=this.docs.get(n);return G.resolve(a?a.document.mutableCopy():ka.newInvalidDocument(n))}getEntries(e,n){let a=Ys();return n.forEach(r=>{let s=this.docs.get(r);a=a.insert(r,s?s.document.mutableCopy():ka.newInvalidDocument(r))}),G.resolve(a)}getDocumentsMatchingQuery(e,n,a,r){let s=Ys(),i=n.path,u=new ne(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){let{key:c,value:{document:f}}=l.getNext();if(!i.isPrefixOf(c.path))break;c.path.length>i.length+1||D2(k2(f),a)<=0||(r.has(f.key)||Op(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return G.resolve(s)}getAllFromCollectionGroup(e,n,a,r){oe(9500)}ni(e,n){return G.forEach(this.docs,a=>n(a))}newChangeBuffer(e){return new lS(this)}getSize(e){return G.resolve(this.size)}},lS=class extends tS{constructor(e){super(),this.Mr=e}applyChanges(e){let n=[];return this.changes.forEach((a,r)=>{r.isValidDocument()?n.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(a)}),G.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}};var cS=class{constructor(e){this.persistence=e,this.ri=new Yr(n=>WS(n),YS),this.lastRemoteSnapshotVersion=he.min(),this.highestTargetId=0,this.ii=0,this.si=new Uc,this.targetCount=0,this.oi=Fc._r()}forEachTarget(e,n){return this.ri.forEach((a,r)=>n(r)),G.resolve()}getLastRemoteSnapshotVersion(e){return G.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return G.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),G.resolve(this.highestTargetId)}setTargetsMetadata(e,n,a){return a&&(this.lastRemoteSnapshotVersion=a),n>this.ii&&(this.ii=n),G.resolve()}lr(e){this.ri.set(e.target,e);let n=e.targetId;n>this.highestTargetId&&(this.oi=new Fc(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,G.resolve()}updateTargetData(e,n){return this.lr(n),G.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,G.resolve()}removeTargets(e,n,a){let r=0,s=[];return this.ri.forEach((i,u)=>{u.sequenceNumber<=n&&a.get(u.targetId)===null&&(this.ri.delete(i),s.push(this.removeMatchingKeysForTargetId(e,u.targetId)),r++)}),G.waitFor(s).next(()=>r)}getTargetCount(e){return G.resolve(this.targetCount)}getTargetData(e,n){let a=this.ri.get(n)||null;return G.resolve(a)}addMatchingKeys(e,n,a){return this.si.$r(n,a),G.resolve()}removeMatchingKeys(e,n,a){this.si.Qr(n,a);let r=this.persistence.referenceDelegate,s=[];return r&&n.forEach(i=>{s.push(r.markPotentiallyOrphaned(e,i))}),G.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),G.resolve()}getMatchingKeysForTargetId(e,n){let a=this.si.jr(n);return G.resolve(a)}containsKey(e,n){return G.resolve(this.si.containsKey(n))}};var pp=class{constructor(e,n){this._i={},this.overlays={},this.ai=new fu(0),this.ui=!1,this.ui=!0,this.ci=new iS,this.referenceDelegate=e(this),this.li=new cS(this),this.indexManager=new Q_,this.remoteDocumentCache=function(r){return new uS(r)}(a=>this.referenceDelegate.hi(a)),this.serializer=new X_(n),this.Pi=new rS(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new sS,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let a=this._i[e.toKey()];return a||(a=new oS(n,this.referenceDelegate),this._i[e.toKey()]=a),a}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,a){$("MemoryPersistence","Starting transaction:",e);let r=new dS(this.ai.next());return this.referenceDelegate.Ti(),a(r).next(s=>this.referenceDelegate.Ii(r).next(()=>s)).toPromise().then(s=>(r.raiseOnCommittedEvent(),s))}Ei(e,n){return G.or(Object.values(this._i).map(a=>()=>a.containsKey(e,n)))}},dS=class extends C_{constructor(e){super(),this.currentSequenceNumber=e}},fS=class t{constructor(e){this.persistence=e,this.Ri=new Uc,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw oe(60996)}addReference(e,n,a){return this.Ri.addReference(a,n),this.di.delete(a.toString()),G.resolve()}removeReference(e,n,a){return this.Ri.removeReference(a,n),this.di.add(a.toString()),G.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),G.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(r=>this.di.add(r.toString()));let a=this.persistence.getTargetCache();return a.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(s=>this.di.add(s.toString()))}).next(()=>a.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){let n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return G.forEach(this.di,a=>{let r=ne.fromPath(a);return this.mi(e,r).next(s=>{s||n.removeEntry(r,he.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(a=>{a?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return G.or([()=>G.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}},mp=class t{constructor(e,n){this.persistence=e,this.fi=new Yr(a=>V2(a.path),(a,r)=>a.isEqual(r)),this.garbageCollector=RV(this,n)}static Vi(e,n){return new t(e,n)}Ti(){}Ii(e){return G.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){let n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(a=>n.next(r=>a+r))}pr(e){let n=0;return this.mr(e,a=>{n++}).next(()=>n)}mr(e,n){return G.forEach(this.fi,(a,r)=>this.wr(e,a,r).next(s=>s?G.resolve():n(r)))}removeTargets(e,n,a){return this.persistence.getTargetCache().removeTargets(e,n,a)}removeOrphanedDocuments(e,n){let a=0,r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ni(e,i=>this.wr(e,i,n).next(u=>{u||(a++,s.removeEntry(i,he.min()))})).next(()=>s.apply(e)).next(()=>a)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),G.resolve()}removeTarget(e,n){let a=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,a)}addReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),G.resolve()}removeReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),G.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),G.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Xh(e.data.value)),n}wr(e,n,a){return G.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{let r=this.fi.get(n);return G.resolve(r!==void 0&&r>a)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var hS=class t{constructor(e,n,a,r){this.targetId=e,this.fromCache=n,this.Ts=a,this.Is=r}static Es(e,n){let a=De(),r=De();for(let s of n.docChanges)switch(s.type){case 0:a=a.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new t(e,n.fromCache,a,r)}};var pS=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var mS=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return $L()?8:O2(an())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,a,r){let s={result:null};return this.gs(e,n).next(i=>{s.result=i}).next(()=>{if(!s.result)return this.ps(e,n,r,a).next(i=>{s.result=i})}).next(()=>{if(s.result)return;let i=new pS;return this.ys(e,n,i).next(u=>{if(s.result=u,this.As)return this.ws(e,n,i,u.size)})}).next(()=>s.result)}ws(e,n,a,r){return a.documentReadCount<this.Vs?(nu()<=Ee.DEBUG&&$("QueryEngine","SDK will not create cache indexes for query:",au(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),G.resolve()):(nu()<=Ee.DEBUG&&$("QueryEngine","Query:",au(n),"scans",a.documentReadCount,"local documents and returns",r,"documents as results."),a.documentReadCount>this.ds*r?(nu()<=Ee.DEBUG&&$("QueryEngine","The SDK decides to create cache indexes for query:",au(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ar(n))):G.resolve())}gs(e,n){if(Ax(n))return G.resolve(null);let a=ar(n);return this.indexManager.getIndexType(e,a).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=kc(n,null,"F"),a=ar(n)),this.indexManager.getDocumentsMatchingTarget(e,a).next(s=>{let i=De(...s);return this.fs.getDocuments(e,i).next(u=>this.indexManager.getMinOffset(e,a).next(l=>{let c=this.bs(n,u);return this.Ss(n,c,i,l.readTime)?this.gs(e,kc(n,null,"F")):this.Ds(e,c,n,l)}))})))}ps(e,n,a,r){return Ax(n)||r.isEqual(he.min())?G.resolve(null):this.fs.getDocuments(e,a).next(s=>{let i=this.bs(n,s);return this.Ss(n,i,a,r)?G.resolve(null):(nu()<=Ee.DEBUG&&$("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),au(n)),this.Ds(e,i,n,R2(r,Cc)).next(u=>u))})}bs(e,n){let a=new un(N0(e));return n.forEach((r,s)=>{Op(e,s)&&(a=a.add(s))}),a}Ss(e,n,a,r){if(e.limit===null)return!1;if(a.size!==n.size)return!0;let s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ys(e,n,a){return nu()<=Ee.DEBUG&&$("QueryEngine","Using full collection scan to execute query:",au(n)),this.fs.getDocumentsMatchingQuery(e,n,Vi.min(),a)}Ds(e,n,a,r){return this.fs.getDocumentsMatchingQuery(e,a,r).next(s=>(n.forEach(i=>{s=s.insert(i.key,i)}),s))}};var $S="LocalStore",kV=3e8,gS=class{constructor(e,n,a,r){this.persistence=e,this.Cs=n,this.serializer=r,this.vs=new Pt(Re),this.Fs=new Yr(s=>WS(s),YS),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(a)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new aS(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}};function DV(t,e,n,a){return new gS(t,e,n,a)}async function aR(t,e){let n=Pe(t);return await n.persistence.runTransaction("Handle user change","readonly",a=>{let r;return n.mutationQueue.getAllMutationBatches(a).next(s=>(r=s,n.Os(e),n.mutationQueue.getAllMutationBatches(a))).next(s=>{let i=[],u=[],l=De();for(let c of r){i.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}for(let c of s){u.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}return n.localDocuments.getDocuments(a,l).next(c=>({Ns:c,removedBatchIds:i,addedBatchIds:u}))})})}function rR(t){let e=Pe(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function PV(t,e){let n=Pe(t),a=e.snapshotVersion,r=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{let i=n.xs.newChangeBuffer({trackRemovals:!0});r=n.vs;let u=[];e.targetChanges.forEach((f,m)=>{let p=r.get(m);if(!p)return;u.push(n.li.removeMatchingKeys(s,f.removedDocuments,m).next(()=>n.li.addMatchingKeys(s,f.addedDocuments,m)));let S=p.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(m)!==null?S=S.withResumeToken(yn.EMPTY_BYTE_STRING,he.min()).withLastLimboFreeSnapshotVersion(he.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,a)),r=r.insert(m,S),function(D,A,E){return D.resumeToken.approximateByteSize()===0||A.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=kV?!0:E.addedDocuments.size+E.modifiedDocuments.size+E.removedDocuments.size>0}(p,S,f)&&u.push(n.li.updateTargetData(s,S))});let l=Ys(),c=De();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&u.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),u.push(OV(s,i,e.documentUpdates).next(f=>{l=f.Bs,c=f.Ls})),!a.isEqual(he.min())){let f=n.li.getLastRemoteSnapshotVersion(s).next(m=>n.li.setTargetsMetadata(s,s.currentSequenceNumber,a));u.push(f)}return G.waitFor(u).next(()=>i.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,l,c)).next(()=>l)}).then(s=>(n.vs=r,s))}function OV(t,e,n){let a=De(),r=De();return n.forEach(s=>a=a.add(s)),e.getEntries(t,a).next(s=>{let i=Ys();return n.forEach((u,l)=>{let c=s.get(u);l.isFoundDocument()!==c.isFoundDocument()&&(r=r.add(u)),l.isNoDocument()&&l.version.isEqual(he.min())?(e.removeEntry(u,l.readTime),i=i.insert(u,l)):!c.isValidDocument()||l.version.compareTo(c.version)>0||l.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(l),i=i.insert(u,l)):$($S,"Ignoring outdated watch update for ",u,". Current version:",c.version," Watch version:",l.version)}),{Bs:i,Ls:r}})}function MV(t,e){let n=Pe(t);return n.persistence.runTransaction("Allocate target","readwrite",a=>{let r;return n.li.getTargetData(a,e).next(s=>s?(r=s,G.resolve(r)):n.li.allocateTargetId(a).next(i=>(r=new Vc(e,i,"TargetPurposeListen",a.currentSequenceNumber),n.li.addTargetData(a,r).next(()=>r))))}).then(a=>{let r=n.vs.get(a.targetId);return(r===null||a.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.vs=n.vs.insert(a.targetId,a),n.Fs.set(e,a.targetId)),a})}async function yS(t,e,n){let a=Pe(t),r=a.vs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await a.persistence.runTransaction("Release target",s,i=>a.persistence.referenceDelegate.removeTarget(i,r))}catch(i){if(!Cu(i))throw i;$($S,`Failed to update sequence numbers for target ${e}: ${i}`)}a.vs=a.vs.remove(e),a.Fs.delete(r.target)}function Bx(t,e,n){let a=Pe(t),r=he.min(),s=De();return a.persistence.runTransaction("Execute query","readwrite",i=>function(l,c,f){let m=Pe(l),p=m.Fs.get(f);return p!==void 0?G.resolve(m.vs.get(p)):m.li.getTargetData(c,f)}(a,i,ar(e)).next(u=>{if(u)return r=u.lastLimboFreeSnapshotVersion,a.li.getMatchingKeysForTargetId(i,u.targetId).next(l=>{s=l})}).next(()=>a.Cs.getDocumentsMatchingQuery(i,e,n?r:he.min(),n?s:De())).next(u=>(NV(a,tV(e),u),{documents:u,ks:s})))}function NV(t,e,n){let a=t.Ms.get(e)||he.min();n.forEach((r,s)=>{s.readTime.compareTo(a)>0&&(a=s.readTime)}),t.Ms.set(e,a)}var gp=class{constructor(){this.activeTargetIds=oV()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var IS=class{constructor(){this.vo=new gp,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,a){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,a){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new gp,Promise.resolve()}handleUserChange(e,n,a){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var _S=class{Mo(e){}shutdown(){}};var qx="ConnectivityMonitor",yp=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){$(qx,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){$(qx,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var Yh=null;function SS(){return Yh===null?Yh=function(){return 268435456+Math.round(2147483648*Math.random())}():Yh++,"0x"+Yh.toString(16)}var __="RestConnection",VV={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},vS=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let n=e.ssl?"https":"http",a=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${a}/databases/${r}`,this.$o=this.databaseId.database===ip?`project_id=${a}`:`project_id=${a}&database_id=${r}`}Wo(e,n,a,r,s){let i=SS(),u=this.Qo(e,n.toUriEncodedString());$(__,`Sending RPC '${e}' ${i}:`,u,a);let l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,r,s);let{host:c}=new URL(u),f=Ya(c);return this.zo(e,u,l,a,f).then(m=>($(__,`Received RPC '${e}' ${i}: `,m),m),m=>{throw zr(__,`RPC '${e}' ${i} failed with error: `,m,"url: ",u,"request:",a),m})}jo(e,n,a,r,s,i){return this.Wo(e,n,a,r,s)}Go(e,n,a){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+bu}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,s)=>e[s]=r),a&&a.headers.forEach((r,s)=>e[s]=r)}Qo(e,n){let a=VV[e],r=`${this.qo}/v1/${n}:${a}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var ES=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var wn="WebChannelConnection",vc=(t,e,n)=>{t.listen(e,a=>{try{n(a)}catch(r){setTimeout(()=>{throw r},0)}})},Ip=class t extends vS{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=p_();vc(e,h_.STAT_EVENT,n=>{n.stat===jh.PROXY?$(wn,"STAT_EVENT: detected buffering proxy"):n.stat===jh.NOPROXY&&$(wn,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,n,a,r,s){let i=SS();return new Promise((u,l)=>{let c=new d_;c.setWithCredentials(!0),c.listenOnce(f_.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case Sc.NO_ERROR:let m=c.getResponseJson();$(wn,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(m)),u(m);break;case Sc.TIMEOUT:$(wn,`RPC '${e}' ${i} timed out`),l(new X(H.DEADLINE_EXCEEDED,"Request time out"));break;case Sc.HTTP_ERROR:let p=c.getStatus();if($(wn,`RPC '${e}' ${i} failed with status:`,p,"response text:",c.getResponseText()),p>0){let S=c.getResponseJson();Array.isArray(S)&&(S=S[0]);let R=S?.error;if(R&&R.status&&R.message){let D=function(E){let _=E.toLowerCase().replace(/_/g,"-");return Object.values(H).indexOf(_)>=0?_:H.UNKNOWN}(R.status);l(new X(D,R.message))}else l(new X(H.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new X(H.UNAVAILABLE,"Connection failed."));break;default:oe(9055,{l_:e,streamId:i,h_:c.getLastErrorCode(),P_:c.getLastError()})}}finally{$(wn,`RPC '${e}' ${i} completed.`)}});let f=JSON.stringify(r);$(wn,`RPC '${e}' ${i} sending request:`,r),c.send(n,"POST",f,a,15)})}T_(e,n,a){let r=SS(),s=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(u.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,n,a),u.encodeInitMessageHeaders=!0;let c=s.join("");$(wn,`Creating RPC '${e}' stream ${r}: ${c}`,u);let f=i.createWebChannel(c,u);this.I_(f);let m=!1,p=!1,S=new ES({Ho:R=>{p?$(wn,`Not sending because RPC '${e}' stream ${r} is closed:`,R):(m||($(wn,`Opening RPC '${e}' stream ${r} transport.`),f.open(),m=!0),$(wn,`RPC '${e}' stream ${r} sending:`,R),f.send(R))},Jo:()=>f.close()});return vc(f,tu.EventType.OPEN,()=>{p||($(wn,`RPC '${e}' stream ${r} transport opened.`),S.i_())}),vc(f,tu.EventType.CLOSE,()=>{p||(p=!0,$(wn,`RPC '${e}' stream ${r} transport closed`),S.o_(),this.E_(f))}),vc(f,tu.EventType.ERROR,R=>{p||(p=!0,zr(wn,`RPC '${e}' stream ${r} transport errored. Name:`,R.name,"Message:",R.message),S.o_(new X(H.UNAVAILABLE,"The operation could not be completed")))}),vc(f,tu.EventType.MESSAGE,R=>{if(!p){let D=R.data[0];St(!!D,16349);let A=D,E=A?.error||A[0]?.error;if(E){$(wn,`RPC '${e}' stream ${r} received error:`,E);let _=E.status,w=function(z){let v=Ut[z];if(v!==void 0)return j0(v)}(_),L=E.message;_==="NOT_FOUND"&&L.includes("database")&&L.includes("does not exist")&&L.includes(this.databaseId.database)&&zr(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),w===void 0&&(w=H.INTERNAL,L="Unknown error status: "+_+" with message "+E.message),p=!0,S.o_(new X(w,L)),f.close()}else $(wn,`RPC '${e}' stream ${r} received:`,D),S.__(D)}}),t.u_(),setTimeout(()=>{S.s_()},0),S}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,a){super.Go(e,n,a),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return m_()}};function FV(t){return new Ip(t)}function S_(){return typeof document<"u"?document:null}function Yc(t){return new j_(t,!0)}Ip.c_=!1;var _p=class{constructor(e,n,a=1e3,r=1.5,s=6e4){this.Ci=e,this.timerId=n,this.R_=a,this.A_=r,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let n=Math.floor(this.d_+this.y_()),a=Math.max(0,Date.now()-this.f_),r=Math.max(0,n-a);r>0&&$("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${a} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var Hx="PersistentStream",TS=class{constructor(e,n,a,r,s,i,u,l){this.Ci=e,this.b_=a,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new _p(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===H.RESOURCE_EXHAUSTED?(Hr(n.toString()),Hr("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===H.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([a,r])=>{this.D_===n&&this.G_(a,r)},a=>{e(()=>{let r=new X(H.UNKNOWN,"Fetching auth token failed: "+a.message);return this.z_(r)})})}G_(e,n){let a=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{a(()=>this.listener.Zo())}),this.stream.Yo(()=>{a(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{a(()=>this.z_(r))}),this.stream.onMessage(r=>{a(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return $(Hx,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():($(Hx,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},bS=class extends TS{constructor(e,n,a,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,a,r,i),this.serializer=s}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let n=vV(this.serializer,e),a=function(s){if(!("targetChange"in s))return he.min();let i=s.targetChange;return i.targetIds&&i.targetIds.length?he.min():i.readTime?lu(i.readTime):he.min()}(e);return this.listener.J_(n,a)}Z_(e){let n={};n.database=Nx(this.serializer),n.addTarget=function(s,i){let u,l=i.target;if(u=U_(l)?{documents:EV(s,l)}:{query:TV(s,l).ft},u.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){u.resumeToken=K0(s,i.resumeToken);let c=K_(s,i.expectedCount);c!==null&&(u.expectedCount=c)}else if(i.snapshotVersion.compareTo(he.min())>0){u.readTime=W_(s,i.snapshotVersion.toTimestamp());let c=K_(s,i.expectedCount);c!==null&&(u.expectedCount=c)}return u}(this.serializer,e);let a=wV(this.serializer,e);a&&(n.labels=a),this.K_(n)}X_(e){let n={};n.database=Nx(this.serializer),n.removeTarget=e,this.K_(n)}};var wS=class{},CS=class extends wS{constructor(e,n,a,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=a,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new X(H.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,a,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Wo(e,Y_(n,a),r,s,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===H.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new X(H.UNKNOWN,s.toString())})}jo(e,n,a,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,u])=>this.connection.jo(e,Y_(n,a),r,i,u,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===H.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new X(H.UNKNOWN,i.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function UV(t,e,n,a){return new CS(t,e,n,a)}var LS=class{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Hr(n),this.aa=!1):$("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var Su="RemoteStore",AS=class{constructor(e,n,a,r,s){this.localStore=e,this.datastore=n,this.asyncQueue=a,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(i=>{a.enqueueAndForget(async()=>{Qc(this)&&($(Su,"Restarting streams for network reachability change."),await async function(l){let c=Pe(l);c.Ea.add(4),await Xc(c),c.Va.set("Unknown"),c.Ea.delete(4),await Mp(c)}(this))})}),this.Va=new LS(a,r)}};async function Mp(t){if(Qc(t))for(let e of t.Ra)await e(!0)}async function Xc(t){for(let e of t.Ra)await e(!1)}function sR(t,e){let n=Pe(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),tv(n)?ev(n):Au(n).O_()&&ZS(n,e))}function JS(t,e){let n=Pe(t),a=Au(n);n.Ia.delete(e),a.O_()&&iR(n,e),n.Ia.size===0&&(a.O_()?a.L_():Qc(n)&&n.Va.set("Unknown"))}function ZS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(he.min())>0){let n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Au(t).Z_(e)}function iR(t,e){t.da.$e(e),Au(t).X_(e)}function ev(t){t.da=new G_({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),Au(t).start(),t.Va.ua()}function tv(t){return Qc(t)&&!Au(t).x_()&&t.Ia.size>0}function Qc(t){return Pe(t).Ea.size===0}function oR(t){t.da=void 0}async function BV(t){t.Va.set("Online")}async function qV(t){t.Ia.forEach((e,n)=>{ZS(t,e)})}async function HV(t,e){oR(t),tv(t)?(t.Va.ha(e),ev(t)):t.Va.set("Unknown")}async function zV(t,e,n){if(t.Va.set("Online"),e instanceof dp&&e.state===2&&e.cause)try{await async function(r,s){let i=s.cause;for(let u of s.targetIds)r.Ia.has(u)&&(await r.remoteSyncer.rejectListen(u,i),r.Ia.delete(u),r.da.removeTarget(u))}(t,e)}catch(a){$(Su,"Failed to remove targets %s: %s ",e.targetIds.join(","),a),await zx(t,a)}else if(e instanceof uu?t.da.Xe(e):e instanceof cp?t.da.st(e):t.da.tt(e),!n.isEqual(he.min()))try{let a=await rR(t.localStore);n.compareTo(a)>=0&&await function(s,i){let u=s.da.Tt(i);return u.targetChanges.forEach((l,c)=>{if(l.resumeToken.approximateByteSize()>0){let f=s.Ia.get(c);f&&s.Ia.set(c,f.withResumeToken(l.resumeToken,i))}}),u.targetMismatches.forEach((l,c)=>{let f=s.Ia.get(l);if(!f)return;s.Ia.set(l,f.withResumeToken(yn.EMPTY_BYTE_STRING,f.snapshotVersion)),iR(s,l);let m=new Vc(f.target,l,c,f.sequenceNumber);ZS(s,m)}),s.remoteSyncer.applyRemoteEvent(u)}(t,n)}catch(a){$(Su,"Failed to raise snapshot:",a),await zx(t,a)}}async function zx(t,e,n){if(!Cu(e))throw e;t.Ea.add(1),await Xc(t),t.Va.set("Offline"),n||(n=()=>rR(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{$(Su,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await Mp(t)})}async function Gx(t,e){let n=Pe(t);n.asyncQueue.verifyOperationInProgress(),$(Su,"RemoteStore received new credentials");let a=Qc(n);n.Ea.add(3),await Xc(n),a&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await Mp(n)}async function GV(t,e){let n=Pe(t);e?(n.Ea.delete(2),await Mp(n)):e||(n.Ea.add(2),await Xc(n),n.Va.set("Unknown"))}function Au(t){return t.ma||(t.ma=function(n,a,r){let s=Pe(n);return s.sa(),new bS(a,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,r)}(t.datastore,t.asyncQueue,{Zo:BV.bind(null,t),Yo:qV.bind(null,t),t_:HV.bind(null,t),J_:zV.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),tv(t)?ev(t):t.Va.set("Unknown")):(await t.ma.stop(),oR(t))})),t.ma}var xS=class t{constructor(e,n,a,r,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=a,this.op=r,this.removalCallback=s,this.deferred=new Br,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(i=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,a,r,s){let i=Date.now()+a,u=new t(e,n,i,r,s);return u.start(a),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new X(H.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function uR(t,e){if(Hr("AsyncQueue",`${e}: ${t}`),Cu(t))return new X(H.UNAVAILABLE,`${e}: ${t}`);throw t}var Bc=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(n,a)=>e(n,a)||ne.comparator(n.key,a.key):(n,a)=>ne.comparator(n.key,a.key),this.keyedMap=Ec(),this.sortedSet=new Pt(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,a)=>(e(n),!1))}add(e){let n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){let n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.sortedSet.getIterator(),a=e.sortedSet.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(!r.isEqual(s))return!1}return!0}toString(){let e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){let a=new t;return a.comparator=this.comparator,a.keyedMap=e,a.sortedSet=n,a}};var Sp=class{constructor(){this.ga=new Pt(ne.comparator)}track(e){let n=e.doc.key,a=this.ga.get(n);a?e.type!==0&&a.type===3?this.ga=this.ga.insert(n,e):e.type===3&&a.type!==1?this.ga=this.ga.insert(n,{type:a.type,doc:e.doc}):e.type===2&&a.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&a.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&a.type===0?this.ga=this.ga.remove(n):e.type===1&&a.type===2?this.ga=this.ga.insert(n,{type:1,doc:a.doc}):e.type===0&&a.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):oe(63341,{Vt:e,pa:a}):this.ga=this.ga.insert(n,e)}ya(){let e=[];return this.ga.inorderTraversal((n,a)=>{e.push(a)}),e}},Fi=class t{constructor(e,n,a,r,s,i,u,l,c){this.query=e,this.docs=n,this.oldDocs=a,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=c}static fromInitialDocuments(e,n,a,r,s){let i=[];return n.forEach(u=>{i.push({type:0,doc:u})}),new t(e,n,Bc.emptySet(n),i,a,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Pp(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let n=this.docChanges,a=e.docChanges;if(n.length!==a.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==a[r].type||!n[r].doc.isEqual(a[r].doc))return!1;return!0}};var RS=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},kS=class{constructor(){this.queries=jx(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,a){let r=Pe(n),s=r.queries;r.queries=jx(),s.forEach((i,u)=>{for(let l of u.ba)l.onError(a)})})(this,new X(H.ABORTED,"Firestore shutting down"))}};function jx(){return new Yr(t=>M0(t),Pp)}async function jV(t,e){let n=Pe(t),a=3,r=e.query,s=n.queries.get(r);s?!s.Sa()&&e.Da()&&(a=2):(s=new RS,a=e.Da()?0:1);try{switch(a){case 0:s.wa=await n.onListen(r,!0);break;case 1:s.wa=await n.onListen(r,!1);break;case 2:await n.onFirstRemoteStoreListen(r)}}catch(i){let u=uR(i,`Initialization of query '${au(e.query)}' failed`);return void e.onError(u)}n.queries.set(r,s),s.ba.push(e),e.va(n.onlineState),s.wa&&e.Fa(s.wa)&&nv(n)}async function KV(t,e){let n=Pe(t),a=e.query,r=3,s=n.queries.get(a);if(s){let i=s.ba.indexOf(e);i>=0&&(s.ba.splice(i,1),s.ba.length===0?r=e.Da()?0:1:!s.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return n.queries.delete(a),n.onUnlisten(a,!0);case 1:return n.queries.delete(a),n.onUnlisten(a,!1);case 2:return n.onLastRemoteStoreUnlisten(a);default:return}}function WV(t,e){let n=Pe(t),a=!1;for(let r of e){let s=r.query,i=n.queries.get(s);if(i){for(let u of i.ba)u.Fa(r)&&(a=!0);i.wa=r}}a&&nv(n)}function YV(t,e,n){let a=Pe(t),r=a.queries.get(e);if(r)for(let s of r.ba)s.onError(n);a.queries.delete(e)}function nv(t){t.Ca.forEach(e=>{e.next()})}var DS,Kx;(Kx=DS||(DS={})).Ma="default",Kx.Cache="cache";var PS=class{constructor(e,n,a){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=a||{}}Fa(e){if(!this.options.includeMetadataChanges){let a=[];for(let r of e.docChanges)r.type!==3&&a.push(r);e=new Fi(e.query,e.docs,e.oldDocs,a,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;let a=n!=="Offline";return(!this.options.Ka||!a)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=Fi.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==DS.Cache}};var vp=class{constructor(e){this.key=e}},Ep=class{constructor(e){this.key=e}},OS=class{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=De(),this.mutatedKeys=De(),this.eu=N0(e),this.tu=new Bc(this.eu)}get nu(){return this.Za}ru(e,n){let a=n?n.iu:new Sp,r=n?n.tu:this.tu,s=n?n.mutatedKeys:this.mutatedKeys,i=r,u=!1,l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,c=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((f,m)=>{let p=r.get(f),S=Op(this.query,m)?m:null,R=!!p&&this.mutatedKeys.has(p.key),D=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations),A=!1;p&&S?p.data.isEqual(S.data)?R!==D&&(a.track({type:3,doc:S}),A=!0):this.su(p,S)||(a.track({type:2,doc:S}),A=!0,(l&&this.eu(S,l)>0||c&&this.eu(S,c)<0)&&(u=!0)):!p&&S?(a.track({type:0,doc:S}),A=!0):p&&!S&&(a.track({type:1,doc:p}),A=!0,(l||c)&&(u=!0)),A&&(S?(i=i.add(S),s=D?s.add(f):s.delete(f)):(i=i.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;i.size>this.query.limit;){let f=this.query.limitType==="F"?i.last():i.first();i=i.delete(f.key),s=s.delete(f.key),a.track({type:1,doc:f})}return{tu:i,iu:a,Ss:u,mutatedKeys:s}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,a,r){let s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let i=e.iu.ya();i.sort((f,m)=>function(S,R){let D=A=>{switch(A){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return oe(20277,{Vt:A})}};return D(S)-D(R)}(f.type,m.type)||this.eu(f.doc,m.doc)),this.ou(a),r=r??!1;let u=n&&!r?this._u():[],l=this.Ya.size===0&&this.current&&!r?1:0,c=l!==this.Xa;return this.Xa=l,i.length!==0||c?{snapshot:new Fi(this.query,e.tu,s,i,e.mutatedKeys,l===0,c,!1,!!a&&a.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Sp,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=De(),this.tu.forEach(a=>{this.uu(a.key)&&(this.Ya=this.Ya.add(a.key))});let n=[];return e.forEach(a=>{this.Ya.has(a)||n.push(new Ep(a))}),this.Ya.forEach(a=>{e.has(a)||n.push(new vp(a))}),n}cu(e){this.Za=e.ks,this.Ya=De();let n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return Fi.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},av="SyncEngine",MS=class{constructor(e,n,a){this.query=e,this.targetId=n,this.view=a}},NS=class{constructor(e){this.key=e,this.hu=!1}},VS=class{constructor(e,n,a,r,s,i){this.localStore=e,this.remoteStore=n,this.eventManager=a,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new Yr(u=>M0(u),Pp),this.Iu=new Map,this.Eu=new Set,this.Ru=new Pt(ne.comparator),this.Au=new Map,this.Vu=new Uc,this.du={},this.mu=new Map,this.fu=Fc.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function XV(t,e,n=!0){let a=hR(t),r,s=a.Tu.get(e);return s?(a.sharedClientState.addLocalQueryTarget(s.targetId),r=s.view.lu()):r=await lR(a,e,n,!0),r}async function QV(t,e){let n=hR(t);await lR(n,e,!0,!1)}async function lR(t,e,n,a){let r=await MV(t.localStore,ar(e)),s=r.targetId,i=t.sharedClientState.addLocalQueryTarget(s,n),u;return a&&(u=await $V(t,e,s,i==="current",r.resumeToken)),t.isPrimaryClient&&n&&sR(t.remoteStore,r),u}async function $V(t,e,n,a,r){t.pu=(m,p,S)=>async function(D,A,E,_){let w=A.view.ru(E);w.Ss&&(w=await Bx(D.localStore,A.query,!1).then(({documents:v})=>A.view.ru(v,w)));let L=_&&_.targetChanges.get(A.targetId),q=_&&_.targetMismatches.get(A.targetId)!=null,z=A.view.applyChanges(w,D.isPrimaryClient,L,q);return Yx(D,A.targetId,z.au),z.snapshot}(t,m,p,S);let s=await Bx(t.localStore,e,!0),i=new OS(e,s.ks),u=i.ru(s.documents),l=Nc.createSynthesizedTargetChangeForCurrentChange(n,a&&t.onlineState!=="Offline",r),c=i.applyChanges(u,t.isPrimaryClient,l);Yx(t,n,c.au);let f=new MS(e,n,i);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),c.snapshot}async function JV(t,e,n){let a=Pe(t),r=a.Tu.get(e),s=a.Iu.get(r.targetId);if(s.length>1)return a.Iu.set(r.targetId,s.filter(i=>!Pp(i,e))),void a.Tu.delete(e);a.isPrimaryClient?(a.sharedClientState.removeLocalQueryTarget(r.targetId),a.sharedClientState.isActiveQueryTarget(r.targetId)||await yS(a.localStore,r.targetId,!1).then(()=>{a.sharedClientState.clearQueryState(r.targetId),n&&JS(a.remoteStore,r.targetId),FS(a,r.targetId)}).catch(Ap)):(FS(a,r.targetId),await yS(a.localStore,r.targetId,!0))}async function ZV(t,e){let n=Pe(t),a=n.Tu.get(e),r=n.Iu.get(a.targetId);n.isPrimaryClient&&r.length===1&&(n.sharedClientState.removeLocalQueryTarget(a.targetId),JS(n.remoteStore,a.targetId))}async function cR(t,e){let n=Pe(t);try{let a=await PV(n.localStore,e);e.targetChanges.forEach((r,s)=>{let i=n.Au.get(s);i&&(St(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?i.hu=!0:r.modifiedDocuments.size>0?St(i.hu,14607):r.removedDocuments.size>0&&(St(i.hu,42227),i.hu=!1))}),await fR(n,a,e)}catch(a){await Ap(a)}}function Wx(t,e,n){let a=Pe(t);if(a.isPrimaryClient&&n===0||!a.isPrimaryClient&&n===1){let r=[];a.Tu.forEach((s,i)=>{let u=i.view.va(e);u.snapshot&&r.push(u.snapshot)}),function(i,u){let l=Pe(i);l.onlineState=u;let c=!1;l.queries.forEach((f,m)=>{for(let p of m.ba)p.va(u)&&(c=!0)}),c&&nv(l)}(a.eventManager,e),r.length&&a.Pu.J_(r),a.onlineState=e,a.isPrimaryClient&&a.sharedClientState.setOnlineState(e)}}async function eF(t,e,n){let a=Pe(t);a.sharedClientState.updateQueryState(e,"rejected",n);let r=a.Au.get(e),s=r&&r.key;if(s){let i=new Pt(ne.comparator);i=i.insert(s,ka.newNoDocument(s,he.min()));let u=De().add(s),l=new lp(he.min(),new Map,new Pt(Re),i,u);await cR(a,l),a.Ru=a.Ru.remove(s),a.Au.delete(e),rv(a)}else await yS(a.localStore,e,!1).then(()=>FS(a,e,n)).catch(Ap)}function FS(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(let a of t.Iu.get(e))t.Tu.delete(a),n&&t.Pu.yu(a,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(a=>{t.Vu.containsKey(a)||dR(t,a)})}function dR(t,e){t.Eu.delete(e.path.canonicalString());let n=t.Ru.get(e);n!==null&&(JS(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),rv(t))}function Yx(t,e,n){for(let a of n)a instanceof vp?(t.Vu.addReference(a.key,e),tF(t,a)):a instanceof Ep?($(av,"Document no longer in limbo: "+a.key),t.Vu.removeReference(a.key,e),t.Vu.containsKey(a.key)||dR(t,a.key)):oe(19791,{wu:a})}function tF(t,e){let n=e.key,a=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(a)||($(av,"New document in limbo: "+n),t.Eu.add(a),rv(t))}function rv(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let n=new ne(yt.fromString(e)),a=t.fu.next();t.Au.set(a,new NS(n)),t.Ru=t.Ru.insert(n,a),sR(t.remoteStore,new Vc(ar(XS(n.path)),a,"TargetPurposeLimboResolution",fu.ce))}}async function fR(t,e,n){let a=Pe(t),r=[],s=[],i=[];a.Tu.isEmpty()||(a.Tu.forEach((u,l)=>{i.push(a.pu(l,e,n).then(c=>{if((c||n)&&a.isPrimaryClient){let f=c?!c.fromCache:n?.targetChanges.get(l.targetId)?.current;a.sharedClientState.updateQueryState(l.targetId,f?"current":"not-current")}if(c){r.push(c);let f=hS.Es(l.targetId,c);s.push(f)}}))}),await Promise.all(i),a.Pu.J_(r),await async function(l,c){let f=Pe(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>G.forEach(c,p=>G.forEach(p.Ts,S=>f.persistence.referenceDelegate.addReference(m,p.targetId,S)).next(()=>G.forEach(p.Is,S=>f.persistence.referenceDelegate.removeReference(m,p.targetId,S)))))}catch(m){if(!Cu(m))throw m;$($S,"Failed to update sequence numbers: "+m)}for(let m of c){let p=m.targetId;if(!m.fromCache){let S=f.vs.get(p),R=S.snapshotVersion,D=S.withLastLimboFreeSnapshotVersion(R);f.vs=f.vs.insert(p,D)}}}(a.localStore,s))}async function nF(t,e){let n=Pe(t);if(!n.currentUser.isEqual(e)){$(av,"User change. New user:",e.toKey());let a=await aR(n.localStore,e);n.currentUser=e,function(s,i){s.mu.forEach(u=>{u.forEach(l=>{l.reject(new X(H.CANCELLED,i))})}),s.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,a.removedBatchIds,a.addedBatchIds),await fR(n,a.Ns)}}function aF(t,e){let n=Pe(t),a=n.Au.get(e);if(a&&a.hu)return De().add(a.key);{let r=De(),s=n.Iu.get(e);if(!s)return r;for(let i of s){let u=n.Tu.get(i);r=r.unionWith(u.view.nu)}return r}}function hR(t){let e=Pe(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=cR.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=aF.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=eF.bind(null,e),e.Pu.J_=WV.bind(null,e.eventManager),e.Pu.yu=YV.bind(null,e.eventManager),e}var Ui=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Yc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return DV(this.persistence,new mS,e.initialUser,this.serializer)}Cu(e){return new pp(fS.Vi,this.serializer)}Du(e){return new IS}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};Ui.provider={build:()=>new Ui};var Tp=class extends Ui{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){St(this.persistence.referenceDelegate instanceof mp,46915);let a=this.persistence.referenceDelegate.garbageCollector;return new Z_(a,e.asyncQueue,n)}Cu(e){let n=this.cacheSizeBytes!==void 0?_a.withCacheSize(this.cacheSizeBytes):_a.DEFAULT;return new pp(a=>mp.Vi(a,n),this.serializer)}};var vu=class{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=a=>Wx(this.syncEngine,a,1),this.remoteStore.remoteSyncer.handleCredentialChange=nF.bind(null,this.syncEngine),await GV(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new kS}()}createDatastore(e){let n=Yc(e.databaseInfo.databaseId),a=FV(e.databaseInfo);return UV(e.authCredentials,e.appCheckCredentials,a,n)}createRemoteStore(e){return function(a,r,s,i,u){return new AS(a,r,s,i,u)}(this.localStore,this.datastore,e.asyncQueue,n=>Wx(this.syncEngine,n,0),function(){return yp.v()?new yp:new _S}())}createSyncEngine(e,n){return function(r,s,i,u,l,c,f){let m=new VS(r,s,i,u,l,c);return f&&(m.gu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){await async function(n){let a=Pe(n);$(Su,"RemoteStore shutting down."),a.Ea.add(5),await Xc(a),a.Aa.shutdown(),a.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};vu.provider={build:()=>new vu};var US=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):Hr("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}};var Xs="FirestoreClient",BS=class{constructor(e,n,a,r,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=a,this._databaseInfo=r,this.user=on.UNAUTHENTICATED,this.clientId=cu.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(a,async i=>{$(Xs,"Received user=",i.uid),await this.authCredentialListener(i),this.user=i}),this.appCheckCredentials.start(a,i=>($(Xs,"Received new app check token=",i),this.appCheckCredentialListener(i,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new Br;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){let a=uR(n,"Failed to shutdown persistence");e.reject(a)}}),e.promise}};async function v_(t,e){t.asyncQueue.verifyOperationInProgress(),$(Xs,"Initializing OfflineComponentProvider");let n=t.configuration;await e.initialize(n);let a=n.initialUser;t.setCredentialChangeListener(async r=>{a.isEqual(r)||(await aR(e.localStore,r),a=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Xx(t,e){t.asyncQueue.verifyOperationInProgress();let n=await rF(t);$(Xs,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(a=>Gx(e.remoteStore,a)),t.setAppCheckTokenChangeListener((a,r)=>Gx(e.remoteStore,r)),t._onlineComponents=e}async function rF(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){$(Xs,"Using user provided OfflineComponentProvider");try{await v_(t,t._uninitializedComponentsProvider._offline)}catch(e){let n=e;if(!function(r){return r.name==="FirebaseError"?r.code===H.FAILED_PRECONDITION||r.code===H.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(n))throw n;zr("Error using user provided cache. Falling back to memory cache: "+n),await v_(t,new Ui)}}else $(Xs,"Using default OfflineComponentProvider"),await v_(t,new Tp(void 0));return t._offlineComponents}async function sF(t){return t._onlineComponents||(t._uninitializedComponentsProvider?($(Xs,"Using user provided OnlineComponentProvider"),await Xx(t,t._uninitializedComponentsProvider._online)):($(Xs,"Using default OnlineComponentProvider"),await Xx(t,new vu))),t._onlineComponents}async function iF(t){let e=await sF(t),n=e.eventManager;return n.onListen=XV.bind(null,e.syncEngine),n.onUnlisten=JV.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=QV.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=ZV.bind(null,e.syncEngine),n}function pR(t,e,n={}){let a=new Br;return t.asyncQueue.enqueueAndForget(async()=>function(s,i,u,l,c){let f=new US({next:p=>{f.Nu(),i.enqueueAndForget(()=>KV(s,m)),p.fromCache&&l.source==="server"?c.reject(new X(H.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(p)},error:p=>c.reject(p)}),m=new PS(u,f,{includeMetadataChanges:!0,Ka:!0});return jV(s,m)}(await iF(t),t.asyncQueue,e,n,a)),a.promise}function mR(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var oF="ComponentProvider",Qx=new Map;function uF(t,e,n,a,r){return new L_(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,mR(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,a)}var gR="firestore.googleapis.com",$x=!0,bp=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new X(H.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=gR,this.ssl=$x}else this.host=e.host,this.ssl=e.ssl??$x;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=nR;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<xV)throw new X(H.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}n0("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=mR(e.experimentalLongPollingOptions??{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new X(H.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new X(H.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new X(H.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(a,r){return a.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},qc=class{constructor(e,n,a,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=a,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new bp({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new X(H.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new X(H.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new bp(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(a){if(!a)return new Jh;switch(a.type){case"firstParty":return new b_(a.sessionIndex||"0",a.iamToken||null,a.authTokenFactory||null);case"provider":return a.client;default:throw new X(H.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){let a=Qx.get(n);a&&($(oF,"Removing Datastore"),Qx.delete(n),a.terminate())}(this),Promise.resolve()}};function yR(t,e,n,a={}){t=jc(t,qc);let r=Ya(e),s=t._getSettings(),i={...s,emulatorOptions:t._getEmulatorOptions()},u=`${e}:${n}`;r&&(Ko(`https://${u}`),Wo("Firestore",!0)),s.host!==gR&&s.host!==u&&zr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...s,host:u,ssl:r,emulatorOptions:a};if(!xa(l,i)&&(t._setSettings(l),a.mockUserToken)){let c,f;if(typeof a.mockUserToken=="string")c=a.mockUserToken,f=on.MOCK_USER;else{c=oh(a.mockUserToken,t._app?.options.projectId);let m=a.mockUserToken.sub||a.mockUserToken.user_id;if(!m)throw new X(H.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new on(m)}t._authCredentials=new E_(new $h(c,f))}}var Da=class t{constructor(e,n,a){this.converter=n,this._query=a,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},Gn=class t{constructor(e,n,a){this.converter=n,this._key=a,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Mi(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,a){if(wu(n,t._jsonSchema))return new t(e,a||null,new ne(yt.fromString(n.referencePath)))}};Gn._jsonSchemaVersion="firestore/documentReference/1.0",Gn._jsonSchema={type:Dt("string",Gn._jsonSchemaVersion),referencePath:Dt("string")};var Mi=class t extends Da{constructor(e,n,a){super(e,n,XS(a)),this._path=a,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new Gn(this.firestore,null,new ne(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function $c(t,e,...n){if(t=rn(t),x2("collection","path",e),t instanceof qc){let a=yt.fromString(e,...n);return gx(a),new Mi(t,null,a)}{if(!(t instanceof Gn||t instanceof Mi))throw new X(H.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let a=t._path.child(yt.fromString(e,...n));return gx(a),new Mi(t.firestore,null,a)}}var Jx="AsyncQueue",wp=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new _p(this,"async_queue_retry"),this._c=()=>{let a=S_();a&&$(Jx,"Visibility state changed to "+a.visibilityState),this.M_.w_()},this.ac=e;let n=S_();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let n=S_();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let n=new Br;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!Cu(e))throw e;$(Jx,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let n=this.ac.then(()=>(this.rc=!0,e().catch(a=>{throw this.nc=a,this.rc=!1,Hr("INTERNAL UNHANDLED ERROR: ",Zx(a)),a}).then(a=>(this.rc=!1,a))));return this.ac=n,n}enqueueAfterDelay(e,n,a){this.uc(),this.oc.indexOf(e)>-1&&(n=0);let r=xS.createAndSchedule(this,e,n,a,s=>this.hc(s));return this.tc.push(r),r}uc(){this.nc&&oe(47125,{Pc:Zx(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,a)=>n.targetTimeMs-a.targetTimeMs);for(let n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let n=this.tc.indexOf(e);this.tc.splice(n,1)}};function Zx(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var Eu=class extends qc{constructor(e,n,a,r){super(e,n,a,r),this.type="firestore",this._queue=new wp,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new wp(e),this._firestoreClient=void 0,await e}}};function sv(t,e){let n=typeof t=="object"?t:$o(),a=typeof t=="string"?t:e||ip,r=Ti(n,"firestore").getImmediate({identifier:a});if(!r._initialized){let s=ih("firestore");s&&yR(r,...s)}return r}function iv(t){if(t._terminated)throw new X(H.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||lF(t),t._firestoreClient}function lF(t){let e=t._freezeSettings(),n=uF(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new BS(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(r){let s=r?._online.build();return{_offline:r?._offline.build(s),_online:s}}(t._componentsProvider))}var rr=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(yn.fromBase64String(e))}catch(n){throw new X(H.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new t(yn.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(wu(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};rr._jsonSchemaVersion="firestore/bytes/1.0",rr._jsonSchema={type:Dt("string",rr._jsonSchemaVersion),bytes:Dt("string")};var Tu=class{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new X(H.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new sa(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var Hc=class{constructor(e){this._methodName=e}};var qr=class t{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new X(H.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new X(H.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Re(this._lat,e._lat)||Re(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(wu(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};qr._jsonSchemaVersion="firestore/geoPoint/1.0",qr._jsonSchema={type:Dt("string",qr._jsonSchemaVersion),latitude:Dt("number"),longitude:Dt("number")};var sr=class t{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(a,r){if(a.length!==r.length)return!1;for(let s=0;s<a.length;++s)if(a[s]!==r[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(wu(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new t(e.vectorValues);throw new X(H.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};sr._jsonSchemaVersion="firestore/vectorValue/1.0",sr._jsonSchema={type:Dt("string",sr._jsonSchemaVersion),vectorValues:Dt("object")};var cF=/^__.*__$/;function IR(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw oe(40011,{dataSource:t})}}var qS=class t{constructor(e,n,a,r,s,i){this.settings=e,this.databaseId=n,this.serializer=a,this.ignoreUndefinedProperties=r,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePathSegment(e),a}childContextForFieldPath(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePath(),a}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Cp(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(IR(this.dataSource)&&cF.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},HS=class{constructor(e,n,a){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=a||Yc(e)}createContext(e,n,a,r=!1){return new qS({dataSource:e,methodName:n,targetDoc:a,path:sa.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function ov(t){let e=t._freezeSettings(),n=Yc(t._databaseId);return new HS(t._databaseId,!!e.ignoreUndefinedProperties,n)}function uv(t,e,n,a=!1){return lv(n,t.createContext(a?4:3,e))}function lv(t,e){if(_R(t=rn(t)))return fF("Unsupported field value:",e,t),dF(t,e);if(t instanceof Hc)return function(a,r){if(!IR(r.dataSource))throw r.createError(`${a._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${a._methodName}() is not currently supported inside arrays`);let s=a._toFieldTransform(r);s&&r.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(a,r){let s=[],i=0;for(let u of a){let l=lv(u,r.childContextForArray(i));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),i++}return{arrayValue:{values:s}}}(t,e)}return function(a,r){if((a=rn(a))===null)return{nullValue:"NULL_VALUE"};if(typeof a=="number")return uV(r.serializer,a);if(typeof a=="boolean")return{booleanValue:a};if(typeof a=="string")return{stringValue:a};if(a instanceof Date){let s=qt.fromDate(a);return{timestampValue:W_(r.serializer,s)}}if(a instanceof qt){let s=new qt(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:W_(r.serializer,s)}}if(a instanceof qr)return{geoPointValue:{latitude:a.latitude,longitude:a.longitude}};if(a instanceof rr)return{bytesValue:K0(r.serializer,a._byteString)};if(a instanceof Gn){let s=r.databaseId,i=a.firestore._databaseId;if(!i.isEqual(s))throw r.createError(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:W0(a.firestore._databaseId||r.databaseId,a._key.path)}}if(a instanceof sr)return function(i,u){let l=i instanceof sr?i.toArray():i;return{mapValue:{fields:{[GS]:{stringValue:jS},[hu]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw u.createError("VectorValues must only contain numeric values.");return QS(u.serializer,f)})}}}}}}(a,r);if(eR(a))return a._toProto(r.serializer);throw r.createError(`Unsupported field value: ${Gc(a)}`)}(t,e)}function dF(t,e){let n={};return _0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Lu(t,(a,r)=>{let s=lv(r,e.childContextForField(a));s!=null&&(n[a]=s)}),{mapValue:{fields:n}}}function _R(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof qt||t instanceof qr||t instanceof rr||t instanceof Gn||t instanceof Hc||t instanceof sr||eR(t))}function fF(t,e,n){if(!_R(n)||!a0(n)){let a=Gc(n);throw a==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+a)}}function Jc(t,e,n){if((e=rn(e))instanceof Tu)return e._internalPath;if(typeof e=="string")return SR(t,e);throw Cp("Field path arguments must be of type string or ",t,!1,void 0,n)}var hF=new RegExp("[~\\*/\\[\\]]");function SR(t,e,n){if(e.search(hF)>=0)throw Cp(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Tu(...e.split("."))._internalPath}catch{throw Cp(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Cp(t,e,n,a,r){let s=a&&!a.isEmpty(),i=r!==void 0,u=`Function ${e}() called with invalid data`;n&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(s||i)&&(l+=" (found",s&&(l+=` in field ${a}`),i&&(l+=` in document ${r}`),l+=")"),new X(H.INVALID_ARGUMENT,u+t+l)}var zc=class{convertValue(e,n="none"){switch(Ks(e)){case 0:return null;case 1:return e.booleanValue;case 2:return gt(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(jr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw oe(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){let a={};return Lu(e,(r,s)=>{a[r]=this.convertValue(s,n)}),a}convertVectorValue(e){let n=e.fields?.[hu].arrayValue?.values?.map(a=>gt(a.doubleValue));return new sr(n)}convertGeoPoint(e){return new qr(gt(e.latitude),gt(e.longitude))}convertArray(e,n){return(e.values||[]).map(a=>this.convertValue(a,n))}convertServerTimestamp(e,n){switch(n){case"previous":let a=Rp(e);return a==null?null:this.convertValue(a,n);case"estimate":return this.convertTimestamp(Ac(e));default:return null}}convertTimestamp(e){let n=Gr(e);return new qt(n.seconds,n.nanos)}convertDocumentKey(e,n){let a=yt.fromString(e);St(Z0(a),9688,{name:e});let r=new xc(a.get(1),a.get(3)),s=new ne(a.popFirst(5));return r.isEqual(n)||Hr(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}};var Lp=class extends zc{constructor(e){super(),this.firestore=e}convertBytes(e){return new rr(e)}convertReference(e){let n=this.convertDocumentKey(e,this.firestore._databaseId);return new Gn(this.firestore,null,n)}};var vR="@firebase/firestore",ER="4.12.0";var Zc=class{constructor(e,n,a,r,s){this._firestore=e,this._userDataWriter=n,this._key=a,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Gn(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new cv(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let n=this._document.data.field(Jc("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}},cv=class extends Zc{data(){return super.data()}};function yF(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new X(H.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var ed=class{},Pu=class extends ed{};function td(t,e,...n){let a=[];e instanceof ed&&a.push(e),a=a.concat(n),function(s){let i=s.filter(l=>l instanceof dv).length,u=s.filter(l=>l instanceof Np).length;if(i>1||i>0&&u>0)throw new X(H.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(a);for(let r of a)t=r._apply(t);return t}var Np=class t extends Pu{constructor(e,n,a){super(),this._field=e,this._op=n,this._value=a,this.type="where"}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=this._parse(e);return LR(e._query,n),new Da(e.firestore,e.converter,Dp(e._query,n))}_parse(e){let n=ov(e.firestore);return function(s,i,u,l,c,f,m){let p;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new X(H.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){bR(m,f);let R=[];for(let D of m)R.push(TR(l,s,D));p={arrayValue:{values:R}}}else p=TR(l,s,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||bR(m,f),p=uv(u,i,m,f==="in"||f==="not-in");return kt.create(c,f,p)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}};function nd(t,e,n){let a=e,r=Jc("where",t);return Np._create(r,a,n)}var dv=class t extends ed{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new t(e,n)}_parse(e){let n=this._queryConstraints.map(a=>a._parse(e)).filter(a=>a.getFilters().length>0);return n.length===1?n[0]:Sa.create(n,this._getOperator())}_apply(e){let n=this._parse(e);return n.getFilters().length===0?e:(function(r,s){let i=r,u=s.getFlattenedFilters();for(let l of u)LR(i,l),i=Dp(i,l)}(e._query,n),new Da(e.firestore,e.converter,Dp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var fv=class t extends Pu{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new t(e,n)}_apply(e){let n=function(r,s,i){if(r.startAt!==null)throw new X(H.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new X(H.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Ws(s,i)}(e._query,this._field,this._direction);return new Da(e.firestore,e.converter,P0(e._query,n))}};function ad(t,e="asc"){let n=e,a=Jc("orderBy",t);return fv._create(a,n)}var hv=class t extends Pu{constructor(e,n,a){super(),this.type=e,this._limit=n,this._limitType=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){return new Da(e.firestore,e.converter,kc(e._query,this._limit,this._limitType))}};function rd(t){return r0("limit",t),hv._create("limit",t,"F")}var pv=class t extends Pu{constructor(e,n,a){super(),this.type=e,this._docOrFields=n,this._inclusive=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=IF(e,this.type,this._docOrFields,this._inclusive);return new Da(e.firestore,e.converter,O0(e._query,n))}};function CR(...t){return pv._create("startAfter",t,!1)}function IF(t,e,n,a){if(n[0]=rn(n[0]),n[0]instanceof Zc)return function(s,i,u,l,c){if(!l)throw new X(H.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);let f=[];for(let m of Oi(s))if(m.field.isKeyField())f.push(Wc(i,l.key));else{let p=l.data.field(m.field);if(Kc(p))throw new X(H.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+m.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(p===null){let S=m.field.canonicalString();throw new X(H.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${S}' (used as the orderBy) does not exist.`)}f.push(p)}return new Kr(f,c)}(t._query,t.firestore._databaseId,e,n[0]._document,a);{let r=ov(t.firestore);return function(i,u,l,c,f,m){let p=i.explicitOrderBy;if(f.length>p.length)throw new X(H.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let S=[];for(let R=0;R<f.length;R++){let D=f[R];if(p[R].field.isKeyField()){if(typeof D!="string")throw new X(H.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof D}`);if(!kp(i)&&D.indexOf("/")!==-1)throw new X(H.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${D}' contains a slash.`);let A=i.path.child(yt.fromString(D));if(!ne.isDocumentKey(A))throw new X(H.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${A}' is not because it contains an odd number of segments.`);let E=new ne(A);S.push(Wc(u,E))}else{let A=uv(l,c,D);S.push(A)}}return new Kr(S,m)}(t._query,t.firestore._databaseId,r,e,n,a)}}function TR(t,e,n){if(typeof(n=rn(n))=="string"){if(n==="")throw new X(H.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!kp(e)&&n.indexOf("/")!==-1)throw new X(H.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);let a=e.path.child(yt.fromString(n));if(!ne.isDocumentKey(a))throw new X(H.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${a}' is not because it has an odd number of segments (${a.length}).`);return Wc(t,new ne(a))}if(n instanceof Gn)return Wc(t,n._key);throw new X(H.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Gc(n)}.`)}function bR(t,e){if(!Array.isArray(t)||t.length===0)throw new X(H.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function LR(t,e){let n=function(r,s){for(let i of r)for(let u of i.getFlattenedFilters())if(s.indexOf(u.op)>=0)return u.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new X(H.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new X(H.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}var xu=class{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},Ru=class t extends Zc{constructor(e,n,a,r,s,i){super(e,n,a,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let n=new ku(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){let a=this._document.data.field(Jc("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new X(H.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,n={};return n.type=t._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}};Ru._jsonSchemaVersion="firestore/documentSnapshot/1.0",Ru._jsonSchema={type:Dt("string",Ru._jsonSchemaVersion),bundleSource:Dt("string","DocumentSnapshot"),bundleName:Dt("string"),bundle:Dt("string")};var ku=class extends Ru{data(e={}){return super.data(e)}},Du=class t{constructor(e,n,a,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new xu(r.hasPendingWrites,r.fromCache),this.query=a}get docs(){let e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(a=>{e.call(n,new ku(this._firestore,this._userDataWriter,a.key,a,new xu(this._snapshot.mutatedKeys.has(a.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new X(H.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(r,s){if(r._snapshot.oldDocs.isEmpty()){let i=0;return r._snapshot.docChanges.map(u=>{let l=new ku(r._firestore,r._userDataWriter,u.doc.key,u.doc,new xu(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:i++}})}{let i=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(u=>s||u.type!==3).map(u=>{let l=new ku(r._firestore,r._userDataWriter,u.doc.key,u.doc,new xu(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter),c=-1,f=-1;return u.type!==0&&(c=i.indexOf(u.doc.key),i=i.delete(u.doc.key)),u.type!==1&&(i=i.add(u.doc),f=i.indexOf(u.doc.key)),{type:_F(u.type),doc:l,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new X(H.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=cu.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let n=[],a=[],r=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),a.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),r.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function _F(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return oe(61501,{type:t})}}Du._jsonSchemaVersion="firestore/querySnapshot/1.0",Du._jsonSchema={type:Dt("string",Du._jsonSchemaVersion),bundleSource:Dt("string","QuerySnapshot"),bundleName:Dt("string"),bundle:Dt("string")};function Fp(t){t=jc(t,Da);let e=jc(t.firestore,Eu),n=iv(e),a=new Lp(e);return yF(t._query),pR(n,t._query).then(r=>new Du(e,a,t,r))}(function(e,n=!0){e0($a),Qa(new qn("firestore",(a,{instanceIdentifier:r,options:s})=>{let i=a.getProvider("app").getImmediate(),u=new Eu(new Zh(a.getProvider("auth-internal")),new tp(i,a.getProvider("app-check-internal")),b0(i,r),i);return s={useFetchStreams:n,...s},u._setSettings(s),u},"PUBLIC").setMultipleInstances(!0)),Hn(vR,ER,e),Hn(vR,ER,"esm2020")})();var PR="firebasestorage.googleapis.com",SF="storageBucket",vF=2*60*1e3,EF=10*60*1e3;var or=class t extends Pn{constructor(e,n,a=0){super(gv(e),`Firebase Storage: ${n} (${gv(e)})`),this.status_=a,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return gv(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},ur;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(ur||(ur={}));function gv(t){return"storage/"+t}function TF(){let t="An unknown error occurred, please check the error payload for server response.";return new or(ur.UNKNOWN,t)}function bF(){return new or(ur.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function wF(){return new or(ur.CANCELED,"User canceled the upload/download.")}function CF(t){return new or(ur.INVALID_URL,"Invalid URL '"+t+"'.")}function LF(t){return new or(ur.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function AR(t){return new or(ur.INVALID_ARGUMENT,t)}function OR(){return new or(ur.APP_DELETED,"The Firebase app was deleted.")}function AF(t){return new or(ur.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}var Xr=class t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let a;try{a=t.makeFromUrl(e,n)}catch{return new t(e,"")}if(a.path==="")return a;throw LF(e)}static makeFromUrl(e,n){let a=null,r="([A-Za-z0-9.\\-_]+)";function s(L){L.path.charAt(L.path.length-1)==="/"&&(L.path_=L.path_.slice(0,-1))}let i="(/(.*))?$",u=new RegExp("^gs://"+r+i,"i"),l={bucket:1,path:3};function c(L){L.path_=decodeURIComponent(L.path)}let f="v[A-Za-z0-9_]+",m=n.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",S=new RegExp(`^https?://${m}/${f}/b/${r}/o${p}`,"i"),R={bucket:1,path:3},D=n===PR?"(?:storage.googleapis.com|storage.cloud.google.com)":n,A="([^?#]*)",E=new RegExp(`^https?://${D}/${r}/${A}`,"i"),w=[{regex:u,indices:l,postModify:s},{regex:S,indices:R,postModify:c},{regex:E,indices:{bucket:1,path:2},postModify:c}];for(let L=0;L<w.length;L++){let q=w[L],z=q.regex.exec(e);if(z){let v=z[q.indices.bucket],g=z[q.indices.path];g||(g=""),a=new t(v,g),q.postModify(a);break}}if(a==null)throw CF(e);return a}},yv=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function xF(t,e,n){let a=1,r=null,s=null,i=!1,u=0;function l(){return u===2}let c=!1;function f(...A){c||(c=!0,e.apply(null,A))}function m(A){r=setTimeout(()=>{r=null,t(S,l())},A)}function p(){s&&clearTimeout(s)}function S(A,...E){if(c){p();return}if(A){p(),f.call(null,A,...E);return}if(l()||i){p(),f.call(null,A,...E);return}a<64&&(a*=2);let w;u===1?(u=2,w=0):w=(a+Math.random())*1e3,m(w)}let R=!1;function D(A){R||(R=!0,p(),!c&&(r!==null?(A||(u=2),clearTimeout(r),m(0)):A||(u=1)))}return m(0),s=setTimeout(()=>{i=!0,D(!0)},n),D}function RF(t){t(!1)}function kF(t){return t!==void 0}function xR(t,e,n,a){if(a<e)throw AR(`Invalid value for '${t}'. Expected ${e} or greater.`);if(a>n)throw AR(`Invalid value for '${t}'. Expected ${n} or less.`)}function DF(t){let e=encodeURIComponent,n="?";for(let a in t)if(t.hasOwnProperty(a)){let r=e(a)+"="+e(t[a]);n=n+r+"&"}return n=n.slice(0,-1),n}var Up;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Up||(Up={}));function PF(t,e){let n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return n||r||s}var Iv=class{constructor(e,n,a,r,s,i,u,l,c,f,m,p=!0,S=!1){this.url_=e,this.method_=n,this.headers_=a,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=i,this.callback_=u,this.errorCallback_=l,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=m,this.retry=p,this.isUsingEmulator=S,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,D)=>{this.resolve_=R,this.reject_=D,this.start_()})}start_(){let e=(a,r)=>{if(r){a(!1,new Ou(!1,null,!0));return}let s=this.connectionFactory_();this.pendingConnection_=s;let i=u=>{let l=u.loaded,c=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,c)};this.progressCallback_!==null&&s.addUploadProgressListener(i),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(i),this.pendingConnection_=null;let u=s.getErrorCode()===Up.NO_ERROR,l=s.getStatus();if(!u||PF(l,this.additionalRetryCodes_)&&this.retry){let f=s.getErrorCode()===Up.ABORT;a(!1,new Ou(!1,null,f));return}let c=this.successCodes_.indexOf(l)!==-1;a(!0,new Ou(c,s))})},n=(a,r)=>{let s=this.resolve_,i=this.reject_,u=r.connection;if(r.wasSuccessCode)try{let l=this.callback_(u,u.getResponse());kF(l)?s(l):s()}catch(l){i(l)}else if(u!==null){let l=TF();l.serverResponse=u.getErrorText(),this.errorCallback_?i(this.errorCallback_(u,l)):i(l)}else if(r.canceled){let l=this.appDelete_?OR():wF();i(l)}else{let l=bF();i(l)}};this.canceled_?n(!1,new Ou(!1,null,!0)):this.backoffId_=xF(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&RF(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},Ou=class{constructor(e,n,a){this.wasSuccessCode=e,this.connection=n,this.canceled=!!a}};function OF(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function MF(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function NF(t,e){e&&(t["X-Firebase-GMPID"]=e)}function VF(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function FF(t,e,n,a,r,s,i=!0,u=!1){let l=DF(t.urlParams),c=t.url+l,f=Object.assign({},t.headers);return NF(f,e),OF(f,n),MF(f,s),VF(f,a),new Iv(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,i,u)}function UF(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function BF(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}var N6=256*1024;var _v=class t{constructor(e,n){this._service=e,n instanceof Xr?this._location=n:this._location=Xr.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new t(e,n)}get root(){let e=new Xr(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return BF(this._location.path)}get storage(){return this._service}get parent(){let e=UF(this._location.path);if(e===null)return null;let n=new Xr(this._location.bucket,e);return new t(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw AF(e)}};function RR(t,e){let n=e?.[SF];return n==null?null:Xr.makeFromBucketSpec(n,t)}function qF(t,e,n,a={}){t.host=`${e}:${n}`;let r=Ya(e);r&&(Ko(`https://${t.host}/b`),Wo("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:s}=a;s&&(t._overrideAuthToken=typeof s=="string"?s:oh(s,t.app.options.projectId))}var Sv=class{constructor(e,n,a,r,s,i=!1){this.app=e,this._authProvider=n,this._appCheckProvider=a,this._url=r,this._firebaseVersion=s,this._isUsingEmulator=i,this._bucket=null,this._host=PR,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=vF,this._maxUploadRetryTime=EF,this._requests=new Set,r!=null?this._bucket=Xr.makeFromBucketSpec(r,this._host):this._bucket=RR(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Xr.makeFromBucketSpec(this._url,e):this._bucket=RR(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){xR("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){xR("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(zn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new _v(this,e)}_makeRequest(e,n,a,r,s=!0){if(this._deleted)return new yv(OR());{let i=FF(e,this._appId,a,r,n,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(e,n){let[a,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,a,r).getPromise()}},kR="@firebase/storage",DR="0.14.1";var MR="storage";function NR(t=$o(),e){t=rn(t);let a=Ti(t,MR).getImmediate({identifier:e}),r=ih("storage");return r&&HF(a,...r),a}function HF(t,e,n,a={}){qF(t,e,n,a)}function zF(t,{instanceIdentifier:e}){let n=t.getProvider("app").getImmediate(),a=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new Sv(n,a,r,e,$a)}function GF(){Qa(new qn(MR,zF,"PUBLIC").setMultipleInstances(!0)),Hn(kR,DR,""),Hn(kR,DR,"esm2020")}GF();var VR={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var vv=DI(VR),FR=l_(vv),Bp=sv(vv),K6=NR(vv);var Ev=null,Tv=null;async function jF(t){let e=Date.now();if(Ev&&Tv&&e<Tv)return Ev;let n=await t.getIdToken(),a=await t.getIdTokenResult();return Ev=n,Tv=a.expirationTime?new Date(a.expirationTime).getTime()-6e4:e+6e4,n}function KF(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let n=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return n.startsWith("http")?t:e+n}var WF=25e3;async function bv(t,e={}){let n=FR.currentUser;if(!n)throw new Error("User not authenticated");let a=await jF(n),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${a}`);let s=e.timeout!==void 0?e.timeout:WF,{timeout:i,...u}=e,l=u.signal,c=null,f=null;s>0&&(c=new AbortController,f=setTimeout(()=>{console.warn("[authFetch] Request exceeded timeout threshold:",s,"ms"),c.abort()},s),l=u.signal?(()=>{let m=new AbortController;return u.signal?.addEventListener("abort",()=>{clearTimeout(f),m.abort()}),c.signal.addEventListener("abort",()=>m.abort()),m.signal})():c.signal);try{let m=await fetch(KF(t),{...u,headers:r,signal:l??u.signal});return f&&clearTimeout(f),m}catch(m){throw f&&clearTimeout(f),m instanceof Error&&m.name==="AbortError"&&c?.signal.aborted?new Error("Request timed out"):m}}var wv=null;function YF(){if(typeof window>"u")return null;if(!wv)try{wv=new AudioContext}catch{return null}return wv}function UR(){let t=YF();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(400,e+.02),n.type="sine",a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.05),n.start(e),n.stop(e+.05)}var U=Le(Yn());var XF=typeof process<"u"&&!1;function qp(t,e){if(XF&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var JF=20;function ZF(t){let e=t.data(),n=e.status??"open",a=e.isResolved===!0||n==="resolved"||n==="done",r=n==="skipped";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:a,isSkipped:r||void 0,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null,clarityScore:e.clarityScore??null,clarityStatus:e.clarityStatus??null,clarityIssues:e.clarityIssues??null,clarityConfidence:e.clarityConfidence??null,clarityCheckedAt:e.clarityCheckedAt??null}}async function zR(t,e=JF,n){qp(e,"getSessionFeedbackPageRepo");let a=$c(Bp,"feedback"),r=n!=null?td(a,nd("sessionId","==",t),ad("createdAt","desc"),rd(e),CR(n)):td(a,nd("sessionId","==",t),ad("createdAt","desc"),rd(e)),s=Date.now(),i=await Fp(r),u=Date.now()-s;console.log(`[FIRESTORE] query duration: ${u}ms`);let l=i.docs,c=l.map(ZF),f=l.length>0?l[l.length-1]:null,m=l.length===e;return{feedback:c,lastVisibleDoc:f,hasMore:m}}async function GR(t,e=50){let{feedback:n}=await zR(t,e);return n}var jR=new Set(["script","style","noscript","iframe","svg"]);function Ht(t){if(!t)return!1;let e=t instanceof Element?t:t.parentElement;if(!e)return!1;let n=t instanceof Element?t:e;if(n.id&&String(n.id).toLowerCase().startsWith("echly"))return!0;let a=n.className;if(a&&typeof a=="string"&&a.includes("echly")||n instanceof Element&&n.getAttribute?.("data-echly-ui")!=null||n instanceof Element&&n.closest?.("[data-echly-ui]"))return!0;let r=n.getRootNode?.();return!!(r&&r instanceof ShadowRoot&&Ht(r.host))}function Hp(t){if(!(t instanceof HTMLElement)||t.getAttribute?.("aria-hidden")==="true")return!0;let e=t.ownerDocument?.defaultView?.getComputedStyle?.(t);return e?e.display==="none"||e.visibility==="hidden":!1}function tU(t){if(!t?.getRootNode||Ht(t))return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let n=[],a=t;for(;a&&a!==e.body&&n.length<12;){let s=a.tagName.toLowerCase(),i=a.id?.trim();if(i&&/^[a-zA-Z][\w-]*$/.test(i)&&!i.includes(" ")){s+=`#${i}`,n.unshift(s);break}let u=a.getAttribute?.("class")?.trim();if(u){let m=u.split(/\s+/).find(p=>p.length>0&&/^[a-zA-Z_][\w-]*$/.test(p));m&&(s+=`.${m}`)}let l=a.parentElement;if(!l)break;let c=l.children,f=0;for(let m=0;m<c.length;m++)if(c[m]===a){f=m+1;break}s+=`:nth-child(${f})`,n.unshift(s),a=l}return n.length===0?null:n.join(" > ")}function nU(t){if(!t||Ht(t))return null;let e=[],n=t.ownerDocument.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode(i){let u=i.parentElement;if(!u||Ht(u))return NodeFilter.FILTER_REJECT;let l=u.getRootNode?.();if(l&&l instanceof ShadowRoot&&Ht(l.host))return NodeFilter.FILTER_REJECT;let c=u.tagName.toLowerCase();return jR.has(c)||Hp(u)?NodeFilter.FILTER_REJECT:(i.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),a=0,r=n.nextNode();for(;r&&a<2e3;){let i=(r.textContent??"").trim();if(i.length>0){let u=i.slice(0,2e3-a);e.push(u),a+=u.length}r=n.nextNode()}return e.length===0?null:e.join(" ").replace(/\s+/g," ").trim().slice(0,2e3)||null}function aU(t){if(!t||Ht(t))return null;let e=[];function n(i){if(!i||Ht(i)||Hp(i))return;let l=(i.innerText??i.textContent??"").replace(/\s+/g," ").trim().slice(0,200);l.length>0&&e.push(l)}let a=t.getAttribute?.("aria-label")||t.placeholder||(t.innerText??t.textContent??"").trim();a&&e.push(String(a).slice(0,120));let r=t.parentElement;if(r&&!Ht(r)&&!Hp(r)&&n(r),r)for(let i=0;i<r.children.length;i++){let u=r.children[i];u!==t&&!Ht(u)&&n(u)}for(let i=0;i<t.children.length;i++)Ht(t.children[i])||n(t.children[i]);let s=e.filter(Boolean).join(" ").replace(/\s+/g," ").trim();return s?s.length>800?s.slice(0,800)+"\u2026":s:null}function rU(t){if(!t?.document?.body)return null;let e=t.document,n=e.body,a=[],r=e.createTreeWalker(n,NodeFilter.SHOW_TEXT,{acceptNode(l){let c=l.parentElement;if(!c||Ht(c))return NodeFilter.FILTER_REJECT;let f=c.getRootNode?.();if(f&&f instanceof ShadowRoot&&Ht(f.host))return NodeFilter.FILTER_REJECT;let m=c.tagName.toLowerCase();if(jR.has(m)||Hp(c))return NodeFilter.FILTER_REJECT;let p=c.getBoundingClientRect?.();return p&&(p.top>=t.innerHeight||p.bottom<=0||p.left>=t.innerWidth||p.right<=0)?NodeFilter.FILTER_REJECT:(l.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),s=0,i=r.nextNode();for(;i&&s<1500;){let l=(i.textContent??"").trim();if(l.length>0){let c=l.slice(0,1500-s);a.push(c),s+=c.length}i=r.nextNode()}return a.length===0?null:a.join(" ").replace(/\s+/g," ").trim().slice(0,1500)||null}function lr(t,e){try{typeof console<"u"&&console.log&&console.log(`ECHLY DEBUG \u2014 ${t}`,e)}catch{}}function zp(t,e){let n=e;for(;n&&Ht(n);)n=n.parentElement;let a=n?tU(n):null,r=n?nU(n):null,s=n?aU(n):null,i=rU(t);if(n&&!Ht(n)&&n!==t.document?.body){if(!r?.trim()){let c=(n.innerText??n.textContent??"").replace(/\s+/g," ").trim().slice(0,2e3)||null;c&&(r=c),r&&lr("SUBTREE TEXT FALLBACK USED","element.innerText")}!s?.trim()&&n.parentElement&&!Ht(n.parentElement)&&(s=(n.parentElement.innerText??n.parentElement.textContent??"").replace(/\s+/g," ").trim().slice(0,800)||null,s&&lr("NEARBY TEXT FALLBACK USED","parent.innerText"))}i?.trim()||lr("VISIBLE TEXT FALLBACK USED","(skipped to avoid Echly UI)");let u={url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:a,nearbyText:s??null,subtreeText:r??null,visibleText:i??null,capturedAt:Date.now()};return lr("DOM PATH",u.domPath??"(none)"),lr("SUBTREE TEXT SIZE",u.subtreeText?.length??0),lr("NEARBY TEXT SIZE",u.nearbyText?.length??0),lr("VISIBLE TEXT SIZE",u.visibleText?.length??0),lr("DOM SCOPE SAMPLE",(u.subtreeText??"").slice(0,200)||"(empty)"),lr("NEARBY SCOPE SAMPLE",(u.nearbyText??"").slice(0,200)||"(empty)"),lr("VISIBLE TEXT SAMPLE",(u.visibleText??"").slice(0,200)||"(empty)"),u}var Cv=null;function sU(){if(typeof window>"u")return null;if(!Cv)try{Cv=new AudioContext}catch{return null}return Cv}function Gp(){let t=sU();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(600,e+.04),n.type="sine",a.gain.setValueAtTime(.04,e),a.gain.exponentialRampToValueAtTime(.001,e+.06),n.start(e),n.stop(e+.06)}var iU="[SESSION]";function Qs(t){typeof console<"u"&&console.debug&&console.debug(`${iU} ${t}`)}function jp(t){if(!t||t===document.body||Ht(t))return!1;let e=document.getElementById("echly-shadow-host");if(e&&e.contains(t))return!1;let n=t.tagName?.toLowerCase();if(n==="input"||n==="textarea"||n==="select")return!1;let a=t.getAttribute?.("contenteditable");return!(a==="true"||a==="")}var Qt=Le(Yn());var Qr=Le(vt()),Mu=24,Wp="cubic-bezier(0.22, 0.61, 0.36, 1)";async function Lv(t,e,n){return new Promise((a,r)=>{let s=new Image;s.crossOrigin="anonymous",s.onload=()=>{let i=Math.round(e.x*n),u=Math.round(e.y*n),l=Math.round(e.w*n),c=Math.round(e.h*n),f=document.createElement("canvas");f.width=l,f.height=c;let m=f.getContext("2d");if(!m){r(new Error("No canvas context"));return}m.drawImage(s,i,u,l,c,0,0,l,c);try{a(f.toDataURL("image/png"))}catch(p){r(p)}},s.onerror=()=>r(new Error("Image load failed")),s.src=t})}function XR({getFullTabImage:t,onAddVoice:e,onCancel:n,onSelectionStart:a}){let[r,s]=(0,Qt.useState)(null),[i,u]=(0,Qt.useState)(null),[l,c]=(0,Qt.useState)(!1),[f,m]=(0,Qt.useState)(!1),p=(0,Qt.useRef)(null),S=(0,Qt.useRef)(null),R=(0,Qt.useCallback)(()=>{s(null),u(null),p.current=null,S.current=null,setTimeout(()=>n(),120)},[n]);(0,Qt.useEffect)(()=>{let g=I=>{I.key==="Escape"&&(I.preventDefault(),i?(u(null),s(null),S.current=null,p.current=null):R())};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[R,i]),(0,Qt.useEffect)(()=>{let g=()=>{document.visibilityState==="hidden"&&R()};return document.addEventListener("visibilitychange",g),()=>document.removeEventListener("visibilitychange",g)},[R]);let D=(0,Qt.useCallback)(async g=>{if(l)return;c(!0),Gp(),m(!0),setTimeout(()=>m(!1),150),await new Promise(lt=>setTimeout(lt,200));let I=null;try{I=await t()}catch{c(!1),n();return}if(!I){c(!1),n();return}let b=typeof window<"u"&&window.devicePixelRatio||1,C;try{C=await Lv(I,g,b)}catch{c(!1),n();return}let x=g.x+g.w/2,T=g.y+g.h/2,de=null;if(typeof document<"u"&&document.elementsFromPoint)for(de=document.elementsFromPoint(x,T).find(M=>!Ht(M))??document.elementFromPoint(x,T)??document.elementFromPoint(g.x+2,g.y+2);de&&Ht(de);)de=de.parentElement;let Se=typeof window<"u"?zp(window,de):null;e(C,Se),c(!1),u(null)},[t,e,n,l]),A=(0,Qt.useCallback)(()=>{u(null),s(null),S.current=null,p.current=null},[]),E=(0,Qt.useCallback)(g=>{if(g.button!==0||i)return;g.preventDefault(),a?.();let I=g.clientX,b=g.clientY;p.current={x:I,y:b},s({x:I,y:b,w:0,h:0})},[a,i]),_=(0,Qt.useCallback)(g=>{if(g.button!==0)return;g.preventDefault();let I=S.current,b=p.current;if(p.current=null,!b||!I||I.w<Mu||I.h<Mu){s(null);return}s(null),S.current=null,u({x:I.x,y:I.y,w:I.w,h:I.h})},[]),w=(0,Qt.useCallback)(g=>{if(!p.current||i)return;let I=p.current.x,b=p.current.y,C=Math.min(I,g.clientX),x=Math.min(b,g.clientY),T=Math.abs(g.clientX-I),de=Math.abs(g.clientY-b),Se={x:C,y:x,w:T,h:de};S.current=Se,s(Se)},[i]);(0,Qt.useEffect)(()=>{let g=I=>{if(I.button!==0||!p.current||i)return;let b=S.current,C=p.current;if(p.current=null,!C||!b||b.w<Mu||b.h<Mu){s(null),S.current=null;return}s(null),S.current=null,u({x:b.x,y:b.y,w:b.w,h:b.h})};return window.addEventListener("mouseup",g),()=>window.removeEventListener("mouseup",g)},[i]);let L=!!r&&(r.w>=Mu||r.h>=Mu),q=i!==null,z=L&&r||q&&i,v=q?i:r;return(0,Qr.jsxs)("div",{id:"echly-overlay",role:"presentation","aria-hidden":!0,className:"echly-region-overlay","data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,Qr.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:z?"transparent":"rgba(0,0,0,0.4)",pointerEvents:i?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${Wp}`},onMouseDown:E,onMouseMove:w,onMouseUp:_,onMouseLeave:()=>{!p.current||i||(s(null),p.current=null,S.current=null)}}),(0,Qr.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",zIndex:2147483647,pointerEvents:"none",opacity:i?0:1,transition:`opacity 180ms ${Wp}`},children:"Drag to capture area \u2014 ESC to cancel"}),z&&v&&(0,Qr.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:v.x,top:v.y,width:Math.max(v.w,1),height:Math.max(v.h,1),border:`2px solid ${f?"#FFFFFF":"#466EFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.4)",pointerEvents:"none",zIndex:2147483646,borderRadius:14,transition:f?"none":`border-color 150ms ${Wp}`}}),q&&i&&(0,Qr.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:i.x+i.w/2,bottom:Math.max(12,i.y+i.h-48),transform:"translate(-50%, 100%)",display:"flex",background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${Wp} forwards`},children:[(0,Qr.jsx)("button",{type:"button",onClick:A,className:"echly-region-confirm-btn",style:{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",cursor:"pointer"},children:"Retake"}),(0,Qr.jsx)("button",{type:"button",onClick:()=>D(i),disabled:l,className:"echly-region-confirm-btn",style:{background:"#466EFF",color:"#fff",fontWeight:600,cursor:l?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var QR=40;function lU(t,e=QR,n,a){let r=t.getBoundingClientRect(),s=n??(typeof window<"u"?window.innerWidth:0),i=a??(typeof window<"u"?window.innerHeight:0),u=Math.max(0,r.left-e),l=Math.max(0,r.top-e),c=s-u,f=i-l,m=Math.min(r.width+e*2,c),p=Math.min(r.height+e*2,f);return{x:u,y:l,w:Math.max(1,m),h:Math.max(1,p)}}async function $R(t,e,n=QR){let a=typeof window<"u"&&window.devicePixelRatio||1,r=lU(e,n);return Lv(t,r,a)}var Av="[SESSION]",xv=null,Pa=[],Nu=null,Vu=null;function ZR(t){let e=t.getBoundingClientRect();return{x:e.left+e.width/2,y:e.top+e.height/2}}function ek(t,e,n){t.style.left=`${e}px`,t.style.top=`${n}px`,t.style.transform="translate(-50%, -50%)"}function cU(){Nu&&Vu||(Nu=()=>JR(),Vu=()=>JR(),window.addEventListener("scroll",Nu,{passive:!0,capture:!0}),window.addEventListener("resize",Vu))}function tk(){Nu&&(window.removeEventListener("scroll",Nu,{capture:!0}),Nu=null),Vu&&(window.removeEventListener("resize",Vu),Vu=null)}function Rv(t,e,n={}){let{onMarkerClick:a,getSessionPaused:r}=n;if(!t)return;let s=document.getElementById("echly-marker-layer");if(!s)return;xv=s;let i=Pa.length+1,u=e.x,l=e.y;if(e.element){let m=ZR(e.element);u=m.x,l=m.y}let c=document.createElement("div");c.className="echly-feedback-marker",c.setAttribute("data-echly-ui","true"),c.setAttribute("aria-label",`Feedback ${i}`),c.textContent=String(i),c.title=e.title??`Feedback #${i}`,c.style.cssText=["width:22px","height:22px","border-radius:50%","background:#2563eb","color:white","font-size:12px","font-weight:600","display:flex","align-items:center","justify-content:center","position:fixed","z-index:2147483646","box-shadow:0 4px 12px rgba(0,0,0,0.15)","cursor:pointer","pointer-events:auto","box-sizing:border-box"].join(";"),ek(c,u,l);let f={...e,x:u,y:l,index:i,domElement:c};Pa.push(f),c.addEventListener("click",m=>{m.preventDefault(),m.stopPropagation(),!r?.()&&(console.log(`${Av} marker clicked`,f.id),a?.({id:f.id,x:f.x,y:f.y,element:f.element,title:f.title,index:f.index}))}),xv.appendChild(c),Pa.length===1&&cU(),console.log(`${Av} marker created`,f.id,i)}function kv(t,e){let n=Pa.find(a=>a.id===t);n&&(e.id!=null&&(n.id=e.id),e.title!=null&&(n.title=e.title),n.domElement.title=n.title??`Feedback #${n.index}`)}function sd(t){let e=Pa.findIndex(a=>a.id===t);if(e===-1)return;Pa[e].domElement.remove(),Pa.splice(e,1),Pa.length===0&&tk()}function JR(){for(let t of Pa)if(t.element&&t.element.isConnected){let{x:e,y:n}=ZR(t.element);t.x=e,t.y=n,ek(t.domElement,e,n)}}function Dv(){let t=document.getElementById("echly-marker-layer");if(t)for(;t.firstChild;)t.removeChild(t.firstChild);for(let e of Pa)console.log(`${Av} marker removed`,e.id);Pa.length=0,xv=null,tk()}function le(t,e,n){let a=`[ECHLY][${t}]`;n!==void 0?console.log(a,e,n):console.log(a,e)}var Yp=24;var Qp="echly-capture-root",rk=120;function fU(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let n=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),a=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(n&&!a)return"negative";if(a&&!n)return"positive";if(n&&a){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,s=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>s?"negative":s>r?"positive":"neutral"}return"neutral"}function Pv(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}async function hU(t){let e=document.getElementById(Qp),n=e?.style.display??"";try{return e&&(e.style.display="none",await new Promise(a=>requestAnimationFrame(()=>a()))),await t()}finally{e&&(e.style.display=n)}}var Xp=["focus_mode","region_selecting","voice_listening","processing"];function sk({sessionId:t,extensionMode:e=!1,initialPointers:n,onComplete:a,onDelete:r,onUpdate:s,onRecordingChange:i,loadSessionWithPointers:u,pointers:l,onSessionLoaded:c,onCreateSession:f,onActiveSessionChange:m,globalSessionModeActive:p,globalSessionPaused:S,onSessionModeStart:R,onSessionModePause:D,onSessionModeResume:A,onSessionModeEnd:E}){let[_,w]=(0,U.useState)([]),[L,q]=(0,U.useState)(null),[z,v]=(0,U.useState)(!1),[g,I]=(0,U.useState)("idle"),[b,C]=(0,U.useState)(null),[x,T]=(0,U.useState)(n??[]),[de,Se]=(0,U.useState)(null),[lt,M]=(0,U.useState)(null),[P,N]=(0,U.useState)(""),[W,Q]=(0,U.useState)([]),[ae,at]=(0,U.useState)(!1),[Fe,Qe]=(0,U.useState)(null),[Ge,Cn]=(0,U.useState)(!1),[Ln,Sn]=(0,U.useState)(null),[Zr,es]=(0,U.useState)(0),[vn,V]=(0,U.useState)(!0),[J,ee]=(0,U.useState)(null),[ve,me]=(0,U.useState)(!1),[Ue,ct]=(0,U.useState)(!1),[ge,re]=(0,U.useState)(null),[je,$e]=(0,U.useState)(!1),[Ke,et]=(0,U.useState)(!1),[_e,we]=(0,U.useState)(!1),[dt,Be]=(0,U.useState)(!1),[cn,Tt]=(0,U.useState)(!1),[It,tt]=(0,U.useState)(null),[bt,wt]=(0,U.useState)(!1),Jt=(0,U.useRef)(!1),qe=(0,U.useRef)(!1),Ce=(0,U.useRef)(null);(0,U.useEffect)(()=>{Jt.current=Ke},[Ke]),(0,U.useEffect)(()=>{qe.current=_e},[_e]);let rt=(0,U.useRef)({x:0,y:0}),An=(0,U.useRef)(null),ft=(0,U.useRef)(null),fr=(0,U.useRef)(null),_t=(0,U.useRef)(null),xn=(0,U.useRef)(null),Oa=(0,U.useRef)(_),jn=(0,U.useRef)(g),dn=(0,U.useRef)(!1),Uu=(0,U.useRef)(!1),hr=(0,U.useRef)(null),dd=(0,U.useRef)(!1),Bu=(0,U.useRef)(null),ts=(0,U.useRef)(null),Hi=(0,U.useRef)(null),ns=(0,U.useRef)(null),as=(0,U.useRef)(null),Ma=(0,U.useRef)(null),qu=(0,U.useRef)(null),oa=(0,U.useRef)(null),zi=(0,U.useRef)(!1);(0,U.useEffect)(()=>{jn.current=g},[g]),(0,U.useEffect)(()=>(g==="focus_mode"||g==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[g]),(0,U.useEffect)(()=>{if(g!=="voice_listening"){ns.current!=null&&(cancelAnimationFrame(ns.current),ns.current=null),Bu.current?.getTracks().forEach(ue=>ue.stop()),Bu.current=null,ts.current?.close().catch(()=>{}),ts.current=null,Hi.current=null,es(0);return}let B=Hi.current;if(!B)return;let j=new Uint8Array(B.frequencyBinCount),K,Z=()=>{B.getByteFrequencyData(j);let ue=j.reduce((ye,Ot)=>ye+Ot,0),Me=j.length?ue/j.length:0,ie=Math.min(1,Me/128);es(ie),K=requestAnimationFrame(Z)};return K=requestAnimationFrame(Z),ns.current=K,()=>{cancelAnimationFrame(K),ns.current=null}},[g]),(0,U.useEffect)(()=>{hr.current=lt},[lt]),(0,U.useEffect)(()=>{dd.current=Xp.includes(g)},[g]);let Gi=(0,U.useRef)(!1);(0,U.useEffect)(()=>{if(!i)return;Xp.includes(g)?(Gi.current=!0,i(!0)):Gi.current&&(Gi.current=!1,i(!1))},[g,i]);let ji=(0,U.useCallback)(B=>{B===!1&&(dd.current||e||Xp.includes(jn.current)||hr.current)||v(B)},[e]),Ki=(0,U.useCallback)(()=>{v(B=>!B)},[]);(0,U.useEffect)(()=>{xn.current=L},[L]),(0,U.useEffect)(()=>{Oa.current=_},[_]),(0,U.useEffect)(()=>{let B=K=>{if(!Ge||!An.current)return;K.preventDefault();let Z=An.current.offsetWidth,ue=An.current.offsetHeight,Me=K.clientX-rt.current.x,ie=K.clientY-rt.current.y,ye=window.innerWidth-Z-Yp,Ot=window.innerHeight-ue-Yp;Me=Math.max(Yp,Math.min(Me,ye)),ie=Math.max(Yp,Math.min(ie,Ot)),Qe({x:Me,y:ie})},j=()=>{Ge&&(Cn(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",B),window.addEventListener("mouseup",j),()=>{window.removeEventListener("mousemove",B),window.removeEventListener("mouseup",j)}},[Ge]);let Hu=(0,U.useCallback)(B=>{if(B.button!==0||!An.current)return;let j=An.current.getBoundingClientRect();Cn(!0),document.body.style.userSelect="none",rt.current={x:B.clientX-j.left,y:B.clientY-j.top},Qe({x:j.left,y:j.top})},[]),Na=(0,U.useCallback)(()=>{if(ft.current){console.debug("ECHLY createCaptureRoot","skipped (ref already set)");return}let B=document.getElementById(Qp);if(B){console.debug("ECHLY createCaptureRoot","reusing existing DOM root"),ft.current=B,re(B),ct(!0);return}console.debug("ECHLY createCaptureRoot"),tt(null);let j=document.createElement("div");j.id=Qp,document.body.appendChild(j),ft.current=j,re(j),ct(!0)},[]);(0,U.useEffect)(()=>{let B=document.getElementById("echly-capture-root");if(!B||B.querySelector("#echly-marker-layer"))return;let j=document.createElement("div");j.id="echly-marker-layer",j.style.cssText=["position:fixed","top:0","left:0","width:100%","height:100%","pointer-events:none","z-index:2147483646"].join(";"),B.appendChild(j)},[ge]);let En=(0,U.useCallback)(()=>{if(e&&p!==!1)return;if(console.debug("ECHLY removeCaptureRoot"),ft.current){try{ft.current.remove()}catch(j){console.error("CaptureWidget error:",j)}ft.current=null}let B=document.getElementById(Qp);B&&B.remove(),re(null),ct(!1)},[e,p]),va=(0,U.useCallback)(()=>{I("idle"),v(vn)},[vn]),Ea=(0,U.useCallback)(B=>{let j=B==="pause"?as:Ma;j.current!=null&&(window.clearTimeout(j.current),j.current=null)},[]);(0,U.useEffect)(()=>()=>{as.current!=null&&window.clearTimeout(as.current),Ma.current!=null&&window.clearTimeout(Ma.current)},[]),(0,U.useEffect)(()=>{if(n!=null){T(n);return}if(e||!t)return;(async()=>{let j=await GR(t);T(j.map(K=>({id:K.id,title:K.title,actionSteps:K.actionSteps??(K.description?K.description.split(`
`):[]),type:K.type})))})()},[e,t,n]),(0,U.useEffect)(()=>{let B=window.SpeechRecognition||window.webkitSpeechRecognition;if(!B)return;let j=new B;return j.continuous=!0,j.interimResults=!0,j.lang="en-US",j.onstart=()=>{let K=Date.now();oa.current=K,console.log("[VOICE] recognition.onstart",K);let Z=qu.current;Z!=null&&console.log("[VOICE] delay UI recording start\u2192onstart:",K-Z,"ms")},j.onspeechstart=()=>{console.log("[VOICE] speech detected",Date.now())},j.onaudiostart=()=>{console.log("[VOICE] audio start",Date.now())},j.onresult=K=>{let Z="";for(let ie=0;ie<K.results.length;++ie){let Ot=K.results[ie][0];Ot&&(Z+=Ot.transcript+" ")}Z=Z.replace(/\s+/g," ").trim();let ue=Date.now();if(le("RECORDING","result",{transcript:Z}),console.log("[VOICE] transcript received",ue,Z),Z&&!zi.current){zi.current=!0,console.log("[VOICE] first transcript chunk:",Z,"length:",Z.length);let ie=qu.current,ye=oa.current;ie!=null&&console.log("[VOICE] delay UI\u2192first transcript:",ue-ie,"ms"),ye!=null&&console.log("[VOICE] delay onstart\u2192first transcript:",ue-ye,"ms")}let Me=xn.current;Me&&w(ie=>ie.map(ye=>ye.id===Me?{...ye,transcript:Z}:ye))},j.onend=()=>{if(!Uu.current){le("RECORDING","unexpected end"),jn.current==="voice_listening"&&I("idle");return}Uu.current=!1;let K=jn.current;K==="processing"||K==="success"||I("idle")},fr.current=j,()=>{try{j.stop()}catch(K){console.error("CaptureWidget error:",K)}}},[]);let Ta=(0,U.useCallback)(async()=>{le("RECORDING","start");let B=Date.now();qu.current=B,oa.current=null,zi.current=!1,console.log("[VOICE] UI recording started",B);try{let j=await navigator.mediaDevices.getUserMedia({audio:!0});Bu.current=j;let K=new AudioContext,Z=K.createAnalyser();Z.fftSize=256,Z.smoothingTimeConstant=.7,K.createMediaStreamSource(j).connect(Z),ts.current=K,Hi.current=Z,console.log("[VOICE] recognition.start() called",Date.now()),fr.current?.start(),I("voice_listening"),es(0)}catch(j){console.error("Microphone permission denied:",j),C("Microphone permission denied."),I("error"),En(),va()}},[]),Wi=(0,U.useCallback)(async()=>{le("RECORDING","finish requested"),Uu.current=!0,typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),UR(),fr.current?.stop();let B=xn.current;if(!B){I("idle");return}let K=Oa.current.find(Z=>Z.id===B);if(console.log("[VOICE] finishListening transcript:",K?.transcript),!K||!K.transcript||K.transcript.trim().length<5){console.warn("[VOICE] transcript too short, skipping pipeline"),I("idle");return}if(e){if(Jt.current){let ue=ft.current,Me=Ce.current??void 0,ie=`pending-${Date.now()}`;ue&&Rv(ue,{id:ie,x:0,y:0,element:Me,title:"Saving feedback\u2026"},{getSessionPaused:()=>qe.current,onMarkerClick:ye=>{ee(ye.id),Se(ye.id)}}),tt(null),wt(!0),w(ye=>ye.filter(Ot=>Ot.id!==B)),q(null),I("idle"),Ce.current=null,console.log("[VOICE] final transcript sent to pipeline:",K.transcript);try{dn.current=!0,a(K.transcript,K.screenshot,{onSuccess:ye=>{dn.current=!1,wt(!1),ue&&kv(ie,{id:ye.id,title:ye.title});let Ot=ye;T(ls=>[{id:Ot.id,title:Ot.title,actionSteps:Ot.actionSteps??(Ot.description?Ot.description.split(`
`):[]),type:Ot.type},...ls]),ee(ye.id),setTimeout(()=>ee(null),1200)},onError:()=>{dn.current=!1,wt(!1),ue&&sd(ie),C("AI processing failed.")}},K.context??void 0,{sessionMode:!0})}catch(ye){dn.current=!1,wt(!1),ue&&sd(ie),console.error(ye),C("AI processing failed.")}return}I("processing"),console.log("[VOICE] final transcript sent to pipeline:",K.transcript),dn.current=!0,a(K.transcript,K.screenshot,{onSuccess:ue=>{dn.current=!1;let Me=ue;T(ie=>[{id:Me.id,title:Me.title,actionSteps:Me.actionSteps??(Me.description?Me.description.split(`
`):[]),type:Me.type},...ie]),w(ie=>ie.filter(ye=>ye.id!==B)),q(null),ee(ue.id),setTimeout(()=>ee(null),1200),$e(!0),setTimeout(()=>$e(!1),200),me(!0),setTimeout(()=>{En(),va(),me(!1)},120)},onError:()=>{dn.current=!1,C("AI processing failed."),I("voice_listening")}},K.context??void 0);return}I("processing"),console.log("[VOICE] final transcript sent to pipeline:",K.transcript);try{let Z=await a(K.transcript,K.screenshot);if(!Z){I("idle"),En(),va();return}T(ue=>[{id:Z.id,title:Z.title,actionSteps:Z.actionSteps??[],type:Z.type},...ue]),w(ue=>ue.filter(Me=>Me.id!==B)),q(null),ee(Z.id),setTimeout(()=>ee(null),1200),$e(!0),setTimeout(()=>$e(!1),200),me(!0),setTimeout(()=>{En(),va(),me(!1)},120)}catch(Z){console.error(Z),C("AI processing failed."),I("voice_listening")}},[a,e,En,va]),Va=(0,U.useCallback)(()=>{le("RECORDING","discard"),fr.current?.stop();let B=xn.current;w(j=>j.filter(K=>K.id!==B)),q(null),I("cancelled"),En(),va()},[En,va]);(0,U.useEffect)(()=>{if(!Ue)return;let B=j=>{j.key==="Escape"&&(j.preventDefault(),Xp.includes(jn.current)&&Va())};return document.addEventListener("keydown",B),()=>document.removeEventListener("keydown",B)},[Ue,Va]);let Fa=(0,U.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),Yi=(0,U.useCallback)(()=>{T([]),w([]),q(null),I("idle"),Se(null),M(null),at(!1)},[]);(0,U.useEffect)(()=>{if(e)return;let B=j=>{let K=j.target;_t.current&&K&&!_t.current.contains(K)&&at(!1)};return document.addEventListener("mousedown",B),()=>document.removeEventListener("mousedown",B)},[e]);let fd=(0,U.useCallback)(async B=>{try{await r(B),T(j=>j.filter(K=>K.id!==B))}catch(j){console.error("Delete failed:",j)}},[r]),zu=(0,U.useCallback)(B=>{M(B.id),N(B.title),Q(B.actionSteps??[])},[]),Gu=(0,U.useCallback)(async B=>{let j=P.trim()||P,K=W;T(Z=>Z.map(ue=>ue.id===B?{...ue,title:j||ue.title,actionSteps:K}:ue)),M(null);try{let Z=await bv(`/api/tickets/${B}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:j||P,actionSteps:K})}),ue=await Z.json();if(Z.ok&&ue.success&&ue.ticket){let Me=ue.ticket;T(ie=>ie.map(ye=>ye.id===B?{...ye,title:Me.title,actionSteps:Me.actionSteps??ye.actionSteps,type:Me.type??ye.type}:ye))}}catch(Z){console.error("Save edit failed:",Z)}},[P,W]),ju=(0,U.useCallback)(async(B,j)=>{try{if(s){await s(B,j),T(Me=>Me.map(ie=>ie.id===B?{...ie,title:j.title,actionSteps:j.actionSteps}:ie));return}let K=await bv(`/api/tickets/${B}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:j.title,actionSteps:j.actionSteps})}),Z=await K.json();if(!K.ok||!Z.success)throw new Error("Update failed");let ue=Z.ticket;T(Me=>Me.map(ie=>ie.id===B?{...ie,title:ue?.title??ie.title,actionSteps:ue?.actionSteps??j.actionSteps}:ie))}catch(K){throw console.error("Ticket update failed:",K),K}},[s]),ba=(0,U.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?hU(()=>new Promise((B,j)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},K=>{!K||!K.success?j(new Error("Capture failed")):B(K.screenshot??null)})})):Promise.resolve(null),[]),Xi=(0,U.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return ba();let{captureScreenshot:B}=await Promise.resolve().then(()=>(ak(),nk));return B()},[ba]),Ku=(0,U.useCallback)(()=>{I("region_selecting")},[]),Wu=(0,U.useCallback)((B,j)=>{let K=Pv(),Z={id:K,screenshot:B,transcript:"",structuredOutput:null,context:j??null,createdAt:Date.now()};w(ue=>[...ue,Z]),q(K),Ta()},[Ta]),rs=(0,U.useCallback)(()=>{I("cancelled"),En(),va()},[En,va]),hd=(0,U.useCallback)(B=>{let j=xn.current;j&&w(K=>K.map(Z=>Z.id===j?{...Z,transcript:B}:Z))},[]),wa=(0,U.useCallback)(async()=>{if(!(jn.current!=="idle"||Jt.current||p)){if(le("SESSION","start"),console.log("[Echly] Start New Feedback Session clicked"),Qs("start"),e&&f&&m){let B=await f();if(!B?.id)return;m(B.id),T([]),R?.()}tt(null),wt(!1),Be(!1),Tt(!1)}},[e,f,m,R,p]),Kn=(0,U.useCallback)(()=>{if(!Jt.current&&!p||qe.current||dt||cn)return;le("SESSION","pause requested");let B=()=>{le("SESSION","pause finalized"),Ea("pause"),Qs("pause"),D?.(),Be(!1)};if(dn.current){Ea("pause"),Be(!0);let j=()=>{if(dn.current){as.current=window.setTimeout(j,rk);return}B()};j();return}B()},[Ea,cn,p,D,dt]),ss=(0,U.useCallback)(()=>{!Jt.current&&!p||(le("SESSION","resume"),Be(!1),Tt(!1),Qs("resume"),A?.())},[p,A]),is=(0,U.useCallback)(B=>{if(!Jt.current&&!p||cn)return;le("SESSION","end requested");let j=()=>{le("SESSION","end finalized"),Ea("end"),Qs("end"),Be(!1),Tt(!1),tt(null),wt(!1),T([]),E?.(),B?.()};if(dn.current){Ea("end"),Tt(!0);let K=()=>{if(dn.current){Ma.current=window.setTimeout(K,rk);return}j()};K();return}j()},[Ea,cn,p,E]);(0,U.useEffect)(()=>{p===!0&&(et(!0),Na())},[p,Na]),(0,U.useEffect)(()=>{!e||p===void 0||(le("SESSION","global sync",{active:p,paused:S}),p===!0&&(et(!0),we(S??!1),tt(null),Tt(!1),ft.current||Na()),S===!0&&(we(!0),Be(!1)),p===!1&&(et(!1),we(!1),Be(!1),Tt(!1),tt(null),wt(!1),Dv(),En()))},[e,p,S,Na,En]),(0,U.useEffect)(()=>{e&&(p||(et(!1),we(!1),Be(!1),Tt(!1),tt(null),wt(!1),Dv(),En()))},[e,p,En]),(0,U.useEffect)(()=>{e&&p&&S!==void 0&&(we(S),S&&(Be(!1),Se(null),ee(null)))},[e,p,S]),(0,U.useEffect)(()=>{if(!e||p!==!0)return;let B=()=>{document.hidden||!p||ft.current||(et(!0),we(S??!1),tt(null),Tt(!1),Na())};return document.addEventListener("visibilitychange",B),()=>document.removeEventListener("visibilitychange",B)},[e,p,S,Na]),(0,U.useEffect)(()=>{!e||l===void 0||(T(l),tt(null))},[e,l]),(0,U.useEffect)(()=>{!e||!u?.sessionId||(T(u.pointers??[]),tt(null),c?.())},[e,u,c]);let Qi=(0,U.useCallback)(async B=>{if(It&&!ft.current){tt(null);return}if(!ba||It!=null)return;Qs("element clicked"),Gp();let j=null;try{j=await ba()}catch{return}if(!j)return;let K;try{K=await $R(j,B)}catch{return}let Z=zp(window,B);Ce.current=B instanceof HTMLElement?B:null,tt({screenshot:K,context:Z})},[ba,It]),We=(0,U.useCallback)(B=>{let j=It;if(!j||!B||B.trim().length===0){tt(null);return}let K=ft.current,Z=Ce.current??void 0,ue=`pending-${Date.now()}`;K&&Rv(K,{id:ue,x:0,y:0,element:Z??void 0,title:"Saving feedback\u2026"},{getSessionPaused:()=>qe.current,onMarkerClick:ie=>{ee(ie.id),Se(ie.id)}}),tt(null),wt(!0),I("idle"),Ce.current=null,console.log("[VOICE] final transcript sent to pipeline:",B);try{dn.current=!0,a(B,j.screenshot,{onSuccess:ie=>{dn.current=!1,wt(!1),K&&kv(ue,{id:ie.id,title:ie.title});let ye=ie;T(Ot=>[{id:ye.id,title:ye.title,actionSteps:ye.actionSteps??(ye.description?ye.description.split(`
`):[]),type:ye.type},...Ot]),ee(ie.id),setTimeout(()=>ee(null),1200)},onError:()=>{dn.current=!1,wt(!1),K&&sd(ue),C("AI processing failed.")}},j.context??void 0,{sessionMode:!0})}catch(ie){dn.current=!1,wt(!1),K&&sd(ue),console.error(ie),C("AI processing failed.")}},[It,a]),Js=(0,U.useCallback)(()=>{tt(null),wt(!1)},[]),os=(0,U.useCallback)(()=>{let B=It;if(!B)return;let j=Pv(),K={id:j,screenshot:B.screenshot,transcript:"",structuredOutput:null,context:B.context??null,createdAt:Date.now()};w(Z=>[...Z,K]),q(j),Ta()},[It,Ta]),us=(0,U.useCallback)(async()=>{if(jn.current==="idle"&&(C(null),fr.current?.stop(),V(z),v(!1),Na(),I("focus_mode"),!e))try{let B=await Xi();if(!B){rs();return}let j=Pv(),K={id:j,screenshot:B,transcript:"",structuredOutput:null,createdAt:Date.now()};w(Z=>[...Z,K]),q(j),Ta()}catch(B){console.error(B),C("Screen capture failed."),I("error"),rs()}},[e,z,Xi,Ta,Na,rs]),rm=(0,U.useMemo)(()=>({setIsOpen:ji,toggleOpen:Ki,startDrag:Hu,handleShare:Fa,setShowMenu:at,resetSession:Yi,startListening:Ta,finishListening:Wi,discardListening:Va,deletePointer:fd,updatePointer:ju,startEditing:zu,saveEdit:Gu,setExpandedId:Se,setEditedTitle:N,setEditedSteps:Q,handleAddFeedback:us,handleRegionCaptured:Wu,handleRegionSelectStart:Ku,handleCancelCapture:rs,getFullTabImage:ba,setActiveRecordingTranscript:hd,startSession:wa,pauseSession:Kn,resumeSession:ss,endSession:is,handleSessionElementClicked:Qi,handleSessionFeedbackSubmit:We,handleSessionFeedbackCancel:Js,handleSessionStartVoice:os}),[ji,Ki,Hu,Fa,Yi,Ta,Wi,Va,fd,ju,zu,Gu,Se,N,Q,us,Wu,Ku,rs,ba,hd,wa,Kn,ss,is,Qi,We,Js,os]),$i=(0,U.useMemo)(()=>L?_.find(B=>B.id===L):null,[L,_]),sm=(0,U.useMemo)(()=>g!=="voice_listening"?"neutral":fU($i?.transcript??""),[g,$i?.transcript]),im=$i?.transcript?.trim()??"";return{state:{isOpen:z,state:g,errorMessage:b,pointers:x,expandedId:de,editingId:lt,editedTitle:P,editedSteps:W,showMenu:ae,position:Fe,liveTranscript:im,listeningAudioLevel:Zr,listeningSentiment:sm,highlightTicketId:J,pillExiting:ve,orbSuccess:je,sessionMode:Ke,sessionPaused:_e,pausePending:dt,endPending:cn,sessionFeedbackPending:It},handlers:rm,refs:{widgetRef:An,menuRef:_t,captureRootRef:ft},captureRootReady:Ue,captureRootEl:ge}}var Jp=Le(Yn());var $p=(...t)=>t.filter((e,n,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===n).join(" ").trim();var ik=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var ok=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,a)=>a?a.toUpperCase():n.toLowerCase());var Ov=t=>{let e=ok(t);return e.charAt(0).toUpperCase()+e.slice(1)};var id=Le(Yn());var uk={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var lk=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var ck=(0,id.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:r="",children:s,iconNode:i,...u},l)=>(0,id.createElement)("svg",{ref:l,...uk,width:e,height:e,stroke:t,strokeWidth:a?Number(n)*24/Number(e):n,className:$p("lucide",r),...!s&&!lk(u)&&{"aria-hidden":"true"},...u},[...i.map(([c,f])=>(0,id.createElement)(c,f)),...Array.isArray(s)?s:[s]]));var Fu=(t,e)=>{let n=(0,Jp.forwardRef)(({className:a,...r},s)=>(0,Jp.createElement)(ck,{ref:s,iconNode:e,className:$p(`lucide-${ik(Ov(t))}`,`lucide-${t}`,a),...r}));return n.displayName=Ov(t),n};var pU=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],od=Fu("expand",pU);var mU=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],ud=Fu("trash-2",mU);var gU=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ld=Fu("x",gU);var In=Le(vt()),yU=()=>(0,In.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,In.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,In.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),IU=()=>(0,In.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,In.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function Mv({onClose:t,summary:e=null,theme:n="dark",onThemeToggle:a,handlers:r,onShowCommandScreen:s}){return(0,In.jsxs)("div",{className:"echly-sidebar-header",children:[(0,In.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,In.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,In.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),(0,In.jsxs)("div",{className:"echly-header-actions",children:[a&&(0,In.jsx)("button",{type:"button",id:"theme-toggle",onClick:a,className:"echly-theme-toggle","aria-label":n==="dark"?"Switch to light mode":"Switch to dark mode",children:n==="dark"?(0,In.jsx)(yU,{}):(0,In.jsx)(IU,{})}),(0,In.jsx)("button",{type:"button",onClick:()=>{r?.endSession?.(),r?.clearPointers?.(),s?.(),t()},className:"echly-sidebar-close","aria-label":"Close",children:(0,In.jsx)(ld,{size:16,strokeWidth:1.5})})]})]})}var _n=Le(Yn());var zt=Le(vt());function _U(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function SU({item:t,onUpdate:e,onDelete:n,highlightTicketId:a=null,onExpandChange:r}){let[s,i]=(0,_n.useState)(!1),[u,l]=(0,_n.useState)(!1),[c,f]=(0,_n.useState)(t.title),[m,p]=(0,_n.useState)(t.actionSteps??[]),[S,R]=(0,_n.useState)(!1),[D,A]=(0,_n.useState)(null),E=_U(t.type);(0,_n.useEffect)(()=>{f(t.title),p(t.actionSteps??[])},[t]),(0,_n.useEffect)(()=>{a===t.id&&(l(!0),setTimeout(()=>{l(!1)},1200))},[a,t.id]);let _=(0,_n.useCallback)(()=>{i(z=>{let v=!z;return r?.(v?t.id:null),v})},[t.id,r]),w=(0,_n.useCallback)(async()=>{R(!0),A(null);try{await e(t.id,{title:c.trim()||c,actionSteps:m}),i(!1),r?.(null)}catch(z){console.error("Save failed",z),A("Failed to save changes")}finally{R(!1)}},[t.id,c,m,e,r]),L=(0,_n.useCallback)(()=>{i(!1),r?.(null)},[r]),q=(0,_n.useCallback)(async()=>{try{await n(t.id)}catch(z){console.error("Delete failed",z)}},[t.id,n]);return(0,zt.jsx)("div",{className:`echly-feedback-item ${u?"echly-ticket-highlight":""}`,"data-priority":E,children:(0,zt.jsxs)("div",{className:"echly-ticket-row",children:[(0,zt.jsx)("div",{className:"echly-ticket-dot echly-priority-dot","aria-hidden":!0}),(0,zt.jsx)("div",{className:"echly-ticket-content",children:s?(0,zt.jsxs)("div",{className:"echly-ticket-expanded",children:[(0,zt.jsx)("textarea",{className:"echly-title-editor",value:c,onChange:z=>f(z.target.value)}),(0,zt.jsx)("textarea",{className:"echly-action-editor",value:m.join(`

`),onChange:z=>{p(z.target.value.split(/\n\s*\n/))}}),D&&(0,zt.jsx)("div",{className:"echly-ticket-error",role:"alert",children:D}),(0,zt.jsxs)("div",{className:"echly-edit-actions",children:[(0,zt.jsx)("button",{type:"button",className:"echly-primary-button",disabled:S,onClick:w,children:S?"Saving...":"Save"}),(0,zt.jsx)("button",{type:"button",className:"echly-secondary-button",onClick:L,children:"Cancel"})]})]}):(0,zt.jsxs)("div",{className:"echly-ticket-header",children:[(0,zt.jsx)("input",{className:"echly-edit-title",value:c,onChange:z=>f(z.target.value),style:{width:"100%"}}),(0,zt.jsxs)("div",{className:"echly-header-actions",children:[(0,zt.jsx)("button",{type:"button",onClick:_,className:"echly-expand-btn echly-widget-action-icon","aria-label":"Expand",children:(0,zt.jsx)(od,{size:16,strokeWidth:1.5})}),(0,zt.jsx)("button",{type:"button",onClick:q,className:"echly-delete-btn echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,zt.jsx)(ud,{size:16,strokeWidth:1.5})})]})]})})]})})}var dk=_n.default.memo(SU,(t,e)=>t.item===e.item&&t.highlightTicketId===e.highlightTicketId);var $r=Le(vt());function Nv({isIdle:t,onAddFeedback:e,extensionMode:n=!1,onStartSession:a,onResumeSession:r,onOpenPreviousSession:s,hasActiveSession:i=!1,captureDisabled:u=!1}){let l=!t||u,c=l||!r,f=!!(r||s);return n?(0,$r.jsxs)("div",{className:"echly-add-insight-wrap",children:[(0,$r.jsx)("button",{type:"button",onClick:l?void 0:a,disabled:l,className:`echly-add-insight-btn ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Start New Feedback Session",children:"Start New Feedback Session"}),f&&(0,$r.jsxs)("div",{className:"echly-add-insight-secondary-row",children:[(0,$r.jsx)("button",{type:"button",onClick:c?void 0:r,disabled:c,className:`echly-add-insight-btn echly-add-insight-btn--secondary ${c?"echly-add-insight-btn--disabled":""}`,"aria-label":"Resume Session",children:"Resume Session"}),(0,$r.jsx)("button",{type:"button",onClick:l?void 0:s,disabled:l,className:`echly-add-insight-btn echly-add-insight-btn--secondary ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Previous Sessions",children:"Previous Sessions"})]})]}):(0,$r.jsx)("div",{className:"echly-add-insight-wrap",children:(0,$r.jsx)("button",{type:"button",onClick:l?void 0:e,disabled:l,className:`echly-add-insight-btn ${l?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var Tk=Le(Ld());var $s=Le(Yn()),vk=Le(Ld());var fk={outline:"2px solid #2563eb",background:"rgba(37,99,235,0.1)"},Gt=null,cd=null,Zp=null;function vU(t,e){if(typeof document.elementsFromPoint!="function")return document.elementFromPoint(t,e);let n=document.elementsFromPoint(t,e);for(let a of n)if(jp(a))return a;return null}function hk(t){if(Gt){if(!t||t.width===0||t.height===0){Gt.style.display="none";return}Gt.style.display="block",Gt.style.left=`${t.left}px`,Gt.style.top=`${t.top}px`,Gt.style.width=`${t.width}px`,Gt.style.height=`${t.height}px`}}function EU(t,e){if(!e()){Gt&&(Gt.style.display="none"),Zp=null;return}let n=vU(t.clientX,t.clientY);if(n!==Zp){if(Zp=n,!n){hk(null);return}let a=n.getBoundingClientRect();hk(a)}}function pk(t,e){return Gt&&Gt.parentNode&&em(),Gt=document.createElement("div"),Gt.setAttribute("aria-hidden","true"),Gt.setAttribute("data-echly-ui","true"),Gt.style.cssText=["position:fixed","pointer-events:none","z-index:2147483646","box-sizing:border-box","border-radius:4px",`outline:${fk.outline}`,`background:${fk.background}`,"display:none"].join(";"),t.appendChild(Gt),cd=n=>EU(n,e.getActive),document.addEventListener("mousemove",cd,{passive:!0}),()=>em()}function em(){cd&&(document.removeEventListener("mousemove",cd),cd=null),Zp=null,Gt?.parentNode&&Gt.parentNode.removeChild(Gt),Gt=null}var Bi=null,Vv=()=>!1,Fv=()=>{};function TU(t){if(t.button!==0||!Vv())return;let e=t.target;!e||!jp(e)||(t.preventDefault(),t.stopPropagation(),Qs("element clicked"),Fv(e))}function mk(t,e){return Vv=e.enabled,Fv=e.onElementClicked,Bi&&document.removeEventListener("click",Bi,!0),Bi=TU,document.addEventListener("click",Bi,!0),()=>Uv()}function Uv(){Bi&&(document.removeEventListener("click",Bi,!0),Bi=null),Vv=()=>!1,Fv=()=>{}}var ln=Le(vt());function gk(){return(0,ln.jsxs)(ln.Fragment,{children:[(0,ln.jsx)("style",{children:`
        @keyframes echly-inline-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}),(0,ln.jsx)("span",{"aria-hidden":!0,style:{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.28)",borderTopColor:"rgba(255,255,255,0.92)",opacity:.8,animation:"echly-inline-spin 0.8s linear infinite",flexShrink:0}})]})}function yk({sessionPaused:t,pausePending:e=!1,endPending:n=!1,onPause:a,onResume:r,onEnd:s}){return(0,ln.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderRadius:18,background:"rgba(20,22,28,0.82)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",zIndex:2147483647,border:"1px solid rgba(255,255,255,0.08)",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},children:[(0,ln.jsx)("span",{style:{fontSize:14,fontWeight:600,color:"#F3F4F6"},children:t?"Session paused":"Session started"}),e?(0,ln.jsxs)("button",{type:"button",disabled:!0,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:8,opacity:.9,cursor:"default"},children:[(0,ln.jsx)(gk,{}),(0,ln.jsx)("span",{children:"Pausing\u2026"})]}):t?(0,ln.jsx)("button",{type:"button",onClick:r,disabled:e,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#466EFF",color:"#fff",fontSize:13,fontWeight:500,cursor:e?"default":"pointer",opacity:e?.7:1},children:"Resume Feedback Session"}):(0,ln.jsx)("button",{type:"button",onClick:a,disabled:n,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:n?"default":"pointer",opacity:n?.7:1},children:"Pause"}),n?(0,ln.jsxs)("button",{type:"button",disabled:!0,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#EF4444",color:"#fff",fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:8,opacity:.9,cursor:"default"},children:[(0,ln.jsx)(gk,{}),(0,ln.jsx)("span",{children:"Ending\u2026"})]}):(0,ln.jsx)("button",{type:"button",onClick:s,disabled:e,style:{padding:"8px 14px",borderRadius:10,border:"none",background:"#EF4444",color:"#fff",fontSize:13,fontWeight:500,cursor:e?"default":"pointer",opacity:e?.7:1},children:"End"})]})}var Bv=Le(Yn()),$t=Le(vt());function Ik({screenshot:t,isVoiceListening:e,onRecordVoice:n,onDoneVoice:a,onSaveText:r,onCancel:s}){let[i,u]=(0,Bv.useState)("choose"),[l,c]=(0,Bv.useState)("");return(0,$t.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"min(380px, 92vw)",borderRadius:14,background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.08)",zIndex:2147483647,overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},children:[(0,$t.jsxs)("div",{style:{padding:20,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,$t.jsx)("div",{style:{borderRadius:14,overflow:"hidden",background:"rgba(0,0,0,0.3)",aspectRatio:"16/10",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,$t.jsx)("img",{src:t,alt:"Capture",style:{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}})}),(0,$t.jsx)("p",{style:{margin:"12px 0 0",fontSize:13,fontWeight:500,color:"#A1A1AA"},children:"Speak or type feedback"})]}),(0,$t.jsxs)("div",{style:{padding:20,display:"flex",flexDirection:"column",gap:12},children:[i==="choose"&&(0,$t.jsxs)($t.Fragment,{children:[(0,$t.jsx)("button",{type:"button",onClick:()=>{u("voice"),n()},style:{padding:"12px 16px",borderRadius:10,border:"none",background:"#466EFF",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"},children:"Describe the change"}),(0,$t.jsx)("button",{type:"button",onClick:()=>{u("text")},style:{padding:"12px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14,fontWeight:500,cursor:"pointer"},children:"Type feedback"})]}),i==="voice"&&(0,$t.jsx)("button",{type:"button",onClick:a,disabled:!e,style:{padding:"12px 16px",borderRadius:10,border:"none",background:e?"#466EFF":"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,fontWeight:600,cursor:e?"pointer":"default"},children:e?"Save feedback":"Saving feedback\u2026"}),i==="text"&&(0,$t.jsxs)($t.Fragment,{children:[(0,$t.jsx)("textarea",{value:l,onChange:S=>c(S.target.value),placeholder:"Describe feedback","aria-label":"Feedback text",rows:3,style:{width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14,resize:"vertical",minHeight:80}}),(0,$t.jsx)("button",{type:"button",onClick:()=>{let S=l.trim();S&&r(S)},disabled:!l.trim(),style:{padding:"12px 16px",borderRadius:10,border:"none",background:l.trim()?"#466EFF":"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,fontWeight:600,cursor:l.trim()?"pointer":"default"},children:"Save feedback"})]}),s&&i==="choose"&&(0,$t.jsx)("button",{type:"button",onClick:s,style:{padding:"8px 12px",border:"none",background:"transparent",color:"#A1A1AA",fontSize:13,fontWeight:500,cursor:"pointer",alignSelf:"flex-start"},children:"Discard"})]})]})}var Jr=Le(vt()),_k=12;function bU(){let t=['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">','<path fill="white" stroke="black" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',"</svg>"].join("");return`url("data:image/svg+xml;utf8,${encodeURIComponent(t)}") 6 6, auto`}var Sk=bU();function Ek({captureRoot:t,sessionMode:e,sessionPaused:n,pausePending:a=!1,endPending:r=!1,sessionFeedbackPending:s,state:i,onElementClicked:u,onPause:l,onResume:c,onEnd:f,onRecordVoice:m,onDoneVoice:p,onSaveText:S,onCancel:R}){let D=(0,$s.useRef)([]),[A,E]=(0,$s.useState)(null),_=a||r,w=e&&!n&&!_,L=e&&!n&&!_&&s==null;if((0,$s.useEffect)(()=>{if(!e||!t)return;let z=()=>e&&!n&&!_&&s==null;return D.current.push(pk(t,{getActive:z})),D.current.push(mk(t,{enabled:z,onElementClicked:u})),()=>{D.current.forEach(v=>v()),D.current=[],em(),Uv()}},[e,t,n,_,s,u]),(0,$s.useEffect)(()=>{if(!t?.isConnected)return;let z=document.body.style.cursor;return document.body.style.cursor=w?Sk:"",()=>{document.body.style.cursor=z}},[w,t]),(0,$s.useEffect)(()=>{if(!L){E(null);return}let z=v=>{E({x:v.clientX+_k,y:v.clientY+_k})};return window.addEventListener("mousemove",z,{passive:!0}),()=>window.removeEventListener("mousemove",z)},[L]),!e||!t)return null;let q=(0,Jr.jsxs)(Jr.Fragment,{children:[(0,Jr.jsx)("div",{"aria-hidden":!0,className:"echly-session-overlay-cursor",style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:2147483645,cursor:w?Sk:"default"}}),(0,Jr.jsx)(yk,{sessionPaused:n,pausePending:a,endPending:r,onPause:l,onResume:c,onEnd:f}),L&&A!=null&&(0,Jr.jsx)("div",{"aria-hidden":!0,className:"echly-capture-tooltip",style:{position:"fixed",left:A.x,top:A.y,pointerEvents:"none",zIndex:2147483646,padding:"6px 10px",fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.95)",background:"rgba(0,0,0,0.75)",borderRadius:6,whiteSpace:"nowrap",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"},children:"Click to add feedback"}),s&&(0,Jr.jsx)(Ik,{screenshot:s.screenshot,isVoiceListening:i==="voice_listening",onRecordVoice:m,onDoneVoice:p,onSaveText:S,onCancel:R})]});return(0,vk.createPortal)(q,t)}var cr=Le(vt());function bk({captureRoot:t,extensionMode:e,state:n,getFullTabImage:a,onRegionCaptured:r,onRegionSelectStart:s,onCancelCapture:i,sessionMode:u=!1,globalSessionModeActive:l=!1,sessionId:c,sessionPaused:f=!1,pausePending:m=!1,endPending:p=!1,sessionFeedbackPending:S=null,onSessionElementClicked:R,onSessionPause:D,onSessionResume:A,onSessionEnd:E,onSessionRecordVoice:_,onSessionDoneVoice:w,onSessionSaveText:L,onSessionFeedbackCancel:q=()=>{}}){if(e&&(!u||!c))return null;let z=u&&e&&!!l&&!!c;return(0,cr.jsx)(cr.Fragment,{children:(0,Tk.createPortal)((0,cr.jsxs)(cr.Fragment,{children:[z&&R&&D&&A&&E&&_&&w&&L&&(0,cr.jsx)(Ek,{captureRoot:t,sessionMode:u,sessionPaused:f,pausePending:m,endPending:p,sessionFeedbackPending:S??null,state:n,onElementClicked:R,onPause:D,onResume:A,onEnd:E,onRecordVoice:_,onDoneVoice:w,onSaveText:L,onCancel:q}),!z&&(n==="focus_mode"||n==="region_selecting")&&(0,cr.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.08)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),!z&&e&&(n==="focus_mode"||n==="region_selecting")&&(0,cr.jsx)(XR,{getFullTabImage:a,onAddVoice:r,onCancel:i,onSelectionStart:s})]}),t)})}var dr=Le(Yn()),jt=Le(vt());function wU(t,e){if(e==="all")return t;let n=Date.now(),a={today:24*60*60*1e3,"7days":7*24*60*60*1e3,"30days":30*24*60*60*1e3},r=n-a[e];return t.filter(s=>(s.updatedAt?new Date(s.updatedAt).getTime():0)>=r)}function CU(t){if(!t)return"\u2014";let e=new Date(t),a=new Date().getTime()-e.getTime(),r=Math.floor(a/6e4);if(r<1)return"Just now";if(r<60)return`${r}m ago`;let s=Math.floor(r/60);if(s<24)return`${s}h ago`;let i=Math.floor(s/24);return i<7?`${i}d ago`:e.toLocaleDateString()}function wk({open:t,onClose:e,fetchSessions:n,onSelectSession:a}){let[r,s]=(0,dr.useState)([]),[i,u]=(0,dr.useState)(!1),[l,c]=(0,dr.useState)(null),[f,m]=(0,dr.useState)(""),[p,S]=(0,dr.useState)("all");(0,dr.useEffect)(()=>{t&&(m(""),S("all"),c(null),u(!0),n().then(A=>{console.log("[Echly] Sessions returned:",A),s(A)}).catch(A=>c(A instanceof Error?A.message:"Failed to load sessions")).finally(()=>u(!1)))},[t,n]);let R=(0,dr.useMemo)(()=>{let A=wU(r,p);if(f.trim()){let E=f.trim().toLowerCase();A=A.filter(_=>(_.title??"").toLowerCase().includes(E)||(_.id??"").toLowerCase().includes(E))}return A},[r,p,f]),D=A=>{if(typeof A.feedbackCount=="number")return A.feedbackCount;let E=typeof A.openCount=="number"?A.openCount:0,_=typeof A.resolvedCount=="number"?A.resolvedCount:0,w=typeof A.skippedCount=="number"?A.skippedCount:0;return E+_+w};return t?(0,jt.jsx)("div",{"data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:24},onClick:A=>A.target===A.currentTarget&&e(),role:"dialog","aria-modal":"true","aria-labelledby":"resume-session-modal-title",children:(0,jt.jsxs)("div",{style:{width:"min(420px, 100%)",maxHeight:"85vh",borderRadius:18,background:"rgba(20,22,28,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 10px 30px rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:'"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif'},onClick:A=>A.stopPropagation(),children:[(0,jt.jsxs)("div",{style:{padding:20,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,jt.jsx)("h2",{id:"resume-session-modal-title",style:{margin:"0 0 16px",fontSize:18,fontWeight:600,color:"#F3F4F6"},children:"Resume Feedback Session"}),(0,jt.jsx)("input",{type:"search",placeholder:"Search sessions",value:f,onChange:A=>m(A.target.value),"aria-label":"Search sessions",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.06)",color:"#F3F4F6",fontSize:14}}),(0,jt.jsx)("div",{style:{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"},children:["today","7days","30days","all"].map(A=>(0,jt.jsx)("button",{type:"button",onClick:()=>S(A),style:{padding:"8px 12px",borderRadius:10,border:"none",background:p===A?"rgba(70, 110, 255, 0.2)":"rgba(255,255,255,0.08)",color:"#F3F4F6",fontSize:12,fontWeight:500,cursor:"pointer"},children:A==="today"?"Today":A==="7days"?"Last 7 days":A==="30days"?"Last 30 days":"All sessions"},A))})]}),(0,jt.jsxs)("div",{style:{flex:1,overflow:"auto",minHeight:200,maxHeight:360},children:[i&&(0,jt.jsx)("div",{style:{padding:24,textAlign:"center",color:"#A1A1AA",fontSize:14},children:"Loading sessions\u2026"}),l&&(0,jt.jsx)("div",{style:{padding:24,color:"#EF4444",fontSize:14},children:l}),!i&&!l&&R.length===0&&(0,jt.jsx)("div",{style:{padding:24,textAlign:"center",color:"#A1A1AA",fontSize:14},children:"No sessions match."}),!i&&!l&&R.length>0&&(0,jt.jsx)("ul",{style:{listStyle:"none",margin:0,padding:12},children:R.map(A=>(0,jt.jsx)("li",{style:{marginBottom:4},children:(0,jt.jsxs)("button",{type:"button",onClick:()=>{a(A.id),e()},style:{width:"100%",textAlign:"left",padding:"14px 16px",borderRadius:14,border:"none",background:"transparent",color:"#F3F4F6",fontSize:14,cursor:"pointer"},onMouseEnter:E=>{E.currentTarget.style.background="rgba(255,255,255,0.06)"},onMouseLeave:E=>{E.currentTarget.style.background="transparent"},children:[(0,jt.jsx)("div",{style:{fontWeight:600},children:A.title?.trim()||"Untitled Session"}),(0,jt.jsxs)("div",{style:{fontSize:12,fontWeight:500,color:"#A1A1AA",marginTop:4},children:[D(A)," feedback items \xB7 ",CU(A.updatedAt)]})]})},A.id))})]}),(0,jt.jsx)("div",{style:{padding:16,borderTop:"1px solid rgba(255,255,255,0.08)"},children:(0,jt.jsx)("button",{type:"button",onClick:e,style:{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#A1A1AA",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Cancel"})})]})}):null}var Kt=Le(vt()),LU=["focus_mode","region_selecting","voice_listening","processing"];function tm({sessionId:t,userId:e,extensionMode:n=!1,initialPointers:a,onComplete:r,onDelete:s,onUpdate:i,widgetToggleRef:u,onRecordingChange:l,expanded:c,onExpandRequest:f,onCollapseRequest:m,captureDisabled:p=!1,theme:S="dark",onThemeToggle:R,fetchSessions:D,hasPreviousSessions:A=!1,lastKnownSessionId:E=null,onResumeSessionSelect:_,loadSessionWithPointers:w,pointers:L,onSessionLoaded:q,onSessionEnd:z,onCreateSession:v,onActiveSessionChange:g,globalSessionModeActive:I,globalSessionPaused:b,onSessionModeStart:C,onSessionModePause:x,onSessionModeResume:T,onSessionModeEnd:de}){let[Se,lt]=(0,ia.useState)(!1),[M,P]=(0,ia.useState)(!0),{state:N,handlers:W,refs:Q,captureRootEl:ae}=sk({sessionId:t,userId:e,extensionMode:n,initialPointers:a,onComplete:r,onDelete:s,onUpdate:i,onRecordingChange:l,loadSessionWithPointers:w,pointers:L,onSessionLoaded:q,onCreateSession:v,onActiveSessionChange:g,globalSessionModeActive:I,globalSessionPaused:b,onSessionModeStart:C,onSessionModePause:x,onSessionModeResume:T,onSessionModeEnd:de}),Fe=c!==void 0?c:N.isOpen,Qe=(0,ia.useRef)(null),Ge=LU.includes(N.state)||N.pillExiting,Cn=!!t,Ln=!Ge&&!N.sessionMode,Sn=N.sessionMode&&N.sessionPaused,Zr=!Fe&&Ln&&!Sn,es=Fe&&Ln||Sn,vn=!!N.pointers?.length,V=!vn&&N.state==="idle",J=!!E||Cn,ee=!!A,ve=(0,ia.useRef)(!1);(0,ia.useEffect)(()=>{if(!Ge){ve.current=!1;return}ve.current||(ve.current=!0,m?.())},[Ge,m]);let me=N.pointers.length,Ue=N.pointers.filter(re=>/critical|bug|high|urgent/i.test(re.type||"")).length,ct=me>0?Ue>0?`${me} insights \u2022 ${Ue} need attention`:`${me} insights`:null;(0,ia.useEffect)(()=>{N.highlightTicketId&&Qe.current&&Qe.current.scrollTo({top:0,behavior:"smooth"})},[N.highlightTicketId]),(0,ia.useEffect)(()=>{w?.sessionId&&P(!1)},[w?.sessionId]),ia.default.useEffect(()=>{if(u)return u.current=W.toggleOpen,()=>{u.current=null}},[W,u]);let ge=ia.default.useCallback(()=>{let re=E??t;re&&_?.(re,{enterCaptureImmediately:!0})},[E,t,_]);return(0,Kt.jsxs)(Kt.Fragment,{children:[n&&D&&_&&(0,Kt.jsx)(wk,{open:Se,onClose:()=>lt(!1),fetchSessions:D,onSelectSession:re=>{P(!1),_(re),lt(!1)}}),ae&&(0,Kt.jsx)(bk,{captureRoot:ae,extensionMode:n,state:N.state,getFullTabImage:W.getFullTabImage,onRegionCaptured:W.handleRegionCaptured,onRegionSelectStart:W.handleRegionSelectStart,onCancelCapture:W.handleCancelCapture,sessionMode:N.sessionMode,globalSessionModeActive:I,sessionId:t,sessionPaused:N.sessionPaused,pausePending:N.pausePending,endPending:N.endPending,sessionFeedbackPending:N.sessionFeedbackPending,onSessionElementClicked:W.handleSessionElementClicked,onSessionPause:()=>{W.pauseSession(),f?.()},onSessionResume:()=>{W.resumeSession(),m?.()},onSessionEnd:()=>{W.endSession(()=>{P(!0),z?.()})},onSessionRecordVoice:W.handleSessionStartVoice,onSessionDoneVoice:W.finishListening,onSessionSaveText:W.handleSessionFeedbackSubmit,onSessionFeedbackCancel:W.handleSessionFeedbackCancel}),Zr&&(0,Kt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,Kt.jsx)("button",{type:"button",onClick:()=>f?f():W.setIsOpen(!0),className:"echly-floating-trigger",children:n?"Echly":"Capture feedback"})}),es&&(0,Kt.jsxs)(Kt.Fragment,{children:[!n&&(0,Kt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,Kt.jsx)("div",{ref:Q.widgetRef,className:"echly-sidebar-container",style:n?{position:"fixed",...N.position?{left:N.position.x,top:N.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,Kt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,Kt.jsx)(Mv,{onClose:()=>m?m():W.setIsOpen(!1),summary:ct,theme:S,onThemeToggle:R,handlers:{endSession:W.endSession,clearPointers:void 0},onShowCommandScreen:()=>P(!0)}),(0,Kt.jsxs)("div",{ref:Qe,className:"echly-sidebar-body",children:[vn&&(0,Kt.jsx)("div",{className:"echly-feedback-list",children:N.pointers.map(re=>(0,Kt.jsx)(dk,{item:re,onUpdate:i??W.updatePointer,onDelete:W.deletePointer,highlightTicketId:N.highlightTicketId,onExpandChange:W.setExpandedId},re.id))}),N.errorMessage&&(0,Kt.jsx)("div",{className:"echly-sidebar-error",children:N.errorMessage}),V&&(0,Kt.jsx)(Nv,{isIdle:!0,onAddFeedback:W.handleAddFeedback,extensionMode:n,onStartSession:n?W.startSession:void 0,onResumeSession:n&&J?ge:void 0,onOpenPreviousSession:n&&ee&&D&&_?()=>lt(!0):void 0,hasActiveSession:Cn,captureDisabled:p})]})]})})]})]})}var Et=Le(vt()),AU="echly-root",nm="echly-shadow-host",Lk="widget-theme",xU="http://localhost:3000";function RU(){try{let t=localStorage.getItem(Lk);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function kU(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem(Lk,e)}catch{}}function qi(t){let e=document.getElementById(nm);e&&(e.style.display=t?"block":"none")}function DU(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function PU({widgetRoot:t,initialTheme:e}){let[n,a]=pe.default.useState(null),[r,s]=pe.default.useState(null),[i,u]=pe.default.useState(!1),[l,c]=pe.default.useState(e),[f,m]=pe.default.useState({visible:!1,expanded:!1,isRecording:!1,sessionId:null,sessionModeActive:!1,sessionPaused:!1,pointers:[]}),[p,S]=pe.default.useState(0),[R,D]=pe.default.useState(!1),[A,E]=pe.default.useState(null),_=f.sessionId,w=pe.default.useRef(null),L=pe.default.useRef(!1),[q,z]=pe.default.useState(null),[v,g]=pe.default.useState(!1),[I,b]=pe.default.useState(!1),[C,x]=pe.default.useState(""),T=pe.default.useRef(null),de=pe.default.useRef(!1),[Se,lt]=pe.default.useState(!1),M=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";pe.default.useEffect(()=>{let V=()=>{w.current?.()};return window.addEventListener("ECHLY_TOGGLE_WIDGET",V),()=>{window.removeEventListener("ECHLY_TOGGLE_WIDGET",V)}},[]),pe.default.useEffect(()=>{let V=()=>{m(J=>({...J,expanded:!1})),S(J=>J+1)};return window.addEventListener("ECHLY_RESET_WIDGET",V),()=>window.removeEventListener("ECHLY_RESET_WIDGET",V)},[]),pe.default.useEffect(()=>{let V=J=>{qi(J.visible),m(J)};return window.__ECHLY_APPLY_GLOBAL_STATE__=V,()=>{delete window.__ECHLY_APPLY_GLOBAL_STATE__}},[]),pe.default.useEffect(()=>{let V=J=>{let ee=J.detail?.state;ee&&(le("CONTENT","global state received",ee),qi(ee.visible),m(ee))};return window.addEventListener("ECHLY_GLOBAL_STATE",V),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",V)},[]),pe.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},V=>{V?.state&&(qi(V.state.visible??!1),m(V.state))})},[]),pe.default.useEffect(()=>{let V=()=>{document.hidden||chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},J=>{if(J?.state){let ee=am(J.state);ee&&(qi(ee.visible),m(ee))}})};return document.addEventListener("visibilitychange",V),()=>document.removeEventListener("visibilitychange",V)},[]),pe.default.useEffect(()=>{if(!f.visible)return;let V=!1;async function J(){try{let ve=await(await mt("/api/sessions?limit=1")).json();V||D(!!ve.sessions?.length)}catch{V||D(!1)}}return J(),()=>{V=!0}},[f.visible]),pe.default.useEffect(()=>{f.visible&&chrome.runtime.sendMessage({type:"ECHLY_GET_ACTIVE_SESSION"},V=>{V?.sessionId&&E(V.sessionId)})},[f.visible]);let P=pe.default.useCallback(V=>{V?chrome.runtime.sendMessage({type:"START_RECORDING"},J=>{if(chrome.runtime.lastError){s(chrome.runtime.lastError.message||"Failed to start recording");return}J?.ok||s(J?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),N=pe.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{})},[]),W=pe.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{})},[]),Q=pe.default.useCallback(()=>{let V=l==="dark"?"light":"dark";c(V),kU(t,V)},[l,t]);pe.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},V=>{V?.authenticated&&V.user?.uid?a({uid:V.user.uid,name:V.user.name??null,email:V.user.email??null,photoURL:V.user.photoURL??null}):a(null),u(!0)})},[]);let ae=pe.default.useCallback(async(V,J,ee,ve,me)=>{if(le("PIPELINE","start"),L.current){le("PIPELINE","blocked by submissionLock"),ee?.onError?.();return}if(L.current=!0,!_||!n){le("PIPELINE","error"),ee?.onError(),L.current=!1;return}if(ee){(async()=>{let Ue=cI(J??null),ct=Zy(),ge=eI(),re=J?tI(J,_,ge):Promise.resolve(null),je=await Ue;console.log("[OCR] Extracted visibleText:",je);let $e=typeof window<"u"?window.location.href:"",Ke={...ve??{},visibleText:je?.trim()&&je||ve?.visibleText||null,url:ve?.url??$e},et={transcript:V,context:Ke};try{le("PIPELINE","structure request"),console.log("[VOICE] final transcript submitted",V);let we=await(await mt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(et)})).json(),dt=Array.isArray(we.tickets)?we.tickets:[],Be=typeof we.clarityScore=="number"?we.clarityScore:we.clarityScore!=null?Number(we.clarityScore):100,cn=we.clarityIssues??[],Tt=we.suggestedRewrite??null,It=we.confidence??.5;if(!!!me?.sessionMode){if(we.success&&Be<=20){console.log("CLARITY GUARD TRIGGERED",Be),z({tickets:dt,screenshotUrl:null,screenshotId:ge,uploadPromise:re,transcript:V,screenshot:J,firstFeedbackId:ct,clarityScore:Be,clarityIssues:cn,suggestedRewrite:Tt,confidence:It,callbacks:ee,context:Ke}),x(V),b(!1),de.current=!1,lt(!1),g(!0),L.current=!1;return}let qe=!!we.needsClarification,Ce=we.verificationIssues??[];if(we.success&&qe&&dt.length===0){console.log("PIPELINE NEEDS CLARIFICATION",Ce),z({tickets:[],screenshotUrl:null,screenshotId:ge,uploadPromise:re,transcript:V,screenshot:J,firstFeedbackId:ct,clarityScore:Be,clarityIssues:Ce.length>0?Ce:cn,suggestedRewrite:Tt,confidence:It,callbacks:ee,context:Ke}),x(V),b(!1),de.current=!1,lt(!1),g(!0),L.current=!1;return}}if(!we.success||dt.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:V,screenshotUrl:null,screenshotId:ge,sessionId:_,context:Ke}},qe=>{if(L.current=!1,chrome.runtime.lastError){le("PIPELINE","error"),ee.onError();return}if(qe?.success&&qe.ticket){let Ce=qe.ticket.id,rt=qe.ticket,An=Array.isArray(rt.actionSteps)?rt.actionSteps:rt.description?rt.description.split(/\n\s*\n/):[];le("PIPELINE","ticket created",{ticketId:Ce}),ee.onSuccess({id:Ce,title:rt.title,actionSteps:An,type:rt.type??"Feedback"}),re.then(ft=>{ft&&(le("PIPELINE","screenshot uploaded",{screenshotUrl:ft}),le("PIPELINE","screenshot patched",{ticketId:Ce}),mt(`/api/tickets/${Ce}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ft})}).catch(()=>{}))}).catch(()=>{})}else le("PIPELINE","error"),ee.onError()});return}let bt=Be>=85?"clear":Be>=60?"needs_improvement":"unclear",wt={clarityScore:Be,clarityIssues:cn,clarityConfidence:It,clarityStatus:bt},Jt;for(let qe=0;qe<dt.length;qe++){let Ce=dt[qe],rt=typeof Ce.description=="string"?Ce.description:Ce.title??"",An=Array.isArray(Ce.actionSteps)?Ce.actionSteps:[],ft={sessionId:_,title:Ce.title??"",description:rt,type:Array.isArray(Ce.suggestedTags)&&Ce.suggestedTags[0]?Ce.suggestedTags[0]:"Feedback",contextSummary:rt,actionSteps:An,suggestedTags:Ce.suggestedTags,screenshotUrl:null,screenshotId:qe===0?ge:void 0,metadata:{clientTimestamp:Date.now()},...wt},_t=await(await mt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ft)})).json();if(_t.success&&_t.ticket){let xn=_t.ticket,Oa=xn.actionSteps??(xn.description?xn.description.split(/\n\s*\n/):[]);Jt||(Jt={id:xn.id,title:xn.title,actionSteps:Oa,type:xn.type??"Feedback"})}}if(L.current=!1,Jt){let qe=Jt.id;le("PIPELINE","ticket created",{ticketId:qe}),re.then(Ce=>{Ce&&(le("PIPELINE","screenshot uploaded",{screenshotUrl:Ce}),le("PIPELINE","screenshot patched",{ticketId:qe}),mt(`/api/tickets/${qe}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Ce})}).catch(()=>{}))}).catch(()=>{}),ee.onSuccess(Jt)}else le("PIPELINE","error"),ee.onError()}catch(_e){console.error("[Echly] Structure or submit failed:",_e),L.current=!1,le("PIPELINE","error"),ee.onError()}})();return}try{let Ue=eI(),ct=J?tI(J,_,Ue):Promise.resolve(null),ge=await cI(J??null);console.log("[OCR] Extracted visibleText:",ge);let re=typeof window<"u"?window.location.href:"",je={transcript:V,context:{...ve??{},visibleText:ge?.trim()&&ge||ve?.visibleText||null,url:ve?.url??re}};le("PIPELINE","structure request"),console.log("[VOICE] final transcript submitted",V);let Ke=await(await mt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(je)})).json(),et=Array.isArray(Ke.tickets)?Ke.tickets:[],_e=Ke.clarityScore??100,we=Ke.clarityIssues??[],dt=Ke.suggestedRewrite??null,Be=Ke.confidence??.5;if(!Ke.success||et.length===0)return;let cn=_e>=85?"clear":_e>=60?"needs_improvement":"unclear",Tt={clarityScore:_e,clarityIssues:we,clarityConfidence:Be,clarityStatus:cn},It;for(let tt=0;tt<et.length;tt++){let bt=et[tt],wt=typeof bt.description=="string"?bt.description:bt.title??"",Jt={sessionId:_,title:bt.title??"",description:wt,type:Array.isArray(bt.suggestedTags)&&bt.suggestedTags[0]?bt.suggestedTags[0]:"Feedback",contextSummary:wt,actionSteps:Array.isArray(bt.actionSteps)?bt.actionSteps:[],suggestedTags:bt.suggestedTags,screenshotUrl:null,screenshotId:tt===0?Ue:void 0,metadata:{clientTimestamp:Date.now()},...Tt},Ce=await(await mt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Jt)})).json();if(Ce.success&&Ce.ticket){let rt=Ce.ticket,An=rt.actionSteps??(rt.description?rt.description.split(/\n\s*\n/):[]);It||(It={id:rt.id,title:rt.title,actionSteps:An,type:rt.type??"Feedback"})}}if(It){let tt=It.id;ct.then(bt=>{bt&&mt(`/api/tickets/${tt}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:bt})}).catch(()=>{})}).catch(()=>{})}return It}finally{L.current=!1}},[_,n]),at=pe.default.useCallback(async V=>{try{await mt(`/api/tickets/${V}`,{method:"DELETE"})}catch(J){throw console.error("[Echly] Delete ticket failed:",J),J}},[]),Fe=pe.default.useCallback(async(V,J)=>{await mt(`/api/tickets/${V}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:J.title,description:J.actionSteps?.join(`
`)??"",actionSteps:J.actionSteps??[]})})},[]),Qe=pe.default.useCallback(async()=>{let V=await mt("/api/sessions"),J=await V.json(),ee=J.sessions??[];return console.log("[Echly] Sessions returned:",{ok:V.ok,status:V.status,success:J.success,count:ee.length,sessions:ee}),!V.ok||!J.success?[]:ee},[]),Ge=pe.default.useCallback(async()=>{console.log("[Echly] Creating session");try{let V=await mt("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),J=await V.json();return console.log("[Echly] Create session response:",{ok:V.ok,status:V.status,success:J.success,sessionId:J.session?.id}),!V.ok||!J.success||!J.session?.id?null:{id:J.session.id}}catch(V){return console.error("[Echly] Failed to create session:",V),null}},[]),Cn=pe.default.useCallback(V=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:V},()=>{})},[]),Ln=pe.default.useCallback(async(V,J)=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:V},()=>{}),chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{});try{let ve=await(await mt(`/api/sessions/${V}`)).json();ve?.session?.url&&chrome.runtime.sendMessage({type:"ECHLY_OPEN_TAB",url:ve.session.url}).catch(()=>{})}catch{}},[]),Sn=pe.default.useCallback(async V=>{if(!_)return;if(V.tickets.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:V.transcript,screenshotUrl:null,screenshotId:V.screenshotId,sessionId:_,context:V.context??{}}},ve=>{if(chrome.runtime.lastError){console.error("[Echly] Submit anyway failed:",chrome.runtime.lastError.message),le("PIPELINE","error"),V.callbacks.onError();return}if(ve?.success&&ve.ticket){let me=ve.ticket,Ue=me.id,ct=Array.isArray(me.actionSteps)?me.actionSteps:me.description?me.description.split(/\n\s*\n/):[];V.callbacks.onSuccess({id:Ue,title:me.title,actionSteps:ct,type:me.type??"Feedback"}),V.uploadPromise.then(ge=>{ge&&mt(`/api/tickets/${Ue}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ge})}).catch(()=>{})}).catch(()=>{})}else le("PIPELINE","error"),V.callbacks.onError()});return}let J={clarityScore:V.clarityScore,clarityIssues:V.clarityIssues,clarityConfidence:V.confidence,clarityStatus:V.clarityScore>=85?"clear":V.clarityScore>=60?"needs_improvement":"unclear"},ee;for(let ve=0;ve<V.tickets.length;ve++){let me=V.tickets[ve],Ue=typeof me.description=="string"?me.description:me.title??"",ct={sessionId:_,title:me.title??"",description:Ue,type:Array.isArray(me.suggestedTags)&&me.suggestedTags[0]?me.suggestedTags[0]:"Feedback",contextSummary:Ue,actionSteps:Array.isArray(me.actionSteps)?me.actionSteps:[],suggestedTags:me.suggestedTags,screenshotUrl:null,screenshotId:ve===0?V.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...J},re=await(await mt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ct)})).json();if(re.success&&re.ticket){let je=re.ticket,$e=je.actionSteps??(je.description?je.description.split(/\n\s*\n/):[]);ee||(ee={id:je.id,title:je.title,actionSteps:$e,type:je.type??"Feedback"})}}if(ee){let ve=ee.id;V.uploadPromise.then(me=>{me&&mt(`/api/tickets/${ve}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:me})}).catch(()=>{})}).catch(()=>{}),V.callbacks.onSuccess(ee)}else le("PIPELINE","error"),V.callbacks.onError()},[_]),Zr=pe.default.useCallback(async(V,J)=>{if(!_)return;let ee=J.trim();try{let ve={transcript:ee,context:V.context??{}},Ue=await(await mt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ve)})).json(),ct=Array.isArray(Ue.tickets)?Ue.tickets:[],ge=Ue.clarityScore??100,re=Ue.confidence??.5,je=ge>=85?"clear":ge>=60?"needs_improvement":"unclear",$e={clarityScore:ge,clarityIssues:Ue.clarityIssues??[],clarityConfidence:re,clarityStatus:je};if(ct.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:ee,screenshotUrl:null,screenshotId:V.screenshotId,sessionId:_,context:V.context??{}}},et=>{if(chrome.runtime.lastError){console.error("[Echly] Submit edited feedback failed:",chrome.runtime.lastError.message),le("PIPELINE","error"),V.callbacks.onError();return}if(et?.success&&et.ticket){let _e=et.ticket,we=_e.id,dt=Array.isArray(_e.actionSteps)?_e.actionSteps:_e.description?_e.description.split(/\n\s*\n/):[];V.callbacks.onSuccess({id:we,title:_e.title,actionSteps:dt,type:_e.type??"Feedback"}),V.uploadPromise.then(Be=>{Be&&mt(`/api/tickets/${we}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Be})}).catch(()=>{})}).catch(()=>{})}else le("PIPELINE","error"),V.callbacks.onError()});return}let Ke;for(let et=0;et<ct.length;et++){let _e=ct[et],we=typeof _e.description=="string"?_e.description:_e.title??"",dt={sessionId:_,title:_e.title??"",description:we,type:Array.isArray(_e.suggestedTags)&&_e.suggestedTags[0]?_e.suggestedTags[0]:"Feedback",contextSummary:we,actionSteps:Array.isArray(_e.actionSteps)?_e.actionSteps:[],suggestedTags:_e.suggestedTags,screenshotUrl:null,screenshotId:et===0?V.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...$e},cn=await(await mt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(dt)})).json();if(cn.success&&cn.ticket){let Tt=cn.ticket,It=Tt.actionSteps??(Tt.description?Tt.description.split(/\n\s*\n/):[]);Ke||(Ke={id:Tt.id,title:Tt.title,actionSteps:It,type:Tt.type??"Feedback"})}}if(Ke){let et=Ke.id;V.uploadPromise.then(_e=>{_e&&mt(`/api/tickets/${et}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:_e})}).catch(()=>{})}).catch(()=>{}),V.callbacks.onSuccess(Ke)}else le("PIPELINE","error"),V.callbacks.onError()}catch(ve){console.error("[Echly] Submit edited feedback failed:",ve),le("PIPELINE","error"),V.callbacks.onError()}},[_]),es=pe.default.useCallback(async()=>{let V=q;if(!(!V?.suggestedRewrite?.trim()||!_)){z(null);try{let ee=await(await mt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:V.suggestedRewrite.trim()})})).json(),ve=Array.isArray(ee.tickets)?ee.tickets:[],me=ee.clarityScore??100,Ue=ee.confidence??.5,ct=me>=85?"clear":me>=60?"needs_improvement":"unclear",ge={clarityScore:me,clarityIssues:ee.clarityIssues??[],clarityConfidence:Ue,clarityStatus:ct},re;for(let je=0;je<ve.length;je++){let $e=ve[je],Ke=typeof $e.description=="string"?$e.description:$e.title??"",et={sessionId:_,title:$e.title??"",description:Ke,type:Array.isArray($e.suggestedTags)&&$e.suggestedTags[0]?$e.suggestedTags[0]:"Feedback",contextSummary:Ke,actionSteps:Array.isArray($e.actionSteps)?$e.actionSteps:[],suggestedTags:$e.suggestedTags,screenshotUrl:null,screenshotId:je===0?V.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...ge},we=await(await mt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(et)})).json();if(we.success&&we.ticket){let dt=we.ticket,Be=dt.actionSteps??(dt.description?dt.description.split(/\n\s*\n/):[]);re||(re={id:dt.id,title:dt.title,actionSteps:Be,type:dt.type??"Feedback"})}}if(re){let je=re.id;V.uploadPromise.then($e=>{$e&&mt(`/api/tickets/${je}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:$e})}).catch(()=>{})}).catch(()=>{}),V.callbacks.onSuccess(re)}else le("PIPELINE","error"),V.callbacks.onError()}catch(J){console.error("[Echly] Use suggestion failed:",J),le("PIPELINE","error"),V.callbacks.onError()}}},[q,_]);if(pe.default.useEffect(()=>{I&&T.current&&T.current.focus()},[I]),!i)return null;if(!n)return(0,Et.jsx)("div",{style:{pointerEvents:"auto"},children:(0,Et.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:DU,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,Et.jsx)("img",{src:M,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})});let vn=q;return(0,Et.jsxs)(Et.Fragment,{children:[v&&vn&&(0,Et.jsx)("div",{style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.15)",zIndex:999999,fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif'},children:(0,Et.jsxs)("div",{style:{maxWidth:420,width:"90%",background:"#F8FBFF",borderRadius:12,padding:20,boxShadow:"0 12px 32px rgba(0,0,0,0.12)",border:"1px solid #E6F0FF",animation:"echly-clarity-card-in 150ms ease-out"},children:[(0,Et.jsx)("div",{style:{fontWeight:600,fontSize:15,marginBottom:6,color:"#111"},children:"Quick suggestion"}),(0,Et.jsx)("div",{style:{fontSize:14,color:"#374151",marginBottom:8},children:"Your feedback may be unclear."}),(0,Et.jsx)("div",{style:{fontSize:13,color:"#6b7280",marginBottom:10},children:"Try specifying what looks wrong and what change you want."}),vn.suggestedRewrite&&(0,Et.jsxs)("div",{style:{fontSize:13,fontStyle:"italic",color:"#4b5563",marginBottom:12,opacity:.9},children:['Example: "',vn.suggestedRewrite,'"']}),(0,Et.jsx)("textarea",{ref:T,value:C,onChange:V=>x(V.target.value),disabled:!I,rows:3,placeholder:"Your feedback","aria-label":"Feedback message",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid #E6F0FF",fontSize:14,resize:"vertical",minHeight:72,marginBottom:16,background:I?"#fff":"#f3f4f6",color:"#111"}}),(0,Et.jsx)("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:I?(0,Et.jsx)("button",{type:"button",disabled:Se,onClick:()=>{if(de.current||!vn)return;de.current=!0,lt(!0),g(!1),z(null),b(!1),Zr(vn,C).catch(ee=>console.error("[Echly] Done submission failed:",ee)).finally(()=>{de.current=!1,lt(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:Se?"default":"pointer",opacity:Se?.8:1},children:"Done"}):(0,Et.jsxs)(Et.Fragment,{children:[(0,Et.jsx)("button",{type:"button",disabled:Se,onClick:()=>b(!0),style:{background:"transparent",border:"1px solid #E6F0FF",borderRadius:8,padding:"8px 14px",fontSize:14,color:"#374151",cursor:Se?"default":"pointer",opacity:Se?.7:1},children:"Edit feedback"}),(0,Et.jsx)("button",{type:"button",disabled:Se,onClick:()=>{if(de.current||!vn)return;de.current=!0,lt(!0),g(!1),z(null),b(!1),Sn(vn).catch(J=>console.error("[Echly] Submit anyway failed:",J)).finally(()=>{de.current=!1,lt(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:Se?"default":"pointer",opacity:Se?.8:1},children:"Submit anyway"})]})})]})}),(0,Et.jsx)(tm,{sessionId:_??"",userId:n.uid,extensionMode:!0,onComplete:ae,onDelete:at,onUpdate:Fe,widgetToggleRef:w,onRecordingChange:P,expanded:f.expanded,onExpandRequest:N,onCollapseRequest:W,captureDisabled:!1,theme:l,onThemeToggle:Q,fetchSessions:Qe,hasPreviousSessions:R,lastKnownSessionId:A,onResumeSessionSelect:Ln,pointers:f.pointers??[],onSessionEnd:()=>{},onCreateSession:Ge,onActiveSessionChange:Cn,globalSessionModeActive:f.sessionModeActive??!1,globalSessionPaused:f.sessionPaused??!1,onSessionModeStart:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{}),onSessionModePause:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_PAUSE"}).catch(()=>{}),onSessionModeResume:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_RESUME"}).catch(()=>{}),onSessionModeEnd:()=>{let V=f.sessionId;(async()=>{if(await new Promise((J,ee)=>{chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_END"},ve=>{chrome.runtime.lastError?ee(chrome.runtime.lastError):J()})}),await new Promise(J=>setTimeout(J,50)),V){let J=`${xU}/dashboard/${V}`;chrome.runtime.sendMessage({type:"ECHLY_OPEN_TAB",url:J}).catch(()=>{})}})().catch(()=>{})}},p)]})}var OU=`
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
  }
  #echly-root * { box-sizing: border-box; }
`;function MU(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let n=document.createElement("style");n.id="echly-reset",n.textContent=OU,t.appendChild(n)}function NU(t){let e=t.attachShadow({mode:"open"});MU(e);let n=document.createElement("div");n.id=AU,n.setAttribute("data-echly-ui","true"),n.style.all="initial",n.style.boxSizing="border-box",n.style.pointerEvents="auto",n.style.width="auto",n.style.height="auto";let a=RU();n.setAttribute("data-theme",a),e.appendChild(n),(0,Ck.createRoot)(n).render((0,Et.jsx)(PU,{widgetRoot:n,initialTheme:a}))}function am(t){return t?{visible:t.visible??!1,expanded:t.expanded??!1,isRecording:t.isRecording??!1,sessionId:t.sessionId??null,sessionModeActive:t.sessionModeActive??!1,sessionPaused:t.sessionPaused??!1,pointers:Array.isArray(t.pointers)?t.pointers:[]}:null}function Ak(t){le("CONTENT","dispatch event",{type:"ECHLY_GLOBAL_STATE"}),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:t}}))}function VU(t){chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},e=>{let n=am(e?.state);n&&(t.style.display=n.visible?"block":"none",Ak(n))})}function FU(){document.addEventListener("visibilitychange",()=>{document.hidden||chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},t=>{let e=am(t?.state);e&&(qi(e.visible),Ak(e))})})}function UU(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(n=>{if(n.type==="ECHLY_FEEDBACK_CREATED"&&n.ticket&&n.sessionId){le("CONTENT","dispatch event",{type:"ECHLY_FEEDBACK_CREATED"}),window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:n.ticket,sessionId:n.sessionId}}));return}if(document.getElementById(nm)){if(n.type==="ECHLY_GLOBAL_STATE"&&n.state){let r=n.state;qi(r.visible),window.__ECHLY_APPLY_GLOBAL_STATE__?.(r),le("CONTENT","dispatch event",{type:"ECHLY_GLOBAL_STATE"}),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:r}}))}n.type==="ECHLY_TOGGLE"&&(le("CONTENT","dispatch event",{type:"ECHLY_TOGGLE_WIDGET"}),window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET"))),n.type==="ECHLY_RESET_WIDGET"&&(le("CONTENT","dispatch event",{type:"ECHLY_RESET_WIDGET"}),window.dispatchEvent(new CustomEvent("ECHLY_RESET_WIDGET"))),n.type==="ECHLY_SESSION_STATE_SYNC"&&chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},r=>{if(r?.state){let s=am(r.state);s&&(qi(s.visible),window.__ECHLY_APPLY_GLOBAL_STATE__?.(s),window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:s}})))}})}}))}function BU(){let t=document.getElementById(nm);t||(t=document.createElement("div"),t.id=nm,t.setAttribute("data-echly-ui","true"),t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),NU(t)),UU(t),VU(t),FU()}BU();})();
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
