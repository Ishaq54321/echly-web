"use strict";(()=>{var zR=Object.create;var Sp=Object.defineProperty;var HR=Object.getOwnPropertyDescriptor;var GR=Object.getOwnPropertyNames;var jR=Object.getPrototypeOf,KR=Object.prototype.hasOwnProperty;var Iv=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,a)=>(typeof require<"u"?require:e)[a]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var WR=(t,e)=>()=>(t&&(e=t(t=0)),e);var Ce=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),QR=(t,e)=>{for(var a in e)Sp(t,a,{get:e[a],enumerable:!0})},XR=(t,e,a,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of GR(e))!KR.call(t,r)&&r!==a&&Sp(t,r,{get:()=>e[r],enumerable:!(n=HR(e,r))||n.enumerable});return t};var De=(t,e,a)=>(a=t!=null?zR(jR(t)):{},XR(e||!t||!t.__esModule?Sp(a,"default",{value:t,enumerable:!0}):a,t));var Rv=Ce(oe=>{"use strict";var wp=Symbol.for("react.transitional.element"),YR=Symbol.for("react.portal"),$R=Symbol.for("react.fragment"),JR=Symbol.for("react.strict_mode"),ZR=Symbol.for("react.profiler"),e1=Symbol.for("react.consumer"),t1=Symbol.for("react.context"),a1=Symbol.for("react.forward_ref"),n1=Symbol.for("react.suspense"),r1=Symbol.for("react.memo"),Ev=Symbol.for("react.lazy"),s1=Symbol.for("react.activity"),Sv=Symbol.iterator;function i1(t){return t===null||typeof t!="object"?null:(t=Sv&&t[Sv]||t["@@iterator"],typeof t=="function"?t:null)}var Cv={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},bv=Object.assign,Lv={};function ui(t,e,a){this.props=t,this.context=e,this.refs=Lv,this.updater=a||Cv}ui.prototype.isReactComponent={};ui.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};ui.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Av(){}Av.prototype=ui.prototype;function Ep(t,e,a){this.props=t,this.context=e,this.refs=Lv,this.updater=a||Cv}var Cp=Ep.prototype=new Av;Cp.constructor=Ep;bv(Cp,ui.prototype);Cp.isPureReactComponent=!0;var vv=Array.isArray;function Tp(){}var Ke={H:null,A:null,T:null,S:null},xv=Object.prototype.hasOwnProperty;function bp(t,e,a){var n=a.ref;return{$$typeof:wp,type:t,key:e,ref:n!==void 0?n:null,props:a}}function o1(t,e){return bp(t.type,e,t.props)}function Lp(t){return typeof t=="object"&&t!==null&&t.$$typeof===wp}function u1(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(a){return e[a]})}var Tv=/\/+/g;function vp(t,e){return typeof t=="object"&&t!==null&&t.key!=null?u1(""+t.key):e.toString(36)}function l1(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(Tp,Tp):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function oi(t,e,a,n,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case wp:case YR:i=!0;break;case Ev:return i=t._init,oi(i(t._payload),e,a,n,r)}}if(i)return r=r(t),i=n===""?"."+vp(t,0):n,vv(r)?(a="",i!=null&&(a=i.replace(Tv,"$&/")+"/"),oi(r,e,a,"",function(d){return d})):r!=null&&(Lp(r)&&(r=o1(r,a+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(Tv,"$&/")+"/")+i)),e.push(r)),1;i=0;var u=n===""?".":n+":";if(vv(t))for(var l=0;l<t.length;l++)n=t[l],s=u+vp(n,l),i+=oi(n,e,a,s,r);else if(l=i1(t),typeof l=="function")for(t=l.call(t),l=0;!(n=t.next()).done;)n=n.value,s=u+vp(n,l++),i+=oi(n,e,a,s,r);else if(s==="object"){if(typeof t.then=="function")return oi(l1(t),e,a,n,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function Vc(t,e,a){if(t==null)return t;var n=[],r=0;return oi(t,n,"","",function(s){return e.call(a,s,r++)}),n}function c1(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(a){(t._status===0||t._status===-1)&&(t._status=1,t._result=a)},function(a){(t._status===0||t._status===-1)&&(t._status=2,t._result=a)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var wv=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},d1={map:Vc,forEach:function(t,e,a){Vc(t,function(){e.apply(this,arguments)},a)},count:function(t){var e=0;return Vc(t,function(){e++}),e},toArray:function(t){return Vc(t,function(e){return e})||[]},only:function(t){if(!Lp(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};oe.Activity=s1;oe.Children=d1;oe.Component=ui;oe.Fragment=$R;oe.Profiler=ZR;oe.PureComponent=Ep;oe.StrictMode=JR;oe.Suspense=n1;oe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ke;oe.__COMPILER_RUNTIME={__proto__:null,c:function(t){return Ke.H.useMemoCache(t)}};oe.cache=function(t){return function(){return t.apply(null,arguments)}};oe.cacheSignal=function(){return null};oe.cloneElement=function(t,e,a){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var n=bv({},t.props),r=t.key;if(e!=null)for(s in e.key!==void 0&&(r=""+e.key),e)!xv.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(n[s]=e[s]);var s=arguments.length-2;if(s===1)n.children=a;else if(1<s){for(var i=Array(s),u=0;u<s;u++)i[u]=arguments[u+2];n.children=i}return bp(t.type,r,n)};oe.createContext=function(t){return t={$$typeof:t1,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:e1,_context:t},t};oe.createElement=function(t,e,a){var n,r={},s=null;if(e!=null)for(n in e.key!==void 0&&(s=""+e.key),e)xv.call(e,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(r[n]=e[n]);var i=arguments.length-2;if(i===1)r.children=a;else if(1<i){for(var u=Array(i),l=0;l<i;l++)u[l]=arguments[l+2];r.children=u}if(t&&t.defaultProps)for(n in i=t.defaultProps,i)r[n]===void 0&&(r[n]=i[n]);return bp(t,s,r)};oe.createRef=function(){return{current:null}};oe.forwardRef=function(t){return{$$typeof:a1,render:t}};oe.isValidElement=Lp;oe.lazy=function(t){return{$$typeof:Ev,_payload:{_status:-1,_result:t},_init:c1}};oe.memo=function(t,e){return{$$typeof:r1,type:t,compare:e===void 0?null:e}};oe.startTransition=function(t){var e=Ke.T,a={};Ke.T=a;try{var n=t(),r=Ke.S;r!==null&&r(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(Tp,wv)}catch(s){wv(s)}finally{e!==null&&a.types!==null&&(e.types=a.types),Ke.T=e}};oe.unstable_useCacheRefresh=function(){return Ke.H.useCacheRefresh()};oe.use=function(t){return Ke.H.use(t)};oe.useActionState=function(t,e,a){return Ke.H.useActionState(t,e,a)};oe.useCallback=function(t,e){return Ke.H.useCallback(t,e)};oe.useContext=function(t){return Ke.H.useContext(t)};oe.useDebugValue=function(){};oe.useDeferredValue=function(t,e){return Ke.H.useDeferredValue(t,e)};oe.useEffect=function(t,e){return Ke.H.useEffect(t,e)};oe.useEffectEvent=function(t){return Ke.H.useEffectEvent(t)};oe.useId=function(){return Ke.H.useId()};oe.useImperativeHandle=function(t,e,a){return Ke.H.useImperativeHandle(t,e,a)};oe.useInsertionEffect=function(t,e){return Ke.H.useInsertionEffect(t,e)};oe.useLayoutEffect=function(t,e){return Ke.H.useLayoutEffect(t,e)};oe.useMemo=function(t,e){return Ke.H.useMemo(t,e)};oe.useOptimistic=function(t,e){return Ke.H.useOptimistic(t,e)};oe.useReducer=function(t,e,a){return Ke.H.useReducer(t,e,a)};oe.useRef=function(t){return Ke.H.useRef(t)};oe.useState=function(t){return Ke.H.useState(t)};oe.useSyncExternalStore=function(t,e,a){return Ke.H.useSyncExternalStore(t,e,a)};oe.useTransition=function(){return Ke.H.useTransition()};oe.version="19.2.3"});var $a=Ce((qU,kv)=>{"use strict";kv.exports=Rv()});var qv=Ce(Je=>{"use strict";function kp(t,e){var a=t.length;t.push(e);e:for(;0<a;){var n=a-1>>>1,r=t[n];if(0<Uc(r,e))t[n]=e,t[a]=r,a=n;else break e}}function dn(t){return t.length===0?null:t[0]}function Bc(t){if(t.length===0)return null;var e=t[0],a=t.pop();if(a!==e){t[0]=a;e:for(var n=0,r=t.length,s=r>>>1;n<s;){var i=2*(n+1)-1,u=t[i],l=i+1,d=t[l];if(0>Uc(u,a))l<r&&0>Uc(d,u)?(t[n]=d,t[l]=a,n=l):(t[n]=u,t[i]=a,n=i);else if(l<r&&0>Uc(d,a))t[n]=d,t[l]=a,n=l;else break e}}return e}function Uc(t,e){var a=t.sortIndex-e.sortIndex;return a!==0?a:t.id-e.id}Je.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Dv=performance,Je.unstable_now=function(){return Dv.now()}):(Ap=Date,Pv=Ap.now(),Je.unstable_now=function(){return Ap.now()-Pv});var Dv,Ap,Pv,Nn=[],Rr=[],f1=1,Ma=null,Yt=3,Dp=!1,uu=!1,lu=!1,Pp=!1,Nv=typeof setTimeout=="function"?setTimeout:null,Vv=typeof clearTimeout=="function"?clearTimeout:null,Ov=typeof setImmediate<"u"?setImmediate:null;function Fc(t){for(var e=dn(Rr);e!==null;){if(e.callback===null)Bc(Rr);else if(e.startTime<=t)Bc(Rr),e.sortIndex=e.expirationTime,kp(Nn,e);else break;e=dn(Rr)}}function Op(t){if(lu=!1,Fc(t),!uu)if(dn(Nn)!==null)uu=!0,ci||(ci=!0,li());else{var e=dn(Rr);e!==null&&Mp(Op,e.startTime-t)}}var ci=!1,cu=-1,Uv=5,Fv=-1;function Bv(){return Pp?!0:!(Je.unstable_now()-Fv<Uv)}function xp(){if(Pp=!1,ci){var t=Je.unstable_now();Fv=t;var e=!0;try{e:{uu=!1,lu&&(lu=!1,Vv(cu),cu=-1),Dp=!0;var a=Yt;try{t:{for(Fc(t),Ma=dn(Nn);Ma!==null&&!(Ma.expirationTime>t&&Bv());){var n=Ma.callback;if(typeof n=="function"){Ma.callback=null,Yt=Ma.priorityLevel;var r=n(Ma.expirationTime<=t);if(t=Je.unstable_now(),typeof r=="function"){Ma.callback=r,Fc(t),e=!0;break t}Ma===dn(Nn)&&Bc(Nn),Fc(t)}else Bc(Nn);Ma=dn(Nn)}if(Ma!==null)e=!0;else{var s=dn(Rr);s!==null&&Mp(Op,s.startTime-t),e=!1}}break e}finally{Ma=null,Yt=a,Dp=!1}e=void 0}}finally{e?li():ci=!1}}}var li;typeof Ov=="function"?li=function(){Ov(xp)}:typeof MessageChannel<"u"?(Rp=new MessageChannel,Mv=Rp.port2,Rp.port1.onmessage=xp,li=function(){Mv.postMessage(null)}):li=function(){Nv(xp,0)};var Rp,Mv;function Mp(t,e){cu=Nv(function(){t(Je.unstable_now())},e)}Je.unstable_IdlePriority=5;Je.unstable_ImmediatePriority=1;Je.unstable_LowPriority=4;Je.unstable_NormalPriority=3;Je.unstable_Profiling=null;Je.unstable_UserBlockingPriority=2;Je.unstable_cancelCallback=function(t){t.callback=null};Je.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Uv=0<t?Math.floor(1e3/t):5};Je.unstable_getCurrentPriorityLevel=function(){return Yt};Je.unstable_next=function(t){switch(Yt){case 1:case 2:case 3:var e=3;break;default:e=Yt}var a=Yt;Yt=e;try{return t()}finally{Yt=a}};Je.unstable_requestPaint=function(){Pp=!0};Je.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var a=Yt;Yt=t;try{return e()}finally{Yt=a}};Je.unstable_scheduleCallback=function(t,e,a){var n=Je.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,t={id:f1++,callback:e,priorityLevel:t,startTime:a,expirationTime:r,sortIndex:-1},a>n?(t.sortIndex=a,kp(Rr,t),dn(Nn)===null&&t===dn(Rr)&&(lu?(Vv(cu),cu=-1):lu=!0,Mp(Op,a-n))):(t.sortIndex=r,kp(Nn,t),uu||Dp||(uu=!0,ci||(ci=!0,li()))),t};Je.unstable_shouldYield=Bv;Je.unstable_wrapCallback=function(t){var e=Yt;return function(){var a=Yt;Yt=e;try{return t.apply(this,arguments)}finally{Yt=a}}}});var Hv=Ce((HU,zv)=>{"use strict";zv.exports=qv()});var jv=Ce(ta=>{"use strict";var h1=$a();function Gv(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)e+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function kr(){}var ea={d:{f:kr,r:function(){throw Error(Gv(522))},D:kr,C:kr,L:kr,m:kr,X:kr,S:kr,M:kr},p:0,findDOMNode:null},p1=Symbol.for("react.portal");function m1(t,e,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:p1,key:n==null?null:""+n,children:t,containerInfo:e,implementation:a}}var du=h1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function qc(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}ta.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ea;ta.createPortal=function(t,e){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(Gv(299));return m1(t,e,null,a)};ta.flushSync=function(t){var e=du.T,a=ea.p;try{if(du.T=null,ea.p=2,t)return t()}finally{du.T=e,ea.p=a,ea.d.f()}};ta.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,ea.d.C(t,e))};ta.prefetchDNS=function(t){typeof t=="string"&&ea.d.D(t)};ta.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var a=e.as,n=qc(a,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,s=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;a==="style"?ea.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:n,integrity:r,fetchPriority:s}):a==="script"&&ea.d.X(t,{crossOrigin:n,integrity:r,fetchPriority:s,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};ta.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var a=qc(e.as,e.crossOrigin);ea.d.M(t,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&ea.d.M(t)};ta.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var a=e.as,n=qc(a,e.crossOrigin);ea.d.L(t,a,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};ta.preloadModule=function(t,e){if(typeof t=="string")if(e){var a=qc(e.as,e.crossOrigin);ea.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else ea.d.m(t)};ta.requestFormReset=function(t){ea.d.r(t)};ta.unstable_batchedUpdates=function(t,e){return t(e)};ta.useFormState=function(t,e,a){return du.H.useFormState(t,e,a)};ta.useFormStatus=function(){return du.H.useHostTransitionStatus()};ta.version="19.2.3"});var Np=Ce((jU,Wv)=>{"use strict";function Kv(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Kv)}catch(t){console.error(t)}}Kv(),Wv.exports=jv()});var sb=Ce(hf=>{"use strict";var xt=Hv(),Iw=$a(),g1=Np();function N(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)e+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Sw(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function $u(t){var e=t,a=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(a=e.return),t=e.return;while(t)}return e.tag===3?a:null}function vw(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Tw(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Qv(t){if($u(t)!==t)throw Error(N(188))}function y1(t){var e=t.alternate;if(!e){if(e=$u(t),e===null)throw Error(N(188));return e!==t?null:t}for(var a=t,n=e;;){var r=a.return;if(r===null)break;var s=r.alternate;if(s===null){if(n=r.return,n!==null){a=n;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===a)return Qv(r),t;if(s===n)return Qv(r),e;s=s.sibling}throw Error(N(188))}if(a.return!==n.return)a=r,n=s;else{for(var i=!1,u=r.child;u;){if(u===a){i=!0,a=r,n=s;break}if(u===n){i=!0,n=r,a=s;break}u=u.sibling}if(!i){for(u=s.child;u;){if(u===a){i=!0,a=s,n=r;break}if(u===n){i=!0,n=s,a=r;break}u=u.sibling}if(!i)throw Error(N(189))}}if(a.alternate!==n)throw Error(N(190))}if(a.tag!==3)throw Error(N(188));return a.stateNode.current===a?t:e}function ww(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=ww(t),e!==null)return e;t=t.sibling}return null}var Xe=Object.assign,_1=Symbol.for("react.element"),zc=Symbol.for("react.transitional.element"),Iu=Symbol.for("react.portal"),gi=Symbol.for("react.fragment"),Ew=Symbol.for("react.strict_mode"),gm=Symbol.for("react.profiler"),Cw=Symbol.for("react.consumer"),Gn=Symbol.for("react.context"),dg=Symbol.for("react.forward_ref"),ym=Symbol.for("react.suspense"),_m=Symbol.for("react.suspense_list"),fg=Symbol.for("react.memo"),Dr=Symbol.for("react.lazy");Symbol.for("react.scope");var Im=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var I1=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var Xv=Symbol.iterator;function fu(t){return t===null||typeof t!="object"?null:(t=Xv&&t[Xv]||t["@@iterator"],typeof t=="function"?t:null)}var S1=Symbol.for("react.client.reference");function Sm(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===S1?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case gi:return"Fragment";case gm:return"Profiler";case Ew:return"StrictMode";case ym:return"Suspense";case _m:return"SuspenseList";case Im:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case Iu:return"Portal";case Gn:return t.displayName||"Context";case Cw:return(t._context.displayName||"Context")+".Consumer";case dg:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case fg:return e=t.displayName||null,e!==null?e:Sm(t.type)||"Memo";case Dr:e=t._payload,t=t._init;try{return Sm(t(e))}catch{}}return null}var Su=Array.isArray,re=Iw.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Le=g1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ws={pending:!1,data:null,method:null,action:null},vm=[],yi=-1;function gn(t){return{current:t}}function Nt(t){0>yi||(t.current=vm[yi],vm[yi]=null,yi--)}function Ge(t,e){yi++,vm[yi]=t.current,t.current=e}var mn=gn(null),Vu=gn(null),Hr=gn(null),vd=gn(null);function Td(t,e){switch(Ge(Hr,e),Ge(Vu,t),Ge(mn,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?aw(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=aw(e),t=jC(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Nt(mn),Ge(mn,t)}function Mi(){Nt(mn),Nt(Vu),Nt(Hr)}function Tm(t){t.memoizedState!==null&&Ge(vd,t);var e=mn.current,a=jC(e,t.type);e!==a&&(Ge(Vu,t),Ge(mn,a))}function wd(t){Vu.current===t&&(Nt(mn),Nt(Vu)),vd.current===t&&(Nt(vd),Qu._currentValue=ws)}var Vp,Yv;function Is(t){if(Vp===void 0)try{throw Error()}catch(a){var e=a.stack.trim().match(/\n( *(at )?)/);Vp=e&&e[1]||"",Yv=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Vp+t+Yv}var Up=!1;function Fp(t,e){if(!t||Up)return"";Up=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(e){var m=function(){throw Error()};if(Object.defineProperty(m.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(m,[])}catch(I){var p=I}Reflect.construct(t,[],m)}else{try{m.call()}catch(I){p=I}t.call(m.prototype)}}else{try{throw Error()}catch(I){p=I}(m=t())&&typeof m.catch=="function"&&m.catch(function(){})}}catch(I){if(I&&p&&typeof I.stack=="string")return[I.stack,p.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=n.DetermineComponentFrameRoot(),i=s[0],u=s[1];if(i&&u){var l=i.split(`
`),d=u.split(`
`);for(r=n=0;n<l.length&&!l[n].includes("DetermineComponentFrameRoot");)n++;for(;r<d.length&&!d[r].includes("DetermineComponentFrameRoot");)r++;if(n===l.length||r===d.length)for(n=l.length-1,r=d.length-1;1<=n&&0<=r&&l[n]!==d[r];)r--;for(;1<=n&&0<=r;n--,r--)if(l[n]!==d[r]){if(n!==1||r!==1)do if(n--,r--,0>r||l[n]!==d[r]){var h=`
`+l[n].replace(" at new "," at ");return t.displayName&&h.includes("<anonymous>")&&(h=h.replace("<anonymous>",t.displayName)),h}while(1<=n&&0<=r);break}}}finally{Up=!1,Error.prepareStackTrace=a}return(a=t?t.displayName||t.name:"")?Is(a):""}function v1(t,e){switch(t.tag){case 26:case 27:case 5:return Is(t.type);case 16:return Is("Lazy");case 13:return t.child!==e&&e!==null?Is("Suspense Fallback"):Is("Suspense");case 19:return Is("SuspenseList");case 0:case 15:return Fp(t.type,!1);case 11:return Fp(t.type.render,!1);case 1:return Fp(t.type,!0);case 31:return Is("Activity");default:return""}}function $v(t){try{var e="",a=null;do e+=v1(t,a),a=t,t=t.return;while(t);return e}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var wm=Object.prototype.hasOwnProperty,hg=xt.unstable_scheduleCallback,Bp=xt.unstable_cancelCallback,T1=xt.unstable_shouldYield,w1=xt.unstable_requestPaint,Ca=xt.unstable_now,E1=xt.unstable_getCurrentPriorityLevel,bw=xt.unstable_ImmediatePriority,Lw=xt.unstable_UserBlockingPriority,Ed=xt.unstable_NormalPriority,C1=xt.unstable_LowPriority,Aw=xt.unstable_IdlePriority,b1=xt.log,L1=xt.unstable_setDisableYieldValue,Ju=null,ba=null;function Ur(t){if(typeof b1=="function"&&L1(t),ba&&typeof ba.setStrictMode=="function")try{ba.setStrictMode(Ju,t)}catch{}}var La=Math.clz32?Math.clz32:R1,A1=Math.log,x1=Math.LN2;function R1(t){return t>>>=0,t===0?32:31-(A1(t)/x1|0)|0}var Hc=256,Gc=262144,jc=4194304;function Ss(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Yd(t,e,a){var n=t.pendingLanes;if(n===0)return 0;var r=0,s=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var u=n&134217727;return u!==0?(n=u&~s,n!==0?r=Ss(n):(i&=u,i!==0?r=Ss(i):a||(a=u&~t,a!==0&&(r=Ss(a))))):(u=n&~s,u!==0?r=Ss(u):i!==0?r=Ss(i):a||(a=n&~t,a!==0&&(r=Ss(a)))),r===0?0:e!==0&&e!==r&&!(e&s)&&(s=r&-r,a=e&-e,s>=a||s===32&&(a&4194048)!==0)?e:r}function Zu(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function k1(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function xw(){var t=jc;return jc<<=1,!(jc&62914560)&&(jc=4194304),t}function qp(t){for(var e=[],a=0;31>a;a++)e.push(t);return e}function el(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function D1(t,e,a,n,r,s){var i=t.pendingLanes;t.pendingLanes=a,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=a,t.entangledLanes&=a,t.errorRecoveryDisabledLanes&=a,t.shellSuspendCounter=0;var u=t.entanglements,l=t.expirationTimes,d=t.hiddenUpdates;for(a=i&~a;0<a;){var h=31-La(a),m=1<<h;u[h]=0,l[h]=-1;var p=d[h];if(p!==null)for(d[h]=null,h=0;h<p.length;h++){var I=p[h];I!==null&&(I.lane&=-536870913)}a&=~m}n!==0&&Rw(t,n,0),s!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=s&~(i&~e))}function Rw(t,e,a){t.pendingLanes|=e,t.suspendedLanes&=~e;var n=31-La(e);t.entangledLanes|=e,t.entanglements[n]=t.entanglements[n]|1073741824|a&261930}function kw(t,e){var a=t.entangledLanes|=e;for(t=t.entanglements;a;){var n=31-La(a),r=1<<n;r&e|t[n]&e&&(t[n]|=e),a&=~r}}function Dw(t,e){var a=e&-e;return a=a&42?1:pg(a),a&(t.suspendedLanes|e)?0:a}function pg(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function mg(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function Pw(){var t=Le.p;return t!==0?t:(t=window.event,t===void 0?32:ab(t.type))}function Jv(t,e){var a=Le.p;try{return Le.p=t,e()}finally{Le.p=a}}var as=Math.random().toString(36).slice(2),Ht="__reactFiber$"+as,ca="__reactProps$"+as,Ki="__reactContainer$"+as,Em="__reactEvents$"+as,P1="__reactListeners$"+as,O1="__reactHandles$"+as,Zv="__reactResources$"+as,tl="__reactMarker$"+as;function gg(t){delete t[Ht],delete t[ca],delete t[Em],delete t[P1],delete t[O1]}function _i(t){var e=t[Ht];if(e)return e;for(var a=t.parentNode;a;){if(e=a[Ki]||a[Ht]){if(a=e.alternate,e.child!==null||a!==null&&a.child!==null)for(t=ow(t);t!==null;){if(a=t[Ht])return a;t=ow(t)}return e}t=a,a=t.parentNode}return null}function Wi(t){if(t=t[Ht]||t[Ki]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function vu(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(N(33))}function Ai(t){var e=t[Zv];return e||(e=t[Zv]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Mt(t){t[tl]=!0}var Ow=new Set,Mw={};function Ps(t,e){Ni(t,e),Ni(t+"Capture",e)}function Ni(t,e){for(Mw[t]=e,t=0;t<e.length;t++)Ow.add(e[t])}var M1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),eT={},tT={};function N1(t){return wm.call(tT,t)?!0:wm.call(eT,t)?!1:M1.test(t)?tT[t]=!0:(eT[t]=!0,!1)}function id(t,e,a){if(N1(e))if(a===null)t.removeAttribute(e);else{switch(typeof a){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var n=e.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+a)}}function Kc(t,e,a){if(a===null)t.removeAttribute(e);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+a)}}function Vn(t,e,a,n){if(n===null)t.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(a);return}t.setAttributeNS(e,a,""+n)}}function Va(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Nw(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function V1(t,e,a){var n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(i){a=""+i,s.call(this,i)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(i){a=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Cm(t){if(!t._valueTracker){var e=Nw(t)?"checked":"value";t._valueTracker=V1(t,e,""+t[e])}}function Vw(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var a=e.getValue(),n="";return t&&(n=Nw(t)?t.checked?"true":"false":t.value),t=n,t!==a?(e.setValue(t),!0):!1}function Cd(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var U1=/[\n"\\]/g;function Ba(t){return t.replace(U1,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function bm(t,e,a,n,r,s,i,u){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+Va(e)):t.value!==""+Va(e)&&(t.value=""+Va(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?Lm(t,i,Va(e)):a!=null?Lm(t,i,Va(a)):n!=null&&t.removeAttribute("value"),r==null&&s!=null&&(t.defaultChecked=!!s),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.name=""+Va(u):t.removeAttribute("name")}function Uw(t,e,a,n,r,s,i,u){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.type=s),e!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||e!=null)){Cm(t);return}a=a!=null?""+Va(a):"",e=e!=null?""+Va(e):a,u||e===t.value||(t.value=e),t.defaultValue=e}n=n??r,n=typeof n!="function"&&typeof n!="symbol"&&!!n,t.checked=u?t.checked:!!n,t.defaultChecked=!!n,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),Cm(t)}function Lm(t,e,a){e==="number"&&Cd(t.ownerDocument)===t||t.defaultValue===""+a||(t.defaultValue=""+a)}function xi(t,e,a,n){if(t=t.options,e){e={};for(var r=0;r<a.length;r++)e["$"+a[r]]=!0;for(a=0;a<t.length;a++)r=e.hasOwnProperty("$"+t[a].value),t[a].selected!==r&&(t[a].selected=r),r&&n&&(t[a].defaultSelected=!0)}else{for(a=""+Va(a),e=null,r=0;r<t.length;r++){if(t[r].value===a){t[r].selected=!0,n&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function Fw(t,e,a){if(e!=null&&(e=""+Va(e),e!==t.value&&(t.value=e),a==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=a!=null?""+Va(a):""}function Bw(t,e,a,n){if(e==null){if(n!=null){if(a!=null)throw Error(N(92));if(Su(n)){if(1<n.length)throw Error(N(93));n=n[0]}a=n}a==null&&(a=""),e=a}a=Va(e),t.defaultValue=a,n=t.textContent,n===a&&n!==""&&n!==null&&(t.value=n),Cm(t)}function Vi(t,e){if(e){var a=t.firstChild;if(a&&a===t.lastChild&&a.nodeType===3){a.nodeValue=e;return}}t.textContent=e}var F1=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function aT(t,e,a){var n=e.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":n?t.setProperty(e,a):typeof a!="number"||a===0||F1.has(e)?e==="float"?t.cssFloat=a:t[e]=(""+a).trim():t[e]=a+"px"}function qw(t,e,a){if(e!=null&&typeof e!="object")throw Error(N(62));if(t=t.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||e!=null&&e.hasOwnProperty(n)||(n.indexOf("--")===0?t.setProperty(n,""):n==="float"?t.cssFloat="":t[n]="");for(var r in e)n=e[r],e.hasOwnProperty(r)&&a[r]!==n&&aT(t,r,n)}else for(var s in e)e.hasOwnProperty(s)&&aT(t,s,e[s])}function yg(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var B1=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),q1=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function od(t){return q1.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function jn(){}var Am=null;function _g(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Ii=null,Ri=null;function nT(t){var e=Wi(t);if(e&&(t=e.stateNode)){var a=t[ca]||null;e:switch(t=e.stateNode,e.type){case"input":if(bm(t,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),e=a.name,a.type==="radio"&&e!=null){for(a=t;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Ba(""+e)+'"][type="radio"]'),e=0;e<a.length;e++){var n=a[e];if(n!==t&&n.form===t.form){var r=n[ca]||null;if(!r)throw Error(N(90));bm(n,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<a.length;e++)n=a[e],n.form===t.form&&Vw(n)}break e;case"textarea":Fw(t,a.value,a.defaultValue);break e;case"select":e=a.value,e!=null&&xi(t,!!a.multiple,e,!1)}}}var zp=!1;function zw(t,e,a){if(zp)return t(e,a);zp=!0;try{var n=t(e);return n}finally{if(zp=!1,(Ii!==null||Ri!==null)&&(lf(),Ii&&(e=Ii,t=Ri,Ri=Ii=null,nT(e),t)))for(e=0;e<t.length;e++)nT(t[e])}}function Uu(t,e){var a=t.stateNode;if(a===null)return null;var n=a[ca]||null;if(n===null)return null;a=n[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(t=t.type,n=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!n;break e;default:t=!1}if(t)return null;if(a&&typeof a!="function")throw Error(N(231,e,typeof a));return a}var Yn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),xm=!1;if(Yn)try{di={},Object.defineProperty(di,"passive",{get:function(){xm=!0}}),window.addEventListener("test",di,di),window.removeEventListener("test",di,di)}catch{xm=!1}var di,Fr=null,Ig=null,ud=null;function Hw(){if(ud)return ud;var t,e=Ig,a=e.length,n,r="value"in Fr?Fr.value:Fr.textContent,s=r.length;for(t=0;t<a&&e[t]===r[t];t++);var i=a-t;for(n=1;n<=i&&e[a-n]===r[s-n];n++);return ud=r.slice(t,1<n?1-n:void 0)}function ld(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Wc(){return!0}function rT(){return!1}function da(t){function e(a,n,r,s,i){this._reactName=a,this._targetInst=r,this.type=n,this.nativeEvent=s,this.target=i,this.currentTarget=null;for(var u in t)t.hasOwnProperty(u)&&(a=t[u],this[u]=a?a(s):s[u]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Wc:rT,this.isPropagationStopped=rT,this}return Xe(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Wc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Wc)},persist:function(){},isPersistent:Wc}),e}var Os={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},$d=da(Os),al=Xe({},Os,{view:0,detail:0}),z1=da(al),Hp,Gp,hu,Jd=Xe({},al,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Sg,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==hu&&(hu&&t.type==="mousemove"?(Hp=t.screenX-hu.screenX,Gp=t.screenY-hu.screenY):Gp=Hp=0,hu=t),Hp)},movementY:function(t){return"movementY"in t?t.movementY:Gp}}),sT=da(Jd),H1=Xe({},Jd,{dataTransfer:0}),G1=da(H1),j1=Xe({},al,{relatedTarget:0}),jp=da(j1),K1=Xe({},Os,{animationName:0,elapsedTime:0,pseudoElement:0}),W1=da(K1),Q1=Xe({},Os,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),X1=da(Q1),Y1=Xe({},Os,{data:0}),iT=da(Y1),$1={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},J1={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Z1={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function ek(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Z1[t])?!!e[t]:!1}function Sg(){return ek}var tk=Xe({},al,{key:function(t){if(t.key){var e=$1[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=ld(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?J1[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Sg,charCode:function(t){return t.type==="keypress"?ld(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?ld(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),ak=da(tk),nk=Xe({},Jd,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),oT=da(nk),rk=Xe({},al,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Sg}),sk=da(rk),ik=Xe({},Os,{propertyName:0,elapsedTime:0,pseudoElement:0}),ok=da(ik),uk=Xe({},Jd,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),lk=da(uk),ck=Xe({},Os,{newState:0,oldState:0}),dk=da(ck),fk=[9,13,27,32],vg=Yn&&"CompositionEvent"in window,Eu=null;Yn&&"documentMode"in document&&(Eu=document.documentMode);var hk=Yn&&"TextEvent"in window&&!Eu,Gw=Yn&&(!vg||Eu&&8<Eu&&11>=Eu),uT=" ",lT=!1;function jw(t,e){switch(t){case"keyup":return fk.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Kw(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Si=!1;function pk(t,e){switch(t){case"compositionend":return Kw(e);case"keypress":return e.which!==32?null:(lT=!0,uT);case"textInput":return t=e.data,t===uT&&lT?null:t;default:return null}}function mk(t,e){if(Si)return t==="compositionend"||!vg&&jw(t,e)?(t=Hw(),ud=Ig=Fr=null,Si=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Gw&&e.locale!=="ko"?null:e.data;default:return null}}var gk={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function cT(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!gk[t.type]:e==="textarea"}function Ww(t,e,a,n){Ii?Ri?Ri.push(n):Ri=[n]:Ii=n,e=Hd(e,"onChange"),0<e.length&&(a=new $d("onChange","change",null,a,n),t.push({event:a,listeners:e}))}var Cu=null,Fu=null;function yk(t){zC(t,0)}function Zd(t){var e=vu(t);if(Vw(e))return t}function dT(t,e){if(t==="change")return e}var Qw=!1;Yn&&(Yn?(Xc="oninput"in document,Xc||(Kp=document.createElement("div"),Kp.setAttribute("oninput","return;"),Xc=typeof Kp.oninput=="function"),Qc=Xc):Qc=!1,Qw=Qc&&(!document.documentMode||9<document.documentMode));var Qc,Xc,Kp;function fT(){Cu&&(Cu.detachEvent("onpropertychange",Xw),Fu=Cu=null)}function Xw(t){if(t.propertyName==="value"&&Zd(Fu)){var e=[];Ww(e,Fu,t,_g(t)),zw(yk,e)}}function _k(t,e,a){t==="focusin"?(fT(),Cu=e,Fu=a,Cu.attachEvent("onpropertychange",Xw)):t==="focusout"&&fT()}function Ik(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Zd(Fu)}function Sk(t,e){if(t==="click")return Zd(e)}function vk(t,e){if(t==="input"||t==="change")return Zd(e)}function Tk(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var xa=typeof Object.is=="function"?Object.is:Tk;function Bu(t,e){if(xa(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var a=Object.keys(t),n=Object.keys(e);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var r=a[n];if(!wm.call(e,r)||!xa(t[r],e[r]))return!1}return!0}function hT(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function pT(t,e){var a=hT(t);t=0;for(var n;a;){if(a.nodeType===3){if(n=t+a.textContent.length,t<=e&&n>=e)return{node:a,offset:e-t};t=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=hT(a)}}function Yw(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Yw(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function $w(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=Cd(t.document);e instanceof t.HTMLIFrameElement;){try{var a=typeof e.contentWindow.location.href=="string"}catch{a=!1}if(a)t=e.contentWindow;else break;e=Cd(t.document)}return e}function Tg(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var wk=Yn&&"documentMode"in document&&11>=document.documentMode,vi=null,Rm=null,bu=null,km=!1;function mT(t,e,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;km||vi==null||vi!==Cd(n)||(n=vi,"selectionStart"in n&&Tg(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),bu&&Bu(bu,n)||(bu=n,n=Hd(Rm,"onSelect"),0<n.length&&(e=new $d("onSelect","select",null,e,a),t.push({event:e,listeners:n}),e.target=vi)))}function _s(t,e){var a={};return a[t.toLowerCase()]=e.toLowerCase(),a["Webkit"+t]="webkit"+e,a["Moz"+t]="moz"+e,a}var Ti={animationend:_s("Animation","AnimationEnd"),animationiteration:_s("Animation","AnimationIteration"),animationstart:_s("Animation","AnimationStart"),transitionrun:_s("Transition","TransitionRun"),transitionstart:_s("Transition","TransitionStart"),transitioncancel:_s("Transition","TransitionCancel"),transitionend:_s("Transition","TransitionEnd")},Wp={},Jw={};Yn&&(Jw=document.createElement("div").style,"AnimationEvent"in window||(delete Ti.animationend.animation,delete Ti.animationiteration.animation,delete Ti.animationstart.animation),"TransitionEvent"in window||delete Ti.transitionend.transition);function Ms(t){if(Wp[t])return Wp[t];if(!Ti[t])return t;var e=Ti[t],a;for(a in e)if(e.hasOwnProperty(a)&&a in Jw)return Wp[t]=e[a];return t}var Zw=Ms("animationend"),eE=Ms("animationiteration"),tE=Ms("animationstart"),Ek=Ms("transitionrun"),Ck=Ms("transitionstart"),bk=Ms("transitioncancel"),aE=Ms("transitionend"),nE=new Map,Dm="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Dm.push("scrollEnd");function en(t,e){nE.set(t,e),Ps(e,[t])}var bd=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},Na=[],wi=0,wg=0;function ef(){for(var t=wi,e=wg=wi=0;e<t;){var a=Na[e];Na[e++]=null;var n=Na[e];Na[e++]=null;var r=Na[e];Na[e++]=null;var s=Na[e];if(Na[e++]=null,n!==null&&r!==null){var i=n.pending;i===null?r.next=r:(r.next=i.next,i.next=r),n.pending=r}s!==0&&rE(a,r,s)}}function tf(t,e,a,n){Na[wi++]=t,Na[wi++]=e,Na[wi++]=a,Na[wi++]=n,wg|=n,t.lanes|=n,t=t.alternate,t!==null&&(t.lanes|=n)}function Eg(t,e,a,n){return tf(t,e,a,n),Ld(t)}function Ns(t,e){return tf(t,null,null,e),Ld(t)}function rE(t,e,a){t.lanes|=a;var n=t.alternate;n!==null&&(n.lanes|=a);for(var r=!1,s=t.return;s!==null;)s.childLanes|=a,n=s.alternate,n!==null&&(n.childLanes|=a),s.tag===22&&(t=s.stateNode,t===null||t._visibility&1||(r=!0)),t=s,s=s.return;return t.tag===3?(s=t.stateNode,r&&e!==null&&(r=31-La(a),t=s.hiddenUpdates,n=t[r],n===null?t[r]=[e]:n.push(e),e.lane=a|536870912),s):null}function Ld(t){if(50<Mu)throw Mu=0,Zm=null,Error(N(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var Ei={};function Lk(t,e,a,n){this.tag=t,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function wa(t,e,a,n){return new Lk(t,e,a,n)}function Cg(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Wn(t,e){var a=t.alternate;return a===null?(a=wa(t.tag,e,t.key,t.mode),a.elementType=t.elementType,a.type=t.type,a.stateNode=t.stateNode,a.alternate=t,t.alternate=a):(a.pendingProps=e,a.type=t.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=t.flags&65011712,a.childLanes=t.childLanes,a.lanes=t.lanes,a.child=t.child,a.memoizedProps=t.memoizedProps,a.memoizedState=t.memoizedState,a.updateQueue=t.updateQueue,e=t.dependencies,a.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},a.sibling=t.sibling,a.index=t.index,a.ref=t.ref,a.refCleanup=t.refCleanup,a}function sE(t,e){t.flags&=65011714;var a=t.alternate;return a===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=a.childLanes,t.lanes=a.lanes,t.child=a.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=a.memoizedProps,t.memoizedState=a.memoizedState,t.updateQueue=a.updateQueue,t.type=a.type,e=a.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function cd(t,e,a,n,r,s){var i=0;if(n=t,typeof t=="function")Cg(t)&&(i=1);else if(typeof t=="string")i=RD(t,a,mn.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case Im:return t=wa(31,a,e,r),t.elementType=Im,t.lanes=s,t;case gi:return Es(a.children,r,s,e);case Ew:i=8,r|=24;break;case gm:return t=wa(12,a,e,r|2),t.elementType=gm,t.lanes=s,t;case ym:return t=wa(13,a,e,r),t.elementType=ym,t.lanes=s,t;case _m:return t=wa(19,a,e,r),t.elementType=_m,t.lanes=s,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Gn:i=10;break e;case Cw:i=9;break e;case dg:i=11;break e;case fg:i=14;break e;case Dr:i=16,n=null;break e}i=29,a=Error(N(130,t===null?"null":typeof t,"")),n=null}return e=wa(i,a,e,r),e.elementType=t,e.type=n,e.lanes=s,e}function Es(t,e,a,n){return t=wa(7,t,n,e),t.lanes=a,t}function Qp(t,e,a){return t=wa(6,t,null,e),t.lanes=a,t}function iE(t){var e=wa(18,null,null,0);return e.stateNode=t,e}function Xp(t,e,a){return e=wa(4,t.children!==null?t.children:[],t.key,e),e.lanes=a,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var gT=new WeakMap;function qa(t,e){if(typeof t=="object"&&t!==null){var a=gT.get(t);return a!==void 0?a:(e={value:t,source:e,stack:$v(e)},gT.set(t,e),e)}return{value:t,source:e,stack:$v(e)}}var Ci=[],bi=0,Ad=null,qu=0,Ua=[],Fa=0,Jr=null,fn=1,hn="";function zn(t,e){Ci[bi++]=qu,Ci[bi++]=Ad,Ad=t,qu=e}function oE(t,e,a){Ua[Fa++]=fn,Ua[Fa++]=hn,Ua[Fa++]=Jr,Jr=t;var n=fn;t=hn;var r=32-La(n)-1;n&=~(1<<r),a+=1;var s=32-La(e)+r;if(30<s){var i=r-r%5;s=(n&(1<<i)-1).toString(32),n>>=i,r-=i,fn=1<<32-La(e)+r|a<<r|n,hn=s+t}else fn=1<<s|a<<r|n,hn=t}function bg(t){t.return!==null&&(zn(t,1),oE(t,1,0))}function Lg(t){for(;t===Ad;)Ad=Ci[--bi],Ci[bi]=null,qu=Ci[--bi],Ci[bi]=null;for(;t===Jr;)Jr=Ua[--Fa],Ua[Fa]=null,hn=Ua[--Fa],Ua[Fa]=null,fn=Ua[--Fa],Ua[Fa]=null}function uE(t,e){Ua[Fa++]=fn,Ua[Fa++]=hn,Ua[Fa++]=Jr,fn=e.id,hn=e.overflow,Jr=t}var Gt=null,Qe=null,ge=!1,Gr=null,za=!1,Pm=Error(N(519));function Zr(t){var e=Error(N(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw zu(qa(e,t)),Pm}function yT(t){var e=t.stateNode,a=t.type,n=t.memoizedProps;switch(e[Ht]=t,e[ca]=n,a){case"dialog":fe("cancel",e),fe("close",e);break;case"iframe":case"object":case"embed":fe("load",e);break;case"video":case"audio":for(a=0;a<Ku.length;a++)fe(Ku[a],e);break;case"source":fe("error",e);break;case"img":case"image":case"link":fe("error",e),fe("load",e);break;case"details":fe("toggle",e);break;case"input":fe("invalid",e),Uw(e,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":fe("invalid",e);break;case"textarea":fe("invalid",e),Bw(e,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||e.textContent===""+a||n.suppressHydrationWarning===!0||GC(e.textContent,a)?(n.popover!=null&&(fe("beforetoggle",e),fe("toggle",e)),n.onScroll!=null&&fe("scroll",e),n.onScrollEnd!=null&&fe("scrollend",e),n.onClick!=null&&(e.onclick=jn),e=!0):e=!1,e||Zr(t,!0)}function _T(t){for(Gt=t.return;Gt;)switch(Gt.tag){case 5:case 31:case 13:za=!1;return;case 27:case 3:za=!0;return;default:Gt=Gt.return}}function fi(t){if(t!==Gt)return!1;if(!ge)return _T(t),ge=!0,!1;var e=t.tag,a;if((a=e!==3&&e!==27)&&((a=e===5)&&(a=t.type,a=!(a!=="form"&&a!=="button")||rg(t.type,t.memoizedProps)),a=!a),a&&Qe&&Zr(t),_T(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(N(317));Qe=iw(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(N(317));Qe=iw(t)}else e===27?(e=Qe,ns(t.type)?(t=ug,ug=null,Qe=t):Qe=e):Qe=Gt?Ga(t.stateNode.nextSibling):null;return!0}function As(){Qe=Gt=null,ge=!1}function Yp(){var t=Gr;return t!==null&&(ua===null?ua=t:ua.push.apply(ua,t),Gr=null),t}function zu(t){Gr===null?Gr=[t]:Gr.push(t)}var Om=gn(null),Vs=null,Kn=null;function Or(t,e,a){Ge(Om,e._currentValue),e._currentValue=a}function Qn(t){t._currentValue=Om.current,Nt(Om)}function Mm(t,e,a){for(;t!==null;){var n=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,n!==null&&(n.childLanes|=e)):n!==null&&(n.childLanes&e)!==e&&(n.childLanes|=e),t===a)break;t=t.return}}function Nm(t,e,a,n){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var s=r.dependencies;if(s!==null){var i=r.child;s=s.firstContext;e:for(;s!==null;){var u=s;s=r;for(var l=0;l<e.length;l++)if(u.context===e[l]){s.lanes|=a,u=s.alternate,u!==null&&(u.lanes|=a),Mm(s.return,a,t),n||(i=null);break e}s=u.next}}else if(r.tag===18){if(i=r.return,i===null)throw Error(N(341));i.lanes|=a,s=i.alternate,s!==null&&(s.lanes|=a),Mm(i,a,t),i=null}else i=r.child;if(i!==null)i.return=r;else for(i=r;i!==null;){if(i===t){i=null;break}if(r=i.sibling,r!==null){r.return=i.return,i=r;break}i=i.return}r=i}}function Qi(t,e,a,n){t=null;for(var r=e,s=!1;r!==null;){if(!s){if(r.flags&524288)s=!0;else if(r.flags&262144)break}if(r.tag===10){var i=r.alternate;if(i===null)throw Error(N(387));if(i=i.memoizedProps,i!==null){var u=r.type;xa(r.pendingProps.value,i.value)||(t!==null?t.push(u):t=[u])}}else if(r===vd.current){if(i=r.alternate,i===null)throw Error(N(387));i.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(Qu):t=[Qu])}r=r.return}t!==null&&Nm(e,t,a,n),e.flags|=262144}function xd(t){for(t=t.firstContext;t!==null;){if(!xa(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function xs(t){Vs=t,Kn=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function jt(t){return lE(Vs,t)}function Yc(t,e){return Vs===null&&xs(t),lE(t,e)}function lE(t,e){var a=e._currentValue;if(e={context:e,memoizedValue:a,next:null},Kn===null){if(t===null)throw Error(N(308));Kn=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else Kn=Kn.next=e;return a}var Ak=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(a,n){t.push(n)}};this.abort=function(){e.aborted=!0,t.forEach(function(a){return a()})}},xk=xt.unstable_scheduleCallback,Rk=xt.unstable_NormalPriority,St={$$typeof:Gn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Ag(){return{controller:new Ak,data:new Map,refCount:0}}function nl(t){t.refCount--,t.refCount===0&&xk(Rk,function(){t.controller.abort()})}var Lu=null,Vm=0,Ui=0,ki=null;function kk(t,e){if(Lu===null){var a=Lu=[];Vm=0,Ui=Zg(),ki={status:"pending",value:void 0,then:function(n){a.push(n)}}}return Vm++,e.then(IT,IT),e}function IT(){if(--Vm===0&&Lu!==null){ki!==null&&(ki.status="fulfilled");var t=Lu;Lu=null,Ui=0,ki=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function Dk(t,e){var a=[],n={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return t.then(function(){n.status="fulfilled",n.value=e;for(var r=0;r<a.length;r++)(0,a[r])(e)},function(r){for(n.status="rejected",n.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),n}var ST=re.S;re.S=function(t,e){wC=Ca(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&kk(t,e),ST!==null&&ST(t,e)};var Cs=gn(null);function xg(){var t=Cs.current;return t!==null?t:ze.pooledCache}function dd(t,e){e===null?Ge(Cs,Cs.current):Ge(Cs,e.pool)}function cE(){var t=xg();return t===null?null:{parent:St._currentValue,pool:t}}var Xi=Error(N(460)),Rg=Error(N(474)),af=Error(N(542)),Rd={then:function(){}};function vT(t){return t=t.status,t==="fulfilled"||t==="rejected"}function dE(t,e,a){switch(a=t[a],a===void 0?t.push(e):a!==e&&(e.then(jn,jn),e=a),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,wT(t),t;default:if(typeof e.status=="string")e.then(jn,jn);else{if(t=ze,t!==null&&100<t.shellSuspendCounter)throw Error(N(482));t=e,t.status="pending",t.then(function(n){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=n}},function(n){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=n}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,wT(t),t}throw bs=e,Xi}}function vs(t){try{var e=t._init;return e(t._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(bs=a,Xi):a}}var bs=null;function TT(){if(bs===null)throw Error(N(459));var t=bs;return bs=null,t}function wT(t){if(t===Xi||t===af)throw Error(N(483))}var Di=null,Hu=0;function $c(t){var e=Hu;return Hu+=1,Di===null&&(Di=[]),dE(Di,t,e)}function pu(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Jc(t,e){throw e.$$typeof===_1?Error(N(525)):(t=Object.prototype.toString.call(e),Error(N(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function fE(t){function e(w,v){if(t){var b=w.deletions;b===null?(w.deletions=[v],w.flags|=16):b.push(v)}}function a(w,v){if(!t)return null;for(;v!==null;)e(w,v),v=v.sibling;return null}function n(w){for(var v=new Map;w!==null;)w.key!==null?v.set(w.key,w):v.set(w.index,w),w=w.sibling;return v}function r(w,v){return w=Wn(w,v),w.index=0,w.sibling=null,w}function s(w,v,b){return w.index=b,t?(b=w.alternate,b!==null?(b=b.index,b<v?(w.flags|=67108866,v):b):(w.flags|=67108866,v)):(w.flags|=1048576,v)}function i(w){return t&&w.alternate===null&&(w.flags|=67108866),w}function u(w,v,b,x){return v===null||v.tag!==6?(v=Qp(b,w.mode,x),v.return=w,v):(v=r(v,b),v.return=w,v)}function l(w,v,b,x){var B=b.type;return B===gi?h(w,v,b.props.children,x,b.key):v!==null&&(v.elementType===B||typeof B=="object"&&B!==null&&B.$$typeof===Dr&&vs(B)===v.type)?(v=r(v,b.props),pu(v,b),v.return=w,v):(v=cd(b.type,b.key,b.props,null,w.mode,x),pu(v,b),v.return=w,v)}function d(w,v,b,x){return v===null||v.tag!==4||v.stateNode.containerInfo!==b.containerInfo||v.stateNode.implementation!==b.implementation?(v=Xp(b,w.mode,x),v.return=w,v):(v=r(v,b.children||[]),v.return=w,v)}function h(w,v,b,x,B){return v===null||v.tag!==7?(v=Es(b,w.mode,x,B),v.return=w,v):(v=r(v,b),v.return=w,v)}function m(w,v,b){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Qp(""+v,w.mode,b),v.return=w,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case zc:return b=cd(v.type,v.key,v.props,null,w.mode,b),pu(b,v),b.return=w,b;case Iu:return v=Xp(v,w.mode,b),v.return=w,v;case Dr:return v=vs(v),m(w,v,b)}if(Su(v)||fu(v))return v=Es(v,w.mode,b,null),v.return=w,v;if(typeof v.then=="function")return m(w,$c(v),b);if(v.$$typeof===Gn)return m(w,Yc(w,v),b);Jc(w,v)}return null}function p(w,v,b,x){var B=v!==null?v.key:null;if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return B!==null?null:u(w,v,""+b,x);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case zc:return b.key===B?l(w,v,b,x):null;case Iu:return b.key===B?d(w,v,b,x):null;case Dr:return b=vs(b),p(w,v,b,x)}if(Su(b)||fu(b))return B!==null?null:h(w,v,b,x,null);if(typeof b.then=="function")return p(w,v,$c(b),x);if(b.$$typeof===Gn)return p(w,v,Yc(w,b),x);Jc(w,b)}return null}function I(w,v,b,x,B){if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return w=w.get(b)||null,u(v,w,""+x,B);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case zc:return w=w.get(x.key===null?b:x.key)||null,l(v,w,x,B);case Iu:return w=w.get(x.key===null?b:x.key)||null,d(v,w,x,B);case Dr:return x=vs(x),I(w,v,b,x,B)}if(Su(x)||fu(x))return w=w.get(b)||null,h(v,w,x,B,null);if(typeof x.then=="function")return I(w,v,b,$c(x),B);if(x.$$typeof===Gn)return I(w,v,b,Yc(v,x),B);Jc(v,x)}return null}function L(w,v,b,x){for(var B=null,G=null,S=v,y=v=0,_=null;S!==null&&y<b.length;y++){S.index>y?(_=S,S=null):_=S.sibling;var T=p(w,S,b[y],x);if(T===null){S===null&&(S=_);break}t&&S&&T.alternate===null&&e(w,S),v=s(T,v,y),G===null?B=T:G.sibling=T,G=T,S=_}if(y===b.length)return a(w,S),ge&&zn(w,y),B;if(S===null){for(;y<b.length;y++)S=m(w,b[y],x),S!==null&&(v=s(S,v,y),G===null?B=S:G.sibling=S,G=S);return ge&&zn(w,y),B}for(S=n(S);y<b.length;y++)_=I(S,w,y,b[y],x),_!==null&&(t&&_.alternate!==null&&S.delete(_.key===null?y:_.key),v=s(_,v,y),G===null?B=_:G.sibling=_,G=_);return t&&S.forEach(function(C){return e(w,C)}),ge&&zn(w,y),B}function k(w,v,b,x){if(b==null)throw Error(N(151));for(var B=null,G=null,S=v,y=v=0,_=null,T=b.next();S!==null&&!T.done;y++,T=b.next()){S.index>y?(_=S,S=null):_=S.sibling;var C=p(w,S,T.value,x);if(C===null){S===null&&(S=_);break}t&&S&&C.alternate===null&&e(w,S),v=s(C,v,y),G===null?B=C:G.sibling=C,G=C,S=_}if(T.done)return a(w,S),ge&&zn(w,y),B;if(S===null){for(;!T.done;y++,T=b.next())T=m(w,T.value,x),T!==null&&(v=s(T,v,y),G===null?B=T:G.sibling=T,G=T);return ge&&zn(w,y),B}for(S=n(S);!T.done;y++,T=b.next())T=I(S,w,y,T.value,x),T!==null&&(t&&T.alternate!==null&&S.delete(T.key===null?y:T.key),v=s(T,v,y),G===null?B=T:G.sibling=T,G=T);return t&&S.forEach(function(A){return e(w,A)}),ge&&zn(w,y),B}function D(w,v,b,x){if(typeof b=="object"&&b!==null&&b.type===gi&&b.key===null&&(b=b.props.children),typeof b=="object"&&b!==null){switch(b.$$typeof){case zc:e:{for(var B=b.key;v!==null;){if(v.key===B){if(B=b.type,B===gi){if(v.tag===7){a(w,v.sibling),x=r(v,b.props.children),x.return=w,w=x;break e}}else if(v.elementType===B||typeof B=="object"&&B!==null&&B.$$typeof===Dr&&vs(B)===v.type){a(w,v.sibling),x=r(v,b.props),pu(x,b),x.return=w,w=x;break e}a(w,v);break}else e(w,v);v=v.sibling}b.type===gi?(x=Es(b.props.children,w.mode,x,b.key),x.return=w,w=x):(x=cd(b.type,b.key,b.props,null,w.mode,x),pu(x,b),x.return=w,w=x)}return i(w);case Iu:e:{for(B=b.key;v!==null;){if(v.key===B)if(v.tag===4&&v.stateNode.containerInfo===b.containerInfo&&v.stateNode.implementation===b.implementation){a(w,v.sibling),x=r(v,b.children||[]),x.return=w,w=x;break e}else{a(w,v);break}else e(w,v);v=v.sibling}x=Xp(b,w.mode,x),x.return=w,w=x}return i(w);case Dr:return b=vs(b),D(w,v,b,x)}if(Su(b))return L(w,v,b,x);if(fu(b)){if(B=fu(b),typeof B!="function")throw Error(N(150));return b=B.call(b),k(w,v,b,x)}if(typeof b.then=="function")return D(w,v,$c(b),x);if(b.$$typeof===Gn)return D(w,v,Yc(w,b),x);Jc(w,b)}return typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint"?(b=""+b,v!==null&&v.tag===6?(a(w,v.sibling),x=r(v,b),x.return=w,w=x):(a(w,v),x=Qp(b,w.mode,x),x.return=w,w=x),i(w)):a(w,v)}return function(w,v,b,x){try{Hu=0;var B=D(w,v,b,x);return Di=null,B}catch(S){if(S===Xi||S===af)throw S;var G=wa(29,S,null,w.mode);return G.lanes=x,G.return=w,G}finally{}}}var Rs=fE(!0),hE=fE(!1),Pr=!1;function kg(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Um(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function jr(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Kr(t,e,a){var n=t.updateQueue;if(n===null)return null;if(n=n.shared,be&2){var r=n.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),n.pending=e,e=Ld(t),rE(t,null,a),e}return tf(t,n,e,a),Ld(t)}function Au(t,e,a){if(e=e.updateQueue,e!==null&&(e=e.shared,(a&4194048)!==0)){var n=e.lanes;n&=t.pendingLanes,a|=n,e.lanes=a,kw(t,a)}}function $p(t,e){var a=t.updateQueue,n=t.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var r=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var i={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?r=s=i:s=s.next=i,a=a.next}while(a!==null);s===null?r=s=e:s=s.next=e}else r=s=e;a={baseState:n.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:n.shared,callbacks:n.callbacks},t.updateQueue=a;return}t=a.lastBaseUpdate,t===null?a.firstBaseUpdate=e:t.next=e,a.lastBaseUpdate=e}var Fm=!1;function xu(){if(Fm){var t=ki;if(t!==null)throw t}}function Ru(t,e,a,n){Fm=!1;var r=t.updateQueue;Pr=!1;var s=r.firstBaseUpdate,i=r.lastBaseUpdate,u=r.shared.pending;if(u!==null){r.shared.pending=null;var l=u,d=l.next;l.next=null,i===null?s=d:i.next=d,i=l;var h=t.alternate;h!==null&&(h=h.updateQueue,u=h.lastBaseUpdate,u!==i&&(u===null?h.firstBaseUpdate=d:u.next=d,h.lastBaseUpdate=l))}if(s!==null){var m=r.baseState;i=0,h=d=l=null,u=s;do{var p=u.lane&-536870913,I=p!==u.lane;if(I?(me&p)===p:(n&p)===p){p!==0&&p===Ui&&(Fm=!0),h!==null&&(h=h.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var L=t,k=u;p=e;var D=a;switch(k.tag){case 1:if(L=k.payload,typeof L=="function"){m=L.call(D,m,p);break e}m=L;break e;case 3:L.flags=L.flags&-65537|128;case 0:if(L=k.payload,p=typeof L=="function"?L.call(D,m,p):L,p==null)break e;m=Xe({},m,p);break e;case 2:Pr=!0}}p=u.callback,p!==null&&(t.flags|=64,I&&(t.flags|=8192),I=r.callbacks,I===null?r.callbacks=[p]:I.push(p))}else I={lane:p,tag:u.tag,payload:u.payload,callback:u.callback,next:null},h===null?(d=h=I,l=m):h=h.next=I,i|=p;if(u=u.next,u===null){if(u=r.shared.pending,u===null)break;I=u,u=I.next,I.next=null,r.lastBaseUpdate=I,r.shared.pending=null}}while(!0);h===null&&(l=m),r.baseState=l,r.firstBaseUpdate=d,r.lastBaseUpdate=h,s===null&&(r.shared.lanes=0),ts|=i,t.lanes=i,t.memoizedState=m}}function pE(t,e){if(typeof t!="function")throw Error(N(191,t));t.call(e)}function mE(t,e){var a=t.callbacks;if(a!==null)for(t.callbacks=null,t=0;t<a.length;t++)pE(a[t],e)}var Fi=gn(null),kd=gn(0);function ET(t,e){t=er,Ge(kd,t),Ge(Fi,e),er=t|e.baseLanes}function Bm(){Ge(kd,er),Ge(Fi,Fi.current)}function Dg(){er=kd.current,Nt(Fi),Nt(kd)}var Ra=gn(null),Ha=null;function Mr(t){var e=t.alternate;Ge(ht,ht.current&1),Ge(Ra,t),Ha===null&&(e===null||Fi.current!==null||e.memoizedState!==null)&&(Ha=t)}function qm(t){Ge(ht,ht.current),Ge(Ra,t),Ha===null&&(Ha=t)}function gE(t){t.tag===22?(Ge(ht,ht.current),Ge(Ra,t),Ha===null&&(Ha=t)):Nr(t)}function Nr(){Ge(ht,ht.current),Ge(Ra,Ra.current)}function Ta(t){Nt(Ra),Ha===t&&(Ha=null),Nt(ht)}var ht=gn(0);function Dd(t){for(var e=t;e!==null;){if(e.tag===13){var a=e.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||ig(a)||og(a)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var $n=0,ue=null,Ve=null,_t=null,Pd=!1,Pi=!1,ks=!1,Od=0,Gu=0,Oi=null,Pk=0;function lt(){throw Error(N(321))}function Pg(t,e){if(e===null)return!1;for(var a=0;a<e.length&&a<t.length;a++)if(!xa(t[a],e[a]))return!1;return!0}function Og(t,e,a,n,r,s){return $n=s,ue=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,re.H=t===null||t.memoizedState===null?WE:jg,ks=!1,s=a(n,r),ks=!1,Pi&&(s=_E(e,a,n,r)),yE(t),s}function yE(t){re.H=ju;var e=Ve!==null&&Ve.next!==null;if($n=0,_t=Ve=ue=null,Pd=!1,Gu=0,Oi=null,e)throw Error(N(300));t===null||vt||(t=t.dependencies,t!==null&&xd(t)&&(vt=!0))}function _E(t,e,a,n){ue=t;var r=0;do{if(Pi&&(Oi=null),Gu=0,Pi=!1,25<=r)throw Error(N(301));if(r+=1,_t=Ve=null,t.updateQueue!=null){var s=t.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}re.H=QE,s=e(a,n)}while(Pi);return s}function Ok(){var t=re.H,e=t.useState()[0];return e=typeof e.then=="function"?rl(e):e,t=t.useState()[0],(Ve!==null?Ve.memoizedState:null)!==t&&(ue.flags|=1024),e}function Mg(){var t=Od!==0;return Od=0,t}function Ng(t,e,a){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~a}function Vg(t){if(Pd){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}Pd=!1}$n=0,_t=Ve=ue=null,Pi=!1,Gu=Od=0,Oi=null}function aa(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return _t===null?ue.memoizedState=_t=t:_t=_t.next=t,_t}function pt(){if(Ve===null){var t=ue.alternate;t=t!==null?t.memoizedState:null}else t=Ve.next;var e=_t===null?ue.memoizedState:_t.next;if(e!==null)_t=e,Ve=t;else{if(t===null)throw ue.alternate===null?Error(N(467)):Error(N(310));Ve=t,t={memoizedState:Ve.memoizedState,baseState:Ve.baseState,baseQueue:Ve.baseQueue,queue:Ve.queue,next:null},_t===null?ue.memoizedState=_t=t:_t=_t.next=t}return _t}function nf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function rl(t){var e=Gu;return Gu+=1,Oi===null&&(Oi=[]),t=dE(Oi,t,e),e=ue,(_t===null?e.memoizedState:_t.next)===null&&(e=e.alternate,re.H=e===null||e.memoizedState===null?WE:jg),t}function rf(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return rl(t);if(t.$$typeof===Gn)return jt(t)}throw Error(N(438,String(t)))}function Ug(t){var e=null,a=ue.updateQueue;if(a!==null&&(e=a.memoCache),e==null){var n=ue.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(e={data:n.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),a===null&&(a=nf(),ue.updateQueue=a),a.memoCache=e,a=e.data[e.index],a===void 0)for(a=e.data[e.index]=Array(t),n=0;n<t;n++)a[n]=I1;return e.index++,a}function Jn(t,e){return typeof e=="function"?e(t):e}function fd(t){var e=pt();return Fg(e,Ve,t)}function Fg(t,e,a){var n=t.queue;if(n===null)throw Error(N(311));n.lastRenderedReducer=a;var r=t.baseQueue,s=n.pending;if(s!==null){if(r!==null){var i=r.next;r.next=s.next,s.next=i}e.baseQueue=r=s,n.pending=null}if(s=t.baseState,r===null)t.memoizedState=s;else{e=r.next;var u=i=null,l=null,d=e,h=!1;do{var m=d.lane&-536870913;if(m!==d.lane?(me&m)===m:($n&m)===m){var p=d.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),m===Ui&&(h=!0);else if(($n&p)===p){d=d.next,p===Ui&&(h=!0);continue}else m={lane:0,revertLane:d.revertLane,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},l===null?(u=l=m,i=s):l=l.next=m,ue.lanes|=p,ts|=p;m=d.action,ks&&a(s,m),s=d.hasEagerState?d.eagerState:a(s,m)}else p={lane:m,revertLane:d.revertLane,gesture:d.gesture,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},l===null?(u=l=p,i=s):l=l.next=p,ue.lanes|=m,ts|=m;d=d.next}while(d!==null&&d!==e);if(l===null?i=s:l.next=u,!xa(s,t.memoizedState)&&(vt=!0,h&&(a=ki,a!==null)))throw a;t.memoizedState=s,t.baseState=i,t.baseQueue=l,n.lastRenderedState=s}return r===null&&(n.lanes=0),[t.memoizedState,n.dispatch]}function Jp(t){var e=pt(),a=e.queue;if(a===null)throw Error(N(311));a.lastRenderedReducer=t;var n=a.dispatch,r=a.pending,s=e.memoizedState;if(r!==null){a.pending=null;var i=r=r.next;do s=t(s,i.action),i=i.next;while(i!==r);xa(s,e.memoizedState)||(vt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),a.lastRenderedState=s}return[s,n]}function IE(t,e,a){var n=ue,r=pt(),s=ge;if(s){if(a===void 0)throw Error(N(407));a=a()}else a=e();var i=!xa((Ve||r).memoizedState,a);if(i&&(r.memoizedState=a,vt=!0),r=r.queue,Bg(TE.bind(null,n,r,t),[t]),r.getSnapshot!==e||i||_t!==null&&_t.memoizedState.tag&1){if(n.flags|=2048,Bi(9,{destroy:void 0},vE.bind(null,n,r,a,e),null),ze===null)throw Error(N(349));s||$n&127||SE(n,e,a)}return a}function SE(t,e,a){t.flags|=16384,t={getSnapshot:e,value:a},e=ue.updateQueue,e===null?(e=nf(),ue.updateQueue=e,e.stores=[t]):(a=e.stores,a===null?e.stores=[t]:a.push(t))}function vE(t,e,a,n){e.value=a,e.getSnapshot=n,wE(e)&&EE(t)}function TE(t,e,a){return a(function(){wE(e)&&EE(t)})}function wE(t){var e=t.getSnapshot;t=t.value;try{var a=e();return!xa(t,a)}catch{return!0}}function EE(t){var e=Ns(t,2);e!==null&&la(e,t,2)}function zm(t){var e=aa();if(typeof t=="function"){var a=t;if(t=a(),ks){Ur(!0);try{a()}finally{Ur(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Jn,lastRenderedState:t},e}function CE(t,e,a,n){return t.baseState=a,Fg(t,Ve,typeof n=="function"?n:Jn)}function Mk(t,e,a,n,r){if(of(t))throw Error(N(485));if(t=e.action,t!==null){var s={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){s.listeners.push(i)}};re.T!==null?a(!0):s.isTransition=!1,n(s),a=e.pending,a===null?(s.next=e.pending=s,bE(e,s)):(s.next=a.next,e.pending=a.next=s)}}function bE(t,e){var a=e.action,n=e.payload,r=t.state;if(e.isTransition){var s=re.T,i={};re.T=i;try{var u=a(r,n),l=re.S;l!==null&&l(i,u),CT(t,e,u)}catch(d){Hm(t,e,d)}finally{s!==null&&i.types!==null&&(s.types=i.types),re.T=s}}else try{s=a(r,n),CT(t,e,s)}catch(d){Hm(t,e,d)}}function CT(t,e,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){bT(t,e,n)},function(n){return Hm(t,e,n)}):bT(t,e,a)}function bT(t,e,a){e.status="fulfilled",e.value=a,LE(e),t.state=a,e=t.pending,e!==null&&(a=e.next,a===e?t.pending=null:(a=a.next,e.next=a,bE(t,a)))}function Hm(t,e,a){var n=t.pending;if(t.pending=null,n!==null){n=n.next;do e.status="rejected",e.reason=a,LE(e),e=e.next;while(e!==n)}t.action=null}function LE(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function AE(t,e){return e}function LT(t,e){if(ge){var a=ze.formState;if(a!==null){e:{var n=ue;if(ge){if(Qe){t:{for(var r=Qe,s=za;r.nodeType!==8;){if(!s){r=null;break t}if(r=Ga(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){Qe=Ga(r.nextSibling),n=r.data==="F!";break e}}Zr(n)}n=!1}n&&(e=a[0])}}return a=aa(),a.memoizedState=a.baseState=e,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:AE,lastRenderedState:e},a.queue=n,a=GE.bind(null,ue,n),n.dispatch=a,n=zm(!1),s=Gg.bind(null,ue,!1,n.queue),n=aa(),r={state:e,dispatch:null,action:t,pending:null},n.queue=r,a=Mk.bind(null,ue,r,s,a),r.dispatch=a,n.memoizedState=t,[e,a,!1]}function AT(t){var e=pt();return xE(e,Ve,t)}function xE(t,e,a){if(e=Fg(t,e,AE)[0],t=fd(Jn)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var n=rl(e)}catch(i){throw i===Xi?af:i}else n=e;e=pt();var r=e.queue,s=r.dispatch;return a!==e.memoizedState&&(ue.flags|=2048,Bi(9,{destroy:void 0},Nk.bind(null,r,a),null)),[n,s,t]}function Nk(t,e){t.action=e}function xT(t){var e=pt(),a=Ve;if(a!==null)return xE(e,a,t);pt(),e=e.memoizedState,a=pt();var n=a.queue.dispatch;return a.memoizedState=t,[e,n,!1]}function Bi(t,e,a,n){return t={tag:t,create:a,deps:n,inst:e,next:null},e=ue.updateQueue,e===null&&(e=nf(),ue.updateQueue=e),a=e.lastEffect,a===null?e.lastEffect=t.next=t:(n=a.next,a.next=t,t.next=n,e.lastEffect=t),t}function RE(){return pt().memoizedState}function hd(t,e,a,n){var r=aa();ue.flags|=t,r.memoizedState=Bi(1|e,{destroy:void 0},a,n===void 0?null:n)}function sf(t,e,a,n){var r=pt();n=n===void 0?null:n;var s=r.memoizedState.inst;Ve!==null&&n!==null&&Pg(n,Ve.memoizedState.deps)?r.memoizedState=Bi(e,s,a,n):(ue.flags|=t,r.memoizedState=Bi(1|e,s,a,n))}function RT(t,e){hd(8390656,8,t,e)}function Bg(t,e){sf(2048,8,t,e)}function Vk(t){ue.flags|=4;var e=ue.updateQueue;if(e===null)e=nf(),ue.updateQueue=e,e.events=[t];else{var a=e.events;a===null?e.events=[t]:a.push(t)}}function kE(t){var e=pt().memoizedState;return Vk({ref:e,nextImpl:t}),function(){if(be&2)throw Error(N(440));return e.impl.apply(void 0,arguments)}}function DE(t,e){return sf(4,2,t,e)}function PE(t,e){return sf(4,4,t,e)}function OE(t,e){if(typeof e=="function"){t=t();var a=e(t);return function(){typeof a=="function"?a():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function ME(t,e,a){a=a!=null?a.concat([t]):null,sf(4,4,OE.bind(null,e,t),a)}function qg(){}function NE(t,e){var a=pt();e=e===void 0?null:e;var n=a.memoizedState;return e!==null&&Pg(e,n[1])?n[0]:(a.memoizedState=[t,e],t)}function VE(t,e){var a=pt();e=e===void 0?null:e;var n=a.memoizedState;if(e!==null&&Pg(e,n[1]))return n[0];if(n=t(),ks){Ur(!0);try{t()}finally{Ur(!1)}}return a.memoizedState=[n,e],n}function zg(t,e,a){return a===void 0||$n&1073741824&&!(me&261930)?t.memoizedState=e:(t.memoizedState=a,t=CC(),ue.lanes|=t,ts|=t,a)}function UE(t,e,a,n){return xa(a,e)?a:Fi.current!==null?(t=zg(t,a,n),xa(t,e)||(vt=!0),t):!($n&42)||$n&1073741824&&!(me&261930)?(vt=!0,t.memoizedState=a):(t=CC(),ue.lanes|=t,ts|=t,e)}function FE(t,e,a,n,r){var s=Le.p;Le.p=s!==0&&8>s?s:8;var i=re.T,u={};re.T=u,Gg(t,!1,e,a);try{var l=r(),d=re.S;if(d!==null&&d(u,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var h=Dk(l,n);ku(t,e,h,Aa(t))}else ku(t,e,n,Aa(t))}catch(m){ku(t,e,{then:function(){},status:"rejected",reason:m},Aa())}finally{Le.p=s,i!==null&&u.types!==null&&(i.types=u.types),re.T=i}}function Uk(){}function Gm(t,e,a,n){if(t.tag!==5)throw Error(N(476));var r=BE(t).queue;FE(t,r,e,ws,a===null?Uk:function(){return qE(t),a(n)})}function BE(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:ws,baseState:ws,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Jn,lastRenderedState:ws},next:null};var a={};return e.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Jn,lastRenderedState:a},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function qE(t){var e=BE(t);e.next===null&&(e=t.alternate.memoizedState),ku(t,e.next.queue,{},Aa())}function Hg(){return jt(Qu)}function zE(){return pt().memoizedState}function HE(){return pt().memoizedState}function Fk(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var a=Aa();t=jr(a);var n=Kr(e,t,a);n!==null&&(la(n,e,a),Au(n,e,a)),e={cache:Ag()},t.payload=e;return}e=e.return}}function Bk(t,e,a){var n=Aa();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},of(t)?jE(e,a):(a=Eg(t,e,a,n),a!==null&&(la(a,t,n),KE(a,e,n)))}function GE(t,e,a){var n=Aa();ku(t,e,a,n)}function ku(t,e,a,n){var r={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(of(t))jE(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var i=e.lastRenderedState,u=s(i,a);if(r.hasEagerState=!0,r.eagerState=u,xa(u,i))return tf(t,e,r,0),ze===null&&ef(),!1}catch{}finally{}if(a=Eg(t,e,r,n),a!==null)return la(a,t,n),KE(a,e,n),!0}return!1}function Gg(t,e,a,n){if(n={lane:2,revertLane:Zg(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},of(t)){if(e)throw Error(N(479))}else e=Eg(t,a,n,2),e!==null&&la(e,t,2)}function of(t){var e=t.alternate;return t===ue||e!==null&&e===ue}function jE(t,e){Pi=Pd=!0;var a=t.pending;a===null?e.next=e:(e.next=a.next,a.next=e),t.pending=e}function KE(t,e,a){if(a&4194048){var n=e.lanes;n&=t.pendingLanes,a|=n,e.lanes=a,kw(t,a)}}var ju={readContext:jt,use:rf,useCallback:lt,useContext:lt,useEffect:lt,useImperativeHandle:lt,useLayoutEffect:lt,useInsertionEffect:lt,useMemo:lt,useReducer:lt,useRef:lt,useState:lt,useDebugValue:lt,useDeferredValue:lt,useTransition:lt,useSyncExternalStore:lt,useId:lt,useHostTransitionStatus:lt,useFormState:lt,useActionState:lt,useOptimistic:lt,useMemoCache:lt,useCacheRefresh:lt};ju.useEffectEvent=lt;var WE={readContext:jt,use:rf,useCallback:function(t,e){return aa().memoizedState=[t,e===void 0?null:e],t},useContext:jt,useEffect:RT,useImperativeHandle:function(t,e,a){a=a!=null?a.concat([t]):null,hd(4194308,4,OE.bind(null,e,t),a)},useLayoutEffect:function(t,e){return hd(4194308,4,t,e)},useInsertionEffect:function(t,e){hd(4,2,t,e)},useMemo:function(t,e){var a=aa();e=e===void 0?null:e;var n=t();if(ks){Ur(!0);try{t()}finally{Ur(!1)}}return a.memoizedState=[n,e],n},useReducer:function(t,e,a){var n=aa();if(a!==void 0){var r=a(e);if(ks){Ur(!0);try{a(e)}finally{Ur(!1)}}}else r=e;return n.memoizedState=n.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},n.queue=t,t=t.dispatch=Bk.bind(null,ue,t),[n.memoizedState,t]},useRef:function(t){var e=aa();return t={current:t},e.memoizedState=t},useState:function(t){t=zm(t);var e=t.queue,a=GE.bind(null,ue,e);return e.dispatch=a,[t.memoizedState,a]},useDebugValue:qg,useDeferredValue:function(t,e){var a=aa();return zg(a,t,e)},useTransition:function(){var t=zm(!1);return t=FE.bind(null,ue,t.queue,!0,!1),aa().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,a){var n=ue,r=aa();if(ge){if(a===void 0)throw Error(N(407));a=a()}else{if(a=e(),ze===null)throw Error(N(349));me&127||SE(n,e,a)}r.memoizedState=a;var s={value:a,getSnapshot:e};return r.queue=s,RT(TE.bind(null,n,s,t),[t]),n.flags|=2048,Bi(9,{destroy:void 0},vE.bind(null,n,s,a,e),null),a},useId:function(){var t=aa(),e=ze.identifierPrefix;if(ge){var a=hn,n=fn;a=(n&~(1<<32-La(n)-1)).toString(32)+a,e="_"+e+"R_"+a,a=Od++,0<a&&(e+="H"+a.toString(32)),e+="_"}else a=Pk++,e="_"+e+"r_"+a.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Hg,useFormState:LT,useActionState:LT,useOptimistic:function(t){var e=aa();e.memoizedState=e.baseState=t;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=a,e=Gg.bind(null,ue,!0,a),a.dispatch=e,[t,e]},useMemoCache:Ug,useCacheRefresh:function(){return aa().memoizedState=Fk.bind(null,ue)},useEffectEvent:function(t){var e=aa(),a={impl:t};return e.memoizedState=a,function(){if(be&2)throw Error(N(440));return a.impl.apply(void 0,arguments)}}},jg={readContext:jt,use:rf,useCallback:NE,useContext:jt,useEffect:Bg,useImperativeHandle:ME,useInsertionEffect:DE,useLayoutEffect:PE,useMemo:VE,useReducer:fd,useRef:RE,useState:function(){return fd(Jn)},useDebugValue:qg,useDeferredValue:function(t,e){var a=pt();return UE(a,Ve.memoizedState,t,e)},useTransition:function(){var t=fd(Jn)[0],e=pt().memoizedState;return[typeof t=="boolean"?t:rl(t),e]},useSyncExternalStore:IE,useId:zE,useHostTransitionStatus:Hg,useFormState:AT,useActionState:AT,useOptimistic:function(t,e){var a=pt();return CE(a,Ve,t,e)},useMemoCache:Ug,useCacheRefresh:HE};jg.useEffectEvent=kE;var QE={readContext:jt,use:rf,useCallback:NE,useContext:jt,useEffect:Bg,useImperativeHandle:ME,useInsertionEffect:DE,useLayoutEffect:PE,useMemo:VE,useReducer:Jp,useRef:RE,useState:function(){return Jp(Jn)},useDebugValue:qg,useDeferredValue:function(t,e){var a=pt();return Ve===null?zg(a,t,e):UE(a,Ve.memoizedState,t,e)},useTransition:function(){var t=Jp(Jn)[0],e=pt().memoizedState;return[typeof t=="boolean"?t:rl(t),e]},useSyncExternalStore:IE,useId:zE,useHostTransitionStatus:Hg,useFormState:xT,useActionState:xT,useOptimistic:function(t,e){var a=pt();return Ve!==null?CE(a,Ve,t,e):(a.baseState=t,[t,a.queue.dispatch])},useMemoCache:Ug,useCacheRefresh:HE};QE.useEffectEvent=kE;function Zp(t,e,a,n){e=t.memoizedState,a=a(n,e),a=a==null?e:Xe({},e,a),t.memoizedState=a,t.lanes===0&&(t.updateQueue.baseState=a)}var jm={enqueueSetState:function(t,e,a){t=t._reactInternals;var n=Aa(),r=jr(n);r.payload=e,a!=null&&(r.callback=a),e=Kr(t,r,n),e!==null&&(la(e,t,n),Au(e,t,n))},enqueueReplaceState:function(t,e,a){t=t._reactInternals;var n=Aa(),r=jr(n);r.tag=1,r.payload=e,a!=null&&(r.callback=a),e=Kr(t,r,n),e!==null&&(la(e,t,n),Au(e,t,n))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var a=Aa(),n=jr(a);n.tag=2,e!=null&&(n.callback=e),e=Kr(t,n,a),e!==null&&(la(e,t,a),Au(e,t,a))}};function kT(t,e,a,n,r,s,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(n,s,i):e.prototype&&e.prototype.isPureReactComponent?!Bu(a,n)||!Bu(r,s):!0}function DT(t,e,a,n){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(a,n),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(a,n),e.state!==t&&jm.enqueueReplaceState(e,e.state,null)}function Ds(t,e){var a=e;if("ref"in e){a={};for(var n in e)n!=="ref"&&(a[n]=e[n])}if(t=t.defaultProps){a===e&&(a=Xe({},a));for(var r in t)a[r]===void 0&&(a[r]=t[r])}return a}function XE(t){bd(t)}function YE(t){console.error(t)}function $E(t){bd(t)}function Md(t,e){try{var a=t.onUncaughtError;a(e.value,{componentStack:e.stack})}catch(n){setTimeout(function(){throw n})}}function PT(t,e,a){try{var n=t.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Km(t,e,a){return a=jr(a),a.tag=3,a.payload={element:null},a.callback=function(){Md(t,e)},a}function JE(t){return t=jr(t),t.tag=3,t}function ZE(t,e,a,n){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var s=n.value;t.payload=function(){return r(s)},t.callback=function(){PT(e,a,n)}}var i=a.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){PT(e,a,n),typeof r!="function"&&(Wr===null?Wr=new Set([this]):Wr.add(this));var u=n.stack;this.componentDidCatch(n.value,{componentStack:u!==null?u:""})})}function qk(t,e,a,n,r){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(e=a.alternate,e!==null&&Qi(e,a,r,!0),a=Ra.current,a!==null){switch(a.tag){case 31:case 13:return Ha===null?Bd():a.alternate===null&&ct===0&&(ct=3),a.flags&=-257,a.flags|=65536,a.lanes=r,n===Rd?a.flags|=16384:(e=a.updateQueue,e===null?a.updateQueue=new Set([n]):e.add(n),cm(t,n,r)),!1;case 22:return a.flags|=65536,n===Rd?a.flags|=16384:(e=a.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=e):(a=e.retryQueue,a===null?e.retryQueue=new Set([n]):a.add(n)),cm(t,n,r)),!1}throw Error(N(435,a.tag))}return cm(t,n,r),Bd(),!1}if(ge)return e=Ra.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,n!==Pm&&(t=Error(N(422),{cause:n}),zu(qa(t,a)))):(n!==Pm&&(e=Error(N(423),{cause:n}),zu(qa(e,a))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,n=qa(n,a),r=Km(t.stateNode,n,r),$p(t,r),ct!==4&&(ct=2)),!1;var s=Error(N(520),{cause:n});if(s=qa(s,a),Ou===null?Ou=[s]:Ou.push(s),ct!==4&&(ct=2),e===null)return!0;n=qa(n,a),a=e;do{switch(a.tag){case 3:return a.flags|=65536,t=r&-r,a.lanes|=t,t=Km(a.stateNode,n,t),$p(a,t),!1;case 1:if(e=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(Wr===null||!Wr.has(s))))return a.flags|=65536,r&=-r,a.lanes|=r,r=JE(r),ZE(r,t,a,n),$p(a,r),!1}a=a.return}while(a!==null);return!1}var Kg=Error(N(461)),vt=!1;function zt(t,e,a,n){e.child=t===null?hE(e,null,a,n):Rs(e,t.child,a,n)}function OT(t,e,a,n,r){a=a.render;var s=e.ref;if("ref"in n){var i={};for(var u in n)u!=="ref"&&(i[u]=n[u])}else i=n;return xs(e),n=Og(t,e,a,i,s,r),u=Mg(),t!==null&&!vt?(Ng(t,e,r),Zn(t,e,r)):(ge&&u&&bg(e),e.flags|=1,zt(t,e,n,r),e.child)}function MT(t,e,a,n,r){if(t===null){var s=a.type;return typeof s=="function"&&!Cg(s)&&s.defaultProps===void 0&&a.compare===null?(e.tag=15,e.type=s,eC(t,e,s,n,r)):(t=cd(a.type,null,n,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!Wg(t,r)){var i=s.memoizedProps;if(a=a.compare,a=a!==null?a:Bu,a(i,n)&&t.ref===e.ref)return Zn(t,e,r)}return e.flags|=1,t=Wn(s,n),t.ref=e.ref,t.return=e,e.child=t}function eC(t,e,a,n,r){if(t!==null){var s=t.memoizedProps;if(Bu(s,n)&&t.ref===e.ref)if(vt=!1,e.pendingProps=n=s,Wg(t,r))t.flags&131072&&(vt=!0);else return e.lanes=t.lanes,Zn(t,e,r)}return Wm(t,e,a,n,r)}function tC(t,e,a,n){var r=n.children,s=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if(e.flags&128){if(s=s!==null?s.baseLanes|a:a,t!==null){for(n=e.child=t.child,r=0;n!==null;)r=r|n.lanes|n.childLanes,n=n.sibling;n=r&~s}else n=0,e.child=null;return NT(t,e,s,a,n)}if(a&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&dd(e,s!==null?s.cachePool:null),s!==null?ET(e,s):Bm(),gE(e);else return n=e.lanes=536870912,NT(t,e,s!==null?s.baseLanes|a:a,a,n)}else s!==null?(dd(e,s.cachePool),ET(e,s),Nr(e),e.memoizedState=null):(t!==null&&dd(e,null),Bm(),Nr(e));return zt(t,e,r,a),e.child}function Tu(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function NT(t,e,a,n,r){var s=xg();return s=s===null?null:{parent:St._currentValue,pool:s},e.memoizedState={baseLanes:a,cachePool:s},t!==null&&dd(e,null),Bm(),gE(e),t!==null&&Qi(t,e,n,!0),e.childLanes=r,null}function pd(t,e){return e=Nd({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function VT(t,e,a){return Rs(e,t.child,null,a),t=pd(e,e.pendingProps),t.flags|=2,Ta(e),e.memoizedState=null,t}function zk(t,e,a){var n=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(ge){if(n.mode==="hidden")return t=pd(e,n),e.lanes=536870912,Tu(null,t);if(qm(e),(t=Qe)?(t=WC(t,za),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Jr!==null?{id:fn,overflow:hn}:null,retryLane:536870912,hydrationErrors:null},a=iE(t),a.return=e,e.child=a,Gt=e,Qe=null)):t=null,t===null)throw Zr(e);return e.lanes=536870912,null}return pd(e,n)}var s=t.memoizedState;if(s!==null){var i=s.dehydrated;if(qm(e),r)if(e.flags&256)e.flags&=-257,e=VT(t,e,a);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(N(558));else if(vt||Qi(t,e,a,!1),r=(a&t.childLanes)!==0,vt||r){if(n=ze,n!==null&&(i=Dw(n,a),i!==0&&i!==s.retryLane))throw s.retryLane=i,Ns(t,i),la(n,t,i),Kg;Bd(),e=VT(t,e,a)}else t=s.treeContext,Qe=Ga(i.nextSibling),Gt=e,ge=!0,Gr=null,za=!1,t!==null&&uE(e,t),e=pd(e,n),e.flags|=4096;return e}return t=Wn(t.child,{mode:n.mode,children:n.children}),t.ref=e.ref,e.child=t,t.return=e,t}function md(t,e){var a=e.ref;if(a===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(N(284));(t===null||t.ref!==a)&&(e.flags|=4194816)}}function Wm(t,e,a,n,r){return xs(e),a=Og(t,e,a,n,void 0,r),n=Mg(),t!==null&&!vt?(Ng(t,e,r),Zn(t,e,r)):(ge&&n&&bg(e),e.flags|=1,zt(t,e,a,r),e.child)}function UT(t,e,a,n,r,s){return xs(e),e.updateQueue=null,a=_E(e,n,a,r),yE(t),n=Mg(),t!==null&&!vt?(Ng(t,e,s),Zn(t,e,s)):(ge&&n&&bg(e),e.flags|=1,zt(t,e,a,s),e.child)}function FT(t,e,a,n,r){if(xs(e),e.stateNode===null){var s=Ei,i=a.contextType;typeof i=="object"&&i!==null&&(s=jt(i)),s=new a(n,s),e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=jm,e.stateNode=s,s._reactInternals=e,s=e.stateNode,s.props=n,s.state=e.memoizedState,s.refs={},kg(e),i=a.contextType,s.context=typeof i=="object"&&i!==null?jt(i):Ei,s.state=e.memoizedState,i=a.getDerivedStateFromProps,typeof i=="function"&&(Zp(e,a,i,n),s.state=e.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(i=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),i!==s.state&&jm.enqueueReplaceState(s,s.state,null),Ru(e,n,s,r),xu(),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308),n=!0}else if(t===null){s=e.stateNode;var u=e.memoizedProps,l=Ds(a,u);s.props=l;var d=s.context,h=a.contextType;i=Ei,typeof h=="object"&&h!==null&&(i=jt(h));var m=a.getDerivedStateFromProps;h=typeof m=="function"||typeof s.getSnapshotBeforeUpdate=="function",u=e.pendingProps!==u,h||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u||d!==i)&&DT(e,s,n,i),Pr=!1;var p=e.memoizedState;s.state=p,Ru(e,n,s,r),xu(),d=e.memoizedState,u||p!==d||Pr?(typeof m=="function"&&(Zp(e,a,m,n),d=e.memoizedState),(l=Pr||kT(e,a,l,n,p,d,i))?(h||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(e.flags|=4194308)):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=n,e.memoizedState=d),s.props=n,s.state=d,s.context=i,n=l):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),n=!1)}else{s=e.stateNode,Um(t,e),i=e.memoizedProps,h=Ds(a,i),s.props=h,m=e.pendingProps,p=s.context,d=a.contextType,l=Ei,typeof d=="object"&&d!==null&&(l=jt(d)),u=a.getDerivedStateFromProps,(d=typeof u=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(i!==m||p!==l)&&DT(e,s,n,l),Pr=!1,p=e.memoizedState,s.state=p,Ru(e,n,s,r),xu();var I=e.memoizedState;i!==m||p!==I||Pr||t!==null&&t.dependencies!==null&&xd(t.dependencies)?(typeof u=="function"&&(Zp(e,a,u,n),I=e.memoizedState),(h=Pr||kT(e,a,h,n,p,I,l)||t!==null&&t.dependencies!==null&&xd(t.dependencies))?(d||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(n,I,l),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(n,I,l)),typeof s.componentDidUpdate=="function"&&(e.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),e.memoizedProps=n,e.memoizedState=I),s.props=n,s.state=I,s.context=l,n=h):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),n=!1)}return s=n,md(t,e),n=(e.flags&128)!==0,s||n?(s=e.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:s.render(),e.flags|=1,t!==null&&n?(e.child=Rs(e,t.child,null,r),e.child=Rs(e,null,a,r)):zt(t,e,a,r),e.memoizedState=s.state,t=e.child):t=Zn(t,e,r),t}function BT(t,e,a,n){return As(),e.flags|=256,zt(t,e,a,n),e.child}var em={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function tm(t){return{baseLanes:t,cachePool:cE()}}function am(t,e,a){return t=t!==null?t.childLanes&~a:0,e&&(t|=Ea),t}function aC(t,e,a){var n=e.pendingProps,r=!1,s=(e.flags&128)!==0,i;if((i=s)||(i=t!==null&&t.memoizedState===null?!1:(ht.current&2)!==0),i&&(r=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(ge){if(r?Mr(e):Nr(e),(t=Qe)?(t=WC(t,za),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Jr!==null?{id:fn,overflow:hn}:null,retryLane:536870912,hydrationErrors:null},a=iE(t),a.return=e,e.child=a,Gt=e,Qe=null)):t=null,t===null)throw Zr(e);return og(t)?e.lanes=32:e.lanes=536870912,null}var u=n.children;return n=n.fallback,r?(Nr(e),r=e.mode,u=Nd({mode:"hidden",children:u},r),n=Es(n,r,a,null),u.return=e,n.return=e,u.sibling=n,e.child=u,n=e.child,n.memoizedState=tm(a),n.childLanes=am(t,i,a),e.memoizedState=em,Tu(null,n)):(Mr(e),Qm(e,u))}var l=t.memoizedState;if(l!==null&&(u=l.dehydrated,u!==null)){if(s)e.flags&256?(Mr(e),e.flags&=-257,e=nm(t,e,a)):e.memoizedState!==null?(Nr(e),e.child=t.child,e.flags|=128,e=null):(Nr(e),u=n.fallback,r=e.mode,n=Nd({mode:"visible",children:n.children},r),u=Es(u,r,a,null),u.flags|=2,n.return=e,u.return=e,n.sibling=u,e.child=n,Rs(e,t.child,null,a),n=e.child,n.memoizedState=tm(a),n.childLanes=am(t,i,a),e.memoizedState=em,e=Tu(null,n));else if(Mr(e),og(u)){if(i=u.nextSibling&&u.nextSibling.dataset,i)var d=i.dgst;i=d,n=Error(N(419)),n.stack="",n.digest=i,zu({value:n,source:null,stack:null}),e=nm(t,e,a)}else if(vt||Qi(t,e,a,!1),i=(a&t.childLanes)!==0,vt||i){if(i=ze,i!==null&&(n=Dw(i,a),n!==0&&n!==l.retryLane))throw l.retryLane=n,Ns(t,n),la(i,t,n),Kg;ig(u)||Bd(),e=nm(t,e,a)}else ig(u)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,Qe=Ga(u.nextSibling),Gt=e,ge=!0,Gr=null,za=!1,t!==null&&uE(e,t),e=Qm(e,n.children),e.flags|=4096);return e}return r?(Nr(e),u=n.fallback,r=e.mode,l=t.child,d=l.sibling,n=Wn(l,{mode:"hidden",children:n.children}),n.subtreeFlags=l.subtreeFlags&65011712,d!==null?u=Wn(d,u):(u=Es(u,r,a,null),u.flags|=2),u.return=e,n.return=e,n.sibling=u,e.child=n,Tu(null,n),n=e.child,u=t.child.memoizedState,u===null?u=tm(a):(r=u.cachePool,r!==null?(l=St._currentValue,r=r.parent!==l?{parent:l,pool:l}:r):r=cE(),u={baseLanes:u.baseLanes|a,cachePool:r}),n.memoizedState=u,n.childLanes=am(t,i,a),e.memoizedState=em,Tu(t.child,n)):(Mr(e),a=t.child,t=a.sibling,a=Wn(a,{mode:"visible",children:n.children}),a.return=e,a.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=a,e.memoizedState=null,a)}function Qm(t,e){return e=Nd({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Nd(t,e){return t=wa(22,t,null,e),t.lanes=0,t}function nm(t,e,a){return Rs(e,t.child,null,a),t=Qm(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function qT(t,e,a){t.lanes|=e;var n=t.alternate;n!==null&&(n.lanes|=e),Mm(t.return,e,a)}function rm(t,e,a,n,r,s){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:r,treeForkCount:s}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=n,i.tail=a,i.tailMode=r,i.treeForkCount=s)}function nC(t,e,a){var n=e.pendingProps,r=n.revealOrder,s=n.tail;n=n.children;var i=ht.current,u=(i&2)!==0;if(u?(i=i&1|2,e.flags|=128):i&=1,Ge(ht,i),zt(t,e,n,a),n=ge?qu:0,!u&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&qT(t,a,e);else if(t.tag===19)qT(t,a,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(a=e.child,r=null;a!==null;)t=a.alternate,t!==null&&Dd(t)===null&&(r=a),a=a.sibling;a=r,a===null?(r=e.child,e.child=null):(r=a.sibling,a.sibling=null),rm(e,!1,r,a,s,n);break;case"backwards":case"unstable_legacy-backwards":for(a=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&Dd(t)===null){e.child=r;break}t=r.sibling,r.sibling=a,a=r,r=t}rm(e,!0,a,null,s,n);break;case"together":rm(e,!1,null,null,void 0,n);break;default:e.memoizedState=null}return e.child}function Zn(t,e,a){if(t!==null&&(e.dependencies=t.dependencies),ts|=e.lanes,!(a&e.childLanes))if(t!==null){if(Qi(t,e,a,!1),(a&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(N(153));if(e.child!==null){for(t=e.child,a=Wn(t,t.pendingProps),e.child=a,a.return=e;t.sibling!==null;)t=t.sibling,a=a.sibling=Wn(t,t.pendingProps),a.return=e;a.sibling=null}return e.child}function Wg(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&xd(t)))}function Hk(t,e,a){switch(e.tag){case 3:Td(e,e.stateNode.containerInfo),Or(e,St,t.memoizedState.cache),As();break;case 27:case 5:Tm(e);break;case 4:Td(e,e.stateNode.containerInfo);break;case 10:Or(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,qm(e),null;break;case 13:var n=e.memoizedState;if(n!==null)return n.dehydrated!==null?(Mr(e),e.flags|=128,null):a&e.child.childLanes?aC(t,e,a):(Mr(e),t=Zn(t,e,a),t!==null?t.sibling:null);Mr(e);break;case 19:var r=(t.flags&128)!==0;if(n=(a&e.childLanes)!==0,n||(Qi(t,e,a,!1),n=(a&e.childLanes)!==0),r){if(n)return nC(t,e,a);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Ge(ht,ht.current),n)break;return null;case 22:return e.lanes=0,tC(t,e,a,e.pendingProps);case 24:Or(e,St,t.memoizedState.cache)}return Zn(t,e,a)}function rC(t,e,a){if(t!==null)if(t.memoizedProps!==e.pendingProps)vt=!0;else{if(!Wg(t,a)&&!(e.flags&128))return vt=!1,Hk(t,e,a);vt=!!(t.flags&131072)}else vt=!1,ge&&e.flags&1048576&&oE(e,qu,e.index);switch(e.lanes=0,e.tag){case 16:e:{var n=e.pendingProps;if(t=vs(e.elementType),e.type=t,typeof t=="function")Cg(t)?(n=Ds(t,n),e.tag=1,e=FT(null,e,t,n,a)):(e.tag=0,e=Wm(null,e,t,n,a));else{if(t!=null){var r=t.$$typeof;if(r===dg){e.tag=11,e=OT(null,e,t,n,a);break e}else if(r===fg){e.tag=14,e=MT(null,e,t,n,a);break e}}throw e=Sm(t)||t,Error(N(306,e,""))}}return e;case 0:return Wm(t,e,e.type,e.pendingProps,a);case 1:return n=e.type,r=Ds(n,e.pendingProps),FT(t,e,n,r,a);case 3:e:{if(Td(e,e.stateNode.containerInfo),t===null)throw Error(N(387));n=e.pendingProps;var s=e.memoizedState;r=s.element,Um(t,e),Ru(e,n,null,a);var i=e.memoizedState;if(n=i.cache,Or(e,St,n),n!==s.cache&&Nm(e,[St],a,!0),xu(),n=i.element,s.isDehydrated)if(s={element:n,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){e=BT(t,e,n,a);break e}else if(n!==r){r=qa(Error(N(424)),e),zu(r),e=BT(t,e,n,a);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(Qe=Ga(t.firstChild),Gt=e,ge=!0,Gr=null,za=!0,a=hE(e,null,n,a),e.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling}else{if(As(),n===r){e=Zn(t,e,a);break e}zt(t,e,n,a)}e=e.child}return e;case 26:return md(t,e),t===null?(a=lw(e.type,null,e.pendingProps,null))?e.memoizedState=a:ge||(a=e.type,t=e.pendingProps,n=Gd(Hr.current).createElement(a),n[Ht]=e,n[ca]=t,Kt(n,a,t),Mt(n),e.stateNode=n):e.memoizedState=lw(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return Tm(e),t===null&&ge&&(n=e.stateNode=QC(e.type,e.pendingProps,Hr.current),Gt=e,za=!0,r=Qe,ns(e.type)?(ug=r,Qe=Ga(n.firstChild)):Qe=r),zt(t,e,e.pendingProps.children,a),md(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&ge&&((r=n=Qe)&&(n=yD(n,e.type,e.pendingProps,za),n!==null?(e.stateNode=n,Gt=e,Qe=Ga(n.firstChild),za=!1,r=!0):r=!1),r||Zr(e)),Tm(e),r=e.type,s=e.pendingProps,i=t!==null?t.memoizedProps:null,n=s.children,rg(r,s)?n=null:i!==null&&rg(r,i)&&(e.flags|=32),e.memoizedState!==null&&(r=Og(t,e,Ok,null,null,a),Qu._currentValue=r),md(t,e),zt(t,e,n,a),e.child;case 6:return t===null&&ge&&((t=a=Qe)&&(a=_D(a,e.pendingProps,za),a!==null?(e.stateNode=a,Gt=e,Qe=null,t=!0):t=!1),t||Zr(e)),null;case 13:return aC(t,e,a);case 4:return Td(e,e.stateNode.containerInfo),n=e.pendingProps,t===null?e.child=Rs(e,null,n,a):zt(t,e,n,a),e.child;case 11:return OT(t,e,e.type,e.pendingProps,a);case 7:return zt(t,e,e.pendingProps,a),e.child;case 8:return zt(t,e,e.pendingProps.children,a),e.child;case 12:return zt(t,e,e.pendingProps.children,a),e.child;case 10:return n=e.pendingProps,Or(e,e.type,n.value),zt(t,e,n.children,a),e.child;case 9:return r=e.type._context,n=e.pendingProps.children,xs(e),r=jt(r),n=n(r),e.flags|=1,zt(t,e,n,a),e.child;case 14:return MT(t,e,e.type,e.pendingProps,a);case 15:return eC(t,e,e.type,e.pendingProps,a);case 19:return nC(t,e,a);case 31:return zk(t,e,a);case 22:return tC(t,e,a,e.pendingProps);case 24:return xs(e),n=jt(St),t===null?(r=xg(),r===null&&(r=ze,s=Ag(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=a),r=s),e.memoizedState={parent:n,cache:r},kg(e),Or(e,St,r)):(t.lanes&a&&(Um(t,e),Ru(e,null,null,a),xu()),r=t.memoizedState,s=e.memoizedState,r.parent!==n?(r={parent:n,cache:n},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),Or(e,St,n)):(n=s.cache,Or(e,St,n),n!==r.cache&&Nm(e,[St],a,!0))),zt(t,e,e.pendingProps.children,a),e.child;case 29:throw e.pendingProps}throw Error(N(156,e.tag))}function Un(t){t.flags|=4}function sm(t,e,a,n,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(AC())t.flags|=8192;else throw bs=Rd,Rg}else t.flags&=-16777217}function zT(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!$C(e))if(AC())t.flags|=8192;else throw bs=Rd,Rg}function Zc(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?xw():536870912,t.lanes|=e,qi|=e)}function mu(t,e){if(!ge)switch(t.tailMode){case"hidden":e=t.tail;for(var a=null;e!==null;)e.alternate!==null&&(a=e),e=e.sibling;a===null?t.tail=null:a.sibling=null;break;case"collapsed":a=t.tail;for(var n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:n.sibling=null}}function We(t){var e=t.alternate!==null&&t.alternate.child===t.child,a=0,n=0;if(e)for(var r=t.child;r!==null;)a|=r.lanes|r.childLanes,n|=r.subtreeFlags&65011712,n|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)a|=r.lanes|r.childLanes,n|=r.subtreeFlags,n|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=n,t.childLanes=a,e}function Gk(t,e,a){var n=e.pendingProps;switch(Lg(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return We(e),null;case 1:return We(e),null;case 3:return a=e.stateNode,n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),Qn(St),Mi(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(t===null||t.child===null)&&(fi(e)?Un(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Yp())),We(e),null;case 26:var r=e.type,s=e.memoizedState;return t===null?(Un(e),s!==null?(We(e),zT(e,s)):(We(e),sm(e,r,null,n,a))):s?s!==t.memoizedState?(Un(e),We(e),zT(e,s)):(We(e),e.flags&=-16777217):(t=t.memoizedProps,t!==n&&Un(e),We(e),sm(e,r,t,n,a)),null;case 27:if(wd(e),a=Hr.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==n&&Un(e);else{if(!n){if(e.stateNode===null)throw Error(N(166));return We(e),null}t=mn.current,fi(e)?yT(e,t):(t=QC(r,n,a),e.stateNode=t,Un(e))}return We(e),null;case 5:if(wd(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==n&&Un(e);else{if(!n){if(e.stateNode===null)throw Error(N(166));return We(e),null}if(s=mn.current,fi(e))yT(e,s);else{var i=Gd(Hr.current);switch(s){case 1:s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=i.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof n.is=="string"?i.createElement("select",{is:n.is}):i.createElement("select"),n.multiple?s.multiple=!0:n.size&&(s.size=n.size);break;default:s=typeof n.is=="string"?i.createElement(r,{is:n.is}):i.createElement(r)}}s[Ht]=e,s[ca]=n;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)s.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=s;e:switch(Kt(s,r,n),r){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&Un(e)}}return We(e),sm(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,a),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==n&&Un(e);else{if(typeof n!="string"&&e.stateNode===null)throw Error(N(166));if(t=Hr.current,fi(e)){if(t=e.stateNode,a=e.memoizedProps,n=null,r=Gt,r!==null)switch(r.tag){case 27:case 5:n=r.memoizedProps}t[Ht]=e,t=!!(t.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||GC(t.nodeValue,a)),t||Zr(e,!0)}else t=Gd(t).createTextNode(n),t[Ht]=e,e.stateNode=t}return We(e),null;case 31:if(a=e.memoizedState,t===null||t.memoizedState!==null){if(n=fi(e),a!==null){if(t===null){if(!n)throw Error(N(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(N(557));t[Ht]=e}else As(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;We(e),t=!1}else a=Yp(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=a),t=!0;if(!t)return e.flags&256?(Ta(e),e):(Ta(e),null);if(e.flags&128)throw Error(N(558))}return We(e),null;case 13:if(n=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=fi(e),n!==null&&n.dehydrated!==null){if(t===null){if(!r)throw Error(N(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(N(317));r[Ht]=e}else As(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;We(e),r=!1}else r=Yp(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(Ta(e),e):(Ta(e),null)}return Ta(e),e.flags&128?(e.lanes=a,e):(a=n!==null,t=t!==null&&t.memoizedState!==null,a&&(n=e.child,r=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(r=n.alternate.memoizedState.cachePool.pool),s=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(s=n.memoizedState.cachePool.pool),s!==r&&(n.flags|=2048)),a!==t&&a&&(e.child.flags|=8192),Zc(e,e.updateQueue),We(e),null);case 4:return Mi(),t===null&&ey(e.stateNode.containerInfo),We(e),null;case 10:return Qn(e.type),We(e),null;case 19:if(Nt(ht),n=e.memoizedState,n===null)return We(e),null;if(r=(e.flags&128)!==0,s=n.rendering,s===null)if(r)mu(n,!1);else{if(ct!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(s=Dd(t),s!==null){for(e.flags|=128,mu(n,!1),t=s.updateQueue,e.updateQueue=t,Zc(e,t),e.subtreeFlags=0,t=a,a=e.child;a!==null;)sE(a,t),a=a.sibling;return Ge(ht,ht.current&1|2),ge&&zn(e,n.treeForkCount),e.child}t=t.sibling}n.tail!==null&&Ca()>Ud&&(e.flags|=128,r=!0,mu(n,!1),e.lanes=4194304)}else{if(!r)if(t=Dd(s),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Zc(e,t),mu(n,!0),n.tail===null&&n.tailMode==="hidden"&&!s.alternate&&!ge)return We(e),null}else 2*Ca()-n.renderingStartTime>Ud&&a!==536870912&&(e.flags|=128,r=!0,mu(n,!1),e.lanes=4194304);n.isBackwards?(s.sibling=e.child,e.child=s):(t=n.last,t!==null?t.sibling=s:e.child=s,n.last=s)}return n.tail!==null?(t=n.tail,n.rendering=t,n.tail=t.sibling,n.renderingStartTime=Ca(),t.sibling=null,a=ht.current,Ge(ht,r?a&1|2:a&1),ge&&zn(e,n.treeForkCount),t):(We(e),null);case 22:case 23:return Ta(e),Dg(),n=e.memoizedState!==null,t!==null?t.memoizedState!==null!==n&&(e.flags|=8192):n&&(e.flags|=8192),n?a&536870912&&!(e.flags&128)&&(We(e),e.subtreeFlags&6&&(e.flags|=8192)):We(e),a=e.updateQueue,a!==null&&Zc(e,a.retryQueue),a=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),n=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),n!==a&&(e.flags|=2048),t!==null&&Nt(Cs),null;case 24:return a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),Qn(St),We(e),null;case 25:return null;case 30:return null}throw Error(N(156,e.tag))}function jk(t,e){switch(Lg(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Qn(St),Mi(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return wd(e),null;case 31:if(e.memoizedState!==null){if(Ta(e),e.alternate===null)throw Error(N(340));As()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(Ta(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(N(340));As()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Nt(ht),null;case 4:return Mi(),null;case 10:return Qn(e.type),null;case 22:case 23:return Ta(e),Dg(),t!==null&&Nt(Cs),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Qn(St),null;case 25:return null;default:return null}}function sC(t,e){switch(Lg(e),e.tag){case 3:Qn(St),Mi();break;case 26:case 27:case 5:wd(e);break;case 4:Mi();break;case 31:e.memoizedState!==null&&Ta(e);break;case 13:Ta(e);break;case 19:Nt(ht);break;case 10:Qn(e.type);break;case 22:case 23:Ta(e),Dg(),t!==null&&Nt(Cs);break;case 24:Qn(St)}}function sl(t,e){try{var a=e.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var r=n.next;a=r;do{if((a.tag&t)===t){n=void 0;var s=a.create,i=a.inst;n=s(),i.destroy=n}a=a.next}while(a!==r)}}catch(u){Oe(e,e.return,u)}}function es(t,e,a){try{var n=e.updateQueue,r=n!==null?n.lastEffect:null;if(r!==null){var s=r.next;n=s;do{if((n.tag&t)===t){var i=n.inst,u=i.destroy;if(u!==void 0){i.destroy=void 0,r=e;var l=a,d=u;try{d()}catch(h){Oe(r,l,h)}}}n=n.next}while(n!==s)}}catch(h){Oe(e,e.return,h)}}function iC(t){var e=t.updateQueue;if(e!==null){var a=t.stateNode;try{mE(e,a)}catch(n){Oe(t,t.return,n)}}}function oC(t,e,a){a.props=Ds(t.type,t.memoizedProps),a.state=t.memoizedState;try{a.componentWillUnmount()}catch(n){Oe(t,e,n)}}function Du(t,e){try{var a=t.ref;if(a!==null){switch(t.tag){case 26:case 27:case 5:var n=t.stateNode;break;case 30:n=t.stateNode;break;default:n=t.stateNode}typeof a=="function"?t.refCleanup=a(n):a.current=n}}catch(r){Oe(t,e,r)}}function pn(t,e){var a=t.ref,n=t.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(r){Oe(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){Oe(t,e,r)}else a.current=null}function uC(t){var e=t.type,a=t.memoizedProps,n=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(r){Oe(t,t.return,r)}}function im(t,e,a){try{var n=t.stateNode;dD(n,t.type,a,e),n[ca]=e}catch(r){Oe(t,t.return,r)}}function lC(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&ns(t.type)||t.tag===4}function om(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||lC(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&ns(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Xm(t,e,a){var n=t.tag;if(n===5||n===6)t=t.stateNode,e?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(t,e):(e=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,e.appendChild(t),a=a._reactRootContainer,a!=null||e.onclick!==null||(e.onclick=jn));else if(n!==4&&(n===27&&ns(t.type)&&(a=t.stateNode,e=null),t=t.child,t!==null))for(Xm(t,e,a),t=t.sibling;t!==null;)Xm(t,e,a),t=t.sibling}function Vd(t,e,a){var n=t.tag;if(n===5||n===6)t=t.stateNode,e?a.insertBefore(t,e):a.appendChild(t);else if(n!==4&&(n===27&&ns(t.type)&&(a=t.stateNode),t=t.child,t!==null))for(Vd(t,e,a),t=t.sibling;t!==null;)Vd(t,e,a),t=t.sibling}function cC(t){var e=t.stateNode,a=t.memoizedProps;try{for(var n=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);Kt(e,n,a),e[Ht]=t,e[ca]=a}catch(s){Oe(t,t.return,s)}}var Hn=!1,It=!1,um=!1,HT=typeof WeakSet=="function"?WeakSet:Set,Ot=null;function Kk(t,e){if(t=t.containerInfo,ag=Qd,t=$w(t),Tg(t)){if("selectionStart"in t)var a={start:t.selectionStart,end:t.selectionEnd};else e:{a=(a=t.ownerDocument)&&a.defaultView||window;var n=a.getSelection&&a.getSelection();if(n&&n.rangeCount!==0){a=n.anchorNode;var r=n.anchorOffset,s=n.focusNode;n=n.focusOffset;try{a.nodeType,s.nodeType}catch{a=null;break e}var i=0,u=-1,l=-1,d=0,h=0,m=t,p=null;t:for(;;){for(var I;m!==a||r!==0&&m.nodeType!==3||(u=i+r),m!==s||n!==0&&m.nodeType!==3||(l=i+n),m.nodeType===3&&(i+=m.nodeValue.length),(I=m.firstChild)!==null;)p=m,m=I;for(;;){if(m===t)break t;if(p===a&&++d===r&&(u=i),p===s&&++h===n&&(l=i),(I=m.nextSibling)!==null)break;m=p,p=m.parentNode}m=I}a=u===-1||l===-1?null:{start:u,end:l}}else a=null}a=a||{start:0,end:0}}else a=null;for(ng={focusedElem:t,selectionRange:a},Qd=!1,Ot=e;Ot!==null;)if(e=Ot,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Ot=t;else for(;Ot!==null;){switch(e=Ot,s=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(a=0;a<t.length;a++)r=t[a],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&s!==null){t=void 0,a=e,r=s.memoizedProps,s=s.memoizedState,n=a.stateNode;try{var L=Ds(a.type,r);t=n.getSnapshotBeforeUpdate(L,s),n.__reactInternalSnapshotBeforeUpdate=t}catch(k){Oe(a,a.return,k)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,a=t.nodeType,a===9)sg(t);else if(a===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":sg(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(N(163))}if(t=e.sibling,t!==null){t.return=e.return,Ot=t;break}Ot=e.return}}function dC(t,e,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:Bn(t,a),n&4&&sl(5,a);break;case 1:if(Bn(t,a),n&4)if(t=a.stateNode,e===null)try{t.componentDidMount()}catch(i){Oe(a,a.return,i)}else{var r=Ds(a.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){Oe(a,a.return,i)}}n&64&&iC(a),n&512&&Du(a,a.return);break;case 3:if(Bn(t,a),n&64&&(t=a.updateQueue,t!==null)){if(e=null,a.child!==null)switch(a.child.tag){case 27:case 5:e=a.child.stateNode;break;case 1:e=a.child.stateNode}try{mE(t,e)}catch(i){Oe(a,a.return,i)}}break;case 27:e===null&&n&4&&cC(a);case 26:case 5:Bn(t,a),e===null&&n&4&&uC(a),n&512&&Du(a,a.return);break;case 12:Bn(t,a);break;case 31:Bn(t,a),n&4&&pC(t,a);break;case 13:Bn(t,a),n&4&&mC(t,a),n&64&&(t=a.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(a=tD.bind(null,a),ID(t,a))));break;case 22:if(n=a.memoizedState!==null||Hn,!n){e=e!==null&&e.memoizedState!==null||It,r=Hn;var s=It;Hn=n,(It=e)&&!s?qn(t,a,(a.subtreeFlags&8772)!==0):Bn(t,a),Hn=r,It=s}break;case 30:break;default:Bn(t,a)}}function fC(t){var e=t.alternate;e!==null&&(t.alternate=null,fC(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&gg(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var Ze=null,oa=!1;function Fn(t,e,a){for(a=a.child;a!==null;)hC(t,e,a),a=a.sibling}function hC(t,e,a){if(ba&&typeof ba.onCommitFiberUnmount=="function")try{ba.onCommitFiberUnmount(Ju,a)}catch{}switch(a.tag){case 26:It||pn(a,e),Fn(t,e,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:It||pn(a,e);var n=Ze,r=oa;ns(a.type)&&(Ze=a.stateNode,oa=!1),Fn(t,e,a),Nu(a.stateNode),Ze=n,oa=r;break;case 5:It||pn(a,e);case 6:if(n=Ze,r=oa,Ze=null,Fn(t,e,a),Ze=n,oa=r,Ze!==null)if(oa)try{(Ze.nodeType===9?Ze.body:Ze.nodeName==="HTML"?Ze.ownerDocument.body:Ze).removeChild(a.stateNode)}catch(s){Oe(a,e,s)}else try{Ze.removeChild(a.stateNode)}catch(s){Oe(a,e,s)}break;case 18:Ze!==null&&(oa?(t=Ze,rw(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,a.stateNode),ji(t)):rw(Ze,a.stateNode));break;case 4:n=Ze,r=oa,Ze=a.stateNode.containerInfo,oa=!0,Fn(t,e,a),Ze=n,oa=r;break;case 0:case 11:case 14:case 15:es(2,a,e),It||es(4,a,e),Fn(t,e,a);break;case 1:It||(pn(a,e),n=a.stateNode,typeof n.componentWillUnmount=="function"&&oC(a,e,n)),Fn(t,e,a);break;case 21:Fn(t,e,a);break;case 22:It=(n=It)||a.memoizedState!==null,Fn(t,e,a),It=n;break;default:Fn(t,e,a)}}function pC(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{ji(t)}catch(a){Oe(e,e.return,a)}}}function mC(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{ji(t)}catch(a){Oe(e,e.return,a)}}function Wk(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new HT),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new HT),e;default:throw Error(N(435,t.tag))}}function ed(t,e){var a=Wk(t);e.forEach(function(n){if(!a.has(n)){a.add(n);var r=aD.bind(null,t,n);n.then(r,r)}})}function sa(t,e){var a=e.deletions;if(a!==null)for(var n=0;n<a.length;n++){var r=a[n],s=t,i=e,u=i;e:for(;u!==null;){switch(u.tag){case 27:if(ns(u.type)){Ze=u.stateNode,oa=!1;break e}break;case 5:Ze=u.stateNode,oa=!1;break e;case 3:case 4:Ze=u.stateNode.containerInfo,oa=!0;break e}u=u.return}if(Ze===null)throw Error(N(160));hC(s,i,r),Ze=null,oa=!1,s=r.alternate,s!==null&&(s.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)gC(e,t),e=e.sibling}var Za=null;function gC(t,e){var a=t.alternate,n=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:sa(e,t),ia(t),n&4&&(es(3,t,t.return),sl(3,t),es(5,t,t.return));break;case 1:sa(e,t),ia(t),n&512&&(It||a===null||pn(a,a.return)),n&64&&Hn&&(t=t.updateQueue,t!==null&&(n=t.callbacks,n!==null&&(a=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=a===null?n:a.concat(n))));break;case 26:var r=Za;if(sa(e,t),ia(t),n&512&&(It||a===null||pn(a,a.return)),n&4){var s=a!==null?a.memoizedState:null;if(n=t.memoizedState,a===null)if(n===null)if(t.stateNode===null){e:{n=t.type,a=t.memoizedProps,r=r.ownerDocument||r;t:switch(n){case"title":s=r.getElementsByTagName("title")[0],(!s||s[tl]||s[Ht]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=r.createElement(n),r.head.insertBefore(s,r.querySelector("head > title"))),Kt(s,n,a),s[Ht]=t,Mt(s),n=s;break e;case"link":var i=dw("link","href",r).get(n+(a.href||""));if(i){for(var u=0;u<i.length;u++)if(s=i[u],s.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&s.getAttribute("rel")===(a.rel==null?null:a.rel)&&s.getAttribute("title")===(a.title==null?null:a.title)&&s.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){i.splice(u,1);break t}}s=r.createElement(n),Kt(s,n,a),r.head.appendChild(s);break;case"meta":if(i=dw("meta","content",r).get(n+(a.content||""))){for(u=0;u<i.length;u++)if(s=i[u],s.getAttribute("content")===(a.content==null?null:""+a.content)&&s.getAttribute("name")===(a.name==null?null:a.name)&&s.getAttribute("property")===(a.property==null?null:a.property)&&s.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&s.getAttribute("charset")===(a.charSet==null?null:a.charSet)){i.splice(u,1);break t}}s=r.createElement(n),Kt(s,n,a),r.head.appendChild(s);break;default:throw Error(N(468,n))}s[Ht]=t,Mt(s),n=s}t.stateNode=n}else fw(r,t.type,t.stateNode);else t.stateNode=cw(r,n,t.memoizedProps);else s!==n?(s===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):s.count--,n===null?fw(r,t.type,t.stateNode):cw(r,n,t.memoizedProps)):n===null&&t.stateNode!==null&&im(t,t.memoizedProps,a.memoizedProps)}break;case 27:sa(e,t),ia(t),n&512&&(It||a===null||pn(a,a.return)),a!==null&&n&4&&im(t,t.memoizedProps,a.memoizedProps);break;case 5:if(sa(e,t),ia(t),n&512&&(It||a===null||pn(a,a.return)),t.flags&32){r=t.stateNode;try{Vi(r,"")}catch(L){Oe(t,t.return,L)}}n&4&&t.stateNode!=null&&(r=t.memoizedProps,im(t,r,a!==null?a.memoizedProps:r)),n&1024&&(um=!0);break;case 6:if(sa(e,t),ia(t),n&4){if(t.stateNode===null)throw Error(N(162));n=t.memoizedProps,a=t.stateNode;try{a.nodeValue=n}catch(L){Oe(t,t.return,L)}}break;case 3:if(_d=null,r=Za,Za=jd(e.containerInfo),sa(e,t),Za=r,ia(t),n&4&&a!==null&&a.memoizedState.isDehydrated)try{ji(e.containerInfo)}catch(L){Oe(t,t.return,L)}um&&(um=!1,yC(t));break;case 4:n=Za,Za=jd(t.stateNode.containerInfo),sa(e,t),ia(t),Za=n;break;case 12:sa(e,t),ia(t);break;case 31:sa(e,t),ia(t),n&4&&(n=t.updateQueue,n!==null&&(t.updateQueue=null,ed(t,n)));break;case 13:sa(e,t),ia(t),t.child.flags&8192&&t.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(uf=Ca()),n&4&&(n=t.updateQueue,n!==null&&(t.updateQueue=null,ed(t,n)));break;case 22:r=t.memoizedState!==null;var l=a!==null&&a.memoizedState!==null,d=Hn,h=It;if(Hn=d||r,It=h||l,sa(e,t),It=h,Hn=d,ia(t),n&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(a===null||l||Hn||It||Ts(t)),a=null,e=t;;){if(e.tag===5||e.tag===26){if(a===null){l=a=e;try{if(s=l.stateNode,r)i=s.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{u=l.stateNode;var m=l.memoizedProps.style,p=m!=null&&m.hasOwnProperty("display")?m.display:null;u.style.display=p==null||typeof p=="boolean"?"":(""+p).trim()}}catch(L){Oe(l,l.return,L)}}}else if(e.tag===6){if(a===null){l=e;try{l.stateNode.nodeValue=r?"":l.memoizedProps}catch(L){Oe(l,l.return,L)}}}else if(e.tag===18){if(a===null){l=e;try{var I=l.stateNode;r?sw(I,!0):sw(l.stateNode,!1)}catch(L){Oe(l,l.return,L)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;a===e&&(a=null),e=e.return}a===e&&(a=null),e.sibling.return=e.return,e=e.sibling}n&4&&(n=t.updateQueue,n!==null&&(a=n.retryQueue,a!==null&&(n.retryQueue=null,ed(t,a))));break;case 19:sa(e,t),ia(t),n&4&&(n=t.updateQueue,n!==null&&(t.updateQueue=null,ed(t,n)));break;case 30:break;case 21:break;default:sa(e,t),ia(t)}}function ia(t){var e=t.flags;if(e&2){try{for(var a,n=t.return;n!==null;){if(lC(n)){a=n;break}n=n.return}if(a==null)throw Error(N(160));switch(a.tag){case 27:var r=a.stateNode,s=om(t);Vd(t,s,r);break;case 5:var i=a.stateNode;a.flags&32&&(Vi(i,""),a.flags&=-33);var u=om(t);Vd(t,u,i);break;case 3:case 4:var l=a.stateNode.containerInfo,d=om(t);Xm(t,d,l);break;default:throw Error(N(161))}}catch(h){Oe(t,t.return,h)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function yC(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;yC(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function Bn(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)dC(t,e.alternate,e),e=e.sibling}function Ts(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:es(4,e,e.return),Ts(e);break;case 1:pn(e,e.return);var a=e.stateNode;typeof a.componentWillUnmount=="function"&&oC(e,e.return,a),Ts(e);break;case 27:Nu(e.stateNode);case 26:case 5:pn(e,e.return),Ts(e);break;case 22:e.memoizedState===null&&Ts(e);break;case 30:Ts(e);break;default:Ts(e)}t=t.sibling}}function qn(t,e,a){for(a=a&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var n=e.alternate,r=t,s=e,i=s.flags;switch(s.tag){case 0:case 11:case 15:qn(r,s,a),sl(4,s);break;case 1:if(qn(r,s,a),n=s,r=n.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(d){Oe(n,n.return,d)}if(n=s,r=n.updateQueue,r!==null){var u=n.stateNode;try{var l=r.shared.hiddenCallbacks;if(l!==null)for(r.shared.hiddenCallbacks=null,r=0;r<l.length;r++)pE(l[r],u)}catch(d){Oe(n,n.return,d)}}a&&i&64&&iC(s),Du(s,s.return);break;case 27:cC(s);case 26:case 5:qn(r,s,a),a&&n===null&&i&4&&uC(s),Du(s,s.return);break;case 12:qn(r,s,a);break;case 31:qn(r,s,a),a&&i&4&&pC(r,s);break;case 13:qn(r,s,a),a&&i&4&&mC(r,s);break;case 22:s.memoizedState===null&&qn(r,s,a),Du(s,s.return);break;case 30:break;default:qn(r,s,a)}e=e.sibling}}function Qg(t,e){var a=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==a&&(t!=null&&t.refCount++,a!=null&&nl(a))}function Xg(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&nl(t))}function Ja(t,e,a,n){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)_C(t,e,a,n),e=e.sibling}function _C(t,e,a,n){var r=e.flags;switch(e.tag){case 0:case 11:case 15:Ja(t,e,a,n),r&2048&&sl(9,e);break;case 1:Ja(t,e,a,n);break;case 3:Ja(t,e,a,n),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&nl(t)));break;case 12:if(r&2048){Ja(t,e,a,n),t=e.stateNode;try{var s=e.memoizedProps,i=s.id,u=s.onPostCommit;typeof u=="function"&&u(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){Oe(e,e.return,l)}}else Ja(t,e,a,n);break;case 31:Ja(t,e,a,n);break;case 13:Ja(t,e,a,n);break;case 23:break;case 22:s=e.stateNode,i=e.alternate,e.memoizedState!==null?s._visibility&2?Ja(t,e,a,n):Pu(t,e):s._visibility&2?Ja(t,e,a,n):(s._visibility|=2,pi(t,e,a,n,(e.subtreeFlags&10256)!==0||!1)),r&2048&&Qg(i,e);break;case 24:Ja(t,e,a,n),r&2048&&Xg(e.alternate,e);break;default:Ja(t,e,a,n)}}function pi(t,e,a,n,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var s=t,i=e,u=a,l=n,d=i.flags;switch(i.tag){case 0:case 11:case 15:pi(s,i,u,l,r),sl(8,i);break;case 23:break;case 22:var h=i.stateNode;i.memoizedState!==null?h._visibility&2?pi(s,i,u,l,r):Pu(s,i):(h._visibility|=2,pi(s,i,u,l,r)),r&&d&2048&&Qg(i.alternate,i);break;case 24:pi(s,i,u,l,r),r&&d&2048&&Xg(i.alternate,i);break;default:pi(s,i,u,l,r)}e=e.sibling}}function Pu(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var a=t,n=e,r=n.flags;switch(n.tag){case 22:Pu(a,n),r&2048&&Qg(n.alternate,n);break;case 24:Pu(a,n),r&2048&&Xg(n.alternate,n);break;default:Pu(a,n)}e=e.sibling}}var wu=8192;function hi(t,e,a){if(t.subtreeFlags&wu)for(t=t.child;t!==null;)IC(t,e,a),t=t.sibling}function IC(t,e,a){switch(t.tag){case 26:hi(t,e,a),t.flags&wu&&t.memoizedState!==null&&kD(a,Za,t.memoizedState,t.memoizedProps);break;case 5:hi(t,e,a);break;case 3:case 4:var n=Za;Za=jd(t.stateNode.containerInfo),hi(t,e,a),Za=n;break;case 22:t.memoizedState===null&&(n=t.alternate,n!==null&&n.memoizedState!==null?(n=wu,wu=16777216,hi(t,e,a),wu=n):hi(t,e,a));break;default:hi(t,e,a)}}function SC(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function gu(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var a=0;a<e.length;a++){var n=e[a];Ot=n,TC(n,t)}SC(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)vC(t),t=t.sibling}function vC(t){switch(t.tag){case 0:case 11:case 15:gu(t),t.flags&2048&&es(9,t,t.return);break;case 3:gu(t);break;case 12:gu(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,gd(t)):gu(t);break;default:gu(t)}}function gd(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var a=0;a<e.length;a++){var n=e[a];Ot=n,TC(n,t)}SC(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:es(8,e,e.return),gd(e);break;case 22:a=e.stateNode,a._visibility&2&&(a._visibility&=-3,gd(e));break;default:gd(e)}t=t.sibling}}function TC(t,e){for(;Ot!==null;){var a=Ot;switch(a.tag){case 0:case 11:case 15:es(8,a,e);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:nl(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,Ot=n;else e:for(a=t;Ot!==null;){n=Ot;var r=n.sibling,s=n.return;if(fC(n),n===a){Ot=null;break e}if(r!==null){r.return=s,Ot=r;break e}Ot=s}}}var Qk={getCacheForType:function(t){var e=jt(St),a=e.data.get(t);return a===void 0&&(a=t(),e.data.set(t,a)),a},cacheSignal:function(){return jt(St).controller.signal}},Xk=typeof WeakMap=="function"?WeakMap:Map,be=0,ze=null,he=null,me=0,Pe=0,va=null,Br=!1,Yi=!1,Yg=!1,er=0,ct=0,ts=0,Ls=0,$g=0,Ea=0,qi=0,Ou=null,ua=null,Ym=!1,uf=0,wC=0,Ud=1/0,Fd=null,Wr=null,At=0,Qr=null,zi=null,Xn=0,$m=0,Jm=null,EC=null,Mu=0,Zm=null;function Aa(){return be&2&&me!==0?me&-me:re.T!==null?Zg():Pw()}function CC(){if(Ea===0)if(!(me&536870912)||ge){var t=Gc;Gc<<=1,!(Gc&3932160)&&(Gc=262144),Ea=t}else Ea=536870912;return t=Ra.current,t!==null&&(t.flags|=32),Ea}function la(t,e,a){(t===ze&&(Pe===2||Pe===9)||t.cancelPendingCommit!==null)&&(Hi(t,0),qr(t,me,Ea,!1)),el(t,a),(!(be&2)||t!==ze)&&(t===ze&&(!(be&2)&&(Ls|=a),ct===4&&qr(t,me,Ea,!1)),yn(t))}function bC(t,e,a){if(be&6)throw Error(N(327));var n=!a&&(e&127)===0&&(e&t.expiredLanes)===0||Zu(t,e),r=n?Jk(t,e):lm(t,e,!0),s=n;do{if(r===0){Yi&&!n&&qr(t,e,0,!1);break}else{if(a=t.current.alternate,s&&!Yk(a)){r=lm(t,e,!1),s=!1;continue}if(r===2){if(s=e,t.errorRecoveryDisabledLanes&s)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var u=t;r=Ou;var l=u.current.memoizedState.isDehydrated;if(l&&(Hi(u,i).flags|=256),i=lm(u,i,!1),i!==2){if(Yg&&!l){u.errorRecoveryDisabledLanes|=s,Ls|=s,r=4;break e}s=ua,ua=r,s!==null&&(ua===null?ua=s:ua.push.apply(ua,s))}r=i}if(s=!1,r!==2)continue}}if(r===1){Hi(t,0),qr(t,e,0,!0);break}e:{switch(n=t,s=r,s){case 0:case 1:throw Error(N(345));case 4:if((e&4194048)!==e)break;case 6:qr(n,e,Ea,!Br);break e;case 2:ua=null;break;case 3:case 5:break;default:throw Error(N(329))}if((e&62914560)===e&&(r=uf+300-Ca(),10<r)){if(qr(n,e,Ea,!Br),Yd(n,0,!0)!==0)break e;Xn=e,n.timeoutHandle=KC(GT.bind(null,n,a,ua,Fd,Ym,e,Ea,Ls,qi,Br,s,"Throttled",-0,0),r);break e}GT(n,a,ua,Fd,Ym,e,Ea,Ls,qi,Br,s,null,-0,0)}}break}while(!0);yn(t)}function GT(t,e,a,n,r,s,i,u,l,d,h,m,p,I){if(t.timeoutHandle=-1,m=e.subtreeFlags,m&8192||(m&16785408)===16785408){m={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:jn},IC(e,s,m);var L=(s&62914560)===s?uf-Ca():(s&4194048)===s?wC-Ca():0;if(L=DD(m,L),L!==null){Xn=s,t.cancelPendingCommit=L(KT.bind(null,t,e,s,a,n,r,i,u,l,h,m,null,p,I)),qr(t,s,i,!d);return}}KT(t,e,s,a,n,r,i,u,l)}function Yk(t){for(var e=t;;){var a=e.tag;if((a===0||a===11||a===15)&&e.flags&16384&&(a=e.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var r=a[n],s=r.getSnapshot;r=r.value;try{if(!xa(s(),r))return!1}catch{return!1}}if(a=e.child,e.subtreeFlags&16384&&a!==null)a.return=e,e=a;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function qr(t,e,a,n){e&=~$g,e&=~Ls,t.suspendedLanes|=e,t.pingedLanes&=~e,n&&(t.warmLanes|=e),n=t.expirationTimes;for(var r=e;0<r;){var s=31-La(r),i=1<<s;n[s]=-1,r&=~i}a!==0&&Rw(t,a,e)}function lf(){return be&6?!0:(il(0,!1),!1)}function Jg(){if(he!==null){if(Pe===0)var t=he.return;else t=he,Kn=Vs=null,Vg(t),Di=null,Hu=0,t=he;for(;t!==null;)sC(t.alternate,t),t=t.return;he=null}}function Hi(t,e){var a=t.timeoutHandle;a!==-1&&(t.timeoutHandle=-1,pD(a)),a=t.cancelPendingCommit,a!==null&&(t.cancelPendingCommit=null,a()),Xn=0,Jg(),ze=t,he=a=Wn(t.current,null),me=e,Pe=0,va=null,Br=!1,Yi=Zu(t,e),Yg=!1,qi=Ea=$g=Ls=ts=ct=0,ua=Ou=null,Ym=!1,e&8&&(e|=e&32);var n=t.entangledLanes;if(n!==0)for(t=t.entanglements,n&=e;0<n;){var r=31-La(n),s=1<<r;e|=t[r],n&=~s}return er=e,ef(),a}function LC(t,e){ue=null,re.H=ju,e===Xi||e===af?(e=TT(),Pe=3):e===Rg?(e=TT(),Pe=4):Pe=e===Kg?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,va=e,he===null&&(ct=1,Md(t,qa(e,t.current)))}function AC(){var t=Ra.current;return t===null?!0:(me&4194048)===me?Ha===null:(me&62914560)===me||me&536870912?t===Ha:!1}function xC(){var t=re.H;return re.H=ju,t===null?ju:t}function RC(){var t=re.A;return re.A=Qk,t}function Bd(){ct=4,Br||(me&4194048)!==me&&Ra.current!==null||(Yi=!0),!(ts&134217727)&&!(Ls&134217727)||ze===null||qr(ze,me,Ea,!1)}function lm(t,e,a){var n=be;be|=2;var r=xC(),s=RC();(ze!==t||me!==e)&&(Fd=null,Hi(t,e)),e=!1;var i=ct;e:do try{if(Pe!==0&&he!==null){var u=he,l=va;switch(Pe){case 8:Jg(),i=6;break e;case 3:case 2:case 9:case 6:Ra.current===null&&(e=!0);var d=Pe;if(Pe=0,va=null,Li(t,u,l,d),a&&Yi){i=0;break e}break;default:d=Pe,Pe=0,va=null,Li(t,u,l,d)}}$k(),i=ct;break}catch(h){LC(t,h)}while(!0);return e&&t.shellSuspendCounter++,Kn=Vs=null,be=n,re.H=r,re.A=s,he===null&&(ze=null,me=0,ef()),i}function $k(){for(;he!==null;)kC(he)}function Jk(t,e){var a=be;be|=2;var n=xC(),r=RC();ze!==t||me!==e?(Fd=null,Ud=Ca()+500,Hi(t,e)):Yi=Zu(t,e);e:do try{if(Pe!==0&&he!==null){e=he;var s=va;t:switch(Pe){case 1:Pe=0,va=null,Li(t,e,s,1);break;case 2:case 9:if(vT(s)){Pe=0,va=null,jT(e);break}e=function(){Pe!==2&&Pe!==9||ze!==t||(Pe=7),yn(t)},s.then(e,e);break e;case 3:Pe=7;break e;case 4:Pe=5;break e;case 7:vT(s)?(Pe=0,va=null,jT(e)):(Pe=0,va=null,Li(t,e,s,7));break;case 5:var i=null;switch(he.tag){case 26:i=he.memoizedState;case 5:case 27:var u=he;if(i?$C(i):u.stateNode.complete){Pe=0,va=null;var l=u.sibling;if(l!==null)he=l;else{var d=u.return;d!==null?(he=d,cf(d)):he=null}break t}}Pe=0,va=null,Li(t,e,s,5);break;case 6:Pe=0,va=null,Li(t,e,s,6);break;case 8:Jg(),ct=6;break e;default:throw Error(N(462))}}Zk();break}catch(h){LC(t,h)}while(!0);return Kn=Vs=null,re.H=n,re.A=r,be=a,he!==null?0:(ze=null,me=0,ef(),ct)}function Zk(){for(;he!==null&&!T1();)kC(he)}function kC(t){var e=rC(t.alternate,t,er);t.memoizedProps=t.pendingProps,e===null?cf(t):he=e}function jT(t){var e=t,a=e.alternate;switch(e.tag){case 15:case 0:e=UT(a,e,e.pendingProps,e.type,void 0,me);break;case 11:e=UT(a,e,e.pendingProps,e.type.render,e.ref,me);break;case 5:Vg(e);default:sC(a,e),e=he=sE(e,er),e=rC(a,e,er)}t.memoizedProps=t.pendingProps,e===null?cf(t):he=e}function Li(t,e,a,n){Kn=Vs=null,Vg(e),Di=null,Hu=0;var r=e.return;try{if(qk(t,r,e,a,me)){ct=1,Md(t,qa(a,t.current)),he=null;return}}catch(s){if(r!==null)throw he=r,s;ct=1,Md(t,qa(a,t.current)),he=null;return}e.flags&32768?(ge||n===1?t=!0:Yi||me&536870912?t=!1:(Br=t=!0,(n===2||n===9||n===3||n===6)&&(n=Ra.current,n!==null&&n.tag===13&&(n.flags|=16384))),DC(e,t)):cf(e)}function cf(t){var e=t;do{if(e.flags&32768){DC(e,Br);return}t=e.return;var a=Gk(e.alternate,e,er);if(a!==null){he=a;return}if(e=e.sibling,e!==null){he=e;return}he=e=t}while(e!==null);ct===0&&(ct=5)}function DC(t,e){do{var a=jk(t.alternate,t);if(a!==null){a.flags&=32767,he=a;return}if(a=t.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!e&&(t=t.sibling,t!==null)){he=t;return}he=t=a}while(t!==null);ct=6,he=null}function KT(t,e,a,n,r,s,i,u,l){t.cancelPendingCommit=null;do df();while(At!==0);if(be&6)throw Error(N(327));if(e!==null){if(e===t.current)throw Error(N(177));if(s=e.lanes|e.childLanes,s|=wg,D1(t,a,s,i,u,l),t===ze&&(he=ze=null,me=0),zi=e,Qr=t,Xn=a,$m=s,Jm=r,EC=n,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,nD(Ed,function(){return VC(),null})):(t.callbackNode=null,t.callbackPriority=0),n=(e.flags&13878)!==0,e.subtreeFlags&13878||n){n=re.T,re.T=null,r=Le.p,Le.p=2,i=be,be|=4;try{Kk(t,e,a)}finally{be=i,Le.p=r,re.T=n}}At=1,PC(),OC(),MC()}}function PC(){if(At===1){At=0;var t=Qr,e=zi,a=(e.flags&13878)!==0;if(e.subtreeFlags&13878||a){a=re.T,re.T=null;var n=Le.p;Le.p=2;var r=be;be|=4;try{gC(e,t);var s=ng,i=$w(t.containerInfo),u=s.focusedElem,l=s.selectionRange;if(i!==u&&u&&u.ownerDocument&&Yw(u.ownerDocument.documentElement,u)){if(l!==null&&Tg(u)){var d=l.start,h=l.end;if(h===void 0&&(h=d),"selectionStart"in u)u.selectionStart=d,u.selectionEnd=Math.min(h,u.value.length);else{var m=u.ownerDocument||document,p=m&&m.defaultView||window;if(p.getSelection){var I=p.getSelection(),L=u.textContent.length,k=Math.min(l.start,L),D=l.end===void 0?k:Math.min(l.end,L);!I.extend&&k>D&&(i=D,D=k,k=i);var w=pT(u,k),v=pT(u,D);if(w&&v&&(I.rangeCount!==1||I.anchorNode!==w.node||I.anchorOffset!==w.offset||I.focusNode!==v.node||I.focusOffset!==v.offset)){var b=m.createRange();b.setStart(w.node,w.offset),I.removeAllRanges(),k>D?(I.addRange(b),I.extend(v.node,v.offset)):(b.setEnd(v.node,v.offset),I.addRange(b))}}}}for(m=[],I=u;I=I.parentNode;)I.nodeType===1&&m.push({element:I,left:I.scrollLeft,top:I.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<m.length;u++){var x=m[u];x.element.scrollLeft=x.left,x.element.scrollTop=x.top}}Qd=!!ag,ng=ag=null}finally{be=r,Le.p=n,re.T=a}}t.current=e,At=2}}function OC(){if(At===2){At=0;var t=Qr,e=zi,a=(e.flags&8772)!==0;if(e.subtreeFlags&8772||a){a=re.T,re.T=null;var n=Le.p;Le.p=2;var r=be;be|=4;try{dC(t,e.alternate,e)}finally{be=r,Le.p=n,re.T=a}}At=3}}function MC(){if(At===4||At===3){At=0,w1();var t=Qr,e=zi,a=Xn,n=EC;e.subtreeFlags&10256||e.flags&10256?At=5:(At=0,zi=Qr=null,NC(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(Wr=null),mg(a),e=e.stateNode,ba&&typeof ba.onCommitFiberRoot=="function")try{ba.onCommitFiberRoot(Ju,e,void 0,(e.current.flags&128)===128)}catch{}if(n!==null){e=re.T,r=Le.p,Le.p=2,re.T=null;try{for(var s=t.onRecoverableError,i=0;i<n.length;i++){var u=n[i];s(u.value,{componentStack:u.stack})}}finally{re.T=e,Le.p=r}}Xn&3&&df(),yn(t),r=t.pendingLanes,a&261930&&r&42?t===Zm?Mu++:(Mu=0,Zm=t):Mu=0,il(0,!1)}}function NC(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,nl(e)))}function df(){return PC(),OC(),MC(),VC()}function VC(){if(At!==5)return!1;var t=Qr,e=$m;$m=0;var a=mg(Xn),n=re.T,r=Le.p;try{Le.p=32>a?32:a,re.T=null,a=Jm,Jm=null;var s=Qr,i=Xn;if(At=0,zi=Qr=null,Xn=0,be&6)throw Error(N(331));var u=be;if(be|=4,vC(s.current),_C(s,s.current,i,a),be=u,il(0,!1),ba&&typeof ba.onPostCommitFiberRoot=="function")try{ba.onPostCommitFiberRoot(Ju,s)}catch{}return!0}finally{Le.p=r,re.T=n,NC(t,e)}}function WT(t,e,a){e=qa(a,e),e=Km(t.stateNode,e,2),t=Kr(t,e,2),t!==null&&(el(t,2),yn(t))}function Oe(t,e,a){if(t.tag===3)WT(t,t,a);else for(;e!==null;){if(e.tag===3){WT(e,t,a);break}else if(e.tag===1){var n=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(Wr===null||!Wr.has(n))){t=qa(a,t),a=JE(2),n=Kr(e,a,2),n!==null&&(ZE(a,n,e,t),el(n,2),yn(n));break}}e=e.return}}function cm(t,e,a){var n=t.pingCache;if(n===null){n=t.pingCache=new Xk;var r=new Set;n.set(e,r)}else r=n.get(e),r===void 0&&(r=new Set,n.set(e,r));r.has(a)||(Yg=!0,r.add(a),t=eD.bind(null,t,e,a),e.then(t,t))}function eD(t,e,a){var n=t.pingCache;n!==null&&n.delete(e),t.pingedLanes|=t.suspendedLanes&a,t.warmLanes&=~a,ze===t&&(me&a)===a&&(ct===4||ct===3&&(me&62914560)===me&&300>Ca()-uf?!(be&2)&&Hi(t,0):$g|=a,qi===me&&(qi=0)),yn(t)}function UC(t,e){e===0&&(e=xw()),t=Ns(t,e),t!==null&&(el(t,e),yn(t))}function tD(t){var e=t.memoizedState,a=0;e!==null&&(a=e.retryLane),UC(t,a)}function aD(t,e){var a=0;switch(t.tag){case 31:case 13:var n=t.stateNode,r=t.memoizedState;r!==null&&(a=r.retryLane);break;case 19:n=t.stateNode;break;case 22:n=t.stateNode._retryCache;break;default:throw Error(N(314))}n!==null&&n.delete(e),UC(t,a)}function nD(t,e){return hg(t,e)}var qd=null,mi=null,eg=!1,zd=!1,dm=!1,zr=0;function yn(t){t!==mi&&t.next===null&&(mi===null?qd=mi=t:mi=mi.next=t),zd=!0,eg||(eg=!0,sD())}function il(t,e){if(!dm&&zd){dm=!0;do for(var a=!1,n=qd;n!==null;){if(!e)if(t!==0){var r=n.pendingLanes;if(r===0)var s=0;else{var i=n.suspendedLanes,u=n.pingedLanes;s=(1<<31-La(42|t)+1)-1,s&=r&~(i&~u),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,QT(n,s))}else s=me,s=Yd(n,n===ze?s:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),!(s&3)||Zu(n,s)||(a=!0,QT(n,s));n=n.next}while(a);dm=!1}}function rD(){FC()}function FC(){zd=eg=!1;var t=0;zr!==0&&hD()&&(t=zr);for(var e=Ca(),a=null,n=qd;n!==null;){var r=n.next,s=BC(n,e);s===0?(n.next=null,a===null?qd=r:a.next=r,r===null&&(mi=a)):(a=n,(t!==0||s&3)&&(zd=!0)),n=r}At!==0&&At!==5||il(t,!1),zr!==0&&(zr=0)}function BC(t,e){for(var a=t.suspendedLanes,n=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes&-62914561;0<s;){var i=31-La(s),u=1<<i,l=r[i];l===-1?(!(u&a)||u&n)&&(r[i]=k1(u,e)):l<=e&&(t.expiredLanes|=u),s&=~u}if(e=ze,a=me,a=Yd(t,t===e?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),n=t.callbackNode,a===0||t===e&&(Pe===2||Pe===9)||t.cancelPendingCommit!==null)return n!==null&&n!==null&&Bp(n),t.callbackNode=null,t.callbackPriority=0;if(!(a&3)||Zu(t,a)){if(e=a&-a,e===t.callbackPriority)return e;switch(n!==null&&Bp(n),mg(a)){case 2:case 8:a=Lw;break;case 32:a=Ed;break;case 268435456:a=Aw;break;default:a=Ed}return n=qC.bind(null,t),a=hg(a,n),t.callbackPriority=e,t.callbackNode=a,e}return n!==null&&n!==null&&Bp(n),t.callbackPriority=2,t.callbackNode=null,2}function qC(t,e){if(At!==0&&At!==5)return t.callbackNode=null,t.callbackPriority=0,null;var a=t.callbackNode;if(df()&&t.callbackNode!==a)return null;var n=me;return n=Yd(t,t===ze?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),n===0?null:(bC(t,n,e),BC(t,Ca()),t.callbackNode!=null&&t.callbackNode===a?qC.bind(null,t):null)}function QT(t,e){if(df())return null;bC(t,e,!0)}function sD(){mD(function(){be&6?hg(bw,rD):FC()})}function Zg(){if(zr===0){var t=Ui;t===0&&(t=Hc,Hc<<=1,!(Hc&261888)&&(Hc=256)),zr=t}return zr}function XT(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:od(""+t)}function YT(t,e){var a=e.ownerDocument.createElement("input");return a.name=e.name,a.value=e.value,t.id&&a.setAttribute("form",t.id),e.parentNode.insertBefore(a,e),t=new FormData(t),a.parentNode.removeChild(a),t}function iD(t,e,a,n,r){if(e==="submit"&&a&&a.stateNode===r){var s=XT((r[ca]||null).action),i=n.submitter;i&&(e=(e=i[ca]||null)?XT(e.formAction):i.getAttribute("formAction"),e!==null&&(s=e,i=null));var u=new $d("action","action",null,n,r);t.push({event:u,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(zr!==0){var l=i?YT(r,i):new FormData(r);Gm(a,{pending:!0,data:l,method:r.method,action:s},null,l)}}else typeof s=="function"&&(u.preventDefault(),l=i?YT(r,i):new FormData(r),Gm(a,{pending:!0,data:l,method:r.method,action:s},s,l))},currentTarget:r}]})}}for(td=0;td<Dm.length;td++)ad=Dm[td],$T=ad.toLowerCase(),JT=ad[0].toUpperCase()+ad.slice(1),en($T,"on"+JT);var ad,$T,JT,td;en(Zw,"onAnimationEnd");en(eE,"onAnimationIteration");en(tE,"onAnimationStart");en("dblclick","onDoubleClick");en("focusin","onFocus");en("focusout","onBlur");en(Ek,"onTransitionRun");en(Ck,"onTransitionStart");en(bk,"onTransitionCancel");en(aE,"onTransitionEnd");Ni("onMouseEnter",["mouseout","mouseover"]);Ni("onMouseLeave",["mouseout","mouseover"]);Ni("onPointerEnter",["pointerout","pointerover"]);Ni("onPointerLeave",["pointerout","pointerover"]);Ps("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ps("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ps("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ps("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ps("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ps("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ku="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),oD=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ku));function zC(t,e){e=(e&4)!==0;for(var a=0;a<t.length;a++){var n=t[a],r=n.event;n=n.listeners;e:{var s=void 0;if(e)for(var i=n.length-1;0<=i;i--){var u=n[i],l=u.instance,d=u.currentTarget;if(u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=d;try{s(r)}catch(h){bd(h)}r.currentTarget=null,s=l}else for(i=0;i<n.length;i++){if(u=n[i],l=u.instance,d=u.currentTarget,u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=d;try{s(r)}catch(h){bd(h)}r.currentTarget=null,s=l}}}}function fe(t,e){var a=e[Em];a===void 0&&(a=e[Em]=new Set);var n=t+"__bubble";a.has(n)||(HC(e,t,2,!1),a.add(n))}function fm(t,e,a){var n=0;e&&(n|=4),HC(a,t,n,e)}var nd="_reactListening"+Math.random().toString(36).slice(2);function ey(t){if(!t[nd]){t[nd]=!0,Ow.forEach(function(a){a!=="selectionchange"&&(oD.has(a)||fm(a,!1,t),fm(a,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[nd]||(e[nd]=!0,fm("selectionchange",!1,e))}}function HC(t,e,a,n){switch(ab(e)){case 2:var r=MD;break;case 8:r=ND;break;default:r=ry}a=r.bind(null,e,a,t),r=void 0,!xm||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),n?r!==void 0?t.addEventListener(e,a,{capture:!0,passive:r}):t.addEventListener(e,a,!0):r!==void 0?t.addEventListener(e,a,{passive:r}):t.addEventListener(e,a,!1)}function hm(t,e,a,n,r){var s=n;if(!(e&1)&&!(e&2)&&n!==null)e:for(;;){if(n===null)return;var i=n.tag;if(i===3||i===4){var u=n.stateNode.containerInfo;if(u===r)break;if(i===4)for(i=n.return;i!==null;){var l=i.tag;if((l===3||l===4)&&i.stateNode.containerInfo===r)return;i=i.return}for(;u!==null;){if(i=_i(u),i===null)return;if(l=i.tag,l===5||l===6||l===26||l===27){n=s=i;continue e}u=u.parentNode}}n=n.return}zw(function(){var d=s,h=_g(a),m=[];e:{var p=nE.get(t);if(p!==void 0){var I=$d,L=t;switch(t){case"keypress":if(ld(a)===0)break e;case"keydown":case"keyup":I=ak;break;case"focusin":L="focus",I=jp;break;case"focusout":L="blur",I=jp;break;case"beforeblur":case"afterblur":I=jp;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":I=sT;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":I=G1;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":I=sk;break;case Zw:case eE:case tE:I=W1;break;case aE:I=ok;break;case"scroll":case"scrollend":I=z1;break;case"wheel":I=lk;break;case"copy":case"cut":case"paste":I=X1;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":I=oT;break;case"toggle":case"beforetoggle":I=dk}var k=(e&4)!==0,D=!k&&(t==="scroll"||t==="scrollend"),w=k?p!==null?p+"Capture":null:p;k=[];for(var v=d,b;v!==null;){var x=v;if(b=x.stateNode,x=x.tag,x!==5&&x!==26&&x!==27||b===null||w===null||(x=Uu(v,w),x!=null&&k.push(Wu(v,x,b))),D)break;v=v.return}0<k.length&&(p=new I(p,L,null,a,h),m.push({event:p,listeners:k}))}}if(!(e&7)){e:{if(p=t==="mouseover"||t==="pointerover",I=t==="mouseout"||t==="pointerout",p&&a!==Am&&(L=a.relatedTarget||a.fromElement)&&(_i(L)||L[Ki]))break e;if((I||p)&&(p=h.window===h?h:(p=h.ownerDocument)?p.defaultView||p.parentWindow:window,I?(L=a.relatedTarget||a.toElement,I=d,L=L?_i(L):null,L!==null&&(D=$u(L),k=L.tag,L!==D||k!==5&&k!==27&&k!==6)&&(L=null)):(I=null,L=d),I!==L)){if(k=sT,x="onMouseLeave",w="onMouseEnter",v="mouse",(t==="pointerout"||t==="pointerover")&&(k=oT,x="onPointerLeave",w="onPointerEnter",v="pointer"),D=I==null?p:vu(I),b=L==null?p:vu(L),p=new k(x,v+"leave",I,a,h),p.target=D,p.relatedTarget=b,x=null,_i(h)===d&&(k=new k(w,v+"enter",L,a,h),k.target=b,k.relatedTarget=D,x=k),D=x,I&&L)t:{for(k=uD,w=I,v=L,b=0,x=w;x;x=k(x))b++;x=0;for(var B=v;B;B=k(B))x++;for(;0<b-x;)w=k(w),b--;for(;0<x-b;)v=k(v),x--;for(;b--;){if(w===v||v!==null&&w===v.alternate){k=w;break t}w=k(w),v=k(v)}k=null}else k=null;I!==null&&ZT(m,p,I,k,!1),L!==null&&D!==null&&ZT(m,D,L,k,!0)}}e:{if(p=d?vu(d):window,I=p.nodeName&&p.nodeName.toLowerCase(),I==="select"||I==="input"&&p.type==="file")var G=dT;else if(cT(p))if(Qw)G=vk;else{G=Ik;var S=_k}else I=p.nodeName,!I||I.toLowerCase()!=="input"||p.type!=="checkbox"&&p.type!=="radio"?d&&yg(d.elementType)&&(G=dT):G=Sk;if(G&&(G=G(t,d))){Ww(m,G,a,h);break e}S&&S(t,p,d),t==="focusout"&&d&&p.type==="number"&&d.memoizedProps.value!=null&&Lm(p,"number",p.value)}switch(S=d?vu(d):window,t){case"focusin":(cT(S)||S.contentEditable==="true")&&(vi=S,Rm=d,bu=null);break;case"focusout":bu=Rm=vi=null;break;case"mousedown":km=!0;break;case"contextmenu":case"mouseup":case"dragend":km=!1,mT(m,a,h);break;case"selectionchange":if(wk)break;case"keydown":case"keyup":mT(m,a,h)}var y;if(vg)e:{switch(t){case"compositionstart":var _="onCompositionStart";break e;case"compositionend":_="onCompositionEnd";break e;case"compositionupdate":_="onCompositionUpdate";break e}_=void 0}else Si?jw(t,a)&&(_="onCompositionEnd"):t==="keydown"&&a.keyCode===229&&(_="onCompositionStart");_&&(Gw&&a.locale!=="ko"&&(Si||_!=="onCompositionStart"?_==="onCompositionEnd"&&Si&&(y=Hw()):(Fr=h,Ig="value"in Fr?Fr.value:Fr.textContent,Si=!0)),S=Hd(d,_),0<S.length&&(_=new iT(_,t,null,a,h),m.push({event:_,listeners:S}),y?_.data=y:(y=Kw(a),y!==null&&(_.data=y)))),(y=hk?pk(t,a):mk(t,a))&&(_=Hd(d,"onBeforeInput"),0<_.length&&(S=new iT("onBeforeInput","beforeinput",null,a,h),m.push({event:S,listeners:_}),S.data=y)),iD(m,t,d,a,h)}zC(m,e)})}function Wu(t,e,a){return{instance:t,listener:e,currentTarget:a}}function Hd(t,e){for(var a=e+"Capture",n=[];t!==null;){var r=t,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=Uu(t,a),r!=null&&n.unshift(Wu(t,r,s)),r=Uu(t,e),r!=null&&n.push(Wu(t,r,s))),t.tag===3)return n;t=t.return}return[]}function uD(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function ZT(t,e,a,n,r){for(var s=e._reactName,i=[];a!==null&&a!==n;){var u=a,l=u.alternate,d=u.stateNode;if(u=u.tag,l!==null&&l===n)break;u!==5&&u!==26&&u!==27||d===null||(l=d,r?(d=Uu(a,s),d!=null&&i.unshift(Wu(a,d,l))):r||(d=Uu(a,s),d!=null&&i.push(Wu(a,d,l)))),a=a.return}i.length!==0&&t.push({event:e,listeners:i})}var lD=/\r\n?/g,cD=/\u0000|\uFFFD/g;function ew(t){return(typeof t=="string"?t:""+t).replace(lD,`
`).replace(cD,"")}function GC(t,e){return e=ew(e),ew(t)===e}function Ne(t,e,a,n,r,s){switch(a){case"children":typeof n=="string"?e==="body"||e==="textarea"&&n===""||Vi(t,n):(typeof n=="number"||typeof n=="bigint")&&e!=="body"&&Vi(t,""+n);break;case"className":Kc(t,"class",n);break;case"tabIndex":Kc(t,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":Kc(t,a,n);break;case"style":qw(t,n,s);break;case"data":if(e!=="object"){Kc(t,"data",n);break}case"src":case"href":if(n===""&&(e!=="a"||a!=="href")){t.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){t.removeAttribute(a);break}n=od(""+n),t.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){t.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(e!=="input"&&Ne(t,e,"name",r.name,r,null),Ne(t,e,"formEncType",r.formEncType,r,null),Ne(t,e,"formMethod",r.formMethod,r,null),Ne(t,e,"formTarget",r.formTarget,r,null)):(Ne(t,e,"encType",r.encType,r,null),Ne(t,e,"method",r.method,r,null),Ne(t,e,"target",r.target,r,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){t.removeAttribute(a);break}n=od(""+n),t.setAttribute(a,n);break;case"onClick":n!=null&&(t.onclick=jn);break;case"onScroll":n!=null&&fe("scroll",t);break;case"onScrollEnd":n!=null&&fe("scrollend",t);break;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(N(61));if(a=n.__html,a!=null){if(r.children!=null)throw Error(N(60));t.innerHTML=a}}break;case"multiple":t.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":t.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){t.removeAttribute("xlink:href");break}a=od(""+n),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?t.setAttribute(a,""+n):t.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?t.setAttribute(a,""):t.removeAttribute(a);break;case"capture":case"download":n===!0?t.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?t.setAttribute(a,n):t.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?t.setAttribute(a,n):t.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?t.removeAttribute(a):t.setAttribute(a,n);break;case"popover":fe("beforetoggle",t),fe("toggle",t),id(t,"popover",n);break;case"xlinkActuate":Vn(t,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":Vn(t,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":Vn(t,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":Vn(t,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":Vn(t,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":Vn(t,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":Vn(t,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":Vn(t,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":Vn(t,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":id(t,"is",n);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=B1.get(a)||a,id(t,a,n))}}function tg(t,e,a,n,r,s){switch(a){case"style":qw(t,n,s);break;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(N(61));if(a=n.__html,a!=null){if(r.children!=null)throw Error(N(60));t.innerHTML=a}}break;case"children":typeof n=="string"?Vi(t,n):(typeof n=="number"||typeof n=="bigint")&&Vi(t,""+n);break;case"onScroll":n!=null&&fe("scroll",t);break;case"onScrollEnd":n!=null&&fe("scrollend",t);break;case"onClick":n!=null&&(t.onclick=jn);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Mw.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),e=a.slice(2,r?a.length-7:void 0),s=t[ca]||null,s=s!=null?s[a]:null,typeof s=="function"&&t.removeEventListener(e,s,r),typeof n=="function")){typeof s!="function"&&s!==null&&(a in t?t[a]=null:t.hasAttribute(a)&&t.removeAttribute(a)),t.addEventListener(e,n,r);break e}a in t?t[a]=n:n===!0?t.setAttribute(a,""):id(t,a,n)}}}function Kt(t,e,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":fe("error",t),fe("load",t);var n=!1,r=!1,s;for(s in a)if(a.hasOwnProperty(s)){var i=a[s];if(i!=null)switch(s){case"src":n=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(N(137,e));default:Ne(t,e,s,i,a,null)}}r&&Ne(t,e,"srcSet",a.srcSet,a,null),n&&Ne(t,e,"src",a.src,a,null);return;case"input":fe("invalid",t);var u=s=i=r=null,l=null,d=null;for(n in a)if(a.hasOwnProperty(n)){var h=a[n];if(h!=null)switch(n){case"name":r=h;break;case"type":i=h;break;case"checked":l=h;break;case"defaultChecked":d=h;break;case"value":s=h;break;case"defaultValue":u=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(N(137,e));break;default:Ne(t,e,n,h,a,null)}}Uw(t,s,u,l,d,i,r,!1);return;case"select":fe("invalid",t),n=i=s=null;for(r in a)if(a.hasOwnProperty(r)&&(u=a[r],u!=null))switch(r){case"value":s=u;break;case"defaultValue":i=u;break;case"multiple":n=u;default:Ne(t,e,r,u,a,null)}e=s,a=i,t.multiple=!!n,e!=null?xi(t,!!n,e,!1):a!=null&&xi(t,!!n,a,!0);return;case"textarea":fe("invalid",t),s=r=n=null;for(i in a)if(a.hasOwnProperty(i)&&(u=a[i],u!=null))switch(i){case"value":n=u;break;case"defaultValue":r=u;break;case"children":s=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(N(91));break;default:Ne(t,e,i,u,a,null)}Bw(t,n,r,s);return;case"option":for(l in a)if(a.hasOwnProperty(l)&&(n=a[l],n!=null))switch(l){case"selected":t.selected=n&&typeof n!="function"&&typeof n!="symbol";break;default:Ne(t,e,l,n,a,null)}return;case"dialog":fe("beforetoggle",t),fe("toggle",t),fe("cancel",t),fe("close",t);break;case"iframe":case"object":fe("load",t);break;case"video":case"audio":for(n=0;n<Ku.length;n++)fe(Ku[n],t);break;case"image":fe("error",t),fe("load",t);break;case"details":fe("toggle",t);break;case"embed":case"source":case"link":fe("error",t),fe("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(d in a)if(a.hasOwnProperty(d)&&(n=a[d],n!=null))switch(d){case"children":case"dangerouslySetInnerHTML":throw Error(N(137,e));default:Ne(t,e,d,n,a,null)}return;default:if(yg(e)){for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!==void 0&&tg(t,e,h,n,a,void 0));return}}for(u in a)a.hasOwnProperty(u)&&(n=a[u],n!=null&&Ne(t,e,u,n,a,null))}function dD(t,e,a,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,i=null,u=null,l=null,d=null,h=null;for(I in a){var m=a[I];if(a.hasOwnProperty(I)&&m!=null)switch(I){case"checked":break;case"value":break;case"defaultValue":l=m;default:n.hasOwnProperty(I)||Ne(t,e,I,null,n,m)}}for(var p in n){var I=n[p];if(m=a[p],n.hasOwnProperty(p)&&(I!=null||m!=null))switch(p){case"type":s=I;break;case"name":r=I;break;case"checked":d=I;break;case"defaultChecked":h=I;break;case"value":i=I;break;case"defaultValue":u=I;break;case"children":case"dangerouslySetInnerHTML":if(I!=null)throw Error(N(137,e));break;default:I!==m&&Ne(t,e,p,I,n,m)}}bm(t,i,u,l,d,h,s,r);return;case"select":I=i=u=p=null;for(s in a)if(l=a[s],a.hasOwnProperty(s)&&l!=null)switch(s){case"value":break;case"multiple":I=l;default:n.hasOwnProperty(s)||Ne(t,e,s,null,n,l)}for(r in n)if(s=n[r],l=a[r],n.hasOwnProperty(r)&&(s!=null||l!=null))switch(r){case"value":p=s;break;case"defaultValue":u=s;break;case"multiple":i=s;default:s!==l&&Ne(t,e,r,s,n,l)}e=u,a=i,n=I,p!=null?xi(t,!!a,p,!1):!!n!=!!a&&(e!=null?xi(t,!!a,e,!0):xi(t,!!a,a?[]:"",!1));return;case"textarea":I=p=null;for(u in a)if(r=a[u],a.hasOwnProperty(u)&&r!=null&&!n.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Ne(t,e,u,null,n,r)}for(i in n)if(r=n[i],s=a[i],n.hasOwnProperty(i)&&(r!=null||s!=null))switch(i){case"value":p=r;break;case"defaultValue":I=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(N(91));break;default:r!==s&&Ne(t,e,i,r,n,s)}Fw(t,p,I);return;case"option":for(var L in a)if(p=a[L],a.hasOwnProperty(L)&&p!=null&&!n.hasOwnProperty(L))switch(L){case"selected":t.selected=!1;break;default:Ne(t,e,L,null,n,p)}for(l in n)if(p=n[l],I=a[l],n.hasOwnProperty(l)&&p!==I&&(p!=null||I!=null))switch(l){case"selected":t.selected=p&&typeof p!="function"&&typeof p!="symbol";break;default:Ne(t,e,l,p,n,I)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var k in a)p=a[k],a.hasOwnProperty(k)&&p!=null&&!n.hasOwnProperty(k)&&Ne(t,e,k,null,n,p);for(d in n)if(p=n[d],I=a[d],n.hasOwnProperty(d)&&p!==I&&(p!=null||I!=null))switch(d){case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(N(137,e));break;default:Ne(t,e,d,p,n,I)}return;default:if(yg(e)){for(var D in a)p=a[D],a.hasOwnProperty(D)&&p!==void 0&&!n.hasOwnProperty(D)&&tg(t,e,D,void 0,n,p);for(h in n)p=n[h],I=a[h],!n.hasOwnProperty(h)||p===I||p===void 0&&I===void 0||tg(t,e,h,p,n,I);return}}for(var w in a)p=a[w],a.hasOwnProperty(w)&&p!=null&&!n.hasOwnProperty(w)&&Ne(t,e,w,null,n,p);for(m in n)p=n[m],I=a[m],!n.hasOwnProperty(m)||p===I||p==null&&I==null||Ne(t,e,m,p,n,I)}function tw(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function fD(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var r=a[n],s=r.transferSize,i=r.initiatorType,u=r.duration;if(s&&u&&tw(i)){for(i=0,u=r.responseEnd,n+=1;n<a.length;n++){var l=a[n],d=l.startTime;if(d>u)break;var h=l.transferSize,m=l.initiatorType;h&&tw(m)&&(l=l.responseEnd,i+=h*(l<u?1:(u-d)/(l-d)))}if(--n,e+=8*(s+i)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var ag=null,ng=null;function Gd(t){return t.nodeType===9?t:t.ownerDocument}function aw(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function jC(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function rg(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var pm=null;function hD(){var t=window.event;return t&&t.type==="popstate"?t===pm?!1:(pm=t,!0):(pm=null,!1)}var KC=typeof setTimeout=="function"?setTimeout:void 0,pD=typeof clearTimeout=="function"?clearTimeout:void 0,nw=typeof Promise=="function"?Promise:void 0,mD=typeof queueMicrotask=="function"?queueMicrotask:typeof nw<"u"?function(t){return nw.resolve(null).then(t).catch(gD)}:KC;function gD(t){setTimeout(function(){throw t})}function ns(t){return t==="head"}function rw(t,e){var a=e,n=0;do{var r=a.nextSibling;if(t.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(n===0){t.removeChild(r),ji(e);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")Nu(t.ownerDocument.documentElement);else if(a==="head"){a=t.ownerDocument.head,Nu(a);for(var s=a.firstChild;s;){var i=s.nextSibling,u=s.nodeName;s[tl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=i}}else a==="body"&&Nu(t.ownerDocument.body);a=r}while(a);ji(e)}function sw(t,e){var a=t;t=0;do{var n=a.nextSibling;if(a.nodeType===1?e?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(e?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(t===0)break;t--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||t++;a=n}while(a)}function sg(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var a=e;switch(e=e.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":sg(a),gg(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}t.removeChild(a)}}function yD(t,e,a,n){for(;t.nodeType===1;){var r=a;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!n&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(n){if(!t[tl])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(s=t.getAttribute("rel"),s==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(s!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(s=t.getAttribute("src"),(s!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===s)return t}else return t;if(t=Ga(t.nextSibling),t===null)break}return null}function _D(t,e,a){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!a||(t=Ga(t.nextSibling),t===null))return null;return t}function WC(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=Ga(t.nextSibling),t===null))return null;return t}function ig(t){return t.data==="$?"||t.data==="$~"}function og(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function ID(t,e){var a=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||a.readyState!=="loading")e();else{var n=function(){e(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),t._reactRetry=n}}function Ga(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var ug=null;function iw(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var a=t.data;if(a==="/$"||a==="/&"){if(e===0)return Ga(t.nextSibling);e--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||e++}t=t.nextSibling}return null}function ow(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var a=t.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(e===0)return t;e--}else a!=="/$"&&a!=="/&"||e++}t=t.previousSibling}return null}function QC(t,e,a){switch(e=Gd(a),t){case"html":if(t=e.documentElement,!t)throw Error(N(452));return t;case"head":if(t=e.head,!t)throw Error(N(453));return t;case"body":if(t=e.body,!t)throw Error(N(454));return t;default:throw Error(N(451))}}function Nu(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);gg(t)}var ja=new Map,uw=new Set;function jd(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var tr=Le.d;Le.d={f:SD,r:vD,D:TD,C:wD,L:ED,m:CD,X:LD,S:bD,M:AD};function SD(){var t=tr.f(),e=lf();return t||e}function vD(t){var e=Wi(t);e!==null&&e.tag===5&&e.type==="form"?qE(e):tr.r(t)}var $i=typeof document>"u"?null:document;function XC(t,e,a){var n=$i;if(n&&typeof e=="string"&&e){var r=Ba(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),uw.has(r)||(uw.add(r),t={rel:t,crossOrigin:a,href:e},n.querySelector(r)===null&&(e=n.createElement("link"),Kt(e,"link",t),Mt(e),n.head.appendChild(e)))}}function TD(t){tr.D(t),XC("dns-prefetch",t,null)}function wD(t,e){tr.C(t,e),XC("preconnect",t,e)}function ED(t,e,a){tr.L(t,e,a);var n=$i;if(n&&t&&e){var r='link[rel="preload"][as="'+Ba(e)+'"]';e==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+Ba(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+Ba(a.imageSizes)+'"]')):r+='[href="'+Ba(t)+'"]';var s=r;switch(e){case"style":s=Gi(t);break;case"script":s=Ji(t)}ja.has(s)||(t=Xe({rel:"preload",href:e==="image"&&a&&a.imageSrcSet?void 0:t,as:e},a),ja.set(s,t),n.querySelector(r)!==null||e==="style"&&n.querySelector(ol(s))||e==="script"&&n.querySelector(ul(s))||(e=n.createElement("link"),Kt(e,"link",t),Mt(e),n.head.appendChild(e)))}}function CD(t,e){tr.m(t,e);var a=$i;if(a&&t){var n=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+Ba(n)+'"][href="'+Ba(t)+'"]',s=r;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=Ji(t)}if(!ja.has(s)&&(t=Xe({rel:"modulepreload",href:t},e),ja.set(s,t),a.querySelector(r)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(ul(s)))return}n=a.createElement("link"),Kt(n,"link",t),Mt(n),a.head.appendChild(n)}}}function bD(t,e,a){tr.S(t,e,a);var n=$i;if(n&&t){var r=Ai(n).hoistableStyles,s=Gi(t);e=e||"default";var i=r.get(s);if(!i){var u={loading:0,preload:null};if(i=n.querySelector(ol(s)))u.loading=5;else{t=Xe({rel:"stylesheet",href:t,"data-precedence":e},a),(a=ja.get(s))&&ty(t,a);var l=i=n.createElement("link");Mt(l),Kt(l,"link",t),l._p=new Promise(function(d,h){l.onload=d,l.onerror=h}),l.addEventListener("load",function(){u.loading|=1}),l.addEventListener("error",function(){u.loading|=2}),u.loading|=4,yd(i,e,n)}i={type:"stylesheet",instance:i,count:1,state:u},r.set(s,i)}}}function LD(t,e){tr.X(t,e);var a=$i;if(a&&t){var n=Ai(a).hoistableScripts,r=Ji(t),s=n.get(r);s||(s=a.querySelector(ul(r)),s||(t=Xe({src:t,async:!0},e),(e=ja.get(r))&&ay(t,e),s=a.createElement("script"),Mt(s),Kt(s,"link",t),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},n.set(r,s))}}function AD(t,e){tr.M(t,e);var a=$i;if(a&&t){var n=Ai(a).hoistableScripts,r=Ji(t),s=n.get(r);s||(s=a.querySelector(ul(r)),s||(t=Xe({src:t,async:!0,type:"module"},e),(e=ja.get(r))&&ay(t,e),s=a.createElement("script"),Mt(s),Kt(s,"link",t),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},n.set(r,s))}}function lw(t,e,a,n){var r=(r=Hr.current)?jd(r):null;if(!r)throw Error(N(446));switch(t){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(e=Gi(a.href),a=Ai(r).hoistableStyles,n=a.get(e),n||(n={type:"style",instance:null,count:0,state:null},a.set(e,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){t=Gi(a.href);var s=Ai(r).hoistableStyles,i=s.get(t);if(i||(r=r.ownerDocument||r,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(t,i),(s=r.querySelector(ol(t)))&&!s._p&&(i.instance=s,i.state.loading=5),ja.has(t)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},ja.set(t,a),s||xD(r,t,a,i.state))),e&&n===null)throw Error(N(528,""));return i}if(e&&n!==null)throw Error(N(529,""));return null;case"script":return e=a.async,a=a.src,typeof a=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=Ji(a),a=Ai(r).hoistableScripts,n=a.get(e),n||(n={type:"script",instance:null,count:0,state:null},a.set(e,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(N(444,t))}}function Gi(t){return'href="'+Ba(t)+'"'}function ol(t){return'link[rel="stylesheet"]['+t+"]"}function YC(t){return Xe({},t,{"data-precedence":t.precedence,precedence:null})}function xD(t,e,a,n){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?n.loading=1:(e=t.createElement("link"),n.preload=e,e.addEventListener("load",function(){return n.loading|=1}),e.addEventListener("error",function(){return n.loading|=2}),Kt(e,"link",a),Mt(e),t.head.appendChild(e))}function Ji(t){return'[src="'+Ba(t)+'"]'}function ul(t){return"script[async]"+t}function cw(t,e,a){if(e.count++,e.instance===null)switch(e.type){case"style":var n=t.querySelector('style[data-href~="'+Ba(a.href)+'"]');if(n)return e.instance=n,Mt(n),n;var r=Xe({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(t.ownerDocument||t).createElement("style"),Mt(n),Kt(n,"style",r),yd(n,a.precedence,t),e.instance=n;case"stylesheet":r=Gi(a.href);var s=t.querySelector(ol(r));if(s)return e.state.loading|=4,e.instance=s,Mt(s),s;n=YC(a),(r=ja.get(r))&&ty(n,r),s=(t.ownerDocument||t).createElement("link"),Mt(s);var i=s;return i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),Kt(s,"link",n),e.state.loading|=4,yd(s,a.precedence,t),e.instance=s;case"script":return s=Ji(a.src),(r=t.querySelector(ul(s)))?(e.instance=r,Mt(r),r):(n=a,(r=ja.get(s))&&(n=Xe({},a),ay(n,r)),t=t.ownerDocument||t,r=t.createElement("script"),Mt(r),Kt(r,"link",n),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(N(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(n=e.instance,e.state.loading|=4,yd(n,a.precedence,t));return e.instance}function yd(t,e,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=n.length?n[n.length-1]:null,s=r,i=0;i<n.length;i++){var u=n[i];if(u.dataset.precedence===e)s=u;else if(s!==r)break}s?s.parentNode.insertBefore(t,s.nextSibling):(e=a.nodeType===9?a.head:a,e.insertBefore(t,e.firstChild))}function ty(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function ay(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var _d=null;function dw(t,e,a){if(_d===null){var n=new Map,r=_d=new Map;r.set(a,n)}else r=_d,n=r.get(a),n||(n=new Map,r.set(a,n));if(n.has(t))return n;for(n.set(t,null),a=a.getElementsByTagName(t),r=0;r<a.length;r++){var s=a[r];if(!(s[tl]||s[Ht]||t==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var i=s.getAttribute(e)||"";i=t+i;var u=n.get(i);u?u.push(s):n.set(i,[s])}}return n}function fw(t,e,a){t=t.ownerDocument||t,t.head.insertBefore(a,e==="title"?t.querySelector("head > title"):null)}function RD(t,e,a){if(a===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function $C(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function kD(t,e,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&!(a.state.loading&4)){if(a.instance===null){var r=Gi(n.href),s=e.querySelector(ol(r));if(s){e=s._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Kd.bind(t),e.then(t,t)),a.state.loading|=4,a.instance=s,Mt(s);return}s=e.ownerDocument||e,n=YC(n),(r=ja.get(r))&&ty(n,r),s=s.createElement("link"),Mt(s);var i=s;i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),Kt(s,"link",n),a.instance=s}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(a,e),(e=a.state.preload)&&!(a.state.loading&3)&&(t.count++,a=Kd.bind(t),e.addEventListener("load",a),e.addEventListener("error",a))}}var mm=0;function DD(t,e){return t.stylesheets&&t.count===0&&Id(t,t.stylesheets),0<t.count||0<t.imgCount?function(a){var n=setTimeout(function(){if(t.stylesheets&&Id(t,t.stylesheets),t.unsuspend){var s=t.unsuspend;t.unsuspend=null,s()}},6e4+e);0<t.imgBytes&&mm===0&&(mm=62500*fD());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Id(t,t.stylesheets),t.unsuspend)){var s=t.unsuspend;t.unsuspend=null,s()}},(t.imgBytes>mm?50:800)+e);return t.unsuspend=a,function(){t.unsuspend=null,clearTimeout(n),clearTimeout(r)}}:null}function Kd(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Id(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Wd=null;function Id(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Wd=new Map,e.forEach(PD,t),Wd=null,Kd.call(t))}function PD(t,e){if(!(e.state.loading&4)){var a=Wd.get(t);if(a)var n=a.get(null);else{a=new Map,Wd.set(t,a);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var i=r[s];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(a.set(i.dataset.precedence,i),n=i)}n&&a.set(null,n)}r=e.instance,i=r.getAttribute("data-precedence"),s=a.get(i)||n,s===n&&a.set(null,r),a.set(i,r),this.count++,n=Kd.bind(this),r.addEventListener("load",n),r.addEventListener("error",n),s?s.parentNode.insertBefore(r,s.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var Qu={$$typeof:Gn,Provider:null,Consumer:null,_currentValue:ws,_currentValue2:ws,_threadCount:0};function OD(t,e,a,n,r,s,i,u,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=qp(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=qp(0),this.hiddenUpdates=qp(null),this.identifierPrefix=n,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function JC(t,e,a,n,r,s,i,u,l,d,h,m){return t=new OD(t,e,a,i,l,d,h,m,u),e=1,s===!0&&(e|=24),s=wa(3,null,null,e),t.current=s,s.stateNode=t,e=Ag(),e.refCount++,t.pooledCache=e,e.refCount++,s.memoizedState={element:n,isDehydrated:a,cache:e},kg(s),t}function ZC(t){return t?(t=Ei,t):Ei}function eb(t,e,a,n,r,s){r=ZC(r),n.context===null?n.context=r:n.pendingContext=r,n=jr(e),n.payload={element:a},s=s===void 0?null:s,s!==null&&(n.callback=s),a=Kr(t,n,e),a!==null&&(la(a,t,e),Au(a,t,e))}function hw(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var a=t.retryLane;t.retryLane=a!==0&&a<e?a:e}}function ny(t,e){hw(t,e),(t=t.alternate)&&hw(t,e)}function tb(t){if(t.tag===13||t.tag===31){var e=Ns(t,67108864);e!==null&&la(e,t,67108864),ny(t,67108864)}}function pw(t){if(t.tag===13||t.tag===31){var e=Aa();e=pg(e);var a=Ns(t,e);a!==null&&la(a,t,e),ny(t,e)}}var Qd=!0;function MD(t,e,a,n){var r=re.T;re.T=null;var s=Le.p;try{Le.p=2,ry(t,e,a,n)}finally{Le.p=s,re.T=r}}function ND(t,e,a,n){var r=re.T;re.T=null;var s=Le.p;try{Le.p=8,ry(t,e,a,n)}finally{Le.p=s,re.T=r}}function ry(t,e,a,n){if(Qd){var r=lg(n);if(r===null)hm(t,e,n,Xd,a),mw(t,n);else if(UD(r,t,e,a,n))n.stopPropagation();else if(mw(t,n),e&4&&-1<VD.indexOf(t)){for(;r!==null;){var s=Wi(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var i=Ss(s.pendingLanes);if(i!==0){var u=s;for(u.pendingLanes|=2,u.entangledLanes|=2;i;){var l=1<<31-La(i);u.entanglements[1]|=l,i&=~l}yn(s),!(be&6)&&(Ud=Ca()+500,il(0,!1))}}break;case 31:case 13:u=Ns(s,2),u!==null&&la(u,s,2),lf(),ny(s,2)}if(s=lg(n),s===null&&hm(t,e,n,Xd,a),s===r)break;r=s}r!==null&&n.stopPropagation()}else hm(t,e,n,null,a)}}function lg(t){return t=_g(t),sy(t)}var Xd=null;function sy(t){if(Xd=null,t=_i(t),t!==null){var e=$u(t);if(e===null)t=null;else{var a=e.tag;if(a===13){if(t=vw(e),t!==null)return t;t=null}else if(a===31){if(t=Tw(e),t!==null)return t;t=null}else if(a===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Xd=t,null}function ab(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(E1()){case bw:return 2;case Lw:return 8;case Ed:case C1:return 32;case Aw:return 268435456;default:return 32}default:return 32}}var cg=!1,Xr=null,Yr=null,$r=null,Xu=new Map,Yu=new Map,Vr=[],VD="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function mw(t,e){switch(t){case"focusin":case"focusout":Xr=null;break;case"dragenter":case"dragleave":Yr=null;break;case"mouseover":case"mouseout":$r=null;break;case"pointerover":case"pointerout":Xu.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Yu.delete(e.pointerId)}}function yu(t,e,a,n,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:a,eventSystemFlags:n,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Wi(e),e!==null&&tb(e)),t):(t.eventSystemFlags|=n,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function UD(t,e,a,n,r){switch(e){case"focusin":return Xr=yu(Xr,t,e,a,n,r),!0;case"dragenter":return Yr=yu(Yr,t,e,a,n,r),!0;case"mouseover":return $r=yu($r,t,e,a,n,r),!0;case"pointerover":var s=r.pointerId;return Xu.set(s,yu(Xu.get(s)||null,t,e,a,n,r)),!0;case"gotpointercapture":return s=r.pointerId,Yu.set(s,yu(Yu.get(s)||null,t,e,a,n,r)),!0}return!1}function nb(t){var e=_i(t.target);if(e!==null){var a=$u(e);if(a!==null){if(e=a.tag,e===13){if(e=vw(a),e!==null){t.blockedOn=e,Jv(t.priority,function(){pw(a)});return}}else if(e===31){if(e=Tw(a),e!==null){t.blockedOn=e,Jv(t.priority,function(){pw(a)});return}}else if(e===3&&a.stateNode.current.memoizedState.isDehydrated){t.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Sd(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var a=lg(t.nativeEvent);if(a===null){a=t.nativeEvent;var n=new a.constructor(a.type,a);Am=n,a.target.dispatchEvent(n),Am=null}else return e=Wi(a),e!==null&&tb(e),t.blockedOn=a,!1;e.shift()}return!0}function gw(t,e,a){Sd(t)&&a.delete(e)}function FD(){cg=!1,Xr!==null&&Sd(Xr)&&(Xr=null),Yr!==null&&Sd(Yr)&&(Yr=null),$r!==null&&Sd($r)&&($r=null),Xu.forEach(gw),Yu.forEach(gw)}function rd(t,e){t.blockedOn===e&&(t.blockedOn=null,cg||(cg=!0,xt.unstable_scheduleCallback(xt.unstable_NormalPriority,FD)))}var sd=null;function yw(t){sd!==t&&(sd=t,xt.unstable_scheduleCallback(xt.unstable_NormalPriority,function(){sd===t&&(sd=null);for(var e=0;e<t.length;e+=3){var a=t[e],n=t[e+1],r=t[e+2];if(typeof n!="function"){if(sy(n||a)===null)continue;break}var s=Wi(a);s!==null&&(t.splice(e,3),e-=3,Gm(s,{pending:!0,data:r,method:a.method,action:n},n,r))}}))}function ji(t){function e(l){return rd(l,t)}Xr!==null&&rd(Xr,t),Yr!==null&&rd(Yr,t),$r!==null&&rd($r,t),Xu.forEach(e),Yu.forEach(e);for(var a=0;a<Vr.length;a++){var n=Vr[a];n.blockedOn===t&&(n.blockedOn=null)}for(;0<Vr.length&&(a=Vr[0],a.blockedOn===null);)nb(a),a.blockedOn===null&&Vr.shift();if(a=(t.ownerDocument||t).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var r=a[n],s=a[n+1],i=r[ca]||null;if(typeof s=="function")i||yw(a);else if(i){var u=null;if(s&&s.hasAttribute("formAction")){if(r=s,i=s[ca]||null)u=i.formAction;else if(sy(r)!==null)continue}else u=i.action;typeof u=="function"?a[n+1]=u:(a.splice(n,3),n-=3),yw(a)}}}function rb(){function t(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(i){return r=i})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function iy(t){this._internalRoot=t}ff.prototype.render=iy.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(N(409));var a=e.current,n=Aa();eb(a,n,t,e,null,null)};ff.prototype.unmount=iy.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;eb(t.current,2,null,t,null,null),lf(),e[Ki]=null}};function ff(t){this._internalRoot=t}ff.prototype.unstable_scheduleHydration=function(t){if(t){var e=Pw();t={blockedOn:null,target:t,priority:e};for(var a=0;a<Vr.length&&e!==0&&e<Vr[a].priority;a++);Vr.splice(a,0,t),a===0&&nb(t)}};var _w=Iw.version;if(_w!=="19.2.3")throw Error(N(527,_w,"19.2.3"));Le.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(N(188)):(t=Object.keys(t).join(","),Error(N(268,t)));return t=y1(e),t=t!==null?ww(t):null,t=t===null?null:t.stateNode,t};var BD={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:re,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(_u=__REACT_DEVTOOLS_GLOBAL_HOOK__,!_u.isDisabled&&_u.supportsFiber))try{Ju=_u.inject(BD),ba=_u}catch{}var _u;hf.createRoot=function(t,e){if(!Sw(t))throw Error(N(299));var a=!1,n="",r=XE,s=YE,i=$E;return e!=null&&(e.unstable_strictMode===!0&&(a=!0),e.identifierPrefix!==void 0&&(n=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(s=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=JC(t,1,!1,null,null,a,n,null,r,s,i,rb),t[Ki]=e.current,ey(t),new iy(e)};hf.hydrateRoot=function(t,e,a){if(!Sw(t))throw Error(N(299));var n=!1,r="",s=XE,i=YE,u=$E,l=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(i=a.onCaughtError),a.onRecoverableError!==void 0&&(u=a.onRecoverableError),a.formState!==void 0&&(l=a.formState)),e=JC(t,1,!0,e,a??null,n,r,l,s,i,u,rb),e.context=ZC(null),a=e.current,n=Aa(),n=pg(n),r=jr(n),r.callback=null,Kr(a,r,n),a=n,e.current.lanes=a,el(e,a),yn(e),t[Ki]=e.current,ey(t),new ff(e)};hf.version="19.2.3"});var ub=Ce((WU,ob)=>{"use strict";function ib(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ib)}catch(t){console.error(t)}}ib(),ob.exports=sb()});var lb=Ce((YU,dy)=>{var cy=function(t){"use strict";var e=Object.prototype,a=e.hasOwnProperty,n=Object.defineProperty||function(M,O,U){M[O]=U.value},r,s=typeof Symbol=="function"?Symbol:{},i=s.iterator||"@@iterator",u=s.asyncIterator||"@@asyncIterator",l=s.toStringTag||"@@toStringTag";function d(M,O,U){return Object.defineProperty(M,O,{value:U,enumerable:!0,configurable:!0,writable:!0}),M[O]}try{d({},"")}catch{d=function(O,U,$){return O[U]=$}}function h(M,O,U,$){var W=O&&O.prototype instanceof w?O:w,ee=Object.create(W.prototype),q=new Re($||[]);return n(ee,"_invoke",{value:T(M,U,q)}),ee}t.wrap=h;function m(M,O,U){try{return{type:"normal",arg:M.call(O,U)}}catch($){return{type:"throw",arg:$}}}var p="suspendedStart",I="suspendedYield",L="executing",k="completed",D={};function w(){}function v(){}function b(){}var x={};d(x,i,function(){return this});var B=Object.getPrototypeOf,G=B&&B(B(Me([])));G&&G!==e&&a.call(G,i)&&(x=G);var S=b.prototype=w.prototype=Object.create(x);v.prototype=b,n(S,"constructor",{value:b,configurable:!0}),n(b,"constructor",{value:v,configurable:!0}),v.displayName=d(b,l,"GeneratorFunction");function y(M){["next","throw","return"].forEach(function(O){d(M,O,function(U){return this._invoke(O,U)})})}t.isGeneratorFunction=function(M){var O=typeof M=="function"&&M.constructor;return O?O===v||(O.displayName||O.name)==="GeneratorFunction":!1},t.mark=function(M){return Object.setPrototypeOf?Object.setPrototypeOf(M,b):(M.__proto__=b,d(M,l,"GeneratorFunction")),M.prototype=Object.create(S),M},t.awrap=function(M){return{__await:M}};function _(M,O){function U(ee,q,ne,J){var ae=m(M[ee],M,q);if(ae.type==="throw")J(ae.arg);else{var pe=ae.arg,we=pe.value;return we&&typeof we=="object"&&a.call(we,"__await")?O.resolve(we.__await).then(function(ke){U("next",ke,ne,J)},function(ke){U("throw",ke,ne,J)}):O.resolve(we).then(function(ke){pe.value=ke,ne(pe)},function(ke){return U("throw",ke,ne,J)})}}var $;function W(ee,q){function ne(){return new O(function(J,ae){U(ee,q,J,ae)})}return $=$?$.then(ne,ne):ne()}n(this,"_invoke",{value:W})}y(_.prototype),d(_.prototype,u,function(){return this}),t.AsyncIterator=_,t.async=function(M,O,U,$,W){W===void 0&&(W=Promise);var ee=new _(h(M,O,U,$),W);return t.isGeneratorFunction(O)?ee:ee.next().then(function(q){return q.done?q.value:ee.next()})};function T(M,O,U){var $=p;return function(ee,q){if($===L)throw new Error("Generator is already running");if($===k){if(ee==="throw")throw q;return Xa()}for(U.method=ee,U.arg=q;;){var ne=U.delegate;if(ne){var J=C(ne,U);if(J){if(J===D)continue;return J}}if(U.method==="next")U.sent=U._sent=U.arg;else if(U.method==="throw"){if($===p)throw $=k,U.arg;U.dispatchException(U.arg)}else U.method==="return"&&U.abrupt("return",U.arg);$=L;var ae=m(M,O,U);if(ae.type==="normal"){if($=U.done?k:I,ae.arg===D)continue;return{value:ae.arg,done:U.done}}else ae.type==="throw"&&($=k,U.method="throw",U.arg=ae.arg)}}}function C(M,O){var U=O.method,$=M.iterator[U];if($===r)return O.delegate=null,U==="throw"&&M.iterator.return&&(O.method="return",O.arg=r,C(M,O),O.method==="throw")||U!=="return"&&(O.method="throw",O.arg=new TypeError("The iterator does not provide a '"+U+"' method")),D;var W=m($,M.iterator,O.arg);if(W.type==="throw")return O.method="throw",O.arg=W.arg,O.delegate=null,D;var ee=W.arg;if(!ee)return O.method="throw",O.arg=new TypeError("iterator result is not an object"),O.delegate=null,D;if(ee.done)O[M.resultName]=ee.value,O.next=M.nextLoc,O.method!=="return"&&(O.method="next",O.arg=r);else return ee;return O.delegate=null,D}y(S),d(S,l,"Generator"),d(S,i,function(){return this}),d(S,"toString",function(){return"[object Generator]"});function A(M){var O={tryLoc:M[0]};1 in M&&(O.catchLoc=M[1]),2 in M&&(O.finallyLoc=M[2],O.afterLoc=M[3]),this.tryEntries.push(O)}function E(M){var O=M.completion||{};O.type="normal",delete O.arg,M.completion=O}function Re(M){this.tryEntries=[{tryLoc:"root"}],M.forEach(A,this),this.reset(!0)}t.keys=function(M){var O=Object(M),U=[];for(var $ in O)U.push($);return U.reverse(),function W(){for(;U.length;){var ee=U.pop();if(ee in O)return W.value=ee,W.done=!1,W}return W.done=!0,W}};function Me(M){if(M){var O=M[i];if(O)return O.call(M);if(typeof M.next=="function")return M;if(!isNaN(M.length)){var U=-1,$=function W(){for(;++U<M.length;)if(a.call(M,U))return W.value=M[U],W.done=!1,W;return W.value=r,W.done=!0,W};return $.next=$}}return{next:Xa}}t.values=Me;function Xa(){return{value:r,done:!0}}return Re.prototype={constructor:Re,reset:function(M){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(E),!M)for(var O in this)O.charAt(0)==="t"&&a.call(this,O)&&!isNaN(+O.slice(1))&&(this[O]=r)},stop:function(){this.done=!0;var M=this.tryEntries[0],O=M.completion;if(O.type==="throw")throw O.arg;return this.rval},dispatchException:function(M){if(this.done)throw M;var O=this;function U(J,ae){return ee.type="throw",ee.arg=M,O.next=J,ae&&(O.method="next",O.arg=r),!!ae}for(var $=this.tryEntries.length-1;$>=0;--$){var W=this.tryEntries[$],ee=W.completion;if(W.tryLoc==="root")return U("end");if(W.tryLoc<=this.prev){var q=a.call(W,"catchLoc"),ne=a.call(W,"finallyLoc");if(q&&ne){if(this.prev<W.catchLoc)return U(W.catchLoc,!0);if(this.prev<W.finallyLoc)return U(W.finallyLoc)}else if(q){if(this.prev<W.catchLoc)return U(W.catchLoc,!0)}else if(ne){if(this.prev<W.finallyLoc)return U(W.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(M,O){for(var U=this.tryEntries.length-1;U>=0;--U){var $=this.tryEntries[U];if($.tryLoc<=this.prev&&a.call($,"finallyLoc")&&this.prev<$.finallyLoc){var W=$;break}}W&&(M==="break"||M==="continue")&&W.tryLoc<=O&&O<=W.finallyLoc&&(W=null);var ee=W?W.completion:{};return ee.type=M,ee.arg=O,W?(this.method="next",this.next=W.finallyLoc,D):this.complete(ee)},complete:function(M,O){if(M.type==="throw")throw M.arg;return M.type==="break"||M.type==="continue"?this.next=M.arg:M.type==="return"?(this.rval=this.arg=M.arg,this.method="return",this.next="end"):M.type==="normal"&&O&&(this.next=O),D},finish:function(M){for(var O=this.tryEntries.length-1;O>=0;--O){var U=this.tryEntries[O];if(U.finallyLoc===M)return this.complete(U.completion,U.afterLoc),E(U),D}},catch:function(M){for(var O=this.tryEntries.length-1;O>=0;--O){var U=this.tryEntries[O];if(U.tryLoc===M){var $=U.completion;if($.type==="throw"){var W=$.arg;E(U)}return W}}throw new Error("illegal catch attempt")},delegateYield:function(M,O,U){return this.delegate={iterator:Me(M),resultName:O,nextLoc:U},this.method==="next"&&(this.arg=r),D}},t}(typeof dy=="object"?dy.exports:{});try{regeneratorRuntime=cy}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=cy:Function("r","regeneratorRuntime = r")(cy)}});var pf=Ce(($U,cb)=>{"use strict";cb.exports=(t,e)=>`${t}-${e}-${Math.random().toString(16).slice(3,8)}`});var fy=Ce((JU,fb)=>{"use strict";var HD=pf(),db=0;fb.exports=({id:t,action:e,payload:a={}})=>{let n=t;return typeof n>"u"&&(n=HD("Job",db),db+=1),{id:n,action:e,payload:a}}});var mf=Ce(ll=>{"use strict";var hy=!1;ll.logging=hy;ll.setLogging=t=>{hy=t};ll.log=(...t)=>hy?console.log.apply(ll,t):null});var gb=Ce((pb,mb)=>{"use strict";var GD=fy(),{log:gf}=mf(),jD=pf(),hb=0;mb.exports=()=>{let t=jD("Scheduler",hb),e={},a={},n=[];hb+=1;let r=()=>n.length,s=()=>Object.keys(e).length,i=()=>{if(n.length!==0){let m=Object.keys(e);for(let p=0;p<m.length;p+=1)if(typeof a[m[p]]>"u"){n[0](e[m[p]]);break}}},u=(m,p)=>new Promise((I,L)=>{let k=GD({action:m,payload:p});n.push(async D=>{n.shift(),a[D.id]=k;try{I(await D[m].apply(pb,[...p,k.id]))}catch(w){L(w)}finally{delete a[D.id],i()}}),gf(`[${t}]: Add ${k.id} to JobQueue`),gf(`[${t}]: JobQueue length=${n.length}`),i()});return{addWorker:m=>(e[m.id]=m,gf(`[${t}]: Add ${m.id}`),gf(`[${t}]: Number of workers=${s()}`),i(),m.id),addJob:async(m,...p)=>{if(s()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return u(m,p)},terminate:async()=>{Object.keys(e).forEach(async m=>{await e[m].terminate()}),n=[]},getQueueLen:r,getNumWorkers:s}}});var _b=Ce((eF,yb)=>{"use strict";yb.exports=t=>{let e={};return typeof WorkerGlobalScope<"u"?e.type="webworker":typeof document=="object"?e.type="browser":typeof process=="object"&&typeof Iv=="function"&&(e.type="node"),typeof t>"u"?e:e[t]}});var Sb=Ce((aF,Ib)=>{"use strict";var KD=_b()("type")==="browser",WD=KD?t=>new URL(t,window.location.href).href:t=>t;Ib.exports=t=>{let e={...t};return["corePath","workerPath","langPath"].forEach(a=>{t[a]&&(e[a]=WD(e[a]))}),e}});var py=Ce((nF,vb)=>{"use strict";vb.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}});var Tb=Ce((rF,QD)=>{QD.exports={name:"tesseract.js",version:"7.0.0",description:"Pure Javascript Multilingual OCR",main:"src/index.js",type:"commonjs",types:"src/index.d.ts",unpkg:"dist/tesseract.min.js",jsdelivr:"dist/tesseract.min.js",scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs","profile:tesseract":"webpack-bundle-analyzer dist/tesseract-stats.json","profile:worker":"webpack-bundle-analyzer dist/worker-stats.json",prepublishOnly:"npm run build",wait:"rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser test:node:all","test:browser":"karma start karma.conf.js","test:node":"nyc mocha --exit --bail --require ./scripts/test-helper.mjs","test:node:all":"npm run test:node -- ./tests/*.test.mjs",lint:"eslint src","lint:fix":"eslint --fix src",postinstall:"opencollective-postinstall || true"},browser:{"./src/worker/node/index.js":"./src/worker/browser/index.js"},author:"",contributors:["jeromewu"],license:"Apache-2.0",devDependencies:{"@babel/core":"^7.21.4","@babel/eslint-parser":"^7.21.3","@babel/preset-env":"^7.21.4","@rollup/plugin-commonjs":"^24.1.0",acorn:"^8.8.2","babel-loader":"^9.1.2",buffer:"^6.0.3",cors:"^2.8.5",eslint:"^7.32.0","eslint-config-airbnb-base":"^14.2.1","eslint-plugin-import":"^2.27.5","expect.js":"^0.3.1",express:"^4.18.2",mocha:"^10.2.0","npm-run-all":"^4.1.5",karma:"^6.4.2","karma-chrome-launcher":"^3.2.0","karma-firefox-launcher":"^2.1.2","karma-mocha":"^2.0.1","karma-webpack":"^5.0.0",nyc:"^15.1.0",rimraf:"^5.0.0",rollup:"^3.20.7","wait-on":"^7.0.1",webpack:"^5.79.0","webpack-bundle-analyzer":"^4.8.0","webpack-cli":"^5.0.1","webpack-dev-middleware":"^6.0.2","rollup-plugin-sourcemaps":"^0.6.3"},dependencies:{"bmp-js":"^0.1.0","idb-keyval":"^6.2.0","is-url":"^1.2.4","node-fetch":"^2.6.9","opencollective-postinstall":"^2.0.3","regenerator-runtime":"^0.13.3","tesseract.js-core":"^7.0.0","wasm-feature-detect":"^1.8.0",zlibjs:"^0.3.1"},overrides:{"@rollup/pluginutils":"^5.0.2"},repository:{type:"git",url:"https://github.com/naptha/tesseract.js.git"},bugs:{url:"https://github.com/naptha/tesseract.js/issues"},homepage:"https://github.com/naptha/tesseract.js",collective:{type:"opencollective",url:"https://opencollective.com/tesseractjs"}}});var Eb=Ce((sF,wb)=>{"use strict";wb.exports={workerBlobURL:!0,logger:()=>{}}});var bb=Ce((iF,Cb)=>{"use strict";var XD=Tb().version,YD=Eb();Cb.exports={...YD,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${XD}/dist/worker.min.js`}});var Ab=Ce((oF,Lb)=>{"use strict";Lb.exports=({workerPath:t,workerBlobURL:e})=>{let a;if(Blob&&URL&&e){let n=new Blob([`importScripts("${t}");`],{type:"application/javascript"});a=new Worker(URL.createObjectURL(n))}else a=new Worker(t);return a}});var Rb=Ce((uF,xb)=>{"use strict";xb.exports=t=>{t.terminate()}});var Db=Ce((lF,kb)=>{"use strict";kb.exports=(t,e)=>{t.onmessage=({data:a})=>{e(a)}}});var Ob=Ce((cF,Pb)=>{"use strict";Pb.exports=async(t,e)=>{t.postMessage(e)}});var Nb=Ce((dF,Mb)=>{"use strict";var my=t=>new Promise((e,a)=>{let n=new FileReader;n.onload=()=>{e(n.result)},n.onerror=({target:{error:{code:r}}})=>{a(Error(`File could not be read! Code=${r}`))},n.readAsArrayBuffer(t)}),gy=async t=>{let e=t;if(typeof t>"u")return"undefined";if(typeof t=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(t)?e=atob(t.split(",")[1]).split("").map(a=>a.charCodeAt(0)):e=await(await fetch(t)).arrayBuffer();else if(typeof HTMLElement<"u"&&t instanceof HTMLElement)t.tagName==="IMG"&&(e=await gy(t.src)),t.tagName==="VIDEO"&&(e=await gy(t.poster)),t.tagName==="CANVAS"&&await new Promise(a=>{t.toBlob(async n=>{e=await my(n),a()})});else if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas){let a=await t.convertToBlob();e=await my(a)}else(t instanceof File||t instanceof Blob)&&(e=await my(t));return new Uint8Array(e)};Mb.exports=gy});var Ub=Ce((fF,Vb)=>{"use strict";var $D=bb(),JD=Ab(),ZD=Rb(),eP=Db(),tP=Ob(),aP=Nb();Vb.exports={defaultOptions:$D,spawnWorker:JD,terminateWorker:ZD,onMessage:eP,send:tP,loadImage:aP}});var yy=Ce((hF,zb)=>{"use strict";var nP=Sb(),_n=fy(),{log:Fb}=mf(),rP=pf(),Us=py(),{defaultOptions:sP,spawnWorker:iP,terminateWorker:oP,onMessage:uP,loadImage:Bb,send:lP}=Ub(),qb=0;zb.exports=async(t="eng",e=Us.LSTM_ONLY,a={},n={})=>{let r=rP("Worker",qb),{logger:s,errorHandler:i,...u}=nP({...sP,...a}),l={},d=typeof t=="string"?t.split("+"):t,h=e,m=n,p=[Us.DEFAULT,Us.LSTM_ONLY].includes(e)&&!u.legacyCore,I,L,k=new Promise((M,O)=>{L=M,I=O}),D=M=>{I(M.message)},w=iP(u);w.onerror=D,qb+=1;let v=({id:M,action:O,payload:U})=>new Promise(($,W)=>{Fb(`[${r}]: Start ${M}, action=${O}`);let ee=`${O}-${M}`;l[ee]={resolve:$,reject:W},lP(w,{workerId:r,jobId:M,action:O,payload:U})}),b=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),x=M=>v(_n({id:M,action:"load",payload:{options:{lstmOnly:p,corePath:u.corePath,logging:u.logging}}})),B=(M,O,U)=>v(_n({id:U,action:"FS",payload:{method:"writeFile",args:[M,O]}})),G=(M,O)=>v(_n({id:O,action:"FS",payload:{method:"readFile",args:[M,{encoding:"utf8"}]}})),S=(M,O)=>v(_n({id:O,action:"FS",payload:{method:"unlink",args:[M]}})),y=(M,O,U)=>v(_n({id:U,action:"FS",payload:{method:M,args:O}})),_=(M,O)=>v(_n({id:O,action:"loadLanguage",payload:{langs:M,options:{langPath:u.langPath,dataPath:u.dataPath,cachePath:u.cachePath,cacheMethod:u.cacheMethod,gzip:u.gzip,lstmOnly:[Us.DEFAULT,Us.LSTM_ONLY].includes(h)&&!u.legacyLang}}})),T=(M,O,U,$)=>v(_n({id:$,action:"initialize",payload:{langs:M,oem:O,config:U}})),C=(M="eng",O,U,$)=>{if(p&&[Us.TESSERACT_ONLY,Us.TESSERACT_LSTM_COMBINED].includes(O))throw Error("Legacy model requested but code missing.");let W=O||h;h=W;let ee=U||m;m=ee;let ne=(typeof M=="string"?M.split("+"):M).filter(J=>!d.includes(J));return d.push(...ne),ne.length>0?_(ne,$).then(()=>T(M,W,ee,$)):T(M,W,ee,$)},A=(M={},O)=>v(_n({id:O,action:"setParameters",payload:{params:M}})),E=async(M,O={},U={text:!0},$)=>v(_n({id:$,action:"recognize",payload:{image:await Bb(M),options:O,output:U}})),Re=async(M,O)=>{if(p)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return v(_n({id:O,action:"detect",payload:{image:await Bb(M)}}))},Me=async()=>(w!==null&&(oP(w),w=null),Promise.resolve());uP(w,({workerId:M,jobId:O,status:U,action:$,data:W})=>{let ee=`${$}-${O}`;if(U==="resolve")Fb(`[${M}]: Complete ${O}`),l[ee].resolve({jobId:O,data:W}),delete l[ee];else if(U==="reject")if(l[ee].reject(W),delete l[ee],$==="load"&&I(W),i)i(W);else throw Error(W);else U==="progress"&&s({...W,userJobId:O})});let Xa={id:r,worker:w,load:b,writeText:B,readText:G,removeFile:S,FS:y,reinitialize:C,setParameters:A,recognize:E,detect:Re,terminate:Me};return x().then(()=>_(t)).then(()=>T(t,e,n)).then(()=>L(Xa)).catch(()=>{}),k}});var jb=Ce((pF,Gb)=>{"use strict";var Hb=yy(),cP=async(t,e,a)=>{let n=await Hb(e,1,a);return n.recognize(t).finally(async()=>{await n.terminate()})},dP=async(t,e)=>{let a=await Hb("osd",0,e);return a.detect(t).finally(async()=>{await a.terminate()})};Gb.exports={recognize:cP,detect:dP}});var Wb=Ce((mF,Kb)=>{"use strict";Kb.exports={AFR:"afr",AMH:"amh",ARA:"ara",ASM:"asm",AZE:"aze",AZE_CYRL:"aze_cyrl",BEL:"bel",BEN:"ben",BOD:"bod",BOS:"bos",BUL:"bul",CAT:"cat",CEB:"ceb",CES:"ces",CHI_SIM:"chi_sim",CHI_TRA:"chi_tra",CHR:"chr",CYM:"cym",DAN:"dan",DEU:"deu",DZO:"dzo",ELL:"ell",ENG:"eng",ENM:"enm",EPO:"epo",EST:"est",EUS:"eus",FAS:"fas",FIN:"fin",FRA:"fra",FRK:"frk",FRM:"frm",GLE:"gle",GLG:"glg",GRC:"grc",GUJ:"guj",HAT:"hat",HEB:"heb",HIN:"hin",HRV:"hrv",HUN:"hun",IKU:"iku",IND:"ind",ISL:"isl",ITA:"ita",ITA_OLD:"ita_old",JAV:"jav",JPN:"jpn",KAN:"kan",KAT:"kat",KAT_OLD:"kat_old",KAZ:"kaz",KHM:"khm",KIR:"kir",KOR:"kor",KUR:"kur",LAO:"lao",LAT:"lat",LAV:"lav",LIT:"lit",MAL:"mal",MAR:"mar",MKD:"mkd",MLT:"mlt",MSA:"msa",MYA:"mya",NEP:"nep",NLD:"nld",NOR:"nor",ORI:"ori",PAN:"pan",POL:"pol",POR:"por",PUS:"pus",RON:"ron",RUS:"rus",SAN:"san",SIN:"sin",SLK:"slk",SLV:"slv",SPA:"spa",SPA_OLD:"spa_old",SQI:"sqi",SRP:"srp",SRP_LATN:"srp_latn",SWA:"swa",SWE:"swe",SYR:"syr",TAM:"tam",TEL:"tel",TGK:"tgk",TGL:"tgl",THA:"tha",TIR:"tir",TUR:"tur",UIG:"uig",UKR:"ukr",URD:"urd",UZB:"uzb",UZB_CYRL:"uzb_cyrl",VIE:"vie",YID:"yid"}});var Xb=Ce((gF,Qb)=>{"use strict";Qb.exports={OSD_ONLY:"0",AUTO_OSD:"1",AUTO_ONLY:"2",AUTO:"3",SINGLE_COLUMN:"4",SINGLE_BLOCK_VERT_TEXT:"5",SINGLE_BLOCK:"6",SINGLE_LINE:"7",SINGLE_WORD:"8",CIRCLE_WORD:"9",SINGLE_CHAR:"10",SPARSE_TEXT:"11",SPARSE_TEXT_OSD:"12",RAW_LINE:"13"}});var $b=Ce((yF,Yb)=>{"use strict";lb();var fP=gb(),hP=yy(),pP=jb(),mP=Wb(),gP=py(),yP=Xb(),{setLogging:_P}=mf();Yb.exports={languages:mP,OEM:gP,PSM:yP,createScheduler:fP,createWorker:hP,setLogging:_P,...pP}});var rR={};QR(rR,{captureScreenshot:()=>iU});var iU,sR=WR(()=>{iU=async()=>null});var pR=Ce(ip=>{"use strict";var mU=Symbol.for("react.transitional.element"),gU=Symbol.for("react.fragment");function hR(t,e,a){var n=null;if(a!==void 0&&(n=""+a),e.key!==void 0&&(n=""+e.key),"key"in e){a={};for(var r in e)r!=="key"&&(a[r]=e[r])}else a=e;return e=a.ref,{$$typeof:mU,type:t,key:n,ref:e!==void 0?e:null,props:a}}ip.Fragment=gU;ip.jsx=hR;ip.jsxs=hR});var Rt=Ce((f6,mR)=>{"use strict";mR.exports=pR()});var xe=De($a()),ER=De(ub());var oy="http://localhost:3000";console.log("[EXTENSION] Using API_BASE:",oy);function qD(t){return typeof t=="string"?t.startsWith("http")?t:oy+t:t instanceof URL?t.href:t.url}function zD(t,e={}){let a=qD(t),n=e.method||"GET",r=e.headers instanceof Headers||Array.isArray(e.headers)?Object.fromEntries(e.headers):{...e.headers},s=e.body??null;return new Promise((i,u)=>{chrome.runtime.sendMessage({type:"echly-api",url:a,method:n,headers:r,body:s},l=>{if(chrome.runtime.lastError){u(new Error(chrome.runtime.lastError.message));return}if(!l){u(new Error("No response from background"));return}let d=new Response(l.body??"",{status:l.status??0,headers:l.headers?new Headers(l.headers):void 0});i(d)})})}async function tn(t,e={}){let a=t.startsWith("http")?t:oy+t;return zD(a,e)}function uy(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function ly(t,e,a){return new Promise((n,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,feedbackId:a},s=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(s?.error){r(new Error(s.error));return}if(s?.url){n(s.url);return}r(new Error("No URL from background"))})})}async function _y(t){if(!t||typeof t!="string")return"";try{let a=await(await Promise.resolve().then(()=>De($b()))).createWorker("eng",void 0,{logger:()=>{}}),{data:{text:n}}=await a.recognize(t);return await a.terminate(),!n||typeof n!="string"?"":n.replace(/\s+/g," ").trim().slice(0,2e3)}catch{return""}}var fs=De($a());var Jb=()=>{};var tL=function(t){let e=[],a=0;for(let n=0;n<t.length;n++){let r=t.charCodeAt(n);r<128?e[a++]=r:r<2048?(e[a++]=r>>6|192,e[a++]=r&63|128):(r&64512)===55296&&n+1<t.length&&(t.charCodeAt(n+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++n)&1023),e[a++]=r>>18|240,e[a++]=r>>12&63|128,e[a++]=r>>6&63|128,e[a++]=r&63|128):(e[a++]=r>>12|224,e[a++]=r>>6&63|128,e[a++]=r&63|128)}return e},IP=function(t){let e=[],a=0,n=0;for(;a<t.length;){let r=t[a++];if(r<128)e[n++]=String.fromCharCode(r);else if(r>191&&r<224){let s=t[a++];e[n++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){let s=t[a++],i=t[a++],u=t[a++],l=((r&7)<<18|(s&63)<<12|(i&63)<<6|u&63)-65536;e[n++]=String.fromCharCode(55296+(l>>10)),e[n++]=String.fromCharCode(56320+(l&1023))}else{let s=t[a++],i=t[a++];e[n++]=String.fromCharCode((r&15)<<12|(s&63)<<6|i&63)}}return e.join("")},aL={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let a=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let r=0;r<t.length;r+=3){let s=t[r],i=r+1<t.length,u=i?t[r+1]:0,l=r+2<t.length,d=l?t[r+2]:0,h=s>>2,m=(s&3)<<4|u>>4,p=(u&15)<<2|d>>6,I=d&63;l||(I=64,i||(p=64)),n.push(a[h],a[m],a[p],a[I])}return n.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(tL(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):IP(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let a=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let r=0;r<t.length;){let s=a[t.charAt(r++)],u=r<t.length?a[t.charAt(r)]:0;++r;let d=r<t.length?a[t.charAt(r)]:64;++r;let m=r<t.length?a[t.charAt(r)]:64;if(++r,s==null||u==null||d==null||m==null)throw new Sy;let p=s<<2|u>>4;if(n.push(p),d!==64){let I=u<<4&240|d>>2;if(n.push(I),m!==64){let L=d<<6&192|m;n.push(L)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},Sy=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},SP=function(t){let e=tL(t);return aL.encodeByteArray(e,!0)},dl=function(t){return SP(t).replace(/\./g,"")},_f=function(t){try{return aL.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function nL(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var vP=()=>nL().__FIREBASE_DEFAULTS__,TP=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},wP=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&_f(t[1]);return e&&JSON.parse(e)},If=()=>{try{return Jb()||vP()||TP()||wP()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Ty=t=>If()?.emulatorHosts?.[t],Sf=t=>{let e=Ty(t);if(!e)return;let a=e.lastIndexOf(":");if(a<=0||a+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let n=parseInt(e.substring(a+1),10);return e[0]==="["?[e.substring(1,a-1),n]:[e.substring(0,a),n]},wy=()=>If()?.config,Ey=t=>If()?.[`_${t}`];var yf=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,a)=>{this.resolve=e,this.reject=a})}wrapCallback(e){return(a,n)=>{a?this.reject(a):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(a):e(a,n))}}};function In(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Zi(t){return(await fetch(t,{credentials:"include"})).ok}function vf(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let a={alg:"none",type:"JWT"},n=e||"demo-project",r=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let i={iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[dl(JSON.stringify(a)),dl(JSON.stringify(i)),""].join(".")}var cl={};function EP(){let t={prod:[],emulator:[]};for(let e of Object.keys(cl))cl[e]?t.emulator.push(e):t.prod.push(e);return t}function CP(t){let e=document.getElementById(t),a=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),a=!0),{created:a,element:e}}var Zb=!1;function eo(t,e){if(typeof window>"u"||typeof document>"u"||!In(window.location.host)||cl[t]===e||cl[t]||Zb)return;cl[t]=e;function a(p){return`__firebase__banner__${p}`}let n="__firebase__banner",s=EP().prod.length>0;function i(){let p=document.getElementById(n);p&&p.remove()}function u(p){p.style.display="flex",p.style.background="#7faaf0",p.style.position="fixed",p.style.bottom="5px",p.style.left="5px",p.style.padding=".5em",p.style.borderRadius="5px",p.style.alignItems="center"}function l(p,I){p.setAttribute("width","24"),p.setAttribute("id",I),p.setAttribute("height","24"),p.setAttribute("viewBox","0 0 24 24"),p.setAttribute("fill","none"),p.style.marginLeft="-6px"}function d(){let p=document.createElement("span");return p.style.cursor="pointer",p.style.marginLeft="16px",p.style.fontSize="24px",p.innerHTML=" &times;",p.onclick=()=>{Zb=!0,i()},p}function h(p,I){p.setAttribute("id",I),p.innerText="Learn more",p.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",p.setAttribute("target","__blank"),p.style.paddingLeft="5px",p.style.textDecoration="underline"}function m(){let p=CP(n),I=a("text"),L=document.getElementById(I)||document.createElement("span"),k=a("learnmore"),D=document.getElementById(k)||document.createElement("a"),w=a("preprendIcon"),v=document.getElementById(w)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(p.created){let b=p.element;u(b),h(D,k);let x=d();l(v,w),b.append(v,L,D,x),document.body.appendChild(b)}s?(L.innerText="Preview backend disconnected.",v.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
</defs>`,L.innerText="Preview backend running in this workspace."),L.setAttribute("id",I)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}function Vt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function rL(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Vt())}function bP(){let t=If()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function sL(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function iL(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function oL(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function uL(){let t=Vt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function lL(){return!bP()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Cy(){try{return typeof indexedDB=="object"}catch{return!1}}function cL(){return new Promise((t,e)=>{try{let a=!0,n="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(n);r.onsuccess=()=>{r.result.close(),a||self.indexedDB.deleteDatabase(n),t(!0)},r.onupgradeneeded=()=>{a=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(a){e(a)}})}var LP="FirebaseError",na=class t extends Error{constructor(e,a,n){super(a),this.code=e,this.customData=n,this.name=LP,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ar.prototype.create)}},ar=class{constructor(e,a,n){this.service=e,this.serviceName=a,this.errors=n}create(e,...a){let n=a[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?AP(s,n):"Error",u=`${this.serviceName}: ${i} (${r}).`;return new na(r,u,n)}};function AP(t,e){return t.replace(xP,(a,n)=>{let r=e[n];return r!=null?String(r):`<${n}?>`})}var xP=/\{\$([^}]+)}/g;function dL(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function an(t,e){if(t===e)return!0;let a=Object.keys(t),n=Object.keys(e);for(let r of a){if(!n.includes(r))return!1;let s=t[r],i=e[r];if(eL(s)&&eL(i)){if(!an(s,i))return!1}else if(s!==i)return!1}for(let r of n)if(!a.includes(r))return!1;return!0}function eL(t){return t!==null&&typeof t=="object"}function to(t){let e=[];for(let[a,n]of Object.entries(t))Array.isArray(n)?n.forEach(r=>{e.push(encodeURIComponent(a)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(a)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function ao(t){let e={};return t.replace(/^\?/,"").split("&").forEach(n=>{if(n){let[r,s]=n.split("=");e[decodeURIComponent(r)]=decodeURIComponent(s)}}),e}function no(t){let e=t.indexOf("?");if(!e)return"";let a=t.indexOf("#",e);return t.substring(e,a>0?a:void 0)}function fL(t,e){let a=new vy(t,e);return a.subscribe.bind(a)}var vy=class{constructor(e,a){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=a,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(a=>{a.next(e)})}error(e){this.forEachObserver(a=>{a.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,a,n){let r;if(e===void 0&&a===void 0&&n===void 0)throw new Error("Missing Observer.");RP(e,["next","error","complete"])?r=e:r={next:e,error:a,complete:n},r.next===void 0&&(r.next=Iy),r.error===void 0&&(r.error=Iy),r.complete===void 0&&(r.complete=Iy);let s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let a=0;a<this.observers.length;a++)this.sendOne(a,e)}sendOne(e,a){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{a(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function RP(t,e){if(typeof t!="object"||t===null)return!1;for(let a of e)if(a in t&&typeof t[a]=="function")return!0;return!1}function Iy(){}var vF=4*60*60*1e3;function Ut(t){return t&&t._delegate?t._delegate:t}var fa=class{constructor(e,a,n){this.name=e,this.instanceFactory=a,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var Fs="[DEFAULT]";var by=class{constructor(e,a){this.name=e,this.container=a,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let a=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(a)){let n=new yf;if(this.instancesDeferred.set(a,n),this.isInitialized(a)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:a});r&&n.resolve(r)}catch{}}return this.instancesDeferred.get(a).promise}getImmediate(e){let a=this.normalizeInstanceIdentifier(e?.identifier),n=e?.optional??!1;if(this.isInitialized(a)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:a})}catch(r){if(n)return null;throw r}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(DP(e))try{this.getOrInitializeService({instanceIdentifier:Fs})}catch{}for(let[a,n]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(a);try{let s=this.getOrInitializeService({instanceIdentifier:r});n.resolve(s)}catch{}}}}clearInstance(e=Fs){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(a=>"INTERNAL"in a).map(a=>a.INTERNAL.delete()),...e.filter(a=>"_delete"in a).map(a=>a._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Fs){return this.instances.has(e)}getOptions(e=Fs){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:a={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:n,options:a});for(let[s,i]of this.instancesDeferred.entries()){let u=this.normalizeInstanceIdentifier(s);n===u&&i.resolve(r)}return r}onInit(e,a){let n=this.normalizeInstanceIdentifier(a),r=this.onInitCallbacks.get(n)??new Set;r.add(e),this.onInitCallbacks.set(n,r);let s=this.instances.get(n);return s&&e(s,n),()=>{r.delete(e)}}invokeOnInitCallbacks(e,a){let n=this.onInitCallbacks.get(a);if(n)for(let r of n)try{r(e,a)}catch{}}getOrInitializeService({instanceIdentifier:e,options:a={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:kP(e),options:a}),this.instances.set(e,n),this.instancesOptions.set(e,a),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=Fs){return this.component?this.component.multipleInstances?e:Fs:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function kP(t){return t===Fs?void 0:t}function DP(t){return t.instantiationMode==="EAGER"}var Tf=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let a=this.getProvider(e.name);if(a.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);a.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let a=new by(e,this);return this.providers.set(e,a),a}getProviders(){return Array.from(this.providers.values())}};var PP=[],de;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(de||(de={}));var OP={debug:de.DEBUG,verbose:de.VERBOSE,info:de.INFO,warn:de.WARN,error:de.ERROR,silent:de.SILENT},MP=de.INFO,NP={[de.DEBUG]:"log",[de.VERBOSE]:"log",[de.INFO]:"info",[de.WARN]:"warn",[de.ERROR]:"error"},VP=(t,e,...a)=>{if(e<t.logLevel)return;let n=new Date().toISOString(),r=NP[e];if(r)console[r](`[${n}]  ${t.name}:`,...a);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},rs=class{constructor(e){this.name=e,this._logLevel=MP,this._logHandler=VP,this._userLogHandler=null,PP.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in de))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?OP[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,de.DEBUG,...e),this._logHandler(this,de.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,de.VERBOSE,...e),this._logHandler(this,de.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,de.INFO,...e),this._logHandler(this,de.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,de.WARN,...e),this._logHandler(this,de.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,de.ERROR,...e),this._logHandler(this,de.ERROR,...e)}};var UP=(t,e)=>e.some(a=>t instanceof a),hL,pL;function FP(){return hL||(hL=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function BP(){return pL||(pL=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var mL=new WeakMap,Ay=new WeakMap,gL=new WeakMap,Ly=new WeakMap,Ry=new WeakMap;function qP(t){let e=new Promise((a,n)=>{let r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{a(Sn(t.result)),r()},i=()=>{n(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(a=>{a instanceof IDBCursor&&mL.set(a,t)}).catch(()=>{}),Ry.set(e,t),e}function zP(t){if(Ay.has(t))return;let e=new Promise((a,n)=>{let r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{a(),r()},i=()=>{n(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});Ay.set(t,e)}var xy={get(t,e,a){if(t instanceof IDBTransaction){if(e==="done")return Ay.get(t);if(e==="objectStoreNames")return t.objectStoreNames||gL.get(t);if(e==="store")return a.objectStoreNames[1]?void 0:a.objectStore(a.objectStoreNames[0])}return Sn(t[e])},set(t,e,a){return t[e]=a,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function yL(t){xy=t(xy)}function HP(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...a){let n=t.call(wf(this),e,...a);return gL.set(n,e.sort?e.sort():[e]),Sn(n)}:BP().includes(t)?function(...e){return t.apply(wf(this),e),Sn(mL.get(this))}:function(...e){return Sn(t.apply(wf(this),e))}}function GP(t){return typeof t=="function"?HP(t):(t instanceof IDBTransaction&&zP(t),UP(t,FP())?new Proxy(t,xy):t)}function Sn(t){if(t instanceof IDBRequest)return qP(t);if(Ly.has(t))return Ly.get(t);let e=GP(t);return e!==t&&(Ly.set(t,e),Ry.set(e,t)),e}var wf=t=>Ry.get(t);function IL(t,e,{blocked:a,upgrade:n,blocking:r,terminated:s}={}){let i=indexedDB.open(t,e),u=Sn(i);return n&&i.addEventListener("upgradeneeded",l=>{n(Sn(i.result),l.oldVersion,l.newVersion,Sn(i.transaction),l)}),a&&i.addEventListener("blocked",l=>a(l.oldVersion,l.newVersion,l)),u.then(l=>{s&&l.addEventListener("close",()=>s()),r&&l.addEventListener("versionchange",d=>r(d.oldVersion,d.newVersion,d))}).catch(()=>{}),u}var jP=["get","getKey","getAll","getAllKeys","count"],KP=["put","add","delete","clear"],ky=new Map;function _L(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(ky.get(e))return ky.get(e);let a=e.replace(/FromIndex$/,""),n=e!==a,r=KP.includes(a);if(!(a in(n?IDBIndex:IDBObjectStore).prototype)||!(r||jP.includes(a)))return;let s=async function(i,...u){let l=this.transaction(i,r?"readwrite":"readonly"),d=l.store;return n&&(d=d.index(u.shift())),(await Promise.all([d[a](...u),r&&l.done]))[0]};return ky.set(e,s),s}yL(t=>({...t,get:(e,a,n)=>_L(e,a)||t.get(e,a,n),has:(e,a)=>!!_L(e,a)||t.has(e,a)}));var Py=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(a=>{if(WP(a)){let n=a.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(a=>a).join(" ")}};function WP(t){return t.getComponent()?.type==="VERSION"}var Oy="@firebase/app",SL="0.14.9";var nr=new rs("@firebase/app"),QP="@firebase/app-compat",XP="@firebase/analytics-compat",YP="@firebase/analytics",$P="@firebase/app-check-compat",JP="@firebase/app-check",ZP="@firebase/auth",eO="@firebase/auth-compat",tO="@firebase/database",aO="@firebase/data-connect",nO="@firebase/database-compat",rO="@firebase/functions",sO="@firebase/functions-compat",iO="@firebase/installations",oO="@firebase/installations-compat",uO="@firebase/messaging",lO="@firebase/messaging-compat",cO="@firebase/performance",dO="@firebase/performance-compat",fO="@firebase/remote-config",hO="@firebase/remote-config-compat",pO="@firebase/storage",mO="@firebase/storage-compat",gO="@firebase/firestore",yO="@firebase/ai",_O="@firebase/firestore-compat",IO="firebase",SO="12.10.0";var My="[DEFAULT]",vO={[Oy]:"fire-core",[QP]:"fire-core-compat",[YP]:"fire-analytics",[XP]:"fire-analytics-compat",[JP]:"fire-app-check",[$P]:"fire-app-check-compat",[ZP]:"fire-auth",[eO]:"fire-auth-compat",[tO]:"fire-rtdb",[aO]:"fire-data-connect",[nO]:"fire-rtdb-compat",[rO]:"fire-fn",[sO]:"fire-fn-compat",[iO]:"fire-iid",[oO]:"fire-iid-compat",[uO]:"fire-fcm",[lO]:"fire-fcm-compat",[cO]:"fire-perf",[dO]:"fire-perf-compat",[fO]:"fire-rc",[hO]:"fire-rc-compat",[pO]:"fire-gcs",[mO]:"fire-gcs-compat",[gO]:"fire-fst",[_O]:"fire-fst-compat",[yO]:"fire-vertex","fire-js":"fire-js",[IO]:"fire-js-all"};var Ef=new Map,TO=new Map,Ny=new Map;function vL(t,e){try{t.container.addComponent(e)}catch(a){nr.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,a)}}function vn(t){let e=t.name;if(Ny.has(e))return nr.debug(`There were multiple attempts to register component ${e}.`),!1;Ny.set(e,t);for(let a of Ef.values())vL(a,t);for(let a of TO.values())vL(a,t);return!0}function Bs(t,e){let a=t.container.getProvider("heartbeat").getImmediate({optional:!0});return a&&a.triggerHeartbeat(),t.container.getProvider(e)}function pa(t){return t==null?!1:t.settings!==void 0}var wO={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ss=new ar("app","Firebase",wO);var Vy=class{constructor(e,a,n){this._isDeleted=!1,this._options={...e},this._config={...a},this._name=a.name,this._automaticDataCollectionEnabled=a.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new fa("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw ss.create("app-deleted",{appName:this._name})}};var Tn=SO;function By(t,e={}){let a=t;typeof e!="object"&&(e={name:e});let n={name:My,automaticDataCollectionEnabled:!0,...e},r=n.name;if(typeof r!="string"||!r)throw ss.create("bad-app-name",{appName:String(r)});if(a||(a=wy()),!a)throw ss.create("no-options");let s=Ef.get(r);if(s){if(an(a,s.options)&&an(n,s.config))return s;throw ss.create("duplicate-app",{appName:r})}let i=new Tf(r);for(let l of Ny.values())i.addComponent(l);let u=new Vy(a,n,i);return Ef.set(r,u),u}function ro(t=My){let e=Ef.get(t);if(!e&&t===My&&wy())return By();if(!e)throw ss.create("no-app",{appName:t});return e}function ha(t,e,a){let n=vO[t]??t;a&&(n+=`-${a}`);let r=n.match(/\s|\//),s=e.match(/\s|\//);if(r||s){let i=[`Unable to register library "${n}" with version "${e}":`];r&&i.push(`library name "${n}" contains illegal characters (whitespace or "/")`),r&&s&&i.push("and"),s&&i.push(`version name "${e}" contains illegal characters (whitespace or "/")`),nr.warn(i.join(" "));return}vn(new fa(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}var EO="firebase-heartbeat-database",CO=1,fl="firebase-heartbeat-store",Dy=null;function CL(){return Dy||(Dy=IL(EO,CO,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(fl)}catch(a){console.warn(a)}}}}).catch(t=>{throw ss.create("idb-open",{originalErrorMessage:t.message})})),Dy}async function bO(t){try{let a=(await CL()).transaction(fl),n=await a.objectStore(fl).get(bL(t));return await a.done,n}catch(e){if(e instanceof na)nr.warn(e.message);else{let a=ss.create("idb-get",{originalErrorMessage:e?.message});nr.warn(a.message)}}}async function TL(t,e){try{let n=(await CL()).transaction(fl,"readwrite");await n.objectStore(fl).put(e,bL(t)),await n.done}catch(a){if(a instanceof na)nr.warn(a.message);else{let n=ss.create("idb-set",{originalErrorMessage:a?.message});nr.warn(n.message)}}}function bL(t){return`${t.name}!${t.options.appId}`}var LO=1024,AO=30,Uy=class{constructor(e){this.container=e,this._heartbeatsCache=null;let a=this.container.getProvider("app").getImmediate();this._storage=new Fy(a),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){try{let a=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),n=wL();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===n||this._heartbeatsCache.heartbeats.some(r=>r.date===n))return;if(this._heartbeatsCache.heartbeats.push({date:n,agent:a}),this._heartbeatsCache.heartbeats.length>AO){let r=RO(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){nr.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=wL(),{heartbeatsToSend:a,unsentEntries:n}=xO(this._heartbeatsCache.heartbeats),r=dl(JSON.stringify({version:2,heartbeats:a}));return this._heartbeatsCache.lastSentHeartbeatDate=e,n.length>0?(this._heartbeatsCache.heartbeats=n,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return nr.warn(e),""}}};function wL(){return new Date().toISOString().substring(0,10)}function xO(t,e=LO){let a=[],n=t.slice();for(let r of t){let s=a.find(i=>i.agent===r.agent);if(s){if(s.dates.push(r.date),EL(a)>e){s.dates.pop();break}}else if(a.push({agent:r.agent,dates:[r.date]}),EL(a)>e){a.pop();break}n=n.slice(1)}return{heartbeatsToSend:a,unsentEntries:n}}var Fy=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Cy()?cL().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let a=await bO(this.app);return a?.heartbeats?a:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let n=await this.read();return TL(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let n=await this.read();return TL(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}};function EL(t){return dl(JSON.stringify({version:2,heartbeats:t})).length}function RO(t){if(t.length===0)return-1;let e=0,a=t[0].date;for(let n=1;n<t.length;n++)t[n].date<a&&(a=t[n].date,e=n);return e}function kO(t){vn(new fa("platform-logger",e=>new Py(e),"PRIVATE")),vn(new fa("heartbeat",e=>new Uy(e),"PRIVATE")),ha(Oy,SL,t),ha(Oy,SL,"esm2020"),ha("fire-js","")}kO("");var DO="firebase",PO="12.10.0";ha(DO,PO,"app");function jL(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var KL=jL,WL=new ar("auth","Firebase",jL());var kf=new rs("@firebase/auth");function OO(t,...e){kf.logLevel<=de.WARN&&kf.warn(`Auth (${Tn}): ${t}`,...e)}function bf(t,...e){kf.logLevel<=de.ERROR&&kf.error(`Auth (${Tn}): ${t}`,...e)}function nn(t,...e){throw d_(t,...e)}function En(t,...e){return d_(t,...e)}function QL(t,e,a){let n={...KL(),[e]:a};return new ar("auth","Firebase",n).create(e,{appName:t.name})}function qs(t){return QL(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function d_(t,...e){if(typeof t!="string"){let a=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=t.name),t._errorFactory.create(a,...n)}return WL.create(t,...e)}function Y(t,e,...a){if(!t)throw d_(e,...a)}function wn(t){let e="INTERNAL ASSERTION FAILED: "+t;throw bf(e),new Error(e)}function sr(t,e){t||wn(e)}function Ky(){return typeof self<"u"&&self.location?.href||""}function MO(){return LL()==="http:"||LL()==="https:"}function LL(){return typeof self<"u"&&self.location?.protocol||null}function NO(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(MO()||iL()||"connection"in navigator)?navigator.onLine:!0}function VO(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var zs=class{constructor(e,a){this.shortDelay=e,this.longDelay=a,sr(a>e,"Short delay should be less than long delay!"),this.isMobile=rL()||oL()}get(){return NO()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function f_(t,e){sr(t.emulator,"Emulator should always be set here");let{url:a}=t.emulator;return e?`${a}${e.startsWith("/")?e.slice(1):e}`:a}var Df=class{static initialize(e,a,n){this.fetchImpl=e,a&&(this.headersImpl=a),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;wn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;wn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;wn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var UO={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var FO=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],BO=new zs(3e4,6e4);function Ft(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function $t(t,e,a,n,r={}){return XL(t,r,async()=>{let s={},i={};n&&(e==="GET"?i=n:s={body:JSON.stringify(n)});let u=to({key:t.config.apiKey,...i}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let d={method:e,headers:l,...s};return sL()||(d.referrerPolicy="no-referrer"),t.emulatorConfig&&In(t.emulatorConfig.host)&&(d.credentials="include"),Df.fetch()(await YL(t,t.config.apiHost,a,u),d)})}async function XL(t,e,a){t._canInitEmulator=!1;let n={...UO,...e};try{let r=new Wy(t),s=await Promise.race([a(),r.promise]);r.clearNetworkTimeout();let i=await s.json();if("needConfirmation"in i)throw pl(t,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{let u=s.ok?i.errorMessage:i.error.message,[l,d]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw pl(t,"credential-already-in-use",i);if(l==="EMAIL_EXISTS")throw pl(t,"email-already-in-use",i);if(l==="USER_DISABLED")throw pl(t,"user-disabled",i);let h=n[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw QL(t,h,d);nn(t,h)}}catch(r){if(r instanceof na)throw r;nn(t,"network-request-failed",{message:String(r)})}}async function Ws(t,e,a,n,r={}){let s=await $t(t,e,a,n,r);return"mfaPendingCredential"in s&&nn(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function YL(t,e,a,n){let r=`${e}${a}?${n}`,s=t,i=s.config.emulator?f_(t.config,r):`${t.config.apiScheme}://${r}`;return FO.includes(a)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(i).toString():i}function qO(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var Wy=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((a,n)=>{this.timer=setTimeout(()=>n(En(this.auth,"network-request-failed")),BO.get())})}};function pl(t,e,a){let n={appName:t.name};a.email&&(n.email=a.email),a.phoneNumber&&(n.phoneNumber=a.phoneNumber);let r=En(t,e,n);return r.customData._tokenResponse=a,r}function AL(t){return t!==void 0&&t.enterprise!==void 0}var Pf=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let a of this.recaptchaEnforcementState)if(a.provider&&a.provider===e)return qO(a.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function $L(t,e){return $t(t,"GET","/v2/recaptchaConfig",Ft(t,e))}async function zO(t,e){return $t(t,"POST","/v1/accounts:delete",e)}async function Of(t,e){return $t(t,"POST","/v1/accounts:lookup",e)}function ml(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function JL(t,e=!1){let a=Ut(t),n=await a.getIdToken(e),r=h_(n);Y(r&&r.exp&&r.auth_time&&r.iat,a.auth,"internal-error");let s=typeof r.firebase=="object"?r.firebase:void 0,i=s?.sign_in_provider;return{claims:r,token:n,authTime:ml(qy(r.auth_time)),issuedAtTime:ml(qy(r.iat)),expirationTime:ml(qy(r.exp)),signInProvider:i||null,signInSecondFactor:s?.sign_in_second_factor||null}}function qy(t){return Number(t)*1e3}function h_(t){let[e,a,n]=t.split(".");if(e===void 0||a===void 0||n===void 0)return bf("JWT malformed, contained fewer than 3 sections"),null;try{let r=_f(a);return r?JSON.parse(r):(bf("Failed to decode base64 JWT payload"),null)}catch(r){return bf("Caught error parsing JWT payload as JSON",r?.toString()),null}}function xL(t){let e=h_(t);return Y(e,"internal-error"),Y(typeof e.exp<"u","internal-error"),Y(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function Il(t,e,a=!1){if(a)return e;try{return await e}catch(n){throw n instanceof na&&HO(n)&&t.auth.currentUser===t&&await t.auth.signOut(),n}}function HO({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var Qy=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let a=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),a}else{this.errorBackoff=3e4;let n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;let a=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},a)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var Sl=class{constructor(e,a){this.createdAt=e,this.lastLoginAt=a,this._initializeTime()}_initializeTime(){this.lastSignInTime=ml(this.lastLoginAt),this.creationTime=ml(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function Mf(t){let e=t.auth,a=await t.getIdToken(),n=await Il(t,Of(e,{idToken:a}));Y(n?.users.length,e,"internal-error");let r=n.users[0];t._notifyReloadListener(r);let s=r.providerUserInfo?.length?eA(r.providerUserInfo):[],i=GO(t.providerData,s),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!i?.length,d=u?l:!1,h={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new Sl(r.createdAt,r.lastLoginAt),isAnonymous:d};Object.assign(t,h)}async function ZL(t){let e=Ut(t);await Mf(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function GO(t,e){return[...t.filter(n=>!e.some(r=>r.providerId===n.providerId)),...e]}function eA(t){return t.map(({providerId:e,...a})=>({providerId:e,uid:a.rawId||"",displayName:a.displayName||null,email:a.email||null,phoneNumber:a.phoneNumber||null,photoURL:a.photoUrl||null}))}async function jO(t,e){let a=await XL(t,{},async()=>{let n=to({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,i=await YL(t,r,"/v1/token",`key=${s}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:n};return t.emulatorConfig&&In(t.emulatorConfig.host)&&(l.credentials="include"),Df.fetch()(i,l)});return{accessToken:a.access_token,expiresIn:a.expires_in,refreshToken:a.refresh_token}}async function KO(t,e){return $t(t,"POST","/v2/accounts:revokeToken",Ft(t,e))}var gl=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){Y(e.idToken,"internal-error"),Y(typeof e.idToken<"u","internal-error"),Y(typeof e.refreshToken<"u","internal-error");let a="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):xL(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,a)}updateFromIdToken(e){Y(e.length!==0,"internal-error");let a=xL(e);this.updateTokensAndExpiration(e,null,a)}async getToken(e,a=!1){return!a&&this.accessToken&&!this.isExpired?this.accessToken:(Y(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,a){let{accessToken:n,refreshToken:r,expiresIn:s}=await jO(e,a);this.updateTokensAndExpiration(n,r,Number(s))}updateTokensAndExpiration(e,a,n){this.refreshToken=a||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,a){let{refreshToken:n,accessToken:r,expirationTime:s}=a,i=new t;return n&&(Y(typeof n=="string","internal-error",{appName:e}),i.refreshToken=n),r&&(Y(typeof r=="string","internal-error",{appName:e}),i.accessToken=r),s&&(Y(typeof s=="number","internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return wn("not implemented")}};function is(t,e){Y(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var os=class t{constructor({uid:e,auth:a,stsTokenManager:n,...r}){this.providerId="firebase",this.proactiveRefresh=new Qy(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=a,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Sl(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let a=await Il(this,this.stsTokenManager.getToken(this.auth,e));return Y(a,this.auth,"internal-error"),this.accessToken!==a&&(this.accessToken=a,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),a}getIdTokenResult(e){return JL(this,e)}reload(){return ZL(this)}_assign(e){this!==e&&(Y(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(a=>({...a})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let a=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return a.metadata._copy(this.metadata),a}_onReload(e){Y(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,a=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),a&&await Mf(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(pa(this.auth.app))return Promise.reject(qs(this.auth));let e=await this.getIdToken();return await Il(this,zO(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,a){let n=a.displayName??void 0,r=a.email??void 0,s=a.phoneNumber??void 0,i=a.photoURL??void 0,u=a.tenantId??void 0,l=a._redirectEventId??void 0,d=a.createdAt??void 0,h=a.lastLoginAt??void 0,{uid:m,emailVerified:p,isAnonymous:I,providerData:L,stsTokenManager:k}=a;Y(m&&k,e,"internal-error");let D=gl.fromJSON(this.name,k);Y(typeof m=="string",e,"internal-error"),is(n,e.name),is(r,e.name),Y(typeof p=="boolean",e,"internal-error"),Y(typeof I=="boolean",e,"internal-error"),is(s,e.name),is(i,e.name),is(u,e.name),is(l,e.name),is(d,e.name),is(h,e.name);let w=new t({uid:m,auth:e,email:r,emailVerified:p,displayName:n,isAnonymous:I,photoURL:i,phoneNumber:s,tenantId:u,stsTokenManager:D,createdAt:d,lastLoginAt:h});return L&&Array.isArray(L)&&(w.providerData=L.map(v=>({...v}))),l&&(w._redirectEventId=l),w}static async _fromIdTokenResponse(e,a,n=!1){let r=new gl;r.updateFromServerResponse(a);let s=new t({uid:a.localId,auth:e,stsTokenManager:r,isAnonymous:n});return await Mf(s),s}static async _fromGetAccountInfoResponse(e,a,n){let r=a.users[0];Y(r.localId!==void 0,"internal-error");let s=r.providerUserInfo!==void 0?eA(r.providerUserInfo):[],i=!(r.email&&r.passwordHash)&&!s?.length,u=new gl;u.updateFromIdToken(n);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:i}),d={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new Sl(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!s?.length};return Object.assign(l,d),l}};var RL=new Map;function rr(t){sr(t instanceof Function,"Expected a class definition");let e=RL.get(t);return e?(sr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,RL.set(t,e),e)}var Nf=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,a){this.storage[e]=a}async _get(e){let a=this.storage[e];return a===void 0?null:a}async _remove(e){delete this.storage[e]}_addListener(e,a){}_removeListener(e,a){}};Nf.type="NONE";var Xy=Nf;function Lf(t,e,a){return`firebase:${t}:${e}:${a}`}var Vf=class t{constructor(e,a,n){this.persistence=e,this.auth=a,this.userKey=n;let{config:r,name:s}=this.auth;this.fullUserKey=Lf(this.userKey,r.apiKey,s),this.fullPersistenceKey=Lf("persistence",r.apiKey,s),this.boundEventHandler=a._onStorageEvent.bind(a),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let a=await Of(this.auth,{idToken:e}).catch(()=>{});return a?os._fromGetAccountInfoResponse(this.auth,a,e):null}return os._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let a=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,a)return this.setCurrentUser(a)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,a,n="authUser"){if(!a.length)return new t(rr(Xy),e,n);let r=(await Promise.all(a.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d),s=r[0]||rr(Xy),i=Lf(n,e.config.apiKey,e.name),u=null;for(let d of a)try{let h=await d._get(i);if(h){let m;if(typeof h=="string"){let p=await Of(e,{idToken:h}).catch(()=>{});if(!p)break;m=await os._fromGetAccountInfoResponse(e,p,h)}else m=os._fromJSON(e,h);d!==s&&(u=m),s=d;break}}catch{}let l=r.filter(d=>d._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new t(s,e,n):(s=l[0],u&&await s._set(i,u.toJSON()),await Promise.all(a.map(async d=>{if(d!==s)try{await d._remove(i)}catch{}})),new t(s,e,n))}};function kL(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(rA(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(tA(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(iA(e))return"Blackberry";if(oA(e))return"Webos";if(aA(e))return"Safari";if((e.includes("chrome/")||nA(e))&&!e.includes("edge/"))return"Chrome";if(sA(e))return"Android";{let a=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=t.match(a);if(n?.length===2)return n[1]}return"Other"}function tA(t=Vt()){return/firefox\//i.test(t)}function aA(t=Vt()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function nA(t=Vt()){return/crios\//i.test(t)}function rA(t=Vt()){return/iemobile/i.test(t)}function sA(t=Vt()){return/android/i.test(t)}function iA(t=Vt()){return/blackberry/i.test(t)}function oA(t=Vt()){return/webos/i.test(t)}function p_(t=Vt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function WO(t=Vt()){return p_(t)&&!!window.navigator?.standalone}function QO(){return uL()&&document.documentMode===10}function uA(t=Vt()){return p_(t)||sA(t)||oA(t)||iA(t)||/windows phone/i.test(t)||rA(t)}function lA(t,e=[]){let a;switch(t){case"Browser":a=kL(Vt());break;case"Worker":a=`${kL(Vt())}-${t}`;break;default:a=t}let n=e.length?e.join(","):"FirebaseCore-web";return`${a}/JsCore/${Tn}/${n}`}var Yy=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,a){let n=s=>new Promise((i,u)=>{try{let l=e(s);i(l)}catch(l){u(l)}});n.onAbort=a,this.queue.push(n);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let a=[];try{for(let n of this.queue)await n(e),n.onAbort&&a.push(n.onAbort)}catch(n){a.reverse();for(let r of a)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n?.message})}}};async function XO(t,e={}){return $t(t,"GET","/v2/passwordPolicy",Ft(t,e))}var YO=6,$y=class{constructor(e){let a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=a.minPasswordLength??YO,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let a={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,a),this.validatePasswordCharacterOptions(e,a),a.isValid&&(a.isValid=a.meetsMinPasswordLength??!0),a.isValid&&(a.isValid=a.meetsMaxPasswordLength??!0),a.isValid&&(a.isValid=a.containsLowercaseLetter??!0),a.isValid&&(a.isValid=a.containsUppercaseLetter??!0),a.isValid&&(a.isValid=a.containsNumericCharacter??!0),a.isValid&&(a.isValid=a.containsNonAlphanumericCharacter??!0),a}validatePasswordLengthOptions(e,a){let n=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;n&&(a.meetsMinPasswordLength=e.length>=n),r&&(a.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,a){this.updatePasswordCharacterOptionsStatuses(a,!1,!1,!1,!1);let n;for(let r=0;r<e.length;r++)n=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(a,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,a,n,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=a)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};var Jy=class{constructor(e,a,n,r){this.app=e,this.heartbeatServiceProvider=a,this.appCheckServiceProvider=n,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Uf(this),this.idTokenSubscription=new Uf(this),this.beforeStateQueue=new Yy(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=WL,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,a){return a&&(this._popupRedirectResolver=rr(a)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Vf.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(a),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let a=await Of(this,{idToken:e}),n=await os._fromGetAccountInfoResponse(this,a,e);await this.directlySetCurrentUser(n)}catch(a){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",a),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(pa(this.app)){let s=this.app.settings.authIdToken;return s?new Promise(i=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(s).then(i,i))}):this.directlySetCurrentUser(null)}let a=await this.assertedPersistence.getCurrentUser(),n=a,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let s=this.redirectUser?._redirectEventId,i=n?._redirectEventId,u=await this.tryRedirectSignIn(e);(!s||s===i)&&u?.user&&(n=u.user,r=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(n)}catch(s){n=a,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(s))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return Y(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let a=null;try{a=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return a}async reloadAndSetCurrentUserOrClear(e){try{await Mf(e)}catch(a){if(a?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=VO()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(pa(this.app))return Promise.reject(qs(this));let a=e?Ut(e):null;return a&&Y(a.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(a&&a._clone(this))}async _updateCurrentUser(e,a=!1){if(!this._deleted)return e&&Y(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),a||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return pa(this.app)?Promise.reject(qs(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return pa(this.app)?Promise.reject(qs(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(rr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let a=this._getPasswordPolicyInternal();return a.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):a.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await XO(this),a=new $y(e);this.tenantId===null?this._projectPasswordPolicy=a:this._tenantPasswordPolicies[this.tenantId]=a}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ar("auth","Firebase",e())}onAuthStateChanged(e,a,n){return this.registerStateListener(this.authStateSubscription,e,a,n)}beforeAuthStateChanged(e,a){return this.beforeStateQueue.pushCallback(e,a)}onIdTokenChanged(e,a,n){return this.registerStateListener(this.idTokenSubscription,e,a,n)}authStateReady(){return new Promise((e,a)=>{if(this.currentUser)e();else{let n=this.onAuthStateChanged(()=>{n(),e()},a)}})}async revokeAccessToken(e){if(this.currentUser){let a=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:a};this.tenantId!=null&&(n.tenantId=this.tenantId),await KO(this,n)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,a){let n=await this.getOrInitRedirectPersistenceManager(a);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let a=e&&rr(e)||this._popupRedirectResolver;Y(a,this,"argument-error"),this.redirectPersistenceManager=await Vf.create(this,[rr(a._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,a,n,r){if(this._deleted)return()=>{};let s=typeof a=="function"?a:a.next.bind(a),i=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(Y(u,this,"internal-error"),u.then(()=>{i||s(this.currentUser)}),typeof a=="function"){let l=e.addObserver(a,n,r);return()=>{i=!0,l()}}else{let l=e.addObserver(a);return()=>{i=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return Y(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=lA(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let a=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();a&&(e["X-Firebase-Client"]=a);let n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){if(pa(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&OO(`Error while retrieving App Check token: ${e.error}`),e?.token}};function oo(t){return Ut(t)}var Uf=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=fL(a=>this.observer=a)}get next(){return Y(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var ah={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function $O(t){ah=t}function cA(t){return ah.loadJS(t)}function JO(){return ah.recaptchaEnterpriseScript}function ZO(){return ah.gapiScript}function dA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var Zy=class{constructor(){this.enterprise=new e_}ready(e){e()}execute(e,a){return Promise.resolve("token")}render(e,a){return""}},e_=class{ready(e){e()}execute(e,a){return Promise.resolve("token")}render(e,a){return""}};var eM="recaptcha-enterprise",yl="NO_RECAPTCHA",Ff=class{constructor(e){this.type=eM,this.auth=oo(e)}async verify(e="verify",a=!1){async function n(s){if(!a){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(i,u)=>{$L(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let d=new Pf(l);return s.tenantId==null?s._agentRecaptchaConfig=d:s._tenantRecaptchaConfigs[s.tenantId]=d,i(d.siteKey)}}).catch(l=>{u(l)})})}function r(s,i,u){let l=window.grecaptcha;AL(l)?l.enterprise.ready(()=>{l.enterprise.execute(s,{action:e}).then(d=>{i(d)}).catch(()=>{i(yl)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Zy().execute("siteKey",{action:"verify"}):new Promise((s,i)=>{n(this.auth).then(u=>{if(!a&&AL(window.grecaptcha))r(u,s,i);else{if(typeof window>"u"){i(new Error("RecaptchaVerifier is only supported in browser"));return}let l=JO();l.length!==0&&(l+=u),cA(l).then(()=>{r(u,s,i)}).catch(d=>{i(d)})}}).catch(u=>{i(u)})})}};async function hl(t,e,a,n=!1,r=!1){let s=new Ff(t),i;if(r)i=yl;else try{i=await s.verify(a)}catch{i=await s.verify(a,!0)}let u={...e};if(a==="mfaSmsEnrollment"||a==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,d=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:d,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return n?Object.assign(u,{captchaResp:i}):Object.assign(u,{captchaResponse:i}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function _l(t,e,a,n,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let s=await hl(t,e,a,a==="getOobCode");return n(t,s)}else return n(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${a} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let i=await hl(t,e,a,a==="getOobCode");return n(t,i)}else return Promise.reject(s)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let s=await hl(t,e,a);return n(t,s).catch(async i=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(i.code==="auth/missing-recaptcha-token"||i.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${a} flow.`);let u=await hl(t,e,a,!1,!0);return n(t,u)}return Promise.reject(i)})}else{let s=await hl(t,e,a,!1,!0);return n(t,s)}else return Promise.reject(r+" provider is not supported.")}async function tM(t){let e=oo(t),a=await $L(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),n=new Pf(a);e.tenantId==null?e._agentRecaptchaConfig=n:e._tenantRecaptchaConfigs[e.tenantId]=n,n.isAnyProviderEnabled()&&new Ff(e).verify()}function fA(t,e){let a=Bs(t,"auth");if(a.isInitialized()){let r=a.getImmediate(),s=a.getOptions();if(an(s,e??{}))return r;nn(r,"already-initialized")}return a.initialize({options:e})}function aM(t,e){let a=e?.persistence||[],n=(Array.isArray(a)?a:[a]).map(rr);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(n,e?.popupRedirectResolver)}function hA(t,e,a){let n=oo(t);Y(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");let r=!!a?.disableWarnings,s=pA(e),{host:i,port:u}=nM(e),l=u===null?"":`:${u}`,d={url:`${s}//${i}${l}/`},h=Object.freeze({host:i,port:u,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!n._canInitEmulator){Y(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),Y(an(d,n.config.emulator)&&an(h,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=d,n.emulatorConfig=h,n.settings.appVerificationDisabledForTesting=!0,In(i)?(Zi(`${s}//${i}${l}`),eo("Auth",!0)):r||rM()}function pA(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function nM(t){let e=pA(t),a=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!a)return{host:"",port:null};let n=a[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(n);if(r){let s=r[1];return{host:s,port:DL(n.substr(s.length+1))}}else{let[s,i]=n.split(":");return{host:s,port:DL(i)}}}function DL(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function rM(){function t(){let e=document.createElement("p"),a=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",a.position="fixed",a.width="100%",a.backgroundColor="#ffffff",a.border=".1em solid #000000",a.color="#b50000",a.bottom="0px",a.left="0px",a.margin="0px",a.zIndex="10000",a.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var Hs=class{constructor(e,a){this.providerId=e,this.signInMethod=a}toJSON(){return wn("not implemented")}_getIdTokenResponse(e){return wn("not implemented")}_linkToIdToken(e,a){return wn("not implemented")}_getReauthenticationResolver(e){return wn("not implemented")}};async function sM(t,e){return $t(t,"POST","/v1/accounts:signUp",e)}async function iM(t,e){return Ws(t,"POST","/v1/accounts:signInWithPassword",Ft(t,e))}async function oM(t,e){return Ws(t,"POST","/v1/accounts:signInWithEmailLink",Ft(t,e))}async function uM(t,e){return Ws(t,"POST","/v1/accounts:signInWithEmailLink",Ft(t,e))}var vl=class t extends Hs{constructor(e,a,n,r=null){super("password",n),this._email=e,this._password=a,this._tenantId=r}static _fromEmailAndPassword(e,a){return new t(e,a,"password")}static _fromEmailAndCode(e,a,n=null){return new t(e,a,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let a=typeof e=="string"?JSON.parse(e):e;if(a?.email&&a?.password){if(a.signInMethod==="password")return this._fromEmailAndPassword(a.email,a.password);if(a.signInMethod==="emailLink")return this._fromEmailAndCode(a.email,a.password,a.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let a={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return _l(e,a,"signInWithPassword",iM,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return oM(e,{email:this._email,oobCode:this._password});default:nn(e,"internal-error")}}async _linkToIdToken(e,a){switch(this.signInMethod){case"password":let n={idToken:a,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return _l(e,n,"signUpPassword",sM,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return uM(e,{idToken:a,email:this._email,oobCode:this._password});default:nn(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function so(t,e){return Ws(t,"POST","/v1/accounts:signInWithIdp",Ft(t,e))}var lM="http://localhost",Gs=class t extends Hs{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let a=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(a.idToken=e.idToken),e.accessToken&&(a.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(a.nonce=e.nonce),e.pendingToken&&(a.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(a.accessToken=e.oauthToken,a.secret=e.oauthTokenSecret):nn("argument-error"),a}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let a=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:r,...s}=a;if(!n||!r)return null;let i=new t(n,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){let a=this.buildRequest();return so(e,a)}_linkToIdToken(e,a){let n=this.buildRequest();return n.idToken=a,so(e,n)}_getReauthenticationResolver(e){let a=this.buildRequest();return a.autoCreate=!1,so(e,a)}buildRequest(){let e={requestUri:lM,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let a={};this.idToken&&(a.id_token=this.idToken),this.accessToken&&(a.access_token=this.accessToken),this.secret&&(a.oauth_token_secret=this.secret),a.providerId=this.providerId,this.nonce&&!this.pendingToken&&(a.nonce=this.nonce),e.postBody=to(a)}return e}};async function PL(t,e){return $t(t,"POST","/v1/accounts:sendVerificationCode",Ft(t,e))}async function cM(t,e){return Ws(t,"POST","/v1/accounts:signInWithPhoneNumber",Ft(t,e))}async function dM(t,e){let a=await Ws(t,"POST","/v1/accounts:signInWithPhoneNumber",Ft(t,e));if(a.temporaryProof)throw pl(t,"account-exists-with-different-credential",a);return a}var fM={USER_NOT_FOUND:"user-not-found"};async function hM(t,e){let a={...e,operation:"REAUTH"};return Ws(t,"POST","/v1/accounts:signInWithPhoneNumber",Ft(t,a),fM)}var Tl=class t extends Hs{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,a){return new t({verificationId:e,verificationCode:a})}static _fromTokenResponse(e,a){return new t({phoneNumber:e,temporaryProof:a})}_getIdTokenResponse(e){return cM(e,this._makeVerificationRequest())}_linkToIdToken(e,a){return dM(e,{idToken:a,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return hM(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:a,verificationId:n,verificationCode:r}=this.params;return e&&a?{temporaryProof:e,phoneNumber:a}:{sessionInfo:n,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:a,verificationCode:n,phoneNumber:r,temporaryProof:s}=e;return!n&&!a&&!r&&!s?null:new t({verificationId:a,verificationCode:n,phoneNumber:r,temporaryProof:s})}};function pM(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function mM(t){let e=ao(no(t)).link,a=e?ao(no(e)).deep_link_id:null,n=ao(no(t)).deep_link_id;return(n?ao(no(n)).link:null)||n||a||e||t}var Bf=class t{constructor(e){let a=ao(no(e)),n=a.apiKey??null,r=a.oobCode??null,s=pM(a.mode??null);Y(n&&r&&s,"argument-error"),this.apiKey=n,this.operation=s,this.code=r,this.continueUrl=a.continueUrl??null,this.languageCode=a.lang??null,this.tenantId=a.tenantId??null}static parseLink(e){let a=mM(e);try{return new t(a)}catch{return null}}};var io=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,a){return vl._fromEmailAndPassword(e,a)}static credentialWithLink(e,a){let n=Bf.parseLink(a);return Y(n,"argument-error"),vl._fromEmailAndCode(e,n.code,n.tenantId)}};io.PROVIDER_ID="password";io.EMAIL_PASSWORD_SIGN_IN_METHOD="password";io.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var qf=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var js=class extends qf{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var wl=class t extends js{constructor(){super("facebook.com")}static credential(e){return Gs._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};wl.FACEBOOK_SIGN_IN_METHOD="facebook.com";wl.PROVIDER_ID="facebook.com";var El=class t extends js{constructor(){super("google.com"),this.addScope("profile")}static credential(e,a){return Gs._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:a})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:a,oauthAccessToken:n}=e;if(!a&&!n)return null;try{return t.credential(a,n)}catch{return null}}};El.GOOGLE_SIGN_IN_METHOD="google.com";El.PROVIDER_ID="google.com";var Cl=class t extends js{constructor(){super("github.com")}static credential(e){return Gs._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};Cl.GITHUB_SIGN_IN_METHOD="github.com";Cl.PROVIDER_ID="github.com";var bl=class t extends js{constructor(){super("twitter.com")}static credential(e,a){return Gs._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:a})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:a,oauthTokenSecret:n}=e;if(!a||!n)return null;try{return t.credential(a,n)}catch{return null}}};bl.TWITTER_SIGN_IN_METHOD="twitter.com";bl.PROVIDER_ID="twitter.com";var Ll=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,a,n,r=!1){let s=await os._fromIdTokenResponse(e,n,r),i=OL(n);return new t({user:s,providerId:i,_tokenResponse:n,operationType:a})}static async _forOperation(e,a,n){await e._updateTokensIfNecessary(n,!0);let r=OL(n);return new t({user:e,providerId:r,_tokenResponse:n,operationType:a})}};function OL(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var t_=class t extends na{constructor(e,a,n,r){super(a.code,a.message),this.operationType=n,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:a.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,a,n,r){return new t(e,a,n,r)}};function mA(t,e,a,n){return(e==="reauthenticate"?a._getReauthenticationResolver(t):a._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?t_._fromErrorAndOperation(t,s,e,n):s})}async function gM(t,e,a=!1){let n=await Il(t,e._linkToIdToken(t.auth,await t.getIdToken()),a);return Ll._forOperation(t,"link",n)}async function yM(t,e,a=!1){let{auth:n}=t;if(pa(n.app))return Promise.reject(qs(n));let r="reauthenticate";try{let s=await Il(t,mA(n,r,e,t),a);Y(s.idToken,n,"internal-error");let i=h_(s.idToken);Y(i,n,"internal-error");let{sub:u}=i;return Y(t.uid===u,n,"user-mismatch"),Ll._forOperation(t,r,s)}catch(s){throw s?.code==="auth/user-not-found"&&nn(n,"user-mismatch"),s}}async function _M(t,e,a=!1){if(pa(t.app))return Promise.reject(qs(t));let n="signIn",r=await mA(t,n,e),s=await Ll._fromIdTokenResponse(t,n,r);return a||await t._updateCurrentUser(s.user),s}function gA(t,e,a,n){return Ut(t).onIdTokenChanged(e,a,n)}function yA(t,e,a){return Ut(t).beforeAuthStateChanged(e,a)}function ML(t,e){return $t(t,"POST","/v2/accounts/mfaEnrollment:start",Ft(t,e))}function IM(t,e){return $t(t,"POST","/v2/accounts/mfaEnrollment:finalize",Ft(t,e))}function SM(t,e){return $t(t,"POST","/v2/accounts/mfaEnrollment:start",Ft(t,e))}function vM(t,e){return $t(t,"POST","/v2/accounts/mfaEnrollment:finalize",Ft(t,e))}var zf="__sak";var Hf=class{constructor(e,a){this.storageRetriever=e,this.type=a}_isAvailable(){try{return this.storage?(this.storage.setItem(zf,"1"),this.storage.removeItem(zf),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,a){return this.storage.setItem(e,JSON.stringify(a)),Promise.resolve()}_get(e){let a=this.storage.getItem(e);return Promise.resolve(a?JSON.parse(a):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var TM=1e3,wM=10,Gf=class extends Hf{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,a)=>this.onStorageEvent(e,a),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=uA(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let a of Object.keys(this.listeners)){let n=this.storage.getItem(a),r=this.localCache[a];n!==r&&e(a,r,n)}}onStorageEvent(e,a=!1){if(!e.key){this.forAllChangedKeys((i,u,l)=>{this.notifyListeners(i,l)});return}let n=e.key;a?this.detachListener():this.stopPolling();let r=()=>{let i=this.storage.getItem(n);!a&&this.localCache[n]===i||this.notifyListeners(n,i)},s=this.storage.getItem(n);QO()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,wM):r()}notifyListeners(e,a){this.localCache[e]=a;let n=this.listeners[e];if(n)for(let r of Array.from(n))r(a&&JSON.parse(a))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,a,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:a,newValue:n}),!0)})},TM)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,a){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(a)}_removeListener(e,a){this.listeners[e]&&(this.listeners[e].delete(a),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,a){await super._set(e,a),this.localCache[e]=JSON.stringify(a)}async _get(e){let a=await super._get(e);return this.localCache[e]=JSON.stringify(a),a}async _remove(e){await super._remove(e),delete this.localCache[e]}};Gf.type="LOCAL";var _A=Gf;var EM=1e3;function zy(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),a=RegExp(`${e}=([^;]+)`);return document.cookie.match(a)?.[1]??null}function Hy(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var a_=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let a=new URL(`${window.location.origin}/__cookies__`);return a.searchParams.set("finalTarget",e),a}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,a){}async _get(e){if(!this._isAvailable())return null;let a=Hy(e);return window.cookieStore?(await window.cookieStore.get(a))?.value:zy(a)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let n=Hy(e);document.cookie=`${n}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,a){if(!this._isAvailable())return;let n=Hy(e);if(window.cookieStore){let u=d=>{let h=d.changed.find(p=>p.name===n);h&&a(h.value),d.deleted.find(p=>p.name===n)&&a(null)},l=()=>window.cookieStore.removeEventListener("change",u);return this.listenerUnsubscribes.set(a,l),window.cookieStore.addEventListener("change",u)}let r=zy(n),s=setInterval(()=>{let u=zy(n);u!==r&&(a(u),r=u)},EM),i=()=>clearInterval(s);this.listenerUnsubscribes.set(a,i)}_removeListener(e,a){let n=this.listenerUnsubscribes.get(a);n&&(n(),this.listenerUnsubscribes.delete(a))}};a_.type="COOKIE";var jf=class extends Hf{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,a){}_removeListener(e,a){}};jf.type="SESSION";var m_=jf;function CM(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(a){return{fulfilled:!1,reason:a}}}))}var Kf=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let a=this.receivers.find(r=>r.isListeningto(e));if(a)return a;let n=new t(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let a=e,{eventId:n,eventType:r,data:s}=a.data,i=this.handlersMap[r];if(!i?.size)return;a.ports[0].postMessage({status:"ack",eventId:n,eventType:r});let u=Array.from(i).map(async d=>d(a.origin,s)),l=await CM(u);a.ports[0].postMessage({status:"done",eventId:n,eventType:r,response:l})}_subscribe(e,a){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(a)}_unsubscribe(e,a){this.handlersMap[e]&&a&&this.handlersMap[e].delete(a),(!a||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Kf.receivers=[];function g_(t="",e=10){let a="";for(let n=0;n<e;n++)a+=Math.floor(Math.random()*10);return t+a}var n_=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,a,n=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((u,l)=>{let d=g_("",20);r.port1.start();let h=setTimeout(()=>{l(new Error("unsupported_event"))},n);i={messageChannel:r,onMessage(m){let p=m;if(p.data.eventId===d)switch(p.data.status){case"ack":clearTimeout(h),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),u(p.data.response);break;default:clearTimeout(h),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:d,data:a},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}};function Cn(){return window}function bM(t){Cn().location.href=t}function IA(){return typeof Cn().WorkerGlobalScope<"u"&&typeof Cn().importScripts=="function"}async function LM(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function AM(){return navigator?.serviceWorker?.controller||null}function xM(){return IA()?self:null}var SA="firebaseLocalStorageDb",RM=1,Wf="firebaseLocalStorage",vA="fbase_key",Ks=class{constructor(e){this.request=e}toPromise(){return new Promise((e,a)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{a(this.request.error)})})}};function nh(t,e){return t.transaction([Wf],e?"readwrite":"readonly").objectStore(Wf)}function kM(){let t=indexedDB.deleteDatabase(SA);return new Ks(t).toPromise()}function r_(){let t=indexedDB.open(SA,RM);return new Promise((e,a)=>{t.addEventListener("error",()=>{a(t.error)}),t.addEventListener("upgradeneeded",()=>{let n=t.result;try{n.createObjectStore(Wf,{keyPath:vA})}catch(r){a(r)}}),t.addEventListener("success",async()=>{let n=t.result;n.objectStoreNames.contains(Wf)?e(n):(n.close(),await kM(),e(await r_()))})})}async function NL(t,e,a){let n=nh(t,!0).put({[vA]:e,value:a});return new Ks(n).toPromise()}async function DM(t,e){let a=nh(t,!1).get(e),n=await new Ks(a).toPromise();return n===void 0?null:n.value}function VL(t,e){let a=nh(t,!0).delete(e);return new Ks(a).toPromise()}var PM=800,OM=3,Qf=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await r_(),this.db)}async _withRetries(e){let a=0;for(;;)try{let n=await this._openDb();return await e(n)}catch(n){if(a++>OM)throw n;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return IA()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Kf._getInstance(xM()),this.receiver._subscribe("keyChanged",async(e,a)=>({keyProcessed:(await this._poll()).includes(a.key)})),this.receiver._subscribe("ping",async(e,a)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await LM(),!this.activeServiceWorker)return;this.sender=new n_(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||AM()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await r_();return await NL(e,zf,"1"),await VL(e,zf),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,a){return this._withPendingWrite(async()=>(await this._withRetries(n=>NL(n,e,a)),this.localCache[e]=a,this.notifyServiceWorker(e)))}async _get(e){let a=await this._withRetries(n=>DM(n,e));return this.localCache[e]=a,a}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(a=>VL(a,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let s=nh(r,!1).getAll();return new Ks(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let a=[],n=new Set;if(e.length!==0)for(let{fbase_key:r,value:s}of e)n.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),a.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!n.has(r)&&(this.notifyListeners(r,null),a.push(r));return a}notifyListeners(e,a){this.localCache[e]=a;let n=this.listeners[e];if(n)for(let r of Array.from(n))r(a)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),PM)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,a){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(a)}_removeListener(e,a){this.listeners[e]&&(this.listeners[e].delete(a),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Qf.type="LOCAL";var TA=Qf;function UL(t,e){return $t(t,"POST","/v2/accounts/mfaSignIn:start",Ft(t,e))}function MM(t,e){return $t(t,"POST","/v2/accounts/mfaSignIn:finalize",Ft(t,e))}function NM(t,e){return $t(t,"POST","/v2/accounts/mfaSignIn:finalize",Ft(t,e))}var WF=dA("rcb"),QF=new zs(3e4,6e4);var Af="recaptcha";async function VM(t,e,a){if(!t._getRecaptchaConfig())try{await tM(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let n;if(typeof e=="string"?n={phoneNumber:e}:n=e,"session"in n){let r=n.session;if("phoneNumber"in n){Y(r.type==="enroll",t,"internal-error");let s={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:n.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await _l(t,s,"mfaSmsEnrollment",async(d,h)=>{if(h.phoneEnrollmentInfo.captchaResponse===yl){Y(a?.type===Af,d,"argument-error");let m=await Gy(d,h,a);return ML(d,m)}return ML(d,h)},"PHONE_PROVIDER").catch(d=>Promise.reject(d))).phoneSessionInfo.sessionInfo}else{Y(r.type==="signin",t,"internal-error");let s=n.multiFactorHint?.uid||n.multiFactorUid;Y(s,t,"missing-multi-factor-info");let i={mfaPendingCredential:r.credential,mfaEnrollmentId:s,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await _l(t,i,"mfaSmsSignIn",async(h,m)=>{if(m.phoneSignInInfo.captchaResponse===yl){Y(a?.type===Af,h,"argument-error");let p=await Gy(h,m,a);return UL(h,p)}return UL(h,m)},"PHONE_PROVIDER").catch(h=>Promise.reject(h))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:n.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await _l(t,r,"sendVerificationCode",async(l,d)=>{if(d.captchaResponse===yl){Y(a?.type===Af,l,"argument-error");let h=await Gy(l,d,a);return PL(l,h)}return PL(l,d)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{a?._reset()}}async function Gy(t,e,a){Y(a.type===Af,t,"argument-error");let n=await a.verify();Y(typeof n=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let s=r.phoneEnrollmentInfo.phoneNumber,i=r.phoneEnrollmentInfo.captchaResponse,u=r.phoneEnrollmentInfo.clientType,l=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:n,captchaResponse:i,clientType:u,recaptchaVersion:l}}),r}else if("phoneSignInInfo"in r){let s=r.phoneSignInInfo.captchaResponse,i=r.phoneSignInInfo.clientType,u=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:n,captchaResponse:s,clientType:i,recaptchaVersion:u}}),r}else return Object.assign(r,{recaptchaToken:n}),r}var Al=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=oo(e)}verifyPhoneNumber(e,a){return VM(this.auth,e,Ut(a))}static credential(e,a){return Tl._fromVerification(e,a)}static credentialFromResult(e){let a=e;return t.credentialFromTaggedObject(a)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:a,temporaryProof:n}=e;return a&&n?Tl._fromTokenResponse(a,n):null}};Al.PROVIDER_ID="phone";Al.PHONE_SIGN_IN_METHOD="phone";function UM(t,e){return e?rr(e):(Y(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var xl=class extends Hs{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return so(e,this._buildIdpRequest())}_linkToIdToken(e,a){return so(e,this._buildIdpRequest(a))}_getReauthenticationResolver(e){return so(e,this._buildIdpRequest())}_buildIdpRequest(e){let a={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(a.idToken=e),a}};function FM(t){return _M(t.auth,new xl(t),t.bypassAuthState)}function BM(t){let{auth:e,user:a}=t;return Y(a,e,"internal-error"),yM(a,new xl(t),t.bypassAuthState)}async function qM(t){let{auth:e,user:a}=t;return Y(a,e,"internal-error"),gM(a,new xl(t),t.bypassAuthState)}var Xf=class{constructor(e,a,n,r,s=!1){this.auth=e,this.resolver=n,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(a)?a:[a]}execute(){return new Promise(async(e,a)=>{this.pendingPromise={resolve:e,reject:a};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){let{urlResponse:a,sessionId:n,postBody:r,tenantId:s,error:i,type:u}=e;if(i){this.reject(i);return}let l={auth:this.auth,requestUri:a,sessionId:n,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(l))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return FM;case"linkViaPopup":case"linkViaRedirect":return qM;case"reauthViaPopup":case"reauthViaRedirect":return BM;default:nn(this.auth,"internal-error")}}resolve(e){sr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){sr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var zM=new zs(2e3,1e4);var s_=class t extends Xf{constructor(e,a,n,r,s){super(e,a,r,s),this.provider=n,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return Y(e,this.auth,"internal-error"),e}async onExecution(){sr(this.filter.length===1,"Popup operations only handle one event");let e=g_();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(a=>{this.reject(a)}),this.resolver._isIframeWebStorageSupported(this.auth,a=>{a||this.reject(En(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(En(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(En(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,zM.get())};e()}};s_.currentPopupAction=null;var HM="pendingRedirect",xf=new Map,i_=class extends Xf{constructor(e,a,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],a,void 0,n),this.eventId=null}async execute(){let e=xf.get(this.auth._key());if(!e){try{let n=await GM(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(a){e=()=>Promise.reject(a)}xf.set(this.auth._key(),e)}return this.bypassAuthState||xf.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let a=await this.auth._redirectUserForId(e.eventId);if(a)return this.user=a,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function GM(t,e){let a=WM(e),n=KM(t);if(!await n._isAvailable())return!1;let r=await n._get(a)==="true";return await n._remove(a),r}function jM(t,e){xf.set(t._key(),e)}function KM(t){return rr(t._redirectPersistence)}function WM(t){return Lf(HM,t.config.apiKey,t.name)}async function QM(t,e,a=!1){if(pa(t.app))return Promise.reject(qs(t));let n=oo(t),r=UM(n,e),i=await new i_(n,r,a).execute();return i&&!a&&(delete i.user._redirectEventId,await n._persistUserIfCurrent(i.user),await n._setRedirectUser(null,e)),i}var XM=10*60*1e3,o_=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let a=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(a=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!YM(e)||(this.hasHandledPotentialRedirect=!0,a||(this.queuedRedirectEvent=e,a=!0)),a}sendToConsumer(e,a){if(e.error&&!wA(e)){let n=e.error.code?.split("auth/")[1]||"internal-error";a.onError(En(this.auth,n))}else a.onAuthEvent(e)}isEventForConsumer(e,a){let n=a.eventId===null||!!e.eventId&&e.eventId===a.eventId;return a.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=XM&&this.cachedEventUids.clear(),this.cachedEventUids.has(FL(e))}saveEventToCache(e){this.cachedEventUids.add(FL(e)),this.lastProcessedEventTime=Date.now()}};function FL(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function wA({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function YM(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return wA(t);default:return!1}}async function $M(t,e={}){return $t(t,"GET","/v1/projects",e)}var JM=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,ZM=/^https?/;async function eN(t){if(t.config.emulator)return;let{authorizedDomains:e}=await $M(t);for(let a of e)try{if(tN(a))return}catch{}nn(t,"unauthorized-domain")}function tN(t){let e=Ky(),{protocol:a,hostname:n}=new URL(e);if(t.startsWith("chrome-extension://")){let i=new URL(t);return i.hostname===""&&n===""?a==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):a==="chrome-extension:"&&i.hostname===n}if(!ZM.test(a))return!1;if(JM.test(t))return n===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(n)}var aN=new zs(3e4,6e4);function BL(){let t=Cn().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let a=0;a<t.CP.length;a++)t.CP[a]=null}}function nN(t){return new Promise((e,a)=>{function n(){BL(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{BL(),a(En(t,"network-request-failed"))},timeout:aN.get()})}if(Cn().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(Cn().gapi?.load)n();else{let r=dA("iframefcb");return Cn()[r]=()=>{gapi.load?n():a(En(t,"network-request-failed"))},cA(`${ZO()}?onload=${r}`).catch(s=>a(s))}}).catch(e=>{throw Rf=null,e})}var Rf=null;function rN(t){return Rf=Rf||nN(t),Rf}var sN=new zs(5e3,15e3),iN="__/auth/iframe",oN="emulator/auth/iframe",uN={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},lN=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function cN(t){let e=t.config;Y(e.authDomain,t,"auth-domain-config-required");let a=e.emulator?f_(e,oN):`https://${t.config.authDomain}/${iN}`,n={apiKey:e.apiKey,appName:t.name,v:Tn},r=lN.get(t.config.apiHost);r&&(n.eid=r);let s=t._getFrameworks();return s.length&&(n.fw=s.join(",")),`${a}?${to(n).slice(1)}`}async function dN(t){let e=await rN(t),a=Cn().gapi;return Y(a,t,"internal-error"),e.open({where:document.body,url:cN(t),messageHandlersFilter:a.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:uN,dontclear:!0},n=>new Promise(async(r,s)=>{await n.restyle({setHideOnLeave:!1});let i=En(t,"network-request-failed"),u=Cn().setTimeout(()=>{s(i)},sN.get());function l(){Cn().clearTimeout(u),r(n)}n.ping(l).then(l,()=>{s(i)})}))}var fN={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},hN=500,pN=600,mN="_blank",gN="http://localhost",Yf=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function yN(t,e,a,n=hN,r=pN){let s=Math.max((window.screen.availHeight-r)/2,0).toString(),i=Math.max((window.screen.availWidth-n)/2,0).toString(),u="",l={...fN,width:n.toString(),height:r.toString(),top:s,left:i},d=Vt().toLowerCase();a&&(u=nA(d)?mN:a),tA(d)&&(e=e||gN,l.scrollbars="yes");let h=Object.entries(l).reduce((p,[I,L])=>`${p}${I}=${L},`,"");if(WO(d)&&u!=="_self")return _N(e||"",u),new Yf(null);let m=window.open(e||"",u,h);Y(m,t,"popup-blocked");try{m.focus()}catch{}return new Yf(m)}function _N(t,e){let a=document.createElement("a");a.href=t,a.target=e;let n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),a.dispatchEvent(n)}var IN="__/auth/handler",SN="emulator/auth/handler",vN=encodeURIComponent("fac");async function qL(t,e,a,n,r,s){Y(t.config.authDomain,t,"auth-domain-config-required"),Y(t.config.apiKey,t,"invalid-api-key");let i={apiKey:t.config.apiKey,appName:t.name,authType:a,redirectUrl:n,v:Tn,eventId:r};if(e instanceof qf){e.setDefaultLanguage(t.languageCode),i.providerId=e.providerId||"",dL(e.getCustomParameters())||(i.customParameters=JSON.stringify(e.getCustomParameters()));for(let[h,m]of Object.entries(s||{}))i[h]=m}if(e instanceof js){let h=e.getScopes().filter(m=>m!=="");h.length>0&&(i.scopes=h.join(","))}t.tenantId&&(i.tid=t.tenantId);let u=i;for(let h of Object.keys(u))u[h]===void 0&&delete u[h];let l=await t._getAppCheckToken(),d=l?`#${vN}=${encodeURIComponent(l)}`:"";return`${TN(t)}?${to(u).slice(1)}${d}`}function TN({config:t}){return t.emulator?f_(t,SN):`https://${t.authDomain}/${IN}`}var jy="webStorageSupport",u_=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=m_,this._completeRedirectFn=QM,this._overrideRedirectResult=jM}async _openPopup(e,a,n,r){sr(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let s=await qL(e,a,n,Ky(),r);return yN(e,s,g_())}async _openRedirect(e,a,n,r){await this._originValidation(e);let s=await qL(e,a,n,Ky(),r);return bM(s),new Promise(()=>{})}_initialize(e){let a=e._key();if(this.eventManagers[a]){let{manager:r,promise:s}=this.eventManagers[a];return r?Promise.resolve(r):(sr(s,"If manager is not set, promise should be"),s)}let n=this.initAndGetManager(e);return this.eventManagers[a]={promise:n},n.catch(()=>{delete this.eventManagers[a]}),n}async initAndGetManager(e){let a=await dN(e),n=new o_(e);return a.register("authEvent",r=>(Y(r?.authEvent,e,"invalid-auth-event"),{status:n.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=a,n}_isIframeWebStorageSupported(e,a){this.iframes[e._key()].send(jy,{type:jy},r=>{let s=r?.[0]?.[jy];s!==void 0&&a(!!s),nn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let a=e._key();return this.originValidationPromises[a]||(this.originValidationPromises[a]=eN(e)),this.originValidationPromises[a]}get _shouldInitProactively(){return uA()||aA()||p_()}},EA=u_,$f=class{constructor(e){this.factorId=e}_process(e,a,n){switch(a.type){case"enroll":return this._finalizeEnroll(e,a.credential,n);case"signin":return this._finalizeSignIn(e,a.credential);default:return wn("unexpected MultiFactorSessionType")}}},l_=class t extends $f{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,a,n){return IM(e,{idToken:a,displayName:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,a){return MM(e,{mfaPendingCredential:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Jf=class{constructor(){}static assertion(e){return l_._fromCredential(e)}};Jf.FACTOR_ID="phone";var Zf=class{static assertionForEnrollment(e,a){return eh._fromSecret(e,a)}static assertionForSignIn(e,a){return eh._fromEnrollmentId(e,a)}static async generateSecret(e){let a=e;Y(typeof a.user?.auth<"u","internal-error");let n=await SM(a.user.auth,{idToken:a.credential,totpEnrollmentInfo:{}});return th._fromStartTotpMfaEnrollmentResponse(n,a.user.auth)}};Zf.FACTOR_ID="totp";var eh=class t extends $f{constructor(e,a,n){super("totp"),this.otp=e,this.enrollmentId=a,this.secret=n}static _fromSecret(e,a){return new t(a,void 0,e)}static _fromEnrollmentId(e,a){return new t(a,e)}async _finalizeEnroll(e,a,n){return Y(typeof this.secret<"u",e,"argument-error"),vM(e,{idToken:a,displayName:n,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,a){Y(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let n={verificationCode:this.otp};return NM(e,{mfaPendingCredential:a,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:n})}},th=class t{constructor(e,a,n,r,s,i,u){this.sessionInfo=i,this.auth=u,this.secretKey=e,this.hashingAlgorithm=a,this.codeLength=n,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,a){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,a)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,a){let n=!1;return(Cf(e)||Cf(a))&&(n=!0),n&&(Cf(e)&&(e=this.auth.currentUser?.email||"unknownuser"),Cf(a)&&(a=this.auth.name)),`otpauth://totp/${a}:${e}?secret=${this.secretKey}&issuer=${a}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function Cf(t){return typeof t>"u"||t?.length===0}var zL="@firebase/auth",HL="1.12.1";var c_=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let a=this.auth.onIdTokenChanged(n=>{e(n?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,a),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let a=this.internalListeners.get(e);a&&(this.internalListeners.delete(e),a(),this.updateProactiveRefresh())}assertAuthConfigured(){Y(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function wN(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function EN(t){vn(new fa("auth",(e,{options:a})=>{let n=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:u}=n.options;Y(i&&!i.includes(":"),"invalid-api-key",{appName:n.name});let l={apiKey:i,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:lA(t)},d=new Jy(n,r,s,l);return aM(d,a),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,a,n)=>{e.getProvider("auth-internal").initialize()})),vn(new fa("auth-internal",e=>{let a=oo(e.getProvider("auth").getImmediate());return(n=>new c_(n))(a)},"PRIVATE").setInstantiationMode("EXPLICIT")),ha(zL,HL,wN(t)),ha(zL,HL,"esm2020")}var CN=5*60,bN=Ey("authIdTokenMaxAge")||CN,GL=null,LN=t=>async e=>{let a=e&&await e.getIdTokenResult(),n=a&&(new Date().getTime()-Date.parse(a.issuedAtTime))/1e3;if(n&&n>bN)return;let r=a?.token;GL!==r&&(GL=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function y_(t=ro()){let e=Bs(t,"auth");if(e.isInitialized())return e.getImmediate();let a=fA(t,{popupRedirectResolver:EA,persistence:[TA,_A,m_]}),n=Ey("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){let s=new URL(n,location.origin);if(location.origin===s.origin){let i=LN(s.toString());yA(a,i,()=>i(a.currentUser)),gA(a,u=>i(u))}}let r=Ty("auth");return r&&hA(a,`http://${r}`),a}function AN(){return document.getElementsByTagName("head")?.[0]??document}$O({loadJS(t){return new Promise((e,a)=>{let n=document.createElement("script");n.setAttribute("src",t),n.onload=e,n.onerror=r=>{let s=En("internal-error");s.customData=r,a(s)},n.type="text/javascript",n.charset="UTF-8",AN().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});EN("Browser");var CA=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},bA={};var ir,__;(function(){var t;function e(S,y){function _(){}_.prototype=y.prototype,S.F=y.prototype,S.prototype=new _,S.prototype.constructor=S,S.D=function(T,C,A){for(var E=Array(arguments.length-2),Re=2;Re<arguments.length;Re++)E[Re-2]=arguments[Re];return y.prototype[C].apply(T,E)}}function a(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(n,a),n.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(S,y,_){_||(_=0);let T=Array(16);if(typeof y=="string")for(var C=0;C<16;++C)T[C]=y.charCodeAt(_++)|y.charCodeAt(_++)<<8|y.charCodeAt(_++)<<16|y.charCodeAt(_++)<<24;else for(C=0;C<16;++C)T[C]=y[_++]|y[_++]<<8|y[_++]<<16|y[_++]<<24;y=S.g[0],_=S.g[1],C=S.g[2];let A=S.g[3],E;E=y+(A^_&(C^A))+T[0]+3614090360&4294967295,y=_+(E<<7&4294967295|E>>>25),E=A+(C^y&(_^C))+T[1]+3905402710&4294967295,A=y+(E<<12&4294967295|E>>>20),E=C+(_^A&(y^_))+T[2]+606105819&4294967295,C=A+(E<<17&4294967295|E>>>15),E=_+(y^C&(A^y))+T[3]+3250441966&4294967295,_=C+(E<<22&4294967295|E>>>10),E=y+(A^_&(C^A))+T[4]+4118548399&4294967295,y=_+(E<<7&4294967295|E>>>25),E=A+(C^y&(_^C))+T[5]+1200080426&4294967295,A=y+(E<<12&4294967295|E>>>20),E=C+(_^A&(y^_))+T[6]+2821735955&4294967295,C=A+(E<<17&4294967295|E>>>15),E=_+(y^C&(A^y))+T[7]+4249261313&4294967295,_=C+(E<<22&4294967295|E>>>10),E=y+(A^_&(C^A))+T[8]+1770035416&4294967295,y=_+(E<<7&4294967295|E>>>25),E=A+(C^y&(_^C))+T[9]+2336552879&4294967295,A=y+(E<<12&4294967295|E>>>20),E=C+(_^A&(y^_))+T[10]+4294925233&4294967295,C=A+(E<<17&4294967295|E>>>15),E=_+(y^C&(A^y))+T[11]+2304563134&4294967295,_=C+(E<<22&4294967295|E>>>10),E=y+(A^_&(C^A))+T[12]+1804603682&4294967295,y=_+(E<<7&4294967295|E>>>25),E=A+(C^y&(_^C))+T[13]+4254626195&4294967295,A=y+(E<<12&4294967295|E>>>20),E=C+(_^A&(y^_))+T[14]+2792965006&4294967295,C=A+(E<<17&4294967295|E>>>15),E=_+(y^C&(A^y))+T[15]+1236535329&4294967295,_=C+(E<<22&4294967295|E>>>10),E=y+(C^A&(_^C))+T[1]+4129170786&4294967295,y=_+(E<<5&4294967295|E>>>27),E=A+(_^C&(y^_))+T[6]+3225465664&4294967295,A=y+(E<<9&4294967295|E>>>23),E=C+(y^_&(A^y))+T[11]+643717713&4294967295,C=A+(E<<14&4294967295|E>>>18),E=_+(A^y&(C^A))+T[0]+3921069994&4294967295,_=C+(E<<20&4294967295|E>>>12),E=y+(C^A&(_^C))+T[5]+3593408605&4294967295,y=_+(E<<5&4294967295|E>>>27),E=A+(_^C&(y^_))+T[10]+38016083&4294967295,A=y+(E<<9&4294967295|E>>>23),E=C+(y^_&(A^y))+T[15]+3634488961&4294967295,C=A+(E<<14&4294967295|E>>>18),E=_+(A^y&(C^A))+T[4]+3889429448&4294967295,_=C+(E<<20&4294967295|E>>>12),E=y+(C^A&(_^C))+T[9]+568446438&4294967295,y=_+(E<<5&4294967295|E>>>27),E=A+(_^C&(y^_))+T[14]+3275163606&4294967295,A=y+(E<<9&4294967295|E>>>23),E=C+(y^_&(A^y))+T[3]+4107603335&4294967295,C=A+(E<<14&4294967295|E>>>18),E=_+(A^y&(C^A))+T[8]+1163531501&4294967295,_=C+(E<<20&4294967295|E>>>12),E=y+(C^A&(_^C))+T[13]+2850285829&4294967295,y=_+(E<<5&4294967295|E>>>27),E=A+(_^C&(y^_))+T[2]+4243563512&4294967295,A=y+(E<<9&4294967295|E>>>23),E=C+(y^_&(A^y))+T[7]+1735328473&4294967295,C=A+(E<<14&4294967295|E>>>18),E=_+(A^y&(C^A))+T[12]+2368359562&4294967295,_=C+(E<<20&4294967295|E>>>12),E=y+(_^C^A)+T[5]+4294588738&4294967295,y=_+(E<<4&4294967295|E>>>28),E=A+(y^_^C)+T[8]+2272392833&4294967295,A=y+(E<<11&4294967295|E>>>21),E=C+(A^y^_)+T[11]+1839030562&4294967295,C=A+(E<<16&4294967295|E>>>16),E=_+(C^A^y)+T[14]+4259657740&4294967295,_=C+(E<<23&4294967295|E>>>9),E=y+(_^C^A)+T[1]+2763975236&4294967295,y=_+(E<<4&4294967295|E>>>28),E=A+(y^_^C)+T[4]+1272893353&4294967295,A=y+(E<<11&4294967295|E>>>21),E=C+(A^y^_)+T[7]+4139469664&4294967295,C=A+(E<<16&4294967295|E>>>16),E=_+(C^A^y)+T[10]+3200236656&4294967295,_=C+(E<<23&4294967295|E>>>9),E=y+(_^C^A)+T[13]+681279174&4294967295,y=_+(E<<4&4294967295|E>>>28),E=A+(y^_^C)+T[0]+3936430074&4294967295,A=y+(E<<11&4294967295|E>>>21),E=C+(A^y^_)+T[3]+3572445317&4294967295,C=A+(E<<16&4294967295|E>>>16),E=_+(C^A^y)+T[6]+76029189&4294967295,_=C+(E<<23&4294967295|E>>>9),E=y+(_^C^A)+T[9]+3654602809&4294967295,y=_+(E<<4&4294967295|E>>>28),E=A+(y^_^C)+T[12]+3873151461&4294967295,A=y+(E<<11&4294967295|E>>>21),E=C+(A^y^_)+T[15]+530742520&4294967295,C=A+(E<<16&4294967295|E>>>16),E=_+(C^A^y)+T[2]+3299628645&4294967295,_=C+(E<<23&4294967295|E>>>9),E=y+(C^(_|~A))+T[0]+4096336452&4294967295,y=_+(E<<6&4294967295|E>>>26),E=A+(_^(y|~C))+T[7]+1126891415&4294967295,A=y+(E<<10&4294967295|E>>>22),E=C+(y^(A|~_))+T[14]+2878612391&4294967295,C=A+(E<<15&4294967295|E>>>17),E=_+(A^(C|~y))+T[5]+4237533241&4294967295,_=C+(E<<21&4294967295|E>>>11),E=y+(C^(_|~A))+T[12]+1700485571&4294967295,y=_+(E<<6&4294967295|E>>>26),E=A+(_^(y|~C))+T[3]+2399980690&4294967295,A=y+(E<<10&4294967295|E>>>22),E=C+(y^(A|~_))+T[10]+4293915773&4294967295,C=A+(E<<15&4294967295|E>>>17),E=_+(A^(C|~y))+T[1]+2240044497&4294967295,_=C+(E<<21&4294967295|E>>>11),E=y+(C^(_|~A))+T[8]+1873313359&4294967295,y=_+(E<<6&4294967295|E>>>26),E=A+(_^(y|~C))+T[15]+4264355552&4294967295,A=y+(E<<10&4294967295|E>>>22),E=C+(y^(A|~_))+T[6]+2734768916&4294967295,C=A+(E<<15&4294967295|E>>>17),E=_+(A^(C|~y))+T[13]+1309151649&4294967295,_=C+(E<<21&4294967295|E>>>11),E=y+(C^(_|~A))+T[4]+4149444226&4294967295,y=_+(E<<6&4294967295|E>>>26),E=A+(_^(y|~C))+T[11]+3174756917&4294967295,A=y+(E<<10&4294967295|E>>>22),E=C+(y^(A|~_))+T[2]+718787259&4294967295,C=A+(E<<15&4294967295|E>>>17),E=_+(A^(C|~y))+T[9]+3951481745&4294967295,S.g[0]=S.g[0]+y&4294967295,S.g[1]=S.g[1]+(C+(E<<21&4294967295|E>>>11))&4294967295,S.g[2]=S.g[2]+C&4294967295,S.g[3]=S.g[3]+A&4294967295}n.prototype.v=function(S,y){y===void 0&&(y=S.length);let _=y-this.blockSize,T=this.C,C=this.h,A=0;for(;A<y;){if(C==0)for(;A<=_;)r(this,S,A),A+=this.blockSize;if(typeof S=="string"){for(;A<y;)if(T[C++]=S.charCodeAt(A++),C==this.blockSize){r(this,T),C=0;break}}else for(;A<y;)if(T[C++]=S[A++],C==this.blockSize){r(this,T),C=0;break}}this.h=C,this.o+=y},n.prototype.A=function(){var S=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);S[0]=128;for(var y=1;y<S.length-8;++y)S[y]=0;y=this.o*8;for(var _=S.length-8;_<S.length;++_)S[_]=y&255,y/=256;for(this.v(S),S=Array(16),y=0,_=0;_<4;++_)for(let T=0;T<32;T+=8)S[y++]=this.g[_]>>>T&255;return S};function s(S,y){var _=u;return Object.prototype.hasOwnProperty.call(_,S)?_[S]:_[S]=y(S)}function i(S,y){this.h=y;let _=[],T=!0;for(let C=S.length-1;C>=0;C--){let A=S[C]|0;T&&A==y||(_[C]=A,T=!1)}this.g=_}var u={};function l(S){return-128<=S&&S<128?s(S,function(y){return new i([y|0],y<0?-1:0)}):new i([S|0],S<0?-1:0)}function d(S){if(isNaN(S)||!isFinite(S))return m;if(S<0)return D(d(-S));let y=[],_=1;for(let T=0;S>=_;T++)y[T]=S/_|0,_*=4294967296;return new i(y,0)}function h(S,y){if(S.length==0)throw Error("number format error: empty string");if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(S.charAt(0)=="-")return D(h(S.substring(1),y));if(S.indexOf("-")>=0)throw Error('number format error: interior "-" character');let _=d(Math.pow(y,8)),T=m;for(let A=0;A<S.length;A+=8){var C=Math.min(8,S.length-A);let E=parseInt(S.substring(A,A+C),y);C<8?(C=d(Math.pow(y,C)),T=T.j(C).add(d(E))):(T=T.j(_),T=T.add(d(E)))}return T}var m=l(0),p=l(1),I=l(16777216);t=i.prototype,t.m=function(){if(k(this))return-D(this).m();let S=0,y=1;for(let _=0;_<this.g.length;_++){let T=this.i(_);S+=(T>=0?T:4294967296+T)*y,y*=4294967296}return S},t.toString=function(S){if(S=S||10,S<2||36<S)throw Error("radix out of range: "+S);if(L(this))return"0";if(k(this))return"-"+D(this).toString(S);let y=d(Math.pow(S,6));var _=this;let T="";for(;;){let C=x(_,y).g;_=w(_,C.j(y));let A=((_.g.length>0?_.g[0]:_.h)>>>0).toString(S);if(_=C,L(_))return A+T;for(;A.length<6;)A="0"+A;T=A+T}},t.i=function(S){return S<0?0:S<this.g.length?this.g[S]:this.h};function L(S){if(S.h!=0)return!1;for(let y=0;y<S.g.length;y++)if(S.g[y]!=0)return!1;return!0}function k(S){return S.h==-1}t.l=function(S){return S=w(this,S),k(S)?-1:L(S)?0:1};function D(S){let y=S.g.length,_=[];for(let T=0;T<y;T++)_[T]=~S.g[T];return new i(_,~S.h).add(p)}t.abs=function(){return k(this)?D(this):this},t.add=function(S){let y=Math.max(this.g.length,S.g.length),_=[],T=0;for(let C=0;C<=y;C++){let A=T+(this.i(C)&65535)+(S.i(C)&65535),E=(A>>>16)+(this.i(C)>>>16)+(S.i(C)>>>16);T=E>>>16,A&=65535,E&=65535,_[C]=E<<16|A}return new i(_,_[_.length-1]&-2147483648?-1:0)};function w(S,y){return S.add(D(y))}t.j=function(S){if(L(this)||L(S))return m;if(k(this))return k(S)?D(this).j(D(S)):D(D(this).j(S));if(k(S))return D(this.j(D(S)));if(this.l(I)<0&&S.l(I)<0)return d(this.m()*S.m());let y=this.g.length+S.g.length,_=[];for(var T=0;T<2*y;T++)_[T]=0;for(T=0;T<this.g.length;T++)for(let C=0;C<S.g.length;C++){let A=this.i(T)>>>16,E=this.i(T)&65535,Re=S.i(C)>>>16,Me=S.i(C)&65535;_[2*T+2*C]+=E*Me,v(_,2*T+2*C),_[2*T+2*C+1]+=A*Me,v(_,2*T+2*C+1),_[2*T+2*C+1]+=E*Re,v(_,2*T+2*C+1),_[2*T+2*C+2]+=A*Re,v(_,2*T+2*C+2)}for(S=0;S<y;S++)_[S]=_[2*S+1]<<16|_[2*S];for(S=y;S<2*y;S++)_[S]=0;return new i(_,0)};function v(S,y){for(;(S[y]&65535)!=S[y];)S[y+1]+=S[y]>>>16,S[y]&=65535,y++}function b(S,y){this.g=S,this.h=y}function x(S,y){if(L(y))throw Error("division by zero");if(L(S))return new b(m,m);if(k(S))return y=x(D(S),y),new b(D(y.g),D(y.h));if(k(y))return y=x(S,D(y)),new b(D(y.g),y.h);if(S.g.length>30){if(k(S)||k(y))throw Error("slowDivide_ only works with positive integers.");for(var _=p,T=y;T.l(S)<=0;)_=B(_),T=B(T);var C=G(_,1),A=G(T,1);for(T=G(T,2),_=G(_,2);!L(T);){var E=A.add(T);E.l(S)<=0&&(C=C.add(_),A=E),T=G(T,1),_=G(_,1)}return y=w(S,C.j(y)),new b(C,y)}for(C=m;S.l(y)>=0;){for(_=Math.max(1,Math.floor(S.m()/y.m())),T=Math.ceil(Math.log(_)/Math.LN2),T=T<=48?1:Math.pow(2,T-48),A=d(_),E=A.j(y);k(E)||E.l(S)>0;)_-=T,A=d(_),E=A.j(y);L(A)&&(A=p),C=C.add(A),S=w(S,E)}return new b(C,S)}t.B=function(S){return x(this,S).h},t.and=function(S){let y=Math.max(this.g.length,S.g.length),_=[];for(let T=0;T<y;T++)_[T]=this.i(T)&S.i(T);return new i(_,this.h&S.h)},t.or=function(S){let y=Math.max(this.g.length,S.g.length),_=[];for(let T=0;T<y;T++)_[T]=this.i(T)|S.i(T);return new i(_,this.h|S.h)},t.xor=function(S){let y=Math.max(this.g.length,S.g.length),_=[];for(let T=0;T<y;T++)_[T]=this.i(T)^S.i(T);return new i(_,this.h^S.h)};function B(S){let y=S.g.length+1,_=[];for(let T=0;T<y;T++)_[T]=S.i(T)<<1|S.i(T-1)>>>31;return new i(_,S.h)}function G(S,y){let _=y>>5;y%=32;let T=S.g.length-_,C=[];for(let A=0;A<T;A++)C[A]=y>0?S.i(A+_)>>>y|S.i(A+_+1)<<32-y:S.i(A+_);return new i(C,S.h)}n.prototype.digest=n.prototype.A,n.prototype.reset=n.prototype.u,n.prototype.update=n.prototype.v,__=bA.Md5=n,i.prototype.add=i.prototype.add,i.prototype.multiply=i.prototype.j,i.prototype.modulo=i.prototype.B,i.prototype.compare=i.prototype.l,i.prototype.toNumber=i.prototype.m,i.prototype.toString=i.prototype.toString,i.prototype.getBits=i.prototype.i,i.fromNumber=d,i.fromString=h,ir=bA.Integer=i}).apply(typeof CA<"u"?CA:typeof self<"u"?self:typeof window<"u"?window:{});var rh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},or={};var I_,xN,uo,S_,Rl,sh,v_,T_,w_;(function(){var t,e=Object.defineProperty;function a(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof rh=="object"&&rh];for(var c=0;c<o.length;++c){var f=o[c];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var n=a(this);function r(o,c){if(c)e:{var f=n;o=o.split(".");for(var g=0;g<o.length-1;g++){var R=o[g];if(!(R in f))break e;f=f[R]}o=o[o.length-1],g=f[o],c=c(g),c!=g&&c!=null&&e(f,o,{configurable:!0,writable:!0,value:c})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(c){var f=[],g;for(g in c)Object.prototype.hasOwnProperty.call(c,g)&&f.push([g,c[g]]);return f}});var s=s||{},i=this||self;function u(o){var c=typeof o;return c=="object"&&o!=null||c=="function"}function l(o,c,f){return o.call.apply(o.bind,arguments)}function d(o,c,f){return d=l,d.apply(null,arguments)}function h(o,c){var f=Array.prototype.slice.call(arguments,1);return function(){var g=f.slice();return g.push.apply(g,arguments),o.apply(this,g)}}function m(o,c){function f(){}f.prototype=c.prototype,o.Z=c.prototype,o.prototype=new f,o.prototype.constructor=o,o.Ob=function(g,R,P){for(var z=Array(arguments.length-2),ce=2;ce<arguments.length;ce++)z[ce-2]=arguments[ce];return c.prototype[R].apply(g,z)}}var p=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function I(o){let c=o.length;if(c>0){let f=Array(c);for(let g=0;g<c;g++)f[g]=o[g];return f}return[]}function L(o,c){for(let g=1;g<arguments.length;g++){let R=arguments[g];var f=typeof R;if(f=f!="object"?f:R?Array.isArray(R)?"array":f:"null",f=="array"||f=="object"&&typeof R.length=="number"){f=o.length||0;let P=R.length||0;o.length=f+P;for(let z=0;z<P;z++)o[f+z]=R[z]}else o.push(R)}}class k{constructor(c,f){this.i=c,this.j=f,this.h=0,this.g=null}get(){let c;return this.h>0?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function D(o){i.setTimeout(()=>{throw o},0)}function w(){var o=S;let c=null;return o.g&&(c=o.g,o.g=o.g.next,o.g||(o.h=null),c.next=null),c}class v{constructor(){this.h=this.g=null}add(c,f){let g=b.get();g.set(c,f),this.h?this.h.next=g:this.g=g,this.h=g}}var b=new k(()=>new x,o=>o.reset());class x{constructor(){this.next=this.g=this.h=null}set(c,f){this.h=c,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let B,G=!1,S=new v,y=()=>{let o=Promise.resolve(void 0);B=()=>{o.then(_)}};function _(){for(var o;o=w();){try{o.h.call(o.g)}catch(f){D(f)}var c=b;c.j(o),c.h<100&&(c.h++,o.next=c.g,c.g=o)}G=!1}function T(){this.u=this.u,this.C=this.C}T.prototype.u=!1,T.prototype.dispose=function(){this.u||(this.u=!0,this.N())},T.prototype[Symbol.dispose]=function(){this.dispose()},T.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function C(o,c){this.type=o,this.g=this.target=c,this.defaultPrevented=!1}C.prototype.h=function(){this.defaultPrevented=!0};var A=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var o=!1,c=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let f=()=>{};i.addEventListener("test",f,c),i.removeEventListener("test",f,c)}catch{}return o}();function E(o){return/^[\s\xa0]*$/.test(o)}function Re(o,c){C.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,c)}m(Re,C),Re.prototype.init=function(o,c){let f=this.type=o.type,g=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=c,c=o.relatedTarget,c||(f=="mouseover"?c=o.fromElement:f=="mouseout"&&(c=o.toElement)),this.relatedTarget=c,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&Re.Z.h.call(this)},Re.prototype.h=function(){Re.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Me="closure_listenable_"+(Math.random()*1e6|0),Xa=0;function M(o,c,f,g,R){this.listener=o,this.proxy=null,this.src=c,this.type=f,this.capture=!!g,this.ha=R,this.key=++Xa,this.da=this.fa=!1}function O(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function U(o,c,f){for(let g in o)c.call(f,o[g],g,o)}function $(o,c){for(let f in o)c.call(void 0,o[f],f,o)}function W(o){let c={};for(let f in o)c[f]=o[f];return c}let ee="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function q(o,c){let f,g;for(let R=1;R<arguments.length;R++){g=arguments[R];for(f in g)o[f]=g[f];for(let P=0;P<ee.length;P++)f=ee[P],Object.prototype.hasOwnProperty.call(g,f)&&(o[f]=g[f])}}function ne(o){this.src=o,this.g={},this.h=0}ne.prototype.add=function(o,c,f,g,R){let P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);let z=ae(o,c,g,R);return z>-1?(c=o[z],f||(c.fa=!1)):(c=new M(c,this.src,P,!!g,R),c.fa=f,o.push(c)),c};function J(o,c){let f=c.type;if(f in o.g){var g=o.g[f],R=Array.prototype.indexOf.call(g,c,void 0),P;(P=R>=0)&&Array.prototype.splice.call(g,R,1),P&&(O(c),o.g[f].length==0&&(delete o.g[f],o.h--))}}function ae(o,c,f,g){for(let R=0;R<o.length;++R){let P=o[R];if(!P.da&&P.listener==c&&P.capture==!!f&&P.ha==g)return R}return-1}var pe="closure_lm_"+(Math.random()*1e6|0),we={};function ke(o,c,f,g,R){if(g&&g.once)return He(o,c,f,g,R);if(Array.isArray(c)){for(let P=0;P<c.length;P++)ke(o,c[P],f,g,R);return null}return f=Da(f),o&&o[Me]?o.J(c,f,u(g)?!!g.capture:!!g,R):Qt(o,c,f,!1,g,R)}function Qt(o,c,f,g,R,P){if(!c)throw Error("Invalid event type");let z=u(R)?!!R.capture:!!R,ce=Fe(o);if(ce||(o[pe]=ce=new ne(o)),f=ce.add(c,f,g,z,P),f.proxy)return f;if(g=Ye(),f.proxy=g,g.src=o,g.listener=f,o.addEventListener)A||(R=z),R===void 0&&(R=!1),o.addEventListener(c.toString(),g,R);else if(o.attachEvent)o.attachEvent(ve(c.toString()),g);else if(o.addListener&&o.removeListener)o.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return f}function Ye(){function o(f){return c.call(o.src,o.listener,f)}let c=Ue;return o}function He(o,c,f,g,R){if(Array.isArray(c)){for(let P=0;P<c.length;P++)He(o,c[P],f,g,R);return null}return f=Da(f),o&&o[Me]?o.K(c,f,u(g)?!!g.capture:!!g,R):Qt(o,c,f,!0,g,R)}function nt(o,c,f,g,R){if(Array.isArray(c))for(var P=0;P<c.length;P++)nt(o,c[P],f,g,R);else g=u(g)?!!g.capture:!!g,f=Da(f),o&&o[Me]?(o=o.i,P=String(c).toString(),P in o.g&&(c=o.g[P],f=ae(c,f,g,R),f>-1&&(O(c[f]),Array.prototype.splice.call(c,f,1),c.length==0&&(delete o.g[P],o.h--)))):o&&(o=Fe(o))&&(c=o.g[c.toString()],o=-1,c&&(o=ae(c,f,g,R)),(f=o>-1?c[o]:null)&&rt(f))}function rt(o){if(typeof o!="number"&&o&&!o.da){var c=o.src;if(c&&c[Me])J(c.i,o);else{var f=o.type,g=o.proxy;c.removeEventListener?c.removeEventListener(f,g,o.capture):c.detachEvent?c.detachEvent(ve(f),g):c.addListener&&c.removeListener&&c.removeListener(g),(f=Fe(c))?(J(f,o),f.h==0&&(f.src=null,c[pe]=null)):O(o)}}}function ve(o){return o in we?we[o]:we[o]="on"+o}function Ue(o,c){if(o.da)o=!0;else{c=new Re(c,this);let f=o.listener,g=o.ha||o.src;o.fa&&rt(o),o=f.call(g,c)}return o}function Fe(o){return o=o[pe],o instanceof ne?o:null}var ft="__closure_events_fn_"+(Math.random()*1e9>>>0);function Da(o){return typeof o=="function"?o:(o[ft]||(o[ft]=function(c){return o.handleEvent(c)}),o[ft])}function Te(){T.call(this),this.i=new ne(this),this.M=this,this.G=null}m(Te,T),Te.prototype[Me]=!0,Te.prototype.removeEventListener=function(o,c,f,g){nt(this,o,c,f,g)};function Ee(o,c){var f,g=o.G;if(g)for(f=[];g;g=g.G)f.push(g);if(o=o.M,g=c.type||c,typeof c=="string")c=new C(c,o);else if(c instanceof C)c.target=c.target||o;else{var R=c;c=new C(g,o),q(c,R)}R=!0;let P,z;if(f)for(z=f.length-1;z>=0;z--)P=c.g=f[z],R=$e(P,g,!0,c)&&R;if(P=c.g=o,R=$e(P,g,!0,c)&&R,R=$e(P,g,!1,c)&&R,f)for(z=0;z<f.length;z++)P=c.g=f[z],R=$e(P,g,!1,c)&&R}Te.prototype.N=function(){if(Te.Z.N.call(this),this.i){var o=this.i;for(let c in o.g){let f=o.g[c];for(let g=0;g<f.length;g++)O(f[g]);delete o.g[c],o.h--}}this.G=null},Te.prototype.J=function(o,c,f,g){return this.i.add(String(o),c,!1,f,g)},Te.prototype.K=function(o,c,f,g){return this.i.add(String(o),c,!0,f,g)};function $e(o,c,f,g){if(c=o.i.g[String(c)],!c)return!0;c=c.concat();let R=!0;for(let P=0;P<c.length;++P){let z=c[P];if(z&&!z.da&&z.capture==f){let ce=z.listener,Lt=z.ha||z.src;z.fa&&J(o.i,z),R=ce.call(Lt,g)!==!1&&R}}return R&&!g.defaultPrevented}function Pa(o,c){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=d(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(c)>2147483647?-1:i.setTimeout(o,c||0)}function Ct(o){o.g=Pa(()=>{o.g=null,o.i&&(o.i=!1,Ct(o))},o.l);let c=o.h;o.h=null,o.m.apply(null,c)}class Be extends T{constructor(c,f){super(),this.m=c,this.l=f,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:Ct(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Xt(o){T.call(this),this.h=o,this.g={}}m(Xt,T);var ga=[];function hs(o){U(o.g,function(c,f){this.g.hasOwnProperty(f)&&rt(c)},o),o.g={}}Xt.prototype.N=function(){Xt.Z.N.call(this),hs(this)},Xt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ya=i.JSON.stringify,on=i.JSON.parse,vc=class{stringify(o){return i.JSON.stringify(o,void 0)}parse(o){return i.JSON.parse(o,void 0)}};function Go(){}function jo(){}var Tr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function _a(){C.call(this,"d")}m(_a,C);function Ia(){C.call(this,"c")}m(Ia,C);var ra={},Ko=null;function Mn(){return Ko=Ko||new Te}ra.Ia="serverreachability";function Wo(o){C.call(this,ra.Ia,o)}m(Wo,C);function wr(o){let c=Mn();Ee(c,new Wo(c))}ra.STAT_EVENT="statevent";function Qo(o,c){C.call(this,ra.STAT_EVENT,o),this.stat=c}m(Qo,C);function Dt(o){let c=Mn();Ee(c,new Qo(c,o))}ra.Ja="timingevent";function Xo(o,c){C.call(this,ra.Ja,o),this.size=c}m(Xo,C);function un(o,c){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){o()},c)}function Er(){this.g=!0}Er.prototype.ua=function(){this.g=!1};function Tc(o,c,f,g,R,P){o.info(function(){if(o.g)if(P){var z="",ce=P.split("&");for(let qe=0;qe<ce.length;qe++){var Lt=ce[qe].split("=");if(Lt.length>1){let Pt=Lt[0];Lt=Lt[1];let cn=Pt.split("_");z=cn.length>=2&&cn[1]=="type"?z+(Pt+"="+Lt+"&"):z+(Pt+"=redacted&")}}}else z=null;else z=P;return"XMLHTTP REQ ("+g+") [attempt "+R+"]: "+c+`
`+f+`
`+z})}function wc(o,c,f,g,R,P,z){o.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+R+"]: "+c+`
`+f+`
`+P+" "+z})}function Oa(o,c,f,g){o.info(function(){return"XMLHTTP TEXT ("+c+"): "+Cc(o,f)+(g?" "+g:"")})}function Ec(o,c){o.info(function(){return"TIMEOUT: "+c})}Er.prototype.info=function(){};function Cc(o,c){if(!o.g)return c;if(!c)return null;try{let P=JSON.parse(c);if(P){for(o=0;o<P.length;o++)if(Array.isArray(P[o])){var f=P[o];if(!(f.length<2)){var g=f[1];if(Array.isArray(g)&&!(g.length<1)){var R=g[0];if(R!="noop"&&R!="stop"&&R!="close")for(let z=1;z<g.length;z++)g[z]=""}}}}return ya(P)}catch{return c}}var ni={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},ri={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},bc;function Yo(){}m(Yo,Go),Yo.prototype.g=function(){return new XMLHttpRequest},bc=new Yo;function K(o){return encodeURIComponent(String(o))}function Z(o){var c=1;o=o.split(":");let f=[];for(;c>0&&o.length;)f.push(o.shift()),c--;return o.length&&f.push(o.join(":")),f}function Q(o,c,f,g){this.j=o,this.i=c,this.l=f,this.S=g||1,this.V=new Xt(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new ie}function ie(){this.i=null,this.g="",this.h=!1}var Ae={},st={};function bt(o,c,f){o.M=1,o.A=Ac(ln(c)),o.u=f,o.R=!0,Ya(o,null)}function Ya(o,c){o.F=Date.now(),Lc(o),o.B=ln(o.A);var f=o.B,g=o.S;Array.isArray(g)||(g=[String(g)]),$S(f.i,"t",g),o.C=0,f=o.j.L,o.h=new ie,o.g=mv(o.j,f?c:null,!o.u),o.P>0&&(o.O=new Be(d(o.Y,o,o.g),o.P)),c=o.V,f=o.g,g=o.ba;var R="readystatechange";Array.isArray(R)||(R&&(ga[0]=R.toString()),R=ga);for(let P=0;P<R.length;P++){let z=ke(f,R[P],g||c.handleEvent,!1,c.h||c);if(!z)break;c.g[z.key]=z}c=o.J?W(o.J):{},o.u?(o.v||(o.v="POST"),c["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,c)):(o.v="GET",o.g.ea(o.B,o.v,null,c)),wr(),Tc(o.i,o.v,o.B,o.l,o.S,o.u)}Q.prototype.ba=function(o){o=o.target;let c=this.O;c&&Lr(o)==3?c.j():this.Y(o)},Q.prototype.Y=function(o){try{if(o==this.g)e:{let ce=Lr(this.g),Lt=this.g.ya(),qe=this.g.ca();if(!(ce<3)&&(ce!=3||this.g&&(this.h.h||this.g.la()||rv(this.g)))){this.K||ce!=4||Lt==7||(Lt==8||qe<=0?wr(3):wr(2)),cp(this);var c=this.g.ca();this.X=c;var f=$o(this);if(this.o=c==200,wc(this.i,this.v,this.B,this.l,this.S,ce,c),this.o){if(this.U&&!this.L){t:{if(this.g){var g,R=this.g;if((g=R.g?R.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!E(g)){var P=g;break t}}P=null}if(o=P)Oa(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,dp(this,o);else{this.o=!1,this.m=3,Dt(12),ps(this),Jo(this);break e}}if(this.R){o=!0;let Pt;for(;!this.K&&this.C<f.length;)if(Pt=bR(this,f),Pt==st){ce==4&&(this.m=4,Dt(14),o=!1),Oa(this.i,this.l,null,"[Incomplete Response]");break}else if(Pt==Ae){this.m=4,Dt(15),Oa(this.i,this.l,f,"[Invalid Chunk]"),o=!1;break}else Oa(this.i,this.l,Pt,null),dp(this,Pt);if(FS(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ce!=4||f.length!=0||this.h.h||(this.m=1,Dt(16),o=!1),this.o=this.o&&o,!o)Oa(this.i,this.l,f,"[Invalid Chunked Response]"),ps(this),Jo(this);else if(f.length>0&&!this.W){this.W=!0;var z=this.j;z.g==this&&z.aa&&!z.P&&(z.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),_p(z),z.P=!0,Dt(11))}}else Oa(this.i,this.l,f,null),dp(this,f);ce==4&&ps(this),this.o&&!this.K&&(ce==4?dv(this.j,this):(this.o=!1,Lc(this)))}else BR(this.g),c==400&&f.indexOf("Unknown SID")>0?(this.m=3,Dt(12)):(this.m=0,Dt(13)),ps(this),Jo(this)}}}catch{}finally{}};function $o(o){if(!FS(o))return o.g.la();let c=rv(o.g);if(c==="")return"";let f="",g=c.length,R=Lr(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return ps(o),Jo(o),"";o.h.i=new i.TextDecoder}for(let P=0;P<g;P++)o.h.h=!0,f+=o.h.i.decode(c[P],{stream:!(R&&P==g-1)});return c.length=0,o.h.g+=f,o.C=0,o.h.g}function FS(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function bR(o,c){var f=o.C,g=c.indexOf(`
`,f);return g==-1?st:(f=Number(c.substring(f,g)),isNaN(f)?Ae:(g+=1,g+f>c.length?st:(c=c.slice(g,g+f),o.C=g+f,c)))}Q.prototype.cancel=function(){this.K=!0,ps(this)};function Lc(o){o.T=Date.now()+o.H,BS(o,o.H)}function BS(o,c){if(o.D!=null)throw Error("WatchDog timer not null");o.D=un(d(o.aa,o),c)}function cp(o){o.D&&(i.clearTimeout(o.D),o.D=null)}Q.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?(Ec(this.i,this.B),this.M!=2&&(wr(),Dt(17)),ps(this),this.m=2,Jo(this)):BS(this,this.T-o)};function Jo(o){o.j.I==0||o.K||dv(o.j,o)}function ps(o){cp(o);var c=o.O;c&&typeof c.dispose=="function"&&c.dispose(),o.O=null,hs(o.V),o.g&&(c=o.g,o.g=null,c.abort(),c.dispose())}function dp(o,c){try{var f=o.j;if(f.I!=0&&(f.g==o||fp(f.h,o))){if(!o.L&&fp(f.h,o)&&f.I==3){try{var g=f.Ba.g.parse(c)}catch{g=null}if(Array.isArray(g)&&g.length==3){var R=g;if(R[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<o.F)Oc(f),Dc(f);else break e;yp(f),Dt(18)}}else f.xa=R[1],0<f.xa-f.K&&R[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=un(d(f.Va,f),6e3));HS(f.h)<=1&&f.ta&&(f.ta=void 0)}else gs(f,11)}else if((o.L||f.g==o)&&Oc(f),!E(c))for(R=f.Ba.g.parse(c),c=0;c<R.length;c++){let qe=R[c],Pt=qe[0];if(!(Pt<=f.K))if(f.K=Pt,qe=qe[1],f.I==2)if(qe[0]=="c"){f.M=qe[1],f.ba=qe[2];let cn=qe[3];cn!=null&&(f.ka=cn,f.j.info("VER="+f.ka));let ys=qe[4];ys!=null&&(f.za=ys,f.j.info("SVER="+f.za));let Ar=qe[5];Ar!=null&&typeof Ar=="number"&&Ar>0&&(g=1.5*Ar,f.O=g,f.j.info("backChannelRequestTimeoutMs_="+g)),g=f;let xr=o.g;if(xr){let Nc=xr.g?xr.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Nc){var P=g.h;P.g||Nc.indexOf("spdy")==-1&&Nc.indexOf("quic")==-1&&Nc.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(hp(P,P.h),P.h=null))}if(g.G){let Ip=xr.g?xr.g.getResponseHeader("X-HTTP-Session-Id"):null;Ip&&(g.wa=Ip,je(g.J,g.G,Ip))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-o.F,f.j.info("Handshake RTT: "+f.T+"ms")),g=f;var z=o;if(g.na=pv(g,g.L?g.ba:null,g.W),z.L){GS(g.h,z);var ce=z,Lt=g.O;Lt&&(ce.H=Lt),ce.D&&(cp(ce),Lc(ce)),g.g=z}else lv(g);f.i.length>0&&Pc(f)}else qe[0]!="stop"&&qe[0]!="close"||gs(f,7);else f.I==3&&(qe[0]=="stop"||qe[0]=="close"?qe[0]=="stop"?gs(f,7):gp(f):qe[0]!="noop"&&f.l&&f.l.qa(qe),f.A=0)}}wr(4)}catch{}}var LR=class{constructor(o,c){this.g=o,this.map=c}};function qS(o){this.l=o||10,i.PerformanceNavigationTiming?(o=i.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function zS(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function HS(o){return o.h?1:o.g?o.g.size:0}function fp(o,c){return o.h?o.h==c:o.g?o.g.has(c):!1}function hp(o,c){o.g?o.g.add(c):o.h=c}function GS(o,c){o.h&&o.h==c?o.h=null:o.g&&o.g.has(c)&&o.g.delete(c)}qS.prototype.cancel=function(){if(this.i=jS(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function jS(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let c=o.i;for(let f of o.g.values())c=c.concat(f.G);return c}return I(o.i)}var KS=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function AR(o,c){if(o){o=o.split("&");for(let f=0;f<o.length;f++){let g=o[f].indexOf("="),R,P=null;g>=0?(R=o[f].substring(0,g),P=o[f].substring(g+1)):R=o[f],c(R,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function Cr(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let c;o instanceof Cr?(this.l=o.l,Zo(this,o.j),this.o=o.o,this.g=o.g,eu(this,o.u),this.h=o.h,pp(this,JS(o.i)),this.m=o.m):o&&(c=String(o).match(KS))?(this.l=!1,Zo(this,c[1]||"",!0),this.o=tu(c[2]||""),this.g=tu(c[3]||"",!0),eu(this,c[4]),this.h=tu(c[5]||"",!0),pp(this,c[6]||"",!0),this.m=tu(c[7]||"")):(this.l=!1,this.i=new nu(null,this.l))}Cr.prototype.toString=function(){let o=[];var c=this.j;c&&o.push(au(c,WS,!0),":");var f=this.g;return(f||c=="file")&&(o.push("//"),(c=this.o)&&o.push(au(c,WS,!0),"@"),o.push(K(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&o.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&o.push("/"),o.push(au(f,f.charAt(0)=="/"?kR:RR,!0))),(f=this.i.toString())&&o.push("?",f),(f=this.m)&&o.push("#",au(f,PR)),o.join("")},Cr.prototype.resolve=function(o){let c=ln(this),f=!!o.j;f?Zo(c,o.j):f=!!o.o,f?c.o=o.o:f=!!o.g,f?c.g=o.g:f=o.u!=null;var g=o.h;if(f)eu(c,o.u);else if(f=!!o.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var R=c.h.lastIndexOf("/");R!=-1&&(g=c.h.slice(0,R+1)+g)}if(R=g,R==".."||R==".")g="";else if(R.indexOf("./")!=-1||R.indexOf("/.")!=-1){g=R.lastIndexOf("/",0)==0,R=R.split("/");let P=[];for(let z=0;z<R.length;){let ce=R[z++];ce=="."?g&&z==R.length&&P.push(""):ce==".."?((P.length>1||P.length==1&&P[0]!="")&&P.pop(),g&&z==R.length&&P.push("")):(P.push(ce),g=!0)}g=P.join("/")}else g=R}return f?c.h=g:f=o.i.toString()!=="",f?pp(c,JS(o.i)):f=!!o.m,f&&(c.m=o.m),c};function ln(o){return new Cr(o)}function Zo(o,c,f){o.j=f?tu(c,!0):c,o.j&&(o.j=o.j.replace(/:$/,""))}function eu(o,c){if(c){if(c=Number(c),isNaN(c)||c<0)throw Error("Bad port number "+c);o.u=c}else o.u=null}function pp(o,c,f){c instanceof nu?(o.i=c,OR(o.i,o.l)):(f||(c=au(c,DR)),o.i=new nu(c,o.l))}function je(o,c,f){o.i.set(c,f)}function Ac(o){return je(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function tu(o,c){return o?c?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function au(o,c,f){return typeof o=="string"?(o=encodeURI(o).replace(c,xR),f&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function xR(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var WS=/[#\/\?@]/g,RR=/[#\?:]/g,kR=/[#\?]/g,DR=/[#\?@]/g,PR=/#/g;function nu(o,c){this.h=this.g=null,this.i=o||null,this.j=!!c}function ms(o){o.g||(o.g=new Map,o.h=0,o.i&&AR(o.i,function(c,f){o.add(decodeURIComponent(c.replace(/\+/g," ")),f)}))}t=nu.prototype,t.add=function(o,c){ms(this),this.i=null,o=si(this,o);let f=this.g.get(o);return f||this.g.set(o,f=[]),f.push(c),this.h+=1,this};function QS(o,c){ms(o),c=si(o,c),o.g.has(c)&&(o.i=null,o.h-=o.g.get(c).length,o.g.delete(c))}function XS(o,c){return ms(o),c=si(o,c),o.g.has(c)}t.forEach=function(o,c){ms(this),this.g.forEach(function(f,g){f.forEach(function(R){o.call(c,R,g,this)},this)},this)};function YS(o,c){ms(o);let f=[];if(typeof c=="string")XS(o,c)&&(f=f.concat(o.g.get(si(o,c))));else for(o=Array.from(o.g.values()),c=0;c<o.length;c++)f=f.concat(o[c]);return f}t.set=function(o,c){return ms(this),this.i=null,o=si(this,o),XS(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[c]),this.h+=1,this},t.get=function(o,c){return o?(o=YS(this,o),o.length>0?String(o[0]):c):c};function $S(o,c,f){QS(o,c),f.length>0&&(o.i=null,o.g.set(si(o,c),I(f)),o.h+=f.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],c=Array.from(this.g.keys());for(let g=0;g<c.length;g++){var f=c[g];let R=K(f);f=YS(this,f);for(let P=0;P<f.length;P++){let z=R;f[P]!==""&&(z+="="+K(f[P])),o.push(z)}}return this.i=o.join("&")};function JS(o){let c=new nu;return c.i=o.i,o.g&&(c.g=new Map(o.g),c.h=o.h),c}function si(o,c){return c=String(c),o.j&&(c=c.toLowerCase()),c}function OR(o,c){c&&!o.j&&(ms(o),o.i=null,o.g.forEach(function(f,g){let R=g.toLowerCase();g!=R&&(QS(this,g),$S(this,R,f))},o)),o.j=c}function MR(o,c){let f=new Er;if(i.Image){let g=new Image;g.onload=h(br,f,"TestLoadImage: loaded",!0,c,g),g.onerror=h(br,f,"TestLoadImage: error",!1,c,g),g.onabort=h(br,f,"TestLoadImage: abort",!1,c,g),g.ontimeout=h(br,f,"TestLoadImage: timeout",!1,c,g),i.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=o}else c(!1)}function NR(o,c){let f=new Er,g=new AbortController,R=setTimeout(()=>{g.abort(),br(f,"TestPingServer: timeout",!1,c)},1e4);fetch(o,{signal:g.signal}).then(P=>{clearTimeout(R),P.ok?br(f,"TestPingServer: ok",!0,c):br(f,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(R),br(f,"TestPingServer: error",!1,c)})}function br(o,c,f,g,R){try{R&&(R.onload=null,R.onerror=null,R.onabort=null,R.ontimeout=null),g(f)}catch{}}function VR(){this.g=new vc}function xc(o){this.i=o.Sb||null,this.h=o.ab||!1}m(xc,Go),xc.prototype.g=function(){return new Rc(this.i,this.h)};function Rc(o,c){Te.call(this),this.H=o,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(Rc,Te),t=Rc.prototype,t.open=function(o,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=c,this.readyState=1,su(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let c={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(c.body=o),(this.H||i).fetch(new Request(this.D,c)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,ru(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,su(this)),this.g&&(this.readyState=3,su(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof i.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;ZS(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function ZS(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var c=o.value?o.value:new Uint8Array(0);(c=this.B.decode(c,{stream:!o.done}))&&(this.response=this.responseText+=c)}o.done?ru(this):su(this),this.readyState==3&&ZS(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,ru(this))},t.Na=function(o){this.g&&(this.response=o,ru(this))},t.ga=function(){this.g&&ru(this)};function ru(o){o.readyState=4,o.l=null,o.j=null,o.B=null,su(o)}t.setRequestHeader=function(o,c){this.A.append(o,c)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],c=this.h.entries();for(var f=c.next();!f.done;)f=f.value,o.push(f[0]+": "+f[1]),f=c.next();return o.join(`\r
`)};function su(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Rc.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function ev(o){let c="";return U(o,function(f,g){c+=g,c+=":",c+=f,c+=`\r
`}),c}function mp(o,c,f){e:{for(g in f){var g=!1;break e}g=!0}g||(f=ev(f),typeof o=="string"?f!=null&&K(f):je(o,c,f))}function ut(o){Te.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(ut,Te);var UR=/^https?$/i,FR=["POST","PUT"];t=ut.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,c,f,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);c=c?c.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():bc.g(),this.g.onreadystatechange=p(d(this.Ca,this));try{this.B=!0,this.g.open(c,String(o),!0),this.B=!1}catch(P){tv(this,P);return}if(o=f||"",f=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var R in g)f.set(R,g[R]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(let P of g.keys())f.set(P,g.get(P));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(f.keys()).find(P=>P.toLowerCase()=="content-type"),R=i.FormData&&o instanceof i.FormData,!(Array.prototype.indexOf.call(FR,c,void 0)>=0)||g||R||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[P,z]of f)this.g.setRequestHeader(P,z);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(P){tv(this,P)}};function tv(o,c){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=c,o.o=5,av(o),kc(o)}function av(o){o.A||(o.A=!0,Ee(o,"complete"),Ee(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,Ee(this,"complete"),Ee(this,"abort"),kc(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),kc(this,!0)),ut.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?nv(this):this.Xa())},t.Xa=function(){nv(this)};function nv(o){if(o.h&&typeof s<"u"){if(o.v&&Lr(o)==4)setTimeout(o.Ca.bind(o),0);else if(Ee(o,"readystatechange"),Lr(o)==4){o.h=!1;try{let P=o.ca();e:switch(P){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var f;if(!(f=c)){var g;if(g=P===0){let z=String(o.D).match(KS)[1]||null;!z&&i.self&&i.self.location&&(z=i.self.location.protocol.slice(0,-1)),g=!UR.test(z?z.toLowerCase():"")}f=g}if(f)Ee(o,"complete"),Ee(o,"success");else{o.o=6;try{var R=Lr(o)>2?o.g.statusText:""}catch{R=""}o.l=R+" ["+o.ca()+"]",av(o)}}finally{kc(o)}}}}function kc(o,c){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let f=o.g;o.g=null,c||Ee(o,"ready");try{f.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function Lr(o){return o.g?o.g.readyState:0}t.ca=function(){try{return Lr(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var c=this.g.responseText;return o&&c.indexOf(o)==0&&(c=c.substring(o.length)),on(c)}};function rv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function BR(o){let c={};o=(o.g&&Lr(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<o.length;g++){if(E(o[g]))continue;var f=Z(o[g]);let R=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();let P=c[R]||[];c[R]=P,P.push(f)}$(c,function(g){return g.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function iu(o,c,f){return f&&f.internalChannelParams&&f.internalChannelParams[o]||c}function sv(o){this.za=0,this.i=[],this.j=new Er,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=iu("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=iu("baseRetryDelayMs",5e3,o),this.Za=iu("retryDelaySeedMs",1e4,o),this.Ta=iu("forwardChannelMaxRetries",2,o),this.va=iu("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new qS(o&&o.concurrentRequestLimit),this.Ba=new VR,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=sv.prototype,t.ka=8,t.I=1,t.connect=function(o,c,f,g){Dt(0),this.W=o,this.H=c||{},f&&g!==void 0&&(this.H.OSID=f,this.H.OAID=g),this.F=this.X,this.J=pv(this,null,this.W),Pc(this)};function gp(o){if(iv(o),o.I==3){var c=o.V++,f=ln(o.J);if(je(f,"SID",o.M),je(f,"RID",c),je(f,"TYPE","terminate"),ou(o,f),c=new Q(o,o.j,c),c.M=2,c.A=Ac(ln(f)),f=!1,i.navigator&&i.navigator.sendBeacon)try{f=i.navigator.sendBeacon(c.A.toString(),"")}catch{}!f&&i.Image&&(new Image().src=c.A,f=!0),f||(c.g=mv(c.j,null),c.g.ea(c.A)),c.F=Date.now(),Lc(c)}hv(o)}function Dc(o){o.g&&(_p(o),o.g.cancel(),o.g=null)}function iv(o){Dc(o),o.v&&(i.clearTimeout(o.v),o.v=null),Oc(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&i.clearTimeout(o.m),o.m=null)}function Pc(o){if(!zS(o.h)&&!o.m){o.m=!0;var c=o.Ea;B||y(),G||(B(),G=!0),S.add(c,o),o.D=0}}function qR(o,c){return HS(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=c.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=un(d(o.Ea,o,c),fv(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let R=new Q(this,this.j,o),P=this.o;if(this.U&&(P?(P=W(P),q(P,this.U)):P=this.U),this.u!==null||this.R||(R.J=P,P=null),this.S)e:{for(var c=0,f=0;f<this.i.length;f++){t:{var g=this.i[f];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(c+=g,c>4096){c=f;break e}if(c===4096||f===this.i.length-1){c=f+1;break e}}c=1e3}else c=1e3;c=uv(this,R,c),f=ln(this.J),je(f,"RID",o),je(f,"CVER",22),this.G&&je(f,"X-HTTP-Session-Id",this.G),ou(this,f),P&&(this.R?c="headers="+K(ev(P))+"&"+c:this.u&&mp(f,this.u,P)),hp(this.h,R),this.Ra&&je(f,"TYPE","init"),this.S?(je(f,"$req",c),je(f,"SID","null"),R.U=!0,bt(R,f,null)):bt(R,f,c),this.I=2}}else this.I==3&&(o?ov(this,o):this.i.length==0||zS(this.h)||ov(this))};function ov(o,c){var f;c?f=c.l:f=o.V++;let g=ln(o.J);je(g,"SID",o.M),je(g,"RID",f),je(g,"AID",o.K),ou(o,g),o.u&&o.o&&mp(g,o.u,o.o),f=new Q(o,o.j,f,o.D+1),o.u===null&&(f.J=o.o),c&&(o.i=c.G.concat(o.i)),c=uv(o,f,1e3),f.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),hp(o.h,f),bt(f,g,c)}function ou(o,c){o.H&&U(o.H,function(f,g){je(c,g,f)}),o.l&&U({},function(f,g){je(c,g,f)})}function uv(o,c,f){f=Math.min(o.i.length,f);let g=o.l?d(o.l.Ka,o.l,o):null;e:{var R=o.i;let ce=-1;for(;;){let Lt=["count="+f];ce==-1?f>0?(ce=R[0].g,Lt.push("ofs="+ce)):ce=0:Lt.push("ofs="+ce);let qe=!0;for(let Pt=0;Pt<f;Pt++){var P=R[Pt].g;let cn=R[Pt].map;if(P-=ce,P<0)ce=Math.max(0,R[Pt].g-100),qe=!1;else try{P="req"+P+"_"||"";try{var z=cn instanceof Map?cn:Object.entries(cn);for(let[ys,Ar]of z){let xr=Ar;u(Ar)&&(xr=ya(Ar)),Lt.push(P+ys+"="+encodeURIComponent(xr))}}catch(ys){throw Lt.push(P+"type="+encodeURIComponent("_badmap")),ys}}catch{g&&g(cn)}}if(qe){z=Lt.join("&");break e}}z=void 0}return o=o.i.splice(0,f),c.G=o,z}function lv(o){if(!o.g&&!o.v){o.Y=1;var c=o.Da;B||y(),G||(B(),G=!0),S.add(c,o),o.A=0}}function yp(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=un(d(o.Da,o),fv(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,cv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=un(d(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Dt(10),Dc(this),cv(this))};function _p(o){o.B!=null&&(i.clearTimeout(o.B),o.B=null)}function cv(o){o.g=new Q(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var c=ln(o.na);je(c,"RID","rpc"),je(c,"SID",o.M),je(c,"AID",o.K),je(c,"CI",o.F?"0":"1"),!o.F&&o.ia&&je(c,"TO",o.ia),je(c,"TYPE","xmlhttp"),ou(o,c),o.u&&o.o&&mp(c,o.u,o.o),o.O&&(o.g.H=o.O);var f=o.g;o=o.ba,f.M=1,f.A=Ac(ln(c)),f.u=null,f.R=!0,Ya(f,o)}t.Va=function(){this.C!=null&&(this.C=null,Dc(this),yp(this),Dt(19))};function Oc(o){o.C!=null&&(i.clearTimeout(o.C),o.C=null)}function dv(o,c){var f=null;if(o.g==c){Oc(o),_p(o),o.g=null;var g=2}else if(fp(o.h,c))f=c.G,GS(o.h,c),g=1;else return;if(o.I!=0){if(c.o)if(g==1){f=c.u?c.u.length:0,c=Date.now()-c.F;var R=o.D;g=Mn(),Ee(g,new Xo(g,f)),Pc(o)}else lv(o);else if(R=c.m,R==3||R==0&&c.X>0||!(g==1&&qR(o,c)||g==2&&yp(o)))switch(f&&f.length>0&&(c=o.h,c.i=c.i.concat(f)),R){case 1:gs(o,5);break;case 4:gs(o,10);break;case 3:gs(o,6);break;default:gs(o,2)}}}function fv(o,c){let f=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(f*=2),f*c}function gs(o,c){if(o.j.info("Error code "+c),c==2){var f=d(o.bb,o),g=o.Ua;let R=!g;g=new Cr(g||"//www.google.com/images/cleardot.gif"),i.location&&i.location.protocol=="http"||Zo(g,"https"),Ac(g),R?MR(g.toString(),f):NR(g.toString(),f)}else Dt(2);o.I=0,o.l&&o.l.pa(c),hv(o),iv(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),Dt(2)):(this.j.info("Failed to ping google.com"),Dt(1))};function hv(o){if(o.I=0,o.ja=[],o.l){let c=jS(o.h);(c.length!=0||o.i.length!=0)&&(L(o.ja,c),L(o.ja,o.i),o.h.i.length=0,I(o.i),o.i.length=0),o.l.oa()}}function pv(o,c,f){var g=f instanceof Cr?ln(f):new Cr(f);if(g.g!="")c&&(g.g=c+"."+g.g),eu(g,g.u);else{var R=i.location;g=R.protocol,c=c?c+"."+R.hostname:R.hostname,R=+R.port;let P=new Cr(null);g&&Zo(P,g),c&&(P.g=c),R&&eu(P,R),f&&(P.h=f),g=P}return f=o.G,c=o.wa,f&&c&&je(g,f,c),je(g,"VER",o.ka),ou(o,g),g}function mv(o,c,f){if(c&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return c=o.Aa&&!o.ma?new ut(new xc({ab:f})):new ut(o.ma),c.Fa(o.L),c}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function gv(){}t=gv.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function Mc(){}Mc.prototype.g=function(o,c){return new Sa(o,c)};function Sa(o,c){Te.call(this),this.g=new sv(c),this.l=o,this.h=c&&c.messageUrlParams||null,o=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(o?o["X-WebChannel-Content-Type"]=c.messageContentType:o={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.sa&&(o?o["X-WebChannel-Client-Profile"]=c.sa:o={"X-WebChannel-Client-Profile":c.sa}),this.g.U=o,(o=c&&c.Qb)&&!E(o)&&(this.g.u=o),this.A=c&&c.supportsCrossDomainXhr||!1,this.v=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!E(c)&&(this.g.G=c,o=this.h,o!==null&&c in o&&(o=this.h,c in o&&delete o[c])),this.j=new ii(this)}m(Sa,Te),Sa.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Sa.prototype.close=function(){gp(this.g)},Sa.prototype.o=function(o){var c=this.g;if(typeof o=="string"){var f={};f.__data__=o,o=f}else this.v&&(f={},f.__data__=ya(o),o=f);c.i.push(new LR(c.Ya++,o)),c.I==3&&Pc(c)},Sa.prototype.N=function(){this.g.l=null,delete this.j,gp(this.g),delete this.g,Sa.Z.N.call(this)};function yv(o){_a.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var c=o.__sm__;if(c){e:{for(let f in c){o=f;break e}o=void 0}(this.i=o)&&(o=this.i,c=c!==null&&o in c?c[o]:void 0),this.data=c}else this.data=o}m(yv,_a);function _v(){Ia.call(this),this.status=1}m(_v,Ia);function ii(o){this.g=o}m(ii,gv),ii.prototype.ra=function(){Ee(this.g,"a")},ii.prototype.qa=function(o){Ee(this.g,new yv(o))},ii.prototype.pa=function(o){Ee(this.g,new _v)},ii.prototype.oa=function(){Ee(this.g,"b")},Mc.prototype.createWebChannel=Mc.prototype.g,Sa.prototype.send=Sa.prototype.o,Sa.prototype.open=Sa.prototype.m,Sa.prototype.close=Sa.prototype.close,w_=or.createWebChannelTransport=function(){return new Mc},T_=or.getStatEventTarget=function(){return Mn()},v_=or.Event=ra,sh=or.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ni.NO_ERROR=0,ni.TIMEOUT=8,ni.HTTP_ERROR=6,Rl=or.ErrorCode=ni,ri.COMPLETE="complete",S_=or.EventType=ri,jo.EventType=Tr,Tr.OPEN="a",Tr.CLOSE="b",Tr.ERROR="c",Tr.MESSAGE="d",Te.prototype.listen=Te.prototype.J,uo=or.WebChannel=jo,xN=or.FetchXmlHttpFactory=xc,ut.prototype.listenOnce=ut.prototype.K,ut.prototype.getLastError=ut.prototype.Ha,ut.prototype.getLastErrorCode=ut.prototype.ya,ut.prototype.getStatus=ut.prototype.ca,ut.prototype.getResponseJson=ut.prototype.La,ut.prototype.getResponseText=ut.prototype.la,ut.prototype.send=ut.prototype.ea,ut.prototype.setWithCredentials=ut.prototype.Fa,I_=or.XhrIo=ut}).apply(typeof rh<"u"?rh:typeof self<"u"?self:typeof window<"u"?window:{});var Bt=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};Bt.UNAUTHENTICATED=new Bt(null),Bt.GOOGLE_CREDENTIALS=new Bt("google-credentials-uid"),Bt.FIRST_PARTY=new Bt("first-party-uid"),Bt.MOCK_USER=new Bt("mock-user");var Do="12.10.0";function fx(t){Do=t}var Zs=new rs("@firebase/firestore");function lo(){return Zs.logLevel}function X(t,...e){if(Zs.logLevel<=de.DEBUG){let a=e.map($I);Zs.debug(`Firestore (${Do}): ${t}`,...a)}}function cr(t,...e){if(Zs.logLevel<=de.ERROR){let a=e.map($I);Zs.error(`Firestore (${Do}): ${t}`,...a)}}function dr(t,...e){if(Zs.logLevel<=de.WARN){let a=e.map($I);Zs.warn(`Firestore (${Do}): ${t}`,...a)}}function $I(t){if(typeof t=="string")return t;try{return function(a){return JSON.stringify(a)}(t)}catch{return t}}function se(t,e,a){let n="Unexpected state";typeof e=="string"?n=e:a=e,hx(t,n,a)}function hx(t,e,a){let n=`FIRESTORE (${Do}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(a!==void 0)try{n+=" CONTEXT: "+JSON.stringify(a)}catch{n+=" CONTEXT: "+a}throw cr(n),new Error(n)}function it(t,e,a,n){let r="Unexpected state";typeof a=="string"?r=a:n=a,t||hx(e,r,n)}function Se(t,e){return t}var V={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},j=class extends na{constructor(e,a){super(e,a),this.code=e,this.message=a,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var ur=class{constructor(){this.promise=new Promise((e,a)=>{this.resolve=e,this.reject=a})}};var dh=class{constructor(e,a){this.user=a,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},fh=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,a){e.enqueueRetryable(()=>a(Bt.UNAUTHENTICATED))}shutdown(){}},R_=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,a){this.changeListener=a,e.enqueueRetryable(()=>a(this.token.user))}shutdown(){this.changeListener=null}},hh=class{constructor(e){this.t=e,this.currentUser=Bt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,a){it(this.o===void 0,42304);let n=this.i,r=l=>this.i!==n?(n=this.i,a(l)):Promise.resolve(),s=new ur;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new ur,e.enqueueRetryable(()=>r(this.currentUser))};let i=()=>{let l=s;e.enqueueRetryable(async()=>{await l.promise,await r(this.currentUser)})},u=l=>{X("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){let l=this.t.getImmediate({optional:!0});l?u(l):(X("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new ur)}},0),i()}getToken(){let e=this.i,a=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(a).then(n=>this.i!==e?(X("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(it(typeof n.accessToken=="string",31837,{l:n}),new dh(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return it(e===null||typeof e=="string",2055,{h:e}),new Bt(e)}},k_=class{constructor(e,a,n){this.P=e,this.T=a,this.I=n,this.type="FirstParty",this.user=Bt.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},D_=class{constructor(e,a,n){this.P=e,this.T=a,this.I=n}getToken(){return Promise.resolve(new k_(this.P,this.T,this.I))}start(e,a){e.enqueueRetryable(()=>a(Bt.FIRST_PARTY))}shutdown(){}invalidateToken(){}},ph=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},mh=class{constructor(e,a){this.V=a,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,pa(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,a){it(this.o===void 0,3512);let n=s=>{s.error!=null&&X("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);let i=s.token!==this.m;return this.m=s.token,X("FirebaseAppCheckTokenProvider",`Received ${i?"new":"existing"} token.`),i?a(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>n(s))};let r=s=>{X("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>r(s)),setTimeout(()=>{if(!this.appCheck){let s=this.V.getImmediate({optional:!0});s?r(s):X("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new ph(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(a=>a?(it(typeof a.token=="string",44558,{tokenResult:a}),this.m=a.token,new ph(a.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function RN(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),a=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(a);else for(let n=0;n<t;n++)a[n]=Math.floor(256*Math.random());return a}var _o=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",a=62*Math.floor(4.129032258064516),n="";for(;n.length<20;){let r=RN(40);for(let s=0;s<r.length;++s)n.length<20&&r[s]<a&&(n+=e.charAt(r[s]%62))}return n}};function ye(t,e){return t<e?-1:t>e?1:0}function P_(t,e){let a=Math.min(t.length,e.length);for(let n=0;n<a;n++){let r=t.charAt(n),s=e.charAt(n);if(r!==s)return E_(r)===E_(s)?ye(r,s):E_(r)?1:-1}return ye(t.length,e.length)}var kN=55296,DN=57343;function E_(t){let e=t.charCodeAt(0);return e>=kN&&e<=DN}function Io(t,e,a){return t.length===e.length&&t.every((n,r)=>a(n,e[r]))}var LA="__name__",gh=class t{constructor(e,a,n){a===void 0?a=0:a>e.length&&se(637,{offset:a,range:e.length}),n===void 0?n=e.length-a:n>e.length-a&&se(1746,{length:n,range:e.length-a}),this.segments=e,this.offset=a,this.len=n}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let a=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(n=>{a.push(n)}):a.push(e),this.construct(a)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let a=0;a<this.length;a++)if(this.get(a)!==e.get(a))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let a=0;a<this.length;a++)if(this.get(a)!==e.get(a))return!1;return!0}forEach(e){for(let a=this.offset,n=this.limit();a<n;a++)e(this.segments[a])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,a){let n=Math.min(e.length,a.length);for(let r=0;r<n;r++){let s=t.compareSegments(e.get(r),a.get(r));if(s!==0)return s}return ye(e.length,a.length)}static compareSegments(e,a){let n=t.isNumericId(e),r=t.isNumericId(a);return n&&!r?-1:!n&&r?1:n&&r?t.extractNumericId(e).compare(t.extractNumericId(a)):P_(e,a)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return ir.fromString(e.substring(4,e.length-2))}},tt=class t extends gh{construct(e,a,n){return new t(e,a,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let a=[];for(let n of e){if(n.indexOf("//")>=0)throw new j(V.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);a.push(...n.split("/").filter(r=>r.length>0))}return new t(a)}static emptyPath(){return new t([])}},PN=/^[_a-zA-Z][_a-zA-Z0-9]*$/,ka=class t extends gh{construct(e,a,n){return new t(e,a,n)}static isValidIdentifier(e){return PN.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===LA}static keyField(){return new t([LA])}static fromServerFormat(e){let a=[],n="",r=0,s=()=>{if(n.length===0)throw new j(V.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);a.push(n),n=""},i=!1;for(;r<e.length;){let u=e[r];if(u==="\\"){if(r+1===e.length)throw new j(V.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new j(V.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=l,r+=2}else u==="`"?(i=!i,r++):u!=="."||i?(n+=u,r++):(s(),r++)}if(s(),i)throw new j(V.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(a)}static emptyPath(){return new t([])}};var te=class t{constructor(e){this.path=e}static fromPath(e){return new t(tt.fromString(e))}static fromName(e){return new t(tt.fromString(e).popFirst(5))}static empty(){return new t(tt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&tt.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,a){return tt.comparator(e.path,a.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new tt(e.slice()))}};function ON(t,e,a){if(!a)throw new j(V.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function px(t,e,a,n){if(e===!0&&n===!0)throw new j(V.INVALID_ARGUMENT,`${t} and ${a} cannot be used together.`)}function AA(t){if(te.isDocumentKey(t))throw new j(V.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function mx(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function ec(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(n){return n.constructor?n.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":se(12329,{type:typeof t})}function tc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new j(V.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let a=ec(t);throw new j(V.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${a}`)}}return t}function gx(t,e){if(e<=0)throw new j(V.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function gt(t,e){let a={typeString:t};return e&&(a.value=e),a}function Po(t,e){if(!mx(t))throw new j(V.INVALID_ARGUMENT,"JSON must be an object");let a;for(let n in e)if(e[n]){let r=e[n].typeString,s="value"in e[n]?{value:e[n].value}:void 0;if(!(n in t)){a=`JSON missing required field: '${n}'`;break}let i=t[n];if(r&&typeof i!==r){a=`JSON field '${n}' must be a ${r}.`;break}if(s!==void 0&&i!==s.value){a=`Expected '${n}' field to equal '${s.value}'`;break}}if(a)throw new j(V.INVALID_ARGUMENT,a);return!0}var xA=-62135596800,RA=1e6,Et=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let a=Math.floor(e/1e3),n=Math.floor((e-1e3*a)*RA);return new t(a,n)}constructor(e,a){if(this.seconds=e,this.nanoseconds=a,a<0)throw new j(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+a);if(a>=1e9)throw new j(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+a);if(e<xA)throw new j(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new j(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/RA}_compareTo(e){return this.seconds===e.seconds?ye(this.nanoseconds,e.nanoseconds):ye(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Po(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-xA;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};Et._jsonSchemaVersion="firestore/timestamp/1.0",Et._jsonSchema={type:gt("string",Et._jsonSchemaVersion),seconds:gt("number"),nanoseconds:gt("number")};var le=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new Et(0,0))}static max(){return new t(new Et(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var Nl=-1,yh=class{constructor(e,a,n,r){this.indexId=e,this.collectionGroup=a,this.fields=n,this.indexState=r}};yh.UNKNOWN_ID=-1;function MN(t,e){let a=t.toTimestamp().seconds,n=t.toTimestamp().nanoseconds+1,r=le.fromTimestamp(n===1e9?new Et(a+1,0):new Et(a,n));return new ei(r,te.empty(),e)}function NN(t){return new ei(t.readTime,t.key,Nl)}var ei=class t{constructor(e,a,n){this.readTime=e,this.documentKey=a,this.largestBatchId=n}static min(){return new t(le.min(),te.empty(),Nl)}static max(){return new t(le.max(),te.empty(),Nl)}};function VN(t,e){let a=t.readTime.compareTo(e.readTime);return a!==0?a:(a=te.comparator(t.documentKey,e.documentKey),a!==0?a:ye(t.largestBatchId,e.largestBatchId))}var UN="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",O_=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function zh(t){if(t.code!==V.FAILED_PRECONDITION||t.message!==UN)throw t;X("LocalStore","Unexpectedly lost primary lease")}var F=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(a=>{this.isDone=!0,this.result=a,this.nextCallback&&this.nextCallback(a)},a=>{this.isDone=!0,this.error=a,this.catchCallback&&this.catchCallback(a)})}catch(e){return this.next(void 0,e)}next(e,a){return this.callbackAttached&&se(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(a,this.error):this.wrapSuccess(e,this.result):new t((n,r)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(n,r)},this.catchCallback=s=>{this.wrapFailure(a,s).next(n,r)}})}toPromise(){return new Promise((e,a)=>{this.next(e,a)})}wrapUserFunction(e){try{let a=e();return a instanceof t?a:t.resolve(a)}catch(a){return t.reject(a)}}wrapSuccess(e,a){return e?this.wrapUserFunction(()=>e(a)):t.resolve(a)}wrapFailure(e,a){return e?this.wrapUserFunction(()=>e(a)):t.reject(a)}static resolve(e){return new t((a,n)=>{a(e)})}static reject(e){return new t((a,n)=>{n(e)})}static waitFor(e){return new t((a,n)=>{let r=0,s=0,i=!1;e.forEach(u=>{++r,u.next(()=>{++s,i&&s===r&&a()},l=>n(l))}),i=!0,s===r&&a()})}static or(e){let a=t.resolve(!1);for(let n of e)a=a.next(r=>r?t.resolve(r):n());return a}static forEach(e,a){let n=[];return e.forEach((r,s)=>{n.push(a.call(this,r,s))}),this.waitFor(n)}static mapArray(e,a){return new t((n,r)=>{let s=e.length,i=new Array(s),u=0;for(let l=0;l<s;l++){let d=l;a(e[d]).next(h=>{i[d]=h,++u,u===s&&n(i)},h=>r(h))}})}static doWhile(e,a){return new t((n,r)=>{let s=()=>{e()===!0?a().next(()=>{s()},r):n()};s()})}};function FN(t){let e=t.match(/Android ([\d.]+)/i),a=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(a)}function Oo(t){return t.name==="IndexedDbTransactionError"}var So=class{constructor(e,a){this.previousValue=e,a&&(a.sequenceNumberHandler=n=>this.ae(n),this.ue=n=>a.writeSequenceNumber(n))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};So.ce=-1;var BN=-1;function Hh(t){return t==null}function Vl(t){return t===0&&1/t==-1/0}function qN(t){return typeof t=="number"&&Number.isInteger(t)&&!Vl(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var yx="";function zN(t){let e="";for(let a=0;a<t.length;a++)e.length>0&&(e=kA(e)),e=HN(t.get(a),e);return kA(e)}function HN(t,e){let a=e,n=t.length;for(let r=0;r<n;r++){let s=t.charAt(r);switch(s){case"\0":a+="";break;case yx:a+="";break;default:a+=s}}return a}function kA(t){return t+yx+""}var GN="remoteDocuments",_x="owner";var Ix="mutationQueues";var Sx="mutations";var vx="documentMutations",jN="remoteDocumentsV14";var Tx="remoteDocumentGlobal";var wx="targets";var Ex="targetDocuments";var Cx="targetGlobal",bx="collectionParents";var Lx="clientMetadata";var Ax="bundles";var xx="namedQueries";var KN="indexConfiguration";var WN="indexState";var QN="indexEntries";var Rx="documentOverlays";var XN="globals";var YN=[Ix,Sx,vx,GN,wx,_x,Cx,Ex,Lx,Tx,bx,Ax,xx],Iq=[...YN,Rx],$N=[Ix,Sx,vx,jN,wx,_x,Cx,Ex,Lx,Tx,bx,Ax,xx,Rx],JN=$N,ZN=[...JN,KN,WN,QN];var Sq=[...ZN,XN];function DA(t){let e=0;for(let a in t)Object.prototype.hasOwnProperty.call(t,a)&&e++;return e}function Mo(t,e){for(let a in t)Object.prototype.hasOwnProperty.call(t,a)&&e(a,t[a])}function kx(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var yt=class t{constructor(e,a){this.comparator=e,this.root=a||Ln.EMPTY}insert(e,a){return new t(this.comparator,this.root.insert(e,a,this.comparator).copy(null,null,Ln.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ln.BLACK,null,null))}get(e){let a=this.root;for(;!a.isEmpty();){let n=this.comparator(e,a.key);if(n===0)return a.value;n<0?a=a.left:n>0&&(a=a.right)}return null}indexOf(e){let a=0,n=this.root;for(;!n.isEmpty();){let r=this.comparator(e,n.key);if(r===0)return a+n.left.size;r<0?n=n.left:(a+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((a,n)=>(e(a,n),!1))}toString(){let e=[];return this.inorderTraversal((a,n)=>(e.push(`${a}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new po(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new po(this.root,e,this.comparator,!1)}getReverseIterator(){return new po(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new po(this.root,e,this.comparator,!0)}},po=class{constructor(e,a,n,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=a?n(e.key,a):1,a&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),a={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return a}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},Ln=class t{constructor(e,a,n,r,s){this.key=e,this.value=a,this.color=n??t.RED,this.left=r??t.EMPTY,this.right=s??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,a,n,r,s){return new t(e??this.key,a??this.value,n??this.color,r??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,a,n){let r=this,s=n(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,a,n),null):s===0?r.copy(null,a,null,null,null):r.copy(null,null,null,null,r.right.insert(e,a,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,a){let n,r=this;if(a(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,a),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),a(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,a))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),a=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,a)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw se(43730,{key:this.key,value:this.value});if(this.right.isRed())throw se(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw se(27949);return e+(this.isRed()?0:1)}};Ln.EMPTY=null,Ln.RED=!0,Ln.BLACK=!1;Ln.EMPTY=new class{constructor(){this.size=0}get key(){throw se(57766)}get value(){throw se(16141)}get color(){throw se(16727)}get left(){throw se(29726)}get right(){throw se(36894)}copy(e,a,n,r,s){return this}insert(e,a,n){return new Ln(e,a)}remove(e,a){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var qt=class t{constructor(e){this.comparator=e,this.data=new yt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((a,n)=>(e(a),!1))}forEachInRange(e,a){let n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){let r=n.getNext();if(this.comparator(r.key,e[1])>=0)return;a(r.key)}}forEachWhile(e,a){let n;for(n=a!==void 0?this.data.getIteratorFrom(a):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){let a=this.data.getIteratorFrom(e);return a.hasNext()?a.getNext().key:null}getIterator(){return new _h(this.data.getIterator())}getIteratorFrom(e){return new _h(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let a=this;return a.size<e.size&&(a=e,e=this),e.forEach(n=>{a=a.add(n)}),a}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let a=this.data.getIterator(),n=e.data.getIterator();for(;a.hasNext();){let r=a.getNext().key,s=n.getNext().key;if(this.comparator(r,s)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(a=>{e.push(a)}),e}toString(){let e=[];return this.forEach(a=>e.push(a)),"SortedSet("+e.toString()+")"}copy(e){let a=new t(this.comparator);return a.data=e,a}},_h=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var Qs=class t{constructor(e){this.fields=e,e.sort(ka.comparator)}static empty(){return new t([])}unionWith(e){let a=new qt(ka.comparator);for(let n of this.fields)a=a.add(n);for(let n of e)a=a.add(n);return new t(a.toArray())}covers(e){for(let a of this.fields)if(a.isPrefixOf(e))return!0;return!1}isEqual(e){return Io(this.fields,e.fields,(a,n)=>a.isEqual(n))}};var Ih=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var Wt=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let a=function(r){try{return atob(r)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new Ih("Invalid base64 string: "+s):s}}(e);return new t(a)}static fromUint8Array(e){let a=function(r){let s="";for(let i=0;i<r.length;++i)s+=String.fromCharCode(r[i]);return s}(e);return new t(a)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(a){return btoa(a)}(this.binaryString)}toUint8Array(){return function(a){let n=new Uint8Array(a.length);for(let r=0;r<a.length;r++)n[r]=a.charCodeAt(r);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ye(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};Wt.EMPTY_BYTE_STRING=new Wt("");var e2=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function fr(t){if(it(!!t,39018),typeof t=="string"){let e=0,a=e2.exec(t);if(it(!!a,46558,{timestamp:t}),a[1]){let r=a[1];r=(r+"000000000").substr(0,9),e=Number(r)}let n=new Date(t);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:et(t.seconds),nanos:et(t.nanos)}}function et(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function hr(t){return typeof t=="string"?Wt.fromBase64String(t):Wt.fromUint8Array(t)}var Dx="server_timestamp",Px="__type__",Ox="__previous_value__",Mx="__local_write_time__";function ac(t){return(t?.mapValue?.fields||{})[Px]?.stringValue===Dx}function Gh(t){let e=t.mapValue.fields[Ox];return ac(e)?Gh(e):e}function Ul(t){let e=fr(t.mapValue.fields[Mx].timestampValue);return new Et(e.seconds,e.nanos)}var M_=class{constructor(e,a,n,r,s,i,u,l,d,h,m){this.databaseId=e,this.appId=a,this.persistenceKey=n,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=d,this.isUsingEmulator=h,this.apiKey=m}},Sh="(default)",Fl=class t{constructor(e,a){this.projectId=e,this.database=a||Sh}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===Sh}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function Nx(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new j(V.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Fl(t.options.projectId,e)}var JI="__type__",Vx="__max__",ih={mapValue:{fields:{__type__:{stringValue:Vx}}}},ZI="__vector__",vo="value";function us(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?ac(t)?4:Fx(t)?9007199254740991:Ux(t)?10:11:se(28295,{value:t})}function kn(t,e){if(t===e)return!0;let a=us(t);if(a!==us(e))return!1;switch(a){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Ul(t).isEqual(Ul(e));case 3:return function(r,s){if(typeof r.timestampValue=="string"&&typeof s.timestampValue=="string"&&r.timestampValue.length===s.timestampValue.length)return r.timestampValue===s.timestampValue;let i=fr(r.timestampValue),u=fr(s.timestampValue);return i.seconds===u.seconds&&i.nanos===u.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,s){return hr(r.bytesValue).isEqual(hr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,s){return et(r.geoPointValue.latitude)===et(s.geoPointValue.latitude)&&et(r.geoPointValue.longitude)===et(s.geoPointValue.longitude)}(t,e);case 2:return function(r,s){if("integerValue"in r&&"integerValue"in s)return et(r.integerValue)===et(s.integerValue);if("doubleValue"in r&&"doubleValue"in s){let i=et(r.doubleValue),u=et(s.doubleValue);return i===u?Vl(i)===Vl(u):isNaN(i)&&isNaN(u)}return!1}(t,e);case 9:return Io(t.arrayValue.values||[],e.arrayValue.values||[],kn);case 10:case 11:return function(r,s){let i=r.mapValue.fields||{},u=s.mapValue.fields||{};if(DA(i)!==DA(u))return!1;for(let l in i)if(i.hasOwnProperty(l)&&(u[l]===void 0||!kn(i[l],u[l])))return!1;return!0}(t,e);default:return se(52216,{left:t})}}function Bl(t,e){return(t.values||[]).find(a=>kn(a,e))!==void 0}function To(t,e){if(t===e)return 0;let a=us(t),n=us(e);if(a!==n)return ye(a,n);switch(a){case 0:case 9007199254740991:return 0;case 1:return ye(t.booleanValue,e.booleanValue);case 2:return function(s,i){let u=et(s.integerValue||s.doubleValue),l=et(i.integerValue||i.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(t,e);case 3:return PA(t.timestampValue,e.timestampValue);case 4:return PA(Ul(t),Ul(e));case 5:return P_(t.stringValue,e.stringValue);case 6:return function(s,i){let u=hr(s),l=hr(i);return u.compareTo(l)}(t.bytesValue,e.bytesValue);case 7:return function(s,i){let u=s.split("/"),l=i.split("/");for(let d=0;d<u.length&&d<l.length;d++){let h=ye(u[d],l[d]);if(h!==0)return h}return ye(u.length,l.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,i){let u=ye(et(s.latitude),et(i.latitude));return u!==0?u:ye(et(s.longitude),et(i.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return OA(t.arrayValue,e.arrayValue);case 10:return function(s,i){let u=s.fields||{},l=i.fields||{},d=u[vo]?.arrayValue,h=l[vo]?.arrayValue,m=ye(d?.values?.length||0,h?.values?.length||0);return m!==0?m:OA(d,h)}(t.mapValue,e.mapValue);case 11:return function(s,i){if(s===ih.mapValue&&i===ih.mapValue)return 0;if(s===ih.mapValue)return 1;if(i===ih.mapValue)return-1;let u=s.fields||{},l=Object.keys(u),d=i.fields||{},h=Object.keys(d);l.sort(),h.sort();for(let m=0;m<l.length&&m<h.length;++m){let p=P_(l[m],h[m]);if(p!==0)return p;let I=To(u[l[m]],d[h[m]]);if(I!==0)return I}return ye(l.length,h.length)}(t.mapValue,e.mapValue);default:throw se(23264,{he:a})}}function PA(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return ye(t,e);let a=fr(t),n=fr(e),r=ye(a.seconds,n.seconds);return r!==0?r:ye(a.nanos,n.nanos)}function OA(t,e){let a=t.values||[],n=e.values||[];for(let r=0;r<a.length&&r<n.length;++r){let s=To(a[r],n[r]);if(s)return s}return ye(a.length,n.length)}function wo(t){return N_(t)}function N_(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(a){let n=fr(a);return`time(${n.seconds},${n.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(a){return hr(a).toBase64()}(t.bytesValue):"referenceValue"in t?function(a){return te.fromName(a).toString()}(t.referenceValue):"geoPointValue"in t?function(a){return`geo(${a.latitude},${a.longitude})`}(t.geoPointValue):"arrayValue"in t?function(a){let n="[",r=!0;for(let s of a.values||[])r?r=!1:n+=",",n+=N_(s);return n+"]"}(t.arrayValue):"mapValue"in t?function(a){let n=Object.keys(a.fields||{}).sort(),r="{",s=!0;for(let i of n)s?s=!1:r+=",",r+=`${i}:${N_(a.fields[i])}`;return r+"}"}(t.mapValue):se(61005,{value:t})}function lh(t){switch(us(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=Gh(t);return e?16+lh(e):16;case 5:return 2*t.stringValue.length;case 6:return hr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(n){return(n.values||[]).reduce((r,s)=>r+lh(s),0)}(t.arrayValue);case 10:case 11:return function(n){let r=0;return Mo(n.fields,(s,i)=>{r+=s.length+lh(i)}),r}(t.mapValue);default:throw se(13486,{value:t})}}function nc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function V_(t){return!!t&&"integerValue"in t}function eS(t){return!!t&&"arrayValue"in t}function MA(t){return!!t&&"nullValue"in t}function NA(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function C_(t){return!!t&&"mapValue"in t}function Ux(t){return(t?.mapValue?.fields||{})[JI]?.stringValue===ZI}function Pl(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return Mo(t.mapValue.fields,(a,n)=>e.mapValue.fields[a]=Pl(n)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let a=0;a<(t.arrayValue.values||[]).length;++a)e.arrayValue.values[a]=Pl(t.arrayValue.values[a]);return e}return{...t}}function Fx(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===Vx}var Tq={mapValue:{fields:{[JI]:{stringValue:ZI},[vo]:{arrayValue:{}}}}};var bn=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let a=this.value;for(let n=0;n<e.length-1;++n)if(a=(a.mapValue.fields||{})[e.get(n)],!C_(a))return null;return a=(a.mapValue.fields||{})[e.lastSegment()],a||null}}set(e,a){this.getFieldsMap(e.popLast())[e.lastSegment()]=Pl(a)}setAll(e){let a=ka.emptyPath(),n={},r=[];e.forEach((i,u)=>{if(!a.isImmediateParentOf(u)){let l=this.getFieldsMap(a);this.applyChanges(l,n,r),n={},r=[],a=u.popLast()}i?n[u.lastSegment()]=Pl(i):r.push(u.lastSegment())});let s=this.getFieldsMap(a);this.applyChanges(s,n,r)}delete(e){let a=this.field(e.popLast());C_(a)&&a.mapValue.fields&&delete a.mapValue.fields[e.lastSegment()]}isEqual(e){return kn(this.value,e.value)}getFieldsMap(e){let a=this.value;a.mapValue.fields||(a.mapValue={fields:{}});for(let n=0;n<e.length;++n){let r=a.mapValue.fields[e.get(n)];C_(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},a.mapValue.fields[e.get(n)]=r),a=r}return a.mapValue.fields}applyChanges(e,a,n){Mo(a,(r,s)=>e[r]=s);for(let r of n)delete e[r]}clone(){return new t(Pl(this.value))}};var rn=class t{constructor(e,a,n,r,s,i,u){this.key=e,this.documentType=a,this.version=n,this.readTime=r,this.createTime=s,this.data=i,this.documentState=u}static newInvalidDocument(e){return new t(e,0,le.min(),le.min(),le.min(),bn.empty(),0)}static newFoundDocument(e,a,n,r){return new t(e,1,a,le.min(),n,r,0)}static newNoDocument(e,a){return new t(e,2,a,le.min(),le.min(),bn.empty(),0)}static newUnknownDocument(e,a){return new t(e,3,a,le.min(),le.min(),bn.empty(),2)}convertToFoundDocument(e,a){return!this.createTime.isEqual(le.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=a,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=bn.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=bn.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=le.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var pr=class{constructor(e,a){this.position=e,this.inclusive=a}};function VA(t,e,a){let n=0;for(let r=0;r<t.position.length;r++){let s=e[r],i=t.position[r];if(s.field.isKeyField()?n=te.comparator(te.fromName(i.referenceValue),a.key):n=To(i,a.data.field(s.field)),s.dir==="desc"&&(n*=-1),n!==0)break}return n}function UA(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let a=0;a<t.position.length;a++)if(!kn(t.position[a],e.position[a]))return!1;return!0}var ls=class{constructor(e,a="asc"){this.field=e,this.dir=a}};function t2(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var vh=class{},mt=class t extends vh{constructor(e,a,n){super(),this.field=e,this.op=a,this.value=n}static create(e,a,n){return e.isKeyField()?a==="in"||a==="not-in"?this.createKeyFieldInFilter(e,a,n):new F_(e,a,n):a==="array-contains"?new z_(e,n):a==="in"?new H_(e,n):a==="not-in"?new G_(e,n):a==="array-contains-any"?new j_(e,n):new t(e,a,n)}static createKeyFieldInFilter(e,a,n){return a==="in"?new B_(e,n):new q_(e,n)}matches(e){let a=e.data.field(this.field);return this.op==="!="?a!==null&&a.nullValue===void 0&&this.matchesComparison(To(a,this.value)):a!==null&&us(this.value)===us(a)&&this.matchesComparison(To(a,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return se(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},Wa=class t extends vh{constructor(e,a){super(),this.filters=e,this.op=a,this.Pe=null}static create(e,a){return new t(e,a)}matches(e){return Bx(this)?this.filters.find(a=>!a.matches(e))===void 0:this.filters.find(a=>a.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,a)=>e.concat(a.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function Bx(t){return t.op==="and"}function qx(t){return a2(t)&&Bx(t)}function a2(t){for(let e of t.filters)if(e instanceof Wa)return!1;return!0}function U_(t){if(t instanceof mt)return t.field.canonicalString()+t.op.toString()+wo(t.value);if(qx(t))return t.filters.map(e=>U_(e)).join(",");{let e=t.filters.map(a=>U_(a)).join(",");return`${t.op}(${e})`}}function zx(t,e){return t instanceof mt?function(n,r){return r instanceof mt&&n.op===r.op&&n.field.isEqual(r.field)&&kn(n.value,r.value)}(t,e):t instanceof Wa?function(n,r){return r instanceof Wa&&n.op===r.op&&n.filters.length===r.filters.length?n.filters.reduce((s,i,u)=>s&&zx(i,r.filters[u]),!0):!1}(t,e):void se(19439)}function Hx(t){return t instanceof mt?function(a){return`${a.field.canonicalString()} ${a.op} ${wo(a.value)}`}(t):t instanceof Wa?function(a){return a.op.toString()+" {"+a.getFilters().map(Hx).join(" ,")+"}"}(t):"Filter"}var F_=class extends mt{constructor(e,a,n){super(e,a,n),this.key=te.fromName(n.referenceValue)}matches(e){let a=te.comparator(e.key,this.key);return this.matchesComparison(a)}},B_=class extends mt{constructor(e,a){super(e,"in",a),this.keys=Gx("in",a)}matches(e){return this.keys.some(a=>a.isEqual(e.key))}},q_=class extends mt{constructor(e,a){super(e,"not-in",a),this.keys=Gx("not-in",a)}matches(e){return!this.keys.some(a=>a.isEqual(e.key))}};function Gx(t,e){return(e.arrayValue?.values||[]).map(a=>te.fromName(a.referenceValue))}var z_=class extends mt{constructor(e,a){super(e,"array-contains",a)}matches(e){let a=e.data.field(this.field);return eS(a)&&Bl(a.arrayValue,this.value)}},H_=class extends mt{constructor(e,a){super(e,"in",a)}matches(e){let a=e.data.field(this.field);return a!==null&&Bl(this.value.arrayValue,a)}},G_=class extends mt{constructor(e,a){super(e,"not-in",a)}matches(e){if(Bl(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let a=e.data.field(this.field);return a!==null&&a.nullValue===void 0&&!Bl(this.value.arrayValue,a)}},j_=class extends mt{constructor(e,a){super(e,"array-contains-any",a)}matches(e){let a=e.data.field(this.field);return!(!eS(a)||!a.arrayValue.values)&&a.arrayValue.values.some(n=>Bl(this.value.arrayValue,n))}};var K_=class{constructor(e,a=null,n=[],r=[],s=null,i=null,u=null){this.path=e,this.collectionGroup=a,this.orderBy=n,this.filters=r,this.limit=s,this.startAt=i,this.endAt=u,this.Te=null}};function FA(t,e=null,a=[],n=[],r=null,s=null,i=null){return new K_(t,e,a,n,r,s,i)}function tS(t){let e=Se(t);if(e.Te===null){let a=e.path.canonicalString();e.collectionGroup!==null&&(a+="|cg:"+e.collectionGroup),a+="|f:",a+=e.filters.map(n=>U_(n)).join(","),a+="|ob:",a+=e.orderBy.map(n=>function(s){return s.field.canonicalString()+s.dir}(n)).join(","),Hh(e.limit)||(a+="|l:",a+=e.limit),e.startAt&&(a+="|lb:",a+=e.startAt.inclusive?"b:":"a:",a+=e.startAt.position.map(n=>wo(n)).join(",")),e.endAt&&(a+="|ub:",a+=e.endAt.inclusive?"a:":"b:",a+=e.endAt.position.map(n=>wo(n)).join(",")),e.Te=a}return e.Te}function aS(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let a=0;a<t.orderBy.length;a++)if(!t2(t.orderBy[a],e.orderBy[a]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let a=0;a<t.filters.length;a++)if(!zx(t.filters[a],e.filters[a]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!UA(t.startAt,e.startAt)&&UA(t.endAt,e.endAt)}function W_(t){return te.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var mr=class{constructor(e,a=null,n=[],r=[],s=null,i="F",u=null,l=null){this.path=e,this.collectionGroup=a,this.explicitOrderBy=n,this.filters=r,this.limit=s,this.limitType=i,this.startAt=u,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function n2(t,e,a,n,r,s,i,u){return new mr(t,e,a,n,r,s,i,u)}function nS(t){return new mr(t)}function BA(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function r2(t){return te.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function jh(t){return t.collectionGroup!==null}function $s(t){let e=Se(t);if(e.Ie===null){e.Ie=[];let a=new Set;for(let s of e.explicitOrderBy)e.Ie.push(s),a.add(s.field.canonicalString());let n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(i){let u=new qt(ka.comparator);return i.filters.forEach(l=>{l.getFlattenedFilters().forEach(d=>{d.isInequality()&&(u=u.add(d.field))})}),u})(e).forEach(s=>{a.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new ls(s,n))}),a.has(ka.keyField().canonicalString())||e.Ie.push(new ls(ka.keyField(),n))}return e.Ie}function An(t){let e=Se(t);return e.Ee||(e.Ee=s2(e,$s(t))),e.Ee}function s2(t,e){if(t.limitType==="F")return FA(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let s=r.dir==="desc"?"asc":"desc";return new ls(r.field,s)});let a=t.endAt?new pr(t.endAt.position,t.endAt.inclusive):null,n=t.startAt?new pr(t.startAt.position,t.startAt.inclusive):null;return FA(t.path,t.collectionGroup,e,t.filters,t.limit,a,n)}}function Kh(t,e){let a=t.filters.concat([e]);return new mr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),a,t.limit,t.limitType,t.startAt,t.endAt)}function jx(t,e){let a=t.explicitOrderBy.concat([e]);return new mr(t.path,t.collectionGroup,a,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function ql(t,e,a){return new mr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,a,t.startAt,t.endAt)}function Kx(t,e){return new mr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function Wh(t,e){return aS(An(t),An(e))&&t.limitType===e.limitType}function Wx(t){return`${tS(An(t))}|lt:${t.limitType}`}function co(t){return`Query(target=${function(a){let n=a.path.canonicalString();return a.collectionGroup!==null&&(n+=" collectionGroup="+a.collectionGroup),a.filters.length>0&&(n+=`, filters: [${a.filters.map(r=>Hx(r)).join(", ")}]`),Hh(a.limit)||(n+=", limit: "+a.limit),a.orderBy.length>0&&(n+=`, orderBy: [${a.orderBy.map(r=>function(i){return`${i.field.canonicalString()} (${i.dir})`}(r)).join(", ")}]`),a.startAt&&(n+=", startAt: ",n+=a.startAt.inclusive?"b:":"a:",n+=a.startAt.position.map(r=>wo(r)).join(",")),a.endAt&&(n+=", endAt: ",n+=a.endAt.inclusive?"a:":"b:",n+=a.endAt.position.map(r=>wo(r)).join(",")),`Target(${n})`}(An(t))}; limitType=${t.limitType})`}function Qh(t,e){return e.isFoundDocument()&&function(n,r){let s=r.key.path;return n.collectionGroup!==null?r.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(s):te.isDocumentKey(n.path)?n.path.isEqual(s):n.path.isImmediateParentOf(s)}(t,e)&&function(n,r){for(let s of $s(n))if(!s.field.isKeyField()&&r.data.field(s.field)===null)return!1;return!0}(t,e)&&function(n,r){for(let s of n.filters)if(!s.matches(r))return!1;return!0}(t,e)&&function(n,r){return!(n.startAt&&!function(i,u,l){let d=VA(i,u,l);return i.inclusive?d<=0:d<0}(n.startAt,$s(n),r)||n.endAt&&!function(i,u,l){let d=VA(i,u,l);return i.inclusive?d>=0:d>0}(n.endAt,$s(n),r))}(t,e)}function i2(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function Qx(t){return(e,a)=>{let n=!1;for(let r of $s(t)){let s=o2(r,e,a);if(s!==0)return s;n=n||r.field.isKeyField()}return 0}}function o2(t,e,a){let n=t.field.isKeyField()?te.comparator(e.key,a.key):function(s,i,u){let l=i.data.field(s),d=u.data.field(s);return l!==null&&d!==null?To(l,d):se(42886)}(t.field,e,a);switch(t.dir){case"asc":return n;case"desc":return-1*n;default:return se(19790,{direction:t.dir})}}var gr=class{constructor(e,a){this.mapKeyFn=e,this.equalsFn=a,this.inner={},this.innerSize=0}get(e){let a=this.mapKeyFn(e),n=this.inner[a];if(n!==void 0){for(let[r,s]of n)if(this.equalsFn(r,e))return s}}has(e){return this.get(e)!==void 0}set(e,a){let n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return this.inner[n]=[[e,a]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,a]);r.push([e,a]),this.innerSize++}delete(e){let a=this.mapKeyFn(e),n=this.inner[a];if(n===void 0)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return n.length===1?delete this.inner[a]:n.splice(r,1),this.innerSize--,!0;return!1}forEach(e){Mo(this.inner,(a,n)=>{for(let[r,s]of n)e(r,s)})}isEmpty(){return kx(this.inner)}size(){return this.innerSize}};var u2=new yt(te.comparator);function cs(){return u2}var Xx=new yt(te.comparator);function Dl(...t){let e=Xx;for(let a of t)e=e.insert(a.key,a);return e}function l2(t){let e=Xx;return t.forEach((a,n)=>e=e.insert(a,n.overlayedDocument)),e}function Xs(){return Ol()}function Yx(){return Ol()}function Ol(){return new gr(t=>t.toString(),(t,e)=>t.isEqual(e))}var wq=new yt(te.comparator),c2=new qt(te.comparator);function Ie(...t){let e=c2;for(let a of t)e=e.add(a);return e}var d2=new qt(ye);function f2(){return d2}function rS(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Vl(e)?"-0":e}}function $x(t){return{integerValue:""+t}}function h2(t,e){return qN(e)?$x(e):rS(t,e)}var Eo=class{constructor(){this._=void 0}};function p2(t,e,a){return t instanceof zl?function(r,s){let i={fields:{[Px]:{stringValue:Dx},[Mx]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return s&&ac(s)&&(s=Gh(s)),s&&(i.fields[Ox]=s),{mapValue:i}}(a,e):t instanceof Co?Jx(t,e):t instanceof bo?Zx(t,e):function(r,s){let i=g2(r,s),u=qA(i)+qA(r.Ae);return V_(i)&&V_(r.Ae)?$x(u):rS(r.serializer,u)}(t,e)}function m2(t,e,a){return t instanceof Co?Jx(t,e):t instanceof bo?Zx(t,e):a}function g2(t,e){return t instanceof Hl?function(n){return V_(n)||function(s){return!!s&&"doubleValue"in s}(n)}(e)?e:{integerValue:0}:null}var zl=class extends Eo{},Co=class extends Eo{constructor(e){super(),this.elements=e}};function Jx(t,e){let a=e0(e);for(let n of t.elements)a.some(r=>kn(r,n))||a.push(n);return{arrayValue:{values:a}}}var bo=class extends Eo{constructor(e){super(),this.elements=e}};function Zx(t,e){let a=e0(e);for(let n of t.elements)a=a.filter(r=>!kn(r,n));return{arrayValue:{values:a}}}var Hl=class extends Eo{constructor(e,a){super(),this.serializer=e,this.Ae=a}};function qA(t){return et(t.integerValue||t.doubleValue)}function e0(t){return eS(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function y2(t,e){return t.field.isEqual(e.field)&&function(n,r){return n instanceof Co&&r instanceof Co||n instanceof bo&&r instanceof bo?Io(n.elements,r.elements,kn):n instanceof Hl&&r instanceof Hl?kn(n.Ae,r.Ae):n instanceof zl&&r instanceof zl}(t.transform,e.transform)}var mo=class t{constructor(e,a){this.updateTime=e,this.exists=a}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function ch(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var Gl=class{};function t0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new Th(t.key,mo.none()):new jl(t.key,t.data,mo.none());{let a=t.data,n=bn.empty(),r=new qt(ka.comparator);for(let s of e.fields)if(!r.has(s)){let i=a.field(s);i===null&&s.length>1&&(s=s.popLast(),i=a.field(s)),i===null?n.delete(s):n.set(s,i),r=r.add(s)}return new Lo(t.key,n,new Qs(r.toArray()),mo.none())}}function _2(t,e,a){t instanceof jl?function(r,s,i){let u=r.value.clone(),l=HA(r.fieldTransforms,s,i.transformResults);u.setAll(l),s.convertToFoundDocument(i.version,u).setHasCommittedMutations()}(t,e,a):t instanceof Lo?function(r,s,i){if(!ch(r.precondition,s))return void s.convertToUnknownDocument(i.version);let u=HA(r.fieldTransforms,s,i.transformResults),l=s.data;l.setAll(a0(r)),l.setAll(u),s.convertToFoundDocument(i.version,l).setHasCommittedMutations()}(t,e,a):function(r,s,i){s.convertToNoDocument(i.version).setHasCommittedMutations()}(0,e,a)}function Ml(t,e,a,n){return t instanceof jl?function(s,i,u,l){if(!ch(s.precondition,i))return u;let d=s.value.clone(),h=GA(s.fieldTransforms,l,i);return d.setAll(h),i.convertToFoundDocument(i.version,d).setHasLocalMutations(),null}(t,e,a,n):t instanceof Lo?function(s,i,u,l){if(!ch(s.precondition,i))return u;let d=GA(s.fieldTransforms,l,i),h=i.data;return h.setAll(a0(s)),h.setAll(d),i.convertToFoundDocument(i.version,h).setHasLocalMutations(),u===null?null:u.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(m=>m.field))}(t,e,a,n):function(s,i,u){return ch(s.precondition,i)?(i.convertToNoDocument(i.version).setHasLocalMutations(),null):u}(t,e,a)}function zA(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(n,r){return n===void 0&&r===void 0||!(!n||!r)&&Io(n,r,(s,i)=>y2(s,i))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var jl=class extends Gl{constructor(e,a,n,r=[]){super(),this.key=e,this.value=a,this.precondition=n,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},Lo=class extends Gl{constructor(e,a,n,r,s=[]){super(),this.key=e,this.data=a,this.fieldMask=n,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}};function a0(t){let e=new Map;return t.fieldMask.fields.forEach(a=>{if(!a.isEmpty()){let n=t.data.field(a);e.set(a,n)}}),e}function HA(t,e,a){let n=new Map;it(t.length===a.length,32656,{Ve:a.length,de:t.length});for(let r=0;r<a.length;r++){let s=t[r],i=s.transform,u=e.data.field(s.field);n.set(s.field,m2(i,u,a[r]))}return n}function GA(t,e,a){let n=new Map;for(let r of t){let s=r.transform,i=a.data.field(r.field);n.set(r.field,p2(s,i,e))}return n}var Th=class extends Gl{constructor(e,a){super(),this.key=e,this.precondition=a,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var Q_=class{constructor(e,a,n,r){this.batchId=e,this.localWriteTime=a,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(e,a){let n=a.mutationResults;for(let r=0;r<this.mutations.length;r++){let s=this.mutations[r];s.key.isEqual(e.key)&&_2(s,e,n[r])}}applyToLocalView(e,a){for(let n of this.baseMutations)n.key.isEqual(e.key)&&(a=Ml(n,e,a,this.localWriteTime));for(let n of this.mutations)n.key.isEqual(e.key)&&(a=Ml(n,e,a,this.localWriteTime));return a}applyToLocalDocumentSet(e,a){let n=Yx();return this.mutations.forEach(r=>{let s=e.get(r.key),i=s.overlayedDocument,u=this.applyToLocalView(i,s.mutatedFields);u=a.has(r.key)?null:u;let l=t0(i,u);l!==null&&n.set(r.key,l),i.isValidDocument()||i.convertToNoDocument(le.min())}),n}keys(){return this.mutations.reduce((e,a)=>e.add(a.key),Ie())}isEqual(e){return this.batchId===e.batchId&&Io(this.mutations,e.mutations,(a,n)=>zA(a,n))&&Io(this.baseMutations,e.baseMutations,(a,n)=>zA(a,n))}};var X_=class{constructor(e,a){this.largestBatchId=e,this.mutation=a}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var Y_=class{constructor(e,a){this.count=e,this.unchangedNames=a}};var Tt,_e;function n0(t){if(t===void 0)return cr("GRPC error has no .code"),V.UNKNOWN;switch(t){case Tt.OK:return V.OK;case Tt.CANCELLED:return V.CANCELLED;case Tt.UNKNOWN:return V.UNKNOWN;case Tt.DEADLINE_EXCEEDED:return V.DEADLINE_EXCEEDED;case Tt.RESOURCE_EXHAUSTED:return V.RESOURCE_EXHAUSTED;case Tt.INTERNAL:return V.INTERNAL;case Tt.UNAVAILABLE:return V.UNAVAILABLE;case Tt.UNAUTHENTICATED:return V.UNAUTHENTICATED;case Tt.INVALID_ARGUMENT:return V.INVALID_ARGUMENT;case Tt.NOT_FOUND:return V.NOT_FOUND;case Tt.ALREADY_EXISTS:return V.ALREADY_EXISTS;case Tt.PERMISSION_DENIED:return V.PERMISSION_DENIED;case Tt.FAILED_PRECONDITION:return V.FAILED_PRECONDITION;case Tt.ABORTED:return V.ABORTED;case Tt.OUT_OF_RANGE:return V.OUT_OF_RANGE;case Tt.UNIMPLEMENTED:return V.UNIMPLEMENTED;case Tt.DATA_LOSS:return V.DATA_LOSS;default:return se(39323,{code:t})}}(_e=Tt||(Tt={}))[_e.OK=0]="OK",_e[_e.CANCELLED=1]="CANCELLED",_e[_e.UNKNOWN=2]="UNKNOWN",_e[_e.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",_e[_e.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",_e[_e.NOT_FOUND=5]="NOT_FOUND",_e[_e.ALREADY_EXISTS=6]="ALREADY_EXISTS",_e[_e.PERMISSION_DENIED=7]="PERMISSION_DENIED",_e[_e.UNAUTHENTICATED=16]="UNAUTHENTICATED",_e[_e.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",_e[_e.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",_e[_e.ABORTED=10]="ABORTED",_e[_e.OUT_OF_RANGE=11]="OUT_OF_RANGE",_e[_e.UNIMPLEMENTED=12]="UNIMPLEMENTED",_e[_e.INTERNAL=13]="INTERNAL",_e[_e.UNAVAILABLE=14]="UNAVAILABLE",_e[_e.DATA_LOSS=15]="DATA_LOSS";var I2=null;function S2(){return new TextEncoder}var v2=new ir([4294967295,4294967295],0);function jA(t){let e=S2().encode(t),a=new __;return a.update(e),new Uint8Array(a.digest())}function KA(t){let e=new DataView(t.buffer),a=e.getUint32(0,!0),n=e.getUint32(4,!0),r=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new ir([a,n],0),new ir([r,s],0)]}var $_=class t{constructor(e,a,n){if(this.bitmap=e,this.padding=a,this.hashCount=n,a<0||a>=8)throw new Ys(`Invalid padding: ${a}`);if(n<0)throw new Ys(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new Ys(`Invalid hash count: ${n}`);if(e.length===0&&a!==0)throw new Ys(`Invalid padding when bitmap length is 0: ${a}`);this.ge=8*e.length-a,this.pe=ir.fromNumber(this.ge)}ye(e,a,n){let r=e.add(a.multiply(ir.fromNumber(n)));return r.compare(v2)===1&&(r=new ir([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let a=jA(e),[n,r]=KA(a);for(let s=0;s<this.hashCount;s++){let i=this.ye(n,r,s);if(!this.we(i))return!1}return!0}static create(e,a,n){let r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new t(s,r,a);return n.forEach(u=>i.insert(u)),i}insert(e){if(this.ge===0)return;let a=jA(e),[n,r]=KA(a);for(let s=0;s<this.hashCount;s++){let i=this.ye(n,r,s);this.be(i)}}be(e){let a=Math.floor(e/8),n=e%8;this.bitmap[a]|=1<<n}},Ys=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var wh=class t{constructor(e,a,n,r,s){this.snapshotVersion=e,this.targetChanges=a,this.targetMismatches=n,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,a,n){let r=new Map;return r.set(e,Kl.createSynthesizedTargetChangeForCurrentChange(e,a,n)),new t(le.min(),r,new yt(ye),cs(),Ie())}},Kl=class t{constructor(e,a,n,r,s){this.resumeToken=e,this.current=a,this.addedDocuments=n,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,a,n){return new t(n,a,Ie(),Ie(),Ie())}};var go=class{constructor(e,a,n,r){this.Se=e,this.removedTargetIds=a,this.key=n,this.De=r}},Eh=class{constructor(e,a){this.targetId=e,this.Ce=a}},Ch=class{constructor(e,a,n=Wt.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=a,this.resumeToken=n,this.cause=r}},bh=class{constructor(){this.ve=0,this.Fe=WA(),this.Me=Wt.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Ie(),a=Ie(),n=Ie();return this.Fe.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:a=a.add(r);break;case 1:n=n.add(r);break;default:se(38017,{changeType:s})}}),new Kl(this.Me,this.xe,e,a,n)}Ke(){this.Oe=!1,this.Fe=WA()}qe(e,a){this.Oe=!0,this.Fe=this.Fe.insert(e,a)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,it(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},J_=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=cs(),this.He=oh(),this.Je=oh(),this.Ze=new yt(ye)}Xe(e){for(let a of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(a,e.De):this.et(a,e.key,e.De);for(let a of e.removedTargetIds)this.et(a,e.key,e.De)}tt(e){this.forEachTarget(e,a=>{let n=this.nt(a);switch(e.state){case 0:this.rt(a)&&n.Le(e.resumeToken);break;case 1:n.We(),n.Ne||n.Ke(),n.Le(e.resumeToken);break;case 2:n.We(),n.Ne||this.removeTarget(a);break;case 3:this.rt(a)&&(n.Qe(),n.Le(e.resumeToken));break;case 4:this.rt(a)&&(this.it(a),n.Le(e.resumeToken));break;default:se(56790,{state:e.state})}})}forEachTarget(e,a){e.targetIds.length>0?e.targetIds.forEach(a):this.ze.forEach((n,r)=>{this.rt(r)&&a(r)})}st(e){let a=e.targetId,n=e.Ce.count,r=this.ot(a);if(r){let s=r.target;if(W_(s))if(n===0){let i=new te(s.path);this.et(a,i,rn.newNoDocument(i,le.min()))}else it(n===1,20013,{expectedCount:n});else{let i=this._t(a);if(i!==n){let u=this.ut(e),l=u?this.ct(u,e,i):1;if(l!==0){this.it(a);let d=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(a,d)}I2?.lt(function(h,m,p,I,L){let k={localCacheCount:h,existenceFilterCount:m.count,databaseId:p.database,projectId:p.projectId},D=m.unchangedNames;return D&&(k.bloomFilter={applied:L===0,hashCount:D?.hashCount??0,bitmapLength:D?.bits?.bitmap?.length??0,padding:D?.bits?.padding??0,mightContain:w=>I?.mightContain(w)??!1}),k}(i,e.Ce,this.Ge.ht(),u,l))}}}}ut(e){let a=e.Ce.unchangedNames;if(!a||!a.bits)return null;let{bits:{bitmap:n="",padding:r=0},hashCount:s=0}=a,i,u;try{i=hr(n).toUint8Array()}catch(l){if(l instanceof Ih)return dr("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new $_(i,r,s)}catch(l){return dr(l instanceof Ys?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.ge===0?null:u}ct(e,a,n){return a.Ce.count===n-this.Pt(e,a.targetId)?0:2}Pt(e,a){let n=this.Ge.getRemoteKeysForTarget(a),r=0;return n.forEach(s=>{let i=this.Ge.ht(),u=`projects/${i.projectId}/databases/${i.database}/documents/${s.path.canonicalString()}`;e.mightContain(u)||(this.et(a,s,null),r++)}),r}Tt(e){let a=new Map;this.ze.forEach((s,i)=>{let u=this.ot(i);if(u){if(s.current&&W_(u.target)){let l=new te(u.target.path);this.It(l).has(i)||this.Et(i,l)||this.et(i,l,rn.newNoDocument(l,e))}s.Be&&(a.set(i,s.ke()),s.Ke())}});let n=Ie();this.Je.forEach((s,i)=>{let u=!0;i.forEachWhile(l=>{let d=this.ot(l);return!d||d.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(n=n.add(s))}),this.je.forEach((s,i)=>i.setReadTime(e));let r=new wh(e,a,this.Ze,this.je,n);return this.je=cs(),this.He=oh(),this.Je=oh(),this.Ze=new yt(ye),r}Ye(e,a){if(!this.rt(e))return;let n=this.Et(e,a.key)?2:0;this.nt(e).qe(a.key,n),this.je=this.je.insert(a.key,a),this.He=this.He.insert(a.key,this.It(a.key).add(e)),this.Je=this.Je.insert(a.key,this.Rt(a.key).add(e))}et(e,a,n){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,a)?r.qe(a,1):r.Ue(a),this.Je=this.Je.insert(a,this.Rt(a).delete(e)),this.Je=this.Je.insert(a,this.Rt(a).add(e)),n&&(this.je=this.je.insert(a,n))}removeTarget(e){this.ze.delete(e)}_t(e){let a=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+a.addedDocuments.size-a.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let a=this.ze.get(e);return a||(a=new bh,this.ze.set(e,a)),a}Rt(e){let a=this.Je.get(e);return a||(a=new qt(ye),this.Je=this.Je.insert(e,a)),a}It(e){let a=this.He.get(e);return a||(a=new qt(ye),this.He=this.He.insert(e,a)),a}rt(e){let a=this.ot(e)!==null;return a||X("WatchChangeAggregator","Detected inactive target",e),a}ot(e){let a=this.ze.get(e);return a&&a.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new bh),this.Ge.getRemoteKeysForTarget(e).forEach(a=>{this.et(e,a,null)})}Et(e,a){return this.Ge.getRemoteKeysForTarget(e).has(a)}};function oh(){return new yt(te.comparator)}function WA(){return new yt(te.comparator)}var T2={asc:"ASCENDING",desc:"DESCENDING"},w2={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},E2={and:"AND",or:"OR"},Z_=class{constructor(e,a){this.databaseId=e,this.useProto3Json=a}};function eI(t,e){return t.useProto3Json||Hh(e)?e:{value:e}}function tI(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function r0(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function yo(t){return it(!!t,49232),le.fromTimestamp(function(a){let n=fr(a);return new Et(n.seconds,n.nanos)}(t))}function s0(t,e){return aI(t,e).canonicalString()}function aI(t,e){let a=function(r){return new tt(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?a:a.child(e)}function i0(t){let e=tt.fromString(t);return it(d0(e),10190,{key:e.toString()}),e}function b_(t,e){let a=i0(e);if(a.get(1)!==t.databaseId.projectId)throw new j(V.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+a.get(1)+" vs "+t.databaseId.projectId);if(a.get(3)!==t.databaseId.database)throw new j(V.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+a.get(3)+" vs "+t.databaseId.database);return new te(u0(a))}function o0(t,e){return s0(t.databaseId,e)}function C2(t){let e=i0(t);return e.length===4?tt.emptyPath():u0(e)}function QA(t){return new tt(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function u0(t){return it(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function b2(t,e){let a;if("targetChange"in e){e.targetChange;let n=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:se(39313,{state:d})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],s=function(d,h){return d.useProto3Json?(it(h===void 0||typeof h=="string",58123),Wt.fromBase64String(h||"")):(it(h===void 0||h instanceof Buffer||h instanceof Uint8Array,16193),Wt.fromUint8Array(h||new Uint8Array))}(t,e.targetChange.resumeToken),i=e.targetChange.cause,u=i&&function(d){let h=d.code===void 0?V.UNKNOWN:n0(d.code);return new j(h,d.message||"")}(i);a=new Ch(n,r,s,u||null)}else if("documentChange"in e){e.documentChange;let n=e.documentChange;n.document,n.document.name,n.document.updateTime;let r=b_(t,n.document.name),s=yo(n.document.updateTime),i=n.document.createTime?yo(n.document.createTime):le.min(),u=new bn({mapValue:{fields:n.document.fields}}),l=rn.newFoundDocument(r,s,i,u),d=n.targetIds||[],h=n.removedTargetIds||[];a=new go(d,h,l.key,l)}else if("documentDelete"in e){e.documentDelete;let n=e.documentDelete;n.document;let r=b_(t,n.document),s=n.readTime?yo(n.readTime):le.min(),i=rn.newNoDocument(r,s),u=n.removedTargetIds||[];a=new go([],u,i.key,i)}else if("documentRemove"in e){e.documentRemove;let n=e.documentRemove;n.document;let r=b_(t,n.document),s=n.removedTargetIds||[];a=new go([],s,r,null)}else{if(!("filter"in e))return se(11601,{Vt:e});{e.filter;let n=e.filter;n.targetId;let{count:r=0,unchangedNames:s}=n,i=new Y_(r,s),u=n.targetId;a=new Eh(u,i)}}return a}function L2(t,e){return{documents:[o0(t,e.path)]}}function A2(t,e){let a={structuredQuery:{}},n=e.path,r;e.collectionGroup!==null?(r=n,a.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=n.popLast(),a.structuredQuery.from=[{collectionId:n.lastSegment()}]),a.parent=o0(t,r);let s=function(d){if(d.length!==0)return c0(Wa.create(d,"and"))}(e.filters);s&&(a.structuredQuery.where=s);let i=function(d){if(d.length!==0)return d.map(h=>function(p){return{field:fo(p.field),direction:k2(p.dir)}}(h))}(e.orderBy);i&&(a.structuredQuery.orderBy=i);let u=eI(t,e.limit);return u!==null&&(a.structuredQuery.limit=u),e.startAt&&(a.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(a.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{ft:a,parent:r}}function x2(t){let e=C2(t.parent),a=t.structuredQuery,n=a.from?a.from.length:0,r=null;if(n>0){it(n===1,65062);let h=a.from[0];h.allDescendants?r=h.collectionId:e=e.child(h.collectionId)}let s=[];a.where&&(s=function(m){let p=l0(m);return p instanceof Wa&&qx(p)?p.getFilters():[p]}(a.where));let i=[];a.orderBy&&(i=function(m){return m.map(p=>function(L){return new ls(ho(L.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(L.direction))}(p))}(a.orderBy));let u=null;a.limit&&(u=function(m){let p;return p=typeof m=="object"?m.value:m,Hh(p)?null:p}(a.limit));let l=null;a.startAt&&(l=function(m){let p=!!m.before,I=m.values||[];return new pr(I,p)}(a.startAt));let d=null;return a.endAt&&(d=function(m){let p=!m.before,I=m.values||[];return new pr(I,p)}(a.endAt)),n2(e,r,i,s,u,"F",l,d)}function R2(t,e){let a=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return se(28987,{purpose:r})}}(e.purpose);return a==null?null:{"goog-listen-tags":a}}function l0(t){return t.unaryFilter!==void 0?function(a){switch(a.unaryFilter.op){case"IS_NAN":let n=ho(a.unaryFilter.field);return mt.create(n,"==",{doubleValue:NaN});case"IS_NULL":let r=ho(a.unaryFilter.field);return mt.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let s=ho(a.unaryFilter.field);return mt.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let i=ho(a.unaryFilter.field);return mt.create(i,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return se(61313);default:return se(60726)}}(t):t.fieldFilter!==void 0?function(a){return mt.create(ho(a.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return se(58110);default:return se(50506)}}(a.fieldFilter.op),a.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(a){return Wa.create(a.compositeFilter.filters.map(n=>l0(n)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return se(1026)}}(a.compositeFilter.op))}(t):se(30097,{filter:t})}function k2(t){return T2[t]}function D2(t){return w2[t]}function P2(t){return E2[t]}function fo(t){return{fieldPath:t.canonicalString()}}function ho(t){return ka.fromServerFormat(t.fieldPath)}function c0(t){return t instanceof mt?function(a){if(a.op==="=="){if(NA(a.value))return{unaryFilter:{field:fo(a.field),op:"IS_NAN"}};if(MA(a.value))return{unaryFilter:{field:fo(a.field),op:"IS_NULL"}}}else if(a.op==="!="){if(NA(a.value))return{unaryFilter:{field:fo(a.field),op:"IS_NOT_NAN"}};if(MA(a.value))return{unaryFilter:{field:fo(a.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:fo(a.field),op:D2(a.op),value:a.value}}}(t):t instanceof Wa?function(a){let n=a.getFilters().map(r=>c0(r));return n.length===1?n[0]:{compositeFilter:{op:P2(a.op),filters:n}}}(t):se(54877,{filter:t})}function d0(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function f0(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var Wl=class t{constructor(e,a,n,r,s=le.min(),i=le.min(),u=Wt.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=a,this.purpose=n,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,a){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,a,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var nI=class{constructor(e){this.yt=e}};function h0(t){let e=x2({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?ql(e,e.limit,"L"):e}var Lh=class{constructor(){}Dt(e,a){this.Ct(e,a),a.vt()}Ct(e,a){if("nullValue"in e)this.Ft(a,5);else if("booleanValue"in e)this.Ft(a,10),a.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(a,15),a.Mt(et(e.integerValue));else if("doubleValue"in e){let n=et(e.doubleValue);isNaN(n)?this.Ft(a,13):(this.Ft(a,15),Vl(n)?a.Mt(0):a.Mt(n))}else if("timestampValue"in e){let n=e.timestampValue;this.Ft(a,20),typeof n=="string"&&(n=fr(n)),a.xt(`${n.seconds||""}`),a.Mt(n.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,a),this.Nt(a);else if("bytesValue"in e)this.Ft(a,30),a.Bt(hr(e.bytesValue)),this.Nt(a);else if("referenceValue"in e)this.Lt(e.referenceValue,a);else if("geoPointValue"in e){let n=e.geoPointValue;this.Ft(a,45),a.Mt(n.latitude||0),a.Mt(n.longitude||0)}else"mapValue"in e?Fx(e)?this.Ft(a,Number.MAX_SAFE_INTEGER):Ux(e)?this.kt(e.mapValue,a):(this.Kt(e.mapValue,a),this.Nt(a)):"arrayValue"in e?(this.qt(e.arrayValue,a),this.Nt(a)):se(19022,{Ut:e})}Ot(e,a){this.Ft(a,25),this.$t(e,a)}$t(e,a){a.xt(e)}Kt(e,a){let n=e.fields||{};this.Ft(a,55);for(let r of Object.keys(n))this.Ot(r,a),this.Ct(n[r],a)}kt(e,a){let n=e.fields||{};this.Ft(a,53);let r=vo,s=n[r].arrayValue?.values?.length||0;this.Ft(a,15),a.Mt(et(s)),this.Ot(r,a),this.Ct(n[r],a)}qt(e,a){let n=e.values||[];this.Ft(a,50);for(let r of n)this.Ct(r,a)}Lt(e,a){this.Ft(a,37),te.fromName(e).path.forEach(n=>{this.Ft(a,60),this.$t(n,a)})}Ft(e,a){e.Mt(a)}Nt(e){e.Mt(2)}};Lh.Wt=new Lh;var rI=class{constructor(){this.Sn=new sI}addToCollectionParentIndex(e,a){return this.Sn.add(a),F.resolve()}getCollectionParents(e,a){return F.resolve(this.Sn.getEntries(a))}addFieldIndex(e,a){return F.resolve()}deleteFieldIndex(e,a){return F.resolve()}deleteAllFieldIndexes(e){return F.resolve()}createTargetIndexes(e,a){return F.resolve()}getDocumentsMatchingTarget(e,a){return F.resolve(null)}getIndexType(e,a){return F.resolve(0)}getFieldIndexes(e,a){return F.resolve([])}getNextCollectionGroupToUpdate(e){return F.resolve(null)}getMinOffset(e,a){return F.resolve(ei.min())}getMinOffsetFromCollectionGroup(e,a){return F.resolve(ei.min())}updateCollectionGroup(e,a,n){return F.resolve()}updateIndexEntries(e,a){return F.resolve()}},sI=class{constructor(){this.index={}}add(e){let a=e.lastSegment(),n=e.popLast(),r=this.index[a]||new qt(tt.comparator),s=!r.has(n);return this.index[a]=r.add(n),s}has(e){let a=e.lastSegment(),n=e.popLast(),r=this.index[a];return r&&r.has(n)}getEntries(e){return(this.index[e]||new qt(tt.comparator)).toArray()}};var Eq=new Uint8Array(0);var XA={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},p0=41943040,Ka=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,a,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=a,this.maximumSequenceNumbersToCollect=n}};Ka.DEFAULT_COLLECTION_PERCENTILE=10,Ka.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ka.DEFAULT=new Ka(p0,Ka.DEFAULT_COLLECTION_PERCENTILE,Ka.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ka.DISABLED=new Ka(-1,0,0);var Ql=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var YA="LruGarbageCollector",O2=1048576;function $A([t,e],[a,n]){let r=ye(t,a);return r===0?ye(e,n):r}var iI=class{constructor(e){this.Pr=e,this.buffer=new qt($A),this.Tr=0}Ir(){return++this.Tr}Er(e){let a=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(a);else{let n=this.buffer.last();$A(a,n)<0&&(this.buffer=this.buffer.delete(n).add(a))}}get maxValue(){return this.buffer.last()[0]}},oI=class{constructor(e,a,n){this.garbageCollector=e,this.asyncQueue=a,this.localStore=n,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){X(YA,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(a){Oo(a)?X(YA,"Ignoring IndexedDB error during garbage collection: ",a):await zh(a)}await this.Ar(3e5)})}},uI=class{constructor(e,a){this.Vr=e,this.params=a}calculateTargetCount(e,a){return this.Vr.dr(e).next(n=>Math.floor(a/100*n))}nthSequenceNumber(e,a){if(a===0)return F.resolve(So.ce);let n=new iI(a);return this.Vr.forEachTarget(e,r=>n.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>n.Er(r))).next(()=>n.maxValue)}removeTargets(e,a,n){return this.Vr.removeTargets(e,a,n)}removeOrphanedDocuments(e,a){return this.Vr.removeOrphanedDocuments(e,a)}collect(e,a){return this.params.cacheSizeCollectionThreshold===-1?(X("LruGarbageCollector","Garbage collection skipped; disabled"),F.resolve(XA)):this.getCacheSize(e).next(n=>n<this.params.cacheSizeCollectionThreshold?(X("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),XA):this.gr(e,a))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,a){let n,r,s,i,u,l,d,h=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(X("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),r=this.params.maximumSequenceNumbersToCollect):r=m,i=Date.now(),this.nthSequenceNumber(e,r))).next(m=>(n=m,u=Date.now(),this.removeTargets(e,n,a))).next(m=>(s=m,l=Date.now(),this.removeOrphanedDocuments(e,n))).next(m=>(d=Date.now(),lo()<=de.DEBUG&&X("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-h}ms
	Determined least recently used ${r} in `+(u-i)+`ms
	Removed ${s} targets in `+(l-u)+`ms
	Removed ${m} documents in `+(d-l)+`ms
Total Duration: ${d-h}ms`),F.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:m})))}};function M2(t,e){return new uI(t,e)}var lI=class{constructor(){this.changes=new gr(e=>e.toString(),(e,a)=>e.isEqual(a)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,a){this.assertNotApplied(),this.changes.set(e,rn.newInvalidDocument(e).setReadTime(a))}getEntry(e,a){this.assertNotApplied();let n=this.changes.get(a);return n!==void 0?F.resolve(n):this.getFromCache(e,a)}getEntries(e,a){return this.getAllFromCache(e,a)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var cI=class{constructor(e,a){this.overlayedDocument=e,this.mutatedFields=a}};var dI=class{constructor(e,a,n,r){this.remoteDocumentCache=e,this.mutationQueue=a,this.documentOverlayCache=n,this.indexManager=r}getDocument(e,a){let n=null;return this.documentOverlayCache.getOverlay(e,a).next(r=>(n=r,this.remoteDocumentCache.getEntry(e,a))).next(r=>(n!==null&&Ml(n.mutation,r,Qs.empty(),Et.now()),r))}getDocuments(e,a){return this.remoteDocumentCache.getEntries(e,a).next(n=>this.getLocalViewOfDocuments(e,n,Ie()).next(()=>n))}getLocalViewOfDocuments(e,a,n=Ie()){let r=Xs();return this.populateOverlays(e,r,a).next(()=>this.computeViews(e,a,r,n).next(s=>{let i=Dl();return s.forEach((u,l)=>{i=i.insert(u,l.overlayedDocument)}),i}))}getOverlayedDocuments(e,a){let n=Xs();return this.populateOverlays(e,n,a).next(()=>this.computeViews(e,a,n,Ie()))}populateOverlays(e,a,n){let r=[];return n.forEach(s=>{a.has(s)||r.push(s)}),this.documentOverlayCache.getOverlays(e,r).next(s=>{s.forEach((i,u)=>{a.set(i,u)})})}computeViews(e,a,n,r){let s=cs(),i=Ol(),u=function(){return Ol()}();return a.forEach((l,d)=>{let h=n.get(d.key);r.has(d.key)&&(h===void 0||h.mutation instanceof Lo)?s=s.insert(d.key,d):h!==void 0?(i.set(d.key,h.mutation.getFieldMask()),Ml(h.mutation,d,h.mutation.getFieldMask(),Et.now())):i.set(d.key,Qs.empty())}),this.recalculateAndSaveOverlays(e,s).next(l=>(l.forEach((d,h)=>i.set(d,h)),a.forEach((d,h)=>u.set(d,new cI(h,i.get(d)??null))),u))}recalculateAndSaveOverlays(e,a){let n=Ol(),r=new yt((i,u)=>i-u),s=Ie();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,a).next(i=>{for(let u of i)u.keys().forEach(l=>{let d=a.get(l);if(d===null)return;let h=n.get(l)||Qs.empty();h=u.applyToLocalView(d,h),n.set(l,h);let m=(r.get(u.batchId)||Ie()).add(l);r=r.insert(u.batchId,m)})}).next(()=>{let i=[],u=r.getReverseIterator();for(;u.hasNext();){let l=u.getNext(),d=l.key,h=l.value,m=Yx();h.forEach(p=>{if(!s.has(p)){let I=t0(a.get(p),n.get(p));I!==null&&m.set(p,I),s=s.add(p)}}),i.push(this.documentOverlayCache.saveOverlays(e,d,m))}return F.waitFor(i)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,a){return this.remoteDocumentCache.getEntries(e,a).next(n=>this.recalculateAndSaveOverlays(e,n))}getDocumentsMatchingQuery(e,a,n,r){return r2(a)?this.getDocumentsMatchingDocumentQuery(e,a.path):jh(a)?this.getDocumentsMatchingCollectionGroupQuery(e,a,n,r):this.getDocumentsMatchingCollectionQuery(e,a,n,r)}getNextDocuments(e,a,n,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,a,n,r).next(s=>{let i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,a,n.largestBatchId,r-s.size):F.resolve(Xs()),u=Nl,l=s;return i.next(d=>F.forEach(d,(h,m)=>(u<m.largestBatchId&&(u=m.largestBatchId),s.get(h)?F.resolve():this.remoteDocumentCache.getEntry(e,h).next(p=>{l=l.insert(h,p)}))).next(()=>this.populateOverlays(e,d,s)).next(()=>this.computeViews(e,l,d,Ie())).next(h=>({batchId:u,changes:l2(h)})))})}getDocumentsMatchingDocumentQuery(e,a){return this.getDocument(e,new te(a)).next(n=>{let r=Dl();return n.isFoundDocument()&&(r=r.insert(n.key,n)),r})}getDocumentsMatchingCollectionGroupQuery(e,a,n,r){let s=a.collectionGroup,i=Dl();return this.indexManager.getCollectionParents(e,s).next(u=>F.forEach(u,l=>{let d=function(m,p){return new mr(p,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(a,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,d,n,r).next(h=>{h.forEach((m,p)=>{i=i.insert(m,p)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,a,n,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,a.path,n.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,a,n,s,r))).next(i=>{s.forEach((l,d)=>{let h=d.getKey();i.get(h)===null&&(i=i.insert(h,rn.newInvalidDocument(h)))});let u=Dl();return i.forEach((l,d)=>{let h=s.get(l);h!==void 0&&Ml(h.mutation,d,Qs.empty(),Et.now()),Qh(a,d)&&(u=u.insert(l,d))}),u})}};var fI=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,a){return F.resolve(this.Nr.get(a))}saveBundleMetadata(e,a){return this.Nr.set(a.id,function(r){return{id:r.id,version:r.version,createTime:yo(r.createTime)}}(a)),F.resolve()}getNamedQuery(e,a){return F.resolve(this.Br.get(a))}saveNamedQuery(e,a){return this.Br.set(a.name,function(r){return{name:r.name,query:h0(r.bundledQuery),readTime:yo(r.readTime)}}(a)),F.resolve()}};var hI=class{constructor(){this.overlays=new yt(te.comparator),this.Lr=new Map}getOverlay(e,a){return F.resolve(this.overlays.get(a))}getOverlays(e,a){let n=Xs();return F.forEach(a,r=>this.getOverlay(e,r).next(s=>{s!==null&&n.set(r,s)})).next(()=>n)}saveOverlays(e,a,n){return n.forEach((r,s)=>{this.bt(e,a,s)}),F.resolve()}removeOverlaysForBatchId(e,a,n){let r=this.Lr.get(n);return r!==void 0&&(r.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(n)),F.resolve()}getOverlaysForCollection(e,a,n){let r=Xs(),s=a.length+1,i=new te(a.child("")),u=this.overlays.getIteratorFrom(i);for(;u.hasNext();){let l=u.getNext().value,d=l.getKey();if(!a.isPrefixOf(d.path))break;d.path.length===s&&l.largestBatchId>n&&r.set(l.getKey(),l)}return F.resolve(r)}getOverlaysForCollectionGroup(e,a,n,r){let s=new yt((d,h)=>d-h),i=this.overlays.getIterator();for(;i.hasNext();){let d=i.getNext().value;if(d.getKey().getCollectionGroup()===a&&d.largestBatchId>n){let h=s.get(d.largestBatchId);h===null&&(h=Xs(),s=s.insert(d.largestBatchId,h)),h.set(d.getKey(),d)}}let u=Xs(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((d,h)=>u.set(d,h)),!(u.size()>=r)););return F.resolve(u)}bt(e,a,n){let r=this.overlays.get(n.key);if(r!==null){let i=this.Lr.get(r.largestBatchId).delete(n.key);this.Lr.set(r.largestBatchId,i)}this.overlays=this.overlays.insert(n.key,new X_(a,n));let s=this.Lr.get(a);s===void 0&&(s=Ie(),this.Lr.set(a,s)),this.Lr.set(a,s.add(n.key))}};var pI=class{constructor(){this.sessionToken=Wt.EMPTY_BYTE_STRING}getSessionToken(e){return F.resolve(this.sessionToken)}setSessionToken(e,a){return this.sessionToken=a,F.resolve()}};var Xl=class{constructor(){this.kr=new qt(wt.Kr),this.qr=new qt(wt.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,a){let n=new wt(e,a);this.kr=this.kr.add(n),this.qr=this.qr.add(n)}$r(e,a){e.forEach(n=>this.addReference(n,a))}removeReference(e,a){this.Wr(new wt(e,a))}Qr(e,a){e.forEach(n=>this.removeReference(n,a))}Gr(e){let a=new te(new tt([])),n=new wt(a,e),r=new wt(a,e+1),s=[];return this.qr.forEachInRange([n,r],i=>{this.Wr(i),s.push(i.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let a=new te(new tt([])),n=new wt(a,e),r=new wt(a,e+1),s=Ie();return this.qr.forEachInRange([n,r],i=>{s=s.add(i.key)}),s}containsKey(e){let a=new wt(e,0),n=this.kr.firstAfterOrEqual(a);return n!==null&&e.isEqual(n.key)}},wt=class{constructor(e,a){this.key=e,this.Hr=a}static Kr(e,a){return te.comparator(e.key,a.key)||ye(e.Hr,a.Hr)}static Ur(e,a){return ye(e.Hr,a.Hr)||te.comparator(e.key,a.key)}};var mI=class{constructor(e,a){this.indexManager=e,this.referenceDelegate=a,this.mutationQueue=[],this.Yn=1,this.Jr=new qt(wt.Kr)}checkEmpty(e){return F.resolve(this.mutationQueue.length===0)}addMutationBatch(e,a,n,r){let s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new Q_(s,a,n,r);this.mutationQueue.push(i);for(let u of r)this.Jr=this.Jr.add(new wt(u.key,s)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return F.resolve(i)}lookupMutationBatch(e,a){return F.resolve(this.Zr(a))}getNextMutationBatchAfterBatchId(e,a){let n=a+1,r=this.Xr(n),s=r<0?0:r;return F.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return F.resolve(this.mutationQueue.length===0?BN:this.Yn-1)}getAllMutationBatches(e){return F.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,a){let n=new wt(a,0),r=new wt(a,Number.POSITIVE_INFINITY),s=[];return this.Jr.forEachInRange([n,r],i=>{let u=this.Zr(i.Hr);s.push(u)}),F.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,a){let n=new qt(ye);return a.forEach(r=>{let s=new wt(r,0),i=new wt(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([s,i],u=>{n=n.add(u.Hr)})}),F.resolve(this.Yr(n))}getAllMutationBatchesAffectingQuery(e,a){let n=a.path,r=n.length+1,s=n;te.isDocumentKey(s)||(s=s.child(""));let i=new wt(new te(s),0),u=new qt(ye);return this.Jr.forEachWhile(l=>{let d=l.key.path;return!!n.isPrefixOf(d)&&(d.length===r&&(u=u.add(l.Hr)),!0)},i),F.resolve(this.Yr(u))}Yr(e){let a=[];return e.forEach(n=>{let r=this.Zr(n);r!==null&&a.push(r)}),a}removeMutationBatch(e,a){it(this.ei(a.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.Jr;return F.forEach(a.mutations,r=>{let s=new wt(r.key,a.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=n})}nr(e){}containsKey(e,a){let n=new wt(a,0),r=this.Jr.firstAfterOrEqual(n);return F.resolve(a.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,F.resolve()}ei(e,a){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let a=this.Xr(e);return a<0||a>=this.mutationQueue.length?null:this.mutationQueue[a]}};var gI=class{constructor(e){this.ti=e,this.docs=function(){return new yt(te.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,a){let n=a.key,r=this.docs.get(n),s=r?r.size:0,i=this.ti(a);return this.docs=this.docs.insert(n,{document:a.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){let a=this.docs.get(e);a&&(this.docs=this.docs.remove(e),this.size-=a.size)}getEntry(e,a){let n=this.docs.get(a);return F.resolve(n?n.document.mutableCopy():rn.newInvalidDocument(a))}getEntries(e,a){let n=cs();return a.forEach(r=>{let s=this.docs.get(r);n=n.insert(r,s?s.document.mutableCopy():rn.newInvalidDocument(r))}),F.resolve(n)}getDocumentsMatchingQuery(e,a,n,r){let s=cs(),i=a.path,u=new te(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){let{key:d,value:{document:h}}=l.getNext();if(!i.isPrefixOf(d.path))break;d.path.length>i.length+1||VN(NN(h),n)<=0||(r.has(h.key)||Qh(a,h))&&(s=s.insert(h.key,h.mutableCopy()))}return F.resolve(s)}getAllFromCollectionGroup(e,a,n,r){se(9500)}ni(e,a){return F.forEach(this.docs,n=>a(n))}newChangeBuffer(e){return new yI(this)}getSize(e){return F.resolve(this.size)}},yI=class extends lI{constructor(e){super(),this.Mr=e}applyChanges(e){let a=[];return this.changes.forEach((n,r)=>{r.isValidDocument()?a.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(n)}),F.waitFor(a)}getFromCache(e,a){return this.Mr.getEntry(e,a)}getAllFromCache(e,a){return this.Mr.getEntries(e,a)}};var _I=class{constructor(e){this.persistence=e,this.ri=new gr(a=>tS(a),aS),this.lastRemoteSnapshotVersion=le.min(),this.highestTargetId=0,this.ii=0,this.si=new Xl,this.targetCount=0,this.oi=Ql._r()}forEachTarget(e,a){return this.ri.forEach((n,r)=>a(r)),F.resolve()}getLastRemoteSnapshotVersion(e){return F.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return F.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),F.resolve(this.highestTargetId)}setTargetsMetadata(e,a,n){return n&&(this.lastRemoteSnapshotVersion=n),a>this.ii&&(this.ii=a),F.resolve()}lr(e){this.ri.set(e.target,e);let a=e.targetId;a>this.highestTargetId&&(this.oi=new Ql(a),this.highestTargetId=a),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,a){return this.lr(a),this.targetCount+=1,F.resolve()}updateTargetData(e,a){return this.lr(a),F.resolve()}removeTargetData(e,a){return this.ri.delete(a.target),this.si.Gr(a.targetId),this.targetCount-=1,F.resolve()}removeTargets(e,a,n){let r=0,s=[];return this.ri.forEach((i,u)=>{u.sequenceNumber<=a&&n.get(u.targetId)===null&&(this.ri.delete(i),s.push(this.removeMatchingKeysForTargetId(e,u.targetId)),r++)}),F.waitFor(s).next(()=>r)}getTargetCount(e){return F.resolve(this.targetCount)}getTargetData(e,a){let n=this.ri.get(a)||null;return F.resolve(n)}addMatchingKeys(e,a,n){return this.si.$r(a,n),F.resolve()}removeMatchingKeys(e,a,n){this.si.Qr(a,n);let r=this.persistence.referenceDelegate,s=[];return r&&a.forEach(i=>{s.push(r.markPotentiallyOrphaned(e,i))}),F.waitFor(s)}removeMatchingKeysForTargetId(e,a){return this.si.Gr(a),F.resolve()}getMatchingKeysForTargetId(e,a){let n=this.si.jr(a);return F.resolve(n)}containsKey(e,a){return F.resolve(this.si.containsKey(a))}};var Ah=class{constructor(e,a){this._i={},this.overlays={},this.ai=new So(0),this.ui=!1,this.ui=!0,this.ci=new pI,this.referenceDelegate=e(this),this.li=new _I(this),this.indexManager=new rI,this.remoteDocumentCache=function(r){return new gI(r)}(n=>this.referenceDelegate.hi(n)),this.serializer=new nI(a),this.Pi=new fI(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let a=this.overlays[e.toKey()];return a||(a=new hI,this.overlays[e.toKey()]=a),a}getMutationQueue(e,a){let n=this._i[e.toKey()];return n||(n=new mI(a,this.referenceDelegate),this._i[e.toKey()]=n),n}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,a,n){X("MemoryPersistence","Starting transaction:",e);let r=new II(this.ai.next());return this.referenceDelegate.Ti(),n(r).next(s=>this.referenceDelegate.Ii(r).next(()=>s)).toPromise().then(s=>(r.raiseOnCommittedEvent(),s))}Ei(e,a){return F.or(Object.values(this._i).map(n=>()=>n.containsKey(e,a)))}},II=class extends O_{constructor(e){super(),this.currentSequenceNumber=e}},SI=class t{constructor(e){this.persistence=e,this.Ri=new Xl,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw se(60996)}addReference(e,a,n){return this.Ri.addReference(n,a),this.di.delete(n.toString()),F.resolve()}removeReference(e,a,n){return this.Ri.removeReference(n,a),this.di.add(n.toString()),F.resolve()}markPotentiallyOrphaned(e,a){return this.di.add(a.toString()),F.resolve()}removeTarget(e,a){this.Ri.Gr(a.targetId).forEach(r=>this.di.add(r.toString()));let n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,a.targetId).next(r=>{r.forEach(s=>this.di.add(s.toString()))}).next(()=>n.removeTargetData(e,a))}Ti(){this.Ai=new Set}Ii(e){let a=this.persistence.getRemoteDocumentCache().newChangeBuffer();return F.forEach(this.di,n=>{let r=te.fromPath(n);return this.mi(e,r).next(s=>{s||a.removeEntry(r,le.min())})}).next(()=>(this.Ai=null,a.apply(e)))}updateLimboDocument(e,a){return this.mi(e,a).next(n=>{n?this.di.delete(a.toString()):this.di.add(a.toString())})}hi(e){return 0}mi(e,a){return F.or([()=>F.resolve(this.Ri.containsKey(a)),()=>this.persistence.getTargetCache().containsKey(e,a),()=>this.persistence.Ei(e,a)])}},xh=class t{constructor(e,a){this.persistence=e,this.fi=new gr(n=>zN(n.path),(n,r)=>n.isEqual(r)),this.garbageCollector=M2(this,a)}static Vi(e,a){return new t(e,a)}Ti(){}Ii(e){return F.resolve()}forEachTarget(e,a){return this.persistence.getTargetCache().forEachTarget(e,a)}dr(e){let a=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(n=>a.next(r=>n+r))}pr(e){let a=0;return this.mr(e,n=>{a++}).next(()=>a)}mr(e,a){return F.forEach(this.fi,(n,r)=>this.wr(e,n,r).next(s=>s?F.resolve():a(r)))}removeTargets(e,a,n){return this.persistence.getTargetCache().removeTargets(e,a,n)}removeOrphanedDocuments(e,a){let n=0,r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ni(e,i=>this.wr(e,i,a).next(u=>{u||(n++,s.removeEntry(i,le.min()))})).next(()=>s.apply(e)).next(()=>n)}markPotentiallyOrphaned(e,a){return this.fi.set(a,e.currentSequenceNumber),F.resolve()}removeTarget(e,a){let n=a.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,a,n){return this.fi.set(n,e.currentSequenceNumber),F.resolve()}removeReference(e,a,n){return this.fi.set(n,e.currentSequenceNumber),F.resolve()}updateLimboDocument(e,a){return this.fi.set(a,e.currentSequenceNumber),F.resolve()}hi(e){let a=e.key.toString().length;return e.isFoundDocument()&&(a+=lh(e.data.value)),a}wr(e,a,n){return F.or([()=>this.persistence.Ei(e,a),()=>this.persistence.getTargetCache().containsKey(e,a),()=>{let r=this.fi.get(a);return F.resolve(r!==void 0&&r>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var vI=class t{constructor(e,a,n,r){this.targetId=e,this.fromCache=a,this.Ts=n,this.Is=r}static Es(e,a){let n=Ie(),r=Ie();for(let s of a.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new t(e,a.fromCache,n,r)}};var TI=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var wI=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return lL()?8:FN(Vt())>0?6:4}()}initialize(e,a){this.fs=e,this.indexManager=a,this.Rs=!0}getDocumentsMatchingQuery(e,a,n,r){let s={result:null};return this.gs(e,a).next(i=>{s.result=i}).next(()=>{if(!s.result)return this.ps(e,a,r,n).next(i=>{s.result=i})}).next(()=>{if(s.result)return;let i=new TI;return this.ys(e,a,i).next(u=>{if(s.result=u,this.As)return this.ws(e,a,i,u.size)})}).next(()=>s.result)}ws(e,a,n,r){return n.documentReadCount<this.Vs?(lo()<=de.DEBUG&&X("QueryEngine","SDK will not create cache indexes for query:",co(a),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),F.resolve()):(lo()<=de.DEBUG&&X("QueryEngine","Query:",co(a),"scans",n.documentReadCount,"local documents and returns",r,"documents as results."),n.documentReadCount>this.ds*r?(lo()<=de.DEBUG&&X("QueryEngine","The SDK decides to create cache indexes for query:",co(a),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,An(a))):F.resolve())}gs(e,a){if(BA(a))return F.resolve(null);let n=An(a);return this.indexManager.getIndexType(e,n).next(r=>r===0?null:(a.limit!==null&&r===1&&(a=ql(a,null,"F"),n=An(a)),this.indexManager.getDocumentsMatchingTarget(e,n).next(s=>{let i=Ie(...s);return this.fs.getDocuments(e,i).next(u=>this.indexManager.getMinOffset(e,n).next(l=>{let d=this.bs(a,u);return this.Ss(a,d,i,l.readTime)?this.gs(e,ql(a,null,"F")):this.Ds(e,d,a,l)}))})))}ps(e,a,n,r){return BA(a)||r.isEqual(le.min())?F.resolve(null):this.fs.getDocuments(e,n).next(s=>{let i=this.bs(a,s);return this.Ss(a,i,n,r)?F.resolve(null):(lo()<=de.DEBUG&&X("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),co(a)),this.Ds(e,i,a,MN(r,Nl)).next(u=>u))})}bs(e,a){let n=new qt(Qx(e));return a.forEach((r,s)=>{Qh(e,s)&&(n=n.add(s))}),n}Ss(e,a,n,r){if(e.limit===null)return!1;if(n.size!==a.size)return!0;let s=e.limitType==="F"?a.last():a.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ys(e,a,n){return lo()<=de.DEBUG&&X("QueryEngine","Using full collection scan to execute query:",co(a)),this.fs.getDocumentsMatchingQuery(e,a,ei.min(),n)}Ds(e,a,n,r){return this.fs.getDocumentsMatchingQuery(e,n,r).next(s=>(a.forEach(i=>{s=s.insert(i.key,i)}),s))}};var sS="LocalStore",N2=3e8,EI=class{constructor(e,a,n,r){this.persistence=e,this.Cs=a,this.serializer=r,this.vs=new yt(ye),this.Fs=new gr(s=>tS(s),aS),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(n)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new dI(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",a=>e.collect(a,this.vs))}};function V2(t,e,a,n){return new EI(t,e,a,n)}async function m0(t,e){let a=Se(t);return await a.persistence.runTransaction("Handle user change","readonly",n=>{let r;return a.mutationQueue.getAllMutationBatches(n).next(s=>(r=s,a.Os(e),a.mutationQueue.getAllMutationBatches(n))).next(s=>{let i=[],u=[],l=Ie();for(let d of r){i.push(d.batchId);for(let h of d.mutations)l=l.add(h.key)}for(let d of s){u.push(d.batchId);for(let h of d.mutations)l=l.add(h.key)}return a.localDocuments.getDocuments(n,l).next(d=>({Ns:d,removedBatchIds:i,addedBatchIds:u}))})})}function g0(t){let e=Se(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",a=>e.li.getLastRemoteSnapshotVersion(a))}function U2(t,e){let a=Se(t),n=e.snapshotVersion,r=a.vs;return a.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{let i=a.xs.newChangeBuffer({trackRemovals:!0});r=a.vs;let u=[];e.targetChanges.forEach((h,m)=>{let p=r.get(m);if(!p)return;u.push(a.li.removeMatchingKeys(s,h.removedDocuments,m).next(()=>a.li.addMatchingKeys(s,h.addedDocuments,m)));let I=p.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(m)!==null?I=I.withResumeToken(Wt.EMPTY_BYTE_STRING,le.min()).withLastLimboFreeSnapshotVersion(le.min()):h.resumeToken.approximateByteSize()>0&&(I=I.withResumeToken(h.resumeToken,n)),r=r.insert(m,I),function(k,D,w){return k.resumeToken.approximateByteSize()===0||D.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=N2?!0:w.addedDocuments.size+w.modifiedDocuments.size+w.removedDocuments.size>0}(p,I,h)&&u.push(a.li.updateTargetData(s,I))});let l=cs(),d=Ie();if(e.documentUpdates.forEach(h=>{e.resolvedLimboDocuments.has(h)&&u.push(a.persistence.referenceDelegate.updateLimboDocument(s,h))}),u.push(F2(s,i,e.documentUpdates).next(h=>{l=h.Bs,d=h.Ls})),!n.isEqual(le.min())){let h=a.li.getLastRemoteSnapshotVersion(s).next(m=>a.li.setTargetsMetadata(s,s.currentSequenceNumber,n));u.push(h)}return F.waitFor(u).next(()=>i.apply(s)).next(()=>a.localDocuments.getLocalViewOfDocuments(s,l,d)).next(()=>l)}).then(s=>(a.vs=r,s))}function F2(t,e,a){let n=Ie(),r=Ie();return a.forEach(s=>n=n.add(s)),e.getEntries(t,n).next(s=>{let i=cs();return a.forEach((u,l)=>{let d=s.get(u);l.isFoundDocument()!==d.isFoundDocument()&&(r=r.add(u)),l.isNoDocument()&&l.version.isEqual(le.min())?(e.removeEntry(u,l.readTime),i=i.insert(u,l)):!d.isValidDocument()||l.version.compareTo(d.version)>0||l.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(l),i=i.insert(u,l)):X(sS,"Ignoring outdated watch update for ",u,". Current version:",d.version," Watch version:",l.version)}),{Bs:i,Ls:r}})}function B2(t,e){let a=Se(t);return a.persistence.runTransaction("Allocate target","readwrite",n=>{let r;return a.li.getTargetData(n,e).next(s=>s?(r=s,F.resolve(r)):a.li.allocateTargetId(n).next(i=>(r=new Wl(e,i,"TargetPurposeListen",n.currentSequenceNumber),a.li.addTargetData(n,r).next(()=>r))))}).then(n=>{let r=a.vs.get(n.targetId);return(r===null||n.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(a.vs=a.vs.insert(n.targetId,n),a.Fs.set(e,n.targetId)),n})}async function CI(t,e,a){let n=Se(t),r=n.vs.get(e),s=a?"readwrite":"readwrite-primary";try{a||await n.persistence.runTransaction("Release target",s,i=>n.persistence.referenceDelegate.removeTarget(i,r))}catch(i){if(!Oo(i))throw i;X(sS,`Failed to update sequence numbers for target ${e}: ${i}`)}n.vs=n.vs.remove(e),n.Fs.delete(r.target)}function JA(t,e,a){let n=Se(t),r=le.min(),s=Ie();return n.persistence.runTransaction("Execute query","readwrite",i=>function(l,d,h){let m=Se(l),p=m.Fs.get(h);return p!==void 0?F.resolve(m.vs.get(p)):m.li.getTargetData(d,h)}(n,i,An(e)).next(u=>{if(u)return r=u.lastLimboFreeSnapshotVersion,n.li.getMatchingKeysForTargetId(i,u.targetId).next(l=>{s=l})}).next(()=>n.Cs.getDocumentsMatchingQuery(i,e,a?r:le.min(),a?s:Ie())).next(u=>(q2(n,i2(e),u),{documents:u,ks:s})))}function q2(t,e,a){let n=t.Ms.get(e)||le.min();a.forEach((r,s)=>{s.readTime.compareTo(n)>0&&(n=s.readTime)}),t.Ms.set(e,n)}var Rh=class{constructor(){this.activeTargetIds=f2()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var bI=class{constructor(){this.vo=new Rh,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,a,n){}addLocalQueryTarget(e,a=!0){return a&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,a,n){this.Fo[e]=a}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new Rh,Promise.resolve()}handleUserChange(e,a,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var LI=class{Mo(e){}shutdown(){}};var ZA="ConnectivityMonitor",kh=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){X(ZA,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){X(ZA,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var uh=null;function AI(){return uh===null?uh=function(){return 268435456+Math.round(2147483648*Math.random())}():uh++,"0x"+uh.toString(16)}var L_="RestConnection",z2={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},xI=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let a=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=a+"://"+e.host,this.Uo=`projects/${n}/databases/${r}`,this.$o=this.databaseId.database===Sh?`project_id=${n}`:`project_id=${n}&database_id=${r}`}Wo(e,a,n,r,s){let i=AI(),u=this.Qo(e,a.toUriEncodedString());X(L_,`Sending RPC '${e}' ${i}:`,u,n);let l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,r,s);let{host:d}=new URL(u),h=In(d);return this.zo(e,u,l,n,h).then(m=>(X(L_,`Received RPC '${e}' ${i}: `,m),m),m=>{throw dr(L_,`RPC '${e}' ${i} failed with error: `,m,"url: ",u,"request:",n),m})}jo(e,a,n,r,s,i){return this.Wo(e,a,n,r,s)}Go(e,a,n){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Do}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),a&&a.headers.forEach((r,s)=>e[s]=r),n&&n.headers.forEach((r,s)=>e[s]=r)}Qo(e,a){let n=z2[e],r=`${this.qo}/v1/${a}:${n}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var RI=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var Jt="WebChannelConnection",kl=(t,e,a)=>{t.listen(e,n=>{try{a(n)}catch(r){setTimeout(()=>{throw r},0)}})},Dh=class t extends xI{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=T_();kl(e,v_.STAT_EVENT,a=>{a.stat===sh.PROXY?X(Jt,"STAT_EVENT: detected buffering proxy"):a.stat===sh.NOPROXY&&X(Jt,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,a,n,r,s){let i=AI();return new Promise((u,l)=>{let d=new I_;d.setWithCredentials(!0),d.listenOnce(S_.COMPLETE,()=>{try{switch(d.getLastErrorCode()){case Rl.NO_ERROR:let m=d.getResponseJson();X(Jt,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(m)),u(m);break;case Rl.TIMEOUT:X(Jt,`RPC '${e}' ${i} timed out`),l(new j(V.DEADLINE_EXCEEDED,"Request time out"));break;case Rl.HTTP_ERROR:let p=d.getStatus();if(X(Jt,`RPC '${e}' ${i} failed with status:`,p,"response text:",d.getResponseText()),p>0){let I=d.getResponseJson();Array.isArray(I)&&(I=I[0]);let L=I?.error;if(L&&L.status&&L.message){let k=function(w){let v=w.toLowerCase().replace(/_/g,"-");return Object.values(V).indexOf(v)>=0?v:V.UNKNOWN}(L.status);l(new j(k,L.message))}else l(new j(V.UNKNOWN,"Server responded with status "+d.getStatus()))}else l(new j(V.UNAVAILABLE,"Connection failed."));break;default:se(9055,{l_:e,streamId:i,h_:d.getLastErrorCode(),P_:d.getLastError()})}}finally{X(Jt,`RPC '${e}' ${i} completed.`)}});let h=JSON.stringify(r);X(Jt,`RPC '${e}' ${i} sending request:`,r),d.send(a,"POST",h,n,15)})}T_(e,a,n){let r=AI(),s=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(u.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,a,n),u.encodeInitMessageHeaders=!0;let d=s.join("");X(Jt,`Creating RPC '${e}' stream ${r}: ${d}`,u);let h=i.createWebChannel(d,u);this.I_(h);let m=!1,p=!1,I=new RI({Ho:L=>{p?X(Jt,`Not sending because RPC '${e}' stream ${r} is closed:`,L):(m||(X(Jt,`Opening RPC '${e}' stream ${r} transport.`),h.open(),m=!0),X(Jt,`RPC '${e}' stream ${r} sending:`,L),h.send(L))},Jo:()=>h.close()});return kl(h,uo.EventType.OPEN,()=>{p||(X(Jt,`RPC '${e}' stream ${r} transport opened.`),I.i_())}),kl(h,uo.EventType.CLOSE,()=>{p||(p=!0,X(Jt,`RPC '${e}' stream ${r} transport closed`),I.o_(),this.E_(h))}),kl(h,uo.EventType.ERROR,L=>{p||(p=!0,dr(Jt,`RPC '${e}' stream ${r} transport errored. Name:`,L.name,"Message:",L.message),I.o_(new j(V.UNAVAILABLE,"The operation could not be completed")))}),kl(h,uo.EventType.MESSAGE,L=>{if(!p){let k=L.data[0];it(!!k,16349);let D=k,w=D?.error||D[0]?.error;if(w){X(Jt,`RPC '${e}' stream ${r} received error:`,w);let v=w.status,b=function(G){let S=Tt[G];if(S!==void 0)return n0(S)}(v),x=w.message;v==="NOT_FOUND"&&x.includes("database")&&x.includes("does not exist")&&x.includes(this.databaseId.database)&&dr(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),b===void 0&&(b=V.INTERNAL,x="Unknown error status: "+v+" with message "+w.message),p=!0,I.o_(new j(b,x)),h.close()}else X(Jt,`RPC '${e}' stream ${r} received:`,k),I.__(k)}}),t.u_(),setTimeout(()=>{I.s_()},0),I}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(a=>a===e)}Go(e,a,n){super.Go(e,a,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return w_()}};function H2(t){return new Dh(t)}function A_(){return typeof document<"u"?document:null}function rc(t){return new Z_(t,!0)}Dh.c_=!1;var Ph=class{constructor(e,a,n=1e3,r=1.5,s=6e4){this.Ci=e,this.timerId=a,this.R_=n,this.A_=r,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let a=Math.floor(this.d_+this.y_()),n=Math.max(0,Date.now()-this.f_),r=Math.max(0,a-n);r>0&&X("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${a} ms, last attempt: ${n} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var ex="PersistentStream",kI=class{constructor(e,a,n,r,s,i,u,l){this.Ci=e,this.b_=n,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new Ph(e,a)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,a){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():a&&a.code===V.RESOURCE_EXHAUSTED?(cr(a.toString()),cr("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):a&&a.code===V.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(a)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),a=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,r])=>{this.D_===a&&this.G_(n,r)},n=>{e(()=>{let r=new j(V.UNKNOWN,"Fetching auth token failed: "+n.message);return this.z_(r)})})}G_(e,a){let n=this.Q_(this.D_);this.stream=this.j_(e,a),this.stream.Zo(()=>{n(()=>this.listener.Zo())}),this.stream.Yo(()=>{n(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{n(()=>this.z_(r))}),this.stream.onMessage(r=>{n(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return X(ex,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return a=>{this.Ci.enqueueAndForget(()=>this.D_===e?a():(X(ex,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},DI=class extends kI{constructor(e,a,n,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",a,n,r,i),this.serializer=s}j_(e,a){return this.connection.T_("Listen",e,a)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let a=b2(this.serializer,e),n=function(s){if(!("targetChange"in s))return le.min();let i=s.targetChange;return i.targetIds&&i.targetIds.length?le.min():i.readTime?yo(i.readTime):le.min()}(e);return this.listener.J_(a,n)}Z_(e){let a={};a.database=QA(this.serializer),a.addTarget=function(s,i){let u,l=i.target;if(u=W_(l)?{documents:L2(s,l)}:{query:A2(s,l).ft},u.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){u.resumeToken=r0(s,i.resumeToken);let d=eI(s,i.expectedCount);d!==null&&(u.expectedCount=d)}else if(i.snapshotVersion.compareTo(le.min())>0){u.readTime=tI(s,i.snapshotVersion.toTimestamp());let d=eI(s,i.expectedCount);d!==null&&(u.expectedCount=d)}return u}(this.serializer,e);let n=R2(this.serializer,e);n&&(a.labels=n),this.K_(a)}X_(e){let a={};a.database=QA(this.serializer),a.removeTarget=e,this.K_(a)}};var PI=class{},OI=class extends PI{constructor(e,a,n,r){super(),this.authCredentials=e,this.appCheckCredentials=a,this.connection=n,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new j(V.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,a,n,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Wo(e,aI(a,n),r,s,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new j(V.UNKNOWN,s.toString())})}jo(e,a,n,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,u])=>this.connection.jo(e,aI(a,n),r,i,u,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new j(V.UNKNOWN,i.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function G2(t,e,a,n){return new OI(t,e,a,n)}var MI=class{constructor(e,a){this.asyncQueue=e,this.onlineStateHandler=a,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let a=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(cr(a),this.aa=!1):X("OnlineStateTracker",a)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var Ao="RemoteStore",NI=class{constructor(e,a,n,r,s){this.localStore=e,this.datastore=a,this.asyncQueue=n,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(i=>{n.enqueueAndForget(async()=>{ic(this)&&(X(Ao,"Restarting streams for network reachability change."),await async function(l){let d=Se(l);d.Ea.add(4),await sc(d),d.Va.set("Unknown"),d.Ea.delete(4),await Xh(d)}(this))})}),this.Va=new MI(n,r)}};async function Xh(t){if(ic(t))for(let e of t.Ra)await e(!0)}async function sc(t){for(let e of t.Ra)await e(!1)}function y0(t,e){let a=Se(t);a.Ia.has(e.targetId)||(a.Ia.set(e.targetId,e),lS(a)?uS(a):No(a).O_()&&oS(a,e))}function iS(t,e){let a=Se(t),n=No(a);a.Ia.delete(e),n.O_()&&_0(a,e),a.Ia.size===0&&(n.O_()?n.L_():ic(a)&&a.Va.set("Unknown"))}function oS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(le.min())>0){let a=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(a)}No(t).Z_(e)}function _0(t,e){t.da.$e(e),No(t).X_(e)}function uS(t){t.da=new J_({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),No(t).start(),t.Va.ua()}function lS(t){return ic(t)&&!No(t).x_()&&t.Ia.size>0}function ic(t){return Se(t).Ea.size===0}function I0(t){t.da=void 0}async function j2(t){t.Va.set("Online")}async function K2(t){t.Ia.forEach((e,a)=>{oS(t,e)})}async function W2(t,e){I0(t),lS(t)?(t.Va.ha(e),uS(t)):t.Va.set("Unknown")}async function Q2(t,e,a){if(t.Va.set("Online"),e instanceof Ch&&e.state===2&&e.cause)try{await async function(r,s){let i=s.cause;for(let u of s.targetIds)r.Ia.has(u)&&(await r.remoteSyncer.rejectListen(u,i),r.Ia.delete(u),r.da.removeTarget(u))}(t,e)}catch(n){X(Ao,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await tx(t,n)}else if(e instanceof go?t.da.Xe(e):e instanceof Eh?t.da.st(e):t.da.tt(e),!a.isEqual(le.min()))try{let n=await g0(t.localStore);a.compareTo(n)>=0&&await function(s,i){let u=s.da.Tt(i);return u.targetChanges.forEach((l,d)=>{if(l.resumeToken.approximateByteSize()>0){let h=s.Ia.get(d);h&&s.Ia.set(d,h.withResumeToken(l.resumeToken,i))}}),u.targetMismatches.forEach((l,d)=>{let h=s.Ia.get(l);if(!h)return;s.Ia.set(l,h.withResumeToken(Wt.EMPTY_BYTE_STRING,h.snapshotVersion)),_0(s,l);let m=new Wl(h.target,l,d,h.sequenceNumber);oS(s,m)}),s.remoteSyncer.applyRemoteEvent(u)}(t,a)}catch(n){X(Ao,"Failed to raise snapshot:",n),await tx(t,n)}}async function tx(t,e,a){if(!Oo(e))throw e;t.Ea.add(1),await sc(t),t.Va.set("Offline"),a||(a=()=>g0(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{X(Ao,"Retrying IndexedDB access"),await a(),t.Ea.delete(1),await Xh(t)})}async function ax(t,e){let a=Se(t);a.asyncQueue.verifyOperationInProgress(),X(Ao,"RemoteStore received new credentials");let n=ic(a);a.Ea.add(3),await sc(a),n&&a.Va.set("Unknown"),await a.remoteSyncer.handleCredentialChange(e),a.Ea.delete(3),await Xh(a)}async function X2(t,e){let a=Se(t);e?(a.Ea.delete(2),await Xh(a)):e||(a.Ea.add(2),await sc(a),a.Va.set("Unknown"))}function No(t){return t.ma||(t.ma=function(a,n,r){let s=Se(a);return s.sa(),new DI(n,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,r)}(t.datastore,t.asyncQueue,{Zo:j2.bind(null,t),Yo:K2.bind(null,t),t_:W2.bind(null,t),J_:Q2.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),lS(t)?uS(t):t.Va.set("Unknown")):(await t.ma.stop(),I0(t))})),t.ma}var VI=class t{constructor(e,a,n,r,s){this.asyncQueue=e,this.timerId=a,this.targetTimeMs=n,this.op=r,this.removalCallback=s,this.deferred=new ur,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(i=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,a,n,r,s){let i=Date.now()+n,u=new t(e,a,i,r,s);return u.start(n),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new j(V.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function S0(t,e){if(cr("AsyncQueue",`${e}: ${t}`),Oo(t))return new j(V.UNAVAILABLE,`${e}: ${t}`);throw t}var Yl=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(a,n)=>e(a,n)||te.comparator(a.key,n.key):(a,n)=>te.comparator(a.key,n.key),this.keyedMap=Dl(),this.sortedSet=new yt(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let a=this.keyedMap.get(e);return a?this.sortedSet.indexOf(a):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((a,n)=>(e(a),!1))}add(e){let a=this.delete(e.key);return a.copy(a.keyedMap.insert(e.key,e),a.sortedSet.insert(e,null))}delete(e){let a=this.get(e);return a?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(a)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let a=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;a.hasNext();){let r=a.getNext().key,s=n.getNext().key;if(!r.isEqual(s))return!1}return!0}toString(){let e=[];return this.forEach(a=>{e.push(a.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,a){let n=new t;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=a,n}};var Oh=class{constructor(){this.ga=new yt(te.comparator)}track(e){let a=e.doc.key,n=this.ga.get(a);n?e.type!==0&&n.type===3?this.ga=this.ga.insert(a,e):e.type===3&&n.type!==1?this.ga=this.ga.insert(a,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.ga=this.ga.insert(a,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.ga=this.ga.insert(a,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.ga=this.ga.remove(a):e.type===1&&n.type===2?this.ga=this.ga.insert(a,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.ga=this.ga.insert(a,{type:2,doc:e.doc}):se(63341,{Vt:e,pa:n}):this.ga=this.ga.insert(a,e)}ya(){let e=[];return this.ga.inorderTraversal((a,n)=>{e.push(n)}),e}},ti=class t{constructor(e,a,n,r,s,i,u,l,d){this.query=e,this.docs=a,this.oldDocs=n,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=d}static fromInitialDocuments(e,a,n,r,s){let i=[];return a.forEach(u=>{i.push({type:0,doc:u})}),new t(e,a,Yl.emptySet(a),i,n,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Wh(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let a=this.docChanges,n=e.docChanges;if(a.length!==n.length)return!1;for(let r=0;r<a.length;r++)if(a[r].type!==n[r].type||!a[r].doc.isEqual(n[r].doc))return!1;return!0}};var UI=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},FI=class{constructor(){this.queries=nx(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(a,n){let r=Se(a),s=r.queries;r.queries=nx(),s.forEach((i,u)=>{for(let l of u.ba)l.onError(n)})})(this,new j(V.ABORTED,"Firestore shutting down"))}};function nx(){return new gr(t=>Wx(t),Wh)}async function Y2(t,e){let a=Se(t),n=3,r=e.query,s=a.queries.get(r);s?!s.Sa()&&e.Da()&&(n=2):(s=new UI,n=e.Da()?0:1);try{switch(n){case 0:s.wa=await a.onListen(r,!0);break;case 1:s.wa=await a.onListen(r,!1);break;case 2:await a.onFirstRemoteStoreListen(r)}}catch(i){let u=S0(i,`Initialization of query '${co(e.query)}' failed`);return void e.onError(u)}a.queries.set(r,s),s.ba.push(e),e.va(a.onlineState),s.wa&&e.Fa(s.wa)&&cS(a)}async function $2(t,e){let a=Se(t),n=e.query,r=3,s=a.queries.get(n);if(s){let i=s.ba.indexOf(e);i>=0&&(s.ba.splice(i,1),s.ba.length===0?r=e.Da()?0:1:!s.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return a.queries.delete(n),a.onUnlisten(n,!0);case 1:return a.queries.delete(n),a.onUnlisten(n,!1);case 2:return a.onLastRemoteStoreUnlisten(n);default:return}}function J2(t,e){let a=Se(t),n=!1;for(let r of e){let s=r.query,i=a.queries.get(s);if(i){for(let u of i.ba)u.Fa(r)&&(n=!0);i.wa=r}}n&&cS(a)}function Z2(t,e,a){let n=Se(t),r=n.queries.get(e);if(r)for(let s of r.ba)s.onError(a);n.queries.delete(e)}function cS(t){t.Ca.forEach(e=>{e.next()})}var BI,rx;(rx=BI||(BI={})).Ma="default",rx.Cache="cache";var qI=class{constructor(e,a,n){this.query=e,this.xa=a,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=n||{}}Fa(e){if(!this.options.includeMetadataChanges){let n=[];for(let r of e.docChanges)r.type!==3&&n.push(r);e=new ti(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let a=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),a=!0):this.La(e,this.onlineState)&&(this.ka(e),a=!0),this.Na=e,a}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let a=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),a=!0),a}La(e,a){if(!e.fromCache||!this.Da())return!0;let n=a!=="Offline";return(!this.options.Ka||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||a==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let a=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!a)&&this.options.includeMetadataChanges===!0}ka(e){e=ti.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==BI.Cache}};var Mh=class{constructor(e){this.key=e}},Nh=class{constructor(e){this.key=e}},zI=class{constructor(e,a){this.query=e,this.Za=a,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Ie(),this.mutatedKeys=Ie(),this.eu=Qx(e),this.tu=new Yl(this.eu)}get nu(){return this.Za}ru(e,a){let n=a?a.iu:new Oh,r=a?a.tu:this.tu,s=a?a.mutatedKeys:this.mutatedKeys,i=r,u=!1,l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,d=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((h,m)=>{let p=r.get(h),I=Qh(this.query,m)?m:null,L=!!p&&this.mutatedKeys.has(p.key),k=!!I&&(I.hasLocalMutations||this.mutatedKeys.has(I.key)&&I.hasCommittedMutations),D=!1;p&&I?p.data.isEqual(I.data)?L!==k&&(n.track({type:3,doc:I}),D=!0):this.su(p,I)||(n.track({type:2,doc:I}),D=!0,(l&&this.eu(I,l)>0||d&&this.eu(I,d)<0)&&(u=!0)):!p&&I?(n.track({type:0,doc:I}),D=!0):p&&!I&&(n.track({type:1,doc:p}),D=!0,(l||d)&&(u=!0)),D&&(I?(i=i.add(I),s=k?s.add(h):s.delete(h)):(i=i.delete(h),s=s.delete(h)))}),this.query.limit!==null)for(;i.size>this.query.limit;){let h=this.query.limitType==="F"?i.last():i.first();i=i.delete(h.key),s=s.delete(h.key),n.track({type:1,doc:h})}return{tu:i,iu:n,Ss:u,mutatedKeys:s}}su(e,a){return e.hasLocalMutations&&a.hasCommittedMutations&&!a.hasLocalMutations}applyChanges(e,a,n,r){let s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let i=e.iu.ya();i.sort((h,m)=>function(I,L){let k=D=>{switch(D){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return se(20277,{Vt:D})}};return k(I)-k(L)}(h.type,m.type)||this.eu(h.doc,m.doc)),this.ou(n),r=r??!1;let u=a&&!r?this._u():[],l=this.Ya.size===0&&this.current&&!r?1:0,d=l!==this.Xa;return this.Xa=l,i.length!==0||d?{snapshot:new ti(this.query,e.tu,s,i,e.mutatedKeys,l===0,d,!1,!!n&&n.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Oh,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(a=>this.Za=this.Za.add(a)),e.modifiedDocuments.forEach(a=>{}),e.removedDocuments.forEach(a=>this.Za=this.Za.delete(a)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=Ie(),this.tu.forEach(n=>{this.uu(n.key)&&(this.Ya=this.Ya.add(n.key))});let a=[];return e.forEach(n=>{this.Ya.has(n)||a.push(new Nh(n))}),this.Ya.forEach(n=>{e.has(n)||a.push(new Mh(n))}),a}cu(e){this.Za=e.ks,this.Ya=Ie();let a=this.ru(e.documents);return this.applyChanges(a,!0)}lu(){return ti.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},dS="SyncEngine",HI=class{constructor(e,a,n){this.query=e,this.targetId=a,this.view=n}},GI=class{constructor(e){this.key=e,this.hu=!1}},jI=class{constructor(e,a,n,r,s,i){this.localStore=e,this.remoteStore=a,this.eventManager=n,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new gr(u=>Wx(u),Wh),this.Iu=new Map,this.Eu=new Set,this.Ru=new yt(te.comparator),this.Au=new Map,this.Vu=new Xl,this.du={},this.mu=new Map,this.fu=Ql.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function eV(t,e,a=!0){let n=C0(t),r,s=n.Tu.get(e);return s?(n.sharedClientState.addLocalQueryTarget(s.targetId),r=s.view.lu()):r=await v0(n,e,a,!0),r}async function tV(t,e){let a=C0(t);await v0(a,e,!0,!1)}async function v0(t,e,a,n){let r=await B2(t.localStore,An(e)),s=r.targetId,i=t.sharedClientState.addLocalQueryTarget(s,a),u;return n&&(u=await aV(t,e,s,i==="current",r.resumeToken)),t.isPrimaryClient&&a&&y0(t.remoteStore,r),u}async function aV(t,e,a,n,r){t.pu=(m,p,I)=>async function(k,D,w,v){let b=D.view.ru(w);b.Ss&&(b=await JA(k.localStore,D.query,!1).then(({documents:S})=>D.view.ru(S,b)));let x=v&&v.targetChanges.get(D.targetId),B=v&&v.targetMismatches.get(D.targetId)!=null,G=D.view.applyChanges(b,k.isPrimaryClient,x,B);return ix(k,D.targetId,G.au),G.snapshot}(t,m,p,I);let s=await JA(t.localStore,e,!0),i=new zI(e,s.ks),u=i.ru(s.documents),l=Kl.createSynthesizedTargetChangeForCurrentChange(a,n&&t.onlineState!=="Offline",r),d=i.applyChanges(u,t.isPrimaryClient,l);ix(t,a,d.au);let h=new HI(e,a,i);return t.Tu.set(e,h),t.Iu.has(a)?t.Iu.get(a).push(e):t.Iu.set(a,[e]),d.snapshot}async function nV(t,e,a){let n=Se(t),r=n.Tu.get(e),s=n.Iu.get(r.targetId);if(s.length>1)return n.Iu.set(r.targetId,s.filter(i=>!Wh(i,e))),void n.Tu.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(r.targetId),n.sharedClientState.isActiveQueryTarget(r.targetId)||await CI(n.localStore,r.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(r.targetId),a&&iS(n.remoteStore,r.targetId),KI(n,r.targetId)}).catch(zh)):(KI(n,r.targetId),await CI(n.localStore,r.targetId,!0))}async function rV(t,e){let a=Se(t),n=a.Tu.get(e),r=a.Iu.get(n.targetId);a.isPrimaryClient&&r.length===1&&(a.sharedClientState.removeLocalQueryTarget(n.targetId),iS(a.remoteStore,n.targetId))}async function T0(t,e){let a=Se(t);try{let n=await U2(a.localStore,e);e.targetChanges.forEach((r,s)=>{let i=a.Au.get(s);i&&(it(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?i.hu=!0:r.modifiedDocuments.size>0?it(i.hu,14607):r.removedDocuments.size>0&&(it(i.hu,42227),i.hu=!1))}),await E0(a,n,e)}catch(n){await zh(n)}}function sx(t,e,a){let n=Se(t);if(n.isPrimaryClient&&a===0||!n.isPrimaryClient&&a===1){let r=[];n.Tu.forEach((s,i)=>{let u=i.view.va(e);u.snapshot&&r.push(u.snapshot)}),function(i,u){let l=Se(i);l.onlineState=u;let d=!1;l.queries.forEach((h,m)=>{for(let p of m.ba)p.va(u)&&(d=!0)}),d&&cS(l)}(n.eventManager,e),r.length&&n.Pu.J_(r),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function sV(t,e,a){let n=Se(t);n.sharedClientState.updateQueryState(e,"rejected",a);let r=n.Au.get(e),s=r&&r.key;if(s){let i=new yt(te.comparator);i=i.insert(s,rn.newNoDocument(s,le.min()));let u=Ie().add(s),l=new wh(le.min(),new Map,new yt(ye),i,u);await T0(n,l),n.Ru=n.Ru.remove(s),n.Au.delete(e),fS(n)}else await CI(n.localStore,e,!1).then(()=>KI(n,e,a)).catch(zh)}function KI(t,e,a=null){t.sharedClientState.removeLocalQueryTarget(e);for(let n of t.Iu.get(e))t.Tu.delete(n),a&&t.Pu.yu(n,a);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(n=>{t.Vu.containsKey(n)||w0(t,n)})}function w0(t,e){t.Eu.delete(e.path.canonicalString());let a=t.Ru.get(e);a!==null&&(iS(t.remoteStore,a),t.Ru=t.Ru.remove(e),t.Au.delete(a),fS(t))}function ix(t,e,a){for(let n of a)n instanceof Mh?(t.Vu.addReference(n.key,e),iV(t,n)):n instanceof Nh?(X(dS,"Document no longer in limbo: "+n.key),t.Vu.removeReference(n.key,e),t.Vu.containsKey(n.key)||w0(t,n.key)):se(19791,{wu:n})}function iV(t,e){let a=e.key,n=a.path.canonicalString();t.Ru.get(a)||t.Eu.has(n)||(X(dS,"New document in limbo: "+a),t.Eu.add(n),fS(t))}function fS(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let a=new te(tt.fromString(e)),n=t.fu.next();t.Au.set(n,new GI(a)),t.Ru=t.Ru.insert(a,n),y0(t.remoteStore,new Wl(An(nS(a.path)),n,"TargetPurposeLimboResolution",So.ce))}}async function E0(t,e,a){let n=Se(t),r=[],s=[],i=[];n.Tu.isEmpty()||(n.Tu.forEach((u,l)=>{i.push(n.pu(l,e,a).then(d=>{if((d||a)&&n.isPrimaryClient){let h=d?!d.fromCache:a?.targetChanges.get(l.targetId)?.current;n.sharedClientState.updateQueryState(l.targetId,h?"current":"not-current")}if(d){r.push(d);let h=vI.Es(l.targetId,d);s.push(h)}}))}),await Promise.all(i),n.Pu.J_(r),await async function(l,d){let h=Se(l);try{await h.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>F.forEach(d,p=>F.forEach(p.Ts,I=>h.persistence.referenceDelegate.addReference(m,p.targetId,I)).next(()=>F.forEach(p.Is,I=>h.persistence.referenceDelegate.removeReference(m,p.targetId,I)))))}catch(m){if(!Oo(m))throw m;X(sS,"Failed to update sequence numbers: "+m)}for(let m of d){let p=m.targetId;if(!m.fromCache){let I=h.vs.get(p),L=I.snapshotVersion,k=I.withLastLimboFreeSnapshotVersion(L);h.vs=h.vs.insert(p,k)}}}(n.localStore,s))}async function oV(t,e){let a=Se(t);if(!a.currentUser.isEqual(e)){X(dS,"User change. New user:",e.toKey());let n=await m0(a.localStore,e);a.currentUser=e,function(s,i){s.mu.forEach(u=>{u.forEach(l=>{l.reject(new j(V.CANCELLED,i))})}),s.mu.clear()}(a,"'waitForPendingWrites' promise is rejected due to a user change."),a.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await E0(a,n.Ns)}}function uV(t,e){let a=Se(t),n=a.Au.get(e);if(n&&n.hu)return Ie().add(n.key);{let r=Ie(),s=a.Iu.get(e);if(!s)return r;for(let i of s){let u=a.Tu.get(i);r=r.unionWith(u.view.nu)}return r}}function C0(t){let e=Se(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=T0.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=uV.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=sV.bind(null,e),e.Pu.J_=J2.bind(null,e.eventManager),e.Pu.yu=Z2.bind(null,e.eventManager),e}var ai=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=rc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,a){return null}Mu(e,a){return null}vu(e){return V2(this.persistence,new wI,e.initialUser,this.serializer)}Cu(e){return new Ah(SI.Vi,this.serializer)}Du(e){return new bI}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};ai.provider={build:()=>new ai};var Vh=class extends ai{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,a){it(this.persistence.referenceDelegate instanceof xh,46915);let n=this.persistence.referenceDelegate.garbageCollector;return new oI(n,e.asyncQueue,a)}Cu(e){let a=this.cacheSizeBytes!==void 0?Ka.withCacheSize(this.cacheSizeBytes):Ka.DEFAULT;return new Ah(n=>xh.Vi(n,a),this.serializer)}};var xo=class{async initialize(e,a){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(a),this.remoteStore=this.createRemoteStore(a),this.eventManager=this.createEventManager(a),this.syncEngine=this.createSyncEngine(a,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>sx(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=oV.bind(null,this.syncEngine),await X2(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new FI}()}createDatastore(e){let a=rc(e.databaseInfo.databaseId),n=H2(e.databaseInfo);return G2(e.authCredentials,e.appCheckCredentials,n,a)}createRemoteStore(e){return function(n,r,s,i,u){return new NI(n,r,s,i,u)}(this.localStore,this.datastore,e.asyncQueue,a=>sx(this.syncEngine,a,0),function(){return kh.v()?new kh:new LI}())}createSyncEngine(e,a){return function(r,s,i,u,l,d,h){let m=new jI(r,s,i,u,l,d);return h&&(m.gu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,a)}async terminate(){await async function(a){let n=Se(a);X(Ao,"RemoteStore shutting down."),n.Ea.add(5),await sc(n),n.Aa.shutdown(),n.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};xo.provider={build:()=>new xo};var WI=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):cr("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,a){setTimeout(()=>{this.muted||e(a)},0)}};var ds="FirestoreClient",QI=class{constructor(e,a,n,r,s){this.authCredentials=e,this.appCheckCredentials=a,this.asyncQueue=n,this._databaseInfo=r,this.user=Bt.UNAUTHENTICATED,this.clientId=_o.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,async i=>{X(ds,"Received user=",i.uid),await this.authCredentialListener(i),this.user=i}),this.appCheckCredentials.start(n,i=>(X(ds,"Received new app check token=",i),this.appCheckCredentialListener(i,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new ur;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(a){let n=S0(a,"Failed to shutdown persistence");e.reject(n)}}),e.promise}};async function x_(t,e){t.asyncQueue.verifyOperationInProgress(),X(ds,"Initializing OfflineComponentProvider");let a=t.configuration;await e.initialize(a);let n=a.initialUser;t.setCredentialChangeListener(async r=>{n.isEqual(r)||(await m0(e.localStore,r),n=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function ox(t,e){t.asyncQueue.verifyOperationInProgress();let a=await lV(t);X(ds,"Initializing OnlineComponentProvider"),await e.initialize(a,t.configuration),t.setCredentialChangeListener(n=>ax(e.remoteStore,n)),t.setAppCheckTokenChangeListener((n,r)=>ax(e.remoteStore,r)),t._onlineComponents=e}async function lV(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){X(ds,"Using user provided OfflineComponentProvider");try{await x_(t,t._uninitializedComponentsProvider._offline)}catch(e){let a=e;if(!function(r){return r.name==="FirebaseError"?r.code===V.FAILED_PRECONDITION||r.code===V.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(a))throw a;dr("Error using user provided cache. Falling back to memory cache: "+a),await x_(t,new ai)}}else X(ds,"Using default OfflineComponentProvider"),await x_(t,new Vh(void 0));return t._offlineComponents}async function cV(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(X(ds,"Using user provided OnlineComponentProvider"),await ox(t,t._uninitializedComponentsProvider._online)):(X(ds,"Using default OnlineComponentProvider"),await ox(t,new xo))),t._onlineComponents}async function dV(t){let e=await cV(t),a=e.eventManager;return a.onListen=eV.bind(null,e.syncEngine),a.onUnlisten=nV.bind(null,e.syncEngine),a.onFirstRemoteStoreListen=tV.bind(null,e.syncEngine),a.onLastRemoteStoreUnlisten=rV.bind(null,e.syncEngine),a}function b0(t,e,a={}){let n=new ur;return t.asyncQueue.enqueueAndForget(async()=>function(s,i,u,l,d){let h=new WI({next:p=>{h.Nu(),i.enqueueAndForget(()=>$2(s,m)),p.fromCache&&l.source==="server"?d.reject(new j(V.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(p)},error:p=>d.reject(p)}),m=new qI(u,h,{includeMetadataChanges:!0,Ka:!0});return Y2(s,m)}(await dV(t),t.asyncQueue,e,a,n)),n.promise}function L0(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var fV="ComponentProvider",ux=new Map;function hV(t,e,a,n,r){return new M_(t,e,a,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,L0(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,n)}var A0="firestore.googleapis.com",lx=!0,Uh=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new j(V.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=A0,this.ssl=lx}else this.host=e.host,this.ssl=e.ssl??lx;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=p0;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<O2)throw new j(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}px("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=L0(e.experimentalLongPollingOptions??{}),function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new j(V.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new j(V.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new j(V.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(n,r){return n.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},$l=class{constructor(e,a,n,r){this._authCredentials=e,this._appCheckCredentials=a,this._databaseId=n,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Uh({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new j(V.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new j(V.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Uh(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new fh;switch(n.type){case"firstParty":return new D_(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new j(V.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(a){let n=ux.get(a);n&&(X(fV,"Removing Datastore"),ux.delete(a),n.terminate())}(this),Promise.resolve()}};function x0(t,e,a,n={}){t=tc(t,$l);let r=In(e),s=t._getSettings(),i={...s,emulatorOptions:t._getEmulatorOptions()},u=`${e}:${a}`;r&&(Zi(`https://${u}`),eo("Firestore",!0)),s.host!==A0&&s.host!==u&&dr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...s,host:u,ssl:r,emulatorOptions:n};if(!an(l,i)&&(t._setSettings(l),n.mockUserToken)){let d,h;if(typeof n.mockUserToken=="string")d=n.mockUserToken,h=Bt.MOCK_USER;else{d=vf(n.mockUserToken,t._app?.options.projectId);let m=n.mockUserToken.sub||n.mockUserToken.user_id;if(!m)throw new j(V.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");h=new Bt(m)}t._authCredentials=new R_(new dh(d,h))}}var sn=class t{constructor(e,a,n){this.converter=a,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},ma=class t{constructor(e,a,n){this.converter=a,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Js(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,a,n){if(Po(a,t._jsonSchema))return new t(e,n||null,new te(tt.fromString(a.referencePath)))}};ma._jsonSchemaVersion="firestore/documentReference/1.0",ma._jsonSchema={type:gt("string",ma._jsonSchemaVersion),referencePath:gt("string")};var Js=class t extends sn{constructor(e,a,n){super(e,a,nS(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new ma(this.firestore,null,new te(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function oc(t,e,...a){if(t=Ut(t),ON("collection","path",e),t instanceof $l){let n=tt.fromString(e,...a);return AA(n),new Js(t,null,n)}{if(!(t instanceof ma||t instanceof Js))throw new j(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let n=t._path.child(tt.fromString(e,...a));return AA(n),new Js(t.firestore,null,n)}}var cx="AsyncQueue",Fh=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Ph(this,"async_queue_retry"),this._c=()=>{let n=A_();n&&X(cx,"Visibility state changed to "+n.visibilityState),this.M_.w_()},this.ac=e;let a=A_();a&&typeof a.addEventListener=="function"&&a.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let a=A_();a&&typeof a.removeEventListener=="function"&&a.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let a=new ur;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(a.resolve,a.reject),a.promise)).then(()=>a.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!Oo(e))throw e;X(cx,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let a=this.ac.then(()=>(this.rc=!0,e().catch(n=>{throw this.nc=n,this.rc=!1,cr("INTERNAL UNHANDLED ERROR: ",dx(n)),n}).then(n=>(this.rc=!1,n))));return this.ac=a,a}enqueueAfterDelay(e,a,n){this.uc(),this.oc.indexOf(e)>-1&&(a=0);let r=VI.createAndSchedule(this,e,a,n,s=>this.hc(s));return this.tc.push(r),r}uc(){this.nc&&se(47125,{Pc:dx(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let a of this.tc)if(a.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((a,n)=>a.targetTimeMs-n.targetTimeMs);for(let a of this.tc)if(a.skipDelay(),e!=="all"&&a.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let a=this.tc.indexOf(e);this.tc.splice(a,1)}};function dx(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var Ro=class extends $l{constructor(e,a,n,r){super(e,a,n,r),this.type="firestore",this._queue=new Fh,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new Fh(e),this._firestoreClient=void 0,await e}}};function hS(t,e){let a=typeof t=="object"?t:ro(),n=typeof t=="string"?t:e||Sh,r=Bs(a,"firestore").getImmediate({identifier:n});if(!r._initialized){let s=Sf("firestore");s&&x0(r,...s)}return r}function pS(t){if(t._terminated)throw new j(V.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||pV(t),t._firestoreClient}function pV(t){let e=t._freezeSettings(),a=hV(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new QI(t._authCredentials,t._appCheckCredentials,t._queue,a,t._componentsProvider&&function(r){let s=r?._online.build();return{_offline:r?._offline.build(s),_online:s}}(t._componentsProvider))}var xn=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(Wt.fromBase64String(e))}catch(a){throw new j(V.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+a)}}static fromUint8Array(e){return new t(Wt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Po(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};xn._jsonSchemaVersion="firestore/bytes/1.0",xn._jsonSchema={type:gt("string",xn._jsonSchemaVersion),bytes:gt("string")};var ko=class{constructor(...e){for(let a=0;a<e.length;++a)if(e[a].length===0)throw new j(V.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ka(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var Jl=class{constructor(e){this._methodName=e}};var lr=class t{constructor(e,a){if(!isFinite(e)||e<-90||e>90)throw new j(V.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(a)||a<-180||a>180)throw new j(V.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+a);this._lat=e,this._long=a}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return ye(this._lat,e._lat)||ye(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(Po(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};lr._jsonSchemaVersion="firestore/geoPoint/1.0",lr._jsonSchema={type:gt("string",lr._jsonSchemaVersion),latitude:gt("number"),longitude:gt("number")};var Rn=class t{constructor(e){this._values=(e||[]).map(a=>a)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(n,r){if(n.length!==r.length)return!1;for(let s=0;s<n.length;++s)if(n[s]!==r[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Po(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(a=>typeof a=="number"))return new t(e.vectorValues);throw new j(V.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};Rn._jsonSchemaVersion="firestore/vectorValue/1.0",Rn._jsonSchema={type:gt("string",Rn._jsonSchemaVersion),vectorValues:gt("object")};var mV=/^__.*__$/;function R0(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw se(40011,{dataSource:t})}}var XI=class t{constructor(e,a,n,r,s,i){this.settings=e,this.databaseId=a,this.serializer=n,this.ignoreUndefinedProperties=r,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let a=this.path?.child(e),n=this.contextWith({path:a,arrayElement:!1});return n.validatePathSegment(e),n}childContextForFieldPath(e){let a=this.path?.child(e),n=this.contextWith({path:a,arrayElement:!1});return n.validatePath(),n}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Bh(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(a=>e.isPrefixOf(a))!==void 0||this.fieldTransforms.find(a=>e.isPrefixOf(a.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(R0(this.dataSource)&&mV.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},YI=class{constructor(e,a,n){this.databaseId=e,this.ignoreUndefinedProperties=a,this.serializer=n||rc(e)}createContext(e,a,n,r=!1){return new XI({dataSource:e,methodName:a,targetDoc:n,path:ka.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function mS(t){let e=t._freezeSettings(),a=rc(t._databaseId);return new YI(t._databaseId,!!e.ignoreUndefinedProperties,a)}function gS(t,e,a,n=!1){return yS(a,t.createContext(n?4:3,e))}function yS(t,e){if(k0(t=Ut(t)))return yV("Unsupported field value:",e,t),gV(t,e);if(t instanceof Jl)return function(n,r){if(!R0(r.dataSource))throw r.createError(`${n._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${n._methodName}() is not currently supported inside arrays`);let s=n._toFieldTransform(r);s&&r.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(n,r){let s=[],i=0;for(let u of n){let l=yS(u,r.childContextForArray(i));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),i++}return{arrayValue:{values:s}}}(t,e)}return function(n,r){if((n=Ut(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return h2(r.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){let s=Et.fromDate(n);return{timestampValue:tI(r.serializer,s)}}if(n instanceof Et){let s=new Et(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:tI(r.serializer,s)}}if(n instanceof lr)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof xn)return{bytesValue:r0(r.serializer,n._byteString)};if(n instanceof ma){let s=r.databaseId,i=n.firestore._databaseId;if(!i.isEqual(s))throw r.createError(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:s0(n.firestore._databaseId||r.databaseId,n._key.path)}}if(n instanceof Rn)return function(i,u){let l=i instanceof Rn?i.toArray():i;return{mapValue:{fields:{[JI]:{stringValue:ZI},[vo]:{arrayValue:{values:l.map(h=>{if(typeof h!="number")throw u.createError("VectorValues must only contain numeric values.");return rS(u.serializer,h)})}}}}}}(n,r);if(f0(n))return n._toProto(r.serializer);throw r.createError(`Unsupported field value: ${ec(n)}`)}(t,e)}function gV(t,e){let a={};return kx(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Mo(t,(n,r)=>{let s=yS(r,e.childContextForField(n));s!=null&&(a[n]=s)}),{mapValue:{fields:a}}}function k0(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof Et||t instanceof lr||t instanceof xn||t instanceof ma||t instanceof Jl||t instanceof Rn||f0(t))}function yV(t,e,a){if(!k0(a)||!mx(a)){let n=ec(a);throw n==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+n)}}function uc(t,e,a){if((e=Ut(e))instanceof ko)return e._internalPath;if(typeof e=="string")return D0(t,e);throw Bh("Field path arguments must be of type string or ",t,!1,void 0,a)}var _V=new RegExp("[~\\*/\\[\\]]");function D0(t,e,a){if(e.search(_V)>=0)throw Bh(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,a);try{return new ko(...e.split("."))._internalPath}catch{throw Bh(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,a)}}function Bh(t,e,a,n,r){let s=n&&!n.isEmpty(),i=r!==void 0,u=`Function ${e}() called with invalid data`;a&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(s||i)&&(l+=" (found",s&&(l+=` in field ${n}`),i&&(l+=` in document ${r}`),l+=")"),new j(V.INVALID_ARGUMENT,u+t+l)}var Zl=class{convertValue(e,a="none"){switch(us(e)){case 0:return null;case 1:return e.booleanValue;case 2:return et(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,a);case 5:return e.stringValue;case 6:return this.convertBytes(hr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,a);case 11:return this.convertObject(e.mapValue,a);case 10:return this.convertVectorValue(e.mapValue);default:throw se(62114,{value:e})}}convertObject(e,a){return this.convertObjectMap(e.fields,a)}convertObjectMap(e,a="none"){let n={};return Mo(e,(r,s)=>{n[r]=this.convertValue(s,a)}),n}convertVectorValue(e){let a=e.fields?.[vo].arrayValue?.values?.map(n=>et(n.doubleValue));return new Rn(a)}convertGeoPoint(e){return new lr(et(e.latitude),et(e.longitude))}convertArray(e,a){return(e.values||[]).map(n=>this.convertValue(n,a))}convertServerTimestamp(e,a){switch(a){case"previous":let n=Gh(e);return n==null?null:this.convertValue(n,a);case"estimate":return this.convertTimestamp(Ul(e));default:return null}}convertTimestamp(e){let a=fr(e);return new Et(a.seconds,a.nanos)}convertDocumentKey(e,a){let n=tt.fromString(e);it(d0(n),9688,{name:e});let r=new Fl(n.get(1),n.get(3)),s=new te(n.popFirst(5));return r.isEqual(a)||cr(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${a.projectId}/${a.database}) instead.`),s}};var qh=class extends Zl{constructor(e){super(),this.firestore=e}convertBytes(e){return new xn(e)}convertReference(e){let a=this.convertDocumentKey(e,this.firestore._databaseId);return new ma(this.firestore,null,a)}};var P0="@firebase/firestore",O0="4.12.0";var lc=class{constructor(e,a,n,r,s){this._firestore=e,this._userDataWriter=a,this._key=n,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new ma(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new _S(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let a=this._document.data.field(uc("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a)}}},_S=class extends lc{data(){return super.data()}};function TV(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new j(V.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var cc=class{},qo=class extends cc{};function dc(t,e,...a){let n=[];e instanceof cc&&n.push(e),n=n.concat(a),function(s){let i=s.filter(l=>l instanceof IS).length,u=s.filter(l=>l instanceof Yh).length;if(i>1||i>0&&u>0)throw new j(V.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(let r of n)t=r._apply(t);return t}var Yh=class t extends qo{constructor(e,a,n){super(),this._field=e,this._op=a,this._value=n,this.type="where"}static _create(e,a,n){return new t(e,a,n)}_apply(e){let a=this._parse(e);return F0(e._query,a),new sn(e.firestore,e.converter,Kh(e._query,a))}_parse(e){let a=mS(e.firestore);return function(s,i,u,l,d,h,m){let p;if(d.isKeyField()){if(h==="array-contains"||h==="array-contains-any")throw new j(V.INVALID_ARGUMENT,`Invalid Query. You can't perform '${h}' queries on documentId().`);if(h==="in"||h==="not-in"){N0(m,h);let L=[];for(let k of m)L.push(M0(l,s,k));p={arrayValue:{values:L}}}else p=M0(l,s,m)}else h!=="in"&&h!=="not-in"&&h!=="array-contains-any"||N0(m,h),p=gS(u,i,m,h==="in"||h==="not-in");return mt.create(d,h,p)}(e._query,"where",a,e.firestore._databaseId,this._field,this._op,this._value)}};function fc(t,e,a){let n=e,r=uc("where",t);return Yh._create(r,n,a)}var IS=class t extends cc{constructor(e,a){super(),this.type=e,this._queryConstraints=a}static _create(e,a){return new t(e,a)}_parse(e){let a=this._queryConstraints.map(n=>n._parse(e)).filter(n=>n.getFilters().length>0);return a.length===1?a[0]:Wa.create(a,this._getOperator())}_apply(e){let a=this._parse(e);return a.getFilters().length===0?e:(function(r,s){let i=r,u=s.getFlattenedFilters();for(let l of u)F0(i,l),i=Kh(i,l)}(e._query,a),new sn(e.firestore,e.converter,Kh(e._query,a)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var SS=class t extends qo{constructor(e,a){super(),this._field=e,this._direction=a,this.type="orderBy"}static _create(e,a){return new t(e,a)}_apply(e){let a=function(r,s,i){if(r.startAt!==null)throw new j(V.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new j(V.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ls(s,i)}(e._query,this._field,this._direction);return new sn(e.firestore,e.converter,jx(e._query,a))}};function hc(t,e="asc"){let a=e,n=uc("orderBy",t);return SS._create(n,a)}var vS=class t extends qo{constructor(e,a,n){super(),this.type=e,this._limit=a,this._limitType=n}static _create(e,a,n){return new t(e,a,n)}_apply(e){return new sn(e.firestore,e.converter,ql(e._query,this._limit,this._limitType))}};function pc(t){return gx("limit",t),vS._create("limit",t,"F")}var TS=class t extends qo{constructor(e,a,n){super(),this.type=e,this._docOrFields=a,this._inclusive=n}static _create(e,a,n){return new t(e,a,n)}_apply(e){let a=wV(e,this.type,this._docOrFields,this._inclusive);return new sn(e.firestore,e.converter,Kx(e._query,a))}};function U0(...t){return TS._create("startAfter",t,!1)}function wV(t,e,a,n){if(a[0]=Ut(a[0]),a[0]instanceof lc)return function(s,i,u,l,d){if(!l)throw new j(V.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);let h=[];for(let m of $s(s))if(m.field.isKeyField())h.push(nc(i,l.key));else{let p=l.data.field(m.field);if(ac(p))throw new j(V.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+m.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(p===null){let I=m.field.canonicalString();throw new j(V.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${I}' (used as the orderBy) does not exist.`)}h.push(p)}return new pr(h,d)}(t._query,t.firestore._databaseId,e,a[0]._document,n);{let r=mS(t.firestore);return function(i,u,l,d,h,m){let p=i.explicitOrderBy;if(h.length>p.length)throw new j(V.INVALID_ARGUMENT,`Too many arguments provided to ${d}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let I=[];for(let L=0;L<h.length;L++){let k=h[L];if(p[L].field.isKeyField()){if(typeof k!="string")throw new j(V.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${d}(), but got a ${typeof k}`);if(!jh(i)&&k.indexOf("/")!==-1)throw new j(V.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${d}() must be a plain document ID, but '${k}' contains a slash.`);let D=i.path.child(tt.fromString(k));if(!te.isDocumentKey(D))throw new j(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${d}() must result in a valid document path, but '${D}' is not because it contains an odd number of segments.`);let w=new te(D);I.push(nc(u,w))}else{let D=gS(l,d,k);I.push(D)}}return new pr(I,m)}(t._query,t.firestore._databaseId,r,e,a,n)}}function M0(t,e,a){if(typeof(a=Ut(a))=="string"){if(a==="")throw new j(V.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!jh(e)&&a.indexOf("/")!==-1)throw new j(V.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${a}' contains a '/' character.`);let n=e.path.child(tt.fromString(a));if(!te.isDocumentKey(n))throw new j(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return nc(t,new te(n))}if(a instanceof ma)return nc(t,a._key);throw new j(V.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ec(a)}.`)}function N0(t,e){if(!Array.isArray(t)||t.length===0)throw new j(V.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function F0(t,e){let a=function(r,s){for(let i of r)for(let u of i.getFlattenedFilters())if(s.indexOf(u.op)>=0)return u.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(a!==null)throw a===e.op?new j(V.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new j(V.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${a.toString()}' filters.`)}var Vo=class{constructor(e,a){this.hasPendingWrites=e,this.fromCache=a}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},Uo=class t extends lc{constructor(e,a,n,r,s,i){super(e,a,n,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let a=new Fo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(a,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,a={}){if(this._document){let n=this._document.data.field(uc("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,a.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new j(V.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,a={};return a.type=t._jsonSchemaVersion,a.bundle="",a.bundleSource="DocumentSnapshot",a.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?a:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),a.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),a)}};Uo._jsonSchemaVersion="firestore/documentSnapshot/1.0",Uo._jsonSchema={type:gt("string",Uo._jsonSchemaVersion),bundleSource:gt("string","DocumentSnapshot"),bundleName:gt("string"),bundle:gt("string")};var Fo=class extends Uo{data(e={}){return super.data(e)}},Bo=class t{constructor(e,a,n,r){this._firestore=e,this._userDataWriter=a,this._snapshot=r,this.metadata=new Vo(r.hasPendingWrites,r.fromCache),this.query=n}get docs(){let e=[];return this.forEach(a=>e.push(a)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,a){this._snapshot.docs.forEach(n=>{e.call(a,new Fo(this._firestore,this._userDataWriter,n.key,n,new Vo(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let a=!!e.includeMetadataChanges;if(a&&this._snapshot.excludesMetadataChanges)throw new j(V.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===a||(this._cachedChanges=function(r,s){if(r._snapshot.oldDocs.isEmpty()){let i=0;return r._snapshot.docChanges.map(u=>{let l=new Fo(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Vo(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:i++}})}{let i=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(u=>s||u.type!==3).map(u=>{let l=new Fo(r._firestore,r._userDataWriter,u.doc.key,u.doc,new Vo(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter),d=-1,h=-1;return u.type!==0&&(d=i.indexOf(u.doc.key),i=i.delete(u.doc.key)),u.type!==1&&(i=i.add(u.doc),h=i.indexOf(u.doc.key)),{type:EV(u.type),doc:l,oldIndex:d,newIndex:h}})}}(this,a),this._cachedChangesIncludeMetadataChanges=a),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new j(V.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=_o.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let a=[],n=[],r=[];return this.docs.forEach(s=>{s._document!==null&&(a.push(s._document),n.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),r.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function EV(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return se(61501,{type:t})}}Bo._jsonSchemaVersion="firestore/querySnapshot/1.0",Bo._jsonSchema={type:gt("string",Bo._jsonSchemaVersion),bundleSource:gt("string","QuerySnapshot"),bundleName:gt("string"),bundle:gt("string")};function Jh(t){t=tc(t,sn);let e=tc(t.firestore,Ro),a=pS(e),n=new qh(e);return TV(t._query),b0(a,t._query).then(r=>new Bo(e,n,t,r))}(function(e,a=!0){fx(Tn),vn(new fa("firestore",(n,{instanceIdentifier:r,options:s})=>{let i=n.getProvider("app").getImmediate(),u=new Ro(new hh(n.getProvider("auth-internal")),new mh(i,n.getProvider("app-check-internal")),Nx(i,r),i);return s={useFetchStreams:a,...s},u._setSettings(s),u},"PUBLIC").setMultipleInstances(!0)),ha(P0,O0,e),ha(P0,O0,"esm2020")})();var j0="firebasestorage.googleapis.com",CV="storageBucket",bV=2*60*1e3,LV=10*60*1e3;var Dn=class t extends na{constructor(e,a,n=0){super(ES(e),`Firebase Storage: ${a} (${ES(e)})`),this.status_=n,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return ES(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},Pn;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Pn||(Pn={}));function ES(t){return"storage/"+t}function AV(){let t="An unknown error occurred, please check the error payload for server response.";return new Dn(Pn.UNKNOWN,t)}function xV(){return new Dn(Pn.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function RV(){return new Dn(Pn.CANCELED,"User canceled the upload/download.")}function kV(t){return new Dn(Pn.INVALID_URL,"Invalid URL '"+t+"'.")}function DV(t){return new Dn(Pn.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function B0(t){return new Dn(Pn.INVALID_ARGUMENT,t)}function K0(){return new Dn(Pn.APP_DELETED,"The Firebase app was deleted.")}function PV(t){return new Dn(Pn.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}var yr=class t{constructor(e,a){this.bucket=e,this.path_=a}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,a){let n;try{n=t.makeFromUrl(e,a)}catch{return new t(e,"")}if(n.path==="")return n;throw DV(e)}static makeFromUrl(e,a){let n=null,r="([A-Za-z0-9.\\-_]+)";function s(x){x.path.charAt(x.path.length-1)==="/"&&(x.path_=x.path_.slice(0,-1))}let i="(/(.*))?$",u=new RegExp("^gs://"+r+i,"i"),l={bucket:1,path:3};function d(x){x.path_=decodeURIComponent(x.path)}let h="v[A-Za-z0-9_]+",m=a.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",I=new RegExp(`^https?://${m}/${h}/b/${r}/o${p}`,"i"),L={bucket:1,path:3},k=a===j0?"(?:storage.googleapis.com|storage.cloud.google.com)":a,D="([^?#]*)",w=new RegExp(`^https?://${k}/${r}/${D}`,"i"),b=[{regex:u,indices:l,postModify:s},{regex:I,indices:L,postModify:d},{regex:w,indices:{bucket:1,path:2},postModify:d}];for(let x=0;x<b.length;x++){let B=b[x],G=B.regex.exec(e);if(G){let S=G[B.indices.bucket],y=G[B.indices.path];y||(y=""),n=new t(S,y),B.postModify(n);break}}if(n==null)throw kV(e);return n}},CS=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function OV(t,e,a){let n=1,r=null,s=null,i=!1,u=0;function l(){return u===2}let d=!1;function h(...D){d||(d=!0,e.apply(null,D))}function m(D){r=setTimeout(()=>{r=null,t(I,l())},D)}function p(){s&&clearTimeout(s)}function I(D,...w){if(d){p();return}if(D){p(),h.call(null,D,...w);return}if(l()||i){p(),h.call(null,D,...w);return}n<64&&(n*=2);let b;u===1?(u=2,b=0):b=(n+Math.random())*1e3,m(b)}let L=!1;function k(D){L||(L=!0,p(),!d&&(r!==null?(D||(u=2),clearTimeout(r),m(0)):D||(u=1)))}return m(0),s=setTimeout(()=>{i=!0,k(!0)},a),k}function MV(t){t(!1)}function NV(t){return t!==void 0}function q0(t,e,a,n){if(n<e)throw B0(`Invalid value for '${t}'. Expected ${e} or greater.`);if(n>a)throw B0(`Invalid value for '${t}'. Expected ${a} or less.`)}function VV(t){let e=encodeURIComponent,a="?";for(let n in t)if(t.hasOwnProperty(n)){let r=e(n)+"="+e(t[n]);a=a+r+"&"}return a=a.slice(0,-1),a}var Zh;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Zh||(Zh={}));function UV(t,e){let a=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return a||r||s}var bS=class{constructor(e,a,n,r,s,i,u,l,d,h,m,p=!0,I=!1){this.url_=e,this.method_=a,this.headers_=n,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=i,this.callback_=u,this.errorCallback_=l,this.timeout_=d,this.progressCallback_=h,this.connectionFactory_=m,this.retry=p,this.isUsingEmulator=I,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((L,k)=>{this.resolve_=L,this.reject_=k,this.start_()})}start_(){let e=(n,r)=>{if(r){n(!1,new zo(!1,null,!0));return}let s=this.connectionFactory_();this.pendingConnection_=s;let i=u=>{let l=u.loaded,d=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,d)};this.progressCallback_!==null&&s.addUploadProgressListener(i),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(i),this.pendingConnection_=null;let u=s.getErrorCode()===Zh.NO_ERROR,l=s.getStatus();if(!u||UV(l,this.additionalRetryCodes_)&&this.retry){let h=s.getErrorCode()===Zh.ABORT;n(!1,new zo(!1,null,h));return}let d=this.successCodes_.indexOf(l)!==-1;n(!0,new zo(d,s))})},a=(n,r)=>{let s=this.resolve_,i=this.reject_,u=r.connection;if(r.wasSuccessCode)try{let l=this.callback_(u,u.getResponse());NV(l)?s(l):s()}catch(l){i(l)}else if(u!==null){let l=AV();l.serverResponse=u.getErrorText(),this.errorCallback_?i(this.errorCallback_(u,l)):i(l)}else if(r.canceled){let l=this.appDelete_?K0():RV();i(l)}else{let l=xV();i(l)}};this.canceled_?a(!1,new zo(!1,null,!0)):this.backoffId_=OV(e,a,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&MV(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},zo=class{constructor(e,a,n){this.wasSuccessCode=e,this.connection=a,this.canceled=!!n}};function FV(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function BV(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function qV(t,e){e&&(t["X-Firebase-GMPID"]=e)}function zV(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function HV(t,e,a,n,r,s,i=!0,u=!1){let l=VV(t.urlParams),d=t.url+l,h=Object.assign({},t.headers);return qV(h,e),FV(h,a),BV(h,s),zV(h,n),new bS(d,t.method,h,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,i,u)}function GV(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function jV(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}var O4=256*1024;var LS=class t{constructor(e,a){this._service=e,a instanceof yr?this._location=a:this._location=yr.makeFromUrl(a,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,a){return new t(e,a)}get root(){let e=new yr(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return jV(this._location.path)}get storage(){return this._service}get parent(){let e=GV(this._location.path);if(e===null)return null;let a=new yr(this._location.bucket,e);return new t(this._service,a)}_throwIfRoot(e){if(this._location.path==="")throw PV(e)}};function z0(t,e){let a=e?.[CV];return a==null?null:yr.makeFromBucketSpec(a,t)}function KV(t,e,a,n={}){t.host=`${e}:${a}`;let r=In(e);r&&(Zi(`https://${t.host}/b`),eo("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:s}=n;s&&(t._overrideAuthToken=typeof s=="string"?s:vf(s,t.app.options.projectId))}var AS=class{constructor(e,a,n,r,s,i=!1){this.app=e,this._authProvider=a,this._appCheckProvider=n,this._url=r,this._firebaseVersion=s,this._isUsingEmulator=i,this._bucket=null,this._host=j0,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=bV,this._maxUploadRetryTime=LV,this._requests=new Set,r!=null?this._bucket=yr.makeFromBucketSpec(r,this._host):this._bucket=z0(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=yr.makeFromBucketSpec(this._url,e):this._bucket=z0(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){q0("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){q0("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let a=await e.getToken();if(a!==null)return a.accessToken}return null}async _getAppCheckToken(){if(pa(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new LS(this,e)}_makeRequest(e,a,n,r,s=!0){if(this._deleted)return new CS(K0());{let i=HV(e,this._appId,n,r,a,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(e,a){let[n,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,a,n,r).getPromise()}},H0="@firebase/storage",G0="0.14.1";var W0="storage";function Q0(t=ro(),e){t=Ut(t);let n=Bs(t,W0).getImmediate({identifier:e}),r=Sf("storage");return r&&WV(n,...r),n}function WV(t,e,a,n={}){KV(t,e,a,n)}function QV(t,{instanceIdentifier:e}){let a=t.getProvider("app").getImmediate(),n=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new AS(a,n,r,e,Tn)}function XV(){vn(new fa(W0,QV,"PUBLIC").setMultipleInstances(!0)),ha(H0,G0,""),ha(H0,G0,"esm2020")}XV();var X0={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var xS=By(X0),Y0=y_(xS),ep=hS(xS),G4=Q0(xS);var RS=null,kS=null;async function YV(t){let e=Date.now();if(RS&&kS&&e<kS)return RS;let a=await t.getIdToken(),n=await t.getIdTokenResult();return RS=a,kS=n.expirationTime?new Date(n.expirationTime).getTime()-6e4:e+6e4,a}function $V(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let a=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return a.startsWith("http")?t:e+a}var JV=25e3;async function $0(t,e={}){let a=Y0.currentUser;if(!a)throw new Error("User not authenticated");let n=await YV(a),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${n}`);let s=e.timeout!==void 0?e.timeout:JV,{timeout:i,...u}=e,l=u.signal,d=null,h=null;s>0&&(d=new AbortController,h=setTimeout(()=>{console.warn("[authFetch] Request exceeded timeout threshold:",s,"ms"),d.abort()},s),l=u.signal?(()=>{let m=new AbortController;return u.signal?.addEventListener("abort",()=>{clearTimeout(h),m.abort()}),d.signal.addEventListener("abort",()=>m.abort()),m.signal})():d.signal);try{let m=await fetch($V(t),{...u,headers:r,signal:l??u.signal});return h&&clearTimeout(h),m}catch(m){throw h&&clearTimeout(h),m instanceof Error&&m.name==="AbortError"&&d?.signal.aborted?new Error("Request timed out"):m}}var DS=null;function ZV(){if(typeof window>"u")return null;if(!DS)try{DS=new AudioContext}catch{return null}return DS}function J0(){let t=ZV();if(!t)return;let e=t.currentTime,a=t.createOscillator(),n=t.createGain();a.connect(n),n.connect(t.destination),a.frequency.setValueAtTime(800,e),a.frequency.exponentialRampToValueAtTime(400,e+.02),a.type="sine",n.gain.setValueAtTime(.08,e),n.gain.exponentialRampToValueAtTime(.001,e+.05),a.start(e),a.stop(e+.05)}var H=De($a());var eU=typeof process<"u"&&!1;function tp(t,e){if(eU&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var nU=20;function rU(t){let e=t.data(),a=e.status??"open",n=e.isResolved===!0||a==="resolved"||a==="done",r=a==="skipped";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:n,isSkipped:r||void 0,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null,clarityScore:e.clarityScore??null,clarityStatus:e.clarityStatus??null,clarityIssues:e.clarityIssues??null,clarityConfidence:e.clarityConfidence??null,clarityCheckedAt:e.clarityCheckedAt??null}}async function aR(t,e=nU,a){tp(e,"getSessionFeedbackPageRepo");let n=oc(ep,"feedback"),r=a!=null?dc(n,fc("sessionId","==",t),hc("createdAt","desc"),pc(e),U0(a)):dc(n,fc("sessionId","==",t),hc("createdAt","desc"),pc(e)),i=(await Jh(r)).docs,u=i.map(rU),l=i.length>0?i[i.length-1]:null,d=i.length===e;return{feedback:u,lastVisibleDoc:l,hasMore:d}}async function nR(t,e=50){let{feedback:a}=await aR(t,e);return a}var ap=24;function oU(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let a=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),n=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(a&&!n)return"negative";if(n&&!a)return"positive";if(a&&n){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,s=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>s?"negative":s>r?"positive":"neutral"}return"neutral"}function iR(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}var np=["focus_mode","region_selecting","voice_listening","processing"],uU=1800,lU=12;function oR({sessionId:t,extensionMode:e=!1,initialPointers:a,onComplete:n,onDelete:r,onRecordingChange:s,liveStructureFetch:i}){let[u,l]=(0,H.useState)([]),[d,h]=(0,H.useState)(null),[m,p]=(0,H.useState)(!1),[I,L]=(0,H.useState)("idle"),[k,D]=(0,H.useState)(null),[w,v]=(0,H.useState)(a??[]),[b,x]=(0,H.useState)(null),[B,G]=(0,H.useState)(null),[S,y]=(0,H.useState)(""),[_,T]=(0,H.useState)(""),[C,A]=(0,H.useState)(!1),[E,Re]=(0,H.useState)(null),[Me,Xa]=(0,H.useState)(!1),[M,O]=(0,H.useState)(null),[U,$]=(0,H.useState)(null),[W,ee]=(0,H.useState)(0),[q,ne]=(0,H.useState)(!0),[J,ae]=(0,H.useState)(null),[pe,we]=(0,H.useState)(!1),[ke,Qt]=(0,H.useState)(!1),[Ye,He]=(0,H.useState)(null),[nt,rt]=(0,H.useState)(!1),ve=(0,H.useRef)({x:0,y:0}),Ue=(0,H.useRef)(null),Fe=(0,H.useRef)(null),ft=(0,H.useRef)(null),Da=(0,H.useRef)(null),Te=(0,H.useRef)(null),Ee=(0,H.useRef)(u),$e=(0,H.useRef)(I),Pa=(0,H.useRef)(null),Ct=(0,H.useRef)(!1),Be=(0,H.useRef)(null),Xt=(0,H.useRef)(null),ga=(0,H.useRef)(null),hs=(0,H.useRef)(null),ya=(0,H.useRef)(null);(0,H.useEffect)(()=>{$e.current=I},[I]),(0,H.useEffect)(()=>(I==="focus_mode"||I==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[I]),(0,H.useEffect)(()=>{if(I!=="voice_listening"){ya.current!=null&&(cancelAnimationFrame(ya.current),ya.current=null),Xt.current?.getTracks().forEach(Ae=>Ae.stop()),Xt.current=null,ga.current?.close().catch(()=>{}),ga.current=null,hs.current=null,ee(0);return}let K=hs.current;if(!K)return;let Z=new Uint8Array(K.frequencyBinCount),Q,ie=()=>{K.getByteFrequencyData(Z);let Ae=Z.reduce((Ya,$o)=>Ya+$o,0),st=Z.length?Ae/Z.length:0,bt=Math.min(1,st/128);ee(bt),Q=requestAnimationFrame(ie)};return Q=requestAnimationFrame(ie),ya.current=Q,()=>{cancelAnimationFrame(Q),ya.current=null}},[I]),(0,H.useEffect)(()=>{Pa.current=B},[B]),(0,H.useEffect)(()=>{Ct.current=np.includes(I)},[I]);let on=(0,H.useRef)(!1);(0,H.useEffect)(()=>{if(!s)return;np.includes(I)?(on.current=!0,s(!0)):on.current&&(on.current=!1,s(!1))},[I,s]),(0,H.useEffect)(()=>{if(I!=="voice_listening"||!i||!d){$(null),Be.current&&(clearTimeout(Be.current),Be.current=null);return}let Z=(u.find(Q=>Q.id===d)?.transcript??"").trim();if(Z.length<lU){Be.current&&(clearTimeout(Be.current),Be.current=null);return}return Be.current&&clearTimeout(Be.current),Be.current=setTimeout(()=>{Be.current=null,i(Z).then(Q=>{Q&&$e.current==="voice_listening"&&$(Q)}).catch(()=>{})},uU),()=>{Be.current&&(clearTimeout(Be.current),Be.current=null)}},[I,d,u,i]);let vc=(0,H.useCallback)(K=>{K===!1&&(Ct.current||e||np.includes($e.current)||Pa.current)||p(K)},[e]),Go=(0,H.useCallback)(()=>{p(K=>!K)},[]);(0,H.useEffect)(()=>{Te.current=d},[d]),(0,H.useEffect)(()=>{Ee.current=u},[u]),(0,H.useEffect)(()=>{let K=Q=>{if(!Me||!Ue.current)return;Q.preventDefault();let ie=Ue.current.offsetWidth,Ae=Ue.current.offsetHeight,st=Q.clientX-ve.current.x,bt=Q.clientY-ve.current.y,Ya=window.innerWidth-ie-ap,$o=window.innerHeight-Ae-ap;st=Math.max(ap,Math.min(st,Ya)),bt=Math.max(ap,Math.min(bt,$o)),Re({x:st,y:bt})},Z=()=>{Me&&(Xa(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",K),window.addEventListener("mouseup",Z),()=>{window.removeEventListener("mousemove",K),window.removeEventListener("mouseup",Z)}},[Me]);let jo=(0,H.useCallback)(K=>{if(K.button!==0||!Ue.current)return;let Z=Ue.current.getBoundingClientRect();Xa(!0),document.body.style.userSelect="none",ve.current={x:K.clientX-Z.left,y:K.clientY-Z.top},Re({x:Z.left,y:Z.top})},[]),Tr=(0,H.useCallback)(()=>{if(Fe.current)return;let K=document.createElement("div");K.id="echly-capture-root",document.body.appendChild(K),Fe.current=K,He(K),Qt(!0)},[]),_a=(0,H.useCallback)(()=>{if(Fe.current){try{document.body.removeChild(Fe.current)}catch(K){console.error("CaptureWidget error:",K)}Fe.current=null}He(null),Qt(!1)},[]),Ia=(0,H.useCallback)(()=>{L("idle"),p(q)},[q]);(0,H.useEffect)(()=>{if(a!=null){v(a);return}if(!t)return;(async()=>{let Z=await nR(t);v(Z.map(Q=>({id:Q.id,title:Q.title,description:Q.description,type:Q.type})))})()},[t,a]),(0,H.useEffect)(()=>{let K=window.SpeechRecognition||window.webkitSpeechRecognition;if(!K)return;let Z=new K;return Z.continuous=!0,Z.interimResults=!0,Z.lang="en-US",Z.onresult=Q=>{let ie="";for(let st=Q.resultIndex;st<Q.results.length;++st){let bt=Q.results[st];bt&&bt[0]&&(ie+=bt[0].transcript)}let Ae=Te.current;Ae&&l(st=>st.map(bt=>bt.id===Ae?{...bt,transcript:ie}:bt))},Z.onend=()=>{let Q=$e.current;Q==="processing"||Q==="success"||L("idle")},ft.current=Z,()=>{try{Z.stop()}catch(Q){console.error("CaptureWidget error:",Q)}}},[]);let ra=(0,H.useCallback)(async()=>{try{let K=await navigator.mediaDevices.getUserMedia({audio:!0});Xt.current=K;let Z=new AudioContext,Q=Z.createAnalyser();Q.fftSize=256,Q.smoothingTimeConstant=.7,Z.createMediaStreamSource(K).connect(Q),ga.current=Z,hs.current=Q,ft.current?.start(),L("voice_listening"),ee(0)}catch(K){console.error("Microphone permission denied:",K),D("Microphone permission denied."),L("error"),_a(),Ia()}},[]),Ko=(0,H.useCallback)(async()=>{typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),J0(),ft.current?.stop();let K=Te.current;if(!K){L("idle");return}let Q=Ee.current.find(ie=>ie.id===K);if(!Q||!Q.transcript.trim()){L("idle");return}if(L("processing"),e){n(Q.transcript,Q.screenshot,{onSuccess:ie=>{v(Ae=>[{id:ie.id,title:ie.title,description:ie.description,type:ie.type},...Ae]),l(Ae=>Ae.filter(st=>st.id!==K)),h(null),ae(ie.id),setTimeout(()=>ae(null),1200),rt(!0),setTimeout(()=>rt(!1),200),we(!0),setTimeout(()=>{_a(),Ia(),we(!1)},120)},onError:()=>{D("AI processing failed."),L("voice_listening")}},Q.context??void 0);return}try{let ie=await n(Q.transcript,Q.screenshot);if(!ie){L("idle"),_a(),Ia();return}v(Ae=>[{id:ie.id,title:ie.title,description:ie.description,type:ie.type},...Ae]),l(Ae=>Ae.filter(st=>st.id!==K)),h(null),ae(ie.id),setTimeout(()=>ae(null),1200),rt(!0),setTimeout(()=>rt(!1),200),we(!0),setTimeout(()=>{_a(),Ia(),we(!1)},120)}catch(ie){console.error(ie),D("AI processing failed."),L("voice_listening")}},[n,e,_a,Ia]),Mn=(0,H.useCallback)(()=>{ft.current?.stop();let K=Te.current;l(Z=>Z.filter(Q=>Q.id!==K)),h(null),L("cancelled"),_a(),Ia()},[_a,Ia]);(0,H.useEffect)(()=>{if(!ke)return;let K=Z=>{Z.key==="Escape"&&(Z.preventDefault(),np.includes($e.current)&&Mn())};return document.addEventListener("keydown",K),()=>document.removeEventListener("keydown",K)},[ke,Mn]);let Wo=(0,H.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),wr=(0,H.useCallback)(()=>{v([]),l([]),h(null),L("idle"),x(null),G(null),A(!1)},[]);(0,H.useEffect)(()=>{if(e)return;let K=Z=>{let Q=Z.target;Da.current&&Q&&!Da.current.contains(Q)&&A(!1)};return document.addEventListener("mousedown",K),()=>document.removeEventListener("mousedown",K)},[e]);let Qo=(0,H.useCallback)(async K=>{try{await r(K),v(Z=>Z.filter(Q=>Q.id!==K))}catch(Z){console.error("Delete failed:",Z)}},[r]),Dt=(0,H.useCallback)(K=>{G(K.id),y(K.title),T(K.description)},[]),Xo=(0,H.useCallback)(async K=>{let Z=S.trim()||S,Q=_;v(ie=>ie.map(Ae=>Ae.id===K?{...Ae,title:Z||Ae.title,description:Q}:Ae)),G(null);try{let ie=await $0(`/api/tickets/${K}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:Z||S,description:Q})}),Ae=await ie.json();if(ie.ok&&Ae.success&&Ae.ticket){let st=Ae.ticket;v(bt=>bt.map(Ya=>Ya.id===K?{...Ya,title:st.title,description:st.description,type:st.type??Ya.type}:Ya))}}catch(ie){console.error("Save edit failed:",ie)}},[S,_]),un=(0,H.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?new Promise((K,Z)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},Q=>{!Q||!Q.success?Z(new Error("Capture failed")):K(Q.screenshot??null)})}):Promise.resolve(null),[]),Er=(0,H.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return un();let{captureScreenshot:K}=await Promise.resolve().then(()=>(sR(),rR));return K()},[un]),Tc=(0,H.useCallback)(()=>{L("region_selecting")},[]),wc=(0,H.useCallback)((K,Z)=>{let Q=iR(),ie={id:Q,screenshot:K,transcript:"",structuredOutput:null,context:Z??null,createdAt:Date.now()};l(Ae=>[...Ae,ie]),h(Q),ra()},[ra]),Oa=(0,H.useCallback)(()=>{L("cancelled"),_a(),Ia()},[_a,Ia]),Ec=(0,H.useCallback)(K=>{let Z=Te.current;Z&&l(Q=>Q.map(ie=>ie.id===Z?{...ie,transcript:K}:ie))},[]),Cc=(0,H.useCallback)(async()=>{if($e.current==="idle"&&(D(null),ft.current?.stop(),ne(m),p(!1),Tr(),L("focus_mode"),!e))try{let K=await Er();if(!K){Oa();return}let Z=iR(),Q={id:Z,screenshot:K,transcript:"",structuredOutput:null,createdAt:Date.now()};l(ie=>[...ie,Q]),h(Z),ra()}catch(K){console.error(K),D("Screen capture failed."),L("error"),Oa()}},[e,m,Er,ra,Tr,Oa]),ni=(0,H.useMemo)(()=>({setIsOpen:vc,toggleOpen:Go,startDrag:jo,handleShare:Wo,setShowMenu:A,resetSession:wr,startListening:ra,finishListening:Ko,discardListening:Mn,deletePointer:Qo,startEditing:Dt,saveEdit:Xo,setExpandedId:x,setEditedTitle:y,setEditedDescription:T,handleAddFeedback:Cc,handleRegionCaptured:wc,handleRegionSelectStart:Tc,handleCancelCapture:Oa,getFullTabImage:un,setActiveRecordingTranscript:Ec}),[vc,Go,jo,Wo,wr,ra,Ko,Mn,Qo,Dt,Xo,Cc,wc,Tc,Oa,un,Ec]),ri=(0,H.useMemo)(()=>d?u.find(K=>K.id===d):null,[d,u]),bc=(0,H.useMemo)(()=>I!=="voice_listening"?"neutral":oU(ri?.transcript??""),[I,ri?.transcript]),Yo=ri?.transcript?.trim()??"";return{state:{isOpen:m,state:I,errorMessage:k,pointers:w,expandedId:b,editingId:B,editedTitle:S,editedDescription:_,showMenu:C,position:E,liveStructured:U,liveTranscript:Yo,listeningAudioLevel:W,listeningSentiment:bc,highlightTicketId:J,pillExiting:pe,orbSuccess:nt},handlers:ni,refs:{widgetRef:Ue,menuRef:Da,captureRootRef:Fe},captureRootReady:ke,captureRootEl:Ye}}var sp=De($a());var rp=(...t)=>t.filter((e,a,n)=>!!e&&e.trim()!==""&&n.indexOf(e)===a).join(" ").trim();var uR=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var lR=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,n)=>n?n.toUpperCase():a.toLowerCase());var PS=t=>{let e=lR(t);return e.charAt(0).toUpperCase()+e.slice(1)};var mc=De($a());var cR={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var dR=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var fR=(0,mc.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:n,className:r="",children:s,iconNode:i,...u},l)=>(0,mc.createElement)("svg",{ref:l,...cR,width:e,height:e,stroke:t,strokeWidth:n?Number(a)*24/Number(e):a,className:rp("lucide",r),...!s&&!dR(u)&&{"aria-hidden":"true"},...u},[...i.map(([d,h])=>(0,mc.createElement)(d,h)),...Array.isArray(s)?s:[s]]));var On=(t,e)=>{let a=(0,sp.forwardRef)(({className:n,...r},s)=>(0,sp.createElement)(fR,{ref:s,iconNode:e,className:rp(`lucide-${uR(PS(t))}`,`lucide-${t}`,n),...r}));return a.displayName=PS(t),a};var cU=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],gc=On("check",cU);var dU=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],yc=On("expand",dU);var fU=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],_c=On("pencil",fU);var hU=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],Ic=On("trash-2",hU);var pU=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Sc=On("x",pU);var Zt=De(Rt()),yU=()=>(0,Zt.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,Zt.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,Zt.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),_U=()=>(0,Zt.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,Zt.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function OS({onClose:t,summary:e=null,theme:a="dark",onThemeToggle:n}){return(0,Zt.jsxs)("div",{className:"echly-sidebar-header",children:[(0,Zt.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,Zt.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,Zt.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),n&&(0,Zt.jsx)("button",{type:"button",id:"theme-toggle",onClick:n,className:"echly-theme-toggle","aria-label":a==="dark"?"Switch to light mode":"Switch to dark mode",children:a==="dark"?(0,Zt.jsx)(yU,{}):(0,Zt.jsx)(_U,{})}),(0,Zt.jsx)("button",{type:"button",onClick:t,className:"echly-sidebar-close","aria-label":"Close",children:(0,Zt.jsx)(Sc,{size:16,strokeWidth:1.5})})]})}var _r=De($a());var at=De(Rt());function IU(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function SU({item:t,expandedId:e,editingId:a,editedTitle:n,editedDescription:r,onExpand:s,onStartEdit:i,onSaveEdit:u,onDelete:l,onEditedTitleChange:d,onEditedDescriptionChange:h,highlightTicketId:m=null}){let p=e===t.id,I=a===t.id,L=m===t.id,k=IU(t.type),[D,w]=(0,_r.useState)(!1),v=(0,_r.useCallback)(()=>{s(p?null:t.id)},[p,t.id,s]),b=(0,_r.useCallback)(()=>{i(t)},[t,i]),x=(0,_r.useCallback)(()=>{u(t.id),w(!0),setTimeout(()=>w(!1),220)},[t.id,u]),B=(0,_r.useCallback)(()=>{l(t.id)},[t.id,l]);return(0,at.jsxs)("div",{className:`echly-feedback-item ${L?"echly-ticket-highlight":""}`,"data-priority":k,children:[(0,at.jsx)("span",{className:"echly-priority-dot","aria-hidden":!0}),(0,at.jsxs)("div",{className:"echly-feedback-item-inner",children:[(0,at.jsx)("div",{className:"echly-feedback-item-content",children:I?(0,at.jsxs)(at.Fragment,{children:[(0,at.jsx)("input",{value:n,onChange:G=>d(G.target.value),className:"echly-widget-input echly-feedback-item-input"}),(0,at.jsx)("textarea",{value:r,onChange:G=>h(G.target.value),rows:3,className:"echly-widget-input echly-feedback-item-textarea"})]}):(0,at.jsxs)(at.Fragment,{children:[(0,at.jsx)("h3",{className:"echly-widget-item-title",children:t.title}),p&&(0,at.jsx)("p",{className:"echly-widget-item-desc",children:t.description})]})}),(0,at.jsxs)("div",{className:"echly-feedback-item-actions",children:[(0,at.jsx)("button",{type:"button",onClick:v,className:"echly-widget-action-icon","aria-label":p?"Collapse":"Expand",children:(0,at.jsx)(yc,{size:16,strokeWidth:1.5})}),I?(0,at.jsx)("button",{type:"button",onClick:x,className:`echly-widget-action-icon echly-widget-action-icon--confirm ${D?"echly-widget-action-icon--confirm-success":""}`,"aria-label":"Save",children:(0,at.jsx)(gc,{size:16,strokeWidth:1.5})}):(0,at.jsx)("button",{type:"button",onClick:b,className:"echly-widget-action-icon","aria-label":"Edit",children:(0,at.jsx)(_c,{size:16,strokeWidth:1.5})}),(0,at.jsx)("button",{type:"button",onClick:B,className:"echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,at.jsx)(Ic,{size:16,strokeWidth:1.5})})]})]})]})}var gR=_r.default.memo(SU,(t,e)=>t.item===e.item&&t.expandedId===e.expandedId&&t.editingId===e.editingId&&t.editedTitle===e.editedTitle&&t.editedDescription===e.editedDescription&&t.highlightTicketId===e.highlightTicketId);var MS=De(Rt());function NS({isIdle:t,onAddFeedback:e,captureDisabled:a=!1}){let n=!t||a;return(0,MS.jsx)("div",{className:"echly-add-insight-wrap",children:(0,MS.jsx)("button",{type:"button",onClick:n?void 0:e,disabled:n,className:`echly-add-insight-btn ${n?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var SR=De(Np());var kt=De($a());function vU(t){if(!t||!t.getRootNode)return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let a=[],n=t;for(;n&&n!==e.body&&a.length<12;){let r=n.tagName.toLowerCase();if(n.id&&/^[a-zA-Z][\w-]*$/.test(n.id)){r+=`#${n.id}`,a.unshift(r);break}let s=n.parentElement;if(!s)break;let i=s.children,u=0;for(let l=0;l<i.length;l++)if(i[l]===n){u=l+1;break}r+=`:nth-child(${u})`,a.unshift(r),n=s}return a.length===0?null:a.join(" > ")}function TU(t){if(!t)return null;let e=[],a=t.getAttribute("aria-label")||t.placeholder||t.textContent?.trim()||"";a.length>0&&e.push(a.slice(0,120));let n=t.parentElement;for(let s=0;s<3&&n;s++){let i=n.tagName.toLowerCase();if(i==="label"||i==="h1"||i==="h2"||i==="h3"||i==="h4"){let u=n.textContent?.trim().slice(0,80);u&&e.push(u);break}n=n.parentElement}let r=e.filter(Boolean).join(" \xB7 ");return r?r.length>300?r.slice(0,300)+"\u2026":r:null}function yR(t,e){return{url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:e?vU(e):null,nearbyText:e?TU(e):null,capturedAt:Date.now()}}var VS=null;function wU(){if(typeof window>"u")return null;if(!VS)try{VS=new AudioContext}catch{return null}return VS}function _R(){let t=wU();if(!t)return;let e=t.currentTime,a=t.createOscillator(),n=t.createGain();a.connect(n),n.connect(t.destination),a.frequency.setValueAtTime(1200,e),a.frequency.exponentialRampToValueAtTime(600,e+.04),a.type="sine",n.gain.setValueAtTime(.04,e),n.gain.exponentialRampToValueAtTime(.001,e+.06),a.start(e),a.stop(e+.06)}var Ir=De(Rt()),Ho=24,op="cubic-bezier(0.22, 0.61, 0.36, 1)";async function EU(t,e,a){return new Promise((n,r)=>{let s=new Image;s.crossOrigin="anonymous",s.onload=()=>{let i=Math.round(e.x*a),u=Math.round(e.y*a),l=Math.round(e.w*a),d=Math.round(e.h*a),h=document.createElement("canvas");h.width=l,h.height=d;let m=h.getContext("2d");if(!m){r(new Error("No canvas context"));return}m.drawImage(s,i,u,l,d,0,0,l,d);try{n(h.toDataURL("image/png"))}catch(p){r(p)}},s.onerror=()=>r(new Error("Image load failed")),s.src=t})}function IR({getFullTabImage:t,onAddVoice:e,onCancel:a,onSelectionStart:n}){let[r,s]=(0,kt.useState)(null),[i,u]=(0,kt.useState)(null),[l,d]=(0,kt.useState)(!1),[h,m]=(0,kt.useState)(!1),p=(0,kt.useRef)(null),I=(0,kt.useRef)(null),L=(0,kt.useCallback)(()=>{s(null),u(null),p.current=null,I.current=null,setTimeout(()=>a(),120)},[a]);(0,kt.useEffect)(()=>{let y=_=>{_.key==="Escape"&&(_.preventDefault(),i?(u(null),s(null),I.current=null,p.current=null):L())};return document.addEventListener("keydown",y),()=>document.removeEventListener("keydown",y)},[L,i]),(0,kt.useEffect)(()=>{let y=()=>{document.visibilityState==="hidden"&&L()};return document.addEventListener("visibilitychange",y),()=>document.removeEventListener("visibilitychange",y)},[L]);let k=(0,kt.useCallback)(async y=>{if(l)return;d(!0),_R(),m(!0),setTimeout(()=>m(!1),150),await new Promise(E=>setTimeout(E,200));let _=null;try{_=await t()}catch{d(!1),a();return}if(!_){d(!1),a();return}let T=typeof window<"u"&&window.devicePixelRatio||1,C;try{C=await EU(_,y,T)}catch{d(!1),a();return}let A=typeof window<"u"?yR(window,null):null;e(C,A),d(!1),u(null)},[t,e,a,l]),D=(0,kt.useCallback)(()=>{u(null),s(null),I.current=null,p.current=null},[]),w=(0,kt.useCallback)(y=>{if(y.button!==0||i)return;y.preventDefault(),n?.();let _=y.clientX,T=y.clientY;p.current={x:_,y:T},s({x:_,y:T,w:0,h:0})},[n,i]),v=(0,kt.useCallback)(y=>{if(y.button!==0)return;y.preventDefault();let _=I.current,T=p.current;if(p.current=null,!T||!_||_.w<Ho||_.h<Ho){s(null);return}s(null),I.current=null,u({x:_.x,y:_.y,w:_.w,h:_.h})},[]),b=(0,kt.useCallback)(y=>{if(!p.current||i)return;let _=p.current.x,T=p.current.y,C=Math.min(_,y.clientX),A=Math.min(T,y.clientY),E=Math.abs(y.clientX-_),Re=Math.abs(y.clientY-T),Me={x:C,y:A,w:E,h:Re};I.current=Me,s(Me)},[i]);(0,kt.useEffect)(()=>{let y=_=>{if(_.button!==0||!p.current||i)return;let T=I.current,C=p.current;if(p.current=null,!C||!T||T.w<Ho||T.h<Ho){s(null),I.current=null;return}s(null),I.current=null,u({x:T.x,y:T.y,w:T.w,h:T.h})};return window.addEventListener("mouseup",y),()=>window.removeEventListener("mouseup",y)},[i]);let x=!!r&&(r.w>=Ho||r.h>=Ho),B=i!==null,G=x&&r||B&&i,S=B?i:r;return(0,Ir.jsxs)("div",{role:"presentation","aria-hidden":!0,className:"echly-region-overlay",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,Ir.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:G?"transparent":"rgba(0,0,0,0.35)",pointerEvents:i?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${op}`},onMouseDown:w,onMouseMove:b,onMouseUp:v,onMouseLeave:()=>{!p.current||i||(s(null),p.current=null,I.current=null)}}),(0,Ir.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",fontSize:13,color:"rgba(255,255,255,0.8)",zIndex:2147483647,pointerEvents:"none",opacity:i?0:1,transition:`opacity 180ms ${op}`},children:"Drag to capture area \u2014 ESC to cancel"}),G&&S&&(0,Ir.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:S.x,top:S.y,width:Math.max(S.w,1),height:Math.max(S.h,1),borderRadius:6,border:`2px solid ${h?"#FFFFFF":"#5B8CFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.35)",pointerEvents:"none",zIndex:2147483646,transition:h?"none":`border-color 150ms ${op}`}}),B&&i&&(0,Ir.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:i.x+i.w/2,bottom:Math.max(12,i.y+i.h-48),transform:"translate(-50%, 100%)",display:"flex",gap:8,padding:"8px 12px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${op} forwards`},children:[(0,Ir.jsx)("button",{type:"button",onClick:D,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Retake"}),(0,Ir.jsx)("button",{type:"button",onClick:()=>k(i),disabled:l,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"linear-gradient(135deg, #5B8CFF, #466EFF)",color:"#fff",fontSize:13,fontWeight:600,cursor:l?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var Sr=De(Rt());function vR({captureRoot:t,extensionMode:e,state:a,getFullTabImage:n,onRegionCaptured:r,onRegionSelectStart:s,onCancelCapture:i}){return(0,Sr.jsx)(Sr.Fragment,{children:(0,SR.createPortal)((0,Sr.jsxs)(Sr.Fragment,{children:[(a==="focus_mode"||a==="region_selecting")&&(0,Sr.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.04)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),e&&(a==="focus_mode"||a==="region_selecting")&&(0,Sr.jsx)(IR,{getFullTabImage:n,onAddVoice:r,onCancel:i,onSelectionStart:s})]}),t)})}var up=De($a());var vr=De(Rt());function CU(){return(0,vr.jsxs)("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,vr.jsx)("path",{d:"M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"}),(0,vr.jsx)("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2"}),(0,vr.jsx)("line",{x1:"12",x2:"12",y1:"19",y2:"22"})]})}function TR({isRecording:t,isProcessing:e,audioLevel:a}){let n=t&&!e?1+Math.min(.1,a*.1):1;return(0,vr.jsx)("div",{className:["echly-recording-orb-inner",e?"echly-recording-orb-inner--processing":"",t&&!e?"echly-recording-orb-inner--listening":""].filter(Boolean).join(" "),style:t&&!e?{transform:`scale(${n})`}:void 0,"aria-hidden":!0,children:(0,vr.jsx)("span",{className:"echly-recording-orb-icon",style:{color:"#FFFFFF"},children:(0,vr.jsx)(CU,{})})})}var Qa=De(Rt());function wR({visible:t,isActive:e,isProcessing:a,isExiting:n=!1,audioLevel:r,onDone:s,onCancel:i}){let[u,l]=(0,up.useState)(!1);(0,up.useEffect)(()=>{if(e||a){let p=requestAnimationFrame(()=>{requestAnimationFrame(()=>l(!0))});return()=>cancelAnimationFrame(p)}let m=requestAnimationFrame(()=>l(!1));return()=>cancelAnimationFrame(m)},[e,a]);let d=a?"Structuring your feedback\u2026":e?"Listening\u2026":"Tell us what's happening \u2014 we'll structure it.",h=e&&!a;return t?(0,Qa.jsx)("div",{className:"echly-recording-row","aria-live":"polite",role:"status",children:(0,Qa.jsxs)("div",{className:["echly-recording-capsule",u?"echly-recording-capsule--expanded":"",a?"echly-recording-capsule--processing":"",n?"echly-recording-capsule--exiting":"",e&&!a?"echly-recording-capsule--recording":""].filter(Boolean).join(" "),children:[(0,Qa.jsx)("div",{className:"echly-recording-orb",children:(0,Qa.jsx)(TR,{isRecording:e,isProcessing:a,audioLevel:r})}),(0,Qa.jsxs)("div",{className:"echly-recording-center",children:[(0,Qa.jsx)("span",{className:"echly-recording-status",children:d}),h&&(0,Qa.jsx)("span",{className:"echly-recording-esc-hint",children:"Press Esc to cancel"}),(0,Qa.jsxs)("div",{className:"echly-recording-action-row",children:[(0,Qa.jsx)("button",{type:"button",onClick:i,className:"echly-recording-cancel-pill","aria-label":"Cancel recording",children:"Cancel"}),e&&!a&&(0,Qa.jsx)("button",{type:"button",className:"echly-recording-done",onClick:s,"aria-label":"Done recording",children:"Done"})]})]})]})}):null}var dt=De(Rt()),bU=["focus_mode","region_selecting","voice_listening","processing"],LU=["voice_listening","processing"];function lp({sessionId:t,userId:e,extensionMode:a=!1,initialPointers:n,onComplete:r,onDelete:s,widgetToggleRef:i,onRecordingChange:u,expanded:l,onExpandRequest:d,onCollapseRequest:h,liveStructureFetch:m,captureDisabled:p=!1,theme:I="dark",onThemeToggle:L}){let{state:k,handlers:D,refs:w,captureRootEl:v}=oR({sessionId:t,userId:e,extensionMode:a,initialPointers:n,onComplete:r,onDelete:s,onRecordingChange:u,liveStructureFetch:m}),x=l!==void 0?l:k.isOpen,B=(0,fs.useRef)(null),G=bU.includes(k.state)||k.pillExiting,S=LU.includes(k.state)||k.pillExiting,y=!G,_=!x&&y,T=x&&y,C=(0,fs.useRef)(!1);(0,fs.useEffect)(()=>{if(!G){C.current=!1;return}C.current||(C.current=!0,h?.())},[G,h]);let A=k.pointers.length,E=k.pointers.filter(Me=>/critical|bug|high|urgent/i.test(Me.type||"")).length,Re=A>0?E>0?`${A} insights \u2022 ${E} need attention`:`${A} insights`:null;return(0,fs.useEffect)(()=>{k.highlightTicketId&&B.current&&B.current.scrollTo({top:0,behavior:"smooth"})},[k.highlightTicketId]),fs.default.useEffect(()=>{if(i)return i.current=D.toggleOpen,()=>{i.current=null}},[D,i]),(0,dt.jsxs)(dt.Fragment,{children:[v&&(0,dt.jsx)(vR,{captureRoot:v,extensionMode:a,state:k.state,getFullTabImage:D.getFullTabImage,onRegionCaptured:D.handleRegionCaptured,onRegionSelectStart:D.handleRegionSelectStart,onCancelCapture:D.handleCancelCapture}),S&&(0,dt.jsx)(dt.Fragment,{children:(0,dt.jsx)(wR,{visible:!0,isActive:k.state==="voice_listening",isProcessing:k.state==="processing"||k.pillExiting,isExiting:k.pillExiting,audioLevel:k.listeningAudioLevel??0,sentiment:k.listeningSentiment??"neutral",liveTranscript:k.liveTranscript??"",onDone:D.finishListening,onCancel:D.handleCancelCapture})}),_&&(0,dt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,dt.jsx)("button",{type:"button",onClick:()=>d?d():D.setIsOpen(!0),className:"echly-floating-trigger",children:"Capture feedback"})}),T&&(0,dt.jsxs)(dt.Fragment,{children:[!a&&(0,dt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,dt.jsx)("div",{ref:w.widgetRef,className:"echly-sidebar-container",style:a?{position:"fixed",...k.position?{left:k.position.x,top:k.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,dt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,dt.jsx)(OS,{onClose:()=>h?h():D.setIsOpen(!1),summary:Re,theme:I,onThemeToggle:L}),(0,dt.jsxs)("div",{ref:B,className:"echly-sidebar-body",children:[(0,dt.jsx)("div",{className:"echly-feedback-list",children:k.pointers.map(Me=>(0,dt.jsx)(gR,{item:Me,expandedId:k.expandedId,editingId:k.editingId,editedTitle:k.editedTitle,editedDescription:k.editedDescription,onExpand:D.setExpandedId,onStartEdit:D.startEditing,onSaveEdit:D.saveEdit,onDelete:D.deletePointer,onEditedTitleChange:D.setEditedTitle,onEditedDescriptionChange:D.setEditedDescription,highlightTicketId:k.highlightTicketId},Me.id))}),k.errorMessage&&(0,dt.jsx)("div",{className:"echly-sidebar-error",children:k.errorMessage}),k.state==="idle"&&(0,dt.jsx)(NS,{isIdle:!0,onAddFeedback:D.handleAddFeedback,captureDisabled:p})]})]})})]})]})}var ot=De(Rt()),AU="echly-root",US="echly-shadow-host",CR="widget-theme";function xU(){try{let t=localStorage.getItem(CR);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function RU(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem(CR,e)}catch{}}function kU(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function DU({widgetRoot:t,initialTheme:e}){let[a,n]=xe.default.useState(null),[r,s]=xe.default.useState(null),[i,u]=xe.default.useState(!1),[l,d]=xe.default.useState(e),[h,m]=xe.default.useState({visible:!1,expanded:!1,isRecording:!1,sessionId:null}),p=h.sessionId,I=xe.default.useRef(null),L=xe.default.useRef(!1),[k,D]=xe.default.useState(null),[w,v]=xe.default.useState(!1),[b,x]=xe.default.useState(!1),[B,G]=xe.default.useState(""),S=xe.default.useRef(null),y=xe.default.useRef(!1),[_,T]=xe.default.useState(!1),C=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";xe.default.useEffect(()=>{let q=()=>{I.current?.()};return window.addEventListener("ECHLY_TOGGLE_WIDGET",q),()=>{window.removeEventListener("ECHLY_TOGGLE_WIDGET",q)}},[]),xe.default.useEffect(()=>{let q=ne=>{let J=ne.detail?.state;J&&m(J)};return window.addEventListener("ECHLY_GLOBAL_STATE",q),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",q)},[]),xe.default.useEffect(()=>{let q=()=>{let J=window.location.origin;if(!(J==="https://echly-web.vercel.app"||J==="http://localhost:3000"))return;let pe=window.location.pathname.split("/").filter(Boolean);pe[0]==="dashboard"&&pe[1]&&chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:pe[1]},()=>{})};q(),window.addEventListener("popstate",q);let ne=setInterval(q,2e3);return()=>{window.removeEventListener("popstate",q),clearInterval(ne)}},[]);let A=xe.default.useCallback(q=>{q?chrome.runtime.sendMessage({type:"START_RECORDING"},ne=>{if(chrome.runtime.lastError){s(chrome.runtime.lastError.message||"Failed to start recording");return}ne?.ok||s(ne?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),E=xe.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{})},[]),Re=xe.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{})},[]),Me=xe.default.useCallback(()=>{let q=l==="dark"?"light":"dark";d(q),RU(t,q)},[l,t]);xe.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},q=>{q?.authenticated&&q.user?.uid?n({uid:q.user.uid,name:q.user.name??null,email:q.user.email??null,photoURL:q.user.photoURL??null}):n(null),u(!0)})},[]);let Xa=xe.default.useCallback(async(q,ne,J,ae)=>{if(!L.current){if(L.current=!0,!p||!a){J?.onError(),L.current=!1;return}if(J){(async()=>{let pe=_y(ne??null),we=uy(),ke=null;if(ne)try{ke=await ly(ne,p,we)}catch(rt){console.error("[Echly] Screenshot upload failed:",rt),J.onError(),L.current=!1;return}let Qt=await pe;console.log("[OCR] Extracted visibleText:",Qt);let Ye=typeof window<"u"?window.location.href:"",He={...ae??{},visibleText:Qt,url:ae?.url??Ye},nt={transcript:q,context:He};try{let ve=await(await tn("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(nt)})).json(),Ue=Array.isArray(ve.tickets)?ve.tickets:[],Fe=typeof ve.clarityScore=="number"?ve.clarityScore:ve.clarityScore!=null?Number(ve.clarityScore):100,ft=ve.clarityIssues??[],Da=ve.suggestedRewrite??null,Te=ve.confidence??.5;if(ve.success&&Fe<=20){console.log("CLARITY GUARD TRIGGERED",Fe),D({tickets:Ue,screenshotUrl:ke,transcript:q,screenshot:ne,firstFeedbackId:we,clarityScore:Fe,clarityIssues:ft,suggestedRewrite:Da,confidence:Te,callbacks:J,context:He}),G(q),x(!1),y.current=!1,T(!1),v(!0),L.current=!1;return}if(!ve.success||Ue.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:q,screenshotUrl:ke,sessionId:p,context:He}},Ct=>{if(L.current=!1,chrome.runtime.lastError){J.onError();return}Ct?.success&&Ct.ticket?J.onSuccess({id:Ct.ticket.id,title:Ct.ticket.title,description:Ct.ticket.description,type:Ct.ticket.type??"Feedback"}):J.onError()});return}let Ee=Fe>=85?"clear":Fe>=60?"needs_improvement":"unclear",$e={clarityScore:Fe,clarityIssues:ft,clarityConfidence:Te,clarityStatus:Ee},Pa;for(let Ct=0;Ct<Ue.length;Ct++){let Be=Ue[Ct],Xt=typeof Be.description=="string"?Be.description:Be.title??"",ga={sessionId:p,title:Be.title??"",description:Xt,type:Array.isArray(Be.suggestedTags)&&Be.suggestedTags[0]?Be.suggestedTags[0]:"Feedback",contextSummary:Xt,actionSteps:Array.isArray(Be.actionSteps)?Be.actionSteps:[],suggestedTags:Be.suggestedTags,screenshotUrl:Ct===0?ke:null,metadata:{clientTimestamp:Date.now()},...$e},ya=await(await tn("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ga)})).json();if(ya.success&&ya.ticket){let on=ya.ticket;Pa||(Pa={id:on.id,title:on.title,description:on.description,type:on.type??"Feedback"})}}L.current=!1,Pa?J.onSuccess(Pa):J.onError()}catch(rt){console.error("[Echly] Structure or submit failed:",rt),L.current=!1,J.onError()}})();return}try{let pe=await _y(ne??null);console.log("[OCR] Extracted visibleText:",pe);let we=typeof window<"u"?window.location.href:"",ke={transcript:q,context:{...ae??{},visibleText:pe,url:ae?.url??we}},Ye=await(await tn("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ke)})).json(),He=Array.isArray(Ye.tickets)?Ye.tickets:[],nt=Ye.clarityScore??100,rt=Ye.clarityIssues??[],ve=Ye.suggestedRewrite??null,Ue=Ye.confidence??.5;if(!Ye.success||He.length===0)return;let Fe=null;if(He.length>0&&ne){let Ee=uy();Fe=await ly(ne,p,Ee)}let ft=nt>=85?"clear":nt>=60?"needs_improvement":"unclear",Da={clarityScore:nt,clarityIssues:rt,clarityConfidence:Ue,clarityStatus:ft},Te;for(let Ee=0;Ee<He.length;Ee++){let $e=He[Ee],Pa=typeof $e.description=="string"?$e.description:$e.title??"",Ct={sessionId:p,title:$e.title??"",description:Pa,type:Array.isArray($e.suggestedTags)&&$e.suggestedTags[0]?$e.suggestedTags[0]:"Feedback",contextSummary:Pa,actionSteps:Array.isArray($e.actionSteps)?$e.actionSteps:[],suggestedTags:$e.suggestedTags,screenshotUrl:Ee===0?Fe:null,metadata:{clientTimestamp:Date.now()},...Da},Xt=await(await tn("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Ct)})).json();if(Xt.success&&Xt.ticket){let ga=Xt.ticket;Te||(Te={id:ga.id,title:ga.title,description:ga.description,type:ga.type??"Feedback"})}}return Te}finally{L.current=!1}}},[p,a]),M=xe.default.useCallback(async q=>{},[]),O=xe.default.useCallback(async q=>{if(!p)return;if(q.tickets.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:q.transcript,screenshotUrl:q.screenshotUrl,sessionId:p,context:q.context??{}}},ae=>{if(chrome.runtime.lastError){console.error("[Echly] Submit anyway failed:",chrome.runtime.lastError.message),q.callbacks.onError();return}ae?.success&&ae.ticket?q.callbacks.onSuccess({id:ae.ticket.id,title:ae.ticket.title,description:ae.ticket.description,type:ae.ticket.type??"Feedback"}):q.callbacks.onError()});return}let ne={clarityScore:q.clarityScore,clarityIssues:q.clarityIssues,clarityConfidence:q.confidence,clarityStatus:q.clarityScore>=85?"clear":q.clarityScore>=60?"needs_improvement":"unclear"},J;for(let ae=0;ae<q.tickets.length;ae++){let pe=q.tickets[ae],we=typeof pe.description=="string"?pe.description:pe.title??"",ke={sessionId:p,title:pe.title??"",description:we,type:Array.isArray(pe.suggestedTags)&&pe.suggestedTags[0]?pe.suggestedTags[0]:"Feedback",contextSummary:we,actionSteps:Array.isArray(pe.actionSteps)?pe.actionSteps:[],suggestedTags:pe.suggestedTags,screenshotUrl:ae===0?q.screenshotUrl:null,metadata:{clientTimestamp:Date.now()},...ne},Ye=await(await tn("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ke)})).json();if(Ye.success&&Ye.ticket){let He=Ye.ticket;J||(J={id:He.id,title:He.title,description:He.description,type:He.type??"Feedback"})}}J?q.callbacks.onSuccess(J):q.callbacks.onError()},[p]),U=xe.default.useCallback(async(q,ne)=>{if(!p)return;let J=ne.trim();try{let ae={transcript:J,context:q.context??{}},we=await(await tn("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ae)})).json(),ke=Array.isArray(we.tickets)?we.tickets:[],Qt=we.clarityScore??100,Ye=we.confidence??.5,He=Qt>=85?"clear":Qt>=60?"needs_improvement":"unclear",nt={clarityScore:Qt,clarityIssues:we.clarityIssues??[],clarityConfidence:Ye,clarityStatus:He};if(ke.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:J,screenshotUrl:q.screenshotUrl,sessionId:p,context:q.context??{}}},ve=>{if(chrome.runtime.lastError){console.error("[Echly] Submit edited feedback failed:",chrome.runtime.lastError.message),q.callbacks.onError();return}ve?.success&&ve.ticket?q.callbacks.onSuccess({id:ve.ticket.id,title:ve.ticket.title,description:ve.ticket.description,type:ve.ticket.type??"Feedback"}):q.callbacks.onError()});return}let rt;for(let ve=0;ve<ke.length;ve++){let Ue=ke[ve],Fe=typeof Ue.description=="string"?Ue.description:Ue.title??"",ft={sessionId:p,title:Ue.title??"",description:Fe,type:Array.isArray(Ue.suggestedTags)&&Ue.suggestedTags[0]?Ue.suggestedTags[0]:"Feedback",contextSummary:Fe,actionSteps:Array.isArray(Ue.actionSteps)?Ue.actionSteps:[],suggestedTags:Ue.suggestedTags,screenshotUrl:ve===0?q.screenshotUrl:null,metadata:{clientTimestamp:Date.now()},...nt},Te=await(await tn("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ft)})).json();if(Te.success&&Te.ticket){let Ee=Te.ticket;rt||(rt={id:Ee.id,title:Ee.title,description:Ee.description,type:Ee.type??"Feedback"})}}rt?q.callbacks.onSuccess(rt):q.callbacks.onError()}catch(ae){console.error("[Echly] Submit edited feedback failed:",ae),q.callbacks.onError()}},[p]),$=xe.default.useCallback(async()=>{let q=k;if(!(!q?.suggestedRewrite?.trim()||!p)){D(null);try{let J=await(await tn("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:q.suggestedRewrite.trim()})})).json(),ae=Array.isArray(J.tickets)?J.tickets:[],pe=J.clarityScore??100,we=J.confidence??.5,ke=pe>=85?"clear":pe>=60?"needs_improvement":"unclear",Qt={clarityScore:pe,clarityIssues:J.clarityIssues??[],clarityConfidence:we,clarityStatus:ke},Ye;for(let He=0;He<ae.length;He++){let nt=ae[He],rt=typeof nt.description=="string"?nt.description:nt.title??"",ve={sessionId:p,title:nt.title??"",description:rt,type:Array.isArray(nt.suggestedTags)&&nt.suggestedTags[0]?nt.suggestedTags[0]:"Feedback",contextSummary:rt,actionSteps:Array.isArray(nt.actionSteps)?nt.actionSteps:[],suggestedTags:nt.suggestedTags,screenshotUrl:He===0?q.screenshotUrl:null,metadata:{clientTimestamp:Date.now()},...Qt},Fe=await(await tn("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ve)})).json();if(Fe.success&&Fe.ticket){let ft=Fe.ticket;Ye||(Ye={id:ft.id,title:ft.title,description:ft.description,type:ft.type??"Feedback"})}}Ye?q.callbacks.onSuccess(Ye):q.callbacks.onError()}catch(ne){console.error("[Echly] Use suggestion failed:",ne),q.callbacks.onError()}}},[k,p]);xe.default.useEffect(()=>{b&&S.current&&S.current.focus()},[b]);let W=xe.default.useCallback(async q=>{try{let J=await(await tn("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:q.trim()})})).json();if(!J.success||!Array.isArray(J.tickets)||J.tickets.length===0)return null;let ae=J.tickets[0],pe=typeof ae.title=="string"?ae.title:"",we=Array.isArray(ae.suggestedTags)?ae.suggestedTags:[];return{title:pe,tags:we,priority:"medium"}}catch{return null}},[]);if(!i)return null;if(!a)return(0,ot.jsx)("div",{style:{pointerEvents:"auto"},children:(0,ot.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:kU,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,ot.jsx)("img",{src:C,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})});let ee=k;return(0,ot.jsxs)(ot.Fragment,{children:[w&&ee&&(0,ot.jsx)("div",{style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.15)",zIndex:999999,fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif'},children:(0,ot.jsxs)("div",{style:{maxWidth:420,width:"90%",background:"#F8FBFF",borderRadius:12,padding:20,boxShadow:"0 12px 32px rgba(0,0,0,0.12)",border:"1px solid #E6F0FF",animation:"echly-clarity-card-in 150ms ease-out"},children:[(0,ot.jsx)("div",{style:{fontWeight:600,fontSize:15,marginBottom:6,color:"#111"},children:"Quick suggestion"}),(0,ot.jsx)("div",{style:{fontSize:14,color:"#374151",marginBottom:8},children:"Your feedback may be unclear."}),(0,ot.jsx)("div",{style:{fontSize:13,color:"#6b7280",marginBottom:10},children:"Try specifying what looks wrong and what change you want."}),ee.suggestedRewrite&&(0,ot.jsxs)("div",{style:{fontSize:13,fontStyle:"italic",color:"#4b5563",marginBottom:12,opacity:.9},children:['Example: "',ee.suggestedRewrite,'"']}),(0,ot.jsx)("textarea",{ref:S,value:B,onChange:q=>G(q.target.value),disabled:!b,rows:3,placeholder:"Your feedback","aria-label":"Feedback message",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid #E6F0FF",fontSize:14,resize:"vertical",minHeight:72,marginBottom:16,background:b?"#fff":"#f3f4f6",color:"#111"}}),(0,ot.jsx)("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:b?(0,ot.jsx)("button",{type:"button",disabled:_,onClick:()=>{if(y.current||!ee)return;y.current=!0,T(!0),v(!1),D(null),x(!1),U(ee,B).catch(J=>console.error("[Echly] Done submission failed:",J)).finally(()=>{y.current=!1,T(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:_?"default":"pointer",opacity:_?.8:1},children:"Done"}):(0,ot.jsxs)(ot.Fragment,{children:[(0,ot.jsx)("button",{type:"button",disabled:_,onClick:()=>x(!0),style:{background:"transparent",border:"1px solid #E6F0FF",borderRadius:8,padding:"8px 14px",fontSize:14,color:"#374151",cursor:_?"default":"pointer",opacity:_?.7:1},children:"Edit feedback"}),(0,ot.jsx)("button",{type:"button",disabled:_,onClick:()=>{if(y.current||!ee)return;y.current=!0,T(!0),v(!1),D(null),x(!1),O(ee).catch(ne=>console.error("[Echly] Submit anyway failed:",ne)).finally(()=>{y.current=!1,T(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:_?"default":"pointer",opacity:_?.8:1},children:"Submit anyway"})]})})]})}),(0,ot.jsx)(lp,{sessionId:p??"",userId:a.uid,extensionMode:!0,onComplete:Xa,onDelete:M,widgetToggleRef:I,onRecordingChange:A,expanded:h.expanded,onExpandRequest:E,onCollapseRequest:Re,liveStructureFetch:W,captureDisabled:!p,theme:l,onThemeToggle:Me})]})}var PU=`
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif;
  }
  #echly-root * { box-sizing: border-box; }
`;function OU(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let a=document.createElement("style");a.id="echly-reset",a.textContent=PU,t.appendChild(a)}function MU(t){let e=t.attachShadow({mode:"open"});OU(e);let a=document.createElement("div");a.id=AU,a.style.all="initial",a.style.boxSizing="border-box",a.style.pointerEvents="auto",a.style.width="auto",a.style.height="auto";let n=xU();a.setAttribute("data-theme",n),e.appendChild(a),(0,ER.createRoot)(a).render((0,ot.jsx)(DU,{widgetRoot:a,initialTheme:n}))}function NU(t){chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},e=>{e&&(t.style.display=e.visible?"block":"none",window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:{visible:e.visible??!1,expanded:e.expanded??!1,isRecording:e.isRecording??!1,sessionId:e.sessionId??null}}})))})}function VU(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(a=>{if(a.type==="ECHLY_FEEDBACK_CREATED"&&a.ticket&&a.sessionId){window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:a.ticket,sessionId:a.sessionId}}));return}let n=document.getElementById(US);n&&(a.type==="ECHLY_GLOBAL_STATE"&&a.state&&(n.style.display=a.state.visible?"block":"none",window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:a.state}}))),a.type==="ECHLY_TOGGLE"&&window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET")))}))}function UU(){let t=document.getElementById(US);t||(t=document.createElement("div"),t.id=US,t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),MU(t)),VU(t),NU(t)}UU();})();
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
